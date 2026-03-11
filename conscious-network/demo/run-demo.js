/**
 * Demo: End-to-End Conscious Network Flow
 *
 * This script starts all 7 agents in a single process, sends a message,
 * and shows the resulting event flow in the console.
 *
 * Usage:
 *   node demo/run-demo.js
 *
 * Environment variables:
 *   DEMO_MESSAGE   Text to send (default: "Hello, Conscious Network!")
 */

'use strict';

const { InMemoryEventBus } = require('../core/event-bus');
const { StateStore } = require('../core/state');

const { CommunicationAgent } = require('../agents/communication');
const { CoordinationAgent } = require('../agents/coordination');
const { LearningAgent } = require('../agents/learning');
const { AdaptationAgent } = require('../agents/adaptation');
const { ActionAgent } = require('../agents/action');
const { ReflectionAgent } = require('../agents/reflection');
const { CreationAgent } = require('../agents/creation');

// ─── Shared infrastructure ───────────────────────────────────────────────────

const bus = new InMemoryEventBus();
const state = new StateStore();
const shared = { bus, state, healthPort: null };

// ─── Instantiate all agents ──────────────────────────────────────────────────

const comm    = new CommunicationAgent({ ...shared, httpPort: 3100 });
const coord   = new CoordinationAgent(shared);
const learn   = new LearningAgent({ ...shared, httpPort: 3102, insightIntervalMs: 15_000 });
const adapt   = new AdaptationAgent(shared);
const action  = new ActionAgent({ ...shared, safeMode: true });
const reflect = new ReflectionAgent({ ...shared, reflectionIntervalMs: 20_000 });
const create  = new CreationAgent(shared);

// ─── Event tracer (observability) ────────────────────────────────────────────

const BOLD  = '\x1b[1m';
const CYAN  = '\x1b[36m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

const TOPIC_COLOR = {
  'communication.inbound':  '\x1b[34m',  // blue
  'communication.outbound': '\x1b[32m',  // green
  'creation.request':       '\x1b[35m',  // magenta
  'creation.output':        '\x1b[33m',  // yellow
  'experience.event':       '\x1b[36m',  // cyan
  'learning.insight':       '\x1b[96m',  // bright cyan
  'reflection.summary':     '\x1b[93m',  // bright yellow
  'adaptation.change':      '\x1b[91m',  // bright red
  'action.request':         '\x1b[31m',  // red
  'action.result':          '\x1b[90m',  // gray
};

bus.subscribe('*', (msg) => {
  const color = TOPIC_COLOR[msg.topic] || '\x1b[37m';
  const ts = new Date(msg.timestamp).toISOString().slice(11, 23);
  const cid = msg.correlationId ? msg.correlationId.slice(0, 8) : '--------';
  console.log(
    `${color}[${ts}] [cid:${cid}] ← ${msg.topic} (${msg.type}) from:${msg.source}${RESET}`,
  );
});

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const message = process.env.DEMO_MESSAGE || 'Hello, Conscious Network!';

  console.log(`\n${BOLD}${CYAN}╔═══════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   Conscious Network — Live Demo            ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚═══════════════════════════════════════════╝${RESET}\n`);

  // 1. Start all agents
  console.log(`${BOLD}Starting all 7 agents...${RESET}`);
  await Promise.all([
    comm.start(),
    coord.start(),
    learn.start(),
    adapt.start(),
    action.start(),
    reflect.start(),
    create.start(),
  ]);
  console.log(`${GREEN}✓ All agents running${RESET}\n`);

  // 2. Send the demo message
  console.log(`${BOLD}Sending message:${RESET} "${message}"\n`);
  console.log('─── Event Flow ──────────────────────────────────────\n');

  const startMsg = await comm.injectMessage(message);

  // 3. Wait for the flow to complete
  await sleep(1500);

  // 4. Show current state stats
  const stats = state.stats();
  console.log('\n─── State Snapshot ──────────────────────────────────\n');
  console.log(`  Working memory keys:  ${stats.workingMemoryKeys}`);
  console.log(`  Knowledge base keys:  ${stats.knowledgeKeys}`);
  console.log(`  Event streams:`);
  for (const [stream, count] of Object.entries(stats.streams)) {
    console.log(`    ${stream}: ${count} event(s)`);
  }

  // 5. Trigger a reflection manually
  console.log('\n─── Triggering Reflection ───────────────────────────\n');
  const summary = await reflect.triggerReflection();
  console.log(`\n  Narrative: ${summary.narrative}`);

  // 6. Trigger learning insight
  console.log('\n─── Triggering Learning Insight ─────────────────────\n');
  await learn._emitInsight();
  await sleep(200);

  // 7. Show learning counts
  const counts = state.get_knowledge('learning.counts') || {};
  console.log('\n─── Learning Counts ─────────────────────────────────\n');
  for (const [k, v] of Object.entries(counts).slice(0, 10)) {
    console.log(`  ${k}: ${v}`);
  }

  console.log(`\n${BOLD}${GREEN}Demo complete!${RESET}`);
  console.log(`\nThe Communication Agent HTTP API is listening on :3100`);
  console.log(`Try: curl -X POST http://localhost:3100/api/message -H 'Content-Type: application/json' -d '{"text":"Your message"}'`);
  console.log(`\nPress Ctrl+C to stop.\n`);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

main().catch((err) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
