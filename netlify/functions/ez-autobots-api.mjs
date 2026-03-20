/**
 * ez-autobots-api.mjs — EzAutobots Backend API
 * ════════════════════════════════════════════════════════════════
 * © 2024-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════
 *
 * Core backend function for the EzAutobots autonomous workload
 * distribution system. Handles bot registration, task queuing,
 * status reporting, and developer access gating.
 *
 * ENDPOINTS (all under /.netlify/functions/ez-autobots-api):
 *   GET  /bots/list           — list available bot types
 *   GET  /bots/status         — real-time bot fleet status
 *   POST /bots/task           — submit a task to the bot fleet
 *   GET  /tasks/queue         — view the task queue (dev+)
 *   GET  /tasks/:id           — get task status
 *   POST /bots/register       — register a new bot (dev+)
 *   GET  /health              — system health check
 *   GET  /user/access         — check current user's access level
 *
 * ACCESS TIERS:
 *   PUBLIC  — any authenticated user can view bots, submit basic tasks
 *   BUILDER — level 2+ (vetted) can register bots, view queue, advanced tasks
 *   CREATOR — level 3+ can deploy new bot types, manage fleet
 *   ADMIN   — full control
 */

import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
    anonymizeIP,
    secureLog,
    errorResponse,
    successResponse
} from './utils/security.mjs';

// ── Supabase client ──────────────────────────────────────────────
function getSupabase() {
    const url  = process.env.SUPABASE_URL;
    const key  = process.env.SUPABASE_SERVICE_ROLE_SECRET
              || process.env.SUPABASE_ANON_KEY
              || process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('Supabase not configured');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// ── Access levels ────────────────────────────────────────────────
const ACCESS_LEVEL = {
    PUBLIC:  0,   // any logged-in user
    BUILDER: 2,   // vetted developer (Builder tier)
    CREATOR: 3,   // creator / forge access
    ADMIN:   10   // admin
};

// ── Catalogue of built-in bot types ─────────────────────────────
const BOT_CATALOGUE = [
    {
        id: 'content-writer',
        name: 'Content Writer Bot',
        emoji: '✍️',
        description: 'Generates blog posts, social copy, and structured content using AI.',
        domain: 'BUILD',
        access_level: ACCESS_LEVEL.PUBLIC,
        capabilities: ['article_generation', 'social_copy', 'seo_content'],
        avg_duration_s: 15,
        status: 'active'
    },
    {
        id: 'data-analyst',
        name: 'Data Analyst Bot',
        emoji: '📊',
        description: 'Runs automated data analysis, generates reports, and surfaces insights.',
        domain: 'LEARN',
        access_level: ACCESS_LEVEL.PUBLIC,
        capabilities: ['csv_analysis', 'trend_detection', 'report_generation'],
        avg_duration_s: 30,
        status: 'active'
    },
    {
        id: 'email-outreach',
        name: 'Email Outreach Bot',
        emoji: '📧',
        description: 'Personalizes and queues email campaigns to your contact list.',
        domain: 'CONNECT',
        access_level: ACCESS_LEVEL.PUBLIC,
        capabilities: ['email_compose', 'send_queue', 'follow_up'],
        avg_duration_s: 10,
        status: 'active'
    },
    {
        id: 'code-reviewer',
        name: 'Code Review Bot',
        emoji: '🔍',
        description: 'Reviews code for bugs, style issues, and security vulnerabilities.',
        domain: 'BUILD',
        access_level: ACCESS_LEVEL.BUILDER,
        capabilities: ['static_analysis', 'security_scan', 'refactor_suggestions'],
        avg_duration_s: 45,
        status: 'active'
    },
    {
        id: 'api-monitor',
        name: 'API Health Monitor',
        emoji: '🛡️',
        description: 'Continuously monitors API endpoints and alerts on failures.',
        domain: 'PROTECT',
        access_level: ACCESS_LEVEL.BUILDER,
        capabilities: ['uptime_check', 'latency_tracking', 'alert_dispatch'],
        avg_duration_s: 5,
        status: 'active'
    },
    {
        id: 'revenue-tracker',
        name: 'Revenue Tracker Bot',
        emoji: '💰',
        description: 'Aggregates and reconciles revenue across Stripe, PayPal, and other sources.',
        domain: 'GROW',
        access_level: ACCESS_LEVEL.BUILDER,
        capabilities: ['stripe_sync', 'paypal_sync', 'revenue_report'],
        avg_duration_s: 20,
        status: 'active'
    },
    {
        id: 'forge-deployer',
        name: 'Forge Deployer Bot',
        emoji: '🔧',
        description: 'Deploys new tools and pages to the Consciousness Revolution platform.',
        domain: 'BUILD',
        access_level: ACCESS_LEVEL.CREATOR,
        capabilities: ['page_deploy', 'tool_register', 'cdn_purge'],
        avg_duration_s: 60,
        status: 'active'
    },
    {
        id: 'knowledge-indexer',
        name: 'Knowledge Indexer Bot',
        emoji: '🧠',
        description: 'Scans new content and indexes it into the Brain knowledge base.',
        domain: 'LEARN',
        access_level: ACCESS_LEVEL.CREATOR,
        capabilities: ['content_crawl', 'embedding_generate', 'brain_insert'],
        avg_duration_s: 120,
        status: 'active'
    }
];

// ── Route parser ─────────────────────────────────────────────────
function parsePath(event) {
    const raw = event.path || '';
    return raw
        .replace(/^\/.netlify\/functions\/ez-autobots-api/, '')
        .replace(/^\/api\/ez-autobots-api/, '')
        || '/';
}

// ── Dedicated service-role Supabase client for auth verification ──
// We always use the SERVICE ROLE KEY for session verification so that
// Supabase validates the JWT signature server-side. Using the anon key
// would skip signature verification and allow forged tokens.
function getSupabaseServiceRole() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('Supabase service role key not configured');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// ── Verify session via Supabase HttpOnly cookie ──────────────────
async function verifySession(event) {
    const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [k, ...v] = c.trim().split('=');
            return [k.trim(), v.join('=')];
        })
    );

    const accessToken = cookies.access_token;
    if (!accessToken) return null;

    // Use service-role client so JWT signature is validated server-side
    const srClient = getSupabaseServiceRole();
    const { data, error } = await srClient.auth.getUser(accessToken);
    if (error || !data?.user) return null;

    return data.user;
}

// ── Get user profile (level, role) from public.users ────────────
async function getUserProfile(supabase, authUserId) {
    const { data, error } = await supabase
        .from('users')
        .select('discord_user_id, email, username, level_number, level_name, xp, verified')
        .eq('id', authUserId)
        .maybeSingle();

    if (error || !data) return null;
    return data;
}

// ── Determine numeric access level from profile ──────────────────
function resolveAccessLevel(profile) {
    if (!profile) return -1;
    const lvl = profile.level_number || 0;
    if (lvl >= 10) return ACCESS_LEVEL.ADMIN;
    if (lvl >= 3)  return ACCESS_LEVEL.CREATOR;
    if (lvl >= 2)  return ACCESS_LEVEL.BUILDER;
    return ACCESS_LEVEL.PUBLIC;
}

// ── Filter bot catalogue by user access level ────────────────────
function filterBots(userLevel) {
    return BOT_CATALOGUE.filter(b => b.access_level <= userLevel);
}

// ── Handlers ─────────────────────────────────────────────────────

async function handleBotsList(supabase, userLevel, origin) {
    const bots = filterBots(userLevel);
    return successResponse({ bots, total: bots.length }, origin);
}

async function handleBotsStatus(supabase, userLevel, origin) {
    // Aggregate task counts per bot from the task_queue table (if it exists)
    let taskCounts = {};
    try {
        const { data } = await supabase
            .from('ez_autobot_tasks')
            .select('bot_id, status')
            .in('status', ['pending', 'running']);

        if (data) {
            data.forEach(row => {
                if (!taskCounts[row.bot_id]) taskCounts[row.bot_id] = { pending: 0, running: 0 };
                taskCounts[row.bot_id][row.status] = (taskCounts[row.bot_id][row.status] || 0) + 1;
            });
        }
    } catch (_) { /* table may not exist yet — return catalogue defaults */ }

    const bots = filterBots(userLevel).map(b => ({
        ...b,
        pending_tasks: taskCounts[b.id]?.pending || 0,
        running_tasks: taskCounts[b.id]?.running || 0
    }));

    return successResponse({ bots }, origin);
}

async function handleSubmitTask(supabase, body, profile, userLevel, origin) {
    const { bot_id, payload, priority: rawPriority } = body || {};
    if (!bot_id) return errorResponse('bot_id is required', origin, 400);

    // Validate priority — must be an integer 1–10 when supplied
    let safePriority = 5;
    if (rawPriority !== undefined) {
        const parsed = parseInt(rawPriority, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 10) {
            return errorResponse('priority must be an integer between 1 and 10', origin, 400);
        }
        safePriority = parsed;
    }

    // Find bot in catalogue
    const bot = BOT_CATALOGUE.find(b => b.id === bot_id);
    if (!bot) return errorResponse(`Unknown bot: ${bot_id}`, origin, 404);

    // Check access
    if (bot.access_level > userLevel) {
        return errorResponse(
            `This bot requires ${bot.access_level >= ACCESS_LEVEL.CREATOR ? 'Creator' : 'Builder'} access. Complete developer vetting to unlock.`,
            origin,
            403
        );
    }

    const task = {
        bot_id,
        bot_name: bot.name,
        domain: bot.domain,
        payload: payload || {},
        priority: safePriority,
        status: 'pending',
        submitted_by: profile?.email || 'anonymous',
        user_level: userLevel,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('ez_autobot_tasks')
            .insert(task)
            .select('id')
            .single();

        if (error) {
            const isTableMissing = error.code === '42P01' || (error.message || '').includes('does not exist');
            if (isTableMissing) {
                secureLog('ez-autobots: ez_autobot_tasks table not yet created', { bot_id });
                return errorResponse(
                    'Task queue not yet initialised. Please contact an admin to run the database migration.',
                    origin,
                    503
                );
            }
            throw error;
        }

        return successResponse({
            task_id: data.id,
            bot_id,
            status: 'pending',
            message: `Task submitted to ${bot.name}. Estimated duration: ${bot.avg_duration_s}s.`
        }, origin);

    } catch (err) {
        secureLog('ez-autobots: task insert error', { error: err.message });
        return errorResponse('Failed to queue task. Please try again later.', origin, 500);
    }
}

async function handleTaskQueue(supabase, userLevel, queryParams, origin) {
    if (userLevel < ACCESS_LEVEL.BUILDER) {
        return errorResponse('Task queue access requires Builder-level vetting.', origin, 403);
    }

    const limit = Math.min(parseInt(queryParams?.limit) || 50, 200);
    const statusFilter = queryParams?.status || null;

    try {
        let query = supabase
            .from('ez_autobot_tasks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (statusFilter) query = query.eq('status', statusFilter);

        const { data, error } = await query;
        if (error) throw error;

        return successResponse({ tasks: data || [], count: (data || []).length }, origin);
    } catch (_) {
        return successResponse({ tasks: [], count: 0, note: 'Task table not yet initialised' }, origin);
    }
}

async function handleTaskStatus(supabase, taskId, origin) {
    try {
        const { data, error } = await supabase
            .from('ez_autobot_tasks')
            .select('*')
            .eq('id', taskId)
            .maybeSingle();

        if (error || !data) {
            return errorResponse('Task not found', origin, 404);
        }
        return successResponse({ task: data }, origin);
    } catch (_) {
        return errorResponse('Task not found', origin, 404);
    }
}

async function handleRegisterBot(supabase, body, profile, userLevel, origin) {
    if (userLevel < ACCESS_LEVEL.BUILDER) {
        return errorResponse('Registering bots requires Builder-level vetting. Apply at /agent-vetting-dashboard.html', origin, 403);
    }

    const { name, description, domain, capabilities, endpoint_url } = body || {};
    if (!name || !description || !domain) {
        return errorResponse('name, description, and domain are required', origin, 400);
    }

    // Custom bots submitted by developers always start at BUILDER access level
    // pending admin promotion to CREATOR if warranted.
    const bot = {
        name,
        description,
        domain,
        capabilities: Array.isArray(capabilities) ? capabilities : [],
        endpoint_url: endpoint_url || null,
        registered_by: profile?.email,
        access_level: ACCESS_LEVEL.BUILDER,
        status: 'pending_review',
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('ez_autobot_registry')
            .insert(bot)
            .select('id')
            .single();

        if (error) {
            const isTableMissing = error.code === '42P01' || (error.message || '').includes('does not exist');
            if (isTableMissing) {
                secureLog('ez-autobots: ez_autobot_registry table not yet created', { name });
                return errorResponse(
                    'Bot registry not yet initialised. Please contact an admin to run the database migration.',
                    origin,
                    503
                );
            }
            throw error;
        }

        return successResponse({
            bot_id: data.id,
            status: 'pending_review',
            message: 'Bot registered and awaiting admin review. You will be notified once approved.'
        }, origin);

    } catch (err) {
        secureLog('ez-autobots: bot register error', { error: err.message });
        return errorResponse('Failed to register bot. Please try again later.', origin, 500);
    }
}

async function handleHealth(origin) {
    return successResponse({
        status: 'ok',
        service: 'EzAutobots API',
        version: '1.0.0',
        bots_available: BOT_CATALOGUE.length,
        timestamp: new Date().toISOString()
    }, origin);
}

async function handleUserAccess(profile, userLevel, origin) {
    const levelNames = {
        [-1]: 'Unauthenticated',
        [ACCESS_LEVEL.PUBLIC]:  'Public',
        [ACCESS_LEVEL.BUILDER]: 'Builder (Vetted Developer)',
        [ACCESS_LEVEL.CREATOR]: 'Creator',
        [ACCESS_LEVEL.ADMIN]:   'Admin'
    };

    const accessible_bots = filterBots(userLevel).map(b => b.id);

    return successResponse({
        access_level:   userLevel,
        access_name:    levelNames[userLevel] || 'Public',
        user_level_number: profile?.level_number || 0,
        username:        profile?.username || null,
        accessible_bots,
        can_register_bots:  userLevel >= ACCESS_LEVEL.BUILDER,
        can_view_queue:     userLevel >= ACCESS_LEVEL.BUILDER,
        can_deploy_forge:   userLevel >= ACCESS_LEVEL.CREATOR,
        vetting_url:     '/agent-vetting-dashboard.html'
    }, origin);
}

// ── Main handler ─────────────────────────────────────────────────
export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    let supabase;
    try {
        supabase = getSupabase();
    } catch (_) {
        return errorResponse('Database not configured', origin, 503);
    }

    // Resolve current user (optional — some endpoints are public)
    let authUser = null;
    let profile  = null;
    let userLevel = ACCESS_LEVEL.PUBLIC;

    try {
        authUser  = await verifySession(event);
        if (authUser) {
            profile   = await getUserProfile(supabase, authUser.id);
            userLevel = resolveAccessLevel(profile);
        }
    } catch (_) { /* session check is best-effort */ }

    const path   = parsePath(event);
    const method = event.httpMethod;
    const query  = event.queryStringParameters || {};

    let body = {};
    try {
        if (event.body) body = JSON.parse(event.body);
    } catch (_) {}

    secureLog('ez-autobots-api', {
        path,
        method,
        userLevel,
        ip: anonymizeIP(event.headers['x-forwarded-for']?.split(',')[0] || '')
    });

    try {
        // GET /health
        if (path === '/health' && method === 'GET') {
            return await handleHealth(origin);
        }

        // GET /user/access
        if (path === '/user/access' && method === 'GET') {
            return await handleUserAccess(profile, userLevel, origin);
        }

        // GET /bots/list
        if (path === '/bots/list' && method === 'GET') {
            return await handleBotsList(supabase, userLevel, origin);
        }

        // GET /bots/status
        if (path === '/bots/status' && method === 'GET') {
            return await handleBotsStatus(supabase, userLevel, origin);
        }

        // POST /bots/task — submit a task
        if (path === '/bots/task' && method === 'POST') {
            if (!authUser) return errorResponse('Authentication required to submit tasks', origin, 401);
            return await handleSubmitTask(supabase, body, profile, userLevel, origin);
        }

        // POST /bots/register — register a new bot
        if (path === '/bots/register' && method === 'POST') {
            if (!authUser) return errorResponse('Authentication required to register bots', origin, 401);
            return await handleRegisterBot(supabase, body, profile, userLevel, origin);
        }

        // GET /tasks/queue
        if (path === '/tasks/queue' && method === 'GET') {
            return await handleTaskQueue(supabase, userLevel, query, origin);
        }

        // GET /tasks/:id
        const taskMatch = path.match(/^\/tasks\/(.+)$/);
        if (taskMatch && method === 'GET') {
            return await handleTaskStatus(supabase, taskMatch[1], origin);
        }

        return errorResponse('Endpoint not found', origin, 404);

    } catch (err) {
        secureLog('ez-autobots-api error', { error: err.message });
        return errorResponse('Internal server error', origin, 500);
    }
}
