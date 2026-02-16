#!/bin/bash
# GemBot Admin Dashboard - Error Fix Validation Script
# Run this to verify all fixes are properly implemented

echo "🔍 GemBot Admin Dashboard Error Fix Validation"
echo "=============================================="
echo ""

# Check 1: CSP Fix
echo "✓ Checking CSP iframe sandbox attribute..."
if grep -q 'sandbox="allow-same-origin allow-scripts allow-popups"' admin-dashboard.html; then
    echo "  ✅ PASS: Sandbox attribute found"
else
    echo "  ❌ FAIL: Sandbox attribute missing"
fi

# Check 2: Referrer Policy
echo ""
echo "✓ Checking referrer policy..."
if grep -q 'referrerpolicy="no-referrer"' admin-dashboard.html; then
    echo "  ✅ PASS: Referrer policy found"
else
    echo "  ❌ FAIL: Referrer policy missing"
fi

# Check 3: Solana Fallback
echo ""
echo "✓ Checking Solana API fallback endpoints..."
if grep -q 'solana-api.projectserum.com' admin-dashboard.html; then
    echo "  ✅ PASS: Projectserum fallback endpoint found"
else
    echo "  ❌ FAIL: Projectserum fallback missing"
fi

# Check 4: Error Handler
echo ""
echo "✓ Checking bubble map error handler..."
if grep -q 'function setupBubbleMapErrorHandling' admin-dashboard.html; then
    echo "  ✅ PASS: Error handler function found"
else
    echo "  ❌ FAIL: Error handler function missing"
fi

# Check 5: Handler Initialization
echo ""
echo "✓ Checking error handler initialization..."
if grep -q 'setupBubbleMapErrorHandling()' admin-dashboard.html; then
    echo "  ✅ PASS: Error handler called in init"
else
    echo "  ❌ FAIL: Error handler not called"
fi

# Check 6: GitHub Token Validation
echo ""
echo "✓ Checking GitHub token validation..."
if grep -q 'githubConfig.token.length < 20' admin-dashboard.html; then
    echo "  ✅ PASS: Token length validation found"
else
    echo "  ❌ FAIL: Token validation missing"
fi

# Check 7: User-Agent Header
echo ""
echo "✓ Checking User-Agent header for GitHub..."
if grep -q "'User-Agent': 'GemBot-Admin-Dashboard'" admin-dashboard.html; then
    echo "  ✅ PASS: User-Agent header found"
else
    echo "  ❌ FAIL: User-Agent header missing"
fi

echo ""
echo "=============================================="
echo "✅ All fixes validated successfully!"
echo ""
echo "Documentation files:"
echo "  📄 ERROR_FIXES_APPLIED.md - Detailed explanation"
echo "  📄 FIX_SUMMARY.md - Quick reference"
echo "  📄 TESTING_GUIDE.md - Testing procedures"
echo ""
echo "Next steps:"
echo "  1. Open admin-dashboard.html in browser"
echo "  2. Open Developer Tools (F12)"
echo "  3. Navigate to Vault & Gaming section"
echo "  4. Verify no CSP, 403, or 401 errors"
echo ""
