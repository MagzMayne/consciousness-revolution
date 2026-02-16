#!/bin/bash
# Quick validation script to check if all new documentation files exist

echo "🔍 Validating Documentation Links..."
echo ""

files=(
    "GETTING_STARTED_SIMPLE.md"
    "GLOSSARY.md"
    "MONETIZATION.md"
    "SIMPLIFICATION_SUMMARY.md"
    "README.md"
    "index.html"
    "projects.json"
)

all_good=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing!"
        all_good=false
    fi
done

echo ""
echo "🔍 Checking intro banners added..."

banner_files=(
    "oasis.html"
    "oasis-complete-game.html"
    "poker.html"
    "GemBot_Control_AI.html"
    "gemLords.html"
    "mineralMarket.html"
    "government-grants-portal.html"
    "microTrader.html"
)

for file in "${banner_files[@]}"; do
    if [ -f "$file" ] && grep -q "simple-intro-banner" "$file"; then
        echo "✅ $file has intro banner"
    else
        echo "⚠️  $file missing banner or file not found"
        all_good=false
    fi
done

echo ""
if [ "$all_good" = true ]; then
    echo "🎉 All validation checks passed!"
    exit 0
else
    echo "⚠️  Some checks failed"
    exit 1
fi
