#!/usr/bin/env python3
"""
DASHBOARD INDEXER
Scans all HTML files, extracts DNA, populates dashboard_index table

Usage:
    python SCAN_AND_INDEX_DASHBOARDS.py

Indexes by:
- Date created/updated
- Owner (Commander, Agent R, etc.)
- Domain (1_COMMAND, 2_BUILD, etc.)
- Type (cockpit, dashboard, hub)
- Status (LIVE, DRAFT, ARCHIVED)
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path

# Load environment
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Supabase
from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Path to HTML files
HTML_DIR = Path(__file__).parent

def extract_dna(html_content):
    """Extract dashboard-dna JSON from HTML file"""
    match = re.search(
        r'<script[^>]*id=["\']dashboard-dna["\'][^>]*>(.*?)</script>',
        html_content,
        re.DOTALL | re.IGNORECASE
    )
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            return None
    return None

def classify_file(filename):
    """Determine type from filename"""
    name_lower = filename.lower()
    if 'cockpit' in name_lower:
        return 'cockpit'
    elif 'hub' in name_lower:
        return 'hub'
    elif 'tool' in name_lower or 'viewer' in name_lower:
        return 'tool'
    elif 'dashboard' in name_lower:
        return 'dashboard'
    elif 'domain' in name_lower:
        return 'domain'
    else:
        return 'page'

def determine_role_set(filename, dna):
    """Determine which role set this belongs to"""
    if 'COMMANDER_DOMAIN' in filename:
        return 'COMMANDER_DOMAINS'
    elif 'AGENT_R_DOMAIN' in filename:
        return 'AGENT_R_DOMAINS'
    elif dna and dna.get('sphere'):
        return dna['sphere']
    return None

def get_file_dates(filepath):
    """Get file creation and modification dates"""
    stat = filepath.stat()
    return {
        'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
        'modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
    }

def scan_and_index():
    """Main scan function"""
    print(f"Scanning {HTML_DIR} for HTML files...")

    indexed = 0
    skipped = 0
    errors = 0

    html_files = list(HTML_DIR.glob('*.html'))
    print(f"Found {len(html_files)} HTML files")

    for filepath in html_files:
        filename = filepath.name

        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            dna = extract_dna(content)
            dates = get_file_dates(filepath)

            # Build record
            record = {
                'filename': filename,
                'name': dna.get('name', filename.replace('.html', '').replace('_', ' ')) if dna else filename.replace('.html', '').replace('_', ' '),
                'purpose': dna.get('purpose') if dna else None,
                'owner': dna.get('owner') if dna else None,
                'domain': dna.get('domain') if dna else None,
                'type': classify_file(filename),
                'role_set': determine_role_set(filename, dna),
                'created_at': dna.get('created', dates['created']) if dna else dates['created'],
                'updated_at': dna.get('updated', dates['modified']) if dna else dates['modified'],
                'status': dna.get('status', 'LIVE') if dna else 'LIVE',
                'tier': 'GOLD' if dna and dna.get('trinity', {}).get('c3_validated') else ('SILVER' if dna else 'BRONZE'),
                'version': dna.get('version', '1.0.0') if dna else '1.0.0',
                'lfsme_score': dna.get('lfsme', {}).get('average') if dna else None,
                'trinity_complete': bool(dna and dna.get('trinity', {}).get('c3_validated')),
                'url': f"https://consciousnessrevolution.io/{filename}",
                'dna': dna
            }

            # Upsert to Supabase
            result = supabase.table('dashboard_index').upsert(
                record,
                on_conflict='filename'
            ).execute()

            indexed += 1
            tier_emoji = {'GOLD': '🥇', 'SILVER': '🥈', 'BRONZE': '🥉'}.get(record['tier'], '⚪')
            print(f"  {tier_emoji} {filename}")

        except Exception as e:
            errors += 1
            print(f"  ❌ {filename}: {e}")

    print(f"\n✅ Indexed: {indexed}")
    print(f"⚠️ Errors: {errors}")

    # Summary by owner
    print("\n📊 BY OWNER:")
    result = supabase.table('dashboard_index').select('owner').execute()
    owners = {}
    for row in result.data:
        owner = row.get('owner') or 'Unknown'
        owners[owner] = owners.get(owner, 0) + 1
    for owner, count in sorted(owners.items(), key=lambda x: -x[1])[:10]:
        print(f"  {owner}: {count}")

    # Summary by domain
    print("\n📊 BY DOMAIN:")
    result = supabase.table('dashboard_index').select('domain').execute()
    domains = {}
    for row in result.data:
        domain = row.get('domain') or 'Unknown'
        domains[domain] = domains.get(domain, 0) + 1
    for domain, count in sorted(domains.items()):
        print(f"  {domain}: {count}")

if __name__ == '__main__':
    scan_and_index()
