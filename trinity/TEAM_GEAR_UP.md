# TEAM GEAR UP - Live Onboarding Guide
## Learned from Tiger's Onboarding - Jan 9, 2026

---

## PHASE 1: FOUNDATIONS (Do First)

### 1.1 Node.js (Required for Claude Code)
- **Mac:** https://nodejs.org/en/download
- **Windows:** https://nodejs.org/en/download
- Verify: `node --version` and `npm --version`

### 1.2 Claude Code CLI
```bash
npm install -g @anthropic-ai/claude-code
claude
```

### 1.3 Brave Browser
- https://brave.com/download
- Privacy-focused, works with all our tools

### 1.4 BitWarden (Password Manager)
- https://bitwarden.com/download
- Will get org invite from Commander

---

## PHASE 2: VOICE + SCREENSHOTS (Game Changers)

### 2.1 Voice Dictation
**Mac:**
- System Preferences → Keyboard → Dictation → ON
- Press `Fn Fn` (double-tap Function key) to activate

**Windows:**
- Settings → Time & Language → Speech → ON
- Press `Win + H` to activate

### 2.2 Screenshots
**Mac:**
- `Cmd + Shift + 4` = Select area
- `Cmd + Shift + 3` = Full screen
- Saves to Desktop by default

**Windows:**
- `Win + Shift + S` = Snip tool
- `PrtScn` = Full screen

### 2.3 Side-by-Side Workflow
- Claude window on LEFT (half screen)
- Browser on RIGHT (half screen)
- Drag screenshots directly into Claude
- Use voice to dictate instead of typing

---

## PHASE 3: ACCESS (Get Connected)

### 3.1 GitHub Access
- Create account: https://github.com
- Share username with Commander
- Accept repo invitations at: https://github.com/notifications

**Repos you'll be added to:**
- `overkor-tek/consciousness-revolution`
- `overkor-tek/100x-platform`

### 3.2 TRINITY_COMMS (Google Drive)
- Commander shares folder to your email
- This is the team sync folder
- Check `00_START_HERE/` first

### 3.3 Clone Repos (after GitHub access)
```bash
mkdir -p ~/consciousness
cd ~/consciousness
git clone https://github.com/overkor-tek/consciousness-revolution.git
git clone https://github.com/overkor-tek/100x-platform.git
```

---

## PHASE 4: 7 DOMAINS (Your Command Center)

### 4.1 Create the Structure
**Mac/Linux:**
```bash
mkdir -p ~/Desktop/1_COMMAND
mkdir -p ~/Desktop/2_BUILD
mkdir -p ~/Desktop/3_CONNECT
mkdir -p ~/Desktop/4_PROTECT
mkdir -p ~/Desktop/5_GROW
mkdir -p ~/Desktop/6_LEARN
mkdir -p ~/Desktop/7_TRANSCEND
```

**Windows:**
```cmd
mkdir %USERPROFILE%\Desktop\1_COMMAND
mkdir %USERPROFILE%\Desktop\2_BUILD
mkdir %USERPROFILE%\Desktop\3_CONNECT
mkdir %USERPROFILE%\Desktop\4_PROTECT
mkdir %USERPROFILE%\Desktop\5_GROW
mkdir %USERPROFILE%\Desktop\6_LEARN
mkdir %USERPROFILE%\Desktop\7_TRANSCEND
```

### 4.2 What Goes Where
| Domain | Purpose | Examples |
|--------|---------|----------|
| 1_COMMAND | Control center | TODAY.txt, dashboards, status |
| 2_BUILD | Projects & code | repos, builds, dev work |
| 3_CONNECT | Communications | contacts, messages, outreach |
| 4_PROTECT | Security & legal | passwords, legal docs, defense |
| 5_GROW | Business & revenue | sales, marketing, growth |
| 6_LEARN | Research & docs | learning, notes, research |
| 7_TRANSCEND | Consciousness | frequencies, meditation, vision |

### 4.3 Starter Files
```bash
echo "My priorities for today:" > ~/Desktop/1_COMMAND/TODAY.txt
echo "# FLIGHT LOG" > ~/Desktop/1_COMMAND/FLIGHT_LOG.md
```

---

## PHASE 5: BOOT PACKAGE (Claude Memory)

### 5.1 Get Your Boot Package
- Commander provides personalized `.claude/` folder
- Contains: settings.json, commands/bootup.md, commands/bootdown.md

### 5.2 Install It
**Mac:**
```bash
cp -r /path/to/boot-package/.claude ~/
cp /path/to/boot-package/CLAUDE.md ~/
```

**Windows:**
```cmd
xcopy /E /I C:\path\to\boot-package\.claude %USERPROFILE%\.claude
copy C:\path\to\boot-package\CLAUDE.md %USERPROFILE%\CLAUDE.md
```

### 5.3 Use Slash Commands
- `/bootup` - Start of session (loads context)
- `/bootdown` - End of session (saves context)

---

## PHASE 6: DAILY WORKFLOW

### Morning Boot
1. Open Claude Code: `claude`
2. Run `/bootup`
3. Check `1_COMMAND/TODAY.txt`
4. Start working

### During Session
- Voice dictate instead of typing
- Screenshot anything useful → drag to Claude
- Keep Claude + browser side-by-side

### End of Session
1. Run `/bootdown`
2. Update `FLIGHT_LOG.md` with what you did
3. Commit work: `git add . && git commit -m "description" && git push`

---

## QUICK REFERENCE

| Need | Command/Action |
|------|----------------|
| Start Claude | `claude` |
| Voice on Mac | `Fn Fn` |
| Voice on Win | `Win + H` |
| Screenshot Mac | `Cmd + Shift + 4` |
| Screenshot Win | `Win + Shift + S` |
| Start session | `/bootup` |
| End session | `/bootdown` |
| Commit work | `git add . && git commit -m "msg" && git push` |

---

## CONTACT

- **Commander:** darrickpreble@proton.me
- **Issues:** github.com/overkor-tek/consciousness-revolution/issues
- **Team Folder:** Google Drive → TRINITY_COMMS

---

## LESSONS LEARNED (Living Document)

### From Tiger's Onboarding (Jan 9, 2026):
- Node.js comes BEFORE VS Code (needed for Claude Code CLI)
- Voice dictation is a game-changer - teach early
- Screenshot workflow prevents getting stuck
- Side-by-side Claude + browser = essential pattern
- TRINITY_COMMS access for team sync

---

*This doc lives in 1_COMMAND and updates as we learn.*
*Pattern: 3 → 7 → 13 → ∞*
