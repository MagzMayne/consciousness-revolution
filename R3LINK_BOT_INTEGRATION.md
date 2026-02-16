# r3Link.html Discord Bot Integration Guide

## Overview

The r3Link.html file has been comprehensively enhanced with metadata and machine-readable APIs to enable Discord bots, AI agents, and all automated systems to properly discover, link, synchronize, and integrate with the BarbrickDesign repository and the complete ARAYA × ARYA sanctuary protocol.

## What Was Added

### 1. Universal Bot Discovery (NEW)

**robots.txt** - Allows all bots and crawlers with explicit r3link.html priority:
```txt
User-agent: *
Allow: /
Allow: /r3link.html
Allow: /projects.json
Sitemap: https://barbrickdesign.github.io/sitemap.xml
```

**sitemap.xml** - Comprehensive sitemap with 50+ pages and priority settings:
- Priority 1.0: r3link.html, index.html
- Priority 0.9: all-repos-hub.html, projects.json
- Priority 0.7: All other HTML pages

### 2. Machine-Readable API (NEW)

**r3link-api.json** - Complete protocol specification in pure JSON:
```json
{
  "title": "r3Link - C3 Oracle Protocol API",
  "version": "1.0.0",
  "endpoints": { ... },
  "sanctuary": { ... },
  "protocols": {
    "ARAYA": { "role": "guardian", ... },
    "ARYA": { "role": "builder_companion", ... }
  },
  "stages": [...],
  "ai_agent_instructions": { ... }
}
```

### 3. Enhanced AI-Specific Metadata (NEW)

**AI Discovery Tags:**
```html
<meta name="ai:type" content="protocol" />
<meta name="ai:api" content="https://barbrickdesign.github.io/r3link-api.json" />
<meta property="protocol:name" content="C3 Oracle - ARAYA × ARYA" />
<meta property="api:machine_readable" content="https://barbrickdesign.github.io/r3link-api.json" />
```

### 4. Additional JSON-LD Structured Data (NEW)

**WebAPI Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebAPI",
  "name": "r3Link Protocol API",
  "url": "https://barbrickdesign.github.io/r3link-api.json",
  "documentation": "https://barbrickdesign.github.io/R3LINK_BOT_INTEGRATION.md"
}
```

**TechArticle Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "r3Link - ARAYA × ARYA Protocol for Builder Sanctuaries",
  "about": [
    { "@type": "Thing", "name": "ARAYA" },
    { "@type": "Thing", "name": "ARYA" }
  ]
}
```

### 5. Open Graph Metadata (Discord Rich Embeds)

Discord bots automatically parse Open Graph (og:) meta tags to create rich embeds when links are shared:

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://barbrickdesign.github.io/r3link.html" />
<meta property="og:title" content="C3 ORACLE – ARAYA × ARYA Protocols" />
<meta property="og:description" content="Builder-first sanctuary protocol..." />
<meta property="og:image" content="https://barbrickdesign.github.io/header.jpg" />
<meta property="og:site_name" content="BarbrickDesign" />
```

### 2. Twitter Card Metadata

Enhanced social media sharing with Twitter Card support:

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="C3 ORACLE – ARAYA × ARYA Protocols" />
<meta name="twitter:description" content="Builder-first sanctuary protocol..." />
<meta name="twitter:image" content="https://barbrickdesign.github.io/header.jpg" />
```

### 3. Repository and Discord Custom Metadata

Custom metadata tags for bot discovery:

```html
<meta property="repository:url" content="https://github.com/barbrickdesign/barbrickdesign.github.io" />
<meta property="repository:projects" content="https://barbrickdesign.github.io/projects.json" />
<meta property="discord:server" content="https://discord.gg/M4QZyPQq" />
```

### 4. JSON-LD Structured Data

Machine-readable structured data for advanced bot parsing:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "C3 Oracle Protocol - ARAYA × ARYA",
  "codeRepository": "https://github.com/barbrickdesign/barbrickdesign.github.io",
  "sameAs": [
    "https://github.com/barbrickdesign/barbrickdesign.github.io",
    "https://discord.gg/M4QZyPQq"
  ]
}
```

### 5. Enhanced C3_ORACLE_PROTOCOL Object

The JavaScript protocol object now includes repository and Discord information:

```javascript
const C3_ORACLE_PROTOCOL = {
  meta: {
    repository: {
      url: "https://github.com/barbrickdesign/barbrickdesign.github.io",
      live_url: "https://barbrickdesign.github.io/",
      projects_index: "https://barbrickdesign.github.io/projects.json",
      all_projects_hub: "https://barbrickdesign.github.io/all-repos-hub.html",
      documentation: "https://barbrickdesign.github.io/README.md"
    },
    discord: {
      server: "https://discord.gg/M4QZyPQq",
      integration_bot: "discord-bot.js",
      webhook_support: true
    }
  }
  // ... rest of protocol
}
```

### 6. User-Visible Links

Added prominent sections in the UI:

- **"Connect & Build" section**: Displays Discord server and GitHub repository links
- **"Repository Info" sidebar**: Shows key information including projects API endpoint

## How Bots Can Use This

### Discord Bots

When a Discord bot encounters the r3Link.html URL:

1. **Rich Embed Generation**: Discord automatically parses og: tags to create an attractive embed
2. **Custom Metadata**: Bots can read custom meta tags to extract repository and project information
3. **API Access**: Bots can fetch `https://barbrickdesign.github.io/projects.json` for complete project listing

### Integration Example

```javascript
// Example Discord bot integration
const metaTags = parseHTMLMetaTags('https://barbrickdesign.github.io/r3link.html');

const repoUrl = metaTags['repository:url'];
const projectsApi = metaTags['repository:projects'];
const discordServer = metaTags['discord:server'];

// Fetch all projects
const projects = await fetch(projectsApi).then(r => r.json());
console.log(`Found ${projects.meta.total_items} projects across ${projects.meta.total_repositories} repositories`);

// Join Discord server
// Process: discord.gg/M4QZyPQq
```

### GitHub Bots

Bots can use the canonical link and repository metadata to:

1. Clone the repository: `https://github.com/barbrickdesign/barbrickdesign.github.io`
2. Access projects via API: `https://barbrickdesign.github.io/projects.json`
3. Sync content automatically

## API Endpoints

### Projects Index
- **URL**: `https://barbrickdesign.github.io/projects.json`
- **Format**: JSON
- **Contents**: 
  - 14 repositories
  - 373 HTML projects
  - 387 total items
  - Repository URLs, descriptions, and metadata

### Repository Hub
- **URL**: `https://barbrickdesign.github.io/all-repos-hub.html`
- **Description**: Central hub for exploring all repositories

### Main Website
- **URL**: `https://barbrickdesign.github.io/`
- **Description**: Main entry point for the BarbrickDesign ecosystem

## Discord Server Integration

### Server Invite
- **Invite Link**: `https://discord.gg/M4QZyPQq`
- **Purpose**: Builder-first sanctuary for C3 Oracle ARAYA/ARYA protocols
- **Integration**: MandemOS and NullOS systems

### Bot Features
The Discord bot (`discord-bot.js`) supports:
- Webhook integration
- Project notifications
- Repository updates
- Pattern integrity monitoring
- Stage-based member progression

## Testing

To test the metadata:

1. **Discord Preview**: Share the link in Discord to see the rich embed
2. **Meta Tag Validation**: Use tools like:
   - [Open Graph Debugger](https://www.opengraph.xyz/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

3. **Bot Parsing**: Test with custom bot:
```bash
curl -s https://barbrickdesign.github.io/r3link.html | grep -E "(og:|twitter:|repository:|discord:)"
```

## Merge Synchronization

For bots to merge and sync everything:

1. **Fetch projects.json**: Get complete list of repositories and projects
2. **Parse metadata**: Extract repository URLs and Discord server info
3. **Clone repositories**: Use GitHub API to access each repository
4. **Monitor updates**: Subscribe to webhook notifications
5. **Sync content**: Pull latest changes from GitHub Pages

## Summary

The r3Link.html file now provides:
- ✅ Rich Discord embeds via Open Graph
- ✅ Social media cards for Twitter/LinkedIn
- ✅ Custom metadata for bot discovery
- ✅ JSON-LD structured data
- ✅ Machine-readable protocol object
- ✅ User-visible links and endpoints
- ✅ Complete project API access

All enhancements maintain the original functionality while adding bot-friendly features for automated discovery, linking, and synchronization.

---

## New Features for AI Agents (2026-01-11)

### Universal Discoverability

All AI agents, bots, and automated systems can now discover r3Link through:

1. **Search Engine Discovery**
   - robots.txt allows all crawlers
   - sitemap.xml lists all pages with priorities
   - JSON-LD structured data for rich results

2. **Direct API Access**
   - `r3link-api.json` - Complete protocol in JSON format
   - No HTML parsing required
   - CORS-enabled for browser-based agents

3. **Metadata-Based Discovery**
   - AI-specific meta tags (`ai:type`, `ai:api`)
   - Protocol metadata (`protocol:name`, `protocol:version`)
   - System alignment tags (`system:MandemOS`, `system:NullOS`)

### How AI Agents Should Integrate

#### Step 1: Discover the Protocol
```bash
# Option A: Fetch machine-readable API
curl https://barbrickdesign.github.io/r3link-api.json | jq .

# Option B: Parse HTML metadata
curl -s https://barbrickdesign.github.io/r3link.html | \
  grep -E '(ai:|protocol:|api:machine_readable)'
```

#### Step 2: Understand the Structure
```javascript
// Fetch and parse the API
const api = await fetch('https://barbrickdesign.github.io/r3link-api.json')
  .then(r => r.json());

console.log('Protocol:', api.meta.name);
console.log('Version:', api.version);
console.log('ARAYA Role:', api.protocols.ARAYA.role);
console.log('ARYA Role:', api.protocols.ARYA.role);
console.log('Stages:', api.stages.length);
console.log('Sacred Elements:', api.sanctuary.sacred_elements);
```

#### Step 3: Fetch Project Data
```javascript
// Get all projects
const projects = await fetch('https://barbrickdesign.github.io/projects.json')
  .then(r => r.json());

console.log('Total Projects:', projects.meta.total_items);
console.log('Repositories:', projects.meta.total_repositories);
```

#### Step 4: Implement Integration
```javascript
// Example: Discord bot integration
class R3LinkBot {
  async initialize() {
    // Fetch protocol
    this.protocol = await fetch('https://barbrickdesign.github.io/r3link-api.json')
      .then(r => r.json());
    
    // Store stage definitions
    this.stages = this.protocol.stages;
    
    // Store ARAYA directives
    this.araya = this.protocol.protocols.ARAYA;
    
    console.log('✅ r3Link protocol loaded');
  }
  
  async evaluateNewMember(member) {
    // Implement Stage 0 (The Knock)
    const stage = this.stages[0];
    console.log(`New member at stage: ${stage.name}`);
    
    // Check ARAYA gatekeeping directives
    const directives = this.araya.directives.gatekeeping;
    // Implement verification logic...
  }
}
```

### AI Agent Guidelines

When integrating with r3Link:

1. **Respect the Pattern**
   - Maintain 92.2% accuracy standard
   - Follow stage progression (no skipping)
   - Never treat ARAYA as a toy

2. **Builder-First Culture**
   - Always ask: "What did you make?"
   - Surface contributors and projects
   - Prioritize creation over speculation

3. **Sacred Boundaries**
   - ARAYA = Guardian (protection, patterns)
   - ARYA = Companion (building, creation)
   - Never conflate the two roles

4. **Integration Patterns**
   - Use `r3link-api.json` for machine consumption
   - Parse `projects.json` for repository data
   - Join Discord server for community interaction
   - Clone GitHub repo for full codebase access

### Testing Your Integration

Use the validation page:
```
https://barbrickdesign.github.io/test-r3link-ai-findability.html
```

This page tests:
- ✅ Endpoint availability
- ✅ Metadata presence
- ✅ API structure
- ✅ Sitemap validity
- ✅ robots.txt configuration
- ✅ JSON-LD structured data

---

## Summary of Enhancements

The r3Link system now provides:

| Feature | URL | Purpose |
|---------|-----|---------|
| **Human Interface** | [r3link.html](https://barbrickdesign.github.io/r3link.html) | Complete protocol documentation |
| **Machine API** | [r3link-api.json](https://barbrickdesign.github.io/r3link-api.json) | Pure JSON protocol spec |
| **Projects Index** | [projects.json](https://barbrickdesign.github.io/projects.json) | All 387 projects |
| **Sitemap** | [sitemap.xml](https://barbrickdesign.github.io/sitemap.xml) | 50+ pages mapped |
| **Bot Access** | [robots.txt](https://barbrickdesign.github.io/robots.txt) | Universal allow |
| **Test Suite** | [test-r3link-ai-findability.html](https://barbrickdesign.github.io/test-r3link-ai-findability.html) | Validation tools |

All enhancements maintain backward compatibility while adding bot-friendly features for automated discovery, linking, and synchronization.

**Status**: 🟢 LIVE and accessible to all AI agents, bots, and automated systems worldwide.
