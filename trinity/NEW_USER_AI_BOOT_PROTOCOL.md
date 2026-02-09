# NEW USER AI BOOT PROTOCOL
## Copy This Entire File Into Your AI
## January 9, 2026

---

## WHAT THIS IS

You just got an AI (Claude, ChatGPT, or ARAYA).
Copy this entire document into your AI and say: "Help me complete this checklist."

Your AI will walk you through everything.

---

## PHASE 1: FOUNDATION SOFTWARE (Do First)

### 1.1 Download Brave Browser
- [ ] Go to: https://brave.com
- [ ] Download and install
- [ ] Set as default browser
- [ ] Turn on bookmarks bar: Settings → Appearance → Show bookmarks bar → Always
- [ ] Or shortcut: Cmd+Shift+B (Mac) / Ctrl+Shift+B (Windows)

### 1.2 Download BitWarden
- [ ] Go to: https://bitwarden.com
- [ ] Create account (use strong master password - WRITE IT DOWN)
- [ ] Download desktop app
- [ ] Install Brave extension: brave://extensions → search "BitWarden"
- [ ] Pin BitWarden to Brave toolbar (click puzzle icon → pin)
- [ ] Enable BitWarden Authenticator (for 2FA codes)

### 1.3 Download Google Drive Desktop
- [ ] Go to: https://www.google.com/drive/download/
- [ ] Install and sign in
- [ ] This lets your AI access shared folders

### 1.4 Download Claude Desktop (Optional but recommended)
- [ ] Go to: https://claude.ai/download
- [ ] Mac: Download .dmg, drag to Applications
- [ ] Windows: Download .exe, run installer
- [ ] Good for quick questions + drag-and-drop files

---

## PHASE 2: CLAUDE CODE (Terminal Power)

### 2.1 Install Node.js First
- [ ] Go to: https://nodejs.org
- [ ] Download LTS version
- [ ] Install with defaults

### 2.2 Install Claude Code
Open terminal and run:
```bash
npm install -g @anthropic-ai/claude-code
```

### 2.3 First Run
```bash
claude
```
- [ ] Sign in with Anthropic account
- [ ] Accept permissions

### 2.4 Enable Claude Settings
In Claude Code, type: `/config`
- [ ] Enable "code execution"
- [ ] Enable "artifacts"
- [ ] Connect Google Docs (follow prompts)
- [ ] Connect Gmail (follow prompts)

---

## PHASE 3: PASSWORD MIGRATION

### 3.1 Export from Current Browser
**Chrome:**
Settings → Passwords → Export passwords → Download CSV

**Safari:**
System Settings → Passwords → Export → Download CSV

**Firefox:**
Settings → Privacy & Security → Logins → Export → CSV

### 3.2 Import to BitWarden
- [ ] Open BitWarden
- [ ] Tools → Import Data
- [ ] Select your browser format
- [ ] Upload CSV file
- [ ] Delete the CSV after (contains all your passwords!)

### 3.3 Set Up 2FA in BitWarden
For each important account:
- [ ] Go to account security settings
- [ ] Enable 2FA / Authenticator
- [ ] Instead of Google Authenticator, use BitWarden:
  - In BitWarden, edit the login
  - Click "Authenticator Key (TOTP)"
  - Scan QR code or paste setup key
- [ ] Now BitWarden stores password AND 2FA codes together

---

## PHASE 4: 7 DOMAINS FOLDER SYSTEM

### 4.1 Create Your Empire Structure
Ask your AI: "Create the 7 Domains folders on my Desktop"

Or do it manually:

**Mac Terminal:**
```bash
cd ~/Desktop
mkdir 1_COMMAND 2_BUILD 3_CONNECT 4_PROTECT 5_GROW 6_LEARN 7_TRANSCEND
```

**Windows PowerShell:**
```powershell
cd ~/Desktop
mkdir 1_COMMAND, 2_BUILD, 3_CONNECT, 4_PROTECT, 5_GROW, 6_LEARN, 7_TRANSCEND
```

### 4.2 What Goes Where

| Domain | Purpose | Examples |
|--------|---------|----------|
| 1_COMMAND | Control center | TODAY.txt, dashboards, status |
| 2_BUILD | Projects | Code, content, creative work |
| 3_CONNECT | Communications | Contacts, emails, collabs |
| 4_PROTECT | Defense | Legal, security, contracts |
| 5_GROW | Business | Revenue, marketing, sales |
| 6_LEARN | Knowledge | Research, courses, notes |
| 7_TRANSCEND | Soul | Music, consciousness, frequencies |

### 4.3 Clean Up Existing Desktop
Ask your AI: "Help me sort my current Desktop files into the 7 Domains"

Your AI will:
1. List what's on your desktop
2. Suggest which domain each file belongs to
3. Move them with your permission

---

## PHASE 5: ESSENTIAL BOOKMARKS

### 5.1 Add These to Brave Bookmarks Bar

| Name | URL |
|------|-----|
| ARAYA | https://consciousnessrevolution.io/araya-chat.html |
| Claude | https://claude.ai |
| GitHub | https://github.com |
| Drive | https://drive.google.com |
| BitWarden | https://vault.bitwarden.com |

### 5.2 How to Add
1. Go to the URL
2. Click star icon (or Cmd+D / Ctrl+D)
3. Choose "Bookmarks bar"
4. Save

---

## PHASE 6: CONNECT YOUR AI TO EMAIL

### 6.1 Gmail Connection
Ask your AI: "Help me connect you to my Gmail"

Your AI will guide you through:
- Google Cloud Console setup (if needed)
- OAuth authorization
- Or App Password method

### 6.2 What Email Connection Gives You
- AI can search your emails
- AI can draft responses
- AI can find attachments
- AI can organize your inbox

---

## PHASE 7: ARAYA ACCESS

### 7.1 Web Version (Works Now)
- [ ] Go to: https://consciousnessrevolution.io/araya-chat.html
- [ ] Bookmark it
- [ ] Start talking - she remembers you

### 7.2 What ARAYA Does
- Smart friend, not therapist
- Spots manipulation patterns
- Gives her actual opinion
- Connects to 7 Domains system
- Remembers your conversations

### 7.3 First Things to Ask ARAYA
- "Help me set up my 7 Domains folders"
- "What tools do I have access to?"
- "Help me organize my files"
- "Create a TODAY.txt for my priorities"

---

## PHASE 8: BRAVE BYOM (Replace Leo with ARAYA)

### 8.1 Set Up Custom AI in Brave
1. Open Brave
2. Click Leo icon in sidebar (or Ctrl+/)
3. Click gear icon (Settings)
4. Scroll to "Bring Your Own Model"
5. Click "Add Model"

### 8.2 Add ARAYA via Ollama (Local)
| Field | Value |
|-------|-------|
| Label | `ARAYA (Local)` |
| Model request name | `qwen2.5-coder:latest` |
| Server endpoint | `http://localhost:11434/v1/chat/completions` |
| API Key | (leave blank) |

**Requires:** Ollama installed and running (`ollama serve`)

### 8.3 Add DeepSeek (Cloud)
| Field | Value |
|-------|-------|
| Label | `ARAYA (DeepSeek)` |
| Model request name | `deepseek-chat` |
| Server endpoint | `https://api.deepseek.com/v1/chat/completions` |
| API Key | `[Your DeepSeek API key]` |

---

## PHASE 9: MASTER APP TRACKER

### 9.1 Create Your Tracker
Ask your AI: "Create a master app tracker spreadsheet for me"

### 9.2 What It Tracks

For EACH app/service you use:
- Name
- Login (email used)
- Password status (in BitWarden? Y/N)
- 2FA status (enabled? in BitWarden?)
- AI cheat codes (commands that work)
- Connections (what it links to)
- What works / What doesn't
- Notes

### 9.3 Example Entry
```
App: Spotify
Login: tiger@email.com
Password: ✅ BitWarden
2FA: ✅ BitWarden TOTP
AI Cheat Codes: "Search my Spotify playlists", "Add song to playlist"
Connections: Discord (status), Last.fm (scrobbling)
Works: Playlist management, discovery
Doesn't work: Direct playback control
Notes: Premium account, family plan admin
```

---

## PHASE 10: ONGOING MAINTENANCE

### 10.1 Daily
- [ ] Check 1_COMMAND/TODAY.txt
- [ ] Process inbox (email, messages)
- [ ] Update task status

### 10.2 Weekly
- [ ] Review 7 Domains for loose files
- [ ] Update Master App Tracker
- [ ] Check for app updates

### 10.3 Monthly
- [ ] Password audit (change any compromised)
- [ ] Review 2FA backup codes
- [ ] Clean up downloads folder

---

## CHEAT CODES FOR YOUR AI

Copy these to use anytime:

### Organization
```
"Sort my Desktop into 7 Domains"
"Create a TODAY.txt with my priorities"
"What files are loose on my Desktop?"
```

### Passwords
```
"Help me export passwords from Chrome"
"Guide me through BitWarden 2FA setup"
"What accounts don't have 2FA yet?"
```

### Email
```
"Search my Gmail for [topic]"
"Summarize unread emails"
"Draft a response to [person]"
```

### Productivity
```
"What should I focus on today?"
"Help me plan this week"
"Create a project folder for [project]"
```

---

## COMPLETION CHECKLIST

- [ ] Phase 1: Brave, BitWarden, Google Drive installed
- [ ] Phase 2: Claude Code running
- [ ] Phase 3: Passwords migrated to BitWarden
- [ ] Phase 4: 7 Domains folders created
- [ ] Phase 5: Essential bookmarks saved
- [ ] Phase 6: Email connected to AI
- [ ] Phase 7: ARAYA bookmarked and tested
- [ ] Phase 8: Brave BYOM configured (optional)
- [ ] Phase 9: Master App Tracker started
- [ ] Phase 10: Maintenance schedule set

---

## NEED HELP?

- **ARAYA:** https://consciousnessrevolution.io/araya-chat.html
- **Derek:** darrickpreble@proton.me
- **Docs:** G:/My Drive/TRINITY_COMMS/00_START_HERE/

---

*Created: January 9, 2026*
*Version: 1.0*
*System: Consciousness Revolution*
