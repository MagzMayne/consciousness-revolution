// RootIB: RB-20260319142113-3708F6F7
/**
 * GLYPH Module Index
 * Version: 2.0.0
 *
 * Load all GLYPH modules in correct dependency order.
 * GLYPH is the BACKBONE of the entire consciousness platform.
 *
 * Module Loading Order (dependencies must load first):
 * Layer 0: glyph-base60.js (no deps)
 * Layer 1: glyph-symbols.js, glyph-timestamp.js (depends on base60)
 * Layer 2: glyph-patterns.js (depends on base60, symbols)
 * Layer 3: glyph-core.js (depends on all above)
 * Layer 4: glyph-envelope.js (depends on core, patterns, timestamp)
 * Layer 5: glyph-storage.js, glyph-araya.js (depends on envelope)
 */

// This file provides a single entry point
if (typeof window !== 'undefined') {
  window.GLYPH_MODULES = {
    VERSION: '2.0.0',

    // Module registry with load order
    MODULES: [
      // Layer 0: Foundation
      { name: 'base60', file: 'glyph-base60.js', layer: 0 },

      // Layer 1: Time + Symbols
      { name: 'symbols', file: 'glyph-symbols.js', layer: 1 },
      { name: 'timestamp', file: 'glyph-timestamp.js', layer: 1 },

      // Layer 2: Pattern Analysis
      { name: 'patterns', file: 'glyph-patterns.js', layer: 2 },

      // Layer 3: Core Orchestrator
      { name: 'core', file: 'glyph-core.js', layer: 3 },

      // Layer 4: Data Wrapper + Events
      { name: 'envelope', file: 'glyph-envelope.js', layer: 4 },
      { name: 'events', file: 'glyph-events.js', layer: 4 },

      // Layer 5: Storage + AI + Analytics
      { name: 'storage', file: 'glyph-storage.js', layer: 5 },
      { name: 'araya', file: 'glyph-araya.js', layer: 5 },
      { name: 'analytics', file: 'glyph-analytics.js', layer: 5 },

      // Layer 6: UI Components
      { name: 'ui', file: 'glyph-ui.js', layer: 6 }
    ],

    // Check which modules are loaded
    loaded: function() {
      return {
        // Layer 0
        base60: typeof GlyphBase60 !== 'undefined',

        // Layer 1
        symbols: typeof GlyphSymbols !== 'undefined',
        timestamp: typeof GlyphTimestamp !== 'undefined',

        // Layer 2
        patterns: typeof GlyphPatterns !== 'undefined',

        // Layer 3
        core: typeof GlyphCore !== 'undefined' || typeof GLYPH !== 'undefined',

        // Layer 4
        envelope: typeof GlyphEnvelope !== 'undefined',
        events: typeof GlyphEvents !== 'undefined',

        // Layer 5
        storage: typeof GlyphStorage !== 'undefined',
        araya: typeof GlyphAraya !== 'undefined',
        analytics: typeof GlyphAnalytics !== 'undefined',

        // Layer 6
        ui: typeof GlyphUI !== 'undefined'
      };
    },

    // Get load status summary
    status: function() {
      const loaded = this.loaded();
      const total = Object.keys(loaded).length;
      const active = Object.values(loaded).filter(Boolean).length;

      return {
        modules: loaded,
        total: total,
        active: active,
        percentage: Math.round((active / total) * 100),
        ready: active >= 4 // Minimum: base60 + patterns + core + envelope
      };
    },

    // Initialize loaded modules
    init: function() {
      const status = this.status();
      console.log(`GLYPH Backbone: ${status.active}/${status.total} modules (${status.percentage}%)`);

      // Initialize core if available
      if (typeof GLYPH !== 'undefined' && GLYPH.init) {
        GLYPH.init();
      }

      // Log individual module versions
      const versions = {};
      if (typeof GlyphBase60 !== 'undefined') versions.base60 = GlyphBase60.VERSION;
      if (typeof GlyphSymbols !== 'undefined') versions.symbols = GlyphSymbols.VERSION;
      if (typeof GlyphTimestamp !== 'undefined') versions.timestamp = GlyphTimestamp.VERSION;
      if (typeof GlyphPatterns !== 'undefined') versions.patterns = GlyphPatterns.VERSION;
      if (typeof GLYPH !== 'undefined') versions.core = GLYPH.VERSION;
      if (typeof GlyphEnvelope !== 'undefined') versions.envelope = GlyphEnvelope.VERSION;
      if (typeof GlyphEvents !== 'undefined') versions.events = GlyphEvents.VERSION;
      if (typeof GlyphStorage !== 'undefined') versions.storage = GlyphStorage.VERSION;
      if (typeof GlyphAraya !== 'undefined') versions.araya = GlyphAraya.VERSION;
      if (typeof GlyphAnalytics !== 'undefined') versions.analytics = GlyphAnalytics.VERSION;
      if (typeof GlyphUI !== 'undefined') versions.ui = GlyphUI.VERSION;

      return {
        ...status,
        versions: versions,
        timestamp: new Date().toISOString()
      };
    },

    // Load modules by layer (respects dependencies)
    loadLayer: function(layer, basePath = '/js/glyph/') {
      const layerModules = this.MODULES.filter(m => m.layer === layer);

      return Promise.all(layerModules.map(mod => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = basePath + mod.file;

          script.onload = () => {
            console.log(`GLYPH: Loaded ${mod.name} (Layer ${layer})`);
            resolve(mod.name);
          };

          script.onerror = () => {
            console.warn(`GLYPH: Failed to load ${mod.name}`);
            reject(new Error(`Failed to load ${mod.file}`));
          };

          document.head.appendChild(script);
        });
      }));
    },

    // Load all modules in dependency order
    loadAll: function(basePath = '/js/glyph/') {
      const maxLayer = Math.max(...this.MODULES.map(m => m.layer));

      // Chain layer loading sequentially
      let chain = Promise.resolve();

      for (let layer = 0; layer <= maxLayer; layer++) {
        chain = chain.then(() => this.loadLayer(layer, basePath));
      }

      return chain.then(() => this.init());
    },

    // Load minimal set (core functionality only)
    loadMinimal: function(basePath = '/js/glyph/') {
      const minimalModules = ['glyph-base60.js', 'glyph-patterns.js', 'glyph-core.js'];

      return new Promise((resolve, reject) => {
        let loaded = 0;

        minimalModules.forEach(file => {
          const script = document.createElement('script');
          script.src = basePath + file;
          script.async = false;

          script.onload = () => {
            loaded++;
            if (loaded === minimalModules.length) {
              resolve(this.init());
            }
          };

          script.onerror = () => reject(new Error(`Failed to load ${file}`));
          document.head.appendChild(script);
        });
      });
    },

    // Quick access to main modules
    get: function(moduleName) {
      const map = {
        base60: typeof GlyphBase60 !== 'undefined' ? GlyphBase60 : null,
        symbols: typeof GlyphSymbols !== 'undefined' ? GlyphSymbols : null,
        timestamp: typeof GlyphTimestamp !== 'undefined' ? GlyphTimestamp : null,
        patterns: typeof GlyphPatterns !== 'undefined' ? GlyphPatterns : null,
        core: typeof GLYPH !== 'undefined' ? GLYPH : (typeof GlyphCore !== 'undefined' ? GlyphCore : null),
        envelope: typeof GlyphEnvelope !== 'undefined' ? GlyphEnvelope : null,
        events: typeof GlyphEvents !== 'undefined' ? GlyphEvents : null,
        storage: typeof GlyphStorage !== 'undefined' ? GlyphStorage : null,
        araya: typeof GlyphAraya !== 'undefined' ? GlyphAraya : null,
        analytics: typeof GlyphAnalytics !== 'undefined' ? GlyphAnalytics : null,
        ui: typeof GlyphUI !== 'undefined' ? GlyphUI : null
      };

      return moduleName ? map[moduleName] : map;
    }
  };

  // Alias for convenience
  window.GLYPH_BACKBONE = window.GLYPH_MODULES;
}

// CommonJS exports for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Layer 0
    GlyphBase60: require('./glyph-base60.js'),

    // Layer 1
    GlyphSymbols: require('./glyph-symbols.js'),
    GlyphTimestamp: require('./glyph-timestamp.js'),

    // Layer 2
    GlyphPatterns: require('./glyph-patterns.js'),

    // Layer 3
    GLYPH: require('./glyph-core.js'),

    // Layer 4
    GlyphEnvelope: require('./glyph-envelope.js'),
    GlyphEvents: require('./glyph-events.js'),

    // Layer 5
    GlyphStorage: require('./glyph-storage.js'),
    GlyphAraya: require('./glyph-araya.js'),
    GlyphAnalytics: require('./glyph-analytics.js'),

    // Layer 6
    GlyphUI: require('./glyph-ui.js')
  };
}
