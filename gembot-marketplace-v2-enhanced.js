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
 * File: gembot-marketplace-v2-enhanced.js
 * Declaration ID: IP-25AFC079-MLL28ZUX
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * 🔥 ENHANCED GEMBOT MARKETPLACE V2.0
 * Complete marketplace system with:
 * - Gem Forge (Trade/forge assets into NFTs) 
 * - Austin's Live Listing Hub Integration
 * - Advanced Tier Cuts Shop
 * - User Custom Shops with PayPal Approval
 * - GBUV Token Burning Mechanism
 * - Integrated with Merlin AI Video Generation
 */

class GemBotMarketplaceV2 {
    constructor() {
        this.version = '2.0';
        this.initialized = false;
        
        // Core Systems
        this.gbuvTokenAddress = 'DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump';
        this.burnWallet = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk';
        this.paypalApprovalEmail = 'BarbrickDesign@gmail.com';
        
        // State Management
        this.userShops = JSON.parse(localStorage.getItem('gembot_user_shops') || '[]');
        this.burnedTokens = parseFloat(localStorage.getItem('gembot_burned_tokens') || '0');
        this.nftForgedAssets = JSON.parse(localStorage.getItem('gembot_nft_assets') || '[]');
        this.austinListings = [];
        this.advancedCuts = [];
        
        // Initialize system
        this.init();
    }

    async init() {
        console.log('🔥 Initializing GemBot Marketplace V2.0...');
        
        // Load marketplace data
        await this.loadAustinListings();
        await this.loadAdvancedCuts();
        await this.validateUserShops();
        
        // Initialize Merlin AI integration
        this.initMerlinIntegration();
        
        this.initialized = true;
        console.log('✅ GemBot Marketplace V2.0 Ready!');
        
        // Auto-update marketplace if it's currently displayed
        if (window.leaderboardUI && leaderboardUI.currentTab === 'marketplace') {
            leaderboardUI.switchTab('marketplace');
        }
    }

    // ===================================
    // 🔨 GEM FORGE SYSTEM
    // ===================================
    
    renderGemForge() {
        const userAssets = this.getUserAssets();
        const forgeCost = this.calculateForgeCost();
        
        return `
            <div class="gem-forge-container">
                <div class="forge-header">
                    <h2>🔨 Gem Forge - Asset to NFT Conversion</h2>
                    <p>Transform your in-game assets into tradeable NFTs on Solana blockchain</p>
                    <div class="forge-stats">
                        <span class="stat">💎 ${this.nftForgedAssets.length} NFTs Forged</span>
                        <span class="stat">🔥 ${this.burnedTokens.toFixed(2)} GBUV Burned</span>
                        <span class="stat">💰 ${forgeCost} GBUV per Forge</span>
                    </div>
                </div>

                <!-- Asset Selection -->
                <div class="forge-section">
                    <h3>📦 Select Assets to Forge</h3>
                    <div class="asset-grid">
                        ${userAssets.map(asset => this.renderAssetCard(asset)).join('')}
                    </div>
                </div>

                <!-- Forge Configuration -->
                <div class="forge-section">
                    <h3>⚙️ NFT Configuration</h3>
                    <div class="forge-config">
                        <input type="text" id="nftName" placeholder="NFT Name" class="forge-input">
                        <textarea id="nftDescription" placeholder="NFT Description" class="forge-input"></textarea>
                        <select id="nftRarity" class="forge-input">
                            <option value="common">Common (1x GBUV)</option>
                            <option value="rare">Rare (2x GBUV)</option>
                            <option value="epic">Epic (5x GBUV)</option>
                            <option value="legendary">Legendary (10x GBUV)</option>
                        </select>
                    </div>
                </div>

                <!-- Forge Button -->
                <div class="forge-action">
                    <button class="btn-forge-nft" onclick="marketplaceV2.forgeAssetToNFT()">
                        🔥 Forge NFT (Burns ${forgeCost} GBUV)
                    </button>
                    <p class="forge-notice">⚠️ This action is irreversible and will burn GBUV tokens</p>
                </div>

                <!-- Your NFT Collection -->
                <div class="forge-section">
                    <h3>🎨 Your NFT Collection</h3>
                    <div class="nft-grid">
                        ${this.nftForgedAssets.map(nft => this.renderNFTCard(nft)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    async forgeAssetToNFT() {
        const selectedAssets = document.querySelectorAll('.asset-card.selected');
        const nftName = document.getElementById('nftName').value;
        const nftDescription = document.getElementById('nftDescription').value;
        const nftRarity = document.getElementById('nftRarity').value;

        if (selectedAssets.length === 0 || !nftName) {
            this.showNotification('Please select assets and provide NFT details', 'error');
            return;
        }

        const forgeCost = this.calculateForgeCost(nftRarity);
        
        // Simulate GBUV burning
        if (!await this.burnGBUV(forgeCost)) {
            this.showNotification('Insufficient GBUV tokens', 'error');
            return;
        }

        // Create NFT metadata
        const nftData = {
            id: `nft_${Date.now()}`,
            name: nftName,
            description: nftDescription,
            rarity: nftRarity,
            assets: Array.from(selectedAssets).map(el => el.dataset.assetId),
            forgedAt: new Date().toISOString(),
            tokenAddress: this.generateMockTokenAddress(),
            image: this.generateNFTImage(selectedAssets)
        };

        // Save NFT
        this.nftForgedAssets.push(nftData);
        localStorage.setItem('gembot_nft_assets', JSON.stringify(this.nftForgedAssets));

        // Notify systems
        this.notifyMerlinAI('nft_forged', nftData);
        this.showNotification('🎉 NFT Successfully Forged!', 'success');
        
        // Refresh marketplace
        setTimeout(() => leaderboardUI.switchTab('marketplace'), 1000);
    }

    // ===================================
    // 🌍 AUSTIN'S LIVE LISTING HUB
    // ===================================

    async loadAustinListings() {
        // Simulate loading from Austin's live website
        this.austinListings = [
            {
                id: 'austin_001',
                name: 'Blue Sapphire Ring',
                description: '2.3ct Ceylon Sapphire in 14k Gold',
                price: 2500,
                category: 'rings',
                image: 'https://earthartgems.com/images/sapphire-ring.jpg',
                inStock: true,
                gbuvPrice: 850000 // GBUV equivalent
            },
            {
                id: 'austin_002', 
                name: 'Emerald Pendant',
                description: '1.8ct Colombian Emerald Pendant',
                price: 1800,
                category: 'pendants',
                image: 'https://earthartgems.com/images/emerald-pendant.jpg',
                inStock: true,
                gbuvPrice: 610000
            },
            {
                id: 'austin_003',
                name: 'Custom Faceting Service',
                description: 'Professional gemstone cutting by Austin',
                price: 150,
                category: 'services',
                image: 'https://earthartgems.com/images/faceting-service.jpg',
                inStock: true,
                gbuvPrice: 51000
            }
        ];
    }

    renderAustinHub() {
        return `
            <div class="austin-hub-container">
                <div class="austin-header">
                    <h2>🌍 Austin's Earth Art Gems - Live Inventory</h2>
                    <p>Real gemstones and jewelry from Austin's live shop - Pay with GBUV or USD</p>
                    <a href="https://earthartgems.com" target="_blank" class="btn-visit-austin">
                        🛒 Visit Full Website
                    </a>
                </div>

                <!-- Live Inventory -->
                <div class="austin-inventory">
                    <div class="inventory-filters">
                        <button class="filter-btn active" onclick="marketplaceV2.filterAustinItems('all')">All Items</button>
                        <button class="filter-btn" onclick="marketplaceV2.filterAustinItems('rings')">Rings</button>
                        <button class="filter-btn" onclick="marketplaceV2.filterAustinItems('pendants')">Pendants</button>
                        <button class="filter-btn" onclick="marketplaceV2.filterAustinItems('services')">Services</button>
                    </div>

                    <div class="austin-items-grid">
                        ${this.austinListings.map(item => this.renderAustinItem(item)).join('')}
                    </div>
                </div>

                <!-- GBUV to USD Converter -->
                <div class="gbuv-converter">
                    <h3>💰 GBUV ↔ USD Converter</h3>
                    <div class="converter-row">
                        <input type="number" id="gbuvAmount" placeholder="GBUV Amount" onchange="marketplaceV2.convertGBUVToUSD()">
                        <span class="converter-arrow">⇔</span>
                        <input type="number" id="usdAmount" placeholder="USD Amount" onchange="marketplaceV2.convertUSDToGBUV()">
                    </div>
                    <div class="converter-rate">1 GBUV = $0.00295 USD (Live Rate)</div>
                </div>
            </div>
        `;
    }

    renderAustinItem(item) {
        return `
            <div class="austin-item-card" data-category="${item.category}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><rect width=\"200\" height=\"200\" fill=\"%23333\"/><text x=\"50%\" y=\"50%\" fill=\"white\" text-anchor=\"middle\">💎</text></svg>'">
                    ${item.inStock ? '<span class="stock-badge in-stock">✅ In Stock</span>' : '<span class="stock-badge out-stock">❌ Out of Stock</span>'}
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div class="item-prices">
                        <span class="usd-price">$${item.price} USD</span>
                        <span class="gbuv-price">${item.gbuvPrice.toLocaleString()} GBUV</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-buy-usd" onclick="marketplaceV2.buyWithUSD('${item.id}')">
                            💳 Buy with USD
                        </button>
                        <button class="btn-buy-gbuv" onclick="marketplaceV2.buyWithGBUV('${item.id}')">
                            💎 Buy with GBUV
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ===================================
    // ✨ ADVANCED TIER CUTS SHOP
    // ===================================

    async loadAdvancedCuts() {
        this.advancedCuts = [
            {
                id: 'adv_001',
                name: 'Quantum Flux Cut',
                tier: 'Legendary',
                description: 'Revolutionary cutting pattern that maximizes brilliance',
                price: 500000, // GBUV
                unlockLevel: 50,
                designer: 'Nick Alexander',
                award: 'AGTA Spectrum Winner',
                preview: 'quantum-flux.glb'
            },
            {
                id: 'adv_002',
                name: 'Dragon Scale Pattern',
                tier: 'Epic',
                description: 'Complex multi-facet design resembling dragon scales',
                price: 250000,
                unlockLevel: 35,
                designer: 'Community Master',
                award: 'User Favorite',
                preview: 'dragon-scale.glb'
            },
            {
                id: 'adv_003',
                name: 'Stellar Burst',
                tier: 'Rare',
                description: 'Star-like pattern with exceptional light return',
                price: 100000,
                unlockLevel: 20,
                designer: 'AI Generated',
                award: 'Innovation Award',
                preview: 'stellar-burst.glb'
            }
        ];
    }

    renderAdvancedCutsShop() {
        const userLevel = merlin?.userProfile?.gemForge?.level || 1;
        
        return `
            <div class="advanced-cuts-container">
                <div class="cuts-header">
                    <h2>✨ Advanced Tier Cuts Shop</h2>
                    <p>Premium cutting patterns designed by award-winning gem cutters</p>
                    <div class="user-level">Your Level: ${userLevel}</div>
                </div>

                <!-- Tier Legend -->
                <div class="tier-legend">
                    <div class="tier-badge legendary">Legendary</div>
                    <div class="tier-badge epic">Epic</div>
                    <div class="tier-badge rare">Rare</div>
                    <div class="tier-badge uncommon">Uncommon</div>
                </div>

                <!-- Advanced Cuts Grid -->
                <div class="advanced-cuts-grid">
                    ${this.advancedCuts.map(cut => this.renderAdvancedCut(cut, userLevel)).join('')}
                </div>

                <!-- Design Submission -->
                <div class="design-submission">
                    <h3>🎨 Submit Your Design</h3>
                    <p>Create and sell your own cutting patterns to the community</p>
                    <button class="btn-submit-design" onclick="marketplaceV2.openDesignSubmission()">
                        📤 Submit Design
                    </button>
                </div>
            </div>
        `;
    }

    renderAdvancedCut(cut, userLevel) {
        const isUnlocked = userLevel >= cut.unlockLevel;
        const canAfford = this.getUserGBUV() >= cut.price;
        
        return `
            <div class="advanced-cut-card ${cut.tier.toLowerCase()} ${!isUnlocked ? 'locked' : ''}">
                <div class="cut-preview">
                    ${isUnlocked ? 
                        `<model-viewer src="${cut.preview}" auto-rotate camera-controls></model-viewer>` :
                        `<div class="locked-preview">🔒<br>Level ${cut.unlockLevel}</div>`
                    }
                </div>
                <div class="cut-details">
                    <div class="cut-tier">${cut.tier}</div>
                    <h4>${cut.name}</h4>
                    <p>${cut.description}</p>
                    <div class="cut-meta">
                        <span class="designer">👨‍🎨 ${cut.designer}</span>
                        <span class="award">🏆 ${cut.award}</span>
                    </div>
                    <div class="cut-price">${cut.price.toLocaleString()} GBUV</div>
                    
                    ${isUnlocked ? 
                        `<button class="btn-buy-cut ${!canAfford ? 'disabled' : ''}" 
                                onclick="marketplaceV2.buyAdvancedCut('${cut.id}')"
                                ${!canAfford ? 'disabled' : ''}>
                            ${canAfford ? '💎 Purchase' : '💰 Insufficient GBUV'}
                        </button>` :
                        `<button class="btn-locked" disabled>
                            🔒 Reach Level ${cut.unlockLevel}
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    // ===================================
    // 🏪 USER CUSTOM SHOPS
    // ===================================

    renderUserShops() {
        return `
            <div class="user-shops-container">
                <div class="shops-header">
                    <h2>🏪 User Custom Shops</h2>
                    <p>Community-created shops with auto inventory-to-NFT integration</p>
                    <button class="btn-create-shop" onclick="marketplaceV2.openShopCreation()">
                        ➕ Create Your Shop
                    </button>
                </div>

                <!-- Shop Requirements -->
                <div class="shop-requirements">
                    <h3>📋 Shop Requirements</h3>
                    <ul>
                        <li>✅ Donate any amount to BarbrickDesign@gmail.com via PayPal</li>
                        <li>✅ Provide shop name and description</li>
                        <li>✅ Upload banner image (optional)</li>
                        <li>✅ Set commission rate (5-15%)</li>
                    </ul>
                    <p class="requirement-note">💡 Shops must be approved before going live</p>
                </div>

                <!-- User Shops Grid -->
                <div class="user-shops-grid">
                    ${this.userShops.filter(shop => shop.approved).map(shop => this.renderUserShop(shop)).join('')}
                </div>

                <!-- Pending Shops -->
                <div class="pending-shops">
                    <h3>⏳ Pending Approval</h3>
                    <div class="pending-shops-grid">
                        ${this.userShops.filter(shop => !shop.approved).map(shop => this.renderPendingShop(shop)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderUserShop(shop) {
        return `
            <div class="user-shop-card">
                <div class="shop-banner">
                    <img src="${shop.banner || '/images/default-shop-banner.jpg'}" alt="${shop.name}">
                    <div class="shop-status approved">✅ Approved</div>
                </div>
                <div class="shop-details">
                    <h4>${shop.name}</h4>
                    <p>${shop.description}</p>
                    <div class="shop-stats">
                        <span class="stat">📦 ${shop.items?.length || 0} Items</span>
                        <span class="stat">⭐ ${shop.rating || 'New'}</span>
                        <span class="stat">💰 ${shop.commission}% Fee</span>
                    </div>
                    <div class="shop-actions">
                        <button class="btn-visit-shop" onclick="marketplaceV2.visitUserShop('${shop.id}')">
                            🛒 Visit Shop
                        </button>
                        ${shop.owner === this.getCurrentUser() ? 
                            `<button class="btn-manage-shop" onclick="marketplaceV2.manageShop('${shop.id}')">
                                ⚙️ Manage
                            </button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }

    async createUserShop(shopData, paypalDonationProof) {
        // Validate PayPal donation
        if (!paypalDonationProof || !paypalDonationProof.transactionId) {
            this.showNotification('PayPal donation proof required', 'error');
            return false;
        }

        const newShop = {
            id: `shop_${Date.now()}`,
            ...shopData,
            owner: this.getCurrentUser(),
            createdAt: new Date().toISOString(),
            approved: false,
            paypalDonation: paypalDonationProof,
            items: [],
            stats: {
                views: 0,
                sales: 0,
                revenue: 0
            }
        };

        this.userShops.push(newShop);
        localStorage.setItem('gembot_user_shops', JSON.stringify(this.userShops));

        // Notify for approval
        this.notifyForApproval(newShop);
        this.showNotification('Shop submitted for approval!', 'success');
        
        return true;
    }

    // ===================================
    // 🔥 GBUV TOKEN BURNING SYSTEM
    // ===================================

    async burnGBUV(amount) {
        const userBalance = this.getUserGBUV();
        
        if (userBalance < amount) {
            return false;
        }

        // Simulate burning transaction
        const burnTx = {
            id: `burn_${Date.now()}`,
            amount: amount,
            timestamp: new Date().toISOString(),
            reason: 'Marketplace transaction',
            txHash: this.generateMockTxHash()
        };

        // Update burned tokens counter
        this.burnedTokens += amount;
        localStorage.setItem('gembot_burned_tokens', this.burnedTokens.toString());

        // Update user balance
        const newBalance = userBalance - amount;
        this.setUserGBUV(newBalance);

        // Log burn event
        console.log(`🔥 Burned ${amount} GBUV - TX: ${burnTx.txHash}`);
        
        // Notify systems
        this.notifyMerlinAI('gbuv_burned', burnTx);
        
        return true;
    }

    getBurnStats() {
        return {
            totalBurned: this.burnedTokens,
            lastBurnDate: localStorage.getItem('last_burn_date'),
            burnTransactions: JSON.parse(localStorage.getItem('burn_transactions') || '[]').length,
            deflationary: this.burnedTokens > 0 ? (this.burnedTokens / 1000000) * 100 : 0 // % of supply
        };
    }

    renderBurnStats() {
        const stats = this.getBurnStats();
        
        return `
            <div class="burn-stats-widget">
                <h3>🔥 GBUV Burn Statistics</h3>
                <div class="burn-stats-grid">
                    <div class="burn-stat">
                        <span class="burn-stat-value">${stats.totalBurned.toFixed(2)}</span>
                        <span class="burn-stat-label">Total Burned</span>
                    </div>
                    <div class="burn-stat">
                        <span class="burn-stat-value">${stats.burnTransactions}</span>
                        <span class="burn-stat-label">Burn TXs</span>
                    </div>
                    <div class="burn-stat">
                        <span class="burn-stat-value">${stats.deflationary.toFixed(4)}%</span>
                        <span class="burn-stat-label">Supply Burned</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ===================================
    // 🤖 MERLIN AI INTEGRATION
    // ===================================

    initMerlinIntegration() {
        // Register marketplace events with Merlin AI
        if (window.merlin) {
            merlin.marketplace = this;
            merlin.registerEventHandler('marketplace_event', this.handleMerlinEvent.bind(this));
        }
    }

    notifyMerlinAI(eventType, data) {
        if (window.merlin && merlin.aiCore) {
            const event = {
                type: eventType,
                data: data,
                timestamp: new Date().toISOString(),
                source: 'marketplace_v2'
            };
            
            merlin.aiCore.processEvent(event);
            
            // Generate contextual video content
            if (window.sora3Pipeline) {
                this.generateMarketplaceTutorial(eventType, data);
            }
        }
    }

    // ===================================
    // 📋 MARKETPLACE UI ORCHESTRATION
    // ===================================

    renderEnhancedMarketplace() {
        return `
            <div class="marketplace-v2-container">
                <!-- Navigation Tabs -->
                <div class="marketplace-v2-tabs">
                    <button class="tab-btn active" onclick="marketplaceV2.showTab('gemForge')">🔨 Gem Forge</button>
                    <button class="tab-btn" onclick="marketplaceV2.showTab('austinHub')">🌍 Austin's Hub</button>
                    <button class="tab-btn" onclick="marketplaceV2.showTab('advancedCuts')">✨ Advanced Cuts</button>
                    <button class="tab-btn" onclick="marketplaceV2.showTab('userShops')">🏪 User Shops</button>
                    <button class="tab-btn" onclick="marketplaceV2.showTab('trading')">💱 Trading</button>
                </div>

                <!-- Stats Bar -->
                <div class="marketplace-v2-stats">
                    <div class="stat-item">
                        <span class="stat-icon">💎</span>
                        <span class="stat-value">${this.getUserGBUV().toLocaleString()}</span>
                        <span class="stat-label">Your GBUV</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🔥</span>
                        <span class="stat-value">${this.burnedTokens.toFixed(0)}</span>
                        <span class="stat-label">GBUV Burned</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🎨</span>
                        <span class="stat-value">${this.nftForgedAssets.length}</span>
                        <span class="stat-label">NFTs Forged</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🏪</span>
                        <span class="stat-value">${this.userShops.filter(s => s.approved).length}</span>
                        <span class="stat-label">Active Shops</span>
                    </div>
                </div>

                <!-- Content Area -->
                <div class="marketplace-v2-content" id="marketplaceV2Content">
                    ${this.renderGemForge()} <!-- Default to Gem Forge -->
                </div>
            </div>
        `;
    }

    showTab(tabName) {
        const content = document.getElementById('marketplaceV2Content');
        const tabs = document.querySelectorAll('.marketplace-v2-tabs .tab-btn');
        
        // Update active tab
        tabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        
        // Render content
        switch(tabName) {
            case 'gemForge':
                content.innerHTML = this.renderGemForge();
                break;
            case 'austinHub':
                content.innerHTML = this.renderAustinHub();
                break;
            case 'advancedCuts':
                content.innerHTML = this.renderAdvancedCutsShop();
                break;
            case 'userShops':
                content.innerHTML = this.renderUserShops();
                break;
            case 'trading':
                content.innerHTML = this.renderTradingHub();
                break;
        }

        // Notify Merlin AI
        this.notifyMerlinAI('tab_switched', { tab: tabName });
    }

    // ===================================
    // 🎬 VIDEO TUTORIAL INTEGRATION
    // ===================================

    async generateMarketplaceTutorial(eventType, data) {
        if (!window.sora3Pipeline) return;

        const tutorialConfig = {
            type: 'marketplace_tutorial',
            event: eventType,
            data: data,
            scenes: this.getSceneConfigForEvent(eventType),
            voiceover: this.getVoiceoverForEvent(eventType),
            character: 'merlin'
        };

        try {
            const videoUrl = await sora3Pipeline.generateVideo(tutorialConfig);
            this.showTutorialVideo(videoUrl, eventType);
        } catch (error) {
            console.error('Tutorial generation failed:', error);
        }
    }

    getSceneConfigForEvent(eventType) {
        const sceneConfigs = {
            'nft_forged': [
                { scene: 'forge_process', duration: 5, text: 'Congratulations on forging your first NFT!' },
                { scene: 'blockchain_mint', duration: 3, text: 'Your asset is now on the Solana blockchain' },
                { scene: 'nft_showcase', duration: 4, text: 'You can now trade this NFT with other users' }
            ],
            'shop_created': [
                { scene: 'shop_setup', duration: 6, text: 'Your shop is being prepared for approval' },
                { scene: 'paypal_verification', duration: 4, text: 'PayPal donation verified successfully' },
                { scene: 'inventory_system', duration: 5, text: 'Auto inventory-to-NFT system activated' }
            ],
            'advanced_cut_purchased': [
                { scene: 'cut_preview', duration: 7, text: 'This advanced cutting pattern will enhance your gems' },
                { scene: 'technique_demo', duration: 8, text: 'Watch how this cut maximizes brilliance' },
                { scene: 'value_increase', duration: 3, text: 'Your gem value has increased significantly!' }
            ]
        };

        return sceneConfigs[eventType] || [];
    }

    // ===================================
    // 🔧 UTILITY METHODS
    // ===================================

    getUserAssets() {
        // Mock user assets - in real app, fetch from user profile
        return [
            { id: 'asset_1', name: 'Perfect Sapphire', type: 'gemstone', rarity: 'epic' },
            { id: 'asset_2', name: 'Gold Ring Base', type: 'metal', rarity: 'common' },
            { id: 'asset_3', name: 'Emerald Cut Design', type: 'design', rarity: 'rare' }
        ];
    }

    getUserGBUV() {
        return parseFloat(localStorage.getItem('user_gbuv_balance') || '1000000');
    }

    setUserGBUV(amount) {
        localStorage.setItem('user_gbuv_balance', amount.toString());
    }

    calculateForgeCost(rarity = 'common') {
        const baseCosts = {
            common: 1000,
            rare: 2000,
            epic: 5000,
            legendary: 10000
        };
        return baseCosts[rarity] || baseCosts.common;
    }

    generateMockTokenAddress() {
        return 'NFT' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    generateMockTxHash() {
        return Math.random().toString(36).substr(2, 15).toUpperCase();
    }

    getCurrentUser() {
        return window.authSystem?.currentUser?.email || 'anonymous';
    }

    showNotification(message, type = 'info') {
        // Use existing notification system or create popup
        if (window.addMessage) {
            addMessage(message, type);
        } else {
            alert(message);
        }
    }

    renderAssetCard(asset) {
        return `
            <div class="asset-card" data-asset-id="${asset.id}" onclick="this.classList.toggle('selected')">
                <div class="asset-icon">💎</div>
                <div class="asset-name">${asset.name}</div>
                <div class="asset-type">${asset.type}</div>
                <div class="asset-rarity ${asset.rarity}">${asset.rarity}</div>
            </div>
        `;
    }

    renderNFTCard(nft) {
        return `
            <div class="nft-card">
                <div class="nft-image">
                    <img src="${nft.image}" alt="${nft.name}">
                </div>
                <div class="nft-details">
                    <h4>${nft.name}</h4>
                    <p>${nft.description}</p>
                    <div class="nft-rarity ${nft.rarity}">${nft.rarity}</div>
                    <div class="nft-token">${nft.tokenAddress}</div>
                </div>
            </div>
        `;
    }
}

// Initialize the enhanced marketplace
window.marketplaceV2 = new GemBotMarketplaceV2();

// Export for use in main marketplace renderer
window.GemBotMarketplaceV2 = GemBotMarketplaceV2;

console.log('🔥 GemBot Marketplace V2.0 Loaded!');