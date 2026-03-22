// backend/services/scanner-service.js
// API spec scanner for the consciousness-revolution Railway backend.
//
// Mirrors the scanner initialization found in the BarbrickDesign backend.
// Reads SCANNER_SPEC_URL from environment, fetches the OpenAPI/Swagger spec,
// and builds a lightweight route-health index used by the master loop for
// protocol enforcement and self-healing diagnostics.

'use strict';

const https = require('https');
const http  = require('http');
const url   = require('url');

// ── Configuration ─────────────────────────────────────────────────────────
const SCANNER_SPEC_URL      = process.env.SCANNER_SPEC_URL || '';
const SCAN_INTERVAL_MS      = parseInt(process.env.SCAN_INTERVAL_MS || String(15 * 60 * 1000), 10);

let _intervalId  = null;
let _lastScan    = null;
let _scanCount   = 0;
let _specIndex   = null;   // Parsed spec metadata

// ── Helper ────────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`${new Date().toISOString()} [inf] [ScannerService] ${msg}`);
}

function warn(msg) {
  console.warn(`${new Date().toISOString()} [warn] [ScannerService] ${msg}`);
}

/**
 * Fetch text from a URL and return it as a string.
 */
function fetchText(targetUrl) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new url.URL(targetUrl);
    } catch (err) {
      return reject(new Error(`Invalid SCANNER_SPEC_URL: ${err.message}`));
    }

    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.get(targetUrl, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} from spec URL`));
      }
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(body));
    });

    req.on('error', reject);
    req.setTimeout(15_000, () => {
      warn('Spec fetch timed out after 15 s');
      req.destroy();
      reject(new Error('timeout'));
    });
  });
}

/**
 * Parse a fetched spec (JSON or YAML stub) into a lightweight index.
 *
 * @param {string} raw - raw spec text
 * @returns {{ paths: string[], version: string, title: string }}
 */
function parseSpec(raw) {
  try {
    const spec = JSON.parse(raw);
    const paths   = Object.keys(spec.paths || {});
    const info    = spec.info || {};
    return {
      paths,
      version: info.version || 'unknown',
      title:   info.title   || 'unknown',
      format:  'openapi',
    };
  } catch (_) {
    // Not JSON — treat as plain-text path list (one per line)
    const paths = raw.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('/'));
    return { paths, version: 'unknown', title: 'plain-text', format: 'text' };
  }
}

/**
 * Perform a single scan pass: fetch spec → parse → cache.
 */
async function runScan() {
  if (!SCANNER_SPEC_URL) {
    log('SCANNER_SPEC_URL not configured — scan skipped');
    return;
  }

  _scanCount++;
  _lastScan = new Date().toISOString();
  log(`Starting spec scan #${_scanCount} — url=${SCANNER_SPEC_URL}`);

  try {
    const raw  = await fetchText(SCANNER_SPEC_URL);
    _specIndex = parseSpec(raw);
    log(`Scan complete — format=${_specIndex.format} paths=${_specIndex.paths.length} title="${_specIndex.title}"`);
  } catch (err) {
    warn(`Scan failed: ${err.message}`);
  }
}

/**
 * Start the periodic spec scanner.
 * Safe to call multiple times — only one interval runs.
 */
function start() {
  if (_intervalId) return;

  if (!SCANNER_SPEC_URL) {
    log('SCANNER_SPEC_URL not set — scanner will no-op but remain active');
  } else {
    log(`Scanner started — specUrl=${SCANNER_SPEC_URL} interval=${SCAN_INTERVAL_MS / 1000}s`);
  }

  // First scan on next tick
  setImmediate(() => runScan().catch((err) => warn(`Scan error: ${err.message}`)));

  _intervalId = setInterval(() => {
    runScan().catch((err) => warn(`Scan error: ${err.message}`));
  }, SCAN_INTERVAL_MS);
}

/**
 * Stop the scanner.
 */
function stop() {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
    log('Scanner stopped');
  }
}

/** Return the current scanner status and cached spec index. */
function status() {
  return {
    active:      _intervalId !== null,
    specUrl:     SCANNER_SPEC_URL ? '(configured)' : '(not set)',
    lastScan:    _lastScan,
    scans:       _scanCount,
    specIndex:   _specIndex,
  };
}

/** Return the cached spec index (or null if not yet scanned). */
function getSpecIndex() {
  return _specIndex;
}

module.exports = { start, stop, runScan, status, getSpecIndex };
