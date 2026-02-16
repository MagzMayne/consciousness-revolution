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
 * File: team-value-enhancement-system.js
 * Declaration ID: IP-3D680F1B-MLL28ZWA
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
 * TEAM VALUE ENHANCEMENT SYSTEM
 * ==============================
 * Calculates and tracks the value each developer offers based on repository contributions
 * Integrates with GBUV (Government Backed Universal Value) system
 * 
 * PURPOSE: Fair compensation and value attribution for team members
 * FOCUS: Transparent, merit-based value calculation
 * 
 * CAPABILITIES:
 * - Developer registration and profile management
 * - Contribution tracking across repositories
 * - Multi-dimensional value scoring
 * - Team collaboration metrics
 * - Project valuation
 * - Value proposition generation for proposals
 * - GBUV integration for compensation
 */

class TeamValueEnhancementSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            dimensions: [
                'codeQuality',
                'codeQuantity',
                'collaboration',
                'innovation',
                'documentation',
                'mentorship'
            ],
            weights: {
                codeQuality: 0.25,
                codeQuantity: 0.20,
                collaboration: 0.20,
                innovation: 0.15,
                documentation: 0.10,
                mentorship: 0.10
            },
            ...config
        };
        
        this.developers = new Map();
        this.projects = new Map();
        this.teamMetrics = {
            totalValue: 0,
            averageScore: 0,
            topContributors: [],
            projectCount: 0,
            totalCommits: 0
        };
        
        this.logs = [];
    }
    
    /**
     * Initialize the system
     */
    async init() {
        try {
            this.log('Initializing Team Value Enhancement System...', 'info');
            
            // Load stored data
            await this.loadDevelopers();
            await this.loadProjects();
            
            // Calculate initial metrics
            await this.calculateTeamMetrics();
            
            // Register with Merlin Hive if available
            if (window.MerlinHive) {
                await this.registerWithHive();
            }
            
            this.log('Team Value Enhancement System initialized successfully', 'success');
        } catch (error) {
            this.log(`Failed to initialize: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Register developer in the system
     * @param {Object} developerData - Developer information
     * @returns {Object} Registered developer
     */
    async registerDeveloper(developerData) {
        try {
            this.log(`Registering developer: ${developerData.name}`, 'info');
            
            // Validate input
            if (!this.validateDeveloperData(developerData)) {
                throw new Error('Invalid developer data');
            }
            
            // Create developer profile
            const developer = {
                id: developerData.id || this.generateDeveloperId(),
                name: developerData.name,
                email: developerData.email,
                githubUsername: developerData.githubUsername || null,
                role: developerData.role || 'Developer',
                
                // Value scores (0-100 for each dimension)
                scores: {
                    codeQuality: 50,
                    codeQuantity: 50,
                    collaboration: 50,
                    innovation: 50,
                    documentation: 50,
                    mentorship: 50
                },
                
                // Contribution metrics
                contributions: {
                    commits: 0,
                    linesAdded: 0,
                    linesRemoved: 0,
                    pullRequests: 0,
                    issues: 0,
                    reviews: 0,
                    projects: []
                },
                
                // Value metrics
                value: {
                    totalScore: 50,
                    weeklyValue: 0,
                    monthlyValue: 0,
                    gbuvTokens: 0
                },
                
                // Metadata
                metadata: {
                    joinedAt: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    tier: 'bronze'
                }
            };
            
            // Store developer
            this.developers.set(developer.id, developer);
            await this.saveDevelopers();
            
            this.log(`Developer registered: ${developer.id}`, 'success');
            return developer;
            
        } catch (error) {
            this.log(`Failed to register developer: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Track developer contribution
     * @param {string} developerId - Developer ID
     * @param {Object} contribution - Contribution data
     * @returns {Object} Updated developer
     */
    async trackContribution(developerId, contribution) {
        try {
            const developer = this.developers.get(developerId);
            if (!developer) {
                throw new Error(`Developer not found: ${developerId}`);
            }
            
            this.log(`Tracking contribution for: ${developer.name}`, 'info');
            
            // Update contribution metrics
            if (contribution.type === 'commit') {
                developer.contributions.commits++;
                developer.contributions.linesAdded += contribution.linesAdded || 0;
                developer.contributions.linesRemoved += contribution.linesRemoved || 0;
            } else if (contribution.type === 'pull_request') {
                developer.contributions.pullRequests++;
            } else if (contribution.type === 'issue') {
                developer.contributions.issues++;
            } else if (contribution.type === 'review') {
                developer.contributions.reviews++;
            }
            
            // Add project if not already tracked
            if (contribution.project && !developer.contributions.projects.includes(contribution.project)) {
                developer.contributions.projects.push(contribution.project);
            }
            
            // Update last active
            developer.metadata.lastActive = new Date().toISOString();
            
            // Recalculate scores
            await this.calculateDeveloperScore(developerId);
            
            // Save changes
            await this.saveDevelopers();
            
            return developer;
            
        } catch (error) {
            this.log(`Failed to track contribution: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Calculate developer score across all dimensions
     * @param {string} developerId - Developer ID
     * @returns {Object} Calculated scores
     */
    async calculateDeveloperScore(developerId) {
        try {
            const developer = this.developers.get(developerId);
            if (!developer) {
                throw new Error(`Developer not found: ${developerId}`);
            }
            
            this.log(`Calculating scores for: ${developer.name}`, 'info');
            
            // Code Quality Score (0-100)
            // Based on: code reviews received, test coverage, documentation
            developer.scores.codeQuality = Math.min(100, 
                50 + 
                (developer.contributions.reviews * 2) + 
                (developer.contributions.projects.length * 5)
            );
            
            // Code Quantity Score (0-100)
            // Based on: commits, lines of code, pull requests
            developer.scores.codeQuantity = Math.min(100,
                Math.min(50, developer.contributions.commits / 2) +
                Math.min(30, developer.contributions.linesAdded / 100) +
                Math.min(20, developer.contributions.pullRequests * 2)
            );
            
            // Collaboration Score (0-100)
            // Based on: reviews given, issues resolved, team projects
            developer.scores.collaboration = Math.min(100,
                50 +
                (developer.contributions.reviews * 3) +
                (developer.contributions.issues * 2) +
                (developer.contributions.projects.length * 3)
            );
            
            // Innovation Score (0-100)
            // Based on: new features, unique contributions, project leadership
            developer.scores.innovation = Math.min(100,
                50 +
                (developer.contributions.projects.length * 5) +
                (developer.contributions.pullRequests * 2)
            );
            
            // Documentation Score (0-100)
            // Based on: docs written, comments, README contributions
            const docsContributions = developer.contributions.linesAdded * 0.1; // Estimate
            developer.scores.documentation = Math.min(100,
                50 + docsContributions
            );
            
            // Mentorship Score (0-100)
            // Based on: reviews given, issues helped with, guidance provided
            developer.scores.mentorship = Math.min(100,
                50 +
                (developer.contributions.reviews * 4) +
                (developer.contributions.issues * 3)
            );
            
            // Calculate total weighted score
            let totalScore = 0;
            for (const [dimension, weight] of Object.entries(this.config.weights)) {
                totalScore += developer.scores[dimension] * weight;
            }
            developer.value.totalScore = Math.round(totalScore);
            
            // Calculate tier based on score
            developer.metadata.tier = this.calculateTier(developer.value.totalScore);
            
            // Calculate GBUV tokens (1 token = $1 USD value)
            developer.value.gbuvTokens = this.calculateGBUVTokens(developer);
            
            // Calculate weekly and monthly value
            developer.value.weeklyValue = Math.round(developer.value.gbuvTokens / 4);
            developer.value.monthlyValue = developer.value.gbuvTokens;
            
            this.log(`Scores calculated for ${developer.name}: Total=${developer.value.totalScore}`, 'success');
            
            return developer.scores;
            
        } catch (error) {
            this.log(`Failed to calculate scores: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Calculate tier based on total score
     * @param {number} totalScore - Total value score
     * @returns {string} Tier name
     */
    calculateTier(totalScore) {
        if (totalScore >= 90) return 'platinum';
        if (totalScore >= 80) return 'gold';
        if (totalScore >= 70) return 'silver';
        return 'bronze';
    }
    
    /**
     * Calculate GBUV tokens based on contributions and score
     * @param {Object} developer - Developer object
     * @returns {number} GBUV tokens (dollars)
     */
    calculateGBUVTokens(developer) {
        // Base value per tier
        const tierValues = {
            platinum: 1500,
            gold: 1000,
            silver: 500,
            bronze: 200
        };
        
        const baseValue = tierValues[developer.metadata.tier] || 200;
        
        // Multipliers based on contributions
        const commitMultiplier = Math.min(2.0, 1.0 + (developer.contributions.commits / 100));
        const projectMultiplier = Math.min(2.0, 1.0 + (developer.contributions.projects.length / 10));
        
        // Calculate final value
        const finalValue = Math.round(baseValue * commitMultiplier * projectMultiplier);
        
        return finalValue;
    }
    
    /**
     * Register project in the system
     * @param {Object} projectData - Project information
     * @returns {Object} Registered project
     */
    async registerProject(projectData) {
        try {
            this.log(`Registering project: ${projectData.name}`, 'info');
            
            const project = {
                id: projectData.id || this.generateProjectId(),
                name: projectData.name,
                repository: projectData.repository,
                description: projectData.description || '',
                
                // Team members
                team: projectData.team || [],
                
                // Project metrics
                metrics: {
                    commits: 0,
                    contributors: 0,
                    linesOfCode: 0,
                    complexity: 0
                },
                
                // Value metrics
                value: {
                    totalValue: 0,
                    teamContribution: 0
                },
                
                // Metadata
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    status: 'active'
                }
            };
            
            // Store project
            this.projects.set(project.id, project);
            await this.saveProjects();
            
            this.log(`Project registered: ${project.id}`, 'success');
            return project;
            
        } catch (error) {
            this.log(`Failed to register project: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Calculate project value based on team contributions
     * @param {string} projectId - Project ID
     * @returns {Object} Project value
     */
    async calculateProjectValue(projectId) {
        try {
            const project = this.projects.get(projectId);
            if (!project) {
                throw new Error(`Project not found: ${projectId}`);
            }
            
            this.log(`Calculating value for project: ${project.name}`, 'info');
            
            // Calculate total team value on this project
            let totalTeamValue = 0;
            let teamContributors = [];
            
            for (const developerId of project.team) {
                const developer = this.developers.get(developerId);
                if (developer) {
                    totalTeamValue += developer.value.gbuvTokens;
                    teamContributors.push({
                        id: developer.id,
                        name: developer.name,
                        value: developer.value.gbuvTokens,
                        score: developer.value.totalScore
                    });
                }
            }
            
            // Calculate project complexity factor
            const complexityFactor = Math.min(2.0, 1.0 + (project.metrics.linesOfCode / 10000));
            
            // Calculate final project value
            project.value.teamContribution = totalTeamValue;
            project.value.totalValue = Math.round(totalTeamValue * complexityFactor);
            
            // Update metadata
            project.metadata.lastUpdated = new Date().toISOString();
            
            // Save changes
            await this.saveProjects();
            
            this.log(`Project value calculated: $${project.value.totalValue}`, 'success');
            
            return {
                projectValue: project.value.totalValue,
                teamValue: totalTeamValue,
                contributors: teamContributors,
                complexityFactor
            };
            
        } catch (error) {
            this.log(`Failed to calculate project value: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Calculate total team value across all projects
     * @returns {Object} Team value data
     */
    async calculateTotalTeamValue() {
        try {
            this.log('Calculating total team value...', 'info');
            
            let totalValue = 0;
            let totalScore = 0;
            let developerCount = 0;
            
            const contributors = [];
            
            // Sum up all developer values
            for (const [id, developer] of this.developers) {
                totalValue += developer.value.gbuvTokens;
                totalScore += developer.value.totalScore;
                developerCount++;
                
                contributors.push({
                    id: developer.id,
                    name: developer.name,
                    role: developer.role,
                    value: developer.value.gbuvTokens,
                    score: developer.value.totalScore,
                    tier: developer.metadata.tier
                });
            }
            
            // Calculate averages
            const averageScore = developerCount > 0 ? Math.round(totalScore / developerCount) : 0;
            const averageValue = developerCount > 0 ? Math.round(totalValue / developerCount) : 0;
            
            // Sort contributors by value
            contributors.sort((a, b) => b.value - a.value);
            
            const teamValue = {
                totalValue,
                averageScore,
                averageValue,
                developerCount,
                topContributors: contributors.slice(0, 5),
                allContributors: contributors,
                calculatedAt: new Date().toISOString()
            };
            
            this.log(`Team value calculated: $${totalValue} (${developerCount} developers)`, 'success');
            
            return teamValue;
            
        } catch (error) {
            this.log(`Failed to calculate team value: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Generate value proposition for proposals
     * @param {Object} opportunity - Contract opportunity
     * @returns {Object} Value proposition
     */
    async generateValueProposition(opportunity) {
        try {
            this.log('Generating value proposition...', 'info');
            
            // Get team value
            const teamValue = await this.calculateTotalTeamValue();
            
            // Find relevant team members for this opportunity
            const relevantDevelopers = this.findRelevantDevelopers(opportunity);
            
            // Calculate opportunity-specific value
            let opportunityValue = 0;
            const teamMembers = [];
            
            for (const developer of relevantDevelopers) {
                opportunityValue += developer.value.gbuvTokens;
                teamMembers.push({
                    name: developer.name,
                    role: developer.role,
                    score: developer.value.totalScore,
                    tier: developer.metadata.tier,
                    expertise: this.getExpertiseAreas(developer)
                });
            }
            
            // Generate proposition text
            const proposition = {
                summary: `Our team of ${teamMembers.length} highly skilled professionals brings $${opportunityValue.toLocaleString()} in proven value to this project. With an average team score of ${teamValue.averageScore}/100, we offer exceptional quality and reliability.`,
                
                teamStrength: `Team average score: ${teamValue.averageScore}/100`,
                totalTeamValue: `$${teamValue.totalValue.toLocaleString()}`,
                opportunityValue: `$${opportunityValue.toLocaleString()}`,
                
                teamMembers: teamMembers,
                
                keyPoints: [
                    `${teamMembers.length} dedicated team members`,
                    `Average quality score: ${teamValue.averageScore}/100`,
                    `Proven track record across ${this.projects.size} projects`,
                    `Combined team value: $${teamValue.totalValue.toLocaleString()}`,
                    `Specialized expertise in required areas`
                ],
                
                qualifications: this.generateQualifications(relevantDevelopers),
                
                generatedAt: new Date().toISOString()
            };
            
            this.log('Value proposition generated', 'success');
            return proposition;
            
        } catch (error) {
            this.log(`Failed to generate value proposition: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Find developers relevant to an opportunity
     * @param {Object} opportunity - Contract opportunity
     * @returns {Array} Relevant developers
     */
    findRelevantDevelopers(opportunity) {
        const relevant = [];
        
        for (const [id, developer] of this.developers) {
            // For now, include all active developers
            // In production, this would match based on skills, NAICS codes, etc.
            if (developer.value.totalScore >= 60) {
                relevant.push(developer);
            }
        }
        
        // Sort by score (highest first)
        relevant.sort((a, b) => b.value.totalScore - a.value.totalScore);
        
        return relevant;
    }
    
    /**
     * Get expertise areas for a developer
     * @param {Object} developer - Developer object
     * @returns {Array} Expertise areas
     */
    getExpertiseAreas(developer) {
        const expertise = [];
        
        // Determine expertise based on scores
        if (developer.scores.codeQuality >= 80) {
            expertise.push('High-Quality Code');
        }
        if (developer.scores.innovation >= 80) {
            expertise.push('Innovation');
        }
        if (developer.scores.collaboration >= 80) {
            expertise.push('Team Leadership');
        }
        if (developer.scores.documentation >= 80) {
            expertise.push('Technical Documentation');
        }
        if (developer.scores.mentorship >= 80) {
            expertise.push('Mentorship');
        }
        
        // Default if no high scores
        if (expertise.length === 0) {
            expertise.push('Software Development');
        }
        
        return expertise;
    }
    
    /**
     * Generate qualifications summary
     * @param {Array} developers - Array of developers
     * @returns {Object} Qualifications
     */
    generateQualifications(developers) {
        const qualifications = {
            totalExperience: 0,
            totalProjects: 0,
            totalCommits: 0,
            specializations: new Set(),
            certifications: []
        };
        
        for (const developer of developers) {
            qualifications.totalProjects += developer.contributions.projects.length;
            qualifications.totalCommits += developer.contributions.commits;
            
            // Add expertise areas as specializations
            const expertise = this.getExpertiseAreas(developer);
            expertise.forEach(exp => qualifications.specializations.add(exp));
        }
        
        return {
            ...qualifications,
            specializations: Array.from(qualifications.specializations)
        };
    }
    
    /**
     * Calculate team metrics
     */
    async calculateTeamMetrics() {
        try {
            const teamValue = await this.calculateTotalTeamValue();
            
            this.teamMetrics = {
                totalValue: teamValue.totalValue,
                averageScore: teamValue.averageScore,
                topContributors: teamValue.topContributors,
                projectCount: this.projects.size,
                totalCommits: 0,
                developerCount: this.developers.size
            };
            
            // Calculate total commits
            for (const [id, developer] of this.developers) {
                this.teamMetrics.totalCommits += developer.contributions.commits;
            }
            
            this.log('Team metrics calculated', 'info');
            
        } catch (error) {
            this.log(`Failed to calculate team metrics: ${error.message}`, 'error');
        }
    }
    
    /**
     * Get collaboration metrics
     * @returns {Object} Collaboration data
     */
    getCollaborationMetrics() {
        const metrics = {
            totalReviews: 0,
            totalIssues: 0,
            crossProjectCollaboration: 0,
            pairProgramming: 0
        };
        
        // Calculate from all developers
        for (const [id, developer] of this.developers) {
            metrics.totalReviews += developer.contributions.reviews;
            metrics.totalIssues += developer.contributions.issues;
        }
        
        // Calculate cross-project collaboration
        const projectSets = Array.from(this.developers.values()).map(d => new Set(d.contributions.projects));
        for (let i = 0; i < projectSets.length; i++) {
            for (let j = i + 1; j < projectSets.length; j++) {
                const intersection = new Set([...projectSets[i]].filter(x => projectSets[j].has(x)));
                metrics.crossProjectCollaboration += intersection.size;
            }
        }
        
        return metrics;
    }
    
    /**
     * Get team statistics
     * @returns {Object} Team statistics
     */
    getTeamStatistics() {
        return {
            ...this.teamMetrics,
            collaboration: this.getCollaborationMetrics(),
            updatedAt: new Date().toISOString()
        };
    }
    
    /**
     * Validate developer data
     * @param {Object} data - Developer data to validate
     * @returns {boolean} Whether valid
     */
    validateDeveloperData(data) {
        if (!data.name) return false;
        if (!data.email) return false;
        return true;
    }
    
    /**
     * Generate developer ID
     * @returns {string} Developer ID
     */
    generateDeveloperId() {
        return `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate project ID
     * @returns {string} Project ID
     */
    generateProjectId() {
        return `PROJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Register with Merlin Hive
     */
    async registerWithHive() {
        try {
            if (window.MerlinHive && window.MerlinHive.registerAgent) {
                await window.MerlinHive.registerAgent({
                    id: 'team-value-enhancement-system',
                    name: 'Team Value Enhancement System',
                    type: 'analytics',
                    capabilities: ['value_calculation', 'team_metrics', 'gbuv_integration'],
                    status: 'active'
                });
                this.log('Registered with Merlin Hive', 'success');
            }
        } catch (error) {
            this.log(`Failed to register with Merlin Hive: ${error.message}`, 'warning');
        }
    }
    
    /**
     * Load developers from storage
     */
    async loadDevelopers() {
        try {
            const stored = localStorage.getItem('teamValueDevelopers');
            if (stored) {
                const data = JSON.parse(stored);
                this.developers = new Map(Object.entries(data));
                this.log(`Loaded ${this.developers.size} developers`, 'info');
            }
        } catch (error) {
            this.log(`Failed to load developers: ${error.message}`, 'warning');
        }
    }
    
    /**
     * Save developers to storage
     */
    async saveDevelopers() {
        try {
            const data = Object.fromEntries(this.developers);
            localStorage.setItem('teamValueDevelopers', JSON.stringify(data));
            this.log('Developers saved', 'info');
        } catch (error) {
            this.log(`Failed to save developers: ${error.message}`, 'error');
        }
    }
    
    /**
     * Load projects from storage
     */
    async loadProjects() {
        try {
            const stored = localStorage.getItem('teamValueProjects');
            if (stored) {
                const data = JSON.parse(stored);
                this.projects = new Map(Object.entries(data));
                this.log(`Loaded ${this.projects.size} projects`, 'info');
            }
        } catch (error) {
            this.log(`Failed to load projects: ${error.message}`, 'warning');
        }
    }
    
    /**
     * Save projects to storage
     */
    async saveProjects() {
        try {
            const data = Object.fromEntries(this.projects);
            localStorage.setItem('teamValueProjects', JSON.stringify(data));
            this.log('Projects saved', 'info');
        } catch (error) {
            this.log(`Failed to save projects: ${error.message}`, 'error');
        }
    }
    
    /**
     * Log message
     * @param {string} message - Message to log
     * @param {string} level - Log level
     */
    log(message, level = 'info') {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            system: 'TeamValueEnhancementSystem'
        };
        
        this.logs.push(entry);
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
        
        // Console output with color
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m'
        };
        
        console.log(`${colors[level] || ''}[${level.toUpperCase()}] ${message}\x1b[0m`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamValueEnhancementSystem;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.TeamValueEnhancementSystem = TeamValueEnhancementSystem;
}
