/**
 * Project Display Widget - Reusable component for displaying projects
 * Based on organized-projects-hub.html patterns
 * 
 * @author Ryan Barbrick (BarbrickDesign)
 * @version 1.0.0
 */

class ProjectDisplayWidget {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with ID "${containerId}" not found`);
        }
        
        this.options = {
            showSearch: options.showSearch !== false,
            showFilters: options.showFilters !== false,
            showStats: options.showStats !== false,
            showXP: options.showXP !== false,
            maxProjects: options.maxProjects || null,
            categories: options.categories || null,
            theme: options.theme || 'dark',
            onProjectClick: options.onProjectClick || this.defaultProjectClick,
            ...options
        };
        
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.currentStatusFilter = 'all';
        this.searchQuery = '';
        
        this.categoryIcons = {
            '3D Graphics': '🎨',
            'AI & Machine Learning': '🤖',
            'Art & Design': '🖼️',
            'Blockchain & Crypto': '⛓️',
            'Dashboards': '📊',
            'Data & Analytics': '📈',
            'E-commerce & Sales': '🛒',
            'Education & Learning': '📚',
            'Gaming': '🎮',
            'Government & Grants': '🏛️',
            'Miscellaneous': '🔧',
            'Real Estate': '🏠',
            'Security & Safety': '🔒',
            'Social & Communication': '💬',
            'Tools & Utilities': '🛠️',
            'Trading & Finance': '💰'
        };
    }
    
    /**
     * Initialize and render the widget
     */
    async init() {
        this.injectStyles();
        await this.loadProjects();
        this.render();
    }
    
    /**
     * Load projects from projects.json or provided data
     */
    async loadProjects() {
        try {
            if (this.options.projects) {
                this.projects = this.options.projects;
            } else {
                const response = await fetch('projects.json');
                const data = await response.json();
                this.projects = data.projects || [];
            }
            
            // Filter by categories if specified
            if (this.options.categories) {
                this.projects = this.projects.filter(p => 
                    this.options.categories.includes(p.category)
                );
            }
            
            // Limit number of projects if specified
            if (this.options.maxProjects) {
                this.projects = this.projects.slice(0, this.options.maxProjects);
            }
            
            this.filteredProjects = [...this.projects];
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = [];
            this.filteredProjects = [];
        }
    }
    
    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('project-widget-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'project-widget-styles';
        styles.textContent = `
            .project-widget {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: #ffffff;
            }
            
            .project-widget-stats {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 1.5rem;
            }
            
            .project-widget-stat {
                background: rgba(26, 26, 46, 0.8);
                border: 2px solid rgba(138, 43, 226, 0.3);
                border-radius: 12px;
                padding: 1rem 1.5rem;
                text-align: center;
                min-width: 120px;
            }
            
            .project-widget-stat-number {
                font-size: 1.8rem;
                font-weight: 900;
                background: linear-gradient(135deg, #8a2be2, #00d4ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .project-widget-stat-label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.85rem;
                margin-top: 0.25rem;
            }
            
            .project-widget-controls {
                background: rgba(26, 26, 46, 0.8);
                border: 2px solid rgba(138, 43, 226, 0.3);
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .project-widget-search {
                width: 100%;
                padding: 0.75rem 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(138, 43, 226, 0.3);
                border-radius: 50px;
                color: #fff;
                font-size: 0.95rem;
                margin-bottom: 1rem;
            }
            
            .project-widget-search:focus {
                outline: none;
                border-color: #8a2be2;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .project-widget-search::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .project-widget-filters {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .project-widget-filter-btn {
                padding: 0.5rem 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(138, 43, 226, 0.3);
                border-radius: 50px;
                color: rgba(255, 255, 255, 0.8);
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
                font-size: 0.85rem;
            }
            
            .project-widget-filter-btn:hover {
                background: rgba(138, 43, 226, 0.2);
                border-color: #8a2be2;
                transform: translateY(-2px);
            }
            
            .project-widget-filter-btn.active {
                background: linear-gradient(135deg, #8a2be2, #0080ff);
                border-color: transparent;
                color: #fff;
            }
            
            .project-widget-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1rem;
            }
            
            .project-widget-card {
                background: rgba(26, 26, 46, 0.8);
                border: 2px solid rgba(138, 43, 226, 0.3);
                border-radius: 12px;
                padding: 1.25rem;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .project-widget-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #8a2be2, #00d4ff);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .project-widget-card:hover {
                transform: translateY(-5px);
                border-color: #8a2be2;
                box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);
            }
            
            .project-widget-card:hover::before {
                opacity: 1;
            }
            
            .project-widget-card-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #fff;
                margin-bottom: 0.5rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .project-widget-card-desc {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.85rem;
                margin-bottom: 0.75rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .project-widget-tags {
                display: flex;
                gap: 0.4rem;
                flex-wrap: wrap;
                margin-bottom: 0.75rem;
            }
            
            .project-widget-tag {
                padding: 0.2rem 0.6rem;
                background: rgba(138, 43, 226, 0.2);
                border: 1px solid rgba(138, 43, 226, 0.4);
                border-radius: 20px;
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .project-widget-status {
                display: flex;
                gap: 0.75rem;
                margin-top: 0.75rem;
                padding-top: 0.75rem;
                border-top: 1px solid rgba(138, 43, 226, 0.2);
                align-items: center;
            }
            
            .project-widget-completion {
                flex: 1;
            }
            
            .project-widget-completion-label {
                font-size: 0.65rem;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 0.2rem;
                display: flex;
                justify-content: space-between;
            }
            
            .project-widget-completion-bar {
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                overflow: hidden;
            }
            
            .project-widget-completion-fill {
                height: 100%;
                background: linear-gradient(90deg, #8a2be2, #00d4ff);
                border-radius: 10px;
                transition: width 0.5s ease;
            }
            
            .project-widget-badge {
                padding: 0.3rem 0.6rem;
                border-radius: 20px;
                font-size: 0.65rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                white-space: nowrap;
            }
            
            .project-widget-badge.working {
                background: rgba(34, 197, 94, 0.2);
                border: 1px solid rgba(34, 197, 94, 0.5);
                color: #4ade80;
            }
            
            .project-widget-badge.partial {
                background: rgba(251, 191, 36, 0.2);
                border: 1px solid rgba(251, 191, 36, 0.5);
                color: #fbbf24;
            }
            
            .project-widget-badge.broken {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.5);
                color: #ef4444;
            }
            
            .project-widget-badge.untested {
                background: rgba(107, 114, 128, 0.2);
                border: 1px solid rgba(107, 114, 128, 0.5);
                color: #9ca3af;
            }
            
            .project-widget-xp {
                display: flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.3rem 0.6rem;
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                color: #FFD700;
            }
            
            .project-widget-empty {
                text-align: center;
                padding: 3rem 2rem;
                color: rgba(255, 255, 255, 0.6);
            }
            
            @media (max-width: 768px) {
                .project-widget-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    /**
     * Render the widget
     */
    render() {
        this.container.classList.add('project-widget');
        this.container.innerHTML = '';
        
        // Stats bar
        if (this.options.showStats) {
            this.container.appendChild(this.renderStats());
        }
        
        // Controls (search + filters)
        if (this.options.showSearch || this.options.showFilters) {
            this.container.appendChild(this.renderControls());
        }
        
        // Projects grid
        this.container.appendChild(this.renderProjects());
    }
    
    /**
     * Render stats bar
     */
    renderStats() {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'project-widget-stats';
        
        const workingCount = this.projects.filter(p => p.functionality === 'working').length;
        const avgCompletion = Math.round(
            this.projects.reduce((sum, p) => sum + (p.completion || 0), 0) / this.projects.length
        );
        const totalXP = this.projects.reduce((sum, p) => sum + (p.xpValue || 0), 0);
        
        const stats = [
            { label: 'Projects', value: this.projects.length },
            { label: 'Working', value: workingCount },
            { label: 'Avg Complete', value: `${avgCompletion}%` }
        ];
        
        if (this.options.showXP) {
            stats.push({ label: 'Total XP', value: totalXP.toLocaleString() });
        }
        
        stats.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'project-widget-stat';
            statDiv.innerHTML = `
                <div class="project-widget-stat-number">${stat.value}</div>
                <div class="project-widget-stat-label">${stat.label}</div>
            `;
            statsDiv.appendChild(statDiv);
        });
        
        return statsDiv;
    }
    
    /**
     * Render controls (search + filters)
     */
    renderControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'project-widget-controls';
        
        // Search box
        if (this.options.showSearch) {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'project-widget-search';
            searchInput.placeholder = '🔍 Search projects...';
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterProjects();
            });
            controlsDiv.appendChild(searchInput);
        }
        
        // Status filters
        if (this.options.showFilters) {
            const filtersDiv = document.createElement('div');
            filtersDiv.className = 'project-widget-filters';
            
            const statuses = [
                { value: 'all', label: 'All' },
                { value: 'working', label: '✓ Working' },
                { value: 'partial', label: '◐ Partial' },
                { value: 'broken', label: '✗ Broken' },
                { value: 'untested', label: '? Untested' }
            ];
            
            statuses.forEach(status => {
                const btn = document.createElement('button');
                btn.className = 'project-widget-filter-btn';
                if (status.value === 'all') btn.classList.add('active');
                btn.textContent = status.label;
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.project-widget-filter-btn').forEach(b => 
                        b.classList.remove('active')
                    );
                    btn.classList.add('active');
                    this.currentStatusFilter = status.value;
                    this.filterProjects();
                });
                filtersDiv.appendChild(btn);
            });
            
            controlsDiv.appendChild(filtersDiv);
        }
        
        return controlsDiv;
    }
    
    /**
     * Render projects grid
     */
    renderProjects() {
        const gridDiv = document.createElement('div');
        gridDiv.className = 'project-widget-grid';
        
        if (this.filteredProjects.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'project-widget-empty';
            emptyDiv.innerHTML = '<h3>No projects found</h3><p>Try adjusting your filters</p>';
            gridDiv.appendChild(emptyDiv);
            return gridDiv;
        }
        
        this.filteredProjects.forEach(project => {
            gridDiv.appendChild(this.renderProjectCard(project));
        });
        
        return gridDiv;
    }
    
    /**
     * Render individual project card
     */
    renderProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-widget-card';
        card.addEventListener('click', () => this.options.onProjectClick(project));
        
        const tags = (project.tags || []).slice(0, 3).map(tag => 
            `<span class="project-widget-tag">${tag}</span>`
        ).join('');
        
        const completion = project.completion || 0;
        const functionality = project.functionality || 'untested';
        const xpValue = project.xpValue || 0;
        
        card.innerHTML = `
            <h3 class="project-widget-card-title">${project.title}</h3>
            <p class="project-widget-card-desc">${project.description}</p>
            <div class="project-widget-tags">${tags}</div>
            <div class="project-widget-status">
                <div class="project-widget-completion">
                    <div class="project-widget-completion-label">
                        <span>Completion</span>
                        <span>${completion}%</span>
                    </div>
                    <div class="project-widget-completion-bar">
                        <div class="project-widget-completion-fill" style="width: ${completion}%"></div>
                    </div>
                </div>
                <div class="project-widget-badge ${functionality}">
                    ${functionality === 'working' ? '✓' : functionality === 'partial' ? '◐' : functionality === 'broken' ? '✗' : '?'}
                </div>
            </div>
            ${this.options.showXP ? `<div class="project-widget-xp" style="margin-top: 0.75rem;">⚡ ${xpValue.toLocaleString()} XP</div>` : ''}
        `;
        
        return card;
    }
    
    /**
     * Filter projects based on search and status
     */
    filterProjects() {
        this.filteredProjects = this.projects.filter(project => {
            // Status filter
            if (this.currentStatusFilter !== 'all' && project.functionality !== this.currentStatusFilter) {
                return false;
            }
            
            // Search filter
            if (this.searchQuery) {
                const searchText = `${project.title} ${project.description} ${(project.tags || []).join(' ')}`.toLowerCase();
                if (!searchText.includes(this.searchQuery)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Re-render projects
        const existingGrid = this.container.querySelector('.project-widget-grid');
        if (existingGrid) {
            existingGrid.replaceWith(this.renderProjects());
        }
    }
    
    /**
     * Default project click handler
     */
    defaultProjectClick(project) {
        if (project.url) {
            window.location.href = project.url;
        } else if (project.path) {
            window.location.href = project.path;
        }
    }
    
    /**
     * Update widget with new projects
     */
    updateProjects(projects) {
        this.projects = projects;
        this.filterProjects();
        
        // Update stats
        if (this.options.showStats) {
            const existingStats = this.container.querySelector('.project-widget-stats');
            if (existingStats) {
                existingStats.replaceWith(this.renderStats());
            }
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ProjectDisplayWidget = ProjectDisplayWidget;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectDisplayWidget;
}
