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
 * File: organize-projects.js
 * Declaration ID: IP-536C4E13-MLL28ZVV
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Project Organization System
 * 
 * Purpose:
 * - Analyzes projects in the monorepo
 * - Identifies candidates for separate repositories
 * - Creates repository structure with necessary dependencies
 * - Maintains sync between main hub and project repos
 * 
 * Usage:
 *   node scripts/organize-projects.js analyze    # Analyze and categorize projects
 *   node scripts/organize-projects.js generate   # Generate repo structures
 *   node scripts/organize-projects.js manifest   # Create manifest file
 * 
 * Contact: BarbrickDesign@gmail.com
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ProjectOrganizer {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.projectsData = null;
    this.htmlProjects = [];
    this.categorizedProjects = {
      highPriority: [],      // Revenue-critical, standalone tools
      mediumPriority: [],    // Significant projects with unique features
      lowPriority: [],       // Simple demos, part of collections
      keepInHub: []          // Too small or tightly integrated
    };
  }

  /**
   * Load projects.json data
   */
  async loadProjectsData() {
    try {
      const projectsPath = path.join(this.rootDir, 'projects.json');
      const content = await fs.readFile(projectsPath, 'utf-8');
      this.projectsData = JSON.parse(content);
      console.log(`✓ Loaded projects.json: ${this.projectsData.html_projects.length} HTML projects`);
      return this.projectsData;
    } catch (error) {
      console.error('✗ Failed to load projects.json:', error.message);
      throw error;
    }
  }

  /**
   * Analyze HTML files in the repository
   */
  async analyzeHTMLProjects() {
    const htmlFiles = [];
    
    // Get all HTML files in root
    const rootFiles = await fs.readdir(this.rootDir);
    for (const file of rootFiles) {
      if (file.endsWith('.html') && file !== 'index.html') {
        htmlFiles.push({
          name: file.replace('.html', ''),
          path: file,
          location: 'root'
        });
      }
    }

    // Check subdirectories
    const subdirs = ['projects', 'languages', 'mandem.os', 'city-3d'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(this.rootDir, subdir);
      try {
        await this.scanDirectory(subdirPath, subdir, htmlFiles);
      } catch (error) {
        // Directory might not exist, skip
      }
    }

    this.htmlProjects = htmlFiles;
    console.log(`✓ Found ${htmlFiles.length} HTML project files`);
    return htmlFiles;
  }

  /**
   * Recursively scan directory for HTML files
   */
  async scanDirectory(dirPath, basePath, results) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && entry.name !== 'node_modules') {
          await this.scanDirectory(fullPath, path.join(basePath, entry.name), results);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          results.push({
            name: entry.name.replace('.html', ''),
            path: path.relative(this.rootDir, fullPath),
            location: basePath
          });
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }

  /**
   * Analyze file to determine its complexity and dependencies
   */
  async analyzeProjectFile(filePath) {
    try {
      const content = await fs.readFile(path.join(this.rootDir, filePath), 'utf-8');
      
      const analysis = {
        size: content.length,
        hasPayPal: content.includes('paypal'),
        hasBlockchain: content.includes('solana') || content.includes('ethereum') || content.includes('web3'),
        hasAI: content.includes('tensorflow') || content.includes('openai') || content.includes('gemini'),
        has3D: content.includes('babylon') || content.includes('three.js'),
        hasCanvas: content.includes('<canvas'),
        scriptTags: (content.match(/<script[^>]*src=/g) || []).length,
        externalDeps: this.extractDependencies(content),
        monetization: content.includes('paypal') || content.includes('contributor'),
        complexity: 'low'
      };

      // Determine complexity
      const complexityScore = 
        analysis.scriptTags * 2 +
        (analysis.hasBlockchain ? 10 : 0) +
        (analysis.hasAI ? 8 : 0) +
        (analysis.has3D ? 6 : 0) +
        (analysis.hasPayPal ? 10 : 0) +
        (analysis.size > 10000 ? 5 : 0);

      if (complexityScore > 20) {
        analysis.complexity = 'high';
      } else if (complexityScore > 10) {
        analysis.complexity = 'medium';
      }

      return analysis;
    } catch (error) {
      return { complexity: 'unknown', error: error.message };
    }
  }

  /**
   * Extract dependencies from HTML content
   */
  extractDependencies(content) {
    const deps = new Set();
    
    // Match script src attributes
    const scriptMatches = content.matchAll(/<script[^>]*src=["']([^"']+)["']/g);
    for (const match of scriptMatches) {
      const src = match[1];
      if (src.startsWith('/js/') || src.startsWith('/src/') || src.startsWith('js/') || src.startsWith('src/')) {
        deps.add(src);
      }
    }

    // Match CSS link attributes
    const cssMatches = content.matchAll(/<link[^>]*href=["']([^"']+\.css)["']/g);
    for (const match of cssMatches) {
      const href = match[1];
      if (href.startsWith('/css/') || href.startsWith('css/')) {
        deps.add(href);
      }
    }

    return Array.from(deps);
  }

  /**
   * Categorize projects based on analysis
   */
  async categorizeProjects() {
    console.log('\n📊 Categorizing projects...\n');

    const existingRepos = new Set(
      this.projectsData.repositories
        .filter(r => r.name !== 'barbrickdesign.github.io')
        .map(r => r.name.toLowerCase())
    );

    for (const project of this.htmlProjects.slice(0, 50)) { // Sample first 50 for now
      const analysis = await this.analyzeProjectFile(project.path);
      
      const projectInfo = {
        ...project,
        analysis
      };

      // Already has a repo
      if (existingRepos.has(project.name.toLowerCase())) {
        console.log(`  ✓ ${project.name} - Already has repository`);
        continue;
      }

      // High priority: Revenue-critical or complex standalone projects
      if (analysis.monetization || analysis.complexity === 'high') {
        this.categorizedProjects.highPriority.push(projectInfo);
        console.log(`  🔴 HIGH: ${project.name} (${analysis.complexity} complexity, monetization: ${analysis.monetization})`);
      }
      // Medium priority: Significant features or moderate complexity
      else if (analysis.complexity === 'medium' || analysis.hasBlockchain || analysis.has3D) {
        this.categorizedProjects.mediumPriority.push(projectInfo);
        console.log(`  🟡 MEDIUM: ${project.name} (${analysis.complexity} complexity)`);
      }
      // Low priority: Simple projects
      else {
        this.categorizedProjects.lowPriority.push(projectInfo);
        console.log(`  🟢 LOW: ${project.name} (${analysis.complexity} complexity)`);
      }
    }

    console.log('\n📈 Categorization Summary:');
    console.log(`  High Priority (immediate separate repos): ${this.categorizedProjects.highPriority.length}`);
    console.log(`  Medium Priority (phased rollout): ${this.categorizedProjects.mediumPriority.length}`);
    console.log(`  Low Priority (keep in collections): ${this.categorizedProjects.lowPriority.length}`);

    return this.categorizedProjects;
  }

  /**
   * Generate repository manifest
   */
  async generateManifest() {
    const manifest = {
      meta: {
        generated: new Date().toISOString(),
        generator: 'organize-projects.js',
        version: '1.0.0',
        description: 'Project organization manifest for multi-repository structure'
      },
      strategy: {
        mainHub: 'barbrickdesign.github.io',
        approach: 'Keep all code in main hub, create dedicated repos for significant projects',
        syncMethod: 'GitHub Actions workflows for cross-repo synchronization',
        sharedResources: [
          '/js/ - Shared JavaScript libraries',
          '/css/ - Shared stylesheets',
          '/src/utils/ - Utility functions',
          '/src/agents/ - Agent system',
          '/backend/ - Backend microservices'
        ]
      },
      categories: {
        highPriority: {
          description: 'Revenue-critical or complex standalone projects needing dedicated repos',
          count: this.categorizedProjects.highPriority.length,
          projects: this.categorizedProjects.highPriority.map(p => ({
            name: p.name,
            path: p.path,
            complexity: p.analysis.complexity,
            monetization: p.analysis.monetization,
            dependencies: p.analysis.externalDeps,
            recommendedRepoName: this.generateRepoName(p.name)
          }))
        },
        mediumPriority: {
          description: 'Significant projects for phased repository creation',
          count: this.categorizedProjects.mediumPriority.length,
          projects: this.categorizedProjects.mediumPriority.map(p => ({
            name: p.name,
            path: p.path,
            complexity: p.analysis.complexity,
            dependencies: p.analysis.externalDeps,
            recommendedRepoName: this.generateRepoName(p.name)
          }))
        },
        lowPriority: {
          description: 'Simple projects to keep in collections or main hub',
          count: this.categorizedProjects.lowPriority.length,
          projects: this.categorizedProjects.lowPriority.map(p => ({
            name: p.name,
            path: p.path,
            complexity: p.analysis.complexity
          }))
        }
      },
      existingRepositories: this.projectsData.repositories.map(r => ({
        name: r.name,
        type: r.type,
        active: r.active
      })),
      recommendations: {
        immediateAction: [
          'Create repositories for all high-priority projects',
          'Set up GitHub Actions for automated syncing',
          'Configure GitHub Pages for each new repository',
          'Create standardized README templates'
        ],
        phasedRollout: [
          'Phase 1: High-priority projects (revenue-critical)',
          'Phase 2: Medium-priority projects (unique features)',
          'Phase 3: Organize low-priority into themed collections'
        ],
        maintenanceStrategy: [
          'Keep all source code in main hub repository',
          'Use subtree or submodule strategy for project repos',
          'Automated testing across all repositories',
          'Centralized dependency management'
        ]
      }
    };

    return manifest;
  }

  /**
   * Generate a GitHub-friendly repo name
   */
  generateRepoName(projectName) {
    return projectName
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  /**
   * Save manifest to file
   */
  async saveManifest(manifest) {
    const manifestPath = path.join(this.rootDir, 'project-organization-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`\n✓ Manifest saved to: project-organization-manifest.json`);
    return manifestPath;
  }

  /**
   * Generate repository template structure
   */
  async generateRepoTemplate(projectInfo) {
    const template = {
      name: this.generateRepoName(projectInfo.name),
      structure: {
        'index.html': `Project main file (copied from ${projectInfo.path})`,
        'README.md': 'Project-specific documentation',
        'package.json': 'Dependencies and scripts',
        '.github/workflows/deploy.yml': 'GitHub Pages deployment',
        'js/': 'Shared JavaScript libraries (synced from main hub)',
        'css/': 'Shared stylesheets (synced from main hub)',
        'src/': 'Shared utilities (synced from main hub)'
      },
      dependencies: projectInfo.analysis.externalDeps || [],
      githubPages: {
        enabled: true,
        branch: 'main',
        path: '/'
      },
      syncConfig: {
        source: 'barbrickdesign/barbrickdesign.github.io',
        syncPaths: [
          '/js/',
          '/css/',
          '/src/utils/'
        ]
      }
    };

    return template;
  }

  /**
   * Main execution
   */
  async run(command = 'analyze') {
    console.log('🚀 Project Organization System\n');
    console.log('════════════════════════════════════════════════════\n');

    try {
      // Load existing data
      await this.loadProjectsData();
      
      // Analyze projects
      await this.analyzeHTMLProjects();

      if (command === 'analyze' || command === 'manifest') {
        // Categorize projects
        await this.categorizeProjects();
        
        // Generate manifest
        const manifest = await this.generateManifest();
        await this.saveManifest(manifest);

        console.log('\n✅ Analysis complete!');
        console.log('\nNext steps:');
        console.log('  1. Review project-organization-manifest.json');
        console.log('  2. Run: node scripts/organize-projects.js generate');
        console.log('  3. Create repositories using GitHub API');
      }

      if (command === 'generate') {
        console.log('\n🏗️  Generating repository templates...\n');
        
        // Generate templates for high-priority projects
        const templates = [];
        for (const project of this.categorizedProjects.highPriority.slice(0, 5)) {
          const template = await this.generateRepoTemplate(project);
          templates.push(template);
          console.log(`  ✓ Template for: ${template.name}`);
        }

        // Save templates
        const templatesPath = path.join(this.rootDir, 'repo-templates.json');
        await fs.writeFile(templatesPath, JSON.stringify(templates, null, 2), 'utf-8');
        console.log(`\n✓ Templates saved to: repo-templates.json`);
      }

    } catch (error) {
      console.error('\n✗ Error:', error.message);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2] || 'analyze';
  const organizer = new ProjectOrganizer();
  organizer.run(command).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ProjectOrganizer;
