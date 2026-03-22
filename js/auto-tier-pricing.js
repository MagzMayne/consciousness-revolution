// RootIB: RB-20260322000000-AUTOTP01
/**
 * ════════════════════════════════════════════════════════════════════════
 * auto-tier-pricing.js — Live Tier Price & Profit-Share Display
 * Barbrick Design · BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════
 *
 * Fetches /api/tier-pricing-engine and:
 *   1. Updates tier prices on consciousness-revolution-hub.html
 *   2. Updates tier prices on contributor-registration-enhanced.html
 *   3. Renders a "Platform Economy" stats panel (hub page only)
 *   4. Shows per-tier monthly earnings estimates and ROI badges
 *
 * Degrades gracefully — static prices remain if the fetch fails.
 *
 * Usage (added automatically by inject scripts):
 *   <script src="/js/auto-tier-pricing.js" defer></script>
 */

(function AutoTierPricing() {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────

  const API_URL   = '/api/tier-pricing-engine';
  const CACHE_KEY = 'cr_tier_pricing_v2';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Maps tier-key → element IDs / selectors used on each page
  const HUB_SELECTORS = {
    builder:   '[data-tier-key="builder"]',
    automator: '[data-tier-key="automator"]',
    engineer:  '[data-tier-key="engineer"]',
    coredev:   '[data-tier-key="coredev"]',
    explorer:  '[data-tier-key="explorer"]',
  };

  // Matches the IDs already present on contributor-registration-enhanced.html
  const REG_PRICE_IDS = {
    builder:   'bronze-price',
    automator: 'silver-price',
    engineer:  'gold-price',
    coredev:   'platinum-price',
  };

  const REG_DISCOUNT_IDS = {
    builder:   'bronze-discount',
    automator: 'silver-discount',
    engineer:  'gold-discount',
    coredev:   'platinum-discount',
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  function fmtUSD(num) {
    return '$' + Number(num).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function fmtUSDDecimal(num) {
    return '$' + Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  function loadCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed._ts > CACHE_TTL) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }

  function saveCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ _ts: Date.now(), data }));
    } catch { /* ignore */ }
  }

  async function fetchPricingData() {
    const cached = loadCache();
    if (cached) return cached;

    const resp = await fetch(API_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.ok) throw new Error(data.error || 'Engine error');
    saveCache(data);
    return data;
  }

  // ── Hub page — update tier cards ──────────────────────────────────────────

  function updateHubPrices(data) {
    const allTiers = { ...data.tiers, explorer: data.explorer };

    for (const [key, tierData] of Object.entries(allTiers)) {
      const card = document.querySelector(HUB_SELECTORS[key]);
      if (!card) continue;

      // Update price display
      const priceEl = card.querySelector('.tier-price');
      if (priceEl) {
        if (tierData.adjustedPriceUSD === 0) {
          priceEl.textContent = 'Free';
        } else {
          // Clear and rebuild to avoid XSS
          priceEl.textContent = '';
          const priceText = document.createTextNode(fmtUSD(tierData.adjustedPriceUSD));
          const small = document.createElement('small');
          small.textContent = '/mo';
          priceEl.appendChild(priceText);
          priceEl.appendChild(small);
        }
        // Add live-price indicator dot
        if (!priceEl.querySelector('.live-price-dot')) {
          const dot = document.createElement('span');
          dot.className = 'live-price-dot';
          dot.title = 'Price auto-adjusts with platform growth';
          priceEl.appendChild(dot);
        }
      }

      // Inject or update earnings-estimate row
      let earnEl = card.querySelector('.tier-earnings-est');
      if (!earnEl) {
        earnEl = document.createElement('div');
        earnEl.className = 'tier-earnings-est';
        // Insert after .tier-share
        const shareEl = card.querySelector('.tier-share');
        if (shareEl) {
          shareEl.insertAdjacentElement('afterend', earnEl);
        } else {
          card.appendChild(earnEl);
        }
      }

      const est  = tierData.monthlyEarningsEstimate ?? 0;
      const roi  = tierData.roi;

      if (tierData.adjustedPriceUSD === 0) {
        earnEl.textContent = `~${fmtUSDDecimal(est)}/mo est. earnings`;
      } else if (roi !== null) {
        const roiText = roi >= 1 ? `${roi.toFixed(1)}× ROI` : 'Growing ROI';
        earnEl.textContent = `~${fmtUSDDecimal(est)}/mo est. · ${roiText}`;
      } else {
        earnEl.textContent = `~${fmtUSDDecimal(est)}/mo est.`;
      }
    }
  }

  // ── Hub page — Platform Economy stats panel ───────────────────────────────

  function renderEconomyPanel(data) {
    const tierSection = document.querySelector('.tier-grid');
    if (!tierSection || document.getElementById('platform-economy-panel')) return;

    const m = data.metrics;

    const panel = document.createElement('div');
    panel.id = 'platform-economy-panel';
    panel.className = 'platform-economy-panel';
    panel.setAttribute('aria-label', 'Platform Economy Stats');

    const title = document.createElement('h3');
    title.className = 'economy-panel-title';
    title.textContent = '📊 Platform Economy — Live';
    panel.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'economy-stats-grid';

    const stats = [
      { label: 'Portfolio Value',    value: fmtUSD(m.totalProjectValue),          icon: '💼' },
      { label: 'Projects',           value: (m.totalProjects || '—').toLocaleString(), icon: '📁' },
      { label: 'Devs on Mesh',       value: m.totalDevs,                           icon: '👥' },
      { label: 'Active Now',         value: m.activeDevs,                          icon: '🟢' },
      { label: 'Monthly Reward Pool',value: fmtUSD(m.monthlyRewardPool),           icon: '💰' },
      { label: 'Price Factor',       value: `${(m.adjustmentFactor * 100).toFixed(0)}%`, icon: '⚙️' },
    ];

    for (const s of stats) {
      const stat = document.createElement('div');
      stat.className = 'economy-stat';

      const icon = document.createElement('span');
      icon.className = 'economy-stat-icon';
      icon.textContent = s.icon;

      const val = document.createElement('div');
      val.className = 'economy-stat-value';
      val.textContent = s.value;

      const lbl = document.createElement('div');
      lbl.className = 'economy-stat-label';
      lbl.textContent = s.label;

      stat.appendChild(icon);
      stat.appendChild(val);
      stat.appendChild(lbl);
      grid.appendChild(stat);
    }

    panel.appendChild(grid);

    const note = document.createElement('p');
    note.className = 'economy-panel-note';
    note.textContent =
      'Prices auto-adjust based on portfolio value & developer count. ' +
      'Earnings estimates reflect your share of the monthly reward pool. ' +
      'Higher tiers earn a larger multiplied share.';
    panel.appendChild(note);

    // Insert before tier grid
    tierSection.insertAdjacentElement('beforebegin', panel);
  }

  // ── Registration page — update price IDs ─────────────────────────────────

  function updateRegistrationPrices(data) {
    for (const [key, idFull] of Object.entries(REG_PRICE_IDS)) {
      const tierData = data.tiers[key];
      if (!tierData) continue;

      const fullEl = document.getElementById(idFull);
      if (fullEl) fullEl.textContent = fmtUSD(tierData.adjustedPriceUSD);

      const discountEl = document.getElementById(REG_DISCOUNT_IDS[key]);
      if (discountEl) discountEl.textContent = fmtUSD(tierData.discountedPriceUSD);
    }

    // Keep TIER_PRICES in sync if the registration page defines it
    if (window._syncTierPrices && typeof window._syncTierPrices === 'function') {
      window._syncTierPrices(data.tiers);
    }
  }

  // ── Registration page — patch internal TIER_PRICES constant ──────────────
  //
  // contributor-registration-enhanced.html stores base prices in a local
  // object used for PayPal amount calculation.  We expose a hook so the page
  // can update those prices after the engine responds.
  //
  function patchRegistrationTierMap(data) {
    // The registration page uses TIER_MAP in its own closure; we cannot reach
    // it directly, but we expose the new prices on window so the page can
    // read them at payment time if it wishes.
    window.CR_LIVE_TIER_PRICES = {};
    for (const [key, tierData] of Object.entries(data.tiers)) {
      window.CR_LIVE_TIER_PRICES[tierData.hubAlias] = {
        full:       tierData.adjustedPriceUSD,
        discounted: tierData.discountedPriceUSD,
      };
    }
  }

  // ── Inject CSS for new elements (hub page) ────────────────────────────────

  function injectStyles() {
    if (document.getElementById('auto-tier-pricing-css')) return;
    const style = document.createElement('style');
    style.id = 'auto-tier-pricing-css';
    style.textContent = `
      /* Live-price pulsing indicator dot */
      .live-price-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #39ff14;
        margin-left: 5px;
        vertical-align: super;
        animation: live-pulse 2s ease-in-out infinite;
      }
      @keyframes live-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.3; transform: scale(0.7); }
      }

      /* Earnings estimate row inside tier card */
      .tier-earnings-est {
        font-size: 0.72rem;
        opacity: 0.75;
        margin: 4px 0 6px;
        color: inherit;
        letter-spacing: 0.01em;
      }

      /* Platform Economy panel — above tier grid */
      .platform-economy-panel {
        background: rgba(0,0,0,0.45);
        border: 1px solid rgba(0,245,255,0.25);
        border-radius: 12px;
        padding: 18px 22px 14px;
        margin-bottom: 22px;
        backdrop-filter: blur(6px);
      }
      .economy-panel-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: #00f5ff;
        margin: 0 0 14px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .economy-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 10px 14px;
      }
      .economy-stat {
        text-align: center;
        padding: 10px 8px;
        background: rgba(255,255,255,0.04);
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.08);
      }
      .economy-stat-icon { font-size: 1.3rem; display: block; margin-bottom: 4px; }
      .economy-stat-value {
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
        line-height: 1.2;
      }
      .economy-stat-label {
        font-size: 0.68rem;
        opacity: 0.6;
        margin-top: 3px;
        letter-spacing: 0.02em;
      }
      .economy-panel-note {
        font-size: 0.72rem;
        opacity: 0.55;
        margin: 12px 0 0;
        line-height: 1.5;
        border-top: 1px solid rgba(255,255,255,0.08);
        padding-top: 10px;
      }

      /* Profit-share info box (hub page) */
      .profit-share-box {
        background: rgba(57,255,20,0.06);
        border: 1px solid rgba(57,255,20,0.25);
        border-radius: 10px;
        padding: 14px 18px;
        margin-top: 18px;
        font-size: 0.82rem;
        line-height: 1.6;
        color: rgba(255,255,255,0.8);
      }
      .profit-share-box strong { color: #39ff14; }

      @media (max-width: 480px) {
        .economy-stats-grid { grid-template-columns: repeat(2, 1fr); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Profit-share info box (hub page) ──────────────────────────────────────

  function renderProfitShareBox(data) {
    const tierGrid = document.querySelector('.tier-grid');
    if (!tierGrid || document.getElementById('profit-share-box')) return;

    const m = data.metrics;
    const pool = fmtUSD(m.monthlyRewardPool);

    const box = document.createElement('div');
    box.id = 'profit-share-box';
    box.className = 'profit-share-box';
    box.setAttribute('role', 'note');

    // Build content safely (no innerHTML with user data)
    const heading = document.createElement('strong');
    heading.textContent = '💰 How Profit Share Works';
    box.appendChild(heading);
    box.appendChild(document.createElement('br'));

    const lines = [
      `The platform distributes ${pool}/mo (est.) from project licensing, compute rewards, ` +
        'and membership fees through the reward pool.',
      'Your tier multiplier determines your weighted share of that pool. ' +
        'Higher tiers claim a proportionally larger slice.',
      'Profit share is on top of task bounties, compute rewards, and grant revenue.',
      'All memberships keep the automated tools alive — no dev is ever left without tools.',
    ];

    lines.forEach((line, i) => {
      const p = document.createElement('p');
      p.style.margin = i === 0 ? '6px 0 4px' : '4px 0';
      p.textContent = line;
      box.appendChild(p);
    });

    // Profit-share multiplier summary
    const table = document.createElement('div');
    table.style.cssText = 'margin-top:10px; display:flex; flex-wrap:wrap; gap:8px;';

    const allTiers = [
      { label: 'Explorer', mult: '1×', color: '#39ff14' },
      { label: 'Builder',  mult: '1.5×', color: '#cd7f32' },
      { label: 'Automator',mult: '2×',   color: '#c0c0c0' },
      { label: 'Engineer', mult: '3×',   color: '#ffd700' },
      { label: 'Core Dev', mult: '5×',   color: '#00f5ff' },
    ];

    for (const t of allTiers) {
      const chip = document.createElement('span');
      chip.style.cssText =
        `display:inline-block; padding:3px 10px; border-radius:20px; ` +
        `background:rgba(255,255,255,0.06); border:1px solid ${t.color}40; ` +
        `font-size:0.78rem; color:${t.color};`;
      chip.textContent = `${t.label} ${t.mult} share`;
      table.appendChild(chip);
    }
    box.appendChild(table);

    // Insert after tier-grid
    tierGrid.insertAdjacentElement('afterend', box);
  }

  // ── Detect page and apply updates ─────────────────────────────────────────

  function isHubPage() {
    return !!document.querySelector('.tier-grid');
  }

  function isRegistrationPage() {
    return !!document.getElementById('bronze-price');
  }

  async function run() {
    injectStyles();

    let data;
    try {
      data = await fetchPricingData();
    } catch (err) {
      console.warn('[AutoTierPricing] Could not fetch pricing data:', err.message);
      return; // degrade gracefully — static prices remain
    }

    if (isHubPage()) {
      updateHubPrices(data);
      renderEconomyPanel(data);
      renderProfitShareBox(data);
    }

    if (isRegistrationPage()) {
      updateRegistrationPrices(data);
      patchRegistrationTierMap(data);
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
