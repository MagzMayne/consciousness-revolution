const fs = require('fs');
const path = require('path');
const { checkAgentHealth } = require('./watchdog');

// ─── Lockfile: Prevent double runs ────────────────────────────────────────────
const LOCK = path.join(__dirname, '..', 'engine', 'engine.lock');
if (fs.existsSync(LOCK)) {
  console.log('⛔ Engine already running — exiting.');
  process.exit(0);
}
fs.writeFileSync(LOCK, Date.now().toString());

// ─── Agent IDs (sub-directories under agents/ that contain latest.json) ───────
const AGENT_IDS = [
  'agent-coordinator',
  'application-submission-agent',
  'automation-assistance-agent',
  'celebrity-outreach-agent',
  'cleardebt-agent-system',
  'config-compliance-agent',
  'contract-seeker-agent',
  'delivery-operations-agent',
  'deployment-agent',
  'device-identification-agent',
  'echo-script-injection-agent',
  'file-evaluation-orchestrator',
  'file-usage-agent',
  'github-pr-review-agent',
  'js-css-quality-agent',
  'management-agent',
  'marketing-agent',
  'merge-coordinator-agent',
  'mobile-power-grid-agent',
  'moltbook-guardian-agent',
  'monitoring-agent-polymorphic',
  'network-crawler-agent',
  'paypal-deployment-agent',
  'pigeon-navigation-agent',
  'proposal-generator-agent',
  'report-generator-agent',
  'signature-management-agent',
  'swarm-orchestrator',
  'worm-agent',
  'worm-coordinator',
];

async function activateAll() {
  console.log(`🚀 Activating ${AGENT_IDS.length} agents…`);

  for (const agentId of AGENT_IDS) {
    // ─── Watchdog health check ───────────────────────────────────────────────
    const health = checkAgentHealth(agentId);
    if (!health.ok) {
      console.log(`⚠️ Skipping ${agentId}: ${health.reason}`);
      continue;
    }

    // ─── Global backpressure: stagger execution to avoid rate-limit cascades ─
    await new Promise(r => setTimeout(r, 500 + Math.random() * 750));

    console.log(`✅ Activating agent: ${agentId}`);
    // Agent-specific activation logic would be wired here.
  }

  // ─── Release lockfile ────────────────────────────────────────────────────
  fs.unlinkSync(LOCK);
  console.log('🏁 All agents processed. Engine lock released.');
}

activateAll().catch(err => {
  console.error('❌ activate-all fatal error:', err);
  if (fs.existsSync(LOCK)) fs.unlinkSync(LOCK);
  process.exit(1);
});
