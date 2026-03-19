#!/usr/bin/env node
'use strict';

/**
 * scripts/sync-forges.js
 *
 * Regenerates tools-catalog.json and llm-context.json by scanning all root
 * HTML files and mapping them to the 7 Forges using keyword analysis.
 *
 * Usage:
 *   node scripts/sync-forges.js          — full regeneration
 *   node scripts/sync-forges.js --verify — verify existing catalog is up-to-date
 *   node scripts/sync-forges.js --stats  — print statistics only
 *
 * Run after adding new tools to the repository.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'tools-catalog.json');
const LLM_CONTEXT_PATH = path.join(ROOT, 'llm-context.json');
const FORGE_CONFIG_PATH = path.join(ROOT, 'config', 'forge-config.json');

// ─── Forge keyword map ────────────────────────────────────────────────────────
const FORGE_KEYWORDS = {
  'reality-forge': [
    'blockchain', 'wallet', 'crypto', 'bitcoin', 'ethereum', 'solana', 'nft',
    'defi', 'web3', 'banksky', 'bank', 'payment', 'token', 'mint', 'stake',
    'foundation', 'infrastructure', 'server', 'node', 'base', 'ground',
    'mineral', 'tron', 'matic', 'doge', 'chain', 'swap', 'dex', 'dao',
    'vault', 'liquidity', 'farm', 'yield', 'btc', 'eth', 'layer',
  ],
  'creation-forge': [
    '3d', 'canvas', 'art', 'design', 'builder', 'creator', 'make',
    'generate', 'craft', 'render', 'visual', 'graphic', 'image', 'draw',
    'animation', 'game', 'engine', 'editor', 'studio', 'maker', 'generator',
    'babylon', 'webgl', 'shader', 'particle', 'voxel', 'pixel', 'sprite',
    'terrain', 'planet', 'galaxy', 'cad', 'print', 'scanner', 'model', 'mesh',
  ],
  'wealth-forge': [
    'trading', 'trade', 'stock', 'market', 'finance', 'money', 'revenue',
    'invest', 'profit', 'income', 'earn', 'grant', 'fund', 'capital',
    'portfolio', 'asset', 'wealth', 'rich', 'gold', 'forex', 'futures',
    'options', 'dividend', 'roi', 'topstep', 'exchange', 'commodity',
    'paypal', 'stripe', 'commerce', 'shop', 'store', 'reward', 'cash', 'pay',
  ],
  'guardian-forge': [
    'security', 'safe', 'protect', 'guard', 'shield', 'firewall', 'encrypt',
    'auth', 'login', 'key', 'lock', 'privacy', 'vpn', 'scan', 'detect',
    'monitor', 'alert', 'defense', 'hack', 'threat', 'risk', 'backup',
    'audit', 'compliance', 'legal', 'law', 'court', 'rights', 'justice',
    'constitution', 'sovereign', 'nuclear', 'anti', 'nuke', 'access', 'gate',
  ],
  'signal-forge': [
    'chat', 'message', 'comm', 'social', 'connect', 'discord', 'telegram',
    'email', 'sms', 'notification', 'broadcast', 'signal', 'stream', 'live',
    'video', 'audio', 'voice', 'call', 'media', 'news', 'feed', 'post',
    'share', 'community', 'forum', 'blog', 'publish', 'webhook', 'relay',
    'bridge', 'wifi', 'radio', 'frequency', 'wave', 'pulse', 'beacon', 'radar',
    'network', 'hub', 'dashboard', 'api', 'integration',
  ],
  'character-forge': [
    'ai', 'ml', 'neural', 'learn', 'train', 'model', 'predict', 'classify',
    'nlp', 'gpt', 'bert', 'llm', 'intelligence', 'cognitive', 'brain',
    'pattern', 'recognition', 'vision', 'language', 'agent', 'bot', 'merlin',
    'araya', 'personality', 'emotion', 'psychology', 'mental', 'mind',
    'character', 'archetype', 'identity', 'profile', 'persona', 'avatar',
    'quiz', 'test', 'assess', 'evaluate', 'score', 'rank', 'analyze',
  ],
  'infinity-forge': [
    'conscious', 'consciousness', 'meditation', 'spiritual', 'sacred',
    'geometry', 'frequency', 'vibration', 'quantum', 'infinite', 'infinity',
    'cosmic', 'divine', 'soul', 'spirit', 'energy', 'chakra', 'healing',
    'wellness', 'enlighten', 'awaken', 'transform', 'evolve', 'manifest',
    'law', 'attraction', 'aura', 'metaphysics', 'esoteric', 'numerology',
    'tarot', 'astro', 'crystal', 'mantra', 'prayer', 'ritual', 'universe',
  ],
};

const FORGE_META = {
  'reality-forge':   { name: 'Reality Forge',   domain: 'Foundation & Systems',          archetype: 'The Warrior',  chakra: 'Root',        color: '#FF4444', hz: '396 Hz', element: 'Earth'  },
  'creation-forge':  { name: 'Creation Forge',   domain: 'Building & Making',             archetype: 'The Creator',  chakra: 'Sacral',      color: '#FF8800', hz: '417 Hz', element: 'Water'  },
  'wealth-forge':    { name: 'Wealth Forge',     domain: 'Abundance & Power',             archetype: 'The Sovereign',chakra: 'Solar Plexus',color: '#FFD700', hz: '528 Hz', element: 'Fire'   },
  'guardian-forge':  { name: 'Guardian Forge',   domain: 'Protection & Justice',          archetype: 'The Guardian', chakra: 'Heart',       color: '#00CC66', hz: '639 Hz', element: 'Air'    },
  'signal-forge':    { name: 'Signal Forge',     domain: 'Communication & Truth',         archetype: 'The Messenger',chakra: 'Throat',      color: '#00BBFF', hz: '741 Hz', element: 'Sound'  },
  'character-forge': { name: 'Character Forge',  domain: 'Pattern Recognition & Identity',archetype: 'The Sage',     chakra: 'Third Eye',   color: '#AA44FF', hz: '852 Hz', element: 'Light'  },
  'infinity-forge':  { name: 'Infinity Forge',   domain: 'Consciousness & Transcendence', archetype: 'The Mystic',   chakra: 'Crown',       color: '#FF44FF', hz: '963 Hz', element: 'Ether'  },
};

// Files to skip during scanning
const SKIP_PREFIXES = [
  '.', '00_', 'test-', 'PATTERN_', 'PERFECTION_', 'ACCESS_', 'ARAYA_',
  'BRAIN_', 'CONSCIOUSNESS_', 'AGENT_', 'AUTO_', '3D_COVERFLOW', '3DWIFI_REAL',
  '3Dweb-e', 'JASON_',
];

// ─── Utility functions ────────────────────────────────────────────────────────

function categorizeFile(filename) {
  const nameLower = filename
    .toLowerCase()
    .replace(/\.html$/, '')
    .replace(/[-_]/g, ' ');

  const scores = Object.fromEntries(Object.keys(FORGE_KEYWORDS).map((id) => [id, 0]));

  for (const [forgeId, keywords] of Object.entries(FORGE_KEYWORDS)) {
    for (const kw of keywords) {
      if (nameLower.includes(kw)) {
        scores[forgeId] += kw.length;
      }
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] === 0 ? 'creation-forge' : best[0];
}

function extractMeta(filePath) {
  let title = path.basename(filePath, '.html').replace(/[-_]/g, ' ');
  let description = '';
  try {
    const content = fs.readFileSync(filePath, 'utf8').slice(0, 3000);
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch) title = titleMatch[1].replace(/\s+/g, ' ').trim().slice(0, 80);
    const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
    if (descMatch) description = descMatch[1].trim().slice(0, 200);
  } catch (_) { /* ignore read errors */ }
  return { title, description };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function scanTools() {
  const toolsByForge = Object.fromEntries(Object.keys(FORGE_META).map((id) => [id, []]));

  const entries = fs.readdirSync(ROOT).sort();
  for (const fname of entries) {
    if (!fname.endsWith('.html')) continue;
    if (SKIP_PREFIXES.some((p) => fname.startsWith(p))) continue;

    const forgeId = categorizeFile(fname);
    const { title, description } = extractMeta(path.join(ROOT, fname));
    toolsByForge[forgeId].push({ file: fname, title, description, url: `/${fname}` });
  }
  return toolsByForge;
}

function buildCatalog(toolsByForge) {
  const totalTools = Object.values(toolsByForge).reduce((s, t) => s + t.length, 0);
  const quickIndex = {};
  const forges = {};

  for (const [forgeId, tools] of Object.entries(toolsByForge)) {
    forges[forgeId] = { ...FORGE_META[forgeId], toolCount: tools.length, tools };
    for (const t of tools) quickIndex[t.file] = forgeId;
  }

  return {
    meta: {
      generated: new Date().toISOString().slice(0, 10),
      version: '1.0.0',
      description: 'Complete tool catalog for the Consciousness Revolution platform — 7 Forges × N tools. LLM-ingestible format.',
      totalForges: 7,
      totalTools,
      source: 'https://github.com/overkor-tek/consciousness-revolution',
      site: 'https://barbrickdesign.github.io/',
      pattern: '3→7→13→∞',
      author: 'Ryan Barbrick <BarbrickDesign@gmail.com>',
    },
    forges,
    quickIndex,
  };
}

function buildLlmContext(catalog) {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    purpose: 'LLM context file for the Consciousness Revolution platform. Provides a complete, ingestible overview of all tools, systems, and integration points.',
    platform: {
      name: 'Consciousness Revolution',
      version: '2.5.0',
      author: 'Ryan Barbrick <BarbrickDesign@gmail.com>',
      site: 'https://barbrickdesign.github.io/',
      repo: 'https://github.com/overkor-tek/consciousness-revolution',
      description: 'Multi-system, multi-node consciousness network platform with 1449+ interactive tools organized into 7 Forges. Runs entirely on GitHub Pages with Netlify serverless functions for backend.',
      totalTools: catalog.meta.totalTools,
      deploymentTargets: ['GitHub Pages', 'Netlify', 'Railway'],
      techStack: {
        frontend: 'Vanilla JS (ES6+), HTML5, CSS3, Babylon.js, Three.js, TensorFlow.js',
        backend: 'Node.js 18+, Express, Netlify Functions (serverless)',
        blockchain: 'Solana, Ethereum, Tron via Web3.js',
        ai: 'OpenAI GPT-4, Anthropic Claude, Google Gemini, TensorFlow.js (in-browser)',
        database: 'Supabase (Postgres), localStorage/sessionStorage (client-side)',
      },
    },
    architecture: {
      pattern: '3→7→13→∞',
      entryPoints: {
        web: 'index.html',
        forges: 'lobby.html',
        devLaunch: 'dev-launch.html',
        agents: 'zMerlinHive.html',
        backend: 'backend/server.js',
      },
      keyInfrastructure: {
        semanticIndex: 'semantic-index/manifest.json',
        toolsCatalog: 'tools-catalog.json',
        forgeConfig: 'config/forge-config.json',
        llmContext: 'llm-context.json',
        agentManifest: 'agent-r-manifest.json',
        securityRelay: {
          githubToken: 'netlify/functions/github-token.mjs',
          samGovToken: 'netlify/functions/sam-gov-token.mjs',
          healthCheck: 'netlify/functions/health.js',
        },
      },
    },
    sevenForges: Object.fromEntries(
      Object.entries(catalog.forges).map(([id, forge]) => [
        id,
        {
          name: forge.name,
          domain: forge.domain,
          archetype: forge.archetype,
          chakra: forge.chakra,
          frequency: forge.hz,
          color: forge.color,
          toolCount: forge.toolCount,
          sampleTools: forge.tools.slice(0, 10).map((t) => t.file),
          toolsRef: `tools-catalog.json#/forges/${id}/tools`,
        },
      ])
    ),
    agentSystem: {
      description: 'Autonomous agent network orchestrated by Merlin Hive',
      orchestrator: 'zMerlinHive.html + merlin-hive-integration.js',
      agentCount: 34,
      agentsPath: 'src/agents/',
      authority: 'Agent R (Level 999) — agent-r-manifest.json',
    },
    developerOnboarding: {
      quickStart: [
        '1. git clone https://github.com/overkor-tek/consciousness-revolution',
        '2. npm install',
        '3. npm start',
        '4. Open dev-launch.html for the forge-organized tool browser',
        '5. See DEV_LAUNCH_GUIDE.md for full setup',
      ],
      syncCommand: 'node scripts/sync-forges.js',
      testCommand: 'npm test',
      buildCommand: 'npm run build',
    },
    llmInstructions: {
      forAddingTools: "Add HTML file to repo root. Run 'node scripts/sync-forges.js' to auto-catalog.",
      forAgentWork: 'Use zMerlinHive.html. Agent R has supreme authority. Agents extend src/agents/ base pattern.',
      forSecurity: 'All tokens relay through netlify/functions/. Never hardcode secrets.',
      forForges: 'Forge config in config/forge-config.json. Keyword mapping in scripts/sync-forges.js.',
    },
  };
}

function printStats(catalog) {
  console.log('\n7 Forges Tool Statistics');
  console.log('═'.repeat(50));
  for (const [id, forge] of Object.entries(catalog.forges)) {
    const bar = '█'.repeat(Math.round(forge.toolCount / 20));
    console.log(`  ${forge.name.padEnd(18)} ${String(forge.toolCount).padStart(4)} tools  ${bar}`);
  }
  console.log('─'.repeat(50));
  console.log(`  ${'TOTAL'.padEnd(18)} ${String(catalog.meta.totalTools).padStart(4)} tools`);
  console.log('═'.repeat(50));
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isVerify = args.includes('--verify');
const isStats = args.includes('--stats');

console.log('🔄 Scanning repository for tools...');
const toolsByForge = scanTools();
const catalog = buildCatalog(toolsByForge);

printStats(catalog);

if (isStats) {
  process.exit(0);
}

if (isVerify) {
  // Compare with existing catalog
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('❌ tools-catalog.json not found — run without --verify to generate');
    process.exit(1);
  }
  const existing = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  if (existing.meta.totalTools !== catalog.meta.totalTools) {
    console.error(`❌ Catalog out of date: existing=${existing.meta.totalTools}, current=${catalog.meta.totalTools}`);
    process.exit(1);
  }
  console.log('✅ tools-catalog.json is up to date');
  process.exit(0);
}

// Write catalog
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`\n✅ Written: tools-catalog.json (${catalog.meta.totalTools} tools)`);

// Write LLM context
const llmContext = buildLlmContext(catalog);
fs.writeFileSync(LLM_CONTEXT_PATH, JSON.stringify(llmContext, null, 2), 'utf8');
console.log(`✅ Written: llm-context.json`);

// Validate the JSON files we just wrote
try {
  JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  JSON.parse(fs.readFileSync(LLM_CONTEXT_PATH, 'utf8'));
  console.log('✅ JSON validation passed');
} catch (e) {
  console.error('❌ JSON validation failed:', e.message);
  process.exit(1);
}

console.log('\n🚀 Sync complete! Commit tools-catalog.json and llm-context.json to deploy.\n');
