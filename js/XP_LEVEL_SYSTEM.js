/**
 * XP_LEVEL_SYSTEM.js - Consciousness Revolution
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * This source code is protected intellectual property. Unauthorized copying,
 * modification, distribution, or use is strictly prohibited without explicit
 * written permission from the copyright holder.
 *
 * IP Classification: TIER 2 - PROTECTED
 * Contact: darrickpreble@proton.me
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * XP LEVEL SYSTEM v1.0.0
 * Consciousness Revolution - Gamification Engine
 *
 * Features:
 * - 5 Level progression (Apprentice → Commander)
 * - XP earning through actions
 * - Achievement unlocks
 * - Domain mastery tracking
 * - Quest system integration
 * - Visual XP bar + level badge
 * - Persistent progress via localStorage
 *
 * Pattern: 3 → 7 → 13 → ∞
 */

const XP_LEVEL_SYSTEM = {
    // ===== CONFIGURATION =====
    config: {
        version: '1.0.0',
        storageKey: 'cr_game_progress',

        // Level definitions
        levels: [
            { level: 0, name: 'VISITOR',    minXP: 0,     maxXP: 0,     color: '#666666' },
            { level: 1, name: 'APPRENTICE', minXP: 0,     maxXP: 1000,  color: '#00ff88' },
            { level: 2, name: 'BUILDER',    minXP: 1000,  maxXP: 5000,  color: '#00ffff' },
            { level: 3, name: 'ARCHITECT',  minXP: 5000,  maxXP: 15000, color: '#ff6b00' },
            { level: 4, name: 'ORACLE',     minXP: 15000, maxXP: 50000, color: '#DDA0DD' },
            { level: 5, name: 'COMMANDER',  minXP: 50000, maxXP: Infinity, color: '#FFD700' }
        ],

        // XP rewards
        rewards: {
            toolUse: 10,
            questComplete: 50,
            dailyLogin: 5,
            patternTraining: 25,
            domainExplore: 15,
            achievementUnlock: 100,
            tutorialComplete: 200,
            streakBonus: 10  // Per day of streak
        },

        // Domain IDs
        domains: ['legal', 'finance', 'digital', 'mind', 'comm', 'gallery', 'trust']
    },

    // ===== STATE =====
    state: {
        // Core progress
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,

        // Domain mastery (0-100 per domain)
        domainMastery: {
            legal: 0,
            finance: 0,
            digital: 0,
            mind: 0,
            comm: 0,
            gallery: 0,
            trust: 0
        },

        // Stats
        toolsUsed: 0,
        questsCompleted: 0,
        daysActive: 1,
        loginStreak: 0,
        lastLoginDate: null,

        // Achievements
        achievements: [],

        // Quests
        activeQuests: [],
        completedQuests: [],

        // Timestamps
        createdAt: null,
        lastUpdated: null
    },

    // ===== ACHIEVEMENTS DATABASE =====
    achievements: {
        // Exploration
        'first_steps': {
            id: 'first_steps',
            name: 'First Steps',
            description: 'Enter your first domain',
            icon: '👣',
            xpReward: 50,
            condition: (state) => Object.values(state.domainMastery).some(v => v > 0)
        },
        'domain_explorer': {
            id: 'domain_explorer',
            name: 'Domain Explorer',
            description: 'Visit all 7 domains',
            icon: '🗺️',
            xpReward: 200,
            condition: (state) => Object.values(state.domainMastery).every(v => v > 0)
        },
        'domain_master': {
            id: 'domain_master',
            name: 'Domain Master',
            description: 'Reach 100% mastery in any domain',
            icon: '👑',
            xpReward: 500,
            condition: (state) => Object.values(state.domainMastery).some(v => v >= 100)
        },

        // Usage
        'tool_novice': {
            id: 'tool_novice',
            name: 'Tool Novice',
            description: 'Use 10 tools',
            icon: '🔧',
            xpReward: 100,
            condition: (state) => state.toolsUsed >= 10
        },
        'tool_expert': {
            id: 'tool_expert',
            name: 'Tool Expert',
            description: 'Use 50 tools',
            icon: '⚙️',
            xpReward: 300,
            condition: (state) => state.toolsUsed >= 50
        },
        'tool_master': {
            id: 'tool_master',
            name: 'Tool Master',
            description: 'Use 200 tools',
            icon: '🏆',
            xpReward: 1000,
            condition: (state) => state.toolsUsed >= 200
        },

        // Quests
        'quest_starter': {
            id: 'quest_starter',
            name: 'Quest Starter',
            description: 'Complete your first quest',
            icon: '✨',
            xpReward: 75,
            condition: (state) => state.questsCompleted >= 1
        },
        'quest_hunter': {
            id: 'quest_hunter',
            name: 'Quest Hunter',
            description: 'Complete 10 quests',
            icon: '🎯',
            xpReward: 400,
            condition: (state) => state.questsCompleted >= 10
        },

        // Streaks
        'streak_3': {
            id: 'streak_3',
            name: '3-Day Streak',
            description: 'Login for 3 consecutive days',
            icon: '🔥',
            xpReward: 50,
            condition: (state) => state.loginStreak >= 3
        },
        'streak_7': {
            id: 'streak_7',
            name: 'Week Warrior',
            description: 'Login for 7 consecutive days',
            icon: '💪',
            xpReward: 150,
            condition: (state) => state.loginStreak >= 7
        },
        'streak_30': {
            id: 'streak_30',
            name: 'Monthly Master',
            description: 'Login for 30 consecutive days',
            icon: '🌟',
            xpReward: 1000,
            condition: (state) => state.loginStreak >= 30
        },

        // Levels
        'level_2': {
            id: 'level_2',
            name: 'Builder Status',
            description: 'Reach Level 2: Builder',
            icon: '🔨',
            xpReward: 0, // Already earned XP to get here
            condition: (state) => state.level >= 2
        },
        'level_3': {
            id: 'level_3',
            name: 'Architect Status',
            description: 'Reach Level 3: Architect',
            icon: '📐',
            xpReward: 0,
            condition: (state) => state.level >= 3
        },
        'level_4': {
            id: 'level_4',
            name: 'Oracle Status',
            description: 'Reach Level 4: Oracle',
            icon: '🔮',
            xpReward: 0,
            condition: (state) => state.level >= 4
        }
    },

    // ===== QUESTS DATABASE =====
    questTemplates: {
        daily: [
            {
                id: 'daily_login',
                name: 'Daily Check-In',
                description: 'Login to the platform',
                xpReward: 5,
                type: 'daily',
                autoComplete: true
            },
            {
                id: 'daily_tool',
                name: 'Tool of the Day',
                description: 'Use any tool once',
                xpReward: 15,
                type: 'daily',
                requirement: { toolsUsed: 1 }
            },
            {
                id: 'daily_explore',
                name: 'Domain Visitor',
                description: 'Visit any domain',
                xpReward: 10,
                type: 'daily',
                requirement: { domainVisit: 1 }
            }
        ],
        weekly: [
            {
                id: 'weekly_tools',
                name: 'Tool Enthusiast',
                description: 'Use 10 tools this week',
                xpReward: 100,
                type: 'weekly',
                requirement: { toolsUsed: 10 }
            },
            {
                id: 'weekly_domains',
                name: 'Domain Hopper',
                description: 'Visit all 7 domains this week',
                xpReward: 150,
                type: 'weekly',
                requirement: { domainsVisited: 7 }
            }
        ],
        story: [
            {
                id: 'story_onboarding',
                name: 'The Awakening',
                description: 'Complete the onboarding tutorial',
                xpReward: 200,
                type: 'story',
                requirement: { tutorialComplete: true }
            },
            {
                id: 'story_legal_master',
                name: 'Legal Fortress Guardian',
                description: 'Reach 50% mastery in Legal domain',
                xpReward: 300,
                type: 'story',
                requirement: { domainMastery: { legal: 50 } }
            }
        ]
    },

    // ===== INITIALIZATION =====
    init() {
        this.loadState();
        this.checkDailyLogin();
        this.checkAchievements();
        this.refreshQuests();
        this.updateUI();

        console.log(`XP Level System v${this.config.version} initialized`);
        console.log(`Level ${this.state.level}: ${this.getLevelName()} | ${this.state.currentXP} XP`);

        return this;
    },

    // ===== CORE METHODS =====
    addXP(amount, source = 'unknown') {
        if (amount <= 0) return;

        const oldLevel = this.state.level;
        this.state.currentXP += amount;
        this.state.totalXPEarned += amount;

        // Check for level up
        while (this.canLevelUp()) {
            this.levelUp();
        }

        // Emit event
        this.emit('xpGained', { amount, source, newTotal: this.state.currentXP });

        if (this.state.level > oldLevel) {
            this.emit('levelUp', {
                oldLevel,
                newLevel: this.state.level,
                levelName: this.getLevelName()
            });
        }

        this.checkAchievements();
        this.saveState();
        this.updateUI();

        return amount;
    },

    canLevelUp() {
        const currentLevelConfig = this.config.levels[this.state.level];
        return currentLevelConfig && this.state.currentXP >= currentLevelConfig.maxXP;
    },

    levelUp() {
        const oldLevel = this.state.level;
        const currentLevelConfig = this.config.levels[this.state.level];

        // Carry over excess XP
        this.state.currentXP -= currentLevelConfig.maxXP;
        this.state.level++;

        console.log(`🎉 LEVEL UP! ${oldLevel} → ${this.state.level}: ${this.getLevelName()}`);

        // Trigger ARAYA celebration if available
        if (window.ARAYA_BOT_ENGINE) {
            window.ARAYA_BOT_ENGINE.celebrateLevelUp(this.state.level, this.getLevelName());
        }

        return this.state.level;
    },

    getLevelName() {
        const levelConfig = this.config.levels[this.state.level];
        return levelConfig ? levelConfig.name : 'UNKNOWN';
    },

    getLevelColor() {
        const levelConfig = this.config.levels[this.state.level];
        return levelConfig ? levelConfig.color : '#ffffff';
    },

    getXPToNextLevel() {
        const levelConfig = this.config.levels[this.state.level];
        if (!levelConfig || levelConfig.maxXP === Infinity) return 0;
        return levelConfig.maxXP - this.state.currentXP;
    },

    getProgressPercent() {
        const levelConfig = this.config.levels[this.state.level];
        if (!levelConfig || levelConfig.maxXP === Infinity) return 100;
        return (this.state.currentXP / levelConfig.maxXP) * 100;
    },

    // ===== ACTION HANDLERS =====
    onToolUse(toolId, domain = null) {
        this.state.toolsUsed++;

        if (domain && this.state.domainMastery[domain] !== undefined) {
            this.state.domainMastery[domain] = Math.min(100, this.state.domainMastery[domain] + 1);
        }

        this.addXP(this.config.rewards.toolUse, `tool:${toolId}`);
        this.checkQuestProgress('toolsUsed');
    },

    onDomainVisit(domain) {
        if (this.state.domainMastery[domain] !== undefined) {
            if (this.state.domainMastery[domain] === 0) {
                // First visit to this domain
                this.addXP(this.config.rewards.domainExplore, `domain:${domain}`);
            }
            this.state.domainMastery[domain] = Math.max(1, this.state.domainMastery[domain]);
        }
        this.checkQuestProgress('domainVisit');
    },

    onQuestComplete(questId) {
        const quest = this.state.activeQuests.find(q => q.id === questId);
        if (!quest) return;

        this.state.activeQuests = this.state.activeQuests.filter(q => q.id !== questId);
        this.state.completedQuests.push({ ...quest, completedAt: Date.now() });
        this.state.questsCompleted++;

        this.addXP(quest.xpReward, `quest:${questId}`);
        this.emit('questComplete', quest);
    },

    onPatternTraining(accuracy) {
        this.addXP(this.config.rewards.patternTraining, 'pattern_training');

        // Update mind domain mastery based on accuracy
        const masteryGain = Math.floor(accuracy / 20);
        this.state.domainMastery.mind = Math.min(100, this.state.domainMastery.mind + masteryGain);
    },

    // ===== DAILY LOGIN =====
    checkDailyLogin() {
        const today = new Date().toDateString();
        const lastLogin = this.state.lastLoginDate;

        if (lastLogin !== today) {
            // Award daily login XP
            this.addXP(this.config.rewards.dailyLogin, 'daily_login');

            // Check streak
            if (lastLogin) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastLogin === yesterday.toDateString()) {
                    this.state.loginStreak++;
                    // Streak bonus
                    this.addXP(this.config.rewards.streakBonus * this.state.loginStreak, 'streak_bonus');
                } else {
                    this.state.loginStreak = 1;
                }
            } else {
                this.state.loginStreak = 1;
            }

            this.state.lastLoginDate = today;
            this.state.daysActive++;
            this.saveState();
        }
    },

    // ===== ACHIEVEMENTS =====
    checkAchievements() {
        let newAchievements = [];

        for (const [id, achievement] of Object.entries(this.achievements)) {
            if (!this.state.achievements.includes(id) && achievement.condition(this.state)) {
                this.state.achievements.push(id);
                newAchievements.push(achievement);

                if (achievement.xpReward > 0) {
                    this.addXP(achievement.xpReward, `achievement:${id}`);
                }

                console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
                this.emit('achievementUnlocked', achievement);
            }
        }

        return newAchievements;
    },

    getUnlockedAchievements() {
        return this.state.achievements.map(id => this.achievements[id]).filter(Boolean);
    },

    // ===== QUESTS =====
    refreshQuests() {
        // Add daily quests if not present
        const today = new Date().toDateString();

        this.questTemplates.daily.forEach(template => {
            const questId = `${template.id}_${today}`;
            const exists = this.state.activeQuests.some(q => q.id === questId) ||
                          this.state.completedQuests.some(q => q.id === questId);

            if (!exists) {
                this.state.activeQuests.push({
                    ...template,
                    id: questId,
                    progress: 0,
                    target: template.requirement ? Object.values(template.requirement)[0] : 1,
                    createdAt: Date.now()
                });
            }
        });

        this.saveState();
    },

    checkQuestProgress(action) {
        this.state.activeQuests.forEach(quest => {
            if (quest.requirement && quest.requirement[action]) {
                quest.progress++;
                if (quest.progress >= quest.target) {
                    this.onQuestComplete(quest.id);
                }
            }
        });
    },

    // ===== UI UPDATE =====
    updateUI() {
        // Update XP bar
        const xpBar = document.getElementById('xpBar');
        if (xpBar) {
            xpBar.style.width = this.getProgressPercent() + '%';
        }

        // Update XP text
        const xpText = document.getElementById('xpText');
        if (xpText) {
            const levelConfig = this.config.levels[this.state.level];
            const maxXP = levelConfig.maxXP === Infinity ? '∞' : levelConfig.maxXP;
            xpText.textContent = `${this.state.currentXP} / ${maxXP} XP`;
        }

        // Update level badge
        const levelBadge = document.getElementById('levelBadge');
        if (levelBadge) {
            levelBadge.textContent = `LVL ${this.state.level}: ${this.getLevelName()}`;
            levelBadge.style.borderColor = this.getLevelColor();
            levelBadge.style.color = this.getLevelColor();
        }
    },

    // ===== PERSISTENCE =====
    saveState() {
        this.state.lastUpdated = Date.now();
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.state));
    },

    loadState() {
        const saved = localStorage.getItem(this.config.storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(this.state, parsed);
        } else {
            this.state.createdAt = Date.now();
        }
    },

    resetProgress() {
        localStorage.removeItem(this.config.storageKey);
        location.reload();
    },

    // ===== EVENTS =====
    _listeners: {},

    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    },

    emit(event, data) {
        if (this._listeners[event]) {
            this._listeners[event].forEach(cb => cb(data));
        }
    },

    // ===== DEBUG/ADMIN =====
    debug() {
        console.table({
            'Level': `${this.state.level}: ${this.getLevelName()}`,
            'Current XP': this.state.currentXP,
            'Total XP Earned': this.state.totalXPEarned,
            'Progress': `${this.getProgressPercent().toFixed(1)}%`,
            'XP to Next Level': this.getXPToNextLevel(),
            'Tools Used': this.state.toolsUsed,
            'Quests Completed': this.state.questsCompleted,
            'Login Streak': this.state.loginStreak,
            'Achievements': this.state.achievements.length,
            'Days Active': this.state.daysActive
        });

        console.log('Domain Mastery:', this.state.domainMastery);
        console.log('Active Quests:', this.state.activeQuests);
    },

    // Grant XP (admin function)
    grantXP(amount) {
        this.addXP(amount, 'admin_grant');
        console.log(`Granted ${amount} XP`);
    },

    // Set level (admin function)
    setLevel(level) {
        if (level >= 1 && level <= 5) {
            this.state.level = level;
            this.state.currentXP = 0;
            this.saveState();
            this.updateUI();
            console.log(`Set level to ${level}: ${this.getLevelName()}`);
        }
    }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    XP_LEVEL_SYSTEM.init();
});

// Global access
window.XP_LEVEL_SYSTEM = XP_LEVEL_SYSTEM;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XP_LEVEL_SYSTEM;
}

console.log(`
====================================
XP LEVEL SYSTEM v1.0.0 LOADED
====================================
Commands:
  XP_LEVEL_SYSTEM.debug()           - Show stats
  XP_LEVEL_SYSTEM.grantXP(100)      - Add XP
  XP_LEVEL_SYSTEM.onToolUse('id')   - Track tool use
  XP_LEVEL_SYSTEM.resetProgress()   - Reset all
====================================
`);
