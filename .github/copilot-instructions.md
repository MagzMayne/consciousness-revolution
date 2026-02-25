# GitHub Copilot Instructions for Barbrick Design Repository

This is a comprehensive web projects hub with 300+ interactive applications, games, tools, and AI systems. The repository serves as both a showcase and a functional platform for generating income through government grants, contributor revenue sharing, and licensing.

## Project Overview

**Repository Type**: GitHub Pages hosted web application hub
**Primary Languages**: JavaScript, HTML5, CSS3
**Backend**: Node.js for local development and services
**Target**: Web browsers (Chrome, Firefox, Safari, Edge)
**Creator**: Ryan Barbrick (BarbrickDesign@gmail.com)
**AI Assistant**: Merlin AI

## Core Technologies

### Frontend Stack
- **HTML5**: Modern semantic HTML with web components
- **JavaScript (ES6+)**: Vanilla JS, no heavy frameworks (performance priority)
- **CSS3**: Custom styling, mobile-first responsive design
- **3D Graphics**: Babylon.js and Three.js for 3D visualization
- **AI/ML**: TensorFlow.js for in-browser machine learning

### Backend Stack
- **Node.js** (>=16.0.0): Local development server and microservices
- **Express.js**: REST API endpoints and service orchestration
- **Discord.js**: Bot integration for community engagement

### Blockchain Integration
- **Solana**: Primary blockchain for wallet operations and NFTs
- **Ethereum**: Smart contracts and DeFi operations
- **Tron**: Alternative blockchain support
- **Web3.js**: Blockchain interaction libraries

## Repository Structure

```
/
├── .github/               # GitHub Actions workflows and scripts
│   ├── workflows/         # CI/CD automation
│   ├── scripts/           # Automation scripts
│   └── copilot-instructions.md  # This file
├── backend/               # Node.js backend services
├── src/                   # Source code and utilities
│   ├── agents/            # Autonomous agent systems
│   ├── utils/             # Shared utility modules
│   └── ai/                # AI and ML components
├── js/                    # JavaScript libraries
├── css/                   # Stylesheets
├── docs/                  # Documentation
├── projects/              # Individual project directories
├── *.html                 # 300+ standalone web applications
└── *.js                   # Standalone JavaScript files

Key Files:
- index.html               # Main hub and project gallery
- README.md                # User-facing documentation
- package.json             # Node.js dependencies and scripts
- projects.json            # Complete catalog of all 373 projects
```

## Development Workflow

### Before Making Changes
1. **Understand the monetization impact**: This repository generates income through:
   - Government grant applications (primary revenue)
   - Contributor revenue sharing (10-20% of grants)
   - Project licensing and demonstrations
   - AI agent services
2. **Check existing functionality**: Run `npm test` to verify current state
3. **Review related documentation**: Check relevant README files before changes
4. **Identify impact area**: Changes may affect multiple interconnected systems

### Building and Testing

```bash
# Install dependencies
npm install

# Start local development server
npm start
# OR
npm run dev

# Run backend services
npm run backend

# Build for production
npm run build

# Run tests
npm test
npm run test:api
npm run test:api-connections

# Verify deployment
npm run health
```

### Testing Checklist
- ✅ Test in Chrome, Firefox, Safari, Edge
- ✅ Test on mobile devices (responsive design)
- ✅ Verify all links work (no 404s)
- ✅ Check console for JavaScript errors
- ✅ Verify PayPal integration on payment pages
- ✅ Test blockchain wallet connections (if applicable)
- ✅ Validate accessibility (screen readers, keyboard navigation)
- ✅ Check 3D graphics performance (if applicable)

## Code Standards

### JavaScript Guidelines
1. **Use vanilla JavaScript** - Avoid heavy frameworks unless absolutely necessary
2. **ES6+ features** - Use modern JavaScript (arrow functions, async/await, destructuring)
3. **Error handling** - Always use try-catch for async operations and API calls
4. **Performance first** - Optimize for fast load times (this affects user engagement)
5. **Browser compatibility** - Test in all major browsers, use polyfills if needed
6. **Security** - Never commit API keys or secrets (use environment variables)
7. **Comments** - Document complex logic, especially AI/ML algorithms

### JavaScript Code Example
```javascript
// Good: Modern, clean, well-documented
async function fetchProjectData(projectId) {
  try {
    const response = await fetch(`/api/projects/${projectId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch project data:', error);
    return null;
  }
}

// Good: Clear event handling
document.querySelector('#submit-btn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const result = await processForm();
  updateUI(result);
});
```

### HTML Guidelines
1. **Semantic HTML** - Use proper tags (header, nav, main, article, section, footer)
2. **Accessibility** - Include ARIA labels, alt text, proper heading hierarchy
3. **Mobile-first** - Responsive design is mandatory (viewport meta tag required)
4. **Standalone pages** - Each HTML file should work independently
5. **Common structure** - Maintain consistent header/footer across pages
6. **PayPal integration** - Payment pages must include PayPal SDK properly

### HTML Template Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Name - Barbrick Design</title>
    <meta name="description" content="Clear description for SEO">
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <header>
        <nav>
            <a href="index.html">← Back to Hub</a>
        </nav>
    </header>
    
    <main>
        <!-- Your content here -->
    </main>
    
    <footer>
        <p>© 2024-2025 Barbrick Design | <a href="mailto:BarbrickDesign@gmail.com">Contact</a></p>
    </footer>
    
    <script src="js/your-script.js"></script>
</body>
</html>
```

### CSS Guidelines
1. **Mobile-first approach** - Base styles for mobile, media queries for larger screens
2. **CSS variables** - Use CSS custom properties for theming
3. **Performance** - Minimize CSS, avoid heavy animations on mobile
4. **Accessibility** - Ensure sufficient color contrast (WCAG AA minimum)
5. **Consistent spacing** - Use a spacing scale (8px, 16px, 24px, 32px, etc.)

### File Naming Conventions
- **HTML files**: lowercase with hyphens (e.g., `contributor-dashboard.html`)
- **JavaScript files**: lowercase with hyphens (e.g., `paypal-integration.js`)
- **CSS files**: lowercase with hyphens (e.g., `mobile-responsive.css`)
- **Config files**: lowercase with hyphens (e.g., `agent-deployment-manifest.json`)
- **Documentation**: UPPERCASE with underscores (e.g., `AGENT_SYSTEM_README.md`)

## Key Systems and Features

### 1. Monetization Systems (CRITICAL - Revenue Generating)

#### Government Grants System
- **Location**: `government-grants-portal.html`, `contributor-registration-enhanced.html`
- **Purpose**: Match users with government grants and generate applications
- **Revenue Model**: Tiered subscriptions ($50-$1,500) + contributor revenue sharing (10-20%)
- **API Integration**: SAM.gov, FPDS, grants.gov
- **Testing**: Always verify PayPal integration after changes

#### PayPal Integration
- **Primary Contact**: BarbrickDesign@gmail.com
- **Implementation**: `src/utils/paypal-integration.js`
- **Environment Variables**: `PAYPAL_CLIENT_ID`, `PAYPAL_API`
- **Testing**: Use PayPal sandbox for development
- **Pages**: All payment/contribution pages must include PayPal SDK

#### Contributor Revenue Sharing
- **Location**: `contributor-dashboard-hub.html`, `contribution-rewards-system.js`
- **Tiers**: Bronze (10%), Silver (12%), Gold (15%), Platinum (20%)
- **Student Discount**: 50% off all tiers
- **Implementation**: Track contributions, calculate revenue shares, automate payments

### 2. AI Agent Systems

#### Merlin Hive (Primary AI System)
- **Location**: `zMerlinHive.html`, `merlin-hive-integration.js`
- **Features**: Autonomous orchestration, learning, enhancement, documentation
- **Auto-start**: Enabled by default
- **Integration**: All agent systems connect to Merlin Hive

#### Agent R (System Architect)
- **Location**: `agent-r-manifest.json`
- **Authority**: Supreme (Level 999)
- **Purpose**: System architecture and oversight
- **Capabilities**: Full system access, protocol design, agent orchestration

#### Agent Management Dashboard
- **Location**: `agent-management-dashboard.html`
- **Features**: File crawling, health monitoring, automated fixes, self-healing
- **Usage**: Monitor and control all autonomous agents

### 3. Blockchain & Wallet Systems
- **Universal Wallet System**: `universal-wallet-system.js`
- **Solana Wallet**: Primary blockchain integration
- **Ethereum Wallet**: Smart contract operations
- **Testing**: Always test wallet connections in development mode

### 4. GitHub Actions & Automation
- **Location**: `.github/workflows/`
- **Key Workflows**:
  - `auto-review-pr.yml` - Automated PR reviews
  - `issue-lifecycle-manager.yml` - Issue automation
  - `enhanced-security-scan.yml` - Security scanning
  - `deploy-paypal-integration.yml` - PayPal deployment
- **Testing**: Validate workflow changes in feature branches first

## KERNEL Prompt Engineering Framework

**CRITICAL**: All AI interactions in this repository should follow the KERNEL framework for optimal results.

### What is KERNEL?

KERNEL is a proven prompt engineering framework that delivers:
- ✅ **94% first-try success rate** (vs 72% without)
- ✅ **67% reduction** in time to useful results
- ✅ **58% reduction** in token usage
- ✅ **340% accuracy improvement**

### KERNEL Principles

1. **K - Keep it Simple**: One clear goal, not 500 words
2. **E - Easy to Verify**: Clear, measurable success criteria
3. **R - Reproducible**: No temporal references, use specific versions
4. **N - Narrow Scope**: One task per prompt
5. **E - Explicit Constraints**: Tell AI what NOT to do
6. **L - Logical Structure**: Formatted sections (TASK, INPUT, CONSTRAINTS, OUTPUT, VERIFY)

### Using KERNEL in Code

```javascript
// Load KERNEL utilities
const KernelPromptBuilder = require('./src/utils/kernel-prompt-builder.js');
const builder = new KernelPromptBuilder();

// Build KERNEL-compliant prompt
builder
    .setTask('Generate Python function to validate email addresses')
    .addInput('Email string as input')
    .addConstraint('Python 3.10+')
    .addConstraint('No external libraries (regex only)')
    .addConstraint('Function under 20 lines')
    .addOutput('Function named validate_email(email)')
    .addOutput('Returns True/False with type hints')
    .addVerification('Test with valid email: returns True')
    .addVerification('Test with invalid: returns False');

const prompt = builder.build();

// Use with OpenAI orchestrator
const response = await window.openAIOrchestrator.executeKernelPrompt(builder, {
    model: 'gpt-4o',
    validate: true,  // Validates prompt quality before execution
    enforceQuality: false  // Set to true to reject low-quality prompts
});
```

### KERNEL Quick Patterns

For common tasks, use quick patterns:

```javascript
// Code generation
const response = await window.openAIOrchestrator.quickKernel('code', 
    'Generate email validator function', {
    language: 'Python',
    version: '3.10+',
    allowLibs: 'regex'
});

// Documentation
const response = await window.openAIOrchestrator.quickKernel('docs',
    'Document authentication API endpoint', {
    maxWords: 500
});

// Data analysis
const response = await window.openAIOrchestrator.quickKernel('analysis',
    'Analyze monthly sales trends', {
    // Pattern auto-fills common constraints
});
```

### KERNEL Template for Manual Prompts

When writing prompts manually (comments, descriptions, etc.):

```
TASK: [One sentence describing the goal]

INPUT:
- [What you're providing]
- [Data, files, context]

CONSTRAINTS:
- [Technical requirements]
- [What to avoid]
- [Limitations]

OUTPUT:
- [Specific deliverables]
- [Format and structure]

VERIFY:
- [How to test success]
- [Expected behavior]
```

### KERNEL for Agent Systems

All autonomous agents should use KERNEL:

```javascript
// In agent code
class MyAgent {
    async generatePrompt(task) {
        const builder = new KernelPromptBuilder();
        builder
            .setTask(task)
            .addConstraint('Use repository context')
            .addConstraint('Follow coding standards')
            .addVerification('Validate against test suite');
        
        return builder.build();
    }
}
```

### KERNEL Playground

Test and optimize prompts interactively:
- **URL**: [kernel-playground.html](../kernel-playground.html)
- **Features**: Real-time validation, scoring, templates
- **Use**: Build, test, and refine prompts before using in code

### KERNEL Resources

- **Full Documentation**: [KERNEL_FRAMEWORK.md](../KERNEL_FRAMEWORK.md)
- **Prompt Builder**: [src/utils/kernel-prompt-builder.js](../src/utils/kernel-prompt-builder.js)
- **Validator**: [src/utils/kernel-validator.js](../src/utils/kernel-validator.js)
- **Interactive Playground**: [kernel-playground.html](../kernel-playground.html)

### When to Use KERNEL

✅ **ALWAYS use KERNEL for**:
- AI/LLM API calls
- Agent system prompts
- Code generation requests
- Documentation generation
- Data analysis tasks
- Copilot interactions (via comments)

❌ **Don't need KERNEL for**:
- Simple user-facing text
- Error messages
- UI labels
- Non-AI interactions

### KERNEL Quality Standards

Target KERNEL score: **80+/100**
- 90-100: Excellent (deploy confidently)
- 80-89: Good (minor improvements)
- 70-79: Acceptable (needs refinement)
- <70: Poor (rewrite recommended)

## Important Guidelines

### Security Requirements
1. **Never commit secrets** - Use environment variables and GitHub Secrets
2. **Validate all inputs** - Sanitize user input to prevent XSS/injection
3. **HTTPS only** - All external API calls must use HTTPS
4. **Wallet security** - Never expose private keys or seed phrases
5. **PayPal security** - Use server-side validation for payments
6. **API keys** - Rotate keys regularly, use `.env.example` for templates

### Performance Requirements
1. **Page load time** - Target <3 seconds on 3G connection
2. **Mobile optimization** - Prioritize mobile performance
3. **Lazy loading** - Load images and heavy resources on demand
4. **Code splitting** - Split large JavaScript files when possible
5. **Caching** - Use service workers for offline functionality

### Accessibility Requirements
1. **WCAG AA compliance** - Minimum accessibility standard
2. **Keyboard navigation** - All interactive elements must be keyboard accessible
3. **Screen reader support** - Proper ARIA labels and semantic HTML
4. **Color contrast** - Text must be readable for color-blind users
5. **Focus indicators** - Clear visual focus states for all interactive elements

## Testing Requirements

### Before Submitting PR
1. ✅ Run `npm test` - All tests must pass
2. ✅ Run `npm run build` - Build must succeed without errors
3. ✅ Test in multiple browsers - Chrome, Firefox, Safari, Edge
4. ✅ Test on mobile device - Or use browser dev tools mobile emulation
5. ✅ Check console errors - No JavaScript errors in console
6. ✅ Validate links - No broken links or 404s
7. ✅ Test payment flows - If touching payment/contribution pages
8. ✅ Verify documentation - Update relevant README files

### For Payment/Monetization Changes
1. ✅ Test with PayPal sandbox environment
2. ✅ Verify email notifications work
3. ✅ Test all payment tiers (Bronze, Silver, Gold, Platinum)
4. ✅ Verify student discount calculation
5. ✅ Test revenue sharing calculations
6. ✅ Confirm transaction logging works

### For Agent System Changes
1. ✅ Test agent activation/deactivation
2. ✅ Verify logging and monitoring
3. ✅ Test self-healing capabilities
4. ✅ Confirm cross-system communication
5. ✅ Validate agent authority levels

## Common Tasks

### Adding a New Project
1. Create new HTML file in root directory
2. Follow HTML template structure
3. Add entry to `projects.json`
4. Update `index.html` if needed
5. Create corresponding documentation in `docs/`
6. Test thoroughly across browsers
7. Submit PR with screenshots

### Updating Payment Integration
1. Test in PayPal sandbox first
2. Verify environment variables are set
3. Update relevant HTML pages
4. Test all payment flows
5. Verify email notifications
6. Update documentation
7. Deploy to production carefully

### Adding/Modifying AI Agents
1. Follow Agent R manifest structure
2. Update `agent-deployment-manifest.json`
3. Add logging and monitoring
4. Test agent activation
5. Verify self-healing capabilities
6. Update agent documentation
7. Test integration with Merlin Hive

### Fixing Bugs
1. Reproduce the issue first
2. Check existing tests
3. Write test to catch the bug
4. Fix the issue with minimal changes
5. Verify fix doesn't break other functionality
6. Update documentation if needed
7. Submit PR with clear description

## Documentation Standards

### README Files
- Clear purpose and overview
- Quick start guide
- Installation/setup instructions
- Usage examples
- API documentation (if applicable)
- Troubleshooting section
- Contact information

### Code Comments
- Explain "why" not "what" (code should be self-documenting)
- Document complex algorithms
- Include examples for public APIs
- Add TODO comments with GitHub issue links
- Document workarounds with explanation

### Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Be specific and descriptive
- Reference issue numbers when applicable
- Keep first line under 72 characters
- Add detailed description if needed

## Deployment Process

### GitHub Pages Deployment
1. Changes pushed to `main` branch auto-deploy
2. Test in feature branch first
3. Merge via PR after review
4. Monitor deployment status
5. Verify live site after deployment

### Backend Services Deployment
1. Test locally with `npm run backend`
2. Deploy via deployment scripts
3. Monitor health with `npm run health`
4. Check logs for errors
5. Verify API endpoints work

## Contact and Support

- **Creator**: Ryan Barbrick
- **Email**: BarbrickDesign@gmail.com
- **PayPal**: BarbrickDesign@gmail.com (for payments and licensing)
- **Response Time**: Usually within 24 hours
- **GitHub Issues**: Use for bug reports and feature requests
- **GitHub Discussions**: Use for questions and ideas

## Revenue Impact Awareness

**CRITICAL**: This repository generates real income. When making changes:

1. **Government grants**: Main revenue source (~$50M+ potential)
   - Changes to grant portal affect user acquisition
   - Application system must remain functional
   - AI matching algorithms are revenue-critical

2. **Contributor system**: Secondary revenue (~10-20% of grants)
   - Payment flows must work perfectly
   - Revenue sharing calculations must be accurate
   - Student discounts must apply correctly

3. **Project licensing**: Tertiary revenue
   - Keep value tracking accurate
   - Maintain project quality
   - Ensure demonstrations work

**Before deploying changes that affect monetization systems, always:**
- Test thoroughly in sandbox/development
- Get approval from repository owner (BarbrickDesign@gmail.com)
- Monitor closely after deployment
- Have rollback plan ready

## Questions?

If you're unsure about anything:
1. Check relevant documentation in `docs/` or README files
2. Look at similar existing code for patterns
3. Search for related issues in GitHub
4. Contact BarbrickDesign@gmail.com with specific questions

Remember: This repository serves real users and generates real income. Prioritize reliability, security, and user experience in all changes.

---

## Agent Intelligence Upgrade (MANDATORY for All Future Tasks)

### REPO-AWARE BEHAVIOR

Before modifying **any** file, agents MUST:

1. **Scan the entire repository** — understand existing implementations, architecture, and conventions.
2. **Detect existing functionality** — check whether a feature already exists (whole or partial) before writing new code.
3. **Reuse existing components** — never duplicate backends, logic, or conflicting code paths that already exist.
4. **Produce a reasoning summary** — briefly state what exists, what is missing, and what will be changed before writing code.
5. **Complete partial implementations** — finish what is already started rather than replacing it.

Key existing infrastructure that MUST be reused (not duplicated):
- `netlify/functions/github-token.mjs` — GitHub token server relay (do not create another one)
- `netlify/functions/sam-gov-token.mjs` — SAM.gov API key relay (do not create another one)
- `netlify/functions/health.js` — Health check endpoint with `auth` and `api_error` fields
- `netlify.toml` — `/api/*` → `/.netlify/functions/:splat` redirect is already configured
- `src/systems/samgov-api-integration.js` — SAM.gov API class with `loadApiKeyFromServer()`
- `src/utils/samgov-integration.js` — SAM.gov utility class with `loadApiKeyFromServer()`

### SECURITY-AWARE BEHAVIOR

Agents MUST understand and enforce:

| Rule | Detail |
|------|--------|
| Browser JS CANNOT access GitHub Secrets | Secrets are only available server-side (Netlify Functions, GitHub Actions, etc.) |
| Tokens MUST NOT be committed | Never hardcode secrets, tokens, or API keys in any file |
| Tokens MUST NOT be logged | No `console.log(token)` or equivalent |
| Tokens MUST NOT be in static files | No secrets in HTML, JS, or config files |
| Tokens MUST NOT be stored in localStorage | Use memory only, or sessionStorage for non-sensitive session data |
| All sensitive data flows server-side | Use existing relay endpoints (`/api/github-token`, `/api/sam-gov-token`) |

#### Correct Pattern for Browser Secret Access

```javascript
// ✅ CORRECT — fetch from server relay, store in memory only
const res = await fetch('/api/github-token');
const { auth, token } = await res.json();
if (!auth) {
    showError('Server secret missing or invalid — check repository secrets configuration.');
    return;
}
// Use token in memory; never: localStorage.setItem('token', token)
```

```javascript
// ❌ WRONG — manual input or localStorage
const token = document.getElementById('tokenInput').value;
localStorage.setItem('github_token', token);
```

#### Server-Side Relay Pattern (Netlify Functions)

All new secret relays MUST follow the existing pattern in `netlify/functions/github-token.mjs`:
- Read secret from `process.env.SECRET_NAME`
- Restrict CORS to approved origins
- Apply rate-limiting
- Return `{ auth: Boolean(secret), token: secret | null, api_error: null }`
- Never log the secret value

### ARCHITECTURE-AWARE BEHAVIOR

This repository uses Netlify for deployment. Key architecture facts:
- **Netlify Functions** live in `netlify/functions/` and are accessible at `/api/<function-name>`
- **`netlify.toml`** already maps `/api/*` → `/.netlify/functions/:splat`
- **Environment variables** are configured in the Netlify dashboard or GitHub Secrets
- **GitHub Actions** workflows live in `.github/workflows/` and use `actions/checkout@v4` (NOT v5)
- **Backend services** in `backend/` run locally or on Railway — NOT on Netlify
- **Static files** (HTML, JS, CSS) are served directly from the repository root

### PR DELIVERY REQUIREMENTS

Agents MUST deliver a **single, atomic PR** that:
- Resolves the entire task end-to-end
- Includes all related client, server, and config file updates
- Does not leave partially implemented features
- Verifies functionality end-to-end before submitting
- Shows `auth: true` and `api_error: null` for any secret-dependent feature when the secret is configured
- Shows a clear, actionable message (e.g., "Server secret missing — check SAM_API_KEY in repository secrets") when the secret is absent

