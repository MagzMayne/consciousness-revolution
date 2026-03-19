// RootIB: RB-20260319142113-1517423B
/**
 * ARAYA 2D Robot Assistant (CSS Version)
 * 
 * A CSS-animated robot that walks around the screen, shows autonomous functionality,
 * and maintains state across pages like ARAYA chat memory system.
 * 
 * This is a fallback/lightweight version that doesn't require Three.js.
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        robotSize: 80, // Base size in pixels
        moveSpeed: 2, // Pixels per frame
        boundaryPadding: 50,
        stateUpdateInterval: 1000, // Save state every second
        idleTimeout: 5000, // Time before robot starts wandering
        storageKey: 'araya_robot_state',
        enabled: false // DISABLED - unfinished project (Feb 2026)
    };

    // Robot state
    let state = {
        position: { x: 100, y: window.innerHeight - 150 },
        target: null,
        velocity: { x: 0, y: 0 },
        animationState: 'idle', // idle, walking, thinking, speaking
        facing: 'right', // left or right
        sessionId: null,
        lastActivity: Date.now(),
        currentAction: 'Waiting for interactions...'
    };

    let container, animationFrame;

    /**
     * Initialize the robot assistant
     */
    function init() {
        if (!CONFIG.enabled) return;

        // Load saved state
        loadState();

        // Get or create session ID (sync with ARAYA)
        state.sessionId = getSessionId();

        // Create robot HTML
        createRobotHTML();

        // Setup event listeners
        setupEventListeners();

        // Start animation loop
        animate();

        // Start autonomous behavior
        startAutonomousBehavior();

        console.log('🤖 ARAYA Robot Assistant initialized (CSS version)');
    }

    /**
     * Create robot HTML and CSS
     */
    function createRobotHTML() {
        // Create container
        container = document.createElement('div');
        container.id = 'robot-assistant-container';
        container.className = 'robot-container';
        
        // Create robot HTML structure
        container.innerHTML = `
            <div class="robot-body">
                <div class="robot-antenna">
                    <div class="antenna-tip"></div>
                </div>
                <div class="robot-head">
                    <div class="robot-eye"></div>
                </div>
                <div class="robot-torso"></div>
                <div class="robot-arms">
                    <div class="arm left"></div>
                    <div class="arm right"></div>
                </div>
                <div class="robot-legs">
                    <div class="leg left"></div>
                    <div class="leg right"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);

        // Add CSS styles
        addRobotStyles();

        // Set initial position
        updateContainerPosition();
    }

    /**
     * Add robot CSS styles
     */
    function addRobotStyles() {
        const styleId = 'robot-assistant-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .robot-container {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: ${CONFIG.robotSize}px;
                height: ${CONFIG.robotSize}px;
                z-index: 999;
                pointer-events: none;
                transition: left 0.3s ease-out, bottom 0.3s ease-out;
                background: transparent;
            }

            .robot-body {
                position: relative;
                width: 100%;
                height: 100%;
                transform-origin: center bottom;
                background: transparent;
            }

            .robot-antenna {
                position: absolute;
                top: 2%;
                left: 50%;
                transform: translateX(-50%);
                width: 2px;
                height: 20%;
                background: #9370db;
                z-index: 10;
            }

            .antenna-tip {
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ffd700;
                box-shadow: 0 0 10px #ffd700;
                animation: pulse 2s ease-in-out infinite;
            }

            .robot-head {
                position: absolute;
                top: 15%;
                left: 50%;
                transform: translateX(-50%);
                width: 50%;
                height: 40%;
                font-size: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: float 3s ease-in-out infinite;
                filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.6));
                background: transparent;
            }

            .robot-head::before {
                content: '🤖';
            }

            .robot-eye {
                display: none;
            }

            .robot-torso {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translateX(-50%);
                width: 45%;
                height: 30%;
                background: linear-gradient(135deg, #9370db, #7a5cc0);
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(147, 112, 219, 0.5);
            }

            .robot-arms {
                position: absolute;
                top: 48%;
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                height: 25%;
            }

            .arm {
                position: absolute;
                top: 0;
                width: 12%;
                height: 80%;
                background: linear-gradient(135deg, #00f0ff, #00d4ff);
                border-radius: 6px;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
                transform-origin: top center;
            }

            .arm.left {
                left: 0;
                animation: swingLeft 1.5s ease-in-out infinite;
            }

            .arm.right {
                right: 0;
                animation: swingRight 1.5s ease-in-out infinite;
            }

            .robot-legs {
                position: absolute;
                bottom: 5%;
                left: 50%;
                transform: translateX(-50%);
                width: 50%;
                height: 35%;
            }

            .leg {
                position: absolute;
                bottom: 0;
                width: 30%;
                height: 90%;
                background: linear-gradient(135deg, #ffd700, #ffa500);
                border-radius: 6px;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                transform-origin: top center;
            }

            .leg.left {
                left: 10%;
                animation: walkLeft 1s ease-in-out infinite;
            }

            .leg.right {
                right: 10%;
                animation: walkRight 1s ease-in-out infinite;
            }

            /* Animations */
            @keyframes pulse {
                0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
                50% { transform: translateX(-50%) scale(1.3); opacity: 0.7; }
            }

            @keyframes float {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-5px); }
            }

            @keyframes swingLeft {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-15deg); }
            }

            @keyframes swingRight {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(15deg); }
            }

            @keyframes walkLeft {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(20deg); }
            }

            @keyframes walkRight {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-20deg); }
            }

            /* State-specific animations */
            .robot-container.idle .robot-body {
                animation: breathe 4s ease-in-out infinite;
            }

            .robot-container.walking .robot-body {
                animation: walk 0.5s ease-in-out infinite;
            }

            .robot-container.thinking .robot-head {
                animation: think 2s ease-in-out infinite;
            }

            .robot-container.speaking .robot-head {
                animation: speak 0.3s ease-in-out infinite;
            }

            @keyframes breathe {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(1.02); }
            }

            @keyframes walk {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }

            @keyframes think {
                0%, 100% { transform: translateX(-50%) rotate(0deg); }
                25% { transform: translateX(-50%) rotate(-10deg); }
                75% { transform: translateX(-50%) rotate(10deg); }
            }

            @keyframes speak {
                0%, 100% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
            }

            /* Flip for direction */
            .robot-container.facing-left .robot-body {
                transform: scaleX(-1);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Animation loop
     */
    function animate() {
        // Update movement
        updateMovement();

        // Continue animation
        animationFrame = requestAnimationFrame(animate);
    }

    /**
     * Update robot movement
     */
    function updateMovement() {
        if (!state.target) return;

        const dx = state.target.x - state.position.x;
        const dy = state.target.y - state.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            // Reached target
            state.target = null;
            setAnimationState('idle');
            state.lastActivity = Date.now();
            return;
        }

        // Calculate velocity
        state.velocity.x = (dx / distance) * CONFIG.moveSpeed;
        state.velocity.y = (dy / distance) * CONFIG.moveSpeed;

        // Update position
        state.position.x += state.velocity.x;
        state.position.y += state.velocity.y;

        // Update container position
        updateContainerPosition();

        // Update facing direction
        state.facing = state.velocity.x > 0 ? 'right' : 'left';
        container.className = `robot-container walking facing-${state.facing}`;
    }

    /**
     * Update container position on screen
     */
    function updateContainerPosition() {
        if (!container) return;

        // Ensure position is within bounds
        state.position.x = Math.max(CONFIG.boundaryPadding, 
            Math.min(window.innerWidth - CONFIG.boundaryPadding - CONFIG.robotSize, state.position.x));
        state.position.y = Math.max(CONFIG.boundaryPadding, 
            Math.min(window.innerHeight - CONFIG.boundaryPadding - CONFIG.robotSize, state.position.y));

        container.style.left = state.position.x + 'px';
        container.style.bottom = (window.innerHeight - state.position.y - CONFIG.robotSize) + 'px';
    }

    /**
     * Start autonomous wandering behavior
     */
    function startAutonomousBehavior() {
        setInterval(() => {
            const timeSinceActivity = Date.now() - state.lastActivity;

            // If idle for too long and no target, wander
            if (timeSinceActivity > CONFIG.idleTimeout && !state.target) {
                wander();
            }
        }, 3000);
    }

    /**
     * Make robot wander to a random location
     */
    function wander() {
        const padding = CONFIG.boundaryPadding + CONFIG.robotSize;
        state.target = {
            x: padding + Math.random() * (window.innerWidth - padding * 2),
            y: padding + Math.random() * (window.innerHeight - padding * 2)
        };
        state.currentAction = 'Exploring the consciousness interface...';
    }

    /**
     * Move robot to a specific position
     */
    function moveTo(x, y) {
        state.target = { x, y };
        state.lastActivity = Date.now();
    }

    /**
     * Set robot animation state
     */
    function setAnimationState(newState) {
        state.animationState = newState;
        if (container) {
            container.className = `robot-container ${newState} facing-${state.facing}`;
        }
        state.lastActivity = Date.now();
        saveState();
    }

    /**
     * Set robot action message
     */
    function setAction(action) {
        state.currentAction = action;
        saveState();
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            updateContainerPosition();
        });

        // Save state periodically
        setInterval(saveState, CONFIG.stateUpdateInterval);

        // Listen for ARAYA chat events
        window.addEventListener('araya-message-sent', (e) => {
            setAnimationState('thinking');
            setAction('Processing your message...');
            setTimeout(() => setAnimationState('idle'), 2000);
        });

        window.addEventListener('araya-message-received', (e) => {
            setAnimationState('speaking');
            setAction('Responding...');
            setTimeout(() => setAnimationState('idle'), 3000);
        });

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                saveState();
            } else {
                loadState();
                updateContainerPosition();
            }
        });
    }

    /**
     * Get or create session ID (sync with ARAYA)
     */
    function getSessionId() {
        let id = localStorage.getItem('araya_user_id');
        if (!id) {
            id = 'user_' + crypto.randomUUID();
            localStorage.setItem('araya_user_id', id);
        }
        return id;
    }

    /**
     * Save robot state to localStorage
     */
    function saveState() {
        const stateToSave = {
            position: state.position,
            animationState: state.animationState,
            facing: state.facing,
            currentAction: state.currentAction,
            lastActivity: state.lastActivity,
            sessionId: state.sessionId,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(stateToSave));
        } catch (e) {
            console.warn('Failed to save robot state:', e);
        }
    }

    /**
     * Load robot state from localStorage
     */
    function loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const loaded = JSON.parse(saved);
                
                // Only restore if recent (within 1 hour)
                if (Date.now() - loaded.timestamp < 3600000) {
                    state.position = loaded.position || state.position;
                    state.animationState = loaded.animationState || state.animationState;
                    state.facing = loaded.facing || state.facing;
                    state.currentAction = loaded.currentAction || state.currentAction;
                    state.sessionId = loaded.sessionId || state.sessionId;
                }
            }
        } catch (e) {
            console.warn('Failed to load robot state:', e);
        }
    }

    /**
     * Public API
     */
    window.RobotAssistant = {
        init,
        moveTo,
        setAnimationState,
        setAction,
        getState: () => ({ ...state }),
        config: CONFIG
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
