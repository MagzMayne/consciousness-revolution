#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Security Audit Script
# Checks Netlify functions for security compliance
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "SECURITY AUDIT - Netlify Functions"
echo "═══════════════════════════════════════════════════════════════"
echo ""

FUNCTIONS_DIR="netlify/functions"
TOTAL=0
SECURED=0
INSECURE=0

echo "Checking for security utilities import..."
echo ""

for file in "$FUNCTIONS_DIR"/*.mjs; do
    if [ -f "$file" ]; then
        TOTAL=$((TOTAL + 1))
        filename=$(basename "$file")
        
        # Skip utility files
        if [[ "$filename" == "utils"* ]]; then
            continue
        fi
        
        # Check if file imports security utilities
        if grep -q "from './utils/security.mjs'" "$file"; then
            echo "✅ $filename - SECURED"
            SECURED=$((SECURED + 1))
        else
            echo "❌ $filename - NEEDS UPDATE"
            INSECURE=$((INSECURE + 1))
            
            # Check for common security issues
            if grep -q "Access-Control-Allow-Origin.*\*" "$file"; then
                echo "   ⚠️  Uses wildcard CORS"
            fi
            
            if grep -q "console.log.*password\|console.log.*token\|console.log.*secret" "$file"; then
                echo "   ⚠️  Logs sensitive data"
            fi
            
            if ! grep -q "rate.*limit\|checkRateLimit" "$file"; then
                echo "   ⚠️  No rate limiting"
            fi
            
            if ! grep -q "validateInput\|sanitize" "$file"; then
                echo "   ⚠️  No input validation"
            fi
        fi
        echo ""
    fi
done

echo "═══════════════════════════════════════════════════════════════"
echo "SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo "Total Functions: $TOTAL"
echo "Secured: $SECURED"
echo "Need Updates: $INSECURE"
echo ""
echo "Security Coverage: $(( SECURED * 100 / TOTAL ))%"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ $INSECURE -gt 0 ]; then
    echo "⚠️  Action Required:"
    echo "   1. Update functions to import from './utils/security.mjs'"
    echo "   2. Replace wildcard CORS with getSecureCORSHeaders(origin)"
    echo "   3. Add rate limiting with checkRateLimit()"
    echo "   4. Add input validation with validateInput()"
    echo "   5. Use secureLog() instead of console.log()"
    echo ""
    echo "Example template in ZERO_TRUST_SECURITY.md"
    echo ""
    exit 1
else
    echo "✅ All functions secured!"
    exit 0
fi
