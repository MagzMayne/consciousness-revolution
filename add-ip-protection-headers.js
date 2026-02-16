#!/usr/bin/env node

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * INTELLECTUAL PROPERTY PROTECTION HEADER INJECTOR
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * This file and all associated intellectual property are protected by copyright law.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The concepts, algorithms, and implementations contained herein are subject to
 * provisional patent applications and are considered trade secrets of Ryan Barbrick.
 * 
 * Unauthorized use, reproduction, or distribution is strictly prohibited and may
 * result in severe civil and criminal penalties.
 * 
 * Creator: Ryan Barbrick | Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * Patent Declaration ID: IP-PROTECT-2025-001
 * Date Filed: February 13, 2026
 * ════════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

// IP Protection Header Templates
const HEADERS = {
  javascript: `/**
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
 * File: {{FILENAME}}
 * Declaration ID: {{PATENT_ID}}
 * Date: {{DATE}}
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

`,

  html: `<!--
════════════════════════════════════════════════════════════════════════════════
© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
════════════════════════════════════════════════════════════════════════════════

PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION

This file contains proprietary intellectual property of Ryan Barbrick.
All concepts, designs, implementations, and innovations are protected by
copyright law and are considered trade secrets.

PROVISIONAL PATENT NOTICE:
The ideas, methods, systems, and implementations contained in this file are
subject to provisional patent protection. Unauthorized use, reproduction,
modification, or distribution is strictly prohibited.

LEGAL WARNING:
Unauthorized use of this intellectual property may result in:
- Civil litigation for copyright infringement
- Claims for actual and statutory damages ($750-$150,000 per work)
- Injunctive relief and cease & desist orders
- Criminal prosecution for willful infringement
- Recovery of attorney fees and legal costs

CREATOR INFORMATION:
Author: Ryan Barbrick
Business: Barbrick Design
Contact: BarbrickDesign@gmail.com
AI Assistant: Merlin AI
Repository: https://github.com/barbrickdesign/barbrickdesign.github.io

PATENT DECLARATION:
File: {{FILENAME}}
Declaration ID: {{PATENT_ID}}
Date: {{DATE}}
Innovation Type: Web Application, User Interface, System Design

For licensing inquiries, contact: BarbrickDesign@gmail.com
════════════════════════════════════════════════════════════════════════════════
-->

`,

  python: `#!/usr/bin/env python3
# ════════════════════════════════════════════════════════════════════════════════
# © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
# ════════════════════════════════════════════════════════════════════════════════
#
# PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
#
# This file contains proprietary intellectual property of Ryan Barbrick.
# All concepts, algorithms, implementations, and innovations are protected by
# copyright law and are considered trade secrets.
#
# PROVISIONAL PATENT NOTICE:
# The ideas, methods, systems, and code contained in this file are subject to
# provisional patent protection. Unauthorized use, reproduction, modification,
# or distribution is strictly prohibited.
#
# LEGAL WARNING:
# Unauthorized use of this intellectual property may result in:
# - Civil litigation for copyright infringement
# - Claims for actual and statutory damages ($750-$150,000 per work)
# - Injunctive relief and cease & desist orders
# - Criminal prosecution for willful infringement
# - Recovery of attorney fees and legal costs
#
# CREATOR INFORMATION:
# Author: Ryan Barbrick
# Business: Barbrick Design
# Contact: BarbrickDesign@gmail.com
# AI Assistant: Merlin AI
# Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
#
# PATENT DECLARATION:
# File: {{FILENAME}}
# Declaration ID: {{PATENT_ID}}
# Date: {{DATE}}
# Innovation Type: Software Implementation, Algorithm, System Design
#
# For licensing inquiries, contact: BarbrickDesign@gmail.com
# ════════════════════════════════════════════════════════════════════════════════

`
};

class IPProtectionInjector {
  constructor() {
    this.registeredPatents = [];
    this.processedFiles = 0;
    this.skippedFiles = 0;
    this.errorFiles = 0;
    this.dryRun = process.argv.includes('--dry-run');
  }

  /**
   * Generate unique patent declaration ID
   */
  generatePatentId(filename) {
    const timestamp = Date.now();
    const hash = filename.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `IP-${Math.abs(hash).toString(16).toUpperCase()}-${timestamp.toString(36).toUpperCase()}`;
  }

  /**
   * Check if file already has IP protection header
   */
  hasIPProtection(content) {
    return content.includes('PROPRIETARY AND CONFIDENTIAL') ||
           content.includes('INTELLECTUAL PROPERTY PROTECTION') ||
           content.includes('PATENT DECLARATION');
  }

  /**
   * Check if file has existing copyright notice
   */
  hasExistingCopyright(content) {
    return content.includes('© 202') && content.includes('Ryan Barbrick');
  }

  /**
   * Apply IP protection header to file
   */
  applyHeader(filePath, content, headerTemplate) {
    const filename = path.basename(filePath);
    const patentId = this.generatePatentId(filename);
    const date = new Date().toISOString().split('T')[0];

    let header = headerTemplate
      .replace('{{FILENAME}}', filename)
      .replace('{{PATENT_ID}}', patentId)
      .replace('{{DATE}}', date);

    // For HTML files, insert after DOCTYPE if exists
    if (filePath.endsWith('.html')) {
      const doctypeMatch = content.match(/^<!DOCTYPE[^>]*>\s*/i);
      if (doctypeMatch) {
        content = content.replace(doctypeMatch[0], doctypeMatch[0] + header);
      } else {
        content = header + content;
      }
    } else {
      content = header + content;
    }

    // Register patent declaration
    this.registeredPatents.push({
      file: filePath,
      patentId: patentId,
      date: date,
      type: this.getInnovationType(filePath)
    });

    return content;
  }

  /**
   * Determine innovation type based on file
   */
  getInnovationType(filePath) {
    const filename = path.basename(filePath).toLowerCase();
    
    if (filename.includes('agent') || filename.includes('ai')) {
      return 'AI System, Autonomous Agent, Machine Learning';
    } else if (filename.includes('payment') || filename.includes('paypal')) {
      return 'Payment System, Financial Integration';
    } else if (filename.includes('blockchain') || filename.includes('crypto')) {
      return 'Blockchain System, Cryptocurrency Implementation';
    } else if (filename.includes('3d') || filename.includes('graphics')) {
      return '3D Graphics, Visualization System';
    } else if (filename.includes('game') || filename.includes('poker')) {
      return 'Gaming System, Interactive Application';
    } else if (filePath.endsWith('.html')) {
      return 'Web Application, User Interface';
    } else if (filePath.endsWith('.js')) {
      return 'Software Implementation, Algorithm';
    } else if (filePath.endsWith('.py')) {
      return 'Software Implementation, Data Processing';
    }
    
    return 'Software Implementation, System Design';
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Skip if already has IP protection
      if (this.hasIPProtection(content)) {
        console.log(`⏭️  SKIPPED: ${filePath} (already protected)`);
        this.skippedFiles++;
        return;
      }

      // Determine header type
      let headerTemplate;
      if (filePath.endsWith('.js')) {
        headerTemplate = HEADERS.javascript;
      } else if (filePath.endsWith('.html')) {
        headerTemplate = HEADERS.html;
      } else if (filePath.endsWith('.py')) {
        headerTemplate = HEADERS.python;
      } else {
        console.log(`⏭️  SKIPPED: ${filePath} (unsupported file type)`);
        this.skippedFiles++;
        return;
      }

      // Apply header
      const updatedContent = this.applyHeader(filePath, content, headerTemplate);

      // Write file (unless dry run)
      if (!this.dryRun) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ PROTECTED: ${filePath}`);
      } else {
        console.log(`🔍 DRY RUN: Would protect ${filePath}`);
      }

      this.processedFiles++;
    } catch (error) {
      console.error(`❌ ERROR: ${filePath} - ${error.message}`);
      this.errorFiles++;
    }
  }

  /**
   * Recursively find files
   */
  findFiles(dir, extensions) {
    let results = [];
    
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        // Skip directories to ignore
        if (stat.isDirectory()) {
          if (!item.startsWith('.') && 
              item !== 'node_modules' && 
              item !== 'dist' && 
              item !== 'build') {
            results = results.concat(this.findFiles(fullPath, extensions));
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            results.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}: ${error.message}`);
    }

    return results;
  }

  /**
   * Process all files in repository
   */
  processRepository(rootDir) {
    console.log('════════════════════════════════════════════════════════════════');
    console.log('   INTELLECTUAL PROPERTY PROTECTION HEADER INJECTOR');
    console.log('   © 2024-2025 Ryan Barbrick (Barbrick Design)');
    console.log('════════════════════════════════════════════════════════════════\n');

    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    console.log('📁 Scanning repository for source files...\n');

    // Find all JavaScript, HTML, and Python files
    const jsFiles = this.findFiles(rootDir, ['.js']);
    const htmlFiles = this.findFiles(rootDir, ['.html']);
    const pyFiles = this.findFiles(rootDir, ['.py']);

    const allFiles = [...jsFiles, ...htmlFiles, ...pyFiles];

    console.log(`Found ${jsFiles.length} JavaScript files`);
    console.log(`Found ${htmlFiles.length} HTML files`);
    console.log(`Found ${pyFiles.length} Python files`);
    console.log(`Total: ${allFiles.length} files to process\n`);

    console.log('🔒 Adding IP protection headers...\n');

    // Process each file
    for (const file of allFiles) {
      this.processFile(file);
    }

    // Generate patent registry
    if (!this.dryRun) {
      this.generatePatentRegistry(rootDir);
    }

    // Print summary
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`✅ Protected files: ${this.processedFiles}`);
    console.log(`⏭️  Skipped files: ${this.skippedFiles}`);
    console.log(`❌ Error files: ${this.errorFiles}`);
    console.log(`📋 Patent declarations registered: ${this.registeredPatents.length}`);
    console.log('════════════════════════════════════════════════════════════════\n');
  }

  /**
   * Generate patent registry document
   */
  generatePatentRegistry(rootDir) {
    const registryPath = path.join(rootDir, 'PATENT_DECLARATIONS.md');
    
    let registry = `# 📋 Patent Declarations Registry

© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.

## Overview

This document serves as the official registry of all provisional patent declarations
for intellectual property contained within this repository. Each file with innovative
concepts, algorithms, or implementations has been assigned a unique Patent Declaration ID.

## Legal Notice

All innovations listed in this registry are:
- Protected by copyright law
- Subject to provisional patent protection
- Considered trade secrets of Ryan Barbrick
- Protected against unauthorized use or reproduction

## Total Declarations: ${this.registeredPatents.length}

Last Updated: ${new Date().toISOString()}

---

## Patent Declarations

| File | Patent ID | Date | Innovation Type |
|------|-----------|------|-----------------|
`;

    // Sort by date
    this.registeredPatents.sort((a, b) => b.date.localeCompare(a.date));

    for (const patent of this.registeredPatents) {
      const relativePath = patent.file.replace(rootDir + '/', '');
      registry += `| ${relativePath} | ${patent.patentId} | ${patent.date} | ${patent.type} |\n`;
    }

    registry += `

---

## Contact Information

**For licensing inquiries or legal matters:**

- **Email:** BarbrickDesign@gmail.com
- **Repository:** https://github.com/barbrickdesign/barbrickdesign.github.io
- **Copyright Holder:** Ryan Barbrick (Barbrick Design)
- **AI Assistant:** Merlin AI

---

## Patent Protection Details

### What is Protected

Each patent declaration protects:

1. **Original Concepts** - Novel ideas and innovative approaches
2. **Algorithms** - Computational methods and problem-solving techniques
3. **System Designs** - Architecture and structural implementations
4. **Code Implementations** - Specific software implementations
5. **Business Methods** - Unique processes and workflows
6. **UI/UX Innovations** - Original interface designs and user experiences

### Enforcement

Unauthorized use of any patented innovation will result in:

- Cease and desist demands
- Legal action for patent infringement
- Claims for damages and lost profits
- Injunctive relief
- Recovery of legal fees

### Licensing Available

Contact BarbrickDesign@gmail.com to discuss licensing opportunities:

- Commercial licensing for business use
- Educational licensing for institutions
- Partnership agreements
- Custom development and consulting

---

**This registry is automatically maintained and updated by the IP Protection System.**
`;

    fs.writeFileSync(registryPath, registry, 'utf8');
    console.log(`\n📄 Patent registry created: ${registryPath}`);
  }
}

// Run the injector
const injector = new IPProtectionInjector();
const rootDir = process.argv[2] || process.cwd();
injector.processRepository(rootDir);
