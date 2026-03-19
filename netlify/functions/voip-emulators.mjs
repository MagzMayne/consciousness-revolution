// voip-emulators.mjs — VoIP Emulator Registry API
// Endpoint: GET /api/voip-emulators
// Returns the list of registered Android emulator nodes with their status and capabilities.
// Phase 1: returns mock data. Phase 2: will query real emulator orchestrator.

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// Mock emulator registry — replace with real node queries in Phase 2
const MOCK_EMULATORS = [
    {
        id: 'emu-1',
        name: 'Emulator 1 (Pixel 6 AVD)',
        status: 'online',
        capabilities: ['voip', 'instagram', 'facebook'],
        current_app: null,
        current_task: null,
        last_heartbeat: new Date().toISOString()
    },
    {
        id: 'emu-2',
        name: 'Emulator 2 (Genymotion)',
        status: 'busy',
        capabilities: ['voip', 'instagram'],
        current_app: 'com.enflick.android.TextNow',
        current_task: 'call-101',
        last_heartbeat: new Date().toISOString()
    },
    {
        id: 'emu-3',
        name: 'Emulator 3 (Waydroid)',
        status: 'offline',
        capabilities: ['voip', 'facebook'],
        current_app: null,
        current_task: null,
        last_heartbeat: new Date(Date.now() - 5 * 60 * 1000).toISOString()
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

    // Check for individual emulator status: GET /api/voip-emulators/{id}/status
    const path = event.path || '';
    const match = path.match(/voip-emulators\/([^/]+)\/status$/);
    if (match) {
        const id = match[1];
        const emulator = MOCK_EMULATORS.find(e => e.id === id);
        if (!emulator) {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Emulator not found' })
            };
        }
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(emulator)
        };
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(MOCK_EMULATORS)
    };
};
