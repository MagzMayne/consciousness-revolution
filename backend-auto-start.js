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
 * File: backend-auto-start.js
 * Declaration ID: IP-7BF4013A-MLL28ZUN
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Backend Auto-Start System
 * 
 * Automatically detects if backend is needed and starts it
 * Monitors backend health and restarts if necessary
 * Self-healing backend management
 * 
 * @author Barbrick Design
 * @date 2026-02-03
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

class BackendAutoStart {
  constructor(config = {}) {
    this.backendPort = config.backendPort || 4000;
    this.checkInterval = config.checkInterval || 10000; // 10 seconds
    this.restartDelay = config.restartDelay || 5000; // 5 seconds
    this.maxRestarts = config.maxRestarts || 5;
    this.restartCount = 0;
    this.backendProcess = null;
    this.isRunning = false;
    this.lastHealthCheck = null;
    
    // Detect backend service script
    this.backendScript = this.detectBackendScript();
  }
  
  /**
   * Detect which backend script to run
   */
  detectBackendScript() {
    const possibleScripts = [
      path.join(__dirname, 'backend', 'services', 'email-service.js'),
      path.join(__dirname, 'backend', 'start-local.js'),
      path.join(__dirname, 'backend', 'deploy-services.js')
    ];
    
    for (const script of possibleScripts) {
      if (fs.existsSync(script)) {
        console.log(`✓ Found backend script: ${script}`);
        return script;
      }
    }
    
    console.error('✗ No backend script found');
    return null;
  }
  
  /**
   * Start the backend auto-start system
   */
  async start() {
    console.log(`
╔════════════════════════════════════════════════════╗
║   🚀 Backend Auto-Start System                     ║
║   Monitoring port: ${this.backendPort}                          ║
║   Check interval: ${this.checkInterval / 1000}s                          ║
╚════════════════════════════════════════════════════╝
    `);
    
    if (!this.backendScript) {
      console.error('Cannot start - no backend script found');
      return false;
    }
    
    // Check if backend is already running
    const isAlreadyRunning = await this.checkBackendHealth();
    
    if (isAlreadyRunning) {
      console.log('✓ Backend already running');
    } else {
      console.log('Backend not running, starting...');
      await this.startBackend();
    }
    
    // Start monitoring
    this.startMonitoring();
    
    return true;
  }
  
  /**
   * Start the backend process
   */
  async startBackend() {
    if (this.backendProcess) {
      console.log('Backend process already exists, killing...');
      this.backendProcess.kill();
      await this.sleep(2000);
    }
    
    if (this.restartCount >= this.maxRestarts) {
      console.error(`✗ Max restart attempts reached (${this.maxRestarts}), giving up`);
      return false;
    }
    
    try {
      console.log(`Starting backend: ${this.backendScript}`);
      
      this.backendProcess = spawn('node', [this.backendScript], {
        cwd: __dirname,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      this.backendProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[BACKEND] ${output}`);
        }
      });
      
      this.backendProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('ExperimentalWarning')) {
          console.error(`[BACKEND ERROR] ${output}`);
        }
      });
      
      this.backendProcess.on('exit', (code, signal) => {
        console.log(`Backend process exited with code ${code}, signal ${signal}`);
        this.isRunning = false;
        this.backendProcess = null;
        
        if (code !== 0 && code !== null) {
          this.restartCount++;
          console.log(`Will attempt restart (${this.restartCount}/${this.maxRestarts})...`);
          setTimeout(() => this.startBackend(), this.restartDelay);
        }
      });
      
      // Wait a bit for backend to start
      await this.sleep(3000);
      
      // Verify it started
      const isHealthy = await this.checkBackendHealth();
      
      if (isHealthy) {
        console.log('✓ Backend started successfully');
        this.isRunning = true;
        this.restartCount = 0;
        return true;
      } else {
        console.warn('Backend started but health check failed');
        this.restartCount++;
        return false;
      }
      
    } catch (error) {
      console.error('Error starting backend:', error);
      this.restartCount++;
      return false;
    }
  }
  
  /**
   * Check backend health
   */
  async checkBackendHealth() {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: this.backendPort,
        path: '/health',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          this.lastHealthCheck = {
            timestamp: new Date().toISOString(),
            status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
            code: res.statusCode
          };
          
          resolve(res.statusCode === 200);
        });
      });
      
      req.on('error', () => {
        this.lastHealthCheck = {
          timestamp: new Date().toISOString(),
          status: 'unreachable',
          code: null
        };
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  }
  
  /**
   * Start monitoring loop
   */
  startMonitoring() {
    setInterval(async () => {
      const isHealthy = await this.checkBackendHealth();
      
      if (!isHealthy && !this.backendProcess) {
        console.log('⚠ Backend not responding and no process running, attempting restart...');
        await this.startBackend();
      } else if (!isHealthy && this.backendProcess) {
        console.log('⚠ Backend not responding but process exists');
      } else if (isHealthy && !this.isRunning) {
        console.log('✓ Backend is healthy');
        this.isRunning = true;
        this.restartCount = 0;
      }
    }, this.checkInterval);
    
    console.log(`✓ Monitoring started (checking every ${this.checkInterval / 1000}s)`);
  }
  
  /**
   * Stop the backend
   */
  async stop() {
    console.log('Stopping backend...');
    
    if (this.backendProcess) {
      this.backendProcess.kill('SIGTERM');
      await this.sleep(2000);
      
      if (this.backendProcess) {
        this.backendProcess.kill('SIGKILL');
      }
      
      this.backendProcess = null;
    }
    
    this.isRunning = false;
    console.log('✓ Backend stopped');
  }
  
  /**
   * Get status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      restartCount: this.restartCount,
      maxRestarts: this.maxRestarts,
      lastHealthCheck: this.lastHealthCheck,
      backendScript: this.backendScript,
      backendPort: this.backendPort
    };
  }
  
  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  if (autoStart) {
    await autoStart.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (autoStart) {
    await autoStart.stop();
  }
  process.exit(0);
});

// Start if run directly
if (require.main === module) {
  const autoStart = new BackendAutoStart();
  autoStart.start().catch(console.error);
} else {
  module.exports = BackendAutoStart;
}
