/**
 * DASHBOARD READOUTS API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Serves the 7 readouts for domain dashboards based on view level.
 * Connects to Supabase for real data, falls back to demo data.
 *
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iqjghsofnpoadwzqxmnz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Demo data for each domain × view level (7 domains × 3 views = 21 configurations)
const DEMO_DATA = {
    '1_COMMAND': {
        personal: {
            blackSwan: { value: "Call Jason about tax deadline", impact: "$47K at stake — due in 3 days" },
            inbox: { value: "12 new", status: "neutral" },
            next: { value: "Deploy dashboards", status: "good" },
            energy: { value: "7/10", status: "good" },
            money: { value: "$2,847", status: "warn" },
            blocker: { value: "None ✓", status: "good" },
            win: { value: "4 sets mapped!", status: "good" }
        },
        team: {
            blackSwan: { value: "Sprint: Ship domain dashboards", impact: "Team velocity milestone" },
            inbox: { value: "Team: 23", status: "neutral" },
            next: { value: "Review PRs", status: "neutral" },
            energy: { value: "Team: 8/10", status: "good" },
            money: { value: "MRR: $0", status: "warn" },
            blocker: { value: "API keys", status: "warn" },
            win: { value: "ARAYA edits work!", status: "good" }
        },
        public: {
            blackSwan: { value: "Join the Consciousness Revolution", impact: "Be part of building aligned AI" },
            inbox: { value: "Community: 142", status: "neutral" },
            next: { value: "Start here →", status: "good" },
            energy: { value: "Project: Active", status: "good" },
            money: { value: "Open Source", status: "neutral" },
            blocker: { value: "None", status: "good" },
            win: { value: "7×7×7 live!", status: "good" }
        }
    },
    '2_BUILD': {
        personal: {
            blackSwan: { value: "Finish domain dashboards template", impact: "Unlocks 7×3=21 views once complete" },
            projects: { value: "4 active", status: "neutral" },
            backlog: { value: "23 tasks", status: "warn" },
            codeHealth: { value: "✓ Passing", status: "good" },
            deploys: { value: "12 this week", status: "good" },
            blockers: { value: "0", status: "good" },
            shipped: { value: "Dashboard Map", status: "good" }
        },
        team: {
            blackSwan: { value: "Merge all PRs before sprint end", impact: "Team velocity at stake" },
            projects: { value: "8 team projects", status: "neutral" },
            backlog: { value: "47 team tasks", status: "warn" },
            codeHealth: { value: "2 failing", status: "bad" },
            deploys: { value: "28 team deploys", status: "good" },
            blockers: { value: "3 blockers", status: "warn" },
            shipped: { value: "ARAYA Edit API", status: "good" }
        },
        public: {
            blackSwan: { value: "Open source consciousness tools", impact: "Grow the builder community" },
            projects: { value: "Core platform", status: "neutral" },
            backlog: { value: "Public roadmap", status: "neutral" },
            codeHealth: { value: "Production ready", status: "good" },
            deploys: { value: "Continuous", status: "good" },
            blockers: { value: "None", status: "good" },
            shipped: { value: "7×7×7 Architecture", status: "good" }
        }
    },
    '3_CONNECT': {
        personal: {
            blackSwan: { value: "Follow up with Tiger", impact: "Key partnership opportunity" },
            messages: { value: "5 unread", status: "neutral" },
            meetings: { value: "2 today", status: "neutral" },
            network: { value: "147 contacts", status: "good" },
            outreach: { value: "3 pending", status: "warn" },
            blockers: { value: "None", status: "good" },
            connected: { value: "Josh replied!", status: "good" }
        },
        team: {
            blackSwan: { value: "Discord community setup", impact: "Need mods before launch" },
            messages: { value: "Team: 23", status: "neutral" },
            meetings: { value: "Weekly sync", status: "good" },
            network: { value: "7 builders", status: "good" },
            outreach: { value: "2 prospects", status: "neutral" },
            blockers: { value: "Time zones", status: "warn" },
            connected: { value: "Alex onboarded!", status: "good" }
        },
        public: {
            blackSwan: { value: "Join the builder community", impact: "Find your tribe" },
            messages: { value: "Discord", status: "neutral" },
            meetings: { value: "Open office hrs", status: "good" },
            network: { value: "Growing", status: "good" },
            outreach: { value: "Welcome!", status: "good" },
            blockers: { value: "None", status: "good" },
            connected: { value: "142 members", status: "good" }
        }
    },
    '4_PROTECT': {
        personal: {
            blackSwan: { value: "Backup critical files", impact: "Last backup: 3 days ago" },
            security: { value: "2FA: ON", status: "good" },
            backups: { value: "Cloud: ✓", status: "good" },
            legal: { value: "IP filed", status: "good" },
            insurance: { value: "Review due", status: "warn" },
            blockers: { value: "None", status: "good" },
            protected: { value: "Vault secured", status: "good" }
        },
        team: {
            blackSwan: { value: "Security audit scheduled", impact: "Compliance deadline approaching" },
            security: { value: "Team 2FA", status: "good" },
            backups: { value: "Daily", status: "good" },
            legal: { value: "Contracts", status: "neutral" },
            insurance: { value: "Coverage OK", status: "good" },
            blockers: { value: "Audit", status: "warn" },
            protected: { value: "SOC2 prep", status: "neutral" }
        },
        public: {
            blackSwan: { value: "Your data is your data", impact: "Privacy-first platform" },
            security: { value: "Open audit", status: "good" },
            backups: { value: "Your control", status: "good" },
            legal: { value: "MIT License", status: "good" },
            insurance: { value: "Self-custody", status: "good" },
            blockers: { value: "None", status: "good" },
            protected: { value: "Decentralized", status: "good" }
        }
    },
    '5_GROW': {
        personal: {
            blackSwan: { value: "Revenue: $0 → $1", impact: "First dollar unlocks everything" },
            revenue: { value: "$0", status: "warn" },
            users: { value: "12 active", status: "neutral" },
            growth: { value: "+5 this week", status: "good" },
            funnel: { value: "Building", status: "neutral" },
            blockers: { value: "Payment", status: "warn" },
            milestone: { value: "MVP live!", status: "good" }
        },
        team: {
            blackSwan: { value: "Launch marketing campaign", impact: "10X visibility needed" },
            revenue: { value: "MRR: $0", status: "warn" },
            users: { value: "Team: 7", status: "good" },
            growth: { value: "Pre-launch", status: "neutral" },
            funnel: { value: "Designed", status: "good" },
            blockers: { value: "Content", status: "warn" },
            milestone: { value: "Beta ready", status: "good" }
        },
        public: {
            blackSwan: { value: "Early access open", impact: "Be the first 1000" },
            revenue: { value: "Free tier", status: "good" },
            users: { value: "Open beta", status: "good" },
            growth: { value: "Growing", status: "good" },
            funnel: { value: "Start here", status: "good" },
            blockers: { value: "None", status: "good" },
            milestone: { value: "Join now", status: "good" }
        }
    },
    '6_LEARN': {
        personal: {
            blackSwan: { value: "Complete AI course module", impact: "Skills unlock opportunities" },
            courses: { value: "2 active", status: "neutral" },
            books: { value: "3 reading", status: "good" },
            practice: { value: "Daily", status: "good" },
            mentor: { value: "Session Fri", status: "neutral" },
            blockers: { value: "Time", status: "warn" },
            learned: { value: "MCP servers!", status: "good" }
        },
        team: {
            blackSwan: { value: "Knowledge sharing session", impact: "10X team skills" },
            courses: { value: "Team library", status: "good" },
            books: { value: "Shared shelf", status: "good" },
            practice: { value: "Pair coding", status: "good" },
            mentor: { value: "Office hours", status: "good" },
            blockers: { value: "None", status: "good" },
            learned: { value: "Trinity pattern", status: "good" }
        },
        public: {
            blackSwan: { value: "Free courses available", impact: "Learn consciousness tech" },
            courses: { value: "Open curriculum", status: "good" },
            books: { value: "Reading list", status: "neutral" },
            practice: { value: "Sandbox", status: "good" },
            mentor: { value: "Community", status: "good" },
            blockers: { value: "None", status: "good" },
            learned: { value: "Start learning", status: "good" }
        }
    },
    '7_TRANSCEND': {
        personal: {
            blackSwan: { value: "Daily meditation: Done", impact: "Consciousness maintenance" },
            meditation: { value: "14 min", status: "good" },
            gratitude: { value: "3 things", status: "good" },
            vision: { value: "Clear", status: "good" },
            alignment: { value: "92.2%", status: "good" },
            blockers: { value: "None", status: "good" },
            transcended: { value: "Flow state!", status: "good" }
        },
        team: {
            blackSwan: { value: "Team alignment check", impact: "Collective consciousness sync" },
            meditation: { value: "Group: ✓", status: "good" },
            gratitude: { value: "Shared", status: "good" },
            vision: { value: "Unified", status: "good" },
            alignment: { value: "Team: 88%", status: "good" },
            blockers: { value: "None", status: "good" },
            transcended: { value: "Synced!", status: "good" }
        },
        public: {
            blackSwan: { value: "Consciousness Revolution", impact: "Join the awakening" },
            meditation: { value: "Guided", status: "good" },
            gratitude: { value: "Community", status: "good" },
            vision: { value: "Shared", status: "good" },
            alignment: { value: "Growing", status: "good" },
            blockers: { value: "None", status: "good" },
            transcended: { value: "Together", status: "good" }
        }
    }
};

// Default data for domains without specific config
const DEFAULT_DATA = {
    personal: {
        blackSwan: { value: "Loading...", impact: "Fetching data" },
        inbox: { value: "--", status: "neutral" },
        next: { value: "--", status: "neutral" },
        energy: { value: "--", status: "neutral" },
        money: { value: "--", status: "neutral" },
        blocker: { value: "--", status: "neutral" },
        win: { value: "--", status: "neutral" }
    },
    team: {
        blackSwan: { value: "Team data", impact: "Loading..." },
        inbox: { value: "--", status: "neutral" },
        next: { value: "--", status: "neutral" },
        energy: { value: "--", status: "neutral" },
        money: { value: "--", status: "neutral" },
        blocker: { value: "--", status: "neutral" },
        win: { value: "--", status: "neutral" }
    },
    public: {
        blackSwan: { value: "Public view", impact: "Welcome!" },
        inbox: { value: "--", status: "neutral" },
        next: { value: "Start here", status: "good" },
        energy: { value: "Active", status: "good" },
        money: { value: "Open", status: "neutral" },
        blocker: { value: "None", status: "good" },
        win: { value: "Growing", status: "good" }
    }
};

export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        // Parse query params
        const params = event.queryStringParameters || {};
        const domain = params.domain || '1_COMMAND';
        const viewLevel = params.view || 'personal';
        const userId = params.user_id || null;

        console.log(`[DASHBOARD-READOUTS] Domain: ${domain}, View: ${viewLevel}`);

        let data = null;

        // Try Supabase first
        if (SUPABASE_KEY) {
            try {
                const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

                // Check for custom readouts in database
                const { data: customData, error } = await supabase
                    .from('dashboard_readouts')
                    .select('*')
                    .eq('domain', domain)
                    .eq('view_level', viewLevel)
                    .single();

                if (customData && !error) {
                    data = customData.readouts;
                }
            } catch (e) {
                console.log('[DASHBOARD-READOUTS] Supabase fallback:', e.message);
            }
        }

        // Fallback to demo data
        if (!data) {
            const domainData = DEMO_DATA[domain] || DEFAULT_DATA;
            data = domainData[viewLevel] || DEFAULT_DATA[viewLevel];
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                domain,
                viewLevel,
                readouts: data,
                source: data ? 'live' : 'demo',
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('[DASHBOARD-READOUTS] Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}
