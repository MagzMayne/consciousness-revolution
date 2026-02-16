# Discord Bot Integration Guide

## Overview

The BarbrickDesign Discord Bot provides comprehensive integration with all repository services, scripts, and features. It supports full Discord permissions, slash commands, webhooks, and real-time notifications.

## Features

### ✅ Comprehensive Permission System
- **Administrator**: Full access to deployment, API management, and webhooks
- **Moderator**: Access to monitoring, GitHub operations, and SQL analysis
- **User**: Access to information commands and project queries

### ✅ Slash Commands (40+ Commands)
All commands use Discord's modern slash command system with autocomplete and validation:

#### General Commands
- `/help` - Display all available commands
- `/status` - Get system status
- `/project [name]` - Get project information

#### Service Commands
- `/banksky info|stats` - BankSky platform operations
- `/github status|stats` - GitHub repository operations
- `/sql analyze|scan` - SQL schema analysis
- `/safety [system]` - Safety system status (Anti-Nuke, Vehicle Safety)

#### Admin Commands (Requires Administrator Permission)
- `/deploy <service>` - Deploy services to production
- `/apikey check|test` - API key management and testing
- `/webhook list|create` - Webhook management

#### Notification Settings
- `/notification enable|disable` - Manage notification preferences

### ✅ Full Discord Permissions Support

The bot utilizes all Discord permission capabilities:

**Required Bot Permissions:**
- Administrator (for full functionality)
- Manage Messages (for moderation features)
- Manage Roles (for permission system)
- View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use Slash Commands

**Required Gateway Intents:**
- Guilds
- Guild Messages
- Guild Members
- Message Content
- Guild Presences
- Direct Messages
- Guild Voice States
- Guild Moderation

### ✅ Webhook Integration

**GitHub Webhooks:**
- Push events
- Pull request events
- Issue events
- Release events

**Deployment Webhooks:**
- Service deployment notifications
- Success/failure alerts
- Deployment logs

**System Webhooks:**
- Health monitoring
- Error alerts
- Performance metrics

### ✅ Real-Time Notifications

Configure notifications per channel:
- **#github-events** - GitHub repository events
- **#deployments** - Service deployment updates
- **#system-alerts** - System health and errors
- **#notifications** - General notifications

## Setup Instructions

### 1. Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "BarbrickDesign Bot"
4. Go to "Bot" section
5. Click "Add Bot"
6. Enable all Privileged Gateway Intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
7. Copy the bot token

### 2. Configure Bot Permissions

1. Go to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ bot
   - ✅ applications.commands
3. Select bot permissions:
   - ✅ Administrator (or configure specific permissions)
4. Copy the generated URL
5. Open URL in browser and invite bot to your server

### 3. Configure Environment Variables

Create or update `.env` file:

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_CLIENT_ID=your-discord-client-id-here
DISCORD_GUILD_ID=your-discord-guild-id-here  # Optional: for faster command updates
DISCORD_WEBHOOK_PORT=3010
```

### 4. Install Dependencies

```bash
npm install
```

This will install discord.js and all required dependencies.

### 5. Start the Bot

```bash
# Production mode
npm run discord:bot

# Development mode (with auto-reload)
npm run discord:dev
```

### 6. Verify Bot is Online

The bot should:
1. Log in to Discord
2. Show as "Online" in your server
3. Display activity: "Watching BarbrickDesign Services"
4. Register all slash commands (may take up to 1 hour for global commands)

## Command Usage

### Basic Commands

```
/help
Shows all available commands with descriptions

/status
Displays system status and metrics

/project
Lists all project categories
Or: /project name:BankSky to get specific project info
```

### Service Management

```
/banksky info
Get BankSky platform information

/banksky stats
Get BankSky statistics

/github status
Get repository status

/github stats
Get repository statistics
```

### SQL Analysis

```
/sql analyze
Start SQL schema analysis

/sql scan
Scan codebase for SQL files
```

### Safety Systems

```
/safety system:all
Check all safety systems

/safety system:anti-nuke
Check Anti-Nuclear Safety System

/safety system:vehicle
Check AI Vehicle Safety Monitor
```

### Admin Commands

```
/deploy service:banksky
Deploy BankSky service (Admin only)

/deploy service:all
Deploy all services (Admin only)

/apikey check
Check API key status (Admin only)

/apikey test
Test API connections (Admin only)

/webhook list
List all active webhooks (Admin only)

/webhook create name:github-push
Create new webhook (Admin only)
```

### Notifications

```
/notification enable type:all
Enable all notifications

/notification enable type:github
Enable GitHub notifications only

/notification disable type:deploy
Disable deployment notifications
```

## Channel Setup

Create these channels in your Discord server for optimal experience:

1. **#general** - General bot commands and information
2. **#github-events** - Automatic GitHub event notifications
3. **#deployments** - Service deployment notifications
4. **#system-alerts** - System health and error alerts
5. **#notifications** - General notifications

The bot will automatically find and use these channels.

## Webhook Endpoints

The bot runs a webhook server on port 3010 (configurable):

### GitHub Webhook
```
POST http://your-server:3010/webhook/github
Content-Type: application/json
X-GitHub-Event: push|pull_request|issues|release
```

### Deployment Webhook
```
POST http://your-server:3010/webhook/deployment
Content-Type: application/json

{
  "service": "banksky",
  "status": "success|failed|pending",
  "message": "Deployment details"
}
```

### Health Check
```
GET http://your-server:3010/health

Response: {"status": "ok", "bot": "BarbrickDesign Bot#1234"}
```

## Integration with Existing Scripts

The Discord bot integrates with all existing repository scripts:

### BankSky Integration
```javascript
// Notify Discord when deployment completes
await axios.post('http://localhost:3010/webhook/deployment', {
  service: 'banksky',
  status: 'success',
  message: 'BankSky deployed successfully'
});
```

### GitHub Integration
Configure GitHub webhook in repository settings:
```
Payload URL: http://your-server:3010/webhook/github
Content type: application/json
Events: Push, Pull requests, Issues, Releases
```

### SQL Analyzer Integration
```bash
# Run SQL analysis and notify Discord
npm run analyze:sql && curl -X POST http://localhost:3010/webhook/deployment \
  -H "Content-Type: application/json" \
  -d '{"service":"sql-analyzer","status":"success","message":"Analysis complete"}'
```

## Permission System

### Role-Based Access Control

The bot implements a three-tier permission system:

**1. Admin (Administrator Permission)**
- All commands available
- Can deploy services
- Can manage API keys
- Can manage webhooks
- Can configure notifications

**2. Moderator (Manage Messages Permission)**
- Information commands
- Service monitoring
- GitHub operations
- SQL analysis
- Safety system checks

**3. User (Send Messages Permission)**
- Help command
- Status checks
- Project information
- Read-only operations

### Custom Role Configuration

Modify `discord-bot-config.json` to customize role permissions:

```json
{
  "permissions": {
    "roles": {
      "admin": {
        "commands": ["deploy", "apikey", "webhook"],
        "required_permission": "Administrator"
      },
      "moderator": {
        "commands": ["github", "sql", "safety"],
        "required_permission": "ManageMessages"
      }
    }
  }
}
```

## Advanced Configuration

### Bot Configuration File

Edit `discord-bot-config.json` for advanced settings:

```json
{
  "bot": {
    "name": "BarbrickDesign Bot",
    "version": "1.0.0",
    "prefix": "/"
  },
  "features": {
    "slash_commands": true,
    "webhooks": true,
    "notifications": true
  },
  "rate_limits": {
    "commands_per_minute": 30,
    "commands_per_user_per_minute": 5
  }
}
```

### Notification Customization

Configure which events trigger notifications:

```json
{
  "notifications": {
    "deployment": {
      "enabled": true,
      "channel": "deployments",
      "mention_roles": ["@Admin"]
    },
    "github": {
      "enabled": true,
      "channel": "github-events",
      "events": ["push", "pull_request"]
    }
  }
}
```

## Troubleshooting

### Bot Not Responding to Commands

1. **Check bot is online** - Bot should show as "Online" in server
2. **Verify permissions** - Bot needs "Use Slash Commands" permission
3. **Wait for command registration** - Global commands take up to 1 hour
4. **Use guild-specific commands** - Set DISCORD_GUILD_ID for instant updates

### Commands Not Showing Up

1. **Check bot permissions** - Needs "applications.commands" scope
2. **Reinvite bot** - Use new OAuth2 URL with correct scopes
3. **Restart bot** - Commands register on bot startup

### Webhooks Not Working

1. **Check port** - Webhook server runs on port 3010 by default
2. **Check firewall** - Port must be open for incoming connections
3. **Verify endpoint** - Use /health endpoint to test server

### Permission Errors

1. **Check role hierarchy** - Bot role must be above managed roles
2. **Verify member permissions** - Use /help to see available commands
3. **Check channel permissions** - Bot needs access to notification channels

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit .env file** - Contains sensitive bot token
2. **Use environment variables** - For all sensitive configuration
3. **Limit bot permissions** - Only grant necessary permissions
4. **Secure webhook endpoints** - Use authentication/signatures
5. **Rotate tokens regularly** - Change bot token periodically
6. **Monitor bot activity** - Enable logging for security audits

### Bot Token Security

```bash
# Generate strong .env file permissions
chmod 600 .env

# Ensure .env is in .gitignore
echo ".env" >> .gitignore
```

## Monitoring and Logging

The bot logs all activity to console:

```
✅ Discord Bot logged in as BarbrickDesign Bot#1234
📊 Serving 1 guilds
🔄 Started refreshing application (/) commands
✅ Successfully reloaded 11 guild (/) commands
📥 Received GitHub event: push
📦 Deployment webhook: banksky - success
```

Enable detailed logging in `discord-bot-config.json`:

```json
{
  "logging": {
    "level": "info",
    "log_commands": true,
    "log_errors": true,
    "log_webhooks": true
  }
}
```

## Support and Contributing

- **Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io
- **Discord Server**: https://discord.gg/M4QZyPQq
- **Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues

## Version History

### v1.0.0 (2026-01-11)
- Initial release
- Full Discord permissions support
- 11+ slash commands
- Webhook integration
- Real-time notifications
- GitHub integration
- Multi-service support

---

**Last Updated**: 2026-01-11  
**Bot Version**: 1.0.0  
**Discord.js Version**: ^14.14.1
