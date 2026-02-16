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
 * File: jewelry-webhook-handler.js
 * Declaration ID: IP-69F0879A-MLL28ZWF
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Jewelry Order Webhook Handler
 * 
 * Handles webhook delivery for jewelry orders to automation endpoints
 * Includes retry logic, error handling, and webhook security
 */

class JewelryWebhookHandler {
  constructor(config = {}) {
    this.webhookUrl = config.webhookUrl || '';
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 2000; // ms
    this.timeout = config.timeout || 10000; // ms
    this.secret = config.secret || ''; // For webhook signature validation
    this.enabled = config.enabled !== false;
    this.debug = config.debug || false;
  }

  /**
   * Send order data to webhook endpoint
   */
  async sendOrder(orderData, stage = 'paid') {
    if (!this.enabled || !this.webhookUrl) {
      if (this.debug) {
        console.log('[Webhook] Disabled or no URL configured');
      }
      return { success: false, reason: 'disabled' };
    }

    const payload = this.buildPayload(orderData, stage);
    
    // Attempt delivery with retries
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.deliverWebhook(payload, attempt);
        
        if (result.success) {
          this.log('success', `Webhook delivered successfully on attempt ${attempt}`, { stage, orderId: orderData.id });
          return result;
        }
        
        // If not last attempt, wait before retry
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
        
      } catch (error) {
        this.log('error', `Webhook delivery failed on attempt ${attempt}`, { error: error.message, orderId: orderData.id });
        
        if (attempt === this.maxRetries) {
          // All retries exhausted
          return {
            success: false,
            error: error.message,
            attempts: attempt,
            orderId: orderData.id
          };
        }
        
        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      }
    }

    return { success: false, reason: 'max_retries_exceeded' };
  }

  /**
   * Build webhook payload
   */
  buildPayload(orderData, stage) {
    const payload = {
      event: 'jewelry.order',
      stage: stage, // 'intent', 'paid', 'completed', 'shipped'
      timestamp: new Date().toISOString(),
      order: {
        id: orderData.id || orderData.orderId,
        createdAt: orderData.createdAt || new Date().toISOString(),
        customer: {
          email: orderData.customer?.email || orderData.email,
          name: orderData.customer?.name || orderData.customerName,
          phone: orderData.customer?.phone || orderData.phone,
          address: orderData.customer?.address || orderData.shippingAddress
        },
        items: orderData.items || [],
        pricing: {
          subtotal: orderData.subtotal || orderData.basePrice || 0,
          shipping: orderData.shipping || orderData.shippingCost || 0,
          tax: orderData.tax || 0,
          total: orderData.total || orderData.amountUSD || 0,
          currency: orderData.currency || 'USD'
        },
        jewelry: {
          gemType: orderData.parts?.gemType || orderData.gemType,
          carat: orderData.parts?.carat || orderData.carat,
          cut: orderData.parts?.cut || orderData.cut,
          certification: orderData.parts?.certification || orderData.certification,
          setting: orderData.parts?.setting || orderData.setting,
          notes: orderData.sizeNotes || orderData.notes || ''
        },
        fulfillment: {
          shippingMethod: orderData.parts?.shipping || orderData.shipping?.type,
          region: orderData.parts?.region || orderData.region,
          estimatedDays: orderData.estimatedCompletionDays
        },
        payment: {
          method: 'paypal',
          status: stage === 'paid' ? 'completed' : 'pending',
          transactionId: orderData.paypal?.id || orderData.transactionId,
          details: orderData.paypal?.details
        },
        metadata: {
          source: 'geAuto.html',
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          ...orderData.metadata
        }
      },
      signature: this.generateSignature(orderData)
    };

    return payload;
  }

  /**
   * Generate HMAC signature for webhook validation
   */
  generateSignature(data) {
    if (!this.secret) {
      return '';
    }

    try {
      // In a real implementation, use crypto.createHmac
      // For browser, this is a simple hash
      const dataStr = JSON.stringify(data);
      return this.simpleHash(dataStr + this.secret);
    } catch (error) {
      console.error('[Webhook] Failed to generate signature:', error);
      return '';
    }
  }

  /**
   * Simple hash function for signature (browser-compatible)
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Deliver webhook with timeout
   */
  async deliverWebhook(payload, attemptNumber) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Attempt': attemptNumber.toString(),
          'X-Webhook-Source': 'geAuto-jewelry',
          'X-Webhook-Timestamp': Date.now().toString(),
          ...(this.secret && { 'X-Webhook-Signature': payload.signature })
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };

      // Try to parse response body
      try {
        const text = await response.text();
        if (text) {
          responseData.body = JSON.parse(text);
        }
      } catch (e) {
        // Response not JSON, that's okay
      }

      if (response.ok) {
        return {
          success: true,
          attempt: attemptNumber,
          response: responseData
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Webhook timeout after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Delay helper for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log webhook events
   */
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };

    // Store in localStorage for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('webhookLogs') || '[]');
      logs.push(logEntry);
      // Keep only last 50 logs
      if (logs.length > 50) {
        logs.shift();
      }
      localStorage.setItem('webhookLogs', JSON.stringify(logs));
    } catch (e) {
      // LocalStorage full or disabled
    }

    if (this.debug) {
      console.log(`[Webhook ${level.toUpperCase()}]`, message, data);
    }
  }

  /**
   * Get webhook logs for debugging
   */
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('webhookLogs') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear webhook logs
   */
  clearLogs() {
    try {
      localStorage.removeItem('webhookLogs');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Test webhook configuration
   */
  async testWebhook() {
    if (!this.webhookUrl) {
      return {
        success: false,
        error: 'No webhook URL configured'
      };
    }

    const testPayload = {
      event: 'jewelry.order.test',
      timestamp: new Date().toISOString(),
      test: true,
      message: 'This is a test webhook from geAuto.html jewelry configurator'
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Test': 'true'
        },
        body: JSON.stringify(testPayload)
      });

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update webhook configuration
   */
  updateConfig(config) {
    if (config.webhookUrl !== undefined) this.webhookUrl = config.webhookUrl;
    if (config.maxRetries !== undefined) this.maxRetries = config.maxRetries;
    if (config.retryDelay !== undefined) this.retryDelay = config.retryDelay;
    if (config.timeout !== undefined) this.timeout = config.timeout;
    if (config.secret !== undefined) this.secret = config.secret;
    if (config.enabled !== undefined) this.enabled = config.enabled;
    if (config.debug !== undefined) this.debug = config.debug;

    this.log('info', 'Webhook configuration updated', { 
      webhookUrl: this.webhookUrl ? 'configured' : 'not set',
      enabled: this.enabled
    });
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig() {
    return {
      webhookUrl: this.webhookUrl ? '***configured***' : '',
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      timeout: this.timeout,
      hasSecret: !!this.secret,
      enabled: this.enabled,
      debug: this.debug
    };
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JewelryWebhookHandler;
}

if (typeof window !== 'undefined') {
  window.JewelryWebhookHandler = JewelryWebhookHandler;
}
