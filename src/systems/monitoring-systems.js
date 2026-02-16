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
 * File: monitoring-systems.js
 * Declaration ID: IP-4A6A7208-MLL28ZW8
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

/** SIGNED BY MeRLynn - ID: MERLYNN-6c244bbe - TIMESTAMP: 2025-12-19T05:53:06.542Z - HASH: 6aa6b4e5 */
/** SIGNED BY AGentR - ID: AGENTR-22c1234b - TIMESTAMP: 2025-12-19T05:53:06.542Z - HASH: 6aa6b4e5 */

// Agent Monitoring System - Monitoring Systems Module
// Enhanced monitoring for performance, security, and system health

function setupEnhancedErrorMonitoring() {
    if (!window.agentSystem) return;

    const agentSystem = window.agentSystem;

    // Monitor for network errors
    window.addEventListener('offline', () => {
        agentSystem.recordError('network', {
            message: 'Network connection lost - attempting reconnection'
        });
    });

    window.addEventListener('online', () => {
        agentSystem.log('✅ Network connection restored');
    });

    // Monitor for script loading errors
    document.addEventListener('error', (event) => {
        if (event.target.tagName === 'SCRIPT') {
            agentSystem.recordError('script-loading', {
                message: `Script failed to load: ${event.target.src || event.target.innerHTML}`,
                filename: event.target.src || 'inline-script'
            });
        }
    }, true);

    // Monitor for resource loading errors (images, CSS, etc.)
    window.addEventListener('error', (event) => {
        if (event.target.tagName === 'IMG') {
            agentSystem.recordError('image-loading', {
                message: `Image failed to load: ${event.target.src}`,
                filename: event.target.src
            });
        }
    }, true);

    // Monitor for CSS loading errors
    document.addEventListener('error', (event) => {
        if (event.target.tagName === 'LINK' && event.target.rel === 'stylesheet') {
            agentSystem.recordError('css-loading', {
                message: `CSS failed to load: ${event.target.href}`,
                filename: event.target.href
            });
        }
    }, true);

    // Monitor for WebSocket errors (if any)
    if ('WebSocket' in window) {
        const originalWebSocket = window.WebSocket;
        window.WebSocket = function(url, protocols) {
            const ws = new originalWebSocket(url, protocols);
            ws.addEventListener('error', (event) => {
                agentSystem.recordError('websocket', {
                    message: `WebSocket error for ${url}`,
                    url: url
                });
            });
            return ws;
        };
    }

    // Monitor for fetch/API errors
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch(...args);
            if (!response.ok) {
                agentSystem.recordError('api-error', {
                    message: `API request failed: ${response.status} ${response.statusText}`,
                    url: args[0],
                    status: response.status
                });
            }
            return response;
        } catch (error) {
            agentSystem.recordError('fetch-error', {
                message: `Fetch request failed: ${error.message}`,
                url: args[0]
            });
            throw error;
        }
    };

    // Monitor for localStorage/IndexedDB errors
    try {
        localStorage.setItem('agent-test', 'test');
        localStorage.removeItem('agent-test');
    } catch (storageError) {
        agentSystem.recordError('storage-error', {
            message: `Storage error: ${storageError.message}`,
            error: storageError
        });
    }

    // Monitor for performance issues
    if ('performance' in window && 'PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint' && entry.startTime > 4000) {
                        agentSystem.recordError('performance', {
                            message: `Slow LCP detected: ${Math.round(entry.startTime)}ms`,
                            metric: 'lcp',
                            value: entry.startTime
                        });
                    }
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (perfError) {
            // PerformanceObserver not supported
        }
    }

    // Monitor for memory issues
    if ('performance' in window && performance.memory) {
        setInterval(() => {
            const memUsage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
            if (memUsage > 0.8) {
                agentSystem.recordError('memory', {
                    message: `High memory usage: ${Math.round(memUsage * 100)}%`,
                    usage: memUsage
                });
            }
        }, 60000);
    }

    console.log('🔍 Enhanced error monitoring activated for real site issues');
}

// Monitor for real DOM issues that occur during normal operation
function monitorDOMIssues() {
    if (!window.agentSystem) return;

    // Check for missing critical elements every 30 seconds
    setInterval(() => {
        const criticalElements = [
            '.project-card',
            '#walletButtonContainer',
            '.portfolio-ticker',
            'script[src*="universal-wallet-auth"]',
            'script[src*="auth-integration"]'
        ];

        criticalElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (!element) {
                window.agentSystem.recordError('missing-element', {
                    message: `Critical element missing: ${selector}`,
                    selector: selector
                });
            }
        });
    }, 30000);
}

// Initialize monitoring systems
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        setupEnhancedErrorMonitoring();
        monitorDOMIssues();
    }, 3000);
});

console.log('🔍 Monitoring Systems loaded');

// Export functions globally for other modules to use
window.setupEnhancedErrorMonitoring = setupEnhancedErrorMonitoring;
window.monitorDOMIssues = monitorDOMIssues;
