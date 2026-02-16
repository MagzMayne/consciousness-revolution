---
layout: default
title: SIGNATURE SYSTEM README
---

# 🔐 MeRLynn & AGenTR Signature System

## Overview

The MeRLynn & AGenTR Signature System is a comprehensive solution for signing, tracking, and verifying scripts across networks. This system enables you to:

- **Sign scripts** with unique MeRLynn and AGenTR signatures
- **Track usage** of scripts across networks and repositories
- **Verify authenticity** of signed scripts
- **Crawl networks** to discover links and signatures
- **Generate reports** on signature usage and link distribution

## Quick Start

### 1. Interactive Dashboard

Open the signature management dashboard in your browser:

```bash
# Simply open this file in a browser
open signature-network-dashboard.html
```

Features:
- 📊 Real-time statistics
- ✍️ Batch signing operations
- 🌐 Network crawling
- 📥 Export results as JSON

### 2. Command Line Tools

#### Sign Repository Files

```bash
# Dry run (preview what will be signed)
npm run sign:dry-run

# Sign all unsigned files
npm run sign

# Force re-signing of all files (including already signed)
npm run sign:force
```

#### Crawl Network Links

```bash
# Crawl and generate report
npm run crawl

# Specify custom output file
npm run crawl:output custom-report.json
```

## System Components

### 1. Signature System (`src/utils/signature-system.js`)

Core signature generation and verification module.

**Features:**
- Generate MeRLynn signatures
- Generate AGenTR signatures
- Verify existing signatures
- Extract signatures from content
- Calculate content hashes

**Example Usage:**
```javascript
const signatureSystem = new SignatureSystem();

// Sign a script
const signatures = signatureSystem.signScript(scriptContent);
console.log(signatures.merlynn.signatureId); // MERLYNN-abc123...
console.log(signatures.agentr.signatureId);  // AGENTR-def456...

// Add signatures to script
const signedScript = signatureSystem.addSignaturesToScript(scriptContent);

// Verify signatures
const verification = signatureSystem.verifySignature(signedScript);
console.log(verification.isBothSigned); // true
```

### 2. Network Crawler Agent (`src/agents/network-crawler-agent.js`)

Autonomous agent that crawls files to discover links and signatures.

**Features:**
- Scan multiple files simultaneously
- Extract all types of links (internal, external, assets)
- Find and catalog signatures
- Generate comprehensive statistics
- Create detailed reports

**Example Usage:**
```javascript
const crawler = new NetworkCrawlerAgent(logger, signatureSystem);

// Crawl files
const results = await crawler.crawl(files);

// Get report
const report = crawler.generateReport();
console.log(report.summary.totalLinksFound);
```

### 3. Signature Management Agent (`src/agents/signature-management-agent.js`)

Agent for managing batch signing and verification operations.

**Features:**
- Sign single or multiple files
- Batch verification
- Skip already-signed files
- Force re-signing
- Generate operation reports

**Example Usage:**
```javascript
const manager = new SignatureManagementAgent(logger, signatureSystem);

// Sign a file
const result = manager.signFile(file);

// Batch sign multiple files
const batchResults = manager.batchSign(files);

// Verify signatures
const verification = manager.verifyFile(file);
```

## Signature Format

Each signature contains:
- **Agent identifier**: MeRLynn or AGenTR
- **Unique signature ID**: Format `MERLYNN-abc123` or `AGENTR-def456`
- **Timestamp**: ISO 8601 format
- **Content hash**: SHA-like hash of the content

Example:
```javascript
/** SIGNED BY MeRLynn - ID: MERLYNN-1a2b3c4d - TIMESTAMP: 2025-12-19T05:46:00.000Z - HASH: 5e6f7a8b */
/** SIGNED BY AGenTR - ID: AGENTR-9c8d7e6f - TIMESTAMP: 2025-12-19T05:46:00.000Z - HASH: 5e6f7a8b */
```

## Use Cases

### 1. Track Script Usage

Sign all your scripts to track where they are used across networks:

```bash
npm run sign
npm run crawl
```

This will:
1. Add signatures to all JavaScript files
2. Crawl the network to find all links
3. Generate a report showing where your scripts are referenced

### 2. Verify Script Authenticity

Check if a script has been signed by MeRLynn and AGenTR:

```javascript
const verification = signatureSystem.verifySignature(scriptContent);

if (verification.isBothSigned) {
    console.log('✅ Script is authenticated');
    console.log('MeRLynn ID:', verification.merlynn.signatureId);
    console.log('AGenTR ID:', verification.agentr.signatureId);
}
```

### 3. Monitor Script Distribution

Use the dashboard to:
- See how many files are signed
- Track signature distribution
- Identify unsigned files
- Monitor link propagation

### 4. Generate Audit Reports

Export comprehensive reports for compliance or analysis:

```javascript
// In the dashboard, click "Export Results"
// Or via command line:
npm run crawl:output audit-report-$(date +%Y%m%d).json
```

## Command Line Scripts

### `sign-repository-files.js`

Signs all JavaScript files in the repository.

**Options:**
- `--dry-run`: Preview without making changes
- `--force`: Re-sign already signed files

**Output:**
- Shows progress of signing operation
- Lists signed, skipped, and error files
- Provides summary statistics

### `crawl-network-links.js`

Crawls all files to discover links and signatures.

**Options:**
- `--output <file>`: Specify custom output file (default: `network-crawl-report.json`)

**Output:**
- JSON report with all findings
- Statistics on links and signatures
- Top external domains
- File categorization

## Dashboard Features

### Statistics Panel
- Files scanned count
- Signatures found count
- Links discovered count
- Percentage of signed files

### Signing Operations
- Scan repository button
- Sign all files button
- Verify signatures button
- Progress indicator

### Network Crawling
- Start crawl button
- Filter links (all/internal/external)
- Export results button
- Clear results button

### Real-time Logs
- All operations logged
- Color-coded by severity
- Auto-scroll to latest
- Persistent across operations

## File Locations

```
Repository Root/
├── signature-network-dashboard.html     # Main dashboard
├── sign-repository-files.js            # CLI signing tool
├── crawl-network-links.js              # CLI crawling tool
├── src/
│   ├── utils/
│   │   └── signature-system.js         # Core signature module
│   └── agents/
│       ├── network-crawler-agent.js    # Network crawler
│       └── signature-management-agent.js # Signature manager
└── network-crawl-report.json           # Generated report (after crawl)
```

## Configuration

### Excluded Directories

The following directories are excluded from signing/crawling:
- `node_modules`
- `.git`
- `dist`
- `build`
- `.vscode`
- `.tours`

### File Patterns

**Signed:**
- `.js` files
- `.mjs` files

**Crawled:**
- `.js`, `.mjs` files
- `.html`, `.htm` files
- `.css` files
- `.json` files
- `.md` files

## Integration

### With Existing Systems

The signature system integrates with:
- **Agent Management System**: Uses existing logger
- **MerlinHive**: Can be orchestrated by Merlin agents
- **Deployment Systems**: Automatically sign on deployment

### Browser Usage

```html
<script src="src/agents/agent-logger.js"></script>
<script src="src/utils/signature-system.js"></script>
<script src="src/agents/network-crawler-agent.js"></script>
<script src="src/agents/signature-management-agent.js"></script>

<script>
    const logger = new AgentLogger();
    const signatureSystem = new SignatureSystem();
    const crawler = new NetworkCrawlerAgent(logger, signatureSystem);
</script>
```

### Node.js Usage

```javascript
const SignatureSystem = require('./src/utils/signature-system.js');
const signatureSystem = new SignatureSystem();

// Use in your scripts
const signed = signatureSystem.signScript(content);
```

## Security

- **Content Hashing**: Each signature includes a hash of the content
- **Timestamp Verification**: Signatures include ISO 8601 timestamps
- **Unique IDs**: Each signature has a unique identifier
- **Immutable**: Once signed, modifications will be detectable

## Troubleshooting

### Issue: Files not getting signed

**Solution:** Check that:
1. Files match the signing patterns (`.js`, `.mjs`)
2. Files are not in excluded directories
3. You're not in dry-run mode

### Issue: Dashboard not loading

**Solution:** Ensure all scripts are properly loaded:
```html
<!-- Check browser console for missing scripts -->
<!-- All src/agents/*.js and src/utils/*.js must be present -->
```

### Issue: No links found

**Solution:** 
1. Run repository scan first
2. Check that files contain valid URLs
3. Verify file patterns are correct

## Best Practices

1. **Sign Early**: Sign files when you create them
2. **Regular Crawls**: Run network crawls weekly to track distribution
3. **Export Reports**: Keep historical reports for auditing
4. **Verify Before Deployment**: Always verify signatures before deploying
5. **Use Dry Run**: Test signing operations with `--dry-run` first

## Future Enhancements

Potential additions:
- [ ] Remote signature verification API
- [ ] Blockchain-based signature anchoring
- [ ] Signature revocation system
- [ ] Multi-agent signature chains
- [ ] Real-time network monitoring
- [ ] Automated signature rotation

## Support

For issues or questions:
1. Check this README
2. Review the dashboard logs
3. Examine the generated reports
4. Check browser console (for dashboard)

## Version

**Current Version**: 1.0.0  
**Release Date**: December 19, 2025  
**Status**: Production Ready ✅

---

**Built by**: MeRLynn & AGenTR Autonomous Agent System  
**Purpose**: Track and verify script usage across networks  
**License**: MIT
