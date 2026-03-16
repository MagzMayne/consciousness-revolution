// ARAYA Universal Language Layer - Pronunciation Coaching
// Compares user speech to target phrase and provides feedback

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Phonetic guides for common sounds
const PRONUNCIATION_GUIDES = {
    'es': {
        'r': 'Roll your tongue for the Spanish R',
        'rr': 'Strong rolled R - tongue vibrates against palate',
        'ñ': 'Like "ny" in "canyon"',
        'j': 'Like English "h" but stronger, from throat',
        'll': 'Like "y" in "yes" (varies by region)',
        'v': 'Pronounced like "b" in Spanish',
        'z': 'Like "s" in Latin America, "th" in Spain',
        'c': 'Before e/i sounds like "s" (or "th" in Spain)'
    },
    'zh': {
        'tones': 'Mandarin has 4 tones - pitch changes meaning',
        'x': 'Like "sh" but with tongue closer to teeth',
        'q': 'Like "ch" but with more air',
        'zh': 'Like "j" in "judge"',
        'r': 'Like a mix of "r" and "zh"'
    },
    'fr': {
        'r': 'Uvular R - from back of throat',
        'u': 'Round lips tightly, say "ee"',
        'nasal': 'Let air through nose for nasal vowels',
        'liaison': 'Connect final consonant to next vowel'
    }
};

// Calculate similarity score between two strings
function calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    // Levenshtein distance
    const matrix = [];
    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            if (s1[i-1] === s2[j-1]) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i-1][j-1] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j] + 1
                );
            }
        }
    }

    const distance = matrix[s1.length][s2.length];
    const maxLen = Math.max(s1.length, s2.length);
    return 1 - (distance / maxLen);
}

// Generate coaching feedback via Claude
async function generateFeedback(targetPhrase, userSaid, similarity, language) {
    const guides = PRONUNCIATION_GUIDES[language] || {};
    const guideText = Object.entries(guides)
        .map(([sound, tip]) => `${sound}: ${tip}`)
        .join('\n');

    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            messages: [{
                role: 'user',
                content: `You are ARAYA, a friendly pronunciation coach.

Target phrase: "${targetPhrase}"
User said: "${userSaid}"
Similarity: ${Math.round(similarity * 100)}%
Language: ${language}

Pronunciation guides for this language:
${guideText}

Give encouraging feedback in 2-3 sentences:
1. Acknowledge what they got right
2. If score < 85%, give ONE specific tip to improve
3. End with encouragement

Be warm and supportive. Use simple language.`
            }]
        });

        return response.content[0].text.trim();
    } catch (error) {
        console.error('[PRONUNCIATION] Feedback error:', error);
        return similarity > 0.85
            ? "Great job! Your pronunciation is clear."
            : "Good attempt! Keep practicing - you're improving.";
    }
}

// Identify specific problem areas
function identifyProblemAreas(target, actual, language) {
    const problems = [];
    const targetWords = target.toLowerCase().split(/\s+/);
    const actualWords = actual.toLowerCase().split(/\s+/);

    for (let i = 0; i < targetWords.length; i++) {
        if (!actualWords[i]) {
            problems.push({
                expected: targetWords[i],
                got: '(missing)',
                position: i
            });
        } else if (targetWords[i] !== actualWords[i]) {
            const wordSim = calculateSimilarity(targetWords[i], actualWords[i]);
            if (wordSim < 0.8) {
                problems.push({
                    expected: targetWords[i],
                    got: actualWords[i],
                    position: i,
                    similarity: Math.round(wordSim * 100)
                });
            }
        }
    }

    return problems;
}

export default async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const startTime = Date.now();

    try {
        const contentType = req.headers.get('content-type') || '';

        let targetPhrase, language, audioBuffer;

        if (contentType.includes('multipart/form-data')) {
            // Audio file upload
            const formData = await req.formData();
            const audioFile = formData.get('audio');
            targetPhrase = formData.get('target');
            language = formData.get('language') || 'es';

            if (!audioFile || !targetPhrase) {
                return new Response(JSON.stringify({
                    error: 'audio file and target phrase required'
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }

            audioBuffer = await audioFile.arrayBuffer();
        } else {
            // JSON with base64 audio or just text comparison
            const body = await req.json();
            targetPhrase = body.target;
            language = body.language || 'es';

            if (body.audio) {
                // Decode base64 audio
                const base64Data = body.audio.replace(/^data:audio\/\w+;base64,/, '');
                audioBuffer = Buffer.from(base64Data, 'base64');
            } else if (body.userSaid) {
                // Text-only comparison (for testing)
                const similarity = calculateSimilarity(targetPhrase, body.userSaid);
                const feedback = await generateFeedback(targetPhrase, body.userSaid, similarity, language);
                const problems = identifyProblemAreas(targetPhrase, body.userSaid, language);

                return new Response(JSON.stringify({
                    target: targetPhrase,
                    userSaid: body.userSaid,
                    score: Math.round(similarity * 100),
                    feedback: feedback,
                    problems: problems,
                    passed: similarity >= 0.8,
                    latencyMs: Date.now() - startTime
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } else {
                return new Response(JSON.stringify({
                    error: 'audio or userSaid required'
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        }

        // Transcribe user's audio
        const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: language
        });

        const userSaid = transcription.text;

        // Calculate similarity
        const similarity = calculateSimilarity(targetPhrase, userSaid);

        // Generate feedback
        const feedback = await generateFeedback(targetPhrase, userSaid, similarity, language);

        // Identify problem areas
        const problems = identifyProblemAreas(targetPhrase, userSaid, language);

        const result = {
            target: targetPhrase,
            userSaid: userSaid,
            score: Math.round(similarity * 100),
            feedback: feedback,
            problems: problems,
            passed: similarity >= 0.8,
            guides: PRONUNCIATION_GUIDES[language] || {},
            latencyMs: Date.now() - startTime
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('[PRONUNCIATION] Error:', error);
        return new Response(JSON.stringify({
            error: 'Pronunciation check failed',
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};

export const config = { path: "/api/araya-pronunciation" };
