/**
 * verify-identity.mjs - Consciousness Revolution
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * Stage 2 Identity Verification - Handles builder verification submissions
 * Stores verified member data in Supabase with encrypted image storage
 *
 * UPDATED 2026-02-25: ID photos now OPTIONAL, added 3-tier track system
 *
 * IP Classification: TIER 1 - CRITICAL (contains PII handling)
 * Contact: darrickpreble@proton.me
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    validateInput,
    anonymizeIP,
    secureLog,
    successResponse,
    errorResponse
} from './utils/security.mjs';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        throw new Error('Supabase configuration missing');
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// Upload base64 image to Supabase Storage (OPTIONAL - may be null)
async function uploadImage(supabase, base64Data, folder, filename) {
    if (!base64Data) return null; // Images are optional

    try {
        // Extract base64 content and mime type
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            secureLog('Invalid base64 format, skipping image', { folder });
            return null;
        }

        const mimeType = matches[1];
        const base64Content = matches[2];
        const buffer = Buffer.from(base64Content, 'base64');

        // Determine file extension
        const ext = mimeType.split('/')[1] || 'jpg';
        const fullPath = `${folder}/${filename}.${ext}`;

        const { data, error } = await supabase.storage
            .from('verification-images')
            .upload(fullPath, buffer, {
                contentType: mimeType,
                upsert: true
            });

        if (error) {
            secureLog('Image upload error', { error: error.message, folder });
            return null; // Don't fail - images are optional
        }

        return fullPath;
    } catch (error) {
        secureLog('Image upload exception', { error: error.message });
        return null; // Don't fail - images are optional
    }
}

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    // Only POST allowed
    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', 405, origin);
    }

    // Rate limiting - 5 submissions per hour per IP
    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    const rateLimitResult = checkRateLimit(ip, 5, 3600000, 'verify-identity');
    if (!rateLimitResult.allowed) {
        secureLog('Rate limit exceeded', { anonIP: anonymizeIP(ip) });
        return errorResponse('Too many verification attempts. Please try again later.', 429, origin);
    }

    try {
        const body = JSON.parse(event.body);

        // ═══════════════════════════════════════════════════════════════════
        // VALIDATION - Only core fields required, everything else OPTIONAL
        // ═══════════════════════════════════════════════════════════════════
        const required = ['full_name', 'email', 'discord_username'];
        for (const field of required) {
            if (!body[field]) {
                return errorResponse(`Missing required field: ${field}`, 400, origin);
            }
        }

        // Track selection: standard (free), priority ($29), premium ($99)
        // Frontend sends 'verification_track', accept both for compatibility
        const validTracks = ['standard', 'priority', 'premium'];
        const track = body.verification_track || body.track || 'standard';
        if (!validTracks.includes(track)) {
            return errorResponse('Invalid verification track', 400, origin);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return errorResponse('Invalid email format', 400, origin);
        }

        // Initialize Supabase
        const supabase = getSupabaseAdmin();

        // Check for duplicate Discord username or email
        const { data: existing } = await supabase
            .from('verified_members')
            .select('id')
            .or(`discord_username.eq.${body.discord_username},email.eq.${body.email.toLowerCase()}`)
            .single();

        if (existing) {
            return errorResponse('This Discord username or email has already been submitted for verification', 409, origin);
        }

        // Generate unique ID for file storage
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // ═══════════════════════════════════════════════════════════════════
        // OPTIONAL IMAGE UPLOADS - Don't fail if not provided
        // ═══════════════════════════════════════════════════════════════════
        const idPhotoUrl = await uploadImage(supabase, body.id_photo_base64, 'id-photos', uniqueId);
        const selfieUrl = await uploadImage(supabase, body.selfie_base64, 'selfies', uniqueId);

        // Clean Instagram handle if provided
        let instagram = null;
        if (body.instagram) {
            instagram = body.instagram.trim();
            if (instagram && !instagram.startsWith('@')) {
                instagram = '@' + instagram;
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // INSERT INTO DATABASE
        // ═══════════════════════════════════════════════════════════════════
        const { data: member, error: insertError } = await supabase
            .from('verified_members')
            .insert({
                full_name: body.full_name.trim(),
                email: body.email.toLowerCase().trim(),
                phone: body.phone || null,
                address_city: body.city?.trim() || null,
                address_state: body.state?.trim() || null,
                address_country: body.country || 'USA',
                discord_username: body.discord_username.trim(),
                instagram_handle: instagram,
                other_social: body.other_social || null,
                id_photo_url: idPhotoUrl,
                selfie_url: selfieUrl,
                how_found_us: body.how_found || null,
                what_building: body.what_building?.trim() || null,
                agreement_signed: body.agreement_signed === true,
                agreement_signed_at: body.agreement_signed ? new Date().toISOString() : null,
                verification_status: 'pending',
                current_tier: 'SEED',
                xp_total: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            secureLog('Database insert failed', { error: insertError.message });
            return errorResponse('Failed to save verification data. Please try again.', 500, origin);
        }

        secureLog('Verification submitted', {
            discord: body.discord_username,
            track: track,
            hasIdPhoto: !!idPhotoUrl,
            hasSelfie: !!selfieUrl,
            anonIP: anonymizeIP(ip)
        });

        // Send notification to Commander (optional - via Discord webhook)
        try {
            await notifyCommander(body, track);
        } catch (notifyError) {
            // Non-critical - log but don't fail
            secureLog('Commander notification failed', { error: notifyError.message });
        }

        // ═══════════════════════════════════════════════════════════════════
        // TRACK-SPECIFIC RESPONSE
        // ═══════════════════════════════════════════════════════════════════
        const trackMessages = {
            premium: {
                message: 'Premium verification submitted!',
                eta: 'Within 24 hours',
                next_steps: 'You are in the priority queue. Watch Discord for your SEEDLING role upgrade!'
            },
            priority: {
                message: 'Priority verification submitted!',
                eta: 'Within 48 hours',
                next_steps: 'You are ahead of the queue. Watch Discord for your SEEDLING role upgrade!'
            },
            standard: {
                message: 'Verification submitted successfully!',
                eta: 'Within 7 days',
                next_steps: 'Your submission is in queue. Watch Discord for your SEEDLING role upgrade!'
            }
        };

        const response = trackMessages[track];

        return successResponse({
            success: true,
            message: response.message,
            status: 'pending',
            track: track,
            estimated_review_time: response.eta,
            next_steps: response.next_steps,
            has_id_photo: !!idPhotoUrl,
            has_selfie: !!selfieUrl
        }, origin);

    } catch (error) {
        secureLog('Verification error', { error: error.message });
        return errorResponse('An error occurred processing your verification', 500, origin);
    }
}

// Send notification to Commander about new verification
async function notifyCommander(data, track) {
    const discordWebhook = process.env.DISCORD_WEBHOOK_ALERTS;
    if (!discordWebhook) return;

    const trackEmojis = {
        premium: '💎',
        priority: '⚡',
        standard: '📝'
    };

    const trackColors = {
        premium: 0xffd700, // Gold
        priority: 0x00ff88, // Green
        standard: 0x3498db  // Blue
    };

    const embed = {
        title: `${trackEmojis[track]} New ${track.charAt(0).toUpperCase() + track.slice(1)} Verification`,
        color: trackColors[track],
        fields: [
            { name: 'Name', value: data.full_name || 'Not provided', inline: true },
            { name: 'Discord', value: data.discord_username || 'Not provided', inline: true },
            { name: 'Email', value: data.email || 'Not provided', inline: true },
            { name: 'Track', value: track.toUpperCase(), inline: true },
            { name: 'ID Photo', value: data.id_photo_base64 ? 'Provided' : 'Not provided', inline: true },
            { name: 'Selfie', value: data.selfie_base64 ? 'Provided' : 'Not provided', inline: true }
        ],
        footer: { text: 'Review at /admin-verification' },
        timestamp: new Date().toISOString()
    };

    // Add optional fields if provided
    if (data.instagram) {
        embed.fields.push({ name: 'Instagram', value: data.instagram, inline: true });
    }
    if (data.city && data.state) {
        embed.fields.push({ name: 'Location', value: `${data.city}, ${data.state}`, inline: true });
    }
    if (data.what_building) {
        embed.fields.push({
            name: 'Building',
            value: data.what_building.substring(0, 200) + (data.what_building.length > 200 ? '...' : ''),
            inline: false
        });
    }

    await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    });
}
