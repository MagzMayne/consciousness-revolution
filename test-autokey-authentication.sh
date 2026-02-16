#!/bin/bash

# Test autoKey.html Authentication System
# This script starts the KAS backend and runs the comprehensive test suite

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   autoKey.html Authentication Testing Suite            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in CI or local
CI=${CI:-false}

# Set environment variables
export JWT_SECRET=${JWT_SECRET:-test-jwt-secret-for-testing}
export HMAC_SECRET=${HMAC_SECRET:-test-hmac-secret-for-testing}
export NODE_ENV=test
export KAS_PORT=3010

# Function to check if KAS service is running
check_kas_service() {
    local max_attempts=10
    local attempt=1
    
    echo "Checking if KAS service is running..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3010/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ KAS service is running${NC}"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: Waiting for KAS service..."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}✗ KAS service failed to start${NC}"
    return 1
}

# Function to stop KAS service
stop_kas_service() {
    if [ ! -z "$KAS_PID" ]; then
        echo "Stopping KAS service (PID: $KAS_PID)..."
        kill $KAS_PID 2>/dev/null || true
        wait $KAS_PID 2>/dev/null || true
        echo -e "${GREEN}✓ KAS service stopped${NC}"
    fi
}

# Trap to cleanup on exit
trap stop_kas_service EXIT

echo "Starting KAS backend service..."
node backend/services/kas-service.js > /tmp/kas-test.log 2>&1 &
KAS_PID=$!
echo "KAS service started with PID: $KAS_PID"

# Wait for service to be ready
if ! check_kas_service; then
    echo -e "${RED}Failed to start KAS service. Check /tmp/kas-test.log for details.${NC}"
    exit 1
fi

echo ""
echo "Running authentication tests..."
echo ""

# Run the test suite
if node backend/test-kas-authentication.js; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✓ All authentication tests passed!                   ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ✗ Some tests failed                                   ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi
