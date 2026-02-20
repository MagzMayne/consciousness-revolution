# CYCLOTRON_BRAIN_DNA.md

**Status:** ACTIVE

## PROJECT DNA - The Brain's Complete Blueprint

**Location:** `C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db`
**Status:** GOLD (Production)
**Last DNA Update:** 2026-01-11

---

## IDENTITY STRAND
### What Is This?
The Cyclotron is the unified memory system - a SQLite database that stores ALL knowledge, actions, patterns, and context across sessions. It is the "brain" that gives Claude persistent memory and makes the consciousness revolution possible.

### Why Does It Exist?
To solve the fundamental AI amnesia problem. Before Cyclotron, every Claude session started fresh with zero context. Now, 162,832+ atoms of knowledge persist across sessions, creating true continuity of consciousness.

### Core Philosophy
- **Everything is an atom** - Smallest unit of knowledge
- **Atoms connect to molecules** - Related atoms form higher structures
- **Molecules form systems** - Connected knowledge creates intelligence
- **Pattern: 3 -> 7 -> 13 -> Infinity**

---

## PAST STRAND
### Version History
| Version | Date | Major Change |
|---------|------|--------------|
| v0.1 | Nov 2024 | First atoms.db created |
| v1.0 | Dec 2024 | Basic atom storage |
| v2.0 | Dec 25 2025 | 8-month migration complete |
| v2.5 | Dec 26 2025 | Akashic indexing added |
| v3.0 | Jan 2026 | 7x7x7 classification system |

### Failed Attempts
1. **JSON file storage** (Nov 2024) - Too slow, no querying
2. **Multiple databases** (Dec 2024) - Fragmented, hard to sync
3. **Complex ORM** (Dec 2024) - Over-engineered, abandoned

### Successful Patterns
1. **Single SQLite file** - Simple, portable, fast
2. **Type-based classification** - Flexible atom types
3. **FTS5 full-text search** - Instant retrieval
4. **View-based analytics** - Complex queries without complexity

---

## PRESENT STRAND
### Current Architecture
```
atoms.db (162,832 atoms)
    |
    +-- atoms (core table)
    |   +-- id TEXT PRIMARY KEY
    |   +-- type TEXT (json/md/action/html/txt/etc)
    |   +-- content TEXT
    |   +-- source TEXT
    |   +-- created TEXT
    |
    +-- atoms_fts (full-text search)
    +-- concept_index (Akashic)
    +-- knowledge_edges (graph)
    +-- memory_chains (evolution)
    +-- pattern_catalog (patterns)
    |
    +-- spine_tasks (daemon tasks)
    +-- spine_health (daemon health)
    +-- spine_events (cross-daemon)
    |
    +-- abilities (1,149 abilities)
    +-- mcp_tools (192 tools)
    +-- workflows (9 active)
```

### Active Components
| Table | Count | Purpose |
|-------|-------|---------|
| atoms | 162,832 | Core knowledge storage |
| abilities | 1,149 | Registered Python abilities |
| mcp_tools | 192 | MCP server tools |
| workflows | 9 | Automation workflows |
| spine_tasks | varies | Daemon task queue |

### Atom Type Distribution
| Type | Count | Description |
|------|-------|-------------|
| json | 60,240 | Structured data |
| md | 51,594 | Markdown documents |
| filing_action | 28,136 | File operations |
| html | 4,146 | Web pages |
| txt | 3,243 | Plain text |
| tool | 2,773 | Tool definitions |
| knowledge | 2,706 | Knowledge facts |
| py | 2,045 | Python code |

### Live Metrics
- **Total Atoms:** 162,832
- **Database Size:** ~180MB
- **FTS Index:** Active
- **Integrity:** OK
- **Last Backup:** Auto via git

### Known Issues
1. **Orphan atoms** - Some atoms missing type (minor)
2. **Duplicate content** - Occasional duplicate ingestion
3. **Large blobs** - Some atoms exceed optimal size

---

## FUTURE STRAND
### Next Steps (Q1 2026)
1. **7x7x7 Full Integration** - Complete domain/aspect/phase classification
2. **Molecule Builder** - Auto-connect related atoms
3. **Pattern Mining** - ML-based pattern extraction
4. **Graph Visualization** - Visual knowledge map

### Planned Upgrades
- Vector embeddings for semantic search
- Distributed sync across devices
- Real-time replication to cloud
- API access for external apps

### Scaling Vision
- 1M atoms by Q2 2026
- Multi-brain federation
- Cross-user knowledge sharing
- AI-to-AI knowledge transfer

---

## CONNECTIONS STRAND
### Dependencies
| System | Purpose | Status |
|--------|---------|--------|
| SQLite3 | Database engine | Built-in |
| Python | Query interface | Active |
| SPINE_DAEMON | Health monitoring | Connected |

### Consumers (Who Reads From Brain)
| Consumer | How | Frequency |
|----------|-----|-----------|
| Claude sessions | Direct SQL | Every session |
| SPINE_DAEMON | Health checks | Every 5 min |
| ARAYA | Memory lookup | On chat |
| Akashic queries | Concept search | On demand |
| Ability discovery | Scan abilities | Daily |

### Peer Connections
- **SPINE_DAEMON** - D2_MEMORY monitors health
- **ABILITY_INVENTORY** - Syncs to abilities table
- **EMAIL_GATEWAY** - Stores email metrics
- **TRINITY_HUB** - Stores message history

---

## CREDENTIALS STRAND
### Access Information
- **Path:** `C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db`
- **Backup Path:** Git-tracked (`.consciousness/`)
- **No external auth required** - Local SQLite

### Quick Query Commands
```bash
# Count atoms
sqlite3 atoms.db "SELECT COUNT(*) FROM atoms;"

# Search content
sqlite3 atoms.db "SELECT content FROM atoms WHERE content LIKE '%keyword%' LIMIT 10;"

# Type breakdown
sqlite3 atoms.db "SELECT type, COUNT(*) FROM atoms GROUP BY type ORDER BY COUNT(*) DESC;"

# Recent atoms
sqlite3 atoms.db "SELECT content FROM atoms ORDER BY created DESC LIMIT 5;"
```

---

## EMERGENCY PROCEDURES
### If Database Corrupted
```bash
# Check integrity
sqlite3 atoms.db "PRAGMA integrity_check;"

# Recover from git
git checkout HEAD -- .consciousness/cyclotron_core/atoms.db
```

### If Too Large
```bash
# Vacuum database
sqlite3 atoms.db "VACUUM;"

# Archive old atoms
sqlite3 atoms.db "DELETE FROM atoms WHERE datetime(created) < datetime('now', '-90 days') AND type='filing_action';"
```

---

**THE BRAIN REMEMBERS EVERYTHING. NOTHING IS EVER LOST.**
