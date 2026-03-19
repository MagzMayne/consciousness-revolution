// voip-call-logs.mjs — VoIP Call Logs API
// Endpoint: GET /api/voip-call-logs
// Returns completed call logs including outcome, duration, transcript, and recording URL.
// Phase 1: returns mock data. Phase 2: will read from persistent database.

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// Mock call log data — replace with real database reads in Phase 2
const MOCK_CALL_LOGS = [
    {
        task_id: 'call-100',
        node_id: 'emu-1',
        target_phone_number: '+13175550188',
        start_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        duration_seconds: 130,
        outcome: 'completed',
        transcript: 'Hello, this is a test call from the agent system.',
        recording_url: null
    },
    {
        task_id: 'call-099',
        node_id: 'emu-3',
        target_phone_number: '+13175550177',
        start_time: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 25 * 60 * 1000 + 8000).toISOString(),
        duration_seconds: 8,
        outcome: 'no_answer',
        transcript: null,
        recording_url: null
    },
    {
        task_id: 'call-098',
        node_id: 'phone-1',
        target_phone_number: '+13175550166',
        start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 60 * 60 * 1000 + 245000).toISOString(),
        duration_seconds: 245,
        outcome: 'completed',
        transcript: 'Spoke with contact, expressed interest in service.',
        recording_url: null
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
        body: JSON.stringify(MOCK_CALL_LOGS)
    };
};
