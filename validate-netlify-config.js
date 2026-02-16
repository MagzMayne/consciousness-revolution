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
 * File: validate-netlify-config.js
 * Declaration ID: IP-56F866DE-MLL28ZWM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Netlify Configuration Validator
 * Tests that all Netlify configuration files are properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Netlify Configuration...\n');

let hasErrors = false;

// Check netlify.toml
console.log('1️⃣ Checking netlify.toml...');
const tomlPath = path.join(__dirname, 'netlify.toml');
if (fs.existsSync(tomlPath)) {
  const content = fs.readFileSync(tomlPath, 'utf8');
  
  // Check for required sections
  const requiredSections = ['[build]', '[build.environment]', '[[redirects]]', '[[headers]]'];
  const missingSection = requiredSections.find(section => !content.includes(section));
  
  if (missingSection) {
    console.log(`   ❌ Missing section: ${missingSection}`);
    hasErrors = true;
  } else {
    console.log('   ✅ netlify.toml is properly configured');
    
    // Check specific settings
    if (content.includes('publish = "."')) {
      console.log('   ✅ Publish directory set to root');
    }
    if (content.includes('functions = "netlify/functions"')) {
      console.log('   ✅ Functions directory configured');
    }
    if (content.includes('NODE_VERSION = "18"')) {
      console.log('   ✅ Node.js version specified');
    }
  }
} else {
  console.log('   ❌ netlify.toml not found');
  hasErrors = true;
}

// Check _redirects
console.log('\n2️⃣ Checking _redirects...');
const redirectsPath = path.join(__dirname, '_redirects');
if (fs.existsSync(redirectsPath)) {
  const content = fs.readFileSync(redirectsPath, 'utf8');
  if (content.includes('/api/*') && content.includes('/.netlify/functions/:splat')) {
    console.log('   ✅ API redirects configured');
  }
  if (content.includes('/*') && content.includes('/index.html')) {
    console.log('   ✅ SPA fallback configured');
  }
  console.log('   ✅ _redirects file exists');
} else {
  console.log('   ❌ _redirects file not found');
  hasErrors = true;
}

// Check _headers
console.log('\n3️⃣ Checking _headers...');
const headersPath = path.join(__dirname, '_headers');
if (fs.existsSync(headersPath)) {
  const content = fs.readFileSync(headersPath, 'utf8');
  
  const securityHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Referrer-Policy'
  ];
  
  const missingHeader = securityHeaders.find(header => !content.includes(header));
  if (missingHeader) {
    console.log(`   ⚠️ Missing security header: ${missingHeader}`);
  } else {
    console.log('   ✅ Security headers configured');
  }
  
  if (content.includes('Cache-Control')) {
    console.log('   ✅ Cache headers configured');
  }
  
  console.log('   ✅ _headers file exists');
} else {
  console.log('   ❌ _headers file not found');
  hasErrors = true;
}

// Check Netlify functions
console.log('\n4️⃣ Checking Netlify functions...');
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (fs.existsSync(functionsDir)) {
  const files = fs.readdirSync(functionsDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  if (jsFiles.length > 0) {
    console.log(`   ✅ Found ${jsFiles.length} function(s):`);
    jsFiles.forEach(file => {
      console.log(`      - ${file}`);
      
      // Check if function exports handler
      const funcPath = path.join(functionsDir, file);
      const funcContent = fs.readFileSync(funcPath, 'utf8');
      if (funcContent.includes('exports.handler')) {
        console.log(`        ✅ Exports handler`);
      } else {
        console.log(`        ⚠️ Missing exports.handler`);
      }
    });
  } else {
    console.log('   ⚠️ No functions found in directory');
  }
} else {
  console.log('   ❌ netlify/functions directory not found');
  hasErrors = true;
}

// Check documentation
console.log('\n5️⃣ Checking documentation...');
const docsToCheck = [
  'NETLIFY_DEPLOYMENT.md',
  'netlify/functions/README.md'
];

docsToCheck.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    console.log(`   ✅ ${doc} exists`);
  } else {
    console.log(`   ❌ ${doc} not found`);
    hasErrors = true;
  }
});

// Check package.json for build script
console.log('\n6️⃣ Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (pkg.scripts && pkg.scripts.build) {
    console.log(`   ✅ Build script: ${pkg.scripts.build}`);
  } else {
    console.log('   ⚠️ No build script defined');
  }
  
  if (pkg.engines && pkg.engines.node) {
    console.log(`   ✅ Node version specified: ${pkg.engines.node}`);
  }
} else {
  console.log('   ❌ package.json not found');
  hasErrors = true;
}

// Final summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VALIDATION FAILED - Please fix the errors above');
  process.exit(1);
} else {
  console.log('✅ ALL CHECKS PASSED - Netlify configuration is ready!');
  console.log('\n📚 Next steps:');
  console.log('   1. Go to https://app.netlify.com/');
  console.log('   2. Click "Add new site" → "Import an existing project"');
  console.log('   3. Connect your GitHub repository');
  console.log('   4. Netlify will auto-detect settings from netlify.toml');
  console.log('   5. Click "Deploy site"');
  console.log('\n📖 See NETLIFY_DEPLOYMENT.md for detailed instructions');
}
