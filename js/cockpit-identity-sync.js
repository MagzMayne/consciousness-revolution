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
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/overkor-tek/consciousness-revolution
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Cockpit Identity Synchronization
 * Ensures Ryan and Agent R cockpits stay in sync
 * 
 * This script should be loaded by both:
 * - COMMANDER_COCKPIT.html (Ryan's command center)
 * - OPERATOR_COCKPIT_AGENT_R.html (Agent R's workspace)
 * 
 * @version 1.0.0
 * @author Ryan Barbrick
 */

(function() {
    'use strict';
    
    /**
     * Cockpit Identity Sync Manager
     */
    class CockpitIdentitySync {
        constructor() {
            this.cockpitId = this.detectCockpit();
            this.userId = this.detectUserId();
            this.canonicalName = null;
            this.syncInterval = null;
            this.syncFrequency = 5000; // Sync every 5 seconds
            
            console.log(`🔐 Cockpit Identity Sync initialized for: ${this.cockpitId}`);
            this.init();
        }
        
        /**
         * Detect which cockpit we're running in
         */
        detectCockpit() {
            const path = window.location.pathname;
            
            if (path.includes('COMMANDER_COCKPIT')) {
                return 'COMMANDER_COCKPIT';
            } else if (path.includes('OPERATOR_COCKPIT_AGENT_R')) {
                return 'OPERATOR_COCKPIT_AGENT_R';
            } else if (path.includes('AGENT_R')) {
                return 'OPERATOR_COCKPIT_AGENT_R';
            }
            
            // Try to detect from DNA block
            const dnaElement = document.getElementById('dashboard-dna');
            if (dnaElement) {
                try {
                    const dna = JSON.parse(dnaElement.textContent);
                    if (dna.name && dna.name.includes('Agent R')) {
                        return 'OPERATOR_COCKPIT_AGENT_R';
                    } else if (dna.name && dna.name.includes('Commander')) {
                        return 'COMMANDER_COCKPIT';
                    }
                } catch (e) {
                    console.warn('Failed to parse DNA block:', e);
                }
            }
            
            return 'UNKNOWN';
        }
        
        /**
         * Detect user identity from various sources
         */
        detectUserId() {
            // Check DNA block
            const dnaElement = document.getElementById('dashboard-dna');
            if (dnaElement) {
                try {
                    const dna = JSON.parse(dnaElement.textContent);
                    if (dna.realName) return dna.realName;
                    if (dna.owner) return dna.owner;
                } catch (e) {
                    // Ignore parse errors
                }
            }
            
            // Check localStorage
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) return storedUser;
            
            // Default based on cockpit
            if (this.cockpitId === 'COMMANDER_COCKPIT') {
                return 'Commander';
            } else if (this.cockpitId === 'OPERATOR_COCKPIT_AGENT_R') {
                return 'Agent R';
            }
            
            return 'Unknown';
        }
        
        /**
         * Initialize sync system
         */
        async init() {
            // Wait for agent name normalizer to load
            await this.waitForNormalizer();
            
            // Get canonical name
            this.canonicalName = this.getCanonicalName();
            
            if (this.canonicalName) {
                console.log(`✅ Identity confirmed: ${this.userId} → ${this.canonicalName}`);
                
                // Store canonical name
                localStorage.setItem('canonicalUser', this.canonicalName);
                
                // Start sync loop
                this.startSync();
                
                // Initialize GemBot sync if available
                this.initGemBotSync();
                
                // Display sync status
                this.displaySyncStatus();
            } else {
                console.warn('⚠️ Could not determine canonical identity');
            }
        }
        
        /**
         * Wait for agent name normalizer to be available
         */
        waitForNormalizer() {
            return new Promise((resolve) => {
                if (window.agentNameNormalizer) {
                    resolve();
                    return;
                }
                
                // Try to load it
                const script = document.createElement('script');
                script.src = '/src/utils/agent-name-normalizer.js';
                script.onload = () => {
                    console.log('✅ Agent name normalizer loaded');
                    setTimeout(resolve, 100);
                };
                script.onerror = () => {
                    console.warn('⚠️ Failed to load agent name normalizer');
                    resolve(); // Continue anyway
                };
                document.head.appendChild(script);
            });
        }
        
        /**
         * Get canonical name for current user
         */
        getCanonicalName() {
            if (!window.agentNameNormalizer) {
                return null;
            }
            
            return window.agentNameNormalizer.getCanonicalName(this.userId.toLowerCase());
        }
        
        /**
         * Start sync loop
         */
        startSync() {
            // Sync immediately
            this.syncData();
            
            // Then sync periodically
            this.syncInterval = setInterval(() => {
                this.syncData();
            }, this.syncFrequency);
            
            // Listen for storage events from other tabs
            window.addEventListener('storage', (e) => {
                if (e.key && e.key.startsWith('cockpit_data_')) {
                    console.log('🔄 Cross-tab sync detected:', e.key);
                    this.handleExternalSync(e);
                }
            });
        }
        
        /**
         * Sync data across cockpits
         */
        syncData() {
            const key = `cockpit_data_${this.cockpitId}`;
            const timestamp = Date.now();
            
            // Get current cockpit data
            const data = {
                cockpitId: this.cockpitId,
                userId: this.userId,
                canonicalName: this.canonicalName,
                timestamp: timestamp,
                url: window.location.href,
                lastActive: timestamp
            };
            
            // Store locally
            localStorage.setItem(key, JSON.stringify(data));
            
            // If Ryan/Agent R, sync to other cockpit
            if (this.canonicalName === 'ryan') {
                const otherCockpitKey = this.cockpitId === 'COMMANDER_COCKPIT' 
                    ? 'cockpit_data_OPERATOR_COCKPIT_AGENT_R'
                    : 'cockpit_data_COMMANDER_COCKPIT';
                
                // Read other cockpit data
                const otherData = localStorage.getItem(otherCockpitKey);
                
                if (otherData) {
                    try {
                        const parsed = JSON.parse(otherData);
                        
                        // Check if we have newer data
                        if (!parsed.timestamp || data.timestamp > parsed.timestamp) {
                            // Update shared sync marker
                            localStorage.setItem('cockpit_sync_marker', JSON.stringify({
                                from: this.cockpitId,
                                timestamp: timestamp,
                                canonicalName: this.canonicalName
                            }));
                        }
                    } catch (e) {
                        console.error('Failed to parse other cockpit data:', e);
                    }
                }
            }
        }
        
        /**
         * Handle sync from other tabs
         */
        handleExternalSync(event) {
            if (!event.newValue) return;
            
            try {
                const data = JSON.parse(event.newValue);
                
                // If it's from the other cockpit for the same user, acknowledge it
                if (data.canonicalName === this.canonicalName && 
                    data.cockpitId !== this.cockpitId) {
                    console.log(`🔄 Synced with ${data.cockpitId} at ${new Date(data.timestamp).toLocaleTimeString()}`);
                    
                    // Update last sync time
                    this.lastSyncTime = data.timestamp;
                    this.updateSyncIndicator(true);
                }
            } catch (e) {
                console.error('Failed to handle external sync:', e);
            }
        }
        
        /**
         * Initialize GemBot sync if available
         */
        initGemBotSync() {
            if (window.gembotSync) {
                console.log('🔗 Initializing GemBot cockpit sync');
                window.gembotSync.syncCockpitIdentity(this.userId);
                
                // Listen for cockpit sync events
                window.gembotSync.on('cockpit-synced', (data) => {
                    console.log('✅ GemBot cockpit sync:', data);
                    this.updateSyncIndicator(true);
                });
            }
        }
        
        /**
         * Display sync status on the page
         */
        displaySyncStatus() {
            // Look for a connection status element
            const statusElement = document.getElementById('connection-text') || 
                                document.querySelector('.connection-status span');
            
            if (statusElement && this.canonicalName === 'ryan') {
                const otherCockpit = this.cockpitId === 'COMMANDER_COCKPIT' ? 'Agent R' : 'Commander';
                statusElement.textContent = `Connected (Synced with ${otherCockpit})`;
            }
        }
        
        /**
         * Update sync indicator
         */
        updateSyncIndicator(synced) {
            const statusDot = document.getElementById('status-dot') ||
                            document.querySelector('.status-dot');
            
            if (statusDot && synced) {
                statusDot.classList.remove('connecting');
                statusDot.classList.add('connected');
            }
        }
        
        /**
         * Stop sync
         */
        stop() {
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
            }
            console.log('🛑 Cockpit sync stopped');
        }
        
        /**
         * Get sync status
         */
        getStatus() {
            return {
                cockpitId: this.cockpitId,
                userId: this.userId,
                canonicalName: this.canonicalName,
                isActive: this.syncInterval !== null,
                lastSyncTime: this.lastSyncTime || null
            };
        }
    }
    
    // Auto-initialize when DOM is ready
    function initCockpitSync() {
        if (window.cockpitIdentitySync) {
            console.log('ℹ️ Cockpit sync already initialized');
            return window.cockpitIdentitySync;
        }
        
        window.cockpitIdentitySync = new CockpitIdentitySync();
        return window.cockpitIdentitySync;
    }
    
    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCockpitSync);
    } else {
        initCockpitSync();
    }
    
    // Expose class for manual initialization
    window.CockpitIdentitySync = CockpitIdentitySync;
    window.initCockpitSync = initCockpitSync;
    
})();
