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
 * File: minimal-enhancer.js
 * Declaration ID: IP-184D8239-MLL28ZVJ
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
 * MINIMAL PROJECT ENHANCER
 * Makes only essential, safe enhancements to low-scoring projects
 * Focus: Add missing meta tags, basic error handling, ensure proper structure
 */

const fs = require('fs');
const path = require('path');

class MinimalEnhancer {
    constructor() {
        this.scoresData = null;
        this.stats = { total: 0, enhanced: 0, skipped: 0 };
        this.log = [];
    }

    async run() {
        console.log('🔧 Starting Minimal Project Enhancement...\n');
        await this.loadScores();
        await this.enhanceProjects();
        this.saveLog();
        this.printSummary();
    }

    async loadScores() {
        const scoresPath = path.join(__dirname, 'functionality-scores.json');
        this.scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
    }

    async enhanceProjects() {
        const projects = Object.values(this.scoresData.projects)
            .filter(p => {
                if (p.total >= 60 || p.status === 'error') return false;
                if (p.path.includes('backup') || p.path.includes('docs/') || 
                    p.path.includes('wallet-base') || p.path.includes('gbuvInvestmentPortalScript')) {
                    return false;
                }
                const filePath = path.join(__dirname, p.path);
                if (!fs.existsSync(filePath)) return false;
                const content = fs.readFileSync(filePath, 'utf8');
                return content.length >= 500;
            })
            .sort((a, b) => a.total - b.total);

        this.stats.total = projects.length;
        console.log(`Enhancing ${this.stats.total} projects...\n`);

        for (let i = 0; i < projects.length; i++) {
            process.stdout.write(`\rProgress: ${i+1}/${this.stats.total}`);
            this.enhanceProject(projects[i]);
        }
        console.log('\n');
    }

    enhanceProject(project) {
        const filePath = path.join(__dirname, project.path);
        let content = fs.readFileSync(filePath, 'utf8');
        const original = content;
        const changes = [];

        // 1. Add viewport meta tag if missing
        if (!content.includes('viewport') && content.includes('<head>')) {
            content = content.replace(/<head>/i, 
                '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
            changes.push('Added viewport meta tag');
        }

        // 2. Add charset if missing  
        if (!content.includes('charset') && content.includes('<head>')) {
            content = content.replace(/<head>/i, 
                '<head>\n    <meta charset="UTF-8">');
            changes.push('Added charset');
        }

        // 3. Wrap main script in DOMContentLoaded if functions exist but aren't auto-called
        if (content.includes('function init') && 
            !content.includes('DOMContentLoaded') && 
            !content.includes('window.onload') &&
            !content.includes('init()')) {
            
            const scriptEnd = content.lastIndexOf('</script>');
            if (scriptEnd > -1) {
                const autoInit = `\n\n// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof init === 'function') init();
});`;
                content = content.substring(0, scriptEnd) + autoInit + content.substring(scriptEnd);
                changes.push('Added auto-initialization');
            }
        }

        // Save if changed
        if (content !== original) {
            fs.writeFileSync(filePath, content);
            this.stats.enhanced++;
            this.log.push({ path: project.path, oldScore: project.total, changes });
        } else {
            this.stats.skipped++;
        }
    }

    saveLog() {
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            enhancements: this.log
        };
        fs.writeFileSync('./minimal-enhancement-log.json', JSON.stringify(report, null, 2));
    }

    printSummary() {
        console.log('✅ Enhancement Complete!\n');
        console.log(`Total: ${this.stats.total}`);
        console.log(`Enhanced: ${this.stats.enhanced}`);
        console.log(`Skipped: ${this.stats.skipped}\n`);
        console.log('💡 Run functionality-scoring-system.js to see improvements\n');
    }
}

new MinimalEnhancer().run().catch(console.error);
