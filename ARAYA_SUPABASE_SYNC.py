"""
ARAYA SUPABASE SYNC
===================
Syncs user conversations from Supabase araya_memory to Cyclotron atoms.db

The Gap: User inputs go to Supabase but NOT to Cyclotron.
This script bridges that gap.

Run: python ARAYA_SUPABASE_SYNC.py
Schedule: Add to Windows Task Scheduler for hourly sync

Created: 2026-01-13
"""

import sqlite3
import json
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv('C:/Users/dwrek/100X_DEPLOYMENT/.env.supabase')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_SECRET') or os.getenv('SUPABASE_PUBLISHABLE_KEY')
CYCLOTRON_DB = "C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db"

def fetch_supabase_messages(limit=1000):
    """Fetch recent messages from Supabase araya_memory table"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[!] Missing Supabase credentials")
        print("    Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.supabase")
        return []

    url = f"{SUPABASE_URL}/rest/v1/araya_memory"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {
        'order': 'created_at.desc',
        'limit': limit
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"[!] Supabase error: {response.status_code}")
            return []
    except Exception as e:
        print(f"[!] Fetch error: {e}")
        return []

def get_existing_supabase_ids():
    """Get IDs of Supabase messages already in Cyclotron"""
    conn = sqlite3.connect(CYCLOTRON_DB)
    cursor = conn.cursor()

    # Check if we have a supabase_id column
    cursor.execute("PRAGMA table_info(atoms)")
    columns = [col[1] for col in cursor.fetchall()]

    if 'supabase_id' not in columns:
        # Add the column
        cursor.execute("ALTER TABLE atoms ADD COLUMN supabase_id TEXT")
        conn.commit()
        print("[+] Added supabase_id column to atoms table")

    # Get existing IDs
    cursor.execute("SELECT supabase_id FROM atoms WHERE supabase_id IS NOT NULL")
    existing = {row[0] for row in cursor.fetchall()}

    conn.close()
    return existing

def sync_to_cyclotron(messages):
    """Sync messages to Cyclotron atoms.db"""
    existing_ids = get_existing_supabase_ids()

    conn = sqlite3.connect(CYCLOTRON_DB)
    cursor = conn.cursor()

    synced = 0
    for msg in messages:
        msg_id = str(msg.get('id'))
        if msg_id in existing_ids:
            continue

        msg_type = msg.get('type', 'araya_conversation')
        content = msg.get('content', '')
        user_id = msg.get('user_id', 'unknown')
        created = msg.get('created_at', datetime.now().isoformat())

        # Format content with context
        if msg_type in ('user', 'assistant'):
            formatted_content = f"[Araya Chat] {msg_type.upper()}: {content}"
        elif msg_type == 'profile':
            try:
                profile = json.loads(content)
                formatted_content = f"[Araya User Profile] {profile}"
            except:
                formatted_content = f"[Araya Profile] {content}"
        elif msg_type == 'insight':
            formatted_content = f"[Araya Insight] {content}"
        else:
            formatted_content = f"[Araya {msg_type}] {content}"

        cursor.execute("""
            INSERT INTO atoms (type, content, created, supabase_id)
            VALUES (?, ?, ?, ?)
        """, (f"araya_{msg_type}", formatted_content, created, msg_id))

        synced += 1

    conn.commit()
    conn.close()

    return synced

def sync():
    print("="*60)
    print("ARAYA SUPABASE SYNC")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()

    # Fetch messages
    print("[1] Fetching from Supabase...")
    messages = fetch_supabase_messages(limit=1000)
    print(f"    Found {len(messages)} messages")

    if not messages:
        print("[!] No messages to sync")
        return 0

    # Sync to Cyclotron
    print("[2] Syncing to Cyclotron...")
    synced = sync_to_cyclotron(messages)
    print(f"    Synced {synced} new messages")

    # Summary
    print()
    print("SUMMARY:")
    print("-"*40)
    print(f"Supabase messages: {len(messages)}")
    print(f"New to Cyclotron: {synced}")

    if synced > 0:
        print()
        print("[!] Run REGENERATE_BRAIN_EXPORT.py to include new atoms in export")

    return synced

if __name__ == "__main__":
    sync()
