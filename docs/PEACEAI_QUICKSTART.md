# PeaceAI Enterprise - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### For Users

1. **Open the Application**
   ```
   https://your-domain.com/peaceAi.html
   ```

2. **Sign In**
   - Click "Sign in with Google"
   - Authorize with your Google account
   - You'll be assigned a role (Viewer, Guard, Steward, or Admin)

3. **Start Monitoring**
   - Cameras are auto-discovered
   - Select a feed from the dropdown
   - Click "Start Monitoring"
   - View live video and events

### For Developers

#### Local Development

```bash
# Clone repository
git clone https://github.com/barbrickdesign/barbrickdesign.github.io.git
cd barbrickdesign.github.io

# Start local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/peaceAi.html
```

#### File Structure

```
peaceAi.html                          # Main application (1228 lines)
js/peaceai-enterprise-extensions.js   # Enterprise features (1024 lines)
docs/PEACEAI_ENTERPRISE.md            # Full documentation (21KB)
docs/PEACEAI_TESTING_REPORT.md        # Test results (12KB)
```

#### Key Features

**Authentication**
```javascript
// Check if user is authenticated
if (window.PeaceAI.authManager.isAuthenticated()) {
  // User is signed in
}

// Check permission
if (window.PeaceAI.authManager.hasPermission('VIEW_FEEDS')) {
  // User can view feeds
}

// Sign out
await window.PeaceAI.authManager.signOut();
```

**Error Handling**
```javascript
// API call with automatic retry
const response = await window.PeaceAI.fetchWithRetry('/api/devices', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});
```

**Notifications**
```javascript
// Show toast notification
window.PeaceAI.showToast('Operation successful!', 'success');
window.PeaceAI.showToast('Warning message', 'warning');
window.PeaceAI.showToast('Error occurred', 'error');
window.PeaceAI.showToast('Information', 'info');
```

**Audit Logging**
```javascript
// Log an event
window.PeaceAI.logAuditEvent('camera_activated', {
  cameraId: 'camera-1',
  zone: 'sanctuary'
});

// Get audit logs
const logs = await window.PeaceAI.auditLogger.getLogs({
  userId: 'user-123',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});
```

**Performance Monitoring**
```javascript
// View performance stats
window.PeaceAI.performanceMonitor.displayDashboard();

// Get stats programmatically
const stats = window.PeaceAI.performanceMonitor.getStats();
console.log(`Avg API duration: ${stats.avgAPICallDuration}ms`);
```

**Input Validation**
```javascript
// Validate and sanitize input
const email = window.PeaceAI.InputValidator.sanitizeText(userInput);
if (window.PeaceAI.InputValidator.validateEmail(email)) {
  // Email is valid
}

// Prevent XSS
const safeHTML = window.PeaceAI.InputValidator.sanitizeHTML(untrustedInput);
```

### Configuration

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:8000` (development)
   - `https://your-domain.com` (production)
6. Update `js/peaceai-enterprise-extensions.js`:
   ```javascript
   GOOGLE_CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com'
   ```

#### Backend API Configuration

Update `js/peaceai-enterprise-extensions.js`:

```javascript
const CONFIG = {
  API_BASE_URL: 'https://your-backend-api.com',
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000
};
```

### Backend Requirements

PeaceAI requires a Python backend with these endpoints:

```
POST   /api/auth/verify-google-token  - Verify Google JWT
POST   /api/auth/refresh              - Refresh access token
POST   /api/auth/signout              - Sign out user
GET    /api/devices                   - List cameras
POST   /api/monitor/start             - Start monitoring
POST   /api/monitor/stop              - Stop monitoring
GET    /api/events                    - Event stream (SSE)
GET    /api/stream                    - Video stream
GET    /api/alerts/config             - Get alert config
POST   /api/alerts/config             - Save alert config
POST   /api/alerts/test-critical      - Test alert
POST   /api/automation/run            - Run automation
GET    /api/summary/daily             - Daily summary
POST   /api/audit/log                 - Submit audit log
```

See `docs/PEACEAI_ENTERPRISE.md` for full API documentation.

### Testing

#### Manual Testing

1. Open browser console (F12)
2. Load peaceAi.html
3. Check for errors
4. Test sign-in flow
5. Test device discovery
6. View performance dashboard:
   ```javascript
   window.PeaceAI.performanceMonitor.displayDashboard()
   ```

#### Debug Mode

Enable verbose logging:
```javascript
localStorage.setItem('peaceai_debug', 'true');
location.reload();
```

View logs:
```javascript
// Recent errors
window.PeaceAI.errorHandler.getRecentErrors(10);

// Audit logs
window.PeaceAI.auditLogger.getLogs();

// Performance stats
window.PeaceAI.performanceMonitor.getStats();
```

### Common Issues

#### "Google Sign-In not working"

**Solution**: Verify Google Client ID is correct and domain is authorized.

```javascript
// Check current config
console.log(window.PeaceAI.CONFIG.GOOGLE_CLIENT_ID);
```

#### "Backend connection failed"

**Solution**: Verify backend is running and CORS is configured.

```bash
# Test backend
curl http://localhost:5000/api/health

# Check CORS
curl -H "Origin: http://localhost:8000" \
     --verbose \
     http://localhost:5000/api/devices
```

#### "Rate limit exceeded"

**Solution**: Wait 60 seconds or adjust rate limit.

```javascript
// Check remaining requests
const remaining = window.PeaceAI.rateLimiter.getRemaining('user-id');
console.log(`Remaining requests: ${remaining}`);
```

### Deployment

#### Quick Deploy to Production

```bash
# 1. Build
npm run build

# 2. Deploy files
rsync -avz peaceAi.html js/ css/ user@server:/var/www/peaceai/

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/peaceai

# 4. Restart Nginx
sudo systemctl restart nginx

# 5. Verify
curl -f https://your-domain.com/peaceAi.html
```

#### Docker Deploy

```bash
# Build image
docker build -t peaceai-enterprise .

# Run container
docker run -d -p 443:443 --name peaceai peaceai-enterprise

# Check logs
docker logs peaceai
```

### Support

- **Documentation**: `docs/PEACEAI_ENTERPRISE.md`
- **Testing Report**: `docs/PEACEAI_TESTING_REPORT.md`
- **Email**: BarbrickDesign@gmail.com
- **GitHub**: https://github.com/barbrickdesign/barbrickdesign.github.io

### Version History

- **v2.0.0** (2026-01-25) - Enterprise Edition
  - Real Google OAuth 2.0
  - RBAC with 4 roles
  - Error handling with retry
  - Audit logging
  - Performance monitoring
  - Comprehensive documentation

- **v1.0.0** (2026-01-24) - Initial Release
  - Basic monitoring
  - Demo authentication
  - Alert routing
  - Smart automations

---

**Made with ❤️ by Barbrick Design**  
**Dedicated to Thomas Barbrick**  
**Knights of Columbus Security Stewardship**
