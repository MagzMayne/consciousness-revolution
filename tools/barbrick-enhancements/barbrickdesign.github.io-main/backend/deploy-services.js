#!/usr/bin/env node

/**
 * BankSky Backend Deployment Script
 * Deploys all microservices with self-healing and auto-logging
 * Supports Vercel, Netlify, and traditional Node.js deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class BackendDeployer {
  constructor() {
    this.services = ['micro-tx', 'anchor', 'affiliate', 'relayer'];
    this.deployedServices = new Map();
    this.healthChecks = new Map();
    this.isDev = process.argv.includes('--dev');
    this.shouldDeploy = process.argv.includes('--deploy');
  }

  async deploy() {
    console.log('🚀 BankSky Backend Deployment Starting...');
    console.log(`Mode: ${this.isDev ? 'Development' : 'Production'}`);
    console.log(`Deploy: ${this.shouldDeploy ? 'Yes' : 'No'}\n`);

    try {
      // Install dependencies
      await this.installDependencies();

      // Deploy services
      for (const service of this.services) {
        await this.deployService(service);
      }

      // Start health monitoring
      this.startHealthMonitoring();

      // Start auto-logging
      this.startAutoLogging();

      console.log('\n✅ All services deployed successfully!');
      console.log('🔍 Health monitoring active');
      console.log('📊 Auto-logging active');
      console.log('\n🌐 Service URLs:');
      for (const [service, url] of this.deployedServices) {
        console.log(`  ${service}: ${url}`);
      }

    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      await this.rollback();
      process.exit(1);
    }
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');

    try {
      execSync('npm install', { stdio: 'inherit', cwd: __dirname });
      console.log('✅ Dependencies installed');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  async deployService(serviceName) {
    console.log(`\n🔧 Deploying ${serviceName} service...`);

    const servicePath = path.join(__dirname, 'services', `${serviceName}.js`);

    if (!fs.existsSync(servicePath)) {
      throw new Error(`Service file not found: ${servicePath}`);
    }

    if (this.shouldDeploy) {
      // Deploy to Vercel/Netlify
      const url = await this.deployToCloud(serviceName, servicePath);
      this.deployedServices.set(serviceName, url);
    } else {
      // Run locally
      const port = await this.startLocalService(serviceName, servicePath);
      const url = `http://localhost:${port}`;
      this.deployedServices.set(serviceName, url);
    }

    console.log(`✅ ${serviceName} deployed: ${this.deployedServices.get(serviceName)}`);
  }

  async deployToCloud(serviceName, servicePath) {
    // Deploy to Vercel (can be modified for Netlify)
    const vercelConfig = {
      version: 2,
      builds: [{ src: `${serviceName}.js`, use: '@vercel/node' }],
      routes: [{ src: '/(.*)', dest: `/${serviceName}.js` }]
    };

    fs.writeFileSync(
      path.join(path.dirname(servicePath), 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    );

    try {
      const output = execSync('npx vercel --prod --yes', {
        cwd: path.dirname(servicePath),
        encoding: 'utf8'
      });

      // Extract URL from output
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      if (!urlMatch) throw new Error('Could not extract deployment URL');

      return urlMatch[0];
    } catch (error) {
      throw new Error(`Vercel deployment failed: ${error.message}`);
    }
  }

  async startLocalService(serviceName, servicePath) {
    const port = 3000 + this.services.indexOf(serviceName);

    const child = spawn('node', [servicePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PORT: port.toString() }
    });

    // Monitor service health
    child.on('error', (error) => {
      console.error(`${serviceName} service error:`, error);
      this.restartService(serviceName, servicePath, port);
    });

    child.stdout.on('data', (data) => {
      console.log(`[${serviceName}] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`[${serviceName}] ${data.toString().trim()}`);
    });

    // Store process reference for monitoring
    this.deployedServices.set(`${serviceName}_process`, child);

    return port;
  }

  async restartService(serviceName, servicePath, port) {
    console.log(`🔄 Restarting ${serviceName} service...`);

    const processKey = `${serviceName}_process`;
    if (this.deployedServices.has(processKey)) {
      this.deployedServices.get(processKey).kill();
    }

    await this.startLocalService(serviceName, servicePath);
    console.log(`✅ ${serviceName} service restarted`);
  }

  startHealthMonitoring() {
    console.log('\n🏥 Starting health monitoring...');

    // Check all services every 30 seconds
    setInterval(async () => {
      for (const [serviceName, url] of this.deployedServices) {
        if (!serviceName.includes('_process')) {
          try {
            const response = await fetch(url);
            const isHealthy = response.ok;

            this.healthChecks.set(serviceName, {
              status: isHealthy ? 'healthy' : 'unhealthy',
              lastCheck: Date.now(),
              responseTime: Date.now() - Date.now() // Simplified
            });

            if (!isHealthy) {
              console.warn(`⚠️  ${serviceName} service unhealthy`);
              // Trigger self-healing
              await this.attemptServiceRecovery(serviceName);
            }
          } catch (error) {
            this.healthChecks.set(serviceName, {
              status: 'error',
              lastCheck: Date.now(),
              error: error.message
            });
            console.error(`❌ ${serviceName} service error:`, error.message);
          }
        }
      }
    }, 30000);
  }

  async attemptServiceRecovery(serviceName) {
    console.log(`🔧 Attempting to recover ${serviceName} service...`);

    if (this.shouldDeploy) {
      // Redeploy to cloud
      const servicePath = path.join(__dirname, 'services', `${serviceName}.js`);
      try {
        const newUrl = await this.deployToCloud(serviceName, servicePath);
        this.deployedServices.set(serviceName, newUrl);
        console.log(`✅ ${serviceName} service recovered: ${newUrl}`);
      } catch (error) {
        console.error(`❌ ${serviceName} recovery failed:`, error.message);
      }
    } else {
      // Restart local service
      const servicePath = path.join(__dirname, 'services', `${serviceName}.js`);
      await this.restartService(serviceName, servicePath, 3000 + this.services.indexOf(serviceName));
    }
  }

  startAutoLogging() {
    console.log('\n📊 Starting auto-logging...');

    // Log system status every 5 minutes
    setInterval(() => {
      this.logSystemStatus();
    }, 5 * 60 * 1000);

    // Log service health every 10 minutes
    setInterval(() => {
      this.logServiceHealth();
    }, 10 * 60 * 1000);

    // Log performance metrics every 15 minutes
    setInterval(() => {
      this.logPerformanceMetrics();
    }, 15 * 60 * 1000);
  }

  logSystemStatus() {
    const status = {
      timestamp: new Date().toISOString(),
      services: Object.fromEntries(this.deployedServices),
      health: Object.fromEntries(this.healthChecks),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };

    console.log('📊 System Status:', JSON.stringify(status, null, 2));
  }

  logServiceHealth() {
    const healthy = Array.from(this.healthChecks.values()).filter(h => h.status === 'healthy').length;
    const total = this.healthChecks.size;

    console.log(`🏥 Service Health: ${healthy}/${total} services healthy`);

    for (const [service, health] of this.healthChecks) {
      if (health.status !== 'healthy') {
        console.warn(`⚠️  ${service}: ${health.status} - ${health.error || 'Unknown error'}`);
      }
    }
  }

  logPerformanceMetrics() {
    const metrics = {
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      services: this.healthChecks.size,
      deployments: this.deployedServices.size
    };

    console.log('📈 Performance Metrics:', metrics);
  }

  async rollback() {
    console.log('\n🔄 Rolling back deployment...');

    // Kill all local processes
    for (const [key, value] of this.deployedServices) {
      if (key.includes('_process')) {
        value.kill();
      }
    }

    console.log('✅ Rollback completed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  const deployer = new BackendDeployer();
  await deployer.rollback();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  const deployer = new BackendDeployer();
  await deployer.rollback();
  process.exit(0);
});

// Start deployment
const deployer = new BackendDeployer();
deployer.deploy().catch(console.error);
