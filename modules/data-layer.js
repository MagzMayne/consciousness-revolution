/**
 * DATA LAYER MODULE
 * Unified Storage Abstraction
 *
 * Three-tier storage with automatic fallback:
 * 1. CLOUD - Supabase (persistent, synced)
 * 2. LOCAL - localStorage (persistent, device-only)
 * 3. SESSION - sessionStorage (temporary)
 *
 * Location: 100X_DEPLOYMENT/modules/
 * Created: 2026-02-08
 * Connects: ARCHITECTURE_GUIDELINES_DNA.md, level-switch.js
 */

// Storage tier priority
export const STORAGE_TIERS = {
  CLOUD: 'cloud',     // Supabase - cross-device sync
  LOCAL: 'local',     // localStorage - persistent
  SESSION: 'session'  // sessionStorage - temporary
};

// Default storage configuration
const DEFAULT_CONFIG = {
  supabaseUrl: null,
  supabaseKey: null,
  prefix: 'overkill_',
  defaultTier: STORAGE_TIERS.LOCAL,
  enableSync: false,
  syncInterval: 30000 // 30 seconds
};

// Active configuration
let config = { ...DEFAULT_CONFIG };

// Supabase client reference
let supabaseClient = null;

// Pending sync queue
let syncQueue = [];

// Sync interval ID
let syncIntervalId = null;

/**
 * Initialize the data layer
 * @param {Object} options - Configuration options
 */
export function init(options = {}) {
  config = { ...DEFAULT_CONFIG, ...options };

  // Initialize Supabase if credentials provided
  if (config.supabaseUrl && config.supabaseKey && typeof window !== 'undefined') {
    initSupabase();
  }

  // Start sync interval if enabled
  if (config.enableSync && config.syncInterval > 0) {
    startSyncInterval();
  }

  return config;
}

/**
 * Initialize Supabase client
 */
async function initSupabase() {
  try {
    // Dynamic import for Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
    console.log('[DATA-LAYER] Supabase initialized');
  } catch (error) {
    console.warn('[DATA-LAYER] Supabase init failed, using local only:', error.message);
  }
}

/**
 * Get prefixed key
 */
function getKey(key) {
  return `${config.prefix}${key}`;
}

/**
 * Get data from storage
 * @param {string} key - Storage key
 * @param {string} tier - Storage tier (optional, tries all tiers)
 */
export async function get(key, tier = null) {
  const prefixedKey = getKey(key);

  // If specific tier requested
  if (tier) {
    return await getFromTier(prefixedKey, tier);
  }

  // Try tiers in priority order
  const tiers = [STORAGE_TIERS.CLOUD, STORAGE_TIERS.LOCAL, STORAGE_TIERS.SESSION];

  for (const t of tiers) {
    const value = await getFromTier(prefixedKey, t);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

/**
 * Get from specific tier
 */
async function getFromTier(key, tier) {
  try {
    switch (tier) {
      case STORAGE_TIERS.CLOUD:
        if (!supabaseClient) return null;
        const { data, error } = await supabaseClient
          .from('storage')
          .select('value')
          .eq('key', key)
          .single();
        if (error) return null;
        return data?.value ? JSON.parse(data.value) : null;

      case STORAGE_TIERS.LOCAL:
        const localValue = localStorage.getItem(key);
        return localValue ? JSON.parse(localValue) : null;

      case STORAGE_TIERS.SESSION:
        const sessionValue = sessionStorage.getItem(key);
        return sessionValue ? JSON.parse(sessionValue) : null;

      default:
        return null;
    }
  } catch (error) {
    console.warn(`[DATA-LAYER] Get failed for ${key} in ${tier}:`, error.message);
    return null;
  }
}

/**
 * Set data in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {string} tier - Storage tier
 */
export async function set(key, value, tier = config.defaultTier) {
  const prefixedKey = getKey(key);
  const serialized = JSON.stringify(value);

  try {
    switch (tier) {
      case STORAGE_TIERS.CLOUD:
        if (!supabaseClient) {
          // Queue for later sync
          syncQueue.push({ key: prefixedKey, value: serialized, action: 'upsert' });
          // Fall back to local
          localStorage.setItem(prefixedKey, serialized);
          return true;
        }
        await supabaseClient
          .from('storage')
          .upsert({ key: prefixedKey, value: serialized, updated_at: new Date().toISOString() });
        // Also store locally for offline access
        localStorage.setItem(prefixedKey, serialized);
        break;

      case STORAGE_TIERS.LOCAL:
        localStorage.setItem(prefixedKey, serialized);
        break;

      case STORAGE_TIERS.SESSION:
        sessionStorage.setItem(prefixedKey, serialized);
        break;
    }

    // Dispatch change event
    window.dispatchEvent(new CustomEvent('data-change', {
      detail: { key, value, tier }
    }));

    return true;
  } catch (error) {
    console.error(`[DATA-LAYER] Set failed for ${key}:`, error.message);
    return false;
  }
}

/**
 * Remove data from storage
 * @param {string} key - Storage key
 * @param {string} tier - Storage tier (optional, removes from all)
 */
export async function remove(key, tier = null) {
  const prefixedKey = getKey(key);

  try {
    if (tier) {
      await removeFromTier(prefixedKey, tier);
    } else {
      // Remove from all tiers
      await removeFromTier(prefixedKey, STORAGE_TIERS.CLOUD);
      await removeFromTier(prefixedKey, STORAGE_TIERS.LOCAL);
      await removeFromTier(prefixedKey, STORAGE_TIERS.SESSION);
    }

    window.dispatchEvent(new CustomEvent('data-remove', {
      detail: { key }
    }));

    return true;
  } catch (error) {
    console.error(`[DATA-LAYER] Remove failed for ${key}:`, error.message);
    return false;
  }
}

/**
 * Remove from specific tier
 */
async function removeFromTier(key, tier) {
  switch (tier) {
    case STORAGE_TIERS.CLOUD:
      if (supabaseClient) {
        await supabaseClient.from('storage').delete().eq('key', key);
      }
      break;

    case STORAGE_TIERS.LOCAL:
      localStorage.removeItem(key);
      break;

    case STORAGE_TIERS.SESSION:
      sessionStorage.removeItem(key);
      break;
  }
}

/**
 * List all keys with given prefix
 * @param {string} prefix - Additional prefix to filter by
 */
export function listKeys(prefix = '') {
  const fullPrefix = getKey(prefix);
  const keys = [];

  // Scan localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(fullPrefix)) {
      keys.push(key.replace(config.prefix, ''));
    }
  }

  return keys;
}

/**
 * Sync local changes to cloud
 */
export async function syncToCloud() {
  if (!supabaseClient || syncQueue.length === 0) return;

  const pending = [...syncQueue];
  syncQueue = [];

  for (const item of pending) {
    try {
      await supabaseClient
        .from('storage')
        .upsert({ key: item.key, value: item.value, updated_at: new Date().toISOString() });
    } catch (error) {
      // Re-queue failed items
      syncQueue.push(item);
    }
  }

  console.log(`[DATA-LAYER] Synced ${pending.length - syncQueue.length} items to cloud`);
}

/**
 * Start sync interval
 */
function startSyncInterval() {
  if (syncIntervalId) return;

  syncIntervalId = setInterval(() => {
    syncToCloud();
  }, config.syncInterval);
}

/**
 * Stop sync interval
 */
export function stopSync() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

/**
 * Clear all data for this app
 */
export async function clearAll() {
  const keys = listKeys();

  for (const key of keys) {
    await remove(key);
  }

  syncQueue = [];
  console.log('[DATA-LAYER] All data cleared');
}

/**
 * Get storage statistics
 */
export function getStats() {
  const keys = listKeys();
  let totalSize = 0;

  for (const key of keys) {
    const value = localStorage.getItem(getKey(key));
    if (value) {
      totalSize += value.length * 2; // UTF-16 = 2 bytes per char
    }
  }

  return {
    keyCount: keys.length,
    totalSizeBytes: totalSize,
    totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
    syncQueueLength: syncQueue.length,
    cloudConnected: !!supabaseClient,
    syncEnabled: !!syncIntervalId
  };
}

/**
 * Batch operations for performance
 */
export const batch = {
  /**
   * Get multiple keys at once
   * @param {string[]} keys - Array of keys
   */
  async getMany(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = await get(key);
    }
    return results;
  },

  /**
   * Set multiple key-value pairs at once
   * @param {Object} items - Object of key-value pairs
   * @param {string} tier - Storage tier
   */
  async setMany(items, tier = config.defaultTier) {
    const results = {};
    for (const [key, value] of Object.entries(items)) {
      results[key] = await set(key, value, tier);
    }
    return results;
  }
};

/**
 * Create a namespaced store
 * @param {string} namespace - Namespace prefix
 */
export function createStore(namespace) {
  return {
    get: (key) => get(`${namespace}_${key}`),
    set: (key, value, tier) => set(`${namespace}_${key}`, value, tier),
    remove: (key) => remove(`${namespace}_${key}`),
    listKeys: () => listKeys(`${namespace}_`).map(k => k.replace(`${namespace}_`, '')),
    clear: async () => {
      const keys = listKeys(`${namespace}_`);
      for (const key of keys) {
        await remove(key);
      }
    }
  };
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Sync any pending changes before leaving
    if (syncQueue.length > 0 && supabaseClient) {
      // Use sendBeacon for reliability
      const pending = syncQueue.map(item => ({
        key: item.key,
        value: item.value
      }));
      navigator.sendBeacon?.('/api/sync', JSON.stringify(pending));
    }
  });
}

export default {
  STORAGE_TIERS,
  init,
  get,
  set,
  remove,
  listKeys,
  syncToCloud,
  stopSync,
  clearAll,
  getStats,
  batch,
  createStore
};
