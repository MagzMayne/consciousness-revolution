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
 * File: deploy-afactory-payments.js
 * Declaration ID: IP-1A5D1A8C-MLL28ZUQ
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
 * Deployment Script for aFactory Payment Automation
 * 
 * Helps deploy the payment automation backend service
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 aFactory Payment Automation Deployment Script\n');

// Check if we're in the right directory
const backendDir = path.join(__dirname, 'backend');
if (!fs.existsSync(backendDir)) {
    console.error('❌ Error: backend directory not found');
    console.error('   Please run this script from the repository root');
    process.exit(1);
}

// Check for required files
const requiredFiles = [
    'backend/services/afactory-payment-automation.js',
    'src/systems/afactory-payment-client.js'
];

for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, file))) {
        console.error(`❌ Error: Required file not found: ${file}`);
        process.exit(1);
    }
}

console.log('✅ All required files found\n');

// Check for .env file
const envPath = path.join(backendDir, '.env');
const envExamplePath = path.join(backendDir, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env file found in backend directory');
    console.log('   Creating from .env.example...\n');
    
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from example\n');
        console.log('⚠️  IMPORTANT: Edit backend/.env and add your PayPal credentials:\n');
        console.log('   PAYPAL_CLIENT_ID=your_client_id');
        console.log('   PAYPAL_SECRET=your_secret');
        console.log('   PAYPAL_MODE=sandbox  (or "live" for production)\n');
    }
}

// Add payment automation configuration to .env
console.log('📝 Updating .env with payment automation settings...\n');

const paymentConfig = `
# ============================================================================
# AFACTORY PAYMENT AUTOMATION
# ============================================================================

# PayPal Configuration for aFactory
# Get these from https://developer.paypal.com/dashboard/
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_SECRET=your_paypal_secret_here
PAYPAL_MODE=sandbox  # Use 'live' for production

# Payment Settings
MIN_PAYOUT=10.00
MAX_PAYOUT=10000.00
PAYOUT_SCHEDULE=threshold  # threshold, daily, weekly, monthly

# Security
AFACTORY_API_KEY=  # Will be auto-generated if empty
WEBHOOK_SECRET=  # Will be auto-generated if empty

# Service Port
PORT=3001
`;

// Only add if not already present
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('AFACTORY PAYMENT AUTOMATION')) {
    fs.appendFileSync(envPath, paymentConfig);
    console.log('✅ Added payment automation configuration to .env\n');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
if (majorVersion < 18) {
    console.warn(`⚠️  Warning: Node.js ${nodeVersion} detected. Version 18 or higher recommended.`);
    console.warn('   Continue? (Ctrl+C to cancel)\n');
}

// Install dependencies
console.log('📦 Checking backend dependencies...\n');

try {
    const packageJsonPath = path.join(backendDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if express is installed
    if (!packageJson.dependencies || !packageJson.dependencies.express) {
        console.log('Installing backend dependencies...');
        execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
        console.log('✅ Dependencies installed\n');
    } else {
        console.log('✅ Dependencies already installed\n');
    }
} catch (error) {
    console.error('❌ Error checking/installing dependencies:', error.message);
    process.exit(1);
}

// Test backend service
console.log('🧪 Testing backend service...\n');

try {
    console.log('Starting service for health check...');
    
    // Try to start the service briefly to test it
    const { spawn } = require('child_process');
    const servicePath = path.join(backendDir, 'services', 'afactory-payment-automation.js');
    
    const testProcess = spawn('node', [servicePath], {
        env: { ...process.env, PORT: 3001 },
        detached: false
    });
    
    let started = false;
    
    testProcess.stdout.on('data', (data) => {
        if (data.toString().includes('running on port')) {
            started = true;
            console.log('✅ Service started successfully\n');
            testProcess.kill();
        }
    });
    
    testProcess.stderr.on('data', (data) => {
        if (data.toString().includes('Error') || data.toString().includes('EADDRINUSE')) {
            console.warn('⚠️  Port 3001 may already be in use or configuration issue');
            testProcess.kill();
        }
    });
    
    setTimeout(() => {
        if (!started) {
            testProcess.kill();
            console.log('ℹ️  Service test timed out (may need configuration)\n');
        }
    }, 3000);
    
} catch (error) {
    console.warn('⚠️  Could not test service:', error.message);
    console.warn('   You may need to configure PayPal credentials first\n');
}

// Display next steps
console.log('\n' + '='.repeat(70));
console.log('🎉 Deployment preparation complete!\n');
console.log('Next Steps:\n');
console.log('1. Configure PayPal credentials in backend/.env:');
console.log('   - Get credentials from https://developer.paypal.com/dashboard/');
console.log('   - Set PAYPAL_CLIENT_ID and PAYPAL_SECRET');
console.log('   - Choose PAYPAL_MODE (sandbox for testing, live for production)\n');

console.log('2. Start the backend service:');
console.log('   cd backend');
console.log('   node services/afactory-payment-automation.js\n');

console.log('3. Open aFactory.html in your browser');
console.log('   - The page will automatically connect to backend');
console.log('   - Revenue will be synced for real PayPal payouts\n');

console.log('4. Monitor payments:');
console.log('   - Check console logs in backend');
console.log('   - View stats at http://localhost:3001/api/payments/health');
console.log('   - Monitor PayPal dashboard for actual payouts\n');

console.log('📚 Documentation:');
console.log('   - Setup guide: AFACTORY_PAYMENT_AUTOMATION.md');
console.log('   - API reference: See documentation in markdown file');
console.log('   - Support: BarbrickDesign@gmail.com\n');

console.log('⚠️  Security Reminders:');
console.log('   - Never commit .env file to git');
console.log('   - Use HTTPS in production');
console.log('   - Test with sandbox mode first');
console.log('   - Keep API keys secure\n');

console.log('='.repeat(70));
