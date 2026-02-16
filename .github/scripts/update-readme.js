#!/usr/bin/env node

/**
 * Update README Script
 * Automatically updates README.md with recent projects feed
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const README_FILE = path.join(REPO_ROOT, 'README.md');
const RECENT_PROJECTS_FILE = path.join(REPO_ROOT, '.github/scripts/recent-projects.json');
const SCANNED_PROJECTS_FILE = path.join(REPO_ROOT, '.github/scripts/scanned-projects.json');

/**
 * Load recent projects data
 */
function loadRecentProjects() {
  try {
    const content = fs.readFileSync(RECENT_PROJECTS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading recent projects:', error.message);
    return { projects: [] };
  }
}

/**
 * Load scanned projects with statistics
 */
function loadScannedProjects() {
  try {
    const content = fs.readFileSync(SCANNED_PROJECTS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading scanned projects:', error.message);
    return null;
  }
}

/**
 * Format project for README
 */
function formatProject(project, index) {
  const icon = getCategoryIcon(project.category);
  const statusIcon = getStatusIcon(project.status);
  const date = new Date(project.modified).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const link = project.path.includes('/') 
    ? `[${project.title}](${project.path})`
    : `[${project.title}](${project.fileName})`;
  
  // Add status indicator and technologies
  let techBadges = '';
  if (project.technologies && project.technologies.length > 0) {
    const topTechs = project.technologies.slice(0, 3);
    techBadges = ` \`${topTechs.join('`, `')}\``;
  }
  
  return `${index + 1}. ${icon}${statusIcon} **${link}** - ${project.description}${techBadges} *(${date})*`;
}

/**
 * Get status icon
 */
function getStatusIcon(status) {
  const icons = {
    'working': '✅',
    'partial': '⚠️',
    'broken': '🔧',
    'untested': '🧪'
  };
  return icons[status] || '';
}

/**
 * Get icon for category
 */
function getCategoryIcon(category) {
  const icons = {
    'game': '🎮',
    'ai-tool': '🤖',
    'blockchain': '💎',
    'dashboard': '📊',
    'utility': '🛠️',
    '3d-experience': '🌐',
    'marketplace': '💰',
    'web-app': '✨'
  };
  
  return icons[category] || '📄';
}

/**
 * Generate statistics section for README
 */
function generateStatisticsSection(scannedData) {
  if (!scannedData || !scannedData.statistics) {
    return '';
  }
  
  const stats = scannedData.statistics;
  const total = scannedData.totalProjects;
  
  // Calculate percentages
  const workingPercent = Math.round((stats.byStatus.working / total) * 100);
  const partialPercent = Math.round((stats.byStatus.partial / total) * 100);
  const brokenPercent = Math.round((stats.byStatus.broken / total) * 100);
  const untestedPercent = Math.round((stats.byStatus.untested / total) * 100);
  
  // Get top 5 categories
  const topCategories = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => `${getCategoryIcon(cat)} ${cat}: ${count}`)
    .join(' | ');
  
  // Get top 5 technologies
  const topTechs = Object.entries(stats.topTechnologies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tech, count]) => `${tech} (${count})`)
    .join(', ');
  
  return `### 📊 Project Statistics (Auto-Updated)

**Total Projects**: ${total} | **Interactive**: ${stats.totalInteractive}

**Status Breakdown**:
- ✅ **${stats.byStatus.working} working** (${workingPercent}% - fully functional)
- ⚠️ **${stats.byStatus.partial} partial** (${partialPercent}% - core features work)
- 🔧 **${stats.byStatus.broken} broken** (${brokenPercent}% - under repair)
- 🧪 **${stats.byStatus.untested} untested** (${untestedPercent}% - awaiting validation)

**Top Categories**: ${topCategories}

**Top Technologies**: ${topTechs}

*Last scanned: ${new Date(scannedData.scanDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}*

---
`;
}

/**
 * Generate recent projects section
 */
function generateRecentProjectsSection(recentData) {
  const projects = recentData.projects;
  
  if (projects.length === 0) {
    return `### 📅 Recent Projects

*No recent updates in the last 7 days*

---
`;
  }
  
  const projectList = projects
    .slice(0, 10)
    .map((p, i) => formatProject(p, i))
    .join('\n');
  
  const updateTime = new Date(recentData.generated).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  return `### 📅 Recent Projects

**Live Feed** - Automatically updated when new projects are pushed! 🔴

${projectList}

*Last updated: ${updateTime}*

**[View All ${projects.length}+ Projects →](projects.json)**

---
`;
}

/**
 * Update README with statistics and recent projects sections
 */
function updateReadme(recentData, scannedData) {
  let readme = fs.readFileSync(README_FILE, 'utf8');
  
  // Generate new sections
  const statsSection = generateStatisticsSection(scannedData);
  const recentSection = generateRecentProjectsSection(recentData);
  
  // Update statistics section (before Recent Projects)
  if (statsSection) {
    const statsMarker = '### 📊 Project Statistics (Auto-Updated)';
    const statsIndex = readme.indexOf(statsMarker);
    
    if (statsIndex !== -1) {
      // Find the end of the stats section (next "---")
      const afterStatsStart = readme.indexOf('\n', statsIndex);
      const statsEndIndex = readme.indexOf('---', afterStatsStart);
      
      if (statsEndIndex !== -1) {
        // Replace existing section
        const beforeStats = readme.substring(0, statsIndex);
        const afterStats = readme.substring(readme.indexOf('\n', statsEndIndex) + 1);
        readme = beforeStats + statsSection + afterStats;
      }
    } else {
      // Stats section doesn't exist, add it before Recent Projects
      const recentMarker = '### 📅 Recent Projects';
      const recentIndex = readme.indexOf(recentMarker);
      
      if (recentIndex !== -1) {
        const beforeRecent = readme.substring(0, recentIndex);
        const afterRecent = readme.substring(recentIndex);
        readme = beforeRecent + statsSection + '\n' + afterRecent;
      }
    }
  }
  
  // Update recent projects section
  const startMarker = '### 📅 Recent Projects';
  const startIndex = readme.indexOf(startMarker);
  
  if (startIndex !== -1) {
    // Find the end of the section (next "---" after the start)
    const afterStart = readme.indexOf('\n', startIndex);
    const endIndex = readme.indexOf('---', afterStart);
    
    if (endIndex !== -1) {
      // Replace existing section
      const beforeSection = readme.substring(0, startIndex);
      const afterSection = readme.substring(readme.indexOf('\n', endIndex) + 1);
      readme = beforeSection + recentSection + afterSection;
    } else {
      // Couldn't find end marker, append at end
      readme += '\n\n' + recentSection;
    }
  } else {
    // Section doesn't exist, add it after "## 🎉 Recent Updates"
    const insertAfter = '## 🎉 Recent Updates';
    const insertIndex = readme.indexOf(insertAfter);
    
    if (insertIndex !== -1) {
      // Find the next section (starts with ##)
      const nextSection = readme.indexOf('\n##', insertIndex + insertAfter.length);
      
      if (nextSection !== -1) {
        // Insert before next section
        const beforeInsert = readme.substring(0, nextSection);
        const afterInsert = readme.substring(nextSection);
        readme = beforeInsert + '\n\n' + recentSection + '\n' + afterInsert;
      } else {
        // Append at end
        readme += '\n\n' + recentSection;
      }
    } else {
      // Just append at the end before "Last Updated"
      const lastUpdatedIndex = readme.lastIndexOf('*Last Updated:');
      if (lastUpdatedIndex !== -1) {
        const beforeLast = readme.substring(0, lastUpdatedIndex);
        const afterLast = readme.substring(lastUpdatedIndex);
        readme = beforeLast + recentSection + '\n' + afterLast;
      } else {
        readme += '\n\n' + recentSection;
      }
    }
  }
  
  // Update "Last Updated" timestamp
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  readme = readme.replace(
    /\*Last Updated:.*?\*/,
    `*Last Updated: ${timestamp}*`
  );
  
  return readme;
}

/**
 * Main function
 */
function main() {
  console.log('📝 Updating README.md with recent projects and statistics...\n');
  
  // Load recent projects
  const recentData = loadRecentProjects();
  
  // Load scanned projects with statistics
  const scannedData = loadScannedProjects();
  
  // Update README
  const updatedReadme = updateReadme(recentData, scannedData);
  
  // Save updated README
  fs.writeFileSync(README_FILE, updatedReadme);
  
  console.log(`✅ README.md updated successfully!`);
  console.log(`   Recent projects shown: ${Math.min(recentData.projects.length, 10)}`);
  if (scannedData && scannedData.statistics) {
    console.log(`   Total projects: ${scannedData.totalProjects}`);
    console.log(`   Working: ${scannedData.statistics.byStatus.working}`);
    console.log(`   Statistics section updated\n`);
  }
}

// Run the script
main();
