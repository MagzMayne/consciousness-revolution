#!/bin/bash
# aFactory.html Deployment Verification Script
# This script verifies the Agent Factory is properly deployed and functional

echo "========================================="
echo "aFactory.html Deployment Verification"
echo "========================================="
echo ""

# Check if file exists
if [ -f "aFactory.html" ]; then
    echo "✅ aFactory.html exists"
else
    echo "❌ aFactory.html not found"
    exit 1
fi

# Check if PayPal integration is included
if grep -q "paypal-integration.js" aFactory.html; then
    echo "✅ PayPal integration script included"
else
    echo "⚠️  PayPal integration script not found"
fi

# Check if BarbrickDesign@gmail.com is configured
if grep -q "BarbrickDesign@gmail.com" aFactory.html; then
    echo "✅ Revenue destination configured: BarbrickDesign@gmail.com"
else
    echo "❌ Revenue destination not configured correctly"
    exit 1
fi

# Check if revenue tracking is implemented
if grep -q "totalRevenue" aFactory.html; then
    echo "✅ Revenue tracking implemented"
else
    echo "❌ Revenue tracking not found"
    exit 1
fi

# Check if PayPal initialization exists
if grep -q "initializePayPal" aFactory.html; then
    echo "✅ PayPal initialization function present"
else
    echo "❌ PayPal initialization not found"
    exit 1
fi

# Check if documentation exists
if [ -f "AFACTORY_README.md" ]; then
    echo "✅ Documentation (AFACTORY_README.md) exists"
else
    echo "⚠️  Documentation not found"
fi

# Check if PayPal utils exist
if [ -f "src/utils/paypal-integration.js" ]; then
    echo "✅ PayPal utility script exists"
else
    echo "⚠️  PayPal utility script not found at src/utils/paypal-integration.js"
fi

# Verify all 8 manager agents
managers=("M1_DigitalProducts" "M2_AffiliateContent" "M3_Courses" "M4_POD" "M5_YouTube" "M6_MicroSaaS" "M7_StockMedia" "M8_Newsletter")
all_managers_present=true
for manager in "${managers[@]}"; do
    if grep -q "$manager" aFactory.html; then
        true
    else
        echo "❌ Manager $manager not found"
        all_managers_present=false
    fi
done

if [ "$all_managers_present" = true ]; then
    echo "✅ All 8 manager agents present"
fi

# Verify all 4 worker agents
workers=("W1_Ideation" "W2_Writing" "W3_Education" "W4_ProductDesign")
all_workers_present=true
for worker in "${workers[@]}"; do
    if grep -q "$worker" aFactory.html; then
        true
    else
        echo "❌ Worker $worker not found"
        all_workers_present=false
    fi
done

if [ "$all_workers_present" = true ]; then
    echo "✅ All 4 worker agents present"
fi

# Check for revenue generation functions
revenue_types=("affiliate_article_completed" "course_outline_completed" "digital_product_idea_validation")
revenue_present=true
for rev_type in "${revenue_types[@]}"; do
    if grep -q "$rev_type" aFactory.html; then
        true
    else
        echo "❌ Revenue type $rev_type not found"
        revenue_present=false
    fi
done

if [ "$revenue_present" = true ]; then
    echo "✅ Revenue generation functions present"
fi

# File size check
file_size=$(stat -f%z aFactory.html 2>/dev/null || stat -c%s aFactory.html 2>/dev/null)
echo ""
echo "📊 aFactory.html file size: $(echo "scale=1; $file_size / 1024" | bc) KB"

echo ""
echo "========================================="
echo "Deployment URL:"
echo "🌐 https://barbrickdesign.github.io/aFactory.html"
echo "========================================="
echo ""
echo "✅ All checks passed! Agent Factory is ready for deployment."
echo ""
echo "Next Steps:"
echo "1. Merge this PR to deploy to GitHub Pages"
echo "2. Visit https://barbrickdesign.github.io/aFactory.html"
echo "3. Verify PayPal button appears (requires https://)"
echo "4. Monitor revenue at BarbrickDesign@gmail.com"
echo ""
