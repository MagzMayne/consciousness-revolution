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
 * File: samgov-api-integration.js
 * Declaration ID: IP-39C97E0C-MLL28ZWA
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

/** SIGNED BY MeRLynn - ID: MERLYNN-07dae03f - TIMESTAMP: 2025-12-19T05:53:06.543Z - HASH: 78796ed6 */
/** SIGNED BY AGentR - ID: AGENTR-603c930c - TIMESTAMP: 2025-12-19T05:53:06.543Z - HASH: 78796ed6 */

/**
 * SAM.GOV REAL API INTEGRATION
 * Uses actual SAM.gov data services API v2
 * Documentation: https://open.gsa.gov/api/sam-api/
 * 
 * API Key: Get from https://sam.gov/data-services
 */

class SAMGovAPIIntegration {
    constructor(apiKey = null) {
        // Real SAM.gov API endpoints
        this.baseUrl = 'https://api.sam.gov';
        this.opportunitiesEndpoint = `${this.baseUrl}/prod/opportunities/v2/search`;
        this.contractDataEndpoint = `${this.baseUrl}/prod/federalcontractdata/v1/search`;
        this.entityEndpoint = `${this.baseUrl}/prod/entity-information/v2/entities`;
        
        // API Key from environment or parameter
        this.apiKey = apiKey || this.getApiKeyFromStorage();
        
        this.cache = {
            opportunities: [],
            contracts: [],
            lastUpdate: null
        };
    }

    /**
     * Get or prompt for API key with validation
     */
    getApiKeyFromStorage() {
        // First check environment variable (server-side)
        if (typeof process !== 'undefined' && process.env && process.env.SAMGOV_API_KEY) {
            return process.env.SAMGOV_API_KEY;
        }
        
        // Then check sessionStorage (safer than localStorage)
        if (typeof sessionStorage !== 'undefined') {
            const sessionKey = sessionStorage.getItem('samgov_api_key');
            if (sessionKey) {
                return sessionKey;
            }
        }
        
        console.warn('⚠️ SAM.gov API key not found. Get one at: https://sam.gov/data-services');
        return null;
    }

    /**
     * Set API key with validation and save securely
     */
    setApiKey(apiKey) {
        // Use centralized validator if available
        if (typeof window !== 'undefined' && window.ApiKeyValidator) {
            const validator = new window.ApiKeyValidator();
            const validation = validator.validate(apiKey, 'samgov');
            
            if (!validation.valid) {
                console.error('Invalid SAM.gov API key:', validation.error);
                throw new Error(`Invalid API key: ${validation.error}`);
            }
            
            if (validation.warnings) {
                console.warn('API key warnings:', validation.warnings);
            }
        } else {
            // Basic validation fallback
            if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 20) {
                throw new Error('Invalid API key format');
            }
        }
        
        this.apiKey = apiKey;
        
        // Store only in sessionStorage (removed localStorage for security)
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('samgov_api_key', apiKey);
        }
        
        console.log('✅ SAM.gov API key validated and saved to session');
        return { success: true, message: 'API key set successfully' };
    }

    /**
     * Search for contract opportunities
     */
    async searchOpportunities(params = {}) {
        if (!this.apiKey) {
            throw new Error('API key required. Get one at https://sam.gov/data-services');
        }

        const defaultParams = {
            limit: 10,
            offset: 0,
            postedFrom: this.getDateDaysAgo(30), // Last 30 days
            postedTo: this.getTodayDate()
        };

        const queryParams = { ...defaultParams, ...params };
        const url = this.buildUrl(this.opportunitiesEndpoint, queryParams);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.cache.opportunities = data.opportunitiesData || [];
            this.cache.lastUpdate = new Date().toISOString();
            
            return {
                success: true,
                opportunities: data.opportunitiesData || [],
                total: data.totalRecords || 0,
                metadata: {
                    limit: queryParams.limit,
                    offset: queryParams.offset
                }
            };
        } catch (error) {
            console.error('SAM.gov API Error:', error);
            return {
                success: false,
                error: error.message,
                opportunities: []
            };
        }
    }

    /**
     * Search federal contract award data
     */
    async searchContracts(params = {}) {
        if (!this.apiKey) {
            throw new Error('API key required. Get one at https://sam.gov/data-services');
        }

        const defaultParams = {
            limit: 100,
            offset: 0
        };

        const queryParams = { ...defaultParams, ...params };
        const url = this.buildUrl(this.contractDataEndpoint, queryParams);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.cache.contracts = data.results || [];
            
            return {
                success: true,
                contracts: data.results || [],
                total: data.totalRecords || 0
            };
        } catch (error) {
            console.error('SAM.gov Contract API Error:', error);
            return {
                success: false,
                error: error.message,
                contracts: []
            };
        }
    }

    /**
     * Find opportunities matching project keywords
     */
    async findMatchingOpportunities(projectKeywords = []) {
        const allOpportunities = [];
        
        for (const keyword of projectKeywords) {
            const result = await this.searchOpportunities({
                keyword: keyword,
                limit: 50
            });
            
            if (result.success) {
                allOpportunities.push(...result.opportunities);
            }
        }

        // Deduplicate by noticeId
        const uniqueOpps = this.deduplicateByField(allOpportunities, 'noticeId');
        
        return {
            success: true,
            opportunities: uniqueOpps,
            keywords: projectKeywords
        };
    }

    /**
     * Calculate project value based on similar contracts
     */
    async calculateProjectValue(projectType, projectKeywords) {
        const result = await this.searchContracts({
            keyword: projectKeywords.join(' OR ')
        });

        if (!result.success || result.contracts.length === 0) {
            return this.getEstimatedValue(projectType);
        }

        const values = result.contracts
            .filter(c => c.dollarObligated && c.dollarObligated > 0)
            .map(c => parseFloat(c.dollarObligated));

        if (values.length === 0) {
            return this.getEstimatedValue(projectType);
        }

        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);

        return {
            success: true,
            averageContractValue: Math.round(avgValue),
            highestContractValue: Math.round(maxValue),
            lowestContractValue: Math.round(minValue),
            totalContracts: values.length,
            projectEstimate: Math.round(avgValue * 0.7), // 70% of avg for new project
            confidence: values.length >= 10 ? 'HIGH' : values.length >= 5 ? 'MEDIUM' : 'LOW',
            dataSource: 'SAM.gov Live Data'
        };
    }

    /**
     * Get entity/vendor information
     */
    async getEntityInfo(ueiSAM) {
        if (!this.apiKey) {
            throw new Error('API key required');
        }

        const url = `${this.entityEndpoint}?ueiSAM=${ueiSAM}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                entity: data.entityData?.[0] || null
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Helper: Build URL with query params
     */
    buildUrl(baseUrl, params) {
        const url = new URL(baseUrl);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.toString();
    }

    /**
     * Helper: Get date X days ago in YYYY-MM-DD format
     */
    getDateDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Helper: Get today's date in YYYY-MM-DD format
     */
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Helper: Deduplicate array by field
     */
    deduplicateByField(arr, field) {
        const seen = new Set();
        return arr.filter(item => {
            const val = item[field];
            if (seen.has(val)) return false;
            seen.add(val);
            return true;
        });
    }

    /**
     * Fallback estimated value
     */
    getEstimatedValue(projectType) {
        const estimates = {
            'web3-platform': 5000000,
            'security-tool': 3500000,
            'infrastructure': 7000000,
            'terminal': 2000000,
            'utility': 1500000,
            'game': 4000000
        };

        return {
            success: true,
            projectEstimate: estimates[projectType] || 2000000,
            confidence: 'ESTIMATED',
            dataSource: 'Estimated (No SAM.gov data available)',
            note: 'Unable to find similar contracts. Using industry estimates.'
        };
    }

    /**
     * Generate API key registration instructions
     */
    static getAPIKeyInstructions() {
        return `
🔑 HOW TO GET SAM.GOV API KEY:

1. Visit: https://sam.gov/data-services
2. Create a free account or sign in
3. Request an API key (approval within 24 hours)
4. Copy your API key
5. Enter it in the app when prompted

API KEY FEATURES:
✅ Free tier: 1,000 requests/day
✅ Access to all federal contract data
✅ Real-time opportunity notifications
✅ Historical contract awards data
✅ Vendor entity information

RATE LIMITS:
- 1,000 requests per 24 hours (free tier)
- 10 requests per second
- Upgrade available for higher limits
        `.trim();
    }
}

// Create global instance
window.samGovAPI = new SAMGovAPIIntegration();

// Check for API key on load
if (!window.samGovAPI.apiKey) {
    console.log('📋 SAM.gov API Integration loaded');
    console.log(SAMGovAPIIntegration.getAPIKeyInstructions());
} else {
    console.log('✅ SAM.gov API Integration loaded with API key');
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SAMGovAPIIntegration;
}
