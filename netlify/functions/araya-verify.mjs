/**
 * araya-verify.mjs - ARAYA Web Verification API
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * IP Classification: TIER 2 - PROTECTED
 * Purpose: Process web verification submissions, sync to Supabase, trigger Discord role assignment
 * Contact: darrickpreble@proton.me
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Verification thresholds
const SCORE_THRESHOLD = 40;  // Minimum score for auto-approval

export async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const {
            discordUsername,
            answers,
            score,
            builderCount,
            destroyerCount,
            timestamp
        } = JSON.parse(event.body);

        // Validate required fields
        if (!discordUsername || !answers || answers.length !== 3) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Invalid verification data' })
            };
        }

        // Initialize Supabase
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

        let supabaseResult = null;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);

            // Store verification record
            const { data, error } = await supabase
                .from('verification_records')
                .insert({
                    discord_username: discordUsername,
                    question_1: answers[0],
                    question_2: answers[1],
                    question_3: answers[2],
                    consciousness_score: score,
                    builder_count: builderCount,
                    destroyer_count: destroyerCount,
                    status: score >= SCORE_THRESHOLD ? 'approved' : 'pending_review',
                    verified_at: timestamp,
                    source: 'araya_web'
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                // Continue anyway - don't fail the whole verification
            } else {
                supabaseResult = data;
            }

            // Also update/create user profile with BERGMAL score
            const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                    discord_username: discordUsername,
                    bergmal_score: score,
                    bergmal_verified: score >= SCORE_THRESHOLD,
                    verification_source: 'araya_web',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'discord_username' });

            if (profileError) {
                console.error('Profile update error:', profileError);
            }
        }

        // Trigger Discord webhook if score meets threshold
        const discordWebhookUrl = process.env.DISCORD_VERIFICATION_WEBHOOK;
        let discordNotified = false;

        if (discordWebhookUrl) {
            try {
                const webhookPayload = {
                    content: null,
                    embeds: [{
                        title: score >= SCORE_THRESHOLD ? '✅ New Verified Member' : '⏳ Verification Pending Review',
                        color: score >= SCORE_THRESHOLD ? 0x2ecc71 : 0xf1c40f,
                        fields: [
                            {
                                name: 'Discord User',
                                value: discordUsername,
                                inline: true
                            },
                            {
                                name: 'Consciousness Score',
                                value: `${score}/100`,
                                inline: true
                            },
                            {
                                name: 'Builder Alignment',
                                value: `${builderCount} resonance points`,
                                inline: true
                            },
                            {
                                name: 'Pattern Question',
                                value: answers[0].substring(0, 200) + (answers[0].length > 200 ? '...' : ''),
                                inline: false
                            },
                            {
                                name: 'Build/Protect Question',
                                value: answers[1].substring(0, 200) + (answers[1].length > 200 ? '...' : ''),
                                inline: false
                            },
                            {
                                name: 'AI Comfort Question',
                                value: answers[2].substring(0, 200) + (answers[2].length > 200 ? '...' : ''),
                                inline: false
                            }
                        ],
                        footer: {
                            text: `Source: ARAYA Web Verification | ${timestamp}`
                        }
                    }]
                };

                // Add action instructions for moderators
                if (score >= SCORE_THRESHOLD) {
                    webhookPayload.embeds[0].description = `**ACTION:** Assign @Verified role to ${discordUsername}`;
                } else {
                    webhookPayload.embeds[0].description = `**ACTION:** Manual review required - score below threshold (${SCORE_THRESHOLD})`;
                }

                const webhookResponse = await fetch(discordWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookPayload)
                });

                discordNotified = webhookResponse.ok;
            } catch (webhookError) {
                console.error('Discord webhook error:', webhookError);
            }
        }

        // Also send to radio system for team visibility
        try {
            const radioPayload = {
                channel: 'DISCORD',
                message: `[VERIFICATION] ${discordUsername} - Score: ${score}/100 - ${score >= SCORE_THRESHOLD ? 'AUTO-APPROVED' : 'NEEDS REVIEW'}`,
                source: 'araya-verify',
                priority: score >= SCORE_THRESHOLD ? 'normal' : 'high'
            };

            await fetch(`${process.env.URL || 'https://conciousnessrevolution.io'}/.netlify/functions/radio-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(radioPayload)
            });
        } catch (radioError) {
            console.error('Radio notification error:', radioError);
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                status: score >= SCORE_THRESHOLD ? 'approved' : 'pending_review',
                score,
                discordNotified,
                recordId: supabaseResult?.id || null,
                message: score >= SCORE_THRESHOLD
                    ? 'Verification approved! Your role will be assigned shortly.'
                    : 'Verification submitted for manual review.'
            })
        };

    } catch (error) {
        console.error('Verification error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Verification processing failed' })
        };
    }
}
