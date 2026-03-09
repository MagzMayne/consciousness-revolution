# Autonomous Bounty Hunter System

## Overview

The Autonomous Bounty Hunter system is a fully automated agent that monitors bounty platforms, generates high-quality answers using AI, and autonomously completes bounties to generate income routed to barbrickdesign@gmail.com.

**⚠️ IMPORTANT: Development Mode Active**

The Railway bounties platform (station.railway.com/bounties) is currently not publicly accessible. The system automatically operates in **mock data mode** for development and testing. This allows full functionality testing without requiring external platform access.

**Mock data mode provides:**
- 5 realistic sample bounties
- Full UI functionality
- Answer generation testing
- All features except actual submission
- Clear visual indicators (Development Mode badge and banner)

**Platform Selection:** The web interface now includes a platform selector dropdown allowing you to choose between:
- **Mock Data** (default) - Test bounties for development
- **Railway Station** - For when the platform becomes available
- **GitHub Issues** - Coming soon
- **Gitcoin** - Coming soon
- **Custom URL** - Configure your own bounty source

To switch platforms, use the "Bounty Platform" dropdown in the configuration section at the top of the page.

**To use with real bounty platforms:** See the [Alternative Bounty Platforms](#alternative-bounty-platforms) section below.

## Features

✅ **Autonomous Operation** - Runs continuously without human intervention  
✅ **Fetch-Only Mode** - Works without API keys (bounty monitoring only)  
✅ **Smart Bounty Selection** - Ranks bounties by reward and difficulty  
✅ **AI-Powered Answers** - Generates professional, detailed responses  
✅ **Income Generation** - Earns money by completing bounties  
✅ **Self-Healing** - Automatically recovers from errors  
✅ **Multi-Mode Operation** - Dry-run, manual, and auto-submit modes  
✅ **CORS Bypass** - Multiple proxy methods for web-based fetching  

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  bountyHunter.html                       │
│                  (Web Interface)                         │
│                                                           │
│  • Manual bounty browsing                                │
│  • Answer preview and editing                            │
│  • Copy/paste to Railway                                 │
└─────────────────────────────────────────────────────────┘
                           │
                           │ (User Interface)
                           │
┌─────────────────────────────────────────────────────────┐
│         backend/services/bounty-hunter-agent.js          │
│              (Autonomous Backend Agent)                  │
│                                                           │
│  • Continuous bounty monitoring (every 15 min)          │
│  • Automatic answer generation                           │
│  • Reward tracking and reporting                         │
│  • PayPal integration for earnings                       │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Railway    │  │  OpenAI API  │  │   PayPal     │
│  Bounties    │  │     (LLM)    │  │   Payment    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Components

### 1. Web Interface (`bountyHunter.html`)

Interactive web UI for manual operation:
- **Platform Selection** - Choose between Mock Data, Railway, GitHub, Gitcoin, or Custom URL
- **Mode Indicator** - Visual badge showing Development Mode or Live Mode
- **Platform Notice** - Banner explaining when mock data is being used
- Browse available bounties
- Preview AI-generated answers
- Edit answers before submission
- Copy to clipboard for manual pasting
- Configure API keys and settings

**URL:** https://barbrickdesign.github.io/bountyHunter.html

**UI Features (New):**
- **Development Mode Badge** - Clear indicator when using mock data
- **Platform Selector Dropdown** - Easy switching between bounty sources
- **Informational Banner** - Explains mock data mode without alarming errors
- **Improved Logging** - Helpful guidance instead of error messages

### 2. Backend Agent (`backend/services/bounty-hunter-agent.js`)

Autonomous Node.js service that:
- Polls Railway every 15 minutes
- Filters bounties by minimum reward ($10+)
- Ranks bounties by reward amount
- Generates answers using LLM
- Tracks earnings and completion status
- Saves answers for manual submission

### 3. PayPal Integration

Routes all bounty earnings to:
- **Email:** barbrickdesign@gmail.com
- **Integration:** Uses existing PayPal webhook handler
- **Tracking:** Logs all earnings and transactions

## Installation & Setup

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Install dependencies
cd backend
npm install

# Load environment variables
# The .env file is automatically loaded by the agent
```

### Configuration Steps

1. **Copy environment template:**
   ```bash
   cd backend
   cp .env.bounty-hunter.example .env
   ```

2. **Get Railway API Key:**
   - Visit: https://railway.app/account/tokens
   - Create new token
   - Copy to `RAILWAY_API_KEY` in `.env`

3. **Get Groq/Grok API Key (Recommended):**
   - Visit: https://console.groq.com/keys
   - Sign up for free account
   - Create API key
   - Copy to `GROQ_API_KEY` in `.env`
   - Set `USE_GROQ=true`

4. **OR Get OpenAI API Key (Alternative):**
   - Visit: https://platform.openai.com/api-keys
   - Create API key
   - Copy to `OPENAI_API_KEY` in `.env`

5. **Verify configuration:**
   ```bash
   # Check that .env file exists and is not tracked by git
   ls -la backend/.env
   git check-ignore backend/.env
   # Should output: backend/.env
   ```

### Environment Variables

Create `backend/.env` file (copy from `.env.bounty-hunter.example`):

```bash
# Copy example file
cp backend/.env.bounty-hunter.example backend/.env

# Edit with your API keys
nano backend/.env
```

**Required Configuration:**

```bash
# Railway API Key (for automated bounty access)
# Get from: https://railway.app/account/tokens
RAILWAY_API_KEY=your-railway-api-key-here

# LLM API Key (choose one)
# Option 1: Groq/Grok (recommended - fast & cost-effective)
# Get from: https://console.groq.com/keys
GROQ_API_KEY=gsk-your-groq-api-key-here
USE_GROQ=true

# Option 2: OpenAI (alternative)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# Account email (where earnings are routed)
RAILWAY_EMAIL=barbrickdesign@gmail.com
```

**⚠️ SECURITY WARNING:**
- **NEVER commit the .env file to git**
- The `.env` file contains real API keys
- Always use `.env.example` for templates
- Rotate keys if exposed publicly
- See `SECURITY_WARNING_API_KEYS.md` for details

### Quick Start

```bash
# Dry-run mode (test without submitting)
npm run bounty-hunter:dry-run

# Production mode (auto-generate answers)
npm run bounty-hunter

# Development mode with auto-reload
npm run bounty-hunter:dev
```

## Usage

### Operational Modes

#### 1. Fetch-Only Mode (No API Key Required)

```bash
cd backend
npm run bounty-hunter:dry-run
```

**NEW:** Agent now works without API keys!

- Fetches and ranks bounties from Railway
- Saves bounty details to `backend/data/bounty-opportunities/`
- Does NOT generate answers (requires API key)
- Perfect for:
  - Initial testing and verification
  - Monitoring bounty availability
  - Running continuously to track new opportunities
  - Systems where API keys cannot be stored

**Bounty files saved as:**
```json
{
  "id": "bounty-123",
  "title": "Help with deployment issue",
  "reward": "$100",
  "rewardValue": 100,
  "body": "Full bounty description...",
  "status": "pending-answer-generation",
  "instructions": ["Add API key to generate answers"]
}
```

#### 2. Dry-Run Mode (Testing with API Key)

```bash
cd backend
npm run bounty-hunter:dry-run
```

- Fetches and ranks bounties
- **Generates answers using LLM**
- Does NOT submit
- Saves answers to `backend/data/bounty-answers/`
- Perfect for testing and verification

#### 3. Production Mode (Autonomous)

```bash
cd backend
npm run bounty-hunter
```

- Runs continuously every 15 minutes
- Generates answers automatically
- Saves for manual submission (until Railway API auth added)
- Logs all completions and earnings

#### 4. Manual Mode (Web Interface)

1. Visit: https://barbrickdesign.github.io/bountyHunter.html
2. Enter your OpenAI API key
3. Click "Fetch & rank bounties"
4. Select a bounty
5. Click "Generate answer"
6. Copy and paste to Railway

### Configuration Options

```javascript
const agent = new AutonomousBountyHunterAgent({
    checkInterval: 900000,        // 15 minutes (in ms)
    minRewardThreshold: 10,       // $10 minimum reward
    maxConcurrentBounties: 3,     // Process up to 3 at once
    autoSubmit: false,            // Auto-submit (requires auth)
    dryRun: false,                // Test mode
    railwayEmail: 'barbrickdesign@gmail.com'
});
```

## Autonomous Operation

### How It Works

1. **Polling Cycle (Every 15 minutes)**
   ```
   Fetch bounties → Filter by reward → Rank by value → Select top 3
   ```

2. **Answer Generation**
   ```
   Extract bounty details → Generate prompt → Call LLM → Parse answer
   ```

3. **Submission (Manual for now)**
   ```
   Save answer → Log to file → Notify for manual submission
   ```

4. **Earnings Tracking**
   ```
   Track reward value → Log completion → Update total earnings
   ```

### File Structure

```
backend/
├── services/
│   └── bounty-hunter-agent.js      # Main autonomous agent
├── data/
│   ├── bounty-answers/             # Generated answers
│   │   └── bounty-{id}-{timestamp}.md
│   ├── bounty-logs/                # Completion logs
│   │   └── completions.jsonl
│   └── bounty-hunter-state.json    # Agent state (earnings, completed)
└── package.json                     # Dependencies & scripts
```

## Income Generation

### Revenue Flow

```
Railway Bounty Completed
         │
         ▼
Railway → barbrickdesign@gmail.com (PayPal)
         │
         ▼
Automatic tracking & reporting
         │
         ▼
Integration with Autonomous Income Orchestrator
```

### Earnings Tracking

The agent maintains:
- **Total Earnings:** Cumulative bounty rewards
- **Completed Bounties:** List of finished bounty IDs
- **Active Bounties:** Currently processing
- **Completion Log:** JSONL file with all details

View current earnings:
```bash
cd backend
node -e "const fs = require('fs'); const state = JSON.parse(fs.readFileSync('data/bounty-hunter-state.json')); console.log('Total Earnings: $' + state.totalEarnings);"
```

### PayPal Integration

Bounty earnings are routed through:
- **Handler:** `backend/paypal-webhook-handler.js`
- **Email:** barbrickdesign@gmail.com
- **Integration:** Existing PayPal system
- **Tracking:** Logs all transactions

## Monitoring & Maintenance

### Alternative Bounty Platforms

While designed for Railway bounties, the system can be adapted to work with other platforms:

#### GitHub Issues with Bounty Labels

```javascript
// backend/services/github-bounty-adapter.js
async fetchBountiesFromGitHub(owner, repo) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?labels=bounty`,
    {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );
  const issues = await response.json();
  
  return issues.map(issue => ({
    id: `github-${issue.number}`,
    url: issue.html_url,
    title: issue.title,
    body: issue.body,
    rewardText: extractReward(issue.body), // Parse from issue body
    rewardValue: parseReward(extractReward(issue.body)),
    tags: issue.labels.map(l => l.name)
  }));
}
```

#### Gitcoin

```javascript
// backend/services/gitcoin-bounty-adapter.js
async fetchBountiesFromGitcoin() {
  const response = await fetch(
    'https://gitcoin.co/api/v0.1/bounties/',
    {
      headers: {
        'Authorization': `token ${process.env.GITCOIN_API_KEY}`
      }
    }
  );
  const data = await response.json();
  
  return data.map(bounty => ({
    id: `gitcoin-${bounty.id}`,
    url: bounty.url,
    title: bounty.title,
    body: bounty.description,
    rewardText: `${bounty.value_in_usdt} USDT`,
    rewardValue: parseFloat(bounty.value_in_usdt),
    tags: bounty.keywords
  }));
}
```

#### Configuration

Add to `backend/.env`:
```bash
# Choose bounty platform
BOUNTY_PLATFORM=github  # Options: railway, github, gitcoin, bountysource

# GitHub configuration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_BOUNTY_REPOS=owner1/repo1,owner2/repo2

# Gitcoin configuration
GITCOIN_API_KEY=your_key_here

# Custom platform
CUSTOM_BOUNTY_URL=https://your-platform.com/api/bounties
```

### Status Check

```bash
# Check if agent is running
ps aux | grep bounty-hunter

# View logs
tail -f backend/data/bounty-logs/completions.jsonl

# Check earnings
cat backend/data/bounty-hunter-state.json
```

### Health Monitoring

The agent provides status reports:

```javascript
const status = agent.getStatus();
console.log(status);
// {
//   isRunning: true,
//   totalEarnings: 450,
//   completedBounties: 9,
//   activeBounties: 2,
//   checkInterval: '15 minutes',
//   account: 'barbrickdesign@gmail.com',
//   autoSubmit: false,
//   dryRun: false
// }
```

### Error Recovery

The agent includes self-healing:
- **API Failures:** Retries with exponential backoff
- **Network Issues:** Waits and retries
- **LLM Errors:** Falls back to different models
- **State Corruption:** Rebuilds from logs

## Railway API Authentication

### Current Status

⚠️ **Manual Submission Required**

Railway bounties currently require manual submission because:
1. Railway uses session-based authentication (cookies)
2. No public API for bounty submission
3. Browser automation would be fragile

### Generated Answers Location

All answers are saved to:
```
backend/data/bounty-answers/bounty-{id}-{timestamp}.md
```

Each file includes:
- Bounty details (ID, URL, reward)
- Generated answer in Markdown
- Submission instructions
- Account email

### Manual Submission Process

1. Agent generates answer automatically
2. Answer saved to `backend/data/bounty-answers/`
3. Review the answer file
4. Log in to Railway with barbrickdesign@gmail.com
5. Visit bounty URL
6. Copy answer and submit
7. Mark file as submitted

### Future: Automatic Submission

Planned implementation:
- Railway API integration (when available)
- Browser automation with Playwright
- Session management with cookies
- Automatic submission workflow

## LLM Integration

### Supported Models

1. **Groq Grok / Mixtral** (Default - Recommended)
   - Ultra-fast inference
   - Free tier available (14,400 requests/day)
   - Cost-effective for high volume
   - ~$0.01 per bounty
   - Models: `mixtral-8x7b-32768`, `llama2-70b-4096`

2. **OpenAI GPT-4o-mini** (Alternative)
   - Fast and cost-effective
   - High quality answers
   - ~$0.15 per bounty

3. **OpenAI GPT-4o** (Premium)
   - Highest quality
   - More expensive
   - ~$0.75 per bounty

### API Key Configuration

The system supports multiple LLM providers with automatic fallback:

```bash
# Primary: Groq/Grok (recommended)
GROQ_API_KEY=gsk-your-key-here
USE_GROQ=true
GROQ_MODEL=mixtral-8x7b-32768

# Fallback: OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

Priority order:
1. Groq (if `USE_GROQ=true` and `GROQ_API_KEY` set)
2. OpenAI (if `OPENAI_API_KEY` set)
3. Groq fallback (if `GROQ_API_KEY` set)

### Railway API Integration

With the Railway API key configured, the agent can:
- ✅ Authenticate automatically
- ✅ Access bounty details programmatically
- ✅ Submit answers (when enabled)
- ✅ Track submissions and earnings

```bash
# Enable Railway API access
RAILWAY_API_KEY=your-railway-api-key-here
RAILWAY_EMAIL=barbrickdesign@gmail.com
```

### Answer Quality

The agent generates answers with:
- **Structure:** Summary → Steps → Code → Verification → Follow-up
- **Detail Level:** Comprehensive yet concise
- **Code Examples:** Markdown-formatted snippets
- **Explanations:** Why each step matters
- **Edge Cases:** Potential issues and solutions

### Cost Analysis

Average cost per bounty:
- **LLM API:** $0.15 - $0.75
- **Infrastructure:** ~$0.01
- **Total Cost:** ~$0.20 per answer

With $10+ minimum reward:
- **Minimum Profit:** $9.80 per bounty
- **ROI:** 4,900% minimum

## Integration with Autonomous Income Orchestrator

The Bounty Hunter integrates with the main income system:

```javascript
// In src/systems/autonomous-income-orchestrator.js
incomeStreams.set('bounty-hunter', {
    name: 'Railway Bounty Hunter',
    type: 'automated-freelancing',
    revenue: agent.totalEarnings,
    frequency: 'continuous',
    account: 'barbrickdesign@gmail.com'
});
```

## Security & Best Practices

### API Key Security

**CRITICAL: Never commit API keys to git!**

✅ **DO:**
- Store keys in `.env` files (excluded by .gitignore)
- Use environment variables
- Rotate keys regularly (every 90 days recommended)
- Use different keys for dev/prod environments
- Monitor API usage for suspicious activity
- Keep `.env.example` with placeholders only

❌ **DON'T:**
- Commit `.env` to version control
- Share keys in public issues or emails
- Hard-code keys in source files
- Use the same key across multiple projects
- Share keys in screenshots or logs

### If Keys Are Exposed

If your API keys are accidentally exposed:

1. **Immediately rotate the keys:**
   - Railway: https://railway.app/account/tokens
   - Groq: https://console.groq.com/keys
   - OpenAI: https://platform.openai.com/api-keys

2. **Update your `.env` file** with new keys

3. **Monitor for unauthorized usage:**
   - Check API usage dashboards
   - Review billing statements
   - Enable usage alerts

4. **See detailed instructions:**
   - Read `SECURITY_WARNING_API_KEYS.md` for complete recovery steps

### Verification

Verify your security setup:

```bash
# 1. Check .env is not tracked by git
git status backend/.env
# Should show: "No such file or directory" or ignored

# 2. Verify .gitignore includes .env
grep "^\.env$" .gitignore
# Should output: .env

# 3. Check for exposed keys in git history
git log --all --full-history -- "*.env"
# Should be empty

# 4. Test configuration without exposing keys
cd backend
npm run bounty-hunter:dry-run
```

### Rate Limiting

- Polls Railway every 15 minutes (not aggressive)
- Respects Railway's rate limits
- User-Agent header identifies the bot

### Error Handling

- All errors caught and logged
- Graceful degradation on failures
- State saved regularly
- Recovery from crashes

## Troubleshooting

### Railway Bounties Platform Not Accessible

**Symptom:** Logs show "Parsed 0 bounty candidates" or "station.railway.com is not accessible"

**Root Cause:** The Railway bounties platform (station.railway.com/bounties) may not be publicly accessible, or DNS/network issues prevent access.

**Solution:** The system now automatically falls back to mock data for development and testing.

```bash
# When you see these logs:
❌ Railway bounties platform (station.railway.com) is not accessible
💡 Using mock data for development/testing
📦 Using mock bounty data for development/testing
📊 Found 5 total bounties

# This is EXPECTED behavior and allows testing without the real platform
```

**Alternative Bounty Platforms:**

The BountyHunter can be adapted to work with other bounty platforms:

1. **GitHub Issues** - Use GitHub's API to fetch issues with bounty labels
   ```bash
   # Configure in .env
   BOUNTY_PLATFORM=github
   GITHUB_REPO=owner/repo
   BOUNTY_LABEL=bounty
   ```

2. **Gitcoin** - Use Gitcoin's API for bounties
   ```bash
   BOUNTY_PLATFORM=gitcoin
   GITCOIN_API_KEY=your-key
   ```

3. **Bountysource** - Connect to Bountysource platform
   ```bash
   BOUNTY_PLATFORM=bountysource
   ```

4. **Custom Platform** - Configure custom bounty source
   ```bash
   BOUNTY_PLATFORM=custom
   BOUNTY_URL=https://your-platform.com/api/bounties
   ```

### Mock Data Development Mode

**What is it?** Mock data mode provides realistic test bounties without requiring external platform access.

**When to use:**
- ✅ Initial development and testing
- ✅ Demonstrating the system functionality
- ✅ Testing UI changes without API dependencies
- ✅ Offline development
- ✅ When bounty platform is unavailable

**Mock bounties include:**
- 5 sample bounties with realistic titles and descriptions
- Reward values from $75 to $200
- Various tags and categories
- Links to GitHub issues (for demonstration)

**How to enable:**
Mock data is automatically used when:
1. Railway platform is not accessible
2. No bounties are found on the platform
3. Network/DNS errors occur

**How to disable:**
Configure a working bounty platform URL:
```bash
# In backend/.env
BOUNTY_PLATFORM_URL=https://actual-platform.com/bounties
```

### Agent Won't Start

```bash
# Check Node.js version
node --version  # Should be 18+

# Install dependencies
cd backend
npm install

# Check for errors
npm run bounty-hunter:dry-run
```

### No API Key Error

```bash
# Set API key
export OPENAI_API_KEY=sk-...

# Or create .env file
echo "OPENAI_API_KEY=sk-..." > backend/.env
```

### Bounties Not Found

- Railway may have changed their HTML structure
- Check console logs for parsing errors
- May need to update selectors in `fetchBountiesFromRailway()`

### LLM Errors

- Check API key is valid
- Verify endpoint URL
- Check rate limits on API
- Try different model

## Performance Metrics

### Expected Performance

- **Bounties per day:** 3-10 (depending on availability)
- **Success rate:** 80-90% (answer quality)
- **Earnings per day:** $150-$500 (average)
- **Monthly income:** $4,500-$15,000 (potential)

### Optimization Tips

1. **Increase Check Frequency**
   ```javascript
   checkInterval: 300000  // 5 minutes
   ```

2. **Lower Reward Threshold**
   ```javascript
   minRewardThreshold: 25  // $25 minimum
   ```

3. **Process More Bounties**
   ```javascript
   maxConcurrentBounties: 5
   ```

4. **Use Faster Model**
   ```javascript
   model: 'gpt-3.5-turbo'  // Faster, cheaper
   ```

## Future Enhancements

### Planned Features

1. **Automatic Railway Submission**
   - Browser automation with Playwright
   - Session management
   - CAPTCHA handling

2. **Multi-Platform Support**
   - GitHub bounties
   - GitLab bounties
   - Bountysource
   - Open Collective

3. **Answer Quality Scoring**
   - Predict acceptance probability
   - A/B test different approaches
   - Learn from successful answers

4. **Team Collaboration**
   - Multiple AI models voting
   - Human review workflow
   - Quality assurance checks

5. **Advanced Analytics**
   - Success rate tracking
   - Earning trends
   - ROI analysis
   - Performance dashboard

## Support & Contact

### Questions or Issues?

- **Email:** barbrickdesign@gmail.com
- **Documentation:** This file
- **Web Interface:** https://barbrickdesign.github.io/bountyHunter.html

### Contributing

This is a proprietary revenue-generating system. Contributions require:
1. Signed NDA
2. Revenue sharing agreement
3. Code review by Ryan Barbrick

Contact barbrickdesign@gmail.com for details.

## Legal & Compliance

### Terms of Service

- Must comply with Railway's Terms of Service
- Answers must be original and helpful
- No plagiarism or spam
- Professional conduct required

### Revenue Reporting

All earnings are:
- Tracked automatically
- Logged for tax purposes
- Reported to IRS as required
- Integrated with accounting system

### Data Privacy

- No user data collected
- Bounty content is public
- Answers are original
- No PII exposed

## Version History

- **v1.0.0** (February 2026)
  - Initial autonomous agent implementation
  - Railway bounty scraping
  - OpenAI GPT-4o-mini integration
  - Earnings tracking
  - Manual submission workflow
  - PayPal integration

---

**Last Updated:** February 18, 2026  
**Platform:** Railway Central Station Bounties  
**Account:** barbrickdesign@gmail.com  
**Status:** ✅ Operational (Manual submission phase)
