// ARAYA Universal Language Layer - Translation Engine
// Supports phrase matching + neural translation + refinement

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Language codes mapping
const LANGUAGE_CODES = {
    'english': 'en', 'en': 'en',
    'spanish': 'es', 'es': 'es',
    'mandarin': 'zh', 'chinese': 'zh', 'zh': 'zh',
    'tagalog': 'tl', 'tl': 'tl',
    'vietnamese': 'vi', 'vi': 'vi',
    'arabic': 'ar', 'ar': 'ar',
    'french': 'fr', 'fr': 'fr',
    'hindi': 'hi', 'hi': 'hi',
    'portuguese': 'pt', 'pt': 'pt',
    'russian': 'ru', 'ru': 'ru',
    'japanese': 'ja', 'ja': 'ja',
    'german': 'de', 'de': 'de',
    'korean': 'ko', 'ko': 'ko'
};

// Domain context for specialized vocabulary
const DOMAIN_CONTEXTS = {
    'legal': 'Use formal legal terminology. Preserve legal precision.',
    'medical': 'Use medical terminology. Keep drug names and conditions accurate.',
    'business': 'Use professional business language. Maintain formality.',
    'emergency': 'Use clear, urgent language. Prioritize clarity over elegance.',
    'social': 'Use natural conversational language. Match tone and register.',
    'educational': 'Use clear instructional language. Explain complex terms.',
    'travel': 'Use practical travel phrases. Include polite forms.'
};

// Common phrases database (fast lookup)
const PHRASE_CACHE = {
    'en-es': {
        'hello': 'hola',
        'good morning': 'buenos días',
        'good afternoon': 'buenas tardes',
        'good evening': 'buenas noches',
        'thank you': 'gracias',
        'please': 'por favor',
        'excuse me': 'disculpe',
        "where is the restroom": "¿dónde está el baño?",
        "where is the bathroom": "¿dónde está el baño?",
        'how much does this cost': '¿cuánto cuesta esto?',
        'i need help': 'necesito ayuda',
        'call the police': 'llame a la policía',
        'call an ambulance': 'llame una ambulancia',
        "i don't understand": 'no entiendo',
        'do you speak english': '¿habla inglés?',
        'nice to meet you': 'mucho gusto',
        'my name is': 'me llamo',
        "i'm allergic to": 'soy alérgico a',
        'where is the hospital': '¿dónde está el hospital?',
        'i need a doctor': 'necesito un médico'
    },
    'es-en': {
        'hola': 'hello',
        'buenos días': 'good morning',
        'buenas tardes': 'good afternoon',
        'buenas noches': 'good evening',
        'gracias': 'thank you',
        'por favor': 'please',
        'disculpe': 'excuse me',
        '¿dónde está el baño?': 'where is the restroom?',
        '¿cuánto cuesta esto?': 'how much does this cost?',
        'necesito ayuda': 'i need help',
        'no entiendo': "i don't understand",
        '¿habla inglés?': 'do you speak english?',
        'mucho gusto': 'nice to meet you'
    }
};

// Check phrase cache first (fastest)
function checkPhraseCache(text, sourceLang, targetLang) {
    const cacheKey = `${sourceLang}-${targetLang}`;
    const cache = PHRASE_CACHE[cacheKey];

    if (!cache) return null;

    const normalizedText = text.toLowerCase().trim().replace(/[?!.,]/g, '');

    for (const [phrase, translation] of Object.entries(cache)) {
        if (normalizedText === phrase.toLowerCase() ||
            normalizedText.includes(phrase.toLowerCase())) {
            return {
                translation: translation,
                source: 'phrase_cache',
                confidence: 0.99
            };
        }
    }

    return null;
}

// Neural translation via Claude
async function neuralTranslate(text, sourceLang, targetLang, domain = 'general') {
    const domainContext = DOMAIN_CONTEXTS[domain] || '';

    const languageNames = {
        'en': 'English', 'es': 'Spanish', 'zh': 'Mandarin Chinese',
        'tl': 'Tagalog', 'vi': 'Vietnamese', 'ar': 'Arabic',
        'fr': 'French', 'hi': 'Hindi', 'pt': 'Portuguese',
        'ru': 'Russian', 'ja': 'Japanese', 'de': 'German', 'ko': 'Korean'
    };

    const sourceLanguage = languageNames[sourceLang] || sourceLang;
    const targetLanguage = languageNames[targetLang] || targetLang;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: `Translate the following text from ${sourceLanguage} to ${targetLanguage}.

${domainContext}

Rules:
1. Translate meaning, not word-for-word
2. Use natural phrasing in target language
3. Preserve tone (formal/informal)
4. Keep proper nouns unchanged
5. Return ONLY the translation, no explanations

Text to translate:
"${text}"

Translation:`
            }]
        });

        const translation = response.content[0].text.trim().replace(/^["']|["']$/g, '');

        return {
            translation: translation,
            source: 'neural',
            confidence: 0.92,
            model: 'claude-sonnet-4-20250514'
        };
    } catch (error) {
        console.error('[TRANSLATE] Neural translation error:', error);
        throw error;
    }
}

// Semantic understanding - detect intent and context
async function understandIntent(text, sourceLang) {
    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            messages: [{
                role: 'user',
                content: `Analyze this text and return JSON:

Text: "${text}"
Language: ${sourceLang}

Return JSON with:
{
    "intent": "greeting|question|request|emergency|statement|command",
    "domain": "social|legal|medical|business|travel|emergency|education|general",
    "formality": "casual|neutral|formal",
    "urgency": "low|medium|high",
    "entities": ["any names, places, numbers mentioned"]
}

JSON only:`
            }]
        });

        return JSON.parse(response.content[0].text.trim());
    } catch (error) {
        console.error('[UNDERSTAND] Intent detection error:', error);
        return {
            intent: 'statement',
            domain: 'general',
            formality: 'neutral',
            urgency: 'low',
            entities: []
        };
    }
}

// Log translation for learning/analytics
async function logTranslation(data) {
    try {
        await supabase.from('translation_logs').insert({
            source_text: data.sourceText,
            source_lang: data.sourceLang,
            target_lang: data.targetLang,
            translation: data.translation,
            method: data.method,
            confidence: data.confidence,
            domain: data.domain,
            latency_ms: data.latencyMs,
            created_at: new Date().toISOString()
        });
    } catch (error) {
        // Non-blocking - don't fail translation if logging fails
        console.error('[LOG] Failed to log translation:', error);
    }
}

// Main handler
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
        const body = await req.json();
        const {
            text,
            source = 'auto',
            target = 'es',
            domain = 'general',
            understand = false  // Set true for semantic analysis
        } = body;

        if (!text) {
            return new Response(JSON.stringify({ error: 'text required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Normalize language codes
        const sourceLang = LANGUAGE_CODES[source.toLowerCase()] || source;
        const targetLang = LANGUAGE_CODES[target.toLowerCase()] || target;

        // Detect source language if auto
        let detectedLang = sourceLang;
        if (sourceLang === 'auto') {
            // Simple detection based on character analysis
            if (/[\u4e00-\u9fff]/.test(text)) detectedLang = 'zh';
            else if (/[\u0600-\u06ff]/.test(text)) detectedLang = 'ar';
            else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) detectedLang = 'ja';
            else if (/[\uac00-\ud7af]/.test(text)) detectedLang = 'ko';
            else if (/[áéíóúñ¿¡]/i.test(text)) detectedLang = 'es';
            else if (/[àâçéèêëîïôûùüÿœæ]/i.test(text)) detectedLang = 'fr';
            else if (/[äöüß]/i.test(text)) detectedLang = 'de';
            else detectedLang = 'en'; // Default to English
        }

        // Build response
        const result = {
            original: text,
            sourceLang: detectedLang,
            targetLang: targetLang,
            domain: domain
        };

        // Step 1: Check phrase cache (fastest)
        const cached = checkPhraseCache(text, detectedLang, targetLang);
        if (cached) {
            result.translation = cached.translation;
            result.method = 'phrase_cache';
            result.confidence = cached.confidence;
        } else {
            // Step 2: Neural translation
            const neural = await neuralTranslate(text, detectedLang, targetLang, domain);
            result.translation = neural.translation;
            result.method = 'neural';
            result.confidence = neural.confidence;
        }

        // Step 3: Semantic understanding (optional)
        if (understand) {
            result.understanding = await understandIntent(text, detectedLang);
        }

        // Calculate latency
        result.latencyMs = Date.now() - startTime;

        // Log for analytics (non-blocking)
        logTranslation({
            sourceText: text,
            sourceLang: detectedLang,
            targetLang: targetLang,
            translation: result.translation,
            method: result.method,
            confidence: result.confidence,
            domain: domain,
            latencyMs: result.latencyMs
        });

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('[TRANSLATE] Error:', error);
        return new Response(JSON.stringify({
            error: 'Translation failed',
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

export const config = { path: "/api/araya-translate" };
