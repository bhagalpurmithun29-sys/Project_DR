#!/usr/bin/env bash

# Exit on error
set -o errexit

echo "🚀 Starting Production Build (Node + Python)..."

# 1. Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# 2. Ensure Python dependencies are available for AI features
echo "🐍 Verifying Python environment..."

if [ -f requirements.txt ]; then
    if python3 -c "import ultralytics, cv2, numpy" >/dev/null 2>&1; then
        echo "✅ Python AI dependencies already available."
    else
        echo "📜 Installing dependencies from requirements.txt..."
        if ! python3 -m pip install --disable-pip-version-check -r requirements.txt; then
            echo "⚠️ Could not install Python dependencies automatically."
            echo "⚠️ Backend can still start, but AI scan analysis will fail until dependencies are installed."
        fi
    fi
else
    echo "⚠️ requirements.txt not found. Skipping python package installation."
fi

echo "✅ Build Completed Successfully!"
