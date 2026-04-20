#!/bin/bash
# push.sh — déploie versions-app sur Vercel via GitHub
# Usage : bash push.sh "message de commit"
set -e

cd "$(dirname "$0")"

MSG="${1:-Update}"

echo "📊 État du repo..."
git status --short

echo ""
echo "📦 Commit & push..."
git add -A
git commit -m "$MSG"
git push

echo ""
echo "✅ Poussé sur GitHub. Vercel redéploie automatiquement (~90s)."
echo "   → https://vercel.com/goldeymusics-projects/versions-app/deployments"
