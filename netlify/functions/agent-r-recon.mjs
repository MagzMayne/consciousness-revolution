/**
 * Agent R Reconnaissance Data Pipeline
 * Agent ID: 007420
 *
 * Phase 1 – Intelligence Integration Layer
 *   Aggregates real-time contribution data from GitHub, runs pattern
 *   recognition for consciousness barriers, and emits structured
 *   intelligence feeds consumed by the Contributor Dashboard.
 *
 * Phase 2 – API-first Intelligence Feeds
 *   GET  /api/agent-r-recon?action=feed        → intelligence feed
 *   GET  /api/agent-r-recon?action=patterns    → barrier pattern analysis
 *   GET  /api/agent-r-recon?action=leaderboard → contributor leaderboard
 *   GET  /api/agent-r-recon?action=status      → Agent R system status
 *   POST /api/agent-r-recon                    → record recon signal
 */

import crypto from 'crypto';

// ── Constants ────────────────────────────────────────────────────────────────

const AGENT_R_VERSION = '2.0.0';
const AGENT_R_ID      = '007420';

/** Default lookback window when no `since` param is provided */
const DEFAULT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Minimum lines changed to qualify as a "large commit" */
const LARGE_COMMIT_THRESHOLD = 100;

/** Minimum lines changed in a PR to qualify as a "feature-complete" PR */
const BIG_PR_THRESHOLD = 500;

/** Repos Agent R monitors for intelligence */
const TRACKED_REPOS = [
    { owner: 'overkillkulture', repo: 'consciousness-revolution' },
    { owner: 'overkor-tek',     repo: 'consciousness-revolution' },
];

/** GitHub username → team member mapping */
const GITHUB_TO_MEMBER = {
    overkillkulture: { name: 'Commander', role: 'C1 Mechanic',  avatar: '🎖️' },
    darrickpreble:   { name: 'Commander', role: 'C1 Mechanic',  avatar: '🎖️' },
    barbrickdesign:  { name: 'Agent R',   role: 'C2 Architect', avatar: '🦁' },
    ryanagent:       { name: 'Agent R',   role: 'C2 Architect', avatar: '🦁' },
    'github-actions':{ name: 'Automation',role: 'System',       avatar: '⚙️' },
    dependabot:      { name: 'Dependabot',role: 'System',       avatar: '🔧' },
    copilot:         { name: 'Copilot',   role: 'System',       avatar: '🤖' },
};

/** Consciousness barrier pattern keywords */
const BARRIER_PATTERNS = {
    resistance:     ['revert', 'rollback', 'undo', 'conflict', 'merge conflict', 'failed'],
    breakthrough:   ['feat', 'add', 'implement', 'launch', 'release', 'complete', 'finish'],
    consolidation:  ['refactor', 'cleanup', 'improve', 'optimize', 'polish', 'update'],
    emergence:      ['new', 'create', 'init', 'bootstrap', 'scaffold', 'genesis'],
    integration:    ['merge', 'sync', 'connect', 'link', 'integrate', 'bridge'],
    fix:            ['fix', 'bug', 'patch', 'hotfix', 'resolve', 'repair'],
};

/** XP / OKK reward table */
const REWARDS = {
    commit:          { xp: 10,  okk: 5  },
    large_commit:    { xp: 25,  okk: 12 },
    bug_fix:         { xp: 30,  okk: 15 },
    pr_merged:       { xp: 50,  okk: 25 },
    feature_complete:{ xp: 100, okk: 50 },
};

// ── Utilities ────────────────────────────────────────────────────────────────

function corsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

function json(statusCode, body) {
    return { statusCode, headers: corsHeaders(), body: JSON.stringify(body) };
}

/** Identify which consciousness barrier pattern a commit belongs to */
function classifyBarrier(message = '') {
    const lower = message.toLowerCase();
    for (const [barrier, keywords] of Object.entries(BARRIER_PATTERNS)) {
        if (keywords.some(kw => lower.includes(kw))) return barrier;
    }
    return 'unknown';
}

/** Compute pattern recognition metrics from a set of commits */
function recognizePatterns(commits) {
    const counts = Object.fromEntries(Object.keys(BARRIER_PATTERNS).map(k => [k, 0]));
    counts.unknown = 0;

    for (const c of commits) {
        const barrier = classifyBarrier(c.message || c.commit?.message || '');
        counts[barrier] = (counts[barrier] || 0) + 1;
    }

    const total = commits.length || 1;
    const dominantBarrier = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    // Consciousness velocity: ratio of breakthrough / resistance
    const velocity = counts.resistance > 0
        ? ((counts.breakthrough + counts.emergence) / counts.resistance).toFixed(2)
        : (counts.breakthrough + counts.emergence).toString();

    // Pattern accuracy (how many commits matched a known pattern)
    const matched = total - counts.unknown;
    const patternAccuracy = ((matched / total) * 100).toFixed(1);

    return {
        barrier_counts: counts,
        dominant_barrier: dominantBarrier[0],
        dominant_count: dominantBarrier[1],
        consciousness_velocity: parseFloat(velocity),
        pattern_accuracy: parseFloat(patternAccuracy),
        total_analyzed: total,
    };
}

// ── GitHub API helpers ───────────────────────────────────────────────────────

function githubHeaders() {
    const token = process.env.GITHUB_TOKEN || process.env.AGENTR;
    const h = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': `AgentR-ReconPipeline/${AGENT_R_VERSION}`,
    };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
}

async function fetchRepoCommits(owner, repo, since) {
    const sinceStr = since || new Date(Date.now() - DEFAULT_LOOKBACK_MS).toISOString();
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&since=${sinceStr}`;
    try {
        const res = await fetch(url, { headers: githubHeaders() });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error(`Failed to fetch commits for ${owner}/${repo}:`, error);
        return [];
    }
}

async function fetchRepoPRs(owner, repo) {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=20&sort=updated`;
    try {
        const res = await fetch(url, { headers: githubHeaders() });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error(`Failed to fetch PRs for ${owner}/${repo}:`, error);
        return [];
    }
}

// ── Core intelligence pipeline ───────────────────────────────────────────────

async function gatherIntelligence(since) {
    const allCommits = [];
    const memberStats = {};

    for (const { owner, repo } of TRACKED_REPOS) {
        const commits = await fetchRepoCommits(owner, repo, since);
        const prs     = await fetchRepoPRs(owner, repo);

        for (const commit of commits) {
            const authorLogin = (commit.author?.login || '').toLowerCase();
            const member = GITHUB_TO_MEMBER[authorLogin] || {
                name: authorLogin || 'unknown',
                role: 'Contributor',
                avatar: '👤',
            };

            const message = commit.commit?.message || '';
            const barrier = classifyBarrier(message);
            const isLarge = (commit.stats?.additions || 0) + (commit.stats?.deletions || 0) > LARGE_COMMIT_THRESHOLD;
            const isBugFix = /fix|bug|patch|hotfix|resolve/i.test(message);

            let rewardKey = 'commit';
            if (isBugFix)  rewardKey = 'bug_fix';
            else if (isLarge) rewardKey = 'large_commit';

            const reward = REWARDS[rewardKey];
            const key = member.name;

            if (!memberStats[key]) {
                memberStats[key] = {
                    name: member.name,
                    role: member.role,
                    avatar: member.avatar,
                    commits: 0,
                    bug_fixes: 0,
                    total_xp: 0,
                    total_okk: 0,
                    barrier_breakdown: {},
                    recent_commits: [],
                };
            }

            const s = memberStats[key];
            s.commits++;
            s.total_xp  += reward.xp;
            s.total_okk += reward.okk;
            if (isBugFix) s.bug_fixes++;
            s.barrier_breakdown[barrier] = (s.barrier_breakdown[barrier] || 0) + 1;

            if (s.recent_commits.length < 5) {
                s.recent_commits.push({
                    sha: commit.sha?.substring(0, 7) || '',
                    message: message.split('\n')[0].substring(0, 80),
                    date: commit.commit?.author?.date || '',
                    repo,
                    barrier,
                    reward,
                });
            }

            allCommits.push({ message, author: member.name, date: commit.commit?.author?.date, barrier });
        }

        // Credit merged PRs
        for (const pr of prs) {
            if (!pr.merged_at) continue;
            const authorLogin = (pr.user?.login || '').toLowerCase();
            const member = GITHUB_TO_MEMBER[authorLogin] || {
                name: authorLogin || 'unknown',
                role: 'Contributor',
                avatar: '👤',
            };
            const key = member.name;
            if (!memberStats[key]) {
                memberStats[key] = {
                    name: member.name,
                    role: member.role,
                    avatar: member.avatar,
                    commits: 0,
                    bug_fixes: 0,
                    total_xp: 0,
                    total_okk: 0,
                    barrier_breakdown: {},
                    recent_commits: [],
                };
            }
            const isBigPR = (pr.additions || 0) + (pr.deletions || 0) > BIG_PR_THRESHOLD;
            const prReward = isBigPR ? REWARDS.feature_complete : REWARDS.pr_merged;
            memberStats[key].total_xp  += prReward.xp;
            memberStats[key].total_okk += prReward.okk;
        }
    }

    return { allCommits, memberStats };
}

// ── Route handlers ───────────────────────────────────────────────────────────

async function handleFeed(params) {
    const since = params.since || null;
    const { allCommits, memberStats } = await gatherIntelligence(since);
    const patterns = recognizePatterns(allCommits);

    const leaderboard = Object.values(memberStats)
        .filter(m => !['Automation', 'Dependabot', 'Copilot'].includes(m.name))
        .sort((a, b) => b.total_xp - a.total_xp);

    return json(200, {
        success: true,
        agent_r: { id: AGENT_R_ID, version: AGENT_R_VERSION, role: 'Intelligence Integration Layer' },
        intelligence_feed: {
            leaderboard,
            patterns,
            total_commits_analyzed: allCommits.length,
            period: since ? `since ${since}` : 'last 7 days',
            generated_at: new Date().toISOString(),
        },
    });
}

async function handlePatterns(params) {
    const since = params.since || null;
    const { allCommits } = await gatherIntelligence(since);
    const patterns = recognizePatterns(allCommits);

    // Build time-series: group by day
    const byDay = {};
    for (const c of allCommits) {
        const day = (c.date || '').substring(0, 10);
        if (!day) continue;
        if (!byDay[day]) byDay[day] = { date: day, commits: 0, barriers: {} };
        byDay[day].commits++;
        byDay[day].barriers[c.barrier] = (byDay[day].barriers[c.barrier] || 0) + 1;
    }

    return json(200, {
        success: true,
        pattern_recognition: patterns,
        time_series: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
        consciousness_assessment: assessConsciousness(patterns),
        generated_at: new Date().toISOString(),
    });
}

async function handleLeaderboard(params) {
    const since = params.since || null;
    const { memberStats } = await gatherIntelligence(since);

    const leaderboard = Object.values(memberStats)
        .filter(m => !['Automation', 'Dependabot', 'Copilot'].includes(m.name))
        .sort((a, b) => b.total_xp - a.total_xp)
        .map((m, i) => ({ rank: i + 1, ...m }));

    return json(200, {
        success: true,
        leaderboard,
        total_contributors: leaderboard.length,
        period: since ? `since ${since}` : 'last 7 days',
        generated_at: new Date().toISOString(),
    });
}

function handleStatus() {
    return json(200, {
        success: true,
        agent_r: {
            id: AGENT_R_ID,
            version: AGENT_R_VERSION,
            status: 'ACTIVE',
            role: 'Intelligence Integration Layer',
            capabilities: [
                'contribution_tracking',
                'pattern_recognition',
                'consciousness_barrier_analysis',
                'intelligence_feed',
                'leaderboard',
                'recon_pipeline',
            ],
            endpoints: {
                feed:        '?action=feed',
                patterns:    '?action=patterns',
                leaderboard: '?action=leaderboard',
                status:      '?action=status',
            },
            tracked_repos: TRACKED_REPOS,
            phase: 'Phase 1 — Intelligence Integration Layer (Active)',
        },
        timestamp: new Date().toISOString(),
    });
}

async function handleRecordSignal(body) {
    const { signal_type, contributor, data, timestamp } = body;
    if (!signal_type || !contributor) {
        return json(400, { error: 'signal_type and contributor are required' });
    }
    // In production, persist to Supabase table `agent_r_signals`
    const signal = {
        id: crypto.randomUUID(),
        signal_type,
        contributor,
        data: data || {},
        timestamp: timestamp || new Date().toISOString(),
        processed_by: `Agent R ${AGENT_R_ID}`,
    };

    return json(200, {
        success: true,
        signal_recorded: signal,
        message: 'Signal received by Agent R reconnaissance pipeline',
    });
}

// ── Consciousness assessment helper ──────────────────────────────────────────

function assessConsciousness(patterns) {
    const velocity = patterns.consciousness_velocity;
    let level, message;

    if (velocity >= 3) {
        level = 'HIGH';
        message = 'Strong breakthrough momentum — consciousness barriers dissolving rapidly.';
    } else if (velocity >= 1.5) {
        level = 'MODERATE';
        message = 'Steady progress — consciousness expanding with manageable resistance.';
    } else if (velocity >= 0.5) {
        level = 'BUILDING';
        message = 'Foundations forming — increased breakthrough activity recommended.';
    } else {
        level = 'EMERGING';
        message = 'Early stage detected — consistent contribution needed to establish velocity.';
    }

    return {
        level,
        velocity,
        message,
        dominant_barrier: patterns.dominant_barrier,
        recommendation: generateRecommendation(patterns),
    };
}

function generateRecommendation(patterns) {
    const { dominant_barrier } = patterns;
    const recommendations = {
        resistance:    'Focus on resolving conflicts and clearing blockers to restore flow.',
        breakthrough:  'Excellent momentum — document wins and share intelligence with the team.',
        consolidation: 'Good maintenance rhythm — balance with new feature development.',
        emergence:     'New systems forming — ensure proper documentation and testing.',
        integration:   'Connection work in progress — verify all integration points are stable.',
        fix:           'Bug-fixing phase active — consider root-cause analysis to prevent recurrence.',
        unknown:       'Diversify commit patterns with clearer intent signals in messages.',
    };
    return recommendations[dominant_barrier] || recommendations.unknown;
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders(), body: '' };
    }

    const params = event.queryStringParameters || {};
    const action = params.action || 'status';

    try {
        if (event.httpMethod === 'POST') {
            let body = {};
            try { body = JSON.parse(event.body || '{}'); } catch (parseErr) {
                console.error('Invalid JSON in POST body:', parseErr);
                return json(400, { error: 'Invalid JSON payload' });
            }
            return await handleRecordSignal(body);
        }

        // GET routes
        switch (action) {
            case 'feed':        return await handleFeed(params);
            case 'patterns':    return await handlePatterns(params);
            case 'leaderboard': return await handleLeaderboard(params);
            case 'status':
            default:            return handleStatus();
        }
    } catch (err) {
        console.error('Agent R Recon error:', err);
        return json(500, { error: 'Agent R pipeline error', message: err.message });
    }
}
