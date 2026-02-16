#!/bin/bash
# add-aul-css.sh - Add AUL badge CSS styling to HTML files that don't have it yet

set -e

echo "🎨 Adding AUL badge CSS styling to HTML files..."

updated=0
skipped=0

AUL_CSS='    <style>
        .aul-badge {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 215, 0, 0.1);
            border: 2px solid #ffd700;
            color: #ffd700;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 9999;
            font-weight: 600;
        }
        .aul-badge:hover {
            background: rgba(255, 215, 0, 0.2);
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
            transform: scale(1.05);
        }
    </style>'

# Process all HTML files that have aul-badge div but no CSS
while IFS= read -r -d '' file; do
    # Skip certain directories
    if [[ "$file" =~ \.git/|node_modules/|vendor/ ]]; then
        continue
    fi
    
    # Check if has badge but no CSS
    if grep -q "aul-badge" "$file" && ! grep -q "\.aul-badge" "$file"; then
        echo "  Adding CSS to: $file"
        
        # Create temp file
        temp_file=$(mktemp)
        
        # Try to add before first </head> or <style> tag
        if grep -q "</head>" "$file"; then
            # Insert CSS style before </head>
            awk -v css="$AUL_CSS" '/<\/head>/ && !done {print css; done=1} {print}' "$file" > "$temp_file"
            mv "$temp_file" "$file"
            ((updated++))
        elif grep -q "<style>" "$file"; then
            # Insert inside first <style> tag after opening
            awk -v css="$AUL_CSS" '/<style>/ && !done {print; print css; done=1; next} {print}' "$file" > "$temp_file"
            mv "$temp_file" "$file"
            ((updated++))
        else
            # No good place found, skip
            rm "$temp_file"
            ((skipped++))
        fi
    else
        ((skipped++))
    fi
done < <(find . -name "*.html" -type f -print0)

echo ""
echo "✅ AUL CSS Addition Complete!"
echo "   Files updated: $updated"
echo "   Files skipped: $skipped"
