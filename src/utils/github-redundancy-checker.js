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
 * File: github-redundancy-checker.js
 * Declaration ID: IP-2284DC68-MLL28ZWF
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GitHub Redundancy Checker
 * 
 * Checks for redundant ideas and projects across:
 * - Local repository projects
 * - GitHub organization repositories
 * - Public GitHub repositories
 * 
 * Features:
 * - Search by keywords, description, technology
 * - AI-powered similarity detection
 * - Caching to reduce API calls
 * - Comprehensive reporting
 * 
 * @author Ryan Barbrick (BarbrickDesign@gmail.com)
 * @version 1.0.0
 */

class GitHubRedundancyChecker {
  constructor(config = {}) {
    this.config = {
      githubToken: config.githubToken || null,
      cacheExpiry: config.cacheExpiry || 3600000, // 1 hour
      similarityThreshold: config.similarityThreshold || 0.7,
      maxResults: config.maxResults || 50,
      ...config
    };
    
    this.cache = new Map();
    this.localProjects = [];
    this.searchHistory = [];
  }
  
  /**
   * Initialize the checker by loading local projects
   */
  async init() {
    try {
      console.log('🔍 Initializing GitHub Redundancy Checker...');
      await this.loadLocalProjects();
      console.log(`✅ Loaded ${this.localProjects.length} local projects`);
      return true;
    } catch (error) {
      console.error('Failed to initialize:', error);
      throw error;
    }
  }
  
  /**
   * Load local projects from projects.json
   */
  async loadLocalProjects() {
    try {
      const response = await fetch('/projects.json');
      if (!response.ok) {
        throw new Error(`Failed to load projects.json: ${response.status}`);
      }
      
      const data = await response.json();
      this.localProjects = data.projects || [];
      
      console.log(`📦 Loaded ${this.localProjects.length} local projects`);
      return this.localProjects;
    } catch (error) {
      console.error('Error loading local projects:', error);
      this.localProjects = [];
      return [];
    }
  }
  
  /**
   * Check for redundant ideas
   * @param {string} ideaDescription - Description of the idea to check
   * @param {object} options - Search options
   * @returns {Promise<object>} Redundancy report
   */
  async checkRedundancy(ideaDescription, options = {}) {
    const searchOptions = {
      searchLocal: options.searchLocal !== false,
      searchOrg: options.searchOrg !== false,
      searchPublic: options.searchPublic !== false,
      keywords: options.keywords || [],
      technologies: options.technologies || [],
      ...options
    };
    
    console.log('🔍 Checking redundancy for:', ideaDescription);
    
    const results = {
      idea: ideaDescription,
      timestamp: new Date().toISOString(),
      summary: {
        totalMatches: 0,
        localMatches: 0,
        orgMatches: 0,
        publicMatches: 0,
        highSimilarity: 0,
        mediumSimilarity: 0,
        lowSimilarity: 0
      },
      matches: {
        local: [],
        organization: [],
        public: []
      },
      recommendations: []
    };
    
    try {
      // Search local projects
      if (searchOptions.searchLocal) {
        console.log('📦 Searching local projects...');
        results.matches.local = await this.searchLocalProjects(ideaDescription, searchOptions);
        results.summary.localMatches = results.matches.local.length;
      }
      
      // Search organization repositories
      if (searchOptions.searchOrg) {
        console.log('🏢 Searching organization repositories...');
        results.matches.organization = await this.searchOrganizationRepos(ideaDescription, searchOptions);
        results.summary.orgMatches = results.matches.organization.length;
      }
      
      // Search public GitHub
      if (searchOptions.searchPublic) {
        console.log('🌐 Searching public GitHub...');
        results.matches.public = await this.searchPublicGitHub(ideaDescription, searchOptions);
        results.summary.publicMatches = results.matches.public.length;
      }
      
      // Calculate totals and similarity breakdown
      const allMatches = [
        ...results.matches.local,
        ...results.matches.organization,
        ...results.matches.public
      ];
      
      results.summary.totalMatches = allMatches.length;
      results.summary.highSimilarity = allMatches.filter(m => m.similarity >= 0.8).length;
      results.summary.mediumSimilarity = allMatches.filter(m => m.similarity >= 0.5 && m.similarity < 0.8).length;
      results.summary.lowSimilarity = allMatches.filter(m => m.similarity < 0.5).length;
      
      // Generate recommendations
      results.recommendations = this.generateRecommendations(results);
      
      // Save to history
      this.searchHistory.push({
        idea: ideaDescription,
        timestamp: results.timestamp,
        totalMatches: results.summary.totalMatches,
        highSimilarity: results.summary.highSimilarity
      });
      
      console.log('✅ Redundancy check complete:', results.summary);
      return results;
      
    } catch (error) {
      console.error('Error checking redundancy:', error);
      throw error;
    }
  }
  
  /**
   * Search local projects
   */
  async searchLocalProjects(ideaDescription, options) {
    const matches = [];
    
    for (const project of this.localProjects) {
      const similarity = this.calculateSimilarity(
        ideaDescription,
        project.title || '',
        project.description || '',
        project.tags || []
      );
      
      if (similarity >= this.config.similarityThreshold * 0.5) { // Lower threshold for local
        matches.push({
          type: 'local',
          title: project.title || project.filename,
          description: project.description || 'No description',
          url: `/${project.path || project.filename}`,
          similarity: similarity,
          tags: project.tags || [],
          category: project.category || 'Uncategorized'
        });
      }
    }
    
    // Sort by similarity (highest first)
    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, this.config.maxResults);
  }
  
  /**
   * Search organization repositories
   */
  async searchOrganizationRepos(ideaDescription, options) {
    // Check cache first
    const cacheKey = `org:${ideaDescription}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheExpiry) {
        console.log('📦 Using cached org results');
        return cached.data;
      }
    }
    
    try {
      const org = 'barbrickdesign'; // Organization name
      const matches = [];
      
      // Use GitHub API to search organization repos
      const searchQuery = this.buildSearchQuery(ideaDescription, options.keywords);
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}+org:${org}&per_page=50`;
      
      const headers = {};
      if (this.config.githubToken) {
        headers['Authorization'] = `token ${this.config.githubToken}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.warn(`GitHub API returned ${response.status}`);
        return matches;
      }
      
      const data = await response.json();
      
      for (const repo of data.items || []) {
        const similarity = this.calculateSimilarity(
          ideaDescription,
          repo.name,
          repo.description || '',
          repo.topics || []
        );
        
        if (similarity >= this.config.similarityThreshold * 0.5) {
          matches.push({
            type: 'organization',
            title: repo.name,
            description: repo.description || 'No description',
            url: repo.html_url,
            similarity: similarity,
            stars: repo.stargazers_count,
            language: repo.language,
            topics: repo.topics || [],
            lastUpdated: repo.updated_at
          });
        }
      }
      
      // Cache results
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: matches
      });
      
      return matches.sort((a, b) => b.similarity - a.similarity).slice(0, this.config.maxResults);
      
    } catch (error) {
      console.error('Error searching organization repos:', error);
      return [];
    }
  }
  
  /**
   * Search public GitHub
   */
  async searchPublicGitHub(ideaDescription, options) {
    // Check cache first
    const cacheKey = `public:${ideaDescription}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheExpiry) {
        console.log('📦 Using cached public results');
        return cached.data;
      }
    }
    
    try {
      const matches = [];
      
      // Use GitHub API to search public repos
      const searchQuery = this.buildSearchQuery(ideaDescription, options.keywords);
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&per_page=30`;
      
      const headers = {};
      if (this.config.githubToken) {
        headers['Authorization'] = `token ${this.config.githubToken}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.warn(`GitHub API returned ${response.status}`);
        return matches;
      }
      
      const data = await response.json();
      
      for (const repo of data.items || []) {
        const similarity = this.calculateSimilarity(
          ideaDescription,
          repo.name,
          repo.description || '',
          repo.topics || []
        );
        
        if (similarity >= this.config.similarityThreshold * 0.5) {
          matches.push({
            type: 'public',
            title: repo.full_name,
            description: repo.description || 'No description',
            url: repo.html_url,
            similarity: similarity,
            stars: repo.stargazers_count,
            language: repo.language,
            topics: repo.topics || [],
            lastUpdated: repo.updated_at,
            owner: repo.owner.login
          });
        }
      }
      
      // Cache results
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: matches
      });
      
      return matches.sort((a, b) => b.similarity - a.similarity).slice(0, this.config.maxResults);
      
    } catch (error) {
      console.error('Error searching public GitHub:', error);
      return [];
    }
  }
  
  /**
   * Build search query from idea and keywords
   */
  buildSearchQuery(ideaDescription, keywords = []) {
    // Extract key terms from description
    const terms = ideaDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.isCommonWord(word));
    
    // Combine with provided keywords
    const allTerms = [...new Set([...terms.slice(0, 5), ...keywords])];
    
    return allTerms.join(' ');
  }
  
  /**
   * Check if word is too common to be useful in search
   */
  isCommonWord(word) {
    const common = ['this', 'that', 'with', 'from', 'have', 'they', 'will', 'what', 'when', 'where', 'which', 'about', 'could', 'would', 'should'];
    return common.includes(word);
  }
  
  /**
   * Calculate similarity between idea and project
   * Uses simple text matching and keyword overlap
   */
  calculateSimilarity(idea, title, description, tags) {
    let score = 0;
    const ideaLower = idea.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Extract keywords from idea
    const ideaWords = ideaLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !this.isCommonWord(w));
    
    // Title matching (highest weight)
    let titleMatches = 0;
    for (const word of ideaWords) {
      if (titleLower.includes(word)) {
        titleMatches++;
      }
    }
    score += (titleMatches / Math.max(ideaWords.length, 1)) * 0.5;
    
    // Description matching
    let descMatches = 0;
    for (const word of ideaWords) {
      if (descLower.includes(word)) {
        descMatches++;
      }
    }
    score += (descMatches / Math.max(ideaWords.length, 1)) * 0.3;
    
    // Tag matching
    if (tags && tags.length > 0) {
      let tagMatches = 0;
      for (const word of ideaWords) {
        for (const tag of tags) {
          if (tag.toLowerCase().includes(word)) {
            tagMatches++;
            break;
          }
        }
      }
      score += (tagMatches / Math.max(ideaWords.length, 1)) * 0.2;
    }
    
    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
  }
  
  /**
   * Generate recommendations based on redundancy check results
   */
  generateRecommendations(results) {
    const recommendations = [];
    const { highSimilarity, mediumSimilarity, totalMatches } = results.summary;
    
    if (highSimilarity > 0) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        message: `⚠️ Found ${highSimilarity} highly similar project(s). Consider if this idea is truly unique or if you should contribute to existing projects instead.`,
        action: 'Review high similarity matches carefully'
      });
    }
    
    if (mediumSimilarity > 3) {
      recommendations.push({
        type: 'info',
        priority: 'medium',
        message: `ℹ️ Found ${mediumSimilarity} moderately similar projects. Consider what makes your idea different and whether it adds unique value.`,
        action: 'Document unique features and value proposition'
      });
    }
    
    if (totalMatches === 0) {
      recommendations.push({
        type: 'success',
        priority: 'low',
        message: `✅ No similar projects found! This appears to be a unique idea.`,
        action: 'Proceed with development'
      });
    }
    
    if (results.matches.local.length > 0) {
      recommendations.push({
        type: 'info',
        priority: 'medium',
        message: `📦 Found ${results.matches.local.length} similar local project(s). Consider enhancing existing projects instead of creating new ones.`,
        action: 'Review local projects for integration opportunities'
      });
    }
    
    if (results.matches.organization.length > 0) {
      recommendations.push({
        type: 'info',
        priority: 'medium',
        message: `🏢 Found ${results.matches.organization.length} similar organization repository(s). Check if this work is already in progress.`,
        action: 'Coordinate with team to avoid duplicate work'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Get search history
   */
  getSearchHistory() {
    return this.searchHistory;
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }
  
  /**
   * Export results to JSON
   */
  exportResults(results) {
    return JSON.stringify(results, null, 2);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubRedundancyChecker;
} else if (typeof window !== 'undefined') {
  window.GitHubRedundancyChecker = GitHubRedundancyChecker;
}
