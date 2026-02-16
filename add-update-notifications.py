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
# File: add-update-notifications.py
# Declaration ID: IP-1FB87827-MLL2902T
# Date: 2026-02-13
# Innovation Type: Software Implementation, Algorithm, System Design
#
# For licensing inquiries, contact: BarbrickDesign@gmail.com
# ════════════════════════════════════════════════════════════════════════════════

#!/usr/bin/env python3
"""
Add Update Notification System to HTML Files

This script automatically adds the update notification system to all HTML files
in the repository. It:
1. Finds all .html files
2. Extracts Git commit information for each file
3. Adds the necessary script tags and meta tags
4. Preserves the existing HTML structure

Usage:
    python3 add-update-notifications.py [--dry-run] [--file FILE]
"""

import os
import sys
import re
import subprocess
from datetime import datetime
from pathlib import Path
import argparse
from typing import Optional, Dict, List

# Directories to skip
SKIP_DIRS = {'.git', 'node_modules', '.vscode', '.github', 'ember-terminal'}

# Files to skip
SKIP_FILES = {'.test-agent-r-private.html', '.test-secret.html', '.agent-r-private.html'}


def get_git_info(file_path: str) -> Optional[Dict[str, str]]:
    """
    Get the last Git commit information for a file.
    
    Returns:
        Dict with keys: date, author, message, hash
        None if Git info cannot be retrieved
    """
    try:
        # Get the last commit info for this file
        cmd = [
            'git', 'log', '-1',
            '--format=%aI|%an|%s|%H',
            '--', file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        if not result.stdout.strip():
            # File not tracked in Git, use current time
            return {
                'date': datetime.utcnow().isoformat() + 'Z',
                'author': 'Developer',
                'message': 'Initial version',
                'hash': 'unknown'
            }
        
        parts = result.stdout.strip().split('|')
        if len(parts) >= 4:
            return {
                'date': parts[0],
                'author': parts[1],
                'message': parts[2],
                'hash': parts[3][:7]  # Short hash
            }
    except subprocess.CalledProcessError as e:
        print(f"Warning: Could not get Git info for {file_path}: {e}")
    except Exception as e:
        print(f"Error getting Git info for {file_path}: {e}")
    
    return None


def has_update_system(html_content: str) -> bool:
    """Check if the HTML already has the update notification system."""
    return 'update-notification-system.js' in html_content


def find_head_closing_tag(html_content: str) -> int:
    """Find the position of the </head> tag."""
    match = re.search(r'</head>', html_content, re.IGNORECASE)
    return match.start() if match else -1


def find_body_opening_tag(html_content: str) -> int:
    """Find the position after the <body> tag."""
    match = re.search(r'<body[^>]*>', html_content, re.IGNORECASE)
    return match.end() if match else -1


def create_meta_tags(git_info: Dict[str, str]) -> str:
    """Create HTML meta tags with Git information."""
    return f'''
  <!-- Update Notification System Meta Information -->
  <meta name="git-commit-hash" content="{git_info['hash']}">
  <meta name="git-commit-date" content="{git_info['date']}">
  <meta name="git-commit-author" content="{git_info['author']}">
  <meta name="git-commit-message" content="{git_info['message']}">
'''


def create_script_tags() -> str:
    """Create script tags for the update notification system."""
    return '''
  <!-- Update Notification System -->
  <script src="js/update-notification-system.js"></script>
  <script src="js/update-helper.js"></script>
'''


def inject_update_system(html_content: str, git_info: Dict[str, str]) -> str:
    """
    Inject the update notification system into the HTML content.
    
    Args:
        html_content: The HTML file content
        git_info: Git commit information
        
    Returns:
        Modified HTML content
    """
    # Find insertion points
    head_pos = find_head_closing_tag(html_content)
    
    if head_pos == -1:
        print("Warning: Could not find </head> tag, skipping")
        return html_content
    
    # Create the insertions
    meta_tags = create_meta_tags(git_info)
    script_tags = create_script_tags()
    
    # Insert meta tags and script tags before </head>
    modified = (
        html_content[:head_pos] +
        meta_tags +
        script_tags +
        html_content[head_pos:]
    )
    
    return modified


def process_html_file(file_path: Path, dry_run: bool = False) -> bool:
    """
    Process a single HTML file.
    
    Args:
        file_path: Path to the HTML file
        dry_run: If True, don't write changes
        
    Returns:
        True if file was modified, False otherwise
    """
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already has the system
        if has_update_system(content):
            print(f"✓ {file_path.name} already has update notification system")
            return False
        
        # Get Git info
        git_info = get_git_info(str(file_path))
        if not git_info:
            print(f"⚠ {file_path.name} - Could not get Git info, using defaults")
            git_info = {
                'date': datetime.utcnow().isoformat() + 'Z',
                'author': 'Developer',
                'message': f'Updated {file_path.name}',
                'hash': 'unknown'
            }
        
        # Inject the system
        modified_content = inject_update_system(content, git_info)
        
        if modified_content == content:
            print(f"⚠ {file_path.name} - No changes made")
            return False
        
        # Write the modified content
        if not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"✅ {file_path.name} - Added update notification system")
        else:
            print(f"[DRY RUN] Would modify {file_path.name}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error processing {file_path.name}: {e}")
        return False


def find_html_files(root_dir: Path) -> List[Path]:
    """Find all HTML files in the repository."""
    html_files = []
    
    for file_path in root_dir.rglob('*.html'):
        # Skip files in excluded directories
        if any(skip_dir in file_path.parts for skip_dir in SKIP_DIRS):
            continue
        
        # Skip excluded files
        if file_path.name in SKIP_FILES:
            continue
        
        html_files.append(file_path)
    
    return sorted(html_files)


def main():
    parser = argparse.ArgumentParser(
        description='Add update notification system to HTML files'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    parser.add_argument(
        '--file',
        type=str,
        help='Process only this specific file'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force update even if system already exists'
    )
    
    args = parser.parse_args()
    
    # Get repository root
    repo_root = Path(__file__).parent
    
    # Process files
    if args.file:
        # Process single file
        file_path = repo_root / args.file
        if not file_path.exists():
            print(f"Error: File {args.file} not found")
            sys.exit(1)
        
        if not file_path.suffix == '.html':
            print(f"Error: {args.file} is not an HTML file")
            sys.exit(1)
        
        print(f"Processing {args.file}...")
        process_html_file(file_path, args.dry_run)
    else:
        # Process all HTML files
        html_files = find_html_files(repo_root)
        
        if not html_files:
            print("No HTML files found")
            sys.exit(0)
        
        print(f"Found {len(html_files)} HTML files")
        print()
        
        modified_count = 0
        for file_path in html_files:
            if process_html_file(file_path, args.dry_run):
                modified_count += 1
        
        print()
        print(f"Summary: Modified {modified_count} out of {len(html_files)} files")
        
        if args.dry_run:
            print("(This was a dry run - no files were actually modified)")


if __name__ == '__main__':
    main()
