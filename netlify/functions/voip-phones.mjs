// voip-phones.mjs — Phone Farm Registry API
// Endpoint: GET /api/voip-phones
// Returns the list of physical phone farm nodes with SIM numbers, status, and capabilities.
// Phase 1: returns mock data. Phase 2: will query real phone farm orchestrator.

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// Mock phone farm registry — replace with real node queries in Phase 2
const MOCK_PHONES = [
    {
        id: 'phone-1',
        name: 'Pixel 4 — SIM 317-555-0101',
        status: 'online',
        sim_number: '+13175550101',
        capabilities: ['voip', 'instagram', 'facebook', 'otp'],
        current_app: null,
        current_task: null,
        last_heartbeat: new Date().toISOString()
    },
    {
        id: 'phone-2',
        name: 'Samsung A53 — SIM 317-555-0102',
        status: 'busy',
        sim_number: '+13175550102',
        capabilities: ['voip', 'instagram', 'otp'],
        current_app: 'com.instagram.android',
        current_task: 'social-201',
        last_heartbeat: new Date().toISOString()
    },
    {
        id: 'phone-3',
        name: 'OnePlus 9 — SIM 317-555-0103',
        status: 'online',
        sim_number: '+13175550103',
        capabilities: ['voip', 'facebook', 'otp'],
        current_app: null,
        current_task: null,
        last_heartbeat: new Date().toISOString()
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

    // Check for individual phone status: GET /api/voip-phones/{id}/status
    const path = event.path || '';
    const match = path.match(/voip-phones\/([^/]+)\/status$/);
    if (match) {
        const id = match[1];
        const phone = MOCK_PHONES.find(p => p.id === id);
        if (!phone) {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Phone not found' })
            };
        }
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(phone)
        };
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(MOCK_PHONES)
    };
};
