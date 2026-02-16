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
 * File: email-auth.js
 * Declaration ID: IP-59FA11E2-MLL28ZUR
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
 * Email Authentication System
 * Provides email-based authentication for bCert.html
 * 
 * ⚠️ IMPORTANT SECURITY NOTICE ⚠️
 * This is a CLIENT-SIDE ONLY implementation for a static GitHub Pages site.
 * It is NOT production-ready and has inherent security limitations:
 * 
 * LIMITATIONS:
 * - No server-side validation or session management
 * - Password hashes stored in localStorage (accessible to JavaScript)
 * - No protection against XSS attacks accessing stored credentials
 * - No rate limiting for login attempts
 * - No email verification
 * - SHA-256 alone is not recommended for password hashing (needs salt + KDF)
 * 
 * FOR PRODUCTION USE:
 * - Implement proper backend authentication (Node.js, Python, etc.)
 * - Use bcrypt, scrypt, or Argon2 for password hashing with salt
 * - Store credentials server-side with proper access controls
 * - Use secure HTTP-only cookies for session management
 * - Implement rate limiting and account lockout
 * - Add email verification and 2FA
 * - Use JWT tokens with proper expiration
 * - Implement CSRF protection
 * - Add comprehensive input validation and sanitization
 * 
 * This implementation is suitable ONLY for:
 * - Educational purposes and demos
 * - Non-sensitive applications
 * - Prototyping and proof-of-concept
 * 
 * Uses localStorage for persistence (client-side only)
 */

(function() {
    'use strict';

    // Create email auth object
    window.emailAuth = {
        // State
        _isAuthenticated: false,
        _email: null,
        _userId: null,
        _authType: 'email',

        // Check if authenticated
        isAuthenticated() {
            return this._isAuthenticated;
        },

        // Get user email
        getEmail() {
            return this._email;
        },

        // Get user ID
        getUserId() {
            return this._userId;
        },

        // Get auth type
        getAuthType() {
            return this._authType;
        },

        // Validate email format
        _isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        // Generate user ID from email
        async _generateUserId(email) {
            // Use Web Crypto API for better hash generation
            if (typeof crypto !== 'undefined' && crypto.subtle) {
                try {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(email.toLowerCase());
                    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    return 'user_' + hashHex.substring(0, 16);
                } catch (error) {
                    console.error('Failed to generate secure user ID:', error);
                }
            }
            
            // Fallback: Simple hash function for user ID (for older browsers)
            let hash = 0;
            for (let i = 0; i < email.length; i++) {
                const char = email.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return 'user_' + Math.abs(hash).toString(36);
        },

        // Hash password using Web Crypto API
        async _hashPassword(password) {
            // Use Web Crypto API for hashing (SHA-256)
            // NOTE: SHA-256 alone is not recommended for password hashing in production
            // Production apps should use PBKDF2, bcrypt, scrypt, or Argon2 with salt
            // This is a client-side demo implementation only
            if (typeof crypto !== 'undefined' && crypto.subtle) {
                try {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(password);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    return hashHex;
                } catch (error) {
                    console.error('Failed to hash password:', error);
                }
            }
            
            // Fallback: base64 encoding for older browsers (NOT secure - demo only)
            // WARNING: In production, always use server-side hashing with bcrypt/argon2
            // This fallback exists only for compatibility with very old browsers
            console.warn('⚠️ SECURITY WARNING: Using insecure password storage - Web Crypto API not available');
            console.warn('⚠️ This is for DEMO purposes only. DO NOT use in production.');
            return btoa(password);
        },

        // Sign up with email
        async signUp(email, password) {
            console.log('📧 Email sign-up requested...');

            // Validate email
            if (!this._isValidEmail(email)) {
                return {
                    success: false,
                    error: 'Invalid email format. Please enter a valid email address.'
                };
            }

            // Validate password
            if (!password || password.length < 6) {
                return {
                    success: false,
                    error: 'Password must be at least 6 characters long.'
                };
            }

            // Check if user already exists
            const existingUser = localStorage.getItem(`email_auth_${email}`);
            if (existingUser) {
                return {
                    success: false,
                    error: 'An account with this email already exists. Please sign in instead.'
                };
            }

            // Create new user account
            const userId = await this._generateUserId(email);
            const passwordHash = await this._hashPassword(password);
            
            const userData = {
                email: email,
                // Store hashed password using SHA-256 (Web Crypto API)
                // WARNING: This is client-side only for demo purposes
                // In production, ALWAYS use server-side authentication with proper hashing
                passwordHash: passwordHash,
                userId: userId,
                createdAt: new Date().toISOString(),
                verified: false // Email verification would happen here in production
            };

            // Save user data
            localStorage.setItem(`email_auth_${email}`, JSON.stringify(userData));
            
            // Set authentication state
            this._isAuthenticated = true;
            this._email = email;
            this._userId = userId;
            
            // Save current session
            localStorage.setItem('bcert_auth_type', 'email');
            localStorage.setItem('bcert_email', email);

            console.log('✅ Email account created:', email);
            return {
                success: true,
                email: email,
                userId: userId,
                message: 'Account created successfully!'
            };
        },

        // Sign in with email
        async signIn(email, password) {
            console.log('🔐 Email sign-in requested...');

            // Validate email
            if (!this._isValidEmail(email)) {
                return {
                    success: false,
                    error: 'Invalid email format.'
                };
            }

            // Get user data
            const userDataStr = localStorage.getItem(`email_auth_${email}`);
            if (!userDataStr) {
                return {
                    success: false,
                    error: 'No account found with this email. Please sign up first.'
                };
            }

            const userData = JSON.parse(userDataStr);

            // Verify password by comparing hashes
            const passwordHash = await this._hashPassword(password);
            if (passwordHash !== userData.passwordHash) {
                return {
                    success: false,
                    error: 'Incorrect password. Please try again.'
                };
            }

            // Set authentication state
            this._isAuthenticated = true;
            this._email = email;
            this._userId = userData.userId;
            
            // Save current session
            localStorage.setItem('bcert_auth_type', 'email');
            localStorage.setItem('bcert_email', email);

            console.log('✅ Email sign-in successful:', email);
            return {
                success: true,
                email: email,
                userId: userData.userId,
                message: 'Signed in successfully!'
            };
        },

        // Auto-connect if previously authenticated
        async autoConnect() {
            const authType = localStorage.getItem('bcert_auth_type');
            const savedEmail = localStorage.getItem('bcert_email');

            if (authType === 'email' && savedEmail) {
                const userDataStr = localStorage.getItem(`email_auth_${savedEmail}`);
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    this._isAuthenticated = true;
                    this._email = savedEmail;
                    this._userId = userData.userId;
                    
                    console.log('✅ Auto-connected with email:', savedEmail);
                    return {
                        success: true,
                        email: savedEmail,
                        userId: userData.userId
                    };
                }
            }

            return { success: false };
        },

        // Sign out
        signOut() {
            this._isAuthenticated = false;
            this._email = null;
            this._userId = null;
            
            localStorage.removeItem('bcert_auth_type');
            localStorage.removeItem('bcert_email');
            
            console.log('👋 Email sign-out successful');
            return { success: true };
        },

        // Get short display name (first part of email)
        getShortName() {
            if (!this._email) return null;
            return this._email.split('@')[0];
        },

        // Reset password (simple implementation)
        async resetPassword(email) {
            console.log('🔄 Password reset requested for:', email);
            
            // Validate email
            if (!this._isValidEmail(email)) {
                return {
                    success: false,
                    error: 'Invalid email format.'
                };
            }

            // Check if user exists
            const userDataStr = localStorage.getItem(`email_auth_${email}`);
            if (!userDataStr) {
                return {
                    success: false,
                    error: 'No account found with this email.'
                };
            }

            // In a real application, this would send a password reset email
            // For this demo, we'll just return a success message
            return {
                success: true,
                message: 'Password reset instructions would be sent to your email. (Demo mode - no actual email sent)'
            };
        }
    };

    console.log('✅ Email Authentication System loaded');
})();
