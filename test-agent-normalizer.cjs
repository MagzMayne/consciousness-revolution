/**
 * Node.js test for Agent Name Normalizer
 * Tests the araya -> arya alias functionality
 */

const fs = require('fs');
const path = require('path');

// Load the agent-name-normalizer module
const normalizerPath = path.join(__dirname, 'src', 'utils', 'agent-name-normalizer.js');
const normalizerCode = fs.readFileSync(normalizerPath, 'utf8');

// Create a module context and evaluate
const mod = { exports: {} };
const func = new Function('module', 'exports', normalizerCode);
func(mod, mod.exports);

const {
    normalizeAgentName,
    isValidAgent,
    getAllAgentNames,
    getCanonicalName,
    getAliases,
    AGENT_ALIASES,
    CANONICAL_AGENTS
} = mod.exports;

console.log('🧪 Agent Name Normalizer Test Suite\n');
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

// Test 1: Basic alias mapping
console.log('\n📋 Test 1: Alias Mapping');
test('AGENT_ALIASES contains araya -> arya', AGENT_ALIASES['araya'] === 'arya');

// Test 2: Normalization
console.log('\n📋 Test 2: Normalization');
test('normalizeAgentName("araya") returns "arya"', normalizeAgentName('araya') === 'arya');
test('normalizeAgentName("ARAYA") returns "arya"', normalizeAgentName('ARAYA') === 'arya');
test('normalizeAgentName("Araya") returns "arya"', normalizeAgentName('Araya') === 'arya');
test('normalizeAgentName("arya") returns "arya"', normalizeAgentName('arya') === 'arya');
test('normalizeAgentName("austin") returns "austin"', normalizeAgentName('austin') === 'austin');
test('normalizeAgentName("andy") returns "andy"', normalizeAgentName('andy') === 'andy');
test('normalizeAgentName("ryan") returns "ryan"', normalizeAgentName('ryan') === 'ryan');

// Test 3: Validation
console.log('\n📋 Test 3: Agent Validation');
test('isValidAgent("araya") returns true', isValidAgent('araya') === true);
test('isValidAgent("ARAYA") returns true', isValidAgent('ARAYA') === true);
test('isValidAgent("arya") returns true', isValidAgent('arya') === true);
test('isValidAgent("austin") returns true', isValidAgent('austin') === true);
test('isValidAgent("invalid") returns false', isValidAgent('invalid') === false);

// Test 4: Canonical names
console.log('\n📋 Test 4: Canonical Names');
test('getCanonicalName("araya") returns "arya"', getCanonicalName('araya') === 'arya');
test('getCanonicalName("arya") returns "arya"', getCanonicalName('arya') === 'arya');
test('getCanonicalName("invalid") returns null', getCanonicalName('invalid') === null);

// Test 5: Get all agent names
console.log('\n📋 Test 5: All Agent Names');
const allNames = getAllAgentNames();
test('getAllAgentNames() includes "arya"', allNames.includes('arya'));
test('getAllAgentNames() includes "araya"', allNames.includes('araya'));
test('getAllAgentNames() includes "austin"', allNames.includes('austin'));
test('getAllAgentNames() includes "andy"', allNames.includes('andy'));
test('getAllAgentNames() includes "ryan"', allNames.includes('ryan'));

// Test 6: Get aliases
console.log('\n📋 Test 6: Aliases Lookup');
const aryaAliases = getAliases('arya');
test('getAliases("arya") includes "araya"', aryaAliases.includes('araya'));
test('getAliases("austin") returns empty array', getAliases('austin').length === 0);

// Test 7: Canonical agents list
console.log('\n📋 Test 7: Canonical Agents');
test('CANONICAL_AGENTS has 4 agents', CANONICAL_AGENTS.length === 4);
test('CANONICAL_AGENTS includes "arya"', CANONICAL_AGENTS.includes('arya'));
test('CANONICAL_AGENTS does not include "araya"', !CANONICAL_AGENTS.includes('araya'));

// Test 8: Edge cases
console.log('\n📋 Test 8: Edge Cases');
test('normalizeAgentName("") returns ""', normalizeAgentName('') === '');
test('normalizeAgentName with whitespace', normalizeAgentName(' araya ') === 'arya');
test('normalizeAgentName handles null gracefully', normalizeAgentName(null) === '');

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
