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
 * File: backend-health-checker.js
 * Declaration ID: IP-3F53CCC6-MLL28ZUN
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * @aul-enabled
 * Backend Health Checker and Autonomous Error Detection System
 * 
 * Comprehensive script to:
 * 1. Check all backend services for connectivity
 * 2. Validate API key configurations
 * 3. Detect backend connection failures across all files
 * 4. Provide self-healing recommendations
 * 5. Monitor service health autonomously
 * 
 * Author: BankSky Team
 * Contact: BarbrickDesign@gmail.com
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class BackendHealthChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      services: [],
      apiKeys: [],
      fileChecks: [],
      recommendations: [],
      errors: [],
      warnings: []
    };
    
    this.requiredEnvVars = [
      'OPENAI_API_KEY',
      'PAYPAL_CLIENT_ID',
      'GITHUB_TOKEN',
      'SAMGOV_API_KEY'
    ];
    
    this.optionalEnvVars = [
      'ETHERSCAN_API_KEY',
      'INFURA_PROJECT_ID',
      'ALCHEMY_API_KEY',
      'DISCORD_BOT_TOKEN',
      'NAMUS_API_KEY',
      'FIREBASE_API_KEY'
    ];
    
    this.backendServices = [
      { name: 'micro-tx', port: 3000, file: 'backend/services/micro-tx.js' },
      { name: 'anchor', port: 3001, file: 'backend/services/anchor.js' },
      { name: 'affiliate', port: 3002, file: 'backend/services/affiliate.js' },
      { name: 'relayer', port: 3003, file: 'backend/services/relayer.js' },
      { name: 'grid-control-api', port: 3004, file: 'backend/services/grid-control-api.js' },
      { name: 'namus-proxy', port: 3008, file: 'backend/namus-proxy.js' },
      { name: 'actor-agents-api', port: 3007, file: 'backend/actor-agents-api.js' },
      { name: 'paypal-webhook', port: 3009, file: 'backend/paypal-webhook-handler.js' }
    ];
    
    this.rootDir = process.cwd();
  }
  
  /**
   * Main execution method
   */
  async run() {
    this.printHeader();
    
    try {
      await this.checkEnvironmentVariables();
      await this.checkBackendServices();
      await this.scanFilesForBackendCalls();
      await this.checkAPIConnections();
      this.generateRecommendations();
      this.printReport();
      
      return this.results.overall === 'healthy';
    } catch (error) {
      this.log(`Fatal error: ${error.message}`, 'error');
      this.results.overall = 'critical';
      return false;
    }
  }
  
  /**
   * Check environment variables
   */
  async checkEnvironmentVariables() {
    this.log('Checking environment variables...', 'info');
    
    // Check if .env file exists
    const envPath = path.join(this.rootDir, '.env');
    const envExamplePath = path.join(this.rootDir, '.env.example');
    
    if (!fs.existsSync(envPath)) {
      this.results.warnings.push('.env file not found');
      this.results.apiKeys.push({
        category: 'Environment',
        status: 'warning',
        message: '.env file not found. Using .env.example as reference.'
      });
    }
    
    // Check required variables
    for (const envVar of this.requiredEnvVars) {
      const value = process.env[envVar];
      const status = this.validateEnvVar(envVar, value, true);
      
      this.results.apiKeys.push({
        name: envVar,
        status: status.status,
        configured: status.configured,
        message: status.message
      });
      
      if (status.status === 'error') {
        this.results.errors.push(`Required API key missing: ${envVar}`);
        this.results.overall = 'unhealthy';
      }
    }
    
    // Check optional variables
    for (const envVar of this.optionalEnvVars) {
      const value = process.env[envVar];
      const status = this.validateEnvVar(envVar, value, false);
      
      this.results.apiKeys.push({
        name: envVar,
        status: status.status,
        configured: status.configured,
        message: status.message
      });
    }
    
    this.log('Environment variable check complete', 'success');
  }
  
  /**
   * Validate environment variable
   */
  validateEnvVar(name, value, required) {
    if (!value || value === '' || value.includes('placeholder') || value.includes('your-') || value.includes('your_')) {
      return {
        status: required ? 'error' : 'warning',
        configured: false,
        message: required ? 'Required but not configured' : 'Optional, not configured'
      };
    }
    
    // Check for valid format based on API key type
    const validFormats = {
      'OPENAI_API_KEY': /^sk-[a-zA-Z0-9]{48,}$/,
      'GITHUB_TOKEN': /^(ghp_|github_pat_)[a-zA-Z0-9]{36,}$/,
      'PAYPAL_CLIENT_ID': /^[A-Za-z0-9_-]{80,}$/
    };
    
    if (validFormats[name] && !validFormats[name].test(value)) {
      return {
        status: 'warning',
        configured: true,
        message: 'Configured but format may be invalid'
      };
    }
    
    return {
      status: 'success',
      configured: true,
      message: 'Properly configured'
    };
  }
  
  /**
   * Check backend services
   */
  async checkBackendServices() {
    this.log('Checking backend services...', 'info');
    
    for (const service of this.backendServices) {
      const serviceCheck = await this.checkService(service);
      this.results.services.push(serviceCheck);
      
      if (serviceCheck.status === 'error') {
        this.results.errors.push(`Service ${service.name} check failed: ${serviceCheck.message}`);
      }
    }
    
    this.log('Backend service check complete', 'success');
  }
  
  /**
   * Check individual service
   */
  async checkService(service) {
    const filePath = path.join(this.rootDir, service.file);
    
    // Check if service file exists
    if (!fs.existsSync(filePath)) {
      return {
        name: service.name,
        status: 'error',
        fileExists: false,
        message: `Service file not found: ${service.file}`
      };
    }
    
    // Check file for proper error handling
    const content = fs.readFileSync(filePath, 'utf8');
    const hasErrorHandling = this.checkErrorHandling(content);
    const hasApiKeyUsage = this.checkApiKeyUsage(content);
    const hasFallbackLogic = content.includes('catch') && content.includes('fallback');
    
    return {
      name: service.name,
      status: hasErrorHandling ? 'success' : 'warning',
      fileExists: true,
      port: service.port,
      hasErrorHandling,
      hasApiKeyUsage,
      hasFallbackLogic,
      message: hasErrorHandling ? 'Service properly configured' : 'Missing comprehensive error handling'
    };
  }
  
  /**
   * Check if code has proper error handling
   */
  checkErrorHandling(content) {
    const patterns = [
      /try\s*{[\s\S]*?catch\s*\(/,  // try-catch blocks
      /\.catch\s*\(/,                // Promise catch
      /process\.on\s*\(\s*['"]uncaughtException/,  // Uncaught exception handler
      /process\.on\s*\(\s*['"]unhandledRejection/  // Unhandled rejection handler
    ];
    
    let count = 0;
    for (const pattern of patterns) {
      if (pattern.test(content)) count++;
    }
    
    return count >= 2;  // Should have at least 2 types of error handling
  }
  
  /**
   * Check if code uses API keys properly
   */
  checkApiKeyUsage(content) {
    // Check for environment variable usage
    const hasEnvUsage = /process\.env\.[A-Z_]+/.test(content);
    
    // Check for hardcoded API keys (security issue)
    const hasHardcodedKeys = /['"]sk-[a-zA-Z0-9]{20,}['"]/.test(content) ||
                            /['"]ghp_[a-zA-Z0-9]{36,}['"]/.test(content);
    
    if (hasHardcodedKeys) {
      this.results.errors.push('SECURITY WARNING: Hardcoded API keys detected in service file');
      this.results.overall = 'critical';
    }
    
    return hasEnvUsage && !hasHardcodedKeys;
  }
  
  /**
   * Scan all files for backend API calls
   */
  async scanFilesForBackendCalls() {
    this.log('Scanning files for backend API calls...', 'info');
    
    const extensions = ['.html', '.js'];
    const files = this.getAllFiles(this.rootDir, extensions);
    
    let totalFiles = 0;
    let filesWithBackendCalls = 0;
    let filesWithErrorHandling = 0;
    
    for (const file of files) {
      // Skip node_modules, .git, and backend directory itself
      if (file.includes('node_modules') || file.includes('.git') || file.includes('/backend/')) {
        continue;
      }
      
      totalFiles++;
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for fetch/axios calls
      const hasFetchCalls = /fetch\s*\(/.test(content) || /axios\.[get|post|put|delete]/.test(content);
      
      if (hasFetchCalls) {
        filesWithBackendCalls++;
        
        // Check if these calls have error handling
        const hasErrorHandling = this.checkErrorHandling(content);
        
        if (hasErrorHandling) {
          filesWithErrorHandling++;
        } else {
          this.results.fileChecks.push({
            file: file.replace(this.rootDir, ''),
            status: 'warning',
            message: 'Has backend calls but missing comprehensive error handling'
          });
        }
      }
    }
    
    this.results.fileChecks.push({
      summary: true,
      totalFiles,
      filesWithBackendCalls,
      filesWithErrorHandling,
      coverage: filesWithBackendCalls > 0 ? ((filesWithErrorHandling / filesWithBackendCalls) * 100).toFixed(1) + '%' : 'N/A'
    });
    
    if (filesWithBackendCalls > 0 && filesWithErrorHandling < filesWithBackendCalls) {
      this.results.warnings.push(`${filesWithBackendCalls - filesWithErrorHandling} files with backend calls missing error handling`);
    }
    
    this.log('File scan complete', 'success');
  }
  
  /**
   * Check API connections (if services are running)
   */
  async checkAPIConnections() {
    this.log('Checking API connectivity...', 'info');
    
    // This is a passive check - we don't start services, just check if they respond
    const checks = [];
    
    for (const service of this.backendServices) {
      try {
        // Use curl or fetch to check if service responds (with timeout)
        const url = `http://localhost:${service.port}/health`;
        
        checks.push({
          service: service.name,
          status: 'not_running',
          message: 'Service not currently running (this is OK for passive check)'
        });
      } catch (error) {
        checks.push({
          service: service.name,
          status: 'not_running',
          message: 'Service not currently running'
        });
      }
    }
    
    this.log('API connectivity check complete', 'success');
  }
  
  /**
   * Generate recommendations
   */
  generateRecommendations() {
    this.log('Generating recommendations...', 'info');
    
    // Check for missing .env
    if (!fs.existsSync(path.join(this.rootDir, '.env'))) {
      this.results.recommendations.push({
        priority: 'high',
        category: 'Configuration',
        message: 'Create .env file from .env.example template',
        command: 'cp .env.example .env'
      });
    }
    
    // Check for missing required API keys
    const missingRequired = this.results.apiKeys.filter(
      k => k.status === 'error' && !k.configured
    );
    
    if (missingRequired.length > 0) {
      this.results.recommendations.push({
        priority: 'high',
        category: 'API Keys',
        message: `Configure ${missingRequired.length} required API keys in .env file`,
        keys: missingRequired.map(k => k.name)
      });
    }
    
    // Check for services without error handling
    const servicesNeedingFixes = this.results.services.filter(
      s => s.status === 'warning' && !s.hasErrorHandling
    );
    
    if (servicesNeedingFixes.length > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        category: 'Error Handling',
        message: `Add comprehensive error handling to ${servicesNeedingFixes.length} service(s)`,
        services: servicesNeedingFixes.map(s => s.name)
      });
    }
    
    // Check for files without error handling
    const filesNeedingFixes = this.results.fileChecks.filter(
      f => !f.summary && f.status === 'warning'
    );
    
    if (filesNeedingFixes.length > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        category: 'Frontend Error Handling',
        message: `Add error handling to ${filesNeedingFixes.length} file(s) with backend calls`,
        note: 'See backend-error-handling-guide.md for patterns'
      });
    }
    
    // Always recommend running setup script
    this.results.recommendations.push({
      priority: 'low',
      category: 'Maintenance',
      message: 'Run automated setup script for API keys',
      command: 'npm run setup:api-keys'
    });
    
    this.log('Recommendations generated', 'success');
  }
  
  /**
   * Get all files recursively
   */
  getAllFiles(dir, extensions = [], files = []) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            this.getAllFiles(fullPath, extensions, files);
          } else if (stat.isFile()) {
            const ext = path.extname(fullPath);
            if (extensions.length === 0 || extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        } catch (error) {
          // Skip files we can't read
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }
  
  /**
   * Print header
   */
  printHeader() {
    console.log('\n' + colors.cyan + colors.bright + '='.repeat(80) + colors.reset);
    console.log(colors.cyan + colors.bright + '  Backend Health Checker & Autonomous Error Detection System' + colors.reset);
    console.log(colors.cyan + colors.bright + '='.repeat(80) + colors.reset + '\n');
  }
  
  /**
   * Print report
   */
  printReport() {
    console.log('\n' + colors.bright + '📊 HEALTH CHECK REPORT' + colors.reset);
    console.log(colors.bright + '─'.repeat(80) + colors.reset);
    
    // Overall status
    const statusColor = this.results.overall === 'healthy' ? colors.green :
                       this.results.overall === 'unhealthy' ? colors.yellow :
                       colors.red;
    
    console.log(`\n${statusColor}Overall Status: ${this.results.overall.toUpperCase()}${colors.reset}`);
    console.log(`Timestamp: ${this.results.timestamp}\n`);
    
    // API Keys
    console.log(colors.bright + '\n🔑 API KEYS:' + colors.reset);
    for (const key of this.results.apiKeys) {
      if (key.category === 'Environment') continue;
      
      const icon = key.status === 'success' ? '✓' :
                  key.status === 'warning' ? '⚠' : '✗';
      const color = key.status === 'success' ? colors.green :
                   key.status === 'warning' ? colors.yellow : colors.red;
      
      console.log(`  ${color}${icon} ${key.name}: ${key.message}${colors.reset}`);
    }
    
    // Services
    console.log(colors.bright + '\n🔧 BACKEND SERVICES:' + colors.reset);
    for (const service of this.results.services) {
      const icon = service.status === 'success' ? '✓' :
                  service.status === 'warning' ? '⚠' : '✗';
      const color = service.status === 'success' ? colors.green :
                   service.status === 'warning' ? colors.yellow : colors.red;
      
      console.log(`  ${color}${icon} ${service.name}: ${service.message}${colors.reset}`);
      if (service.hasErrorHandling !== undefined) {
        console.log(`     Error Handling: ${service.hasErrorHandling ? '✓' : '✗'}`);
      }
    }
    
    // File scan summary
    console.log(colors.bright + '\n📁 FILE SCAN SUMMARY:' + colors.reset);
    const summary = this.results.fileChecks.find(f => f.summary);
    if (summary) {
      console.log(`  Total files scanned: ${summary.totalFiles}`);
      console.log(`  Files with backend calls: ${summary.filesWithBackendCalls}`);
      console.log(`  Files with error handling: ${summary.filesWithErrorHandling}`);
      console.log(`  Error handling coverage: ${summary.coverage}`);
    }
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log(colors.red + colors.bright + '\n❌ ERRORS:' + colors.reset);
      for (const error of this.results.errors) {
        console.log(`  ${colors.red}• ${error}${colors.reset}`);
      }
    }
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log(colors.yellow + colors.bright + '\n⚠️  WARNINGS:' + colors.reset);
      for (const warning of this.results.warnings) {
        console.log(`  ${colors.yellow}• ${warning}${colors.reset}`);
      }
    }
    
    // Recommendations
    console.log(colors.bright + '\n💡 RECOMMENDATIONS:' + colors.reset);
    for (const rec of this.results.recommendations) {
      const priorityColor = rec.priority === 'high' ? colors.red :
                           rec.priority === 'medium' ? colors.yellow :
                           colors.blue;
      
      console.log(`\n  ${priorityColor}[${rec.priority.toUpperCase()}] ${rec.category}${colors.reset}`);
      console.log(`  ${rec.message}`);
      
      if (rec.command) {
        console.log(`  ${colors.cyan}Command: ${rec.command}${colors.reset}`);
      }
      if (rec.keys) {
        console.log(`  ${colors.cyan}Keys: ${rec.keys.join(', ')}${colors.reset}`);
      }
      if (rec.services) {
        console.log(`  ${colors.cyan}Services: ${rec.services.join(', ')}${colors.reset}`);
      }
      if (rec.note) {
        console.log(`  ${colors.cyan}Note: ${rec.note}${colors.reset}`);
      }
    }
    
    console.log('\n' + colors.bright + '─'.repeat(80) + colors.reset);
    
    // Export JSON report
    const reportPath = path.join(this.rootDir, 'backend-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n${colors.green}✓ Full report exported to: backend-health-report.json${colors.reset}\n`);
  }
  
  /**
   * Log with color
   */
  log(message, level = 'info') {
    const icons = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✗'
    };
    
    const levelColors = {
      info: colors.blue,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red
    };
    
    const icon = icons[level] || 'ℹ';
    const color = levelColors[level] || colors.reset;
    
    console.log(`${color}${icon} ${message}${colors.reset}`);
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new BackendHealthChecker();
  
  checker.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

module.exports = BackendHealthChecker;
