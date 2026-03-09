# ClearDebt Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get Google OAuth Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized origins:
   - `http://localhost:8000` (for testing)
   - `https://barbrickdesign.github.io` (for production)
7. Copy your Client ID

### Step 2: Configure Client ID
Open browser console (F12) and run:
```javascript
localStorage.setItem("GOOGLE_CLIENT_ID", "YOUR-CLIENT-ID.apps.googleusercontent.com")
```
Replace `YOUR-CLIENT-ID` with your actual Client ID from Step 1.

### Step 3: Refresh Page
Refresh [clearDebt.html](https://barbrickdesign.github.io/clearDebt.html) and you're ready to go!

---

## 🎯 What You Get

### Offline Mode (Default)
- ✅ All data stored locally in browser
- ✅ Works immediately after configuration
- ✅ No backend required
- ✅ Privacy-focused (data never leaves device)

### Online Mode (With Backend)
- ✅ All offline features PLUS:
- ✅ Multi-device sync
- ✅ AI-powered analysis
- ✅ Automated form generation
- ✅ Advanced features

---

## 🔧 Optional: Start Backend

If you want online features:

```bash
# From repository root
node backend/services/cleardebt-service.js
```

Backend will start on `http://localhost:3010`

---

## ❓ Troubleshooting

### "Google OAuth not configured" banner showing?
- Make sure you completed Step 2
- Verify Client ID format: `*.apps.googleusercontent.com`
- Refresh the page after setting

### "Backend not available" message?
- This is normal if backend not running
- App works fine in offline mode
- Start backend if you want online features

### Google Sign-In button not appearing?
- Check internet connection
- Disable ad blockers temporarily
- Check browser console for errors

---

## 📚 Full Documentation

For complete documentation, see [CLEARDEBT_SETUP_GUIDE.md](./CLEARDEBT_SETUP_GUIDE.md)

## 🆘 Support

- **Email**: BarbrickDesign@gmail.com
- **Issues**: [GitHub Issues](https://github.com/barbrickdesign/barbrickdesign.github.io/issues)

---

© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.
