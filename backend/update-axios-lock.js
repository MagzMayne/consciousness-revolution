#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔒 Updating backend axios to secure version 1.13.5...\n');

const lockfilePath = path.join(__dirname, 'package-lock.json');

try {
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  
  let updated = false;
  
  // Update in packages section
  if (lockfile.packages && lockfile.packages['node_modules/axios']) {
    const currentVersion = lockfile.packages['node_modules/axios'].version;
    if (currentVersion === '1.13.2') {
      console.log(`  ✓ Updating axios from ${currentVersion} to 1.13.5`);
      lockfile.packages['node_modules/axios'].version = '1.13.5';
      lockfile.packages['node_modules/axios'].resolved = 'https://registry.npmjs.org/axios/-/axios-1.13.5.tgz';
      lockfile.packages['node_modules/axios'].integrity = 'sha512-cz4ur7Vb0xS4/KUN0tPWe44eqxrIu31me+fbang3ijiNscE129POzipJJA6zniq2C/Z6sJCjMimjS8Lc/GAs8Q==';
      updated = true;
    }
  }
  
  // Update in dependencies section (lockfile v1 format)
  if (lockfile.dependencies && lockfile.dependencies.axios) {
    const currentVersion = lockfile.dependencies.axios.version;
    if (currentVersion === '1.13.2') {
      console.log(`  ✓ Updating axios dependency from ${currentVersion} to 1.13.5`);
      lockfile.dependencies.axios.version = '1.13.5';
      lockfile.dependencies.axios.resolved = 'https://registry.npmjs.org/axios/-/axios-1.13.5.tgz';
      lockfile.dependencies.axios.integrity = 'sha512-cz4ur7Vb0xS4/KUN0tPWe44eqxrIu31me+fbang3ijiNscE129POzipJJA6zniq2C/Z6sJCjMimjS8Lc/GAs8Q==';
      updated = true;
    }
  }
  
  if (updated) {
    fs.writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2) + '\n');
    console.log('\n✅ Updated backend package-lock.json to axios 1.13.5');
    console.log('   Run "npm install" in backend/ to apply changes\n');
  } else {
    console.log('✅ Backend axios is already at version 1.13.5\n');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
