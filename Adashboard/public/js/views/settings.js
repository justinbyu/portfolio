/** Configurable business rules — approval mode, hours, lead time, roster. */
import { api } from '../api.js';
import {
  h, clear, pageHead, DOW_FULL, emptyState, errorCard, toast,
} from '../ui.js';

let settings = null;
let services = [];

export async function render(root) {
  root.appendChild(pageHead({
    kicker: 'Configuration',
    title: 'Settings',
    sub: 'Configurable business rules — enforced server-side on every booking',
  }));

  const body = h('div', {});
  root.appendChild(body);
  try {
    const [s, svc] = await Promise.all([api('/api/settings'), api('/api/services')]);
    settings = s.settings;
    services = svc.services;
  } catch (e) { body.appendChild(errorCard(e)); return; }

  /* ---- approval mode ---- */
  const modeManual = h('input', { type: 'radio', name: 'approval', value: 'manual' });
  const modeAuto = h('input', { type: 'radio', name: 'approval', value: 'auto' });
  modeManual.checked = settings.approvalMode === 'manual';
  modeAuto.checked = settings.approvalMode === 'auto';

  const choiceManual = h('label', { class: `choice${modeManual.checked ? ' on' : ''}` },
    modeManual,
    h('span', { class: 'c-title', text: 'Manual review' }),
    h('div', { class: 'c-sub', text: 'Every request waits in the pending queue for an explicit Accept or Decline.' }),
  );
  const choiceAuto = h('label', { class: `choice${modeAuto.checked ? ' on' : ''}` },
    modeAuto,
    h('span', { class: 'c-title', text: 'Auto-confirm eligible' }),
    h('div', { class: 'c-sub', text: 'Selected treatments confirm instantly and email the client without manual review.' }),
  );
  [modeManual, modeAuto].forEach(r => r.addEventListener('change', () => {
    choiceManual.classList.toggle('on', modeManual.checked);
    choiceAuto.classList.toggle('on', modeAuto.checked);
    chipsWrap.style.opacity = modeAuto.checked ? '1' : '0.45';
  }));

  const autoChecks = new Set(settings.autoConfirmServices || []);
  const chipsWrap = h('div', { class: 'check-chips', style: { opacity: modeAuto.checked ? '1' : '0.45' } },
    services.filter(s => s.active).map(s => {
      const cb = h('input', { type: 'checkbox' });
      cb.checked = autoChecks.has(s.id);
      if (!modeAuto.checked) cb.disabled = true;
      const lab = h('label', { class: cb.checked ? 'on' : '' }, cb, h('span', { text: s.name }));
      cb.addEventListener('change', () => lab.classList.toggle('on', cb.checked));
      modeAuto.addEventListener('change', () => { cb.disabled = !modeAuto.checked; });
      return lab;
    }),
  );

  /* ---- numeric rules ---- */
  const lead = h('input', { type: 'number', min: 0, max: 72, value: settings.leadTimeHours });
  const cancel = h('input', { type: 'number', min: 0, max: 720, value: settings.cancellationWindowHours });

  /* ---- business hours ---- */
  const hoursBox = h('div', {});
  const timeInputs = {};
  for (const wd of [1, 2, 3, 4, 5, 6, 0]) {
    const bh = settings.businessHours[wd];
    const open = h('input', { type: 'time', value: bh.open, disabled: bh.closed });
    const close = h('input', { type: 'time', value: bh.close, disabled: bh.closed });
    const closed = h('input', { type: 'checkbox' });
    closed.checked = bh.closed;
    closed.addEventListener('change', () => {
      open.disabled = closed.checked;
      close.disabled = closed.checked;
    });
    timeInputs[wd] = { open, close, closed };
    hoursBox.appendChild(h('div', { class: 'hours-row' },
      h('span', { class: 'day', text: DOW_FULL[wd] }),
      open,
      h('span', { class: 'muted', text: 'to' }),
      close,
      h('label', {}, closed, h('span', { text: 'Closed' })),
    ));
  }

  /* ---- practitioners ---- */
  const prac = h('input', { value: settings.practitioners.join(', '), placeholder: 'Comma-separated names' });

  const save = h('button', { class: 'btn btn-primary', text: 'Save settings' });

  body.appendChild(h('div', { class: 'settings-grid' },
    h('div', { class: 'card reveal' },
      h('div', { class: 'card-head' },
        h('div', {},
          h('h3', { class: 'card-title', text: 'Approval mode' }),
          h('p', { class: 'card-sub', text: 'Controls whether new requests need a human decision' }),
        ),
      ),
      h('div', { class: 'choice-row' }, choiceManual, choiceAuto),
      h('div', { class: 'section-label', text: 'Auto-confirm treatments' }),
      chipsWrap,
    ),

    h('div', { class: 'card reveal' },
      h('div', { class: 'card-head' },
        h('div', {},
          h('h3', { class: 'card-title', text: 'Booking rules' }),
          h('p', { class: 'card-sub', text: 'Validated on the server for every submission and change' }),
        ),
      ),
      h('label', { class: 'field', style: { marginBottom: '14px' } },
        h('span', { class: 'field-label', text: 'Minimum lead time before a slot' }),
        h('div', { class: 'num-stepper' }, lead, h('span', { class: 'unit', text: 'hours notice' })),
      ),
      h('label', { class: 'field' },
        h('span', { class: 'field-label', text: 'Cancellation window (late cancellations flagged)' }),
        h('div', { class: 'num-stepper' }, cancel, h('span', { class: 'unit', text: 'hours before the appointment' })),
      ),
    ),

    h('div', { class: 'card reveal' },
      h('div', { class: 'card-head' },
        h('div', {},
          h('h3', { class: 'card-title', text: 'Business hours' }),
          h('p', { class: 'card-sub', text: 'Bookings outside these windows are rejected' }),
        ),
      ),
      hoursBox,
    ),

    h('div', { class: 'card reveal' },
      h('div', { class: 'card-head' },
        h('div', {},
          h('h3', { class: 'card-title', text: 'Practitioners' }),
          h('p', { class: 'card-sub', text: 'Appears in booking forms and calendar filtering' }),
        ),
      ),
      h('label', { class: 'field' }, h('span', { class: 'field-label', text: 'Roster (comma-separated)' }), prac),
      h('div', { class: 'chip-list' },
        settings.practitioners.map(p => h('span', { class: 'tag', text: p })),
      ),
    ),
  ));

  body.appendChild(h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '18px' } }, save));

  save.addEventListener('click', async () => {
    const businessHours = {};
    for (const [wd, inputs] of Object.entries(timeInputs)) {
      businessHours[wd] = {
        open: inputs.open.value || '09:00',
        close: inputs.close.value || '18:00',
        closed: inputs.closed.checked,
      };
    }
    // chips were rendered in the same order as the active services list
    const active = services.filter(s => s.active);
    const checked = [...chipsWrap.querySelectorAll('input')];
    const ids = checked.map((cb, i) => (cb.checked ? active[i]?.id : null)).filter(Boolean);

    const payload = {
      approvalMode: modeAuto.checked ? 'auto' : 'manual',
      autoConfirmServices: ids,
      leadTimeHours: Number(lead.value),
      cancellationWindowHours: Number(cancel.value),
      businessHours,
      practitioners: prac.value.split(',').map(x => x.trim()).filter(Boolean),
    };

    save.disabled = true;
    save.textContent = 'Saving…';
    try {
      const r = await api('/api/settings', { method: 'PATCH', body: payload });
      settings = r.settings;
      toast('Settings saved — new rules apply to the next booking.', 'success');
      clear(root);
      render(root);
    } catch (e) {
      toast(e.message, 'error', 6000);
      save.disabled = false;
      save.textContent = 'Save settings';
    }
  });
}
