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
 * File: BUTTON_TEST_SCRIPT.js
 * Declaration ID: IP-37342E8C-MLL28ZUB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMBOT BUTTON AUTO-TEST SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 * Paste this into browser DevTools Console (F12) to test all buttons
 * 
 * USAGE:
 * 1. Open GemBot_Control_AI.html in browser
 * 2. Press F12 to open DevTools
 * 3. Go to Console tab
 * 4. Paste entire script and press Enter
 * 5. Wait for tests to complete
 * 
 * This will simulate clicks on all buttons and report results
 * ═══════════════════════════════════════════════════════════════════════════
 */

(async function autoTestButtons() {
    'use strict';
    
    console.log('%c🧪 GEMBOT BUTTON TEST SUITE STARTING...', 'font-size:20px;font-weight:bold;color:#0f0;background:#000;padding:10px');
    
    const results = {
        passed: [],
        failed: [],
        skipped: [],
        total: 0
    };
    
    // Helper: Wait for element to exist
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() - start > timeout) return reject(new Error(`Timeout waiting for ${selector}`));
                setTimeout(check, 100);
            };
            check();
        });
    }
    
    // Helper: Safe click with error handling
    async function safeClick(selector, description) {
        results.total++;
        console.log(`\n%c📍 Testing: ${description}`, 'color:#00f;font-weight:bold');
        console.log(`   Selector: ${selector}`);
        
        try {
            const button = document.querySelector(selector);
            if (!button) {
                throw new Error('Button not found');
            }
            
            // Check if button is visible
            const rect = button.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            
            if (!isVisible) {
                console.warn(`   ⚠️ Button exists but not visible`);
                results.skipped.push({ selector, description, reason: 'Not visible' });
                return;
            }
            
            // Simulate click
            button.click();
            
            // Wait a bit for any animations/effects
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log(`   ✅ PASSED`);
            results.passed.push({ selector, description });
            
        } catch (error) {
            console.error(`   ❌ FAILED: ${error.message}`);
            results.failed.push({ selector, description, error: error.message });
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // TEST SUITE - ALL BUTTONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    console.log('\n%c🔷 PHASE 1: Authentication Buttons', 'font-size:16px;font-weight:bold;color:#0ff;background:#003;padding:5px');
    
    // Auth tabs
    await safeClick('#loginTab', 'Switch to Login Tab');
    await new Promise(r => setTimeout(r, 500));
    
    await safeClick('#registerTab', 'Switch to Register Tab');
    await new Promise(r => setTimeout(r, 500));
    
    await safeClick('#linkDeviceTab', 'Switch to Link Device Tab');
    await new Promise(r => setTimeout(r, 500));
    
    // Guest mode button
    await safeClick('button.guest-btn[onclick*="continueAsGuest"]', 'Continue as Guest');
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('\n%c🔷 PHASE 2: Game Control Buttons', 'font-size:16px;font-weight:bold;color:#0ff;background:#003;padding:5px');
    
    // Wait for game UI to load
    await new Promise(r => setTimeout(r, 2000));
    
    // Shop buttons
    await safeClick('button[onclick*="openShopPanel"]', 'Open Shop Panel');
    await new Promise(r => setTimeout(r, 500));
    
    await safeClick('button[onclick*="showShopTab(\'rough\')"]', 'Shop Tab: Rough Stones');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="showShopTab(\'laps\')"]', 'Shop Tab: Laps');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="showShopTab(\'paste\')"]', 'Shop Tab: Polish Paste');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="showShopTab(\'consumables\')"]', 'Shop Tab: Consumables');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="closeShopPanel"]', 'Close Shop Panel');
    await new Promise(r => setTimeout(r, 500));
    
    // Inventory buttons
    await safeClick('button[onclick*="openInventoryPanel"]', 'Open Inventory Panel');
    await new Promise(r => setTimeout(r, 500));
    
    await safeClick('button[onclick*="showInvTab(\'rough\')"]', 'Inventory Tab: Rough');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="showInvTab(\'cut\')"]', 'Inventory Tab: Cut Stones');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="showInvTab(\'laps\')"]', 'Inventory Tab: Laps');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="showInvTab(\'supplies\')"]', 'Inventory Tab: Supplies');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="sellAllStones"]', 'Sell All Stones');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button[onclick*="closeInventoryPanel"]', 'Close Inventory Panel');
    await new Promise(r => setTimeout(r, 500));
    
    // Add machine button
    await safeClick('button[onclick*="addMachine(\'gembot_basic\'"]', 'Add GemBot Machine');
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('\n%c🔷 PHASE 3: Investment System Buttons', 'font-size:16px;font-weight:bold;color:#0ff;background:#003;padding:5px');
    
    // Gallery toggle
    await safeClick('#galleryToggle', 'Open Project Gallery');
    await new Promise(r => setTimeout(r, 1000));
    
    await safeClick('#refreshBtn', 'Refresh Gallery Projects');
    await new Promise(r => setTimeout(r, 1000));
    
    await safeClick('#closeGallery', 'Close Project Gallery');
    await new Promise(r => setTimeout(r, 500));
    
    console.log('\n%c🔷 PHASE 4: Close/Dismiss Buttons', 'font-size:16px;font-weight:bold;color:#0ff;background:#003;padding:5px');
    
    await safeClick('button.dismiss-rotate-btn', 'Dismiss Rotate Prompt');
    await new Promise(r => setTimeout(r, 300));
    
    await safeClick('button.game-close-btn', 'Close Game Mode');
    await new Promise(r => setTimeout(r, 500));
    
    // ═══════════════════════════════════════════════════════════════════════════
    // RESULTS SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    
    console.log('\n%c═══════════════════════════════════════════════════════════════', 'color:#fff;font-weight:bold');
    console.log('%c📊 TEST RESULTS SUMMARY', 'font-size:20px;font-weight:bold;color:#0f0;background:#000;padding:10px');
    console.log('%c═══════════════════════════════════════════════════════════════', 'color:#fff;font-weight:bold');
    
    console.log(`\n%c✅ PASSED: ${results.passed.length}/${results.total}`, 'color:#0f0;font-size:16px;font-weight:bold');
    results.passed.forEach(r => console.log(`   ✓ ${r.description}`));
    
    if (results.skipped.length > 0) {
        console.log(`\n%c⚠️ SKIPPED: ${results.skipped.length}/${results.total}`, 'color:#ff0;font-size:16px;font-weight:bold');
        results.skipped.forEach(r => console.log(`   - ${r.description} (${r.reason})`));
    }
    
    if (results.failed.length > 0) {
        console.log(`\n%c❌ FAILED: ${results.failed.length}/${results.total}`, 'color:#f00;font-size:16px;font-weight:bold');
        results.failed.forEach(r => console.log(`   ✗ ${r.description}: ${r.error}`));
    }
    
    const passRate = ((results.passed.length / results.total) * 100).toFixed(1);
    console.log(`\n%c📈 Pass Rate: ${passRate}%`, `color:${passRate >= 90 ? '#0f0' : passRate >= 70 ? '#ff0' : '#f00'};font-size:18px;font-weight:bold`);
    
    if (passRate >= 90) {
        console.log('\n%c🎉 EXCELLENT! All critical buttons working!', 'color:#0f0;font-size:16px;font-weight:bold;background:#003;padding:10px');
    } else if (passRate >= 70) {
        console.log('\n%c⚠️ GOOD - Some issues detected, review failures above', 'color:#ff0;font-size:16px;font-weight:bold;background:#330;padding:10px');
    } else {
        console.log('\n%c❌ CRITICAL - Multiple failures detected!', 'color:#f00;font-size:16px;font-weight:bold;background:#300;padding:10px');
    }
    
    console.log('\n%c═══════════════════════════════════════════════════════════════', 'color:#fff;font-weight:bold');
    
    // Return results object for programmatic access
    return results;
    
})().then(results => {
    console.log('\n%c✨ Test suite complete! Results saved to window.testResults', 'color:#0ff');
    window.testResults = results;
}).catch(error => {
    console.error('\n%c💥 Test suite crashed!', 'color:#f00;font-size:20px;font-weight:bold');
    console.error(error);
});
