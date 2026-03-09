#!/usr/bin/env python3
"""
INSTAGRAM_HELPER.py - Instagram Post Package Creator
=====================================================
Creates ready-to-post packages for Instagram (semi-automatic).

Why semi-automatic?
- Instagram heavily restricts API posting (business accounts only)
- Mobile app posting is most reliable
- This script prepares everything for quick manual posting

Usage:
    python INSTAGRAM_HELPER.py "Caption text" --media image.jpg
    python INSTAGRAM_HELPER.py "Caption" --media video.mp4 --reel
    python INSTAGRAM_HELPER.py --list  # Show queue

Output:
    Creates package in ~/.social_media_automation/instagram_queue/
    Contains: media file, caption.txt, INSTRUCTIONS.txt

Author: C1 Mechanic | Created: 2026-02-27
Pattern: 3 → 7 → 13 → ∞ | LFSME
"""

import argparse
import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path

# Configuration
QUEUE_DIR = Path.home() / ".social_media_automation" / "instagram_queue"
POSTED_DIR = QUEUE_DIR / "posted"
TEMPLATES_DIR = QUEUE_DIR / "templates"

# Default hashtags by category
HASHTAG_SETS = {
    "tech": "#AI #Tech #Innovation #Future #Technology #Automation #MachineLearning",
    "consciousness": "#ConsciousnessRevolution #Awakening #Mindfulness #Growth #Evolution",
    "business": "#Startup #Entrepreneur #Business #Success #Hustle #Grind",
    "creative": "#Art #Design #Creative #Inspiration #Creativity #Digital",
    "default": "#ConsciousnessRevolution #AI #Tech #Innovation #Future"
}


def create_post_package(
    caption: str,
    media_path: str = None,
    is_reel: bool = False,
    hashtag_set: str = "default",
    schedule_time: str = None
) -> dict:
    """Create a ready-to-post Instagram package"""

    result = {
        "success": False,
        "error": None,
        "package_path": None,
        "files_created": []
    }

    try:
        # Create queue directory
        QUEUE_DIR.mkdir(parents=True, exist_ok=True)
        POSTED_DIR.mkdir(exist_ok=True)

        # Create timestamped package folder
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        post_type = "reel" if is_reel else "post"
        package_name = f"{post_type}_{timestamp}"
        package_dir = QUEUE_DIR / package_name
        package_dir.mkdir(exist_ok=True)

        print(f"\n📦 Creating Instagram package: {package_name}")

        # Copy media file if provided
        if media_path:
            media = Path(media_path)
            if media.exists():
                dest_media = package_dir / media.name
                shutil.copy2(media, dest_media)
                result["files_created"].append(str(dest_media))
                print(f"   📷 Media copied: {media.name}")
            else:
                print(f"   ⚠️ Media file not found: {media_path}")

        # Build caption with hashtags
        hashtags = HASHTAG_SETS.get(hashtag_set, HASHTAG_SETS["default"])
        full_caption = f"{caption}\n\n.\n.\n.\n\n{hashtags}"

        # Save caption
        caption_file = package_dir / "caption.txt"
        with open(caption_file, 'w', encoding='utf-8') as f:
            f.write(full_caption)
        result["files_created"].append(str(caption_file))
        print(f"   📝 Caption saved ({len(full_caption)} chars)")

        # Create metadata
        metadata = {
            "created": datetime.now().isoformat(),
            "type": post_type,
            "caption_length": len(caption),
            "hashtag_set": hashtag_set,
            "media": media_path,
            "scheduled": schedule_time,
            "status": "queued"
        }

        metadata_file = package_dir / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        result["files_created"].append(str(metadata_file))

        # Create instructions
        instructions_file = package_dir / "INSTRUCTIONS.txt"
        with open(instructions_file, 'w', encoding='utf-8') as f:
            f.write("=" * 50 + "\n")
            f.write(f"📸 INSTAGRAM {post_type.upper()} PACKAGE\n")
            f.write("=" * 50 + "\n\n")

            f.write("📋 QUICK POST STEPS:\n")
            f.write("-" * 30 + "\n")
            f.write("1. Open Instagram app\n")
            f.write(f"2. Tap + to create new {post_type}\n")

            if media_path:
                f.write(f"3. Select media from this folder:\n")
                f.write(f"   {package_dir}\n")
            else:
                f.write("3. Select or create your media\n")

            f.write("4. Open caption.txt and copy the text\n")
            f.write("5. Paste into Instagram caption\n")
            f.write("6. Post!\n\n")

            if schedule_time:
                f.write(f"⏰ SCHEDULED FOR: {schedule_time}\n\n")

            f.write("-" * 30 + "\n")
            f.write("📊 PACKAGE INFO:\n")
            f.write(f"   Created: {metadata['created']}\n")
            f.write(f"   Type: {post_type}\n")
            f.write(f"   Caption: {len(caption)} chars + hashtags\n")
            f.write("-" * 30 + "\n\n")

            f.write("✅ After posting, move this folder to 'posted/' subfolder\n")

        result["files_created"].append(str(instructions_file))
        print(f"   📄 Instructions created")

        result["success"] = True
        result["package_path"] = str(package_dir)

        print(f"\n✅ Package ready at: {package_dir}")
        print(f"   Files: {len(result['files_created'])}")

    except Exception as e:
        result["error"] = str(e)
        print(f"❌ Error: {e}")

    return result


def list_queue():
    """List all packages in the queue"""

    print("\n" + "=" * 60)
    print("📋 INSTAGRAM POST QUEUE")
    print("=" * 60)

    if not QUEUE_DIR.exists():
        print("   Queue is empty")
        return

    packages = [d for d in QUEUE_DIR.iterdir()
                if d.is_dir() and d.name not in ["posted", "templates"]]

    if not packages:
        print("   Queue is empty")
        return

    for pkg in sorted(packages):
        metadata_file = pkg / "metadata.json"
        if metadata_file.exists():
            with open(metadata_file) as f:
                meta = json.load(f)

            print(f"\n📦 {pkg.name}")
            print(f"   Type: {meta.get('type', 'post')}")
            print(f"   Created: {meta.get('created', 'unknown')}")
            print(f"   Status: {meta.get('status', 'queued')}")
            if meta.get('scheduled'):
                print(f"   Scheduled: {meta['scheduled']}")
        else:
            print(f"\n📦 {pkg.name} (no metadata)")

    print(f"\n📊 Total in queue: {len(packages)}")

    # Check posted
    if POSTED_DIR.exists():
        posted = list(POSTED_DIR.iterdir())
        print(f"📊 Posted archive: {len(posted)}")


def mark_posted(package_name: str):
    """Move a package to posted folder"""

    package_dir = QUEUE_DIR / package_name
    if not package_dir.exists():
        print(f"❌ Package not found: {package_name}")
        return False

    POSTED_DIR.mkdir(exist_ok=True)
    dest = POSTED_DIR / package_name

    shutil.move(str(package_dir), str(dest))

    # Update metadata
    metadata_file = dest / "metadata.json"
    if metadata_file.exists():
        with open(metadata_file) as f:
            meta = json.load(f)
        meta["status"] = "posted"
        meta["posted_at"] = datetime.now().isoformat()
        with open(metadata_file, 'w') as f:
            json.dump(meta, f, indent=2)

    print(f"✅ Marked as posted: {package_name}")
    return True


def create_template(name: str, caption_template: str, hashtag_set: str = "default"):
    """Create a reusable caption template"""

    TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)

    template = {
        "name": name,
        "caption": caption_template,
        "hashtag_set": hashtag_set,
        "created": datetime.now().isoformat()
    }

    template_file = TEMPLATES_DIR / f"{name}.json"
    with open(template_file, 'w') as f:
        json.dump(template, f, indent=2)

    print(f"✅ Template saved: {name}")


def main():
    parser = argparse.ArgumentParser(
        description="📸 Instagram Helper - Create ready-to-post packages",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python INSTAGRAM_HELPER.py "Check this out!" --media photo.jpg
  python INSTAGRAM_HELPER.py "New video!" --media video.mp4 --reel
  python INSTAGRAM_HELPER.py --list
  python INSTAGRAM_HELPER.py --posted package_name

Hashtag sets: tech, consciousness, business, creative, default
        """
    )

    parser.add_argument("caption", nargs="?", help="Post caption")
    parser.add_argument("--media", "-m", help="Path to image or video")
    parser.add_argument("--reel", "-r", action="store_true", help="Create as Reel")
    parser.add_argument("--hashtags", "-H", default="default",
                       choices=list(HASHTAG_SETS.keys()),
                       help="Hashtag set to use")
    parser.add_argument("--schedule", "-s", help="Schedule time (note only)")
    parser.add_argument("--list", "-l", action="store_true", help="List queue")
    parser.add_argument("--posted", help="Mark package as posted")
    parser.add_argument("--open", "-o", action="store_true",
                       help="Open queue folder")

    args = parser.parse_args()

    # List queue
    if args.list:
        list_queue()
        return

    # Mark as posted
    if args.posted:
        mark_posted(args.posted)
        return

    # Open folder
    if args.open:
        QUEUE_DIR.mkdir(parents=True, exist_ok=True)
        if sys.platform == "win32":
            os.startfile(str(QUEUE_DIR))
        elif sys.platform == "darwin":
            os.system(f"open '{QUEUE_DIR}'")
        else:
            os.system(f"xdg-open '{QUEUE_DIR}'")
        print(f"📂 Opened: {QUEUE_DIR}")
        return

    # Create package
    if not args.caption:
        parser.print_help()
        print("\n❌ Caption is required to create a package")
        sys.exit(1)

    result = create_post_package(
        caption=args.caption,
        media_path=args.media,
        is_reel=args.reel,
        hashtag_set=args.hashtags,
        schedule_time=args.schedule
    )

    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
