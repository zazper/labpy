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
  compare    compare local branches, version and tags with GitHub (read-only)
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

  compare)
    git remote get-url origin >/dev/null 2>&1 || die "No remote named origin."
    echo "Checking origin: $(git remote get-url origin)   (read-only; nothing is changed)"
    git fetch origin --no-tags --quiet || die "Could not reach origin. Check your connection and sign-in."
    rt="$(git ls-remote --tags --refs origin 'v*')" || die "Could not list tags on origin."
    tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
    git for-each-ref --format='%(refname:short) %(objectname)' 'refs/tags/v*' > "$tmp/local"
    printf '%s\n' "$rt" | awk 'NF{sub("refs/tags/","",$2); print $2, $1}' > "$tmp/remote"

    issues=0; hints=""
    add_hint() { hints="$hints
  - $1"; issues=$((issues+1)); }

    cmp_branch() {
      local b="$1" behind ahead
      git rev-parse --verify -q "refs/heads/$b" >/dev/null || return 0
      if ! git rev-parse --verify -q "refs/remotes/origin/$b" >/dev/null; then
        echo "  $b: not on GitHub yet"; add_hint "Publish the branch:  git push -u origin $b"; return 0
      fi
      read -r behind ahead < <(git rev-list --left-right --count "origin/$b...$b")
      if [ "$ahead" = 0 ] && [ "$behind" = 0 ]; then echo "  $b: in sync with origin/$b"
      else
        echo "  $b: $ahead ahead, $behind behind origin/$b"
        [ "$behind" != 0 ] && add_hint "Get GitHub's changes into $b:  git pull --ff-only   (on branch $b)"
        [ "$ahead" != 0 ] && add_hint "Send local commits to GitHub:  git push   (on branch $b)"
      fi
      return 0
    }

    echo; echo "Branches"
    cur="$(git branch --show-current)"
    cmp_branch main
    [ -n "$cur" ] && [ "$cur" != "main" ] && cmp_branch "$cur"

    echo; echo "Versions"
    rv="$(git show origin/main:package.json 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).version)}catch(e){console.log('?')}})")"
    echo "  package.json : local $(cur_version)   |   origin/main ${rv:-?}"
    ll="$(awk '{print $1}' "$tmp/local" | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1 || true)"
    rl="$(awk '{print $1}' "$tmp/remote" | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1 || true)"
    echo "  latest tag   : local ${ll:-(none)}   |   GitHub ${rl:-(none)}"
    if [ -n "$rl" ] && git rev-parse -q --verify "refs/tags/$rl" >/dev/null && git rev-parse -q --verify refs/remotes/origin/main >/dev/null; then
      if git merge-base --is-ancestor "$rl" origin/main; then echo "  $rl is contained in origin/main"
      else echo "  $rl is NOT contained in origin/main"; add_hint "Latest GitHub tag $rl is not on origin/main. Check which branch it was made on."; fi
    fi

    echo; echo "Tags"
    diffs="$(awk 'FILENAME==ARGV[1]{l[$1]=$2; next} {r[$1]=$2} END{
      for(t in l){ if(!(t in r)) print "LOCAL_ONLY " t; else if(l[t]!=r[t]) print "DIFFERENT " t }
      for(t in r){ if(!(t in l)) print "REMOTE_ONLY " t } }' "$tmp/local" "$tmp/remote" | sort -V -k2)"
    if [ -z "$diffs" ]; then echo "  all $(wc -l < "$tmp/local" | tr -d ' ') local tag(s) match GitHub"
    else
      while read -r kind t; do
        case "$kind" in
          LOCAL_ONLY)  echo "  $t: only on this computer";  add_hint "Publish the tag:  git push origin $t" ;;
          REMOTE_ONLY) echo "  $t: only on GitHub";         add_hint "Download the tag:  git fetch origin tag $t" ;;
          DIFFERENT)   echo "  $t: points to a different commit locally and on GitHub"; add_hint "Tag $t differs. Do not overwrite it; investigate before changing anything." ;;
        esac
      done <<< "$diffs"
    fi

    echo
    if [ "$issues" = 0 ]; then echo "Result: everything matches GitHub."
    else echo "Result: $issues difference(s). Suggested fixes:$hints"; fi ;;

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
