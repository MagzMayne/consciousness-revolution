/**
 * mobile-responsive.js
 * Consciousness Revolution — Universal Mobile Responsiveness Helper
 *
 * • Ensures every page has the correct viewport <meta> tag.
 * • Injects /css/mobile-universal.css if it is not already loaded.
 * • Applies JS-driven device adaptations (fluid font size, hamburger
 *   menu for multi-item navbars, safe-area padding for notched phones).
 * • Detects the device type (phone / tablet / desktop) and adds a
 *   data attribute to <html> so pages can style with CSS or JS.
 * • Safe to load on every page — idempotent and non-destructive.
 * • Respects .no-mobile-fix to opt specific elements out.
 */

(function () {
    'use strict';

    /* ─── 1. Ensure viewport meta tag ─── */
    function ensureViewportMeta() {
        var existing = document.querySelector('meta[name="viewport"]');
        if (existing) {
            /* Normalise — make sure it has width=device-width */
            if (!existing.content.includes('width=device-width')) {
                existing.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            }
            return;
        }
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        document.head.insertBefore(meta, document.head.firstChild);
    }

    /* ─── 2. Inject mobile-universal.css ─── */
    var MOBILE_CSS_PATH = '/css/mobile-universal.css';

    function isMobileCssLoaded() {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .some(function (l) {
                return l.href && l.href.includes('mobile-universal');
            });
    }

    function injectMobileCss() {
        if (isMobileCssLoaded()) { return; }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = MOBILE_CSS_PATH;
        /* Insert as early as possible so page CSS can still override */
        var firstLink = document.head.querySelector('link[rel="stylesheet"]');
        if (firstLink) {
            document.head.insertBefore(link, firstLink);
        } else {
            document.head.appendChild(link);
        }
    }

    /* ─── 3. Detect device category ─── */
    function detectDevice() {
        var w = window.innerWidth;
        var ua = navigator.userAgent || '';
        var touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        var category;

        if (w <= 480) {
            category = 'phone';
        } else if (w <= 1024 || (touch && /iPad|Android/i.test(ua))) {
            category = 'tablet';
        } else {
            category = 'desktop';
        }

        return {
            category: category,
            width: w,
            height: window.innerHeight,
            touch: touch,
            portrait: window.innerHeight > window.innerWidth,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    /* ─── 4. Apply device data attributes to <html> ─── */
    function applyDeviceAttributes(device) {
        var html = document.documentElement;
        html.setAttribute('data-device', device.category);
        html.setAttribute('data-touch', device.touch ? 'true' : 'false');
        html.setAttribute('data-orientation', device.portrait ? 'portrait' : 'landscape');
        html.setAttribute('data-pixel-ratio', device.pixelRatio);

        /* CSS custom property for JS-calculated viewport height (iOS fix) */
        html.style.setProperty('--cr-vh', (window.innerHeight * 0.01) + 'px');
    }

    /* ─── 5. Hamburger menu for multi-item navbars on mobile ─── */
    function setupHamburger() {
        if (window.innerWidth > 768) { return; }

        /* Find navbars that have more than 2 links and no existing toggle */
        var navs = document.querySelectorAll(
            'nav:not(.no-mobile-fix), .navbar:not(.no-mobile-fix), .navigation:not(.no-mobile-fix)'
        );

        navs.forEach(function (nav) {
            /* Skip if already processed */
            if (nav.dataset.crHamburger) { return; }
            nav.dataset.crHamburger = '1';

            var ul = nav.querySelector('ul');
            if (!ul) { return; }

            var links = ul.querySelectorAll('a, button');
            if (links.length <= 2) { return; } /* Short navs are fine expanded */

            /* Check if a hamburger-like button already exists */
            var existingToggle = nav.querySelector(
                '[class*="toggle"], [class*="hamburger"], [class*="menu-btn"], [aria-label*="menu"], [aria-label*="Menu"]'
            );
            if (existingToggle) { return; }

            /* Create hamburger button */
            var btn = document.createElement('button');
            btn.className = 'cr-hamburger';
            btn.setAttribute('aria-label', 'Toggle navigation');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', 'cr-nav-' + Date.now());
            btn.innerHTML = '<span></span><span></span><span></span>';

            /* Wrap the ul so we can control visibility */
            ul.classList.add('cr-nav-menu', 'cr-nav-collapsed');
            ul.id = btn.getAttribute('aria-controls');

            /* Insert button before the ul */
            nav.insertBefore(btn, ul);

            btn.addEventListener('click', function () {
                var isOpen = ul.classList.contains('cr-nav-open');
                ul.classList.toggle('cr-nav-open', !isOpen);
                ul.classList.toggle('cr-nav-collapsed', isOpen);
                btn.classList.toggle('is-open', !isOpen);
                btn.setAttribute('aria-expanded', String(!isOpen));
            });

            /* Close on outside click */
            document.addEventListener('click', function (e) {
                if (!nav.contains(e.target)) {
                    ul.classList.remove('cr-nav-open');
                    ul.classList.add('cr-nav-collapsed');
                    btn.classList.remove('is-open');
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    /* ─── 6. Fix iOS 100vh bug ─── */
    function fixVh() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--cr-vh', vh + 'px');
    }

    /* ─── 7. Prevent horizontal scroll caused by overflowing children ─── */
    function preventHorizontalScroll() {
        if (window.innerWidth > 768) { return; }
        var bodyW = document.documentElement.scrollWidth;
        if (bodyW <= window.innerWidth) { return; }

        /* Find and report offending elements (non-destructive) */
        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (el.classList.contains('no-mobile-fix')) { continue; }
            var rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 5) {
                /* Apply non-breaking fix */
                el.style.maxWidth = '100%';
                el.style.boxSizing = 'border-box';
            }
        }
    }

    /* ─── 8. Apply safe-area-inset padding to fixed bottom elements ─── */
    function applySafeArea() {
        var fixedBottom = document.querySelectorAll(
            '.fixed-bottom, .bottom-nav, .bottom-bar, [class*="bottom-tab"]'
        );
        fixedBottom.forEach(function (el) {
            el.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
        });
    }

    /* ─── 9. Ensure inputs use font-size ≥ 16px (iOS zoom prevention) ─── */
    function fixInputZoom() {
        if (window.innerWidth > 768) { return; }
        var inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(function (el) {
            var cs = window.getComputedStyle(el);
            var fs = parseFloat(cs.fontSize);
            if (isNaN(fs) || fs < 16) {
                el.style.fontSize = '16px';
            }
        });
    }

    /* ─── 10. Responsive table enhancement ─── */
    function makeMobileTables() {
        if (window.innerWidth > 768) { return; }
        var tables = document.querySelectorAll('table:not(.no-mobile-fix)');
        tables.forEach(function (tbl) {
            if (tbl.parentElement && tbl.parentElement.classList.contains('cr-table-scroll')) {
                return;
            }
            var wrapper = document.createElement('div');
            wrapper.className = 'cr-table-scroll';
            wrapper.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;';
            tbl.parentNode.insertBefore(wrapper, tbl);
            wrapper.appendChild(tbl);
        });
    }

    /* ─── 11. Resize / orientation handler ─── */
    function onResize() {
        var device = detectDevice();
        applyDeviceAttributes(device);
        fixVh();

        /* Re-run mobile-specific fixes on resize */
        if (device.width <= 768) {
            setupHamburger();
            preventHorizontalScroll();
            fixInputZoom();
        }
    }

    /* ─── 12. Boot ─── */
    function init() {
        ensureViewportMeta();
        injectMobileCss();

        var device = detectDevice();
        applyDeviceAttributes(device);
        fixVh();
        applySafeArea();

        /* DOM-dependent fixes run after content is parsed */
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                setupHamburger();
                preventHorizontalScroll();
                fixInputZoom();
                makeMobileTables();
            });
        } else {
            setupHamburger();
            preventHorizontalScroll();
            fixInputZoom();
            makeMobileTables();
        }

        /* Keep responsive on resize / orientation change */
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(onResize, 150);
        });
        window.addEventListener('orientationchange', function () {
            /* Small delay so the browser reports the new dimensions */
            setTimeout(onResize, 300);
        });
    }

    /* Run immediately — viewport meta must be set before first paint */
    ensureViewportMeta();
    injectMobileCss();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            var device = detectDevice();
            applyDeviceAttributes(device);
            fixVh();
            applySafeArea();
            setupHamburger();
            preventHorizontalScroll();
            fixInputZoom();
            makeMobileTables();

            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(onResize, 150);
            });
            window.addEventListener('orientationchange', function () {
                setTimeout(onResize, 300);
            });
        });
    } else {
        init();
    }
})();
