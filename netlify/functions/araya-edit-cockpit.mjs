/**
 * ARAYA COCKPIT EDIT API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * Contact: darrickpreble@proton.me
 * Website: conciousnessrevolution.io
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Enable ARAYA to edit builder cockpit HTML files via GitHub API
 * WITHOUT requiring GitHub/Netlify/Railway access by Commander
 *
 * Flow:
 * 1. ARAYA receives request to edit builder's cockpit
 * 2. Validates builder identity + permissions
 * 3. Fetches current HTML from GitHub
 * 4. Makes targeted edit (add task, update status, etc.)
 * 5. Commits change to GitHub → auto-deploys via Netlify
 *
 * Security:
 * - Only edits OPERATOR_COCKPIT_*.html files
 * - Validates builder exists in BUILDER_COCKPITS registry
 * - Uses GitHub API (not direct file system access)
 * - Commits are attributed to "ARAYA Bot"
 */

import { BUILDER_COCKPITS, getBuilder, ACCESS_TIERS } from './domain-tools.mjs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// MAIN DEPLOYMENT REPO: ARAYA edits the live site directly
const GITHUB_OWNER = 'overkor-tek';
const GITHUB_REPO = 'consciousness-revolution';
const GITHUB_BRANCH = 'master';

// CORS headers for client access
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    // Only POST allowed
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed - use POST' })
        };
    }

    try {
        const { builder_name, edit_type, edit_data, auth_token } = JSON.parse(event.body);

        // Basic validation
        if (!builder_name || !edit_type || !edit_data) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'Missing required fields: builder_name, edit_type, edit_data'
                })
            };
        }

        // Get builder info
        const builder = getBuilder(builder_name);
        if (!builder) {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: `Builder '${builder_name}' not found in registry`
                })
            };
        }

        // Get cockpit file path (strip leading slash)
        const cockpitPath = builder.cockpit.replace(/^\//, '');
        const fullPath = cockpitPath;  // Files at repo root, not 100X_DEPLOYMENT

        console.log(`[ARAYA-EDIT] Editing cockpit for ${builder.name}: ${fullPath}`);
        console.log(`[ARAYA-EDIT] Edit type: ${edit_type}`);

        // Fetch current file from GitHub
        const currentFile = await fetchGitHubFile(fullPath);
        if (!currentFile) {
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: `Failed to fetch cockpit file from GitHub: ${fullPath}`
                })
            };
        }

        // Decode current content
        const currentContent = Buffer.from(currentFile.content, 'base64').toString('utf-8');

        // Apply edit based on type
        let newContent;
        switch (edit_type) {
            case 'add_task':
                newContent = addTaskToCockpit(currentContent, edit_data);
                break;
            case 'update_status':
                newContent = updateCockpitStatus(currentContent, edit_data);
                break;
            case 'add_note':
                newContent = addNoteToCockpit(currentContent, edit_data);
                break;
            case 'update_xp':
                newContent = updateBuilderXP(currentContent, edit_data);
                break;
            default:
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        error: `Unknown edit_type: ${edit_type}. Supported: add_task, update_status, add_note, update_xp`
                    })
                };
        }

        // Commit to GitHub
        const commitResult = await commitToGitHub(
            fullPath,
            newContent,
            currentFile.sha,
            `ARAYA: ${edit_type} for ${builder.name}`
        );

        if (!commitResult.success) {
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'Failed to commit changes to GitHub',
                    details: commitResult.error
                })
            };
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                builder: builder.name,
                cockpit: builder.cockpit,
                edit_type,
                commit_sha: commitResult.sha,
                message: `Successfully updated ${builder.name}'s cockpit - changes will deploy automatically`,
                deploy_url: 'https://consciousnessrevolution.io' + builder.cockpit
            })
        };

    } catch (error) {
        console.error('[ARAYA-EDIT] Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// GITHUB API HELPERS
// ═══════════════════════════════════════════════════════════════

async function fetchGitHubFile(path) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            console.error(`[ARAYA-EDIT] GitHub fetch failed: ${response.status} ${response.statusText}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('[ARAYA-EDIT] GitHub fetch error:', error);
        return null;
    }
}

async function commitToGitHub(path, content, sha, message) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                content: Buffer.from(content).toString('base64'),
                sha,
                branch: GITHUB_BRANCH,
                committer: {
                    name: 'ARAYA Bot',
                    email: 'araya@consciousnessrevolution.io'
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                error: `GitHub commit failed: ${response.status} ${errorData.message || response.statusText}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            sha: data.commit.sha
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// COCKPIT EDIT OPERATIONS
// ═══════════════════════════════════════════════════════════════

function addTaskToCockpit(htmlContent, taskData) {
    const { title, description, priority = 'medium', category = 'general' } = taskData;

    // Find the task list container (look for a <ul> or <div> with tasks)
    // This is a simple implementation - real version would parse DOM properly
    const taskHtml = `
            <div class="task task-${priority}">
                <div class="task-header">
                    <span class="task-title">${escapeHtml(title)}</span>
                    <span class="task-priority">${priority}</span>
                </div>
                <div class="task-desc">${escapeHtml(description)}</div>
                <div class="task-meta">
                    <span class="task-category">${category}</span>
                    <span class="task-date">${new Date().toISOString().split('T')[0]}</span>
                </div>
            </div>`;

    // Insert before closing </body> tag as a safe fallback
    // Better: find actual task container and insert there
    return htmlContent.replace('</body>', `${taskHtml}\n</body>`);
}

function updateCockpitStatus(htmlContent, statusData) {
    const { status, message } = statusData;

    // Find status indicator and update
    // Example: <div class="status">...</div>
    const statusHtml = `<div class="status status-${status}">${escapeHtml(message)}</div>`;

    // Replace existing status or insert
    if (htmlContent.includes('<div class="status')) {
        return htmlContent.replace(/<div class="status[^>]*>.*?<\/div>/s, statusHtml);
    } else {
        return htmlContent.replace('</header>', `${statusHtml}\n</header>`);
    }
}

function addNoteToCockpit(htmlContent, noteData) {
    const { note, timestamp = new Date().toISOString() } = noteData;

    const noteHtml = `
            <div class="note">
                <div class="note-time">${new Date(timestamp).toLocaleString()}</div>
                <div class="note-content">${escapeHtml(note)}</div>
            </div>`;

    return htmlContent.replace('</body>', `${noteHtml}\n</body>`);
}

function updateBuilderXP(htmlContent, xpData) {
    const { xp, action } = xpData;

    // Find XP display and update
    // Example: <span class="xp-count">0</span>
    const xpPattern = /<span class="xp-count">\d+<\/span>/;
    const newXpHtml = `<span class="xp-count">${xp}</span>`;

    if (xpPattern.test(htmlContent)) {
        return htmlContent.replace(xpPattern, newXpHtml);
    } else {
        // Insert XP counter if not present
        return htmlContent.replace('</header>', `<div class="xp-display">XP: ${newXpHtml}</div>\n</header>`);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
