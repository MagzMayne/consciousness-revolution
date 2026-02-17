/**
 * PAGE REGISTRY BUILDER
 * Scans all HTML files and creates metadata index
 */

const fs = require('fs');
const path = require('path');

const deployDir = __dirname;
const registry = {
    generated: new Date().toISOString(),
    totalPages: 0,
    categories: {},
    pages: []
};

// Category detection patterns
const categoryPatterns = {
    'ai': /^ai|AI|araya|gembot|merlin/i,
    'dashboard': /dashboard|admin|cockpit|hub/i,
    'tools': /tool|scanner|detector|analyzer/i,
    'games': /game|poker|casino|oasis/i,
    'financial': /bank|pay|stripe|invoice|budget/i,
    'learning': /school|academy|cert|learn|tutorial/i,
    'community': /discord|social|community/i,
    'hardware': /arduino|robot|gembot|scanner/i,
    'core': /^index|login|workspace|terminal|dashboard/i,
    'misc': /.*/
};

// Get all HTML files (not in subdirectories for speed)
const files = fs.readdirSync(deployDir)
    .filter(f => f.endsWith('.html'))
    .slice(0, 200); // Limit for initial registry

files.forEach(filename => {
    try {
        const filepath = path.join(deployDir, filename);
        const content = fs.readFileSync(filepath, 'utf8');

        // Extract title
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : filename;

        // Check for features
        const hasBetaBadge = content.includes('beta-banner.js') || content.includes('beta-badge');
        const hasBugWidget = content.includes('bug-widget.js');
        const hasBrainQuery = content.includes('brain-query') || content.includes('brain-api');

        // Detect category
        let category = 'misc';
        for (const [cat, pattern] of Object.entries(categoryPatterns)) {
            if (pattern.test(filename) || pattern.test(title)) {
                category = cat;
                break;
            }
        }

        // Update category count
        registry.categories[category] = (registry.categories[category] || 0) + 1;

        // Add to pages
        registry.pages.push({
            file: filename,
            title: title.slice(0, 80),
            category,
            features: {
                betaBadge: hasBetaBadge,
                bugWidget: hasBugWidget,
                brainConnected: hasBrainQuery
            },
            url: `https://conciousnessrevolution.io/${filename}`
        });

    } catch (e) {
        console.error(`Error processing ${filename}: ${e.message}`);
    }
});

registry.totalPages = registry.pages.length;

// Sort pages by category then name
registry.pages.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.file.localeCompare(b.file);
});

// Write registry
fs.writeFileSync(
    path.join(deployDir, 'PAGE_REGISTRY.json'),
    JSON.stringify(registry, null, 2)
);

console.log(`✅ Registry built: ${registry.totalPages} pages indexed`);
console.log('Categories:', registry.categories);
