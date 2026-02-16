/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: test-sql-handler.js
 * Declaration ID: IP-63244599-MLL28ZWK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

#!/usr/bin/env node

/**
 * SQL Handler Unit Tests
 * Verifies all core functions work correctly
 */

// Simple mock of window object for Node.js testing
global.window = {
  SQLHandler: null,
  sqlHandler: null,
  SQL_AUTO_PROTECT: false
};

global.document = {
  readyState: 'complete',
  querySelectorAll: () => [],
  addEventListener: () => {}
};

global.console = console;

// Load the SQL handler
require('./js/sql-handler.js');

const SQLHandler = global.window.SQLHandler;
const sqlHandler = new SQLHandler();

console.log('🧪 SQL Handler Unit Tests\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Sanitization
test('Sanitize removes dangerous characters', () => {
  const input = "admin' OR '1'='1";
  const result = sqlHandler.sanitize(input);
  assert(result !== input, 'Should modify input');
  assert(!result.includes("'"), 'Should escape single quotes');
});

// Test 2: SQL Injection Detection
test('Detect SQL injection in input', () => {
  const result = sqlHandler.validateInput("admin' OR '1'='1");
  assert(result.safe === false, 'Should detect as unsafe');
  assert(result.threats.length > 0, 'Should have threats');
});

// Test 3: Safe Input Validation
test('Accept safe input', () => {
  const result = sqlHandler.validateInput('john.doe@example.com');
  assert(result.safe === true, 'Should accept safe input');
  assert(result.threats.length === 0, 'Should have no threats');
});

// Test 4: UNION Attack Detection
test('Detect UNION-based SQL injection', () => {
  const result = sqlHandler.validateInput("1' UNION SELECT * FROM passwords--");
  assert(result.safe === false, 'Should detect UNION attack');
  assert(result.threats.length > 0, 'Should have threats');
});

// Test 5: Comment Attack Detection
test('Detect comment-based injection', () => {
  const result = sqlHandler.validateInput("admin/*");
  assert(result.safe === false, 'Should detect comment attack');
});

// Test 6: Query Validation - Dangerous Query
test('Detect DELETE without WHERE', () => {
  const result = sqlHandler.validateQuery('DELETE FROM users');
  assert(result.safe === false, 'Should detect as unsafe');
  assert(result.issues.length > 0, 'Should have issues');
  const hasCritical = result.issues.some(i => i.severity === 'CRITICAL');
  assert(hasCritical, 'Should have CRITICAL issue');
});

// Test 7: Query Validation - Safe Query
test('Accept safe parameterized query', () => {
  const result = sqlHandler.validateQuery('SELECT id, name FROM users WHERE id = ?');
  const criticalIssues = result.issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  assert(criticalIssues.length === 0, 'Should have no critical issues');
});

// Test 8: Identifier Escaping
test('Escape SQL identifiers correctly', () => {
  const result = sqlHandler.escapeIdentifier('users');
  assert(result === '`users`', 'Should wrap in backticks');
});

// Test 9: Identifier Escaping with Backticks
test('Escape identifiers with existing backticks', () => {
  const result = sqlHandler.escapeIdentifier('user`name');
  assert(result.includes('``'), 'Should escape existing backticks');
});

// Test 10: Query Formatting
test('Format SQL query correctly', () => {
  const query = 'SELECT * FROM users WHERE id = 1 AND status = "active"';
  const result = sqlHandler.formatQuery(query);
  assert(result.includes('\n'), 'Should add newlines');
  assert(result.includes('SELECT'), 'Should contain SELECT');
});

// Test 11: Parameterized Query Creation
test('Create parameterized query', () => {
  const { query, params } = sqlHandler.createParameterizedQuery(
    'SELECT * FROM users WHERE username = ? AND email = ?',
    ['admin', 'admin@example.com']
  );
  assert(query.includes('?'), 'Should have placeholders');
  assert(params.length === 2, 'Should have 2 params');
});

// Test 12: Stacked Query Detection
test('Detect stacked queries', () => {
  const result = sqlHandler.validateInput("'; DROP TABLE users; --");
  assert(result.safe === false, 'Should detect stacked query');
  assert(result.threats.some(t => t.includes('Stacked query')), 'Should mention stacked query');
});

// Test 13: SELECT * Detection
test('Detect SELECT * usage', () => {
  const result = sqlHandler.validateQuery('SELECT * FROM users');
  const hasSelectStar = result.issues.some(i => i.message.includes('SELECT *'));
  assert(hasSelectStar, 'Should detect SELECT *');
});

// Test 14: Multiple Statements Detection
test('Detect multiple SQL statements', () => {
  const result = sqlHandler.validateQuery('SELECT * FROM users; DROP TABLE users;');
  assert(result.safe === false, 'Should detect multiple statements');
  const hasMultiple = result.issues.some(i => i.message.includes('Multiple SQL statements'));
  assert(hasMultiple, 'Should mention multiple statements');
});

// Test 15: SQL Keywords Detection
test('Detect SQL keywords in input', () => {
  const result = sqlHandler.containsSQLKeywords('SELECT * FROM users');
  assert(result === true, 'Should detect SQL keywords');
});

// Test 16: No SQL Keywords
test('Not detect keywords in normal text', () => {
  const result = sqlHandler.containsSQLKeywords('Hello world, this is normal text');
  assert(result === false, 'Should not detect keywords in normal text');
});

// Test 17: Empty Input Sanitization
test('Handle empty input in sanitization', () => {
  const result = sqlHandler.sanitize('');
  assert(result === '', 'Should handle empty string');
});

// Test 18: Null Input Handling
test('Handle null input gracefully', () => {
  const result = sqlHandler.sanitize(null);
  assert(result !== null, 'Should convert null to string');
});

// Test 19: Number Input Sanitization
test('Handle number input', () => {
  const result = sqlHandler.sanitize(12345);
  assert(result === '12345', 'Should convert number to string');
});

// Test 20: Complex Attack Pattern
test('Detect complex attack pattern', () => {
  const result = sqlHandler.validateInput("1' AND '1'='1' UNION SELECT * FROM passwords WHERE '1'='1");
  assert(result.safe === false, 'Should detect complex attack');
  assert(result.threats.length > 0, 'Should have multiple threats');
});

console.log('\n📊 Test Results:');
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! SQL Handler is working correctly.\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Please review.\n`);
  process.exit(1);
}
