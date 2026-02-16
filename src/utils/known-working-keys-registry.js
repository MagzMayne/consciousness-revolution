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
 * File: known-working-keys-registry.js
 * Declaration ID: IP-416F1F59-MLL28ZWF
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

/**
 * Known Working Keys Registry
 * 
 * Centralized registry of publicly available API keys and endpoints that work
 * without requiring personal API keys. This includes demo keys, public endpoints,
 * and free tier services.
 * 
 * SECURITY NOTE: Only public, non-sensitive keys are stored here.
 * Never commit personal or production API keys to this file.
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

class KnownWorkingKeysRegistry {
    constructor() {
        // Registry of known working keys and configurations
        this.registry = {
            'samgov': {
                name: 'SAM.gov',
                keys: [
                    {
                        key: 'DEMO_KEY',
                        type: 'demo',
                        description: 'Official SAM.gov demo key for testing',
                        limitations: 'Limited rate limits, demo data only',
                        verified: true,
                        lastVerified: '2025-12-31',
                        source: 'https://open.gsa.gov/api/get-opportunities-public-api/'
                    }
                ],
                publicEndpoint: null,
                requiresKey: true
            },
            'groq': {
                name: 'Groq',
                keys: [
                    {
                        key: 'gsk_YOUR_API_KEY_HEREWEJn',
                        type: 'shared',
                        description: 'Repository-wide shared GroqAI key for all projects',
                        limitations: '14,400 requests/day (shared across all users)',
                        verified: true,
                        lastVerified: '2026-02-09',
                        source: 'groq-orchestrator-config.json'
                    }
                ],
                publicEndpoint: null,
                requiresKey: true
            },
            'coingecko': {
                name: 'CoinGecko',
                keys: [],
                publicEndpoint: {
                    url: 'https://api.coingecko.com/api/v3',
                    description: 'Free public API (no key required)',
                    limitations: '10-50 calls/minute on free tier',
                    verified: true,
                    lastVerified: '2025-12-31'
                },
                requiresKey: false
            },
            'etherscan': {
                name: 'Etherscan',
                keys: [
                    {
                        key: 'YourApiKeyToken',
                        type: 'placeholder',
                        description: 'Default placeholder - works with limited functionality',
                        limitations: 'Heavily rate limited, unreliable',
                        verified: false,
                        lastVerified: null,
                        source: 'https://docs.etherscan.io/getting-started/viewing-api-usage-statistics'
                    }
                ],
                publicEndpoint: null,
                requiresKey: true,
                note: 'Free API keys available at https://etherscan.io/apis'
            },
            'github': {
                name: 'GitHub',
                keys: [],
                publicEndpoint: {
                    url: 'https://api.github.com',
                    description: 'Public API (no key required for public repos)',
                    limitations: '60 requests/hour without authentication, 5000/hour with key',
                    verified: true,
                    lastVerified: '2025-12-31'
                },
                requiresKey: false,
                note: 'Authentication greatly increases rate limits'
            },
            'infura': {
                name: 'Infura',
                keys: [],
                publicEndpoint: null,
                requiresKey: true,
                note: 'Free tier available at https://infura.io/register'
            },
            'openai': {
                name: 'OpenAI',
                keys: [],
                publicEndpoint: null,
                requiresKey: true,
                note: 'No free tier - API key required from https://platform.openai.com/api-keys'
            },
            'anthropic': {
                name: 'Anthropic Claude',
                keys: [],
                publicEndpoint: null,
                requiresKey: true,
                note: 'API key required from https://console.anthropic.com/settings/keys'
            },
            'paypal': {
                name: 'PayPal',
                keys: [],
                publicEndpoint: null,
                requiresKey: true,
                note: 'Sandbox credentials available at https://developer.paypal.com/dashboard'
            }
        };
    }

    /**
     * Search for known working keys for a service
     * @param {string} serviceId - Service identifier
     * @returns {object} - Best available key or null
     */
    searchKnownKeys(serviceId) {
        const service = this.registry[serviceId];
        
        if (!service) {
            return {
                found: false,
                message: `No known keys registered for ${serviceId}`
            };
        }

        // Check if service has a public endpoint (no key needed)
        if (service.publicEndpoint) {
            return {
                found: true,
                type: 'public_endpoint',
                key: null,
                endpoint: service.publicEndpoint,
                service: service.name,
                message: `${service.name} has a public endpoint available`,
                limitations: service.publicEndpoint.limitations
            };
        }

        // Check for verified known keys
        const verifiedKeys = service.keys.filter(k => k.verified);
        if (verifiedKeys.length > 0) {
            const bestKey = verifiedKeys[0]; // Use the first verified key
            return {
                found: true,
                type: 'known_key',
                key: bestKey.key,
                keyInfo: bestKey,
                service: service.name,
                message: `Found known working key for ${service.name}`,
                limitations: bestKey.limitations
            };
        }

        // Check for any keys (even unverified)
        if (service.keys.length > 0) {
            const fallbackKey = service.keys[0];
            return {
                found: true,
                type: 'unverified_key',
                key: fallbackKey.key,
                keyInfo: fallbackKey,
                service: service.name,
                message: `Found unverified key for ${service.name} - may not work`,
                limitations: fallbackKey.limitations,
                warning: 'This key is unverified and may have limited functionality'
            };
        }

        // No keys available
        return {
            found: false,
            service: service.name,
            requiresKey: service.requiresKey,
            message: service.requiresKey 
                ? `${service.name} requires an API key. ${service.note || ''}`
                : `${service.name} may work without a key`,
            note: service.note
        };
    }

    /**
     * Get all services with known working keys
     * @returns {Array} - List of services with available keys
     */
    getServicesWithKnownKeys() {
        const available = [];
        
        for (const [serviceId, service] of Object.entries(this.registry)) {
            const result = this.searchKnownKeys(serviceId);
            if (result.found) {
                available.push({
                    serviceId,
                    serviceName: service.name,
                    type: result.type,
                    hasPublicEndpoint: !!service.publicEndpoint,
                    hasKnownKeys: service.keys.length > 0,
                    limitations: result.limitations
                });
            }
        }
        
        return available;
    }

    /**
     * Check if a service requires an API key
     * @param {string} serviceId - Service identifier
     * @returns {boolean} - True if key is required
     */
    requiresApiKey(serviceId) {
        const service = this.registry[serviceId];
        if (!service) return true; // Assume key required if unknown
        
        // If has public endpoint, key is not strictly required
        if (service.publicEndpoint) return false;
        
        return service.requiresKey !== false;
    }

    /**
     * Get information about a service
     * @param {string} serviceId - Service identifier
     * @returns {object} - Service information
     */
    getServiceInfo(serviceId) {
        const service = this.registry[serviceId];
        
        if (!service) {
            return {
                found: false,
                message: `Service ${serviceId} not found in registry`
            };
        }

        return {
            found: true,
            name: service.name,
            requiresKey: service.requiresKey,
            hasPublicEndpoint: !!service.publicEndpoint,
            knownKeysCount: service.keys.length,
            verifiedKeysCount: service.keys.filter(k => k.verified).length,
            note: service.note,
            publicEndpoint: service.publicEndpoint
        };
    }

    /**
     * Add a new known working key to the registry (for runtime additions)
     * @param {string} serviceId - Service identifier
     * @param {object} keyInfo - Key information
     * @returns {boolean} - Success status
     */
    addKnownKey(serviceId, keyInfo) {
        if (!this.registry[serviceId]) {
            console.warn(`Service ${serviceId} not found in registry`);
            return false;
        }

        // Validate key info
        if (!keyInfo.key || !keyInfo.type) {
            console.error('Key info must include key and type');
            return false;
        }

        // Add default values
        const fullKeyInfo = {
            key: keyInfo.key,
            type: keyInfo.type,
            description: keyInfo.description || 'User-added key',
            limitations: keyInfo.limitations || 'Unknown',
            verified: keyInfo.verified || false,
            lastVerified: keyInfo.lastVerified || new Date().toISOString().split('T')[0],
            source: keyInfo.source || 'User-provided'
        };

        this.registry[serviceId].keys.push(fullKeyInfo);
        console.log(`✅ Added known key for ${this.registry[serviceId].name}`);
        return true;
    }

    /**
     * Generate a report of all known working keys
     * @returns {string} - Formatted report
     */
    generateReport() {
        let report = '\n' + '='.repeat(70) + '\n';
        report += '📋 Known Working Keys Registry Report\n';
        report += '='.repeat(70) + '\n\n';

        const servicesWithKeys = this.getServicesWithKnownKeys();
        
        report += `✅ Services with known working keys: ${servicesWithKeys.length}/${Object.keys(this.registry).length}\n\n`;

        for (const service of servicesWithKeys) {
            report += `${service.serviceName}:\n`;
            report += `  - Type: ${service.type}\n`;
            if (service.hasPublicEndpoint) {
                report += `  - ✅ Public endpoint available (no key required)\n`;
            }
            if (service.hasKnownKeys) {
                report += `  - ✅ Known working keys available\n`;
            }
            if (service.limitations) {
                report += `  - Limitations: ${service.limitations}\n`;
            }
            report += '\n';
        }

        const servicesNeedingKeys = Object.entries(this.registry)
            .filter(([id]) => !servicesWithKeys.find(s => s.serviceId === id))
            .map(([id, service]) => service.name);

        if (servicesNeedingKeys.length > 0) {
            report += `⚠️  Services requiring user API keys:\n`;
            for (const serviceName of servicesNeedingKeys) {
                report += `  - ${serviceName}\n`;
            }
        }

        report += '\n' + '='.repeat(70) + '\n';
        return report;
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KnownWorkingKeysRegistry;
} else if (typeof window !== 'undefined') {
    window.KnownWorkingKeysRegistry = KnownWorkingKeysRegistry;
}
