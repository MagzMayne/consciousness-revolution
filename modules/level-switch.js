/**
 * LEVEL SWITCH MODULE
 * Triple App Architecture (1-2-3 Levels)
 *
 * Level 1: Customer - Simple, guided experience
 * Level 2: Business - Dashboard, team, analytics
 * Level 3: Hacker - Full access, CLI, raw API
 *
 * Location: 100X_DEPLOYMENT/modules/
 * Created: 2026-02-08
 * Connects: ARCHITECTURE_GUIDELINES_DNA.md
 */

export const LEVELS = {
  CUSTOMER: 1,
  BUSINESS: 2,
  HACKER: 3
};

export const LEVEL_CONFIG = {
  1: {
    name: 'customer',
    displayName: 'Customer',
    features: ['basic_ui', 'guided_flow', 'one_click', 'mobile_first'],
    locked: ['analytics', 'team_management', 'api_access', 'cli', 'system_internals'],
    theme: 'simple'
  },
  2: {
    name: 'business',
    displayName: 'Business',
    features: ['dashboard', 'team_management', 'analytics', 'config_panels', 'billing', 'white_label'],
    locked: ['raw_api', 'cli', 'system_internals', 'database_access'],
    theme: 'professional'
  },
  3: {
    name: 'hacker',
    displayName: 'Hacker Mode',
    features: ['*'], // Everything unlocked
    locked: [],
    theme: 'terminal'
  }
};

// Storage key
const LEVEL_STORAGE_KEY = 'overkill_app_level';

/**
 * Get current app level
 */
export function getCurrentLevel() {
  try {
    const stored = localStorage.getItem(LEVEL_STORAGE_KEY);
    const level = stored ? parseInt(stored, 10) : LEVELS.CUSTOMER;
    return Math.min(Math.max(level, 1), 3); // Clamp 1-3
  } catch {
    return LEVELS.CUSTOMER;
  }
}

/**
 * Set app level
 */
export function setLevel(level) {
  const validLevel = Math.min(Math.max(level, 1), 3);
  localStorage.setItem(LEVEL_STORAGE_KEY, validLevel.toString());

  // Dispatch event for reactive updates
  window.dispatchEvent(new CustomEvent('level-change', {
    detail: {
      level: validLevel,
      config: LEVEL_CONFIG[validLevel]
    }
  }));

  // Update body class for CSS targeting
  document.body.classList.remove('level-1', 'level-2', 'level-3');
  document.body.classList.add(`level-${validLevel}`);

  return validLevel;
}

/**
 * Check if a feature is available at current level
 */
export function hasFeature(featureName) {
  const level = getCurrentLevel();
  const config = LEVEL_CONFIG[level];

  if (config.features.includes('*')) return true;
  if (config.locked.includes(featureName)) return false;
  return config.features.includes(featureName);
}

/**
 * Check if current level is at least the specified level
 */
export function isAtLeast(requiredLevel) {
  return getCurrentLevel() >= requiredLevel;
}

/**
 * Upgrade to next level
 */
export function upgradeLevel() {
  const current = getCurrentLevel();
  if (current < 3) {
    return setLevel(current + 1);
  }
  return current;
}

/**
 * Downgrade to previous level
 */
export function downgradeLevel() {
  const current = getCurrentLevel();
  if (current > 1) {
    return setLevel(current - 1);
  }
  return current;
}

/**
 * Toggle hacker mode (secret combo: Ctrl+Shift+H)
 */
export function initHackerModeToggle() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      const current = getCurrentLevel();
      if (current === 3) {
        setLevel(1); // Exit hacker mode
      } else {
        setLevel(3); // Enter hacker mode
      }
    }
  });
}

/**
 * Level Switch Web Component
 */
export class LevelSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();

    // Listen for external level changes
    window.addEventListener('level-change', () => this.render());
  }

  render() {
    const currentLevel = getCurrentLevel();
    const config = LEVEL_CONFIG[currentLevel];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: var(--ok-font-body, 'Exo 2', sans-serif);
        }
        .level-switch {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--ok-surface, #1a1a1a);
          border-radius: 8px;
          border: 1px solid var(--ok-border, #333);
        }
        .level-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: var(--ok-text-muted, #888);
          cursor: pointer;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }
        .level-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .level-btn.active {
          background: var(--ok-cyan, #00fff2);
          color: black;
          font-weight: 600;
        }
        .level-btn[data-level="3"].active {
          background: var(--ok-red, #ff0040);
          color: white;
        }
      </style>
      <div class="level-switch">
        <button class="level-btn ${currentLevel === 1 ? 'active' : ''}" data-level="1">Customer</button>
        <button class="level-btn ${currentLevel === 2 ? 'active' : ''}" data-level="2">Business</button>
        <button class="level-btn ${currentLevel === 3 ? 'active' : ''}" data-level="3">Hacker</button>
      </div>
    `;
  }

  setupListeners() {
    this.shadowRoot.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level, 10);
        setLevel(level);
      });
    });
  }
}

// Register custom element
if (!customElements.get('level-switch')) {
  customElements.define('level-switch', LevelSwitch);
}

// Initialize on load
if (typeof window !== 'undefined') {
  // Set initial body class
  document.body.classList.add(`level-${getCurrentLevel()}`);
  // Enable hacker mode toggle
  initHackerModeToggle();
}

export default {
  LEVELS,
  LEVEL_CONFIG,
  getCurrentLevel,
  setLevel,
  hasFeature,
  isAtLeast,
  upgradeLevel,
  downgradeLevel,
  initHackerModeToggle,
  LevelSwitch
};
