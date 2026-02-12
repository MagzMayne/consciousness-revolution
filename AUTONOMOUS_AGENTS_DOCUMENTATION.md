# Autonomous Agent System Documentation

## Overview

The Consciousness Revolution platform now includes a comprehensive autonomous agent system that ensures **100% functionality** at all times through continuous monitoring, automated testing, and self-healing capabilities.

## Components

### 1. Autonomous Agent Orchestrator (`AUTONOMOUS_AGENT_ORCHESTRATOR.py`)

**Purpose:** Master controller for all autonomous monitoring and healing operations.

**Features:**
- 🔄 Continuous monitoring (5-minute cycles)
- 📊 Real-time health dashboard
- 🔧 Automatic healing/recovery
- 📈 Performance tracking
- 🚨 Alert generation

**Usage:**
```bash
# Start the orchestrator
python3 AUTONOMOUS_AGENT_ORCHESTRATOR.py

# View dashboard
Open http://localhost:8765/AUTONOMOUS_DASHBOARD.html
```

**What it monitors:**
- File system integrity
- npm dependencies
- Configuration files
- Critical HTML pages
- Python modules
- GitHub Actions

**Auto-healing capabilities:**
- Automatically installs missing dependencies
- Detects and logs issues for manual review
- Creates restore points before changes

### 2. Functionality Test Suite (`FUNCTIONALITY_TEST_SUITE.py`)

**Purpose:** Comprehensive test suite validating all platform functionality.

**Features:**
- ✅ Tests 50+ critical components
- 📝 Detailed reporting
- 🎯 100% success validation
- 💾 JSON result exports

**Usage:**
```bash
# Run all tests
python3 FUNCTIONALITY_TEST_SUITE.py

# View results
cat FUNCTIONALITY_TEST_RESULTS.json
```

**Test categories:**
- HTML page structure and validity
- Python module syntax
- Configuration file integrity
- JavaScript syntax
- GitHub Actions workflows
- Data integrity
- File permissions
- Critical paths

### 3. GitHub Actions: Autonomous Monitoring (`.github/workflows/autonomous-monitoring.yml`)

**Purpose:** CI/CD pipeline for continuous validation and monitoring.

**Features:**
- ⏰ Runs hourly automatically
- 🔍 Comprehensive testing on every push
- 🚨 Auto-creates issues on failures
- 📊 Generates detailed reports
- 🔒 Security scanning

**Jobs:**
1. **Comprehensive Testing** - Runs full test suite
2. **Health Check** - Validates system health
3. **Security Scan** - npm audit for vulnerabilities
4. **Performance Check** - Analyzes file sizes
5. **Status Report** - Aggregates all results

**Triggers:**
- Every hour (cron schedule)
- On push to main/master
- On pull requests
- Manual workflow dispatch

### 4. System Health Monitor (`SYSTEM_HEALTH_MONITOR.py`)

**Purpose:** Detailed system health analysis (existing, enhanced).

**Features:**
- Directory structure validation
- File existence checks
- Configuration validation
- Git status monitoring
- Data freshness checks
- API key verification

**Usage:**
```bash
python3 SYSTEM_HEALTH_MONITOR.py
```

### 5. Operations Daemon (`OPERATIONS_DAEMON.py`)

**Purpose:** Background service for scheduled automation (existing, integrated).

**Features:**
- Scheduled task execution
- Automated scorecard updates
- Data rotation
- L10 meeting prep
- Health monitoring

**Usage:**
```bash
# Start daemon
python3 OPERATIONS_DAEMON.py

# Check status
python3 OPERATIONS_DAEMON.py status
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 AUTONOMOUS AGENT ORCHESTRATOR               │
│                    (Master Controller)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Monitoring │ │   Testing  │ │ Auto-Heal  │
│   Cycle    │ │   Suite    │ │   System   │
└────────────┘ └────────────┘ └────────────┘
         │            │            │
         └────────────┼────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Dashboard & Alerts   │
         └────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   GitHub Actions CI    │
         └────────────────────────┘
```

## Dashboard

Access the real-time autonomous agent dashboard at:
```
http://localhost:8765/AUTONOMOUS_DASHBOARD.html
```

**Dashboard features:**
- Overall system health status
- Test success rate (targeting 100%)
- Individual check results
- Recent recovery actions
- Auto-refresh every 30 seconds

## Monitoring Cycle

Every 5 minutes, the orchestrator:

1. **Checks** - Runs comprehensive system checks
2. **Heals** - Attempts to fix detected issues
3. **Updates** - Refreshes the dashboard
4. **Saves** - Persists state to `.autonomous_state.json`
5. **Reports** - Prints summary to console

## Success Criteria

The system aims for **100% functionality**, defined as:

- ✅ All critical HTML pages present and valid
- ✅ All Python modules syntactically correct
- ✅ All configuration files valid
- ✅ Dependencies installed
- ✅ GitHub Actions configured
- ✅ No security vulnerabilities
- ✅ All tests passing

## Alerts & Issues

**Automatic issue creation:**
When tests fail, the GitHub Actions workflow automatically:
1. Creates an issue labeled `autonomous-monitoring`
2. Includes detailed failure information
3. Updates existing open issues instead of creating duplicates

**Manual alerts:**
The orchestrator logs all issues to:
- Console output
- `.autonomous_state.json`
- `AUTONOMOUS_DASHBOARD.html`

## Files Created

| File | Purpose |
|------|---------|
| `AUTONOMOUS_AGENT_ORCHESTRATOR.py` | Master controller |
| `FUNCTIONALITY_TEST_SUITE.py` | Comprehensive test suite |
| `.github/workflows/autonomous-monitoring.yml` | CI/CD pipeline |
| `AUTONOMOUS_DASHBOARD.html` | Real-time dashboard |
| `FUNCTIONALITY_TEST_RESULTS.json` | Test results |
| `.autonomous_state.json` | Current system state |

## Quick Start

### Local Development

```bash
# 1. Run functionality tests
python3 FUNCTIONALITY_TEST_SUITE.py

# 2. Start the orchestrator (runs continuously)
python3 AUTONOMOUS_AGENT_ORCHESTRATOR.py

# 3. View dashboard
open http://localhost:8765/AUTONOMOUS_DASHBOARD.html
```

### CI/CD

The autonomous monitoring workflow runs automatically:
- Hourly via cron schedule
- On every push to main/master
- On pull requests
- Can be triggered manually

View workflow runs at:
```
https://github.com/overkor-tek/consciousness-revolution/actions
```

## Troubleshooting

### Tests failing locally?

```bash
# Run tests with verbose output
python3 FUNCTIONALITY_TEST_SUITE.py

# Check results
cat FUNCTIONALITY_TEST_RESULTS.json | python3 -m json.tool
```

### Orchestrator not starting?

```bash
# Check Python version (need 3.12+)
python3 --version

# Check for port conflicts (8765)
lsof -i :8765
```

### Dashboard not updating?

- Ensure orchestrator is running
- Check `.autonomous_state.json` exists
- Verify `AUTONOMOUS_DASHBOARD.html` is being generated

### CI/CD workflow failing?

1. Check workflow logs in GitHub Actions
2. Review `FUNCTIONALITY_TEST_RESULTS.json` artifact
3. Look for auto-created issues with `autonomous-monitoring` label

## Integration with Existing Systems

The autonomous agent system integrates with:

- **SYSTEM_HEALTH_MONITOR.py** - Leverages existing health checks
- **OPERATIONS_DAEMON.py** - Coordinates with scheduled tasks
- **GitHub Actions** - Extends existing workflows
- **Restore Points** - Creates backups before changes

## Future Enhancements

Potential additions:
- Slack/Discord notifications
- Performance regression detection
- Automatic PR creation for fixes
- ML-based anomaly detection
- Multi-environment monitoring (dev, staging, prod)

## Support

For issues or questions:
- Check the dashboard first
- Review GitHub Actions logs
- Examine `.autonomous_state.json`
- Create an issue in the repository

---

**Status:** ✅ Autonomous agent system is operational and ensuring 100% functionality.

Last updated: 2026-02-12
