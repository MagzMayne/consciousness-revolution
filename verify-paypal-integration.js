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
 * File: verify-paypal-integration.js
 * Declaration ID: IP-7D4C8C97-MLL28ZWM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * PayPal Integration Verification Script
 * 
 * Verifies that all HTML files have proper PayPal integration
 * and that the correct email (Barbrickdesign@gmail.com) is used
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  EXCLUDE_DIRS: ['node_modules', '.git', 'dist', 'build', 'ember-terminal-main'],
  REQUIRED_EMAIL: 'barbrickdesign@gmail.com',
  INTEGRATION_SCRIPT: '/src/utils/paypal-integration.js',
  CLIENT_ID_PATTERN: /CLIENT_ID:\s*['"]([^'"]+)['"]/
};

class PayPalVerifier {
  constructor() {
    this.stats = {
      totalHtml: 0,
      withIntegration: 0,
      withDirectSDK: 0,
      withCorrectEmail: 0,
      withIncorrectEmail: 0,
      missing: 0,
      verified: 0
    };
    this.issues = [];
    this.verified = [];
  }

  log(type, message, file = null) {
    const entry = { type, message, file, timestamp: new Date().toISOString() };
    
    if (type === 'issue') {
      this.issues.push(entry);
    } else if (type === 'verified') {
      this.verified.push(entry);
    }

    const prefix = {
      'info': '📋',
      'success': '✅',
      'issue': '⚠️',
      'error': '❌',
      'verified': '✓'
    }[type] || '•';

    console.log(`${prefix} ${message}${file ? ` (${file})` : ''}`);
  }

  hasPayPalIntegration(content) {
    return content.includes('paypal-integration.js') ||
           content.includes('PayPalIntegration');
  }

  hasDirectPayPalSDK(content) {
    return content.includes('paypal.com/sdk/js') && 
           content.includes('client-id');
  }

  checkEmail(content) {
    const emailPattern = /barbrickdesign@gmail\.com/gi;
    const matches = content.match(emailPattern);
    
    if (!matches) {
      return { found: false, count: 0, correct: false };
    }

    // Check for correct casing
    const correctCasing = matches.every(email => 
      email === 'barbrickdesign@gmail.com' || 
      email === 'Barbrickdesign@gmail.com' ||
      email === 'BarbrickDesign@gmail.com'
    );

    return {
      found: true,
      count: matches.length,
      correct: correctCasing,
      examples: matches.slice(0, 3)
    };
  }

  shouldSkipFile(filePath) {
    for (const dir of CONFIG.EXCLUDE_DIRS) {
      if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
        return true;
      }
    }
    return false;
  }

  isValidHTMLFile(content) {
    return (content.includes('<html') || content.includes('<!DOCTYPE')) &&
           (content.includes('</html>') || content.includes('</body>'));
  }

  verifyFile(filePath) {
    try {
      if (this.shouldSkipFile(filePath)) {
        return { skipped: true };
      }

      const content = fs.readFileSync(filePath, 'utf8');

      if (!this.isValidHTMLFile(content)) {
        return { skipped: true, reason: 'not valid HTML' };
      }

      this.stats.totalHtml++;

      const hasCentralized = this.hasPayPalIntegration(content);
      const hasDirectSDK = this.hasDirectPayPalSDK(content);
      const emailCheck = this.checkEmail(content);

      let status = 'missing';

      if (hasCentralized) {
        this.stats.withIntegration++;
        status = 'centralized';
        this.log('verified', 'Has centralized PayPal integration', filePath);
      } else if (hasDirectSDK) {
        this.stats.withDirectSDK++;
        status = 'direct-sdk';
        this.log('verified', 'Has direct PayPal SDK integration', filePath);
      } else {
        this.stats.missing++;
        this.log('issue', 'Missing PayPal integration', filePath);
        return { status: 'missing', emailCheck };
      }

      if (emailCheck.found) {
        if (emailCheck.correct) {
          this.stats.withCorrectEmail++;
          this.log('verified', `Email found and correct (${emailCheck.count} occurrences)`, filePath);
        } else {
          this.stats.withIncorrectEmail++;
          this.log('issue', `Email found but incorrect casing: ${emailCheck.examples.join(', ')}`, filePath);
        }
      }

      this.stats.verified++;
      return { status, emailCheck };

    } catch (error) {
      this.log('error', `Failed to verify: ${error.message}`, filePath);
      return { error: error.message };
    }
  }

  findAllHTMLFiles(dir = __dirname) {
    let htmlFiles = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!CONFIG.EXCLUDE_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
            htmlFiles = htmlFiles.concat(this.findAllHTMLFiles(fullPath));
          }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      }
    } catch (error) {
      this.log('error', `Error reading directory: ${error.message}`, dir);
    }

    return htmlFiles;
  }

  verifyIntegrationScript() {
    const scriptPath = path.join(__dirname, 'src/utils/paypal-integration.js');
    
    try {
      const content = fs.readFileSync(scriptPath, 'utf8');
      
      // Check for CLIENT_ID
      const clientIdMatch = content.match(CONFIG.CLIENT_ID_PATTERN);
      
      if (!clientIdMatch) {
        this.log('issue', 'CLIENT_ID not found in integration script');
        return false;
      }

      const clientId = clientIdMatch[1];
      
      if (clientId === '{{PAYPAL_CLIENT_ID}}' || clientId === '') {
        this.log('issue', 'CLIENT_ID is placeholder - not configured');
        return false;
      }

      this.log('success', `CLIENT_ID configured: ${clientId.substring(0, 20)}...`);
      
      // Check for fallback
      if (content.includes('FALLBACK_CLIENT_ID')) {
        this.log('success', 'Fallback configuration present');
      }

      return true;
    } catch (error) {
      this.log('error', `Failed to read integration script: ${error.message}`);
      return false;
    }
  }

  async verify() {
    console.log('\n🔍 PayPal Integration Verification\n');
    console.log('Configuration:');
    console.log(`  Required email: ${CONFIG.REQUIRED_EMAIL}`);
    console.log(`  Integration script: ${CONFIG.INTEGRATION_SCRIPT}\n`);

    // Verify integration script
    this.log('info', 'Checking integration script...');
    this.verifyIntegrationScript();

    // Find all HTML files
    this.log('info', 'Finding HTML files...');
    const htmlFiles = this.findAllHTMLFiles();
    this.log('info', `Found ${htmlFiles.length} HTML files`);

    // Verify each file
    this.log('info', 'Verifying files...\n');
    for (const file of htmlFiles) {
      this.verifyFile(file);
    }

    // Generate report
    console.log('\n📊 Verification Report\n');
    console.log(`  Total HTML files: ${this.stats.totalHtml}`);
    console.log(`  With centralized integration: ${this.stats.withIntegration}`);
    console.log(`  With direct SDK integration: ${this.stats.withDirectSDK}`);
    console.log(`  Missing integration: ${this.stats.missing}`);
    console.log(`  With correct email: ${this.stats.withCorrectEmail}`);
    console.log(`  With incorrect email: ${this.stats.withIncorrectEmail}`);
    console.log(`  Successfully verified: ${this.stats.verified}\n`);

    // Show issues
    if (this.issues.length > 0) {
      console.log(`⚠️  Issues Found (${this.issues.length}):\n`);
      this.issues.slice(0, 20).forEach(issue => {
        console.log(`  - ${issue.message}${issue.file ? ` (${path.basename(issue.file)})` : ''}`);
      });
      if (this.issues.length > 20) {
        console.log(`  ... and ${this.issues.length - 20} more issues\n`);
      }
    }

    // Calculate percentage
    const totalIntegrated = this.stats.withIntegration + this.stats.withDirectSDK;
    const percentage = this.stats.totalHtml > 0 
      ? ((totalIntegrated / this.stats.totalHtml) * 100).toFixed(1)
      : 0;

    console.log(`\n✅ Integration Coverage: ${percentage}% (${totalIntegrated}/${this.stats.totalHtml})`);

    // Save report
    const reportPath = path.join(__dirname, 'paypal-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      statistics: this.stats,
      issues: this.issues,
      verified: this.verified.slice(0, 100) // Limit to first 100
    }, null, 2));
    
    this.log('info', `Verification report saved to ${reportPath}`);

    const success = this.stats.missing === 0 && this.stats.withIncorrectEmail === 0;
    console.log(success ? '\n✅ Verification complete - All good!\n' : '\n⚠️  Verification complete - Issues found\n');

    return {
      success,
      statistics: this.stats
    };
  }
}

// Run verification
if (require.main === module) {
  const verifier = new PayPalVerifier();
  verifier.verify()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = PayPalVerifier;
