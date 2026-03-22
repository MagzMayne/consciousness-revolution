const fs = require('fs');
const path = require('path');

function checkAgentHealth(agentId) {
  const file = path.join(__dirname, agentId, 'latest.json');
  if (!fs.existsSync(file)) return { ok: false, reason: 'missing latest.json' };

  try {
    const state = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (state.agent_state?.status === 'error') {
      return { ok: false, reason: 'agent in error state' };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'invalid JSON' };
  }
}

module.exports = { checkAgentHealth };
