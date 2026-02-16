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
 * File: command-executor.js
 * Declaration ID: IP-545BFB3E-MLL28ZUL
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

/** SIGNED BY MeRLynn - ID: MERLYNN-759f10ce - TIMESTAMP: 2025-12-19T05:53:06.512Z - HASH: 243fc7e1 */
/** SIGNED BY AGentR - ID: AGENTR-22b7dc5b - TIMESTAMP: 2025-12-19T05:53:06.512Z - HASH: 243fc7e1 */

// BankSky Command Execution Service
// Handles system command execution for deployment and maintenance
// This is a simplified version for local development

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3005; // Different port from other services

app.use(cors());
app.use(express.json());

// Command execution endpoint
app.post('/api/execute', async (req, res) => {
  try {
    const { command, cwd = '.', timeout = 30000 } = req.body;

    console.log(`Executing: ${command} (cwd: ${cwd})`);

    // For security, only allow specific commands in development
    const allowedCommands = [
      'node --version',
      'npm --version',
      'mkdir',
      'echo',
      'taskkill',
      'rmdir'
    ];

    const isAllowed = allowedCommands.some(allowed =>
      command.includes(allowed) || command.startsWith('"')
    );

    if (!isAllowed) {
      return res.json({
        success: false,
        error: 'Command not allowed',
        output: 'Command blocked for security'
      });
    }

    // Execute command
    exec(command, {
      cwd: path.resolve(cwd),
      timeout: timeout,
      maxBuffer: 1024 * 1024 // 1MB buffer
    }, (error, stdout, stderr) => {
      const success = !error;
      const output = stdout || stderr || '';

      console.log(`Command result: ${success ? 'SUCCESS' : 'FAILED'}`);
      if (output) console.log(`Output: ${output.substring(0, 200)}...`);

      res.json({
        success,
        output: output.trim(),
        error: error ? error.message : null
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'command-executor',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🔧 Command Executor Service running on port ${PORT}`);
  console.log(`📡 Ready to execute deployment commands`);
});
