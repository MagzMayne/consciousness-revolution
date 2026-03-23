/**
 * DISCORD BACKLOG AUTO-SUBMITTER
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | AgentR R3
 *
 * Compiles all work done in the repository (GitHub commits, PRs, issues,
 * releases) into an organized backlog and auto-posts it to Discord.
 *
 * Routes:
 *   GET  /api/discord-backlog?period=week|month|day   – preview backlog
 *   POST /api/discord-backlog                          – submit to Discord
 *        body: { period?, channel?, key? }
 *
 * Environment Variables Required:
 *   DISCORD_BOT_TOKEN   – Bot token for Discord REST API
 *   GITHUB_TOKEN        – GitHub PAT (read:repo)
 *   ADMIN_EXPORT_KEY    – Admin auth key (default: consciousness137)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'overkor-tek/consciousness-revolution';
const GUILD_ID = '1458000070862573805';
const ADMIN_KEY = process.env.ADMIN_EXPORT_KEY || 'consciousness137';

// Channel registry – mirrors discord-admin.mjs
const CHANNELS = {
    completed:      '1458298435974336573',
    taskBoard:      '1458298425752944826',
    alerts:         '1458298272228835413',
    t1Builders:     '1458298282030665923',
    t2Architects:   '1458298291509792943',
    t3Oracles:      '1458298301463007347',
    commandCenter:  '1458302230544384090',
    memberSafety:   '1458000070862573805', // #member-safety — NOTE: Discord only reveals the real channel ID to bots with SERVER MEMBERS INTENT. Using the guild ID as a fallback until the actual channel ID is confirmed.
    general:        '1458000071604834430',
    betaLab:        '1468453143653126277',
    bugReports:     '1458298445864501370'
};

// ── CORS ────────────────────────────────────────────────────────────────────
const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

// ── Period helpers ──────────────────────────────────────────────────────────
function periodToSince(period) {
    const now = new Date();
    const map = { day: 1, week: 7, month: 30 };
    const days = map[period] || 7;
    now.setDate(now.getDate() - days);
    return now.toISOString();
}

function periodLabel(period) {
    return { day: 'Last 24 Hours', week: 'Last 7 Days', month: 'Last 30 Days' }[period] || 'Last 7 Days';
}

// ── GitHub helpers ──────────────────────────────────────────────────────────
async function ghFetch(path, token) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}${path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'consciousness-revolution-backlog/1.0'
        }
    });
    if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
    return res.json();
}

async function fetchCommits(since, token) {
    try {
        const data = await ghFetch(`/commits?since=${since}&per_page=25`, token);
        return data.map(c => ({
            sha: c.sha?.slice(0, 7),
            message: c.commit?.message?.split('\n')[0] || 'Update',
            author: c.commit?.author?.name || 'Unknown',
            date: c.commit?.author?.date,
            url: c.html_url
        }));
    } catch { return []; }
}

async function fetchPRs(since, token) {
    try {
        const data = await ghFetch(`/pulls?state=closed&sort=updated&direction=desc&per_page=15`, token);
        const cutoff = new Date(since);
        return data
            .filter(pr => pr.merged_at && new Date(pr.merged_at) > cutoff)
            .map(pr => ({
                number: pr.number,
                title: pr.title,
                author: pr.user?.login || 'Unknown',
                merged_at: pr.merged_at,
                url: pr.html_url
            }));
    } catch { return []; }
}

async function fetchIssues(since, token) {
    try {
        const data = await ghFetch(`/issues?state=closed&sort=updated&direction=desc&since=${since}&per_page=20`, token);
        return data
            .filter(i => !i.pull_request) // exclude PRs
            .map(i => ({
                number: i.number,
                title: i.title,
                author: i.user?.login || 'Unknown',
                closed_at: i.closed_at,
                url: i.html_url,
                labels: (i.labels || []).map(l => l.name)
            }));
    } catch { return []; }
}

async function fetchReleases(since, token) {
    try {
        const data = await ghFetch(`/releases?per_page=5`, token);
        const cutoff = new Date(since);
        return data
            .filter(r => new Date(r.published_at) > cutoff)
            .map(r => ({
                name: r.name || r.tag_name,
                tag: r.tag_name,
                published_at: r.published_at,
                url: r.html_url,
                body: (r.body || '').slice(0, 200)
            }));
    } catch { return []; }
}

// ── Backlog compiler ────────────────────────────────────────────────────────
async function compileBacklog(period) {
    const token = GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not configured');

    const since = periodToSince(period);
    const [commits, prs, issues, releases] = await Promise.all([
        fetchCommits(since, token),
        fetchPRs(since, token),
        fetchIssues(since, token),
        fetchReleases(since, token)
    ]);

    return { period, since, commits, prs, issues, releases };
}

// ── Discord embed builder ───────────────────────────────────────────────────
function buildEmbeds(backlog) {
    const label = periodLabel(backlog.period);
    const ts = new Date().toISOString();
    const embeds = [];

    // Header embed
    embeds.push({
        title: `📋 Consciousness Revolution — Work Backlog`,
        description: [
            `**Period:** ${label}`,
            `**Repo:** [${GITHUB_REPO}](https://github.com/${GITHUB_REPO})`,
            '',
            `📦 **${backlog.commits.length}** commits · ` +
            `🔀 **${backlog.prs.length}** merged PRs · ` +
            `✅ **${backlog.issues.length}** closed issues · ` +
            `🚀 **${backlog.releases.length}** releases`
        ].join('\n'),
        color: 0x5865F2,
        timestamp: ts,
        footer: { text: 'AgentR R3 · Auto-Backlog System · consciousnessrevolution.io' }
    });

    // Releases (highest priority)
    if (backlog.releases.length > 0) {
        embeds.push({
            title: `🚀 Releases (${backlog.releases.length})`,
            description: backlog.releases.map(r =>
                `**[${r.name}](${r.url})** \`${r.tag}\`\n${r.body ? r.body.slice(0, 120) + (r.body.length > 120 ? '…' : '') : ''}`
            ).join('\n\n'),
            color: 0x57F287
        });
    }

    // Merged PRs
    if (backlog.prs.length > 0) {
        const lines = backlog.prs.slice(0, 10).map(pr =>
            `• [#${pr.number}](${pr.url}) **${pr.title.slice(0, 60)}${pr.title.length > 60 ? '…' : ''}** _by ${pr.author}_`
        );
        embeds.push({
            title: `🔀 Merged Pull Requests (${backlog.prs.length})`,
            description: lines.join('\n'),
            color: 0xEB459E
        });
    }

    // Closed issues
    if (backlog.issues.length > 0) {
        const lines = backlog.issues.slice(0, 10).map(i => {
            const labelStr = i.labels.length ? ` [${i.labels.join(', ')}]` : '';
            return `• [#${i.number}](${i.url}) **${i.title.slice(0, 55)}${i.title.length > 55 ? '…' : ''}**${labelStr}`;
        });
        embeds.push({
            title: `✅ Closed Issues (${backlog.issues.length})`,
            description: lines.join('\n'),
            color: 0xFEE75C
        });
    }

    // Recent commits
    if (backlog.commits.length > 0) {
        const lines = backlog.commits.slice(0, 12).map(c =>
            `• \`${c.sha}\` ${c.message.slice(0, 55)}${c.message.length > 55 ? '…' : ''} _${c.author}_`
        );
        embeds.push({
            title: `📦 Recent Commits (${backlog.commits.length})`,
            description: lines.join('\n'),
            color: 0x00d9ff
        });
    }

    // Cap at 10 embeds (Discord limit)
    return embeds.slice(0, 10);
}

// ── Discord poster ──────────────────────────────────────────────────────────
async function postToDiscord(channelId, embeds) {
    if (!DISCORD_BOT_TOKEN) throw new Error('DISCORD_BOT_TOKEN not configured');

    // Discord allows max 10 embeds per message
    const batches = [];
    for (let i = 0; i < embeds.length; i += 10) {
        batches.push(embeds.slice(i, i + 10));
    }

    const results = [];
    for (const batch of batches) {
        const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ embeds: batch })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Discord API ${res.status}: ${err}`);
        }

        results.push(await res.json());
        if (batches.length > 1) await new Promise(r => setTimeout(r, 1000));
    }
    return results;
}

// ── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, context) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'week';

    // ── GET: preview backlog ──────────────────────────────────────────────
    if (req.method === 'GET') {
        try {
            const backlog = await compileBacklog(period);
            const embeds = buildEmbeds(backlog);
            return new Response(JSON.stringify({
                success: true,
                period,
                summary: {
                    commits: backlog.commits.length,
                    prs: backlog.prs.length,
                    issues: backlog.issues.length,
                    releases: backlog.releases.length
                },
                backlog,
                embedCount: embeds.length,
                preview: embeds
            }), { status: 200, headers: CORS });
        } catch (err) {
            return new Response(JSON.stringify({
                success: false,
                error: err.message,
                hint: err.message.includes('GITHUB_TOKEN')
                    ? 'Add GITHUB_TOKEN to Netlify environment variables'
                    : null
            }), { status: 500, headers: CORS });
        }
    }

    // ── POST: compile + submit to Discord ────────────────────────────────
    if (req.method === 'POST') {
        let body = {};
        try { body = await req.json(); } catch { /* empty body ok */ }

        // Auth check
        const key = body.key || url.searchParams.get('key');
        if (key !== ADMIN_KEY) {
            return new Response(JSON.stringify({ error: 'Unauthorized — provide admin key' }), {
                status: 401, headers: CORS
            });
        }

        const targetPeriod = body.period || period;
        const channelKey = body.channel || 'completed';
        const channelId = CHANNELS[channelKey] || CHANNELS.completed;

        try {
            const backlog = await compileBacklog(targetPeriod);
            const embeds = buildEmbeds(backlog);
            const posted = await postToDiscord(channelId, embeds);

            return new Response(JSON.stringify({
                success: true,
                period: targetPeriod,
                channel: channelKey,
                channelId,
                messagesPosted: posted.length,
                summary: {
                    commits: backlog.commits.length,
                    prs: backlog.prs.length,
                    issues: backlog.issues.length,
                    releases: backlog.releases.length
                }
            }), { status: 200, headers: CORS });
        } catch (err) {
            return new Response(JSON.stringify({
                success: false,
                error: err.message,
                hint: err.message.includes('DISCORD_BOT_TOKEN')
                    ? 'Add DISCORD_BOT_TOKEN to Netlify environment variables'
                    : err.message.includes('GITHUB_TOKEN')
                    ? 'Add GITHUB_TOKEN to Netlify environment variables'
                    : null
            }), { status: 500, headers: CORS });
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: CORS
    });
}

export const config = {
    path: '/api/discord-backlog'
};
