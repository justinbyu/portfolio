/** Clients — directory with profile, notes and appointment history. */
import { api } from '../api.js';
import {
  h, clear, pageHead, statusBadge, fmtDate, money, debounce, todayStr,
  initials, emptyState, errorCard, toast, timeRange, relTime, statusBadge as badge,
} from '../ui.js';
import { openBookingModal, openAppointmentModal } from '../booking.js';

let query = '';
let selectedId = null;

export async function render(root) {
  root.appendChild(pageHead({
    kicker: 'Records',
    title: 'Clients',
    sub: 'Profiles, contact details, care notes and appointment history',
    actions: [
      h('button', {
        class: 'btn btn-primary', text: '+ New booking',
        onClick: () => openBookingModal({ onChanged: refresh }),
      }),
    ],
  }));

  const layout = h('div', { class: 'clients-layout' });
  root.appendChild(layout);

  const listCard = h('div', { class: 'card reveal' },
    h('div', { class: 'card-head' },
      h('h3', { class: 'card-title', text: 'Directory' }),
    ),
  );
  const search = h('input', { type: 'search', placeholder: 'Search name, code, email, tag…', value: query });
  search.addEventListener('input', debounce(() => { query = search.value.trim(); loadList(listCard, detailCard); }, 300));
  listCard.appendChild(search);

  const list = h('div', { class: 'client-list', style: { marginTop: '12px' } });
  listCard.appendChild(list);

  const detailCard = h('div', { class: 'card reveal', });
  layout.appendChild(listCard);
  layout.appendChild(detailCard);

  await loadList(listCard, detailCard);
}

function refresh() {
  const root = document.getElementById('view');
  clear(root);
  render(root);
}

async function loadList(listCard, detailCard) {
  const list = listCard.querySelector('.client-list');
  clear(list);
  let data;
  try {
    data = await api(`/api/clients${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  } catch (e) {
    list.appendChild(errorCard(e));
    return;
  }
  if (!data.clients.length) {
    list.appendChild(emptyState('◌', 'No clients match that search.'));
    return;
  }
  if (selectedId == null || !data.clients.some(c => c.id === selectedId)) {
    selectedId = data.clients[0].id;
  }

  for (const c of data.clients) {
    const item = h('button', {
      class: `client-item${c.id === selectedId ? ' active' : ''}`,
      onClick: () => {
        selectedId = c.id;
        listCard.querySelectorAll('.client-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        loadDetail(detailCard);
      },
    },
      h('span', { class: 'avatar', text: initials(c.name) }),
      h('span', { style: { flex: 1, minWidth: 0 } },
        h('div', { class: 'ci-name', text: c.name }),
        h('div', { class: 'ci-meta', text: c.nextVisit ? `Next: ${fmtDate(c.nextVisit.date)} ${c.nextVisit.start}` : `${c.totalVisits} visit${c.totalVisits === 1 ? '' : 's'} · ${c.code}` }),
      ),
      (c.tags || []).slice(0, 1).map(t => h('span', { class: `tag ${t}`, text: t })),
    );
    list.appendChild(item);
  }
  await loadDetail(detailCard);
}

async function loadDetail(detailCard) {
  clear(detailCard);
  let data;
  try {
    data = await api(`/api/clients/${selectedId}`);
  } catch (e) {
    detailCard.appendChild(errorCard(e));
    return;
  }
  const c = data.client;
  const upcoming = data.appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const last = data.appointments.find(a => a.status === 'completed');

  detailCard.appendChild(h('div', { class: 'client-detail-head' },
    h('span', { class: 'avatar', text: initials(c.name) }),
    h('div', { style: { flex: 1 } },
      h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
        h('h2', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: '25px' }, text: c.name }),
        ...(c.tags || []).map(t => h('span', { class: `tag ${t}`, text: t.toUpperCase() })),
        h('span', { class: 'tag', text: c.code }),
      ),
      h('div', { class: 'muted tiny', style: { marginTop: '3px' }, text: `Client since ${relTime(c.createdAt)}` }),
    ),
    h('button', {
      class: 'btn btn-outline btn-small', text: '+ Booking for this client',
      onClick: () => openBookingModal({ prefill: { clientId: c.id }, onChanged: () => { loadDetail(detailCard); refreshListOnly(); } }),
    }),
  ));

  detailCard.appendChild(h('div', { class: 'detail-grid' },
    box('Email', c.email),
    box('Phone', c.phone || '—'),
    box('Completed visits', String(data.appointments.filter(a => a.status === 'completed').length)),
    box('Next visit', upcoming.length ? `${fmtDate(upcoming[0].date)} · ${upcoming[0].start}` : 'None scheduled'),
    box('Last completed', last ? `${fmtDate(last.date)} · ${last.serviceName}` : '—'),
  ));

  /* notes */
  const notes = h('textarea', { rows: 3, value: c.notes || '', placeholder: 'Operational / treatment-preference notes only — no diagnoses or sensitive records in this prototype.' });
  const saveBtn = h('button', {
    class: 'btn btn-primary btn-small', text: 'Save notes',
    onClick: async () => {
      try {
        await api(`/api/clients/${c.id}`, { method: 'PATCH', body: { notes: notes.value } });
        toast('Client notes saved.', 'success');
      } catch (e) { toast(e.message, 'error'); }
    },
  });
  detailCard.appendChild(h('div', { class: 'section-label', text: 'Care notes' }));
  detailCard.appendChild(h('div', {},
    notes,
    h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '8px' } }, saveBtn),
  ));

  /* history */
  detailCard.appendChild(h('div', { class: 'section-label', text: 'Appointment history' }));
  if (!data.appointments.length) {
    detailCard.appendChild(emptyState('◌', 'No appointments yet.'));
    return;
  }
  const tb = h('tbody', {});
  for (const a of data.appointments.slice(0, 12)) {
    tb.appendChild(h('tr', {},
      h('td', {},
        h('div', { class: 'cell-main', text: fmtDate(a.date) }),
        h('div', { class: 'cell-sub', text: timeRange(a.start, a.duration) }),
      ),
      h('td', { text: a.serviceName }),
      h('td', { text: a.practitioner }),
      h('td', { text: money(a.servicePrice) }),
      h('td', {}, statusBadge(a.status)),
      h('td', {}, h('div', { class: 'row-actions' },
        h('button', {
          class: 'btn btn-outline btn-xs', text: 'View',
          onClick: () => openAppointmentModal(a, () => loadDetail(detailCard)),
        }),
      )),
    ));
  }
  detailCard.appendChild(h('div', { class: 'table-wrap' },
    h('table', { class: 'data' },
      h('thead', {}, h('tr', {}, ['When', 'Service', 'Practitioner', 'Price', 'Status', ''].map(t => h('th', { text: t })))),
      tb,
    ),
  ));
}

function box(label, value) {
  return h('div', { class: 'detail-box' },
    h('div', { class: 'db-label', text: label }),
    h('div', { class: 'db-value', text: value }),
  );
}

async function refreshListOnly() {
  const listCard = document.querySelector('.clients-layout .card');
  const detailCard = document.querySelectorAll('.clients-layout .card')[1];
  if (listCard && detailCard) await loadList(listCard, detailCard);
}
