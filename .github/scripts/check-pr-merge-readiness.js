#!/usr/bin/env node

/**
 * PR Merge Readiness Checker
 * 
 * Checks all open PRs to determine:
 * - Which PRs are ready to merge (no conflicts, tests pass)
 * - Which PRs need sync with base branch
 * - Which PRs have conflicts requiring manual resolution
 * - Which PRs can be batch merged safely
 */

const { Octokit } = require('@octokit/rest');

// Configuration
const REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'barbrickdesign';
const REPO_NAME = process.env.GITHUB_REPOSITORY || 'barbrickdesign.github.io';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BASE_BRANCH = process.env.BASE_BRANCH || 'main';

// Initialize Octokit
const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

/**
 * Get all open PRs
 */
async function getOpenPRs() {
  console.log(`\n🔍 Fetching open PRs for ${REPO_OWNER}/${REPO_NAME}...\n`);
  
  const allPRs = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const { data: prs } = await octokit.rest.pulls.list({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state: 'open',
      per_page: 100,
      page
    });
    
    allPRs.push(...prs);
    hasMore = prs.length === 100;
    page++;
  }
  
  console.log(`Found ${allPRs.length} open PRs\n`);
  return allPRs;
}

/**
 * Check if PR is mergeable
 */
async function checkPRMergeable(prNumber) {
  const { data: pr } = await octokit.rest.pulls.get({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: prNumber
  });
  
  return {
    number: prNumber,
    title: pr.title,
    mergeable: pr.mergeable,
    mergeable_state: pr.mergeable_state,
    base: pr.base.ref,
    head: pr.head.ref,
    draft: pr.draft,
    behind_by: null, // Will be calculated separately
    conflicts: pr.mergeable === false
  };
}

/**
 * Check if branch is behind base
 */
async function checkBranchBehind(baseRef, headRef) {
  try {
    const { data: comparison } = await octokit.rest.repos.compareCommitsWithBasehead({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      basehead: `${baseRef}...${headRef}`
    });
    
    return {
      behind_by: comparison.behind_by || 0,
      ahead_by: comparison.ahead_by || 0,
      status: comparison.status
    };
  } catch (error) {
    console.error(`Error comparing branches: ${error.message}`);
    return { behind_by: 0, ahead_by: 0, status: 'unknown' };
  }
}

/**
 * Check PR status checks
 */
async function checkPRStatusChecks(prNumber, headSha) {
  try {
    const { data: checks } = await octokit.rest.checks.listForRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: headSha
    });
    
    const allPassed = checks.check_runs.every(check => 
      check.conclusion === 'success' || check.conclusion === 'skipped'
    );
    
    const hasFailed = checks.check_runs.some(check => 
      check.conclusion === 'failure' || check.conclusion === 'cancelled'
    );
    
    return {
      total: checks.total_count,
      passed: checks.check_runs.filter(c => c.conclusion === 'success').length,
      failed: checks.check_runs.filter(c => c.conclusion === 'failure').length,
      pending: checks.check_runs.filter(c => c.status === 'in_progress' || c.status === 'queued').length,
      all_passed: allPassed,
      has_failed: hasFailed
    };
  } catch (error) {
    return { total: 0, passed: 0, failed: 0, pending: 0, all_passed: true, has_failed: false };
  }
}

/**
 * Categorize PRs
 */
function categorizePRs(prDetails) {
  const categories = {
    readyToMerge: [],
    needsSync: [],
    hasConflicts: [],
    failingChecks: [],
    draft: []
  };
  
  for (const pr of prDetails) {
    if (pr.draft) {
      categories.draft.push(pr);
    } else if (pr.conflicts) {
      categories.hasConflicts.push(pr);
    } else if (pr.checks && pr.checks.has_failed) {
      categories.failingChecks.push(pr);
    } else if (pr.behind_by > 0) {
      categories.needsSync.push(pr);
    } else if (pr.mergeable && pr.checks && pr.checks.all_passed) {
      categories.readyToMerge.push(pr);
    }
  }
  
  return categories;
}

/**
 * Generate report
 */
function generateReport(categories, allPRs) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allPRs.length,
      readyToMerge: categories.readyToMerge.length,
      needsSync: categories.needsSync.length,
      hasConflicts: categories.hasConflicts.length,
      failingChecks: categories.failingChecks.length,
      draft: categories.draft.length
    },
    categories
  };
  
  return report;
}

/**
 * Print report to console
 */
function printReport(report) {
  console.log('\n' + '='.repeat(80));
  console.log('                    PR MERGE READINESS REPORT');
  console.log('='.repeat(80) + '\n');
  
  console.log(`📊 SUMMARY (Total: ${report.summary.total} PRs)`);
  console.log('-'.repeat(80));
  console.log(`  ✅ Ready to Merge:       ${report.summary.readyToMerge}`);
  console.log(`  🔄 Needs Sync:           ${report.summary.needsSync}`);
  console.log(`  ⚠️  Has Conflicts:        ${report.summary.hasConflicts}`);
  console.log(`  ❌ Failing Checks:       ${report.summary.failingChecks}`);
  console.log(`  📝 Draft PRs:            ${report.summary.draft}`);
  console.log('');
  
  // Ready to merge
  if (report.categories.readyToMerge.length > 0) {
    console.log('\n✅ READY TO MERGE (' + report.categories.readyToMerge.length + ')');
    console.log('-'.repeat(80));
    for (const pr of report.categories.readyToMerge) {
      console.log(`  #${pr.number}: ${pr.title}`);
      console.log(`          Branch: ${pr.head} → ${pr.base}`);
    }
  }
  
  // Needs sync
  if (report.categories.needsSync.length > 0) {
    console.log('\n🔄 NEEDS SYNC WITH BASE (' + report.categories.needsSync.length + ')');
    console.log('-'.repeat(80));
    for (const pr of report.categories.needsSync.slice(0, 10)) {
      console.log(`  #${pr.number}: ${pr.title}`);
      console.log(`          Behind by: ${pr.behind_by} commits`);
    }
    if (report.categories.needsSync.length > 10) {
      console.log(`  ... and ${report.categories.needsSync.length - 10} more`);
    }
  }
  
  // Has conflicts
  if (report.categories.hasConflicts.length > 0) {
    console.log('\n⚠️  HAS CONFLICTS (' + report.categories.hasConflicts.length + ')');
    console.log('-'.repeat(80));
    for (const pr of report.categories.hasConflicts.slice(0, 10)) {
      console.log(`  #${pr.number}: ${pr.title}`);
      console.log(`          Status: ${pr.mergeable_state || 'unknown'}`);
    }
    if (report.categories.hasConflicts.length > 10) {
      console.log(`  ... and ${report.categories.hasConflicts.length - 10} more`);
    }
  }
  
  // Failing checks
  if (report.categories.failingChecks.length > 0) {
    console.log('\n❌ FAILING CHECKS (' + report.categories.failingChecks.length + ')');
    console.log('-'.repeat(80));
    for (const pr of report.categories.failingChecks.slice(0, 10)) {
      console.log(`  #${pr.number}: ${pr.title}`);
      if (pr.checks) {
        console.log(`          Failed: ${pr.checks.failed}, Pending: ${pr.checks.pending}`);
      }
    }
    if (report.categories.failingChecks.length > 10) {
      console.log(`  ... and ${report.categories.failingChecks.length - 10} more`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('                           RECOMMENDATIONS');
  console.log('='.repeat(80) + '\n');
  
  if (report.summary.readyToMerge > 0) {
    console.log(`✅ ${report.summary.readyToMerge} PR(s) are ready to merge immediately`);
  }
  
  if (report.summary.needsSync > 0) {
    console.log(`🔄 ${report.summary.needsSync} PR(s) need to sync with ${BASE_BRANCH}`);
    console.log(`   → Run: gh workflow run auto-sync-branches.yml`);
  }
  
  if (report.summary.hasConflicts > 0) {
    console.log(`⚠️  ${report.summary.hasConflicts} PR(s) have merge conflicts`);
    console.log(`   → Manual resolution or auto-conflict-resolver workflow needed`);
  }
  
  if (report.summary.failingChecks > 0) {
    console.log(`❌ ${report.summary.failingChecks} PR(s) have failing status checks`);
    console.log(`   → Authors need to fix failing tests/builds`);
  }
  
  console.log('');
}

/**
 * Main function
 */
async function main() {
  try {
    if (!GITHUB_TOKEN) {
      console.error('❌ Error: GITHUB_TOKEN environment variable is required');
      process.exit(1);
    }
    
    // Get all open PRs
    const prs = await getOpenPRs();
    
    if (prs.length === 0) {
      console.log('✅ No open PRs found');
      return;
    }
    
    // Check each PR
    console.log(`Checking merge readiness for ${prs.length} PRs...\n`);
    const prDetails = [];
    
    for (const pr of prs) {
      process.stdout.write(`  Checking PR #${pr.number}...`);
      
      const details = await checkPRMergeable(pr.number);
      const comparison = await checkBranchBehind(details.base, details.head);
      const checks = await checkPRStatusChecks(pr.number, pr.head.sha);
      
      details.behind_by = comparison.behind_by;
      details.ahead_by = comparison.ahead_by;
      details.checks = checks;
      
      prDetails.push(details);
      console.log(' ✓');
    }
    
    // Categorize PRs
    const categories = categorizePRs(prDetails);
    
    // Generate report
    const report = generateReport(categories, prs);
    
    // Print report
    printReport(report);
    
    // Save report to file
    const fs = require('fs');
    const reportPath = 'pr-merge-readiness-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, getOpenPRs, checkPRMergeable };
