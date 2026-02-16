// BankSky Affiliate Tracking Service
// Tracks affiliate conversions, clicks, and earnings
// Self-healing and auto-logging system

class AffiliateService {
  constructor() {
    this.affiliateData = new Map(); // wallet -> affiliate stats
    this.conversionQueue = [];
    this.serviceHealth = { status: 'healthy', lastCheck: Date.now() };
    this.autoSaveTimer = null;
  }

  // Self-healing system
  async selfHeal() {
    try {
      // Validate data integrity
      const integrity = await this.validateDataIntegrity();
      this.serviceHealth = { status: integrity ? 'healthy' : 'degraded', lastCheck: Date.now() };

      // Process pending conversions
      await this.processConversionQueue();

      // Clean up old data (90 days retention)
      const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
      for (const [wallet, data] of this.affiliateData) {
        data.clicks = data.clicks.filter(click => click.timestamp > cutoff);
        data.conversions = data.conversions.filter(conv => conv.timestamp > cutoff);

        if (data.clicks.length === 0 && data.conversions.length === 0 && data.lastActivity < cutoff) {
          this.affiliateData.delete(wallet);
          console.log(`Cleaned up inactive affiliate data for ${wallet}`);
        }
      }

      return true;
    } catch (error) {
      console.error('Affiliate self-heal failed:', error);
      this.serviceHealth.status = 'error';
      return false;
    }
  }

  async validateDataIntegrity() {
    try {
      let validCount = 0;
      let totalCount = 0;

      for (const [wallet, data] of this.affiliateData) {
        totalCount++;
        if (this.isValidAffiliateData(data)) {
          validCount++;
        }
      }

      return validCount === totalCount;
    } catch (error) {
      return false;
    }
  }

  isValidAffiliateData(data) {
    return data &&
           typeof data.wallet === 'string' &&
           Array.isArray(data.clicks) &&
           Array.isArray(data.conversions) &&
           typeof data.totalEarnings === 'number';
  }

  async processConversionQueue() {
    while (this.conversionQueue.length > 0) {
      const conversion = this.conversionQueue.shift();
      try {
        await this.recordConversion(conversion);
      } catch (error) {
        console.error('Failed to process conversion:', error);
        // Re-queue for retry
        this.conversionQueue.push(conversion);
      }
    }
  }

  // Get affiliate data for wallet
  async getAffiliateData(wallet) {
    let data = this.affiliateData.get(wallet.toLowerCase());

    if (!data) {
      // Initialize new affiliate data
      data = {
        wallet: wallet.toLowerCase(),
        clicks: [],
        conversions: [],
        totalEarnings: 0,
        lastActivity: Date.now(),
        programs: {
          'amazon-associates': { clicks: 0, conversions: 0, earnings: 0 },
          'crypto-exchanges': { clicks: 0, conversions: 0, earnings: 0 },
          'hardware-wallets': { clicks: 0, conversions: 0, earnings: 0 }
        }
      };
      this.affiliateData.set(wallet.toLowerCase(), data);
    }

    // Calculate real-time metrics
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);

    const recentClicks = data.clicks.filter(c => c.timestamp > last24h).length;
    const recentConversions = data.conversions.filter(c => c.timestamp > last7d);

    const topProduct = this.getTopPerformingProduct(data);

    return {
      wallet: data.wallet,
      topProduct,
      estimated: data.totalEarnings.toFixed(2),
      clicks: recentClicks,
      recentConversions: recentConversions.length,
      totalEarnings: data.totalEarnings,
      programs: data.programs
    };
  }

  getTopPerformingProduct(data) {
    let topProduct = 'Amazon Associates';
    let maxEarnings = 0;

    for (const [program, stats] of Object.entries(data.programs)) {
      if (stats.earnings > maxEarnings) {
        maxEarnings = stats.earnings;
        topProduct = program.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    return topProduct;
  }

  // Record affiliate click
  async recordClick(wallet, program, metadata = {}) {
    const data = await this.getAffiliateData(wallet);
    const click = {
      timestamp: Date.now(),
      program,
      metadata,
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    data.clicks.push(click);
    data.lastActivity = Date.now();

    // Update program stats
    if (data.programs[program]) {
      data.programs[program].clicks++;
    }

    console.log(`Recorded click for ${wallet} on ${program}`);
  }

  // Record affiliate conversion
  async recordConversion(wallet, program, amount, orderId, metadata = {}) {
    const conversion = {
      wallet: wallet.toLowerCase(),
      program,
      amount: parseFloat(amount),
      orderId,
      metadata,
      timestamp: Date.now(),
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Add to processing queue for async handling
    this.conversionQueue.push(conversion);

    console.log(`Queued conversion for ${wallet}: $${amount} from ${program}`);
  }

  async recordConversion(conversion) {
    const { wallet, program, amount, orderId, metadata, timestamp, id } = conversion;

    const data = await this.getAffiliateData(wallet);
    const conv = { id, program, amount, orderId, metadata, timestamp };

    data.conversions.push(conv);
    data.totalEarnings += amount;
    data.lastActivity = Date.now();

    // Update program stats
    if (data.programs[program]) {
      data.programs[program].conversions++;
      data.programs[program].earnings += amount;
    }

    console.log(`Recorded conversion for ${wallet}: $${amount} from ${program}`);
  }

  // Auto-logging: Periodic performance reports
  startAutoLogging() {
    setInterval(() => {
      const metrics = this.getMetrics();

      console.log('Affiliate Service Status:', {
        health: metrics.health.status,
        activeWallets: metrics.activeWallets,
        totalClicks: metrics.totalClicks,
        totalConversions: metrics.totalConversions,
        totalEarnings: metrics.totalEarnings,
        uptime: Math.floor(metrics.uptime / 1000 / 60) + ' minutes'
      });

      // Log top performers
      if (metrics.topPerformers.length > 0) {
        console.log('Top Affiliate Performers:', metrics.topPerformers.slice(0, 3));
      }

    }, 15 * 60 * 1000); // Every 15 minutes
  }

  // Self-logging: Comprehensive metrics
  getMetrics() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);

    let totalClicks = 0;
    let totalConversions = 0;
    let totalEarnings = 0;
    const activeWallets = [];

    for (const [wallet, data] of this.affiliateData) {
      const recentClicks = data.clicks.filter(c => c.timestamp > last24h).length;
      const recentConversions = data.conversions.filter(c => c.timestamp > last24h);

      totalClicks += recentClicks;
      totalConversions += recentConversions.length;
      totalEarnings += data.totalEarnings;

      if (recentClicks > 0 || recentConversions.length > 0) {
        activeWallets.push({
          wallet,
          clicks: recentClicks,
          conversions: recentConversions.length,
          earnings: data.totalEarnings
        });
      }
    }

    // Sort top performers
    const topPerformers = activeWallets
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10);

    return {
      health: this.serviceHealth,
      activeWallets: activeWallets.length,
      totalClicks,
      totalConversions,
      totalEarnings,
      topPerformers,
      uptime: Date.now() - (global.startTime || Date.now())
    };
  }

  // Auto-save to persistent storage (in production)
  startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.saveToStorage();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async saveToStorage() {
    try {
      // In production: Save to database/file system
      console.log('Auto-saving affiliate data...');
      // Implementation would save this.affiliateData to persistent storage
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }
}

// Export for serverless deployment
const service = new AffiliateService();

// Self-healing loop (runs every 15 minutes)
setInterval(() => service.selfHeal(), 15 * 60 * 1000);

// Auto-logging and auto-save
service.startAutoLogging();
service.startAutoSave();

// Initial self-heal
service.selfHeal();

module.exports = async (req, res) => {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { method, body, query } = req;

    if (method === 'GET') {
      const { wallet } = query;
      if (wallet) {
        const data = await service.getAffiliateData(wallet);
        return res.status(200).json(data);
      }

      // Health/metrics endpoint
      return res.status(200).json(service.getMetrics());
    }

    if (method === 'POST') {
      const { action } = body;

      if (action === 'click') {
        await service.recordClick(body.wallet, body.program, body.metadata);
        return res.status(200).json({ success: true });
      }

      if (action === 'conversion') {
        await service.recordConversion(body.wallet, body.program, body.amount, body.orderId, body.metadata);
        return res.status(200).json({ success: true });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Affiliate service error:', error);
    return res.status(500).json({ error: error.message });
  }
};
