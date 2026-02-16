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
 * File: investor-achievements.js
 * Declaration ID: IP-6978351E-MLL28ZV1
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INVESTOR ACHIEVEMENTS & REWARDS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * Gamifies investing with badges, titles, and special perks
 * ═══════════════════════════════════════════════════════════════════════════
 */

class InvestorAchievementSystem {
    constructor() {
        this.ACHIEVEMENTS = {
            first_investment: {
                name: 'First Step',
                description: 'Made your first investment',
                icon: '🌱',
                reward: { xp: 50, gems: 10 }
            },
            invest_100: {
                name: 'Century Club',
                description: 'Invested 100 GBUV in a single project',
                icon: '💯',
                reward: { xp: 100, gems: 20 }
            },
            invest_1000: {
                name: 'Diamond Hands',
                description: 'Invested 1,000 GBUV in a single project',
                icon: '💎',
                reward: { xp: 500, gems: 100, badge: 'diamond_hands' }
            },
            invest_10000: {
                name: 'Whale Alert',
                description: 'Invested 10,000 GBUV in a single project',
                icon: '🐋',
                reward: { xp: 2500, gems: 500, badge: 'whale', title: 'The Whale' }
            },
            diversified_5: {
                name: 'Diversified Portfolio',
                description: 'Invested in 5 different projects',
                icon: '📊',
                reward: { xp: 250, gems: 50 }
            },
            diversified_10: {
                name: 'Portfolio Master',
                description: 'Invested in 10 different projects',
                icon: '📈',
                reward: { xp: 750, gems: 150, badge: 'portfolio_master' }
            },
            early_bird: {
                name: 'Early Bird',
                description: 'First investor in a project',
                icon: '🐦',
                reward: { xp: 500, gems: 100, badge: 'early_bird' }
            },
            voted: {
                name: 'Democracy Participant',
                description: 'Voted on a governance proposal',
                icon: '🗳️',
                reward: { xp: 100, gems: 25 }
            },
            proposal_creator: {
                name: 'Visionary',
                description: 'Created a governance proposal',
                icon: '💡',
                reward: { xp: 500, gems: 100, badge: 'visionary' }
            },
            roi_earned: {
                name: 'Dividend Collector',
                description: 'Earned your first ROI payout',
                icon: '💰',
                reward: { xp: 200, gems: 40 }
            },
            bronze_tier: {
                name: 'Bronze Investor',
                description: 'Reached Bronze tier (100+ GBUV)',
                icon: '🥉',
                reward: { xp: 100, badge: 'bronze_investor' }
            },
            silver_tier: {
                name: 'Silver Investor',
                description: 'Reached Silver tier (500+ GBUV)',
                icon: '🥈',
                reward: { xp: 300, badge: 'silver_investor' }
            },
            gold_tier: {
                name: 'Gold Investor',
                description: 'Reached Gold tier (1,000+ GBUV)',
                icon: '🥇',
                reward: { xp: 750, badge: 'gold_investor' }
            },
            platinum_tier: {
                name: 'Platinum Investor',
                description: 'Reached Platinum tier (5,000+ GBUV)',
                icon: '⭐',
                reward: { xp: 5000, badge: 'platinum_investor', title: 'Platinum Investor' }
            },
            diamond_tier: {
                name: 'Diamond Investor',
                description: 'Reached Diamond tier (10,000+ GBUV)',
                icon: '💎',
                reward: { xp: 15000, gems: 1000, badge: 'diamond_investor', title: 'Diamond Investor' }
            },
            leaderboard_top10: {
                name: 'Top 10 Investor',
                description: 'Reached top 10 on leaderboard',
                icon: '🏆',
                reward: { xp: 1000, gems: 200, badge: 'top_investor' }
            },
            leaderboard_top3: {
                name: 'Podium Position',
                description: 'Reached top 3 on leaderboard',
                icon: '🥇',
                reward: { xp: 2500, gems: 500, badge: 'elite_investor' }
            },
            leaderboard_rank1: {
                name: 'Investment King',
                description: 'Reached #1 on leaderboard',
                icon: '👑',
                reward: { xp: 10000, gems: 2000, badge: 'investment_king', title: 'Investment King' }
            },
            monthly_investor: {
                name: 'Consistent Investor',
                description: 'Invested every month for 3 months',
                icon: '📅',
                reward: { xp: 1500, gems: 300, badge: 'consistent_investor' }
            },
            project_fully_funded: {
                name: 'Project Champion',
                description: 'Helped fully fund a project (100% goal)',
                icon: '🎯',
                reward: { xp: 1000, gems: 200 }
            }
        };
        
        this.TITLES = {
            'The Whale': { color: '#00d4ff', glow: true },
            'Platinum Investor': { color: '#e5e4e2', glow: true },
            'Diamond Investor': { color: '#b9f2ff', glow: true },
            'Investment King': { color: '#ffd700', glow: true, animation: 'pulse' }
        };
        
        console.log('🏆 Investor Achievement System initialized');
    }
    
    /**
     * Check and award achievements for user action
     */
    async checkAchievements(username, action, data = {}) {
        const unlocked = [];
        const userAchievements = this.getUserAchievements(username);
        
        // First investment
        if (action === 'investment' && !userAchievements.includes('first_investment')) {
            const portfolio = window.projectInvestmentSystem.getPortfolio(username);
            const totalTransactions = Object.values(portfolio.investments).reduce((sum, inv) => {
                return sum + (inv.transactions ? inv.transactions.length : 0);
            }, 0);
            
            if (totalTransactions === 1) {
                unlocked.push('first_investment');
            }
        }
        
        // Investment amount milestones
        if (action === 'investment' && data.amount) {
            if (data.amount >= 100 && !userAchievements.includes('invest_100')) {
                unlocked.push('invest_100');
            }
            if (data.amount >= 1000 && !userAchievements.includes('invest_1000')) {
                unlocked.push('invest_1000');
            }
            if (data.amount >= 10000 && !userAchievements.includes('invest_10000')) {
                unlocked.push('invest_10000');
            }
        }
        
        // Diversification
        if (action === 'investment') {
            const portfolio = window.projectInvestmentSystem.getPortfolio(username);
            if (portfolio.projectCount >= 5 && !userAchievements.includes('diversified_5')) {
                unlocked.push('diversified_5');
            }
            if (portfolio.projectCount >= 10 && !userAchievements.includes('diversified_10')) {
                unlocked.push('diversified_10');
            }
        }
        
        // Early bird
        if (action === 'investment' && data.projectPath) {
            const status = window.projectInvestmentSystem.getProjectStatus(data.projectPath);
            if (status.investorCount === 1 && !userAchievements.includes('early_bird')) {
                unlocked.push('early_bird');
            }
        }
        
        // Tier achievements
        if (action === 'investment') {
            const portfolio = window.projectInvestmentSystem.getPortfolio(username);
            const tierAchievements = {
                bronze: 'bronze_tier',
                silver: 'silver_tier',
                gold: 'gold_tier',
                platinum: 'platinum_tier',
                diamond: 'diamond_tier'
            };
            
            const tierAchievement = tierAchievements[portfolio.tier];
            if (tierAchievement && !userAchievements.includes(tierAchievement)) {
                unlocked.push(tierAchievement);
            }
        }
        
        // Governance
        if (action === 'vote' && !userAchievements.includes('voted')) {
            unlocked.push('voted');
        }
        if (action === 'proposal' && !userAchievements.includes('proposal_creator')) {
            unlocked.push('proposal_creator');
        }
        
        // ROI
        if (action === 'dividend' && !userAchievements.includes('roi_earned')) {
            unlocked.push('roi_earned');
        }
        
        // Leaderboard
        if (action === 'investment' || action === 'leaderboard_update') {
            const leaderboard = window.projectInvestmentSystem.getLeaderboard(999);
            const rank = leaderboard.findIndex(e => e.username === username) + 1;
            
            if (rank > 0) {
                if (rank === 1 && !userAchievements.includes('leaderboard_rank1')) {
                    unlocked.push('leaderboard_rank1');
                } else if (rank <= 3 && !userAchievements.includes('leaderboard_top3')) {
                    unlocked.push('leaderboard_top3');
                } else if (rank <= 10 && !userAchievements.includes('leaderboard_top10')) {
                    unlocked.push('leaderboard_top10');
                }
            }
        }
        
        // Project fully funded
        if (action === 'project_funded' && data.projectPath) {
            if (!userAchievements.includes('project_fully_funded')) {
                unlocked.push('project_fully_funded');
            }
        }
        
        // Award achievements
        const rewards = { xp: 0, gems: 0, badges: [], titles: [] };
        for (const achievementId of unlocked) {
            const achievement = this.ACHIEVEMENTS[achievementId];
            if (!achievement) continue;
            
            // Mark as unlocked
            userAchievements.push(achievementId);
            
            // Award rewards
            if (achievement.reward.xp) rewards.xp += achievement.reward.xp;
            if (achievement.reward.gems) rewards.gems += achievement.reward.gems;
            if (achievement.reward.badge) rewards.badges.push(achievement.reward.badge);
            if (achievement.reward.title) rewards.titles.push(achievement.reward.title);
            
            // Show notification
            this.showAchievementNotification(achievement);
            
            // Log to activity feed
            if (window.liveActivityFeed) {
                window.liveActivityFeed.addActivity({
                    type: 'achievement',
                    message: `🏆 Achievement Unlocked: ${achievement.name}`,
                    timestamp: Date.now(),
                    data: { achievement: achievementId, reward: achievement.reward }
                });
            }
        }
        
        // Save updated achievements
        localStorage.setItem(`achievements_${username}`, JSON.stringify(userAchievements));
        
        // Apply rewards to game
        if (rewards.xp > 0 || rewards.gems > 0) {
            if (window.gemBotGame) {
                window.gemBotGame.state.player.xp += rewards.xp;
                window.gemBotGame.state.player.gems += rewards.gems;
                window.gemBotGame.checkLevelUp();
                window.gemBotGame.saveGame();
            }
        }
        
        // Save badges and titles
        if (rewards.badges.length > 0) {
            const userBadges = JSON.parse(localStorage.getItem(`badges_${username}`) || '[]');
            for (const badge of rewards.badges) {
                if (!userBadges.includes(badge)) userBadges.push(badge);
            }
            localStorage.setItem(`badges_${username}`, JSON.stringify(userBadges));
        }
        
        if (rewards.titles.length > 0) {
            const userTitles = JSON.parse(localStorage.getItem(`titles_${username}`) || '[]');
            for (const title of rewards.titles) {
                if (!userTitles.includes(title)) userTitles.push(title);
            }
            localStorage.setItem(`titles_${username}`, JSON.stringify(userTitles));
            
            // Set active title to first earned
            if (!localStorage.getItem(`active_title_${username}`)) {
                localStorage.setItem(`active_title_${username}`, rewards.titles[0]);
            }
        }
        
        return { unlocked, rewards };
    }
    
    /**
     * Get user's unlocked achievements
     */
    getUserAchievements(username) {
        return JSON.parse(localStorage.getItem(`achievements_${username}`) || '[]');
    }
    
    /**
     * Show achievement unlock notification
     */
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 80px; right: 20px; z-index: 99999;
            background: linear-gradient(135deg, #7b2cbf, #5a189a);
            border: 2px solid #c77dff; border-radius: 16px; padding: 20px;
            box-shadow: 0 12px 48px rgba(123,44,191,0.6), 0 0 40px rgba(199,125,255,0.4);
            color: #fff; font-weight: 800; min-width: 320px;
            animation: slideInRight 0.4s ease, pulse 0.3s ease 0.4s;
        `;
        
        notification.innerHTML = `
            <div style="font-size:48px; text-align:center; margin-bottom:10px;">${achievement.icon}</div>
            <div style="text-align:center; font-size:18px; margin-bottom:6px; text-shadow:0 0 20px rgba(255,255,255,0.5);">
                Achievement Unlocked!
            </div>
            <div style="text-align:center; font-size:16px; color:#e0aaff; margin-bottom:8px;">
                ${achievement.name}
            </div>
            <div style="text-align:center; font-size:13px; color:#c77dff; margin-bottom:12px;">
                ${achievement.description}
            </div>
            <div style="text-align:center; font-size:14px; padding:8px; background:rgba(0,0,0,0.3); border-radius:8px;">
                ${achievement.reward.xp ? `+${achievement.reward.xp} XP ` : ''}
                ${achievement.reward.gems ? `+${achievement.reward.gems} Gems` : ''}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Play sound if available
        if (window.gemBotSounds && window.gemBotSounds.playSound) {
            window.gemBotSounds.playSound('achievement');
        }
        
        // Remove after animation
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }, 5000);
    }
    
    /**
     * Get achievement progress
     */
    getProgress(username) {
        const achievements = this.getUserAchievements(username);
        const total = Object.keys(this.ACHIEVEMENTS).length;
        const unlocked = achievements.length;
        const percentage = (unlocked / total) * 100;
        
        return { unlocked, total, percentage };
    }
    
    /**
     * Get user's active title
     */
    getActiveTitle(username) {
        return localStorage.getItem(`active_title_${username}`) || null;
    }
    
    /**
     * Set active title
     */
    setActiveTitle(username, title) {
        const userTitles = JSON.parse(localStorage.getItem(`titles_${username}`) || '[]');
        if (!userTitles.includes(title)) {
            throw new Error('Title not unlocked');
        }
        
        localStorage.setItem(`active_title_${username}`, title);
        return true;
    }
}

// Add CSS animations
const achievementCSS = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
const achievementStyle = document.createElement('style');
achievementStyle.textContent = achievementCSS;
document.head.appendChild(achievementStyle);

// Initialize globally
window.investorAchievements = new InvestorAchievementSystem();

// Hook into investment system
if (window.projectInvestmentSystem) {
    const originalInvest = window.projectInvestmentSystem.investInProject.bind(window.projectInvestmentSystem);
    window.projectInvestmentSystem.investInProject = async function(projectPath, amount, username) {
        const result = await originalInvest(projectPath, amount, username);
        
        // Check for achievements
        const achievementResult = await window.investorAchievements.checkAchievements(username, 'investment', {
            amount,
            projectPath
        });
        
        // Add achievement rewards to result
        if (achievementResult.unlocked.length > 0) {
            result.rewards.xp += achievementResult.rewards.xp;
            result.rewards.gems += achievementResult.rewards.gems;
            result.rewards.badges = [...result.rewards.badges, ...achievementResult.rewards.badges];
            result.achievements = achievementResult.unlocked;
        }
        
        return result;
    };
}

console.log('🏆 Investor Achievements ready - gamification active');
