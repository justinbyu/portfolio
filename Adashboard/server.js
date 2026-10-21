'use strict';
/**
 * Allanese Medical Aesthetics — Clinic Operations API + static server.
 * Zero-dependency Node.js. Run:  node server.js
 *
 * Everything is validated server-side (auth, business hours, lead time,
 * double-booking, audit trail) exactly as specified in the dashboard plan.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const db = require('./lib/db');
const brevo = require('./lib/brevo');
const otp = require('./lib/otp');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/* ------------------------------------------------------------------ utils */
function sendJson(res, code, obj, extraHeaders = {}) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    ...extraHeaders,
  });
  res.end(body);
}

function readBody(req, limit = 100_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('Payload too large'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(Object.assign(new Error('Invalid JSON body'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function bad(msg, status = 400) { const e = new Error(msg); e.status = status; return e; }
function emailOk(v) { return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

function joinAppt(dbx, a) {
  const c = dbx.clients.find(x => x.id === a.clientId);
  const s = dbx.services.find(x => x.id === a.serviceId);
  return {
    ...a,
    end: db.addMin(a.start, a.duration),
    clientName: c ? c.name : 'Unknown client',
    clientCode: c ? c.code : '',
    clientEmail: c ? c.email : '',
    clientPhone: c ? c.phone : '',
    serviceName: s ? s.name : 'Unknown service',
    servicePrice: s ? s.price : 0,
    category: s ? s.category : '',
  };
}

function apptFilters(dbx, q) {
  const today = db.wallToday();
  let list = dbx.appointments.slice();
  if (q.status) {
    const set = new Set(String(q.status).split(','));
    list = list.filter(a => set.has(a.status));
  }
  const from = q.from || db.addDays(today, -45);
  const to = q.to || db.addDays(today, 90);
  list = list.filter(a => a.date >= from && a.date <= to);
  if (q.date) list = list.filter(a => a.date === q.date);
  if (q.practitioner) list = list.filter(a => a.practitioner === q.practitioner);
  if (q.q) {
    const needle = String(q.q).toLowerCase();
    list = list.filter(a => {
      const j = joinAppt(dbx, a);
      return [j.clientName, j.clientCode, j.clientEmail, j.clientPhone, j.serviceName, j.code, j.practitioner]
        .some(v => String(v || '').toLowerCase().includes(needle));
    });
  }
  list.sort((x, y) => (x.date + x.start).localeCompare(y.date + y.start));
  if (q.order === 'desc') list.reverse();
  return list;
}

/** Slot validation: hours, weekday closure, lead time, double-booking. */
function validateSlot(dbx, { date, start, duration, practitioner, leadTimeHours = 0, excludeId = null }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(start)) throw bad('Provide date (YYYY-MM-DD) and start (HH:mm).');
  const wd = db.weekdayOf(date);
  if (Number.isNaN(wd)) throw bad('Invalid date.');
  const hours = dbx.settings.businessHours[wd];
  if (!hours || hours.closed) throw bad(`The clinic is closed on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][wd]}s.`);
  const s = db.toMin(start);
  if (s % 15 !== 0) throw bad('Start times must be on 15-minute increments.');
  if (s < db.toMin(hours.open) || s + duration > db.toMin(hours.close)) {
    throw bad(`Outside business hours (${hours.open}–${hours.close}).`);
  }
  if (leadTimeHours > 0) {
    const until = db.absMin(date, start) - db.nowAbsMin();
    if (until < leadTimeHours * 60) {
      throw bad(`Bookings require at least ${leadTimeHours} hour${leadTimeHours === 1 ? '' : 's'} notice.`);
    }
  }
  // Double-booking: same practitioner, overlapping window, active status
  const block = dbx.appointments.filter(a =>
    a.id !== excludeId && a.practitioner === practitioner && a.date === date &&
    ['pending', 'confirmed'].includes(a.status));
  for (const a of block) {
    const aS = db.toMin(a.start), aE = aS + a.duration;
    if (s < aE && aS < s + duration) {
      throw Object.assign(new Error(`That slot overlaps ${a.code} (${a.start}–${db.addMin(a.start, a.duration)}) with ${practitioner}.`), { status: 409 });
    }
  }
  return true;
}

function clientOf(dbx, id) {
  const c = dbx.clients.find(x => x.id === Number(id));
  if (!c) throw bad('Client not found.', 404);
  return c;
}
function serviceOf(dbx, id) {
  const s = dbx.services.find(x => x.id === Number(id));
  if (!s) throw bad('Service not found.', 404);
  return s;
}

const dateWords = d => d;

function notifyBooking(dbx, appt, kind, extra = {}) {
  const j = joinAppt(dbx, appt);
  const vars = {
    name: j.clientName, service: j.serviceName, practitioner: j.practitioner,
    date: j.date, time: j.start, code: j.code,
    note: appt.note || extra.note || '',
    pct: brevo.snapshot(dbx).pct, sent: brevo.snapshot(dbx).sent, limit: brevo.snapshot(dbx).limit,
  };
  const clientMail = {
    booking_received: 'booking_received',
    confirmed: 'booking_confirmed',
    declined: 'booking_declined',
    cancelled: 'booking_cancelled',
    rescheduled: 'booking_rescheduled',
    completed: 'booking_completed',
  }[kind];
  const out = [];
  if (clientMail) out.push(brevo.send({ to: j.clientEmail, toName: j.clientName, template: clientMail, relatedId: j.code, vars, priority: false }));
  if (kind === 'received') {
    out.push(brevo.send({
      to: 'admin@allanese.clinic', toName: 'Allanese Ops', template: 'booking_received', relatedId: j.code,
      vars: { ...vars, name: 'Team' },
    }));
  }
  return out;
}

/* ------------------------------------------------------------------ routes */
const routes = [];
function route(method, pattern, handler, opts = {}) {
  routes.push({ method, re: pattern, handler, ...opts });
}

/* --- auth --- */
route('POST', /^\/api\/auth\/request-otp$/, async (req, res, m, q, body) => {
  if (!emailOk(body.email)) throw bad('Enter a valid email address.');
  const out = otp.requestOtp(body.email.trim().toLowerCase());
  if (out.error) return sendJson(res, out.status || 400, { error: out.error });
  sendJson(res, 200, out);
});

route('POST', /^\/api\/auth\/verify-otp$/, async (req, res, m, q, body) => {
  if (!emailOk(body.email) || !body.code) throw bad('Email and code are required.');
  const out = otp.verifyOtp(body.email.trim().toLowerCase(), String(body.code));
  if (out.error) return sendJson(res, out.status || 400, { error: out.error });
  sendJson(res, 200, out);
});

route('GET', /^\/api\/auth\/inbox$/, async (req, res) => {
  sendJson(res, 200, { demo: true, note: 'Mock mail channel — no real emails are sent in this prototype.', messages: otp.inbox(12) });
});

route('POST', /^\/api\/auth\/logout$/, async (req, res, m, q, body, session) => {
  otp.logout(session.token);
  sendJson(res, 200, { ok: true });
}, { auth: true });

route('GET', /^\/api\/me$/, async (req, res, m, q, body, session) => {
  sendJson(res, 200, { email: session.session.email, role: session.session.role, expiresAt: session.session.exp });
}, { auth: true });

/* --- overview / stats --- */
route('GET', /^\/api\/stats$/, async (req, res, m, q) => {
  const dbx = db.load();
  const day = q.date || db.wallToday();
  const today = db.wallToday();
  const todays = dbx.appointments.filter(a => a.date === day);
  const count = st => todays.filter(a => a.status === st).length;
  const revenue = todays.filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (dbx.services.find(s => s.id === a.serviceId)?.price || 0), 0);
  const pending = dbx.appointments.filter(a => a.status === 'pending' && a.date >= today).length;
  const quota = brevo.snapshot(dbx);
  const heldToday = dbx.emails.filter(e => e.status === 'held' && e.ts.slice(0, 10) === new Date(e.ts).toISOString().slice(0, 10)).length;
  const held = dbx.emails.filter(e => e.status === 'held').length;

  const alerts = [];
  const lvl = t => (t >= 95 ? 'critical' : t >= 85 ? 'warn' : 'info');
  for (const t of quota.activeAlerts) {
    alerts.push({ level: lvl(t), title: `Brevo quota ${t}% reached`, detail: `${quota.sent} of ${quota.limit} emails used today.` });
  }
  if (quota.otpReserveActive) alerts.push({ level: 'warn', title: 'OTP priority reserve engaged', detail: 'Non-OTP emails are being held so login codes can still be delivered.' });
  if (quota.failed > 0) alerts.push({ level: 'warn', title: `${quota.failed} failed email${quota.failed === 1 ? '' : 's'}`, detail: 'Requires review in Services & Email.' });
  if (held > 0) alerts.push({ level: 'info', title: `${held} email${held === 1 ? '' : 's'} held at capacity`, detail: 'They will send after the daily quota resets.' });
  if (pending > 0) alerts.push({ level: 'info', title: `${pending} booking${pending === 1 ? '' : 's'} awaiting approval`, detail: 'Review pending requests below.' });

  sendJson(res, 200, {
    kpis: {
      date: day,
      appointmentsToday: todays.length,
      confirmed: count('confirmed'),
      pendingToday: count('pending'),
      completed: count('completed'),
      pendingTotal: pending,
      revenue,
      emailsSent: quota.sent,
      emailsFailed: quota.failed,
      capacityRemaining: quota.remaining,
      quotaPct: quota.pct,
      quotaLimit: quota.limit,
    },
    alerts,
    quota,
  });
});

/* --- appointments --- */
route('GET', /^\/api\/appointments$/, async (req, res, m, q) => {
  const dbx = db.load();
  const list = apptFilters(dbx, q).map(a => joinAppt(dbx, a));
  sendJson(res, 200, { count: list.length, appointments: list });
}, { auth: true });

route('POST', /^\/api\/appointments$/, async (req, res, m, q, body, session) => {
  const dbx = db.load();
  const client = clientOf(dbx, body.clientId);
  const service = serviceOf(dbx, body.serviceId);
  const practitioner = String(body.practitioner || '').trim();
  if (!dbx.settings.practitioners.includes(practitioner)) throw bad('Choose an available practitioner.');
  const source = body.source === 'website' ? 'website' : 'dashboard';

  validateSlot(dbx, {
    date: body.date, start: body.start, duration: service.duration,
    practitioner, leadTimeHours: dbx.settings.leadTimeHours,
  });

  const autoConfirm = dbx.settings.approvalMode === 'auto' && dbx.settings.autoConfirmServices.includes(service.id);
  const id = db.nextId('appointments');
  const now = db.fmtISO(Date.now());
  const appt = {
    id, code: `APT-${1000 + id}`,
    clientId: client.id, serviceId: service.id,
    practitioner, date: body.date, start: body.start,
    duration: service.duration,
    status: autoConfirm ? 'confirmed' : 'pending',
    source, note: String(body.note || '').slice(0, 400),
    createdAt: now, updatedAt: now,
    history: [{ ts: now, action: autoConfirm ? 'auto-confirmed' : 'created', actor: source === 'website' ? 'client' : session.session.email }],
  };
  dbx.appointments.push(appt);
  db.save();
  db.writeAudit(source === 'website' ? 'client' : 'admin', autoConfirm ? 'booking.auto_confirmed' : 'booking.submitted',
    `${appt.code} — ${client.name} · ${service.name} · ${body.date} ${body.start}${autoConfirm ? ' (auto-confirm rule applied)' : ''}`,
    'appointment', appt.code);
  notifyBooking(dbx, appt, 'received');
  if (autoConfirm) notifyBooking(dbx, appt, 'confirmed');
  sendJson(res, 201, { appointment: joinAppt(dbx, appt), autoConfirmed: autoConfirm });
}, { auth: true });

route('POST', /^\/api\/appointments\/(\d+)\/action$/, async (req, res, m, q, body, session) => {
  const dbx = db.load();
  const appt = dbx.appointments.find(a => a.id === Number(m[1]));
  if (!appt) throw bad('Appointment not found.', 404);
  const action = String(body.action || '');
  const note = String(body.note || '').slice(0, 500);
  const now = db.fmtISO(Date.now());
  const actor = session.session.email;
  const valid = (okStatuses, next) => {
    if (!okStatuses.includes(appt.status)) throw bad(`Cannot ${action} an appointment that is "${appt.status}".`);
    appt.status = next;
    appt.updatedAt = now;
    appt.history.push({ ts: now, action, actor });
  };

  if (action === 'accept') {
    valid(['pending'], 'confirmed');
    db.writeAudit(actor, 'appointment.accepted', `${appt.code} confirmed — client notified`, 'appointment', appt.code);
    notifyBooking(dbx, appt, 'confirmed');
  } else if (action === 'decline') {
    valid(['pending'], 'declined');
    appt.note = note || 'Unable to accommodate this slot.';
    db.writeAudit(actor, 'appointment.declined', `${appt.code} declined with client note`, 'appointment', appt.code);
    notifyBooking(dbx, appt, 'declined');
  } else if (action === 'cancel') {
    valid(['pending', 'confirmed'], 'cancelled');
    if (note) appt.note = note;
    const hoursOut = (db.absMin(appt.date, appt.start) - db.nowAbsMin()) / 60;
    const late = hoursOut < dbx.settings.cancellationWindowHours;
    if (late) appt.note = (appt.note ? appt.note + ' — ' : '') + 'late cancellation (inside policy window)';
    db.writeAudit(actor, 'appointment.cancelled',
      `${appt.code} cancelled${late ? ` — LATE (inside ${dbx.settings.cancellationWindowHours}h window)` : ''}`,
      'appointment', appt.code);
    notifyBooking(dbx, appt, 'cancelled');
  } else if (action === 'reschedule') {
    if (!['pending', 'confirmed'].includes(appt.status)) throw bad(`Cannot reschedule an appointment that is "${appt.status}".`);
    const service = serviceOf(dbx, appt.serviceId);
    validateSlot(dbx, {
      date: body.date, start: body.start, duration: appt.duration,
      practitioner: body.practitioner || appt.practitioner, excludeId: appt.id,
    });
    const was = `${appt.date} ${appt.start}`;
    appt.date = body.date; appt.start = body.start;
    if (body.practitioner && dbx.settings.practitioners.includes(body.practitioner)) appt.practitioner = body.practitioner;
    appt.updatedAt = now;
    appt.history.push({ ts: now, action: 'rescheduled', actor });
    db.writeAudit(actor, 'appointment.rescheduled', `${appt.code} moved from ${was} to ${appt.date} ${appt.start}`, 'appointment', appt.code);
    notifyBooking(dbx, appt, 'rescheduled');
  } else if (action === 'complete') {
    valid(['confirmed'], 'completed');
    db.writeAudit(actor, 'appointment.completed', `${appt.code} marked completed`, 'appointment', appt.code);
    notifyBooking(dbx, appt, 'completed');
  } else {
    throw bad('Unknown action.');
  }
  db.save();
  sendJson(res, 200, { appointment: joinAppt(dbx, appt) });
}, { auth: true });

route('GET', /^\/api\/calendar$/, async (req, res, m, q) => {
  const dbx = db.load();
  const list = apptFilters(dbx, { from: q.from, to: q.to, status: q.status }).map(a => joinAppt(dbx, a));
  sendJson(res, 200, { appointments: list, businessHours: dbx.settings.businessHours, practitioners: dbx.settings.practitioners });
}, { auth: true });

/* --- clients --- */
route('GET', /^\/api\/clients$/, async (req, res, m, q) => {
  const dbx = db.load();
  let list = dbx.clients.slice();
  if (q.q) {
    const n = String(q.q).toLowerCase();
    list = list.filter(c => [c.name, c.code, c.email, c.phone, ...(c.tags || [])].some(v => String(v).toLowerCase().includes(n)));
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  const withMeta = list.map(c => {
    const appts = dbx.appointments.filter(a => a.clientId === c.id);
    const past = appts.filter(a => a.status === 'completed').length;
    const upcoming = appts
      .filter(a => a.status === 'confirmed' || a.status === 'pending')
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0] || null;
    return { ...c, totalVisits: past, nextVisit: upcoming ? { date: upcoming.date, start: upcoming.start, code: upcoming.code } : null };
  });
  sendJson(res, 200, { clients: withMeta });
}, { auth: true });

route('GET', /^\/api\/clients\/(\d+)$/, async (req, res, m) => {
  const dbx = db.load();
  const c = clientOf(dbx, m[1]);
  const appts = dbx.appointments.filter(a => a.clientId === c.id)
    .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start))
    .map(a => joinAppt(dbx, a));
  sendJson(res, 200, { client: c, appointments: appts });
}, { auth: true });

route('PATCH', /^\/api\/clients\/(\d+)$/, async (req, res, m, q, body, session) => {
  const dbx = db.load();
  const c = clientOf(dbx, m[1]);
  if (body.notes !== undefined) c.notes = String(body.notes).slice(0, 2000);
  if (body.phone !== undefined) c.phone = String(body.phone).slice(0, 40);
  if (body.tags !== undefined && Array.isArray(body.tags)) c.tags = body.tags.map(String).slice(0, 6);
  if (body.name !== undefined) c.name = String(body.name).trim().slice(0, 80) || c.name;
  if (body.email !== undefined) { if (!emailOk(body.email)) throw bad('Invalid email.'); c.email = body.email.trim(); }
  db.save();
  db.writeAudit(session.session.email, 'client.updated', `Profile updated for ${c.code} ${c.name}`, 'client', c.code);
  sendJson(res, 200, { client: c });
}, { auth: true });

/* --- services --- */
route('GET', /^\/api\/services$/, async (req, res) => {
  const dbx = db.load();
  sendJson(res, 200, { services: dbx.services, practitioners: dbx.practitioners });
}, { auth: true });

route('POST', /^\/api\/services$/, async (req, res, m, q, body, session) => {
  const dbx = db.load();
  if (!body.name || !body.duration || !body.price) throw bad('Name, duration and price are required.');
  const id = db.nextId('services');
  const svc = {
    id, code: `SVC-${String(id).padStart(2, '0')}`,
    name: String(body.name).trim().slice(0, 80),
    category: String(body.category || 'Other').trim().slice(0, 40),
    duration: Math.max(15, Math.min(480, Number(body.duration))),
    price: Math.max(0, Number(body.price)),
    description: String(body.description || '').slice(0, 300),
    active: body.active !== false,
  };
  dbx.services.push(svc);
  db.save();
  db.writeAudit(session.session.email, 'service.created', `${svc.name} added to the menu (${svc.duration} min · ₱${svc.price.toLocaleString()})`, 'service', svc.code);
  sendJson(res, 201, { service: svc });
}, { auth: true });

route('PATCH', /^\/api\/services\/(\d+)$/, async (req, res, m, q, body, session) => {
  const dbx = db.load();
  const s = serviceOf(dbx, m[1]);
  if (body.name !== undefined) s.name = String(body.name).trim().slice(0, 80) || s.name;
  if (body.category !== undefined) s.category = String(body.category).trim().slice(0, 40);
  if (body.duration !== undefined) s.duration = Math.max(15, Math.min(480, Number(body.duration)));
  if (body.price !== undefined) s.price = Math.max(0, Number(body.price));
  if (body.description !== undefined) s.description = String(body.description).slice(0, 300);
  if (body.active !== undefined) s.active = !!body.active;
  db.save();
  db.writeAudit(session.session.email, 'service.updated', `${s.name} updated`, 'service', s.code);
  sendJson(res, 200, { service: s });
}, { auth: true });

/* --- email / quota --- */
route('GET', /^\/api\/emails$/, async (req, res, m, q) => {
  const limit = Math.min(200, Number(q.limit) || 50);
  sendJson(res, 200, { emails: brevo.recent(limit), quota: brevo.snapshot(db.load()) });
}, { auth: true });

route('GET', /^\/api\/quota$/, async (req, res) => {
  sendJson(res, 200, { quota: brevo.snapshot(db.load()) });
}, { auth: true });

route('POST', /^\/api\/emails\/batch$/, async (req, res, m, q, body, session) => {
  const count = Math.max(1, Math.min(60, Number(body.count) || 12));
  const results = brevo.sendBatch(count);
  db.writeAudit(session.session.email, 'email.batch', `Reminder batch processed: ${JSON.stringify(results)}`, 'email', null);
  sendJson(res, 200, { results, quota: brevo.snapshot(db.load()) });
}, { auth: true });

route('POST', /^\/api\/quota\/reset$/, async (req, res, m, q, body, session) => {
  const dbx = db.load();
  dbx.quota = { date: db.wallToday(), sent: 0, failed: 0, limit: brevo.DAILY_LIMIT };
  db.save();
  db.writeAudit(session.session.email, 'quota.reset', 'Daily email quota reset (demo control)', 'quota', null);
  sendJson(res, 200, { quota: brevo.snapshot(dbx) });
}, { auth: true });

/* --- audit + settings --- */
route('GET', /^\/api\/audit$/, async (req, res, m, q) => {
  const dbx = db.load();
  const limit = Math.min(100, Number(q.limit) || 12);
  sendJson(res, 200, { entries: dbx.audit.slice(-limit).reverse() });
}, { auth: true });

route('GET', /^\/api\/settings$/, async (req, res) => {
  const dbx = db.load();
  sendJson(res, 200, { settings: dbx.settings, demoEmail: 'admin@allanese.clinic' });
}, { auth: true });

route('PATCH', /^\/api\/settings$/, async (req, res, m, q, body, session) => {
  const dbx = db.load();
  const s = dbx.settings;
  const changed = [];
  if (body.approvalMode !== undefined) {
    if (!['manual', 'auto'].includes(body.approvalMode)) throw bad('approvalMode must be manual or auto.');
    if (body.approvalMode !== s.approvalMode) changed.push(`approval mode → ${body.approvalMode}`);
    s.approvalMode = body.approvalMode;
  }
  if (Array.isArray(body.autoConfirmServices)) {
    s.autoConfirmServices = body.autoConfirmServices.map(Number).filter(id => dbx.services.some(x => x.id === id));
    changed.push(`auto-confirm services → ${s.autoConfirmServices.length}`);
  }
  if (body.businessHours && typeof body.businessHours === 'object') {
    for (const wd of [0, 1, 2, 3, 4, 5, 6]) {
      const b = body.businessHours[wd];
      if (!b) continue;
      if (b.closed !== undefined) s.businessHours[wd].closed = !!b.closed;
      if (b.open !== undefined && /^\d{2}:\d{2}$/.test(b.open)) s.businessHours[wd].open = b.open;
      if (b.close !== undefined && /^\d{2}:\d{2}$/.test(b.close)) s.businessHours[wd].close = b.close;
      if (db.toMin(s.businessHours[wd].close) <= db.toMin(s.businessHours[wd].open)) throw bad('Closing time must be after opening time.');
    }
    changed.push('business hours');
  }
  if (body.leadTimeHours !== undefined) {
    s.leadTimeHours = Math.max(0, Math.min(72, Number(body.leadTimeHours) || 0));
    changed.push(`lead time → ${s.leadTimeHours}h`);
  }
  if (body.cancellationWindowHours !== undefined) {
    s.cancellationWindowHours = Math.max(0, Math.min(720, Number(body.cancellationWindowHours) || 0));
    changed.push(`cancellation window → ${s.cancellationWindowHours}h`);
  }
  if (Array.isArray(body.practitioners)) {
    const list = body.practitioners.map(x => String(x).trim()).filter(Boolean).slice(0, 12);
    if (!list.length) throw bad('At least one practitioner is required.');
    s.practitioners = list;
    dbx.practitioners = list;
    changed.push('practitioners');
  }
  db.save();
  db.writeAudit(session.session.email, 'settings.updated', changed.length ? `Updated ${changed.join(', ')}` : 'Settings saved (no changes)', 'settings', null);
  sendJson(res, 200, { settings: s });
}, { auth: true });

/* --- demo controls --- */
route('POST', /^\/api\/demo\/reset$/, async (req, res, m, q, body, session) => {
  db.reset();
  // keep the caller signed in across a data reset
  const dbx = db.load();
  dbx.tokens[session.token] = session.session;
  db.save();
  db.writeAudit(session.session.email, 'demo.reset', 'Demo dataset restored to seed state', 'demo', null);
  sendJson(res, 200, { ok: true });
}, { auth: true });

route('GET', /^\/api\/health$/, async (req, res) => sendJson(res, 200, { ok: true, service: 'allanese-clinic-ops' }));

/* ------------------------------------------------------------------ server */
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsed.pathname);

  try {
    if (pathname.startsWith('/api/')) {
      const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readBody(req) : {};
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = pathname.match(r.re);
        if (!m) continue;
        let session = null;
        if (r.auth) {
          const auth = otp.requireAuth(req);
          if (auth.error) return sendJson(res, auth.status, { error: auth.error });
          session = auth;
        }
        return await r.handler(req, res, m, parsed.query, body, session);
      }
      return sendJson(res, 404, { error: 'Not found.' });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Method not allowed.' });
    let rel = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
    if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return sendJson(res, 404, { error: 'Not found.' });
    }
    const ext = path.extname(filePath).toLowerCase();
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors *",
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (e) {
    const status = e.status || 500;
    if (status >= 500) console.error('[server]', e);
    sendJson(res, status, { error: e.message || 'Server error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  db.load();
  console.log(`Allanese Clinic Ops running on http://0.0.0.0:${PORT}`);
  console.log(`Demo sign-in email: admin@allanese.clinic (any valid email works — codes arrive in the in-app demo inbox)`);
});
