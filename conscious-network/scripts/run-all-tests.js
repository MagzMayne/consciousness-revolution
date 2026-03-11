#!/usr/bin/env node
/**
 * Run all tests in the conscious-network module
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');

const unitTests = [
  'core/event-bus/event-bus.test.js',
  'core/state/state.test.js',
  'agents/communication/tests/communication.test.js',
  'agents/coordination/tests/coordination.test.js',
  'agents/learning/tests/learning.test.js',
  'agents/adaptation/tests/adaptation.test.js',
  'agents/action/tests/action.test.js',
  'agents/reflection/tests/reflection.test.js',
  'agents/creation/tests/creation.test.js',
];

const integrationTests = [
  'integration.test.js',
];

const args = process.argv.slice(2);
const unitOnly = args.includes('--unit');

const tests = unitOnly
  ? unitTests
  : [...unitTests, ...integrationTests];

const root = path.join(__dirname, '..');
let anyFailed = false;

for (const t of tests) {
  const full = path.join(root, t);
  const label = t;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Running: ${label}`);
  console.log('─'.repeat(60));

  try {
    execSync(`node "${full}"`, { stdio: 'inherit', cwd: root });
  } catch {
    anyFailed = true;
  }
}

if (anyFailed) {
  console.error('\n✗ Some tests failed.\n');
  process.exit(1);
} else {
  console.log('\n✓ All tests passed.\n');
}
