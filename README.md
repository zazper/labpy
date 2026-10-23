# LabPy

Python in the browser. A multi-file editor (CodeMirror 6) runs Python (Pyodide / WebAssembly) in a Web Worker.
Code runs on the visitor's machine, never on your server.

## Run locally
    npm install      # also builds site/app.js
    npm start        # http://localhost:3000

## Deploy on Hostinger (Node.js Web App, from GitHub)
1. Push this repo to GitHub.
2. hPanel > Websites > Add website > Node.js Web App > connect the repo.
3. Build command: `npm install`   Start command: `npm start` (or `node server.js`)
4. Deploy. Every push to the branch redeploys.

## Notes
- Pyodide version is set in `site/worker.js` (`V`). Runtime and packages load from jsDelivr.
- `server.js` sends COOP/COEP headers. These enable input(). Needs HTTPS (or localhost).
- Stop terminates the worker and restarts Python (state is reset).
- Files are saved in the browser (localStorage). "Copy share link" encodes all files into the URL.
