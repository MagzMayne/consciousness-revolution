# CONSCIOUSNESS REVOLUTION - DESIGN SYSTEM SPECIFICATION
## Sacred Theme Design Language
**Version:** 1.0
**Last Updated:** December 24, 2025
**Author:** C2 Architect

---

## TABLE OF CONTENTS

1. [Design Philosophy](#design-philosophy)
2. [Getting Started](#getting-started)
3. [Design Tokens](#design-tokens)
4. [Component Library](#component-library)
5. [Navigation Patterns](#navigation-patterns)
6. [Sacred Geometry System](#sacred-geometry-system)
7. [Responsive Guidelines](#responsive-guidelines)
8. [Accessibility Standards](#accessibility-standards)
9. [Implementation Guide](#implementation-guide)

---

## DESIGN PHILOSOPHY

### Core Principles

**1. Sacred Simplicity**
- Clean, uncluttered interfaces that focus attention
- Every element serves a purpose
- White space is sacred space

**2. Consciousness-First Design**
- Dark backgrounds reduce eye strain for deep work
- Gold accents represent enlightenment and value
- Sacred geometry creates subconscious harmony

**3. Pattern Theory Integration**
- 7 Domain colors map to chakra system
- Fractal scaling from elements → pages → system
- 3 → 7 → 13 → ∞ pattern embedded throughout

**4. Professional Mysticism**
- Serious platform with elevated aesthetic
- No childish or gimmicky elements
- Enterprise-grade quality with spiritual depth

### Visual Language

```
Dark Cosmos (Background)
    ↓
Gold Light (Primary Actions)
    ↓
7 Domain Colors (Navigation)
    ↓
Sacred Geometry (Structure)
    ↓
Consciousness (Result)
```

---

## GETTING STARTED

### Quick Integration

**Step 1:** Add CSS link to `<head>`:
```html
<link rel="stylesheet" href="sacred-theme.css">
```

**Step 2:** Add standard page structure:
```html
<body>
  <!-- Ambient particles (optional) -->
  <div class="particles">
    <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
    <div class="particle" style="left: 50%; animation-delay: 2s;"></div>
    <div class="particle" style="left: 80%; animation-delay: 4s;"></div>
  </div>

  <!-- Home button (return to lobby) -->
  <a href="index.html" class="home-button">
    ← Sacred Lobby
  </a>

  <!-- Your content -->
  <div class="container">
    <h1 class="text-gold-gradient">Your Page Title</h1>
    <!-- content here -->
  </div>

  <!-- Footer (optional) -->
  <footer class="sacred-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="index.html" class="nav-link">Home</a>
        <a href="about.html" class="nav-link">About</a>
      </div>
      <p class="footer-text">© 2025 Consciousness Revolution Developer Collective</p>
    </div>
  </footer>
</body>
```

**Step 3:** Use design tokens in custom CSS:
```css
.my-component {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
}
```

---

## DESIGN TOKENS

### Color System

#### Background Colors
```css
--bg-primary: #0f0f1a        /* Deep cosmic black */
--bg-secondary: #1a1a2e      /* Lighter black for cards */
--bg-gradient: radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)
```

#### Primary Colors (Gold)
```css
--color-primary: #FFD700           /* Pure gold */
--color-primary-light: #FFA500     /* Orange-gold */
--color-primary-gradient: linear-gradient(135deg, #FFD700, #FFA500, #FFD700)
```

#### Text Colors
```css
--text-primary: #F7FAFC           /* Almost white (100%) */
--text-secondary: rgba(...)       /* 70% opacity */
--text-muted: rgba(...)           /* 60% opacity */
--text-disabled: rgba(...)        /* 40% opacity */
```

#### 7 Domain Colors (Chakra System)
| Domain | Color | Hex | Chakra |
|--------|-------|-----|--------|
| 1. COMMAND | Red | `#FF6B6B` | Root |
| 2. BUILD | Orange | `#FFA94D` | Sacral |
| 3. CONNECT | Yellow | `#FFE066` | Solar |
| 4. PROTECT | Green | `#69DB7C` | Heart |
| 5. GROW | Blue | `#74C0FC` | Throat |
| 6. LEARN | Indigo | `#9775FA` | Third Eye |
| 7. TRANSCEND | Violet | `#E599F7` | Crown |

**Usage:**
```css
.domain-1-element { color: var(--domain-1-command); }
.domain-2-element { color: var(--domain-2-build); }
/* etc */
```

### Typography

#### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'Monaco', 'Courier New', monospace
```

#### Font Size Scale
| Name | Size | Pixels | Use Case |
|------|------|--------|----------|
| `--text-xs` | 0.75rem | 12px | Fine print, labels |
| `--text-sm` | 0.875rem | 14px | Navigation, subtitles |
| `--text-base` | 1rem | 16px | Body text |
| `--text-lg` | 1.125rem | 18px | Emphasis |
| `--text-xl` | 1.25rem | 20px | Subheadings |
| `--text-2xl` | 1.5rem | 24px | Section titles |
| `--text-3xl` | 2rem | 32px | Page titles |
| `--text-4xl` | 2.5rem | 40px | Hero text |
| `--text-5xl` | 3rem | 48px | Landing page hero |

#### Font Weights
```css
--weight-normal: 400      /* Body text */
--weight-medium: 500      /* Subtle emphasis */
--weight-semibold: 600    /* Strong emphasis */
--weight-bold: 700        /* Headings */
```

#### Letter Spacing
```css
--tracking-tight: -0.025em    /* Large headings */
--tracking-normal: 0          /* Body text */
--tracking-wide: 0.1em        /* Buttons, labels */
--tracking-wider: 0.15em      /* Navigation */
--tracking-widest: 0.2em      /* Titles */
```

### Spacing Scale

**Based on 4px grid:**
```css
--space-1: 0.25rem   (4px)
--space-2: 0.5rem    (8px)
--space-3: 0.75rem   (12px)
--space-4: 1rem      (16px)
--space-5: 1.25rem   (20px)
--space-6: 1.5rem    (24px)
--space-8: 2rem      (32px)
--space-10: 2.5rem   (40px)
--space-12: 3rem     (48px)
--space-16: 4rem     (64px)
--space-20: 5rem     (80px)
```

**Usage Pattern:**
- Tight spacing (1-2): Between related elements
- Medium spacing (3-6): Between components
- Large spacing (8-12): Between sections
- Extra large (16-20): Page margins, major sections

### Border Radius

```css
--radius-sm: 0.25rem     (4px)   - Small elements, tags
--radius-md: 0.5rem      (8px)   - Inputs, small cards
--radius-lg: 1rem        (16px)  - Cards, modals
--radius-xl: 1.25rem     (20px)  - Buttons, navigation
--radius-2xl: 1.5rem     (24px)  - Large cards
--radius-full: 9999px            - Circular elements
```

### Shadows

```css
--shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.3)
--shadow-md: 0 4px 20px rgba(0, 0, 0, 0.4)
--shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.5)
--shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.6)
--shadow-glow: 0 0 20px rgba(255, 215, 0, 0.3)
--shadow-glow-strong: 0 0 40px rgba(255, 215, 0, 0.5)
```

### Transitions

```css
--transition-fast: 0.15s ease    /* Micro-interactions */
--transition-base: 0.3s ease     /* Standard hover effects */
--transition-slow: 0.5s ease     /* Large movements */
```

### Z-Index Layers

```css
--z-base: 1              /* Ambient particles, background effects */
--z-dropdown: 100        /* Dropdowns, tooltips */
--z-modal: 200           /* Modals, overlays */
--z-notification: 300    /* Notifications, alerts */
--z-top: 999             /* Critical UI (loading screens) */
```

---

## COMPONENT LIBRARY

### Buttons

#### Primary Button (Gold - Call to Action)
```html
<button class="btn btn-primary">Get Started</button>
```
**Use for:** Primary actions, main CTAs, submit buttons

#### Secondary Button (Outlined)
```html
<button class="btn btn-secondary">Learn More</button>
```
**Use for:** Secondary actions, alternative options

#### Ghost Button (Minimal)
```html
<button class="btn btn-ghost">Cancel</button>
```
**Use for:** Tertiary actions, navigation

#### Domain-Colored Buttons
```html
<button class="btn btn-ghost btn-domain-1">Command</button>
<button class="btn btn-ghost btn-domain-2">Build</button>
<button class="btn btn-ghost btn-domain-7">Transcend</button>
```
**Use for:** Domain-specific actions, navigation to domain pages

### Cards

#### Basic Card
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Subtitle text</p>
  </div>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-secondary">Action</button>
  </div>
</div>
```

#### Domain-Colored Card
```html
<div class="card card-domain-4">
  <!-- Domain 4 (PROTECT) themed card -->
</div>
```

### Navigation Components

#### Home Button (Return to Lobby)
```html
<a href="index.html" class="home-button">
  ← Sacred Lobby
</a>
```
**Fixed position in top-left corner**

#### Navigation Links
```html
<nav class="sacred-nav">
  <a href="page1.html" class="nav-link">Page 1</a>
  <a href="page2.html" class="nav-link active">Page 2</a>
  <a href="page3.html" class="nav-link">Page 3</a>
</nav>
```

#### Breadcrumbs
```html
<div class="sacred-breadcrumbs">
  <a href="index.html" class="breadcrumb-link">Home</a>
  <span class="breadcrumb-separator">/</span>
  <a href="domain-1.html" class="breadcrumb-link">Command</a>
  <span class="breadcrumb-separator">/</span>
  <span>Current Page</span>
</div>
```

#### Full Header Component
```html
<header class="sacred-header">
  <div class="sacred-header-inner">
    <a href="index.html" class="sacred-logo">
      <svg class="sacred-logo-icon" viewBox="0 0 100 100">
        <!-- Metatron's Cube or logo SVG -->
      </svg>
      <span>CONSCIOUSNESS REVOLUTION</span>
    </a>
    <nav class="sacred-nav">
      <a href="workspace.html" class="nav-link">Build</a>
      <a href="course-dashboard.html" class="nav-link">Learn</a>
      <a href="araya-chat.html" class="nav-link">Araya</a>
    </nav>
  </div>
</header>
```

#### Footer Component
```html
<footer class="sacred-footer">
  <div class="footer-inner">
    <div class="footer-links">
      <a href="index.html" class="nav-link">Home</a>
      <a href="ABOUT.html" class="nav-link">About</a>
      <a href="araya-chat.html" class="nav-link">Contact</a>
    </div>
    <p class="footer-text">
      © 2025 Consciousness Revolution Developer Collective. Credit to all contributors.
    </p>
  </div>
</footer>
```

### Text Utilities

#### Gold Gradient Text (Hero Headings)
```html
<h1 class="text-gold-gradient">Consciousness Revolution</h1>
```

#### Alignment
```html
<p class="text-center">Centered text</p>
<p class="text-left">Left-aligned text</p>
<p class="text-right">Right-aligned text</p>
```

#### Text Transform
```html
<span class="text-uppercase">UPPERCASE</span>
<span class="text-capitalize">Capitalize Each Word</span>
```

### Layout Utilities

#### Containers
```html
<!-- Standard container (1400px max-width) -->
<div class="container">
  <!-- content -->
</div>

<!-- Small container (800px max-width, for text-heavy pages) -->
<div class="container-sm">
  <!-- content -->
</div>
```

#### Flexbox Utilities
```html
<div class="flex items-center justify-between gap-4">
  <span>Left</span>
  <span>Right</span>
</div>

<div class="flex flex-col items-center gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Ambient Effects

#### Particle System
```html
<div class="particles">
  <div class="particle" style="left: 10%; animation-delay: 0s;"></div>
  <div class="particle" style="left: 30%; animation-delay: 2s;"></div>
  <div class="particle" style="left: 50%; animation-delay: 4s;"></div>
  <div class="particle" style="left: 70%; animation-delay: 1s;"></div>
  <div class="particle" style="left: 90%; animation-delay: 3s;"></div>
</div>
```
**Place once per page, before closing `</body>`**

---

## NAVIGATION PATTERNS

### Primary Navigation Pattern

**Every page should have:**
1. **Home button** (top-left) → Returns to Sacred Lobby (index.html)
2. **Breadcrumbs** (optional, for deep pages) → Show path
3. **Footer links** (bottom) → Site-wide navigation

### Navigation Hierarchy

```
index.html (Sacred Lobby)
    ↓
7 Domain Portals
    ↓
Domain-specific pages
    ↓
Tools/features within domain
```

### Example Page Structure

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
  <!-- Ambient particles -->
  <div class="particles">
    <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
    <div class="particle" style="left: 50%; animation-delay: 2s;"></div>
    <div class="particle" style="left: 80%; animation-delay: 4s;"></div>
  </div>

  <!-- Home button -->
  <a href="index.html" class="home-button">← Sacred Lobby</a>

  <!-- Optional: Breadcrumbs -->
  <div style="padding: 2rem;">
    <div class="sacred-breadcrumbs">
      <a href="index.html" class="breadcrumb-link">Home</a>
      <span class="breadcrumb-separator">/</span>
      <a href="SEVEN_DOMAINS_DASHBOARD.html" class="breadcrumb-link">Command</a>
      <span class="breadcrumb-separator">/</span>
      <span>Current Page</span>
    </div>
  </div>

  <!-- Main content -->
  <div class="container" style="padding: 4rem 0;">
    <h1 class="text-gold-gradient text-center">Page Title</h1>

    <!-- Your content here -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Section Title</h3>
      </div>
      <div class="card-body">
        <p>Content goes here...</p>
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
</body>
</html>
```

---

## SACRED GEOMETRY SYSTEM

### Portal Components (7 Domains)

Each domain has a unique shape + color from sacred geometry:

| Domain | Shape | SVG Pattern |
|--------|-------|-------------|
| 1. COMMAND | Square | `<rect>` |
| 2. BUILD | Double Triangle | Star of David pattern |
| 3. CONNECT | Diamond | Rotated square |
| 4. PROTECT | Pentagon | 5-pointed star |
| 5. GROW | Hexagon | 6 sides |
| 6. LEARN | Circle + Cross | Medicine wheel |
| 7. TRANSCEND | Triple Circle | Vesica piscis |

### Usage Example

```html
<a href="workspace.html" class="portal portal-2">
  <svg class="portal-shape" viewBox="0 0 100 100">
    <polygon points="50,10 90,75 10,75" fill="none" stroke="currentColor" stroke-width="3"/>
    <polygon points="50,90 10,25 90,25" fill="none" stroke="currentColor" stroke-width="3"/>
  </svg>
  <span class="portal-label">Build</span>
</a>
```

### Flower of Life Pattern

**Usage:** Background decoration, sacred lobby

```html
<svg class="flower-of-life" viewBox="0 0 400 400">
  <circle class="flower-circle" cx="200" cy="200" r="50"/>
  <!-- 6 surrounding circles -->
  <circle class="flower-circle" cx="200" cy="150" r="50"/>
  <circle class="flower-circle" cx="243" cy="175" r="50"/>
  <!-- etc... -->
</svg>
```

### Metatron's Cube (Center Portal)

**Symbolism:** Unity of all domains, gateway to Araya

```html
<svg class="metatron" viewBox="0 0 100 100">
  <polygon points="50,5 93,27 93,73 50,95 7,73 7,27"
           fill="none" stroke="#FFD700" stroke-width="1"/>
  <line x1="50" y1="5" x2="50" y2="95" stroke="#FFD700" stroke-width="0.5"/>
  <!-- Additional sacred geometry lines -->
</svg>
```

---

## RESPONSIVE GUIDELINES

### Breakpoints

```css
/* Mobile: < 768px (inherits default styles) */
/* Tablet: 768px - 1024px (optional intermediate) */
/* Desktop: > 1024px (max-width containers) */
```

### Mobile Adaptations

**Typography:**
- Reduce heading sizes (text-4xl → text-3xl → text-2xl)
- Increase line-height for readability

**Layout:**
- Stack flex items vertically
- Reduce spacing (space-8 → space-6)
- Full-width cards on mobile

**Navigation:**
- Simplify top navigation (hamburger menu optional)
- Larger touch targets (min 44px height)

**Sacred Geometry:**
- Reduce portal sizes (120px → 80px)
- Simplify Flower of Life (fewer circles)

### Example Mobile Styles

```css
@media (max-width: 768px) {
  .sacred-nav {
    flex-direction: column;
    gap: var(--space-3);
  }

  .card {
    padding: var(--space-4);
  }

  .home-button {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-xs);
  }
}
```

---

## ACCESSIBILITY STANDARDS

### WCAG 2.1 Level AA Compliance

**Color Contrast:**
- Gold (#FFD700) on dark bg: 11.2:1 (AAA)
- Text primary (#F7FAFC) on dark bg: 17.8:1 (AAA)
- All domain colors tested for 4.5:1 minimum

**Keyboard Navigation:**
- All interactive elements focusable
- Visible focus indicators (2px gold outline)
- Logical tab order

**Screen Readers:**
- Semantic HTML (`<nav>`, `<header>`, `<footer>`)
- `alt` text on all images/SVGs
- ARIA labels where needed

**Motion:**
- Respects `prefers-reduced-motion`
- All animations can be disabled

### Implementation Checklist

```html
<!-- Semantic HTML -->
<nav aria-label="Main navigation">
  <a href="/" aria-current="page">Home</a>
</nav>

<!-- Alt text -->
<img src="logo.png" alt="Consciousness Revolution logo">

<!-- ARIA labels -->
<button aria-label="Close modal">×</button>

<!-- Focus management -->
<a href="#" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" data-weed-fixed="true" class="btn btn-primary" tabindex="0">Action</a>
```

---

## IMPLEMENTATION GUIDE

### Step-by-Step Integration

#### 1. Add Sacred Theme CSS

```html
<head>
  <link rel="stylesheet" href="sacred-theme.css">
</head>
```

#### 2. Add Standard Page Wrapper

```html
<body>
  <!-- Particles (optional) -->
  <div class="particles">
    <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
    <div class="particle" style="left: 50%; animation-delay: 2s;"></div>
    <div class="particle" style="left: 80%; animation-delay: 4s;"></div>
  </div>

  <!-- Home button -->
  <a href="index.html" class="home-button">← Sacred Lobby</a>

  <!-- Your content -->
  <main class="container" style="padding: 4rem 0;">
    <!-- page content -->
  </main>

  <!-- Footer -->
  <footer class="sacred-footer">
    <!-- footer content -->
  </footer>
</body>
```

#### 3. Use Design Tokens

```css
/* Custom component using design system */
.my-feature {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: var(--space-6);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.my-feature:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}
```

#### 4. Test Responsive Behavior

```
1. Desktop (1400px+): Full layout
2. Tablet (768px-1024px): Adjusted spacing
3. Mobile (<768px): Stacked layout
```

#### 5. Verify Accessibility

```
- Tab through all interactive elements
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Check color contrast with browser tools
- Test keyboard-only navigation
```

---

## QUICK REFERENCE CARD

### Most Common Patterns

**Page Template:**
```html
<link rel="stylesheet" href="sacred-theme.css">
<a href="index.html" class="home-button">← Sacred Lobby</a>
<div class="container">
  <h1 class="text-gold-gradient">Title</h1>
</div>
```

**Card:**
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-body">Content</div>
</div>
```

**Button:**
```html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary">Secondary</button>
```

**Custom Styling:**
```css
.my-thing {
  background: var(--bg-secondary);
  color: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
```

---

## VERSION HISTORY

**v1.0 (Dec 24, 2025):**
- Initial design system specification
- Extracted from index.html sacred lobby
- Comprehensive component library
- Full token system

---

## CONTACT & SUPPORT

**Questions?** Ask Araya at araya-chat.html
**Updates?** Check CHANGELOG.md
**Bugs?** Report at consciousnessrevolution.io/bugs.html

---

**THE PATTERN NEVER LIES. DESIGN WITH INTENTION. BUILD WITH CONSCIOUSNESS.**
