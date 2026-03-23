/**
 * site-updates.mjs — Developer Activity Feed
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved.
 *
 * Fetches recent commits and merged PRs from the consciousness-revolution
 * GitHub repository and returns a structured activity feed + developer
 * leaderboard for the site-updates.html page.
 *
 * GET /api/site-updates?days=30&page=1&per_page=50&author=<login>
 *   → { commits, prs, leaderboard, meta }
 *
 * Environment variables required:
 *   GITHUB_TOKEN — personal access token with read:repo scope
 * ═══════════════════════════════════════════════════════════════════════════
 */

const REPO_OWNER  = 'overkor-tek';
const REPO_NAME   = 'consciousness-revolution';
const DEFAULT_DAYS = 30;
const MAX_DAYS     = 90;
const PER_PAGE_MAX = 100;

/** Map GitHub logins → display info */
const MEMBER_MAP = {
    overkillkulture: { name: 'Commander',  role: 'C1 Mechanic',   avatar: '🎖️',  color: '#00f5ff' },
    darrickpreble:   { name: 'Commander',  role: 'C1 Mechanic',   avatar: '🎖️',  color: '#00f5ff' },
    barbrickdesign:  { name: 'Agent R',    role: 'C2 Architect',  avatar: '🦁',  color: '#9b30ff' },
    ryanagent:       { name: 'Agent R',    role: 'C2 Architect',  avatar: '🦁',  color: '#9b30ff' },
    'github-actions':{ name: 'Automation', role: 'System',        avatar: '⚙️',  color: '#FFD700' },
    dependabot:      { name: 'Dependabot', role: 'Security Bot',  avatar: '🔧',  color: '#39ff14' },
    'dependabot[bot]':{ name: 'Dependabot', role: 'Security Bot', avatar: '🔧',  color: '#39ff14' },
    copilot:         { name: 'Copilot',    role: 'AI Assistant',  avatar: '🤖',  color: '#ff00aa' },
    'copilot-swe-agent': { name: 'Copilot', role: 'AI Assistant', avatar: '🤖', color: '#ff00aa' },
};

/** Classify a commit message into a change category */
function classifyCommit(message = '') {
    const lower = message.toLowerCase();
    if (/^feat|^add|^implement|^launch|^create|^new/i.test(lower))  return 'feature';
    if (/^fix|^bug|^patch|^hotfix|^resolve/i.test(lower))            return 'fix';
    if (/^refactor|^cleanup|^improve|^optimize|^polish/i.test(lower)) return 'refactor';
    if (/^docs?|^readme|^changelog/i.test(lower))                    return 'docs';
    if (/^style|^css|^design|^ui/i.test(lower))                     return 'style';
    if (/^test|^spec/i.test(lower))                                  return 'test';
    if (/^chore|^build|^ci|^deps?|^bump/i.test(lower))              return 'chore';
    if (/^security|^sec|^cve/i.test(lower))                         return 'security';
    return 'update';
}

/** Emoji badge for a category */
function categoryBadge(cat) {
    const badges = {
        feature:  '✨',
        fix:      '🐛',
        refactor: '♻️',
        docs:     '📚',
        style:    '🎨',
        test:     '🧪',
        chore:    '🔧',
        security: '🔒',
        update:   '📦',
    };
    return badges[cat] || '📦';
}

/** Resolve display member from a GitHub login */
function resolveMember(login = '') {
    const key = login.toLowerCase();
    return MEMBER_MAP[key] || {
        name:   login || 'Unknown',
        role:   'Contributor',
        avatar: '👤',
        color:  '#d8d8f0',
    };
}

function corsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=120',
    };
}

function json(statusCode, body) {
    return { statusCode, headers: corsHeaders(), body: JSON.stringify(body) };
}

function githubHeaders(token) {
    const h = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ConsciousnessRevolution-SiteUpdates/1.0',
    };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
}

async function ghFetch(url, token) {
    const res = await fetch(url, { headers: githubHeaders(token) });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
    }
    return res.json();
}

export const handler = async (event) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders(), body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return json(405, { error: 'Method not allowed' });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return json(200, {
            auth: false,
            commits: [],
            prs: [],
            leaderboard: [],
            meta: { message: 'Server secret missing — check GITHUB_TOKEN in repository secrets.' },
        });
    }

    const qs = event.queryStringParameters || {};

    // Parse query params
    const days    = Math.min(parseInt(qs.days    || DEFAULT_DAYS, 10),  MAX_DAYS);
    const perPage = Math.min(parseInt(qs.per_page || 50, 10),           PER_PAGE_MAX);
    const page    = Math.max(parseInt(qs.page    || 1,  10),  1);
    const filterAuthor = (qs.author || '').toLowerCase().trim();

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    try {
        // ── Fetch commits ──────────────────────────────────────────────────
        const commitUrl = [
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits`,
            `?per_page=${perPage}&page=${page}&since=${since}`,
            filterAuthor ? `&author=${encodeURIComponent(filterAuthor)}` : '',
        ].join('');

        const rawCommits = await ghFetch(commitUrl, token);

        // ── Fetch merged PRs ───────────────────────────────────────────────
        const prUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=closed&per_page=50&sort=updated&direction=desc`;
        const rawPRs = await ghFetch(prUrl, token).catch(() => []);

        // ── Process commits ────────────────────────────────────────────────
        const commits = rawCommits.map((c) => {
        // Prefer the GitHub login; fall back to a sanitised commit author name.
        // The commit author name is NOT a GitHub login (it may be "Ryan Barbrick"
        // or similar), so it won't match MEMBER_MAP — resolveMember handles that
        // gracefully by returning a generic contributor entry.
        const login  = (c.author?.login || '').toLowerCase();
        const authorName = c.commit?.author?.name || '';
        const member = resolveMember(login || authorName.toLowerCase());
            const msg    = (c.commit?.message || '').split('\n')[0].slice(0, 100);
            const cat    = classifyCommit(msg);
            return {
                sha:       c.sha?.slice(0, 7) || '',
                sha_full:  c.sha || '',
                message:   msg,
                category:  cat,
                badge:     categoryBadge(cat),
                author:    member.name,
                login:     login || authorName,
                role:      member.role,
                avatar:    member.avatar,
                color:     member.color,
                date:      c.commit?.author?.date || '',
                url:       c.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${c.sha}`,
                additions: c.stats?.additions || 0,
                deletions: c.stats?.deletions || 0,
            };
        });

        // ── Process PRs ────────────────────────────────────────────────────
        const cutoff = new Date(since);
        const prs = rawPRs
            .filter(pr => pr.merged_at && new Date(pr.merged_at) >= cutoff)
            .map(pr => {
                // PRs always have a GitHub login via pr.user.login
                const login  = (pr.user?.login || '').toLowerCase();
                const member = resolveMember(login);
                return {
                    number:    pr.number,
                    title:     (pr.title || '').slice(0, 120),
                    author:    member.name,
                    login,
                    role:      member.role,
                    avatar:    member.avatar,
                    color:     member.color,
                    merged_at: pr.merged_at,
                    url:       pr.html_url || '',
                    additions: pr.additions || 0,
                    deletions: pr.deletions || 0,
                    files:     pr.changed_files || 0,
                    labels:    (pr.labels || []).map(l => l.name),
                };
            });

        // ── Build leaderboard ──────────────────────────────────────────────
        const stats = {};

        for (const c of commits) {
            const key = c.login || c.author;
            if (!stats[key]) {
                stats[key] = {
                    login:    c.login,
                    name:     c.author,
                    role:     c.role,
                    avatar:   c.avatar,
                    color:    c.color,
                    commits:  0,
                    prs:      0,
                    categories: {},
                    last_active: c.date,
                };
            }
            const s = stats[key];
            s.commits++;
            s.categories[c.category] = (s.categories[c.category] || 0) + 1;
            if (!s.last_active || c.date > s.last_active) s.last_active = c.date;
        }

        for (const pr of prs) {
            const key = pr.login || pr.author;
            if (!stats[key]) {
                stats[key] = {
                    login:    pr.login,
                    name:     pr.author,
                    role:     pr.role,
                    avatar:   pr.avatar,
                    color:    pr.color,
                    commits:  0,
                    prs:      0,
                    categories: {},
                    last_active: pr.merged_at,
                };
            }
            stats[key].prs++;
            if (!stats[key].last_active || pr.merged_at > stats[key].last_active) {
                stats[key].last_active = pr.merged_at;
            }
        }

        const leaderboard = Object.values(stats)
            .sort((a, b) => (b.commits + b.prs * 3) - (a.commits + a.prs * 3));

        return json(200, {
            auth:        true,
            repo:        `${REPO_OWNER}/${REPO_NAME}`,
            since,
            days,
            page,
            per_page:    perPage,
            filter_author: filterAuthor || null,
            commits,
            prs,
            leaderboard,
            meta: {
                total_commits: commits.length,
                total_prs:     prs.length,
                contributors:  leaderboard.length,
                generated_at:  new Date().toISOString(),
            },
        });

    } catch (err) {
        console.error('[site-updates] Error:', err.message);
        return json(500, {
            auth:    true,
            error:   'Failed to fetch GitHub data',
            message: err.message,
            commits: [],
            prs:     [],
            leaderboard: [],
            meta: {},
        });
    }
};

export const config = { path: '/api/site-updates' };
