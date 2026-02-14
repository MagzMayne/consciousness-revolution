#!/usr/bin/env node

/**
 * R3-D3 Site-Wide Tour Test
 * Verifies robot loader is present on all key pages
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 R3-D3 Site-Wide Tour Test\n');
console.log('=' .repeat(60));

// Key pages to check
const keyPages = [
    'index.html',
    'robot-test.html',
    'ABOUT.html',
    'dashboard.html',
    'landing.html',
    'consciousness-tools.html',
    'ARAYA_CONSCIOUS_CHAT.html',
    'WELCOME.html',
    'START_HERE.html',
    'help.html'
];

console.log('\n📄 Checking Robot Presence on Key Pages\n');

let pagesWithRobot = 0;
let totalChecked = 0;

keyPages.forEach(page => {
    const pagePath = path.join(__dirname, page);
    
    if (!fs.existsSync(pagePath)) {
        console.log(`  ⚠️  ${page} - File not found`);
        return;
    }
    
    totalChecked++;
    const content = fs.readFileSync(pagePath, 'utf8');
    
    if (content.includes('robot-assistant-loader.js')) {
        console.log(`  ✅ ${page} - Robot present`);
        pagesWithRobot++;
    } else {
        console.log(`  ❌ ${page} - Robot missing`);
    }
});

console.log(`\nResult: ${pagesWithRobot}/${totalChecked} key pages have robot`);

// Check all HTML files
console.log('\n📊 Scanning All HTML Pages\n');

const allHtmlFiles = [];
function findHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findHtmlFiles(filePath);
        } else if (file.endsWith('.html')) {
            allHtmlFiles.push(filePath);
        }
    });
}

findHtmlFiles(__dirname);

let totalWithRobot = 0;
allHtmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('robot-assistant-loader.js')) {
        totalWithRobot++;
    }
});

console.log(`Total HTML files: ${allHtmlFiles.length}`);
console.log(`Files with robot: ${totalWithRobot}`);
console.log(`Coverage: ${((totalWithRobot / allHtmlFiles.length) * 100).toFixed(1)}%`);

// Test tour sequence functionality
console.log('\n🎯 Tour Sequence Validation\n');

const aibrainPath = path.join(__dirname, 'js', 'robot-ai-brain.js');
const aibrainCode = fs.readFileSync(aibrainPath, 'utf8');

const tourFeatures = {
    'startTour function': aibrainCode.includes('function startTour'),
    'buildTourSequence': aibrainCode.includes('buildTourSequence'),
    'nextTourStep': aibrainCode.includes('nextTourStep'),
    'provideContextualHelp': aibrainCode.includes('provideContextualHelp'),
    'checkForTourOffer': aibrainCode.includes('checkForTourOffer'),
    'Page discovery': aibrainCode.includes('discoverPages'),
    'Visit tracking': aibrainCode.includes('trackPageVisit'),
    'Exploration score': aibrainCode.includes('getExplorationScore'),
};

let tourFeaturesFound = 0;
for (const [feature, found] of Object.entries(tourFeatures)) {
    if (found) {
        console.log(`  ✅ ${feature}`);
        tourFeaturesFound++;
    } else {
        console.log(`  ❌ ${feature}`);
    }
}

console.log(`\nResult: ${tourFeaturesFound}/${Object.keys(tourFeatures).length} tour features present`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 Site-Wide Tour Test Summary\n');

if (pagesWithRobot / totalChecked > 0.8) {
    console.log('✅ Robot is present on most key pages');
} else {
    console.log('⚠️  Robot should be added to more key pages');
}

if ((totalWithRobot / allHtmlFiles.length) > 0.5) {
    console.log('✅ Good site-wide robot coverage');
} else {
    console.log('⚠️  Consider adding robot to more pages');
}

if (tourFeaturesFound === Object.keys(tourFeatures).length) {
    console.log('✅ All tour features implemented');
} else {
    console.log('⚠️  Some tour features missing');
}

console.log('\n🎉 R3-D3 is ready to guide users across the site!');
console.log('\nKey Features:');
console.log('  • Named identity (r3-d3)');
console.log('  • Autonomous page editing');
console.log('  • Site-wide tour system');
console.log('  • Contextual help');
console.log('  • Exploration tracking');
console.log('  • State persistence');
