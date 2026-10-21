/** Shared booking flows: appointment detail + actions, new booking form. */
import { api } from './api.js';
import {
  h, toast, openModal, confirmDialog, statusBadge, fmtDateFull, timeRange, money,
  todayStr, partsOf,
} from './ui.js';

function timeOptions(selected) {
  const opts = [];
  for (let m = 8 * 60; m <= 18 * 60 + 45; m += 15) {
    const v = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    opts.push(h('option', { value: v, text: v, selected: v === selected }));
  }
  return opts;
}

function detailRows(j) {
  const row = (k, v) => h('div', { class: 'dr' }, h('span', { class: 'k', text: k }), h('span', { class: 'v' }, v));
  return h('div', { class: 'detail-rows' },
    row('Booking', j.code),
    row('Client', `${j.clientName} · ${j.clientEmail}`),
    row('Phone', j.clientPhone || '—'),
    row('Service', `${j.serviceName} · ${j.duration} min${j.servicePrice ? ' · ' + money(j.servicePrice) : ''}`),
    row('Practitioner', j.practitioner),
    row('When', `${fmtDateFull(j.date)} · ${timeRange(j.start, j.duration)}`),
    row('Status', statusBadge(j.status)),
    row('Source', j.source === 'website' ? 'Website request' : 'Entered by staff'),
  );
}

export function openAppointmentModal(appt, onChanged) {
  let close = () => {};
  const m = openModal({
    title: `${appt.code}`,
    sub: `${appt.clientName} — ${appt.serviceName}`,
    body: h('div', {}),
    onClose: () => {},
  });
  close = m.close;

  const renderBody = j => {
    const body = m.modal.querySelector('.modal-body');
    const foot = m.modal.querySelector('.modal-foot');
    body.innerHTML = '';
    foot.innerHTML = '';

    body.appendChild(detailRows(j));
    if (j.note) {
      body.appendChild(h('div', {
        class: 'alert-item info',
        style: { marginTop: '4px' },
      },
        h('span', { class: 'alert-ico', text: '✎' }),
        h('div', {},
          h('div', { class: 'alert-title', text: 'Client-facing note' }),
          h('div', { class: 'alert-detail', text: j.note }),
        ),
      ));
    }
    if (j.history && j.history.length) {
      const items = j.history.slice(-4).reverse();
      body.appendChild(h('div', { class: 'section-label', text: 'Activity' }));
      body.appendChild(h('ul', { class: 'activity' },
        items.map(ev => h('li', {},
          h('div', { class: 'a-title', text: ev.action.replace(/-/g, ' ') }),
          h('div', { class: 'a-meta', text: ev.actor }),
        )),
      ));
    }

    const btn = (label, cls, onClick) => h('button', { class: `btn ${cls} btn-small`, text: label, onClick });

    const act = async (action, payload = {}, successMsg) => {
      try {
        const r = await api(`/api/appointments/${j.id}/action`, { method: 'POST', body: { action, ...payload } });
        toast(successMsg || `${j.code} updated.`, 'success');
        close();
        openAppointmentModal(r.appointment, onChanged);
        if (onChanged) onChanged();
      } catch (e) {
        toast(e.message, 'error', 6500);
      }
    };

    const actions = [];
    if (j.status === 'pending') {
      actions.push(btn('Accept booking', 'btn-primary', () => act('accept', {}, 'Booking confirmed — confirmation email sent.')));
      actions.push(btn('Decline', 'btn-outline', () => openDecline(j, act)));
      actions.push(btn('Reschedule', 'btn-outline', () => openReschedule(j, act)));
      actions.push(btn('Cancel', 'btn-danger', () => openCancel(j, act)));
    } else if (j.status === 'confirmed') {
      actions.push(btn('Mark completed', 'btn-gold', () => act('complete', {}, `${j.code} completed — thank-you email sent.`)));
      actions.push(btn('Reschedule', 'btn-outline', () => openReschedule(j, act)));
      actions.push(btn('Cancel', 'btn-danger', () => openCancel(j, act)));
    }
    actions.push(btn('Close', 'btn-outline', () => close()));
    actions.forEach(b => foot.appendChild(b));
  };

  renderBody(appt);
  return m;
}

function openDecline(j, act) {
  const note = h('textarea', {
    placeholder: 'e.g. Unable to accommodate this time — please book an alternative slot.',
    rows: 3, value: 'Unable to accommodate this time — please book an alternative slot.',
  });
  const m = openModal({
    title: 'Decline booking',
    sub: `${j.code} — ${j.clientName} will receive your note by email.`,
    body: h('div', { class: 'field' }, h('span', { class: 'field-label', text: 'Client-facing note' }), note),
    footer: [
      h('button', { class: 'btn btn-outline', text: 'Back', onClick: () => m.close() }),
      h('button', {
        class: 'btn btn-danger', text: 'Decline & notify',
        onClick: () => { m.close(); act('decline', { note: note.value.trim() }, `${j.code} declined — client notified.`); },
      }),
    ],
  });
}

function openCancel(j, act) {
  confirmDialog({
    title: 'Cancel appointment?',
    message: `${j.code} (${j.clientName} · ${fmtDateFull(j.date)} ${j.start}) will be cancelled and the client notified by email.`,
    confirmLabel: 'Cancel appointment',
    danger: true,
  }).then(ok => { if (ok) act('cancel', {}, `${j.code} cancelled — client notified.`); });
}

let _rosterPromise = null;
function getRoster() {
  if (!_rosterPromise) {
    _rosterPromise = api('/api/settings')
      .then(r => r.settings.practitioners)
      .catch(() => null);
  }
  return _rosterPromise;
}

async function openReschedule(j, act) {
  const date = h('input', { type: 'date', value: j.date });
  const time = h('select', {}, ...timeOptions(j.start));
  const prac = h('select', {});
  const roster = (await getRoster()) || [j.practitioner];
  roster.forEach(p => prac.appendChild(h('option', { value: p, text: p, selected: p === j.practitioner })));

  const m = openModal({
    title: 'Reschedule',
    sub: `${j.code} — ${j.serviceName} (${j.duration} min)`,
    body: h('div', { class: 'form-grid' },
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'New date' }), date),
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'New time' }), time),
      h('label', { class: 'field full' }, h('span', { class: 'field-label', text: 'Practitioner' }), prac),
    ),
    footer: [
      h('button', { class: 'btn btn-outline', text: 'Back', onClick: () => m.close() }),
      h('button', {
        class: 'btn btn-primary', text: 'Save new slot',
        onClick: () => {
          m.close();
          act('reschedule', { date: date.value, start: time.value, practitioner: prac.value },
            `${j.code} rescheduled — client notified.`);
        },
      }),
    ],
  });
}

/* ------------------------------------------------------------------ */
export async function openBookingModal({ prefill = {}, onChanged } = {}) {
  let clients, services, settings;
  try {
    [clients, services, settings] = await Promise.all([
      api('/api/clients').then(r => r.clients),
      api('/api/services').then(r => r.services.filter(s => s.active)),
      api('/api/settings').then(r => r.settings),
    ]);
  } catch (e) { toast(e.message, 'error'); return; }

  const clientSel = h('select', {},
    ...clients.map(c => h('option', {
      value: String(c.id), text: `${c.name} (${c.code})`,
      selected: prefill.clientId != null && c.id === Number(prefill.clientId),
    })));
  const svcSel = h('select', {},
    ...services.map(s => h('option', {
      value: String(s.id), text: `${s.name} — ${s.duration} min — ${money(s.price)}`,
    })));
  const pracSel = h('select', {},
    ...settings.practitioners.map(p => h('option', { value: p, text: p })));
  const dateInp = h('input', { type: 'date', value: prefill.date || todayStr(), min: todayStr() });
  const timeSel = h('select', {}, ...timeOptions(prefill.start || '10:00'));
  const sourceSel = h('select', {},
    h('option', { value: 'dashboard', text: 'Entered by staff (dashboard)' }),
    h('option', { value: 'website', text: 'Website request (as if from the public site)', selected: prefill.source === 'website' }));
  const noteInp = h('textarea', { rows: 2, placeholder: 'Optional scheduling note (not clinical information)' });
  const errBox = h('div', { class: 'otp-error hidden' });

  const submit = h('button', { class: 'btn btn-primary', text: 'Create booking' });
  const m = openModal({
    title: 'New booking',
    sub: 'Validated server-side for hours, lead time and double-booking.',
    wide: true,
    body: h('div', { class: 'form-grid' },
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'Client' }), clientSel),
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'Service' }), svcSel),
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'Practitioner' }), pracSel),
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'Source' }), sourceSel),
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'Date' }), dateInp),
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'Time' }), timeSel),
      h('label', { class: 'field full' }, h('span', { class: 'field-label', text: 'Note (optional)' }), noteInp),
      h('div', { class: 'full' }, errBox),
    ),
    footer: [
      h('button', { class: 'btn btn-outline', text: 'Cancel', onClick: () => m.close() }),
      submit,
    ],
  });

  submit.addEventListener('click', async () => {
    errBox.classList.add('hidden');
    submit.disabled = true;
    submit.textContent = 'Saving…';
    try {
      const r = await api('/api/appointments', {
        method: 'POST',
        body: {
          clientId: Number(clientSel.value),
          serviceId: Number(svcSel.value),
          practitioner: pracSel.value,
          date: dateInp.value,
          start: timeSel.value,
          source: sourceSel.value,
          note: noteInp.value,
        },
      });
      m.close();
      toast(r.autoConfirmed
        ? `${r.appointment.code} auto-confirmed — confirmation email sent.`
        : `${r.appointment.code} saved as pending — notifications queued.`, 'success');
      if (onChanged) onChanged();
    } catch (e) {
      errBox.textContent = e.message;
      errBox.classList.remove('hidden');
      submit.disabled = false;
      submit.textContent = 'Create booking';
    }
  });
}
