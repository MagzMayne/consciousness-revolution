// voip-calls.mjs — VoIP Call Task API
// Endpoints:
//   POST /api/voip-calls          → create a new call task
//   GET  /api/voip-calls          → list recent call tasks
//   GET  /api/voip-calls/{id}     → get a specific call task status
//
// Phase 1: uses in-memory mock store. Phase 2: will persist to database and
// drive real emulator/phone node orchestration.

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// In-memory call task store (Phase 1 mock — resets on cold start)
const callTasks = [
    {
        task_id: 'call-101',
        target_phone_number: '+13175550199',
        voip_app_package: 'com.enflick.android.TextNow',
        preferred_node_type: 'emulator',
        script_id: null,
        business_context: 'demo_outreach',
        status: 'in_call',
        node_id: 'emu-2',
        started_at: new Date(Date.now() - 90 * 1000).toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        task_id: 'call-100',
        target_phone_number: '+13175550188',
        voip_app_package: 'com.enflick.android.TextNow',
        preferred_node_type: 'emulator',
        script_id: null,
        business_context: 'local_plumber_outreach',
        status: 'completed',
        node_id: 'emu-1',
        started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 60 * 1000).toISOString()
    }
];

let taskCounter = 102;

function generateTaskId() {
    return `call-${taskCounter++}`;
}

export const handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    const path = event.path || '';

    // GET /api/voip-calls/{task_id}
    const singleMatch = path.match(/voip-calls\/([^/]+)$/);
    if (singleMatch && event.httpMethod === 'GET') {
        const taskId = singleMatch[1];
        const task = callTasks.find(t => t.task_id === taskId);
        if (!task) {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Call task not found' })
            };
        }
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(task) };
    }

    // GET /api/voip-calls — list all
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(callTasks.slice().reverse())
        };
    }

    // POST /api/voip-calls — create new call task
    if (event.httpMethod === 'POST') {
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Invalid JSON body' })
            };
        }

        const { target_phone_number, voip_app_package, preferred_node_type, script_id, business_context } = body;
        if (!target_phone_number) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'target_phone_number is required' })
            };
        }

        const task = {
            task_id: generateTaskId(),
            target_phone_number,
            voip_app_package: voip_app_package || 'com.enflick.android.TextNow',
            preferred_node_type: preferred_node_type || 'emulator',
            script_id: script_id || null,
            business_context: business_context || null,
            status: 'queued',
            node_id: null,
            started_at: null,
            updated_at: new Date().toISOString()
        };

        callTasks.push(task);

        // Phase 1 mock: simulate async node assignment after 1 s.
        // This mutates the in-memory task object intentionally so that a subsequent
        // GET /api/voip-calls/{id} returns the updated status. In Phase 2 this will
        // be replaced by real orchestration and a persistent data store.
        setTimeout(() => {
            task.status = 'assigned';
            task.node_id = preferred_node_type === 'phone' ? 'phone-1' : 'emu-1';
            task.updated_at = new Date().toISOString();
        }, 1000);

        return {
            statusCode: 201,
            headers: CORS_HEADERS,
            body: JSON.stringify({ task_id: task.task_id, status: task.status })
        };
    }

    return {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
