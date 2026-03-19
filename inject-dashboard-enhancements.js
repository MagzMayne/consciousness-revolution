#!/usr/bin/env node
/**
 * inject-dashboard-enhancements.js
 *
 * Injects <script src="/js/dashboard-enhancements.js" defer></script>
 * into every *dashboard*.html file in the repository root,
 * immediately before </head>, unless the tag is already present.
 *
 * Skips:
 *   - dashboard.html     (the reference template – has its own inline impl)
 *   - dashboards.html    (hub/index page, not a user-facing dashboard)
 *   - Files in hidden dirs (.archive, node_modules, dist, etc.)
 *
 * Usage:
 *   node inject-dashboard-enhancements.js            # dry-run (reports only)
 *   node inject-dashboard-enhancements.js --write    # writes changes
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '.');
const DRY_RUN = !process.argv.includes('--write');

const SCRIPT_TAG = '  <script src="/js/dashboard-enhancements.js" defer></script>\n';
const MARKER     = 'dashboard-enhancements.js';

/* Files to skip (by basename) */
const SKIP_FILES = new Set([
    'dashboard.html',   // reference template – already has full inline impl
    'dashboards.html',  // hub/index, not a per-dashboard page
]);

let modified  = 0;
let alreadyOk = 0;
let skipped   = 0;
let errors    = 0;

/* ── Collect dashboard HTML files in the root directory ── */
function collectDashboards(dir) {
    const results = [];
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_) {
        return results;
    }
    for (const entry of entries) {
        /* Only look at the top-level directory for *dashboard*.html */
        if (!entry.isFile()) continue;
        if (!/dashboard/i.test(entry.name)) continue;
        if (!/\.html?$/i.test(entry.name)) continue;
        results.push(path.join(dir, entry.name));
    }
    return results;
}

/* ── Process a single file ── */
function processFile(filepath) {
    const basename = path.basename(filepath);

    if (SKIP_FILES.has(basename)) {
        console.log(`  SKIP  ${basename}  (excluded)`);
        skipped++;
        return;
    }

    let src;
    try {
        src = fs.readFileSync(filepath, 'utf8');
    } catch (e) {
        console.error(`  ERROR reading ${basename}: ${e.message}`);
        errors++;
        return;
    }

    /* Already has the script? */
    if (src.includes(MARKER)) {
        console.log(`  OK    ${basename}`);
        alreadyOk++;
        return;
    }

    /* Inject before </head> */
    let changed = src;
    if (/<\/head>/i.test(changed)) {
        changed = changed.replace(/<\/head>/i, SCRIPT_TAG + '</head>');
    } else if (/<body[\s>]/i.test(changed)) {
        /* Fallback: insert before <body> for pages missing </head> */
        changed = changed.replace(/<body[\s>]/i, m => SCRIPT_TAG + m);
    } else {
        console.log(`  WARN  ${basename}  (no </head> or <body> found — skipping)`);
        skipped++;
        return;
    }

    if (DRY_RUN) {
        console.log(`  WOULD MODIFY  ${basename}`);
    } else {
        try {
            fs.writeFileSync(filepath, changed, 'utf8');
            console.log(`  MODIFIED  ${basename}`);
        } catch (e) {
            console.error(`  ERROR writing ${basename}: ${e.message}`);
            errors++;
            return;
        }
    }
    modified++;
}

/* ── Main ── */
console.log('');
console.log('  inject-dashboard-enhancements.js');
console.log('  ══════════════════════════════════');
if (DRY_RUN) {
    console.log('  Mode: DRY-RUN  (pass --write to apply changes)\n');
} else {
    console.log('  Mode: WRITE\n');
}

const files = collectDashboards(ROOT);
for (const filepath of files) {
    processFile(filepath);
}

console.log('');
console.log(`  Results:`);
console.log(`    Modified  : ${modified}`);
console.log(`    Already OK: ${alreadyOk}`);
console.log(`    Skipped   : ${skipped}`);
console.log(`    Errors    : ${errors}`);
console.log('');
if (DRY_RUN && modified > 0) {
    console.log('  Run with --write to apply changes.');
    console.log('');
}
