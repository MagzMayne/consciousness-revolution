#!/usr/bin/env python3
"""
Autonomous Restore Point System
Creates Git tags with metadata to mark stable repository states.
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Configuration
RESTORE_POINTS_DIR = Path(".restore_points")
MAX_RESTORE_POINTS = 10  # Keep last 10 restore points


def run_command(cmd, capture_output=True):
    """Run a shell command and return output."""
    result = subprocess.run(
        cmd,
        shell=True,
        capture_output=capture_output,
        text=True,
        check=False
    )
    return result.returncode, result.stdout.strip(), result.stderr.strip()


def get_git_status():
    """Check if repository has uncommitted changes."""
    returncode, stdout, _ = run_command("git status --porcelain")
    return returncode == 0, stdout


def get_current_commit():
    """Get current commit SHA."""
    returncode, sha, _ = run_command("git rev-parse HEAD")
    return sha if returncode == 0 else None


def get_current_branch():
    """Get current branch name."""
    returncode, branch, _ = run_command("git rev-parse --abbrev-ref HEAD")
    return branch if returncode == 0 else None


def create_restore_point(reason="Automatic backup", force=False):
    """
    Create a restore point (git tag) with metadata.
    
    Args:
        reason: Description of why this restore point is being created
        force: If True, create restore point even with uncommitted changes
    
    Returns:
        tuple: (success: bool, tag_name: str, message: str)
    """
    # Check git status
    status_ok, git_status = get_git_status()
    if not status_ok:
        return False, None, "Failed to check git status"
    
    if git_status and not force:
        return False, None, "Repository has uncommitted changes. Commit or use --force."
    
    # Get current commit and branch
    commit_sha = get_current_commit()
    branch = get_current_branch()
    
    if not commit_sha:
        return False, None, "Failed to get current commit"
    
    # Generate timestamp-based tag name
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    tag_name = f"restore-{timestamp}"
    
    # Create metadata
    metadata = {
        "tag": tag_name,
        "timestamp": datetime.now().isoformat(),
        "commit": commit_sha,
        "branch": branch,
        "reason": reason,
        "has_uncommitted_changes": bool(git_status)
    }
    
    # Create git tag
    tag_message = f"Restore Point: {reason}"
    returncode, _, stderr = run_command(
        f'git tag -a "{tag_name}" -m "{tag_message}"'
    )
    
    if returncode != 0:
        return False, None, f"Failed to create git tag: {stderr}"
    
    # Save metadata
    RESTORE_POINTS_DIR.mkdir(exist_ok=True)
    metadata_file = RESTORE_POINTS_DIR / f"{tag_name}.json"
    
    try:
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    except Exception as e:
        # Rollback tag creation if metadata save fails
        run_command(f'git tag -d "{tag_name}"')
        return False, None, f"Failed to save metadata: {e}"
    
    return True, tag_name, f"Restore point '{tag_name}' created successfully"


def list_restore_points():
    """List all available restore points."""
    returncode, tags, _ = run_command("git tag -l 'restore-*' --sort=-creatordate")
    
    if returncode != 0:
        return []
    
    restore_points = []
    for tag in tags.split('\n'):
        if not tag:
            continue
            
        metadata_file = RESTORE_POINTS_DIR / f"{tag}.json"
        if metadata_file.exists():
            try:
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                    restore_points.append(metadata)
            except Exception:
                # If metadata file is corrupted, get basic info from git
                returncode, commit, _ = run_command(f"git rev-parse {tag}")
                if returncode == 0:
                    restore_points.append({
                        "tag": tag,
                        "commit": commit,
                        "timestamp": "unknown",
                        "reason": "Metadata unavailable"
                    })
    
    return restore_points


def cleanup_old_restore_points():
    """Remove old restore points exceeding MAX_RESTORE_POINTS."""
    restore_points = list_restore_points()
    
    if len(restore_points) <= MAX_RESTORE_POINTS:
        return 0
    
    # Sort by timestamp (oldest first)
    restore_points.sort(key=lambda x: x.get('timestamp', ''))
    
    # Remove oldest restore points
    to_remove = restore_points[:len(restore_points) - MAX_RESTORE_POINTS]
    removed_count = 0
    
    for rp in to_remove:
        tag = rp['tag']
        # Remove git tag
        returncode, _, _ = run_command(f'git tag -d "{tag}"')
        if returncode == 0:
            removed_count += 1
            # Remove metadata file
            metadata_file = RESTORE_POINTS_DIR / f"{tag}.json"
            if metadata_file.exists():
                metadata_file.unlink()
    
    return removed_count


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Autonomous Restore Point System"
    )
    parser.add_argument(
        '--create',
        action='store_true',
        help='Create a new restore point'
    )
    parser.add_argument(
        '--list',
        action='store_true',
        help='List all restore points'
    )
    parser.add_argument(
        '--reason',
        type=str,
        default='Automatic backup',
        help='Reason for creating restore point'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Create restore point even with uncommitted changes'
    )
    parser.add_argument(
        '--cleanup',
        action='store_true',
        help='Clean up old restore points'
    )
    
    args = parser.parse_args()
    
    # If no action specified, default to create
    if not any([args.create, args.list, args.cleanup]):
        args.create = True
    
    if args.create:
        success, tag_name, message = create_restore_point(args.reason, args.force)
        print(message)
        if success:
            # Auto-cleanup old restore points
            removed = cleanup_old_restore_points()
            if removed > 0:
                print(f"Cleaned up {removed} old restore point(s)")
            sys.exit(0)
        else:
            sys.exit(1)
    
    if args.list:
        restore_points = list_restore_points()
        if not restore_points:
            print("No restore points found")
        else:
            print(f"\n{'='*80}")
            print(f"Available Restore Points ({len(restore_points)} total)")
            print(f"{'='*80}\n")
            for rp in restore_points:
                print(f"Tag:       {rp.get('tag', 'unknown')}")
                print(f"Timestamp: {rp.get('timestamp', 'unknown')}")
                print(f"Commit:    {rp.get('commit', 'unknown')[:12]}")
                print(f"Branch:    {rp.get('branch', 'unknown')}")
                print(f"Reason:    {rp.get('reason', 'unknown')}")
                print(f"{'-'*80}")
    
    if args.cleanup:
        removed = cleanup_old_restore_points()
        print(f"Cleaned up {removed} old restore point(s)")


if __name__ == "__main__":
    main()
