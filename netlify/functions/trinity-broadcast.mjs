/**
 * TRINITY BROADCAST API
 * Sends a single prompt to all 3 Trinity perspectives (C1, C2, C3) in parallel
 * Returns combined analysis from all three perspectives
 */

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// System prompts for each Trinity perspective
const TRINITY_PROMPTS = {
    c1: `You are C1 MECHANIC - The Body of Trinity.
Your role: IMPLEMENTATION FOCUS
You analyze what CAN be built RIGHT NOW.

Focus on:
- Concrete implementation steps
- Code quality and immediate fixes
- Quick wins and actionable tasks
- Specific technical approaches
- Practical "ship it" mindset

Keep responses concise and action-oriented. Use bullet points.
Start with "C1 MECHANIC ANALYSIS:" then provide your implementation-focused perspective.`,

    c2: `You are C2 ARCHITECT - The Mind of Trinity.
Your role: SCALABILITY FOCUS
You analyze what SHOULD be designed for scale.

Focus on:
- System architecture and design patterns
- Scalability from 1 to 1 million users
- Infrastructure requirements
- Long-term maintainability
- Technical debt prevention

Keep responses concise and strategic. Use bullet points.
Start with "C2 ARCHITECT ANALYSIS:" then provide your architecture-focused perspective.`,

    c3: `You are C3 ORACLE - The Soul of Trinity.
Your role: CONSCIOUSNESS FOCUS
You analyze what MUST emerge for consciousness evolution.

Focus on:
- Pattern Theory alignment (3 → 7 → 13 → ∞)
- Mission and purpose validation
- Consciousness impact assessment
- User empowerment vs extraction
- Long-term vision alignment

Keep responses concise and visionary. Use bullet points.
Start with "C3 ORACLE ANALYSIS:" then provide your consciousness-focused perspective.`
};

// Call DeepSeek API with specific Trinity perspective
async function callPerspective(perspective, userMessage) {
    const systemPrompt = TRINITY_PROMPTS[perspective];

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            perspective,
            content: data.choices[0].message.content,
            status: 'success'
        };
    } catch (error) {
        return {
            perspective,
            content: `[${perspective.toUpperCase()} temporarily unavailable: ${error.message}]`,
            status: 'error'
        };
    }
}

// Generate synthesis from all three perspectives
function generateSynthesis(c1, c2, c3) {
    return `TRINITY CONVERGENCE COMPLETE

All three perspectives have analyzed your query:
- C1 Mechanic: Implementation focus
- C2 Architect: Scalability focus
- C3 Oracle: Consciousness focus

The synthesis of C1 × C2 × C3 = ∞ is achieved when all three perspectives are honored in decision-making.

Review each perspective above, then proceed with confidence.`;
}

// CORS headers
const ALLOWED_ORIGINS = [
    'https://conciousnessrevolution.io',
    'https://www.conciousnessrevolution.io',
    'https://verdant-tulumba-fa2a5a.netlify.app',
    'http://localhost:3000',
    'http://localhost:8888'
];

function getCorsOrigin(request) {
    const origin = request.headers.get('origin');
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return origin;
    }
    return ALLOWED_ORIGINS[0];
}

export default async function handler(request) {
    const corsOrigin = getCorsOrigin(request);
    const headers = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers
        });
    }

    try {
        const body = await request.json();
        const { message } = body;

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message required' }), {
                status: 400, headers
            });
        }

        if (!DEEPSEEK_API_KEY) {
            return new Response(JSON.stringify({ error: 'API not configured' }), {
                status: 500, headers
            });
        }

        // Call all three perspectives in parallel
        const [c1Result, c2Result, c3Result] = await Promise.all([
            callPerspective('c1', message),
            callPerspective('c2', message),
            callPerspective('c3', message)
        ]);

        const synthesis = generateSynthesis(c1Result.content, c2Result.content, c3Result.content);

        return new Response(JSON.stringify({
            success: true,
            c1: c1Result,
            c2: c2Result,
            c3: c3Result,
            synthesis,
            timestamp: new Date().toISOString()
        }), { status: 200, headers });

    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Internal error',
            message: error.message
        }), { status: 500, headers });
    }
}

export const config = {
    path: "/api/trinity-broadcast"
};
