#!/bin/bash

# Script to add SQL Handler integration to HTML files
# Adds the script tag before </head> if not already present

echo "🔧 Adding SQL Handler to HTML files..."

# List of high-priority HTML files that need SQL protection
FILES=(
  "bookScanner.html"
  "contractor-registration.html"
  "translator.html"
  "investO.html"
  "microHowTo.html"
  "aFactory.html"
  "enAIcc.html"
  "enAIcc2.html"
  "coinCreator.html"
  "gemAuto.html"
  "gAuto.html"
  "geAuto.html"
  "BudgetBoss.html"
  "classified-contracts.html"
  "contractor-portal.html"
  "contractor-leaderboard.html"
  "contractor-payouts.html"
  "admin-contractor-dashboard.html"
  "dashboard.html"
  "joinHelper.html"
  "sqlAnalyzer.html"
)

SQL_HANDLER_TAG='    <!-- Automated SQL Handling -->\n    <script src="js/sql-handler.js"></script>'

count=0
skipped=0
errors=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  Skipping $file (not found)"
    ((skipped++))
    continue
  fi
  
  # Check if SQL handler is already included
  if grep -q "sql-handler.js" "$file"; then
    echo "✓ $file (already has SQL handler)"
    ((skipped++))
    continue
  fi
  
  # Check if file has </head> tag
  if ! grep -q "</head>" "$file"; then
    echo "⚠️  Skipping $file (no </head> tag found)"
    ((skipped++))
    continue
  fi
  
  # Create backup
  cp "$file" "${file}.backup"
  
  # Add SQL handler before </head>
  if sed -i.tmp "s|</head>|${SQL_HANDLER_TAG}\n</head>|" "$file"; then
    echo "✅ Added SQL handler to $file"
    rm "${file}.tmp" 2>/dev/null
    ((count++))
  else
    echo "❌ Error adding SQL handler to $file"
    # Restore from backup on error
    mv "${file}.backup" "$file"
    ((errors++))
  fi
done

echo ""
echo "📊 Summary:"
echo "  ✅ Successfully updated: $count files"
echo "  ⏭️  Skipped: $skipped files"
echo "  ❌ Errors: $errors files"
echo ""
echo "🎉 SQL Handler integration complete!"
