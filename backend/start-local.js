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
 * File: start-local.js
 * Declaration ID: IP-B3E5449-MLL28ZUM
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

/** SIGNED BY MeRLynn - ID: MERLYNN-0d5c4bf2 - TIMESTAMP: 2025-12-19T05:53:06.513Z - HASH: 64732de3 */
/** SIGNED BY AGentR - ID: AGENTR-4742d381 - TIMESTAMP: 2025-12-19T05:53:06.513Z - HASH: 64732de3 */

/**
 * BankSky Local Development Server
 * Starts all backend services locally for development
 */

const { spawn } = require('child_process');
const path = require('path');

class LocalServer {
  constructor() {
    this.services = [
      { name: 'micro-tx', port: 3000, file: 'micro-tx.js' },
      { name: 'anchor', port: 3001, file: 'anchor.js' },
      { name: 'affiliate', port: 3002, file: 'affiliate.js' },
      { name: 'relayer', port: 3003, file: 'relayer.js' },
      { name: 'command-executor', port: 3005, file: 'command-executor.js' },
      { name: 'wake-on-lan', port: 3010, file: 'wake-on-lan.js' }
    ];
    this.processes = new Map();
  }

  async start() {
    console.log('🚀 Starting BankSky Local Development Server...\n');

    // Install dependencies if needed
    console.log('📦 Checking dependencies...');
    try {
      require('express');
      require('cors');
    } catch (error) {
      console.log('Installing dependencies...');
      const install = spawn('npm', ['install'], { stdio: 'inherit', cwd: __dirname });
      await new Promise((resolve, reject) => {
        install.on('close', (code) => code === 0 ? resolve() : reject());
        install.on('error', reject);
      });
    }

    console.log('✅ Dependencies ready\n');

    // Start each service
    for (const service of this.services) {
      await this.startService(service);
    }

    console.log('\n🎉 All services started successfully!');
    console.log('🌐 Service URLs:');
    this.services.forEach(service => {
      console.log(`  ${service.name}: http://localhost:${service.port}`);
    });

    console.log('\n📝 Open BankSky.html in your browser to test');
    console.log('🛑 Press Ctrl+C to stop all services\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  async startService(service) {
    console.log(`🔧 Starting ${service.name} service on port ${service.port}...`);

    const servicePath = path.join(__dirname, 'services', service.file);

    return new Promise((resolve, reject) => {
      const proc = spawn('node', [servicePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PORT: service.port.toString() },
        cwd: __dirname
      });

      // Store process reference
      this.processes.set(service.name, proc);

      // Handle service output
      proc.stdout.on('data', (data) => {
        console.log(`[${service.name}] ${data.toString().trim()}`);
      });

      proc.stderr.on('data', (data) => {
        console.error(`[${service.name}] ${data.toString().trim()}`);
      });

      // Wait for service to be ready
      setTimeout(() => {
        console.log(`✅ ${service.name} service ready: http://localhost:${service.port}`);
        resolve();
      }, 2000);

      proc.on('error', (error) => {
        console.error(`❌ Failed to start ${service.name}:`, error.message);
        reject(error);
      });
    });
  }

  stop() {
    console.log('\n🛑 Stopping all services...');

    for (const [name, proc] of this.processes) {
      console.log(`Stopping ${name}...`);
      proc.kill();
    }

    console.log('✅ All services stopped');
    process.exit(0);
  }
}

// Start the server
const server = new LocalServer();
server.start().catch(console.error);
