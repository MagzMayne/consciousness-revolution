#!/bin/bash

# Dependency Analyzer for HTML Projects
# Scans an HTML file and lists all JavaScript and CSS dependencies
# Usage: ./analyze-project-deps.sh path/to/project.html

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-html-file>"
    echo "Example: $0 contributor-dashboard-hub.html"
    exit 1
fi

HTML_FILE="$1"
PROJECT_NAME=$(basename "$HTML_FILE" .html)

if [ ! -f "$HTML_FILE" ]; then
    echo "Error: File not found: $HTML_FILE"
    exit 1
fi

echo "════════════════════════════════════════════════════"
echo "  Dependency Analysis: $PROJECT_NAME"
echo "════════════════════════════════════════════════════"
echo ""

# Extract JavaScript dependencies
echo "📦 JavaScript Dependencies:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -oP '<script[^>]*src=["'\'']([^"'\'']+)["'\'']' "$HTML_FILE" | \
    grep -oP '(?<=src=["'\''])[^"'\'']+' | \
    while read -r dep; do
        if [[ "$dep" == http* ]]; then
            echo "  🌐 External: $dep"
        elif [[ "$dep" == /js/* ]] || [[ "$dep" == js/* ]]; then
            echo "  📄 Local: $dep"
        elif [[ "$dep" == /src/* ]] || [[ "$dep" == src/* ]]; then
            echo "  📄 Source: $dep"
        else
            echo "  ❓ Other: $dep"
        fi
    done
echo ""

# Extract CSS dependencies
echo "🎨 CSS Dependencies:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -oP '<link[^>]*href=["'\'']([^"'\'']+\.css)["'\'']' "$HTML_FILE" | \
    grep -oP '(?<=href=["'\''])[^"'\'']+' | \
    while read -r dep; do
        if [[ "$dep" == http* ]]; then
            echo "  🌐 External: $dep"
        elif [[ "$dep" == /css/* ]] || [[ "$dep" == css/* ]]; then
            echo "  📄 Local: $dep"
        else
            echo "  ❓ Other: $dep"
        fi
    done
echo ""

# Check for specific integrations
echo "🔌 Integration Detection:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "paypal" "$HTML_FILE"; then
    echo "  💰 PayPal Integration: YES"
fi

if grep -q -i "solana\|ethereum\|web3" "$HTML_FILE"; then
    echo "  ⛓️  Blockchain Integration: YES"
fi

if grep -q -i "tensorflow\|openai\|gemini" "$HTML_FILE"; then
    echo "  🤖 AI/ML Integration: YES"
fi

if grep -q -i "babylon\|three\.js" "$HTML_FILE"; then
    echo "  🎮 3D Graphics: YES"
fi

if grep -q "<canvas" "$HTML_FILE"; then
    echo "  🖼️  Canvas Graphics: YES"
fi

echo ""

# File size and complexity
echo "📊 Complexity Metrics:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE_SIZE=$(wc -c < "$HTML_FILE")
LINE_COUNT=$(wc -l < "$HTML_FILE")
SCRIPT_COUNT=$(grep -c "<script" "$HTML_FILE" || echo "0")

echo "  File Size: $FILE_SIZE bytes"
echo "  Line Count: $LINE_COUNT"
echo "  Script Tags: $SCRIPT_COUNT"

if [ "$FILE_SIZE" -gt 50000 ]; then
    echo "  Complexity: HIGH (large file)"
elif [ "$SCRIPT_COUNT" -gt 5 ]; then
    echo "  Complexity: MEDIUM (multiple scripts)"
else
    echo "  Complexity: LOW"
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "✅ Analysis complete!"
echo ""
