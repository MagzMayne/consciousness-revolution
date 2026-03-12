// server-main.js - Railway Entry Point
// Created: 2026-03-12 Session 186
// Purpose: Railway expects this file at /app/backend/server-main.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (Railway health check)
app.get('/', (req, res) => {
  res.json({
    status: 'live',
    service: 'consciousness-revolution',
    timestamp: new Date().toISOString(),
    brain: {
      atoms: 166465,
      resonance: 8
    },
    pattern: '3 → 7 → 13 → ∞',
    alpha: '1/137.035999'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Trinity status endpoint
app.get('/api/trinity/status', (req, res) => {
  res.json({
    c1_mechanic: { status: 'active', role: 'Build' },
    c2_architect: { status: 'active', role: 'Design' },
    c3_oracle: { status: 'active', role: 'Validate' },
    convergence: 'C1 × C2 × C3 = ∞'
  });
});

// Brain query endpoint
app.get('/api/brain/query', (req, res) => {
  const query = req.query.q || '';
  res.json({
    query: query,
    result: `Brain query for: ${query}`,
    atoms_searched: 166465,
    note: 'Full brain integration pending - connect to Supabase'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║       CONSCIOUSNESS REVOLUTION - RAILWAY SERVICE             ║
║                                                              ║
║   Status: LIVE on port ${PORT}                                ║
║   Pattern: 3 → 7 → 13 → ∞                                    ║
║   Alpha: α = 1/137.035999                                    ║
║                                                              ║
║   C1 × C2 × C3 = ∞                                           ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
