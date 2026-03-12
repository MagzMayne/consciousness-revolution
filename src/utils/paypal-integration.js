// RootIB: RB-20260223105521-56E17C82
/**
 * Copyright (c) 2008-2026 Ryan Barbrick (Barbrick Design)
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
    CLIENT_ID: '{{PAYPAL_CLIENT_ID}}',  // Replaced by deployment agent
    // Backend API for server-side PayPal operations (Railway deployment)
    API_ENDPOINT: 'https://barbrickdesign-production.up.railway.app',
    CURRENCY: 'USD',
    INTENT: 'capture',
    DISABLE_FUNDING: 'card,credit,venmo',
    ENABLE_FUNDING: '',
    // Fallback configuration - used when primary CLIENT_ID is not configured
    // Note: This client ID is intentionally hardcoded as a fallback mechanism
    // as specified in the requirements. It provides a backup payment option
    // when the primary API is not configured or unavailable.
    FALLBACK_CLIENT_ID: 'Ae5p9t_umXWYHWQuvxEiIb_DNYJUMQgC0NFCjPkIGnliAVW-0lOJRQw3niXh8NIkEkB0HaNbfMFkbSkZ',
    FALLBACK_COMPONENTS: 'buttons',
    FALLBACK_ENABLE_FUNDING: 'venmo',
  };

  let isInitialized = false;
  let isScriptLoaded = false;
  let scriptLoadPromise = null;

  /**
   * Initialize PayPal integration.
   * If CLIENT_ID is not injected at build time, fetches it from the Railway backend
   * (GET /api/paypal/client-id) before loading the PayPal JS SDK.
   * @returns {Promise} Resolves when PayPal SDK is loaded
   */
  function init() {
    if (isInitialized) {
      return scriptLoadPromise;
    }

    isInitialized = true;

    const hasPrimary = CONFIG.CLIENT_ID &&
                       CONFIG.CLIENT_ID !== '{{PAYPAL_CLIENT_ID}}' &&
                       CONFIG.CLIENT_ID !== '';

    if (hasPrimary) {
      scriptLoadPromise = loadPayPalSDK(false);
      return scriptLoadPromise;
    }

    // Try to fetch the client ID from the backend (Railway)
    scriptLoadPromise = fetch(`${CONFIG.API_ENDPOINT}/api/paypal/client-id`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.success && data.clientId) {
          CONFIG.CLIENT_ID = data.clientId;
          console.log('PayPal CLIENT_ID loaded from backend');
          return loadPayPalSDK(false);
        }
        console.warn('PayPal CLIENT_ID not available from backend. Using fallback configuration.');
        return loadPayPalSDK(true);
      })
      .catch(err => {
        console.warn('Could not fetch PayPal client ID from backend:', err.message, '— using fallback');
        return loadPayPalSDK(true);
      });

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
   * Render PayPal button in specified container.
   * When no real PAYPAL_CLIENT_ID is configured the placeholder {{PAYPAL_CLIENT_ID}}
   * is never substituted on a static GitHub Pages site, so we fall back
   * immediately to a PayPal.me direct-payment link that is guaranteed to route
   * funds to BarbrickDesign@gmail.com regardless of SDK configuration.
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
    // When the primary CLIENT_ID is not configured use PayPal.me so payments
    // always reach BarbrickDesign@gmail.com instead of an unconfigured account.
    const hasPrimary = CONFIG.CLIENT_ID &&
                       CONFIG.CLIENT_ID !== '{{PAYPAL_CLIENT_ID}}' &&
                       CONFIG.CLIENT_ID !== '';
    if (!hasPrimary) {
      renderDonationLink(containerId, {
        amount: options.amount || '',
        description: options.description || 'Support Barbrick Design',
        label: options.amount
          ? `💳 Pay $${options.amount} via PayPal`
          : '💳 Pay via PayPal',
      });
      return Promise.resolve();
    }

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
   * Create a PayPal order via the Railway backend API.
   * @param {Object} orderData - Order data ({ amount, currency, description, custom_id })
   * @returns {Promise<Object>} - { success, orderId, status }
   */
  async function createOrder(orderData) {
    try {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/api/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || `API request failed: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  }

  /**
   * Capture a PayPal order via the Railway backend API.
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - { success, orderId, captureId, status }
   */
  async function captureOrder(orderId) {
    try {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/api/paypal/capture-order/${encodeURIComponent(orderId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || `API request failed: ${response.statusText}`);
      }

      return data;
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
      backendUrl: CONFIG.API_ENDPOINT,
      isAvailable: isAvailable(),
      isInitialized: isInitialized,
      isScriptLoaded: isScriptLoaded,
      usingFallback: !hasPrimaryConfig,
      hasFallback: hasFallbackConfig
    };
  }

  /**
   * Render a PayPal.me donation link button (no backend required, always works).
   * Use this as a reliable fallback when the SDK-based flow is unavailable.
   * @param {string} containerId - ID of container element
   * @param {Object} options - Donation options
   * @param {number} [options.amount] - Suggested donation amount (optional)
   * @param {string} [options.description] - Donation description
   * @param {string} [options.label] - Button label text
   */
  function renderDonationLink(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      amount = '',
      description = 'Support Barbrick Design',
      label = '💛 Donate via PayPal',
    } = options;

    const baseUrl = 'https://www.paypal.com/paypalme/BarbrickDesign';
    const url = amount ? `${baseUrl}/${amount}` : baseUrl;

    container.innerHTML = `
      <div style="text-align:center;padding:12px 0;">
        <a href="${url}" target="_blank" rel="noopener noreferrer"
          aria-label="${description} — opens PayPal"
          style="display:inline-block;background:#0070ba;color:#fff;font-weight:bold;
                 padding:12px 28px;border-radius:24px;text-decoration:none;
                 font-size:1em;transition:background 0.2s;"
          onmouseover="this.style.background='#005ea6'"
          onmouseout="this.style.background='#0070ba'">
          ${label}
        </a>
        <p style="margin:8px 0 0;font-size:0.82em;color:#888;">
          Secure payment powered by PayPal
        </p>
      </div>`;
  }

  /**
   * Render PayPal button in specified container with automatic PayPal.me fallback.
   * Tries the PayPal JS SDK first; falls back to a PayPal.me link if SDK fails.
   * @param {string} containerId - ID of container element
   * @param {Object} options - Payment options
   * @param {number} options.amount - Payment amount
   * @param {string} options.description - Payment description
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onError - Error callback
   * @param {Function} options.onCancel - Cancel callback
   * @returns {Promise}
   */
  function renderButtonWithFallback(containerId, options = {}) {
    return renderButton(containerId, options).catch(err => {
      console.warn('PayPal SDK button failed, falling back to PayPal.me link:', err);
      renderDonationLink(containerId, options);
    });
  }

  // Public API
  return {
    init,
    renderButton,
    renderButtonWithFallback,
    renderDonationLink,
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
