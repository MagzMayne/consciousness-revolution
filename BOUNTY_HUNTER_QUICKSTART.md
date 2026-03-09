# Bounty Hunter Quick Setup Guide

**Last Updated:** February 18, 2026  
**Time to Complete:** 10 minutes  
**Difficulty:** Easy

## Prerequisites

- Node.js 18+ installed
- Git repository cloned
- Text editor (VS Code, nano, etc.)

## Step-by-Step Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
# Copy the example file
cp .env.bounty-hunter.example .env
```

### 4. Get Railway API Key

1. Visit: **https://railway.app/account/tokens**
2. Log in with: `barbrickdesign@gmail.com`
3. Click "**Create Token**"
4. Give it a name: `bounty-hunter-agent`
5. Copy the token (starts with a UUID format)

### 5. Get Groq API Key (Recommended)

1. Visit: **https://console.groq.com/keys**
2. Sign up for free account (if needed)
3. Click "**Create API Key**"
4. Give it a name: `bounty-hunter`
5. Copy the key (starts with `gsk_`)

**OR** Get OpenAI API Key (Alternative):
1. Visit: **https://platform.openai.com/api-keys**
2. Click "**Create new secret key**"
3. Copy the key (starts with `sk-`)

### 6. Edit .env File

Open `backend/.env` in your text editor:

```bash
nano .env
# OR
code .env
# OR
vim .env
```

Replace the placeholder values:

```bash
# Railway API Key
RAILWAY_API_KEY=paste-your-railway-key-here

# Groq API Key (recommended)
GROQ_API_KEY=paste-your-groq-key-here
USE_GROQ=true

# OR OpenAI API Key (alternative)
OPENAI_API_KEY=paste-your-openai-key-here

# Account email (already configured)
RAILWAY_EMAIL=barbrickdesign@gmail.com
```

Save and exit (Ctrl+X, Y, Enter for nano)

### 7. Verify Configuration

```bash
# Check .env file exists
ls -la .env

# Verify it's not tracked by git
git status .env
# Should show it's ignored

# Test the configuration (dry run)
npm run bounty-hunter:dry-run
```

You should see:
```
🎯 Autonomous Bounty Hunter Agent initialized
📧 Railway Account: barbrickdesign@gmail.com
✅ Railway API key configured for automated access
✅ Groq/Grok API key loaded (cost-effective mode)
```

### 8. Run the Agent

**Dry Run (Test Mode):**
```bash
npm run bounty-hunter:dry-run
```
- Tests without submitting
- Saves answers to `data/bounty-answers/`
- Perfect for verification

**Production Mode:**
```bash
npm run bounty-hunter
```
- Runs continuously
- Checks every 15 minutes
- Generates answers automatically
- Saves for manual submission

### 9. Monitor Operations

**View Status:**
```bash
# Check if agent is running
ps aux | grep bounty-hunter

# View recent logs
tail -f data/bounty-logs/completions.jsonl

# Check earnings
cat data/bounty-hunter-state.json
```

**View Generated Answers:**
```bash
ls -lh data/bounty-answers/
cat data/bounty-answers/bounty-*.md
```

## Configuration Options

Edit `backend/.env` to customize:

```bash
# Minimum reward to process (in USD)
MIN_REWARD_THRESHOLD=10

# Check frequency (milliseconds)
# 900000 = 15 minutes
# 300000 = 5 minutes
CHECK_INTERVAL=900000

# Max bounties to process simultaneously
MAX_CONCURRENT_BOUNTIES=3

# Enable dry run mode
DRY_RUN=false

# Enable verbose logging
VERBOSE=false
```

## Troubleshooting

### 🪟 Windows Users

If you're on Windows and experiencing issues with PowerShell, curl commands, or npm not finding package.json, see the **[Windows Setup Guide](WINDOWS_SETUP_GUIDE.md)** for Windows-specific instructions and troubleshooting.

Common Windows issues covered:
- "package.json not found" errors
- PowerShell curl command problems
- Navigation and directory issues
- nixpacks installation (optional)

### Error: "No API key found"

**Solution:** Check your `.env` file has the keys:
```bash
grep -E "RAILWAY_API_KEY|GROQ_API_KEY|OPENAI_API_KEY" .env
```

### Error: "Module not found"

**Solution:** Install dependencies:
```bash
npm install
```

### Error: "Permission denied"

**Solution:** Make sure you're in the backend directory:
```bash
cd backend
pwd  # Should show: /path/to/backend
```

### Agent won't start

**Solution:** Check Node.js version:
```bash
node --version  # Should be 18.0.0 or higher
```

### No bounties found

**Solution:** Railway may have changed their HTML structure. Check logs for parsing errors.

## Security Checklist

- [ ] `.env` file created and configured
- [ ] `.env` not committed to git (verify with `git status`)
- [ ] API keys are not hard-coded in any files
- [ ] Only `.env.example` has placeholders
- [ ] Keys are kept secret (not shared in emails/issues)

## Next Steps

1. **Test in dry-run mode first:**
   ```bash
   npm run bounty-hunter:dry-run
   ```

2. **Review generated answers:**
   ```bash
   cat data/bounty-answers/bounty-*.md
   ```

3. **Run in production:**
   ```bash
   npm run bounty-hunter
   ```

4. **Monitor earnings:**
   - Check `data/bounty-hunter-state.json`
   - Review PayPal account at barbrickdesign@gmail.com

5. **Schedule as service (optional):**
   ```bash
   # Using systemd on Linux
   sudo systemctl enable bounty-hunter
   sudo systemctl start bounty-hunter
   ```

## Support

- **Documentation:** `BOUNTY_HUNTER_README.md`
- **Security Guide:** `SECURITY_WARNING_API_KEYS.md`
- **Email:** barbrickdesign@gmail.com

## Important Notes

⚠️ **Security:**
- NEVER commit `.env` to git
- Rotate API keys if exposed
- Monitor API usage dashboards

💰 **Earnings:**
- All bounty payments go to barbrickdesign@gmail.com
- Tracked in `data/bounty-hunter-state.json`
- Integrated with PayPal webhook system

🤖 **Operation:**
- Agent runs continuously in production mode
- Generates high-quality answers with AI
- Currently requires manual submission to Railway
- Auto-submission coming in future update

---

**Setup Complete! 🎉**

Your Bounty Hunter agent is now ready to generate income autonomously.
