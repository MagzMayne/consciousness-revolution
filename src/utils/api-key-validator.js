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
 * File: api-key-validator.js
 * Declaration ID: IP-37FFF166-MLL28ZWD
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
 * API KEY VALIDATOR AND SECURITY UTILITIES
 * 
 * Centralized module for validating and securely handling API keys across all services.
 * Provides consistent validation, error messaging, and security best practices.
 * 
 * @author BarbrickDesign Security Team
 * @version 1.0.0
 */

class ApiKeyValidator {
    constructor() {
        // API key format specifications for different services
        this.keySpecs = {
            'openai': {
                prefix: 'sk-',
                minLength: 40,
                pattern: /^sk-[A-Za-z0-9]{40,}$/,
                name: 'OpenAI API Key'
            },
            'samgov': {
                minLength: 20,
                pattern: /^[A-Za-z0-9\-_]+$/,
                name: 'SAM.gov API Key'
            },
            'github': {
                prefix: ['ghp_', 'github_pat_'],
                minLength: 36,
                pattern: /^(ghp_|github_pat_)[A-Za-z0-9_]+$/,
                name: 'GitHub Personal Access Token'
            },
            'paypal': {
                minLength: 60,
                pattern: /^[A-Za-z0-9\-_]+$/,
                name: 'PayPal API Credentials'
            },
            'etherscan': {
                minLength: 32,
                maxLength: 40,
                pattern: /^[A-Z0-9]+$/,
                name: 'Etherscan API Key'
            },
            'infura': {
                minLength: 32,
                maxLength: 32,
                pattern: /^[a-f0-9]{32}$/,
                name: 'Infura Project ID'
            },
            'coingecko': {
                prefix: 'CG-',
                minLength: 30,
                pattern: /^CG-[A-Za-z0-9\-_]+$/,
                name: 'CoinGecko API Key'
            },
            'generic': {
                minLength: 20,
                pattern: /^[A-Za-z0-9\-_]+$/,
                name: 'API Key'
            }
        };
    }

    /**
     * Validate an API key for a specific service
     * @param {string} apiKey - The API key to validate
     * @param {string} service - Service identifier (openai, samgov, github, etc.)
     * @returns {object} - Validation result { valid: boolean, error?: string, warnings?: string[] }
     */
    validate(apiKey, service = 'generic') {
        // Basic null/empty check
        if (!apiKey || typeof apiKey !== 'string') {
            return {
                valid: false,
                error: 'API key must be a non-empty string'
            };
        }

        // Remove whitespace
        apiKey = apiKey.trim();

        if (apiKey.length === 0) {
            return {
                valid: false,
                error: 'API key cannot be empty'
            };
        }

        // Get specifications for the service
        const spec = this.keySpecs[service.toLowerCase()] || this.keySpecs.generic;
        const warnings = [];

        // Check minimum length
        if (spec.minLength && apiKey.length < spec.minLength) {
            return {
                valid: false,
                error: `${spec.name} appears too short (minimum ${spec.minLength} characters)`
            };
        }

        // Check maximum length
        if (spec.maxLength && apiKey.length > spec.maxLength) {
            return {
                valid: false,
                error: `${spec.name} appears too long (maximum ${spec.maxLength} characters)`
            };
        }

        // Check prefix
        if (spec.prefix) {
            const prefixes = Array.isArray(spec.prefix) ? spec.prefix : [spec.prefix];
            const hasValidPrefix = prefixes.some(prefix => apiKey.startsWith(prefix));
            
            if (!hasValidPrefix) {
                return {
                    valid: false,
                    error: `${spec.name} should start with ${prefixes.join(' or ')}`
                };
            }
        }

        // Check for common test/placeholder values BEFORE pattern check
        // Using more specific patterns to avoid false positives
        const testPatterns = [
            'your_key_here', 'your-key-here', 'your_api_key', 'your-api-key',
            'placeholder', 'example-key', 'test-key', 'demo-key', 'sample-key',
            'fake-key', 'mock-key', 'xxx-xxx', '000-000', '123-456', 
            'replace-me', 'insert-key', 'api-key-here'
        ];

        const lowerKey = apiKey.toLowerCase();
        for (const pattern of testPatterns) {
            if (lowerKey.includes(pattern)) {
                return {
                    valid: false,
                    error: `${spec.name} appears to be a placeholder or test value`
                };
            }
        }

        // Check pattern
        if (spec.pattern && !spec.pattern.test(apiKey)) {
            return {
                valid: false,
                error: `${spec.name} contains invalid characters or format`
            };
        }

        // Security warnings
        if (apiKey.includes(' ')) {
            warnings.push('API key contains spaces, which is unusual');
        }

        return {
            valid: true,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /**
     * Safely retrieve API key from multiple sources
     * @param {object} options - Options for key retrieval
     * @param {string} options.service - Service identifier
     * @param {string} options.envVar - Environment variable name
     * @param {string} options.configKey - Configuration object key
     * @param {object} options.config - Configuration object
     * @param {boolean} options.allowStorage - Allow sessionStorage (default: false for security)
     * @returns {string|null} - Retrieved API key or null
     */
    getApiKey(options) {
        const { service, envVar, configKey, config, allowStorage = false } = options;

        // 1. Check explicit config first
        if (config && configKey && config[configKey]) {
            return config[configKey];
        }

        // 2. Check environment variable (server-side)
        if (envVar && typeof process !== 'undefined' && process.env && process.env[envVar]) {
            return process.env[envVar];
        }

        // 3. Check sessionStorage (safer, only lasts for session)
        if (allowStorage && typeof sessionStorage !== 'undefined') {
            const sessionKey = sessionStorage.getItem(`${service}_api_key`);
            if (sessionKey) {
                console.warn(`⚠️ ${service} API key loaded from sessionStorage`);
                return sessionKey;
            }
        }

        return null;
    }

    /**
     * Securely store API key (sessionStorage only - localStorage removed for security)
     * @param {string} service - Service identifier
     * @param {string} apiKey - API key to store
     * @returns {boolean} - Success status
     */
    storeApiKey(service, apiKey) {
        if (!service || !apiKey) {
            console.error('Service and API key are required');
            return false;
        }

        // Validate before storing
        const validation = this.validate(apiKey, service);
        if (!validation.valid) {
            console.error(`Cannot store invalid API key: ${validation.error}`);
            return false;
        }

        const storageKey = `${service}_api_key`;

        // Only use sessionStorage - localStorage removed for security
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(storageKey, apiKey);
            console.log(`✅ ${service} API key stored in session (will expire when browser closes)`);
        } else {
            console.warn('sessionStorage not available - key cannot be persisted');
            return false;
        }

        return true;
    }

    /**
     * Clear stored API key
     * @param {string} service - Service identifier
     */
    clearApiKey(service) {
        const storageKey = `${service}_api_key`;
        
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(storageKey);
        }
    }

    /**
     * Mask API key for display (show only first and last few characters)
     * @param {string} apiKey - API key to mask
     * @param {number} showStart - Number of characters to show at start
     * @param {number} showEnd - Number of characters to show at end
     * @returns {string} - Masked API key
     */
    maskApiKey(apiKey, showStart = 4, showEnd = 4) {
        if (!apiKey || apiKey.length <= showStart + showEnd) {
            return '****';
        }

        const start = apiKey.substring(0, showStart);
        const end = apiKey.substring(apiKey.length - showEnd);
        const maskLength = Math.max(8, apiKey.length - showStart - showEnd);
        const mask = '*'.repeat(maskLength);

        return `${start}${mask}${end}`;
    }

    /**
     * Check if API key is likely exposed in code
     * @param {string} code - Code string to check
     * @returns {object} - Detection result { exposed: boolean, locations?: Array }
     */
    detectExposedKeys(code) {
        const patterns = [
            // Common API key patterns
            /['"`]sk-[A-Za-z0-9]{40,}['"`]/g,  // OpenAI
            /['"`]ghp_[A-Za-z0-9_]{36,}['"`]/g,  // GitHub
            /['"`]CG-[A-Za-z0-9\-_]{30,}['"`]/g,  // CoinGecko
            // Generic patterns
            /api[_-]?key\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi,
            /apikey\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi,
            /api[_-]?secret\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi,
            /token\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi
        ];

        const locations = [];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(code)) !== null) {
                locations.push({
                    match: this.maskApiKey(match[0]),
                    position: match.index
                });
            }
        }

        return {
            exposed: locations.length > 0,
            locations: locations.length > 0 ? locations : undefined,
            message: locations.length > 0 
                ? `⚠️ Found ${locations.length} potential exposed API key(s) in code`
                : 'No exposed API keys detected'
        };
    }

    /**
     * Generate secure error message that doesn't expose the key
     * @param {string} service - Service name
     * @param {string} errorType - Type of error
     * @param {string} apiKey - The API key (for masking only)
     * @returns {string} - Safe error message
     */
    generateSafeErrorMessage(service, errorType, apiKey = null) {
        const messages = {
            'invalid_format': `Invalid ${service} API key format. Please check your key.`,
            'authentication_failed': `Authentication failed for ${service}. Please verify your API key is correct and active.`,
            'permission_denied': `Your ${service} API key does not have the required permissions.`,
            'rate_limit': `Rate limit exceeded for ${service} API.`,
            'key_expired': `Your ${service} API key may have expired.`,
            'missing_key': `${service} API key is required. Please provide a valid key.`
        };

        let message = messages[errorType] || `Error with ${service} API key.`;

        if (apiKey) {
            message += ` (Key: ${this.maskApiKey(apiKey)})`;
        }

        return message;
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiKeyValidator;
} else if (typeof window !== 'undefined') {
    window.ApiKeyValidator = ApiKeyValidator;
}
