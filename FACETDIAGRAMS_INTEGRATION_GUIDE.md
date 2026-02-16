# FacetDiagrams.org Integration Guide

## Overview

This guide documents the integration of [FacetDiagrams.org](https://facetdiagrams.org) resources into the BarbrickDesign gemstone faceting system, providing access to thousands of professional gemstone cutting designs.

## What is FacetDiagrams.org?

FacetDiagrams.org is a comprehensive repository of gemstone faceting diagrams contributed by professional and hobbyist gem cutters worldwide. It provides:

- **Thousands of designs** for various gem shapes (rounds, ovals, cushions, hearts, pears, etc.)
- **Multiple difficulty levels** from beginner to advanced
- **Various gem types** with optimized cutting parameters
- **Community contributions** from expert faceters

## File Formats Supported

### 1. ASC Format (GemCad)
- **Description**: Native format for GemCad software
- **Extension**: `.asc`
- **Contents**: Facet angles, index positions, cutting sequences
- **Usage**: Primary format for digital faceting simulation

### 2. GEM Format (Gem Cut Studio)
- **Description**: Native format for Gem Cut Studio software
- **Extension**: `.gem`
- **Contents**: Similar to ASC with additional metadata
- **Usage**: Alternative professional faceting software format

### 3. PDF Format
- **Description**: Printable diagrams for manual reference
- **Extension**: `.pdf`
- **Contents**: Visual diagrams, cutting instructions, notes
- **Usage**: Manual cutting reference and documentation

### 4. JSON Format (BarbrickDesign Native)
- **Description**: Custom format for web-based integration
- **Extension**: `.json`
- **Contents**: Structured facet data in JavaScript-friendly format
- **Usage**: Direct integration with our faceting machine system

## Data Structure

### Standard Facet Diagram JSON Schema

```json
{
  "name": "Standard Brilliant",
  "designer": "Designer Name",
  "gemType": "Diamond",
  "difficulty": "intermediate",
  "cuttingTime": 45,
  "shape": "round",
  "description": "Classic brilliant cut optimized for maximum light return",
  "facets": [
    {
      "sequence": 1,
      "cut": "pavilion_main",
      "angle": 40.75,
      "index": 96,
      "lap": "coarse",
      "notes": "Main pavilion facets"
    },
    {
      "sequence": 2,
      "cut": "pavilion_break",
      "angle": 43.00,
      "index": 48,
      "lap": "medium",
      "notes": "Lower girdle facets"
    }
  ],
  "metadata": {
    "source": "facetdiagrams.org",
    "sourceUrl": "https://facetdiagrams.org/designs/brilliant-001",
    "dateAdded": "2026-01-14",
    "popularity": 4.8,
    "views": 12450
  }
}
```

## Integration Architecture

### Component Structure

```
facetdiagrams-integration/
├── parsers/
│   ├── asc-parser.js       # Parse GemCad .asc files
│   ├── gem-parser.js       # Parse Gem Cut Studio .gem files
│   ├── pdf-extractor.js    # Extract data from PDF diagrams
│   └── converter.js        # Convert to BarbrickDesign JSON format
├── library/
│   ├── facet-library.js    # Manage design collection
│   ├── design-browser.js   # UI for browsing designs
│   └── search-filter.js    # Search and filter functionality
├── data/
│   ├── designs/            # Stored facet designs
│   │   ├── brilliant/
│   │   ├── emerald/
│   │   ├── princess/
│   │   └── custom/
│   └── cache/              # Cached external designs
└── ui/
    ├── design-selector.html
    ├── design-preview.js
    └── facet-library.css
```

## Implementation Guide

### Step 1: ASC File Parser

```javascript
class ASCParser {
  parse(ascContent) {
    const lines = ascContent.split('\n');
    const design = {
      name: '',
      facets: [],
      metadata: {}
    };
    
    // Parse header information
    for (let line of lines) {
      if (line.startsWith('NAME:')) {
        design.name = line.substring(5).trim();
      } else if (line.startsWith('ANGLE:')) {
        // Parse angle data
        const [angle, index] = this.parseAngleLine(line);
        design.facets.push({ angle, index });
      }
    }
    
    return this.convertToBarbrickFormat(design);
  }
  
  parseAngleLine(line) {
    // Implementation for parsing angle lines
    const parts = line.split(/\s+/);
    return [parseFloat(parts[1]), parseInt(parts[2])];
  }
  
  convertToBarbrickFormat(design) {
    // Convert to our JSON schema
    return {
      name: design.name,
      facets: design.facets.map((f, i) => ({
        sequence: i + 1,
        angle: f.angle,
        index: f.index,
        lap: this.determineLap(i, design.facets.length)
      }))
    };
  }
  
  determineLap(index, total) {
    // Determine appropriate lap based on sequence
    if (index < total * 0.3) return 'coarse';
    if (index < total * 0.6) return 'medium';
    if (index < total * 0.9) return 'fine';
    return 'polish';
  }
}
```

### Step 2: Design Library Manager

```javascript
class FacetDesignLibrary {
  constructor() {
    this.designs = new Map();
    this.categories = ['brilliant', 'emerald', 'princess', 'custom', 'imported'];
    this.loadLocalDesigns();
  }
  
  async loadLocalDesigns() {
    // Load pre-bundled designs
    const designPaths = await this.getDesignPaths();
    for (let path of designPaths) {
      const design = await fetch(path).then(r => r.json());
      this.addDesign(design);
    }
  }
  
  addDesign(design) {
    const id = this.generateId(design);
    this.designs.set(id, design);
    return id;
  }
  
  searchDesigns(query) {
    const results = [];
    for (let [id, design] of this.designs) {
      if (this.matchesQuery(design, query)) {
        results.push({ id, ...design });
      }
    }
    return results;
  }
  
  matchesQuery(design, query) {
    const searchText = `${design.name} ${design.shape} ${design.gemType}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  }
  
  filterByCategory(category) {
    return Array.from(this.designs.values())
      .filter(d => d.category === category);
  }
  
  async importFromFacetDiagrams(designUrl) {
    // Fetch and parse design from external source
    const response = await fetch(designUrl);
    const data = await response.text();
    
    // Determine file type and parse accordingly
    if (designUrl.endsWith('.asc')) {
      const parser = new ASCParser();
      return parser.parse(data);
    }
    // ... handle other formats
  }
  
  generateId(design) {
    return `${design.shape}-${design.name.replace(/\s+/g, '-').toLowerCase()}`;
  }
}
```

### Step 3: Design Browser UI

```javascript
class DesignBrowserUI {
  constructor(containerId, library) {
    this.container = document.getElementById(containerId);
    this.library = library;
    this.currentFilter = { category: 'all', difficulty: 'all' };
    this.render();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="design-browser">
        <div class="browser-header">
          <h2>Facet Design Library</h2>
          <div class="search-bar">
            <input type="text" id="designSearch" placeholder="Search designs...">
            <button id="importBtn">Import from URL</button>
          </div>
        </div>
        
        <div class="browser-filters">
          <select id="categoryFilter">
            <option value="all">All Categories</option>
            <option value="brilliant">Brilliant Cuts</option>
            <option value="emerald">Step Cuts</option>
            <option value="princess">Princess Cuts</option>
            <option value="custom">Custom Designs</option>
            <option value="imported">Imported</option>
          </select>
          
          <select id="difficultyFilter">
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          
          <select id="gemTypeFilter">
            <option value="all">All Gem Types</option>
            <option value="diamond">Diamond</option>
            <option value="sapphire">Sapphire</option>
            <option value="emerald">Emerald</option>
            <option value="ruby">Ruby</option>
          </select>
        </div>
        
        <div class="design-grid" id="designGrid"></div>
      </div>
    `;
    
    this.attachEventListeners();
    this.updateGrid();
  }
  
  attachEventListeners() {
    const searchInput = document.getElementById('designSearch');
    searchInput.addEventListener('input', (e) => {
      this.updateGrid(e.target.value);
    });
    
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', (e) => {
      this.currentFilter.category = e.target.value;
      this.updateGrid();
    });
    
    const importBtn = document.getElementById('importBtn');
    importBtn.addEventListener('click', () => {
      this.showImportDialog();
    });
  }
  
  updateGrid(searchQuery = '') {
    const grid = document.getElementById('designGrid');
    let designs = Array.from(this.library.designs.values());
    
    // Apply filters
    if (searchQuery) {
      designs = this.library.searchDesigns(searchQuery);
    }
    
    if (this.currentFilter.category !== 'all') {
      designs = designs.filter(d => d.category === this.currentFilter.category);
    }
    
    // Render design cards
    grid.innerHTML = designs.map(design => this.renderDesignCard(design)).join('');
  }
  
  renderDesignCard(design) {
    return `
      <div class="design-card" data-design-id="${design.id}">
        <div class="card-preview">
          <canvas class="design-preview" data-design="${JSON.stringify(design).replace(/"/g, '&quot;')}"></canvas>
        </div>
        <div class="card-info">
          <h3>${design.name}</h3>
          <p class="design-meta">
            <span class="badge">${design.shape}</span>
            <span class="badge">${design.difficulty}</span>
          </p>
          <p class="design-stats">
            <span>📊 ${design.facets.length} facets</span>
            <span>⏱️ ~${design.cuttingTime}min</span>
          </p>
          <button class="load-design-btn" onclick="loadDesign('${design.id}')">
            Load Design
          </button>
        </div>
      </div>
    `;
  }
  
  showImportDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'import-dialog';
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Import Facet Design</h3>
        <p>Enter URL from FacetDiagrams.org or upload a file:</p>
        <input type="text" id="importUrl" placeholder="https://facetdiagrams.org/designs/...">
        <input type="file" id="importFile" accept=".asc,.gem,.json">
        <div class="dialog-actions">
          <button onclick="this.closest('.import-dialog').remove()">Cancel</button>
          <button onclick="importDesign()">Import</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  }
}
```

## Usage Examples

### Loading a Design

```javascript
// Initialize the library
const library = new FacetDesignLibrary();
const browser = new DesignBrowserUI('design-browser', library);

// Load a design by ID
function loadDesign(designId) {
  const design = library.designs.get(designId);
  
  // Pass to faceting machine
  if (window.facetProcessor) {
    facetProcessor.loadCustomDesign(design);
    facetProcessor.startAutomatedCutting();
  }
}

// Import from URL
async function importDesign() {
  const url = document.getElementById('importUrl').value;
  
  try {
    const design = await library.importFromFacetDiagrams(url);
    library.addDesign(design);
    alert('Design imported successfully!');
    browser.updateGrid();
  } catch (error) {
    alert('Failed to import design: ' + error.message);
  }
}
```

### Searching and Filtering

```javascript
// Search for designs
const results = library.searchDesigns('brilliant diamond');

// Filter by category
const brilliantCuts = library.filterByCategory('brilliant');

// Filter by gem type
const diamondDesigns = Array.from(library.designs.values())
  .filter(d => d.gemType === 'Diamond');
```

## Integration with Existing System

The facet diagram library integrates seamlessly with the existing faceting machine system described in `FACETING_MACHINE_README.md`:

1. **Design Selection**: Users browse and select designs from the enhanced library
2. **Format Conversion**: Imported designs are converted to the machine-compatible JSON format
3. **Machine Loading**: Selected designs are loaded into the FacetProcessor
4. **Automated Cutting**: The faceting machine executes the design automatically

## External Resources

### FacetDiagrams.org Integration

```javascript
// API endpoint for fetching designs (if available)
const FACETDIAGRAMS_API = 'https://facetdiagrams.org/api/designs';

// Example: Fetch popular designs
async function fetchPopularDesigns() {
  const response = await fetch(`${FACETDIAGRAMS_API}/popular?limit=20`);
  const designs = await response.json();
  return designs;
}
```

### Related Resources

- [United States Faceters Guild](https://usfacetersguild.org/faceting-diagrams/)
- [Midwest Faceter's Guild](https://midwestfaceters.org/diagrams-software-techniques/)
- [International Gem Society](https://www.gemsociety.org/jewelry-lapidary/faceting-diagrams/)
- [Andrew Brown's Free Faceting Designs](https://facetingdesigns.com/freedesigns/)

## File Storage Structure

```
data/
├── designs/
│   ├── brilliant/
│   │   ├── standard-brilliant.json
│   │   ├── ideal-brilliant.json
│   │   └── portuguese-brilliant.json
│   ├── emerald/
│   │   ├── classic-emerald.json
│   │   └── step-cut-octagon.json
│   ├── princess/
│   │   ├── modern-princess.json
│   │   └── princess-square.json
│   ├── fantasy/
│   │   ├── starburst.json
│   │   ├── butterfly.json
│   │   └── pinwheel.json
│   └── imported/
│       └── (user-imported designs)
```

## Benefits of Integration

1. **Expanded Design Library**: Access to thousands of professional designs
2. **Community Knowledge**: Leverage expertise from professional faceters worldwide
3. **Standardized Formats**: Industry-standard file format support
4. **Easy Import**: Simple import process for external designs
5. **Enhanced Options**: Wide variety of shapes, styles, and difficulty levels
6. **Educational Value**: Learn from expert cutting sequences
7. **Flexibility**: Support for custom designs and modifications

## Future Enhancements

- [ ] Direct API integration with FacetDiagrams.org
- [ ] Real-time design synchronization
- [ ] User ratings and reviews
- [ ] Design modification tools
- [ ] 3D preview rendering for all designs
- [ ] Community design sharing
- [ ] Design optimization suggestions
- [ ] Automated design conversion tools
- [ ] Batch design downloads
- [ ] Design comparison tools

## Support and Documentation

For questions or issues with the facet diagram integration:

1. Review this guide
2. Check the `FACETING_MACHINE_README.md` for machine operation details
3. Consult browser console for error messages
4. Visit FacetDiagrams.org for design resources

---

**Status**: ✅ Implementation Ready
**Version**: 1.0.0
**Last Updated**: 2026-01-14
**Compatible With**: FacetDiagrams.org, GemCad, Gem Cut Studio
