'use strict';
/**
 * Brevo email integration (MOCK).
 * ----------------------------------------------------------------------------
 * This module mirrors the Brevo transactional-email contract described in the
 * dashboard plan. Swapping in the real API later only requires replacing
 * `deliver()` — every caller (OTP, booking workflow, reminders) stays the same.
 *
 * Real-API drop-in point:
 *   const { SendBrevoTransactionalEmail } = ... // or fetch to
 *   POST https://api.brevo.com/v3/smtp/email
 *   headers: { 'api-key': process.env.BREVO_API_KEY }
 * ----------------------------------------------------------------------------
 */
const db = require('./db');

const DAILY_LIMIT = 300;
const ALERT_THRESHOLDS = [70, 85, 95];
const OTP_RESERVE_PCT = 10; // below 10% capacity, non-OTP mail is held
const DEDUP_WINDOW_MS = 60_000;

const TEMPLATES = {
  otp: c => ({ subject: 'Your Allanese login code', body: `Your one-time password is ${c.code}. It expires in 5 minutes.` }),
  booking_received: c => ({ subject: 'We received your appointment request', body: `Hi ${c.name}, we've received your request for ${c.service} on ${c.date} at ${c.time}. The clinic will confirm shortly.` }),
  booking_confirmed: c => ({ subject: 'Your appointment at Allanese Medical Aesthetics is confirmed', body: `Hi ${c.name}, your ${c.service} with ${c.practitioner} on ${c.date} at ${c.time} is confirmed.` }),
  booking_declined: c => ({ subject: 'Update on your appointment request', body: `Hi ${c.name}, ${c.note || 'we are unable to accommodate this slot.'} Please reply or book another time — we'd love to see you.` }),
  booking_cancelled: c => ({ subject: 'Your appointment has been cancelled', body: `Hi ${c.name}, your ${c.service} on ${c.date} at ${c.time} has been cancelled as requested.` }),
  booking_rescheduled: c => ({ subject: 'Your appointment has been rescheduled', body: `Hi ${c.name}, your ${c.service} is now on ${c.date} at ${c.time}.` }),
  appointment_reminder: c => ({ subject: 'Reminder: your appointment at Allanese Medical Aesthetics', body: `Hi ${c.name}, this is a reminder of your ${c.service} on ${c.date} at ${c.time}.` }),
  booking_completed: c => ({ subject: 'Thank you for visiting Allanese Medical Aesthetics', body: `Hi ${c.name}, we hope you enjoyed your ${c.service}. Book your next session any time.` }),
  quota_alert: c => ({ subject: `Brevo capacity alert — ${c.pct}% of daily quota used`, body: `Daily send quota is at ${c.pct}% (${c.sent}/${c.limit}). Review email health in the dashboard.` }),
};

function ensureQuota(dbx) {
  const today = db.wallToday();
  if (dbx.quota.date !== today) {
    dbx.quota = { date: today, sent: 0, failed: 0, limit: DAILY_LIMIT };
  }
  return dbx.quota;
}

function snapshot(dbx) {
  const q = ensureQuota(dbx);
  const pct = Math.round((q.sent / q.limit) * 100);
  const remaining = Math.max(0, q.limit - q.sent);
  const activeAlerts = ALERT_THRESHOLDS.filter(t => pct >= t);
  return {
    limit: q.limit, sent: q.sent, failed: q.failed,
    remaining, pct,
    capacityLabel: pct === 0 ? 'Fresh daily quota' : `${100 - pct}% capacity remaining`,
    otpReserveActive: pct >= 100 - OTP_RESERVE_PCT,
    thresholds: ALERT_THRESHOLDS,
    activeAlerts,
    date: q.date,
  };
}

/**
 * Send (mock) a transactional email.
 * @returns {{status:'sent'|'failed'|'held'|'duplicate', alerts:number[]}}
 */
function send({ to, toName, template, vars = {}, relatedId = null, priority = false }) {
  const dbx = db.load();
  const q = ensureQuota(dbx);
  const now = Date.now();
  const tpl = TEMPLATES[template];
  if (!tpl) return { status: 'failed', alerts: [], error: 'unknown template' };

  // Deduplication: same recipient + template + record within the window.
  const dupe = dbx.emails.find(e =>
    e.to === to && e.template === template && (e.relatedId || null) === (relatedId || null) &&
    now - Date.parse(e.ts) < DEDUP_WINDOW_MS && e.status !== 'failed');
  if (dupe) return { status: 'duplicate', alerts: [] };

  const pctBefore = Math.round((q.sent / q.limit) * 100);
  const remaining = q.limit - q.sent;
  let status;

  if (remaining <= 0) {
    status = 'held'; // out of quota — queued for the next reset
  } else if (!priority && remaining < (q.limit * OTP_RESERVE_PCT) / 100) {
    status = 'held'; // OTP priority reserve engaged below 10%
  } else if (Math.random() < 0.05) {
    status = 'failed'; // simulated transient delivery failure
    q.failed += 1;
  } else {
    status = 'sent';
    q.sent += 1;
  }

  const rendered = tpl(vars);
  const id = (dbx.counters.emails = (dbx.counters.emails || 0) + 1);
  dbx.emails.push({
    id, ts: db.fmtISO(now),
    to, toName: toName || '',
    template, subject: rendered.subject,
    status, relatedId,
    error: status === 'failed' ? 'Transient provider error — will retry'
          : status === 'held' ? 'Held: daily capacity reserve for OTP traffic' : null,
  });
  if (dbx.emails.length > 300) dbx.emails = dbx.emails.slice(-240);

  const pctAfter = Math.round((q.sent / q.limit) * 100);
  const alerts = ALERT_THRESHOLDS.filter(t => pctBefore < t && pctAfter >= t);
  if (alerts.length) {
    db.writeAudit('system', 'quota.threshold', `Brevo daily quota crossed ${alerts[alerts.length - 1]}% (${q.sent} / ${q.limit})`, 'quota', null);
    // notify the operator about the breach (priority mail, not itself quota-limited twice)
    if (template !== 'quota_alert') {
      const innerId = (dbx.counters.emails = (dbx.counters.emails || 0) + 1);
      dbx.emails.push({
        id: innerId, ts: db.fmtISO(now), to: 'admin@allanese.clinic', toName: 'Allanese Ops',
        template: 'quota_alert', subject: `Brevo capacity alert — ${pctAfter}% of daily quota used`,
        status: 'sent', relatedId: null, error: null,
      });
      q.sent += 1;
    }
  }
  if (status === 'failed') db.writeAudit('system', 'email.failed', `Delivery failed — ${relatedId || template} (${to})`, 'email', relatedId);
  else if (status === 'sent') db.writeAudit('system', 'email.sent', `${template} delivered to ${to}${relatedId ? ' — ' + relatedId : ''}`, 'email', relatedId);

  db.save();
  return { status, alerts };
}

/** Bulk reminder fan-out helper used by the demo "simulate batch" control. */
function sendBatch(count) {
  const dbx = db.load();
  const results = { sent: 0, held: 0, failed: 0 };
  const pool = dbx.appointments
    .filter(a => a.status === 'confirmed')
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  if (!pool.length) return results;
  // rotate through the roster so repeated batches reach different clients
  const offset = ensureQuota(dbx).sent % pool.length;
  const soon = Array.from({ length: Math.min(count, pool.length) },
    (_, i) => pool[(offset + i) % pool.length]);
  for (const a of soon) {
    const c = dbx.clients.find(x => x.id === a.clientId);
    const s = dbx.services.find(x => x.id === a.serviceId);
    const r = send({
      to: c.email, toName: c.name, template: 'appointment_reminder', relatedId: a.code,
      vars: { name: c.name, service: s.name, date: a.date, time: a.start },
    });
    results[r.status] = (results[r.status] || 0) + 1;
  }
  return results;
}

function recent(limit = 50) {
  const dbx = db.load();
  return dbx.emails.slice().reverse().slice(0, limit);
}

module.exports = { send, sendBatch, snapshot, recent, TEMPLATES, DAILY_LIMIT };
