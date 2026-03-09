// get-github-issues.mjs
// Fetches issues from consciousness-dashboards repo for Task Room Board
// Uses GitHub token for authentication (avoids rate limits)

export default async function handler(request, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO_OWNER = 'overkillkulture';
        const REPO_NAME = 'consciousness-dashboards';

        const fetchHeaders = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Consciousness-Revolution-TaskBoard'
        };

        // Add auth token if available (higher rate limit)
        if (GITHUB_TOKEN) {
            fetchHeaders['Authorization'] = `token ${GITHUB_TOKEN}`;
        }

        // Fetch all issues (open and closed, up to 100)
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=100&sort=created&direction=desc`,
            { headers: fetchHeaders }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GitHub API Error:', response.status, errorText);
            return new Response(JSON.stringify({
                error: 'GitHub API Error',
                status: response.status,
                message: errorText
            }), { status: response.status, headers });
        }

        const issues = await response.json();

        // Filter out pull requests (they also appear in /issues endpoint)
        const filteredIssues = issues.filter(issue => !issue.pull_request);

        return new Response(JSON.stringify(filteredIssues), {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error fetching GitHub issues:', error);
        return new Response(JSON.stringify({
            error: 'Internal Error',
            message: error.message
        }), { status: 500, headers });
    }
}
