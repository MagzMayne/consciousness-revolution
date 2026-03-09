# Fix-It Ticket System - Complete Guide

> **© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.**

## Overview

The Fix-It Ticket System is a comprehensive error reporting and autonomous fix system that allows users to report bugs and errors from any application in the repository. The system provides real-time notifications via email when issues are fixed.

## Features

✨ **Universal Error Reporting** - Users can report issues from any application
🔧 **Automatic Error Detection** - Automatically captures JavaScript errors
📊 **Ticket Management Dashboard** - Centralized interface for managing all tickets
📧 **Email Notifications** - Real-time email notifications when issues are fixed
🤖 **Auto-Fix Detection** - Identifies issues that can be fixed automatically
📈 **Statistics & Analytics** - Track ticket metrics and trends

## Architecture

### Components

1. **Fix-It Widget** (`src/utils/fix-it-widget.js`)
   - Client-side error reporting interface
   - Automatic error detection
   - User-friendly reporting modal
   - Injected into all HTML applications

2. **Fix-It Ticket Service** (`backend/services/fix-it-ticket-service.js`)
   - REST API for ticket management
   - Ticket storage and persistence
   - User subscription management
   - Auto-fix analysis

3. **Email Service Integration** (`backend/services/email-service.js`)
   - Sends notifications when tickets are fixed
   - Integrates with existing email infrastructure
   - Provides notification templates

4. **Ticket Dashboard** (`fix-it-dashboard.html`)
   - Web interface for viewing all tickets
   - Filter and search capabilities
   - Ticket status management
   - Statistics visualization

## Installation

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

### Setup Steps

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Inject the widget into all applications**:
   ```bash
   npm run fix-it:inject
   ```

3. **Start the Fix-It Ticket Service**:
   ```bash
   npm run fix-it:start
   ```

4. **Start the Email Service** (for notifications):
   ```bash
   npm run email:start
   ```

5. **Open the dashboard**:
   ```bash
   npm run fix-it:dashboard
   # Or open fix-it-dashboard.html in your browser
   ```

## Usage

### For Users (Reporting Issues)

#### Manual Reporting

1. Look for the 🔧 button in the bottom-right corner of any application
2. Click the button to open the reporting modal
3. Fill in the issue details:
   - **Title**: Brief description of the problem
   - **Description**: Detailed explanation of what went wrong
   - **Severity**: How critical is the issue?
   - **Category**: Type of issue (UI, functionality, etc.)
   - **Email** (optional): Get notified when fixed
4. Click "Submit Issue Report"
5. You'll receive a ticket ID for tracking

#### Automatic Error Detection

When JavaScript errors occur:
1. The widget automatically captures the error
2. A notification appears in the top-right corner
3. Click the notification to pre-fill the error report
4. Review and submit the report

### For Administrators (Managing Tickets)

#### Dashboard Overview

Access the dashboard at `fix-it-dashboard.html` to:

- View all tickets with filtering options
- See statistics (total, open, fixed, etc.)
- Update ticket status
- Add comments to tickets
- View error details and stack traces

#### Ticket Workflow

1. **New Ticket** → User submits an issue
2. **Open** → Ticket is awaiting review
3. **In Progress** → Team is working on the fix
4. **Fixed** → Issue has been resolved (user is notified)
5. **Closed** → Ticket is archived

#### Updating Ticket Status

1. Click on any ticket to view details
2. Use the action buttons at the bottom:
   - "Mark In Progress" - Start working on the issue
   - "Mark Fixed" - Issue is resolved (sends email notification)
   - "Close Ticket" - Archive the ticket

## API Reference

### Fix-It Ticket Service (Port 4001)

#### Create Ticket
```http
POST /api/tickets
Content-Type: application/json

{
  "title": "Login button not working",
  "description": "When I click login, nothing happens",
  "errorMessage": "TypeError: Cannot read property 'value' of null",
  "errorStack": "at login (app.js:123)",
  "pageUrl": "https://example.com/login.html",
  "userAgent": "Mozilla/5.0...",
  "userEmail": "user@example.com",
  "severity": "high",
  "category": "functionality"
}
```

#### Get All Tickets
```http
GET /api/tickets?status=open&severity=high
```

#### Get Specific Ticket
```http
GET /api/tickets/:id
```

#### Update Ticket Status
```http
PUT /api/tickets/:id/status
Content-Type: application/json

{
  "status": "fixed"
}
```

#### Add Comment
```http
POST /api/tickets/:id/comments
Content-Type: application/json

{
  "comment": "Working on this issue now",
  "author": "Developer"
}
```

#### Subscribe to Updates
```http
POST /api/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "ticketId": "FIX-123-ABC"
}
```

#### Get Statistics
```http
GET /api/stats
```

### Email Service Integration

#### Send Fix Notification
```http
POST /send-fix-notification
Content-Type: application/json

{
  "ticketId": "FIX-123-ABC",
  "email": "user@example.com",
  "title": "Login button not working",
  "status": "fixed"
}
```

## Configuration

### Widget Configuration

Edit `src/utils/fix-it-widget.js`:

```javascript
const CONFIG = {
  API_URL: 'http://localhost:4001/api',
  WIDGET_POSITION: 'bottom-right', // or bottom-left, top-right, top-left
  AUTO_DETECT_ERRORS: true,
  SHOW_WIDGET_BUTTON: true
};
```

### Service Configuration

Edit `backend/services/fix-it-ticket-service.js`:

```javascript
const PORT = process.env.FIX_IT_PORT || 4001;
```

## Data Storage

### Files

All data is stored in `backend/data/`:

- `fix-it-tickets.json` - All ticket data
- `fix-it-subscribers.json` - Email subscriptions

### Backup

Data is automatically saved after every change. For backups:

```bash
cp backend/data/fix-it-tickets.json backup/fix-it-tickets-$(date +%Y%m%d).json
```

## Troubleshooting

### Widget Not Appearing

1. Check if the widget script is injected:
   ```bash
   npm run fix-it:inject
   ```

2. Verify the script is loaded in the HTML:
   ```html
   <!-- Fix-It Widget -->
   <script src="/src/utils/fix-it-widget.js" defer></script>
   ```

3. Check browser console for errors

### Service Not Starting

1. Check if port 4001 is available:
   ```bash
   lsof -i :4001
   ```

2. Kill conflicting process or change port:
   ```bash
   FIX_IT_PORT=4002 npm run fix-it:start
   ```

### Email Notifications Not Sending

1. Ensure email service is running:
   ```bash
   npm run email:start
   ```

2. Check that it's on port 4000:
   ```bash
   lsof -i :4000
   ```

3. Review service logs for errors

### Tickets Not Persisting

1. Check write permissions on `backend/data/`:
   ```bash
   ls -la backend/data/
   ```

2. Ensure directory exists:
   ```bash
   mkdir -p backend/data
   ```

## Best Practices

### For Users

- **Be specific** - Provide detailed descriptions
- **Include steps to reproduce** - Help developers understand the issue
- **Provide your email** - Get notified when fixed
- **Check existing tickets** - Avoid duplicates

### For Administrators

- **Respond quickly** - Update ticket status promptly
- **Add comments** - Keep users informed
- **Prioritize critical issues** - Fix high-severity bugs first
- **Mark as fixed** - Triggers email notification
- **Close resolved tickets** - Keep the system clean

## Security

### Data Protection

- Tickets are stored locally on the server
- Email addresses are only used for notifications
- No sensitive data is transmitted without consent

### Input Validation

- All user input is sanitized
- SQL injection protection (not using SQL)
- XSS prevention in dashboard

## Future Enhancements

Planned features:

- [ ] GitHub Issues integration (automatic issue creation)
- [ ] Automated fix application
- [ ] Machine learning for issue categorization
- [ ] Slack/Discord integration for notifications
- [ ] Mobile app for ticket management
- [ ] Advanced analytics and reporting
- [ ] Auto-fix suggestions
- [ ] Integration with CI/CD pipeline

## Support

For questions or issues with the Fix-It system:

- **Email**: BarbrickDesign@gmail.com
- **GitHub**: https://github.com/barbrickdesign/barbrickdesign.github.io
- **Create a ticket**: Use the Fix-It widget!

## License

© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.

This system is part of the Barbrick Design repository and is subject to the repository's license terms.

---

## Quick Reference

### Start Services
```bash
npm run fix-it:start      # Start ticket service
npm run email:start        # Start email service
```

### Inject Widget
```bash
npm run fix-it:inject     # Add widget to all HTML files
```

### Open Dashboard
```bash
npm run fix-it:dashboard  # Opens dashboard
# Or manually open: fix-it-dashboard.html
```

### API Endpoints
- **Tickets**: http://localhost:4001/api/tickets
- **Stats**: http://localhost:4001/api/stats
- **Health**: http://localhost:4001/health

### Dashboard
- **URL**: file:///path/to/fix-it-dashboard.html
- **Features**: View, filter, manage tickets

---

**Last Updated**: 2026-02-18
**Version**: 1.0.0
