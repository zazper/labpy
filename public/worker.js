// Runs Pyodide off the main thread so the page never freezes.
// To upgrade Python/Pyodide, change the version below.
const V = '0.28.0';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${V}/full/`;
let py, sab, written = [];
const post = (m) => postMessage(m);

// Download the big core files first so we can report real progress.
async function prefetch() {
  const items = [['pyodide.asm.wasm', 9.5e6], ['python_stdlib.zip', 2.3e6], ['pyodide.asm.js', 1.0e6], ['pyodide-lock.json', 0.1e6]];
  const total = items.reduce((a, i) => a + i[1], 0);
  let got = 0;
  for (const [f] of items) {
    const r = await fetch(BASE + f);
    if (!r.ok) throw new Error('Could not download ' + f);
    const rd = r.body.getReader();
    for (;;) {
      const { done, value } = await rd.read();
      if (done) break;
      got += value.length;
      post({ type: 'progress', pct: Math.min(99, (got / total) * 100), text: `Downloading Python runtime… ${(got / 1e6).toFixed(1)} MB` });
    }
  }
}

async function init() {
  await prefetch();
  post({ type: 'status', text: 'Starting Python…', indeterminate: true });
  importScripts(BASE + 'pyodide.js');
  py = await loadPyodide({ indexURL: BASE });
  py.setStdout({ batched: (t) => post({ type: 'out', text: t + '\n' }) });
  py.setStderr({ batched: (t) => post({ type: 'out', text: t + '\n', cls: 'err' }) });
  py.setStdin({
    stdin: () => {
      if (!sab) return undefined; // no input() support without cross-origin isolation
      const i = new Int32Array(sab, 0, 2);
      Atomics.store(i, 0, 0);
      post({ type: 'input' });
      Atomics.wait(i, 0, 0);
      return new TextDecoder().decode(new Uint8Array(sab, 8, Atomics.load(i, 1)).slice());
    }
  });
  py.runPython(`
import os, sys, warnings
os.environ['MPLBACKEND'] = 'AGG'
warnings.filterwarnings('ignore', message='.*non-interactive.*')
os.chdir('/home/pyodide')
sys.path.insert(0, '/home/pyodide')
`);
  post({ type: 'ready' });
}

function cleanTrace(msg) {
  const ls = String(msg).split('\n'), o = [];
  for (let i = 0; i < ls.length; i++) {
    if (ls[i].includes('/_pyodide/')) { while (ls[i + 1] && /^\s{4}/.test(ls[i + 1])) i++; continue; }
    o.push(ls[i]);
  }
  return o.join('\n');
}

async function run({ files, entry }) {
  let ok = true;
  try {
    py.runPython(`
import sys, importlib
for m in [k for k, v in list(sys.modules.items()) if str(getattr(v, '__file__', '') or '').startswith('/home/pyodide')]:
    sys.modules.pop(m, None)
importlib.invalidate_caches()`);
    for (const old of written) if (!(old in files)) { try { py.FS.unlink('/home/pyodide/' + old); } catch (e) {} }
    for (const [n, c] of Object.entries(files)) {
      const p = '/home/pyodide/' + n;
      py.FS.mkdirTree(p.slice(0, p.lastIndexOf('/')));
      py.FS.writeFile(p, c);
    }
    written = Object.keys(files);
    await py.loadPackagesFromImports(Object.values(files).join('\n'), {
      messageCallback: (t) => post({ type: 'out', text: t + '\n', cls: 'dim' }),
      errorCallback: (t) => post({ type: 'out', text: t + '\n', cls: 'err' })
    });
    const g = py.toPy({ __name__: '__main__', __file__: '/home/pyodide/' + entry });
    try { await py.runPythonAsync(files[entry], { globals: g, filename: entry }); } finally { g.destroy(); }
  } catch (e) {
    ok = false;
    post({ type: 'out', text: cleanTrace(e.message) + '\n', cls: 'err' });
  }
  try {
    const figs = py.runPython(`
import sys, io, base64
_out = []
if 'matplotlib.pyplot' in sys.modules:
    _plt = sys.modules['matplotlib.pyplot']
    for _n in _plt.get_fignums():
        _b = io.BytesIO()
        _plt.figure(_n).savefig(_b, format='png', dpi=100, bbox_inches='tight')
        _out.append(base64.b64encode(_b.getvalue()).decode())
    _plt.close('all')
_out`);
    for (const p of figs.toJs()) post({ type: 'plot', png: p });
    figs.destroy();
  } catch (e) {}
  post({ type: 'done', ok });
}

onmessage = ({ data: m }) => {
  if (m.type === 'init') {
    sab = m.sab;
    init().catch((e) => post({ type: 'fatal', text: 'Could not load Python: ' + e.message }));
  } else if (m.type === 'run') run(m);
};
