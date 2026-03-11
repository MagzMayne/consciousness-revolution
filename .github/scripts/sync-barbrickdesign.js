#!/usr/bin/env node

/**
 * Sync Barbrick Design Script
 *
 * Fetches the file list from barbrickdesign/barbrickdesign.github.io via the
 * GitHub API and copies any files that are not already present in this repo
 * (overkor-tek/consciousness-revolution) into the working tree.
 *
 * Philosophy: ADDITIVE ONLY — this script NEVER deletes or overwrites files.
 *
 * Required env vars (must be set via workflow secrets):
 *   GITHUB_TOKEN  — token with `contents:read` on both repos
 *
 * Output:
 *   .github/scripts/barbrickdesign-sync-report.json  — machine-readable report
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const SOURCE_OWNER = 'barbrickdesign';
const SOURCE_REPO = 'barbrickdesign.github.io';
const REPORT_FILE = path.join(__dirname, 'barbrickdesign-sync-report.json');
const REPO_ROOT = path.resolve(__dirname, '../..');

// Extensions we want to sync (additive)
const SYNC_EXTENSIONS = new Set(['.html', '.md', '.js', '.css', '.json', '.txt']);

// Paths/prefixes to skip in the source repo
const SKIP_PREFIXES = [
  'node_modules',
  '.git',
  '.github',
  'backend',
  // Skip test/demo files
];

const SKIP_FILENAMES = new Set([
  'package.json',
  'package-lock.json',
  '_config.yml',
  'netlify.toml',
  'railway.toml',
  'Gemfile',
  '.gitignore',
  'CNAME',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'service-worker.js',
  'sw.js',
]);

/**
 * Make a GitHub API request and return parsed JSON.
 * @param {string} urlPath  - e.g. '/repos/owner/repo/contents/'
 * @returns {Promise<any>}
 */
function githubGet(urlPath) {
  const token = process.env.GITHUB_TOKEN;
  const options = {
    hostname: 'api.github.com',
    path: urlPath,
    method: 'GET',
    headers: {
      'User-Agent': 'consciousness-revolution-sync/1.0',
      Accept: 'application/vnd.github.v3+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (err) {
          reject(new Error(`Failed to parse JSON from ${urlPath}: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Fetch raw file content from GitHub.
 * @param {string} downloadUrl - direct URL returned by GitHub contents API
 * @returns {Promise<string>}
 */
function fetchRaw(downloadUrl) {
  const url = new URL(downloadUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'User-Agent': 'consciousness-revolution-sync/1.0',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      // Follow up to one redirect
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        resolve(fetchRaw(res.headers.location));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * List all files at the top level of the source repository.
 * GitHub's contents API returns at most 1000 items per directory; this
 * function returns only the root level (recursive listing is not needed
 * since both repos keep their files at the root).
 * @returns {Promise<Array<{name: string, path: string, download_url: string, sha: string, type: string}>>}
 */
async function listSourceFiles() {
  const urlPath = `/repos/${SOURCE_OWNER}/${SOURCE_REPO}/contents/`;
  const { status, body } = await githubGet(urlPath);

  if (status !== 200) {
    throw new Error(`GitHub API returned HTTP ${status} for ${urlPath}: ${JSON.stringify(body)}`);
  }

  if (!Array.isArray(body)) {
    throw new Error(`Unexpected response from GitHub API: ${JSON.stringify(body).slice(0, 200)}`);
  }

  return body.filter((item) => item.type === 'file');
}

/**
 * Determine whether a file should be synced.
 * @param {string} fileName
 * @returns {boolean}
 */
function shouldSync(fileName) {
  if (fileName.startsWith('.')) return false;
  if (SKIP_FILENAMES.has(fileName)) return false;

  for (const prefix of SKIP_PREFIXES) {
    if (fileName.startsWith(prefix)) return false;
  }

  const ext = path.extname(fileName).toLowerCase();
  return SYNC_EXTENSIONS.has(ext);
}

/**
 * Write a file to the local repo, creating parent directories as needed.
 * @param {string} filePath  - absolute path
 * @param {string} content
 */
function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Main entry point.
 */
async function main() {
  console.log('🔄 Starting barbrickdesign.github.io → consciousness-revolution sync...\n');

  let sourceFiles;
  try {
    sourceFiles = await listSourceFiles();
  } catch (err) {
    console.error(`❌ Failed to fetch source file list: ${err.message}`);
    process.exit(1);
  }

  console.log(`📋 Found ${sourceFiles.length} files in ${SOURCE_OWNER}/${SOURCE_REPO}`);

  const report = {
    timestamp: new Date().toISOString(),
    source: `${SOURCE_OWNER}/${SOURCE_REPO}`,
    added: [],
    skipped_existing: [],
    skipped_excluded: [],
    errors: [],
  };

  for (const file of sourceFiles) {
    const { name: fileName, download_url: downloadUrl } = file;

    // Determine if this file type should be synced
    if (!shouldSync(fileName)) {
      report.skipped_excluded.push(fileName);
      continue;
    }

    // Guard: directories and submodules have no download_url
    if (!downloadUrl) {
      report.errors.push({ file: fileName, error: 'No download URL provided by GitHub API' });
      continue;
    }

    const destPath = path.join(REPO_ROOT, fileName);

    // ADDITIVE ONLY: skip files that already exist in this repo
    if (fs.existsSync(destPath)) {
      report.skipped_existing.push(fileName);
      continue;
    }

    // Fetch content and write
    try {
      console.log(`  ➕ Adding: ${fileName}`);
      const content = await fetchRaw(downloadUrl);
      writeFile(destPath, content);
      report.added.push(fileName);
    } catch (err) {
      console.error(`  ⚠️  Error fetching ${fileName}: ${err.message}`);
      report.errors.push({ file: fileName, error: err.message });
    }
  }

  // Write report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');

  // Summary
  console.log('\n📊 Sync Summary:');
  console.log(`  ✅ Added:            ${report.added.length} files`);
  console.log(`  ⏭️  Already exist:    ${report.skipped_existing.length} files`);
  console.log(`  🚫 Excluded:         ${report.skipped_excluded.length} files`);
  if (report.errors.length > 0) {
    console.log(`  ❌ Errors:           ${report.errors.length} files`);
  }

  if (report.added.length > 0) {
    console.log('\n🆕 New files added:');
    for (const f of report.added) {
      console.log(`  - ${f}`);
    }
  } else {
    console.log('\nℹ️  No new files to add — repos are in sync.');
  }

  // Exit non-zero if there were errors (but still write report)
  if (report.errors.length > 0) {
    console.error(`\n⚠️  ${report.errors.length} file(s) failed to sync — see report for details.`);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
