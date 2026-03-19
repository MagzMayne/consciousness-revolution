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
 * File: gembot-utils.js
 * Declaration ID: IP-3F9BC5BB-MLL28ZUY
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GEMBOT SHARED UTILITIES MODULE
 * ═══════════════════════════════════════════════════════════════════════════════
 * COPYRIGHT © 2024-2025 RYAN BARBRICK / BARBRICK DESIGN
 * ALL RIGHTS RESERVED WORLDWIDE
 * 
 * CREATOR & SOLE OWNER: Ryan Barbrick
 * CONTACT: BarbrickDesign@gmail.com
 * 
 * This module contains shared utility functions used across the GemBot ecosystem.
 * It provides common functionality for state management, UI updates, Firebase
 * integration, and data processing.
 * 
 * UNIQUE BUILD SIGNATURE: GBOT-RB-2025-7X9K2M4P-BARBRICK
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

/**
 * GemBot Utilities Namespace
 * @namespace GemBotUtils
 */
window.GemBotUtils = (function() {
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════════
    
    const VERSION = '1.0.0';
    const BUILD_DATE = '2025-12-16';
    
    /**
     * Firebase configuration for GemBot project
     * @constant {Object}
     */
    const FIREBASE_CONFIG = {
        apiKey: (typeof window !== 'undefined' && window.ENV && window.ENV.FIREBASE_API_KEY) ? window.ENV.FIREBASE_API_KEY : '',
        authDomain: "gem-bot-57068.firebaseapp.com",
        projectId: "gem-bot-57068",
        storageBucket: "gem-bot-57068.appspot.com",
        messagingSenderId: "536281556406",
        appId: "1:536281556406:web:344bbfc5503caffdae0d17",
        measurementId: "G-CPHEQZPHPZ"
    };
    
    /**
     * Treasury wallet addresses
     * @constant {Object}
     */
    const WALLETS = {
        treasury: '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk',
        vault: '7VmkTuGYUwF8Y9PzKdBx2ynNNqBWKEAS9zKLdxFQqH4j'
    };
    
    /**
     * GBUV Token exchange rates
     * @constant {Object}
     */
    const GBUV_RATES = {
        usdToGbuv: 100,  // 1 USD = 100 GBUV
        vaultPercentage: 0.20  // 20% to vault
    };
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Creates a reactive state object with change callbacks
     * @param {Object} initialState - Initial state values
     * @param {Function} [onChange] - Callback when state changes
     * @returns {Proxy} Reactive state proxy
     * @example
     * const state = GemBotUtils.createReactiveState({ count: 0 }, (key, value) => {
     *   console.log(`${key} changed to ${value}`);
     * });
     * state.count = 1; // Logs: "count changed to 1"
     */
    function createReactiveState(initialState, onChange) {
        return new Proxy(initialState, {
            set(target, key, value) {
                const oldValue = target[key];
                target[key] = value;
                if (onChange && oldValue !== value) {
                    onChange(key, value, oldValue);
                }
                return true;
            }
        });
    }
    
    /**
     * Deep clones an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    /**
     * Merges multiple objects deeply
     * @param {...Object} objects - Objects to merge
     * @returns {Object} Merged object
     */
    function deepMerge(...objects) {
        return objects.reduce((acc, obj) => {
            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    acc[key] = deepMerge(acc[key] || {}, obj[key]);
                } else {
                    acc[key] = obj[key];
                }
            });
            return acc;
        }, {});
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DOM UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Safely gets DOM element by ID with error handling
     * @param {string} id - Element ID
     * @param {boolean} [required=false] - Whether to throw error if not found
     * @returns {HTMLElement|null} DOM element or null
     */
    function getElement(id, required = false) {
        const el = document.getElementById(id);
        if (!el && required) {
            console.error(`[GemBotUtils] Required element not found: #${id}`);
        }
        return el;
    }
    
    /**
     * Creates a DOM element with attributes and children
     * @param {string} tag - HTML tag name
     * @param {Object} [attrs={}] - Attributes to set
     * @param {...(HTMLElement|string)} children - Child elements or text
     * @returns {HTMLElement} Created element
     * @example
     * const button = GemBotUtils.createElement('button', 
     *   { class: 'btn', onclick: handleClick },
     *   '🚀 Launch'
     * );
     */
    function createElement(tag, attrs = {}, ...children) {
        const el = document.createElement(tag);
        
        Object.entries(attrs).forEach(([key, value]) => {
            if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === 'class') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else {
                el.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                el.appendChild(child);
            }
        });
        
        return el;
    }
    
    /**
     * Shows a toast notification
     * @param {string} message - Message to display
     * @param {string} [type='info'] - Type: 'success', 'error', 'warning', 'info'
     * @param {number} [duration=3000] - Duration in ms
     */
    function showToast(message, type = 'info', duration = 3000) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const toast = createElement('div', {
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: colors[type] || colors.info,
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                zIndex: '10000',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'slideIn 0.3s ease-out'
            }
        }, `${icons[type]} ${message}`);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DATA FORMATTING
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Formats a number as currency
     * @param {number} amount - Amount to format
     * @param {string} [currency='USD'] - Currency code
     * @returns {string} Formatted currency string
     */
    function formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    /**
     * Formats a number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    function formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
    
    /**
     * Formats GBUV token amount
     * @param {number} amount - Amount in GBUV
     * @returns {string} Formatted string with symbol
     */
    function formatGBUV(amount) {
        return `${formatNumber(amount)} GBUV`;
    }
    
    /**
     * Formats a date/time relative to now
     * @param {Date|number|string} date - Date to format
     * @returns {string} Relative time string
     */
    function formatRelativeTime(date) {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        
        return then.toLocaleDateString();
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Validates an email address
     * @param {string} email - Email to validate
     * @returns {boolean} Whether email is valid
     */
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    /**
     * Validates a Solana wallet address
     * @param {string} address - Address to validate
     * @returns {boolean} Whether address is valid
     */
    function isValidSolanaAddress(address) {
        // Base58 check (32-44 chars, no 0, O, I, l)
        const regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return regex.test(address);
    }
    
    /**
     * Sanitizes user input to prevent XSS
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized string
     */
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STORAGE UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Gets item from localStorage with JSON parsing
     * @param {string} key - Storage key
     * @param {*} [defaultValue=null] - Default value if not found
     * @returns {*} Parsed value or default
     */
    function getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`[GemBotUtils] Error reading storage key "${key}":`, e);
            return defaultValue;
        }
    }
    
    /**
     * Sets item in localStorage with JSON stringification
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Whether operation succeeded
     */
    function setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[GemBotUtils] Error writing storage key "${key}":`, e);
            return false;
        }
    }
    
    /**
     * Removes item from localStorage
     * @param {string} key - Storage key to remove
     */
    function removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`[GemBotUtils] Error removing storage key "${key}":`, e);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ASYNC UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Delays execution for specified milliseconds
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Retries an async function with exponential backoff
     * @param {Function} fn - Async function to retry
     * @param {number} [maxRetries=3] - Maximum retry attempts
     * @param {number} [baseDelay=1000] - Base delay between retries
     * @returns {Promise<*>} Result of function
     */
    async function retry(fn, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                console.warn(`[GemBotUtils] Retry ${i + 1}/${maxRetries} failed:`, error.message);
                
                if (i < maxRetries - 1) {
                    await delay(baseDelay * Math.pow(2, i));
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Debounces a function
     * @param {Function} fn - Function to debounce
     * @param {number} [wait=300] - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(fn, wait = 300) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    }
    
    /**
     * Throttles a function
     * @param {Function} fn - Function to throttle
     * @param {number} [limit=300] - Minimum time between calls
     * @returns {Function} Throttled function
     */
    function throttle(fn, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CRYPTO UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Generates a UUID v4
     * @returns {string} UUID string
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Generates a random alphanumeric string
     * @param {number} [length=16] - Length of string
     * @returns {string} Random string
     */
    function generateRandomString(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    /**
     * Creates a simple hash of a string
     * @param {string} str - String to hash
     * @returns {string} Hash string
     */
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Logger with styled output
     */
    const logger = {
        info: (msg, ...args) => console.log(`%c[GemBot] ${msg}`, 'color: #3b82f6', ...args),
        success: (msg, ...args) => console.log(`%c✅ ${msg}`, 'color: #10b981', ...args),
        warn: (msg, ...args) => console.warn(`%c⚠️ ${msg}`, 'color: #f59e0b', ...args),
        error: (msg, ...args) => console.error(`%c❌ ${msg}`, 'color: #ef4444', ...args),
        debug: (msg, ...args) => {
            if (window.GEMBOT_DEBUG) {
                console.log(`%c🐛 ${msg}`, 'color: #a78bfa', ...args);
            }
        }
    };
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    
    return {
        // Version
        VERSION,
        BUILD_DATE,
        
        // Constants
        FIREBASE_CONFIG,
        WALLETS,
        GBUV_RATES,
        
        // State Management
        createReactiveState,
        deepClone,
        deepMerge,
        
        // DOM
        getElement,
        createElement,
        showToast,
        
        // Formatting
        formatCurrency,
        formatNumber,
        formatGBUV,
        formatRelativeTime,
        
        // Validation
        isValidEmail,
        isValidSolanaAddress,
        sanitizeInput,
        
        // Storage
        getStorage,
        setStorage,
        removeStorage,
        
        // Async
        delay,
        retry,
        debounce,
        throttle,
        
        // Crypto
        generateUUID,
        generateRandomString,
        simpleHash,
        
        // Logging
        logger
    };
    
})();

// Add CSS animation for toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.GemBotUtils;
}

console.log(`%c🔧 GemBot Utils v${window.GemBotUtils.VERSION} loaded`, 'color: #10b981; font-weight: bold');
