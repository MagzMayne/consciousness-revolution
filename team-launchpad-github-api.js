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
 * File: team-launchpad-github-api.js
 * Declaration ID: IP-24C49FB6-MLL28ZWH
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEAM LAUNCHPAD GITHUB API INTEGRATION
 * Consciousness Revolution Collaboration Platform
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Provides GitHub API integration for fetching real repository data,
 * analyzing code, and suggesting project collaborations.
 * 
 * © 2024-2026 Ryan Barbrick. All Rights Reserved.
 * Contact: BarbrickDesign@gmail.com
 * Creator: Agent R - The Hub Architect
 * ═══════════════════════════════════════════════════════════════════════════
 */

class TeamLaunchpadGitHubAPI {
    constructor() {
        this.version = '1.0.0';
        this.creatorSignature = 'BarbrickDesign@gmail.com';
        this.creatorAgent = 'Agent R';
        
        // GitHub API base URL
        this.apiBase = 'https://api.github.com';
        
        // Rate limiting
        this.requestCount = 0;
        this.rateLimitReset = null;
        
        console.log('🔗 GitHub API Integration initialized');
        console.log('📧 Creator:', this.creatorSignature);
    }
    
    /**
     * Parse GitHub URL to extract owner and repo
     */
    parseGitHubUrl(url) {
        const patterns = [
            /github\.com\/([^\/]+)\/([^\/]+)/,
            /^([^\/]+)\/([^\/]+)$/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2].replace(/\.git$/, '')
                };
            }
        }
        
        throw new Error('Invalid GitHub URL format');
    }
    
    /**
     * Fetch repository information from GitHub
     */
    async fetchRepoInfo(owner, repo) {
        try {
            const response = await fetch(`${this.apiBase}/repos/${owner}/${repo}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository not found');
                } else if (response.status === 403) {
                    throw new Error('Rate limit exceeded or access forbidden');
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                name: data.name,
                fullName: data.full_name,
                description: data.description || 'No description provided',
                language: data.language,
                topics: data.topics || [],
                stars: data.stargazers_count,
                forks: data.forks_count,
                openIssues: data.open_issues_count,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                homepage: data.homepage,
                htmlUrl: data.html_url,
                defaultBranch: data.default_branch,
                size: data.size,
                license: data.license ? data.license.name : null
            };
        } catch (error) {
            console.error('Error fetching repo info:', error);
            throw error;
        }
    }
    
    /**
     * Fetch repository languages breakdown
     */
    async fetchRepoLanguages(owner, repo) {
        try {
            const response = await fetch(`${this.apiBase}/repos/${owner}/${repo}/languages`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch languages: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Convert to percentages
            const total = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);
            const languages = Object.entries(data).map(([lang, bytes]) => ({
                name: lang,
                bytes: bytes,
                percentage: ((bytes / total) * 100).toFixed(2)
            }));
            
            // Sort by usage
            languages.sort((a, b) => b.bytes - a.bytes);
            
            return languages;
        } catch (error) {
            console.error('Error fetching languages:', error);
            return [];
        }
    }
    
    /**
     * Fetch repository README
     */
    async fetchRepoReadme(owner, repo) {
        try {
            const response = await fetch(`${this.apiBase}/repos/${owner}/${repo}/readme`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to fetch README: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Decode base64 content
            const content = atob(data.content);
            
            return {
                content: content,
                name: data.name,
                path: data.path,
                sha: data.sha,
                url: data.html_url
            };
        } catch (error) {
            console.error('Error fetching README:', error);
            return null;
        }
    }
    
    /**
     * Fetch recent commits
     */
    async fetchRecentCommits(owner, repo, limit = 10) {
        try {
            const response = await fetch(`${this.apiBase}/repos/${owner}/${repo}/commits?per_page=${limit}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch commits: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.map(commit => ({
                sha: commit.sha.substring(0, 7),
                message: commit.commit.message.split('\n')[0],
                author: commit.commit.author.name,
                date: commit.commit.author.date,
                url: commit.html_url
            }));
        } catch (error) {
            console.error('Error fetching commits:', error);
            return [];
        }
    }
    
    /**
     * Fetch repository contributors
     */
    async fetchContributors(owner, repo) {
        try {
            const response = await fetch(`${this.apiBase}/repos/${owner}/${repo}/contributors`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch contributors: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.map(contributor => ({
                login: contributor.login,
                avatar: contributor.avatar_url,
                contributions: contributor.contributions,
                profileUrl: contributor.html_url
            }));
        } catch (error) {
            console.error('Error fetching contributors:', error);
            return [];
        }
    }
    
    /**
     * Get comprehensive repository data
     */
    async getFullRepoData(githubUrl) {
        try {
            const { owner, repo } = this.parseGitHubUrl(githubUrl);
            
            // Fetch all data in parallel
            const [info, languages, readme, commits, contributors] = await Promise.all([
                this.fetchRepoInfo(owner, repo),
                this.fetchRepoLanguages(owner, repo),
                this.fetchRepoReadme(owner, repo),
                this.fetchRecentCommits(owner, repo, 5),
                this.fetchContributors(owner, repo)
            ]);
            
            return {
                owner,
                repo,
                info,
                languages,
                readme,
                commits,
                contributors,
                fetchedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching full repo data:', error);
            throw error;
        }
    }
    
    /**
     * Calculate similarity score between two repositories
     */
    calculateRepoSimilarity(repo1Data, repo2Data) {
        let score = 0;
        let factors = [];
        
        // Language similarity (40% weight)
        if (repo1Data.info.language && repo2Data.info.language) {
            if (repo1Data.info.language === repo2Data.info.language) {
                score += 0.4;
                factors.push('Same primary language');
            }
        }
        
        // Topics similarity (30% weight)
        const topics1 = new Set(repo1Data.info.topics);
        const topics2 = new Set(repo2Data.info.topics);
        const topicsIntersection = new Set([...topics1].filter(x => topics2.has(x)));
        const topicsUnion = new Set([...topics1, ...topics2]);
        
        if (topicsUnion.size > 0) {
            const topicsSimilarity = topicsIntersection.size / topicsUnion.size;
            score += topicsSimilarity * 0.3;
            
            if (topicsIntersection.size > 0) {
                factors.push(`Shared topics: ${[...topicsIntersection].join(', ')}`);
            }
        }
        
        // Description similarity (20% weight)
        const desc1Words = new Set(repo1Data.info.description.toLowerCase().split(/\s+/));
        const desc2Words = new Set(repo2Data.info.description.toLowerCase().split(/\s+/));
        const descIntersection = new Set([...desc1Words].filter(x => desc2Words.has(x)));
        
        if (desc1Words.size > 0 && desc2Words.size > 0) {
            const descSimilarity = descIntersection.size / Math.max(desc1Words.size, desc2Words.size);
            score += descSimilarity * 0.2;
            
            if (descIntersection.size > 2) {
                factors.push('Similar project descriptions');
            }
        }
        
        // Size similarity (10% weight)
        if (repo1Data.info.size > 0 && repo2Data.info.size > 0) {
            const sizeRatio = Math.min(repo1Data.info.size, repo2Data.info.size) / 
                            Math.max(repo1Data.info.size, repo2Data.info.size);
            score += sizeRatio * 0.1;
        }
        
        return {
            score: Math.round(score * 100),
            factors,
            recommendation: score > 0.5 ? 'high' : score > 0.3 ? 'medium' : 'low'
        };
    }
    
    /**
     * Generate collaboration suggestions
     */
    generateCollaborationSuggestions(repo1Data, repo2Data, similarity) {
        const suggestions = [];
        
        if (similarity.score > 60) {
            suggestions.push({
                priority: 'high',
                type: 'merge',
                title: 'Consider Merging Projects',
                description: 'These projects have significant overlap and could benefit from consolidation.'
            });
        }
        
        if (repo1Data.info.language === repo2Data.info.language) {
            suggestions.push({
                priority: 'medium',
                type: 'code_sharing',
                title: 'Share Code Components',
                description: `Both use ${repo1Data.info.language}. Consider creating a shared library.`
            });
        }
        
        const topics1 = new Set(repo1Data.info.topics);
        const topics2 = new Set(repo2Data.info.topics);
        const sharedTopics = [...topics1].filter(x => topics2.has(x));
        
        if (sharedTopics.length > 0) {
            suggestions.push({
                priority: 'medium',
                type: 'documentation',
                title: 'Cross-Reference Documentation',
                description: `Both projects cover: ${sharedTopics.join(', ')}`
            });
        }
        
        if (repo1Data.contributors.length > 0 && repo2Data.contributors.length > 0) {
            const contributors1 = new Set(repo1Data.contributors.map(c => c.login));
            const contributors2 = new Set(repo2Data.contributors.map(c => c.login));
            const sharedContributors = [...contributors1].filter(x => contributors2.has(x));
            
            if (sharedContributors.length > 0) {
                suggestions.push({
                    priority: 'high',
                    type: 'team',
                    title: 'Shared Contributors Detected',
                    description: `${sharedContributors.length} developer(s) work on both projects.`
                });
            }
        }
        
        suggestions.push({
            priority: 'low',
            type: 'general',
            title: 'Regular Sync Meetings',
            description: 'Schedule regular check-ins to discuss project alignment.'
        });
        
        return suggestions;
    }
    
    /**
     * Search for similar repositories on GitHub
     */
    async searchSimilarRepos(repoData, limit = 5) {
        try {
            const searchTerms = [
                repoData.info.language,
                ...repoData.info.topics.slice(0, 3)
            ].filter(Boolean).join(' ');
            
            if (!searchTerms) {
                return [];
            }
            
            const response = await fetch(
                `${this.apiBase}/search/repositories?q=${encodeURIComponent(searchTerms)}&sort=stars&per_page=${limit}`
            );
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.items.map(repo => ({
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                stars: repo.stargazers_count,
                language: repo.language,
                url: repo.html_url,
                topics: repo.topics || []
            }));
        } catch (error) {
            console.error('Error searching similar repos:', error);
            return [];
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.TeamLaunchpadGitHubAPI = TeamLaunchpadGitHubAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamLaunchpadGitHubAPI;
}

// Console attribution
console.log('%c🔗 GitHub API Integration', 'color: #00d9ff; font-size: 16px; font-weight: bold;');
console.log('%cCreated by Agent R', 'color: #ff006e; font-size: 12px;');
console.log('%c📧 BarbrickDesign@gmail.com', 'color: #8338ec; font-size: 12px;');
