/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Hub Tracking Enabler
 * Simple script to enable user identification and hub tracking on any hub page
 * 
 * Usage: Add this script tag to any hub page:
 * <script src="/src/core/hub-tracking-enabler.js"></script>
 * 
 * @author Barbrick Design
 * @date 2026-02-18
 */

(function() {
    'use strict';

    console.log('🔌 Hub Tracking Enabler loading...');

    // Load required scripts
    const scriptsToLoad = [
        '/src/core/user-identity-manager.js',
        '/src/core/hub-visit-tracker.js'
    ];

    let loadedScripts = 0;

    scriptsToLoad.forEach(scriptPath => {
        // Check if script is already loaded
        const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
        if (existingScript) {
            loadedScripts++;
            if (loadedScripts === scriptsToLoad.length) {
                onAllScriptsLoaded();
            }
            return;
        }

        const script = document.createElement('script');
        script.src = scriptPath;
        script.async = false;
        script.onload = () => {
            console.log(`✅ Loaded: ${scriptPath}`);
            loadedScripts++;
            if (loadedScripts === scriptsToLoad.length) {
                onAllScriptsLoaded();
            }
        };
        script.onerror = () => {
            console.error(`❌ Failed to load: ${scriptPath}`);
            loadedScripts++;
            if (loadedScripts === scriptsToLoad.length) {
                onAllScriptsLoaded();
            }
        };
        document.head.appendChild(script);
    });

    function onAllScriptsLoaded() {
        console.log('✅ Hub tracking system ready');
        
        // Add a small welcome message to the page
        displayWelcomeMessage();
    }

    /**
     * Display a subtle welcome message for returning users
     */
    function displayWelcomeMessage() {
        // Wait for user identity manager to be available
        const checkIdentityManager = setInterval(() => {
            if (window.userIdentityManager && window.hubVisitTracker) {
                clearInterval(checkIdentityManager);
                
                const identity = window.userIdentityManager.getIdentity();
                const isReturningUser = window.userIdentityManager.isIdentified() || 
                                       window.hubVisitTracker.getStatistics().totalVisits > 1;
                
                if (isReturningUser && identity) {
                    showWelcomeToast(identity);
                }
            }
        }, 100);
        
        // Clear interval after 5 seconds if not loaded
        setTimeout(() => clearInterval(checkIdentityManager), 5000);
    }

    /**
     * Show a welcome toast message
     */
    function showWelcomeToast(identity) {
        const name = window.userIdentityManager.getDisplayName();
        const stats = window.hubVisitTracker.getStatistics();
        
        const toast = document.createElement('div');
        toast.className = 'hub-welcome-toast';
        toast.innerHTML = `
            <style>
                .hub-welcome-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, rgba(58, 160, 255, 0.95), rgba(123, 211, 255, 0.9));
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    animation: slideInRight 0.5s ease, fadeOut 0.5s ease 4.5s forwards;
                    max-width: 300px;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                
                .hub-welcome-toast .toast-title {
                    font-weight: 600;
                    margin-bottom: 5px;
                    font-size: 1em;
                }
                
                .hub-welcome-toast .toast-message {
                    font-size: 0.9em;
                    opacity: 0.9;
                }
                
                @keyframes slideInRight {
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
                    to {
                        opacity: 0;
                        transform: translateX(400px);
                    }
                }
                
                @media (max-width: 768px) {
                    .hub-welcome-toast {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            </style>
            <div class="toast-title">👋 Welcome back, ${name}!</div>
            <div class="toast-message">
                ${stats.uniqueHubsVisited > 1 
                    ? `You've visited ${stats.uniqueHubsVisited} hubs (${stats.explorationRate}% explored)`
                    : 'Explore more developer hubs!'
                }
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove after animation completes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    console.log('✅ Hub Tracking Enabler loaded');
})();
