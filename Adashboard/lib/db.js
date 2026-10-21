'use strict';
/**
 * Allanese Clinic Ops — zero-dependency JSON datastore.
 * Wall-time helpers: appointment times are stored as 'YYYY-MM-DD' + 'HH:mm'
 * (timezone-naive) so demo data always renders correctly in the viewer's local time.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_VERSION = 3;

let _cache = null;

/* ---------------- wall-time helpers ---------------- */
function pad(n) { return String(n).padStart(2, '0'); }

function wallNow() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function wallToday() { return wallNow().slice(0, 10); }

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}
function weekdayOf(dateStr) { // 0=Sun..6=Sat
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
function toMin(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
function fromMin(min) { return `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`; }
function addMin(hhmm, mins) { return fromMin(toMin(hhmm) + mins); }
/** comparable absolute minutes for wall-time date+hhmm */
function absMin(date, hhmm) {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 60000 + toMin(hhmm);
}
function nowAbsMin() {
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 60000 + d.getHours() * 60 + d.getMinutes();
}
function fmtISO(ts) { return new Date(ts).toISOString(); }

/* ---------------- seed ---------------- */
function seed() {
  const today = wallToday();

  const settings = {
    clinicName: 'Allanese Medical Aesthetics',
    approvalMode: 'manual',            // 'manual' | 'auto'
    autoConfirmServices: [],           // service ids eligible for auto-confirm
    businessHours: {
      0: { open: '09:00', close: '18:00', closed: true },
      1: { open: '09:00', close: '18:00', closed: false },
      2: { open: '09:00', close: '18:00', closed: false },
      3: { open: '09:00', close: '18:00', closed: false },
      4: { open: '09:00', close: '18:00', closed: false },
      5: { open: '09:00', close: '18:00', closed: false },
      6: { open: '09:00', close: '17:00', closed: false },
    },
    leadTimeHours: 2,
    cancellationWindowHours: 24,
    practitioners: ['Dr. Elaine Allanese', 'Dra. Sofia Reyes', 'Camille Torres, RN', 'Joyce Andaya'],
  };

  const svc = (id, code, name, category, duration, price, description) =>
    ({ id, code, name, category, duration, price, description, active: true });
  const services = [
    svc(1, 'SVC-01', 'HydraFacial Signature', 'Facials', 60, 2500, 'Deep cleansing, extraction and hydration with medical-grade serums.'),
    svc(2, 'SVC-02', 'Deep Cleanse Facial', 'Facials', 45, 1800, 'Purifying facial for congested skin with gentle extractions.'),
    svc(3, 'SVC-03', 'Chemical Peel', 'Resurfacing', 30, 2200, 'Physician-selected peel to improve tone, texture and clarity.'),
    svc(4, 'SVC-04', 'Microneedling', 'Resurfacing', 60, 3500, 'Collagen-induction therapy for scars, pores and fine lines.'),
    svc(5, 'SVC-05', 'Anti-Wrinkle Injection', 'Injectables', 30, 8000, 'Precision neuromodulator treatment for expression lines.'),
    svc(6, 'SVC-06', 'Dermal Filler', 'Injectables', 45, 15000, 'Hyaluronic acid volumisation, per syringe, physician-administered.'),
    svc(7, 'SVC-07', 'Laser Hair Removal', 'Laser', 30, 1500, 'Diode laser hair reduction — per area session.'),
    svc(8, 'SVC-08', 'IPL Skin Rejuvenation', 'Laser', 45, 3000, 'Intense pulsed light for redness, pigment and sun damage.'),
    svc(9, 'SVC-09', 'PRP Hair Restoration', 'Regenerative', 60, 6500, 'Autologous platelet-rich plasma therapy for hair density.'),
    svc(10, 'SVC-10', 'Ultherapy Face Lift', 'Lifting', 90, 25000, 'Focused ultrasound lifting for brow, jawline and neck.'),
    svc(11, 'SVC-11', 'LED Light Therapy', 'Add-on', 30, 1200, 'Calming red/blue light session to support healing.'),
    svc(12, 'SVC-12', 'Carbon Laser Peel', 'Laser', 45, 4000, 'Laser-assisted carbon peel for instant radiance.'),
  ];

  const cli = (id, code, name, email, phone, tags, notes, lastVisit) =>
    ({ id, code, name, email, phone, tags, notes, lastVisit, createdAt: fmtISO(Date.now() - (300 + id * 17) * 86400000) });
  const clients = [
    cli(1, 'CL-001', 'Maria Santos', 'maria.santos@gmail.com', '+63 917 555 0141', ['returning'], 'Prefers morning slots. Mild sensitivity to retinol — patch test advised.', addDays(today, -12)),
    cli(2, 'CL-002', 'Angela Cruz', 'angela.cruz@gmail.com', '+63 917 555 0182', ['vip', 'returning'], 'VIP package — 10-session HydraFacial. Always books with Dra. Reyes.', addDays(today, -7)),
    cli(3, 'CL-003', 'Patricia Reyes', 'patricia.reyes@gmail.com', '+63 918 555 0119', ['returning'], 'Latex sensitivity noted — use nitrile gloves.', addDays(today, -21)),
    cli(4, 'CL-004', 'Camille Lim', 'camille.lim@gmail.com', '+63 917 555 0166', ['new'], 'First visit completed last month — interested in injectables.', addDays(today, -9)),
    cli(5, 'CL-005', 'Joanna Dela Cruz', 'joanna.dc@gmail.com', '+63 919 555 0173', ['returning'], 'On isotretinoin — defer peels; cleared for LED and facials.', addDays(today, -5)),
    cli(6, 'CL-006', 'Kristine Bautista', 'kristine.b@gmail.com', '+63 917 555 0128', ['returning'], '', addDays(today, -30)),
    cli(7, 'CL-007', 'Nicole Garcia', 'nicole.garcia@gmail.com', '+63 916 555 0155', ['new'], 'Referred by Angela Cruz.', addDays(today, -3)),
    cli(8, 'CL-008', 'Sabrina Tan', 'sabrina.tan@gmail.com', '+63 921 555 0194', ['vip'], 'Comes quarterly for Ultherapy. Prefers Dr. Allanese.', addDays(today, -64)),
    cli(9, 'CL-009', 'Michelle Aquino', 'michelle.aquino@gmail.com', '+63 917 555 0137', ['returning'], 'Pregnant — clear all treatments with physician first.', addDays(today, -15)),
    cli(10, 'CL-010', 'Isabel Ramos', 'isabel.ramos@gmail.com', '+63 920 555 0148', ['new'], '', addDays(today, -2)),
    cli(11, 'CL-011', 'Daniela Mendoza', 'daniela.m@gmail.com', '+63 917 555 0111', ['returning'], 'Pigment-prone — strict SPF compliance discussed.', addDays(today, -18)),
    cli(12, 'CL-012', 'Veronica Chua', 'veronica.chua@gmail.com', '+63 915 555 0162', ['returning'], '', addDays(today, -26)),
    cli(13, 'CL-013', 'Grace Villanueva', 'grace.v@gmail.com', '+63 917 555 0179', ['new'], 'Trial session for laser hair removal.', addDays(today, -1)),
    cli(14, 'CL-014', 'Hannah Padilla', 'hannah.padilla@gmail.com', '+63 922 555 0186', ['vip', 'returning'], 'Bridesmaid package — timeline confirmed for December.', addDays(today, -40)),
  ];

  const prac = settings.practitioners;
  let aptSeq = 1001;
  const appointments = [];
  function apt(off, start, cId, sId, pIdx, status, source = 'dashboard', extra = {}) {
    const svc = services.find(s => s.id === sId);
    let date = addDays(today, off);
    if (weekdayOf(date) === 0) date = addDays(date, 1); // clinic closed Sundays
    const created = fmtISO(Date.now() - (Math.abs(off) + 2) * 86400000 - 3600000);
    const a = {
      id: aptSeq - 1000,
      code: `APT-${aptSeq}`,
      clientId: cId, serviceId: sId,
      practitioner: prac[pIdx],
      date, start, duration: svc.duration,
      status, source,
      note: '',
      createdAt: created,
      updatedAt: created,
      history: [{ ts: created, action: 'created', actor: source === 'website' ? 'client' : 'admin' }],
      ...extra,
    };
    aptSeq++;
    appointments.push(a);
    return a;
  }

  // ---- past week: completed treatments
  const pastPlan = [
    [-7, '09:30', 1, 1, 1], [-7, '11:00', 4, 5, 0], [-7, '14:00', 7, 2, 2],
    [-6, '10:00', 2, 4, 0], [-6, '13:30', 10, 8, 0],
    [-5, '09:00', 5, 11, 3], [-5, '11:30', 3, 3, 1], [-5, '15:00', 8, 6, 2],
    [-4, '10:30', 6, 7, 2], [-4, '14:00', 11, 1, 1],
    [-3, '09:30', 9, 2, 0], [-3, '12:00', 12, 12, 3], [-3, '16:00', 13, 7, 2],
    [-2, '10:00', 14, 10, 0], [-2, '13:00', 1, 4, 1],
    [-1, '09:30', 2, 1, 1], [-1, '11:00', 6, 11, 3], [-1, '14:30', 4, 9, 0],
  ];
  pastPlan.forEach(p => apt(p[0], p[1], p[2], p[3], p[4], 'completed'));

  // a couple of historical exceptions
  apt(-3, '15:30', 5, 5, 0, 'cancelled', 'dashboard', { note: 'Client rescheduled — flight conflict.' });
  apt(-2, '15:30', 9, 6, 2, 'declined', 'dashboard', { note: 'Slot no longer available — please choose another time. Happy to accommodate earlier that day.' });
  apt(-5, '16:30', 12, 3, 1, 'declined', 'website', { note: 'Unable to accommodate this time — please book an alternative slot.' });

  // ---- today
  apt(0, '09:00', 8, 6, 2, 'completed');
  apt(0, '10:30', 3, 3, 1, 'completed');
  apt(0, '11:30', 2, 1, 1, 'confirmed');
  apt(0, '13:30', 6, 12, 3, 'confirmed');
  apt(0, '15:00', 7, 2, 2, 'pending', 'website');
  apt(0, '16:30', 10, 7, 2, 'pending', 'website');
  apt(0, '17:00', 4, 11, 0, 'confirmed');

  // ---- upcoming
  apt(1, '09:30', 1, 4, 1, 'confirmed');
  apt(1, '11:00', 11, 2, 3, 'pending', 'website');
  apt(1, '13:00', 14, 12, 0, 'confirmed');
  apt(1, '15:30', 13, 7, 2, 'pending', 'website');
  apt(2, '10:00', 5, 8, 2, 'confirmed');
  apt(2, '14:00', 12, 1, 1, 'pending', 'website');
  apt(3, '09:00', 9, 2, 0, 'confirmed');
  apt(3, '16:00', 6, 5, 0, 'confirmed');
  apt(4, '11:30', 10, 3, 1, 'pending', 'website');
  apt(5, '09:30', 2, 4, 1, 'confirmed');
  apt(5, '14:30', 14, 5, 0, 'pending', 'website');
  apt(7, '10:00', 8, 10, 0, 'confirmed');
  apt(8, '13:30', 11, 9, 0, 'pending', 'website');
  apt(9, '09:30', 1, 1, 1, 'confirmed');

  // ---- email log (recent window; quota carries the daily counter)
  const emails = [];
  let mailSeq = 1;
  const now = Date.now();
  function mail(minsAgo, to, name, template, subject, status, relatedId) {
    emails.push({
      id: mailSeq++, ts: fmtISO(now - minsAgo * 60000),
      to, toName: name, template, subject, status, relatedId: relatedId || null,
      error: status === 'failed' ? 'SMTP 550 — mailbox unavailable' : null,
    });
  }
  mail(14, 'grace.v@gmail.com', 'Grace Villanueva', 'booking_confirmed', 'Your appointment at Allanese Medical Aesthetics is confirmed', 'sent', 'APT-1042');
  mail(26, 'isabel.ramos@gmail.com', 'Isabel Ramos', 'booking_received', 'We received your appointment request', 'sent', 'APT-1040');
  mail(58, 'admin@allanese.clinic', 'Allanese Ops', 'booking_received', 'New website booking request — APT-1040', 'sent', 'APT-1040');
  mail(74, 'michelle.aquino@gmail.com', 'Michelle Aquino', 'appointment_reminder', 'Reminder: your appointment tomorrow', 'sent', 'APT-1047');
  mail(96, 'joanna.dc@gmail.com', 'Joanna Dela Cruz', 'appointment_reminder', 'Reminder: your appointment at Allanese Medical Aesthetics', 'sent', 'APT-1038');
  mail(140, 'admin@allanese.clinic', 'Allanese Ops', 'quota_alert', 'Brevo capacity alert — 70% of daily quota used', 'sent', null);
  mail(190, 'daniela.m@gmail.com', 'Daniela Mendoza', 'booking_confirmed', 'Your appointment at Allanese Medical Aesthetics is confirmed', 'sent', 'APT-1044');
  mail(260, 'unknown.mailbox@gmail.com', 'Unknown Mailbox', 'appointment_reminder', 'Reminder: your appointment at Allanese Medical Aesthetics', 'failed', 'APT-1035');
  mail(320, 'sabrina.tan@gmail.com', 'Sabrina Tan', 'booking_rescheduled', 'Your appointment has been rescheduled', 'sent', 'APT-1051');
  mail(430, 'kristine.b@gmail.com', 'Kristine Bautista', 'booking_confirmed', 'Your appointment at Allanese Medical Aesthetics is confirmed', 'sent', 'APT-1036');
  mail(520, 'hannah.padilla@gmail.com', 'Hannah Padilla', 'booking_completed', 'Thank you for visiting Allanese Medical Aesthetics', 'sent', 'APT-1049');
  mail(610, 'bounce.test@invalid.local', 'Bounce Test', 'booking_confirmed', 'Your appointment at Allanese Medical Aesthetics is confirmed', 'failed', 'APT-1033');
  mail(740, 'patricia.reyes@gmail.com', 'Patricia Reyes', 'otp', 'Your Allanese login code', 'sent', null);
  mail(820, 'admin@allanese.clinic', 'Allanese Ops', 'booking_declined', 'Booking declined — client notified', 'sent', 'APT-1031');
  mail(960, 'maria.santos@gmail.com', 'Maria Santos', 'appointment_reminder', 'Reminder: your appointment at Allanese Medical Aesthetics', 'sent', 'APT-1052');
  mail(1100, 'camille.lim@gmail.com', 'Camille Lim', 'booking_confirmed', 'Your appointment at Allanese Medical Aesthetics is confirmed', 'sent', 'APT-1050');
  mail(1260, 'legacy.contact@closed-mailer.net', 'Legacy Contact', 'appointment_reminder', 'Reminder: your appointment at Allanese Medical Aesthetics', 'failed', 'APT-1028');
  mail(1440, 'nicole.garcia@gmail.com', 'Nicole Garcia', 'booking_received', 'We received your appointment request', 'sent', 'APT-1041');

  const audit = [
    { id: 1, ts: fmtISO(now - 14 * 60000), actor: 'client', action: 'booking.submitted', detail: 'APT-1040 requested via website (Isabel Ramos — Deep Cleanse Facial)', targetType: 'appointment', targetId: 'APT-1040' },
    { id: 2, ts: fmtISO(now - 15 * 60000), actor: 'client', action: 'booking.submitted', detail: 'APT-1041 requested via website (Nicole Garcia — Chemical Peel)', targetType: 'appointment', targetId: 'APT-1041' },
    { id: 3, ts: fmtISO(now - 74 * 60000), actor: 'system', action: 'email.sent', detail: 'Reminder delivered — APT-1047', targetType: 'email', targetId: null },
    { id: 4, ts: fmtISO(now - 140 * 60000), actor: 'system', action: 'quota.threshold', detail: 'Brevo daily quota crossed 70% (210 / 300)', targetType: 'quota', targetId: null },
    { id: 5, ts: fmtISO(now - 260 * 60000), actor: 'system', action: 'email.failed', detail: 'Delivery failed — APT-1035 (SMTP 550)', targetType: 'email', targetId: 'APT-1035' },
    { id: 6, ts: fmtISO(now - 19 * 3600000), actor: 'admin', action: 'appointment.completed', detail: 'APT-1039 marked completed by Dr. Elaine Allanese', targetType: 'appointment', targetId: 'APT-1039' },
    { id: 7, ts: fmtISO(now - 27 * 3600000), actor: 'admin', action: 'settings.updated', detail: 'Cancellation window set to 24 hours', targetType: 'settings', targetId: null },
    { id: 8, ts: fmtISO(now - 43 * 3600000), actor: 'admin', action: 'appointment.declined', detail: 'APT-1031 declined with client note', targetType: 'appointment', targetId: 'APT-1031' },
  ];

  return {
    version: SEED_VERSION,
    counters: { clients: 14, services: 12, appointments: aptSeq - 1001, emails: mailSeq, audit: audit.length },
    settings,
    practitioners: prac,
    clients,
    services,
    appointments,
    emails,
    audit,
    quota: { date: today, sent: 186, failed: 3, limit: 300 },
    otps: {},
    tokens: {},
  };
}

/* ---------------- persistence ---------------- */
function load() {
  if (_cache) return _cache;
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (parsed && parsed.version === SEED_VERSION) { _cache = parsed; return _cache; }
    }
  } catch (e) {
    console.error('[db] failed to load, reseeding:', e.message);
  }
  _cache = seed();
  save();
  return _cache;
}

function save() {
  if (!_cache) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(_cache, null, 1));
  fs.renameSync(tmp, DB_FILE);
}

function reset() {
  _cache = seed();
  save();
  return _cache;
}

function nextId(coll) {
  const db = load();
  db.counters[coll] = (db.counters[coll] || 0) + 1;
  return db.counters[coll];
}

function writeAudit(actor, action, detail, targetType, targetId) {
  const db = load();
  const id = (db.counters.audit = (db.counters.audit || 0) + 1);
  db.audit.push({ id, ts: fmtISO(Date.now()), actor, action, detail, targetType: targetType || null, targetId: targetId || null });
  if (db.audit.length > 400) db.audit = db.audit.slice(-300);
  save();
  return id;
}

module.exports = {
  load, save, reset, nextId, writeAudit,
  wallNow, wallToday, addDays, weekdayOf, toMin, fromMin, addMin, absMin, nowAbsMin, fmtISO,
};
