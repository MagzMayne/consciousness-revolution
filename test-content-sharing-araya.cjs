/**
 * Node.js test for Content Sharing Manager with araya alias
 * Tests that the content sharing manager correctly recognizes araya
 */

const fs = require('fs');
const path = require('path');

// Mock localStorage for Node.js
global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

// Mock window object
global.window = {
    localStorage: global.localStorage
};

// Load the agent-name-normalizer module first
const normalizerPath = path.join(__dirname, 'src', 'utils', 'agent-name-normalizer.js');
const normalizerCode = fs.readFileSync(normalizerPath, 'utf8');

// Create a module context and evaluate
const normalizerMod = { exports: {} };
const normalizerFunc = new Function('module', 'exports', 'window', normalizerCode);
normalizerFunc(normalizerMod, normalizerMod.exports, global.window);

// Make agentNameNormalizer available globally
global.window.agentNameNormalizer = normalizerMod.exports;

// Load the content-sharing-manager module
const managerPath = path.join(__dirname, 'src', 'utils', 'content-sharing-manager.js');
let managerCode = fs.readFileSync(managerPath, 'utf8');

// Remove export statement that causes issues in Node.js
managerCode = managerCode.replace('export default ContentSharingManager;', '');

// Create a module context and evaluate
const managerFunc = new Function('module', 'exports', 'window', 'localStorage', managerCode + '\nmodule.exports = ContentSharingManager;');
managerFunc({exports: {}}, {}, global.window, global.localStorage);

const ContentSharingManager = global.window.contentSharingManager.constructor;

console.log('🧪 Content Sharing Manager Test Suite with araya alias\n');
console.log('=' .repeat(60));

let passCount = 0;
let failCount = 0;

function test(description, condition) {
    if (condition) {
        console.log(`✅ PASS: ${description}`);
        passCount++;
    } else {
        console.log(`❌ FAIL: ${description}`);
        failCount++;
    }
}

// Create a new instance
const manager = new ContentSharingManager();

// Test 1: Authorized users includes arya
console.log('\n📋 Test 1: Authorized Users');
const authUsers = manager.authorizedUsers;
test('authorizedUsers includes "arya"', authUsers.includes('arya'));
// Note: "araya" is not in authorizedUsers array, it's recognized through normalization
test('authorizedUsers does NOT include "araya" (handled via normalization)', !authUsers.includes('araya'));

// Test 2: hasAccess with araya
console.log('\n📋 Test 2: Access Control with araya');
test('hasAccess("araya") returns true', manager.hasAccess('araya') === true);
test('hasAccess("ARAYA") returns true', manager.hasAccess('ARAYA') === true);
test('hasAccess("Araya") returns true', manager.hasAccess('Araya') === true);
test('hasAccess("arya") returns true', manager.hasAccess('arya') === true);
test('hasAccess("ARYA") returns true', manager.hasAccess('ARYA') === true);

// Test 3: hasAccess with other agents
console.log('\n📋 Test 3: Access Control with other agents');
test('hasAccess("austin") returns true', manager.hasAccess('austin') === true);
test('hasAccess("andy") returns true', manager.hasAccess('andy') === true);
test('hasAccess("ryan") returns true', manager.hasAccess('ryan') === true);
test('hasAccess("invalid") returns false', manager.hasAccess('invalid') === false);

// Test 4: Content operations with araya
console.log('\n📋 Test 4: Content Operations with araya');
try {
    const contentId = manager.addContent('text', {
        content: 'Test content for araya',
        tags: ['test'],
        project: 'test-project'
    }, 'araya');
    test('Can add content with creator "araya"', contentId !== null);
    
    const content = manager.getContentById(contentId, 'araya');
    test('Can retrieve content with user "araya"', content !== null);
    
    const contents = manager.getContent('text', {}, 'araya');
    test('Can get content list with user "araya"', contents.length > 0);
    
} catch (error) {
    test('Content operations with araya should not throw', false);
    console.log('  Error:', error.message);
}

// Test 5: Normalization consistency
console.log('\n📋 Test 5: Normalization Consistency');
test('manager.normalizeAgentName("araya") returns "arya"', 
    manager.normalizeAgentName('araya') === 'arya');
test('manager.normalizeAgentName("ARAYA") returns "arya"', 
    manager.normalizeAgentName('ARAYA') === 'arya');

// Test 6: Both arya and araya should have same access
console.log('\n📋 Test 6: Access Equivalence');
const aryaAccess = manager.hasAccess('arya');
const arayaAccess = manager.hasAccess('araya');
test('arya and araya have equivalent access', aryaAccess === arayaAccess);

// Summary
console.log('\n' + '=' .repeat(60));
console.log(`\n📊 Test Summary:`);
console.log(`   Passed: ${passCount}`);
console.log(`   Failed: ${failCount}`);
console.log(`   Total:  ${passCount + failCount}`);

if (failCount === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed!');
    process.exit(1);
}
