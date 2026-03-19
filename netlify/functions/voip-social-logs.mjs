// voip-social-logs.mjs — Social Automation Logs API
// Endpoint: GET /api/voip-social-logs
// Returns completed social automation task logs including outcome and result summary.
// Phase 1: returns mock data. Phase 2: will read from persistent database.

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// Mock social log data — replace with real database reads in Phase 2
const MOCK_SOCIAL_LOGS = [
    {
        task_id: 'social-200',
        app: 'facebook',
        action: 'send_dm',
        node_id: 'emu-1',
        time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        status: 'completed',
        result: 'DM sent successfully'
    },
    {
        task_id: 'social-199',
        app: 'instagram',
        action: 'follow',
        node_id: 'emu-2',
        time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'completed',
        result: 'Followed @target_account'
    },
    {
        task_id: 'social-198',
        app: 'instagram',
        action: 'send_dm',
        node_id: 'phone-2',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'failed',
        result: 'Account flagged — rate limited'
    }
];

export const handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(MOCK_SOCIAL_LOGS)
    };
};
