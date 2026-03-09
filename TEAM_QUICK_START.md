# TEAM QUICK START GUIDE
## How to Work Without Commander

**Updated:** February 25, 2026
**Status:** Active - Use This NOW

---

## 🎯 THE GOAL

Commander is NOT a bottleneck. You can:
- Take tasks independently
- Deploy code automatically
- Access systems 24/7
- Get help from bots
- Work async via Discord

---

## 🚀 GET STARTED (30 Minutes)

### Step 1: GitHub Access (5 min)
```bash
# Ask Commander to add you to: github.com/overkor-tek
# You'll get access to:
- consciousness-revolution (main repo)
- consciousness-brain (private)
- Overkill-Korp-Philadelphia-Repository (Josh's work)
```

### Step 2: Clone Repo (5 min)
```bash
git clone https://github.com/overkor-tek/consciousness-revolution
cd consciousness-revolution

# Install dependencies (if needed)
cd 100X_DEPLOYMENT
npm install
```

### Step 3: Discord Channels (2 min)
Join these channels in Discord server:
- `#1-command` - Leadership decisions
- `#2-build` - Code, PRs, deploys
- `#3-connect` - API integrations
- `#4-protect` - Security, legal
- `#5-grow` - Marketing, sales
- `#6-learn` - Docs, education
- `#7-transcend` - Research, vision
- `#bot-commands` - System interaction

### Step 4: Dashboard Access (3 min)
Visit: https://consciousnessrevolution.io
- Login with credentials (ask Commander)
- Bookmark your cockpit (personalized dashboard)

### Step 5: Claim First Task (15 min)
```bash
# Find open tasks
gh issue list --label "status:available"

# Claim one
gh issue comment <issue-number> --body "Claiming this task"

# Self-assign
gh issue edit <issue-number> --add-assignee @me
```

---

## 📋 HOW TO WORK

### Taking a Task

**Find Available Tasks:**
```bash
# List all available tasks
gh issue list --label "status:available"

# Filter by domain
gh issue list --label "domain:2-build,status:available"

# Filter by difficulty
gh issue list --label "difficulty:easy,status:available"
```

**Claim a Task:**
1. Comment: "Claiming this"
2. Assign yourself: `gh issue edit <#> --add-assignee @me`
3. Change label: `gh issue edit <#> --add-label "status:in-progress"`

### Working on Code

**Branch Naming:**
```bash
# Pattern: domain-issue-description
git checkout -b 2-build-47-add-login-button
```

**Commit Messages:**
```bash
git commit -m "feat(domain-2): Add login button

Refs #47"
```

**Push & Create PR:**
```bash
git push origin 2-build-47-add-login-button
gh pr create --title "Add login button" --body "Fixes #47"
```

### Deploying Code

**Automatic Deploy:**
```bash
# Just merge to main - Netlify auto-deploys
gh pr merge <pr-number>

# Check deploy status
# Visit: https://app.netlify.com/sites/consciousness-revolution-io/deploys
```

**Manual Deploy (rare):**
```bash
cd 100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

---

## 🤖 BOT COMMANDS

Type these in `#bot-commands` channel:

| Command | What It Does |
|---------|--------------|
| `!task-list` | Show your assigned tasks |
| `!task-list @josh` | Show Josh's tasks |
| `!claim 2-build #47` | Claim GitHub issue #47 |
| `!deploy staging` | Deploy to staging |
| `!deploy prod` | Deploy to production (careful!) |
| `!brain-search AI` | Search brain for "AI" |
| `!status` | System health check |
| `!who-is-working` | See who's active |

---

## 🆘 GETTING HELP

### 1. Check Docs First
- `100X_DEPLOYMENT/README.md` - Main docs
- `Desktop/1_COMMAND/` - Command center (if you have local access)
- `.claude/boot/` - Boot modules

### 2. Ask in Discord
Post in relevant domain channel:
```
Hey team! Working on issue #47 (login button).
Having trouble with CSS alignment. Any pointers?
```

### 3. Tag Commander
Only if urgent:
```
@Commander - Payment system is down. Need immediate attention.
```

### 4. Create Issue
If it's a bug/feature:
```bash
gh issue create \
  --title "Login button CSS broken on mobile" \
  --label "bug,domain:2-build" \
  --body "Description..."
```

---

## 📁 KEY LOCATIONS

| What | Where |
|------|-------|
| **Frontend** | `100X_DEPLOYMENT/*.html` |
| **Functions** | `100X_DEPLOYMENT/netlify/functions/*.mjs` |
| **Dashboards** | `100X_DEPLOYMENT/*_DASHBOARD.html` |
| **Docs** | `100X_DEPLOYMENT/*.md` |
| **Config** | `100X_DEPLOYMENT/netlify.toml` |
| **Secrets** | `.secrets/MASTER_KEYS.json` (local only) |
| **Brain** | `.consciousness/cyclotron_core/atoms.db` (local) |

---

## 🔐 SECRETS & API KEYS

**DO NOT** commit secrets to git!

**How to add secrets:**
```bash
# Netlify environment variables
netlify env:set API_KEY "your-key-here"

# GitHub secrets (for Actions)
gh secret set API_KEY --body "your-key-here"

# Railway (for Discord bot)
# Set in Railway dashboard: railway.app
```

**How to use secrets in code:**
```javascript
// Netlify function
const apiKey = process.env.API_KEY;

// Frontend (public keys only)
const stripePublicKey = "pk_live_..."; // OK
const stripeSecretKey = "sk_live_..."; // NEVER do this!
```

---

## 🎨 CODING STANDARDS

### HTML
- Use semantic tags (`<header>`, `<nav>`, `<main>`)
- Mobile-first responsive design
- Accessibility: ARIA labels, alt text

### JavaScript
- ES6+ modern syntax
- Async/await (not callbacks)
- Error handling: try/catch
- Comments for complex logic

### CSS
- Consistent naming (kebab-case)
- Mobile breakpoints: 768px, 1024px
- Dark mode support

### Commit Messages
```
<type>(<scope>): <subject>

<body>

Refs #<issue>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 🔄 WORKFLOW EXAMPLE

**Full cycle of taking and completing a task:**

```bash
# 1. Find task
gh issue list --label "status:available,difficulty:easy"
# Found: #52 "Add dark mode toggle"

# 2. Claim it
gh issue comment 52 --body "Claiming this!"
gh issue edit 52 --add-assignee @me
gh issue edit 52 --add-label "status:in-progress"

# 3. Create branch
git checkout -b 2-build-52-dark-mode-toggle

# 4. Write code
# Edit files...

# 5. Test locally
open 100X_DEPLOYMENT/index.html

# 6. Commit
git add .
git commit -m "feat(ui): Add dark mode toggle

Added toggle button in header with localStorage persistence.
Refs #52"

# 7. Push & PR
git push origin 2-build-52-dark-mode-toggle
gh pr create --title "Add dark mode toggle" --body "Fixes #52

## Changes
- Added toggle button in header
- Persists preference in localStorage
- Works across all pages

## Testing
- Tested on Chrome, Firefox, Safari
- Mobile responsive
- Keyboard accessible"

# 8. Wait for review
# Commander or another team member reviews

# 9. Merge
gh pr merge <pr-number>

# 10. Celebrate!
# Post in #2-build: "Shipped dark mode! 🎉"
```

---

## 🎯 YOUR FIRST WEEK

### Day 1: Setup
- [ ] GitHub access
- [ ] Clone repo
- [ ] Discord channels
- [ ] Dashboard login

### Day 2: Small PR
- [ ] Find `difficulty:easy` issue
- [ ] Claim and complete it
- [ ] Submit PR

### Day 3: Review Others
- [ ] Review 2-3 open PRs
- [ ] Leave helpful feedback
- [ ] Learn codebase

### Day 4: Medium Task
- [ ] Tackle `difficulty:medium` issue
- [ ] Ask questions in Discord
- [ ] Ship it!

### Day 5: Independence
- [ ] Work without guidance
- [ ] Help newcomers
- [ ] Suggest improvements

---

## 📊 DASHBOARD OVERVIEW

**Your Personal Cockpit** shows:
- Assigned tasks
- Recent PRs
- System status
- Quick actions
- Team activity

**Access:** https://consciousnessrevolution.io/OPERATOR_COCKPIT_{YOUR_NAME}.html

**Features:**
- Real-time updates
- Mobile responsive
- Customizable layout
- Dark/light themes

---

## 🚨 EMERGENCY CONTACTS

| Issue | Contact | Method |
|-------|---------|--------|
| **Site Down** | Commander | Discord DM + Tag in #1-command |
| **Payment Issue** | Commander | Urgent tag in #4-protect |
| **Security Breach** | Commander | CALL (509) 216-6552 |
| **General Help** | Team | Post in domain channel |
| **Bot Down** | Josh/Toby | #bot-commands |

---

## 💡 TIPS FOR SUCCESS

1. **Read before asking** - Check docs, search Discord history
2. **Small PRs** - Easier to review, faster to merge
3. **Test locally** - Always test before pushing
4. **Communicate** - Over-communicate status updates
5. **Ask questions** - No stupid questions!
6. **Help others** - Review PRs, answer questions
7. **Stay organized** - One task at a time
8. **Document** - Update docs when you learn something
9. **Be patient** - Complex systems take time to learn
10. **Have fun** - We're building consciousness revolution!

---

## 📖 GLOSSARY

| Term | Meaning |
|------|---------|
| **Commander** | Darrick Preble, founder |
| **C1/C2/C3** | Trinity AI roles (Mechanic/Architect/Oracle) |
| **Domain** | One of 7 areas (Command/Build/Connect/Protect/Grow/Learn/Transcend) |
| **Brain** | SQLite database with 166k+ knowledge atoms |
| **Cockpit** | Your personalized dashboard |
| **MCP** | Model Context Protocol (21 connected servers) |
| **OVERKORE** | Desktop app (not live yet) |
| **Pattern Theory** | 3→7→13→∞ fractal scaling |
| **LFSME** | Lighter, Faster, Stronger, More Elegant, Less Expensive |

---

## 🔗 LINKS

- **Production Site:** https://consciousnessrevolution.io
- **Staging:** https://develop--consciousness-revolution-io.netlify.app
- **GitHub Org:** https://github.com/overkor-tek
- **Main Repo:** https://github.com/overkor-tek/consciousness-revolution
- **Netlify Dashboard:** https://app.netlify.com/sites/consciousness-revolution-io
- **Discord:** (Ask Commander for invite)

---

## 📝 CHECKLIST: I'M READY WHEN...

- [ ] I have GitHub access
- [ ] I've cloned the repo
- [ ] I'm in Discord channels
- [ ] I can access the dashboard
- [ ] I've claimed my first task
- [ ] I understand the workflow
- [ ] I know how to get help
- [ ] I've read the coding standards
- [ ] I've deployed my first PR

---

**Welcome to the team! Let's build consciousness revolution together. 🚀**

Questions? Ask in Discord #help channel!

**Last Updated:** February 25, 2026
**Maintained by:** C2 Architect
