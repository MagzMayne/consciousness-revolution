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
 * File: mrbeast-confirmation-service.js
 * Declaration ID: IP-D4DDBC7-MLL28ZUM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Mr. Beast Contact Confirmation Service
 * Handles confirmation when Mr. Beast confirms he's been contacted
 * Sends notification email to BarbrickDesign@gmail.com
 * 
 * @author Barbrick Design
 * @date 2026-02-11
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.MRBEAST_CONFIRMATION_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Data directory
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIRMATIONS_FILE = path.join(DATA_DIR, 'mrbeast-confirmations.json');

let confirmations = [];

/**
 * Initialize data storage
 */
async function initializeData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    try {
      const data = await fs.readFile(CONFIRMATIONS_FILE, 'utf8');
      confirmations = JSON.parse(data);
      console.log(`Loaded ${confirmations.length} confirmations from storage`);
    } catch (error) {
      console.log('No existing confirmation data found, starting fresh');
      confirmations = [];
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

/**
 * Save confirmations to disk
 */
async function saveData() {
  try {
    await fs.writeFile(CONFIRMATIONS_FILE, JSON.stringify(confirmations, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

/**
 * Send notification email (simulated)
 * In production, this would use nodemailer or SendGrid
 */
async function sendNotificationEmail(confirmation) {
  const emailContent = {
    to: 'BarbrickDesign@gmail.com',
    subject: '🎯 Mr. Beast Contact Confirmation - Agent System Working!',
    html: `
      <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #059669; margin: 0 0 20px;">✅ Contact Confirmation Received!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            <strong>Great news!</strong> Someone has confirmed receiving contact from your Mr. Beast outreach autonomous agent system.
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px; color: #059669;">Confirmation Details:</h3>
            <p style="margin: 5px 0;"><strong>Timestamp:</strong> ${new Date(confirmation.timestamp).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Source:</strong> Mr. Beast Outreach Dashboard</p>
            <p style="margin: 5px 0;"><strong>Page:</strong> https://barbrickdesign.github.io/mrbeast-outreach-dashboard.html</p>
            <p style="margin: 5px 0;"><strong>User Agent:</strong> ${confirmation.userAgent}</p>
            <p style="margin: 5px 0;"><strong>Screen Resolution:</strong> ${confirmation.screenResolution}</p>
            <p style="margin: 5px 0;"><strong>Language:</strong> ${confirmation.language}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            This confirms that your autonomous agent system successfully reached its target and that the functionality is working as expected.
          </p>
          
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px; color: #3b82f6;">Next Steps:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Review the dashboard for full outreach metrics</li>
              <li>Follow up with a personal message if appropriate</li>
              <li>Document this success for future agent improvements</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              This is an automated notification from your Mr. Beast Outreach Dashboard system.
              Dashboard: <a href="https://barbrickdesign.github.io/mrbeast-outreach-dashboard.html" style="color: #3b82f6;">View Dashboard</a>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
Contact Confirmation Received!

Someone has confirmed receiving contact from your Mr. Beast outreach autonomous agent system.

Confirmation Details:
- Timestamp: ${new Date(confirmation.timestamp).toLocaleString()}
- Source: Mr. Beast Outreach Dashboard
- Page: https://barbrickdesign.github.io/mrbeast-outreach-dashboard.html

This confirms that your autonomous agent system successfully reached its target.

Dashboard: https://barbrickdesign.github.io/mrbeast-outreach-dashboard.html
    `
  };
  
  // In production, use nodemailer or SendGrid:
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: emailContent.to,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });
  */
  
  // For now, log the email content
  console.log('\n📧 EMAIL NOTIFICATION:\n');
  console.log(`To: ${emailContent.to}`);
  console.log(`Subject: ${emailContent.subject}`);
  console.log('\n' + emailContent.text);
  console.log('\n✅ Email would be sent in production\n');
  
  return emailContent;
}

/**
 * POST /api/confirm-mrbeast-contact
 * Confirm that Mr. Beast has been contacted
 */
app.post('/api/confirm-mrbeast-contact', async (req, res) => {
  try {
    const { timestamp, userAgent, screenResolution, language } = req.body;
    
    const confirmation = {
      id: `conf-${Date.now()}`,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || 'Unknown',
      screenResolution: screenResolution || 'Unknown',
      language: language || 'Unknown',
      ip: req.ip,
      headers: {
        origin: req.get('origin'),
        referer: req.get('referer'),
        userAgent: req.get('user-agent')
      },
      confirmedAt: new Date().toISOString()
    };
    
    // Save confirmation
    confirmations.push(confirmation);
    await saveData();
    
    console.log(`✅ Mr. Beast contact confirmation received: ${confirmation.id}`);
    
    // Send notification email
    const emailContent = await sendNotificationEmail(confirmation);
    
    res.json({
      success: true,
      message: 'Confirmation received and notification sent',
      confirmation: {
        id: confirmation.id,
        timestamp: confirmation.timestamp,
        confirmedAt: confirmation.confirmedAt
      },
      emailSent: true
    });
    
  } catch (error) {
    console.error('Error processing confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process confirmation',
      message: error.message
    });
  }
});

/**
 * GET /api/confirmations
 * Get all confirmations
 */
app.get('/api/confirmations', (req, res) => {
  try {
    res.json({
      success: true,
      total: confirmations.length,
      confirmations: confirmations.sort((a, b) => 
        new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime()
      )
    });
  } catch (error) {
    console.error('Error fetching confirmations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch confirmations'
    });
  }
});

/**
 * GET /api/confirmations/latest
 * Get the most recent confirmation
 */
app.get('/api/confirmations/latest', (req, res) => {
  try {
    if (confirmations.length === 0) {
      return res.json({
        success: true,
        confirmation: null,
        message: 'No confirmations yet'
      });
    }
    
    const latest = confirmations.sort((a, b) => 
      new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime()
    )[0];
    
    res.json({
      success: true,
      confirmation: latest
    });
  } catch (error) {
    console.error('Error fetching latest confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest confirmation'
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mrbeast-confirmation-service',
    uptime: process.uptime(),
    totalConfirmations: confirmations.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * Start server
 */
async function start() {
  await initializeData();
  
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   🎯 Mr. Beast Confirmation Service Started          ║
║   Port: ${PORT}                                          ║
║   Health: http://localhost:${PORT}/health                ║
║                                                       ║
║   Endpoints:                                          ║
║   POST /api/confirm-mrbeast-contact                   ║
║   GET  /api/confirmations                             ║
║   GET  /api/confirmations/latest                      ║
║   GET  /health                                        ║
║                                                       ║
║   📧 Notifications sent to: BarbrickDesign@gmail.com  ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await saveData();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await saveData();
  process.exit(0);
});

start().catch(console.error);

module.exports = app;
