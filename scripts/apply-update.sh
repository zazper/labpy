#!/usr/bin/env bash
# Apply an update zip to the repo root. Made for Git Bash on Windows; works on Linux and macOS too.
set -euo pipefail

die() { echo "ERROR: $*" >&2; exit 1; }

usage() {
cat <<'ENDUSAGE'
Apply an update zip to this repository.

Usage
  bash scripts/apply-update.sh <update.zip> [options]

Options
  --dry-run               show what would change; copy nothing
  --yes                   skip the confirmation questions
  --npm "pkg1 pkg2"       run "npm install pkg1 pkg2" after copying
  --ignore "line"         add a line to .gitignore if it is missing (repeatable)
  --include-package-json  also overwrite package.json and package-lock.json (normally protected)
  -h, --help              show this help

What it does
  1. Unzips into a temporary folder (tries unzip, python, tar, then PowerShell)
  2. Lists each file as NEW, CHANGED or same, then asks before copying
  3. Copies into the repo root. Never touches .git, node_modules, .env, package.json or package-lock.json
  4. Shows the update's UPDATE.md (it is not copied) and the git status

Example
  bash scripts/apply-update.sh ~/Downloads/labpy-ui-update.zip --ignore "site/ruff/" --npm "fflate @astral-sh/ruff-wasm-web"

Only apply zip files you trust: they overwrite files in your repo.
ENDUSAGE
}

ZIP=""; DRY=0; YES=0; NPM=""; PKG=0; IGN=()
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --dry-run) DRY=1 ;;
    --yes) YES=1 ;;
    --include-package-json) PKG=1 ;;
    --npm)    [ $# -ge 2 ] || die "--npm needs a value"; NPM="$2"; shift ;;
    --ignore) [ $# -ge 2 ] || die "--ignore needs a value"; IGN+=("$2"); shift ;;
    -*) die "Unknown option: $1 (try --help)" ;;
    *)  [ -z "$ZIP" ] || die "Only one zip file at a time."; ZIP="$1" ;;
  esac
  shift
done
[ -n "$ZIP" ] || { usage; exit 1; }
[ -f "$ZIP" ] || die "Zip file not found: $ZIP"
ZIP="$(cd "$(dirname "$ZIP")" && pwd)/$(basename "$ZIP")"

REPO="$(git rev-parse --show-toplevel 2>/dev/null)" || die "Not inside a git repository."
cd "$REPO"
[ -f package.json ] || die "No package.json in $REPO. Run this inside the LabPy repo."

ask() { [ "$YES" = 1 ] && return 0; local a; read -r -p "$1 [y/N] " a; [[ "$a" =~ ^[Yy] ]]; }
win() { if command -v cygpath >/dev/null 2>&1; then cygpath -w "$1"; else echo "$1"; fi; }

extract() {   # extract <zip> <dest>
  local z="$1" d="$2" py
  if command -v unzip >/dev/null 2>&1; then unzip -q -o "$z" -d "$d"; return; fi
  for py in python3 python; do
    if command -v "$py" >/dev/null 2>&1 && "$py" -c 'import zipfile' >/dev/null 2>&1; then
      "$py" -c 'import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])' "$(win "$z")" "$(win "$d")"; return
    fi
  done
  if command -v tar >/dev/null 2>&1 && tar --version 2>/dev/null | grep -qi bsdtar; then tar -xf "$(win "$z")" -C "$(win "$d")"; return; fi
  if command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Expand-Archive -LiteralPath '$(win "$z")' -DestinationPath '$(win "$d")' -Force"; return
  fi
  die "Cannot unzip: install unzip (pacman -S unzip) or Python, then try again."
}

T="$(mktemp -d)"; LIST="$(mktemp)"; trap 'rm -rf "$T" "$LIST"' EXIT
echo "Unzipping $(basename "$ZIP") ..."
extract "$ZIP" "$T"
[ -z "$(find "$T" -type l 2>/dev/null)" ] || die "The zip contains symbolic links. Refusing to continue."

# If everything is inside one top-level folder (like labpy/), use that folder as the root.
SRC="$T"; top="$(ls -A "$T")"
if [ "$(printf '%s\n' "$top" | wc -l | tr -d ' ')" = 1 ] && [ -d "$T/$top" ]; then
  case "$top" in site|src|scripts|docs|public|tests) ;; *) SRC="$T/$top" ;; esac
fi

PROTECT='^(\.git/|node_modules/|\.env($|\.)|__MACOSX/|UPDATE\.md$'
[ "$PKG" = 1 ] || PROTECT="$PROTECT|package\\.json$|package-lock\\.json$"
PROTECT="$PROTECT)"

new=0; chg=0; same=0; skip=0
echo; echo "Files in the update:"
while IFS= read -r f; do
  [ -n "$f" ] || continue
  if [[ "$f" =~ $PROTECT ]]; then
    [ "$f" = "UPDATE.md" ] || echo "  protected   $f (not touched)"
    skip=$((skip+1)); continue
  fi
  if [ ! -e "$REPO/$f" ]; then echo "  NEW         $f"; new=$((new+1)); echo "$f" >> "$LIST"
  elif cmp -s "$SRC/$f" "$REPO/$f"; then echo "  same        $f"; same=$((same+1))
  else echo "  CHANGED     $f"; chg=$((chg+1)); echo "$f" >> "$LIST"; fi
done < <(cd "$SRC" && find . -type f | sed 's#^\./##' | sort)
echo; echo "Summary: $new new, $chg changed, $same unchanged, $skip protected/skipped"

need_ign=0
for line in ${IGN[@]+"${IGN[@]}"}; do grep -qxF "$line" .gitignore 2>/dev/null || need_ign=$((need_ign+1)); done
if [ "$new" -eq 0 ] && [ "$chg" -eq 0 ] && [ "$need_ign" -eq 0 ] && [ -z "$NPM" ]; then echo "Nothing to do: the repo already matches this update."; exit 0; fi
if [ "$DRY" = 1 ]; then
  [ ${#IGN[@]} -gt 0 ] && echo "Would add to .gitignore: ${IGN[*]}"
  [ -n "$NPM" ] && echo "Would run: npm install $NPM"
  echo "Dry run: nothing was copied."; exit 0
fi

if [ -n "$(git status --porcelain)" ]; then
  echo; echo "Note: you have uncommitted changes. Commit them first so this update shows up as its own diff."
  ask "Continue anyway?" || { echo "Cancelled."; exit 0; }
fi
if [ $((new+chg)) -gt 0 ]; then
  ask "Copy $((new+chg)) file(s) into $REPO?" || { echo "Cancelled."; exit 0; }
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    mkdir -p "$(dirname "$REPO/$f")"; cp "$SRC/$f" "$REPO/$f"
  done < "$LIST"
  echo "Copied."
fi

for line in ${IGN[@]+"${IGN[@]}"}; do
  if ! grep -qxF "$line" .gitignore 2>/dev/null; then
    { [ -s .gitignore ] && [ -n "$(tail -c1 .gitignore)" ] && echo; echo "$line"; } >> .gitignore
    echo "Added to .gitignore: $line"
  else echo ".gitignore already has: $line"; fi
done

if [ -n "$NPM" ]; then
  echo "Running: npm install $NPM"
  # shellcheck disable=SC2086
  npm install $NPM
fi

if [ -f "$SRC/UPDATE.md" ]; then echo; echo "----- UPDATE.md (from the zip) -----"; cat "$SRC/UPDATE.md"; echo "------------------------------------"; fi
echo; echo "git status:"; git status --short
echo; echo "Next: npm install (if you have not), npm start, test, then: bash scripts/release.sh dry minor"
