#!/bin/bash

# Project Repository Creator
# Creates a new GitHub repository structure for a Barbrick Design project
# Usage: ./create-project-repo.sh <project-html-file> <output-directory>

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <project-html-file> <output-directory>"
    echo "Example: $0 oasis.html /tmp/oasis-repo"
    exit 1
fi

HTML_FILE="$1"
OUTPUT_DIR="$2"
PROJECT_NAME=$(basename "$HTML_FILE" .html)
REPO_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr '_' '-')

if [ ! -f "$HTML_FILE" ]; then
    echo "Error: Project file not found: $HTML_FILE"
    exit 1
fi

if [ -d "$OUTPUT_DIR" ]; then
    echo "Error: Output directory already exists: $OUTPUT_DIR"
    exit 1
fi

echo "════════════════════════════════════════════════════"
echo "  Creating Repository for: $PROJECT_NAME"
echo "  Output Directory: $OUTPUT_DIR"
echo "  Repository Name: $REPO_NAME"
echo "════════════════════════════════════════════════════"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/shared/js"
mkdir -p "$OUTPUT_DIR/shared/css"
mkdir -p "$OUTPUT_DIR/shared/utils"
mkdir -p "$OUTPUT_DIR/.github/workflows"

# Copy main HTML file
echo "📄 Copying project file..."
cp "$HTML_FILE" "$OUTPUT_DIR/index.html"

# Create README
echo "📝 Creating README..."
cat > "$OUTPUT_DIR/README.md" << EOF
# $PROJECT_NAME

Part of the Barbrick Design project collection.

## 🚀 Live Demo

Visit: https://barbrickdesign.github.io/$REPO_NAME/

## 📖 About

[Add project description here]

## 🎯 Features

- Feature 1
- Feature 2
- Feature 3

## 🛠️ Usage

[Add usage instructions here]

## 🔗 Related Projects

Main Hub: https://barbrickdesign.github.io/

## 📜 License

© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.

This project is proprietary software. See [LICENSE](LICENSE) for details.

## 📧 Contact

- Email: BarbrickDesign@gmail.com
- GitHub: [@barbrickdesign](https://github.com/barbrickdesign)

---

**Note:** This repository is synchronized from the main hub at [barbrickdesign.github.io](https://github.com/barbrickdesign/barbrickdesign.github.io). Shared code is automatically updated from the central repository.
EOF

# Create LICENSE
echo "⚖️  Creating LICENSE..."
cat > "$OUTPUT_DIR/LICENSE" << EOF
PROPRIETARY SOFTWARE LICENSE

Copyright © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.

This software and associated documentation files (the "Software") are the 
exclusive property of Ryan Barbrick. All rights are reserved.

PERMISSIONS:
- View the software for educational purposes
- Run the software for personal, non-commercial use
- Study the code to learn programming concepts

RESTRICTIONS:
You may NOT:
- Copy, reproduce, or distribute the Software
- Modify or create derivative works
- Use for commercial purposes without written permission
- Remove or alter copyright notices
- Sublicense, sell, or transfer the Software

For licensing inquiries, contact: BarbrickDesign@gmail.com
EOF

# Create .gitignore
echo "🚫 Creating .gitignore..."
cat > "$OUTPUT_DIR/.gitignore" << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.log

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Temporary files
tmp/
temp/
*.tmp
EOF

# Create GitHub Actions workflow for deployment
echo "⚙️  Creating deployment workflow..."
cat > "$OUTPUT_DIR/.github/workflows/deploy-pages.yml" << EOF
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF

# Create sync workflow
echo "🔄 Creating sync workflow..."
cat > "$OUTPUT_DIR/.github/workflows/sync-from-hub.yml" << EOF
name: Sync Shared Code from Hub

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout this repo
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Checkout main hub
        uses: actions/checkout@v4
        with:
          repository: barbrickdesign/barbrickdesign.github.io
          path: hub
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Sync shared files
        run: |
          # Copy shared JavaScript
          if [ -d "hub/js" ]; then
            rsync -av --delete hub/js/ shared/js/
          fi

          # Copy shared CSS
          if [ -d "hub/css" ]; then
            rsync -av --delete hub/css/ shared/css/
          fi

          # Copy shared utilities
          if [ -d "hub/src/utils" ]; then
            rsync -av --delete hub/src/utils/ shared/utils/
          fi

      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add shared/
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "Sync shared code from main hub" && git push)
EOF

# Create package.json if project has dependencies
echo "📦 Creating package.json..."
cat > "$OUTPUT_DIR/package.json" << EOF
{
  "name": "@barbrickdesign/$REPO_NAME",
  "version": "1.0.0",
  "description": "$PROJECT_NAME - Part of Barbrick Design collection",
  "main": "index.html",
  "scripts": {
    "start": "python3 -m http.server 8000",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/barbrickdesign/$REPO_NAME.git"
  },
  "author": "Ryan Barbrick <BarbrickDesign@gmail.com>",
  "license": "UNLICENSED",
  "private": true
}
EOF

# Analyze and copy dependencies
echo "🔍 Analyzing dependencies..."
if command -v grep &> /dev/null; then
    # Extract local JS dependencies
    grep -oP '<script[^>]*src=["'\'']([^"'\'']+)["'\'']' "$HTML_FILE" | \
        grep -oP '(?<=src=["'\''])[^"'\'']+' | \
        while read -r dep; do
            if [[ "$dep" == /js/* ]] || [[ "$dep" == js/* ]]; then
                DEP_FILE=$(echo "$dep" | sed 's|^/||')
                if [ -f "$DEP_FILE" ]; then
                    cp "$DEP_FILE" "$OUTPUT_DIR/shared/js/"
                    echo "  ✓ Copied: $DEP_FILE"
                fi
            fi
        done

    # Extract local CSS dependencies
    grep -oP '<link[^>]*href=["'\'']([^"'\'']+\.css)["'\'']' "$HTML_FILE" | \
        grep -oP '(?<=href=["'\''])[^"'\'']+' | \
        while read -r dep; do
            if [[ "$dep" == /css/* ]] || [[ "$dep" == css/* ]]; then
                DEP_FILE=$(echo "$dep" | sed 's|^/||')
                if [ -f "$DEP_FILE" ]; then
                    cp "$DEP_FILE" "$OUTPUT_DIR/shared/css/"
                    echo "  ✓ Copied: $DEP_FILE"
                fi
            fi
        done
fi

# Initialize git repository
echo "🎯 Initializing git repository..."
cd "$OUTPUT_DIR"
git init
git add .
git commit -m "Initial repository setup for $PROJECT_NAME

Generated from main hub: barbrickdesign.github.io
Project file: $HTML_FILE
Repository: $REPO_NAME"

echo ""
echo "════════════════════════════════════════════════════"
echo "✅ Repository created successfully!"
echo ""
echo "📍 Location: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "  1. Review the generated files in $OUTPUT_DIR"
echo "  2. Create GitHub repository: https://github.com/new"
echo "     - Name: $REPO_NAME"
echo "     - Public repository"
echo "     - Do NOT initialize with README"
echo ""
echo "  3. Push to GitHub:"
echo "     cd $OUTPUT_DIR"
echo "     git remote add origin https://github.com/barbrickdesign/$REPO_NAME.git"
echo "     git push -u origin main"
echo ""
echo "  4. Enable GitHub Pages in repository settings"
echo "  5. Update projects.json in main hub"
echo ""
echo "════════════════════════════════════════════════════"
