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
 * File: setup-discord-bot.js
 * Declaration ID: IP-34F65FE1-MLL28ZVV
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

#!/usr/bin/env node

/**
 * Discord Bot Quick Start Script
 * 
 * Helps users set up and start the Discord bot quickly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('🤖 Discord Bot Quick Start');
  console.log('===========================\n');

  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    envContent = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env from .env.example');
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  } else {
    console.log('❌ No .env.example found');
    process.exit(1);
  }

  // Check if Discord tokens are set
  const hasToken = envContent.includes('DISCORD_BOT_TOKEN=') && 
                   !envContent.includes('DISCORD_BOT_TOKEN=your-discord-bot-token-here');
  const hasClientId = envContent.includes('DISCORD_CLIENT_ID=') && 
                      !envContent.includes('DISCORD_CLIENT_ID=your-discord-client-id-here');

  if (hasToken && hasClientId) {
    console.log('✅ Discord configuration found\n');
    const shouldStart = await question('Start Discord bot now? (y/n): ');
    
    if (shouldStart.toLowerCase() === 'y') {
      rl.close();
      console.log('\n🚀 Starting Discord bot...\n');
      require('./discord-bot.js');
    } else {
      console.log('\n💡 To start the bot later, run: npm run discord:bot');
      rl.close();
    }
    return;
  }

  console.log('\n⚠️  Discord bot not configured yet\n');
  console.log('To set up the Discord bot:');
  console.log('\n1️⃣  Create a Discord Application:');
  console.log('   🔗 https://discord.com/developers/applications');
  console.log('\n2️⃣  Click "New Application" and name it "BarbrickDesign Bot"');
  console.log('\n3️⃣  Go to "Bot" section and click "Add Bot"');
  console.log('\n4️⃣  Enable these Privileged Gateway Intents:');
  console.log('   ✅ Presence Intent');
  console.log('   ✅ Server Members Intent');
  console.log('   ✅ Message Content Intent');
  console.log('\n5️⃣  Copy the Bot Token (click "Reset Token" if needed)');
  console.log('\n6️⃣  Go to "OAuth2" → "General" and copy the Client ID');
  console.log('\n7️⃣  Invite bot to your server:');
  console.log('   • Go to "OAuth2" → "URL Generator"');
  console.log('   • Select scopes: bot, applications.commands');
  console.log('   • Select permissions: Administrator');
  console.log('   • Copy and open the generated URL\n');

  const configure = await question('Do you want to configure now? (y/n): ');
  
  if (configure.toLowerCase() !== 'y') {
    console.log('\n💡 Edit .env manually and add:');
    console.log('   DISCORD_BOT_TOKEN=your-bot-token');
    console.log('   DISCORD_CLIENT_ID=your-client-id');
    console.log('   DISCORD_GUILD_ID=your-guild-id (optional)');
    console.log('\n💡 Then run: npm run discord:bot');
    rl.close();
    return;
  }

  console.log('\n📝 Enter your Discord bot credentials:\n');
  
  const botToken = await question('Bot Token: ');
  const clientId = await question('Client ID: ');
  const guildId = await question('Guild ID (optional, press Enter to skip): ');

  // Update .env file
  let newEnvContent = envContent;
  
  // Update or add DISCORD_BOT_TOKEN
  if (newEnvContent.includes('DISCORD_BOT_TOKEN=')) {
    newEnvContent = newEnvContent.replace(
      /DISCORD_BOT_TOKEN=.*/,
      `DISCORD_BOT_TOKEN=${botToken}`
    );
  } else {
    newEnvContent += `\nDISCORD_BOT_TOKEN=${botToken}`;
  }
  
  // Update or add DISCORD_CLIENT_ID
  if (newEnvContent.includes('DISCORD_CLIENT_ID=')) {
    newEnvContent = newEnvContent.replace(
      /DISCORD_CLIENT_ID=.*/,
      `DISCORD_CLIENT_ID=${clientId}`
    );
  } else {
    newEnvContent += `\nDISCORD_CLIENT_ID=${clientId}`;
  }
  
  // Update or add DISCORD_GUILD_ID (if provided)
  if (guildId) {
    if (newEnvContent.includes('DISCORD_GUILD_ID=')) {
      newEnvContent = newEnvContent.replace(
        /DISCORD_GUILD_ID=.*/,
        `DISCORD_GUILD_ID=${guildId}`
      );
    } else {
      newEnvContent += `\nDISCORD_GUILD_ID=${guildId}`;
    }
  }

  // Save .env file
  fs.writeFileSync(envPath, newEnvContent);
  console.log('\n✅ Configuration saved to .env');

  const shouldStart = await question('\n🚀 Start Discord bot now? (y/n): ');
  
  if (shouldStart.toLowerCase() === 'y') {
    rl.close();
    console.log('\n🚀 Starting Discord bot...\n');
    require('./discord-bot.js');
  } else {
    console.log('\n💡 To start the bot, run: npm run discord:bot');
    console.log('💡 Or use: npm run discord:dev (for development with auto-reload)');
    rl.close();
  }
}

setup().catch(error => {
  console.error('❌ Error during setup:', error.message);
  rl.close();
  process.exit(1);
});
