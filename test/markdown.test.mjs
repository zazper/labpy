import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TUT, topics, fences } from './helpers.mjs';

const { md, hl } = await import('../src/markdown.mjs');

test('inline code keeps ** and bold still works (regression)', () => {
  const r = md('Use `**kwargs` and **bold** text, then `*args` and **more**.');
  assert.match(r.html, /<code>\*\*kwargs<\/code>/);
  assert.match(r.html, /<b>bold<\/b>/);
  assert.match(r.html, /<b>more<\/b>/);
});

test('HTML in text and code is escaped', () => {
  const r = md('a < b & c\n\n```python static\nx = "<tag>"\n```');
  assert.match(r.html, /a &lt; b &amp; c/);
  assert.match(r.html, /&lt;tag&gt;/);
});

test('a run fence becomes a Try it sample', () => {
  const r = md('```python run Hello\nprint("hi")\n```');
  assert.equal(r.samples.length, 1);
  assert.equal(r.samples[0], 'print("hi")');
  assert.match(r.html, /Try it/);
  assert.match(r.html, /data-i="0"/);
});

test('a cloud fence is locked (no Try it button)', () => {
  const r = md('```python cloud Threads\nimport threading\n```');
  assert.equal(r.samples.length, 1);
  assert.doesNotMatch(r.html, /Try it/);
  assert.match(r.html, /Needs the cloud runner/);
});

test('a static fence is just code', () => {
  const r = md('```python static Layout\nx = 1\n```');
  assert.equal(r.samples.length, 0);
  assert.doesNotMatch(r.html, /Try it/);
});

test('headings, lists and paragraphs render', () => {
  const r = md('## Title\n\nA paragraph.\n\n- one\n- two\n');
  assert.match(r.html, /<h3>Title<\/h3>/);
  assert.match(r.html, /<p>A paragraph\.<\/p>/);
  assert.match(r.html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
});

test('the highlighter marks keywords, strings, numbers, functions and comments', () => {
  const h = hl('def f(x):\n    return "a" + str(3)  # note');
  for (const cls of ['kw', 's', 'nu', 'f', 'cm']) assert.match(h, new RegExp(`class="${cls}"`), `missing ${cls}`);
});

test('every tutorial topic renders, and the sample count matches the fences', () => {
  for (const t of topics().filter((x) => x.file)) {
    const text = fs.readFileSync(path.join(TUT, t.file), 'utf8');
    const r = md(text);
    const expected = fences(text).filter((f) => f.kind !== 'static').length;
    assert.equal(r.samples.length, expected, `${t.file}: ${r.samples.length} samples rendered, ${expected} fences`);
    assert.ok(r.html.length > 100, `${t.file}: rendered nothing`);
    assert.doesNotMatch(r.html.replace(/<(div|a) [^>]*class="cbx[\s\S]*?<\/(div|a)>/g, ''), /```/, `${t.file}: stray fence markers in the output`);
  }
});
