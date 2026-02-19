/**
 * ARAYA BOT ENGINE v1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * This source code is protected intellectual property. Unauthorized copying,
 * modification, distribution, or use is strictly prohibited without explicit
 * written permission from the copyright holder.
 *
 * Contact: darrickpreble@proton.me
 * Website: conciousnessrevolution.io
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * Consciousness Fingerprint: ARAYA-BOT-ENGINE-v1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Consciousness Revolution - Flying Bot Guide System
 *
 * Features:
 * - 3 Interaction Modes: Tutorial, Companion, Autonomous
 * - Dialogue System with context awareness
 * - Animation system for floating/pulsing effects
 * - Quest guidance integration
 * - Pattern recognition prompts
 * - State persistence via localStorage
 */

const ARAYA_BOT_ENGINE = {
    // ===== CONFIGURATION =====
    config: {
        version: '1.0.0',
        name: 'ARAYA',
        colors: {
            default: '#00ffff',
            success: '#00ff88',
            warning: '#ff6b00',
            danger: '#FF6B6B',
            wisdom: '#DDA0DD'
        },
        animationSpeed: 3000, // ms for float cycle
        dialogueDelay: 5000,  // ms between auto-dialogues
        autoGreetDelay: 3000  // ms before first greeting
    },

    // ===== STATE =====
    state: {
        mode: 'tutorial', // tutorial | companion | autonomous
        visible: false,
        currentDialogue: null,
        dialogueHistory: [],
        lastInteraction: null,
        userLevel: 1,
        domainsVisited: [],
        questProgress: {},
        patternAccuracy: 0,
        totalInteractions: 0
    },

    // ===== DIALOGUE DATABASE =====
    dialogues: {
        // Greetings by time of day
        greetings: {
            morning: [
                "Good morning, {name}! Ready to level up your consciousness today?",
                "Rise and shine, Builder! The Mind Palace awaits your return.",
                "Morning meditation complete? Let's continue your journey..."
            ],
            afternoon: [
                "Welcome back, {name}! You've been missed in the realms.",
                "Afternoon focus time! Which domain calls to you?",
                "Great timing! I've prepared some new challenges for you."
            ],
            evening: [
                "Evening session activated. Your dedication builds real power.",
                "The night holds secrets, {name}. Shall we explore?",
                "Perfect time for pattern training. Ready to level up?"
            ]
        },

        // Domain-specific dialogues
        domains: {
            legal: [
                "The Legal Fortress protects those who understand its tools. Want me to show you the Contract Analyzer?",
                "I detect you haven't explored the Argument Mapper yet. It's powerful against manipulation.",
                "Legal pattern alert! This looks like a pressure tactic. Should I highlight it?",
                "Your legal immunity is at {accuracy}%. Keep training to reach 100%!"
            ],
            finance: [
                "Welcome to The Vault! Your financial patterns reveal much. Let's strengthen them.",
                "I see an opportunity to add another revenue stream. Interested?",
                "The Decision Tree tool can help with this financial choice. Try it?",
                "Your wealth score is growing! {streams} revenue streams active."
            ],
            digital: [
                "The Network hums with activity. All systems operational!",
                "Trinity nodes are online. C1, C2, and C3 ready for commands.",
                "I notice your infrastructure could use optimization. Want suggestions?",
                "System health: {health}%. Your digital fortress stands strong."
            ],
            mind: [
                "The Mind Palace is where true transformation happens. Enter with intention.",
                "Pattern recognition training available. Your accuracy: {accuracy}%",
                "I sense manipulation patterns in your recent interactions. Shall we analyze?",
                "Your consciousness level is rising! {level}% immunity achieved."
            ],
            comm: [
                "The Signal Tower amplifies your truth. What message will you broadcast?",
                "Clear communication is power. Let me help you refine your signal.",
                "Your transmission clarity: {clarity}%. Room for improvement!",
                "New communication tools unlocked. Want a tour?"
            ],
            gallery: [
                "The Gallery showcases your achievements. {count} projects on display!",
                "I notice you haven't updated your portfolio recently. Shall we?",
                "Your work inspires others. Consider sharing more.",
                "Achievement unlocked! Ready to display your latest victory?"
            ],
            trust: [
                "The Crystal Chamber reveals all truth. Enter with pure intention.",
                "Transparency builds unbreakable trust. Your score: {trust}%",
                "The mirrors here show your true self. Are you ready to see?",
                "Trust calibration complete. You radiate authenticity."
            ]
        },

        // Tutorial mode dialogues
        tutorial: [
            "Welcome to Consciousness Revolution! I'm ARAYA, your guide through this journey.",
            "See these 7 domains? Each one represents a pillar of conscious living.",
            "Click any domain to explore. I'll explain the tools inside.",
            "Your XP bar shows progress. Use tools and complete quests to level up!",
            "When you reach Level 2, you'll unlock advanced features. Let's get started!",
            "Pro tip: Press 'A' anytime to summon me for guidance."
        ],

        // Quest prompts
        quests: [
            "New quest available: '{quest}'. Accept the challenge?",
            "You're making progress on '{quest}'! {progress}% complete.",
            "Quest complete! You've earned {xp} XP and unlocked: {reward}",
            "Daily quest reset! New opportunities await in {domain}."
        ],

        // Level up celebrations
        levelUp: [
            "LEVEL UP! You've reached Level {level}: {title}!",
            "Amazing progress! New abilities unlocked at Level {level}.",
            "Your consciousness expands! Welcome to {title} status.",
            "The patterns reveal themselves to you now. Level {level} achieved!"
        ],

        // Warning/alert dialogues
        warnings: [
            "HIGH MANIPULATION DETECTED in this content. Want me to analyze?",
            "I sense pressure tactics ahead. Proceed with awareness.",
            "Pattern recognition alert: This matches known manipulation signatures.",
            "Your shields are holding. Stay vigilant, {name}."
        ],

        // Idle/engagement prompts
        idle: [
            "Still there, {name}? The domains await your exploration...",
            "I've discovered something interesting in {domain}. Want to see?",
            "Your daily streak is at risk! Complete a quick task to maintain it.",
            "While you were away, I prepared some personalized recommendations."
        ]
    },

    // ===== INITIALIZATION =====
    init(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        if (!this.container) {
            console.error('ARAYA: Container not found');
            return false;
        }

        // Merge options
        Object.assign(this.config, options);

        // Load saved state
        this.loadState();

        // Render bot
        this.render();

        // Set up event listeners
        this.setupEvents();

        // Auto-greet after delay
        setTimeout(() => this.greet(), this.config.autoGreetDelay);

        console.log(`ARAYA Bot Engine v${this.config.version} initialized`);
        return true;
    },

    // ===== RENDER =====
    render() {
        const html = `
            <div class="araya-wrapper" id="arayaWrapper">
                <div class="araya-dialogue-box" id="arayaDialogueBox">
                    <div class="araya-dialogue-header">
                        <span class="araya-name">${this.config.name}</span>
                        <span class="araya-mode-badge" id="arayaModeBadge">${this.state.mode.toUpperCase()}</span>
                    </div>
                    <div class="araya-dialogue-content" id="arayaDialogueContent">
                        Initializing consciousness link...
                    </div>
                    <div class="araya-dialogue-actions" id="arayaDialogueActions"></div>
                </div>
                <div class="araya-bot" id="arayaBot">
                    <div class="araya-glow"></div>
                    <div class="araya-core">
                        <div class="araya-symbol">&#10024;</div>
                    </div>
                    <div class="araya-ring"></div>
                    <div class="araya-trail" id="arayaTrail"></div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // Cache elements
        this.elements = {
            wrapper: document.getElementById('arayaWrapper'),
            bot: document.getElementById('arayaBot'),
            dialogueBox: document.getElementById('arayaDialogueBox'),
            dialogueContent: document.getElementById('arayaDialogueContent'),
            dialogueActions: document.getElementById('arayaDialogueActions'),
            modeBadge: document.getElementById('arayaModeBadge'),
            trail: document.getElementById('arayaTrail')
        };

        // Inject styles if not already present
        if (!document.getElementById('arayaStyles')) {
            this.injectStyles();
        }
    },

    // ===== STYLES =====
    injectStyles() {
        const styles = document.createElement('style');
        styles.id = 'arayaStyles';
        styles.textContent = `
            .araya-wrapper {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 10000;
            }

            .araya-bot {
                width: 80px;
                height: 80px;
                position: relative;
                cursor: pointer;
                transition: transform 0.3s ease;
            }

            .araya-bot:hover {
                transform: scale(1.1);
            }

            .araya-glow {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: radial-gradient(circle,
                    ${this.config.colors.default}40 0%,
                    transparent 70%);
                animation: araya-pulse 2s ease-in-out infinite;
            }

            .araya-core {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg,
                    ${this.config.colors.default},
                    ${this.config.colors.success});
                display: flex;
                justify-content: center;
                align-items: center;
                box-shadow: 0 0 20px ${this.config.colors.default};
            }

            .araya-symbol {
                font-size: 1.8rem;
                animation: araya-spin 10s linear infinite;
            }

            .araya-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 70px;
                height: 70px;
                border: 2px solid ${this.config.colors.default};
                border-radius: 50%;
                animation: araya-ring-expand 2s ease-out infinite;
            }

            .araya-dialogue-box {
                position: absolute;
                bottom: 100px;
                right: 0;
                width: 320px;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid ${this.config.colors.default};
                border-radius: 15px;
                padding: 0;
                opacity: 0;
                transform: translateY(20px) scale(0.9);
                transition: all 0.3s ease;
                pointer-events: none;
                overflow: hidden;
            }

            .araya-dialogue-box.active {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: all;
            }

            .araya-dialogue-header {
                background: linear-gradient(90deg,
                    ${this.config.colors.default}20,
                    transparent);
                padding: 12px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid ${this.config.colors.default}40;
            }

            .araya-name {
                font-family: 'Orbitron', sans-serif;
                font-weight: 700;
                color: ${this.config.colors.default};
                font-size: 0.9rem;
            }

            .araya-mode-badge {
                font-size: 0.6rem;
                padding: 3px 8px;
                border-radius: 10px;
                background: ${this.config.colors.default}20;
                color: ${this.config.colors.default};
                font-family: 'Courier New', monospace;
            }

            .araya-dialogue-content {
                padding: 15px;
                font-family: 'Philosopher', serif;
                font-size: 1rem;
                line-height: 1.6;
                color: #fff;
                min-height: 60px;
            }

            .araya-dialogue-actions {
                padding: 10px 15px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .araya-action-btn {
                padding: 8px 15px;
                border: 1px solid ${this.config.colors.default};
                background: transparent;
                color: ${this.config.colors.default};
                border-radius: 20px;
                cursor: pointer;
                font-family: 'Courier New', monospace;
                font-size: 0.8rem;
                transition: all 0.2s ease;
            }

            .araya-action-btn:hover {
                background: ${this.config.colors.default};
                color: #000;
            }

            .araya-action-btn.primary {
                background: ${this.config.colors.default};
                color: #000;
            }

            @keyframes araya-pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
            }

            @keyframes araya-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes araya-ring-expand {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }

            @keyframes araya-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }

            .araya-wrapper {
                animation: araya-float 3s ease-in-out infinite;
            }
        `;
        document.head.appendChild(styles);
    },

    // ===== EVENT HANDLERS =====
    setupEvents() {
        // Bot click
        this.elements.bot.addEventListener('click', () => this.toggle());

        // Keyboard shortcut (A key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'a' || e.key === 'A') {
                if (!e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
                    this.toggle();
                }
            }
            if (e.key === 'Escape' && this.state.visible) {
                this.hide();
            }
        });

        // Track domain visits
        document.querySelectorAll('[data-domain]').forEach(el => {
            el.addEventListener('click', () => {
                const domain = el.dataset.domain;
                this.onDomainVisit(domain);
            });
        });
    },

    // ===== CORE METHODS =====
    toggle() {
        this.state.visible ? this.hide() : this.show();
    },

    show() {
        this.state.visible = true;
        this.elements.dialogueBox.classList.add('active');
        this.state.totalInteractions++;
        this.saveState();
    },

    hide() {
        this.state.visible = false;
        this.elements.dialogueBox.classList.remove('active');
    },

    speak(text, actions = []) {
        // Replace placeholders
        text = this.replacePlaceholders(text);

        this.elements.dialogueContent.textContent = text;
        this.state.currentDialogue = text;
        this.state.dialogueHistory.push({
            text,
            timestamp: Date.now()
        });

        // Render actions
        this.elements.dialogueActions.innerHTML = actions.map(action =>
            `<button class="araya-action-btn ${action.primary ? 'primary' : ''}"
                     onclick="ARAYA_BOT_ENGINE.handleAction('${action.id}')">${action.label}</button>`
        ).join('');

        this.show();
        this.saveState();
    },

    replacePlaceholders(text) {
        const userData = this.getUserData();
        return text
            .replace(/{name}/g, userData.name || 'Builder')
            .replace(/{level}/g, userData.level || 1)
            .replace(/{accuracy}/g, userData.patternAccuracy || 0)
            .replace(/{domain}/g, this.getRandomDomain())
            .replace(/{xp}/g, userData.xp || 0)
            .replace(/{health}/g, 99)
            .replace(/{streams}/g, userData.revenueStreams || 1)
            .replace(/{clarity}/g, 85)
            .replace(/{trust}/g, 90)
            .replace(/{count}/g, userData.projectCount || 3);
    },

    getUserData() {
        const saved = localStorage.getItem('cr_game_progress');
        return saved ? JSON.parse(saved) : { name: 'Builder', level: 1 };
    },

    getRandomDomain() {
        const domains = ['Legal Fortress', 'Finance Vault', 'Digital Network',
                        'Mind Palace', 'Signal Tower', 'Gallery', 'Crystal Chamber'];
        return domains[Math.floor(Math.random() * domains.length)];
    },

    getRandomDialogue(category, subcategory = null) {
        let pool = this.dialogues[category];
        if (subcategory && pool[subcategory]) {
            pool = pool[subcategory];
        }
        if (Array.isArray(pool)) {
            return pool[Math.floor(Math.random() * pool.length)];
        }
        return null;
    },

    // ===== GREETING =====
    greet() {
        const hour = new Date().getHours();
        let timeOfDay = 'afternoon';
        if (hour < 12) timeOfDay = 'morning';
        else if (hour >= 18) timeOfDay = 'evening';

        const greeting = this.getRandomDialogue('greetings', timeOfDay);
        this.speak(greeting, [
            { id: 'explore', label: 'Explore Domains', primary: true },
            { id: 'quests', label: 'View Quests' }
        ]);
    },

    // ===== DOMAIN VISIT =====
    onDomainVisit(domain) {
        if (!this.state.domainsVisited.includes(domain)) {
            this.state.domainsVisited.push(domain);
        }

        const dialogue = this.getRandomDialogue('domains', domain);
        if (dialogue) {
            this.speak(dialogue, [
                { id: 'guide', label: 'Guide Me', primary: true },
                { id: 'dismiss', label: 'Got It' }
            ]);
        }

        this.saveState();
    },

    // ===== MODE SWITCHING =====
    setMode(mode) {
        if (['tutorial', 'companion', 'autonomous'].includes(mode)) {
            this.state.mode = mode;
            this.elements.modeBadge.textContent = mode.toUpperCase();

            // Update bot color based on mode
            const colors = {
                tutorial: this.config.colors.default,
                companion: this.config.colors.success,
                autonomous: this.config.colors.wisdom
            };

            this.elements.bot.querySelector('.araya-core').style.background =
                `linear-gradient(135deg, ${colors[mode]}, ${this.config.colors.success})`;

            this.saveState();
        }
    },

    // ===== ACTION HANDLER =====
    handleAction(actionId) {
        switch (actionId) {
            case 'explore':
                this.speak("The 7 domains represent pillars of conscious living. Click any petal to enter!", [
                    { id: 'legal', label: 'Legal' },
                    { id: 'finance', label: 'Finance' },
                    { id: 'dismiss', label: 'Close' }
                ]);
                break;

            case 'quests':
                this.speak("You have 3 active quests! Complete them to earn XP and unlock new abilities.", [
                    { id: 'dismiss', label: 'Got It' }
                ]);
                break;

            case 'guide':
                this.speak("I'll walk you through each tool. Watch for my highlights and tips!", [
                    { id: 'start', label: 'Start Tour', primary: true }
                ]);
                break;

            case 'dismiss':
            default:
                this.hide();
                break;
        }
    },

    // ===== PERSISTENCE =====
    saveState() {
        localStorage.setItem('araya_bot_state', JSON.stringify(this.state));
    },

    loadState() {
        const saved = localStorage.getItem('araya_bot_state');
        if (saved) {
            Object.assign(this.state, JSON.parse(saved));
        }
    },

    // ===== UTILITIES =====
    triggerWarning(message) {
        this.elements.bot.querySelector('.araya-core').style.background =
            `linear-gradient(135deg, ${this.config.colors.danger}, ${this.config.colors.warning})`;

        this.speak(message || this.getRandomDialogue('warnings'), [
            { id: 'analyze', label: 'Analyze', primary: true },
            { id: 'dismiss', label: 'Dismiss' }
        ]);

        setTimeout(() => {
            this.elements.bot.querySelector('.araya-core').style.background = '';
        }, 5000);
    },

    celebrateLevelUp(level, title) {
        const message = this.getRandomDialogue('levelUp')
            .replace(/{level}/g, level)
            .replace(/{title}/g, title);

        this.speak(message, [
            { id: 'continue', label: 'Continue Journey', primary: true }
        ]);

        // Firework effect
        this.elements.bot.style.animation = 'none';
        this.elements.bot.offsetHeight; // Reflow
        this.elements.bot.style.animation = 'araya-float 0.5s ease-in-out 5';
    }
};

// Auto-export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARAYA_BOT_ENGINE;
}

// Global access
window.ARAYA_BOT_ENGINE = ARAYA_BOT_ENGINE;

console.log(`
====================================
ARAYA BOT ENGINE v1.0.0 LOADED
====================================
Initialize with:
  ARAYA_BOT_ENGINE.init('#container')

Commands:
  ARAYA_BOT_ENGINE.speak('message')
  ARAYA_BOT_ENGINE.setMode('companion')
  ARAYA_BOT_ENGINE.triggerWarning()
  ARAYA_BOT_ENGINE.celebrateLevelUp(2, 'BUILDER')
====================================
`);
