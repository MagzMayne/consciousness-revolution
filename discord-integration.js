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
 * File: discord-integration.js
 * Declaration ID: IP-16277664-MLL28ZUQ
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
 * Discord Integration Helper
 * 
 * Helper module to integrate Discord notifications into existing scripts
 * Makes all repository scripts work seamlessly with Discord bot
 */

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'http://localhost:3010';

/**
 * Send notification to Discord
 * @param {string} type - Notification type (deployment, github, alert)
 * @param {object} data - Notification data
 */
async function sendDiscordNotification(type, data) {
  try {
    const endpoint = getWebhookEndpoint(type);
    const url = `${DISCORD_WEBHOOK_URL}${endpoint}`;
    
    await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    console.log(`✅ Discord notification sent: ${type}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Failed to send Discord notification:`, error);
    return false;
  }
}

/**
 * Get webhook endpoint for notification type
 */
function getWebhookEndpoint(type) {
  const endpoints = {
    deployment: '/webhook/deployment',
    github: '/webhook/github',
    alert: '/webhook/system',
    system: '/webhook/system'
  };
  
  return endpoints[type] || '/webhook/system';
}

/**
 * Notify deployment event
 */
async function notifyDeployment(service, status, message, details = {}) {
  return sendDiscordNotification('deployment', {
    service,
    status, // success, failed, pending
    message,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Notify GitHub event
 */
async function notifyGitHub(event, repository, action, details = {}) {
  return sendDiscordNotification('github', {
    event, // push, pull_request, issues, release
    repository,
    action,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Notify system alert
 */
async function notifyAlert(severity, message, details = {}) {
  return sendDiscordNotification('alert', {
    severity, // info, warning, error, critical
    message,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Check if Discord bot is available
 */
async function isDiscordAvailable() {
  try {
    const response = await axios.get(`${DISCORD_WEBHOOK_URL}/health`, {
      timeout: 3000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Wrap existing function with Discord notifications
 */
function withDiscordNotification(fn, service, description) {
  return async function(...args) {
    const startTime = Date.now();
    
    try {
      // Notify start
      await notifyDeployment(service, 'pending', `${description} started`);
      
      // Execute function
      const result = await fn(...args);
      
      // Notify success
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      await notifyDeployment(service, 'success', `${description} completed`, {
        duration: `${duration}s`
      });
      
      return result;
    } catch (error) {
      // Notify failure
      await notifyDeployment(service, 'failed', `${description} failed: ${error.message}`);
      throw error;
    }
  };
}

/**
 * Create Discord embed-style message
 */
function createMessage(title, description, fields = [], color = 'blue') {
  const colors = {
    blue: 0x0099FF,
    green: 0x00FF00,
    yellow: 0xFFAA00,
    red: 0xFF0000,
    purple: 0x9B59B6
  };
  
  return {
    title,
    description,
    fields,
    color: colors[color] || colors.blue,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  sendDiscordNotification,
  notifyDeployment,
  notifyGitHub,
  notifyAlert,
  isDiscordAvailable,
  withDiscordNotification,
  createMessage
};
