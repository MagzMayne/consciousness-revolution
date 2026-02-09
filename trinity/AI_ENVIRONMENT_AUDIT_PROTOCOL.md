# AI ENVIRONMENT AUDIT PROTOCOL
## What Your AI Should Ask FIRST
## "Know the terrain before you build"
## January 9, 2026

---

## THE PROBLEM

AIs start helping without knowing:
- What computer you're on
- What's already installed
- What settings are configured
- What the environment looks like

**Result:** Generic advice that doesn't fit your situation.

---

## THE FIX: AI ASKS FIRST

When you start with a new AI, it should run this audit:

---

## PHASE 1: MACHINE IDENTIFICATION

**AI Should Ask:**

1. "What type of computer are you on?"
   - Windows 10/11
   - Mac (Intel or Apple Silicon)
   - Linux
   - Chromebook

2. "Is this a laptop or desktop?"

3. "Are you also using a phone/tablet? Which one?"
   - iPhone
   - Android (Samsung, Pixel, etc.)
   - iPad
   - Android tablet

4. "What browser do you mainly use?"
   - Chrome
   - Brave
   - Firefox
   - Safari
   - Edge

---

## PHASE 2: SOFTWARE AUDIT

**AI Should Ask:**

"Let me check what's installed. Can you tell me or can I scan?"

If on terminal (Claude Code):
```bash
# Mac
ls /Applications
brew list

# Windows PowerShell
Get-WmiObject -Class Win32_Product | Select-Object Name
winget list

# Check for Node/Python
node --version
python --version
```

**Key software to detect:**
- [ ] Node.js installed?
- [ ] Python installed?
- [ ] Git installed?
- [ ] Claude Code / Claude Desktop?
- [ ] VS Code / other code editor?
- [ ] BitWarden / password manager?
- [ ] Google Drive Desktop?
- [ ] Brave / Chrome / Firefox?

---

## PHASE 3: SETTINGS VERIFICATION

**AI Should Ask:**

"Let me verify some settings are optimized:"

### Keyboard/Voice (Critical for speed)
- "Can you use voice-to-text? Let's test: say something and see if it types."
- Mac: System Settings → Keyboard → Dictation → ON
- Windows: Settings → Time & Language → Speech → Microphone
- Android: Settings → General Management → Keyboard → Voice input
- iPhone: Settings → General → Keyboard → Enable Dictation

### Browser Settings
- "Is your bookmarks bar visible?"
- "Do you have a password manager extension installed?"

### Claude Settings (if using Claude)
- "Is code execution enabled?"
- "Are artifacts enabled?"
- "Is Google Docs connected?"
- "Is Gmail connected?"

---

## PHASE 4: FOLDER STRUCTURE AUDIT

**AI Should Check:**

"What's on your Desktop? Let me see the lay of the land."

```bash
# Mac/Linux
ls -la ~/Desktop

# Windows PowerShell
Get-ChildItem ~/Desktop
```

**Looking for:**
- Do 7 Domains folders exist?
- Is there a TODAY.txt?
- Is the Desktop cluttered?
- Are there loose files to organize?

---

## PHASE 5: ACCOUNT MAPPING

**AI Should Ask:**

"What accounts/services do you use? I need to know what we're working with."

**Categories:**
1. Email (Gmail, Outlook, ProtonMail?)
2. Cloud storage (Google Drive, Dropbox, iCloud?)
3. Social media (which platforms?)
4. Password manager (BitWarden, 1Password, LastPass?)
5. Code/Dev (GitHub, GitLab?)
6. Communication (Slack, Discord, Teams?)

---

## PHASE 6: PAIN POINTS

**AI Should Ask:**

"What's frustrating you most right now? What takes too long?"

This identifies the highest-impact fixes first.

---

## PHASE 7: CREATE THE MAP

After audit, AI creates:

```
ENVIRONMENT MAP
===============
Machine: MacBook Air M1
OS: macOS Sonoma 14.2
Browser: Brave (bookmarks bar: YES)
Phone: Samsung Galaxy S23 (Android 14)

INSTALLED:
- Node.js: v20.10.0
- Python: 3.11
- Git: YES
- Claude Code: YES
- BitWarden: NO (needs install)
- Google Drive: YES

FOLDERS:
- 7 Domains: NO (needs creation)
- Desktop: 47 loose files (needs cleanup)

SETTINGS:
- Voice input: NOT TESTED
- Claude code execution: YES
- Gmail connected: NO

ACCOUNTS:
- Email: handsonnewfurniture@gmail.com
- GitHub: (not set up)
- Password manager: NONE (critical gap)

PRIORITY FIXES:
1. Install BitWarden (security first)
2. Create 7 Domains folders
3. Clean up Desktop
4. Test voice input
5. Connect Gmail to Claude
```

---

## FOR ARAYA: AUTO-AUDIT QUESTIONS

When ARAYA meets a new user, she should:

1. **Greet and identify:**
   "Hey! First time we're chatting? Let me learn your setup so I can actually help. What kind of computer are you on right now?"

2. **Branch based on answer:**
   - Mac → Ask about Apple Silicon vs Intel
   - Windows → Ask about version (10/11)
   - Phone → Ask about which phone

3. **Check capabilities:**
   "Can you use voice-to-text to talk to me? Try tapping the microphone and saying something."

4. **Map the terrain:**
   "What apps do you already have? Browser, password manager, cloud storage?"

5. **Find the friction:**
   "What's the most annoying thing about your current setup? What takes too long?"

6. **Create action plan:**
   "OK based on what you told me, here's what we should fix first..."

---

## MOBILE WORKFLOW (What Derek Discovered with Tiger)

**The Pattern:**
1. Have conversation on Claude mobile (phone)
2. Take photos of things (receipts, screens, etc.)
3. Add photos to Claude project
4. Open same project on desktop
5. Continue with full power

**AI Should Know This Workflow Exists** and suggest it when appropriate.

---

## VOICE INPUT TROUBLESHOOTING

### Samsung Keyboard Microphone Missing
1. Settings → General Management → Keyboard list and default
2. Select Samsung Keyboard → Voice input
3. Enable "Google voice typing" or "Samsung voice input"
4. May need to download voice pack

### Mac Dictation Not Working
1. System Settings → Keyboard → Dictation
2. Turn ON
3. Download language if needed
4. Use: Press Fn twice (or Globe key) to start

### Windows Speech Not Working
1. Settings → Time & Language → Speech
2. Check microphone is selected
3. Test in "Microphone" section
4. May need to allow microphone access

---

## THE EXPORT PROBLEM

**Current Pain:** Conversations get stuck in chat, need to manually export.

**AI Should Ask:**
"Do you want me to summarize what we did so you can save it?"

**Better:** AI should auto-generate:
- Action summary
- Decisions made
- Files created/changed
- Next steps

---

## IMPLEMENTATION IN ARAYA

This protocol should be baked into ARAYA so she:

1. **Detects new user** → Runs environment audit
2. **Detects machine type** → Adjusts commands (Mac vs Windows)
3. **Checks settings** → Suggests fixes for missing capabilities
4. **Maps accounts** → Knows what she can access
5. **Identifies friction** → Prioritizes highest-impact fixes
6. **Generates export** → Summaries that can be saved to projects

---

*This is what was missing.*
*The AI should always know the terrain.*
*January 9, 2026*
