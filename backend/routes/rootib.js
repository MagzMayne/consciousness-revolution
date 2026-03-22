// backend/routes/rootib.js
// RootIB application integration routes for the consciousness-revolution backend.
//
// Mirrors the RootIB route integration observed in the BarbrickDesign backend.
// Uses ROOTIBAPP_CLIENT_ID and ROOTIBAPP_CLIENT_SECRET for OAuth2-style
// service-to-service authentication with the RootIB platform.

'use strict';

const https   = require('https');
const express = require('express');
const router  = express.Router();

// ── Environment ──────────────────────────────────────────────────────────
const CLIENT_ID     = process.env.ROOTIBAPP_CLIENT_ID     || '';
const CLIENT_SECRET = process.env.ROOTIBAPP_CLIENT_SECRET || '';
const AGENTR        = process.env.AGENTR                  || '';

// RootIB platform base (can be overridden via env)
const ROOTIB_BASE   = process.env.ROOTIB_API_BASE || 'https://api.rootib.com';

// ── Helper ────────────────────────────────────────────────────────────────
/**
 * Return true if the RootIB credentials are configured.
 */
function hasCredentials() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

/**
 * Return sanitised credential status (never exposes the actual values).
 */
function credentialStatus() {
  return {
    clientId:     CLIENT_ID     ? '(configured)' : '(not set)',
    clientSecret: CLIENT_SECRET ? '(configured)' : '(not set)',
    agentR:       AGENTR        ? '(configured)' : '(not set)',
  };
}

// ── GET /api/rootib/status ────────────────────────────────────────────────
// Returns the RootIB integration status for this backend instance.
router.get('/status', (_req, res) => {
  res.json({
    ok:          true,
    integration: 'rootib',
    configured:  hasCredentials(),
    credentials: credentialStatus(),
    base:        ROOTIB_BASE,
    timestamp:   new Date().toISOString(),
  });
});

// ── GET /api/rootib/agent ─────────────────────────────────────────────────
// Returns the Agent R identity for this deployment.
router.get('/agent', (_req, res) => {
  res.json({
    ok:      true,
    agentId: AGENTR || 'unset',
    role:    'Agent R — reconnaissance & orchestration',
    status:  AGENTR ? 'active' : 'unconfigured',
  });
});

// ── POST /api/rootib/ping ─────────────────────────────────────────────────
// Verifies that RootIB credentials are valid by attempting a lightweight
// connectivity check.  Returns 503 when credentials are missing.
router.post('/ping', (_req, res) => {
  if (!hasCredentials()) {
    return res.status(503).json({
      ok:    false,
      error: 'ROOTIBAPP_CLIENT_ID / ROOTIBAPP_CLIENT_SECRET not configured',
    });
  }

  // Lightweight credential presence check (no outbound call in Railway context
  // where RootIB may not be reachable from the worker node).
  res.json({
    ok:        true,
    message:   'RootIB credentials present — connectivity test skipped in Railway',
    configured: true,
  });
});

// ── GET /api/rootib/railway ───────────────────────────────────────────────
// Returns Railway-specific metadata for this deployment.
router.get('/railway', (_req, res) => {
  const railwayKey = process.env.RAILWAY_API_KEY;
  res.json({
    ok:          true,
    railway:     {
      apiKeySet:   Boolean(railwayKey),
      environment: process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV || 'unknown',
      serviceId:   process.env.RAILWAY_SERVICE_ID  || 'unknown',
      deploymentId: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown',
    },
  });
});

module.exports = router;
