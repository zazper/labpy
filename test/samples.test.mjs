// Runs every runnable tutorial example in real Python (opt-in: npm run test:samples).
// Needs Python 3.11 or newer on your computer. Samples whose title contains the word "error" must fail.
// Samples that need numpy, pandas, matplotlib, scipy or scikit-learn are skipped if those are not installed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { TUT, topics, fences } from './helpers.mjs';

const RUNNER = `import ast, asyncio, inspect, sys
src = open(sys.argv[1]).read()
code = compile(src, "sample", "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
r = eval(code, {"__name__": "__main__"})
if inspect.iscoroutine(r):
    asyncio.run(r)
`;

function findPython() {
  for (const cmd of [process.env.LABPY_PYTHON, 'python3', 'python', 'py'].filter(Boolean)) {
    const r = spawnSync(cmd, ['-c', 'import sys; print(sys.version_info[0], sys.version_info[1])'], { encoding: 'utf8' });
    if (r.status === 0) {
      const [maj, min] = r.stdout.trim().split(' ').map(Number);
      if (maj === 3 && min >= 11) return cmd;
    }
  }
  return null;
}

const python = findPython();
const onlyArg = process.argv.indexOf('--only');
const only = onlyArg >= 0 ? process.argv[onlyArg + 1] : null;
const OPTIONAL = /No module named '(numpy|pandas|matplotlib|scipy|sklearn|pytest)/;

for (const t of topics().filter((x) => x.file && (!only || x.file.includes(only)))) {
  const samples = fences(fs.readFileSync(path.join(TUT, t.file), 'utf8')).filter((f) => f.kind === 'run' || f.kind === 'cloud');
  test(`examples run: ${t.id} ${t.title}`, { skip: python ? false : 'Python 3.11+ not found (set LABPY_PYTHON)' }, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'labpy-sample-'));
    try {
      fs.writeFileSync(path.join(dir, 'r.py'), RUNNER);
      for (const f of samples) {
        if (/micropip/.test(f.code)) continue;               // needs the network and Pyodide
        fs.writeFileSync(path.join(dir, 's.py'), f.code);
        const args = f.kind === 'cloud' ? ['s.py'] : ['r.py', 's.py'];
        const r = spawnSync(python, args, {
          cwd: dir, encoding: 'utf8', timeout: 90_000,
          input: /int\(/.test(f.code) ? '5\n7\n' : 'Ada\n',
          env: { ...process.env, MPLBACKEND: 'Agg', PYTHONIOENCODING: 'utf-8' },
        });
        const failed = r.status !== 0 || r.error;
        if (failed && OPTIONAL.test(r.stderr || '')) continue;   // library not installed here
        const expectError = /error/i.test(f.title);
        const where = `${t.file} line ${f.line} "${f.title}"`;
        if (expectError) assert.ok(failed, `${where}: expected an error but it succeeded`);
        else assert.ok(!failed, `${where} failed:\n${(r.stderr || String(r.error)).split('\n').slice(-6).join('\n')}`);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}
