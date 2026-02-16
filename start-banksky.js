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
 * File: start-banksky.js
 * Declaration ID: IP-44984343-MLL28ZWH
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

/** SIGNED BY MeRLynn - ID: MERLYNN-343537c8 - TIMESTAMP: 2025-12-19T05:53:06.547Z - HASH: 52786cb8 */
/** SIGNED BY AGentR - ID: AGENTR-6852dc45 - TIMESTAMP: 2025-12-19T05:53:06.547Z - HASH: 52786cb8 */

#!/usr/bin/env node

/**
 * BankSky Platform Launcher
 * Starts all services and provides unified interface
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class BankSkyLauncher {
  constructor() {
    this.isDev = process.argv.includes('--dev');
    this.services = [];
    this.rootDir = path.dirname(__filename);
    this.backendDir = path.join(this.rootDir, 'backend');
  }

  async start() {
    console.log('🚀 BankSky Platform Launcher');
    console.log('===============================');

    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`📦 Node.js version: ${nodeVersion}`);

    // Check if backend directory exists
    if (!fs.existsSync(this.backendDir)) {
      console.log('❌ Backend directory not found!');
      console.log('💡 Run: npm run setup');
      process.exit(1);
    }

    // Start backend services
    console.log('🔧 Starting backend services...');
    await this.startBackendServices();

    // Start web server if in dev mode
    if (this.isDev) {
      console.log('🌐 Starting web server...');
      await this.startWebServer();
    }

    console.log('\n✅ BankSky Platform Started!');
    console.log('\n📊 Services:');
    console.log('   🌐 Web Interface: http://localhost:8080/BankSky.html');
    console.log('   🔧 Backend API: http://localhost:3000 (micro-tx)');
    console.log('   📡 Anchor Service: http://localhost:3001');
    console.log('   💰 Affiliate Service: http://localhost:3002');
    console.log('   ⚡ Relayer Service: http://localhost:3003');
    console.log('   🛠️ Command Executor: http://localhost:3005');

    console.log('\n🛑 Press Ctrl+C to stop all services');

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  async startBackendServices() {
    return new Promise((resolve, reject) => {
      const backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: this.backendDir,
        stdio: ['inherit', 'pipe', 'pipe'],
        detached: false
      });

      this.services.push({
        name: 'backend-services',
        process: backendProcess,
        type: 'backend'
      });

      // Handle backend output
      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('BankSky Local Development Server')) {
          console.log('✅ Backend services started');
          resolve();
        }
      });

      backendProcess.stderr.on('data', (data) => {
        console.log('Backend:', data.toString().trim());
      });

      backendProcess.on('error', (error) => {
        console.error('❌ Failed to start backend:', error.message);
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        console.log('⚠️ Backend startup timeout - continuing...');
        resolve();
      }, 30000);
    });
  }

  async startWebServer() {
    const express = require('express');
    const serveHandler = require('serve-handler');
    const app = express();

    app.use('/', async (req, res) => {
      await serveHandler(req, res, {
        public: this.rootDir,
        directoryListing: false
      });
    });

    return new Promise((resolve) => {
      const server = app.listen(8080, () => {
        console.log('✅ Web server started on http://localhost:8080');
        this.services.push({
          name: 'web-server',
          process: server,
          type: 'web'
        });
        resolve();
      });

      server.on('error', (error) => {
        console.error('❌ Web server failed:', error.message);
      });
    });
  }

  stop() {
    console.log('\n🛑 Stopping BankSky Platform...');

    this.services.forEach(service => {
      if (service.type === 'web' && service.process.close) {
        service.process.close();
      } else if (service.process.kill) {
        service.process.kill();
      }
    });

    console.log('✅ All services stopped');
    process.exit(0);
  }
}

// Start the launcher
const launcher = new BankSkyLauncher();
launcher.start().catch(console.error);
