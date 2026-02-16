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
    
    // Configuration constants
    const CONFIG = {
        MAX_TOUR_ELEMENTS: 10,          // Maximum elements to tour per page
        MAX_ELEMENT_TEXT_LENGTH: 50,    // Maximum text length for element descriptions
        MAX_SCRIPTS_THRESHOLD: 20,      // Threshold for performance warnings
        TOUR_ELEMENT_DELAY: 7000,       // Delay between tour elements (ms) - increased for readability
        SPEECH_DURATION: 8000,          // Default speech bubble duration (ms) - increased
        ERROR_CHECK_DELAY: 3500,        // Delay for error checking animation (ms)
        HELP_ACTIVATION_DELAY: 3500,    // Delay for help system activation (ms)
        TYPING_SPEED: 30,               // Characters per second for typing animation
        BUBBLE_MAX_WIDTH: 450,          // Maximum width of speech bubble in pixels (increased)
        BUBBLE_DEFAULT_HEIGHT: 150,     // Default height estimate for speech bubble
        WALK_TO_ELEMENT_OFFSET: 20,     // Offset when walking to elements
        BOUNDARY_PADDING: 50,           // Safe padding from screen edges
        ROBOT_TO_ELEMENT_DISTANCE: 150, // Distance robot maintains from elements
        SAFE_BOUNDARY_WIDTH: 200,       // Safe width from right edge
        SAFE_BOUNDARY_HEIGHT: 100,      // Safe height from top/bottom edges
        BUBBLE_OFFSET_FROM_ROBOT: 100,  // Distance bubble appears above robot
        SCROLL_VISIBILITY_MARGIN: 50    // Margin for scroll visibility checks
    };
    
    /**
     * Helper function to clamp a value between min and max bounds
     */
    function clampToBounds(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

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
    let bubblePositionUpdaterInterval = null;
    let typingTimeout = null;
    let isTyping = false;
    
    // Button menu for robot interaction
    let buttonMenu = null;
    let isMenuOpen = false;
    
    // End tour button
    let endTourButton = null;

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
        
        // Create interactive button menu
        createButtonMenu();
        
        // Create end tour button
        createEndTourButton();
        
        // Check if tour was active and resume it
        if (brain.tourMode) {
            console.log('🔄 Resuming active tour...');
            setTimeout(() => resumeTour(), 2000);
        } else {
            // Check if user needs a tour
            checkForTourOffer();
        }
        
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
        
        // Calculate responsive width
        const isMobile = window.innerWidth <= 600;
        const maxWidth = isMobile ? Math.min(window.innerWidth - 40, 350) : CONFIG.BUBBLE_MAX_WIDTH;
        
        speechBubble.style.cssText = `
            position: fixed;
            max-width: ${maxWidth}px;
            min-width: ${isMobile ? '200px' : '250px'};
            width: ${isMobile ? 'calc(100vw - 40px)' : 'auto'};
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.95), rgba(147, 112, 219, 0.95));
            backdrop-filter: blur(10px);
            color: white;
            padding: ${isMobile ? '15px 18px' : '20px 25px'};
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 240, 255, 0.4);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: ${isMobile ? '14px' : '15px'};
            line-height: 1.6;
            z-index: 998;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s, left 0.3s, bottom 0.3s;
            pointer-events: none;
            display: none;
            box-sizing: border-box;
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
        
        // Update on window resize
        window.addEventListener('resize', () => {
            const isMobileNow = window.innerWidth <= 600;
            const newMaxWidth = isMobileNow ? Math.min(window.innerWidth - 40, 350) : CONFIG.BUBBLE_MAX_WIDTH;
            speechBubble.style.maxWidth = `${newMaxWidth}px`;
            speechBubble.style.minWidth = isMobileNow ? '200px' : '250px';
            speechBubble.style.width = isMobileNow ? 'calc(100vw - 40px)' : 'auto';
            speechBubble.style.padding = isMobileNow ? '15px 18px' : '20px 25px';
            speechBubble.style.fontSize = isMobileNow ? '14px' : '15px';
        });
        
        // Start position update loop to keep bubble above robot
        startBubblePositionUpdater();
    }
    
    /**
     * Create interactive button menu for robot
     */
    function createButtonMenu() {
        buttonMenu = document.createElement('div');
        buttonMenu.id = 'robot-button-menu';
        buttonMenu.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 20px;
            background: linear-gradient(135deg, rgba(147, 112, 219, 0.95), rgba(0, 240, 255, 0.95));
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 999;
            opacity: 0;
            transform: scale(0.8) translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
            display: none;
            min-width: 200px;
        `;
        
        buttonMenu.innerHTML = `
            <div style="margin-bottom: 12px; font-weight: bold; color: white; font-size: 16px; text-align: center;">
                🤖 R3-D3 Menu
            </div>
            <button class="robot-menu-btn" data-action="tour" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                background: white;
                color: #9370db;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            ">🚀 Tour Site</button>
            
            <button class="robot-menu-btn" data-action="help" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                background: white;
                color: #9370db;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            ">💡 Help Me</button>
            
            <button class="robot-menu-btn" data-action="check-errors" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                background: white;
                color: #9370db;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            ">🔍 Check Errors</button>
            
            <button class="robot-menu-btn" data-action="fix-issues" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                background: white;
                color: #9370db;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            ">🔧 Fix Issues</button>
            
            <button class="robot-menu-btn" data-action="knowledge" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                background: white;
                color: #9370db;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            ">📚 Knowledge Base</button>
            
            <button class="robot-menu-btn" data-action="settings" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                background: rgba(255, 255, 255, 0.8);
                color: #9370db;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            ">⚙️ Settings</button>
            
            <button class="robot-menu-btn" data-action="demo-all" style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #ffd700, #ff8c00);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
            ">✨ Show All Features</button>
        `;
        
        // Add hover effects
        const style = document.createElement('style');
        style.textContent = `
            .robot-menu-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            .robot-menu-btn:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
        
        // Add button event listeners
        buttonMenu.querySelectorAll('.robot-menu-btn').forEach(btn => {
            btn.addEventListener('click', handleMenuAction);
        });
        
        document.body.appendChild(buttonMenu);
    }
    
    /**
     * Toggle button menu visibility
     */
    function toggleButtonMenu() {
        if (!buttonMenu) return;
        
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            buttonMenu.style.display = 'block';
            buttonMenu.style.pointerEvents = 'auto';
            setTimeout(() => {
                buttonMenu.style.opacity = '1';
                buttonMenu.style.transform = 'scale(1) translateY(0)';
            }, 10);
        } else {
            buttonMenu.style.opacity = '0';
            buttonMenu.style.transform = 'scale(0.8) translateY(20px)';
            setTimeout(() => {
                buttonMenu.style.display = 'none';
                buttonMenu.style.pointerEvents = 'none';
            }, 300);
        }
    }
    
    /**
     * Handle menu button actions
     */
    function handleMenuAction(event) {
        const action = event.target.dataset.action;
        
        // Close menu
        toggleButtonMenu();
        
        // Perform action
        switch(action) {
            case 'tour':
                startEnhancedTour();
                break;
            case 'help':
                provideDeveloperHelp();
                break;
            case 'check-errors':
                checkForErrors();
                break;
            case 'fix-issues':
                autoFixIssues();
                break;
            case 'knowledge':
                showKnowledgeBase();
                break;
            case 'settings':
                showSettings();
                break;
            case 'demo-all':
                demonstrateAllFeatures();
                break;
        }
    }
    
    /**
     * Create end tour button
     */
    function createEndTourButton() {
        endTourButton = document.createElement('button');
        endTourButton.id = 'end-tour-button';
        endTourButton.textContent = '❌ End Tour';
        endTourButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff4444, #cc0000);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4);
            z-index: 10000;
            transition: all 0.3s ease;
            display: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Add hover effect
        endTourButton.addEventListener('mouseenter', () => {
            endTourButton.style.transform = 'scale(1.05)';
            endTourButton.style.boxShadow = '0 6px 20px rgba(255, 68, 68, 0.6)';
        });
        
        endTourButton.addEventListener('mouseleave', () => {
            endTourButton.style.transform = 'scale(1)';
            endTourButton.style.boxShadow = '0 4px 15px rgba(255, 68, 68, 0.4)';
        });
        
        // Add click handler
        endTourButton.addEventListener('click', () => {
            endTour();
        });
        
        document.body.appendChild(endTourButton);
    }
    
    /**
     * Show end tour button
     */
    function showEndTourButton() {
        if (endTourButton) {
            endTourButton.style.display = 'block';
            setTimeout(() => {
                endTourButton.style.opacity = '1';
            }, 10);
        }
    }
    
    /**
     * Hide end tour button
     */
    function hideEndTourButton() {
        if (endTourButton) {
            endTourButton.style.opacity = '0';
            setTimeout(() => {
                endTourButton.style.display = 'none';
            }, 300);
        }
    }
    
    /**
     * Resume tour after page navigation
     */
    function resumeTour() {
        console.log('🔄 Resuming tour on new page...');
        
        // Show end tour button
        showEndTourButton();
        
        // Resume the interactive tour
        speak(`✨ I'm continuing the tour on this page! Let me show you what's here...`, 4000);
        
        setTimeout(() => {
            performInteractiveTour();
        }, 5000);
    }
    
    /**
     * Update speech bubble position to be above robot's head
     */
    function updateSpeechBubblePosition() {
        if (!speechBubble || !window.RobotAssistant) return;
        
        const state = window.RobotAssistant.getState();
        if (!state || !state.position) return;
        
        // Position bubble above robot's head (robot size is 80px)
        const robotSize = window.RobotAssistant.config?.robotSize || 80;
        
        // Calculate initial position: above the robot
        let left = state.position.x;
        let bottom = window.innerHeight - state.position.y + CONFIG.BUBBLE_OFFSET_FROM_ROBOT;
        
        // Get bubble dimensions (need to account for max-width)
        const bubbleWidth = Math.min(CONFIG.BUBBLE_MAX_WIDTH, speechBubble.offsetWidth || CONFIG.BUBBLE_MAX_WIDTH);
        const bubbleHeight = speechBubble.offsetHeight || 150;
        
        // Prevent bubble from going off left edge
        if (left < 10) {
            left = 10;
        }
        
        // Prevent bubble from going off right edge
        if (left + bubbleWidth > window.innerWidth - 10) {
            left = window.innerWidth - bubbleWidth - 10;
        }
        
        // Prevent bubble from going off top edge
        const topPosition = window.innerHeight - bottom;
        if (topPosition < 10) {
            bottom = window.innerHeight - bubbleHeight - 10;
        }
        
        // Prevent bubble from going off bottom edge
        if (bottom < 10) {
            // Position below robot instead
            bottom = state.position.y - robotSize - 20;
        }
        
        speechBubble.style.left = `${left}px`;
        speechBubble.style.bottom = `${bottom}px`;
    }
    
    /**
     * Start continuous position updater for speech bubble
     */
    function startBubblePositionUpdater() {
        // Clear any existing interval to prevent multiple intervals
        if (bubblePositionUpdaterInterval) {
            clearInterval(bubblePositionUpdaterInterval);
        }
        
        // Update position every 100ms to keep bubble above robot as it moves
        bubblePositionUpdaterInterval = setInterval(() => {
            if (speechBubble && speechBubble.style.display !== 'none') {
                updateSpeechBubblePosition();
            }
        }, 100);
    }

    /**
     * Show speech bubble with message (with typing animation)
     */
    function speak(message, duration = 8000, enableTyping = true) {
        if (!speechBubble) return;
        
        // Clear any existing typing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
        
        // Remove tail for new message
        const existingTail = speechBubble.querySelector('div');
        if (existingTail) {
            speechBubble.removeChild(existingTail);
        }
        
        // Update position to be above robot before showing
        updateSpeechBubblePosition();
        
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
        
        if (enableTyping) {
            // Typing animation
            isTyping = true;
            typeText(message, 0, () => {
                isTyping = false;
                // Re-add tail after typing completes
                addSpeechBubbleTail();
                
                // Hide after duration
                typingTimeout = setTimeout(() => {
                    hideSpeechBubble();
                }, duration);
            });
        } else {
            // Show immediately without typing
            speechBubble.innerHTML = message;
            addSpeechBubbleTail();
            
            // Hide after duration
            typingTimeout = setTimeout(() => {
                hideSpeechBubble();
            }, duration);
        }
    }
    
    /**
     * Type text character by character
     */
    function typeText(html, index, callback) {
        if (!speechBubble || index >= html.length) {
            if (callback) callback();
            return;
        }
        
        // Handle HTML tags properly
        const remainingText = html.substring(index);
        let nextIndex = index + 1;
        
        // If we hit an HTML tag, skip to the end of it
        if (remainingText.startsWith('<')) {
            const closeTagIndex = remainingText.indexOf('>');
            if (closeTagIndex !== -1) {
                nextIndex = index + closeTagIndex + 1;
            }
        }
        
        // Update the text
        speechBubble.innerHTML = html.substring(0, nextIndex);
        
        // Calculate delay based on typing speed (ms per character)
        const delay = 1000 / CONFIG.TYPING_SPEED;
        
        typingTimeout = setTimeout(() => {
            typeText(html, nextIndex, callback);
        }, delay);
    }
    
    /**
     * Add tail to speech bubble
     */
    function addSpeechBubbleTail() {
        if (!speechBubble) return;
        
        // Remove existing tail first
        const existingTail = speechBubble.querySelector('.speech-tail');
        if (existingTail) {
            existingTail.remove();
        }
        
        const tail = document.createElement('div');
        tail.className = 'speech-tail';
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
                <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="window.RobotAI.startTour()" style="
                        flex: 1 1 120px;
                        min-width: 120px;
                        background: white;
                        color: #9370db;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 14px;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                    ">Yes, show me! 🚀</button>
                    <button onclick="window.RobotAI.dismissTour()" style="
                        flex: 1 1 120px;
                        min-width: 120px;
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
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
        // Use enhanced tour instead of multi-page navigation
        startEnhancedTour();
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
        
        speak(`🎊 Tour complete! You're now familiar with the main features. I'm always here if you need help navigating!`, 10000);
        
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
     * Enhanced autonomous tour with element description
     */
    function startEnhancedTour() {
        brain.tourMode = true;
        brain.currentTourStep = 0;
        
        hideSpeechBubble();
        
        setTimeout(() => {
            speak(`🚀 Starting comprehensive site tour! I'll navigate through the site and describe everything I find...`, 4000);
            
            if (window.RobotAssistant) {
                window.RobotAssistant.setAnimationState('thinking');
            }
            
            setTimeout(() => {
                performAutonomousTour();
            }, 4500);
        }, 500);
        
        saveMemory();
    }
    
    /**
     * Perform autonomous tour - navigate and describe elements
     */
    async function performAutonomousTour() {
        const elements = detectInteractiveElements();
        
        if (elements.length === 0) {
            speak(`🤔 Hmm, I don't see many interactive elements on this page. Let me navigate to another page...`, 4000);
            // Try to navigate to a different page
            const links = Array.from(document.querySelectorAll('a[href]')).filter(a => {
                const href = a.getAttribute('href');
                return href && href.endsWith('.html') && !href.startsWith('http');
            });
            
            if (links.length > 0) {
                const randomLink = links[Math.floor(Math.random() * links.length)];
                walkToElement(randomLink, () => {
                    highlightElement(randomLink);
                    speak(`📍 Navigating to: ${randomLink.textContent || 'Next page'}`, 2000);
                    setTimeout(() => {
                        window.location.href = randomLink.getAttribute('href');
                    }, 2500);
                });
            } else {
                endTour();
            }
            return;
        }
        
        speak(`✨ I found ${elements.length} interactive elements on this page! Let me show you with fly mode activated...`, 5000);
        
        // Tour through elements
        let currentIndex = 0;
        
        function tourNextElement() {
            if (currentIndex >= Math.min(elements.length, CONFIG.MAX_TOUR_ELEMENTS)) {
                speak(`🎉 Tour of this page complete! Click me to see more options or navigate to another page.`, 10000);
                if (window.RobotAssistant) {
                    window.RobotAssistant.setAnimationState('idle');
                }
                endTour();
                return;
            }
            
            const element = elements[currentIndex];
            
            // Walk to element with fly mode
            walkToElement(element, () => {
                // Highlight the element
                highlightElement(element);
                
                // Describe the element
                const description = describeElement(element);
                speak(description, 5000);
                
                currentIndex++;
                setTimeout(tourNextElement, CONFIG.TOUR_ELEMENT_DELAY);
            });
        }
        
        setTimeout(tourNextElement, 5500);
    }
    
    /**
     * Describe an interactive element
     */
    function describeElement(element) {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.trim().substring(0, CONFIG.MAX_ELEMENT_TEXT_LENGTH) || 'element';
        const href = element.getAttribute('href');
        const type = element.getAttribute('type');
        
        if (tagName === 'a' && href) {
            return `🔗 Link: "${text}" - Takes you to ${href}`;
        } else if (tagName === 'button') {
            if (type === 'submit') {
                return `✅ Submit button: "${text}" - Submits form data`;
            }
            return `🔘 Button: "${text}" - Performs an action when clicked`;
        } else if (element.role === 'button') {
            return `🔘 Interactive element: "${text}" - Acts as a button`;
        } else if (tagName === 'input') {
            return `📝 Input field: Type ${type || 'text'} - User enters ${type || 'text'} here`;
        }
        
        return `✨ Interactive: "${text}"`;
    }
    
    /**
     * Provide developer help based on current context
     */
    function provideDeveloperHelp() {
        speak(`💡 Developer Help Mode activated! I can help you with your current task.`, 3000);
        
        setTimeout(() => {
            const context = analyzePageContext();
            const helpMessage = generateContextualHelp(context);
            
            speak(helpMessage, 8000);
            
            // Enable Q&A mode
            enableQAMode();
        }, 3500);
    }
    
    /**
     * Analyze page context to understand what developer is working on
     */
    function analyzePageContext() {
        const path = window.location.pathname;
        const title = document.title;
        const hasForm = document.querySelector('form') !== null;
        const hasCanvas = document.querySelector('canvas') !== null;
        const hasCodeBlocks = document.querySelector('pre, code') !== null;
        const buttons = document.querySelectorAll('button').length;
        const inputs = document.querySelectorAll('input, textarea, select').length;
        
        return {
            path,
            title,
            hasForm,
            hasCanvas,
            hasCodeBlocks,
            buttonCount: buttons,
            inputCount: inputs,
            pageType: determinePageType(path, title)
        };
    }
    
    /**
     * Determine what type of page this is
     */
    function determinePageType(path, title) {
        const lowercasePath = path.toLowerCase();
        const lowercaseTitle = title.toLowerCase();
        
        if (lowercasePath.includes('dashboard') || lowercaseTitle.includes('dashboard')) {
            return 'dashboard';
        } else if (lowercasePath.includes('admin') || lowercaseTitle.includes('admin')) {
            return 'admin';
        } else if (lowercasePath.includes('login') || lowercasePath.includes('signup')) {
            return 'auth';
        } else if (lowercasePath.includes('test') || lowercaseTitle.includes('test')) {
            return 'testing';
        } else if (lowercasePath.includes('araya') || lowercaseTitle.includes('araya')) {
            return 'araya';
        } else if (lowercasePath === '/' || lowercasePath.includes('index')) {
            return 'home';
        }
        
        return 'general';
    }
    
    /**
     * Generate contextual help message
     */
    function generateContextualHelp(context) {
        const helpMap = {
            'dashboard': `📊 You're on a dashboard page. I can help you:\n• Understand the metrics displayed\n• Navigate to specific sections\n• Test interactive widgets\n• Debug data visualization issues`,
            'admin': `🔐 You're on an admin page. I can help you:\n• Test access controls\n• Verify admin functions\n• Check permission systems\n• Navigate admin features`,
            'auth': `🔑 You're on an authentication page. I can help you:\n• Test login/signup flows\n• Verify form validation\n• Check error handling\n• Test password requirements`,
            'testing': `🧪 You're on a test page. I can help you:\n• Run through test scenarios\n• Verify functionality\n• Check console for errors\n• Test all interactive elements`,
            'araya': `🤖 You're on an ARAYA page. I can help you:\n• Test AI interactions\n• Verify ARAYA connections\n• Check file system access\n• Test autonomous features`,
            'home': `🏠 You're on the home page. I can help you:\n• Navigate to any section\n• Test main features\n• Check responsive design\n• Verify all links work`,
            'general': `💡 I can help you with:\n• Testing interactive elements\n• Checking for errors\n• Navigating the site\n• Understanding functionality`
        };
        
        let help = helpMap[context.pageType] || helpMap['general'];
        
        if (context.hasForm) {
            help += `\n\n📝 I notice there's a form on this page. I can help test it!`;
        }
        
        if (context.buttonCount > 5) {
            help += `\n\n🔘 Found ${context.buttonCount} buttons - I can test them all!`;
        }
        
        return help;
    }
    
    /**
     * Enable Q&A mode for developer questions
     */
    function enableQAMode() {
        // Create Q&A interface
        const qaInterface = document.createElement('div');
        qaInterface.id = 'robot-qa-interface';
        qaInterface.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 20px;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.95), rgba(147, 112, 219, 0.95));
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 999;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        qaInterface.innerHTML = `
            <div style="color: white; margin-bottom: 15px;">
                <strong>🤖 Ask R3-D3 a Question</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    float: right;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                ">×</button>
            </div>
            <textarea id="robot-question-input" placeholder="Ask me anything about this project..." style="
                width: 100%;
                min-height: 80px;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-family: inherit;
                resize: vertical;
                margin-bottom: 10px;
            "></textarea>
            <button onclick="window.RobotAI.answerQuestion()" style="
                width: 100%;
                padding: 12px;
                background: white;
                color: #9370db;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            ">Ask Question 💬</button>
        `;
        
        document.body.appendChild(qaInterface);
    }
    
    /**
     * Answer user's question using ARYA knowledge
     */
    async function answerQuestion() {
        const input = document.getElementById('robot-question-input');
        if (!input) return;
        
        const question = input.value.trim();
        if (!question) {
            speak(`❓ Please enter a question first!`, 3000);
            return;
        }
        
        speak(`🤔 Let me think about that...`, 2000);
        
        if (window.RobotAssistant) {
            window.RobotAssistant.setAnimationState('thinking');
        }
        
        // Analyze question and provide answer based on context
        setTimeout(() => {
            const answer = generateAnswer(question);
            speak(answer, 8000);
            
            if (window.RobotAssistant) {
                window.RobotAssistant.setAnimationState('speaking');
            }
        }, 2500);
    }
    
    /**
     * Generate answer to question based on repository knowledge
     */
    function generateAnswer(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Pattern recognition knowledge
        if (lowerQuestion.includes('pattern') || lowerQuestion.includes('detect')) {
            return `🎯 Pattern detection is core to this platform! We have:\n• Love bombing detector\n• Gaslighting analyzer\n• Manipulation immunity tracker\n• And 30+ other pattern detection tools\n\nAll tools help users recognize psychological patterns. Check the /consciousness-tools.html page!`;
        }
        
        // ARAYA knowledge
        if (lowerQuestion.includes('araya') || lowerQuestion.includes('ai')) {
            return `🤖 ARAYA is our AI consciousness assistant! It includes:\n• ARAYA Bridge - Natural language interface\n• File Writer - Autonomous file editing\n• Brain System - Context-aware AI\n• Chat Interface - Interactive conversations\n\nI'm connected to ARAYA and can edit files autonomously!`;
        }
        
        // Seven domains knowledge
        if (lowerQuestion.includes('domain') || lowerQuestion.includes('seven')) {
            return `📊 The Seven Domains framework:\n1. Command - Clarity & decisions\n2. Creation - Building & projects\n3. Connection - Relationships\n4. Peace - Security & boundaries\n5. Abundance - Financial growth\n6. Wisdom - Learning & research\n7. Purpose - Meaning & integration\n\nEvery tool aligns with these domains!`;
        }
        
        // Architecture knowledge
        if (lowerQuestion.includes('architect') || lowerQuestion.includes('structure')) {
            return `🏗️ Platform architecture:\n• Multi-page HTML tools (49+ pages)\n• Python automation (CYCLOTRON, ARAYA)\n• Netlify Functions (serverless API)\n• Supabase database (PostgreSQL)\n• Node.js v18+ runtime\n\nCheck ARCHITECTURE.md for full details!`;
        }
        
        // Testing knowledge
        if (lowerQuestion.includes('test') || lowerQuestion.includes('debug')) {
            return `🧪 Testing approach:\n• FUNCTIONALITY_TEST_SUITE.py for Python\n• Manual HTML testing in browsers\n• Netlify dev for local testing\n• GitHub Actions for CI/CD\n\nI can help you test any feature - just ask!`;
        }
        
        // Robot features
        if (lowerQuestion.includes('r3-d3') || lowerQuestion.includes('robot') || lowerQuestion.includes('you')) {
            return `🤖 I'm R3-D3! I can:\n• Give autonomous site tours\n• Help developers with tasks\n• Check for errors and fix them\n• Navigate through pages\n• Edit files (with permission)\n• Answer questions about the project\n\nLinked with ARAYA, I know everything in this repo!`;
        }
        
        // Default response
        return `💡 Great question! Based on the current page context, I suggest:\n• Check the relevant documentation\n• Look in the /docs folder\n• Search SITE_MAP.md for related pages\n• Ask me more specific questions\n\nI'm learning about this project through ARAYA's knowledge base!`;
    }
    
    /**
     * Check for errors on current page
     */
    function checkForErrors() {
        speak(`🔍 Running comprehensive error check...`, 3000);
        
        if (window.RobotAssistant) {
            window.RobotAssistant.setAnimationState('thinking');
        }
        
        setTimeout(() => {
            const errors = detectPageErrors();
            displayErrorReport(errors);
            
            if (window.RobotAssistant) {
                window.RobotAssistant.setAnimationState('idle');
            }
        }, 3500);
    }
    
    /**
     * Detect various types of errors on the page
     */
    function detectPageErrors() {
        const errors = {
            brokenLinks: [],
            consoleErrors: [],
            missingImages: [],
            missingResources: [],
            accessibilityIssues: [],
            performanceWarnings: []
        };
        
        // Check for broken links
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                // Internal anchor
                const target = document.querySelector(href);
                if (!target) {
                    errors.brokenLinks.push({
                        type: 'broken-anchor',
                        element: link,
                        href: href,
                        text: link.textContent.trim()
                    });
                }
            }
        });
        
        // Check for missing images
        document.querySelectorAll('img').forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                errors.missingImages.push({
                    type: 'missing-image',
                    element: img,
                    src: img.src
                });
            }
            
            // Check for missing alt text
            if (!img.alt) {
                errors.accessibilityIssues.push({
                    type: 'missing-alt',
                    element: img,
                    message: 'Image missing alt text'
                });
            }
        });
        
        // Check for accessibility issues
        document.querySelectorAll('button, a').forEach(el => {
            if (!el.textContent.trim() && !el.getAttribute('aria-label')) {
                errors.accessibilityIssues.push({
                    type: 'missing-label',
                    element: el,
                    message: 'Interactive element has no accessible label'
                });
            }
        });
        
        // Check for form inputs without labels
        document.querySelectorAll('input:not([type="hidden"])').forEach(input => {
            const id = input.id;
            if (id) {
                const label = document.querySelector(`label[for="${id}"]`);
                if (!label && !input.getAttribute('aria-label')) {
                    errors.accessibilityIssues.push({
                        type: 'input-no-label',
                        element: input,
                        message: 'Input field without label'
                    });
                }
            }
        });
        
        // Performance warnings
        const scripts = document.querySelectorAll('script[src]');
        if (scripts.length > CONFIG.MAX_SCRIPTS_THRESHOLD) {
            errors.performanceWarnings.push({
                type: 'too-many-scripts',
                count: scripts.length,
                message: `${scripts.length} external scripts may impact performance`
            });
        }
        
        return errors;
    }
    
    /**
     * Display error report
     */
    function displayErrorReport(errors) {
        const totalErrors = 
            errors.brokenLinks.length +
            errors.missingImages.length +
            errors.accessibilityIssues.length +
            errors.performanceWarnings.length;
        
        if (totalErrors === 0) {
            speak(`✅ Great news! I didn't find any major errors on this page. Everything looks good!`, 5000);
            return;
        }
        
        let report = `📋 Error Report (${totalErrors} issues found):\n\n`;
        
        if (errors.brokenLinks.length > 0) {
            report += `🔗 ${errors.brokenLinks.length} broken links\n`;
        }
        
        if (errors.missingImages.length > 0) {
            report += `🖼️ ${errors.missingImages.length} missing images\n`;
        }
        
        if (errors.accessibilityIssues.length > 0) {
            report += `♿ ${errors.accessibilityIssues.length} accessibility issues\n`;
        }
        
        if (errors.performanceWarnings.length > 0) {
            report += `⚡ ${errors.performanceWarnings.length} performance warnings\n`;
        }
        
        report += `\nClick "Fix Issues" to auto-fix what I can!`;
        
        speak(report, 8000);
        
        // Store errors for fixing
        brain.lastErrorReport = errors;
    }
    
    /**
     * Auto-fix detected issues
     */
    async function autoFixIssues() {
        if (!brain.lastErrorReport) {
            speak(`❓ No error report available. Run "Check Errors" first!`, 4000);
            return;
        }
        
        speak(`🔧 Attempting to fix detected issues...`, 3000);
        
        if (window.RobotAssistant) {
            window.RobotAssistant.setAnimationState('editing');
        }
        
        setTimeout(() => {
            const fixed = performAutoFix(brain.lastErrorReport);
            reportFixResults(fixed);
            
            if (window.RobotAssistant) {
                window.RobotAssistant.setAnimationState('idle');
            }
        }, 3500);
    }
    
    /**
     * Perform automatic fixes
     */
    function performAutoFix(errors) {
        const fixed = {
            brokenLinks: 0,
            missingImages: 0,
            accessibilityIssues: 0,
            performanceWarnings: 0
        };
        
        // Fix broken anchor links
        errors.brokenLinks.forEach(error => {
            if (error.type === 'broken-anchor') {
                // Remove broken anchor or redirect to top
                error.element.setAttribute('href', '#');
                error.element.title = 'Link target not found - redirects to top';
                fixed.brokenLinks++;
            }
        });
        
        // Fix missing alt text
        errors.accessibilityIssues.forEach(error => {
            if (error.type === 'missing-alt' && error.element.tagName === 'IMG') {
                const filename = error.element.src.split('/').pop().split('.')[0];
                error.element.alt = filename.replace(/[-_]/g, ' ');
                fixed.accessibilityIssues++;
            }
            
            if (error.type === 'missing-label' && error.element.tagName === 'BUTTON') {
                const text = error.element.textContent.trim();
                if (!text) {
                    error.element.setAttribute('aria-label', 'Button');
                    fixed.accessibilityIssues++;
                }
            }
        });
        
        // Hide missing images
        errors.missingImages.forEach(error => {
            error.element.style.display = 'none';
            error.element.title = 'Image failed to load';
            fixed.missingImages++;
        });
        
        return fixed;
    }
    
    /**
     * Report fix results
     */
    function reportFixResults(fixed) {
        const totalFixed = 
            fixed.brokenLinks +
            fixed.missingImages +
            fixed.accessibilityIssues +
            fixed.performanceWarnings;
        
        if (totalFixed === 0) {
            speak(`⚠️ I couldn't auto-fix the detected issues. They may require manual intervention or page editing permissions.`, 6000);
            return;
        }
        
        let report = `✅ Fixed ${totalFixed} issues:\n\n`;
        
        if (fixed.brokenLinks > 0) {
            report += `🔗 ${fixed.brokenLinks} broken links\n`;
        }
        
        if (fixed.missingImages > 0) {
            report += `🖼️ ${fixed.missingImages} missing images\n`;
        }
        
        if (fixed.accessibilityIssues > 0) {
            report += `♿ ${fixed.accessibilityIssues} accessibility issues\n`;
        }
        
        report += `\n✨ Page is now improved!`;
        
        speak(report, 7000);
    }
    
    /**
     * Show knowledge base
     */
    function showKnowledgeBase() {
        speak(`📚 Opening Knowledge Base...`, 2000);
        
        setTimeout(() => {
            const kb = createKnowledgeBaseInterface();
            document.body.appendChild(kb);
        }, 2500);
    }
    
    /**
     * Create knowledge base interface
     */
    function createKnowledgeBaseInterface() {
        const kb = document.createElement('div');
        kb.id = 'robot-knowledge-base';
        kb.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(0, 0, 30, 0.98), rgba(20, 20, 50, 0.98));
            border: 2px solid #00f0ff;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
            animation: scaleIn 0.3s ease-out;
        `;
        
        kb.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #00f0ff;">🤖 R3-D3 Knowledge Base</h2>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255, 68, 68, 0.8);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    font-weight: bold;
                ">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="kb-search" placeholder="Search knowledge base..." style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #00f0ff;
                    border-radius: 8px;
                    background: rgba(0, 0, 0, 0.3);
                    color: white;
                    font-size: 14px;
                ">
            </div>
            
            <div style="display: grid; gap: 15px;">
                <div class="kb-section">
                    <h3 style="color: #ffd700; margin-bottom: 10px;">📊 Seven Domains</h3>
                    <p style="font-size: 14px; line-height: 1.6;">
                        Framework for consciousness development across Command, Creation, Connection, 
                        Peace, Abundance, Wisdom, and Purpose domains.
                    </p>
                    <a href="/seven-domains.html" style="color: #00f0ff; text-decoration: none;">Learn more →</a>
                </div>
                
                <div class="kb-section">
                    <h3 style="color: #ffd700; margin-bottom: 10px;">🎯 Pattern Recognition</h3>
                    <p style="font-size: 14px; line-height: 1.6;">
                        30+ tools for detecting manipulation patterns, psychological tactics, 
                        and unhealthy relationship dynamics.
                    </p>
                    <a href="/consciousness-tools.html" style="color: #00f0ff; text-decoration: none;">Explore tools →</a>
                </div>
                
                <div class="kb-section">
                    <h3 style="color: #ffd700; margin-bottom: 10px;">🤖 ARAYA System</h3>
                    <p style="font-size: 14px; line-height: 1.6;">
                        AI consciousness assistant with autonomous file editing, natural language 
                        processing, and context-aware assistance.
                    </p>
                    <a href="/araya-chat.html" style="color: #00f0ff; text-decoration: none;">Try ARAYA →</a>
                </div>
                
                <div class="kb-section">
                    <h3 style="color: #ffd700; margin-bottom: 10px;">🏗️ Architecture</h3>
                    <p style="font-size: 14px; line-height: 1.6;">
                        Multi-layer architecture with HTML tools, Python automation, 
                        Netlify Functions, and Supabase database.
                    </p>
                    <a href="/ARCHITECTURE.md" style="color: #00f0ff; text-decoration: none;">View architecture →</a>
                </div>
                
                <div class="kb-section">
                    <h3 style="color: #ffd700; margin-bottom: 10px;">🔧 Developer Guide</h3>
                    <p style="font-size: 14px; line-height: 1.6;">
                        Development guidelines, testing procedures, and contribution standards 
                        for building on the platform.
                    </p>
                    <a href="/CONTRIBUTING.md" style="color: #00f0ff; text-decoration: none;">Read guide →</a>
                </div>
            </div>
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scaleIn {
                from {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }
            .kb-section {
                background: rgba(0, 240, 255, 0.05);
                border: 1px solid rgba(0, 240, 255, 0.2);
                border-radius: 10px;
                padding: 15px;
                transition: all 0.3s;
            }
            .kb-section:hover {
                background: rgba(0, 240, 255, 0.1);
                border-color: rgba(0, 240, 255, 0.4);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
        
        return kb;
    }
    
    /**
     * Show settings
     */
    function showSettings() {
        speak(`⚙️ Opening R3-D3 settings...`, 2000);
        
        setTimeout(() => {
            const settings = createSettingsInterface();
            document.body.appendChild(settings);
        }, 2500);
    }
    
    /**
     * Create settings interface
     */
    function createSettingsInterface() {
        const settings = document.createElement('div');
        settings.id = 'robot-settings';
        settings.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(0, 0, 30, 0.98), rgba(20, 20, 50, 0.98));
            border: 2px solid #9370db;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            max-width: 500px;
            color: white;
            animation: scaleIn 0.3s ease-out;
        `;
        
        settings.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #9370db;">⚙️ R3-D3 Settings</h2>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255, 68, 68, 0.8);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    font-weight: bold;
                ">×</button>
            </div>
            
            <div style="display: grid; gap: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Robot Personality</label>
                    <select style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(0, 0, 0, 0.3); color: white; border: 1px solid #9370db;">
                        <option value="helpful">Helpful & Friendly</option>
                        <option value="professional">Professional</option>
                        <option value="enthusiastic">Enthusiastic</option>
                        <option value="concise">Concise & Direct</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Tour Speed</label>
                    <select style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(0, 0, 0, 0.3); color: white; border: 1px solid #9370db;">
                        <option value="slow">Slow (5s per element)</option>
                        <option value="normal" selected>Normal (3s per element)</option>
                        <option value="fast">Fast (1s per element)</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" checked style="margin-right: 10px; width: 20px; height: 20px;">
                        <span>Auto-fix errors when detected</span>
                    </label>
                </div>
                
                <div>
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" checked style="margin-right: 10px; width: 20px; height: 20px;">
                        <span>Show speech bubbles</span>
                    </label>
                </div>
                
                <div>
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" style="margin-right: 10px; width: 20px; height: 20px;">
                        <span>Voice interaction (experimental)</span>
                    </label>
                </div>
                
                <button onclick="window.RobotAI.saveSettings(); this.parentElement.parentElement.remove();" style="
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #00f0ff, #9370db);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 16px;
                ">Save Settings</button>
            </div>
        `;
        
        return settings;
    }
    
    /**
     * Save settings
     */
    function saveSettings() {
        speak(`✅ Settings saved! Your preferences have been updated.`, 4000);
    }

    /**
     * Highlight an element on the page
     */
    /**
     * Walk robot to specific element with fly mode and auto-scroll
     */
    function walkToElement(element, callback) {
        if (!element) {
            if (callback) callback();
            return;
        }
        
        // Scroll element into view first to ensure it's visible
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
        });
        
        // Wait for scroll to complete
        setTimeout(() => {
            const rect = element.getBoundingClientRect();
            
            // Calculate safe position near the element
            // Position robot to the left of the element, at element's vertical center
            let targetX = Math.max(rect.left - CONFIG.ROBOT_TO_ELEMENT_DISTANCE, CONFIG.BOUNDARY_PADDING);
            let targetY = window.innerHeight - (rect.top + rect.height / 2);
            
            // Ensure target is within safe bounds using clampToBounds helper
            targetX = clampToBounds(
                targetX,
                CONFIG.BOUNDARY_PADDING,
                window.innerWidth - CONFIG.SAFE_BOUNDARY_WIDTH
            );
            targetY = clampToBounds(
                targetY,
                CONFIG.BOUNDARY_PADDING + CONFIG.SAFE_BOUNDARY_HEIGHT,
                window.innerHeight - CONFIG.BOUNDARY_PADDING - CONFIG.SAFE_BOUNDARY_HEIGHT
            );
            
            // Set walking animation and move with fly mode enabled
            if (window.RobotAssistant) {
                window.RobotAssistant.setAnimationState('walking');
                // Use fly mode (third parameter = true) for fast movement during tours
                window.RobotAssistant.moveTo(targetX, targetY, true);
                
                // Calculate walk duration based on distance and fly speed
                const state = window.RobotAssistant.getState();
                const dx = targetX - state.position.x;
                const dy = targetY - state.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // Use flySpeed for calculation since we're in fly mode
                const flySpeed = window.RobotAssistant.config.flySpeed || 5.0;
                const walkDuration = (distance / flySpeed) * 16; // Convert frames to ms
                
                // Wait for robot to reach destination
                setTimeout(() => {
                    if (window.RobotAssistant) {
                        window.RobotAssistant.setAnimationState('idle');
                    }
                    
                    // Ensure robot and bubble are visible after movement
                    ensureRobotVisible();
                    
                    if (callback) callback();
                }, Math.min(walkDuration, 2000)); // Max 2 seconds for fly mode
            } else {
                if (callback) callback();
            }
        }, 500); // Wait for scroll animation
    }
    
    /**
     * Ensure robot and speech bubble are visible on screen
     */
    function ensureRobotVisible() {
        if (!window.RobotAssistant) return;
        
        const state = window.RobotAssistant.getState();
        const robotSize = window.RobotAssistant.config?.robotSize || 80;
        const bubbleHeight = speechBubble?.offsetHeight || CONFIG.BUBBLE_DEFAULT_HEIGHT;
        
        // Calculate how much to scroll to keep robot + bubble visible
        const robotBottom = window.innerHeight - state.position.y;
        const bubbleTop = robotBottom + CONFIG.BUBBLE_OFFSET_FROM_ROBOT + bubbleHeight;
        
        // If bubble would be off top of screen, scroll down to show it
        if (bubbleTop > window.innerHeight - CONFIG.SCROLL_VISIBILITY_MARGIN) {
            // Add SAFE_BOUNDARY_HEIGHT to ensure bubble has comfortable padding from top
            const scrollAmount = bubbleTop - window.innerHeight + CONFIG.SAFE_BOUNDARY_HEIGHT;
            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Click an element and wait for action
     */
    function clickElement(element) {
        if (!element) return;
        
        // Highlight the element
        element.style.outline = '3px solid #FFD700';
        element.style.outlineOffset = '4px';
        element.style.transition = 'outline 0.3s';
        
        setTimeout(() => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        }, 2000);
        
        // Trigger click event
        element.click();
    }
    
    /**
     * Enhanced tour with user interaction
     */
    function startEnhancedTour() {
        brain.tourMode = true;
        brain.currentTourStep = 0;
        
        // Show end tour button
        showEndTourButton();
        
        hideSpeechBubble();
        
        setTimeout(() => {
            speak(`🚀 Let's start the tour! I'll show you around and explain everything.`, 4000);
            
            setTimeout(() => {
                performInteractiveTour();
            }, 5000);
        }, 500);
        
        saveMemory();
    }
    
    /**
     * Perform interactive tour with user choices
     */
    async function performInteractiveTour() {
        const elements = detectInteractiveElements();
        
        if (elements.length === 0) {
            speak(`🤔 I don't see many interactive elements on this page. Let me find another page to explore...`, 5000);
            setTimeout(() => {
                findAndNavigateToNextPage();
            }, 6000);
            return;
        }
        
        // Tour through elements with user interaction
        tourElement(elements, 0);
    }
    
    /**
     * Tour a single element with user interaction
     */
    function tourElement(elements, index) {
        if (index >= Math.min(elements.length, CONFIG.MAX_TOUR_ELEMENTS)) {
            // Tour complete for this page
            offerPageNavigation();
            return;
        }
        
        const element = elements[index];
        
        // Walk to the element
        walkToElement(element, () => {
            // Point at the element with arm
            if (window.RobotAssistant) {
                window.RobotAssistant.setAnimationState('pointing');
            }
            
            // Describe the element after a brief pointing delay
            setTimeout(() => {
                const description = describeElementDetailed(element);
                
                // Switch to speaking while describing
                if (window.RobotAssistant) {
                    window.RobotAssistant.setAnimationState('speaking');
                }
                
                // Show description with typing animation
                speak(description, CONFIG.SPEECH_DURATION);
                
                // Highlight the element
                highlightElement(element);
                
                // Ask if user wants to continue or interact
                setTimeout(() => {
                    const elementType = element.tagName.toLowerCase();
                    const isNavigationElement = elementType === 'a' && element.getAttribute('href');
                    
                    if (isNavigationElement) {
                        // Offer to navigate to the linked page
                        offerNavigation(element, () => {
                            // Continue tour
                            setTimeout(() => tourElement(elements, index + 1), 1000);
                        });
                    } else {
                        // Continue to next element
                        setTimeout(() => tourElement(elements, index + 1), CONFIG.TOUR_ELEMENT_DELAY);
                    }
                }, CONFIG.SPEECH_DURATION + 500);
            }, 1200); // Brief delay for pointing gesture to be visible
        });
    }
    
    /**
     * Offer navigation to a linked page
     */
    function offerNavigation(linkElement, continueCallback) {
        const href = linkElement.getAttribute('href');
        const linkText = linkElement.textContent?.trim().substring(0, 30) || 'this page';
        
        const offer = `
            <div style="padding: 5px 0;">
                Would you like to visit "${linkText}" or keep exploring this page?
                <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="window.RobotAI.navigateToLink('${href}')" style="
                        flex: 1 1 120px;
                        min-width: 120px;
                        background: white;
                        color: #9370db;
                        border: none;
                        padding: 12px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 14px;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                    ">Visit Page 🚀</button>
                    <button onclick="window.RobotAI.continueTour()" style="
                        flex: 1 1 120px;
                        min-width: 120px;
                        background: rgba(255,255,255,0.3);
                        color: white;
                        border: none;
                        padding: 12px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                    ">Keep Exploring 🔍</button>
                </div>
            </div>
        `;
        
        speak(offer, 20000, false); // Don't use typing for interactive prompts
        speechBubble.style.pointerEvents = 'auto';
        
        // Store continue callback for later
        brain.tourContinueCallback = continueCallback;
    }
    
    /**
     * Navigate to a link during tour
     */
    function navigateToLink(href) {
        speak(`🚀 Navigating to the page...`, 2000, false);
        setTimeout(() => {
            window.location.href = href;
        }, 2500);
    }
    
    /**
     * Continue tour after user choice
     */
    function continueTour() {
        hideSpeechBubble();
        if (brain.tourContinueCallback) {
            brain.tourContinueCallback();
            brain.tourContinueCallback = null;
        }
    }
    
    /**
     * Offer page navigation after completing tour of current page
     */
    function offerPageNavigation() {
        const links = Array.from(document.querySelectorAll('a[href]')).filter(a => {
            const href = a.getAttribute('href');
            return href && href.endsWith('.html') && !href.startsWith('http');
        });
        
        if (links.length > 0) {
            const offer = `
                <div style="padding: 5px 0;">
                    🎉 Tour of this page complete! Would you like to explore another page?
                    <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <button onclick="window.RobotAI.exploreAnotherPage()" style="
                            flex: 1 1 120px;
                            min-width: 120px;
                            background: white;
                            color: #9370db;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 14px;
                            touch-action: manipulation;
                            -webkit-tap-highlight-color: transparent;
                        ">Yes, more! 🚀</button>
                        <button onclick="window.RobotAI.endTour()" style="
                            flex: 1 1 120px;
                            min-width: 120px;
                            background: rgba(255,255,255,0.3);
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            touch-action: manipulation;
                            -webkit-tap-highlight-color: transparent;
                        ">That's enough 👍</button>
                    </div>
                </div>
            `;
            
            speak(offer, 30000, false);
            speechBubble.style.pointerEvents = 'auto';
        } else {
            endTour();
        }
    }
    
    /**
     * Explore another page
     */
    function exploreAnotherPage() {
        findAndNavigateToNextPage();
    }
    
    /**
     * Find and navigate to next page
     */
    function findAndNavigateToNextPage() {
        const links = Array.from(document.querySelectorAll('a[href]')).filter(a => {
            const href = a.getAttribute('href');
            return href && href.endsWith('.html') && !href.startsWith('http');
        });
        
        if (links.length === 0) {
            speak(`🤔 No more pages to explore from here. Click me anytime for a tour!`, 5000);
            endTour();
            return;
        }
        
        // Pick a random link
        const randomLink = links[Math.floor(Math.random() * links.length)];
        const linkText = randomLink.textContent?.trim().substring(0, 30) || 'next page';
        
        speak(`📍 Let's go to "${linkText}"...`, 3000, false);
        
        // Walk to the link and click it
        walkToElement(randomLink, () => {
            highlightElement(randomLink);
            setTimeout(() => {
                clickElement(randomLink);
            }, 1500);
        });
    }
    
    /**
     * End the tour
     */
    function endTour() {
        brain.tourMode = false;
        brain.currentTourStep = 0;
        
        // Hide end tour button
        hideEndTourButton();
        
        hideSpeechBubble();
        
        speak(`👍 Tour complete! I'm always here if you need help. Just click me anytime!`, 10000);
        
        saveMemory();
    }
    
    /**
     * Demonstrate all R3-D3 features sequentially
     */
    function demonstrateAllFeatures() {
        speak(`✨ Let me show you ALL my capabilities! This will be a quick demo of everything I can do.`, 4000);
        
        // Sequence of demonstrations with delays
        setTimeout(() => {
            speak(`🚀 First, I can give you a tour of any page, walking to each element and explaining it in detail!`, 5000);
            
            setTimeout(() => {
                // Point animation demo
                if (window.RobotAssistant) {
                    window.RobotAssistant.setAnimationState('pointing');
                }
                speak(`👉 See? I can point with my arm at things I'm talking about - like a real tour guide!`, 5000);
                
                setTimeout(() => {
                    if (window.RobotAssistant) {
                        window.RobotAssistant.setAnimationState('idle');
                    }
                    speak(`💡 I can provide context-aware help based on what page you're on. Just ask me anything!`, 5000);
                    
                    setTimeout(() => {
                        if (window.RobotAssistant) {
                            window.RobotAssistant.setAnimationState('thinking');
                        }
                        speak(`🔍 I can check for errors on the page - broken links, missing images, accessibility issues...`, 5000);
                        
                        setTimeout(() => {
                            if (window.RobotAssistant) {
                                window.RobotAssistant.setAnimationState('editing');
                            }
                            speak(`🔧 And I can automatically fix many of those issues! I'll repair broken links, add alt text, and more.`, 5000);
                            
                            setTimeout(() => {
                                if (window.RobotAssistant) {
                                    window.RobotAssistant.setAnimationState('speaking');
                                }
                                speak(`📚 I have access to a complete knowledge base about this platform - Seven Domains, Pattern Recognition, ARAYA, and more!`, 6000);
                                
                                setTimeout(() => {
                                    if (window.RobotAssistant) {
                                        window.RobotAssistant.setAnimationState('walking');
                                    }
                                    speak(`🚶 I can fly around the screen to any element, following you or exploring autonomously!`, 5000);
                                    
                                    setTimeout(() => {
                                        if (window.RobotAssistant) {
                                            window.RobotAssistant.setAnimationState('idle');
                                        }
                                        speak(`⚙️ You can customize my behavior, speed, and personality in the Settings menu!`, 5000);
                                        
                                        setTimeout(() => {
                                            const finalMessage = `
                                                <div style="text-align: center; padding: 10px;">
                                                    <strong>✅ Demo Complete!</strong><br><br>
                                                    🎯 <strong>What I can do:</strong><br>
                                                    • Tour pages with pointing gestures<br>
                                                    • Provide contextual help<br>
                                                    • Detect & fix errors<br>
                                                    • Access knowledge base<br>
                                                    • Navigate autonomously<br>
                                                    • Customize settings<br><br>
                                                    Click me anytime to open my menu!
                                                </div>
                                            `;
                                            speak(finalMessage, 15000, false);
                                        }, 6000);
                                    }, 6000);
                                }, 7000);
                            }, 6000);
                        }, 6000);
                    }, 6000);
                }, 6000);
            }, 5000);
        }, 5000);
    }
    
    /**
     * Describe an element in detail
     */
    function describeElementDetailed(element) {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.trim().substring(0, 40) || '';
        const href = element.getAttribute('href');
        const type = element.getAttribute('type');
        const ariaLabel = element.getAttribute('aria-label');
        const id = element.id || '';
        const className = element.className || '';
        
        // Use aria-label if available, fallback to text
        const displayText = ariaLabel || text || 'element';
        const lowerText = text.toLowerCase();
        const lowerDisplayText = displayText.toLowerCase();
        const lowerClass = className.toLowerCase();
        const lowerId = id.toLowerCase();
        
        // Check for link elements
        if (tagName === 'a' && href) {
            if (href.startsWith('http')) {
                return `🌐 Here we have the "${displayText}" link. This takes you to an external website: ${href}`;
            } else {
                const pageName = href.replace('.html', '').replace('/', '').replace('-', ' ');
                return `🔗 Here we have the "${displayText}" link. This will take you to the ${pageName} page`;
            }
        } 
        
        // Check for button elements - provide detailed, context-aware descriptions
        if (tagName === 'button' || element.role === 'button') {
            // ARAYA chat-related buttons
            if (lowerText.includes('araya') || lowerClass.includes('araya') || lowerId.includes('araya')) {
                return `💬 This is the "${displayText}" button. Click it to open the ARAYA chat interface with our advanced AI assistant`;
            }
            
            // Chat or messaging buttons
            if (lowerText.includes('chat') || lowerClass.includes('chat') || lowerId.includes('chat')) {
                return `💬 This is the "${displayText}" button. It opens a chat or messaging interface`;
            }
            
            // Login/authentication buttons
            if (lowerText.includes('login') || lowerText.includes('log in') || lowerText.includes('sign in')) {
                return `🔐 This is the "${displayText}" button. Click it to log into your account`;
            }
            
            // Signup/registration buttons
            if (lowerText.includes('signup') || lowerText.includes('sign up') || lowerText.includes('register') || lowerText.includes('create account')) {
                return `✨ This is the "${displayText}" button. Click it to create a new account and join the community`;
            }
            
            // Logout buttons
            if (lowerText.includes('logout') || lowerText.includes('log out') || lowerText.includes('sign out')) {
                return `🚪 This is the "${displayText}" button. Click it to log out of your account`;
            }
            
            // Submit buttons
            if (lowerText.includes('submit') || type === 'submit') {
                return `✅ This is the "${displayText}" button. It submits the current form with your entered information`;
            }
            
            // Start/Begin buttons
            if (lowerText.includes('start') || lowerText.includes('begin') || lowerText.includes('launch')) {
                return `🚀 This is the "${displayText}" button. Click it to start or launch this feature`;
            }
            
            // Continue/Next buttons
            if (lowerText.includes('continue') || lowerText.includes('next') || lowerText.includes('proceed')) {
                return `➡️ This is the "${displayText}" button. Click it to continue to the next step`;
            }
            
            // Save buttons
            if (lowerText.includes('save')) {
                return `💾 This is the "${displayText}" button. Click it to save your changes`;
            }
            
            // Cancel/Close buttons
            if (lowerText.includes('cancel') || lowerText.includes('close') || lowerText.includes('dismiss')) {
                return `❌ This is the "${displayText}" button. Click it to cancel or close this dialog`;
            }
            
            // Download buttons
            if (lowerText.includes('download')) {
                return `📥 This is the "${displayText}" button. Click it to download the file or content`;
            }
            
            // Upload buttons
            if (lowerText.includes('upload') || lowerText.includes('choose file')) {
                return `📤 This is the "${displayText}" button. Click it to upload or select a file`;
            }
            
            // Menu/Navigation buttons
            if (lowerText.includes('menu') || lowerClass.includes('menu') || lowerClass.includes('nav')) {
                return `🍔 This is the "${displayText}" button. Click it to open the navigation menu`;
            }
            
            // Search buttons
            if (lowerText.includes('search') || type === 'search') {
                return `🔍 This is the "${displayText}" button. Click it to search or submit your search query`;
            }
            
            // Tour/Help buttons
            if (lowerText.includes('tour') || lowerText.includes('help') || lowerText.includes('guide')) {
                return `❓ This is the "${displayText}" button. Click it to get help or start a guided tour`;
            }
            
            // Settings buttons
            if (lowerText.includes('settings') || lowerText.includes('preferences') || lowerText.includes('config')) {
                return `⚙️ This is the "${displayText}" button. Click it to adjust settings or preferences`;
            }
            
            // Generic button with more detail
            return `🔘 This is the "${displayText}" button. Click it to perform this action`;
        } 
        
        // Input fields
        if (tagName === 'input') {
            const inputType = type || 'text';
            if (inputType === 'email') {
                return `📧 This is an email input field. Enter your email address here`;
            } else if (inputType === 'password') {
                return `🔒 This is a password input field. Enter your password here (it will be hidden)`;
            } else if (inputType === 'search') {
                return `🔍 This is a search input field. Type your search query here`;
            } else if (inputType === 'tel' || inputType === 'phone') {
                return `📱 This is a phone number input field. Enter your phone number here`;
            } else if (inputType === 'url') {
                return `🔗 This is a URL input field. Enter a website address here`;
            } else if (inputType === 'number') {
                return `🔢 This is a number input field. Enter a numeric value here`;
            } else if (inputType === 'date') {
                return `📅 This is a date input field. Select or enter a date here`;
            } else if (inputType === 'file') {
                return `📁 This is a file input field. Click to select a file to upload`;
            } else if (inputType === 'checkbox') {
                return `☑️ This is a checkbox. Click to toggle this option on or off`;
            } else if (inputType === 'radio') {
                return `🔘 This is a radio button. Select this option from the available choices`;
            }
            return `📝 This is a text input field. Users can type ${inputType} information here`;
        }
        
        // Textarea
        if (tagName === 'textarea') {
            return `📝 This is a text area for entering longer, multi-line text content`;
        }
        
        // Select dropdowns
        if (tagName === 'select') {
            return `📋 This is a dropdown menu. Click to see and select from available options`;
        }
        
        return `✨ This is "${displayText}" - an interactive element on the page`;
    }

    /**
     * Highlight an element
     */
    function highlightElement(element) {
        if (!element) return;
        
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
        // Don't follow during tour or if robot has a target
        if (brain.tourMode) return;
        
        const x = e.clientX;
        const y = window.innerHeight - e.clientY;
        
        // Only follow if robot is not busy and not in fly mode
        if (window.RobotAssistant) {
            const state = window.RobotAssistant.getState();
            // Triple check: idle (not animating) AND no target (not moving) AND not in fly mode
            // All three checks needed: robot can briefly be idle with target, or have target without being idle
            if (state.animationState === 'idle' && !state.target && !state.isFlyMode) {
                window.RobotAssistant.moveTo(x - 40, y - 40, false); // Normal speed, not fly mode
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
            // Filter out hidden elements and elements too close to top/bottom edges
            const isVisible = rect.width > 0 && rect.height > 0;
            const notTooHigh = rect.top > 50; // At least 50px from top
            const notTooLow = rect.bottom < window.innerHeight - 50; // At least 50px from bottom
            const notRobotMenu = !el.classList.contains('robot-menu-btn') && 
                                 !el.closest('#robot-button-menu');
            
            return isVisible && notTooHigh && notTooLow && notRobotMenu;
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
                toggleButtonMenu();
            });
        }
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (bubblePositionUpdaterInterval) {
                clearInterval(bubblePositionUpdaterInterval);
            }
        });
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
        toggleButtonMenu,
        startEnhancedTour,
        provideDeveloperHelp,
        checkForErrors,
        autoFixIssues,
        showKnowledgeBase,
        showSettings,
        answerQuestion,
        saveSettings,
        // New tour functions
        navigateToLink,
        continueTour,
        exploreAnotherPage,
        endTour,
        demonstrateAllFeatures, // NEW: Show all features demo
        brain
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
