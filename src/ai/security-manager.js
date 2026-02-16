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
 * File: security-manager.js
 * Declaration ID: IP-5961DBD7-MLL28ZW2
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

/** SIGNED BY MeRLynn - ID: MERLYNN-2468031a - TIMESTAMP: 2025-12-19T05:53:06.535Z - HASH: 7fa64c4c */
/** SIGNED BY AGentR - ID: AGENTR-0c231a59 - TIMESTAMP: 2025-12-19T05:53:06.535Z - HASH: 7fa64c4c */

/**
 * Security Manager for AI API Keys
 * Handles secure storage and management of API keys
 *
 * IMPORTANT SECURITY NOTES:
 * - Client-side storage is inherently insecure
 * - Consider server-side proxy for production
 * - Never store sensitive keys in plain text
 * - Use environment variables or secure key vaults
 * - Implement proper key rotation
 */

class SecurityManager {
    constructor() {
        this.storageKey = 'barbrick_ai_keys';
        this.encryptionKey = 'barbrick_secure_key_v1'; // In production, use proper key management
        this.keys = this.loadKeys();
    }

    /**
     * Simple obfuscation (NOT encryption - this provides NO real security)
     * 
     * ⚠️ SECURITY WARNING ⚠️
     * This is BASE64 encoding which provides ZERO security protection.
     * Anyone can decode this with browser dev tools.
     * 
     * FOR PRODUCTION: Use one of these secure alternatives:
     * 1. Server-side API proxy (recommended)
     * 2. Web Crypto API with proper key derivation
     * 3. Secure key vault services (AWS KMS, Azure Key Vault, HashiCorp Vault)
     * 4. Environment variables with proper access controls
     * 
     * This simple obfuscation only prevents casual viewing in localStorage.
     */
    simpleEncrypt(text) {
        // Base64 encoding - provides obfuscation only, NOT security
        return btoa(text);
    }

    simpleDecrypt(encoded) {
        // Base64 decoding - anyone can do this
        return atob(encoded);
    }

    /**
     * Load stored keys
     */
    loadKeys() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const decrypted = this.simpleDecrypt(stored);
                return JSON.parse(decrypted);
            }
        } catch (error) {
            console.error('Failed to load stored keys:', error);
        }
        return {};
    }

    /**
     * Save keys securely
     */
    saveKeys() {
        try {
            const encrypted = this.simpleEncrypt(JSON.stringify(this.keys));
            localStorage.setItem(this.storageKey, encrypted);
        } catch (error) {
            console.error('Failed to save keys:', error);
        }
    }

    /**
     * Set API key for a service
     * @param {string} service - Service name (e.g., 'openai')
     * @param {string} key - API key
     */
    setApiKey(service, key) {
        if (!key || key.length < 10) {
            throw new Error('Invalid API key format');
        }

        this.keys[service] = {
            key: key,
            setAt: new Date().toISOString(),
            lastUsed: null
        };

        this.saveKeys();
        console.log(`✅ API key set for ${service}`);
    }

    /**
     * Get API key for a service
     * @param {string} service - Service name
     * @returns {string|null} - API key or null
     */
    getApiKey(service) {
        const keyData = this.keys[service];
        if (keyData) {
            keyData.lastUsed = new Date().toISOString();
            this.saveKeys();
            return keyData.key;
        }
        return null;
    }

    /**
     * Remove API key for a service
     * @param {string} service - Service name
     */
    removeApiKey(service) {
        if (this.keys[service]) {
            delete this.keys[service];
            this.saveKeys();
            console.log(`🗑️ API key removed for ${service}`);
        }
    }

    /**
     * Check if key exists for service
     * @param {string} service - Service name
     * @returns {boolean}
     */
    hasApiKey(service) {
        return !!this.keys[service];
    }

    /**
     * Get all stored services
     * @returns {Array} - Array of service names
     */
    getStoredServices() {
        return Object.keys(this.keys);
    }

    /**
     * Validate API key format (basic check)
     * @param {string} key - API key to validate
     * @param {string} service - Service name
     * @returns {boolean}
     */
    validateApiKey(key, service) {
        if (!key) return false;

        // Basic validation patterns
        const patterns = {
            openai: /^sk-[a-zA-Z0-9]{48}$/,
            anthropic: /^sk-ant-[a-zA-Z0-9_-]+$/,
            // Add more patterns as needed
        };

        const pattern = patterns[service.toLowerCase()];
        return pattern ? pattern.test(key) : key.length > 20;
    }

    /**
     * Initialize security manager
     */
    init() {
        console.log('🔐 Security Manager initialized');
        console.warn('⚠️ SECURITY WARNING: Client-side key storage is insecure. Use server-side proxy for production.');
    }

    /**
     * Clear all stored keys
     */
    clearAllKeys() {
        this.keys = {};
        localStorage.removeItem(this.storageKey);
        console.log('🧹 All stored API keys cleared');
    }
}

// Global instance
window.securityManager = new SecurityManager();
window.securityManager.init();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
} else {
    // For browser use
}

// Note: ES6 export commented out to allow loading as regular script
// If using as ES6 module, uncomment the line below and load with type="module"
// export default SecurityManager;
