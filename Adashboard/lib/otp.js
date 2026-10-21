'use strict';
/**
 * Passwordless OTP authentication (server-side, demo mail channel).
 * Enforces expiry, attempt limits, send cooldowns and hourly rate caps.
 */
const crypto = require('crypto');
const db = require('./db');
const brevo = require('./brevo');

const OTP_TTL_MS = 5 * 60 * 1000;
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const COOLDOWN_MS = 10 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

function maskEmail(email) {
  const [u, d] = email.split('@');
  const head = u.slice(0, Math.min(2, u.length));
  return `${head}${'*'.repeat(Math.max(1, u.length - head.length))}@${d}`;
}

function requestOtp(email) {
  const dbx = db.load();
  const now = Date.now();
  const rec = dbx.otps[email] || { sends: [], attempts: 0 };

  const last = rec.sends.length ? rec.sends[rec.sends.length - 1] : 0;
  if (now - last < COOLDOWN_MS) {
    return { error: `Please wait ${Math.ceil((COOLDOWN_MS - (now - last)) / 1000)}s before requesting another code.`, status: 429 };
  }
  rec.sends = rec.sends.filter(t => now - t < 3600_000);
  if (rec.sends.length >= MAX_SENDS_PER_HOUR) {
    return { error: 'Rate limit reached — max 5 codes per hour for this email.', status: 429 };
  }

  const code = String(crypto.randomInt(100000, 1000000));
  rec.code = code;
  rec.exp = now + OTP_TTL_MS;
  rec.attempts = 0;
  rec.sends.push(now);
  dbx.otps[email] = rec;
  db.save();

  const r = brevo.send({
    to: email, toName: '', template: 'otp', priority: true,
    vars: { code },
  });

  return {
    ok: true,
    masked: maskEmail(email),
    cooldownSeconds: Math.ceil(COOLDOWN_MS / 1000),
    expiresInMinutes: OTP_TTL_MS / 60000,
    mailStatus: r.status,
  };
}

function verifyOtp(email, code) {
  const dbx = db.load();
  const rec = dbx.otps[email];
  const now = Date.now();

  if (!rec || !rec.code) return { error: 'Request a new code first.', status: 400 };
  if (now > rec.exp) { delete dbx.otps[email]; db.save(); return { error: 'That code has expired — request a new one.', status: 400 }; }
  if (rec.attempts >= MAX_ATTEMPTS) { delete dbx.otps[email]; db.save(); return { error: 'Too many attempts — request a new code.', status: 429 }; }

  if (String(code).trim() !== rec.code) {
    rec.attempts += 1;
    db.save();
    const left = MAX_ATTEMPTS - rec.attempts;
    return { error: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.`, status: 400 };
  }

  delete dbx.otps[email];
  const token = crypto.randomBytes(24).toString('hex');
  dbx.tokens[token] = {
    email,
    role: email === 'admin@allanese.clinic' || email.endsWith('@allanese.clinic') ? 'owner' : 'admin',
    exp: now + TOKEN_TTL_MS,
    createdAt: db.fmtISO(now),
  };
  db.save();
  db.writeAudit('auth', 'login.success', `OTP login for ${email} (${maskEmail(email)})`, 'session', null);

  return { token, session: dbx.tokens[token] };
}

function requireAuth(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { error: 'Authentication required.', status: 401 };
  const dbx = db.load();
  const sess = dbx.tokens[token];
  if (!sess) return { error: 'Session not found — please sign in again.', status: 401 };
  if (Date.now() > sess.exp) {
    delete dbx.tokens[token];
    db.save();
    return { error: 'Session expired — please sign in again.', status: 401 };
  }
  return { token, session: sess };
}

function logout(token) {
  const dbx = db.load();
  const sess = dbx.tokens[token];
  if (sess) db.writeAudit('auth', 'logout', `Session ended for ${sess.email}`, 'session', null);
  delete dbx.tokens[token];
  db.save();
  return { ok: true };
}

function inbox(limit = 12) {
  const dbx = db.load();
  return dbx.emails.slice().reverse().slice(0, limit).map(e => ({
    ts: e.ts, to: e.to, subject: e.subject, template: e.template, status: e.status,
    // Demo convenience: OTP codes surface in the mock inbox so login works without SMTP.
    code: e.template === 'otp' ? (dbx.otps[e.to] && dbx.otps[e.to].code) || null : null,
  }));
}

module.exports = { requestOtp, verifyOtp, requireAuth, logout, inbox, maskEmail };
