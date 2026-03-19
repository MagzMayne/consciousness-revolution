// RootIB: RB-20260319142113-0AC29ADD
/**
 * GLYPH EVENTS MODULE
 * Version: 1.0.0
 *
 * Event system with GLYPH envelope payloads.
 * All platform events flow through this system.
 */

const GlyphEvents = (function() {
  'use strict';

  // Get dependencies
  const Envelope = typeof GlyphEnvelope !== 'undefined' ? GlyphEnvelope : null;
  const Time = typeof GlyphTimestamp !== 'undefined' ? GlyphTimestamp : null;
  const Storage = typeof GlyphStorage !== 'undefined' ? GlyphStorage : null;

  // Event store
  const listeners = new Map();
  const eventHistory = [];
  const MAX_HISTORY = 1000;

  // Standard event types
  const EVENT_TYPES = {
    // User events
    USER_INPUT: 'user:input',
    USER_ACTION: 'user:action',
    USER_NAVIGATE: 'user:navigate',

    // System events
    SYSTEM_INIT: 'system:init',
    SYSTEM_ERROR: 'system:error',
    SYSTEM_READY: 'system:ready',

    // Pattern events
    PATTERN_DETECTED: 'pattern:detected',
    PATTERN_TRUTH: 'pattern:truth',
    PATTERN_DECEIT: 'pattern:deceit',
    MANIPULATION_ALERT: 'pattern:manipulation',

    // Araya events
    ARAYA_REQUEST: 'araya:request',
    ARAYA_RESPONSE: 'araya:response',
    ARAYA_THINKING: 'araya:thinking',

    // Tool events
    TOOL_OPEN: 'tool:open',
    TOOL_CLOSE: 'tool:close',
    TOOL_ANALYZE: 'tool:analyze',
    TOOL_RESULT: 'tool:result',

    // Consciousness events
    CONSCIOUSNESS_SHIFT: 'consciousness:shift',
    CONSCIOUSNESS_ELEVATE: 'consciousness:elevate',
    DOMAIN_CHANGE: 'consciousness:domain',

    // Storage events
    STORAGE_SAVE: 'storage:save',
    STORAGE_LOAD: 'storage:load',
    STORAGE_CLEAR: 'storage:clear'
  };

  /**
   * Create a GLYPH event
   *
   * @param {string} type - Event type
   * @param {any} data - Event data
   * @param {Object} options - Event options
   * @returns {Object} GLYPH event envelope
   */
  function createEvent(type, data, options = {}) {
    const {
      origin = 'SYSTEM',
      domain = 0,
      bubbles = true,
      cancelable = false
    } = options;

    // Wrap in GLYPH envelope
    let envelope;
    if (Envelope) {
      envelope = Envelope.wrap({
        eventType: type,
        payload: data,
        bubbles: bubbles,
        cancelable: cancelable
      }, {
        origin: origin,
        domain: domain,
        analyze: typeof data === 'string' || (data && data.text)
      });
    } else {
      envelope = {
        _glyph: { version: 'fallback', created: new Date().toISOString() },
        eventType: type,
        data: data
      };
    }

    // Add event-specific metadata
    envelope.eventId = Time ? Time.eventId() : `${Date.now()}`;
    envelope.eventType = type;
    envelope.timestamp = Time ? Time.timestamp() : new Date().toISOString();
    envelope.canceled = false;

    return envelope;
  }

  /**
   * Subscribe to events
   *
   * @param {string} type - Event type (or '*' for all)
   * @param {Function} callback - Event handler
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  function on(type, callback, options = {}) {
    const {
      once = false,
      priority = 0,
      filter = null
    } = options;

    if (!listeners.has(type)) {
      listeners.set(type, []);
    }

    const handler = {
      callback,
      once,
      priority,
      filter,
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Insert sorted by priority (higher first)
    const typeListeners = listeners.get(type);
    const insertIndex = typeListeners.findIndex(h => h.priority < priority);
    if (insertIndex === -1) {
      typeListeners.push(handler);
    } else {
      typeListeners.splice(insertIndex, 0, handler);
    }

    // Return unsubscribe function
    return () => off(type, handler.id);
  }

  /**
   * Subscribe to event once
   *
   * @param {string} type - Event type
   * @param {Function} callback - Event handler
   * @returns {Function} Unsubscribe function
   */
  function once(type, callback) {
    return on(type, callback, { once: true });
  }

  /**
   * Unsubscribe from events
   *
   * @param {string} type - Event type
   * @param {string|Function} handlerIdOrCallback - Handler ID or callback
   */
  function off(type, handlerIdOrCallback) {
    if (!listeners.has(type)) return;

    const typeListeners = listeners.get(type);
    const index = typeListeners.findIndex(h =>
      h.id === handlerIdOrCallback ||
      h.callback === handlerIdOrCallback
    );

    if (index !== -1) {
      typeListeners.splice(index, 1);
    }
  }

  /**
   * Emit an event
   *
   * @param {string} type - Event type
   * @param {any} data - Event data
   * @param {Object} options - Emit options
   * @returns {Object} The emitted event envelope
   */
  function emit(type, data, options = {}) {
    const event = createEvent(type, data, options);

    // Store in history
    eventHistory.push({
      type,
      eventId: event.eventId,
      timestamp: event.timestamp,
      canceled: false
    });

    // Trim history
    if (eventHistory.length > MAX_HISTORY) {
      eventHistory.shift();
    }

    // Persist significant events
    if (Storage && isSignificant(type)) {
      Storage.set(`event_${event.eventId}`, event);
    }

    // Get handlers for this type
    const handlers = [
      ...(listeners.get(type) || []),
      ...(listeners.get('*') || []) // Wildcard listeners
    ];

    // Execute handlers
    const toRemove = [];

    for (const handler of handlers) {
      // Check filter
      if (handler.filter && !handler.filter(event)) {
        continue;
      }

      // Check if canceled
      if (event.canceled && event.cancelable) {
        break;
      }

      try {
        handler.callback(event);
      } catch (e) {
        console.error(`GLYPH Event handler error (${type}):`, e);
      }

      // Mark once handlers for removal
      if (handler.once) {
        toRemove.push({ type, id: handler.id });
      }
    }

    // Remove once handlers
    toRemove.forEach(({ type, id }) => off(type, id));

    return event;
  }

  /**
   * Cancel an event (if cancelable)
   *
   * @param {Object} event - Event envelope
   */
  function cancel(event) {
    if (event && event.cancelable) {
      event.canceled = true;
    }
  }

  /**
   * Check if event type is significant (should be persisted)
   *
   * @param {string} type - Event type
   * @returns {boolean}
   */
  function isSignificant(type) {
    const significantTypes = [
      EVENT_TYPES.MANIPULATION_ALERT,
      EVENT_TYPES.CONSCIOUSNESS_SHIFT,
      EVENT_TYPES.ARAYA_RESPONSE,
      EVENT_TYPES.SYSTEM_ERROR,
      EVENT_TYPES.PATTERN_DECEIT
    ];

    return significantTypes.includes(type);
  }

  /**
   * Get event history
   *
   * @param {Object} filter - Filter options
   * @returns {Object[]} Filtered history
   */
  function getHistory(filter = {}) {
    const { type, since, limit = 100 } = filter;

    let result = [...eventHistory];

    if (type) {
      result = result.filter(e => e.type === type);
    }

    if (since) {
      result = result.filter(e => e.timestamp >= since);
    }

    return result.slice(-limit);
  }

  /**
   * Clear event history
   */
  function clearHistory() {
    eventHistory.length = 0;
  }

  /**
   * Get listener count
   *
   * @param {string} type - Event type (optional)
   * @returns {number}
   */
  function listenerCount(type) {
    if (type) {
      return (listeners.get(type) || []).length;
    }

    let count = 0;
    listeners.forEach(arr => count += arr.length);
    return count;
  }

  /**
   * Remove all listeners for a type
   *
   * @param {string} type - Event type (optional, clears all if not provided)
   */
  function removeAllListeners(type) {
    if (type) {
      listeners.delete(type);
    } else {
      listeners.clear();
    }
  }

  /**
   * Create a scoped event emitter for a tool
   *
   * @param {string} toolName - Tool identifier
   * @returns {Object} Scoped emitter
   */
  function createScope(toolName) {
    return {
      emit: (type, data, options = {}) => {
        return emit(type, data, {
          ...options,
          origin: toolName
        });
      },

      on: (type, callback, options = {}) => {
        return on(type, callback, {
          ...options,
          filter: (event) => {
            if (options.filter && !options.filter(event)) return false;
            return true;
          }
        });
      },

      once: (type, callback) => once(type, callback),

      // Tool-specific shortcuts
      opened: () => emit(EVENT_TYPES.TOOL_OPEN, { tool: toolName }),
      closed: () => emit(EVENT_TYPES.TOOL_CLOSE, { tool: toolName }),
      analyzed: (result) => emit(EVENT_TYPES.TOOL_ANALYZE, { tool: toolName, result }),
      result: (data) => emit(EVENT_TYPES.TOOL_RESULT, { tool: toolName, data }),
      error: (error) => emit(EVENT_TYPES.SYSTEM_ERROR, { tool: toolName, error })
    };
  }

  /**
   * Pattern detection shortcut
   *
   * @param {Object} analysis - Pattern analysis result
   */
  function patternDetected(analysis) {
    emit(EVENT_TYPES.PATTERN_DETECTED, analysis);

    // Emit specific sub-events
    if (analysis.dominant === 'truth') {
      emit(EVENT_TYPES.PATTERN_TRUTH, analysis);
    } else if (analysis.dominant === 'deceit') {
      emit(EVENT_TYPES.PATTERN_DECEIT, analysis);
    }

    // Emit manipulation alert if detected
    if (analysis.patterns &&
        analysis.patterns.manipulation &&
        analysis.patterns.manipulation.length > 0) {
      emit(EVENT_TYPES.MANIPULATION_ALERT, {
        patterns: analysis.patterns.manipulation,
        severity: analysis.patterns.manipulation.length > 2 ? 'HIGH' : 'MEDIUM'
      });
    }
  }

  /**
   * Consciousness shift shortcut
   *
   * @param {number} oldLevel - Previous level
   * @param {number} newLevel - New level
   * @param {string} trigger - What triggered the shift
   */
  function consciousnessShift(oldLevel, newLevel, trigger = 'unknown') {
    const direction = newLevel > oldLevel ? 'ASCENDING' : 'DESCENDING';
    const magnitude = Math.abs(newLevel - oldLevel);

    emit(EVENT_TYPES.CONSCIOUSNESS_SHIFT, {
      from: oldLevel,
      to: newLevel,
      direction,
      magnitude,
      trigger
    });

    if (direction === 'ASCENDING' && magnitude >= 10) {
      emit(EVENT_TYPES.CONSCIOUSNESS_ELEVATE, {
        level: newLevel,
        boost: magnitude
      });
    }
  }

  // Public API
  return {
    VERSION: '1.0.0',
    TYPES: EVENT_TYPES,

    // Core methods
    createEvent,
    on,
    once,
    off,
    emit,
    cancel,

    // History
    getHistory,
    clearHistory,

    // Management
    listenerCount,
    removeAllListeners,

    // Utilities
    createScope,
    patternDetected,
    consciousnessShift,

    // Shortcuts for common events
    userInput: (data) => emit(EVENT_TYPES.USER_INPUT, data, { origin: 'USER' }),
    userAction: (data) => emit(EVENT_TYPES.USER_ACTION, data, { origin: 'USER' }),
    systemReady: () => emit(EVENT_TYPES.SYSTEM_READY, { timestamp: Date.now() }),
    systemError: (error) => emit(EVENT_TYPES.SYSTEM_ERROR, error)
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphEvents;
}
if (typeof window !== 'undefined') {
  window.GlyphEvents = GlyphEvents;
}
