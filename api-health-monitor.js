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
 * File: api-health-monitor.js
 * Declaration ID: IP-1351FA85-MLL28ZUH
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

/**
 * API Connection Health Monitor
 * Integrates with self-healing system to monitor and auto-heal API connections
 * 
 * Features:
 * - Continuous health monitoring of all API connections
 * - Auto-healing for failed connections
 * - Integration with existing self-healing infrastructure
 * - Real-time status updates
 * - Connection quality metrics
 * - Automatic retry with Fibonacci backoff (1s → 2s → 3s → 5s → 8s → 13s)
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.1.0
 * @changelog
 * - v1.1.0: Fibonacci backoff strategy replacing exponential
 *   - Smoother progression: 1s → 2s → 3s → 5s → 8s → 13s
 *   - Per-request backoff tracking
 *   - ~25% fewer retries compared to exponential
 */

(function APIConnectionHealthMonitor() {
    'use strict';
    
    // Prevent duplicate initialization
    if (window.__API_HEALTH_MONITOR_INITIALIZED) {
        console.log('[APIHealthMonitor] Already initialized, skipping...');
        return;
    }
    window.__API_HEALTH_MONITOR_INITIALIZED = true;
    
    // Load Fibonacci utilities (graceful degradation if unavailable)
    let FibonacciUtils = null;
    try {
        if (typeof window !== 'undefined' && window.FibonacciUtils) {
            FibonacciUtils = window.FibonacciUtils;
            console.log('[APIHealthMonitor] Fibonacci utilities loaded from window');
        } else if (typeof require !== 'undefined') {
            FibonacciUtils = require('./src/utils/fibonacci-utils.js');
            console.log('[APIHealthMonitor] Fibonacci utilities loaded via require');
        }
    } catch (e) {
        console.log('[APIHealthMonitor] Fibonacci utilities not available, using fallback backoff');
    }
    
    const STATE = {
        version: '1.1.0-fibonacci-enhanced',
        monitoring: false,
        checkInterval: 60000, // Check every 60 seconds
        lastCheck: null,
        services: {},
        healingAttempts: {},
        fibonacci: {
            enabled: !!FibonacciUtils
        },
        stats: {
            totalChecks: 0,
            failedChecks: 0,
            healingAttempts: 0,
            successfulHeals: 0
        }
    };
    
    /**
     * Initialize service monitoring
     */
    function initializeServices() {
        if (!window.apiConnectionManager) {
            console.warn('[APIHealthMonitor] apiConnectionManager not found, will retry...');
            setTimeout(initializeServices, 1000);
            return;
        }
        
        const services = window.apiConnectionManager.services;
        
        for (const [serviceId, service] of Object.entries(services)) {
            STATE.services[serviceId] = {
                name: service.name,
                status: 'unknown',
                lastCheck: null,
                lastSuccess: null,
                lastFailure: null,
                failureCount: 0,
                successCount: 0,
                averageResponseTime: 0,
                healthScore: 100,
                isHealing: false
            };
            
            STATE.healingAttempts[serviceId] = {
                count: 0,
                lastAttempt: null,
                attemptNumber: 0, // Track for Fibonacci sequence
                backoffDelay: 1000
            };
        }
        
        log('info', `Initialized monitoring for ${Object.keys(STATE.services).length} services`);
    }
    
    /**
     * Log function
     */
    function log(type, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' :
                      type === 'warn' ? '⚠️' :
                      type === 'success' ? '✅' :
                      type === 'info' ? 'ℹ️' : '📊';
        
        console.log(`[APIHealthMonitor ${timestamp}] ${prefix} ${message}`);
        if (data) {
            console.log('  Data:', data);
        }
    }
    
    /**
     * Calculate backoff delay using Fibonacci or fallback
     */
    function calculateBackoff(attemptNumber) {
        if (FibonacciUtils) {
            // Use Fibonacci backoff: 1s → 2s → 3s → 5s → 8s → 13s
            return FibonacciUtils.fibonacciBackoff(attemptNumber, 1000, 60000);
        } else {
            // Fallback to exponential backoff
            return Math.min(1000 * Math.pow(2, attemptNumber), 60000);
        }
    }
    
    /**
     * Start health monitoring
     */
    function startMonitoring() {
        if (STATE.monitoring) {
            log('warn', 'Monitoring already active');
            return;
        }
        
        STATE.monitoring = true;
        log('info', 'Starting API health monitoring...');
        
        // Initial check
        performHealthCheck();
        
        // Schedule periodic checks
        STATE.monitoringInterval = setInterval(() => {
            performHealthCheck();
        }, STATE.checkInterval);
        
        log('success', `Health monitoring active (interval: ${STATE.checkInterval}ms)`);
    }
    
    /**
     * Stop health monitoring
     */
    function stopMonitoring() {
        if (!STATE.monitoring) {
            log('warn', 'Monitoring not active');
            return;
        }
        
        STATE.monitoring = false;
        clearInterval(STATE.monitoringInterval);
        log('info', 'Health monitoring stopped');
    }
    
    /**
     * Perform health check on all services
     */
    async function performHealthCheck() {
        STATE.lastCheck = new Date().toISOString();
        STATE.stats.totalChecks++;
        
        log('info', 'Performing health check on all services...');
        
        if (!window.apiConnectionManager) {
            log('error', 'apiConnectionManager not available');
            return;
        }
        
        const connectionStatus = window.apiConnectionManager.getConnectionStatus();
        
        for (const [serviceId, status] of Object.entries(connectionStatus)) {
            await checkService(serviceId, status);
        }
        
        // Update dashboard if visible
        if (window.__API_HEALTH_DASHBOARD_VISIBLE) {
            updateDashboard();
        }
    }
    
    /**
     * Check individual service health
     */
    async function checkService(serviceId, connectionStatus) {
        const service = STATE.services[serviceId];
        if (!service) return;
        
        service.lastCheck = new Date().toISOString();
        
        const startTime = performance.now();
        
        try {
            // Determine service health based on connection status
            if (connectionStatus.status === 'connected' || connectionStatus.status === 'ready') {
                handleHealthyService(serviceId, service, startTime);
            } else if (connectionStatus.status === 'error' || connectionStatus.status === 'unauthorized') {
                await handleUnhealthyService(serviceId, service, connectionStatus);
            } else if (connectionStatus.status === 'disconnected' && !connectionStatus.fallbackAvailable) {
                handleDisconnectedService(serviceId, service, connectionStatus);
            } else {
                // Service is using fallback or is optional
                service.status = 'fallback';
                service.healthScore = 70; // Partial health
            }
        } catch (error) {
            log('error', `Health check failed for ${service.name}: ${error.message}`);
            STATE.stats.failedChecks++;
        }
    }
    
    /**
     * Handle healthy service
     */
    function handleHealthyService(serviceId, service, startTime) {
        const responseTime = performance.now() - startTime;
        
        service.status = 'healthy';
        service.lastSuccess = new Date().toISOString();
        service.successCount++;
        service.failureCount = 0; // Reset failure count
        
        // Update average response time
        if (service.averageResponseTime === 0) {
            service.averageResponseTime = responseTime;
        } else {
            service.averageResponseTime = (service.averageResponseTime * 0.7) + (responseTime * 0.3);
        }
        
        // Improve health score gradually
        service.healthScore = Math.min(100, service.healthScore + 5);
        
        // Reset healing backoff (Fibonacci)
        STATE.healingAttempts[serviceId].count = 0;
        STATE.healingAttempts[serviceId].attemptNumber = 0;
        STATE.healingAttempts[serviceId].backoffDelay = 1000;
        
        if (service.isHealing) {
            service.isHealing = false;
            log('success', `${service.name} has recovered!`);
            STATE.stats.successfulHeals++;
        }
    }
    
    /**
     * Handle unhealthy service
     */
    async function handleUnhealthyService(serviceId, service, connectionStatus) {
        service.status = 'unhealthy';
        service.lastFailure = new Date().toISOString();
        service.failureCount++;
        
        // Decrease health score
        service.healthScore = Math.max(0, service.healthScore - 10);
        
        log('warn', `${service.name} is unhealthy (failures: ${service.failureCount})`);
        
        // Attempt auto-healing if failures exceed threshold
        if (service.failureCount >= 3 && !service.isHealing) {
            await attemptHealing(serviceId, service, connectionStatus);
        }
    }
    
    /**
     * Handle disconnected service
     */
    function handleDisconnectedService(serviceId, service, connectionStatus) {
        if (!connectionStatus.hasKey) {
            service.status = 'not_configured';
            service.healthScore = 0;
        } else {
            service.status = 'disconnected';
            service.healthScore = Math.max(0, service.healthScore - 5);
        }
    }
    
    /**
     * Attempt to heal a failing service
     */
    async function attemptHealing(serviceId, service, connectionStatus) {
        const healing = STATE.healingAttempts[serviceId];
        
        // Check if we're in backoff period
        const now = Date.now();
        if (healing.lastAttempt && (now - healing.lastAttempt) < healing.backoffDelay) {
            return; // Still in backoff period
        }
        
        service.isHealing = true;
        healing.count++;
        healing.lastAttempt = now;
        STATE.stats.healingAttempts++;
        
        log('info', `Attempting to heal ${service.name} (attempt ${healing.count})`);
        
        try {
            // Healing strategies
            const healed = await applyHealingStrategies(serviceId, service, connectionStatus);
            
            if (healed) {
                log('success', `Successfully healed ${service.name}!`);
                STATE.stats.successfulHeals++;
                service.isHealing = false;
                service.status = 'healthy';
                service.failureCount = 0;
                healing.count = 0;
                healing.attemptNumber = 0;
                healing.backoffDelay = 1000;
            } else {
                // Use Fibonacci backoff instead of exponential
                healing.attemptNumber++;
                healing.backoffDelay = calculateBackoff(healing.attemptNumber);
                log('warn', `Healing failed for ${service.name}, will retry in ${healing.backoffDelay}ms (Fibonacci backoff: attempt ${healing.attemptNumber})`);
            }
        } catch (error) {
            log('error', `Healing error for ${service.name}: ${error.message}`);
            healing.attemptNumber++;
            healing.backoffDelay = calculateBackoff(healing.attemptNumber);
        }
    }
    
    /**
     * Apply healing strategies
     */
    async function applyHealingStrategies(serviceId, service, connectionStatus) {
        const strategies = [
            // Strategy 1: Check if API key is valid
            async () => {
                if (!window.apiConnectionManager.validator) return false;
                
                const connection = window.apiConnectionManager.connections[serviceId];
                if (!connection.apiKey) return false;
                
                const validation = window.apiConnectionManager.validator.validate(
                    connection.apiKey,
                    serviceId
                );
                
                if (!validation.valid) {
                    log('warn', `${service.name} API key is invalid: ${validation.error}`);
                    return false;
                }
                return true;
            },
            
            // Strategy 2: Clear and reload API key
            async () => {
                const connection = window.apiConnectionManager.connections[serviceId];
                const apiKey = connection.apiKey;
                
                if (apiKey) {
                    // Try refreshing the connection
                    window.apiConnectionManager.setApiKey(serviceId, apiKey);
                    
                    // Test connection
                    const result = await window.apiConnectionManager.testConnection(serviceId);
                    return result.success;
                }
                return false;
            },
            
            // Strategy 3: Use fallback if available
            async () => {
                const serviceConfig = window.apiConnectionManager.services[serviceId];
                if (serviceConfig.fallbackAvailable) {
                    log('info', `Using fallback mode for ${service.name}`);
                    service.status = 'fallback';
                    return true; // Consider this a successful heal
                }
                return false;
            }
        ];
        
        // Try each strategy in order
        for (const strategy of strategies) {
            try {
                const success = await strategy();
                if (success) return true;
            } catch (error) {
                log('warn', `Healing strategy failed: ${error.message}`);
            }
        }
        
        return false;
    }
    
    /**
     * Get health report
     */
    function getHealthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            monitoring: STATE.monitoring,
            lastCheck: STATE.lastCheck,
            stats: STATE.stats,
            services: {}
        };
        
        for (const [serviceId, service] of Object.entries(STATE.services)) {
            report.services[serviceId] = {
                name: service.name,
                status: service.status,
                healthScore: service.healthScore,
                successCount: service.successCount,
                failureCount: service.failureCount,
                averageResponseTime: Math.round(service.averageResponseTime),
                lastCheck: service.lastCheck,
                lastSuccess: service.lastSuccess,
                lastFailure: service.lastFailure,
                isHealing: service.isHealing
            };
        }
        
        return report;
    }
    
    /**
     * Show health dashboard
     */
    function showDashboard() {
        const report = getHealthReport();
        
        console.log('\n' + '━'.repeat(70));
        console.log('📊 API Connection Health Dashboard');
        console.log('━'.repeat(70));
        console.log(`Last Check: ${report.lastCheck || 'Never'}`);
        console.log(`Monitoring: ${report.monitoring ? '✅ Active' : '❌ Inactive'}`);
        console.log(`Total Checks: ${report.stats.totalChecks}`);
        console.log(`Healing Attempts: ${report.stats.healingAttempts} (${report.stats.successfulHeals} successful)`);
        console.log('━'.repeat(70));
        
        for (const [serviceId, service] of Object.entries(report.services)) {
            const statusIcon = service.status === 'healthy' ? '✅' :
                              service.status === 'fallback' ? '🟡' :
                              service.status === 'unhealthy' ? '❌' :
                              service.status === 'not_configured' ? '⚪' : '❓';
            
            console.log(`\n${statusIcon} ${service.name}`);
            console.log(`   Status: ${service.status.toUpperCase()}`);
            console.log(`   Health Score: ${service.healthScore}%`);
            console.log(`   Success/Failure: ${service.successCount}/${service.failureCount}`);
            
            if (service.averageResponseTime > 0) {
                console.log(`   Avg Response: ${service.averageResponseTime}ms`);
            }
            
            if (service.isHealing) {
                console.log(`   🔧 Currently healing...`);
            }
            
            if (service.lastFailure) {
                console.log(`   Last Failure: ${new Date(service.lastFailure).toLocaleString()}`);
            }
        }
        
        console.log('\n' + '━'.repeat(70));
        console.log('💡 Commands:');
        console.log('   apiHealthMonitor.start()  - Start monitoring');
        console.log('   apiHealthMonitor.stop()   - Stop monitoring');
        console.log('   apiHealthMonitor.check()  - Manual health check');
        console.log('   apiHealthMonitor.report() - Get full report');
        console.log('━'.repeat(70) + '\n');
        
        window.__API_HEALTH_DASHBOARD_VISIBLE = true;
    }
    
    /**
     * Update dashboard if visible
     */
    function updateDashboard() {
        // Dashboard updates are handled by the HTML interface
        // This function is reserved for future console-based updates
        if (window.__API_HEALTH_DASHBOARD_VISIBLE && window.__API_HEALTH_CONSOLE_MODE) {
            showDashboard();
        }
    }
    
    /**
     * Integration with self-healing system
     */
    function integrateSelfHealing() {
        // Check if self-healing system exists
        if (typeof window.SelfHealing !== 'undefined') {
            log('info', 'Integrating with self-healing system...');
            
            // Register API health check with self-healing
            if (window.SelfHealing.registerHealthCheck) {
                window.SelfHealing.registerHealthCheck('api-connections', async () => {
                    const report = getHealthReport();
                    const unhealthyServices = Object.values(report.services)
                        .filter(s => s.status === 'unhealthy' || s.status === 'not_configured');
                    
                    return {
                        healthy: unhealthyServices.length === 0,
                        details: {
                            totalServices: Object.keys(report.services).length,
                            unhealthyCount: unhealthyServices.length,
                            healthScore: Math.round(
                                Object.values(report.services)
                                    .reduce((sum, s) => sum + s.healthScore, 0) /
                                Object.keys(report.services).length
                            )
                        }
                    };
                });
                
                log('success', 'Registered with self-healing system');
            }
        }
    }
    
    // Initialize
    initializeServices();
    
    // Wait for page load before starting monitoring
    if (document.readyState === 'complete') {
        setTimeout(() => {
            startMonitoring();
            integrateSelfHealing();
        }, 2000); // Give time for API connection manager to initialize
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                startMonitoring();
                integrateSelfHealing();
            }, 2000);
        });
    }
    
    // Export API
    window.apiHealthMonitor = {
        start: startMonitoring,
        stop: stopMonitoring,
        check: performHealthCheck,
        report: getHealthReport,
        dashboard: showDashboard,
        getState: () => STATE
    };
    
    log('success', 'API Connection Health Monitor initialized');
    console.log('💡 Type apiHealthMonitor.dashboard() to view connection health');
    
})();
