# Autonomous README Update System

## Overview

This directory contains the automation scripts that keep the repository's README.md and projects.json automatically updated as new projects are added or modified.

## How It Works

The system runs automatically whenever HTML files are pushed to the main/master branch via the GitHub Actions workflow `.github/workflows/update-project-feed.yml`.

### Workflow Process

1. **Trigger**: Push to main/master branch with changes to `*.html` files
2. **Scan**: `scan-projects.js` scans all HTML files in the repository
3. **Update**: `update-projects-json.js` merges new/updated projects into `projects.json`
4. **Generate**: `update-readme.js` updates README.md with statistics and recent projects
5. **Commit**: Changes are automatically committed back to the repository

## Scripts

### 1. scan-projects.js

**Purpose**: Scans the entire repository for HTML project files and extracts comprehensive metadata.

**Features**:
- Recursively scans all directories (excluding node_modules, vendor, etc.)
- Extracts metadata from each HTML file:
  - Title from `<title>` tag
  - Description from `<meta name="description">` tag
  - Keywords/tags from `<meta name="keywords">` tag
  - Category inference (game, ai-tool, blockchain, dashboard, etc.)
  - Status detection (working, partial, broken, untested)
  - Technology detection (React, Three.js, Web3, PayPal, Canvas, etc.)
  - Interactive feature detection
  - File statistics (size, created, modified dates)

**Output**: `.github/scripts/scanned-projects.json`

**Usage**:
```bash
node .github/scripts/scan-projects.js
```

**Statistics Calculated**:
- Total projects count
- Status breakdown (working/partial/broken/untested)
- Projects by category
- Projects using interactive features
- Top technologies used

### 2. update-projects-json.js

**Purpose**: Merges scanned projects into the main `projects.json` file.

**Features**:
- Loads existing `projects.json`
- Merges new projects
- Updates existing projects if modified date is newer
- Generates list of recent projects (last 7 days)
- Updates metadata (total counts, last updated timestamp)

**Inputs**: 
- `.github/scripts/scanned-projects.json`
- `projects.json` (existing)

**Outputs**:
- `projects.json` (updated)
- `.github/scripts/recent-projects.json` (top 10 recent)

**Usage**:
```bash
node .github/scripts/update-projects-json.js
```

### 3. update-readme.js

**Purpose**: Updates README.md with statistics section and recent projects feed.

**Features**:
- Generates statistics section with:
  - Total projects and interactive count
  - Status breakdown with percentages
  - Top 5 categories with counts
  - Top 5 technologies with usage counts
  - Last scanned timestamp
- Generates recent projects section with:
  - Top 10 most recently modified projects
  - Category icons (🎮 🤖 💎 📊 🛠️ 🌐 💰 ✨)
  - Status icons (✅ ⚠️ 🔧 🧪)
  - Technology badges showing top 3 techs per project
  - Links to project files
  - Last updated timestamp
- Updates "Last Updated" timestamp at bottom of README

**Inputs**:
- `.github/scripts/recent-projects.json`
- `.github/scripts/scanned-projects.json`
- `README.md` (existing)

**Output**: `README.md` (updated)

**Usage**:
```bash
node .github/scripts/update-readme.js
```

## Category Icons

| Category | Icon | Example Projects |
|----------|------|------------------|
| game | 🎮 | Poker, interactive games |
| ai-tool | 🤖 | Bots, agents, AI systems |
| blockchain | 💎 | Wallets, NFTs, crypto tools |
| dashboard | 📊 | Admin panels, portals |
| utility | 🛠️ | Scanners, detectors, analyzers |
| 3d-experience | 🌐 | 3D visualizations, Three.js apps |
| marketplace | 💰 | Exchanges, trading platforms |
| web-app | ✨ | General web applications |

## Status Icons

| Status | Icon | Meaning |
|--------|------|---------|
| working | ✅ | Fully functional |
| partial | ⚠️ | Core features work |
| broken | 🔧 | Under repair |
| untested | 🧪 | Awaiting validation |

## Status Detection

The system automatically detects project status based on:

1. **Content markers**: Looks for phrases like "under construction", "coming soon", "broken", "not working"
2. **Filename patterns**: Test files (test-*, *-test) marked as untested
3. **Functionality indicators**:
   - Has `<script>` tag
   - Has `<canvas>` element
   - Has interactive elements (onclick, addEventListener)
   - If functional indicators present → "working"
   - Otherwise → "untested"

## Technology Detection

Automatically detects these technologies from HTML content:

**JavaScript Frameworks/Libraries**:
- React, Vue, Angular
- Three.js, Babylon.js
- TensorFlow.js
- Web3, Ethers.js, Solana Web3
- PayPal SDK

**HTML5 APIs**:
- Canvas
- WebGL
- WebSocket
- Web Storage (localStorage/sessionStorage)

## Excluded Directories

The scanner excludes these directories:
- `node_modules`
- `vendor`
- `.git`
- `.github`
- `backend`
- `approvals`
- `Mandemos-v2-main`
- `ember-terminal`
- `mandem.os`
- `OSKeyMap`

## Excluded Files

The scanner excludes these file patterns:
- `index.html` (main hub)
- `test-*` (test files)
- `*-test.html` (test files)
- `example-*` (example files)
- `demo-*` (demo files)

## Manual Usage

### Scan All Projects
```bash
cd /home/runner/work/barbrickdesign.github.io/barbrickdesign.github.io
node .github/scripts/scan-projects.js
```

### Update Projects JSON
```bash
node .github/scripts/update-projects-json.js
```

### Update README
```bash
node .github/scripts/update-readme.js
```

### Run Complete Update
```bash
node .github/scripts/scan-projects.js && \
node .github/scripts/update-projects-json.js && \
node .github/scripts/update-readme.js
```

## Automation Workflow

The GitHub Actions workflow (`.github/workflows/update-project-feed.yml`) automatically runs on:
- Push to main/master branch
- Changes to any `*.html` file
- Manual trigger (workflow_dispatch)

**Workflow Steps**:
1. Checkout repository
2. Setup Node.js 18
3. Run scan-projects.js
4. Run update-projects-json.js
5. Run update-readme.js
6. Commit changes with message: "🤖 Auto-update: New projects detected and added to feed [skip ci]"
7. Push changes back to repository

**Note**: The commit includes `[skip ci]` to prevent infinite loop of CI triggers.

## Output Files

| File | Purpose | Auto-Generated | Committed |
|------|---------|----------------|-----------|
| `.github/scripts/scanned-projects.json` | Full scan results with all metadata | Yes | Yes |
| `.github/scripts/recent-projects.json` | Top 10 recent projects for README | Yes | Yes |
| `projects.json` | Main project catalog | No (updated) | Yes |
| `README.md` | Main documentation | No (updated) | Yes |

## Customization

### Add New Category

1. Edit `scan-projects.js` in the `inferCategory()` function
2. Add your category logic:
```javascript
if (name.includes('your-keyword') || contentLower.includes('your-pattern')) {
  return 'your-category';
}
```
3. Add icon in `update-readme.js` in `getCategoryIcon()`:
```javascript
'your-category': '🎯',
```

### Add New Technology Detection

Edit `scan-projects.js` in the `detectTechnologies()` function:
```javascript
if (contentLower.includes('your-tech')) techs.push('Your Tech');
```

### Change Recent Projects Limit

Edit `update-projects-json.js` line 147:
```javascript
projects: recentProjects.slice(0, 10) // Change 10 to your desired number
```

### Change Recent Days Window

Edit `update-projects-json.js` line 143:
```javascript
const recentProjects = getRecentProjects(projectsData.html_projects, 7); // Change 7 to your desired days
```

## Troubleshooting

### README not updating after push

**Check**:
1. Does the workflow trigger show in Actions tab?
2. Are there actual changes to HTML files?
3. Check workflow logs for errors

**Solution**: Manually run the scripts locally and commit

### Projects not being detected

**Check**:
1. Is the HTML file in an excluded directory?
2. Does the filename match an excluded pattern?
3. Check `.github/scripts/scanned-projects.json` to see if it was scanned

**Solution**: Review exclusion rules in `scan-projects.js`

### Statistics showing wrong numbers

**Check**:
1. Run `scan-projects.js` locally to see console output
2. Check status detection logic in `detectProjectStatus()`
3. Verify HTML files have proper tags and content

**Solution**: Improve detection logic or add explicit status markers to HTML

### Duplicate entries in projects.json

**Check**: Look for projects with same `fileName` in `projects.json`

**Solution**: Run `update-projects-json.js` again - it will deduplicate by fileName

## Contributing

When adding new features to the automation:

1. Test scripts locally before committing
2. Update this README with changes
3. Ensure backward compatibility with existing data
4. Add error handling for edge cases
5. Update workflow if needed

## Support

For issues with the automation system:
- Check GitHub Actions workflow logs
- Review script console output when running locally
- Create an issue with error details and context
- Contact: BarbrickDesign@gmail.com

---

**Last Updated**: February 9, 2026
**Version**: 2.0
**Maintained by**: Ryan Barbrick (Barbrick Design)
