/**
 * GEM DIAGNOSTICS ENGINE
 * Central data system for all 7 Gem Forge Cockpits
 * Pattern: 3 (Personal/Team/Public) × 7 (Domains) = 21 panels
 */

const GemDiagnostics = {
    version: '1.0.0',

    // Storage key prefix
    STORAGE_PREFIX: 'gem_',

    // Domain definitions with colors and icons
    domains: {
        command: { icon: '💎', color: '#00ffcc', name: 'Command', frequency: '396 Hz' },
        craft: { icon: '⚒️', color: '#ff8800', name: 'Craft', frequency: '417 Hz' },
        connect: { icon: '📡', color: '#00aaff', name: 'Connect', frequency: '528 Hz' },
        guard: { icon: '🛡️', color: '#aa44ff', name: 'Guard', frequency: '639 Hz' },
        scale: { icon: '📈', color: '#00cc66', name: 'Scale', frequency: '741 Hz' },
        academy: { icon: '📚', color: '#ffcc00', name: 'Academy', frequency: '852 Hz' },
        infinity: { icon: '∞', color: '#ff00ff', name: 'Infinity', frequency: '963 Hz' }
    },

    // Default diagnostic structure for each domain
    getDefaultDiagnostics(domain) {
        const defaults = {
            command: {
                personal: {
                    morningRitual: { value: false, label: 'Morning Ritual', type: 'boolean' },
                    priorityTasks: { value: 0, max: 3, label: 'Priority Tasks', type: 'progress' },
                    decisionQueue: { value: 0, label: 'Decision Queue', type: 'number', warnThreshold: 5 },
                    focusTime: { value: 0, label: 'Focus Time (hrs)', type: 'number' },
                    commandStreak: { value: 0, label: 'Command Streak', type: 'streak' },
                    commandScore: { value: 0, label: 'Command Score', type: 'score' }
                },
                team: {
                    projectsActive: { value: 0, label: 'Projects Active', type: 'number' },
                    waitingOn: { value: 0, label: 'Waiting On', type: 'number', warnThreshold: 3 },
                    lastSync: { value: null, label: 'Last Commander Sync', type: 'date' },
                    sharedGoals: { value: 0, max: 100, label: 'Shared Goals', type: 'percent' }
                },
                public: {
                    offeringsReady: { value: 0, max: 3, label: 'Offerings Ready', type: 'progress' },
                    forgeStatus: { value: 'draft', label: 'Forge Status', type: 'status' },
                    audience: { value: 0, label: 'Audience', type: 'number' },
                    contentPublished: { value: 0, label: 'Content Published', type: 'number' }
                }
            },
            craft: {
                personal: {
                    projectsActive: { value: 0, label: 'Projects Active', type: 'number' },
                    stuckItems: { value: 0, label: 'Stuck Items', type: 'number', warnThreshold: 2 },
                    skillsDeveloping: { value: 0, label: 'Skills Growing', type: 'number' },
                    creationStreak: { value: 0, label: 'Creation Streak', type: 'streak' },
                    buildsThisWeek: { value: 0, label: 'Builds This Week', type: 'number' }
                },
                team: {
                    collaborativeBuilds: { value: 0, label: 'Collaborative Builds', type: 'number' },
                    sharedTools: { value: 0, label: 'Shared Tools', type: 'number' },
                    pendingReviews: { value: 0, label: 'Pending Reviews', type: 'number', warnThreshold: 3 },
                    componentLibrary: { value: 'active', label: 'Component Library', type: 'status' }
                },
                public: {
                    productsShipped: { value: 0, label: 'Products Shipped', type: 'number' },
                    gemBotStatus: { value: 'draft', label: 'GemBot Status', type: 'status' },
                    downloads: { value: 0, label: 'Downloads', type: 'number' },
                    userFeedback: { value: null, label: 'User Feedback', type: 'rating' }
                }
            },
            connect: {
                personal: {
                    keyRelationships: { value: 0, label: 'Key Relationships', type: 'number' },
                    needsFollowup: { value: 0, label: 'Needs Follow-up', type: 'number', warnThreshold: 5 },
                    responseTime: { value: null, label: 'Avg Response Time', type: 'duration' },
                    communicationQuality: { value: 'good', label: 'Communication Quality', type: 'status' }
                },
                team: {
                    teamSync: { value: null, label: 'Last Team Sync', type: 'date' },
                    channelsActive: { value: 0, label: 'Channels Active', type: 'number' },
                    unreadMessages: { value: 0, label: 'Unread Messages', type: 'number', warnThreshold: 10 },
                    commanderAccess: { value: 'direct', label: 'Commander Access', type: 'status' }
                },
                public: {
                    audienceSize: { value: 0, label: 'Audience Size', type: 'number' },
                    engagementRate: { value: null, label: 'Engagement Rate', type: 'percent' },
                    emailList: { value: 0, label: 'Email List', type: 'number' },
                    socialFollowing: { value: 0, label: 'Social Following', type: 'number' }
                }
            },
            guard: {
                personal: {
                    boundariesSet: { value: false, label: 'Boundaries Set', type: 'boolean' },
                    energyProtected: { value: 'high', label: 'Energy Protected', type: 'status' },
                    restQuality: { value: 0, label: 'Rest Quality (hrs)', type: 'number', warnThreshold: 6 },
                    healthMetrics: { value: 'good', label: 'Health Metrics', type: 'status' }
                },
                team: {
                    accessControl: { value: 'active', label: 'Access Control', type: 'status' },
                    teamSafety: { value: 100, label: 'Team Safety', type: 'percent' },
                    resourceProtection: { value: 'locked', label: 'Resource Protection', type: 'status' },
                    backupStatus: { value: 'current', label: 'Backup Status', type: 'status' }
                },
                public: {
                    brandProtection: { value: 'setup', label: 'Brand Protection', type: 'status' },
                    reputationScore: { value: null, label: 'Reputation Score', type: 'score' },
                    legalCoverage: { value: null, label: 'Legal Coverage', type: 'status' },
                    insurance: { value: null, label: 'Insurance', type: 'status' }
                }
            },
            scale: {
                personal: {
                    incomeVsExpenses: { value: null, label: 'Income vs Expenses', type: 'ratio' },
                    savingsRate: { value: null, label: 'Savings Rate', type: 'percent' },
                    investmentPortfolio: { value: 'setup', label: 'Investments', type: 'status' },
                    netWorthTrend: { value: null, label: 'Net Worth Trend', type: 'trend' }
                },
                team: {
                    revenueShare: { value: 'active', label: 'Revenue Share', type: 'status' },
                    sharedResources: { value: 'available', label: 'Shared Resources', type: 'status' },
                    growthPrograms: { value: 'enrolled', label: 'Growth Programs', type: 'status' },
                    marketplaceAccess: { value: 'beta', label: 'Marketplace Access', type: 'status' }
                },
                public: {
                    productsListed: { value: 0, label: 'Products Listed', type: 'number' },
                    gemLordsStatus: { value: 'draft', label: 'GemLords Status', type: 'status' },
                    customers: { value: 0, label: 'Customers', type: 'number' },
                    marketReach: { value: null, label: 'Market Reach', type: 'number' }
                }
            },
            academy: {
                personal: {
                    booksRead: { value: 0, label: 'Books Read (Year)', type: 'number' },
                    coursesActive: { value: 0, label: 'Courses Active', type: 'number' },
                    skillsGrowing: { value: 0, label: 'Skills Growing', type: 'number' },
                    dailyLearning: { value: 0, label: 'Daily Learning (min)', type: 'number' }
                },
                team: {
                    teamTraining: { value: 'enrolled', label: 'Team Training', type: 'status' },
                    sharedKnowledge: { value: 'access', label: 'Shared Knowledge', type: 'status' },
                    dnaLibrary: { value: 'active', label: 'DNA Library', type: 'status' },
                    certifications: { value: 0, label: 'Certifications', type: 'number' }
                },
                public: {
                    coursesCreated: { value: 0, label: 'Courses Created', type: 'number' },
                    students: { value: 0, label: 'Students', type: 'number' },
                    contentHours: { value: 0, label: 'Content Hours', type: 'number' },
                    certificationsGiven: { value: 0, label: 'Certifications Given', type: 'number' }
                }
            },
            infinity: {
                personal: {
                    meditationStreak: { value: 0, label: 'Meditation Streak', type: 'streak' },
                    gemIntegration: { value: 0, label: 'Gem Integration', type: 'percent' },
                    consciousnessScore: { value: 'rising', label: 'Consciousness', type: 'status' },
                    flowStates: { value: 0, label: 'Flow States/Week', type: 'number' }
                },
                team: {
                    teamAlignment: { value: 'strong', label: 'Team Alignment', type: 'status' },
                    sharedVision: { value: 'clear', label: 'Shared Vision', type: 'status' },
                    collectiveMission: { value: 'active', label: 'Collective Mission', type: 'status' },
                    infinityAccess: { value: 'full', label: 'Infinity Access', type: 'status' }
                },
                public: {
                    masterTeachings: { value: 'draft', label: 'Master Teachings', type: 'status' },
                    impactRadius: { value: 'local', label: 'Impact Radius', type: 'status' },
                    legacyBuilding: { value: 'started', label: 'Legacy Building', type: 'status' },
                    consciousnessReach: { value: null, label: 'Consciousness Reach', type: 'number' }
                }
            }
        };
        return defaults[domain] || defaults.command;
    },

    // Load diagnostics from localStorage
    load(domain) {
        const key = `${this.STORAGE_PREFIX}${domain}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn(`Failed to parse ${key}`, e);
            }
        }
        return this.getDefaultDiagnostics(domain);
    },

    // Save diagnostics to localStorage
    save(domain, data) {
        const key = `${this.STORAGE_PREFIX}${domain}`;
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(`${key}_updated`, new Date().toISOString());
    },

    // Update a single metric
    updateMetric(domain, tier, metric, value) {
        const data = this.load(domain);
        if (data[tier] && data[tier][metric]) {
            data[tier][metric].value = value;
            this.save(domain, data);
            return true;
        }
        return false;
    },

    // Get status color based on value
    getStatusColor(metric) {
        const { value, type, warnThreshold, max } = metric;

        if (type === 'boolean') {
            return value ? 'good' : 'warn';
        }
        if (type === 'progress' && max) {
            const pct = (value / max) * 100;
            if (pct >= 80) return 'good';
            if (pct >= 40) return 'warn';
            return 'bad';
        }
        if (type === 'number' && warnThreshold) {
            return value >= warnThreshold ? 'warn' : 'good';
        }
        if (type === 'status') {
            const goodStatuses = ['active', 'good', 'high', 'strong', 'clear', 'full', 'current', 'locked', 'direct', 'rising'];
            const warnStatuses = ['setup', 'draft', 'beta', 'started', 'local', 'enrolled'];
            if (goodStatuses.includes(value)) return 'good';
            if (warnStatuses.includes(value)) return 'warn';
            return 'bad';
        }
        if (value === null || value === undefined) return 'neutral';
        return 'good';
    },

    // Format value for display
    formatValue(metric) {
        const { value, type, max } = metric;

        if (value === null || value === undefined) return '—';

        switch (type) {
            case 'boolean':
                return value ? 'Done ✓' : 'Pending';
            case 'progress':
                return max ? `${value}/${max}` : value;
            case 'percent':
                return `${value}%`;
            case 'streak':
                return `${value} days`;
            case 'score':
                return `${value}%`;
            case 'date':
                if (!value) return '—';
                const d = new Date(value);
                const today = new Date();
                if (d.toDateString() === today.toDateString()) return 'Today';
                return d.toLocaleDateString();
            case 'duration':
                return value;
            case 'status':
                return value.charAt(0).toUpperCase() + value.slice(1);
            default:
                return String(value);
        }
    },

    // Calculate domain health score (0-100)
    calculateDomainHealth(domain) {
        const data = this.load(domain);
        let total = 0;
        let count = 0;

        Object.values(data).forEach(tier => {
            Object.values(tier).forEach(metric => {
                const status = this.getStatusColor(metric);
                if (status === 'good') total += 100;
                else if (status === 'warn') total += 50;
                else if (status === 'neutral') total += 25;
                count++;
            });
        });

        return count > 0 ? Math.round(total / count) : 0;
    },

    // Get quick stats for a domain
    getQuickStats(domain) {
        const health = this.calculateDomainHealth(domain);
        const data = this.load(domain);
        const domainInfo = this.domains[domain];

        return {
            health,
            icon: domainInfo.icon,
            color: domainInfo.color,
            name: domainInfo.name,
            frequency: domainInfo.frequency,
            personal: data.personal,
            team: data.team,
            public: data.public
        };
    },

    // Render a diagnostic panel
    renderPanel(domain, tier, containerId) {
        const data = this.load(domain);
        const tierData = data[tier];
        const container = document.getElementById(containerId);
        if (!container || !tierData) return;

        let html = '';
        Object.entries(tierData).forEach(([key, metric]) => {
            const status = this.getStatusColor(metric);
            const value = this.formatValue(metric);
            html += `
                <div class="readout ${status}" data-metric="${key}">
                    <span class="readout-label">${metric.label}</span>
                    <span class="readout-value">${value}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Initialize all panels for a domain
    initDomain(domain) {
        this.renderPanel(domain, 'personal', 'personal-panel');
        this.renderPanel(domain, 'team', 'team-panel');
        this.renderPanel(domain, 'public', 'public-panel');

        // Update health score
        const health = this.calculateDomainHealth(domain);
        const healthEl = document.getElementById('domain-health');
        if (healthEl) healthEl.textContent = `${health}%`;
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GemDiagnostics;
}
