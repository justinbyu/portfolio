const ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const MAX_URL_LENGTH = 2048;
const MAX_BODY_BYTES = 10_000;

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...securityHeaders,
      ...extraHeaders,
    },
  });
}

function htmlMessage(title, message, status) {
  const document = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#090d18"><title>${title} · TapAsul</title><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 50% 35%,#14243b,#090d18 70%);color:#f7f9fc;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}.box{max-width:470px;padding:38px;border:1px solid #2b3a52;border-radius:20px;background:#111827;text-align:center;box-shadow:0 24px 70px #0005}.brand{font-size:22px;font-weight:750;letter-spacing:-.5px}.brand em{font-style:normal;color:#61bdff}h1{font-size:26px;margin:30px 0 10px;letter-spacing:-.6px}p{color:#9ba9be;line-height:1.65;margin:0 0 25px}.rule{height:3px;width:42px;background:linear-gradient(90deg,#61bdff,#8be6e9);border-radius:4px;margin:18px auto 0}a{display:inline-block;padding:12px 18px;border-radius:10px;color:#081421;background:linear-gradient(100deg,#61bdff,#8be6e9);font-size:14px;font-weight:700;text-decoration:none}</style></head><body><main class="box"><div class="brand">Tap<em>Asul</em></div><div class="rule"></div><h1>${title}</h1><p>${message}</p><a href="/">Return to Client ID entry</a></main></body></html>`;
  return new Response(document, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
      ...securityHeaders,
    },
  });
}

function validId(value) {
  return typeof value === 'string' && ID_PATTERN.test(value);
}

function isPrivateIPv4(hostname) {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return true;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
}

function isPrivateIPv6(hostname) {
  const host = hostname.toLowerCase();
  if (!host.includes(':')) return false;
  // IPv6 loopback/unspecified, unique-local (fc00::/7), and link-local (fe80::/10).
  if (host === '::1' || host === '::' || host.startsWith('fc') || host.startsWith('fd') || /^fe[89ab]/.test(host)) return true;
  // Conservatively reject IPv4-mapped IPv6 literals, including alternate textual forms.
  return host.startsWith('::ffff:') || host.startsWith('0:0:0:0:0:ffff:');
}

function validateDestination(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_URL_LENGTH) {
    return { error: `Destination URL is required and must be ${MAX_URL_LENGTH} characters or fewer.` };
  }
  let url;
  try { url = new URL(value); }
  catch { return { error: 'Destination URL must be a valid absolute URL.' }; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { error: 'Destination URL must use HTTP or HTTPS.' };
  }
  if (url.username || url.password) {
    return { error: 'Destination URLs must not contain an embedded username or password.' };
  }
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal') ||
      hostname === '0.0.0.0' || isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
    return { error: 'Local or private network destinations are not allowed.' };
  }
  return { value: url.toString() };
}

async function tokenMatches(provided, expected) {
  if (typeof provided !== 'string' || !provided || typeof expected !== 'string' || !expected) return false;
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(provided)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0 && provided.length === expected.length;
}

async function requireAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return json({ error: 'Administrator authentication is not configured.' }, 503);
  const header = request.headers.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || !(await tokenMatches(match[1], env.ADMIN_TOKEN))) {
    return json({ error: 'Unauthorized. Provide a valid administrator bearer token.' }, 401, { 'WWW-Authenticate': 'Bearer realm="TapAsul Admin"' });
  }
  return null;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readRequestJson(request) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return { error: 'Request body is too large.' };
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return { error: 'Request body is too large.' };
  try { return { value: JSON.parse(text) }; }
  catch { return { error: 'Request body must be valid JSON.' }; }
}

async function adminRoutes(request, env) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;
  if (!env.DB) return json({ error: 'Database binding is not configured.' }, 503);

  if (request.method === 'GET') {
    try {
      const result = await env.DB.prepare('SELECT id, client_name, destination_url, status, created_at, updated_at FROM routes ORDER BY created_at DESC, id COLLATE BINARY ASC').all();
      return json({ routes: result.results || [] });
    } catch (error) {
      console.error('TapAsul admin route-list database error', error);
      return json({ error: 'Unable to load routes from the database.' }, 500);
    }
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, POST' });
  const parsed = await readRequestJson(request);
  if (parsed.error) return json({ error: parsed.error }, 400);
  const body = parsed.value;
  if (!isPlainObject(body)) return json({ error: 'Request body must be a JSON object.' }, 400);

  const id = body.id;
  if (!validId(id)) return json({ error: 'Client ID must be 1–32 letters, numbers, hyphens, or underscores.' }, 400);
  if (typeof body.client_name !== 'string' || body.client_name.length > 120) {
    return json({ error: 'Client name must be text of 120 characters or fewer.' }, 400);
  }
  const destination = validateDestination(body.destination_url);
  if (destination.error) return json({ error: destination.error }, 400);
  if (body.status !== 'active' && body.status !== 'disabled') {
    return json({ error: 'Status must be either active or disabled.' }, 400);
  }

  const now = new Date().toISOString();
  try {
    await env.DB.prepare(`INSERT INTO routes (id, client_name, destination_url, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        client_name = excluded.client_name,
        destination_url = excluded.destination_url,
        status = excluded.status,
        updated_at = excluded.updated_at`)
      .bind(id, body.client_name.trim(), destination.value, body.status, now, now).run();
    const route = await env.DB.prepare('SELECT id, client_name, destination_url, status, created_at, updated_at FROM routes WHERE id = ?').bind(id).first();
    return json({ ok: true, route }, 200);
  } catch (error) {
    console.error('TapAsul admin route-save database error', error);
    return json({ error: 'Unable to save route to the database.' }, 500);
  }
}

async function deleteRoute(request, env, encodedId) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;
  if (!env.DB) return json({ error: 'Database binding is not configured.' }, 503);
  let id;
  try { id = decodeURIComponent(encodedId); }
  catch { return json({ error: 'Client ID format is not valid.' }, 400); }
  if (!validId(id)) return json({ error: 'Client ID format is not valid.' }, 400);
  try {
    const result = await env.DB.prepare('DELETE FROM routes WHERE id = ?').bind(id).run();
    if (!result.meta?.changes) return json({ error: 'No route exists for that Client ID.' }, 404);
    return json({ ok: true, id });
  } catch (error) {
    console.error('TapAsul admin route-delete database error', error);
    return json({ error: 'Unable to delete route from the database.' }, 500);
  }
}

async function resolveRoute(id, env) {
  if (!validId(id)) return htmlMessage('Invalid Client ID', 'That ID format is not valid. Use up to 32 letters, numbers, hyphens, or underscores.', 400);
  if (!env.DB) return htmlMessage('Temporarily unavailable', 'TapAsul could not connect to its route service. Please try again shortly.', 503);
  let route;
  try {
    route = await env.DB.prepare('SELECT destination_url, status FROM routes WHERE id = ?').bind(id).first();
  } catch (error) {
    console.error('TapAsul redirect database error', error);
    return htmlMessage('Temporarily unavailable', 'TapAsul could not look up this Client ID right now. Please try again shortly.', 503);
  }
  if (!route) return htmlMessage('Client ID not found', 'We could not find a digital card for that Client ID. Check the ID and try again.', 404);
  if (route.status !== 'active') return htmlMessage('Card temporarily unavailable', 'This TapAsul card is currently inactive. Please contact the person who provided your card.', 410);
  // Re-validate persisted data as defense in depth before setting Location.
  const destination = validateDestination(route.destination_url);
  if (destination.error) {
    console.error('TapAsul blocked an invalid destination stored in D1 for a route');
    return htmlMessage('Temporarily unavailable', 'This TapAsul card destination needs attention. Please contact the card owner.', 503);
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.value,
      'Cache-Control': 'no-store',
      ...securityHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/api/health') {
      if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET' });
      return json({ ok: true, service: 'TapAsul', timestamp: new Date().toISOString() });
    }
    if (path === '/api/admin/routes') return adminRoutes(request, env);
    const deleteMatch = path.match(/^\/api\/admin\/routes\/([^/]+)$/);
    if (deleteMatch) {
      if (request.method !== 'DELETE') return json({ error: 'Method not allowed.' }, 405, { Allow: 'DELETE' });
      return deleteRoute(request, env, deleteMatch[1]);
    }
    if (path.startsWith('/r/')) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return htmlMessage('Request not supported', 'Use the Client ID form to open a TapAsul card.', 405);
      const encodedId = path.slice(3);
      let id;
      try { id = decodeURIComponent(encodedId); }
      catch { return htmlMessage('Invalid Client ID', 'That ID format is not valid.', 400); }
      const response = await resolveRoute(id, env);
      if (request.method === 'HEAD') return new Response(null, { status: response.status, headers: response.headers });
      return response;
    }
    return json({ error: 'Not found.' }, 404);
  },
};
