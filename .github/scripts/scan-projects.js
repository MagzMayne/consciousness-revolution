#!/usr/bin/env node

/**
 * Scan Projects Script
 * Scans the repository for HTML project files and extracts metadata
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_FILE = path.join(REPO_ROOT, '.github/scripts/scanned-projects.json');

// Directories to exclude from scanning
const EXCLUDE_DIRS = [
  'node_modules',
  'vendor',
  '.git',
  '.github',
  'backend',
  'approvals',
  'Mandemos-v2-main',
  'ember-terminal',
  'mandem.os',
  'OSKeyMap'
];

// Files to exclude
const EXCLUDE_FILES = [
  'index.html',
  'test-',
  '.test',
  '-test',
  'example-',
  'demo-'
];

/**
 * Check if a path should be excluded
 */
function shouldExclude(filePath) {
  // Check if path contains any excluded directory
  for (const dir of EXCLUDE_DIRS) {
    if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
      return true;
    }
  }
  
  const fileName = path.basename(filePath);
  
  // Check if filename matches excluded patterns
  for (const pattern of EXCLUDE_FILES) {
    if (fileName.startsWith(pattern) || fileName.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Extract metadata from HTML file
 */
function extractMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Extract title
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : fileName.replace('.html', '');
    
    // Extract meta description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract meta keywords/tags
    const keywordsMatch = content.match(/<meta\s+name=["']keywords["']\s+content=["'](.*?)["']/i);
    const tags = keywordsMatch ? keywordsMatch[1].split(',').map(t => t.trim()) : [];
    
    // Try to infer category from filename or content
    const category = inferCategory(fileName, content);
    
    // Detect project status (working, partial, broken, untested)
    const status = detectProjectStatus(fileName, content);
    
    // Extract technologies used
    const technologies = detectTechnologies(content);
    
    // Check for interactive elements
    const hasInteractive = detectInteractiveFeatures(content);
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const relativePath = path.relative(REPO_ROOT, filePath);
    
    return {
      name: fileName.replace('.html', ''),
      fileName: fileName,
      path: relativePath.replace(/\\/g, '/'),
      title: title,
      description: description || `Interactive ${category} application`,
      category: category,
      tags: tags,
      status: status,
      technologies: technologies,
      hasInteractive: hasInteractive,
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
      size: stats.size
    };
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Infer category from filename and content
 */
function inferCategory(fileName, content) {
  const name = fileName.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Check for specific keywords
  if (name.includes('poker') || name.includes('game') || contentLower.includes('canvas') && contentLower.includes('game')) {
    return 'game';
  }
  if (name.includes('gem') || name.includes('bot') || name.includes('agent')) {
    return 'ai-tool';
  }
  if (name.includes('wallet') || name.includes('crypto') || name.includes('sol') || name.includes('nft')) {
    return 'blockchain';
  }
  if (name.includes('dashboard') || name.includes('admin') || name.includes('portal')) {
    return 'dashboard';
  }
  if (name.includes('scanner') || name.includes('detector') || name.includes('analyzer')) {
    return 'utility';
  }
  if (name.includes('3d') || name.includes('oasis') || contentLower.includes('three.js') || contentLower.includes('babylon')) {
    return '3d-experience';
  }
  if (name.includes('market') || name.includes('exchange') || name.includes('trade')) {
    return 'marketplace';
  }
  
  return 'web-app';
}

/**
 * Detect project status based on content markers
 */
function detectProjectStatus(fileName, content) {
  const contentLower = content.toLowerCase();
  
  // Check for status markers in content
  if (contentLower.includes('under construction') || contentLower.includes('coming soon')) {
    return 'partial';
  }
  if (contentLower.includes('broken') || contentLower.includes('not working')) {
    return 'broken';
  }
  if (fileName.includes('test-') || fileName.includes('-test')) {
    return 'untested';
  }
  
  // Check for basic functionality indicators
  const hasScript = content.includes('<script');
  const hasCanvas = content.includes('<canvas');
  const hasInteractiveElements = content.includes('onclick') || content.includes('addEventListener');
  
  if (hasScript && (hasCanvas || hasInteractiveElements)) {
    return 'working';
  }
  
  // Default to untested if we can't determine
  return 'untested';
}

/**
 * Detect technologies used in the project
 */
function detectTechnologies(content) {
  const techs = [];
  const contentLower = content.toLowerCase();
  
  // JavaScript frameworks and libraries
  if (contentLower.includes('react')) techs.push('React');
  if (contentLower.includes('vue')) techs.push('Vue');
  if (contentLower.includes('angular')) techs.push('Angular');
  if (contentLower.includes('three.js') || contentLower.includes('threejs')) techs.push('Three.js');
  if (contentLower.includes('babylon')) techs.push('Babylon.js');
  if (contentLower.includes('tensorflow')) techs.push('TensorFlow.js');
  if (contentLower.includes('web3')) techs.push('Web3');
  if (contentLower.includes('ethers')) techs.push('Ethers.js');
  if (contentLower.includes('solana')) techs.push('Solana Web3');
  if (contentLower.includes('paypal')) techs.push('PayPal');
  
  // HTML5 APIs
  if (content.includes('<canvas')) techs.push('Canvas');
  if (contentLower.includes('webgl')) techs.push('WebGL');
  if (contentLower.includes('websocket')) techs.push('WebSocket');
  if (contentLower.includes('localstorage') || contentLower.includes('sessionstorage')) techs.push('Web Storage');
  
  return techs;
}

/**
 * Detect interactive features
 */
function detectInteractiveFeatures(content) {
  const contentLower = content.toLowerCase();
  
  return (
    content.includes('onclick') ||
    content.includes('addEventListener') ||
    content.includes('<button') ||
    content.includes('<input') ||
    content.includes('<canvas') ||
    contentLower.includes('interactive') ||
    contentLower.includes('click') ||
    contentLower.includes('drag')
  );
}

/**
 * Get recently modified files from git
 */
function getRecentlyModifiedFiles() {
  try {
    // Get files changed in the last commit
    const output = execSync('git diff-tree --no-commit-id --name-only -r HEAD', {
      cwd: REPO_ROOT,
      encoding: 'utf8'
    });
    
    const files = output.split('\n')
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(REPO_ROOT, f));
    
    return files;
  } catch (error) {
    console.log('Could not get git history, scanning all files instead');
    return [];
  }
}

/**
 * Recursively find all HTML files
 */
function findHtmlFiles(dir) {
  const results = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (shouldExclude(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        results.push(...findHtmlFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning for HTML project files...\n');
  
  // Get recently modified files first
  const recentFiles = getRecentlyModifiedFiles();
  console.log(`📝 Found ${recentFiles.length} recently modified HTML files\n`);
  
  // Scan all HTML files
  const allFiles = findHtmlFiles(REPO_ROOT);
  console.log(`📁 Found ${allFiles.length} total HTML files in repository\n`);
  
  // Extract metadata
  const projects = [];
  const recentProjects = [];
  
  for (const file of allFiles) {
    const metadata = extractMetadata(file);
    if (metadata) {
      projects.push(metadata);
      
      // Mark recent projects
      if (recentFiles.some(rf => rf.includes(metadata.fileName))) {
        metadata.isNew = true;
        recentProjects.push(metadata);
      }
    }
  }
  
  // Sort by modified date (newest first)
  projects.sort((a, b) => new Date(b.modified) - new Date(a.modified));
  
  // Calculate statistics
  const stats = calculateStatistics(projects);
  
  const result = {
    scanDate: new Date().toISOString(),
    totalProjects: projects.length,
    recentProjects: recentProjects.length,
    statistics: stats,
    projects: projects
  };
  
  // Write results to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  
  console.log(`✅ Scan complete!`);
  console.log(`   Total projects: ${projects.length}`);
  console.log(`   Recent projects: ${recentProjects.length}`);
  console.log(`   Working: ${stats.byStatus.working}`);
  console.log(`   Partial: ${stats.byStatus.partial}`);
  console.log(`   Broken: ${stats.byStatus.broken}`);
  console.log(`   Untested: ${stats.byStatus.untested}`);
  console.log(`   Output: ${OUTPUT_FILE}\n`);
  
  // Print recent projects
  if (recentProjects.length > 0) {
    console.log('🆕 Recently added/updated projects:');
    for (const proj of recentProjects) {
      console.log(`   - ${proj.title} (${proj.fileName}) [${proj.status}]`);
    }
  }
}

/**
 * Calculate project statistics
 */
function calculateStatistics(projects) {
  const stats = {
    byStatus: { working: 0, partial: 0, broken: 0, untested: 0 },
    byCategory: {},
    totalInteractive: 0,
    topTechnologies: {}
  };
  
  for (const project of projects) {
    // Count by status
    if (stats.byStatus[project.status] !== undefined) {
      stats.byStatus[project.status]++;
    }
    
    // Count by category
    if (!stats.byCategory[project.category]) {
      stats.byCategory[project.category] = 0;
    }
    stats.byCategory[project.category]++;
    
    // Count interactive projects
    if (project.hasInteractive) {
      stats.totalInteractive++;
    }
    
    // Count technologies
    if (project.technologies) {
      for (const tech of project.technologies) {
        if (!stats.topTechnologies[tech]) {
          stats.topTechnologies[tech] = 0;
        }
        stats.topTechnologies[tech]++;
      }
    }
  }
  
  return stats;
}

// Run the script
main();
