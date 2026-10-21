/** Services menu + Brevo email / quota monitoring. */
import { api } from '../api.js';
import {
  h, clear, pageHead, money, emptyState, errorCard, toast, fmtTs, openModal,
} from '../ui.js';

let tab = 'services';
let mailFilter = 'all';

export async function render(root) {
  root.appendChild(pageHead({
    kicker: 'Operations',
    title: 'Services & Email',
    sub: 'Service menu, Brevo transactional logs and daily quota safeguards',
    actions: [
      h('div', { class: 'pill-group' },
        h('button', { text: 'Services', class: tab === 'services' ? 'active' : '', onClick: () => { tab = 'services'; refresh(); } }),
        h('button', { text: 'Brevo Email', class: tab === 'email' ? 'active' : '', onClick: () => { tab = 'email'; refresh(); } }),
      ),
    ],
  }));
  const body = h('div', {});
  root.appendChild(body);
  if (tab === 'services') await renderServices(body);
  else await renderEmail(body);
}

function refresh() {
  const root = document.getElementById('view');
  clear(root);
  render(root);
}

/* ------------------------------------------------ services tab */
async function renderServices(body) {
  let data;
  try {
    data = await Promise.all([
      api('/api/services'),
      api('/api/settings'),
    ]);
  } catch (e) { body.appendChild(errorCard(e)); return; }
  const [svcData, settings] = data;
  const autoSet = new Set(settings.settings.autoConfirmServices || []);

  const card = h('div', { class: 'card reveal' },
    h('div', { class: 'card-head' },
      h('div', {},
        h('h3', { class: 'card-title', text: 'Aesthetic service menu' }),
        h('p', { class: 'card-sub', text: 'Shown in booking forms · auto-confirm eligible when approval mode is on' }),
      ),
      h('button', { class: 'btn btn-primary btn-small', text: '+ Add service', onClick: () => openServiceForm(null, refresh) }),
    ),
  );

  const grid = h('div', { class: 'svc-grid' });
  for (const s of svcData.services) {
    grid.appendChild(h('div', { class: `svc-card${s.active ? '' : ' inactive'}` },
      h('div', { class: 'svc-top' },
        h('div', {},
          h('div', { class: 'svc-cat', text: s.category }),
          h('div', { class: 'svc-name', text: s.name }),
        ),
        autoSet.has(s.id) ? h('span', { class: 'badge gold', text: 'auto-confirm' }) : null,
      ),
      h('div', { class: 'svc-desc', text: s.description || '—' }),
      h('div', { class: 'svc-meta' },
        h('span', { class: 'svc-price', text: money(s.price) }),
        h('span', { class: 'muted', text: `${s.duration} min` }),
      ),
      h('div', { class: 'svc-actions' },
        h('button', { class: 'btn btn-outline btn-xs', text: 'Edit', onClick: () => openServiceForm(s, refresh) }),
        h('button', {
          class: 'btn btn-ghost btn-xs', text: s.active ? 'Deactivate' : 'Activate',
          onClick: async () => {
            try {
              await api(`/api/services/${s.id}`, { method: 'PATCH', body: { active: !s.active } });
              toast(`${s.name} ${s.active ? 'removed from' : 'added to'} the live menu.`, 'success');
              refresh();
            } catch (e) { toast(e.message, 'error'); }
          },
        }),
      ),
    ));
  }
  card.appendChild(grid);
  body.appendChild(card);
}

function openServiceForm(existing, onDone) {
  const isNew = !existing;
  const name = h('input', { value: existing ? existing.name : '', placeholder: 'e.g. HydraFacial Signature' });
  const category = h('input', { value: existing ? existing.category : '', placeholder: 'e.g. Facials' });
  const duration = h('input', { type: 'number', min: 15, max: 480, step: 15, value: existing ? existing.duration : 45 });
  const price = h('input', { type: 'number', min: 0, step: 100, value: existing ? existing.price : 2000 });
  const description = h('textarea', { rows: 2, placeholder: 'Short client-facing description', value: existing ? existing.description : '' });
  const active = h('input', { type: 'checkbox' });
  active.checked = existing ? existing.active : true;
  const err = h('div', { class: 'otp-error hidden' });

  const save = h('button', { class: 'btn btn-primary', text: isNew ? 'Add service' : 'Save changes' });
  const m = openModal({
    title: isNew ? 'Add service' : 'Edit service',
    sub: isNew ? 'New menu item — becomes bookable immediately.' : existing.name,
    body: h('div', { class: 'form-grid' },
      field('Service name', name),
      field('Category', category),
      field('Duration (minutes)', duration),
      field('Price (₱)', price),
      h('label', { class: 'field full' }, h('span', { class: 'field-label', text: 'Description' }), description),
      h('label', { class: 'field full', style: { flexDirection: 'row', alignItems: 'center', gap: '9px' } }, active, h('span', { text: 'Active (bookable)' })),
      h('div', { class: 'full' }, err),
    ),
    footer: [
      h('button', { class: 'btn btn-outline', text: 'Cancel', onClick: () => m.close() }),
      save,
    ],
  });

  save.addEventListener('click', async () => {
    err.classList.add('hidden');
    save.disabled = true;
    const payload = {
      name: name.value.trim(), category: category.value.trim() || 'Other',
      duration: Number(duration.value), price: Number(price.value),
      description: description.value.trim(), active: active.checked,
    };
    try {
      if (isNew) await api('/api/services', { method: 'POST', body: payload });
      else await api(`/api/services/${existing.id}`, { method: 'PATCH', body: payload });
      m.close();
      toast(isNew ? 'Service added to the menu.' : 'Service updated.', 'success');
      onDone && onDone();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove('hidden');
      save.disabled = false;
    }
  });
}

function field(label, input) {
  return h('label', { class: 'field' }, h('span', { class: 'field-label', text: label }), input);
}

/* ------------------------------------------------ email tab */
async function renderEmail(body) {
  let emailsData;
  try {
    emailsData = await Promise.all([
      api('/api/emails?limit=60'),
      api('/api/stats'),
    ]);
  } catch (e) { body.appendChild(errorCard(e)); return; }
  const [emailsResp, stats] = emailsData;
  const quota = emailsResp.quota;

  const tiles = h('div', { class: 'quota-grid' },
    tile('Daily quota', String(quota.limit), 'emails / day'),
    tile('Sent today', String(quota.sent), `${quota.pct}% of capacity used`),
    tile('Remaining', String(quota.remaining), quota.capacityLabel),
    tile('Failed', String(quota.failed), quota.failed ? 'requires review' : 'all deliveries healthy', quota.failed ? 'danger' : ''),
  );
  if (quota.otpReserveActive) tiles.appendChild(tile('OTP reserve', 'ON', 'non-OTP mail held', 'gold'));

  const card = h('div', { class: 'card reveal' },
    h('div', { class: 'card-head' },
      h('div', {},
        h('h3', { class: 'card-title', text: 'Brevo quota monitoring & safeguards' }),
        h('p', { class: 'card-sub', text: 'Real-time counter · alerts at 70% / 85% / 95% · OTP priority reserve below 10%' }),
      ),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('button', {
          class: 'btn btn-outline btn-small', text: '⚡ Simulate reminder batch',
          onClick: async () => {
            try {
              const r = await api('/api/emails/batch', { method: 'POST', body: { count: 20 } });
              const parts = Object.entries(r.results).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`);
              toast(`Batch processed: ${parts.join(', ') || 'nothing to send'}.`, r.results.held ? 'error' : 'success', 5200);
              refresh();
            } catch (e) { toast(e.message, 'error'); }
          },
        }),
        h('button', {
          class: 'btn btn-ghost btn-small', text: 'Reset quota (demo)',
          onClick: async () => {
            try {
              await api('/api/quota/reset', { method: 'POST', body: {} });
              toast('Daily quota reset for the demo.', 'success');
              refresh();
            } catch (e) { toast(e.message, 'error'); }
          },
        }),
      ),
    ),
    tiles,
  );

  /* meter with thresholds */
  const pct = quota.pct;
  const fillClass = pct >= 95 ? 'crit' : pct >= 70 ? 'warn' : '';
  card.appendChild(h('div', { class: 'quota-meter' },
    h('div', { class: 'qm-track' },
      h('div', { class: `qm-fill ${fillClass}`, style: { width: `${Math.min(100, pct)}%` } }),
      [70, 85, 95].map(t => h('div', { class: 'qm-mark', style: { left: `${t}%` } }, h('span', { text: `${t}%` }))),
    ),
    h('div', { class: 'quota-legend' },
      h('span', { text: `0 · ${quota.sent} sent` }),
      h('span', { text: `capacity alerts fire automatically above each marker` }),
      h('span', { text: `${quota.limit}` }),
    ),
  ));

  /* alerts active now */
  if (stats.alerts.length) {
    const box = h('div', { class: 'alert-list', style: { marginTop: '16px' } });
    stats.alerts.forEach(a => box.appendChild(h('div', { class: `alert-item ${a.level}` },
      h('span', { class: 'alert-ico', text: a.level === 'critical' ? '⛔' : a.level === 'warn' ? '▲' : 'ⓘ' }),
      h('div', {},
        h('div', { class: 'alert-title', text: a.title }),
        h('div', { class: 'alert-detail', text: a.detail }),
      ),
    )));
    card.appendChild(box);
  }

  body.appendChild(card);

  /* email log */
  const logCard = h('div', { class: 'card reveal' },
    h('div', { class: 'card-head' },
      h('div', {},
        h('h3', { class: 'card-title', text: 'Email log' }),
        h('p', { class: 'card-sub', text: 'Most recent transactional messages — OTP, confirmations, reminders, alerts' }),
      ),
      h('div', { class: 'pill-group' },
        ...[['all', 'All'], ['failed', 'Failed'], ['held', 'Held']].map(([v, t]) =>
          h('button', {
            text: t, class: mailFilter === v ? 'active' : '',
            onClick: () => { mailFilter = v; refresh(); },
          })),
      ),
    ),
  );

  let rows = emailsResp.emails;
  if (mailFilter !== 'all') rows = rows.filter(e => e.status === mailFilter);
  if (!rows.length) {
    logCard.appendChild(emptyState('✉', `No ${mailFilter === 'all' ? '' : mailFilter + ' '}emails in the log.`));
  } else {
    const tb = h('tbody', {});
    for (const e of rows.slice(0, 40)) {
      tb.appendChild(h('tr', {},
        h('td', { class: 'cell-sub', text: fmtTs(e.ts) }),
        h('td', {},
          h('div', { class: 'cell-main', text: e.toName || e.to }),
          h('div', { class: 'cell-sub', text: e.to }),
        ),
        h('td', {}, h('span', { class: 'tag', text: e.template.replace(/_/g, ' ') })),
        h('td', {}, h('div', { class: 'cell-main', text: e.subject }), e.error ? h('div', { class: 'cell-sub', text: e.error }) : null),
        h('td', {}, h('span', { class: `mail-status ${e.status}`, text: e.status.toUpperCase() })),
      ));
    }
    logCard.appendChild(h('div', { class: 'table-wrap' },
      h('table', { class: 'data' },
        h('thead', {}, h('tr', {}, ['Time', 'Recipient', 'Template', 'Subject', 'Status'].map(t => h('th', { text: t })))),
        tb,
      ),
    ));
  }
  body.appendChild(logCard);
}

function tile(label, value, note, mod = '') {
  return h('div', { class: `quota-tile ${mod}` },
    h('div', { class: 'qt-label', text: label }),
    h('div', { class: 'qt-value', text: value }),
    h('div', { class: 'qt-note', text: note }),
  );
}
