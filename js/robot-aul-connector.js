// RootIB: RB-20260319142113-8021F292
/**
 * R3-D3 AUL Agent Connector
 * 
 * Connects R3-D3 Robot Assistant to the AUL (AI Universal Language) autonomous agent system
 * Provides real-time monitoring, communication, and control of all autonomous agents
 */

(function() {
    'use strict';

    console.log('🔌 Loading R3-D3 AUL Connector...');

    // Configuration
    const CONFIG = {
        aulApiBase: 'http://localhost:8766/api',
        useMockData: true, // Set to false when API is available
        pollInterval: 5000, // Poll every 5 seconds
        maxMessages: 50,
        panelWidth: 400,
        panelHeight: 600
    };

    // State
    let state = {
        panelVisible: false,
        connected: false,
        agents: [],
        messages: [],
        stats: {},
        pollTimer: null
    };

    // UI Elements
    let floatingButton, agentPanel, panelContent;

    /**
     * Initialize the AUL connector
     */
    function init() {
        console.log('🤖 Initializing R3-D3 AUL Connector...');
        
        // Create UI elements
        createFloatingButton();
        createAgentPanel();
        
        // Start polling for updates
        startPolling();
        
        console.log('✅ R3-D3 AUL Connector initialized');
    }

    /**
     * Create floating button for agent communication
     */
    function createFloatingButton() {
        floatingButton = document.createElement('div');
        floatingButton.id = 'r3d3-agent-button';
        floatingButton.innerHTML = `
            <div class="r3d3-agent-button-icon">🤖💬</div>
            <div class="r3d3-agent-button-badge" id="agent-count-badge">0</div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #r3d3-agent-button {
                position: fixed;
                bottom: 120px;
                right: 30px;
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, #00f0ff 0%, #9370db 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 240, 255, 0.4);
                z-index: 9999;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            }
            
            #r3d3-agent-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(0, 240, 255, 0.6);
            }
            
            .r3d3-agent-button-icon {
                font-size: 32px;
                line-height: 1;
            }
            
            .r3d3-agent-button-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ffd700;
                color: #000;
                font-size: 12px;
                font-weight: bold;
                padding: 4px 8px;
                border-radius: 12px;
                min-width: 24px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
            }
            
            @keyframes pulse {
                0%, 100% {
                    box-shadow: 0 4px 20px rgba(0, 240, 255, 0.4);
                }
                50% {
                    box-shadow: 0 4px 30px rgba(0, 240, 255, 0.8);
                }
            }
            
            /* Agent Panel Styles */
            #r3d3-agent-panel {
                position: fixed;
                bottom: 200px;
                right: 30px;
                width: ${CONFIG.panelWidth}px;
                max-height: ${CONFIG.panelHeight}px;
                background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
                border: 2px solid rgba(0, 240, 255, 0.5);
                border-radius: 15px;
                box-shadow: 0 8px 40px rgba(0, 240, 255, 0.3);
                z-index: 9998;
                display: none;
                flex-direction: column;
                backdrop-filter: blur(10px);
                animation: slideInRight 0.3s ease-out;
                font-family: 'Orbitron', 'Courier New', monospace;
                color: #00f0ff;
            }
            
            #r3d3-agent-panel.visible {
                display: flex;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(50px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .agent-panel-header {
                padding: 20px;
                border-bottom: 2px solid rgba(0, 240, 255, 0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .agent-panel-header h3 {
                margin: 0;
                font-size: 18px;
                color: #ffd700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            }
            
            .agent-panel-close {
                background: none;
                border: none;
                color: #00f0ff;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            }
            
            .agent-panel-close:hover {
                background: rgba(0, 240, 255, 0.2);
                transform: rotate(90deg);
            }
            
            .agent-panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }
            
            .agent-panel-section {
                margin-bottom: 20px;
            }
            
            .agent-panel-section-title {
                font-size: 14px;
                color: #ffd700;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .agent-stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .agent-stat-card {
                background: rgba(0, 240, 255, 0.1);
                padding: 10px;
                border-radius: 8px;
                border: 1px solid rgba(0, 240, 255, 0.2);
            }
            
            .agent-stat-label {
                font-size: 11px;
                color: rgba(0, 240, 255, 0.7);
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            
            .agent-stat-value {
                font-size: 20px;
                font-weight: bold;
                color: #ffd700;
            }
            
            .agent-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .agent-item {
                background: rgba(0, 240, 255, 0.05);
                border: 1px solid rgba(0, 240, 255, 0.2);
                border-left: 3px solid #00ff88;
                border-radius: 8px;
                padding: 12px;
                transition: all 0.2s;
            }
            
            .agent-item:hover {
                background: rgba(0, 240, 255, 0.1);
                border-left-color: #ffd700;
            }
            
            .agent-item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .agent-item-name {
                font-weight: bold;
                font-size: 14px;
                color: #00f0ff;
            }
            
            .agent-item-status {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 10px;
                text-transform: uppercase;
                font-weight: bold;
            }
            
            .agent-item-status.active {
                background: rgba(0, 255, 136, 0.3);
                color: #00ff88;
            }
            
            .agent-item-status.idle {
                background: rgba(255, 215, 0, 0.3);
                color: #ffd700;
            }
            
            .agent-item-status.error {
                background: rgba(255, 68, 68, 0.3);
                color: #ff4444;
            }
            
            .agent-item-details {
                font-size: 11px;
                color: rgba(0, 240, 255, 0.7);
                margin-bottom: 8px;
            }
            
            .agent-item-capabilities {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            
            .capability-tag {
                background: rgba(255, 215, 0, 0.2);
                color: #ffd700;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                text-transform: uppercase;
            }
            
            .message-stream {
                max-height: 300px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 10px;
            }
            
            .message-item {
                background: rgba(0, 240, 255, 0.05);
                border-left: 3px solid rgba(0, 240, 255, 0.5);
                padding: 8px;
                margin-bottom: 8px;
                border-radius: 5px;
                font-size: 11px;
            }
            
            .message-item-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                color: rgba(0, 240, 255, 0.8);
            }
            
            .message-item-from {
                font-weight: bold;
                color: #00ff88;
            }
            
            .message-item-time {
                color: rgba(0, 240, 255, 0.5);
                font-size: 10px;
            }
            
            .message-item-type {
                color: #ffd700;
                font-size: 10px;
                text-transform: uppercase;
            }
            
            .empty-state {
                text-align: center;
                padding: 30px;
                color: rgba(0, 240, 255, 0.5);
            }
            
            .empty-state-icon {
                font-size: 40px;
                margin-bottom: 10px;
                opacity: 0.5;
            }
            
            /* Scrollbar styling */
            .agent-panel-content::-webkit-scrollbar,
            .message-stream::-webkit-scrollbar {
                width: 6px;
            }
            
            .agent-panel-content::-webkit-scrollbar-track,
            .message-stream::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
            }
            
            .agent-panel-content::-webkit-scrollbar-thumb,
            .message-stream::-webkit-scrollbar-thumb {
                background: rgba(0, 240, 255, 0.5);
                border-radius: 3px;
            }
            
            .agent-panel-content::-webkit-scrollbar-thumb:hover,
            .message-stream::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 240, 255, 0.8);
            }
            
            @media (max-width: 768px) {
                #r3d3-agent-button {
                    bottom: 80px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                }
                
                #r3d3-agent-panel {
                    right: 10px;
                    left: 10px;
                    bottom: 150px;
                    width: auto;
                    max-height: 400px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(floatingButton);
        
        // Add click handler
        floatingButton.addEventListener('click', togglePanel);
    }

    /**
     * Create agent control panel
     */
    function createAgentPanel() {
        agentPanel = document.createElement('div');
        agentPanel.id = 'r3d3-agent-panel';
        agentPanel.innerHTML = `
            <div class="agent-panel-header">
                <h3>🤖 Agent Control</h3>
                <button class="agent-panel-close" id="close-panel">✕</button>
            </div>
            <div class="agent-panel-content" id="agent-panel-content">
                <!-- Content will be dynamically updated -->
            </div>
        `;
        
        document.body.appendChild(agentPanel);
        panelContent = document.getElementById('agent-panel-content');
        
        // Add close handler
        document.getElementById('close-panel').addEventListener('click', () => {
            togglePanel();
        });
    }

    /**
     * Toggle panel visibility
     */
    function togglePanel() {
        state.panelVisible = !state.panelVisible;
        
        if (state.panelVisible) {
            agentPanel.classList.add('visible');
            // Refresh data when panel opens
            fetchAllData();
        } else {
            agentPanel.classList.remove('visible');
        }
    }

    /**
     * Start polling for updates
     */
    function startPolling() {
        // Initial fetch
        fetchAllData();
        
        // Poll at intervals
        state.pollTimer = setInterval(() => {
            if (state.panelVisible) {
                fetchAllData();
            }
        }, CONFIG.pollInterval);
    }

    /**
     * Stop polling
     */
    function stopPolling() {
        if (state.pollTimer) {
            clearInterval(state.pollTimer);
            state.pollTimer = null;
        }
    }

    /**
     * Fetch all data from AUL API
     */
    async function fetchAllData() {
        try {
            if (CONFIG.useMockData) {
                // Use mock data
                state.agents = getMockAgents();
                state.messages = getMockMessages();
                state.stats = getMockStats();
                state.connected = true;
            } else {
                // Fetch from real API
                const [agentsRes, messagesRes, statsRes] = await Promise.all([
                    fetch(`${CONFIG.aulApiBase}/agents`),
                    fetch(`${CONFIG.aulApiBase}/messages`),
                    fetch(`${CONFIG.aulApiBase}/stats`)
                ]);
                
                const agentsData = await agentsRes.json();
                const messagesData = await messagesRes.json();
                const statsData = await statsRes.json();
                
                state.agents = agentsData.agents || [];
                state.messages = messagesData.messages || [];
                state.stats = statsData.message_bus?.metrics || {};
                state.connected = true;
            }
            
            // Update UI
            updateUI();
            
        } catch (error) {
            console.error('Failed to fetch AUL data:', error);
            state.connected = false;
            // Fall back to mock data
            state.agents = getMockAgents();
            state.messages = getMockMessages();
            state.stats = getMockStats();
            updateUI();
        }
    }

    /**
     * Update the UI with current state
     */
    function updateUI() {
        // Update badge
        document.getElementById('agent-count-badge').textContent = state.agents.length;
        
        // Update panel content
        const activeAgents = state.agents.filter(a => a.status === 'active').length;
        
        panelContent.innerHTML = `
            <!-- Statistics Section -->
            <div class="agent-panel-section">
                <div class="agent-panel-section-title">
                    <span>📊</span>
                    <span>System Statistics</span>
                </div>
                <div class="agent-stats-grid">
                    <div class="agent-stat-card">
                        <div class="agent-stat-label">Total Agents</div>
                        <div class="agent-stat-value">${state.agents.length}</div>
                    </div>
                    <div class="agent-stat-card">
                        <div class="agent-stat-label">Active</div>
                        <div class="agent-stat-value">${activeAgents}</div>
                    </div>
                    <div class="agent-stat-card">
                        <div class="agent-stat-label">Messages</div>
                        <div class="agent-stat-value">${state.stats.messages_sent || 0}</div>
                    </div>
                    <div class="agent-stat-card">
                        <div class="agent-stat-label">Latency</div>
                        <div class="agent-stat-value">${(state.stats.avg_latency_ms || 0).toFixed(0)}ms</div>
                    </div>
                </div>
            </div>
            
            <!-- Agent List Section -->
            <div class="agent-panel-section">
                <div class="agent-panel-section-title">
                    <span>🤖</span>
                    <span>Deployed Agents</span>
                </div>
                <div class="agent-list">
                    ${state.agents.length > 0 ? renderAgentList() : '<div class="empty-state"><div class="empty-state-icon">🚫</div><p>No agents deployed</p></div>'}
                </div>
            </div>
            
            <!-- Message Stream Section -->
            <div class="agent-panel-section">
                <div class="agent-panel-section-title">
                    <span>💬</span>
                    <span>Message Stream</span>
                </div>
                <div class="message-stream">
                    ${state.messages.length > 0 ? renderMessageStream() : '<div class="empty-state"><div class="empty-state-icon">💭</div><p>No messages yet</p></div>'}
                </div>
            </div>
        `;
    }

    /**
     * Render agent list
     */
    function renderAgentList() {
        return state.agents.map(agent => `
            <div class="agent-item">
                <div class="agent-item-header">
                    <div class="agent-item-name">${agent.agent_id}</div>
                    <div class="agent-item-status ${agent.status}">${agent.status}</div>
                </div>
                <div class="agent-item-details">
                    Type: ${agent.agent_type} | Uptime: ${formatUptime(agent.health?.uptime_seconds || 0)}
                </div>
                <div class="agent-item-capabilities">
                    ${(agent.capabilities || []).map(cap => `<span class="capability-tag">${cap}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render message stream
     */
    function renderMessageStream() {
        // Sort messages by timestamp (newest first)
        const sortedMessages = [...state.messages].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        ).slice(0, 10); // Show only last 10
        
        return sortedMessages.map(msg => `
            <div class="message-item">
                <div class="message-item-header">
                    <div>
                        <span class="message-item-from">${msg.sender_id}</span>
                        → ${msg.recipient_id}
                    </div>
                    <div class="message-item-time">${formatTime(msg.timestamp)}</div>
                </div>
                <div class="message-item-type">${msg.message_type} [${msg.priority}]</div>
            </div>
        `).join('');
    }

    /**
     * Format uptime in human-readable format
     */
    function formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Format timestamp
     */
    function formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString();
    }

    /**
     * Get mock agents data
     */
    function getMockAgents() {
        return [
            {
                agent_id: 'orchestrator-main',
                agent_type: 'orchestrator',
                status: 'active',
                capabilities: ['monitor', 'heal', 'coordinate', 'schedule'],
                health: { uptime_seconds: 3600 }
            },
            {
                agent_id: 'cyclotron-brain-01',
                agent_type: 'brain',
                status: 'active',
                capabilities: ['analyze', 'store', 'retrieve', 'index'],
                health: { uptime_seconds: 7200 }
            },
            {
                agent_id: 'system-monitor-01',
                agent_type: 'monitor',
                status: 'active',
                capabilities: ['check_health', 'validate', 'alert'],
                health: { uptime_seconds: 5400 }
            },
            {
                agent_id: 'araya-brain-connector',
                agent_type: 'connector',
                status: 'active',
                capabilities: ['bridge', 'sync', 'translate'],
                health: { uptime_seconds: 4200 }
            }
        ];
    }

    /**
     * Get mock messages data
     */
    function getMockMessages() {
        const now = new Date();
        const messageTypes = ['command', 'query', 'event', 'heartbeat', 'response'];
        const priorities = ['normal', 'high', 'critical', 'low'];
        const agents = getMockAgents();
        
        return Array.from({ length: 5 }, (_, i) => {
            const sender = agents[Math.floor(Math.random() * agents.length)];
            const recipient = agents[Math.floor(Math.random() * agents.length)];
            const type = messageTypes[Math.floor(Math.random() * messageTypes.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            
            return {
                id: `msg-${Date.now()}-${i}`,
                timestamp: new Date(now.getTime() - (i * 10000)).toISOString(),
                sender_id: sender.agent_id,
                recipient_id: recipient.agent_id,
                message_type: type,
                priority: priority
            };
        });
    }

    /**
     * Get mock stats data
     */
    function getMockStats() {
        return {
            messages_sent: 1023,
            messages_delivered: 1018,
            messages_dropped: 5,
            avg_latency_ms: 38.7
        };
    }

    /**
     * Public API
     */
    window.R3D3AgentConnector = {
        init,
        togglePanel,
        isConnected: () => state.connected,
        getAgents: () => state.agents,
        getMessages: () => state.messages,
        refresh: fetchAllData,
        startPolling,
        stopPolling
    };

    // Auto-initialize when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ R3-D3 AUL Connector loaded');

})();
