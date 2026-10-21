/** Appointments — search, filter, and run the full decision workflow. */
import { api } from '../api.js';
import {
  h, clear, pageHead, statusBadge, fmtDate, money, debounce, todayStr,
  addDaysStr, emptyState, errorCard, toast, timeRange,
} from '../ui.js';
import { openBookingModal, openAppointmentModal } from '../booking.js';

let q = '';
let status = 'all';
let range = 'upcoming';
let practitioner = 'all';

const RANGES = {
  upcoming: () => ({ from: todayStr(), order: 'asc' }),
  last30: () => ({ from: addDaysStr(todayStr(), -30), order: 'desc' }),
  all: () => ({ order: 'desc' }),
};

export async function render(root) {
  root.appendChild(pageHead({
    kicker: 'Workflow',
    title: 'Appointments',
    sub: 'Search, filter, accept, decline, reschedule, cancel and complete treatments',
    actions: [
      h('button', {
        class: 'btn btn-primary', text: '+ New booking',
        onClick: () => openBookingModal({ onChanged: refresh }),
      }),
    ],
  }));

  const body = h('div', { class: 'card reveal' });
  root.appendChild(body);
  await load(body);
}

function refresh() {
  const root = document.getElementById('view');
  clear(root);
  render(root);
}

async function load(body) {
  clear(body);
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (q) params.set('q', q);
  if (practitioner !== 'all') params.set('practitioner', practitioner);
  const r = RANGES[range]();
  Object.entries(r).forEach(([k, v]) => params.set(k, v));

  const practitioners = ['all', 'Dr. Elaine Allanese', 'Dra. Sofia Reyes', 'Camille Torres, RN', 'Joyce Andaya'];

  const search = h('input', {
    class: 'grow', type: 'search', placeholder: 'Search client, service, booking code, phone…', value: q,
  });
  search.addEventListener('input', debounce(() => { q = search.value.trim(); load(body); }, 320));

  const statusSel = h('select', {},
    ...['all', 'pending', 'confirmed', 'completed', 'declined', 'cancelled'].map(s =>
      h('option', { value: s, text: s === 'all' ? 'All statuses' : s[0].toUpperCase() + s.slice(1), selected: s === status })));
  statusSel.addEventListener('change', () => { status = statusSel.value; load(body); });

  const rangeSel = h('select', {},
    h('option', { value: 'upcoming', text: 'Upcoming & today', selected: range === 'upcoming' }),
    h('option', { value: 'last30', text: 'Last 30 days', selected: range === 'last30' }),
    h('option', { value: 'all', text: 'All records', selected: range === 'all' }));
  rangeSel.addEventListener('change', () => { range = rangeSel.value; load(body); });

  const pracSel = h('select', {},
    ...practitioners.map(p => h('option', {
      value: p, text: p === 'all' ? 'All practitioners' : p, selected: p === practitioner,
    })));
  pracSel.addEventListener('change', () => { practitioner = pracSel.value; load(body); });

  body.appendChild(h('div', { class: 'filter-bar' },
    search, statusSel, rangeSel, pracSel,
    h('button', {
      class: 'btn btn-ghost btn-small', text: 'Clear',
      onClick: () => { q = ''; status = 'all'; range = 'upcoming'; practitioner = 'all'; load(body); },
    }),
  ));

  let data;
  try {
    data = await api(`/api/appointments?${params.toString()}`);
  } catch (e) {
    body.appendChild(errorCard(e));
    return;
  }

  body.appendChild(h('p', { class: 'card-sub', style: { marginBottom: '10px' }, text: `Showing ${data.appointments.length} booking${data.appointments.length === 1 ? '' : 's'}` }));

  if (!data.appointments.length) {
    body.appendChild(emptyState('◌', 'No appointments match these filters.'));
    return;
  }

  const wrap = h('div', { class: 'table-wrap' });
  const table = h('table', { class: 'data' },
    h('thead', {}, h('tr', {},
      ['When', 'Client', 'Service', 'Practitioner', 'Status', 'Source', ''].map(t => h('th', { text: t })),
    )),
    h('tbody', {}),
  );
  const tb = table.querySelector('tbody');

  for (const a of data.appointments) {
    const actions = h('div', { class: 'row-actions' });
    const quick = async (action, msg) => {
      try {
        await api(`/api/appointments/${a.id}/action`, { method: 'POST', body: { action } });
        toast(msg, 'success');
        load(body);
      } catch (e) { toast(e.message, 'error', 6000); }
    };
    if (a.status === 'pending') {
      actions.appendChild(h('button', {
        class: 'btn btn-primary btn-xs', text: 'Accept',
        onClick: () => quick('accept', `${a.code} confirmed — email sent.`),
      }));
    }
    if (a.status === 'confirmed') {
      actions.appendChild(h('button', {
        class: 'btn btn-gold btn-xs', text: 'Complete',
        onClick: () => quick('complete', `${a.code} completed.`),
      }));
    }
    actions.appendChild(h('button', {
      class: 'btn btn-outline btn-xs', text: 'Manage',
      onClick: () => openAppointmentModal(a, () => load(body)),
    }));

    tb.appendChild(h('tr', {},
      h('td', {},
        h('div', { class: 'cell-main', text: fmtDate(a.date) }),
        h('div', { class: 'cell-sub', text: timeRange(a.start, a.duration) }),
      ),
      h('td', {},
        h('div', { class: 'cell-main', text: a.clientName }),
        h('div', { class: 'cell-sub', text: `${a.clientCode} · ${a.clientPhone || a.clientEmail}` }),
      ),
      h('td', {},
        h('div', { class: 'cell-main', text: a.serviceName }),
        h('div', { class: 'cell-sub', text: `${a.duration} min · ${money(a.servicePrice)}` }),
      ),
      h('td', { text: a.practitioner }),
      h('td', {}, statusBadge(a.status), h('div', { class: 'cell-sub', text: a.code, style: { marginTop: '4px' } })),
      h('td', {}, h('span', { class: 'tag', text: a.source === 'website' ? 'Website' : 'Staff' })),
      h('td', {}, actions),
    ));
  }

  wrap.appendChild(table);
  body.appendChild(wrap);
}
