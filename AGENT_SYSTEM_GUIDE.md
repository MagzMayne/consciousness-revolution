# 🤖 Agent Management System - User Guide

## Overview

The Agent Management System is an autonomous platform that crawls through files, detects functionality issues, automatically applies fixes, and maintains system health through self-healing capabilities.

## Architecture

The system consists of four main components:

### 1. **Agent Logger** (`src/agents/agent-logger.js`)
- Comprehensive logging system with structured format
- Persistent storage in localStorage
- Log filtering, analysis, and export capabilities
- Supports multiple log levels: INFO, SUCCESS, WARNING, ERROR

### 2. **Management Agent** (`src/agents/management-agent.js`)
- Crawls and analyzes project files
- Detects functionality issues and broken code
- Classifies issues by severity and type
- Calculates system health scores
- Generates comprehensive reports

### 3. **Deployment Agent** (`src/agents/deployment-agent.js`)
- Applies automated fixes to detected issues
- Manages environment configuration
- Performs continuous health checks
- Self-healing capabilities with configurable intervals
- Deployment verification

### 4. **Agent Coordinator** (`src/agents/agent-coordinator.js`)
- Orchestrates all agents
- Manages task queue and prioritization
- Coordinates agent communication
- Tracks operation history
- Provides emergency controls

### 5. **PayPal Deployment Agent** (`src/agents/paypal-deployment-agent.js`)
- Deploys PayPal integration across all HTML pages
- Uses GitHub secrets (CLIENT_ID, PAYPAL_API)
- Tracks deployment status and generates reports
- Provides centralized payment processing
- Smart injection avoiding duplicate integrations

## Getting Started

### Method 1: Using the Dashboard (Recommended)

1. Open `agent-management-dashboard.html` in your browser
2. The system will automatically initialize all agents
3. Use the control panel to:
   - Start full operations
   - Perform quick health checks
   - Run file crawls
   - Apply fixes
   - Monitor real-time activity logs

### Method 2: Programmatic Usage

```javascript
// Include the agent scripts in your HTML
<script src="src/agents/agent-logger.js"></script>
<script src="src/agents/management-agent.js"></script>
<script src="src/agents/deployment-agent.js"></script>
<script src="src/agents/agent-coordinator.js"></script>

// Initialize the coordinator
const coordinator = new AgentCoordinator();

// Wait for initialization
await new Promise(resolve => setTimeout(resolve, 500));

// Start full operation
const report = await coordinator.startFullOperation();
console.log('Operation complete:', report);
```

## Features

### File Crawling & Analysis

The Management Agent automatically:
- Discovers all HTML, JavaScript, and CSS files
- Analyzes each file for common issues
- Checks for:
  - Broken links and references
  - Missing dependencies
  - Syntax errors
  - Security vulnerabilities
  - Dead code
  - Performance issues

### Automatic Fixes

The Deployment Agent can automatically fix:
- Missing scripts or dependencies
- Configuration issues
- Environment setup problems
- Self-healing system issues

### Health Monitoring

Continuous monitoring includes:
- localStorage accessibility
- DOM integrity
- Script availability
- Network connectivity
- Overall system health

### Self-Healing

The system automatically:
- Performs health checks at configurable intervals (default: 5 minutes)
- Detects system issues
- Applies fixes when possible
- Logs all healing activities

## Configuration

### Environment Configuration

The Deployment Agent supports these configuration options:

```javascript
{
  autoFix: true,              // Enable automatic fixes
  autoHeal: true,             // Enable self-healing
  backupBeforeFix: true,      // Backup before applying fixes
  notifyOnFix: true,          // Notify when fixes are applied
  maxAutoFixes: 10,           // Maximum automatic fixes per session
  healingInterval: 300000,    // Healing check interval (ms)
  features: {
    walletIntegration: true,
    agentSystem: true,
    tradingSystem: true,
    securityMonitoring: true
  }
}
```

### Updating Configuration

Via Dashboard:
- Use the Configuration panel to toggle features
- Adjust healing interval and max auto-fixes
- Changes are saved automatically

Programmatically:
```javascript
coordinator.deploymentAgent.updateEnvironmentConfig({
  autoFix: false,
  healingInterval: 600000  // 10 minutes
});
```

## Operations

### Full Operation

Performs complete system analysis and maintenance:

```javascript
const report = await coordinator.startFullOperation();
```

**Phases:**
1. **Crawl** - Discover and analyze all files
2. **Health Check** - Verify system health
3. **Fix Application** - Apply automated fixes
4. **Verification** - Verify deployment integrity

**Report Structure:**
```javascript
{
  timestamp: "2025-12-18T01:00:00.000Z",
  summary: {
    totalIssuesFound: 8,
    totalFixesApplied: 2,
    healthScore: 85,
    systemStatus: "good"
  },
  phases: [...],
  agents: {...},
  recommendations: [...]
}
```

### Quick Health Check

Performs rapid system status check:

```javascript
const status = await coordinator.quickHealthCheck();
```

Returns current state of all components.

### Individual Operations

Run specific operations:

```javascript
// File crawl only
const crawlResults = await coordinator.managementAgent.startCrawl();

// Health check only
const health = await coordinator.deploymentAgent.performHealthCheck();

// Verify deployment
const verification = await coordinator.deploymentAgent.verifyDeployment();
```

## Logging

### Viewing Logs

Dashboard:
- Real-time log viewer with color-coded entries
- Filter by level, agent, or time range
- Export logs as JSON or CSV

Programmatically:
```javascript
// Get recent logs
const logs = coordinator.logger.getFilteredLogs({ limit: 50 });

// Get logs by agent
const managementLogs = coordinator.logger.getFilteredLogs({ 
  agent: 'ManagementAgent' 
});

// Get error logs
const errors = coordinator.logger.getFilteredLogs({ 
  level: 'error' 
});
```

### Log Statistics

```javascript
const stats = coordinator.logger.getStats();
// Returns: { total, byLevel, byAgent, recentActivity }
```

### Exporting Logs

Dashboard:
- Click "Export Logs" button
- Downloads JSON file with all logs

Programmatically:
```javascript
const logsJSON = coordinator.logger.exportLogs('json');
const logsCSV = coordinator.logger.exportLogs('csv');
```

## Task Queue

The coordinator maintains a task queue for managing operations:

```javascript
// Add task
const taskId = coordinator.addTask({
  type: 'health-check',
  priority: 'high'
});

// Tasks are processed automatically
// Check status
const status = coordinator.getStatus();
console.log('Queued tasks:', status.coordinator.queuedTasks);
```

**Task Types:**
- `crawl` - Run file crawl
- `health-check` - Perform health check
- `fix` - Apply fixes
- `verify` - Verify deployment
- `full-operation` - Complete operation

## Operation History

Track all operations:

```javascript
// Get recent history
const history = coordinator.getHistory(10);

// Clear history
coordinator.clearHistory();
```

## Emergency Controls

### Emergency Stop

Immediately halt all operations:

```javascript
coordinator.emergencyStop();
```

Dashboard:
- Click "Emergency Stop" button
- Confirms before stopping

### Clear Logs

Remove all logs:

```javascript
coordinator.logger.clearLogs();
```

### Clear Old Logs

Remove logs older than specified days:

```javascript
coordinator.logger.clearOldLogs(7); // Keep last 7 days
```

## Health Scores

The system calculates health scores based on issues found:

- **100-95**: Excellent - No issues
- **94-80**: Good - Minor issues
- **79-60**: Needs Attention - Multiple issues
- **59-0**: Critical - Major issues

**Scoring:**
- Each high-severity issue: -10 points
- Each medium-severity issue: -5 points
- Each issue overall: -2 points

## Best Practices

1. **Regular Monitoring**
   - Check dashboard daily
   - Review health scores
   - Monitor applied fixes

2. **Configuration**
   - Enable auto-fix for development
   - Increase healing interval for production
   - Set appropriate max auto-fixes limit

3. **Logging**
   - Export logs weekly for analysis
   - Clear old logs monthly
   - Monitor error logs closely

4. **Testing**
   - Run full operation after major changes
   - Verify deployment before releases
   - Use quick health checks frequently

5. **Emergency Procedures**
   - Know how to use emergency stop
   - Keep configuration backups
   - Document manual fix procedures

## Troubleshooting

### Issue: Agent not initializing

**Solution:**
```javascript
// Check if scripts are loaded
console.log(typeof AgentLogger);
console.log(typeof ManagementAgent);
console.log(typeof DeploymentAgent);
console.log(typeof AgentCoordinator);
```

### Issue: Health checks failing

**Solution:**
```javascript
// Check individual components
const checks = {
  localStorage: coordinator.deploymentAgent.checkLocalStorage(),
  dom: coordinator.deploymentAgent.checkDOM(),
  scripts: coordinator.deploymentAgent.checkScripts(),
  connectivity: coordinator.deploymentAgent.checkConnectivity()
};
console.log('Component checks:', checks);
```

### Issue: Fixes not applying

**Solution:**
```javascript
// Check configuration
console.log(coordinator.deploymentAgent.environmentConfig);

// Ensure autoFix is enabled
coordinator.deploymentAgent.updateEnvironmentConfig({ autoFix: true });
```

### Issue: High memory usage

**Solution:**
```javascript
// Clear old logs
coordinator.logger.clearOldLogs(7);

// Clear history
coordinator.clearHistory();
```

## API Reference

### AgentLogger

- `log(level, agent, action, details, result)` - Create log entry
- `info/success/warn/error(agent, action, details, result)` - Convenience methods
- `getFilteredLogs(filters)` - Get filtered logs
- `getStats()` - Get statistics
- `exportLogs(format)` - Export logs
- `clearLogs()` - Clear all logs
- `clearOldLogs(daysToKeep)` - Clear old logs

### ManagementAgent

- `startCrawl()` - Start file crawl
- `getStatus()` - Get agent status

### DeploymentAgent

- `performHealthCheck()` - Perform health check
- `verifyDeployment()` - Verify deployment
- `updateEnvironmentConfig(updates)` - Update configuration
- `toggleFeature(name, enabled)` - Toggle feature
- `getStatus()` - Get agent status
- `getFixHistory()` - Get fix history

### AgentCoordinator

- `startFullOperation()` - Start full operation
- `quickHealthCheck()` - Quick health check
- `addTask(task)` - Add task to queue
- `getStatus()` - Get coordinator status
- `getHistory(limit)` - Get operation history
- `clearHistory()` - Clear history
- `emergencyStop()` - Emergency stop

## Testing

Run the test suite:

```bash
node test-agent-system.js
```

Tests verify:
- All components initialize correctly
- Logging system works
- File crawling functions
- Health checks operate
- Fix application works
- Task queue processes correctly
- Full operations complete successfully

## PayPal Integration

The repository includes a comprehensive PayPal integration system managed by agents.

### Quick Start

```bash
# Set GitHub secrets
export PAYPAL_CLIENT_ID="your_client_id"
export PAYPAL_API="your_api_endpoint"  # Optional

# Deploy PayPal integration to all HTML pages
node deploy-paypal-integration.js
```

### Key Files

- `src/utils/paypal-integration.js` - Centralized PayPal integration script
- `src/agents/paypal-deployment-agent.js` - Browser-based deployment agent
- `deploy-paypal-integration.js` - Node.js deployment script
- `PAYPAL_INTEGRATION_GUIDE.md` - Complete PayPal integration documentation

### GitHub Secrets Required

1. **PAYPAL_CLIENT_ID** (Required) - Your PayPal client ID
2. **PAYPAL_API** (Optional) - Your PayPal API endpoint

See `PAYPAL_INTEGRATION_GUIDE.md` for complete documentation.

## Support

For issues or questions:
1. Check the logs for error messages
2. Review this guide
3. Run the test suite
4. Check the dashboard status indicators
5. For PayPal issues, see `PAYPAL_INTEGRATION_GUIDE.md`

## Version

Current version: 1.0.0
Last updated: December 19, 2025

---

**Note:** This is an autonomous system. Always monitor operations and review automated fixes before deploying to production.
