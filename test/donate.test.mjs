import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, read } from './helpers.mjs';

const config = JSON.parse(read('site', 'config.json'));
const donate = config.donate || {};

test('config.json has at least one https donation link on the expected site', () => {
  const links = [['paypal', 'paypal.com'], ['buyMeACoffee', 'buymeacoffee.com']];
  let set = 0;
  for (const [key, host] of links) {
    if (!donate[key]) continue;
    set++;
    const u = new URL(donate[key]);                  // throws if it is not a valid URL
    assert.equal(u.protocol, 'https:', `${key} must use https`);
    assert.ok(u.hostname === host || u.hostname.endsWith('.' + host), `${key} should point to ${host}, got ${u.hostname}`);
    assert.doesNotMatch(donate[key], /XXXX|example\.com|YOUR/i, `${key} still looks like a placeholder`);
  }
  assert.ok(set > 0, 'no donation link is configured (the Support links would be hidden)');
});

test('GitHub FUNDING.yml matches config.json', () => {
  const p = path.join(ROOT, '.github', 'FUNDING.yml');
  assert.ok(fs.existsSync(p), '.github/FUNDING.yml is missing');
  const y = fs.readFileSync(p, 'utf8');
  if (donate.buyMeACoffee) assert.ok(y.includes(new URL(donate.buyMeACoffee).pathname.replace('/', '')), 'Buy Me a Coffee name differs from config.json');
  if (donate.paypal) assert.ok(y.includes(donate.paypal), 'PayPal link differs from config.json');
});

test('the Support dialog opens external links safely', () => {
  const html = read('site', 'index.html');
  assert.match(html, /<dialog id="support"/);
  for (const id of ['donatePaypal', 'donateBmc']) {
    const tag = html.match(new RegExp(`<a id="${id}"[^>]*>`));
    assert.ok(tag, `${id} link is missing`);
    assert.match(tag[0], /target="_blank"/);
    assert.match(tag[0], /rel="noopener noreferrer"/);
  }
});

test('Support entry points exist in the menu and in tutorial topics', () => {
  assert.match(read('site', 'index.html'), /id="supportBtn"[^>]*data-support/);
  assert.match(read('src', 'tutorial.js'), /data-support/);
  assert.match(read('src', 'app.js'), /has-donate/);
});

test('no secrets are committed in config.json', () => {
  assert.doesNotMatch(JSON.stringify(config), /secret|token|password|client_secret/i);
});
