/**
 * QUEST_AUTO_DETECTOR.js - Trinity Quest System
 * C1 Implementation + C3 Two-Phase Verification
 *
 * Auto-detects quest completion conditions
 * Requires life application for full XP (consciousness alignment)
 *
 * Pattern: 3 → 7 → 13 → ∞
 */

const QUEST_AUTO_DETECTOR = {
    version: '1.0.0',

    // Quest definitions with two-phase structure (C3 calibration)
    quests: {
        // === DAILY QUESTS (Reset every 24h) ===
        'daily_login': {
            name: 'Daily Check-In',
            description: 'Visit the platform today',
            type: 'daily',
            condition: () => true, // Auto-complete on load
            baseReward: 10,
            phase2Prompt: null, // No reflection needed for login
            badge: null
        },
        'daily_tool_use': {
            name: 'Tool Explorer',
            description: 'Use any tool today',
            type: 'daily',
            condition: () => {
                const today = new Date().toDateString();
                const lastUse = localStorage.getItem('last_tool_use_date');
                return lastUse === today;
            },
            baseReward: 15,
            phase2Prompt: 'What insight did you gain from using this tool?',
            badge: null
        },
        'daily_domain_visit': {
            name: 'Domain Explorer',
            description: 'Visit a new domain today',
            type: 'daily',
            condition: () => {
                const today = new Date().toDateString();
                const visits = JSON.parse(localStorage.getItem('domain_visits_today') || '[]');
                return visits.length > 0;
            },
            baseReward: 10,
            phase2Prompt: null,
            badge: null
        },

        // === WEEKLY QUESTS ===
        'weekly_all_domains': {
            name: 'Full Circuit',
            description: 'Visit all 7 domains this week',
            type: 'weekly',
            condition: () => {
                const domains = ['legal', 'finance', 'digital', 'mind', 'communication', 'gallery', 'integration'];
                const mastery = JSON.parse(localStorage.getItem('xp_level_state') || '{}').domainMastery || {};
                return domains.every(d => mastery[d] > 0);
            },
            baseReward: 100,
            phase2Prompt: 'Which domain resonated most with you this week and why?',
            badge: 'explorer'
        },
        'weekly_streak': {
            name: 'Consistency Champion',
            description: 'Login 5 days in a row',
            type: 'weekly',
            condition: () => {
                const state = JSON.parse(localStorage.getItem('xp_level_state') || '{}');
                return (state.loginStreak || 0) >= 5;
            },
            baseReward: 75,
            phase2Prompt: 'What daily practice are you building through this consistency?',
            badge: 'consistent'
        },

        // === STORY QUESTS (One-time achievements) ===
        'analyze_first_contract': {
            name: 'Contract Rookie',
            description: 'Analyze your first contract',
            type: 'story',
            condition: () => parseInt(localStorage.getItem('tool_usage_contract_analyzer') || '0') >= 1,
            baseReward: 50,
            phase2Prompt: 'What manipulation pattern will you watch for in future contracts?',
            badge: 'contract_rookie',
            unlock: 'advanced_contract_tools'
        },
        'spot_manipulation_patterns': {
            name: 'Pattern Spotter',
            description: 'Analyze 5 emails for manipulation',
            type: 'story',
            condition: () => parseInt(localStorage.getItem('tool_usage_email_analyzer') || '0') >= 5,
            baseReward: 75,
            phase2Prompt: 'Describe a real email you received that used one of these patterns.',
            badge: 'pattern_spotter',
            unlock: 'manipulation_immunity_training'
        },
        'build_first_stream': {
            name: 'Revenue Architect',
            description: 'Build your first revenue stream',
            type: 'story',
            condition: () => parseInt(localStorage.getItem('tool_usage_revenue_builder') || '0') >= 1,
            baseReward: 75,
            phase2Prompt: 'What is one action you will take this week to activate this revenue stream?',
            badge: 'entrepreneur'
        },
        'train_pattern_recognition': {
            name: 'Mind Sharpener',
            description: 'Complete 3 pattern training sessions',
            type: 'story',
            condition: () => parseInt(localStorage.getItem('tool_usage_pattern_trainer') || '0') >= 3,
            baseReward: 100,
            phase2Prompt: 'What pattern have you started noticing in your daily life?',
            badge: 'pattern_master',
            unlock: 'advanced_consciousness_tools'
        },
        'talk_to_araya': {
            name: 'First Contact',
            description: 'Have a conversation with ARAYA',
            type: 'story',
            condition: () => parseInt(localStorage.getItem('tool_usage_araya_chat') || '0') >= 1,
            baseReward: 25,
            phase2Prompt: null,
            badge: 'araya_friend'
        },
        'reach_level_2': {
            name: 'Rising Apprentice',
            description: 'Reach Level 2 (Apprentice)',
            type: 'story',
            condition: () => {
                const state = JSON.parse(localStorage.getItem('xp_level_state') || '{}');
                return (state.level || 0) >= 2;
            },
            baseReward: 100,
            phase2Prompt: 'What has been your biggest insight so far on this journey?',
            badge: 'apprentice',
            unlock: 'apprentice_tools'
        },
        'reach_level_3': {
            name: 'Builder Awakened',
            description: 'Reach Level 3 (Builder)',
            type: 'story',
            condition: () => {
                const state = JSON.parse(localStorage.getItem('xp_level_state') || '{}');
                return (state.level || 0) >= 3;
            },
            baseReward: 200,
            phase2Prompt: 'What will you BUILD with your new capabilities?',
            badge: 'builder',
            unlock: 'builder_tools'
        },

        // === CONSCIOUSNESS QUESTS (C3 Special) ===
        'first_reflection': {
            name: 'Inner Observer',
            description: 'Complete your first reflection prompt',
            type: 'story',
            condition: () => {
                const reflections = JSON.parse(localStorage.getItem('user_reflections') || '[]');
                return reflections.length >= 1;
            },
            baseReward: 50,
            phase2Prompt: null, // Already did reflection
            badge: 'reflective'
        },
        'deep_practice': {
            name: 'Deep Practitioner',
            description: 'Complete 10 reflection prompts',
            type: 'story',
            condition: () => {
                const reflections = JSON.parse(localStorage.getItem('user_reflections') || '[]');
                return reflections.length >= 10;
            },
            baseReward: 200,
            phase2Prompt: 'How has regular reflection changed your awareness?',
            badge: 'deep_practitioner',
            unlock: 'consciousness_master_tools'
        }
    },

    // Pending phase 2 completions
    pendingPhase2: {},

    /**
     * Initialize detector
     */
    init() {
        this.resetDailyQuests();
        this.checkAllQuests();

        // Check quests every 10 seconds
        setInterval(() => this.checkAllQuests(), 10000);

        // Listen for XP events
        if (window.XP_EVENT_BUS) {
            XP_EVENT_BUS.on('tool:use', () => this.onToolUse());
            XP_EVENT_BUS.on('domain:visit', () => this.onDomainVisit());
        }

        console.log('🎯 Quest Auto Detector initialized');
    },

    /**
     * Reset daily quests at midnight
     */
    resetDailyQuests() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem('quest_last_reset');

        if (lastReset !== today) {
            // Clear daily quest completions
            Object.entries(this.quests).forEach(([id, quest]) => {
                if (quest.type === 'daily') {
                    localStorage.removeItem(`quest_completed_${id}`);
                }
            });
            localStorage.setItem('quest_last_reset', today);
            localStorage.setItem('domain_visits_today', '[]');
            console.log('Daily quests reset');
        }
    },

    /**
     * Check all quest conditions
     */
    checkAllQuests() {
        Object.entries(this.quests).forEach(([questId, quest]) => {
            this.checkQuest(questId, quest);
        });
    },

    /**
     * Check a single quest
     */
    checkQuest(questId, quest) {
        const completedKey = `quest_completed_${questId}`;
        const phase2Key = `quest_phase2_${questId}`;

        // Skip if fully completed (both phases)
        if (localStorage.getItem(completedKey) === 'full') return;

        // Check if condition met
        if (!quest.condition()) return;

        // Phase 1 completed?
        if (!localStorage.getItem(completedKey)) {
            this.completeQuestPhase1(questId, quest);
        }

        // Phase 2 pending?
        if (quest.phase2Prompt && localStorage.getItem(completedKey) === 'phase1') {
            // Prompt will be shown by the completion notification
        }
    },

    /**
     * Complete quest phase 1 (digital action)
     */
    completeQuestPhase1(questId, quest) {
        const hasPhase2 = !!quest.phase2Prompt;

        localStorage.setItem(`quest_completed_${questId}`, hasPhase2 ? 'phase1' : 'full');

        // Calculate phase 1 XP (30% if phase 2 exists, 100% otherwise)
        const phase1XP = hasPhase2 ? Math.round(quest.baseReward * 0.3) : quest.baseReward;

        // Award XP
        if (window.XP_LEVEL_SYSTEM) {
            XP_LEVEL_SYSTEM.addXP(phase1XP, `quest:${questId}:phase1`);
        }

        // Unlock badge if no phase 2
        if (!hasPhase2 && quest.badge) {
            this.unlockBadge(quest.badge);
        }

        // Show notification
        this.showQuestNotification(questId, quest, phase1XP, hasPhase2);

        console.log(`✅ Quest Phase 1: ${questId} (+${phase1XP} XP)`);
    },

    /**
     * Complete quest phase 2 (life application)
     */
    completeQuestPhase2(questId, reflection) {
        const quest = this.quests[questId];
        if (!quest) return;

        localStorage.setItem(`quest_completed_${questId}`, 'full');

        // Save reflection
        const reflections = JSON.parse(localStorage.getItem('quest_reflections') || '[]');
        reflections.push({
            questId,
            reflection,
            timestamp: Date.now()
        });
        localStorage.setItem('quest_reflections', JSON.stringify(reflections));

        // Award remaining 70% XP
        const phase2XP = Math.round(quest.baseReward * 0.7);

        if (window.XP_LEVEL_SYSTEM) {
            XP_LEVEL_SYSTEM.addXP(phase2XP, `quest:${questId}:phase2`);
        }

        // Now unlock badge
        if (quest.badge) {
            this.unlockBadge(quest.badge);
        }

        // Unlock features
        if (quest.unlock) {
            this.unlockFeature(quest.unlock);
        }

        this.showPhase2Complete(questId, quest, phase2XP);

        console.log(`✅ Quest Phase 2: ${questId} (+${phase2XP} XP)`);
    },

    /**
     * Show quest completion notification with phase 2 prompt
     */
    showQuestNotification(questId, quest, xpAwarded, hasPhase2) {
        const modal = document.createElement('div');
        modal.className = 'quest-complete-modal';

        const phase2HTML = hasPhase2 ? `
            <div class="phase2-section">
                <p class="phase2-label">Complete Life Application for +${Math.round(quest.baseReward * 0.7)} more XP:</p>
                <p class="phase2-prompt">"${quest.phase2Prompt}"</p>
                <textarea class="phase2-input" placeholder="Share your real-world insight..." rows="3"></textarea>
                <div class="phase2-actions">
                    <button class="phase2-later">Later</button>
                    <button class="phase2-submit">Submit (+${Math.round(quest.baseReward * 0.7)} XP)</button>
                </div>
            </div>
        ` : '';

        modal.innerHTML = `
            <div class="quest-content">
                <div class="quest-header">
                    <span class="quest-icon">🎉</span>
                    <span class="quest-title">QUEST COMPLETE!</span>
                </div>
                <h3 class="quest-name">${quest.name}</h3>
                <p class="quest-desc">${quest.description}</p>
                <div class="quest-reward">+${xpAwarded} XP${hasPhase2 ? ' (Phase 1)' : ''}</div>
                ${phase2HTML}
                ${!hasPhase2 ? '<button class="quest-dismiss">Awesome!</button>' : ''}
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.98);
            border: 3px solid #ff6b00;
            border-radius: 20px;
            padding: 30px;
            z-index: 10001;
            font-family: 'Segoe UI', sans-serif;
            color: #fff;
            max-width: 400px;
            text-align: center;
            animation: popIn 0.5s ease;
            box-shadow: 0 0 50px rgba(255, 107, 0, 0.5);
        `;

        // Inject styles
        if (!document.getElementById('quest-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'quest-modal-styles';
            style.textContent = `
                @keyframes popIn {
                    0% { transform: translate(-50%, -50%) scale(0); }
                    50% { transform: translate(-50%, -50%) scale(1.05); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
                .quest-header { margin-bottom: 15px; }
                .quest-icon { font-size: 2.5rem; }
                .quest-title { font-size: 1.3rem; font-weight: 700; color: #ff6b00; margin-left: 10px; }
                .quest-name { font-size: 1.5rem; color: #00ff88; margin: 15px 0 10px; }
                .quest-desc { color: #aaa; margin-bottom: 15px; }
                .quest-reward {
                    font-size: 1.4rem; font-weight: 700;
                    background: linear-gradient(135deg, #ff6b00, #ffaa00);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    margin-bottom: 20px;
                }
                .phase2-section { border-top: 1px solid #333; padding-top: 20px; margin-top: 10px; }
                .phase2-label { color: #00ffff; font-weight: 600; margin-bottom: 10px; }
                .phase2-prompt { color: #fff; font-style: italic; margin-bottom: 15px; }
                .phase2-input {
                    width: 100%; padding: 12px; background: rgba(255,255,255,0.1);
                    border: 1px solid #ff6b00; border-radius: 8px; color: #fff;
                    font-size: 0.95rem; resize: none;
                }
                .phase2-actions { display: flex; gap: 10px; margin-top: 15px; }
                .phase2-later {
                    flex: 1; padding: 12px; background: transparent;
                    border: 1px solid #666; color: #999; border-radius: 8px; cursor: pointer;
                }
                .phase2-submit {
                    flex: 2; padding: 12px; background: linear-gradient(135deg, #ff6b00, #ffaa00);
                    border: none; color: #000; font-weight: 700; border-radius: 8px; cursor: pointer;
                }
                .quest-dismiss {
                    padding: 12px 30px; background: linear-gradient(135deg, #00ff88, #00ffff);
                    border: none; color: #000; font-weight: 700; border-radius: 8px; cursor: pointer;
                    font-size: 1rem;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Event handlers
        if (hasPhase2) {
            modal.querySelector('.phase2-later').addEventListener('click', () => {
                modal.remove();
            });

            modal.querySelector('.phase2-submit').addEventListener('click', () => {
                const input = modal.querySelector('.phase2-input').value.trim();
                if (input.length > 10) {
                    this.completeQuestPhase2(questId, input);
                    modal.remove();
                }
            });
        } else {
            modal.querySelector('.quest-dismiss').addEventListener('click', () => {
                modal.remove();
            });
        }

        // Auto-dismiss if no phase 2
        if (!hasPhase2) {
            setTimeout(() => {
                if (modal.parentNode) modal.remove();
            }, 5000);
        }
    },

    /**
     * Show phase 2 completion
     */
    showPhase2Complete(questId, quest, xpAwarded) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="font-size: 2rem;">🌟</div>
            <div style="font-weight: 700; margin: 10px 0; color: #00ff88;">LIFE APPLICATION COMPLETE!</div>
            <div style="font-size: 1.3rem;">+${xpAwarded} XP</div>
            ${quest.badge ? `<div style="margin-top: 10px;">🏆 Badge: ${quest.badge}</div>` : ''}
        `;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #00ff88;
            color: #fff;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            font-family: 'Segoe UI', sans-serif;
            z-index: 10002;
            animation: popIn 0.5s ease;
            box-shadow: 0 0 50px rgba(0, 255, 136, 0.5);
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },

    /**
     * Check quest progress (called from integration tracker)
     */
    checkQuestProgress(questId, progress) {
        const quest = this.quests[questId];
        if (quest) {
            this.checkQuest(questId, quest);
        }
    },

    /**
     * Unlock badge
     */
    unlockBadge(badgeId) {
        localStorage.setItem(`badge_${badgeId}`, 'true');

        // Trigger ARAYA celebration
        if (window.ARAYA_BOT_ENGINE) {
            ARAYA_BOT_ENGINE.speak(`🏆 Badge Unlocked: ${badgeId.replace(/_/g, ' ').toUpperCase()}!`);
        }

        console.log(`🏆 Badge unlocked: ${badgeId}`);
    },

    /**
     * Unlock feature
     */
    unlockFeature(featureId) {
        localStorage.setItem(`feature_${featureId}`, 'true');
        console.log(`🔓 Feature unlocked: ${featureId}`);
    },

    /**
     * Handle tool use event
     */
    onToolUse() {
        localStorage.setItem('last_tool_use_date', new Date().toDateString());
    },

    /**
     * Handle domain visit event
     */
    onDomainVisit() {
        const today = new Date().toDateString();
        const visits = JSON.parse(localStorage.getItem('domain_visits_today') || '[]');
        // Domain tracking handled by XP_EVENT_BUS
    },

    /**
     * Get quest status
     */
    getQuestStatus(questId) {
        const completed = localStorage.getItem(`quest_completed_${questId}`);
        return {
            phase1Complete: completed === 'phase1' || completed === 'full',
            phase2Complete: completed === 'full',
            fullyComplete: completed === 'full'
        };
    },

    /**
     * Debug info
     */
    debug() {
        console.log('=== QUEST AUTO DETECTOR DEBUG ===');
        Object.entries(this.quests).forEach(([id, quest]) => {
            const status = this.getQuestStatus(id);
            console.log(`${id}: ${status.fullyComplete ? '✅ FULL' : status.phase1Complete ? '⏳ Phase1' : '❌ Pending'}`);
        });
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        QUEST_AUTO_DETECTOR.init();
    }, 200);
});

window.QUEST_AUTO_DETECTOR = QUEST_AUTO_DETECTOR;
