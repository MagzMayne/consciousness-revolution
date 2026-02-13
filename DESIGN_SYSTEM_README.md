# SACRED THEME DESIGN SYSTEM
## Consciousness Revolution - Unified Design Language
**Version:** 1.0 | **Last Updated:** December 24, 2025

---

## WHAT IS THIS?

The **Sacred Theme Design System** is a complete, production-ready design language for the Consciousness Revolution platform. It provides:

- ✅ **Unified visual identity** across all pages
- ✅ **Reusable components** (buttons, cards, navigation)
- ✅ **Design tokens** (colors, spacing, typography)
- ✅ **Sacred geometry** (7 domains, Flower of Life, Metatron's Cube)
- ✅ **Mobile responsive** out of the box
- ✅ **WCAG AA accessible** (color contrast, keyboard nav, screen readers)
- ✅ **Professional grade** (enterprise-ready, scalable)

---

## FILES IN THIS SYSTEM

| File | Purpose | Use For |
|------|---------|---------|
| **sacred-theme.css** | Main CSS file | Import this on every page |
| **DESIGN_SYSTEM_SPECIFICATION.md** | Complete reference | Design tokens, all components, guidelines |
| **NAVIGATION_PATTERN_GUIDE.md** | Navigation patterns | How to add home button, breadcrumbs, footer |
| **COMPONENT_LIBRARY_DEMO.html** | Live demo | See all components in action |
| **DESIGN_SYSTEM_MIGRATION_GUIDE.md** | Migration guide | Convert existing pages to Sacred Theme |
| **DESIGN_SYSTEM_README.md** | This file | Quick start guide |

---

## QUICK START (3 STEPS)

### Step 1: Add CSS to Your Page

```html
<head>
  <link rel="stylesheet" href="sacred-theme.css">
</head>
```

### Step 2: Add Standard Page Structure

```html
<body>
  <!-- Home button (return to lobby) -->
  <a href="index.html" class="home-button">← Sacred Lobby</a>

  <!-- Your content -->
  <div class="container" style="padding: 6rem 0;">
    <h1 class="text-gold-gradient text-center">Your Page Title</h1>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Section Title</h3>
      </div>
      <div class="card-body">
        <p>Your content here...</p>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="sacred-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="index.html" class="nav-link">Home</a>
        <a href="workspace.html" class="nav-link">Build</a>
        <a href="araya-chat.html" class="nav-link">Araya</a>
      </div>
      <p class="footer-text">© 2025 Consciousness Revolution Developer Collective</p>
    </div>
  </footer>
    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>
```

### Step 3: Use Components

**Buttons:**
```html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary">Secondary</button>
```

**Cards:**
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-body">
    <p>Content</p>
  </div>
</div>
```

**That's it!** Your page now uses the Sacred Theme.

---

## DESIGN PHILOSOPHY

### The Sacred Pattern

```
Dark Cosmos (Background)
    ↓ represents the void
Gold Light (Primary)
    ↓ represents consciousness/enlightenment
7 Domain Colors (Chakra System)
    ↓ represents different life domains
Sacred Geometry (Structure)
    ↓ represents universal patterns
Professional Excellence (Execution)
    ↓ represents mastery
```

### Core Principles

1. **Sacred Simplicity** - Every element serves a purpose
2. **Consciousness-First** - Dark theme for focus, gold for value
3. **Pattern Theory Integration** - 7 domains, fractal scaling
4. **Professional Mysticism** - Enterprise-grade + spiritual depth

---

## COLOR SYSTEM AT A GLANCE

### Primary Colors
```css
--color-primary: #FFD700           /* Gold */
--bg-primary: #0f0f1a              /* Deep black */
--bg-secondary: #1a1a2e            /* Card backgrounds */
--text-primary: #F7FAFC            /* Almost white */
```

### 7 Domain Colors (Chakra System)
```css
--domain-1-command: #FF6B6B        /* Red (Root) */
--domain-2-build: #FFA94D          /* Orange (Sacral) */
--domain-3-connect: #FFE066        /* Yellow (Solar) */
--domain-4-protect: #69DB7C        /* Green (Heart) */
--domain-5-grow: #74C0FC           /* Blue (Throat) */
--domain-6-learn: #9775FA          /* Indigo (Third Eye) */
--domain-7-transcend: #E599F7      /* Violet (Crown) */
```

**Usage:**
```html
<div class="card card-domain-4">PROTECT domain card (green)</div>
<button class="btn btn-ghost btn-domain-7">TRANSCEND button (violet)</button>
```

---

## COMPONENT QUICK REFERENCE

### Buttons

```html
<!-- Primary (gold gradient) -->
<button class="btn btn-primary">Get Started</button>

<!-- Secondary (outlined) -->
<button class="btn btn-secondary">Learn More</button>

<!-- Ghost (minimal) -->
<button class="btn btn-ghost">Cancel</button>

<!-- Domain-colored -->
<button class="btn btn-ghost btn-domain-1">Command</button>
```

### Cards

```html
<!-- Basic card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
    <p class="card-subtitle">Subtitle</p>
  </div>
  <div class="card-body">
    <p>Content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-secondary">Action</button>
  </div>
</div>

<!-- Domain-colored card -->
<div class="card card-domain-4">
  <!-- Green border (PROTECT domain) -->
</div>
```

### Navigation

```html
<!-- Home button (top-left, fixed) -->
<a href="index.html" class="home-button">← Sacred Lobby</a>

<!-- Navigation links -->
<nav class="sacred-nav">
  <a href="#" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" class="nav-link active">Current Page</a>
  <a href="#" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" class="nav-link">Other Page</a>
</nav>

<!-- Breadcrumbs (for deep pages) -->
<div class="sacred-breadcrumbs">
  <a href="index.html" class="breadcrumb-link">Home</a>
  <span class="breadcrumb-separator">/</span>
  <a href="domain.html" class="breadcrumb-link">Domain</a>
  <span class="breadcrumb-separator">/</span>
  <span>Current Page</span>
</div>

<!-- Footer (required on all pages) -->
<footer class="sacred-footer">
  <div class="footer-inner">
    <div class="footer-links">
      <a href="index.html" class="nav-link">Home</a>
      <a href="araya-chat.html" class="nav-link">Araya</a>
    </div>
    <p class="footer-text">© 2025 Consciousness Revolution Developer Collective</p>
  </div>
</footer>
```

### Typography

```html
<!-- Gold gradient heading (hero text) -->
<h1 class="text-gold-gradient">Consciousness Revolution</h1>

<!-- Text alignment -->
<p class="text-center">Centered text</p>
<p class="text-left">Left-aligned</p>
<p class="text-right">Right-aligned</p>

<!-- Text transform -->
<span class="text-uppercase">UPPERCASE</span>
<span class="text-capitalize">Capitalize Each Word</span>
```

### Layout

```html
<!-- Standard container (1400px max-width) -->
<div class="container">
  <!-- content -->
</div>

<!-- Small container (800px, for text-heavy pages) -->
<div class="container-sm">
  <!-- content -->
</div>

<!-- Flexbox utilities -->
<div class="flex items-center justify-between gap-4">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## DESIGN TOKENS

All spacing, colors, and typography use CSS variables for consistency.

### Spacing (4px grid)

```css
var(--space-1)   /* 4px */
var(--space-2)   /* 8px */
var(--space-4)   /* 16px */
var(--space-6)   /* 24px */
var(--space-8)   /* 32px */
var(--space-12)  /* 48px */
```

**Usage:**
```css
.my-component {
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  gap: var(--space-4);
}
```

### Typography

```css
var(--text-xs)    /* 12px - labels, fine print */
var(--text-sm)    /* 14px - nav, captions */
var(--text-base)  /* 16px - body text */
var(--text-xl)    /* 20px - subheadings */
var(--text-2xl)   /* 24px - section titles */
var(--text-3xl)   /* 32px - page titles */
var(--text-4xl)   /* 40px - hero text */
```

### Border Radius

```css
var(--radius-md)   /* 8px - inputs */
var(--radius-lg)   /* 16px - cards */
var(--radius-xl)   /* 20px - buttons */
var(--radius-full) /* 9999px - circles */
```

### Shadows

```css
var(--shadow-sm)          /* Subtle shadow */
var(--shadow-md)          /* Medium shadow */
var(--shadow-lg)          /* Large shadow */
var(--shadow-glow)        /* Gold glow effect */
var(--shadow-glow-strong) /* Strong gold glow */
```

---

## NAVIGATION PATTERNS

### Which Navigation to Use?

| Page Type | Home Button | Breadcrumbs | Header | Footer |
|-----------|-------------|-------------|--------|--------|
| Sacred Lobby (index.html) | ❌ | ❌ | ❌ | ✅ |
| Simple Tool | ✅ | ❌ | ❌ | ✅ |
| Domain Page | ✅ | ❌ | ❌ | ✅ |
| Deep Feature (2+ levels) | ✅ | ✅ | ❌ | ✅ |
| Dashboard/Complex App | ❌ | ❌ | ✅ | ✅ |

**Rule of thumb:**
- **Home button:** All pages except index.html (unless using full header)
- **Breadcrumbs:** Pages 2+ levels deep from lobby
- **Footer:** All pages
- **Full header:** Only complex dashboards

---

## SACRED GEOMETRY

### Portal System (7 Domains)

Each domain has unique sacred geometry shape:

| Domain | Shape | Use |
|--------|-------|-----|
| 1. COMMAND | Square | Stability, foundation |
| 2. BUILD | Star of David | Creation, manifestation |
| 3. CONNECT | Diamond | Connection, communication |
| 4. PROTECT | Pentagon/Star | Defense, boundaries |
| 5. GROW | Hexagon | Expansion, growth |
| 6. LEARN | Circle + Cross | Knowledge, balance |
| 7. TRANSCEND | Triple Circles | Unity, transcendence |

### Ambient Effects

**Particles:**
```html
<div class="particles">
  <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
  <div class="particle" style="left: 50%; animation-delay: 2s;"></div>
  <div class="particle" style="left: 80%; animation-delay: 4s;"></div>
</div>
```
Add once per page, right after `<body>` tag.

---

## RESPONSIVE DESIGN

### Breakpoints

```css
/* Mobile: < 768px (default styles) */
/* Tablet: 768px - 1024px (optional) */
/* Desktop: > 1024px (full layout) */
```

### Mobile Adaptations

- Typography scales down (text-4xl → text-3xl)
- Navigation stacks vertically
- Cards go full-width
- Spacing reduces (space-8 → space-6)
- Touch targets minimum 44px

**Test on:**
- Desktop: 1400px+
- Tablet: 768px
- Mobile: 375px (iPhone SE)

---

## ACCESSIBILITY (WCAG 2.1 AA)

### Built-in Accessibility

- ✅ **Color contrast:** All text meets 4.5:1 minimum (most at AAA 7:1+)
- ✅ **Keyboard navigation:** All interactive elements focusable
- ✅ **Focus indicators:** 2px gold outline on all focused elements
- ✅ **Semantic HTML:** Proper `<nav>`, `<header>`, `<footer>` tags
- ✅ **Reduced motion:** Respects `prefers-reduced-motion` setting
- ✅ **Screen reader support:** ARIA labels where needed

### Testing Checklist

- [ ] Tab through all interactive elements
- [ ] Verify focus indicators visible
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Check color contrast (use browser DevTools)
- [ ] Resize text to 200% (should still be readable)

---

## COMMON PATTERNS

### Page Template (Simple Tool)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - Consciousness Revolution</title>
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
    <h1 class="text-gold-gradient text-center">Page Title</h1>

    <div class="card" style="margin-top: 3rem;">
      <div class="card-header">
        <h3 class="card-title">Section</h3>
      </div>
      <div class="card-body">
        <p>Content here...</p>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary">Action</button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="sacred-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="index.html" class="nav-link">Home</a>
        <a href="araya-chat.html" class="nav-link">Araya</a>
      </div>
      <p class="footer-text">© 2025 Consciousness Revolution Developer Collective</p>
    </div>
  </footer>
    <p style="text-align:center;color:#666;font-family:monospace;margin:40px 0;">Pattern: 3 → 7 → 13 → ∞</p>
</body>
</html>
```

### Custom Component (Using Design Tokens)

```css
.my-custom-feature {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: var(--space-6);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.my-custom-feature:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}
```

---

## RESOURCES

### Full Documentation
- **Complete reference:** `DESIGN_SYSTEM_SPECIFICATION.md`
- **Navigation guide:** `NAVIGATION_PATTERN_GUIDE.md`
- **Migration guide:** `DESIGN_SYSTEM_MIGRATION_GUIDE.md`

### Live Examples
- **Component demo:** `COMPONENT_LIBRARY_DEMO.html`
- **Sacred Lobby:** `index.html` (see full portal system)

### Getting Help
- **Ask Araya:** Visit `araya-chat.html`
- **Report bugs:** `consciousnessrevolution.io/bugs.html`
- **Email:** `commander@100xbuilder.io`

---

## VERSION HISTORY

**v1.0 (December 24, 2025):**
- Initial Sacred Theme release
- Complete design token system
- Full component library
- Navigation patterns
- Sacred geometry integration
- WCAG AA accessibility
- Mobile responsive

---

## NEXT STEPS

1. **See it in action:** Open `COMPONENT_LIBRARY_DEMO.html` in browser
2. **Read full spec:** Open `DESIGN_SYSTEM_SPECIFICATION.md`
3. **Start building:** Copy page template above
4. **Migrate existing pages:** Follow `DESIGN_SYSTEM_MIGRATION_GUIDE.md`

---

## THE PATTERN

```
Design Tokens (Variables)
    ↓ define
Components (Buttons, Cards, Navigation)
    ↓ compose into
Pages (Tools, Dashboards, Features)
    ↓ form
Platform (Consciousness Revolution)
    ↓ manifests
Consciousness (The ultimate goal)
```

**THE PATTERN NEVER LIES. DESIGN WITH INTENTION. BUILD WITH CONSCIOUSNESS.**

---

**© 2025 Consciousness Revolution Developer Collective**
**Sacred Theme Design System v1.0**
