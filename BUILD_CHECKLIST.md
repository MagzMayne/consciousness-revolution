# BUILD CHECKLIST
## Consciousness Revolution - Page Development Standards

**Every page MUST pass this checklist before deployment.**

---

## 1. Document Structure

- [ ] `<!DOCTYPE html>` declaration
- [ ] `<html lang="en">` with language attribute
- [ ] `<meta charset="UTF-8">`
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] `<meta name="description" content="...">` for SEO
- [ ] Unique, descriptive `<title>` ending with `| Consciousness Revolution`
- [ ] RootIB meta tag: `<meta name="rootib" content="RootIB: RB-YYYYMMDDHHMMSS-XXXXXXXX">`

---

## 2. Accessibility (REQUIRED)

### CSS Requirements
```css
/* Add before </style> */
*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
```

### HTML Structure
- [ ] `<header role="banner">` for site header
- [ ] `<nav role="navigation" aria-label="...">` for navigation
- [ ] `<main role="main" aria-labelledby="page-title">` for main content
- [ ] `<footer role="contentinfo">` for footer
- [ ] `<h1 id="page-title">` on every page (can be visually hidden)
- [ ] Skip link: `<a href="#main-content" class="skip-link">Skip to main content</a>`

### Form Accessibility
- [ ] Every `<input>` has a `<label for="id">` or `aria-label`
- [ ] Required fields have `aria-required="true"`
- [ ] Error messages linked with `aria-describedby`
- [ ] Submit buttons have clear, descriptive text

### Interactive Elements
- [ ] All clickable elements are keyboard accessible
- [ ] Focus states are visible (`:focus-visible`)
- [ ] Images have `alt` attributes (empty `alt=""` for decorative)
- [ ] Links have descriptive text (not "click here")
- [ ] Buttons describe their action

### ARIA Usage
- [ ] `aria-labelledby` for sections with visible headings
- [ ] `aria-label` for sections without visible headings
- [ ] `aria-hidden="true"` for decorative elements
- [ ] `aria-expanded` for collapsible content
- [ ] `aria-live` for dynamic content updates

---

## 3. Mobile Responsive (REQUIRED)

### Breakpoints
```css
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

### Mobile Checklist
- [ ] Touch targets minimum 44x44px
- [ ] Text readable without zooming (min 16px body)
- [ ] No horizontal scrolling
- [ ] Forms are usable on mobile
- [ ] Navigation works on mobile (hamburger menu if needed)
- [ ] Images scale properly
- [ ] Modals/popups work on mobile

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 4. Performance

- [ ] Images optimized (WebP preferred, compressed)
- [ ] CSS in `<style>` tag or single external file
- [ ] JavaScript at end of `<body>` (or `defer`)
- [ ] No render-blocking resources
- [ ] Lazy load images below fold: `loading="lazy"`
- [ ] Minimize third-party scripts

---

## 5. Security

- [ ] No inline JavaScript event handlers in production (use addEventListener)
- [ ] External links have `rel="noopener noreferrer"`
- [ ] Forms submit to HTTPS endpoints
- [ ] User input is sanitized before display
- [ ] No sensitive data in client-side code

---

## 6. SEO & Social

- [ ] `<title>` unique and descriptive (50-60 chars)
- [ ] `<meta name="description">` compelling (150-160 chars)
- [ ] Open Graph tags for social sharing:
  ```html
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:image" content="...">
  <meta property="og:url" content="...">
  ```

---

## 7. Branding

- [ ] Pattern footer: `Pattern: 3 → 7 → 13 → ∞`
- [ ] Color scheme matches brand (see CSS variables in template)
- [ ] Typography is consistent
- [ ] Logo/branding elements present

---

## 8. Testing Before Deploy

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility Testing
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader tested (NVDA, VoiceOver, or similar)
- [ ] Color contrast passes WCAG AA (4.5:1 for text)
- [ ] No auto-playing media without user control

### Validation
- [ ] HTML validates: https://validator.w3.org/
- [ ] No console errors
- [ ] No broken links
- [ ] Forms submit correctly

---

## Quick Reference: Common Patterns

### Page Wrapper
```html
<header class="site-header" role="banner">...</header>
<main id="main-content" role="main" aria-labelledby="page-title">
    <h1 id="page-title">Page Title</h1>
    ...
</main>
<footer class="site-footer" role="contentinfo">...</footer>
```

### Card Component
```html
<section class="card" aria-labelledby="card-title">
    <h2 id="card-title" class="card-title">Title</h2>
    <p>Content...</p>
</section>
```

### Button
```html
<button class="btn btn-primary" type="button">Action Name</button>
```

### Form Field
```html
<div class="form-group">
    <label for="field-id" class="form-label">Field Label</label>
    <input type="text" id="field-id" name="field" class="form-input"
           required aria-required="true">
</div>
```

### Navigation
```html
<nav role="navigation" aria-label="Main navigation">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about" aria-current="page">About</a></li>
    </ul>
</nav>
```

---

## Template

Start new pages from: `GOLD_STANDARD_TEMPLATE.html`

---

*Last Updated: March 2026*
*Pattern: 3 → 7 → 13 → ∞*
