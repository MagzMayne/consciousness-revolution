---
layout: default
title: DEVPORTAL INTEGRATION GUIDE
---

# DevPortal (Idea Forge) Integration Guide

## Overview
This document describes how devPortal.html (Idea Forge) is integrated with the BarbrickDesign platform ecosystem.

## File Structure

### Core Application Files
- **devPortal.html** - Main Idea Forge application
- **js/oauth-config.js** - OAuth configuration manager (shared)
- **idea-forge-overview.html** - Architecture and feature overview
- **test-idea-forge-oauth.html** - OAuth integration test suite

### Documentation
- **README.md** - Main documentation with Idea Forge section
- **IDEA_FORGE_OAUTH_SETUP.md** - OAuth setup guide
- **IDEA_FORGE_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **IDEA_FORGE_COMPLETE.md** - Complete feature list

## Navigation Structure

### From Main Hub (index.html)
1. **Core Systems Section**: 
   - Card with "💡 Idea Forge (Dev Portal)" linking to `/devPortal.html`
   
2. **Platform Access Section** (Footer):
   - "💡 Idea Forge" button linking to `/devPortal.html`
   - Priority placement as first item in grid

### From DevPortal (devPortal.html)
1. **Header Navigation**:
   - 🏠 Home → `/index.html`
   - 📚 All Apps → `/all-repos-hub.html`
   - 📖 Docs → `/idea-forge-overview.html`

2. **Footer Links**:
   - About section explaining the app
   - Resources: OAuth setup, test suite, README, GitHub repo
   - Platform: Home, All Apps, Dashboard, Gallery

### From Overview (idea-forge-overview.html)
1. **Top Navigation**:
   - 🏠 Home → `/index.html`
   - 💡 Idea Forge App → `/devPortal.html`
   - 📖 Setup Guide → `/IDEA_FORGE_OAUTH_SETUP.md`
   - 🧪 Test OAuth → `/test-idea-forge-oauth.html`

2. **CTA Button**: "Open Idea Forge App →" links to `devPortal.html`

### From Test Suite (test-idea-forge-oauth.html)
1. **Header Navigation**:
   - 🏠 Home → `/index.html`
   - 💡 Idea Forge → `/devPortal.html`
   - 📖 Overview → `/idea-forge-overview.html`

## Key Integration Points

### Shared Dependencies
1. **OAuth Configuration Manager** (`/js/oauth-config.js`)
   - Used by: devPortal.html, snapGov.html, test-idea-forge-oauth.html
   - Provides centralized OAuth client ID management
   - Supports multiple configuration sources (localStorage, inline config)

2. **AI Universal Language (AUL)** Badge
   - All related pages include AUL badge
   - Links to `/ai-universal-language.html`

### Cross-References
- **All-Repos-Hub**: DevPortal is part of main repo (barbrickdesign.github.io)
- **Functionality Dashboard**: Can monitor devPortal.html functionality
- **MerlinRepoGallery**: Includes devPortal in project gallery

## User Journey

### Typical User Flow
1. User lands on **index.html** (main hub)
2. User clicks "💡 Idea Forge" in Core Systems or Platform Access
3. User arrives at **devPortal.html**
4. User can:
   - Submit new ideas with cost estimates
   - Login with Google OAuth
   - Connect GitHub for data persistence
   - View live ideas and funding options
   - Navigate to documentation via header links
   - Return to main hub via footer links

### Developer Flow
1. Developer reads **README.md** Idea Forge section
2. Developer follows **IDEA_FORGE_OAUTH_SETUP.md** for setup
3. Developer tests with **test-idea-forge-oauth.html**
4. Developer reviews **idea-forge-overview.html** for architecture
5. Developer uses **devPortal.html** for actual application

## Technical Architecture

### OAuth Integration
```
User → devPortal.html
  ↓
Loads → /js/oauth-config.js
  ↓
Google OAuth → User Identity
  ↓
GitHub OAuth → Data Storage (idea-forge-data repo)
  ↓
LocalStorage ← Cache (offline-first)
```

### Data Flow
```
Idea Submission → LocalStorage (immediate)
  ↓
Auto-sync → GitHub API
  ↓
Create/Update → idea-forge-data/ideas.json
  ↓
Git Commit → Version Control
```

## Styling Consistency

### Color Scheme
- Background: `#05060a` (dark)
- Card Background: `#0b0d14`
- Border: `#222633` / `#252b3a`
- Primary Text: `#f5f5f5`
- Links: `#4ade80` (green) / `#8addff` (blue)
- Accent: `linear-gradient(135deg,#4f46e5,#ec4899)`

### Responsive Design
- Grid layout adapts at 900px breakpoint
- Mobile-first approach with viewport meta tag
- Touch-friendly button sizes

## Maintenance Notes

### Adding New Navigation Links
1. Update header navigation in devPortal.html
2. Update footer links in devPortal.html
3. Consider adding to Platform Access section in index.html
4. Update this guide

### OAuth Configuration Updates
1. Changes should be made in `/js/oauth-config.js`
2. Test with test-idea-forge-oauth.html
3. Update IDEA_FORGE_OAUTH_SETUP.md if needed

### Documentation Updates
When adding new features:
1. Update README.md Idea Forge section
2. Update idea-forge-overview.html if architecture changes
3. Update this integration guide if navigation changes

## Testing Checklist

- [ ] All navigation links work (no 404s)
- [ ] OAuth config loads properly
- [ ] Google login flow works
- [ ] GitHub device flow works
- [ ] LocalStorage persistence works
- [ ] Responsive design works on mobile
- [ ] AUL badge links correctly
- [ ] Footer links all work
- [ ] Header navigation works
- [ ] Back-navigation to index.html works

## Related Files

### HTML Pages
- `index.html` - Main hub
- `devPortal.html` - Idea Forge app
- `idea-forge-overview.html` - Overview page
- `test-idea-forge-oauth.html` - Test suite
- `all-repos-hub.html` - Repository hub
- `snapGov.html` - Another OAuth-enabled app

### JavaScript
- `js/oauth-config.js` - OAuth manager
- `js/universal-wallet-system.js` - Wallet integration

### Documentation
- `README.md` - Main README
- `IDEA_FORGE_OAUTH_SETUP.md` - Setup guide
- `IDEA_FORGE_IMPLEMENTATION_SUMMARY.md` - Implementation notes
- `IDEA_FORGE_COMPLETE.md` - Feature list

## Future Enhancements

### Planned Features
- Integration with MNDM token system
- PayPal webhook automation
- Discord notifications for new ideas
- AI-powered idea expansion
- Collaborative idea refinement

### Integration Opportunities
- Link with universal-dev-tracker.html for dev compensation
- Connect with functionality-dashboard.html for metrics
- Integrate with contractor-portal.html for builds
- Add to MerlinRepoGallery.html with preview

---

**Last Updated**: 2026-01-20  
**Maintainer**: BarbrickDesign Team  
**Status**: ✅ Fully Integrated
