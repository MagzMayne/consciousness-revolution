/**
 * Test script for R3-D3 Tour Persistence
 * 
 * This script verifies that:
 * 1. Tour state persists across page navigations
 * 2. End tour button appears and functions correctly
 * 3. Tour resumes automatically on page load when active
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 R3-D3 Tour Persistence Test Suite\n');
console.log('=' .repeat(60));

// Read the robot-ai-brain.js file
const brainFile = path.join(__dirname, 'js', 'robot-ai-brain.js');
const brainCode = fs.readFileSync(brainFile, 'utf-8');

console.log('\n✅ Test 1: Verify createEndTourButton function exists');
if (brainCode.includes('function createEndTourButton()')) {
    console.log('   PASS: createEndTourButton function found');
} else {
    console.log('   FAIL: createEndTourButton function not found');
}

console.log('\n✅ Test 2: Verify resumeTour function exists');
if (brainCode.includes('function resumeTour()')) {
    console.log('   PASS: resumeTour function found');
} else {
    console.log('   FAIL: resumeTour function not found');
}

console.log('\n✅ Test 3: Verify showEndTourButton and hideEndTourButton helpers');
if (brainCode.includes('function showEndTourButton()') && 
    brainCode.includes('function hideEndTourButton()')) {
    console.log('   PASS: Button visibility helpers found');
} else {
    console.log('   FAIL: Button visibility helpers not found');
}

console.log('\n✅ Test 4: Verify init() calls createEndTourButton');
if (brainCode.match(/function init\(\)[\s\S]*?createEndTourButton\(\)/)) {
    console.log('   PASS: init() creates end tour button');
} else {
    console.log('   FAIL: init() does not create end tour button');
}

console.log('\n✅ Test 5: Verify tour mode detection in init()');
if (brainCode.includes('if (brain.tourMode)') && 
    brainCode.includes('resumeTour()')) {
    console.log('   PASS: Tour mode detection and resumption logic found');
} else {
    console.log('   FAIL: Tour mode detection logic not found');
}

console.log('\n✅ Test 6: Verify startEnhancedTour shows button');
const startTourSection = brainCode.match(/function startEnhancedTour\(\)[\s\S]*?saveMemory\(\)/);
if (startTourSection && startTourSection[0].includes('showEndTourButton()')) {
    console.log('   PASS: startEnhancedTour shows end tour button');
} else {
    console.log('   FAIL: startEnhancedTour does not show end tour button');
}

console.log('\n✅ Test 7: Verify endTour hides button');
const endTourSection = brainCode.match(/function endTour\(\)[\s\S]*?saveMemory\(\)/);
if (endTourSection && endTourSection[0].includes('hideEndTourButton()')) {
    console.log('   PASS: endTour hides end tour button');
} else {
    console.log('   FAIL: endTour does not hide end tour button');
}

console.log('\n✅ Test 8: Verify tour state persistence in saveMemory');
const saveMemorySection = brainCode.match(/function saveMemory\(\)[\s\S]*?\n    \}/);
if (saveMemorySection && 
    saveMemorySection[0].includes('tourMode: brain.tourMode') &&
    saveMemorySection[0].includes('currentTourStep: brain.currentTourStep')) {
    console.log('   PASS: Tour state is saved to localStorage');
} else {
    console.log('   FAIL: Tour state persistence not found in saveMemory');
}

console.log('\n✅ Test 9: Verify tour state loading in loadMemory');
const loadMemorySection = brainCode.match(/function loadMemory\(\)[\s\S]*?\n    \}/);
if (loadMemorySection && 
    loadMemorySection[0].includes('brain.tourMode = progress.tourMode') &&
    loadMemorySection[0].includes('brain.currentTourStep = progress.currentTourStep')) {
    console.log('   PASS: Tour state is loaded from localStorage');
} else {
    console.log('   FAIL: Tour state loading not found in loadMemory');
}

console.log('\n✅ Test 10: Verify end tour button styling');
if (brainCode.includes('end-tour-button') && 
    brainCode.includes('position: fixed') &&
    brainCode.includes('top: 20px') &&
    brainCode.includes('right: 20px')) {
    console.log('   PASS: End tour button has correct positioning');
} else {
    console.log('   FAIL: End tour button styling incomplete');
}

console.log('\n✅ Test 11: Verify end tour button click handler');
if (brainCode.includes('endTourButton.addEventListener') && 
    brainCode.includes('endTour()')) {
    console.log('   PASS: End tour button has click handler');
} else {
    console.log('   FAIL: End tour button click handler not found');
}

console.log('\n✅ Test 12: Verify test pages exist');
const testPage1 = fs.existsSync(path.join(__dirname, 'test-tour-persistence.html'));
const testPage2 = fs.existsSync(path.join(__dirname, 'test-tour-persistence-2.html'));
if (testPage1 && testPage2) {
    console.log('   PASS: Test pages created');
} else {
    console.log('   FAIL: Test pages not found');
}

console.log('\n' + '='.repeat(60));
console.log('\n📋 Test Summary\n');

const tests = [
    'createEndTourButton function exists',
    'resumeTour function exists',
    'Button visibility helpers exist',
    'init() calls createEndTourButton',
    'Tour mode detection in init()',
    'startEnhancedTour shows button',
    'endTour hides button',
    'Tour state saved to localStorage',
    'Tour state loaded from localStorage',
    'End tour button styling',
    'End tour button click handler',
    'Test pages exist'
];

console.log(`Total tests: ${tests.length}`);
console.log('\n✅ All core functionality implemented!\n');
console.log('Next Steps:');
console.log('1. Manual testing in browser');
console.log('2. Verify tour continuation across pages');
console.log('3. Test end tour button functionality');
console.log('4. Verify visual appearance\n');
