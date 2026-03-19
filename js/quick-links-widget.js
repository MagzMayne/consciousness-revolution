// RootIB: RB-20260319142113-0A7F0657
/**
 * QUICK LINKS WIDGET - Central Link Hub
 *
 * Displays organized links for team coordination
 * Customizable per user with localStorage
 */

(function() {
    'use strict';

    // Default links organized by category
    const DEFAULT_LINKS = {
        dashboards: {
            name: '📊 Dashboards',
            links: [
                { name: 'Commander Cockpit', url: '/COMMANDER_COCKPIT.html', icon: '🎖️' },
                { name: 'Team Dashboard', url: '/TEAM_DASHBOARD_HUB.html', icon: '👥' },
                { name: 'Project Registry', url: '/PROJECT_REGISTRY.html', icon: '📋' },
                { name: 'Bug Tracker', url: '/bugs.html', icon: '🐛' }
            ]
        },
        tools: {
            name: '🔧 Tools',
            links: [
                { name: 'ARAYA Chat', url: '/araya-chat.html', icon: '🤖' },
                { name: 'Trinity Nexus', url: '/TRINITY_NEXUS_DASHBOARD.html', icon: '🔺' },
                { name: 'Widget Test', url: '/widget-test.html', icon: '🧩' },
                { name: 'Cheap Terminal', url: '/cheap-terminal.html', icon: '💻' }
            ]
        },
        external: {
            name: '🌐 External',
            links: [
                { name: 'GitHub Repo', url: 'https://github.com/overkillkulture/consciousness-revolution', icon: '🐙' },
                { name: 'GitHub Issues', url: 'https://github.com/overkillkulture/consciousness-bugs/issues', icon: '📝' },
                { name: 'Netlify Dashboard', url: 'https://app.netlify.com/sites/verdant-tulumba-fa2a5a', icon: '🚀' },
                { name: 'Leaderboard API', url: '/.netlify/functions/project-registry?leaderboard=true', icon: '🏆' }
            ]
        },
        team: {
            name: '👥 Team',
            links: [
                { name: 'Ryan Cockpit', url: '/OPERATOR_COCKPIT_RYAN.html', icon: '🦁' },
                { name: 'Tiger Cockpit', url: '/OPERATOR_COCKPIT_TIGER.html', icon: '🐯' },
                { name: 'Nero Cockpit', url: '/OPERATOR_COCKPIT_NERO.html', icon: '👤' }
            ]
        }
    };

    const QuickLinksWidget = {
        container: null,
        links: null,
        isEditing: false,

        /**
         * Initialize the widget
         */
        init(containerId, options = {}) {
            this.container = document.getElementById(containerId);
            this.options = {
                showCategories: options.showCategories || ['dashboards', 'tools', 'external', 'team'],
                compact: options.compact || false,
                editable: options.editable !== false
            };

            if (!this.container) {
                console.warn('QuickLinksWidget: Container not found:', containerId);
                return;
            }

            // Load custom links from localStorage or use defaults
            this.links = this.loadLinks();
            this.render();
        },

        /**
         * Load links from localStorage
         */
        loadLinks() {
            try {
                const saved = localStorage.getItem('quickLinks');
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.warn('Failed to load saved links');
            }
            return { ...DEFAULT_LINKS };
        },

        /**
         * Save links to localStorage
         */
        saveLinks() {
            try {
                localStorage.setItem('quickLinks', JSON.stringify(this.links));
            } catch (e) {
                console.warn('Failed to save links');
            }
        },

        /**
         * Add a custom link
         */
        addLink(category, link) {
            if (!this.links[category]) {
                this.links[category] = { name: category, links: [] };
            }
            this.links[category].links.push(link);
            this.saveLinks();
            this.render();
        },

        /**
         * Remove a link
         */
        removeLink(category, index) {
            if (this.links[category]?.links) {
                this.links[category].links.splice(index, 1);
                this.saveLinks();
                this.render();
            }
        },

        /**
         * Reset to defaults
         */
        resetToDefaults() {
            this.links = { ...DEFAULT_LINKS };
            localStorage.removeItem('quickLinks');
            this.render();
        },

        /**
         * Render the widget
         */
        render() {
            const categories = this.options.showCategories
                .filter(cat => this.links[cat])
                .map(cat => this.links[cat]);

            this.container.innerHTML = `
                <div class="quick-links-widget" style="
                    background: linear-gradient(135deg, rgba(0,150,255,0.05), rgba(0,255,170,0.05));
                    border: 1px solid rgba(0,150,255,0.3);
                    border-radius: 12px;
                    overflow: hidden;
                ">
                    <!-- Header -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 15px;
                        background: rgba(0,150,255,0.1);
                        border-bottom: 1px solid rgba(0,150,255,0.2);
                    ">
                        <h3 style="color: #00aaff; margin: 0; font-size: 1em;">
                            🔗 Quick Links
                        </h3>
                        ${this.options.editable ? `
                            <button onclick="QuickLinksWidget.toggleEdit()" style="
                                background: rgba(255,255,255,0.1);
                                border: 1px solid rgba(255,255,255,0.2);
                                border-radius: 4px;
                                color: #888;
                                padding: 4px 8px;
                                font-size: 0.7em;
                                cursor: pointer;
                            ">${this.isEditing ? '✓ Done' : '✏️ Edit'}</button>
                        ` : ''}
                    </div>

                    <!-- Categories -->
                    <div style="padding: 10px;">
                        ${categories.map((cat, catIdx) => this.renderCategory(cat, this.options.showCategories[catIdx])).join('')}
                    </div>

                    ${this.isEditing ? `
                        <!-- Add Link Form -->
                        <div style="
                            padding: 10px 15px;
                            background: rgba(0,0,0,0.2);
                            border-top: 1px solid rgba(255,255,255,0.1);
                        ">
                            <div style="font-size: 0.8em; color: #888; margin-bottom: 8px;">Add Custom Link</div>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                <input type="text" id="ql-name" placeholder="Name" style="
                                    flex: 1; min-width: 80px;
                                    padding: 6px 8px;
                                    background: rgba(0,0,0,0.3);
                                    border: 1px solid rgba(255,255,255,0.2);
                                    border-radius: 4px;
                                    color: #fff;
                                    font-size: 0.8em;
                                ">
                                <input type="text" id="ql-url" placeholder="URL" style="
                                    flex: 2; min-width: 120px;
                                    padding: 6px 8px;
                                    background: rgba(0,0,0,0.3);
                                    border: 1px solid rgba(255,255,255,0.2);
                                    border-radius: 4px;
                                    color: #fff;
                                    font-size: 0.8em;
                                ">
                                <select id="ql-cat" style="
                                    padding: 6px 8px;
                                    background: rgba(0,0,0,0.3);
                                    border: 1px solid rgba(255,255,255,0.2);
                                    border-radius: 4px;
                                    color: #fff;
                                    font-size: 0.8em;
                                ">
                                    ${this.options.showCategories.map(c =>
                                        `<option value="${c}">${this.links[c]?.name || c}</option>`
                                    ).join('')}
                                </select>
                                <button onclick="QuickLinksWidget.addFromForm()" style="
                                    padding: 6px 12px;
                                    background: rgba(0,255,170,0.2);
                                    border: 1px solid rgba(0,255,170,0.4);
                                    border-radius: 4px;
                                    color: #00ffaa;
                                    cursor: pointer;
                                    font-size: 0.8em;
                                ">+ Add</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        /**
         * Render a category
         */
        renderCategory(category, catKey) {
            if (!category.links?.length) return '';

            const isCompact = this.options.compact;

            return `
                <div style="margin-bottom: 10px;">
                    <div style="
                        font-size: 0.75em;
                        color: #666;
                        margin-bottom: 6px;
                        padding-left: 4px;
                    ">${category.name}</div>
                    <div style="
                        display: ${isCompact ? 'flex' : 'grid'};
                        ${isCompact ? 'flex-wrap: wrap;' : 'grid-template-columns: repeat(2, 1fr);'}
                        gap: 6px;
                    ">
                        ${category.links.map((link, idx) => this.renderLink(link, catKey, idx)).join('')}
                    </div>
                </div>
            `;
        },

        /**
         * Render a single link
         */
        renderLink(link, catKey, idx) {
            const isExternal = link.url.startsWith('http');

            return `
                <a href="${link.url}" ${isExternal ? 'target="_blank"' : ''} style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 6px;
                    text-decoration: none;
                    color: #ddd;
                    font-size: 0.85em;
                    transition: all 0.2s;
                    position: relative;
                " onmouseover="this.style.background='rgba(0,150,255,0.2)'"
                   onmouseout="this.style.background='rgba(0,0,0,0.2)'">
                    <span style="font-size: 1.1em;">${link.icon || '🔗'}</span>
                    <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${link.name}
                    </span>
                    ${isExternal ? '<span style="font-size: 0.7em; color: #666;">↗</span>' : ''}
                    ${this.isEditing ? `
                        <span onclick="event.preventDefault(); QuickLinksWidget.removeLink('${catKey}', ${idx})" style="
                            color: #ff4444;
                            cursor: pointer;
                            font-size: 0.9em;
                        ">×</span>
                    ` : ''}
                </a>
            `;
        },

        /**
         * Toggle edit mode
         */
        toggleEdit() {
            this.isEditing = !this.isEditing;
            this.render();
        },

        /**
         * Add link from form
         */
        addFromForm() {
            const name = document.getElementById('ql-name')?.value?.trim();
            const url = document.getElementById('ql-url')?.value?.trim();
            const cat = document.getElementById('ql-cat')?.value;

            if (name && url) {
                this.addLink(cat, { name, url, icon: '📎' });
            }
        }
    };

    // Export
    window.QuickLinksWidget = QuickLinksWidget;

})();
