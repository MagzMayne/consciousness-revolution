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
 * File: agent-name-normalizer.js
 * Declaration ID: IP-2A3C0B28-MLL28ZWD
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/** SIGNED BY MeRLynn - ID: MERLYNN-agent-normalizer - TIMESTAMP: 2026-01-11T20:01:00.000Z - HASH: alias-support */
/** SIGNED BY AGentR - ID: AGENTR-agent-normalizer - TIMESTAMP: 2026-01-11T20:01:00.000Z - HASH: alias-support */

/**
 * Agent Name Normalizer Utility
 * Provides consistent agent name handling across the Gem Bot Universe
 * Maps alternative spellings and aliases to canonical agent names
 *
 * @author BarbrickDesign AI Team
 * @version 1.0.0
 */

/**
 * Agent name aliases mapping
 * Maps alternative spellings to canonical names
 */
const AGENT_ALIASES = {
    'araya': 'arya'  // Alternative spelling for Arya Enhancement Specialist
};

/**
 * Canonical agent names
 */
const CANONICAL_AGENTS = ['austin', 'arya', 'andy', 'ryan'];

/**
 * Normalize agent name by resolving aliases
 * @param {string} name - Agent name (possibly an alias)
 * @returns {string} - Canonical agent name, or empty string for invalid input
 */
function normalizeAgentName(name) {
    // Return empty string for invalid input (maintains backward compatibility)
    // Consider using null or throwing errors in future versions if stricter validation is needed
    if (!name || typeof name !== 'string') {
        return '';
    }
    const normalized = name.toLowerCase().trim();
    return AGENT_ALIASES[normalized] || normalized;
}

/**
 * Check if a name is a valid agent (including aliases)
 * @param {string} name - Agent name to check
 * @returns {boolean} - True if valid agent or alias
 */
function isValidAgent(name) {
    const normalized = normalizeAgentName(name);
    return CANONICAL_AGENTS.includes(normalized);
}

/**
 * Get all valid agent names including aliases
 * @returns {Array<string>} - All valid agent identifiers
 */
function getAllAgentNames() {
    const aliases = Object.keys(AGENT_ALIASES);
    return [...CANONICAL_AGENTS, ...aliases];
}

/**
 * Get canonical name for an agent
 * @param {string} name - Agent name (possibly an alias)
 * @returns {string|null} - Canonical name if valid, null otherwise
 */
function getCanonicalName(name) {
    const normalized = normalizeAgentName(name);
    return CANONICAL_AGENTS.includes(normalized) ? normalized : null;
}

/**
 * Get all aliases for a canonical agent name
 * @param {string} canonicalName - Canonical agent name
 * @returns {Array<string>} - Array of aliases for the agent
 */
function getAliases(canonicalName) {
    const normalized = canonicalName.toLowerCase();
    return Object.entries(AGENT_ALIASES)
        .filter(([alias, canonical]) => canonical === normalized)
        .map(([alias]) => alias);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AGENT_ALIASES,
        CANONICAL_AGENTS,
        normalizeAgentName,
        isValidAgent,
        getAllAgentNames,
        getCanonicalName,
        getAliases
    };
}

// Browser global
if (typeof window !== 'undefined') {
    window.agentNameNormalizer = {
        AGENT_ALIASES,
        CANONICAL_AGENTS,
        normalizeAgentName,
        isValidAgent,
        getAllAgentNames,
        getCanonicalName,
        getAliases
    };
}
