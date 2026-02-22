/**
 * dashboard-diff.mjs - Dashboard Factory
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Dashboard Diff Tool - Compare features between two dashboards
// Returns: Features unique to dashboard1, unique to dashboard2, shared features

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
    const { dashboard1, dashboard2 } = JSON.parse(event.body || '{}');

    if (!dashboard1 || !dashboard2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required params: dashboard1, dashboard2'
        })
      };
    }

    // Load feature registry from project root (Netlify deploys entire project)
    const registryPath = path.join(process.cwd(), 'DASHBOARD_FEATURES_REGISTRY.json');
    const registryData = fs.readFileSync(registryPath, 'utf8');
    const registry = JSON.parse(registryData);

    // Extract features for each dashboard
    const dash1Features = extractDashboardFeatures(dashboard1, registry);
    const dash2Features = extractDashboardFeatures(dashboard2, registry);

    // Compare versions
    const comparison = compareDashboards(dash1Features, dash2Features, registry);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        dashboard1: dashboard1,
        dashboard2: dashboard2,
        comparison: comparison,
        stats: {
          dashboard1_features: dash1Features.length,
          dashboard2_features: dash2Features.length,
          unique_to_dashboard1: comparison.ahead.length,
          unique_to_dashboard2: comparison.behind.length,
          shared: comparison.shared.length
        }
      })
    };

  } catch (error) {
    console.error('Dashboard diff error:', error);
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

// Extract features installed on a specific dashboard
function extractDashboardFeatures(dashboardName, registry) {
  const installedFeatures = [];

  for (const feature of registry.features) {
    const installation = feature.installations.find(
      inst => inst.dashboard === dashboardName
    );

    if (installation) {
      installedFeatures.push({
        id: feature.id,
        name: feature.name,
        version: installation.version,
        installed_date: installation.installed_date,
        category: feature.category,
        author: feature.author,
        lfsme_avg: feature.lfsme_impact.average
      });
    }
  }

  return installedFeatures;
}

// Compare two dashboards and identify differences
function compareDashboards(dash1Features, dash2Features, registry) {
  const dash1IDs = new Set(dash1Features.map(f => f.id));
  const dash2IDs = new Set(dash2Features.map(f => f.id));

  // Features unique to dashboard1 (dashboard1 is ahead)
  const ahead = dash1Features.filter(f => !dash2IDs.has(f.id));

  // Features unique to dashboard2 (dashboard1 is behind)
  const behind = dash2Features.filter(f => !dash1IDs.has(f.id));

  // Shared features (check for version differences)
  const shared = [];
  const versionDifferences = [];

  for (const feat1 of dash1Features) {
    const feat2 = dash2Features.find(f => f.id === feat1.id);
    if (feat2) {
      shared.push({
        id: feat1.id,
        name: feat1.name,
        dashboard1_version: feat1.version,
        dashboard2_version: feat2.version,
        version_match: feat1.version === feat2.version
      });

      if (feat1.version !== feat2.version) {
        versionDifferences.push({
          id: feat1.id,
          name: feat1.name,
          dashboard1_version: feat1.version,
          dashboard2_version: feat2.version,
          version_comparison: compareVersions(feat1.version, feat2.version)
        });
      }
    }
  }

  return {
    ahead: ahead,           // Features dashboard1 has that dashboard2 doesn't
    behind: behind,         // Features dashboard2 has that dashboard1 doesn't
    shared: shared,         // Features both have (with version info)
    version_differences: versionDifferences
  };
}

// Compare semantic versions (e.g., "2.1.0" vs "2.0.0")
function compareVersions(v1, v2) {
  const [major1, minor1, patch1] = v1.split('.').map(Number);
  const [major2, minor2, patch2] = v2.split('.').map(Number);

  if (major1 !== major2) return major1 > major2 ? 'newer' : 'older';
  if (minor1 !== minor2) return minor1 > minor2 ? 'newer' : 'older';
  if (patch1 !== patch2) return patch1 > patch2 ? 'newer' : 'older';
  return 'same';
}
