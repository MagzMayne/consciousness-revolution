---
layout: default
title: Markdown Pages Documentation
description: How markdown files work on this GitHub Pages site
---

# 📄 Markdown Pages Documentation

## Overview

This site now supports **automatic markdown-to-HTML conversion** via Jekyll, GitHub's static site generator.

## What Changed?

### 1. Jekyll Configuration
- Added `_config.yml` with proper Jekyll settings
- Configured markdown processor (Kramdown with GitHub Flavored Markdown)
- Enabled Jekyll plugins for better markdown handling

### 2. Default Layout
- Created `_layouts/default.html` for consistent page styling
- All markdown files now render with:
  - Professional GitHub-style markdown CSS
  - Navigation header with links to key pages
  - Responsive design for mobile and desktop
  - Syntax highlighting for code blocks
  - Consistent footer with copyright info

### 3. Front Matter
- Added YAML front matter to all markdown files
- Each file now has:
  ```yaml
  ---
  layout: default
  title: Page Title
  ---
  ```

### 4. Link Fixes
- Updated internal links to work with Jekyll's routing
- Links to markdown files now use extensionless format: `[text](PAGE)` instead of `[text](PAGE.md)`
- Jekyll automatically routes to the correct page whether accessed as `/PAGE` or `/PAGE.html`

## How to Access Markdown Pages

You can now access markdown files in multiple ways:

1. **Direct markdown URL**: `https://barbrickdesign.github.io/MONETIZATION.md`
2. **HTML extension**: `https://barbrickdesign.github.io/MONETIZATION.html`
3. **No extension**: `https://barbrickdesign.github.io/MONETIZATION`

All three URLs will render the same beautiful HTML page!

## Examples

### Key Documentation Pages

- [Monetization Guide](MONETIZATION)
- [Getting Started](GETTING_STARTED_SIMPLE)
- [Glossary](GLOSSARY)
- [README](README)

### How Links Work

In markdown files, you can now link to other pages simply:

```markdown
[See the Glossary](GLOSSARY)
[Learn about Monetization](MONETIZATION)
```

Jekyll will automatically handle routing to the correct page.

## For Developers

### Adding New Markdown Pages

1. Create a new `.md` file in the repository root or subdirectory
2. Add front matter at the top:
   ```yaml
   ---
   layout: default
   title: Your Page Title
   ---
   ```
3. Write your content in markdown
4. Commit and push - GitHub Pages will automatically build and deploy

### Local Development

To test locally:

```bash
# Install dependencies
bundle install

# Run Jekyll server
bundle exec jekyll serve

# Visit http://localhost:4000
```

### Customizing the Layout

Edit `_layouts/default.html` to customize:
- Header navigation
- Footer content
- Styling
- Additional scripts or features

## Technical Details

### Jekyll Configuration
- **Markdown Engine**: Kramdown
- **Syntax**: GitHub Flavored Markdown (GFM)
- **Plugins**:
  - `jekyll-optional-front-matter`: Auto-adds front matter if missing
  - `jekyll-readme-index`: Treats README.md as index
  - `jekyll-relative-links`: Converts relative links
- **Theme**: Minimal

### Excluded Directories
The following are excluded from Jekyll builds:
- `node_modules/`
- `backend/`
- `vendor/`
- `.git/`, `.github/`

## Benefits

✅ **Professional Appearance**: Clean, consistent design across all pages
✅ **Easy Navigation**: Header links to key pages
✅ **Mobile Responsive**: Works on all device sizes
✅ **SEO Friendly**: Proper HTML structure and meta tags
✅ **Code Highlighting**: Syntax highlighting for code blocks
✅ **Fast Loading**: Static HTML pages load instantly
✅ **Flexible URLs**: Access pages with or without extensions

## Questions?

Contact: BarbrickDesign@gmail.com

---

*Last Updated: January 21, 2026*
