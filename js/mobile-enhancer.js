/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: mobile-enhancer.js
 * Declaration ID: IP-55A00748-MLL28ZV5
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * Mobile Enhancement Script
 * Automatically applies mobile-first enhancements to HTML pages
 * Professional, modern, touch-friendly interactions
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    cssPath: '/css/mobile-enhanced.css',
    enableAnimations: true,
    enableRipple: true,
    debug: false
  };

  /**
   * Initialize mobile enhancements
   */
  function init() {
    if (CONFIG.debug) console.log('🚀 Initializing mobile enhancements...');
    
    // Add mobile-enhanced class to body
    document.body.classList.add('mobile-enhanced');
    
    // Inject CSS if not already present
    injectCSS();
    
    // Enhance viewport meta tag
    enhanceViewport();
    
    // Add touch feedback to interactive elements
    if (CONFIG.enableRipple) {
      addTouchFeedback();
    }
    
    // Enhance tables for mobile
    enhanceTables();
    
    // Add animation classes on scroll
    if (CONFIG.enableAnimations) {
      addScrollAnimations();
    }
    
    // Improve touch target sizes
    improveTouchTargets();
    
    // Add safe area support
    addSafeAreaSupport();
    
    if (CONFIG.debug) console.log('✅ Mobile enhancements initialized');
  }

  /**
   * Inject mobile-enhanced CSS
   */
  function injectCSS() {
    // Check if CSS is already loaded
    const existingLink = document.querySelector('link[href*="mobile-enhanced.css"]');
    if (existingLink) {
      if (CONFIG.debug) console.log('CSS already loaded');
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CONFIG.cssPath;
    link.type = 'text/css';
    document.head.appendChild(link);
    
    if (CONFIG.debug) console.log('📝 Mobile-enhanced CSS injected');
  }

  /**
   * Enhance viewport meta tag
   */
  function enhanceViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    // Ensure proper mobile viewport settings
    const content = 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover';
    if (viewport.content !== content) {
      viewport.content = content;
      if (CONFIG.debug) console.log('📱 Viewport enhanced');
    }
  }

  /**
   * Add touch feedback to interactive elements
   */
  function addTouchFeedback() {
    const interactiveElements = document.querySelectorAll(
      'button:not(.no-enhance), .btn:not(.no-enhance), a:not(.no-enhance), input[type="button"]:not(.no-enhance), input[type="submit"]:not(.no-enhance)'
    );

    interactiveElements.forEach(element => {
      // Skip if already enhanced
      if (element.dataset.enhanced === 'true') return;
      
      element.addEventListener('touchstart', function(e) {
        this.style.transition = 'transform 0.1s ease';
        this.style.transform = 'scale(0.97)';
      }, { passive: true });

      element.addEventListener('touchend', function(e) {
        this.style.transform = 'scale(1)';
      }, { passive: true });

      element.addEventListener('touchcancel', function(e) {
        this.style.transform = 'scale(1)';
      }, { passive: true });
      
      element.dataset.enhanced = 'true';
    });
    
    if (CONFIG.debug) console.log(`✨ Touch feedback added to ${interactiveElements.length} elements`);
  }

  /**
   * Enhance tables for mobile viewing
   */
  function enhanceTables() {
    const tables = document.querySelectorAll('table:not(.no-enhance)');
    
    tables.forEach(table => {
      // Skip if already enhanced
      if (table.dataset.enhanced === 'true') return;
      
      // Add data-label attributes for mobile view
      const headers = table.querySelectorAll('thead th');
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
          if (headers[index]) {
            cell.setAttribute('data-label', headers[index].textContent);
          }
        });
      });
      
      table.dataset.enhanced = 'true';
    });
    
    if (CONFIG.debug) console.log(`📊 Enhanced ${tables.length} tables`);
  }

  /**
   * Add scroll animations
   */
  function addScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe cards and major sections
    const animatableElements = document.querySelectorAll(
      '.card:not(.no-enhance), [class*="card"]:not(.no-enhance), section:not(.no-enhance), .grid > *:not(.no-enhance)'
    );

    animatableElements.forEach(el => {
      if (!el.classList.contains('fade-in')) {
        observer.observe(el);
      }
    });
    
    if (CONFIG.debug) console.log(`🎬 Observing ${animatableElements.length} elements for animations`);
  }

  /**
   * Improve touch target sizes
   */
  function improveTouchTargets() {
    const smallElements = document.querySelectorAll(
      'button:not(.no-enhance), a:not(.no-enhance), input[type="button"]:not(.no-enhance), input[type="submit"]:not(.no-enhance)'
    );

    smallElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // WCAG minimum touch target size
      
      if (rect.width < minSize || rect.height < minSize) {
        const currentPadding = window.getComputedStyle(element).padding;
        if (currentPadding === '0px' || currentPadding === '0') {
          element.style.padding = '0.75rem 1rem';
        }
      }
    });
    
    if (CONFIG.debug) console.log('👆 Touch targets improved');
  }

  /**
   * Add safe area support for notched devices
   */
  function addSafeAreaSupport() {
    // Add theme-color meta tag if not present
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      themeColor.content = getComputedStyle(document.body).backgroundColor || '#0b1117';
      document.head.appendChild(themeColor);
    }
    
    // Add apple-mobile-web-app-capable if not present
    let appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleCapable) {
      appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      appleCapable.content = 'yes';
      document.head.appendChild(appleCapable);
    }
    
    // Add apple-mobile-web-app-status-bar-style
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      appleStatusBar = document.createElement('meta');
      appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
      appleStatusBar.content = 'black-translucent';
      document.head.appendChild(appleStatusBar);
    }
    
    if (CONFIG.debug) console.log('📱 Safe area support added');
  }

  /**
   * Add loading state helper
   */
  window.toggleLoading = function(element, isLoading) {
    if (isLoading) {
      element.classList.add('loading');
      element.disabled = true;
    } else {
      element.classList.remove('loading');
      element.disabled = false;
    }
  };

  /**
   * Add utility function for smooth scrolling
   */
  window.smoothScrollTo = function(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  };

  /**
   * Add utility function for showing toast notifications
   */
  window.showToast = function(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: mobile-enhanced-slideUp 0.3s ease-out;
      max-width: 90vw;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'mobile-enhanced-fadeIn 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  /**
   * Handle responsive images
   */
  function enhanceImages() {
    const images = document.querySelectorAll('img:not(.no-enhance):not([loading])');
    images.forEach(img => {
      img.loading = 'lazy';
    });
    
    if (CONFIG.debug) console.log(`🖼️  Enhanced ${images.length} images`);
  }

  /**
   * Add performance observer for slow interactions
   */
  function monitorPerformance() {
    if ('PerformanceObserver' in window && CONFIG.debug) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('⚠️  Slow interaction detected:', entry);
            }
          }
        });
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        // PerformanceObserver not fully supported
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      enhanceImages();
      monitorPerformance();
    });
  } else {
    init();
    enhanceImages();
    monitorPerformance();
  }

  // Re-enhance on dynamic content changes
  if ('MutationObserver' in window) {
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldReEnhance = false;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              shouldReEnhance = true;
            }
          });
        }
      });
      
      if (shouldReEnhance) {
        // Debounce re-enhancement
        clearTimeout(window.reEnhanceTimeout);
        window.reEnhanceTimeout = setTimeout(() => {
          if (CONFIG.enableRipple) addTouchFeedback();
          enhanceTables();
          improveTouchTargets();
          enhanceImages();
        }, 500);
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (CONFIG.debug) {
    console.log('🎯 Mobile Enhancement Script loaded');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🖥️  Viewport:', window.innerWidth, 'x', window.innerHeight);
  }

})();
