/**
 * Shared State / Knowledge Base SDK
 *
 * Provides a unified interface for:
 *  - Short-term working memory  (in-process Map, swappable for Redis)
 *  - Long-term knowledge store  (in-process Map, swappable for Postgres/SQLite)
 *  - Append-only event stream   (in-memory ring-buffer)
 */

'use strict';

// ─── StateStore ───────────────────────────────────────────────────────────────

class StateStore {
  /**
   * @param {object} [opts]
   * @param {number} [opts.maxStreamEvents=10000]  Max events kept per stream
   */
  constructor(opts = {}) {
    this._opts = {
      maxStreamEvents: opts.maxStreamEvents ?? 10_000,
    };

    /** @type {Map<string, any>} Working memory (key→value) */
    this._working = new Map();

    /** @type {Map<string, any>} Long-term knowledge (key→value) */
    this._knowledge = new Map();

    /** @type {Map<string, object[]>} Append-only event streams */
    this._streams = new Map();
  }

  // ── Working memory ──────────────────────────────────────────────────────────

  /**
   * Read a value from working memory.
   * @param {string} key
   * @returns {any}
   */
  get_state(key) {
    return this._working.get(key) ?? null;
  }

  /**
   * Write a value to working memory.
   * @param {string} key
   * @param {any}    value
   */
  set_state(key, value) {
    this._working.set(key, value);
  }

  /**
   * Delete a value from working memory.
   * @param {string} key
   * @returns {boolean}
   */
  delete_state(key) {
    return this._working.delete(key);
  }

  // ── Long-term knowledge ─────────────────────────────────────────────────────

  /**
   * Read from the knowledge base.
   * @param {string} key
   * @returns {any}
   */
  get_knowledge(key) {
    return this._knowledge.get(key) ?? null;
  }

  /**
   * Write to the knowledge base.
   * @param {string} key
   * @param {any}    value
   */
  set_knowledge(key, value) {
    this._knowledge.set(key, value);
  }

  /**
   * Query the knowledge base.
   *
   * @param {object} queryParams
   * @param {string} [queryParams.prefix]   Return all keys starting with prefix
   * @param {Function} [queryParams.filter] (key, value) => boolean predicate
   * @returns {Array<{key: string, value: any}>}
   */
  query_knowledge(queryParams = {}) {
    const results = [];
    for (const [key, value] of this._knowledge.entries()) {
      if (queryParams.prefix && !key.startsWith(queryParams.prefix)) continue;
      if (queryParams.filter && !queryParams.filter(key, value)) continue;
      results.push({ key, value });
    }
    return results;
  }

  // ── Event streams ───────────────────────────────────────────────────────────

  /**
   * Append an event payload to a named stream.
   * @param {string} stream   Stream name, e.g. "learning.events"
   * @param {object} payload  Arbitrary data
   * @returns {object}        The stored entry (with seq + timestamp)
   */
  append_event(stream, payload) {
    if (!this._streams.has(stream)) {
      this._streams.set(stream, []);
    }
    const events = this._streams.get(stream);
    const entry = {
      seq: events.length,
      stream,
      payload,
      timestamp: new Date().toISOString(),
    };
    events.push(entry);

    // Trim to maxStreamEvents
    if (events.length > this._opts.maxStreamEvents) {
      events.splice(0, events.length - this._opts.maxStreamEvents);
    }

    return entry;
  }

  /**
   * Read events from a stream.
   * @param {string} stream
   * @param {object} [opts]
   * @param {number} [opts.fromSeq=0]   Starting sequence number (inclusive)
   * @param {number} [opts.limit=100]   Max events to return
   * @returns {object[]}
   */
  read_stream(stream, opts = {}) {
    const events = this._streams.get(stream) || [];
    const from = opts.fromSeq ?? 0;
    const limit = opts.limit ?? 100;
    return events.filter((e) => e.seq >= from).slice(0, limit);
  }

  /**
   * Return recent events across ALL streams (for Reflection / debugging).
   * @param {number} [limitPerStream=20]
   * @returns {object[]}  Sorted newest-first
   */
  recent_events(limitPerStream = 20) {
    const all = [];
    for (const [, events] of this._streams.entries()) {
      all.push(...events.slice(-limitPerStream));
    }
    return all.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
  }

  // ── Diagnostics ─────────────────────────────────────────────────────────────

  stats() {
    return {
      workingMemoryKeys: this._working.size,
      knowledgeKeys: this._knowledge.size,
      streams: Object.fromEntries(
        [...this._streams.entries()].map(([k, v]) => [k, v.length]),
      ),
    };
  }
}

// ─── Singleton helpers ────────────────────────────────────────────────────────

let _defaultStore = null;

function getDefaultStore() {
  if (!_defaultStore) _defaultStore = new StateStore();
  return _defaultStore;
}

function setDefaultStore(store) {
  _defaultStore = store;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = { StateStore, getDefaultStore, setDefaultStore };
