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
 * File: project-investment-all-in-one.js
 * Declaration ID: IP-3E8222F9-MLL28ZVM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

<script>
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMBOT PROJECT INVESTMENT SYSTEM - HEAD INJECTION SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 * Complete play-to-earn investment system with UI, blockchain, and gamification
 * 
 * USAGE: Copy this ENTIRE FILE and paste into your HTML <head> section
 * Automatically waits for Solana Web3, walletFactory, and gemBotGame to load
 * 
 * Dependencies (must load BEFORE this script):
 * - Solana Web3.js (solanaWeb3)
 * - automated-wallet-system.js (window.walletFactory)
 * - gembot-farm-game.js (window.gemBotGame)
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';
  
  console.log('🔷 GemBot Investment System loading...');

  // Wait for dependencies
  function waitForDependencies(callback) {
    const check = () => {
      if (typeof solanaWeb3 !== 'undefined' && 
          window.walletFactory && 
          window.gemBotGame) {
        callback();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE INVESTMENT SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  
  class ProjectInvestmentSystem {
    constructor() {
      this.GOVERNANCE_TOKEN_MINT = 'DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump';
      this.PROJECT_VAULT = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk';
      
      this.INVESTMENT_TIERS = {
        bronze: { min: 100, xpBonus: 50, badge: 'bronze_investor', votePower: 1 },
        silver: { min: 500, xpBonus: 300, badge: 'silver_investor', votePower: 3 },
        gold: { min: 1000, xpBonus: 750, badge: 'gold_investor', votePower: 5 },
        platinum: { min: 5000, xpBonus: 5000, badge: 'platinum_investor', votePower: 10 },
        diamond: { min: 10000, xpBonus: 15000, badge: 'diamond_investor', votePower: 20 }
      };
      
      this.ROI_PERCENTAGE = 0.05;
      this.LAST_DISTRIBUTION = Date.now();
      this.DISTRIBUTION_INTERVAL = 90 * 24 * 60 * 60 * 1000;
    }
    
    getPortfolio(username) {
      const investments = JSON.parse(localStorage.getItem(`investments_${username}`) || '{}');
      let total = 0, projectCount = 0, votingPower = 0;
      
      for (const [project, data] of Object.entries(investments)) {
        total += data.invested || 0;
        projectCount++;
        votingPower += this.calculateVotePower(data.invested);
      }
      
      return {
        totalInvested: total,
        projectCount,
        votingPower,
        tier: this.getTier(total),
        investments
      };
    }
    
    calculateVotePower(amount) {
      for (const [tier, data] of Object.entries(this.INVESTMENT_TIERS).reverse()) {
        if (amount >= data.min) return data.votePower;
      }
      return 0;
    }
    
    getTier(totalInvested) {
      for (const [tier, data] of Object.entries(this.INVESTMENT_TIERS).reverse()) {
        if (totalInvested >= data.min) return tier;
      }
      return 'none';
    }
    
    async investInProject(projectPath, amount, username) {
      try {
        if (amount <= 0) throw new Error('Investment amount must be positive');
        
        const userWallet = await window.walletFactory.getUserWallet(username);
        if (!userWallet) throw new Error('No wallet found for user');
        
        const balance = await window.walletFactory.getGBUVBalance(userWallet.publicKey);
        if (balance < amount) throw new Error(`Insufficient GBUV. Have: ${balance}, Need: ${amount}`);
        
        const txSignature = await window.walletFactory.transferGBUV(
          userWallet.publicKey, this.PROJECT_VAULT, amount
        );
        
        const investments = JSON.parse(localStorage.getItem(`investments_${username}`) || '{}');
        if (!investments[projectPath]) {
          investments[projectPath] = {
            invested: 0, transactions: [], firstInvestment: Date.now(), dividendsEarned: 0
          };
        }
        
        investments[projectPath].invested += amount;
        investments[projectPath].transactions.push({
          amount, timestamp: Date.now(), txSignature, type: 'investment'
        });
        
        localStorage.setItem(`investments_${username}`, JSON.stringify(investments));
        
        const rewards = await this.processInvestmentRewards(username, amount, projectPath);
        
        if (window.liveActivityFeed) {
          window.liveActivityFeed.addActivity({
            type: 'investment',
            message: `Invested ${amount} GBUV in ${projectPath}`,
            timestamp: Date.now(),
            data: { amount, projectPath, txSignature, rewards }
          });
        }
        
        return {
          success: true, txSignature, newBalance: balance - amount, 
          rewards, portfolio: this.getPortfolio(username)
        };
        
      } catch (error) {
        console.error('❌ Investment failed:', error);
        if (window.liveActivityFeed) {
          window.liveActivityFeed.addActivity({
            type: 'error', message: `Investment failed: ${error.message}`, timestamp: Date.now()
          });
        }
        throw error;
      }
    }
    
    async processInvestmentRewards(username, amount, projectPath) {
      const rewards = { xp: 0, badges: [], achievements: [], bonusGems: 0 };
      const portfolio = this.getPortfolio(username);
      const tier = portfolio.tier;
      
      if (tier !== 'none') {
        const tierData = this.INVESTMENT_TIERS[tier];
        rewards.xp = tierData.xpBonus;
        rewards.badges.push(tierData.badge);
      }
      
      rewards.xp += Math.floor(amount / 10);
      if (amount >= 1000) rewards.bonusGems = Math.floor(amount / 100);
      
      if (window.gemBotGame) {
        window.gemBotGame.state.player.xp += rewards.xp;
        window.gemBotGame.state.player.gems += rewards.bonusGems;
        window.gemBotGame.checkLevelUp();
        window.gemBotGame.saveGame();
      }
      
      if (portfolio.projectCount >= 5) rewards.achievements.push('diversified_investor');
      if (portfolio.totalInvested >= 10000) rewards.achievements.push('whale_investor');
      if (amount >= 5000) rewards.achievements.push('big_spender');
      
      const userBadges = JSON.parse(localStorage.getItem(`badges_${username}`) || '[]');
      for (const badge of rewards.badges) {
        if (!userBadges.includes(badge)) userBadges.push(badge);
      }
      localStorage.setItem(`badges_${username}`, JSON.stringify(userBadges));
      
      return rewards;
    }
    
    getProjectStatus(projectPath) {
      const allInvestments = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('investments_')) {
          const username = key.replace('investments_', '');
          const userInvestments = JSON.parse(localStorage.getItem(key) || '{}');
          if (userInvestments[projectPath]) allInvestments[username] = userInvestments[projectPath];
        }
      }
      
      let totalInvested = 0, investorCount = 0;
      for (const data of Object.values(allInvestments)) {
        totalInvested += data.invested || 0;
        investorCount++;
      }
      
      return { totalInvested, investorCount, investors: allInvestments };
    }
    
    getLeaderboard(limit = 10) {
      const leaderboard = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('investments_')) {
          const username = key.replace('investments_', '');
          const portfolio = this.getPortfolio(username);
          leaderboard.push({
            username, totalInvested: portfolio.totalInvested,
            projectCount: portfolio.projectCount, tier: portfolio.tier,
            votingPower: portfolio.votingPower
          });
        }
      }
      leaderboard.sort((a, b) => b.totalInvested - a.totalInvested);
      return leaderboard.slice(0, limit);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACHIEVEMENT SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  
  class InvestorAchievementSystem {
    constructor() {
      this.ACHIEVEMENTS = {
        first_investment: { name: 'First Step', description: 'Made your first investment', icon: '🌱', reward: { xp: 50, gems: 10 } },
        invest_100: { name: 'Century Club', description: 'Invested 100 GBUV', icon: '💯', reward: { xp: 100, gems: 20 } },
        invest_1000: { name: 'Diamond Hands', description: 'Invested 1,000 GBUV', icon: '💎', reward: { xp: 500, gems: 100, badge: 'diamond_hands' } },
        invest_10000: { name: 'Whale Alert', description: 'Invested 10,000 GBUV', icon: '🐋', reward: { xp: 2500, gems: 500, badge: 'whale', title: 'The Whale' } },
        diversified_5: { name: 'Diversified Portfolio', description: '5 different projects', icon: '📊', reward: { xp: 250, gems: 50 } },
        diversified_10: { name: 'Portfolio Master', description: '10 different projects', icon: '📈', reward: { xp: 750, gems: 150, badge: 'portfolio_master' } },
        early_bird: { name: 'Early Bird', description: 'First investor in a project', icon: '🐦', reward: { xp: 500, gems: 100, badge: 'early_bird' } },
        bronze_tier: { name: 'Bronze Investor', description: 'Bronze tier (100+ GBUV)', icon: '🥉', reward: { xp: 100, badge: 'bronze_investor' } },
        silver_tier: { name: 'Silver Investor', description: 'Silver tier (500+ GBUV)', icon: '🥈', reward: { xp: 300, badge: 'silver_investor' } },
        gold_tier: { name: 'Gold Investor', description: 'Gold tier (1,000+ GBUV)', icon: '🥇', reward: { xp: 750, badge: 'gold_investor' } },
        platinum_tier: { name: 'Platinum Investor', description: 'Platinum tier (5,000+ GBUV)', icon: '⭐', reward: { xp: 5000, badge: 'platinum_investor', title: 'Platinum Investor' } },
        diamond_tier: { name: 'Diamond Investor', description: 'Diamond tier (10,000+ GBUV)', icon: '💎', reward: { xp: 15000, gems: 1000, badge: 'diamond_investor', title: 'Diamond Investor' } },
        leaderboard_rank1: { name: 'Investment King', description: '#1 on leaderboard', icon: '👑', reward: { xp: 10000, gems: 2000, badge: 'investment_king', title: 'Investment King' } }
      };
    }
    
    async checkAchievements(username, action, data = {}) {
      const unlocked = [];
      const userAchievements = this.getUserAchievements(username);
      
      if (action === 'investment' && !userAchievements.includes('first_investment')) {
        const portfolio = window.projectInvestmentSystem.getPortfolio(username);
        const totalTransactions = Object.values(portfolio.investments).reduce((sum, inv) => 
          sum + (inv.transactions ? inv.transactions.length : 0), 0);
        if (totalTransactions === 1) unlocked.push('first_investment');
      }
      
      if (action === 'investment' && data.amount) {
        if (data.amount >= 100 && !userAchievements.includes('invest_100')) unlocked.push('invest_100');
        if (data.amount >= 1000 && !userAchievements.includes('invest_1000')) unlocked.push('invest_1000');
        if (data.amount >= 10000 && !userAchievements.includes('invest_10000')) unlocked.push('invest_10000');
      }
      
      if (action === 'investment') {
        const portfolio = window.projectInvestmentSystem.getPortfolio(username);
        if (portfolio.projectCount >= 5 && !userAchievements.includes('diversified_5')) unlocked.push('diversified_5');
        if (portfolio.projectCount >= 10 && !userAchievements.includes('diversified_10')) unlocked.push('diversified_10');
        
        const tierAchievements = { bronze: 'bronze_tier', silver: 'silver_tier', gold: 'gold_tier', platinum: 'platinum_tier', diamond: 'diamond_tier' };
        const tierAchievement = tierAchievements[portfolio.tier];
        if (tierAchievement && !userAchievements.includes(tierAchievement)) unlocked.push(tierAchievement);
      }
      
      if (action === 'investment' && data.projectPath) {
        const status = window.projectInvestmentSystem.getProjectStatus(data.projectPath);
        if (status.investorCount === 1 && !userAchievements.includes('early_bird')) unlocked.push('early_bird');
      }
      
      const rewards = { xp: 0, gems: 0, badges: [], titles: [] };
      for (const achievementId of unlocked) {
        const achievement = this.ACHIEVEMENTS[achievementId];
        if (!achievement) continue;
        
        userAchievements.push(achievementId);
        if (achievement.reward.xp) rewards.xp += achievement.reward.xp;
        if (achievement.reward.gems) rewards.gems += achievement.reward.gems;
        if (achievement.reward.badge) rewards.badges.push(achievement.reward.badge);
        if (achievement.reward.title) rewards.titles.push(achievement.reward.title);
        
        this.showAchievementNotification(achievement);
        
        if (window.liveActivityFeed) {
          window.liveActivityFeed.addActivity({
            type: 'achievement', message: `🏆 Achievement: ${achievement.name}`,
            timestamp: Date.now(), data: { achievement: achievementId, reward: achievement.reward }
          });
        }
      }
      
      localStorage.setItem(`achievements_${username}`, JSON.stringify(userAchievements));
      
      if (rewards.xp > 0 || rewards.gems > 0) {
        if (window.gemBotGame) {
          window.gemBotGame.state.player.xp += rewards.xp;
          window.gemBotGame.state.player.gems += rewards.gems;
          window.gemBotGame.checkLevelUp();
          window.gemBotGame.saveGame();
        }
      }
      
      return { unlocked, rewards };
    }
    
    getUserAchievements(username) {
      return JSON.parse(localStorage.getItem(`achievements_${username}`) || '[]');
    }
    
    showAchievementNotification(achievement) {
      const notification = document.createElement('div');
      notification.style.cssText = `position:fixed;top:80px;right:20px;z-index:99999;background:linear-gradient(135deg,#7b2cbf,#5a189a);border:2px solid #c77dff;border-radius:16px;padding:20px;box-shadow:0 12px 48px rgba(123,44,191,0.6);color:#fff;font-weight:800;min-width:320px;animation:slideInRight 0.4s ease;`;
      notification.innerHTML = `<div style="font-size:48px;text-align:center;margin-bottom:10px;">${achievement.icon}</div><div style="text-align:center;font-size:18px;margin-bottom:6px;text-shadow:0 0 20px #fff;">Achievement Unlocked!</div><div style="text-align:center;font-size:16px;color:#e0aaff;margin-bottom:8px;">${achievement.name}</div><div style="text-align:center;font-size:13px;color:#c77dff;margin-bottom:12px;">${achievement.description}</div><div style="text-align:center;font-size:14px;padding:8px;background:rgba(0,0,0,0.3);border-radius:8px;">${achievement.reward.xp ? `+${achievement.reward.xp} XP ` : ''}${achievement.reward.gems ? `+${achievement.reward.gems} Gems` : ''}</div>`;
      document.body.appendChild(notification);
      setTimeout(() => { notification.style.animation = 'slideOutRight 0.4s ease'; setTimeout(() => notification.remove(), 400); }, 5000);
    }
    
    getProgress(username) {
      const achievements = this.getUserAchievements(username);
      const total = Object.keys(this.ACHIEVEMENTS).length;
      const unlocked = achievements.length;
      return { unlocked, total, percentage: (unlocked / total) * 100 };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UI GALLERY SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  
  function createGalleryUI() {
    const OWNER = 'barbrickdesign', REPO = 'barbrickdesign.github.io';
    const API_TREE = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/HEAD?recursive=1`;
    const LIVE_BASE = `https://${OWNER}.github.io`;
    
    // CSS Injection
    const css = `@keyframes slideInRight{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(400px);opacity:0}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}.merlin-gallery-toggle{position:fixed;bottom:100px;right:20px;z-index:997;pointer-events:auto;background:linear-gradient(135deg,#7b2cbf,#5a189a);border:2px solid #c77dff;color:#fff;padding:14px 20px;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;letter-spacing:0.5px;box-shadow:0 8px 32px rgba(123,44,191,0.4),0 0 20px rgba(199,125,255,0.3);transition:all 0.3s ease;animation:pulse 2s ease-in-out infinite}@media (max-width: 768px){.merlin-gallery-toggle{bottom:90px;right:15px;padding:12px 16px;font-size:13px}}.merlin-gallery-toggle:hover{transform:translateY(-3px) scale(1.05);box-shadow:0 12px 48px rgba(123,44,191,0.6),0 0 30px rgba(199,125,255,0.5)}.merlin-gallery-panel{position:fixed;top:50px;left:50%;transform:translateX(-50%) scale(0);width:min(1400px,96vw);height:min(90vh,900px);background:#0a0a0f;border:2px solid #c77dff;border-radius:20px;box-shadow:0 32px 90px rgba(0,0,0,0.8),0 0 40px rgba(199,125,255,0.2);display:none;z-index:10001;opacity:0;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1)}.merlin-gallery-panel.open{display:block;opacity:1;transform:translateX(-50%) scale(1)}.gallery-header{background:linear-gradient(135deg,#7b2cbf,#5a189a);padding:20px;border-radius:18px 18px 0 0;border-bottom:2px solid #c77dff;display:flex;justify-content:space-between;align-items:center}.gallery-title{font-size:24px;font-weight:900;color:#fff;text-shadow:0 0 20px rgba(199,125,255,0.6)}.gallery-subtitle{font-size:13px;color:#e0aaff;margin-top:4px}.gallery-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.gallery-btn{background:#240046;border:1px solid #7b2cbf;color:#fff;padding:10px 16px;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px;transition:all 0.2s ease}.gallery-btn:hover{background:#3c096c;border-color:#c77dff}.gallery-input{background:#10002b;border:1px solid #7b2cbf;color:#fff;padding:10px 14px;border-radius:8px;font-size:13px;min-width:200px}.gallery-input::placeholder{color:#9d4edd}.gallery-body{padding:20px;height:calc(100% - 220px);overflow-y:auto;background:radial-gradient(ellipse at center,#10002b 0%,#0a0a0f 100%)}.gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;padding:10px}.project-card{background:linear-gradient(135deg,#240046,#10002b);border:2px solid #7b2cbf;border-radius:16px;overflow:hidden;transition:all 0.3s ease;box-shadow:0 8px 24px rgba(0,0,0,0.5)}.project-card:hover{transform:translateY(-5px);border-color:#c77dff;box-shadow:0 16px 48px rgba(123,44,191,0.4)}.project-preview{width:100%;height:180px;background:#0a0a0f;position:relative;border-bottom:2px solid #7b2cbf;overflow:hidden}.project-preview iframe{width:1200px;height:800px;border:0;transform-origin:0 0;transform:scale(0.267);pointer-events:none}.project-info{padding:16px}.project-name{font-size:16px;font-weight:800;color:#fff;margin-bottom:6px;text-shadow:0 0 10px rgba(199,125,255,0.4)}.project-path{font-size:11px;color:#9d4edd;margin-bottom:12px;word-break:break-all}.project-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;font-size:12px}.stat-box{background:#10002b;border:1px solid #5a189a;border-radius:8px;padding:8px;text-align:center}.stat-label{color:#9d4edd;font-size:10px;text-transform:uppercase}.stat-value{color:#fff;font-weight:800;font-size:16px;margin-top:2px}.progress-bar{height:8px;background:#10002b;border:1px solid #5a189a;border-radius:999px;overflow:hidden;margin-bottom:12px}.progress-fill{height:100%;background:linear-gradient(90deg,#7b2cbf,#c77dff);transition:width 0.4s ease}.invest-row{display:flex;gap:8px}.invest-input{flex:1;background:#10002b;border:1px solid #7b2cbf;color:#fff;padding:10px;border-radius:8px;font-size:13px}.invest-btn{background:linear-gradient(135deg,#7b2cbf,#5a189a);border:none;color:#fff;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:800;transition:all 0.2s ease}.invest-btn:hover{transform:scale(1.05)}.invest-btn:disabled{opacity:0.5;cursor:not-allowed}.gallery-footer{background:#10002b;padding:16px;border-top:2px solid #7b2cbf;display:flex;justify-content:space-between;align-items:center;border-radius:0 0 18px 18px}.user-portfolio{display:flex;gap:20px;font-size:13px;color:#e0aaff}.portfolio-stat{display:flex;flex-direction:column}.portfolio-label{font-size:10px;color:#9d4edd;text-transform:uppercase}.portfolio-value{font-size:18px;font-weight:800;color:#fff}.investor-badge{padding:6px 14px;background:linear-gradient(135deg,#ffd60a,#ff9500);border-radius:999px;font-weight:800;font-size:11px;color:#000;text-transform:uppercase;letter-spacing:0.5px}.badge-bronze{background:linear-gradient(135deg,#cd7f32,#8b4513);color:#fff}.badge-silver{background:linear-gradient(135deg,#c0c0c0,#808080);color:#000}.badge-gold{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000}.badge-platinum{background:linear-gradient(135deg,#e5e4e2,#d4d4d4);color:#000}.badge-diamond{background:linear-gradient(135deg,#b9f2ff,#69c6ff);color:#000}`;
    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    
    // HTML Structure
    const container = document.createElement('div');
    container.innerHTML = `<button class="merlin-gallery-toggle" id="galleryToggle">💎 Project Gallery</button><div class="merlin-gallery-panel" id="galleryPanel"><div class="gallery-header"><div><div class="gallery-title">🚀 GemBot Project Investment Gallery</div><div class="gallery-subtitle">Invest GBUV • Earn XP • Get Badges • Vote on Governance</div></div><div class="gallery-controls"><input class="gallery-input" id="searchInput" placeholder="Search projects..."/><button class="gallery-btn" id="refreshBtn">🔄 Refresh</button><button class="gallery-btn" id="closeGallery">✕ Close</button></div></div><div class="gallery-body"><div class="gallery-grid" id="projectGrid"><p style="color:#9d4edd;text-align:center;padding:40px;">Loading projects...</p></div></div><div class="gallery-footer"><div class="user-portfolio"><div class="portfolio-stat"><span class="portfolio-label">Total Invested</span><span class="portfolio-value" id="totalInvested">0</span></div><div class="portfolio-stat"><span class="portfolio-label">Projects</span><span class="portfolio-value" id="projectCount">0</span></div><div class="portfolio-stat"><span class="portfolio-label">Voting Power</span><span class="portfolio-value" id="votingPower">0</span></div></div><div id="investorBadge"></div></div></div>`;
    document.body.appendChild(container);
    
    // UI Controller
    const ui = {
      toggle: container.querySelector('#galleryToggle'),
      panel: container.querySelector('#galleryPanel'),
      grid: container.querySelector('#projectGrid'),
      search: container.querySelector('#searchInput'),
      refresh: container.querySelector('#refreshBtn'),
      close: container.querySelector('#closeGallery'),
      totalInvested: container.querySelector('#totalInvested'),
      projectCount: container.querySelector('#projectCount'),
      votingPower: container.querySelector('#votingPower'),
      badge: container.querySelector('#investorBadge')
    };
    
    ui.toggle.addEventListener('click', () => ui.panel.classList.toggle('open'));
    ui.close.addEventListener('click', () => ui.panel.classList.remove('open'));
    
    let allProjects = [], filteredProjects = [];
    
    async function loadProjects() {
      try {
        ui.grid.innerHTML = '<p style="color:#9d4edd;text-align:center;padding:40px;">Fetching projects from GitHub...</p>';
        const tree = await fetch(API_TREE).then(r => r.json());
        const htmlFiles = tree.tree.filter(n => n.type==='blob' && n.path.toLowerCase().endsWith('.html'));
        
        allProjects = [];
        for (const file of htmlFiles) {
          if (file.path.startsWith('node_modules')) continue;
          const project = {
            path: file.path,
            name: file.path.split('/').pop().replace('.html', ''),
            liveUrl: `${LIVE_BASE}/${file.path}`
          };
          if (window.projectInvestmentSystem) {
            const status = window.projectInvestmentSystem.getProjectStatus(file.path);
            project.invested = status.totalInvested;
            project.investorCount = status.investorCount;
          }
          allProjects.push(project);
        }
        filteredProjects = allProjects.slice();
        renderProjects();
        updatePortfolio();
      } catch (error) {
        console.error('Failed to load projects:', error);
        ui.grid.innerHTML = '<p style="color:#ff6b6b;text-align:center;padding:40px;">Failed to load. Click Refresh to retry.</p>';
      }
    }
    
    function renderProjects() {
      if (!filteredProjects.length) {
        ui.grid.innerHTML = '<p style="color:#9d4edd;text-align:center;padding:40px;">No projects found.</p>';
        return;
      }
      ui.grid.innerHTML = filteredProjects.map(p => {
        const goal = 10000, pct = Math.min(100, (p.invested / goal) * 100), safeId = p.path.replace(/[^a-z0-9]/gi, '');
        return `<div class="project-card"><div class="project-preview"><iframe src="${p.liveUrl}" sandbox="allow-scripts allow-same-origin"></iframe></div><div class="project-info"><div class="project-name">${p.name}</div><div class="project-path">${p.path}</div><div class="project-stats"><div class="stat-box"><div class="stat-label">Goal</div><div class="stat-value">${goal.toLocaleString()}</div></div><div class="stat-box"><div class="stat-label">Funded</div><div class="stat-value">${p.invested.toLocaleString()}</div></div></div><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><div class="stat-box" style="margin-bottom:12px;"><div class="stat-label">Investors</div><div class="stat-value">${p.investorCount}</div></div><div class="invest-row"><input type="number" class="invest-input" id="amount-${safeId}" placeholder="GBUV amount" min="1" value="100"><button class="invest-btn" id="invest-${safeId}">💎 Invest</button></div></div></div>`;
      }).join('');
      filteredProjects.forEach(project => {
        const btn = ui.grid.querySelector(`#invest-${project.path.replace(/[^a-z0-9]/gi, '')}`);
        const input = ui.grid.querySelector(`#amount-${project.path.replace(/[^a-z0-9]/gi, '')}`);
        if (btn && input) btn.addEventListener('click', () => handleInvestment(project, input));
      });
    }
    
    async function handleInvestment(project, input) {
      const amount = parseInt(input.value) || 0;
      if (amount <= 0) { alert('Please enter a valid amount'); return; }
      const session = JSON.parse(sessionStorage.getItem('gembot_session') || '{}');
      if (!session.username) {
        alert('⚠️ Please log in to invest!');
        if (window.authSystem && window.authSystem.showAuth) window.authSystem.showAuth();
        return;
      }
      const btn = ui.grid.querySelector(`#invest-${project.path.replace(/[^a-z0-9]/gi, '')}`);
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Processing...'; }
      try {
        const result = await window.projectInvestmentSystem.investInProject(project.path, amount, session.username);
        if (btn) btn.textContent = `✅ +${result.rewards.xp} XP!`;
        let msg = `🎉 Investment successful!\\n\\nAmount: ${amount} GBUV\\nXP: +${result.rewards.xp}\\n`;
        if (result.rewards.bonusGems > 0) msg += `Gems: +${result.rewards.bonusGems}\\n`;
        if (result.rewards.badges.length) msg += `Badge: ${result.rewards.badges[0]}\\n`;
        msg += `\\nBalance: ${result.newBalance} GBUV\\nVoting Power: ${result.portfolio.votingPower}`;
        alert(msg);
        await loadProjects();
        setTimeout(() => { if (btn) { btn.disabled = false; btn.textContent = '💎 Invest'; } }, 2000);
      } catch (error) {
        console.error('Investment failed:', error);
        alert(`❌ Investment failed: ${error.message}`);
        if (btn) { btn.disabled = false; btn.textContent = '💎 Invest'; }
      }
    }
    
    function updatePortfolio() {
      const session = JSON.parse(sessionStorage.getItem('gembot_session') || '{}');
      if (!session.username || !window.projectInvestmentSystem) {
        ui.totalInvested.textContent = '0'; ui.projectCount.textContent = '0'; ui.votingPower.textContent = '0'; ui.badge.innerHTML = '';
        return;
      }
      const portfolio = window.projectInvestmentSystem.getPortfolio(session.username);
      ui.totalInvested.textContent = portfolio.totalInvested.toLocaleString();
      ui.projectCount.textContent = portfolio.projectCount;
      ui.votingPower.textContent = portfolio.votingPower;
      if (portfolio.tier !== 'none') {
        ui.badge.innerHTML = `<div class="investor-badge badge-${portfolio.tier}">${portfolio.tier.toUpperCase()} INVESTOR</div>`;
      } else ui.badge.innerHTML = '';
    }
    
    ui.search.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      filteredProjects = allProjects.filter(p => p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q));
      renderProjects();
    });
    ui.refresh.addEventListener('click', loadProjects);
    
    function init() {
      if (window.projectInvestmentSystem) { loadProjects(); console.log('💎 Gallery ready'); }
      else setTimeout(init, 1000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    
    window.merlinGallery = { open: () => ui.panel.classList.add('open'), close: () => ui.panel.classList.remove('open'), refresh: loadProjects, updatePortfolio };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  waitForDependencies(() => {
    // Initialize core systems
    window.projectInvestmentSystem = new ProjectInvestmentSystem();
    window.investorAchievements = new InvestorAchievementSystem();
    console.log('💎 Project Investment System initialized');
    
    // Hook achievement checking into investment
    const originalInvest = window.projectInvestmentSystem.investInProject.bind(window.projectInvestmentSystem);
    window.projectInvestmentSystem.investInProject = async function(projectPath, amount, username) {
      const result = await originalInvest(projectPath, amount, username);
      const achievementResult = await window.investorAchievements.checkAchievements(username, 'investment', { amount, projectPath });
      if (achievementResult.unlocked.length > 0) {
        result.rewards.xp += achievementResult.rewards.xp;
        result.rewards.gems += achievementResult.rewards.gems;
        result.rewards.badges = [...result.rewards.badges, ...achievementResult.rewards.badges];
        result.achievements = achievementResult.unlocked;
      }
      return result;
    };
    
    // Create UI
    createGalleryUI();
    console.log('🚀 Investment system ready - click "💎 Project Gallery" button to start!');
  });

})();
</script>
