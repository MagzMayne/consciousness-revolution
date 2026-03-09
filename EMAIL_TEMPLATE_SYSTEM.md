# Email Template System Documentation

## Overview

The Enhanced Contact/Sales Email System provides professional, auto-populated email templates with structured sections, payment links, and autonomous reply capabilities across the Barbrick Design repository.

## Quick Start

### 1. Include the Script

Add to your HTML file:
```html
<script src="src/utils/email-template-generator.js"></script>
```

### 2. Use Data Attributes (Recommended)

Simply add data attributes to existing links:
```html
<a href="#" 
   data-email-template="sales" 
   data-project-name="Your Project Name">
   Contact Sales
</a>
```

The system auto-initializes on page load!

## Available Templates

| Template | Use Case | Key Sections |
|----------|----------|--------------|
| **sales** | General sales inquiries | Contact info, project details, budget, timeline |
| **license** | Software license purchases | Payment info, license tier, PayPal links |
| **support** | Technical support requests | Issue description, system info, steps to reproduce |
| **demo** | Product demonstrations | Availability, attendees, specific interests |
| **collaboration** | Partnership proposals | Proposal details, value proposition |
| **access** | Resource access requests | Reason for access, intended use |
| **donation** | Donation confirmations | Transaction details, receipt request |
| **violation** | License violation reports | Evidence documentation, violation type |

## Usage Methods

### Method 1: Declarative (Data Attributes)

Best for simple cases:

```html
<!-- Sales inquiry -->
<a href="#" 
   data-email-template="sales" 
   data-project-name="CasinoAI">
   Contact Sales
</a>

<!-- License purchase -->
<a href="#" 
   data-email-template="license" 
   data-project-name="RepoPilot"
   data-tier-name="Enterprise"
   data-amount="999">
   Buy License
</a>

<!-- Support request -->
<a href="#" 
   data-email-template="support" 
   data-project-name="Dev Value Hub">
   Get Support
</a>
```

### Method 2: Programmatic (JavaScript)

For dynamic content or complex scenarios:

```javascript
// Open email composer
EmailTemplateGenerator.openEmailComposer('demo', {
  projectName: 'CasinoAI Security System',
  tierName: 'Enterprise'
});

// Generate mailto link only (don't open)
const mailtoLink = EmailTemplateGenerator.generateMailtoLink('sales', {
  projectName: 'My Project',
  custom: {
    SPECIAL_FIELD: 'Custom value'
  }
});

// Create button element programmatically
const button = EmailTemplateGenerator.createContactButton(
  'collaboration',
  { projectName: 'AI Robot Project' },
  'Partner With Us',
  'btn btn-primary'
);
document.getElementById('container').appendChild(button);
```

## Email Template Structure

All emails follow this structure:

```
Subject: [Template-Specific Subject] - [Project Name]

Body:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: [Your name here]
Email: [Your email here]
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[TEMPLATE-SPECIFIC SECTIONS]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Template-specific content with bracketed placeholders]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT INFORMATION (if applicable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PayPal: BarbrickDesign@gmail.com
Direct Link: https://www.paypal.com/paypalme/BarbrickDesign/[amount]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Backend Auto-Reply System

### Setup

In your backend (`backend/services/email-service.js`):

```javascript
const autoReplyService = require('./auto-reply-service');

app.post('/incoming-email', async (req, res) => {
  const emailData = req.body;
  
  // Check if auto-reply should be sent
  if (autoReplyService.shouldSendAutoReply(emailData)) {
    // Process and send auto-reply
    await autoReplyService.processIncomingEmail(emailData, sendEmailFn);
  }
  
  res.json({ success: true });
});
```

### Auto-Reply Features

- **Intelligent Type Detection**: Automatically detects email type from subject line
- **Professional HTML Emails**: Beautiful, branded HTML email responses
- **24-Hour Promise**: All auto-replies promise response within 24 hours
- **Helpful Resources**: Includes links to documentation and resources
- **Payment Instructions**: License/donation replies include payment details
- **Smart Filtering**: Won't auto-reply to bounces, unsubscribes, or other auto-replies

### Auto-Reply Templates

The system includes matching auto-reply templates for each email type:

| Email Type | Auto-Reply Subject | Key Contents |
|------------|-------------------|--------------|
| Sales | Re: Sales Inquiry - [Project] | Next steps, payment info, contact details |
| License | Re: License Purchase - [Project] | License activation process, payment instructions |
| Support | Re: Support Request - [Project] | Ticket created, response timeline, resources |
| Demo | Re: Demo Request - [Project] | Scheduling info, demo preparation tips |
| General | Re: Your Inquiry | Confirmation, response promise, resources |

## Advanced Customization

### Custom Replacements

Use the `custom` parameter for additional replacements:

```javascript
EmailTemplateGenerator.openEmailComposer('sales', {
  projectName: 'My Project',
  custom: {
    CUSTOM_FIELD_1: 'Value 1',
    CUSTOM_FIELD_2: 'Value 2'
  }
});
```

In your template body, use `[CUSTOM_FIELD_1]` and it will be replaced with 'Value 1'.

### Adding New Templates

Edit `src/utils/email-template-generator.js`:

```javascript
const EMAIL_TEMPLATES = {
  // ... existing templates ...
  
  myCustomTemplate: {
    subject: 'Custom Subject - [PROJECT_NAME]',
    body: `
Hello Barbrick Design Team,

[Your custom template body here]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOM SECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Field: [Value here]
    `
  }
};
```

## Payment Integration

### PayPal Links

The system automatically includes PayPal payment links in license and donation templates:

```javascript
// With specific amount
EmailTemplateGenerator.openEmailComposer('license', {
  projectName: 'RepoPilot',
  tierName: 'Professional',
  amount: '299'
});
// Generates: https://www.paypal.com/paypalme/BarbrickDesign/299

// Without amount (user chooses)
EmailTemplateGenerator.openEmailComposer('donation', {
  projectName: 'Open Source Project'
});
// Generates: https://www.paypal.com/paypalme/BarbrickDesign
```

### Adding Other Payment Methods

Edit `PAYMENT_LINKS` in `email-template-generator.js`:

```javascript
const PAYMENT_LINKS = {
  paypal: {
    base: 'https://www.paypal.com/paypalme/BarbrickDesign',
    email: 'BarbrickDesign@gmail.com'
  },
  stripe: {
    base: 'https://buy.stripe.com/your-link',
    email: 'payments@yourdomain.com'
  }
};
```

## Analytics Integration

The system includes Google Analytics (gtag) integration:

```javascript
// Automatically tracked on button click
button.addEventListener('click', () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'contact_click', {
      email_type: type,
      project_name: projectName
    });
  }
});
```

## Testing

### Interactive Demo

Visit [email-template-demo.html](https://barbrickdesign.github.io/email-template-demo.html) to:
- Test all 8 email templates
- See implementation examples
- Try declarative buttons
- View code samples

### Manual Testing Checklist

- [ ] Test each template type
- [ ] Verify subject line formatting
- [ ] Check body structure and placeholders
- [ ] Confirm PayPal links work (sandbox mode)
- [ ] Test on mobile devices
- [ ] Verify auto-initialization works
- [ ] Check analytics tracking fires
- [ ] Test programmatic API

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Security

- ✅ No API keys or secrets in frontend code
- ✅ PayPal email verified: BarbrickDesign@gmail.com
- ✅ Input sanitization not required (mailto links are safe)
- ✅ Backend auto-reply service validates incoming data

## Troubleshooting

### Issue: Links not working

**Solution**: Ensure script is loaded before DOM content:
```html
<script src="src/utils/email-template-generator.js"></script>
<!-- Rest of your HTML -->
```

### Issue: Auto-initialization not firing

**Solution**: Check console for errors. Ensure data attributes are correct:
```html
<!-- Correct -->
<a href="#" data-email-template="sales" ...>

<!-- Wrong (typo) -->
<a href="#" data-email-templete="sales" ...>
```

### Issue: Custom replacements not working

**Solution**: Use `custom` parameter with uppercase placeholder names:
```javascript
EmailTemplateGenerator.openEmailComposer('sales', {
  projectName: 'Test',
  custom: {
    MY_FIELD: 'My Value'  // Use [MY_FIELD] in template
  }
});
```

## Migration Guide

### From Simple mailto Links

**Before:**
```html
<a href="mailto:BarbrickDesign@gmail.com?subject=Sales Inquiry">Contact</a>
```

**After:**
```html
<a href="#" 
   data-email-template="sales" 
   data-project-name="Your Project">
   Contact
</a>
```

### From Custom JavaScript

**Before:**
```javascript
const subject = encodeURIComponent('Sales Inquiry');
const body = encodeURIComponent('Please contact me...');
window.location.href = `mailto:BarbrickDesign@gmail.com?subject=${subject}&body=${body}`;
```

**After:**
```javascript
EmailTemplateGenerator.openEmailComposer('sales', {
  projectName: 'Your Project'
});
```

## API Reference

### Functions

#### `generateMailtoLink(type, params)`
Generate a mailto URL without opening email client.

**Parameters:**
- `type` (string): Template type (sales, license, support, etc.)
- `params` (object): Template parameters
  - `projectName` (string): Project name
  - `tierName` (string): License tier (optional)
  - `amount` (string): Payment amount (optional)
  - `transactionId` (string): Transaction ID (optional)
  - `custom` (object): Custom replacements (optional)

**Returns:** String (mailto URL)

#### `openEmailComposer(type, params)`
Open email client with pre-populated email.

**Parameters:** Same as `generateMailtoLink`

**Returns:** void

#### `createContactButton(type, params, buttonText, buttonClass)`
Create a button element with email template.

**Parameters:**
- `type` (string): Template type
- `params` (object): Template parameters
- `buttonText` (string): Button text
- `buttonClass` (string): CSS class name(s)

**Returns:** HTMLElement (button)

#### `initializeContactButtons()`
Initialize all buttons with data-email-template attribute. Called automatically on page load.

**Returns:** void

## Support

- **Email**: BarbrickDesign@gmail.com
- **GitHub**: [barbrickdesign/barbrickdesign.github.io](https://github.com/barbrickdesign/barbrickdesign.github.io)
- **Demo**: [email-template-demo.html](https://barbrickdesign.github.io/email-template-demo.html)

## License

© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-17  
**Author:** Ryan Barbrick  
**AI Assistant:** Merlin AI
