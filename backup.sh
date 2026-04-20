#!/bin/bash
# backup.sh — crée un zip horodaté de ~/versions-app dans ~/Backups
# Usage : bash backup.sh
# À lancer UNIQUEMENT quand tu veux une photo (pas d'automatisme, pas lié au deploy).
set -e

REPO="$HOME/versions-app"
BACKUP_DIR="$HOME/Backups"

mkdir -p "$BACKUP_DIR"

STAMP=$(date +%Y-%m-%d-%H%M)
ZIP="$BACKUP_DIR/versions-app-$STAMP.zip"

echo "📸 Backup en cours..."
cd "$HOME"
zip -r -q "$ZIP" versions-app \
  -x 'versions-app/node_modules/*' \
  -x 'versions-app/dist/*' \
  -x 'versions-app/.eslintcache' \
  -x 'versions-app/.cache/*'

SIZE=$(du -h "$ZIP" | cut -f1)
echo "✅ Backup créé : $ZIP  ($SIZE)"
