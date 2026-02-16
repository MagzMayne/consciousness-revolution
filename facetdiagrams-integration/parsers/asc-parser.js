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
 * File: asc-parser.js
 * Declaration ID: IP-136926E4-MLL28ZUS
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
 * ASC File Parser for GemCad Format
 * Parses .asc files from GemCad software and converts to BarbrickDesign JSON format
 * Compatible with FacetDiagrams.org resources
 */

class ASCParser {
  constructor() {
    // Lap grit mapping - converts grit numbers to lap type names
    // Used during faceting to determine the appropriate abrasive surface
    this.lapMapping = {
      '80': 'coarse',      // Coarse grit for initial shaping
      '260': 'medium',     // Medium grit for rough faceting
      '600': 'fine',       // Fine grit for detailed faceting
      '1200': 'pre-polish',// Pre-polish for surface preparation
      '3000': 'polish'     // Final polish for maximum brilliance
    };
  }

  /**
   * Parse an ASC file content into a design object
   * @param {string} ascContent - Raw content of .asc file
   * @returns {Object} Parsed design in BarbrickDesign format
   */
  parse(ascContent) {
    const lines = ascContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const design = {
      name: '',
      designer: '',
      gemType: '',
      shape: '',
      difficulty: 'intermediate',
      cuttingTime: 0,
      description: '',
      facets: [],
      metadata: {
        source: 'GemCad (.asc)',
        dateAdded: new Date().toISOString().split('T')[0],
        format: 'asc'
      }
    };

    let currentSection = null;
    let facetSequence = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse header metadata
      if (line.startsWith('cut ')) {
        design.name = line.substring(4).replace(/"/g, '').trim();
      } else if (line.startsWith('author ')) {
        design.designer = line.substring(7).replace(/"/g, '').trim();
      } else if (line.startsWith('stone ')) {
        design.gemType = line.substring(6).replace(/"/g, '').trim();
      } else if (line.startsWith('h ')) {
        // Shape info (h = height ratio, helps determine shape)
        const ratio = parseFloat(line.substring(2));
        design.shape = this.inferShape(ratio);
      } else if (line.startsWith('comments ')) {
        design.description = line.substring(9).replace(/"/g, '').trim();
      }
      
      // Parse facet sections
      else if (line.startsWith('p1') || line.startsWith('p2')) {
        // Pavilion facets
        currentSection = 'pavilion';
      } else if (line.startsWith('c1') || line.startsWith('c2')) {
        // Crown facets
        currentSection = 'crown';
      } else if (line.startsWith('g ')) {
        // Girdle
        currentSection = 'girdle';
      }
      
      // Parse angle data (format: angle index [additional params])
      else if (this.isAngleLine(line) && currentSection) {
        const facet = this.parseAngleLine(line, currentSection, facetSequence);
        if (facet) {
          design.facets.push(facet);
          facetSequence++;
        }
      }
    }

    // Estimate cutting time based on facet count
    design.cuttingTime = this.estimateCuttingTime(design.facets.length);
    design.difficulty = this.determineDifficulty(design.facets.length);

    return design;
  }

  /**
   * Check if a line contains angle data
   */
  isAngleLine(line) {
    // Angle lines typically start with a number
    return /^\d+(\.\d+)?/.test(line);
  }

  /**
   * Parse an angle line into a facet object
   */
  parseAngleLine(line, section, sequence) {
    const parts = line.split(/\s+/);
    
    if (parts.length < 2) return null;

    const angle = parseFloat(parts[0]);
    const index = parseFloat(parts[1]);

    if (isNaN(angle) || isNaN(index)) return null;

    return {
      sequence: sequence,
      cut: this.determineCutType(section, sequence),
      angle: angle,
      index: index,
      lap: this.determineLap(sequence),
      notes: `${section} facet`
    };
  }

  /**
   * Determine cut type based on section and sequence
   */
  determineCutType(section, sequence) {
    if (section === 'pavilion') {
      return sequence <= 8 ? 'pavilion_main' : 'pavilion_break';
    } else if (section === 'crown') {
      return sequence <= 4 ? 'crown_main' : 'crown_star';
    } else if (section === 'girdle') {
      return 'girdle';
    }
    return 'table';
  }

  /**
   * Determine appropriate lap based on cutting sequence
   */
  determineLap(sequence) {
    if (sequence <= 2) return 'coarse';
    if (sequence <= 5) return 'medium';
    if (sequence <= 8) return 'fine';
    if (sequence <= 12) return 'pre-polish';
    return 'polish';
  }

  /**
   * Infer gem shape from height ratio
   */
  inferShape(ratio) {
    if (ratio >= 0.55 && ratio <= 0.65) return 'round';
    if (ratio >= 0.45 && ratio <= 0.55) return 'oval';
    if (ratio >= 0.60 && ratio <= 0.70) return 'cushion';
    return 'custom';
  }

  /**
   * Estimate cutting time based on facet count
   */
  estimateCuttingTime(facetCount) {
    // Rough estimate: 3-5 minutes per facet
    return Math.round(facetCount * 4);
  }

  /**
   * Determine difficulty based on facet count
   */
  determineDifficulty(facetCount) {
    if (facetCount <= 20) return 'beginner';
    if (facetCount <= 50) return 'intermediate';
    return 'advanced';
  }

  /**
   * Validate parsed design
   */
  validate(design) {
    const errors = [];

    if (!design.name) errors.push('Design name is required');
    if (!design.facets || design.facets.length === 0) {
      errors.push('Design must have at least one facet');
    }

    // Validate facet data
    design.facets.forEach((facet, i) => {
      if (facet.angle < 0 || facet.angle > 90) {
        errors.push(`Facet ${i + 1}: Invalid angle ${facet.angle}`);
      }
      if (facet.index < 0 || facet.index > 360) {
        errors.push(`Facet ${i + 1}: Invalid index ${facet.index}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Convert parsed design to BarbrickDesign JSON format
   */
  toBarbrickFormat(design) {
    // Add category based on shape
    const category = this.categorizeDesign(design.shape);

    return {
      ...design,
      category: category,
      id: this.generateId(design),
      metadata: {
        ...design.metadata,
        importDate: new Date().toISOString(),
        validated: true
      }
    };
  }

  /**
   * Categorize design for library organization
   */
  categorizeDesign(shape) {
    const categories = {
      'round': 'brilliant',
      'oval': 'brilliant',
      'cushion': 'brilliant',
      'emerald': 'emerald',
      'octagon': 'emerald',
      'princess': 'princess',
      'square': 'princess'
    };

    return categories[shape] || 'custom';
  }

  /**
   * Generate unique ID for design
   */
  generateId(design) {
    const shape = design.shape || 'custom'; // Fallback to 'custom' if shape is undefined
    const nameSlug = design.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const timestamp = Date.now().toString(36);
    return `${shape}-${nameSlug}-${timestamp}`;
  }

  /**
   * Export design back to ASC format (if needed)
   */
  export(design) {
    let asc = '';
    
    asc += `cut "${design.name}"\n`;
    if (design.designer) asc += `author "${design.designer}"\n`;
    if (design.gemType) asc += `stone "${design.gemType}"\n`;
    asc += `comments "${design.description}"\n\n`;

    // Group facets by section
    const pavilion = design.facets.filter(f => f.cut.includes('pavilion'));
    const crown = design.facets.filter(f => f.cut.includes('crown'));

    if (pavilion.length > 0) {
      asc += `p1\n`;
      pavilion.forEach(f => {
        asc += `${f.angle} ${f.index}\n`;
      });
      asc += `\n`;
    }

    if (crown.length > 0) {
      asc += `c1\n`;
      crown.forEach(f => {
        asc += `${f.angle} ${f.index}\n`;
      });
      asc += `\n`;
    }

    return asc;
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ASCParser;
}
