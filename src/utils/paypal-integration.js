/**
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 * All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This code is the exclusive property of Ryan Barbrick (Barbrick Design).
 * Unauthorized copying, modification, distribution, or use of this code,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * This is REVENUE-CRITICAL code that handles payment processing.
 * Any unauthorized use, copying, or distribution will be vigorously prosecuted.
 * 
 * For licensing inquiries: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * 
 * @license Proprietary
 * @copyright 2024-2025 Ryan Barbrick. All Rights Reserved.
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * PayPal Integration Utility
 * 
 * Centralizes PayPal integration across all HTML pages with WORLDWIDE support.
 * Enables foreign investing via PayPal donation for global access to government grants.
 * Uses GitHub secrets CLIENT_ID and PAYPAL_API for configuration.
 * 
 * INTERNATIONAL FEATURES:
 * - Multi-currency support (USD, EUR, GBP, JPY, AUD, CAD, and 100+ more)
 * - Automatic currency conversion by PayPal
 * - 195+ countries supported
 * - No geographic limitations on payment or access
 * 
 * Usage:
 *   1. Include this script in your HTML page
 *   2. Call PayPalIntegration.init() to initialize
 *   3. Use PayPalIntegration.renderButton() to render payment buttons
 */

const PayPalIntegration = (function() {
  'use strict';

  // Configuration - These will be replaced by the deployment agent with actual secrets
  const CONFIG = {
    CLIENT_ID: 'Ae5p9t_umXWYHWQuvxEiIb_DNYJUMQgC0NFCjPkIGnliAVW-0lOJRQw3niXh8NIkEkB0HaNbfMFkbSkZ',  // Replaced by deployment agent
    API_ENDPOINT: '{{PAYPAL_API}}',     // Replaced by deployment agent
    CURRENCY: 'USD',
    INTENT: 'capture',
    DISABLE_FUNDING: 'card,credit,venmo',
    ENABLE_FUNDING: '',
    // Fallback configuration - used when primary CLIENT_ID is not configured
    // Note: This client ID is intentionally hardcoded as a fallback mechanism
    // as specified in the requirements. It provides a backup payment option
    // when the primary API is not configured or unavailable.
    FALLBACK_CLIENT_ID: 'BAA32_1anJHhKp_wVIq_c2tVlfMCZOyrmeFbSdiofVqklIassmUhRkm4k7E9HX0GX60_IJGxXfqLA11lWg',
    FALLBACK_COMPONENTS: 'hosted-buttons',
    FALLBACK_ENABLE_FUNDING: 'venmo',
  };

  let isInitialized = false;
  let isScriptLoaded = false;
  let scriptLoadPromise = null;

  /**
   * Initialize PayPal integration
   * @returns {Promise} Resolves when PayPal SDK is loaded
   */
  function init() {
    if (isInitialized) {
      return scriptLoadPromise;
    }

    isInitialized = true;

    // Check if CLIENT_ID is configured, use fallback if not
    const useFallback = !CONFIG.CLIENT_ID || CONFIG.CLIENT_ID === '{{PAYPAL_CLIENT_ID}}' || CONFIG.CLIENT_ID === '';
    
    if (useFallback) {
      console.warn('PayPal CLIENT_ID not configured. Using fallback configuration.');
      console.info('Fallback PayPal SDK will be used. For production, set PAYPAL_CLIENT_ID in GitHub repository secrets and redeploy using: node deploy-paypal-integration.js');
    }

    // Load PayPal SDK (with fallback if needed)
    scriptLoadPromise = loadPayPalSDK(useFallback);
    return scriptLoadPromise;
  }

  /**
   * Load PayPal SDK script
   * @param {boolean} useFallback - Whether to use fallback configuration
   * @returns {Promise}
   */
  function loadPayPalSDK(useFallback = false) {
    if (isScriptLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Check if PayPal SDK is already loaded
      if (window.paypal) {
        isScriptLoaded = true;
        resolve();
        return;
      }

      let sdkUrl;

      if (useFallback) {
        // Use fallback configuration
        const params = new URLSearchParams({
          'client-id': CONFIG.FALLBACK_CLIENT_ID,
          'components': CONFIG.FALLBACK_COMPONENTS,
          'enable-funding': CONFIG.FALLBACK_ENABLE_FUNDING,
          'currency': CONFIG.CURRENCY,
        });
        sdkUrl = `https://www.paypal.com/sdk/js?${params.toString()}`;
        console.log('Loading PayPal SDK with fallback configuration');
      } else {
        // Use primary configuration
        const params = new URLSearchParams({
          'client-id': CONFIG.CLIENT_ID,
          'currency': CONFIG.CURRENCY,
          'intent': CONFIG.INTENT,
          'disable-funding': CONFIG.DISABLE_FUNDING,
        });

        if (CONFIG.ENABLE_FUNDING) {
          params.set('enable-funding', CONFIG.ENABLE_FUNDING);
        }

        sdkUrl = `https://www.paypal.com/sdk/js?${params.toString()}`;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = sdkUrl;
      script.async = true;
      script.onload = () => {
        isScriptLoaded = true;
        console.log('PayPal SDK loaded successfully' + (useFallback ? ' (using fallback)' : ''));
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load PayPal SDK'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Render PayPal button in specified container
   * @param {string} containerId - ID of container element
   * @param {Object} options - Payment options
   * @param {number} options.amount - Payment amount
   * @param {string} options.description - Payment description
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onError - Error callback
   * @param {Function} options.onCancel - Cancel callback
   * @returns {Promise}
   */
  function renderButton(containerId, options = {}) {
    return init().then(() => {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container element #${containerId} not found`);
      }

      // Clear container
      container.innerHTML = '';

      const {
        amount = 0,
        description = 'Payment',
        onSuccess = () => {},
        onError = () => {},
        onCancel = () => {},
      } = options;

      // Render PayPal button
      return window.paypal.Buttons({
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              description: description,
              amount: {
                currency_code: CONFIG.CURRENCY,
                value: String(amount)
              }
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            console.log('PayPal payment completed:', details);
            onSuccess({
              orderID: data.orderID,
              payerID: data.payerID,
              details: details
            });
          });
        },
        onError: function(err) {
          console.error('PayPal payment error:', err);
          onError(err);
        },
        onCancel: function(data) {
          console.log('PayPal payment cancelled:', data);
          onCancel(data);
        }
      }).render(`#${containerId}`);
    }).catch(err => {
      console.error('PayPal button render error:', err);
      throw err;
    });
  }

  /**
   * Create a PayPal order via API
   * @param {Object} orderData - Order data
   * @returns {Promise}
   */
  async function createOrder(orderData) {
    if (!CONFIG.API_ENDPOINT || CONFIG.API_ENDPOINT === '{{PAYPAL_API}}') {
      throw new Error('PayPal API endpoint not configured');
    }

    try {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  }

  /**
   * Capture a PayPal order via API
   * @param {string} orderId - Order ID
   * @returns {Promise}
   */
  async function captureOrder(orderId) {
    if (!CONFIG.API_ENDPOINT || CONFIG.API_ENDPOINT === '{{PAYPAL_API}}') {
      throw new Error('PayPal API endpoint not configured');
    }

    try {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal order capture error:', error);
      throw error;
    }
  }

  /**
   * Check if PayPal is configured and available
   * @returns {boolean}
   */
  function isAvailable() {
    // Check if primary client ID is configured
    const hasPrimaryConfig = CONFIG.CLIENT_ID && 
                             CONFIG.CLIENT_ID !== '{{PAYPAL_CLIENT_ID}}' && 
                             CONFIG.CLIENT_ID !== '';
    
    // Fallback is always available
    const hasFallbackConfig = CONFIG.FALLBACK_CLIENT_ID && CONFIG.FALLBACK_CLIENT_ID !== '';
    
    return hasPrimaryConfig || hasFallbackConfig;
  }

  /**
   * Get current configuration (without sensitive data)
   * @returns {Object}
   */
  function getConfig() {
    const hasPrimaryConfig = CONFIG.CLIENT_ID && 
                             CONFIG.CLIENT_ID !== '{{PAYPAL_CLIENT_ID}}' && 
                             CONFIG.CLIENT_ID !== '';
    
    const hasFallbackConfig = CONFIG.FALLBACK_CLIENT_ID && 
                              CONFIG.FALLBACK_CLIENT_ID !== '';
    
    return {
      currency: CONFIG.CURRENCY,
      intent: CONFIG.INTENT,
      isAvailable: isAvailable(),
      isInitialized: isInitialized,
      isScriptLoaded: isScriptLoaded,
      usingFallback: !hasPrimaryConfig,
      hasFallback: hasFallbackConfig
    };
  }

  // Public API
  return {
    init,
    renderButton,
    createOrder,
    captureOrder,
    isAvailable,
    getConfig
  };
})();

// Auto-initialize if DOM is ready
function autoInitialize() {
  if (PayPalIntegration.isAvailable()) {
    PayPalIntegration.init().catch(err => {
      console.error('PayPal auto-initialization failed:', err);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInitialize);
} else {
  autoInitialize();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PayPalIntegration;
}
