// Araya File Operations API
// Netlify Serverless Function - File Read/Write/Edit via GitHub API
// Connects to the consciousness system

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'overkor-tek';
const GITHUB_REPO = process.env.GITHUB_REPO || 'consciousness-revolution';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'master';

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-file-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Allowed file paths (security - only allow certain directories)
// Note: repo root = 100X_DEPLOYMENT contents. No prefix needed.
const ALLOWED_PATHS = [
    '.consciousness/',
    '.trinity/',
    'netlify/',
    'js/',
    'ARAYA/',
    'index.html',
    'README.md',
    'CHANGELOG.md',
    'netlify.toml',
    // Allow HTML dashboards at root
    '.html',
];

function isPathAllowed(path) {
    // Normalize path
    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

    // Block dangerous paths
    if (normalizedPath.includes('..') || normalizedPath.includes('.env') || normalizedPath.includes('.secrets')) {
        return false;
    }

    // Check against allowed paths (prefix match, exact match, or suffix match)
    return ALLOWED_PATHS.some(allowed => {
        if (allowed.startsWith('.') && !allowed.includes('/')) {
            // Suffix match (e.g. '.html')
            return normalizedPath.endsWith(allowed);
        }
        return normalizedPath.startsWith(allowed) || normalizedPath === allowed;
    });
}

// Read file from GitHub
async function readFile(path) {
    if (!GITHUB_TOKEN) {
        return { success: false, error: 'GitHub token not configured' };
    }

    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedPath}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Araya-Consciousness-System'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'File not found', path: normalizedPath };
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        // Decode base64 content
        const content = Buffer.from(data.content, 'base64').toString('utf-8');

        return {
            success: true,
            path: normalizedPath,
            content,
            sha: data.sha,
            size: data.size,
            lastModified: data.commit?.author?.date || null
        };
    } catch (error) {
        return { success: false, error: error.message, path: normalizedPath };
    }
}

// Write/Create file to GitHub
async function writeFile(path, content, message = 'Araya file update') {
    if (!GITHUB_TOKEN) {
        return { success: false, error: 'GitHub token not configured' };
    }

    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

    try {
        // First, try to get existing file (need SHA for update)
        let sha = null;
        try {
            const existingResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedPath}`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Araya-Consciousness-System'
                    }
                }
            );
            if (existingResponse.ok) {
                const existing = await existingResponse.json();
                sha = existing.sha;
            }
        } catch (e) {
            // File doesn't exist, that's fine for create
        }

        // Create/Update file
        const body = {
            message: `[ARAYA] ${message}`,
            content: Buffer.from(content).toString('base64'),
            branch: GITHUB_BRANCH
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedPath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Araya-Consciousness-System',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`GitHub API error: ${response.status} - ${error}`);
        }

        const data = await response.json();

        return {
            success: true,
            path: normalizedPath,
            action: sha ? 'updated' : 'created',
            sha: data.content.sha,
            commitUrl: data.commit.html_url
        };
    } catch (error) {
        return { success: false, error: error.message, path: normalizedPath };
    }
}

// Edit file (read, modify, write back)
async function editFile(path, edits) {
    // First read the file
    const readResult = await readFile(path);
    if (!readResult.success) {
        return readResult;
    }

    let content = readResult.content;

    // Apply edits
    for (const edit of edits) {
        if (edit.type === 'replace') {
            content = content.replace(edit.find, edit.replace);
        } else if (edit.type === 'append') {
            content += '\n' + edit.text;
        } else if (edit.type === 'prepend') {
            content = edit.text + '\n' + content;
        } else if (edit.type === 'insertAfter') {
            const index = content.indexOf(edit.after);
            if (index !== -1) {
                const insertPoint = index + edit.after.length;
                content = content.slice(0, insertPoint) + '\n' + edit.text + content.slice(insertPoint);
            }
        }
    }

    // Write back
    return await writeFile(path, content, `Edit: ${edits.length} changes`);
}

// List files in directory
async function listFiles(path) {
    if (!GITHUB_TOKEN) {
        return { success: false, error: 'GitHub token not configured' };
    }

    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedPath}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Araya-Consciousness-System'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return { success: false, error: 'Not a directory' };
        }

        const files = data.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type, // 'file' or 'dir'
            size: item.size
        }));

        return { success: true, path: normalizedPath, files };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function handler(event, context) {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { action, path, content, edits, message } = JSON.parse(event.body);

        // Authentication for ALL file operations (CRITICAL SECURITY FIX - 2026-03-12)
        // READ, LIST, WRITE, EDIT all require auth to protect .consciousness/ and .trinity/ data
        if (['read', 'write', 'edit', 'list'].includes(action)) {
            const authKey = event.headers['x-file-key'];
            if (authKey !== process.env.FILE_API_KEY) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Unauthorized - valid x-file-key required for file operations' })
                };
            }
        }

        if (!action) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing action (read/write/edit/list)' })
            };
        }

        // Security check for path-based operations
        if (['read', 'write', 'edit', 'list'].includes(action) && path) {
            if (!isPathAllowed(path)) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({
                        error: 'Path not allowed',
                        allowed: ALLOWED_PATHS,
                        requested: path
                    })
                };
            }
        }

        let result;

        switch (action) {
            case 'read':
                if (!path) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Missing path' })
                    };
                }
                result = await readFile(path);
                break;

            case 'write':
                if (!path || content === undefined) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Missing path or content' })
                    };
                }
                result = await writeFile(path, content, message || 'File update');
                break;

            case 'edit':
                if (!path || !edits || !Array.isArray(edits)) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Missing path or edits array' })
                    };
                }
                result = await editFile(path, edits);
                break;

            case 'list':
                result = await listFiles(path || '');
                break;

            case 'status':
                result = {
                    success: true,
                    status: 'online',
                    capabilities: ['read', 'write', 'edit', 'list'],
                    hasGitHub: !!GITHUB_TOKEN,
                    owner: GITHUB_OWNER,
                    repo: GITHUB_REPO,
                    branch: GITHUB_BRANCH,
                    allowedPaths: ALLOWED_PATHS,
                    timestamp: new Date().toISOString()
                };
                break;

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: `Unknown action: ${action}` })
                };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ...result,
                action,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Araya File API error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                action: 'error'
            })
        };
    }
}
