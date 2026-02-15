# R3-D3 Access Control - Deployment Guide

## Prerequisites

- Supabase project configured
- Netlify account with functions enabled
- Node.js 18+ installed
- Environment variables configured

## Step-by-Step Deployment

### 1. Database Setup

Run the migration script in Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Copy and paste contents of: supabase/migrations/002_r3d3_admin_access.sql
# Click "Run"
```

This creates:
- Admin columns in `user_foundations`
- `r3d3_access_log` table
- `r3d3_error_fixes` table
- Automatic admin grant for BarbrickDesign@gmail.com

### 2. Environment Variables

Ensure these are set in Netlify:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

Optional (if not already set):
```bash
SUPABASE_SERVICE_ROLE_SECRET=your_service_role_key
```

### 3. Deploy Netlify Functions

Functions are automatically deployed with your site:
- `r3d3-access-check.mjs`
- `r3d3-grant-access.mjs`
- `r3d3-log-action.mjs`

No manual steps required - Netlify handles this on git push.

### 4. Update Frontend Files

Files already updated in repository:
- ✅ `js/robot-assistant.js`
- ✅ `js/robot-assistant-loader.js`
- ✅ `login.html`
- ✅ `netlify/functions/auth-login.mjs`

### 5. Deploy Admin Panel

The admin panel is available at:
```
https://your-site.com/r3d3-admin-panel.html
```

### 6. Initial Admin Setup

**Option A: Existing User**
If BarbrickDesign@gmail.com already has an account:
1. Log out if currently logged in
2. Log back in
3. Database trigger automatically grants admin access

**Option B: New User**
If BarbrickDesign@gmail.com doesn't have an account:
1. Sign up at `/signup.html`
2. Database trigger automatically grants admin access on creation

### 7. Verify Deployment

Test the deployment:

```javascript
// Open browser console on any page with robot
console.log('Robot loaded:', typeof RobotAssistantLoader !== 'undefined');
console.log('Auth check:', RobotAssistantLoader.isAuthenticated());
```

## Post-Deployment Checklist

- [ ] Database migration completed successfully
- [ ] Environment variables set in Netlify
- [ ] Netlify functions deployed (check Functions tab)
- [ ] Admin panel accessible at r3d3-admin-panel.html
- [ ] BarbrickDesign@gmail.com can log in
- [ ] Admin panel shows authenticated status for admin
- [ ] Can grant access to test user
- [ ] Test user can enable editing after access granted
- [ ] Actions appear in audit log

## Verification Commands

### Check Database Tables

```sql
-- Verify admin columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_foundations' 
  AND column_name IN ('is_admin', 'r3d3_access_enabled');

-- Verify admin user
SELECT email, is_admin, r3d3_access_enabled 
FROM user_foundations 
WHERE LOWER(email) = 'barbrickdesign@gmail.com';

-- Check access log table
SELECT COUNT(*) FROM r3d3_access_log;
```

### Test API Endpoints

```bash
# Replace YOUR_SITE with your actual domain
SITE="your-site.netlify.app"

# Test access check (should return 401 without auth)
curl -X POST "https://$SITE/.netlify/functions/r3d3-access-check" \
  -H "Content-Type: application/json" \
  -d '{"action": "edit_page"}'

# Expected response: {"allowed": false, "reason": "Authentication required..."}
```

### Browser Console Tests

```javascript
// After logging in as admin
const session = JSON.parse(localStorage.getItem('araya_auth_session'));
console.log('Admin status:', session.user.is_admin);
console.log('R3-D3 access:', session.user.r3d3_access_enabled);

// Test robot API
console.log('Is authenticated:', RobotAssistantLoader.isAuthenticated());
console.log('User email:', RobotAssistantLoader.getUserEmail());
console.log('Is admin:', RobotAssistantLoader.isAdmin());
```

## Rollback Plan

If issues occur, rollback steps:

### 1. Disable R3-D3 Features (Quick)

Add to all pages temporarily:
```html
<script>
  if (window.RobotAssistant) {
    window.RobotAssistant.config.enabled = false;
  }
</script>
```

### 2. Revert Code Changes

```bash
git revert [commit-hash]
git push origin main
```

### 3. Database Rollback

```sql
-- Remove admin columns (last resort)
ALTER TABLE user_foundations 
DROP COLUMN IF EXISTS is_admin,
DROP COLUMN IF EXISTS r3d3_access_enabled,
DROP COLUMN IF EXISTS r3d3_access_granted_at,
DROP COLUMN IF EXISTS r3d3_access_granted_by;

-- Drop new tables
DROP TABLE IF EXISTS r3d3_access_log CASCADE;
DROP TABLE IF EXISTS r3d3_error_fixes CASCADE;
```

## Monitoring

### What to Monitor

1. **Netlify Functions Logs**
   - Check for 401/403 errors (auth issues)
   - Check for 500 errors (server issues)

2. **Supabase Logs**
   - Watch for failed queries
   - Monitor access log growth

3. **Browser Console**
   - Check for JavaScript errors
   - Monitor robot initialization

### Key Metrics

- Login success rate
- R3-D3 access grant requests
- Failed authentication attempts
- Edit action success rate

## Troubleshooting

### Issue: "Supabase configuration missing"

**Cause**: Environment variables not set
**Fix**: 
```bash
# In Netlify dashboard
# Site settings > Environment variables
# Add SUPABASE_URL and SUPABASE_SERVICE_KEY
```

### Issue: "Column 'is_admin' does not exist"

**Cause**: Migration not run
**Fix**: Run migration in Supabase SQL Editor

### Issue: "Admin panel shows not authenticated"

**Cause**: localStorage not set correctly
**Fix**: 
1. Clear browser cache
2. Log out
3. Log in again
4. Check console for errors

### Issue: Functions return 404

**Cause**: Functions not deployed
**Fix**:
```bash
# Trigger redeploy
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

## Security Notes

### Production Recommendations

1. **Token Expiration**: Set reasonable expiration (default: 1 hour)
2. **Rate Limiting**: Add rate limiting to Netlify functions
3. **IP Whitelisting**: Consider restricting admin panel by IP
4. **Audit Review**: Regularly review `r3d3_access_log`
5. **Backup**: Regular database backups including audit logs

### Access Management

- Review granted access quarterly
- Revoke access for inactive users
- Monitor for suspicious activity patterns
- Keep admin list minimal (currently just BarbrickDesign@gmail.com)

## Support Contacts

- **Database Issues**: Supabase support
- **Function Issues**: Netlify support
- **Code Issues**: GitHub repository issues
- **Security Concerns**: BarbrickDesign@gmail.com

## Next Steps

After successful deployment:

1. **Grant Access to Beta Testers**
   - Use admin panel to grant access
   - Test with 2-3 trusted users first

2. **Document Internal Procedures**
   - How to grant access
   - When to revoke access
   - How to review audit logs

3. **User Training**
   - Share R3D3_ACCESS_CONTROL_DOCS.md
   - Demo the robot features
   - Explain security requirements

4. **Monitor and Iterate**
   - Collect feedback
   - Monitor logs
   - Adjust permissions as needed

---

**Deployment Date**: [Fill in after deployment]
**Deployed By**: [Fill in]
**Version**: 1.0.0
