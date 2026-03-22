/**
 * Tier Pricing Engine — Netlify Function
 * ═══════════════════════════════════════
 * Auto-adjusts membership tier prices based on live platform metrics:
 *   • Project portfolio value  (from /projects.json)
 *   • Active developer count   (from Netlify Blobs mesh-nodes store)
 *   • Reward-pool math         (portfolio yield + membership revenue)
 *
 * GET /api/tier-pricing-engine
 *
 * Response JSON:
 * {
 *   ok: true,
 *   metrics: { totalProjectValue, totalProjects, totalDevs, activeDevs,
 *               monthlyRewardPool, perShareValue, adjustmentFactor },
 *   tiers: {
 *     builder:   { adjustedPriceUSD, monthlyEarningsEstimate, roi, ... },
 *     automator: { ... },
 *     engineer:  { ... },
 *     coredev:   { ... }
 *   },
 *   explorer: { monthlyEarningsEstimate, ... },
 *   lastUpdated: ISO string
 * }
 *
 * Author: Barbrick Design — BarbrickDesign@gmail.com
 */

import { getStore } from '@netlify/blobs';

// ── CORS ────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

function jsonOk(data) {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: true, ...data }),
  };
}

function jsonErr(message, status = 500) {
  return {
    statusCode: status,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: false, error: String(message) }),
  };
}

/** Student discount applied to all paid tier prices (50 %) */
const STUDENT_DISCOUNT_RATE = 0.5;

// ── Tier definitions ────────────────────────────────────────────────────────

/**
 * Base tier config.  rewardPoolShare is this tier's fraction of the reward pool
 * before the multiplier is applied (the multiplier scales each member's slice).
 */
const BASE_TIERS = {
  builder:   { basePriceUSD: 50,   multiplier: 1.5, label: 'Builder',   hubAlias: 'bronze' },
  automator: { basePriceUSD: 200,  multiplier: 2.0, label: 'Automator', hubAlias: 'silver' },
  engineer:  { basePriceUSD: 500,  multiplier: 3.0, label: 'Engineer',  hubAlias: 'gold'   },
  coredev:   { basePriceUSD: 1500, multiplier: 5.0, label: 'Core Dev',  hubAlias: 'platinum' },
};

/**
 * Assumed tier distribution as a fraction of total developers.
 * Used to compute total weighted shares in the reward pool.
 */
const TIER_DISTRIBUTION = {
  explorer:  0.50,
  builder:   0.25,
  automator: 0.13,
  engineer:  0.08,
  coredev:   0.04,
};

const MULTIPLIERS = { explorer: 1.0, builder: 1.5, automator: 2.0, engineer: 3.0, coredev: 5.0 };

/** Node is considered online if last heartbeat was < 45 s ago */
const ONLINE_THRESHOLD_MS = 45_000;

/** Minimum effective dev count to prevent per-share rewards from spiking */
const MIN_EFFECTIVE_DEVS = 10;

/** Monthly platform yield: 0.1 % of portfolio value per month (1.2 % annual) */
const PORTFOLIO_YIELD_RATE = 0.001;

/** Fraction of membership revenue that flows into the reward pool */
const REWARD_POOL_RATIO = 0.30;

/** Fraction of devs assumed to be on a paid tier */
const PAID_DEV_FRACTION = 0.25;

// ── Main handler ─────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return jsonErr('Method not allowed', 405);
  }

  try {
    // ── 1. Fetch portfolio metrics from projects.json ──────────────────────
    let totalProjectValue = 0;
    let totalProjects = 0;

    try {
      const siteUrl = process.env.URL || 'https://consciousnessrevolution.io';
      const resp = await fetch(`${siteUrl}/projects.json`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });
      if (resp.ok) {
        const projectsData = await resp.json();
        totalProjectValue = projectsData.meta?.total_value       ?? 0;
        totalProjects     = projectsData.meta?.total_projects     ?? 0;
      }
    } catch {
      // Fallback: use a conservative baseline so the engine still runs
      totalProjectValue = 1_000_000;
      totalProjects     = 300;
    }

    // ── 2. Get dev count from mesh-nodes Blobs ─────────────────────────────
    let totalDevs  = 0;
    let activeDevs = 0;

    try {
      const nodesStore = getStore('mesh-nodes');
      const listing    = await nodesStore.list();
      const now        = Date.now();
      totalDevs = listing.blobs.length;

      for (const entry of listing.blobs) {
        const node = await nodesStore.get(entry.key, { type: 'json' });
        if (node && now - new Date(node.lastSeen ?? 0).getTime() < ONLINE_THRESHOLD_MS) {
          activeDevs++;
        }
      }
    } catch {
      // Blobs unavailable — proceed with zeroes; formulas handle this
      totalDevs  = 0;
      activeDevs = 0;
    }

    // ── 3. Price adjustment factor ─────────────────────────────────────────
    //
    // portfolio_score ∈ [-0.5, +0.5]:  neutral at $1 M, rises with portfolio
    // dev_score       ∈ [-0.2, +0.2]:  neutral at 10 devs, rises with growth
    //
    // combined factor ∈ [0.8, 1.5] so base prices stay within ±30 %
    //
    const portfolioScore = Math.min(0.5, Math.max(-0.5,
      Math.log10(Math.max(totalProjectValue, 10_000) / 1_000_000),
    ));
    const devScore = Math.min(0.2, Math.max(-0.2,
      (totalDevs - 10) / 50,
    ));
    const adjustmentFactor = Math.min(1.5, Math.max(0.8,
      1.0 + portfolioScore * 0.3 + devScore * 0.1,
    ));

    // ── 4. Monthly reward pool ─────────────────────────────────────────────
    const portfolioYieldMonthly = totalProjectValue * PORTFOLIO_YIELD_RATE;

    const avgTierPrice = Object.values(BASE_TIERS)
      .reduce((s, t) => s + t.basePriceUSD, 0) / Object.keys(BASE_TIERS).length;

    const estimatedPaidDevs          = Math.max(totalDevs * PAID_DEV_FRACTION, 1);
    const estimatedMembershipRevenue = estimatedPaidDevs * avgTierPrice;
    const membershipRewardPool       = estimatedMembershipRevenue * REWARD_POOL_RATIO;

    const monthlyRewardPool = portfolioYieldMonthly + membershipRewardPool;

    // ── 5. Per-share monthly value ─────────────────────────────────────────
    //
    // Use effectiveDevs ≥ MIN_EFFECTIVE_DEVS so the per-share value stays
    // reasonable even when the mesh has very few registered nodes.
    //
    const effectiveDevs = Math.max(totalDevs, MIN_EFFECTIVE_DEVS);

    const totalWeightedShares = Object.entries(TIER_DISTRIBUTION).reduce(
      (sum, [tier, fraction]) => {
        const count      = Math.max(1, Math.round(effectiveDevs * fraction));
        const multiplier = MULTIPLIERS[tier] ?? 1.0;
        return sum + count * multiplier;
      },
      0,
    );

    const perShareValue = monthlyRewardPool / Math.max(totalWeightedShares, 1);

    // ── 6. Compute per-tier pricing and earnings ───────────────────────────
    const tiers = {};

    for (const [key, cfg] of Object.entries(BASE_TIERS)) {
      const rawPrice     = cfg.basePriceUSD * adjustmentFactor;
      // Snap to nearest $5 for clean display
      const adjustedPrice   = Math.round(rawPrice / 5) * 5;
      const discountedPrice = Math.round((adjustedPrice * STUDENT_DISCOUNT_RATE) / 5) * 5;

      const monthlyEarnings = perShareValue * cfg.multiplier;
      const roi             = adjustedPrice > 0 ? monthlyEarnings / adjustedPrice : null;

      tiers[key] = {
        label:                  cfg.label,
        hubAlias:               cfg.hubAlias,
        basePriceUSD:           cfg.basePriceUSD,
        adjustedPriceUSD:       adjustedPrice,
        discountedPriceUSD:     discountedPrice,
        multiplier:             cfg.multiplier,
        monthlyEarningsEstimate: +monthlyEarnings.toFixed(2),
        roi:                    roi !== null ? +roi.toFixed(2) : null,
        valueRatio:             roi !== null ? `${roi.toFixed(1)}×` : '∞',
      };
    }

    // ── 7. Explorer (free tier) earnings estimate ──────────────────────────
    const explorerEarnings = perShareValue * MULTIPLIERS.explorer;

    return jsonOk({
      metrics: {
        totalProjectValue,
        totalProjects,
        totalDevs,
        activeDevs,
        portfolioYieldMonthly: +portfolioYieldMonthly.toFixed(2),
        monthlyRewardPool:     +monthlyRewardPool.toFixed(2),
        perShareValue:         +perShareValue.toFixed(4),
        adjustmentFactor:      +adjustmentFactor.toFixed(4),
      },
      tiers,
      explorer: {
        label:                  'Explorer',
        hubAlias:               'starter',
        adjustedPriceUSD:       0,
        multiplier:             1.0,
        monthlyEarningsEstimate: +explorerEarnings.toFixed(2),
        roi:                    null,
        valueRatio:             'Free',
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[tier-pricing-engine] Unhandled error:', err);
    return jsonErr(err.message || 'Internal error');
  }
};
