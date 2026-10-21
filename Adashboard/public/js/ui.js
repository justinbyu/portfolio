/** UI toolkit: DOM builder, formatting, toasts, modals, reveal animations. */

export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in e && typeof v !== 'object') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  const add = kid => {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) return kid.forEach(add);
    e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  };
  kids.forEach(add);
  return e;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

/* ---------------- formatting ---------------- */
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function partsOf(dateStr) { const [y, m, d] = dateStr.split('-').map(Number); return { y, m, d }; }
export function dowOf(dateStr) { const { y, m, d } = partsOf(dateStr); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); }
export function fmtDate(dateStr) { const { y, m, d } = partsOf(dateStr); return `${DOW[dowOf(dateStr)]}, ${d} ${MONTHS[m - 1]}`; }
export function fmtDateFull(dateStr) { const { y, m, d } = partsOf(dateStr); return `${DOW[dowOf(dateStr)]}, ${d} ${MONTHS[m - 1]} ${y}`; }
export function fmtDateSpoken(dateStr) { const { m, d } = partsOf(dateStr); return `${DOW_FULL[dowOf(dateStr)]}, ${MONTHS[m - 1]} ${d}`; }
export function todayStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function addDaysStr(dateStr, n) {
  const { y, m, d } = partsOf(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  const p = v => String(v).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}
export function toMin(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
export function fromMin(min) { const p = n => String(n).padStart(2, '0'); return `${p(Math.floor(min / 60) % 24)}:${p(Math.round(min) % 60)}`; }
export function timeRange(start, duration) { return `${start} – ${fromMin(toMin(start) + duration)}`; }
export function money(n) { return '₱' + Number(n || 0).toLocaleString('en-PH'); }

export function relTime(iso) {
  const diff = Date.now() - Date.parse(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'short' });
}
export function fmtTs(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-PH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
}
export function initials(name) {
  return String(name || '?').split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}
export function statusBadge(status) {
  const label = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', declined: 'Declined', cancelled: 'Cancelled' }[status] || status;
  return h('span', { class: `badge ${status}`, text: label });
}
export function debounce(fn, ms = 300) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ---------------- toasts ---------------- */
export function toast(message, type = 'info', ms = 4200) {
  const stack = document.getElementById('toast-stack');
  const el = h('div', { class: `toast ${type}` },
    h('span', { text: message }),
    h('button', {
      class: 't-close', text: '✕', type: 'button',
      onClick: () => el.remove(),
    }),
  );
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 260);
  }, ms);
  return el;
}

/* ---------------- modals ---------------- */
export function openModal({ title, sub, body, footer, wide = false, onClose } = {}) {
  const root = document.getElementById('modal-root');
  const backdrop = h('div', { class: 'modal-backdrop' });
  const close = () => {
    document.removeEventListener('keydown', onKey);
    backdrop.remove();
    if (onClose) onClose();
  };
  const onKey = e => { if (e.key === 'Escape') close(); };

  const modal = h('div', { class: `modal${wide ? ' wide' : ''}`, role: 'dialog', 'aria-modal': 'true' },
    h('div', { class: 'modal-head' },
      h('div', {},
        h('h2', { class: 'modal-title', text: title || '' }),
        sub ? h('p', { class: 'modal-sub', text: sub }) : null,
      ),
      h('button', { class: 'icon-btn', text: '✕', type: 'button', 'aria-label': 'Close', onClick: close }),
    ),
    h('div', { class: 'modal-body' }, body || null),
    footer ? h('div', { class: 'modal-foot' }, footer) : null,
  );
  backdrop.appendChild(modal);
  backdrop.addEventListener('mousedown', e => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);
  root.appendChild(backdrop);
  const focusable = modal.querySelector('input, select, textarea, button.btn-primary');
  if (focusable) setTimeout(() => focusable.focus(), 60);
  return { close, modal };
}

export function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = false, extra } = {}) {
  return new Promise(resolve => {
    const m = openModal({
      title,
      body: h('div', {},
        h('p', { text: message, style: { margin: '0 0 10px', color: 'var(--muted)' } }),
        extra || null,
      ),
      footer: [
        h('button', { class: 'btn btn-outline', text: 'Keep as is', onClick: () => { m.close(); resolve(false); } }),
        h('button', {
          class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, text: confirmLabel,
          onClick: () => { m.close(); resolve(true); },
        }),
      ],
    });
  });
}

/* ---------------- reveal-on-scroll ---------------- */
export function observeReveals(container) {
  const els = container.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  els.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 60, 320)}ms`;
    io.observe(el);
  });
}

export function pageHead({ kicker, title, sub, actions }) {
  return h('div', { class: 'page-head' },
    h('div', {},
      kicker ? h('p', { class: 'page-kicker', text: kicker }) : null,
      h('h1', { class: 'page-title', text: title }),
      sub ? h('p', { class: 'page-sub', text: sub }) : null,
    ),
    actions ? h('div', { class: 'page-actions' }, actions) : null,
  );
}

export function emptyState(big, text) {
  return h('div', { class: 'empty' }, h('div', { class: 'big', text: big }), h('div', { text }));
}

export function errorCard(err) {
  return h('div', { class: 'card' },
    h('div', { class: 'empty' },
      h('div', { class: 'big', text: '⚠' }),
      h('div', { text: err.message || String(err) }),
    ),
  );
}
