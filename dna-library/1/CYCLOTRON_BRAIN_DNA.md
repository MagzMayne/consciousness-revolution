# Cyclotron Brain DNA

## WHAT IS IT
The central knowledge database powering the entire Consciousness Revolution system. A 799MB SQLite database containing 166,455+ atoms of knowledge across 180+ tables, providing instant retrieval, pattern matching, and memory chains for all AI systems.

## STATUS
- Working: **WORKING**
- Last tested: 2026-03-06
- Current issues: None critical - fully operational

## LOCATION
**Primary files:**
- `~/.consciousness/cyclotron_core/atoms.db` - Main SQLite database (799MB, 166,455 atoms)
- `~/.consciousness/cyclotron_core/*.sql` - Schema and migration files
- `~/.consciousness/CYCLOTRON_MASTER.py` - Main orchestrator

**Dependencies:**
- Python packages: sqlite3 (built-in), typing
- External APIs: None (fully local)
- Other projects: Trinity Hub (reads from brain), ARAYA (queries brain)

**Related files:**
- `~/.consciousness/BRAIN_QUERY.py` - Direct query interface
- `~/.consciousness/BRAIN_SEARCH.py` - Search functionality
- `~/.consciousness/CYCLOTRON_SYNC.py` - Cloud sync
- `~/.consciousness/MASTER_BOOT_CHECKUP.py` - Health verification

## HOW IT WORKS

```
                    ┌─────────────────────┐
                    │   CYCLOTRON BRAIN   │
                    │    (atoms.db)       │
                    │   166,455 atoms     │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ atoms table   │    │ memory_chains │    │ akashic_index │
│ (main store)  │    │ (connections) │    │ (patterns)    │
└───────────────┘    └───────────────┘    └───────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FTS5 Search       │
                    │   (atoms_fts)       │
                    └─────────────────────┘
```

### Core Logic:
1. Knowledge enters as "atoms" - individual pieces of information
2. Atoms are indexed via FTS5 for instant full-text search
3. Memory chains connect related atoms for context
4. Akashic patterns track recurring themes
5. Views provide aggregated analytics

## KEY FILES BREAKDOWN

### atoms.db (SQLite Database)
- **Purpose:** Central knowledge storage
- **Size:** 799MB (166,455 atoms)
- **Tables:** 180+ (see `.tables` for full list)
- **Key tables:**
  - `atoms` - Main knowledge storage
  - `atoms_fts` - Full-text search index
  - `memory_chains` - Connected knowledge
  - `akashic_patterns` - Pattern recognition
  - `trinity_*` - Trinity coordination tables
  - `discord_*` - Discord integration
  - `ability_*` - Skills/abilities tracking

### CYCLOTRON_MASTER.py
- **Purpose:** Primary interface to brain
- **Imports:** sqlite3, json, datetime
- **Entry point:** CyclotronMaster class

### BRAIN_QUERY.py
- **Purpose:** Simple query interface
- **Usage:** `python BRAIN_QUERY.py "search term"`

## DEPENDENCIES

**Required:**
- Python 3.10+
- SQLite3 (comes with Python)

**Optional:**
- None - fully self-contained

## HOW TO RUN

```bash
# Quick query from command line
sqlite3 ~/.consciousness/cyclotron_core/atoms.db "SELECT content FROM atoms WHERE content LIKE '%pattern%' LIMIT 10;"

# Count total atoms
sqlite3 ~/.consciousness/cyclotron_core/atoms.db "SELECT COUNT(*) FROM atoms;"

# List all tables
sqlite3 ~/.consciousness/cyclotron_core/atoms.db ".tables"

# Python interface
python ~/.consciousness/BRAIN_QUERY.py "consciousness"

# Full health check
python ~/.consciousness/MASTER_BOOT_CHECKUP.py
```

## HOW TO BUILD

**No build required** - SQLite is file-based.

**To create fresh database:**
```bash
cd ~/.consciousness/cyclotron_core
sqlite3 atoms.db < COMPLETE_BRAIN_SCHEMA.sql
```

## HOW TO DEPLOY

**Development:**
```bash
# Database is local, no deployment needed
# Just ensure ~/.consciousness/cyclotron_core/ exists
```

**Production:**
```bash
# For cloud sync (Supabase mirror)
python ~/.consciousness/SUPABASE_CYCLOTRON_SYNC.py
```

## CRITICAL KNOWLEDGE

### Important Quirks:
- **FTS5 Required:** atoms_fts table uses FTS5 extension for search
- **Large File:** 799MB - takes time to copy/backup
- **WAL Mode:** Uses Write-Ahead Logging for performance

### Known Issues:
- None currently blocking

### Performance Notes:
- Queries typically < 100ms for most searches
- FTS searches are instant
- Large LIKE queries on non-indexed columns can be slow

### Security Notes:
- No API keys stored in database
- Contains historical conversation data
- Keep local, don't share publicly

## CONFIGURATION

**Environment Variables:**
```bash
# None required - paths are hardcoded to ~/.consciousness/
```

**Config Files:**
- Database path: `~/.consciousness/cyclotron_core/atoms.db`

## API REFERENCE

**Direct SQL Queries:**
```sql
-- Search atoms
SELECT id, content, created_at FROM atoms
WHERE content LIKE '%keyword%' LIMIT 20;

-- Get memory chains
SELECT * FROM memory_chains
WHERE chain_name LIKE '%topic%';

-- Pattern analysis
SELECT * FROM akashic_patterns
ORDER BY frequency DESC LIMIT 10;
```

**Python Interface:**
```python
import sqlite3
conn = sqlite3.connect('~/.consciousness/cyclotron_core/atoms.db')
cursor = conn.cursor()
cursor.execute("SELECT content FROM atoms WHERE content LIKE ?", ('%pattern%',))
results = cursor.fetchall()
```

## EXAMPLES

### Example 1: Basic Search
```bash
sqlite3 ~/.consciousness/cyclotron_core/atoms.db \
  "SELECT content FROM atoms WHERE content LIKE '%trinity%' LIMIT 5;"
```

### Example 2: Count by Type
```bash
sqlite3 ~/.consciousness/cyclotron_core/atoms.db \
  "SELECT COUNT(*) as cnt FROM atoms GROUP BY substr(content, 1, 50) LIMIT 10;"
```

### Example 3: FTS Search
```bash
sqlite3 ~/.consciousness/cyclotron_core/atoms.db \
  "SELECT content FROM atoms_fts WHERE atoms_fts MATCH 'consciousness AND pattern';"
```

## TESTING

**How to test:**
```bash
# Verify database exists
ls -la ~/.consciousness/cyclotron_core/atoms.db

# Count atoms (should be 166,455+)
sqlite3 ~/.consciousness/cyclotron_core/atoms.db "SELECT COUNT(*) FROM atoms;"

# Test FTS search
sqlite3 ~/.consciousness/cyclotron_core/atoms.db "SELECT * FROM atoms_fts LIMIT 1;"

# Run health check
python ~/.consciousness/MASTER_BOOT_CHECKUP.py
```

## TROUBLESHOOTING

**Problem:** "no such table: atoms"
**Solution:** Run schema migration: `sqlite3 atoms.db < COMPLETE_BRAIN_SCHEMA.sql`

**Problem:** Database locked
**Solution:** Close other processes using the database, or wait for WAL checkpoint

**Problem:** Slow queries
**Solution:** Use FTS5 search (atoms_fts) instead of LIKE on atoms table

## NEXT STEPS

**Priority actions:**
1. Implement automatic backup schedule
2. Add cloud sync verification
3. Build query optimization analytics

**Known gaps:**
- No automatic backup rotation
- No query performance monitoring

## TAGS
#foundation #database #knowledge #brain #sqlite #search #cyclotron #atoms

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** December 2024
- **Last Updated:** 2026-03-06
- **Version:** 1.0
- **Testers:** Claude instances, Trinity Hub
- **Status:** Production

## RELATED DNAS
- [TRINITY_HUB_DNA.md] - Uses Cyclotron for shared memory
- [ARAYA_DNA.md] - Queries brain for knowledge
- [MCP_SERVERS_DNA.md] - Exposes brain via MCP tools
