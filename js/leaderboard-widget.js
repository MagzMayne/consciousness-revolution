// RootIB: RB-20260319142113-7E376790
/**
 * LEADERBOARD WIDGET - Contributor Rankings
 *
 * Displays real-time contributor leaderboard from GitHub data
 * Shows XP, OKK rewards, and contribution counts
 *
 * Usage: Include script and call LeaderboardWidget.init('containerId')
 */

(function() {
    'use strict';

    const API_URL = '/.netlify/functions/project-registry?leaderboard=true';

    const LeaderboardWidget = {
        container: null,
        data: null,
        refreshInterval: null,

        /**
         * Initialize the leaderboard widget
         */
        async init(containerId, options = {}) {
            this.container = document.getElementById(containerId);
            this.options = {
                showActivity: options.showActivity !== false,
                refreshEvery: options.refreshEvery || 300000, // 5 minutes
                maxEntries: options.maxEntries || 10
            };

            if (!this.container) {
                console.warn('LeaderboardWidget: Container not found:', containerId);
                return;
            }

            // Show loading state
            this.renderLoading();

            // Fetch and render
            await this.refresh();

            // Auto-refresh
            if (this.options.refreshEvery > 0) {
                this.refreshInterval = setInterval(() => this.refresh(), this.options.refreshEvery);
            }
        },

        /**
         * Fetch leaderboard data
         */
        async refresh() {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Failed to fetch leaderboard');

                this.data = await response.json();
                this.render();
            } catch (error) {
                console.error('Leaderboard error:', error);
                this.renderError(error.message);
            }
        },

        /**
         * Render loading state
         */
        renderLoading() {
            this.container.innerHTML = `
                <div class="leaderboard-widget" style="
                    background: linear-gradient(135deg, rgba(0,255,170,0.05), rgba(0,100,200,0.05));
                    border: 1px solid rgba(0,255,170,0.3);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    color: #888;
                ">
                    <div style="animation: pulse 1.5s infinite;">Loading leaderboard...</div>
                </div>
            `;
        },

        /**
         * Render error state
         */
        renderError(message) {
            this.container.innerHTML = `
                <div class="leaderboard-widget" style="
                    background: rgba(255,0,0,0.1);
                    border: 1px solid rgba(255,0,0,0.3);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    color: #ff6666;
                ">
                    <p>Failed to load leaderboard</p>
                    <button onclick="LeaderboardWidget.refresh()" style="
                        margin-top: 10px;
                        padding: 8px 16px;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 6px;
                        color: #fff;
                        cursor: pointer;
                    ">Retry</button>
                </div>
            `;
        },

        /**
         * Render the leaderboard
         */
        render() {
            if (!this.data || !this.data.leaderboard) {
                this.renderError('No data');
                return;
            }

            const { leaderboard, repoStats, recentActivity, lastUpdated } = this.data;
            const entries = leaderboard.slice(0, this.options.maxEntries);

            this.container.innerHTML = `
                <div class="leaderboard-widget" style="
                    background: linear-gradient(135deg, rgba(0,255,170,0.05), rgba(0,100,200,0.05));
                    border: 1px solid rgba(0,255,170,0.3);
                    border-radius: 12px;
                    overflow: hidden;
                ">
                    <!-- Header -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px 18px;
                        background: rgba(0,255,170,0.1);
                        border-bottom: 1px solid rgba(0,255,170,0.2);
                    ">
                        <h3 style="color: #00ffaa; margin: 0; font-size: 1.1em;">
                            🏆 Contributor Leaderboard
                        </h3>
                        <div style="display: flex; gap: 12px; font-size: 0.75em; color: #888;">
                            <span>⭐ ${repoStats?.stars || 0}</span>
                            <span>🔀 ${repoStats?.forks || 0}</span>
                            <span>🐛 ${repoStats?.openIssues || 0}</span>
                        </div>
                    </div>

                    <!-- Leaderboard Entries -->
                    <div style="padding: 10px;">
                        ${entries.map(entry => this.renderEntry(entry)).join('')}
                    </div>

                    ${this.options.showActivity && recentActivity?.length ? `
                        <!-- Recent Activity -->
                        <div style="
                            padding: 12px 15px;
                            background: rgba(0,0,0,0.2);
                            border-top: 1px solid rgba(255,255,255,0.1);
                        ">
                            <div style="font-size: 0.8em; color: #888; margin-bottom: 8px;">Recent Activity</div>
                            ${recentActivity.slice(0, 3).map(commit => `
                                <div style="
                                    font-size: 0.75em;
                                    color: #666;
                                    padding: 4px 0;
                                    display: flex;
                                    gap: 8px;
                                ">
                                    <span style="color: #00ffaa; font-family: monospace;">${commit.sha}</span>
                                    <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${commit.message}</span>
                                    <span style="color: #555;">${commit.author}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Footer -->
                    <div style="
                        padding: 10px 15px;
                        background: rgba(0,0,0,0.3);
                        text-align: center;
                        font-size: 0.7em;
                        color: #555;
                    ">
                        Updated ${this.formatTime(lastUpdated)} •
                        <a href="/PROJECT_REGISTRY.html" style="color: #00ffaa; text-decoration: none;">View All Projects</a>
                    </div>
                </div>
            `;
        },

        /**
         * Render a single leaderboard entry
         */
        renderEntry(entry) {
            const rankColors = {
                1: '#ffd700',
                2: '#c0c0c0',
                3: '#cd7f32'
            };
            const rankColor = rankColors[entry.rank] || '#666';
            const rankEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;

            return `
                <div class="leaderboard-entry" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    margin-bottom: 6px;
                    border-left: 3px solid ${rankColor};
                ">
                    <!-- Rank -->
                    <div style="
                        width: 32px;
                        text-align: center;
                        font-weight: bold;
                        color: ${rankColor};
                        font-size: ${entry.rank <= 3 ? '1.2em' : '0.9em'};
                    ">${rankEmoji}</div>

                    <!-- Avatar -->
                    <div style="
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.3em;
                        overflow: hidden;
                    ">
                        ${entry.githubAvatar
                            ? `<img src="${entry.githubAvatar}" style="width: 100%; height: 100%; object-fit: cover;">`
                            : entry.avatar
                        }
                    </div>

                    <!-- Name & Stats -->
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #fff;">${entry.name}</div>
                        <div style="font-size: 0.75em; color: #888;">
                            ${entry.contributions} commits • Level ${entry.level}
                        </div>
                    </div>

                    <!-- Rewards -->
                    <div style="text-align: right;">
                        <div style="color: #00ffaa; font-weight: 600; font-size: 0.9em;">
                            ${this.formatNumber(entry.totalXP)} XP
                        </div>
                        <div style="color: #ffd700; font-size: 0.75em;">
                            ${this.formatNumber(entry.totalOKK)} OKK
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Format large numbers
         */
        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        },

        /**
         * Format timestamp
         */
        formatTime(isoString) {
            if (!isoString) return 'recently';
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            return date.toLocaleDateString();
        },

        /**
         * Cleanup
         */
        destroy() {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
        }
    };

    // Export
    window.LeaderboardWidget = LeaderboardWidget;

})();
