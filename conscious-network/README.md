# Conscious Network

A modular, production-grade **multi-agent conscious network** composed of 7 composable services that together form an event-driven, observable, and extensible distributed system.

---

## Architecture Overview

```
                ┌─────────────────────────────────────────────┐
                │              EVENT BUS (pub/sub)             │
                │    Topics · Message types · Correlation IDs  │
                │        Retry / Dead-letter queue             │
                └──────────────────┬──────────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────────┐
           │                       │                           │
    INPUT PILLAR            PROCESSING PILLAR          OUTPUT PILLAR
           │                       │                           │
  ┌────────▼────────┐    ┌─────────▼──────────┐    ┌──────────▼──────────┐
  │ Communication   │    │  Coordination       │    │  Creation           │
  │ Agent           │    │  Agent              │    │  Agent              │
  │ :3100/api/      │    │  Routing table      │    │  Generate replies   │
  │ message         │    │  Workflow policy    │    │  plans, artifacts   │
  └────────┬────────┘    └────────┬────────────┘    └─────────────────────┘
           │                      │
           │             ┌────────▼────────┐
           │             │  Learning Agent │
           │             │  :3102/learning │
           │             │  /query         │
           │             └────────┬────────┘
           │                      │
           │             ┌────────▼────────┐
           │             │  Adaptation     │
           │             │  Agent          │
           │             │  Adjusts rules  │
           │             └────────┬────────┘
           │                      │
           │             ┌────────▼────────┐
           │             │  Reflection     │
           │             │  Agent          │
           │             │  Periodic meta  │
           │             │  summaries      │
           │             └─────────────────┘
           │
  ┌────────▼────────┐
  │  Action Agent   │
  │  Safe by default│
  │  (logs only)    │
  └─────────────────┘
```

### The Three Pillars

| Pillar | Agents | Role |
|--------|--------|------|
| **Input** | Communication | Ingest messages from external interfaces; normalize to internal events |
| **Processing** | Coordination, Learning, Adaptation, Reflection | Orchestrate, observe, adapt, and synthesize |
| **Output** | Creation, Action | Generate artifacts; act in the world (safely gated) |

---

## The 7 Agents

| # | Agent | Topic(s) subscribed | Publishes | Port |
|---|-------|---------------------|-----------|------|
| 1 | **Communication** | `communication.outbound` | `communication.inbound` | 3100 |
| 2 | **Coordination** | `communication.inbound`, `creation.output`, `action.request` | `creation.request`, `experience.event`, `communication.outbound`, `action.task` | — |
| 3 | **Learning** | `experience.event`, `creation.output`, `communication.*`, `reflection.summary` | `learning.insight` | 3102 |
| 4 | **Adaptation** | `learning.insight` | `adaptation.change` | — |
| 5 | **Action** | `action.request`, `action.task` | `action.result` | — |
| 6 | **Reflection** | _(schedule + `reflection.trigger`)_ | `reflection.summary` | — |
| 7 | **Creation** | `creation.request` | `creation.output` | — |

---

## End-to-End Flow

```
User ──HTTP POST──▶ Communication Agent
                         │
                         │ publishes communication.inbound
                         ▼
                   Coordination Agent
                         │
                   ┌─────┴──────────────┐
                   │                    │
    publishes creation.request    publishes experience.event
                   │                    │
                   ▼                    ▼
             Creation Agent      Learning Agent
                   │               (observes)
    publishes creation.output
                   │
                   ▼
             Coordination Agent
                   │
    publishes communication.outbound
                   │
                   ▼
           Communication Agent ──HTTP reply──▶ User

                         ...later...

             Reflection Agent  (periodic schedule)
                   │
    emits reflection.summary → Learning Agent observes it
    
             Learning Agent  (periodic insight)
                   │
    emits learning.insight → Adaptation Agent
                   │
    Adaptation adjusts routing priorities / feature flags
    emits adaptation.change
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Docker + Docker Compose (optional)

### Run locally (all 7 agents, single process)

```bash
cd conscious-network
node demo/run-demo.js
# or
npm start
```

This starts all agents, sends a demo message, and prints the full event flow.

### Send a message via HTTP

With the demo running (`npm start`), in another terminal:

```bash
# Fire-and-forget (async)
curl -X POST http://localhost:3100/api/message \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello, conscious network!"}'

# Wait for the generated reply (synchronous, 10s timeout)
curl -X POST http://localhost:3100/api/message \
  -H 'Content-Type: application/json' \
  -d '{"text":"What can you do?","waitForReply":true}'

# Query what the Learning agent has observed
curl http://localhost:3102/learning/query?prefix=learning.
```

### Run with Docker

```bash
cd conscious-network

# Build and start
docker compose up --build

# In another terminal
curl -X POST http://localhost:3100/api/message \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello from Docker!"}'
```

---

## Running Tests

```bash
cd conscious-network

# All tests (unit + integration)
npm test

# Unit tests only
npm run test:unit

# Integration test only
npm run test:integration
```

### Test structure

```
conscious-network/
├── core/
│   ├── event-bus/event-bus.test.js    (10 tests)
│   └── state/state.test.js            (12 tests)
├── agents/
│   ├── communication/tests/           (5 tests)
│   ├── coordination/tests/            (5 tests)
│   ├── learning/tests/                (6 tests)
│   ├── adaptation/tests/              (5 tests)
│   ├── action/tests/                  (6 tests)
│   ├── reflection/tests/              (7 tests)
│   └── creation/tests/                (6 tests)
└── integration.test.js                (8 tests)
                                   ───────────
                                    70 total
```

---

## Directory Structure

```
conscious-network/
├── core/
│   ├── event-bus/index.js      InMemoryEventBus — pluggable pub/sub
│   ├── state/index.js          StateStore SDK (working memory + knowledge base + streams)
│   └── runtime/index.js        AgentRuntime base class
├── agents/
│   ├── communication/          HTTP ingest + relay
│   ├── coordination/           Routing + workflow orchestration
│   ├── learning/               Event observation + knowledge accumulation
│   ├── adaptation/             Behavior adjustment based on insights
│   ├── action/                 Safe real-world action execution
│   ├── reflection/             Periodic meta-summaries
│   └── creation/               Artifact + reply generation
├── demo/run-demo.js            All-in-one interactive demo
├── integration.test.js         End-to-end flow test
├── docker-compose.yml
├── Dockerfile                  All-in-one image
└── package.json
```

---

## Shared State SDK

Every agent gets access to `StateStore` via `this.state`:

```js
// Working memory (fast, ephemeral)
this.state.set_state('my.key', value);
const v = this.state.get_state('my.key');

// Long-term knowledge
this.state.set_knowledge('model.accuracy', 0.95);
const results = this.state.query_knowledge({ prefix: 'model.' });

// Append-only event streams
this.state.append_event('my.stream', { data: 'payload' });
const recent = this.state.read_stream('my.stream', { fromSeq: 10, limit: 50 });

// Recent events across all streams (for Reflection)
const allRecent = this.state.recent_events(20);
```

---

## Event Message Format

Every event on the bus is a standard envelope:

```js
{
  id:            "uuid",              // unique per message
  topic:         "communication.inbound",
  type:          "UserMessage",
  payload:       { text: "Hello!" },
  source:        "communication",     // originating agent
  correlationId: "uuid",              // ties a conversation thread together
  traceId:       "uuid",              // distributed tracing
  timestamp:     "2024-01-01T00:00:00.000Z",
  retryCount:    0
}
```

---

## Adding a New Agent

1. **Create the module directory**

```bash
mkdir -p conscious-network/agents/my-agent/tests
```

2. **Implement the agent** (`conscious-network/agents/my-agent/index.js`)

```js
'use strict';
const { AgentRuntime } = require('../../core/runtime');

class MyAgent extends AgentRuntime {
  constructor(config = {}) {
    super('my-agent', config);
  }

  async _registerSubscriptions() {
    this.subscribe('some.topic', (msg) => this._handle(msg));
  }

  async _handle(msg) {
    this.log('info', 'received message', { type: msg.type });
    await this.publish('my-agent.output', 'MyOutput', { result: '...' }, {
      correlationId: msg.correlationId,
    });
  }
}

module.exports = { MyAgent };

if (require.main === module) {
  new MyAgent().start();
}
```

3. **Add routing rules** in `Coordination Agent` or update `coordination.routingTable` in shared state.

4. **Write tests** following the pattern in `agents/*/tests/*.test.js`.

5. **Add to `demo/run-demo.js`** to include in the all-in-one demo.

6. **Add a Dockerfile** based on any existing agent Dockerfile.

---

## Safety & Security

### Action Agent Safe Mode

The Action Agent is **safe by default**: it logs every action request but takes no real-world action.

To enable a specific action mapping:

```js
// In your configuration or startup code:
actionAgent.registerMapping('sendSlackMessage', {
  kind: 'webhook',
  url: 'https://hooks.slack.com/...',
});

// Disable safe mode explicitly:
const actionAgent = new ActionAgent({ safeMode: false });
```

Or via environment variable:
```bash
ACTION_SAFE_MODE=false  # enables real-world execution
```

All executed actions are audited in the `action.audit` event stream.

### No External Dependencies

The entire system runs with **zero npm dependencies** — only Node.js built-ins. This minimizes the supply-chain attack surface.

---

## CI/CD

GitHub Actions workflow: `.github/workflows/conscious-network-ci.yml`

- Runs unit + integration tests on Node 18 and 20
- Builds and smoke-tests the Docker image
- Posts a summary comment on PRs

---

## Extending the Event Bus

To replace the in-memory bus with a real broker:

1. Implement the same interface as `InMemoryEventBus` (`subscribe`, `publish`, `unsubscribe`).
2. Pass your implementation when constructing agents:

```js
const bus = new MyNATSBus({ url: 'nats://localhost:4222' });
const agent = new CommunicationAgent({ bus });
```

3. Uncomment the NATS service in `docker-compose.yml`.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `COMMUNICATION_HTTP_PORT` | `3100` | Communication Agent API port |
| `LEARNING_HTTP_PORT` | `3102` | Learning Agent query port |
| `ACTION_SAFE_MODE` | `true` | `false` to enable real-world actions |
| `LOG_LEVEL` | `info` | `debug` for verbose output |

---

## Contact

Part of the [Consciousness Revolution](https://github.com/overkor-tek/consciousness-revolution) platform.  
Maintainer: BarbrickDesign@gmail.com
