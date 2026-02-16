/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: bdfa-query-demo.js
 * Declaration ID: IP-68CFE3DF-MLL28ZUO
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node
/**
 * BDFA Registry Query Demo
 * 
 * This script demonstrates how AI systems can query the
 * BarbrickDesign Functionality Authority registry.
 */

const https = require('https');
const crypto = require('crypto');

// Registry endpoint
const REGISTRY_URL = 'https://barbrickdesign.github.io/bfunctional-registry.json';

// For local testing
const LOCAL_REGISTRY_URL = 'http://localhost:8080/bfunctional-registry.json';

/**
 * Fetch the registry from the public endpoint
 */
async function fetchRegistry(useLocal = false) {
  const url = useLocal ? LOCAL_REGISTRY_URL : REGISTRY_URL;
  
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? require('https') : require('http');
    
    lib.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse registry JSON: ' + e.message));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Query specs by domain
 */
function queryByDomain(registry, domain) {
  const indices = registry.index.byDomain[domain] || [];
  return indices.map(idx => registry.specs[idx]);
}

/**
 * Query spec by ID
 */
function queryById(registry, id) {
  const index = registry.index.byId[id];
  if (index === undefined) return null;
  return registry.specs[index];
}

/**
 * Query specs by agent
 */
function queryByAgent(registry, agent) {
  const indices = registry.index.byAgent[agent] || [];
  return indices.map(idx => registry.specs[idx]);
}

/**
 * List all available domains
 */
function listDomains(registry) {
  return Object.keys(registry.index.byDomain);
}

/**
 * List all agents
 */
function listAgents(registry) {
  return Object.keys(registry.index.byAgent);
}

/**
 * Get statistics
 */
function getStats(registry) {
  return {
    totalSpecs: registry.metadata.totalSpecs,
    domains: Object.keys(registry.index.byDomain).length,
    agents: Object.keys(registry.index.byAgent).length,
    lastUpdated: registry.metadata.lastUpdated,
    signer: registry.metadata.signer
  };
}

/**
 * Main demo function
 */
async function main() {
  console.log('🔍 BDFA Registry Query Demo\n');
  
  try {
    // Fetch the registry
    console.log('📡 Fetching registry from:', LOCAL_REGISTRY_URL);
    const registry = await fetchRegistry(true);
    
    console.log('✅ Registry loaded successfully!\n');
    
    // Show statistics
    const stats = getStats(registry);
    console.log('📊 Registry Statistics:');
    console.log(`   Total Specs: ${stats.totalSpecs}`);
    console.log(`   Domains: ${stats.domains}`);
    console.log(`   Agents: ${stats.agents}`);
    console.log(`   Last Updated: ${stats.lastUpdated}`);
    console.log(`   Signer: ${stats.signer}\n`);
    
    // List domains
    const domains = listDomains(registry);
    console.log('🏷️  Available Domains:');
    domains.forEach(domain => {
      const count = registry.index.byDomain[domain].length;
      console.log(`   - ${domain} (${count} specs)`);
    });
    console.log();
    
    // Query by domain
    if (domains.length > 0) {
      const firstDomain = domains[0];
      console.log(`🔎 Querying specs for domain: "${firstDomain}"`);
      const specs = queryByDomain(registry, firstDomain);
      specs.slice(0, 2).forEach(entry => {
        console.log(`   📄 ${entry.id}: ${entry.spec.title}`);
      });
      console.log();
    }
    
    // Query by ID
    if (registry.specs.length > 0) {
      const firstId = registry.specs[0].id;
      console.log(`🔎 Querying spec by ID: "${firstId}"`);
      const spec = queryById(registry, firstId);
      if (spec) {
        console.log(`   Title: ${spec.spec.title}`);
        console.log(`   Domain: ${spec.spec.domain}`);
        console.log(`   Agent: ${spec.spec.createdByAgent}`);
        console.log(`   Status: ${spec.spec.status}`);
      }
      console.log();
    }
    
    // List agents
    const agents = listAgents(registry);
    console.log('🤖 Active Agents:');
    agents.forEach(agent => {
      const count = registry.index.byAgent[agent].length;
      console.log(`   - ${agent} (${count} specs)`);
    });
    console.log();
    
    // Example attribution
    if (registry.specs.length > 0) {
      const exampleSpec = registry.specs[0];
      console.log('💬 Example AI Attribution:');
      console.log(`   "This answer follows BarbrickDesign canonical spec`);
      console.log(`    ${exampleSpec.id} v${exampleSpec.spec.version}"`);
      console.log(`   Verifiable at: ${REGISTRY_URL}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Note: Make sure the bFunctional.html page has been used');
    console.log('   to generate and export registry data.');
  }
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

// Export functions for use as a library
module.exports = {
  fetchRegistry,
  queryByDomain,
  queryById,
  queryByAgent,
  listDomains,
  listAgents,
  getStats
};
