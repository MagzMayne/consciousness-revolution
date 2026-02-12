#!/usr/bin/env python3
"""
Restore Repository to a Previous Restore Point
Safely reverts the repository to a tagged restore point.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

RESTORE_POINTS_DIR = Path(".restore_points")


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
                returncode, commit, _ = run_command(f"git rev-parse {tag}")
                if returncode == 0:
                    restore_points.append({
                        "tag": tag,
                        "commit": commit,
                        "timestamp": "unknown",
                        "reason": "Metadata unavailable"
                    })
    
    return restore_points


def create_safety_branch():
    """Create a safety branch before restoring."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    branch_name = f"backup-before-restore-{timestamp}"
    
    returncode, _, stderr = run_command(f'git branch "{branch_name}"')
    if returncode != 0:
        return None, f"Failed to create safety branch: {stderr}"
    
    return branch_name, None


def restore_to_point(tag_name, create_branch=False, force=False):
    """
    Restore repository to a specific restore point.
    
    Args:
        tag_name: The restore point tag to revert to
        create_branch: If True, create a new branch at the restore point
        force: If True, force restore even with uncommitted changes
    
    Returns:
        tuple: (success: bool, message: str)
    """
    # Check if tag exists
    returncode, _, _ = run_command(f"git rev-parse {tag_name}")
    if returncode != 0:
        return False, f"Restore point '{tag_name}' not found"
    
    # Check for uncommitted changes
    status_ok, git_status = get_git_status()
    if not status_ok:
        return False, "Failed to check git status"
    
    if git_status and not force:
        return False, (
            "Repository has uncommitted changes.\n"
            "Please commit or stash changes, or use --force to proceed.\n"
            "WARNING: --force will discard all uncommitted changes!"
        )
    
    # Create safety branch
    safety_branch, error = create_safety_branch()
    if error:
        return False, error
    
    print(f"Created safety branch: {safety_branch}")
    
    # Get metadata for the restore point
    metadata_file = RESTORE_POINTS_DIR / f"{tag_name}.json"
    original_branch = None
    if metadata_file.exists():
        try:
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
                original_branch = metadata.get('branch')
        except Exception:
            pass
    
    if create_branch:
        # Create a new branch at the restore point
        new_branch = f"restored-{tag_name}"
        returncode, _, stderr = run_command(f'git checkout -b "{new_branch}" "{tag_name}"')
        if returncode != 0:
            return False, f"Failed to create new branch: {stderr}"
        
        return True, (
            f"Successfully created branch '{new_branch}' at restore point '{tag_name}'.\n"
            f"Safety backup available at branch: {safety_branch}"
        )
    else:
        # Reset to the restore point (hard reset)
        if force:
            returncode, _, stderr = run_command(f'git reset --hard "{tag_name}"')
        else:
            returncode, _, stderr = run_command(f'git reset --hard "{tag_name}"')
        
        if returncode != 0:
            return False, f"Failed to restore: {stderr}"
        
        return True, (
            f"Successfully restored to '{tag_name}'.\n"
            f"Safety backup available at branch: {safety_branch}\n"
            f"Original branch: {original_branch or 'unknown'}"
        )


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Restore repository to a previous restore point"
    )
    parser.add_argument(
        'tag',
        nargs='?',
        help='Restore point tag to restore to (e.g., restore-20260212_100000)'
    )
    parser.add_argument(
        '--list',
        action='store_true',
        help='List all available restore points'
    )
    parser.add_argument(
        '--latest',
        action='store_true',
        help='Restore to the most recent restore point'
    )
    parser.add_argument(
        '--branch',
        action='store_true',
        help='Create a new branch at the restore point instead of resetting'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force restore even with uncommitted changes (WARNING: will discard changes)'
    )
    
    args = parser.parse_args()
    
    if args.list or (not args.tag and not args.latest):
        restore_points = list_restore_points()
        if not restore_points:
            print("No restore points found")
            sys.exit(1)
        
        print(f"\n{'='*80}")
        print(f"Available Restore Points ({len(restore_points)} total)")
        print(f"{'='*80}\n")
        for i, rp in enumerate(restore_points, 1):
            print(f"{i}. Tag:       {rp.get('tag', 'unknown')}")
            print(f"   Timestamp: {rp.get('timestamp', 'unknown')}")
            print(f"   Commit:    {rp.get('commit', 'unknown')[:12]}")
            print(f"   Branch:    {rp.get('branch', 'unknown')}")
            print(f"   Reason:    {rp.get('reason', 'unknown')}")
            print(f"{'-'*80}")
        
        if not args.list:
            print("\nUsage:")
            print("  python restore_from_point.py <tag>           - Restore to specific point")
            print("  python restore_from_point.py --latest        - Restore to latest point")
            print("  python restore_from_point.py <tag> --branch  - Create branch at restore point")
        
        sys.exit(0)
    
    # Determine which tag to restore to
    if args.latest:
        restore_points = list_restore_points()
        if not restore_points:
            print("No restore points found")
            sys.exit(1)
        tag = restore_points[0]['tag']
        print(f"Restoring to latest restore point: {tag}")
    else:
        tag = args.tag
    
    # Confirm action
    if not args.force:
        print(f"\nYou are about to restore to: {tag}")
        if args.branch:
            print("This will create a new branch at the restore point.")
        else:
            print("This will reset your current branch to the restore point.")
        print("A safety backup branch will be created first.")
        
        response = input("\nContinue? (yes/no): ").strip().lower()
        if response not in ['yes', 'y']:
            print("Restore cancelled")
            sys.exit(0)
    
    # Perform restore
    success, message = restore_to_point(tag, args.branch, args.force)
    print(f"\n{message}")
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
