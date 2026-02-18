/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * User Identity Manager
 * Centralized system for automatic user identification across all authentication methods
 * 
 * Features:
 * - Automatic user recognition from wallet, Google, or GitHub auth
 * - Persistent user profiles with unique IDs
 * - Cross-session identification
 * - Privacy-focused local storage
 * 
 * @author Barbrick Design
 * @date 2026-02-18
 */

(function() {
    'use strict';

    class UserIdentityManager {
        constructor() {
            this.userId = null;
            this.userProfile = null;
            this.authMethod = null;
            this.onIdentityChangeCallbacks = [];
            
            // Initialize on load
            this.init();
        }

        /**
         * Initialize user identity manager
         */
        init() {
            console.log('🔐 Initializing User Identity Manager...');
            
            // Try to identify user from existing session
            this.identifyUser();
            
            // Listen for auth state changes
            this.setupAuthListeners();
            
            console.log('✅ User Identity Manager ready');
        }

        /**
         * Automatically identify user from various authentication methods
         */
        identifyUser() {
            // Priority order: Wallet > Google > GitHub > Anonymous
            
            // 1. Check for wallet authentication
            const walletAuth = this.checkWalletAuth();
            if (walletAuth) {
                this.setIdentity(walletAuth);
                return true;
            }
            
            // 2. Check for Google OAuth
            const googleAuth = this.checkGoogleAuth();
            if (googleAuth) {
                this.setIdentity(googleAuth);
                return true;
            }
            
            // 3. Check for GitHub auth (from devPortal)
            const githubAuth = this.checkGitHubAuth();
            if (githubAuth) {
                this.setIdentity(githubAuth);
                return true;
            }
            
            // 4. Check for existing anonymous user ID
            const anonymousId = this.checkAnonymousUser();
            if (anonymousId) {
                this.setIdentity(anonymousId);
                return true;
            }
            
            // 5. Create new anonymous user
            this.createAnonymousUser();
            return false;
        }

        /**
         * Check for wallet-based authentication
         */
        checkWalletAuth() {
            try {
                const sessionData = localStorage.getItem('barbrick_auth_session');
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    
                    // Check if session is still valid (not expired)
                    if (session.expiresAt && Date.now() < session.expiresAt) {
                        return {
                            userId: `wallet_${session.walletAddress}`,
                            authMethod: 'wallet',
                            walletType: session.walletType || 'ethereum',
                            walletAddress: session.walletAddress,
                            name: this.formatWalletName(session.walletAddress),
                            email: null,
                            picture: null,
                            verified: true,
                            timestamp: session.timestamp || Date.now()
                        };
                    }
                }
            } catch (error) {
                console.error('Error checking wallet auth:', error);
            }
            return null;
        }

        /**
         * Check for Google OAuth authentication
         */
        checkGoogleAuth() {
            try {
                const userData = localStorage.getItem('google_auth_user');
                const token = localStorage.getItem('google_auth_token');
                
                if (userData && token) {
                    const user = JSON.parse(userData);
                    
                    return {
                        userId: `google_${user.id}`,
                        authMethod: 'google',
                        email: user.email,
                        name: user.name,
                        picture: user.picture,
                        emailVerified: user.emailVerified,
                        verified: true,
                        timestamp: user.timestamp || Date.now()
                    };
                }
            } catch (error) {
                console.error('Error checking Google auth:', error);
            }
            return null;
        }

        /**
         * Check for GitHub authentication
         */
        checkGitHubAuth() {
            try {
                // Check for GitHub auth from devPortal
                const githubData = localStorage.getItem('github_user');
                if (githubData) {
                    const user = JSON.parse(githubData);
                    
                    return {
                        userId: `github_${user.id || user.login}`,
                        authMethod: 'github',
                        email: user.email,
                        name: user.name || user.login,
                        username: user.login,
                        picture: user.avatar_url,
                        verified: true,
                        timestamp: Date.now()
                    };
                }
            } catch (error) {
                console.error('Error checking GitHub auth:', error);
            }
            return null;
        }

        /**
         * Check for existing anonymous user
         */
        checkAnonymousUser() {
            try {
                const anonymousData = localStorage.getItem('barbrick_anonymous_user');
                if (anonymousData) {
                    const user = JSON.parse(anonymousData);
                    return {
                        userId: user.userId,
                        authMethod: 'anonymous',
                        name: 'Anonymous User',
                        email: null,
                        picture: null,
                        verified: false,
                        timestamp: user.timestamp || Date.now()
                    };
                }
            } catch (error) {
                console.error('Error checking anonymous user:', error);
            }
            return null;
        }

        /**
         * Create new anonymous user
         */
        createAnonymousUser() {
            const anonymousId = `anon_${this.generateId()}`;
            const userData = {
                userId: anonymousId,
                timestamp: Date.now()
            };
            
            localStorage.setItem('barbrick_anonymous_user', JSON.stringify(userData));
            
            this.setIdentity({
                userId: anonymousId,
                authMethod: 'anonymous',
                name: 'Anonymous User',
                email: null,
                picture: null,
                verified: false,
                timestamp: Date.now()
            });
        }

        /**
         * Set user identity
         */
        setIdentity(identityData) {
            this.userId = identityData.userId;
            this.authMethod = identityData.authMethod;
            this.userProfile = {
                ...identityData,
                lastSeen: Date.now()
            };
            
            // Store in localStorage
            localStorage.setItem('barbrick_user_identity', JSON.stringify(this.userProfile));
            
            console.log(`✅ User identified: ${identityData.authMethod} - ${identityData.name}`);
            
            // Notify listeners
            this.notifyIdentityChange(this.userProfile);
        }

        /**
         * Get current user identity
         */
        getIdentity() {
            return this.userProfile;
        }

        /**
         * Get user ID
         */
        getUserId() {
            return this.userId;
        }

        /**
         * Check if user is identified
         */
        isIdentified() {
            return this.userId !== null && this.authMethod !== 'anonymous';
        }

        /**
         * Check if user is verified (has authenticated)
         */
        isVerified() {
            return this.userProfile && this.userProfile.verified === true;
        }

        /**
         * Get user display name
         */
        getDisplayName() {
            if (!this.userProfile) return 'Guest';
            return this.userProfile.name || this.userProfile.email || 'User';
        }

        /**
         * Setup authentication listeners
         */
        setupAuthListeners() {
            // Listen for wallet auth changes
            window.addEventListener('walletConnected', (e) => {
                console.log('🔗 Wallet connected event detected');
                this.identifyUser();
            });
            
            // Listen for Google auth changes
            window.addEventListener('googleAuthStateChanged', (e) => {
                console.log('🔗 Google auth state changed');
                this.identifyUser();
            });
            
            // Listen for sign-out events
            window.addEventListener('userSignedOut', () => {
                console.log('👋 User signed out');
                this.handleSignOut();
            });
        }

        /**
         * Handle user sign-out
         */
        handleSignOut() {
            const oldUserId = this.userId;
            
            // Create new anonymous user
            this.createAnonymousUser();
            
            console.log(`🔄 Transitioned from ${oldUserId} to anonymous`);
        }

        /**
         * Register identity change callback
         */
        onIdentityChange(callback) {
            this.onIdentityChangeCallbacks.push(callback);
        }

        /**
         * Notify identity change listeners
         */
        notifyIdentityChange(identity) {
            this.onIdentityChangeCallbacks.forEach(callback => {
                try {
                    callback(identity);
                } catch (error) {
                    console.error('Error in identity change callback:', error);
                }
            });
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('userIdentityChanged', {
                detail: { identity }
            }));
        }

        /**
         * Format wallet address for display
         */
        formatWalletName(address) {
            if (!address) return 'Unknown Wallet';
            return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        }

        /**
         * Generate unique ID
         */
        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
        }

        /**
         * Get user metadata for analytics
         */
        getUserMetadata() {
            return {
                userId: this.userId,
                authMethod: this.authMethod,
                isVerified: this.isVerified(),
                timestamp: this.userProfile ? this.userProfile.timestamp : null,
                lastSeen: this.userProfile ? this.userProfile.lastSeen : null
            };
        }

        /**
         * Update user profile
         */
        updateProfile(updates) {
            if (!this.userProfile) return;
            
            this.userProfile = {
                ...this.userProfile,
                ...updates,
                lastSeen: Date.now()
            };
            
            localStorage.setItem('barbrick_user_identity', JSON.stringify(this.userProfile));
            this.notifyIdentityChange(this.userProfile);
        }
    }

    // Create global instance
    window.userIdentityManager = new UserIdentityManager();

    console.log('✅ User Identity Manager module loaded');
})();
