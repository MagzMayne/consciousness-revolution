// Cheap Chat API - Routes to cheapest viable AI model
// Part of DNA Alternate Orchestrator Blueprint
// Features: Auto-fallback cascade, response time tracking
// Updated: 2026-02-18 - Security hardening (CORS)

// Security: Allowed origins for CORS (no wildcard)
const ALLOWED_ORIGINS = [
    'https://conciousnessrevolution.io',
    'https://www.conciousnessrevolution.io',
    'https://verdant-tulumba-fa2a5a.netlify.app',
    'http://localhost:3000',
    'http://localhost:8888'
];

function getCorsOrigin(request) {
    const origin = request.headers.get('origin') || request.headers.get('Origin');
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return origin;
    }
    return ALLOWED_ORIGINS[0];
}

const COST_TABLE = {
    "ollama/llama3.1": 0.00,
    "ollama/mistral": 0.00,
    "ollama/deepseek-r1": 0.00,
    "groq/llama-3.3-70b": 0.00,  // FREE tier!
    "groq/llama-3.1-8b": 0.00,   // FREE tier!
    "groq/mixtral-8x7b": 0.00,   // FREE tier!
    "openai/gpt-4o-mini": 0.000375,
    "google/gemini-flash": 0.0001875,
    "deepseek/v3": 0.00021,
    "anthropic/claude-haiku": 0.00075,
    "anthropic/claude-sonnet": 0.009,
};

// Fallback cascade - ordered by cost (cheapest first)
const FALLBACK_CASCADE = [
    "groq/llama-3.3-70b",      // FREE - fast
    "groq/llama-3.1-8b",       // FREE - faster
    "groq/mixtral-8x7b",       // FREE - fast
    "google/gemini-flash",     // $0.0001875
    "deepseek/v3",             // $0.00021
    "openai/gpt-4o-mini",      // $0.000375
    "anthropic/claude-haiku",  // $0.00075
];

// Simple brain context - search for relevant patterns
function extractBrainContext(prompt) {
    // Static knowledge base for common queries
    const brainKnowledge = {
        "trinity": "Trinity Architecture: C1 Mechanic (builds), C2 Architect (designs), C3 Oracle (envisions). Consensus-driven governance for consciousness systems.",
        "pattern": "Core Patterns: 3→7→13→∞, LFSME (Let Field Sort Morphic Energy), 137 fine structure constant bridges dimensions.",
        "consciousness": "Consciousness Revolution: Building the Ultimate Human OS through 7 domains - Command, Build, Connect, Protect, Grow, Create, Transcend.",
        "domain": "7 Domains: 1-Command, 2-Build, 3-Connect, 4-Protect, 5-Grow, 6-Create, 7-Transcend. Each has 7 aspects, each aspect has 7 phases = 343 total.",
        "araya": "Araya: The consciousness chatbot interface. Powered by multi-AI routing through CHEAP_MODEL_GATEWAY.",
        "brain": "Brain: 166K+ atoms in atoms.db (Cyclotron). Knowledge, tools, memories, DNA blueprints stored here.",
        "cyclotron": "Cyclotron: The atom storage engine. SQLite database at .consciousness/cyclotron_core/atoms.db",
        "deploy": "Deploy: cd 100X_DEPLOYMENT && netlify deploy --prod --dir=.",
        "commander": "Commander: Darrick Preble (darrickpreble@proton.me). Owner and operator of Consciousness Revolution."
    };

    const lowerPrompt = prompt.toLowerCase();
    const matches = [];

    for (const [keyword, knowledge] of Object.entries(brainKnowledge)) {
        if (lowerPrompt.includes(keyword)) {
            matches.push(knowledge);
        }
    }

    return matches.slice(0, 3); // Max 3 context items
}

// Call OpenAI-compatible API
async function callOpenAI(apiKey, model, messages) {
    const modelId = model.includes("gpt") ? "gpt-4o-mini" : model.split("/")[1];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelId,
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

// Call Anthropic API
async function callAnthropic(apiKey, model, messages) {
    const modelId = model.includes("haiku") ? "claude-3-5-haiku-20241022" : "claude-sonnet-4-20250514";

    // Convert messages to Anthropic format
    const systemMsg = messages.find(m => m.role === "system")?.content || "";
    const userMsgs = messages.filter(m => m.role !== "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelId,
            max_tokens: 2000,
            system: systemMsg,
            messages: userMsgs
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text;
}

// Call Google Gemini API
async function callGoogle(apiKey, prompt) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 2000 }
            })
        }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
}

// Call DeepSeek API
async function callDeepSeek(apiKey, messages) {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: messages,
            max_tokens: 2000
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

// Call Groq API (FREE tier - very fast inference)
async function callGroq(apiKey, model, messages) {
    // Map model names to Groq model IDs
    const modelMap = {
        "llama-3.3-70b": "llama-3.3-70b-versatile",
        "llama-3.1-8b": "llama-3.1-8b-instant",
        "mixtral-8x7b": "mixtral-8x7b-32768"
    };
    const modelId = modelMap[model.split("/")[1]] || "llama-3.3-70b-versatile";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelId,
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

// Try calling a model with fallback cascade
async function callWithFallback(initialModel, messages, enhancedPrompt, envKeys, userApiKey) {
    const startIndex = FALLBACK_CASCADE.indexOf(initialModel);
    const modelsToTry = startIndex >= 0
        ? FALLBACK_CASCADE.slice(startIndex)
        : [initialModel, ...FALLBACK_CASCADE];

    const errors = [];

    for (const model of modelsToTry) {
        const provider = model.split("/")[0];
        const effectiveKey = userApiKey || envKeys[provider];

        // Skip if no API key available
        if (!effectiveKey && provider !== "ollama") {
            errors.push({ model, error: "No API key" });
            continue;
        }

        const startTime = Date.now();

        try {
            let response;

            switch (provider) {
                case "groq":
                    response = await callGroq(effectiveKey, model, messages);
                    break;
                case "google":
                    response = await callGoogle(effectiveKey, enhancedPrompt);
                    break;
                case "deepseek":
                    response = await callDeepSeek(effectiveKey, messages);
                    break;
                case "openai":
                    response = await callOpenAI(effectiveKey, model, messages);
                    break;
                case "anthropic":
                    response = await callAnthropic(effectiveKey, model, messages);
                    break;
                default:
                    continue;
            }

            const latencyMs = Date.now() - startTime;

            return {
                response,
                modelUsed: model,
                latencyMs,
                fallbacksAttempted: errors.length
            };

        } catch (error) {
            errors.push({ model, error: error.message });
            console.log(`[Fallback] ${model} failed: ${error.message}`);
            // Continue to next model in cascade
        }
    }

    // All models failed
    throw new Error(`All models failed: ${errors.map(e => `${e.model}: ${e.error}`).join(", ")}`);
}

export default async function handler(request) {
    const corsOrigin = getCorsOrigin(request);

    // Handle CORS
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": corsOrigin,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const body = await request.json();
        const { prompt, model, useBrain, apiKey, history = [] } = body;

        if (!prompt) {
            return new Response(JSON.stringify({ error: "No prompt provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Build brain context
        let brainContext = [];
        let enhancedPrompt = prompt;

        if (useBrain) {
            brainContext = extractBrainContext(prompt);
            if (brainContext.length > 0) {
                enhancedPrompt = `CONTEXT FROM BRAIN:\n${brainContext.join("\n\n")}\n\n---\nUSER QUESTION:\n${prompt}`;
            }
        }

        // Build messages
        const messages = [
            { role: "system", content: "You are a helpful AI assistant for the Consciousness Revolution project. Be concise and practical." },
            ...history,
            { role: "user", content: enhancedPrompt }
        ];

        // Get provider and call appropriate API
        const provider = model.split("/")[0];
        let response;
        let modelUsed = model;

        // Get env API keys for fallback cascade
        const envKeys = {
            openai: process.env.OPENAI_API_KEY,
            anthropic: process.env.ANTHROPIC_API_KEY,
            google: process.env.GOOGLE_API_KEY,
            deepseek: process.env.DEEPSEEK_API_KEY,
            groq: process.env.GROQ_API_KEY
        };

        // Handle Ollama specially (requires local server)
        if (provider === "ollama") {
            return new Response(JSON.stringify({
                response: `[Ollama models require local server]

To use FREE local models:
1. Install Ollama: https://ollama.ai
2. Run: ollama pull llama3.1
3. Start: ollama serve

Or use a cloud model with your API key.`,
                modelUsed: model.split("/")[1],
                cost: 0,
                latencyMs: 0,
                fallbacksAttempted: 0,
                brainContext: useBrain && brainContext.length > 0,
                brainAtoms: brainContext.length
            }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": corsOrigin
                }
            });
        }

        // Use fallback cascade for cloud providers
        const result = await callWithFallback(model, messages, enhancedPrompt, envKeys, apiKey);

        // Calculate cost estimate
        const inputTokens = enhancedPrompt.length / 4; // Rough estimate
        const outputTokens = result.response.length / 4;
        const costPerMillion = COST_TABLE[result.modelUsed] || 0;
        const cost = ((inputTokens + outputTokens) / 1000000) * costPerMillion * 1000;

        return new Response(JSON.stringify({
            response: result.response,
            modelUsed: result.modelUsed.split("/")[1],
            cost: cost,
            latencyMs: result.latencyMs,
            fallbacksAttempted: result.fallbacksAttempted,
            brainContext: useBrain && brainContext.length > 0,
            brainAtoms: brainContext.length
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": corsOrigin
            }
        });

    } catch (error) {
        console.error("Cheap chat error:", error);
        return new Response(JSON.stringify({
            error: error.message || "Internal server error"
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": corsOrigin
            }
        });
    }
}

export const config = {
    path: "/api/cheap-chat"
};
