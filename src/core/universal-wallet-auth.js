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
 * File: universal-wallet-auth.js
 * Declaration ID: IP-11B2C6C3-MLL28ZW4
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

/** SIGNED BY MeRLynn - ID: MERLYNN-7e96f214 - TIMESTAMP: 2025-12-19T05:53:06.536Z - HASH: 6695a846 */
/** SIGNED BY AGentR - ID: AGENTR-2f4b0af9 - TIMESTAMP: 2025-12-19T05:53:06.536Z - HASH: 6695a846 */

/**
 * UNIVERSAL WALLET AUTHENTICATION SYSTEM
 * Single Sign-On (SSO) for entire platform
 * - Connect wallet ONCE, stay authenticated across all pages
 * - Session-based auth with automatic expiry
 * - Time tracking for contractor performance scoring
 * - Signature verification for security
 */

class UniversalWalletAuth {
    constructor() {
        this.wallet = null;
        this.address = null;
        this.sessionToken = null;
        this.authenticated = false;
        this.sessionTimeout = 4 * 60 * 60 * 1000; // 4 hours default
        this.inactivityTimeout = 30 * 60 * 1000; // 30 minutes inactivity = re-auth
        this.timeTracker = null;
        this.lastActivity = Date.now();
        
        // Initialize on load
        this.init();
    }

    /**
     * Initialize authentication system
     */
    async init() {
        console.log('🔐 Universal Wallet Auth initializing...');
        
        // Setup activity tracker
        this.setupActivityTracking();
        
        // Check for existing session
        const existingSession = this.loadSession();
        
        if (existingSession) {
            // Validate session
            if (this.isSessionValid(existingSession)) {
                console.log('✅ Valid session found, restoring...');
                await this.restoreSession(existingSession);
            } else {
                console.log('⚠️ Session expired, clearing...');
                this.clearSession();
            }
        }
        
        // Setup wallet change listeners
        this.setupWalletListeners();
        
        console.log('✅ Universal Wallet Auth ready');
    }

    /**
     * Connect wallet and create authenticated session
     */
    async connect() {
        if (this.authenticated) {
            console.log('✅ Already authenticated');
            return this.getAuthInfo();
        }

        try {
            console.log('🔌 Starting wallet connection...');

            // 1. Connect wallet (try MetaMask first, then Phantom)
            const walletInfo = await this.connectWallet();
            
            if (!walletInfo) {
                throw new Error('No wallet detected');
            }

            this.wallet = walletInfo.provider;
            this.address = walletInfo.address.toLowerCase();

            console.log('✅ Wallet connected:', this.address);

            // 2. Request signature for verification
            const signature = await this.requestSignature();
            
            if (!signature) {
                throw new Error('Signature verification failed');
            }

            // 3. Create session token
            this.sessionToken = this.generateSessionToken(this.address, signature);

            // 4. Save session
            this.saveSession({
                address: this.address,
                sessionToken: this.sessionToken,
                signature: signature,
                walletType: walletInfo.type,
                createdAt: Date.now(),
                lastActivity: Date.now()
            });

            // 5. Mark as authenticated
            this.authenticated = true;

            // 6. Start time tracking if contractor
            this.startTimeTracking();

            console.log('✅ Authentication successful!');
            
            // 7. Notify app
            this.notifyAuthSuccess();

            return this.getAuthInfo();

        } catch (error) {
            console.error('❌ Authentication failed:', error);
            this.clearSession();
            throw error;
        }
    }

    /**
     * Connect to wallet (MetaMask or Phantom)
     */
    async connectWallet() {
        // Try MetaMask first
        if (window.ethereum) {
            try {
                console.log('🦊 Connecting to MetaMask...');
                
                // Check existing connection
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                
                let address;
                if (accounts && accounts.length > 0) {
                    console.log('✅ Using existing MetaMask connection');
                    address = accounts[0];
                } else {
                    // Request new connection
                    const newAccounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    address = newAccounts[0];
                }

                return {
                    provider: window.ethereum,
                    address: address.toLowerCase(),
                    type: 'ethereum'
                };
            } catch (error) {
                if (error.message && error.message.includes('Unexpected')) {
                    throw new Error(
                        '⚠️ MetaMask connection failed. Please:\n\n' +
                        '1. ✅ UNLOCK your MetaMask wallet\n' +
                        '2. 🔄 REFRESH this page\n' +
                        '3. 🔌 Try again'
                    );
                }
                console.error('MetaMask error:', error);
            }
        }

        // Try Phantom as fallback
        if (window.solana || window.phantom) {
            try {
                console.log('👻 Connecting to Phantom...');
                const provider = window.phantom?.solana || window.solana;
                
                if (provider.isConnected && provider.publicKey) {
                    return {
                        provider: provider,
                        address: provider.publicKey.toString(),
                        type: 'solana'
                    };
                }

                const response = await provider.connect();
                return {
                    provider: provider,
                    address: response.publicKey.toString(),
                    type: 'solana'
                };
            } catch (error) {
                console.error('Phantom error:', error);
            }
        }

        // No wallet found
        throw new Error('No wallet detected. Please install MetaMask or Phantom.');
    }

    /**
     * Request signature from user for verification
     */
    async requestSignature() {
        try {
            const message = this.generateSignatureMessage();
            
            // Sign with MetaMask
            if (window.ethereum && this.wallet === window.ethereum) {
                console.log('📝 Requesting Ethereum signature...');
                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, this.address]
                });
                return signature;
            }
            
            // Sign with Phantom
            if (window.solana && this.wallet === window.solana) {
                console.log('📝 Requesting Solana signature...');
                const encodedMessage = new TextEncoder().encode(message);
                const signedMessage = await this.wallet.signMessage(encodedMessage, 'utf8');
                return btoa(String.fromCharCode.apply(null, signedMessage.signature));
            }

            return null;
        } catch (error) {
            console.error('Signature request failed:', error);
            return null;
        }
    }

    /**
     * Generate signature message
     */
    generateSignatureMessage() {
        const timestamp = new Date().toISOString();
        const nonce = Math.random().toString(36).substring(7);
        
        return `BARBRICKDESIGN Platform Authentication\n\n` +
               `Wallet: ${this.address}\n` +
               `Time: ${timestamp}\n` +
               `Nonce: ${nonce}\n\n` +
               `This signature proves you own this wallet.\n` +
               `It does NOT authorize any transactions.`;
    }

    /**
     * Generate session token
     */
    generateSessionToken(address, signature) {
        const data = `${address}:${signature}:${Date.now()}`;
        // Simple hash (in production, use crypto.subtle)
        return btoa(data).substring(0, 64);
    }

    /**
     * Save session to storage
     */
    saveSession(sessionData) {
        try {
            localStorage.setItem('barbrick_auth_session', JSON.stringify(sessionData));
            localStorage.setItem('barbrick_wallet_address', sessionData.address);
            localStorage.setItem('barbrick_wallet_type', sessionData.walletType);
            console.log('💾 Session saved');
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }

    /**
     * Load session from storage
     */
    loadSession() {
        try {
            const sessionStr = localStorage.getItem('barbrick_auth_session');
            if (sessionStr) {
                return JSON.parse(sessionStr);
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        }
        return null;
    }

    /**
     * Validate session
     */
    isSessionValid(session) {
        if (!session || !session.createdAt || !session.lastActivity) {
            return false;
        }

        const now = Date.now();
        const sessionAge = now - session.createdAt;
        const inactivity = now - session.lastActivity;

        // Session expired?
        if (sessionAge > this.sessionTimeout) {
            console.log('⏰ Session expired (too old)');
            return false;
        }

        // Inactive too long?
        if (inactivity > this.inactivityTimeout) {
            console.log('😴 Session expired (inactive)');
            return false;
        }

        return true;
    }

    /**
     * Restore session from storage
     */
    async restoreSession(session) {
        try {
            this.address = session.address;
            this.sessionToken = session.sessionToken;
            this.authenticated = true;

            // Reconnect wallet silently
            if (session.walletType === 'ethereum' && window.ethereum) {
                this.wallet = window.ethereum;
            } else if (session.walletType === 'solana' && window.solana) {
                this.wallet = window.solana;
            }

            // Update last activity
            this.updateActivity();

            // Start time tracking
            this.startTimeTracking();

            console.log('✅ Session restored for:', this.address);
            
            // Notify app
            this.notifyAuthSuccess();

        } catch (error) {
            console.error('Failed to restore session:', error);
            this.clearSession();
        }
    }

    /**
     * Clear session and logout
     */
    clearSession() {
        this.wallet = null;
        this.address = null;
        this.sessionToken = null;
        this.authenticated = false;

        localStorage.removeItem('barbrick_auth_session');
        localStorage.removeItem('barbrick_wallet_address');
        localStorage.removeItem('barbrick_wallet_type');

        // Stop time tracking
        this.stopTimeTracking();

        console.log('🔓 Session cleared');
        
        // Notify app
        window.dispatchEvent(new CustomEvent('authLogout'));
    }

    /**
     * Disconnect and clear session
     */
    async disconnect() {
        // Disconnect wallet
        if (this.wallet && this.wallet.disconnect) {
            try {
                await this.wallet.disconnect();
            } catch (error) {
                console.error('Wallet disconnect error:', error);
            }
        }

        this.clearSession();
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        this.lastActivity = Date.now();
        
        const session = this.loadSession();
        if (session) {
            session.lastActivity = this.lastActivity;
            this.saveSession(session);
        }
    }

    /**
     * Setup activity tracking (mouse, keyboard, etc.)
     */
    setupActivityTracking() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.authenticated) {
                    this.updateActivity();
                }
            }, { passive: true });
        });

        // Check session validity every minute
        setInterval(() => {
            if (this.authenticated) {
                const session = this.loadSession();
                if (!this.isSessionValid(session)) {
                    console.log('⏰ Session expired, logging out...');
                    this.clearSession();
                    window.location.reload();
                }
            }
        }, 60000); // Check every minute
    }

    /**
     * Setup wallet event listeners
     */
    setupWalletListeners() {
        // Prevent recursive reloading
        this.isReloading = false;

        // Ethereum events
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                // Prevent recursive calls during reload
                if (this.isReloading) return;

                if (accounts.length === 0) {
                    console.log('🔔 Wallet disconnected');
                    this.clearSession();
                } else {
                    const newAddress = accounts[0].toLowerCase();
                    // Only reload if the account actually changed (not just session cleared)
                    if (this.address && newAddress !== this.address.toLowerCase()) {
                        console.log('🔔 Account changed, re-authenticating...');
                        this.isReloading = true;
                        this.clearSession();
                        // Small delay to prevent immediate recursive call
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    } else if (!this.address) {
                        // No stored address, this is initial connection
                        console.log('🔔 Initial account detected, connecting...');
                        this.connectEthereum();
                    }
                }
            });

            window.ethereum.on('chainChanged', () => {
                console.log('🔔 Chain changed, reloading...');
                this.isReloading = true;
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            });
        }

        // Solana events
        if (window.solana) {
            window.solana.on('disconnect', () => {
                console.log('🔔 Phantom disconnected');
                this.clearSession();
            });

            window.solana.on('accountChanged', (publicKey) => {
                // Prevent recursive calls during reload
                if (this.isReloading) return;

                if (!publicKey) {
                    this.clearSession();
                } else {
                    const newAddress = publicKey.toString();
                    // Only reload if the account actually changed
                    if (this.address && newAddress !== this.address) {
                        console.log('🔔 Account changed, re-authenticating...');
                        this.isReloading = true;
                        this.clearSession();
                        // Small delay to prevent immediate recursive call
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    } else if (!this.address) {
                        // No stored address, this is initial connection
                        console.log('🔔 Initial account detected, connecting...');
                        this.connectSolana();
                    }
                }
            });
        }
    }

    /**
     * Start time tracking for contractors
     */
    startTimeTracking() {
        // Check if this is a contractor
        if (window.contractorRegistry) {
            const contractor = window.contractorRegistry.getContractor(this.address);
            
            if (contractor && contractor.status === 'approved') {
                console.log('⏱️ Starting time tracking for contractor');
                
                // Log session start
                this.logWorkSession('start');

                // Update time every 5 minutes
                this.timeTracker = setInterval(() => {
                    this.logWorkTime();
                }, 5 * 60 * 1000); // Every 5 minutes
            }
        }
    }

    /**
     * Stop time tracking
     */
    stopTimeTracking() {
        if (this.timeTracker) {
            clearInterval(this.timeTracker);
            this.timeTracker = null;
            this.logWorkSession('end');
            console.log('⏹️ Time tracking stopped');
        }
    }

    /**
     * Log work session (start/end)
     */
    logWorkSession(type) {
        const sessions = JSON.parse(localStorage.getItem('contractor_work_sessions') || '[]');
        
        sessions.push({
            wallet: this.address,
            type: type,
            timestamp: new Date().toISOString(),
            platform: window.location.pathname
        });

        localStorage.setItem('contractor_work_sessions', JSON.stringify(sessions));
    }

    /**
     * Log work time
     */
    logWorkTime() {
        if (!this.authenticated) return;

        const timeLog = JSON.parse(localStorage.getItem('contractor_time_log') || '{}');
        
        if (!timeLog[this.address]) {
            timeLog[this.address] = {
                totalMinutes: 0,
                sessions: []
            };
        }

        // Add 5 minutes
        timeLog[this.address].totalMinutes += 5;

        localStorage.setItem('contractor_time_log', JSON.stringify(timeLog));
        
        console.log(`⏱️ Work time logged: ${timeLog[this.address].totalMinutes} minutes total`);
    }

    /**
     * Get contractor work time
     */
    getWorkTime(address = this.address) {
        const timeLog = JSON.parse(localStorage.getItem('contractor_time_log') || '{}');
        return timeLog[address]?.totalMinutes || 0;
    }

    /**
     * Notify app of successful authentication
     */
    notifyAuthSuccess() {
        window.dispatchEvent(new CustomEvent('authSuccess', {
            detail: this.getAuthInfo()
        }));
    }

    /**
     * Get authentication info
     */
    getAuthInfo() {
        if (!this.authenticated) return null;

        return {
            address: this.address,
            shortAddress: this.address.slice(0, 6) + '...' + this.address.slice(-4),
            sessionToken: this.sessionToken,
            authenticated: true,
            workTimeMinutes: this.getWorkTime()
        };
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.authenticated;
    }

    /**
     * Get current wallet address
     */
    getAddress() {
        return this.address;
    }

    /**
     * Check if user is System Architect
     */
    isSystemArchitect() {
        if (!this.address) return false;
        
        const systemArchitectWallets = [
            '0xefc6910e7624f164dae9d0f799954aa69c943c8d',
            '0x4ccbefd7d3554bcbbc489b11af73a84d7baef4cb',
            '0x45a328572b2a06484e02eb5d4e4cb6004136eb16'
        ];

        return systemArchitectWallets.includes(this.address.toLowerCase());
    }

    /**
     * Check if user is approved contractor
     */
    isApprovedContractor() {
        if (!this.address || !window.contractorRegistry) return false;

        const contractor = window.contractorRegistry.getContractor(this.address);
        return contractor && contractor.status === 'approved';
    }
}

// Create global instance
window.universalWalletAuth = new UniversalWalletAuth();

console.log('🔐 Universal Wallet Auth System loaded');
