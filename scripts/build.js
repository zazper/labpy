// Bundles src/app.js (CodeMirror + app code) into public/app.js. Runs on `npm install`.
require('esbuild').buildSync({
  entryPoints: ['src/app.js'], bundle: true, minify: true,
  format: 'iife', target: 'es2020', outfile: 'public/app.js'
});
console.log('Built public/app.js');
