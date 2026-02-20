#!/usr/bin/env python3
"""Fix root-relative paths for GitHub Pages deployment.

The site is normally served at the root of a domain (Netlify).
On GitHub Pages it lives at /consciousness-revolution/ (a subpath).
Root-relative paths like src="/js/foo.js" would resolve to the
wrong location on GitHub Pages – they need a /consciousness-revolution/
prefix.  This script rewrites those paths inside every HTML file in
the deploy directory so the backup site loads correctly.

Usage:
    python3 fix-gh-pages-paths.py <deploy-dir>
"""

import re
import os
import sys

BASE = "/consciousness-revolution"
DEPLOY_DIR = sys.argv[1] if len(sys.argv) > 1 else "."


def fix_path(m: re.Match) -> str:
    """Return a corrected attribute=value pair for root-relative URLs."""
    attr = m.group(1)
    path = m.group(2)

    # Skip protocol-relative URLs  (//cdn.example.com/...)
    if path.startswith("/"):
        return m.group(0)

    # Skip paths that are already prefixed
    if path.startswith("consciousness-revolution"):
        return m.group(0)

    return f'{attr}="{BASE}/{path}'


# Matches src="...", href="...", or action="..." that start with a single /
# The closing quote is deliberately left out of the regex so the matched
# portion is just the prefix; re.sub replaces only that prefix, leaving
# the rest of the attribute value intact.
PATTERN = re.compile(r'(src|href|action)="/([^"]*)')

count = 0
skipped = 0

for root, dirs, files in os.walk(DEPLOY_DIR):
    # Skip hidden and dependency directories
    dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "vendor")]
    for fname in files:
        if not fname.endswith(".html"):
            continue
        fpath = os.path.join(root, fname)
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                original = fh.read()
            updated = PATTERN.sub(fix_path, original)
            if updated != original:
                with open(fpath, "w", encoding="utf-8") as fh:
                    fh.write(updated)
                count += 1
        except OSError as exc:
            print(f"Warning: could not process {fpath}: {exc}", file=sys.stderr)
            skipped += 1

print(f"Fixed root-relative paths in {count} HTML files ({skipped} skipped due to errors).")
