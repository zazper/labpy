// Bundles src/app.js into site/app.js and copies the Ruff WebAssembly file. Runs on `npm install`.
const fs = require('fs');
const path = require('path');
require('esbuild').buildSync({
  entryPoints: ['src/app.js'], bundle: true, minify: true,
  format: 'iife', target: 'es2020', outfile: 'site/app.js', logLevel: 'error'
});
try {
  fs.mkdirSync('site/ruff', { recursive: true });
  fs.copyFileSync(path.join('node_modules', '@astral-sh', 'ruff-wasm-web', 'ruff_wasm_bg.wasm'), 'site/ruff/ruff_wasm_bg.wasm');
} catch (e) { console.warn('Ruff wasm not copied (Format and Check will not work):', e.message); }
console.log('Built site/app.js');
