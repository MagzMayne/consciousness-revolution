# Discord Integration Quick Start

This guide helps you quickly set up and use the Discord bot integration for the BarbrickDesign repository.

## 🚀 Quick Setup (5 minutes)

### 1. Run Setup Script

```bash
npm run discord:setup
```

This interactive script will guide you through:
- Creating a Discord application
- Getting bot tokens
- Configuring environment variables
- Starting the bot

### 2. Manual Setup

If you prefer manual setup:

**Step 1: Create Discord Bot**
1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name: "BarbrickDesign Bot"
3. Go to "Bot" section → Click "Add Bot"
4. Enable these intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy the bot token

**Step 2: Get Client ID**
1. Go to "OAuth2" → "General"
2. Copy the Client ID

**Step 3: Invite Bot**
1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: `Administrator`
4. Open the generated URL and invite to your server

**Step 4: Configure Environment**
```bash
# Edit .env file
DISCORD_BOT_TOKEN=your-bot-token-here
DISCORD_CLIENT_ID=your-client-id-here
DISCORD_GUILD_ID=your-guild-id-here  # Optional
```

**Step 5: Start Bot**
```bash
npm run discord:bot
```

## 📱 Using the Bot

### Basic Commands

```
/help              - Show all commands
/status            - System status
/project           - Project information
```

### Service Commands

```
/banksky info      - BankSky platform info
/github status     - GitHub repository status
/sql analyze       - Run SQL analysis
/safety all        - Check all safety systems
```

### Admin Commands (Requires Administrator)

```
/deploy banksky    - Deploy BankSky
/apikey check      - Check API keys
/webhook list      - List webhooks
```

### Notifications

```
/notification enable type:all   - Enable all notifications
/notification disable type:github - Disable GitHub notifications
```

## 🔧 Integration with Existing Scripts

All deployment scripts automatically send Discord notifications when the bot is running.

### Example: Deploy with Notifications

```bash
# Start Discord bot in one terminal
npm run discord:bot

# Deploy in another terminal
npm run deploy

# You'll see notifications in Discord!
```

### Manual Integration

Add Discord notifications to your own scripts:

```javascript
const { notifyDeployment } = require('./discord-integration');

// Notify deployment start
await notifyDeployment('my-service', 'pending', 'Starting deployment');

// Your deployment code...

// Notify deployment complete
await notifyDeployment('my-service', 'success', 'Deployment completed');
```

## 🎯 Features

### ✅ Full Discord Permissions Support
- Admin, Moderator, User roles
- Granular command permissions
- Channel-specific notifications

### ✅ Slash Commands
- 11+ modern Discord commands
- Autocomplete and validation
- Context-aware responses

### ✅ Webhooks
- GitHub events (push, PR, issues)
- Deployment notifications
- System alerts

### ✅ Real-time Notifications
Configure channels:
- `#github-events` - GitHub activity
- `#deployments` - Service deployments
- `#system-alerts` - Error alerts
- `#notifications` - General updates

## 🧪 Testing

Test the Discord integration:

```bash
npm run discord:test
```

This will:
1. Check if bot is available
2. Send test notifications
3. Verify webhook endpoints

## 📚 Documentation

- **Complete Guide**: [DISCORD_BOT_GUIDE.md](DISCORD_BOT_GUIDE.md)
- **Discord Server**: https://discord.gg/M4QZyPQq

## 🔍 Troubleshooting

### Bot not responding?
```bash
# Check if bot is running
ps aux | grep discord-bot

# Restart bot
npm run discord:bot
```

### Commands not showing?
- Wait up to 1 hour for global commands
- Or use DISCORD_GUILD_ID for instant guild commands

### Webhooks not working?
```bash
# Test webhook endpoint
curl http://localhost:3010/health

# Should return: {"status":"ok","bot":"BarbrickDesign Bot#1234"}
```

## 🎮 Discord Server

Join our Discord server for support and updates:
**https://discord.gg/M4QZyPQq**

## 📖 NPM Scripts

```bash
npm run discord:setup     # Interactive setup
npm run discord:bot       # Start bot
npm run discord:dev       # Start with auto-reload
npm run discord:test      # Test integration
```

## 🔐 Security

- Never commit `.env` file
- Keep bot token secret
- Use role-based permissions
- Enable 2FA on Discord account

## 💡 Tips

1. **Use Guild ID** for faster command updates during development
2. **Create dedicated channels** for different notification types
3. **Configure role permissions** to control who can use admin commands
4. **Test webhooks** before deploying to production
5. **Monitor bot logs** for errors and issues

---

**Status**: 🟢 Ready to use | Version 1.0.0

**Need help?** Check [DISCORD_BOT_GUIDE.md](DISCORD_BOT_GUIDE.md) or join our Discord server.
