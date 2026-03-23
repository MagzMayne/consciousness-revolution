// RootIB: RB-20260319142113-8314F2E0
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
 * File: pumpfun-token-config.js
 * Declaration ID: IP-27651715-MLL28ZV6
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

/** SIGNED BY MeRLynn - ID: MERLYNN-7469c0fb - TIMESTAMP: 2025-12-19T05:53:06.517Z - HASH: 6c0e541a */
/** SIGNED BY AGentR - ID: AGENTR-5f8b4552 - TIMESTAMP: 2025-12-19T05:53:06.517Z - HASH: 6c0e541a */

/**
 * PUMPFUN TOKEN CONFIGURATION & INTEGRATION
 * Complete token integration for pump.fun tokens
 * Supports MNDM token: GK24fQQQKNF6JMsCd3rLfSr1n2tvr3bCJ7zAgNqxbA7r
 * Governing / rewards token: CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump
 * IP protocol token (RootIB): 6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump
 * Vault wallet: 6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk
 */

/** Known pump.fun tokens for the consciousness-revolution ecosystem. */
const PUMPFUN_TOKENS = {
    /** Primary MNDM community token */
    MNDM: {
        address: 'GK24fQQQKNF6JMsCd3rLfSr1n2tvr3bCJ7zAgNqxbA7r',
        name: 'MANDEM.OS',
        symbol: 'MNDM',
        decimals: 9,
        chain: 'solana',
        platform: 'pump.fun',
        logo: '💎',
        color: '#00FFFF',
        gradient: 'linear-gradient(135deg, #00FFFF 0%, #FF00FF 100%)',
        pumpfunUrl: 'https://pump.fun/coin/GK24fQQQKNF6JMsCd3rLfSr1n2tvr3bCJ7zAgNqxbA7r',
        role: 'community'
    },
    /** Governing / rewards token — core of all creator reward distributions */
    GOVERN: {
        address: 'CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        name: 'Overkill Kulture',
        symbol: 'OKK',
        decimals: 9,
        chain: 'solana',
        platform: 'pump.fun',
        logo: '🏛️',
        color: '#FFD700',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
        pumpfunUrl: 'https://pump.fun/coin/CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        role: 'governance',
        description: 'Main governing token for all creator rewards. Investors earn as more developers join the platform.'
    },
    /** IP protocol token for all devs' ideas and projects (Root Idea Block) */
    CRYPTO_CHANNEL: {
        address: '6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        name: 'Root Idea Block',
        symbol: 'RootIB',
        decimals: 9,
        chain: 'solana',
        platform: 'pump.fun',
        logo: '💡',
        color: '#9B30FF',
        gradient: 'linear-gradient(135deg, #9B30FF 0%, #C71585 100%)',
        pumpfunUrl: 'https://pump.fun/coin/6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        role: 'channel',
        description: 'IP protocol for all devs ideas and projects.'
    }
};

/** Primary vault wallet for all platform revenue. */
const VAULT_WALLET = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk';

/** Pump.fun URL for creating a new token. */
const PUMPFUN_CREATE_URL = 'https://pump.fun/create';

class PumpfunTokenConfig {
    /**
     * @param {string} [tokenKey='MNDM'] - Key from PUMPFUN_TOKENS registry.
     *   Valid values: 'MNDM' (default, community token),
     *                 'GOVERN' (Overkill Kulture / OKK rewards token),
     *                 'CRYPTO_CHANNEL' (Root Idea Block / RootIB IP protocol token).
     *   Existing callers that construct without arguments continue to receive
     *   the MNDM token unchanged.
     */
    constructor(tokenKey = 'MNDM') {
        const tokenDef = PUMPFUN_TOKENS[tokenKey] || PUMPFUN_TOKENS.MNDM;
        this.token = { ...tokenDef };
        this.tokens = PUMPFUN_TOKENS;
        this.vaultWallet = VAULT_WALLET;

        this.initialized = false;
        this.updateInterval = null;
        this.updateFrequency = 30000; // 30 seconds

        console.log('🔥 Pump.fun Token Config Loaded');
        console.log('Token Address:', this.token.address);
    }

    /**
     * Get token price data
     */
    async getTokenPrice() {
        try {
            // Fetch real price data from pump.fun or Solana DEX APIs
            const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${this.token.address}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.pairs && data.pairs.length > 0) {
                    const pair = data.pairs[0];
                    return {
                        price: parseFloat(pair.priceUsd) || 0,
                        priceUSD: parseFloat(pair.priceUsd) || 0,
                        change24h: parseFloat(pair.priceChange?.h24) || 0,
                        volume24h: parseFloat(pair.volume?.h24) || 0,
                        marketCap: parseFloat(pair.fdv) || 0,
                        holders: pair.holders || 0,
                        transactions24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
                        lastUpdate: new Date().toISOString(),
                        isMock: false
                    };
                }
            }
            
            // Fallback: return base data structure with zeros
            console.warn('Unable to fetch live token price, returning base structure');
            return {
                price: 0,
                priceUSD: 0,
                change24h: 0,
                volume24h: 0,
                marketCap: 0,
                holders: 0,
                transactions24h: 0,
                lastUpdate: new Date().toISOString(),
                isMock: false,
                error: 'Price data unavailable'
            };
        } catch (error) {
            console.error('Error fetching token price:', error);
            return {
                price: 0,
                priceUSD: 0,
                change24h: 0,
                volume24h: 0,
                marketCap: 0,
                holders: 0,
                transactions24h: 0,
                lastUpdate: new Date().toISOString(),
                isMock: false,
                error: error.message
            };
        }
    }

    /**
     * Get token balance for wallet address
     */
    async getTokenBalance(walletAddress) {
        if (!walletAddress) return 0;

        try {
            // Use Solana RPC to get token balance
            const response = await fetch('https://api.mainnet-beta.solana.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTokenAccountsByOwner',
                    params: [
                        walletAddress,
                        { mint: this.token.address },
                        { encoding: 'jsonParsed' }
                    ]
                })
            });

            const data = await response.json();
            
            if (data.result && data.result.value && data.result.value.length > 0) {
                const balance = data.result.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                console.log(`💎 Balance for ${walletAddress.slice(0, 8)}...: ${balance} ${this.token.symbol}`);
                return balance;
            }

            return 0;
        } catch (error) {
            console.error('Error fetching token balance:', error);
            return 0;
        }
    }

    /**
     * Format token amount for display
     */
    formatTokenAmount(amount, decimals = 4) {
        if (!amount || amount === 0) return '0';

        // Format with commas and specified decimals
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        }).format(amount);
    }

    /**
     * Get display information for the token
     */
    getTokenDisplayInfo() {
        return {
            symbol: this.token.symbol,
            name: this.token.name,
            logo: this.token.logo,
            color: this.token.color,
            gradient: this.token.gradient,
            address: this.token.address,
            shortAddress: `${this.token.address.slice(0, 4)}...${this.token.address.slice(-4)}`,
            pumpfunUrl: this.token.pumpfunUrl,
            chain: this.token.chain,
            platform: this.token.platform
        };
    }

    /**
     * Create and display token widget
     */
    async createTokenWidget(containerId = 'pumpfun-token-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        try {
            // Get current price and balance
            const priceData = await this.getTokenPrice();
            let balance = 0;

            // Check if wallet is connected
            if (window.universalWalletAuth && window.universalWalletAuth.isAuthenticated()) {
                const walletAddress = window.universalWalletAuth.getAddress();
                balance = await this.getTokenBalance(walletAddress);
            }

            // Create widget HTML
            const widgetHtml = this.generateWidgetHTML(priceData, balance);
            container.innerHTML = widgetHtml;

            // Add event listeners
            this.attachWidgetEvents(container);

            console.log('🔥 Token widget created successfully');

        } catch (error) {
            console.error('Error creating token widget:', error);
            container.innerHTML = '<div style="color: #ff6b6b; padding: 20px; text-align: center;">Error loading token data</div>';
        }
    }

    /**
     * Generate widget HTML
     */
    generateWidgetHTML(priceData, balance) {
        const info = this.getTokenDisplayInfo();
        const priceChangeColor = priceData.change24h >= 0 ? '#00ff88' : '#ff6b6b';
        const priceChangeSymbol = priceData.change24h >= 0 ? '▲' : '▼';

        return `
            <div class="pumpfun-token-widget" style="
                background: ${info.gradient};
                border-radius: 16px;
                padding: 20px;
                color: white;
                box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3);
                font-family: 'Inter', sans-serif;
                position: relative;
                overflow: hidden;
            ">
                <!-- Background Pattern -->
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%);
                    pointer-events: none;
                "></div>

                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">${info.logo}</span>
                        <div>
                            <div style="font-weight: 700; font-size: 16px;">${info.symbol}</div>
                            <div style="font-size: 12px; opacity: 0.8;">${info.name}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; font-size: 16px;">${this.formatTokenAmount(balance)}</div>
                        <div style="font-size: 12px; opacity: 0.8;">Balance</div>
                    </div>
                </div>

                <!-- Price Info -->
                <div style="margin-bottom: 20px; position: relative; z-index: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-size: 14px; opacity: 0.8;">Price</div>
                        <div style="font-size: 14px; opacity: 0.8;">24h Change</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: 700; font-size: 18px;">$${priceData.priceUSD.toFixed(6)}</div>
                        <div style="display: flex; align-items: center; gap: 4px; color: ${priceChangeColor};">
                            <span>${priceChangeSymbol}</span>
                            <span style="font-weight: 600;">${Math.abs(priceData.change24h).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <!-- Trade Button -->
                <button class="pumpfun-trade-btn" style="
                    width: 100%;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    z-index: 1;
                ">
                    <span>📈</span>
                    <span>Trade on Pump.fun</span>
                </button>

                <!-- Footer Info -->
                <div style="margin-top: 16px; text-align: center; font-size: 11px; opacity: 0.7; position: relative; z-index: 1;">
                    <div>Contract: ${info.shortAddress}</div>
                    ${priceData.isMock ? '<div style="color: #ffff00; margin-top: 4px;">⚠️ Using mock data for testing</div>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to widget
     */
    attachWidgetEvents(container) {
        const tradeBtn = container.querySelector('.pumpfun-trade-btn');
        if (tradeBtn) {
            tradeBtn.addEventListener('click', () => {
                window.open(this.token.pumpfunUrl, '_blank');
            });

            // Hover effects
            tradeBtn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255, 255, 255, 0.3)';
                this.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                this.style.transform = 'translateY(-1px)';
            });

            tradeBtn.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255, 255, 255, 0.2)';
                this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                this.style.transform = 'translateY(0)';
            });
        }
    }

    /**
     * Initialize token integration
     */
    async init() {
        if (this.initialized) return;

        console.log('🔥 Initializing Pump.fun token integration...');

        // Auto-initialize if container exists
        const container = document.getElementById('pumpfun-token-container');
        if (container) {
            await this.createTokenWidget();
        }

        // Set up auto-refresh
        this.updateInterval = setInterval(async () => {
            const container = document.getElementById('pumpfun-token-container');
            if (container) {
                await this.createTokenWidget();
            }
        }, this.updateFrequency);

        this.initialized = true;
        console.log('✅ Pump.fun token integration initialized');
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.initialized = false;
        console.log('🔥 Pump.fun token integration destroyed');
    }
}

// Global functions for external use
async function getTokenPrice() {
    const config = new PumpfunTokenConfig();
    return await config.getTokenPrice();
}

async function getTokenBalance(walletAddress) {
    const config = new PumpfunTokenConfig();
    return await config.getTokenBalance(walletAddress);
}

function formatTokenAmount(amount, decimals = 4) {
    const config = new PumpfunTokenConfig();
    return config.formatTokenAmount(amount, decimals);
}

function getTokenDisplayInfo() {
    const config = new PumpfunTokenConfig();
    return config.getTokenDisplayInfo();
}

async function initPumpfunToken(containerId = 'pumpfun-token-container') {
    const config = new PumpfunTokenConfig();
    await config.init();
    return await config.createTokenWidget(containerId);
}

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    window.PumpfunTokenConfig = PumpfunTokenConfig;
    window.PUMPFUN_TOKENS    = PUMPFUN_TOKENS;
    window.VAULT_WALLET      = VAULT_WALLET;
    window.PUMPFUN_CREATE_URL = PUMPFUN_CREATE_URL;
    window.getTokenPrice = getTokenPrice;
    window.getTokenBalance = getTokenBalance;
    window.formatTokenAmount = formatTokenAmount;
    window.getTokenDisplayInfo = getTokenDisplayInfo;
    window.initPumpfunToken = initPumpfunToken;

    // Auto-init when DOM is ready
    document.addEventListener('DOMContentLoaded', async () => {
        const config = new PumpfunTokenConfig();
        await config.init();
    });
}

console.log('🔥 Pump.fun Token Config System Ready');
console.log('🏛️ Governing token:', PUMPFUN_TOKENS.GOVERN.address);
console.log('📡 Crypto channel token:', PUMPFUN_TOKENS.CRYPTO_CHANNEL.address);
console.log('🔐 Vault wallet:', VAULT_WALLET);
