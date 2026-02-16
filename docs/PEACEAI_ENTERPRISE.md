# PeaceAI Enterprise - Complete Documentation

## Overview

PeaceAI Enterprise is an advanced church security monitoring platform that transforms a basic prototype into a production-ready, enterprise-grade surveillance system. It provides real-time camera monitoring, intelligent alerts, automated security actions, and comprehensive audit logging.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Security](#security)
5. [Configuration](#configuration)
6. [API Documentation](#api-documentation)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Development](#development)

## Quick Start

### Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Python 3.8+ backend service (for camera integration)
- Google OAuth 2.0 Client ID (for production authentication)
- HTTPS-enabled web server (required for production)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/barbrickdesign/barbrickdesign.github.io.git
cd barbrickdesign.github.io
```

2. **Configure Google OAuth 2.0:**

Edit `js/peaceai-enterprise-extensions.js` and update the Google Client ID:
```javascript
GOOGLE_CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com'
```

3. **Set up Python backend** (see Backend Setup section)

4. **Open the application:**
```bash
# For development
python3 -m http.server 8000

# Then navigate to
http://localhost:8000/peaceAi.html
```

### Demo Mode

PeaceAI includes a demo mode that works without backend configuration:

1. Open `peaceAi.html` in your browser
2. Click "Sign in with Google (Fallback)" to enter demo mode
3. Explore the UI with simulated data

## Features

### Core Features

#### 1. **Live Camera Monitoring**
- Auto-discovery of network cameras
- Real-time video streaming
- Multi-zone monitoring
- People counting and tracking

#### 2. **Intelligent Alerting**
- Configurable alert routing (email, SMS)
- Severity-based notifications
- Custom alert policies
- Alert history and tracking

#### 3. **Smart Automations**
- Automated door locking/unlocking
- Smart lighting control
- Goodnight routines
- Zone-based triggers

#### 4. **Daily Summaries**
- Peace-of-mind reports
- Activity summaries
- Anomaly detection
- Email delivery

### Enterprise Features (v2.0)

#### 1. **Authentication & Authorization**

- ✅ **Real Google OAuth 2.0** - Production-ready authentication
- ✅ **Role-Based Access Control (RBAC)** - Admin, Steward, Guard, Viewer roles
- ✅ **Session Management** - Automatic timeout and refresh
- ✅ **Token Management** - Secure JWT handling with automatic refresh
- ✅ **CSRF Protection** - Token-based request validation

**Roles & Permissions:**

| Role | View Feeds | Control Monitoring | Configure Alerts | Run Automations | View Audit Log | Manage Users |
|------|-----------|-------------------|------------------|-----------------|---------------|--------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Steward** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Guard** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

#### 2. **Error Handling & Resilience**

- ✅ **Exponential Backoff** - Automatic retry with smart delays
- ✅ **Request Timeout** - 30-second default with configurable limits
- ✅ **User-Friendly Errors** - Clear messages instead of technical jargon
- ✅ **Error Logging** - Comprehensive error tracking
- ✅ **Graceful Degradation** - Fallback modes when services unavailable

#### 3. **Security Enhancements**

- ✅ **Content Security Policy (CSP)** - XSS and injection protection
- ✅ **Input Validation** - Sanitization of all user inputs
- ✅ **Rate Limiting** - 60 requests per minute per user
- ✅ **Secure Headers** - Authorization and CSRF tokens
- ✅ **Audit Logging** - Complete action tracking

#### 4. **Performance Monitoring**

- ✅ **API Call Metrics** - Track response times and success rates
- ✅ **Render Performance** - Monitor UI update times
- ✅ **Performance Dashboard** - Real-time statistics in console
- ✅ **Error Analytics** - Track and analyze failures

#### 5. **Offline Support**

- ✅ **IndexedDB Storage** - Local audit log persistence
- ✅ **Session Persistence** - Maintain login across page reloads
- ✅ **Graceful Degradation** - Works with limited connectivity

#### 6. **Audit & Compliance**

- ✅ **Comprehensive Audit Log** - All actions tracked
- ✅ **User Attribution** - Every action tied to user identity
- ✅ **Timestamp Tracking** - Precise event timing
- ✅ **Export Capabilities** - CSV export for compliance

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PeaceAI Web Frontend                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           peaceAi.html (Main Application)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     peaceai-enterprise-extensions.js (v2.0)          │  │
│  │  • Authentication Manager                            │  │
│  │  • Error Handler                                     │  │
│  │  • Rate Limiter                                      │  │
│  │  • Audit Logger                                      │  │
│  │  • Performance Monitor                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                  Python Backend Service                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Camera Discovery                                   │  │
│  │  • Video Streaming                                    │  │
│  │  • Event Processing (SSE)                            │  │
│  │  • Alert Routing                                     │  │
│  │  • Smart Automations                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Camera Network                           │
│  📹 Camera 1 • 📹 Camera 2 • 📹 Camera 3 • 🔐 Smart Locks   │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Frontend Components

1. **peaceAi.html** - Main application interface
   - Live video display
   - Device list and controls
   - Alert configuration
   - Event log
   - Automation controls

2. **peaceai-enterprise-extensions.js** - Enterprise features
   - Authentication management
   - Error handling with retry
   - Security enforcement
   - Performance monitoring
   - Audit logging

3. **External Dependencies**
   - Google Identity Services (OAuth 2.0)
   - Update Notification System

#### Backend API Endpoints

| Endpoint | Method | Description | Required Role |
|----------|--------|-------------|---------------|
| `/api/auth/verify-google-token` | POST | Verify Google JWT | - |
| `/api/auth/refresh` | POST | Refresh access token | Authenticated |
| `/api/auth/signout` | POST | Sign out user | Authenticated |
| `/api/devices` | GET | List camera devices | Viewer+ |
| `/api/monitor/start` | POST | Start monitoring feed | Guard+ |
| `/api/monitor/stop` | POST | Stop monitoring feed | Guard+ |
| `/api/events` | GET (SSE) | Real-time event stream | Viewer+ |
| `/api/stream` | GET | Video stream | Viewer+ |
| `/api/alerts/config` | GET/POST | Alert configuration | Steward+ |
| `/api/alerts/test-critical` | POST | Test critical alert | Steward+ |
| `/api/automation/run` | POST | Execute automation | Steward+ |
| `/api/summary/daily` | GET | Daily summary | Steward+ |
| `/api/audit/log` | POST | Submit audit log | Admin |

## Security

### Authentication Flow

1. User clicks "Sign in with Google"
2. Google Identity Services displays sign-in UI
3. User authenticates with Google
4. Google returns JWT credential
5. Frontend sends JWT to `/api/auth/verify-google-token`
6. Backend verifies JWT with Google
7. Backend returns access token, refresh token, and user info
8. Frontend stores tokens securely in sessionStorage
9. All subsequent requests include `Authorization: Bearer <token>` header

### CSRF Protection

Every state-changing request (POST, PUT, DELETE) must include:
```
X-CSRF-Token: <token from sessionStorage>
```

The CSRF token is:
- Generated on page load
- Stored in sessionStorage
- Validated by backend
- Rotated on sign-out

### Rate Limiting

- **Default Limit:** 60 requests per minute per user
- **Identification:** By user ID (authenticated) or IP address (anonymous)
- **Enforcement:** Client-side pre-check + backend validation
- **Response:** 429 Too Many Requests with retry-after header

### Content Security Policy

The application enforces strict CSP:

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://accounts.google.com https://www.googleapis.com;
frame-src https://accounts.google.com;
```

### Input Validation

All user inputs are:
1. **Validated** - Type checking and format validation
2. **Sanitized** - HTML encoding to prevent XSS
3. **Length-limited** - Maximum lengths enforced
4. **Logged** - All inputs logged to audit trail

Example:
```javascript
const email = InputValidator.sanitizeText(userInput);
if (!InputValidator.validateEmail(email)) {
  showToast('Invalid email address', 'error');
  return;
}
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Backend API
API_BASE_URL=https://your-backend.example.com
API_TIMEOUT=30000

# Security
SESSION_TIMEOUT=3600000
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=60

# Features
ENABLE_OFFLINE_MODE=true
ENABLE_AUDIT_LOG=true
ENABLE_PERFORMANCE_MONITORING=true

# Backend Python Service
PYTHON_BACKEND_HOST=localhost
PYTHON_BACKEND_PORT=5000
```

### Frontend Configuration

Edit `js/peaceai-enterprise-extensions.js`:

```javascript
const CONFIG = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID',
  API_BASE_URL: process.env.API_BASE_URL || window.location.origin,
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000,
  // ... other settings
};
```

### Backend Configuration

The Python backend requires configuration for:

1. **Camera Discovery** - Network scanning settings
2. **Video Streaming** - Codec and quality settings
3. **Alert Routing** - Email/SMS gateway credentials
4. **Smart Home Integration** - Device API keys

See `BACKEND_SETUP.md` for detailed instructions.

## API Documentation

### Authentication Endpoints

#### POST /api/auth/verify-google-token

Verify Google JWT and issue access token.

**Request:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://...",
  "role": "steward",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "refresh-token-here",
  "expiresIn": 3600
}
```

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

**Response:**
```json
{
  "accessToken": "new-access-token",
  "expiresIn": 3600
}
```

### Device Endpoints

#### GET /api/devices

List all available camera devices.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "camera-1",
    "name": "Sanctuary Main",
    "zone": "Sanctuary",
    "status": "online",
    "ip": "192.168.1.100",
    "streamUrl": "/api/stream?feedId=camera-1"
  },
  {
    "id": "camera-2",
    "name": "Parking Lot",
    "zone": "Exterior",
    "status": "online",
    "ip": "192.168.1.101",
    "streamUrl": "/api/stream?feedId=camera-2"
  }
]
```

### Monitoring Endpoints

#### POST /api/monitor/start

Start monitoring a specific camera feed.

**Headers:**
```
Authorization: Bearer <token>
X-CSRF-Token: <csrf-token>
```

**Request:**
```json
{
  "feedId": "camera-1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Monitoring started for camera-1"
}
```

#### GET /api/events (Server-Sent Events)

Real-time event stream.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `feedId` - Camera ID to monitor
- `user` - User ID (for logging)

**Event Stream:**
```
event: message
data: {"type":"motion_detected","severity":"info","peopleCount":2,"timestamp":"2026-01-25T04:00:00Z"}

event: message
data: {"type":"door_opened","severity":"important","details":"Main entrance","timestamp":"2026-01-25T04:01:00Z"}

event: message
data: {"type":"unauthorized_access","severity":"critical","details":"Side door after hours","timestamp":"2026-01-25T04:02:00Z"}
```

## Deployment

### Production Deployment

1. **Configure Google OAuth 2.0**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized JavaScript origins
   - Update `GOOGLE_CLIENT_ID` in configuration

2. **Set up HTTPS**
   ```bash
   # Using Let's Encrypt
   sudo apt install certbot
   sudo certbot --nginx -d your-domain.com
   ```

3. **Deploy Python Backend**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Run with gunicorn (production)
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

4. **Deploy Frontend**
   ```bash
   # Build and deploy to web server
   npm run build
   rsync -avz dist/ user@server:/var/www/peaceai/
   ```

5. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       root /var/www/peaceai;
       index peaceAi.html;
       
       # Frontend
       location / {
           try_files $uri $uri/ =404;
       }
       
       # Backend API proxy
       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # SSE support
           proxy_buffering off;
           proxy_cache off;
           proxy_read_timeout 3600s;
       }
   }
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM nginx:alpine

# Copy frontend files
COPY peaceAi.html /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
COPY css/ /usr/share/nginx/html/css/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t peaceai-enterprise .
docker run -d -p 443:443 --name peaceai peaceai-enterprise
```

### Monitoring & Maintenance

1. **Health Checks**
   ```bash
   # Check frontend
   curl -f https://your-domain.com/peaceAi.html || exit 1
   
   # Check backend API
   curl -f https://your-domain.com/api/health || exit 1
   ```

2. **Log Monitoring**
   ```bash
   # View application logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   tail -f /var/log/peaceai/app.log
   ```

3. **Performance Monitoring**
   - Open browser console
   - Run: `PeaceAI.performanceMonitor.displayDashboard()`
   - Review metrics

4. **Security Audits**
   ```bash
   # Run security scan
   npm audit
   
   # Check for vulnerabilities
   npm run security:check
   ```

## Troubleshooting

### Common Issues

#### 1. Authentication Not Working

**Symptom:** "Google Sign-In" button doesn't work

**Solutions:**
- Verify `GOOGLE_CLIENT_ID` is correctly configured
- Check browser console for errors
- Ensure domain is in Google OAuth authorized origins
- Verify HTTPS is enabled (required for Google OAuth)

#### 2. Backend Connection Failed

**Symptom:** "Error loading devices" or "Failed to fetch"

**Solutions:**
- Verify Python backend is running: `curl http://localhost:5000/api/health`
- Check network connectivity
- Review CORS configuration in backend
- Inspect browser console for specific error messages

#### 3. Video Stream Not Loading

**Symptom:** Black video player or "stream failed"

**Solutions:**
- Verify camera is online and accessible
- Check codec compatibility (browser must support codec)
- Test direct camera URL in VLC or similar player
- Review browser console for streaming errors

#### 4. Session Timeout Issues

**Symptom:** Logged out unexpectedly

**Solutions:**
- Check `SESSION_TIMEOUT` configuration
- Verify token refresh is working
- Review audit logs for sign-out events
- Check for browser extensions blocking sessionStorage

#### 5. Rate Limit Exceeded

**Symptom:** "Too many requests" error

**Solutions:**
- Wait for rate limit window to reset (shown in error message)
- Review code for excessive API calls
- Adjust `RATE_LIMIT_MAX_REQUESTS` if legitimate usage
- Check for loops or recursive calls

### Debug Mode

Enable debug mode for verbose logging:

```javascript
// In browser console
localStorage.setItem('peaceai_debug', 'true');
location.reload();
```

View debug logs:
```javascript
// View recent errors
PeaceAI.errorHandler.getRecentErrors(20);

// View audit logs
PeaceAI.auditLogger.getLogs();

// View performance stats
PeaceAI.performanceMonitor.getStats();
```

### Support

For additional support:

1. **Check Documentation:** Review this README and inline code comments
2. **View Logs:** Check browser console and server logs
3. **Search Issues:** GitHub issues may have solutions
4. **Contact:** Email BarbrickDesign@gmail.com with:
   - Detailed problem description
   - Browser and version
   - Console error messages
   - Steps to reproduce

## Development

### Development Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/barbrickdesign/barbrickdesign.github.io.git
   cd barbrickdesign.github.io
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Run with live reload:**
   ```bash
   npm install -g live-server
   live-server --port=8000 --entry-file=peaceAi.html
   ```

### Project Structure

```
peaceAi/
├── peaceAi.html                          # Main application
├── js/
│   ├── peaceai-enterprise-extensions.js  # Enterprise features (NEW)
│   ├── update-notification-system.js     # Update notifications
│   └── update-helper.js                  # Update utilities
├── css/
│   └── (styles are inlined in HTML)
├── docs/
│   ├── PEACEAI_ENTERPRISE.md            # This file
│   ├── BACKEND_SETUP.md                 # Backend configuration
│   └── API_DOCUMENTATION.md             # Full API specs
└── tests/
    ├── peaceai.test.js                  # Unit tests
    └── peaceai-integration.test.js      # Integration tests
```

### Code Style

Follow the repository coding standards:

- **JavaScript:** ES6+, use `const`/`let`, arrow functions
- **Comments:** JSDoc for functions, inline for complex logic
- **Naming:** camelCase for variables, PascalCase for classes
- **Formatting:** 2-space indentation, semicolons required

### Testing

Run tests:
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# All tests
npm run test:all
```

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Credits

**Created by:** Ryan Barbrick (Barbrick Design)  
**Dedicated to:** Thomas Barbrick  
**Organization:** Knights of Columbus Security Stewardship  
**Email:** BarbrickDesign@gmail.com  
**Website:** https://barbrickdesign.github.io

## Version History

### v2.0.0 (2026-01-25) - Enterprise Edition
- ✅ Real Google OAuth 2.0 authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Comprehensive error handling with retry logic
- ✅ CSRF protection and security hardening
- ✅ Rate limiting
- ✅ Performance monitoring
- ✅ Audit logging with IndexedDB
- ✅ Input validation and XSS prevention
- ✅ Content Security Policy
- ✅ Session management with auto-refresh
- ✅ Offline support

### v1.0.0 (2026-01-24) - Initial Release
- Live camera monitoring
- Basic alert routing
- Smart automations
- Daily summaries
- Demo authentication

---

**Made with ❤️ for church stewards everywhere**
