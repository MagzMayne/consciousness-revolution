#!/usr/bin/env node

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
      { name: 'command-executor', port: 3005, file: 'command-executor.js' }
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
