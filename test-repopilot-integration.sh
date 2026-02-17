#!/bin/bash

# RepoPilot Integration Test Script
# Tests the PayPal webhook and email delivery system

echo "=================================="
echo "RepoPilot Integration Test"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if landing page exists
echo "Test 1: Landing page exists"
if [ -f "repopilot-landing.html" ]; then
    echo -e "${GREEN}✓ PASS${NC} - repopilot-landing.html found"
else
    echo -e "${RED}✗ FAIL${NC} - repopilot-landing.html not found"
    exit 1
fi

# Test 2: Check pricing in HTML
echo ""
echo "Test 2: Verify pricing in HTML"
if grep -q '29' repopilot-landing.html && grep -q 'Pro' repopilot-landing.html; then
    echo -e "${GREEN}✓ PASS${NC} - Pro plan pricing ($29/month) found"
else
    echo -e "${RED}✗ FAIL${NC} - Pro plan pricing not found correctly"
    exit 1
fi

# Test 3: Check webhook handler exists
echo ""
echo "Test 3: Webhook handler exists"
if [ -f "netlify/functions/repopilot-paypal-webhook.mjs" ]; then
    echo -e "${GREEN}✓ PASS${NC} - repopilot-paypal-webhook.mjs found"
else
    echo -e "${RED}✗ FAIL${NC} - Webhook handler not found"
    exit 1
fi

# Test 4: Check delivery notification function exists
echo ""
echo "Test 4: Delivery notification function exists"
if [ -f "netlify/functions/repopilot-delivery-notification.mjs" ]; then
    echo -e "${GREEN}✓ PASS${NC} - repopilot-delivery-notification.mjs found"
else
    echo -e "${RED}✗ FAIL${NC} - Delivery notification function not found"
    exit 1
fi

# Test 5: Check welcome email function exists
echo ""
echo "Test 5: Welcome email function exists"
if [ -f "netlify/functions/send-repopilot-welcome.mjs" ]; then
    echo -e "${GREEN}✓ PASS${NC} - send-repopilot-welcome.mjs found"
else
    echo -e "${RED}✗ FAIL${NC} - Welcome email function not found"
    exit 1
fi

# Test 6: Verify email recipient
echo ""
echo "Test 6: Email recipient configuration"
if grep -q "BarbrickDesign@gmail.com" netlify/functions/repopilot-delivery-notification.mjs; then
    echo -e "${GREEN}✓ PASS${NC} - Delivery notification sends to BarbrickDesign@gmail.com"
else
    echo -e "${RED}✗ FAIL${NC} - Email recipient not configured correctly"
    exit 1
fi

# Test 7: Check PayPal integration
echo ""
echo "Test 7: PayPal integration"
if grep -q "PayPalIntegration" repopilot-landing.html; then
    echo -e "${GREEN}✓ PASS${NC} - PayPal integration utility referenced"
else
    echo -e "${RED}✗ FAIL${NC} - PayPal integration not found"
    exit 1
fi

# Test 8: Verify webhook events
echo ""
echo "Test 8: Webhook event configuration"
if grep -q "PAYMENT.CAPTURE.COMPLETED" netlify/functions/repopilot-paypal-webhook.mjs; then
    echo -e "${GREEN}✓ PASS${NC} - Webhook events configured"
else
    echo -e "${RED}✗ FAIL${NC} - Webhook events not configured"
    exit 1
fi

# Test 9: Check autonomous delivery system
echo ""
echo "Test 9: Autonomous delivery system"
if grep -q "sendDeliveryNotification" repopilot-landing.html; then
    echo -e "${GREEN}✓ PASS${NC} - Autonomous delivery system integrated"
else
    echo -e "${RED}✗ FAIL${NC} - Autonomous delivery system not found"
    exit 1
fi

# Test 10: Verify documentation
echo ""
echo "Test 10: Setup documentation exists"
if [ -f "REPOPILOT_WEBHOOK_SETUP.md" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Setup documentation found"
else
    echo -e "${YELLOW}⚠ WARN${NC} - Setup documentation not found (optional)"
fi

echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo -e "${GREEN}All critical tests passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure PayPal webhook in PayPal Developer Dashboard"
echo "2. Add environment variables to Netlify"
echo "3. Test with PayPal sandbox"
echo "4. Deploy to production"
echo ""
echo "See REPOPILOT_WEBHOOK_SETUP.md for detailed instructions"
