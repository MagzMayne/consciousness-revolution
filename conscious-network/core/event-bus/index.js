/**
 * Core Event Bus — Pluggable pub/sub abstraction.
 *
 * Design goals:
 *  - Topic-based routing
 *  - Typed messages with correlation / trace IDs
 *  - Basic retry + dead-letter queue
 *  - Replaceable transport (in-memory default; extend for Redis Streams, NATS, etc.)
 */

'use strict';

const { EventEmitter } = require('events');
const crypto = require('crypto');

// ─── Message schema helpers ──────────────────────────────────────────────────

/**
 * Build a standard envelope for every event on the bus.
 * @param {string} topic       e.g. "communication.inbound"
 * @param {string} type        e.g. "UserMessage"
 * @param {object} payload     Arbitrary message body
 * @param {object} [opts]
 * @param {string} [opts.correlationId]  Tie related messages together
 * @param {string} [opts.traceId]        Distributed tracing id
 * @param {string} [opts.source]         Originating agent name
 * @returns {BusMessage}
 */
function createMessage(topic, type, payload, opts = {}) {
  return {
    id: crypto.randomUUID(),
    topic,
    type,
    payload,
    source: opts.source || 'unknown',
    correlationId: opts.correlationId || crypto.randomUUID(),
    traceId: opts.traceId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };
}

// ─── In-Memory Event Bus ─────────────────────────────────────────────────────

class InMemoryEventBus extends EventEmitter {
  /**
   * @param {object} [opts]
   * @param {number} [opts.maxRetries=3]       Max automatic delivery retries
   * @param {number} [opts.retryDelayMs=500]   Delay between retries (ms)
   */
  constructor(opts = {}) {
    super();
    this.setMaxListeners(100); // allow many agent subscriptions

    this._opts = {
      maxRetries: opts.maxRetries ?? 3,
      retryDelayMs: opts.retryDelayMs ?? 500,
    };

    /** @type {BusMessage[]} Dead-letter queue for un-handleable messages */
    this._deadLetterQueue = [];

    /** @type {Map<string, Function[]>} topic → handler list */
    this._subscribers = new Map();
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Publish a message to a topic.
   * @param {BusMessage} message
   */
  async publish(message) {
    const handlers = this._getHandlers(message.topic);

    if (handlers.length === 0) {
      // No subscribers — nothing to do
      return;
    }

    const failures = [];

    for (const handler of handlers) {
      try {
        await this._deliverWithRetry(handler, message);
      } catch (err) {
        failures.push({ handler: handler.name || 'anonymous', error: err.message });
      }
    }

    // Also emit as a Node EventEmitter event for optional direct listeners
    this.emit(message.topic, message);
    this.emit('*', message); // wildcard for observability

    if (failures.length > 0) {
      this._deadLetterQueue.push({ message, failures, dlqAt: new Date().toISOString() });
    }
  }

  /**
   * Subscribe a handler to a topic (or wildcard '*').
   * @param {string}   topic
   * @param {Function} handler  async (message: BusMessage) => void
   * @returns {Function}        Unsubscribe function
   */
  subscribe(topic, handler) {
    if (!this._subscribers.has(topic)) {
      this._subscribers.set(topic, []);
    }
    this._subscribers.get(topic).push(handler);

    return () => this.unsubscribe(topic, handler);
  }

  /**
   * Remove a previously registered handler.
   * @param {string}   topic
   * @param {Function} handler
   */
  unsubscribe(topic, handler) {
    const handlers = this._subscribers.get(topic);
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  /** Returns a copy of the current dead-letter queue. */
  getDeadLetterQueue() {
    return [...this._deadLetterQueue];
  }

  /** Drain (clear) the dead-letter queue, returning all entries. */
  drainDeadLetterQueue() {
    const items = [...this._deadLetterQueue];
    this._deadLetterQueue = [];
    return items;
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  _getHandlers(topic) {
    const exact = this._subscribers.get(topic) || [];
    const wildcard = this._subscribers.get('*') || [];
    return [...exact, ...wildcard];
  }

  async _deliverWithRetry(handler, message) {
    let attempt = 0;
    while (attempt <= this._opts.maxRetries) {
      try {
        await handler(message);
        return; // success
      } catch (err) {
        attempt++;
        message = { ...message, retryCount: attempt };
        if (attempt > this._opts.maxRetries) throw err;
        await sleep(this._opts.retryDelayMs * attempt);
      }
    }
  }
}

// ─── Factory / singleton helpers ─────────────────────────────────────────────

let _defaultBus = null;

/**
 * Get (or lazily create) the process-scoped default bus.
 * Agents that run in the same process share this instance.
 */
function getDefaultBus() {
  if (!_defaultBus) _defaultBus = new InMemoryEventBus();
  return _defaultBus;
}

/** Replace the default bus (useful in tests). */
function setDefaultBus(bus) {
  _defaultBus = bus;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  InMemoryEventBus,
  createMessage,
  getDefaultBus,
  setDefaultBus,
};
