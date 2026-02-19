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

    // ============================================
    // R3-D3 DISABLED - Unfinished project, put aside
    // Set to false to re-enable when ready
    // Disabled: February 18, 2026
    // ============================================
    const R3D3_DISABLED = true;

    if (R3D3_DISABLED) {
        console.log('🤖 R3-D3 Robot Assistant is disabled (unfinished project)');
        return;
    }

    console.log('🤖 Loading R3-D3 Robot Assistant...');

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

                    // Load AUL Agent Connector
                    console.log('🔌 Loading AUL Agent Connector...');
                    await loadScript('/js/robot-aul-connector.js');
                    console.log('✅ AUL Agent Connector loaded');
                    
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

            // Load html2canvas for screenshot capability (optional)
            console.log('📸 Loading html2canvas...');
            try {
                await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
                console.log('✅ html2canvas loaded');
            } catch (error) {
                console.log('⚠️ html2canvas unavailable, AI Vision will use fallback');
            }

            // Load Enhanced Gemini API (optional, for advanced features)
            console.log('✨ Loading Enhanced Gemini API...');
            try {
                await loadScript('/js/robot-gemini-enhanced.js');
                console.log('✅ Enhanced Gemini API loaded (Real-time editing, Streaming, Enhanced vision)');
            } catch (error) {
                console.log('⚠️ Enhanced Gemini API unavailable, using basic vision only');
            }

            // Load AUL Agent Connector
            console.log('🔌 Loading AUL Agent Connector...');
            await loadScript('/js/robot-aul-connector.js');
            console.log('✅ AUL Agent Connector loaded');

            // Provide user feedback
            if (window.RobotAssistant) {
                console.log('✨ R3-D3 Robot Assistant is ready!');
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
        notification.innerHTML = '🤖 R3-D3 Activated';

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
        },

        /**
         * Get robot name (r3-d3)
         */
        getName: () => {
            if (window.RobotAssistant) {
                return window.RobotAssistant.getName();
            }
            return null;
        },

        /**
         * Check if robot is currently editing
         */
        isEditing: () => {
            if (window.RobotAssistant) {
                return window.RobotAssistant.isEditing();
            }
            return false;
        },

        /**
         * Edit a page autonomously
         * @param {string} filePathOrShortcut - File path or shortcut (e.g., 'homepage', 'index.html')
         * @param {string} changeDescription - Natural language description of the change
         * @returns {Promise<{success: boolean, result?: any, error?: string}>}
         */
        editPage: async (filePathOrShortcut, changeDescription) => {
            if (window.RobotAssistant) {
                return await window.RobotAssistant.editPage(filePathOrShortcut, changeDescription);
            }
            return { success: false, error: 'Robot Assistant not loaded' };
        },

        /**
         * Enable or disable autonomous editing
         * @param {boolean} enabled - Whether to enable autonomous editing
         * @returns {Promise<{success: boolean, message?: string, error?: string}>}
         */
        enableAutonomousEditing: async (enabled) => {
            if (window.RobotAssistant) {
                return await window.RobotAssistant.enableAutonomousEditing(enabled);
            }
            return { success: false, error: 'Robot Assistant not loaded' };
        },

        /**
         * Check authentication status
         * @returns {boolean} - Whether user is authenticated
         */
        checkAuthentication: () => {
            if (window.RobotAssistant) {
                return window.RobotAssistant.checkAuthentication();
            }
            return false;
        },

        /**
         * Check if user is authenticated
         * @returns {boolean}
         */
        isAuthenticated: () => {
            if (window.RobotAssistant) {
                return window.RobotAssistant.isAuthenticated();
            }
            return false;
        },

        /**
         * Get authenticated user's email
         * @returns {string|null}
         */
        getUserEmail: () => {
            if (window.RobotAssistant) {
                return window.RobotAssistant.getUserEmail();
            }
            return null;
        },

        /**
         * Check if user is admin
         * @returns {boolean}
         */
        isAdmin: () => {
            if (window.RobotAssistant) {
                return window.RobotAssistant.isAdmin();
            }
            return false;
        }
    };

    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
