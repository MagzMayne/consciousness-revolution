#!/usr/bin/env python3
# ════════════════════════════════════════════════════════════════════════════════
# © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
# ════════════════════════════════════════════════════════════════════════════════
#
# PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
#
# This file contains proprietary intellectual property of Ryan Barbrick.
# All concepts, algorithms, implementations, and innovations are protected by
# copyright law and are considered trade secrets.
#
# PROVISIONAL PATENT NOTICE:
# The ideas, methods, systems, and code contained in this file are subject to
# provisional patent protection. Unauthorized use, reproduction, modification,
# or distribution is strictly prohibited.
#
# LEGAL WARNING:
# Unauthorized use of this intellectual property may result in:
# - Civil litigation for copyright infringement
# - Claims for actual and statutory damages ($750-$150,000 per work)
# - Injunctive relief and cease & desist orders
# - Criminal prosecution for willful infringement
# - Recovery of attorney fees and legal costs
#
# CREATOR INFORMATION:
# Author: Ryan Barbrick
# Business: Barbrick Design
# Contact: BarbrickDesign@gmail.com
# AI Assistant: Merlin AI
# Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
#
# PATENT DECLARATION:
# File: add-self-healing.py
# Declaration ID: IP-5990AB72-MLL2902T
# Date: 2026-02-13
# Innovation Type: Software Implementation, Algorithm, System Design
#
# For licensing inquiries, contact: BarbrickDesign@gmail.com
# ════════════════════════════════════════════════════════════════════════════════

#!/usr/bin/env python3
"""
Script to add self-healing script to all HTML files in the repository.
This script will inject the self-healing script reference into HTML files
that don't already have it.
"""

import os
import re
from pathlib import Path

# Files to exclude
EXCLUDE_FILES = {
    'test-self-healing.html',  # Test file
    'self-healing.js',  # The script itself
}

# Files that already have self-healing (Jesus variants)
JESUS_FILES = {
    'Je$us.html',
    'JeZues.html',
    'JeZues2.html',
    'JeZuesTrinityLoop.html',
    'JeEeZues.html',
}

# Self-healing script tag to inject
SELF_HEALING_SCRIPT = '  <!-- Self-Healing Script -->\n  <script src="/self-healing.js"></script>\n'

def should_process_file(filepath):
    """Check if file should be processed."""
    filename = filepath.name
    
    # Skip excluded files
    if filename in EXCLUDE_FILES:
        return False
    
    # Skip Jesus files (already have comprehensive healing)
    if filename in JESUS_FILES:
        return False
    
    # Only process HTML files
    if not filename.endswith('.html'):
        return False
    
    return True

def has_self_healing_script(content):
    """Check if HTML file already has self-healing script."""
    patterns = [
        r'<script[^>]+src=["\']/?self-healing\.js["\']',
        r'window\.__SELF_HEALING_INITIALIZED',
        r'SelfHealingModule',
    ]
    
    for pattern in patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return True
    
    return False

def inject_self_healing_script(content):
    """Inject self-healing script into HTML content."""
    # Try to inject before closing </body> tag
    if '</body>' in content:
        content = content.replace('</body>', SELF_HEALING_SCRIPT + '</body>')
        return content, 'before </body>'
    
    # Try to inject before closing </html> tag
    if '</html>' in content:
        content = content.replace('</html>', SELF_HEALING_SCRIPT + '</html>')
        return content, 'before </html>'
    
    # If no closing tags, append at end
    content += '\n' + SELF_HEALING_SCRIPT
    return content, 'at end'

def process_html_file(filepath):
    """Process a single HTML file."""
    try:
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already has self-healing
        if has_self_healing_script(content):
            return 'skipped', 'already has self-healing'
        
        # Inject self-healing script
        new_content, location = inject_self_healing_script(content)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return 'modified', location
    
    except Exception as e:
        return 'error', str(e)

def main():
    """Main function."""
    repo_root = Path(__file__).parent
    
    print(f"Processing HTML files in: {repo_root}")
    print(f"Excluding: {', '.join(EXCLUDE_FILES)}")
    print(f"Skipping Jesus files: {', '.join(JESUS_FILES)}")
    print()
    
    stats = {
        'processed': 0,
        'modified': 0,
        'skipped': 0,
        'errors': 0,
    }
    
    # Find all HTML files in root directory
    html_files = list(repo_root.glob('*.html'))
    print(f"Found {len(html_files)} HTML files")
    print()
    
    # Process each file
    for filepath in sorted(html_files):
        if not should_process_file(filepath):
            continue
        
        stats['processed'] += 1
        status, detail = process_html_file(filepath)
        
        if status == 'modified':
            stats['modified'] += 1
            print(f"✓ {filepath.name:50s} - injected {detail}")
        elif status == 'skipped':
            stats['skipped'] += 1
            # Uncomment to see skipped files
            # print(f"○ {filepath.name:50s} - {detail}")
        elif status == 'error':
            stats['errors'] += 1
            print(f"✗ {filepath.name:50s} - ERROR: {detail}")
    
    # Print summary
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total processed: {stats['processed']}")
    print(f"Modified:        {stats['modified']}")
    print(f"Skipped:         {stats['skipped']}")
    print(f"Errors:          {stats['errors']}")
    print()
    
    if stats['errors'] > 0:
        print("⚠ Some files had errors. Please review.")
        return 1
    else:
        print("✓ All files processed successfully!")
        return 0

if __name__ == '__main__':
    exit(main())
