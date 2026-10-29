import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, read } from './helpers.mjs';

const html = read('site', 'index.html');
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

test('every element id used by the code exists in index.html', () => {
  // This catches the "blank page after an update" problem: new code and old HTML (or the reverse).
  for (const file of ['src/app.js', 'src/tutorial.js']) {
    const src = read(...file.split('/'));
    const used = new Set([...src.matchAll(/\$\('([A-Za-z0-9_-]+)'\)/g)].map((m) => m[1]));
    for (const id of used) assert.ok(htmlIds.has(id), `${file} uses #${id} but index.html has no such id`);
  }
});

test('index.html references files that exist', () => {
  for (const ref of [...html.matchAll(/(?:src|href)="([^"#?]+)"/g)].map((m) => m[1])) {
    if (/^https?:/.test(ref)) continue;
    if (ref === 'app.js') continue;               // built by npm run build
    assert.ok(fs.existsSync(path.join(ROOT, 'site', ref)), `index.html references missing file ${ref}`);
  }
});

test('index.html ids are unique', () => {
  const all = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(all.length, new Set(all).size, 'duplicate ids: ' + all.filter((x, i) => all.indexOf(x) !== i).join(', '));
});

test('plain JavaScript files have valid syntax', () => {
  for (const f of ['site/worker.js', 'scripts/build.js', 'scripts/release.js', 'server.js']) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    const r = spawnSync(process.execPath, ['--check', path.join(ROOT, f)], { encoding: 'utf8' });
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
});
