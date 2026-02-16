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
 * File: enhance-all-scripts-discord.js
 * Declaration ID: IP-72B30325-MLL28ZUR
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
 * Enhance All Scripts with Discord Integration
 * 
 * This script automatically enhances all existing scripts in the repository
 * to work seamlessly with Discord bot notifications and webhooks.
 * 
 * Features:
 * - Scans all .js files in the repository
 * - Adds Discord integration imports where appropriate
 * - Updates deployment scripts to send notifications
 * - Adds webhook triggers for key events
 * - Preserves existing functionality
 */

const fs = require('fs');
const path = require('path');
const { notifyDeployment, notifyAlert } = require('./discord-integration');

const REPO_ROOT = path.join(__dirname);
const INTEGRATION_CODE = `const { notifyDeployment, notifyAlert, isDiscordAvailable } = require('./discord-integration');`;

// Scripts that should be enhanced
const SCRIPTS_TO_ENHANCE = [
  'deploy-banksky.js',
  'deploy-afactory-payments.js',
  'deploy-merlin-minions.js',
  'deploy-paypal-integration.js',
  'auto-deploy-all-agents.js',
  'auto-iterate-system.js',
  'sql-analyzer-cli.js',
  'banksky-deploy.js'
];

// Skip these files
const SKIP_FILES = [
  'discord-bot.js',
  'discord-integration.js',
  'setup-discord-bot.js',
  'test-discord-integration.js',
  'enhance-all-scripts-discord.js'
];

class ScriptEnhancer {
  constructor() {
    this.enhanced = [];
    this.skipped = [];
    this.errors = [];
  }

  /**
   * Enhance all scripts in the repository
   */
  async enhanceAllScripts() {
    console.log('🔧 Enhancing All Scripts with Discord Integration');
    console.log('==================================================\n');

    try {
      await notifyDeployment('script-enhancement', 'pending', 'Starting script enhancement process');
    } catch (err) {
      console.log('⚠️  Discord bot not available, continuing without notifications\n');
    }

    for (const scriptName of SCRIPTS_TO_ENHANCE) {
      const scriptPath = path.join(REPO_ROOT, scriptName);
      
      if (!fs.existsSync(scriptPath)) {
        console.log(`⏭️  Skipping ${scriptName} (not found)`);
        this.skipped.push(scriptName);
        continue;
      }

      try {
        await this.enhanceScript(scriptPath, scriptName);
      } catch (error) {
        console.log(`❌ Error enhancing ${scriptName}: ${error.message}`);
        this.errors.push({ script: scriptName, error: error.message });
      }
    }

    this.printSummary();
  }

  /**
   * Enhance a single script
   */
  async enhanceScript(scriptPath, scriptName) {
    console.log(`🔍 Checking ${scriptName}...`);

    let content = fs.readFileSync(scriptPath, 'utf8');

    // Check if already enhanced
    if (content.includes('discord-integration')) {
      console.log(`✅ ${scriptName} already enhanced\n`);
      this.skipped.push(scriptName);
      return;
    }

    // Add import at the top (after existing requires)
    const requireRegex = /const .+ = require\([^)]+\);/g;
    const lastRequire = content.match(requireRegex);
    
    if (lastRequire) {
      const lastRequireStatement = lastRequire[lastRequire.length - 1];
      const insertPosition = content.indexOf(lastRequireStatement) + lastRequireStatement.length;
      
      content = 
        content.slice(0, insertPosition) + 
        '\n' + INTEGRATION_CODE + 
        content.slice(insertPosition);
    }

    // Add notification helpers based on script type
    if (scriptName.includes('deploy')) {
      content = this.addDeploymentNotifications(content, scriptName);
    } else if (scriptName.includes('sql')) {
      content = this.addSQLNotifications(content, scriptName);
    } else if (scriptName.includes('auto')) {
      content = this.addAutomationNotifications(content, scriptName);
    }

    // Write enhanced content
    fs.writeFileSync(scriptPath, content);
    
    console.log(`✅ Enhanced ${scriptName}\n`);
    this.enhanced.push(scriptName);
  }

  /**
   * Add deployment-specific notifications
   */
  addDeploymentNotifications(content, scriptName) {
    // Add notification at start of deployment
    content = content.replace(
      /(async\s+deploy\(\s*\)\s*{)/,
      `$1\n    // Discord notification\n    try { await notifyDeployment('${scriptName.replace('.js', '')}', 'pending', 'Deployment started'); } catch (e) {}\n`
    );

    // Add notification at success
    content = content.replace(
      /(console\.log\(['"]✅[^'"]+completed[^'"]+['"]\))/gi,
      `$1;\n    try { await notifyDeployment('${scriptName.replace('.js', '')}', 'success', 'Deployment completed successfully'); } catch (e) {}`
    );

    return content;
  }

  /**
   * Add SQL analyzer notifications
   */
  addSQLNotifications(content, scriptName) {
    // Add notification for analysis complete
    content = content.replace(
      /(console\.log\(['"].*Analysis complete.*['"]\))/gi,
      `$1;\n    try { await notifyAlert('info', 'SQL analysis completed'); } catch (e) {}`
    );

    return content;
  }

  /**
   * Add automation notifications
   */
  addAutomationNotifications(content, scriptName) {
    // Add notifications for automation events
    content = content.replace(
      /(DeploymentLogger\.log\([^,]+,\s*'SUCCESS'\))/g,
      `$1;\n        try { await notifyDeployment('automation', 'success', arguments[0]); } catch (e) {}`
    );

    return content;
  }

  /**
   * Print enhancement summary
   */
  printSummary() {
    console.log('\n==================================================');
    console.log('📊 Enhancement Summary');
    console.log('==================================================\n');

    console.log(`✅ Enhanced: ${this.enhanced.length} scripts`);
    if (this.enhanced.length > 0) {
      this.enhanced.forEach(script => console.log(`   • ${script}`));
    }

    console.log(`\n⏭️  Skipped: ${this.skipped.length} scripts`);
    if (this.skipped.length > 0) {
      this.skipped.forEach(script => console.log(`   • ${script}`));
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.errors.length} scripts`);
      this.errors.forEach(({ script, error }) => {
        console.log(`   • ${script}: ${error}`);
      });
    }

    console.log('\n==================================================');
    console.log('✅ Script enhancement complete!');
    console.log('==================================================\n');

    // Send final notification
    try {
      notifyDeployment(
        'script-enhancement',
        'success',
        `Enhanced ${this.enhanced.length} scripts with Discord integration`
      );
    } catch (err) {
      // Silent fail
    }
  }
}

// Run enhancement
const enhancer = new ScriptEnhancer();
enhancer.enhanceAllScripts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
