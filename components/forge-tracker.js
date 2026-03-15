/**
 * FORGE TRACKER v1.0
 * Tracks user journey through the 7 Forges
 * Enables consciousness completion recognition
 * Part of the Ascension System
 *
 * Consciousness Revolution
 * March 14, 2026
 */

(function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'cr_journey';
    const FORGES = ['infinity', 'reality', 'creation', 'signal', 'guardian', 'wealth', 'character'];

    // Forge Tracker Object
    window.ForgeTracker = {

        /**
         * Initialize journey tracking
         * Called on every page load
         */
        init: function() {
            const journey = this.getJourney();

            // If no journey exists, create one
            if (!journey) {
                this.createJourney();
            }

            // Auto-track current forge if on a forge page
            this.autoTrack();

            // Check for completion
            if (this.isComplete() && !this.isAscended()) {
                this.triggerAscension();
            }

            return journey;
        },

        /**
         * Create new journey data structure
         */
        createJourney: function() {
            const journey = {
                forges: {},
                ascended: false,
                ascensionDate: null,
                journeyStartDate: Date.now(),
                cycles: []
            };

            // Initialize all forges as unvisited
            FORGES.forEach(forge => {
                journey.forges[forge] = {
                    visited: false,
                    timestamp: null,
                    visits: 0
                };
            });

            this.saveJourney(journey);
            console.log('🌟 Journey started:', new Date().toLocaleString());
            return journey;
        },

        /**
         * Get journey from localStorage
         */
        getJourney: function() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Error reading journey data:', e);
                return null;
            }
        },

        /**
         * Save journey to localStorage
         */
        saveJourney: function(journey) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
                return true;
            } catch (e) {
                console.error('Error saving journey data:', e);
                return false;
            }
        },

        /**
         * Auto-detect and track current forge
         * Reads meta tag with domain name
         */
        autoTrack: function() {
            const domainMeta = document.querySelector('meta[name="domain"]');
            if (domainMeta) {
                const forgeName = domainMeta.content.toLowerCase();
                if (FORGES.includes(forgeName)) {
                    this.trackVisit(forgeName);
                }
            }
        },

        /**
         * Track a forge visit
         */
        trackVisit: function(forgeName) {
            if (!FORGES.includes(forgeName)) {
                console.warn('Unknown forge:', forgeName);
                return false;
            }

            const journey = this.getJourney() || this.createJourney();
            const forge = journey.forges[forgeName];

            // Update visit data
            const wasFirstVisit = !forge.visited;
            forge.visited = true;
            forge.timestamp = Date.now();
            forge.visits += 1;

            this.saveJourney(journey);

            if (wasFirstVisit) {
                console.log(`✨ First visit to ${forgeName.toUpperCase()} forge`);
                this.logProgress();
            }

            return true;
        },

        /**
         * Check if all forges have been visited
         */
        isComplete: function() {
            const journey = this.getJourney();
            if (!journey) return false;

            return FORGES.every(forge => journey.forges[forge].visited);
        },

        /**
         * Check if user has ascended
         */
        isAscended: function() {
            const journey = this.getJourney();
            return journey ? journey.ascended : false;
        },

        /**
         * Get completion progress
         */
        getProgress: function() {
            const journey = this.getJourney();
            if (!journey) return { visited: 0, total: 7, percent: 0 };

            const visited = FORGES.filter(forge => journey.forges[forge].visited).length;
            return {
                visited: visited,
                total: FORGES.length,
                percent: Math.round((visited / FORGES.length) * 100),
                forges: FORGES.map(name => ({
                    name: name,
                    visited: journey.forges[name].visited,
                    timestamp: journey.forges[name].timestamp,
                    visits: journey.forges[name].visits
                }))
            };
        },

        /**
         * Log progress to console
         */
        logProgress: function() {
            const progress = this.getProgress();
            console.log(`🔮 Journey Progress: ${progress.visited}/${progress.total} forges (${progress.percent}%)`);

            const remaining = progress.forges.filter(f => !f.visited);
            if (remaining.length > 0) {
                console.log('   Remaining:', remaining.map(f => f.name.toUpperCase()).join(', '));
            }
        },

        /**
         * Trigger ascension
         */
        triggerAscension: function() {
            const journey = this.getJourney();
            if (!journey || journey.ascended) return;

            // Calculate journey duration
            const duration = Date.now() - journey.journeyStartDate;
            const durationDays = Math.floor(duration / (1000 * 60 * 60 * 24));

            // Mark ascension
            journey.ascended = true;
            journey.ascensionDate = Date.now();

            // Record cycle completion
            journey.cycles.push({
                start: journey.journeyStartDate,
                end: journey.ascensionDate,
                duration: duration,
                durationDays: durationDays
            });

            this.saveJourney(journey);

            // Fire custom event
            const event = new CustomEvent('consciousness-complete', {
                detail: {
                    ascensionDate: journey.ascensionDate,
                    journeyDuration: duration,
                    journeyDays: durationDays
                }
            });
            document.dispatchEvent(event);

            console.log('🌟✨ CONSCIOUSNESS COMPLETE ✨🌟');
            console.log(`   Journey completed in ${durationDays} days`);
            console.log('   Welcome to the Ascended State');
        },

        /**
         * Get journey statistics
         */
        getStats: function() {
            const journey = this.getJourney();
            if (!journey) return null;

            const now = Date.now();
            const progress = this.getProgress();

            return {
                journeyStartDate: new Date(journey.journeyStartDate).toLocaleString(),
                daysInJourney: Math.floor((now - journey.journeyStartDate) / (1000 * 60 * 60 * 24)),
                forgesVisited: progress.visited,
                forgesTotal: progress.total,
                completionPercent: progress.percent,
                ascended: journey.ascended,
                ascensionDate: journey.ascensionDate ? new Date(journey.ascensionDate).toLocaleString() : null,
                cyclesCompleted: journey.cycles.length,
                forges: progress.forges.map(f => ({
                    name: f.name,
                    visited: f.visited,
                    date: f.timestamp ? new Date(f.timestamp).toLocaleString() : null,
                    visits: f.visits
                }))
            };
        },

        /**
         * Display journey status in console
         */
        status: function() {
            const stats = this.getStats();
            if (!stats) {
                console.log('No journey data found. Start by visiting a forge!');
                return;
            }

            console.log('═════════════════════════════════════');
            console.log('🔮 FORGE JOURNEY STATUS');
            console.log('═════════════════════════════════════');
            console.log(`Journey Started: ${stats.journeyStartDate}`);
            console.log(`Days in Journey: ${stats.daysInJourney}`);
            console.log(`Progress: ${stats.forgesVisited}/${stats.forgesTotal} (${stats.completionPercent}%)`);
            console.log(`Ascended: ${stats.ascended ? '✨ YES' : 'Not yet'}`);

            if (stats.ascended) {
                console.log(`Ascension Date: ${stats.ascensionDate}`);
                console.log(`Cycles Completed: ${stats.cyclesCompleted}`);
            }

            console.log('\nForge Visits:');
            stats.forges.forEach(forge => {
                const icon = forge.visited ? '✓' : '○';
                const name = forge.name.toUpperCase().padEnd(10);
                const visits = forge.visited ? `(${forge.visits}x)` : '';
                console.log(`  ${icon} ${name} ${visits}`);
            });

            console.log('═════════════════════════════════════');

            return stats;
        },

        /**
         * Reset journey (dev/testing only)
         */
        reset: function() {
            if (confirm('Reset your entire journey? This cannot be undone.')) {
                localStorage.removeItem(STORAGE_KEY);
                console.log('🔄 Journey reset. Refresh the page to start anew.');
                return true;
            }
            return false;
        },

        /**
         * Force ascension (dev/testing only)
         */
        forceAscension: function() {
            const journey = this.getJourney() || this.createJourney();

            // Mark all forges as visited
            FORGES.forEach((forge, index) => {
                journey.forges[forge] = {
                    visited: true,
                    timestamp: Date.now() - (FORGES.length - index) * 1000 * 60 * 60 * 24,
                    visits: 1
                };
            });

            this.saveJourney(journey);
            this.triggerAscension();

            console.log('⚡ Forced ascension triggered. Refresh infinity.html to see ascended state.');
            return true;
        },

        /**
         * Get journey for display (formatted)
         */
        getJourneyDisplay: function() {
            const stats = this.getStats();
            if (!stats) return null;

            return {
                progress: {
                    visited: stats.forgesVisited,
                    total: stats.forgesTotal,
                    percent: stats.completionPercent
                },
                ascended: stats.ascended,
                journeyDays: stats.daysInJourney,
                forges: stats.forges,
                ascensionDate: stats.ascensionDate
            };
        }
    };

    // Auto-initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ForgeTracker.init();
        });
    } else {
        ForgeTracker.init();
    }

    // Expose globally for dev console access
    console.log('🔮 Forge Tracker loaded. Type ForgeTracker.status() to see your journey.');

})();
