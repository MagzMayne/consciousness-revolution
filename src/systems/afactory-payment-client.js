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
 * File: afactory-payment-client.js
 * Declaration ID: IP-59AE0BFF-MLL28ZW6
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
 * AFACTORY PAYMENT CLIENT
 * 
 * Client-side script for aFactory.html to communicate with payment automation backend
 * Handles real payment processing (NOT simulation)
 * 
 * This connects to the backend payment service to process actual PayPal transactions
 */

class AFactoryPaymentClient {
    constructor(config = {}) {
        this.config = {
            // Backend API Configuration
            apiBaseUrl: config.apiBaseUrl || process.env.PAYMENT_API_URL || 'https://afactory-payments.vercel.app/api/payments',
            apiKey: config.apiKey || process.env.AFACTORY_API_KEY || localStorage.getItem('afactory_api_key'),
            
            // Local Configuration
            autoSync: config.autoSync !== false,
            syncInterval: config.syncInterval || 60000, // 1 minute
            
            // Payment Thresholds (matches backend)
            minimumPayout: parseFloat(config.minimumPayout || '10.00'),
            
            // Recipient
            recipientEmail: 'BarbrickDesign@gmail.com',
        };

        // State
        this.pendingRevenue = [];
        this.lastSync = null;
        this.syncInProgress = false;
        this.stats = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize the payment client
     */
    init() {
        console.log('🚀 Initializing aFactory Payment Client...');
        console.log(`   API: ${this.config.apiBaseUrl}`);
        console.log(`   Recipient: ${this.config.recipientEmail}`);
        
        // Load pending revenue from localStorage
        this.loadPendingRevenue();

        // Start auto-sync if enabled
        if (this.config.autoSync) {
            this.startAutoSync();
        }

        // Initial stats fetch
        this.fetchStats();

        console.log('✅ aFactory Payment Client initialized');
    }

    /**
     * Record revenue - sends to backend for real payment processing
     */
    async recordRevenue(amount, source, metadata = {}) {
        try {
            const record = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                amount: parseFloat(amount),
                source,
                metadata,
                synced: false
            };

            // Add to pending queue
            this.pendingRevenue.push(record);
            this.savePendingRevenue();

            console.log(`💰 Revenue recorded locally: $${amount} from ${source}`);

            // Try to sync immediately
            await this.syncRevenue();

            return record;

        } catch (error) {
            console.error('Error recording revenue:', error);
            throw error;
        }
    }

    /**
     * Sync pending revenue with backend
     */
    async syncRevenue() {
        if (this.syncInProgress) {
            console.log('Sync already in progress, skipping...');
            return;
        }

        if (this.pendingRevenue.filter(r => !r.synced).length === 0) {
            console.log('No pending revenue to sync');
            return;
        }

        this.syncInProgress = true;

        try {
            console.log(`🔄 Syncing ${this.pendingRevenue.filter(r => !r.synced).length} revenue records...`);

            // Send each unsynced record to backend
            for (const record of this.pendingRevenue) {
                if (!record.synced) {
                    try {
                        const response = await fetch(`${this.config.apiBaseUrl}/revenue`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Api-Key': this.config.apiKey
                            },
                            body: JSON.stringify({
                                amount: record.amount,
                                source: record.source,
                                metadata: {
                                    ...record.metadata,
                                    clientId: record.id,
                                    clientTimestamp: record.timestamp
                                }
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            record.synced = true;
                            record.backendId = data.record.id;
                            console.log(`✅ Synced revenue record: ${record.id}`);
                            
                            // Update stats
                            if (data.stats) {
                                this.stats = data.stats;
                            }
                        } else {
                            const error = await response.text();
                            console.error(`Failed to sync record ${record.id}:`, error);
                        }
                    } catch (error) {
                        console.error(`Error syncing record ${record.id}:`, error.message);
                    }
                }
            }

            // Clean up old synced records (keep last 100)
            this.pendingRevenue = this.pendingRevenue
                .filter(r => !r.synced)
                .concat(
                    this.pendingRevenue
                        .filter(r => r.synced)
                        .slice(-100)
                );

            this.savePendingRevenue();
            this.lastSync = new Date().toISOString();

            console.log('✅ Revenue sync complete');

        } catch (error) {
            console.error('Error during sync:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Request a payout (manual trigger)
     */
    async requestPayout(amount = null) {
        try {
            console.log(`💸 Requesting payout${amount ? ` of $${amount}` : ''}...`);

            const response = await fetch(`${this.config.apiBaseUrl}/payout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.config.apiKey
                },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Payout request failed');
            }

            const data = await response.json();
            console.log('✅ Payout successful!', data.payout);
            
            // Update stats
            this.stats = data.stats;

            return data.payout;

        } catch (error) {
            console.error('❌ Payout request failed:', error.message);
            throw error;
        }
    }

    /**
     * Check payout status
     */
    async checkPayoutStatus(batchId) {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/payout/${batchId}`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.config.apiKey
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get payout status');
            }

            const data = await response.json();
            return data.status;

        } catch (error) {
            console.error('Error checking payout status:', error);
            throw error;
        }
    }

    /**
     * Fetch current stats from backend
     */
    async fetchStats() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/stats`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.config.apiKey
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            this.stats = data.stats;

            return this.stats;

        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    }

    /**
     * Get current stats (cached or fetch)
     */
    async getStats(forceRefresh = false) {
        if (!this.stats || forceRefresh) {
            await this.fetchStats();
        }
        return this.stats;
    }

    /**
     * Check backend health
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Start automatic sync
     */
    startAutoSync() {
        if (this.autoSyncInterval) {
            return; // Already running
        }

        console.log(`🔄 Starting auto-sync (interval: ${this.config.syncInterval}ms)`);
        
        this.autoSyncInterval = setInterval(async () => {
            await this.syncRevenue();
            await this.fetchStats();
        }, this.config.syncInterval);
    }

    /**
     * Stop automatic sync
     */
    stopAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
            console.log('⏹️ Auto-sync stopped');
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `CLI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save pending revenue to localStorage
     */
    savePendingRevenue() {
        try {
            localStorage.setItem('afactory_pending_revenue', JSON.stringify(this.pendingRevenue));
        } catch (error) {
            console.error('Error saving pending revenue:', error);
        }
    }

    /**
     * Load pending revenue from localStorage
     */
    loadPendingRevenue() {
        try {
            const data = localStorage.getItem('afactory_pending_revenue');
            if (data) {
                this.pendingRevenue = JSON.parse(data);
                console.log(`Loaded ${this.pendingRevenue.length} pending revenue records`);
            }
        } catch (error) {
            console.error('Error loading pending revenue:', error);
            this.pendingRevenue = [];
        }
    }

    /**
     * Create UI widget for payment status
     */
    createWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} not found`);
            return;
        }

        const widget = document.createElement('div');
        widget.className = 'afactory-payment-widget';
        widget.innerHTML = `
            <div class="payment-widget-header">
                <h3>💰 Real Payment Status</h3>
                <span class="status-indicator" id="payment-status-indicator">🔴 Offline</span>
            </div>
            <div class="payment-widget-body">
                <div class="stat-row">
                    <span class="stat-label">Backend Balance:</span>
                    <span class="stat-value" id="backend-balance">$0.00</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Paid Out:</span>
                    <span class="stat-value" id="total-paid">$0.00</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Last Payout:</span>
                    <span class="stat-value" id="last-payout">Never</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Pending Sync:</span>
                    <span class="stat-value" id="pending-sync">0</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Recipient:</span>
                    <span class="stat-value">${this.config.recipientEmail}</span>
                </div>
            </div>
            <div class="payment-widget-actions">
                <button id="sync-now-btn" class="btn-primary">🔄 Sync Now</button>
                <button id="request-payout-btn" class="btn-secondary">💸 Request Payout</button>
            </div>
        `;

        container.appendChild(widget);

        // Update widget with current stats
        this.updateWidget();

        // Set up event listeners
        document.getElementById('sync-now-btn').addEventListener('click', async () => {
            await this.syncRevenue();
            await this.fetchStats();
            this.updateWidget();
        });

        document.getElementById('request-payout-btn').addEventListener('click', async () => {
            if (confirm('Request a payout to BarbrickDesign@gmail.com?')) {
                try {
                    const result = await this.requestPayout();
                    alert(`Payout successful! Batch ID: ${result.paypalBatchId}\nAmount: $${result.amount}`);
                    this.updateWidget();
                } catch (error) {
                    alert(`Payout failed: ${error.message}`);
                }
            }
        });

        // Auto-update widget every 10 seconds
        setInterval(() => this.updateWidget(), 10000);
    }

    /**
     * Update widget with current stats
     */
    async updateWidget() {
        // Check health
        const isHealthy = await this.checkHealth();
        const statusIndicator = document.getElementById('payment-status-indicator');
        if (statusIndicator) {
            statusIndicator.textContent = isHealthy ? '🟢 Online' : '🔴 Offline';
        }

        // Update stats
        const stats = await this.getStats();
        if (stats) {
            const backendBalance = document.getElementById('backend-balance');
            const totalPaid = document.getElementById('total-paid');
            const lastPayout = document.getElementById('last-payout');

            if (backendBalance) backendBalance.textContent = `$${stats.currentBalance.toFixed(2)}`;
            if (totalPaid) totalPaid.textContent = `$${stats.totalPaidOut.toFixed(2)}`;
            if (lastPayout) {
                lastPayout.textContent = stats.lastPayout 
                    ? new Date(stats.lastPayout).toLocaleString() 
                    : 'Never';
            }
        }

        const pendingSync = document.getElementById('pending-sync');
        if (pendingSync) {
            pendingSync.textContent = this.pendingRevenue.filter(r => !r.synced).length;
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AFactoryPaymentClient;
}

// Auto-initialize for browser
if (typeof window !== 'undefined') {
    window.AFactoryPaymentClient = AFactoryPaymentClient;
}
