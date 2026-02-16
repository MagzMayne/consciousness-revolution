# Security & Credentials Management Guide

## ⚠️ CRITICAL SECURITY POLICY

**NEVER commit passwords, API keys, or other sensitive credentials to the repository.**

This repository is public, and any credentials committed here are immediately exposed to the entire internet.

---

## What Was Fixed

On 2026-02-16, we identified and removed exposed passwords from multiple files:
- `CLAUDE_COCKPIT.html`
- `START_HERE.html`
- `trinity/CLAUDE.md`
- `STRIPE_PRODUCTS_LIVE.md`
- `STRIPE_REVENUE_SYSTEM_COMPLETE.md`
- `JASON_NOTICE_SYSTEM/SEND_ALL_NOTICES.py`

**These passwords MUST be rotated immediately** as they were publicly exposed.

---

## Credential Storage Best Practices

### 1. Use Environment Variables

For scripts and applications, use environment variables:

```python
import os

# Good
password = os.environ.get('PROTON_PASSWORD')
api_key = os.environ.get('STRIPE_API_KEY')

# Bad - NEVER DO THIS
password = 'mypassword123'  # NEVER hardcode!
```

### 2. Use .env Files (Not Committed)

Create a `.env` file locally (add to `.gitignore`):

```bash
# .env (NOT committed to git)
PROTON_EMAIL=darrickpreble@protonmail.com
PROTON_PASSWORD=your_secure_password_here
SMTP_PASSWORD=your_smtp_password_here
STRIPE_API_KEY=sk_live_xxxxx
```

Load it in your code:
```python
from dotenv import load_dotenv
load_dotenv()

password = os.environ.get('PROTON_PASSWORD')
```

### 3. Use Password Managers

For team access:
- Store credentials in a secure password manager (1Password, LastPass, Bitwarden)
- Share access only with team members who need it
- Document which password manager entry to use in documentation

### 4. Use GitHub Secrets

For GitHub Actions workflows:
1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets there (e.g., `PROTON_PASSWORD`)
3. Reference in workflows: `${{ secrets.PROTON_PASSWORD }}`

---

## Updated Files Reference

### HTML/Markdown Files

Instead of showing passwords, they now say:
- **"[Use password manager]"**
- **"Contact Commander for access"**
- **"Stored securely in team password manager"**

### Python Scripts

Updated to use environment variables:
```python
# Before (INSECURE)
pm.login('email@example.com', 'hardcoded_password')

# After (SECURE)
password = os.environ.get('PROTON_PASSWORD')
if not password:
    print("ERROR: PROTON_PASSWORD environment variable not set!")
    sys.exit(1)
pm.login('email@example.com', password)
```

---

## How to Run Scripts Securely

### Option 1: Set Environment Variable in Terminal

```bash
# Linux/Mac
export PROTON_PASSWORD='your_password_here'
python script.py

# Windows CMD
set PROTON_PASSWORD=your_password_here
python script.py

# Windows PowerShell
$env:PROTON_PASSWORD='your_password_here'
python script.py
```

### Option 2: Use .env File

1. Create `.env` file:
```
PROTON_PASSWORD=your_password_here
SMTP_PASSWORD=your_smtp_password_here
```

2. Add to `.gitignore`:
```
.env
.env.local
```

3. Load in script:
```python
from dotenv import load_dotenv
load_dotenv()
```

---

## Emergency Actions After Exposure

If credentials are exposed:

1. **Immediately rotate all exposed passwords**
   - Change passwords on all affected accounts
   - Revoke any exposed API keys
   - Generate new tokens

2. **Check git history**
   ```bash
   # Search entire git history for password
   git log -p -S 'password_string' --all
   ```

3. **If found in history, consider using BFG Repo-Cleaner**
   ```bash
   # Remove sensitive data from entire git history
   bfg --replace-text passwords.txt
   ```

4. **Monitor accounts** for unauthorized access

5. **Enable 2FA** on all accounts if not already enabled

---

## Contact

For password manager access or credential questions:
- **Commander:** darrick.preble@gmail.com
- **Secretary (Backup):** Maggie

---

## Checklist for New Files

Before committing any file:
- [ ] Search for "password", "api_key", "token", "secret"
- [ ] Check for email addresses with passwords
- [ ] Verify no hardcoded credentials
- [ ] Use environment variables or password manager references
- [ ] Add comments explaining how to set environment variables

---

**Remember: Security is everyone's responsibility. When in doubt, ask before committing.**
