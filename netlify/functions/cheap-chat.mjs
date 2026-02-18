// Cheap Chat API - Routes to cheapest viable AI model
// Part of DNA Alternate Orchestrator Blueprint

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

export default async function handler(request) {
    // Handle CORS
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
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

        // Check for env API keys as fallback
        const envKeys = {
            openai: process.env.OPENAI_API_KEY,
            anthropic: process.env.ANTHROPIC_API_KEY,
            google: process.env.GOOGLE_API_KEY,
            deepseek: process.env.DEEPSEEK_API_KEY,
            groq: process.env.GROQ_API_KEY
        };

        const effectiveKey = apiKey || envKeys[provider];

        if (!effectiveKey && provider !== "ollama") {
            return new Response(JSON.stringify({
                error: `No API key for ${provider}. Please add your key in settings or use a FREE local model.`,
                brainContext: useBrain,
                brainAtoms: brainContext.length
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Route to appropriate provider
        switch (provider) {
            case "ollama":
                // Ollama requires local server - return helpful message
                response = `[Ollama models require local server]

To use FREE local models:
1. Install Ollama: https://ollama.ai
2. Run: ollama pull llama3.1
3. Start: ollama serve

Or use a cloud model with your API key.`;
                break;

            case "openai":
                response = await callOpenAI(effectiveKey, model, messages);
                break;

            case "anthropic":
                response = await callAnthropic(effectiveKey, model, messages);
                break;

            case "google":
                response = await callGoogle(effectiveKey, enhancedPrompt);
                break;

            case "deepseek":
                response = await callDeepSeek(effectiveKey, messages);
                break;

            case "groq":
                response = await callGroq(effectiveKey, model, messages);
                break;

            default:
                response = `Unknown provider: ${provider}`;
        }

        // Calculate cost estimate
        const inputTokens = enhancedPrompt.length / 4; // Rough estimate
        const outputTokens = response.length / 4;
        const costPerMillion = COST_TABLE[model] || 0;
        const cost = ((inputTokens + outputTokens) / 1000000) * costPerMillion * 1000; // Convert to actual cost

        return new Response(JSON.stringify({
            response: response,
            modelUsed: modelUsed.split("/")[1],
            cost: cost,
            brainContext: useBrain && brainContext.length > 0,
            brainAtoms: brainContext.length
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        console.error("Cheap chat error:", error);
        return new Response(JSON.stringify({
            error: error.message || "Internal server error"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export const config = {
    path: "/api/cheap-chat"
};
