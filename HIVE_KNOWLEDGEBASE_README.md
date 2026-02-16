# Hive Knowledgebase - Repository Intelligence System

## Overview

The Hive Knowledgebase is an automated system that scans the entire repository and catalogs all projects, scripts, and technologies into a comprehensive, searchable database. This system powers the enhanced `autoval.html` autonomous orchestrator with deep repository intelligence.

## Features

### 📊 Comprehensive Scanning
- **247 HTML Projects**: All HTML files with titles, descriptions, and metadata
- **122 JavaScript Files**: All JS files with paths and documentation
- **7 Categories**: Organized into blockchain, ai-agents, gaming, general, dashboards, 3d-graphics, and ai-tools
- **8 Core Technologies**: Tracks agents, solana, ethereum, gaming, three.js, paypal, ai, and autonomous systems

### 🔍 Search & Filter
- **Real-time Search**: Search across project names, titles, and technologies
- **Category Filters**: Filter projects by category with one click
- **Technology Tags**: Visual tags showing all technologies used in each project

### 📈 Analytics Dashboard
- **Project Statistics**: Total counts of projects, scripts, and categories
- **Category Distribution**: Visual bar charts showing project distribution
- **Top Technologies**: Ranked view of most-used technologies
- **Technology Analysis**: Detailed breakdown of tech stack usage

### 🎯 Integration with Autoval
The knowledgebase is fully integrated with the autonomous orchestrator:
- Agents can discover and utilize existing projects
- Artifact intelligence for code reuse
- Technology stack awareness for better decision-making
- Category-based project recommendations

## File Structure

```
barbrickdesign.github.io/
├── hive-knowledgebase.json         # Generated knowledgebase (119KB)
├── autoval.html                     # Enhanced orchestrator with KB integration
├── autoval-enhanced.html            # Backup of enhanced version
└── HIVE_KNOWLEDGEBASE_README.md    # This file
```

## Knowledgebase Schema

The `hive-knowledgebase.json` file contains:

```json
{
  "metadata": {
    "scan_date": "ISO 8601 timestamp",
    "repository": "barbrickdesign/barbrickdesign.github.io",
    "total_html_files": 247,
    "total_js_files": 122,
    "categories": {
      "blockchain": 69,
      "ai-agents": 37,
      "gaming": 46,
      "general": 60,
      "dashboards": 10,
      "3d-graphics": 13,
      "ai-tools": 12
    }
  },
  "projects": [
    {
      "name": "filename.html",
      "title": "Project Title",
      "description": "Project description",
      "category": "blockchain",
      "technologies": ["solana", "agents", "three.js"],
      "url": "https://barbrickdesign.github.io/filename.html",
      "file_size": 36283,
      "last_modified": "ISO 8601 timestamp"
    }
  ],
  "scripts": [
    {
      "name": "script.js",
      "path": "path/to/script.js",
      "description": "Script description",
      "file_size": 23176,
      "last_modified": "ISO 8601 timestamp"
    }
  ],
  "technologies": {
    "agents": 82,
    "solana": 63,
    "ethereum": 54
  }
}
```

## Usage

### Accessing the Knowledgebase

Open the enhanced orchestrator:
```
https://barbrickdesign.github.io/autoval.html
```

### Navigating the Interface

1. **Overview Tab**: View statistics and distribution charts
2. **Projects Tab**: Browse, search, and filter all projects
3. **Scripts Tab**: View all JavaScript files in the repository
4. **Technologies Tab**: Analyze technology stack distribution

### Searching Projects

Use the search box to find projects:
- Search by filename: `poker`
- Search by title: `TRON POKER`
- Search by technology: `solana`

### Filtering by Category

Click any category button to filter:
- **All**: Show all 247 projects
- **blockchain**: 69 Web3 and crypto projects
- **ai-agents**: 37 autonomous agent systems
- **gaming**: 46 games and interactive experiences
- **general**: 60 utility and general-purpose projects
- **dashboards**: 10 management and monitoring dashboards
- **3d-graphics**: 13 Three.js and WebGL projects
- **ai-tools**: 12 AI-powered tools

## Regenerating the Knowledgebase

The knowledgebase can be regenerated at any time to reflect new projects:

```bash
cd /path/to/barbrickdesign.github.io
node << 'NODESCRIPT'
const fs = require('fs');
const path = require('path');

const knowledgebase = {
  metadata: {
    scan_date: new Date().toISOString(),
    repository: "barbrickdesign/barbrickdesign.github.io",
    total_html_files: 0,
    total_js_files: 0,
    categories: {}
  },
  projects: [],
  scripts: [],
  technologies: {}
};

// Scan HTML files
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
knowledgebase.metadata.total_html_files = htmlFiles.length;

htmlFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                     content.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    
    const title = titleMatch ? titleMatch[1].trim() : file.replace('.html', '');
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Detect technologies
    const techs = [];
    if (/three\.?js/i.test(content)) techs.push('three.js');
    if (/solana|phantom/i.test(content)) techs.push('solana');
    if (/ethereum|metamask|web3/i.test(content)) techs.push('ethereum');
    if (/paypal/i.test(content)) techs.push('paypal');
    if (/poker|casino|game/i.test(content)) techs.push('gaming');
    if (/\bai\b|gpt|llm/i.test(content)) techs.push('ai');
    if (/agent/i.test(content)) techs.push('agents');
    if (/autonomous/i.test(content)) techs.push('autonomous');
    
    // Categorize
    let category = 'general';
    if (techs.includes('gaming')) category = 'gaming';
    else if (techs.includes('solana') || techs.includes('ethereum')) category = 'blockchain';
    else if (techs.includes('three.js')) category = '3d-graphics';
    else if (techs.includes('agents') || techs.includes('autonomous')) category = 'ai-agents';
    else if (techs.includes('ai')) category = 'ai-tools';
    else if (/hub|dashboard/i.test(title)) category = 'dashboards';
    
    knowledgebase.projects.push({
      name: file,
      title,
      description,
      category,
      technologies: techs,
      url: `https://barbrickdesign.github.io/${file}`,
      file_size: fs.statSync(file).size,
      last_modified: fs.statSync(file).mtime.toISOString()
    });
    
    // Track technology usage
    techs.forEach(tech => {
      knowledgebase.technologies[tech] = (knowledgebase.technologies[tech] || 0) + 1;
    });
    
    // Track category
    knowledgebase.metadata.categories[category] = (knowledgebase.metadata.categories[category] || 0) + 1;
  } catch (e) {
    console.error(`Error processing ${file}: ${e.message}`);
  }
});

// Scan JS files
function scanJSFiles(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(prefix, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      scanJSFiles(fullPath, relativePath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        const firstComment = lines.slice(0, 10).find(l => l.includes('//') || l.includes('/*'));
        const description = firstComment ? firstComment.replace(/\/\/|\/\*|\*\//g, '').trim() : '';
        
        knowledgebase.scripts.push({
          name: entry.name,
          path: relativePath,
          description: description.substring(0, 200),
          file_size: fs.statSync(fullPath).size,
          last_modified: fs.statSync(fullPath).mtime.toISOString()
        });
        knowledgebase.metadata.total_js_files++;
      } catch (e) {
        // Skip files we can't read
      }
    }
  });
}

scanJSFiles('.');

// Save knowledgebase
fs.writeFileSync('hive-knowledgebase.json', JSON.stringify(knowledgebase, null, 2));
console.log(`✅ Knowledgebase created: ${knowledgebase.projects.length} projects, ${knowledgebase.scripts.length} scripts`);
NODESCRIPT
```

Or use the "Refresh Knowledgebase" button in the autoval.html interface.

## Technology Detection

The system automatically detects these technologies:
- **three.js**: 3D graphics and WebGL projects
- **solana**: Solana blockchain integration
- **ethereum**: Ethereum and EVM chains
- **paypal**: PayPal payment integration
- **gaming**: Games and interactive experiences
- **ai**: AI and machine learning features
- **agents**: Autonomous agent systems
- **autonomous**: Self-operating systems

## Benefits for Agents

The knowledgebase enables agents to:
1. **Discover Reusable Code**: Find existing implementations before building new ones
2. **Understand Tech Stack**: Know what technologies are available
3. **Learn from Examples**: Study similar projects for patterns
4. **Avoid Duplication**: Prevent creating redundant projects
5. **Intelligent Recommendations**: Suggest relevant projects to users
6. **Cross-Project Integration**: Combine features from multiple projects

## Future Enhancements

Planned features:
- [ ] Dependency graph visualization
- [ ] Code similarity analysis
- [ ] Automated project health scoring
- [ ] Integration with CI/CD pipelines
- [ ] Real-time project monitoring
- [ ] API endpoint for programmatic access
- [ ] Machine learning-based categorization
- [ ] Automated documentation generation

## Statistics (as of last scan)

- **Total Projects**: 247 HTML applications
- **Total Scripts**: 122 JavaScript files
- **Categories**: 7 distinct categories
- **Technologies**: 8 core technologies tracked
- **Repository Size**: ~119KB knowledgebase index
- **Scan Time**: < 5 seconds for full repository

## Contributing

To add metadata to your project for better categorization:

1. Add a descriptive `<title>` tag
2. Include a `<meta name="description">` tag
3. Use technology keywords in your HTML
4. Follow naming conventions for better discovery

Example:
```html
<head>
  <title>My Awesome Project — Solana NFT Minting</title>
  <meta name="description" content="A solana-based NFT minting platform with agent automation">
  <!-- Your content -->
</head>
```

## Support

For issues or questions:
- Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
- Live Demo: https://barbrickdesign.github.io/autoval.html

---

**Built with ❤️ by the Autonomous Agent Hive**
