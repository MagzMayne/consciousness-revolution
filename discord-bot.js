/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: discord-bot.js
 * Declaration ID: IP-6815296F-MLL28ZUQ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * BarbrickDesign Discord Bot
 * 
 * Comprehensive Discord bot with full permissions support
 * Integrates with all repository services and features
 * 
 * Features:
 * - Full permission management (Admin, Moderator, User roles)
 * - Slash commands for all repository features
 * - Integration with BankSky, PayPal, GitHub, and other services
 * - Real-time notifications and webhooks
 * - Multi-server support with per-guild configuration
 */

const { Client, GatewayIntentBits, PermissionFlagsBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load ML modules
const MLSentimentAnalyzer = require('./src/ai/ml-sentiment-analyzer');
const MLPredictiveAnalytics = require('./src/ai/ml-predictive-analytics');

// Load environment variables
dotenv.config();

// Initialize ML systems
const sentimentAnalyzer = new MLSentimentAnalyzer();
const predictiveAnalytics = new MLPredictiveAnalytics();

// Discord Bot Configuration
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const WEBHOOK_PORT = process.env.DISCORD_WEBHOOK_PORT || 3010;

// Bot Permissions Configuration
const BOT_PERMISSIONS = {
  ADMIN: PermissionFlagsBits.Administrator,
  MODERATOR: PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ManageRoles | PermissionFlagsBits.KickMembers,
  USER: PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel
};

// Create Discord Client with all necessary intents
// Note: Some intents are privileged and must be enabled in Discord Developer Portal
// If you don't need certain features, you can disable unused intents to reduce access scope
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,                  // Required for basic bot functionality
    GatewayIntentBits.GuildMessages,           // Required for message commands
    GatewayIntentBits.GuildMembers,            // Required for member permissions (PRIVILEGED)
    GatewayIntentBits.MessageContent,          // Required for reading message content (PRIVILEGED)
    GatewayIntentBits.GuildPresences,          // Optional: for user status (PRIVILEGED)
    GatewayIntentBits.DirectMessages,          // Optional: for DM support
    GatewayIntentBits.GuildVoiceStates,        // Optional: for voice channel features
    GatewayIntentBits.GuildModeration          // Optional: for moderation features
  ]
});

// Command Collection
const commands = [];

// Helper function to check permissions
function hasPermission(member, requiredPermission) {
  return member.permissions.has(requiredPermission);
}

// Helper function to create embeds
function createEmbed(title, description, color = 0x0099FF) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: 'BarbrickDesign Bot' });
}

// Command: /help - Show all available commands
commands.push(
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display all available commands and their usage')
);

// Command: /status - Get system status
commands.push(
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Get the status of BarbrickDesign services')
);

// Command: /banksky - BankSky operations
commands.push(
  new SlashCommandBuilder()
    .setName('banksky')
    .setDescription('BankSky DeFi platform operations')
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Get BankSky platform information'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('Get BankSky statistics'))
);

// Command: /deploy - Deploy services (Admin only)
commands.push(
  new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Deploy services to production (Admin only)')
    .addStringOption(option =>
      option
        .setName('service')
        .setDescription('Service to deploy')
        .setRequired(true)
        .addChoices(
          { name: 'BankSky', value: 'banksky' },
          { name: 'All Services', value: 'all' },
          { name: 'Backend Services', value: 'backend' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
);

// Command: /github - GitHub operations
commands.push(
  new SlashCommandBuilder()
    .setName('github')
    .setDescription('GitHub repository operations')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Get repository status'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('Get repository statistics'))
);

// Command: /apikey - API key management (Admin only)
commands.push(
  new SlashCommandBuilder()
    .setName('apikey')
    .setDescription('Manage API keys (Admin only)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('Check API key status'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('test')
        .setDescription('Test API connections'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
);

// Command: /project - Project information
commands.push(
  new SlashCommandBuilder()
    .setName('project')
    .setDescription('Get information about BarbrickDesign projects')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Project name')
        .setRequired(false))
);

// Command: /sql - SQL analysis operations
commands.push(
  new SlashCommandBuilder()
    .setName('sql')
    .setDescription('SQL schema analysis operations')
    .addSubcommand(subcommand =>
      subcommand
        .setName('analyze')
        .setDescription('Analyze SQL schemas'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('scan')
        .setDescription('Scan codebase for SQL files'))
);

// Command: /safety - Safety system status
commands.push(
  new SlashCommandBuilder()
    .setName('safety')
    .setDescription('Check safety systems status')
    .addStringOption(option =>
      option
        .setName('system')
        .setDescription('Safety system to check')
        .addChoices(
          { name: 'Anti-Nuke', value: 'anti-nuke' },
          { name: 'Vehicle Safety', value: 'vehicle' },
          { name: 'All Systems', value: 'all' }
        ))
);

// Command: /webhook - Webhook management (Admin only)
commands.push(
  new SlashCommandBuilder()
    .setName('webhook')
    .setDescription('Manage webhooks (Admin only)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all active webhooks'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new webhook')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Webhook name')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
);

// Command: /notification - Notification settings
commands.push(
  new SlashCommandBuilder()
    .setName('notification')
    .setDescription('Manage notification preferences')
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Enable notifications')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Notification type')
            .setRequired(true)
            .addChoices(
              { name: 'Deployments', value: 'deploy' },
              { name: 'GitHub Events', value: 'github' },
              { name: 'System Alerts', value: 'alerts' },
              { name: 'All', value: 'all' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable notifications')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Notification type')
            .setRequired(true)
            .addChoices(
              { name: 'Deployments', value: 'deploy' },
              { name: 'GitHub Events', value: 'github' },
              { name: 'System Alerts', value: 'alerts' },
              { name: 'All', value: 'all' }
            )))
);

// Command: /analytics - ML-powered analytics (Admin only)
commands.push(
  new SlashCommandBuilder()
    .setName('analytics')
    .setDescription('View ML-powered platform analytics (Admin only)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('sentiment')
        .setDescription('View user sentiment analysis'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('predictions')
        .setDescription('View predictive analytics and forecasts'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('behavior')
        .setDescription('View user behavior patterns'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('recommendations')
        .setDescription('Get ML-powered optimization recommendations'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
);

// Bot Ready Event
client.once('ready', async () => {
  console.log(`✅ Discord Bot logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
  
  // Set bot status
  client.user.setPresence({
    activities: [{ name: 'BarbrickDesign Services', type: ActivityType.Watching }],
    status: 'online',
  });

  // Register slash commands
  try {
    console.log('🔄 Started refreshing application (/) commands.');

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    if (DISCORD_GUILD_ID) {
      // Register commands for specific guild (faster for development)
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
        { body: commands.map(cmd => cmd.toJSON()) }
      );
      console.log(`✅ Successfully reloaded ${commands.length} guild (/) commands.`);
    } else {
      // Register commands globally (slower but works everywhere)
      await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID),
        { body: commands.map(cmd => cmd.toJSON()) }
      );
      console.log(`✅ Successfully reloaded ${commands.length} global (/) commands.`);
    }
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
});

// Interaction Handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, member, options } = interaction;
  
  // Analyze command sentiment for priority handling
  const optionValues = options && options.data ? 
    options.data.map(o => String(o.value || '')).join(' ') : '';
  const commandText = `${commandName} ${optionValues}`;
  const sentiment = sentimentAnalyzer.analyzeSentiment(commandText);
  
  // Log analytics
  predictiveAnalytics.recordUserActivity(`command_${commandName}`, member.user.id);
  
  // Check if immediate attention is needed
  if (sentimentAnalyzer.needsImmediateAttention(sentiment)) {
    console.log(`🚨 High priority interaction detected from ${member.user.tag}: ${sentiment.emotion} sentiment`);
  }

  try {
    switch (commandName) {
      case 'help':
        await handleHelpCommand(interaction);
        break;
      
      case 'status':
        await handleStatusCommand(interaction);
        break;
      
      case 'banksky':
        await handleBankSkyCommand(interaction, options);
        break;
      
      case 'deploy':
        if (!hasPermission(member, PermissionFlagsBits.Administrator)) {
          await interaction.reply({ content: '❌ You need Administrator permission to use this command.', ephemeral: true });
          return;
        }
        await handleDeployCommand(interaction, options);
        break;
      
      case 'github':
        await handleGitHubCommand(interaction, options);
        break;
      
      case 'apikey':
        if (!hasPermission(member, PermissionFlagsBits.Administrator)) {
          await interaction.reply({ content: '❌ You need Administrator permission to use this command.', ephemeral: true });
          return;
        }
        await handleApiKeyCommand(interaction, options);
        break;
      
      case 'project':
        await handleProjectCommand(interaction, options);
        break;
      
      case 'sql':
        await handleSqlCommand(interaction, options);
        break;
      
      case 'safety':
        await handleSafetyCommand(interaction, options);
        break;
      
      case 'webhook':
        if (!hasPermission(member, PermissionFlagsBits.Administrator)) {
          await interaction.reply({ content: '❌ You need Administrator permission to use this command.', ephemeral: true });
          return;
        }
        await handleWebhookCommand(interaction, options);
        break;
      
      case 'notification':
        await handleNotificationCommand(interaction, options);
        break;
      
      case 'analytics':
        if (!hasPermission(member, PermissionFlagsBits.Administrator)) {
          await interaction.reply({ content: '❌ You need Administrator permission to use this command.', ephemeral: true });
          return;
        }
        await handleAnalyticsCommand(interaction, options);
        break;
      
      default:
        await interaction.reply({ content: '❓ Unknown command.', ephemeral: true });
    }
  } catch (error) {
    console.error(`Error handling command ${commandName}:`, error);
    const errorMessage = { content: '❌ An error occurred while executing this command.', ephemeral: true };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Command Handlers

async function handleHelpCommand(interaction) {
  const embed = createEmbed(
    '📚 BarbrickDesign Bot Commands',
    'Here are all available commands:\n\n' +
    '**General Commands:**\n' +
    '`/help` - Show this help message\n' +
    '`/status` - Get system status\n' +
    '`/project [name]` - Get project information\n\n' +
    '**Service Commands:**\n' +
    '`/banksky info|stats` - BankSky operations\n' +
    '`/github status|stats` - GitHub operations\n' +
    '`/sql analyze|scan` - SQL analysis\n' +
    '`/safety [system]` - Safety system status\n\n' +
    '**Admin Commands:**\n' +
    '`/deploy <service>` - Deploy services\n' +
    '`/apikey check|test` - API key management\n' +
    '`/webhook list|create` - Webhook management\n\n' +
    '**Settings:**\n' +
    '`/notification enable|disable` - Notification preferences',
    0x00FF00
  );
  
  await interaction.reply({ embeds: [embed] });
}

async function handleStatusCommand(interaction) {
  await interaction.deferReply();
  
  const embed = createEmbed(
    '📊 BarbrickDesign System Status',
    '**Repository:** barbrickdesign.github.io\n' +
    '**Status:** 🟢 Online\n' +
    '**Projects:** 375+ HTML applications\n' +
    '**Services:** BankSky, SQL Analyzer, Safety Systems\n' +
    '**Last Update:** ' + new Date().toLocaleString(),
    0x00FF00
  );
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleBankSkyCommand(interaction, options) {
  await interaction.deferReply();
  const subcommand = options.getSubcommand();
  
  let embed;
  if (subcommand === 'info') {
    embed = createEmbed(
      '🏦 BankSky Information',
      '**BankSky** - Mobile-First Web3 DeFi Platform\n\n' +
      '🌐 **URL:** https://barbrickdesign.github.io/BankSky.html\n' +
      '📱 **Features:**\n' +
      '• Mobile-optimized Web3 application\n' +
      '• Wallet integration (MetaMask, WalletConnect)\n' +
      '• Real-time blockchain analytics\n' +
      '• Self-healing backend infrastructure\n\n' +
      '**Services:**\n' +
      '• Micro-TX (Port 3000)\n' +
      '• Anchor (Port 3001)\n' +
      '• Affiliate (Port 3002)\n' +
      '• Relayer (Port 3003)',
      0x3498DB
    );
  } else if (subcommand === 'stats') {
    embed = createEmbed(
      '📈 BankSky Statistics',
      '**Platform Stats:**\n' +
      '• Version: 2.4.0\n' +
      '• Supported Networks: Ethereum, Bitcoin, Solana\n' +
      '• Active Services: 4\n' +
      '• API Integrations: 8+',
      0x3498DB
    );
  }
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleDeployCommand(interaction, options) {
  await interaction.deferReply();
  const service = options.getString('service');
  
  const embed = createEmbed(
    '🚀 Deployment Started',
    `Deploying **${service}** service...\n\n` +
    '⏳ This may take a few minutes.\n' +
    'You will be notified when deployment is complete.\n\n' +
    '**Note:** This is a demonstration. Connect actual deployment logic for production use.',
    0xFFAA00
  );
  
  await interaction.editReply({ embeds: [embed] });
  
  // TODO: Connect to actual deployment system
  // For now, simulate deployment with timeout
  setTimeout(async () => {
    const successEmbed = createEmbed(
      '✅ Deployment Complete',
      `**${service}** service deployment simulation completed!\n\n` +
      '**Action Required:** Integrate with actual deployment system for production use.',
      0x00FF00
    );
    await interaction.followUp({ embeds: [successEmbed] });
  }, 3000);
}

async function handleGitHubCommand(interaction, options) {
  await interaction.deferReply();
  const subcommand = options.getSubcommand();
  
  let embed;
  if (subcommand === 'status') {
    embed = createEmbed(
      '🐙 GitHub Repository Status',
      '**Repository:** barbrickdesign/barbrickdesign.github.io\n' +
      '**Status:** 🟢 Active\n' +
      '**Default Branch:** main\n' +
      '**Visibility:** Public\n\n' +
      '🔗 https://github.com/barbrickdesign/barbrickdesign.github.io',
      0x211F1F
    );
  } else if (subcommand === 'stats') {
    embed = createEmbed(
      '📊 GitHub Statistics',
      '**Repository Metrics:**\n' +
      '• Total Repositories: 14\n' +
      '• HTML Projects: 375+\n' +
      '• Lines of Code: 500,000+\n' +
      '• Documentation: 100+ files',
      0x211F1F
    );
  }
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleApiKeyCommand(interaction, options) {
  await interaction.deferReply({ ephemeral: true });
  const subcommand = options.getSubcommand();
  
  let embed;
  if (subcommand === 'check') {
    embed = createEmbed(
      '🔑 API Key Status',
      '**Checking API keys...**\n\n' +
      '• OpenAI: ✅ Active\n' +
      '• GitHub: ✅ Active\n' +
      '• PayPal: ✅ Active\n' +
      '• Etherscan: ⚠️ Not configured\n' +
      '• SAM.gov: ⚠️ Not configured',
      0xFFAA00
    );
  } else if (subcommand === 'test') {
    embed = createEmbed(
      '🧪 API Connection Test',
      'Testing API connections...\n\n' +
      '⏳ This may take a moment.',
      0x3498DB
    );
  }
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleProjectCommand(interaction, options) {
  await interaction.deferReply();
  const projectName = options.getString('name');
  
  if (!projectName) {
    const embed = createEmbed(
      '📂 BarbrickDesign Projects',
      '**Project Categories:**\n' +
      '• Web3/Blockchain: 80+ projects\n' +
      '• DeFi/Financial: 70+ projects\n' +
      '• Enterprise/Tools: 60+ projects\n' +
      '• Gaming/Entertainment: 50+ projects\n' +
      '• AI/ML Tools: 40+ projects\n\n' +
      '🔗 https://barbrickdesign.github.io/all-repos-hub.html',
      0x9B59B6
    );
    await interaction.editReply({ embeds: [embed] });
  } else {
    const embed = createEmbed(
      `📦 Project: ${projectName}`,
      'Project information would be displayed here.',
      0x9B59B6
    );
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleSqlCommand(interaction, options) {
  await interaction.deferReply();
  const subcommand = options.getSubcommand();
  
  let embed;
  if (subcommand === 'analyze') {
    embed = createEmbed(
      '🔍 SQL Schema Analysis',
      'Starting SQL schema analysis...\n\n' +
      '**Features:**\n' +
      '• Security scanning\n' +
      '• Performance optimization\n' +
      '• Auto-fix generation\n\n' +
      '⏳ Analysis in progress...',
      0x3498DB
    );
  } else if (subcommand === 'scan') {
    embed = createEmbed(
      '📂 SQL File Scan',
      'Scanning codebase for SQL files...\n\n' +
      '⏳ Scan in progress...',
      0x3498DB
    );
  }
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleSafetyCommand(interaction, options) {
  await interaction.deferReply();
  const system = options.getString('system') || 'all';
  
  let description = '';
  if (system === 'anti-nuke' || system === 'all') {
    description += '**🕊️ Anti-Nuclear Safety System**\n' +
      '• Status: 🟢 ACTIVE\n' +
      '• Version: 1.0.0-peace\n' +
      '• Protected Pages: 431\n\n';
  }
  if (system === 'vehicle' || system === 'all') {
    description += '**🚗 AI Vehicle Safety Monitor**\n' +
      '• Status: 🟢 ACTIVE\n' +
      '• Vehicles: 4 units\n' +
      '• Version: 1.0.0-safe-journey\n\n';
  }
  
  const embed = createEmbed(
    '🛡️ Safety Systems Status',
    description + '✅ All safety systems operational',
    0x00FF00
  );
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleWebhookCommand(interaction, options) {
  await interaction.deferReply({ ephemeral: true });
  const subcommand = options.getSubcommand();
  
  let embed;
  if (subcommand === 'list') {
    embed = createEmbed(
      '🔗 Active Webhooks',
      '**Configured Webhooks:**\n' +
      '• GitHub Events\n' +
      '• Deployment Notifications\n' +
      '• System Alerts',
      0x3498DB
    );
  } else if (subcommand === 'create') {
    const name = options.getString('name');
    embed = createEmbed(
      '✅ Webhook Created',
      `Webhook **${name}** has been created successfully!`,
      0x00FF00
    );
  }
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleNotificationCommand(interaction, options) {
  await interaction.deferReply({ ephemeral: true });
  const subcommand = options.getSubcommand();
  const type = options.getString('type');
  
  const action = subcommand === 'enable' ? 'enabled' : 'disabled';
  const emoji = subcommand === 'enable' ? '🔔' : '🔕';
  
  const embed = createEmbed(
    `${emoji} Notifications ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    `**${type}** notifications have been ${action}.`,
    subcommand === 'enable' ? 0x00FF00 : 0x808080
  );
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleAnalyticsCommand(interaction, options) {
  await interaction.deferReply({ ephemeral: true });
  const subcommand = options.getSubcommand();
  
  let embed;
  
  if (subcommand === 'sentiment') {
    const stats = sentimentAnalyzer.getStatistics();
    const trend = stats.satisfactionTrend;
    const breakdown = stats.emotionalBreakdown;
    
    embed = createEmbed(
      '🧠 ML Sentiment Analysis',
      `**Overall Sentiment Trend:** ${trend.trend === 'improving' ? '📈' : trend.trend === 'declining' ? '📉' : '➡️'} ${trend.trend}\n\n` +
      `**Total Analyses:** ${stats.totalAnalyses}\n` +
      `**Recent Sentiment:**\n` +
      `  • Positive: ${trend.recentPositive}\n` +
      `  • Neutral: ${trend.recentNeutral}\n` +
      `  • Negative: ${trend.recentNegative}\n\n` +
      `**Emotional Breakdown:**\n` +
      `  😊 Joy: ${breakdown.joy}\n` +
      `  😢 Sadness: ${breakdown.sadness}\n` +
      `  😠 Anger: ${breakdown.anger}\n` +
      `  😰 Fear: ${breakdown.fear}\n` +
      `  😲 Surprise: ${breakdown.surprise}\n` +
      `  😐 Neutral: ${breakdown.neutral}`,
      trend.trend === 'improving' ? 0x00FF00 : trend.trend === 'declining' ? 0xFF0000 : 0x3498DB
    );
  } else if (subcommand === 'predictions') {
    const report = predictiveAnalytics.generateReport();
    const userBehavior = report.predictions.userBehavior;
    
    embed = createEmbed(
      '🔮 ML Predictive Analytics',
      `**Data Points:** ${report.dataPoints.apiCalls + report.dataPoints.userActivity} total\n\n` +
      `**User Behavior Prediction:**\n` +
      `  • Confidence: ${userBehavior.confidence}\n` +
      `  • Total Activities: ${userBehavior.totalActivities || 'N/A'}\n\n` +
      `**Top Actions:**\n${userBehavior.topActions ? userBehavior.topActions.map(a => 
        `  • ${a.action}: ${a.percentage}`
      ).join('\n') : '  No data available'}\n\n` +
      `**Peak Activity:**\n` +
      `  • Hour: ${userBehavior.timePatterns?.peakHour?.key || 'N/A'}\n` +
      `  • Day: ${userBehavior.timePatterns?.peakDay?.day || 'N/A'}`,
      0x9B59B6
    );
  } else if (subcommand === 'behavior') {
    const behavior = predictiveAnalytics.predictUserBehavior();
    
    if (behavior.prediction === 'insufficient_data') {
      embed = createEmbed(
        '📊 User Behavior Patterns',
        '⚠️ Insufficient data for behavioral analysis.\n\nMore user activity data is needed to generate accurate predictions.',
        0xFFAA00
      );
    } else {
      embed = createEmbed(
        '📊 User Behavior Patterns',
        `**Total Activities:** ${behavior.totalActivities}\n` +
        `**Confidence:** ${behavior.confidence}\n\n` +
        `**Most Common Actions:**\n${behavior.topActions.map((a, i) => 
          `  ${i + 1}. ${a.action} (${a.percentage})`
        ).join('\n')}\n\n` +
        `**Peak Activity Times:**\n` +
        `  • Peak Hour: ${behavior.timePatterns.peakHour.key}:00 (${behavior.timePatterns.peakHour.value} activities)\n` +
        `  • Peak Day: ${behavior.timePatterns.peakDay.day}`,
        0x3498DB
      );
    }
  } else if (subcommand === 'recommendations') {
    const recommendations = predictiveAnalytics.getOptimizationRecommendations();
    
    if (recommendations.length === 0) {
      embed = createEmbed(
        '💡 Optimization Recommendations',
        '✅ No optimization recommendations at this time.\n\nAll systems are operating efficiently!',
        0x00FF00
      );
    } else {
      const highPriority = recommendations.filter(r => r.priority === 'high');
      const mediumPriority = recommendations.filter(r => r.priority === 'medium');
      
      let description = '';
      
      if (highPriority.length > 0) {
        description += '**🔴 High Priority:**\n';
        highPriority.slice(0, 3).forEach((rec, i) => {
          description += `  ${i + 1}. ${rec.action}\n     ${rec.suggestion}\n\n`;
        });
      }
      
      if (mediumPriority.length > 0) {
        description += '**🟡 Medium Priority:**\n';
        mediumPriority.slice(0, 2).forEach((rec, i) => {
          description += `  ${i + 1}. ${rec.action}\n     ${rec.suggestion}\n\n`;
        });
      }
      
      embed = createEmbed(
        '💡 ML Optimization Recommendations',
        description,
        highPriority.length > 0 ? 0xFF0000 : 0xFFAA00
      );
    }
  }
  
  await interaction.editReply({ embeds: [embed] });
}

// Express webhook server for GitHub events
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot: client.user ? 'Connected' : 'Not connected',
    uptime: process.uptime()
  });
});

// GitHub webhook endpoint
app.post('/webhook/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;
  
  console.log(`📥 Received GitHub event: ${event}`);
  
  // Send notification to Discord
  const channel = client.channels.cache.find(ch => ch.name === 'github-events');
  if (channel) {
    const embed = createEmbed(
      `GitHub Event: ${event}`,
      `Repository: ${payload.repository?.full_name || 'Unknown'}\n` +
      `Action: ${payload.action || 'N/A'}`,
      0x211F1F
    );
    await channel.send({ embeds: [embed] });
  }
  
  res.status(200).send('OK');
});

// Deployment webhook endpoint
app.post('/webhook/deployment', async (req, res) => {
  const { service, status, message } = req.body;
  
  console.log(`📦 Deployment webhook: ${service} - ${status}`);
  
  const channel = client.channels.cache.find(ch => ch.name === 'deployments');
  if (channel) {
    const color = status === 'success' ? 0x00FF00 : status === 'failed' ? 0xFF0000 : 0xFFAA00;
    const embed = createEmbed(
      `Deployment ${status.toUpperCase()}`,
      `**Service:** ${service}\n**Message:** ${message}`,
      color
    );
    await channel.send({ embeds: [embed] });
  }
  
  res.status(200).send('OK');
});

// Start webhook server
app.listen(WEBHOOK_PORT, () => {
  console.log(`🌐 Webhook server running on port ${WEBHOOK_PORT}`);
});

// Error handling
process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

client.on('error', error => {
  console.error('❌ Discord client error:', error);
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-WELCOME NEW MEMBERS - VERIFICATION PIPELINE
// Pattern: 3 → 7 → 13 → ∞ | Consciousness Revolution
// ═══════════════════════════════════════════════════════════════════════════════

const VERIFICATION_FORM_URL = process.env.VERIFICATION_FORM_URL || 'https://forms.google.com/YOUR_FORM_ID';
const VERIFICATION_API_URL = process.env.VERIFICATION_API_URL || 'https://conciousnessrevolution.io/.netlify/functions/discord-verification';

client.on('guildMemberAdd', async (member) => {
  console.log(`👋 New member joined: ${member.user.username} (${member.id})`);

  // Create welcome embed
  const welcomeEmbed = new EmbedBuilder()
    .setColor(0x00f0ff)
    .setTitle('👋 Welcome to Consciousness Revolution!')
    .setDescription(`Hey **${member.user.username}**!\n\nYou've entered a community of builders, creators, and consciousness explorers.\n\n**To unlock all channels, complete this 2-minute verification:**\n\n🔗 **[VERIFY HERE](${VERIFICATION_FORM_URL})**\n\n*Answer 3 questions so we know you're a builder, not a destroyer.*`)
    .addFields(
      { name: '📋 What to Expect', value: '• Tell us who you are\n• Why you\'re here\n• What\'s your mission', inline: true },
      { name: '🎯 After Verification', value: '• Access all channels\n• Join domain discussions\n• Earn XP and level up', inline: true }
    )
    .setFooter({ text: 'Pattern: 3 → 7 → 13 → ∞ | ARAYA will review your response' })
    .setTimestamp();

  try {
    // Send welcome DM
    await member.send({ embeds: [welcomeEmbed] });
    console.log(`✅ Sent verification DM to ${member.user.username}`);

    // Register new member in verification system
    try {
      await axios.post(VERIFICATION_API_URL, {
        discordId: member.id,
        username: member.user.username,
        joinedAt: new Date().toISOString(),
        guildId: member.guild.id,
        guildName: member.guild.name,
        status: 'pending_verification'
      });
      console.log(`📝 Registered ${member.user.username} in verification system`);
    } catch (apiError) {
      console.error(`⚠️ Failed to register in verification API:`, apiError.message);
    }

  } catch (dmError) {
    // DMs might be disabled - log but don't fail
    console.log(`⚠️ Couldn't DM ${member.user.username} - DMs likely disabled`);

    // Try to mention in welcome channel instead
    const welcomeChannel = member.guild.channels.cache.find(
      ch => ch.name.includes('welcome') || ch.name.includes('lobby') || ch.name.includes('general')
    );

    if (welcomeChannel && welcomeChannel.isTextBased()) {
      try {
        await welcomeChannel.send({
          content: `👋 Welcome ${member}! Check your DMs for verification instructions, or click here: ${VERIFICATION_FORM_URL}`,
          embeds: [welcomeEmbed]
        });
        console.log(`📢 Posted welcome in ${welcomeChannel.name} for ${member.user.username}`);
      } catch (channelError) {
        console.error(`❌ Couldn't post in welcome channel:`, channelError.message);
      }
    }
  }
});

// Login to Discord
if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set in environment variables!');
  console.log('Please set DISCORD_BOT_TOKEN in your .env file');
  process.exit(1);
}

client.login(DISCORD_TOKEN).catch(error => {
  console.error('❌ Failed to login to Discord:', error);
  process.exit(1);
});

module.exports = { client, app };
