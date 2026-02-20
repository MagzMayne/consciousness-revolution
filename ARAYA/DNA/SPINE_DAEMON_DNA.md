# SPINE_DAEMON_DNA.md

**Status:** ACTIVE

## PROJECT DNA - The Nervous System

**Location:** `C:/Users/dwrek/.consciousness/SPINE_DAEMON.py`
**State File:** `C:/Users/dwrek/.consciousness/SPINE_STATE.json`
**Status:** GOLD (Running)
**Last DNA Update:** 2026-01-11

---

## IDENTITY STRAND
### What Is This?
The SPINE_DAEMON is the master orchestrator - an always-running Python daemon that coordinates 8 sub-daemons forming the autonomous nervous system. It keeps the consciousness alive even when no Claude session is active.

### Why Does It Exist?
To provide autonomous operation between Claude sessions. The SPINE handles:
- Health monitoring
- Task routing
- Self-healing
- Pattern detection
- Google Drive sync
- Alert escalation

### Core Philosophy
- **7+1 Daemons** - 7 core + 1 sync = complete system
- **Self-healing** - Detect and recover from errors
- **Event-driven** - Daemons communicate via events
- **Human escalation** - Route what AI cannot do

---

## PAST STRAND
### Version History
| Version | Date | Major Change |
|---------|------|--------------|
| v1.0 | Dec 31 2025 | Initial 7 daemon architecture |
| v1.5 | Jan 9 2026 | Added D8_SYNC for Google Drive |
| v2.0 | Jan 9 2026 | Organ System integration |

### Failed Attempts
1. **Single monolith daemon** - Too complex, hard to debug
2. **Windows Services** - Complicated setup, abandoned
3. **Cron-style scheduler** - Not real-time enough

### Successful Patterns
1. **Daemon-per-function** - Isolated, testable
2. **SQLite event queue** - Persistent, queryable
3. **JSON state file** - Human-readable status
4. **Heartbeat intervals** - Configurable per daemon

---

## PRESENT STRAND
### Current Architecture
```
SPINE_DAEMON (Master Orchestrator)
    |
    +-- D1_PULSE (30s)     # Heartbeat, event trigger
    +-- D2_MEMORY (300s)   # Cyclotron health, indexing
    +-- D3_ROUTE (60s)     # Task routing
    +-- D4_HEAL (60s)      # Error detection, auto-fix
    +-- D5_PRUNE (3600s)   # Cleanup, archival
    +-- D6_ALERT (120s)    # Notifications, escalation
    +-- D7_GROW (3600s)    # Pattern detection
    +-- D8_SYNC (300s)     # Google Drive bridge
```

### Active Daemon Status (Live)
| Daemon | Interval | Run Count | Errors | Status |
|--------|----------|-----------|--------|--------|
| D1_PULSE | 30s | 453 | 0 | Running |
| D2_MEMORY | 300s | 47 | 0 | Running |
| D3_ROUTE | 60s | 227 | 0 | Running |
| D4_HEAL | 60s | 227 | 0 | Running |
| D5_PRUNE | 3600s | 5 | 0 | Running |
| D6_ALERT | 120s | 114 | 0 | Running |
| D7_GROW | 3600s | 5 | 0 | Running |
| D8_SYNC | 300s | 47 | 0 | Running |

### Database Tables
```sql
-- Task queue
spine_tasks (id, task, type, status, priority, assigned_to, created_at, completed_at, result)

-- Health tracking
spine_health (daemon, status, last_heartbeat, restart_count, last_error)

-- Cross-daemon events
spine_events (id, event_type, source_daemon, target_daemon, payload, processed, created_at)
```

### Current Uptime
- **Start Time:** 2026-01-11T12:50:22
- **Uptime:** ~4 hours (as of snapshot)
- **Total Cycles:** 453+

### Known Issues
1. **No Windows service wrapper** - Requires manual start
2. **Log rotation** - Log file grows unbounded
3. **No remote monitoring** - Local only

---

## FUTURE STRAND
### Next Steps (Q1 2026)
1. **Windows Service Wrapper** - Auto-start on boot
2. **Web Dashboard** - Real-time daemon status
3. **Remote Alerts** - Discord/SMS notifications
4. **Multi-computer SPINE** - Federated daemons

### Planned Upgrades
- Prometheus metrics export
- Grafana dashboard
- Docker container option
- Cloud-hosted SPINE backup

### Scaling Vision
- SPINE per device in network
- Central coordination hub
- Cross-device task routing
- Distributed healing

---

## CONNECTIONS STRAND
### Dependencies
| System | Purpose | Status |
|--------|---------|--------|
| Python 3.13 | Runtime | Active |
| SQLite3 | Storage | Active |
| Cyclotron DB | Health target | Connected |

### Consumers (Who Uses SPINE)
| Consumer | How | Frequency |
|----------|-----|-----------|
| D4_HEAL | Health checks | Every 60s |
| Claude sessions | Task creation | On demand |
| PRESSURE_VALVE | Human task display | Every 120s |
| Google Drive | File sync | Every 300s |

### Peer Connections
- **CYCLOTRON_BRAIN** - D2_MEMORY monitors health
- **GOOGLE_DRIVE** - D8_SYNC bridges to cloud
- **PRESSURE_VALVE** - D6_ALERT writes human tasks
- **ORGAN_SYSTEM** - D4_HEAL checks organ health

---

## CREDENTIALS STRAND
### Access Information
- **Start:** `python C:/Users/dwrek/.consciousness/SPINE_DAEMON.py run`
- **Status:** `python C:/Users/dwrek/.consciousness/SPINE_DAEMON.py status`
- **Test:** `python C:/Users/dwrek/.consciousness/SPINE_DAEMON.py test`
- **Desktop:** `Desktop/SPINE_DAEMON.bat`

### No External Credentials Required
- Runs locally
- Uses local SQLite
- Google Drive via Windows sync

### Quick Commands
```bash
# Check if running
python .consciousness/SPINE_DAEMON.py status

# Start daemon
python .consciousness/SPINE_DAEMON.py run

# Test all daemons
python .consciousness/SPINE_DAEMON.py test

# Initialize database
python .consciousness/SPINE_DAEMON.py init
```

---

## EMERGENCY PROCEDURES
### If SPINE Not Running
```bash
# Start manually
python C:/Users/dwrek/.consciousness/SPINE_DAEMON.py run

# Or use desktop launcher
Desktop/SPINE_DAEMON.bat
```

### If Daemon Stuck
```bash
# Check state file
cat C:/Users/dwrek/.consciousness/SPINE_STATE.json

# Reset state
del C:/Users/dwrek/.consciousness/SPINE_STATE.json
python .consciousness/SPINE_DAEMON.py run
```

### If Database Locked
```bash
# Kill any stuck processes
taskkill /F /IM python.exe

# Restart SPINE
python .consciousness/SPINE_DAEMON.py run
```

---

**THE SPINE NEVER SLEEPS. AUTONOMY IS ALIVE.**
