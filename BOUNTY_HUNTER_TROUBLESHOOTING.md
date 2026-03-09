# BountyHunter Troubleshooting Guide

**Last Updated:** February 19, 2026

This guide helps you diagnose and fix common issues with the BountyHunter system.

## Table of Contents
1. [CORS Errors](#cors-errors)
2. [Backend Connection Issues](#backend-connection-issues)
3. [No Bounties Found](#no-bounties-found)
4. [API Key Issues](#api-key-issues)
5. [Enhanced Logging & Debug Mode](#enhanced-logging--debug-mode)

---

## CORS Errors

### Symptom
```
Access to fetch at 'https://station.railway.com/bounties' from origin 
'https://barbrickdesign.github.io' has been blocked by CORS policy
```

### Explanation
Railway Station (station.railway.com) is not publicly accessible yet and blocks cross-origin requests. This is **expected behavior**.

### Solution
✅ **The system is working correctly!** BountyHunter automatically:
1. Tries direct fetch
2. Falls back to CORS proxy (corsproxy.io)
3. Falls back to AllOrigins proxy
4. Uses mock data for development/testing

### What You Should See
```
🔍 Debug: Fetch attempt 1 of 3
❌ Debug: Method 1 failed: CORS error
⚙️ Trying CORS proxy (direct fetch failed)...
🔍 Debug: Fetch attempt 2 of 3
💡 Switching to Development Mode with mock data
📦 Loading 5 mock bounties for demonstration
```

### Alternative Bounty Sources
If you want real bounties, use:
- **GitHub Issues**: Coming soon (integration planned)
- **Gitcoin**: Configure in platform dropdown
- **Custom URL**: Add your own bounty platform

---

## Backend Connection Issues

### Symptom
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
localhost:3000/api/bounty-hunter/status
```

### Explanation
The backend agent is not running. The web interface works standalone without the backend.

### Solutions

#### Option 1: Use Web-Only Mode (Recommended for Testing)
No setup needed! Just:
1. Open `bountyHunter.html`
2. Enter your Groq API key
3. Click "Fetch & rank bounties"
4. Generate answers for bounties

#### Option 2: Start Backend Agent
For autonomous operation:

```bash
cd backend
npm install
cp .env.bounty-hunter.example .env
nano .env  # Add your API keys
npm run bounty-hunter
```

### Check Backend Status
```bash
# Check if backend is running
curl http://localhost:3000/api/bounty-hunter/status

# Expected response:
{"status":"running","bounties":5,"earnings":0}
```

---

## No Bounties Found

### Symptom
```
📊 Found 0 bounties from Railway
ℹ️ No bounties found in HTML response
💡 Switching to Development Mode with mock data
```

### Causes & Solutions

#### Cause 1: Railway Station Not Accessible
**Status:** This is expected - Railway Station is in development  
**Solution:** Use mock data or alternative platforms

#### Cause 2: Page Structure Changed
**Status:** HTML selectors don't match current page structure  
**Solution:** Check browser console for debug logs:
```
🔍 Debug: Found 0 candidates with primary selectors
🔍 Debug: Found 0 candidates with fallback selector
```

#### Cause 3: Authentication Required
**Status:** Platform requires login to see bounties  
**Solution:** 
- Use backend agent with API credentials
- Or manually copy bounties from Railway Station

### Debug HTML Parsing
Open browser console and look for:
```
🔍 Debug: Document parsed, title: "Railway Bounties"
🔍 Debug: Document body length: 45231 chars
🔍 Debug: Searching for bounty elements...
🔍 Debug: Found X candidates with primary selectors
```

If title is wrong or body is empty, the page didn't load correctly.

---

## API Key Issues

### Issue 1: "No API key found"

#### Symptom
```
ℹ️ No API key found. Please enter your Groq API key to get started.
```

#### Solution
1. Visit https://console.groq.com/keys
2. Sign up (free, no credit card)
3. Create API key (starts with `gsk_`)
4. Paste in "Groq API key" field
5. Key is saved to localStorage

### Issue 2: "Invalid API key format"

#### Symptom
```
Invalid API key format. Groq keys start with 'gsk_', OpenAI keys start with 'sk-'
```

#### Solution
- Groq keys: Start with `gsk_`
- OpenAI keys: Start with `sk-`
- Double-check you copied the full key

### Issue 3: API Key Not Persisting

#### Symptom
Key disappears after page reload

#### Solution
Check browser's localStorage:
```javascript
// In browser console:
localStorage.getItem('bountyHunter_apiKey')
```

If null, your browser may be blocking localStorage. Try:
- Disable privacy/tracking protection for this page
- Allow cookies and site data
- Use a different browser

---

## Enhanced Logging & Debug Mode

### Enable Full Debug Logging

#### Frontend (Browser)
Open browser DevTools (F12), then:
```javascript
// Enable verbose console logging
localStorage.setItem('bountyHunter_debug', 'true');
location.reload();
```

Look for logs with `🔍 Debug:` prefix:
```
🔍 Debug: Fetch attempt 1 of 3
🔍 Debug: Response received in 245ms
🔍 Debug: Response length: 12453 characters
🔍 Debug: HTML preview (first 300 chars):
<!DOCTYPE html><html>...
```

#### Backend (Node.js)
Run with verbose flag:
```bash
# Dry run mode (no actual submissions)
node services/bounty-hunter-agent.js --dry-run

# Check logs in console
# Look for 🔍 Debug: messages
```

### Debug Output Locations

#### Frontend
- Browser Console (F12 → Console tab)
- On-page log panel (bottom of BountyHunter interface)

#### Backend
- Terminal/console output
- `backend/data/bounty-logs/completions.jsonl`
- `backend/data/bounty-opportunities/*.json`
- `backend/data/bounty-answers/*.md`

### What to Look For

#### Successful Fetch
```
🔍 Debug: Fetch attempt 1 of 3
🔍 Debug: Response received in 245ms
🔍 Debug: Response length: 12453 characters
✅ Successfully fetched bounty data
🔍 Debug: Document parsed, title: "Railway Bounties"
🔍 Debug: Found 8 candidates with primary selectors
🔍 Debug: Processing 8 bounty candidates...
✅ Debug: Successfully parsed 8 bounties from HTML
```

#### CORS Error (Expected)
```
🔍 Debug: Fetch attempt 1 of 3
❌ Debug: Method 1 failed: TypeError: Failed to fetch
🔍 Debug: This looks like a CORS or network error
   Possible causes:
   1. CORS policy blocking the request
   2. Network connectivity issue
⚙️ Trying CORS proxy (direct fetch failed)...
```

#### Parsing Issues
```
✅ Successfully fetched bounty data
🔍 Debug: Document parsed, title: "Access Denied"
🔍 Debug: Found 0 candidates with primary selectors
🔍 Debug: Found 0 candidates with fallback selector
⚠️ No bounties found in HTML response
```
This means we got HTML but couldn't find bounties (authentication/wrong page).

---

## Performance Issues

### Slow Response Times

#### Check API Performance
```
🔍 Debug: Response received in 3425ms  ← Slow!
```

**Solutions:**
- Switch to Groq (faster than OpenAI)
- Use smaller model (llama-3.1-70b-versatile)
- Check network connectivity

#### Check Parsing Performance
```javascript
// In browser console:
console.time('fetchBounties');
await fetchBountiesFromRailway();
console.timeEnd('fetchBounties');
```

Normal: < 2 seconds  
Slow: > 5 seconds (network issue)

---

## Mock Data Not Loading

### Symptom
No bounties appear even in development mode

### Solution
Check console for errors:
```javascript
getMockBounties()
// Should return array of 5 bounties
```

If this fails, JavaScript error is preventing execution. Check:
- Browser console for syntax errors
- Ad blockers (may block scripts)
- CSP (Content Security Policy) settings

---

## Need More Help?

### Debug Checklist
- [ ] Check browser console for errors
- [ ] Verify API key is entered and saved
- [ ] Try mock data mode explicitly
- [ ] Check network tab in DevTools
- [ ] Look for `🔍 Debug:` messages
- [ ] Try different browser
- [ ] Clear cache and reload

### Get Support
- **Documentation:** BOUNTY_HUNTER_README.md
- **Quick Start:** BOUNTY_HUNTER_QUICKSTART.md
- **Email:** barbrickdesign@gmail.com
- **Issues:** GitHub Issues with `bounty-hunter` label

### Report Bugs
When reporting issues, include:
1. Browser console logs (with 🔍 Debug messages)
2. Network tab screenshot (if CORS issue)
3. Steps to reproduce
4. Expected vs actual behavior
5. Browser and OS version

---

## Common Questions

### Q: Why can't I access Railway Station bounties?
**A:** Railway Station (station.railway.com) is in development and not publicly accessible. Use mock data for testing or wait for alternative platforms (GitHub Issues, Gitcoin).

### Q: Is the system broken?
**A:** No! The system is working correctly. CORS errors are expected. The system automatically falls back to mock data for development.

### Q: Can I use real bounty platforms?
**A:** Yes! GitHub Issues integration is coming soon. You can also configure custom bounty URLs in the platform dropdown.

### Q: Why does it say "Backend agent not detected"?
**A:** The backend is optional. The web interface works standalone for manual operation. Backend enables autonomous 24/7 operation.

### Q: Do I need to pay for API access?
**A:** No! Groq offers 14,400 free requests per day (plenty for bounty hunting). No credit card required.

---

## Success Indicators

### ✅ System is Working When You See:
- Mock data loads (5 bounties)
- Can select bounties
- Can enter API key
- Can generate answers
- Answers appear in textarea
- Copy button works

### ✅ Backend is Working When You See:
```bash
🎯 Autonomous Bounty Hunter Agent initialized
✅ Bounty Hunter Agent initialized successfully
▶️ Starting Autonomous Bounty Hunter Agent...
📊 Found 5 total bounties
✅ 5 eligible bounties (>10)
```

### ✅ Enhanced Logging is Working When You See:
```
🔍 Debug: Fetch attempt 1 of 3
🔍 Debug: Response received in 245ms
🔍 Debug: HTML preview (first 300 chars):...
```

---

**System Status:** ✅ Operating Normally  
**Expected Behavior:** CORS errors are normal, system uses mock data  
**Minimum Bounty:** $10  
**Test Mode:** Available at all times with mock data
