# 🚀 BankSky Local Setup Guide

**Complete setup instructions for running BankSky with full backend deployment**

## 🌐 Environment Detection

BankSky automatically detects whether it's running locally or on the web:

### Web Mode (GitHub Pages)
- **URL**: `https://barbrickdesign.github.io/BankSky.html`
- **Features**: Demo mode, wallet connection, basic UI
- **Limitations**: Cannot deploy backend, no system commands

### Local Mode (File Protocol)
- **URL**: `file:///C:/path/to/BankSky.html`
- **Features**: Full deployment system, backend services, system commands
- **Requirements**: Node.js installed locally

## 📥 Getting Started

### Step 1: Download BankSky.html
```bash
# Option 1: Download from GitHub
curl -o BankSky.html https://raw.githubusercontent.com/barbrickdesign/barbrickdesign.github.io/main/BankSky.html

# Option 2: Save page manually
1. Visit: https://barbrickdesign.github.io/BankSky.html
2. Right-click > Save as > BankSky.html
```

### Step 2: Install Node.js (Required)
```bash
# Visit: https://nodejs.org/
# Download: Latest LTS version
# Install with default settings

# Verify installation:
node --version
npm --version
```

### Step 3: Open Locally
```bash
# Double-click BankSky.html file
# OR drag file to browser
# OR open with: start BankSky.html
```

## 🚀 Backend Deployment

### Automatic Deployment (Recommended)
1. Open BankSky.html locally
2. Click **"🚀 Deploy Backend"** button
3. System will:
   - Detect Node.js installation
   - Create backend directory
   - Install dependencies
   - Start all services
   - Begin monitoring

### Manual Deployment
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start all services
npm run dev

# Services will start on ports:
# - Micro-tx: 3000
# - Anchor: 3001
# - Affiliate: 3002
# - Relayer: 3003
# - Command Executor: 3005
```

## 🔧 Troubleshooting

### Error: "Command executor not running"
```bash
# Start command executor manually
cd backend
node services/command-executor.js

# Then try deployment again
```

### Error: "Node.js not found"
```bash
# Install Node.js from https://nodejs.org/
# Restart browser
# Try again
```

### Error: "CORS blocked"
```bash
# This happens when running from web
# Solution: Download and open locally
```

## 📊 Service Status

When running locally, you'll see a status panel showing:
```
Backend Services Status:
🟢 micro-tx: Healthy
🟢 anchor: Healthy
🟢 affiliate: Healthy
🟢 relayer: Healthy
```

## 🎯 Testing Full System

1. **Open BankSky.html locally**
2. **Click "🚀 Deploy Backend"**
3. **Wait for "✅ Deployed!" message**
4. **Paste a wallet address**
5. **Click "Auto Launch"**
6. **Watch real backend connectivity**

## 🔄 Switching Between Modes

### Web Mode → Local Mode
```bash
1. Download BankSky.html
2. Install Node.js if needed
3. Open locally (double-click)
4. All deployment features now available
```

### Local Mode → Web Mode
```bash
1. Visit GitHub Pages URL
2. Demo features available
3. Deployment features disabled
```

---

**🎯 BankSky works in both environments but requires local mode for full backend deployment capabilities.**
