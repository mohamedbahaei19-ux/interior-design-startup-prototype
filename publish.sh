#!/usr/bin/env bash
# Push this prototype to GitHub Pages.
#
#   ./publish.sh <your-github-username> [repo-name]
#
# Create the empty repo first at https://github.com/new
# (Public, and do NOT tick "Add a README" — this repo already has commits.)

set -euo pipefail

USER="${1:-}"
REPO="${2:-interior-design-startup-prototype}"

if [ -z "$USER" ]; then
  echo "usage: ./publish.sh <your-github-username> [repo-name]" >&2
  exit 1
fi

cd "$(dirname "$0")"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "https://github.com/$USER/$REPO.git"
else
  git remote add origin "https://github.com/$USER/$REPO.git"
fi

git push -u origin main

cat <<EOF

Pushed. One more step, in the browser:

  1. https://github.com/$USER/$REPO/settings/pages
  2. Source → "Deploy from a branch"
  3. Branch → main, folder → / (root) → Save

Give it a minute, then share:

  https://$USER.github.io/$REPO/

EOF
