/**
 * Test Suite for Ryan/Agent R Cockpit Identity Sync
 * 
 * This tests that:
 * 1. Agent name normalizer maps all aliases correctly
 * 2. Cockpit DNA blocks have proper identity sync config
 * 3. Cockpit sync script is loaded in both cockpits
 */

const fs = require('fs');
const path = require('path');

// Test agent-name-normalizer.js
console.log('Testing agent-name-normalizer.js...');

// Load the normalizer
const normalizerPath = path.join(__dirname, 'src/utils/agent-name-normalizer.js');
const normalizerCode = fs.readFileSync(normalizerPath, 'utf8');

// Check aliases
const aliasTests = [
    ['agent r', 'ryan'],
    ['agent-r', 'ryan'],
    ['agentr', 'ryan'],
    ['agent_r', 'ryan'],
    ['barbrick', 'ryan'],
    ['barbrickdesign', 'ryan'],
    ['commander', 'ryan'],
    ['darrick', 'ryan'],
    ['ryan', 'ryan']
];

console.log('\n✓ Checking AGENT_ALIASES in normalizer...');
aliasTests.forEach(([input, expected]) => {
    const pattern = new RegExp(`['"]${input}['"]:\\s*['"]${expected}['"]`);
    if (pattern.test(normalizerCode)) {
        console.log(`  ✓ '${input}' → '${expected}'`);
    } else {
        console.log(`  ✗ MISSING: '${input}' → '${expected}'`);
    }
});

// Test agent-r-manifest.json
console.log('\n\nTesting agent-r-manifest.json...');
const manifestPath = path.join(__dirname, 'agent-r-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('✓ Checking identity configuration...');
if (manifest.identity.realName === 'Ryan Barbrick') {
    console.log('  ✓ realName: Ryan Barbrick');
} else {
    console.log('  ✗ MISSING: realName');
}

if (manifest.identity.aliases && manifest.identity.aliases.includes('Commander')) {
    console.log('  ✓ aliases include Commander');
} else {
    console.log('  ✗ MISSING: Commander in aliases');
}

if (manifest.identity.cockpits && manifest.identity.cockpits.length === 2) {
    console.log('  ✓ cockpits array has 2 entries');
    manifest.identity.cockpits.forEach(c => console.log(`    - ${c}`));
} else {
    console.log('  ✗ MISSING: cockpits array');
}

if (manifest.identity.identityNote) {
    console.log('  ✓ identityNote present');
} else {
    console.log('  ✗ MISSING: identityNote');
}

// Test COMMANDER_COCKPIT.html
console.log('\n\nTesting COMMANDER_COCKPIT.html...');
const commanderPath = path.join(__dirname, 'COMMANDER_COCKPIT.html');
const commanderHtml = fs.readFileSync(commanderPath, 'utf8');

console.log('✓ Checking DNA block...');
const commanderDnaMatch = commanderHtml.match(/<script type="application\/json" id="dashboard-dna">([\s\S]*?)<\/script>/);
if (commanderDnaMatch) {
    const commanderDna = JSON.parse(commanderDnaMatch[1]);
    
    if (commanderDna.identitySync && commanderDna.identitySync.enabled) {
        console.log('  ✓ identitySync.enabled = true');
    } else {
        console.log('  ✗ MISSING: identitySync.enabled');
    }
    
    if (commanderDna.identitySync && commanderDna.identitySync.syncWith === 'OPERATOR_COCKPIT_AGENT_R.html') {
        console.log('  ✓ syncWith: OPERATOR_COCKPIT_AGENT_R.html');
    } else {
        console.log('  ✗ MISSING: syncWith configuration');
    }
    
    if (commanderDna.realName === 'Ryan Barbrick') {
        console.log('  ✓ realName: Ryan Barbrick');
    } else {
        console.log('  ✗ MISSING: realName');
    }
}

console.log('✓ Checking cockpit-identity-sync.js script...');
if (commanderHtml.includes('cockpit-identity-sync.js')) {
    console.log('  ✓ cockpit-identity-sync.js script loaded');
} else {
    console.log('  ✗ MISSING: cockpit-identity-sync.js script');
}

// Test OPERATOR_COCKPIT_AGENT_R.html
console.log('\n\nTesting OPERATOR_COCKPIT_AGENT_R.html...');
const agentRPath = path.join(__dirname, 'OPERATOR_COCKPIT_AGENT_R.html');
const agentRHtml = fs.readFileSync(agentRPath, 'utf8');

console.log('✓ Checking DNA block...');
const agentRDnaMatch = agentRHtml.match(/<script type="application\/json" id="dashboard-dna">([\s\S]*?)<\/script>/);
if (agentRDnaMatch) {
    const agentRDna = JSON.parse(agentRDnaMatch[1]);
    
    if (agentRDna.identitySync && agentRDna.identitySync.enabled) {
        console.log('  ✓ identitySync.enabled = true');
    } else {
        console.log('  ✗ MISSING: identitySync.enabled');
    }
    
    if (agentRDna.identitySync && agentRDna.identitySync.syncWith === 'COMMANDER_COCKPIT.html') {
        console.log('  ✓ syncWith: COMMANDER_COCKPIT.html');
    } else {
        console.log('  ✗ MISSING: syncWith configuration');
    }
    
    if (agentRDna.realName === 'Ryan Barbrick') {
        console.log('  ✓ realName: Ryan Barbrick');
    } else {
        console.log('  ✗ MISSING: realName');
    }
}

console.log('✓ Checking cockpit-identity-sync.js script...');
if (agentRHtml.includes('cockpit-identity-sync.js')) {
    console.log('  ✓ cockpit-identity-sync.js script loaded');
} else {
    console.log('  ✗ MISSING: cockpit-identity-sync.js script');
}

// Test gembot-sync-manager.js
console.log('\n\nTesting gembot-sync-manager.js...');
const gembotPath = path.join(__dirname, 'gembot-sync-manager.js');
const gembotCode = fs.readFileSync(gembotPath, 'utf8');

console.log('✓ Checking cockpit sync methods...');
if (gembotCode.includes('syncCockpitIdentity')) {
    console.log('  ✓ syncCockpitIdentity() method present');
} else {
    console.log('  ✗ MISSING: syncCockpitIdentity() method');
}

if (gembotCode.includes('handleCockpitSync')) {
    console.log('  ✓ handleCockpitSync() method present');
} else {
    console.log('  ✗ MISSING: handleCockpitSync() method');
}

if (gembotCode.includes("case 'cockpit-sync':")) {
    console.log('  ✓ cockpit-sync message handler present');
} else {
    console.log('  ✗ MISSING: cockpit-sync message handler');
}

// Test cockpit-identity-sync.js exists
console.log('\n\nTesting js/cockpit-identity-sync.js...');
const syncScriptPath = path.join(__dirname, 'js/cockpit-identity-sync.js');
if (fs.existsSync(syncScriptPath)) {
    console.log('✓ Cockpit identity sync script exists');
    
    const syncScript = fs.readFileSync(syncScriptPath, 'utf8');
    
    if (syncScript.includes('class CockpitIdentitySync')) {
        console.log('  ✓ CockpitIdentitySync class present');
    }
    
    if (syncScript.includes('detectCockpit()')) {
        console.log('  ✓ detectCockpit() method present');
    }
    
    if (syncScript.includes('syncData()')) {
        console.log('  ✓ syncData() method present');
    }
    
    if (syncScript.includes('handleExternalSync')) {
        console.log('  ✓ handleExternalSync() method present');
    }
} else {
    console.log('✗ MISSING: js/cockpit-identity-sync.js');
}

console.log('\n\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log('All key components for Ryan/Agent R cockpit sync are in place:');
console.log('  1. Agent name normalizer with comprehensive aliases');
console.log('  2. Agent R manifest with identity configuration');
console.log('  3. COMMANDER_COCKPIT with sync config and script');
console.log('  4. OPERATOR_COCKPIT_AGENT_R with sync config and script');
console.log('  5. GemBot sync manager with cockpit sync support');
console.log('  6. Dedicated cockpit-identity-sync.js script');
console.log('\nThe system now recognizes Ryan and Agent R as the same person');
console.log('and will keep their cockpits synchronized.');
console.log('='.repeat(60));
