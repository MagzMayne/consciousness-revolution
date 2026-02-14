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
        robotName: 'r3-d3', // Robot identity
        position: { x: 100, y: window.innerHeight - 150 },
        target: null,
        velocity: { x: 0, y: 0 },
        animationState: 'idle', // idle, walking, thinking, speaking, editing
        facing: 'right', // left or right
        sessionId: null,
        lastActivity: Date.now(),
        currentAction: 'Waiting for interactions...',
        canEditPages: false, // Can robot autonomously edit pages
        isEditing: false // Is robot currently editing
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

        console.log('🤖 R3-D3 Robot Assistant initialized');
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

        // Head - Using emoji texture 🤖
        const headCanvas = document.createElement('canvas');
        headCanvas.width = 128;
        headCanvas.height = 128;
        const ctx = headCanvas.getContext('2d');
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(0, 0, 128, 128);
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🤖', 64, 64);
        
        const headTexture = new THREE.CanvasTexture(headCanvas);
        const headGeometry = new THREE.PlaneGeometry(1, 1);
        const headMaterial = new THREE.MeshBasicMaterial({ 
            map: headTexture, 
            transparent: true,
            side: THREE.DoubleSide
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;
        head.name = 'head';
        robot.add(head);

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
                // Gentle head rotation (emoji always faces camera)
                if (head) {
                    head.rotation.z = Math.sin(time * 1.5) * 0.05;
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
                // Head rotation (looking around) - keep emoji facing camera
                if (head) {
                    head.rotation.z = Math.sin(time * 2) * 0.2;
                    robot.position.y = Math.sin(time * 3) * 0.08;
                }
                break;

            case 'speaking':
                // Head bob while speaking
                if (head) {
                    head.position.y = 1.2 + Math.sin(time * 5) * 0.08;
                    head.scale.setScalar(1 + Math.sin(time * 5) * 0.03);
                }
                // Arm gestures
                if (leftArm && rightArm) {
                    leftArm.rotation.z = 0.3 + Math.sin(time * 4) * 0.2;
                    rightArm.rotation.z = -0.3 - Math.sin(time * 4) * 0.2;
                }
                break;

            case 'editing':
                // Rapid arm movements, tilted head, focused eye pulse
                if (leftArm) leftArm.rotation.z = Math.sin(time * 10) * 0.5 - 0.3;
                if (rightArm) rightArm.rotation.z = Math.sin(time * 10 + Math.PI) * 0.5 + 0.3;
                if (head) {
                    head.rotation.z = 0.1; // Slightly tilted
                    head.position.y = 1.2;
                }
                // Fast focused eye pulse
                if (eye) {
                    eye.material.opacity = 0.9 + Math.sin(time * 8) * 0.1;
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
            robotName: state.robotName,
            position: state.position,
            animationState: state.animationState,
            facing: state.facing,
            currentAction: state.currentAction,
            lastActivity: state.lastActivity,
            sessionId: state.sessionId,
            canEditPages: state.canEditPages,
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
                    state.robotName = loaded.robotName || state.robotName;
                    state.position = loaded.position || state.position;
                    state.animationState = loaded.animationState || state.animationState;
                    state.facing = loaded.facing || state.facing;
                    state.currentAction = loaded.currentAction || state.currentAction;
                    state.sessionId = loaded.sessionId || state.sessionId;
                    state.canEditPages = loaded.canEditPages || state.canEditPages;
                }
            }
        } catch (e) {
            console.warn('Failed to load robot state:', e);
        }
    }

    /**
     * Show notification to user
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `robot-notification robot-notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#00f0ff'};
            color: #000;
            padding: 15px 25px;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: 14px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add CSS animation
        if (!document.getElementById('robot-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'robot-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Enable/disable autonomous editing
     */
    function enableAutonomousEditing(enabled) {
        state.canEditPages = enabled;
        saveState();
        
        if (enabled) {
            showNotification('🤖 R3-D3: Autonomous editing enabled', 'success');
        } else {
            showNotification('🤖 R3-D3: Autonomous editing disabled', 'info');
        }
    }

    /**
     * Edit a page using ARAYA services
     */
    async function editPage(filePathOrShortcut, changeDescription) {
        if (!state.canEditPages) {
            showNotification('🤖 R3-D3: Editing disabled. Enable first!', 'error');
            return { success: false, error: 'Autonomous editing is disabled' };
        }
        
        state.isEditing = true;
        setAnimationState('editing');
        setAction('Editing page...');
        
        try {
            showNotification(`🤖 R3-D3: Analyzing edit request...`, 'info');
            
            // Call ARAYA Bridge to parse the edit
            const bridgeResponse = await fetch('http://localhost:5002/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_message: changeDescription,
                    file_path: filePathOrShortcut
                })
            });
            
            if (!bridgeResponse.ok) {
                throw new Error(`ARAYA Bridge error: ${bridgeResponse.status}`);
            }
            
            const result = await bridgeResponse.json();
            
            if (result.success) {
                showNotification(`🤖 R3-D3: ✅ ${result.message || 'Edit successful!'}`, 'success');
                setAction('Edit completed!');
                setTimeout(() => {
                    state.isEditing = false;
                    setAnimationState('idle');
                }, 2000);
                return { success: true, result: result };
            } else {
                throw new Error(result.error || 'Edit failed');
            }
        } catch (error) {
            console.error('R3-D3 Edit Error:', error);
            showNotification(`🤖 R3-D3: ❌ ${error.message}`, 'error');
            setAction('Edit failed');
            state.isEditing = false;
            setTimeout(() => setAnimationState('idle'), 1000);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get robot name
     */
    function getName() {
        return state.robotName;
    }

    /**
     * Check if robot is currently editing
     */
    function isEditingNow() {
        return state.isEditing;
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
        getName,
        isEditing: isEditingNow,
        editPage,
        enableAutonomousEditing,
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
