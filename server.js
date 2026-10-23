const express = require('express');
const path = require('path');
const app = express();

// COOP/COEP make the page "cross-origin isolated", which enables SharedArrayBuffer.
// LabPy uses it for input(). Everything still works without it, except input().
app.use((req, res, next) => {
  res.set({
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
  });
  next();
});
app.use(express.static(path.join(__dirname, 'site'), { maxAge: '1h' }));
app.listen(process.env.PORT || 3000, () => console.log('LabPy running'));
