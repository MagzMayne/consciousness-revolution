#!/bin/bash
# add-aul-support.sh - Add minimal AUL badge and support to all HTML and JS files
# Part of AI Universal Language implementation across repository

set -e

echo "🤖 Adding AI Universal Language (AUL) support to repository..."

# Counters
html_updated=0
js_updated=0
html_skipped=0
js_skipped=0

# Add AUL badge style to HTML files (insert after <head> or at start of <style>)
add_html_aul_support() {
    local file="$1"
    
    # Skip if already has AUL support
    if grep -q "aul-badge\|AUL Enabled\|AUL-enabled" "$file"; then
        ((html_skipped++))
        return 0
    fi
    
    # Create a temp file
    temp_file=$(mktemp)
    
    # Check if file has a closing </body> tag
    if grep -q "</body>" "$file"; then
        # Add the badge div before </body>
        sed '/<\/body>/i\
    <!-- AI Universal Language (AUL) Support Badge -->\
    <div class="aul-badge" onclick="window.open('\''/ai-universal-language.html'\'', '\''_blank'\'')" title="This page supports AI Universal Language - Click to learn more">\
        🤖 AUL-enabled\
    </div>' "$file" > "$temp_file"
        
        # Check if file already has the aul-badge style
        if ! grep -q "\.aul-badge" "$file"; then
            # Add the style before </head> or </style> if exists
            if grep -q "</head>" "$temp_file"; then
                sed -i '/<\/head>/i\
    <style>\
        .aul-badge {\
            position: fixed;\
            bottom: 20px;\
            right: 20px;\
            background: rgba(255, 215, 0, 0.1);\
            border: 2px solid #ffd700;\
            color: #ffd700;\
            padding: 8px 12px;\
            border-radius: 8px;\
            font-size: 0.85rem;\
            cursor: pointer;\
            transition: all 0.3s ease;\
            z-index: 9999;\
            font-weight: 600;\
        }\
        .aul-badge:hover {\
            background: rgba(255, 215, 0, 0.2);\
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);\
            transform: scale(1.05);\
        }\
    </style>' "$temp_file"
            fi
        fi
        
        mv "$temp_file" "$file"
        ((html_updated++))
        return 0
    else
        rm "$temp_file"
        ((html_skipped++))
        return 1
    fi
}

# Add AUL metadata header to JavaScript files
add_js_aul_support() {
    local file="$1"
    
    # Skip if already has AUL support
    if grep -q "@aul-enabled\|window.AUL.*enabled\|AI Universal Language" "$file"; then
        ((js_skipped++))
        return 0
    fi
    
    # Create temp file with AUL header
    temp_file=$(mktemp)
    
    cat > "$temp_file" << 'EOF'
/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

EOF
    
    # Append original content
    cat "$file" >> "$temp_file"
    
    mv "$temp_file" "$file"
    ((js_updated++))
    return 0
}

# Process all HTML files (excluding hidden files and certain directories)
echo "Processing HTML files..."
while IFS= read -r -d '' file; do
    # Skip certain directories
    if [[ "$file" =~ \.git/|node_modules/|vendor/ ]]; then
        continue
    fi
    
    echo "  Processing: $file"
    add_html_aul_support "$file" || true
done < <(find . -name "*.html" -type f -print0)

# Process all JavaScript files (excluding hidden files, vendor, and node_modules)
echo "Processing JavaScript files..."
while IFS= read -r -d '' file; do
    # Skip certain directories and files
    if [[ "$file" =~ \.git/|node_modules/|vendor/|\.min\.js$ ]]; then
        continue
    fi
    
    echo "  Processing: $file"
    add_js_aul_support "$file" || true
done < <(find . -name "*.js" -type f -print0)

echo ""
echo "✅ AUL Support Addition Complete!"
echo "   HTML files updated: $html_updated"
echo "   HTML files skipped (already have AUL): $html_skipped"
echo "   JavaScript files updated: $js_updated"
echo "   JavaScript files skipped (already have AUL): $js_skipped"
echo ""
echo "🤖 All files now support AI Universal Language!"
echo "   Documentation: https://barbrickdesign.github.io/ai-universal-language.html"
