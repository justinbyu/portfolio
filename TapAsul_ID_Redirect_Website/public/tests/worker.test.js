import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import worker from '../worker/index.js';

globalThis.crypto ??= webcrypto;

class MemoryD1 {
  constructor() { this.rows = new Map(); }
  prepare(sql) { return new Statement(this, sql); }
}
class Statement {
  constructor(db, sql) { this.db = db; this.sql = sql; this.values = []; }
  bind(...values) { this.values = values; return this; }
  async all() { return { results: [...this.db.rows.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)) }; }
  async first() { return this.db.rows.get(this.values[0]) || null; }
  async run() {
    if (this.sql.startsWith('INSERT INTO routes')) {
      const [id, client_name, destination_url, status, created_at, updated_at] = this.values;
      const previous = this.db.rows.get(id);
      this.db.rows.set(id, { id, client_name, destination_url, status, created_at: previous?.created_at || created_at, updated_at });
      return { meta: { changes: 1 } };
    }
    if (this.sql.startsWith('DELETE')) return { meta: { changes: this.db.rows.delete(this.values[0]) ? 1 : 0 } };
    throw new Error(`Unimplemented mock query: ${this.sql}`);
  }
}

const env = { DB: new MemoryD1(), ADMIN_TOKEN: 'local-test-secret' };
const call = (path, { method = 'GET', token, body } = {}) => worker.fetch(new Request(`https://tapasul.test${path}`, {
  method,
  headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
}), env);

test('health check returns TapAsul service status', async () => {
  const response = await call('/api/health');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).service, 'TapAsul');
});

test('invalid and unknown client IDs do not redirect', async () => {
  assert.equal((await call('/r/bad%20id')).status, 400);
  assert.equal((await call('/r/missing')).status, 404);
});

test('admin endpoints require bearer authentication', async () => {
  assert.equal((await call('/api/admin/routes')).status, 401);
  assert.equal((await call('/api/admin/routes', { token: 'wrong' })).status, 401);
});

test('admin creates, updates, lists, disables, and deletes routes', async () => {
  const token = env.ADMIN_TOKEN;
  const route = { id: '42', client_name: 'Example', destination_url: 'https://example.com/card', status: 'active' };
  const create = await call('/api/admin/routes', { method: 'POST', token, body: route });
  assert.equal(create.status, 200);
  assert.equal((await create.json()).route.id, '42');
  const redirect = await call('/r/42');
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get('Location'), 'https://example.com/card');
  const update = await call('/api/admin/routes', { method: 'POST', token, body: { ...route, client_name: 'Updated', status: 'disabled' } });
  assert.equal(update.status, 200);
  const disabled = await call('/r/42');
  assert.equal(disabled.status, 410);
  const list = await call('/api/admin/routes', { token });
  assert.equal((await list.json()).routes[0].client_name, 'Updated');
  assert.equal((await call('/api/admin/routes/42', { method: 'DELETE', token })).status, 200);
  assert.equal((await call('/api/admin/routes/42', { method: 'DELETE', token })).status, 404);
});

test('admin input rejects unsafe IDs and destination URLs', async () => {
  const token = env.ADMIN_TOKEN;
  const base = { client_name: '', destination_url: 'https://example.org/card', status: 'active' };
  assert.equal((await call('/api/admin/routes', { method: 'POST', token, body: { ...base, id: 'bad id' } })).status, 400);
  for (const destination_url of ['javascript:alert(1)', 'https://user:pass@example.org', 'http://localhost/card', 'http://127.0.0.1/card', 'http://[::1]/card', 'https://[fd00::1]/card', 'not-a-url']) {
    const response = await call('/api/admin/routes', { method: 'POST', token, body: { ...base, id: 'safe-id', destination_url } });
    assert.equal(response.status, 400, destination_url);
  }
});
