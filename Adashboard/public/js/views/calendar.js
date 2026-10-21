/** Calendar — day / week / month views with status filters. */
import { api } from '../api.js';
import {
  h, clear, pageHead, todayStr, addDaysStr, dowOf, partsOf, MONTHS, DOW,
  timeRange, emptyState, errorCard, fromMin, toMin, fmtDateFull,
} from '../ui.js';
import { openAppointmentModal, openBookingModal } from '../booking.js';

const HOUR_START = 8 * 60;      // 08:00
const HOUR_ROWS = 11;           // through 18:00 (row ends 19:00)
const ROW_H = 64;

let view = 'day';
let anchor = todayStr();
let statusFilter = 'all';

const STATUSES = [
  ['all', 'All'], ['pending', 'Pending'], ['confirmed', 'Confirmed'],
  ['completed', 'Completed'], ['declined', 'Declined'], ['cancelled', 'Cancelled'],
];

function weekStart(dateStr) {
  const dow = dowOf(dateStr);
  return addDaysStr(dateStr, -(dow === 0 ? 6 : dow - 1)); // Monday
}
function monthGridStart(dateStr) {
  const { y, m } = partsOf(dateStr);
  const first = `${y}-${String(m).padStart(2, '0')}-01`;
  return weekStart(first);
}

function rangeFor() {
  if (view === 'day') return [anchor, anchor];
  if (view === 'week') { const s = weekStart(anchor); return [s, addDaysStr(s, 6)]; }
  const s = monthGridStart(anchor);
  return [s, addDaysStr(s, 41)];
}

function labelFor() {
  if (view === 'day') return fmtDateFull(anchor);
  if (view === 'week') {
    const s = weekStart(anchor), e = addDaysStr(s, 6);
    const { m: m1, d: d1 } = partsOf(s);
    const { m: m2, d: d2, y } = partsOf(e);
    return m1 === m2 ? `${d1}–${d2} ${MONTHS[m2 - 1]} ${y}` : `${d1} ${MONTHS[m1 - 1]} – ${d2} ${MONTHS[m2 - 1]} ${y}`;
  }
  const { m, y } = partsOf(anchor);
  return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${y}`;
}

function step(dir) {
  if (view === 'day') anchor = addDaysStr(anchor, dir);
  else if (view === 'week') anchor = addDaysStr(anchor, 7 * dir);
  else {
    const { y, m } = partsOf(anchor);
    const nm = m + dir;
    const ny = y + Math.floor((nm - 1) / 12);
    const mm = ((nm - 1) % 12 + 12) % 12 + 1;
    anchor = `${ny}-${String(mm).padStart(2, '0')}-01`;
  }
}

function filtered(list) {
  return statusFilter === 'all' ? list : list.filter(a => a.status === statusFilter);
}

/* ---------------- event element ---------------- */
function eventEl(a, compact = false) {
  const top = ((toMin(a.start) - HOUR_START) / 60) * ROW_H;
  const height = Math.max(34, (a.duration / 60) * ROW_H - 6);
  return h('button', {
    class: `cal-event ${a.status}`,
    style: { top: `${top + 3}px`, height: `${height}px` },
    title: `${a.start} · ${a.clientName} · ${a.serviceName} (${a.status})`,
    onClick: e => { e.stopPropagation(); openAppointmentModal(a, refreshCb); },
  },
    h('div', { class: 'e-time', text: `${a.start} · ${a.status}` }),
    h('div', { class: 'e-name', text: a.clientName }),
    height > 54 ? h('div', { class: 'e-svc', text: a.serviceName }) : null,
  );
}

/* ---------------- grids ---------------- */
function hourGrid(days, settings, appts) {
  const cols = `58px repeat(${days.length}, 1fr)`;
  const wrap = h('div', {});
  wrap.appendChild(h('div', {
    class: 'week-head',
    style: { gridTemplateColumns: cols },
  },
    h('div', { class: 'wh', text: '' }),
    days.map(d => h('div', {
      class: `wh${d === todayStr() ? ' today' : ''}${settings.businessHours[dowOf(d)].closed ? ' closed-day' : ''}`,
    },
      h('div', { text: DOW[dowOf(d)] }),
      h('div', { class: 'num', text: String(partsOf(d).d) }),
    )),
  ));

  const grid = h('div', { class: 'hour-grid', style: { gridTemplateColumns: cols } });
  const gutter = h('div', { class: 'time-gutter' });
  for (let i = 0; i < HOUR_ROWS; i++) {
    gutter.appendChild(h('div', { class: 'h', text: fromMin(HOUR_START + i * 60) }));
  }
  grid.appendChild(gutter);

  for (const d of days) {
    const track = h('div', { class: 'track' });
    for (let i = 0; i < HOUR_ROWS; i++) {
      const hh = fromMin(HOUR_START + i * 60);
      track.appendChild(h('div', {
        class: 'slot',
        title: `New booking · ${d} ${hh}`,
        onClick: () => openBookingModal({ prefill: { date: d, start: hh }, onChanged: refreshCb }),
      }));
    }
    // closed-hours shading
    const bh = settings.businessHours[dowOf(d)];
    const trackH = HOUR_ROWS * ROW_H;
    if (bh.closed) {
      track.appendChild(h('div', { class: 'closed-shade', style: { top: 0, height: `${trackH}px` } }));
    } else {
      const openTop = Math.max(0, ((toMin(bh.open) - HOUR_START) / 60) * ROW_H);
      const closeTop = Math.min(trackH, ((toMin(bh.close) - HOUR_START) / 60) * ROW_H);
      if (openTop > 0) track.appendChild(h('div', { class: 'closed-shade', style: { top: 0, height: `${openTop}px` } }));
      if (closeTop < trackH) track.appendChild(h('div', { class: 'closed-shade', style: { top: `${closeTop}px`, height: `${trackH - closeTop}px` } }));
    }
    appts.filter(a => a.date === d).forEach(a => track.appendChild(eventEl(a)));
    grid.appendChild(track);
  }
  wrap.appendChild(grid);
  return wrap;
}

function monthGrid(appts) {
  const start = monthGridStart(anchor);
  const { y, m } = partsOf(anchor);
  const grid = h('div', { class: 'month-grid' });
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d =>
    grid.appendChild(h('div', { class: 'month-dow', text: d })));

  for (let i = 0; i < 42; i++) {
    const d = addDaysStr(start, i);
    const { m: dm, d: dd } = partsOf(d);
    const other = dm !== m;
    const cell = h('div', { class: `month-cell${other ? ' other' : ''}${d === todayStr() ? ' today' : ''}` },
      h('div', { class: 'mc-day', text: String(dd) }));
    const dayAppts = filtered(appts.filter(a => a.date === d))
      .sort((a, b) => a.start.localeCompare(b.start));
    dayAppts.slice(0, 3).forEach(a => cell.appendChild(h('button', {
      class: `mc-event ${a.status}`,
      text: `${a.start} ${a.clientName.split(' ')[0]} · ${a.serviceName.split(' ')[0]}`,
      title: `${a.start} · ${a.clientName} · ${a.serviceName}`,
      onClick: () => openAppointmentModal(a, refreshCb),
    })));
    if (dayAppts.length > 3) {
      cell.appendChild(h('div', {
        class: 'mc-more', text: `+${dayAppts.length - 3} more`,
        onClick: () => { anchor = d; view = 'day'; refreshCb(); },
      }));
    }
    cell.addEventListener('dblclick', () => openBookingModal({ prefill: { date: d }, onChanged: refreshCb }));
    grid.appendChild(cell);
  }
  return grid;
}

/* ---------------- render ---------------- */
let rootRef = null;
function refreshCb() { if (rootRef) { clear(rootRef); render(rootRef); } }

export async function render(root) {
  rootRef = root;
  const [from, to] = rangeFor();

  root.appendChild(pageHead({
    kicker: 'Scheduling',
    title: 'Calendar',
    sub: 'Click any empty slot to create a booking · click an event to manage it',
    actions: [
      h('button', {
        class: 'btn btn-primary', text: '+ New booking',
        onClick: () => openBookingModal({ onChanged: refreshCb }),
      }),
    ],
  }));

  /* toolbar */
  const label = h('div', { class: 'cal-label', text: labelFor() });
  const viewPills = h('div', { class: 'pill-group' },
    ...['day', 'week', 'month'].map(v => h('button', {
      text: v[0].toUpperCase() + v.slice(1),
      class: view === v ? 'active' : '',
      onClick: () => { view = v; refreshCb(); },
    })));
  const statusPills = h('div', { class: 'pill-group' },
    ...STATUSES.map(([v, t]) => h('button', {
      text: t,
      class: statusFilter === v ? 'active' : '',
      onClick: () => { statusFilter = v; refreshCb(); },
    })));

  root.appendChild(h('div', { class: 'cal-toolbar' },
    h('div', { class: 'cal-nav' },
      h('button', { text: '‹', 'aria-label': 'Previous', onClick: () => { step(-1); refreshCb(); } }),
      h('button', { class: 'btn btn-outline btn-small', text: 'Today', style: { width: 'auto', padding: '0 14px', height: '34px' }, onClick: () => { anchor = todayStr(); refreshCb(); } }),
      h('button', { text: '›', 'aria-label': 'Next', onClick: () => { step(1); refreshCb(); } }),
    ),
    label,
    viewPills,
    statusPills,
  ));

  /* body card */
  const card = h('div', { class: 'card cal-card reveal' });
  root.appendChild(card);
  card.appendChild(h('div', { class: 'empty', text: 'Loading schedule…' }));

  let data;
  try {
    data = await api(`/api/calendar?from=${from}&to=${to}`);
  } catch (e) {
    clear(card);
    card.appendChild(errorCard(e));
    return;
  }
  const appts = filtered(data.appointments);
  clear(card);

  if (!appts.length && statusFilter !== 'all') {
    card.appendChild(emptyState('◌', `No ${statusFilter} appointments in this range.`));
    return;
  }

  if (view === 'month') card.appendChild(monthGrid(data.appointments));
  else {
    const days = view === 'day' ? [anchor]
      : Array.from({ length: 7 }, (_, i) => addDaysStr(weekStart(anchor), i));
    card.appendChild(hourGrid(days, data, appts));
  }
}
