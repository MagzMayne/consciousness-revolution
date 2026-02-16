/**
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 * All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * FuturesByAgentR Payment Modal
 * UI component for tier selection and payment processing
 * 
 * For licensing inquiries: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * 
 * @license Proprietary
 * @copyright 2024-2025 Ryan Barbrick. All Rights Reserved.
 */

const FuturesPaymentModal = (function() {
    'use strict';

    let modalElement = null;
    let selectedTier = null;
    let onPurchaseComplete = null;

    /**
     * Create modal HTML structure
     * @returns {HTMLElement} Modal element
     */
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'futures-payment-modal';
        modal.className = 'futures-modal-overlay';
        modal.innerHTML = `
            <div class="futures-modal-content">
                <div class="futures-modal-header">
                    <h2>🚀 Unlock Full Trading Access</h2>
                    <button class="futures-modal-close" onclick="FuturesPaymentModal.hide()">&times;</button>
                </div>
                
                <div class="futures-modal-body">
                    <p class="futures-modal-description">
                        Choose your access plan to unlock trading signals and automated trading features.
                        All plans include full access to the platform during the selected period.
                    </p>
                    
                    <div id="tier-selection" class="tier-grid"></div>
                    
                    <div id="payment-section" class="payment-section" style="display: none;">
                        <div class="selected-tier-info">
                            <h3>Selected Plan: <span id="selected-tier-name"></span></h3>
                            <p class="tier-price-display">$<span id="selected-tier-price"></span></p>
                            <ul id="selected-tier-features"></ul>
                        </div>
                        
                        <div id="paypal-button-container" class="paypal-container"></div>
                        
                        <button class="back-button" onclick="FuturesPaymentModal.backToTiers()">
                            ← Back to Plans
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        addModalStyles();
        
        return modal;
    }

    /**
     * Add modal styles to page
     */
    function addModalStyles() {
        if (document.getElementById('futures-modal-styles')) {
            return; // Already added
        }

        const style = document.createElement('style');
        style.id = 'futures-modal-styles';
        style.textContent = `
            .futures-modal-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                z-index: 10000;
                justify-content: center;
                align-items: center;
                padding: 20px;
                overflow-y: auto;
            }

            .futures-modal-overlay.active {
                display: flex;
            }

            .futures-modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 20px;
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(0, 210, 255, 0.3);
            }

            .futures-modal-header {
                padding: 30px;
                background: linear-gradient(90deg, #0a192f 0%, #173156 100%);
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid rgba(0, 210, 255, 0.3);
            }

            .futures-modal-header h2 {
                color: #00d2ff;
                margin: 0;
                font-size: 1.8em;
                text-shadow: 0 0 20px rgba(0, 210, 255, 0.5);
            }

            .futures-modal-close {
                background: transparent;
                border: none;
                color: #fff;
                font-size: 2em;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            }

            .futures-modal-close:hover {
                background: rgba(255, 0, 0, 0.2);
                transform: rotate(90deg);
            }

            .futures-modal-body {
                padding: 30px;
            }

            .futures-modal-description {
                color: #ecf0f1;
                text-align: center;
                margin-bottom: 30px;
                font-size: 1.1em;
                line-height: 1.6;
            }

            .tier-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }

            .tier-card {
                background: rgba(23, 49, 86, 0.4);
                border: 2px solid rgba(0, 150, 255, 0.3);
                border-radius: 15px;
                padding: 25px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            }

            .tier-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, transparent, rgba(0, 210, 255, 0.1));
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            }

            .tier-card:hover::before {
                opacity: 1;
            }

            .tier-card:hover {
                transform: translateY(-5px);
                border-color: rgba(0, 210, 255, 0.6);
                box-shadow: 0 10px 30px rgba(0, 210, 255, 0.3);
            }

            .tier-card.popular {
                border-color: rgba(255, 215, 0, 0.6);
                background: rgba(255, 215, 0, 0.1);
            }

            .tier-card.popular::after {
                content: '⭐ POPULAR';
                position: absolute;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #ffd700, #ffa500);
                color: #000;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.7em;
                font-weight: bold;
            }

            .tier-card.premium {
                border-color: rgba(139, 92, 246, 0.8);
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2));
                box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
            }

            .tier-card.premium::after {
                content: '👑 BEST VALUE';
                position: absolute;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #8b5cf6, #6366f1);
                color: #fff;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.7em;
                font-weight: bold;
            }

            .tier-icon {
                font-size: 2.5em;
                text-align: center;
                margin-bottom: 10px;
            }

            .tier-name {
                color: #00d2ff;
                font-size: 1.3em;
                font-weight: bold;
                margin-bottom: 10px;
                text-align: center;
            }

            .tier-price {
                color: #fff;
                font-size: 2em;
                font-weight: bold;
                text-align: center;
                margin-bottom: 5px;
            }

            .tier-price .currency {
                font-size: 0.6em;
                color: #95a5a6;
            }

            .tier-savings {
                color: #4ade80;
                text-align: center;
                font-size: 0.9em;
                margin-bottom: 15px;
                font-weight: bold;
            }

            .tier-description {
                color: #95a5a6;
                text-align: center;
                margin-bottom: 15px;
                font-size: 0.9em;
            }

            .tier-features {
                list-style: none;
                padding: 0;
                margin: 15px 0;
            }

            .tier-features li {
                color: #ecf0f1;
                padding: 8px 0;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9em;
            }

            .tier-features li::before {
                content: '✓';
                color: #4ade80;
                font-weight: bold;
                font-size: 1.2em;
            }

            .tier-select-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #00d2ff, #0096ff);
                color: #fff;
                border: none;
                border-radius: 8px;
                font-size: 1em;
                font-weight: bold;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.3s;
            }

            .tier-select-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 20px rgba(0, 210, 255, 0.4);
            }

            .payment-section {
                text-align: center;
            }

            .selected-tier-info {
                background: rgba(0, 210, 255, 0.1);
                border: 2px solid rgba(0, 210, 255, 0.3);
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 30px;
            }

            .selected-tier-info h3 {
                color: #00d2ff;
                margin-bottom: 15px;
            }

            .tier-price-display {
                font-size: 2.5em;
                font-weight: bold;
                color: #fff;
                margin-bottom: 20px;
            }

            #selected-tier-features {
                list-style: none;
                padding: 0;
                text-align: left;
                max-width: 400px;
                margin: 0 auto;
            }

            #selected-tier-features li {
                color: #ecf0f1;
                padding: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            #selected-tier-features li::before {
                content: '✓';
                color: #4ade80;
                font-weight: bold;
                font-size: 1.3em;
            }

            .paypal-container {
                max-width: 500px;
                margin: 30px auto;
                min-height: 150px;
            }

            .back-button {
                background: rgba(108, 117, 125, 0.3);
                color: #fff;
                border: 1px solid rgba(108, 117, 125, 0.5);
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1em;
                margin-top: 20px;
                transition: all 0.3s;
            }

            .back-button:hover {
                background: rgba(108, 117, 125, 0.5);
                transform: translateX(-5px);
            }

            @media (max-width: 768px) {
                .tier-grid {
                    grid-template-columns: 1fr;
                }
                
                .futures-modal-header h2 {
                    font-size: 1.3em;
                }
                
                .futures-modal-body {
                    padding: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Render tier selection cards
     */
    function renderTierSelection() {
        const tiers = FuturesAccessControl.getAllTiers();
        const container = document.getElementById('tier-selection');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(tiers).forEach(([key, tier]) => {
            const card = document.createElement('div');
            card.className = 'tier-card';
            
            if (tier.popular) card.classList.add('popular');
            if (tier.premium) card.classList.add('premium');
            
            let savingsHTML = '';
            if (tier.savings) {
                savingsHTML = `<div class="tier-savings">Save $${tier.savings}!</div>`;
            }
            
            card.innerHTML = `
                <div class="tier-icon">${tier.icon}</div>
                <div class="tier-name">${tier.name}</div>
                <div class="tier-price">
                    <span class="currency">$</span>${tier.price}
                </div>
                ${savingsHTML}
                <div class="tier-description">${tier.description}</div>
                <ul class="tier-features">
                    ${tier.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <button class="tier-select-btn" onclick="FuturesPaymentModal.selectTier('${key}')">
                    Select Plan
                </button>
            `;
            
            container.appendChild(card);
        });
    }

    /**
     * Select a tier and show payment options
     * @param {string} tier - Tier key
     */
    function selectTier(tier) {
        selectedTier = tier;
        const tierInfo = FuturesAccessControl.getTierInfo(tier);
        
        if (!tierInfo) {
            console.error('Invalid tier:', tier);
            return;
        }
        
        // Hide tier selection
        document.getElementById('tier-selection').style.display = 'none';
        
        // Show payment section
        const paymentSection = document.getElementById('payment-section');
        paymentSection.style.display = 'block';
        
        // Update selected tier info
        document.getElementById('selected-tier-name').textContent = tierInfo.name;
        document.getElementById('selected-tier-price').textContent = tierInfo.price;
        
        const featuresList = document.getElementById('selected-tier-features');
        featuresList.innerHTML = tierInfo.features.map(f => `<li>${f}</li>`).join('');
        
        // Render PayPal button
        renderPayPalButton(tier, tierInfo);
    }

    /**
     * Render PayPal payment button
     * @param {string} tier - Tier key
     * @param {Object} tierInfo - Tier information
     */
    function renderPayPalButton(tier, tierInfo) {
        const container = document.getElementById('paypal-button-container');
        container.innerHTML = '';
        
        if (typeof paypal === 'undefined') {
            container.innerHTML = '<p style="color: #e74c3c;">PayPal SDK not loaded. Please refresh the page.</p>';
            return;
        }
        
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        description: `FuturesByAgentR ${tierInfo.name} - Trading Platform Access`,
                        amount: {
                            currency_code: 'USD',
                            value: tierInfo.price.toString()
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    console.log('Payment completed:', details);
                    handlePaymentSuccess(tier, data.orderID, details);
                });
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                alert('Payment failed. Please try again or contact support at BarbrickDesign@gmail.com');
            },
            onCancel: function(data) {
                console.log('Payment cancelled:', data);
                alert('Payment was cancelled. You can try again anytime.');
            }
        }).render('#paypal-button-container');
    }

    /**
     * Handle successful payment
     * @param {string} tier - Tier purchased
     * @param {string} orderId - PayPal order ID
     * @param {Object} details - Payment details
     */
    function handlePaymentSuccess(tier, orderId, details) {
        try {
            // Grant access
            const status = FuturesAccessControl.grantAccess(tier, orderId);
            
            // Show success message
            const tierInfo = FuturesAccessControl.getTierInfo(tier);
            alert(`✅ Payment Successful!\n\nYou now have ${tierInfo.name} access.\n\nOrder ID: ${orderId}\n\nThank you for your purchase!`);
            
            // Hide modal
            hide();
            
            // Call callback if provided
            if (onPurchaseComplete && typeof onPurchaseComplete === 'function') {
                onPurchaseComplete(status);
            }
            
            // Reload page to update UI
            window.location.reload();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment was successful but there was an error activating your access. Please contact support with order ID: ' + orderId);
        }
    }

    /**
     * Go back to tier selection
     */
    function backToTiers() {
        document.getElementById('payment-section').style.display = 'none';
        document.getElementById('tier-selection').style.display = 'grid';
        selectedTier = null;
    }

    /**
     * Show modal
     * @param {Function} callback - Called after successful purchase
     */
    function show(callback) {
        if (!modalElement) {
            modalElement = createModal();
            document.body.appendChild(modalElement);
        }
        
        onPurchaseComplete = callback;
        
        // Reset to tier selection
        backToTiers();
        renderTierSelection();
        
        // Show modal
        modalElement.classList.add('active');
    }

    /**
     * Hide modal
     */
    function hide() {
        if (modalElement) {
            modalElement.classList.remove('active');
        }
        selectedTier = null;
        onPurchaseComplete = null;
    }

    // Public API
    return {
        show,
        hide,
        selectTier,
        backToTiers
    };
})();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FuturesPaymentModal;
}
