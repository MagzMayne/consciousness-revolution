#!/usr/bin/env node
/**
 * inject-mobile-responsive.js
 *
 * Injects <script src="/js/mobile-responsive.js" defer></script>
 * into every HTML file in the repository (immediately before </head>),
 * unless the tag is already present.
 *
 * Also adds a viewport <meta> tag for the ~22 pages that are missing one.
 *
 * Usage:
 *   node inject-mobile-responsive.js            # dry-run (reports only)
 *   node inject-mobile-responsive.js --write    # writes changes
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '.');
const DRY_RUN   = !process.argv.includes('--write');
const SCRIPT_TAG = '  <script src="/js/mobile-responsive.js" defer></script>\n';
const VIEWPORT_TAG = '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n';

let modified   = 0;
let alreadyOk  = 0;
let errors     = 0;
let viewportAdded = 0;

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
        /* Skip hidden dirs, node_modules, .git, etc. */
        if (entry.name.startsWith('.')) { continue; }
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') { continue; }

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

    let changed = src;
    let didChange = false;

    /* 1. Inject mobile-responsive.js before </head> (or <body>/<header>) if not present */
    if (!changed.includes('mobile-responsive.js')) {
        if (changed.includes('</head>')) {
            changed = changed.replace('</head>', SCRIPT_TAG + '</head>');
            didChange = true;
        } else if (/<body[\s>]/i.test(changed)) {
            /* Fallback: insert before <body> for pages missing </head> */
            changed = changed.replace(/<body[\s>]/i, function(m) {
                return SCRIPT_TAG + m;
            });
            didChange = true;
        } else if (/<header[\s>]/i.test(changed) && /<html[\s>]/i.test(changed)) {
            /* Fallback: full HTML page with <head> but no </head>/<body> — insert before <header> */
            changed = changed.replace(/<header[\s>]/i, function(m) {
                return SCRIPT_TAG + m;
            });
            didChange = true;
        }
        /* If none of the above match, it's an HTML fragment — skip */
    }

    /* 2. Inject viewport meta if missing */
    if (!changed.includes('name="viewport"') && !changed.includes("name='viewport'")) {
        /* Try to insert after <meta charset> or as first child of <head> */
        if (changed.includes('<head>')) {
            changed = changed.replace('<head>', '<head>\n' + VIEWPORT_TAG);
            viewportAdded++;
            didChange = true;
        } else if (changed.includes('<head ')) {
            changed = changed.replace(/<head[^>]*>/, function(m) {
                return m + '\n' + VIEWPORT_TAG;
            });
            viewportAdded++;
            didChange = true;
        }
    }

    if (!didChange) {
        alreadyOk++;
        return;
    }

    if (DRY_RUN) {
        console.log('[DRY-RUN] Would modify:', path.relative(ROOT, filepath));
    } else {
        try {
            fs.writeFileSync(filepath, changed, 'utf8');
            console.log('[MODIFIED]', path.relative(ROOT, filepath));
        } catch (e) {
            console.error('ERROR writing', filepath, e.message);
            errors++;
            return;
        }
    }

    modified++;
}

/* ── Main ── */
console.log('Scanning for HTML files in:', ROOT);
const files = collectHtml(ROOT);
console.log('Found', files.length, 'HTML files');

if (DRY_RUN) {
    console.log('\n[DRY-RUN MODE] Pass --write to apply changes\n');
}

for (const file of files) {
    processFile(file);
}

console.log('\n── Summary ──');
console.log('Total HTML files       :', files.length);
console.log('Already up-to-date     :', alreadyOk);
console.log('Modified (or would be) :', modified);
console.log('Viewport tags added    :', viewportAdded);
console.log('Errors                 :', errors);
if (DRY_RUN && modified > 0) {
    console.log('\nRe-run with --write to apply changes.');
}
