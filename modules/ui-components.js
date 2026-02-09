/**
 * UI COMPONENTS MODULE
 * Shared UI Elements Library
 *
 * Core components for all OVERKILL products:
 * - Loading states
 * - Notifications
 * - Modals
 * - Cards
 * - Buttons
 *
 * Location: 100X_DEPLOYMENT/modules/
 * Created: 2026-02-08
 * Connects: ARCHITECTURE_GUIDELINES_DNA.md, brand-sync.css
 */

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Shared styles
const SHARED_STYLES = `
  :host {
    --ok-cyan: #00fff2;
    --ok-red: #ff0040;
    --ok-gold: #ffd700;
    --ok-purple: #9945ff;
    --ok-surface: #1a1a1a;
    --ok-surface-light: #2a2a2a;
    --ok-border: #333;
    --ok-text: #fff;
    --ok-text-muted: #888;
    --ok-font-body: 'Exo 2', sans-serif;
    --ok-font-mono: 'Fira Code', monospace;
    --ok-radius: 8px;
    --ok-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
`;

/**
 * Loading Spinner Component
 */
export class OkSpinner extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['size', 'color'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const size = this.getAttribute('size') || '32';
    const color = this.getAttribute('color') || 'var(--ok-cyan, #00fff2)';

    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED_STYLES}
        :host {
          display: inline-block;
        }
        .spinner {
          width: ${size}px;
          height: ${size}px;
          border: 3px solid transparent;
          border-top-color: ${color};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="spinner"></div>
    `;
  }
}

/**
 * Toast Notification Component
 */
export class OkToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timeout = null;
  }

  static get observedAttributes() {
    return ['type', 'message', 'duration'];
  }

  connectedCallback() {
    this.render();
    this.scheduleHide();
  }

  disconnectedCallback() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  attributeChangedCallback() {
    this.render();
  }

  scheduleHide() {
    const duration = parseInt(this.getAttribute('duration') || '3000', 10);
    if (duration > 0) {
      this.timeout = setTimeout(() => {
        this.remove();
      }, duration);
    }
  }

  render() {
    const type = this.getAttribute('type') || 'info';
    const message = this.getAttribute('message') || '';

    const colors = {
      success: '#00ff88',
      error: 'var(--ok-red)',
      warning: 'var(--ok-gold)',
      info: 'var(--ok-cyan)'
    };

    const icons = {
      success: '\u2713',
      error: '\u2715',
      warning: '\u26A0',
      info: '\u2139'
    };

    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED_STYLES}
        :host {
          display: block;
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--ok-surface);
          border: 1px solid ${colors[type]};
          border-left: 4px solid ${colors[type]};
          border-radius: var(--ok-radius);
          box-shadow: var(--ok-shadow);
          font-family: var(--ok-font-body);
          color: var(--ok-text);
          max-width: 400px;
        }
        .icon {
          font-size: 1.25rem;
          color: ${colors[type]};
        }
        .message {
          flex: 1;
          font-size: 0.875rem;
        }
        .close {
          background: none;
          border: none;
          color: var(--ok-text-muted);
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          line-height: 1;
        }
        .close:hover {
          color: var(--ok-text);
        }
      </style>
      <div class="toast">
        <span class="icon">${icons[type]}</span>
        <span class="message">${message}</span>
        <button class="close" onclick="this.getRootNode().host.remove()">\u2715</button>
      </div>
    `;
  }
}

/**
 * Modal Dialog Component
 */
export class OkModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['open', 'title'];
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  attributeChangedCallback() {
    this.render();
  }

  open() {
    this.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.removeAttribute('open');
    document.body.style.overflow = '';
    this.dispatchEvent(new CustomEvent('close'));
  }

  setupListeners() {
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.classList.contains('overlay')) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.hasAttribute('open')) {
        this.close();
      }
    });
  }

  render() {
    const isOpen = this.hasAttribute('open');
    const title = this.getAttribute('title') || '';

    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED_STYLES}
        :host {
          display: ${isOpen ? 'block' : 'none'};
        }
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal {
          background: var(--ok-surface);
          border: 1px solid var(--ok-border);
          border-radius: 12px;
          min-width: 320px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          animation: scaleIn 0.2s ease;
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--ok-border);
        }
        .title {
          font-family: var(--ok-font-body);
          font-size: 1rem;
          font-weight: 600;
          color: var(--ok-cyan);
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--ok-text-muted);
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0;
          line-height: 1;
        }
        .close-btn:hover {
          color: var(--ok-text);
        }
        .content {
          padding: 16px;
          overflow-y: auto;
          max-height: calc(90vh - 100px);
        }
      </style>
      <div class="overlay">
        <div class="modal">
          <div class="header">
            <h2 class="title">${title}</h2>
            <button class="close-btn" onclick="this.getRootNode().host.close()">\u2715</button>
          </div>
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Card Component
 */
export class OkCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['variant', 'interactive'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const variant = this.getAttribute('variant') || 'default';
    const interactive = this.hasAttribute('interactive');

    const variants = {
      default: 'var(--ok-border)',
      highlight: 'var(--ok-cyan)',
      warning: 'var(--ok-gold)',
      danger: 'var(--ok-red)'
    };

    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED_STYLES}
        :host {
          display: block;
        }
        .card {
          background: var(--ok-surface);
          border: 1px solid ${variants[variant]};
          border-radius: var(--ok-radius);
          padding: 16px;
          transition: all 0.2s ease;
        }
        ${interactive ? `
          .card:hover {
            border-color: var(--ok-cyan);
            box-shadow: 0 0 20px rgba(0, 255, 242, 0.1);
            cursor: pointer;
          }
        ` : ''}
      </style>
      <div class="card">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Button Component
 */
export class OkButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'medium';
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');

    const variants = {
      primary: { bg: 'var(--ok-cyan)', color: '#000', border: 'var(--ok-cyan)' },
      secondary: { bg: 'transparent', color: 'var(--ok-cyan)', border: 'var(--ok-cyan)' },
      danger: { bg: 'var(--ok-red)', color: '#fff', border: 'var(--ok-red)' },
      ghost: { bg: 'transparent', color: 'var(--ok-text)', border: 'transparent' }
    };

    const sizes = {
      small: { padding: '6px 12px', fontSize: '0.75rem' },
      medium: { padding: '8px 16px', fontSize: '0.875rem' },
      large: { padding: '12px 24px', fontSize: '1rem' }
    };

    const v = variants[variant];
    const s = sizes[size];

    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED_STYLES}
        :host {
          display: inline-block;
        }
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: ${s.padding};
          font-size: ${s.fontSize};
          font-family: var(--ok-font-body);
          font-weight: 600;
          background: ${v.bg};
          color: ${v.color};
          border: 1px solid ${v.border};
          border-radius: var(--ok-radius);
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        button:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 0 15px ${v.border}40;
        }
        button:active:not(:disabled) {
          transform: scale(0.98);
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <button ${disabled || loading ? 'disabled' : ''}>
        ${loading ? '<span class="spinner"></span>' : ''}
        <slot></slot>
      </button>
    `;
  }
}

/**
 * Progress Bar Component
 */
export class OkProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['value', 'max', 'color'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const value = parseFloat(this.getAttribute('value') || '0');
    const max = parseFloat(this.getAttribute('max') || '100');
    const color = this.getAttribute('color') || 'var(--ok-cyan)';
    const percent = Math.min(100, (value / max) * 100);

    this.shadowRoot.innerHTML = `
      <style>
        ${SHARED_STYLES}
        :host {
          display: block;
        }
        .progress {
          height: 8px;
          background: var(--ok-surface-light);
          border-radius: 4px;
          overflow: hidden;
        }
        .bar {
          height: 100%;
          width: ${percent}%;
          background: ${color};
          transition: width 0.3s ease;
        }
      </style>
      <div class="progress">
        <div class="bar"></div>
      </div>
    `;
  }
}

// Utility: Show toast notification
export function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('ok-toast');
  toast.setAttribute('message', message);
  toast.setAttribute('type', type);
  toast.setAttribute('duration', duration.toString());
  document.body.appendChild(toast);
  return toast;
}

// Utility: Show modal
export function showModal(title, content) {
  const modal = document.createElement('ok-modal');
  modal.setAttribute('title', title);
  modal.innerHTML = content;
  document.body.appendChild(modal);
  modal.open();
  return modal;
}

// Register all components
const components = {
  'ok-spinner': OkSpinner,
  'ok-toast': OkToast,
  'ok-modal': OkModal,
  'ok-card': OkCard,
  'ok-button': OkButton,
  'ok-progress': OkProgress
};

if (typeof customElements !== 'undefined') {
  for (const [name, component] of Object.entries(components)) {
    if (!customElements.get(name)) {
      customElements.define(name, component);
    }
  }
}

export default {
  NOTIFICATION_TYPES,
  OkSpinner,
  OkToast,
  OkModal,
  OkCard,
  OkButton,
  OkProgress,
  showToast,
  showModal
};
