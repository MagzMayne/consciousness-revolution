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
    
    // Determine if we're in production (Railway sets NODE_ENV or we can detect PORT)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

    // Check if backend directory exists
    const hasBackend = fs.existsSync(this.backendDir);
    
    if (!hasBackend && !isProduction && !this.isDev) {
      console.log('❌ Backend directory not found!');
      console.log('💡 Run: npm run setup');
      process.exit(1);
    }

    // Start backend services if available
    if (hasBackend) {
      console.log('🔧 Starting backend services...');
      try {
        await this.startBackendServices();
      } catch (error) {
        console.log('⚠️ Backend services failed to start:', error.message);
        if (!isProduction && !this.isDev) {
          process.exit(1);
        }
      }
    } else {
      console.log('ℹ️ Backend directory not found, running in static mode');
    }

    // Start web server in dev mode OR production mode OR if explicitly requested
    if (this.isDev || isProduction || process.env.PORT) {
      console.log('🌐 Starting web server...');
      await this.startWebServer();
    }

    console.log('\n✅ BankSky Platform Started!');
    console.log('\n📊 Services:');
    const webPort = process.env.PORT || 8080;
    console.log(`   🌐 Web Interface: http://localhost:${webPort}/BankSky.html`);
    if (hasBackend) {
      console.log('   🔧 Backend API: http://localhost:3000 (micro-tx)');
      console.log('   📡 Anchor Service: http://localhost:3001');
      console.log('   💰 Affiliate Service: http://localhost:3002');
      console.log('   ⚡ Relayer Service: http://localhost:3003');
      console.log('   🛠️ Command Executor: http://localhost:3005');
    }

    console.log('\n🛑 Press Ctrl+C to stop all services');
  }

  async startBackendServices() {
    return new Promise((resolve, reject) => {
      // Force the backend API subprocess to use port 3000 so it doesn't conflict
      // with the web server that binds to process.env.PORT (Railway's exposed port).
      const backendEnv = Object.assign({}, process.env, { PORT: process.env.BACKEND_PORT || '3000' });
      const backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: this.backendDir,
        env: backendEnv,
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
        // Detect either the legacy banner or the Railway service banner
        if (output.includes('BankSky Local Development Server') ||
            output.includes('CONSCIOUSNESS REVOLUTION') ||
            output.includes('Status: LIVE on port')) {
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
    
    // Use PORT from environment variable (for Railway/production) or default to 8080
    const port = process.env.PORT || 8080;

    app.use('/', async (req, res) => {
      await serveHandler(req, res, {
        public: this.rootDir,
        directoryListing: false
      });
    });

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        console.log(`✅ Web server started on http://localhost:${port}`);
        this.services.push({
          name: 'web-server',
          process: server,
          type: 'web'
        });
        resolve();
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Web server failed: port ${port} is already in use.`);
          console.error('   Tip: set BACKEND_PORT env var to move the API server off this port.');
          // Resolve (not reject) so the launcher keeps running — the backend API
          // subprocess is still alive on its own port and can handle API traffic.
          resolve();
        } else {
          console.error('❌ Web server failed:', error.message);
          resolve(); // don't crash the launcher; continue with backend-only mode
        }
      });
    });
  }

  stop() {
    console.log('\n🛑 Stopping BankSky Platform...');

    this.services.forEach(service => {
      try {
        if (service.type === 'web' && service.process.close) {
          service.process.close();
        } else if (service.process.kill) {
          service.process.kill();
        }
      } catch (err) {
        // Process may already be gone — ignore
      }
    });

    console.log('✅ All services stopped');
    process.exit(0);
  }
}

// Start the launcher
const launcher = new BankSkyLauncher();

// Register signal handlers immediately so SIGTERM/SIGINT are always caught,
// even if they arrive during the async startup window (e.g. while waiting for
// backend services to initialise).  Without this the Node.js default handler
// would terminate the process with the raw signal, causing npm to report
// "npm error signal SIGTERM".
process.on('SIGINT', () => launcher.stop());
process.on('SIGTERM', () => launcher.stop());

launcher.start().catch(console.error);
