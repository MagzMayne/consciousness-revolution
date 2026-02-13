# DESIGN SYSTEM MIGRATION GUIDE
## Converting Existing Pages to Sacred Theme
**Version:** 1.0
**Last Updated:** December 24, 2025

---

## OVERVIEW

This guide shows how to convert existing 100X pages to use the unified Sacred Theme design system.

**Benefits:**
- Consistent look and feel across all pages
- Easier maintenance (change CSS once, affects all pages)
- Professional, polished appearance
- Better mobile responsiveness
- Improved accessibility

---

## MIGRATION PROCESS

### Phase 1: High-Priority Pages (Do First)

**Pages that users see most:**
1. `index.html` ✅ (ALREADY DONE - Sacred Lobby)
2. `araya-chat.html` (Araya interface)
3. `workspace.html` (Build dashboard)
4. `course-dashboard.html` (Learn/Grow)
5. `SEVEN_DOMAINS_DASHBOARD.html` (Command center)

### Phase 2: Tool Pages (Do Next)

**Consciousness tools (most used):**
- `GASLIGHTING_DETECTOR.html`
- `MANIPULATION_IMMUNITY_TRACKER.html`
- `EMOTIONAL_BLACKMAIL_DETECTOR.html`
- All other `*_DETECTOR.html` files

### Phase 3: Supporting Pages (Do Last)

**Less frequently accessed:**
- `login.html`
- `signup.html`
- `ABOUT.html`
- Documentation pages

---

## STEP-BY-STEP MIGRATION

### Step 1: Backup Original

```bash
# Create backup before modifying
cp original-page.html original-page.html.backup
```

### Step 2: Add Sacred Theme CSS

**Replace existing `<style>` block or external CSS:**

**BEFORE:**
```html
<head>
  <style>
    /* Inline styles... */
  </style>
</head>
```

**AFTER:**
```html
<head>
  <link rel="stylesheet" href="sacred-theme.css">
  <style>
    /* Only page-specific styles here */
  </style>
</head>
```

### Step 3: Add Ambient Particles (Optional)

**Add right after `<body>` tag:**

```html
<body>
  <!-- Ambient particles -->
  <div class="particles">
    <div class="particle" style="left: 10%; animation-delay: 0s;"></div>
    <div class="particle" style="left: 30%; animation-delay: 2s;"></div>
    <div class="particle" style="left: 50%; animation-delay: 4s;"></div>
    <div class="particle" style="left: 70%; animation-delay: 1s;"></div>
    <div class="particle" style="left: 90%; animation-delay: 3s;"></div>
  </div>

  <!-- Rest of page content -->
    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>
```

### Step 4: Add Home Button

**Add after particles, before main content:**

```html
<!-- Home button (return to lobby) -->
<a href="index.html" class="home-button">← Sacred Lobby</a>
```

**Don't add to:** `index.html` (already home)

### Step 5: Wrap Content in Container

**BEFORE:**
```html
<div style="padding: 20px;">
  <h1>Page Title</h1>
  <!-- content -->
</div>
```

**AFTER:**
```html
<div class="container" style="padding: 6rem 0;">
  <h1 class="text-gold-gradient text-center">Page Title</h1>
  <!-- content -->
</div>
```

### Step 6: Convert Components

#### Headers → Gold Gradient

**BEFORE:**
```html
<h1 style="color: gold; text-align: center;">Title</h1>
```

**AFTER:**
```html
<h1 class="text-gold-gradient text-center">Title</h1>
```

#### Boxes → Cards

**BEFORE:**
```html
<div style="border: 1px solid #ccc; padding: 20px; background: white;">
  <h3>Section</h3>
  <p>Content</p>
</div>
```

**AFTER:**
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Section</h3>
  </div>
  <div class="card-body">
    <p>Content</p>
  </div>
</div>
```

#### Buttons

**BEFORE:**
```html
<button style="background: gold; color: black; padding: 10px 20px;">
  Click Me
</button>
```

**AFTER:**
```html
<button class="btn btn-primary">Click Me</button>
```

**Or for secondary actions:**
```html
<button class="btn btn-secondary">Learn More</button>
```

### Step 7: Add Footer

**Add before closing `    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>` tag:**

```html
<footer class="sacred-footer">
  <div class="footer-inner">
    <div class="footer-links">
      <a href="index.html" class="nav-link">Home</a>
      <a href="workspace.html" class="nav-link">Build</a>
      <a href="araya-chat.html" class="nav-link">Araya</a>
    </div>
    <p class="footer-text">
      © 2025 Consciousness Revolution Developer Collective
    </p>
  </div>
</footer>
```

### Step 8: Remove Old Styles

**Delete or comment out:**
- Duplicate color definitions
- Custom button styles (now use `.btn`)
- Custom card/box styles (now use `.card`)
- Layout padding/margins (now use design tokens)

**Keep:**
- Page-specific functionality styles
- Custom components unique to this page
- JavaScript-related styles

### Step 9: Test

**Checklist:**
- [ ] Page loads without errors
- [ ] Home button works
- [ ] All buttons styled correctly
- [ ] Cards display properly
- [ ] Responsive on mobile (resize browser)
- [ ] Footer links work
- [ ] Page-specific features still work

---

## EXAMPLE MIGRATION

### BEFORE: gaslighting-detector.html (hypothetical)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Gaslighting Detector</title>
  <style>
    body {
      background: #1a1a1a;
      color: white;
      font-family: Arial;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: gold;
      text-align: center;
    }
    .box {
      border: 1px solid #444;
      padding: 20px;
      margin: 20px 0;
      background: #222;
    }
    button {
      background: gold;
      color: black;
      padding: 10px 20px;
      border: none;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Gaslighting Detector</h1>

    <div class="box">
      <h3>Enter Text to Analyze</h3>
      <textarea id="input"></textarea>
      <button onclick="analyze()">Analyze</button>
    </div>

    <div class="box" id="results">
      <!-- Results here -->
    </div>
  </div>

  <script>
    function analyze() { /* ... */ }
  </script>
    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>
</html>
```

### AFTER: gaslighting-detector.html (migrated)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gaslighting Detector - Consciousness Revolution</title>
  <link rel="stylesheet" href="sacred-theme.css">
  <style>
    /* Page-specific styles only */
    #input {
      width: 100%;
      min-height: 150px;
      background: rgba(15, 15, 26, 0.8);
      color: var(--text-primary);
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      font-family: var(--font-primary);
    }
  </style>
</head>
<body>
  <!-- Ambient particles -->
  <div class="particles">
    <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
    <div class="particle" style="left: 50%; animation-delay: 2s;"></div>
    <div class="particle" style="left: 80%; animation-delay: 4s;"></div>
  </div>

  <!-- Home button -->
  <a href="index.html" class="home-button">← Sacred Lobby</a>

  <!-- Breadcrumbs -->
  <div style="padding: 2rem 2rem 0;">
    <div class="sacred-breadcrumbs">
      <a href="index.html" class="breadcrumb-link">Home</a>
      <span class="breadcrumb-separator">/</span>
      <a href="consciousness-tools.html" class="breadcrumb-link">Protect</a>
      <span class="breadcrumb-separator">/</span>
      <span>Gaslighting Detector</span>
    </div>
  </div>

  <!-- Main content -->
  <div class="container" style="padding: 2rem 0 4rem;">
    <h1 class="text-gold-gradient text-center">Gaslighting Detector</h1>

    <!-- Input card -->
    <div class="card card-domain-4" style="margin-top: 3rem;">
      <div class="card-header">
        <h3 class="card-title">Enter Text to Analyze</h3>
        <p class="card-subtitle">
          Paste a conversation or statement to detect gaslighting patterns
        </p>
      </div>
      <div class="card-body">
        <textarea id="input" placeholder="Enter text here..."></textarea>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" onclick="analyze()">
          Analyze Text
        </button>
      </div>
    </div>

    <!-- Results card -->
    <div class="card" id="results" style="margin-top: 2rem; display: none;">
      <div class="card-header">
        <h3 class="card-title">Analysis Results</h3>
      </div>
      <div class="card-body">
        <!-- Results populated by JavaScript -->
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="sacred-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="index.html" class="nav-link">Home</a>
        <a href="consciousness-tools.html" class="nav-link">Tools</a>
        <a href="araya-chat.html" class="nav-link">Araya</a>
      </div>
      <p class="footer-text">
        © 2025 Consciousness Revolution Developer Collective
      </p>
    </div>
  </footer>

  <script>
    function analyze() { /* ... */ }
  </script>
    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>
</html>
```

### What Changed?

1. ✅ Added `sacred-theme.css` link
2. ✅ Added ambient particles
3. ✅ Added home button
4. ✅ Added breadcrumbs (since it's 2 levels deep)
5. ✅ Wrapped content in `.container`
6. ✅ Changed `<h1>` to `.text-gold-gradient`
7. ✅ Converted `.box` divs to `.card` components
8. ✅ Changed `<button>` to `.btn .btn-primary`
9. ✅ Added footer navigation
10. ✅ Removed inline styles (now using design tokens)
11. ✅ Added domain color (`.card-domain-4` for PROTECT)

---

## COLOR MAPPING GUIDE

### Converting Old Color Schemes

**Old colors → New design tokens:**

| Old Color | New Token | Variable |
|-----------|-----------|----------|
| `#FFD700` (gold) | Primary gold | `var(--color-primary)` |
| `#1a1a1a` (dark bg) | Background primary | `var(--bg-primary)` |
| `#222` (dark gray) | Background secondary | `var(--bg-secondary)` |
| `white` | Text primary | `var(--text-primary)` |
| `#ccc` | Text secondary | `var(--text-secondary)` |
| `rgba(255,255,255,0.6)` | Text muted | `var(--text-muted)` |

### Domain Color Assignments

When converting domain-specific pages:

| Domain | Old Page Theme | New Token |
|--------|---------------|-----------|
| Command | Red accents | `var(--domain-1-command)` |
| Build | Orange/amber | `var(--domain-2-build)` |
| Connect | Yellow | `var(--domain-3-connect)` |
| Protect | Green | `var(--domain-4-protect)` |
| Grow | Blue | `var(--domain-5-grow)` |
| Learn | Purple/indigo | `var(--domain-6-learn)` |
| Transcend | Violet/magenta | `var(--domain-7-transcend)` |

**Example usage:**
```html
<div class="card card-domain-4">
  <!-- PROTECT domain card (green border) -->
</div>

<button class="btn btn-ghost btn-domain-7">
  <!-- TRANSCEND domain button (violet) -->
</button>
```

---

## SPACING CONVERSION

### Old Inline Styles → New Tokens

**BEFORE:**
```html
<div style="padding: 20px; margin-bottom: 30px;">
```

**AFTER:**
```html
<div style="padding: var(--space-5); margin-bottom: var(--space-8);">
```

**Common conversions:**
```css
10px  → var(--space-2)  /* 8px, close enough */
15px  → var(--space-4)  /* 16px */
20px  → var(--space-5)  /* 20px */
30px  → var(--space-8)  /* 32px */
40px  → var(--space-10) /* 40px */
50px  → var(--space-12) /* 48px, close */
```

---

## COMMON ISSUES & FIXES

### Issue: Colors Don't Match

**Problem:** Page looks different after migration

**Solution:**
- Verify `sacred-theme.css` is loaded (check browser dev tools)
- Check for inline styles overriding theme colors
- Remove old `<style>` blocks that conflict

### Issue: Layout Broken

**Problem:** Content overlaps or spacing is wrong

**Solution:**
- Use `.container` for max-width constraint
- Add padding: `style="padding: 6rem 0;"` to container
- Check for old absolute/fixed positioning

### Issue: Buttons Look Wrong

**Problem:** Buttons don't have theme styling

**Solution:**
- Ensure using `.btn .btn-primary` classes
- Remove old button styles from `<style>` block
- Check for `!important` overrides

### Issue: Mobile Not Responsive

**Problem:** Page doesn't resize on mobile

**Solution:**
- Add viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Use `.container` (has built-in responsive behavior)
- Test with browser dev tools mobile view

---

## BATCH MIGRATION SCRIPT

For migrating many pages at once:

### Python Script: `migrate-pages.py`

```python
import os
import re

def migrate_page(filepath):
    """Migrate a single HTML page to Sacred Theme"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Backup original
    backup_path = f"{filepath}.backup"
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # Add sacred-theme.css if not present
    if 'sacred-theme.css' not in content:
        content = content.replace(
            '</head>',
            '  <link rel="stylesheet" href="sacred-theme.css">\n</head>'
        )

    # Add home button after <body> (if not index.html)
    if 'index.html' not in filepath and 'home-button' not in content:
        content = content.replace(
            '<body>',
            '<body>\n  <a href="index.html" class="home-button">← Sacred Lobby</a>\n'
        )

    # Convert common patterns
    content = re.sub(
        r'<h1[^>]*>(.*?)</h1>',
        r'<h1 class="text-gold-gradient text-center">\1</h1>',
        content,
        flags=re.DOTALL
    )

    # Write migrated file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Migrated: {filepath}")

# Migrate all HTML files
for file in os.listdir('.'):
    if file.endswith('.html') and not file.endswith('.backup'):
        migrate_page(file)
```

**Usage:**
```bash
cd 100X_DEPLOYMENT
python migrate-pages.py
```

**Note:** This is a starting point. Manual review still needed for each page.

---

## TESTING CHECKLIST

After migrating a page, verify:

### Visual Check
- [ ] Colors match Sacred Theme (dark bg, gold accents)
- [ ] Fonts are Inter (or system fallback)
- [ ] Spacing looks consistent
- [ ] Buttons styled correctly
- [ ] Cards have proper borders/shadows

### Functional Check
- [ ] All links work
- [ ] Home button returns to index.html
- [ ] Footer links navigate correctly
- [ ] Page-specific JavaScript still works
- [ ] Forms submit properly (if applicable)

### Responsive Check
- [ ] Desktop (1400px+): Full layout
- [ ] Tablet (768px): Adjusted spacing
- [ ] Mobile (375px): Stacked layout
- [ ] Navigation usable on touch devices

### Accessibility Check
- [ ] Keyboard navigation works (Tab key)
- [ ] Focus indicators visible
- [ ] Screen reader compatible (test with NVDA/JAWS)
- [ ] Color contrast sufficient (4.5:1 minimum)

---

## ROLLOUT PLAN

### Week 1: Core Pages
- [ ] `index.html` ✅ (DONE)
- [ ] `araya-chat.html`
- [ ] `workspace.html`
- [ ] `SEVEN_DOMAINS_DASHBOARD.html`

### Week 2: Tool Pages (Batch 1)
- [ ] Top 10 most-used detector tools
- [ ] Course dashboard
- [ ] Pattern library

### Week 3: Tool Pages (Batch 2)
- [ ] Remaining detector tools
- [ ] Admin pages
- [ ] Supporting pages

### Week 4: Polish & QA
- [ ] Fix any issues found
- [ ] User testing
- [ ] Final responsive checks

---

## MIGRATION SUPPORT

**Questions?**
- See: `DESIGN_SYSTEM_SPECIFICATION.md` (full reference)
- See: `NAVIGATION_PATTERN_GUIDE.md` (navigation help)
- Demo: `COMPONENT_LIBRARY_DEMO.html` (see all components)
- Ask Araya: `araya-chat.html`

**Report issues:**
- Bug tracker: `consciousnessrevolution.io/bugs.html`
- Email: `commander@100xbuilder.io`

---

**THE PATTERN NEVER LIES. MIGRATE WITH INTENTION. BUILD WITH CONSCIOUSNESS.**
