/**
 * PROJECT WIDGET - Dashboard Integration
 *
 * Displays projects that user has added from the Project Registry.
 * Reads from localStorage and renders as a widget on any dashboard.
 *
 * Usage: Include this script and call ProjectWidget.init('containerId', 'dashboardId')
 */

(function() {
    'use strict';

    const ProjectWidget = {
        dashboardId: null,
        container: null,

        /**
         * Initialize the project widget
         */
        init(containerId, dashboardId) {
            this.dashboardId = dashboardId || localStorage.getItem('current_operator') || 'commander_1';
            this.container = document.getElementById(containerId);

            if (!this.container) {
                console.warn('ProjectWidget: Container not found:', containerId);
                return;
            }

            this.render();
            this.setupSync();
        },

        /**
         * Get projects added to this dashboard
         */
        getProjects() {
            const key = `dashboard_${this.dashboardId}_projects`;
            const projectIds = JSON.parse(localStorage.getItem(key) || '[]');
            const projectCache = JSON.parse(localStorage.getItem('project_registry_cache') || '{}');

            return projectIds.map(id => projectCache[id]).filter(Boolean);
        },

        /**
         * Remove project from dashboard
         */
        removeProject(projectId) {
            const key = `dashboard_${this.dashboardId}_projects`;
            const projectIds = JSON.parse(localStorage.getItem(key) || '[]');
            const filtered = projectIds.filter(id => id !== projectId);
            localStorage.setItem(key, JSON.stringify(filtered));
            this.render();
        },

        /**
         * Render the widget
         */
        render() {
            const projects = this.getProjects();

            this.container.innerHTML = `
                <div class="project-widget" style="
                    background: linear-gradient(135deg, rgba(0,255,170,0.05), rgba(0,100,200,0.05));
                    border: 1px solid rgba(0,255,170,0.3);
                    border-radius: 12px;
                    padding: 15px;
                    margin: 10px 0;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="color: #00ffaa; margin: 0; font-size: 1.1em;">
                            📋 My Projects
                        </h3>
                        <a href="/PROJECT_REGISTRY.html" style="
                            color: #888;
                            text-decoration: none;
                            font-size: 0.8em;
                            padding: 4px 10px;
                            background: rgba(255,255,255,0.05);
                            border-radius: 12px;
                        ">+ Browse</a>
                    </div>

                    ${projects.length === 0 ? `
                        <div style="text-align: center; padding: 20px; color: #666;">
                            <p style="margin-bottom: 10px;">No projects added yet</p>
                            <a href="/PROJECT_REGISTRY.html" style="
                                display: inline-block;
                                padding: 8px 16px;
                                background: rgba(0,255,170,0.2);
                                border: 1px solid rgba(0,255,170,0.4);
                                border-radius: 8px;
                                color: #00ffaa;
                                text-decoration: none;
                                font-size: 0.9em;
                            ">Browse Project Registry</a>
                        </div>
                    ` : `
                        <div class="project-list" style="display: flex; flex-direction: column; gap: 8px;">
                            ${projects.map(p => this.renderProjectCard(p)).join('')}
                        </div>
                    `}
                </div>
            `;

            // Add event listeners
            this.container.querySelectorAll('.remove-project-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.removeProject(btn.dataset.projectId);
                });
            });
        },

        /**
         * Render individual project card
         */
        renderProjectCard(project) {
            const statusColors = {
                'active': '#00ff88',
                'needs-work': '#ff8800',
                'complete': '#00aaff'
            };
            const statusColor = statusColors[project.status] || '#888';

            return `
                <div class="project-card-mini" style="
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    padding: 12px;
                    border-left: 3px solid ${statusColor};
                    cursor: pointer;
                    transition: all 0.2s;
                " onclick="window.open('${project.url}', '_blank')">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #fff; margin-bottom: 4px; font-size: 0.95em;">
                                ${project.name}
                            </div>
                            <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
                                ${project.description?.substring(0, 60) || ''}${project.description?.length > 60 ? '...' : ''}
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <div style="
                                    height: 4px;
                                    flex: 1;
                                    background: #333;
                                    border-radius: 2px;
                                    overflow: hidden;
                                ">
                                    <div style="
                                        height: 100%;
                                        width: ${project.progress || 0}%;
                                        background: ${statusColor};
                                    "></div>
                                </div>
                                <span style="font-size: 0.7em; color: #888;">${project.progress || 0}%</span>
                            </div>
                        </div>
                        <button class="remove-project-btn" data-project-id="${project.id}" style="
                            background: none;
                            border: none;
                            color: #555;
                            cursor: pointer;
                            padding: 4px;
                            font-size: 1em;
                            line-height: 1;
                        " title="Remove from dashboard">&times;</button>
                    </div>
                    ${project.needs && project.needs.length ? `
                        <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
                            ${project.needs.slice(0, 2).map(n => `
                                <span style="
                                    padding: 2px 6px;
                                    background: rgba(255,136,0,0.15);
                                    border-radius: 8px;
                                    font-size: 0.65em;
                                    color: #ff8800;
                                ">${n}</span>
                            `).join('')}
                            ${project.needs.length > 2 ? `<span style="font-size: 0.65em; color: #666;">+${project.needs.length - 2}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        },

        /**
         * Setup cross-tab sync
         */
        setupSync() {
            window.addEventListener('storage', (e) => {
                if (e.key && e.key.includes('_projects')) {
                    this.render();
                }
            });
        }
    };

    // Export
    window.ProjectWidget = ProjectWidget;

})();
