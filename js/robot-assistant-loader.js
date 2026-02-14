/**
 * ARAYA Robot Assistant Loader
 * 
 * Automatically loads Three.js and the robot assistant on any page.
 * Just include this script and the robot will appear!
 * 
 * Usage:
 * <script src="/js/robot-assistant-loader.js"></script>
 */

(function() {
    'use strict';

    console.log('🤖 Loading ARAYA Robot Assistant...');

    // Check if already loaded
    if (window._robotAssistantLoaded) {
        console.log('🤖 Robot Assistant already loaded');
        return;
    }
    window._robotAssistantLoaded = true;

    // Configuration
    const THREEJS_VERSION = 'r152';
    const THREEJS_CDN = `https://cdn.jsdelivr.net/npm/three@0.${THREEJS_VERSION.substring(1)}/build/three.min.js`;

    /**
     * Load a script dynamically
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Initialize robot assistant
     */
    async function init() {
        try {
            // Try to load Three.js version first
            if (typeof THREE === 'undefined') {
                console.log('📦 Loading Three.js...');
                try {
                    await loadScript(THREEJS_CDN);
                    console.log('✅ Three.js loaded');
                } catch (error) {
                    console.log('⚠️ Three.js unavailable, using CSS fallback');
                    // Load CSS version instead
                    await loadScript('/js/robot-assistant-css.js');
                    console.log('✅ Robot Assistant loaded (CSS version)');
                    
                    // Load AI Brain
                    console.log('🧠 Loading Robot AI Brain...');
                    await loadScript('/js/robot-ai-brain.js');
                    console.log('✅ Robot AI Brain loaded');
                    
                    showLoadNotification();
                    return;
                }
            }

            // Load Three.js robot assistant
            console.log('🤖 Loading Robot Assistant module...');
            await loadScript('/js/robot-assistant.js');
            console.log('✅ Robot Assistant loaded (3D version)');

            // Load AI Brain
            console.log('🧠 Loading Robot AI Brain...');
            await loadScript('/js/robot-ai-brain.js');
            console.log('✅ Robot AI Brain loaded');

            // Provide user feedback
            if (window.RobotAssistant) {
                console.log('✨ ARAYA Robot Assistant is ready!');
                showLoadNotification();
            }
        } catch (error) {
            console.error('❌ Failed to load Robot Assistant:', error);
            // Try CSS fallback as last resort
            try {
                await loadScript('/js/robot-assistant-css.js');
                console.log('✅ Robot Assistant loaded (CSS fallback)');
            } catch (fallbackError) {
                console.error('❌ All robot loading attempts failed');
            }
        }
    }

    /**
     * Show a brief notification that robot is loaded
     */
    function showLoadNotification() {
        // Only show once per session
        if (sessionStorage.getItem('robot_notification_shown')) {
            return;
        }

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00f0ff, #9370db);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 240, 255, 0.4);
            z-index: 10000;
            font-family: 'Orbitron', monospace;
            font-size: 14px;
            animation: slideIn 0.5s ease-out, fadeOut 0.5s ease-in 2.5s;
            pointer-events: none;
        `;
        notification.innerHTML = '🤖 Robot Assistant Activated';

        // Add animation styles
        const style = document.createElement('style');
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
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);

        sessionStorage.setItem('robot_notification_shown', 'true');
    }

    /**
     * Expose helper functions globally for page integration
     */
    window.RobotAssistantLoader = {
        /**
         * Move robot to specific coordinates
         */
        moveTo: (x, y) => {
            if (window.RobotAssistant) {
                window.RobotAssistant.moveTo(x, y);
            }
        },

        /**
         * Set robot animation state
         */
        setState: (state) => {
            if (window.RobotAssistant) {
                window.RobotAssistant.setAnimationState(state);
            }
        },

        /**
         * Set robot action message
         */
        setAction: (action) => {
            if (window.RobotAssistant) {
                window.RobotAssistant.setAction(action);
            }
        },

        /**
         * Get robot state
         */
        getState: () => {
            if (window.RobotAssistant) {
                return window.RobotAssistant.getState();
            }
            return null;
        }
    };

    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
