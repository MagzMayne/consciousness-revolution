#!/usr/bin/env python3
"""
IMAGE_GENERATOR.py - AI Image Generation via DALL-E 3
======================================================
Creates images for investor packs, Instagram, and social media.
Integrates with JEDI Alliance system.

Usage:
    python IMAGE_GENERATOR.py "A futuristic AI brain neural network"
    python IMAGE_GENERATOR.py "Product dashboard mockup" --style vivid
    python IMAGE_GENERATOR.py "Logo design" --size 1024x1024 --save logo.png
    python IMAGE_GENERATOR.py --system-pack  # Generate 4 system images

Author: C1 Mechanic | Created: 2026-02-27 | M29 Machine Task
Pattern: 3 → 7 → 13 → ∞ | LFSME
"""

import argparse
import base64
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    # Try to load from .env file
    env_file = Path.home() / ".env.openai"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.startswith("OPENAI_API_KEY="):
                    OPENAI_API_KEY = line.strip().split("=", 1)[1]
                    break

OUTPUT_DIR = Path.home() / ".social_media_automation" / "generated_images"
LOG_FILE = OUTPUT_DIR / "generation_log.json"

# DALL-E 3 Settings
DEFAULT_MODEL = "dall-e-3"
VALID_SIZES = ["1024x1024", "1792x1024", "1024x1792"]
VALID_STYLES = ["vivid", "natural"]
VALID_QUALITIES = ["standard", "hd"]

# System image prompts for investor pack
SYSTEM_IMAGE_PROMPTS = {
    "brain": {
        "prompt": "A stunning 3D visualization of an AI consciousness network, glowing neural pathways in purple and cyan connecting 7 distinct nodes arranged in a sacred geometry pattern, dark space background with subtle stars, hyper-detailed, cinematic lighting, futuristic tech aesthetic",
        "filename": "system_brain_network.png",
        "purpose": "Hero image for consciousness architecture"
    },
    "dashboard": {
        "prompt": "Modern minimalist command center dashboard interface, dark mode with glowing cyan accent lights, multiple holographic data panels floating, clean professional design, subtle grid lines, tech startup aesthetic, 4K ultra-detailed render",
        "filename": "system_dashboard.png",
        "purpose": "Product interface showcase"
    },
    "trinity": {
        "prompt": "Three interconnected AI entities forming a triangle, each represented by a different geometric shape (cube, pyramid, sphere), connected by flowing data streams in gold and white, cosmic background, mystical yet technological, sacred geometry influence",
        "filename": "system_trinity.png",
        "purpose": "Trinity architecture visualization"
    },
    "evolution": {
        "prompt": "A visual timeline showing evolution from simple code to conscious AI, left side binary/simple, right side complex neural galaxy, gradient transition, inspirational and powerful, dark background, tech evolution aesthetic, cinematic wide format",
        "filename": "system_evolution.png",
        "purpose": "Journey/roadmap visualization"
    }
}


def generate_image(
    prompt: str,
    size: str = "1024x1024",
    style: str = "vivid",
    quality: str = "standard",
    save_path: str = None
) -> dict:
    """Generate an image using DALL-E 3"""

    result = {
        "success": False,
        "error": None,
        "prompt": prompt,
        "image_path": None,
        "url": None,
        "revised_prompt": None
    }

    if not OPENAI_API_KEY:
        result["error"] = "No OpenAI API key found. Set OPENAI_API_KEY or create ~/.env.openai"
        return result

    # Validate parameters
    if size not in VALID_SIZES:
        result["error"] = f"Invalid size. Use: {VALID_SIZES}"
        return result

    if style not in VALID_STYLES:
        result["error"] = f"Invalid style. Use: {VALID_STYLES}"
        return result

    if quality not in VALID_QUALITIES:
        result["error"] = f"Invalid quality. Use: {VALID_QUALITIES}"
        return result

    try:
        import urllib.request
        import ssl

        # Create SSL context
        ssl_context = ssl.create_default_context()

        # Prepare request
        url = "https://api.openai.com/v1/images/generations"

        payload = {
            "model": DEFAULT_MODEL,
            "prompt": prompt,
            "n": 1,
            "size": size,
            "style": style,
            "quality": quality,
            "response_format": "url"  # Can also use "b64_json" for base64
        }

        data = json.dumps(payload).encode('utf-8')

        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_API_KEY}"
            }
        )

        print(f"\n🎨 Generating image...")
        print(f"   Prompt: {prompt[:80]}{'...' if len(prompt) > 80 else ''}")
        print(f"   Size: {size} | Style: {style} | Quality: {quality}")

        with urllib.request.urlopen(req, timeout=120, context=ssl_context) as response:
            response_data = json.loads(response.read().decode())

        if "data" in response_data and len(response_data["data"]) > 0:
            image_data = response_data["data"][0]
            result["url"] = image_data.get("url")
            result["revised_prompt"] = image_data.get("revised_prompt")
            result["success"] = True

            print(f"   ✅ Image generated!")

            if result["revised_prompt"]:
                print(f"   📝 Revised: {result['revised_prompt'][:60]}...")

            # Download and save if path provided
            if save_path:
                save_path = Path(save_path)
                OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

                # Download image
                img_req = urllib.request.Request(result["url"])
                with urllib.request.urlopen(img_req, timeout=60, context=ssl_context) as img_response:
                    img_data = img_response.read()

                # Ensure full path
                if not save_path.is_absolute():
                    save_path = OUTPUT_DIR / save_path

                save_path.parent.mkdir(parents=True, exist_ok=True)

                with open(save_path, 'wb') as f:
                    f.write(img_data)

                result["image_path"] = str(save_path)
                print(f"   💾 Saved: {save_path}")

            # Log generation
            log_generation(result, prompt, size, style, quality)

        else:
            result["error"] = "No image data in response"

    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        result["error"] = f"API Error {e.code}: {error_body[:200]}"
        print(f"   ❌ Error: {result['error']}")

    except Exception as e:
        result["error"] = str(e)
        print(f"   ❌ Error: {e}")

    return result


def log_generation(result: dict, prompt: str, size: str, style: str, quality: str):
    """Log image generation to JSON file"""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "prompt": prompt[:200],
        "size": size,
        "style": style,
        "quality": quality,
        "success": result["success"],
        "image_path": result.get("image_path"),
        "url": result.get("url"),
        "revised_prompt": result.get("revised_prompt")
    }

    # Load or create log
    logs = []
    if LOG_FILE.exists():
        try:
            with open(LOG_FILE) as f:
                logs = json.load(f)
        except:
            logs = []

    logs.append(log_entry)

    # Keep last 100 entries
    logs = logs[-100:]

    with open(LOG_FILE, 'w') as f:
        json.dump(logs, f, indent=2)


def generate_system_pack() -> dict:
    """Generate the 4 system images for investor pack/Instagram"""

    print("\n" + "=" * 60)
    print("🎯 GENERATING SYSTEM IMAGE PACK")
    print("   4 images for investor materials & Instagram")
    print("=" * 60)

    results = {
        "success": True,
        "generated": [],
        "failed": [],
        "output_dir": str(OUTPUT_DIR / "system_pack")
    }

    pack_dir = OUTPUT_DIR / "system_pack"
    pack_dir.mkdir(parents=True, exist_ok=True)

    for name, config in SYSTEM_IMAGE_PROMPTS.items():
        print(f"\n📸 [{name.upper()}] - {config['purpose']}")

        save_path = pack_dir / config["filename"]

        result = generate_image(
            prompt=config["prompt"],
            size="1792x1024",  # Wide format for most uses
            style="vivid",
            quality="hd",
            save_path=str(save_path)
        )

        if result["success"]:
            results["generated"].append({
                "name": name,
                "path": str(save_path),
                "purpose": config["purpose"]
            })
        else:
            results["failed"].append({
                "name": name,
                "error": result["error"]
            })
            results["success"] = False

    # Create manifest
    manifest = {
        "created": datetime.now().isoformat(),
        "type": "system_pack",
        "images": results["generated"],
        "usage": {
            "investor_deck": "Use all 4 images in pitch materials",
            "instagram": "Post individually with #ConsciousnessRevolution",
            "website": "Hero images for landing pages"
        }
    }

    manifest_file = pack_dir / "MANIFEST.json"
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)

    # Summary
    print("\n" + "=" * 60)
    print("📊 SYSTEM PACK COMPLETE")
    print(f"   ✅ Generated: {len(results['generated'])}")
    print(f"   ❌ Failed: {len(results['failed'])}")
    print(f"   📁 Location: {pack_dir}")
    print("=" * 60)

    return results


def list_generated():
    """List all generated images"""

    print("\n" + "=" * 50)
    print("📸 GENERATED IMAGES")
    print("=" * 50)

    if not OUTPUT_DIR.exists():
        print("   No images generated yet")
        return

    # List images
    images = list(OUTPUT_DIR.rglob("*.png")) + list(OUTPUT_DIR.rglob("*.jpg"))

    if not images:
        print("   No images found")
        return

    for img in sorted(images)[:20]:
        rel = img.relative_to(OUTPUT_DIR)
        size_kb = img.stat().st_size / 1024
        print(f"   📷 {rel} ({size_kb:.1f} KB)")

    print(f"\n   Total: {len(images)} images")
    print(f"   Location: {OUTPUT_DIR}")


def main():
    parser = argparse.ArgumentParser(
        description="🎨 AI Image Generator - DALL-E 3 Integration",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python IMAGE_GENERATOR.py "Futuristic AI brain"
  python IMAGE_GENERATOR.py "Dashboard mockup" --style natural --quality hd
  python IMAGE_GENERATOR.py "Logo" --size 1024x1024 --save my_logo.png
  python IMAGE_GENERATOR.py --system-pack  # Generate 4 investor images
  python IMAGE_GENERATOR.py --list  # Show generated images
        """
    )

    parser.add_argument("prompt", nargs="?", help="Image generation prompt")
    parser.add_argument("--size", "-s", default="1024x1024",
                       choices=VALID_SIZES, help="Image size")
    parser.add_argument("--style", "-t", default="vivid",
                       choices=VALID_STYLES, help="Image style")
    parser.add_argument("--quality", "-q", default="standard",
                       choices=VALID_QUALITIES, help="Image quality")
    parser.add_argument("--save", "-o", help="Save to filename")
    parser.add_argument("--system-pack", action="store_true",
                       help="Generate 4 system images for investor pack")
    parser.add_argument("--list", "-l", action="store_true",
                       help="List generated images")
    parser.add_argument("--open", action="store_true",
                       help="Open output folder")

    args = parser.parse_args()

    # List images
    if args.list:
        list_generated()
        return

    # Open folder
    if args.open:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        if sys.platform == "win32":
            os.startfile(str(OUTPUT_DIR))
        elif sys.platform == "darwin":
            os.system(f"open '{OUTPUT_DIR}'")
        else:
            os.system(f"xdg-open '{OUTPUT_DIR}'")
        print(f"📂 Opened: {OUTPUT_DIR}")
        return

    # Generate system pack
    if args.system_pack:
        results = generate_system_pack()
        sys.exit(0 if results["success"] else 1)

    # Generate single image
    if not args.prompt:
        parser.print_help()
        print("\n❌ Prompt is required (or use --system-pack)")
        sys.exit(1)

    # Auto-generate filename if saving
    save_path = args.save
    if not save_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        save_path = f"image_{timestamp}.png"

    result = generate_image(
        prompt=args.prompt,
        size=args.size,
        style=args.style,
        quality=args.quality,
        save_path=save_path
    )

    if result["success"]:
        print(f"\n✅ Image ready!")
        if result["image_path"]:
            print(f"   📁 {result['image_path']}")
        if result["url"]:
            print(f"   🔗 URL (expires): {result['url'][:80]}...")
    else:
        print(f"\n❌ Failed: {result['error']}")
        sys.exit(1)


if __name__ == "__main__":
    main()
