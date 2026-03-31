'use strict';

/**
 * tests/run-all.js
 *
 * Test runner that executes all test files sequentially and reports
 * a combined pass/fail summary.  Exits with code 1 if any suite fails.
 */

const { spawn } = require('child_process');
const path = require('path');

const TEST_FILES = [
  'intent-engine.test.js',
  'adapters.test.js',
  'sdk.test.js',
  'db-function.test.js',
  'paypal-checkout.test.js',
  'master-loop.test.js',
];

async function runFile(file) {
  const filePath = path.resolve(__dirname, file);

  return new Promise((resolve) => {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Running: ${file}`);
    console.log('─'.repeat(60));

    const child = spawn(process.execPath, [filePath], {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('close', (code) => {
      resolve({ file, code: code ?? 1 });
    });

    child.on('error', (err) => {
      console.error(`Failed to spawn ${file}: ${err.message}`);
      resolve({ file, code: 1 });
    });
  });
}

(async () => {
  const results = [];

  for (const file of TEST_FILES) {
    const result = await runFile(file);
    results.push(result);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('TEST SUITE SUMMARY');
  console.log('═'.repeat(60));

  let anyFailed = false;

  for (const { file, code } of results) {
    const status = code === 0 ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${status}  ${file}`);
    if (code !== 0) anyFailed = true;
  }

  console.log('═'.repeat(60));
  if (anyFailed) {
    console.log('Overall: FAILED');
    process.exit(1);
  } else {
    console.log('Overall: PASSED');
    process.exit(0);
  }
})();
