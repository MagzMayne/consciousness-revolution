# AUL (AI Universal Language) Protocol Specification

> **Universal communication protocol for autonomous agents and AI systems**

---

## 🎯 Overview

The AUL Protocol provides a standardized, framework-agnostic communication layer for autonomous agents, enabling:
- ✅ **Speed enhancements** through optimized message routing
- ✅ **Universal agent interoperability** across Python/JavaScript/any language
- ✅ **Consistent lifecycle management** for all agent types
- ✅ **Unified error handling** and recovery protocols
- ✅ **Cross-platform state synchronization**

---

## 📋 Core Principles

1. **Language Agnostic** - Works across Python, JavaScript, and any language
2. **Fast by Design** - Minimal overhead, optimized for speed
3. **Self-Describing** - Messages contain all context needed
4. **Fail-Safe** - Built-in error handling and recovery
5. **Observable** - Full traceability of agent actions

---

## 🔌 Universal Message Envelope

All inter-agent communication uses the **AUL Message Envelope** format:

```json
{
  "aul_version": "1.0",
  "message_id": "uuid-v4",
  "timestamp": "ISO-8601",
  "sender": {
    "agent_id": "agent-unique-id",
    "agent_type": "orchestrator|brain|api|monitor|daemon",
    "version": "1.0.0",
    "capabilities": ["read", "write", "execute", "heal"]
  },
  "recipient": {
    "agent_id": "target-agent-id",
    "routing": "direct|broadcast|conditional"
  },
  "message": {
    "type": "command|query|response|event|heartbeat",
    "priority": "critical|high|normal|low",
    "payload": {},
    "ttl": 300
  },
  "context": {
    "correlation_id": "parent-message-id",
    "domain": 1-7,
    "session_id": "session-uuid",
    "trace": []
  },
  "security": {
    "auth_token": "optional-token",
    "permissions": ["scope1", "scope2"],
    "signature": "optional-hmac"
  }
}
```

---

## 🤖 Agent Capability Declaration

Every agent must register with a **capability declaration**:

```json
{
  "agent_id": "cyclotron-brain-01",
  "agent_type": "brain",
  "version": "1.0.0",
  "status": "active|idle|error|offline",
  "capabilities": {
    "actions": ["analyze", "store", "retrieve", "pattern_match"],
    "inputs": ["text", "json", "events"],
    "outputs": ["insights", "patterns", "recommendations"],
    "max_throughput": 100,
    "avg_latency_ms": 50
  },
  "health": {
    "uptime_seconds": 3600,
    "last_heartbeat": "ISO-8601",
    "memory_mb": 512,
    "cpu_percent": 15.5,
    "error_count": 0,
    "success_rate": 99.9
  },
  "endpoints": {
    "health": "/agent/health",
    "execute": "/agent/execute",
    "status": "/agent/status"
  }
}
```

---

## 🔄 Agent Lifecycle Management

### Registration Phase
```
1. Agent starts
2. Loads AUL base class
3. Declares capabilities
4. Registers with Agent Registry
5. Subscribes to message bus
6. Sends first heartbeat
```

### Operational Phase
```
1. Listens for messages on bus
2. Processes based on capabilities
3. Sends responses/events
4. Updates health metrics
5. Periodic heartbeats (every 30s)
```

### Shutdown Phase
```
1. Receives shutdown signal
2. Completes in-flight tasks
3. Persists state
4. Deregisters from registry
5. Sends final status
6. Closes connections
```

---

## ⚡ Speed Optimization Features

### 1. Message Routing
- **Direct routing** - Agent-to-agent (fastest)
- **Broadcast** - One-to-many with filters
- **Conditional** - Rule-based routing

### 2. Caching Layer
- **Agent capabilities** cached in memory
- **Frequent queries** cached with TTL
- **State snapshots** for fast recovery

### 3. Async Processing
- **Non-blocking** message handling
- **Parallel execution** where possible
- **Priority queues** for critical messages

### 4. Connection Pooling
- **Persistent connections** between agents
- **HTTP/2** for multiplexing
- **WebSocket** for real-time updates

---

## 🏥 Health Check Protocol

Every agent must implement standardized health checks:

```json
{
  "healthy": true,
  "status": "operational|degraded|failed",
  "checks": {
    "connectivity": { "ok": true, "latency_ms": 5 },
    "memory": { "ok": true, "used_percent": 45.2 },
    "cpu": { "ok": true, "used_percent": 15.5 },
    "disk": { "ok": true, "used_percent": 60.0 },
    "dependencies": { "ok": true, "available": 5, "total": 5 }
  },
  "metrics": {
    "requests_per_second": 12.5,
    "avg_response_ms": 45,
    "error_rate_percent": 0.1
  },
  "last_check": "ISO-8601"
}
```

---

## 🔧 Error Handling & Recovery

### Error Classification
- **L1: Transient** - Retry automatically (network blips)
- **L2: Degraded** - Continue with reduced functionality
- **L3: Critical** - Escalate to orchestrator
- **L4: Fatal** - Shutdown and alert

### Recovery Protocol
```python
def handle_error(error):
    if error.level == "L1":
        return retry_with_backoff()
    elif error.level == "L2":
        return enable_fallback_mode()
    elif error.level == "L3":
        return escalate_to_orchestrator()
    else:  # L4
        return graceful_shutdown()
```

### Exponential Backoff
- **Initial delay**: 100ms
- **Max delay**: 30s
- **Max retries**: 5
- **Jitter**: ±20%

---

## 📊 State Synchronization

### State Types
1. **Ephemeral** - In-memory only, lost on restart
2. **Persistent** - Saved to disk/database
3. **Distributed** - Synced across agents
4. **Immutable** - Write-once, read-many

### Sync Protocol
```json
{
  "state_id": "uuid",
  "state_type": "ephemeral|persistent|distributed",
  "version": 1,
  "data": {},
  "checksum": "sha256-hash",
  "updated_at": "ISO-8601",
  "sync_strategy": "immediate|batched|eventual"
}
```

---

## 🎯 Message Types

### 1. Command
Execute an action on target agent
```json
{
  "type": "command",
  "payload": {
    "action": "analyze_pattern",
    "params": { "text": "...", "mode": "deep" }
  }
}
```

### 2. Query
Request information from agent
```json
{
  "type": "query",
  "payload": {
    "query": "get_health_status",
    "filters": { "agent_type": "brain" }
  }
}
```

### 3. Response
Reply to command or query
```json
{
  "type": "response",
  "payload": {
    "success": true,
    "data": {},
    "execution_time_ms": 45
  }
}
```

### 4. Event
Notify about state change
```json
{
  "type": "event",
  "payload": {
    "event_name": "pattern_detected",
    "data": { "pattern_type": "manipulation", "confidence": 0.95 }
  }
}
```

### 5. Heartbeat
Periodic health signal
```json
{
  "type": "heartbeat",
  "payload": {
    "status": "active",
    "uptime": 3600,
    "load": 15.5
  }
}
```

---

## 🔐 Security Features

### Authentication
- **Agent tokens** for identity verification
- **Mutual TLS** for encrypted communication
- **Token rotation** every 24 hours

### Authorization
- **Capability-based** access control
- **Permission scopes** per action
- **Audit logging** of all operations

### Message Integrity
- **HMAC signatures** for message validation
- **Replay protection** with nonces
- **Encryption** for sensitive data

---

## 📈 Performance Metrics

Track these metrics for every agent:

- **Throughput**: Messages processed per second
- **Latency**: Average response time (ms)
- **Error rate**: Percentage of failed operations
- **Availability**: Uptime percentage
- **Resource usage**: CPU, memory, disk
- **Queue depth**: Pending messages

---

## 🚀 Implementation Guidelines

### Python Agents
```python
from aul_agent_base import AULAgent

class MyAgent(AULAgent):
    def __init__(self):
        super().__init__(
            agent_id="my-agent-01",
            agent_type="custom",
            capabilities=["read", "analyze"]
        )
    
    def handle_message(self, message):
        # Process AUL message
        pass
```

### JavaScript Agents
```javascript
import { AULAgent } from './aul-agent-base.js';

class MyAgent extends AULAgent {
    constructor() {
        super({
            agentId: 'my-agent-01',
            agentType: 'custom',
            capabilities: ['read', 'analyze']
        });
    }
    
    handleMessage(message) {
        // Process AUL message
    }
}
```

---

## 🔗 Integration with Existing Systems

### GLYPH Integration
- AUL envelope contains GLYPH coordinates
- GLYPH patterns enhance AUL context
- Base-60 encoding for performance

### Cyclotron Integration
- All messages stored as atoms
- Pattern detection on message flows
- Vortex dynamics for prioritization

### ARAYA Integration
- ARAYA speaks AUL natively
- File operations wrapped in AUL
- Permission model aligned

---

## 📚 Reference Implementation

See:
- `aul_agent_base.py` - Python base class
- `aul_message_bus.py` - Central message router
- `aul_agent_registry.py` - Agent discovery service
- `js/aul-agent-base.js` - JavaScript base class
- `js/aul-router.js` - JavaScript message router

---

## 🎓 Best Practices

1. **Always use message envelopes** - Never send raw payloads
2. **Declare capabilities accurately** - Enables smart routing
3. **Send heartbeats regularly** - 30s interval recommended
4. **Handle errors gracefully** - Use recovery protocols
5. **Log with correlation IDs** - Enables trace debugging
6. **Cache when possible** - Reduces latency
7. **Use async patterns** - Maximizes throughput
8. **Version your agents** - Enables compatibility checks

---

## 📖 Version History

- **v1.0** (2026-02-14) - Initial AUL protocol specification

---

**Built for the Consciousness Revolution** - Universal language for autonomous AI agents.
