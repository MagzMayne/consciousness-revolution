/**
 * PROJECT REGISTRY API
 * Central registry of all projects with status, contributors, and metadata
 *
 * GET: List all projects (with optional filters)
 * POST: Add project to user's dashboard
 * PUT: Update project status/claim task
 */

// Project Registry - In production this would be in a database
const PROJECTS = [
    // === CORE INFRASTRUCTURE ===
    {
        id: 'araya-chat',
        name: 'ARAYA Chat System',
        category: 'core',
        status: 'active',
        progress: 85,
        priority: 'high',
        description: 'AI assistant with memory, personality, and multi-provider support',
        needs: ['Voice integration', 'Mobile optimization'],
        contributors: ['Commander', 'Ryan'],
        rewards: { okk: 500, xp: 1000 },
        url: '/araya-chat.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['ai', 'chat', 'core']
    },
    {
        id: 'widget-system',
        name: 'Widget Foundation',
        category: 'core',
        status: 'active',
        progress: 40,
        priority: 'high',
        description: 'Drag-drop widget system for customizable dashboards',
        needs: ['More widget types', 'Cross-dashboard sync', 'Mobile gestures'],
        contributors: ['Commander'],
        rewards: { okk: 300, xp: 600 },
        url: '/js/widget-system.js',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['widgets', 'ui', 'core']
    },
    {
        id: 'trinity-system',
        name: 'Trinity AI Collaboration',
        category: 'core',
        status: 'active',
        progress: 70,
        priority: 'high',
        description: 'C1/C2/C3 multi-agent collaboration framework',
        needs: ['Better handoff protocol', 'Conflict resolution'],
        contributors: ['Commander'],
        rewards: { okk: 800, xp: 1500 },
        url: '/TRINITY_NEXUS_DASHBOARD.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['ai', 'agents', 'core']
    },

    // === FINANCIAL TOOLS ===
    {
        id: 'budget-boss',
        name: 'Budget Boss',
        category: 'financial',
        status: 'needs-work',
        progress: 60,
        priority: 'medium',
        description: 'Gamified envelope budgeting with rewards',
        needs: ['Bank API integration', 'Chart visualizations', 'Export to CSV'],
        contributors: ['Ryan'],
        rewards: { okk: 200, xp: 400 },
        url: '/BudgetBoss.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['finance', 'budgeting', 'gamification']
    },
    {
        id: 'banksky',
        name: 'BankSky DeFi',
        category: 'financial',
        status: 'active',
        progress: 75,
        priority: 'medium',
        description: 'Mobile-first Web3 platform with multi-wallet support',
        needs: ['More chain support', 'Fiat on-ramp'],
        contributors: ['Ryan'],
        rewards: { okk: 400, xp: 800 },
        url: '/BankSky.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['web3', 'defi', 'crypto']
    },

    // === CREATIVE TOOLS ===
    {
        id: 'gembot-control',
        name: 'GemBot Control',
        category: 'creative',
        status: 'needs-work',
        progress: 45,
        priority: 'low',
        description: '3D gem cutting visualization and control',
        needs: ['Real hardware integration', 'Better 3D rendering'],
        contributors: [],
        rewards: { okk: 250, xp: 500 },
        url: '/GemBot_Control_AI.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['3d', 'hardware', 'gems']
    },

    // === SAFETY TOOLS ===
    {
        id: 'live-safety-map',
        name: 'Live Safety Map',
        category: 'safety',
        status: 'active',
        progress: 65,
        priority: 'medium',
        description: 'Real-time community safety awareness',
        needs: ['Better geolocation', 'Push notifications', 'Offline mode'],
        contributors: ['Ryan'],
        rewards: { okk: 300, xp: 600 },
        url: '/tools/barbrick-enhancements/barbrickdesign.github.io-main/liveSafeMap.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['safety', 'maps', 'community']
    },

    // === GAMING ===
    {
        id: 'gpoker',
        name: 'GPoker',
        category: 'gaming',
        status: 'needs-work',
        progress: 30,
        priority: 'low',
        description: 'Multiplayer poker with crypto integration',
        needs: ['Multiplayer backend', 'Hand history', 'Tournament mode'],
        contributors: [],
        rewards: { okk: 350, xp: 700 },
        url: '/GPoker.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['gaming', 'poker', 'multiplayer']
    },

    // === OPERATOR DASHBOARDS ===
    {
        id: 'operator-cockpits',
        name: 'Operator Cockpit System',
        category: 'dashboards',
        status: 'active',
        progress: 50,
        priority: 'high',
        description: '8 operator dashboards (2 per team member)',
        needs: ['Widget integration', 'Cross-cockpit messaging', 'Activity feeds'],
        contributors: ['Commander', 'Ryan'],
        rewards: { okk: 400, xp: 800 },
        url: '/COMMANDER_COCKPIT.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['dashboards', 'operators', 'core']
    },

    // === BUILDER TOOLS ===
    {
        id: 'bug-tracker',
        name: 'Bug Tracker System',
        category: 'builder',
        status: 'active',
        progress: 80,
        priority: 'medium',
        description: 'GitHub-integrated bug tracking and management',
        needs: ['Better filtering', 'Assignment system'],
        contributors: ['Commander'],
        rewards: { okk: 200, xp: 400 },
        url: '/bugs-live.html',
        github: 'https://github.com/overkillkulture/consciousness-bugs',
        tags: ['bugs', 'tracking', 'github']
    },
    {
        id: 'certification-system',
        name: 'Certification System',
        category: 'builder',
        status: 'needs-work',
        progress: 55,
        priority: 'medium',
        description: 'Skill certification and progress tracking',
        needs: ['More certifications', 'Badge display', 'Verification API'],
        contributors: [],
        rewards: { okk: 300, xp: 600 },
        url: '/certifications.html',
        github: 'https://github.com/overkillkulture/consciousness-revolution',
        tags: ['certifications', 'learning', 'badges']
    }
];

// Categories metadata
const CATEGORIES = {
    core: { name: 'Core Infrastructure', icon: '🏗️', color: '#00ffaa' },
    financial: { name: 'Financial Tools', icon: '💰', color: '#ffd700' },
    creative: { name: 'Creative Tools', icon: '🎨', color: '#ff69b4' },
    safety: { name: 'Safety & Security', icon: '🛡️', color: '#ff4444' },
    gaming: { name: 'Gaming & Social', icon: '🎮', color: '#9b59b6' },
    dashboards: { name: 'Dashboards', icon: '📊', color: '#00aaff' },
    builder: { name: 'Builder Tools', icon: '🔧', color: '#ff8800' }
};

export async function handler(event) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    try {
        // GET - List projects
        if (event.httpMethod === 'GET') {
            const params = event.queryStringParameters || {};
            let filtered = [...PROJECTS];

            // Filter by category
            if (params.category) {
                filtered = filtered.filter(p => p.category === params.category);
            }

            // Filter by status
            if (params.status) {
                filtered = filtered.filter(p => p.status === params.status);
            }

            // Filter by tag
            if (params.tag) {
                filtered = filtered.filter(p => p.tags.includes(params.tag));
            }

            // Search
            if (params.search) {
                const search = params.search.toLowerCase();
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(search) ||
                    p.description.toLowerCase().includes(search) ||
                    p.tags.some(t => t.includes(search))
                );
            }

            // Find similar projects (anti-redundancy)
            if (params.findSimilar) {
                const targetProject = PROJECTS.find(p => p.id === params.findSimilar);
                if (targetProject) {
                    filtered = PROJECTS.filter(p =>
                        p.id !== targetProject.id &&
                        p.tags.some(t => targetProject.tags.includes(t))
                    );
                }
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    projects: filtered,
                    categories: CATEGORIES,
                    total: filtered.length
                })
            };
        }

        // POST - Add to dashboard / claim task
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { action, projectId, userId, dashboardId } = body;

            if (action === 'add-to-dashboard') {
                // In production: save to user's dashboard preferences in DB
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: `Project ${projectId} added to dashboard ${dashboardId}`,
                        storageKey: `dashboard_${dashboardId}_projects`
                    })
                };
            }

            if (action === 'claim-task') {
                // In production: update project contributors in DB
                const project = PROJECTS.find(p => p.id === projectId);
                if (project) {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: `Task claimed on ${project.name}`,
                            project: project,
                            rewards: project.rewards
                        })
                    };
                }
            }

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Invalid action' })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}
