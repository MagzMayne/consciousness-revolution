// ARAYA DNA Library API
// Provides programmatic access to system blueprints

const DNA_BASE = 'https://conciousnessrevolution.io/ARAYA/DNA';

const DNA_INDEX = {
  version: "1.0",
  updated: "2026-02-20",
  categories: {
    core_system: ["ARAYA_SYSTEM_DNA.md", "SYSTEM_DNA_BLUEPRINT.md", "BOOT_DNA_BLUEPRINT.md", "CONSCIOUSNESS_DNA_BLUEPRINT.md"],
    brain: ["BRAIN_DNA_BLUEPRINT.md", "CYCLOTRON_BRAIN_DNA.md"],
    infrastructure: ["RAILWAY_DNA_BLUEPRINT.md", "RAILWAY_DNA_MAP.md", "RAILWAY_MASTER_BLUEPRINT.md", "MCP_NETWORK_DNA.md"],
    platform: ["100X_PLATFORM_DNA.md", "ABILITY_INVENTORY_DNA.md", "AUTOMATION_DNA_BLUEPRINT.md"],
    communications: ["ARAYA_DISCORD_DNA_MAP.md", "EMAIL_DNA_BLUEPRINT.md", "TRINITY_DNA_BLUEPRINT.md", "TRINITY_HUB_DNA.md"],
    security: ["CREDENTIAL_VAULT_DNA.md"],
    domains: ["blueprint_1_command.md", "blueprint_2_build.md", "blueprint_3_connect.md", "blueprint_4_protect.md", "blueprint_5_grow.md", "blueprint_6_learn.md", "blueprint_7_transcend.md"]
  }
};

export async function handler(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const action = params.action || 'index';

  try {
    switch (action) {
      case 'index':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: DNA_INDEX,
            base_url: DNA_BASE,
            total_files: Object.values(DNA_INDEX.categories).flat().length
          })
        };

      case 'category':
        const category = params.name;
        if (!category || !DNA_INDEX.categories[category]) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid category', available: Object.keys(DNA_INDEX.categories) })
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            category,
            files: DNA_INDEX.categories[category],
            urls: DNA_INDEX.categories[category].map(f => `${DNA_BASE}/${f}`)
          })
        };

      case 'search':
        const query = (params.q || '').toLowerCase();
        const allFiles = Object.values(DNA_INDEX.categories).flat();
        const matches = allFiles.filter(f => f.toLowerCase().includes(query));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            query,
            matches,
            urls: matches.map(f => `${DNA_BASE}/${f}`)
          })
        };

      case 'fetch':
        const file = params.file;
        if (!file) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'file parameter required' }) };
        }
        const fileUrl = `${DNA_BASE}/${file}`;
        const response = await fetch(fileUrl);
        if (!response.ok) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'DNA not found', file }) };
        }
        const content = await response.text();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, file, content })
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Unknown action',
            available: ['index', 'category', 'search', 'fetch'],
            examples: {
              index: '/.netlify/functions/araya-dna?action=index',
              category: '/.netlify/functions/araya-dna?action=category&name=brain',
              search: '/.netlify/functions/araya-dna?action=search&q=railway',
              fetch: '/.netlify/functions/araya-dna?action=fetch&file=ARAYA_SYSTEM_DNA.md'
            }
          })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
