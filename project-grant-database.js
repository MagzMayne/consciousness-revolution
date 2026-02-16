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
 * File: project-grant-database.js
 * Declaration ID: IP-29842E49-MLL28ZVL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Project-Grant Database System
 * Maps repository projects to government grant opportunities
 * 
 * © 2026 Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 */

const ProjectGrantDatabase = (function() {
    'use strict';

    // Project Database with Grant Mapping
    const PROJECTS = {
        // AI & Machine Learning Projects
        'gembot-ai': {
            id: 'gembot-ai',
            name: 'GemBot AI Learning System',
            description: 'Interactive AI tutor with adaptive learning and student progress tracking',
            category: 'education-tech',
            tier: 'platinum',
            minDonation: 1500,
            githubPath: 'GemBot_Control_AI.html',
            technologies: ['AI', 'Machine Learning', 'Education Technology', 'Natural Language Processing'],
            grantOpportunities: [
                {
                    grantId: 'nsf-sbir',
                    matchScore: 95,
                    fundingRange: [275000, 1000000],
                    agency: 'National Science Foundation',
                    type: 'SBIR/STTR'
                },
                {
                    grantId: 'dept-education',
                    matchScore: 90,
                    fundingRange: [50000, 5000000],
                    agency: 'Department of Education',
                    type: 'Education Technology'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'oasis-3d': {
            id: 'oasis-3d',
            name: 'OASIS 3D Virtual World',
            description: '3D virtual universe with Web3 integration and digital collectibles',
            category: 'web3-metaverse',
            tier: 'gold',
            minDonation: 500,
            githubPath: 'oasis.html',
            technologies: ['3D Graphics', 'WebGL', 'Blockchain', 'Virtual Reality', 'Web3'],
            grantOpportunities: [
                {
                    grantId: 'nist-tech',
                    matchScore: 85,
                    fundingRange: [500000, 5000000],
                    agency: 'NIST',
                    type: 'Advanced Technology'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'livesafe-gunshot': {
            id: 'livesafe-gunshot',
            name: 'LiveSafe Gunshot Detection System',
            description: 'Real-time gunshot detection and emergency response coordination',
            category: 'public-safety',
            tier: 'platinum',
            minDonation: 1500,
            githubPath: 'liveSafeGunshotDetection.html',
            technologies: ['Audio Processing', 'AI', 'Emergency Response', 'Public Safety', 'IoT'],
            grantOpportunities: [
                {
                    grantId: 'dhs-safety',
                    matchScore: 98,
                    fundingRange: [100000, 10000000],
                    agency: 'Department of Homeland Security',
                    type: 'Public Safety Technology'
                },
                {
                    grantId: 'doj-safety',
                    matchScore: 95,
                    fundingRange: [500000, 5000000],
                    agency: 'Department of Justice',
                    type: 'Community Safety'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'ai-vehicle-safety': {
            id: 'ai-vehicle-safety',
            name: 'AI Vehicle Safety System',
            description: 'Advanced driver assistance and collision prevention using AI',
            category: 'transportation-tech',
            tier: 'gold',
            minDonation: 500,
            githubPath: 'ai-vehicle-safety.js',
            technologies: ['AI', 'Computer Vision', 'Automotive', 'Safety Systems', 'IoT'],
            grantOpportunities: [
                {
                    grantId: 'dot-transport',
                    matchScore: 92,
                    fundingRange: [500000, 100000000],
                    agency: 'Department of Transportation',
                    type: 'Transportation Innovation'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'mineral-market': {
            id: 'mineral-market',
            name: 'Mineral Market AI Trading',
            description: 'AI-powered commodity trading and market analysis platform',
            category: 'fintech',
            tier: 'gold',
            minDonation: 500,
            githubPath: 'mineralMarket.html',
            technologies: ['AI', 'Financial Technology', 'Trading Algorithms', 'Market Analysis'],
            grantOpportunities: [
                {
                    grantId: 'sbir-phase1',
                    matchScore: 85,
                    fundingRange: [50000, 250000],
                    agency: 'Multiple Federal Agencies',
                    type: 'SBIR Phase I'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'slamscanner-3d': {
            id: 'slamscanner-3d',
            name: 'SLAM Scanner 3D System',
            description: '3D scanning and mapping using SLAM technology',
            category: 'hardware-software',
            tier: 'gold',
            minDonation: 500,
            githubPath: 'slamScan.html',
            technologies: ['3D Scanning', 'SLAM', 'Computer Vision', 'Robotics', '3D Printing'],
            grantOpportunities: [
                {
                    grantId: 'nist-manufacturing',
                    matchScore: 90,
                    fundingRange: [500000, 5000000],
                    agency: 'NIST',
                    type: 'Advanced Manufacturing'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'translator-offline': {
            id: 'translator-offline',
            name: 'Offline AI Translator',
            description: 'Privacy-focused offline translation using local AI models',
            category: 'language-tech',
            tier: 'silver',
            minDonation: 200,
            githubPath: 'translator.html',
            technologies: ['AI', 'Natural Language Processing', 'Privacy Tech', 'Offline Computing'],
            grantOpportunities: [
                {
                    grantId: 'nsf-research',
                    matchScore: 82,
                    fundingRange: [100000, 5000000],
                    agency: 'National Science Foundation',
                    type: 'Research Grant'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'crypto-recovery': {
            id: 'crypto-recovery',
            name: 'Cryptocurrency Recovery Tool',
            description: 'Universal cryptocurrency wallet recovery and management',
            category: 'blockchain',
            tier: 'silver',
            minDonation: 200,
            githubPath: 'crypto-recovery-universal.html',
            technologies: ['Blockchain', 'Cryptocurrency', 'Security', 'Wallet Management'],
            grantOpportunities: [
                {
                    grantId: 'sbir-phase1',
                    matchScore: 75,
                    fundingRange: [50000, 250000],
                    agency: 'Multiple Federal Agencies',
                    type: 'SBIR Phase I'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'ebay-profit-calc': {
            id: 'ebay-profit-calc',
            name: 'eBay Profit Calculator',
            description: 'Real-time profit calculation and selling optimization for eBay sellers',
            category: 'ecommerce',
            tier: 'bronze',
            minDonation: 50,
            githubPath: 'ebayProfitCalc.html',
            technologies: ['E-commerce', 'Business Tools', 'Data Analysis', 'Web Scraping'],
            grantOpportunities: [
                {
                    grantId: 'eda-economic',
                    matchScore: 70,
                    fundingRange: [100000, 3000000],
                    agency: 'Economic Development Administration',
                    type: 'Economic Development'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        },

        'poker-ai': {
            id: 'poker-ai',
            name: 'AI Poker Training System',
            description: 'Advanced poker training with AI opponents and strategy analysis',
            category: 'gaming-ai',
            tier: 'bronze',
            minDonation: 50,
            githubPath: 'poker.html',
            technologies: ['AI', 'Game Theory', 'Machine Learning', 'Strategy Analysis'],
            grantOpportunities: [
                {
                    grantId: 'nsf-research',
                    matchScore: 68,
                    fundingRange: [100000, 5000000],
                    agency: 'National Science Foundation',
                    type: 'Computer Science Research'
                }
            ],
            donationPool: 0,
            contributors: [],
            monthlyContributions: {},
            status: 'active'
        }
    };

    /**
     * Get all projects filtered by tier
     */
    function getProjectsByTier(tier) {
        return Object.values(PROJECTS).filter(project => {
            const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
            const userTierLevel = tierOrder[tier] || 0;
            const projectTierLevel = tierOrder[project.tier] || 0;
            return userTierLevel >= projectTierLevel;
        });
    }

    /**
     * Get project by ID
     */
    function getProject(projectId) {
        return PROJECTS[projectId] || null;
    }

    /**
     * Get all projects
     */
    function getAllProjects() {
        return Object.values(PROJECTS);
    }

    /**
     * Get projects by category
     */
    function getProjectsByCategory(category) {
        return Object.values(PROJECTS).filter(p => p.category === category);
    }

    /**
     * Get project grant opportunities
     */
    function getProjectGrantOpportunities(projectId) {
        const project = PROJECTS[projectId];
        return project ? project.grantOpportunities : [];
    }

    /**
     * Assign contributor to project
     */
    function assignContributor(projectId, contributorData) {
        const project = PROJECTS[projectId];
        if (!project) return { success: false, error: 'Project not found' };

        // Check if contributor meets minimum donation requirement
        if (contributorData.donationAmount < project.minDonation) {
            return {
                success: false,
                error: `Minimum donation of $${project.minDonation} required for this project`
            };
        }

        // Add contributor to project
        const contributor = {
            id: contributorData.id,
            name: contributorData.name,
            email: contributorData.email,
            donationAmount: contributorData.donationAmount,
            revenueShare: contributorData.revenueShare,
            joinedAt: Date.now(),
            contributions: [],
            monthlyWork: {}
        };

        project.contributors.push(contributor);
        project.donationPool += contributorData.donationAmount;

        // Save to localStorage
        saveProjectData();

        return {
            success: true,
            project: project,
            contributor: contributor
        };
    }

    /**
     * Track monthly contribution for a contributor
     */
    function trackMonthlyContribution(projectId, contributorId, workDescription) {
        const project = PROJECTS[projectId];
        if (!project) return { success: false, error: 'Project not found' };

        const contributor = project.contributors.find(c => c.id === contributorId);
        if (!contributor) return { success: false, error: 'Contributor not found in project' };

        const month = new Date().toISOString().slice(0, 7); // YYYY-MM format
        
        if (!contributor.monthlyWork[month]) {
            contributor.monthlyWork[month] = [];
        }

        contributor.monthlyWork[month].push({
            description: workDescription,
            timestamp: Date.now()
        });

        // Save to localStorage
        saveProjectData();

        return { success: true };
    }

    /**
     * Calculate monthly distribution for a project
     */
    function calculateMonthlyDistribution(projectId, grantAmount) {
        const project = PROJECTS[projectId];
        if (!project || project.contributors.length === 0) {
            return { success: false, error: 'Invalid project or no contributors' };
        }

        const month = new Date().toISOString().slice(0, 7);
        const distributions = [];

        // Calculate total pool percentage (sum of all contributors' revenue shares)
        const totalPoolPercentage = project.contributors.reduce((sum, c) => sum + c.revenueShare, 0);
        
        // Calculate distribution for each contributor
        project.contributors.forEach(contributor => {
            // Contributors get their share percentage of the grant
            const contributorAmount = (grantAmount * contributor.revenueShare) / 100;
            
            distributions.push({
                contributorId: contributor.id,
                contributorName: contributor.name,
                contributorEmail: contributor.email,
                revenueSharePercentage: contributor.revenueShare,
                amount: contributorAmount,
                month: month,
                projectId: projectId,
                projectName: project.name,
                calculatedAt: Date.now()
            });
        });

        return {
            success: true,
            projectId: projectId,
            projectName: project.name,
            grantAmount: grantAmount,
            totalDistributed: distributions.reduce((sum, d) => sum + d.amount, 0),
            distributions: distributions
        };
    }

    /**
     * Save project data to localStorage
     */
    function saveProjectData() {
        try {
            localStorage.setItem('barbrick_project_grants', JSON.stringify(PROJECTS));
        } catch (e) {
            console.error('Failed to save project data:', e);
        }
    }

    /**
     * Load project data from localStorage
     */
    function loadProjectData() {
        try {
            const saved = localStorage.getItem('barbrick_project_grants');
            if (saved) {
                const loadedProjects = JSON.parse(saved);
                // Merge loaded data with default structure
                Object.keys(loadedProjects).forEach(key => {
                    if (PROJECTS[key]) {
                        PROJECTS[key] = { ...PROJECTS[key], ...loadedProjects[key] };
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load project data:', e);
        }
    }

    /**
     * Initialize system
     */
    function init() {
        loadProjectData();
        console.log('✅ Project-Grant Database initialized');
    }

    // Auto-initialize
    init();

    // Public API
    return {
        getProjectsByTier,
        getProject,
        getAllProjects,
        getProjectsByCategory,
        getProjectGrantOpportunities,
        assignContributor,
        trackMonthlyContribution,
        calculateMonthlyDistribution,
        saveProjectData,
        loadProjectData
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.ProjectGrantDatabase = ProjectGrantDatabase;
}
