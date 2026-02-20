#!/usr/bin/env python3
"""
DNA_GENERATOR.py - Auto-generate DNA blueprints from template
C2 Architect Design - Jan 11, 2026

Usage:
    python DNA_GENERATOR.py <name> <system> <domain>
    python DNA_GENERATOR.py ARAYA "AI Companion" 2_BUILD
    python DNA_GENERATOR.py --list  (show all DNAs)
    python DNA_GENERATOR.py --validate <name>  (check completeness)
"""

import os
import sys
import json
import sqlite3
from datetime import datetime
from pathlib import Path

# Paths
DB_PATH = Path(__file__).parent.parent / "cyclotron_core" / "atoms.db"
BLUEPRINTS_DIR = Path(__file__).parent
TEMPLATE_PATH = BLUEPRINTS_DIR / "DNA_TEMPLATE.md"

# DNA Template
DNA_TEMPLATE = '''# {NAME}_DNA BLUEPRINT
## Complete Knowledge Capture: Past -> Present -> Future
## "{TAGLINE}"

---

**Status:** BUILDING
**Domain:** {DOMAIN}
**Created:** {DATE}
**Last Updated:** {DATE}
**DNA Version:** 1.0

---

# IDENTITY STRAND

## What Is This?
{SYSTEM_DESC}

## Why Does It Exist?
[Describe the problem this solves]

## Who Uses It?
- [User 1]
- [User 2]

---

# PAST STRAND (Archaeological Record)

## Failed Attempts (Dead Ends)

| Attempt | Why It Failed | Lesson Learned |
|---------|---------------|----------------|
| [Attempt 1] | [Reason] | [Lesson] |

## Successful Patterns (What Worked)

| Pattern | Why It Worked | Reusable? |
|---------|---------------|-----------|
| [Pattern 1] | [Reason] | YES |

## Version History

| Version | Date | Major Changes |
|---------|------|---------------|
| 1.0 | {DATE} | Initial DNA creation |

## Key Decisions Made

| Decision | Context | Alternatives Rejected |
|----------|---------|----------------------|
| [Decision 1] | [Why] | [What else considered] |

---

# PRESENT STRAND (Current State)

## Current Architecture

```
{NAME} System
    |
    +-- Component 1
    +-- Component 2
    +-- Component 3
```

## Active Components

| Component | Status | Location | Purpose |
|-----------|--------|----------|---------|
| [Component 1] | ACTIVE | [path] | [purpose] |

## Current Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| [Metric 1] | [val] | [target] | [status] |

## Known Issues

| Issue | Severity | Workaround | Fix Status |
|-------|----------|------------|------------|
| [Issue 1] | [sev] | [workaround] | [status] |

---

# FUTURE STRAND (Evolution Path)

## Immediate Next Steps
- [ ] [Step 1]
- [ ] [Step 2]

## Planned Upgrades

| Upgrade | Priority | Dependencies | Notes |
|---------|----------|--------------|-------|
| [Upgrade 1] | P1 | [deps] | [notes] |

## Scaling Vision
1. [Phase 1]
2. [Phase 2]
3. [Phase 3]

---

# CONNECTIONS STRAND (Dependency Map)

## Upstream Dependencies

| Dependency | Type | Critical? | Fallback |
|------------|------|-----------|----------|
| [Dep 1] | [type] | YES/NO | [fallback] |

## Downstream Consumers

| Consumer | How Used | Impact if Down |
|----------|----------|----------------|
| [Consumer 1] | [how] | [impact] |

## Peer Connections

| System | Relationship | Data Flow |
|--------|--------------|-----------|
| [System 1] | [rel] | [flow] |

---

# CREDENTIALS STRAND (Secrets Vault)

## API Keys Required
- [Key 1]: Location in MASTER_KEYS.json

## Tokens & Secrets
- [Token 1]: Purpose

## Access Credentials

| System | Method | Location |
|--------|--------|----------|
| [System 1] | [method] | [location] |

---

# LOG STRAND (Timeline)

## Captain's Log

### {DATE} - DNA CREATED
**Event:** Initial DNA Blueprint generated
**Impact:** System now documented
**Next:** Fill in details

---

# QUICK COMMANDS

```bash
# Command 1
[command]

# Command 2
[command]
```

---

# EMERGENCY PROCEDURES

### If [System] Down
```bash
[recovery command]
```

---

# META

**DNA Maintainer:** [Agent]
**Review Cadence:** Weekly
**Last Audit:** {DATE}
**Completeness:** 30%

---

*The pattern never lies. Every system documented.*

'''

def get_db_connection():
    """Get SQLite connection."""
    return sqlite3.connect(DB_PATH)

def generate_dna(name: str, system: str, domain: str, tagline: str = None):
    """Generate a new DNA blueprint."""
    # Normalize name
    name = name.upper().replace(' ', '_').replace('-', '_')
    if not name.endswith('_DNA'):
        name_display = name
    else:
        name_display = name.replace('_DNA', '')

    # Generate tagline if not provided
    if not tagline:
        tagline = f"The {system}"

    # Fill template
    date = datetime.now().strftime('%Y-%m-%d')
    content = DNA_TEMPLATE.format(
        NAME=name_display,
        SYSTEM_DESC=system,
        DOMAIN=domain,
        DATE=date,
        TAGLINE=tagline
    )

    # Write file
    filename = f"{name_display}_DNA_BLUEPRINT.md"
    filepath = BLUEPRINTS_DIR / filename

    if filepath.exists():
        print(f"WARNING: {filepath} already exists!")
        response = input("Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Aborted.")
            return None

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Created: {filepath}")

    # Register in database
    register_dna(name_display + "_DNA", system, domain, str(filepath))

    return filepath

def register_dna(name: str, system: str, domain: str, file_path: str):
    """Register DNA in database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('''
            INSERT OR REPLACE INTO dna_blueprints
            (name, system, domain, file_path, status, completeness, last_updated)
            VALUES (?, ?, ?, ?, 'building', 0.3, datetime('now'))
        ''', (name, system, domain, file_path))
        conn.commit()
        print(f"Registered: {name} in database")
    except Exception as e:
        print(f"Database error: {e}")
    finally:
        conn.close()

def list_dnas():
    """List all DNAs."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT name, status, printf('%.0f%%', completeness*100) as pct, domain, file_path
        FROM dna_blueprints
        ORDER BY completeness DESC, name
    ''')

    rows = cursor.fetchall()
    conn.close()

    print("\n=== DNA REGISTRY ===\n")
    print(f"{'Name':<25} {'Status':<10} {'Complete':<10} {'Domain':<15}")
    print("-" * 70)
    for row in rows:
        name, status, pct, domain, path = row
        print(f"{name:<25} {status:<10} {pct:<10} {domain or 'N/A':<15}")

    print(f"\nTotal: {len(rows)} DNAs")
    return rows

def validate_dna(name: str):
    """Validate DNA completeness."""
    # Find file
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT file_path FROM dna_blueprints WHERE name = ?', (name,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        print(f"DNA not found: {name}")
        return None

    filepath = Path(row[0])
    if not filepath.exists():
        # Try relative path
        filepath = BLUEPRINTS_DIR / f"{name}_BLUEPRINT.md"

    if not filepath.exists():
        print(f"File not found: {filepath}")
        return None

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check required strands
    required_strands = [
        'IDENTITY STRAND',
        'PAST STRAND',
        'PRESENT STRAND',
        'FUTURE STRAND',
        'CONNECTIONS STRAND',
        'CREDENTIALS STRAND',
        'LOG STRAND'
    ]

    present = [s for s in required_strands if s in content]
    missing = [s for s in required_strands if s not in content]

    # Check extras
    has_quick_commands = 'QUICK COMMANDS' in content
    has_emergency = 'EMERGENCY' in content
    has_meta = 'META' in content

    completeness = len(present) / len(required_strands)

    print(f"\n=== DNA VALIDATION: {name} ===\n")
    print(f"File: {filepath}")
    print(f"Completeness: {completeness*100:.0f}%")
    print(f"\nStrands Present ({len(present)}/{len(required_strands)}):")
    for s in present:
        print(f"  [+] {s}")
    if missing:
        print(f"\nStrands Missing ({len(missing)}):")
        for s in missing:
            print(f"  [-] {s}")

    print(f"\nExtras:")
    print(f"  Quick Commands: {'Yes' if has_quick_commands else 'No'}")
    print(f"  Emergency Procedures: {'Yes' if has_emergency else 'No'}")
    print(f"  Meta Section: {'Yes' if has_meta else 'No'}")

    return {
        'completeness': completeness,
        'present': present,
        'missing': missing,
        'has_quick_commands': has_quick_commands,
        'has_emergency': has_emergency
    }

def show_connections(name: str = None):
    """Show DNA connections."""
    conn = get_db_connection()
    cursor = conn.cursor()

    if name:
        cursor.execute('''
            SELECT from_dna, to_dna, connection_type, strength
            FROM dna_connections
            WHERE from_dna = ? OR to_dna = ?
            ORDER BY strength DESC
        ''', (name, name))
    else:
        cursor.execute('''
            SELECT from_dna, to_dna, connection_type, strength
            FROM dna_connections
            ORDER BY from_dna, strength DESC
        ''')

    rows = cursor.fetchall()
    conn.close()

    print(f"\n=== DNA CONNECTIONS {'for ' + name if name else ''} ===\n")
    for row in rows:
        print(f"  {row[0]} --[{row[2]}:{row[3]:.1f}]--> {row[1]}")

    print(f"\nTotal: {len(rows)} connections")
    return rows

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return

    cmd = sys.argv[1]

    if cmd == '--list':
        list_dnas()
    elif cmd == '--validate' and len(sys.argv) >= 3:
        validate_dna(sys.argv[2])
    elif cmd == '--connections':
        name = sys.argv[2] if len(sys.argv) >= 3 else None
        show_connections(name)
    elif len(sys.argv) >= 4:
        name = sys.argv[1]
        system = sys.argv[2]
        domain = sys.argv[3]
        tagline = sys.argv[4] if len(sys.argv) >= 5 else None
        generate_dna(name, system, domain, tagline)
    else:
        print("Usage: python DNA_GENERATOR.py <name> <system> <domain> [tagline]")
        print("       python DNA_GENERATOR.py --list")
        print("       python DNA_GENERATOR.py --validate <name>")
        print("       python DNA_GENERATOR.py --connections [name]")

if __name__ == '__main__':
    main()
