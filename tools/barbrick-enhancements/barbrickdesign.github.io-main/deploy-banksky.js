#!/usr/bin/env node

/**
 * BankSky Deployment Script
 * Handles deployment to various platforms
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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
        process.exit(1);
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
