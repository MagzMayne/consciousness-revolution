---
applyTo: "src/agents/**/*.js"
---

## Agent System File Requirements

Agent files handle autonomous operations, monitoring, and self-healing. These are critical for maintaining system health and must be robust and reliable.

### Agent Design Principles

1. **Autonomous operation** - Agents should run without human intervention
2. **Self-healing** - Detect and fix issues automatically
3. **Observable** - Provide clear logging and monitoring
4. **Fail-safe** - Gracefully handle errors without crashing
5. **Resource-conscious** - Avoid memory leaks and excessive CPU usage

### Standard Agent Structure

```javascript
/**
 * Agent Template
 * Purpose: [Describe what this agent does]
 * Frequency: [How often it runs]
 * Dependencies: [What it depends on]
 */

class ExampleAgent {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      checkInterval: 60000, // 1 minute
      maxRetries: 3,
      ...config
    };
    
    this.isActive = false;
    this.logs = [];
    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRun: null
    };
  }
  
  /**
   * Initialize the agent
   */
  async init() {
    try {
      this.log('Initializing agent...', 'info');
      
      // Load configuration
      await this.loadConfig();
      
      // Connect to dependencies
      await this.connect();
      
      // Start monitoring
      this.isActive = true;
      this.startMonitoring();
      
      this.log('Agent initialized successfully', 'success');
    } catch (error) {
      this.log(`Failed to initialize: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Main agent operation
   */
  async run() {
    if (!this.isActive) {
      this.log('Agent is not active', 'warning');
      return;
    }
    
    this.metrics.totalRuns++;
    this.metrics.lastRun = new Date().toISOString();
    
    try {
      this.log('Starting agent run...', 'info');
      
      // Perform agent operations
      const results = await this.performOperations();
      
      // Process results
      await this.processResults(results);
      
      this.metrics.successfulRuns++;
      this.log('Agent run completed successfully', 'success');
      
      return { success: true, results };
    } catch (error) {
      this.metrics.failedRuns++;
      this.log(`Agent run failed: ${error.message}`, 'error');
      
      // Attempt self-healing
      await this.attemptSelfHeal(error);
      
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Logging system
   */
  log(message, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      agent: this.constructor.name
    };
    
    this.logs.push(entry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Console output with color
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m'    // Red
    };
    
    console.log(`${colors[level]}[${level.toUpperCase()}] ${message}\x1b[0m`);
    
    // Persist critical logs
    if (level === 'error' || level === 'critical') {
      this.persistLog(entry);
    }
  }
  
  /**
   * Self-healing mechanism
   */
  async attemptSelfHeal(error) {
    this.log('Attempting self-heal...', 'warning');
    
    const healingStrategies = {
      'ECONNREFUSED': async () => {
        this.log('Connection refused, reconnecting...', 'info');
        await this.reconnect();
      },
      'TIMEOUT': async () => {
        this.log('Timeout occurred, retrying with backoff...', 'info');
        await this.retryWithBackoff();
      },
      'MEMORY': async () => {
        this.log('Memory issue detected, clearing caches...', 'info');
        await this.clearCaches();
      }
    };
    
    for (const [errorType, strategy] of Object.entries(healingStrategies)) {
      if (error.message.includes(errorType)) {
        try {
          await strategy();
          this.log('Self-heal successful', 'success');
          return true;
        } catch (healError) {
          this.log(`Self-heal failed: ${healError.message}`, 'error');
        }
      }
    }
    
    this.log('No healing strategy available', 'warning');
    return false;
  }
  
  /**
   * Stop the agent gracefully
   */
  async stop() {
    this.log('Stopping agent...', 'info');
    this.isActive = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    await this.cleanup();
    this.log('Agent stopped', 'success');
  }
  
  /**
   * Get agent health status
   */
  getHealth() {
    const successRate = this.metrics.totalRuns > 0
      ? (this.metrics.successfulRuns / this.metrics.totalRuns * 100).toFixed(2)
      : 0;
    
    return {
      isActive: this.isActive,
      metrics: this.metrics,
      successRate: `${successRate}%`,
      status: this.isActive ? 'healthy' : 'stopped',
      lastError: this.logs.filter(l => l.level === 'error').slice(-1)[0]
    };
  }
  
  /**
   * Export logs for analysis
   */
  exportLogs(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else if (format === 'csv') {
      const headers = 'Timestamp,Level,Message,Agent\n';
      const rows = this.logs.map(log => 
        `${log.timestamp},${log.level},${log.message},${log.agent}`
      ).join('\n');
      return headers + rows;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExampleAgent;
}
```

### Monitoring and Health Checks

Agents must implement health monitoring:

```javascript
class MonitoringAgent extends ExampleAgent {
  constructor(config) {
    super(config);
    this.healthChecks = [];
    this.alertThresholds = {
      errorRate: 0.1,      // 10% error rate triggers alert
      responseTime: 5000,   // 5 second response time
      memoryUsage: 0.8      // 80% memory usage
    };
  }
  
  /**
   * Register health check
   */
  registerHealthCheck(name, checkFunction) {
    this.healthChecks.push({
      name,
      check: checkFunction,
      lastRun: null,
      lastResult: null
    });
  }
  
  /**
   * Run all health checks
   */
  async runHealthChecks() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: []
    };
    
    for (const healthCheck of this.healthChecks) {
      try {
        const startTime = Date.now();
        const result = await healthCheck.check();
        const duration = Date.now() - startTime;
        
        healthCheck.lastRun = new Date().toISOString();
        healthCheck.lastResult = result;
        
        results.checks.push({
          name: healthCheck.name,
          status: result.success ? 'pass' : 'fail',
          message: result.message,
          duration
        });
        
        if (!result.success) {
          results.overall = 'unhealthy';
          this.log(`Health check failed: ${healthCheck.name}`, 'error');
          
          // Attempt to fix
          if (result.autoFix) {
            await this.attemptAutoFix(healthCheck.name);
          }
        }
        
      } catch (error) {
        results.checks.push({
          name: healthCheck.name,
          status: 'error',
          message: error.message
        });
        results.overall = 'unhealthy';
        this.log(`Health check error: ${healthCheck.name} - ${error.message}`, 'error');
      }
    }
    
    // Store results
    this.lastHealthCheck = results;
    
    // Trigger alerts if needed
    if (results.overall === 'unhealthy') {
      await this.triggerAlert(results);
    }
    
    return results;
  }
  
  /**
   * Trigger alert for critical issues
   */
  async triggerAlert(healthResults) {
    const alert = {
      timestamp: new Date().toISOString(),
      type: 'health_check_failed',
      severity: 'high',
      message: 'System health check detected issues',
      details: healthResults
    };
    
    this.log(`ALERT: ${alert.message}`, 'error');
    
    // Send notification (email, webhook, etc.)
    try {
      await this.sendNotification(alert);
    } catch (error) {
      this.log(`Failed to send alert: ${error.message}`, 'error');
    }
  }
}
```

### Revenue-Critical Agent Operations

Agents that handle payment or monetization must be extra careful:

```javascript
class PaymentMonitorAgent extends MonitoringAgent {
  constructor(config) {
    super(config);
    this.paymentQueue = [];
    this.failedPayments = [];
  }
  
  /**
   * Monitor payment processing
   */
  async monitorPayments() {
    this.log('Checking payment queue...', 'info');
    
    // Check for pending payments
    const pending = await this.getPendingPayments();
    
    for (const payment of pending) {
      try {
        // Verify payment status with PayPal
        const status = await this.verifyPaymentStatus(payment.orderId);
        
        if (status.completed) {
          // Process completed payment
          await this.processCompletedPayment(payment);
          this.log(`Payment processed: ${payment.orderId}`, 'success');
        } else if (status.failed) {
          // Handle failed payment
          await this.handleFailedPayment(payment);
          this.log(`Payment failed: ${payment.orderId}`, 'error');
        } else {
          // Still pending
          this.log(`Payment pending: ${payment.orderId}`, 'info');
        }
        
      } catch (error) {
        this.log(`Error processing payment ${payment.orderId}: ${error.message}`, 'error');
        this.failedPayments.push({ payment, error: error.message, timestamp: new Date() });
      }
    }
    
    // Retry failed payments with exponential backoff
    await this.retryFailedPayments();
  }
  
  /**
   * Revenue sharing calculation
   */
  async calculateRevenueShare(grantId) {
    try {
      const grant = await this.getGrantDetails(grantId);
      const contributors = await this.getGrantContributors(grantId);
      
      const distributions = contributors.map(contributor => {
        const tierPercentages = {
          bronze: 0.10,
          silver: 0.12,
          gold: 0.15,
          platinum: 0.20
        };
        
        const baseShare = grant.amount * tierPercentages[contributor.tier];
        const participationMultiplier = contributor.participationScore;
        const platformFee = 0.05; // 5%
        
        const finalAmount = baseShare * participationMultiplier * (1 - platformFee);
        
        return {
          contributorId: contributor.id,
          email: contributor.email,
          amount: Math.round(finalAmount * 100) / 100, // Round to 2 decimals
          tier: contributor.tier,
          participationScore: contributor.participationScore
        };
      });
      
      this.log(`Revenue calculated for grant ${grantId}: ${distributions.length} contributors`, 'info');
      return distributions;
      
    } catch (error) {
      this.log(`Failed to calculate revenue share: ${error.message}`, 'error');
      throw error;
    }
  }
}
```

### Integration with Merlin Hive

All agents should integrate with the central Merlin Hive system:

```javascript
class HiveIntegratedAgent extends ExampleAgent {
  constructor(config) {
    super(config);
    this.hiveConnection = null;
  }
  
  /**
   * Connect to Merlin Hive
   */
  async connectToHive() {
    try {
      // Load Merlin Hive system - check both window object and global scope
      if (typeof window !== 'undefined' && !window.MerlinHive && typeof MerlinHive === 'undefined') {
        this.log('Merlin Hive not available, running standalone', 'warning');
        return;
      }
      
      const hive = (typeof window !== 'undefined' && window.MerlinHive) || MerlinHive;
      if (!hive) {
        this.log('Merlin Hive not available, running standalone', 'warning');
        return;
      }
      
      this.hiveConnection = await hive.registerAgent({
        id: this.constructor.name,
        type: 'automation',
        capabilities: this.getCapabilities(),
        status: 'active'
      });
      
      // Subscribe to hive events
      this.hiveConnection.on('command', (cmd) => this.handleHiveCommand(cmd));
      this.hiveConnection.on('shutdown', () => this.stop());
      
      this.log('Connected to Merlin Hive', 'success');
      
    } catch (error) {
      this.log(`Failed to connect to Merlin Hive: ${error.message}`, 'warning');
    }
  }
  
  /**
   * Handle commands from Merlin Hive
   */
  async handleHiveCommand(command) {
    this.log(`Received command from Hive: ${command.action}`, 'info');
    
    switch (command.action) {
      case 'health_check':
        return this.getHealth();
      
      case 'run':
        return await this.run();
      
      case 'stop':
        return await this.stop();
      
      case 'export_logs':
        return this.exportLogs(command.format);
      
      default:
        this.log(`Unknown command: ${command.action}`, 'warning');
        return { error: 'Unknown command' };
    }
  }
  
  /**
   * Report status to Hive
   */
  reportToHive(status) {
    if (this.hiveConnection) {
      this.hiveConnection.emit('status', {
        agent: this.constructor.name,
        timestamp: new Date().toISOString(),
        ...status
      });
    }
  }
}
```

### Security Considerations

1. **Validate all inputs**
```javascript
validateConfig(config) {
  const requiredFields = ['apiKey', 'endpoint', 'checkInterval'];
  const missing = requiredFields.filter(field => !config[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required config: ${missing.join(', ')}`);
  }
  
  if (typeof config.checkInterval !== 'number' || config.checkInterval < 1000) {
    throw new Error('checkInterval must be a number >= 1000ms');
  }
}
```

2. **Rate limiting**
```javascript
class RateLimitedAgent extends ExampleAgent {
  constructor(config) {
    super(config);
    this.rateLimits = new Map();
  }
  
  async checkRateLimit(key, limit = 10, window = 60000) {
    const now = Date.now();
    const record = this.rateLimits.get(key) || { count: 0, resetAt: now + window };
    
    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + window;
    }
    
    if (record.count >= limit) {
      throw new Error(`Rate limit exceeded for ${key}`);
    }
    
    record.count++;
    this.rateLimits.set(key, record);
    
    return true;
  }
}
```

### Testing Requirements

Agent files must include:

- [ ] Initialization tests
- [ ] Operation tests (success cases)
- [ ] Error handling tests (failure cases)
- [ ] Self-healing tests
- [ ] Health check tests
- [ ] Integration tests with Merlin Hive
- [ ] Resource usage tests (memory, CPU)
- [ ] Long-running stability tests

### Documentation Requirements

Each agent file should include:

```javascript
/**
 * Agent Name: Payment Monitor Agent
 * 
 * Purpose:
 * - Monitor PayPal payment processing
 * - Handle payment confirmations
 * - Calculate and distribute revenue shares
 * 
 * Schedule:
 * - Runs every 5 minutes
 * - Health checks every 1 minute
 * 
 * Dependencies:
 * - PayPal API
 * - Merlin Hive system
 * - Database for payment records
 * 
 * Critical Paths:
 * - Payment confirmation (REVENUE CRITICAL)
 * - Revenue calculation (REVENUE CRITICAL)
 * 
 * Failure Modes:
 * - PayPal API unavailable: Queue for retry
 * - Database unavailable: Log and alert
 * - Calculation error: Alert immediately
 * 
 * Contact: BarbrickDesign@gmail.com
 */
```

### Remember

- **Agents handle critical operations** - Test thoroughly
- **Revenue-critical agents** - Extra validation and monitoring
- **Self-healing is mandatory** - Don't let agents crash
- **Observable operations** - Log everything important
- **Resource conscious** - Prevent memory leaks and CPU spikes
- **Integration with Hive** - All agents should connect to central system
