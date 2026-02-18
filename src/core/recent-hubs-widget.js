/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Recent Hubs Widget
 * Displays recently visited developer hubs for quick access
 * 
 * Features:
 * - Shows recent hubs with visit counts
 * - Displays personalized welcome message
 * - Hub recommendations
 * - Visit statistics
 * 
 * @author Barbrick Design
 * @date 2026-02-18
 */

(function() {
    'use strict';

    class RecentHubsWidget {
        constructor(containerId = 'recent-hubs-widget') {
            this.containerId = containerId;
            this.container = null;
            
            // Wait for dependencies to load
            this.waitForDependencies();
        }

        /**
         * Wait for required dependencies
         */
        waitForDependencies() {
            const checkDependencies = () => {
                if (window.userIdentityManager && window.hubVisitTracker) {
                    this.init();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        }

        /**
         * Initialize widget
         */
        init() {
            console.log('🎨 Initializing Recent Hubs Widget...');
            
            // Get or create container
            this.container = document.getElementById(this.containerId);
            
            if (!this.container) {
                // Create container if it doesn't exist
                this.createContainer();
            }
            
            // Render widget
            this.render();
            
            // Listen for identity changes
            window.userIdentityManager.onIdentityChange(() => this.render());
            
            // Listen for hub visits
            window.addEventListener('hubVisited', () => this.render());
            
            console.log('✅ Recent Hubs Widget ready');
        }

        /**
         * Create container element
         */
        createContainer() {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            
            // Try to insert after header or at top of main content
            const header = document.querySelector('header');
            const main = document.querySelector('main');
            
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(this.container, header.nextSibling);
            } else if (main) {
                main.insertBefore(this.container, main.firstChild);
            } else {
                document.body.insertBefore(this.container, document.body.firstChild);
            }
        }

        /**
         * Render widget
         */
        render() {
            if (!this.container) return;
            
            const identity = window.userIdentityManager.getIdentity();
            const recentHubs = window.hubVisitTracker.getRecentHubs(5);
            const recommendations = window.hubVisitTracker.getRecommendations(3);
            const stats = window.hubVisitTracker.getStatistics();
            
            // Only show if user has visited hubs or is identified
            const shouldShow = recentHubs.length > 0 || identity.authMethod !== 'anonymous';
            
            if (!shouldShow) {
                this.container.style.display = 'none';
                return;
            }
            
            this.container.style.display = 'block';
            this.container.innerHTML = this.generateHTML(identity, recentHubs, recommendations, stats);
            
            // Add event listeners
            this.attachEventListeners();
        }

        /**
         * Generate widget HTML
         */
        generateHTML(identity, recentHubs, recommendations, stats) {
            const welcomeMessage = this.getWelcomeMessage(identity);
            
            return `
                <div class="recent-hubs-widget-container">
                    <style>
                        .recent-hubs-widget-container {
                            background: linear-gradient(135deg, rgba(58, 160, 255, 0.1), rgba(123, 211, 255, 0.05));
                            border: 1px solid rgba(58, 160, 255, 0.2);
                            border-radius: 12px;
                            padding: 20px;
                            margin: 20px auto;
                            max-width: 1200px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        }
                        
                        .recent-hubs-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            flex-wrap: wrap;
                            gap: 10px;
                        }
                        
                        .welcome-message {
                            font-size: 1.2em;
                            font-weight: 600;
                            color: #e7eef7;
                        }
                        
                        .welcome-message .user-name {
                            color: #3aa0ff;
                        }
                        
                        .hub-stats {
                            display: flex;
                            gap: 15px;
                            font-size: 0.9em;
                            color: #8aa0b6;
                        }
                        
                        .hub-stats-item {
                            display: flex;
                            align-items: center;
                            gap: 5px;
                        }
                        
                        .recent-hubs-content {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                            gap: 15px;
                            margin-bottom: 15px;
                        }
                        
                        .hub-section {
                            background: rgba(18, 24, 33, 0.6);
                            border-radius: 8px;
                            padding: 15px;
                            border: 1px solid rgba(31, 42, 55, 0.8);
                        }
                        
                        .hub-section-title {
                            font-size: 1em;
                            font-weight: 600;
                            margin-bottom: 12px;
                            color: #e7eef7;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        
                        .hub-list {
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                        }
                        
                        .hub-item {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 10px 12px;
                            background: rgba(11, 15, 20, 0.6);
                            border-radius: 6px;
                            border: 1px solid rgba(58, 160, 255, 0.1);
                            text-decoration: none;
                            color: #e7eef7;
                            transition: all 0.2s ease;
                            cursor: pointer;
                        }
                        
                        .hub-item:hover {
                            background: rgba(58, 160, 255, 0.15);
                            border-color: rgba(58, 160, 255, 0.3);
                            transform: translateX(4px);
                        }
                        
                        .hub-item-left {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            flex: 1;
                        }
                        
                        .hub-icon {
                            font-size: 1.5em;
                        }
                        
                        .hub-info {
                            flex: 1;
                        }
                        
                        .hub-name {
                            font-weight: 500;
                            font-size: 0.95em;
                            margin-bottom: 2px;
                        }
                        
                        .hub-meta {
                            font-size: 0.8em;
                            color: #8aa0b6;
                        }
                        
                        .hub-badge {
                            background: rgba(58, 160, 255, 0.2);
                            color: #7bd3ff;
                            padding: 3px 8px;
                            border-radius: 4px;
                            font-size: 0.8em;
                            font-weight: 500;
                        }
                        
                        .hub-badge.recommendation {
                            background: rgba(255, 176, 46, 0.2);
                            color: #ffb02e;
                        }
                        
                        .no-hubs-message {
                            text-align: center;
                            padding: 20px;
                            color: #8aa0b6;
                            font-style: italic;
                        }
                        
                        .widget-toggle {
                            background: none;
                            border: none;
                            color: #8aa0b6;
                            cursor: pointer;
                            font-size: 0.9em;
                            padding: 5px 10px;
                            transition: color 0.2s;
                        }
                        
                        .widget-toggle:hover {
                            color: #3aa0ff;
                        }
                        
                        @media (max-width: 768px) {
                            .recent-hubs-content {
                                grid-template-columns: 1fr;
                            }
                            
                            .hub-stats {
                                width: 100%;
                                justify-content: space-around;
                            }
                        }
                    </style>
                    
                    <div class="recent-hubs-header">
                        <div class="welcome-message">
                            ${welcomeMessage}
                        </div>
                        <div class="hub-stats">
                            <div class="hub-stats-item">
                                <span>🎯</span>
                                <span>${stats.uniqueHubsVisited}/${stats.totalHubsAvailable} Hubs</span>
                            </div>
                            <div class="hub-stats-item">
                                <span>📊</span>
                                <span>${stats.totalVisits} Visits</span>
                            </div>
                            ${stats.explorationRate > 0 ? `
                            <div class="hub-stats-item">
                                <span>🚀</span>
                                <span>${stats.explorationRate}% Explored</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="recent-hubs-content">
                        ${this.generateRecentHubsSection(recentHubs)}
                        ${recommendations.length > 0 ? this.generateRecommendationsSection(recommendations) : ''}
                    </div>
                </div>
            `;
        }

        /**
         * Generate welcome message
         */
        getWelcomeMessage(identity) {
            const name = window.userIdentityManager.getDisplayName();
            const timeOfDay = this.getTimeOfDay();
            
            if (identity.authMethod === 'anonymous') {
                return `${timeOfDay} 👋 <span class="user-name">Welcome Back!</span>`;
            }
            
            return `${timeOfDay} 👋 <span class="user-name">${name}</span>`;
        }

        /**
         * Get time of day greeting
         */
        getTimeOfDay() {
            const hour = new Date().getHours();
            if (hour < 12) return 'Good Morning';
            if (hour < 18) return 'Good Afternoon';
            return 'Good Evening';
        }

        /**
         * Generate recent hubs section
         */
        generateRecentHubsSection(recentHubs) {
            if (recentHubs.length === 0) {
                return `
                    <div class="hub-section">
                        <div class="hub-section-title">
                            <span>⏱️</span> Recent Hubs
                        </div>
                        <div class="no-hubs-message">
                            No hubs visited yet. Explore developer hubs to see them here!
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="hub-section">
                    <div class="hub-section-title">
                        <span>⏱️</span> Recent Hubs
                    </div>
                    <div class="hub-list">
                        ${recentHubs.map(hub => this.generateHubItem(hub, false)).join('')}
                    </div>
                </div>
            `;
        }

        /**
         * Generate recommendations section
         */
        generateRecommendationsSection(recommendations) {
            return `
                <div class="hub-section">
                    <div class="hub-section-title">
                        <span>💡</span> Recommended
                    </div>
                    <div class="hub-list">
                        ${recommendations.map(hub => this.generateHubItem(hub, true)).join('')}
                    </div>
                </div>
            `;
        }

        /**
         * Generate hub item HTML
         */
        generateHubItem(hub, isRecommendation) {
            const visitCount = hub.visitData ? hub.visitData.visitCount : 0;
            const lastVisit = hub.visitData ? this.formatTimeAgo(hub.visitData.lastVisit) : null;
            
            return `
                <a href="${hub.hubId}" class="hub-item" data-hub-id="${hub.hubId}">
                    <div class="hub-item-left">
                        <div class="hub-icon">${hub.icon}</div>
                        <div class="hub-info">
                            <div class="hub-name">${hub.name}</div>
                            <div class="hub-meta">
                                ${isRecommendation 
                                    ? hub.category 
                                    : `${lastVisit || 'Never visited'}`
                                }
                            </div>
                        </div>
                    </div>
                    ${visitCount > 0 
                        ? `<div class="hub-badge">${visitCount} visits</div>` 
                        : isRecommendation 
                            ? `<div class="hub-badge recommendation">Try it!</div>`
                            : ''
                    }
                </a>
            `;
        }

        /**
         * Format time ago
         */
        formatTimeAgo(timestamp) {
            const seconds = Math.floor((Date.now() - timestamp) / 1000);
            
            if (seconds < 60) return 'Just now';
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
            if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
            if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
            return `${Math.floor(seconds / 604800)}w ago`;
        }

        /**
         * Attach event listeners
         */
        attachEventListeners() {
            // Hub item clicks are handled by regular links
            // No additional event listeners needed
        }
    }

    // Auto-initialize if container exists
    window.addEventListener('DOMContentLoaded', () => {
        window.recentHubsWidget = new RecentHubsWidget();
    });

    console.log('✅ Recent Hubs Widget module loaded');
})();
