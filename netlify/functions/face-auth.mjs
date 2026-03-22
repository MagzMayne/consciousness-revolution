/**
 * face-auth.mjs — Consciousness Revolution
 * ═══════════════════════════════════════════════════════════════════════════
 * Facial recognition authentication backend.
 *
 * Actions (POST body `action` field, or ?action= query):
 *   enroll  — store a face descriptor for the authenticated user
 *   verify  — compare an incoming face descriptor against enrolled ones
 *             and return session info on match
 *   status  — check whether the current user has an enrolled face
 *   log     — write a face-auth audit event (internal use)
 *
 * Face descriptors are 128-element float arrays produced by face-api.js
 * (SSD MobileNet v1 + FaceNet). Match threshold: Euclidean distance < 0.55.
 *
 * Cross-site usage: barbrickdesign.github.io is an allowed origin; all
 * face auth calls from that site also work against this function.
 *
 * Endpoint: POST/GET /api/face-auth
 * ═══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    anonymizeIP,
    secureLog,
    successResponse,
    errorResponse
} from './utils/security.mjs';

// ── Config ────────────────────────────────────────────────────────────────
const MATCH_THRESHOLD = 0.55;   // Euclidean distance (face-api.js default 0.6)
const DESCRIPTOR_LEN  = 128;    // SSD MobileNet v1 / FaceNet output dims

// ── Supabase ──────────────────────────────────────────────────────────────
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET
        || process.env.SUPABASE_SERVICE_KEY
        || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase configuration missing');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// ── Parse cookies ─────────────────────────────────────────────────────────
function parseCookies(header) {
    if (!header) return {};
    return Object.fromEntries(
        header.split(';').map(c => {
            const [k, ...v] = c.trim().split('=');
            return [k.trim(), v.join('=')];
        })
    );
}

// ── Session verification helper ───────────────────────────────────────────
async function getUserFromSession(event, supabase) {
    const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
    const token = cookies.access_token;
    if (!token) return null;
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
}

// ── Euclidean distance between two float arrays ───────────────────────────
function euclidean(a, b) {
    if (a.length !== b.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

// ── Validate descriptor array ─────────────────────────────────────────────
function validateDescriptor(d) {
    return (
        Array.isArray(d) &&
        d.length === DESCRIPTOR_LEN &&
        d.every(v => typeof v === 'number' && isFinite(v))
    );
}

// ── Audit logger (fire-and-forget) ────────────────────────────────────────
async function logEvent(supabase, {
    user_id = null, action, status, site_origin = null,
    ip = null, distance = null, metadata = null
}) {
    try {
        await supabase.from('face_auth_logs').insert({
            user_id,
            action,
            status,
            site_origin,
            ip_address_hash: ip ? anonymizeIP(ip) : null,
            distance,
            metadata,
            created_at: new Date().toISOString()
        });
    } catch (e) {
        secureLog('face-auth log error', { error: e.message });
    }
}

// ═══════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * ENROLL — store descriptor for authenticated user.
 * Requires a valid session cookie (user must be logged in via
 * password/OAuth first before enrolling face).
 */
async function handleEnroll(event, supabase, ip, origin) {
    const user = await getUserFromSession(event, supabase);
    if (!user) {
        return errorResponse('Authentication required to enroll face', origin, 401);
    }

    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch { return errorResponse('Invalid JSON', origin, 400); }

    const { descriptor } = body;
    if (!validateDescriptor(descriptor)) {
        return errorResponse(
            `descriptor must be a ${DESCRIPTOR_LEN}-element float array`,
            origin, 400
        );
    }

    // Deactivate any existing enrollment
    await supabase
        .from('face_auth_descriptors')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

    // Insert new descriptor
    const { error } = await supabase.from('face_auth_descriptors').insert({
        user_id:        user.id,
        descriptor,
        model_version:  body.model_version || 'ssd_mobilenetv1',
        enrolled_at:    new Date().toISOString(),
        is_active:      true,
        site_origin:    origin || null,
        ip_address_hash: anonymizeIP(ip)
    });

    if (error) {
        secureLog('face-auth enroll DB error', { error: error.message });
        return errorResponse('Failed to store face data', origin, 500);
    }

    await logEvent(supabase, {
        user_id: user.id, action: 'enroll', status: 'success',
        site_origin: origin, ip
    });

    secureLog('Face enrolled', { userId: user.id });
    return successResponse({ enrolled: true, message: 'Face enrolled successfully' }, origin);
}

/**
 * VERIFY — compare incoming descriptor against stored ones.
 * On match, responds with user profile so the client can treat
 * it as a login (the actual session cookie was set during the
 * prior email/OAuth login for enrollment, or the caller must
 * pass the email to look up the right user).
 */
async function handleVerify(event, supabase, ip, origin) {
    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch { return errorResponse('Invalid JSON', origin, 400); }

    const { descriptor, email } = body;
    if (!validateDescriptor(descriptor)) {
        return errorResponse(
            `descriptor must be a ${DESCRIPTOR_LEN}-element float array`,
            origin, 400
        );
    }

    // Look up candidates: if email provided, scope to that user; otherwise
    // compare against all active enrollments (suitable for small user bases).
    let query = supabase
        .from('face_auth_descriptors')
        .select('user_id, descriptor')
        .eq('is_active', true);

    if (email) {
        // Resolve user_id from email
        const { data: userRow } = await supabase
            .from('user_foundations')
            .select('user_id')
            .ilike('email', email.toLowerCase().trim())
            .maybeSingle();

        if (!userRow) {
            await logEvent(supabase, {
                action: 'verify', status: 'no_enrollment',
                site_origin: origin, ip, metadata: { hint: 'email_not_found' }
            });
            return errorResponse('No face enrollment found', origin, 404);
        }
        query = query.eq('user_id', userRow.user_id);
    }

    const { data: rows, error: fetchErr } = await query;

    if (fetchErr || !rows || rows.length === 0) {
        await logEvent(supabase, {
            action: 'verify', status: 'no_enrollment',
            site_origin: origin, ip
        });
        return errorResponse('No face enrollment found', origin, 404);
    }

    // Find best match
    let bestDist = Infinity;
    let bestUserId = null;
    for (const row of rows) {
        const stored = Array.isArray(row.descriptor)
            ? row.descriptor
            : (row.descriptor?.descriptor || []);
        const d = euclidean(descriptor, stored);
        if (d < bestDist) {
            bestDist = d;
            bestUserId = row.user_id;
        }
    }

    const matched = bestDist < MATCH_THRESHOLD;

    await logEvent(supabase, {
        user_id: matched ? bestUserId : null,
        action: 'verify',
        status: matched ? 'success' : 'failure',
        site_origin: origin, ip,
        distance: bestDist,
        metadata: { threshold: MATCH_THRESHOLD }
    });

    if (!matched) {
        secureLog('Face verify failed', { dist: bestDist });
        return {
            statusCode: 401,
            headers: getSecureCORSHeaders(origin),
            body: JSON.stringify({ success: false, error: 'Face not recognized' })
        };
    }

    // Fetch user profile
    const { data: foundation } = await supabase
        .from('user_foundations')
        .select('*')
        .eq('user_id', bestUserId)
        .maybeSingle();

    const { data: authUser } = await supabase.auth.admin.getUserById(bestUserId);

    secureLog('Face verify success', { userId: bestUserId, dist: bestDist });

    return successResponse({
        matched: true,
        distance: bestDist,
        user: {
            id: bestUserId,
            email: authUser?.user?.email || foundation?.email || '',
            full_name: foundation?.full_name || '',
            account_tier: foundation?.account_tier || 'free',
            is_admin: foundation?.is_admin || false,
            r3d3_access_enabled: foundation?.r3d3_access_enabled || false
        }
    }, origin);
}

/**
 * STATUS — check if the current (or specified) user has an active enrollment.
 */
async function handleStatus(event, supabase, ip, origin) {
    const user = await getUserFromSession(event, supabase);
    const userId = user?.id || event.queryStringParameters?.user_id;

    if (!userId) {
        return errorResponse('Authentication required', origin, 401);
    }

    const { data, error } = await supabase
        .from('face_auth_descriptors')
        .select('enrolled_at, site_origin')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

    return successResponse({
        enrolled: !!data && !error,
        enrolled_at: data?.enrolled_at || null,
        enrolled_site: data?.site_origin || null
    }, origin);
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    if (event.httpMethod === 'OPTIONS') return handlePreflight(origin);
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    const action = event.queryStringParameters?.action
        || JSON.parse(event.body || '{}')?.action
        || '';

    // Rate limiting: 20 face-auth attempts per 10 minutes per IP
    const rl = checkRateLimit(`face_auth_${anonymizeIP(ip)}`, 20, 600000);
    if (!rl.allowed) {
        return errorResponse('Too many face auth requests. Please try again later.', origin, 429);
    }

    try {
        const supabase = getSupabase();

        switch (action) {
            case 'enroll': return handleEnroll(event, supabase, ip, origin);
            case 'verify': return handleVerify(event, supabase, ip, origin);
            case 'status': return handleStatus(event, supabase, ip, origin);
            default:
                return errorResponse('Unknown action. Use enroll|verify|status', origin, 400);
        }
    } catch (err) {
        secureLog('face-auth error', { error: err.message });
        return errorResponse('Server error', origin, 500);
    }
}
