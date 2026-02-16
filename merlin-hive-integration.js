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
 * File: merlin-hive-integration.js
 * Declaration ID: IP-5D28B8B6-MLL28ZVI
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

/** SIGNED BY MeRLynn - ID: MERLYNN-7e847667 - TIMESTAMP: 2025-12-19T05:53:06.523Z - HASH: 6d035e54 */
/** SIGNED BY AGentR - ID: AGENTR-4814af1a - TIMESTAMP: 2025-12-19T05:53:06.523Z - HASH: 6d035e54 */

/**
 * MERLIN HIVE INTEGRATION SCRIPT
 * ================================
 * 
 * PURPOSE: Integrates the existing agent management system with the enhanced Merlin AI Hive
 * AGENT-COMMENT: Bridges legacy agents with new autonomous learning/enhancement capabilities
 * 
 * FEATURES:
 * - Connects ManagementAgent, DeploymentAgent, GitHubPRAgent with Merlin Hive
 * - Enables cross-system knowledge sharing
 * - Provides unified command interface
 * - Maintains separate audit trails while enabling integration
 * 
 * USAGE: Include this script after both systems are loaded
 */

(function() {
  'use strict';

  // AGENT-COMMENT: Integration bridge between systems
  const MerlinIntegration = {
    // Track integration status
    status: {
      connected: false,
      lastSync: null,
      agentsLinked: 0
    },

    /**
     * Initialize integration between systems
     * AGENT-ENHANCEMENT: Auto-discovery of available agents with iframe support
     */
    async init() {
      console.log('🔗 Initializing Merlin Hive Integration...');

      // Set up iframe communication bridges
      this.setupIframeBridges();

      // Try direct access first (for non-iframe contexts)
      const directAccess = (typeof AgentCoordinator !== 'undefined' || typeof window.Orchestrator !== 'undefined');
      
      if (directAccess) {
        console.log('✓ Direct system access available');
        
        // Link existing agents to Merlin Hive
        await this.linkAgents();

        // Set up knowledge sharing
        await this.enableKnowledgeSharing();

        // Enable cross-system event propagation
        this.enableEventBridge();

        this.status.connected = true;
      } else {
        console.log('ℹ️  Using iframe bridge mode');
        // Systems are in iframes - communication via postMessage
        this.status.connected = false; // Will be updated when iframes respond
      }

      this.status.lastSync = new Date().toISOString();

      console.log(`✅ Merlin Hive Integration ${this.status.connected ? 'Complete' : 'Ready (iframe mode)'}`);
      console.log(`📊 Linked ${this.status.agentsLinked} agents`);

      return true;
    },

    /**
     * Set up communication bridges with iframes
     * AGENT-COMMENT: Enable postMessage-based iframe communication
     */
    setupIframeBridges() {
      // Listen for messages from iframes
      window.addEventListener('message', (event) => {
        // Security: verify origin is same as current page
        if (event.origin !== window.location.origin) {
          return;
        }

        const message = event.data;
        
        if (message.type === 'iframe-ready') {
          console.log(`✓ ${message.source} iframe ready`);
          this.handleIframeReady(message.source);
        } else if (message.type === 'command-response') {
          this.handleCommandResponse(message);
        } else if (message.type === 'status-update') {
          this.handleStatusUpdate(message);
        }
      });

      console.log('✓ Iframe message bridges established');
    },

    /**
     * Handle iframe ready notification
     */
    handleIframeReady(source) {
      if (source === 'merlin-hive' || source === 'agent-management') {
        this.status.connected = true;
        this.status.agentsLinked++;
      }
    },

    /**
     * Handle command response from iframe
     */
    handleCommandResponse(message) {
      if (this.pendingCommands && this.pendingCommands[message.commandId]) {
        const { resolve, reject } = this.pendingCommands[message.commandId];
        if (message.success) {
          resolve(message.result);
        } else {
          reject(new Error(message.error));
        }
        delete this.pendingCommands[message.commandId];
      }
    },

    /**
     * Handle status update from iframe
     */
    handleStatusUpdate(message) {
      if (message.source === 'merlin-hive') {
        this.merlinStatus = message.status;
      } else if (message.source === 'agent-management') {
        this.legacyStatus = message.status;
      }
    },

    /**
     * Send command to iframe
     */
    sendIframeCommand(iframeId, command) {
      return new Promise((resolve, reject) => {
        const iframe = document.getElementById(iframeId);
        if (!iframe || !iframe.contentWindow) {
          reject(new Error(`Iframe ${iframeId} not found`));
          return;
        }

        const commandId = `cmd-${Date.now()}-${Math.random()}`;
        
        // Store promise handlers
        if (!this.pendingCommands) {
          this.pendingCommands = {};
        }
        this.pendingCommands[commandId] = { resolve, reject };

        // Send message to iframe
        iframe.contentWindow.postMessage({
          type: 'execute-command',
          commandId,
          command
        }, window.location.origin);

        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.pendingCommands[commandId]) {
            delete this.pendingCommands[commandId];
            reject(new Error('Command timeout'));
          }
        }, 5000);
      });
    },

    /**
     * Link existing agents to Merlin Hive
     * AGENT-COMMENT: Creates bridge between agent systems
     */
    async linkAgents() {
      // Legacy agent types that can be integrated
      const legacyAgents = ['management', 'deployment', 'github-pr'];

      for (const agentType of legacyAgents) {
        try {
          // Create Merlin Hive representation
          if (typeof window.AgentSDK !== 'undefined') {
            await window.AgentSDK.spawn({
              klass: 'builder',
              nick: `Legacy-${agentType}`,
              skills: `legacy,${agentType},integration`
            });

            this.status.agentsLinked++;
            console.log(`✓ Linked legacy agent: ${agentType}`);
          }
        } catch (error) {
          console.error(`Failed to link ${agentType}:`, error);
        }
      }
    },

    /**
     * Enable knowledge sharing between systems
     * AGENT-ENHANCEMENT: Bidirectional knowledge flow
     */
    async enableKnowledgeSharing() {
      console.log('📚 Enabling knowledge sharing...');

      // Export legacy agent logs to Merlin knowledge base
      if (typeof AgentLogger !== 'undefined' && typeof window.DB !== 'undefined') {
        try {
          const legacyLogs = this.getLegacyLogs();
          
          // Import into Merlin knowledge base
          await window.DB.put('knowledge', {
            id: 'legacy-agent-knowledge',
            source: 'agent-management-system',
            items: legacyLogs,
            timestamp: new Date().toISOString()
          });

          console.log(`✓ Imported ${legacyLogs.length} legacy logs to knowledge base`);
        } catch (error) {
          console.error('Knowledge sharing error:', error);
        }
      }

      // Set up periodic sync (every 5 minutes)
      setInterval(() => {
        this.syncKnowledge();
      }, 5 * 60 * 1000);
    },

    /**
     * Get legacy agent logs
     * AGENT-COMMENT: Extract knowledge from legacy system
     */
    getLegacyLogs() {
      if (typeof AgentLogger === 'undefined') {
        return [];
      }

      try {
        const stored = localStorage.getItem('agent-system-logs');
        if (stored) {
          const logs = JSON.parse(stored);
          return logs.slice(-100); // Last 100 logs
        }
      } catch (error) {
        console.error('Failed to retrieve legacy logs:', error);
      }

      return [];
    },

    /**
     * Sync knowledge between systems
     * AGENT-ENHANCEMENT: Continuous knowledge synchronization
     */
    async syncKnowledge() {
      if (!this.status.connected) return;

      console.log('🔄 Syncing knowledge between systems...');

      const legacyLogs = this.getLegacyLogs();
      
      if (legacyLogs.length > 0 && typeof window.DB !== 'undefined') {
        await window.DB.put('knowledge', {
          id: 'legacy-agent-knowledge',
          source: 'agent-management-system',
          items: legacyLogs,
          timestamp: new Date().toISOString()
        });

        this.status.lastSync = new Date().toISOString();
      }
    },

    /**
     * Enable event bridge between systems
     * AGENT-COMMENT: Cross-system event propagation
     */
    enableEventBridge() {
      console.log('🌉 Building event bridge...');

      // Bridge legacy events to Merlin Hive
      if (typeof window.Bus !== 'undefined') {
        // Listen for legacy agent events
        const legacyEvents = ['agent-spawned', 'task-completed', 'error-detected', 'health-check'];

        legacyEvents.forEach(eventType => {
          window.Bus.on(eventType, async (data) => {
            // Propagate to Merlin audit system
            if (typeof window.Audit !== 'undefined') {
              await window.Audit.record('legacy-agent', eventType, data);
            }
          });
        });

        console.log('✓ Event bridge established');
      }
    },

    /**
     * Execute command on both systems
     * AGENT-ENHANCEMENT: Unified command interface with iframe support
     */
    async executeUnified(command) {
      const results = {
        merlin: null,
        legacy: null
      };

      // Try direct access first
      if (typeof window.Orchestrator !== 'undefined') {
        try {
          switch (command.type) {
            case 'start':
              window.Orchestrator.start();
              results.merlin = { success: true, message: 'Orchestrator started' };
              break;
            case 'pause':
              window.Orchestrator.pause();
              results.merlin = { success: true, message: 'Orchestrator paused' };
              break;
            case 'health-check':
              // Trigger health check task
              window.Orchestrator.enqueue({ type: 'enhance', priority: 9, target: null });
              results.merlin = { success: true, message: 'Health check queued' };
              break;
          }
        } catch (error) {
          results.merlin = { success: false, error: error.message };
        }
      } else {
        // Try iframe communication
        try {
          const iframeResult = await this.sendIframeCommand('merlin-frame', command);
          results.merlin = iframeResult;
        } catch (error) {
          console.warn('Merlin iframe command failed:', error.message);
          results.merlin = { success: false, error: error.message };
        }
      }

      // Execute on legacy system
      if (typeof AgentCoordinator !== 'undefined') {
        try {
          const coordinator = window.agentCoordinator;
          if (coordinator) {
            switch (command.type) {
              case 'start':
                await coordinator.startFullOperation();
                results.legacy = { success: true, message: 'Full operation started' };
                break;
              case 'health-check':
                await coordinator.quickHealthCheck();
                results.legacy = { success: true, message: 'Health check completed' };
                break;
            }
          }
        } catch (error) {
          results.legacy = { success: false, error: error.message };
        }
      } else {
        // Try iframe communication
        try {
          const iframeResult = await this.sendIframeCommand('legacy-frame', command);
          results.legacy = iframeResult;
        } catch (error) {
          console.warn('Legacy iframe command failed:', error.message);
          results.legacy = { success: false, error: error.message };
        }
      }

      return results;
    },

    /**
     * Get unified system status
     * AGENT-COMMENT: Combined status from both systems
     */
    getStatus() {
      const status = {
        integration: this.status,
        merlin: this.merlinStatus || {},
        legacy: this.legacyStatus || {}
      };

      // Get Merlin Hive status (direct access if available)
      if (typeof window.AgentSDK !== 'undefined') {
        status.merlin = {
          agents: Object.keys(window.AgentSDK.registry).length,
          running: window.Orchestrator?.running || false
        };
      }

      // Get legacy system status (direct access if available)
      if (typeof window.agentCoordinator !== 'undefined') {
        status.legacy = window.agentCoordinator.getStatus();
      }

      return status;
    }
  };

  // AGENT-COMMENT: Auto-initialize when both systems are ready
  // AGENT-ENHANCEMENT: Proper readiness checks instead of fixed timeout
  function checkReadiness(maxAttempts = 10) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Check if both systems are ready
      const merlinReady = typeof window.Orchestrator !== 'undefined' && 
                         typeof window.AgentSDK !== 'undefined';
      const coordinatorReady = typeof AgentCoordinator !== 'undefined';
      
      if (merlinReady || coordinatorReady || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        MerlinIntegration.init();
        console.log(`Integration initialized after ${attempts} checks`);
      }
    }, 500); // Check every 500ms instead of waiting 3 seconds
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkReadiness();
    });
  } else {
    checkReadiness();
  }

  // Expose integration interface globally
  window.MerlinIntegration = MerlinIntegration;

  console.log('📦 Merlin Integration Script Loaded');
})();
