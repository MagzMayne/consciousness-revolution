/**
 * araya-verify.js - ARAYA Web Verification API (Vercel)
 * Converted from Netlify function format
 */

import { createClient } from '@supabase/supabase-js';

const SCORE_THRESHOLD = 40;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            discordUsername,
            answers,
            score,
            builderCount,
            destroyerCount,
            timestamp
        } = req.body;

        // Validate required fields
        if (!discordUsername || !answers || answers.length !== 3) {
            return res.status(400).json({ error: 'Invalid verification data' });
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
            } else {
                supabaseResult = data;
            }

            // Update user profile with BERGMAL score
            await supabase
                .from('user_profiles')
                .upsert({
                    discord_username: discordUsername,
                    bergmal_score: score,
                    bergmal_verified: score >= SCORE_THRESHOLD,
                    verification_source: 'araya_web',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'discord_username' });
        }

        // Trigger Discord webhook
        const discordWebhookUrl = process.env.DISCORD_VERIFICATION_WEBHOOK;
        let discordNotified = false;

        if (discordWebhookUrl) {
            try {
                const webhookPayload = {
                    content: null,
                    embeds: [{
                        title: score >= SCORE_THRESHOLD ? '✅ New Verified Member' : '⏳ Verification Pending Review',
                        description: score >= SCORE_THRESHOLD
                            ? `**ACTION:** Assign @Verified role to ${discordUsername}`
                            : `**ACTION:** Manual review required - score below threshold (${SCORE_THRESHOLD})`,
                        color: score >= SCORE_THRESHOLD ? 0x2ecc71 : 0xf1c40f,
                        fields: [
                            { name: 'Discord User', value: discordUsername, inline: true },
                            { name: 'Consciousness Score', value: `${score}/100`, inline: true },
                            { name: 'Builder Alignment', value: `${builderCount} resonance points`, inline: true },
                            { name: 'Pattern Question', value: answers[0].substring(0, 200), inline: false },
                            { name: 'Build/Protect Question', value: answers[1].substring(0, 200), inline: false },
                            { name: 'AI Comfort Question', value: answers[2].substring(0, 200), inline: false }
                        ],
                        footer: { text: `Source: ARAYA Web Verification | ${timestamp}` }
                    }]
                };

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

        return res.status(200).json({
            success: true,
            status: score >= SCORE_THRESHOLD ? 'approved' : 'pending_review',
            score,
            discordNotified,
            recordId: supabaseResult?.id || null,
            message: score >= SCORE_THRESHOLD
                ? 'Verification approved! Your role will be assigned shortly.'
                : 'Verification submitted for manual review.'
        });

    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ error: 'Verification processing failed' });
    }
}
