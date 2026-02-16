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
 * File: email-service.js
 * Declaration ID: IP-51E97E0D-MLL28ZUL
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
 * Email Service API for emailDashboard.html
 * Provides email sending, tracking, and confirmation endpoints
 * Integrates with masterSystem.html for lead management
 * 
 * @author Barbrick Design
 * @date 2026-02-03
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let emails = [];
let leads = [];

// Data persistence file paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const EMAILS_FILE = path.join(DATA_DIR, 'emails.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

/**
 * Initialize data directory and load existing data
 */
async function initializeData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Load emails
    try {
      const emailData = await fs.readFile(EMAILS_FILE, 'utf8');
      emails = JSON.parse(emailData);
      console.log(`Loaded ${emails.length} emails from storage`);
    } catch (error) {
      console.log('No existing email data found, starting fresh');
      emails = [];
    }
    
    // Load leads
    try {
      const leadData = await fs.readFile(LEADS_FILE, 'utf8');
      leads = JSON.parse(leadData);
      console.log(`Loaded ${leads.length} leads from storage`);
    } catch (error) {
      console.log('No existing lead data found, starting fresh');
      leads = [];
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

/**
 * Save data to disk
 */
async function saveData() {
  try {
    await fs.writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2));
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

/**
 * Generate unique ID
 */
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * POST /send-email
 * Send a tracked email
 */
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, meta = {} } = req.body;
    
    if (!to || !subject) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject' 
      });
    }
    
    const emailId = generateId();
    const trackingToken = crypto.randomBytes(16).toString('hex');
    
    // Create tracking URL (will be hosted on the same domain)
    const trackingUrl = `${req.protocol}://${req.get('host')}/email/confirm/${trackingToken}`;
    
    // Add tracking link to email body
    const bodyWithTracking = html + `
      <br/><br/>
      <p style="font-size: 11px; color: #999;">
        <a href="${trackingUrl}" style="color: #4ade80;">Confirm receipt of this email</a>
      </p>
    `;
    
    // Create email record
    const email = {
      id: emailId,
      to_email: to,
      subject,
      html: bodyWithTracking,
      text,
      status: 'sent',
      sent_at: new Date().toISOString(),
      confirmed_at: null,
      tracking_token: trackingToken,
      meta: {
        ...meta,
        ip: req.ip,
        user_agent: req.get('user-agent')
      }
    };
    
    emails.push(email);
    await saveData();
    
    // In a real implementation, you would send the email via SMTP or email service
    // For now, we'll simulate the send
    console.log(`📧 Email sent: ${emailId} to ${to} - Subject: ${subject}`);
    
    res.json({
      success: true,
      id: emailId,
      trackingUrl,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email' 
    });
  }
});

/**
 * GET /emails
 * Get all emails
 */
app.get('/emails', (req, res) => {
  try {
    // Sort by sent_at descending
    const sortedEmails = [...emails].sort((a, b) => {
      const dateA = new Date(a.sent_at || 0).getTime();
      const dateB = new Date(b.sent_at || 0).getTime();
      return dateB - dateA;
    });
    
    res.json(sortedEmails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

/**
 * GET /email/confirm/:token
 * Confirm email receipt (tracking link)
 */
app.get('/email/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const email = emails.find(e => e.tracking_token === token);
    
    if (!email) {
      return res.status(404).send(`
        <html>
          <head><title>Email Not Found</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1>❌ Email Not Found</h1>
            <p>The email tracking link is invalid or expired.</p>
          </body>
        </html>
      `);
    }
    
    // Mark as confirmed if not already
    if (!email.confirmed_at) {
      email.status = 'confirmed';
      email.confirmed_at = new Date().toISOString();
      await saveData();
      
      console.log(`✅ Email confirmed: ${email.id} - ${email.to_email}`);
    }
    
    res.send(`
      <html>
        <head>
          <title>Email Confirmed</title>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: system-ui; padding: 40px; text-align: center; background: #0b1020; color: #e5e7eb;">
          <div style="max-width: 500px; margin: 0 auto; background: #151a2c; padding: 40px; border-radius: 10px;">
            <h1 style="color: #4ade80; margin: 0 0 20px;">✅ Email Confirmed</h1>
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for confirming receipt of this email!
            </p>
            <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
              Email ID: <code style="background: #0b1020; padding: 4px 8px; border-radius: 4px;">${email.id}</code>
            </p>
          </div>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(500).send('Error confirming email');
  }
});

/**
 * POST /leads
 * Create a new lead
 */
app.post('/leads', async (req, res) => {
  try {
    const { name, email, company, status = 'new', source = 'unknown' } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }
    
    const leadId = generateId();
    
    const lead = {
      id: leadId,
      name: name || 'Unknown',
      email,
      company: company || '',
      status,
      source,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      threads: [],
      objectives: [],
      next_actions: [],
      revenue: 0,
      meta: {}
    };
    
    leads.push(lead);
    await saveData();
    
    console.log(`👤 Lead created: ${leadId} - ${email}`);
    
    res.json({
      success: true,
      lead
    });
    
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create lead' 
    });
  }
});

/**
 * GET /leads
 * Get all leads
 */
app.get('/leads', (req, res) => {
  try {
    // Sort by updated_at descending
    const sortedLeads = [...leads].sort((a, b) => {
      const dateA = new Date(a.updated_at || 0).getTime();
      const dateB = new Date(b.updated_at || 0).getTime();
      return dateB - dateA;
    });
    
    res.json(sortedLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

/**
 * GET /leads/:id
 * Get a specific lead
 */
app.get('/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    const lead = leads.find(l => l.id === id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

/**
 * PATCH /leads/:id
 * Update a lead
 */
app.patch('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const leadIndex = leads.findIndex(l => l.id === id);
    
    if (leadIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lead not found' 
      });
    }
    
    // Update lead
    leads[leadIndex] = {
      ...leads[leadIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await saveData();
    
    console.log(`📝 Lead updated: ${id}`);
    
    res.json({
      success: true,
      lead: leads[leadIndex]
    });
    
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update lead' 
    });
  }
});

/**
 * POST /leads/:id/threads
 * Add a thread to a lead
 */
app.post('/leads/:id/threads', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, author = 'agent', type = 'note' } = req.body;
    
    const lead = leads.find(l => l.id === id);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lead not found' 
      });
    }
    
    const thread = {
      id: generateId(),
      message,
      author,
      type,
      timestamp: new Date().toISOString()
    };
    
    lead.threads = lead.threads || [];
    lead.threads.push(thread);
    lead.updated_at = new Date().toISOString();
    
    await saveData();
    
    console.log(`💬 Thread added to lead ${id}: ${message.substring(0, 50)}...`);
    
    res.json({
      success: true,
      thread
    });
    
  } catch (error) {
    console.error('Error adding thread:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add thread' 
    });
  }
});

/**
 * GET /stats
 * Get system statistics
 */
app.get('/stats', (req, res) => {
  try {
    const totalEmails = emails.length;
    const confirmedEmails = emails.filter(e => e.status === 'confirmed').length;
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => l.status === 'active' || l.status === 'engaged').length;
    const totalRevenue = leads.reduce((sum, l) => sum + (l.revenue || 0), 0);
    
    res.json({
      emails: {
        total: totalEmails,
        confirmed: confirmedEmails,
        confirmationRate: totalEmails > 0 ? (confirmedEmails / totalEmails * 100).toFixed(2) : 0
      },
      leads: {
        total: totalLeads,
        active: activeLeads
      },
      revenue: {
        total: totalRevenue,
        formatted: `$${totalRevenue.toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'email-service',
    uptime: process.uptime(),
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
╔════════════════════════════════════════════════════╗
║   📧 Email Service API Started                     ║
║   Port: ${PORT}                                       ║
║   Dashboard: http://localhost:${PORT}/health          ║
║                                                    ║
║   Endpoints:                                       ║
║   POST   /send-email      - Send tracked email    ║
║   GET    /emails          - Get all emails        ║
║   GET    /email/confirm/  - Confirm email         ║
║   POST   /leads           - Create lead           ║
║   GET    /leads           - Get all leads         ║
║   GET    /leads/:id       - Get lead              ║
║   PATCH  /leads/:id       - Update lead           ║
║   POST   /leads/:id/threads - Add thread          ║
║   GET    /stats           - Get statistics        ║
║   GET    /health          - Health check          ║
╚════════════════════════════════════════════════════╝
    `);
  });
}

// Handle graceful shutdown
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
