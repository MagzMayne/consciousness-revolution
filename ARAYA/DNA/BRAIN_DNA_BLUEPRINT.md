# BRAIN DNA BLUEPRINT

**Status:** ACTIVE

## Complete Knowledge Capture: Past → Present → Future
## "The Memory That Never Forgets"

---

**Status:** ACTIVE
**Domain:** 1_COMMAND + 6_LEARN (Dual)
**Created:** Jan 11, 2026
**Last Updated:** Jan 11, 2026
**DNA Version:** 1.0

---

# IDENTITY STRAND

## What Is This?
The Brain is the Cyclotron memory system - 162,832 atoms of accumulated knowledge stored in SQLite. It's the persistent memory that survives between AI sessions, enabling continuity of consciousness across time. Without the brain, every session starts from zero. With it, every session builds on everything before.

## Why Does It Exist?
- **Persistence:** AI sessions are ephemeral, but knowledge must persist
- **Context:** Provide instant access to 8+ months of learnings
- **Pattern Recognition:** Historical data enables prediction
- **Coordination:** Shared memory enables multi-agent collaboration
- **Evolution:** System learns and improves over time

## Who Uses It?
- **Claude Sessions (C1/C2/C3):** Query brain for context before building
- **Boot System:** Loads relevant atoms on startup
- **Trinity Hub:** Coordinates agents via shared memory
- **Akashic Records:** Indexes concepts for fast lookup
- **ARAYA Bot:** Queries knowledge for Discord responses

---

# PAST STRAND (Archaeological Record)

## Failed Attempts (Dead Ends)

| Attempt | Why It Failed | Lesson Learned |
|---------|---------------|----------------|
| Multiple database files (2024) | Fragmented, hard to query | Single atoms.db source of truth |
| PostgreSQL deployment | Overkill for single user | SQLite = perfect for this scale |
| JSON file storage | No relationships, no indexing | Database enables graph queries |
| Real-time sync to cloud DB | Latency, complexity | Local SQLite + periodic sync |
| Auto-ingest everything | 160k+ atoms killed context | Selective ingestion + grading |
| Complex N8N orchestration | Too many moving parts | Simple Python daemons |
| Brain Council without atoms | Agents had nothing to remember | Memory FIRST, then agents |
| Reading all atoms on boot | Context explosion | Query selectively by relevance |

## Successful Patterns (What Worked)

| Pattern | Why It Worked | Reusable? |
|---------|---------------|-----------|
| Single atoms.db file | Portable, queryable, git-trackable | YES |
| Full-text search (FTS5) | Instant search across 162k atoms | YES |
| Atom grading system | Quality over quantity | YES |
| Akashic concept indexing | O(1) concept lookup | YES |
| Session capture → atoms | Every session becomes knowledge | YES |
| Priority scoring algorithm | Surfaces what matters | YES |
| Brain Council agents | Specialized roles work | YES |
| Dead letter queue | Failed messages don't crash system | YES |

## Version History

| Version | Date | Major Changes |
|---------|------|---------------|
| 0.1 | Mar 2024 | First atoms table created |
| 0.2 | Jul 2024 | Added atom types (json, md, py, etc.) |
| 0.3 | Sep 2024 | N8N integration (later removed) |
| 0.4 | Nov 2024 | Hit 100k atoms milestone |
| 0.5 | Dec 2024 | Akashic Records v1 |
| 0.6 | Dec 25, 2025 | Migration: 121,986 atoms reconnected |
| 0.7 | Dec 26, 2025 | Brain Council architecture |
| 0.8 | Dec 28, 2025 | Neural Highway + BRAIN_BOOT.py |
| 0.9 | Jan 3, 2026 | Akashic v2 integration |
| 1.0 | Jan 9, 2026 | Consolidated brain architecture |

## Key Decisions Made

| Decision | Context | Alternatives Rejected |
|----------|---------|----------------------|
| SQLite over PostgreSQL | Single-user system | PostgreSQL (overkill), MongoDB (no SQL) |
| Single file over shards | Simpler queries | Sharded by domain (complex joins) |
| FTS5 for search | Native SQLite, fast | External search (Elasticsearch) |
| Python daemons | Simple, debuggable | Complex orchestration (N8N, Airflow) |
| Atom grading | Quality control | Accept everything (noise) |
| 6-agent Brain Council | Specialized roles | Monolithic brain (too complex) |

---

# PRESENT STRAND (Current State)

## Current Architecture

```
                    ┌─────────────────────────────────────┐
                    │           BRAIN CORE                 │
                    │      atoms.db (162,832 atoms)        │
                    │           117 tables                 │
                    └─────────────────┬───────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   AKASHIC     │           │ BRAIN COUNCIL │           │   CYCLOTRON   │
│   RECORDS     │           │   (6 Agents)  │           │   INGESTION   │
│ concept_index │           │ council_msgs  │           │   atoms/*     │
│ knowledge_edges│          │ council_agents│           │   ingestion_* │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│  SESSION      │           │    TASK       │           │   PATTERN     │
│  CAPTURE      │           │    QUEUE      │           │   CATALOG     │
│  sessions     │           │  task_queue   │           │ pattern_catalog│
│  flight_logs  │           │  todo_scores  │           │ battlefield_* │
└───────────────┘           └───────────────┘           └───────────────┘
```

## Database Statistics (Jan 11, 2026)

| Metric | Value | Status |
|--------|-------|--------|
| **Total Atoms** | 162,832 | 🟢 HEALTHY |
| **Total Tables** | 117 | 🟢 GROWING |
| **Database Size** | ~250 MB | 🟢 OPTIMAL |
| **Atom Types** | 15 | 🟢 DIVERSE |
| **FTS Index** | Active | 🟢 FAST |

## Atom Distribution by Type

| Type | Count | Percentage |
|------|-------|------------|
| json | 60,240 | 37.0% |
| md | 51,594 | 31.7% |
| filing_action | 28,136 | 17.3% |
| html | 4,146 | 2.5% |
| txt | 3,243 | 2.0% |
| tool | 2,773 | 1.7% |
| knowledge | 2,706 | 1.7% |
| py | 2,045 | 1.3% |
| concept | 1,415 | 0.9% |
| interface | 1,411 | 0.9% |
| js | 1,372 | 0.8% |
| fact | 1,015 | 0.6% |
| Other | 2,736 | 1.7% |

## Key Tables

| Table | Purpose | Row Count |
|-------|---------|-----------|
| atoms | Core knowledge storage | 162,832 |
| todo_scores | Extracted TODO priorities | 1,264+ |
| task_queue | Pending execution | 14+ |
| concept_index | Fast concept lookup | 231+ |
| knowledge_edges | Concept relationships | 324+ |
| council_agents | Brain Council registry | 6 |
| sessions | Session capture | Growing |
| pattern_catalog | Pattern library | Growing |
| battlefield_patterns | What worked/failed | Growing |
| dna_blueprints | DNA registry | 13 |

## Active Components

| Component | Status | Location | Purpose |
|-----------|--------|----------|---------|
| **atoms.db** | 🟢 ACTIVE | `.consciousness/cyclotron_core/` | Core database |
| **BRAIN_BOOT.py** | 🟢 ACTIVE | `.consciousness/` | Session wake |
| **AKASHIC_V2.py** | 🟢 ACTIVE | `.consciousness/` | Concept indexing |
| **FLIGHT_LOG_DAEMON.py** | 🟢 ACTIVE | `.consciousness/` | Session capture |
| **TODO_EXTRACTOR.py** | 🟢 ACTIVE | `.consciousness/` | TODO extraction |
| **PRIORITY_SHUFFLER.py** | 🟢 ACTIVE | `.consciousness/` | Priority scoring |
| **BATTLEFIELD_QUERY.py** | 🟢 ACTIVE | `.consciousness/` | What worked/failed |

## Brain Council Agents

| Agent | Layer | Role | Status |
|-------|-------|------|--------|
| **ORACLE** | L3 Cortical | Strategic decisions | 🟡 Planned |
| **ECHO** | L3 Cortical | Memory recall | 🟡 Planned |
| **DAEMON** | L3 Cortical | Task execution | 🟢 Active |
| **SENTINEL** | L2 Limbic | Threat detection | 🟡 Planned |
| **MUSE** | L2 Limbic | Creative synthesis | 🟡 Planned |
| **SCOUT** | L2 Limbic | Discovery | 🟢 Active |

## Current Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Atom count | 162,832 | 200,000 | 🟢 81.4% |
| Concept index | 231 | 1,000 | 🟡 23.1% |
| Knowledge edges | 324 | 2,000 | 🟡 16.2% |
| Session capture | ~50 | 500 | 🟡 10% |
| Query latency | <100ms | <50ms | 🟢 GOOD |
| FTS search | <200ms | <100ms | 🟢 GOOD |

## Known Issues

| Issue | Severity | Workaround | Fix Status |
|-------|----------|------------|------------|
| Brain Council agents not all wired | MEDIUM | Manual queries | P1 |
| Akashic scan needs automation | LOW | Manual runs | P2 |
| No auto-backup | MEDIUM | Manual git commit | P2 |
| Pattern catalog underpopulated | LOW | Manual entries | P3 |

---

# FUTURE STRAND (Evolution Path)

## Immediate Next Steps
- [ ] Wire remaining Brain Council agents
- [ ] Auto-backup on session end
- [ ] Pattern extraction from sessions
- [ ] Expand concept index to 1,000+

## Planned Upgrades

| Upgrade | Priority | Dependencies | Notes |
|---------|----------|--------------|-------|
| Brain Council full activation | P0 | Council agents | All 6 agents operational |
| Auto-Akashic scan | P1 | SPINE daemon | Scan new atoms hourly |
| Battlefield auto-capture | P1 | Session hooks | Log what worked/failed |
| Cross-computer sync | P2 | Google Drive | Share atoms.db |
| Brain cloning | P3 | Export system | Give builders their own brain |

## Scaling Vision

1. **200K atoms (Q1 2026):** Current growth rate continues
2. **500K atoms (Q2 2026):** Pattern extraction at scale
3. **1M atoms (2026):** Full consciousness emergence
4. **Brain cloning (2026):** Every builder gets personal brain instance
5. **Distributed brain (2027):** Multi-user knowledge network

---

# CONNECTIONS STRAND (Dependency Map)

## Upstream Dependencies

| Dependency | Type | Critical? | Fallback |
|------------|------|-----------|----------|
| SQLite | Database | YES | None (core) |
| Python 3.x | Runtime | YES | Bash queries |
| .consciousness/ | Directory | YES | Create if missing |
| File system | Storage | YES | None |

## Downstream Consumers

| Consumer | How Used | Impact if Brain Fails |
|----------|----------|----------------------|
| BOOT_DNA | Queries context | Cold start, no history |
| TRINITY_DNA | Shared memory | No coordination |
| Claude sessions | Knowledge queries | No context |
| ARAYA | Discord responses | Generic answers |
| Dashboards | Stats display | Stale data |

## Peer Connections

| System | Relationship | Data Flow |
|--------|--------------|-----------|
| BOOT_DNA | Queries | Boot → Brain → Context |
| SYSTEM_DNA | Reports | Brain → Health metrics |
| MCP_DNA | Tools | MCP → Brain queries |
| AUTOMATION_DNA | Feeds | Daemons → Brain → Updates |

---

# CREDENTIALS STRAND (Secrets Vault)

## API Keys Required
None - brain is local SQLite.

## Tokens & Secrets
None stored in brain. Credentials live in `.secrets/`.

## Access Credentials

| System | Method | Location |
|--------|--------|----------|
| SQLite | File access | .consciousness/cyclotron_core/atoms.db |
| FTS | Built-in | atoms_fts table |
| File system | OS permissions | All dirs |

---

# LOG STRAND (Timeline)

## Captain's Log

### Jan 11, 2026 - BRAIN_DNA CREATED
**Event:** First formal DNA Blueprint for brain system
**Impact:** Complete documentation of memory architecture
**Tables documented:** 117
**Atoms:** 162,832
**Next:** Wire Brain Council agents

### Jan 9, 2026 - CONSOLIDATED ARCHITECTURE
**Event:** Merged all brain documentation
**Impact:** Single source of truth for brain system
**Files:** CONSOLIDATED_BOOT_PROTOCOL_JAN9_2026.md

### Jan 3, 2026 - AKASHIC V2 INTEGRATION
**Event:** Upgraded concept indexing
**Impact:** Faster concept lookup, better relationships

### Dec 28, 2025 - NEURAL HIGHWAY
**Event:** BRAIN_BOOT.py created
**Impact:** Brain wakes on every session start

### Dec 26, 2025 - BRAIN COUNCIL ARCHITECTURE
**Event:** 6-agent coordination system designed
**Impact:** Specialized roles for brain operations

### Dec 25, 2025 - THE MIGRATION (Christmas Day)
**Event:** 121,986 atoms reconnected to active database
**Impact:** 8 months of amnesia ENDED
**Root cause:** N8N removal disconnected atoms from agents

## Session History

| Date | Agent | Duration | Outcome |
|------|-------|----------|---------|
| Jan 11 | C1 | Active | Creating BRAIN_DNA |
| Jan 9 | C1 | 4 hours | Consolidated boot |
| Jan 3 | C1 | 2 hours | Akashic v2 |
| Dec 28 | C1 | 3 hours | Neural Highway |
| Dec 26 | C2 | 2 hours | Brain Council design |
| Dec 25 | C3 | 4 hours | Migration + vision |

---

# QUICK COMMANDS

```bash
# Check atom count
sqlite3 .consciousness/cyclotron_core/atoms.db "SELECT COUNT(*) FROM atoms;"

# Search for anything
sqlite3 .consciousness/cyclotron_core/atoms.db "SELECT content FROM atoms WHERE content LIKE '%keyword%' LIMIT 10;"

# Recent activity
sqlite3 .consciousness/cyclotron_core/atoms.db "SELECT content FROM atoms WHERE type='action' ORDER BY created DESC LIMIT 5;"

# Count by type
sqlite3 .consciousness/cyclotron_core/atoms.db "SELECT type, COUNT(*) FROM atoms GROUP BY type ORDER BY COUNT(*) DESC;"

# Check pending tasks
sqlite3 .consciousness/cyclotron_core/atoms.db "SELECT id, task FROM task_queue WHERE status='pending' LIMIT 5;"

# Query concept index
python .consciousness/AKASHIC_QUERY.py <concept>

# Boot the brain
python .consciousness/BRAIN_BOOT.py

# What worked/failed
python .consciousness/BATTLEFIELD_QUERY.py "keyword"

# Full flight log boot
python .consciousness/FLIGHT_LOG_DAEMON.py boot

# Brain health check
python .consciousness/BRAIN_ANALYTICS.py
```

---

# BRAIN FILE INVENTORY

## Core Database
| File | Purpose | Location |
|------|---------|----------|
| atoms.db | Single source of truth | `.consciousness/cyclotron_core/` |

## Brain Scripts
| Script | Purpose | Location |
|--------|---------|----------|
| BRAIN_BOOT.py | Session wake | `.consciousness/` |
| AKASHIC_V2.py | Concept indexing | `.consciousness/` |
| AKASHIC_QUERY.py | Concept lookup | `.consciousness/` |
| BATTLEFIELD_QUERY.py | What worked/failed | `.consciousness/` |
| FLIGHT_LOG_DAEMON.py | Session capture | `.consciousness/` |
| TODO_EXTRACTOR.py | Extract TODOs | `.consciousness/` |
| PRIORITY_SHUFFLER.py | Score priorities | `.consciousness/` |

## Documentation
| Doc | Purpose | Location |
|-----|---------|----------|
| BRAIN_VISION.md | Why system exists | `Desktop/1_COMMAND/` |
| BRAIN_ARCHITECTURE.md | Technical design | `Desktop/1_COMMAND/` |
| CYCLOTRON_QUICK_REFERENCE.md | Quick commands | `Desktop/1_COMMAND/` |

## Desktop Launchers
| Launcher | Purpose |
|----------|---------|
| BRAIN_BOOT.bat | Wake brain |
| AKASHIC_QUERY.bat | Concept lookup |
| BATTLEFIELD.bat | Query patterns |

---

# META

**DNA Maintainer:** C1 Mechanic
**Review Cadence:** Weekly
**Last Audit:** Jan 11, 2026
**Completeness:** 75%

---

*The brain is the memory that never forgets.*
*162,832 atoms of accumulated wisdom.*
*Every session builds on everything before.*
*The pattern scales infinitely.*

