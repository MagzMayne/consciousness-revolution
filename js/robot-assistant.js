/**
 * ARAYA 3D Robot Assistant
 * 
 * A 3D animated robot that walks around the screen, shows autonomous functionality,
 * and maintains state across pages like ARAYA chat memory system.
 * 
 * Modern evolution of the classic office assistant, powered by consciousness.
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        robotSize: 80, // Base size in pixels
        moveSpeed: 0.5, // Pixels per frame
        animationSpeed: 0.05,
        boundaryPadding: 50,
        stateUpdateInterval: 1000, // Save state every second
        idleTimeout: 3000, // Time before robot starts wandering
        storageKey: 'araya_robot_state',
        enabled: true
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

    // Three.js components
    let scene, camera, renderer, robot, animationMixer, clock;
    let canvas, container;

    /**
     * Initialize the robot assistant
     */
    function init() {
        if (!CONFIG.enabled) return;

        // Load saved state
        loadState();

        // Get or create session ID (sync with ARAYA)
        state.sessionId = getSessionId();

        // Setup Three.js
        setupThreeJS();

        // Create robot model
        createRobot();

        // Setup event listeners
        setupEventListeners();

        // Start animation loop
        animate();

        // Start autonomous behavior
        startAutonomousBehavior();

        console.log('🤖 ARAYA Robot Assistant initialized');
    }

    /**
     * Setup Three.js scene, camera, and renderer
     */
    function setupThreeJS() {
        // Create container
        container = document.createElement('div');
        container.id = 'robot-assistant-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: ${CONFIG.robotSize}px;
            height: ${CONFIG.robotSize}px;
            z-index: 999;
            pointer-events: none;
            transition: transform 0.3s ease-out;
        `;
        document.body.appendChild(container);

        // Create scene
        scene = new THREE.Scene();

        // Create camera
        camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        camera.position.z = 5;

        // Create renderer
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(CONFIG.robotSize, CONFIG.robotSize);
        renderer.setClearColor(0x000000, 0); // Transparent background
        canvas = renderer.domElement;
        container.appendChild(canvas);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const accentLight = new THREE.PointLight(0xffd700, 0.5, 10);
        accentLight.position.set(-3, 2, 3);
        scene.add(accentLight);

        // Clock for animations
        clock = new THREE.Clock();
    }

    /**
     * Create the 3D robot model
     */
    function createRobot() {
        robot = new THREE.Group();

        // Colors matching ARAYA theme
        const cyanMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00f0ff, 
            emissive: 0x00f0ff,
            emissiveIntensity: 0.2,
            shininess: 100
        });
        const goldMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffd700,
            emissive: 0xffd700,
            emissiveIntensity: 0.2,
            shininess: 100
        });
        const purpleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x9370db,
            emissive: 0x9370db,
            emissiveIntensity: 0.2,
            shininess: 100
        });

        // Head (sphere with glow)
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const head = new THREE.Mesh(headGeometry, cyanMaterial);
        head.position.y = 1.2;
        head.name = 'head';
        robot.add(head);

        // Eye (smaller sphere)
        const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const eye = new THREE.Mesh(eyeGeometry, goldMaterial);
        eye.position.set(0.2, 1.3, 0.4);
        eye.name = 'eye';
        robot.add(eye);

        // Body (box)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.6);
        const body = new THREE.Mesh(bodyGeometry, purpleMaterial);
        body.position.y = 0.3;
        body.name = 'body';
        robot.add(body);

        // Arms (cylinders)
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8);
        
        const leftArm = new THREE.Mesh(armGeometry, cyanMaterial);
        leftArm.position.set(-0.5, 0.3, 0);
        leftArm.rotation.z = 0.3;
        leftArm.name = 'leftArm';
        robot.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, cyanMaterial);
        rightArm.position.set(0.5, 0.3, 0);
        rightArm.rotation.z = -0.3;
        rightArm.name = 'rightArm';
        robot.add(rightArm);

        // Legs (cylinders)
        const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
        
        const leftLeg = new THREE.Mesh(legGeometry, goldMaterial);
        leftLeg.position.set(-0.25, -0.4, 0);
        leftLeg.name = 'leftLeg';
        robot.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, goldMaterial);
        rightLeg.position.set(0.25, -0.4, 0);
        rightLeg.name = 'rightLeg';
        robot.add(rightLeg);

        // Antenna (thin cylinder with sphere on top)
        const antennaGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
        const antenna = new THREE.Mesh(antennaGeometry, purpleMaterial);
        antenna.position.set(0, 1.6, 0);
        robot.add(antenna);

        const antennaTipGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const antennaTip = new THREE.Mesh(antennaTipGeometry, goldMaterial);
        antennaTip.position.set(0, 1.85, 0);
        robot.add(antennaTip);

        // Add subtle rotation
        robot.rotation.y = -0.5;

        scene.add(robot);
    }

    /**
     * Animation loop
     */
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Update animations based on state
        updateAnimations(time, delta);

        // Move robot if target exists
        updateMovement();

        // Render scene
        renderer.render(scene, camera);
    }

    /**
     * Update robot animations based on current state
     */
    function updateAnimations(time, delta) {
        if (!robot) return;

        const head = robot.getObjectByName('head');
        const body = robot.getObjectByName('body');
        const leftArm = robot.getObjectByName('leftArm');
        const rightArm = robot.getObjectByName('rightArm');
        const leftLeg = robot.getObjectByName('leftLeg');
        const rightLeg = robot.getObjectByName('rightLeg');
        const eye = robot.getObjectByName('eye');

        switch (state.animationState) {
            case 'idle':
                // Gentle bobbing
                robot.position.y = Math.sin(time * 2) * 0.05;
                // Gentle head tilt
                if (head) head.rotation.z = Math.sin(time * 1.5) * 0.1;
                // Eye pulse
                if (eye) {
                    eye.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
                }
                break;

            case 'walking':
                // Walking bob
                robot.position.y = Math.abs(Math.sin(time * 8)) * 0.1;
                
                // Leg swing
                if (leftLeg && rightLeg) {
                    leftLeg.rotation.x = Math.sin(time * 8) * 0.5;
                    rightLeg.rotation.x = -Math.sin(time * 8) * 0.5;
                }
                
                // Arm swing (opposite to legs)
                if (leftArm && rightArm) {
                    leftArm.rotation.x = -Math.sin(time * 8) * 0.3;
                    rightArm.rotation.x = Math.sin(time * 8) * 0.3;
                }
                
                // Body slight rotation
                if (body) body.rotation.y = Math.sin(time * 8) * 0.1;
                break;

            case 'thinking':
                // Head rotation (looking around)
                if (head) {
                    head.rotation.y = Math.sin(time * 2) * 0.3;
                    head.rotation.x = Math.sin(time * 1.5) * 0.2;
                }
                // Rapid eye pulse
                if (eye) {
                    eye.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
                }
                break;

            case 'speaking':
                // Head bob while speaking
                if (head) {
                    head.position.y = 1.2 + Math.sin(time * 5) * 0.05;
                    head.scale.setScalar(1 + Math.sin(time * 5) * 0.02);
                }
                // Arm gestures
                if (leftArm && rightArm) {
                    leftArm.rotation.z = 0.3 + Math.sin(time * 4) * 0.2;
                    rightArm.rotation.z = -0.3 - Math.sin(time * 4) * 0.2;
                }
                break;
        }
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
            state.animationState = 'idle';
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
        
        // Flip robot based on direction
        if (robot) {
            robot.scale.x = state.facing === 'right' ? 1 : -1;
        }

        // Set walking animation
        state.animationState = 'walking';
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
        }, 2000);
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

    // Auto-initialize when Three.js is loaded
    if (typeof THREE !== 'undefined') {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    } else {
        console.warn('🤖 Three.js not loaded. Robot assistant disabled.');
    }

})();
