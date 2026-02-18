/**
 * GITHUB CONTRIBUTION WEBHOOK
 * Receives GitHub webhook events and auto-tracks contributions
 *
 * Webhook Events Handled:
 * - push: Commits pushed to repo
 * - pull_request: PR opened/merged/closed
 * - issues: Issue opened/closed
 * - pull_request_review: Code review submitted
 *
 * Rewards:
 * - Commit: +10 XP, +5 OKK
 * - PR Merged: +50 XP, +25 OKK
 * - Bug Fix (closes issue): +30 XP, +15 OKK
 * - Code Review: +20 XP, +10 OKK
 */

import crypto from 'crypto';

// Reward tiers
const REWARDS = {
    commit: { xp: 10, okk: 5 },
    pr_opened: { xp: 20, okk: 10 },
    pr_merged: { xp: 50, okk: 25 },
    issue_closed: { xp: 30, okk: 15 },
    code_review: { xp: 20, okk: 10 },
    feature_complete: { xp: 100, okk: 50 }
};

// Map GitHub usernames to team members
const GITHUB_TO_TEAM = {
    'overkillkulture': { name: 'Commander', id: 'commander_1' },
    'darrickpreble': { name: 'Commander', id: 'commander_1' },
    'barbrickdesign': { name: 'Ryan', id: 'agent_r_1' },
    'ryanagent': { name: 'Ryan', id: 'agent_r_1' },
    // Add more mappings as team grows
};

// Project repo mapping
const REPO_TO_PROJECT = {
    'consciousness-revolution': ['araya-chat', 'widget-system', 'trinity-system', 'operator-cockpits'],
    'consciousness-bugs': ['bug-tracker'],
    // Add more repo mappings
};

// In-memory store (in production, use database)
// For now, we'll use Netlify Blobs or environment-based storage
let contributionStore = {};

/**
 * Verify GitHub webhook signature
 */
function verifySignature(payload, signature, secret) {
    if (!secret) return true; // Skip if no secret configured
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Process push event (commits)
 */
function processPushEvent(payload) {
    const contributions = [];
    const repo = payload.repository?.name || 'unknown';
    const commits = payload.commits || [];

    for (const commit of commits) {
        const author = commit.author?.username || commit.author?.name || 'unknown';
        const teamMember = GITHUB_TO_TEAM[author.toLowerCase()];

        // Check if commit message references an issue (bug fix)
        const closesIssue = /(?:closes?|fixes?|resolves?)\s+#(\d+)/i.test(commit.message);
        const reward = closesIssue ? REWARDS.issue_closed : REWARDS.commit;

        contributions.push({
            type: closesIssue ? 'bug_fix' : 'commit',
            author: author,
            teamMember: teamMember?.name || author,
            teamId: teamMember?.id || null,
            repo: repo,
            sha: commit.id?.substring(0, 7),
            message: commit.message?.substring(0, 100),
            timestamp: commit.timestamp,
            reward: reward,
            filesChanged: (commit.added?.length || 0) + (commit.modified?.length || 0) + (commit.removed?.length || 0)
        });
    }

    return contributions;
}

/**
 * Process pull request event
 */
function processPREvent(payload) {
    const pr = payload.pull_request;
    const action = payload.action;
    const repo = payload.repository?.name || 'unknown';
    const author = pr?.user?.login || 'unknown';
    const teamMember = GITHUB_TO_TEAM[author.toLowerCase()];

    let reward = null;
    let type = null;

    if (action === 'opened') {
        reward = REWARDS.pr_opened;
        type = 'pr_opened';
    } else if (action === 'closed' && pr?.merged) {
        reward = REWARDS.pr_merged;
        type = 'pr_merged';

        // Check if this is a feature (larger PR)
        if ((pr.additions || 0) + (pr.deletions || 0) > 500) {
            reward = REWARDS.feature_complete;
            type = 'feature_complete';
        }
    }

    if (!reward) return [];

    return [{
        type: type,
        author: author,
        teamMember: teamMember?.name || author,
        teamId: teamMember?.id || null,
        repo: repo,
        prNumber: pr?.number,
        title: pr?.title?.substring(0, 100),
        timestamp: pr?.merged_at || pr?.created_at || new Date().toISOString(),
        reward: reward,
        additions: pr?.additions || 0,
        deletions: pr?.deletions || 0
    }];
}

/**
 * Process code review event
 */
function processReviewEvent(payload) {
    const review = payload.review;
    const pr = payload.pull_request;
    const repo = payload.repository?.name || 'unknown';
    const reviewer = review?.user?.login || 'unknown';
    const teamMember = GITHUB_TO_TEAM[reviewer.toLowerCase()];

    // Only reward approved or changes_requested reviews (actual work)
    if (!['approved', 'changes_requested'].includes(review?.state?.toLowerCase())) {
        return [];
    }

    return [{
        type: 'code_review',
        author: reviewer,
        teamMember: teamMember?.name || reviewer,
        teamId: teamMember?.id || null,
        repo: repo,
        prNumber: pr?.number,
        reviewState: review?.state,
        timestamp: review?.submitted_at || new Date().toISOString(),
        reward: REWARDS.code_review
    }];
}

/**
 * Store contribution (in production, use database)
 */
async function storeContribution(contribution) {
    const key = `${contribution.teamMember}_${contribution.repo}`;

    if (!contributionStore[key]) {
        contributionStore[key] = {
            teamMember: contribution.teamMember,
            teamId: contribution.teamId,
            repo: contribution.repo,
            totalXP: 0,
            totalOKK: 0,
            commits: 0,
            prs: 0,
            reviews: 0,
            bugFixes: 0,
            features: 0,
            history: []
        };
    }

    const record = contributionStore[key];
    record.totalXP += contribution.reward.xp;
    record.totalOKK += contribution.reward.okk;

    switch (contribution.type) {
        case 'commit': record.commits++; break;
        case 'bug_fix': record.bugFixes++; record.commits++; break;
        case 'pr_opened':
        case 'pr_merged': record.prs++; break;
        case 'feature_complete': record.features++; record.prs++; break;
        case 'code_review': record.reviews++; break;
    }

    // Keep last 50 contributions in history
    record.history.unshift({
        type: contribution.type,
        message: contribution.message || contribution.title,
        reward: contribution.reward,
        timestamp: contribution.timestamp
    });
    if (record.history.length > 50) record.history.pop();

    return record;
}

export async function handler(event) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Hub-Signature-256, X-GitHub-Event'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    // GET - Return current contribution stats
    if (event.httpMethod === 'GET') {
        const params = event.queryStringParameters || {};

        if (params.leaderboard) {
            // Return leaderboard sorted by XP
            const leaderboard = Object.values(contributionStore)
                .sort((a, b) => b.totalXP - a.totalXP)
                .slice(0, 20);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    leaderboard: leaderboard
                })
            };
        }

        if (params.contributor) {
            // Return specific contributor stats
            const stats = Object.values(contributionStore)
                .filter(c => c.teamMember.toLowerCase() === params.contributor.toLowerCase());

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    contributor: params.contributor,
                    stats: stats
                })
            };
        }

        if (params.repo) {
            // Return repo contribution stats
            const repoStats = Object.values(contributionStore)
                .filter(c => c.repo === params.repo);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    repo: params.repo,
                    contributors: repoStats
                })
            };
        }

        // Return all stats
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                totalContributors: Object.keys(contributionStore).length,
                contributions: contributionStore
            })
        };
    }

    // POST - Process webhook
    if (event.httpMethod === 'POST') {
        try {
            // Verify signature if secret is configured
            const secret = process.env.GITHUB_WEBHOOK_SECRET;
            const signature = event.headers['x-hub-signature-256'];

            if (secret && signature) {
                if (!verifySignature(event.body, signature, secret)) {
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({ error: 'Invalid signature' })
                    };
                }
            }

            const githubEvent = event.headers['x-github-event'];
            const payload = JSON.parse(event.body || '{}');

            let contributions = [];

            switch (githubEvent) {
                case 'push':
                    contributions = processPushEvent(payload);
                    break;
                case 'pull_request':
                    contributions = processPREvent(payload);
                    break;
                case 'pull_request_review':
                    contributions = processReviewEvent(payload);
                    break;
                case 'ping':
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ success: true, message: 'Webhook configured!' })
                    };
                default:
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ success: true, message: `Event ${githubEvent} not tracked` })
                    };
            }

            // Store all contributions
            const results = [];
            for (const contribution of contributions) {
                const stored = await storeContribution(contribution);
                results.push({
                    contributor: contribution.teamMember,
                    type: contribution.type,
                    reward: contribution.reward,
                    newTotals: {
                        xp: stored.totalXP,
                        okk: stored.totalOKK
                    }
                });
            }

            console.log(`Processed ${contributions.length} contributions from ${githubEvent} event`);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    event: githubEvent,
                    contributionsProcessed: contributions.length,
                    results: results
                })
            };

        } catch (error) {
            console.error('Webhook error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
}
