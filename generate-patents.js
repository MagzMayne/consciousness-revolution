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
 * File: generate-patents.js
 * Declaration ID: IP-68B9369C-MLL28ZUZ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Automated Provisional Patent Generation System
 * Created by: Ryan Barbrick / Barbrick Design
 * Purpose: Automatically generate provisional patent applications for all ideas
 * Contact: BarbrickDesign@gmail.com
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, 'docs/patents/registry/patent-registry.json');
const TEMPLATE_PATH = path.join(__dirname, 'docs/patents/templates/provisional-patent-template.md');
const OUTPUT_DIR = path.join(__dirname, 'docs/patents/generated');

/**
 * Generate a unique patent application ID
 */
function generatePatentId() {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  return `US-PROV-${year}-RB-${timestamp}`;
}

/**
 * Load the patent registry
 */
function loadRegistry() {
  try {
    const data = fs.readFileSync(REGISTRY_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading registry:', error.message);
    return {
      metadata: {
        version: "1.0.0",
        inventor: "Ryan Barbrick",
        contact: "BarbrickDesign@gmail.com",
        organization: "Barbrick Design",
        lastUpdated: new Date().toISOString(),
        totalPatents: 0,
        autoGenerationEnabled: true
      },
      patents: []
    };
  }
}

/**
 * Save the patent registry
 */
function saveRegistry(registry) {
  registry.metadata.lastUpdated = new Date().toISOString();
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log(`✅ Registry updated: ${registry.metadata.totalPatents} total patents`);
}

/**
 * Load the patent template
 */
function loadTemplate() {
  try {
    return fs.readFileSync(TEMPLATE_PATH, 'utf8');
  } catch (error) {
    console.error('Error loading template:', error.message);
    process.exit(1);
  }
}

/**
 * Replace template variables with actual values
 */
function fillTemplate(template, data) {
  let result = template;
  
  // Replace all template variables
  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = data[key] || `[To be determined: ${key}]`;
    result = result.split(placeholder).join(value);
  });
  
  return result;
}

/**
 * Extract project information from file or directory
 */
function extractProjectInfo(projectPath) {
  const basename = path.basename(projectPath, path.extname(projectPath));
  const stats = fs.existsSync(projectPath) ? fs.statSync(projectPath) : null;
  
  return {
    name: basename,
    path: projectPath,
    created: stats ? stats.birthtime.toISOString() : new Date().toISOString(),
    modified: stats ? stats.mtime.toISOString() : new Date().toISOString()
  };
}

/**
 * Generate a provisional patent application
 */
function generateProvisionalPatent(ideaData) {
  const applicationId = generatePatentId();
  const filingDate = new Date().toISOString().split('T')[0];
  
  const template = loadTemplate();
  
  // Prepare template data
  const templateData = {
    APPLICATION_ID: applicationId,
    FILING_DATE: filingDate,
    INVENTION_TITLE: ideaData.title || 'Unnamed Invention',
    RELATED_APPLICATIONS: ideaData.relatedApplications || 'None',
    FIELD_OF_INVENTION: ideaData.field || 'Computer Software and Web Technologies',
    PRIOR_ART: ideaData.priorArt || 'Various existing systems in the field of web development and software engineering.',
    EXISTING_PROBLEMS: ideaData.existingProblems || 'Current solutions lack the innovation and efficiency provided by this invention.',
    INVENTION_SUMMARY: ideaData.summary || 'This invention provides a novel approach to solving technical problems in software development.',
    KEY_FEATURES: ideaData.keyFeatures || '- Innovative architecture\n- Efficient implementation\n- User-friendly interface\n- Scalable design',
    TECHNICAL_ADVANTAGES: ideaData.technicalAdvantages || '- Improved performance\n- Better resource utilization\n- Enhanced user experience\n- Reduced complexity',
    COMMERCIAL_APPLICATIONS: ideaData.commercialApplications || '- Web applications\n- Mobile applications\n- Enterprise software\n- Educational platforms',
    DETAILED_OVERVIEW: ideaData.detailedOverview || 'This invention comprises a comprehensive system designed to address specific technical challenges in the field.',
    TECHNICAL_IMPLEMENTATION: ideaData.technicalImplementation || 'The implementation uses modern web technologies including HTML, CSS, JavaScript, and related frameworks.',
    SYSTEM_ARCHITECTURE: ideaData.systemArchitecture || 'The system follows a modular architecture with clear separation of concerns.',
    KEY_COMPONENTS: ideaData.keyComponents || '- User interface layer\n- Business logic layer\n- Data access layer\n- Integration layer',
    ALGORITHMS_METHODS: ideaData.algorithmsMethods || 'Novel algorithms and methods are employed to achieve optimal performance and user experience.',
    DATA_STRUCTURES: ideaData.dataStructures || 'Efficient data structures are used to manage information and state.',
    USER_INTERFACE: ideaData.userInterface || 'The user interface is designed for intuitive interaction and accessibility.',
    INTEGRATION_POINTS: ideaData.integrationPoints || 'The system integrates with various third-party services and APIs.',
    INDEPENDENT_CLAIMS: ideaData.independentClaims || '1. A computer-implemented method comprising novel features as described herein.',
    DEPENDENT_CLAIMS: ideaData.dependentClaims || '2. The method of claim 1, wherein additional features enhance functionality.',
    ABSTRACT: ideaData.abstract || 'A novel system and method for improving software development and deployment processes.',
    DRAWINGS_DESCRIPTION: ideaData.drawingsDescription || 'Screenshots and architectural diagrams available in the source repository.',
    EXAMPLE_1_TITLE: 'Basic Implementation',
    EXAMPLE_1_DESCRIPTION: ideaData.example1 || 'A basic implementation demonstrating the core functionality of the invention.',
    EXAMPLE_2_TITLE: 'Advanced Usage',
    EXAMPLE_2_DESCRIPTION: ideaData.example2 || 'An advanced implementation showcasing additional features and capabilities.',
    EXAMPLE_3_TITLE: 'Enterprise Integration',
    EXAMPLE_3_DESCRIPTION: ideaData.example3 || 'Integration with enterprise systems and workflows.',
    INDUSTRIAL_APPLICABILITY: ideaData.industrialApplicability || 'This invention has broad applicability across various industries including technology, education, and commerce.',
    ADVANTAGES: ideaData.advantages || '- Superior performance\n- Enhanced reliability\n- Better user experience\n- Lower operational costs',
    VARIATIONS: ideaData.variations || 'Various modifications and variations are possible while maintaining the core innovative aspects of the invention.',
    CONCLUSION: ideaData.conclusion || 'This invention represents a significant advancement in the field and provides substantial benefits over existing solutions.',
    REPO_URL: ideaData.repoUrl || 'https://github.com/barbrickdesign/barbrickdesign.github.io',
    IMPLEMENTATION_FILES: ideaData.implementationFiles || 'Available in the source repository',
    DOCUMENTATION_LINKS: ideaData.documentationLinks || 'See README.md and related documentation files',
    RELATED_PROJECTS: ideaData.relatedProjects || 'Part of the Barbrick Design portfolio'
  };
  
  const patentDocument = fillTemplate(template, templateData);
  
  // Save the patent document
  const filename = `${applicationId}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, patentDocument);
  
  // Create registry entry
  const registryEntry = {
    applicationId: applicationId,
    title: ideaData.title || 'Unnamed Invention',
    filingDate: filingDate,
    status: 'provisional',
    inventor: 'Ryan Barbrick',
    filepath: filepath,
    sourceProject: ideaData.sourceProject || 'Unknown',
    tags: ideaData.tags || [],
    description: ideaData.description || '',
    created: new Date().toISOString()
  };
  
  return { document: patentDocument, entry: registryEntry, filepath };
}

/**
 * Scan repository for projects that need patents
 */
function scanRepositoryForIdeas() {
  const ideas = [];
  const rootDir = __dirname;
  
  // Scan for HTML project files
  const htmlFiles = fs.readdirSync(rootDir)
    .filter(file => file.endsWith('.html') && !file.startsWith('.') && !file.startsWith('test-'));
  
  htmlFiles.forEach(file => {
    const projectInfo = extractProjectInfo(path.join(rootDir, file));
    ideas.push({
      title: projectInfo.name.replace(/([A-Z])/g, ' $1').trim(),
      sourceProject: file,
      description: `Web application: ${projectInfo.name}`,
      tags: ['web-app', 'html', 'javascript']
    });
  });
  
  return ideas;
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Barbrick Design Automated Patent System');
  console.log('==========================================');
  console.log('Inventor: Ryan Barbrick');
  console.log('Contact: BarbrickDesign@gmail.com\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Load registry
  const registry = loadRegistry();
  console.log(`📋 Current registry: ${registry.metadata.totalPatents} patents\n`);
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node generate-patents.js --scan          # Scan and generate patents for all projects');
    console.log('  node generate-patents.js --idea "Title"  # Generate patent for specific idea');
    console.log('  node generate-patents.js --list          # List all registered patents');
    return;
  }
  
  if (args[0] === '--scan') {
    console.log('🔍 Scanning repository for patentable ideas...\n');
    const ideas = scanRepositoryForIdeas();
    console.log(`Found ${ideas.length} potential ideas\n`);
    
    let newPatents = 0;
    ideas.forEach((idea, index) => {
      // Check if already patented
      const existing = registry.patents.find(p => p.sourceProject === idea.sourceProject);
      if (existing) {
        console.log(`⏭️  Skipping ${idea.title} (already patented: ${existing.applicationId})`);
        return;
      }
      
      console.log(`📝 Generating patent ${index + 1}/${ideas.length}: ${idea.title}`);
      const result = generateProvisionalPatent(idea);
      registry.patents.push(result.entry);
      registry.metadata.totalPatents = registry.patents.length;
      console.log(`   ✅ Created: ${result.entry.applicationId}`);
      console.log(`   📄 File: ${path.basename(result.filepath)}\n`);
      newPatents++;
    });
    
    if (newPatents > 0) {
      saveRegistry(registry);
      console.log(`\n✨ Generated ${newPatents} new provisional patents!`);
    } else {
      console.log('\n✅ All projects already have provisional patents.');
    }
  }
  
  else if (args[0] === '--idea' && args[1]) {
    const ideaTitle = args[1];
    console.log(`📝 Generating patent for: ${ideaTitle}\n`);
    
    const ideaData = {
      title: ideaTitle,
      description: `Custom idea: ${ideaTitle}`,
      sourceProject: 'manual-entry',
      tags: ['custom']
    };
    
    const result = generateProvisionalPatent(ideaData);
    registry.patents.push(result.entry);
    registry.metadata.totalPatents = registry.patents.length;
    saveRegistry(registry);
    
    console.log(`✅ Patent generated successfully!`);
    console.log(`   Application ID: ${result.entry.applicationId}`);
    console.log(`   File: ${result.filepath}\n`);
  }
  
  else if (args[0] === '--list') {
    console.log('📋 Registered Patents:\n');
    registry.patents.forEach((patent, index) => {
      console.log(`${index + 1}. ${patent.applicationId}`);
      console.log(`   Title: ${patent.title}`);
      console.log(`   Filed: ${patent.filingDate}`);
      console.log(`   Status: ${patent.status}`);
      console.log(`   Source: ${patent.sourceProject}\n`);
    });
    console.log(`Total: ${registry.patents.length} patents`);
  }
  
  console.log('\n✅ Done!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateProvisionalPatent,
  loadRegistry,
  saveRegistry
};
