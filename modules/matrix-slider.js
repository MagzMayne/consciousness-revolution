/**
 * MATRIX SLIDER MODULE
 * 2D Architecture Control (Privacy x Complexity)
 *
 * X-AXIS: Privacy (0=Self, 1=Family, 2=Business, 3=Government)
 * Y-AXIS: Complexity (0=Simple, 1=Dashboard, 2=Conduit, 3=Orchestra)
 *
 * Location: 100X_DEPLOYMENT/modules/
 * Created: 2026-02-08
 * Connects: ARCHITECTURE_GUIDELINES_DNA.md, level-switch.js
 */

// Storage keys
const MATRIX_X_KEY = 'overkill_matrix_x'; // Privacy
const MATRIX_Y_KEY = 'overkill_matrix_y'; // Complexity

// Privacy levels (X-axis)
export const PRIVACY = {
  SELF: 0,       // Only you, local device
  FAMILY: 1,     // Trusted family members
  BUSINESS: 2,   // Team/employees
  GOVERNMENT: 3  // Public/compliance
};

// Complexity levels (Y-axis)
export const COMPLEXITY = {
  SIMPLE: 0,     // L1 - One-click, minimal UI
  DASHBOARD: 1,  // L1.5 - Charts, settings
  CONDUIT: 2,    // L2 - Multi-terminal, GitHub
  ORCHESTRA: 3   // L3 - 100 terminals, wall display
};

// Privacy level labels
export const PRIVACY_LABELS = {
  0: 'Self',
  1: 'Family',
  2: 'Business',
  3: 'Public'
};

// Complexity level labels
export const COMPLEXITY_LABELS = {
  0: 'Simple',
  1: 'Dashboard',
  2: 'Conduit',
  3: 'Orchestra'
};

// 16 Matrix positions with feature configurations
export const MATRIX_CONFIG = {
  // Row 0: Simple Mode
  '0,0': {
    name: 'Personal Simple',
    features: ['basic_ui', 'local_only', 'one_click'],
    theme: 'minimal',
    description: 'Just you, just works'
  },
  '0,1': {
    name: 'Family Simple',
    features: ['basic_ui', 'family_sync', 'one_click'],
    theme: 'minimal',
    description: 'Simple for the whole family'
  },
  '0,2': {
    name: 'Business Simple',
    features: ['basic_ui', 'team_sync', 'one_click'],
    theme: 'minimal',
    description: 'Easy team collaboration'
  },
  '0,3': {
    name: 'Public Simple',
    features: ['basic_ui', 'full_audit', 'one_click'],
    theme: 'minimal',
    description: 'Compliant simplicity'
  },

  // Row 1: Dashboard Mode
  '1,0': {
    name: 'Personal Dashboard',
    features: ['dashboard', 'analytics', 'local_only'],
    theme: 'professional',
    description: 'Your personal command center'
  },
  '1,1': {
    name: 'Family Dashboard',
    features: ['dashboard', 'analytics', 'family_sync', 'shared_views'],
    theme: 'professional',
    description: 'Family mission control'
  },
  '1,2': {
    name: 'Business Dashboard',
    features: ['dashboard', 'analytics', 'team_sync', 'permissions', 'billing'],
    theme: 'professional',
    description: 'Full business intelligence'
  },
  '1,3': {
    name: 'Public Dashboard',
    features: ['dashboard', 'analytics', 'compliance', 'audit_trail'],
    theme: 'professional',
    description: 'Transparent operations'
  },

  // Row 2: Conduit Mode (Multi-terminal)
  '2,0': {
    name: 'Personal Conduit',
    features: ['multi_terminal', 'github', 'local_only', 'cli'],
    theme: 'terminal',
    description: 'Your private terminal army'
  },
  '2,1': {
    name: 'Family Conduit',
    features: ['multi_terminal', 'family_sync', 'shared_terminals'],
    theme: 'terminal',
    description: 'Family hacker den'
  },
  '2,2': {
    name: 'Business Conduit',
    features: ['multi_terminal', 'team_control', 'github_org', 'deploy'],
    theme: 'terminal',
    description: 'Enterprise terminal control'
  },
  '2,3': {
    name: 'Public Conduit',
    features: ['multi_terminal', 'audit_trail', 'compliance', 'logging'],
    theme: 'terminal',
    description: 'Auditable operations'
  },

  // Row 3: Orchestra Mode (100 terminals)
  '3,0': {
    name: 'Personal Orchestra',
    features: ['*', 'local_only', 'emergence'],
    theme: 'matrix',
    description: 'Your personal matrix'
  },
  '3,1': {
    name: 'Family Orchestra',
    features: ['*', 'family_sync', 'emergence'],
    theme: 'matrix',
    description: 'Family consciousness network'
  },
  '3,2': {
    name: 'Business Orchestra',
    features: ['*', 'team_sync', 'emergence', 'enterprise'],
    theme: 'matrix',
    description: 'Enterprise neural network'
  },
  '3,3': {
    name: 'Public Orchestra',
    features: ['*', 'full_compliance', 'emergence', 'global'],
    theme: 'matrix',
    description: 'Global consciousness grid'
  }
};

// Orchestra Mode configuration (Level 3)
export const ORCHESTRA_CONFIG = {
  conductor: null,
  instruments: [],
  emergenceThreshold: 100, // When magic happens
  symphonyActive: false,

  // Register a terminal
  registerTerminal: function(terminal) {
    this.instruments.push(terminal);
    if (this.instruments.length >= this.emergenceThreshold) {
      this.triggerEmergence();
    }
    return this.instruments.length;
  },

  // Elect conductor (highest activity score)
  electConductor: function() {
    if (this.instruments.length === 0) return null;
    return this.instruments.reduce((best, current) =>
      (current.activityScore || 0) > (best.activityScore || 0) ? current : best
    );
  },

  // The Hundredth Terminal Effect
  triggerEmergence: function() {
    this.conductor = this.electConductor();
    this.symphonyActive = true;

    // Notify all terminals
    window.dispatchEvent(new CustomEvent('orchestra-emergence', {
      detail: {
        conductor: this.conductor?.id,
        terminalCount: this.instruments.length,
        timestamp: new Date().toISOString()
      }
    }));

    console.log(`[ORCHESTRA] Emergence triggered! ${this.instruments.length} terminals synchronized.`);
    return true;
  },

  // Get orchestra status
  getStatus: function() {
    return {
      terminalCount: this.instruments.length,
      conductor: this.conductor?.id || null,
      symphonyActive: this.symphonyActive,
      emergenceProgress: Math.min(100, (this.instruments.length / this.emergenceThreshold) * 100)
    };
  }
};

/**
 * Get current matrix position [complexity, privacy]
 */
export function getMatrixPosition() {
  try {
    const x = parseInt(localStorage.getItem(MATRIX_X_KEY) || '0', 10);
    const y = parseInt(localStorage.getItem(MATRIX_Y_KEY) || '0', 10);
    return [
      Math.min(Math.max(y, 0), 3), // Complexity (clamped 0-3)
      Math.min(Math.max(x, 0), 3)  // Privacy (clamped 0-3)
    ];
  } catch {
    return [0, 0];
  }
}

/**
 * Set matrix position
 */
export function setMatrixPosition(complexity, privacy) {
  const validComplexity = Math.min(Math.max(complexity, 0), 3);
  const validPrivacy = Math.min(Math.max(privacy, 0), 3);

  localStorage.setItem(MATRIX_Y_KEY, validComplexity.toString());
  localStorage.setItem(MATRIX_X_KEY, validPrivacy.toString());

  const config = MATRIX_CONFIG[`${validComplexity},${validPrivacy}`];

  // Dispatch event for reactive updates
  window.dispatchEvent(new CustomEvent('matrix-change', {
    detail: {
      complexity: validComplexity,
      privacy: validPrivacy,
      config: config,
      position: `${validComplexity},${validPrivacy}`
    }
  }));

  // Update body classes
  document.body.classList.remove(
    'complexity-0', 'complexity-1', 'complexity-2', 'complexity-3',
    'privacy-0', 'privacy-1', 'privacy-2', 'privacy-3',
    'theme-minimal', 'theme-professional', 'theme-terminal', 'theme-matrix'
  );
  document.body.classList.add(`complexity-${validComplexity}`);
  document.body.classList.add(`privacy-${validPrivacy}`);
  document.body.classList.add(`theme-${config.theme}`);

  return config;
}

/**
 * Get current configuration
 */
export function getCurrentConfig() {
  const [complexity, privacy] = getMatrixPosition();
  return MATRIX_CONFIG[`${complexity},${privacy}`];
}

/**
 * Check if a feature is available at current position
 */
export function hasFeature(featureName) {
  const config = getCurrentConfig();
  if (config.features.includes('*')) return true;
  return config.features.includes(featureName);
}

/**
 * Check if complexity is at least the specified level
 */
export function isAtLeastComplexity(requiredLevel) {
  const [complexity] = getMatrixPosition();
  return complexity >= requiredLevel;
}

/**
 * Check if privacy is at least the specified level
 */
export function isAtLeastPrivacy(requiredLevel) {
  const [, privacy] = getMatrixPosition();
  return privacy >= requiredLevel;
}

/**
 * Matrix Slider Web Component
 */
export class MatrixSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    window.addEventListener('matrix-change', () => this.render());
  }

  render() {
    const [complexity, privacy] = getMatrixPosition();
    const config = getCurrentConfig();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--ok-font-body, 'Exo 2', sans-serif);
        }
        .matrix-container {
          background: var(--ok-surface, #1a1a1a);
          border: 1px solid var(--ok-border, #333);
          border-radius: 12px;
          padding: 16px;
        }
        .matrix-title {
          text-align: center;
          font-size: 0.75rem;
          color: var(--ok-text-muted, #888);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .matrix-grid {
          display: grid;
          grid-template-columns: auto repeat(4, 1fr);
          gap: 4px;
        }
        .matrix-cell {
          width: 40px;
          height: 40px;
          border: 1px solid var(--ok-border, #333);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          color: var(--ok-text-muted, #666);
        }
        .matrix-cell:hover {
          background: rgba(0, 255, 242, 0.1);
          border-color: var(--ok-cyan, #00fff2);
        }
        .matrix-cell.active {
          background: var(--ok-cyan, #00fff2);
          border-color: var(--ok-cyan, #00fff2);
          color: black;
          font-weight: bold;
        }
        .matrix-cell.orchestra {
          background: var(--ok-red, #ff0040);
          border-color: var(--ok-red, #ff0040);
          color: white;
        }
        .matrix-label {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          font-size: 0.625rem;
          color: var(--ok-text-muted, #888);
        }
        .matrix-header {
          font-size: 0.5rem;
          color: var(--ok-text-muted, #666);
          text-align: center;
          padding: 4px;
        }
        .current-config {
          margin-top: 12px;
          padding: 8px;
          background: rgba(0, 255, 242, 0.1);
          border-radius: 6px;
          font-size: 0.75rem;
        }
        .config-name {
          color: var(--ok-cyan, #00fff2);
          font-weight: 600;
        }
        .config-desc {
          color: var(--ok-text-muted, #888);
          margin-top: 4px;
        }
      </style>
      <div class="matrix-container">
        <div class="matrix-title">Privacy x Complexity Matrix</div>
        <div class="matrix-grid">
          <!-- Header row -->
          <div class="matrix-header"></div>
          <div class="matrix-header">Self</div>
          <div class="matrix-header">Family</div>
          <div class="matrix-header">Business</div>
          <div class="matrix-header">Public</div>

          <!-- Orchestra row (3) -->
          <div class="matrix-label">L3</div>
          ${this.renderRow(3, complexity, privacy)}

          <!-- Conduit row (2) -->
          <div class="matrix-label">L2</div>
          ${this.renderRow(2, complexity, privacy)}

          <!-- Dashboard row (1) -->
          <div class="matrix-label">L1</div>
          ${this.renderRow(1, complexity, privacy)}

          <!-- Simple row (0) -->
          <div class="matrix-label">L0</div>
          ${this.renderRow(0, complexity, privacy)}
        </div>
        <div class="current-config">
          <div class="config-name">${config.name}</div>
          <div class="config-desc">${config.description}</div>
        </div>
      </div>
    `;
  }

  renderRow(rowComplexity, currentComplexity, currentPrivacy) {
    let cells = '';
    for (let p = 0; p < 4; p++) {
      const isActive = rowComplexity === currentComplexity && p === currentPrivacy;
      const isOrchestra = rowComplexity === 3 && isActive;
      cells += `
        <button
          class="matrix-cell ${isActive ? 'active' : ''} ${isOrchestra ? 'orchestra' : ''}"
          data-complexity="${rowComplexity}"
          data-privacy="${p}"
          title="${MATRIX_CONFIG[`${rowComplexity},${p}`].name}"
        ></button>
      `;
    }
    return cells;
  }

  setupListeners() {
    this.shadowRoot.querySelectorAll('.matrix-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const complexity = parseInt(cell.dataset.complexity, 10);
        const privacy = parseInt(cell.dataset.privacy, 10);
        setMatrixPosition(complexity, privacy);
      });
    });
  }
}

// Register custom element
if (typeof customElements !== 'undefined' && !customElements.get('matrix-slider')) {
  customElements.define('matrix-slider', MatrixSlider);
}

// Initialize on load
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const [complexity, privacy] = getMatrixPosition();
  const config = MATRIX_CONFIG[`${complexity},${privacy}`];

  document.body.classList.add(`complexity-${complexity}`);
  document.body.classList.add(`privacy-${privacy}`);
  document.body.classList.add(`theme-${config.theme}`);
}

export default {
  PRIVACY,
  COMPLEXITY,
  PRIVACY_LABELS,
  COMPLEXITY_LABELS,
  MATRIX_CONFIG,
  ORCHESTRA_CONFIG,
  getMatrixPosition,
  setMatrixPosition,
  getCurrentConfig,
  hasFeature,
  isAtLeastComplexity,
  isAtLeastPrivacy,
  MatrixSlider
};
