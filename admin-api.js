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
 * File: admin-api.js
 * Declaration ID: IP-7DE94E25-MLL28ZUG
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GemBot Admin API
 * Complete API for admin dashboard functionality
 * 
 * This file provides API utilities for the admin dashboard including:
 * - Project management
 * - Agent management
 * - Data loading from JSON files
 */

// Initialize admin API namespace
window.gemBotAdminAPI = window.gemBotAdminAPI || {};
window.adminAPI = window.adminAPI || {};

// Main Admin API
window.gemBotAdminAPI = {
    initialized: false,
    version: '2.0.0',
    projectsData: null,
    agentDeploymentData: null,
    agentRData: null,
    agents: [],
    
    // Initialize API
    async init() {
        console.log('🔧 GemBot Admin API initializing (v' + this.version + ')');
        
        try {
            // Load all data sources
            await this.loadProjectsData();
            await this.loadAgentData();
            await this.initializeAgents();
            
            this.initialized = true;
            console.log('✅ GemBot Admin API initialized successfully');
            console.log('📊 Loaded:', {
                projects: this.projectsData?.meta?.total_items || 0,
                repositories: this.projectsData?.repositories?.length || 0,
                agentSystems: Object.keys(this.agentDeploymentData?.systems || {}).length,
                agents: this.agents.length
            });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize GemBot Admin API:', error);
            this.initialized = false;
            return false;
        }
    },
    
    // Load projects.json
    async loadProjectsData() {
        try {
            const response = await fetch('./projects.json');
            if (!response.ok) throw new Error('Failed to load projects.json');
            this.projectsData = await response.json();
            console.log('📦 Projects data loaded:', this.projectsData.meta);
        } catch (error) {
            console.error('Error loading projects data:', error);
            // Fallback structure matching expected schema
            this.projectsData = { 
                meta: { 
                    total_items: 0, 
                    total_repositories: 0, 
                    total_html_projects: 0 
                }, 
                repositories: [], 
                html_projects: [] 
            };
        }
    },
    
    // Load agent manifests
    async loadAgentData() {
        try {
            // Load agent deployment manifest
            const depResponse = await fetch('./agent-deployment-manifest.json');
            if (depResponse.ok) {
                this.agentDeploymentData = await depResponse.json();
                console.log('🤖 Agent deployment data loaded');
            }
            
            // Load Agent R manifest
            const rResponse = await fetch('./agent-r-manifest.json');
            if (rResponse.ok) {
                this.agentRData = await rResponse.json();
                console.log('👤 Agent R data loaded');
            }
        } catch (error) {
            console.error('Error loading agent data:', error);
            this.agentDeploymentData = { systems: {} };
            this.agentRData = { identity: null, systems: {} };
        }
    },
    
    // Initialize agents from manifests
    async initializeAgents() {
        this.agents = [];
        
        // Add agents from deployment manifest
        if (this.agentDeploymentData?.systems) {
            Object.entries(this.agentDeploymentData.systems).forEach(([key, system]) => {
                if (system.agents) {
                    for (let i = 0; i < system.agents; i++) {
                        this.agents.push({
                            agentId: `${key}-agent-${i + 1}`,
                            type: key,
                            status: system.autoStart ? 'running' : 'stopped',
                            tasksCompleted: 0, // Real metrics would come from actual agent tracking
                            uptime: system.autoStart ? this.formatUptime(86400000) : '0h 0m',
                            spawned: new Date(Date.now() - 86400000).toISOString(),
                            lastActive: new Date().toISOString(),
                            features: system.features || []
                        });
                    }
                }
            });
        }
        
        // Add Agent R
        if (this.agentRData?.identity) {
            this.agents.push({
                agentId: 'AGENT_R',
                type: 'System Architect',
                status: 'running',
                tasksCompleted: 9999,
                uptime: 'Always Active',
                spawned: new Date('2026-01-02').toISOString(),
                lastActive: new Date().toISOString(),
                features: ['Supreme Authority', 'System Control'],
                clearanceLevel: this.agentRData.identity.clearanceLevel || 999
            });
        }
        
        console.log(`🤖 Initialized ${this.agents.length} agents`);
    },
    
    // Format uptime
    formatUptime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    },
    
    // Get all AI agents
    async getAllAIAgents() {
        return this.agents;
    },
    
    // Get agent by ID
    async getAgent(agentId) {
        return this.agents.find(a => a.agentId === agentId);
    },
    
    // Spawn new agent
    async spawnAgent(type) {
        const newAgent = {
            agentId: `${type}-agent-${Date.now()}`,
            type: type,
            status: 'running',
            tasksCompleted: 0,
            uptime: '0h 0m',
            spawned: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            features: []
        };
        this.agents.push(newAgent);
        return newAgent;
    },
    
    // Stop agent
    async stopAgent(agentId) {
        const agent = this.agents.find(a => a.agentId === agentId);
        if (agent) {
            agent.status = 'stopped';
        }
        return agent;
    },
    
    // Start agent
    async startAgent(agentId) {
        const agent = this.agents.find(a => a.agentId === agentId);
        if (agent) {
            agent.status = 'running';
            agent.lastActive = new Date().toISOString();
        }
        return agent;
    },
    
    // Clear all agents (except Agent R)
    async clearAllAgents() {
        this.agents = this.agents.filter(a => a.agentId === 'AGENT_R');
    },
    
    // Get security dashboard data
    async getSecurityDashboard() {
        return {
            totalRegistrations: 0,
            safeAccounts: 0,
            flaggedAccounts: 0,
            avgSuspicionScore: 0,
            users: []
        };
    },
    
    // Get all projects
    async getAllProjects() {
        if (!this.projectsData) return [];
        
        const allProjects = [];
        
        // Add repositories
        if (this.projectsData.repositories) {
            this.projectsData.repositories.forEach(repo => {
                allProjects.push({
                    name: repo.name,
                    description: repo.simple_description || repo.description,
                    url: repo.live_url || repo.repo_url,
                    type: repo.type,
                    active: repo.active,
                    category: 'repository'
                });
            });
        }
        
        // Add HTML projects
        if (this.projectsData.html_projects) {
            this.projectsData.html_projects.forEach(proj => {
                allProjects.push({
                    name: proj.name,
                    description: proj.simple_description || proj.description,
                    url: `./${proj.file}`,
                    type: proj.type || 'html',
                    active: true,
                    category: proj.category || 'html_project'
                });
            });
        }
        
        return allProjects;
    },
    
    // Get project stats
    async getProjectStats() {
        if (!this.projectsData?.meta) {
            return {
                totalProjects: 0,
                totalRepositories: 0,
                totalHtmlProjects: 0,
                activeProjects: 0
            };
        }
        
        const repos = this.projectsData.repositories || [];
        const activeRepos = repos.filter(r => r.active).length;
        
        return {
            totalProjects: this.projectsData.meta.total_items || 0,
            totalRepositories: this.projectsData.meta.total_repositories || 0,
            totalHtmlProjects: this.projectsData.meta.total_html_projects || 0,
            activeProjects: activeRepos
        };
    }
};

// Legacy support
window.adminAPI = window.gemBotAdminAPI;

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.gemBotAdminAPI.init());
} else {
    window.gemBotAdminAPI.init();
}
