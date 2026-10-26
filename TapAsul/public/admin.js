(() => {
  const $ = (selector) => document.querySelector(selector);
  const authPanel = $('#auth-panel');
  const dashboard = $('#dashboard');
  const authForm = $('#auth-form');
  const tokenInput = $('#admin-token');
  const notice = $('#notice');
  const body = $('#routes-body');
  const routeForm = $('#route-form');
  const routeId = $('#route-id');
  const clientName = $('#client-name');
  const destination = $('#destination-url');
  const status = $('#route-status');
  const logoutButton = $('#logout-button');
  const cancelEdit = $('#cancel-edit');
  let token = '';
  let routes = [];
  let editingId = null;
  let noticeTimer;

  function showNotice(message, type = 'success') {
    clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.className = `notice show ${type}`;
    noticeTimer = setTimeout(() => { notice.className = 'notice'; }, 6500);
  }
  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
    return data;
  }
  function escapeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }
  function renderRoutes() {
    if (!routes.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty-state">No routes yet. Use the form above to add the first Client ID.</td></tr>';
      return;
    }
    body.innerHTML = routes.map((route) => {
      const safeUrl = escapeText(route.destination_url);
      const encodedId = encodeURIComponent(route.id);
      return `<tr>
        <td class="client-cell">${escapeText(route.client_name || '—')}</td>
        <td><span class="id-code">${escapeText(route.id)}</span></td>
        <td><a class="destination" href="${safeUrl}" target="_blank" rel="noopener noreferrer" title="${safeUrl}">${safeUrl}</a></td>
        <td><span class="status-badge ${route.status === 'active' ? 'active' : 'disabled'}">${route.status === 'active' ? 'Active' : 'Disabled'}</span></td>
        <td>${escapeText(new Date(route.updated_at).toLocaleString())}</td>
        <td><div class="actions"><button type="button" class="action-button" data-action="edit" data-id="${escapeText(route.id)}">Edit</button><button type="button" class="action-button delete" data-action="delete" data-id="${escapeText(route.id)}" aria-label="Delete route ${escapeText(route.id)}">Delete</button></div></td>
      </tr>`;
    }).join('');
  }
  async function loadRoutes() {
    const result = await api('/api/admin/routes');
    routes = result.routes;
    renderRoutes();
  }
  function setSignedIn(value) {
    authPanel.classList.toggle('hidden', value);
    dashboard.classList.toggle('hidden', !value);
    logoutButton.classList.toggle('hidden', !value);
  }
  function resetForm() {
    routeForm.reset();
    routeId.disabled = false;
    editingId = null;
    $('#form-title').textContent = 'Add a client route';
    $('#save-button').innerHTML = 'Save route <span aria-hidden="true">→</span>';
    cancelEdit.classList.add('hidden');
  }
  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    token = tokenInput.value;
    try {
      await loadRoutes();
      setSignedIn(true);
      tokenInput.value = '';
      showNotice('Signed in. Route data loaded from Cloudflare D1.');
    } catch (error) {
      token = '';
      showNotice(error.message || 'Sign-in failed. Check the token and try again.', 'error');
      tokenInput.focus();
    }
  });
  logoutButton.addEventListener('click', () => {
    token = '';
    routes = [];
    resetForm();
    setSignedIn(false);
    tokenInput.value = '';
    showNotice('You have been logged out. The token was cleared from memory.');
    tokenInput.focus();
  });
  $('#refresh-button').addEventListener('click', async () => {
    try { await loadRoutes(); showNotice('Route list refreshed.'); }
    catch (error) { showNotice(error.message, 'error'); }
  });
  routeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const record = {
      id: routeId.value.trim(),
      client_name: clientName.value.trim(),
      destination_url: destination.value.trim(),
      status: status.value
    };
    const button = $('#save-button');
    button.disabled = true;
    try {
      await api('/api/admin/routes', { method: 'POST', body: JSON.stringify(record) });
      await loadRoutes();
      showNotice(editingId ? `Client ID ${record.id} updated.` : `Client ID ${record.id} saved.`);
      resetForm();
    } catch (error) { showNotice(error.message, 'error'); }
    finally { button.disabled = false; }
  });
  cancelEdit.addEventListener('click', resetForm);
  body.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    const route = routes.find((item) => item.id === id);
    if (!route) return;
    if (button.dataset.action === 'edit') {
      editingId = id;
      routeId.value = route.id;
      routeId.disabled = true;
      clientName.value = route.client_name;
      destination.value = route.destination_url;
      status.value = route.status;
      $('#form-title').textContent = `Edit route ${route.id}`;
      $('#save-button').innerHTML = 'Save changes <span aria-hidden="true">→</span>';
      cancelEdit.classList.remove('hidden');
      routeForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      clientName.focus();
      return;
    }
    if (button.dataset.action === 'delete' && window.confirm(`Delete the route for Client ID “${id}”? This cannot be undone.`)) {
      button.disabled = true;
      try {
        await api(`/api/admin/routes/${encodeURIComponent(id)}`, { method: 'DELETE' });
        await loadRoutes();
        if (editingId === id) resetForm();
        showNotice(`Client ID ${id} was deleted.`);
      } catch (error) { showNotice(error.message, 'error'); button.disabled = false; }
    }
  });
})();
