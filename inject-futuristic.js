#!/usr/bin/env node
/**
 * inject-futuristic.js
 *
 * Injects <script src="/js/futuristic-init.js" defer></script>
 * into every HTML file in the repository (immediately before </head>),
 * unless the tag is already present.
 *
 * This gives every page the automatic futuristic blue-light design enhancements:
 *   - Animated gradient borders on cards/panels
 *   - Shimmer-animated CTA buttons
 *   - Blue glow section headers
 *   - Mobile-first responsive design
 *
 * Usage:
 *   node inject-futuristic.js             # dry-run (reports only)
 *   node inject-futuristic.js --write     # writes changes
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '.');
const DRY_RUN   = !process.argv.includes('--write');
const SCRIPT_TAG = '  <script src="/js/futuristic-init.js" defer></script>\n';

/* Directories to skip */
const SKIP_DIRS = new Set([
    'node_modules', '.git', '.netlify', '.archive', '_ARCHIVE', 'ARCHIVE',
    'dist', 'build', '.circleci', '.github', 'coverage',
]);

let modified   = 0;
let alreadyOk  = 0;
let skipped    = 0;
let errors     = 0;

/* ── Recursively collect all .html files ── */
function collectHtml(dir, results) {
    results = results || [];
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_) {
        return results;
    }
    for (const entry of entries) {
        if (entry.name.startsWith('.')) { continue; }
        if (SKIP_DIRS.has(entry.name))  { continue; }

        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectHtml(full, results);
        } else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
            results.push(full);
        }
    }
    return results;
}

/* ── Process a single file ── */
function processFile(filepath) {
    let src;
    try {
        src = fs.readFileSync(filepath, 'utf8');
    } catch (e) {
        console.error('ERROR reading', filepath, e.message);
        errors++;
        return;
    }

    /* Already has the script — skip */
    if (src.includes('futuristic-init.js')) {
        alreadyOk++;
        return;
    }

    /* Files that look like template fragments / non-standard HTML */
    if (!/<html[\s>]/i.test(src) && !/<head[\s>]/i.test(src) && !/<body[\s>]/i.test(src)) {
        skipped++;
        return;
    }

    let changed = src;
    let didChange = false;

    /* Inject before </head> */
    if (changed.includes('</head>')) {
        changed = changed.replace('</head>', SCRIPT_TAG + '</head>');
        didChange = true;
    } else if (/<body[\s>]/i.test(changed)) {
        /* Fallback: insert before <body> for pages missing </head> */
        changed = changed.replace(/<body[\s>]/i, function (m) {
            return SCRIPT_TAG + m;
        });
        didChange = true;
    }

    if (!didChange) {
        skipped++;
        return;
    }

    if (DRY_RUN) {
        console.log('[DRY-RUN] Would inject into:', path.relative(ROOT, filepath));
        modified++;
        return;
    }

    try {
        fs.writeFileSync(filepath, changed, 'utf8');
        console.log('[INJECTED]', path.relative(ROOT, filepath));
        modified++;
    } catch (e) {
        console.error('ERROR writing', filepath, e.message);
        errors++;
    }
}

/* ── Main ── */
console.log('=== inject-futuristic.js ===');
console.log('Mode:', DRY_RUN ? 'DRY-RUN (pass --write to apply)' : 'WRITE');
console.log('Root:', ROOT);
console.log('');

const htmlFiles = collectHtml(ROOT);
console.log('Found', htmlFiles.length, 'HTML files\n');

htmlFiles.forEach(processFile);

console.log('');
console.log('Results:');
console.log('  Modified / would-modify:', modified);
console.log('  Already up-to-date:',      alreadyOk);
console.log('  Skipped (fragments):',      skipped);
console.log('  Errors:',                   errors);
