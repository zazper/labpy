import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

test('the build produces site/app.js', () => {
  const r = spawnSync(process.execPath, [path.join('scripts', 'build.js')], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, 'build failed (did you run npm install?):\n' + r.stderr + r.stdout);
  assert.match(r.stdout, /Built site\/app\.js/);
  const size = fs.statSync(path.join(ROOT, 'site', 'app.js')).size;
  assert.ok(size > 100_000, `site/app.js is only ${size} bytes; the bundle looks incomplete`);
});

test('the Ruff WebAssembly file was copied to site/ruff/', () => {
  const wasm = path.join(ROOT, 'site', 'ruff', 'ruff_wasm_bg.wasm');
  assert.ok(fs.existsSync(wasm), 'site/ruff/ruff_wasm_bg.wasm is missing: run "npm install @astral-sh/ruff-wasm-web" and then "npm run build"');
  assert.ok(fs.statSync(wasm).size > 500_000, 'the Ruff wasm file looks too small');
});

test('the bundle contains the tutorial and the tools', () => {
  const js = fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8');
  assert.ok(js.includes('tutorial/toc.json'), 'tutorial code is missing from the bundle');
  assert.ok(js.includes('ruff_wasm_bg.wasm'), 'Format and Check code is missing from the bundle');
});
