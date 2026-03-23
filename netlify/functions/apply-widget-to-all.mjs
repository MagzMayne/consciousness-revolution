/**
 * apply-widget-to-all.mjs - Dashboard Factory Auto-Propagation
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL; // https://iadptixzmckbetwpoycq.supabase.co
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
      feature_id,
      target_dashboards = ['OPERATOR_COCKPIT_*.html'], // Default to all operator cockpits
      strategy = 'smart',
      preview_only = false,
      commit_to_git = true,
      skip_version_check = false
    } = JSON.parse(event.body || '{}');

    if (!feature_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameter: feature_id' })
      };
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 1: VERIFY - Is this widget Foundational?
    // ════════════════════════════════════════════════════════════════════════
    const { data: widget, error: widgetError } = await supabase
      .from('widget_governance')
      .select('*')
      .eq('feature_id', feature_id)
      .maybeSingle();

    if (widgetError) {
      console.warn('Widget governance table not found - skipping governance check');
    } else if (!widget) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Widget ${feature_id} not found in governance system` })
      };
    } else if (widget.stage !== 'foundational') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: 'Only Foundational widgets can be auto-applied',
          current_stage: widget.stage,
          hint: 'Widget must reach "foundational" stage via team voting'
        })
      };
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 2: LOAD - Feature Registry
    // ════════════════════════════════════════════════════════════════════════
    const registryPath = path.join(process.cwd(), 'DASHBOARD_FEATURES_REGISTRY.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const feature = registry.features.find(f => f.id === feature_id);

    if (!feature) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Feature ${feature_id} not found in registry` })
      };
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 3: EXTRACT - Feature code from source dashboard
    // ════════════════════════════════════════════════════════════════════════
    const sourceDashboard = feature.installations[0]?.dashboard;
    if (!sourceDashboard) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Feature has no source installation' })
      };
    }

    const sourcePath = path.join(process.cwd(), sourceDashboard);
    const sourceHTML = fs.readFileSync(sourcePath, 'utf8');
    const featureCode = extractFeatureCode(sourceHTML, feature);

    if (!featureCode) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Could not extract feature code from ${sourceDashboard}` })
      };
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 4: FIND - Target dashboards (glob matching)
    // ════════════════════════════════════════════════════════════════════════
    const allFiles = fs.readdirSync(process.cwd());
    const dashboards = allFiles.filter(file => {
      return target_dashboards.some(pattern => {
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        return regex.test(file);
      });
    });

    if (dashboards.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No matching dashboards found', patterns: target_dashboards })
      };
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 5: MERGE - Into each target dashboard
    // ════════════════════════════════════════════════════════════════════════
    const results = [];

    for (const dashboard of dashboards) {
      const dashboardPath = path.join(process.cwd(), dashboard);

      // Check if file exists
      if (!fs.existsSync(dashboardPath)) {
        results.push({ dashboard, status: 'error', reason: 'file_not_found' });
        continue;
      }

      // Check current installation
      const { data: installed } = await supabase
        .from('dashboard_features')
        .select('*')
        .eq('dashboard_name', dashboard)
        .eq('feature_id', feature_id)
        .maybeSingle();

      // Skip if already at latest version
      if (!skip_version_check && installed && installed.feature_version === feature.version) {
        results.push({
          dashboard,
          status: 'skipped',
          reason: 'already_latest_version',
          current_version: installed.feature_version
        });
        continue;
      }

      // Detect version conflict
      const versionChange = installed
        ? `${installed.feature_version} → ${feature.version}`
        : `NEW → ${feature.version}`;

      // Load target HTML
      const targetHTML = fs.readFileSync(dashboardPath, 'utf8');

      // Merge feature
      const mergeResult = injectFeature(targetHTML, {
        id: feature.id,
        name: feature.name,
        code: featureCode,
        category: feature.category,
        dependencies: feature.dependencies?.scripts || []
      }, strategy);

      // Preview mode: Don't save
      if (preview_only) {
        results.push({
          dashboard,
          status: 'preview',
          version_change: versionChange,
          injection_point: mergeResult.injection_point,
          preview_html: mergeResult.html.substring(0, 500) + '...'
        });
        continue;
      }

      // Save merged HTML
      fs.writeFileSync(dashboardPath, mergeResult.html, 'utf8');

      // Update database
      await supabase.from('dashboard_features').upsert({
        dashboard_name: dashboard,
        feature_id: feature_id,
        feature_version: feature.version,
        installed_by: 'Commander',
        installation_type: 'auto'
      });

      results.push({
        dashboard,
        status: 'success',
        version_change: versionChange,
        injection_point: mergeResult.injection_point
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 6: GIT COMMIT (if enabled and not preview)
    // ════════════════════════════════════════════════════════════════════════
    let gitCommit = null;
    if (commit_to_git && !preview_only) {
      try {
        execSync('git add .', { cwd: process.cwd() });
        const commitMsg = `Dashboard Factory: Applied ${feature_id} v${feature.version} to ${results.filter(r => r.status === 'success').length} dashboards\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`;
        execSync(`git commit -m "${commitMsg}"`, { cwd: process.cwd() });
        gitCommit = execSync('git rev-parse HEAD', { cwd: process.cwd() }).toString().trim();
      } catch (e) {
        console.error('Git commit failed:', e.message);
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 7: RESPONSE
    // ════════════════════════════════════════════════════════════════════════
    const successCount = results.filter(r => r.status === 'success').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        preview_mode: preview_only,
        feature_id: feature_id,
        feature_version: feature.version,
        dashboards_updated: successCount,
        dashboards_skipped: skippedCount,
        dashboards_failed: errorCount,
        total_dashboards: dashboards.length,
        git_commit: gitCommit,
        deployed_at: new Date().toISOString(),
        propagation_log: results
      })
    };

  } catch (error) {
    console.error('Apply widget error:', error);
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

// ════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════

function extractFeatureCode(html, feature) {
  // Look for <!-- FEATURE: id --> ... <!-- /FEATURE -->
  const regex = new RegExp(
    `<!-- FEATURE: ${feature.id} -->([\\s\\S]*?)<!-- \\/FEATURE -->`,
    'i'
  );
  const match = html.match(regex);
  return match ? match[0] : null;
}

function injectFeature(html, feature, strategy) {
  // Check if feature already exists
  if (html.includes(`<!-- FEATURE: ${feature.id} -->`)) {
    // Replace existing feature
    const regex = new RegExp(
      `<!-- FEATURE: ${feature.id} -->([\\s\\S]*?)<!-- \\/FEATURE -->`,
      'i'
    );
    return {
      html: html.replace(regex, feature.code),
      injection_point: 'replaced_existing',
      strategy: 'replace',
      success: true
    };
  }

  // Inject new feature
  if (strategy === 'smart') {
    // Try to insert after similar category widget
    const categoryRegex = new RegExp(
      `<!-- CATEGORY: ${feature.category} -->([\\s\\S]*?)<!-- \\/FEATURE -->`,
      'i'
    );
    const match = html.match(categoryRegex);
    if (match) {
      return {
        html: html.replace(match[0], `${match[0]}\n${feature.code}`),
        injection_point: `after_${feature.category}_widget`,
        strategy: 'smart',
        success: true
      };
    }
  }

  // Default: append before </body>
  return {
    html: html.replace('</body>', `\n${feature.code}\n</body>`),
    injection_point: 'before_body_close',
    strategy: 'append',
    success: true
  };
}
