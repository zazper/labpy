import { EditorView, keymap } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';

const $ = (id) => document.getElementById(id);
const KEY = 'labpy.workspace.v1';

const EX = {
  'Multiple files': { 'main.py': 'from utils import greet\n\nprint(greet("world"))\n', 'utils.py': 'def greet(name):\n    return f"Hello, {name}!"\n' },
  'Ask for input': { 'main.py': 'name = input("Your name? ")\nprint(f"Hello, {name}!")\n' },
  'NumPy and pandas': { 'main.py': 'import numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({"x": np.arange(5), "y": np.random.rand(5)})\nprint(df)\nprint(df.describe())\n' },
  'Plot with matplotlib': { 'main.py': 'import numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(0, 10, 200)\nplt.plot(x, np.sin(x), label="sin")\nplt.plot(x, np.cos(x), label="cos")\nplt.legend()\nplt.title("Waves")\nplt.show()\n' },
  'Install a package (micropip)': { 'main.py': 'import micropip\nawait micropip.install("python-slugify")\n\nfrom slugify import slugify\nprint(slugify("Hello from LabPy!"))\n' }
};

// ---------- workspace ----------
const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const dec = (s) => JSON.parse(decodeURIComponent(escape(atob(s))));
function loadWorkspace() {
  try {
    if (location.hash.startsWith('#s=')) {
      const d = dec(location.hash.slice(3));
      history.replaceState(null, '', location.pathname);
      if (d && d.files) return d;
    }
  } catch (e) {}
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.files && Object.keys(d.files).length) return d;
  } catch (e) {}
  return { files: { ...EX['Multiple files'] }, active: 'main.py' };
}
let ws = loadWorkspace();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ws)); } catch (e) {} };

// ---------- editor ----------
let states = {}, cur = null;
const mk = (name) => EditorState.create({
  doc: ws.files[name],
  extensions: [
    basicSetup, python(), oneDark, keymap.of([indentWithTab]),
    Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => { run(); return true; } }])),
    EditorView.updateListener.of((u) => { if (u.docChanged && cur) { ws.files[cur] = u.state.doc.toString(); save(); } })
  ]
});
const view = new EditorView({ parent: $('editor') });

function open(name) {
  if (cur && cur in ws.files) states[cur] = view.state;
  cur = name; ws.active = name;
  if (!states[name]) states[name] = mk(name);
  view.setState(states[name]);
  renderTabs(); save();
}
function replaceWorkspace(files, active) {
  ws = { files, active: active || Object.keys(files)[0] };
  states = {}; cur = null; open(ws.active);
}

function renderTabs() {
  const t = $('tabs'); t.innerHTML = '';
  const names = Object.keys(ws.files);
  for (const n of names) {
    const d = document.createElement('div');
    d.className = 'tab' + (n === cur ? ' on' : ''); d.tabIndex = 0; d.textContent = n;
    d.title = 'Click to open, double-click to rename';
    d.onclick = () => open(n); d.ondblclick = () => rename(n);
    d.onkeydown = (e) => { if (e.key === 'Enter') open(n); };
    if (names.length > 1) {
      const x = document.createElement('i'); x.textContent = '×'; x.title = 'Delete file';
      x.onclick = (e) => { e.stopPropagation(); del(n); }; d.append(x);
    }
    t.append(d);
  }
  const p = document.createElement('button'); p.textContent = '+'; p.title = 'New file'; p.onclick = newFile; t.append(p);
}
function newFile() {
  const n = (prompt('New file name', 'utils.py') || '').trim();
  if (!n || ws.files[n] !== undefined) return;
  ws.files[n] = ''; open(n);
}
function rename(n) {
  const nn = (prompt('Rename file', n) || '').trim();
  if (!nn || nn === n || ws.files[nn] !== undefined) return;
  ws.files[nn] = ws.files[n]; delete ws.files[n]; delete states[n];
  if (cur === n) { cur = null; open(nn); } else renderTabs();
}
function del(n) {
  if (!confirm('Delete ' + n + '?')) return;
  delete ws.files[n]; delete states[n];
  if (cur === n) { cur = null; open(Object.keys(ws.files)[0]); } else renderTabs();
  save();
}

// ---------- output ----------
function print(text, cls) {
  const s = document.createElement('span');
  if (cls) s.className = cls;
  s.textContent = text; $('console').append(s);
  $('out').scrollTop = $('out').scrollHeight;
}
const setState = (t) => { $('state').textContent = t; };

// ---------- python worker ----------
let w, ready = false, running = false, sab = null;
function setBtns() { $('run').disabled = !ready || running; $('stop').disabled = !running; }

function boot() {
  ready = false; running = false; setBtns(); setState('Loading Python…');
  $('loader').classList.remove('hide'); $('lbar').classList.remove('ind'); $('lbar').style.width = '0';
  sab = (typeof SharedArrayBuffer !== 'undefined' && self.crossOriginIsolated) ? new SharedArrayBuffer(8 + 65536) : null;
  w = new Worker('worker.js');
  w.postMessage({ type: 'init', sab });
  w.onmessage = ({ data: m }) => {
    if (m.type === 'progress') { $('lbar').style.width = m.pct + '%'; $('lstatus').textContent = m.text; }
    else if (m.type === 'status') { $('lstatus').textContent = m.text; if (m.indeterminate) $('lbar').classList.add('ind'); }
    else if (m.type === 'fatal') { $('lstatus').textContent = m.text; $('lbar').classList.remove('ind'); $('lsub').textContent = 'Check your connection and reload the page.'; }
    else if (m.type === 'ready') { ready = true; $('loader').classList.add('hide'); setBtns(); setState(sab ? 'Ready' : 'Ready (input() unavailable)'); }
    else if (m.type === 'out') print(m.text, m.cls);
    else if (m.type === 'plot') { const i = new Image(); i.src = 'data:image/png;base64,' + m.png; i.alt = 'Plot'; $('plots').append(i); }
    else if (m.type === 'input') {
      const v = prompt('Python is asking for input') ?? '';
      const b = new TextEncoder().encode(v).slice(0, 65536);
      const i32 = new Int32Array(sab, 0, 2);
      new Uint8Array(sab, 8).set(b);
      Atomics.store(i32, 1, b.length); Atomics.store(i32, 0, 1); Atomics.notify(i32, 0);
    }
    else if (m.type === 'done') { running = false; setBtns(); setState(m.ok ? 'Finished' : 'Finished with an error'); }
  };
}

function run() {
  if (!ready || running) return;
  running = true; setBtns(); setState('Running…');
  $('console').textContent = ''; $('plots').innerHTML = '';
  w.postMessage({ type: 'run', files: ws.files, entry: ws.active });
}
function stop() {
  if (!running) return;
  w.terminate(); print('\nStopped. Restarting Python…\n', 'dim'); boot();
}

// ---------- buttons ----------
$('run').onclick = run;
$('stop').onclick = stop;
$('clear').onclick = () => { $('console').textContent = ''; $('plots').innerHTML = ''; };
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
$('download').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ws.files[cur]], { type: 'text/x-python' }));
  a.download = cur.split('/').pop(); a.click(); URL.revokeObjectURL(a.href);
};
for (const k of Object.keys(EX)) $('examples').add(new Option(k, k));
$('examples').onchange = (e) => {
  const k = e.target.value; e.target.value = '';
  if (k && confirm('Replace your current files with this example?')) replaceWorkspace({ ...EX[k] });
};

open(ws.files[ws.active] !== undefined ? ws.active : Object.keys(ws.files)[0]);
boot();
