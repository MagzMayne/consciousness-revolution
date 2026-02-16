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
 * File: ultrasound-api.js
 * Declaration ID: IP-61C09639-MLL28ZUN
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Backend API for Ultrasound Python Analysis Bridge
 * 
 * This Express.js server provides endpoints for:
 * - Executing Python analysis scripts
 * - Managing ultrasound session data
 * - Storing analysis logs for medical professionals
 * 
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const router = express.Router();

// Enable CORS for frontend
router.use(cors());

// Storage directory for analysis logs
const LOGS_DIR = path.join(__dirname, '../logs/ultrasound');

// Ensure logs directory exists
async function ensureLogsDirectory() {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

ensureLogsDirectory();

/**
 * POST /api/ultrasound/analyze-python
 * Run Python analysis on ultrasound image
 */
router.post('/analyze-python', async (req, res) => {
  try {
    const { imageData, organType, timestamp, options } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'No image data provided'
      });
    }
    
    console.log('📊 Running Python analysis...');
    
    // Path to Python script
    const pythonScript = path.join(__dirname, '../backend/ultrasound-analysis.py');
    
    // Check if Python script exists
    try {
      await fs.access(pythonScript);
    } catch (error) {
      console.error('Python script not found:', pythonScript);
      return res.status(500).json({
        success: false,
        error: 'Python analysis script not available',
        fallback: true
      });
    }
    
    // Prepare input for Python script
    const inputData = JSON.stringify({
      imageData,
      organType,
      timestamp,
      options
    });
    
    // Spawn Python process
    const python = spawn('python3', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let outputData = '';
    let errorData = '';
    
    // Write input to Python process
    python.stdin.write(inputData);
    python.stdin.end();
    
    // Collect output
    python.stdout.on('data', (data) => {
      outputData += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('Python stderr:', data.toString());
    });
    
    // Wait for Python process to complete
    python.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python process exited with code:', code);
        console.error('Error output:', errorData);
        return res.status(500).json({
          success: false,
          error: 'Python analysis failed',
          details: errorData,
          fallback: true
        });
      }
      
      try {
        // Parse Python output
        const results = JSON.parse(outputData);
        results.timestamp = timestamp || new Date().toISOString();
        results.pythonAnalysis = true;
        
        // Save analysis log
        await saveAnalysisLog(results);
        
        console.log('✅ Python analysis completed successfully');
        res.json(results);
        
      } catch (parseError) {
        console.error('Failed to parse Python output:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse analysis results',
          rawOutput: outputData,
          fallback: true
        });
      }
    });
    
    // Set timeout
    setTimeout(() => {
      python.kill();
      res.status(504).json({
        success: false,
        error: 'Analysis timeout',
        fallback: true
      });
    }, 30000); // 30 second timeout
    
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: true
    });
  }
});

/**
 * POST /api/ultrasound/save-session
 * Save complete ultrasound session data
 */
router.post('/save-session', async (req, res) => {
  try {
    const { sessionId, data } = req.body;
    
    if (!sessionId || !data) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and data required'
      });
    }
    
    const sessionFile = path.join(LOGS_DIR, `session_${sessionId}.json`);
    await fs.writeFile(sessionFile, JSON.stringify(data, null, 2));
    
    console.log(`✅ Session saved: ${sessionId}`);
    res.json({
      success: true,
      sessionId,
      file: sessionFile
    });
    
  } catch (error) {
    console.error('Failed to save session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ultrasound/sessions
 * Get list of saved sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const files = await fs.readdir(LOGS_DIR);
    const sessions = files
      .filter(f => f.startsWith('session_') && f.endsWith('.json'))
      .map(f => ({
        sessionId: f.replace('session_', '').replace('.json', ''),
        file: f
      }));
    
    res.json({
      success: true,
      count: sessions.length,
      sessions
    });
    
  } catch (error) {
    console.error('Failed to list sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ultrasound/session/:id
 * Get specific session data
 */
router.get('/session/:id', async (req, res) => {
  try {
    const sessionFile = path.join(LOGS_DIR, `session_${req.params.id}.json`);
    const data = await fs.readFile(sessionFile, 'utf8');
    
    res.json({
      success: true,
      sessionId: req.params.id,
      data: JSON.parse(data)
    });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

/**
 * DELETE /api/ultrasound/session/:id
 * Delete session data
 */
router.delete('/session/:id', async (req, res) => {
  try {
    const sessionFile = path.join(LOGS_DIR, `session_${req.params.id}.json`);
    await fs.unlink(sessionFile);
    
    res.json({
      success: true,
      message: 'Session deleted'
    });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

/**
 * Helper function to save analysis log
 */
async function saveAnalysisLog(results) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(LOGS_DIR, `analysis_${timestamp}.json`);
    await fs.writeFile(logFile, JSON.stringify(results, null, 2));
    console.log(`📝 Analysis log saved: ${logFile}`);
  } catch (error) {
    console.error('Failed to save analysis log:', error);
  }
}

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ultrasound-api',
    python: 'available', // TODO: Check Python availability
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
