/** App shell: OTP login, router, header, demo inbox. */
import { api, getSession, setSession, clearSession } from './api.js';
import { h, toast, clear, observeReveals, todayStr } from './ui.js';
import * as overview from './views/overview.js';
import * as calendar from './views/calendar.js';
import * as appointments from './views/appointments.js';
import * as clients from './views/clients.js';
import * as services from './views/services.js';
import * as settings from './views/settings.js';

const views = { overview, calendar, appointments, clients, services, settings };
const $ = id => document.getElementById(id);

let pendingEmail = '';
let drawerOpen = false;

/* ================================================================ LOGIN */
function showLogin() {
  $('app').classList.add('hidden');
  $('login-screen').classList.remove('hidden');
  $('otp-code-step').classList.add('hidden');
  $('otp-email-step').classList.remove('hidden');
  $('otp-error').classList.add('hidden');
  $('otp-code').value = '';
}

function showLoginCodeStep(masked) {
  $('otp-email-step').classList.add('hidden');
  $('otp-code-step').classList.remove('hidden');
  $('otp-sent-label').innerHTML = '';
  $('otp-sent-label').append('We sent a code to ', h('strong', { text: masked }));
  $('otp-error').classList.add('hidden');
  setTimeout(() => $('otp-code').focus(), 80);
}

function loginError(msg) {
  const el = $('otp-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

async function sendCode(email) {
  try {
    const r = await api('/api/auth/request-otp', { method: 'POST', body: { email } });
    pendingEmail = email;
    showLoginCodeStep(r.masked);
    toast(`Code sent (demo) — open the inbox to read it.`, 'success');
    openDrawer();
    updateInboxBadge();
  } catch (e) {
    loginError(e.message);
  }
}

function wireLogin() {
  $('otp-email-step').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('otp-email').value.trim().toLowerCase();
    if (!email) return loginError('Enter your email address.');
    $('btn-send-code').disabled = true;
    $('btn-send-code').textContent = 'Sending…';
    sendCode(email).finally(() => {
      $('btn-send-code').disabled = false;
      $('btn-send-code').textContent = 'Send me a code';
    });
  });

  $('btn-demo-fill').addEventListener('click', () => {
    $('otp-email').value = 'admin@allanese.clinic';
    $('otp-email-step').requestSubmit();
  });

  $('otp-code-step').addEventListener('submit', async e => {
    e.preventDefault();
    const code = $('otp-code').value.trim();
    if (code.length !== 6) return loginError('Enter the 6-digit code.');
    $('btn-verify').disabled = true;
    $('btn-verify').textContent = 'Verifying…';
    try {
      const r = await api('/api/auth/verify-otp', {
        method: 'POST',
        body: { email: pendingEmail, code },
      });
      setSession(r);
      await enterApp();
      toast('Welcome back — signed in securely.', 'success');
    } catch (err) {
      loginError(err.message);
    } finally {
      $('btn-verify').disabled = false;
      $('btn-verify').textContent = 'Verify & sign in';
    }
  });

  $('btn-back-email').addEventListener('click', () => {
    $('otp-code-step').classList.add('hidden');
    $('otp-email-step').classList.remove('hidden');
    $('otp-error').classList.add('hidden');
  });

  $('btn-resend').addEventListener('click', () => sendCode(pendingEmail));
  $('btn-open-inbox-login').addEventListener('click', openDrawer);
}

/* ================================================================ DRAWER */
async function fetchInbox() {
  const r = await api('/api/auth/inbox');
  const list = $('drawer-list');
  clear(list);
  if (!r.messages.length) {
    list.appendChild(h('div', { class: 'empty', text: 'No messages yet.' }));
    return r.messages;
  }
  for (const m of r.messages) {
    const when = new Date(m.ts).toLocaleString('en-PH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
    const card = h('div', { class: `mail-card${m.code ? ' otp' : ''}` },
      h('div', { class: 'm-top' }, h('span', { text: m.template.replace(/_/g, ' ') }), h('span', { text: when })),
      h('div', { class: 'm-subject', text: m.subject }),
      h('div', { class: 'm-to', text: `to ${m.to} · ${m.status}` }),
      m.code
        ? h('div', {
            class: 'm-code', text: m.code, title: 'Click to use this code',
            onClick: () => {
              $('otp-code').value = m.code;
              $('otp-code-step').classList.remove('hidden');
              $('otp-code').focus();
              toast('Code filled in — hit “Verify & sign in”.', 'success');
            },
          })
        : null,
    );
    list.appendChild(card);
  }
  localStorage.setItem('allanese.inbox.seen', String(Date.now()));
  return r.messages;
}

async function openDrawer() {
  drawerOpen = true;
  $('drawer').classList.remove('hidden');
  $('drawer-backdrop').classList.remove('hidden');
  try { await fetchInbox(); } catch { /* ignore */ }
  updateInboxBadge();
}
function closeDrawer() {
  drawerOpen = false;
  $('drawer').classList.add('hidden');
  $('drawer-backdrop').classList.add('hidden');
}
async function updateInboxBadge() {
  try {
    const r = await api('/api/auth/inbox');
    const seen = Number(localStorage.getItem('allanese.inbox.seen') || 0);
    const fresh = r.messages.some(m => Date.parse(m.ts) > seen);
    $('inbox-badge').classList.toggle('hidden', !fresh);
    return fresh;
  } catch { return false; }
}

function wireDrawer() {
  $('inbox-btn').addEventListener('click', () => (drawerOpen ? closeDrawer() : openDrawer()));
  $('drawer-close').addEventListener('click', closeDrawer);
  $('drawer-backdrop').addEventListener('click', closeDrawer);
  $('drawer-refresh').addEventListener('click', () => fetchInbox().catch(() => {}));
}

/* ================================================================ HEADER */
async function refreshQuota() {
  try {
    const { quota } = await api('/api/quota');
    $('quota-chip-text').textContent = `Brevo · ${quota.sent}/${quota.limit}`;
    const dot = $('quota-dot');
    dot.classList.toggle('warn', quota.pct >= 70 && quota.pct < 95);
    dot.classList.toggle('crit', quota.pct >= 95);
    $('quota-chip').title = `${quota.pct}% of daily capacity used · ${quota.remaining} remaining`;
  } catch { /* silent */ }
}

function wireHeader() {
  $('logout-btn').addEventListener('click', async () => {
    try { await api('/api/auth/logout', { method: 'POST', body: {} }); } catch { /* ignore */ }
    clearSession();
    showLogin();
    toast('Signed out.');
  });
  $('quota-chip').addEventListener('click', () => { location.hash = '#/services'; });
  $('menu-toggle').addEventListener('click', () => {
    const nav = $('nav-pills');
    nav.classList.toggle('open');
    $('menu-toggle').setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });
}

/* ================================================================ ROUTER */
async function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const name = views[hash] ? hash : 'overview';
  document.querySelectorAll('.nav-pills a').forEach(a =>
    a.classList.toggle('active', a.dataset.route === name));
  $('settings-btn').style.background = name === 'settings' ? 'var(--lav-50)' : '';
  $('nav-pills').classList.remove('open');

  const view = $('view');
  clear(view);
  view.classList.remove('anim-rise');
  void view.offsetWidth; // reflow to restart animation
  view.classList.add('anim-rise');
  try {
    await views[name].render(view);
    observeReveals(view);
  } catch (e) {
    view.appendChild(h('div', { class: 'card' },
      h('div', { class: 'empty' },
        h('div', { class: 'big', text: '⚠' }),
        h('div', { text: e.message || 'Failed to load this section.' }),
      )));
  }
  refreshQuota();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ================================================================ BOOT */
async function enterApp() {
  $('login-screen').classList.add('hidden');
  $('app').classList.remove('hidden');
  const s = getSession();
  $('user-email').textContent = s ? s.email : '';
  $('user-avatar').textContent = (s && s.email ? s.email[0] : 'A').toUpperCase();
  if (!location.hash || location.hash === '#/') {
    location.hash = '#/overview'; // hashchange listener triggers the first route()
  } else {
    await route();
  }
  updateInboxBadge();
}

async function boot() {
  wireLogin();
  wireDrawer();
  wireHeader();
  window.addEventListener('hashchange', route);
  window.addEventListener('session-expired', () => {
    showLogin();
    toast('Session expired — please sign in again.', 'error');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawerOpen) closeDrawer();
  });

  const s = getSession();
  if (s && s.token) {
    try {
      await api('/api/me');
      await enterApp();
    } catch {
      clearSession();
      showLogin();
    }
  } else {
    showLogin();
  }

  setInterval(() => {
    if (document.visibilityState === 'visible' && getSession()) {
      refreshQuota();
      if (drawerOpen) fetchInbox().catch(() => {});
    }
  }, 45000);
}

boot();
