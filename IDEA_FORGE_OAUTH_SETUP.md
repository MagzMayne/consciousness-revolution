# Idea Forge - OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for the Idea Forge application.

## Overview

The Idea Forge application uses:
- **Google OAuth** for user authentication and identity
- **GitHub OAuth Device Flow** for repository access
- **GitHub as storage** - all ideas are stored as JSON files in a GitHub repository

## Prerequisites

- A Google Cloud Console account
- A GitHub account
- The Idea Forge application deployed and accessible (e.g., on GitHub Pages)

---

## Step 1: Set Up Google OAuth

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Idea Forge" (or your preferred name)
4. Click "Create"

### 1.2 Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Idea Forge
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
8. Click "Update" → "Save and Continue"
9. Skip "Test users" and click "Save and Continue"

### 1.4 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Select "Web application"
4. Name it "Idea Forge Web Client"
5. Add **Authorized JavaScript origins**:
   ```
   https://yourusername.github.io
   ```
   (Replace with your actual GitHub Pages URL or domain)
6. Add **Authorized redirect URIs**:
   ```
   https://yourusername.github.io/devPortal.html
   ```
   (Must match your deployed URL exactly)
7. Click "Create"
8. **Copy your Client ID** - you'll need this next

### 1.5 Update devPortal.html

1. Open `devPortal.html`
2. Find this line:
   ```javascript
   const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:
   ```javascript
   const GOOGLE_CLIENT_ID = "123456789-abcdefghijk.apps.googleusercontent.com";
   ```

---

## Step 2: Set Up GitHub OAuth

### 2.1 Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the form:
   - **Application name**: Idea Forge
   - **Homepage URL**: `https://yourusername.github.io`
   - **Application description**: Idea management and project forge
   - **Authorization callback URL**: `https://yourusername.github.io/devPortal.html`
4. Click "Register application"

### 2.2 Get Your Client ID

1. After creating the app, you'll see your **Client ID** on the app settings page
2. **Copy the Client ID** - you don't need the Client Secret for Device Flow

### 2.3 Enable Device Flow

The GitHub Device Flow is enabled by default for all OAuth apps, so no additional configuration is needed.

### 2.4 Update devPortal.html

1. Open `devPortal.html`
2. Find this line:
   ```javascript
   const GITHUB_CLIENT_ID = "YOUR_GITHUB_CLIENT_ID";
   ```
3. Replace `YOUR_GITHUB_CLIENT_ID` with your actual Client ID:
   ```javascript
   const GITHUB_CLIENT_ID = "Iv1.a1b2c3d4e5f6g7h8";
   ```

---

## Step 3: Deploy and Test

### 3.1 Commit Your Changes

```bash
git add devPortal.html
git commit -m "Configure OAuth client IDs"
git push
```

### 3.2 Test Google Login

1. Open your deployed Idea Forge app
2. Click "Login with Google"
3. You should be redirected to Google's login page
4. After authorizing, you should be redirected back with your email displayed

### 3.3 Test GitHub Connection

1. Click "Connect GitHub"
2. You'll see an alert with a device code
3. Go to https://github.com/login/device
4. Enter the code shown in the alert
5. Authorize the application
6. The page should automatically detect authorization and show "GitHub connected!"

### 3.4 Test Idea Sync

1. Create a test idea in the app
2. Click "Estimate & Save"
3. Click "🔄 Sync to GitHub"
4. Check your GitHub account - you should see a new repository called `idea-forge-data`
5. Inside the repo, there should be an `ideas.json` file with your idea

---

## Architecture Overview

### How It Works

1. **User Authentication**
   - User clicks "Login with Google"
   - Redirected to Google OAuth consent screen
   - After approval, receives an access token
   - App fetches user profile (email, name)
   - Profile stored in localStorage

2. **GitHub Authorization**
   - User clicks "Connect GitHub"
   - App requests a device code from GitHub
   - User visits github.com/login/device and enters the code
   - App polls GitHub until authorization is granted
   - GitHub token stored in localStorage

3. **Data Sync**
   - When user submits an idea, it's saved to localStorage
   - App automatically syncs to GitHub (if connected)
   - Creates repo `idea-forge-data` if it doesn't exist
   - Pushes `ideas.json` with all ideas
   - Each sync is a new commit

### Data Storage

- **LocalStorage**: Primary cache, works offline
- **GitHub Repository**: Persistent storage, accessible anywhere
- **Repository Name**: `idea-forge-data` (under user's account)
- **File Format**: JSON in `ideas.json`

### Security Notes

- ✅ No client secrets exposed (Device Flow is public-client safe)
- ✅ All tokens stored in localStorage (browser-only)
- ✅ OAuth tokens expire and must be refreshed
- ⚠️ Users can revoke access anytime in GitHub/Google settings

---

## Troubleshooting

### "Redirect URI mismatch" error

- Make sure the redirect URI in Google Cloud Console **exactly** matches your deployed URL
- Include the protocol (https://)
- Include the full path (`/devPortal.html`)

### "Client ID not found" error

- Verify you've replaced `YOUR_GOOGLE_CLIENT_ID` and `YOUR_GITHUB_CLIENT_ID`
- Make sure there are no extra spaces or quotes

### GitHub sync fails

1. Check that you clicked "Connect GitHub" first
2. Open browser console (F12) and check for error messages
3. Verify the GitHub token exists: `localStorage.getItem("github_token")`

### Google login doesn't work on localhost

- Google OAuth requires https:// or localhost
- For local development, use: `http://localhost:8000/devPortal.html`
- Add this as an authorized redirect URI in Google Console

---

## Advanced Configuration

### Using a Shared Organization Repo

To store all ideas in a single organization repository instead of user repositories:

1. Create an organization on GitHub
2. Create a repo called `idea-forge-data` in that org
3. Modify `syncIdeasToGitHub()` function:
   ```javascript
   const repoName = "idea-forge-data";
   const orgName = "your-org-name"; // Add this
   
   // Change the pushFile call:
   await pushFile(
     orgName,  // Use org instead of username
     repoName,
     "ideas.json",
     ideas,
     `Sync ideas - ${new Date().toISOString()}`
   );
   ```

### Adding Multiple File Support

To store each idea as a separate file:

```javascript
// In syncIdeasToGitHub():
const ideas = JSON.parse(localStorage.getItem("ideas") || "[]");

for (const idea of ideas) {
  await pushFile(
    username,
    repoName,
    `ideas/${idea.id}.json`,
    JSON.stringify(idea, null, 2),
    `Update idea: ${idea.title}`
  );
}
```

---

## Next Steps

Once OAuth is configured, you can:

- 🎨 Customize the UI styling
- 🤖 Wire up the AI expansion feature
- 💬 Add Discord webhook notifications
- 📊 Create a public idea gallery view
- 🔗 Add GitHub Pages deployment for the data repo
- 👥 Build a contributor matching system

---

## Support

If you run into issues:

1. Check browser console for errors
2. Verify OAuth credentials are correct
3. Test with a fresh browser session (incognito)
4. Review GitHub/Google OAuth documentation
5. Open an issue on the repository

## Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub Device Flow Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
- [GitHub API Documentation](https://docs.github.com/en/rest)
