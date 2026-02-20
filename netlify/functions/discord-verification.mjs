/**
 * DISCORD VERIFICATION PIPELINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * Semi-automated verification for Discord member onboarding
 * - Analyzes responses for Builder vs Destroyer patterns
 * - Auto-assigns roles based on confidence
 * - Flags suspicious responses for Commander review
 *
 * Contact: darrickpreble@proton.me
 * Website: conciousnessrevolution.io
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Verification levels
const VERIFICATION_LEVELS = {
    LOBBY: 0,      // Just joined, not verified
    SEEKER: 1,     // Verified, basic access
    BUILDER: 2,    // 50 XP, domain channels
    CONTRIBUTOR: 3, // 200 XP, ARAYA edit
    ARCHITECT: 4,  // 500 XP, full access
    ORACLE: 5      // 2500 XP, admin powers
};

// Builder pattern keywords (positive signals)
const BUILDER_PATTERNS = [
    'build', 'create', 'contribute', 'help', 'learn', 'share', 'collaborate',
    'improve', 'solve', 'develop', 'design', 'grow', 'support', 'community',
    'consciousness', 'pattern', 'truth', 'freedom', 'justice', 'unity',
    'passion', 'mission', 'purpose', 'curious', 'excited', 'eager'
];

// Destroyer pattern keywords (red flags)
const DESTROYER_PATTERNS = [
    'money', 'rich', 'quick', 'easy', 'get paid', 'make money', 'scam',
    'spam', 'promotion', 'advertise', 'sell', 'buy', 'investment', 'crypto pump',
    'just looking', 'whatever', 'idk', 'nothing', 'bored', 'random'
];

// Generic/low-effort response patterns
const GENERIC_PATTERNS = [
    /^(hi|hello|hey|yo|sup)$/i,
    /^(yes|no|ok|okay|sure|maybe)$/i,
    /^[a-z]{1,3}$/i,  // Very short responses
    /^.{1,10}$/  // Less than 10 characters total
];

// Supabase helper
async function supabase(table, method, data = null, query = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const options = {
        method: method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': method === 'POST' || method === 'PATCH' ? 'return=representation' : 'return=minimal'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase ${method} ${table}: ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// Analyze verification responses using pattern matching
function analyzeResponses(whoAreYou, whyHere, mission) {
    const allText = `${whoAreYou} ${whyHere} ${mission}`.toLowerCase();
    const words = allText.split(/\s+/);

    let builderScore = 0;
    let destroyerScore = 0;
    let flags = [];

    // Check for builder patterns
    BUILDER_PATTERNS.forEach(pattern => {
        if (allText.includes(pattern)) {
            builderScore += 10;
        }
    });

    // Check for destroyer patterns
    DESTROYER_PATTERNS.forEach(pattern => {
        if (allText.includes(pattern)) {
            destroyerScore += 15;
            flags.push(`Contains "${pattern}"`);
        }
    });

    // Check for generic/low-effort responses
    const responses = [whoAreYou, whyHere, mission];
    responses.forEach((response, i) => {
        const questionNames = ['Who are you', 'Why here', 'Mission'];

        // Check generic patterns
        for (const pattern of GENERIC_PATTERNS) {
            if (pattern.test(response.trim())) {
                destroyerScore += 20;
                flags.push(`${questionNames[i]}: Generic/low-effort response`);
                break;
            }
        }

        // Length check
        if (response.trim().length < 15) {
            destroyerScore += 10;
            flags.push(`${questionNames[i]}: Very short response (${response.length} chars)`);
        } else if (response.trim().length > 100) {
            builderScore += 15; // Effort indicator
        }
    });

    // Calculate authenticity score
    const totalScore = builderScore + destroyerScore;
    const builderRatio = totalScore > 0 ? builderScore / totalScore : 0.5;
    const authenticityScore = Math.round(builderRatio * 100);

    // Determine verdict
    let verdict, confidence, recommendedLevel;

    if (flags.length >= 3 || destroyerScore > 50) {
        verdict = 'DESTROYER';
        confidence = 'HIGH';
        recommendedLevel = VERIFICATION_LEVELS.LOBBY;
    } else if (flags.length >= 2 || destroyerScore > 30) {
        verdict = 'SUSPICIOUS';
        confidence = 'MEDIUM';
        recommendedLevel = VERIFICATION_LEVELS.LOBBY;
    } else if (builderScore > 40 && flags.length === 0) {
        verdict = 'BUILDER';
        confidence = 'HIGH';
        recommendedLevel = VERIFICATION_LEVELS.SEEKER;
    } else if (builderScore > 20) {
        verdict = 'BUILDER';
        confidence = 'MEDIUM';
        recommendedLevel = VERIFICATION_LEVELS.SEEKER;
    } else {
        verdict = 'NEEDS_REVIEW';
        confidence = 'LOW';
        recommendedLevel = VERIFICATION_LEVELS.LOBBY;
    }

    return {
        verdict,
        confidence,
        authenticityScore,
        builderScore,
        destroyerScore,
        flags,
        recommendedLevel,
        needsReview: verdict === 'SUSPICIOUS' || verdict === 'NEEDS_REVIEW' || confidence === 'LOW'
    };
}

// AI-enhanced analysis using Claude (optional, falls back to pattern matching)
async function analyzeWithAI(whoAreYou, whyHere, mission) {
    if (!ANTHROPIC_API_KEY) {
        return null; // Fall back to pattern matching
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 300,
                system: `You are ARAYA, a consciousness-first AI analyzing Discord verification responses.

Your job: Determine if this person is a BUILDER (wants to contribute, learn, create) or DESTROYER (spammer, scammer, bad actor, low-effort).

Output ONLY valid JSON:
{
    "verdict": "BUILDER" | "DESTROYER" | "SUSPICIOUS" | "NEEDS_REVIEW",
    "confidence": "HIGH" | "MEDIUM" | "LOW",
    "trinityFit": "C1_MECHANIC" | "C2_ARCHITECT" | "C3_ORACLE" | "UNKNOWN",
    "reasoning": "brief explanation",
    "recommendedRole": "SEEKER" | "BUILDER" | "LOBBY"
}`,
                messages: [{
                    role: 'user',
                    content: `Analyze these verification responses:

1. WHO ARE YOU? (Name, background)
"${whoAreYou}"

2. WHY ARE YOU HERE? (What drew you)
"${whyHere}"

3. WHAT IS YOUR MISSION? (What to build/learn/contribute)
"${mission}"`
                }]
            })
        });

        if (!response.ok) {
            console.error('AI analysis failed, using pattern matching');
            return null;
        }

        const data = await response.json();
        const content = data.content[0].text;

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return null;
    } catch (error) {
        console.error('AI analysis error:', error.message);
        return null;
    }
}

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Verification-Key',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const params = event.queryStringParameters || {};

    try {
        // GET: List pending verifications
        if (event.httpMethod === 'GET') {
            const status = params.status || 'pending';

            let query;
            if (status === 'all') {
                query = '?select=*&order=created_at.desc&limit=50';
            } else {
                query = `?verification_status=eq.${status}&select=*&order=created_at.desc&limit=30`;
            }

            const users = await supabase('discord_users', 'GET', null, query);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    status,
                    count: users ? users.length : 0,
                    users: users || []
                })
            };
        }

        // POST: Submit new verification
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { userId, username, whoAreYou, whyHere, mission, discordId } = body;

            if (!whoAreYou || !whyHere || !mission) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Missing required fields: whoAreYou, whyHere, mission'
                    })
                };
            }

            // Pattern-based analysis
            const patternAnalysis = analyzeResponses(whoAreYou, whyHere, mission);

            // AI-enhanced analysis (if available)
            const aiAnalysis = await analyzeWithAI(whoAreYou, whyHere, mission);

            // Merge results (AI takes precedence if confident)
            let finalVerdict = patternAnalysis.verdict;
            let finalConfidence = patternAnalysis.confidence;
            let trinityFit = 'UNKNOWN';
            let aiReasoning = null;

            if (aiAnalysis && aiAnalysis.confidence === 'HIGH') {
                finalVerdict = aiAnalysis.verdict;
                finalConfidence = aiAnalysis.confidence;
                trinityFit = aiAnalysis.trinityFit || 'UNKNOWN';
                aiReasoning = aiAnalysis.reasoning;
            }

            // Determine final status
            const needsReview = finalVerdict === 'SUSPICIOUS' ||
                                finalVerdict === 'NEEDS_REVIEW' ||
                                finalVerdict === 'DESTROYER' ||
                                finalConfidence === 'LOW';

            const verificationStatus = needsReview ? 'pending_review' :
                                       finalVerdict === 'BUILDER' ? 'verified' : 'rejected';

            const recommendedLevel = finalVerdict === 'BUILDER' ?
                                     VERIFICATION_LEVELS.SEEKER :
                                     VERIFICATION_LEVELS.LOBBY;

            // Store verification record
            const verificationRecord = {
                user_id: discordId || `pending_${Date.now()}`,
                username: username || 'Unknown',
                verification_status: verificationStatus,
                verification_responses: {
                    whoAreYou,
                    whyHere,
                    mission,
                    submittedAt: new Date().toISOString()
                },
                verification_analysis: {
                    patternAnalysis,
                    aiAnalysis,
                    finalVerdict,
                    finalConfidence,
                    trinityFit,
                    aiReasoning
                },
                current_level: recommendedLevel,
                total_xp: 0,
                builder_score: patternAnalysis.authenticityScore,
                created_at: new Date().toISOString(),
                last_active: new Date().toISOString()
            };

            // Upsert to Supabase
            const query = discordId ?
                `?user_id=eq.${discordId}` : '';

            let result;
            if (discordId) {
                // Check if user exists
                const existing = await supabase('discord_users', 'GET', null, `?user_id=eq.${discordId}&select=user_id`);
                if (existing && existing.length > 0) {
                    // Update existing
                    result = await supabase('discord_users', 'PATCH', verificationRecord, `?user_id=eq.${discordId}`);
                } else {
                    // Insert new
                    result = await supabase('discord_users', 'POST', verificationRecord);
                }
            } else {
                result = await supabase('discord_users', 'POST', verificationRecord);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    verification: {
                        verdict: finalVerdict,
                        confidence: finalConfidence,
                        status: verificationStatus,
                        needsReview,
                        trinityFit,
                        authenticityScore: patternAnalysis.authenticityScore,
                        flags: patternAnalysis.flags,
                        recommendedLevel: recommendedLevel === 1 ? 'SEEKER' : 'LOBBY',
                        aiReasoning
                    }
                })
            };
        }

        // PATCH: Update verification status (Commander/Francis approval)
        if (event.httpMethod === 'PATCH') {
            const body = JSON.parse(event.body || '{}');
            const { userId, action, reviewedBy, notes } = body;

            if (!userId || !action) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Missing required fields: userId, action'
                    })
                };
            }

            const validActions = ['approve', 'reject', 'flag', 'promote'];
            if (!validActions.includes(action)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: `Invalid action. Must be one of: ${validActions.join(', ')}`
                    })
                };
            }

            let updateData = {
                last_active: new Date().toISOString()
            };

            switch (action) {
                case 'approve':
                    updateData.verification_status = 'verified';
                    updateData.current_level = VERIFICATION_LEVELS.SEEKER;
                    updateData.total_xp = 10; // Welcome XP
                    break;
                case 'reject':
                    updateData.verification_status = 'rejected';
                    updateData.current_level = VERIFICATION_LEVELS.LOBBY;
                    break;
                case 'flag':
                    updateData.verification_status = 'flagged';
                    break;
                case 'promote':
                    updateData.verification_status = 'verified';
                    updateData.current_level = VERIFICATION_LEVELS.BUILDER;
                    updateData.total_xp = 50;
                    break;
            }

            if (notes) {
                updateData.review_notes = notes;
                updateData.reviewed_by = reviewedBy || 'Commander';
                updateData.reviewed_at = new Date().toISOString();
            }

            await supabase('discord_users', 'PATCH', updateData, `?user_id=eq.${userId}`);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `User ${userId} ${action}d successfully`,
                    newStatus: updateData.verification_status,
                    newLevel: updateData.current_level
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Verification error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}
