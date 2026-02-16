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
 * File: deploy-paypal-integration.js
 * Declaration ID: IP-712CAA9-MLL28ZUQ
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

#!/usr/bin/env node

/**
 * PayPal Integration Deployment Script
 * 
 * Deploys PayPal integration across all HTML pages in the repository.
 * Uses environment variables or GitHub secrets for CLIENT_ID and PAYPAL_API.
 * 
 * Usage:
 *   node deploy-paypal-integration.js
 * 
 * Environment Variables:
 *   PAYPAL_CLIENT_ID - PayPal client ID (required)
 *   PAYPAL_API - PayPal API endpoint (optional)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  CLIENT_ID: process.env.PAYPAL_CLIENT_ID || '',
  API_ENDPOINT: process.env.PAYPAL_API || '',
  DRY_RUN: process.env.DRY_RUN === 'true',
  EXCLUDE_DIRS: ['node_modules', '.git', 'dist', 'build', 'ember-terminal-main'],
  EXCLUDE_FILES: ['deploy-paypal-integration.js']
};

class PayPalDeployer {
  constructor() {
    this.stats = {
      total: 0,
      processed: 0,
      injected: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      alreadyIntegrated: 0
    };
    this.log = [];
  }

  logMessage(level, message, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...details
    };
    this.log.push(entry);
    
    const prefix = {
      'INFO': '📋',
      'SUCCESS': '✅',
      'WARNING': '⚠️',
      'ERROR': '❌'
    }[level] || '📌';
    
    console.log(`${prefix} ${message}`, details.file ? `(${details.file})` : '');
  }

  hasPayPalIntegration(content) {
    return content.includes('paypal-integration.js') ||
           content.includes('PayPalIntegration') ||
           (content.includes('paypal.com/sdk/js') && content.includes('client-id'));
  }

  generateScriptTag() {
    return `\n<!-- PayPal Integration -->
<script src="/src/utils/paypal-integration.js"></script>
<script>
  // PayPal integration is available via PayPalIntegration object
  // Example: PayPalIntegration.renderButton('paypal-button-container', {
  //   amount: 100.00,
  //   description: 'Product purchase',
  //   onSuccess: (data) => console.log('Success', data),
  //   onError: (err) => console.error('Error', err)
  // });
</script>\n`;
  }

  injectPayPalScript(htmlContent) {
    // Find injection point - prefer </body>, fallback to </html>
    let injectionPoint = htmlContent.lastIndexOf('</body>');
    
    if (injectionPoint === -1) {
      injectionPoint = htmlContent.lastIndexOf('</html>');
      if (injectionPoint === -1) {
        throw new Error('No suitable injection point found');
      }
    }
    
    return htmlContent.slice(0, injectionPoint) +
           this.generateScriptTag() +
           htmlContent.slice(injectionPoint);
  }

  isValidHTMLFile(content) {
    // Check if it's a proper HTML document
    return (content.includes('<html') || content.includes('<!DOCTYPE')) &&
           (content.includes('</html>') || content.includes('</body>'));
  }

  shouldSkipFile(filePath) {
    // Skip if in excluded directory
    for (const dir of CONFIG.EXCLUDE_DIRS) {
      if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
        return true;
      }
    }
    
    // Skip if in excluded files
    const fileName = path.basename(filePath);
    if (CONFIG.EXCLUDE_FILES.includes(fileName)) {
      return true;
    }
    
    return false;
  }

  async processFile(filePath) {
    try {
      this.stats.processed++;

      // Skip if needed
      if (this.shouldSkipFile(filePath)) {
        this.logMessage('INFO', 'Skipping excluded file', { file: filePath });
        this.stats.skipped++;
        return { success: true, action: 'skipped', reason: 'excluded' };
      }

      // Read file
      const content = fs.readFileSync(filePath, 'utf8');

      // Check if valid HTML
      if (!this.isValidHTMLFile(content)) {
        this.logMessage('INFO', 'Skipping non-HTML file', { file: filePath });
        this.stats.skipped++;
        return { success: true, action: 'skipped', reason: 'not valid HTML' };
      }

      // Check if already integrated
      if (this.hasPayPalIntegration(content)) {
        this.logMessage('INFO', 'Already has PayPal integration', { file: filePath });
        this.stats.alreadyIntegrated++;
        return { success: true, action: 'skipped', reason: 'already integrated' };
      }

      // Inject PayPal integration
      const updatedContent = this.injectPayPalScript(content);

      // Write file (unless dry run)
      if (!CONFIG.DRY_RUN) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        this.logMessage('SUCCESS', 'Injected PayPal integration', { file: filePath });
        this.stats.injected++;
      } else {
        this.logMessage('INFO', '[DRY RUN] Would inject PayPal integration', { file: filePath });
        this.stats.injected++;
      }

      return { success: true, action: 'injected' };

    } catch (error) {
      this.logMessage('ERROR', `Failed to process file: ${error.message}`, { file: filePath });
      this.stats.failed++;
      return { success: false, action: 'failed', error: error.message };
    }
  }

  async updateIntegrationScript() {
    const scriptPath = path.join(__dirname, 'src/utils/paypal-integration.js');
    
    try {
      let content = fs.readFileSync(scriptPath, 'utf8');
      
      // Replace placeholders
      if (CONFIG.CLIENT_ID) {
        content = content.replace(
          /CLIENT_ID:\s*['"]{{PAYPAL_CLIENT_ID}}['"]/,
          `CLIENT_ID: '${CONFIG.CLIENT_ID}'`
        );
      }
      
      if (CONFIG.API_ENDPOINT) {
        content = content.replace(
          /API_ENDPOINT:\s*['"]{{PAYPAL_API}}['"]/,
          `API_ENDPOINT: '${CONFIG.API_ENDPOINT}'`
        );
      }
      
      if (!CONFIG.DRY_RUN) {
        fs.writeFileSync(scriptPath, content, 'utf8');
        this.logMessage('SUCCESS', 'Updated PayPal integration script with secrets');
        this.stats.updated++;
      } else {
        this.logMessage('INFO', '[DRY RUN] Would update PayPal integration script');
        this.stats.updated++;
      }
      
      return true;
    } catch (error) {
      this.logMessage('ERROR', `Failed to update integration script: ${error.message}`);
      return false;
    }
  }

  findAllHTMLFiles(dir = __dirname) {
    let htmlFiles = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip excluded directories
        if (entry.isDirectory()) {
          if (!CONFIG.EXCLUDE_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
            htmlFiles = htmlFiles.concat(this.findAllHTMLFiles(fullPath));
          }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      }
    } catch (error) {
      this.logMessage('ERROR', `Error reading directory: ${error.message}`, { dir });
    }

    return htmlFiles;
  }

  async deploy() {
    console.log('\n🚀 PayPal Integration Deployment\n');
    console.log('Configuration:');
    console.log(`  CLIENT_ID: ${CONFIG.CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`  API_ENDPOINT: ${CONFIG.API_ENDPOINT ? '✅ Configured' : '⚠️  Optional - not configured'}`);
    console.log(`  DRY_RUN: ${CONFIG.DRY_RUN ? '✅ Yes' : '❌ No'}\n`);

    if (!CONFIG.CLIENT_ID) {
      console.log('⚠️  WARNING: PAYPAL_CLIENT_ID not configured.');
      console.log('   Set PAYPAL_CLIENT_ID environment variable or configure in GitHub secrets.\n');
    }

    // Update integration script with secrets
    this.logMessage('INFO', 'Updating PayPal integration script...');
    await this.updateIntegrationScript();

    // Find all HTML files
    this.logMessage('INFO', 'Finding HTML files...');
    const htmlFiles = this.findAllHTMLFiles();
    this.stats.total = htmlFiles.length;
    
    this.logMessage('INFO', `Found ${htmlFiles.length} HTML files`);

    // Process each file
    this.logMessage('INFO', 'Processing HTML files...');
    for (const file of htmlFiles) {
      await this.processFile(file);
    }

    // Generate report
    console.log('\n📊 Deployment Report\n');
    console.log(`  Total files found: ${this.stats.total}`);
    console.log(`  Processed: ${this.stats.processed}`);
    console.log(`  Injected: ${this.stats.injected}`);
    console.log(`  Already integrated: ${this.stats.alreadyIntegrated}`);
    console.log(`  Skipped: ${this.stats.skipped}`);
    console.log(`  Failed: ${this.stats.failed}`);
    console.log(`  Integration script updated: ${this.stats.updated > 0 ? 'Yes' : 'No'}\n`);

    // Save deployment log
    const logPath = path.join(__dirname, 'paypal-deployment-log.json');
    fs.writeFileSync(logPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      config: {
        dryRun: CONFIG.DRY_RUN,
        clientIdConfigured: !!CONFIG.CLIENT_ID,
        apiEndpointConfigured: !!CONFIG.API_ENDPOINT
      },
      statistics: this.stats,
      log: this.log
    }, null, 2));
    
    this.logMessage('INFO', `Deployment log saved to ${logPath}`);

    console.log(CONFIG.DRY_RUN ? '✅ Dry run complete\n' : '✅ Deployment complete\n');

    return {
      success: this.stats.failed === 0,
      statistics: this.stats
    };
  }
}

// Run deployment
if (require.main === module) {
  const deployer = new PayPalDeployer();
  deployer.deploy()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = PayPalDeployer;
