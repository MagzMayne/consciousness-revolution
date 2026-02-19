/**
 * Project Contribution Tracker
 * Tracks developer contributions to projects, manages incomplete projects,
 * and facilitates collaboration between developers
 * 
 * @author Ryan Barbrick (BarbrickDesign)
 * @version 1.0.0
 */

class ProjectContributionTracker {
    constructor() {
        this.projects = new Map();
        this.developers = new Map();
        this.contributions = [];
        this.incompleteProjects = new Map();
    }
    
    /**
     * Add a project from a repo link
     * @param {Object} projectData - Project information
     * @returns {Object} Project with parsed data
     */
    addProject(projectData) {
        const project = {
            id: projectData.id || this.generateId(),
            repoUrl: projectData.repoUrl,
            owner: projectData.owner,
            title: projectData.title,
            description: projectData.description,
            completion: projectData.completion || 0,
            functionality: projectData.functionality || 'untested',
            tags: projectData.tags || [],
            category: projectData.category || 'Miscellaneous',
            contributors: projectData.contributors || [],
            openTasks: projectData.openTasks || [],
            xpValue: this.calculateProjectXP(projectData),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.projects.set(project.id, project);
        
        // If incomplete, add to incomplete list
        if (project.completion < 100 || project.functionality !== 'working') {
            this.incompleteProjects.set(project.id, project);
        }
        
        return project;
    }
    
    /**
     * Parse GitHub/GitLab repo URL
     * @param {string} repoUrl - Repository URL
     * @returns {Object} Parsed repo data
     */
    parseRepoUrl(repoUrl) {
        // Support GitHub, GitLab, Bitbucket patterns
        const patterns = {
            github: /github\.com\/([^\/]+)\/([^\/\?#]+)/,
            gitlab: /gitlab\.com\/([^\/]+)\/([^\/\?#]+)/,
            bitbucket: /bitbucket\.org\/([^\/]+)\/([^\/\?#]+)/
        };
        
        for (const [platform, pattern] of Object.entries(patterns)) {
            const match = repoUrl.match(pattern);
            if (match) {
                return {
                    platform,
                    owner: match[1],
                    repo: match[2].replace('.git', ''),
                    url: repoUrl,
                    apiUrl: this.getApiUrl(platform, match[1], match[2])
                };
            }
        }
        
        return null;
    }
    
    /**
     * Get API URL for fetching repo data
     * @param {string} platform - Git platform
     * @param {string} owner - Repo owner
     * @param {string} repo - Repo name
     * @returns {string} API URL
     */
    getApiUrl(platform, owner, repo) {
        const apis = {
            github: `https://api.github.com/repos/${owner}/${repo}`,
            gitlab: `https://gitlab.com/api/v4/projects/${encodeURIComponent(owner + '/' + repo)}`,
            bitbucket: `https://api.bitbucket.org/2.0/repositories/${owner}/${repo}`
        };
        
        return apis[platform];
    }
    
    /**
     * Fetch project data from repo URL
     * @param {string} repoUrl - Repository URL
     * @returns {Promise<Object>} Project data
     */
    async fetchProjectFromRepo(repoUrl) {
        const parsed = this.parseRepoUrl(repoUrl);
        if (!parsed) {
            throw new Error('Invalid repository URL');
        }
        
        try {
            const response = await fetch(parsed.apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch repo: ${response.statusText}`);
            }
            
            const repoData = await response.json();
            
            // Parse project data from repo
            const project = {
                id: `${parsed.platform}-${parsed.owner}-${parsed.repo}`,
                repoUrl: parsed.url,
                owner: parsed.owner,
                title: repoData.name || parsed.repo,
                description: repoData.description || 'No description provided',
                tags: repoData.topics || repoData.keywords || [],
                category: this.categorizeRepo(repoData),
                stars: repoData.stargazers_count || repoData.star_count || 0,
                forks: repoData.forks_count || repoData.forks || 0,
                language: repoData.language,
                lastUpdated: repoData.updated_at || repoData.last_activity_at,
                completion: 50, // Default, can be updated
                functionality: 'untested'
            };
            
            return project;
        } catch (error) {
            console.error('Error fetching repo data:', error);
            throw error;
        }
    }
    
    /**
     * Categorize repository based on metadata
     * @param {Object} repoData - Repository data
     * @returns {string} Category
     */
    categorizeRepo(repoData) {
        const description = (repoData.description || '').toLowerCase();
        const language = (repoData.language || '').toLowerCase();
        const topics = (repoData.topics || []).join(' ').toLowerCase();
        const text = `${description} ${language} ${topics}`;
        
        const categories = {
            'Blockchain & Crypto': ['blockchain', 'crypto', 'web3', 'solana', 'ethereum', 'nft', 'defi'],
            'AI & Machine Learning': ['ai', 'ml', 'machine learning', 'neural', 'tensorflow', 'pytorch'],
            '3D Graphics': ['3d', 'webgl', 'three.js', 'babylon', 'graphics'],
            'Gaming': ['game', 'gaming', 'unity', 'unreal', 'phaser'],
            'Security & Safety': ['security', 'auth', 'encryption', 'safety'],
            'Tools & Utilities': ['tool', 'utility', 'helper', 'automation'],
            'Trading & Finance': ['trading', 'finance', 'market', 'stock', 'forex']
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        
        return 'Miscellaneous';
    }
    
    /**
     * Calculate XP value of a project
     * @param {Object} projectData - Project data
     * @returns {number} XP value
     */
    calculateProjectXP(projectData) {
        let baseXP = 500; // Base project value
        
        // Factor in completion
        baseXP += (projectData.completion || 0) * 10;
        
        // Factor in functionality
        const functionalityBonus = {
            working: 500,
            partial: 250,
            broken: 0,
            untested: 100
        };
        baseXP += functionalityBonus[projectData.functionality] || 0;
        
        // Factor in stars/popularity (if from repo)
        if (projectData.stars) {
            baseXP += Math.min(projectData.stars * 10, 1000); // Max 1000 bonus
        }
        
        return baseXP;
    }
    
    /**
     * Record a contribution to a project
     * @param {string} projectId - Project ID
     * @param {string} developerId - Developer ID
     * @param {Object} contributionData - Contribution details
     * @returns {Object} Contribution record
     */
    recordContribution(projectId, developerId, contributionData) {
        const project = this.projects.get(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        
        const contribution = {
            id: this.generateId(),
            projectId,
            developerId,
            type: contributionData.type,
            description: contributionData.description,
            timeSpent: contributionData.timeSpent || 0,
            completionDelta: contributionData.completionDelta || 0,
            xpEarned: 0,
            timestamp: new Date().toISOString(),
            status: 'pending' // pending, approved, rejected
        };
        
        this.contributions.push(contribution);
        
        // Update project
        project.contributors.push(developerId);
        project.contributors = [...new Set(project.contributors)]; // Deduplicate
        project.updatedAt = new Date().toISOString();
        
        // Update developer
        let developer = this.developers.get(developerId);
        if (!developer) {
            developer = {
                id: developerId,
                name: contributionData.developerName || developerId,
                contributions: [],
                totalXP: 0
            };
            this.developers.set(developerId, developer);
        }
        developer.contributions.push(contribution.id);
        
        return contribution;
    }
    
    /**
     * Approve a contribution and award XP
     * @param {string} contributionId - Contribution ID
     * @param {number} xpAmount - XP to award
     * @returns {Object} Updated contribution
     */
    approveContribution(contributionId, xpAmount) {
        const contribution = this.contributions.find(c => c.id === contributionId);
        if (!contribution) {
            throw new Error('Contribution not found');
        }
        
        contribution.status = 'approved';
        contribution.xpEarned = xpAmount;
        contribution.approvedAt = new Date().toISOString();
        
        // Update developer XP
        const developer = this.developers.get(contribution.developerId);
        if (developer) {
            developer.totalXP += xpAmount;
        }
        
        // Update project completion if applicable
        if (contribution.completionDelta > 0) {
            const project = this.projects.get(contribution.projectId);
            if (project) {
                project.completion = Math.min(100, project.completion + contribution.completionDelta);
                
                // Remove from incomplete if now complete and working
                if (project.completion === 100 && project.functionality === 'working') {
                    this.incompleteProjects.delete(contribution.projectId);
                }
            }
        }
        
        return contribution;
    }
    
    /**
     * Get incomplete projects that need help
     * @param {string} category - Optional category filter
     * @returns {Array} Incomplete projects
     */
    getIncompleteProjects(category = null) {
        let projects = Array.from(this.incompleteProjects.values());
        
        if (category) {
            projects = projects.filter(p => p.category === category);
        }
        
        // Sort by XP value (highest first)
        projects.sort((a, b) => b.xpValue - a.xpValue);
        
        return projects;
    }
    
    /**
     * Get developer profile
     * @param {string} developerId - Developer ID
     * @returns {Object} Developer profile
     */
    getDeveloperProfile(developerId) {
        const developer = this.developers.get(developerId);
        if (!developer) {
            return null;
        }
        
        const contributions = this.contributions.filter(
            c => c.developerId === developerId
        );
        
        const approvedContributions = contributions.filter(c => c.status === 'approved');
        const totalTimeSpent = contributions.reduce((sum, c) => sum + c.timeSpent, 0);
        
        return {
            ...developer,
            totalContributions: contributions.length,
            approvedContributions: approvedContributions.length,
            pendingContributions: contributions.filter(c => c.status === 'pending').length,
            totalTimeSpent,
            averageXPPerContribution: approvedContributions.length > 0
                ? Math.round(developer.totalXP / approvedContributions.length)
                : 0
        };
    }
    
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Save data to localStorage
     */
    save() {
        try {
            const data = {
                projects: Array.from(this.projects.entries()),
                developers: Array.from(this.developers.entries()),
                contributions: this.contributions,
                incompleteProjects: Array.from(this.incompleteProjects.entries()),
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('project-contribution-tracker', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save contribution data:', error);
            return false;
        }
    }
    
    /**
     * Load data from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('project-contribution-tracker');
            if (saved) {
                const data = JSON.parse(saved);
                this.projects = new Map(data.projects);
                this.developers = new Map(data.developers);
                this.contributions = data.contributions;
                this.incompleteProjects = new Map(data.incompleteProjects);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load contribution data:', error);
            return false;
        }
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.ProjectContributionTracker = ProjectContributionTracker;
    window.projectContributionTracker = new ProjectContributionTracker();
    
    // Load existing data
    window.projectContributionTracker.load();
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectContributionTracker;
}
