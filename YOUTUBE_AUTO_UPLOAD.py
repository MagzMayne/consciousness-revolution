#!/usr/bin/env python3
"""
YOUTUBE_AUTO_UPLOAD.py - YouTube Data API Video Uploader
=========================================================
Uploads videos to YouTube with title, description, and tags.

Usage:
    python YOUTUBE_AUTO_UPLOAD.py --file video.mp4 --title "My Video" --description "Description"
    python YOUTUBE_AUTO_UPLOAD.py --file video.mp4 --title "My Video" --privacy unlisted
    python YOUTUBE_AUTO_UPLOAD.py --setup  # First-time OAuth setup

Requirements:
    pip install google-auth google-auth-oauthlib google-api-python-client

Setup:
    1. Go to Google Cloud Console → APIs & Services
    2. Enable YouTube Data API v3
    3. Create OAuth 2.0 credentials (Desktop app)
    4. Download client_secrets.json
    5. Run: python YOUTUBE_AUTO_UPLOAD.py --setup

Author: C1 Mechanic | Created: 2026-02-27
Pattern: 3 → 7 → 13 → ∞ | LFSME
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Try to import Google API libraries
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False
    print("⚠️ Google API libraries not installed.")
    print("   Run: pip install google-auth google-auth-oauthlib google-api-python-client")

# Configuration paths
SECRETS_DIR = Path.home() / ".secrets"
CLIENT_SECRETS_FILE = SECRETS_DIR / "youtube_client_secrets.json"
TOKEN_FILE = SECRETS_DIR / "youtube_token.json"

# YouTube API scopes
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


def get_authenticated_service():
    """Get authenticated YouTube service"""

    if not GOOGLE_API_AVAILABLE:
        raise RuntimeError("Google API libraries not installed")

    credentials = None

    # Load existing token
    if TOKEN_FILE.exists():
        credentials = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    # Refresh or get new token
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            print("🔄 Refreshing access token...")
            credentials.refresh(Request())
        else:
            if not CLIENT_SECRETS_FILE.exists():
                raise FileNotFoundError(
                    f"Client secrets not found at {CLIENT_SECRETS_FILE}\n"
                    "Download from Google Cloud Console → APIs → Credentials"
                )

            print("🔐 Starting OAuth flow...")
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CLIENT_SECRETS_FILE), SCOPES
            )
            credentials = flow.run_local_server(port=8080)

        # Save token
        TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_FILE, 'w') as f:
            f.write(credentials.to_json())
        print(f"✅ Token saved to {TOKEN_FILE}")

    return build("youtube", "v3", credentials=credentials)


def upload_video(
    file_path: str,
    title: str,
    description: str = "",
    tags: list = None,
    category_id: str = "22",  # 22 = People & Blogs
    privacy: str = "unlisted"
) -> dict:
    """Upload a video to YouTube"""

    result = {"success": False, "error": None, "video_id": None, "url": None}

    # Validate file
    video_file = Path(file_path)
    if not video_file.exists():
        result["error"] = f"Video file not found: {file_path}"
        return result

    # Check file size (YouTube max is 256GB, but we'll warn at 2GB)
    file_size_gb = video_file.stat().st_size / (1024**3)
    if file_size_gb > 2:
        print(f"⚠️ Large file ({file_size_gb:.1f} GB) - upload may take a while")

    try:
        print("🔐 Authenticating with YouTube...")
        youtube = get_authenticated_service()

        # Prepare video metadata
        body = {
            "snippet": {
                "title": title[:100],  # Max 100 chars
                "description": description[:5000],  # Max 5000 chars
                "tags": tags or ["ConsciousnessRevolution", "AI", "Tech"],
                "categoryId": category_id
            },
            "status": {
                "privacyStatus": privacy,  # public, unlisted, private
                "selfDeclaredMadeForKids": False
            }
        }

        print(f"📺 Uploading: {video_file.name}")
        print(f"   Title: {title}")
        print(f"   Privacy: {privacy}")
        print(f"   Size: {file_size_gb:.2f} GB")

        # Create upload request
        media = MediaFileUpload(
            str(video_file),
            chunksize=1024*1024,  # 1MB chunks
            resumable=True
        )

        request = youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media
        )

        # Execute upload with progress
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                progress = int(status.progress() * 100)
                print(f"   Progress: {progress}%", end="\r")

        print("\n✅ Upload complete!")

        result["success"] = True
        result["video_id"] = response["id"]
        result["url"] = f"https://youtu.be/{response['id']}"

        print(f"   Video ID: {result['video_id']}")
        print(f"   URL: {result['url']}")

    except FileNotFoundError as e:
        result["error"] = str(e)
        print(f"❌ {e}")
    except Exception as e:
        result["error"] = str(e)
        print(f"❌ Upload failed: {e}")

    return result


def setup_oauth():
    """Interactive OAuth setup"""

    print("\n" + "=" * 60)
    print("🔧 YOUTUBE API SETUP")
    print("=" * 60)

    # Check for client secrets
    if CLIENT_SECRETS_FILE.exists():
        print(f"✅ Client secrets found: {CLIENT_SECRETS_FILE}")
    else:
        print(f"❌ Client secrets not found!")
        print("\n📋 SETUP INSTRUCTIONS:")
        print("1. Go to: https://console.cloud.google.com/")
        print("2. Create a new project (or select existing)")
        print("3. Enable 'YouTube Data API v3'")
        print("4. Go to 'APIs & Services' → 'Credentials'")
        print("5. Create 'OAuth client ID' (Desktop application)")
        print("6. Download the JSON file")
        print(f"7. Save it as: {CLIENT_SECRETS_FILE}")
        print("\nThen run this script again with --setup")
        return

    # Try to authenticate
    try:
        print("\n🔐 Starting authentication...")
        youtube = get_authenticated_service()
        print("✅ Authentication successful!")

        # Test API access
        request = youtube.channels().list(part="snippet", mine=True)
        response = request.execute()

        if response.get("items"):
            channel = response["items"][0]["snippet"]
            print(f"\n📺 Connected to channel: {channel['title']}")

    except Exception as e:
        print(f"❌ Authentication failed: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="📺 YouTube Auto Uploader",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python YOUTUBE_AUTO_UPLOAD.py --file video.mp4 --title "My Video"
  python YOUTUBE_AUTO_UPLOAD.py --file video.mp4 --title "Demo" --privacy public
  python YOUTUBE_AUTO_UPLOAD.py --setup

Privacy options: public, unlisted, private
        """
    )

    parser.add_argument("--file", "-f", help="Path to video file")
    parser.add_argument("--title", "-t", help="Video title")
    parser.add_argument("--description", "-d", default="", help="Video description")
    parser.add_argument("--tags", help="Comma-separated tags")
    parser.add_argument("--privacy", "-p", default="unlisted",
                       choices=["public", "unlisted", "private"],
                       help="Privacy status (default: unlisted)")
    parser.add_argument("--category", default="22", help="Category ID (default: 22 = People & Blogs)")
    parser.add_argument("--setup", action="store_true", help="Run OAuth setup wizard")

    args = parser.parse_args()

    # Setup mode
    if args.setup:
        setup_oauth()
        return

    # Upload mode
    if not args.file or not args.title:
        parser.print_help()
        print("\n❌ Error: --file and --title are required")
        sys.exit(1)

    # Parse tags
    tags = args.tags.split(",") if args.tags else None

    result = upload_video(
        file_path=args.file,
        title=args.title,
        description=args.description,
        tags=tags,
        category_id=args.category,
        privacy=args.privacy
    )

    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
