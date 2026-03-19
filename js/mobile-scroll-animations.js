// RootIB: RB-20260319142113-8ACA297D
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
 * File: mobile-scroll-animations.js
 * Declaration ID: IP-1ADD5773-MLL28ZV5
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Mobile Scroll Animations
 * Adds subtle, attention-catching animations when scrolling on mobile devices
 * Uses Intersection Observer API for performance
 */

(function() {
    'use strict';

    // Only activate on mobile devices
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
        return; // Exit early on desktop
    }

    // Configuration
    const config = {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: '0px 0px -50px 0px' // Start slightly before element enters viewport
    };

    // Animation classes with subtle effects
    const animationClasses = {
        sectionTitle: 'animate-title-pulse',
        projectCard: 'animate-card-slide',
        textContent: 'animate-text-fade',
        heroContent: 'animate-hero-fade'
    };

    // Create and inject CSS animations
    const style = document.createElement('style');
    style.textContent = `
        /* Base state for animated elements */
        .animate-title-pulse,
        .animate-card-slide,
        .animate-text-fade,
        .animate-hero-fade {
            opacity: 0;
        }

        /* Section Title Animation - Subtle color pulse and fade in */
        @keyframes titlePulseIn {
            0% {
                opacity: 0;
                transform: translateY(20px);
                filter: brightness(0.7);
            }
            60% {
                filter: brightness(1.2);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
                filter: brightness(1);
            }
        }

        .animate-title-pulse.visible {
            animation: titlePulseIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            opacity: 1;
        }

        /* Project Card Animation - Gentle slide with color fade */
        @keyframes cardSlideIn {
            0% {
                opacity: 0;
                transform: translateX(-20px) scale(0.98);
                filter: brightness(0.8) saturate(0.8);
            }
            70% {
                filter: brightness(1.1) saturate(1.1);
            }
            100% {
                opacity: 1;
                transform: translateX(0) scale(1);
                filter: brightness(1) saturate(1);
            }
        }

        .animate-card-slide.visible {
            animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            opacity: 1;
        }

        /* Stagger animation for multiple cards */
        .animate-card-slide:nth-child(1).visible { animation-delay: 0s; }
        .animate-card-slide:nth-child(2).visible { animation-delay: 0.1s; }
        .animate-card-slide:nth-child(3).visible { animation-delay: 0.2s; }
        .animate-card-slide:nth-child(4).visible { animation-delay: 0.3s; }
        .animate-card-slide:nth-child(5).visible { animation-delay: 0.4s; }
        .animate-card-slide:nth-child(6).visible { animation-delay: 0.5s; }

        /* Text Content Animation - Subtle scale and fade */
        @keyframes textFadeIn {
            0% {
                opacity: 0;
                transform: scale(0.97);
                filter: blur(2px);
            }
            100% {
                opacity: 1;
                transform: scale(1);
                filter: blur(0);
            }
        }

        .animate-text-fade.visible {
            animation: textFadeIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            opacity: 1;
        }

        /* Hero Content Animation */
        @keyframes heroFadeIn {
            0% {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .animate-hero-fade.visible {
            animation: heroFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            opacity: 1;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
            .animate-title-pulse,
            .animate-card-slide,
            .animate-text-fade,
            .animate-hero-fade {
                animation: none !important;
                opacity: 1 !important;
                transform: none !important;
                filter: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    // Intersection Observer callback
    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }

    // Create observer instance
    const observer = new IntersectionObserver(handleIntersection, config);

    // Initialize animations when DOM is ready
    function initScrollAnimations() {
        // Animate section titles
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            if (!title.classList.contains('no-animate')) {
                title.classList.add(animationClasses.sectionTitle);
                observer.observe(title);
            }
        });

        // Animate project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            if (!card.classList.contains('no-animate')) {
                card.classList.add(animationClasses.projectCard);
                observer.observe(card);
            }
        });

        // Animate project descriptions (for extra attention)
        const projectDescs = document.querySelectorAll('.project-desc, .project-description');
        projectDescs.forEach(desc => {
            if (!desc.classList.contains('no-animate')) {
                desc.classList.add(animationClasses.textContent);
                observer.observe(desc);
            }
        });

        // Animate hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && !heroContent.classList.contains('no-animate')) {
            heroContent.classList.add(animationClasses.heroContent);
            // Hero should be visible immediately, so add visible class with slight delay
            setTimeout(() => {
                heroContent.classList.add('visible');
            }, 100);
        }

        // Animate stat cards if they exist
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            if (!card.classList.contains('no-animate')) {
                card.classList.add(animationClasses.projectCard);
                observer.observe(card);
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }

    // Re-check on window resize (if user rotates device)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const nowMobile = window.innerWidth <= 768;
            if (nowMobile && !isMobile) {
                location.reload(); // Reload if switching to mobile
            }
        }, 250);
    });

})();
