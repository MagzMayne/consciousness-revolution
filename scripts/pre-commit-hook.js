#!/usr/bin/env node

/**
 * 🔒 Pre-commit Hook - Secret Detection
 * 
 * Scans staged files for potential exposed secrets before commit.
 * Prevents accidental commits of API keys, tokens, and passwords.
 * 
 * Installation: npm run setup:git-hooks
 * 
 * @author Consciousness Revolution Platform Team
 * @version 1.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Terminal colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

// Secret patterns to detect
const SECRET_PATTERNS = [
    {
        pattern: /sk-[a-zA-Z0-9]{20,}/g,
        name: 'OpenAI API Key',
        example: 'sk-...'
    },
    {
        pattern: /ghp_[a-zA-Z0-9]{36,}/g,
        name: 'GitHub Personal Access Token',
        example: 'ghp_...'
    },
    {
        pattern: /github_pat_[a-zA-Z0-9_]{22,}/g,
        name: 'GitHub PAT',
        example: 'github_pat_...'
    },
    {
        pattern: /sk-ant-[a-zA-Z0-9-_]{20,}/g,
        name: 'Anthropic API Key',
        example: 'sk-ant-...'
    },
    {
        pattern: /gsk-[a-zA-Z0-9]{20,}/g,
        name: 'Groq API Key',
        example: 'gsk-...'
    },
    {
        pattern: /AIza[0-9A-Za-z_-]{35}/g,
        name: 'Google API Key',
        example: 'AIza...'
    },
    {
        pattern: /(password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi,
        name: 'Password',
        example: 'password: "..."'
    },
    {
        pattern: /postgresql:\/\/[^:]+:[^@]+@/g,
        name: 'Database URL with credentials',
        example: 'postgresql://user:pass@...'
    },
];

// Files to always ignore
const IGNORE_FILES = [
    '.env.example',
    '.env.core.example',
    '.env.test.example',
    '.env.template',
    'scripts/pre-commit-hook.js',
    'backend-health-checker.js'
];

/**
 * Get staged files from git
 */
function getStagedFiles() {
    try {
        const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
        return output.trim().split('\n').filter(f => f);
    } catch (error) {
        console.error(`${colors.red}Error getting staged files: ${error.message}${colors.reset}`);
        return [];
    }
}

/**
 * Check if file should be ignored
 */
function shouldIgnoreFile(filename) {
    // Ignore files in IGNORE_FILES list
    if (IGNORE_FILES.some(ignore => filename.endsWith(ignore))) {
        return true;
    }
    
    // Ignore .env files (they should already be gitignored)
    if (filename.includes('.env') && !filename.includes('.example')) {
        return true;
    }
    
    // Ignore binary files
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz'];
    if (binaryExtensions.some(ext => filename.endsWith(ext))) {
        return true;
    }
    
    return false;
}

/**
 * Check file for secrets
 */
function checkFileForSecrets(filename) {
    if (shouldIgnoreFile(filename)) {
        return { found: false, secrets: [] };
    }
    
    let content;
    try {
        content = fs.readFileSync(filename, 'utf8');
    } catch (error) {
        // File might be deleted or unreadable
        return { found: false, secrets: [] };
    }
    
    const foundSecrets = [];
    
    for (const { pattern, name, example } of SECRET_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
            // Check if it's in a comment or is an example
            const isComment = matches.some(match => {
                const lines = content.split('\n');
                return lines.some(line => {
                    return line.includes(match) && (
                        line.trim().startsWith('//') ||
                        line.trim().startsWith('*') ||
                        line.trim().startsWith('#')
                    );
                });
            });
            
            const isExample = matches.some(match => 
                match.includes('your-') ||
                match.includes('example') ||
                match.includes('xxx') ||
                match.includes('placeholder')
            );
            
            if (!isComment && !isExample) {
                foundSecrets.push({
                    name,
                    example,
                    matches: matches.length
                });
            }
        }
    }
    
    return {
        found: foundSecrets.length > 0,
        secrets: foundSecrets
    };
}

/**
 * Main execution
 */
function main() {
    console.log(`${colors.cyan}🔒 Checking for exposed secrets...${colors.reset}\n`);
    
    const stagedFiles = getStagedFiles();
    
    if (stagedFiles.length === 0) {
        console.log('No files staged for commit.');
        process.exit(0);
    }
    
    let hasSecrets = false;
    const filesWithSecrets = [];
    
    for (const file of stagedFiles) {
        const result = checkFileForSecrets(file);
        
        if (result.found) {
            hasSecrets = true;
            filesWithSecrets.push({ file, secrets: result.secrets });
        }
    }
    
    if (hasSecrets) {
        console.log(`${colors.red}❌ COMMIT BLOCKED - Potential secrets detected!${colors.reset}\n`);
        
        for (const { file, secrets } of filesWithSecrets) {
            console.log(`${colors.yellow}File: ${file}${colors.reset}`);
            for (const secret of secrets) {
                console.log(`  ⚠️  ${secret.name} (${secret.matches} occurrence${secret.matches > 1 ? 's' : ''})`);
                console.log(`     Pattern: ${secret.example}`);
            }
            console.log();
        }
        
        console.log(`${colors.cyan}What to do:${colors.reset}`);
        console.log(`  1. Remove the secret from the file`);
        console.log(`  2. Add it to .env instead`);
        console.log(`  3. Use environment variables: process.env.YOUR_KEY`);
        console.log(`  4. If this is a false positive, add the file to IGNORE_FILES in scripts/pre-commit-hook.js\n`);
        
        console.log(`${colors.yellow}⚠️  To bypass this check (NOT recommended):${colors.reset}`);
        console.log(`    git commit --no-verify\n`);
        
        process.exit(1);
    }
    
    console.log(`${colors.cyan}✓ No exposed secrets detected${colors.reset}`);
    console.log(`${colors.cyan}✓ ${stagedFiles.length} file${stagedFiles.length > 1 ? 's' : ''} checked${colors.reset}\n`);
    
    process.exit(0);
}

// Run the check
if (require.main === module) {
    main();
}

module.exports = { checkFileForSecrets, getStagedFiles };
