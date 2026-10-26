#!/usr/bin/env node
/*
 * LabPy release script
 *
 * Does the whole release in one command:
 *   commit (optional) -> merge into main (if needed) -> pull -> build check
 *   -> bump version in package.json -> commit "Release x.y.z" -> annotated tag vx.y.z
 *   -> git push --follow-tags   (pushing main auto-deploys to Hostinger)
 *
 * Usage (from the repo root):
 *   npm run release -- patch                     1.0.2 -> 1.0.3
 *   npm run release -- minor                     1.0.2 -> 1.1.0
 *   npm run release -- major                     1.0.2 -> 2.0.0
 *   npm run release -- 1.4.0                     explicit version
 *   npm run release -- minor -m "Add sidebar"    commit uncommitted changes first
 *
 * Options:
 *   -m "message"   commit all uncommitted changes with this message first
 *   --dry-run      show what would happen, change nothing
 *   --yes          skip the confirmation prompt
 *   --no-build     skip the `npm run build` check
 *   --help         show this help
 */
const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const mi = argv.indexOf('-m');
const message = mi >= 0 ? argv[mi + 1] : null;
const msgIdx = mi >= 0 ? mi + 1 : -1;
const bump = argv.find((a, i) => !a.startsWith('-') && i !== msgIdx) || 'patch';
const DRY = has('--dry-run');
const YES = has('--yes');
const NO_BUILD = has('--no-build');
const MAIN = 'main';

const say = (m = '') => console.log(m);
const die = (m) => { console.error('\nERROR: ' + m); process.exit(1); };
const out = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const git = (...a) => execFileSync('git', a, { stdio: 'inherit' });
const sh = (cmd) => execSync(cmd, { stdio: 'inherit' });

function step(label, fn) {
  if (DRY) return say('[dry-run] ' + label);
  say('> ' + label);
  fn();
}

function ask(q) {
  if (YES || DRY) return Promise.resolve(true);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(q + ' [y/N] ', (a) => { rl.close(); res(/^y(es)?$/i.test(a.trim())); }));
}

function parse(v) { return v.split('.').map(Number); }
function cmp(a, b) {
  const x = parse(a), y = parse(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}
function nextVersion(cur, b) {
  if (/^\d+\.\d+\.\d+$/.test(b)) return b;
  const [M, m, p] = parse(cur);
  if (b === 'major') return `${M + 1}.0.0`;
  if (b === 'minor') return `${M}.${m + 1}.0`;
  if (b === 'patch') return `${M}.${m}.${p + 1}`;
  return die(`Unknown version argument "${b}". Use patch, minor, major or x.y.z.`);
}
const readPkg = () => JSON.parse(fs.readFileSync('package.json', 'utf8'));
const indent = (s) => s.split('\n').map((l) => '    ' + l).join('\n');

(async () => {
  if (has('--help')) {
    say(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\n?/, '').replace(/^ \* ?/gm, ''));
    return;
  }

  // ---------- preflight (read-only) ----------
  try { process.chdir(out('rev-parse', '--show-toplevel')); } catch { die('Not inside a git repository.'); }
  if (!fs.existsSync('package.json')) die('package.json not found in the repo root.');
  const startBranch = out('branch', '--show-current');
  if (!startBranch) die('Detached HEAD. Switch to a branch first.');

  const dirty = out('status', '--porcelain');
  if (dirty) {
    say('Uncommitted changes:\n' + indent(dirty) + '\n');
    if (!message) die('Commit them first, or re-run with -m "commit message" to commit everything shown above.');
  }

  const pkg = readPkg();
  const next = nextVersion(pkg.version, bump);
  const tag = 'v' + next;
  if (cmp(next, pkg.version) <= 0) die(`New version ${next} must be higher than the current ${pkg.version}.`);
  if (out('tag', '--list', tag)) die(`Tag ${tag} already exists.`);

  let last = '';
  try { last = out('describe', '--tags', '--abbrev=0'); } catch { /* no tags yet */ }
  const log = out('log', '--oneline', '-n', '20', last ? `${last}..${startBranch}` : startBranch);

  say('Release summary');
  say(`  version      : ${pkg.version}  ->  ${next}   (tag ${tag})`);
  say(`  from branch  : ${startBranch}${startBranch !== MAIN ? `  (will be merged into ${MAIN})` : ''}`);
  say(`  last tag     : ${last || '(none)'}`);
  say(`  commits since last tag:\n${indent(log || '(none)')}`);
  if (dirty) say(`  will commit  : all uncommitted changes as "${message}"`);
  say('\nPushing to main triggers an automatic Hostinger deploy.');
  if (DRY) say('(dry run: nothing will be changed)\n');

  if (!(await ask(`Create ${tag} and push?`))) die('Cancelled. Nothing was changed.');

  // ---------- execute ----------
  if (dirty) step(`commit all changes: "${message}"`, () => { git('add', '-A'); git('commit', '-m', message); });

  if (startBranch !== MAIN) {
    step(`switch to ${MAIN} and update it`, () => { git('switch', MAIN); git('pull', '--ff-only'); });
    step(`merge ${startBranch} into ${MAIN}`, () => git('merge', startBranch));
  } else {
    step('pull latest (fast-forward only)', () => git('pull', '--ff-only'));
  }

  if (!NO_BUILD) step('build check (npm run build)', () => sh('npm run build'));

  if (!DRY) {
    // Re-check after pulling: someone (or you on GitHub) may have changed things.
    const now = readPkg().version;
    if (cmp(next, now) <= 0) die(`After updating, package.json is at ${now}; ${next} is no longer a valid next version. Re-run the script.`);
    if (out('tag', '--list', tag)) die(`Tag ${tag} appeared on the remote. Re-run the script.`);
  }

  step(`set version ${next} in package.json`, () => sh(`npm version ${next} --no-git-tag-version`));
  step(`commit "Release ${next}" and tag ${tag}`, () => {
    git('add', ...['package.json', 'package-lock.json'].filter((f) => fs.existsSync(f)));
    git('commit', '-m', `Release ${next}`);
    git('tag', '-a', tag, '-m', `Release ${next}`);
  });
  step('push commits and tag', () => {
    try { git('push', '--follow-tags'); } catch (e) {
      say('\nPush failed. Your release commit and tag exist only on this computer.');
      say('To retry the push:   git push --follow-tags');
      say(`To undo and start over:   git tag -d ${tag} && git reset --hard HEAD~1   (then fix the cause and re-run)`);
      throw e;
    }
  });

  say(DRY ? '\nDry run complete. Nothing was changed.' : `\nDone: ${tag} released.`);
  if (!DRY) {
    say('Hostinger should start deploying now. When it finishes, hard-refresh the site (Ctrl+Shift+R).');
    if (startBranch !== MAIN) say(`You are now on ${MAIN}. To keep working on the feature branch: git switch ${startBranch}`);
  }
})().catch((e) => {
  console.error('\nRelease stopped: ' + (e && e.message ? e.message : e));
  console.error('Check "git status" to see where things stand. Nothing is pushed unless the last step said so.');
  process.exit(1);
});
