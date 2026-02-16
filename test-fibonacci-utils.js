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
 * File: test-fibonacci-utils.js
 * Declaration ID: IP-6931F478-MLL28ZWJ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * Fibonacci Utils Test Suite
 * Comprehensive tests for fibonacci-utils.js module
 * 
 * Tests:
 * - Sequence generation
 * - Backoff calculations
 * - Interval timing
 * - Weight distribution
 * - Cache expiry
 * - Batch sizing
 * - Priority calculations
 * - Golden ratio operations
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

const FibonacciUtils = require('./src/utils/fibonacci-utils.js');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

class FibonacciTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    assert(condition, testName, details = '') {
        this.testResults.total++;
        
        if (condition) {
            this.testResults.passed++;
            this.log(`✓ ${testName}`, 'green');
            if (details) {
                this.log(`  ${details}`, 'cyan');
            }
        } else {
            this.testResults.failed++;
            this.log(`✗ ${testName}`, 'red');
            if (details) {
                this.log(`  ${details}`, 'yellow');
            }
        }
    }

    assertEquals(actual, expected, testName, details = '') {
        this.assert(actual === expected, testName, 
            details || `Expected: ${expected}, Got: ${actual}`);
    }

    async runAllTests() {
        this.log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
        this.log('║         FIBONACCI UTILS TEST SUITE                         ║', 'cyan');
        this.log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

        // Test 1: Fibonacci Sequence
        this.log('\n【 Test 1: Fibonacci Sequence Generation 】', 'blue');
        this.testFibonacciSequence();

        // Test 2: Backoff Calculation
        this.log('\n【 Test 2: Fibonacci Backoff 】', 'blue');
        this.testFibonacciBackoff();

        // Test 3: Interval Timing
        this.log('\n【 Test 3: Fibonacci Intervals 】', 'blue');
        this.testFibonacciInterval();

        // Test 4: Weight Distribution
        this.log('\n【 Test 4: Fibonacci Weights 】', 'blue');
        this.testFibonacciWeights();

        // Test 5: Cache Expiry
        this.log('\n【 Test 5: Cache Expiry 】', 'blue');
        this.testFibonacciCacheExpiry();

        // Test 6: Batch Sizing
        this.log('\n【 Test 6: Batch Sizing 】', 'blue');
        this.testFibonacciBatchSize();

        // Test 7: Priority Calculation
        this.log('\n【 Test 7: Priority Calculation 】', 'blue');
        this.testFibonacciPriority();

        // Test 8: Golden Ratio Operations
        this.log('\n【 Test 8: Golden Ratio Operations 】', 'blue');
        this.testGoldenRatio();

        // Test 9: Weighted Scoring
        this.log('\n【 Test 9: Weighted Scoring 】', 'blue');
        this.testWeightedScoring();

        // Test 10: Utilities
        this.log('\n【 Test 10: Utility Functions 】', 'blue');
        this.testUtilities();

        // Print summary
        this.printSummary();
    }

    testFibonacciSequence() {
        // Test basic sequence
        this.assertEquals(FibonacciUtils.fibonacci(0), 0, 'fibonacci(0) = 0');
        this.assertEquals(FibonacciUtils.fibonacci(1), 1, 'fibonacci(1) = 1');
        this.assertEquals(FibonacciUtils.fibonacci(2), 1, 'fibonacci(2) = 1');
        this.assertEquals(FibonacciUtils.fibonacci(3), 2, 'fibonacci(3) = 2');
        this.assertEquals(FibonacciUtils.fibonacci(4), 3, 'fibonacci(4) = 3');
        this.assertEquals(FibonacciUtils.fibonacci(5), 5, 'fibonacci(5) = 5');
        this.assertEquals(FibonacciUtils.fibonacci(6), 8, 'fibonacci(6) = 8');
        this.assertEquals(FibonacciUtils.fibonacci(10), 55, 'fibonacci(10) = 55');

        // Test sequence generation
        const seq = FibonacciUtils.fibonacciSequence(7);
        this.assert(
            JSON.stringify(seq) === JSON.stringify([0, 1, 1, 2, 3, 5, 8]),
            'fibonacciSequence(7) generates correct sequence',
            `Got: [${seq.join(', ')}]`
        );
    }

    testFibonacciBackoff() {
        // Test backoff progression: 1s → 2s → 3s → 5s → 8s → 13s
        const backoffs = [
            FibonacciUtils.fibonacciBackoff(0, 1000),
            FibonacciUtils.fibonacciBackoff(1, 1000),
            FibonacciUtils.fibonacciBackoff(2, 1000),
            FibonacciUtils.fibonacciBackoff(3, 1000),
            FibonacciUtils.fibonacciBackoff(4, 1000),
            FibonacciUtils.fibonacciBackoff(5, 1000)
        ];

        this.assert(
            JSON.stringify(backoffs) === JSON.stringify([1000, 2000, 3000, 5000, 8000, 13000]),
            'Backoff progression matches Fibonacci (1s → 2s → 3s → 5s → 8s → 13s)',
            `Got: ${backoffs.map(b => b/1000 + 's').join(' → ')}`
        );

        // Test max delay cap
        const cappedBackoff = FibonacciUtils.fibonacciBackoff(20, 1000, 10000);
        this.assert(
            cappedBackoff === 10000,
            'Backoff respects maximum delay cap',
            `Attempt 20 capped at ${cappedBackoff}ms`
        );
    }

    testFibonacciInterval() {
        // Test interval scaling
        this.assertEquals(FibonacciUtils.fibonacciInterval(0, 1000), 1000, 
            'Level 0 interval = 1000ms');
        this.assertEquals(FibonacciUtils.fibonacciInterval(1, 1000), 1000, 
            'Level 1 interval = 1000ms');
        this.assertEquals(FibonacciUtils.fibonacciInterval(2, 1000), 2000, 
            'Level 2 interval = 2000ms');
        this.assertEquals(FibonacciUtils.fibonacciInterval(3, 1000), 3000, 
            'Level 3 interval = 3000ms');
        this.assertEquals(FibonacciUtils.fibonacciInterval(4, 1000), 5000, 
            'Level 4 interval = 5000ms');
    }

    testFibonacciWeights() {
        // Test weight generation (descending)
        const weights = FibonacciUtils.fibonacciWeights(7);
        this.assert(
            JSON.stringify(weights) === JSON.stringify([13, 8, 5, 3, 2, 1, 1]),
            'Weights generated in descending order',
            `Got: [${weights.join(', ')}]`
        );

        // Test normalized weights
        const normalized = FibonacciUtils.fibonacciNormalizedWeights(5);
        const sum = normalized.reduce((acc, w) => acc + w, 0);
        this.assert(
            Math.abs(sum - 1.0) < 0.0001,
            'Normalized weights sum to 1.0',
            `Sum: ${sum.toFixed(4)}`
        );
    }

    testFibonacciCacheExpiry() {
        // Test cache expiry times (in minutes for readability)
        const baseTime = 60000; // 1 minute
        this.assertEquals(FibonacciUtils.fibonacciCacheExpiry(0, baseTime) / baseTime, 1,
            'Level 0 cache = 1 minute');
        this.assertEquals(FibonacciUtils.fibonacciCacheExpiry(2, baseTime) / baseTime, 2,
            'Level 2 cache = 2 minutes');
        this.assertEquals(FibonacciUtils.fibonacciCacheExpiry(3, baseTime) / baseTime, 3,
            'Level 3 cache = 3 minutes');
        this.assertEquals(FibonacciUtils.fibonacciCacheExpiry(4, baseTime) / baseTime, 5,
            'Level 4 cache = 5 minutes');
        this.assertEquals(FibonacciUtils.fibonacciCacheExpiry(5, baseTime) / baseTime, 8,
            'Level 5 cache = 8 minutes');
    }

    testFibonacciBatchSize() {
        // Test batch sizing
        this.assertEquals(FibonacciUtils.fibonacciBatchSize(0), 2, 'Level 0 batch = 2');
        this.assertEquals(FibonacciUtils.fibonacciBatchSize(1), 3, 'Level 1 batch = 3');
        this.assertEquals(FibonacciUtils.fibonacciBatchSize(2), 5, 'Level 2 batch = 5');
        this.assertEquals(FibonacciUtils.fibonacciBatchSize(3), 8, 'Level 3 batch = 8');
    }

    testFibonacciPriority() {
        // Test priority calculation
        this.assertEquals(FibonacciUtils.fibonacciPriority(0), 1, 'Priority level 0 = 1');
        this.assertEquals(FibonacciUtils.fibonacciPriority(1), 1, 'Priority level 1 = 1');
        this.assertEquals(FibonacciUtils.fibonacciPriority(2), 2, 'Priority level 2 = 2');
        this.assertEquals(FibonacciUtils.fibonacciPriority(5), 8, 'Priority level 5 = 8');
        this.assertEquals(FibonacciUtils.fibonacciPriority(10), 89, 'Priority level 10 = 89');
    }

    testGoldenRatio() {
        // Test golden ratio constant
        this.assert(
            Math.abs(FibonacciUtils.PHI - 1.618033988749895) < 0.0001,
            'Golden ratio constant (φ) is accurate',
            `φ = ${FibonacciUtils.PHI}`
        );

        // Test golden ratio multiplier
        const multiplied = FibonacciUtils.goldenRatioMultiplier(100);
        this.assert(
            Math.abs(multiplied - 161.8033988749895) < 0.0001,
            'Golden ratio multiplier works correctly',
            `100 × φ = ${multiplied.toFixed(2)}`
        );

        // Test inverse golden ratio
        const inversed = FibonacciUtils.inverseGoldenRatioMultiplier(100);
        this.assert(
            Math.abs(inversed - 61.8033988749895) < 0.0001,
            'Inverse golden ratio multiplier works correctly',
            `100 × (1/φ) = ${inversed.toFixed(2)}`
        );
    }

    testWeightedScoring() {
        // Test weighted scoring with perfect scores
        const perfectScores = [1, 1, 1, 1, 1, 1, 1];
        const perfectResult = FibonacciUtils.fibonacciWeightedScore(perfectScores, 100);
        this.assert(
            Math.abs(perfectResult - 100) < 0.01,
            'Perfect scores result in 100',
            `Score: ${perfectResult.toFixed(2)}`
        );

        // Test weighted scoring with mixed scores
        const mixedScores = [1, 0.8, 0.6, 0.4, 0.2, 0, 0];
        const mixedResult = FibonacciUtils.fibonacciWeightedScore(mixedScores, 100);
        this.assert(
            mixedResult > 50 && mixedResult < 100,
            'Mixed scores produce expected range',
            `Score: ${mixedResult.toFixed(2)}`
        );
    }

    testUtilities() {
        // Test closest Fibonacci
        const closest10 = FibonacciUtils.closestFibonacci(10);
        this.assert(
            closest10.fib === 8 || closest10.fib === 13,
            'closestFibonacci(10) returns 8 or 13',
            `Got: ${closest10.fib} at index ${closest10.index}`
        );

        // Test stats
        const stats = FibonacciUtils.getFibonacciStats();
        this.assert(
            stats.cacheSize > 0,
            'Fibonacci cache is populated',
            `Cache size: ${stats.cacheSize}, Max cached: ${stats.maxCached}`
        );

        this.assert(
            stats.goldenRatio === FibonacciUtils.PHI,
            'Stats report correct golden ratio',
            `φ = ${stats.goldenRatio}`
        );
    }

    printSummary() {
        this.log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
        this.log('║                    TEST SUMMARY                            ║', 'cyan');
        this.log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

        const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        
        this.log(`Total Tests:  ${this.testResults.total}`, 'cyan');
        this.log(`Passed:       ${this.testResults.passed}`, 'green');
        this.log(`Failed:       ${this.testResults.failed}`, this.testResults.failed > 0 ? 'red' : 'green');
        this.log(`Pass Rate:    ${passRate}%\n`, passRate === '100.0' ? 'green' : 'yellow');

        if (this.testResults.failed === 0) {
            this.log('✅ ALL TESTS PASSED!', 'green');
            this.log('\nFibonacci utilities are working correctly and ready for integration.\n', 'cyan');
        } else {
            this.log('❌ SOME TESTS FAILED', 'red');
            this.log('\nPlease review and fix the failing tests.\n', 'yellow');
            process.exit(1);
        }
    }
}

// Run tests
(async () => {
    const tester = new FibonacciTester();
    await tester.runAllTests();
})();
