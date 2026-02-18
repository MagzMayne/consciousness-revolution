#!/usr/bin/env node

/**
 * Pre-Commit Secret Detection Hook
 * 
 * This script scans staged files for exposed secrets before committing:
 * - OpenAI API keys (sk-*)
 * - GitHub tokens (ghp_*, gho_*, ghu_*)
 * - Anthropic API keys (sk-ant-*)
 * - Groq API keys (gsk_*)
 * - Generic passwords
 * - Database URLs with credentials
 * - AWS keys
 * - Private keys
 * 
 * Usage: Automatically runs on git commit
 *        Or run manually: node scripts/pre-commit-hook.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Secret patterns to detect
const SECRET_PATTERNS = [
    {
        name: 'OpenAI API Key',
        pattern: /sk-[a-zA-Z0-9_-]{20,}/g,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example']
    },
    {
        name: 'GitHub Personal Access Token',
        pattern: /ghp_[a-zA-Z0-9]{36}/g,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example']
    },
    {
        name: 'GitHub OAuth Token',
        pattern: /gho_[a-zA-Z0-9]{36}/g,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example']
    },
    {
        name: 'GitHub User-to-Server Token',
        pattern: /ghu_[a-zA-Z0-9]{36}/g,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example']
    },
    {
        name: 'Anthropic API Key',
        pattern: /sk-ant-[a-zA-Z0-9\-_]{20,}/g,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example']
    },
    {
        name: 'Groq API Key',
        pattern: /gsk_[a-zA-Z0-9_-]{20,}/g,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example']
    },
    {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/g,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock']
    },
    {
        name: 'AWS Secret Key',
        pattern: /aws_secret_access_key\s*=\s*['\"]?[a-zA-Z0-9\/+=]{40}['\"]?/gi,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock']
    },
    {
        name: 'Generic API Key',
        pattern: /api[_-]?key\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{20,}['\"]?/gi,
        severity: 'MEDIUM',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example', 'placeholder']
    },
    {
        name: 'Database URL with Password',
        pattern: /(postgresql|mysql|mongodb):\/\/[^:]+:[^@]+@[^\/]+/gi,
        severity: 'HIGH',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example', 'localhost', 'testuser', 'testpass']
    },
    {
        name: 'Private Key',
        pattern: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
        severity: 'CRITICAL',
        exclude: ['test', 'example', 'mock']
    },
    {
        name: 'JWT Token',
        pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
        severity: 'MEDIUM',
        exclude: ['test', 'example', 'mock', '.env.test', '.env.example']
    }
];

function getStagedFiles() {
    try {
        const output = execSync('git diff --cached --name-only --diff-filter=ACM', { 
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore']
        });
        return output.trim().split('\n').filter(f => f.length > 0);
    } catch (error) {
        // Not in a git repo or no staged files
        return [];
    }
}

function shouldExcludeFile(filename) {
    const excludedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', 
                               '.pdf', '.zip', '.tar', '.gz', '.mp4', '.mp3'];
    const excludedDirs = ['node_modules', '.git', 'dist', 'build', 'coverage'];
    
    // Check file extension
    if (excludedExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
        return true;
    }
    
    // Check directory
    if (excludedDirs.some(dir => filename.includes(`${dir}/`))) {
        return true;
    }
    
    return false;
}

function isExcludedMatch(match, excludePatterns, filename) {
    const lowerMatch = match.toLowerCase();
    const lowerFilename = filename.toLowerCase();
    
    // Check if match or filename contains any exclude patterns
    for (const pattern of excludePatterns) {
        if (lowerMatch.includes(pattern.toLowerCase()) || 
            lowerFilename.includes(pattern.toLowerCase())) {
            return true;
        }
    }
    
    // Check for common test/mock indicators
    if (lowerMatch.includes('xxxx') || 
        lowerMatch.includes('test123') ||
        lowerMatch.includes('placeholder') ||
        lowerMatch.includes('your-') ||
        lowerMatch.includes('example')) {
        return true;
    }
    
    return false;
}

function scanFile(filename) {
    if (shouldExcludeFile(filename)) {
        return [];
    }
    
    try {
        const content = fs.readFileSync(filename, 'utf8');
        const findings = [];
        
        for (const { name, pattern, severity, exclude } of SECRET_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) {
                // Filter out excluded matches
                const validMatches = matches.filter(match => 
                    !isExcludedMatch(match, exclude, filename)
                );
                
                if (validMatches.length > 0) {
                    findings.push({
                        type: name,
                        severity,
                        count: validMatches.length,
                        samples: validMatches.slice(0, 3) // First 3 matches
                    });
                }
            }
        }
        
        return findings;
    } catch (error) {
        // File doesn't exist or can't be read
        return [];
    }
}

function main() {
    log('\n🔒 Pre-Commit Secret Scan', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    
    const stagedFiles = getStagedFiles();
    
    if (stagedFiles.length === 0) {
        log('✅ No staged files to scan\n', 'green');
        process.exit(0);
    }
    
    log(`\n📂 Scanning ${stagedFiles.length} staged file(s)...\n`, 'cyan');
    
    let hasSecrets = false;
    const results = [];
    
    for (const file of stagedFiles) {
        const findings = scanFile(file);
        if (findings.length > 0) {
            hasSecrets = true;
            results.push({ file, findings });
        }
    }
    
    if (!hasSecrets) {
        log('✅ No secrets detected in staged files', 'green');
        log('🚀 Commit is safe to proceed\n', 'green');
        process.exit(0);
    }
    
    // Report findings
    log('🚨 SECRETS DETECTED IN STAGED FILES!\n', 'red');
    
    for (const { file, findings } of results) {
        log(`📄 File: ${file}`, 'yellow');
        for (const { type, severity, count, samples } of findings) {
            const severityColor = severity === 'CRITICAL' ? 'red' : 
                                 severity === 'HIGH' ? 'red' : 'yellow';
            log(`   ⚠️  ${type} [${severity}] - ${count} occurrence(s)`, severityColor);
            if (samples.length > 0) {
                log(`      Sample: ${samples[0].substring(0, 30)}...`, severityColor);
            }
        }
        log('', 'reset');
    }
    
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
    log('❌ COMMIT BLOCKED - SECRETS FOUND', 'red');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
    
    log('\n💡 What to do:', 'cyan');
    log('   1. Remove secrets from staged files', 'yellow');
    log('   2. Move secrets to .env file (which is gitignored)', 'yellow');
    log('   3. Use environment variables instead: process.env.API_KEY', 'yellow');
    log('   4. Review files listed above and fix before committing', 'yellow');
    
    log('\n🔧 How to fix:', 'cyan');
    log('   - For accidentally staged .env: git reset HEAD .env', 'yellow');
    log('   - For secrets in code: Replace with process.env.VARIABLE_NAME', 'yellow');
    log('   - Then stage fixed files and commit again', 'yellow');
    
    log('\n📚 Learn more:', 'cyan');
    log('   See DEVELOPER_ONBOARDING.md for secure development practices\n', 'yellow');
    
    process.exit(1);
}

main();
