// voip-social-tasks.mjs — Social Automation Task API
// Endpoints:
//   POST /api/voip-social-tasks          → create a new social automation task
//   GET  /api/voip-social-tasks          → list recent social tasks
//   GET  /api/voip-social-tasks/{id}     → get a specific social task status
//
// Phase 1: uses in-memory mock store. Phase 2: will persist to database and
// drive real app automation via ADB/UIAutomator on emulator/phone nodes.

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const SUPPORTED_APPS = ['instagram', 'facebook', 'twitter', 'tiktok'];
const SUPPORTED_ACTIONS = ['send_dm', 'post', 'comment', 'follow', 'like'];

// In-memory social task store (Phase 1 mock — resets on cold start)
const socialTasks = [
    {
        task_id: 'social-201',
        app: 'instagram',
        action: 'send_dm',
        parameters: { username: 'demo_user', message: 'Hey, interested in working together!' },
        status: 'in_progress',
        node_id: 'phone-2',
        created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        result: null
    },
    {
        task_id: 'social-200',
        app: 'facebook',
        action: 'send_dm',
        parameters: { username: 'local_biz_page', message: 'Hello from the team!' },
        status: 'completed',
        node_id: 'emu-1',
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        result: 'DM sent successfully'
    }
];

let taskCounter = 202;

function generateTaskId() {
    return `social-${taskCounter++}`;
}

export const handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    const path = event.path || '';

    // GET /api/voip-social-tasks/{task_id}
    const singleMatch = path.match(/voip-social-tasks\/([^/]+)$/);
    if (singleMatch && event.httpMethod === 'GET') {
        const taskId = singleMatch[1];
        const task = socialTasks.find(t => t.task_id === taskId);
        if (!task) {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Social task not found' })
            };
        }
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(task) };
    }

    // GET /api/voip-social-tasks — list all
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(socialTasks.slice().reverse())
        };
    }

    // POST /api/voip-social-tasks — create new social task
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

        const { app, action, parameters } = body;

        if (!app || !SUPPORTED_APPS.includes(app)) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: `app must be one of: ${SUPPORTED_APPS.join(', ')}` })
            };
        }

        if (!action || !SUPPORTED_ACTIONS.includes(action)) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: `action must be one of: ${SUPPORTED_ACTIONS.join(', ')}` })
            };
        }

        const task = {
            task_id: generateTaskId(),
            app,
            action,
            parameters: parameters || {},
            status: 'queued',
            node_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            result: null
        };

        socialTasks.push(task);

        // Simulate async assignment after 1s (Phase 1 mock progression)
        setTimeout(() => {
            task.status = 'assigned';
            task.node_id = 'emu-1';
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
