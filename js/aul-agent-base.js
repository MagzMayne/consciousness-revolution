// RootIB: RB-20260319142113-51AEC42E
/**
 * AUL Agent Base Class (JavaScript)
 * Universal foundation for browser-based autonomous agents
 */

/**
 * AUL Message class
 */
class AULMessage {
    constructor({
        senderId,
        senderType,
        messageType,
        payload,
        recipientId = null,
        priority = 'normal',
        correlationId = null,
        ttl = 300
    }) {
        this.messageId = this.generateUUID();
        this.timestamp = new Date().toISOString();
        this.senderId = senderId;
        this.senderType = senderType;
        this.recipientId = recipientId;
        this.messageType = messageType;
        this.priority = priority;
        this.payload = payload;
        this.correlationId = correlationId || this.messageId;
        this.ttl = ttl;
        this.trace = [];
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    toDict() {
        return {
            aul_version: '1.0',
            message_id: this.messageId,
            timestamp: this.timestamp,
            sender: {
                agent_id: this.senderId,
                agent_type: this.senderType
            },
            recipient: {
                agent_id: this.recipientId,
                routing: this.recipientId ? 'direct' : 'broadcast'
            },
            message: {
                type: this.messageType,
                priority: this.priority,
                payload: this.payload,
                ttl: this.ttl
            },
            context: {
                correlation_id: this.correlationId,
                trace: this.trace
            }
        };
    }
    
    static fromDict(data) {
        const msg = new AULMessage({
            senderId: data.sender.agent_id,
            senderType: data.sender.agent_type,
            messageType: data.message.type,
            payload: data.message.payload,
            recipientId: data.recipient.agent_id,
            priority: data.message.priority || 'normal',
            correlationId: data.context.correlation_id,
            ttl: data.message.ttl || 300
        });
        msg.messageId = data.message_id;
        msg.timestamp = data.timestamp;
        msg.trace = data.context.trace || [];
        return msg;
    }
}

/**
 * AUL Agent base class
 */
class AULAgent {
    constructor({
        agentId,
        agentType,
        version = '1.0.0',
        capabilities = [],
        heartbeatInterval = 30000  // 30 seconds in milliseconds
    }) {
        this.agentId = agentId;
        this.agentType = agentType;
        this.version = version;
        this.capabilities = capabilities;
        this.heartbeatInterval = heartbeatInterval;
        
        // State
        this.status = 'initializing';
        this.startTime = Date.now();
        this.errorCount = 0;
        this.successCount = 0;
        this.messageHandlers = new Map();
        
        // Threading
        this._running = false;
        this._heartbeatTimer = null;
        
        // Performance metrics
        this.metrics = {
            requestsPerSecond: 0.0,
            avgResponseMs: 0.0,
            errorRatePercent: 0.0
        };
        
        console.log(`AUL Agent initialized: ${this.agentId} (${this.agentType})`);
    }
    
    getCapabilityDeclaration() {
        return {
            agent_id: this.agentId,
            agent_type: this.agentType,
            version: this.version,
            status: this.status,
            capabilities: {
                actions: this.capabilities,
                max_throughput: this.getMaxThroughput(),
                avg_latency_ms: this.metrics.avgResponseMs
            },
            health: this.getHealthStatus(),
            endpoints: this.getEndpoints()
        };
    }
    
    getHealthStatus() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const totalOps = this.successCount + this.errorCount;
        const successRate = totalOps > 0 ? (this.successCount / totalOps * 100) : 100.0;
        
        return {
            uptime_seconds: uptime,
            last_heartbeat: new Date().toISOString(),
            error_count: this.errorCount,
            success_count: this.successCount,
            success_rate: Math.round(successRate * 100) / 100
        };
    }
    
    getEndpoints() {
        return {
            health: `/agent/${this.agentId}/health`,
            execute: `/agent/${this.agentId}/execute`,
            status: `/agent/${this.agentId}/status`
        };
    }
    
    getMaxThroughput() {
        return 100;  // Override in subclass
    }
    
    registerHandler(messageType, handler) {
        this.messageHandlers.set(messageType, handler);
        console.log(`Registered handler for message type: ${messageType}`);
    }
    
    sendMessage({
        messageType,
        payload,
        recipientId = null,
        priority = 'normal'
    }) {
        const message = new AULMessage({
            senderId: this.agentId,
            senderType: this.agentType,
            messageType,
            payload,
            recipientId,
            priority
        });
        
        // Add to trace
        message.trace.push({
            agent_id: this.agentId,
            timestamp: message.timestamp,
            action: 'sent'
        });
        
        this.onSendMessage(message);
        return message;
    }
    
    async receiveMessage(message) {
        const startTime = Date.now();

        // ── MiroFish Quantum Foresight: pre-action error prediction ──────────
        // Run a lightweight look-ahead on recent error log before executing,
        // so the agent can self-heal *before* a failure occurs.
        try {
            if (typeof MiroFishQuantum !== 'undefined' && MiroFishQuantum.predictErrors) {
                const recentErrors = (this.recentErrorLog || []).slice(-20);
                if (recentErrors.length >= 3) {
                    const risks = MiroFishQuantum.predictErrors(this.agentId, recentErrors);
                    const highRisk = risks.filter(r => r.severity === 'high');
                    if (highRisk.length) {
                        console.warn(
                            `[MiroFish Foresight] ⚠️ Agent ${this.agentId} — high-risk pattern detected: ` +
                            `${highRisk[0].errorType} (${Math.round(highRisk[0].probability * 100)}%). ` +
                            `Remedy: ${highRisk[0].remedy}`
                        );
                    }
                }
            }
        } catch (_) { /* foresight is advisory — never block execution */ }

        try {
            // Add to trace
            message.trace.push({
                agent_id: this.agentId,
                timestamp: new Date().toISOString(),
                action: 'received'
            });
            
            // Check if we have a handler
            let result;
            if (this.messageHandlers.has(message.messageType)) {
                const handler = this.messageHandlers.get(message.messageType);
                result = await handler(message);
            } else {
                result = await this.handleMessage(message);
            }
            
            // Track success
            const executionTime = Date.now() - startTime;
            this.successCount++;
            this._updateMetrics(executionTime, true);
            
            // Return response
            return {
                success: true,
                data: result,
                execution_time_ms: Math.round(executionTime * 100) / 100
            };
            
        } catch (error) {
            // ── Record error in rolling log for foresight ────────────────────
            if (!this.recentErrorLog) this.recentErrorLog = [];
            this.recentErrorLog.push(error.message || String(error));
            if (this.recentErrorLog.length > 50) this.recentErrorLog.shift();

            console.error(`Error processing message: ${error.message}`);
            this.errorCount++;
            const executionTime = Date.now() - startTime;
            this._updateMetrics(executionTime, false);
            
            return {
                success: false,
                error: error.message,
                execution_time_ms: Math.round(executionTime * 100) / 100
            };
        }
    }
    
    _updateMetrics(executionTimeMs, success) {
        // Update average response time (exponential moving average)
        const alpha = 0.1;
        this.metrics.avgResponseMs = 
            alpha * executionTimeMs + 
            (1 - alpha) * this.metrics.avgResponseMs;
        
        // Update error rate
        const total = this.successCount + this.errorCount;
        if (total > 0) {
            this.metrics.errorRatePercent = (this.errorCount / total) * 100;
        }
    }
    
    sendHeartbeat() {
        const heartbeat = this.sendMessage({
            messageType: 'heartbeat',
            payload: {
                status: this.status,
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                load: this.metrics.avgResponseMs
            }
        });
        console.debug(`Heartbeat sent: ${this.agentId}`);
        return heartbeat;
    }
    
    _heartbeatLoop() {
        if (!this._running) return;
        
        try {
            this.sendHeartbeat();
        } catch (error) {
            console.error(`Heartbeat error: ${error.message}`);
        }
        
        // Schedule next heartbeat
        this._heartbeatTimer = setTimeout(
            () => this._heartbeatLoop(),
            this.heartbeatInterval
        );
    }
    
    start() {
        if (this._running) {
            console.warn(`Agent ${this.agentId} already running`);
            return;
        }
        
        this._running = true;
        this.status = 'active';
        
        // Start heartbeat loop
        this._heartbeatLoop();
        
        // Call subclass initialization
        this.onStart();
        
        console.log(`Agent started: ${this.agentId}`);
    }
    
    stop() {
        if (!this._running) return;
        
        console.log(`Stopping agent: ${this.agentId}`);
        this._running = false;
        this.status = 'offline';
        
        // Stop heartbeat
        if (this._heartbeatTimer) {
            clearTimeout(this._heartbeatTimer);
            this._heartbeatTimer = null;
        }
        
        // Call subclass cleanup
        this.onStop();
        
        console.log(`Agent stopped: ${this.agentId}`);
    }
    
    handleError(error, level = 'L2') {
        console.error(`Error (Level ${level}): ${error.message}`);
        
        if (level === 'L1') {  // Transient - retry
            return this.retryWithBackoff();
        } else if (level === 'L2') {  // Degraded - continue
            this.status = 'degraded';
            return { fallback: true };
        } else if (level === 'L3') {  // Critical - escalate
            return this.escalateToOrchestrator(error);
        } else {  // L4 - Fatal
            this.gracefulShutdown(error);
        }
    }
    
    async retryWithBackoff(maxRetries = 5) {
        for (let i = 0; i < maxRetries; i++) {
            const delay = Math.min(100 * Math.pow(2, i), 30000);  // Max 30s
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            // Retry logic here
        }
        return null;
    }
    
    escalateToOrchestrator(error) {
        this.sendMessage({
            messageType: 'event',
            payload: {
                event_name: 'critical_error',
                agent_id: this.agentId,
                error: error.message
            },
            priority: 'critical'
        });
    }
    
    gracefulShutdown(error) {
        console.error(`Fatal error, shutting down: ${error.message}`);
        this.stop();
    }
    
    // ── MiroFish Quantum Foresight helpers ───────────────────────────────────

    /**
     * Run a MiroFish foresight query on behalf of this agent.
     * Returns a ForesightResult (or null if the engine is unavailable).
     *
     * @param {string} topic   - What to predict (e.g. "next action outcome")
     * @param {number} [rounds=3] - Simulation rounds (1–20)
     * @returns {Promise<object|null>}
     */
    async quantumForesight(topic, rounds = 3) {
        try {
            if (typeof MiroFishQuantum !== 'undefined' && MiroFishQuantum.runForesight) {
                const result = await MiroFishQuantum.runForesight(
                    `[${this.agentId}] ${topic}`, rounds
                );
                console.info(
                    `[MiroFish] 🐟 ${this.agentId} foresight → ${result.topScenario?.label} ` +
                    `(${Math.round((result.topScenario?.probability || 0) * 100)}%)`
                );
                return result;
            }
        } catch (_) { /* foresight is advisory — never throw */ }
        return null;
    }

    /**
     * Seed MiroFish swarm with context strings so subsequent foresight calls
     * are more informed.  Safe no-op if engine is not loaded.
     *
     * @param {string[]} seeds
     */
    seedQuantumSwarm(seeds) {
        try {
            if (typeof MiroFishQuantum !== 'undefined' && MiroFishQuantum.seedSwarm) {
                MiroFishQuantum.seedSwarm(seeds);
            }
        } catch (_) { /* advisory only */ }
    }

    // Abstract methods - implement in subclass
    
    async handleMessage(message) {
        throw new Error('handleMessage must be implemented by subclass');
    }
    
    onStart() {
        // Override if needed
    }
    
    onStop() {
        // Override if needed
    }
    
    onSendMessage(message) {
        // Override if needed
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AULAgent, AULMessage };
}

// Example usage (commented out)
/*
class ExampleAgent extends AULAgent {
    constructor() {
        super({
            agentId: 'example-agent-01',
            agentType: 'example',
            capabilities: ['read', 'analyze']
        });
    }
    
    async handleMessage(message) {
        console.log(`Received message: ${message.messageType}`);
        return { processed: true };
    }
}

// Create and start agent
const agent = new ExampleAgent();
agent.start();

// Test message
const testMsg = new AULMessage({
    senderId: 'test-sender',
    senderType: 'test',
    messageType: 'command',
    payload: { action: 'test' }
});

agent.receiveMessage(testMsg).then(response => {
    console.log('Response:', JSON.stringify(response, null, 2));
});

// Stop agent after 2 seconds
setTimeout(() => agent.stop(), 2000);
*/
