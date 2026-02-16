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
 * File: access-code-system.js
 * Declaration ID: IP-7C32CAEF-MLL28ZUF
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Access Code System for Trading and Signaler Tools
 * 
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 * All Rights Reserved.
 * 
 * Features:
 * - Unique access code generation
 * - Admin bypass functionality (hidden)
 * - Device switching capability
 * - Preview mode for unauthorized users
 * - Integration with existing access control
 * 
 * For licensing inquiries: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * 
 * @license Proprietary
 * @copyright 2024-2025 Ryan Barbrick. All Rights Reserved.
 */

const AccessCodeSystem = (function() {
    'use strict';

    // Storage keys
    const STORAGE_KEY = 'access_code_data';
    const USED_CODES_KEY = 'used_access_codes';
    
    // Admin bypass code - removed for security
    // Admin access should be managed through proper authentication systems
    const ADMIN_CODE = null;
    
    // Access code format: ACC-XXXXX-XXXXX
    const CODE_PATTERN = /^ACC-[A-Z0-9]{5}-[A-Z0-9]{5}$/;

    /**
     * Generate a unique access code
     * @returns {string} Unique access code
     */
    function generateAccessCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const usedCodes = getUsedCodes();
        let code;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            const part1 = Array.from({ length: 5 }, () => 
                chars[Math.floor(Math.random() * chars.length)]
            ).join('');
            
            const part2 = Array.from({ length: 5 }, () => 
                chars[Math.floor(Math.random() * chars.length)]
            ).join('');
            
            code = `ACC-${part1}-${part2}`;
            attempts++;
            
            if (attempts >= maxAttempts) {
                throw new Error('Failed to generate unique access code');
            }
        } while (usedCodes.includes(code));
        
        // Store the used code
        usedCodes.push(code);
        localStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));
        
        return code;
    }

    /**
     * Get list of used access codes
     * @returns {Array<string>} Array of used codes
     */
    function getUsedCodes() {
        try {
            const stored = localStorage.getItem(USED_CODES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading used codes:', error);
            return [];
        }
    }

    /**
     * Validate access code format
     * @param {string} code - Access code to validate
     * @returns {boolean} Whether code format is valid
     */
    function validateCodeFormat(code) {
        if (!code || typeof code !== 'string') {
            return false;
        }
        
        // Validate standard access code format only
        return CODE_PATTERN.test(code.toUpperCase());
    }

    /**
     * Check if code is the admin bypass code
     * @param {string} code - Code to check
     * @returns {boolean} Whether code is admin bypass
     */
    function isAdminCode(code) {
        // Admin bypass disabled for security - use proper authentication
        return false;
    }

    /**
     * Activate access with a code
     * @param {string} code - Access code to activate
     * @returns {Object} Activation result
     */
    function activateAccessCode(code) {
        if (!code) {
            return {
                success: false,
                error: 'Please enter an access code'
            };
        }

        const normalizedCode = code.toUpperCase().trim();
        
        // Admin bypass disabled for security
        // For admin access, use proper authentication systems

        // Validate code format
        if (!validateCodeFormat(normalizedCode)) {
            return {
                success: false,
                error: 'Invalid access code format'
            };
        }

        // Check if code has been used
        const usedCodes = getUsedCodes();
        if (!usedCodes.includes(normalizedCode)) {
            return {
                success: false,
                error: 'Access code not found or already used'
            };
        }

        // Grant standard access
        const accessData = {
            code: normalizedCode,
            type: 'standard',
            activatedAt: Date.now(),
            expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
            deviceId: generateDeviceId(),
            features: ['trading', 'signals']
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accessData));
        console.log('✅ Access code activated:', normalizedCode);
        
        return {
            success: true,
            type: 'standard',
            message: 'Access code activated successfully',
            expiresAt: new Date(accessData.expiresAt).toLocaleDateString(),
            features: ['Trading Signals', 'Automated Trading']
        };
    }

    /**
     * Generate unique device ID
     * @returns {string} Device identifier
     */
    function generateDeviceId() {
        const nav = window.navigator;
        const screen = window.screen;
        const deviceData = [
            nav.userAgent,
            nav.language,
            screen.width,
            screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset()
        ].join('|');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < deviceData.length; i++) {
            const char = deviceData.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return 'DEV-' + Math.abs(hash).toString(36).toUpperCase();
    }

    /**
     * Get current access status
     * @returns {Object} Access status information
     */
    function getAccessStatus() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return {
                    hasAccess: false,
                    type: null,
                    isExpired: true,
                    previewMode: true
                };
            }

            const accessData = JSON.parse(stored);
            const now = Date.now();
            
            // Admin access never expires
            if (accessData.type === 'admin' || accessData.expiresAt === Infinity) {
                return {
                    hasAccess: true,
                    type: accessData.type,
                    code: accessData.code,
                    isExpired: false,
                    previewMode: false,
                    features: accessData.features,
                    deviceId: accessData.deviceId
                };
            }

            const isExpired = now >= accessData.expiresAt;
            
            return {
                hasAccess: !isExpired,
                type: accessData.type,
                code: accessData.code,
                isExpired: isExpired,
                previewMode: isExpired,
                expiresAt: accessData.expiresAt,
                features: accessData.features,
                deviceId: accessData.deviceId
            };
        } catch (error) {
            console.error('Error reading access status:', error);
            return {
                hasAccess: false,
                type: null,
                isExpired: true,
                previewMode: true
            };
        }
    }

    /**
     * Check if user can access feature
     * @param {string} feature - Feature name (e.g., 'trading', 'signals')
     * @returns {boolean} Whether user has access to feature
     */
    function canAccessFeature(feature) {
        const status = getAccessStatus();
        
        if (!status.hasAccess) {
            return false;
        }

        // Admin has access to everything
        if (status.type === 'admin') {
            return true;
        }

        // Check if feature is in allowed features
        return status.features && status.features.includes(feature);
    }

    /**
     * Revoke current access (for device switching)
     */
    function revokeAccess() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Access revoked - ready for device switch');
            return {
                success: true,
                message: 'Access revoked. You can now activate on another device.'
            };
        } catch (error) {
            console.error('Error revoking access:', error);
            return {
                success: false,
                error: 'Failed to revoke access'
            };
        }
    }

    /**
     * Show access code entry UI
     * @param {Function} onSuccess - Callback on successful activation
     */
    function showAccessCodePrompt(onSuccess) {
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'access-code-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
                border: 2px solid rgba(99, 102, 241, 0.4);
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            ">
                <h2 style="
                    color: #6366f1;
                    margin: 0 0 20px 0;
                    font-size: 28px;
                    text-align: center;
                ">🔐 Access Code Required</h2>
                
                <p style="
                    color: #94a3b8;
                    margin-bottom: 25px;
                    text-align: center;
                    line-height: 1.6;
                ">
                    Enter your access code to unlock trading and signaler tools.<br>
                    You can switch devices using the same code.
                </p>

                <div style="margin-bottom: 20px;">
                    <input 
                        type="text" 
                        id="access-code-input"
                        placeholder="Enter access code (e.g., ACC-XXXXX-XXXXX)"
                        style="
                            width: 100%;
                            padding: 15px;
                            background: rgba(15, 23, 42, 0.9);
                            border: 2px solid rgba(99, 102, 241, 0.3);
                            border-radius: 10px;
                            color: #e0e6ed;
                            font-size: 16px;
                            font-family: monospace;
                            text-align: center;
                            text-transform: uppercase;
                        "
                    >
                </div>

                <div id="access-code-error" style="
                    color: #ef4444;
                    margin-bottom: 15px;
                    text-align: center;
                    min-height: 20px;
                    font-size: 14px;
                "></div>

                <div style="display: flex; gap: 10px;">
                    <button id="access-code-submit" style="
                        flex: 1;
                        padding: 15px;
                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        Activate Access
                    </button>
                    
                    <button id="access-code-preview" style="
                        flex: 1;
                        padding: 15px;
                        background: rgba(99, 102, 241, 0.2);
                        border: 2px solid rgba(99, 102, 241, 0.4);
                        border-radius: 10px;
                        color: #94a3b8;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        Preview Mode
                    </button>
                </div>

                <p style="
                    color: #64748b;
                    font-size: 12px;
                    text-align: center;
                    margin-top: 20px;
                ">
                    Don't have an access code? Contact support for assistance.
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        // Event handlers
        const input = document.getElementById('access-code-input');
        const submitBtn = document.getElementById('access-code-submit');
        const previewBtn = document.getElementById('access-code-preview');
        const errorDiv = document.getElementById('access-code-error');

        // Submit on Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitBtn.click();
            }
        });

        // Submit button
        submitBtn.addEventListener('click', () => {
            const code = input.value.trim();
            errorDiv.textContent = '';

            const result = activateAccessCode(code);
            
            if (result.success) {
                // Show success message
                errorDiv.style.color = '#10b981';
                errorDiv.textContent = result.message;
                
                setTimeout(() => {
                    modal.remove();
                    if (onSuccess) onSuccess(result);
                }, 1500);
            } else {
                errorDiv.style.color = '#ef4444';
                errorDiv.textContent = result.error;
            }
        });

        // Preview button
        previewBtn.addEventListener('click', () => {
            modal.remove();
            enablePreviewMode();
        });

        // Focus input
        input.focus();
    }

    /**
     * Enable preview mode (limited functionality)
     */
    function enablePreviewMode() {
        const previewData = {
            mode: 'preview',
            activatedAt: Date.now()
        };
        sessionStorage.setItem('preview_mode', JSON.stringify(previewData));
        
        // Show preview mode banner
        showPreviewBanner();
        
        console.log('📺 Preview mode enabled');
    }

    /**
     * Check if in preview mode
     * @returns {boolean} Whether user is in preview mode
     */
    function isPreviewMode() {
        const status = getAccessStatus();
        return status.previewMode || sessionStorage.getItem('preview_mode') !== null;
    }

    /**
     * Show preview mode banner
     */
    function showPreviewBanner() {
        // Remove existing banner if any
        const existingBanner = document.getElementById('preview-mode-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const banner = document.createElement('div');
        banner.id = 'preview-mode-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #dc2626, #ea580c);
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        `;
        
        banner.innerHTML = `
            <span>📺 Preview Mode - Limited Functionality</span>
            <button onclick="AccessCodeSystem.showAccessCodePrompt()" style="
                margin-left: 15px;
                padding: 6px 15px;
                background: white;
                color: #dc2626;
                border: none;
                border-radius: 5px;
                font-weight: 600;
                cursor: pointer;
            ">
                Get Full Access
            </button>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Adjust body padding to account for banner
        document.body.style.paddingTop = '48px';
    }

    /**
     * Initialize access code system
     */
    function init() {
        console.log('🔐 Access Code System initialized');
        
        const status = getAccessStatus();
        
        if (status.hasAccess) {
            console.log(`✅ Access granted: ${status.type}`);
        } else if (isPreviewMode()) {
            console.log('📺 Preview mode active');
            showPreviewBanner();
        }
    }

    // Public API
    return {
        generateAccessCode,
        activateAccessCode,
        getAccessStatus,
        canAccessFeature,
        revokeAccess,
        showAccessCodePrompt,
        enablePreviewMode,
        isPreviewMode,
        validateCodeFormat,
        init
    };
})();

// Auto-initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AccessCodeSystem.init());
    } else {
        AccessCodeSystem.init();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessCodeSystem;
}
