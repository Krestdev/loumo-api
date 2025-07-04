#!/bin/bash

mkdir -p "$DEST"

SRC="../src/services/templates"
DEST="../build/services/templates"

if [ -d "$DEST" ]; then
  echo "❌ Folder already exists: $DEST"
  exit 1
else
  echo "📁 Copying templates..."
  cp -r "$SRC" "$DEST"
  echo "✅ Templates copied to $DEST"
fi