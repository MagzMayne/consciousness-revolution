// RootIB: RB-20260319142113-72410333
/**
 * GLYPH STORAGE MODULE
 * Version: 1.0.0
 *
 * LocalStorage wrapper with GLYPH envelope encoding.
 * Query by pattern, domain, consciousness level.
 */

const GlyphStorage = (function() {
  'use strict';

  // Get dependencies
  const Envelope = typeof GlyphEnvelope !== 'undefined' ? GlyphEnvelope : null;
  const Time = typeof GlyphTimestamp !== 'undefined' ? GlyphTimestamp : null;

  // Storage prefix
  const PREFIX = 'glyph_';

  // Index key for fast lookups
  const INDEX_KEY = 'glyph__index';

  /**
   * Initialize or get the storage index
   */
  function getIndex() {
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      return raw ? JSON.parse(raw) : { keys: [], stats: { total: 0, byDomain: {}, byType: {} } };
    } catch (e) {
      return { keys: [], stats: { total: 0, byDomain: {}, byType: {} } };
    }
  }

  /**
   * Save the index
   */
  function saveIndex(index) {
    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (e) {
      console.warn('Failed to save index:', e);
    }
  }

  /**
   * Update index with new entry
   */
  function updateIndex(key, envelope) {
    const index = getIndex();

    // Add key if not exists
    if (!index.keys.includes(key)) {
      index.keys.push(key);
      index.stats.total++;
    }

    // Update domain stats
    if (envelope && envelope.domain !== undefined) {
      const domain = envelope.domain.toString();
      index.stats.byDomain[domain] = (index.stats.byDomain[domain] || 0) + 1;
    }

    // Update type stats
    if (envelope && envelope.pattern && envelope.pattern.type) {
      const type = envelope.pattern.type;
      index.stats.byType[type] = (index.stats.byType[type] || 0) + 1;
    }

    saveIndex(index);
  }

  /**
   * Remove key from index
   */
  function removeFromIndex(key) {
    const index = getIndex();
    const idx = index.keys.indexOf(key);
    if (idx !== -1) {
      index.keys.splice(idx, 1);
      index.stats.total--;
      saveIndex(index);
    }
  }

  /**
   * Store data with GLYPH envelope
   *
   * @param {string} key - Storage key
   * @param {any} value - Data to store
   * @param {Object} options - Envelope options
   * @returns {Object} The stored envelope
   */
  function set(key, value, options = {}) {
    // Wrap in GLYPH envelope if not already wrapped
    let envelope;
    if (Envelope && Envelope.isValid(value)) {
      envelope = value;
    } else if (Envelope) {
      envelope = Envelope.wrap(value, options);
    } else {
      envelope = { data: value, _glyph: { version: 'fallback' } };
    }

    // Store
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(envelope));
      updateIndex(key, envelope);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        // Clear old entries and retry
        pruneOldest(10);
        localStorage.setItem(PREFIX + key, JSON.stringify(envelope));
        updateIndex(key, envelope);
      } else {
        throw e;
      }
    }

    return envelope;
  }

  /**
   * Retrieve data, optionally unwrap
   *
   * @param {string} key - Storage key
   * @param {boolean} unwrap - Whether to unwrap envelope
   * @returns {any} Retrieved data
   */
  function get(key, unwrap = false) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (unwrap && Envelope) {
        return Envelope.unwrap(parsed);
      }

      return parsed;
    } catch (e) {
      console.warn(`Failed to get ${key}:`, e);
      return null;
    }
  }

  /**
   * Check if key exists
   *
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  function has(key) {
    return localStorage.getItem(PREFIX + key) !== null;
  }

  /**
   * Remove item
   *
   * @param {string} key - Storage key
   */
  function remove(key) {
    localStorage.removeItem(PREFIX + key);
    removeFromIndex(key);
  }

  /**
   * Get all GLYPH-stored items
   *
   * @returns {Object[]} Array of {key, value} objects
   */
  function getAll() {
    const items = [];

    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(PREFIX) && fullKey !== INDEX_KEY) {
        const key = fullKey.replace(PREFIX, '');
        const value = get(key);
        if (value) {
          items.push({ key, value });
        }
      }
    }

    return items;
  }

  /**
   * Query stored items by filter criteria
   *
   * @param {Object} filter - Query filter
   * @returns {Object[]} Matching items
   */
  function query(filter = {}) {
    const {
      domain,
      type,           // Pattern type: 'truth', 'deceit', 'neutral'
      minScore,
      maxScore,
      hasManipulation,
      origin,
      since,          // Timestamp or Date
      limit = 100,
      sortBy = 'created',  // 'created', 'score'
      sortOrder = 'desc'
    } = filter;

    let items = getAll();

    // Apply filters
    items = items.filter(({ value }) => {
      if (!value || !value._glyph) return false;

      // Domain filter
      if (domain !== undefined && value.domain !== domain) {
        return false;
      }

      // Type filter
      if (type && value.pattern && value.pattern.type !== type) {
        return false;
      }

      // Score filters
      if (minScore !== undefined && value.pattern) {
        if ((value.pattern.score || 0) < minScore) return false;
      }
      if (maxScore !== undefined && value.pattern) {
        if ((value.pattern.score || 100) > maxScore) return false;
      }

      // Manipulation filter
      if (hasManipulation !== undefined) {
        const hasMani = value.pattern &&
                        Array.isArray(value.pattern.manipulation) &&
                        value.pattern.manipulation.length > 0;
        if (hasManipulation !== hasMani) return false;
      }

      // Origin filter
      if (origin && value.origin !== origin) {
        return false;
      }

      // Time filter
      if (since) {
        const itemTime = value._glyph.created;
        const sinceTime = typeof since === 'string' ? since : new Date(since).toISOString();
        if (itemTime < sinceTime) return false;
      }

      return true;
    });

    // Sort
    items.sort((a, b) => {
      let aVal, bVal;

      if (sortBy === 'score') {
        aVal = a.value.pattern?.score || 0;
        bVal = b.value.pattern?.score || 0;
      } else {
        aVal = a.value._glyph?.created || '';
        bVal = b.value._glyph?.created || '';
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    // Limit
    return items.slice(0, limit);
  }

  /**
   * Get storage statistics
   *
   * @returns {Object} Statistics
   */
  function stats() {
    const index = getIndex();
    const items = getAll();

    // Calculate pattern score distribution
    const scores = items
      .filter(i => i.value.pattern && typeof i.value.pattern.score === 'number')
      .map(i => i.value.pattern.score);

    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;

    // Count manipulation detections
    const manipulations = items.filter(i =>
      i.value.pattern &&
      Array.isArray(i.value.pattern.manipulation) &&
      i.value.pattern.manipulation.length > 0
    ).length;

    // Estimate storage size
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        const value = localStorage.getItem(key);
        totalSize += key.length + (value ? value.length : 0);
      }
    }

    return {
      total: index.stats.total,
      byDomain: index.stats.byDomain,
      byType: index.stats.byType,
      avgScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
      manipulationCount: manipulations,
      storageSizeKB: Math.round(totalSize / 1024 * 10) / 10
    };
  }

  /**
   * Clear all GLYPH storage
   */
  function clear() {
    const keys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        keys.push(key);
      }
    }

    keys.forEach(k => localStorage.removeItem(k));

    // Reset index
    saveIndex({ keys: [], stats: { total: 0, byDomain: {}, byType: {} } });
  }

  /**
   * Remove oldest entries
   *
   * @param {number} count - Number of entries to remove
   */
  function pruneOldest(count = 10) {
    const items = query({ sortBy: 'created', sortOrder: 'asc', limit: count });
    items.forEach(({ key }) => remove(key));
  }

  /**
   * Remove entries older than specified time
   *
   * @param {number} maxAgeMs - Max age in milliseconds
   * @returns {number} Number of items removed
   */
  function pruneByAge(maxAgeMs) {
    const cutoff = new Date(Date.now() - maxAgeMs).toISOString();
    const items = getAll();
    let removed = 0;

    items.forEach(({ key, value }) => {
      if (value._glyph && value._glyph.created < cutoff) {
        remove(key);
        removed++;
      }
    });

    return removed;
  }

  /**
   * Export all data as JSON
   *
   * @returns {string} JSON string
   */
  function exportAll() {
    const data = {
      exported: new Date().toISOString(),
      items: getAll(),
      stats: stats()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   *
   * @param {string} json - JSON string to import
   * @param {boolean} merge - Merge with existing (true) or replace (false)
   * @returns {number} Number of items imported
   */
  function importData(json, merge = true) {
    const data = JSON.parse(json);

    if (!merge) {
      clear();
    }

    let imported = 0;
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach(({ key, value }) => {
        set(key, value);
        imported++;
      });
    }

    return imported;
  }

  // Public API
  return {
    VERSION: '1.0.0',
    PREFIX,

    // Core CRUD
    set,
    get,
    has,
    remove,
    getAll,

    // Query
    query,
    stats,

    // Maintenance
    clear,
    pruneOldest,
    pruneByAge,

    // Import/Export
    exportAll,
    importData
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphStorage;
}
if (typeof window !== 'undefined') {
  window.GlyphStorage = GlyphStorage;
}
