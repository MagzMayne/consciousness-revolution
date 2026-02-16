---
layout: default
title: FILE EVALUATION SYSTEM README
---

# File Evaluation System

A comprehensive automated system for analyzing and evaluating repository files, focusing on JavaScript, CSS, and configuration files while excluding HTML files from the main repository structure.

## Overview

The File Evaluation System is a set of specialized agents that work together to analyze code quality, identify unused files, check configuration compliance, and generate detailed reports with actionable recommendations.

## Components

### 1. JS/CSS Quality Agent (`src/agents/js-css-quality-agent.js`)

Reviews JavaScript and CSS files for:
- **Code Quality**: Coding standards, best practices, documentation
- **Performance**: File size, optimization opportunities, blocking operations
- **Security**: XSS vulnerabilities, hardcoded credentials, unsafe operations
- **Responsiveness**: Media queries, viewport settings, mobile compatibility
- **Browser Compatibility**: Vendor prefixes, feature detection

### 2. File Usage Agent (`src/agents/file-usage-agent.js`)

Identifies and analyzes:
- **Unused Files**: Files not referenced by any other files
- **Orphaned Files**: Files with no dependencies or references
- **Duplicate Content**: Files with identical or similar content
- **Large Files**: Files exceeding recommended size thresholds
- **Dependency Graph**: Complete file dependency mapping

### 3. Configuration Compliance Agent (`src/agents/config-compliance-agent.js`)

Checks configuration files for:
- **package.json**: Dependencies, scripts, security vulnerabilities
- **netlify.toml**: Deployment settings, security headers, caching
- **CircleCI**: Workflows, testing, caching strategies
- **.gitignore**: Essential exclusion patterns
- **Security Best Practices**: Hardcoded secrets, vulnerable packages

### 4. Report Generator Agent (`src/agents/report-generator-agent.js`)

Generates comprehensive reports including:
- **Executive Summary**: Overall health, key metrics, highlights
- **Detailed Analysis**: Issue breakdown by severity, type, and file
- **Recommendations**: Prioritized action items with impact assessment
- **Quality Metrics**: Overall scores and health indicators
- **Multiple Formats**: JSON, Markdown, and HTML reports

### 5. File Evaluation Orchestrator (`src/agents/file-evaluation-orchestrator.js`)

Coordinates all agents:
- Manages agent lifecycle and execution order
- Consolidates results from all agents
- Provides unified status and progress reporting
- Handles error recovery and logging

## Installation

No additional installation required. The system uses Node.js built-in modules and is compatible with the existing repository structure.

## Usage

### Basic Usage

Run the complete evaluation system:

```bash
node run-file-evaluation.js
```

### Command Line Options

```bash
# Show help
node run-file-evaluation.js --help

# Verbose output with detailed logging
node run-file-evaluation.js --verbose

# Quiet mode (minimal output)
node run-file-evaluation.js --quiet

# Export existing results only (skip analysis)
node run-file-evaluation.js --export-only
```

### Programmatic Usage

```javascript
const FileEvaluationOrchestrator = require('./src/agents/file-evaluation-orchestrator');

(async () => {
    const orchestrator = new FileEvaluationOrchestrator();
    
    await orchestrator.initialize();
    const results = await orchestrator.runCompleteEvaluation();
    
    console.log('Analysis complete:', results);
})();
```

### Using Individual Agents

```javascript
const JsCssQualityAgent = require('./src/agents/js-css-quality-agent');

const agent = new JsCssQualityAgent();
const results = await agent.analyzeAllFiles();

console.log('JS/CSS Analysis:', results);
```

## Output

### Report Locations

All reports are saved to the `./agent-reports/` directory:
- `report-[timestamp].json` - Machine-readable data
- `report-[timestamp].md` - Human-readable Markdown summary
- `report-[timestamp].html` - Interactive HTML report
- `evaluation-results-[timestamp].json` - Complete raw results

### Report Structure

**JSON Report:**
```json
{
  "metadata": { "generatedAt": "...", "repositoryName": "..." },
  "executiveSummary": { "overallHealth": "Good", "totalIssues": 42 },
  "codeQuality": { "javascript": [...], "css": [...] },
  "fileUsage": { "unusedFiles": [...], "duplicates": [...] },
  "configuration": { "packageJson": [...], "netlifyToml": [...] },
  "recommendations": [...],
  "actionItems": [...],
  "metrics": { "qualityScore": { "overall": 85 } }
}
```

## Features

### Exclusions

The system automatically excludes:
- HTML files in the main repository structure (as specified)
- `node_modules/` directory
- `.git/` directory
- `dist/` and `build/` directories
- `vendor/` directories
- Hidden files and directories

### File Types Analyzed

- **JavaScript**: `.js` files (including modules, libraries, and scripts)
- **CSS**: `.css` files (including stylesheets and themes)
- **JSON**: `package.json`, configuration files
- **TOML**: `netlify.toml` deployment configuration
- **YAML**: CircleCI configuration files

### Analysis Categories

1. **Critical Issues**: Security vulnerabilities, broken code, deployment blockers
2. **Warnings**: Performance issues, bad practices, missing configurations
3. **Suggestions**: Code improvements, optimizations, best practices

## Customization

### Adjusting Coding Standards

Edit `src/agents/js-css-quality-agent.js`:

```javascript
this.codingStandards = {
    js: {
        maxLineLength: 120,  // Adjust as needed
        maxFunctionLength: 50,
        maxFileSize: 500 * 1024,  // 500KB
        requireSemicolons: true,
        noConsoleLog: true
    },
    css: {
        maxFileSize: 200 * 1024,  // 200KB
        checkResponsiveness: true,
        checkBrowserPrefixes: true
    }
};
```

### Adding Custom Checks

Extend any agent by adding new methods:

```javascript
// In js-css-quality-agent.js
checkCustomRule(content, issues) {
    // Your custom logic
    if (someCondition) {
        issues.push({
            severity: 'warning',
            type: 'custom',
            message: 'Custom rule violation',
            suggestion: 'Fix suggestion'
        });
    }
}
```

## Integration

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .circleci/config.yml
- run:
    name: Run File Evaluation
    command: node run-file-evaluation.js --quiet
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
node run-file-evaluation.js --quiet
```

### NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "evaluate": "node run-file-evaluation.js",
    "evaluate:verbose": "node run-file-evaluation.js --verbose"
  }
}
```

## Troubleshooting

### Common Issues

**Issue**: "Cannot find module"
**Solution**: Ensure you're running from the repository root directory

**Issue**: "EACCES: permission denied"
**Solution**: Make the script executable: `chmod +x run-file-evaluation.js`

**Issue**: "Out of memory"
**Solution**: Increase Node.js memory: `node --max-old-space-size=4096 run-file-evaluation.js`

### Debugging

Enable verbose logging:
```bash
node run-file-evaluation.js --verbose
```

Check individual agent results:
```javascript
const results = await orchestrator.getResults();
console.log(results.codeQuality);  // Inspect specific agent results
```

## Performance

- **Small repositories** (<100 files): ~5-10 seconds
- **Medium repositories** (100-500 files): ~15-30 seconds
- **Large repositories** (500+ files): ~30-60 seconds

Performance depends on:
- Number of files to analyze
- File sizes
- System resources
- Disk I/O speed

## Security

The system:
- ✅ Does not execute any analyzed code
- ✅ Does not send data to external servers
- ✅ Only reads files (no modifications without explicit action)
- ✅ Detects hardcoded credentials and security issues
- ✅ Runs entirely locally

## Contributing

To extend the system:

1. Create a new agent in `src/agents/`
2. Implement the standard agent interface:
   - `constructor(logger)`
   - `async analyze*()` methods
   - `getResults()`
   - `getStatus()`
3. Add the agent to the orchestrator
4. Update this README with new features

## License

Same as the repository license (MIT).

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the generated reports for insights
3. Examine individual agent logs
4. File an issue in the repository

---

**Last Updated**: 2025-12-18
**Version**: 1.0.0
