# Consciousness Revolution - Copilot Instructions

This is a hybrid repository combining HTML-based interactive tools, Python automation scripts, and serverless functions. The platform is hosted on Netlify and provides pattern recognition tools for human consciousness across 7 domains.

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+) - No frameworks, all standalone files
- **Backend**: Python 3.x scripts for automation and data processing
- **Serverless**: Netlify Functions (Node.js)
- **Hosting**: Netlify with continuous deployment
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe integration
- **Node**: v18.0.0 or higher

## Project Structure

```
consciousness-revolution/
├── *.html                          # Standalone HTML tools (49+ tools)
├── seven-domains/                  # 7 domain-specific sub-sites
├── ULTIMATE_HUMAN_OS/              # 7x7x7 structured tool system
├── netlify/functions/              # Serverless API endpoints
├── staging/                        # Pre-production testing
├── *.py                            # Python automation scripts
├── .github/                        # GitHub configuration and workflows
├── package.json                    # Node dependencies
└── netlify.toml                    # Netlify configuration
```

## Development Guidelines

### Required Before Each Commit

- **No build step required** for HTML files - they are standalone
- Run `npm install` only when adding new dependencies
- Test Python scripts with `python3 <script>.py` before committing
- Validate HTML files can be opened directly in a browser

### Development Flow

- **Install dependencies**: `npm install`
- **Run locally**: `npx netlify dev` (starts dev server on localhost:8888)
- **Test serverless functions**: Available at `/.netlify/functions/<function-name>`
- **Deploy**: Automatic via GitHub push to main branch

### Testing

- **Functionality tests**: `python3 FUNCTIONALITY_TEST_SUITE.py`
- **Autonomous agents**: `python3 aul_orchestrator.py`
- **Manual testing**: Open any HTML file in a browser
- **CI/CD**: GitHub Actions runs health checks and automated tests

## Code Standards

### HTML Files

1. **Standalone and self-contained** - Each HTML file should work independently
2. **No external dependencies** - Include all CSS and JavaScript inline or via CDN
3. **Responsive design** - Mobile-first approach using the established design system
4. **Accessibility** - Follow WCAG 2.1 AA standards
5. **Design system** - Use the sacred geometry theme defined in `sacred-theme.css`
6. **Naming convention**: Use lowercase with hyphens (e.g., `pattern-detector.html`)

### Python Scripts

1. **Python 3.x compatibility** - Use modern Python features
2. **Type hints** - Include type annotations for functions
3. **Docstrings** - Document all modules, classes, and functions
4. **Error handling** - Use try-except blocks with specific exceptions
5. **Naming convention**: Use UPPERCASE for main scripts (e.g., `PATTERN_DETECTOR.py`)
6. **Dependencies**: Add to `requirements.txt` if needed

### JavaScript

1. **ES6+ syntax** - Use modern JavaScript features
2. **No frameworks** - Keep it vanilla for maximum compatibility
3. **Browser compatibility** - Support modern browsers (Chrome, Firefox, Safari, Edge)
4. **Inline or CDN** - No separate .js files unless absolutely necessary
5. **Error handling** - Use try-catch for async operations

## Key Patterns

### The 7 Domains Framework

All tools and content should align with one or more of these domains:
1. **Command** - Clarity, decisions, daily structure
2. **Creation** - Building, projects, skills
3. **Connection** - Relationships, communication, community
4. **Peace** - Security, boundaries, protection
5. **Abundance** - Financial growth, business, scaling
6. **Wisdom** - Learning, critical thinking, research
7. **Purpose** - Meaning, meditation, integration

### Design System

- Use the established color palette and sacred geometry theme
- Reference `sacred-theme.css` for consistent styling
- Follow the component patterns in existing HTML files
- Maintain the glass-morphism aesthetic

### Pattern Recognition Tools

When creating or modifying pattern detection tools:
1. Focus on educational value, not just detection
2. Provide clear explanations of patterns
3. Include examples and context
4. Offer actionable insights
5. Maintain a compassionate, empowering tone

## Architecture Patterns

### Autonomous Agent System

- Uses AUL (AI Universal Language) protocol for agent communication
- Message bus pattern for inter-agent communication
- Self-healing and auto-recovery capabilities
- Real-time monitoring dashboard at `AUL_DASHBOARD.html`

### File Naming Conventions

- **User-facing tools**: `lowercase-with-hyphens.html`
- **System scripts**: `UPPERCASE_WITH_UNDERSCORES.py`
- **Documentation**: `UPPERCASE_WITH_UNDERSCORES.md`
- **Configuration**: `lowercase.config.js` or `lowercase.toml`

### Data Flow

1. User interactions → HTML files
2. HTML files → Netlify Functions (API)
3. Netlify Functions → Supabase (database)
4. Python scripts → Background processing/automation

## Important Notes

1. **No login required** for most tools - they work offline
2. **Privacy-first** - Minimize data collection, process locally when possible
3. **Joy-focused** - All features should bring joy to self and others (see `JOY_PRINCIPLES.md`)
4. **Pattern Theory** - Core philosophy: recognizing patterns is the foundation of all growth
5. **Open source** - MIT license, encourage community contributions

## Common Tasks

### Adding a New HTML Tool

1. Create standalone HTML file with inline CSS/JS
2. Use the sacred-theme design system
3. Align with one of the 7 domains
4. Test in multiple browsers
5. Add to appropriate navigation/index

### Adding Python Automation

1. Create script with UPPERCASE naming
2. Add type hints and docstrings
3. Include error handling
4. Update `requirements.txt` if needed
5. Test with `python3 script.py`

### Adding Netlify Function

1. Create in `netlify/functions/`
2. Use Node.js module.exports syntax
3. Handle CORS appropriately
4. Test with `netlify dev`
5. Deploy and test in production

## Resources

- **Main site**: https://conciousnessrevolution.io
- **Discord**: https://discord.gg/xHRXyKkzyg
- **Bug tracker**: https://github.com/overkor-tek/consciousness-bugs
- **Documentation**: See individual README files for specific subsystems

## Deployment

- **Automatic**: Push to main branch triggers Netlify build
- **Manual**: `npm run deploy`
- **Staging**: Push to staging branch
- **Restore points**: Created automatically after successful deployments

## Contact

For questions or clarifications, join the Discord or check existing documentation in the repository.
