#!/usr/bin/env bash
# Run this once from the project root: bash scripts/download-characters.sh
# Downloads character portrait images into public/characters/
set -e
DEST="$(dirname "$0")/../public/characters"
mkdir -p "$DEST"

declare -A IMAGES=(
  ["duck.png"]="https://i.ibb.co/pBTPSTwC/image.png"
  ["diesel.png"]="https://i.ibb.co/bgRRd1VD/image.png"
  ["boco.webp"]="https://i.ibb.co/gFr7KQJN/Main-Bo-Co-Model.webp"
  ["toby.webp"]="https://i.ibb.co/9H6WZs6b/Main-Toby-CGI.webp"
)

for FILE in "${!IMAGES[@]}"; do
  URL="${IMAGES[$FILE]}"
  OUT="$DEST/$FILE"
  if [ -f "$OUT" ]; then
    echo "✓ $FILE already exists, skipping"
  else
    echo "↓ Downloading $FILE..."
    curl -fsSL "$URL" -o "$OUT" && echo "  ✓ saved to $OUT" || echo "  ✗ failed: $URL"
  fi
done
echo "Done."
