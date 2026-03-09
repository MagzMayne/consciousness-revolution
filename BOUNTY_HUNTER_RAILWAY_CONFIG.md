# BountyHunter Railway Backend Configuration Guide

## Overview

This guide explains how to configure the BountyHunter frontend (GitHub Pages) to communicate with the Railway backend API.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Pages (Frontend)                                    │
│  https://barbrickdesign.github.io/bountyHunter.html        │
│                                                             │
│  • User interface for bounty hunting                        │
│  • Configures backend URL                                   │
│  • Displays bounty hunter status                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTPS API Calls
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Railway Backend (API Server)                               │
│  https://your-project.up.railway.app                        │
│                                                             │
│  • Express API server                                       │
│  • Serves bounty hunter agent status                        │
│  • Provides logs and answers                                │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Deploy Backend to Railway

### Option A: Using Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project (from repository root):
   ```bash
   railway init
   ```

4. Set environment variables:
   ```bash
   # Add your Groq API key
   railway variables set GROQ_API_KEY=gsk-...
   
   # Or OpenAI API key
   railway variables set OPENAI_API_KEY=sk-...
   ```

5. Deploy:
   ```bash
   railway up
   ```

6. Get your deployment URL:
   ```bash
   railway domain
   ```
   
   Example output: `your-project-name.up.railway.app`

### Option B: Using Railway Web Interface

1. Go to https://railway.app/new

2. Click "Deploy from GitHub repo"

3. Select `barbrickdesign/barbrickdesign.github.io`

4. Configure settings:
   - **Root Directory**: Leave empty (or `.`)
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node services/bounty-hunter-api.js`
   
   Or just let Railway use the `Procfile`:
   ```
   web: cd backend && node services/bounty-hunter-api.js
   ```

5. Add environment variables:
   - Go to Variables tab
   - Add `GROQ_API_KEY` or `OPENAI_API_KEY`

6. Deploy and wait for build to complete

7. Note your Railway URL from the Deployments tab

## Step 2: Configure Frontend

### From GitHub Pages

1. Open https://barbrickdesign.github.io/bountyHunter.html

2. Find the "Backend URL" field in the configuration section

3. Enter your Railway backend URL:
   ```
   https://your-project-name.up.railway.app
   ```

4. The URL will be automatically saved to localStorage

5. Click the backend status indicator to refresh and verify connection

### Using URL Parameters (for testing)

You can also pass the backend URL as a URL parameter:

```
https://barbrickdesign.github.io/bountyHunter.html?backendUrl=https://your-project.up.railway.app
```

## Step 3: Verify Connection

### Check Backend Health

1. Visit your Railway backend URL directly:
   ```
   https://your-project-name.up.railway.app/health
   ```

2. You should see:
   ```json
   {
     "status": "ok",
     "service": "bounty-hunter-api",
     "timestamp": "2026-02-19T03:56:17.390Z"
   }
   ```

### Check Bounty Hunter Status

1. Visit the status endpoint:
   ```
   https://your-project-name.up.railway.app/api/bounty-hunter/status
   ```

2. You should see:
   ```json
   {
     "isRunning": false,
     "completedBounties": 0,
     "totalEarnings": 0,
     "lastUpdate": null
   }
   ```

### Test from Frontend

1. Open bountyHunter.html with configured backend URL

2. Look at the backend status in the header (top right):
   - ✅ "Running" = Backend is connected and agent is active
   - ⚠️ "Not Running" = Backend is connected but agent hasn't started yet
   - ❌ Connection error = Backend URL is wrong or server is down

3. Check the console log for connection details

## API Endpoints

The Railway backend exposes these endpoints:

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "service": "bounty-hunter-api",
  "timestamp": "2026-02-19T03:56:17.390Z"
}
```

### GET /api/bounty-hunter/status
Get bounty hunter agent status

**Response:**
```json
{
  "isRunning": true,
  "completedBounties": 5,
  "totalEarnings": 750,
  "lastUpdate": "2026-02-19T03:45:00.000Z"
}
```

### GET /api/bounty-hunter/logs
Get recent bounty completion logs

**Response:**
```json
[
  {
    "timestamp": "2026-02-19T03:45:00.000Z",
    "bountyId": "bounty-123",
    "title": "Fix CORS issues",
    "reward": 100,
    "account": "barbrickdesign@gmail.com"
  }
]
```

### GET /api/bounty-hunter/answers
Get list of generated answers

**Response:**
```json
[
  {
    "filename": "bounty-mock-1-answer.md",
    "content": "# Answer to bounty...",
    "createdAt": "2026-02-19T03:45:00.000Z",
    "size": 1024
  }
]
```

## Troubleshooting

### Frontend Can't Connect to Backend

**Problem:** Backend status shows "Not Running" or connection error

**Solutions:**

1. **Check Railway backend URL is correct**
   - Go to Railway dashboard
   - Click on your deployment
   - Copy the domain (e.g., `your-project.up.railway.app`)
   - Make sure it starts with `https://` (not `http://`)

2. **Check CORS settings**
   - The API server has CORS enabled by default
   - If you're still getting CORS errors, check Railway logs:
     ```bash
     railway logs
     ```

3. **Check Railway backend is deployed**
   - Go to Railway dashboard
   - Make sure deployment status is "Success"
   - Check for any deployment errors

4. **Test backend directly**
   - Open `https://your-project.up.railway.app/health` in browser
   - Should show "ok" status
   - If it shows 404 or doesn't load, backend isn't deployed correctly

### Backend is Running but Agent Isn't

**Problem:** Backend shows "Not Running" even though Railway is deployed

**Explanation:** The API server and the bounty hunter agent are separate processes:
- **API Server** (bounty-hunter-api.js): Provides status endpoints - always running
- **Bounty Hunter Agent** (bounty-hunter-agent.js): Actually hunts bounties - needs to be started separately

**Solutions:**

1. **Start the bounty hunter agent** (currently manual process):
   ```bash
   # SSH into Railway or run locally
   cd backend
   npm run bounty-hunter
   ```

2. **Or use the autonomous mode** (for 24/7 operation):
   - See BOUNTY_HUNTER_DEPLOYMENT.md for full autonomous setup
   - Requires separate worker process on Railway

### Environment Variables Not Working

**Problem:** API calls failing with authentication errors

**Solutions:**

1. **Check Railway environment variables**
   - Go to Railway dashboard → Variables tab
   - Make sure `GROQ_API_KEY` or `OPENAI_API_KEY` is set
   - No quotes needed, just paste the key value

2. **Redeploy after adding variables**
   - Click "Deploy" in Railway dashboard
   - Or push a new commit to trigger deployment

3. **Check logs for errors**
   ```bash
   railway logs
   ```

## Railway Project Link

Your Railway project: https://railway.app/project/10cd1f96-8670-4c81-b045-2d0419e420c4

## Support

For issues or questions:
- 📧 Email: barbrickdesign@gmail.com
- 📖 Documentation: BOUNTY_HUNTER_README.md
- 🐛 Issues: https://github.com/barbrickdesign/barbrickdesign.github.io/issues

## Next Steps

Once configured:
1. ✅ Backend deployed to Railway
2. ✅ Frontend configured with Railway URL
3. ✅ Connection verified
4. 🎯 Ready to hunt bounties!

For autonomous operation (24/7 bounty hunting), see:
- BOUNTY_HUNTER_DEPLOYMENT.md - Full deployment guide
- BOUNTY_HUNTER_README.md - Complete documentation
- BOUNTY_HUNTER_QUICKSTART.md - Quick setup guide
