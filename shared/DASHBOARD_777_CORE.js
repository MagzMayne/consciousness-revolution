/**
 * DASHBOARD 777 CORE
 * Shared component library for all team dashboards
 * Pattern: 3 tiers x 7 domains = 21 consciousness nodes per user
 */

const Dashboard777 = {
    version: '1.0.0',

    // Dashboard configuration
    config: {
        domains: [
            { id: 'command', name: 'COMMAND', icon: '💎', hz: 396, color: '#00ffcc' },
            { id: 'craft', name: 'CRAFT', icon: '⚒️', hz: 417, color: '#ff8800' },
            { id: 'connect', name: 'CONNECT', icon: '📡', hz: 528, color: '#00aaff' },
            { id: 'guard', name: 'GUARD', icon: '🛡️', hz: 639, color: '#aa44ff' },
            { id: 'scale', name: 'SCALE', icon: '📈', hz: 741, color: '#00cc66' },
            { id: 'academy', name: 'ACADEMY', icon: '📚', hz: 852, color: '#ffcc00' },
            { id: 'infinity', name: 'INFINITY', icon: '∞', hz: 963, color: '#ff00ff' }
        ],
        tiers: ['personal', 'team', 'public'],
        forges: {
            command: 'reality.html',
            craft: 'creation.html',
            connect: 'signal.html',
            guard: 'guardian.html',
            scale: 'wealth.html',
            academy: 'character.html',
            infinity: 'infinity.html'
        }
    },

    // State management
    state: {
        currentDomain: 'command',
        currentView: 'all',
        metrics: {},
        userId: null
    },

    // Initialize dashboard
    init: function(userId, storageKey) {
        this.state.userId = userId;
        this.storageKey = storageKey || 'dashboard777';
        this.loadState();
        this.setupKeyboardNav();
        this.setupBroadcast();
        console.log('Dashboard777 initialized for ' + userId);
        return this;
    },

    // Load state from localStorage
    loadState: function() {
        var saved = localStorage.getItem(this.storageKey + '_metrics');
        if (saved) {
            this.state.metrics = JSON.parse(saved);
        }
    },

    // Save state to localStorage
    saveState: function() {
        localStorage.setItem(this.storageKey + '_metrics', JSON.stringify(this.state.metrics));
        this.broadcast('metric_update', this.state.metrics);
    },

    // Update a metric
    updateMetric: function(domain, tier, key, value) {
        if (!this.state.metrics[domain]) this.state.metrics[domain] = {};
        if (!this.state.metrics[domain][tier]) this.state.metrics[domain][tier] = {};
        this.state.metrics[domain][tier][key] = value;
        this.saveState();
        this.renderHealth();
        return value;
    },

    // Increment a metric
    incrementMetric: function(domain, tier, key) {
        var current = this.getMetric(domain, tier, key) || 0;
        return this.updateMetric(domain, tier, key, current + 1);
    },

    // Get a metric
    getMetric: function(domain, tier, key) {
        if (this.state.metrics && this.state.metrics[domain] && this.state.metrics[domain][tier]) {
            return this.state.metrics[domain][tier][key];
        }
        return undefined;
    },

    // Calculate health score for a domain/tier
    calculateHealth: function(domain, tier) {
        if (!this.state.metrics || !this.state.metrics[domain] || !this.state.metrics[domain][tier]) return 0;
        var metrics = this.state.metrics[domain][tier];
        var values = [];
        for (var key in metrics) {
            if (typeof metrics[key] === 'number') values.push(metrics[key]);
        }
        if (values.length === 0) return 0;
        var sum = values.reduce(function(a, b) { return a + b; }, 0);
        return Math.min(100, Math.round((sum / values.length) * 10));
    },

    // Calculate total health
    calculateTotalHealth: function() {
        var self = this;
        var total = 0, count = 0;
        this.config.domains.forEach(function(d) {
            self.config.tiers.forEach(function(t) {
                total += self.calculateHealth(d.id, t);
                count++;
            });
        });
        return count > 0 ? Math.round(total / count) : 0;
    },

    // Render health indicators
    renderHealth: function() {
        var self = this;
        this.config.domains.forEach(function(d) {
            var el = document.getElementById(d.id + '-health');
            if (el) {
                var health = self.calculateHealth(d.id, 'personal');
                el.textContent = health + '%';
                el.style.color = health > 70 ? '#00ff88' : health > 40 ? '#ffaa00' : '#ff4466';
            }
        });

        var totalEl = document.getElementById('totalHealth');
        if (totalEl) {
            totalEl.textContent = 'SYSTEM: ' + this.calculateTotalHealth() + '%';
        }
    },

    // Keyboard navigation (1-7 for domains)
    setupKeyboardNav: function() {
        var self = this;
        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            var num = parseInt(e.key);
            if (num >= 1 && num <= 7) {
                var domain = self.config.domains[num - 1];
                self.switchDomain(domain.id);
            }
        });
    },

    // Switch active domain
    switchDomain: function(domainId) {
        this.state.currentDomain = domainId;
        document.querySelectorAll('.domain-tab').forEach(function(tab) {
            tab.classList.toggle('active', tab.dataset.domain === domainId);
        });
        document.querySelectorAll('.domain-content').forEach(function(content) {
            content.classList.toggle('active', content.dataset.domain === domainId);
        });
        localStorage.setItem(this.storageKey + '_domain', domainId);
    },

    // Switch view (personal/team/public/all)
    switchView: function(view) {
        this.state.currentView = view;
        document.querySelectorAll('.view-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        document.querySelectorAll('.diagnostic-panel').forEach(function(panel) {
            if (view === 'all') {
                panel.style.display = '';
            } else {
                panel.style.display = panel.classList.contains('tier-' + view) ? '' : 'none';
            }
        });
        localStorage.setItem(this.storageKey + '_view', view);
    },

    // Open forge for current domain
    openForge: function(domainId) {
        var forge = this.config.forges[domainId || this.state.currentDomain];
        if (forge) window.open(forge, '_blank');
    },

    // Cross-dashboard communication via BroadcastChannel
    setupBroadcast: function() {
        var self = this;
        if (typeof BroadcastChannel !== 'undefined') {
            this.channel = new BroadcastChannel('dashboard777_sync');
            this.channel.onmessage = function(e) {
                if (e.data.type === 'metric_update' && e.data.userId !== self.state.userId) {
                    console.log('Received update from:', e.data.userId);
                    self.onTeamUpdate(e.data);
                }
            };
        }
    },

    // Broadcast message to other dashboards
    broadcast: function(type, data) {
        if (this.channel) {
            this.channel.postMessage({
                type: type,
                userId: this.state.userId,
                data: data,
                timestamp: Date.now()
            });
        }
    },

    // Handle updates from other team members
    onTeamUpdate: function(message) {
        console.log('Team update:', message);
        // Show notification
        this.showTeamNotification(message.userId + ' updated their dashboard');
    },

    // Show team notification
    showTeamNotification: function(text) {
        var notif = document.createElement('div');
        notif.className = 'team-notification';
        notif.textContent = text;
        notif.style.cssText = 'position:fixed;top:20px;right:20px;background:#00aaff;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;animation:fadeIn 0.3s';
        document.body.appendChild(notif);
        setTimeout(function() { notif.remove(); }, 3000);
    }
};

// Export for use
if (typeof module !== 'undefined') module.exports = Dashboard777;
if (typeof window !== 'undefined') window.Dashboard777 = Dashboard777;
