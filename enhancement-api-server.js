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
 * File: enhancement-api-server.js
 * Declaration ID: IP-3F9A20E0-MLL28ZUS
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

/**
 * ENHANCEMENT API SERVER
 * ======================
 * 
 * Simple HTTP server that provides API endpoints for triggering enhancement agents
 * from the functionality-dashboard.html
 * 
 * ENDPOINTS:
 * - POST /api/trigger-scoring       - Run functionality scoring system
 * - POST /api/trigger-enhancement   - Deploy enhancement agents
 * - POST /api/trigger-auto-iterate  - Run auto-iteration system
 * - GET  /api/status                - Get current enhancement loop status
 * 
 * USAGE:
 * - node enhancement-api-server.js              # Start server on port 3456
 * - node enhancement-api-server.js --port 8080  # Custom port
 */

const http = require('http');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.argv.includes('--port') 
    ? parseInt(process.argv[process.argv.indexOf('--port') + 1]) || 3456
    : 3456;

const repoPath = __dirname;
let activeProcesses = {
    scoring: null,
    enhancement: null,
    autoIterate: null
};

// Logger
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = {
        INFO: 'ℹ️',
        SUCCESS: '✅',
        ERROR: '❌',
        WARNING: '⚠️',
        ACTION: '🔧'
    }[level] || '📝';
    
    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    console.log(logMessage);
}

// CORS headers for all responses
function setCORSHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Trigger functionality scoring
async function triggerScoring() {
    return new Promise((resolve, reject) => {
        log('Triggering functionality scoring system...', 'ACTION');
        
        try {
            const scorerPath = path.join(repoPath, 'functionality-scoring-system.js');
            if (!fs.existsSync(scorerPath)) {
                reject(new Error('Scoring system not found'));
                return;
            }
            
            // Run scoring in background
            const process = spawn('node', [scorerPath], {
                cwd: repoPath,
                stdio: 'pipe'
            });
            
            activeProcesses.scoring = process;
            
            process.on('close', (code) => {
                activeProcesses.scoring = null;
                if (code === 0) {
                    log('Functionality scoring completed successfully', 'SUCCESS');
                    resolve({ success: true, message: 'Scoring completed' });
                } else {
                    log(`Scoring exited with code ${code}`, 'WARNING');
                    resolve({ success: false, message: `Scoring exited with code ${code}` });
                }
            });
            
            process.on('error', (error) => {
                activeProcesses.scoring = null;
                log(`Scoring error: ${error.message}`, 'ERROR');
                reject(error);
            });
            
            // Return immediately - process runs in background
            setTimeout(() => {
                resolve({ success: true, message: 'Scoring started in background' });
            }, 1000);
            
        } catch (error) {
            log(`Failed to trigger scoring: ${error.message}`, 'ERROR');
            reject(error);
        }
    });
}

// Trigger enhancement agents
async function triggerEnhancement(criticalCount = 0, improvementCount = 0) {
    return new Promise((resolve, reject) => {
        log(`Triggering enhancement agents (${criticalCount} critical, ${improvementCount} improvement)...`, 'ACTION');
        
        try {
            const agentPath = path.join(repoPath, 'project-enhancement-agent.js');
            if (!fs.existsSync(agentPath)) {
                reject(new Error('Enhancement agent not found'));
                return;
            }
            
            // Run enhancement agent in background
            const process = spawn('node', [agentPath], {
                cwd: repoPath,
                stdio: 'pipe'
            });
            
            activeProcesses.enhancement = process;
            
            process.on('close', (code) => {
                activeProcesses.enhancement = null;
                if (code === 0) {
                    log('Enhancement agents completed successfully', 'SUCCESS');
                    resolve({ success: true, message: 'Enhancement completed' });
                } else {
                    log(`Enhancement exited with code ${code}`, 'WARNING');
                    resolve({ success: false, message: `Enhancement exited with code ${code}` });
                }
            });
            
            process.on('error', (error) => {
                activeProcesses.enhancement = null;
                log(`Enhancement error: ${error.message}`, 'ERROR');
                reject(error);
            });
            
            // Return immediately
            setTimeout(() => {
                resolve({ 
                    success: true, 
                    message: `Enhancement agents deployed for ${criticalCount + improvementCount} projects` 
                });
            }, 1000);
            
        } catch (error) {
            log(`Failed to trigger enhancement: ${error.message}`, 'ERROR');
            reject(error);
        }
    });
}

// Trigger auto-iteration
async function triggerAutoIterate() {
    return new Promise((resolve, reject) => {
        log('Triggering auto-iteration system...', 'ACTION');
        
        try {
            const iteratePath = path.join(repoPath, 'auto-iterate-system.js');
            if (!fs.existsSync(iteratePath)) {
                reject(new Error('Auto-iterate system not found'));
                return;
            }
            
            // Run auto-iterate in background
            const process = spawn('node', [iteratePath], {
                cwd: repoPath,
                stdio: 'pipe'
            });
            
            activeProcesses.autoIterate = process;
            
            process.on('close', (code) => {
                activeProcesses.autoIterate = null;
                if (code === 0) {
                    log('Auto-iteration completed successfully', 'SUCCESS');
                    resolve({ success: true, message: 'Auto-iteration completed' });
                } else {
                    log(`Auto-iteration exited with code ${code}`, 'WARNING');
                    resolve({ success: false, message: `Auto-iteration exited with code ${code}` });
                }
            });
            
            process.on('error', (error) => {
                activeProcesses.autoIterate = null;
                log(`Auto-iteration error: ${error.message}`, 'ERROR');
                reject(error);
            });
            
            // Return immediately
            setTimeout(() => {
                resolve({ success: true, message: 'Auto-iteration started' });
            }, 1000);
            
        } catch (error) {
            log(`Failed to trigger auto-iterate: ${error.message}`, 'ERROR');
            reject(error);
        }
    });
}

// Get current status
function getStatus() {
    return {
        scoring: activeProcesses.scoring ? 'running' : 'idle',
        enhancement: activeProcesses.enhancement ? 'running' : 'idle',
        autoIterate: activeProcesses.autoIterate ? 'running' : 'idle',
        timestamp: new Date().toISOString()
    };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    setCORSHeaders(res);
    
    // Handle OPTIONS for CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Parse URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Route: GET /api/status
    if (url.pathname === '/api/status' && req.method === 'GET') {
        const status = getStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
        return;
    }
    
    // Route: POST /api/trigger-scoring
    if (url.pathname === '/api/trigger-scoring' && req.method === 'POST') {
        try {
            const result = await triggerScoring();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
        return;
    }
    
    // Route: POST /api/trigger-enhancement
    if (url.pathname === '/api/trigger-enhancement' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                const result = await triggerEnhancement(
                    data.criticalCount || 0,
                    data.improvementCount || 0
                );
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }
    
    // Route: POST /api/trigger-auto-iterate
    if (url.pathname === '/api/trigger-auto-iterate' && req.method === 'POST') {
        try {
            const result = await triggerAutoIterate();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
        return;
    }
    
    // 404 for all other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
    log(`🚀 Enhancement API Server running on port ${PORT}`, 'SUCCESS');
    log('', 'INFO');
    log('Available endpoints:', 'INFO');
    log(`  POST http://localhost:${PORT}/api/trigger-scoring`, 'INFO');
    log(`  POST http://localhost:${PORT}/api/trigger-enhancement`, 'INFO');
    log(`  POST http://localhost:${PORT}/api/trigger-auto-iterate`, 'INFO');
    log(`  GET  http://localhost:${PORT}/api/status`, 'INFO');
    log('', 'INFO');
    log('Press Ctrl+C to stop', 'INFO');
});

// Graceful shutdown
process.on('SIGINT', () => {
    log('', 'INFO');
    log('Shutting down server...', 'WARNING');
    
    // Kill active processes
    Object.values(activeProcesses).forEach(proc => {
        if (proc) proc.kill();
    });
    
    server.close(() => {
        log('Server stopped', 'SUCCESS');
        process.exit(0);
    });
});

module.exports = { server };
