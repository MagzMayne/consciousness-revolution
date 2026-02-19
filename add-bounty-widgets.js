#!/usr/bin/env node

/**
 * Add Bounty Widget to All Dashboards
 * 
 * This script automatically adds the bounty widget to all dashboard HTML files
 * that don't already have it.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const WIDGET_HTML = `
        <!-- Bounty Widget -->
        <div id="bounty-widget"></div>
`;

const WIDGET_SCRIPT = '<script src="bounty-widget.js"></script>';

async function addBountyWidgetToDashboards() {
    console.log('🔍 Finding dashboard files...');
    
    // Find all dashboard HTML files
    const dashboardFiles = await glob('*dashboard*.html', {
        cwd: process.cwd(),
        absolute: false
    });
    
    console.log(`📊 Found ${dashboardFiles.length} dashboard files`);
    
    let modified = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const file of dashboardFiles) {
        try {
            let content = fs.readFileSync(file, 'utf8');
            
            // Skip if already has bounty widget
            if (content.includes('id="bounty-widget"')) {
                console.log(`⏭️  Skipped ${file} (already has widget)`);
                skipped++;
                continue;
            }
            
            // Skip if doesn't have a main content area we can identify
            if (!content.includes('</header>') && !content.includes('</nav>')) {
                console.log(`⏭️  Skipped ${file} (no identifiable insertion point)`);
                skipped++;
                continue;
            }
            
            let wasModified = false;
            
            // Try to add widget after header/nav section
            if (content.includes('</header>')) {
                // Find the first closing header tag
                const headerEndIndex = content.indexOf('</header>');
                const afterHeader = content.indexOf('>', headerEndIndex + 9) + 1;
                
                // Insert widget
                content = content.slice(0, afterHeader) + 
                         '\n' + WIDGET_HTML + '\n' +
                         content.slice(afterHeader);
                wasModified = true;
            } else if (content.includes('</nav>')) {
                // Find the first closing nav tag
                const navEndIndex = content.indexOf('</nav>');
                const afterNav = content.indexOf('>', navEndIndex + 6) + 1;
                
                // Insert widget
                content = content.slice(0, afterNav) + 
                         '\n' + WIDGET_HTML + '\n' +
                         content.slice(afterNav);
                wasModified = true;
            }
            
            // Add script if not present
            if (!content.includes('bounty-widget.js')) {
                // Add before closing body tag
                if (content.includes('</body>')) {
                    const bodyEndIndex = content.lastIndexOf('</body>');
                    
                    // Check if there's already a script section before body
                    const lastScriptIndex = content.lastIndexOf('</script>', bodyEndIndex);
                    let insertIndex;
                    
                    if (lastScriptIndex > 0 && lastScriptIndex < bodyEndIndex) {
                        // Insert after last script
                        insertIndex = content.indexOf('>', lastScriptIndex) + 1;
                    } else {
                        // Insert before body
                        insertIndex = bodyEndIndex;
                    }
                    
                    content = content.slice(0, insertIndex) + 
                             '\n    ' + WIDGET_SCRIPT + '\n' +
                             content.slice(insertIndex);
                    wasModified = true;
                }
            }
            
            if (wasModified) {
                // Write back to file
                fs.writeFileSync(file, content, 'utf8');
                console.log(`✅ Added widget to ${file}`);
                modified++;
            } else {
                console.log(`⏭️  Skipped ${file} (couldn't find insertion point)`);
                skipped++;
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
            errors++;
        }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Modified: ${modified}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📁 Total: ${dashboardFiles.length}`);
    
    if (modified > 0) {
        console.log('\n🎉 Bounty widgets successfully added!');
        console.log('💡 Remember to test the dashboards to ensure proper placement.');
    }
}

// Run if called directly
if (require.main === module) {
    addBountyWidgetToDashboards()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { addBountyWidgetToDashboards };
