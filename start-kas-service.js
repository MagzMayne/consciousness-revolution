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
 * File: start-kas-service.js
 * Declaration ID: IP-56F7BA23-MLL28ZWH
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Start KAS Service
 * Convenience script to start the Key Authority Service
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Key Authority Service (KAS)...\n');

// Path to the service
const servicePath = path.join(__dirname, 'backend', 'services', 'kas-service.js');

// Start the service
const service = spawn('node', [servicePath], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'development'
    }
});

service.on('error', (error) => {
    console.error('❌ Failed to start KAS service:', error);
    process.exit(1);
});

service.on('exit', (code) => {
    if (code !== 0) {
        console.error(`\n❌ KAS service exited with code ${code}`);
        process.exit(code);
    }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n⏹️  Stopping KAS service...');
    service.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('\n⏹️  Stopping KAS service...');
    service.kill('SIGINT');
    process.exit(0);
});
