# Bounty Hunter Deployment Guide

## Overview

This guide covers deploying the Autonomous Bounty Hunter agent for continuous operation and income generation.

## Deployment Options

### Option 1: Local Deployment (Recommended for Testing)

**Pros:**
- Full control
- Easy debugging
- No hosting costs
- Quick iteration

**Cons:**
- Must keep computer running
- No remote access
- Manual restarts after crashes

**Steps:**

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy example config
   cp .env.bounty-hunter.example .env
   
   # Edit with your API key
   nano .env
   # Add: OPENAI_API_KEY=sk-...
   ```

3. **Test First**
   ```bash
   # Dry-run mode (no submission)
   npm run bounty-hunter:dry-run
   
   # Let it run for 5-10 minutes
   # Check output: backend/data/bounty-answers/
   ```

4. **Start Production**
   ```bash
   # Production mode
   npm run bounty-hunter
   
   # Or with pm2 for auto-restart
   npm install -g pm2
   pm2 start services/bounty-hunter-agent.js --name bounty-hunter
   pm2 save
   ```

5. **Monitor**
   ```bash
   # View logs
   pm2 logs bounty-hunter
   
   # Check status
   pm2 status
   
   # View earnings
   cat data/bounty-hunter-state.json
   ```

---

### Option 2: Cloud Deployment (Recommended for Production)

#### A. Railway.app (Free Tier Available)

**Pros:**
- Free tier: $5 credit/month
- Easy deployment
- Automatic restarts
- Environment variables built-in
- Perfect for API server

**Cons:**
- May need paid plan for 24/7
- Limited free resources

**Steps:**

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Create new project (or link existing)
   railway init
   ```

2. **Configure for Railway**
   
   The repository now includes a `Procfile` that tells Railway how to start the API server:
   ```
   web: cd backend && node services/bounty-hunter-api.js
   ```
   
   Set environment variables in Railway dashboard:
   - `OPENAI_API_KEY` or `GROQ_API_KEY` - Your LLM API key
   - `RAILWAY_API_KEY` - Railway API key for bounty fetching (if needed)
   - `PORT` - Will be auto-set by Railway

3. **Deploy**
   ```bash
   # Deploy to Railway
   railway up
   
   # Check logs
   railway logs
   
   # Get your deployment URL
   railway domain
   ```
   
   Your Railway backend URL will be something like:
   `https://your-project-name.up.railway.app`

4. **Configure Frontend**
   
   Once deployed, configure the frontend (bountyHunter.html) to use your Railway backend:
   
   - Open https://barbrickdesign.github.io/bountyHunter.html
   - Enter your Railway backend URL in the "Backend URL" field
   - Example: `https://your-project-name.up.railway.app`
   - The URL will be saved to localStorage for future visits

5. **Monitor**
   - Dashboard: https://railway.app/dashboard
   - Logs: View in real-time via Railway CLI or web interface
   - Metrics: CPU, memory, network
   - Status: Check via https://your-project.up.railway.app/health

#### B. Heroku (Free Tier Removed, $7/month)

**Pros:**
- Reliable
- Good documentation
- Easy scaling

**Cons:**
- No free tier anymore
- $7/month minimum

**Steps:**

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login
   heroku login
   
   # Create app
   heroku create bounty-hunter-barbrick
   ```

2. **Configure**
   ```bash
   # Create Procfile
   echo "worker: cd backend && node services/bounty-hunter-agent.js" > Procfile
   
   # Set environment variables
   heroku config:set OPENAI_API_KEY=sk-...
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy bounty hunter"
   git push heroku main
   
   # Scale worker
   heroku ps:scale worker=1
   
   # View logs
   heroku logs --tail
   ```

#### C. DigitalOcean Droplet ($4/month)

**Pros:**
- Full control
- Very affordable
- Good performance

**Cons:**
- Manual server management
- Need basic Linux knowledge

**Steps:**

1. **Create Droplet**
   - Go to: https://www.digitalocean.com/
   - Create Ubuntu 22.04 droplet ($4/month)
   - Add SSH key

2. **Setup Server**
   ```bash
   # SSH into server
   ssh root@your-droplet-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   
   # Install pm2
   npm install -g pm2
   
   # Clone repository
   git clone https://github.com/barbrickdesign/barbrickdesign.github.io.git
   cd barbrickdesign.github.io/backend
   
   # Install dependencies
   npm install
   ```

3. **Configure**
   ```bash
   # Create .env
   nano .env
   # Add: OPENAI_API_KEY=sk-...
   
   # Start with pm2
   pm2 start services/bounty-hunter-agent.js --name bounty-hunter
   pm2 startup
   pm2 save
   ```

4. **Monitor**
   ```bash
   # SSH in anytime
   ssh root@your-droplet-ip
   
   # View logs
   pm2 logs bounty-hunter
   
   # Check status
   pm2 status
   ```

#### D. GitHub Actions (Free for Public Repos)

**Pros:**
- Completely free
- Runs on GitHub infrastructure
- Easy to set up

**Cons:**
- Runs on schedule (not continuous)
- Limited to 6 hours per job
- Must be retriggered

**Steps:**

1. **Create Workflow File**
   ```yaml
   # .github/workflows/bounty-hunter.yml
   name: Bounty Hunter
   
   on:
     schedule:
       # Run every 15 minutes
       - cron: '*/15 * * * *'
     workflow_dispatch:
   
   jobs:
     hunt:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             
         - name: Install Dependencies
           run: |
             cd backend
             npm install
             
         - name: Run Bounty Hunter
           env:
             OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
           run: |
             cd backend
             timeout 840 node services/bounty-hunter-agent.js || true
             
         - name: Upload Results
           uses: actions/upload-artifact@v3
           with:
             name: bounty-answers
             path: backend/data/bounty-answers/
   ```

2. **Add Secrets**
   - Go to: Settings → Secrets → Actions
   - Add: `OPENAI_API_KEY`

3. **Enable Workflow**
   - Go to: Actions tab
   - Enable the workflow

---

### Option 3: Serverless (AWS Lambda, Vercel, etc.)

**Note:** Not recommended for this use case because:
- Lambda has 15-minute timeout limit
- Cold starts affect continuous operation
- More complex setup
- Better suited for short tasks

---

## Recommended Production Setup

For serious income generation, use this combo:

1. **Primary:** DigitalOcean Droplet ($4/month)
   - 24/7 operation
   - Full control
   - pm2 auto-restart

2. **Backup:** GitHub Actions (Free)
   - Runs every 15 minutes as backup
   - Catches bounties if primary fails
   - Zero cost

3. **Monitoring:** UptimeRobot (Free)
   - Monitors droplet health
   - Alerts if down
   - Free tier sufficient

**Total Cost:** $4/month for 24/7 operation

---

## Post-Deployment Checklist

### Initial Setup
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Dry-run test completed successfully
- [ ] Answer generation verified
- [ ] Logs directory created
- [ ] State file permissions correct

### Production Deployment
- [ ] Service running continuously
- [ ] Auto-restart configured (pm2/systemd)
- [ ] Logs rotating properly
- [ ] State persistence working
- [ ] Monitoring alerts set up
- [ ] Backup system in place

### Railway Integration
- [ ] Logged in to Railway with barbrickdesign@gmail.com
- [ ] Bounty answer templates tested
- [ ] Manual submission workflow documented
- [ ] Earnings tracking verified
- [ ] PayPal notifications working

### Monitoring
- [ ] Daily log review scheduled
- [ ] Weekly earnings report
- [ ] Monthly performance analysis
- [ ] API usage tracking
- [ ] Cost vs. revenue analysis

---

## Monitoring & Maintenance

### Daily Tasks
```bash
# Check if running
pm2 status

# View recent logs
pm2 logs bounty-hunter --lines 50

# Check earnings
cat backend/data/bounty-hunter-state.json | jq '.totalEarnings'

# Check for new answers
ls -lh backend/data/bounty-answers/ | tail -10
```

### Weekly Tasks
```bash
# Review generated answers
for file in backend/data/bounty-answers/*.md; do
    echo "=== $file ==="
    head -30 "$file"
    echo ""
done

# Analyze completion rate
wc -l backend/data/bounty-logs/completions.jsonl

# Calculate ROI
node -e "
const fs = require('fs');
const state = JSON.parse(fs.readFileSync('backend/data/bounty-hunter-state.json'));
const apiCost = state.completedBounties * 0.15;
const profit = state.totalEarnings - apiCost;
const roi = (profit / apiCost * 100).toFixed(2);
console.log('Total Earnings: $' + state.totalEarnings);
console.log('API Costs: $' + apiCost);
console.log('Net Profit: $' + profit);
console.log('ROI: ' + roi + '%');
"
```

### Monthly Tasks
- Review and optimize prompts
- Analyze success rate
- Adjust reward threshold
- Update dependencies
- Security audit
- Performance tuning

---

## Troubleshooting

### Agent Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Check dependencies
cd backend
npm install

# Check environment
cat .env | grep OPENAI_API_KEY

# Test directly
node services/bounty-hunter-agent.js --dry-run
```

### No Bounties Found
- Railway may have changed HTML structure
- Check logs for parsing errors
- Update selectors if needed
- Verify Railway site is accessible

### LLM Errors
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check rate limits
# OpenAI: 10,000 tokens/min on free tier
# Groq: 14,400 tokens/min on free tier

# Try different model
export OPENAI_MODEL=gpt-3.5-turbo
```

### High Costs
```bash
# Use cheaper model
export OPENAI_MODEL=gpt-3.5-turbo  # $0.0015/1K tokens

# Or use Groq (free tier)
export GROQ_API_KEY=gsk-...

# Increase reward threshold
export MIN_REWARD_THRESHOLD=100  # Only $100+ bounties
```

### System Crashes
```bash
# Use pm2 for auto-restart
pm2 start services/bounty-hunter-agent.js --name bounty-hunter

# Check pm2 logs
pm2 logs bounty-hunter --err

# Set max memory
pm2 start services/bounty-hunter-agent.js --max-memory-restart 500M
```

---

## Security Best Practices

### API Keys
- ✅ Store in environment variables only
- ✅ Never commit to git
- ✅ Rotate every 90 days
- ✅ Use separate keys for dev/prod
- ✅ Monitor usage on provider dashboard

### Server Security
```bash
# Update system
apt update && apt upgrade -y

# Setup firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw enable

# Disable root SSH
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart sshd

# Setup fail2ban
apt install fail2ban -y
systemctl enable fail2ban
```

### Data Security
- ✅ Backup state file daily
- ✅ Encrypt sensitive data
- ✅ Limit file permissions
- ✅ Log access attempts
- ✅ Regular security audits

---

## Performance Optimization

### Speed Up Answer Generation
```javascript
// Use streaming for faster responses
stream: true,
temperature: 0.1,  // Lower = more consistent

// Use faster model
model: 'gpt-3.5-turbo'  // 10x faster than gpt-4
```

### Reduce Costs
```javascript
// Shorter prompts
// More specific instructions
// Use few-shot examples
// Lower temperature
// Smaller max_tokens
```

### Increase Earnings
```javascript
// Lower threshold
minRewardThreshold: 25,

// More concurrent
maxConcurrentBounties: 5,

// Check more often
checkInterval: 300000  // 5 minutes
```

---

## Support

### Need Help?
- 📧 Email: barbrickdesign@gmail.com
- 📖 Docs: BOUNTY_HUNTER_README.md
- 🌐 Web UI: https://barbrickdesign.github.io/bountyHunter.html

### Reporting Issues
Include:
1. Error message (full stack trace)
2. Environment (OS, Node.js version)
3. Config (redact API keys)
4. Steps to reproduce
5. Expected vs actual behavior

---

## Legal & Compliance

- Comply with Railway Terms of Service
- Answers must be original and helpful
- No plagiarism or spam
- Professional conduct required
- Report all earnings for tax purposes

---

**Last Updated:** February 18, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
