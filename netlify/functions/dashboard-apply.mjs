/**
 * DASHBOARD DIRECT APPLY API
 * For operators to immediately commit code to their dashboards
 * Called by ARAYA extension when capturing code from any AI chat
 */

import { Octokit } from '@octokit/rest';

const REPO_OWNER = 'overkor-tek';
const REPO_NAME = 'consciousness-revolution';

// Dashboard ownership map
const DASHBOARD_OWNERS = {
    'AGENT_R_777.html': ['commander', 'darrick'],
    'TIGER_777.html': ['tiger'],
    'MAGGIE_777.html': ['maggie'],
    'COMMANDER_DOMAIN_1.html': ['commander', 'darrick'],
    // Add more as operators join
};

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST required' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { file, code, action, userId, description } = body;

        // Validate file
        if (!file) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'file required', available: Object.keys(DASHBOARD_OWNERS) })
            };
        }

        // Validate code
        if (!code) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'code required' })
            };
        }

        // Initialize GitHub client
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

        // Read current file
        let currentContent, fileSha;
        try {
            const { data } = await octokit.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: file
            });
            currentContent = Buffer.from(data.content, 'base64').toString('utf-8');
            fileSha = data.sha;
        } catch (e) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: `File not found: ${file}` })
            };
        }

        // Apply code based on action type
        let newContent;
        const actionType = action || 'append_body';

        switch (actionType) {
            case 'append_body':
                newContent = currentContent.replace('</body>', `\n<!-- ARAYA-INJECTED -->\n${code}\n<!-- /ARAYA-INJECTED -->\n</body>`);
                break;

            case 'append_head':
                newContent = currentContent.replace('</head>', `\n${code}\n</head>`);
                break;

            case 'add_button':
                // Find button container or add before </body>
                if (currentContent.includes('class="action-buttons"')) {
                    newContent = currentContent.replace(
                        /(class="action-buttons"[^>]*>)/,
                        `$1\n    ${code}`
                    );
                } else if (currentContent.includes('class="button-container"')) {
                    newContent = currentContent.replace(
                        /(class="button-container"[^>]*>)/,
                        `$1\n    ${code}`
                    );
                } else {
                    newContent = currentContent.replace('</body>',
                        `\n<div class="action-buttons">\n    ${code}\n</div>\n</body>`);
                }
                break;

            case 'add_style':
                if (currentContent.includes('<style>')) {
                    newContent = currentContent.replace('</style>', `\n${code}\n</style>`);
                } else {
                    newContent = currentContent.replace('</head>', `\n<style>\n${code}\n</style>\n</head>`);
                }
                break;

            case 'add_script':
                newContent = currentContent.replace('</body>',
                    `\n<script>\n${code}\n</script>\n</body>`);
                break;

            case 'replace':
                // Full replacement (dangerous, requires exact match)
                if (!body.target) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'target required for replace action' }) };
                }
                newContent = currentContent.replace(body.target, code);
                break;

            default:
                newContent = currentContent.replace('</body>', `\n${code}\n</body>`);
        }

        // Commit to GitHub
        const commitMessage = description 
            ? `[ARAYA Extension] ${description}`
            : `[ARAYA Extension] ${actionType} - Code injection`;

        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: file,
            message: commitMessage,
            content: Buffer.from(newContent).toString('base64'),
            sha: fileSha
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                file,
                action: actionType,
                message: `Code applied to ${file}`,
                commitMessage,
                note: 'Netlify auto-deploys in ~30 seconds. Refresh to see changes.'
            })
        };

    } catch (error) {
        console.error('[DASHBOARD-APPLY]', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}
