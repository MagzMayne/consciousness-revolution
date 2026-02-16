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
 * File: test-merge-coordinator.js
 * Declaration ID: IP-7C475557-MLL28ZWK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Test suite for Merge Coordinator Agent
 * 
 * This test file validates that the merge coordinator
 * properly prevents conflicts when agents run.
 */

// Import the merge coordinator
const MergeCoordinatorAgent = require('./src/agents/merge-coordinator-agent.js');

/**
 * Helper function to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test Suite
 */
async function runTests() {
    console.log('🧪 Starting Merge Coordinator Tests\n');
    
    let passedTests = 0;
    let failedTests = 0;
    
    // Test 1: Initialization
    console.log('Test 1: Merge Coordinator Initialization');
    try {
        const coordinator = new MergeCoordinatorAgent({
            lockTimeout: 60000, // 1 minute for testing
            maxRetries: 2
        });
        
        const initResult = await coordinator.init();
        
        if (initResult.success && coordinator.isActive) {
            console.log('✅ PASS: Coordinator initialized successfully\n');
            passedTests++;
        } else {
            throw new Error('Coordinator not properly initialized');
        }
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failedTests++;
    }
    
    // Test 2: Lock Acquisition
    console.log('Test 2: Lock Acquisition');
    try {
        const coordinator = new MergeCoordinatorAgent();
        await coordinator.init();
        
        const lock = await coordinator.requestMergeLock(
            'test-agent-1',
            ['test-file-1.js', 'test-file-2.html'],
            'agent/test-branch'
        );
        
        if (lock.success && lock.lockId && lock.files.length === 2) {
            console.log('✅ PASS: Lock acquired successfully');
            console.log(`   Lock ID: ${lock.lockId}\n`);
            passedTests++;
        } else {
            throw new Error('Lock acquisition failed');
        }
        
        await coordinator.stop();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failedTests++;
    }
    
    // Test 3: Concurrent Lock Prevention
    console.log('Test 3: Concurrent Lock Prevention');
    try {
        const coordinator = new MergeCoordinatorAgent();
        await coordinator.init();
        
        // Agent 1 acquires lock
        const lock1 = await coordinator.requestMergeLock(
            'test-agent-1',
            ['shared-file.js'],
            'agent/branch-1'
        );
        
        if (!lock1.success) {
            throw new Error('First lock should succeed');
        }
        
        // Agent 2 tries to acquire same file (should fail)
        const lock2 = await coordinator.requestMergeLock(
            'test-agent-2',
            ['shared-file.js'],
            'agent/branch-2'
        );
        
        if (!lock2.success && lock2.conflictingLocks.length > 0) {
            console.log('✅ PASS: Concurrent lock properly prevented');
            console.log(`   Locked by: ${lock2.conflictingLocks[0].lockedBy}\n`);
            passedTests++;
        } else {
            throw new Error('Concurrent lock should have been prevented');
        }
        
        await coordinator.stop();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failedTests++;
    }
    
    // Test 4: Lock Release
    console.log('Test 4: Lock Release and Re-acquisition');
    try {
        const coordinator = new MergeCoordinatorAgent();
        await coordinator.init();
        
        // Agent 1 acquires lock
        const lock1 = await coordinator.requestMergeLock(
            'test-agent-1',
            ['test-file.js'],
            'agent/branch-1'
        );
        
        if (!lock1.success) {
            throw new Error('Lock acquisition failed');
        }
        
        // Release lock
        await coordinator.releaseMergeLock(lock1.lockId);
        
        // Agent 2 should now be able to acquire lock
        const lock2 = await coordinator.requestMergeLock(
            'test-agent-2',
            ['test-file.js'],
            'agent/branch-2'
        );
        
        if (lock2.success) {
            console.log('✅ PASS: Lock released and re-acquired successfully\n');
            passedTests++;
        } else {
            throw new Error('Re-acquisition after release failed');
        }
        
        await coordinator.stop();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failedTests++;
    }
    
    // Test 5: Pre-commit Validation
    console.log('Test 5: Pre-commit Validation');
    try {
        const coordinator = new MergeCoordinatorAgent();
        await coordinator.init();
        
        // Acquire lock first
        const lock = await coordinator.requestMergeLock(
            'test-agent-1',
            ['validation-test.js'],
            'agent/test-branch'
        );
        
        if (!lock.success) {
            throw new Error('Lock acquisition failed');
        }
        
        // Validate pre-commit
        const validation = await coordinator.validatePreCommit(
            'test-agent-1',
            ['validation-test.js'],
            'agent/test-branch'
        );
        
        if (validation.valid !== undefined) {
            console.log('✅ PASS: Pre-commit validation executed');
            console.log(`   Valid: ${validation.valid}`);
            console.log(`   Has Lock: ${validation.validations.hasLock}\n`);
            passedTests++;
        } else {
            throw new Error('Validation did not return expected result');
        }
        
        await coordinator.releaseMergeLock(lock.lockId);
        await coordinator.stop();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failedTests++;
    }
    
    // Test 6: Merge Readiness Check
    console.log('Test 6: Merge Readiness Check');
    try {
        const coordinator = new MergeCoordinatorAgent();
        await coordinator.init();
        
        const readiness = await coordinator.checkMergeReadiness(
            'agent/test-branch',
            'main'
        );
        
        if (readiness.ready !== undefined && 
            readiness.checks && 
            readiness.recommendation) {
            console.log('✅ PASS: Merge readiness check executed');
            console.log(`   Ready: ${readiness.ready}`);
            console.log(`   Recommendation: ${readiness.recommendation}\n`);
            passedTests++;
        } else {
            throw new Error('Readiness check did not return expected result');
        }
        
        await coordinator.stop();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failedTests++;
    }
    
    // Test 7: Lock Expiration (if time permits)
    console.log('Test 7: Lock Expiration');
    try {
        const coordinator = new MergeCoordinatorAgent({
            lockTimeout: 2000 // 2 seconds for quick testing
        });
        await coordinator.init();
        
        // Acquire lock
        const lock = await coordinator.requestMergeLock(
            'test-agent-1',
            ['expiring-file.js'],
            'agent/branch-1'
        );
        
        if (!lock.success) {
            throw new Error('Lock acquisition failed');
        }
        
        // Wait for lock to expire
        await sleep(3000);
        
        // Run cleanup
        coordinator.cleanupExpiredLocks();
        
        // Try to acquire same file (should succeed now)
        const lock2 = await coordinator.requestMergeLock(
            'test-agent-2',
            ['expiring-file.js'],
            'agent/branch-2'
        );
        
        if (lock2.success) {
            console.log('✅ PASS: Expired lock cleaned up successfully\n');
            passedTests++;
        } else {
            throw new Error('Lock still active after expiration');
        }
        
        await coordinator.stop();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failedTests++;
    }
    
    // Test 8: Status Reporting
    console.log('Test 8: Status Reporting');
    try {
        const coordinator = new MergeCoordinatorAgent();
        await coordinator.init();
        
        const status = coordinator.getStatus();
        
        if (status.isActive !== undefined &&
            status.activeLocks !== undefined &&
            status.metrics) {
            console.log('✅ PASS: Status reporting works');
            console.log(`   Active: ${status.isActive}`);
            console.log(`   Active Locks: ${status.activeLocks}`);
            console.log(`   Metrics:`, status.metrics, '\n');
            passedTests++;
        } else {
            throw new Error('Status missing expected fields');
        }
        
        await coordinator.stop();
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}\n`);
        failedTests++;
    }
    
    // Test Summary
    console.log('\n═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Total: ${passedTests + failedTests}`);
    console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    console.log('═══════════════════════════════════════\n');
    
    // Return exit code
    return failedTests === 0 ? 0 : 1;
}

// Run tests
if (require.main === module) {
    runTests()
        .then(exitCode => {
            if (exitCode === 0) {
                console.log('✅ All tests passed!\n');
            } else {
                console.log('❌ Some tests failed. See details above.\n');
            }
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('💥 Test suite crashed:', error);
            process.exit(1);
        });
}

module.exports = { runTests };
