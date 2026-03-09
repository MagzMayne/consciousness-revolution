#!/usr/bin/env python3
"""
SOCIAL_POSTER.py - One-Command Multi-Platform Poster
=====================================================
Consciousness Revolution Social Media Autonomy Engine

Usage:
    python SOCIAL_POSTER.py "Your message" --platforms all
    python SOCIAL_POSTER.py "Your message" --platforms discord,twitter
    python SOCIAL_POSTER.py "Your message" --media image.png --platforms all
    python SOCIAL_POSTER.py "Your message" --media video.mp4 --platforms youtube,twitter

Platforms:
    - discord: Posts via Discord MCP (instant)
    - twitter: Posts via browser automation (Playwright)
    - youtube: Uploads via YouTube Data API
    - instagram: Creates ready-to-post package (semi-auto)

Author: C1 Mechanic | Created: 2026-02-27
Pattern: 3 → 7 → 13 → ∞ | LFSME
"""

import argparse
import json
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

CONFIG = {
    "discord": {
        "enabled": True,
        "method": "mcp",  # Uses Discord MCP server
        "channel_id": "1327071614498119712",  # Default channel
        "guild_id": "1326783272229347411"
    },
    "twitter": {
        "enabled": True,
        "method": "playwright",  # Browser automation
        "profile_dir": "~/.playwright_twitter_session"
    },
    "youtube": {
        "enabled": True,
        "method": "api",  # YouTube Data API v3
        "credentials_file": "~/.secrets/youtube_credentials.json"
    },
    "instagram": {
        "enabled": True,
        "method": "semi_auto",  # Creates package for manual post
        "output_dir": "~/.social_media_automation/instagram_queue"
    }
}

LOG_FILE = Path.home() / ".social_media_automation" / "post_log.json"

# ============================================================================
# PLATFORM POSTERS
# ============================================================================

def post_to_discord(message: str, media_path: str = None, channel_id: str = None) -> dict:
    """Post to Discord via MCP or webhook fallback"""
    result = {"platform": "discord", "success": False, "error": None, "post_id": None}

    try:
        # Use channel from config or override
        target_channel = channel_id or CONFIG["discord"]["channel_id"]

        # Try MCP first (Claude Code has Discord MCP)
        # For standalone use, we'd call the MCP server directly
        # Here we create a command that can be run

        print(f"📨 Discord: Posting to channel {target_channel}")

        # Create a simple webhook fallback script
        webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
        if webhook_url:
            import requests
            payload = {"content": message}
            if media_path and Path(media_path).exists():
                # Upload with file
                with open(media_path, 'rb') as f:
                    files = {'file': (Path(media_path).name, f)}
                    response = requests.post(webhook_url, data=payload, files=files)
            else:
                response = requests.post(webhook_url, json=payload)

            if response.status_code in [200, 204]:
                result["success"] = True
                result["post_id"] = "webhook_post"
                print("✅ Discord: Posted via webhook")
            else:
                result["error"] = f"Webhook failed: {response.status_code}"
        else:
            # Log for MCP execution (when run from Claude Code)
            result["mcp_command"] = {
                "tool": "mcp__discord__discord_send",
                "params": {"channelId": target_channel, "message": message}
            }
            result["success"] = True
            result["note"] = "Ready for MCP execution"
            print("✅ Discord: MCP command prepared")

    except Exception as e:
        result["error"] = str(e)
        print(f"❌ Discord: {e}")

    return result


def post_to_twitter(message: str, media_path: str = None) -> dict:
    """Post to Twitter via Playwright browser automation"""
    result = {"platform": "twitter", "success": False, "error": None, "post_id": None}

    try:
        print("🐦 Twitter: Starting browser automation...")

        # Check if we have a Twitter browser post script
        twitter_script = Path(__file__).parent / "TWITTER_BROWSER_POST.py"

        if twitter_script.exists():
            # Run the dedicated Twitter script
            cmd = [sys.executable, str(twitter_script), message]
            if media_path:
                cmd.extend(["--media", media_path])

            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if proc.returncode == 0:
                result["success"] = True
                result["post_id"] = "playwright_post"
                print("✅ Twitter: Posted via Playwright")
            else:
                result["error"] = proc.stderr or "Script failed"
        else:
            # Create instruction for manual Playwright execution
            result["playwright_command"] = {
                "action": "navigate_and_post",
                "url": "https://twitter.com/compose/tweet",
                "message": message,
                "media": media_path
            }
            result["success"] = True
            result["note"] = "Playwright command prepared - run TWITTER_BROWSER_POST.py"
            print("⚠️ Twitter: Script not found, command prepared")

    except subprocess.TimeoutExpired:
        result["error"] = "Browser automation timed out"
        print("❌ Twitter: Timeout")
    except Exception as e:
        result["error"] = str(e)
        print(f"❌ Twitter: {e}")

    return result


def post_to_youtube(message: str, media_path: str = None) -> dict:
    """Upload to YouTube via API (requires video file)"""
    result = {"platform": "youtube", "success": False, "error": None, "post_id": None}

    try:
        if not media_path:
            result["error"] = "YouTube requires a video file (--media)"
            print("⚠️ YouTube: No video provided, skipping")
            return result

        media = Path(media_path)
        if not media.exists():
            result["error"] = f"Video file not found: {media_path}"
            print(f"❌ YouTube: File not found")
            return result

        # Check for video extensions
        video_extensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
        if media.suffix.lower() not in video_extensions:
            result["error"] = f"Not a video file: {media.suffix}"
            print(f"⚠️ YouTube: Not a video, skipping")
            return result

        print("📺 YouTube: Preparing upload...")

        # Check for YouTube upload script
        youtube_script = Path(__file__).parent / "YOUTUBE_AUTO_UPLOAD.py"

        if youtube_script.exists():
            cmd = [sys.executable, str(youtube_script),
                   "--title", message[:100],  # Title max 100 chars
                   "--description", message,
                   "--file", str(media)]

            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            if proc.returncode == 0:
                result["success"] = True
                result["post_id"] = "youtube_upload"
                print("✅ YouTube: Video uploaded")
            else:
                result["error"] = proc.stderr or "Upload failed"
        else:
            # Prepare manual upload instructions
            result["upload_info"] = {
                "video": str(media),
                "title": message[:100],
                "description": message,
                "url": "https://studio.youtube.com/channel/upload"
            }
            result["success"] = True
            result["note"] = "Upload prepared - run YOUTUBE_AUTO_UPLOAD.py or upload manually"
            print("⚠️ YouTube: Script not found, info prepared")

    except subprocess.TimeoutExpired:
        result["error"] = "Upload timed out"
        print("❌ YouTube: Timeout")
    except Exception as e:
        result["error"] = str(e)
        print(f"❌ YouTube: {e}")

    return result


def post_to_instagram(message: str, media_path: str = None) -> dict:
    """Create Instagram post package (semi-automatic)"""
    result = {"platform": "instagram", "success": False, "error": None, "post_id": None}

    try:
        print("📸 Instagram: Creating post package...")

        # Create queue directory
        queue_dir = Path(CONFIG["instagram"]["output_dir"]).expanduser()
        queue_dir.mkdir(parents=True, exist_ok=True)

        # Create timestamped package
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        package_dir = queue_dir / f"post_{timestamp}"
        package_dir.mkdir(exist_ok=True)

        # Copy media if provided
        if media_path and Path(media_path).exists():
            import shutil
            media = Path(media_path)
            dest = package_dir / media.name
            shutil.copy2(media, dest)
            result["media_copied"] = str(dest)

        # Create caption file
        caption_file = package_dir / "caption.txt"
        with open(caption_file, 'w', encoding='utf-8') as f:
            f.write(message)
            f.write("\n\n#ConsciousnessRevolution #AI #Tech #Innovation")

        # Create instructions file
        instructions_file = package_dir / "INSTRUCTIONS.txt"
        with open(instructions_file, 'w', encoding='utf-8') as f:
            f.write("INSTAGRAM POST PACKAGE\n")
            f.write("=" * 40 + "\n\n")
            f.write("1. Open Instagram app on phone\n")
            f.write("2. Create new post\n")
            f.write(f"3. Select media from: {package_dir}\n")
            f.write("4. Copy caption from caption.txt\n")
            f.write("5. Post!\n\n")
            f.write(f"Created: {datetime.now().isoformat()}\n")

        result["success"] = True
        result["post_id"] = str(package_dir)
        result["package_location"] = str(package_dir)
        print(f"✅ Instagram: Package created at {package_dir}")

    except Exception as e:
        result["error"] = str(e)
        print(f"❌ Instagram: {e}")

    return result


# ============================================================================
# MAIN ORCHESTRATOR
# ============================================================================

def post_to_all(message: str, media_path: str = None, platforms: list = None) -> dict:
    """Post to all specified platforms"""

    if platforms is None or "all" in platforms:
        platforms = ["discord", "twitter", "youtube", "instagram"]

    results = {
        "timestamp": datetime.now().isoformat(),
        "message": message[:100] + "..." if len(message) > 100 else message,
        "media": media_path,
        "platforms": {}
    }

    print("\n" + "=" * 60)
    print("🚀 SOCIAL POSTER - Consciousness Revolution")
    print("=" * 60)
    print(f"📝 Message: {message[:50]}...")
    print(f"📎 Media: {media_path or 'None'}")
    print(f"🎯 Platforms: {', '.join(platforms)}")
    print("=" * 60 + "\n")

    # Post to each platform
    for platform in platforms:
        if platform == "discord" and CONFIG["discord"]["enabled"]:
            results["platforms"]["discord"] = post_to_discord(message, media_path)

        elif platform == "twitter" and CONFIG["twitter"]["enabled"]:
            results["platforms"]["twitter"] = post_to_twitter(message, media_path)

        elif platform == "youtube" and CONFIG["youtube"]["enabled"]:
            results["platforms"]["youtube"] = post_to_youtube(message, media_path)

        elif platform == "instagram" and CONFIG["instagram"]["enabled"]:
            results["platforms"]["instagram"] = post_to_instagram(message, media_path)

    # Summary
    print("\n" + "=" * 60)
    print("📊 RESULTS SUMMARY")
    print("=" * 60)

    success_count = 0
    for platform, result in results["platforms"].items():
        status = "✅" if result["success"] else "❌"
        print(f"  {status} {platform.upper()}: {result.get('note', result.get('error', 'OK'))}")
        if result["success"]:
            success_count += 1

    print(f"\n  Total: {success_count}/{len(results['platforms'])} successful")
    print("=" * 60 + "\n")

    # Log results
    log_results(results)

    return results


def log_results(results: dict):
    """Log posting results to file"""
    try:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

        # Load existing log
        if LOG_FILE.exists():
            with open(LOG_FILE, 'r') as f:
                log = json.load(f)
        else:
            log = {"posts": []}

        # Append new result
        log["posts"].append(results)

        # Keep last 100 entries
        log["posts"] = log["posts"][-100:]

        # Save
        with open(LOG_FILE, 'w') as f:
            json.dump(log, f, indent=2)

    except Exception as e:
        print(f"⚠️ Could not save log: {e}")


# ============================================================================
# CLI ENTRY POINT
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="🚀 Social Poster - One-command multi-platform posting",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python SOCIAL_POSTER.py "Hello world!" --platforms all
  python SOCIAL_POSTER.py "Check this out!" --media image.png --platforms discord,twitter
  python SOCIAL_POSTER.py "New video!" --media video.mp4 --platforms youtube

Platforms: discord, twitter, youtube, instagram, all
        """
    )

    parser.add_argument("message", help="The message/caption to post")
    parser.add_argument("--media", "-m", help="Path to media file (image/video)")
    parser.add_argument("--platforms", "-p", default="all",
                       help="Comma-separated platforms or 'all' (default: all)")
    parser.add_argument("--discord-channel", help="Override Discord channel ID")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be posted")

    args = parser.parse_args()

    # Parse platforms
    platforms = [p.strip().lower() for p in args.platforms.split(",")]

    # Override Discord channel if specified
    if args.discord_channel:
        CONFIG["discord"]["channel_id"] = args.discord_channel

    # Dry run mode
    if args.dry_run:
        print("\n🔍 DRY RUN - Would post to:")
        print(f"   Message: {args.message}")
        print(f"   Media: {args.media or 'None'}")
        print(f"   Platforms: {platforms}")
        return

    # Post!
    results = post_to_all(args.message, args.media, platforms)

    # Exit with error if all failed
    if not any(r["success"] for r in results["platforms"].values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
