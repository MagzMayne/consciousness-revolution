/**
 * ARAYA OPTIMIZE — Reasoning Protocol for Page Optimization
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Aggregate edit logs, user behavior, and layout preferences into
 *          a reasoning protocol that continuously optimizes all pages toward
 *          what users most want to see. Acts as an ever-evolving conglomerate
 *          intelligence across the entire platform.
 *
 * Endpoints:
 *   POST /api/araya-optimize
 *     { action: 'ingest', event, page, data, userId }
 *     { action: 'analyze', page }
 *     { action: 'recommendations', page, limit }
 *     { action: 'apply_recommendation', page, recommendationId }
 *     { action: 'global_trends' }
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_ANON_KEY;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// ─── Supabase helpers ────────────────────────────────────────────────────────

async function supabaseInsert(table, row) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(row)
        });
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data[0] : data;
    } catch { return null; }
}

async function supabaseSelect(table, filter = '') {
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
            headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
}

// ─── AI-powered reasoning ─────────────────────────────────────────────────────

async function callReasoningAI(prompt) {
    // Try Grok first for enhanced reasoning, fall back to DeepSeek
    const providers = [];
    if (GROK_API_KEY) providers.push({ name: 'grok', url: 'https://api.x.ai/v1', key: GROK_API_KEY, model: 'grok-3-latest' });
    if (DEEPSEEK_API_KEY) providers.push({ name: 'deepseek', url: 'https://api.deepseek.com/v1', key: DEEPSEEK_API_KEY, model: 'deepseek-chat' });

    for (const provider of providers) {
        try {
            const res = await fetch(`${provider.url}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` },
                body: JSON.stringify({
                    model: provider.model,
                    messages: [
                        { role: 'system', content: 'You are the ARAYA Optimization Protocol. Analyze user behavior data and produce concise, actionable JSON recommendations to improve page experience. Always respond with valid JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 1000,
                    temperature: 0.3
                })
            });
            if (res.ok) {
                const data = await res.json();
                return data.choices[0].message.content;
            }
        } catch (e) {
            console.error(`[OPTIMIZE] ${provider.name} error:`, e.message);
        }
    }
    return null;
}

// ─── Trend aggregation ────────────────────────────────────────────────────────

function aggregateEditTrends(logs) {
    const selectorFreq = {};
    const propertyFreq = {};
    const valueFreq = {};

    for (const log of logs) {
        selectorFreq[log.selector] = (selectorFreq[log.selector] || 0) + 1;
        propertyFreq[log.property] = (propertyFreq[log.property] || 0) + 1;
        const key = `${log.property}:${log.value}`;
        valueFreq[key] = (valueFreq[key] || 0) + 1;
    }

    const topSelectors = Object.entries(selectorFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topProperties = Object.entries(propertyFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topValues = Object.entries(valueFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { topSelectors, topProperties, topValues, totalEdits: logs.length };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    let body = {};
    try {
        body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : (event.queryStringParameters || {});
    } catch {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { action = 'analyze', page, userId, data: eventData, event: eventType, limit = 10, recommendationId } = body;

    switch (action) {

        // ── INGEST BEHAVIOR EVENT ────────────────────────────────────────────
        case 'ingest': {
            if (!eventType) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'event type required' }) };
            }

            const row = {
                event_type: eventType,
                page: page || 'unknown',
                user_id: userId || 'anonymous',
                data: (typeof eventData === 'object' && eventData !== null) ? eventData : ((() => { try { return JSON.parse(eventData || '{}'); } catch { return {}; } })()),
                created_at: new Date().toISOString()
            };

            const saved = await supabaseInsert('araya_behavior_logs', row);

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, logged: Boolean(saved), id: saved?.id })
            };
        }

        // ── ANALYZE PAGE TRENDS ──────────────────────────────────────────────
        case 'analyze': {
            if (!page) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'page required' }) };
            }

            const [editLogs, behaviorLogs] = await Promise.all([
                supabaseSelect('araya_edit_logs', `page=eq.${encodeURIComponent(page)}&limit=200`),
                supabaseSelect('araya_behavior_logs', `page=eq.${encodeURIComponent(page)}&limit=200`)
            ]);

            const trends = aggregateEditTrends(editLogs);

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({
                    page,
                    trends,
                    behaviorEvents: behaviorLogs.length,
                    analysis: {
                        totalEdits: editLogs.length,
                        uniqueUsers: new Set(editLogs.map(l => l.user_id)).size,
                        mostEditedSelectors: trends.topSelectors,
                        popularProperties: trends.topProperties,
                        popularValues: trends.topValues
                    }
                })
            };
        }

        // ── GET AI-POWERED RECOMMENDATIONS ───────────────────────────────────
        case 'recommendations': {
            if (!page) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'page required' }) };
            }

            const editLogs = await supabaseSelect('araya_edit_logs', `page=eq.${encodeURIComponent(page)}&limit=200`);
            const trends = aggregateEditTrends(editLogs);

            const prompt = `
Analyze these user edit patterns for the page "${page}":
- Total edits: ${trends.totalEdits}
- Most edited CSS selectors: ${JSON.stringify(trends.topSelectors)}
- Most changed CSS properties: ${JSON.stringify(trends.topProperties)}
- Most popular CSS values: ${JSON.stringify(trends.topValues)}

Generate up to ${limit} actionable recommendations to optimize this page's default styling based on what users prefer.
Respond with a JSON array of recommendation objects:
[{"id": "rec-1", "title": "...", "selector": "...", "property": "...", "value": "...", "reason": "...", "popularityScore": 0-100}]`;

            const aiResponse = await callReasoningAI(prompt);
            let recommendations = [];
            if (aiResponse) {
                try {
                    // Extract JSON array from response
                    const match = aiResponse.match(/\[[\s\S]*?\]/);
                    if (match) recommendations = JSON.parse(match[0]);
                } catch (e) {
                    console.error('[OPTIMIZE] Failed to parse AI recommendations:', e.message);
                }
            }

            // Fallback: derive from trends if AI unavailable
            if (!recommendations.length && trends.topValues.length) {
                recommendations = trends.topValues.slice(0, Number(limit)).map(([kv, count], i) => {
                    const [prop, val] = kv.split(':');
                    const selector = trends.topSelectors[0]?.[0] || 'body';
                    return {
                        id: `trend-rec-${i}`,
                        title: `Apply popular ${prop} setting`,
                        selector,
                        property: prop,
                        value: val,
                        reason: `Applied by ${count} users — most popular choice`,
                        popularityScore: Math.round((count / trends.totalEdits) * 100)
                    };
                });
            }

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({ page, recommendations, generatedAt: new Date().toISOString() })
            };
        }

        // ── GLOBAL TRENDS ACROSS ALL PAGES ───────────────────────────────────
        case 'global_trends': {
            const [allEdits, allBehavior] = await Promise.all([
                supabaseSelect('araya_edit_logs', 'limit=500&order=created_at.desc'),
                supabaseSelect('araya_behavior_logs', 'limit=500&order=created_at.desc')
            ]);

            // Page popularity
            const pageFreq = {};
            for (const log of allEdits) {
                pageFreq[log.page] = (pageFreq[log.page] || 0) + 1;
            }
            const popularPages = Object.entries(pageFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

            const globalTrends = aggregateEditTrends(allEdits);

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({
                    totalEdits: allEdits.length,
                    totalBehaviorEvents: allBehavior.length,
                    popularPages,
                    globalTrends,
                    generatedAt: new Date().toISOString()
                })
            };
        }

        default:
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }
};

export const config = {
    path: '/api/araya-optimize'
};
