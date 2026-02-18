# Universe Key Setup Guide

## Overview

The **Universe Key** is a unique UUID identifier (`d29fc25b-c78c-4624-8106-d2b112b06024`) used for secure system authentication and access control across the consciousness-revolution platform.

## UUID Details

- **Key Value**: `d29fc25b-c78c-4624-8106-d2b112b06024`
- **Format**: UUID v4 (Universally Unique Identifier)
- **Purpose**: System-wide authentication identifier
- **Security Level**: High - Should be treated as a secret credential

## Setup Methods

### Method 1: GitHub Secrets (Recommended for CI/CD)

For GitHub Actions workflows and automated deployments:

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Enter the following:
   - **Name**: `UNIVERSE_KEY`
   - **Secret**: `d29fc25b-c78c-4624-8106-d2b112b06024`
5. Click **"Add secret"**

**Usage in workflows:**
```yaml
env:
  UNIVERSE_KEY: ${{ secrets.UNIVERSE_KEY }}
```

### Method 2: Local Environment Variables

For local development:

**Linux/Mac:**
```bash
export UNIVERSE_KEY='d29fc25b-c78c-4624-8106-d2b112b06024'
```

**Windows CMD:**
```cmd
set UNIVERSE_KEY=d29fc25b-c78c-4624-8106-d2b112b06024
```

**Windows PowerShell:**
```powershell
$env:UNIVERSE_KEY='d29fc25b-c78c-4624-8106-d2b112b06024'
```

### Method 3: .env File (Local Development)

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. The `.env` file will already contain:
   ```
   UNIVERSE_KEY=d29fc25b-c78c-4624-8106-d2b112b06024
   ```

3. **Important**: Never commit the `.env` file to git!

## Usage in Code

### JavaScript/Node.js
```javascript
// Access the Universe Key
const universeKey = process.env.UNIVERSE_KEY;

if (!universeKey) {
  console.error('UNIVERSE_KEY not configured!');
  process.exit(1);
}

// Use in authentication
const headers = {
  'X-Universe-Key': universeKey,
  'Content-Type': 'application/json'
};
```

### Python
```python
import os

# Access the Universe Key
universe_key = os.environ.get('UNIVERSE_KEY')

if not universe_key:
    print("ERROR: UNIVERSE_KEY environment variable not set!")
    sys.exit(1)

# Use in requests
headers = {
    'X-Universe-Key': universe_key,
    'Content-Type': 'application/json'
}
```

### HTML/Browser (via meta tag or config)
```javascript
// Load from configuration
const config = {
  universeKey: window.ENV?.UNIVERSE_KEY || ''
};

// Use in API calls
fetch('/api/authenticate', {
  headers: {
    'X-Universe-Key': config.universeKey
  }
});
```

## Security Best Practices

1. **Never commit** the actual UUID to version control
2. **Use environment variables** or GitHub Secrets
3. **Rotate the key** if compromised
4. **Monitor access logs** for unauthorized usage
5. **Limit exposure** - only share with authorized team members
6. **Use HTTPS** for all API calls that include the key

## Verification

To verify the Universe Key is properly configured:

### Test in Node.js
```javascript
console.log('Universe Key configured:', !!process.env.UNIVERSE_KEY);
console.log('Key format valid:', /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(process.env.UNIVERSE_KEY));
```

### Test in Python
```python
import os
import re

universe_key = os.environ.get('UNIVERSE_KEY', '')
print(f"Universe Key configured: {bool(universe_key)}")
print(f"Key format valid: {bool(re.match(r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', universe_key))}")
```

## Troubleshooting

### Key Not Found
**Problem**: `UNIVERSE_KEY environment variable not set`

**Solutions**:
1. Check if `.env` file exists and contains the key
2. Verify environment variable is exported in current shell
3. Restart your application after setting the environment variable
4. For GitHub Actions, verify the secret is added in repository settings

### Invalid Format
**Problem**: Key doesn't match UUID v4 format

**Solution**: Ensure you're using exactly: `d29fc25b-c78c-4624-8106-d2b112b06024`

### Access Denied
**Problem**: API returns 401/403 with valid key

**Solutions**:
1. Verify the key hasn't been rotated
2. Check if your IP is whitelisted
3. Ensure HTTPS is being used
4. Check for typos in the key value

## Key Rotation

If the Universe Key needs to be rotated:

1. Generate a new UUID v4:
   ```bash
   # Linux/Mac
   uuidgen | tr '[:upper:]' '[:lower:]'
   
   # Node.js
   node -e "console.log(require('crypto').randomUUID())"
   
   # Python
   python -c "import uuid; print(str(uuid.uuid4()))"
   ```

2. Update the key in all locations:
   - `.env.example` (as template)
   - `.env.template` (as template)
   - GitHub Secrets
   - Local `.env` files
   - Documentation

3. Notify all team members of the change

4. Update any hardcoded references (should be minimal)

5. Monitor logs for failed authentication attempts with old key

## Related Documentation

- [SECURITY_CREDENTIALS_GUIDE.md](./SECURITY_CREDENTIALS_GUIDE.md) - General credential management
- [.env.example](./.env.example) - Environment variable templates
- [API_KEY_SECURITY_AUDIT.md](./API_KEY_SECURITY_AUDIT.md) - Security best practices

## Support

For questions or issues with Universe Key configuration:
- **Email**: BarbrickDesign@gmail.com
- **Repository**: https://github.com/overkor-tek/consciousness-revolution

---

**Last Updated**: February 18, 2026  
**Key Version**: 1.0  
**Key ID**: d29fc25b-c78c-4624-8106-d2b112b06024
