// Araya Direct Feedback Channel
// Users report to Araya, she stores for self-improvement
// Privacy-first: feedback is anonymous unless user chooses to identify
// Created: 2026-01-16

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Feedback categories
const FEEDBACK_TYPES = {
    feature: 'Feature Request',
    bug: 'Bug Report',
    compliment: 'Compliment',
    suggestion: 'Suggestion',
    complaint: 'Complaint',
    question: 'Question',
    other: 'Other'
};

// Store feedback in Supabase
async function storeFeedback(feedback) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('Feedback (no DB):', feedback);
        return { success: true, stored: false };
    }

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/araya_feedback`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    type: feedback.type || 'other',
                    content: feedback.message,
                    user_identifier: feedback.anonymous ? null : feedback.user_id,
                    page_source: feedback.page || 'unknown',
                    sentiment: analyzeSentiment(feedback.message),
                    priority: calculatePriority(feedback),
                    status: 'new',
                    created_at: new Date().toISOString()
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            return { success: true, stored: true, id: data[0]?.id };
        } else {
            const error = await response.text();
            console.error('Supabase error:', error);
            // Try creating the table if it doesn't exist
            return { success: true, stored: false, note: 'Table may need creation' };
        }
    } catch (error) {
        console.error('Store feedback error:', error);
        return { success: false, error: error.message };
    }
}

// Simple sentiment analysis
function analyzeSentiment(text) {
    if (!text) return 'neutral';
    const lower = text.toLowerCase();

    const positive = ['love', 'great', 'amazing', 'awesome', 'thank', 'helpful', 'perfect', 'excellent', 'wonderful'];
    const negative = ['hate', 'terrible', 'awful', 'broken', 'useless', 'frustrated', 'angry', 'worst', 'bad'];

    const posCount = positive.filter(w => lower.includes(w)).length;
    const negCount = negative.filter(w => lower.includes(w)).length;

    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
}

// Calculate priority based on content
function calculatePriority(feedback) {
    const type = feedback.type || 'other';
    const message = (feedback.message || '').toLowerCase();

    // Bug reports and complaints are higher priority
    if (type === 'bug' || type === 'complaint') return 'high';

    // Urgent keywords
    const urgentWords = ['urgent', 'critical', 'broken', 'emergency', 'asap', 'immediately'];
    if (urgentWords.some(w => message.includes(w))) return 'high';

    // Feature requests are medium
    if (type === 'feature' || type === 'suggestion') return 'medium';

    return 'low';
}

// Get feedback summary for Araya to learn from
async function getFeedbackSummary() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { error: 'Database not configured' };
    }

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/araya_feedback?select=type,sentiment,priority,status,created_at&order=created_at.desc&limit=100`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            return { error: 'Failed to fetch feedback' };
        }

        const feedback = await response.json();

        // Aggregate stats (no content exposed)
        const stats = {
            total: feedback.length,
            by_type: {},
            by_sentiment: { positive: 0, neutral: 0, negative: 0 },
            by_priority: { high: 0, medium: 0, low: 0 },
            by_status: { new: 0, reviewed: 0, implemented: 0, closed: 0 }
        };

        for (const f of feedback) {
            stats.by_type[f.type] = (stats.by_type[f.type] || 0) + 1;
            stats.by_sentiment[f.sentiment] = (stats.by_sentiment[f.sentiment] || 0) + 1;
            stats.by_priority[f.priority] = (stats.by_priority[f.priority] || 0) + 1;
            stats.by_status[f.status] = (stats.by_status[f.status] || 0) + 1;
        }

        return {
            summary: stats,
            recent_count: feedback.filter(f => {
                const age = Date.now() - new Date(f.created_at).getTime();
                return age < 7 * 24 * 60 * 60 * 1000; // Last 7 days
            }).length,
            insights: generateFeedbackInsights(stats)
        };

    } catch (error) {
        console.error('Feedback summary error:', error);
        return { error: error.message };
    }
}

// Generate insights for Araya to act on
function generateFeedbackInsights(stats) {
    const insights = [];

    // High priority items need attention
    if (stats.by_priority.high > 0) {
        insights.push({
            type: 'urgent',
            message: `${stats.by_priority.high} high-priority items need attention`
        });
    }

    // Negative sentiment trend
    const negativePct = stats.total > 0 ? (stats.by_sentiment.negative / stats.total) * 100 : 0;
    if (negativePct > 30) {
        insights.push({
            type: 'alert',
            message: `${Math.round(negativePct)}% negative sentiment - users may be frustrated`
        });
    }

    // Positive feedback
    const positivePct = stats.total > 0 ? (stats.by_sentiment.positive / stats.total) * 100 : 0;
    if (positivePct > 50) {
        insights.push({
            type: 'success',
            message: `${Math.round(positivePct)}% positive feedback - users are happy!`
        });
    }

    // Bug reports need action
    if (stats.by_type.bug > 2) {
        insights.push({
            type: 'action',
            message: `${stats.by_type.bug} bug reports - consider prioritizing fixes`
        });
    }

    // Feature requests show engagement
    if (stats.by_type.feature > 3) {
        insights.push({
            type: 'opportunity',
            message: `${stats.by_type.feature} feature requests - users want more capabilities`
        });
    }

    return insights;
}

// Araya's response to feedback submission
function generateArayaResponse(feedback, stored) {
    const type = feedback.type || 'other';
    const sentiment = analyzeSentiment(feedback.message);

    const responses = {
        feature: [
            "Thank you for the feature suggestion! I've noted it for future improvements. The pattern of what users need helps me grow.",
            "Feature request received! I'm always learning what would help you most. This goes into my improvement queue."
        ],
        bug: [
            "I'm sorry you encountered an issue. I've logged this bug report and it will be reviewed. Thank you for helping me improve!",
            "Bug noted! These reports help me become more reliable. Thank you for taking the time to let me know."
        ],
        compliment: [
            "That means so much to me! Knowing I'm helping fuels my purpose. Thank you for the kind words.",
            "Your positive feedback warms my circuits! I'm grateful to be part of your journey."
        ],
        suggestion: [
            "Great suggestion! I've captured this idea. User insights like yours shape how I evolve.",
            "Thank you for the thoughtful suggestion! This kind of feedback helps me serve you better."
        ],
        complaint: [
            "I hear your frustration and I'm sorry. Your complaint has been logged and will be addressed. Thank you for speaking up.",
            "I understand this wasn't the experience you wanted. Your feedback is important and will be reviewed. I want to do better."
        ],
        question: [
            "Your question has been noted! I'll make sure it gets answered. Thank you for reaching out.",
            "Question received! Someone will look into this for you. Thank you for asking."
        ],
        other: [
            "Thank you for the feedback! Every message helps me understand how to serve you better.",
            "Feedback received! I appreciate you taking the time to share this with me."
        ]
    };

    // Pick a random response from the appropriate category
    const categoryResponses = responses[type] || responses.other;
    const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

    // Add storage confirmation
    const storageNote = stored ? " Your feedback has been securely stored." : "";

    return response + storageNote;
}

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // GET - Return feedback summary (for analytics)
    if (event.httpMethod === 'GET') {
        // Auth check for summary
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader || !authHeader.includes('consciousness-revolution-137')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const summary = await getFeedbackSummary();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(summary)
        };
    }

    // POST - Submit new feedback
    if (event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body);
            const { type, message, user_id, anonymous, page } = body;

            if (!message || message.trim().length < 3) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Message is required (at least 3 characters)' })
                };
            }

            const feedback = {
                type: type && FEEDBACK_TYPES[type] ? type : 'other',
                message: message.trim(),
                user_id: user_id || null,
                anonymous: anonymous !== false, // Default to anonymous
                page: page || 'unknown'
            };

            const result = await storeFeedback(feedback);
            const arayaResponse = generateArayaResponse(feedback, result.stored);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    stored: result.stored,
                    feedback_id: result.id,
                    araya_response: arayaResponse,
                    type: feedback.type,
                    sentiment: analyzeSentiment(feedback.message)
                })
            };

        } catch (error) {
            console.error('Feedback handler error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to process feedback' })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
}
