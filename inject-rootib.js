#!/usr/bin/env node
/**
 * inject-rootib.js
 *
 * Injects RootIB provenance tags into every HTML and JS file that is
 * missing them.  RootIB is the standardised idea-origin tracking system
 * for the consciousness-revolution repository.
 *
 * For each HTML file the script adds:
 *   1. An HTML comment immediately after <!DOCTYPE html> (if present) or
 *      at the top of the file:
 *        <!-- RootIB: RB-YYYYMMDDHHMMSS-8HEX -->
 *   2. A <meta name="rootib"> tag inside <head>:
 *        <meta name="rootib" content="RootIB: RB-YYYYMMDDHHMMSS-8HEX">
 *   3. The rootib-footer badge script before </head>:
 *        <script src="/js/rootib-footer.js" defer></script>
 *
 * For each JS file the script adds a single-line comment at the top:
 *        // RootIB: RB-YYYYMMDDHHMMSS-8HEX
 *
 * The 8HEX suffix is derived from the SHA-256 of the file's relative path
 * so every file gets a stable, unique identifier each time the script runs.
 * The timestamp component is fixed at 2026-03-19T14:21:13Z (the UTC time
 * this system was deployed) and is the same for all files stamped in this
 * batch — consistent with how prior injection batches were done.
 *
 * Usage:
 *   node inject-rootib.js              # dry-run (reports only, no writes)
 *   node inject-rootib.js --write      # write changes to disk
 *
 * Reference:
 *   https://barbrickdesign.github.io/RootIB.html
 */

'use strict';

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

/* ── Configuration ───────────────────────────────────────────────────────── */

const ROOT    = path.resolve(__dirname, '.');
const DRY_RUN = !process.argv.includes('--write');

/** Fixed batch timestamp (UTC when this batch was deployed). */
const BATCH_TS = '20260319142113';

/** Creator prefix used across all files in this repository. */
const CREATOR_ID = 'RB';

/* ── Directories / files to skip ─────────────────────────────────────────── */

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.netlify', '.archive', '_ARCHIVE', 'ARCHIVE',
  'dist', 'build', '.circleci', '.github', 'coverage',
]);

const SKIP_HTML_NAMES = new Set([
  /* Generated test / verification outputs that should not be stamped. */
]);

/* ── RootIB helpers ──────────────────────────────────────────────────────── */

/**
 * Derives the 8-character HEX suffix from the file's relative path.
 * This makes every file's RootIB unique and reproducible.
 */
function hexSuffix(relPath) {
  return crypto
    .createHash('sha256')
    .update(relPath)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();
}

/**
 * Build the full RootIB string for a given relative path.
 *
 * @param {string} relPath  Path relative to repository root.
 * @returns {string}  e.g. "RootIB: RB-20260319142113-A1B2C3D4"
 */
function buildRootIB(relPath) {
  return `RootIB: ${CREATOR_ID}-${BATCH_TS}-${hexSuffix(relPath)}`;
}

/* ── File collection ─────────────────────────────────────────────────────── */

/**
 * Recursively collect all files matching a suffix.
 *
 * @param {string}   dir
 * @param {string[]} suffixes  Lower-cased extensions (e.g. '.html', '.js').
 * @param {string[]} results
 * @returns {string[]}
 */
function collectFiles(dir, suffixes, results) {
  results = results || [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return results;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectFiles(full, suffixes, results);
    } else if (entry.isFile()) {
      const lowerName = entry.name.toLowerCase();
      if (suffixes.some(s => lowerName.endsWith(s))) {
        results.push(full);
      }
    }
  }
  return results;
}

/* ── HTML processing ─────────────────────────────────────────────────────── */

const ROOTIB_RE = /RootIB:\s+([A-Za-z0-9._-]+-[\d-]+-[A-Za-z0-9_-]{4,})/;

/**
 * Returns true when the source already contains a RootIB tag (any form).
 * Accepts both standard 8-hex suffixes and non-standard alphanumeric suffixes
 * used by earlier batches (e.g. "1KU15C0N", "AI8ARCH", "LEARNING").
 */
function hasRootIB(src) {
  return ROOTIB_RE.test(src);
}

/**
 * Extract the existing RootIB value from a source file, or null if absent.
 * Returns the full "RootIB: RB-…-…" string.
 */
function extractRootIB(src) {
  const m = src.match(ROOTIB_RE);
  if (!m) return null;
  return 'RootIB: ' + m[1];
}

/**
 * Returns true when the source already includes rootib-footer.js.
 */
function hasRootIBFooter(src) {
  return src.includes('rootib-footer.js');
}

/**
 * Inject RootIB tags into an HTML file.
 *
 * @param {string} src      Original file content.
 * @param {string} rootib   Full RootIB string, e.g. "RootIB: RB-…-…"
 * @returns {{ changed: string, didChange: boolean }}
 */
function processHtml(src, rootib) {
  let changed = src;
  let didChange = false;

  /* 1. HTML comment immediately after <!DOCTYPE html> */
  if (!hasRootIB(changed)) {
    const commentLine = `<!-- ${rootib} -->\n`;

    if (/^<!DOCTYPE html>/i.test(changed.trimStart())) {
      // Insert right after the DOCTYPE line
      changed = changed.replace(
        /^(<!DOCTYPE html>[^\n]*\n)/i,
        `$1${commentLine}`,
      );
    } else {
      // Prepend at the very top
      changed = commentLine + changed;
    }
    didChange = true;
  }

  /* 2. <meta name="rootib"> inside <head> */
  const metaTag = `  <meta name="rootib" content="${rootib}">\n`;
  if (!changed.includes('name="rootib"') && !changed.includes("name='rootib'")) {
    if (/<head[\s>]/i.test(changed)) {
      // Insert after <head> opening tag
      changed = changed.replace(
        /(<head[^>]*>)/i,
        `$1\n${metaTag}`,
      );
      didChange = true;
    }
  }

  /* 3. rootib-footer.js script before </head> */
  const footerScript = '  <script src="/js/rootib-footer.js" defer></script>\n';
  if (!hasRootIBFooter(changed)) {
    if (changed.includes('</head>')) {
      changed = changed.replace('</head>', footerScript + '</head>');
      didChange = true;
    }
  }

  return { changed, didChange };
}

/* ── JS processing ───────────────────────────────────────────────────────── */

/**
 * Inject a // RootIB: … comment at the top of a JS file.
 *
 * Respects existing shebang lines and block-comment file headers.
 *
 * @param {string} src
 * @param {string} rootib
 * @returns {{ changed: string, didChange: boolean }}
 */
function processJs(src, rootib) {
  if (hasRootIB(src)) return { changed: src, didChange: false };

  let changed;
  const comment = `// ${rootib}\n`;

  if (src.startsWith('#!')) {
    // Keep shebang on line 1
    const nl = src.indexOf('\n');
    changed = src.slice(0, nl + 1) + comment + src.slice(nl + 1);
  } else {
    changed = comment + src;
  }

  return { changed, didChange: true };
}

/* ── Write helpers ───────────────────────────────────────────────────────── */

function writeFile(filepath, content) {
  if (DRY_RUN) return;
  try {
    fs.writeFileSync(filepath, content, 'utf8');
  } catch (e) {
    console.error('ERROR writing', filepath, e.message);
  }
}

/* ── Main ────────────────────────────────────────────────────────────────── */

let htmlModified = 0;
let htmlOk       = 0;
let htmlErrors   = 0;
let jsModified   = 0;
let jsOk         = 0;
let jsErrors     = 0;

/* Process HTML files */
console.log('\n🔍 Scanning for HTML files in:', ROOT);
const htmlFiles = collectFiles(ROOT, ['.html', '.htm'], []);
console.log(`   Found ${htmlFiles.length} HTML files`);

if (DRY_RUN) console.log('\n[DRY-RUN] Pass --write to apply changes.\n');

for (const filepath of htmlFiles) {
  const relPath = path.relative(ROOT, filepath).replace(/\\/g, '/');

  if (SKIP_HTML_NAMES.has(path.basename(filepath))) {
    htmlOk++;
    continue;
  }

  let src;
  try {
    src = fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    console.error('  ERROR reading', relPath, e.message);
    htmlErrors++;
    continue;
  }

  const rootib = extractRootIB(src) || buildRootIB(relPath);
  const { changed, didChange } = processHtml(src, rootib);

  if (didChange) {
    if (DRY_RUN) {
      console.log('  [HTML] Would update:', relPath);
    } else {
      writeFile(filepath, changed);
      console.log('  [HTML] Updated:', relPath);
    }
    htmlModified++;
  } else {
    htmlOk++;
  }
}

/* Process JS files in js/ */
console.log('\n🔍 Scanning for JS files in: js/');
const jsFiles = collectFiles(path.join(ROOT, 'js'), ['.js'], []);
console.log(`   Found ${jsFiles.length} JS files`);

for (const filepath of jsFiles) {
  const relPath = path.relative(ROOT, filepath).replace(/\\/g, '/');

  let src;
  try {
    src = fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    console.error('  ERROR reading', relPath, e.message);
    jsErrors++;
    continue;
  }

  const rootib = buildRootIB(relPath);
  const { changed, didChange } = processJs(src, rootib);

  if (didChange) {
    if (DRY_RUN) {
      console.log('  [JS]   Would update:', relPath);
    } else {
      writeFile(filepath, changed);
      console.log('  [JS]   Updated:', relPath);
    }
    jsModified++;
  } else {
    jsOk++;
  }
}

/* Summary */
console.log('\n══ Summary ═══════════════════════════════════════════════════');
console.log(`HTML files scanned     : ${htmlFiles.length}`);
console.log(`  Already up-to-date   : ${htmlOk}`);
console.log(`  Modified${DRY_RUN ? ' (would be)' : '          '} : ${htmlModified}`);
console.log(`  Errors               : ${htmlErrors}`);
console.log(`JS files scanned (js/) : ${jsFiles.length}`);
console.log(`  Already up-to-date   : ${jsOk}`);
console.log(`  Modified${DRY_RUN ? ' (would be)' : '          '} : ${jsModified}`);
console.log(`  Errors               : ${jsErrors}`);

if (DRY_RUN && (htmlModified + jsModified) > 0) {
  console.log('\n  Re-run with --write to apply changes.');
}

console.log('\n✅ Done.');
