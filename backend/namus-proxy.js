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
 * File: namus-proxy.js
 * Declaration ID: IP-526739BE-MLL28ZUJ
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
 * NamUs API Backend Proxy Service
 * 
 * This Express.js service provides a secure backend proxy for the NamUs API.
 * It handles API key management, rate limiting, caching, and request logging.
 * 
 * Features:
 * - Secure API key storage (keys never exposed to client)
 * - Rate limiting per IP address
 * - Response caching to reduce API calls
 * - Request logging and analytics
 * - CORS configuration
 * - Health check endpoint
 * 
 * Setup:
 * 1. npm install express axios express-rate-limit node-cache dotenv cors
 * 2. Copy .env.example to .env and configure
 * 3. Set NAMUS_API_KEY in .env
 * 4. node backend/namus-proxy.js
 * 
 * See: NAMUS_API_SETUP_GUIDE.md for complete setup instructions
 */

const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const cors = require('cors');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min cache

// Configuration
const CONFIG = {
  PORT: process.env.NAMUS_PROXY_PORT || 3020,
  NAMUS_API_KEY: process.env.NAMUS_API_KEY,
  NAMUS_API_ENDPOINT: process.env.NAMUS_API_ENDPOINT || 'https://www.namus.gov/api/CaseSets/NamUs',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'https://barbrickdesign.github.io',
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX: parseInt(process.env.NAMUS_RATE_LIMIT_PER_MINUTE || '10'),
  CACHE_TTL: 300, // 5 minutes
  LOG_REQUESTS: process.env.LOG_REQUESTS !== 'false'
};

// Validate configuration
if (!CONFIG.NAMUS_API_KEY) {
  console.error('ERROR: NAMUS_API_KEY not configured in .env file');
  console.error('See NAMUS_API_SETUP_GUIDE.md for setup instructions');
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Check allowed origins
    const allowedOrigins = CONFIG.ALLOWED_ORIGIN.split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting: configurable requests per minute per IP
const limiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW,
  max: CONFIG.RATE_LIMIT_MAX,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(CONFIG.RATE_LIMIT_WINDOW / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    if (CONFIG.LOG_REQUESTS) {
      console.log(`Rate limit exceeded for IP: ${req.ip}`);
    }
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(CONFIG.RATE_LIMIT_WINDOW / 1000)
    });
  }
});

app.use('/api', limiter);

// Request logging middleware
app.use((req, res, next) => {
  if (CONFIG.LOG_REQUESTS) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  }
  next();
});

// Statistics tracking
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cachedResponses: 0,
  startTime: new Date()
};

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - stats.startTime.getTime()) / 1000);
  res.json({
    status: 'ok',
    service: 'namus-proxy',
    version: '1.0.0',
    uptime: uptime,
    uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    stats: {
      ...stats,
      cacheSize: cache.keys().length,
      successRate: stats.totalRequests > 0 
        ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    }
  });
});

/**
 * Statistics endpoint
 */
app.get('/stats', (req, res) => {
  res.json({
    ...stats,
    cacheSize: cache.keys().length,
    successRate: stats.totalRequests > 0 
      ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%'
      : '0%',
    uptime: Math.floor((Date.now() - stats.startTime.getTime()) / 1000)
  });
});

/**
 * Search missing persons
 * POST /api/namus/search
 * Body: { filters: { state, city, ageMin, ageMax, ... } }
 */
app.post('/api/namus/search', async (req, res) => {
  stats.totalRequests++;
  
  try {
    const { filters = {} } = req.body;
    
    // Create cache key from filters
    const cacheKey = `search_${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      stats.cachedResponses++;
      if (CONFIG.LOG_REQUESTS) {
        console.log('Returning cached response');
      }
      return res.json({
        ...cached,
        cached: true,
        cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000)
      });
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.state) params.append('state', filters.state);
    if (filters.city) params.append('city', filters.city);
    if (filters.ageMin) params.append('ageMin', filters.ageMin);
    if (filters.ageMax) params.append('ageMax', filters.ageMax);
    if (filters.sex) params.append('sex', filters.sex);
    if (filters.race) params.append('race', filters.race);
    
    // Make request to NamUs API
    if (CONFIG.LOG_REQUESTS) {
      console.log(`Fetching from NamUs API: ${CONFIG.NAMUS_API_ENDPOINT}/MissingPersons?${params}`);
    }
    
    const response = await axios({
      method: 'GET',
      url: `${CONFIG.NAMUS_API_ENDPOINT}/MissingPersons`,
      headers: {
        'Authorization': `Bearer ${CONFIG.NAMUS_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BarbrickDesign-NamUs-Proxy/1.0'
      },
      params: Object.fromEntries(params),
      timeout: 30000 // 30 second timeout
    });
    
    // Prepare response data
    const responseData = {
      success: true,
      cases: response.data,
      timestamp: Date.now(),
      source: 'namus_api',
      count: Array.isArray(response.data) ? response.data.length : 0
    };
    
    // Cache the response
    cache.set(cacheKey, responseData);
    
    // Update stats
    stats.successfulRequests++;
    
    // Return response
    res.json({
      ...responseData,
      cached: false
    });
    
  } catch (error) {
    stats.failedRequests++;
    
    console.error('NamUs API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    // Determine error type
    let statusCode = 500;
    let errorMessage = 'Failed to fetch data from NamUs';
    
    if (error.response) {
      // API returned an error
      statusCode = error.response.status;
      
      if (statusCode === 401) {
        errorMessage = 'Invalid NamUs API key';
      } else if (statusCode === 403) {
        errorMessage = 'Access forbidden - check API permissions';
      } else if (statusCode === 429) {
        errorMessage = 'NamUs API rate limit exceeded';
      } else if (statusCode === 404) {
        errorMessage = 'NamUs API endpoint not found';
      } else {
        errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.code === 'ECONNABORTED') {
      statusCode = 504;
      errorMessage = 'Request timeout - NamUs API is slow or unavailable';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      statusCode = 503;
      errorMessage = 'Cannot connect to NamUs API';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: CONFIG.LOG_REQUESTS ? error.message : undefined,
      timestamp: Date.now()
    });
  }
});

/**
 * Get specific case details
 * GET /api/namus/case/:caseId
 */
app.get('/api/namus/case/:caseId', async (req, res) => {
  stats.totalRequests++;
  
  try {
    const { caseId } = req.params;
    const cacheKey = `case_${caseId}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      stats.cachedResponses++;
      return res.json({ ...cached, cached: true });
    }
    
    // Fetch from API
    const response = await axios({
      method: 'GET',
      url: `${CONFIG.NAMUS_API_ENDPOINT}/MissingPersons/${caseId}`,
      headers: {
        'Authorization': `Bearer ${CONFIG.NAMUS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const responseData = {
      success: true,
      case: response.data,
      timestamp: Date.now()
    };
    
    // Cache the response (longer TTL for individual cases)
    cache.set(cacheKey, responseData, 600); // 10 minutes
    
    stats.successfulRequests++;
    res.json({ ...responseData, cached: false });
    
  } catch (error) {
    stats.failedRequests++;
    console.error('NamUs API Error:', error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch case details',
      message: error.message
    });
  }
});

/**
 * Clear cache (admin endpoint - should be protected in production)
 * POST /api/admin/clear-cache
 */
app.post('/api/admin/clear-cache', (req, res) => {
  const clearedKeys = cache.keys().length;
  cache.flushAll();
  
  if (CONFIG.LOG_REQUESTS) {
    console.log(`Cache cleared: ${clearedKeys} entries removed`);
  }
  
  res.json({
    success: true,
    message: `Cache cleared: ${clearedKeys} entries removed`,
    timestamp: Date.now()
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /stats',
      'POST /api/namus/search',
      'GET /api/namus/case/:caseId'
    ]
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal server error',
    message: CONFIG.LOG_REQUESTS ? err.message : 'An unexpected error occurred'
  });
});

/**
 * Start server
 */
const server = app.listen(CONFIG.PORT, () => {
  console.log('\n=================================');
  console.log('NamUs API Proxy Service');
  console.log('=================================');
  console.log(`Status: Running`);
  console.log(`Port: ${CONFIG.PORT}`);
  console.log(`Allowed Origin: ${CONFIG.ALLOWED_ORIGIN}`);
  console.log(`Rate Limit: ${CONFIG.RATE_LIMIT_MAX} requests per ${CONFIG.RATE_LIMIT_WINDOW / 1000} seconds`);
  console.log(`Cache TTL: ${CONFIG.CACHE_TTL} seconds`);
  console.log(`Request Logging: ${CONFIG.LOG_REQUESTS ? 'Enabled' : 'Disabled'}`);
  console.log('\nEndpoints:');
  console.log(`  Health Check: http://localhost:${CONFIG.PORT}/health`);
  console.log(`  Statistics:   http://localhost:${CONFIG.PORT}/stats`);
  console.log(`  Search:       POST http://localhost:${CONFIG.PORT}/api/namus/search`);
  console.log(`  Case Details: GET http://localhost:${CONFIG.PORT}/api/namus/case/:id`);
  console.log('=================================\n');
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
