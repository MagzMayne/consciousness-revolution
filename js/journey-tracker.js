/**
 * Life Journey Tracker
 * Tracks user's progress through their unique life journey
 * Stores data in localStorage for persistence
 */

class LifeJourneyTracker {
    constructor() {
        this.storageKey = 'lifeJourneyData';
        this.milestonesKey = 'journeyMilestones';
        this.progressKey = 'journeyProgress';
    }

    /**
     * Save journey data
     */
    saveJourney(data) {
        try {
            const journeyData = {
                ...data,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(journeyData));
            return true;
        } catch (error) {
            console.error('Error saving journey data:', error);
            return false;
        }
    }

    /**
     * Load journey data
     */
    loadJourney() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading journey data:', error);
            return null;
        }
    }

    /**
     * Check if user has started their journey
     */
    hasJourney() {
        return !!this.loadJourney();
    }

    /**
     * Get days since journey started
     */
    getDaysSinceStart() {
        const journey = this.loadJourney();
        if (!journey || !journey.timestamp) return 0;
        
        const startDate = new Date(journey.timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Add a milestone
     */
    addMilestone(milestone) {
        try {
            const milestones = this.getMilestones();
            const newMilestone = {
                ...milestone,
                id: Date.now(),
                date: new Date().toISOString(),
                completed: false
            };
            milestones.push(newMilestone);
            localStorage.setItem(this.milestonesKey, JSON.stringify(milestones));
            return newMilestone;
        } catch (error) {
            console.error('Error adding milestone:', error);
            return null;
        }
    }

    /**
     * Get all milestones
     */
    getMilestones() {
        try {
            const data = localStorage.getItem(this.milestonesKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading milestones:', error);
            return [];
        }
    }

    /**
     * Complete a milestone
     */
    completeMilestone(milestoneId) {
        try {
            const milestones = this.getMilestones();
            const milestone = milestones.find(m => m.id === milestoneId);
            if (milestone) {
                milestone.completed = true;
                milestone.completedDate = new Date().toISOString();
                localStorage.setItem(this.milestonesKey, JSON.stringify(milestones));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error completing milestone:', error);
            return false;
        }
    }

    /**
     * Update progress for a specific area
     */
    updateProgress(area, score) {
        try {
            const progress = this.getProgress();
            progress[area] = {
                score,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.progressKey, JSON.stringify(progress));
            return true;
        } catch (error) {
            console.error('Error updating progress:', error);
            return false;
        }
    }

    /**
     * Get progress for all areas
     */
    getProgress() {
        try {
            const data = localStorage.getItem(this.progressKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading progress:', error);
            return {};
        }
    }

    /**
     * Get phase-specific recommendations
     */
    getPhaseRecommendations(phase) {
        const recommendations = {
            awakening: [
                { title: 'Daily Consciousness Check', url: 'DAILY_CONSCIOUSNESS_CHECK.html' },
                { title: 'Values Alignment Check', url: 'VALUES_ALIGNMENT_CHECK.html' },
                { title: 'Consciousness Tools', url: 'consciousness-tools.html' }
            ],
            discovery: [
                { title: 'Pattern Recognition Course', url: 'pattern-recognition-course.html' },
                { title: 'Self Talk Analyzer', url: 'SELF_TALK_ANALYZER.html' },
                { title: 'Seven Domains Dashboard', url: 'SEVEN_DOMAINS_DASHBOARD.html' }
            ],
            transformation: [
                { title: 'Boundary Setter', url: 'BOUNDARY_SETTER.html' },
                { title: 'Decision Matrix', url: 'DECISION_MATRIX.html' },
                { title: 'Goal Alignment Check', url: 'GOAL_ALIGNMENT_CHECK.html' }
            ],
            integration: [
                { title: 'Consciousness Dashboard', url: 'CONSCIOUSNESS_DASHBOARD.html' },
                { title: 'Values Alignment Check', url: 'VALUES_ALIGNMENT_CHECK.html' },
                { title: 'Seven Domains', url: 'seven-domains.html' }
            ],
            creation: [
                { title: 'Project Hub', url: 'project-hub.html' },
                { title: 'Decision Matrix', url: 'DECISION_MATRIX.html' },
                { title: 'Seven Domains Dashboard', url: 'SEVEN_DOMAINS_DASHBOARD.html' }
            ],
            mastery: [
                { title: 'Consciousness Dashboard', url: 'CONSCIOUSNESS_DASHBOARD.html' },
                { title: 'Purpose Discovery', url: 'seven-domains.html' },
                { title: 'Pattern Recognition Course', url: 'pattern-recognition-course.html' }
            ]
        };

        return recommendations[phase] || recommendations.awakening;
    }

    /**
     * Get calling-specific tools
     */
    getCallingTools(calling) {
        const tools = {
            creation: [
                { name: 'Project Hub', url: 'project-hub.html' },
                { name: 'Consciousness Tools', url: 'consciousness-tools.html' }
            ],
            healing: [
                { name: 'Boundary Setter', url: 'BOUNDARY_SETTER.html' },
                { name: 'Self Talk Analyzer', url: 'SELF_TALK_ANALYZER.html' }
            ],
            wisdom: [
                { name: 'Pattern Recognition Course', url: 'pattern-recognition-course.html' },
                { name: 'Decision Matrix', url: 'DECISION_MATRIX.html' }
            ],
            connection: [
                { name: 'Consciousness Tools', url: 'consciousness-tools.html' },
                { name: 'Seven Domains', url: 'seven-domains.html' }
            ],
            leadership: [
                { name: 'Decision Matrix', url: 'DECISION_MATRIX.html' },
                { name: 'Goal Alignment Check', url: 'GOAL_ALIGNMENT_CHECK.html' }
            ],
            service: [
                { name: 'Values Alignment Check', url: 'VALUES_ALIGNMENT_CHECK.html' },
                { name: 'Consciousness Dashboard', url: 'CONSCIOUSNESS_DASHBOARD.html' }
            ]
        };

        return tools[calling] || [];
    }

    /**
     * Export journey data
     */
    exportJourney() {
        const journey = this.loadJourney();
        const milestones = this.getMilestones();
        const progress = this.getProgress();

        return {
            journey,
            milestones,
            progress,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Clear all journey data
     */
    clearJourney() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.milestonesKey);
            localStorage.removeItem(this.progressKey);
            return true;
        } catch (error) {
            console.error('Error clearing journey data:', error);
            return false;
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.LifeJourneyTracker = LifeJourneyTracker;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LifeJourneyTracker;
}
