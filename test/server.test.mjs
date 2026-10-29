import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT } from './helpers.mjs';

let child, base;

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });
}

before(async () => {
  const port = await freePort();
  base = `http://localhost:${port}`;
  child = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  child.stderr.on('data', (d) => { log += d; });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not start within 10 s. Output: ' + log)), 10_000);
    child.stdout.on('data', (d) => { if (String(d).includes('running')) { clearTimeout(timer); resolve(); } });
    child.on('exit', (code) => { clearTimeout(timer); reject(new Error(`server exited early (${code}). Output: ${log}`)); });
  });
});

after(() => { if (child) child.kill(); });

const get = (p) => fetch(base + p);

test('the home page is served', async () => {
  const r = await get('/');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /LabPy/);
});

test('every page and file carries the COOP/COEP headers (needed for input())', async () => {
  for (const p of ['/', '/worker.js', '/style.css', '/tutorial/toc.json']) {
    const r = await get(p);
    assert.equal(r.status, 200, p);
    assert.equal(r.headers.get('cross-origin-opener-policy'), 'same-origin', `${p}: COOP header`);
    assert.equal(r.headers.get('cross-origin-embedder-policy'), 'require-corp', `${p}: COEP header`);
  }
});

test('the tutorial list and a topic are served', async () => {
  const toc = await (await get('/tutorial/toc.json')).json();
  assert.ok(toc.groups.length > 0);
  const first = toc.groups.flatMap((g) => g.topics).find((t) => t.file);
  const r = await get('/tutorial/' + first.file);
  assert.equal(r.status, 200);
  assert.ok((await r.text()).length > 50);
});

test('the built bundle is served', async () => {
  const r = await get('/app.js');
  assert.equal(r.status, 200, 'site/app.js is missing: run npm run build');
});

test('the Ruff wasm file is served with the right type', { skip: !fs.existsSync(path.join(ROOT, 'site', 'ruff', 'ruff_wasm_bg.wasm')) }, async () => {
  const r = await get('/ruff/ruff_wasm_bg.wasm');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type') || '', /wasm/);
});

test('an unknown path is a 404', async () => {
  assert.equal((await get('/no-such-file.txt')).status, 404);
});
