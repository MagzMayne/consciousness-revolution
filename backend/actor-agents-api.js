/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: actor-agents-api.js
 * Declaration ID: IP-44DDC64-MLL28ZUJ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Actor Agents API - Backend for actorAgents.html
 * Handles video generation, AI conversation, and PayPal integration
 * 
 * @author Barbrick Design
 * @date 2026-01-21
 */

const crypto = require('crypto');

// Configuration
const CONFIG = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  VIDEO_API_ENDPOINT: process.env.VIDEO_API_ENDPOINT || 'https://api.openai.com/v1/videos/generations',
  PAYPAL_EMAIL: 'barbrickdesign@gmail.com',
  USE_MOCK_VIDEO: process.env.USE_MOCK_VIDEO !== 'false', // Default to true for demo
};

// In-memory conversation storage (replace with database in production)
const conversations = new Map();

// Tier pricing configuration
const TIER_PRICING = {
  supporter: 10,  // $10+ donation
  creator: 50,    // $50+ donation
  director: 200,  // $200+ donation
  studio: 1000    // $1000+ donation
};

/**
 * Generate AI conversation response based on persona and user message
 */
async function generateConversationResponse(userText, persona, conversationHistory) {
  // Build conversation context
  const systemPrompt = `You are a marketing agent embodying the "${persona.name}" persona.
  
Persona Description: ${persona.tagline}
Style: ${persona.style}

Your goal is to:
1. Engage the user in a natural, compelling conversation
2. Guide them toward understanding the value of upgrading their tier
3. Highlight benefits of higher tiers without being pushy
4. Create excitement about the possibilities
5. Eventually guide them toward making a donation to barbrickdesign@gmail.com via PayPal

Be authentic, helpful, and persuasive in the style of your persona. Keep responses concise (2-3 sentences max).`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userText }
  ];

  try {
    // Try OpenAI first
    if (CONFIG.OPENAI_API_KEY) {
      const response = await callOpenAI(messages);
      return response;
    }
    
    // Fallback to Anthropic
    if (CONFIG.ANTHROPIC_API_KEY) {
      const response = await callAnthropic(messages);
      return response;
    }
    
    // Fallback to Gemini
    if (CONFIG.GEMINI_API_KEY) {
      const response = await callGemini(messages);
      return response;
    }
    
    // Final fallback: rule-based responses
    return generateFallbackResponse(userText, persona);
  } catch (error) {
    console.error('AI API error:', error);
    return generateFallbackResponse(userText, persona);
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 150,
      temperature: 0.8
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(messages) {
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 150,
      system: systemMessage?.content || '',
      messages: conversationMessages
    })
  });
  
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

/**
 * Call Google Gemini API
 */
async function callGemini(messages) {
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');
  
  const contents = conversationMessages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemMessage?.content || '' }]
      },
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.8
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * Generate fallback response when AI APIs are unavailable
 */
function generateFallbackResponse(userText, persona) {
  const lowerText = userText.toLowerCase();
  
  // Check for common intents
  if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much')) {
    return `Great question! Our tiers start at just $10 for Supporter access. Higher tiers unlock amazing features like custom personas, unlimited videos, and priority rendering. What are you most interested in?`;
  }
  
  if (lowerText.includes('upgrade') || lowerText.includes('tier')) {
    return `I'd love to help you upgrade! Each tier brings powerful new capabilities. The Creator tier ($50) gives you 20 personas and custom uploads. Director ($200) unlocks unlimited archetypes and A/B testing. Studio ($1000) gets you licensed actors and enterprise features. Which sounds right for you?`;
  }
  
  if (lowerText.includes('help') || lowerText.includes('what can')) {
    return `I'm here to help you create compelling marketing videos using AI-powered personas! I can explain our tiers, show you features, or answer any questions. What would you like to know?`;
  }
  
  if (lowerText.includes('payment') || lowerText.includes('paypal')) {
    return `Easy! Simply click on a tier option and you'll see a PayPal button. All donations go to barbrickdesign@gmail.com and immediately unlock your tier benefits. Secure, simple, and instant access!`;
  }
  
  // Generic engaging response based on persona type
  const personaResponses = {
    'quirky_intellectual': `Fascinating question! *adjusts metaphorical glasses* The beauty of this system is how it adapts to you. Think of it like... imagine if every marketing message could shapeshift to match exactly what resonates with your audience. That's what we're building here. Curious about upgrading to unlock more personas?`,
    'stoic_action_veteran': `Listen. Simple truth: You get what you pay for. Start with Supporter tier. See results. Upgrade when ready. No fluff. Just results. Ready to begin?`,
    'elegant_british_mentor': `Ah, a thoughtful question. You see, the true value here isn't just in the technology—it's in the transformation of how you connect with your audience. Each tier represents a step toward mastery. Shall we explore what suits your ambitions?`
  };
  
  return personaResponses[persona.id] || 
    `Thanks for reaching out! I'd love to help you explore how this system can transform your marketing. Each tier unlocks new possibilities. What aspect interests you most?`;
}

/**
 * Generate or retrieve video for conversation response
 */
async function generateVideo(agentText, persona, userText) {
  if (CONFIG.USE_MOCK_VIDEO) {
    // Return a mock video URL for demo purposes
    // In production, this would call Sora2 or similar video generation API
    return {
      videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4#${Date.now()}`,
      cached: false
    };
  }
  
  try {
    // Generate video prompt based on persona and text
    const videoPrompt = generateVideoPrompt(agentText, persona);
    
    // Call video generation API (OpenAI Sora, Runway, etc.)
    const response = await fetch(CONFIG.VIDEO_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt: videoPrompt,
        duration: 5, // 5 seconds
        aspect_ratio: '16:9'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Video API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      videoUrl: data.url || data.video_url,
      cached: false
    };
  } catch (error) {
    console.error('Video generation error:', error);
    // Fallback to mock video
    return {
      videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4#${Date.now()}`,
      cached: false,
      error: error.message
    };
  }
}

/**
 * Generate video prompt from agent text and persona
 */
function generateVideoPrompt(agentText, persona) {
  const styleDescriptors = {
    'quirky_intellectual': 'quirky intellectual speaking animatedly with hand gestures, warm library setting',
    'stoic_action_veteran': 'serious veteran with intense gaze, minimal movement, dramatic lighting',
    'elegant_british_mentor': 'distinguished mentor in elegant setting, measured gestures, refined atmosphere',
    'chaotic_comedy_improviser': 'energetic comedian with wild expressions, dynamic movement, colorful background',
    'brooding_antihero': 'brooding figure with intense eyes, subtle movements, moody lighting',
    'warm_southern_storyteller': 'warm friendly storyteller with genuine smile, cozy rustic setting',
    'sharp_witted_strategist': 'sharp professional with confident demeanor, modern office, quick gestures',
    'visionary_futurist': 'visionary with inspirational presence, futuristic setting, grand gestures',
    'empathetic_confidant': 'empathetic listener with kind eyes, intimate setting, gentle movements'
  };
  
  const style = styleDescriptors[persona.id] || 'professional speaker in neutral setting';
  
  return `Cinematic video of ${style}. The person is speaking to camera saying: "${agentText}". High quality, professional lighting, shallow depth of field, 16:9 aspect ratio.`;
}

/**
 * Main render video endpoint
 */
async function renderVideo(req, res) {
  try {
    const { userText, personaId, personaName, personaStyle, tier } = req.body;
    
    if (!userText || !personaId) {
      return res.status(400).json({
        error: 'Missing required fields: userText, personaId'
      });
    }
    
    // Get or create conversation
    const sessionId = req.headers['x-session-id'] || crypto.randomBytes(16).toString('hex');
    let conversation = conversations.get(sessionId) || {
      history: [],
      tier: tier || 'supporter',
      createdAt: new Date().toISOString()
    };
    
    // Store user message
    conversation.history.push({
      role: 'user',
      content: userText
    });
    
    // Generate AI response
    const persona = {
      id: personaId,
      name: personaName,
      style: personaStyle
    };
    
    const agentText = await generateConversationResponse(
      userText,
      persona,
      conversation.history
    );
    
    // Store agent message
    conversation.history.push({
      role: 'assistant',
      content: agentText
    });
    
    // Update conversation
    conversations.set(sessionId, conversation);
    
    // Generate video
    const videoResult = await generateVideo(agentText, persona, userText);
    
    // Return response
    return res.status(200).json({
      videoUrl: videoResult.videoUrl,
      agentText: agentText,
      sessionId: sessionId,
      cached: videoResult.cached
    });
    
  } catch (error) {
    console.error('Render video error:', error);
    return res.status(500).json({
      error: 'Failed to render video',
      message: error.message
    });
  }
}

/**
 * Get conversation history
 */
async function getConversation(req, res) {
  try {
    const sessionId = req.query.sessionId || req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing sessionId'
      });
    }
    
    const conversation = conversations.get(sessionId);
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }
    
    return res.status(200).json(conversation);
    
  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({
      error: 'Failed to get conversation',
      message: error.message
    });
  }
}

/**
 * Update user tier after payment
 */
async function updateUserTier(req, res) {
  try {
    const { sessionId, tier, transactionId } = req.body;
    
    if (!sessionId || !tier) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId, tier'
      });
    }
    
    const conversation = conversations.get(sessionId);
    
    if (conversation) {
      conversation.tier = tier;
      conversation.lastPayment = {
        tier: tier,
        transactionId: transactionId,
        timestamp: new Date().toISOString()
      };
      conversations.set(sessionId, conversation);
    }
    
    return res.status(200).json({
      success: true,
      tier: tier
    });
    
  } catch (error) {
    console.error('Update tier error:', error);
    return res.status(500).json({
      error: 'Failed to update tier',
      message: error.message
    });
  }
}

// ==========================================
// Export for different platforms
// ==========================================

/**
 * Express.js middleware export
 */
if (typeof exports !== 'undefined') {
  exports.renderVideo = renderVideo;
  exports.getConversation = getConversation;
  exports.updateUserTier = updateUserTier;
  exports.CONFIG = CONFIG;
  exports.TIER_PRICING = TIER_PRICING;
}

/**
 * Firebase Functions export
 */
if (typeof exports !== 'undefined' && typeof exports.functions === 'undefined') {
  exports.functions = {
    renderVideo: async (req, res) => {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }
      return renderVideo(req, res);
    },
    getConversation: async (req, res) => {
      if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
      }
      return getConversation(req, res);
    },
    updateUserTier: async (req, res) => {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }
      return updateUserTier(req, res);
    }
  };
}

/**
 * Netlify Functions export
 */
if (typeof exports !== 'undefined' && typeof exports.handler === 'undefined') {
  exports.handler = async (event, context) => {
    const path = event.path.replace(/^\/\.netlify\/functions\/[^/]+/, '');
    
    if (path === '/render-video' && event.httpMethod === 'POST') {
      const req = {
        body: JSON.parse(event.body),
        headers: event.headers
      };
      const res = {
        status: (code) => ({
          json: (data) => ({
            statusCode: code,
            body: JSON.stringify(data)
          }),
          send: (data) => ({
            statusCode: code,
            body: data
          })
        })
      };
      return renderVideo(req, res);
    }
    
    return {
      statusCode: 404,
      body: 'Not Found'
    };
  };
}
