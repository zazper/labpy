# Installing, updating and releasing LabPy

For a quick overview see [README.md](README.md). This page has the step-by-step commands (Git Bash on Windows; they also work on Linux and macOS).

## Requirements

- Node.js 18 or newer, and npm
- Git (on Windows, Git Bash)

## First-time setup

    git clone https://github.com/zazper/labpy.git
    cd labpy
    npm install        # installs packages and builds site/app.js
    npm start          # http://localhost:3000

`npm install` also copies the Ruff WebAssembly file (used by Format and Check) to `site/ruff/`. That folder is built, not committed.

## Applying an update zip

Update zips contain changed files only (same folder names as the repo). Use the helper script instead of unzipping by hand:

    bash scripts/apply-update.sh path/to/update.zip --dry-run     # preview: NEW / CHANGED / same
    bash scripts/apply-update.sh path/to/update.zip               # apply

Useful options:

- `--npm "pkg1 pkg2"` runs `npm install pkg1 pkg2` after copying (when the update needs new libraries)
- `--ignore "site/ruff/"` adds a line to `.gitignore` if it is missing
- `--yes` skips the questions; `--help` shows everything

The script never overwrites `package.json`, `package-lock.json`, `.git`, `node_modules` or `.env`. Commit your own work first so the update appears as a separate change in `git status`. Each update zip includes an `UPDATE.md` with its own steps.

After applying: `npm install`, stop and restart `npm start`, then hard-refresh the browser (Ctrl+Shift+R). A blank page usually means `site/app.js` was not rebuilt: run `npm run build`.

## Releasing (tag and deploy)

Pushing `main` deploys to Hostinger automatically, so release with the script:

    bash scripts/release.sh status          # where things stand
    bash scripts/release.sh compare         # local vs GitHub (read-only)
    bash scripts/release.sh dry minor       # preview a release
    bash scripts/release.sh minor -m "Describe the change"

Use `patch` for fixes, `minor` for features, `major` for breaking changes. `bash scripts/release.sh help` lists every command, including `undo` for a release that was not pushed yet.

## Hostinger

- Node.js Web App connected to the GitHub repo; branch `main`.
- Build command `npm install`; start command `npm start`.
- After a deploy, check the build log for `Built site/app.js` with no "Ruff wasm not copied" warning.
- In the browser console `crossOriginIsolated` should be `true`, and `/ruff/ruff_wasm_bg.wasm` should load (status 200) the first time Format or Check is used.

## Folder map

    server.js            Express server (adds the COOP/COEP headers)
    site/                files served to the browser (index.html, style.css, worker.js, tutorial/)
    site/tutorial/       tutorial topics (.md) and toc.json (the topic list and order)
    src/                 browser source code, bundled into site/app.js
    scripts/             build.js, release.js, release.sh, apply-update.sh
    docs/                design and planning documents (versioned)

## Troubleshooting

- **Blank editor or no response to buttons:** rebuild with `npm run build`, restart, hard-refresh. Check the browser console (F12) for the first red error.
- **Format or Check fails:** confirm `site/ruff/ruff_wasm_bg.wasm` exists. If not, run `npm install` again.
- **"LF will be replaced by CRLF" warnings:** harmless; `git config core.autocrlf input` silences them.
- **Port 3000 in use:** stop the other `npm start`, or set `PORT=3001`.
