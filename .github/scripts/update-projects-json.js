#!/usr/bin/env node

/**
 * Update Projects JSON Script
 * Updates projects.json with newly scanned projects
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const SCANNED_FILE = path.join(REPO_ROOT, '.github/scripts/scanned-projects.json');
const PROJECTS_JSON = path.join(REPO_ROOT, 'projects.json');

/**
 * Load existing projects.json
 */
function loadProjectsJson() {
  try {
    const content = fs.readFileSync(PROJECTS_JSON, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading projects.json:', error.message);
    // Return a default structure
    return {
      meta: {
        last_updated: new Date().toISOString(),
        total_repositories: 14,
        total_html_projects: 0,
        total_items: 0,
        last_simplified: new Date().toISOString(),
        simplification_version: "1.0"
      },
      repositories: [],
      html_projects: []
    };
  }
}

/**
 * Load scanned projects
 */
function loadScannedProjects() {
  try {
    const content = fs.readFileSync(SCANNED_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading scanned projects:', error.message);
    return null;
  }
}

/**
 * Merge scanned projects into projects.json
 */
function mergeProjects(projectsData, scannedData) {
  // Initialize html_projects array if it doesn't exist
  if (!projectsData.html_projects) {
    projectsData.html_projects = [];
  }
  
  // Create a map of existing projects by filename
  const existingMap = new Map();
  for (const proj of projectsData.html_projects) {
    if (proj.fileName) {
      existingMap.set(proj.fileName, proj);
    }
  }
  
  // Track statistics
  let newProjects = 0;
  let updatedProjects = 0;
  
  // Process scanned projects
  for (const scanned of scannedData.projects) {
    const existing = existingMap.get(scanned.fileName);
    
    if (existing) {
      // Update existing project if modified date is newer
      if (new Date(scanned.modified) > new Date(existing.modified || 0)) {
        Object.assign(existing, scanned);
        updatedProjects++;
      }
    } else {
      // Add new project
      projectsData.html_projects.push(scanned);
      newProjects++;
    }
  }
  
  // Sort by modified date (newest first)
  projectsData.html_projects.sort((a, b) => 
    new Date(b.modified) - new Date(a.modified)
  );
  
  // Update metadata
  if (!projectsData.meta) {
    projectsData.meta = {};
  }
  if (!projectsData.repositories) {
    projectsData.repositories = [];
  }
  
  projectsData.meta.last_updated = new Date().toISOString();
  projectsData.meta.total_html_projects = projectsData.html_projects.length;
  projectsData.meta.total_items = 
    projectsData.repositories.length + projectsData.html_projects.length;
  
  return { newProjects, updatedProjects };
}

/**
 * Get recent projects (added/updated in last 7 days)
 */
function getRecentProjects(projects, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return projects.filter(p => {
    const modDate = new Date(p.modified);
    return modDate > cutoffDate;
  });
}

/**
 * Main function
 */
function main() {
  console.log('📝 Updating projects.json...\n');
  
  // Load data
  const projectsData = loadProjectsJson();
  const scannedData = loadScannedProjects();
  
  if (!scannedData) {
    console.error('❌ No scanned projects found. Run scan-projects.js first.');
    process.exit(1);
  }
  
  // Merge projects
  const { newProjects, updatedProjects } = mergeProjects(projectsData, scannedData);
  
  // Save updated projects.json
  fs.writeFileSync(
    PROJECTS_JSON,
    JSON.stringify(projectsData, null, 2)
  );
  
  // Also save a recent projects file for the README
  const recentProjects = getRecentProjects(projectsData.html_projects, 7);
  const recentData = {
    generated: new Date().toISOString(),
    projects: recentProjects.slice(0, 10) // Top 10 most recent
  };
  
  fs.writeFileSync(
    path.join(REPO_ROOT, '.github/scripts/recent-projects.json'),
    JSON.stringify(recentData, null, 2)
  );
  
  console.log(`✅ projects.json updated successfully!`);
  console.log(`   New projects added: ${newProjects}`);
  console.log(`   Projects updated: ${updatedProjects}`);
  console.log(`   Total HTML projects: ${projectsData.meta.total_html_projects}`);
  console.log(`   Recent projects (7 days): ${recentProjects.length}\n`);
  
  // Print new projects
  if (newProjects > 0) {
    console.log('🆕 New projects added:');
    const newOnes = projectsData.html_projects
      .filter(p => p.isNew)
      .slice(0, 5);
    for (const proj of newOnes) {
      console.log(`   - ${proj.title} (${proj.fileName})`);
    }
  }
}

// Run the script
main();
