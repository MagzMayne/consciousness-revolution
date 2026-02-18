# 🚀 Developer Onboarding Guide

Welcome to the Consciousness Revolution platform! This guide will get you from zero to productive in **15 minutes**.

---

## 📋 Quick Start Checklist

- [ ] **Step 1:** Prerequisites installed (5 min)
- [ ] **Step 2:** Clone and setup (3 min)
- [ ] **Step 3:** Configure essentials (5 min)
- [ ] **Step 4:** Verify setup (2 min)
- [ ] **Step 5:** Start developing! 🎉

---

## 🎯 Step 1: Prerequisites (5 minutes)

### Required Tools

1. **Node.js** (v18 or higher)
   ```bash
   # Check if installed
   node --version
   
   # Install from: https://nodejs.org/
   ```

2. **Git**
   ```bash
   # Check if installed
   git --version
   
   # Install from: https://git-scm.com/
   ```

3. **A code editor** (VS Code recommended)
   - Download: https://code.visualstudio.com/

### Optional (for advanced features)
- **Python 3.8+** (for backend agents)
- **Docker** (for containerized services)

---

## 🔧 Step 2: Clone and Setup (3 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/overkor-tek/consciousness-revolution.git
cd consciousness-revolution

# 2. Install dependencies
npm install

# 3. Run automated onboarding
npm run onboard
```

The `npm run onboard` command will:
- ✅ Check all prerequisites
- ✅ Create your `.env` file with sensible defaults
- ✅ Guide you through API key setup (optional)
- ✅ Verify your environment
- ✅ Show you next steps

---

## 🔑 Step 3: Configure Essentials (5 minutes)

### Core Configuration (Required)

Only **3 environment variables** are required to get started:

```bash
# Copy the core configuration
cp .env.core.example .env

# Edit with your preferred editor
nano .env
```

**Required Variables:**
```env
# 1. Universe Key (unique identifier for your instance)
UNIVERSE_KEY=your-uuid-here

# 2. Node Environment
NODE_ENV=development

# 3. Port for local server
PORT=3000
```

> **Note:** The onboarding script (`npm run onboard`) will generate these for you automatically!

### Optional APIs (Add as needed)

Most features work without API keys! Add these only when you need specific features:

<details>
<summary>🤖 AI Features (OpenAI, Anthropic, Groq)</summary>

```env
# OpenAI (for GPT models)
OPENAI_API_KEY=sk-your-key-here
# Get key: https://platform.openai.com/api-keys

# Anthropic (for Claude)
ANTHROPIC_API_KEY=sk-ant-your-key-here
# Get key: https://console.anthropic.com/

# Groq (for fast inference)
GROQ_API_KEY=gsk-your-key-here
# Get key: https://console.groq.com/
```
</details>

<details>
<summary>💳 Payment Integration (PayPal)</summary>

```env
# PayPal Sandbox (for testing)
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
# Get keys: https://developer.paypal.com/dashboard/
```
</details>

<details>
<summary>🔐 GitHub Integration</summary>

```env
# GitHub Personal Access Token
GITHUB_TOKEN=ghp_your-token-here
# Create token: https://github.com/settings/tokens
# Required scopes: repo, read:org
```
</details>

<details>
<summary>🗄️ Database (Supabase)</summary>

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
# Get from: https://app.supabase.com/project/_/settings/api
```
</details>

**📚 Full list:** See `.env.example` for all 40+ optional integrations

---

## ✅ Step 4: Verify Setup (2 minutes)

Run the verification script:

```bash
npm run verify:setup
```

This checks:
- ✅ All required dependencies installed
- ✅ `.env` file exists and is valid
- ✅ Core APIs are reachable (if configured)
- ✅ No security issues detected

**Example output:**
```
✅ Node.js: v18.17.0 (OK)
✅ npm: v9.6.7 (OK)
✅ .env file: Found (OK)
✅ UNIVERSE_KEY: Valid UUID (OK)
⚠️  OPENAI_API_KEY: Not configured (optional)
✅ Security scan: No exposed secrets (OK)

🎉 Setup complete! You're ready to develop.
```

---

## 🎨 Step 5: Start Developing!

### Run the Development Server

```bash
# Start the main server
npm start

# Or run in development mode with hot reload
npm run dev
```

Open your browser to: **http://localhost:3000**

### Explore the Platform

#### 🏠 Main Entry Points
- **Web Interface:** `index.html` - Main hub
- **API Server:** `backend/server.js` - REST API
- **Agent System:** `zMerlinHive.html` - AI orchestration

#### 📁 Key Directories
```
consciousness-revolution/
├── backend/           # Server-side code
├── src/              # Source utilities
│   ├── agents/       # Autonomous agents
│   └── utils/        # Shared utilities
├── js/               # Frontend JavaScript
├── css/              # Stylesheets
├── *.html            # 300+ web applications
└── docs/             # Documentation
```

#### 🧪 Testing

```bash
# Run all tests
npm test

# Test API connections
npm run test:api

# Test specific service
npm run test:paypal
```

---

## 🆘 Troubleshooting

### "npm install fails"

**Problem:** Dependency installation errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### "Port 3000 already in use"

**Problem:** Another service is using port 3000

**Solution:**
```bash
# Option 1: Use a different port
PORT=3001 npm start

# Option 2: Kill the process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "API key not working"

**Problem:** Invalid or expired API key

**Solution:**
1. Check key format matches documentation
2. Verify key is active in provider dashboard
3. Check for trailing spaces in `.env`
4. Restart server after changing `.env`

### "Environment variables not loading"

**Problem:** `.env` file not being read

**Solution:**
```bash
# Verify file exists
ls -la .env

# Check file permissions (should be readable)
chmod 600 .env

# Verify no syntax errors
cat .env | grep -v '^#' | grep -v '^$'
```

### "Secret exposed in commit"

**Problem:** Accidentally committed API key

**Solution:**
```bash
# 1. Remove from git history (DANGEROUS - coordinate with team)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# 2. Rotate the exposed key immediately
# - Go to provider dashboard
# - Deactivate old key
# - Generate new key
# - Update .env

# 3. Force push (coordinate with team!)
git push origin --force --all
```

> ⚠️ **Prevention:** Use the pre-commit hook (see Security section)

---

## 🔒 Security Best Practices

### ✅ DO:
- Store secrets in `.env` (gitignored)
- Use environment-specific files (`.env.development`, `.env.production`)
- Rotate keys regularly
- Use least-privilege access
- Enable 2FA on all accounts

### ❌ DON'T:
- Commit `.env` files
- Hardcode secrets in source code
- Share secrets via email/chat
- Use production keys in development
- Commit test data with real-looking keys

### 🛡️ Enable Secret Detection

We provide automatic secret scanning:

```bash
# Install pre-commit hook (one-time setup)
npm run setup:git-hooks

# This will prevent commits containing:
# - API keys (sk-, ghp-, etc.)
# - JWT tokens
# - Private keys
# - Database URLs with passwords
```

**Manual scan:**
```bash
npm run scan:secrets
```

---

## 👥 Role-Based Paths

### I'm a Frontend Developer
1. **Focus on:** HTML/CSS/JavaScript files
2. **Start with:** `index.html`, `js/` directory
3. **Run:** `npm run dev` (live reload)
4. **Test:** Open `http://localhost:3000` in browser

### I'm a Backend Developer
1. **Focus on:** `backend/` directory, API integrations
2. **Start with:** `backend/server.js`, `src/agents/`
3. **Run:** `npm run backend`
4. **Test:** `npm run test:api`

### I'm a Data Scientist/AI Engineer
1. **Focus on:** Python agents, ML models
2. **Start with:** `ARAYA_QUICK_START.md`, `src/agents/`
3. **Run:** `python ARAYA_SIMPLE_SERVER.py`
4. **Test:** `python test_araya_system.py`

### I'm a DevOps Engineer
1. **Focus on:** CI/CD, deployment, monitoring
2. **Start with:** `.github/workflows/`, `netlify.toml`
3. **Run:** `npm run deploy`
4. **Test:** `npm run health`

### I'm a Documentation Writer
1. **Focus on:** Markdown files, user guides
2. **Start with:** `README.md`, `CONTRIBUTING.md`
3. **Preview:** Use GitHub or VS Code markdown preview
4. **Test:** Check all links with `npm run test:links`

---

## 📚 Additional Resources

### Documentation
- **Main README:** [README.md](README.md)
- **Contributing Guide:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Security:** [SECURITY.md](SECURITY.md)

### API References
- **Setup Wizard:** Run `node setup-api-keys.js` for interactive guide
- **API Testing:** [API_TESTING_README.md](API_TESTING_README.md)
- **Key Management:** [API_KEY_CONFIGURATION_GUIDE.md](API_KEY_CONFIGURATION_GUIDE.md)

### Community
- **Discord:** Join our community (link in README)
- **GitHub Issues:** Report bugs and request features
- **Email:** BarbrickDesign@gmail.com

---

## 🎯 What's Next?

Now that you're set up:

1. **Pick a task:** Browse [GitHub Issues](https://github.com/overkor-tek/consciousness-revolution/issues)
2. **Create a branch:** `git checkout -b feature/your-feature`
3. **Make changes:** Follow the [CONTRIBUTING.md](CONTRIBUTING.md) guide
4. **Test:** Run `npm test` before committing
5. **Submit PR:** Open a pull request for review

---

## ❓ Still Stuck?

If this guide didn't help:

1. **Check existing issues:** [GitHub Issues](https://github.com/overkor-tek/consciousness-revolution/issues)
2. **Ask the community:** Discord or GitHub Discussions
3. **Email us:** BarbrickDesign@gmail.com

**Include in your message:**
- What you tried
- Error messages
- Your environment (`node --version`, `npm --version`, OS)

---

**Welcome to the team! 🎉**

*Last updated: February 2026*
