/**
 * XP_INTEGRATION_TRACKER.js - Trinity Integration Layer
 * C1 Implementation + C3 Two-Phase Calibration
 *
 * Bridges existing tools with XP system
 * Auto-detects tool usage and awards XP
 * Prompts for life application (consciousness alignment)
 *
 * Pattern: 3 → 7 → 13 → ∞
 */

const XP_INTEGRATION_TRACKER = {
    version: '1.0.0',

    // Tool registry - maps existing HTML pages to XP rewards
    toolRegistry: {
        // Legal Domain (The Fortress)
        'CONTRACT_ANALYZER_WIZARD.html': {
            id: 'contract_analyzer',
            domain: 'legal',
            baseXP: 15,
            quest: 'analyze_first_contract',
            reflectionPrompt: 'What manipulation pattern did you spot?'
        },
        'EMAIL_PATTERN_ANALYZER.html': {
            id: 'email_analyzer',
            domain: 'legal',
            baseXP: 15,
            quest: 'spot_manipulation_patterns',
            reflectionPrompt: 'How might this pattern appear in your inbox?'
        },
        'LEGAL_COCKPIT.html': {
            id: 'legal_cockpit',
            domain: 'legal',
            baseXP: 10,
            quest: 'use_legal_tools'
        },

        // Finance Domain (The Vault)
        'REVENUE_STREAM_BUILDER.html': {
            id: 'revenue_builder',
            domain: 'finance',
            baseXP: 20,
            quest: 'build_first_stream',
            reflectionPrompt: 'What revenue opportunity did you discover?'
        },
        'DECISION_TREE_BUILDER.html': {
            id: 'decision_tree',
            domain: 'finance',
            baseXP: 20,
            quest: 'make_strategic_decision',
            reflectionPrompt: 'How will you apply this decision framework?'
        },
        'BudgetBoss.html': {
            id: 'budget_boss',
            domain: 'finance',
            baseXP: 15,
            quest: 'track_finances'
        },

        // Mind Domain (The Palace)
        'PATTERN_TRAINER.html': {
            id: 'pattern_trainer',
            domain: 'mind',
            baseXP: 25,
            quest: 'train_pattern_recognition',
            reflectionPrompt: 'What pattern will you watch for today?'
        },
        'CONSCIOUSNESS_COCKPIT.html': {
            id: 'consciousness_cockpit',
            domain: 'mind',
            baseXP: 20,
            quest: 'explore_consciousness'
        },

        // Digital Domain (The Network)
        'SYSTEM_HEALTH_DASHBOARD.html': {
            id: 'health_monitor',
            domain: 'digital',
            baseXP: 10,
            quest: 'monitor_systems'
        },
        'workspace.html': {
            id: 'workspace',
            domain: 'digital',
            baseXP: 5,
            quest: 'use_workspace'
        },

        // Communication Domain (Signal Tower)
        'araya-chat.html': {
            id: 'araya_chat',
            domain: 'communication',
            baseXP: 10,
            quest: 'talk_to_araya',
            reflectionPrompt: 'What insight did ARAYA help you discover?'
        },

        // Gallery Domain (The Showcase)
        'MerlinRepoGallery.html': {
            id: 'repo_gallery',
            domain: 'gallery',
            baseXP: 10,
            quest: 'explore_gallery'
        },

        // Integration Domain (The Sanctum) - Renamed per C3
        'COMMANDER_COCKPIT.html': {
            id: 'commander_cockpit',
            domain: 'integration',
            baseXP: 15,
            quest: 'visit_command_center'
        }
    },

    // Current tool context
    currentTool: null,
    currentPhase: 'digital',

    /**
     * Initialize tracker
     */
    init() {
        this.detectCurrentTool();
        if (this.currentTool) {
            this.injectTrackingCode();
            this.showWelcomeXP();
        }
        this.loadUsageStats();
        console.log('🔧 XP Integration Tracker initialized');
    },

    /**
     * Detect which tool page we're on
     */
    detectCurrentTool() {
        const currentPage = window.location.pathname.split('/').pop();
        this.currentTool = this.toolRegistry[currentPage];

        if (this.currentTool) {
            console.log(`Tool detected: ${this.currentTool.id} (${this.currentTool.domain} domain)`);

            // Emit domain visit
            if (window.XP_EVENT_BUS) {
                XP_EVENT_BUS.emitDomainVisit(this.currentTool.domain);
            }
        }
    },

    /**
     * Inject tracking into existing tools
     */
    injectTrackingCode() {
        // Track button clicks (common pattern across tools)
        document.querySelectorAll('button[type="submit"], button.analyze, button.generate, .action-button').forEach(btn => {
            if (!btn.dataset.xpTracked) {
                btn.addEventListener('click', () => this.onToolUsage('button_click'));
                btn.dataset.xpTracked = 'true';
            }
        });

        // Track form submissions
        document.querySelectorAll('form').forEach(form => {
            if (!form.dataset.xpTracked) {
                form.addEventListener('submit', () => this.onToolUsage('form_submit'));
                form.dataset.xpTracked = 'true';
            }
        });

        // Track file uploads
        document.querySelectorAll('input[type="file"]').forEach(input => {
            if (!input.dataset.xpTracked) {
                input.addEventListener('change', () => {
                    if (input.files.length > 0) {
                        this.onToolUsage('file_upload');
                    }
                });
                input.dataset.xpTracked = 'true';
            }
        });

        // Track significant interactions (debounced)
        let interactionCount = 0;
        document.addEventListener('click', () => {
            interactionCount++;
            if (interactionCount >= 5) {
                interactionCount = 0;
                // Don't award XP for just clicking around
            }
        });
    },

    /**
     * Handle tool usage - Two-phase XP (C3 calibration)
     */
    onToolUsage(triggerType) {
        if (!this.currentTool) return;

        // Phase 1: Digital XP (30% of base)
        const xpResult = this.awardXP('digital');

        // Show reflection prompt for Phase 2
        this.promptForReflection(xpResult);

        // Update usage counter
        this.incrementUsageCount();

        // Check quest progress
        this.checkQuestTrigger();

        console.log(`Tool used: ${this.currentTool.id} via ${triggerType}`);
    },

    /**
     * Award XP through event bus
     */
    awardXP(phase = 'digital') {
        if (!this.currentTool) return null;

        if (window.XP_EVENT_BUS) {
            const result = XP_EVENT_BUS.emitToolUse(
                this.currentTool.id,
                this.currentTool.domain,
                {
                    baseXP: this.currentTool.baseXP,
                    phase: phase
                }
            );

            // Also update XP_LEVEL_SYSTEM if available
            if (window.XP_LEVEL_SYSTEM && result) {
                XP_LEVEL_SYSTEM.addXP(result.finalXP, `tool:${this.currentTool.id}`);
            }

            this.showXPNotification(result.finalXP, phase);
            return result;
        }

        return null;
    },

    /**
     * Prompt for reflection (C3: Two-phase consciousness)
     */
    promptForReflection(xpResult) {
        if (!xpResult || !xpResult.requiresReflection) return;

        // Don't spam - only prompt once per tool per session
        const promptKey = `reflection_prompted_${this.currentTool.id}`;
        if (sessionStorage.getItem(promptKey)) return;
        sessionStorage.setItem(promptKey, 'true');

        // Delay prompt so it doesn't interrupt workflow
        setTimeout(() => {
            this.showReflectionModal(xpResult);
        }, 3000);
    },

    /**
     * Show reflection modal (C3: ARAYA asks, doesn't tell)
     */
    showReflectionModal(xpResult) {
        const prompt = this.currentTool.reflectionPrompt || xpResult.reflectionPrompt;
        const bonusXP = Math.round(this.currentTool.baseXP * 0.7); // 70% bonus for reflection

        const modal = document.createElement('div');
        modal.className = 'xp-reflection-modal';
        modal.innerHTML = `
            <div class="reflection-content">
                <div class="reflection-header">
                    <span class="araya-icon">🌀</span>
                    <span class="araya-name">ARAYA</span>
                </div>
                <p class="reflection-prompt">${prompt}</p>
                <textarea class="reflection-input" placeholder="Share your insight... (optional but +${bonusXP} XP)" rows="3"></textarea>
                <div class="reflection-actions">
                    <button class="reflection-skip">Skip</button>
                    <button class="reflection-submit">Submit (+${bonusXP} XP)</button>
                </div>
                <p class="reflection-note">Real growth comes from applying insights to life</p>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ff88;
            border-radius: 15px;
            padding: 20px;
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            color: #fff;
            animation: slideUp 0.5s ease;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        `;

        // Inject styles
        if (!document.getElementById('xp-reflection-styles')) {
            const style = document.createElement('style');
            style.id = 'xp-reflection-styles';
            style.textContent = `
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .reflection-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
                .araya-icon { font-size: 1.5rem; }
                .araya-name { font-weight: 700; color: #00ff88; font-size: 1.1rem; }
                .reflection-prompt { font-size: 1rem; line-height: 1.5; margin-bottom: 15px; color: #00ffff; }
                .reflection-input {
                    width: 100%; padding: 10px; background: rgba(255,255,255,0.1);
                    border: 1px solid #00ff88; border-radius: 8px; color: #fff;
                    font-size: 0.9rem; resize: none;
                }
                .reflection-actions { display: flex; gap: 10px; margin-top: 15px; }
                .reflection-skip {
                    flex: 1; padding: 10px; background: transparent;
                    border: 1px solid #666; color: #999; border-radius: 8px; cursor: pointer;
                }
                .reflection-submit {
                    flex: 2; padding: 10px; background: linear-gradient(135deg, #00ff88, #00ffff);
                    border: none; color: #000; font-weight: 700; border-radius: 8px; cursor: pointer;
                }
                .reflection-note { font-size: 0.75rem; color: #666; margin-top: 10px; text-align: center; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Event handlers
        modal.querySelector('.reflection-skip').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.reflection-submit').addEventListener('click', () => {
            const input = modal.querySelector('.reflection-input').value.trim();
            if (input.length > 10) {
                // Award Phase 2 XP
                this.awardXP('reflection');
                this.saveReflection(input);
            }
            modal.remove();
        });

        // Auto-dismiss after 30 seconds
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 30000);
    },

    /**
     * Save reflection to localStorage
     */
    saveReflection(text) {
        const reflections = JSON.parse(localStorage.getItem('user_reflections') || '[]');
        reflections.push({
            tool: this.currentTool.id,
            domain: this.currentTool.domain,
            text: text,
            timestamp: Date.now()
        });
        localStorage.setItem('user_reflections', JSON.stringify(reflections));
        console.log('Reflection saved:', text.substring(0, 50) + '...');
    },

    /**
     * Show XP notification
     */
    showXPNotification(amount, phase) {
        const phaseLabel = phase === 'reflection' ? ' (Insight Bonus!)' : '';
        const color = phase === 'reflection' ? '#ff6b00' : '#00ff88';

        const notification = document.createElement('div');
        notification.textContent = `+${amount} XP${phaseLabel}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 30px;
            background: linear-gradient(135deg, ${color}, #00ffff);
            color: #000;
            padding: 12px 20px;
            border-radius: 10px;
            font-family: 'Orbitron', 'Segoe UI', sans-serif;
            font-weight: 700;
            font-size: 1.1rem;
            z-index: 10000;
            animation: slideIn 0.4s ease, fadeOut 0.4s ease 2s;
            box-shadow: 0 0 20px ${color}80;
        `;

        if (!document.getElementById('xp-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'xp-notification-styles';
            style.textContent = `
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
    },

    /**
     * Show welcome XP for visiting tool
     */
    showWelcomeXP() {
        const visitKey = `visited_${this.currentTool.id}`;
        if (sessionStorage.getItem(visitKey)) return;
        sessionStorage.setItem(visitKey, 'true');

        // Small XP for visiting (encourages exploration)
        setTimeout(() => {
            if (window.XP_LEVEL_SYSTEM) {
                XP_LEVEL_SYSTEM.addXP(2, `visit:${this.currentTool.id}`);
            }
        }, 1000);
    },

    /**
     * Increment usage counter
     */
    incrementUsageCount() {
        const key = `tool_usage_${this.currentTool.id}`;
        let count = parseInt(localStorage.getItem(key) || '0');
        count++;
        localStorage.setItem(key, count.toString());
    },

    /**
     * Load usage stats
     */
    loadUsageStats() {
        Object.values(this.toolRegistry).forEach(tool => {
            const count = localStorage.getItem(`tool_usage_${tool.id}`) || '0';
            const counterEl = document.getElementById(`tool_${tool.id}_uses`);
            if (counterEl) {
                counterEl.textContent = `${count} uses`;
            }
        });
    },

    /**
     * Check quest triggers
     */
    checkQuestTrigger() {
        if (!this.currentTool.quest) return;

        const usageCount = parseInt(localStorage.getItem(`tool_usage_${this.currentTool.id}`) || '0');

        if (window.QUEST_AUTO_DETECTOR) {
            QUEST_AUTO_DETECTOR.checkQuestProgress(this.currentTool.quest, usageCount);
        }
    },

    /**
     * Debug info
     */
    debug() {
        console.log('=== XP INTEGRATION TRACKER DEBUG ===');
        console.log('Current tool:', this.currentTool);
        console.log('Tool registry:', Object.keys(this.toolRegistry).length, 'tools');
        return {
            currentTool: this.currentTool,
            registrySize: Object.keys(this.toolRegistry).length
        };
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    // Wait for event bus to be ready
    setTimeout(() => {
        XP_INTEGRATION_TRACKER.init();
    }, 100);
});

window.XP_INTEGRATION_TRACKER = XP_INTEGRATION_TRACKER;
