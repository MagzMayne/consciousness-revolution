# Merlin Hive Backend Integration Guide

## 🚀 Overview

The Merlin Hive autonomous agent system now includes full backend integration with:

- **Supabase** - Real-time database for agent state and job persistence
- **Netlify Functions** - Serverless API endpoints for agent operations
- **Offline Mode** - Queue buffering when backend is unavailable
- **Real-time Sync** - Automatic data synchronization across devices

## 📋 Quick Start

### 1. Database Setup (Supabase)

1. **Create Supabase Project**
   - Visit [https://supabase.com](https://supabase.com)
   - Create new project
   - Note your `Project URL` and `anon` key

2. **Run Database Migration**
   ```bash
   # Copy SQL from supabase/migrations/20260219_merlin_hive_schema.sql
   # Paste and execute in Supabase SQL Editor
   ```

3. **Configure Environment Variables**
   ```bash
   # In Netlify Dashboard > Site Settings > Environment Variables
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_SECRET=your_service_role_key_here
   ```

### 2. Netlify Functions Setup

The Netlify Function `merlin-agent-api.mjs` is already deployed when you push to your repository.

**Available Endpoints:**
- `POST /.netlify/functions/merlin-agent-api/spawn` - Create new agent
- `GET /.netlify/functions/merlin-agent-api/agent/:id` - Get agent status
- `POST /.netlify/functions/merlin-agent-api/agent/:id/task` - Assign task
- `GET /.netlify/functions/merlin-agent-api/agent/:id/jobs` - Get job history
- `POST /.netlify/functions/merlin-agent-api/agent/:id/retire` - Retire agent
- `GET /.netlify/functions/merlin-agent-api/agents/list` - List all agents
- `GET /.netlify/functions/merlin-agent-api/agents/health` - Health check

### 3. Frontend Integration

The `zMerlinHive.html` page automatically detects and uses backend when available:

```javascript
// Backend is available globally as:
window.MerlinBackend  // Backend integration module
window.BackendAPI     // Helper functions for direct API calls
```

## 🎯 Features

### Agent State Persistence

All agent states are automatically saved to Supabase:

```javascript
// Automatically called when agent is spawned
await window.MerlinBackend.saveAgentState(agentId, {
  class: 'seeker',
  nick: 'JobFinder-001',
  skills: ['react', 'node.js'],
  spawnedAt: new Date().toISOString()
});

// Retrieve agent state
const state = await window.MerlinBackend.getAgentState(agentId);
```

### Job/Task History

All jobs are tracked with complete history:

```javascript
// Save job
await window.MerlinBackend.saveAgentJob({
  agentId: 'seeker-001',
  type: 'discover',
  status: 'completed',
  result: { found: 15, matched: 3 },
  completedAt: new Date().toISOString()
});

// Get job history
const jobs = await window.MerlinBackend.getAgentJobs('seeker-001', 50);
```

### Audit Logging

Complete audit trail of all operations:

```javascript
// Automatically logged for all agent operations
await window.MerlinBackend.saveAuditLog({
  agentId: 'seeker-001',
  event: 'task-assigned',
  data: { taskType: 'discover', priority: 8 },
  timestamp: new Date().toISOString()
});

// Query audit logs
const logs = await window.MerlinBackend.getAuditLogs({
  agentId: 'seeker-001',
  eventType: 'task-assigned'
}, 100);
```

### Offline Mode

When backend is unavailable, operations are queued locally:

```javascript
// Operations automatically queued when offline
await window.MerlinBackend.saveAgentState(agentId, state);
// Returns: { success: true, queued: true }

// Queue automatically processes when connection restored
// Check queue size:
const status = window.MerlinBackend.getStatus();
console.log('Queue size:', status.offlineQueueSize);
```

## 🔧 API Reference

### MerlinHiveBackend Class

#### Methods

**`init()`**
Initialize backend connections
```javascript
const initialized = await window.MerlinBackend.init();
```

**`saveAgentState(agentId, state)`**
Save agent state to backend
```javascript
await window.MerlinBackend.saveAgentState('agent-001', {
  status: 'active',
  lastTask: 'discover'
});
```

**`getAgentState(agentId)`**
Retrieve agent state
```javascript
const state = await window.MerlinBackend.getAgentState('agent-001');
```

**`saveAgentJob(job)`**
Save job/task to backend
```javascript
await window.MerlinBackend.saveAgentJob({
  agentId: 'agent-001',
  type: 'discover',
  status: 'completed',
  result: { success: true }
});
```

**`getAgentJobs(agentId, limit)`**
Get agent job history
```javascript
const jobs = await window.MerlinBackend.getAgentJobs('agent-001', 50);
```

**`saveAuditLog(entry)`**
Save audit log entry
```javascript
await window.MerlinBackend.saveAuditLog({
  agentId: 'system',
  event: 'system-startup',
  data: { version: '2.0' }
});
```

**`getAuditLogs(filters, limit)`**
Query audit logs
```javascript
const logs = await window.MerlinBackend.getAuditLogs({
  agentId: 'agent-001',
  eventType: 'task-assigned'
}, 100);
```

**`callNetlifyFunction(functionName, payload)`**
Call Netlify Function directly
```javascript
const result = await window.MerlinBackend.callNetlifyFunction(
  'custom-function',
  { param1: 'value1' }
);
```

**`getStatus()`**
Get connection status
```javascript
const status = window.MerlinBackend.getStatus();
// {
//   connected: true,
//   supabaseConfigured: true,
//   offlineQueueSize: 0,
//   offlineModeEnabled: true
// }
```

### BackendAPI Helper Functions

**`callFunction(functionName, payload)`**
Call any Netlify Function
```javascript
const result = await window.BackendAPI.callFunction('my-function', {
  key: 'value'
});
```

**`getAllAgents()`**
Get all agents from backend
```javascript
const agents = await window.BackendAPI.getAllAgents();
```

**`getAgentJobs(agentId)`**
Get agent job history
```javascript
const jobs = await window.BackendAPI.getAgentJobs('agent-001');
```

**`healthCheck()`**
Check backend health
```javascript
const health = await window.BackendAPI.healthCheck();
```

**`spawnAgent(agentType, config)`**
Spawn agent via backend API
```javascript
const result = await window.BackendAPI.spawnAgent('seeker', {
  scanInterval: 300
});
```

**`assignTask(agentId, taskType, data, priority)`**
Assign task via backend API
```javascript
const result = await window.BackendAPI.assignTask(
  'agent-001',
  'discover',
  { skills: ['react'] },
  8
);
```

## 📊 Database Schema

### Tables

**`merlin_agents`** - Agent state and configuration
- `id` (UUID) - Primary key
- `agent_id` (VARCHAR) - Unique agent identifier
- `agent_type` (VARCHAR) - Type (seeker, learner, etc.)
- `state` (JSONB) - Current state
- `config` (JSONB) - Configuration
- `status` (VARCHAR) - active/retired
- `capabilities` (JSONB) - Agent capabilities
- `metrics` (JSONB) - Performance metrics

**`merlin_jobs`** - Job history and queue
- `id` (UUID) - Primary key
- `agent_id` (VARCHAR) - Agent identifier
- `job_type` (VARCHAR) - Job type
- `job_data` (JSONB) - Job details
- `status` (VARCHAR) - pending/completed/failed
- `priority` (INTEGER) - Priority (1-10)
- `result` (JSONB) - Job result
- `started_at` (TIMESTAMPTZ) - Start time
- `completed_at` (TIMESTAMPTZ) - Completion time

**`merlin_audit_logs`** - Complete audit trail
- `id` (UUID) - Primary key
- `agent_id` (VARCHAR) - Agent identifier
- `event_type` (VARCHAR) - Event type
- `event_data` (JSONB) - Event details
- `timestamp` (TIMESTAMPTZ) - Event timestamp

**`merlin_knowledge`** - Learning engine data
- `id` (UUID) - Primary key
- `knowledge_type` (VARCHAR) - Type of knowledge
- `category` (VARCHAR) - Category
- `title` (VARCHAR) - Title
- `content` (TEXT) - Content
- `confidence_score` (NUMERIC) - Confidence (0-1)
- `usage_count` (INTEGER) - Times used

**`merlin_enhancements`** - System improvements
- `id` (UUID) - Primary key
- `enhancement_type` (VARCHAR) - Type
- `title` (VARCHAR) - Title
- `description` (TEXT) - Description
- `code_change` (TEXT) - Code changes
- `impact_score` (NUMERIC) - Impact (0-1)
- `status` (VARCHAR) - pending/applied/rolled-back

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Environment variables** for sensitive credentials
- **CORS** properly configured for Netlify Functions
- **Rate limiting** available in backend configuration
- **Offline queue** persisted in localStorage (client-side only)

## 🐛 Troubleshooting

### Backend not connecting

1. Check environment variables in Netlify dashboard
2. Verify Supabase project is active
3. Check browser console for errors
4. Click backend status indicator (bottom-right) for details

### Offline queue growing

1. Check internet connection
2. Verify Supabase credentials
3. Check Supabase project status
4. Queue auto-processes when connection restored

### Netlify Functions failing

1. Check function logs in Netlify dashboard
2. Verify environment variables are set
3. Check function timeout (10 second limit)
4. Review function deployment status

## 📈 Monitoring

### Backend Status Indicator

A status indicator appears in the bottom-right corner:
- 🟢 **Green**: Backend connected
- 🟡 **Yellow**: Local-only mode (offline)

Click the indicator to see:
- Connection status
- Supabase configuration
- Offline queue size
- Current health stats

### Health Checks

Automatic health checks run every 60 seconds:
```javascript
// Manual health check
const health = await window.BackendAPI.healthCheck();
console.log(health);
// {
//   success: true,
//   status: 'healthy',
//   stats: {
//     totalAgents: 5,
//     activeAgents: 3,
//     pendingJobs: 2
//   }
// }
```

## 🎓 Examples

### Complete Agent Lifecycle

```javascript
// 1. Spawn agent via backend
const spawnResult = await window.BackendAPI.spawnAgent('seeker', {
  scanInterval: 300,
  skills: ['react', 'node.js']
});

const agentId = spawnResult.agent.agent_id;

// 2. Assign task
const taskResult = await window.BackendAPI.assignTask(
  agentId,
  'discover',
  { keywords: ['remote', 'senior'] },
  8
);

// 3. Check job history
const jobs = await window.BackendAPI.getAgentJobs(agentId);
console.log('Jobs:', jobs);

// 4. Query audit trail
const logs = await window.MerlinBackend.getAuditLogs({
  agentId: agentId
}, 50);
console.log('Audit logs:', logs);
```

## 🔄 Migration from Local-Only

If you've been using Merlin Hive without backend:

1. **Deploy database schema** (SQL migration)
2. **Configure environment variables** (Netlify + Supabase)
3. **Refresh page** - Backend automatically detected
4. **Existing local data** preserved in IndexedDB
5. **New operations** automatically sync to backend

## 📞 Support

- **Email**: BarbrickDesign@gmail.com
- **GitHub Issues**: [Repository Issues](https://github.com/overkor-tek/consciousness-revolution/issues)
- **Documentation**: Check `/docs` directory

## 📄 License

© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
