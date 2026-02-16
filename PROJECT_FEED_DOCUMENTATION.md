# Project Feed System Documentation

## Overview

The Barbrick Design website features a live project feed ticker at the top of the homepage that displays the most recently added or updated projects. This document explains how the system works and how to ensure new projects appear first.

## System Components

### 1. Live Project Feed (`js/live-project-feed.js`)

**Purpose**: Displays a scrolling ticker of recent projects at the top of the page

**Key Features**:
- Automatically fetches project data from `projects.json`
- Sorts projects by `lastModified` date (newest first)
- Shows top 20 most recent projects
- Displays "NEW" badge for projects added/updated in the last 7 days
- Auto-refreshes every 30 seconds
- Smooth scrolling animation

**Configuration**:
```javascript
const CONFIG = {
  refreshInterval: 30000,  // Refresh every 30 seconds
  animationSpeed: 50,      // Pixels per second for scrolling
  maxProjects: 20,         // Maximum number of projects to show
  autoStart: true          // Start automatically on page load
};
```

### 2. Project Scanner (`scan-projects.js`)

**Purpose**: Scans all HTML files in the repository and generates `projects.json`

**Key Features**:
- Recursively scans all HTML files
- Extracts metadata (title, description, category)
- Uses file modification time for `lastModified` date
- Preserves existing dates when re-scanning (prevents all projects from getting same timestamp)
- Sorts projects by `lastModified` date (newest first) in output
- Excludes test files, backups, and specific directories

**Usage**:
```bash
node scan-projects.js
```

**Output**: Creates/updates `projects.json` with:
- Meta information (last_updated, total_projects, categories)
- Category summary (project count per category)
- Projects array (sorted by lastModified date, newest first)

### 3. Projects JSON (`projects.json`)

**Structure**:
```json
{
  "meta": {
    "last_updated": "2026-02-09T23:02:13.365Z",
    "total_projects": 532,
    "scanner_version": "1.1.0",
    "categories": 16,
    "note": "Projects sorted by lastModified date (newest first) for live feed"
  },
  "category_summary": {
    "Blockchain & Crypto": 179,
    "Miscellaneous": 113,
    ...
  },
  "projects": [
    {
      "filename": "quantum-enhancement.html",
      "path": "quantum-enhancement.html",
      "title": "Quantum Enhancement Layer",
      "description": "Advanced quantum algorithms...",
      "category": "AI & Machine Learning",
      "tags": ["ai", "quantum", "algorithms"],
      "url": "/quantum-enhancement.html",
      "active": true,
      "lastModified": "2026-02-09T22:59:34.612Z"
    },
    ...
  ]
}
```

### 4. GitHub Actions Workflow (`.github/workflows/update-project-feed.yml`)

**Purpose**: Automatically updates the project feed when HTML files are pushed to the repository

**Triggers**:
- Push to `main` or `master` branch
- Only when `.html` files are modified
- Manual workflow dispatch

**Process**:
1. Scans repository for HTML files
2. Updates `projects.json` with new/modified projects
3. Commits changes back to repository
4. Updates README with recent projects

## How New Projects Appear First

### Automatic Process

When you push a new HTML project to the repository:

1. **File Creation**: New HTML file is added to repository
2. **GitHub Actions**: `update-project-feed.yml` workflow triggers automatically
3. **Scanner Runs**: Detects new HTML file, extracts metadata
4. **Date Assignment**: Uses file modification time for `lastModified`
5. **JSON Update**: `projects.json` is updated with new project sorted by date
6. **Feed Refresh**: Live ticker automatically fetches updated data and displays newest project first

### Manual Process

If you need to manually update the feed:

```bash
# 1. Run the scanner
node scan-projects.js

# 2. Commit the updated projects.json
git add projects.json
git commit -m "Update project feed with new projects"
git push

# 3. The live feed will automatically fetch the updated data
```

## Ensuring Projects Show as "NEW"

Projects display a "NEW" badge if they were added/modified within the last 7 days. This is determined by:

```javascript
function isRecentProject(modifiedDate) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(modifiedDate) > sevenDaysAgo;
}
```

## Troubleshooting

### Problem: New project doesn't show first in feed

**Solution 1**: Check if `lastModified` date is set correctly
```bash
jq '.projects[] | select(.filename=="your-project.html") | {title, lastModified}' projects.json
```

**Solution 2**: Re-run scanner to update dates
```bash
node scan-projects.js
```

**Solution 3**: Manually update the date in projects.json
```json
{
  "filename": "your-project.html",
  ...
  "lastModified": "2026-02-09T23:00:00.000Z"  // Use current date/time
}
```

### Problem: All projects have the same date

**Cause**: This happens when files are cloned/checked out at the same time

**Solution**: The improved scanner now preserves existing dates. When you add a NEW project, it will have a newer date than existing ones.

### Problem: Feed not updating on website

**Solution 1**: Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)

**Solution 2**: Check if projects.json was actually updated
```bash
jq '.meta.last_updated' projects.json
```

**Solution 3**: Verify the live feed is loading correctly (check browser console)

## Best Practices

1. **Always run scanner after adding projects**:
   ```bash
   node scan-projects.js
   git add projects.json
   git commit -m "Add new project: Your Project Name"
   git push
   ```

2. **Use descriptive titles**: Extract from HTML `<title>` tag
   ```html
   <title>Your Amazing Project - Barbrick Design</title>
   ```

3. **Add meta descriptions**: Helps with categorization
   ```html
   <meta name="description" content="A blockchain game with NFT integration">
   ```

4. **Follow naming conventions**: Use kebab-case for filenames
   ```
   ✅ quantum-enhancement.html
   ❌ QuantumEnhancement.html
   ❌ quantum_enhancement.html
   ```

5. **Don't modify dates manually**: Let the scanner handle it automatically

## Testing

To test the feed locally:

1. Start a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

2. Open browser to `http://localhost:8000`

3. Check browser console for feed logs:
   ```
   [Project Feed] Loaded 20 projects, newest: "Your Project" (2026-02-09T23:00:00.000Z)
   ```

4. Verify ticker is scrolling and showing projects in correct order

## Maintenance

### Weekly Check
- Verify all recent projects appear in feed
- Check for any broken links
- Review category distribution

### Monthly Update
- Run scanner to catch any missed projects
- Review and update project descriptions
- Archive old test/demo files

### When Issues Occur
1. Check GitHub Actions workflow status
2. Review scanner output for errors
3. Verify projects.json structure is valid
4. Test live feed in browser console

## Contact

For issues or questions about the project feed system:
- **Creator**: Ryan Barbrick
- **Email**: BarbrickDesign@gmail.com
- **Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io

---

Last Updated: 2026-02-09
Version: 1.1.0
