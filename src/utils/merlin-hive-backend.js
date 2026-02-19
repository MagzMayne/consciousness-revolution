/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Merlin Hive Backend Integration Module
 * 
 * PURPOSE: Provides backend connectivity for the zMerlinHive autonomous agent system
 * 
 * FEATURES:
 * - Supabase integration for agent state persistence
 * - Netlify Functions API integration
 * - Real-time agent synchronization
 * - Error handling with retry logic
 * - Offline mode with queue buffering
 * 
 * USAGE:
 *   import { MerlinHiveBackend } from './src/utils/merlin-hive-backend.js';
 *   
 *   const backend = new MerlinHiveBackend({
 *     supabaseUrl: 'YOUR_SUPABASE_URL',
 *     supabaseKey: 'YOUR_SUPABASE_KEY'
 *   });
 *   
 *   await backend.init();
 *   await backend.saveAgentState(agentId, state);
 *   const jobs = await backend.getAgentJobs(agentId);
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 */

export class MerlinHiveBackend {
  constructor(config = {}) {
    this.config = {
      supabaseUrl: config.supabaseUrl || null,
      supabaseKey: config.supabaseKey || null,
      netlifyApiUrl: config.netlifyApiUrl || '/.netlify/functions',
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      offlineMode: config.offlineMode || true,
      ...config
    };
    
    this.supabase = null;
    this.isConnected = false;
    this.offlineQueue = [];
    this.eventListeners = new Map();
  }

  /**
   * Initialize backend connections
   */
  async init() {
    console.log('🔌 Initializing Merlin Hive Backend...');
    
    try {
      // Initialize Supabase if configured
      if (this.config.supabaseUrl && this.config.supabaseKey) {
        await this.initSupabase();
      } else {
        console.warn('⚠️ Supabase not configured - running in local-only mode');
      }
      
      // Check Netlify Functions availability
      await this.checkNetlifyFunctions();
      
      // Start offline queue processor
      if (this.config.offlineMode) {
        this.startOfflineQueueProcessor();
      }
      
      console.log('✅ Merlin Hive Backend initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Backend initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize Supabase client
   */
  async initSupabase() {
    try {
      // Check if Supabase is available
      if (typeof window.supabase !== 'undefined') {
        this.supabase = window.supabase.createClient(
          this.config.supabaseUrl,
          this.config.supabaseKey
        );
        
        // Test connection
        const { data, error } = await this.supabase.from('merlin_agents').select('count').limit(1);
        if (!error) {
          this.isConnected = true;
          console.log('✅ Supabase connected successfully');
        } else {
          console.warn('⚠️ Supabase connection test failed:', error.message);
        }
      } else {
        console.warn('⚠️ Supabase SDK not loaded. Add: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
      }
    } catch (error) {
      console.warn('⚠️ Supabase initialization failed:', error.message);
    }
  }

  /**
   * Check Netlify Functions availability
   */
  async checkNetlifyFunctions() {
    try {
      const response = await fetch(`${this.config.netlifyApiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('✅ Netlify Functions available');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Netlify Functions not available:', error.message);
    }
    return false;
  }

  /**
   * Save agent state to backend
   */
  async saveAgentState(agentId, state) {
    if (!this.isConnected) {
      return this.queueOfflineAction('saveAgentState', { agentId, state });
    }

    try {
      const { data, error } = await this.supabase
        .from('merlin_agents')
        .upsert({
          agent_id: agentId,
          state: state,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'agent_id'
        });

      if (error) throw error;
      
      this.emit('agentStateSaved', { agentId, state });
      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to save agent state:', error);
      return this.queueOfflineAction('saveAgentState', { agentId, state });
    }
  }

  /**
   * Get agent state from backend
   */
  async getAgentState(agentId) {
    if (!this.isConnected) {
      console.warn('⚠️ Not connected to backend, returning null');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('merlin_agents')
        .select('*')
        .eq('agent_id', agentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      return data;
    } catch (error) {
      console.error('❌ Failed to get agent state:', error);
      return null;
    }
  }

  /**
   * Save agent job/task to backend
   */
  async saveAgentJob(job) {
    if (!this.isConnected) {
      return this.queueOfflineAction('saveAgentJob', { job });
    }

    try {
      const { data, error } = await this.supabase
        .from('merlin_jobs')
        .insert({
          agent_id: job.agentId,
          job_type: job.type,
          job_data: job,
          status: job.status || 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      this.emit('jobSaved', { job });
      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to save agent job:', error);
      return this.queueOfflineAction('saveAgentJob', { job });
    }
  }

  /**
   * Get agent jobs from backend
   */
  async getAgentJobs(agentId, limit = 50) {
    if (!this.isConnected) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('merlin_jobs')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Failed to get agent jobs:', error);
      return [];
    }
  }

  /**
   * Save audit log entry
   */
  async saveAuditLog(entry) {
    if (!this.isConnected) {
      return this.queueOfflineAction('saveAuditLog', { entry });
    }

    try {
      const { data, error } = await this.supabase
        .from('merlin_audit_logs')
        .insert({
          agent_id: entry.agentId || 'system',
          event_type: entry.event,
          event_data: entry,
          timestamp: entry.timestamp || new Date().toISOString()
        });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to save audit log:', error);
      return this.queueOfflineAction('saveAuditLog', { entry });
    }
  }

  /**
   * Get audit logs from backend
   */
  async getAuditLogs(filters = {}, limit = 100) {
    if (!this.isConnected) {
      return [];
    }

    try {
      let query = this.supabase
        .from('merlin_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (filters.agentId) {
        query = query.eq('agent_id', filters.agentId);
      }

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Failed to get audit logs:', error);
      return [];
    }
  }

  /**
   * Call Netlify Function
   */
  async callNetlifyFunction(functionName, payload = {}) {
    try {
      const response = await fetch(`${this.config.netlifyApiUrl}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`❌ Netlify Function ${functionName} failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Queue offline action for later processing
   */
  queueOfflineAction(action, params) {
    if (!this.config.offlineMode) {
      return { success: false, error: 'Not connected and offline mode disabled' };
    }

    this.offlineQueue.push({
      action,
      params,
      timestamp: new Date().toISOString()
    });

    console.log(`📦 Queued offline action: ${action} (queue size: ${this.offlineQueue.length})`);
    
    // Persist queue to localStorage
    this.persistOfflineQueue();
    
    return { success: true, queued: true };
  }

  /**
   * Start offline queue processor
   */
  startOfflineQueueProcessor() {
    // Load persisted queue
    this.loadOfflineQueue();

    // Process queue every 30 seconds
    setInterval(async () => {
      if (this.isConnected && this.offlineQueue.length > 0) {
        console.log(`🔄 Processing offline queue (${this.offlineQueue.length} items)...`);
        
        const queue = [...this.offlineQueue];
        this.offlineQueue = [];
        
        for (const item of queue) {
          try {
            await this[item.action](...Object.values(item.params));
          } catch (error) {
            console.error(`❌ Failed to process queued action ${item.action}:`, error);
            // Re-queue if failed
            this.offlineQueue.push(item);
          }
        }
        
        this.persistOfflineQueue();
      }
    }, 30000);
  }

  /**
   * Persist offline queue to localStorage
   */
  persistOfflineQueue() {
    try {
      localStorage.setItem('merlinHiveOfflineQueue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('❌ Failed to persist offline queue:', error);
    }
  }

  /**
   * Load offline queue from localStorage
   */
  loadOfflineQueue() {
    try {
      const stored = localStorage.getItem('merlinHiveOfflineQueue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        console.log(`📦 Loaded ${this.offlineQueue.length} queued actions from storage`);
      }
    } catch (error) {
      console.error('❌ Failed to load offline queue:', error);
    }
  }

  /**
   * Event emitter
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      for (const callback of this.eventListeners.get(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Event listener error for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      supabaseConfigured: !!(this.config.supabaseUrl && this.config.supabaseKey),
      offlineQueueSize: this.offlineQueue.length,
      offlineModeEnabled: this.config.offlineMode
    };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MerlinHiveBackend = MerlinHiveBackend;
}
