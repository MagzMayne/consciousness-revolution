// RootIB: RB-20260319142113-B3060ECD
/**
 * XP_EVENT_BUS.js - Trinity Foundation Layer
 * C2 Architecture + C3 Consciousness Calibration
 *
 * Event-driven foundation for XP system
 * Two-phase XP: Digital action + Life application
 *
 * Pattern: 3 → 7 → 13 → ∞
 */

const XP_EVENT_BUS = {
    version: '1.0.0',

    // Event listeners registry
    listeners: {},

    // Event history for debugging
    history: [],

    // Rate limiting to prevent XP farming
    rateLimits: {
        toolUse: { max: 10, window: 60000 }, // 10 per minute
        questComplete: { max: 3, window: 300000 }, // 3 per 5 min
        domainVisit: { max: 7, window: 60000 } // 7 per minute (all domains)
    },

    // Rate limit tracking
    rateCounts: {},

    // Two-phase XP multipliers (C3 consciousness calibration)
    xpMultipliers: {
        digitalOnly: 0.3,      // 30% XP for just using tool
        withReflection: 0.7,   // 70% XP for journaling about it
        lifeApplication: 1.5,  // 150% XP for real-world application
        verified: 2.0          // 200% XP for verified transformation
    },

    /**
     * Initialize the event bus
     */
    init() {
        this.loadState();
        this.setupGlobalListeners();
        console.log('🌀 XP Event Bus initialized - Trinity Foundation Active');
        this.emit('system:ready', { timestamp: Date.now() });
    },

    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return () => this.off(event, callback); // Return unsubscribe function
    },

    /**
     * Remove an event listener
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    },

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    emit(event, data = {}) {
        // Add metadata
        const eventData = {
            ...data,
            event,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        // Log to history
        this.history.push(eventData);
        if (this.history.length > 100) this.history.shift(); // Keep last 100

        // Check rate limits
        if (!this.checkRateLimit(event)) {
            console.warn(`Rate limit exceeded for ${event}`);
            this.emit('system:rateLimited', { originalEvent: event });
            return false;
        }

        // Notify listeners
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(eventData);
                } catch (err) {
                    console.error(`Error in ${event} listener:`, err);
                }
            });
        }

        // Also notify wildcard listeners
        if (this.listeners['*']) {
            this.listeners['*'].forEach(callback => callback(eventData));
        }

        return true;
    },

    /**
     * Check rate limits
     */
    checkRateLimit(event) {
        const eventType = event.split(':')[0]; // e.g., 'tool' from 'tool:use'
        const limit = this.rateLimits[eventType + 'Use'] || this.rateLimits[eventType];

        if (!limit) return true; // No limit defined

        const now = Date.now();
        const key = eventType;

        if (!this.rateCounts[key]) {
            this.rateCounts[key] = [];
        }

        // Remove old entries outside window
        this.rateCounts[key] = this.rateCounts[key].filter(t => now - t < limit.window);

        // Check if at limit
        if (this.rateCounts[key].length >= limit.max) {
            return false;
        }

        // Add this event
        this.rateCounts[key].push(now);
        return true;
    },

    /**
     * Calculate XP with two-phase multiplier (C3 consciousness)
     * @param {number} baseXP - Base XP amount
     * @param {string} phase - 'digital', 'reflection', 'life', 'verified'
     */
    calculateXP(baseXP, phase = 'digital') {
        const multipliers = {
            'digital': this.xpMultipliers.digitalOnly,
            'reflection': this.xpMultipliers.withReflection,
            'life': this.xpMultipliers.lifeApplication,
            'verified': this.xpMultipliers.verified
        };

        const multiplier = multipliers[phase] || 1;
        const finalXP = Math.round(baseXP * multiplier);

        return {
            baseXP,
            phase,
            multiplier,
            finalXP,
            consciousnessAligned: phase !== 'digital' // C3: Real growth requires more than clicking
        };
    },

    /**
     * Emit tool usage event with two-phase XP
     */
    emitToolUse(toolId, domain, options = {}) {
        const phase = options.phase || 'digital';
        const baseXP = options.baseXP || 10;
        const xpCalc = this.calculateXP(baseXP, phase);

        this.emit('tool:use', {
            toolId,
            domain,
            ...xpCalc,
            requiresReflection: phase === 'digital', // Prompt for phase 2
            reflectionPrompt: this.getReflectionPrompt(toolId, domain)
        });

        return xpCalc;
    },

    /**
     * Get Socratic reflection prompt (C3: ARAYA asks, doesn't tell)
     */
    getReflectionPrompt(toolId, domain) {
        const prompts = {
            legal: [
                "What pattern did you notice in this analysis?",
                "How might this apply to a situation in your life?",
                "What would you do differently knowing this?"
            ],
            finance: [
                "What surprised you about this financial pattern?",
                "Where in your life could you apply this insight?",
                "What's one small action you could take today?"
            ],
            mind: [
                "What did you learn about your own thinking?",
                "How does this pattern show up in your daily life?",
                "What would change if you recognized this pattern earlier?"
            ],
            default: [
                "What insight emerged from using this tool?",
                "How could you apply this in your real life?",
                "What's one thing you'll do differently now?"
            ]
        };

        const domainPrompts = prompts[domain] || prompts.default;
        return domainPrompts[Math.floor(Math.random() * domainPrompts.length)];
    },

    /**
     * Emit quest completion with verification
     */
    emitQuestComplete(questId, options = {}) {
        const verified = options.verified || false;
        const phase = verified ? 'verified' : (options.hasLifeApplication ? 'life' : 'digital');
        const baseXP = options.baseXP || 50;
        const xpCalc = this.calculateXP(baseXP, phase);

        this.emit('quest:complete', {
            questId,
            ...xpCalc,
            verified,
            verificationMethod: options.verificationMethod || null
        });

        return xpCalc;
    },

    /**
     * Emit domain visit
     */
    emitDomainVisit(domain) {
        this.emit('domain:visit', {
            domain,
            isFirstVisit: !this.hasVisitedDomain(domain)
        });

        this.markDomainVisited(domain);
    },

    /**
     * Check if domain was visited this session
     */
    hasVisitedDomain(domain) {
        const visited = JSON.parse(sessionStorage.getItem('domains_visited') || '[]');
        return visited.includes(domain);
    },

    /**
     * Mark domain as visited
     */
    markDomainVisited(domain) {
        const visited = JSON.parse(sessionStorage.getItem('domains_visited') || '[]');
        if (!visited.includes(domain)) {
            visited.push(domain);
            sessionStorage.setItem('domains_visited', JSON.stringify(visited));
        }
    },

    /**
     * Get unique session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('xp_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('xp_session_id', sessionId);
        }
        return sessionId;
    },

    /**
     * Load persisted state
     */
    loadState() {
        try {
            const state = localStorage.getItem('xp_event_bus_state');
            if (state) {
                const parsed = JSON.parse(state);
                this.rateCounts = parsed.rateCounts || {};
            }
        } catch (e) {
            console.warn('Could not load XP Event Bus state:', e);
        }
    },

    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            localStorage.setItem('xp_event_bus_state', JSON.stringify({
                rateCounts: this.rateCounts,
                lastSave: Date.now()
            }));
        } catch (e) {
            console.warn('Could not save XP Event Bus state:', e);
        }
    },

    /**
     * Setup global listeners
     */
    setupGlobalListeners() {
        // Save state before page unload
        window.addEventListener('beforeunload', () => this.saveState());

        // Periodic save
        setInterval(() => this.saveState(), 30000);
    },

    /**
     * Debug: View event history
     */
    debug() {
        console.log('=== XP EVENT BUS DEBUG ===');
        console.log('Listeners:', Object.keys(this.listeners));
        console.log('Rate counts:', this.rateCounts);
        console.log('Recent events:', this.history.slice(-10));
        console.log('XP Multipliers:', this.xpMultipliers);
        return {
            listeners: this.listeners,
            rateCounts: this.rateCounts,
            history: this.history
        };
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    XP_EVENT_BUS.init();
});

// Global export
window.XP_EVENT_BUS = XP_EVENT_BUS;
