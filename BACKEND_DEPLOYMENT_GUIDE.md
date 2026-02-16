# Backend Deployment Guide

This guide explains how to deploy and use the backend services for emailDashboard.html and other applications that require backend support.

## Overview

The backend system includes:
- **Email Service API** - Email sending, tracking, and lead management
- **Backend Fallback System** - Automatic frontend fallback when backend is unavailable
- **Auto-Start System** - Automatically starts and monitors backend health
- **Self-Healing** - Restarts backend if it crashes

## Quick Start

### Option 1: Use Backend Fallback (Recommended for Development)

The system automatically falls back to frontend storage when backend is unavailable.

1. Simply open `emailDashboard.html` in your browser
2. The dashboard will automatically detect that backend is unavailable
3. All functionality will work using localStorage
4. Data is saved locally and persists between sessions

**Status Indicator:**
- 🟢 **Backend Online** - Connected to backend server
- 🟠 **Frontend Mode** - Using local storage (backend unavailable)

### Option 2: Start Backend Server

For full functionality including email tracking confirmations:

```bash
# Install dependencies
npm install

# Start email service
npm run email:start
```

The backend will start on `http://localhost:4000`

### Option 3: Auto-Start Backend

Use the auto-start system to automatically start and monitor the backend:

```bash
node backend-auto-start.js
```

This will:
- Check if backend is already running
- Start backend if not running
- Monitor backend health every 10 seconds
- Automatically restart if backend crashes
- Max 5 restart attempts before giving up

## Backend Modes

### Backend Mode (Online)
When the backend is running:
- ✅ Real-time email tracking
- ✅ Confirmation link tracking works
- ✅ Data synchronized across devices
- ✅ Full API functionality
- ✅ Database persistence

### Frontend Mode (Offline)
When backend is unavailable:
- ✅ All CRUD operations work
- ✅ Data saved in localStorage
- ✅ Stats and analytics work
- ✅ Email/lead management works
- ⚠️ Email tracking links won't work
- ⚠️ Data not synchronized across devices

### Automatic Synchronization
When backend comes back online:
- Click the **"Sync to Backend"** button
- All frontend data will be uploaded to backend
- Future operations will use backend
- No data loss

## Backend API Endpoints

### Email Endpoints

**Send Email**
```javascript
POST /send-email
Body: {
  to: "email@example.com",
  subject: "Test Email",
  html: "<p>Email body</p>",
  text: "Plain text version",
  meta: { campaign: "test" }
}
Response: {
  success: true,
  id: "abc123",
  trackingUrl: "http://localhost:4000/email/confirm/token"
}
```

**Get Emails**
```javascript
GET /emails
Response: [
  {
    id: "abc123",
    to_email: "email@example.com",
    subject: "Test",
    status: "sent|confirmed|failed",
    sent_at: "2026-02-03T19:20:00Z",
    confirmed_at: null
  }
]
```

**Confirm Email (Tracking Link)**
```javascript
GET /email/confirm/:token
Response: HTML confirmation page
```

### Lead Endpoints

**Create Lead**
```javascript
POST /leads
Body: {
  name: "John Doe",
  email: "john@example.com",
  company: "Acme Inc",
  status: "new|active|engaged",
  source: "website"
}
Response: {
  success: true,
  lead: { id: "xyz789", ... }
}
```

**Get Leads**
```javascript
GET /leads
Response: [{ id: "xyz789", ... }]
```

**Get Single Lead**
```javascript
GET /leads/:id
Response: { id: "xyz789", ... }
```

**Update Lead**
```javascript
PATCH /leads/:id
Body: { status: "active", revenue: 1000 }
Response: {
  success: true,
  lead: { id: "xyz789", ... }
}
```

**Add Thread to Lead**
```javascript
POST /leads/:id/threads
Body: {
  message: "Follow up call scheduled",
  author: "agent",
  type: "note"
}
Response: {
  success: true,
  thread: { id: "thread123", ... }
}
```

### Stats Endpoint

**Get Statistics**
```javascript
GET /stats
Response: {
  emails: {
    total: 42,
    confirmed: 28,
    confirmationRate: "66.67"
  },
  leads: {
    total: 15,
    active: 8
  },
  revenue: {
    total: 5000,
    formatted: "$5000.00"
  }
}
```

### Health Check

```javascript
GET /health
Response: {
  status: "healthy",
  service: "email-service",
  uptime: 3600,
  timestamp: "2026-02-03T19:20:00Z"
}
```

## Frontend Fallback System

The `BackendFallbackSystem` class handles automatic fallback:

```javascript
// Initialize
const backendSystem = new BackendFallbackSystem({
  backendUrl: 'http://localhost:4000',
  checkInterval: 10000, // Check every 10 seconds
  storagePrefix: 'bfb_' // localStorage prefix
});

// Make a request (automatically uses backend or frontend)
const result = await backendSystem.request('/emails', {
  method: 'GET'
});

if (result.success) {
  console.log('Data:', result.data);
  console.log('Source:', result.source); // 'backend' or 'frontend'
}

// Listen for mode changes
backendSystem.on('mode_change', (data) => {
  console.log(`Mode changed: ${data.previousMode} → ${data.currentMode}`);
});

// Sync frontend data to backend
await backendSystem.syncToBackend();

// Get current status
const status = backendSystem.getStatus();
console.log('Mode:', status.mode);
console.log('Backend Available:', status.backendAvailable);
```

## Files Using Backend

### Primary Files
- `emailDashboard.html` - Email management dashboard
- `masterSystem.html` - Master system with lead management
- `backend/services/email-service.js` - Email service backend

### Supporting Files
- `src/utils/backend-fallback-system.js` - Fallback system
- `backend-auto-start.js` - Auto-start and monitoring
- `package.json` - Backend scripts and dependencies

## Testing

### Test Backend Health
```bash
curl http://localhost:4000/health
```

### Test Email Sending
```bash
curl -X POST http://localhost:4000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

### Test Frontend Fallback
1. Open `emailDashboard.html` in browser
2. Backend should show as unavailable (orange status)
3. Send a test email
4. Check browser console - should show "frontend" as source
5. Check localStorage - data should be saved there
6. Start backend: `npm run email:start`
7. Wait ~10 seconds
8. Status should change to green "Backend Online"
9. Click "Sync to Backend" button
10. Data should be uploaded to backend

## Production Deployment

### Environment Variables

Create `.env` file:
```bash
PORT=4000
NODE_ENV=production
```

### Deploy Backend Service

For production, consider:

1. **Use a process manager**
   ```bash
   npm install -g pm2
   pm2 start backend/services/email-service.js --name email-service
   pm2 save
   pm2 startup
   ```

2. **Use a reverse proxy** (nginx)
   ```nginx
   location /api/ {
     proxy_pass http://localhost:4000/;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_cache_bypass $http_upgrade;
   }
   ```

3. **Enable HTTPS**
   - Use Let's Encrypt for SSL certificates
   - Update frontend to use `https://yourdomain.com/api`

4. **Database Integration**
   - Replace in-memory storage with PostgreSQL/MongoDB
   - Update `email-service.js` to use database connection

5. **Email Provider Integration**
   - Integrate with SendGrid, Mailgun, or AWS SES
   - Add proper SMTP configuration
   - Enable email delivery tracking

## Troubleshooting

### Backend Won't Start

**Check Node version:**
```bash
node --version  # Should be >= 16.0.0
```

**Install dependencies:**
```bash
npm install
cd backend && npm install
```

**Check port availability:**
```bash
lsof -i :4000  # See what's using port 4000
```

**Check logs:**
```bash
npm run email:start  # See console output
```

### Backend Keeps Restarting

Check `backend-auto-start.js` output for errors:
- Max restarts reached? Check backend logs
- Port already in use? Kill conflicting process
- Script not found? Check file paths

### Data Not Syncing

1. Check backend status indicator (should be green)
2. Open browser console
3. Look for sync errors
4. Check backend is reachable: `curl http://localhost:4000/health`
5. Check CORS is enabled in backend

### Frontend Mode Not Working

1. Check browser console for errors
2. Verify `backend-fallback-system.js` is loaded
3. Check localStorage is enabled (not in private/incognito mode)
4. Clear localStorage and try again: `localStorage.clear()`

## NPM Scripts

```json
{
  "email:start": "node backend/services/email-service.js",
  "email-service": "node backend/services/email-service.js",
  "master-system": "npm run email-service",
  "backend": "cd backend && npm run dev",
  "backend-setup": "cd backend && npm install"
}
```

## Support

For issues or questions:
- Email: BarbrickDesign@gmail.com
- GitHub Issues: [Create an issue](https://github.com/barbrickdesign/barbrickdesign.github.io/issues)
- Check existing documentation in `/docs` directory

## License

MIT License - See LICENSE file for details
