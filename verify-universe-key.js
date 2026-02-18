#!/usr/bin/env node

/**
 * Universe Key Verification Script
 * 
 * This script verifies that the UNIVERSE_KEY is properly configured
 * in the environment and has the correct format.
 */

const EXPECTED_UUID = 'd29fc25b-c78c-4624-8106-d2b112b06024';
const UUID_REGEX = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

console.log('🔍 Universe Key Verification\n');
console.log('=' .repeat(50));

// Check if environment variable exists
const universeKey = process.env.UNIVERSE_KEY;
console.log('\n1. Checking environment variable...');

if (!universeKey) {
  console.error('   ❌ UNIVERSE_KEY not found in environment');
  console.log('\n💡 To fix:');
  console.log('   - Set the environment variable:');
  console.log('     export UNIVERSE_KEY="d29fc25b-c78c-4624-8106-d2b112b06024"');
  console.log('   - Or create a .env file with the key');
  console.log('   - Or add it to GitHub Secrets');
  process.exit(1);
} else {
  console.log('   ✅ UNIVERSE_KEY environment variable is set');
}

// Check UUID format
console.log('\n2. Validating UUID format...');
if (!UUID_REGEX.test(universeKey)) {
  console.error('   ❌ Invalid UUID format');
  console.log('   Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  console.log(`   Found: ${universeKey}`);
  process.exit(1);
} else {
  console.log('   ✅ UUID format is valid (v4)');
}

// Check if it matches expected value
console.log('\n3. Verifying key value...');
if (universeKey !== EXPECTED_UUID) {
  console.warn('   ⚠️  Key does not match expected value');
  console.log(`   Expected: ${EXPECTED_UUID}`);
  console.log(`   Found:    ${universeKey}`);
  console.log('\n   Note: This may be intentional if the key was rotated.');
} else {
  console.log('   ✅ Key matches expected value');
}

// Check .env.example file
console.log('\n4. Checking .env.example file...');
try {
  const fs = require('fs');
  const path = require('path');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    if (envContent.includes('UNIVERSE_KEY') && envContent.includes(EXPECTED_UUID)) {
      console.log('   ✅ .env.example contains UNIVERSE_KEY');
    } else {
      console.warn('   ⚠️  .env.example missing or incomplete');
    }
  } else {
    console.warn('   ⚠️  .env.example not found');
  }
} catch (error) {
  console.warn(`   ⚠️  Could not read .env.example: ${error.message}`);
}

// Check .env.template file
console.log('\n5. Checking .env.template file...');
try {
  const fs = require('fs');
  const path = require('path');
  const envTemplatePath = path.join(__dirname, '.env.template');
  
  if (fs.existsSync(envTemplatePath)) {
    const envContent = fs.readFileSync(envTemplatePath, 'utf8');
    if (envContent.includes('UNIVERSE_KEY') && envContent.includes(EXPECTED_UUID)) {
      console.log('   ✅ .env.template contains UNIVERSE_KEY');
    } else {
      console.warn('   ⚠️  .env.template missing or incomplete');
    }
  } else {
    console.warn('   ⚠️  .env.template not found');
  }
} catch (error) {
  console.warn(`   ⚠️  Could not read .env.template: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n✅ Universe Key Verification Complete!');
console.log('\nKey Details:');
console.log(`   UUID:     ${universeKey}`);
console.log(`   Format:   UUID v4`);
console.log(`   Length:   ${universeKey.length} characters`);

console.log('\n📝 Next Steps:');
console.log('   1. Add UNIVERSE_KEY to GitHub Secrets (if not already done)');
console.log('   2. Ensure .env file is in .gitignore');
console.log('   3. Share setup instructions with team members');
console.log('\n📚 Documentation: See UNIVERSE_KEY_SETUP.md for details\n');
