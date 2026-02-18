/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Hub Visit Tracker
 * Tracks user visits to developer hubs and provides recommendations
 * 
 * Features:
 * - Automatic visit tracking for all hub pages
 * - Visit frequency and recency tracking
 * - Smart recommendations based on behavior
 * - Recent hubs quick access
 * 
 * @author Barbrick Design
 * @date 2026-02-18
 */

(function() {
    'use strict';

    class HubVisitTracker {
        constructor() {
            this.currentHub = null;
            this.visitData = {};
            this.hubRegistry = this.initializeHubRegistry();
            
            // Initialize on load
            this.init();
        }

        /**
         * Initialize hub visit tracker
         */
        init() {
            console.log('📊 Initializing Hub Visit Tracker...');
            
            // Load existing visit data
            this.loadVisitData();
            
            // Detect current hub
            this.detectCurrentHub();
            
            // Track visit if on a hub page
            if (this.currentHub) {
                this.trackVisit(this.currentHub);
            }
            
            console.log('✅ Hub Visit Tracker ready');
        }

        /**
         * Initialize hub registry with metadata
         */
        initializeHubRegistry() {
            return {
                'devValueHub.html': {
                    name: 'Dev Value Hub',
                    category: 'Development',
                    description: 'Track GitHub repository valuations',
                    icon: '💎'
                },
                'agentHub.html': {
                    name: 'Agent Hub',
                    category: 'AI Agents',
                    description: 'MIB Special Agent Portal',
                    icon: '🕴️'
                },
                'team-launchpad-hub.html': {
                    name: 'Team Launchpad',
                    category: 'Collaboration',
                    description: 'Team collaboration and project management',
                    icon: '🚀'
                },
                'topstep-hub.html': {
                    name: 'TopStep Hub',
                    category: 'Trading',
                    description: 'Trading account management',
                    icon: '📈'
                },
                'topstep-social-hub.html': {
                    name: 'TopStep Social Hub',
                    category: 'Trading',
                    description: 'Social trading and copy trading',
                    icon: '🤝'
                },
                'bloom-hub.html': {
                    name: 'Bloom Hub',
                    category: 'Growth',
                    description: 'Personal and professional growth',
                    icon: '🌸'
                },
                'BloomersHub.html': {
                    name: 'Bloomers Hub',
                    category: 'Community',
                    description: 'Community collaboration',
                    icon: '🌺'
                },
                'silverHub.html': {
                    name: 'Silver Hub',
                    category: 'Resources',
                    description: 'Resource management',
                    icon: '🥈'
                },
                'starlinkHub.html': {
                    name: 'Starlink Hub',
                    category: 'Connectivity',
                    description: 'Network connectivity management',
                    icon: '📡'
                },
                'tkjk-hub.html': {
                    name: 'TKJK Hub',
                    category: 'Projects',
                    description: 'Project hub',
                    icon: '🎯'
                },
                'gov-transparency-hub.html': {
                    name: 'Gov Transparency Hub',
                    category: 'Government',
                    description: 'Government transparency tools',
                    icon: '🏛️'
                },
                'all-repos-hub.html': {
                    name: 'All Repos Hub',
                    category: 'Development',
                    description: 'All repositories overview',
                    icon: '📚'
                },
                'barbrick-tools-hub.html': {
                    name: 'Barbrick Tools Hub',
                    category: 'Tools',
                    description: 'Collection of utility tools',
                    icon: '🔧'
                },
                'organized-projects-hub.html': {
                    name: 'Organized Projects',
                    category: 'Projects',
                    description: 'Organized project management',
                    icon: '📋'
                },
                'project-hub.html': {
                    name: 'Project Hub',
                    category: 'Projects',
                    description: 'Central project management',
                    icon: '📁'
                },
                'merlins-gem-bot-hub.html': {
                    name: 'Merlin\'s Gem Bot Hub',
                    category: 'AI',
                    description: 'Gem bot AI hub',
                    icon: '🤖'
                },
                'contributor-dashboard-hub.html': {
                    name: 'Contributor Dashboard',
                    category: 'Contribution',
                    description: 'Contributor management',
                    icon: '👥'
                },
                'agent-hub.html': {
                    name: 'Agent Hub',
                    category: 'AI Agents',
                    description: 'AI agent management',
                    icon: '🤖'
                },
                'devPortal.html': {
                    name: 'Dev Portal',
                    category: 'Development',
                    description: 'Idea Forge - Submit and fund ideas',
                    icon: '💡'
                }
            };
        }

        /**
         * Detect current hub from URL
         */
        detectCurrentHub() {
            const path = window.location.pathname;
            const filename = path.split('/').pop();
            
            // Check if current page is a registered hub
            if (this.hubRegistry[filename]) {
                this.currentHub = filename;
                console.log(`📍 Current hub detected: ${this.hubRegistry[filename].name}`);
                return this.currentHub;
            }
            
            return null;
        }

        /**
         * Load visit data from storage
         */
        loadVisitData() {
            try {
                const userId = window.userIdentityManager ? window.userIdentityManager.getUserId() : 'guest';
                const storageKey = `hub_visits_${userId}`;
                
                const data = localStorage.getItem(storageKey);
                if (data) {
                    this.visitData = JSON.parse(data);
                    console.log(`📂 Loaded ${Object.keys(this.visitData).length} hub visit records`);
                }
            } catch (error) {
                console.error('Error loading visit data:', error);
                this.visitData = {};
            }
        }

        /**
         * Save visit data to storage
         */
        saveVisitData() {
            try {
                const userId = window.userIdentityManager ? window.userIdentityManager.getUserId() : 'guest';
                const storageKey = `hub_visits_${userId}`;
                
                localStorage.setItem(storageKey, JSON.stringify(this.visitData));
            } catch (error) {
                console.error('Error saving visit data:', error);
            }
        }

        /**
         * Track a visit to a hub
         */
        trackVisit(hubId) {
            if (!hubId || !this.hubRegistry[hubId]) {
                console.warn('Invalid hub ID:', hubId);
                return;
            }
            
            const now = Date.now();
            
            // Initialize or update visit data for this hub
            if (!this.visitData[hubId]) {
                this.visitData[hubId] = {
                    firstVisit: now,
                    lastVisit: now,
                    visitCount: 0,
                    visits: []
                };
            }
            
            // Update visit data
            this.visitData[hubId].lastVisit = now;
            this.visitData[hubId].visitCount++;
            
            // Add visit record (keep last 50 visits)
            this.visitData[hubId].visits.push({
                timestamp: now,
                duration: 0 // Will be updated on page unload
            });
            
            if (this.visitData[hubId].visits.length > 50) {
                this.visitData[hubId].visits = this.visitData[hubId].visits.slice(-50);
            }
            
            // Save to storage
            this.saveVisitData();
            
            const hubInfo = this.hubRegistry[hubId];
            console.log(`📝 Tracked visit to: ${hubInfo.name} (Total: ${this.visitData[hubId].visitCount})`);
            
            // Track visit duration
            this.trackVisitDuration(hubId);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('hubVisited', {
                detail: { hubId, hubInfo, visitData: this.visitData[hubId] }
            }));
        }

        /**
         * Track visit duration
         */
        trackVisitDuration(hubId) {
            const visitStartTime = Date.now();
            
            // Update duration on page unload
            const updateDuration = () => {
                const duration = Date.now() - visitStartTime;
                if (this.visitData[hubId] && this.visitData[hubId].visits.length > 0) {
                    const lastVisit = this.visitData[hubId].visits[this.visitData[hubId].visits.length - 1];
                    lastVisit.duration = duration;
                    this.saveVisitData();
                }
            };
            
            window.addEventListener('beforeunload', updateDuration);
            window.addEventListener('pagehide', updateDuration);
        }

        /**
         * Get recently visited hubs
         */
        getRecentHubs(limit = 5) {
            const hubList = Object.keys(this.visitData)
                .map(hubId => ({
                    hubId,
                    ...this.hubRegistry[hubId],
                    visitData: this.visitData[hubId]
                }))
                .sort((a, b) => b.visitData.lastVisit - a.visitData.lastVisit)
                .slice(0, limit);
            
            return hubList;
        }

        /**
         * Get most visited hubs
         */
        getMostVisitedHubs(limit = 5) {
            const hubList = Object.keys(this.visitData)
                .map(hubId => ({
                    hubId,
                    ...this.hubRegistry[hubId],
                    visitData: this.visitData[hubId]
                }))
                .sort((a, b) => b.visitData.visitCount - a.visitData.visitCount)
                .slice(0, limit);
            
            return hubList;
        }

        /**
         * Get hub recommendations based on visit patterns
         */
        getRecommendations(limit = 3) {
            // Get hubs in same categories as visited hubs
            const visitedHubs = Object.keys(this.visitData);
            const visitedCategories = new Set(
                visitedHubs.map(hubId => this.hubRegistry[hubId]?.category).filter(Boolean)
            );
            
            // Find unvisited hubs in same categories
            const recommendations = Object.keys(this.hubRegistry)
                .filter(hubId => !visitedHubs.includes(hubId))
                .map(hubId => ({
                    hubId,
                    ...this.hubRegistry[hubId],
                    relevanceScore: visitedCategories.has(this.hubRegistry[hubId].category) ? 1 : 0.5
                }))
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, limit);
            
            return recommendations;
        }

        /**
         * Get all hubs by category
         */
        getHubsByCategory() {
            const categories = {};
            
            Object.keys(this.hubRegistry).forEach(hubId => {
                const hub = this.hubRegistry[hubId];
                const category = hub.category || 'Other';
                
                if (!categories[category]) {
                    categories[category] = [];
                }
                
                categories[category].push({
                    hubId,
                    ...hub,
                    visited: this.visitData[hubId] ? true : false,
                    visitData: this.visitData[hubId] || null
                });
            });
            
            return categories;
        }

        /**
         * Get visit statistics
         */
        getStatistics() {
            const totalVisits = Object.values(this.visitData).reduce(
                (sum, data) => sum + data.visitCount, 0
            );
            
            const uniqueHubs = Object.keys(this.visitData).length;
            const totalHubs = Object.keys(this.hubRegistry).length;
            
            return {
                totalVisits,
                uniqueHubsVisited: uniqueHubs,
                totalHubsAvailable: totalHubs,
                explorationRate: ((uniqueHubs / totalHubs) * 100).toFixed(1)
            };
        }

        /**
         * Clear visit data
         */
        clearVisitData() {
            this.visitData = {};
            this.saveVisitData();
            console.log('🗑️ Visit data cleared');
        }

        /**
         * Export visit data
         */
        exportVisitData() {
            return {
                userId: window.userIdentityManager ? window.userIdentityManager.getUserId() : 'guest',
                exportDate: new Date().toISOString(),
                visitData: this.visitData,
                statistics: this.getStatistics()
            };
        }
    }

    // Create global instance
    window.hubVisitTracker = new HubVisitTracker();

    console.log('✅ Hub Visit Tracker module loaded');
})();
