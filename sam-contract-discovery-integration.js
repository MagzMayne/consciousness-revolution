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
 * File: sam-contract-discovery-integration.js
 * Declaration ID: IP-50AA834D-MLL28ZVU
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
 * SAM CONTRACT DISCOVERY INTEGRATION
 * ===================================
 * Dynamic UI injection and integration layer for sam.html
 * Connects Contract Seeker, Proposal Generator, and Application Submission agents
 * 
 * PURPOSE: Provide user interface for the Government Contract Discovery System
 * FOCUS: Seamless integration, real-time updates, user-friendly controls
 * 
 * CAPABILITIES:
 * - Dynamic UI injection into sam.html
 * - Agent orchestration and control
 * - Real-time opportunity display
 * - Proposal modal and preview
 * - Status tracking and notifications
 * - Team value integration
 */

class SAMContractDiscoveryIntegration {
    constructor(config = {}) {
        this.config = {
            containerId: 'contract-discovery-container',
            autoInit: true,
            showNotifications: true,
            ...config
        };
        
        this.agents = {
            contractSeeker: null,
            proposalGenerator: null,
            applicationSubmission: null
        };
        
        this.teamValueSystem = null;
        this.opportunities = [];
        this.selectedOpportunity = null;
        this.currentProposal = null;
        
        this.isInitialized = false;
        this.logs = [];
    }
    
    /**
     * Initialize the integration
     */
    async init() {
        try {
            this.log('Initializing SAM Contract Discovery Integration...', 'info');
            
            // Load and initialize agents
            await this.loadAgents();
            await this.initializeAgents();
            
            // Load team value system
            await this.loadTeamValueSystem();
            
            // Inject UI
            await this.injectUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.log('Integration initialized successfully', 'success');
            this.showNotification('Contract Discovery System ready!', 'success');
            
        } catch (error) {
            this.log(`Failed to initialize: ${error.message}`, 'error');
            this.showNotification('Failed to initialize system', 'error');
            throw error;
        }
    }
    
    /**
     * Load agent scripts dynamically
     */
    async loadAgents() {
        try {
            this.log('Loading agent scripts...', 'info');
            
            const scripts = [
                '/src/agents/contract-seeker-agent.js',
                '/src/agents/proposal-generator-agent.js',
                '/src/agents/application-submission-agent.js'
            ];
            
            for (const scriptPath of scripts) {
                await this.loadScript(scriptPath);
            }
            
            this.log('Agent scripts loaded', 'success');
            
        } catch (error) {
            this.log(`Failed to load agents: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Load a script dynamically
     * @param {string} src - Script source URL
     * @returns {Promise} Resolves when loaded
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Initialize all agents
     */
    async initializeAgents() {
        try {
            this.log('Initializing agents...', 'info');
            
            // Initialize Contract Seeker Agent
            if (window.ContractSeekerAgent) {
                this.agents.contractSeeker = new window.ContractSeekerAgent({
                    enabled: true,
                    peacefulOnly: true,
                    autoApply: false
                });
                await this.agents.contractSeeker.init();
                this.log('Contract Seeker Agent initialized', 'success');
            } else {
                throw new Error('ContractSeekerAgent not found');
            }
            
            // Initialize Proposal Generator Agent
            if (window.ProposalGeneratorAgent) {
                this.agents.proposalGenerator = new window.ProposalGeneratorAgent({
                    enabled: true,
                    companyProfile: {
                        name: 'Barbrick Design',
                        description: 'Innovative technology solutions for government and commercial clients',
                        contact: 'BarbrickDesign@gmail.com'
                    }
                });
                await this.agents.proposalGenerator.init();
                this.log('Proposal Generator Agent initialized', 'success');
            } else {
                throw new Error('ProposalGeneratorAgent not found');
            }
            
            // Initialize Application Submission Agent
            if (window.ApplicationSubmissionAgent) {
                this.agents.applicationSubmission = new window.ApplicationSubmissionAgent({
                    enabled: true,
                    requireApproval: true,
                    onApprovalRequested: this.handleApprovalRequest.bind(this)
                });
                await this.agents.applicationSubmission.init();
                this.log('Application Submission Agent initialized', 'success');
            } else {
                throw new Error('ApplicationSubmissionAgent not found');
            }
            
            this.log('All agents initialized', 'success');
            
        } catch (error) {
            this.log(`Failed to initialize agents: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Load and initialize team value system
     */
    async loadTeamValueSystem() {
        try {
            this.log('Loading Team Value Enhancement System...', 'info');
            
            await this.loadScript('/src/systems/team-value-enhancement-system.js');
            
            if (window.TeamValueEnhancementSystem) {
                this.teamValueSystem = new window.TeamValueEnhancementSystem();
                await this.teamValueSystem.init();
                this.log('Team Value System initialized', 'success');
            } else {
                this.log('Team Value System not available, continuing without it', 'warning');
            }
            
        } catch (error) {
            this.log(`Failed to load Team Value System: ${error.message}`, 'warning');
            // Continue without team value system
        }
    }
    
    /**
     * Inject UI into sam.html
     */
    async injectUI() {
        try {
            this.log('Injecting UI...', 'info');
            
            // Find or create container
            let container = document.getElementById(this.config.containerId);
            if (!container) {
                container = document.createElement('div');
                container.id = this.config.containerId;
                container.className = 'contract-discovery-container';
                
                // Insert after NAICS questionnaire or at end of main content
                const mainContent = document.querySelector('main') || document.body;
                mainContent.appendChild(container);
            }
            
            // Inject HTML
            container.innerHTML = this.generateUIHTML();
            
            // Inject CSS
            this.injectCSS();
            
            this.log('UI injected successfully', 'success');
            
        } catch (error) {
            this.log(`Failed to inject UI: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Generate UI HTML
     * @returns {string} HTML content
     */
    generateUIHTML() {
        return `
            <div class="contract-discovery-section">
                <div class="section-header">
                    <h2>🎯 Government Contract Discovery System</h2>
                    <p class="section-description">Autonomous contract discovery and proposal generation</p>
                </div>
                
                <!-- Agent Controls -->
                <div class="agent-controls">
                    <div class="control-panel">
                        <h3>⚙️ Agent Controls</h3>
                        <div class="controls-grid">
                            <button id="start-monitoring" class="btn btn-primary">
                                <span class="icon">▶️</span>
                                Start Monitoring
                            </button>
                            <button id="stop-monitoring" class="btn btn-secondary" disabled>
                                <span class="icon">⏸️</span>
                                Stop Monitoring
                            </button>
                            <button id="refresh-opportunities" class="btn btn-info">
                                <span class="icon">🔄</span>
                                Refresh Now
                            </button>
                            <button id="view-settings" class="btn btn-default">
                                <span class="icon">⚙️</span>
                                Settings
                            </button>
                        </div>
                    </div>
                    
                    <!-- Status Display -->
                    <div class="status-display">
                        <h3>📊 System Status</h3>
                        <div class="status-grid">
                            <div class="status-item">
                                <span class="status-label">Contract Seeker:</span>
                                <span id="seeker-status" class="status-value status-inactive">Inactive</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">Opportunities Found:</span>
                                <span id="opportunities-count" class="status-value">0</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">Last Check:</span>
                                <span id="last-check" class="status-value">Never</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">Team Value:</span>
                                <span id="team-value" class="status-value">$0</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Opportunities List -->
                <div class="opportunities-section">
                    <div class="section-header">
                        <h3>📋 Discovered Opportunities</h3>
                        <div class="filters">
                            <select id="priority-filter" class="filter-select">
                                <option value="all">All Priorities</option>
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                            <select id="sort-filter" class="filter-select">
                                <option value="score">Sort by Score</option>
                                <option value="deadline">Sort by Deadline</option>
                                <option value="value">Sort by Value</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="opportunities-list" class="opportunities-list">
                        <div class="no-opportunities">
                            <p>No opportunities found yet. Click "Start Monitoring" to begin discovering contracts.</p>
                        </div>
                    </div>
                </div>
                
                <!-- Notifications Area -->
                <div id="notifications-area" class="notifications-area"></div>
            </div>
            
            <!-- Proposal Modal -->
            <div id="proposal-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>📄 Proposal Preview</h2>
                        <button class="modal-close" id="close-proposal-modal">&times;</button>
                    </div>
                    <div class="modal-body" id="proposal-content">
                        <!-- Proposal content will be inserted here -->
                    </div>
                    <div class="modal-footer">
                        <button id="approve-proposal" class="btn btn-success">✅ Approve & Submit</button>
                        <button id="download-proposal" class="btn btn-info">📥 Download PDF</button>
                        <button id="reject-proposal" class="btn btn-danger">❌ Reject</button>
                    </div>
                </div>
            </div>
            
            <!-- Settings Modal -->
            <div id="settings-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>⚙️ System Settings</h2>
                        <button class="modal-close" id="close-settings-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="settings-section">
                            <h3>Discovery Settings</h3>
                            <label>
                                <input type="checkbox" id="setting-peaceful-only" checked>
                                Peaceful contracts only (exclude military/weapons)
                            </label>
                            <label>
                                <input type="checkbox" id="setting-auto-apply">
                                Auto-apply to high-priority opportunities
                            </label>
                            <label>
                                Check interval:
                                <select id="setting-check-interval">
                                    <option value="3600000">1 hour</option>
                                    <option value="7200000">2 hours</option>
                                    <option value="14400000">4 hours</option>
                                    <option value="86400000">24 hours</option>
                                </select>
                            </label>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Proposal Settings</h3>
                            <label>
                                <input type="checkbox" id="setting-require-approval" checked>
                                Require approval before submission
                            </label>
                            <label>
                                Company name:
                                <input type="text" id="setting-company-name" value="Barbrick Design">
                            </label>
                            <label>
                                Contact email:
                                <input type="email" id="setting-contact-email" value="BarbrickDesign@gmail.com">
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="save-settings" class="btn btn-primary">💾 Save Settings</button>
                        <button class="modal-close btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Inject CSS styles
     */
    injectCSS() {
        const styleId = 'contract-discovery-styles';
        
        // Check if styles already injected
        if (document.getElementById(styleId)) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .contract-discovery-container {
                margin: 2rem 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            }
            
            .contract-discovery-section {
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                padding: 2rem;
                margin-bottom: 2rem;
            }
            
            .section-header {
                margin-bottom: 1.5rem;
            }
            
            .section-header h2 {
                font-size: 1.8rem;
                margin: 0 0 0.5rem 0;
                color: #333;
            }
            
            .section-description {
                color: #666;
                margin: 0;
            }
            
            .agent-controls {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .control-panel h3,
            .status-display h3 {
                font-size: 1.2rem;
                margin: 0 0 1rem 0;
                color: #444;
            }
            
            .controls-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.75rem;
            }
            
            .btn {
                padding: 0.75rem 1rem;
                border: none;
                border-radius: 6px;
                font-size: 0.95rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            
            .btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-primary {
                background: #4CAF50;
                color: white;
            }
            
            .btn-secondary {
                background: #607D8B;
                color: white;
            }
            
            .btn-info {
                background: #2196F3;
                color: white;
            }
            
            .btn-success {
                background: #4CAF50;
                color: white;
            }
            
            .btn-danger {
                background: #f44336;
                color: white;
            }
            
            .btn-default {
                background: #f5f5f5;
                color: #333;
            }
            
            .status-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
            
            .status-item {
                display: flex;
                flex-direction: column;
                padding: 0.75rem;
                background: #f9f9f9;
                border-radius: 6px;
            }
            
            .status-label {
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 0.25rem;
            }
            
            .status-value {
                font-size: 1.1rem;
                font-weight: 600;
                color: #333;
            }
            
            .status-active {
                color: #4CAF50;
            }
            
            .status-inactive {
                color: #999;
            }
            
            .opportunities-section {
                margin-top: 2rem;
            }
            
            .filters {
                display: flex;
                gap: 0.75rem;
            }
            
            .filter-select {
                padding: 0.5rem 1rem;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 0.9rem;
                background: white;
                cursor: pointer;
            }
            
            .opportunities-list {
                margin-top: 1rem;
            }
            
            .no-opportunities {
                text-align: center;
                padding: 3rem 2rem;
                color: #666;
                background: #f9f9f9;
                border-radius: 6px;
            }
            
            .opportunity-card {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                transition: all 0.2s;
            }
            
            .opportunity-card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                border-color: #2196F3;
            }
            
            .opportunity-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 1rem;
            }
            
            .opportunity-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #333;
                margin: 0 0 0.5rem 0;
            }
            
            .opportunity-priority {
                padding: 0.25rem 0.75rem;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .priority-high {
                background: #ffebee;
                color: #c62828;
            }
            
            .priority-medium {
                background: #fff3e0;
                color: #e65100;
            }
            
            .priority-low {
                background: #e8f5e9;
                color: #2e7d32;
            }
            
            .opportunity-meta {
                display: flex;
                gap: 2rem;
                margin-bottom: 1rem;
                font-size: 0.9rem;
                color: #666;
            }
            
            .opportunity-description {
                color: #555;
                line-height: 1.6;
                margin-bottom: 1rem;
            }
            
            .opportunity-actions {
                display: flex;
                gap: 0.75rem;
            }
            
            .notifications-area {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            }
            
            .notification {
                background: white;
                border-radius: 8px;
                padding: 1rem 1.5rem;
                margin-bottom: 0.75rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 1rem;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification-success {
                border-left: 4px solid #4CAF50;
            }
            
            .notification-error {
                border-left: 4px solid #f44336;
            }
            
            .notification-info {
                border-left: 4px solid #2196F3;
            }
            
            .notification-warning {
                border-left: 4px solid #ff9800;
            }
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            }
            
            .modal-header {
                padding: 1.5rem 2rem;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
                color: #333;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .modal-close:hover {
                background: #f5f5f5;
                color: #333;
            }
            
            .modal-body {
                padding: 2rem;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 1.5rem 2rem;
                border-top: 1px solid #e0e0e0;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }
            
            .settings-section {
                margin-bottom: 2rem;
            }
            
            .settings-section h3 {
                font-size: 1.1rem;
                margin: 0 0 1rem 0;
                color: #444;
            }
            
            .settings-section label {
                display: block;
                margin-bottom: 1rem;
                color: #555;
            }
            
            .settings-section input[type="text"],
            .settings-section input[type="email"],
            .settings-section select {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-top: 0.25rem;
            }
            
            @media (max-width: 768px) {
                .agent-controls {
                    grid-template-columns: 1fr;
                }
                
                .controls-grid {
                    grid-template-columns: 1fr;
                }
                
                .status-grid {
                    grid-template-columns: 1fr;
                }
                
                .modal-content {
                    max-width: 95%;
                    max-height: 95vh;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Start monitoring button
        document.getElementById('start-monitoring')?.addEventListener('click', () => {
            this.startMonitoring();
        });
        
        // Stop monitoring button
        document.getElementById('stop-monitoring')?.addEventListener('click', () => {
            this.stopMonitoring();
        });
        
        // Refresh opportunities button
        document.getElementById('refresh-opportunities')?.addEventListener('click', () => {
            this.refreshOpportunities();
        });
        
        // View settings button
        document.getElementById('view-settings')?.addEventListener('click', () => {
            this.showSettings();
        });
        
        // Priority filter
        document.getElementById('priority-filter')?.addEventListener('change', (e) => {
            this.filterOpportunities(e.target.value);
        });
        
        // Sort filter
        document.getElementById('sort-filter')?.addEventListener('change', (e) => {
            this.sortOpportunities(e.target.value);
        });
        
        // Modal close buttons
        document.getElementById('close-proposal-modal')?.addEventListener('click', () => {
            this.closeModal('proposal-modal');
        });
        
        document.getElementById('close-settings-modal')?.addEventListener('click', () => {
            this.closeModal('settings-modal');
        });
        
        // Proposal actions
        document.getElementById('approve-proposal')?.addEventListener('click', () => {
            this.approveProposal();
        });
        
        document.getElementById('download-proposal')?.addEventListener('click', () => {
            this.downloadProposal();
        });
        
        document.getElementById('reject-proposal')?.addEventListener('click', () => {
            this.rejectProposal();
        });
        
        // Settings save button
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        this.log('Event listeners setup complete', 'info');
    }
    
    /**
     * Start monitoring for opportunities
     */
    async startMonitoring() {
        try {
            this.log('Starting contract monitoring...', 'info');
            this.showNotification('Starting contract monitoring...', 'info');
            
            // Start contract seeker
            if (this.agents.contractSeeker) {
                await this.agents.contractSeeker.startMonitoring();
                
                // Update UI
                document.getElementById('seeker-status').textContent = 'Active';
                document.getElementById('seeker-status').className = 'status-value status-active';
                document.getElementById('start-monitoring').disabled = true;
                document.getElementById('stop-monitoring').disabled = false;
                
                // Do initial search
                await this.refreshOpportunities();
                
                this.showNotification('Contract monitoring started!', 'success');
            }
            
        } catch (error) {
            this.log(`Failed to start monitoring: ${error.message}`, 'error');
            this.showNotification('Failed to start monitoring', 'error');
        }
    }
    
    /**
     * Stop monitoring
     */
    async stopMonitoring() {
        try {
            this.log('Stopping contract monitoring...', 'info');
            
            // Stop contract seeker
            if (this.agents.contractSeeker) {
                await this.agents.contractSeeker.stopMonitoring();
                
                // Update UI
                document.getElementById('seeker-status').textContent = 'Inactive';
                document.getElementById('seeker-status').className = 'status-value status-inactive';
                document.getElementById('start-monitoring').disabled = false;
                document.getElementById('stop-monitoring').disabled = true;
                
                this.showNotification('Contract monitoring stopped', 'info');
            }
            
        } catch (error) {
            this.log(`Failed to stop monitoring: ${error.message}`, 'error');
            this.showNotification('Failed to stop monitoring', 'error');
        }
    }
    
    /**
     * Refresh opportunities
     */
    async refreshOpportunities() {
        try {
            this.log('Refreshing opportunities...', 'info');
            this.showNotification('Searching for opportunities...', 'info');
            
            // Get NAICS codes from questionnaire
            const naicsCodes = this.getNAICSCodes();
            
            // Search for opportunities
            if (this.agents.contractSeeker) {
                const results = await this.agents.contractSeeker.searchOpportunities(naicsCodes);
                this.opportunities = results.opportunities || [];
                
                // Update UI
                this.updateOpportunitiesList();
                this.updateStatusDisplay();
                
                this.showNotification(`Found ${this.opportunities.length} opportunities!`, 'success');
            }
            
        } catch (error) {
            this.log(`Failed to refresh opportunities: ${error.message}`, 'error');
            this.showNotification('Failed to refresh opportunities', 'error');
        }
    }
    
    /**
     * Get NAICS codes from questionnaire
     * @returns {Array} NAICS codes
     */
    getNAICSCodes() {
        // Try to get from questionnaire results
        const results = window.questionnaireResults || [];
        return results.map(r => r.code);
    }
    
    /**
     * Update opportunities list in UI
     */
    updateOpportunitiesList() {
        const listContainer = document.getElementById('opportunities-list');
        if (!listContainer) return;
        
        if (this.opportunities.length === 0) {
            listContainer.innerHTML = `
                <div class="no-opportunities">
                    <p>No opportunities found yet. Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }
        
        // Generate opportunity cards
        const cardsHTML = this.opportunities.map(opp => this.generateOpportunityCard(opp)).join('');
        listContainer.innerHTML = cardsHTML;
        
        // Add event listeners to action buttons
        this.opportunities.forEach(opp => {
            const generateBtn = document.getElementById(`generate-${opp.noticeId}`);
            if (generateBtn) {
                generateBtn.addEventListener('click', () => this.generateProposal(opp));
            }
            
            const viewBtn = document.getElementById(`view-${opp.noticeId}`);
            if (viewBtn) {
                viewBtn.addEventListener('click', () => this.viewOpportunity(opp));
            }
        });
    }
    
    /**
     * Generate opportunity card HTML
     * @param {Object} opportunity - Opportunity data
     * @returns {string} HTML
     */
    generateOpportunityCard(opportunity) {
        const priorityClass = `priority-${opportunity.priority || 'low'}`;
        const priorityLabel = (opportunity.priority || 'low').toUpperCase();
        
        return `
            <div class="opportunity-card">
                <div class="opportunity-header">
                    <div>
                        <h4 class="opportunity-title">${opportunity.title || 'Untitled Opportunity'}</h4>
                        <div class="opportunity-meta">
                            <span>📅 Deadline: ${this.formatDate(opportunity.responseDeadline)}</span>
                            <span>💰 ${this.formatValue(opportunity.contractValue)}</span>
                            <span>⭐ Score: ${opportunity.score || 0}/100</span>
                        </div>
                    </div>
                    <span class="opportunity-priority ${priorityClass}">${priorityLabel}</span>
                </div>
                
                <p class="opportunity-description">
                    ${this.truncateText(opportunity.description || 'No description available', 200)}
                </p>
                
                <div class="opportunity-meta">
                    <span>🏢 ${opportunity.agency || 'Unknown Agency'}</span>
                    <span>🔢 NAICS: ${(opportunity.naicsCodes || []).join(', ')}</span>
                </div>
                
                <div class="opportunity-actions">
                    <button id="generate-${opportunity.noticeId}" class="btn btn-primary">
                        📝 Generate Proposal
                    </button>
                    <button id="view-${opportunity.noticeId}" class="btn btn-info">
                        👁️ View Details
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate proposal for opportunity
     * @param {Object} opportunity - Opportunity data
     */
    async generateProposal(opportunity) {
        try {
            this.log(`Generating proposal for: ${opportunity.title}`, 'info');
            this.showNotification('Generating proposal...', 'info');
            
            this.selectedOpportunity = opportunity;
            
            // Generate proposal
            if (this.agents.proposalGenerator) {
                const proposal = await this.agents.proposalGenerator.generateProposal(opportunity);
                this.currentProposal = proposal;
                
                // Show proposal modal
                this.showProposalModal(proposal, opportunity);
                
                this.showNotification('Proposal generated successfully!', 'success');
            }
            
        } catch (error) {
            this.log(`Failed to generate proposal: ${error.message}`, 'error');
            this.showNotification('Failed to generate proposal', 'error');
        }
    }
    
    /**
     * Show proposal modal
     * @param {Object} proposal - Proposal data
     * @param {Object} opportunity - Opportunity data
     */
    showProposalModal(proposal, opportunity) {
        const modal = document.getElementById('proposal-modal');
        const content = document.getElementById('proposal-content');
        
        if (!modal || !content) return;
        
        // Generate proposal HTML
        content.innerHTML = `
            <div class="proposal-preview">
                <h3>Proposal for: ${opportunity.title}</h3>
                
                <div class="proposal-section">
                    <h4>1. Executive Summary</h4>
                    <p>${proposal.executiveSummary || 'Not available'}</p>
                </div>
                
                <div class="proposal-section">
                    <h4>2. Technical Approach</h4>
                    <p>${proposal.technicalApproach || 'Not available'}</p>
                </div>
                
                <div class="proposal-section">
                    <h4>3. Management Plan</h4>
                    <p>${proposal.managementPlan || 'Not available'}</p>
                </div>
                
                <div class="proposal-section">
                    <h4>4. Past Performance</h4>
                    <p>${proposal.pastPerformance || 'Not available'}</p>
                </div>
                
                <div class="proposal-section">
                    <h4>5. Cost Proposal</h4>
                    <p>${proposal.costProposal || 'Not available'}</p>
                </div>
                
                <div class="proposal-section">
                    <h4>6. Compliance Matrix</h4>
                    <p>${proposal.complianceMatrix || 'Not available'}</p>
                </div>
                
                <div class="proposal-meta">
                    <p><strong>Quality Score:</strong> ${proposal.qualityScore || 0}/100</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    /**
     * Approve proposal and submit
     */
    async approveProposal() {
        try {
            if (!this.currentProposal || !this.selectedOpportunity) {
                throw new Error('No proposal selected');
            }
            
            this.log('Approving proposal...', 'info');
            this.showNotification('Preparing application...', 'info');
            
            // Prepare application
            if (this.agents.applicationSubmission) {
                const application = await this.agents.applicationSubmission.prepareApplication(
                    this.selectedOpportunity,
                    this.currentProposal
                );
                
                // Approve and submit
                await this.agents.applicationSubmission.approveApplication(application.id, 'User');
                const result = await this.agents.applicationSubmission.submitApplication(application.id, true);
                
                if (result.success) {
                    this.showNotification('Application submitted successfully!', 'success');
                } else {
                    this.showNotification('Application submitted for approval', 'info');
                }
                
                // Close modal
                this.closeModal('proposal-modal');
                
                // Refresh opportunities
                await this.refreshOpportunities();
            }
            
        } catch (error) {
            this.log(`Failed to approve proposal: ${error.message}`, 'error');
            this.showNotification('Failed to submit application', 'error');
        }
    }
    
    /**
     * Download proposal as PDF
     */
    downloadProposal() {
        try {
            if (!this.currentProposal) {
                throw new Error('No proposal to download');
            }
            
            this.log('Downloading proposal...', 'info');
            
            // Generate text content
            const content = this.generateProposalText(this.currentProposal);
            
            // Create blob and download
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Proposal_${this.selectedOpportunity.noticeId}_${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Proposal downloaded', 'success');
            
        } catch (error) {
            this.log(`Failed to download proposal: ${error.message}`, 'error');
            this.showNotification('Failed to download proposal', 'error');
        }
    }
    
    /**
     * Generate proposal text content
     * @param {Object} proposal - Proposal data
     * @returns {string} Text content
     */
    generateProposalText(proposal) {
        return `
GOVERNMENT CONTRACT PROPOSAL
============================

Generated: ${new Date().toLocaleString()}
Opportunity: ${this.selectedOpportunity.title}
Agency: ${this.selectedOpportunity.agency}

1. EXECUTIVE SUMMARY
${proposal.executiveSummary || 'Not available'}

2. TECHNICAL APPROACH
${proposal.technicalApproach || 'Not available'}

3. MANAGEMENT PLAN
${proposal.managementPlan || 'Not available'}

4. PAST PERFORMANCE
${proposal.pastPerformance || 'Not available'}

5. COST PROPOSAL
${proposal.costProposal || 'Not available'}

6. COMPLIANCE MATRIX
${proposal.complianceMatrix || 'Not available'}

---
Quality Score: ${proposal.qualityScore || 0}/100
Generated by: Barbrick Design Contract Discovery System
Contact: BarbrickDesign@gmail.com
        `.trim();
    }
    
    /**
     * Reject proposal
     */
    rejectProposal() {
        this.log('Proposal rejected by user', 'info');
        this.showNotification('Proposal rejected', 'info');
        this.closeModal('proposal-modal');
        this.currentProposal = null;
        this.selectedOpportunity = null;
    }
    
    /**
     * View opportunity details
     * @param {Object} opportunity - Opportunity data
     */
    viewOpportunity(opportunity) {
        // Open SAM.gov opportunity page in new tab
        if (opportunity.url) {
            window.open(opportunity.url, '_blank');
        } else {
            this.showNotification('Opportunity URL not available', 'warning');
        }
    }
    
    /**
     * Show settings modal
     */
    showSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    /**
     * Save settings
     */
    saveSettings() {
        try {
            this.log('Saving settings...', 'info');
            
            // Get settings from form
            const settings = {
                peacefulOnly: document.getElementById('setting-peaceful-only')?.checked,
                autoApply: document.getElementById('setting-auto-apply')?.checked,
                checkInterval: parseInt(document.getElementById('setting-check-interval')?.value || '3600000'),
                requireApproval: document.getElementById('setting-require-approval')?.checked,
                companyName: document.getElementById('setting-company-name')?.value,
                contactEmail: document.getElementById('setting-contact-email')?.value
            };
            
            // Save to localStorage
            localStorage.setItem('contractDiscoverySettings', JSON.stringify(settings));
            
            // Update agents
            if (this.agents.contractSeeker) {
                this.agents.contractSeeker.config.peacefulOnly = settings.peacefulOnly;
                this.agents.contractSeeker.config.autoApply = settings.autoApply;
                this.agents.contractSeeker.config.checkInterval = settings.checkInterval;
            }
            
            if (this.agents.applicationSubmission) {
                this.agents.applicationSubmission.config.requireApproval = settings.requireApproval;
            }
            
            this.showNotification('Settings saved successfully', 'success');
            this.closeModal('settings-modal');
            
        } catch (error) {
            this.log(`Failed to save settings: ${error.message}`, 'error');
            this.showNotification('Failed to save settings', 'error');
        }
    }
    
    /**
     * Filter opportunities
     * @param {string} priority - Priority filter
     */
    filterOpportunities(priority) {
        if (priority === 'all') {
            this.updateOpportunitiesList();
        } else {
            const filtered = this.opportunities.filter(opp => opp.priority === priority);
            const tempOpportunities = this.opportunities;
            this.opportunities = filtered;
            this.updateOpportunitiesList();
            this.opportunities = tempOpportunities;
        }
    }
    
    /**
     * Sort opportunities
     * @param {string} sortBy - Sort criteria
     */
    sortOpportunities(sortBy) {
        if (sortBy === 'score') {
            this.opportunities.sort((a, b) => (b.score || 0) - (a.score || 0));
        } else if (sortBy === 'deadline') {
            this.opportunities.sort((a, b) => 
                new Date(a.responseDeadline) - new Date(b.responseDeadline)
            );
        } else if (sortBy === 'value') {
            this.opportunities.sort((a, b) => (b.contractValue || 0) - (a.contractValue || 0));
        }
        
        this.updateOpportunitiesList();
    }
    
    /**
     * Update status display
     */
    updateStatusDisplay() {
        // Update opportunities count
        document.getElementById('opportunities-count').textContent = this.opportunities.length;
        
        // Update last check time
        document.getElementById('last-check').textContent = new Date().toLocaleTimeString();
        
        // Update team value
        if (this.teamValueSystem) {
            this.teamValueSystem.calculateTotalTeamValue().then(teamValue => {
                document.getElementById('team-value').textContent = `$${teamValue.totalValue.toLocaleString()}`;
            });
        }
    }
    
    /**
     * Handle approval request
     * @param {Object} approvalRequest - Approval request data
     * @param {Object} application - Application data
     */
    async handleApprovalRequest(approvalRequest, application) {
        this.log('Approval requested for application', 'info');
        this.showNotification(`Approval required for: ${application.opportunityTitle}`, 'warning');
    }
    
    /**
     * Close modal
     * @param {string} modalId - Modal ID
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info, warning)
     */
    showNotification(message, type = 'info') {
        if (!this.config.showNotifications) return;
        
        const container = document.getElementById('notifications-area');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${this.getNotificationIcon(type)}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * Get notification icon
     * @param {string} type - Notification type
     * @returns {string} Icon
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || 'ℹ️';
    }
    
    /**
     * Format date
     * @param {string} date - Date string
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return 'No deadline';
        return new Date(date).toLocaleDateString();
    }
    
    /**
     * Format value
     * @param {number} value - Dollar value
     * @returns {string} Formatted value
     */
    formatValue(value) {
        if (!value) return 'Value TBD';
        return `$${value.toLocaleString()}`;
    }
    
    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Log message
     * @param {string} message - Message to log
     * @param {string} level - Log level
     */
    log(message, level = 'info') {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            integration: 'SAMContractDiscoveryIntegration'
        };
        
        this.logs.push(entry);
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
        
        // Console output with color
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m'
        };
        
        console.log(`${colors[level] || ''}[${level.toUpperCase()}] ${message}\x1b[0m`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SAMContractDiscoveryIntegration;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SAMContractDiscoveryIntegration = SAMContractDiscoveryIntegration;
}

// Auto-initialize if configured
if (typeof window !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.autoInitContractDiscovery !== false) {
            const integration = new SAMContractDiscoveryIntegration();
            integration.init().catch(console.error);
            window.contractDiscoveryIntegration = integration;
        }
    });
} else if (typeof window !== 'undefined' && window.autoInitContractDiscovery !== false) {
    const integration = new SAMContractDiscoveryIntegration();
    integration.init().catch(console.error);
    window.contractDiscoveryIntegration = integration;
}
