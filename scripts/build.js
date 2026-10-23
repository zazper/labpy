// Bundles src/app.js (CodeMirror + app code) into site/app.js. Runs on `npm install`.
require('esbuild').buildSync({
  entryPoints: ['src/app.js'], bundle: true, minify: true,
  format: 'iife', target: 'es2020', outfile: 'site/app.js'
});
console.log('Built site/app.js');
