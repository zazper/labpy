#!/usr/bin/env bash
# LabPy release helper: one entry point for every release-related command.
# Run from anywhere inside the repo:   bash scripts/release.sh help
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "ERROR: not inside a git repository." >&2; exit 1; }
cd "$ROOT"
RELEASE_JS="scripts/release.js"

die() { echo "ERROR: $*" >&2; exit 1; }
cur_version() { node -p "require('./package.json').version"; }
last_tag() { git describe --tags --abbrev=0 2>/dev/null || true; }

usage() {
cat <<'ENDUSAGE'
LabPy release helper

Usage
  release.sh <command> [options]

RELEASE
  patch   [-m "msg"] [--yes] [--no-build]   1.0.2 -> 1.0.3  (bug fixes)
  minor   [-m "msg"] [--yes] [--no-build]   1.0.2 -> 1.1.0  (new features)
  major   [-m "msg"] [--yes] [--no-build]   1.0.2 -> 2.0.0  (breaking changes)
  x.y.z   [-m "msg"] [--yes] [--no-build]   explicit version, e.g. 1.4.0
  dry <patch|minor|major|x.y.z>             show what a release would do; changes nothing

LOOK AROUND
  status     branch, version, last tag, uncommitted files, unpushed and unreleased commits
  changes    commits since the last tag (the release notes draft)
  tags       the 10 most recent tags with dates
  version    version in package.json and the last tag
  check      run the build (same check the release does)

FIX A MISTAKE
  undo       remove the newest release commit and tag, only if it was never pushed

OPTIONS (for release commands)
  -m "msg"    commit all uncommitted changes with this message first
  --yes       skip the confirmation question
  --no-build  skip the build check
  --dry-run   same as the dry command

NOTES
  * Pushing main deploys to Hostinger immediately. Use "dry" first if unsure.
  * From a feature branch the release merges it into main for you.
  * You can also run this through npm:  npm run release -- patch
ENDUSAGE
}

cmd="${1:-help}"
[ $# -gt 0 ] && shift

case "$cmd" in
  help|-h|--help)
    usage ;;

  version)
    echo "package.json : $(cur_version)"
    echo "last tag     : $(last_tag)" ;;

  status)
    tag="$(last_tag)"
    echo "branch       : $(git branch --show-current)"
    echo "package.json : $(cur_version)"
    echo "last tag     : ${tag:-(none)}"
    if [ -n "$tag" ]; then echo "unreleased   : $(git rev-list --count "$tag"..HEAD) commit(s) since $tag"; fi
    if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
      read -r behind ahead < <(git rev-list --left-right --count '@{u}...HEAD')
      echo "vs remote    : $ahead ahead, $behind behind"
    else
      echo "vs remote    : no upstream set for this branch"
    fi
    dirty="$(git status --short)"
    if [ -n "$dirty" ]; then echo "uncommitted  :"; echo "$dirty" | sed 's/^/    /'; else echo "uncommitted  : none"; fi ;;

  changes)
    tag="$(last_tag)"
    if [ -n "$tag" ]; then echo "Commits since $tag:"; git log --oneline "$tag"..HEAD; else git log --oneline -n 20; fi ;;

  tags)
    git for-each-ref --sort=-creatordate --count=10 \
      --format='%(refname:short)  %(creatordate:short)  %(subject)' refs/tags ;;

  check)
    npm run build ;;

  dry)
    [ $# -ge 1 ] || die "usage: release.sh dry <patch|minor|major|x.y.z>"
    node "$RELEASE_JS" "$@" --dry-run ;;

  patch|minor|major)
    node "$RELEASE_JS" "$cmd" "$@" ;;

  [0-9]*.[0-9]*.[0-9]*)
    node "$RELEASE_JS" "$cmd" "$@" ;;

  undo)
    tag="$(git tag --points-at HEAD | head -n 1)"
    subj="$(git log -1 --format=%s)"
    [[ "$subj" == Release\ * && -n "$tag" ]] || die "HEAD is not a release commit made by this script."
    [ -z "$(git status --porcelain)" ] || die "You have uncommitted changes. Commit or stash them first."
    if [ -n "$(git branch -r --contains HEAD 2>/dev/null)" ]; then
      die "This release commit is already on the remote, so it may be deployed. Undo is not safe."
    fi
    set +e; git ls-remote --exit-code --tags origin "refs/tags/$tag" >/dev/null 2>&1; rc=$?; set -e
    case $rc in
      0) die "Tag $tag is already on the remote. Undo is not safe." ;;
      2) ;;  # tag not on remote: fine
      *) die "Could not reach the remote to verify. Check your connection and try again." ;;
    esac
    read -r -p "Delete tag $tag and drop commit \"$subj\"? [y/N] " a
    [[ "$a" =~ ^[Yy] ]] || { echo "Cancelled."; exit 0; }
    git tag -d "$tag"
    git reset --hard HEAD~1
    echo "Undone. package.json is back to $(cur_version)." ;;

  *)
    echo "Unknown command: $cmd" >&2; echo >&2
    usage >&2; exit 1 ;;
esac
