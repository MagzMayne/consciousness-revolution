/**
 * Bounty Widget
 * 
 * Embeddable bounty system widget for dashboards
 * Displays active bounties and allows developers to view/claim them
 * 
 * Usage:
 * <div id="bounty-widget"></div>
 * <script src="bounty-widget.js"></script>
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        dataUrl: '/bounties.json',
        hubUrl: '/bounty-hunter-hub.html',
        refreshInterval: 60000, // 1 minute
        maxDisplay: 3 // Max bounties to show in widget
    };

    // Styles
    const styles = `
        <style>
            .bounty-widget {
                background: linear-gradient(135deg, #1a1a2e 0%, #141420 100%);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 12px;
                padding: 1.5rem;
                margin: 1rem 0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .bounty-widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid rgba(0, 212, 255, 0.2);
            }

            .bounty-widget-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #ffd700;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .bounty-widget-count {
                background: rgba(255, 215, 0, 0.2);
                color: #ffd700;
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: 600;
            }

            .bounty-widget-items {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .bounty-widget-item {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 212, 255, 0.2);
                border-radius: 8px;
                padding: 0.75rem;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .bounty-widget-item:hover {
                border-color: #00d4ff;
                transform: translateX(4px);
                box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2);
            }

            .bounty-widget-item-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 0.5rem;
            }

            .bounty-widget-item-title {
                font-size: 0.95rem;
                font-weight: 600;
                color: #00d4ff;
                margin-bottom: 0.25rem;
            }

            .bounty-widget-item-reward {
                background: linear-gradient(135deg, #ffd700, #ff9900);
                color: #0a0a0f;
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-weight: bold;
                font-size: 0.9rem;
                white-space: nowrap;
            }

            .bounty-widget-item-desc {
                color: #b8b8b8;
                font-size: 0.85rem;
                line-height: 1.4;
                margin-bottom: 0.5rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .bounty-widget-item-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.75rem;
                color: #888;
            }

            .bounty-widget-footer {
                text-align: center;
            }

            .bounty-widget-link {
                display: inline-block;
                background: linear-gradient(135deg, #00d4ff, #7b2cbf);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .bounty-widget-link:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
            }

            .bounty-widget-loading {
                text-align: center;
                padding: 2rem;
                color: #888;
            }

            .bounty-widget-error {
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid #ff4444;
                color: #ff4444;
                padding: 1rem;
                border-radius: 8px;
                text-align: center;
            }

            .bounty-widget-empty {
                text-align: center;
                padding: 1.5rem;
                color: #888;
            }

            @media (max-width: 768px) {
                .bounty-widget {
                    padding: 1rem;
                }

                .bounty-widget-item-header {
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .bounty-widget-item-reward {
                    align-self: flex-start;
                }
            }
        </style>
    `;

    class BountyWidget {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`Bounty Widget: Container #${containerId} not found`);
                return;
            }

            this.bounties = [];
            this.init();
        }

        async init() {
            // Add styles
            if (!document.getElementById('bounty-widget-styles')) {
                const styleEl = document.createElement('div');
                styleEl.id = 'bounty-widget-styles';
                styleEl.innerHTML = styles;
                document.head.appendChild(styleEl);
            }

            // Render loading state
            this.renderLoading();

            // Load bounties
            await this.loadBounties();

            // Render widget
            this.render();

            // Set up auto-refresh
            setInterval(() => this.loadBounties(), CONFIG.refreshInterval);
        }

        async loadBounties() {
            try {
                const response = await fetch(CONFIG.dataUrl);
                if (!response.ok) throw new Error('Failed to load bounties');
                
                const data = await response.json();
                this.bounties = data.bounties || [];
                
                // Re-render if already initialized
                if (this.container.querySelector('.bounty-widget')) {
                    this.render();
                }
            } catch (error) {
                console.error('Bounty Widget: Error loading bounties', error);
                this.renderError('Unable to load bounties. Please try again later.');
            }
        }

        renderLoading() {
            this.container.innerHTML = `
                <div class="bounty-widget">
                    <div class="bounty-widget-loading">
                        <div>Loading bounties...</div>
                    </div>
                </div>
            `;
        }

        renderError(message) {
            this.container.innerHTML = `
                <div class="bounty-widget">
                    <div class="bounty-widget-error">
                        ${message}
                    </div>
                </div>
            `;
        }

        render() {
            const openBounties = this.bounties.filter(b => b.status === 'open');
            const displayBounties = openBounties.slice(0, CONFIG.maxDisplay);
            const totalRewards = openBounties.reduce((sum, b) => sum + b.reward, 0);

            if (openBounties.length === 0) {
                this.container.innerHTML = `
                    <div class="bounty-widget">
                        <div class="bounty-widget-header">
                            <div class="bounty-widget-title">
                                💰 Developer Bounties
                            </div>
                        </div>
                        <div class="bounty-widget-empty">
                            No active bounties at the moment. Check back soon!
                        </div>
                    </div>
                `;
                return;
            }

            this.container.innerHTML = `
                <div class="bounty-widget">
                    <div class="bounty-widget-header">
                        <div class="bounty-widget-title">
                            💰 Developer Bounties
                        </div>
                        <div class="bounty-widget-count">
                            ${openBounties.length} Active · $${totalRewards}
                        </div>
                    </div>
                    <div class="bounty-widget-items">
                        ${displayBounties.map(bounty => this.renderBountyItem(bounty)).join('')}
                    </div>
                    <div class="bounty-widget-footer">
                        <a href="${CONFIG.hubUrl}" class="bounty-widget-link">
                            View All Bounties →
                        </a>
                    </div>
                </div>
            `;

            // Add click handlers
            this.container.querySelectorAll('.bounty-widget-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    window.location.href = `${CONFIG.hubUrl}?bounty=${displayBounties[index].id}`;
                });
            });
        }

        renderBountyItem(bounty) {
            return `
                <div class="bounty-widget-item">
                    <div class="bounty-widget-item-header">
                        <div style="flex: 1;">
                            <div class="bounty-widget-item-title">${bounty.title}</div>
                        </div>
                        <div class="bounty-widget-item-reward">$${bounty.reward}</div>
                    </div>
                    <div class="bounty-widget-item-desc">${bounty.description}</div>
                    <div class="bounty-widget-item-meta">
                        <span>⏱️ ${bounty.estimatedTime}</span>
                        <span>📊 ${bounty.difficulty}</span>
                        <span>📁 ${bounty.category}</span>
                    </div>
                </div>
            `;
        }
    }

    // Auto-initialize if bounty-widget div exists
    document.addEventListener('DOMContentLoaded', () => {
        const widgetContainer = document.getElementById('bounty-widget');
        if (widgetContainer) {
            new BountyWidget('bounty-widget');
        }
    });

    // Expose to global scope for manual initialization
    window.BountyWidget = BountyWidget;
})();
