/**
 * ARAYA Energy Gate Component
 * ============================
 * Reusable component for gating features based on user's Energy balance.
 * Include this script in any ARAYA surface to enable Energy-based access control.
 *
 * Usage:
 *   <script src="/src/energy-gate.js"></script>
 *
 *   // Check if user can perform action
 *   const canDo = await EnergyGate.check('voice', 'chat_message', 1);
 *
 *   // Spend Energy with UI feedback
 *   const result = await EnergyGate.spend('voice', 'chat_message', 1);
 *
 *   // Show upgrade modal
 *   EnergyGate.showUpgradeModal();
 *
 * Created: 2026-02-28
 * Version: 1.0.0
 */

const EnergyGate = (function() {
    'use strict';

    const API_BASE = '/.netlify/functions';

    // Cache for performance
    let _cachedAccount = null;
    let _cacheTimestamp = 0;
    const CACHE_TTL = 30000; // 30 seconds

    // Tier colors and icons
    const TIER_CONFIG = {
        flow: { color: '#3B82F6', icon: '💧', name: 'Flow', limit: 100 },
        create: { color: '#8B5CF6', icon: '✨', name: 'Create', limit: 1000 },
        build: { color: '#F59E0B', icon: '🔧', name: 'Build', limit: 3000 },
        scale: { color: '#10B981', icon: '🚀', name: 'Scale', limit: '∞' }
    };

    // Action costs (fallback if API unavailable)
    const DEFAULT_COSTS = {
        voice: { chat_message: 1, image_generation: 10, file_analysis: 5, code_execution: 3 },
        edit: { page_scan: 1, content_edit: 2, ai_suggestion: 5 },
        life: { domain_sync: 2, ai_insight: 5, goal_update: 0 },
        terminal: { command: 1, batch_command: 5, automation: 10 },
        api: { request: 1 }
    };

    /**
     * Get current user from localStorage (set by auth.js)
     */
    function getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Fetch user's Energy account
     */
    async function fetchAccount(forceRefresh = false) {
        const user = getCurrentUser();
        if (!user) {
            return null;
        }

        // Return cached if valid
        if (!forceRefresh && _cachedAccount && (Date.now() - _cacheTimestamp < CACHE_TTL)) {
            return _cachedAccount;
        }

        try {
            const response = await fetch(`${API_BASE}/araya-energy/balance`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user.id
                },
                credentials: 'include'
            });

            if (response.status === 404) {
                // Account doesn't exist yet - create one
                const createResponse = await fetch(`${API_BASE}/araya-energy/account`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': user.id
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email: user.email })
                });

                if (createResponse.ok) {
                    const data = await createResponse.json();
                    _cachedAccount = data.data;
                    _cacheTimestamp = Date.now();
                    return _cachedAccount;
                }
                return null;
            }

            if (!response.ok) {
                console.error('Energy API error:', response.status);
                return null;
            }

            const data = await response.json();
            _cachedAccount = data.data;
            _cacheTimestamp = Date.now();
            return _cachedAccount;
        } catch (error) {
            console.error('Failed to fetch Energy account:', error);
            return null;
        }
    }

    /**
     * Get action cost from API or fallback
     */
    function getActionCost(product, action) {
        const productCosts = DEFAULT_COSTS[product] || {};
        return productCosts[action] || 1;
    }

    /**
     * Check if user can perform action (without spending)
     * Returns: { allowed: boolean, reason?: string, balance?: number, cost?: number }
     */
    async function check(product, action, amount = null) {
        const user = getCurrentUser();
        if (!user) {
            return {
                allowed: false,
                reason: 'not_logged_in',
                message: 'Please log in to continue'
            };
        }

        const account = await fetchAccount();
        if (!account) {
            return {
                allowed: false,
                reason: 'no_account',
                message: 'Unable to verify Energy balance'
            };
        }

        // Scale tier = unlimited
        if (account.tier === 'scale') {
            return {
                allowed: true,
                balance: account.balance,
                tier: 'scale',
                unlimited: true
            };
        }

        const cost = amount || getActionCost(product, action);

        if (account.balance >= cost) {
            return {
                allowed: true,
                balance: account.balance,
                cost: cost,
                tier: account.tier
            };
        }

        return {
            allowed: false,
            reason: 'insufficient_energy',
            message: `Not enough Energy. Need ${cost}, have ${account.balance}`,
            balance: account.balance,
            cost: cost,
            tier: account.tier,
            deficit: cost - account.balance
        };
    }

    /**
     * Spend Energy for an action
     * Returns: { success: boolean, balance?: number, error?: string }
     */
    async function spend(product, action, amount = null) {
        const user = getCurrentUser();
        if (!user) {
            showLoginPrompt();
            return { success: false, error: 'Not logged in' };
        }

        const cost = amount || getActionCost(product, action);

        try {
            const response = await fetch(`${API_BASE}/araya-energy/spend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user.id
                },
                credentials: 'include',
                body: JSON.stringify({
                    product,
                    action,
                    amount: cost,
                    idempotency_key: `${user.id}_${product}_${action}_${Date.now()}`
                })
            });

            const data = await response.json();

            if (response.status === 402) {
                // Insufficient Energy - show upgrade
                showUpgradeModal(data.data?.required, data.data?.available);
                return {
                    success: false,
                    error: 'Insufficient Energy',
                    balance: data.data?.available
                };
            }

            if (!response.ok) {
                return { success: false, error: data.error };
            }

            // Invalidate cache
            _cachedAccount = null;

            // Update any UI showing balance
            updateBalanceUI(data.data.balance);

            return {
                success: true,
                spent: data.data.spent,
                balance: data.data.balance
            };
        } catch (error) {
            console.error('Spend Energy error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Gate a feature - check and optionally spend
     * @param {string} product - Product name (voice, edit, life, terminal, api)
     * @param {string} action - Action name
     * @param {object} options - { autoSpend: boolean, showUI: boolean }
     */
    async function gate(product, action, options = {}) {
        const { autoSpend = false, showUI = true } = options;

        const checkResult = await check(product, action);

        if (!checkResult.allowed) {
            if (showUI) {
                if (checkResult.reason === 'not_logged_in') {
                    showLoginPrompt();
                } else if (checkResult.reason === 'insufficient_energy') {
                    showUpgradeModal(checkResult.cost, checkResult.balance);
                }
            }
            return checkResult;
        }

        if (autoSpend) {
            return await spend(product, action);
        }

        return checkResult;
    }

    /**
     * Show login prompt modal
     */
    function showLoginPrompt() {
        const modal = createModal(`
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
                <h2 style="margin: 0 0 8px; color: #1a1a1a;">Login Required</h2>
                <p style="color: #666; margin: 0 0 24px;">Please log in to use ARAYA features</p>
                <button onclick="window.location.href='/login.html'" style="
                    background: linear-gradient(135deg, #8B5CF6, #6366F1);
                    color: white;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: 600;
                ">Log In</button>
                <p style="margin-top: 16px; font-size: 14px; color: #888;">
                    Don't have an account? <a href="/signup.html" style="color: #8B5CF6;">Sign up free</a>
                </p>
            </div>
        `);
        document.body.appendChild(modal);
    }

    /**
     * Show upgrade modal with Energy purchase options
     */
    function showUpgradeModal(required = 0, available = 0) {
        const deficit = required - available;

        const modal = createModal(`
            <div style="text-align: center; max-width: 400px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚡</div>
                <h2 style="margin: 0 0 8px; color: #1a1a1a;">Need More Energy</h2>
                <p style="color: #666; margin: 0 0 16px;">
                    This action requires <strong>${required} Energy</strong><br>
                    You have <strong>${available} Energy</strong> (need ${deficit} more)
                </p>

                <div style="display: grid; gap: 12px; margin: 24px 0;">
                    <div onclick="EnergyGate.startCheckout('create')" style="
                        background: linear-gradient(135deg, #8B5CF6, #6366F1);
                        color: white;
                        padding: 16px;
                        border-radius: 12px;
                        cursor: pointer;
                        text-align: left;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">✨ Create Tier</div>
                                <div style="font-size: 14px; opacity: 0.9;">1,000 Energy/month</div>
                            </div>
                            <div style="font-weight: 700;">$9.99/mo</div>
                        </div>
                    </div>

                    <div onclick="EnergyGate.startCheckout('build')" style="
                        background: linear-gradient(135deg, #F59E0B, #D97706);
                        color: white;
                        padding: 16px;
                        border-radius: 12px;
                        cursor: pointer;
                        text-align: left;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">🔧 Build Tier</div>
                                <div style="font-size: 14px; opacity: 0.9;">3,000 Energy/month</div>
                            </div>
                            <div style="font-weight: 700;">$24.99/mo</div>
                        </div>
                    </div>

                    <div onclick="EnergyGate.startCheckout('scale')" style="
                        background: linear-gradient(135deg, #10B981, #059669);
                        color: white;
                        padding: 16px;
                        border-radius: 12px;
                        cursor: pointer;
                        text-align: left;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">🚀 Scale Tier</div>
                                <div style="font-size: 14px; opacity: 0.9;">UNLIMITED Energy</div>
                            </div>
                            <div style="font-weight: 700;">$49.99/mo</div>
                        </div>
                    </div>
                </div>

                <button onclick="this.closest('.energy-gate-modal').remove()" style="
                    background: transparent;
                    color: #666;
                    border: 1px solid #ddd;
                    padding: 10px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                ">Maybe Later</button>
            </div>
        `);
        document.body.appendChild(modal);
    }

    /**
     * Start Stripe checkout for a tier
     */
    async function startCheckout(tier) {
        const user = getCurrentUser();
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        // Map tier to Stripe price ID
        const priceMap = {
            create: 'price_create_monthly', // Replace with actual Stripe price IDs
            build: 'price_build_monthly',
            scale: 'price_scale_monthly'
        };

        try {
            const response = await fetch(`${API_BASE}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user.id
                },
                credentials: 'include',
                body: JSON.stringify({
                    tier,
                    success_url: window.location.href + '?checkout=success',
                    cancel_url: window.location.href + '?checkout=cancel'
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Unable to start checkout. Please try again.');
        }
    }

    /**
     * Create modal wrapper
     */
    function createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'energy-gate-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            background: white;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            max-width: 90vw;
            animation: slideUp 0.3s ease;
        `;
        inner.innerHTML = content;

        modal.appendChild(inner);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        return modal;
    }

    /**
     * Update any balance display elements on page
     */
    function updateBalanceUI(newBalance) {
        document.querySelectorAll('[data-energy-balance]').forEach(el => {
            el.textContent = newBalance;
        });

        // Dispatch event for custom handlers
        window.dispatchEvent(new CustomEvent('energyBalanceUpdated', {
            detail: { balance: newBalance }
        }));
    }

    /**
     * Render Energy badge UI component
     * Call with container selector to render balance badge
     */
    async function renderBadge(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const account = await fetchAccount();

        if (!account) {
            container.innerHTML = `
                <a href="/login.html" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: #f1f5f9;
                    border-radius: 20px;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 14px;
                ">⚡ Log in</a>
            `;
            return;
        }

        const tierConfig = TIER_CONFIG[account.tier] || TIER_CONFIG.flow;
        const isUnlimited = account.tier === 'scale';

        container.innerHTML = `
            <div onclick="window.location.href='/energy-pricing.html'" style="
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 14px;
                background: linear-gradient(135deg, ${tierConfig.color}15, ${tierConfig.color}05);
                border: 1px solid ${tierConfig.color}30;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s;
            ">
                <span style="font-size: 16px;">${tierConfig.icon}</span>
                <span style="font-weight: 600; color: ${tierConfig.color};" data-energy-balance>
                    ${isUnlimited ? '∞' : account.balance}
                </span>
                <span style="color: #888; font-size: 12px;">Energy</span>
            </div>
        `;
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Public API
    return {
        check,
        spend,
        gate,
        fetchAccount,
        showUpgradeModal,
        showLoginPrompt,
        startCheckout,
        renderBadge,
        TIER_CONFIG,
        DEFAULT_COSTS
    };
})();

// Make globally available
window.EnergyGate = EnergyGate;
console.log('⚡ EnergyGate loaded');
