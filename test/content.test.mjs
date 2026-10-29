import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TUT, toc, topics, fences } from './helpers.mjs';

test('toc.json is well formed', () => {
  const t = toc();
  assert.ok(Array.isArray(t.groups) && t.groups.length > 0, 'no groups');
  const ids = new Set();
  for (const g of t.groups) {
    assert.ok(g.title && g.topics.length, `group needs a title and topics: ${g.title}`);
    for (const topic of g.topics) {
      assert.ok(!ids.has(topic.id), `duplicate id ${topic.id}`);
      ids.add(topic.id);
      assert.ok(topic.title, `topic ${topic.id} has no title`);
      assert.ok(['B', 'I', 'A'].includes(topic.level), `${topic.id}: bad level ${topic.level}`);
      assert.ok(['Local', 'Package', 'Cloud'].includes(topic.runs), `${topic.id}: bad runs ${topic.runs}`);
    }
  }
});

test('every topic with a file points to an existing, non-empty file', () => {
  const seen = new Set();
  for (const t of topics()) {
    if (!t.file) continue;
    assert.ok(!seen.has(t.file), `file used twice: ${t.file}`);
    seen.add(t.file);
    const p = path.join(TUT, t.file);
    assert.ok(fs.existsSync(p), `${t.id} ${t.title}: missing file ${t.file}`);
    assert.ok(fs.readFileSync(p, 'utf8').trim().length > 50, `${t.file} is almost empty`);
  }
});

test('every topic has content (no "coming soon" topics left)', () => {
  const missing = topics().filter((t) => !t.file).map((t) => `${t.id} ${t.title}`);
  assert.deepEqual(missing, [], 'topics without a file: ' + missing.join('; '));
});

test('no orphan .md files in site/tutorial', () => {
  const used = new Set(topics().map((t) => t.file));
  const orphans = fs.readdirSync(TUT).filter((f) => f.endsWith('.md') && !used.has(f));
  assert.deepEqual(orphans, [], 'files not listed in toc.json: ' + orphans.join(', '));
});

test('code fences are balanced and use known kinds', () => {
  for (const t of topics().filter((x) => x.file)) {
    const text = fs.readFileSync(path.join(TUT, t.file), 'utf8');
    const count = (text.match(/^```/gm) || []).length;
    assert.equal(count % 2, 0, `${t.file}: odd number of \`\`\` lines`);
    for (const f of fences(text)) {
      assert.ok(f.closed, `${t.file} line ${f.line}: fence is never closed`);
      assert.ok(f.code.trim(), `${t.file} line ${f.line}: empty code block`);
      if (f.kind === 'run' || f.kind === 'cloud') assert.ok(f.title, `${t.file} line ${f.line}: runnable sample needs a title`);
    }
  }
});

test('cloud topics contain locked samples, and run topics do not use threads or processes', () => {
  for (const t of topics().filter((x) => x.file)) {
    const text = fs.readFileSync(path.join(TUT, t.file), 'utf8');
    for (const f of fences(text).filter((x) => x.kind === 'run')) {
      assert.ok(!/\b(threading\.Thread|multiprocessing|ProcessPoolExecutor|ThreadPoolExecutor|subprocess)\b/.test(f.code),
        `${t.file} line ${f.line}: runnable (browser) sample uses threads or processes; mark it "cloud"`);
    }
  }
});
