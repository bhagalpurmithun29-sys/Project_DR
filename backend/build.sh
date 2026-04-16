#!/usr/bin/env bash

# Exit on error
set -o errexit

echo "🚀 Starting Production Build (Node + Python)..."

# 1. Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# 2. Upgrade pip and install Python dependencies
# Use python3 -m pip to ensure we use the correct environment's pip
echo "🐍 Setting up Python environment..."
python3 -m pip install --upgrade pip

if [ -f requirements.txt ]; then
    echo "📜 Installing dependencies from requirements.txt..."
    python3 -m pip install -r requirements.txt
else
    echo "⚠️ requirements.txt not found. Skipping python package installation."
fi

echo "✅ Build Completed Successfully!"
