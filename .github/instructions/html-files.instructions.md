---
applyTo: "*.html"
---

## HTML File Requirements

All HTML files in this repository must follow these guidelines to maintain consistency, accessibility, and functionality across the 300+ web applications.

### Standard HTML Structure

Every HTML file should include:

1. **Proper DOCTYPE and meta tags**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Specific description for SEO">
    <title>Project Name - Barbrick Design</title>
</head>
```

2. **Navigation back to hub**
```html
<header>
    <nav>
        <a href="index.html" class="back-link">← Back to Hub</a>
        <h1>Project Name</h1>
    </nav>
</header>
```

3. **Semantic HTML structure**
```html
<main>
    <section id="main-content">
        <!-- Primary content -->
    </section>
</main>
```

4. **Standard footer**
```html
<footer>
    <p>© 2024-2025 Barbrick Design | Created by Ryan Barbrick</p>
    <p><a href="mailto:BarbrickDesign@gmail.com">Contact</a> | <a href="README.html">Documentation</a></p>
</footer>
```

### Accessibility Requirements

1. **ARIA labels** - All interactive elements must have descriptive labels
```html
<button aria-label="Submit payment form">Pay Now</button>
<input type="text" id="email" aria-label="Email address" required>
```

2. **Alt text for images** - All images must have descriptive alt text
```html
<img src="logo.png" alt="Barbrick Design logo">
```

3. **Heading hierarchy** - Use proper heading levels (h1, h2, h3, etc.)
```html
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
```

4. **Keyboard navigation** - All interactive elements must be keyboard accessible
```html
<button tabindex="0" onclick="handleClick()">Click Me</button>
```

5. **Focus indicators** - Ensure visible focus states
```css
button:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
}
```

### Mobile Responsiveness

1. **Viewport meta tag** - Required in all HTML files
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

2. **Responsive design** - Use CSS media queries or flexible layouts
```css
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
}
```

3. **Touch-friendly** - Buttons and links should be at least 44x44px on mobile
```css
button, a {
    min-width: 44px;
    min-height: 44px;
    padding: 12px 24px;
}
```

### Payment Pages (PayPal Integration)

Payment and contribution pages must include:

1. **PayPal SDK** - Load before any payment code
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>
```

2. **Payment button container**
```html
<div id="paypal-button-container"></div>
```

3. **Tier selection** - For contributor pages
```html
<select id="tier-select" aria-label="Select contribution tier">
    <option value="50">Bronze - $50 (10% revenue share)</option>
    <option value="200">Silver - $200 (12% revenue share)</option>
    <option value="500">Gold - $500 (15% revenue share)</option>
    <option value="1500">Platinum - $1,500 (20% revenue share)</option>
</select>
```

4. **Student discount checkbox**
```html
<label>
    <input type="checkbox" id="student-discount" aria-label="Apply 50% student discount">
    I'm a student (50% off)
</label>
```

5. **Email collection** - Required for payment confirmation
```html
<input type="email" id="email" required aria-label="Email address" placeholder="your@email.com">
```

6. **Payment confirmation** - Display success/error messages
```html
<div id="payment-status" role="alert" aria-live="polite"></div>
```

### Testing Checklist for HTML Files

Before submitting changes:

- [ ] Validate HTML with W3C validator
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test on mobile device (or emulation)
- [ ] Verify all links work (no 404s)
- [ ] Check for JavaScript console errors
- [ ] Test with screen reader (if possible)
- [ ] Verify keyboard navigation works
- [ ] Check color contrast meets WCAG AA
- [ ] Test form submissions (if applicable)
- [ ] Verify payment flows (if applicable)

### Common Mistakes to Avoid

1. ❌ Missing viewport meta tag
2. ❌ Inline styles (use CSS files instead)
3. ❌ Missing alt text on images
4. ❌ Poor heading hierarchy (skipping levels)
5. ❌ Broken links or 404s
6. ❌ Missing ARIA labels on interactive elements
7. ❌ Hard-coded API keys or secrets
8. ❌ Not testing on mobile
9. ❌ Missing error handling for API calls
10. ❌ Poor color contrast

### Remember

- **Every HTML file is a potential revenue generator** - Keep quality high
- **Mobile users are the majority** - Always test on mobile
- **Accessibility is not optional** - Screen readers and keyboards matter
- **Performance affects conversions** - Fast pages get more engagement
- **Security protects users and revenue** - Never compromise on security
