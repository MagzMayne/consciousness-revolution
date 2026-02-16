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
 * File: google-oauth-auth.js
 * Declaration ID: IP-358D827B-MLL28ZUZ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Google OAuth Authentication for Government Grants Portal
 * Handles user authentication via Google Sign-In
 * 
 * @author Barbrick Design
 * @date 2026-01-20
 */

(function() {
    'use strict';

    class GoogleOAuthAuth {
        constructor() {
            this.clientId = ''; // Will be set from config or environment
            this.user = null;
            this.isInitialized = false;
            this.onAuthChangeCallbacks = [];
        }

        /**
         * Initialize Google OAuth
         */
        async init(clientId) {
            if (this.isInitialized) {
                console.log('⚠️ Google OAuth already initialized');
                return;
            }

            this.clientId = clientId || this.getClientIdFromConfig();
            
            // Load Google Identity Services library
            await this.loadGoogleScript();
            
            // Initialize Google Identity Services
            if (window.google && window.google.accounts) {
                this.initializeGoogleSignIn();
                this.isInitialized = true;
                console.log('✅ Google OAuth initialized');
            } else {
                console.error('❌ Google Identity Services not loaded');
            }
        }

        /**
         * Load Google Identity Services script
         */
        loadGoogleScript() {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (window.google && window.google.accounts) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        /**
         * Initialize Google Sign-In
         */
        initializeGoogleSignIn() {
            // Check if client ID is not configured, is a placeholder, or is empty/whitespace
            if (!this.clientId || 
                (typeof this.clientId === 'string' && !this.clientId.trim()) ||
                this.clientId === 'YOUR_GOOGLE_CLIENT_ID' || 
                this.clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
                console.warn('⚠️ Google OAuth Client ID not configured - running in demo mode');
                console.info('💡 To configure: localStorage.setItem("GOOGLE_CLIENT_ID", "your-client-id.apps.googleusercontent.com")');
                this.showDemoModeNotice();
                return;
            }

            // Initialize Google Sign-In
            google.accounts.id.initialize({
                client_id: this.clientId,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });

            // Check for existing session
            this.checkExistingSession();
        }

        /**
         * Show demo mode notice
         */
        showDemoModeNotice() {
            // Add a notice to auth elements
            const authElements = document.querySelectorAll('.google-signin-button, [id*="google-signin"]');
            authElements.forEach(elem => {
                if (!elem.querySelector('.demo-notice')) {
                    const notice = document.createElement('div');
                    notice.className = 'demo-notice';
                    notice.style.cssText = 'padding: 10px; margin: 10px 0; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; color: #856404; font-size: 14px;';
                    notice.innerHTML = '⚠️ Demo Mode: Google authentication not configured. <a href="https://github.com/barbrickdesign/barbrickdesign.github.io/blob/main/IDEA_FORGE_OAUTH_SETUP.md" target="_blank" style="color: #004085;">Setup Guide</a>';
                    elem.parentNode.insertBefore(notice, elem);
                }
            });
        }

        /**
         * Handle credential response from Google
         */
        handleCredentialResponse(response) {
            try {
                // Decode JWT token
                const credential = response.credential;
                const payload = this.parseJwt(credential);
                
                this.user = {
                    id: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    emailVerified: payload.email_verified,
                    credential: credential,
                    timestamp: Date.now()
                };

                // Store in localStorage
                localStorage.setItem('google_auth_user', JSON.stringify(this.user));
                localStorage.setItem('google_auth_token', credential);

                console.log('✅ User authenticated:', this.user.email);

                // Notify listeners
                this.notifyAuthChange(true, this.user);

                // Update UI
                this.updateAuthUI(true);

            } catch (error) {
                console.error('❌ Error handling credential:', error);
            }
        }

        /**
         * Parse JWT token
         */
        parseJwt(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(jsonPayload);
            } catch (error) {
                console.error('Error parsing JWT:', error);
                return null;
            }
        }

        /**
         * Show Google Sign-In button
         */
        renderSignInButton(elementId, options = {}) {
            if (!this.isInitialized) {
                console.error('❌ Google OAuth not initialized');
                return;
            }

            const element = document.getElementById(elementId);
            if (!element) {
                console.error('❌ Element not found:', elementId);
                return;
            }

            google.accounts.id.renderButton(
                element,
                {
                    theme: options.theme || 'outline',
                    size: options.size || 'large',
                    text: options.text || 'signin_with',
                    shape: options.shape || 'rectangular',
                    logo_alignment: options.logo_alignment || 'left',
                    width: options.width || 250
                }
            );
        }

        /**
         * Sign in with popup
         */
        async signIn() {
            if (!this.isInitialized) {
                console.error('❌ Google OAuth not initialized');
                return { success: false, error: 'Not initialized' };
            }

            return new Promise((resolve) => {
                google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        console.log('⚠️ Sign-in prompt not displayed');
                        resolve({ success: false, error: 'Prompt not displayed' });
                    }
                });
            });
        }

        /**
         * Sign out
         */
        signOut() {
            if (this.user) {
                const email = this.user.email;
                
                // Clear user data
                this.user = null;
                localStorage.removeItem('google_auth_user');
                localStorage.removeItem('google_auth_token');

                // Revoke token with Google
                if (window.google && window.google.accounts) {
                    google.accounts.id.disableAutoSelect();
                }

                console.log('👋 User signed out:', email);

                // Notify listeners
                this.notifyAuthChange(false, null);

                // Update UI
                this.updateAuthUI(false);

                return { success: true };
            }
            return { success: false, error: 'No user signed in' };
        }

        /**
         * Check for existing session
         */
        checkExistingSession() {
            const userData = localStorage.getItem('google_auth_user');
            const token = localStorage.getItem('google_auth_token');

            if (userData && token) {
                try {
                    this.user = JSON.parse(userData);
                    
                    // Verify token is still valid (simple check)
                    const payload = this.parseJwt(token);
                    if (payload && payload.exp * 1000 > Date.now()) {
                        console.log('✅ Restored session for:', this.user.email);
                        this.notifyAuthChange(true, this.user);
                        this.updateAuthUI(true);
                    } else {
                        console.log('⚠️ Token expired, clearing session');
                        this.signOut();
                    }
                } catch (error) {
                    console.error('Error restoring session:', error);
                    this.signOut();
                }
            }
        }

        /**
         * Get current user
         */
        getCurrentUser() {
            return this.user;
        }

        /**
         * Check if user is authenticated
         */
        isAuthenticated() {
            return this.user !== null;
        }

        /**
         * Get client ID from config
         */
        getClientIdFromConfig() {
            // Try to get from OAuthConfig if available
            if (window.OAuthConfig) {
                try {
                    const config = new window.OAuthConfig();
                    const storedId = localStorage.getItem('GOOGLE_CLIENT_ID');
                    if (storedId && storedId !== 'YOUR_GOOGLE_CLIENT_ID' && storedId.trim().length > 0) {
                        console.log('✅ Using Google Client ID from localStorage');
                        return storedId;
                    }
                } catch (error) {
                    console.warn('Could not load from OAuthConfig:', error);
                }
            }

            // Try to get from meta tag
            const meta = document.querySelector('meta[name="google-oauth-client-id"]');
            if (meta) {
                const metaContent = meta.getAttribute('content');
                if (metaContent && metaContent.trim() &&
                    metaContent !== 'YOUR_GOOGLE_CLIENT_ID' && 
                    metaContent !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
                    return metaContent;
                }
            }

            // Try to get from global config
            if (window.GOOGLE_OAUTH_CLIENT_ID && 
                window.GOOGLE_OAUTH_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
                window.GOOGLE_OAUTH_CLIENT_ID.trim().length > 0) {
                return window.GOOGLE_OAUTH_CLIENT_ID;
            }

            if (window.GOOGLE_CLIENT_ID && 
                window.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
                window.GOOGLE_CLIENT_ID.trim().length > 0) {
                return window.GOOGLE_CLIENT_ID;
            }

            // Default to demo mode
            console.warn('⚠️ Google OAuth Client ID not configured. Using demo mode.');
            console.info('💡 To configure, run: localStorage.setItem("GOOGLE_CLIENT_ID", "your-client-id")');
            return '';
        }

        /**
         * Register auth change callback
         */
        onAuthChange(callback) {
            this.onAuthChangeCallbacks.push(callback);
        }

        /**
         * Notify auth change listeners
         */
        notifyAuthChange(isAuthenticated, user) {
            this.onAuthChangeCallbacks.forEach(callback => {
                try {
                    callback(isAuthenticated, user);
                } catch (error) {
                    console.error('Error in auth change callback:', error);
                }
            });
        }

        /**
         * Update authentication UI
         */
        updateAuthUI(isAuthenticated) {
            // Update sign-in/sign-out buttons
            const signInButtons = document.querySelectorAll('.google-signin-button');
            const signOutButtons = document.querySelectorAll('.google-signout-button');
            const userInfo = document.querySelectorAll('.google-user-info');

            signInButtons.forEach(btn => {
                btn.style.display = isAuthenticated ? 'none' : 'block';
            });

            signOutButtons.forEach(btn => {
                btn.style.display = isAuthenticated ? 'block' : 'none';
            });

            // Update user info displays
            if (isAuthenticated && this.user) {
                userInfo.forEach(elem => {
                    elem.style.display = 'block';
                    const nameElem = elem.querySelector('.user-name');
                    const emailElem = elem.querySelector('.user-email');
                    const pictureElem = elem.querySelector('.user-picture');

                    if (nameElem) nameElem.textContent = this.user.name;
                    if (emailElem) emailElem.textContent = this.user.email;
                    if (pictureElem && this.user.picture) {
                        pictureElem.src = this.user.picture;
                    }
                });
            } else {
                userInfo.forEach(elem => {
                    elem.style.display = 'none';
                });
            }

            // Trigger custom event
            window.dispatchEvent(new CustomEvent('googleAuthStateChanged', {
                detail: { isAuthenticated, user: this.user }
            }));
        }
    }

    // Create global instance
    window.googleOAuthAuth = new GoogleOAuthAuth();

    console.log('✅ Google OAuth Auth module loaded');
})();
