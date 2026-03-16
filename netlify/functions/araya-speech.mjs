// ARAYA Universal Language Layer - Speech Recognition
// Transcribes audio using Whisper API

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Supported audio formats
const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'wav', 'webm', 'ogg', 'm4a'];

// Language code to Whisper language mapping
const WHISPER_LANGUAGES = {
    'en': 'en', 'es': 'es', 'zh': 'zh', 'tl': 'tl',
    'vi': 'vi', 'ar': 'ar', 'fr': 'fr', 'hi': 'hi',
    'pt': 'pt', 'ru': 'ru', 'ja': 'ja', 'de': 'de',
    'ko': 'ko', 'it': 'it', 'nl': 'nl', 'pl': 'pl'
};

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

        let audioBuffer;
        let language = null;
        let filename = 'audio.webm';

        if (contentType.includes('multipart/form-data')) {
            // Handle form data upload
            const formData = await req.formData();
            const audioFile = formData.get('audio');
            language = formData.get('language') || null;

            if (!audioFile) {
                return new Response(JSON.stringify({ error: 'audio file required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            audioBuffer = await audioFile.arrayBuffer();
            filename = audioFile.name || 'audio.webm';
        } else if (contentType.includes('application/json')) {
            // Handle base64 encoded audio
            const body = await req.json();

            if (!body.audio) {
                return new Response(JSON.stringify({ error: 'audio (base64) required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Decode base64
            const base64Data = body.audio.replace(/^data:audio\/\w+;base64,/, '');
            audioBuffer = Buffer.from(base64Data, 'base64');
            language = body.language || null;
            filename = body.filename || 'audio.webm';
        } else {
            // Raw audio bytes
            audioBuffer = await req.arrayBuffer();
        }

        // Create file for OpenAI
        const audioFile = new File([audioBuffer], filename, {
            type: `audio/${filename.split('.').pop() || 'webm'}`
        });

        // Transcription options
        const options = {
            file: audioFile,
            model: 'whisper-1',
            response_format: 'verbose_json',
            timestamp_granularities: ['word', 'segment']
        };

        // Set language if specified (improves accuracy)
        if (language && WHISPER_LANGUAGES[language]) {
            options.language = WHISPER_LANGUAGES[language];
        }

        // Call Whisper API
        const transcription = await openai.audio.transcriptions.create(options);

        const result = {
            text: transcription.text,
            language: transcription.language,
            duration: transcription.duration,
            segments: transcription.segments?.map(seg => ({
                start: seg.start,
                end: seg.end,
                text: seg.text
            })),
            words: transcription.words?.map(word => ({
                word: word.word,
                start: word.start,
                end: word.end
            })),
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
        console.error('[SPEECH] Error:', error);
        return new Response(JSON.stringify({
            error: 'Speech recognition failed',
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

export const config = { path: "/api/araya-speech" };
