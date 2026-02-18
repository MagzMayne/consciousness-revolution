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
 * File: start-all-servers.js
 * Declaration ID: IP-25D57D22-MLL28ZWH
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

/** SIGNED BY MeRLynn - ID: MERLYNN-0fed77ab - TIMESTAMP: 2025-12-19T05:53:06.547Z - HASH: 10cc9592 */
/** SIGNED BY AGentR - ID: AGENTR-4f1d1688 - TIMESTAMP: 2025-12-19T05:53:06.547Z - HASH: 10cc9592 */

/**
 * UNIVERSAL SERVER STARTUP SCRIPT
 * Automatically detects and starts all server instances across projects
 * Works for Node.js, Python, and static file servers
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

const log = {
    info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`)
};

// Server configurations
const serverConfigs = [
    {
        name: 'Mandem.OS Workspace Server',
        directory: 'mandem.os/workspace',
        serverFile: 'server.js',
        port: 3000,
        type: 'node',
        autoInstall: true
    },
    {
        name: 'Ember Terminal Server',
        directory: 'ember-terminal-main/ember-terminal-main',
        serverFile: 'server.js',
        port: 3001,
        type: 'node',
        autoInstall: true
    },
    {
        name: 'Ember Terminal Relay',
        directory: 'ember-terminal-main/ember-terminal-main',
        serverFile: 'relay-server.js',
        port: 3002,
        type: 'node',
        autoInstall: false
    },
    {
        name: 'Main Site Static Server',
        directory: '.',
        port: 8080,
        type: 'static'
    }
];

// Active server processes
const activeServers = [];

// Check if port is available
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.listen(port, '0.0.0.0', () => {
            server.close(() => resolve(true));
        });
        server.on('error', () => resolve(false));
    });
}

// Install npm dependencies
async function installDependencies(directory) {
    return new Promise((resolve, reject) => {
        log.info(`Installing dependencies in ${directory}...`);
        
        const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        const install = spawn(npm, ['install'], {
            cwd: directory,
            stdio: 'inherit',
            shell: true
        });

        install.on('close', (code) => {
            if (code === 0) {
                log.success(`Dependencies installed in ${directory}`);
                resolve();
            } else {
                log.warning(`Failed to install dependencies in ${directory}`);
                resolve(); // Don't reject, try to continue
            }
        });

        install.on('error', (error) => {
            log.warning(`Error installing dependencies: ${error.message}`);
            resolve(); // Don't reject, try to continue
        });
    });
}

// Start Node.js server
async function startNodeServer(config) {
    const serverPath = path.join(__dirname, config.directory, config.serverFile);
    
    if (!fs.existsSync(serverPath)) {
        log.error(`Server file not found: ${serverPath}`);
        return null;
    }

    // Check if package.json exists and install dependencies if needed
    const packageJsonPath = path.join(__dirname, config.directory, 'package.json');
    if (config.autoInstall && fs.existsSync(packageJsonPath)) {
        const nodeModulesPath = path.join(__dirname, config.directory, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
            await installDependencies(path.join(__dirname, config.directory));
        }
    }

    // Check if port is available
    const portAvailable = await isPortAvailable(config.port);
    if (!portAvailable) {
        log.warning(`Port ${config.port} already in use for ${config.name}`);
        return null;
    }

    log.info(`Starting ${config.name} on port ${config.port}...`);

    const serverProcess = spawn('node', [config.serverFile], {
        cwd: path.join(__dirname, config.directory),
        env: { ...process.env, PORT: config.port },
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`[${config.name}] ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`[${config.name}] ${colors.red}${data.toString().trim()}${colors.reset}`);
    });

    serverProcess.on('close', (code) => {
        log.warning(`${config.name} exited with code ${code}`);
        // Remove from active servers
        const index = activeServers.indexOf(serverProcess);
        if (index > -1) {
            activeServers.splice(index, 1);
        }
    });

    serverProcess.on('error', (error) => {
        log.error(`Failed to start ${config.name}: ${error.message}`);
    });

    // Wait a bit to see if it starts successfully
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!serverProcess.killed) {
        log.success(`${config.name} started on http://localhost:${config.port}`);
        activeServers.push(serverProcess);
        return serverProcess;
    }

    return null;
}

// Start static file server
async function startStaticServer(config) {
    const portAvailable = await isPortAvailable(config.port);
    if (!portAvailable) {
        log.warning(`Port ${config.port} already in use for ${config.name}`);
        return null;
    }

    log.info(`Starting ${config.name} on port ${config.port}...`);

    const server = http.createServer((request, response) => {
        return handler(request, response, {
            public: path.join(__dirname, config.directory),
            cleanUrls: false,
            directoryListing: true
        });
    });

    server.listen(config.port, () => {
        log.success(`${config.name} started on http://localhost:${config.port}`);
    });

    server.on('error', (error) => {
        log.error(`Failed to start ${config.name}: ${error.message}`);
    });

    activeServers.push(server);
    return server;
}

// Start all servers
async function startAllServers() {
    log.title('🚀 BARBRICKDESIGN SERVER STARTUP');
    log.info('Detecting and starting all servers...\n');

    for (const config of serverConfigs) {
        try {
            if (config.type === 'node') {
                await startNodeServer(config);
            } else if (config.type === 'static') {
                await startStaticServer(config);
            }
        } catch (error) {
            log.error(`Error starting ${config.name}: ${error.message}`);
        }
        
        // Small delay between server starts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    log.title('✅ ALL SERVERS STARTED');
    log.info('Active servers:');
    serverConfigs.forEach((config, i) => {
        if (i < activeServers.length) {
            console.log(`  • ${config.name}: http://localhost:${config.port}`);
        }
    });

    log.info('\nPress Ctrl+C to stop all servers\n');
}

// Graceful shutdown
function shutdown() {
    log.title('\n🛑 SHUTTING DOWN ALL SERVERS');
    
    activeServers.forEach((server) => {
        if (server.kill) {
            server.kill('SIGTERM');
        } else if (server.close) {
            server.close();
        }
    });

    setTimeout(() => {
        log.success('All servers stopped');
        process.exit(0);
    }, 2000);
}

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    log.error(`Uncaught exception: ${error.message}`);
    console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
});

// Check if serve-handler is installed
function checkDependencies() {
    try {
        require.resolve('serve-handler');
        return true;
    } catch (e) {
        log.warning('serve-handler not installed. Installing...');
        return false;
    }
}

// Main execution
async function main() {
    if (!checkDependencies()) {
        log.info('Installing required dependencies...');
        await new Promise((resolve) => {
            const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
            const install = spawn(npm, ['install', 'serve-handler'], {
                stdio: 'inherit',
                shell: true
            });
            install.on('close', resolve);
        });
    }

    await startAllServers();
}

// Run if executed directly
if (require.main === module) {
    main().catch(error => {
        log.error(`Fatal error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { startAllServers, startNodeServer, startStaticServer };
