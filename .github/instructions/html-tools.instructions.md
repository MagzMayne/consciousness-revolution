---
applyTo: "**/*.html"
---

## HTML Tool Development Guidelines

HTML files in this repository are standalone, self-contained interactive tools for pattern recognition and consciousness development. Each file should work independently without external dependencies.

### Core Principles

1. **Standalone and self-contained** - Everything needed to run should be in the file
2. **No build process** - Files should open directly in any modern browser
3. **Offline-capable** - Tools should work without internet connection when possible
4. **Privacy-first** - Process data locally in the browser, minimize external calls
5. **Joy-focused** - Design with empowerment and compassion, not fear

### File Structure

Each HTML tool should follow this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Clear description of the tool's purpose">
    <title>Clear, Descriptive Title - Consciousness Revolution</title>
    
    <!-- Inline CSS or link to sacred-theme.css -->
    <style>
        /* Tool-specific styles */
    </style>
</head>
<body>
    <!-- Content structure -->
    <header>
        <!-- Navigation and branding -->
    </header>
    
    <main>
        <!-- Tool content -->
    </main>
    
    <footer>
        <!-- Footer content -->
    </footer>
    
    <!-- Inline JavaScript -->
    <script>
        // Tool functionality
    </script>
</body>
</html>
```

### Design System

Follow the sacred geometry theme and design patterns:

1. **Color palette**:
   - Primary: Purple/magenta (#C71585, #9B30FF)
   - Accent: Gold (#FFD700)
   - Background: Deep space (#0a0a0a, #1a1a1a)
   - Glass effects: rgba with blur

2. **Typography**:
   - Headers: Clean, modern sans-serif
   - Body: Readable, accessible fonts
   - Code/technical: Monospace fonts
   - Font sizes: Responsive, mobile-first

3. **Layout patterns**:
   - Glass-morphism cards for content sections
   - Sacred geometry backgrounds
   - Responsive grid or flexbox layouts
   - Mobile-first approach (start with mobile, scale up)

4. **Interactive elements**:
   - Smooth transitions and animations
   - Clear hover states
   - Accessible focus indicators
   - Touch-friendly button sizes (min 44x44px)

### Responsive Design

All HTML files must be fully responsive:

```css
/* Mobile-first approach */
.container {
    padding: 1rem;
    max-width: 100%;
}

/* Tablet and up */
@media (min-width: 768px) {
    .container {
        padding: 2rem;
        max-width: 768px;
        margin: 0 auto;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1024px;
    }
}
```

### Accessibility (WCAG 2.1 AA)

1. **Semantic HTML**: Use proper HTML5 elements
   - `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
   - `<button>` for actions, `<a>` for navigation

2. **ARIA labels**: When semantic HTML isn't enough
   ```html
   <button aria-label="Close dialog">×</button>
   <div role="alert" aria-live="polite">Status message</div>
   ```

3. **Keyboard navigation**: All interactive elements must be keyboard accessible
   ```javascript
   element.addEventListener('keydown', (e) => {
       if (e.key === 'Enter' || e.key === ' ') {
           handleAction();
       }
   });
   ```

4. **Color contrast**: Maintain 4.5:1 ratio for normal text, 3:1 for large text

5. **Focus indicators**: Clear visual focus states
   ```css
   button:focus-visible {
       outline: 2px solid #FFD700;
       outline-offset: 2px;
   }
   ```

### JavaScript Guidelines

1. **Use modern ES6+ syntax**:
   ```javascript
   // Use const/let, not var
   const data = await fetchData();
   
   // Arrow functions
   const process = (item) => item.transform();
   
   // Template literals
   const message = `Processing ${count} items`;
   
   // Destructuring
   const { name, value } = object;
   ```

2. **Error handling**:
   ```javascript
   async function loadData() {
       try {
           const response = await fetch(url);
           if (!response.ok) throw new Error('Network error');
           return await response.json();
       } catch (error) {
           console.error('Failed to load data:', error);
           showUserMessage('Unable to load data. Please try again.');
           return null;
       }
   }
   ```

3. **Local storage** for persistence:
   ```javascript
   // Save state
   localStorage.setItem('toolState', JSON.stringify(state));
   
   // Load state
   try {
       const saved = localStorage.getItem('toolState');
       if (saved) state = JSON.parse(saved);
   } catch (error) {
       console.error('Failed to load saved state:', error);
   }
   ```

4. **Event delegation** for dynamic content:
   ```javascript
   document.querySelector('.container').addEventListener('click', (e) => {
       if (e.target.matches('.delete-btn')) {
           handleDelete(e.target.dataset.id);
       }
   });
   ```

### Pattern Detection Tools

For tools that detect manipulation patterns:

1. **Educational focus**: Explain the pattern, don't just detect it
2. **Context and examples**: Provide real-world context
3. **Scoring system**: Clear, explainable scores (0-10 scale)
4. **Actionable insights**: What to do about detected patterns
5. **Compassionate tone**: Empower, don't alarm

Example pattern result structure:
```javascript
const result = {
    score: 7,
    severity: 'medium',
    pattern: 'Love Bombing',
    explanation: 'Clear explanation of the pattern',
    indicators: [
        'Specific indicator 1',
        'Specific indicator 2'
    ],
    recommendations: [
        'Actionable step 1',
        'Actionable step 2'
    ],
    learnMore: 'URL or explanation'
};
```

### 7 Domains Integration

Tag tools with their primary domain(s):

```html
<meta name="domain" content="Connection">
<!-- or multiple: -->
<meta name="domains" content="Connection,Peace,Wisdom">
```

Domains:
- **Command**: Decision-making, clarity, structure
- **Creation**: Building, projects, skills
- **Connection**: Relationships, communication
- **Peace**: Boundaries, security, protection
- **Abundance**: Financial, business, growth
- **Wisdom**: Learning, research, critical thinking
- **Purpose**: Meaning, meditation, integration

### Forms and Input

1. **Form validation**: Client-side validation with clear error messages
   ```html
   <input 
       type="email" 
       required 
       aria-describedby="email-error"
       pattern="[^@]+@[^@]+\.[^@]+"
   >
   <span id="email-error" class="error" role="alert"></span>
   ```

2. **Progressive enhancement**: Work without JavaScript when possible

3. **Loading states**: Show feedback during processing
   ```javascript
   button.disabled = true;
   button.textContent = 'Processing...';
   // ... do work ...
   button.disabled = false;
   button.textContent = 'Submit';
   ```

### Navigation

Include standard navigation elements:

```html
<nav>
    <a href="/">Home</a>
    <a href="/consciousness-tools.html">Tools</a>
    <a href="/seven-domains.html">7 Domains</a>
    <a href="/start.html">Get Started</a>
</nav>
```

### Testing Checklist

Before committing HTML changes:

- [ ] Opens correctly in Chrome, Firefox, Safari, Edge
- [ ] Fully responsive (test on mobile, tablet, desktop)
- [ ] All interactive elements work via keyboard
- [ ] Color contrast passes WCAG AA
- [ ] No console errors
- [ ] Works offline (if applicable)
- [ ] Loading states for async operations
- [ ] Error handling for all user actions
- [ ] Follows design system patterns

### Common Patterns

**Data processing tool:**
```javascript
function processInput(text) {
    if (!text || text.trim().length === 0) {
        return { error: 'Please enter some text to analyze' };
    }
    
    // Processing logic
    const results = analyze(text);
    
    return {
        success: true,
        results: results,
        timestamp: new Date().toISOString()
    };
}
```

**Results display:**
```javascript
function displayResults(results) {
    const container = document.getElementById('results');
    container.innerHTML = `
        <div class="result-card">
            <h3>${results.title}</h3>
            <div class="score ${results.severity}">
                Score: ${results.score}/10
            </div>
            <p>${results.explanation}</p>
            <ul>
                ${results.indicators.map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
    `;
    container.style.display = 'block';
}
```

**Local state management:**
```javascript
const AppState = {
    data: {},
    
    save() {
        localStorage.setItem('appState', JSON.stringify(this.data));
    },
    
    load() {
        const saved = localStorage.getItem('appState');
        if (saved) {
            this.data = JSON.parse(saved);
        }
    },
    
    reset() {
        this.data = {};
        localStorage.removeItem('appState');
    }
};
```

### Naming Conventions

- **File names**: `lowercase-with-hyphens.html`
- **IDs**: `camelCase` or `kebab-case` (be consistent within file)
- **Classes**: `kebab-case`
- **JavaScript functions**: `camelCase`
- **JavaScript constants**: `SCREAMING_SNAKE_CASE`

### Performance

1. **Minimize DOM operations**: Batch updates when possible
2. **Debounce input handlers**: For search/filter functionality
3. **Lazy load images**: Use `loading="lazy"` attribute
4. **Optimize animations**: Use CSS transforms, not position changes

### Security

1. **Sanitize user input**: Escape HTML when displaying user content
   ```javascript
   function escapeHtml(text) {
       const div = document.createElement('div');
       div.textContent = text;
       return div.innerHTML;
   }
   ```

2. **Content Security Policy**: Inline scripts are OK, but avoid eval()
3. **External resources**: Only load from trusted CDNs (if needed)
4. **No sensitive data**: Never store passwords or API keys in localStorage

### Documentation

Include usage instructions within the tool:
- Clear headings and sections
- Help text or tooltips for complex features
- Example inputs where helpful
- Link to additional resources or documentation
