/** Tiny fetch wrapper with session handling. */
const KEY = 'allanese.session';

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.expiresAt && Date.now() > s.expiresAt) { clearSession(); return null; }
    return s;
  } catch { return null; }
}
export function setSession(session) {
  localStorage.setItem(KEY, JSON.stringify({
    token: session.token,
    email: session.session ? session.session.email : (session.email || ''),
    role: session.session ? session.session.role : (session.role || 'admin'),
    expiresAt: session.session ? session.session.exp : 0,
  }));
}
export function clearSession() { localStorage.removeItem(KEY); }

export async function api(path, { method = 'GET', body } = {}) {
  const s = getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (s && s.token) headers.Authorization = `Bearer ${s.token}`;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server — is it still running?');
  }

  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }

  if (res.status === 401) {
    clearSession();
    window.dispatchEvent(new CustomEvent('session-expired'));
    throw new Error((data && data.error) || 'Session expired.');
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
