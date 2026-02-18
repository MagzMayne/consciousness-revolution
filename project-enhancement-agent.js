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
 * File: project-enhancement-agent.js
 * Declaration ID: IP-54CBF2A7-MLL28ZVL
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
 * PROJECT ENHANCEMENT AGENT
 * Automatically enhances HTML projects to improve functionality scores
 * 
 * Enhancements:
 * 1. Add missing DOCTYPE, html, head, body tags
 * 2. Add viewport meta tag for mobile responsiveness
 * 3. Add error handling wrappers to scripts
 * 4. Add basic event listeners where needed
 * 5. Add try-catch blocks around existing code
 * 6. Ensure proper CSS inclusion
 */

const fs = require('fs');
const path = require('path');

// Configuration constants
const MIN_SCRIPT_LENGTH = 50; // Minimum script length to wrap in error handling

class ProjectEnhancementAgent {
    constructor() {
        this.scoresData = null;
        this.enhancementLog = [];
        this.stats = {
            total: 0,
            enhanced: 0,
            skipped: 0,
            errors: 0
        };
    }

    async initialize() {
        console.log('🤖 Initializing Project Enhancement Agent...\n');
        await this.loadScores();
    }

    async loadScores() {
        try {
            const scoresPath = path.join(__dirname, 'functionality-scores.json');
            const data = fs.readFileSync(scoresPath, 'utf8');
            this.scoresData = JSON.parse(data);
            console.log(`✅ Loaded functionality scores for ${Object.keys(this.scoresData.projects).length} projects\n`);
        } catch (error) {
            console.error('❌ Error loading functionality-scores.json:', error.message);
            console.log('Please run functionality-scoring-system.js first');
            process.exit(1);
        }
    }

    async enhanceProjects() {
        console.log('🔧 Starting project enhancements...\n');

        // Get projects that need improvement (score < 80)
        const projectsToEnhance = Object.values(this.scoresData.projects)
            .filter(p => p.total < 80 && p.status !== 'error')
            .sort((a, b) => a.total - b.total); // Start with lowest scores

        this.stats.total = projectsToEnhance.length;
        console.log(`Found ${this.stats.total} projects needing enhancement (score < 80)\n`);

        let count = 0;
        for (const project of projectsToEnhance) {
            count++;
            process.stdout.write(`\rEnhancing: ${count}/${this.stats.total} (${Math.round(count/this.stats.total*100)}%)`);
            
            try {
                await this.enhanceProject(project);
                this.stats.enhanced++;
            } catch (error) {
                this.stats.errors++;
                this.enhancementLog.push({
                    path: project.path,
                    status: 'error',
                    error: error.message
                });
            }
        }

        console.log('\n\n✅ Enhancement complete!\n');
    }

    async enhanceProject(project) {
        const filePath = path.join(__dirname, project.path);
        
        if (!fs.existsSync(filePath)) {
            this.stats.skipped++;
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let changes = [];
        let modified = false;

        // Enhancement 1: Add missing DOCTYPE
        if (!content.includes('<!DOCTYPE') && !content.includes('<!doctype')) {
            content = '<!DOCTYPE html>\n' + content;
            changes.push('Added DOCTYPE declaration');
            modified = true;
        }

        // Enhancement 2: Wrap content in proper HTML structure if missing
        if (!content.includes('<html')) {
            const bodyContent = content;
            // Sanitize title to prevent XSS
            const sanitizedTitle = (project.title || 'Untitled')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sanitizedTitle}</title>
</head>
<body>
${bodyContent}
</body>
</html>`;
            changes.push('Added complete HTML structure');
            modified = true;
        } else {
            // Enhancement 3: Add viewport meta tag if missing
            if (!content.includes('viewport') && content.includes('<head>')) {
                const viewportTag = '\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">';
                content = content.replace('<head>', '<head>' + viewportTag);
                changes.push('Added viewport meta tag');
                modified = true;
            }

            // Enhancement 4: Add charset if missing
            if (!content.includes('charset') && content.includes('<head>')) {
                const charsetTag = '\n    <meta charset="UTF-8">';
                content = content.replace('<head>', '<head>' + charsetTag);
                changes.push('Added charset meta tag');
                modified = true;
            }
        }

        // Enhancement 5: Add error handling to inline scripts
        if (content.toLowerCase().includes('<script>') && !content.toLowerCase().includes('<script src=')) {
            const scriptRegex = /<script>([\s\S]*?)<\/script>/gi; // Case-insensitive
            let match;
            let needsErrorHandling = false;

            while ((match = scriptRegex.exec(content)) !== null) {
                const scriptContent = match[1];
                // Check if script lacks try-catch and is substantial enough
                if (!scriptContent.includes('try {') && scriptContent.trim().length > MIN_SCRIPT_LENGTH) {
                    needsErrorHandling = true;
                    break;
                }
            }

            if (needsErrorHandling) {
                content = content.replace(/<script>([\s\S]*?)<\/script>/gi, (match, scriptContent) => {
                    if (scriptContent.trim().length > MIN_SCRIPT_LENGTH && !scriptContent.includes('try {')) {
                        return `<script>
try {
${scriptContent}
} catch (error) {
    console.error('Script error:', error);
    // Fail gracefully
}
</script>`;
                    }
                    return match;
                });
                changes.push('Added error handling to inline scripts');
                modified = true;
            }
        }

        // Enhancement 6: Add event listener for DOMContentLoaded if functions are defined but not called
        if (content.includes('function ') && 
            !content.includes('DOMContentLoaded') && 
            !content.includes('window.onload')) {
            
            // Find main initialization function
            const initFuncMatch = content.match(/function\s+(init\w*|start\w*|setup\w*)\s*\(/i);
            if (initFuncMatch) {
                const funcName = initFuncMatch[1];
                const enhancement = `\n\n// Auto-initialization
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof ${funcName} === 'function') {
            ${funcName}();
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
});`;
                
                // Add before closing body or script tag
                if (content.includes('</script>')) {
                    content = content.replace(/(<\/script>)(?![\s\S]*<\/script>)/i, enhancement + '\n$1');
                } else if (content.includes('</body>')) {
                    content = content.replace('</body>', `<script>${enhancement}\n</script>\n</body>`);
                }
                changes.push(`Added auto-initialization for ${funcName}()`);
                modified = true;
            }
        }

        // Enhancement 7: Add basic CSS if completely missing
        if (!content.includes('<style') && 
            !content.includes('.css') && 
            content.includes('<body>') &&
            !content.includes('three.js')) { // Skip 3D projects
            
            const basicCSS = `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        @media (max-width: 768px) {
            body { padding: 10px; }
        }
    </style>`;
            
            content = content.replace('</head>', basicCSS + '\n</head>');
            changes.push('Added basic responsive CSS');
            modified = true;
        }

        // Only write if we made changes
        if (modified) {
            // Create backup
            const backupPath = filePath + '.backup';
            if (!fs.existsSync(backupPath)) {
                fs.writeFileSync(backupPath, fs.readFileSync(filePath));
            }

            // Write enhanced version
            fs.writeFileSync(filePath, content);

            this.enhancementLog.push({
                path: project.path,
                oldScore: project.total,
                changes: changes,
                status: 'enhanced'
            });
        } else {
            this.stats.skipped++;
            this.enhancementLog.push({
                path: project.path,
                status: 'skipped',
                reason: 'No enhancements needed'
            });
        }
    }

    generateReport() {
        console.log('📝 Generating enhancement report...\n');

        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            enhancements: this.enhancementLog.filter(e => e.status === 'enhanced')
        };

        // Save JSON report
        const reportPath = './enhancement-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`✅ Enhancement report saved to: ${reportPath}\n`);

        // Generate Markdown report
        this.generateMarkdownReport(report);

        // Print summary
        this.printSummary(report);
    }

    generateMarkdownReport(report) {
        const mdPath = './PROJECT_ENHANCEMENTS_REPORT.md';
        
        let md = `# 🔧 Project Enhancement Report\n\n`;
        md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
        md += `## 📊 Enhancement Statistics\n\n`;
        md += `- **Total Projects Analyzed:** ${report.stats.total}\n`;
        md += `- **Projects Enhanced:** ${report.stats.enhanced}\n`;
        md += `- **Projects Skipped:** ${report.stats.skipped}\n`;
        md += `- **Errors:** ${report.stats.errors}\n\n`;
        
        if (report.enhancements.length > 0) {
            md += `## ✨ Enhancements Made\n\n`;
            
            report.enhancements.forEach((enhancement, idx) => {
                md += `### ${idx + 1}. ${enhancement.path}\n`;
                md += `**Previous Score:** ${enhancement.oldScore}/100\n\n`;
                md += `**Changes:**\n`;
                enhancement.changes.forEach(change => {
                    md += `- ✅ ${change}\n`;
                });
                md += `\n`;
            });
        }

        md += `\n## 🎯 Next Steps\n\n`;
        md += `1. Run \`node functionality-scoring-system.js\` to rescore all projects\n`;
        md += `2. Review the new scores to verify improvements\n`;
        md += `3. Test enhanced projects manually for any issues\n`;
        md += `4. Run this enhancement agent again if needed\n`;

        fs.writeFileSync(mdPath, md);
        console.log(`✅ Markdown report saved to: ${mdPath}\n`);
    }

    printSummary(report) {
        console.log('='.repeat(60));
        console.log('🔧 ENHANCEMENT SUMMARY');
        console.log('='.repeat(60));
        console.log(`\nTotal Projects: ${report.stats.total}`);
        console.log(`Enhanced: ${report.stats.enhanced}`);
        console.log(`Skipped: ${report.stats.skipped}`);
        console.log(`Errors: ${report.stats.errors}`);
        console.log('\n' + '='.repeat(60) + '\n');
    }

    async run() {
        await this.initialize();
        await this.enhanceProjects();
        this.generateReport();
        console.log('🎉 Project enhancement complete!\n');
        console.log('💡 Run functionality-scoring-system.js again to see improvements!\n');
    }
}

// Run if called directly
if (require.main === module) {
    const agent = new ProjectEnhancementAgent();
    agent.run().catch(console.error);
}

module.exports = ProjectEnhancementAgent;
