/**
 * AUL Message Router (JavaScript)
 * Client-side message routing and delivery for browser-based agents
 */

/**
 * Priority queue for messages
 */
class MessageQueue {
    constructor(maxSize = 10000) {
        this.queues = {
            critical: [],
            high: [],
            normal: [],
            low: []
        };
        this.maxSize = maxSize;
    }
    
    put(message) {
        const priority = message.priority || 'normal';
        const queue = this.queues[priority];
        
        if (queue.length >= this.maxSize) {
            console.warn('Message queue full, dropping oldest message');
            queue.shift();
        }
        
        queue.push(message);
    }
    
    get() {
        // Get from highest priority queue
        for (const priority of ['critical', 'high', 'normal', 'low']) {
            if (this.queues[priority].length > 0) {
                return this.queues[priority].shift();
            }
        }
        return null;
    }
    
    empty() {
        return Object.values(this.queues).every(q => q.length === 0);
    }
    
    size() {
        return Object.values(this.queues).reduce((sum, q) => sum + q.length, 0);
    }
}

/**
 * AUL Message Router
 */
class AULRouter {
    constructor(options = {}) {
        this.maxQueueSize = options.maxQueueSize || 10000;
        this.processInterval = options.processInterval || 100; // ms
        
        // Agent registry
        this.agents = new Map();
        this.subscribers = new Map();
        
        // Message queue
        this.messageQueue = new MessageQueue(this.maxQueueSize);
        
        // State
        this._running = false;
        this._processTimer = null;
        
        // Metrics
        this.metrics = {
            messagesSent: 0,
            messagesDelivered: 0,
            messagesDropped: 0,
            avgLatencyMs: 0.0
        };
        
        // Performance optimization
        this._agentCache = new Map();
        this._routingCache = new Map();
        
        console.log('AUL Message Router initialized');
    }
    
    registerAgent(agentId, agentType, capabilities, callback) {
        this.agents.set(agentId, {
            agentId,
            agentType,
            capabilities,
            callback,
            registeredAt: Date.now(),
            lastSeen: Date.now(),
            messageCount: 0
        });
        
        // Update cache
        this._agentCache.set(agentId, this.agents.get(agentId));
        
        console.log(`Agent registered: ${agentId} (${agentType})`);
    }
    
    unregisterAgent(agentId) {
        if (this.agents.has(agentId)) {
            this.agents.delete(agentId);
            this._agentCache.delete(agentId);
            console.log(`Agent unregistered: ${agentId}`);
        }
    }
    
    subscribe(messageType, callback) {
        if (!this.subscribers.has(messageType)) {
            this.subscribers.set(messageType, []);
        }
        this.subscribers.get(messageType).push(callback);
        console.log(`New subscriber for message type: ${messageType}`);
    }
    
    publish(message) {
        try {
            // Check TTL
            const messageAge = (Date.now() - new Date(message.timestamp).getTime()) / 1000;
            if (messageAge > message.ttl) {
                console.warn(`Message expired (age: ${messageAge}s)`);
                this.metrics.messagesDropped++;
                return false;
            }
            
            // Add to queue
            this.messageQueue.put(message);
            this.metrics.messagesSent++;
            
            console.debug(`Message published: ${message.messageId} (${message.messageType})`);
            return true;
            
        } catch (error) {
            console.error(`Failed to publish message: ${error.message}`);
            this.metrics.messagesDropped++;
            return false;
        }
    }
    
    _processLoop() {
        if (!this._running) return;
        
        try {
            // Process one message
            const message = this.messageQueue.get();
            if (message) {
                const startTime = Date.now();
                this._routeMessage(message);
                
                // Update metrics
                const latency = Date.now() - startTime;
                this._updateLatency(latency);
            }
            
        } catch (error) {
            console.error(`Process error: ${error.message}`);
        }
        
        // Schedule next iteration
        this._processTimer = setTimeout(
            () => this._processLoop(),
            this.processInterval
        );
    }
    
    _routeMessage(message) {
        let delivered = false;
        
        // Direct routing
        if (message.recipientId) {
            delivered = this._deliverToAgent(message, message.recipientId);
        }
        // Broadcast routing
        else {
            // Notify all subscribers
            const callbacks = this.subscribers.get(message.messageType) || [];
            for (const callback of callbacks) {
                try {
                    callback(message);
                    delivered = true;
                } catch (error) {
                    console.error(`Subscriber callback error: ${error.message}`);
                }
            }
            
            // Deliver to all capable agents
            for (const [agentId, agentInfo] of this.agents) {
                if (this._canHandle(agentInfo, message)) {
                    if (this._deliverToAgent(message, agentId)) {
                        delivered = true;
                    }
                }
            }
        }
        
        // Update metrics
        if (delivered) {
            this.metrics.messagesDelivered++;
        } else {
            this.metrics.messagesDropped++;
            console.warn(`Message not delivered: ${message.messageId}`);
        }
    }
    
    _deliverToAgent(message, agentId) {
        const agentInfo = this._agentCache.get(agentId);
        
        if (!agentInfo) {
            console.warn(`Agent not found: ${agentId}`);
            return false;
        }
        
        try {
            const callback = agentInfo.callback;
            if (callback) {
                callback(message);
                
                // Update agent stats
                agentInfo.lastSeen = Date.now();
                agentInfo.messageCount++;
                
                return true;
            } else {
                console.warn(`No callback for agent: ${agentId}`);
                return false;
            }
            
        } catch (error) {
            console.error(`Delivery error to ${agentId}: ${error.message}`);
            return false;
        }
    }
    
    _canHandle(agentInfo, message) {
        // Fast path: check cache
        const cacheKey = `${agentInfo.agentId}:${message.messageType}`;
        if (this._routingCache.has(cacheKey)) {
            return this._routingCache.get(cacheKey);
        }
        
        // Determine if agent can handle
        let canHandle = false;
        
        // All agents get heartbeats and events
        if (['heartbeat', 'event'].includes(message.messageType)) {
            canHandle = true;
        }
        
        // Check capabilities (simplified)
        
        // Cache result
        this._routingCache.set(cacheKey, canHandle);
        return canHandle;
    }
    
    _updateLatency(latencyMs) {
        // Exponential moving average
        const alpha = 0.1;
        this.metrics.avgLatencyMs = 
            alpha * latencyMs + 
            (1 - alpha) * this.metrics.avgLatencyMs;
    }
    
    start() {
        if (this._running) {
            console.warn('Message router already running');
            return;
        }
        
        this._running = true;
        this._processLoop();
        
        console.log('Message router started');
    }
    
    stop() {
        if (!this._running) return;
        
        console.log('Stopping message router...');
        this._running = false;
        
        // Stop process timer
        if (this._processTimer) {
            clearTimeout(this._processTimer);
            this._processTimer = null;
        }
        
        console.log('Message router stopped');
    }
    
    getStats() {
        return {
            agentsRegistered: this.agents.size,
            queueSize: this.messageQueue.size(),
            metrics: this.metrics,
            uptime: this._running ? 'active' : 'stopped'
        };
    }
    
    listAgents() {
        return Array.from(this.agents.values()).map(info => ({
            agentId: info.agentId,
            agentType: info.agentType,
            capabilities: info.capabilities,
            messageCount: info.messageCount,
            lastSeen: info.lastSeen
        }));
    }
}

// Singleton instance
let _routerInstance = null;

function getMessageRouter() {
    if (!_routerInstance) {
        _routerInstance = new AULRouter();
    }
    return _routerInstance;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AULRouter, getMessageRouter };
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.AULRouter = AULRouter;
    window.getAULMessageRouter = getMessageRouter;
}
