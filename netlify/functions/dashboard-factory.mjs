/**
 * DASHBOARD FACTORY API
 * Generate, validate, and register dashboards with Gold Standard DNA
 *
 * POST /api/dashboard-factory
 *   action: "create" | "validate" | "list-templates" | "get-registry"
 *
 * Trinity: C1 builds, C2 reviews, C3 validates
 * Pattern: 3 → 7 → 13 → ∞
 */

import { createClient } from '@supabase/supabase-js';

// Domain configuration
const DOMAINS = {
    '1_COMMAND': { name: 'COMMAND', color: '#ff4444', sphere: 'COMMAND' },
    '2_BUILD': { name: 'BUILD', color: '#00aaff', sphere: 'BUILD' },
    '3_CONNECT': { name: 'CONNECT', color: '#aa44ff', sphere: 'CONNECT' },
    '4_PROTECT': { name: 'PROTECT', color: '#44ff44', sphere: 'PROTECT' },
    '5_GROW': { name: 'GROW', color: '#ffaa00', sphere: 'GROW' },
    '6_LEARN': { name: 'LEARN', color: '#00ffaa', sphere: 'LEARN' },
    '7_TRANSCEND': { name: 'TRANSCEND', color: '#ff44aa', sphere: 'TRANSCEND' },
    '8_BLUEPRINT': { name: 'BLUEPRINT', color: '#00ffcc', sphere: 'BLUEPRINT' }
};

// Template types
const TEMPLATES = {
    'cockpit': {
        name: 'Personal Cockpit',
        description: 'Personal control center with quick actions, status, and navigation',
        features: ['status-bar', 'quick-actions', 'team-status', 'araya-embed'],
        lfsme_target: { lighter: 8, faster: 9, stronger: 8, elegant: 8, less_expensive: 10 }
    },
    '8-domain-set': {
        name: '8-Domain Dashboard Set',
        description: 'Full 8-domain navigation with ARAYA embedded',
        features: ['8-domain-nav', 'araya-embed', 'domain-content', 'supabase'],
        generates: 8
    },
    'single-domain': {
        name: 'Single Domain Dashboard',
        description: 'Lightweight single-domain view',
        features: ['domain-nav', 'araya-embed', 'content-area'],
        lfsme_target: { lighter: 9, faster: 9, stronger: 7, elegant: 8, less_expensive: 10 }
    },
    'status-dashboard': {
        name: 'Status Dashboard',
        description: 'System status and monitoring',
        features: ['status-grid', 'live-updates', 'alerts'],
        lfsme_target: { lighter: 8, faster: 10, stronger: 8, elegant: 7, less_expensive: 10 }
    }
};

// Gold Standard DNA template
function generateDNA(options) {
    const {
        name,
        purpose,
        owner,
        realName = null,
        aliases = [],
        domain = '1_COMMAND',
        access = 'Team',
        role = 'operator',
        syncWith = null
    } = options;

    const today = new Date().toISOString().split('T')[0];
    const domainConfig = DOMAINS[domain] || DOMAINS['1_COMMAND'];
    const filename = name.toUpperCase().replace(/\s+/g, '_') + '.html';

    return {
        name,
        version: '1.0.0',
        purpose,
        owner,
        realName,
        aliases,
        domain,
        sphere: domainConfig.sphere,
        created: today,
        updated: today,
        status: 'LIVE',
        url: `https://consciousnessrevolution.io/${filename}`,
        access,
        identitySync: syncWith ? {
            enabled: true,
            syncWith,
            note: `Data syncs with ${syncWith}`
        } : { enabled: false },
        features: [],
        changelog: [
            { version: '1.0.0', date: today, changes: 'Initial creation via Dashboard Factory' }
        ],
        trinity: {
            c1_built: today,
            c2_reviewed: null,
            c3_validated: null
        },
        challenge: {
            passed: false,
            date: null,
            holes_found: 0,
            holes_fixed: 0
        },
        lfsme: {
            lighter: 8,
            faster: 8,
            stronger: 8,
            elegant: 8,
            less_expensive: 10,
            average: 8.4
        },
        connects_to: []
    };
}

// Validate DNA against Gold Standard
function validateDNA(dna) {
    const errors = [];
    const warnings = [];

    // Required fields
    const required = ['name', 'version', 'purpose', 'domain', 'sphere', 'created', 'status'];
    for (const field of required) {
        if (!dna[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Trinity block
    if (!dna.trinity) {
        errors.push('Missing trinity block');
    } else if (!dna.trinity.c1_built) {
        warnings.push('c1_built date not set');
    }

    // LFSME block
    if (!dna.lfsme) {
        errors.push('Missing lfsme block');
    } else {
        const lfsmeFields = ['lighter', 'faster', 'stronger', 'elegant', 'less_expensive', 'average'];
        for (const field of lfsmeFields) {
            if (typeof dna.lfsme[field] !== 'number') {
                warnings.push(`lfsme.${field} should be a number`);
            }
        }
    }

    // Version format
    if (dna.version && !/^\d+\.\d+\.\d+$/.test(dna.version)) {
        warnings.push('Version should be semver format (x.x.x)');
    }

    // Domain validation
    if (dna.domain && !DOMAINS[dna.domain]) {
        warnings.push(`Unknown domain: ${dna.domain}`);
    }

    // Calculate tier
    let tier = 'BRONZE';
    if (errors.length === 0) {
        tier = 'SILVER';
        if (dna.owner && dna.changelog && dna.trinity?.c2_reviewed && dna.trinity?.c3_validated) {
            tier = 'GOLD';
        }
    }

    // Calculate score
    const score = Math.max(0, 10 - errors.length - (warnings.length * 0.5));

    return {
        valid: errors.length === 0,
        tier,
        score: Math.round(score * 10) / 10,
        errors,
        warnings
    };
}

// Generate dashboard HTML from template
function generateDashboardHTML(dna, template = 'cockpit') {
    const domainConfig = DOMAINS[dna.domain] || DOMAINS['1_COMMAND'];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${dna.name} | ${domainConfig.name}</title>

<!-- ============================================================
     DASHBOARD DNA - Identity Block
     Generated by Dashboard Factory
     Sphere: ${domainConfig.sphere} (${domainConfig.color})
============================================================ -->
<script type="application/json" id="dashboard-dna">
${JSON.stringify(dna, null, 2)}
</script>
    <style>
        :root {
            --bg: #0a0a0a;
            --surface: #111;
            --border: #222;
            --text: #fff;
            --text-dim: #888;
            --accent: ${domainConfig.color};
            --accent-dim: ${domainConfig.color}1a;
            --success: #00ff88;
            --warning: #ffaa00;
            --danger: #ff4444;
            --info: #00aaff;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
        }

        .status-bar {
            background: linear-gradient(90deg, var(--accent), var(--accent)88);
            color: var(--bg);
            padding: 8px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
        }

        .main-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .panel {
            background: var(--surface);
            border-radius: 12px;
            border: 1px solid var(--border);
            margin-bottom: 20px;
            overflow: hidden;
        }

        .panel-header {
            background: var(--accent-dim);
            padding: 15px 20px;
            border-bottom: 1px solid var(--border);
            font-weight: bold;
            color: var(--accent);
        }

        .panel-body {
            padding: 20px;
        }

        .content-placeholder {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-dim);
        }

        /* ARAYA Embed */
        .araya-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }

        .araya-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent), #ff8800);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: transform 0.3s;
        }

        .araya-toggle:hover {
            transform: scale(1.1);
        }

        @media (max-width: 768px) {
            .main-container { padding: 10px; }
            .panel-body { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="status-bar">
        <span>📊 ${dna.name}</span>
        <span>${domainConfig.sphere} Domain</span>
    </div>

    <div class="main-container">
        <div class="panel">
            <div class="panel-header">
                ${dna.name}
            </div>
            <div class="panel-body">
                <div class="content-placeholder">
                    <h2>🏗️ Dashboard Generated</h2>
                    <p style="margin-top: 10px;">${dna.purpose}</p>
                    <p style="margin-top: 20px; font-size: 0.9em;">
                        Owner: ${dna.owner || 'Not specified'}<br>
                        Domain: ${dna.domain}<br>
                        Created: ${dna.created}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- ARAYA Embed -->
    <div class="araya-container">
        <button class="araya-toggle" onclick="window.open('araya-chat.html', 'araya', 'width=400,height=600')">
            🤖
        </button>
    </div>

    <script>
        // Dashboard DNA accessor
        window.getDashboardDNA = function() {
            const dnaElement = document.getElementById('dashboard-dna');
            return dnaElement ? JSON.parse(dnaElement.textContent) : null;
        };
        console.log('Dashboard DNA:', window.getDashboardDNA());
    </script>
</body>
</html>`;
}

export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        let body = {};
        if (event.body) {
            body = JSON.parse(event.body);
        }

        const action = body.action || event.queryStringParameters?.action || 'list-templates';

        switch (action) {
            case 'list-templates':
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        templates: TEMPLATES,
                        domains: DOMAINS
                    })
                };

            case 'validate':
                if (!body.dna) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'dna object required for validation' })
                    };
                }
                const validation = validateDNA(body.dna);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        validation
                    })
                };

            case 'create':
                if (!body.name || !body.purpose || !body.owner) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            error: 'Required fields: name, purpose, owner',
                            example: {
                                action: 'create',
                                name: 'My Dashboard',
                                purpose: 'What this dashboard does',
                                owner: 'Owner Name',
                                domain: '1_COMMAND',
                                template: 'cockpit'
                            }
                        })
                    };
                }

                const dna = generateDNA({
                    name: body.name,
                    purpose: body.purpose,
                    owner: body.owner,
                    realName: body.realName,
                    aliases: body.aliases || [],
                    domain: body.domain || '1_COMMAND',
                    access: body.access || 'Team',
                    syncWith: body.syncWith
                });

                // Add features based on template
                const templateType = body.template || 'cockpit';
                const template = TEMPLATES[templateType];
                if (template) {
                    dna.features = template.features;
                    if (template.lfsme_target) {
                        dna.lfsme = {
                            ...template.lfsme_target,
                            average: Object.values(template.lfsme_target).reduce((a, b) => a + b, 0) / 5
                        };
                    }
                }

                // Generate HTML
                const html = generateDashboardHTML(dna, templateType);

                // Validate the generated DNA
                const createValidation = validateDNA(dna);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        dna,
                        html,
                        validation: createValidation,
                        filename: dna.name.toUpperCase().replace(/\s+/g, '_') + '.html',
                        instructions: {
                            step1: 'Save the HTML to 100X_DEPLOYMENT/',
                            step2: 'Run: git add <filename> && git commit && git push',
                            step3: 'Dashboard will be live at: ' + dna.url
                        }
                    })
                };

            case 'get-registry':
                // Return current registry info
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        canonical_sets: {
                            AGENT_R_DOMAINS: {
                                files: Array.from({length: 8}, (_, i) =>
                                    `AGENT_R_DOMAIN_${i+1}_${Object.values(DOMAINS)[i].name}.html`
                                ),
                                status: 'GOLD'
                            },
                            COMMANDER_DOMAINS: {
                                files: Array.from({length: 8}, (_, i) =>
                                    `COMMANDER_DOMAIN_${i+1}_${Object.values(DOMAINS)[i].name}.html`
                                ),
                                status: 'GOLD'
                            }
                        },
                        domains: DOMAINS,
                        templates: Object.keys(TEMPLATES)
                    })
                };

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Unknown action',
                        available_actions: ['list-templates', 'validate', 'create', 'get-registry']
                    })
                };
        }

    } catch (error) {
        console.error('Dashboard Factory Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Dashboard Factory error',
                details: error.message
            })
        };
    }
};
