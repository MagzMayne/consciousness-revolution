"""
REGENERATE BRAIN-EXPORT.JSON
============================
Updates brain-export.json with more atoms from Cyclotron database.

Current problem: Only 10,000 atoms in export, but 163,157 in database.
Araya only sees 6% of the brain!

Run: python REGENERATE_BRAIN_EXPORT.py
Then: netlify deploy --prod --dir=.

Created: 2026-01-13
"""

import sqlite3
import json
import os
from datetime import datetime

CYCLOTRON_DB = "C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db"
BRAIN_EXPORT = "C:/Users/dwrek/100X_DEPLOYMENT/brain-export.json"

# How many atoms to export (balance between coverage and file size)
EXPORT_LIMIT = 50000

def regenerate():
    print("="*60)
    print("REGENERATE BRAIN-EXPORT.JSON")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()

    # Connect to database
    conn = sqlite3.connect(CYCLOTRON_DB)
    cursor = conn.cursor()

    # Get total count
    cursor.execute("SELECT COUNT(*) FROM atoms")
    total = cursor.fetchone()[0]
    print(f"Total atoms in Cyclotron: {total:,}")

    # Get type distribution
    cursor.execute("SELECT type, COUNT(*) as cnt FROM atoms GROUP BY type ORDER BY cnt DESC")
    type_counts = dict(cursor.fetchall())

    # Priority types (most useful for context)
    priority_types = ['knowledge', 'pattern', 'insight', 'concept', 'fact', 'principle', 'technique', 'protocol']

    # Calculate how many of each type to include
    atoms = []

    # First, get priority types (up to 40% of export)
    priority_limit = int(EXPORT_LIMIT * 0.4)
    for ptype in priority_types:
        if ptype in type_counts:
            cursor.execute("""
                SELECT id, type, content, created
                FROM atoms
                WHERE type = ? AND content IS NOT NULL
                ORDER BY created DESC
                LIMIT ?
            """, (ptype, priority_limit // len(priority_types)))

            for row in cursor.fetchall():
                atoms.append({
                    "id": row[0],
                    "type": row[1],
                    "content": row[2][:2000] if row[2] else "",  # Truncate very long content
                    "created": row[3]
                })

    print(f"Added {len(atoms)} priority type atoms")

    # Fill remaining with most recent atoms of any type
    remaining = EXPORT_LIMIT - len(atoms)
    existing_ids = {a['id'] for a in atoms}

    cursor.execute("""
        SELECT id, type, content, created
        FROM atoms
        WHERE content IS NOT NULL
        ORDER BY created DESC
        LIMIT ?
    """, (remaining * 2,))  # Get more than needed to filter

    for row in cursor.fetchall():
        if row[0] not in existing_ids and len(atoms) < EXPORT_LIMIT:
            atoms.append({
                "id": row[0],
                "type": row[1],
                "content": row[2][:2000] if row[2] else "",
                "created": row[3]
            })

    conn.close()

    # Check current export
    old_count = 0
    if os.path.exists(BRAIN_EXPORT):
        old_count = len(json.load(open(BRAIN_EXPORT)))

    # Write new export
    with open(BRAIN_EXPORT, 'w', encoding='utf-8') as f:
        json.dump(atoms, f)

    new_size = os.path.getsize(BRAIN_EXPORT) / (1024*1024)

    # Summary
    print()
    print("RESULTS:")
    print("-"*40)
    print(f"Previous export: {old_count:,} atoms")
    print(f"New export: {len(atoms):,} atoms")
    print(f"Database total: {total:,} atoms")
    print(f"Coverage: {len(atoms)/total*100:.1f}%")
    print(f"File size: {new_size:.2f} MB")

    # Type breakdown
    print()
    print("Types in export:")
    type_dist = {}
    for a in atoms:
        t = a['type']
        type_dist[t] = type_dist.get(t, 0) + 1

    for t, c in sorted(type_dist.items(), key=lambda x: -x[1])[:10]:
        print(f"  - {t}: {c:,}")

    print()
    print("NEXT STEPS:")
    print("1. Deploy to Netlify:")
    print("   cd 100X_DEPLOYMENT && netlify deploy --prod --dir=.")
    print()
    print("2. Verify Araya can access new atoms:")
    print("   python ARAYA_CYCLOTRON_TESTER.py")

    return len(atoms)

if __name__ == "__main__":
    regenerate()
