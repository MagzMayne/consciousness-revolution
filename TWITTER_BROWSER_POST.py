#!/usr/bin/env python3
"""
TWITTER_BROWSER_POST.py - Playwright Browser Automation for Twitter/X
======================================================================
Posts to Twitter using browser automation (no API needed!)

Usage:
    python TWITTER_BROWSER_POST.py "Your tweet message"
    python TWITTER_BROWSER_POST.py "Check this out!" --media image.png
    python TWITTER_BROWSER_POST.py "New thread!" --thread

Requirements:
    pip install playwright
    playwright install chromium

Author: C1 Mechanic | Created: 2026-02-27
Pattern: 3 → 7 → 13 → ∞ | LFSME
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path

# Try to import playwright
try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️ Playwright not installed. Run: pip install playwright && playwright install chromium")

# Session storage location
SESSION_DIR = Path.home() / ".playwright_twitter_session"


async def post_tweet(message: str, media_path: str = None, headless: bool = False) -> dict:
    """Post a tweet using Playwright browser automation"""

    result = {"success": False, "error": None, "tweet_url": None}

    if not PLAYWRIGHT_AVAILABLE:
        result["error"] = "Playwright not installed"
        return result

    async with async_playwright() as p:
        # Use persistent context to maintain login session
        SESSION_DIR.mkdir(parents=True, exist_ok=True)

        browser = await p.chromium.launch_persistent_context(
            str(SESSION_DIR),
            headless=headless,
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )

        try:
            page = await browser.new_page()

            # Go to Twitter compose
            print("🌐 Navigating to Twitter...")
            await page.goto("https://twitter.com/compose/tweet", wait_until="networkidle")

            # Check if we need to log in
            if "login" in page.url.lower() or await page.locator('[data-testid="loginButton"]').count() > 0:
                print("⚠️ Not logged in! Please log in manually...")
                print("   The browser will open. Log in to your Twitter account.")
                print("   Your session will be saved for future use.")

                # Open visible browser for login
                await browser.close()
                browser = await p.chromium.launch_persistent_context(
                    str(SESSION_DIR),
                    headless=False,  # Show browser for login
                    viewport={"width": 1280, "height": 800}
                )
                page = await browser.new_page()
                await page.goto("https://twitter.com/login", wait_until="networkidle")

                # Wait for user to log in (max 5 minutes)
                print("   Waiting for login... (5 minute timeout)")
                try:
                    await page.wait_for_url("**/home", timeout=300000)
                    print("✅ Login successful! Session saved.")
                    await page.goto("https://twitter.com/compose/tweet", wait_until="networkidle")
                except:
                    result["error"] = "Login timeout - please try again"
                    return result

            # Wait for compose box
            print("📝 Finding compose box...")
            compose_box = page.locator('[data-testid="tweetTextarea_0"]')
            await compose_box.wait_for(timeout=10000)

            # Type the message
            print(f"✍️ Typing message ({len(message)} chars)...")
            await compose_box.fill(message)

            # Upload media if provided
            if media_path and Path(media_path).exists():
                print(f"📎 Uploading media: {media_path}")
                # Find the file input
                file_input = page.locator('input[type="file"]').first
                await file_input.set_input_files(media_path)
                # Wait for upload
                await page.wait_for_timeout(3000)

            # Click the Post button
            print("🚀 Posting tweet...")
            post_button = page.locator('[data-testid="tweetButton"]')
            await post_button.click()

            # Wait for post to complete
            await page.wait_for_timeout(3000)

            # Check if successful (compose dialog should close)
            if "compose" not in page.url:
                result["success"] = True
                result["tweet_url"] = page.url
                print(f"✅ Tweet posted successfully!")
            else:
                # Check for error messages
                error_elem = page.locator('[data-testid="toast"]')
                if await error_elem.count() > 0:
                    result["error"] = await error_elem.text_content()
                else:
                    result["error"] = "Unknown error - tweet may not have posted"

        except Exception as e:
            result["error"] = str(e)
            print(f"❌ Error: {e}")

        finally:
            await browser.close()

    return result


async def check_login_status() -> bool:
    """Check if we have a valid Twitter login session"""

    if not PLAYWRIGHT_AVAILABLE:
        return False

    if not SESSION_DIR.exists():
        return False

    async with async_playwright() as p:
        browser = await p.chromium.launch_persistent_context(
            str(SESSION_DIR),
            headless=True,
            viewport={"width": 1280, "height": 800}
        )

        try:
            page = await browser.new_page()
            await page.goto("https://twitter.com/home", wait_until="networkidle", timeout=15000)

            # Check if we're on home (logged in) or redirected to login
            is_logged_in = "home" in page.url and "login" not in page.url
            return is_logged_in

        except:
            return False
        finally:
            await browser.close()


def main():
    parser = argparse.ArgumentParser(
        description="🐦 Twitter Browser Poster - Post tweets via Playwright",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument("message", nargs="?", help="The tweet message")
    parser.add_argument("--media", "-m", help="Path to media file")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode")
    parser.add_argument("--check-login", action="store_true", help="Check login status")
    parser.add_argument("--login", action="store_true", help="Open browser to log in")

    args = parser.parse_args()

    # Check login status
    if args.check_login:
        print("🔍 Checking Twitter login status...")
        is_logged_in = asyncio.run(check_login_status())
        if is_logged_in:
            print("✅ Logged in! Session is valid.")
        else:
            print("❌ Not logged in. Run with --login to authenticate.")
        sys.exit(0 if is_logged_in else 1)

    # Login mode
    if args.login:
        print("🔐 Opening browser for Twitter login...")
        result = asyncio.run(post_tweet("", headless=False))
        sys.exit(0)

    # Post mode
    if not args.message:
        parser.print_help()
        print("\n❌ Error: Message is required for posting")
        sys.exit(1)

    # Check message length (280 chars for Twitter)
    if len(args.message) > 280:
        print(f"⚠️ Message too long ({len(args.message)}/280 chars)")
        print("   Truncating to 280 characters...")
        args.message = args.message[:277] + "..."

    result = asyncio.run(post_tweet(
        args.message,
        media_path=args.media,
        headless=args.headless
    ))

    if result["success"]:
        print(f"\n✅ SUCCESS! Tweet posted.")
        if result["tweet_url"]:
            print(f"   URL: {result['tweet_url']}")
        sys.exit(0)
    else:
        print(f"\n❌ FAILED: {result['error']}")
        sys.exit(1)


if __name__ == "__main__":
    main()
