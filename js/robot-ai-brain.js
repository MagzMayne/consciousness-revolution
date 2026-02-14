/**
 * ARAYA Robot AI Brain
 * 
 * Advanced AI system for the robot assistant that provides:
 * - Page detection and tracking
 * - User exploration memory
 * - Tour guide functionality
 * - Interactive button clicking
 * - Contextual help and guidance
 */

(function() {
    'use strict';

    // Storage keys
    const STORAGE_KEYS = {
        visitedPages: 'araya_robot_visited_pages',
        userProfile: 'araya_robot_user_profile',
        tourProgress: 'araya_robot_tour_progress',
        lastInteraction: 'araya_robot_last_interaction'
    };

    // AI Brain State
    const brain = {
        allPages: [],
        visitedPages: new Set(),
        currentPage: window.location.pathname,
        userProfile: {
            firstVisit: null,
            totalVisits: 0,
            explorationScore: 0,
            preferences: {}
        },
        tourMode: false,
        currentTourStep: 0,
        tourSequence: [],
        isActive: true
    };

    // Speech bubble for robot communication
    let speechBubble = null;

    /**
     * Initialize the AI Brain
     */
    function init() {
        console.log('🧠 Initializing Robot AI Brain...');
        
        // Load persistent data
        loadMemory();
        
        // Discover all pages in the repository
        discoverPages();
        
        // Track current page visit
        trackPageVisit();
        
        // Create speech bubble UI
        createSpeechBubble();
        
        // Check if user needs a tour
        checkForTourOffer();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ Robot AI Brain initialized');
    }

    /**
     * Discover all HTML pages in the repository
     */
    async function discoverPages() {
        try {
            // Fetch the site map or parse navigation
            const response = await fetch('/SITE_MAP.md');
            if (response.ok) {
                const text = await response.text();
                // Parse markdown links
                const links = text.match(/\[.*?\]\((.*?\.html)\)/g);
                if (links) {
                    brain.allPages = links.map(link => {
                        const match = link.match(/\((.*?)\)/);
                        return match ? match[1] : null;
                    }).filter(Boolean);
                }
            }
        } catch (e) {
            // Fallback: scan for links on current page
            scanPageForLinks();
        }

        // Always scan current page for additional links
        scanPageForLinks();
        
        console.log(`📄 Discovered ${brain.allPages.length} pages`);
    }

    /**
     * Scan current page for HTML links
     */
    function scanPageForLinks() {
        const links = Array.from(document.querySelectorAll('a[href$=".html"]'));
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !brain.allPages.includes(href)) {
                brain.allPages.push(href);
            }
        });
    }

    /**
     * Track the current page visit
     */
    function trackPageVisit() {
        const currentPath = window.location.pathname;
        
        // Add to visited pages
        brain.visitedPages.add(currentPath);
        
        // Update user profile
        brain.userProfile.totalVisits++;
        brain.userProfile.explorationScore = 
            (brain.visitedPages.size / brain.allPages.length) * 100;
        
        // Save memory
        saveMemory();
        
        console.log(`📍 Page visit tracked: ${currentPath}`);
        console.log(`🎯 Exploration: ${brain.userProfile.explorationScore.toFixed(1)}%`);
    }

    /**
     * Create speech bubble UI for robot communication
     */
    function createSpeechBubble() {
        speechBubble = document.createElement('div');
        speechBubble.id = 'robot-speech-bubble';
        speechBubble.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 20px;
            max-width: 320px;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.95), rgba(147, 112, 219, 0.95));
            backdrop-filter: blur(10px);
            color: white;
            padding: 15px 20px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 240, 255, 0.4);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            z-index: 998;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
            display: none;
        `;
        
        // Add speech bubble tail
        const tail = document.createElement('div');
        tail.style.cssText = `
            position: absolute;
            bottom: -10px;
            left: 30px;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid rgba(147, 112, 219, 0.95);
        `;
        speechBubble.appendChild(tail);
        
        document.body.appendChild(speechBubble);
    }

    /**
     * Show speech bubble with message
     */
    function speak(message, duration = 5000) {
        if (!speechBubble) return;
        
        // Remove tail for new message
        const existingTail = speechBubble.querySelector('div');
        if (existingTail) {
            speechBubble.removeChild(existingTail);
        }
        
        speechBubble.innerHTML = message;
        
        // Re-add tail
        const tail = document.createElement('div');
        tail.style.cssText = `
            position: absolute;
            bottom: -10px;
            left: 30px;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid rgba(147, 112, 219, 0.95);
        `;
        speechBubble.appendChild(tail);
        
        speechBubble.style.display = 'block';
        setTimeout(() => {
            speechBubble.style.opacity = '1';
            speechBubble.style.transform = 'translateY(0)';
        }, 10);
        
        // Set robot to speaking state
        if (window.RobotAssistant) {
            window.RobotAssistant.setAnimationState('speaking');
            window.RobotAssistant.setAction('Helping you...');
        }
        
        // Hide after duration
        setTimeout(() => {
            hideSpeechBubble();
        }, duration);
    }

    /**
     * Hide speech bubble
     */
    function hideSpeechBubble() {
        if (!speechBubble) return;
        
        speechBubble.style.opacity = '0';
        speechBubble.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            speechBubble.style.display = 'none';
        }, 300);
        
        // Set robot to idle
        if (window.RobotAssistant) {
            window.RobotAssistant.setAnimationState('idle');
        }
    }

    /**
     * Check if user needs a tour offer
     */
    function checkForTourOffer() {
        // Get unvisited pages
        const unvisitedPages = brain.allPages.filter(
            page => !brain.visitedPages.has(page)
        );
        
        // If there are new pages and it's been a while since last interaction
        const lastInteraction = localStorage.getItem(STORAGE_KEYS.lastInteraction);
        const timeSinceInteraction = lastInteraction 
            ? Date.now() - parseInt(lastInteraction) 
            : Infinity;
        
        // Offer tour if:
        // 1. First time visitor (< 5 pages visited)
        // 2. OR new pages available and hasn't seen tour in 24h
        const shouldOfferTour = 
            brain.visitedPages.size < 5 || 
            (unvisitedPages.length > 0 && timeSinceInteraction > 86400000);
        
        if (shouldOfferTour) {
            setTimeout(() => offerTour(unvisitedPages), 3000);
        }
    }

    /**
     * Offer a tour to the user
     */
    function offerTour(unvisitedPages) {
        const messages = [
            `👋 Hey there! I noticed you haven't explored ${unvisitedPages.length} pages yet. Want me to give you a tour?`,
            `🎯 Welcome! We have some amazing features across ${brain.allPages.length} pages. Let me show you around!`,
            `✨ I see you're new here! I can guide you through all the consciousness-enhancing tools we have. Interested?`
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Create interactive tour offer
        const tourOffer = `
            <div>
                <p>${message}</p>
                <div style="margin-top: 10px;">
                    <button onclick="window.RobotAI.startTour()" style="
                        background: white;
                        color: #9370db;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 5px;
                        margin-right: 8px;
                        cursor: pointer;
                        font-weight: bold;
                    ">Yes, show me! 🚀</button>
                    <button onclick="window.RobotAI.dismissTour()" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Maybe later</button>
                </div>
            </div>
        `;
        
        speak(tourOffer, 15000);
        speechBubble.style.pointerEvents = 'auto';
        
        // Update last interaction time
        localStorage.setItem(STORAGE_KEYS.lastInteraction, Date.now().toString());
    }

    /**
     * Start the guided tour
     */
    function startTour() {
        brain.tourMode = true;
        brain.currentTourStep = 0;
        
        // Build tour sequence based on page categories
        brain.tourSequence = buildTourSequence();
        
        hideSpeechBubble();
        
        setTimeout(() => {
            speak(`🎉 Awesome! Let's start the tour. I'll walk you through the key features...`, 3000);
            
            setTimeout(() => {
                nextTourStep();
            }, 3500);
        }, 500);
        
        saveMemory();
    }

    /**
     * Build intelligent tour sequence
     */
    function buildTourSequence() {
        const keyPages = [
            { path: '/index.html', description: 'Main Dashboard - Your central hub' },
            { path: '/araya-chat.html', description: 'ARAYA Chat - AI consciousness assistant' },
            { path: '/COMMAND_CENTER_WITH_ARAYA.html', description: 'Command Center - Control everything' },
            { path: '/CONSCIOUSNESS_DASHBOARD.html', description: 'Consciousness Tools - Track your growth' },
            { path: '/robot-test.html', description: 'Robot Test - See what I can do!' }
        ];
        
        // Filter to only include pages that exist in discovered pages
        return keyPages.filter(page => 
            brain.allPages.includes(page.path) || 
            brain.allPages.includes(page.path.substring(1))
        );
    }

    /**
     * Navigate to next tour step
     */
    function nextTourStep() {
        if (brain.currentTourStep >= brain.tourSequence.length) {
            completeTour();
            return;
        }
        
        const step = brain.tourSequence[brain.currentTourStep];
        
        speak(`📍 Step ${brain.currentTourStep + 1}/${brain.tourSequence.length}: ${step.description}`, 4000);
        
        // Move robot to a button or link
        const link = document.querySelector(`a[href="${step.path}"], a[href=".${step.path}"]`);
        if (link) {
            highlightElement(link);
            
            setTimeout(() => {
                // Navigate to the page
                window.location.href = step.path;
            }, 4500);
        } else {
            brain.currentTourStep++;
            nextTourStep();
        }
        
        saveMemory();
    }

    /**
     * Complete the tour
     */
    function completeTour() {
        brain.tourMode = false;
        brain.currentTourStep = 0;
        
        speak(`🎊 Tour complete! You're now familiar with the main features. I'm always here if you need help navigating!`, 6000);
        
        saveMemory();
    }

    /**
     * Dismiss tour offer
     */
    function dismissTour() {
        hideSpeechBubble();
        speak(`👍 No problem! I'll be here if you change your mind. Just click on me anytime!`, 4000);
    }

    /**
     * Highlight an element on the page
     */
    function highlightElement(element) {
        const rect = element.getBoundingClientRect();
        
        // Move robot to element
        if (window.RobotAssistant) {
            window.RobotAssistant.moveTo(
                rect.left + rect.width / 2,
                window.innerHeight - rect.top - rect.height / 2
            );
        }
        
        // Add highlight effect
        element.style.outline = '3px solid #00f0ff';
        element.style.outlineOffset = '4px';
        element.style.transition = 'outline 0.3s';
        
        setTimeout(() => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        }, 4000);
    }

    /**
     * Follow the cursor
     */
    function followCursor(e) {
        if (brain.tourMode) return; // Don't follow during tour
        
        const x = e.clientX;
        const y = window.innerHeight - e.clientY;
        
        // Only follow if robot is not busy
        if (window.RobotAssistant) {
            const state = window.RobotAssistant.getState();
            if (state.animationState === 'idle') {
                window.RobotAssistant.moveTo(x - 40, y - 40);
            }
        }
    }

    /**
     * Detect and suggest clickable elements
     */
    function detectInteractiveElements() {
        const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"]'));
        const links = Array.from(document.querySelectorAll('a[href]'));
        
        return [...buttons, ...links].filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
    }

    /**
     * Provide contextual help based on current page
     */
    function provideContextualHelp() {
        const path = window.location.pathname;
        const helpMessages = {
            '/index.html': '🏠 This is your main dashboard. From here, you can access all features!',
            '/araya-chat.html': '💬 Talk to ARAYA here - your AI consciousness companion.',
            '/robot-test.html': '🤖 This is where you can test my capabilities!',
            '/CONSCIOUSNESS_DASHBOARD.html': '🧠 Track your consciousness growth and patterns here.'
        };
        
        const message = helpMessages[path] || 
            '🌟 Explore this page! Click around and discover what it offers.';
        
        speak(message, 5000);
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Cursor following (throttled)
        let followTimeout;
        document.addEventListener('mousemove', (e) => {
            clearTimeout(followTimeout);
            followTimeout = setTimeout(() => followCursor(e), 200);
        });
        
        // Detect page changes (for SPAs)
        let lastPath = window.location.pathname;
        setInterval(() => {
            if (window.location.pathname !== lastPath) {
                lastPath = window.location.pathname;
                brain.currentPage = lastPath;
                trackPageVisit();
                provideContextualHelp();
            }
        }, 1000);
        
        // Robot click handler
        const robotContainer = document.getElementById('robot-assistant-container');
        if (robotContainer) {
            robotContainer.style.pointerEvents = 'auto';
            robotContainer.addEventListener('click', () => {
                provideContextualHelp();
            });
        }
    }

    /**
     * Save memory to localStorage
     */
    function saveMemory() {
        try {
            localStorage.setItem(
                STORAGE_KEYS.visitedPages, 
                JSON.stringify(Array.from(brain.visitedPages))
            );
            localStorage.setItem(
                STORAGE_KEYS.userProfile, 
                JSON.stringify(brain.userProfile)
            );
            localStorage.setItem(
                STORAGE_KEYS.tourProgress, 
                JSON.stringify({
                    tourMode: brain.tourMode,
                    currentTourStep: brain.currentTourStep
                })
            );
        } catch (e) {
            console.warn('Failed to save robot memory:', e);
        }
    }

    /**
     * Load memory from localStorage
     */
    function loadMemory() {
        try {
            // Load visited pages
            const visitedPages = localStorage.getItem(STORAGE_KEYS.visitedPages);
            if (visitedPages) {
                brain.visitedPages = new Set(JSON.parse(visitedPages));
            }
            
            // Load user profile
            const userProfile = localStorage.getItem(STORAGE_KEYS.userProfile);
            if (userProfile) {
                brain.userProfile = { ...brain.userProfile, ...JSON.parse(userProfile) };
            } else {
                brain.userProfile.firstVisit = Date.now();
            }
            
            // Load tour progress
            const tourProgress = localStorage.getItem(STORAGE_KEYS.tourProgress);
            if (tourProgress) {
                const progress = JSON.parse(tourProgress);
                brain.tourMode = progress.tourMode || false;
                brain.currentTourStep = progress.currentTourStep || 0;
            }
        } catch (e) {
            console.warn('Failed to load robot memory:', e);
        }
    }

    /**
     * Public API
     */
    window.RobotAI = {
        init,
        speak,
        startTour,
        dismissTour,
        provideContextualHelp,
        getExplorationScore: () => brain.userProfile.explorationScore,
        getVisitedPages: () => Array.from(brain.visitedPages),
        getAllPages: () => brain.allPages,
        brain
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
