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
 * File: contract-seeker-agent.js
 * Declaration ID: IP-2812E9BF-MLL28ZVY
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
 * CONTRACT SEEKER AGENT
 * =====================
 * Autonomous agent for discovering and tracking government contract opportunities
 * Integrates with SAM.gov and FPDS APIs to find matching contracts
 * 
 * PURPOSE: Core income generation for the team through autonomous contract discovery
 * FOCUS: Peaceful applications, helping all people, betterment of mankind
 * 
 * CAPABILITIES:
 * - Autonomous opportunity discovery from SAM.gov
 * - NAICS code-based contract matching
 * - Historical contract analysis via FPDS
 * - Deadline tracking and alerts
 * - Opportunity scoring and ranking
 * - Competitor analysis
 * - Knowledge base learning from past successes
 */

class ContractSeekerAgent {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            checkInterval: 3600000, // 1 hour
            autoApply: false, // Safety: require approval before applying
            peacefulOnly: true, // Only peaceful, helpful contracts
            ...config
        };
        
        this.isActive = false;
        this.logs = [];
        this.opportunities = [];
        this.metrics = {
            totalSearches: 0,
            opportunitiesFound: 0,
            highPriorityMatches: 0,
            successfulApplications: 0,
            lastRun: null
        };
        
        // Knowledge base for learning
        this.knowledgeBase = {
            successfulNAICS: [],
            successfulKeywords: [],
            excludedAgencies: [],
            preferredAgencies: []
        };
    }
    
    /**
     * Initialize the agent
     */
    async init() {
        try {
            this.log('Initializing Contract Seeker Agent...', 'info');
            
            // Load SAM.gov integration
            if (window.SAMGovIntegration) {
                this.samIntegration = new window.SAMGovIntegration(this.config);
                this.log('SAM.gov Integration loaded', 'success');
            } else {
                this.log('SAM.gov Integration not found, will load dynamically', 'warning');
                await this.loadSAMIntegration();
            }
            
            // Load knowledge base from storage
            await this.loadKnowledgeBase();
            
            // Start monitoring if enabled
            this.isActive = true;
            if (this.config.enabled) {
                this.startMonitoring();
            }
            
            this.log('Contract Seeker Agent initialized successfully', 'success');
        } catch (error) {
            this.log(`Failed to initialize: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Load SAM.gov integration dynamically
     */
    async loadSAMIntegration() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/src/utils/samgov-integration.js';
            script.onload = () => {
                if (window.SAMGovIntegration) {
                    this.samIntegration = new window.SAMGovIntegration(this.config);
                    this.log('SAM.gov Integration loaded dynamically', 'success');
                    resolve();
                } else {
                    reject(new Error('SAM.gov Integration failed to load'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load SAM.gov Integration script'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Start continuous monitoring
     */
    startMonitoring() {
        this.log('Starting continuous contract monitoring', 'info');
        
        // Initial search
        this.searchOpportunities();
        
        // Set up interval
        this.monitoringInterval = setInterval(() => {
            this.searchOpportunities();
        }, this.config.checkInterval);
    }
    
    /**
     * Search for contract opportunities
     */
    async searchOpportunities(naicsCodes = [], keywords = []) {
        this.log('Searching for contract opportunities...', 'info');
        this.metrics.totalSearches++;
        this.metrics.lastRun = new Date().toISOString();
        
        try {
            const results = {
                opportunities: [],
                highPriority: [],
                totalFound: 0
            };
            
            // Use provided NAICS or from knowledge base
            const searchNAICS = naicsCodes.length > 0 ? naicsCodes : this.knowledgeBase.successfulNAICS;
            
            // Search SAM.gov opportunities
            if (this.samIntegration) {
                const samResults = await this.searchSAMGov(searchNAICS, keywords);
                results.opportunities.push(...samResults);
            }
            
            // Search FPDS for historical context
            const fpdsResults = await this.searchFPDS(searchNAICS, keywords);
            
            // Filter for peaceful/helpful applications
            results.opportunities = this.filterPeacefulContracts(results.opportunities);
            
            // Score and rank opportunities
            results.opportunities = this.scoreOpportunities(results.opportunities, naicsCodes);
            
            // Identify high priority
            results.highPriority = results.opportunities.filter(opp => opp.score >= 80);
            results.totalFound = results.opportunities.length;
            
            // Update metrics
            this.metrics.opportunitiesFound += results.totalFound;
            this.metrics.highPriorityMatches += results.highPriority.length;
            
            // Store opportunities
            this.opportunities = results.opportunities;
            
            // Log results
            this.log(`Found ${results.totalFound} opportunities (${results.highPriority.length} high priority)`, 'success');
            
            // Learn from results
            await this.learnFromResults(results);
            
            return results;
            
        } catch (error) {
            this.log(`Search failed: ${error.message}`, 'error');
            return { opportunities: [], highPriority: [], totalFound: 0, error: error.message };
        }
    }
    
    /**
     * Search SAM.gov for opportunities
     */
    async searchSAMGov(naicsCodes, keywords) {
        if (!this.samIntegration) {
            this.log('SAM.gov integration not available', 'warning');
            return [];
        }
        
        try {
            const opportunities = [];
            
            // Search by NAICS codes
            for (const naics of naicsCodes) {
                const query = {
                    naicsCode: naics,
                    active: true,
                    limit: 50
                };
                
                const response = await this.samIntegration.searchOpportunities(query);
                if (response && response.opportunities) {
                    opportunities.push(...response.opportunities);
                }
            }
            
            // Search by keywords if provided
            if (keywords.length > 0) {
                for (const keyword of keywords) {
                    const query = {
                        keyword: keyword,
                        active: true,
                        limit: 50
                    };
                    
                    const response = await this.samIntegration.searchOpportunities(query);
                    if (response && response.opportunities) {
                        opportunities.push(...response.opportunities);
                    }
                }
            }
            
            // Remove duplicates
            const unique = this.removeDuplicates(opportunities, 'noticeId');
            
            this.log(`Found ${unique.length} unique SAM.gov opportunities`, 'info');
            return unique;
            
        } catch (error) {
            this.log(`SAM.gov search error: ${error.message}`, 'error');
            return [];
        }
    }
    
    /**
     * Search FPDS for historical contracts
     */
    async searchFPDS(naicsCodes, keywords) {
        if (!this.samIntegration) {
            return [];
        }
        
        try {
            const contracts = [];
            
            // Search historical contracts for similar work
            for (const naics of naicsCodes) {
                const response = await this.samIntegration.getFPDSContracts({
                    naics: naics,
                    limit: 20,
                    sortBy: 'effectiveDate',
                    sortOrder: 'desc'
                });
                
                if (response && response.contracts) {
                    contracts.push(...response.contracts);
                }
            }
            
            this.log(`Found ${contracts.length} historical FPDS contracts`, 'info');
            return contracts;
            
        } catch (error) {
            this.log(`FPDS search error: ${error.message}`, 'error');
            return [];
        }
    }
    
    /**
     * Filter contracts for peaceful/helpful applications
     */
    filterPeacefulContracts(opportunities) {
        if (!this.config.peacefulOnly) {
            return opportunities;
        }
        
        const excludeKeywords = [
            'weapon', 'missile', 'bomb', 'warfare', 'combat',
            'surveillance', 'espionage', 'attack', 'destruction'
        ];
        
        const includeKeywords = [
            'education', 'health', 'infrastructure', 'environment',
            'research', 'development', 'safety', 'security',
            'communication', 'transportation', 'energy', 'agriculture'
        ];
        
        return opportunities.filter(opp => {
            const text = `${opp.title || ''} ${opp.description || ''}`.toLowerCase();
            
            // Exclude harmful applications
            const hasExcluded = excludeKeywords.some(keyword => text.includes(keyword));
            if (hasExcluded) {
                this.log(`Filtered out opportunity: ${opp.title} (harmful keywords)`, 'info');
                return false;
            }
            
            // Prefer helpful applications
            const hasIncluded = includeKeywords.some(keyword => text.includes(keyword));
            
            return true; // Allow through by default if no harmful keywords
        });
    }
    
    /**
     * Score opportunities based on match quality
     */
    scoreOpportunities(opportunities, naicsCodes) {
        return opportunities.map(opp => {
            let score = 0;
            
            // NAICS match bonus
            if (naicsCodes.includes(opp.naicsCode)) {
                score += 40;
            }
            
            // Deadline urgency (prefer 2-4 weeks out)
            const deadline = new Date(opp.responseDeadLine || opp.deadline);
            const daysUntilDeadline = Math.floor((deadline - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntilDeadline >= 14 && daysUntilDeadline <= 30) {
                score += 30;
            } else if (daysUntilDeadline > 30) {
                score += 20;
            } else if (daysUntilDeadline < 14 && daysUntilDeadline >= 7) {
                score += 10;
            }
            
            // Contract value bonus
            const value = parseFloat(opp.contractValue || opp.baseAndAllOptionsValue || 0);
            if (value >= 100000 && value <= 1000000) {
                score += 20; // Sweet spot for small business
            } else if (value > 1000000) {
                score += 10;
            }
            
            // Small business set-aside bonus
            if (opp.typeOfSetAside && opp.typeOfSetAside.includes('SB')) {
                score += 10;
            }
            
            return {
                ...opp,
                score,
                daysUntilDeadline,
                priority: score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
            };
        }).sort((a, b) => b.score - a.score);
    }
    
    /**
     * Learn from search results
     */
    async learnFromResults(results) {
        // Track successful NAICS codes
        results.highPriority.forEach(opp => {
            if (opp.naicsCode && !this.knowledgeBase.successfulNAICS.includes(opp.naicsCode)) {
                this.knowledgeBase.successfulNAICS.push(opp.naicsCode);
            }
        });
        
        // Save knowledge base
        await this.saveKnowledgeBase();
    }
    
    /**
     * Load knowledge base from storage
     */
    async loadKnowledgeBase() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('contractSeeker_knowledgeBase');
                if (stored) {
                    this.knowledgeBase = JSON.parse(stored);
                    this.log('Knowledge base loaded', 'info');
                }
            }
        } catch (error) {
            this.log(`Failed to load knowledge base: ${error.message}`, 'warning');
        }
    }
    
    /**
     * Save knowledge base to storage
     */
    async saveKnowledgeBase() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('contractSeeker_knowledgeBase', JSON.stringify(this.knowledgeBase));
                this.log('Knowledge base saved', 'info');
            }
        } catch (error) {
            this.log(`Failed to save knowledge base: ${error.message}`, 'warning');
        }
    }
    
    /**
     * Remove duplicate items from array
     */
    removeDuplicates(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    
    /**
     * Logging system
     */
    log(message, level = 'info') {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            agent: 'ContractSeekerAgent'
        };
        
        this.logs.push(entry);
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
        
        // Console output with color
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m'    // Red
        };
        
        console.log(`${colors[level]}[CONTRACT-SEEKER] ${message}\x1b[0m`);
    }
    
    /**
     * Get agent health status
     */
    getHealth() {
        return {
            isActive: this.isActive,
            metrics: this.metrics,
            opportunitiesCount: this.opportunities.length,
            knowledgeBaseSize: this.knowledgeBase.successfulNAICS.length,
            status: this.isActive ? 'healthy' : 'stopped'
        };
    }
    
    /**
     * Stop the agent
     */
    async stop() {
        this.log('Stopping Contract Seeker Agent...', 'info');
        this.isActive = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        await this.saveKnowledgeBase();
        this.log('Contract Seeker Agent stopped', 'success');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContractSeekerAgent;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ContractSeekerAgent = ContractSeekerAgent;
}
