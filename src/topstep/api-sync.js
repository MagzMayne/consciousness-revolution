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
 * File: api-sync.js
 * Declaration ID: IP-A6D8737-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * TopStepX API Sync Manager
 * Handles synchronization between local data and TopStepX API
 */

class TopStepAPISyncManager {
  constructor(apiClient, accountManager) {
    this.apiClient = apiClient;
    this.accountManager = accountManager;
    this.syncInterval = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastError: null
    };
  }

  /**
   * Start automatic synchronization
   */
  startAutoSync(interval = 30000) {
    if (this.syncInterval) {
      console.log('Auto-sync already running');
      return;
    }

    console.log(`Starting auto-sync with ${interval}ms interval`);
    
    // Initial sync
    this.syncAll();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, interval);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Sync all data from API
   */
  async syncAll() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!this.apiClient.hasCredentials()) {
      console.log('No API credentials configured, skipping sync');
      return;
    }

    this.isSyncing = true;
    this.syncStats.totalSyncs++;

    try {
      console.log('Starting sync...');

      // Sync accounts
      await this.syncAccounts();

      // Sync positions for all accounts
      await this.syncPositions();

      // Sync orders
      await this.syncOrders();

      // Sync recent trades
      await this.syncTrades();

      this.lastSyncTime = Date.now();
      this.syncStats.successfulSyncs++;
      this.syncStats.lastError = null;

      console.log('Sync completed successfully');

      return {
        success: true,
        timestamp: this.lastSyncTime
      };

    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStats.failedSyncs++;
      this.syncStats.lastError = error.message;

      return {
        success: false,
        error: error.message
      };

    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync accounts from API
   */
  async syncAccounts() {
    try {
      const apiAccounts = await this.apiClient.getAccounts();
      
      apiAccounts.forEach(apiAccount => {
        // Check if account exists locally
        const localAccount = this.accountManager.getAllAccounts().find(
          acc => acc.apiAccountId === apiAccount.id
        );

        if (localAccount) {
          // Update existing account
          this.accountManager.updateAccount(localAccount.id, {
            name: apiAccount.name,
            balance: apiAccount.balance,
            accountType: this.mapAPIAccountType(apiAccount.accountType),
            lastActive: Date.now()
          });
        } else {
          // Create new account from API data
          const newAccount = this.accountManager.createAccount(
            apiAccount.name,
            apiAccount.email || 'api-synced@topstep.com',
            this.mapAPIAccountType(apiAccount.accountType),
            apiAccount.balance
          );

          // Store API account ID for future syncs
          this.accountManager.updateAccount(newAccount.id, {
            apiAccountId: apiAccount.id,
            apiSynced: true
          });
        }
      });

      console.log(`Synced ${apiAccounts.length} accounts`);
    } catch (error) {
      console.error('Failed to sync accounts:', error);
      throw error;
    }
  }

  /**
   * Sync positions for all API-linked accounts
   */
  async syncPositions() {
    try {
      const accounts = this.accountManager.getAllAccounts().filter(
        acc => acc.apiAccountId && acc.apiSynced
      );

      for (const account of accounts) {
        try {
          const positions = await this.apiClient.getPositions(account.apiAccountId);
          
          // Store positions in account data
          this.accountManager.updateAccount(account.id, {
            positions: positions,
            positionsUpdatedAt: Date.now()
          });

          console.log(`Synced ${positions.length} positions for account ${account.name}`);
        } catch (error) {
          console.error(`Failed to sync positions for account ${account.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync positions:', error);
    }
  }

  /**
   * Sync orders for all API-linked accounts
   */
  async syncOrders() {
    try {
      const accounts = this.accountManager.getAllAccounts().filter(
        acc => acc.apiAccountId && acc.apiSynced
      );

      for (const account of accounts) {
        try {
          const orders = await this.apiClient.getOrders(account.apiAccountId, {
            status: 'active'
          });
          
          // Store orders in account data
          this.accountManager.updateAccount(account.id, {
            orders: orders,
            ordersUpdatedAt: Date.now()
          });

          console.log(`Synced ${orders.length} orders for account ${account.name}`);
        } catch (error) {
          console.error(`Failed to sync orders for account ${account.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync orders:', error);
    }
  }

  /**
   * Sync recent trades for all API-linked accounts
   */
  async syncTrades() {
    try {
      const accounts = this.accountManager.getAllAccounts().filter(
        acc => acc.apiAccountId && acc.apiSynced
      );

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const account of accounts) {
        try {
          const trades = await this.apiClient.getTrades(account.apiAccountId, {
            startDate: oneDayAgo.toISOString()
          });

          // Merge API trades with local trades
          if (trades && trades.length > 0) {
            // Ensure trades array exists
            if (!account.trades) {
              account.trades = [];
            }

            trades.forEach(apiTrade => {
              // Check if trade already exists
              const existingTrade = account.trades.find(
                t => t.apiTradeId === apiTrade.id
              );

              if (!existingTrade) {
                // Add new trade from API
                const tradeRecord = {
                  id: this.accountManager.generateTradeId(),
                  apiTradeId: apiTrade.id,
                  timestamp: new Date(apiTrade.timestamp).getTime(),
                  contract: apiTrade.contract,
                  action: apiTrade.action,
                  entryPrice: apiTrade.entryPrice,
                  exitPrice: apiTrade.exitPrice,
                  quantity: apiTrade.quantity,
                  profit: apiTrade.profit,
                  commission: apiTrade.commission,
                  netProfit: apiTrade.profit - apiTrade.commission,
                  fromAPI: true
                };

                account.trades.push(tradeRecord);
              }
            });

            // Update performance metrics
            this.accountManager.updatePerformanceMetrics(account);
            this.accountManager.updateAccount(account.id, {
              trades: account.trades,
              performance: account.performance
            });

            console.log(`Synced ${trades.length} trades for account ${account.name}`);
          }
        } catch (error) {
          console.error(`Failed to sync trades for account ${account.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync trades:', error);
    }
  }

  /**
   * Map API account type to local account type
   */
  mapAPIAccountType(apiType) {
    const typeMap = {
      'Demo': 'demo',
      'Combine': 'combine',
      'Funded': 'funded',
      'Practice': 'demo'
    };
    return typeMap[apiType] || 'demo';
  }

  /**
   * Place order through API
   */
  async placeOrder(accountId, order) {
    const account = this.accountManager.getAccount(accountId);
    
    if (!account || !account.apiAccountId) {
      throw new Error('Account not linked to API');
    }

    try {
      const apiOrder = {
        accountId: account.apiAccountId,
        contractId: order.contractId,
        action: order.action, // 'BUY' or 'SELL'
        orderType: order.orderType || 'MARKET',
        quantity: order.quantity || 1,
        price: order.price,
        stopPrice: order.stopPrice,
        timeInForce: order.timeInForce || 'DAY'
      };

      const result = await this.apiClient.placeOrder(apiOrder);

      console.log('Order placed successfully:', result);

      // Trigger sync to update orders
      await this.syncOrders();

      return {
        success: true,
        orderId: result.id,
        order: result
      };

    } catch (error) {
      console.error('Failed to place order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel order through API
   */
  async cancelOrder(accountId, orderId) {
    const account = this.accountManager.getAccount(accountId);
    
    if (!account || !account.apiAccountId) {
      throw new Error('Account not linked to API');
    }

    try {
      await this.apiClient.cancelOrder(orderId);

      console.log('Order cancelled successfully');

      // Trigger sync to update orders
      await this.syncOrders();

      return {
        success: true
      };

    } catch (error) {
      console.error('Failed to cancel order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Close position through API
   */
  async closePosition(accountId, positionId, quantity = null) {
    const account = this.accountManager.getAccount(accountId);
    
    if (!account || !account.apiAccountId) {
      throw new Error('Account not linked to API');
    }

    try {
      await this.apiClient.closePosition(positionId, quantity);

      console.log('Position closed successfully');

      // Trigger sync to update positions
      await this.syncPositions();

      return {
        success: true
      };

    } catch (error) {
      console.error('Failed to close position:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStats() {
    return {
      ...this.syncStats,
      lastSyncTime: this.lastSyncTime,
      isAutoSyncRunning: this.syncInterval !== null,
      isSyncing: this.isSyncing
    };
  }

  /**
   * Reset sync statistics
   */
  resetSyncStats() {
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastError: null
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TopStepAPISyncManager;
}
