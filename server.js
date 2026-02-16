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
 * File: server.js
 * Declaration ID: IP-BC5602C-MLL28ZVV
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

// server.js for WorkingProject: Express + SQLite user database
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// SQLite DB setup
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Create users table if it doesn't exist
const userTableSQL = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet_address TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;
db.run(userTableSQL);

// Create location_logs table if it doesn't exist
const locationLogTableSQL = `CREATE TABLE IF NOT EXISTS location_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet_address TEXT,
  location TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;
db.run(locationLogTableSQL);

// API: Add or update user by wallet address
app.post('/api/users', (req, res) => {
  const { wallet_address, display_name } = req.body;
  if (!wallet_address) return res.status(400).json({ error: 'wallet_address required' });
  db.run(
    `INSERT OR IGNORE INTO users (wallet_address, display_name) VALUES (?, ?);`,
    [wallet_address, display_name || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT * FROM users WHERE wallet_address = ?`, [wallet_address], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

// API: Get user by wallet address
app.get('/api/users/:wallet_address', (req, res) => {
  db.get(`SELECT * FROM users WHERE wallet_address = ?`, [req.params.wallet_address], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

// API: Add a new location log
app.post('/api/location-logs', (req, res) => {
  const { wallet_address, location } = req.body;
  if (!wallet_address || !location) return res.status(400).json({ error: 'wallet_address and location required' });
  db.run(
    `INSERT INTO location_logs (wallet_address, location) VALUES (?, ?);`,
    [wallet_address, location],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// API: Get all location logs for a user
app.get('/api/location-logs/:wallet_address', (req, res) => {
  db.all(
    `SELECT * FROM location_logs WHERE wallet_address = ? ORDER BY timestamp DESC`,
    [req.params.wallet_address],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});