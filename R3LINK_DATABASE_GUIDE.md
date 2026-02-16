---
layout: default
title: R3LINK DATABASE GUIDE
---

# r3Link Database Integration Guide

## Overview

This document provides comprehensive guidance for implementing the r3Link database backend to support user authentication, player state synchronization, and gamification features.

## Architecture

The r3Link system uses a **three-tier architecture**:

1. **Frontend (r3link.html)** - Browser-based UI with IndexedDB for offline-first functionality
2. **API Layer (Backend)** - RESTful API for authentication and data synchronization
3. **Database (MySQL/MariaDB)** - Persistent storage with comprehensive schema

## Database Schema

### Installation

1. **Create the database:**
```sql
CREATE DATABASE r3link_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Import the schema:**
```bash
mysql -u root -p r3link_db < r3link-schema.sql
```

3. **Verify installation:**
```sql
USE r3link_db;
SHOW TABLES;
```

### Core Tables

#### r3link_users
Stores user authentication credentials and profile information.

**Key Fields:**
- `user_id` - Primary key (auto-increment)
- `username` - Unique username
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `salt` - Random salt for password hashing
- `player_id` - Links to gamification system
- `two_factor_secret` - Optional 2FA secret
- `account_status` - active | suspended | pending | deleted

**Security Notes:**
- Never store plain-text passwords
- Use bcrypt with minimum 10 rounds for password hashing
- Implement rate limiting on login attempts
- Support 2FA for enhanced security

#### r3link_player_state
Stores gamification state for each player.

**Key Fields:**
- `total_points` - Accumulated points
- `level` - Current level (0-5)
- `total_donations` - Sum of all donations
- `vault_stake` - Calculated stake in ecosystem
- `achievements` - JSON array of unlocked achievement IDs
- `stage` - Current sanctuary stage (0-5)

#### r3link_player_actions
Logs all player actions for analytics and point tracking.

**Key Fields:**
- `action_type` - Type of action performed
- `points` - Points awarded for this action
- `metadata` - JSON object with additional context
- `timestamp` - Unix timestamp in milliseconds

#### r3link_donations
Tracks vault donations and stake calculations.

**Key Fields:**
- `amount` - Donation amount in USD
- `payment_status` - pending | completed | failed | refunded
- `stake_increase` - Calculated stake increase based on level
- `bonus_points` - Scaled bonus points awarded
- `transaction_id` - External payment processor ID

#### r3link_sync_queue
Manages offline-first synchronization between client and server.

**Key Fields:**
- `entity_type` - Type of entity being synced
- `operation` - create | update | delete
- `sync_status` - pending | processing | completed | failed
- `client_timestamp` - When action occurred on client
- `retry_count` - Number of sync retry attempts

### Stored Procedures

#### sp_create_user
Creates a new user with associated player state and profile.

```sql
CALL sp_create_user(
    'username',
    'email@example.com',
    'hashed_password',
    'random_salt',
    'player_id_123',
    @user_id
);
```

#### sp_record_action
Records a player action and updates points/level.

```sql
CALL sp_record_action(
    user_id,
    'pageView',
    1,
    '{"source": "homepage"}'
);
```

#### sp_record_donation
Records a donation and calculates stake increase.

```sql
CALL sp_record_donation(
    user_id,
    100.00,
    'paypal',
    'txn_123456'
);
```

### Views

#### v_user_stats
Provides comprehensive user statistics.

```sql
SELECT * FROM v_user_stats WHERE user_id = 123;
```

#### v_leaderboard
Returns ranked leaderboard by points and stake.

```sql
SELECT * FROM v_leaderboard LIMIT 100;
```

## Backend API Implementation

### Technology Stack Recommendations

- **Node.js + Express** - Recommended for JavaScript consistency
- **Python + Flask/FastAPI** - Good alternative for data-heavy operations
- **Go + Gin** - High-performance option for large scale

### Required Endpoints

#### Authentication Endpoints

**POST /api/auth/register**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "user_id": 123,
  "player_id": "player_abc123",
  "message": "User created successfully"
}
```

**POST /api/auth/login**
```json
{
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "user_id": 123,
    "username": "string",
    "email": "string",
    "player_id": "string"
  }
}
```

**POST /api/auth/logout**
Headers: `Authorization: Bearer {token}`

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Player Endpoints

**GET /api/player/state**
Headers: `Authorization: Bearer {token}`

Response:
```json
{
  "player_id": "string",
  "total_points": 150,
  "level": 2,
  "total_donations": 25.00,
  "vault_stake": 1.25,
  "achievements": ["first_visit", "protocol_reader"],
  "stage": 2
}
```

**POST /api/player/actions**
Headers: `Authorization: Bearer {token}`

```json
{
  "action_type": "pageView",
  "metadata": {"page": "home"}
}
```

**GET /api/player/leaderboard**
Query params: `?limit=100&offset=0`

Response:
```json
{
  "leaderboard": [
    {
      "username": "string",
      "display_name": "string",
      "total_points": 5000,
      "level": 5,
      "vault_stake": 250.00,
      "rank": 1
    }
  ]
}
```

#### Sync Endpoints

**POST /api/sync/push**
Headers: `Authorization: Bearer {token}`

```json
{
  "entity_type": "player_state",
  "entity_id": "player_abc123",
  "operation": "update",
  "data": { ... },
  "client_timestamp": 1768180503716
}
```

**GET /api/sync/pull**
Headers: `Authorization: Bearer {token}`

Query params: `?since=1768180503716`

Response:
```json
{
  "playerState": { ... },
  "actions": [ ... ],
  "donations": [ ... ],
  "server_timestamp": 1768180603716
}
```

### Security Best Practices

1. **Password Security**
   - Use bcrypt with minimum 10 rounds
   - Enforce strong password requirements (min 8 chars, mixed case, numbers, symbols)
   - Implement password reset with email verification

2. **JWT Tokens**
   - Use short-lived access tokens (15-60 minutes)
   - Implement refresh tokens for extended sessions
   - Store JWT secret in environment variables
   - Validate token expiration on every request

3. **Rate Limiting**
   - Login attempts: 5 per 15 minutes per IP
   - API calls: 100 per minute per user
   - Registration: 3 per hour per IP

4. **Input Validation**
   - Sanitize all user inputs
   - Use parameterized queries to prevent SQL injection
   - Validate email format and uniqueness
   - Validate username constraints (alphanumeric, length)

5. **CORS Configuration**
   - Whitelist specific domains in production
   - Allow credentials for authenticated requests
   - Set appropriate headers for preflight requests

## Frontend Integration

### Global Configuration (r3link.html)

The `DB_CONFIG` object controls all backend integration:

```javascript
const DB_CONFIG = {
  apiBaseUrl: 'https://api.yourdomain.com',
  endpoints: { ... },
  auth: {
    tokenKey: 'r3link_auth_token',
    refreshTokenKey: 'r3link_refresh_token',
    sessionTimeout: 86400000, // 24 hours
    passwordMinLength: 8
  },
  sync: {
    enabled: true,
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    conflictResolution: 'server-wins'
  }
};
```

### Using the API

#### Authentication
```javascript
// Login
const success = await authSystem.login('user@example.com', 'password');

// Register
const result = await authSystem.register('username', 'email', 'password');

// Logout
await authSystem.logout();
```

#### Data Access
```javascript
// Get player state from IndexedDB
const state = await localDB.get('player_state', playerId);

// Save player state
await localDB.put('player_state', playerData);

// Queue for sync
await syncSystem.queueSync('player_state', playerId, 'update', data);
```

## Deployment Guide

### Database Setup

1. **Production Database:**
```bash
# Create production user
CREATE USER 'r3link_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON r3link_db.* TO 'r3link_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Environment Variables:**
```bash
# .env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=r3link_db
DB_USER=r3link_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=3600
REFRESH_TOKEN_EXPIRES_IN=604800
API_PORT=3000
```

### Backend Deployment

1. **Node.js Example (Express):**

```javascript
// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate player ID
    const playerId = `player_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
    
    // Create user
    const [result] = await pool.query(
      'CALL sp_create_user(?, ?, ?, ?, ?, @user_id)',
      [username, email, passwordHash, salt, playerId]
    );
    
    const [[{ user_id }]] = await pool.query('SELECT @user_id as user_id');
    
    res.json({
      success: true,
      user_id,
      player_id: playerId,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user
    const [users] = await pool.query(
      'SELECT * FROM r3link_users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );
    
    // Update last login
    await pool.query(
      'UPDATE r3link_users SET last_login_at = NOW() WHERE user_id = ?',
      [user.user_id]
    );
    
    res.json({
      success: true,
      token,
      refresh_token: refreshToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        player_id: user.player_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Get player state
app.get('/api/player/state', authenticateToken, async (req, res) => {
  try {
    const [states] = await pool.query(
      'SELECT * FROM r3link_player_state WHERE user_id = ?',
      [req.user.user_id]
    );
    
    if (states.length === 0) {
      return res.status(404).json({ success: false, message: 'Player state not found' });
    }
    
    const state = states[0];
    state.achievements = JSON.parse(state.achievements || '[]');
    
    res.json(state);
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ success: false, message: 'Failed to get player state' });
  }
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

2. **Start the server:**
```bash
npm install express mysql2 bcrypt jsonwebtoken dotenv
node server.js
```

## Testing

### Database Tests
```sql
-- Test user creation
CALL sp_create_user('testuser', 'test@example.com', 'hash', 'salt', 'player_test', @user_id);
SELECT @user_id;

-- Test action recording
CALL sp_record_action(@user_id, 'pageView', 1, '{"test": true}');
SELECT * FROM r3link_player_actions WHERE user_id = @user_id;

-- Test donation
CALL sp_record_donation(@user_id, 100.00, 'test', 'test_txn');
SELECT * FROM r3link_donations WHERE user_id = @user_id;

-- Check player state
SELECT * FROM v_user_stats WHERE user_id = @user_id;
```

### API Tests
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!@#"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Get player state (use token from login)
curl -X GET http://localhost:3000/api/player/state \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Monitoring & Maintenance

### Performance Optimization

1. **Add indexes for common queries:**
```sql
CREATE INDEX idx_player_actions_user_type ON r3link_player_actions(user_id, action_type);
CREATE INDEX idx_donations_user_status ON r3link_donations(user_id, payment_status);
```

2. **Partition large tables:**
```sql
ALTER TABLE r3link_player_actions 
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### Backup Strategy

1. **Daily backups:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p r3link_db | gzip > /backups/r3link_$DATE.sql.gz
# Keep last 7 days
find /backups -name "r3link_*.sql.gz" -mtime +7 -delete
```

2. **Restore from backup:**
```bash
gunzip < /backups/r3link_20260112.sql.gz | mysql -u root -p r3link_db
```

## Troubleshooting

### Common Issues

1. **Connection pool exhaustion:**
   - Increase `connectionLimit` in pool configuration
   - Check for connection leaks (always release connections)
   - Monitor active connections: `SHOW PROCESSLIST;`

2. **Slow queries:**
   - Enable slow query log: `SET GLOBAL slow_query_log = 'ON';`
   - Analyze with `EXPLAIN` statement
   - Add appropriate indexes

3. **Sync conflicts:**
   - Implement proper conflict resolution in sync endpoints
   - Use `client_timestamp` and `server_timestamp` for ordering
   - Consider last-write-wins or manual conflict resolution

## Support & Resources

- **Schema File:** `r3link-schema.sql`
- **Frontend:** `r3link.html`
- **API Spec:** `r3link-api.json`
- **GitHub:** https://github.com/barbrickdesign/barbrickdesign.github.io
- **Discord:** https://discord.gg/M4QZyPQq

## License

This implementation guide is part of the r3Link project and follows the same license as the parent repository.
