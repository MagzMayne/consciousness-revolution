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
 * File: facet-library.js
 * Declaration ID: IP-1ACA5ACE-MLL28ZUS
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

/**
 * Facet Design Library Manager
 * Manages collection of facet diagrams from various sources including FacetDiagrams.org
 */

class FacetDesignLibrary {
  constructor() {
    this.designs = new Map();
    this.categories = ['brilliant', 'emerald', 'princess', 'fantasy', 'custom', 'imported'];
    this.filterOptions = {
      category: 'all',
      difficulty: 'all',
      gemType: 'all',
      shape: 'all'
    };
    this.loadLocalDesigns();
  }

  /**
   * Load pre-bundled designs from the library
   */
  async loadLocalDesigns() {
    const designPaths = [
      '/facetdiagrams-integration/data/designs/brilliant/standard-brilliant.json',
      '/facetdiagrams-integration/data/designs/emerald/classic-emerald.json',
      '/facetdiagrams-integration/data/designs/princess/modern-princess.json',
      '/facetdiagrams-integration/data/designs/fantasy/starburst.json'
    ];

    for (let path of designPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const design = await response.json();
          this.addDesign(design);
        }
      } catch (error) {
        console.warn(`Could not load design from ${path}:`, error.message);
      }
    }

    console.log(`Loaded ${this.designs.size} designs into library`);
  }

  /**
   * Add a design to the library
   */
  addDesign(design) {
    // Validate design structure
    if (!this.validateDesign(design)) {
      throw new Error('Invalid design structure');
    }

    // Generate ID if not present
    if (!design.id) {
      design.id = this.generateId(design);
    }

    this.designs.set(design.id, design);
    
    // Save to localStorage for persistence
    this.saveToStorage(design.id, design);
    
    return design.id;
  }

  /**
   * Get a design by ID
   */
  getDesign(designId) {
    return this.designs.get(designId);
  }

  /**
   * Remove a design from the library
   */
  removeDesign(designId) {
    const removed = this.designs.delete(designId);
    if (removed) {
      this.removeFromStorage(designId);
    }
    return removed;
  }

  /**
   * Search designs by query string
   */
  searchDesigns(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    for (let [id, design] of this.designs) {
      const searchText = [
        design.name,
        design.shape,
        design.gemType,
        design.designer,
        design.description
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchText.includes(lowerQuery)) {
        results.push({ id, ...design });
      }
    }

    return results;
  }

  /**
   * Filter designs by category
   */
  filterByCategory(category) {
    if (category === 'all') {
      return Array.from(this.designs.values());
    }
    
    return Array.from(this.designs.values())
      .filter(d => d.category === category);
  }

  /**
   * Filter designs by multiple criteria
   */
  filterDesigns(filters) {
    let results = Array.from(this.designs.values());

    if (filters.category && filters.category !== 'all') {
      results = results.filter(d => d.category === filters.category);
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
      results = results.filter(d => d.difficulty === filters.difficulty);
    }

    if (filters.gemType && filters.gemType !== 'all') {
      results = results.filter(d => d.gemType === filters.gemType);
    }

    if (filters.shape && filters.shape !== 'all') {
      results = results.filter(d => d.shape === filters.shape);
    }

    if (filters.maxFacets) {
      results = results.filter(d => d.facets.length <= filters.maxFacets);
    }

    if (filters.maxTime) {
      results = results.filter(d => d.cuttingTime <= filters.maxTime);
    }

    return results;
  }

  /**
   * Get all unique gem types in library
   */
  getGemTypes() {
    const types = new Set();
    for (let design of this.designs.values()) {
      if (design.gemType) {
        types.add(design.gemType);
      }
    }
    return Array.from(types).sort();
  }

  /**
   * Get all unique shapes in library
   */
  getShapes() {
    const shapes = new Set();
    for (let design of this.designs.values()) {
      if (design.shape) {
        shapes.add(design.shape);
      }
    }
    return Array.from(shapes).sort();
  }

  /**
   * Import design from FacetDiagrams.org or other sources
   */
  async importFromURL(url) {
    try {
      const response = await fetch(url);
      const content = await response.text();
      
      // Determine file type from URL or content
      let design;
      
      if (url.endsWith('.asc')) {
        // Parse GemCad format
        const parser = new ASCParser();
        design = parser.parse(content);
        design = parser.toBarbrickFormat(design);
      } else if (url.endsWith('.json')) {
        // Parse JSON format
        design = JSON.parse(content);
      } else {
        throw new Error('Unsupported file format. Please use .asc or .json files.');
      }

      // Add metadata about import source
      design.metadata = design.metadata || {};
      design.metadata.sourceUrl = url;
      design.metadata.importDate = new Date().toISOString();
      design.category = design.category || 'imported';

      const designId = this.addDesign(design);
      return { success: true, designId, design };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Import design from file upload
   */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          let design;

          if (file.name.endsWith('.asc')) {
            const parser = new ASCParser();
            design = parser.parse(content);
            design = parser.toBarbrickFormat(design);
          } else if (file.name.endsWith('.json')) {
            design = JSON.parse(content);
          } else {
            throw new Error('Unsupported file format');
          }

          design.metadata = design.metadata || {};
          design.metadata.fileName = file.name;
          design.metadata.importDate = new Date().toISOString();
          design.category = design.category || 'imported';

          const designId = this.addDesign(design);
          resolve({ success: true, designId, design });
          
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      };

      reader.onerror = () => {
        reject({ success: false, error: 'Failed to read file' });
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validate design structure
   */
  validateDesign(design) {
    if (!design.name || typeof design.name !== 'string') {
      console.error('Design must have a name');
      return false;
    }

    if (!design.facets || !Array.isArray(design.facets) || design.facets.length === 0) {
      console.error('Design must have at least one facet');
      return false;
    }

    // Validate each facet
    for (let facet of design.facets) {
      if (typeof facet.angle !== 'number' || facet.angle < 0 || facet.angle > 90) {
        console.error('Invalid facet angle:', facet.angle);
        return false;
      }
      if (typeof facet.index !== 'number' || facet.index < 0 || facet.index > 360) {
        console.error('Invalid facet index:', facet.index);
        return false;
      }
    }

    return true;
  }

  /**
   * Generate unique ID for a design
   * Note: Shared logic with ASCParser.generateId() - consider extracting to utility
   */
  generateId(design) {
    const shape = design.shape || 'custom'; // Fallback to 'custom' if shape is undefined
    const nameSlug = design.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const timestamp = Date.now().toString(36);
    return `${shape}-${nameSlug}-${timestamp}`;
  }

  /**
   * Export design to JSON
   */
  exportToJSON(designId) {
    const design = this.designs.get(designId);
    if (!design) {
      throw new Error('Design not found');
    }
    return JSON.stringify(design, null, 2);
  }

  /**
   * Export design to ASC format
   */
  exportToASC(designId) {
    const design = this.designs.get(designId);
    if (!design) {
      throw new Error('Design not found');
    }
    const parser = new ASCParser();
    return parser.export(design);
  }

  /**
   * Save design to localStorage
   */
  saveToStorage(designId, design) {
    try {
      const key = `facet-design-${designId}`;
      localStorage.setItem(key, JSON.stringify(design));
    } catch (error) {
      console.warn('Could not save to localStorage:', error.message);
    }
  }

  /**
   * Remove design from localStorage
   */
  removeFromStorage(designId) {
    try {
      const key = `facet-design-${designId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Could not remove from localStorage:', error.message);
    }
  }

  /**
   * Load designs from localStorage
   */
  loadFromStorage() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('facet-design-')) {
          const design = JSON.parse(localStorage.getItem(key));
          this.designs.set(design.id, design);
        }
      }
    } catch (error) {
      console.warn('Could not load from localStorage:', error.message);
    }
  }

  /**
   * Get library statistics
   */
  getStats() {
    const stats = {
      totalDesigns: this.designs.size,
      byCategory: {},
      byDifficulty: {},
      byGemType: {},
      avgFacets: 0,
      avgCuttingTime: 0
    };

    let totalFacets = 0;
    let totalTime = 0;

    for (let design of this.designs.values()) {
      // Category stats
      stats.byCategory[design.category] = (stats.byCategory[design.category] || 0) + 1;
      
      // Difficulty stats
      stats.byDifficulty[design.difficulty] = (stats.byDifficulty[design.difficulty] || 0) + 1;
      
      // Gem type stats
      if (design.gemType) {
        stats.byGemType[design.gemType] = (stats.byGemType[design.gemType] || 0) + 1;
      }

      // Aggregate stats
      totalFacets += design.facets.length;
      totalTime += design.cuttingTime || 0;
    }

    stats.avgFacets = Math.round(totalFacets / this.designs.size);
    stats.avgCuttingTime = Math.round(totalTime / this.designs.size);

    return stats;
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FacetDesignLibrary;
}
