# FacetDiagrams.org Integration - Quick Start

## Overview

We've successfully integrated FacetDiagrams.org resources into the BarbrickDesign platform, providing access to professional gemstone faceting designs and enhancing our shape and design selection options.

## What's New

### 1. Facet Design Library Browser
**URL:** `/facet-design-library.html`

A comprehensive interface for browsing, searching, and importing gemstone faceting designs:
- 🔍 Search by name, shape, or gem type
- 🎯 Filter by category, difficulty, and gem type
- 📊 View design statistics and metadata
- 📥 Import designs from URLs or files (.asc, .json)

### 2. File Format Support

The integration supports multiple industry-standard file formats:
- **ASC** (GemCad format) - Fully parsed and converted
- **JSON** (BarbrickDesign native format)
- **PDF** (documentation - future support)
- **GEM** (Gem Cut Studio - future support)

### 3. Pre-loaded Design Library

Four sample designs are included:
- **Standard Brilliant** - Classic 57-facet diamond cut
- **Classic Emerald** - Traditional step cut
- **Modern Princess** - Contemporary square cut
- **Starburst Fantasy** - Advanced artistic design

### 4. Integration Points

The facet design library is accessible from:
- 🏭 Laboratory page (`/laboratory.html`)
- Direct link: `/facet-design-library.html`

## File Formats

### ASC Format (GemCad)
```
cut "Standard Brilliant"
author "Marcel Tolkowsky"
stone "Diamond"
h 0.60

p1
40.75 0
40.75 45
...
```

### JSON Format (BarbrickDesign)
```json
{
  "name": "Standard Brilliant",
  "designer": "Marcel Tolkowsky",
  "gemType": "Diamond",
  "shape": "round",
  "category": "brilliant",
  "difficulty": "intermediate",
  "cuttingTime": 45,
  "facets": [
    {
      "sequence": 1,
      "cut": "pavilion_main",
      "angle": 40.75,
      "index": 0,
      "lap": "coarse"
    }
  ]
}
```

## How to Use

### Browsing Designs

1. Navigate to `/facet-design-library.html`
2. Use the search bar to find designs
3. Apply filters for category, difficulty, or gem type
4. Click on any design card to view details
5. Click "Load Design" to use with the faceting machine

### Importing Designs

**From URL:**
1. Click the "📥 Import" button
2. Enter a URL to an .asc or .json file
3. Click "Import"

**From File:**
1. Click the "📥 Import" button
2. Choose a file from your computer
3. Click "Import"

### Using Imported Designs

Once imported, designs are:
- Stored in localStorage for persistence
- Available in the design grid
- Ready to load into the faceting machine
- Exportable back to ASC or JSON format

## Architecture

```
facetdiagrams-integration/
├── parsers/
│   └── asc-parser.js          # Parse GemCad .asc files
├── library/
│   └── facet-library.js       # Manage design collection
└── data/
    └── designs/               # Pre-loaded designs
        ├── brilliant/
        ├── emerald/
        ├── princess/
        └── fantasy/
```

## Key Features

### Parser (asc-parser.js)
- Parses GemCad .asc format
- Extracts metadata (name, designer, gem type)
- Converts angle/index data to facet objects
- Auto-determines lap sequences
- Validates design integrity

### Library Manager (facet-library.js)
- Stores designs in memory and localStorage
- Search and filter functionality
- Import from URL or file
- Export to JSON or ASC
- Design statistics and analytics

### Design Browser UI
- Responsive grid layout
- Real-time search
- Multiple filter options
- Statistics dashboard
- Modal import dialog

## Integration with Existing Systems

### Faceting Machine
The designs integrate seamlessly with the existing faceting machine system:

```javascript
// Load a design into the faceting machine
const design = library.getDesign(designId);
if (window.facetProcessor) {
  facetProcessor.loadCustomDesign(design);
  facetProcessor.startAutomatedCutting();
}
```

### Jewelry Creator
Designs can be referenced in jewelry creation workflows for custom gem specifications.

### Gems Pipeline
Integration with the automated gemstone sourcing and cutting pipeline.

## External Resources

### FacetDiagrams.org
- Main repository: https://facetdiagrams.org
- Thousands of free designs
- Community-contributed patterns
- Professional and hobbyist designs

### Related Sites
- United States Faceters Guild: https://usfacetersguild.org/faceting-diagrams/
- International Gem Society: https://www.gemsociety.org/jewelry-lapidary/faceting-diagrams/
- Andrew Brown's Designs: https://facetingdesigns.com/freedesigns/

## Benefits

1. **Expanded Library**: Access to thousands of professional designs
2. **Standard Formats**: Industry-standard .asc file support
3. **Easy Import**: Simple URL or file-based import
4. **Organized Storage**: Category-based organization
5. **Search & Filter**: Quick design discovery
6. **Integration Ready**: Works with existing faceting machine
7. **Extensible**: Easy to add more designs and formats

## Future Enhancements

Planned improvements include:
- Direct API integration with FacetDiagrams.org
- PDF diagram extraction
- GEM format support (Gem Cut Studio)
- 3D preview rendering
- Design modification tools
- Community design sharing
- Automated design optimization
- Batch design downloads

## Documentation

Comprehensive documentation available:
- **Integration Guide**: `/FACETDIAGRAMS_INTEGRATION_GUIDE.md`
- **Faceting Machine**: `/mandem.os/workspace/FACETING_MACHINE_README.md`
- **Code Documentation**: Inline comments in all source files

## Quick Links

- 🏭 [Laboratory](/laboratory.html)
- 💎 [Facet Design Library](/facet-design-library.html)
- 📖 [Integration Guide](/FACETDIAGRAMS_INTEGRATION_GUIDE.md)
- 🔬 [Faceting Machine Docs](/mandem.os/workspace/FACETING_MACHINE_README.md)

## Technical Notes

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- localStorage for design persistence
- File API for imports

### Performance
- Efficient in-memory design storage
- Fast search and filtering
- Lazy loading for large libraries
- Minimal impact on page load

### Security
- Input validation on all imports
- Sanitized file uploads
- No server-side processing required
- Client-side only operations

---

**Status**: ✅ Fully Implemented
**Version**: 1.0.0
**Date**: 2026-01-14
**Integration**: Complete
