# R3-D3 Access Control & Security System

## Overview

The R3-D3 Robot Assistant now includes a comprehensive authentication and authorization system that ensures only authorized users can use the autonomous editing features. This document describes the security implementation and usage.

## Security Features

### 1. Role-Based Access Control

- **Admin Users**: Full control over R3-D3 features and can grant/revoke access to other users
- **Authorized Users**: Can use R3-D3 editing features after admin grants access
- **Regular Users**: Cannot use editing features but can request error fixes
- **Anonymous Users**: Cannot use any R3-D3 features

### 2. Authentication Requirements

All R3-D3 features require:
- Valid Supabase authentication session
- Active user account in `user_foundations` table
- Proper permission flags set in database

### 3. Initial Admin Setup

The system automatically grants admin privileges to:
- **BarbrickDesign@gmail.com** (hardcoded in database trigger)

When this email registers or logs in, they automatically receive:
- `is_admin = true`
- `r3d3_access_enabled = true`

## Database Schema

### New Columns in `user_foundations`

```sql
-- Admin flag - grants full system access
is_admin BOOLEAN DEFAULT FALSE

-- R3-D3 specific access
r3d3_access_enabled BOOLEAN DEFAULT FALSE
r3d3_access_granted_at TIMESTAMPTZ
r3d3_access_granted_by UUID REFERENCES user_foundations(id)
```

### New Tables

#### `r3d3_access_log`
Audit log for all R3-D3 actions:
- Action type (enable_editing, disable_editing, edit_page, fix_error)
- Target file
- Success/failure status
- User information
- Timestamp

#### `r3d3_error_fixes`
Tracks error fix requests from non-admin users:
- Error details
- Fix description
- Review status
- Approval workflow

## API Endpoints

### 1. Check Access (`/.netlify/functions/r3d3-access-check`)

**Purpose**: Verify if user has permission for specific R3-D3 action

**Request**:
```json
POST /.netlify/functions/r3d3-access-check
Authorization: Bearer {access_token}

{
  "action": "edit_page" | "enable_editing" | "fix_error"
}
```

**Response**:
```json
{
  "allowed": true,
  "reason": "Access granted",
  "user": {
    "email": "user@example.com",
    "is_admin": true,
    "r3d3_access_enabled": true
  }
}
```

### 2. Grant Access (`/.netlify/functions/r3d3-grant-access`)

**Purpose**: Admin-only endpoint to grant/revoke R3-D3 access

**Request**:
```json
POST /.netlify/functions/r3d3-grant-access
Authorization: Bearer {admin_access_token}

{
  "target_email": "user@example.com",
  "grant_access": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "R3-D3 access granted to user@example.com",
  "user": {
    "email": "user@example.com",
    "r3d3_access_enabled": true
  }
}
```

### 3. Log Action (`/.netlify/functions/r3d3-log-action`)

**Purpose**: Record R3-D3 actions for audit trail

**Request**:
```json
POST /.netlify/functions/r3d3-log-action
Authorization: Bearer {access_token}

{
  "action": "edit_page",
  "target_file": "index.html",
  "change_description": "Updated header",
  "success": true,
  "metadata": {}
}
```

## Client-Side Integration

### Authentication Flow

1. User logs in via `login.html`
2. Auth session stored in localStorage as `araya_auth_session`
3. R3-D3 Robot automatically checks authentication on page load
4. User can enable editing if they have access

### Updated Robot API

```javascript
// Check if user is authenticated
RobotAssistantLoader.isAuthenticated()
// Returns: boolean

// Get user email
RobotAssistantLoader.getUserEmail()
// Returns: string | null

// Check if user is admin
RobotAssistantLoader.isAdmin()
// Returns: boolean

// Enable editing (now requires auth)
await RobotAssistantLoader.enableAutonomousEditing(true)
// Returns: { success: boolean, message?: string, error?: string }

// Edit a page (requires auth + access)
await RobotAssistantLoader.editPage('index.html', 'Change background to dark blue')
// Returns: { success: boolean, result?: any, error?: string }
```

### Example Usage

```javascript
// Check authentication status
if (RobotAssistantLoader.isAuthenticated()) {
  console.log('User:', RobotAssistantLoader.getUserEmail());
  
  // Try to enable editing
  const result = await RobotAssistantLoader.enableAutonomousEditing(true);
  
  if (result.success) {
    // User has access!
    await RobotAssistantLoader.editPage('homepage', 'Make title larger');
  } else {
    console.error('Access denied:', result.error);
  }
} else {
  console.log('Please log in to use R3-D3 features');
}
```

## Admin Dashboard

Access the admin panel at: **r3d3-admin-panel.html**

Features:
- Grant/revoke R3-D3 access to users by email
- Check your own access status
- Test R3-D3 features
- View current user information

**Requirements**:
- Must be logged in
- Must have `is_admin = true`

## Security Best Practices

### 1. Access Control

- ✅ Editing disabled by default
- ✅ Authentication required for all features
- ✅ Admin-only control panel
- ✅ Audit logging for all actions
- ✅ Token-based authorization

### 2. Token Security

- Tokens stored in localStorage (not cookies to avoid CSRF)
- Short-lived access tokens
- Refresh tokens for session renewal
- Tokens validated on every API call

### 3. Input Validation

- All file paths validated server-side
- User input sanitized before processing
- Email validation for access grants
- Action type whitelisting

### 4. Audit Trail

Every R3-D3 action logged with:
- User identity
- Action type
- Target file
- Success/failure
- Timestamp
- IP address
- User agent

## Error Fix Workflow (Future Feature)

For non-admin users experiencing site errors:

1. **Error Detection**: JavaScript error captured on page
2. **Fix Request**: User can request R3-D3 to fix the error
3. **Review Queue**: Request goes to admin for review
4. **Approval**: Admin approves/rejects the fix
5. **Application**: If approved, fix is applied automatically

Status: Planned for future implementation

## Migration Guide

### For Existing Users

1. **Database Migration**: Run `supabase/migrations/002_r3d3_admin_access.sql`
2. **No Code Changes**: Frontend code is backward compatible
3. **New Features**: Just use the new authenticated methods

### For BarbrickDesign@gmail.com

Your account is automatically configured on next login:
- Admin privileges granted
- R3-D3 access enabled
- Can manage other users' access

### For Other Users

To get R3-D3 access:
1. Create account via signup
2. Contact admin (BarbrickDesign@gmail.com)
3. Admin grants access via admin panel
4. Log out and log back in
5. Enable editing via robot controls

## Testing

### Manual Testing Checklist

- [ ] Admin can log in and access admin panel
- [ ] Admin can grant access to another user
- [ ] Admin can revoke access from a user
- [ ] User without access cannot enable editing
- [ ] User with access can enable editing
- [ ] User with access can edit pages
- [ ] All actions are logged correctly
- [ ] Unauthenticated users see appropriate messages

### API Testing

```bash
# Test access check (requires auth token)
curl -X POST https://your-site.com/.netlify/functions/r3d3-access-check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "edit_page"}'

# Test grant access (requires admin token)
curl -X POST https://your-site.com/.netlify/functions/r3d3-grant-access \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_email": "user@example.com", "grant_access": true}'
```

## Troubleshooting

### "Authentication required" error

**Problem**: Robot says authentication required
**Solution**: Log in via login.html

### "Access denied" error

**Problem**: Authenticated but can't enable editing
**Solution**: Contact admin to grant R3-D3 access

### "Invalid or expired session" error

**Problem**: Token expired
**Solution**: Log out and log back in

### Admin panel shows "Not authenticated"

**Problem**: Not logged in as admin
**Solution**: 
1. Log in with admin account
2. Verify email is in admin list
3. Check database for `is_admin = true`

## Future Enhancements

- [ ] Real-time error detection and fix workflow
- [ ] Multi-level approval system
- [ ] Time-limited access grants
- [ ] Access analytics dashboard
- [ ] Role-based permissions (beyond admin/user)
- [ ] IP-based restrictions
- [ ] Rate limiting per user
- [ ] Edit history and rollback

## Support

For issues or questions:
- Check console logs for error details
- Review audit logs in database
- Contact system administrator
- Submit bug report via bug widget

---

**Last Updated**: February 14, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
