# ClearDebt Setup Guide

Complete guide for configuring and running the ClearDebt Enterprise Bankruptcy Assistance System.

## Quick Start

### 1. Configure Google OAuth (Required)

The ClearDebt system uses Google OAuth for secure user authentication. You have three options to configure it:

#### Option A: localStorage (Easiest for Testing)

1. Open [clearDebt.html](https://barbrickdesign.github.io/clearDebt.html) in your browser
2. Open browser console (F12)
3. Run this command:
```javascript
localStorage.setItem("GOOGLE_CLIENT_ID", "your-client-id.apps.googleusercontent.com")
```
4. Refresh the page

#### Option B: Environment Variable (Best for Deployment)

Add to your deployment environment:
```javascript
window.ENV = {
  GOOGLE_CLIENT_ID: "your-client-id.apps.googleusercontent.com",
  CLEARDEBT_API_URL: "https://your-api-domain.com/api"
};
```

#### Option C: Meta Tag (Good for Static Sites)

Add to the `<head>` section of clearDebt.html:
```html
<meta name="google-client-id" content="your-client-id.apps.googleusercontent.com">
```

### 2. Get Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth 2.0 Client ID**
6. Choose **Web application**
7. Add authorized JavaScript origins:
   - `http://localhost:8000` (for local testing)
   - `https://barbrickdesign.github.io` (for production)
8. Add authorized redirect URIs:
   - `http://localhost:8000/clearDebt.html`
   - `https://barbrickdesign.github.io/clearDebt.html`
9. Copy the **Client ID** (it will look like: `123456789-abc123.apps.googleusercontent.com`)

### 3. Backend API (Optional)

The ClearDebt system works in two modes:

#### Offline Mode (Default)
- All data stored in browser localStorage
- No backend required
- Works immediately after Google OAuth configured
- Data persists on local device only

#### Online Mode (With Backend)
- Data synced to backend server
- Access from multiple devices
- Enhanced features (AI analysis, form generation, etc.)

To enable backend mode:

1. **Start the backend service:**
```bash
# From repository root
node backend/services/cleardebt-service.js
```

2. **Configure backend URL:**

For development (automatic):
```
http://localhost:3010/api
```

For production, set via localStorage:
```javascript
localStorage.setItem("CLEARDEBT_API_URL", "https://your-api-domain.com/api")
```

Or environment variable:
```javascript
window.ENV = {
  CLEARDEBT_API_URL: "https://your-api-domain.com/api"
};
```

## Testing Your Configuration

### 1. Check Console Output

After configuring, refresh clearDebt.html and check browser console:

**Success:**
```
✅ Google OAuth configured
📡 Backend API: http://localhost:3010/api
🌍 Environment: Development
```

**Not Configured:**
```
⚠️ Google OAuth not configured - running in demo mode
💡 To configure, set one of:
   - localStorage.setItem("GOOGLE_CLIENT_ID", "your-client-id.apps.googleusercontent.com")
   - Add <meta name="google-client-id" content="your-client-id"> to HTML
   - Set window.ENV.GOOGLE_CLIENT_ID in deployment
```

### 2. Test Google Sign-In

1. Click the Google Sign-In button
2. Select your Google account
3. You should see your profile picture and name in the header
4. Check console for:
   - `✅ User registered with backend:` (if backend running)
   - OR `⚠️ Backend not available, using local storage only` (offline mode)

### 3. Test Data Storage

1. Add a debt or asset
2. Refresh the page
3. Sign in again
4. Your data should still be there

## Troubleshooting

### "Google OAuth not configured"
- **Cause:** No valid Client ID found
- **Solution:** Follow Google OAuth setup steps above

### "Backend not available"
- **Cause:** Backend service not running or wrong URL
- **Solution:** 
  1. Start backend: `node backend/services/cleardebt-service.js`
  2. Check console for backend URL
  3. Verify backend is accessible at that URL

### Google Sign-In button doesn't appear
- **Cause:** Google API script not loaded
- **Solution:** 
  1. Check internet connection
  2. Check browser console for errors
  3. Verify no ad blockers are blocking Google scripts

### "Invalid client" error from Google
- **Cause:** Client ID incorrect or domain not authorized
- **Solution:**
  1. Verify Client ID is correct
  2. Check authorized JavaScript origins in Google Console
  3. Make sure current domain is in authorized list

### Data not saving
- **Cause:** localStorage disabled or full
- **Solution:**
  1. Check browser settings allow localStorage
  2. Clear old data: `localStorage.clear()`
  3. Try different browser

## Features

Once configured, you'll have access to:

### ✅ Available Now (Frontend)
- Google OAuth authentication
- Debt tracking and management
- Asset inventory
- Document upload and storage (base64 in localStorage)
- Financial calculations and insights
- Local data persistence

### 🔄 Enhanced with Backend
- Multi-device sync
- AI-powered debt analysis
- Jurisdiction-specific guidance
- Automated form generation
- Email parsing for creditor communications
- Trustee interaction tracking
- Advanced bankruptcy eligibility evaluation

## Backend Service Details

The backend service provides these endpoints:

### User Management
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/:userId` - Get user details
- `PUT /api/user/:userId` - Update user

### Debt Management
- `POST /api/debt` - Create debt entry
- `GET /api/debt/:userId` - Get user's debts
- `PUT /api/debt/:debtId` - Update debt
- `DELETE /api/debt/:debtId` - Delete debt

### Asset Management
- `POST /api/asset` - Create asset entry
- `GET /api/asset/:userId` - Get user's assets
- `PUT /api/asset/:userId/:assetId` - Update asset
- `DELETE /api/asset/:userId/:assetId` - Delete asset

### Document Management
- `POST /api/document/upload` - Upload document
- `GET /api/document/:userId` - Get user's documents
- `DELETE /api/document/:documentId` - Delete document

### Advanced Features
- `POST /api/email/parse` - Parse creditor emails
- `POST /api/form/generate` - Generate bankruptcy forms
- `GET /api/jurisdiction/:state` - Get state-specific rules
- `POST /api/jurisdiction/evaluate` - Evaluate bankruptcy eligibility

### Health Check
- `GET /health` - Service status

## Production Deployment

### Frontend (GitHub Pages)

Already deployed at: https://barbrickdesign.github.io/clearDebt.html

To update:
1. Make changes to `clearDebt.html`
2. Commit and push to `main` branch
3. GitHub Pages automatically deploys

### Backend (Railway/Vercel/Your Server)

**Option 1: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

**Option 2: Node.js Server**
```bash
# On your server
git clone https://github.com/barbrickdesign/barbrickdesign.github.io.git
cd barbrickdesign.github.io/backend
npm install
node services/cleardebt-service.js
```

**Option 3: PM2 (Production)**
```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start backend/services/cleardebt-service.js --name cleardebt

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

## Security Notes

### ⚠️ Important
- Never commit your Google Client ID to public repositories if it's restricted
- Use environment variables for production secrets
- Enable CORS restrictions on backend for production
- Implement rate limiting on backend API
- Use HTTPS for all production deployments
- Regularly rotate OAuth client secrets

### Data Privacy
- User data stored in localStorage is device-specific
- Backend data should use encryption at rest
- Implement proper authentication on backend endpoints
- Follow GDPR/privacy regulations for user data

## Support

For issues or questions:
- Email: BarbrickDesign@gmail.com
- GitHub Issues: https://github.com/barbrickdesign/barbrickdesign.github.io/issues

## License

© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.

For licensing inquiries, contact: BarbrickDesign@gmail.com
