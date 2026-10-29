import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

const script = path.join(ROOT, 'scripts', 'release.js');
const hasGit = spawnSync('git', ['--version']).status === 0;

test('release.js --help prints usage', { skip: !fs.existsSync(script) }, () => {
  const r = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /patch/);
  assert.match(r.stdout, /--dry-run/);
});

test('release.js dry run computes the next version in a temporary repo', { skip: !hasGit || !fs.existsSync(script) }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'labpy-rel-'));
  const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8' });
  try {
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x', version: '1.0.2', scripts: { build: 'echo ok' } }));
    git('add', '-A'); git('commit', '-q', '-m', 'init');
    git('tag', '-a', 'v1.0.2', '-m', 'r');
    const run = (arg) => spawnSync(process.execPath, [script, arg, '--dry-run'], { cwd: dir, encoding: 'utf8' });
    assert.match(run('patch').stdout, /1\.0\.2\s+->\s+1\.0\.3/);
    assert.match(run('minor').stdout, /1\.0\.2\s+->\s+1\.1\.0/);
    assert.match(run('major').stdout, /1\.0\.2\s+->\s+2\.0\.0/);
    assert.match(run('1.4.0').stdout, /1\.0\.2\s+->\s+1\.4\.0/);
    const bad = run('1.0.1');
    assert.notEqual(bad.status, 0, 'a lower version must be refused');
    assert.equal(fs.readFileSync(path.join(dir, 'package.json'), 'utf8').includes('"1.0.2"'), true, 'a dry run must not change package.json');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
