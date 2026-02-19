#!/usr/bin/env node
/**
 * Verify all axios dependencies are using secure version
 */

const fs = require('fs');

console.log('🔍 Scanning for axios dependencies...\n');

const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

const axiosVersions = new Set();
const issues = [];

// Check all packages
function scanPackages(packages, path = '') {
  for (const [name, pkg] of Object.entries(packages || {})) {
    if (name === 'axios' || name.includes('node_modules/axios')) {
      const version = pkg.version;
      axiosVersions.add(version);
      
      // Check if version is vulnerable
      if (version && version.match(/^1\.(0|1[0-3])\./) && version < '1.13.5') {
        issues.push({
          path: path + name,
          version,
          status: '❌ VULNERABLE'
        });
      } else if (version && version < '0.30.3' && !version.startsWith('1.')) {
        issues.push({
          path: path + name,
          version,
          status: '❌ VULNERABLE (0.x branch)'
        });
      } else {
        console.log(`  ✅ ${name}: ${version} (SECURE)`);
      }
    }
    
    // Check dependencies of this package
    if (pkg.dependencies) {
      for (const [depName, depVersion] of Object.entries(pkg.dependencies)) {
        if (depName === 'axios') {
          console.log(`  📦 ${name} depends on axios ${depVersion}`);
        }
      }
    }
  }
}

// Scan packages
if (packageLock.packages) {
  scanPackages(packageLock.packages);
}

console.log(`\n📊 Summary:`);
console.log(`  Total axios versions found: ${axiosVersions.size}`);
console.log(`  Versions: ${Array.from(axiosVersions).join(', ')}`);

if (issues.length > 0) {
  console.log(`\n❌ SECURITY ISSUES FOUND:`);
  issues.forEach(issue => {
    console.log(`  ${issue.status} ${issue.path}: ${issue.version}`);
  });
  process.exit(1);
} else {
  console.log(`\n✅ All axios dependencies are SECURE`);
}
