#!/bin/bash

# Nixpacks Configuration Verification Script
# Checks that all necessary files are in place and properly configured

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Nixpacks Build Configuration Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS=0
FAIL=0
WARN=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASS++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAIL++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARN++))
}

info() {
  echo -e "ℹ $1"
}

# Check required files
echo "📁 Checking required configuration files..."
echo ""

if [ -f "nixpacks.toml" ]; then
  pass "nixpacks.toml exists"
else
  fail "nixpacks.toml missing"
fi

if [ -f "railway.toml" ]; then
  pass "railway.toml exists"
else
  fail "railway.toml missing"
fi

if [ -f ".railwayignore" ]; then
  pass ".railwayignore exists"
else
  fail ".railwayignore missing"
fi

if [ -f ".dockerignore" ]; then
  pass ".dockerignore exists"
else
  warn ".dockerignore missing (optional but recommended)"
fi

echo ""
echo "🔍 Checking configuration content..."
echo ""

# Check nixpacks.toml
if [ -f "nixpacks.toml" ]; then
  if grep -q "nodejs-18_x" nixpacks.toml; then
    pass "Node.js 18 specified in nixpacks.toml"
  else
    fail "Node.js version not specified correctly"
  fi
  
  if grep -q "npm ci" nixpacks.toml; then
    pass "Using 'npm ci' for reliable installs"
  else
    warn "Using 'npm install' instead of 'npm ci'"
  fi
  
  if grep -q "aptPkgs = \[\]" nixpacks.toml; then
    pass "aptPkgs explicitly set to empty"
  else
    warn "aptPkgs not explicitly disabled"
  fi
fi

# Check railway.toml
if [ -f "railway.toml" ]; then
  if grep -q 'builder = "NIXPACKS"' railway.toml; then
    pass "Railway builder set to NIXPACKS"
  else
    fail "Railway builder not set to NIXPACKS"
  fi
  
  if grep -q 'providers = \["node"\]' railway.toml; then
    pass "Node.js provider explicitly specified"
  else
    fail "Node.js provider not specified"
  fi
fi

# Check .railwayignore
if [ -f ".railwayignore" ]; then
  if grep -q "\.python-version" .railwayignore; then
    pass ".python-version ignored"
  else
    fail ".python-version not ignored"
  fi
  
  if grep -q "Gemfile" .railwayignore; then
    pass "Gemfile ignored"
  else
    fail "Gemfile not ignored"
  fi
fi

echo ""
echo "🔎 Checking for problematic files..."
echo ""

# Check for files that might cause detection issues
if [ -f ".python-version" ]; then
  warn ".python-version exists (should be ignored by Railway)"
fi

if [ -f "Gemfile" ]; then
  warn "Gemfile exists (should be ignored by Railway)"
fi

if [ -f "package.json" ]; then
  pass "package.json exists"
  
  if grep -q '"start":' package.json; then
    pass "Start script defined in package.json"
  else
    fail "No start script in package.json"
  fi
else
  fail "package.json missing"
fi

if [ -f "package-lock.json" ]; then
  pass "package-lock.json exists (required for npm ci)"
else
  fail "package-lock.json missing (required for npm ci)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ Configuration looks good!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Commit and push changes to Railway"
  echo "2. Monitor build logs for 'setup │ nodejs-18_x'"
  echo "3. Verify no Ruby/Python detection in logs"
  exit 0
else
  echo -e "${RED}✗ Configuration has issues${NC}"
  echo ""
  echo "Please fix the failed checks before deploying."
  exit 1
fi
