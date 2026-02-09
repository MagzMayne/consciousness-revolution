/**
 * CRISSCROSS MODULE
 * Retroactive Improvement Propagation Protocol
 *
 * When a better method is discovered:
 * 1. DISCOVERY - New improvement found
 * 2. VALIDATION - Test against LFME standards
 * 3. PROPAGATION - Apply to ALL existing products
 *
 * "Go BACK and FIX FORWARD"
 *
 * Location: 100X_DEPLOYMENT/modules/
 * Created: 2026-02-08
 * Connects: ARCHITECTURE_GUIDELINES_DNA.md
 */

// Storage key for improvement registry
const IMPROVEMENTS_KEY = 'overkill_improvements';

// LFME Standards scoring thresholds
const LFME_THRESHOLDS = {
  L: 6, // Lighter - minimum score to pass
  F: 6, // Faster
  M: 6, // More Elegant
  E: 6  // Less Expensive
};

// Improvement types
export const IMPROVEMENT_TYPES = {
  SECURITY: 'security',       // Urgent - security fixes
  PERFORMANCE: 'performance', // Speed/efficiency
  SIMPLIFICATION: 'simplification', // Removing complexity
  RESOURCE: 'resource',       // Using fewer resources
  PATTERN: 'pattern'          // Better pattern discovered
};

// Priority levels based on improvement type
export const PRIORITY_MAP = {
  security: 'URGENT',
  performance: 'HIGH',
  simplification: 'NORMAL',
  resource: 'NORMAL',
  pattern: 'LOW'
};

/**
 * Get all improvements from storage
 */
export function getImprovements() {
  try {
    const data = localStorage.getItem(IMPROVEMENTS_KEY);
    return data ? JSON.parse(data) : { improvements: [], lastUpdated: null };
  } catch {
    return { improvements: [], lastUpdated: null };
  }
}

/**
 * Save improvements to storage
 */
function saveImprovements(registry) {
  registry.lastUpdated = new Date().toISOString();
  localStorage.setItem(IMPROVEMENTS_KEY, JSON.stringify(registry));
  return registry;
}

/**
 * Validate improvement against LFME standards
 * @param {Object} lfmeScore - { L: 1-10, F: 1-10, M: 1-10, E: 1-10 }
 * @returns {Object} - { passed: boolean, details: object }
 */
export function validateLFME(lfmeScore) {
  const results = {
    L: lfmeScore.L >= LFME_THRESHOLDS.L,
    F: lfmeScore.F >= LFME_THRESHOLDS.F,
    M: lfmeScore.M >= LFME_THRESHOLDS.M,
    E: lfmeScore.E >= LFME_THRESHOLDS.E
  };

  const passed = Object.values(results).every(v => v);
  const avgScore = (lfmeScore.L + lfmeScore.F + lfmeScore.M + lfmeScore.E) / 4;

  return {
    passed,
    avgScore,
    details: {
      lighter: { score: lfmeScore.L, passed: results.L, threshold: LFME_THRESHOLDS.L },
      faster: { score: lfmeScore.F, passed: results.F, threshold: LFME_THRESHOLDS.F },
      moreElegant: { score: lfmeScore.M, passed: results.M, threshold: LFME_THRESHOLDS.M },
      lessExpensive: { score: lfmeScore.E, passed: results.E, threshold: LFME_THRESHOLDS.E }
    }
  };
}

/**
 * Log a new improvement
 * @param {Object} improvement - The improvement details
 */
export function logImprovement(improvement) {
  const registry = getImprovements();

  const newImprovement = {
    id: `IMP-${Date.now()}`,
    date: new Date().toISOString(),
    type: improvement.type || IMPROVEMENT_TYPES.PATTERN,
    pattern: improvement.pattern || 'Unknown pattern',
    description: improvement.description || '',
    lfme_score: improvement.lfme_score || { L: 5, F: 5, M: 5, E: 5 },
    affected_products: improvement.affected_products || [],
    propagation_status: 'pending',
    created_by: improvement.created_by || 'system',
    validation: validateLFME(improvement.lfme_score || { L: 5, F: 5, M: 5, E: 5 })
  };

  registry.improvements.push(newImprovement);
  saveImprovements(registry);

  // Dispatch event for listeners
  window.dispatchEvent(new CustomEvent('improvement-logged', {
    detail: newImprovement
  }));

  return newImprovement;
}

/**
 * Scan products for affected patterns
 * @param {string} pattern - The pattern to search for
 * @param {Array} productList - List of products to scan
 */
export function scanProducts(pattern, productList = []) {
  // In real implementation, this would scan the codebase
  // For now, return products that match pattern description
  const affected = productList.filter(product => {
    return product.patterns?.includes(pattern) ||
           product.description?.toLowerCase().includes(pattern.toLowerCase());
  });

  return affected;
}

/**
 * Create update task for an improvement
 * @param {Object} taskData - Task creation data
 */
export function createUpdateTask(taskData) {
  const task = {
    id: `TASK-${Date.now()}`,
    improvement_id: taskData.improvement,
    product_id: taskData.product,
    priority: taskData.priority || 'NORMAL',
    status: 'pending',
    created: new Date().toISOString()
  };

  // Dispatch task created event
  window.dispatchEvent(new CustomEvent('crisscross-task', {
    detail: task
  }));

  return task;
}

/**
 * Update improvement status
 * @param {string} improvementId - The improvement ID
 * @param {string} status - New status
 */
export function updateImprovementStatus(improvementId, status) {
  const registry = getImprovements();
  const improvement = registry.improvements.find(i => i.id === improvementId);

  if (improvement) {
    improvement.propagation_status = status;
    improvement.updated = new Date().toISOString();
    saveImprovements(registry);

    window.dispatchEvent(new CustomEvent('improvement-updated', {
      detail: improvement
    }));

    return improvement;
  }

  return null;
}

/**
 * Get improvements by status
 * @param {string} status - Filter by status
 */
export function getImprovementsByStatus(status) {
  const registry = getImprovements();
  return registry.improvements.filter(i => i.propagation_status === status);
}

/**
 * Get urgent improvements (security-related)
 */
export function getUrgentImprovements() {
  const registry = getImprovements();
  return registry.improvements.filter(i =>
    i.type === IMPROVEMENT_TYPES.SECURITY &&
    i.propagation_status !== 'complete'
  );
}

/**
 * Main Crisscross Protocol handler
 * Call this when a new improvement is discovered
 */
export async function onImprovement(improvement) {
  // 1. Validate against LFME
  const validation = validateLFME(improvement.lfme_score || { L: 5, F: 5, M: 5, E: 5 });

  if (!validation.passed) {
    console.warn('[CRISSCROSS] Improvement did not pass LFME validation:', validation);
    return { success: false, reason: 'LFME validation failed', validation };
  }

  // 2. Log to improvement registry
  const logged = logImprovement(improvement);

  // 3. Scan for affected products
  const affected = scanProducts(improvement.pattern, improvement.product_list || []);
  logged.affected_products = affected.map(p => p.id || p.name);

  // 4. Generate update tasks
  const tasks = [];
  for (const product of affected) {
    const task = createUpdateTask({
      product: product.id || product.name,
      improvement: logged.id,
      priority: PRIORITY_MAP[improvement.type] || 'NORMAL'
    });
    tasks.push(task);
  }

  // 5. If affects a shared module, flag for module update
  if (improvement.affectsModule) {
    window.dispatchEvent(new CustomEvent('module-update-needed', {
      detail: {
        module: improvement.module,
        improvement: logged.id,
        priority: PRIORITY_MAP[improvement.type]
      }
    }));
  }

  return {
    success: true,
    improvement: logged,
    tasks: tasks,
    affectedCount: affected.length
  };
}

/**
 * Crisscross Dashboard Web Component
 */
export class CrisscrossDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    window.addEventListener('improvement-logged', () => this.render());
    window.addEventListener('improvement-updated', () => this.render());
  }

  render() {
    const registry = getImprovements();
    const pending = registry.improvements.filter(i => i.propagation_status === 'pending');
    const inProgress = registry.improvements.filter(i => i.propagation_status === 'in_progress');
    const complete = registry.improvements.filter(i => i.propagation_status === 'complete');
    const urgent = getUrgentImprovements();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--ok-font-body, 'Exo 2', sans-serif);
        }
        .dashboard {
          background: var(--ok-surface, #1a1a1a);
          border: 1px solid var(--ok-border, #333);
          border-radius: 12px;
          padding: 16px;
        }
        .title {
          font-size: 0.875rem;
          color: var(--ok-cyan, #00fff2);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .stat {
          background: rgba(255, 255, 255, 0.05);
          padding: 8px;
          border-radius: 6px;
          text-align: center;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--ok-text, #fff);
        }
        .stat-label {
          font-size: 0.625rem;
          color: var(--ok-text-muted, #888);
          text-transform: uppercase;
        }
        .stat.urgent .stat-value {
          color: var(--ok-red, #ff0040);
        }
        .improvement-list {
          max-height: 200px;
          overflow-y: auto;
        }
        .improvement {
          padding: 8px;
          border-bottom: 1px solid var(--ok-border, #333);
          font-size: 0.75rem;
        }
        .improvement:last-child {
          border-bottom: none;
        }
        .improvement-id {
          color: var(--ok-cyan, #00fff2);
          font-family: monospace;
        }
        .improvement-pattern {
          color: var(--ok-text, #fff);
        }
        .improvement-status {
          font-size: 0.625rem;
          padding: 2px 6px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
        }
        .status-pending { background: rgba(255, 200, 0, 0.2); color: #fc0; }
        .status-in_progress { background: rgba(0, 255, 242, 0.2); color: #00fff2; }
        .status-complete { background: rgba(0, 255, 0, 0.2); color: #0f0; }
      </style>
      <div class="dashboard">
        <div class="title">Crisscross Protocol</div>
        <div class="stats">
          <div class="stat ${urgent.length > 0 ? 'urgent' : ''}">
            <div class="stat-value">${urgent.length}</div>
            <div class="stat-label">Urgent</div>
          </div>
          <div class="stat">
            <div class="stat-value">${pending.length}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat">
            <div class="stat-value">${inProgress.length}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat">
            <div class="stat-value">${complete.length}</div>
            <div class="stat-label">Complete</div>
          </div>
        </div>
        <div class="improvement-list">
          ${registry.improvements.slice(-5).reverse().map(imp => `
            <div class="improvement">
              <span class="improvement-id">${imp.id}</span>
              <span class="improvement-pattern">${imp.pattern}</span>
              <span class="improvement-status status-${imp.propagation_status}">${imp.propagation_status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Register custom element
if (typeof customElements !== 'undefined' && !customElements.get('crisscross-dashboard')) {
  customElements.define('crisscross-dashboard', CrisscrossDashboard);
}

export default {
  IMPROVEMENT_TYPES,
  PRIORITY_MAP,
  LFME_THRESHOLDS,
  getImprovements,
  validateLFME,
  logImprovement,
  scanProducts,
  createUpdateTask,
  updateImprovementStatus,
  getImprovementsByStatus,
  getUrgentImprovements,
  onImprovement,
  CrisscrossDashboard
};
