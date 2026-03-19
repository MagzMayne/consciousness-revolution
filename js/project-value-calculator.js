// RootIB: RB-20260319142113-6CBCEDB5
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
 * File: project-value-calculator.js
 * Declaration ID: IP-4BCD0C5B-MLL28ZV6
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROJECT VALUE CALCULATOR
 * Barbrick Design - Ryan Barbrick
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Calculates dollar values for each project based on:
 * - Completion percentage
 * - Functionality status
 * - Category complexity
 * - Code metrics
 * - Project scope
 * 
 * © 2024-2025 Ryan Barbrick. All Rights Reserved.
 * Contact: BarbrickDesign@gmail.com
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ProjectValueCalculator {
    constructor() {
        // Base value ranges by category
        this.CATEGORY_BASE_VALUES = {
            'Blockchain & Crypto': { min: 2000, max: 8000 },
            'AI & Machine Learning': { min: 3000, max: 10000 },
            '3D Graphics': { min: 2500, max: 7000 },
            'Dashboards': { min: 1500, max: 5000 },
            'E-commerce & Sales': { min: 2000, max: 6000 },
            'Gaming': { min: 2000, max: 7000 },
            'Security & Safety': { min: 2500, max: 8000 },
            'Tools & Utilities': { min: 1000, max: 4000 },
            'Social & Communication': { min: 1500, max: 5000 },
            'Trading & Finance': { min: 2500, max: 8000 },
            'Miscellaneous': { min: 500, max: 3000 },
            'Art & Design': { min: 1000, max: 4000 },
            'Government & Grants': { min: 3000, max: 9000 },
            'Education & Learning': { min: 2000, max: 6000 },
            'Real Estate': { min: 2000, max: 6000 },
            'Data & Analytics': { min: 2500, max: 7000 }
        };
        
        // Functionality status multipliers
        this.FUNCTIONALITY_MULTIPLIERS = {
            'working': 1.0,
            'partial': 0.75,
            'broken': 0.4,
            'untested': 0.5
        };
        
        // Complexity bonuses based on tags
        this.COMPLEXITY_TAGS = {
            'blockchain': 1.3,
            'web3': 1.3,
            'ai': 1.4,
            'machine-learning': 1.4,
            'three.js': 1.2,
            'babylon.js': 1.2,
            '3d': 1.2,
            'api': 1.1,
            'database': 1.2,
            'real-time': 1.15,
            'websocket': 1.15,
            'payment': 1.25,
            'authentication': 1.2
        };
        
        console.log('💰 Project Value Calculator initialized');
    }
    
    /**
     * Calculate value for a single project
     */
    calculateProjectValue(project) {
        // Get base value from category
        const categoryRange = this.CATEGORY_BASE_VALUES[project.category] || 
                            this.CATEGORY_BASE_VALUES['Miscellaneous'];
        
        // Calculate base value using completion percentage
        const completion = project.completion || 50;
        const completionRatio = completion / 100;
        const baseValue = categoryRange.min + 
                         (categoryRange.max - categoryRange.min) * completionRatio;
        
        // Apply functionality multiplier
        const functionalityMultiplier = this.FUNCTIONALITY_MULTIPLIERS[project.functionality] || 0.5;
        
        // Calculate complexity bonus from tags
        let complexityBonus = 1.0;
        if (project.tags && Array.isArray(project.tags)) {
            for (const tag of project.tags) {
                const tagLower = tag.toLowerCase();
                for (const [complexTag, bonus] of Object.entries(this.COMPLEXITY_TAGS)) {
                    if (tagLower.includes(complexTag)) {
                        complexityBonus = Math.max(complexityBonus, bonus);
                    }
                }
            }
        }
        
        // Calculate final value
        let finalValue = baseValue * functionalityMultiplier * complexityBonus;
        
        // Apply special bonuses for exceptional projects
        if (completion >= 95 && project.functionality === 'working') {
            finalValue *= 1.1; // 10% bonus for complete, working projects
        }
        
        // Round to nearest $50
        finalValue = Math.round(finalValue / 50) * 50;
        
        // Ensure minimum value
        finalValue = Math.max(finalValue, 250);
        
        return finalValue;
    }
    
    /**
     * Calculate values for all projects
     */
    calculateAllProjectValues(projects) {
        if (!Array.isArray(projects)) {
            console.error('Projects must be an array');
            return [];
        }
        
        const results = projects.map(project => {
            const value = this.calculateProjectValue(project);
            return {
                ...project,
                value: value
            };
        });
        
        return results;
    }
    
    /**
     * Calculate total repository value
     */
    calculateTotalValue(projects) {
        if (!Array.isArray(projects)) return 0;
        
        return projects.reduce((total, project) => {
            return total + (project.value || 0);
        }, 0);
    }
    
    /**
     * Get value statistics
     */
    getValueStats(projects) {
        if (!Array.isArray(projects) || projects.length === 0) {
            return {
                totalValue: 0,
                averageValue: 0,
                medianValue: 0,
                highestValue: 0,
                lowestValue: 0,
                projectCount: 0
            };
        }
        
        const values = projects.map(p => p.value || 0).filter(v => v > 0);
        const totalValue = values.reduce((sum, v) => sum + v, 0);
        const averageValue = totalValue / values.length;
        
        // Calculate median
        const sortedValues = [...values].sort((a, b) => a - b);
        const median = values.length % 2 === 0
            ? (sortedValues[values.length / 2 - 1] + sortedValues[values.length / 2]) / 2
            : sortedValues[Math.floor(values.length / 2)];
        
        return {
            totalValue: Math.round(totalValue),
            averageValue: Math.round(averageValue),
            medianValue: Math.round(median),
            highestValue: Math.max(...values),
            lowestValue: Math.min(...values),
            projectCount: projects.length
        };
    }
    
    /**
     * Get value breakdown by category
     */
    getValueByCategory(projects) {
        const categoryTotals = {};
        
        projects.forEach(project => {
            const category = project.category || 'Miscellaneous';
            if (!categoryTotals[category]) {
                categoryTotals[category] = {
                    totalValue: 0,
                    projectCount: 0,
                    projects: []
                };
            }
            categoryTotals[category].totalValue += (project.value || 0);
            categoryTotals[category].projectCount++;
            categoryTotals[category].projects.push(project);
        });
        
        // Sort by total value
        return Object.entries(categoryTotals)
            .map(([category, data]) => ({
                category,
                ...data,
                averageValue: Math.round(data.totalValue / data.projectCount)
            }))
            .sort((a, b) => b.totalValue - a.totalValue);
    }
    
    /**
     * Format value as currency
     */
    formatValue(value) {
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(2) + 'M';
        } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(1) + 'K';
        }
        return '$' + value.toLocaleString();
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.projectValueCalculator = new ProjectValueCalculator();
    console.log('✅ Project Value Calculator loaded');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectValueCalculator;
}
