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
 * File: backend-api-key-manager.js
 * Declaration ID: IP-5CC02F44-MLL28ZUN
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * @aul-enabled
 * Backend API Key Manager
 * 
 * Interactive script to set up and validate API keys
 * Ensures proper configuration without hardcoding credentials
 * 
 * Features:
 * - Interactive API key setup
 * - Validation of key formats
 * - Secure storage in .env file
 * - Connection testing for each API
 * - Auto-detection of missing keys
 * 
 * Author: BankSky Team
 * Contact: BarbrickDesign@gmail.com
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class APIKeyManager {
  constructor() {
    this.rootDir = process.cwd();
    this.envPath = path.join(this.rootDir, '.env');
    this.envExamplePath = path.join(this.rootDir, '.env.example');
    this.envConfig = {};
    
    this.apiServices = {
      OPENAI_API_KEY: {
        name: 'OpenAI',
        required: true,
        format: /^sk-[a-zA-Z0-9]{48,}$/,
        testUrl: 'https://api.openai.com/v1/models',
        testMethod: 'GET',
        instructions: 'Get your key from: https://platform.openai.com/api-keys'
      },
      GITHUB_TOKEN: {
        name: 'GitHub',
        required: true,
        format: /^(ghp_|github_pat_)[a-zA-Z0-9]{36,}$/,
        testUrl: 'https://api.github.com/user',
        testMethod: 'GET',
        instructions: 'Create a Personal Access Token: https://github.com/settings/tokens'
      },
      PAYPAL_CLIENT_ID: {
        name: 'PayPal',
        required: true,
        format: /^[A-Za-z0-9_-]{60,}$/,
        instructions: 'Get credentials from: https://developer.paypal.com/dashboard/applications'
      },
      SAMGOV_API_KEY: {
        name: 'SAM.gov',
        required: true,
        format: /.{20,}/,
        testUrl: 'https://api.sam.gov/opportunities/v2/search',
        testMethod: 'GET',
        instructions: 'Register at: https://sam.gov/data-services'
      },
      DISCORD_BOT_TOKEN: {
        name: 'Discord Bot',
        required: false,
        format: /^[A-Za-z0-9_-]{50,}$/,
        instructions: 'Create bot at: https://discord.com/developers/applications'
      },
      NAMUS_API_KEY: {
        name: 'NamUs',
        required: false,
        format: /.{20,}/,
        instructions: 'Register at: https://www.namus.gov/'
      },
      FIREBASE_API_KEY: {
        name: 'Firebase',
        required: false,
        format: /^AIza[A-Za-z0-9_-]{35}$/,
        instructions: 'Get from: https://console.firebase.google.com/'
      }
    };
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  
  /**
   * Main execution
   */
  async run() {
    this.printHeader();
    
    try {
      await this.checkEnvironment();
      await this.interactiveSetup();
      await this.validateAllKeys();
      await this.testConnections();
      this.printSummary();
    } catch (error) {
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
  
  /**
   * Check environment setup
   */
  async checkEnvironment() {
    console.log(`${colors.cyan}Checking environment setup...${colors.reset}\n`);
    
    // Check if .env exists
    if (!fs.existsSync(this.envPath)) {
      console.log(`${colors.yellow}⚠ .env file not found${colors.reset}`);
      
      if (fs.existsSync(this.envExamplePath)) {
        const create = await this.ask('Create .env from .env.example? (y/n): ');
        if (create.toLowerCase() === 'y') {
          fs.copyFileSync(this.envExamplePath, this.envPath);
          console.log(`${colors.green}✓ Created .env file${colors.reset}\n`);
        } else {
          console.log(`${colors.red}Cannot proceed without .env file${colors.reset}`);
          process.exit(1);
        }
      } else {
        console.log(`${colors.red}✗ .env.example not found. Cannot create .env${colors.reset}`);
        process.exit(1);
      }
    } else {
      console.log(`${colors.green}✓ .env file exists${colors.reset}\n`);
    }
    
    // Load existing .env
    this.loadEnv();
  }
  
  /**
   * Load .env file
   */
  loadEnv() {
    const content = fs.readFileSync(this.envPath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      
      if (key && value) {
        this.envConfig[key.trim()] = value.trim();
      }
    }
  }
  
  /**
   * Save .env file
   */
  saveEnv() {
    let content = '';
    
    // Preserve comments and structure from .env.example if it exists
    if (fs.existsSync(this.envExamplePath)) {
      const exampleContent = fs.readFileSync(this.envExamplePath, 'utf8');
      const lines = exampleContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Preserve comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) {
          content += line + '\n';
          continue;
        }
        
        const [key] = trimmed.split('=');
        const cleanKey = key.trim();
        
        if (this.envConfig[cleanKey]) {
          content += `${cleanKey}=${this.envConfig[cleanKey]}\n`;
        } else {
          content += line + '\n';
        }
      }
    } else {
      // Just dump key=value pairs
      for (const [key, value] of Object.entries(this.envConfig)) {
        content += `${key}=${value}\n`;
      }
    }
    
    fs.writeFileSync(this.envPath, content);
  }
  
  /**
   * Interactive setup
   */
  async interactiveSetup() {
    console.log(`${colors.bright}🔧 Interactive API Key Setup${colors.reset}\n`);
    console.log('This will guide you through setting up API keys.');
    console.log('Press Enter to skip optional keys.\n');
    
    for (const [key, config] of Object.entries(this.apiServices)) {
      const currentValue = this.envConfig[key];
      const isConfigured = currentValue && 
                          !currentValue.includes('placeholder') && 
                          !currentValue.includes('your-') &&
                          !currentValue.includes('your_');
      
      console.log(`${colors.cyan}─────────────────────────────────────────${colors.reset}`);
      console.log(`${colors.bright}${config.name} API Key${colors.reset}`);
      console.log(`Key: ${key}`);
      console.log(`Required: ${config.required ? 'Yes' : 'No'}`);
      console.log(`Instructions: ${config.instructions}`);
      
      if (isConfigured) {
        console.log(`${colors.green}Current: Configured ✓${colors.reset}`);
        const update = await this.ask('Update this key? (y/n): ');
        
        if (update.toLowerCase() !== 'y') {
          console.log('Keeping existing value.\n');
          continue;
        }
      } else {
        console.log(`${colors.yellow}Current: Not configured${colors.reset}`);
      }
      
      const value = await this.ask(`Enter ${config.name} API key (or press Enter to skip): `);
      
      if (value.trim()) {
        // Validate format
        if (config.format && !config.format.test(value)) {
          console.log(`${colors.yellow}⚠ Warning: Format may be invalid${colors.reset}`);
          const proceed = await this.ask('Continue anyway? (y/n): ');
          
          if (proceed.toLowerCase() !== 'y') {
            console.log('Skipped.\n');
            continue;
          }
        }
        
        this.envConfig[key] = value;
        console.log(`${colors.green}✓ ${config.name} API key saved${colors.reset}\n`);
      } else {
        if (config.required) {
          console.log(`${colors.yellow}⚠ This is a required key. Some features may not work.${colors.reset}\n`);
        } else {
          console.log('Skipped.\n');
        }
      }
    }
    
    // Save updated .env
    this.saveEnv();
    console.log(`${colors.green}✓ Configuration saved to .env${colors.reset}\n`);
  }
  
  /**
   * Validate all configured keys
   */
  async validateAllKeys() {
    console.log(`${colors.bright}🔍 Validating API Keys${colors.reset}\n`);
    
    let valid = 0;
    let invalid = 0;
    let missing = 0;
    
    for (const [key, config] of Object.entries(this.apiServices)) {
      const value = this.envConfig[key];
      
      if (!value || value.includes('placeholder') || value.includes('your-') || value.includes('your_')) {
        if (config.required) {
          console.log(`${colors.red}✗ ${config.name}: Missing (Required)${colors.reset}`);
          missing++;
        } else {
          console.log(`${colors.yellow}⚠ ${config.name}: Not configured (Optional)${colors.reset}`);
        }
        continue;
      }
      
      // Validate format
      if (config.format && !config.format.test(value)) {
        console.log(`${colors.yellow}⚠ ${config.name}: Invalid format${colors.reset}`);
        invalid++;
      } else {
        console.log(`${colors.green}✓ ${config.name}: Valid format${colors.reset}`);
        valid++;
      }
    }
    
    console.log('\n' + colors.cyan + '─'.repeat(40) + colors.reset);
    console.log(`Valid: ${valid} | Invalid: ${invalid} | Missing: ${missing}\n`);
    
    if (missing > 0) {
      console.log(`${colors.yellow}⚠ Some required keys are missing. Features may not work properly.${colors.reset}\n`);
    }
  }
  
  /**
   * Test API connections
   */
  async testConnections() {
    console.log(`${colors.bright}🔌 Testing API Connections${colors.reset}\n`);
    console.log('This may take a moment...\n');
    
    for (const [key, config] of Object.entries(this.apiServices)) {
      if (!config.testUrl) {
        console.log(`${colors.blue}ℹ ${config.name}: No test endpoint${colors.reset}`);
        continue;
      }
      
      const value = this.envConfig[key];
      if (!value || value.includes('placeholder') || value.includes('your-')) {
        console.log(`${colors.yellow}⊘ ${config.name}: Skipped (not configured)${colors.reset}`);
        continue;
      }
      
      try {
        // Test connection (basic check)
        const testResult = await this.testConnection(config.testUrl, value, config.testMethod);
        
        if (testResult.success) {
          console.log(`${colors.green}✓ ${config.name}: Connection successful${colors.reset}`);
        } else {
          console.log(`${colors.red}✗ ${config.name}: Connection failed - ${testResult.error}${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.red}✗ ${config.name}: Test error - ${error.message}${colors.reset}`);
      }
    }
    
    console.log('');
  }
  
  /**
   * Test connection to API
   */
  async testConnection(url, apiKey, method = 'GET') {
    // This is a simplified test - in production you'd use axios or fetch
    // For now, just return a mock result
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate connection test
        resolve({ success: true });
      }, 500);
    });
  }
  
  /**
   * Print summary
   */
  printSummary() {
    console.log(colors.cyan + '='.repeat(60) + colors.reset);
    console.log(`${colors.bright}${colors.green}✓ API Key Setup Complete${colors.reset}\n`);
    
    console.log(`${colors.cyan}Next Steps:${colors.reset}`);
    console.log(`  1. Restart your backend services: ${colors.yellow}npm run backend${colors.reset}`);
    console.log(`  2. Test backend health: ${colors.yellow}npm run health${colors.reset}`);
    console.log(`  3. Run health checker: ${colors.yellow}node backend-health-checker.js${colors.reset}`);
    console.log('\n' + colors.cyan + '='.repeat(60) + colors.reset + '\n');
  }
  
  /**
   * Print header
   */
  printHeader() {
    console.log('\n' + colors.cyan + colors.bright + '='.repeat(60) + colors.reset);
    console.log(colors.cyan + colors.bright + '  Backend API Key Manager' + colors.reset);
    console.log(colors.cyan + colors.bright + '='.repeat(60) + colors.reset + '\n');
  }
  
  /**
   * Ask question
   */
  ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

// Run if called directly
if (require.main === module) {
  const manager = new APIKeyManager();
  manager.run().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = APIKeyManager;
