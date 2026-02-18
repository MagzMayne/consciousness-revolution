#!/usr/bin/env node

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
 * File: deploy-banksky.js
 * Declaration ID: IP-702E84E8-MLL28ZUQ
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

/** SIGNED BY MeRLynn - ID: MERLYNN-63be8041 - TIMESTAMP: 2025-12-19T05:53:06.514Z - HASH: 628d4bb4 */
/** SIGNED BY AGentR - ID: AGENTR-020d928c - TIMESTAMP: 2025-12-19T05:53:06.514Z - HASH: 628d4bb4 */

/**
 * BankSky Deployment Script
 * Handles deployment to various platforms
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { notifyDeployment, isDiscordAvailable } = require('./discord-integration');

class BankSkyDeployer {
  constructor() {
    this.rootDir = path.dirname(__filename);
    this.backendDir = path.join(this.rootDir, 'backend');
    this.deployTarget = process.argv[2] || 'local'; // local, vercel, netlify, heroku
  }

  async deploy() {
    console.log('🚀 BankSky Deployment System');
    console.log('===========================');
    console.log(`📦 Target: ${this.deployTarget}`);

    // Check Discord availability
    const discordEnabled = await isDiscordAvailable();
    if (discordEnabled) {
      console.log('✅ Discord notifications enabled');
      await notifyDeployment('banksky', 'pending', `Starting BankSky deployment to ${this.deployTarget}`);
    }

    try {
      switch (this.deployTarget) {
        case 'local':
          await this.deployLocal();
          break;
        case 'vercel':
          await this.deployVercel();
          break;
        case 'netlify':
          await this.deployNetlify();
          break;
        case 'heroku':
          await this.deployHeroku();
          break;
        default:
          console.log('❌ Unknown deployment target');
          console.log('Available targets: local, vercel, netlify, heroku');
          if (this.discordEnabled) {
            await notifyDeployment('banksky', 'failed', `Unknown deployment target: ${this.deployTarget}`);
          }
          process.exit(1);
      }

      // Notify success
      if (discordEnabled) {
        await notifyDeployment('banksky', 'success', `BankSky successfully deployed to ${this.deployTarget}`);
      }
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      const discordEnabled = await isDiscordAvailable();
      if (discordEnabled) {
        await notifyDeployment('banksky', 'failed', `Deployment failed: ${error.message}`);
      }
      throw error;
    }
  }

  async deployLocal() {
    console.log('🏠 Local Deployment');

    // Check if backend is set up
    if (!fs.existsSync(this.backendDir)) {
      console.log('❌ Backend directory not found');
      console.log('💡 Run: npm run setup');
      return;
    }

    // Build frontend (if needed)
    console.log('🔨 Building frontend...');
    await this.runCommand('npm', ['run', 'build']);

    // Start services
    console.log('🚀 Starting services...');
    await this.runCommand('npm', ['start']);

    console.log('✅ Local deployment complete!');
    console.log('🌐 Access at: http://localhost:8080/BankSky.html');
  }

  async deployVercel() {
    console.log('☁️ Deploying to Vercel...');

    // Check if Vercel CLI is installed
    try {
      await this.runCommand('vercel', ['--version']);
    } catch (error) {
      console.log('❌ Vercel CLI not found');
      console.log('💡 Install: npm i -g vercel');
      console.log('💡 Then run: vercel login');
      return;
    }

    // Deploy
    await this.runCommand('vercel', ['--prod']);

    console.log('✅ Deployed to Vercel!');
  }

  async deployNetlify() {
    console.log('☁️ Deploying to Netlify...');

    // Check if Netlify CLI is installed
    try {
      await this.runCommand('netlify', ['--version']);
    } catch (error) {
      console.log('❌ Netlify CLI not found');
      console.log('💡 Install: npm i -g netlify-cli');
      console.log('💡 Then run: netlify login');
      return;
    }

    // Deploy
    await this.runCommand('netlify', ['deploy', '--prod']);

    console.log('✅ Deployed to Netlify!');
  }

  async deployHeroku() {
    console.log('☁️ Deploying to Heroku...');

    // Check if Heroku CLI is installed
    try {
      await this.runCommand('heroku', ['--version']);
    } catch (error) {
      console.log('❌ Heroku CLI not found');
      console.log('💡 Install from: https://devcenter.heroku.com/articles/heroku-cli');
      return;
    }

    // Create Heroku app if it doesn't exist
    const appName = 'banksky-app';
    try {
      await this.runCommand('heroku', ['apps:info', appName]);
    } catch (error) {
      console.log('📦 Creating Heroku app...');
      await this.runCommand('heroku', ['apps:create', appName]);
    }

    // Deploy
    await this.runCommand('git', ['push', 'heroku', 'main']);

    console.log('✅ Deployed to Heroku!');
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        cwd: this.rootDir,
        stdio: 'inherit'
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      proc.on('error', reject);
    });
  }
}

// Run deployment
const deployer = new BankSkyDeployer();
deployer.deploy().catch(console.error);
