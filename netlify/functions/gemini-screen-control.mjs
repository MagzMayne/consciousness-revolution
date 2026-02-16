/**
 * Gemini Screen Control - Netlify Function
 * 
 * Integrates Google Gemini API for intelligent screen/page analysis
 * Provides AI-powered element detection and contextual suggestions
 * 
 * Endpoint: /.netlify/functions/gemini-screen-control
 * Method: POST
 * 
 * Request body:
 * {
 *   "action": "analyze" | "suggest" | "detect",
 *   "screenshot": "base64-encoded image data",
 *   "pageContext": {
 *     "url": "current page URL",
 *     "title": "page title",
 *     "elements": [{type, text, id}] // optional
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "analysis": {
 *     "summary": "AI description of page",
 *     "elements": [{type, description, confidence, position}],
 *     "suggestions": ["action suggestions"],
 *     "insights": ["contextual insights"]
 *   }
 * }
 */

// CORS headers for browser access
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Call Google Gemini API for vision analysis
 */
async function callGeminiVision(imageData, prompt, apiKey) {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: prompt
                        },
                        {
                            inline_data: {
                                mime_type: "image/png",
                                data: imageData
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response from Gemini API');
        }

        const text = data.candidates[0].content.parts[0].text;
        return text;
        
    } catch (error) {
        console.error('Gemini API call failed:', error);
        throw error;
    }
}

/**
 * Parse Gemini's response and structure the analysis
 */
function parseAnalysis(geminiResponse, action) {
    try {
        // Try to parse as JSON if Gemini returns structured data
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback: structure the text response
        return {
            summary: geminiResponse.split('\n')[0] || geminiResponse.substring(0, 200),
            elements: extractElements(geminiResponse),
            suggestions: extractSuggestions(geminiResponse),
            insights: extractInsights(geminiResponse),
            rawResponse: geminiResponse
        };
        
    } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        return {
            summary: geminiResponse.substring(0, 200),
            elements: [],
            suggestions: [],
            insights: [geminiResponse],
            rawResponse: geminiResponse
        };
    }
}

/**
 * Extract element descriptions from text
 */
function extractElements(text) {
    const elements = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
        // Look for patterns like "Button: ..." or "Link: ..."
        const match = line.match(/^[\s\-\*]*(\w+):\s*(.+)$/i);
        if (match) {
            const [, type, description] = match;
            if (['button', 'link', 'input', 'form', 'heading', 'image'].includes(type.toLowerCase())) {
                elements.push({
                    type: type.toLowerCase(),
                    description: description.trim(),
                    confidence: 0.8
                });
            }
        }
    }
    
    return elements;
}

/**
 * Extract suggestions from text
 */
function extractSuggestions(text) {
    const suggestions = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
        // Look for suggestion patterns
        if (line.match(/suggest|recommend|could|should|try/i)) {
            const cleaned = line.replace(/^[\s\-\*\d\.]+/, '').trim();
            if (cleaned.length > 10) {
                suggestions.push(cleaned);
            }
        }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Extract insights from text
 */
function extractInsights(text) {
    const insights = [];
    const sections = text.split('\n\n');
    
    for (const section of sections) {
        const cleaned = section.trim();
        if (cleaned.length > 20 && !cleaned.match(/^[\-\*]/)) {
            insights.push(cleaned);
        }
    }
    
    return insights.slice(0, 3); // Limit to 3 insights
}

/**
 * Generate prompts based on action type
 */
function generatePrompt(action, pageContext) {
    const baseContext = pageContext ? `
Page URL: ${pageContext.url || 'unknown'}
Page Title: ${pageContext.title || 'unknown'}
` : '';

    switch (action) {
        case 'analyze':
            return `${baseContext}
Analyze this webpage screenshot comprehensively. Provide:
1. A brief summary of the page's purpose and main content
2. List of key interactive elements (buttons, links, forms, inputs)
3. Notable design patterns or UI components
4. Any accessibility concerns or usability issues

Format your response as structured text with clear sections.`;

        case 'suggest':
            return `${baseContext}
Analyze this webpage and suggest helpful actions a user might want to take. Consider:
1. What are the primary interactive elements?
2. What tasks can the user accomplish on this page?
3. What would be logical next steps?
4. Are there any shortcuts or efficiency tips?

Provide 3-5 specific, actionable suggestions.`;

        case 'detect':
            return `${baseContext}
Identify all interactive elements in this webpage screenshot. For each element, provide:
1. Element type (button, link, input, form, etc.)
2. Brief description of the element
3. Its apparent purpose or function
4. Approximate location (top/middle/bottom, left/center/right)

Focus on elements users can click or interact with.`;

        default:
            return `${baseContext}
Analyze this webpage screenshot and provide useful insights about its structure, content, and interactive elements.`;
    }
}

/**
 * Main handler function
 */
export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: CORS_HEADERS,
            body: ''
        };
    }

    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        const requestData = JSON.parse(event.body || '{}');
        const { action = 'analyze', screenshot, pageContext, userApiKey } = requestData;

        // Validate required fields
        if (!screenshot) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    error: 'Screenshot data is required',
                    message: 'Please provide base64-encoded screenshot in the request body'
                })
            };
        }

        // Get Gemini API key - check user-provided key first, then environment
        let apiKey = userApiKey || process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY not configured and no user key provided');
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    error: 'Gemini API not configured',
                    message: 'Please configure GEMINI_API_KEY in environment variables or provide your own API key',
                    needsApiKey: true
                })
            };
        }

        // Validate API key format (basic check)
        if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
            console.error('Invalid API key format');
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    error: 'Invalid API key',
                    message: 'The provided API key appears to be invalid. Please check your key and try again.'
                })
            };
        }

        // Remove data URL prefix if present
        let imageData = screenshot;
        if (imageData.includes(',')) {
            imageData = imageData.split(',')[1];
        }

        // Generate appropriate prompt for the action
        const prompt = generatePrompt(action, pageContext);

        // Call Gemini Vision API
        console.log(`Calling Gemini API for action: ${action}, using ${userApiKey ? 'user-provided' : 'environment'} API key`);
        const geminiResponse = await callGeminiVision(imageData, prompt, apiKey);

        // Parse and structure the response
        const analysis = parseAnalysis(geminiResponse, action);

        // Return successful response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
            },
            body: JSON.stringify({
                success: true,
                action: action,
                analysis: analysis,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Error in gemini-screen-control:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Determine error type for better user feedback
        let statusCode = 500;
        let errorMessage = 'Failed to analyze screenshot';
        let userMessage = error.message;

        if (error.message.includes('API error') || error.message.includes('400')) {
            statusCode = 400;
            errorMessage = 'Invalid API request';
            userMessage = 'The API request was invalid. Please check your API key and try again.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            statusCode = 401;
            errorMessage = 'API authentication failed';
            userMessage = 'Your API key is invalid or has expired. Please check your key and try again.';
        } else if (error.message.includes('429')) {
            statusCode = 429;
            errorMessage = 'Rate limit exceeded';
            userMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            statusCode = 429;
            errorMessage = 'API quota exceeded';
            userMessage = 'Your API quota has been exceeded. Please check your Google Cloud console.';
        }

        // Return error response
        return {
            statusCode: statusCode,
            headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
            },
            body: JSON.stringify({
                success: false,
                error: errorMessage,
                message: userMessage,
                timestamp: new Date().toISOString()
            })
        };
    }
}
