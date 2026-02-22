/**
 * dashboard-merge.mjs - Dashboard Factory Phase 2
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Dashboard Merge Tool - Smart code injection
// Merges selected features from source dashboard to target dashboard
// Strategies: quadrant (positional), smart (near similar), append (before </body>)

import fs from 'fs';
import path from 'path';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const {
      source_dashboard,
      target_dashboard,
      feature_ids,
      strategy = 'append',
      preview_only = true
    } = JSON.parse(event.body || '{}');

    if (!source_dashboard || !target_dashboard || !feature_ids || feature_ids.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required params: source_dashboard, target_dashboard, feature_ids (array)'
        })
      };
    }

    // Load feature registry
    const registryPath = path.join(process.cwd(), 'DASHBOARD_FEATURES_REGISTRY.json');
    const registryData = fs.readFileSync(registryPath, 'utf8');
    const registry = JSON.parse(registryData);

    // Load source and target dashboards
    const sourcePath = path.join(process.cwd(), source_dashboard);
    const targetPath = path.join(process.cwd(), target_dashboard);

    if (!fs.existsSync(sourcePath)) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Source dashboard not found: ${source_dashboard}` })
      };
    }

    if (!fs.existsSync(targetPath)) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Target dashboard not found: ${target_dashboard}` })
      };
    }

    const sourceHTML = fs.readFileSync(sourcePath, 'utf8');
    const targetHTML = fs.readFileSync(targetPath, 'utf8');

    // Extract features to merge
    const featuresToMerge = [];
    for (const featureId of feature_ids) {
      const feature = registry.features.find(f => f.id === featureId);
      if (!feature) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: `Feature not found: ${featureId}` })
        };
      }

      // Extract feature code from source dashboard
      const featureCode = extractFeatureCode(sourceHTML, feature);
      if (!featureCode) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: `Could not extract feature ${featureId} from ${source_dashboard}`
          })
        };
      }

      featuresToMerge.push({
        id: feature.id,
        name: feature.name,
        code: featureCode,
        category: feature.category,
        dependencies: feature.dependencies
      });
    }

    // Check dependencies
    const missingDeps = checkDependencies(featuresToMerge, targetHTML, registry);
    if (missingDeps.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing dependencies',
          missing_dependencies: missingDeps,
          suggestion: 'Install these features first or include them in the merge'
        })
      };
    }

    // Perform merge
    let mergedHTML = targetHTML;
    const injectionLog = [];

    for (const feature of featuresToMerge) {
      const result = injectFeature(mergedHTML, feature, strategy);
      mergedHTML = result.html;
      injectionLog.push({
        feature_id: feature.id,
        feature_name: feature.name,
        strategy_used: result.strategy,
        injection_point: result.injection_point,
        success: result.success
      });
    }

    // Update DNA block
    mergedHTML = updateDNABlock(mergedHTML, target_dashboard, featuresToMerge);

    // If preview_only, don't save to file
    if (preview_only) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          preview: true,
          merged_html: mergedHTML,
          injection_log: injectionLog,
          features_merged: featuresToMerge.length,
          target_dashboard: target_dashboard,
          message: 'Preview generated. Set preview_only=false to save changes.'
        })
      };
    }

    // Save merged HTML
    fs.writeFileSync(targetPath, mergedHTML, 'utf8');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        target_dashboard: target_dashboard,
        features_merged: featuresToMerge.length,
        injection_log: injectionLog,
        message: `Successfully merged ${featuresToMerge.length} feature(s) into ${target_dashboard}`
      })
    };

  } catch (error) {
    console.error('Dashboard merge error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};

// Extract feature code from dashboard HTML
function extractFeatureCode(html, feature) {
  // Look for feature markers (<!-- FEATURE: id -->...<!-- /FEATURE -->)
  const featureRegex = new RegExp(
    `<!-- FEATURE: ${feature.id} -->([\\s\\S]*?)<!-- \\/FEATURE -->`,
    'i'
  );
  const match = html.match(featureRegex);

  if (match) {
    return match[0]; // Return full block including markers
  }

  // Fallback: Search by feature name in comments
  const nameRegex = new RegExp(
    `<!-- ${feature.name} START -->([\\s\\S]*?)<!-- ${feature.name} END -->`,
    'i'
  );
  const nameMatch = html.match(nameRegex);

  if (nameMatch) {
    return nameMatch[0];
  }

  // If no markers, try to extract by class/id (requires feature metadata)
  // This is a fallback for widgets without proper markers
  return null;
}

// Check if target dashboard has required dependencies
function checkDependencies(features, targetHTML, registry) {
  const missing = [];

  for (const feature of features) {
    if (!feature.dependencies || feature.dependencies.length === 0) continue;

    for (const dep of feature.dependencies) {
      // Check if dependency is a feature
      if (dep.startsWith('feat_')) {
        const depFeature = registry.features.find(f => f.id === dep);
        if (!depFeature) continue;

        // Check if target has this feature
        const hasFeature = targetHTML.includes(`<!-- FEATURE: ${dep} -->`);
        if (!hasFeature) {
          missing.push({
            required_by: feature.id,
            dependency: dep,
            dependency_name: depFeature.name,
            type: 'feature'
          });
        }
      }
      // Check if dependency is a script/service
      else if (dep.includes('.js') || dep.includes('.mjs')) {
        const hasScript = targetHTML.includes(dep);
        if (!hasScript) {
          missing.push({
            required_by: feature.id,
            dependency: dep,
            type: 'script'
          });
        }
      }
    }
  }

  return missing;
}

// Inject feature using specified strategy
function injectFeature(html, feature, strategy) {
  let injectedHTML = html;
  let injectionPoint = 'unknown';
  let actualStrategy = strategy;

  if (strategy === 'quadrant') {
    // Insert into specific quadrant (top-left, top-right, bottom-left, bottom-right)
    // Default to top-right if no quadrant specified
    const result = insertIntoQuadrant(html, feature.code, 'top-right');
    injectedHTML = result.html;
    injectionPoint = result.location;
  }
  else if (strategy === 'smart') {
    // Detect similar widgets, insert nearby
    const result = insertAfterSimilar(html, feature);
    if (result.found) {
      injectedHTML = result.html;
      injectionPoint = result.location;
    } else {
      // Fallback to append if no similar widgets found
      actualStrategy = 'append (smart fallback)';
      injectedHTML = html.replace('</body>', `\n${feature.code}\n</body>`);
      injectionPoint = 'before </body>';
    }
  }
  else {
    // Default: append before </body>
    injectedHTML = html.replace('</body>', `\n${feature.code}\n</body>`);
    injectionPoint = 'before </body>';
  }

  return {
    html: injectedHTML,
    strategy: actualStrategy,
    injection_point: injectionPoint,
    success: true
  };
}

// Insert into specific quadrant of the page
function insertIntoQuadrant(html, featureCode, quadrant = 'top-right') {
  // Look for quadrant containers
  const quadrantMap = {
    'top-left': /<!-- TOP-LEFT QUADRANT -->[\s\S]*?<!-- \/TOP-LEFT -->/i,
    'top-right': /<!-- TOP-RIGHT QUADRANT -->[\s\S]*?<!-- \/TOP-RIGHT -->/i,
    'bottom-left': /<!-- BOTTOM-LEFT QUADRANT -->[\s\S]*?<!-- \/BOTTOM-LEFT -->/i,
    'bottom-right': /<!-- BOTTOM-RIGHT QUADRANT -->[\s\S]*?<!-- \/BOTTOM-RIGHT -->/i
  };

  const regex = quadrantMap[quadrant];
  if (regex && regex.test(html)) {
    // Insert before closing tag
    const closingTag = `<!-- /${quadrant.toUpperCase().replace('-', '-')} -->`;
    const modifiedHTML = html.replace(closingTag, `${featureCode}\n${closingTag}`);
    return { html: modifiedHTML, location: quadrant };
  }

  // Fallback: append before </body>
  return {
    html: html.replace('</body>', `\n${featureCode}\n</body>`),
    location: 'before </body> (quadrant not found)'
  };
}

// Insert after similar widgets (same category)
function insertAfterSimilar(html, feature) {
  // Look for widgets in the same category
  const categoryRegex = new RegExp(
    `<!-- FEATURE: feat_\\d+ -->([\\s\\S]*?)<!-- CATEGORY: ${feature.category} -->([\\s\\S]*?)<!-- \\/FEATURE -->`,
    'i'
  );

  const match = html.match(categoryRegex);
  if (match) {
    // Insert after this feature block
    const insertAfter = match[0];
    const modifiedHTML = html.replace(insertAfter, `${insertAfter}\n${feature.code}`);
    return {
      html: modifiedHTML,
      location: `after similar ${feature.category} widget`,
      found: true
    };
  }

  return { html, location: 'none', found: false };
}

// Update DNA block with merged features
function updateDNABlock(html, dashboardName, mergedFeatures) {
  const dnaRegex = /<script id="dashboard-dna" type="application\/json">([\s\S]*?)<\/script>/;
  const match = html.match(dnaRegex);

  if (!match) {
    // No DNA block, create one
    const newDNA = {
      version: "1.0.0",
      owner: "merged_dashboard",
      dashboard_name: dashboardName,
      created: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString(),
      changelog: [
        {
          date: new Date().toISOString().split('T')[0],
          version: "1.0.0",
          changes: mergedFeatures.map(f => `Merged ${f.name} (${f.id})`),
          author: "Dashboard Factory"
        }
      ],
      installed_features: mergedFeatures.map(f => f.id),
      lfsme_impact: { average: 8.5 }
    };

    const dnaBlock = `\n<script id="dashboard-dna" type="application/json">\n${JSON.stringify(newDNA, null, 2)}\n</script>\n`;
    return html.replace('</head>', `${dnaBlock}</head>`);
  }

  // Update existing DNA
  const dna = JSON.parse(match[1]);

  // Increment version (minor bump)
  const [major, minor, patch] = dna.version.split('.').map(Number);
  dna.version = `${major}.${minor + 1}.${patch}`;

  // Update timestamp
  dna.last_updated = new Date().toISOString();

  // Add to changelog
  if (!dna.changelog) dna.changelog = [];
  dna.changelog.unshift({
    date: new Date().toISOString().split('T')[0],
    version: dna.version,
    changes: mergedFeatures.map(f => `Merged ${f.name} (${f.id})`),
    author: "Dashboard Factory"
  });

  // Add to installed_features
  if (!dna.installed_features) dna.installed_features = [];
  for (const feature of mergedFeatures) {
    if (!dna.installed_features.includes(feature.id)) {
      dna.installed_features.push(feature.id);
    }
  }

  const updatedDNA = `<script id="dashboard-dna" type="application/json">\n${JSON.stringify(dna, null, 2)}\n</script>`;
  return html.replace(match[0], updatedDNA);
}
