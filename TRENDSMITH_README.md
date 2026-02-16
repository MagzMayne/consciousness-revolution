# TrendSmith v2.0 - Autonomous Product Research & Go-to-Market System

## 🎯 Overview

TrendSmith is an AI-powered autonomous system that monitors social media platforms, identifies product opportunities, creates solutions, and markets them back to the source communities—all without human interaction.

## ✨ Key Features

### 1. Real API Integrations
- **Reddit API**: Real-time monitoring of subreddits for opportunities (no auth required for reading)
- **Discord Webhooks**: Automated posting to Discord channels
- **OpenAI API**: AI-powered conversation analysis and insight extraction
- **Twitter/X & Facebook**: Ready for integration (requires API credentials)

### 2. Autonomous Agent System
Five specialized agents work together to automate the entire product discovery-to-market cycle:

- **Research Agent**: Scans social platforms every 5 minutes for opportunities
- **Analysis Agent**: Uses AI to analyze conversations and extract insights
- **Builder Agent**: Autonomously generates tools based on identified needs
- **Marketing Agent**: Creates and posts outreach content every 10 minutes
- **Orchestrator Agent**: Coordinates all agent activities and workflows

### 3. Self-Healing & Integration
- Integrates with BarbrickDesign agent infrastructure
- Auto-start capabilities with state persistence
- Graceful fallbacks when APIs are unavailable
- Comprehensive activity logging and monitoring

## 🚀 Quick Start

### Basic Setup (Demo Mode)

1. Open `trendSmith.html` in your browser
2. Click **"Seed Demo Data"** to load sample conversations
3. Explore the interface and test features manually

### Autonomous Mode

1. Click **"Autonomous: Off"** to enable full autonomous operation
2. Agents will automatically:
   - Scan Reddit for opportunities every 5 minutes
   - Analyze conversations with AI
   - Build tools for high-scoring opportunities
   - Generate and post marketing content

### Manual Mode

1. Click **"Start Listening"** and select a platform
2. For Reddit: Enter a subreddit name (e.g., "webdev", "SideProject")
3. Review discovered conversations in the left panel
4. Click a conversation to analyze and create tools
5. Use the marketing panel to generate outreach posts

## 🔧 Configuration

### For AI-Powered Analysis (Recommended)

TrendSmith uses the AI API Connection Manager for secure API key management.

**Option 1: Browser Console**
```javascript
// Set OpenAI API key
apiConnectionManager.setApiKey('openai', 'sk-your-key-here');

// Verify connection
apiConnectionManager.showDashboard();
```

**Option 2: Environment File**
```bash
# Create .env file (copy from .env.example)
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4o-mini
```

### For Discord Posting

**Option 1: Via UI**
1. Click "Start Listening" → Select Discord
2. Enter your Discord webhook URL when prompted

**Option 2: Via Console**
```javascript
platformConnector.setWebhook('discord', 'https://discord.com/api/webhooks/...');
```

**Create Discord Webhook:**
1. Open Discord → Server Settings → Integrations
2. Create a Webhook → Copy the URL
3. Configure in TrendSmith as shown above

### For Reddit OAuth (Write Access)

Currently, Reddit reading is supported without authentication. For posting:

1. Register app at: https://www.reddit.com/prefs/apps
2. Implement OAuth 2.0 flow
3. See Reddit API documentation: https://www.reddit.com/dev/api

### For Twitter/X Integration

1. Get API credentials: https://developer.twitter.com
2. Add to `.env`:
```bash
TWITTER_API_KEY=your_key_here
TWITTER_API_SECRET=your_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
```
3. Implement Twitter API v2 integration (coming soon)

## 📊 How It Works

### Research Phase
1. **Research Agent** scans configured platforms (Reddit, Discord, etc.)
2. Discovers conversations containing keywords like "how long", "is there a tool", "track", etc.
3. Stores conversations with metadata (engagement, community, timestamp)

### Analysis Phase
1. **Orchestrator** identifies unanalyzed conversations
2. **Analysis Agent** processes conversation using:
   - OpenAI API (if configured) for deep semantic analysis
   - Heuristic analysis (fallback) based on keywords and patterns
3. Extracts:
   - Core problem statement
   - Target user persona
   - Recommended tool type (calculator/tracker/estimator/checklist)
   - Key features (3-5 items)
4. Assigns opportunity score based on:
   - Keyword relevance
   - Engagement metrics
   - Recency
   - Specificity

### Building Phase
1. **Orchestrator** identifies high-scoring opportunities (score ≥ 5)
2. **Builder Agent** creates a functional HTML tool:
   - Calculator: Input-based estimation tools
   - Tracker: Session logging and time tracking
   - Estimator: Range-based predictions
   - Checklist: Step-by-step workflows
3. Generates complete HTML with styling and functionality
4. Stores tool with origin metadata for attribution

### Marketing Phase
1. **Marketing Agent** identifies unmarked tools
2. Generates context-aware outreach post:
   - References original conversation
   - Includes tool description
   - Adds UTM tracking parameters
   - Provides attribution to community
3. Posts to origin platform:
   - Reddit: Prepares draft (requires OAuth for posting)
   - Discord: Posts via webhook (if configured)
   - Other platforms: Prepares draft for manual posting
4. Simulates engagement metrics (clicks, signups)

## 🎛️ User Interface

### Left Panel: Ingestion & Agents
- **Platform Connectors**: Connect to Reddit, Discord, Twitter, Facebook
- **Agent Controls**: Start/stop autonomous mode, manual scan
- **Agent Status**: Real-time status of all agents
- **Conversation List**: Discovered opportunities with scores

### Middle Panel: Idea Engine & Builder
- **Selected Conversation**: View conversation details and score
- **Product Brief**: AI-generated or editable brief
  - Problem statement
  - User persona
  - Tool archetype
  - MVP features
- **Tool Actions**: Scaffold, preview, export
- **Generated Tools**: List of created tools

### Right Panel: Marketing Loop & Dashboard
- **Selected Tool**: Tool ready for marketing
- **Outreach Post**: Auto-generated marketing content
- **Post Actions**: Post to source platform
- **Performance Metrics**: Clicks, signups, feedback
- **Activity Log**: Real-time system activities

## 🔄 Autonomous Operation

When autonomous mode is enabled:

1. **Every 1 minute**: Orchestrator checks workflows
2. **Every 5 minutes**: Research Agent scans platforms
3. **Every 10 minutes**: Marketing Agent posts content
4. **On-demand**: Analysis and Builder agents triggered by Orchestrator

**No human interaction required** - the system:
- Discovers opportunities
- Analyzes and scores them
- Builds solutions
- Markets them back to communities
- Tracks performance

## 📈 Performance Metrics

TrendSmith tracks:
- **Clicks**: Estimated visits to generated tools
- **Signups**: Estimated user registrations
- **Feedback**: Community responses
- **Tools Created**: Number of solutions built
- **Opportunities Discovered**: Conversations found
- **Agent Activity**: Operations performed

## 🔒 Ethics & Best Practices

### Community Guidelines
- ✅ Respect community rules and platform ToS
- ✅ Be transparent about automation
- ✅ Provide genuine value, don't spam
- ✅ Use rate limiting appropriately
- ✅ Obtain permissions before posting

### Privacy & Security
- ✅ API keys stored in session storage only (cleared on browser close)
- ✅ No permanent storage of sensitive credentials
- ✅ Respect user privacy and data protection laws
- ✅ Public data only (no scraping of private content)

### Attribution
- ✅ Always credit source communities
- ✅ Link back to original conversations
- ✅ Transparent about bot-generated content

## 🛠️ Technical Architecture

### Frontend
- Single-file HTML application
- Vanilla JavaScript (no frameworks)
- LocalStorage for state persistence
- SessionStorage for API keys (security)

### API Integration
- AI API Connection Manager (shared infrastructure)
- Automatic retry with exponential backoff
- Graceful fallback when APIs unavailable
- Connection health monitoring

### Agent System
- Event-driven architecture
- Interval-based scheduling
- State machine for agent coordination
- Comprehensive logging

## 🔗 Integration with BarbrickDesign Ecosystem

TrendSmith integrates with:
- **AI API Connection Manager**: `src/ai/api-connection-manager.js`
- **Agent Deployment System**: `auto-deploy-all-agents.js`
- **Discord Integration**: `discord-integration.js`
- **Auto-iteration System**: `auto-iterate-system.js`
- **Self-healing Infrastructure**: Various monitoring agents

## 🐛 Troubleshooting

### Autonomous mode not starting
- Check browser console for errors
- Verify API keys are configured (if using AI)
- Ensure browser allows background timers

### No conversations appearing
- Click "Start Listening" and connect to Reddit
- Check that subreddit exists and is public
- Review activity log for connection errors

### AI analysis not working
- Verify OpenAI API key: `apiConnectionManager.showDashboard()`
- Check API key has credits available
- System will fall back to heuristic analysis

### Tools not being created
- Ensure conversations have opportunity score ≥ 5
- Check that analysis has completed (conversation.analyzed = true)
- Review activity log for builder errors

### Marketing posts failing
- Discord: Verify webhook URL is configured
- Reddit: OAuth required for posting (drafts only without)
- Check platform rate limits

## 📚 Additional Resources

- **API Configuration**: `API_KEY_CONFIGURATION_GUIDE.md`
- **Agent System**: `AGENT_SYSTEM_GUIDE.md`
- **Deployment**: `DEPLOYMENT_INSTRUCTIONS.md`
- **Environment Setup**: `.env.example`

## 🎓 Example Workflow

1. **Enable Autonomous Mode**
   ```
   Click "Autonomous: Off" → "Autonomous: On"
   ```

2. **Watch Research Agent Work**
   ```
   [Activity Log] Research Agent: Scanning platforms
   [Activity Log] Research Agent: Added 15 new conversations from r/webdev
   ```

3. **Analysis Happens Automatically**
   ```
   [Activity Log] Analysis Agent: Processing "How to estimate dev time?"
   [Activity Log] Analysis complete: Score 7.2
   ```

4. **Tool Gets Built**
   ```
   [Activity Log] Builder Agent: Creating tool for "How to estimate dev time?"
   [Activity Log] Builder Agent: Created "Dev Time Estimator"
   ```

5. **Marketing Launches**
   ```
   [Activity Log] Marketing Agent: Promoting "Dev Time Estimator"
   [Activity Log] Marketing Agent: Draft prepared - Est. 23 clicks, 4 signups
   ```

## 🚧 Future Enhancements

- [ ] Twitter/X full integration
- [ ] Facebook Groups API integration
- [ ] Backend API for persistence and scaling
- [ ] Enhanced tool templates with authentication
- [ ] One-click deployment to hosting platforms
- [ ] Advanced NLP with embeddings and clustering
- [ ] A/B testing for marketing messages
- [ ] Analytics dashboard with historical data
- [ ] Multi-language support
- [ ] Mobile app integration

## 📄 License

Part of the BarbrickDesign ecosystem. See main repository for license details.

## 🤝 Contributing

TrendSmith is part of a larger autonomous system. Contributions should:
- Maintain autonomous operation capability
- Respect API rate limits and platform policies
- Follow ethical guidelines for automation
- Integrate with existing agent infrastructure

## 📞 Support

- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Community**: Discord server (see main README)

---

**TrendSmith v2.0** - Building the future of autonomous product discovery and marketing
