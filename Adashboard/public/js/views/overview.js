/** Overview — KPI cards, pending approvals, alerts, recent activity. */
import { api } from '../api.js';
import {
  h, clear, pageHead, todayStr, fmtDateFull, money, relTime, statusBadge,
  emptyState, errorCard, toast, timeRange,
} from '../ui.js';
import { openBookingModal, openAppointmentModal } from '../booking.js';

const HUMAN = a => a.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function kpi({ label, value, note, gold, bar }) {
  return h('div', { class: `card kpi reveal${gold ? ' gold' : ''}` },
    h('div', { class: 'kpi-accent' + (gold ? ' gold' : '') }),
    h('div', { class: 'kpi-label', text: label }),
    h('div', { class: 'kpi-value', text: value }),
    note ? h('div', { class: 'kpi-note', html: note }) : null,
    bar ? h('div', { class: 'mini-bar' }, h('span', {
      style: { width: `${Math.min(100, bar.pct)}%` },
      class: bar.pct >= 95 ? 'crit' : bar.pct >= 70 ? 'warn' : '',
    })) : null,
  );
}

export async function render(root) {
  const today = todayStr();
  let stats, pending, audit;
  try {
    [stats, pending, audit] = await Promise.all([
      api(`/api/stats?date=${today}`),
      api(`/api/appointments?status=pending&from=${today}&order=asc`),
      api('/api/audit?limit=9'),
    ]);
  } catch (e) {
    root.appendChild(errorCard(e));
    return;
  }

  const refresh = () => { clear(root); render(root); };
  const k = stats.kpis;

  root.appendChild(pageHead({
    kicker: 'Clinic Operations',
    title: 'Overview',
    sub: `${fmtDateFull(today)} · daily KPIs, approvals and system health`,
    actions: [
      h('button', { class: 'btn btn-outline', text: '↻ Refresh', onClick: refresh }),
      h('button', {
        class: 'btn btn-primary', text: '+ New booking',
        onClick: () => openBookingModal({ onChanged: refresh }),
      }),
    ],
  }));

  /* ---- KPI row ---- */
  root.appendChild(h('div', { class: 'grid kpi-grid' },
    kpi({
      label: "Today's appointments",
      value: String(k.appointmentsToday),
      note: `<strong>${k.confirmed}</strong> confirmed · <strong>${k.pendingToday}</strong> awaiting approval`,
    }),
    kpi({
      label: 'Pending approvals',
      value: String(k.pendingTotal),
      note: k.pendingTotal ? 'Requests need a decision' : 'All caught up ✦',
      gold: k.pendingTotal > 0,
    }),
    kpi({
      label: 'Completed today',
      value: String(k.completed),
      note: k.revenue ? `<strong>${money(k.revenue)}</strong> revenue` : 'No revenue logged yet',
    }),
    kpi({
      label: 'Emails sent today',
      value: String(k.emailsSent),
      note: `<strong>${k.capacityRemaining}</strong> of ${k.quotaLimit} remaining${k.emailsFailed ? ` · <strong>${k.emailsFailed}</strong> failed` : ''}`,
      bar: { pct: k.quotaPct },
    }),
  ));

  /* ---- pending + right column ---- */
  const pendingCard = h('div', { class: 'card reveal' },
    h('div', { class: 'card-head' },
      h('div', {},
        h('h3', { class: 'card-title', text: 'Pending booking approvals' }),
        h('p', { class: 'card-sub', text: 'Accept sends a Brevo confirmation · Decline attaches a client-facing note' }),
      ),
      h('a', { class: 'link-btn', href: '#/appointments', text: 'View all →' }),
    ),
  );

  if (!pending.appointments.length) {
    pendingCard.appendChild(emptyState('✦', 'No bookings waiting for approval.'));
  } else {
    const list = h('div', { class: 'pending-list' });
    for (const a of pending.appointments.slice(0, 6)) {
      list.appendChild(h('div', { class: 'pending-row' },
        h('div', { class: 'pending-when' },
          h('div', { class: 'd', text: a.date === today ? 'Today' : a.date.slice(5).replace('-', '/') }),
          h('div', { class: 't', text: a.start }),
        ),
        h('div', { class: 'pending-who' },
          h('div', { class: 'n', text: a.clientName }),
          h('div', { class: 's', text: `${a.serviceName} · ${a.practitioner}` }),
        ),
        h('div', { class: 'pending-actions' },
          h('button', {
            class: 'btn btn-primary btn-xs', text: 'Accept',
            onClick: async () => {
              try {
                await api(`/api/appointments/${a.id}/action`, { method: 'POST', body: { action: 'accept' } });
                toast(`${a.code} confirmed — confirmation email sent.`, 'success');
                refresh();
              } catch (e) { toast(e.message, 'error'); }
            },
          }),
          h('button', {
            class: 'btn btn-outline btn-xs', text: 'Decline',
            onClick: () => openAppointmentModal(a, refresh),
          }),
          h('button', {
            class: 'btn btn-ghost btn-xs', text: 'Details',
            onClick: () => openAppointmentModal(a, refresh),
          }),
        ),
      ));
    }
    pendingCard.appendChild(list);
  }

  /* alerts */
  const alertsCard = h('div', { class: 'card reveal' },
    h('div', { class: 'card-head' },
      h('h3', { class: 'card-title', text: 'Alerts' }),
      h('span', { class: 'tag', text: `${stats.alerts.length} active` }),
    ),
  );
  if (!stats.alerts.length) {
    alertsCard.appendChild(emptyState('✓', 'All systems nominal — no active alerts.'));
  } else {
    const icons = { critical: '⛔', warn: '▲', info: 'ⓘ' };
    const box = h('div', { class: 'alert-list' });
    stats.alerts.forEach((a, i) => {
      const el = h('div', { class: `alert-item ${a.level}`, style: { animationDelay: `${i * 70}ms` } },
        h('span', { class: 'alert-ico', text: icons[a.level] || 'ⓘ' }),
        h('div', {},
          h('div', { class: 'alert-title', text: a.title }),
          h('div', { class: 'alert-detail', text: a.detail }),
        ),
      );
      box.appendChild(el);
    });
    alertsCard.appendChild(box);
  }

  /* activity */
  const actCard = h('div', { class: 'card reveal' },
    h('div', { class: 'card-head' },
      h('h3', { class: 'card-title', text: 'Recent activity' }),
      h('span', { class: 'card-sub', text: 'immutable audit trail' }),
    ),
    audit.entries.length
      ? h('ul', { class: 'activity' }, audit.entries.map(e => h('li', {},
          h('div', { class: 'a-title', text: HUMAN(e.action) }),
          h('div', { class: 'a-meta', text: e.detail }),
          h('div', { class: 'a-time', text: `${e.actor} · ${relTime(e.ts)}` }),
        )))
      : emptyState('◌', 'No activity recorded yet.'),
  );

  root.appendChild(h('div', { class: 'grid two-col', style: { marginTop: '18px', alignItems: 'start' } },
    h('div', {}, pendingCard),
    h('div', { class: 'grid', style: { gap: '18px' } }, alertsCard, actCard),
  ));
}
