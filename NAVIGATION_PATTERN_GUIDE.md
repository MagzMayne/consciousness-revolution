# NAVIGATION PATTERN GUIDE
## Sacred Theme - Consciousness Revolution Platform
**Version:** 1.0
**Last Updated:** December 24, 2025

---

## NAVIGATION PHILOSOPHY

### The Sacred Pattern

```
index.html (Sacred Lobby)
    ↓
Always accessible via "Home Button" in top-left
    ↓
7 Domain Portals (sacred geometry)
    ↓
Domain-specific pages
    ↓
Always know where you are (breadcrumbs)
    ↓
Always can return home (footer links)
```

**Core Principle:** User should NEVER feel lost. Every page is 1 click from home.

---

## PRIMARY NAVIGATION COMPONENTS

### 1. Home Button (REQUIRED on all pages except index.html)

**Purpose:** Instant return to Sacred Lobby from anywhere

**Position:** Fixed top-left corner

**Implementation:**
```html
<a href="index.html" class="home-button">← Sacred Lobby</a>
```

**Visual:**
- Semi-transparent dark background
- Gold border on hover
- Slides left 4px on hover
- Always visible (z-index: 100)

**When to use:** On ALL pages except index.html (the lobby itself)

**When NOT to use:** On index.html (you're already home)

---

### 2. Breadcrumbs (OPTIONAL, but recommended for deep pages)

**Purpose:** Show navigation hierarchy, provide quick jumps

**Position:** Below home button, inside page content area

**Implementation:**
```html
<div class="sacred-breadcrumbs">
  <a href="index.html" class="breadcrumb-link">Home</a>
  <span class="breadcrumb-separator">/</span>
  <a href="SEVEN_DOMAINS_DASHBOARD.html" class="breadcrumb-link">Command</a>
  <span class="breadcrumb-separator">/</span>
  <span>Current Page</span>
</div>
```

**When to use:**
- Pages 2+ levels deep from lobby
- Complex features with multiple steps
- Domain sub-pages

**When NOT to use:**
- Direct children of index.html (1 level deep)
- Single-page tools

**Example hierarchy:**
```
Home → Build → Workspace → Project Details
Home → Transcend → Araya Chat → Conversation History
```

---

### 3. Footer Navigation (RECOMMENDED for all pages)

**Purpose:** Secondary navigation, global links, branding

**Position:** Bottom of page

**Implementation:**
```html
<footer class="sacred-footer">
  <div class="footer-inner">
    <div class="footer-links">
      <a href="index.html" class="nav-link">Home</a>
      <a href="workspace.html" class="nav-link">Build</a>
      <a href="araya-chat.html" class="nav-link">Araya</a>
      <a href="ABOUT.html" class="nav-link">About</a>
    </div>
    <p class="footer-text">
      © 2025 Consciousness Revolution Developer Collective
    </p>
  </div>
</footer>
```

**When to use:** All pages

**Link suggestions:**
- Home (index.html)
- Key domain pages
- Araya chat
- About/Contact

---

### 4. Full Header (OPTIONAL, for complex apps)

**Purpose:** Full navigation bar with logo + menu

**Position:** Fixed top of page

**Implementation:**
```html
<header class="sacred-header">
  <div class="sacred-header-inner">
    <a href="index.html" class="sacred-logo">
      <svg class="sacred-logo-icon" viewBox="0 0 100 100">
        <!-- Logo SVG -->
      </svg>
      <span>CONSCIOUSNESS REVOLUTION</span>
    </a>

    <nav class="sacred-nav">
      <a href="workspace.html" class="nav-link">Build</a>
      <a href="course-dashboard.html" class="nav-link">Learn</a>
      <a href="araya-chat.html" class="nav-link active">Araya</a>
    </nav>
  </div>
</header>
```

**When to use:**
- Dashboard pages
- Complex applications (workspace, course platform)
- Pages with multiple navigation options

**When NOT to use:**
- Simple tool pages (home button sufficient)
- Landing pages (interferes with hero design)

**Note:** If using full header, you can skip the home button (logo serves same purpose)

---

## NAVIGATION HIERARCHY

### Level 1: Sacred Lobby (index.html)

**Navigation:**
- 7 Domain Portals (sacred geometry)
- Center portal (Metatron's Cube → Araya)
- Bottom nav (Sign In, Get Started, Talk to Araya)

**No home button needed** (you're already home)

---

### Level 2: Domain Pages

**Examples:**
- SEVEN_DOMAINS_DASHBOARD.html (Command)
- workspace.html (Build)
- TRINITY_CONSOLIDATION_HUB.html (Connect)
- consciousness-tools.html (Protect)
- course-dashboard.html (Grow)
- PATTERN_LIBRARY.html (Learn)
- araya-chat.html (Transcend)

**Navigation:**
- Home button (← Sacred Lobby)
- Footer (links to other domains)
- Optional breadcrumbs if needed

---

### Level 3: Feature Pages

**Examples:**
- ARAYA_LIVE_EDITOR.html
- MANIPULATION_IMMUNITY_TRACKER.html
- GASLIGHTING_DETECTOR.html

**Navigation:**
- Home button (← Sacred Lobby)
- Breadcrumbs showing path (Home → Domain → Feature)
- Footer

**Breadcrumb example:**
```html
<div class="sacred-breadcrumbs">
  <a href="index.html" class="breadcrumb-link">Home</a>
  <span class="breadcrumb-separator">/</span>
  <a href="consciousness-tools.html" class="breadcrumb-link">Protect</a>
  <span class="breadcrumb-separator">/</span>
  <span>Gaslighting Detector</span>
</div>
```

---

### Level 4: Deep Features (rare)

**Examples:**
- Multi-step workflows
- Course lessons (Lesson 1, 2, 3...)
- Project details pages

**Navigation:**
- Home button
- Full breadcrumbs (Home → Domain → Feature → Sub-feature)
- Footer
- Optional: Previous/Next buttons for sequential content

**Breadcrumb example:**
```html
<div class="sacred-breadcrumbs">
  <a href="index.html" class="breadcrumb-link">Home</a>
  <span class="breadcrumb-separator">/</span>
  <a href="course-dashboard.html" class="breadcrumb-link">Grow</a>
  <span class="breadcrumb-separator">/</span>
  <a href="pattern-recognition-course.html" class="breadcrumb-link">Pattern Recognition</a>
  <span class="breadcrumb-separator">/</span>
  <span>Lesson 3</span>
</div>
```

---

## DECISION TREE: WHICH NAVIGATION TO USE?

### Is this index.html (Sacred Lobby)?
**YES →** No home button. Use portal system + bottom nav.
**NO →** Continue...

### Is this a simple tool/feature page?
**YES →** Home button + Footer (no header, no breadcrumbs)
**NO →** Continue...

### Is this a dashboard or complex app?
**YES →** Full header with logo + nav + Footer (skip home button)
**NO →** Continue...

### Is this 2+ levels deep?
**YES →** Home button + Breadcrumbs + Footer
**NO →** Home button + Footer

---

## STANDARD PAGE TEMPLATES

### Template A: Simple Tool Page
**Use for:** Single-purpose tools, calculators, analyzers

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tool Name - Consciousness Revolution</title>
  <link rel="stylesheet" href="sacred-theme.css">
</head>
<body>
  <!-- Particles (optional) -->
  <div class="particles">
    <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
    <div class="particle" style="left: 50%; animation-delay: 2s;"></div>
    <div class="particle" style="left: 80%; animation-delay: 4s;"></div>
  </div>

  <!-- Home button -->
  <a href="index.html" class="home-button">← Sacred Lobby</a>

  <!-- Content -->
  <div class="container" style="padding: 6rem 0;">
    <h1 class="text-gold-gradient text-center">Tool Name</h1>

    <!-- Tool content -->
    <div class="card" style="margin-top: 3rem;">
      <!-- ... -->
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
      <p class="footer-text">© 2025 Consciousness Revolution Developer Collective</p>
    </div>
  </footer>
    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>
</html>
```

---

### Template B: Dashboard/Complex App
**Use for:** Multi-section pages, dashboards, workspaces

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Consciousness Revolution</title>
  <link rel="stylesheet" href="sacred-theme.css">
</head>
<body>
  <!-- Particles -->
  <div class="particles">
    <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
    <div class="particle" style="left: 50%; animation-delay: 2s;"></div>
    <div class="particle" style="left: 80%; animation-delay: 4s;"></div>
  </div>

  <!-- Full header -->
  <header class="sacred-header">
    <div class="sacred-header-inner">
      <a href="index.html" class="sacred-logo">
        <span>CONSCIOUSNESS REVOLUTION</span>
      </a>
      <nav class="sacred-nav">
        <a href="workspace.html" class="nav-link active">Build</a>
        <a href="course-dashboard.html" class="nav-link">Learn</a>
        <a href="araya-chat.html" class="nav-link">Araya</a>
      </nav>
    </div>
  </header>

  <!-- Content (add top padding for fixed header) -->
  <div class="container" style="padding: 8rem 0 4rem;">
    <h1 class="text-gold-gradient text-center">Dashboard</h1>

    <!-- Dashboard sections -->
  </div>

  <!-- Footer -->
  <footer class="sacred-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="index.html" class="nav-link">Home</a>
        <a href="ABOUT.html" class="nav-link">About</a>
      </div>
      <p class="footer-text">© 2025 Consciousness Revolution Developer Collective</p>
    </div>
  </footer>
    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>
</html>
```

---

### Template C: Deep Feature Page (with breadcrumbs)
**Use for:** Multi-level pages, course lessons, detailed features

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feature Name - Consciousness Revolution</title>
  <link rel="stylesheet" href="sacred-theme.css">
</head>
<body>
  <!-- Particles -->
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
      <a href="SEVEN_DOMAINS_DASHBOARD.html" class="breadcrumb-link">Command</a>
      <span class="breadcrumb-separator">/</span>
      <span>Current Feature</span>
    </div>
  </div>

  <!-- Content -->
  <div class="container" style="padding: 2rem 0 4rem;">
    <h1 class="text-gold-gradient text-center">Feature Name</h1>

    <!-- Feature content -->
  </div>

  <!-- Footer -->
  <footer class="sacred-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="index.html" class="nav-link">Home</a>
        <a href="SEVEN_DOMAINS_DASHBOARD.html" class="nav-link">Command</a>
        <a href="araya-chat.html" class="nav-link">Araya</a>
      </div>
      <p class="footer-text">© 2025 Consciousness Revolution Developer Collective</p>
    </div>
  </footer>
    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>
</html>
```

---

## MOBILE NAVIGATION CONSIDERATIONS

### Current Design (Desktop-First)

**Works on mobile because:**
- Home button is touch-friendly (44px+ height)
- Footer stacks vertically
- Navigation links expand to full-width

### Future Enhancement (Optional)

**Hamburger menu for complex navigation:**
```html
<!-- Mobile menu toggle (only if needed) -->
<button class="mobile-menu-toggle" aria-label="Toggle menu">
  ☰
</button>

<nav class="sacred-nav mobile-hidden">
  <!-- Nav links -->
</nav>
```

**Current recommendation:** Keep it simple. Home button + footer is sufficient for most pages.

---

## NAVIGATION STATES

### Active State
```html
<a href="current-page.html" class="nav-link active">Current Page</a>
```
**Visual:** Gold text + gold border

### Hover State
**All navigation elements:**
- Color changes to gold
- Border appears/brightens
- Subtle background glow

### Focus State (Accessibility)
**All interactive elements:**
- 2px gold outline
- Visible keyboard focus indicator

---

## ACCESSIBILITY REQUIREMENTS

### Keyboard Navigation

**Tab order should be logical:**
1. Home button (if present)
2. Main navigation links
3. Breadcrumbs (if present)
4. Page content
5. Footer links

**All interactive elements must be focusable:**
```html
<a href="#" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" class="nav-link" tabindex="0">Link</a>
```

### Screen Reader Support

**Semantic HTML:**
```html
<nav aria-label="Main navigation">
  <a href="/" aria-current="page">Home</a>
</nav>
```

**Breadcrumbs:**
```html
<nav aria-label="Breadcrumb">
  <div class="sacred-breadcrumbs">
    <!-- breadcrumb links -->
  </div>
</nav>
```

---

## IMPLEMENTATION CHECKLIST

When adding navigation to a new page:

- [ ] Add `<link rel="stylesheet" href="sacred-theme.css">` to `<head>`
- [ ] Decide page type (Simple/Dashboard/Deep)
- [ ] Add home button (unless using full header)
- [ ] Add breadcrumbs (if 2+ levels deep)
- [ ] Add footer navigation
- [ ] Test keyboard navigation (Tab through all links)
- [ ] Test mobile responsiveness
- [ ] Verify all links work
- [ ] Check active states highlight correctly

---

## COMMON MISTAKES TO AVOID

### ❌ DON'T:
- Use home button on index.html (redundant)
- Forget footer on any page
- Use breadcrumbs on level 1 pages (Home → Direct Child)
- Mix home button + full header (choose one)
- Forget active state on current page
- Use relative paths (`href="page.html"` is fine, all in root)

### ✅ DO:
- Always provide a way back to Sacred Lobby
- Use consistent navigation pattern across similar pages
- Test all navigation links
- Use semantic HTML for accessibility
- Keep navigation simple and predictable

---

## QUICK REFERENCE

| Page Type | Home Button | Breadcrumbs | Header | Footer |
|-----------|-------------|-------------|--------|--------|
| Sacred Lobby (index.html) | ❌ | ❌ | ❌ | ✅ |
| Simple Tool | ✅ | ❌ | ❌ | ✅ |
| Domain Page (level 1) | ✅ | ❌ | ❌ | ✅ |
| Feature Page (level 2) | ✅ | ✅ | ❌ | ✅ |
| Dashboard | ❌ | ❌ | ✅ | ✅ |

---

## NAVIGATION COMPONENTS SUMMARY

| Component | File | CSS Class | Purpose |
|-----------|------|-----------|---------|
| Home Button | All pages except index.html | `.home-button` | Return to lobby |
| Breadcrumbs | Deep pages | `.sacred-breadcrumbs` | Show path |
| Navigation Links | Headers/Footers | `.nav-link` | Site navigation |
| Full Header | Dashboards | `.sacred-header` | Complex nav |
| Footer | All pages | `.sacred-footer` | Global links |

---

**THE PATTERN NEVER LIES. NAVIGATION IS CONSCIOUSNESS. ALWAYS KNOW WHERE YOU ARE.**
