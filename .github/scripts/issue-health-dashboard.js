#!/usr/bin/env node

/**
 * Issue Health Dashboard
 * 
 * Generates a visual dashboard showing the health of automated issues.
 * Can be run locally or in CI to monitor issue automation status.
 */

const https = require('https');

// Configuration
const OWNER = process.env.GITHUB_REPOSITORY_OWNER;
const REPO = process.env.GITHUB_REPOSITORY_NAME;
const TOKEN = process.env.GITHUB_TOKEN;

if (!OWNER || !REPO) {
  console.error('Error: GITHUB_REPOSITORY_OWNER and GITHUB_REPOSITORY_NAME environment variables must be set');
  console.error('Usage: GITHUB_REPOSITORY_OWNER=owner GITHUB_REPOSITORY_NAME=repo node issue-health-dashboard.js');
  process.exit(1);
}

// Thresholds for health metrics
const THRESHOLDS = {
  totalIssues: { warning: 150, critical: 200 },
  automatedIssues: { warning: 50, critical: 100 },
  staleBranchIssues: { warning: 30, critical: 50 },
  dailyReports: { warning: 5, critical: 10 },
  securityIssues: { warning: 3, critical: 5 }
};

/**
 * Make GitHub API request
 */
function githubRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Issue-Health-Dashboard',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (TOKEN) {
      options.headers['Authorization'] = `Bearer ${TOKEN}`;
    }

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} - ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Get health status based on thresholds
 */
function getHealthStatus(value, thresholds) {
  if (value >= thresholds.critical) return { status: 'critical', icon: '🔴' };
  if (value >= thresholds.warning) return { status: 'warning', icon: '🟡' };
  return { status: 'healthy', icon: '🟢' };
}

/**
 * Fetch all issues with pagination and rate limit monitoring
 */
async function fetchAllIssues(state = 'open') {
  let allIssues = [];
  let page = 1;

  while (true) {
    try {
      const response = await githubRequest(
        `/repos/${OWNER}/${REPO}/issues?state=${state}&per_page=100&page=${page}`
      );

      // Note: In Node.js https module, we need to parse headers from response
      // For now, just add a delay between requests
      if (allIssues.length > 0) {
        console.log(`Fetched page ${page}, total issues so far: ${allIssues.length}`);
        // Add 1 second delay between pages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (response.length === 0) break;
      allIssues = allIssues.concat(response);
      page++;

      if (response.length < 100) break; // Last page
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      // If we hit rate limit, wait longer
      if (error.message.includes('rate limit') || error.message.includes('403')) {
        console.log('⚠️ Rate limit detected, waiting 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        continue; // Retry same page
      }
      throw error;
    }
  }

  return allIssues;
}

/**
 * Analyze issues and generate metrics
 */
function analyzeIssues(issues) {
  const metrics = {
    total: issues.length,
    automated: 0,
    staleBranch: 0,
    dailyReports: 0,
    security: 0,
    manual: 0,
    byAge: {
      today: 0,
      week: 0,
      month: 0,
      older: 0
    }
  };

  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  issues.forEach(issue => {
    const labels = issue.labels.map(l => l.name);
    const createdAt = new Date(issue.created_at);

    // Categorize by label
    if (labels.includes('automated')) {
      metrics.automated++;

      if (labels.includes('stale-branch')) metrics.staleBranch++;
      if (labels.includes('daily-agent-report')) metrics.dailyReports++;
      if (labels.includes('security')) metrics.security++;
    } else {
      metrics.manual++;
    }

    // Categorize by age
    if (createdAt >= oneDayAgo) metrics.byAge.today++;
    else if (createdAt >= oneWeekAgo) metrics.byAge.week++;
    else if (createdAt >= oneMonthAgo) metrics.byAge.month++;
    else metrics.byAge.older++;
  });

  return metrics;
}

/**
 * Generate dashboard output
 */
function generateDashboard(metrics) {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              ISSUE AUTOMATION HEALTH DASHBOARD                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Overall health
  const totalHealth = getHealthStatus(metrics.total, THRESHOLDS.totalIssues);
  const automatedHealth = getHealthStatus(metrics.automated, THRESHOLDS.automatedIssues);

  console.log(`${totalHealth.icon} Overall Health: ${totalHealth.status.toUpperCase()}`);
  console.log(`${automatedHealth.icon} Automation Health: ${automatedHealth.status.toUpperCase()}\n`);

  // Issue counts
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ ISSUE COUNTS                                                │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ Total Open Issues:        ${String(metrics.total).padStart(4)} ${getHealthStatus(metrics.total, THRESHOLDS.totalIssues).icon}                         │`);
  console.log(`│ Automated Issues:         ${String(metrics.automated).padStart(4)} ${getHealthStatus(metrics.automated, THRESHOLDS.automatedIssues).icon}                         │`);
  console.log(`│   - Stale Branch:         ${String(metrics.staleBranch).padStart(4)} ${getHealthStatus(metrics.staleBranch, THRESHOLDS.staleBranchIssues).icon}                         │`);
  console.log(`│   - Daily Reports:        ${String(metrics.dailyReports).padStart(4)} ${getHealthStatus(metrics.dailyReports, THRESHOLDS.dailyReports).icon}                         │`);
  console.log(`│   - Security:             ${String(metrics.security).padStart(4)} ${getHealthStatus(metrics.security, THRESHOLDS.securityIssues).icon}                         │`);
  console.log(`│ Manual Issues:            ${String(metrics.manual).padStart(4)}                              │`);
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  // Age distribution
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ ISSUE AGE DISTRIBUTION                                      │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ Created Today:            ${String(metrics.byAge.today).padStart(4)}                              │`);
  console.log(`│ This Week:                ${String(metrics.byAge.week).padStart(4)}                              │`);
  console.log(`│ This Month:               ${String(metrics.byAge.month).padStart(4)}                              │`);
  console.log(`│ Older:                    ${String(metrics.byAge.older).padStart(4)} ${metrics.byAge.older > 50 ? '⚠️ ' : '   '}                            │`);
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  // Recommendations
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ RECOMMENDATIONS                                             │');
  console.log('├─────────────────────────────────────────────────────────────┤');

  const recommendations = [];

  if (metrics.automated >= THRESHOLDS.automatedIssues.critical) {
    recommendations.push('│ 🔴 CRITICAL: Run Bulk Issue Cleanup workflow immediately    │');
  } else if (metrics.automated >= THRESHOLDS.automatedIssues.warning) {
    recommendations.push('│ 🟡 WARNING: Consider running Bulk Issue Cleanup             │');
  }

  if (metrics.dailyReports > THRESHOLDS.dailyReports.warning) {
    recommendations.push('│ 🟡 Too many daily reports - check lifecycle manager         │');
  }

  if (metrics.staleBranch >= THRESHOLDS.staleBranchIssues.warning) {
    recommendations.push('│ 🟡 Many stale branches - review and delete unused branches  │');
  }

  if (metrics.security >= THRESHOLDS.securityIssues.warning) {
    recommendations.push('│ ⚠️  Multiple security issues - review and fix promptly      │');
  }

  if (metrics.byAge.older > 50) {
    recommendations.push('│ ⚠️  Many old issues - run cleanup to close resolved issues  │');
  }

  if (recommendations.length === 0) {
    console.log('│ ✅ All metrics healthy - no action needed                    │');
  } else {
    recommendations.forEach(rec => console.log(rec));
  }

  console.log('└─────────────────────────────────────────────────────────────┘\n');

  // Quick actions
  console.log('QUICK ACTIONS:');
  console.log('  - Run Bulk Cleanup:    gh workflow run bulk-issue-cleanup.yml');
  console.log('  - View Workflows:      gh workflow list');
  console.log('  - Manual Trigger:      Go to Actions tab → Select workflow → Run\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Fetching issues from GitHub...');

    if (!TOKEN) {
      console.log('⚠️  Warning: GITHUB_TOKEN not set. API rate limits will be lower.');
      console.log('   Set GITHUB_TOKEN environment variable for better results.\n');
    }

    const issues = await fetchAllIssues('open');
    console.log(`✓ Fetched ${issues.length} open issues\n`);

    const metrics = analyzeIssues(issues);
    generateDashboard(metrics);

    // Exit with appropriate code
    if (metrics.automated >= THRESHOLDS.automatedIssues.critical) {
      process.exit(1); // Critical - fail CI
    } else if (metrics.automated >= THRESHOLDS.automatedIssues.warning) {
      process.exit(0); // Warning - pass but notify
    } else {
      process.exit(0); // Healthy
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { analyzeIssues, generateDashboard };
