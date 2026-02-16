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
 * File: security-headers.js
 * Declaration ID: IP-3A95C15E-MLL28ZW5
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Security Headers Configuration
 * 
 * Implements Content Security Policy (CSP) and security headers
 * to protect against various attacks.
 */

class SecurityHeaders {
  constructor() {
    this.config = {
      enabled: true,
      cspEnabled: true,
      strictMode: false // Set to true for production
    };

    this.cspDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for inline scripts (consider removing in production)
        "'unsafe-eval'", // Required for some JS frameworks
        'https://cdn.babylonjs.com',
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://www.paypal.com',
        'https://www.paypalobjects.com',
        'https://cdnjs.cloudflare.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for inline styles
        'https://fonts.googleapis.com',
        'https://cdnjs.cloudflare.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'http:' // Consider removing in production
      ],
      'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com'
      ],
      'connect-src': [
        "'self'",
        'https://api.openai.com',
        'https://api.anthropic.com',
        'https://api.groq.com',
        'https://api.paypal.com',
        'https://sam.gov',
        'https://www.grants.gov',
        'https://api.github.com',
        'wss:' // WebSocket connections
      ],
      'frame-src': [
        "'self'",
        'https://www.paypal.com',
        'https://www.paypalobjects.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'self'"],
      'upgrade-insecure-requests': []
    };

    this.securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Apply Content Security Policy
   */
  applyCSP() {
    if (!this.config.cspEnabled) return;

    // Build CSP string
    const cspString = Object.entries(this.cspDirectives)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');

    // Add meta tag for CSP (client-side enforcement)
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspString;
    document.head.appendChild(meta);

    console.log('🔒 Content Security Policy applied');
  }

  /**
   * Apply security headers (via meta tags)
   */
  applySecurityHeaders() {
    // Note: These are best set server-side, but we can add meta tags as fallback
    
    // X-Frame-Options alternative (CSP frame-ancestors is preferred)
    // Already handled in CSP

    // Referrer Policy
    let meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(meta);

    console.log('🔒 Security headers applied');
  }

  /**
   * Initialize rate limiting for API calls
   */
  initRateLimiting() {
    this.rateLimits = new Map();
    this.rateLimitConfig = {
      maxRequests: 100,
      windowMs: 60000, // 1 minute
      blockDuration: 300000 // 5 minutes
    };

    // Intercept fetch for rate limiting
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      
      // Apply rate limiting to external APIs
      if (typeof url === 'string' && url.startsWith('http')) {
        const domain = new URL(url).hostname;
        
        if (!this.checkRateLimit(domain)) {
          throw new Error(`Rate limit exceeded for ${domain}`);
        }
      }

      return originalFetch.apply(this, args);
    };

    console.log('🔒 Rate limiting initialized');
  }

  /**
   * Check if request is within rate limit
   */
  checkRateLimit(identifier) {
    const now = Date.now();
    const limits = this.rateLimits.get(identifier) || {
      requests: [],
      blocked: false,
      blockedUntil: 0
    };

    // Check if currently blocked
    if (limits.blocked && now < limits.blockedUntil) {
      console.warn(`Rate limit: ${identifier} is blocked until ${new Date(limits.blockedUntil).toLocaleTimeString()}`);
      return false;
    }

    // Clear block if expired
    if (limits.blocked && now >= limits.blockedUntil) {
      limits.blocked = false;
      limits.requests = [];
    }

    // Remove old requests outside window
    limits.requests = limits.requests.filter(
      time => now - time < this.rateLimitConfig.windowMs
    );

    // Check if over limit
    if (limits.requests.length >= this.rateLimitConfig.maxRequests) {
      limits.blocked = true;
      limits.blockedUntil = now + this.rateLimitConfig.blockDuration;
      this.rateLimits.set(identifier, limits);
      
      console.warn(`Rate limit exceeded for ${identifier}. Blocked for ${this.rateLimitConfig.blockDuration / 1000}s`);
      return false;
    }

    // Add current request
    limits.requests.push(now);
    this.rateLimits.set(identifier, limits);

    return true;
  }

  /**
   * Implement CORS restrictions (client-side validation)
   */
  validateCORS(url) {
    // List of allowed origins for API calls
    const allowedOrigins = [
      'https://barbrickdesign.github.io',
      'https://api.openai.com',
      'https://api.anthropic.com',
      'https://api.groq.com',
      'https://api.paypal.com',
      'https://sam.gov',
      'https://www.grants.gov',
      'https://api.github.com'
    ];

    try {
      const urlObj = new URL(url);
      const origin = `${urlObj.protocol}//${urlObj.hostname}`;
      
      if (!allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        console.warn(`CORS: Request to ${origin} is not in allowed origins`);
        return false;
      }
      
      return true;
    } catch (error) {
      return true; // Allow relative URLs
    }
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Validate URL to prevent open redirect
   */
  validateURL(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      
      // Only allow same origin or HTTPS
      if (urlObj.origin !== window.location.origin && urlObj.protocol !== 'https:') {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize all security measures
   */
  init() {
    if (!this.config.enabled) {
      console.warn('Security headers disabled');
      return;
    }

    // Apply CSP
    this.applyCSP();

    // Apply security headers
    this.applySecurityHeaders();

    // Initialize rate limiting
    this.initRateLimiting();

    console.log('🔒 Security measures initialized');
    console.log('📋 View CSP violations in console (if any)');

    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error('CSP Violation:', {
        violatedDirective: e.violatedDirective,
        effectiveDirective: e.effectiveDirective,
        blockedURI: e.blockedURI,
        originalPolicy: e.originalPolicy
      });

      // Report violation (could send to server)
      if (window.IntrusionDetection) {
        window.IntrusionDetection.reportThreat('csp_violation', {
          directive: e.violatedDirective,
          uri: e.blockedURI
        });
      }
    });
  }

  /**
   * Get current security status
   */
  getStatus() {
    return {
      enabled: this.config.enabled,
      csp: this.config.cspEnabled,
      rateLimiting: true,
      activeRateLimits: Array.from(this.rateLimits.entries()).map(([domain, limits]) => ({
        domain,
        requestCount: limits.requests.length,
        blocked: limits.blocked,
        blockedUntil: limits.blocked ? new Date(limits.blockedUntil).toISOString() : null
      }))
    };
  }
}

// Auto-initialize
const securityHeaders = new SecurityHeaders();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    securityHeaders.init();
  });
} else {
  securityHeaders.init();
}

// Global access
window.SecurityHeaders = securityHeaders;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityHeaders;
}
