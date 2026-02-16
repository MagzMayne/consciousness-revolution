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
 * File: gemlords-farm-bridge.js
 * Declaration ID: IP-1CC9ABAB-MLL28ZUY
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMLORDS FARM GAME BRIDGE
 * ═══════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick / Barbrick Design - ALL RIGHTS RESERVED
 * 
 * Connects GemBot Farm Game achievements to real-world job qualifications
 * Tracks virtual practice and converts game progress into professional credentials
 * ═══════════════════════════════════════════════════════════════════════════
 */

class GemLordsFarmBridge {
    constructor() {
        this.version = '1.0.0';
        
        // Farm game achievements that count toward real-world qualifications
        this.QUALIFYING_ACHIEVEMENTS = {
            // Basic level achievements
            'stones_completed_10': {
                requirement: 10,
                skillBonus: 'Consistency',
                description: 'Completed 10 stones in farm game',
                realWorldValue: 'Demonstrates basic completion ability'
            },
            'perfect_quality_5': {
                requirement: 5,
                skillBonus: 'Quality Focus',
                description: 'Achieved 5 perfect quality stones',
                realWorldValue: 'Shows attention to detail'
            },
            
            // Intermediate achievements
            'stones_completed_50': {
                requirement: 50,
                skillBonus: 'Experience',
                description: 'Completed 50 stones in farm game',
                realWorldValue: 'Proven practice volume'
            },
            'zero_losses_10': {
                requirement: 10,
                skillBonus: 'Precision',
                description: 'Completed 10 stones without loss',
                realWorldValue: 'Careful handling and low waste'
            },
            
            // Advanced achievements
            'stones_completed_100': {
                requirement: 100,
                skillBonus: 'Mastery',
                description: 'Completed 100 stones in farm game',
                realWorldValue: 'Extensive practice experience'
            },
            'sapphire_specialist_25': {
                requirement: 25,
                skillBonus: 'Sapphire Specialty',
                description: 'Cut 25 sapphires successfully',
                realWorldValue: 'Specialized in high-value stones'
            },
            
            // Professional achievements
            'stones_completed_500': {
                requirement: 500,
                skillBonus: 'Expert',
                description: 'Completed 500 stones in farm game',
                realWorldValue: 'Professional-level practice'
            },
            'flawless_streak_20': {
                requirement: 20,
                skillBonus: 'Perfection',
                description: '20-stone flawless completion streak',
                realWorldValue: 'Consistent excellence'
            }
        };
        
        // Stone type mapping (farm game → real world)
        this.STONE_TYPE_MAPPING = {
            'Quartz (Amethyst)': { difficulty: 1, practiceValue: 1, realDemand: 'low' },
            'Quartz (Citrine)': { difficulty: 1, practiceValue: 1, realDemand: 'low' },
            'Garnet': { difficulty: 2, practiceValue: 1.2, realDemand: 'medium' },
            'Topaz': { difficulty: 2, practiceValue: 1.2, realDemand: 'medium' },
            'Emerald': { difficulty: 4, practiceValue: 2, realDemand: 'high' },
            'Ruby': { difficulty: 4, practiceValue: 2, realDemand: 'high' },
            'Sapphire': { difficulty: 4, practiceValue: 2, realDemand: 'high' },
            'Opal': { difficulty: 3, practiceValue: 1.5, realDemand: 'medium' },
            'Diamond': { difficulty: 5, practiceValue: 3, realDemand: 'premium' },
            'Alexandrite': { difficulty: 5, practiceValue: 3, realDemand: 'premium' }
        };
        
        console.log('🎮 GemLords Farm Game Bridge initialized');
    }
    
    /**
     * Get farm game statistics for a user
     */
    getFarmGameStats(username) {
        if (!window.GemBotFarmGame) {
            return {
                available: false,
                message: 'Farm game not loaded'
            };
        }
        
        const farmState = window.GemBotFarmGame.state;
        const player = farmState?.player;
        
        if (!player) {
            return {
                available: false,
                message: 'No farm game progress'
            };
        }
        
        return {
            available: true,
            totalStonesCompleted: player.stonesCompleted || 0,
            totalStonesLost: player.stonesLost || 0,
            totalCaratsCut: player.totalCaratsCut || 0,
            successRate: this.calculateSuccessRate(player),
            stoneTypeBreakdown: this.getStoneTypeBreakdown(farmState),
            qualityDistribution: this.getQualityDistribution(farmState),
            practiceValue: this.calculatePracticeValue(farmState)
        };
    }
    
    /**
     * Calculate success rate
     */
    calculateSuccessRate(player) {
        const total = (player.stonesCompleted || 0) + (player.stonesLost || 0);
        if (total === 0) return 0;
        return Math.round(((player.stonesCompleted || 0) / total) * 100);
    }
    
    /**
     * Get breakdown by stone type
     */
    getStoneTypeBreakdown(farmState) {
        const breakdown = {};
        
        // Analyze gem balance (completed stones)
        if (farmState.gemBalance) {
            for (const [stoneType, stones] of Object.entries(farmState.gemBalance)) {
                breakdown[stoneType] = {
                    completed: stones.length,
                    totalCarats: stones.reduce((sum, stone) => sum + (stone.caratWeight || 0), 0),
                    avgQuality: this.calculateAvgQuality(stones),
                    practiceValue: this.STONE_TYPE_MAPPING[stoneType]?.practiceValue || 1
                };
            }
        }
        
        return breakdown;
    }
    
    /**
     * Calculate average quality
     */
    calculateAvgQuality(stones) {
        if (stones.length === 0) return 'N/A';
        
        const qualityScores = {
            'flawless': 5,
            'excellent': 4,
            'good': 3,
            'fair': 2,
            'poor': 1
        };
        
        const avgScore = stones.reduce((sum, stone) => {
            return sum + (qualityScores[stone.quality] || 3);
        }, 0) / stones.length;
        
        if (avgScore >= 4.5) return 'flawless';
        if (avgScore >= 3.5) return 'excellent';
        if (avgScore >= 2.5) return 'good';
        if (avgScore >= 1.5) return 'fair';
        return 'poor';
    }
    
    /**
     * Get quality distribution
     */
    getQualityDistribution(farmState) {
        const distribution = {
            flawless: 0,
            excellent: 0,
            good: 0,
            fair: 0,
            poor: 0
        };
        
        if (farmState.gemBalance) {
            for (const stones of Object.values(farmState.gemBalance)) {
                stones.forEach(stone => {
                    const quality = stone.quality || 'good';
                    distribution[quality] = (distribution[quality] || 0) + 1;
                });
            }
        }
        
        return distribution;
    }
    
    /**
     * Calculate overall practice value
     */
    calculatePracticeValue(farmState) {
        let totalValue = 0;
        const breakdown = this.getStoneTypeBreakdown(farmState);
        
        for (const [stoneType, data] of Object.entries(breakdown)) {
            totalValue += data.completed * data.practiceValue;
        }
        
        return Math.round(totalValue);
    }
    
    /**
     * Check earned farm game achievements
     */
    checkFarmAchievements(username) {
        const stats = this.getFarmGameStats(username);
        
        if (!stats.available) {
            return [];
        }
        
        const earned = [];
        
        // Check stones completed milestones
        if (stats.totalStonesCompleted >= 10) {
            earned.push(this.QUALIFYING_ACHIEVEMENTS.stones_completed_10);
        }
        if (stats.totalStonesCompleted >= 50) {
            earned.push(this.QUALIFYING_ACHIEVEMENTS.stones_completed_50);
        }
        if (stats.totalStonesCompleted >= 100) {
            earned.push(this.QUALIFYING_ACHIEVEMENTS.stones_completed_100);
        }
        if (stats.totalStonesCompleted >= 500) {
            earned.push(this.QUALIFYING_ACHIEVEMENTS.stones_completed_500);
        }
        
        // Check perfect quality achievements
        const perfectCount = stats.qualityDistribution?.flawless || 0;
        if (perfectCount >= 5) {
            earned.push(this.QUALIFYING_ACHIEVEMENTS.perfect_quality_5);
        }
        
        // Check success rate for zero losses
        if (stats.totalStonesCompleted >= 10 && stats.successRate >= 95) {
            earned.push(this.QUALIFYING_ACHIEVEMENTS.zero_losses_10);
        }
        
        // Check sapphire specialty
        const sapphireCount = stats.stoneTypeBreakdown?.['Sapphire']?.completed || 0;
        if (sapphireCount >= 25) {
            earned.push(this.QUALIFYING_ACHIEVEMENTS.sapphire_specialist_25);
        }
        
        // Check flawless streak (would need streak tracking - approximated by quality)
        if (stats.successRate >= 98 && stats.totalStonesCompleted >= 20) {
            earned.push(this.QUALIFYING_ACHIEVEMENTS.flawless_streak_20);
        }
        
        return earned;
    }
    
    /**
     * Get practice-based skill level
     */
    getPracticeSkillLevel(username) {
        const stats = this.getFarmGameStats(username);
        
        if (!stats.available || stats.totalStonesCompleted === 0) {
            return {
                level: 'novice',
                description: 'No practice recorded',
                recommendation: 'Start practicing in the farm game'
            };
        }
        
        const completed = stats.totalStonesCompleted;
        const successRate = stats.successRate;
        const practiceValue = stats.practiceValue;
        
        // Calculate combined score
        const score = (completed * 0.4) + (successRate * 0.3) + (practiceValue * 0.3);
        
        if (score >= 200 && successRate >= 90) {
            return {
                level: 'expert',
                description: 'Extensive practice with excellent results',
                recommendation: 'Ready for professional-level jobs',
                bonus: '+15% job application priority'
            };
        } else if (score >= 100 && successRate >= 85) {
            return {
                level: 'advanced',
                description: 'Strong practice foundation',
                recommendation: 'Qualified for advanced jobs',
                bonus: '+10% job application priority'
            };
        } else if (score >= 50 && successRate >= 75) {
            return {
                level: 'intermediate',
                description: 'Good practice experience',
                recommendation: 'Ready for intermediate jobs',
                bonus: '+5% job application priority'
            };
        } else if (score >= 20) {
            return {
                level: 'beginner',
                description: 'Basic practice completed',
                recommendation: 'Continue practicing for better jobs',
                bonus: 'None'
            };
        } else {
            return {
                level: 'novice',
                description: 'Limited practice',
                recommendation: 'Complete more stones in farm game',
                bonus: 'None'
            };
        }
    }
    
    /**
     * Generate professional practice summary
     */
    generatePracticeSummary(username) {
        const stats = this.getFarmGameStats(username);
        const achievements = this.checkFarmAchievements(username);
        const skillLevel = this.getPracticeSkillLevel(username);
        
        return {
            statistics: stats,
            achievements,
            skillLevel,
            readyForRealWork: stats.totalStonesCompleted >= 10 && stats.successRate >= 75,
            practiceRecommendations: this.getPracticeRecommendations(stats)
        };
    }
    
    /**
     * Get practice recommendations
     */
    getPracticeRecommendations(stats) {
        const recommendations = [];
        
        if (!stats.available) {
            recommendations.push('Start the farm game to begin practice');
            return recommendations;
        }
        
        if (stats.totalStonesCompleted < 10) {
            recommendations.push(`Complete ${10 - stats.totalStonesCompleted} more stones to unlock real jobs`);
        }
        
        if (stats.successRate < 75) {
            recommendations.push('Focus on careful cutting to improve success rate above 75%');
        }
        
        if (stats.successRate < 90 && stats.totalStonesCompleted >= 20) {
            recommendations.push('Practice more to build consistency - aim for 90%+ success rate');
        }
        
        // Check for stone type diversity
        const breakdown = stats.stoneTypeBreakdown || {};
        const typesWorked = Object.keys(breakdown).filter(type => breakdown[type].completed > 0).length;
        
        if (typesWorked < 3) {
            recommendations.push('Try cutting different stone types for diverse experience');
        }
        
        // Check for quality improvement
        const excellentRatio = (stats.qualityDistribution?.excellent || 0) / Math.max(1, stats.totalStonesCompleted);
        if (excellentRatio < 0.3 && stats.totalStonesCompleted >= 10) {
            recommendations.push('Focus on achieving excellent quality - aim for 30%+ excellent stones');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Excellent practice stats! You\'re ready for real-world jobs');
        }
        
        return recommendations;
    }
    
    /**
     * Export farm game stone to potential real job
     */
    exportStoneToRealJob(stoneType, carats, quality) {
        // Find similar real-world jobs
        const jobSuggestions = [];
        
        if (window.gemLordsMarketplaceEmbed) {
            const allJobs = window.gemLordsMarketplaceEmbed.jobListings || [];
            
            // Find jobs matching this stone type
            const matchingJobs = allJobs.filter(job => 
                job.stoneType === stoneType || 
                job.stoneType.includes(stoneType.split('(')[0].trim())
            );
            
            matchingJobs.forEach(job => {
                jobSuggestions.push({
                    jobId: job.id,
                    title: job.title,
                    stoneType: job.stoneType,
                    roughCarats: job.roughCarats,
                    estimatedPay: job.estimatedPay,
                    difficulty: job.difficulty,
                    similarity: this.calculateSimilarity(stoneType, carats, quality, job)
                });
            });
            
            // Sort by similarity
            jobSuggestions.sort((a, b) => b.similarity - a.similarity);
        }
        
        return {
            farmStone: { stoneType, carats, quality },
            suggestedJobs: jobSuggestions.slice(0, 3), // Top 3 matches
            message: jobSuggestions.length > 0 
                ? `Found ${jobSuggestions.length} similar real-world jobs!`
                : 'No matching jobs available yet. Complete more academy lessons to unlock.'
        };
    }
    
    /**
     * Calculate similarity between farm stone and real job
     */
    calculateSimilarity(farmStoneType, farmCarats, farmQuality, job) {
        let score = 0;
        
        // Stone type match (most important)
        if (job.stoneType === farmStoneType) {
            score += 50;
        } else if (job.stoneType.includes(farmStoneType.split('(')[0].trim())) {
            score += 30;
        }
        
        // Carat range similarity
        const caratDiff = Math.abs(job.roughCarats - farmCarats);
        if (caratDiff < 10) score += 30;
        else if (caratDiff < 50) score += 20;
        else if (caratDiff < 100) score += 10;
        
        // Quality factor
        const qualityScores = { flawless: 5, excellent: 4, good: 3, fair: 2, poor: 1 };
        const farmQualityScore = qualityScores[farmQuality] || 3;
        
        if (farmQualityScore >= 4) {
            score += 20; // High quality farm work suggests can handle real jobs
        }
        
        return score;
    }
    
    /**
     * Add farm stats to student profile
     */
    enhanceStudentProfile(baseProfile, username) {
        const practiceSummary = this.generatePracticeSummary(username);
        
        return {
            ...baseProfile,
            farmGamePractice: {
                skillLevel: practiceSummary.skillLevel,
                statistics: practiceSummary.statistics,
                achievements: practiceSummary.achievements,
                readyForRealWork: practiceSummary.readyForRealWork
            },
            overallReadiness: baseProfile.readyForWork && practiceSummary.readyForRealWork,
            recommendedPath: this.getRecommendedPath(baseProfile, practiceSummary)
        };
    }
    
    /**
     * Get recommended learning/practice path
     */
    getRecommendedPath(academyProfile, practiceSummary) {
        const path = [];
        
        // Check academy progress
        const hasCert = academyProfile.certifications?.length > 0;
        const hasPractice = practiceSummary.statistics.totalStonesCompleted >= 10;
        
        if (!hasCert && !hasPractice) {
            path.push({
                step: 1,
                type: 'academy',
                action: 'Complete Basic Lapidary course',
                priority: 'high'
            });
            path.push({
                step: 2,
                type: 'practice',
                action: 'Cut 10 stones in farm game',
                priority: 'high'
            });
        } else if (hasCert && !hasPractice) {
            path.push({
                step: 1,
                type: 'practice',
                action: 'Practice skills in farm game (need 10+ stones)',
                priority: 'critical'
            });
        } else if (!hasCert && hasPractice) {
            path.push({
                step: 1,
                type: 'academy',
                action: 'Earn certification to unlock jobs',
                priority: 'critical'
            });
        } else {
            path.push({
                step: 1,
                type: 'jobs',
                action: 'You\'re ready! Apply for your first real job',
                priority: 'action'
            });
        }
        
        return path;
    }
}

// Initialize global instance
window.gemLordsFarmBridge = new GemLordsFarmBridge();

// Enhance the integration when farm game achievements change
if (window.GemBotFarmGame) {
    console.log('🎮 Farm game detected - enhancing integration');
    
    // Hook into farm game stone completion
    const originalCompleteStone = window.GemBotFarmGame.completeCurrentStone;
    
    if (originalCompleteStone && typeof originalCompleteStone === 'function') {
        window.GemBotFarmGame.completeCurrentStone = function() {
            // Call original method
            const result = originalCompleteStone.call(this);
            
            // Check for new qualifications
            const username = window.gemLordsIntegration?.getCurrentUsername() || 'Guest';
            setTimeout(() => {
                const summary = window.gemLordsFarmBridge.generatePracticeSummary(username);
                
                // Check milestones
                if (summary.statistics.totalStonesCompleted === 10) {
                    window.gemLordsIntegration?.showNotification(
                        '🎮 Practice Milestone!',
                        'You\'ve completed 10 stones! Ready to apply for real jobs.'
                    );
                }
                
                if (summary.statistics.totalStonesCompleted === 50) {
                    window.gemLordsIntegration?.showNotification(
                        '🏆 Practice Expert!',
                        '50 stones completed! You qualify for higher-paying jobs.'
                    );
                }
            }, 1000);
            
            return result;
        };
    }
}

console.log('🎮 GemLords Farm Game Bridge loaded');
