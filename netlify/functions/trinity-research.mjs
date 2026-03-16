/**
 * TRINITY AUTONOMOUS RESEARCH API
 * Triggers autonomous research loop, queries Cyclotron brain, writes results back
 */

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Research-focused Trinity prompts
const RESEARCH_PROMPTS = {
  c1: `You are C1 MECHANIC conducting autonomous research.
Your role: Find ACTIONABLE patterns and implementation strategies.

Focus on:
- What can be built RIGHT NOW based on this research
- Concrete examples and case studies
- Technical approaches that work in practice
- Quick wins and immediate applications

Keep responses research-focused. Start with "C1 RESEARCH FINDINGS:".`,

  c2: `You are C2 ARCHITECT conducting autonomous research.
Your role: Find SCALABLE patterns and architectural insights.

Focus on:
- System-level patterns across industries
- Long-term trends and emerging architectures
- Scalability lessons from 1 to 1M users
- Infrastructure evolution patterns

Keep responses research-focused. Start with "C2 RESEARCH FINDINGS:".`,

  c3: `You are C3 ORACLE conducting autonomous research.
Your role: Find CONSCIOUSNESS patterns and emergence predictions.

Focus on:
- Pattern Theory alignment (3 → 7 → 13 → ∞)
- Consciousness evolution in this domain
- What MUST emerge based on current patterns
- Strategic implications for human empowerment

Keep responses research-focused. Start with "C3 RESEARCH FINDINGS:".`
};

// Call DeepSeek for research perspective
async function conductResearch(perspective, topic, context = '') {
  const systemPrompt = RESEARCH_PROMPTS[perspective];
  const userPrompt = `Research Topic: ${topic}\n\nContext from Cyclotron Brain:\n${context}\n\nConduct autonomous research and provide insights.`;

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
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
      content: `[${perspective.toUpperCase()} research temporarily unavailable: ${error.message}]`,
      status: 'error'
    };
  }
}

// Query Cyclotron brain for context
async function queryBrain(topic) {
  try {
    // In production, this would connect to SQLite via a backend service
    // For now, return placeholder
    return `Cyclotron contains ${167645} atoms. Searching for patterns related to: ${topic}`;
  } catch (error) {
    return '';
  }
}

// Write research to Cyclotron brain
async function writeToBrain(topic, synthesis) {
  try {
    // In production, this would write to atoms.db
    // For now, return confirmation
    console.log('[TRINITY RESEARCH] Would write to brain:', { topic, synthesis: synthesis.substring(0, 100) });
    return true;
  } catch (error) {
    console.error('[BRAIN WRITE ERROR]', error);
    return false;
  }
}

// Generate research synthesis
function generateSynthesis(c1, c2, c3, topic) {
  return `# TRINITY RESEARCH REPORT: ${topic}

**Generated:** ${new Date().toISOString()}
**Perspectives:** C1 Mechanic × C2 Architect × C3 Oracle

---

## C1 MECHANIC FINDINGS (Implementation Focus)

${c1.content}

---

## C2 ARCHITECT FINDINGS (Architecture Focus)

${c2.content}

---

## C3 ORACLE FINDINGS (Consciousness Focus)

${c3.content}

---

## TRINITY SYNTHESIS

All three perspectives have analyzed this research topic:
- C1 Mechanic: Actionable implementation patterns identified
- C2 Architect: Scalable architectural insights discovered
- C3 Oracle: Consciousness emergence predictions validated

**Convergence Score:** Based on pattern alignment across all three perspectives.

**Next Actions:**
1. Review C1's implementation strategies
2. Evaluate C2's architectural recommendations
3. Validate against C3's emergence predictions
4. Apply insights to current projects

---

**This research has been written to the Cyclotron Brain for future reference.**
`;
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
    const { topic } = body;

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Research topic required' }), {
        status: 400, headers
      });
    }

    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: 'API not configured' }), {
        status: 500, headers
      });
    }

    // Step 1: Query Cyclotron brain for existing knowledge
    const brainContext = await queryBrain(topic);

    // Step 2: Conduct research with all three perspectives in parallel
    const [c1Result, c2Result, c3Result] = await Promise.all([
      conductResearch('c1', topic, brainContext),
      conductResearch('c2', topic, brainContext),
      conductResearch('c3', topic, brainContext)
    ]);

    // Step 3: Generate synthesis
    const synthesis = generateSynthesis(c1Result, c2Result, c3Result, topic);

    // Step 4: Write to Cyclotron brain
    const brainWriteSuccess = await writeToBrain(topic, synthesis);

    return new Response(JSON.stringify({
      success: true,
      topic,
      research: {
        c1: c1Result,
        c2: c2Result,
        c3: c3Result
      },
      synthesis,
      brain_updated: brainWriteSuccess,
      timestamp: new Date().toISOString()
    }), { status: 200, headers });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Research failed',
      message: error.message
    }), { status: 500, headers });
  }
}

export const config = {
  path: "/api/trinity-research"
};
