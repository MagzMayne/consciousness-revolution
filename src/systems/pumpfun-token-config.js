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
 * Declaration ID: IP-27651715-MLL28ZW9
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

/** SIGNED BY MeRLynn - ID: MERLYNN-460bae45 - TIMESTAMP: 2025-12-19T05:53:06.543Z - HASH: 36a698f9 */
/** SIGNED BY AGentR - ID: AGENTR-447fbb6e - TIMESTAMP: 2025-12-19T05:53:06.543Z - HASH: 36a698f9 */

/**
 * Pump.fun Token Configuration
 * Official token for Mandem.OS and Ember Terminal
 */

const PUMPFUN_TOKEN_CONFIG = {
    // Token Identity
    address: '3yw1L5c8FwAzfdUeZQXEUd9sL3DP7HtXP19anp2Hpump',
    name: 'Gem Bot Pump Token',
    symbol: 'GBPT',
    decimals: 9,
    
    // Pump.fun Platform
    pumpfunUrl: 'https://pump.fun/coin/3yw1L5c8FwAzfdUeZQXEUd9sL3DP7HtXP19anp2Hpump',
    chain: 'solana',
    platform: 'pump.fun',
    
    // Integration Settings
    useIn: ['mandem.os', 'ember-terminal'],
    features: {
        trading: true,
        staking: true,
        governance: true,
        rewards: true
    },
    
    // Display Settings
    logo: '🔥', // Can be updated with actual logo URL
    color: '#FF6B35',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931A 100%)',
    
    // API Endpoints
    apis: {
        price: `https://api.pump.fun/token/3yw1L5c8FwAzfdUeZQXEUd9sL3DP7HtXP19anp2Hpump/price`,
        stats: `https://api.pump.fun/token/3yw1L5c8FwAzfdUeZQXEUd9sL3DP7HtXP19anp2Hpump/stats`,
        holders: `https://api.pump.fun/token/3yw1L5c8FwAzfdUeZQXEUd9sL3DP7HtXP19anp2Hpump/holders`
    },
    
    // Solana Explorer Links
    explorers: {
        solscan: `https://solscan.io/token/3yw1L5c8FwAzfdUeZQXEUd9sL3DP7HtXP19anp2Hpump`,
        solana: `https://explorer.solana.com/address/3yw1L5c8FwAzfdUeZQXEUd9sL3DP7HtXP19anp2Hpump`,
        birdeye: `https://birdeye.so/token/3yw1L5c8FwAzfdUeZQXEUd9sL3DP7HtXP19anp2Hpump`
    }
};

/**
 * Get current token price from pump.fun
 */
async function getTokenPrice() {
    try {
        // Mock implementation - replace with actual API call
        // const response = await fetch(PUMPFUN_TOKEN_CONFIG.apis.price);
        // const data = await response.json();
        // return data.price;
        
        // Mock data for now
        return {
            price: 0.000042, // SOL
            priceUSD: 0.0042,
            change24h: 15.3,
            volume24h: 125000,
            marketCap: 420000,
            holders: 1337,
            transactions24h: 2450
        };
    } catch (error) {
        console.error('❌ Failed to fetch token price:', error);
        return null;
    }
}

/**
 * Get token balance for a wallet
 */
async function getTokenBalance(walletAddress) {
    try {
        if (!walletAddress) {
            console.warn('⚠️ No wallet address provided');
            return 0;
        }
        
        // Mock implementation - replace with actual Solana RPC call
        // const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));
        // const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        //     new solanaWeb3.PublicKey(walletAddress),
        //     { mint: new solanaWeb3.PublicKey(PUMPFUN_TOKEN_CONFIG.address) }
        // );
        // if (tokenAccounts.value.length > 0) {
        //     return tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        // }
        
        // Mock balance for testing
        return Math.random() * 10000;
    } catch (error) {
        console.error('❌ Failed to fetch token balance:', error);
        return 0;
    }
}

/**
 * Format token amount with proper decimals
 */
function formatTokenAmount(amount, decimals = 2) {
    if (!amount || isNaN(amount)) return '0.00';
    return parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Get token display info
 */
function getTokenDisplayInfo() {
    return {
        symbol: PUMPFUN_TOKEN_CONFIG.symbol,
        name: PUMPFUN_TOKEN_CONFIG.name,
        logo: PUMPFUN_TOKEN_CONFIG.logo,
        color: PUMPFUN_TOKEN_CONFIG.color,
        address: PUMPFUN_TOKEN_CONFIG.address,
        shortAddress: `${PUMPFUN_TOKEN_CONFIG.address.substring(0, 6)}...${PUMPFUN_TOKEN_CONFIG.address.substring(PUMPFUN_TOKEN_CONFIG.address.length - 4)}`,
        pumpfunUrl: PUMPFUN_TOKEN_CONFIG.pumpfunUrl
    };
}

/**
 * Create token widget HTML
 */
function createTokenWidget(balance = 0, price = null) {
    const info = getTokenDisplayInfo();
    const priceData = price || { priceUSD: 0, change24h: 0 };
    const changeColor = priceData.change24h >= 0 ? '#10b981' : '#ef4444';
    const changeSymbol = priceData.change24h >= 0 ? '▲' : '▼';
    
    return `
        <div class="pumpfun-token-widget" style="
            background: ${PUMPFUN_TOKEN_CONFIG.gradient};
            padding: 15px;
            border-radius: 12px;
            color: white;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
            margin: 10px 0;
        ">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 24px; font-weight: bold;">
                        ${info.logo} ${info.symbol}
                    </div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">
                        ${info.name}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 20px; font-weight: bold;">
                        ${formatTokenAmount(balance, 2)}
                    </div>
                    <div style="font-size: 12px; opacity: 0.9;">
                        Balance
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 12px; opacity: 0.8;">Price</div>
                        <div style="font-size: 16px; font-weight: bold;">
                            $${formatTokenAmount(priceData.priceUSD, 6)}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; opacity: 0.8;">24h Change</div>
                        <div style="font-size: 16px; font-weight: bold; color: ${changeColor};">
                            ${changeSymbol} ${Math.abs(priceData.change24h).toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <a href="${info.pumpfunUrl}" target="_blank" style="
                    flex: 1;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    text-decoration: none;
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: bold;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    📈 Trade on Pump.fun
                </a>
            </div>
        </div>
    `;
}

/**
 * Initialize token integration
 */
async function initPumpfunToken(containerId = 'pumpfun-token-container') {
    console.log('🔥 Initializing Pump.fun Token Integration...');
    
    try {
        // Get price data
        const priceData = await getTokenPrice();
        
        // Get wallet address if connected
        let balance = 0;
        if (window.universalWalletAuth && window.universalWalletAuth.isAuthenticated()) {
            const address = window.universalWalletAuth.getAddress();
            balance = await getTokenBalance(address);
        }
        
        // Create widget
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = createTokenWidget(balance, priceData);
            console.log('✅ Pump.fun token widget created');
        }
        
        // Log token info
        console.log('🔥 Token:', PUMPFUN_TOKEN_CONFIG.symbol);
        console.log('📍 Address:', PUMPFUN_TOKEN_CONFIG.address);
        console.log('💰 Balance:', formatTokenAmount(balance));
        console.log('💵 Price:', priceData ? `$${formatTokenAmount(priceData.priceUSD, 6)}` : 'Loading...');
        
        return {
            balance,
            price: priceData,
            config: PUMPFUN_TOKEN_CONFIG
        };
    } catch (error) {
        console.error('❌ Failed to initialize pump.fun token:', error);
        return null;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PUMPFUN_TOKEN_CONFIG = PUMPFUN_TOKEN_CONFIG;
    window.getTokenPrice = getTokenPrice;
    window.getTokenBalance = getTokenBalance;
    window.formatTokenAmount = formatTokenAmount;
    window.getTokenDisplayInfo = getTokenDisplayInfo;
    window.createTokenWidget = createTokenWidget;
    window.initPumpfunToken = initPumpfunToken;
    
    console.log('🔥 Pump.fun Token Config Loaded');
    console.log('📍 Token Address:', PUMPFUN_TOKEN_CONFIG.address);
    console.log('🌐 Pump.fun URL:', PUMPFUN_TOKEN_CONFIG.pumpfunUrl);
}

// Auto-initialize on DOMContentLoaded if container exists
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('pumpfun-token-container')) {
            initPumpfunToken();
        }
    });
}
