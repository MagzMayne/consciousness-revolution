// RootIB: RB-20260319142113-D6CDFF61
/**
 * animate-init.js
 * Consciousness Revolution — Animate.css integration helper
 * https://animate.style
 *
 * • Injects the Animate.css CDN stylesheet if it is not already present.
 * • Uses IntersectionObserver to trigger scroll-reveal entrance animations
 *   on headings, cards, buttons, nav items, sections and other common elements.
 * • Respects prefers-reduced-motion.
 * • Safe to load on every page — idempotent and non-destructive.
 */

(function () {
    'use strict';

    /* ── 1. Inject Animate.css if not already loaded ── */
    const ANIMATE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';

    function isAnimateCssLoaded() {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .some(function (l) { return l.href && l.href.includes('animate'); });
    }

    function injectAnimateCss() {
        if (isAnimateCssLoaded()) { return; }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = ANIMATE_CDN;
        document.head.appendChild(link);
    }

    /* ── 2. Utility: add animate.css classes ── */
    function animateEl(el, animation, delay) {
        el.classList.add('animate__animated', animation);
        if (delay) {
            el.style.animationDelay = delay;
        }
    }

    /* ── 3. Scroll-reveal via IntersectionObserver ── */
    var SELECTORS = [
        /* headings */
        'h1:not(.no-animate)',
        'h2:not(.no-animate)',
        'h3:not(.no-animate)',
        /* structural blocks */
        '.card:not(.no-animate)',
        '.panel:not(.no-animate)',
        '.project-card:not(.no-animate)',
        '.feature-card:not(.no-animate)',
        '.stat-card:not(.no-animate)',
        '.metric-card:not(.no-animate)',
        '.tool-card:not(.no-animate)',
        '.agent-card:not(.no-animate)',
        '.domain-card:not(.no-animate)',
        /* nav / hero */
        '.hero-section:not(.no-animate)',
        '.hero-content:not(.no-animate)',
        /* alerts / notifications */
        '.alert:not(.no-animate)',
        '.notification:not(.no-animate)',
        '.status-badge:not(.no-animate)',
        /* CTA buttons that should draw the eye */
        '.btn-primary:not(.no-animate)',
        '.cta-button:not(.no-animate)',
    ];

    /* Map selector root to an appropriate animation */
    function pickAnimation(el) {
        var tag = el.tagName.toLowerCase();
        if (tag === 'h1') { return 'animate__fadeInDown'; }
        if (tag === 'h2' || tag === 'h3') { return 'animate__fadeInUp'; }
        if (el.classList.contains('hero-section') || el.classList.contains('hero-content')) {
            return 'animate__fadeIn';
        }
        if (el.classList.contains('btn-primary') || el.classList.contains('cta-button')) {
            return 'animate__pulse';
        }
        if (el.classList.contains('alert') || el.classList.contains('notification')) {
            return 'animate__slideInRight';
        }
        /* Default for cards / panels */
        return 'animate__fadeInUp';
    }

    function setupScrollReveal() {
        /* Skip if IntersectionObserver is not supported */
        if (!('IntersectionObserver' in window)) { return; }

        var query = SELECTORS.join(', ');
        var targets = document.querySelectorAll(query);
        if (!targets.length) { return; }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    /* Only animate once */
                    if (el.dataset.crAnimated) { return; }
                    el.dataset.crAnimated = '1';

                    var animation = el.dataset.animation || pickAnimation(el);
                    animateEl(el, animation);
                    el.classList.add('is-visible');
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        var delay = 0;
        targets.forEach(function (el) {
            /* Stagger cards within the same parent */
            if (delay > 0) {
                el.style.animationDelay = (delay * 0.08).toFixed(2) + 's';
            }
            /* Hide initially so the entrance is clean */
            if (!el.classList.contains('reveal-on-scroll')) {
                el.classList.add('reveal-on-scroll');
            }
            observer.observe(el);
            delay = (delay + 1) % 8; /* reset stagger every 8 items */
        });
    }

    /* ── 4. Page-load entrance for above-the-fold elements ── */
    function animateAboveFold() {
        var hero = document.querySelector('.hero-section, .hero-content, #hero');
        if (hero && !hero.dataset.crAnimated) {
            hero.dataset.crAnimated = '1';
            animateEl(hero, 'animate__fadeIn');
        }

        var mainH1 = document.querySelector('main h1, #main-content h1, .page-header h1, body > h1');
        if (mainH1 && !mainH1.dataset.crAnimated) {
            mainH1.dataset.crAnimated = '1';
            animateEl(mainH1, 'animate__fadeInDown', '0.1s');
        }
    }

    /* ── 5. Respects prefers-reduced-motion ── */
    function shouldAnimate() {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /* ── 6. Boot ── */
    function init() {
        injectAnimateCss();
        if (!shouldAnimate()) { return; }
        animateAboveFold();
        setupScrollReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
