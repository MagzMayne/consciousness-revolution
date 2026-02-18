#!/usr/bin/env node

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
 * File: test-team-launchpad-links.js
 * Declaration ID: IP-34A0C00-MLL28ZWK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Test script to verify all links in team-launchpad-hub.html are working
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Team Launchpad Hub Links...\n');

// Read the HTML file
const hubPath = path.join(__dirname, 'team-launchpad-hub.html');
const onboardingPath = path.join(__dirname, 'team-launchpad-onboarding.html');

if (!fs.existsSync(hubPath)) {
    console.error('❌ team-launchpad-hub.html not found!');
    process.exit(1);
}

const hubContent = fs.readFileSync(hubPath, 'utf-8');
const onboardingExists = fs.existsSync(onboardingPath);

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function test(name, condition, message) {
    if (condition) {
        console.log(`✅ ${name}`);
        results.passed++;
        results.tests.push({ name, passed: true });
    } else {
        console.log(`❌ ${name}: ${message}`);
        results.failed++;
        results.tests.push({ name, passed: false, message });
    }
}

// Test 1: Check that external consciousnessrevolution.io link was removed/replaced
test(
    'External link removed',
    !hubContent.includes('href="https://consciousnessrevolution.io"'),
    'External link to consciousnessrevolution.io still exists'
);

// Test 2: Check that Getting Started link exists
test(
    'Getting Started link added',
    hubContent.includes('team-launchpad-onboarding.html'),
    'Getting Started link not found'
);

// Test 3: Check that onboarding file was created
test(
    'Onboarding page exists',
    onboardingExists,
    'team-launchpad-onboarding.html file not found'
);

// Test 4: Check internal links exist
const internalLinks = [
    'agent-vetting-dashboard.html',
    'index.html'
];

internalLinks.forEach(link => {
    const linkPath = path.join(__dirname, link);
    test(
        `Internal link: ${link}`,
        fs.existsSync(linkPath),
        `File ${link} not found`
    );
});

// Test 5: Check that viewDocumentation function was updated
test(
    'viewDocumentation updated',
    hubContent.includes("window.location.href = 'team-launchpad-onboarding.html'"),
    'viewDocumentation function not updated'
);

// Test 6: Check onboarding banner was added
test(
    'Onboarding banner added',
    hubContent.includes('onboarding-banner'),
    'Onboarding banner not found in HTML'
);

// Test 7: Check close banner function exists
test(
    'Close banner function added',
    hubContent.includes('closeOnboardingBanner'),
    'closeOnboardingBanner function not found'
);

// Test 8: Check onboarding page has proper links back
if (onboardingExists) {
    const onboardingContent = fs.readFileSync(onboardingPath, 'utf-8');
    
    test(
        'Onboarding page links to hub',
        onboardingContent.includes('team-launchpad-hub.html'),
        'Onboarding page does not link back to hub'
    );
    
    test(
        'Onboarding page links to vetting',
        onboardingContent.includes('agent-vetting-dashboard.html'),
        'Onboarding page does not link to vetting dashboard'
    );
}

// Test 9: Check that JavaScript dependencies are loaded
const jsDependencies = [
    'agent-vetting-system.js',
    'contribution-rewards-system.js',
    'agent-hub-integration.js'
];

jsDependencies.forEach(dep => {
    const depPath = path.join(__dirname, dep);
    test(
        `JS dependency: ${dep}`,
        fs.existsSync(depPath),
        `File ${dep} not found`
    );
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary:');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📈 Total: ${results.passed + results.failed}`);
console.log('='.repeat(50) + '\n');

if (results.failed === 0) {
    console.log('🎉 All tests passed! The team launchpad hub is ready to use.');
    process.exit(0);
} else {
    console.log('⚠️  Some tests failed. Please review the issues above.');
    process.exit(1);
}
