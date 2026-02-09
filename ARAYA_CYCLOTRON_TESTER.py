"""
ARAYA CYCLOTRON CONNECTION TESTER
=================================
Tests the pipeline from user input -> Araya -> Cyclotron brain

Pipeline Map:
1. User sends message via araya-chat.html
2. Frontend calls /.netlify/functions/araya-chat (or local Ollama)
3. araya-chat.mjs:
   - Fetches memory from Supabase (araya_memory table)
   - Fetches brain context from brain-export.json (only 10k atoms!)
   - Stores messages to Supabase
   - Returns response
4. GAP: Messages go to SUPABASE not to Cyclotron DB

THE PROBLEM:
- Cyclotron has 163,156 atoms
- brain-export.json only has 10,000 atoms
- User inputs go to Supabase, NOT Cyclotron
- Araya reads from brain-export.json (static, outdated)

Created: 2026-01-13
"""

import sqlite3
import json
import os
import requests
from datetime import datetime

# Paths
CYCLOTRON_DB = "C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db"
BRAIN_EXPORT = "C:/Users/dwrek/100X_DEPLOYMENT/brain-export.json"
ARAYA_API = "https://conciousnessrevolution.io/.netlify/functions/araya-chat"

def test_cyclotron_connection():
    """Test direct connection to Cyclotron database"""
    print("\n" + "="*60)
    print("TEST 1: CYCLOTRON DATABASE CONNECTION")
    print("="*60)

    try:
        conn = sqlite3.connect(CYCLOTRON_DB)
        cursor = conn.cursor()

        # Count total atoms
        cursor.execute("SELECT COUNT(*) FROM atoms")
        total = cursor.fetchone()[0]
        print(f"[OK] Connected to Cyclotron")
        print(f"[OK] Total atoms: {total:,}")

        # Count by type
        cursor.execute("SELECT type, COUNT(*) as cnt FROM atoms GROUP BY type ORDER BY cnt DESC LIMIT 10")
        types = cursor.fetchall()
        print("\nTop 10 atom types:")
        for t, c in types:
            print(f"  - {t}: {c:,}")

        # Check user/assistant atoms (including araya_ prefixed types)
        cursor.execute("SELECT COUNT(*) FROM atoms WHERE type IN ('user', 'araya_user')")
        users = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM atoms WHERE type IN ('assistant', 'araya_assistant')")
        assistants = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM atoms WHERE type LIKE 'araya%'")
        araya_total = cursor.fetchone()[0]

        print(f"\nConversation atoms:")
        print(f"  - user: {users}")
        print(f"  - assistant: {assistants}")
        print(f"  - araya_* total: {araya_total}")

        if araya_total < 100:
            print(f"\n[!] WARNING: Only {araya_total} araya atoms - run ARAYA_SUPABASE_SYNC.py!")

        conn.close()
        return True, total

    except Exception as e:
        print(f"[FAIL] {e}")
        return False, 0

def test_brain_export():
    """Test brain-export.json file"""
    print("\n" + "="*60)
    print("TEST 2: BRAIN-EXPORT.JSON")
    print("="*60)

    try:
        with open(BRAIN_EXPORT, 'r', encoding='utf-8') as f:
            data = json.load(f)

        export_count = len(data)
        file_size = os.path.getsize(BRAIN_EXPORT) / (1024*1024)

        print(f"[OK] brain-export.json exists")
        print(f"[OK] Atoms in export: {export_count:,}")
        print(f"[OK] File size: {file_size:.2f} MB")

        # Check types in export
        types = {}
        for atom in data:
            t = atom.get('type', 'unknown')
            types[t] = types.get(t, 0) + 1

        print("\nTypes in export:")
        for t, c in sorted(types.items(), key=lambda x: -x[1])[:10]:
            print(f"  - {t}: {c}")

        return True, export_count

    except Exception as e:
        print(f"[FAIL] {e}")
        return False, 0

def test_brain_export_url():
    """Test brain-export.json URL (what Araya uses)"""
    print("\n" + "="*60)
    print("TEST 3: BRAIN-EXPORT URL (Araya's source)")
    print("="*60)

    url = "https://conciousnessrevolution.io/brain-export.json"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] URL accessible: {url}")
            print(f"[OK] Atoms available to Araya: {len(data):,}")
            return True, len(data)
        else:
            print(f"[FAIL] HTTP {response.status_code}")
            return False, 0
    except Exception as e:
        print(f"[FAIL] {e}")
        return False, 0

def test_araya_api():
    """Test Araya chat API"""
    print("\n" + "="*60)
    print("TEST 4: ARAYA CHAT API")
    print("="*60)

    try:
        response = requests.post(
            ARAYA_API,
            json={
                "message": "Test connection - what do you know about Pattern Theory?",
                "conversationHistory": [],
                "user_id": "cyclotron_tester"
            },
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            print(f"[OK] API responding")
            print(f"[OK] Mode: {data.get('mode', 'unknown')}")
            print(f"[OK] Has memory: {data.get('hasMemory', False)}")
            print(f"[OK] Brain hits: {data.get('brainHits', 0)}")
            print(f"\nResponse preview:")
            print(f"  {data.get('response', 'No response')[:200]}...")
            return True, data
        else:
            print(f"[FAIL] HTTP {response.status_code}")
            return False, None

    except Exception as e:
        print(f"[FAIL] {e}")
        return False, None

def check_gaps():
    """Identify gaps in the system"""
    print("\n" + "="*60)
    print("GAP ANALYSIS")
    print("="*60)

    gaps = []

    # Gap 1: Export vs DB
    conn = sqlite3.connect(CYCLOTRON_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM atoms")
    db_count = cursor.fetchone()[0]
    conn.close()

    with open(BRAIN_EXPORT, 'r', encoding='utf-8') as f:
        export_count = len(json.load(f))

    missing = db_count - export_count
    if missing > 0:
        gaps.append({
            "gap": "BRAIN EXPORT OUTDATED",
            "issue": f"brain-export.json has {export_count:,} atoms but Cyclotron has {db_count:,}",
            "missing": f"{missing:,} atoms not accessible to Araya",
            "fix": "Regenerate brain-export.json with more atoms (or all)"
        })

    # Gap 2: User inputs not going to Cyclotron
    conn = sqlite3.connect(CYCLOTRON_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM atoms WHERE type IN ('user', 'assistant')")
    convo_atoms = cursor.fetchone()[0]
    conn.close()

    if convo_atoms < 100:
        gaps.append({
            "gap": "USER INPUTS NOT STORED",
            "issue": f"Only {convo_atoms} conversation atoms in Cyclotron",
            "detail": "User inputs go to Supabase araya_memory, NOT Cyclotron",
            "fix": "Add pipeline: araya-chat.mjs -> sync to Cyclotron atoms table"
        })

    # Gap 3: File writer not running
    try:
        response = requests.get("http://localhost:5001/health", timeout=2)
        if response.status_code != 200:
            raise Exception("Not running")
    except:
        gaps.append({
            "gap": "FILE WRITER OFFLINE",
            "issue": "ARAYA_FILE_WRITER.py not running on port 5001",
            "detail": "Araya cannot edit website files without this server",
            "fix": "Run: python 100X_DEPLOYMENT/ARAYA_FILE_WRITER.py"
        })

    # Print gaps
    if gaps:
        print(f"\n[!] FOUND {len(gaps)} GAPS:\n")
        for i, gap in enumerate(gaps, 1):
            print(f"{i}. {gap['gap']}")
            print(f"   Issue: {gap['issue']}")
            if 'detail' in gap:
                print(f"   Detail: {gap['detail']}")
            print(f"   Fix: {gap['fix']}")
            print()
    else:
        print("[OK] No critical gaps found")

    return gaps

def generate_export_script():
    """Generate script to update brain-export.json"""
    print("\n" + "="*60)
    print("REGENERATE BRAIN-EXPORT.JSON")
    print("="*60)

    script = '''
# Run this to regenerate brain-export.json with ALL atoms
import sqlite3
import json

conn = sqlite3.connect("C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db")
cursor = conn.cursor()

# Get all atoms (or limit to most recent 50k for performance)
cursor.execute("""
    SELECT id, type, content, created
    FROM atoms
    WHERE content IS NOT NULL
    ORDER BY created DESC
    LIMIT 50000
""")

atoms = []
for row in cursor.fetchall():
    atoms.append({
        "id": row[0],
        "type": row[1],
        "content": row[2],
        "created": row[3]
    })

conn.close()

# Write export
with open("C:/Users/dwrek/100X_DEPLOYMENT/brain-export.json", 'w') as f:
    json.dump(atoms, f)

print(f"Exported {len(atoms)} atoms to brain-export.json")
'''

    print("Script to update brain-export.json:")
    print("-" * 40)
    print(script)

    return script

def main():
    print("="*60)
    print("ARAYA DNA BLUEPRINT - CYCLOTRON CONNECTION TESTER")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")

    # Run tests
    db_ok, db_count = test_cyclotron_connection()
    export_ok, export_count = test_brain_export()
    url_ok, url_count = test_brain_export_url()
    api_ok, api_data = test_araya_api()

    # Gap analysis
    gaps = check_gaps()

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Cyclotron DB: {'OK' if db_ok else 'FAIL'} ({db_count:,} atoms)")
    print(f"Brain Export: {'OK' if export_ok else 'FAIL'} ({export_count:,} atoms)")
    print(f"Export URL:   {'OK' if url_ok else 'FAIL'} ({url_count:,} atoms)")
    print(f"Araya API:    {'OK' if api_ok else 'FAIL'}")
    print(f"Gaps Found:   {len(gaps)}")

    # Next steps
    if gaps:
        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)
        print("1. Regenerate brain-export.json with more atoms")
        print("2. Add Supabase -> Cyclotron sync for user inputs")
        print("3. Start ARAYA_FILE_WRITER.py for editing capability")
        print("4. Deploy updated brain-export.json to Netlify")

    return {
        "db_ok": db_ok,
        "db_count": db_count,
        "export_count": export_count,
        "url_count": url_count,
        "api_ok": api_ok,
        "gaps": len(gaps)
    }

if __name__ == "__main__":
    main()
