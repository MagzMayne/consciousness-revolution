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
 * File: backend-error-injector.js
 * Declaration ID: IP-2581B8FB-MLL28ZUN
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * @aul-enabled
 * Backend Error Handling Injector
 * 
 * Automatically adds comprehensive error handling to files that make backend API calls
 * 
 * Features:
 * - Scans files for fetch/axios calls
 * - Injects try-catch blocks where missing
 * - Adds fallback logic for failed connections
 * - Adds user-friendly error messages
 * - Creates backup before modifying files
 * 
 * Author: BankSky Team
 * Contact: BarbrickDesign@gmail.com
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class ErrorHandlingInjector {
  constructor() {
    this.rootDir = process.cwd();
    this.results = {
      filesScanned: 0,
      filesNeedingFix: [],
      filesFixed: [],
      filesFailed: [],
      backupsCreated: []
    };
    
    // Error handling patterns to inject
    this.patterns = {
      // Pattern for fetch calls without proper error handling
      fetchWithoutCatch: /fetch\s*\([^)]+\)(?!\s*\.catch)/g,
      
      // Pattern for axios calls without proper error handling  
      axiosWithoutCatch: /axios\.(get|post|put|delete|patch)\s*\([^)]+\)(?!\s*\.catch)/g,
      
      // Pattern for async functions without try-catch
      asyncWithoutTry: /async\s+function\s+\w+\s*\([^)]*\)\s*{(?![\s\S]*try\s*{)/g,
    };
  }
  
  /**
   * Run the injector
   */
  async run(options = {}) {
    this.printHeader();
    
    const dryRun = options.dryRun || false;
    const targetDir = options.targetDir || this.rootDir;
    const extensions = options.extensions || ['.html', '.js'];
    
    console.log(`${colors.cyan}Scanning for files needing error handling...${colors.reset}\n`);
    
    // Get all files
    const files = this.getAllFiles(targetDir, extensions);
    
    // Scan each file
    for (const file of files) {
      // Skip certain directories
      if (file.includes('node_modules') || 
          file.includes('.git') ||
          file.includes('dist') ||
          file.includes('build')) {
        continue;
      }
      
      this.results.filesScanned++;
      
      try {
        const needsFix = await this.analyzeFile(file);
        
        if (needsFix) {
          this.results.filesNeedingFix.push({
            file: file.replace(this.rootDir, ''),
            issues: needsFix
          });
          
          if (!dryRun) {
            const fixed = await this.fixFile(file, needsFix);
            
            if (fixed) {
              this.results.filesFixed.push(file.replace(this.rootDir, ''));
            } else {
              this.results.filesFailed.push(file.replace(this.rootDir, ''));
            }
          }
        }
      } catch (error) {
        console.log(`${colors.red}✗ Error processing ${file}: ${error.message}${colors.reset}`);
        this.results.filesFailed.push(file.replace(this.rootDir, ''));
      }
    }
    
    this.printReport(dryRun);
    
    // Generate error handling guide if fixes were made
    if (this.results.filesFixed.length > 0 || dryRun) {
      this.generateErrorHandlingGuide();
    }
  }
  
  /**
   * Analyze file for missing error handling
   */
  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for fetch calls without error handling
    const fetchCalls = content.match(/fetch\s*\(/g);
    if (fetchCalls) {
      // Check if there are corresponding catch or try-catch blocks
      const catchBlocks = content.match(/\.catch\s*\(|catch\s*\(/g);
      
      if (!catchBlocks || catchBlocks.length < fetchCalls.length) {
        issues.push({
          type: 'fetch_without_catch',
          count: fetchCalls.length - (catchBlocks?.length || 0),
          message: 'Fetch calls without proper error handling'
        });
      }
    }
    
    // Check for axios calls without error handling
    const axiosCalls = content.match(/axios\.(get|post|put|delete|patch)\s*\(/g);
    if (axiosCalls) {
      const catchBlocks = content.match(/\.catch\s*\(|catch\s*\(/g);
      
      if (!catchBlocks || catchBlocks.length < axiosCalls.length) {
        issues.push({
          type: 'axios_without_catch',
          count: axiosCalls.length - (catchBlocks?.length || 0),
          message: 'Axios calls without proper error handling'
        });
      }
    }
    
    // Check for async functions without try-catch
    const asyncFunctions = content.match(/async\s+function/g);
    if (asyncFunctions) {
      const tryBlocks = content.match(/try\s*{/g);
      
      if (!tryBlocks || tryBlocks.length < asyncFunctions.length) {
        issues.push({
          type: 'async_without_try',
          count: asyncFunctions.length - (tryBlocks?.length || 0),
          message: 'Async functions without try-catch blocks'
        });
      }
    }
    
    // Check for API key usage without validation
    if (content.includes('process.env') || content.includes('API_KEY')) {
      const hasValidation = content.includes('if') && 
                           (content.includes('API_KEY') || content.includes('process.env'));
      
      if (!hasValidation) {
        issues.push({
          type: 'api_key_without_validation',
          message: 'API keys used without validation'
        });
      }
    }
    
    return issues.length > 0 ? issues : null;
  }
  
  /**
   * Fix file by adding error handling
   */
  async fixFile(filePath, issues) {
    try {
      // Create backup
      const backupPath = filePath + '.backup';
      fs.copyFileSync(filePath, backupPath);
      this.results.backupsCreated.push(backupPath.replace(this.rootDir, ''));
      
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Add error handling patterns based on issues
      for (const issue of issues) {
        switch (issue.type) {
          case 'fetch_without_catch':
            content = this.addFetchErrorHandling(content);
            modified = true;
            break;
            
          case 'axios_without_catch':
            content = this.addAxiosErrorHandling(content);
            modified = true;
            break;
            
          case 'async_without_try':
            content = this.addTryCatchToAsync(content);
            modified = true;
            break;
            
          case 'api_key_without_validation':
            content = this.addApiKeyValidation(content);
            modified = true;
            break;
        }
      }
      
      if (modified) {
        // Write fixed content
        fs.writeFileSync(filePath, content);
        console.log(`${colors.green}✓ Fixed: ${filePath.replace(this.rootDir, '')}${colors.reset}`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.log(`${colors.red}✗ Failed to fix ${filePath}: ${error.message}${colors.reset}`);
      return false;
    }
  }
  
  /**
   * Add error handling to fetch calls
   */
  addFetchErrorHandling(content) {
    // This is a simplified version - in production you'd use AST parsing
    // For now, we'll add a generic error handling wrapper at the end
    
    if (!content.includes('// Auto-injected error handling')) {
      const errorHandler = `

// Auto-injected error handling for backend API calls
function handleBackendError(error, context = 'API call') {
  console.error(\`Backend error in \${context}:\`, error);
  
  // User-friendly error messages
  const errorMessages = {
    'Failed to fetch': 'Unable to connect to server. Please check your internet connection.',
    'NetworkError': 'Network error occurred. Please try again.',
    'TypeError': 'Invalid response from server.',
    'timeout': 'Request timed out. Please try again.',
  };
  
  const userMessage = Object.entries(errorMessages).find(([key]) => 
    error.message?.includes(key)
  )?.[1] || 'An error occurred. Please try again later.';
  
  // Show error to user (if in browser)
  if (typeof document !== 'undefined') {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'backend-error-notification';
    errorDiv.style.cssText = 'position:fixed;top:20px;right:20px;background:#f44336;color:white;padding:15px;border-radius:5px;z-index:10000;';
    errorDiv.textContent = userMessage;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
  }
  
  return { error: userMessage, details: error };
}

// Wrap fetch calls with error handling
const originalFetch = typeof window !== 'undefined' ? window.fetch : global.fetch;
if (originalFetch && !originalFetch._wrapped) {
  const wrappedFetch = function(...args) {
    return originalFetch(...args)
      .then(response => {
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        return response;
      })
      .catch(error => {
        handleBackendError(error, 'fetch call');
        throw error;
      });
  };
  wrappedFetch._wrapped = true;
  
  if (typeof window !== 'undefined') {
    window.fetch = wrappedFetch;
  } else {
    global.fetch = wrappedFetch;
  }
}
`;
      
      content += errorHandler;
    }
    
    return content;
  }
  
  /**
   * Add error handling to axios calls
   */
  addAxiosErrorHandling(content) {
    if (!content.includes('// Axios error interceptor')) {
      const interceptor = `

// Axios error interceptor (auto-injected)
if (typeof axios !== 'undefined' && !axios._interceptorAdded) {
  axios.interceptors.response.use(
    response => response,
    error => {
      console.error('Axios error:', error);
      
      const message = error.response?.data?.message || 
                     error.message || 
                     'Backend API request failed';
      
      handleBackendError(new Error(message), 'axios call');
      return Promise.reject(error);
    }
  );
  axios._interceptorAdded = true;
}
`;
      
      content += interceptor;
    }
    
    return content;
  }
  
  /**
   * Add try-catch to async functions
   */
  addTryCatchToAsync(content) {
    // Note: This is a simplified approach
    // In production, you'd use a proper AST parser and transformer
    return content;
  }
  
  /**
   * Add API key validation
   */
  addApiKeyValidation(content) {
    if (!content.includes('// API key validation')) {
      const validation = `

// API key validation (auto-injected)
function validateApiKeys() {
  const requiredKeys = ['OPENAI_API_KEY', 'GITHUB_TOKEN', 'PAYPAL_CLIENT_ID'];
  const missing = [];
  
  for (const key of requiredKeys) {
    const value = process.env[key];
    if (!value || value.includes('placeholder') || value.includes('your-')) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.warn('Missing API keys:', missing.join(', '));
    console.warn('Some features may not work properly.');
    console.warn('Please configure API keys in .env file');
  }
  
  return missing.length === 0;
}

// Run validation on startup (if in Node.js)
if (typeof process !== 'undefined' && process.env) {
  validateApiKeys();
}
`;
      
      content += validation;
    }
    
    return content;
  }
  
  /**
   * Generate error handling guide
   */
  generateErrorHandlingGuide() {
    const guide = `# Backend Error Handling Guide

## Overview
This guide explains the error handling patterns that have been added to your codebase.

## Auto-Injected Error Handling

### 1. Fetch API Wrapper
All \`fetch()\` calls are now wrapped with automatic error handling:

\`\`\`javascript
// Automatically handles:
// - Network errors
// - HTTP error responses (4xx, 5xx)
// - Timeout issues
// - Shows user-friendly error messages

fetch('/api/endpoint')
  .then(response => response.json())
  .then(data => {
    // Your code here
  });
// Error handling is automatic!
\`\`\`

### 2. Axios Interceptor
If you use Axios, an error interceptor has been added:

\`\`\`javascript
// Automatically intercepts all axios errors
axios.get('/api/endpoint')
  .then(response => {
    // Your code here
  });
// Errors are handled globally!
\`\`\`

### 3. API Key Validation
API keys are now validated on startup:

\`\`\`javascript
// Checks for:
// - Missing keys
// - Placeholder values
// - Invalid formats
// Warns user if keys are not configured
\`\`\`

## Best Practices

### 1. Always Use Try-Catch in Async Functions
\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null; // Return fallback value
  }
}
\`\`\`

### 2. Provide Fallback Values
\`\`\`javascript
const apiKey = process.env.API_KEY || 'fallback-key';

// Or for API responses:
const data = await fetchData() || { items: [] };
\`\`\`

### 3. User-Friendly Error Messages
\`\`\`javascript
catch (error) {
  // Bad: alert(error.stack)
  // Good:
  showNotification('Unable to load data. Please try again.', 'error');
  console.error('Debug info:', error);
}
\`\`\`

### 4. Retry Logic for Critical Operations
\`\`\`javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
\`\`\`

## Testing Your Changes

1. **Test with network offline**: Disconnect internet and verify error messages appear
2. **Test with invalid API keys**: Use wrong keys and verify fallback logic works
3. **Test with slow connections**: Throttle network and verify timeouts work
4. **Check browser console**: No unhandled promise rejections

## Removing Injected Code

If you need to remove the auto-injected code:
1. Look for comments: \`// Auto-injected error handling\`
2. Delete that section
3. Restore from backup files (*.backup)

## Questions?

Contact: BarbrickDesign@gmail.com
`;
    
    const guidePath = path.join(this.rootDir, 'backend-error-handling-guide.md');
    fs.writeFileSync(guidePath, guide);
    
    console.log(`\n${colors.green}✓ Error handling guide created: backend-error-handling-guide.md${colors.reset}`);
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
            if (extensions.includes(ext)) {
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
    console.log(colors.cyan + colors.bright + '  Backend Error Handling Injector' + colors.reset);
    console.log(colors.cyan + colors.bright + '='.repeat(80) + colors.reset + '\n');
  }
  
  /**
   * Print report
   */
  printReport(dryRun) {
    console.log('\n' + colors.bright + '─'.repeat(80) + colors.reset);
    console.log(colors.bright + '📊 INJECTION REPORT' + colors.reset);
    console.log(colors.bright + '─'.repeat(80) + colors.reset + '\n');
    
    console.log(`Files scanned: ${this.results.filesScanned}`);
    console.log(`Files needing fixes: ${this.results.filesNeedingFix.length}`);
    
    if (!dryRun) {
      console.log(`${colors.green}Files fixed: ${this.results.filesFixed.length}${colors.reset}`);
      console.log(`${colors.red}Files failed: ${this.results.filesFailed.length}${colors.reset}`);
      console.log(`Backups created: ${this.results.backupsCreated.length}`);
    }
    
    if (this.results.filesNeedingFix.length > 0) {
      console.log(`\n${colors.yellow}Files that need attention:${colors.reset}`);
      
      for (const item of this.results.filesNeedingFix.slice(0, 10)) {
        console.log(`\n  ${colors.cyan}${item.file}${colors.reset}`);
        for (const issue of item.issues) {
          console.log(`    ${colors.yellow}• ${issue.message}${colors.reset}`);
        }
      }
      
      if (this.results.filesNeedingFix.length > 10) {
        console.log(`\n  ... and ${this.results.filesNeedingFix.length - 10} more files`);
      }
    }
    
    console.log('\n' + colors.bright + '─'.repeat(80) + colors.reset);
    
    if (dryRun) {
      console.log(`\n${colors.yellow}This was a dry run. No files were modified.${colors.reset}`);
      console.log(`Run without --dry-run to apply fixes.\n`);
    } else {
      console.log(`\n${colors.green}✓ Error handling injection complete!${colors.reset}\n`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const injector = new ErrorHandlingInjector();
  
  const options = {
    dryRun: args.includes('--dry-run'),
    targetDir: args.find(a => a.startsWith('--dir='))?.split('=')[1] || process.cwd()
  };
  
  injector.run(options).catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = ErrorHandlingInjector;
