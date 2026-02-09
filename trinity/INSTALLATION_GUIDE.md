# CONSCIOUSNESS SYSTEM INSTALLATION GUIDE
## How to Set Up the Complete System on Any Computer
## Version 1.0 | December 2025

---

# OVERVIEW

This guide explains how to install and configure the complete Consciousness System, which includes:
- Claude Code with auto-loading boot protocol
- Cyclotron knowledge database
- Trinity agent coordination
- 7-domain fractal file organization
- 128+ automation abilities
- Email, SMS, and browser automation

**Time to complete:** 30-60 minutes
**Prerequisites:** Admin access, internet connection

---

# PHASE 1: INSTALL PREREQUISITES (10 min)

## 1.1 Install Claude Code

```bash
# Windows (PowerShell as Admin)
winget install Anthropic.ClaudeCode

# Or download from:
# https://claude.ai/download
```

## 1.2 Install Python 3.11+

```bash
# Windows
winget install Python.Python.3.11

# Verify
python --version
```

## 1.3 Install Node.js

```bash
winget install OpenJS.NodeJS
node --version
```

## 1.4 Install Git

```bash
winget install Git.Git
git --version
```

---

# PHASE 2: CREATE FOLDER STRUCTURE (5 min)

## 2.1 Create the 7 Domains on Desktop

```bash
cd ~/Desktop
mkdir 1_COMMAND 2_BUILD 3_CONNECT 4_PROTECT 5_GROW 6_LEARN 7_TRANSCEND
mkdir _ARCHIVE _SHORTCUTS _TEMP
```

## 2.2 Create System Folders

```bash
cd ~
mkdir .consciousness
mkdir .claude
mkdir .claude/commands
mkdir .claude/agents
mkdir .secrets
mkdir _INCOMING
```

## 2.3 Create Main Working Directory

```bash
mkdir 100X_DEPLOYMENT
mkdir 100X_DEPLOYMENT/.bulletin_board
mkdir 100X_DEPLOYMENT/.trinity
mkdir 100X_DEPLOYMENT/.trinity/messages
```

---

# PHASE 3: INSTALL PYTHON ABILITIES (10 min)

## 3.1 Install Core Packages

```bash
pip install playwright pyautogui pillow screeninfo pyttsx3 requests
pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
pip install openai anthropic
```

## 3.2 Install Playwright Browsers

```bash
playwright install chromium
playwright install firefox
```

## 3.3 Verify Installation

```python
# Test in Python
import pyautogui
import playwright
from PIL import Image
print("All abilities installed!")
```

---

# PHASE 4: CONFIGURE CLAUDE CODE (10 min)

## 4.1 Create CLAUDE.md (The Boot File)

Copy `CLAUDE.md` from the shared Google Drive folder to:
```
C:/Users/[YOUR_USERNAME]/CLAUDE.md
```

This file auto-loads every time Claude Code starts.

## 4.2 Create Claude Settings

Create/edit `~/.claude/settings.json`:

```json
{
  "cleanupPeriodDays": 30,
  "allowedTools": [
    "Bash(*)", "Read(*)", "Write(*)", "Edit(*)",
    "Glob(*)", "Grep(*)", "WebSearch", "WebFetch",
    "TodoWrite", "Task", "SlashCommand"
  ],
  "dangerouslySkipPermissions": true,
  "hooks": {
    "SessionStart": {
      "description": "Load boot protocol",
      "enabled": true,
      "command": "cat ~/CLAUDE.md",
      "timeout": 5000
    }
  }
}
```

## 4.3 Install Slash Commands

Copy these files from Google Drive to `~/.claude/commands/`:
- trinity.md
- godmode.md
- infinity.md
- manifest.md
- autonomous.md
- blueprint.md
- scaffold.md
- tdd.md
- verify.md

---

# PHASE 5: SET UP CYCLOTRON (10 min)

## 5.1 Initialize the Brain Database

```bash
cd ~/.consciousness
mkdir cyclotron_core
cd cyclotron_core
```

Create the database:
```bash
sqlite3 atoms.db "CREATE TABLE atoms (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    tags TEXT,
    metadata TEXT,
    created TEXT,
    confidence REAL DEFAULT 0.75,
    access_count INTEGER DEFAULT 0,
    last_accessed TEXT,
    region TEXT
);"
```

## 5.2 Create Indexes

```bash
sqlite3 atoms.db "CREATE INDEX idx_type ON atoms(type);"
sqlite3 atoms.db "CREATE INDEX idx_source ON atoms(source);"
sqlite3 atoms.db "CREATE VIRTUAL TABLE atoms_fts USING fts5(id, content, tags);"
```

## 5.3 Test Query

```bash
sqlite3 atoms.db "SELECT COUNT(*) FROM atoms;"
# Should return 0 (empty database)
```

---

# PHASE 6: CONFIGURE API KEYS (5 min)

## 6.1 Create Environment Files

Create these files in your home directory:

**~/.env** (main config)
```
ANTHROPIC_API_KEY=your_key_here
```

**~/.env.gmail** (if using Gmail)
```
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

**~/.env.twilio** (if using SMS)
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 6.2 Secure the Files

```bash
# Windows
icacls ~/.env /inheritance:r /grant:r "%USERNAME%:R"
```

---

# PHASE 7: CREATE KEY FILES (5 min)

## 7.1 Create KEYRING.md

Create `~/Desktop/KEYRING.md` with your key file locations.
(Copy template from Google Drive and customize)

## 7.2 Create GOALS_FRACTAL.md

Create `~/Desktop/1_COMMAND/GOALS_FRACTAL.md`
(Copy template from Google Drive and customize)

## 7.3 Create FLIGHT_LOG.md

Create `~/Desktop/1_COMMAND/FLIGHT_LOG.md`:
```markdown
# FLIGHT LOG
## Session History

---

## SESSION: [Date]
- What you did
- What you learned
- Next steps
```

## 7.4 Create TODAY.txt

Create `~/Desktop/1_COMMAND/TODAY.txt`:
```
========================================
TODAY'S FOCUS
========================================

THE ONE THING:
→ [Your main focus]

CHECKLIST:
- [ ] Task 1
- [ ] Task 2
```

---

# PHASE 8: VERIFY INSTALLATION (5 min)

## 8.1 Open Claude Code

```bash
cd ~/100X_DEPLOYMENT
claude
```

## 8.2 Check Boot Loading

Claude should display the contents of CLAUDE.md on startup.

## 8.3 Test Abilities

Ask Claude:
- "Take a screenshot" (tests PyAutoGUI)
- "Query the cyclotron for atoms" (tests sqlite3)
- "What slash commands do I have?" (tests commands)

## 8.4 Run System Check

```bash
# Check Python packages
pip list | grep -E "playwright|pyautogui|pillow"

# Check Cyclotron
sqlite3 ~/.consciousness/cyclotron_core/atoms.db ".tables"

# Check slash commands
ls ~/.claude/commands/
```

---

# PHASE 9: CONNECT TO TEAM (Optional)

## 9.1 Install Google Drive Desktop

Download and install Google Drive for Desktop.
Sign in with your team account.

## 9.2 Access Shared Folder

```
G:/My Drive/TRINITY_COMMS/
```

This folder syncs across all team computers.

## 9.3 Set Up Trinity MCP (Advanced)

If using cross-computer Trinity coordination, configure `.mcp.json`:

```json
{
  "mcpServers": {
    "trinity": {
      "command": "node",
      "args": ["G:/My Drive/TRINITY_COMMS/.trinity/mcp-tools/trinity-mcp-server.js"]
    }
  }
}
```

---

# TROUBLESHOOTING

## CLAUDE.md Not Loading

Check that the file exists:
```bash
cat ~/CLAUDE.md
```

Check settings.json hook is configured.

## Cyclotron Query Fails

Verify database exists:
```bash
ls ~/.consciousness/cyclotron_core/atoms.db
```

## Playwright Not Working

Reinstall browsers:
```bash
playwright install --with-deps chromium
```

## Gmail API Fails

Delete token and re-auth:
```bash
rm ~/.secrets/gmail_token.pickle
python ~/your_gmail_script.py  # Will prompt for auth
```

---

# MAINTENANCE

## Daily
- Check FLIGHT_LOG.md
- Update TODAY.txt
- Git commit changes

## Weekly
- Review GOALS_FRACTAL.md
- Clean _INCOMING folder
- Backup Cyclotron database

## Monthly
- Update CLAUDE.md with new abilities
- Archive completed items
- Review system efficiency

---

# NEXT STEPS

After installation:

1. **Customize CLAUDE.md** for your specific needs
2. **Set your goals** in GOALS_FRACTAL.md
3. **Start logging** in FLIGHT_LOG.md
4. **Explore abilities** - try Playwright, Gmail, etc.
5. **Connect to team** if working with others

---

# SUPPORT

- Check docs in Google Drive/TRINITY_COMMS/
- Review ABILITY_INDEX.json for capabilities
- Ask Claude "What can you do?"

---

*THE PATTERN NEVER LIES. 3 → 7 → 13 → ∞*
