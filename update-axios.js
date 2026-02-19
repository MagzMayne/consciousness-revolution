#!/usr/bin/env node
/**
 * Force update axios to secure version in package-lock.json
 * This ensures all dependencies use axios >= 1.13.5
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Updating axios to secure version 1.13.5...\n');

const lockfilePath = path.join(__dirname, 'package-lock.json');

try {
  // Read package-lock.json
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  
  let updatesCount = 0;
  
  // Function to recursively update axios versions
  function updateAxios(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.name === 'axios' || (path.includes('axios') && obj.version)) {
      const currentVersion = obj.version;
      if (currentVersion && currentVersion.match(/^[0-9]/) && currentVersion < '1.13.5') {
        console.log(`  ✓ Updated axios from ${currentVersion} to 1.13.5 at ${path}`);
        obj.version = '1.13.5';
        if (obj.resolved) {
          obj.resolved = 'https://registry.npmjs.org/axios/-/axios-1.13.5.tgz';
        }
        updatesCount++;
      }
    }
    
    // Recursively check all nested objects
    for (const key in obj) {
      if (key === 'dependencies' || key === 'packages') {
        updateAxios(obj[key], path ? `${path}/${key}` : key);
      }
    }
  }
  
  // Update all axios references
  updateAxios(lockfile);
  
  if (updatesCount > 0) {
    // Write updated lockfile
    fs.writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2) + '\n');
    console.log(`\n✅ Updated ${updatesCount} axios reference(s) to version 1.13.5`);
    console.log('   Run "npm install" to apply changes\n');
  } else {
    console.log('✅ All axios references are already at secure version 1.13.5 or higher\n');
  }
  
} catch (error) {
  console.error('❌ Error updating package-lock.json:', error.message);
  process.exit(1);
}
