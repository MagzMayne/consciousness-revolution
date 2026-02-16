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
 * File: banksky-deploy.js
 * Declaration ID: IP-2BB04EB8-MLL28ZUO
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

/** SIGNED BY MeRLynn - ID: MERLYNN-5f9584d5 - TIMESTAMP: 2025-12-19T05:53:06.513Z - HASH: 27fef15c */
/** SIGNED BY AGentR - ID: AGENTR-0152ef22 - TIMESTAMP: 2025-12-19T05:53:06.513Z - HASH: 27fef15c */

#!/usr/bin/env node

/**
 * BankSky-Specific Deployment Handler
 * Specialized deployment for BankSky services and frontend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class BankSkyDeploymentHandler {
  constructor() {
    this.rootDir = path.dirname(__filename);
    this.backendDir = path.join(this.rootDir, 'backend');
    this.services = [
      { name: 'micro-tx', port: 3000, file: 'micro-tx.js' },
      { name: 'anchor', port: 3001, file: 'anchor.js' },
      { name: 'affiliate', port: 3002, file: 'affiliate.js' },
      { name: 'relayer', port: 3003, file: 'relayer.js' },
      { name: 'command-executor', port: 3005, file: 'command-executor.js' }
    ];
  }

  async deploy() {
    console.log('🎯 BankSky Deployment Handler');
    console.log('=============================');

    const command = process.argv[2] || 'status';

    switch (command) {
      case 'start':
        await this.startServices();
        break;
      case 'stop':
        await this.stopServices();
        break;
      case 'restart':
        await this.restartServices();
        break;
      case 'status':
        await this.showStatus();
        break;
      case 'health':
        await this.healthCheck();
        break;
      case 'setup':
        await this.setupEnvironment();
        break;
      default:
        console.log('Available commands: start, stop, restart, status, health, setup');
    }
  }

  async setupEnvironment() {
    console.log('🔧 Setting up BankSky environment...');

    // Create necessary directories
    const dirs = ['backend', 'backend/services', 'dist', 'logs'];
    dirs.forEach(dir => {
      const dirPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });

    // Check Node.js
    console.log('📦 Checking Node.js...');
    const nodeVersion = process.version;
    console.log(`✅ Node.js ${nodeVersion}`);

    // Install root dependencies
    console.log('📦 Installing root dependencies...');
    await this.runCommand('npm', ['install'], this.rootDir);

    // Install backend dependencies
    console.log('📦 Installing backend dependencies...');
    await this.runCommand('npm', ['install'], this.backendDir);

    console.log('✅ Environment setup complete!');
  }

  async startServices() {
    console.log('🚀 Starting BankSky services...');

    // Start backend services using the backend launcher
    const startScript = path.join(this.backendDir, 'start-local.js');
    if (fs.existsSync(startScript)) {
      console.log('🔧 Starting backend services...');
      const proc = spawn('node', [startScript], {
        cwd: this.backendDir,
        detached: true,
        stdio: 'ignore'
      });

      // Wait a moment for services to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('✅ Services started in background');
    } else {
      console.log('❌ Backend start script not found');
    }
  }

  async stopServices() {
    console.log('🛑 Stopping BankSky services...');

    // Kill Node.js processes on service ports
    const ports = this.services.map(s => s.port);
    for (const port of ports) {
      try {
        await this.runCommand('npx', ['kill-port', port], this.rootDir);
        console.log(`✅ Killed process on port ${port}`);
      } catch (error) {
        // Port might not be in use, continue
      }
    }

    console.log('✅ Services stopped');
  }

  async restartServices() {
    console.log('🔄 Restarting BankSky services...');
    await this.stopServices();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.startServices();
  }

  async showStatus() {
    console.log('📊 BankSky Service Status');
    console.log('========================');

    for (const service of this.services) {
      try {
        const response = await this.checkService(`http://localhost:${service.port}/health`);
        const status = response ? '🟢 Running' : '🔴 Stopped';
        console.log(`${status} ${service.name} (port ${service.port})`);
      } catch (error) {
        console.log(`🔴 ${service.name} (port ${service.port}) - Error: ${error.message}`);
      }
    }

    // Check if main application is accessible
    try {
      const response = await this.checkService('http://localhost:8080/BankSky.html');
      console.log(`${response ? '🟢' : '🔴'} Web Interface (port 8080)`);
    } catch (error) {
      console.log(`🔴 Web Interface (port 8080) - Not running`);
    }
  }

  async healthCheck() {
    console.log('🏥 BankSky Health Check');
    console.log('=======================');

    let healthyServices = 0;
    const totalServices = this.services.length;

    for (const service of this.services) {
      try {
        const response = await this.checkService(`http://localhost:${service.port}/health`);
        if (response) {
          console.log(`✅ ${service.name}: Healthy`);
          healthyServices++;
        } else {
          console.log(`❌ ${service.name}: Unhealthy`);
        }
      } catch (error) {
        console.log(`❌ ${service.name}: Error - ${error.message}`);
      }
    }

    const healthPercent = ((healthyServices / totalServices) * 100).toFixed(1);
    console.log(`\n📊 Overall Health: ${healthyServices}/${totalServices} (${healthPercent}%)`);

    if (healthyServices === totalServices) {
      console.log('🎉 All services are healthy!');
    } else {
      console.log('⚠️ Some services need attention.');
    }
  }

  async checkService(url) {
    const https = require('https');
    const http = require('http');

    return new Promise((resolve) => {
      const protocol = url.startsWith('https') ? https : http;
      const request = protocol.get(url, (res) => {
        resolve(res.statusCode === 200);
      });

      request.on('error', () => resolve(false));
      request.setTimeout(5000, () => {
        request.destroy();
        resolve(false);
      });
    });
  }

  async runCommand(command, args = [], cwd = this.rootDir) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        cwd,
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

// Run the handler
const handler = new BankSkyDeploymentHandler();
handler.deploy().catch(console.error);
