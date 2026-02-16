# Agent Instructions for Barbrick Design Repository

This file provides agent-specific instructions for AI assistants working on this repository.

## Repository Context

This is a GitHub Pages web application hub with 300+ interactive projects generating income through:
- Government grant applications (primary revenue source)
- Contributor revenue sharing (10-20% of grants)
- Project licensing and demonstrations
- AI agent services

## Critical Systems

### Revenue-Generating Systems (DO NOT BREAK)

1. **PayPal Integration** (`src/utils/paypal-integration.js`, `deploy-paypal-integration.js`)
   - Payment processing for contributor registrations
   - Handle with extreme care
   - Always test in sandbox before production
   - Contact: BarbrickDesign@gmail.com

2. **Government Grants Portal** (`government-grants-portal.html`, `contributor-registration-enhanced.html`)
   - Main revenue generation system
   - Tiered subscription model ($50-$1,500)
   - Student discounts (50% off)
   - Grant matching and application automation

3. **Revenue Sharing System** (`contribution-rewards-system.js`)
   - Calculates contributor payouts (10-20% based on tier)
   - Critical financial calculations
   - Must be accurate and auditable

### Core Agent Systems

1. **Merlin Hive** (`zMerlinHive.html`, `merlin-hive-integration.js`)
   - Central autonomous agent orchestration
   - Self-healing capabilities
   - Learning and enhancement systems
   - All agents should integrate with Merlin Hive

2. **Agent R** (`agent-r-manifest.json`)
   - System architect with supreme authority (Level 999)
   - Oversees all agent operations
   - Protocol design and governance

3. **Management Dashboard** (`agent-management-dashboard.html`)
   - File crawling and health monitoring
   - Automated fixes and self-healing
   - System health scoring

## Development Principles

### 1. Minimal Changes
- Make the smallest possible changes to achieve the goal
- Don't refactor working code unless necessary
- Preserve existing functionality

### 2. Revenue Protection
- Never break payment flows
- Test calculations thoroughly
- Validate before deployment
- Have rollback plans

### 3. Security First
- Never commit secrets (API keys, passwords)
- Validate all user inputs
- Use HTTPS for external calls
- Sanitize data before display

### 4. Accessibility Required
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast WCAG AA minimum
- Screen reader compatibility

### 5. Mobile First
- Responsive design mandatory
- Test on mobile devices
- Touch-friendly buttons (44x44px minimum)
- Fast load times

## Building and Testing

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Test API connections
npm run test:api

# Build for production
npm run build

# Health check
npm run health
```

## File Structure Patterns

### HTML Files
- Include viewport meta tag
- Use semantic HTML (header, main, footer)
- Add navigation back to index.html
- Include PayPal SDK for payment pages
- Accessibility attributes required

### JavaScript Files
- ES6+ syntax (arrow functions, async/await)
- Try-catch for all async operations
- User-friendly error messages
- Debounce expensive operations
- No secrets in code

### Agent Files (src/agents/)
- Extend base agent class pattern
- Include logging system
- Implement self-healing
- Connect to Merlin Hive
- Health monitoring required

### Workflow Files (.github/workflows/)
- Use secrets for credentials
- Set minimal permissions
- Handle failures gracefully
- Include rollback mechanism
- Test in non-production first

## Common Tasks

### Adding Payment Features
1. Test in PayPal sandbox first
2. Validate all calculations
3. Test all payment tiers
4. Verify email notifications
5. Get approval before production

### Modifying Agent Systems
1. Follow agent class pattern
2. Add comprehensive logging
3. Test self-healing
4. Verify Merlin Hive integration
5. Monitor resource usage

### Fixing Bugs
1. Reproduce the issue
2. Write test to catch it
3. Fix with minimal changes
4. Verify no regression
5. Update documentation

## API Keys and Secrets

### Environment Variables Required
- `PAYPAL_CLIENT_ID` - PayPal sandbox/production client ID
- `PAYPAL_API` - PayPal API credentials
- Store in GitHub Secrets, never in code

### Example Usage
```javascript
const apiKey = process.env.API_KEY || window.ENV?.API_KEY;
if (!apiKey) {
  throw new Error('API key not configured');
}
```

## Testing Requirements

### Before Committing
- [ ] Run `npm test` - all tests pass
- [ ] Check browser console - no errors
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test on mobile device
- [ ] Verify links work
- [ ] Test payment flows (if applicable)

### For Payment Changes
- [ ] Test in PayPal sandbox
- [ ] Test all tiers (Bronze, Silver, Gold, Platinum)
- [ ] Verify student discount (50%)
- [ ] Test email notifications
- [ ] Verify revenue calculations
- [ ] Get approval from BarbrickDesign@gmail.com

## Error Handling Patterns

### API Calls
```javascript
async function callAPI(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    // Show user-friendly message
    showNotification('Connection error. Please try again.', 'error');
    return null;
  }
}
```

### Payment Processing
```javascript
async function processPayment(data) {
  try {
    // Validate data
    const validation = validatePaymentData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Process payment
    const result = await submitPayment(data);
    
    if (result.success) {
      await sendConfirmation(data.email);
      showNotification('Payment successful!', 'success');
    }
    
    return result;
  } catch (error) {
    console.error('Payment failed:', error);
    showNotification('Payment failed. Please contact support.', 'error');
    
    // Log for debugging
    logPaymentError({
      error: error.message,
      data: sanitizeLogData(data),
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}
```

## Documentation Standards

### Code Comments
```javascript
/**
 * Calculate contribution amount with discount
 * @param {number} tier - Base amount (50, 200, 500, or 1500)
 * @param {boolean} isStudent - Whether student discount applies
 * @returns {number} Final amount after discount
 */
function calculateAmount(tier, isStudent) {
  return isStudent ? tier * 0.5 : tier;
}
```

### Commit Messages
```
feat: Add student email validation to contributor registration
fix: Resolve PayPal button rendering on mobile
docs: Update COPILOT_QUICKSTART with testing guidelines
refactor: Extract payment validation to separate module
```

## Deployment Process

### GitHub Pages (Automatic)
1. Changes to `main` branch auto-deploy
2. Test in feature branch first
3. Create PR for review
4. Merge after approval
5. Monitor deployment

### Backend Services
1. Test locally first (`npm run backend`)
2. Deploy via scripts (`npm run deploy`)
3. Monitor health (`npm run health`)
4. Check logs for errors
5. Have rollback ready

## Revenue Impact Guidelines

### High Impact (Critical)
- Payment processing changes
- Grant application system
- Revenue sharing calculations
- Contributor registration
- PayPal integration

**Action**: Require approval, extensive testing, rollback plan

### Medium Impact
- Agent system modifications
- Database operations
- API integrations
- Security features

**Action**: Thorough testing, staging deployment

### Low Impact
- UI improvements
- Documentation updates
- Non-critical bug fixes
- Accessibility enhancements

**Action**: Standard testing, direct deployment

## When in Doubt

1. Check existing documentation
2. Look at similar working code
3. Test thoroughly before committing
4. Ask BarbrickDesign@gmail.com
5. Create small, reversible changes

## Success Metrics

Good changes should:
- ✅ Maintain or improve revenue generation
- ✅ Enhance user experience
- ✅ Improve accessibility
- ✅ Increase reliability
- ✅ Pass all tests
- ✅ Have no security issues
- ✅ Work on mobile
- ✅ Be well-documented

## Contact

- **Creator**: Ryan Barbrick
- **Email**: BarbrickDesign@gmail.com
- **PayPal**: BarbrickDesign@gmail.com
- **Response Time**: Usually within 24 hours

## Remember

This repository generates real income for contributors. Every change affects real people earning money. Prioritize reliability, security, and user experience. When unsure, ask for help.

**Quality over speed. Reliability over features. Users over metrics.**
