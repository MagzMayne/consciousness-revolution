#!/usr/bin/env python3
"""
LOCAL DASHBOARD INDEXER
Scans HTML files, extracts DNA, outputs to JSON
No Supabase needed - upload later
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path

HTML_DIR = Path(__file__).parent

def extract_dna(html_content):
    match = re.search(
        r'<script[^>]*id=["\']dashboard-dna["\'][^>]*>(.*?)</script>',
        html_content, re.DOTALL | re.IGNORECASE
    )
    if match:
        try:
            return json.loads(match.group(1).strip())
        except:
            return None
    return None

def classify_file(filename):
    name_lower = filename.lower()
    if 'cockpit' in name_lower: return 'cockpit'
    elif 'hub' in name_lower: return 'hub'
    elif 'dashboard' in name_lower: return 'dashboard'
    elif 'domain' in name_lower: return 'domain'
    else: return 'page'

def scan():
    print(f"Scanning {HTML_DIR}...")
    
    index = {
        'generated': datetime.now().isoformat(),
        'total': 0,
        'by_owner': {},
        'by_domain': {},
        'by_type': {},
        'dashboards': []
    }
    
    for filepath in sorted(HTML_DIR.glob('*.html')):
        filename = filepath.name
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            dna = extract_dna(content)
            stat = filepath.stat()
            
            record = {
                'filename': filename,
                'name': dna.get('name', filename.replace('.html','')) if dna else filename.replace('.html',''),
                'owner': dna.get('owner') if dna else None,
                'domain': dna.get('domain') if dna else None,
                'type': classify_file(filename),
                'created': dna.get('created') if dna else datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d'),
                'updated': dna.get('updated') if dna else datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d'),
                'tier': 'GOLD' if dna and dna.get('trinity',{}).get('c3_validated') else ('SILVER' if dna else 'BRONZE'),
                'url': f"https://consciousnessrevolution.io/{filename}",
                'has_dna': bool(dna)
            }
            
            index['dashboards'].append(record)
            index['total'] += 1
            
            # Counts
            owner = record['owner'] or 'Unknown'
            index['by_owner'][owner] = index['by_owner'].get(owner, 0) + 1
            
            domain = record['domain'] or 'Unknown'
            index['by_domain'][domain] = index['by_domain'].get(domain, 0) + 1
            
            ftype = record['type']
            index['by_type'][ftype] = index['by_type'].get(ftype, 0) + 1
            
            tier_emoji = {'GOLD': '🥇', 'SILVER': '🥈', 'BRONZE': '🥉'}.get(record['tier'], '⚪')
            print(f"  {tier_emoji} {filename}")
            
        except Exception as e:
            print(f"  ❌ {filename}: {e}")
    
    # Save
    output_file = HTML_DIR / 'DASHBOARD_INDEX.json'
    with open(output_file, 'w') as f:
        json.dump(index, f, indent=2)
    
    print(f"\n✅ Total: {index['total']}")
    print(f"📁 Saved to: {output_file}")
    print(f"\n📊 BY OWNER:")
    for owner, count in sorted(index['by_owner'].items(), key=lambda x: -x[1])[:10]:
        print(f"  {owner}: {count}")
    print(f"\n📊 BY TYPE:")
    for t, count in sorted(index['by_type'].items(), key=lambda x: -x[1]):
        print(f"  {t}: {count}")

if __name__ == '__main__':
    scan()
