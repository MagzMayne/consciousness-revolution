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
 * File: universal-utilities.js
 * Declaration ID: IP-3558D911-MLL28ZV8
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Universal Utilities for Barbrick Design Projects
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 * 
 * This file provides shared functionality across all 700+ projects
 * Ensures consistent behavior and reduces code duplication
 */

(function() {
    'use strict';

    // ========================================
    // INITIALIZATION
    // ========================================
    
    window.BarbrickUniversal = window.BarbrickUniversal || {};
    
    const Universal = {
        version: '1.0.0',
        initialized: false,
        debug: false
    };

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Logs messages to console if debug mode is enabled
     */
    Universal.log = function(...args) {
        if (Universal.debug) {
            console.log('[Barbrick Universal]', ...args);
        }
    };

    /**
     * Logs errors to console
     */
    Universal.error = function(...args) {
        console.error('[Barbrick Universal Error]', ...args);
    };

    /**
     * Safely gets element by ID
     */
    Universal.getElement = function(id) {
        try {
            return document.getElementById(id);
        } catch (e) {
            Universal.error('Error getting element:', id, e);
            return null;
        }
    };

    /**
     * Safely queries elements
     */
    Universal.query = function(selector) {
        try {
            return document.querySelector(selector);
        } catch (e) {
            Universal.error('Error querying selector:', selector, e);
            return null;
        }
    };

    /**
     * Safely queries all elements
     */
    Universal.queryAll = function(selector) {
        try {
            return Array.from(document.querySelectorAll(selector));
        } catch (e) {
            Universal.error('Error querying all:', selector, e);
            return [];
        }
    };

    // ========================================
    // NOTIFICATION SYSTEM
    // ========================================

    /**
     * Shows a notification to the user
     */
    Universal.notify = function(message, type = 'info', duration = 3000) {
        // Create notification container if it doesn't exist
        let container = Universal.query('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        notification.style.cssText = `
            background: rgba(26, 26, 46, 0.95);
            border-left: 4px solid ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            min-width: 300px;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        notification.textContent = message;
        container.appendChild(notification);

        // Auto-remove notification
        if (duration > 0) {
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);
        }

        return notification;
    };

    // ========================================
    // NAVIGATION HELPERS
    // ========================================

    /**
     * Creates a back button to return to the main hub
     */
    Universal.createBackButton = function() {
        const header = document.createElement('div');
        header.className = 'universal-header';
        
        const backBtn = document.createElement('a');
        backBtn.href = '/index.html';
        backBtn.className = 'back-button';
        backBtn.innerHTML = '← Back to Hub';
        
        const title = document.createElement('h1');
        title.className = 'page-title';
        title.textContent = document.title || 'Barbrick Design Project';
        
        header.appendChild(backBtn);
        header.appendChild(title);
        
        // Insert at the beginning of body
        if (document.body.firstChild) {
            document.body.insertBefore(header, document.body.firstChild);
        } else {
            document.body.appendChild(header);
        }
        
        Universal.log('Back button created');
    };

    /**
     * Creates a footer with copyright and contact info
     */
    Universal.createFooter = function() {
        const footer = document.createElement('footer');
        footer.className = 'universal-footer';
        footer.innerHTML = `
            <p>© 2024-2025 Barbrick Design | Created by Ryan Barbrick</p>
            <p>
                <a href="mailto:BarbrickDesign@gmail.com">Contact</a> |
                <a href="/README.html">Documentation</a> |
                <a href="/index.html">All Projects</a>
            </p>
            <p style="font-size: 0.875rem; color: #808080; margin-top: 10px;">
                AI Assistant: Merlin AI
            </p>
        `;
        
        document.body.appendChild(footer);
        Universal.log('Footer created');
    };

    // ========================================
    // ERROR HANDLING
    // ========================================

    /**
     * Global error handler
     */
    Universal.handleError = function(error, context = '') {
        Universal.error('Error in', context, ':', error);
        
        // Show user-friendly error message
        const errorMessage = error.message || 'An unexpected error occurred';
        Universal.notify(
            `Error: ${errorMessage}. Please refresh the page or contact support.`,
            'error',
            5000
        );
        
        // Log to console for debugging
        console.error('Stack trace:', error.stack);
    };

    /**
     * Wraps async functions with error handling
     */
    Universal.safeAsync = function(fn, context = '') {
        return async function(...args) {
            try {
                return await fn.apply(this, args);
            } catch (error) {
                Universal.handleError(error, context);
                return null;
            }
        };
    };

    // ========================================
    // LOCAL STORAGE HELPERS
    // ========================================

    /**
     * Safely sets item in localStorage
     */
    Universal.setStorage = function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            Universal.error('Error setting localStorage:', key, e);
            return false;
        }
    };

    /**
     * Safely gets item from localStorage
     */
    Universal.getStorage = function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            Universal.error('Error getting localStorage:', key, e);
            return defaultValue;
        }
    };

    /**
     * Safely removes item from localStorage
     */
    Universal.removeStorage = function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            Universal.error('Error removing localStorage:', key, e);
            return false;
        }
    };

    // ========================================
    // API HELPERS
    // ========================================

    /**
     * Makes a safe fetch request with error handling
     */
    Universal.fetch = async function(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            Universal.error('Fetch error:', url, error);
            throw error;
        }
    };

    // ========================================
    // LOADING INDICATORS
    // ========================================

    /**
     * Shows loading overlay
     */
    Universal.showLoading = function(message = 'Loading...') {
        let overlay = Universal.query('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div class="loading"></div>
                    <p style="margin-top: 20px; font-size: 1.125rem;">${message}</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        return overlay;
    };

    /**
     * Hides loading overlay
     */
    Universal.hideLoading = function() {
        const overlay = Universal.query('.loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    };

    // ========================================
    // RESPONSIVE UTILITIES
    // ========================================

    /**
     * Checks if viewport is mobile size
     */
    Universal.isMobile = function() {
        return window.innerWidth <= 768;
    };

    /**
     * Checks if viewport is tablet size
     */
    Universal.isTablet = function() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    };

    /**
     * Checks if viewport is desktop size
     */
    Universal.isDesktop = function() {
        return window.innerWidth > 1024;
    };

    // ========================================
    // ANIMATION UTILITIES
    // ========================================

    /**
     * Animates element with CSS classes
     */
    Universal.animate = function(element, animationClass, duration = 300) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            element.classList.add(animationClass);
            
            setTimeout(() => {
                element.classList.remove(animationClass);
                resolve();
            }, duration);
        });
    };

    // ========================================
    // VALIDATION HELPERS
    // ========================================

    /**
     * Validates email address
     */
    Universal.isValidEmail = function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    /**
     * Validates URL
     */
    Universal.isValidUrl = function(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // ========================================
    // CLIPBOARD UTILITIES
    // ========================================

    /**
     * Copies text to clipboard
     */
    Universal.copyToClipboard = async function(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                Universal.notify('Copied to clipboard!', 'success');
                return true;
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                Universal.notify('Copied to clipboard!', 'success');
                return true;
            }
        } catch (error) {
            Universal.error('Failed to copy to clipboard:', error);
            Universal.notify('Failed to copy to clipboard', 'error');
            return false;
        }
    };

    // ========================================
    // INITIALIZATION
    // ========================================

    /**
     * Initializes universal utilities
     */
    Universal.init = function() {
        if (Universal.initialized) {
            return;
        }

        Universal.log('Initializing Universal Utilities v' + Universal.version);

        // Add CSS animations if not already present
        if (!document.querySelector('#universal-animations')) {
            const style = document.createElement('style');
            style.id = 'universal-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Set up global error handler
        window.addEventListener('error', (event) => {
            Universal.handleError(event.error, 'Global');
        });

        // Set up unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            Universal.handleError(event.reason, 'Promise');
        });

        Universal.initialized = true;
        Universal.log('Universal Utilities initialized successfully');
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', Universal.init);
    } else {
        Universal.init();
    }

    // Expose Universal object globally
    window.BarbrickUniversal = Universal;

    Universal.log('Universal Utilities loaded');

})();
