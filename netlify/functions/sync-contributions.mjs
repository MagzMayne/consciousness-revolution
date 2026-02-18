/**
 * SYNC CONTRIBUTIONS
 * Fetches contribution data directly from GitHub API
 * Used to populate initial data and sync missed webhook events
 *
 * GET ?repo=consciousness-revolution - Fetch commits for a repo
 * GET ?contributor=Commander - Fetch all repos for a contributor
 * GET ?sync=true - Full sync of all tracked repos
 */

// Reward tiers (same as webhook)
const REWARDS = {
    commit: { xp: 10, okk: 5 },
    pr_merged: { xp: 50, okk: 25 },
    issue_closed: { xp: 30, okk: 15 },
    large_commit: { xp: 25, okk: 12 } // 100+ lines changed
};

// GitHub username to team member mapping
const GITHUB_TO_TEAM = {
    'overkillkulture': { name: 'Commander', id: 'commander_1', avatar: '🎖️' },
    'darrickpreble': { name: 'Commander', id: 'commander_1', avatar: '🎖️' },
    'barbrickdesign': { name: 'Ryan', id: 'agent_r_1', avatar: '🦁' },
    'ryanagent': { name: 'Ryan', id: 'agent_r_1', avatar: '🦁' },
    'copilot': { name: 'Copilot', id: 'copilot', avatar: '🤖' },
    'github-actions': { name: 'Automation', id: 'automation', avatar: '⚙️' },
    'dependabot': { name: 'Dependabot', id: 'dependabot', avatar: '🔧' }
};

// Repos to track
const TRACKED_REPOS = [
    { owner: 'overkillkulture', repo: 'consciousness-revolution', projects: ['araya-chat', 'widget-system', 'trinity-system'] },
    { owner: 'overkillkulture', repo: 'consciousness-bugs', projects: ['bug-tracker'] },
    { owner: 'overkor-tek', repo: 'consciousness-revolution', projects: ['araya-chat', 'widget-system', 'trinity-system'] }
];

// Project file patterns for auto-detection
const PROJECT_PATTERNS = {
    'araya-chat': ['araya', 'chat', 'ai-chat'],
    'widget-system': ['widget', 'dashboard'],
    'trinity-system': ['trinity', 'c1', 'c2', 'c3'],
    'bug-tracker': ['bug', 'issue'],
    'operator-cockpits': ['cockpit', 'operator'],
    'budget-boss': ['budget', 'finance'],
    'banksky': ['bank', 'defi', 'web3']
};

/**
 * Detect which project a commit belongs to based on files changed
 */
function detectProject(commit) {
    const files = commit.files || [];
    const message = (commit.commit?.message || '').toLowerCase();

    for (const [projectId, patterns] of Object.entries(PROJECT_PATTERNS)) {
        // Check commit message
        if (patterns.some(p => message.includes(p))) {
            return projectId;
        }
        // Check files changed
        for (const file of files) {
            const filename = (file.filename || '').toLowerCase();
            if (patterns.some(p => filename.includes(p))) {
                return projectId;
            }
        }
    }

    return 'general'; // Default project
}

/**
 * Calculate reward based on commit size and type
 */
function calculateReward(commit) {
    const message = (commit.commit?.message || '').toLowerCase();
    const stats = commit.stats || { additions: 0, deletions: 0 };
    const totalChanges = stats.additions + stats.deletions;

    // Bug fix detection
    if (/fix|bug|issue|closes?\s+#\d+/i.test(message)) {
        return { ...REWARDS.issue_closed, type: 'bug_fix' };
    }

    // Large commit bonus
    if (totalChanges > 100) {
        return { ...REWARDS.large_commit, type: 'large_commit' };
    }

    return { ...REWARDS.commit, type: 'commit' };
}

/**
 * Fetch commits from GitHub API
 */
async function fetchCommits(owner, repo, since = null, page = 1) {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ConsciousnessRevolution-ContributionTracker'
    };

    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    let url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`;
    if (since) {
        url += `&since=${since}`;
    }

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching commits for ${owner}/${repo}:`, error);
        return [];
    }
}

/**
 * Fetch commit details (for file changes)
 */
async function fetchCommitDetails(owner, repo, sha) {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ConsciousnessRevolution-ContributionTracker'
    };

    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
            { headers }
        );

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}

/**
 * Process commits into contribution records
 */
async function processCommits(owner, repo, commits) {
    const contributions = {};

    for (const commit of commits) {
        const authorLogin = commit.author?.login || commit.commit?.author?.name || 'unknown';
        const teamMember = GITHUB_TO_TEAM[authorLogin.toLowerCase()] || {
            name: authorLogin,
            id: authorLogin.toLowerCase(),
            avatar: '👤'
        };

        // Get commit details for file changes
        const details = await fetchCommitDetails(owner, repo, commit.sha);
        const project = detectProject(details || commit);
        const reward = calculateReward(details || commit);

        const key = `${teamMember.name}_${repo}`;

        if (!contributions[key]) {
            contributions[key] = {
                contributor: teamMember.name,
                contributorId: teamMember.id,
                avatar: teamMember.avatar,
                repo: repo,
                totalXP: 0,
                totalOKK: 0,
                commits: 0,
                bugFixes: 0,
                largeCommits: 0,
                linesAdded: 0,
                linesRemoved: 0,
                projects: new Set(),
                recentCommits: []
            };
        }

        const record = contributions[key];
        record.totalXP += reward.xp;
        record.totalOKK += reward.okk;
        record.commits++;

        if (reward.type === 'bug_fix') record.bugFixes++;
        if (reward.type === 'large_commit') record.largeCommits++;

        if (details?.stats) {
            record.linesAdded += details.stats.additions || 0;
            record.linesRemoved += details.stats.deletions || 0;
        }

        record.projects.add(project);

        // Keep last 10 commits
        if (record.recentCommits.length < 10) {
            record.recentCommits.push({
                sha: commit.sha?.substring(0, 7),
                message: commit.commit?.message?.split('\n')[0]?.substring(0, 80),
                date: commit.commit?.author?.date,
                project: project,
                reward: reward
            });
        }
    }

    // Convert Sets to Arrays
    for (const key of Object.keys(contributions)) {
        contributions[key].projects = Array.from(contributions[key].projects);
    }

    return contributions;
}

/**
 * Aggregate contributions across all repos
 */
function aggregateContributions(allContributions) {
    const aggregated = {};

    for (const repoContributions of allContributions) {
        for (const [key, data] of Object.entries(repoContributions)) {
            const aggKey = data.contributor;

            if (!aggregated[aggKey]) {
                aggregated[aggKey] = {
                    contributor: data.contributor,
                    contributorId: data.contributorId,
                    avatar: data.avatar,
                    totalXP: 0,
                    totalOKK: 0,
                    totalCommits: 0,
                    totalBugFixes: 0,
                    totalLinesAdded: 0,
                    totalLinesRemoved: 0,
                    repos: [],
                    projects: new Set(),
                    recentActivity: []
                };
            }

            const agg = aggregated[aggKey];
            agg.totalXP += data.totalXP;
            agg.totalOKK += data.totalOKK;
            agg.totalCommits += data.commits;
            agg.totalBugFixes += data.bugFixes;
            agg.totalLinesAdded += data.linesAdded;
            agg.totalLinesRemoved += data.linesRemoved;
            agg.repos.push(data.repo);
            data.projects.forEach(p => agg.projects.add(p));
            agg.recentActivity.push(...data.recentCommits);
        }
    }

    // Convert Sets and sort activity
    for (const key of Object.keys(aggregated)) {
        aggregated[key].projects = Array.from(aggregated[key].projects);
        aggregated[key].recentActivity = aggregated[key].recentActivity
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 15);
    }

    return aggregated;
}

export async function handler(event) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const params = event.queryStringParameters || {};

    try {
        // Sync specific repo
        if (params.repo) {
            const [owner, repo] = params.repo.includes('/')
                ? params.repo.split('/')
                : ['overkillkulture', params.repo];

            const since = params.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const commits = await fetchCommits(owner, repo, since);
            const contributions = await processCommits(owner, repo, commits);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    repo: `${owner}/${repo}`,
                    commitsProcessed: commits.length,
                    contributions: Object.values(contributions),
                    since: since
                })
            };
        }

        // Full sync of all tracked repos
        if (params.sync === 'true') {
            const since = params.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const allContributions = [];

            for (const { owner, repo } of TRACKED_REPOS) {
                try {
                    const commits = await fetchCommits(owner, repo, since);
                    const contributions = await processCommits(owner, repo, commits);
                    allContributions.push(contributions);
                } catch (e) {
                    console.error(`Error syncing ${owner}/${repo}:`, e);
                }
            }

            const aggregated = aggregateContributions(allContributions);
            const leaderboard = Object.values(aggregated)
                .sort((a, b) => b.totalXP - a.totalXP);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    reposSynced: TRACKED_REPOS.length,
                    leaderboard: leaderboard,
                    since: since
                })
            };
        }

        // Get leaderboard
        if (params.leaderboard === 'true') {
            const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const allContributions = [];

            for (const { owner, repo } of TRACKED_REPOS) {
                try {
                    const commits = await fetchCommits(owner, repo, since);
                    const contributions = await processCommits(owner, repo, commits);
                    allContributions.push(contributions);
                } catch (e) {
                    console.error(`Error fetching ${owner}/${repo}:`, e);
                }
            }

            const aggregated = aggregateContributions(allContributions);
            const leaderboard = Object.values(aggregated)
                .filter(c => !['Copilot', 'Automation', 'Dependabot'].includes(c.contributor))
                .sort((a, b) => b.totalXP - a.totalXP);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    leaderboard: leaderboard,
                    period: 'last_30_days'
                })
            };
        }

        // Default: return tracked repos info
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                trackedRepos: TRACKED_REPOS,
                rewardTiers: REWARDS,
                usage: {
                    'sync repo': '?repo=consciousness-revolution',
                    'full sync': '?sync=true',
                    'leaderboard': '?leaderboard=true',
                    'with date': '?sync=true&since=2024-01-01T00:00:00Z'
                }
            })
        };

    } catch (error) {
        console.error('Sync error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}
