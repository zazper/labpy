import { EditorView, keymap } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import { zipSync, strToU8 } from 'fflate';
import { initTutorial } from './tutorial.js';
import { formatCode, checkCode } from './tools.js';

const $ = (id) => document.getElementById(id);
const KEY = 'labpy.workspace.v1';
const SC = '~tutorial/';                       // scratch (tutorial sample) tabs live under this prefix
const isSc = (k) => k.startsWith(SC);

const EX = {
  'Multiple files': { 'main.py': 'from utils import greet\n\nprint(greet("world"))\n', 'utils.py': 'def greet(name):\n    return f"Hello, {name}!"\n' },
  'Ask for input': { 'main.py': 'name = input("Your name? ")\nprint(f"Hello, {name}!")\n' },
  'NumPy and pandas': { 'main.py': 'import numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({"x": np.arange(5), "y": np.random.rand(5)})\nprint(df)\nprint(df.describe())\n' },
  'Plot with matplotlib': { 'main.py': 'import numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(0, 10, 200)\nplt.plot(x, np.sin(x), label="sin")\nplt.plot(x, np.cos(x), label="cos")\nplt.legend()\nplt.title("Waves")\nplt.show()\n' },
  'Write an output file': { 'main.py': 'import csv\n\nwith open("squares.csv", "w", newline="") as f:\n    w = csv.writer(f)\n    w.writerow(["n", "square"])\n    for n in range(1, 6):\n        w.writerow([n, n * n])\nprint("Wrote squares.csv: see Download > Output files")\n' },
  'Install a package (micropip)': { 'main.py': 'import micropip\nawait micropip.install("python-slugify")\n\nfrom slugify import slugify\nprint(slugify("Hello from LabPy!"))\n' }
};

// ---------- workspace (one default workspace; projects arrive with accounts) ----------
const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const dec = (s) => JSON.parse(decodeURIComponent(escape(atob(s))));
function loadWorkspace() {
  let saved = null;
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.files && Object.keys(d.files).length) saved = d; } catch (e) {}
  if (location.hash.startsWith('#s=')) {
    try {
      const d = dec(location.hash.slice(3));
      history.replaceState(null, '', location.pathname);
      if (d && d.files && (!saved || confirm('Open this shared project?\nYour current files will be kept as a backup copy in this browser.'))) {
        if (saved) { try { localStorage.setItem('labpy.backup.' + Date.now(), JSON.stringify(saved)); } catch (e) {} }
        return d;
      }
    } catch (e) {}
  }
  return saved || { files: { ...EX['Multiple files'] }, active: 'main.py' };
}
let ws = loadWorkspace();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ws)); } catch (e) {} };

// ---------- editor ----------
let scratch = {}, states = {}, cur = null;
const getText = (k) => (isSc(k) ? scratch[k] : ws.files[k]);
const setText = (k, v) => { if (isSc(k)) scratch[k] = v; else { ws.files[k] = v; save(); } };
const mk = (k) => EditorState.create({
  doc: getText(k) || '',
  extensions: [
    basicSetup, python(), oneDark, keymap.of([indentWithTab]),
    Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => { run(); return true; } }])),
    EditorView.updateListener.of((u) => { if (u.docChanged && cur) setText(cur, u.state.doc.toString()); })
  ]
});
const view = new EditorView({ parent: $('editor') });

function open(k) {
  if (cur && getText(cur) !== undefined) states[cur] = view.state;
  cur = k; if (!isSc(k)) { ws.active = k; save(); }
  if (!states[k]) states[k] = mk(k);
  view.setState(states[k]);
  document.body.classList.remove('read'); view.requestMeasure();
  renderTabs();
}
function resetEditor(files, active) { ws = { files, active: active || Object.keys(files)[0] }; states = {}; cur = null; open(ws.active); }

function renderTabs() {
  const t = $('tabList'); t.innerHTML = '';
  const real = Object.keys(ws.files);
  for (const k of [...real, ...Object.keys(scratch)]) {
    const d = document.createElement('div');
    d.className = 'tab' + (k === cur ? ' on' : ''); d.tabIndex = 0;
    d.textContent = isSc(k) ? k.slice(SC.length) + ' · tutorial' : k;
    d.onclick = () => open(k); d.onkeydown = (e) => { if (e.key === 'Enter') open(k); };
    if (!isSc(k)) d.ondblclick = () => rename(k);
    if (isSc(k) || real.length > 1) {
      const x = document.createElement('i'); x.textContent = '×'; x.title = 'Close';
      x.onclick = (e) => { e.stopPropagation(); del(k); }; d.append(x);
    }
    t.append(d);
  }
  const p = document.createElement('button'); p.textContent = '+'; p.title = 'New file'; p.onclick = newFile; t.append(p);
  $('tabActions').hidden = !(cur && isSc(cur));
}
function newFile() {
  const n = (prompt('New file name', 'utils.py') || '').trim();
  if (!n || ws.files[n] !== undefined) return;
  ws.files[n] = ''; open(n);
}
function rename(k) {
  const n = (prompt('Rename file', k) || '').trim();
  if (!n || n === k || ws.files[n] !== undefined) return;
  ws.files[n] = ws.files[k]; delete ws.files[k]; delete states[k];
  if (cur === k) { cur = null; open(n); } else renderTabs();
}
function del(k) {
  if (!isSc(k) && !confirm('Delete ' + k + '?')) return;
  if (isSc(k)) delete scratch[k]; else delete ws.files[k];
  delete states[k];
  if (cur === k) { cur = null; open(Object.keys(ws.files)[0]); } else renderTabs();
  save();
}

// ---------- output ----------
function print(text, cls) {
  const s = document.createElement('span'); if (cls) s.className = cls;
  s.textContent = text; $('console').append(s); $('out').scrollTop = $('out').scrollHeight;
}
const setState = (t) => { $('state').textContent = t; };
let outputs = {};
function updateDl() { const n = Object.keys(outputs).length; $('dlOut').textContent = `Output files (${n})`; $('dlOut').disabled = !n; }

// ---------- Python runtime (starts on demand) ----------
let w, rt = 'idle', readyP, resolveReady, running = false, sab = null;
const setBtns = () => { $('run').disabled = running; $('stop').disabled = !running; };

function boot() {
  rt = 'loading'; readyP = new Promise((r) => { resolveReady = r; });
  $('load').hidden = false; $('lbar').classList.remove('ind'); $('lbar').style.width = '0'; $('lstatus').textContent = 'Starting…';
  sab = (typeof SharedArrayBuffer !== 'undefined' && self.crossOriginIsolated) ? new SharedArrayBuffer(8 + 65536) : null;
  w = new Worker('worker.js'); w.postMessage({ type: 'init', sab });
  w.onmessage = ({ data: m }) => {
    if (m.type === 'progress') { $('lbar').style.width = m.pct + '%'; $('lstatus').textContent = m.text; }
    else if (m.type === 'status') { $('lstatus').textContent = m.text; if (m.indeterminate) $('lbar').classList.add('ind'); }
    else if (m.type === 'fatal') { $('lstatus').textContent = m.text; $('lbar').classList.remove('ind'); $('lsub').textContent = 'Check your connection, then press Run to try again.'; rt = 'idle'; running = false; setBtns(); setState('Could not load Python'); }
    else if (m.type === 'ready') { rt = 'ready'; $('load').hidden = true; resolveReady(); }
    else if (m.type === 'out') print(m.text, m.cls);
    else if (m.type === 'plot') { const i = new Image(); i.src = 'data:image/png;base64,' + m.png; i.alt = 'Plot'; $('plots').append(i); }
    else if (m.type === 'outfile') { outputs[m.name] = m.data; updateDl(); print(`Output file: ${m.name} (${m.data.length} bytes)\n`, 'dim'); }
    else if (m.type === 'input') {
      const v = prompt('Python is asking for input') ?? '';
      const b = new TextEncoder().encode(v).slice(0, 65536), i32 = new Int32Array(sab, 0, 2);
      new Uint8Array(sab, 8).set(b); Atomics.store(i32, 1, b.length); Atomics.store(i32, 0, 1); Atomics.notify(i32, 0);
    }
    else if (m.type === 'done') { running = false; setBtns(); setState(m.ok ? 'Finished' : 'Finished with an error'); }
  };
}
const ensure = () => { if (rt === 'idle') boot(); return readyP; };

async function run() {
  if (running || !cur) return;
  const k = cur; running = true; setBtns(); setState(rt === 'ready' ? 'Running…' : 'Loading Python…');
  $('console').textContent = ''; $('plots').innerHTML = ''; outputs = {}; updateDl();
  await ensure();
  if (!running) return;                          // Stop was pressed while Python was loading
  setState('Running…');
  const entry = isSc(k) ? k.slice(SC.length) : k, files = { ...ws.files };
  if (isSc(k)) files[entry] = scratch[k];
  w.postMessage({ type: 'run', files, entry });
}
function stop() {
  if (!running) return;
  w.terminate(); rt = 'idle'; running = false; setBtns(); $('load').hidden = true;
  print('\nStopped. Python restarts on the next Run.\n', 'dim'); setState('Stopped');
}

// ---------- Format and Check (Ruff, loaded on first use) ----------
async function doFormat() {
  if (!cur) return; setState('Formatting…');
  try {
    const src = getText(cur), out = await formatCode(src);
    if (out !== src) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: out } });
    setState('Formatted');
  } catch (e) { setState('Format failed'); print('Format error: ' + (e.message || e) + '\n', 'err'); }
}
async function doCheck() {
  if (!cur) return; setState('Checking…');
  try {
    const ds = await checkCode(getText(cur)), p = $('problems');
    p.hidden = false; p.innerHTML = '';
    const head = document.createElement('div'); head.className = 'pr';
    head.innerHTML = `<b>${ds.length ? 'Problems ' + ds.length : 'No problems found'}</b><span class="muted" style="flex:1"></span>`;
    const x = document.createElement('button'); x.textContent = '✕'; x.setAttribute('aria-label', 'Close problems'); x.onclick = () => { p.hidden = true; }; head.append(x); p.append(head);
    for (const d of ds) {
      const b = document.createElement('button'); b.className = 'pr';
      b.innerHTML = `<span class="muted">line ${d.row}</span><span>${d.code}</span><span></span>`; b.lastChild.textContent = d.message;
      b.onclick = () => { const l = view.state.doc.line(Math.min(d.row, view.state.doc.lines)); view.dispatch({ selection: { anchor: l.from + Math.max(0, d.col - 1) }, scrollIntoView: true }); view.focus(); };
      p.append(b);
    }
    view.requestMeasure(); setState(ds.length ? `${ds.length} problem(s)` : 'No problems');
  } catch (e) { setState('Check failed'); print('Check error: ' + (e.message || e) + '\n', 'err'); }
}

// ---------- downloads ----------
function saveBlob(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function download(what) {
  if (what === 'file' && cur) saveBlob(new Blob([getText(cur)], { type: 'text/x-python' }), (isSc(cur) ? cur.slice(SC.length) : cur).split('/').pop());
  else if (what === 'zip') { const o = {}; for (const [n, c] of Object.entries(ws.files)) o[n] = strToU8(c); saveBlob(new Blob([zipSync(o)], { type: 'application/zip' }), 'labpy-workspace.zip'); }
  else if (what === 'out') {
    const names = Object.keys(outputs);
    if (names.length === 1) saveBlob(new Blob([outputs[names[0]]]), names[0].split('/').pop());
    else if (names.length) saveBlob(new Blob([zipSync({ ...outputs })], { type: 'application/zip' }), 'labpy-output-files.zip');
  }
}

// ---------- menu, tutorial, buttons ----------
const tutorial = initTutorial({
  trySample(code, name) {
    const k = SC + name; scratch[k] = code; delete states[k]; if (cur === k) cur = null;
    open(k); run();
  }
});
function menu(show) { $('drawer').hidden = !show; $('scrim').hidden = !show || document.body.classList.contains('tut'); $('menuBtn').setAttribute('aria-expanded', show); if (show) $('learn').focus(); }
$('menuBtn').onclick = () => menu($('drawer').hidden);
$('menuClose').onclick = $('scrim').onclick = () => menu(false);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { menu(false); $('dlMenu').hidden = true; } });
$('learn').onclick = () => { tutorial.open(); if (matchMedia('(max-width:800px)').matches) menu(false); };   // wide screens keep the menu docked beside the topics
$('ex2').onclick = () => { menu(false); $('examples').focus(); };
$('back').onclick = () => tutorial.backToLesson();
$('saveCopy').onclick = () => {
  const def = cur.slice(SC.length), n = (prompt('Save as', def) || '').trim();
  if (!n || ws.files[n] !== undefined) return;
  ws.files[n] = scratch[cur]; delete scratch[cur]; delete states[cur]; cur = null; open(n);
};
$('run').onclick = run; $('stop').onclick = stop;
$('run').addEventListener('pointerenter', () => { if (rt === 'idle') boot(); });   // warm up Python when the pointer reaches Run
$('clear').onclick = () => { $('console').textContent = ''; $('plots').innerHTML = ''; };
$('format').onclick = doFormat; $('check').onclick = doCheck;
$('share').onclick = async () => {
  const url = location.origin + location.pathname + '#s=' + enc(ws);
  try { await navigator.clipboard.writeText(url); setState('Share link copied'); } catch (e) { prompt('Copy this link', url); }
};
$('upload').onclick = () => $('file').click();
$('file').onchange = async (e) => {
  for (const f of e.target.files) ws.files[f.name] = await f.text();
  const first = e.target.files[0] ? e.target.files[0].name : ws.active;
  states = {}; cur = null; open(first); e.target.value = '';
};
$('dl').onclick = (e) => { e.stopPropagation(); const s = $('dlMenu').hidden; $('dlMenu').hidden = !s; $('dl').setAttribute('aria-expanded', s); };
$('dlMenu').addEventListener('click', (e) => { const b = e.target.closest('[data-dl]'); if (b && !b.disabled) { download(b.dataset.dl); $('dlMenu').hidden = true; } });
document.addEventListener('click', (e) => { if (!e.target.closest('.dd')) $('dlMenu').hidden = true; });
for (const k of Object.keys(EX)) $('examples').add(new Option(k, k));
$('examples').onchange = (e) => {
  const k = e.target.value; e.target.value = '';
  if (k && confirm('Replace your current files with this example?')) { scratch = {}; resetEditor({ ...EX[k] }); }
};

// ---------- support (donation) links, read from site/config.json ----------
const safeUrl = (u) => { try { const x = new URL(u); return x.protocol === 'https:' ? x.href : ''; } catch (e) { return ''; } };
fetch('config.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((c) => {
  const d = (c && c.donate) || {};
  const pp = safeUrl(d.paypal), bmc = safeUrl(d.buyMeACoffee);
  $('donatePaypal').hidden = !pp; if (pp) $('donatePaypal').href = pp;
  $('donateBmc').hidden = !bmc; if (bmc) $('donateBmc').href = bmc;
  document.body.classList.toggle('has-donate', !!(pp || bmc));   // hides every Support link when nothing is configured
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-support]')) return;
  e.preventDefault();
  if (!document.body.classList.contains('tut')) menu(false);
  const dlg = $('support');
  if (typeof dlg.showModal === 'function') dlg.showModal();
});
$('supportClose').onclick = () => $('support').close();

open(ws.files[ws.active] !== undefined ? ws.active : Object.keys(ws.files)[0]);
setState('Ready (Python loads on first Run)');
