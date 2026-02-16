# TrendSmith Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Open TrendSmith
Open `trendSmith.html` in your web browser.

### Step 2: Load Demo Data
Click the **"Seed Demo Data"** button in the top right to load sample conversations.

### Step 3: Choose Your Mode

#### Option A: Autonomous Mode (Recommended)
```
1. Click "Autonomous: Off" → It will turn to "Autonomous: On"
2. Watch the agents work automatically!
3. Check the Activity Log to see what's happening
```

**What Happens:**
- Research Agent scans Reddit every 5 minutes
- Analysis Agent processes conversations with AI
- Builder Agent creates tools automatically
- Marketing Agent prepares outreach posts
- All without any human interaction!

#### Option B: Manual Mode
```
1. Click "Start Listening" → Select "Reddit"
2. Enter a subreddit name (try "webdev" or "SideProject")
3. Click conversations to analyze them
4. Click "Scaffold Tool" to create a tool
5. Use the marketing panel to generate posts
```

## 💡 Quick Tips

### Enable AI Analysis
For best results, configure OpenAI:
```javascript
// Open browser console (F12) and run:
apiConnectionManager.setApiKey('openai', 'sk-your-key-here');
```

### Connect Discord
```javascript
// For automated Discord posting:
platformConnector.setWebhook('discord', 'https://discord.com/api/webhooks/YOUR-WEBHOOK');
```

### Monitor Agents
Watch the agent status bar at the top:
- 🟢 Working
- ⚪ Idle

### View Activity
Check the Activity Log (bottom right panel) to see everything the system is doing in real-time.

## 🎯 What to Expect

### In Manual Mode
- Browse discovered conversations
- Click to see opportunity scores
- Manually create and market tools
- Full control over each step

### In Autonomous Mode
- Agents find opportunities automatically
- High-scoring conversations get analyzed
- Tools are built and marketed automatically
- Just monitor and watch it work!

## 📊 Understanding Scores

Conversations are scored 0-10 based on:
- **Keywords**: "how long", "is there a tool", "track", etc.
- **Engagement**: Comments, upvotes, activity
- **Recency**: How recent the post is
- **Specificity**: Clear, focused problems score higher

Scores ≥ 5 are automatically built into tools in autonomous mode.

## 🔧 Configuration (Optional)

### For AI-Powered Analysis
```bash
# Create .env file or use console
OPENAI_API_KEY=sk-your-key-here
```

### For Discord Integration
```
1. Discord Server → Settings → Integrations → Webhooks
2. Create Webhook → Copy URL
3. Configure in TrendSmith
```

### For Reddit Posting
Reading is free, but posting requires:
- Reddit app registration
- OAuth 2.0 implementation
- See full documentation

## ❓ Troubleshooting

**No conversations appearing?**
- Click "Start Listening" and connect to Reddit
- Try a popular subreddit like "webdev"

**Autonomous mode not working?**
- Check browser console (F12) for errors
- Ensure browser allows background timers

**AI not analyzing?**
- System falls back to heuristic analysis if no API key
- For AI analysis, configure OpenAI key

## 📖 Learn More

- Full documentation: `TRENDSMITH_README.md`
- API setup: `API_KEY_CONFIGURATION_GUIDE.md`
- Agent system: `AGENT_SYSTEM_GUIDE.md`

## 🎉 You're Ready!

TrendSmith is now set up and ready to discover product opportunities autonomously!

**Next Steps:**
1. Enable autonomous mode
2. Let it run in the background
3. Check back to see discovered opportunities
4. Review created tools
5. Deploy tools to help communities

---

**Happy autonomous product building!** 🚀
