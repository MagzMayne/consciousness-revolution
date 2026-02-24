/**
 * DASHBOARD CONFIG API - Scalable Customization Engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Store & retrieve dashboard customizations in Supabase
 * Enables 1000x distribution - same template, infinite personalizations
 *
 * Flow:
 * 1. User tells Araya "make my header purple"
 * 2. Araya calls this API with { user_id, dashboard, property, value }
 * 3. Config saved to Supabase dashboard_configs table
 * 4. Dashboard loads, fetches config, applies customizations
 *
 * Supported Customizations:
 * - Colors: header, accent, background, text
 * - Text: headerText, welcomeMessage, footerText
 * - Layout: sidebarPosition, compactMode, showDomain
 * - Features: enabledWidgets[], hiddenSections[]
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

// Default config template - what every new dashboard starts with
const DEFAULT_CONFIG = {
    colors: {
        header: '#ff4444',
        accent: '#00ff88',
        background: '#1a1a2e',
        text: '#e4e4e4',
        cardBg: 'rgba(255,255,255,0.05)'
    },
    text: {
        headerText: null,  // null = use dashboard default
        welcomeMessage: null,
        footerText: null
    },
    layout: {
        sidebarPosition: 'left',
        compactMode: false,
        showDomainNav: true,
        showViewSlider: true
    },
    features: {
        enabledWidgets: ['araya', 'status', 'tasks', 'services'],
        hiddenSections: [],
        customCSS: null
    },
    branding: {
        logoUrl: null,
        faviconUrl: null,
        companyName: null
    }
};

// Editable properties map - what Araya can modify
const EDITABLE_PROPERTIES = {
    // Color shortcuts
    'header color': 'colors.header',
    'header': 'colors.header',
    'accent color': 'colors.accent',
    'accent': 'colors.accent',
    'background color': 'colors.background',
    'background': 'colors.background',
    'text color': 'colors.text',
    'card color': 'colors.cardBg',

    // Text shortcuts
    'header text': 'text.headerText',
    'title': 'text.headerText',
    'welcome message': 'text.welcomeMessage',
    'welcome': 'text.welcomeMessage',
    'footer': 'text.footerText',

    // Layout shortcuts
    'sidebar': 'layout.sidebarPosition',
    'compact': 'layout.compactMode',
    'domain nav': 'layout.showDomainNav',
    'view slider': 'layout.showViewSlider',

    // Branding
    'logo': 'branding.logoUrl',
    'company name': 'branding.companyName',
    'company': 'branding.companyName'
};

// Color name to hex map
const COLOR_MAP = {
    'red': '#ff4444',
    'blue': '#4488ff',
    'green': '#44ff88',
    'purple': '#8844ff',
    'pink': '#ff44ff',
    'orange': '#ff8844',
    'yellow': '#ffdd00',
    'cyan': '#00ffff',
    'teal': '#00ccaa',
    'gold': '#ffd700',
    'silver': '#c0c0c0',
    'white': '#ffffff',
    'black': '#000000',
    'dark': '#1a1a2e',
    'navy': '#16213e'
};

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    const params = event.queryStringParameters || {};
    const action = params.action || (event.httpMethod === 'GET' ? 'get' : 'set');

    try {
        switch (action) {
            case 'get':
                return await getConfig(params);
            case 'set':
                return await setConfig(event);
            case 'clone':
                return await cloneConfig(event);
            case 'reset':
                return await resetConfig(event);
            case 'parse':
                return await parseEditIntent(event);
            default:
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        error: 'Unknown action',
                        available: ['get', 'set', 'clone', 'reset', 'parse'],
                        examples: {
                            get: '?action=get&user_id=xxx&dashboard=COMMANDER_DOMAIN_1',
                            set: 'POST with { user_id, dashboard, property, value }',
                            clone: 'POST with { source_user_id, target_user_id, dashboard }',
                            reset: 'POST with { user_id, dashboard }',
                            parse: 'POST with { message } - parses natural language edit'
                        }
                    })
                };
        }
    } catch (error) {
        console.error('[DASHBOARD-CONFIG] Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: error.message })
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// GET CONFIG - Retrieve user's dashboard customizations
// ═══════════════════════════════════════════════════════════════
async function getConfig(params) {
    const { user_id, dashboard } = params;

    if (!user_id || !dashboard) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'user_id and dashboard required' })
        };
    }

    // Fetch from Supabase
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/dashboard_configs?user_id=eq.${user_id}&dashboard=eq.${dashboard}`,
        {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    if (!response.ok) {
        // Return defaults if no config exists
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                user_id,
                dashboard,
                config: DEFAULT_CONFIG,
                is_default: true
            })
        };
    }

    const data = await response.json();

    if (data.length === 0) {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                user_id,
                dashboard,
                config: DEFAULT_CONFIG,
                is_default: true
            })
        };
    }

    // Merge saved config with defaults (so new properties are available)
    const savedConfig = data[0].config || {};
    const mergedConfig = deepMerge(DEFAULT_CONFIG, savedConfig);

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            user_id,
            dashboard,
            config: mergedConfig,
            is_default: false,
            updated_at: data[0].updated_at
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// SET CONFIG - Update a specific property
// ═══════════════════════════════════════════════════════════════
async function setConfig(event) {
    const body = JSON.parse(event.body || '{}');
    const { user_id, dashboard, property, value, bulk_update } = body;

    if (!user_id || !dashboard) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'user_id and dashboard required' })
        };
    }

    // Get current config
    const currentResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/dashboard_configs?user_id=eq.${user_id}&dashboard=eq.${dashboard}`,
        {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    let currentConfig = { ...DEFAULT_CONFIG };
    let existingRecord = null;

    if (currentResponse.ok) {
        const data = await currentResponse.json();
        if (data.length > 0) {
            existingRecord = data[0];
            currentConfig = deepMerge(DEFAULT_CONFIG, data[0].config || {});
        }
    }

    // Apply update(s)
    if (bulk_update && typeof bulk_update === 'object') {
        // Bulk update: { 'colors.header': '#ff0000', 'text.headerText': 'My Dashboard' }
        for (const [prop, val] of Object.entries(bulk_update)) {
            setNestedProperty(currentConfig, prop, val);
        }
    } else if (property && value !== undefined) {
        // Single update
        const resolvedProperty = EDITABLE_PROPERTIES[property.toLowerCase()] || property;
        const resolvedValue = resolveValue(value);
        setNestedProperty(currentConfig, resolvedProperty, resolvedValue);
    }

    // Upsert to Supabase
    const upsertData = {
        user_id,
        dashboard,
        config: currentConfig,
        updated_at: new Date().toISOString()
    };

    const method = existingRecord ? 'PATCH' : 'POST';
    const url = existingRecord
        ? `${SUPABASE_URL}/rest/v1/dashboard_configs?id=eq.${existingRecord.id}`
        : `${SUPABASE_URL}/rest/v1/dashboard_configs`;

    const saveResponse = await fetch(url, {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(existingRecord ? { config: currentConfig, updated_at: upsertData.updated_at } : upsertData)
    });

    if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Failed to save config', details: errorText })
        };
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            user_id,
            dashboard,
            updated: bulk_update ? Object.keys(bulk_update) : [property],
            config: currentConfig,
            message: 'Dashboard customization saved! Refresh to see changes.'
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// CLONE CONFIG - Copy one user's config to another (for distribution)
// ═══════════════════════════════════════════════════════════════
async function cloneConfig(event) {
    const body = JSON.parse(event.body || '{}');
    const { source_user_id, target_user_id, dashboard, all_dashboards } = body;

    if (!source_user_id || !target_user_id) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'source_user_id and target_user_id required' })
        };
    }

    // Fetch source config(s)
    let url = `${SUPABASE_URL}/rest/v1/dashboard_configs?user_id=eq.${source_user_id}`;
    if (dashboard && !all_dashboards) {
        url += `&dashboard=eq.${dashboard}`;
    }

    const sourceResponse = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });

    if (!sourceResponse.ok) {
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Source config not found' })
        };
    }

    const sourceConfigs = await sourceResponse.json();

    if (sourceConfigs.length === 0) {
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'No configs found for source user' })
        };
    }

    // Clone each config
    const cloned = [];
    for (const config of sourceConfigs) {
        const newConfig = {
            user_id: target_user_id,
            dashboard: config.dashboard,
            config: config.config,
            cloned_from: source_user_id,
            updated_at: new Date().toISOString()
        };

        await fetch(`${SUPABASE_URL}/rest/v1/dashboard_configs`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(newConfig)
        });

        cloned.push(config.dashboard);
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            source_user_id,
            target_user_id,
            cloned_dashboards: cloned,
            message: `Cloned ${cloned.length} dashboard config(s) to new user`
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// RESET CONFIG - Restore to defaults
// ═══════════════════════════════════════════════════════════════
async function resetConfig(event) {
    const body = JSON.parse(event.body || '{}');
    const { user_id, dashboard } = body;

    if (!user_id || !dashboard) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'user_id and dashboard required' })
        };
    }

    // Delete the config (returns to default)
    await fetch(
        `${SUPABASE_URL}/rest/v1/dashboard_configs?user_id=eq.${user_id}&dashboard=eq.${dashboard}`,
        {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            user_id,
            dashboard,
            message: 'Dashboard reset to defaults'
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// PARSE EDIT INTENT - Natural language → config update
// ═══════════════════════════════════════════════════════════════
async function parseEditIntent(event) {
    const body = JSON.parse(event.body || '{}');
    const { message } = body;

    if (!message) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'message required' })
        };
    }

    const msgLower = message.toLowerCase();
    const parsed = {
        understood: false,
        property: null,
        value: null,
        confidence: 0
    };

    // Pattern: "make/change/set the [property] [to] [value]"
    const patterns = [
        /(?:make|change|set|update)\s+(?:the\s+)?(\w+(?:\s+\w+)?)\s+(?:to\s+)?(.+)/i,
        /(\w+(?:\s+\w+)?)\s+(?:should be|to)\s+(.+)/i,
        /(?:i want|let's make)\s+(?:the\s+)?(\w+(?:\s+\w+)?)\s+(.+)/i
    ];

    for (const pattern of patterns) {
        const match = msgLower.match(pattern);
        if (match) {
            const [, propRaw, valueRaw] = match;
            const prop = propRaw.trim();
            const val = valueRaw.trim();

            // Check if property is known
            if (EDITABLE_PROPERTIES[prop]) {
                parsed.understood = true;
                parsed.property = EDITABLE_PROPERTIES[prop];
                parsed.propertyFriendly = prop;
                parsed.value = resolveValue(val);
                parsed.confidence = 0.9;
                break;
            }

            // Partial match
            for (const [key, path] of Object.entries(EDITABLE_PROPERTIES)) {
                if (prop.includes(key) || key.includes(prop)) {
                    parsed.understood = true;
                    parsed.property = path;
                    parsed.propertyFriendly = key;
                    parsed.value = resolveValue(val);
                    parsed.confidence = 0.7;
                    break;
                }
            }
        }
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            original: message,
            parsed,
            editable_properties: Object.keys(EDITABLE_PROPERTIES),
            color_names: Object.keys(COLOR_MAP)
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function resolveValue(value) {
    if (typeof value !== 'string') return value;

    const lower = value.toLowerCase().trim();

    // Color name → hex
    if (COLOR_MAP[lower]) {
        return COLOR_MAP[lower];
    }

    // Boolean strings
    if (['true', 'yes', 'on', 'enable', 'show'].includes(lower)) return true;
    if (['false', 'no', 'off', 'disable', 'hide'].includes(lower)) return false;

    // Hex color validation
    if (/^#[0-9a-f]{3,6}$/i.test(value)) {
        return value;
    }

    return value;
}

function setNestedProperty(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}
