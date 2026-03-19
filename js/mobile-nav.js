// RootIB: RB-20260319142113-811AFC82
// ===================================
// MOBILE NAVIGATION SYSTEM
// Consciousness Revolution Platform
// ===================================

class MobileNav {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createNavHTML();
    this.attachEventListeners();
    this.detectActiveLink();
  }

  createNavHTML() {
    // Create mobile nav structure if it doesn't exist
    if (document.querySelector('.mobile-nav-toggle')) return;

    const navHTML = `
      <!-- Mobile Nav Toggle -->
      <button class="mobile-nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Mobile Nav Overlay -->
      <div class="mobile-nav-overlay"></div>

      <!-- Mobile Nav Drawer -->
      <nav class="mobile-nav-drawer" aria-label="Main navigation">
        <div class="mobile-nav-content">

          <!-- Header -->
          <div class="mobile-nav-header">
            <h2>Consciousness Revolution</h2>
            <p>7 Sacred Domains</p>
          </div>

          <!-- Domain Links -->
          <ul class="mobile-nav-domains">
            <li class="mobile-nav-domain">
              <a href="/index.html" class="mobile-nav-link domain-lobby">
                <div class="mobile-nav-icon">🌟</div>
                <div class="mobile-nav-info">
                  <div class="mobile-nav-title">Sacred Lobby</div>
                  <div class="mobile-nav-desc">Return to center</div>
                </div>
              </a>
            </li>

            <li class="mobile-nav-domain">
              <a href="/SEVEN_DOMAINS_DASHBOARD.html" class="mobile-nav-link domain-command">
                <div class="mobile-nav-icon">1</div>
                <div class="mobile-nav-info">
                  <div class="mobile-nav-title">1_COMMAND</div>
                  <div class="mobile-nav-desc">Control Center</div>
                </div>
              </a>
            </li>

            <li class="mobile-nav-domain">
              <a href="/workspace.html" class="mobile-nav-link domain-build">
                <div class="mobile-nav-icon">2</div>
                <div class="mobile-nav-info">
                  <div class="mobile-nav-title">2_BUILD</div>
                  <div class="mobile-nav-desc">Developer Workspace</div>
                </div>
              </a>
            </li>

            <li class="mobile-nav-domain">
              <a href="/TRINITY_CONSOLIDATION_HUB.html" class="mobile-nav-link domain-connect">
                <div class="mobile-nav-icon">3</div>
                <div class="mobile-nav-info">
                  <div class="mobile-nav-title">3_CONNECT</div>
                  <div class="mobile-nav-desc">Trinity Hub</div>
                </div>
              </a>
            </li>

            <li class="mobile-nav-domain">
              <a href="/consciousness-tools.html" class="mobile-nav-link domain-protect">
                <div class="mobile-nav-icon">4</div>
                <div class="mobile-nav-info">
                  <div class="mobile-nav-title">4_PROTECT</div>
                  <div class="mobile-nav-desc">Defense Tools</div>
                </div>
              </a>
            </li>

            <li class="mobile-nav-domain">
              <a href="/DOMAIN_BLUEPRINTS.html" class="mobile-nav-link domain-grow">
                <div class="mobile-nav-icon">5</div>
                <div class="mobile-nav-info">
                  <div class="mobile-nav-title">5_GROW</div>
                  <div class="mobile-nav-desc">Business & Revenue</div>
                </div>
              </a>
            </li>

            <li class="mobile-nav-domain">
              <a href="/course-dashboard.html" class="mobile-nav-link domain-learn">
                <div class="mobile-nav-icon">6</div>
                <div class="mobile-nav-info">
                  <div class="mobile-nav-title">6_LEARN</div>
                  <div class="mobile-nav-desc">Pattern Library</div>
                </div>
              </a>
            </li>

            <li class="mobile-nav-domain">
              <a href="/araya-chat.html" class="mobile-nav-link domain-transcend">
                <div class="mobile-nav-icon">7</div>
                <div class="mobile-nav-info">
                  <div class="mobile-nav-title">7_TRANSCEND</div>
                  <div class="mobile-nav-desc">ARAYA Interface</div>
                </div>
              </a>
            </li>
          </ul>

          <!-- Quick Actions -->
          <div class="mobile-nav-actions">
            <h3>Quick Access</h3>
            <a href="/PATTERN_LIBRARY.html" class="mobile-nav-action-btn">Pattern Library</a>
            <a href="/CONSCIOUSNESS_DASHBOARD.html" class="mobile-nav-action-btn">Consciousness Dashboard</a>
          </div>

          <!-- Footer -->
          <div class="mobile-nav-footer">
            <p>Build NOW • Ship TODAY</p>
            <p>C1 × C2 × C3 = ∞</p>
          </div>

        </div>
      </nav>
    `;

    // Insert into body
    document.body.insertAdjacentHTML('beforeend', navHTML);
  }

  attachEventListeners() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const links = document.querySelectorAll('.mobile-nav-link');

    if (!toggle || !overlay || !drawer) return;

    // Toggle button click
    toggle.addEventListener('click', () => this.toggle());

    // Overlay click (close)
    overlay.addEventListener('click', () => this.close());

    // Link clicks (close drawer)
    links.forEach(link => {
      link.addEventListener('click', () => {
        this.close();
      });
    });

    // ESC key closes drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Prevent scroll when open
    drawer.addEventListener('touchmove', (e) => {
      if (this.isOpen) {
        e.stopPropagation();
      }
    }, { passive: false });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const drawer = document.querySelector('.mobile-nav-drawer');

    if (!toggle || !overlay || !drawer) return;

    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.isOpen = true;
  }

  close() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const drawer = document.querySelector('.mobile-nav-drawer');

    if (!toggle || !overlay || !drawer) return;

    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';

    this.isOpen = false;
  }

  detectActiveLink() {
    // Highlight current page in nav
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.mobile-nav-link');

    links.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      if (linkPath === currentPath) {
        link.classList.add('active');
        link.style.borderColor = 'gold';
        link.style.background = 'rgba(255, 215, 0, 0.15)';
      }
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileNav = new MobileNav();
  });
} else {
  window.mobileNav = new MobileNav();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileNav;
}
