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
 * File: project-scanner.js
 * Declaration ID: IP-23637D93-MLL28ZW9
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

/** SIGNED BY MeRLynn - ID: MERLYNN-5f608e68 - TIMESTAMP: 2025-12-19T05:53:06.542Z - HASH: 634fa097 */
/** SIGNED BY AGentR - ID: AGENTR-219afda5 - TIMESTAMP: 2025-12-19T05:53:06.542Z - HASH: 634fa097 */

#!/usr/bin/env node

/**
 * SAFE PROJECT SCANNER
 * Scans C: drive for valid projects and generates organized structure
 * Run this manually to scan and organize your projects
 * 
 * USAGE: node project-scanner.js [start-path]
 * Example: node project-scanner.js C:\Users\barbr\Documents
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

class ProjectScanner {
    constructor(startPath) {
        this.startPath = startPath || 'C:\\';
        this.foundProjects = [];
        this.scannedDirs = 0;
        this.errors = [];
        
        // Directories to skip
        this.skipDirs = new Set([
            'node_modules', '.git', '.vs', 'bin', 'obj', 'packages',
            'AppData', 'Windows', 'System32', '$Recycle.Bin',
            'Program Files', 'Program Files (x86)', 'ProgramData'
        ]);
        
        // Project indicators
        this.projectFiles = {
            'package.json': 'node',
            'requirements.txt': 'python',
            'Cargo.toml': 'rust',
            'go.mod': 'go',
            'pom.xml': 'java',
            'composer.json': 'php',
            '.csproj': 'csharp',
            'index.html': 'web',
            'main.py': 'python',
            'app.py': 'python',
            'server.js': 'node',
            'index.js': 'node'
        };
    }

    /**
     * Check if directory should be skipped
     */
    shouldSkip(dirName) {
        return this.skipDirs.has(dirName) || dirName.startsWith('.');
    }

    /**
     * Detect project type
     */
    detectProjectType(dirPath) {
        try {
            const files = fs.readdirSync(dirPath);
            const detectedTypes = [];
            
            for (const file of files) {
                const lowerFile = file.toLowerCase();
                for (const [projectFile, type] of Object.entries(this.projectFiles)) {
                    if (lowerFile.includes(projectFile.toLowerCase())) {
                        detectedTypes.push(type);
                        break;
                    }
                }
            }
            
            return detectedTypes.length > 0 ? detectedTypes[0] : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Analyze project
     */
    analyzeProject(dirPath) {
        const analysis = {
            path: dirPath,
            name: path.basename(dirPath),
            type: this.detectProjectType(dirPath),
            hasReadme: false,
            hasGit: false,
            files: [],
            size: 0,
            lineCount: 0
        };

        try {
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const file of files) {
                const filePath = path.join(dirPath, file.name);
                
                if (file.isDirectory()) {
                    if (file.name === '.git') {
                        analysis.hasGit = true;
                    }
                } else {
                    analysis.files.push(file.name);
                    
                    if (file.name.toLowerCase().includes('readme')) {
                        analysis.hasReadme = true;
                    }
                    
                    try {
                        const stats = fs.statSync(filePath);
                        analysis.size += stats.size;
                        
                        // Count lines for code files
                        if (this.isCodeFile(file.name)) {
                            const content = fs.readFileSync(filePath, 'utf8');
                            analysis.lineCount += content.split('\n').length;
                        }
                    } catch (err) {
                        // Skip files we can't read
                    }
                }
            }
            
            // Generate hash for uniqueness
            analysis.hash = crypto
                .createHash('md5')
                .update(analysis.name + analysis.path)
                .digest('hex')
                .substring(0, 8);
                
        } catch (error) {
            this.errors.push(`Error analyzing ${dirPath}: ${error.message}`);
        }
        
        return analysis;
    }

    /**
     * Check if file is a code file
     */
    isCodeFile(filename) {
        const codeExts = ['.js', '.ts', '.py', '.java', '.cs', '.go', '.rs', 
                         '.html', '.css', '.php', '.cpp', '.c', '.h'];
        return codeExts.some(ext => filename.endsWith(ext));
    }

    /**
     * Scan directory recursively
     */
    async scanDirectory(dirPath, depth = 0, maxDepth = 5) {
        if (depth > maxDepth) return;
        
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            this.scannedDirs++;
            
            // Check if current directory is a project
            const projectType = this.detectProjectType(dirPath);
            if (projectType) {
                const analysis = this.analyzeProject(dirPath);
                if (analysis.lineCount > 50) { // Only include substantial projects
                    this.foundProjects.push(analysis);
                    console.log(`${colors.green}✓${colors.reset} Found project: ${analysis.name} (${analysis.type})`);
                }
            }
            
            // Scan subdirectories
            for (const entry of entries) {
                if (entry.isDirectory() && !this.shouldSkip(entry.name)) {
                    const subPath = path.join(dirPath, entry.name);
                    await this.scanDirectory(subPath, depth + 1, maxDepth);
                }
            }
        } catch (error) {
            // Skip directories we can't access
            if (error.code !== 'EPERM' && error.code !== 'EACCES') {
                this.errors.push(`Error scanning ${dirPath}: ${error.message}`);
            }
        }
    }

    /**
     * Generate project report
     */
    generateReport() {
        console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
        console.log(`${colors.cyan}📊 PROJECT SCAN REPORT${colors.reset}`);
        console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);
        
        console.log(`Scanned directories: ${this.scannedDirs}`);
        console.log(`Projects found: ${this.foundProjects.length}`);
        console.log(`Errors: ${this.errors.length}\n`);
        
        // Group by type
        const byType = {};
        this.foundProjects.forEach(proj => {
            byType[proj.type] = (byType[proj.type] || 0) + 1;
        });
        
        console.log('Projects by type:');
        Object.entries(byType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
        
        console.log(`\n${colors.yellow}Top 10 Projects:${colors.reset}`);
        const sorted = this.foundProjects
            .sort((a, b) => b.lineCount - a.lineCount)
            .slice(0, 10);
            
        sorted.forEach((proj, i) => {
            console.log(`${i + 1}. ${proj.name} (${proj.type}) - ${proj.lineCount} lines`);
            console.log(`   Path: ${proj.path}`);
        });
    }

    /**
     * Save projects to JSON
     */
    saveProjectsToJSON(outputPath = './discovered-projects.json') {
        const data = {
            scannedAt: new Date().toISOString(),
            totalProjects: this.foundProjects.length,
            projects: this.foundProjects.map(proj => ({
                ...proj,
                // Add estimated value
                estimatedValue: this.estimateValue(proj)
            }))
        };
        
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`\n${colors.green}✓${colors.reset} Saved projects to ${outputPath}`);
    }

    /**
     * Estimate project value
     */
    estimateValue(project) {
        const baseValue = project.lineCount * 10; // $10 per line
        const multipliers = {
            'node': 1.2,
            'python': 1.1,
            'rust': 1.5,
            'go': 1.3,
            'web': 1.0
        };
        
        const multiplier = multipliers[project.type] || 1.0;
        const hasGitBonus = project.hasGit ? 1.2 : 1.0;
        const hasReadmeBonus = project.hasReadme ? 1.1 : 1.0;
        
        return Math.round(baseValue * multiplier * hasGitBonus * hasReadmeBonus);
    }

    /**
     * Run full scan
     */
    async scan() {
        console.log(`${colors.blue}🔍 Starting project scan...${colors.reset}`);
        console.log(`Start path: ${this.startPath}\n`);
        
        const startTime = Date.now();
        await this.scanDirectory(this.startPath);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        this.generateReport();
        this.saveProjectsToJSON();
        
        console.log(`\n${colors.green}✓${colors.reset} Scan completed in ${duration}s`);
        
        if (this.errors.length > 0) {
            console.log(`\n${colors.yellow}Errors (first 5):${colors.reset}`);
            this.errors.slice(0, 5).forEach(err => console.log(`  ${err}`));
        }
    }
}

// CLI execution
if (require.main === module) {
    const startPath = process.argv[2] || 'C:\\Users\\barbr\\Documents';
    
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}🔒 SAFE PROJECT SCANNER${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);
    
    console.log(`${colors.yellow}⚠️  This will scan your filesystem for projects.${colors.reset}`);
    console.log(`${colors.yellow}   Only readable directories will be scanned.${colors.reset}`);
    console.log(`${colors.yellow}   System directories are automatically skipped.${colors.reset}\n`);
    
    const scanner = new ProjectScanner(startPath);
    scanner.scan().catch(error => {
        console.error(`${colors.red}Fatal error:${colors.reset}`, error);
        process.exit(1);
    });
}

module.exports = ProjectScanner;
