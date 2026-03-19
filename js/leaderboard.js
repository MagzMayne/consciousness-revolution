// RootIB: RB-20260319142113-2A353CAB
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
 * File: leaderboard.js
 * Declaration ID: IP-3E5CC55A-MLL28ZV4
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

/** SIGNED BY MeRLynn - ID: MERLYNN-232bf751 - TIMESTAMP: 2025-12-19T05:53:06.516Z - HASH: 223e29de */
/** SIGNED BY AGentR - ID: AGENTR-0b8e5884 - TIMESTAMP: 2025-12-19T05:53:06.516Z - HASH: 223e29de */

// DYNAMIC LEADERBOARD SYSTEM
// Can be loaded on demand for pages that need leaderboard functionality

let currentLeaderboardFilter = 'xp';
let leaderboardData = [];

// Initialize leaderboard system
function initializeLeaderboardSystem(containerId = 'leaderboardContainer') {
    console.log('🏆 Initializing Dynamic Leaderboard...');

    // Load data
    loadLeaderboardData();

    // Create UI if container exists
    const container = document.getElementById(containerId);
    if (container) {
        createLeaderboardUI(container);
        updateLeaderboardDisplay();
    }

    // Check for user profile
    checkUserProfile();

    return {
        refresh: () => {
            loadLeaderboardData();
            updateLeaderboardDisplay();
        },
        setFilter: setLeaderboardFilter,
        getData: () => leaderboardData
    };
}

// Create leaderboard UI
function createLeaderboardUI(container) {
    const filters = [
        { id: 'xp', label: '🏆 XP Leaders', active: true },
        { id: 'tokens', label: '💎 Token Holders', active: false },
        { id: 'level', label: '⭐ Level Masters', active: false },
        { id: 'recent', label: '🔥 Recent Activity', active: false }
    ];

    const filterHTML = filters.map(filter => `
        <button onclick="setLeaderboardFilter('${filter.id}')" id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}"
                class="cyber-btn cyber-btn-secondary ${filter.active ? 'active-filter' : ''}">
            ${filter.label}
        </button>
    `).join('');

    const uiHTML = `
        <div class="leaderboard-filters" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            ${filterHTML}
        </div>
        <div id="leaderboardContent" style="display: grid; gap: 15px;">
            <div style="text-align: center; color: var(--neon-blue); padding: 40px;">
                🔄 Loading leaderboard data...
            </div>
        </div>
    `;

    container.innerHTML = uiHTML;
}

// Load leaderboard data from localStorage
function loadLeaderboardData() {
    leaderboardData = [];

    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Look for XP data and user profiles
        if (key.includes('xpLogData') || key.includes('userProfile') || key.includes('barbrick_auth_session')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));

                // Extract user profile information
                if (key === 'xpLogData') {
                    const userProfile = createUserProfile(data, 'Anonymous User');
                    leaderboardData.push(userProfile);
                } else if (key.includes('barbrick_auth_session')) {
                    const sessionData = data;
                    if (sessionData && sessionData.address) {
                        const xpData = JSON.parse(localStorage.getItem('xpLogData') || '{}');
                        const userProfile = createUserProfile(xpData, sessionData.address.substring(0, 6) + '...' + sessionData.address.substring(-4));
                        leaderboardData.push(userProfile);
                    }
                }
            } catch (error) {
                console.warn('Error parsing leaderboard data:', error);
            }
        }
    }

    // Add demo data if no real data exists
    if (leaderboardData.length === 0) {
        leaderboardData = generateDemoLeaderboardData();
    }

    // Sort by current filter
    sortLeaderboardData();
}

// Create user profile object
function createUserProfile(xpData, username) {
    const level = Math.floor((xpData.totalXP || 0) / 1000) + 1;
    const earnedTokens = xpData.totalTokensEarned || 0;
    const claimedTokens = xpData.claimedTokens || 0;
    const availableTokens = earnedTokens - claimedTokens;
    const totalXP = xpData.totalXP || 0;
    const totalSwag = xpData.totalSwag || 0;

    // Calculate activity score based on recent entries
    const recentActivity = xpData.entries ? xpData.entries.filter(entry => {
        const entryDate = new Date(entry.time);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate > weekAgo;
    }).length : 0;

    return {
        username: username,
        level: level,
        totalXP: totalXP,
        totalSwag: totalSwag,
        earnedTokens: earnedTokens,
        claimedTokens: claimedTokens,
        availableTokens: availableTokens,
        recentActivity: recentActivity,
        lastActive: xpData.entries && xpData.entries.length > 0 ? xpData.entries[0].time : 'Never',
        achievements: calculateAchievements(totalXP, level, earnedTokens, recentActivity)
    };
}

// Calculate achievements
function calculateAchievements(totalXP, level, earnedTokens, recentActivity) {
    const achievements = [];

    if (totalXP >= 10000) achievements.push('🏆 XP Champion');
    else if (totalXP >= 5000) achievements.push('🥈 XP Master');
    else if (totalXP >= 1000) achievements.push('🥉 XP Adept');

    if (level >= 10) achievements.push('⭐ Level Legend');
    else if (level >= 5) achievements.push('🌟 Level Expert');

    if (earnedTokens >= 100) achievements.push('💎 Token Tycoon');
    else if (earnedTokens >= 50) achievements.push('💰 Token Trader');
    else if (earnedTokens >= 10) achievements.push('🪙 Token Holder');

    if (recentActivity >= 10) achievements.push('🔥 Activity Champion');
    else if (recentActivity >= 5) achievements.push('⚡ Active User');

    return achievements;
}

// Generate demo leaderboard data
function generateDemoLeaderboardData() {
    return [
        {
            username: 'CryptoWizard',
            level: 15,
            totalXP: 14500,
            totalSwag: 7250,
            earnedTokens: 156.78,
            claimedTokens: 145.23,
            availableTokens: 11.55,
            recentActivity: 12,
            lastActive: '2 hours ago',
            achievements: ['🏆 XP Champion', '⭐ Level Legend', '💎 Token Tycoon', '🔥 Activity Champion']
        },
        {
            username: 'BlockMaster',
            level: 12,
            totalXP: 11800,
            totalSwag: 5900,
            earnedTokens: 123.45,
            claimedTokens: 120.00,
            availableTokens: 3.45,
            recentActivity: 8,
            lastActive: '1 day ago',
            achievements: ['🏆 XP Champion', '⭐ Level Legend', '💎 Token Tycoon', '⚡ Active User']
        },
        {
            username: 'GemCutter',
            level: 8,
            totalXP: 7800,
            totalSwag: 3900,
            earnedTokens: 89.12,
            claimedTokens: 85.67,
            availableTokens: 3.45,
            recentActivity: 6,
            lastActive: '3 days ago',
            achievements: ['🥈 XP Master', '🌟 Level Expert', '💰 Token Trader', '⚡ Active User']
        },
        {
            username: 'Web3Pioneer',
            level: 6,
            totalXP: 5800,
            totalSwag: 2900,
            earnedTokens: 67.89,
            claimedTokens: 65.43,
            availableTokens: 2.46,
            recentActivity: 4,
            lastActive: '1 week ago',
            achievements: ['🥈 XP Master', '🌟 Level Expert', '💰 Token Trader']
        },
        {
            username: 'AgentHunter',
            level: 4,
            totalXP: 3800,
            totalSwag: 1900,
            earnedTokens: 45.67,
            claimedTokens: 42.12,
            availableTokens: 3.55,
            recentActivity: 3,
            lastActive: '2 weeks ago',
            achievements: ['🥉 XP Adept', '🪙 Token Holder']
        }
    ];
}

// Set leaderboard filter
function setLeaderboardFilter(filter) {
    currentLeaderboardFilter = filter;

    // Update active button
    document.querySelectorAll('.leaderboard-filters button').forEach(btn => {
        btn.classList.remove('active-filter');
    });
    const activeBtn = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active-filter');
    }

    // Sort and update display
    sortLeaderboardData();
    updateLeaderboardDisplay();
}

// Sort leaderboard data
function sortLeaderboardData() {
    leaderboardData.sort((a, b) => {
        switch (currentLeaderboardFilter) {
            case 'xp':
                return b.totalXP - a.totalXP;
            case 'tokens':
                return b.earnedTokens - a.earnedTokens;
            case 'level':
                return b.level - a.level;
            case 'recent':
                return b.recentActivity - a.recentActivity;
            default:
                return b.totalXP - a.totalXP;
        }
    });
}

// Update leaderboard display
function updateLeaderboardDisplay() {
    const container = document.getElementById('leaderboardContent');

    if (!container) return;

    if (leaderboardData.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--neon-blue); padding: 40px;">No leaderboard data available</div>';
        return;
    }

    const leaderboardHTML = leaderboardData.slice(0, 20).map((user, index) => `
        <div class="leaderboard-entry" style="background: rgba(0,0,0,0.4); border: 1px solid var(--neon-blue); border-radius: 10px; padding: 15px; display: flex; align-items: center; gap: 15px;">
            <div class="rank-badge" style="background: linear-gradient(135deg, var(--neon-gold), var(--neon-pink)); color: #000; font-weight: bold; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2em;">
                ${index + 1}
            </div>

            <div class="user-info" style="flex: 1;">
                <div class="username" style="color: var(--neon-blue); font-weight: bold; font-size: 1.1em; margin-bottom: 5px;">
                    ${user.username}
                </div>
                <div class="user-stats" style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 0.85em; color: #8addff;">
                    <span>⭐ Level ${user.level}</span>
                    <span>🏆 ${user.totalXP.toLocaleString()} XP</span>
                    <span>💎 ${user.earnedTokens.toFixed(2)} MNDM</span>
                    <span>🔥 ${user.recentActivity} recent</span>
                </div>
                <div class="achievements" style="margin-top: 8px; display: flex; gap: 5px; flex-wrap: wrap;">
                    ${user.achievements.slice(0, 3).map(achievement => `<span style="background: rgba(255,215,0,0.2); color: var(--neon-gold); padding: 2px 6px; border-radius: 10px; font-size: 0.7em;">${achievement}</span>`).join('')}
                    ${user.achievements.length > 3 ? `<span style="background: rgba(0,255,255,0.2); color: var(--neon-blue); padding: 2px 6px; border-radius: 10px; font-size: 0.7em;">+${user.achievements.length - 3} more</span>` : ''}
                </div>
            </div>

            <div class="user-details" style="text-align: right; font-size: 0.8em; color: #8addff;">
                <div>Last active: ${user.lastActive}</div>
                <div style="color: var(--neon-green); margin-top: 2px;">${user.availableTokens.toFixed(4)} available</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = leaderboardHTML;
}

// Check for user profile
function checkUserProfile() {
    const authSession = localStorage.getItem('barbrick_auth_session');
    const xpData = localStorage.getItem('xpLogData');

    if (authSession && xpData) {
        try {
            const sessionData = JSON.parse(authSession);
            const xpLogData = JSON.parse(xpData);

            if (sessionData.authenticated && xpLogData.totalXP > 0) {
                displayUserProfile(sessionData, xpLogData);
            }
        } catch (error) {
            console.warn('Error loading user profile:', error);
        }
    }
}

// Display user profile (placeholder)
function displayUserProfile(sessionData, xpData) {
    console.log('User profile display - implement in main page if needed');
}

// Export for dynamic loading
if (typeof window !== 'undefined') {
    window.LeaderboardSystem = {
        initialize: initializeLeaderboardSystem,
        setFilter: setLeaderboardFilter,
        refresh: () => {
            loadLeaderboardData();
            updateLeaderboardDisplay();
        }
    };
}
