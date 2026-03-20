// RootIB: RB-20260320052633-FUTUI001
/**
 * futuristic-init.js
 * Consciousness Revolution — Universal Futuristic Blue-Light Design Enhancer
 *
 * Automatically applies the futuristic-ui.css design system to every page:
 *   • Loads /css/futuristic-ui.css if not already present
 *   • Applies .fui-card animated blue-border to common card / panel elements
 *   • Applies .fui-btn animated shimmer to call-to-action buttons
 *   • Adds .fui-glow overlay to section headers and feature blocks
 *   • Upgrades domain-card grids with hover-lift + glow
 *
 * Non-destructive — only ADDS classes, never removes or overrides existing
 * layout styles.  Use class .no-fui-enhance on any element to opt it out.
 *
 * Usage: loaded automatically via inject-futuristic.js on every page.
 */

(function () {
    'use strict';

    /* ── 1. Inject futuristic-ui.css if not already loaded ── */
    var CSS_HREF = '/css/futuristic-ui.css';

    function isFuiCssLoaded() {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .some(function (l) { return l.href && l.href.includes('futuristic-ui'); });
    }

    function injectFuiCss() {
        if (isFuiCssLoaded()) { return; }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CSS_HREF;
        document.head.appendChild(link);
    }

    /* ── 2. Safely add a CSS class if element doesn't already have it ── */
    function addClass(el, className) {
        if (el && !el.classList.contains(className) && !el.classList.contains('no-fui-enhance')) {
            el.classList.add(className);
        }
    }

    /* ── 3. Card / panel upgrade ── */
    var CARD_SELECTORS = [
        /* Generic cards */
        '.card:not(.no-fui-enhance)',
        '.panel:not(.no-fui-enhance)',
        /* Feature / tool cards */
        '.feature-card:not(.no-fui-enhance)',
        '.tool-card:not(.no-fui-enhance)',
        '.project-card:not(.no-fui-enhance)',
        /* Domain cards */
        '.domain-card:not(.no-fui-enhance)',
        /* Stat / metric cards */
        '.stat-card:not(.no-fui-enhance)',
        '.metric-card:not(.no-fui-enhance)',
        /* Agent cards */
        '.agent-card:not(.no-fui-enhance)',
        /* Dashboard widgets */
        '.widget:not(.no-fui-enhance)',
        '.dashboard-card:not(.no-fui-enhance)',
        /* Araya hub boxes */
        '.araya-box:not(.no-fui-enhance)',
    ];

    function upgradeCards() {
        var query = CARD_SELECTORS.join(', ');
        var els = document.querySelectorAll(query);
        els.forEach(function (el) {
            addClass(el, 'fui-glow');
        });
    }

    /* ── 4. Button upgrade ── */
    var BUTTON_SELECTORS = [
        'a.btn-primary:not(.no-fui-enhance)',
        'button.btn-primary:not(.no-fui-enhance)',
        'a.cta-button:not(.no-fui-enhance)',
        'button.cta-button:not(.no-fui-enhance)',
        '.hero-cta a:not(.no-fui-enhance)',
        '.hero-cta button:not(.no-fui-enhance)',
        'a.el-btn:not(.no-fui-enhance)',
        'button.el-btn:not(.no-fui-enhance)',
    ];

    function upgradeButtons() {
        var query = BUTTON_SELECTORS.join(', ');
        var els = document.querySelectorAll(query);
        els.forEach(function (el) {
            addClass(el, 'fui-btn');
        });
    }

    /* ── 5. Section title upgrade ── */
    var SECTION_SELECTORS = [
        '.section-title:not(.no-fui-enhance)',
        '.el-section-title:not(.no-fui-enhance)',
        'h2.section-header:not(.no-fui-enhance)',
        '.page-title:not(.no-fui-enhance)',
    ];

    function upgradeSectionTitles() {
        var query = SECTION_SELECTORS.join(', ');
        var els = document.querySelectorAll(query);
        els.forEach(function (el) {
            addClass(el, 'fui-section');
        });
    }

    /* ── 6. Inject subtle global grid background if body lacks one ── */
    function injectGridBackground() {
        var body = document.body;
        if (!body) { return; }
        /* Only add if the body doesn't already have a background-image */
        var computed = window.getComputedStyle(body).backgroundImage;
        if (!computed || computed === 'none') {
            addClass(body, 'fui-grid-bg');
        }
    }

    /* ── 7. Respects prefers-reduced-motion ── */
    function shouldAnimate() {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /* ── 8. Boot ── */
    function init() {
        injectFuiCss();
        if (!shouldAnimate()) { return; }
        upgradeCards();
        upgradeButtons();
        upgradeSectionTitles();
        /* Grid background is purely decorative, skip if reduced-motion */
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
