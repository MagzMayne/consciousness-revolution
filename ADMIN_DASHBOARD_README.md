# Admin Dashboard - Complete Implementation Guide

## 🔐 Security & Authentication

### Access Control
The admin dashboard at `https://barbrickdesign.github.io/admin-dashboard.html` is **strictly restricted** to:

**Authorized Email:** `barbrickdesign@gmail.com` (case-insensitive)

### Authentication Method
- **Google OAuth 2.0** via Firebase Authentication
- **FirebaseUI** for seamless Google sign-in experience
- **Email/Password** authentication also available as backup
- **Case-insensitive** email validation ensures "BarbrickDesign@gmail.com" works

### Security Features
1. **Pre-Authentication Screen**: Shows restriction notice before login
2. **Access Denied Screen**: Non-admin users see a clear denial message with their email
3. **Automatic Sign-Out**: Easy logout with session cleanup
4. **Firebase Security Rules**: Backend access control via Firebase project settings

## 📦 Dashboard Features

### 1. Overview Section
- Real-time statistics for active users, gems cut, machines, and coins
- Activity log with timestamped entries
- Quick actions: Refresh stats, broadcast messages, export data
- Direct link to GemBot Control

### 2. Projects Section ✨ NEW
- **Total Projects**: Displays count of all projects (387+)
- **Repositories**: Shows GitHub repositories (14)
- **HTML Projects**: Single-file applications (373+)
- **Active Projects**: Currently maintained projects
- **Project Table**: Searchable list with:
  - Project name and description
  - Type and category
  - Active/Inactive status
  - Quick links to open projects
  - Export functionality

**Data Source**: `projects.json` - automatically loaded and parsed

### 3. AI Agents Section ✨ ENHANCED
- **Agent Management**: View, start, stop, and monitor AI agents
- **Agent Types**: 
  - Merlin Hive (9 agents - auto-start)
  - Agent Management (4 agents)
  - Agent R (System Architect - Supreme Authority)
  - PayPal Integration
  - And more from agent manifests
- **Real-time Monitoring**: Tasks completed, uptime, status
- **Spawn New Agents**: Create agents on-demand
- **Bulk Operations**: Stop all or clear all agents

**Data Sources**: 
- `agent-deployment-manifest.json`
- `agent-r-manifest.json`

### 4. Security Section
- User registration monitoring
- Suspicion score tracking
- Flagged accounts management
- Security dashboard with safety metrics

### 5. Wallets Section
- GBUV wallet management
- Balance tracking
- Airdrop functionality
- Wallet export features

### 6. Code Editor Section
- Full-featured CodeMirror editor
- Syntax highlighting for HTML, CSS, JavaScript
- File browser with tabs
- GitHub integration for push/pull
- Auto-save and revert functionality

### 7. Visual Editor Section
- WYSIWYG page editing
- Context menu for element manipulation
- Quick edit popup for styles and content
- Preview and save functionality

### 8. Users Section
- User management table
- Level, coins, gems tracking
- Machine inventory per user
- User data export

### 9. Game Control Section
- Farm game management
- Spawn rates configuration
- Economy controls
- Gem drop rates

### 10. Settings Section
- GitHub configuration
- Token management
- Repository settings
- Admin password change

## 🚀 Technical Implementation

### Admin API (`admin-api.js`)
**Version**: 2.0.0

**Features**:
- Automatic data loading from JSON files
- Project statistics calculation
- Agent initialization from manifests
- RESTful-style API interface

**Main Methods**:
```javascript
window.gemBotAdminAPI.init()                  // Initialize API
window.gemBotAdminAPI.getAllProjects()        // Get all projects
window.gemBotAdminAPI.getProjectStats()       // Get project statistics
window.gemBotAdminAPI.getAllAIAgents()        // Get all AI agents
window.gemBotAdminAPI.getAgent(agentId)       // Get specific agent
window.gemBotAdminAPI.spawnAgent(type)        // Create new agent
window.gemBotAdminAPI.stopAgent(agentId)      // Stop agent
window.gemBotAdminAPI.startAgent(agentId)     // Start agent
```

### Firebase Configuration
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyAulZ2a1-i25LB77IuR1ScsxD1w6Wdfmg8",
    authDomain: "gem-bot-57068.firebaseapp.com",
    projectId: "gem-bot-57068",
    storageBucket: "gem-bot-57068.appspot.com",
    messagingSenderId: "536281556406",
    appId: "1:536281556406:web:344bbfc5503caffdae0d17",
    measurementId: "G-CPHEQZPHPZ"
};
```

### Authentication Flow
1. User visits `/admin-dashboard.html`
2. Login screen displays with FirebaseUI
3. User signs in with Google OAuth
4. Firebase validates credentials
5. Dashboard checks `user.email.toLowerCase() === 'barbrickdesign@gmail.com'`
6. If match: Access granted → Dashboard loads
7. If no match: Access denied screen → Sign out required

## 🛠️ Setup & Configuration

### For Admin User (barbrickdesign@gmail.com)
1. Navigate to `https://barbrickdesign.github.io/admin-dashboard.html`
2. Click "Sign in with Google"
3. Select your Google account (barbrickdesign@gmail.com)
4. Dashboard automatically loads
5. All features immediately available

### Firebase Setup (Already Configured)
- ✅ Firebase project: `gem-bot-57068`
- ✅ Google OAuth enabled
- ✅ Email/Password auth enabled
- ✅ FirebaseUI configured
- ✅ Authorized domain: `barbrickdesign.github.io`

### GitHub Integration (Optional)
Configure in Settings section:
1. Generate GitHub Personal Access Token
2. Enter token in Settings → GitHub Config
3. Set owner: `barbrickdesign`
4. Set repository: `GemBotAiWebControl` (or desired repo)
5. Test connection
6. Use Code Editor for file editing

## 📊 Data Integration

### Projects Data
**File**: `projects.json`
- 387 total items
- 14 repositories
- 373 HTML projects
- Auto-loaded on dashboard init
- Searchable and filterable

### Agent Data
**Files**: 
- `agent-deployment-manifest.json`: System agent configurations
- `agent-r-manifest.json`: Agent R identity and permissions

**Agent Systems**:
1. Merlin Hive - Autonomous orchestration (9 agents)
2. Agent Management - Health monitoring (4 agents)
3. Agent R - System Architect (1 agent, clearance level 999)
4. PayPal Integration - Payment automation
5. Integration System - Cross-system sync

## 🔒 Security Best Practices

1. **Never share Firebase credentials** - Already configured
2. **Keep GitHub token private** - Store only in Settings
3. **Regular access audits** - Check Firebase console
4. **Session timeout** - Firebase handles automatically
5. **HTTPS only** - GitHub Pages enforces SSL

## 🎨 UI/UX Features

- **Dark Mode Theme**: Professional cyberpunk aesthetic
- **Responsive Design**: Works on desktop and tablet
- **Real-time Updates**: Stats refresh on user action
- **Toast Notifications**: Success, warning, error messages
- **Activity Log**: Timestamped action history
- **Search & Filter**: All tables are searchable
- **Quick Actions**: One-click common operations
- **Keyboard Shortcuts**: Z-Index Manager (Ctrl+Shift+Z)

## 🐛 Troubleshooting

### Issue: Can't sign in
**Solution**: 
1. Ensure you're using barbrickdesign@gmail.com
2. Check Firebase console for auth issues
3. Try clearing browser cache
4. Use incognito mode to rule out extensions

### Issue: Projects not loading
**Solution**:
1. Check browser console for errors
2. Verify projects.json exists and is valid
3. Refresh the page
4. Check network tab for failed requests

### Issue: GitHub features not working
**Solution**:
1. Configure GitHub token in Settings
2. Verify token has repo access
3. Test connection button
4. Check token expiration

### Issue: Agents not showing
**Solution**:
1. Wait for admin API initialization
2. Check manifest files exist
3. Refresh agents manually
4. Check console for errors

## 📈 Future Enhancements

- [ ] Real-time Firebase database integration
- [ ] Multi-user admin roles (view-only, editor, super-admin)
- [ ] Advanced analytics dashboard
- [ ] Automated backup system
- [ ] Webhook integrations
- [ ] Mobile app version
- [ ] Two-factor authentication
- [ ] Audit log exports
- [ ] Custom agent templates

## 📞 Support

**Admin User**: barbrickdesign@gmail.com
**Project**: https://github.com/barbrickdesign/barbrickdesign.github.io
**Dashboard URL**: https://barbrickdesign.github.io/admin-dashboard.html

---

**Last Updated**: 2026-01-21
**Version**: 2.0.0
**Status**: ✅ Fully Operational
