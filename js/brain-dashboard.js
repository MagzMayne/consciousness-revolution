// RootIB: RB-20260319142113-B9F7ECE1
/**
 * brain-dashboard.js - Brain Integration for Commander Dashboards
 * Fetches real brain stats and enables brain queries
 */

const BrainDashboard = {
    apiBase: '/.netlify/functions/brain-api',

    // Initialize brain integration
    async init() {
        console.log('[BRAIN] Initializing dashboard integration...');
        await this.fetchStatus();
        this.setupBrainQuery();
        // Refresh every 60 seconds
        setInterval(() => this.fetchStatus(), 60000);
    },

    // Fetch brain status
    async fetchStatus() {
        try {
            const response = await fetch(`${this.apiBase}?action=status`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.updateStatusDisplay(data);
                    return data;
                }
            }
        } catch (e) {
            console.log('[BRAIN] Status fetch failed:', e.message);
        }
        // Fallback display
        this.updateStatusDisplay({ atomCount: '166K+', status: 'offline' });
        return null;
    },

    // Update brain status in dashboard
    updateStatusDisplay(data) {
        const brainStatus = document.getElementById('brainStatus');
        if (brainStatus) {
            const count = data.atomCount || data.atom_count || '166K+';
            const formattedCount = typeof count === 'number'
                ? (count > 1000 ? `${(count/1000).toFixed(0)}K` : count)
                : count;
            brainStatus.textContent = `${formattedCount} atoms ready`;
        }

        // Update service light if exists
        const brainLight = document.querySelector('#service-brain .light');
        if (brainLight) {
            brainLight.classList.remove('checking', 'online', 'offline');
            brainLight.classList.add(data.status === 'healthy' ? 'online' : 'offline');
        }
    },

    // Setup brain query UI
    setupBrainQuery() {
        const brainWidget = document.getElementById('brainStatus');
        if (brainWidget) {
            brainWidget.style.cursor = 'pointer';
            brainWidget.title = 'Click to query brain';
            brainWidget.addEventListener('click', () => this.showQueryModal());
        }
    },

    // Show brain query modal
    showQueryModal() {
        // Remove existing modal
        const existing = document.getElementById('brainQueryModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'brainQueryModal';
        modal.innerHTML = `
            <div class="brain-modal-overlay" onclick="BrainDashboard.hideModal()"></div>
            <div class="brain-modal-content">
                <div class="brain-modal-header">
                    <h3>Brain Query</h3>
                    <button onclick="BrainDashboard.hideModal()" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer">&times;</button>
                </div>
                <input type="text" id="brainQueryInput" placeholder="Search 166K+ atoms..."
                    onkeypress="if(event.key==='Enter')BrainDashboard.runQuery()">
                <button onclick="BrainDashboard.runQuery()" class="brain-query-btn">Search</button>
                <div id="brainQueryResults"></div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .brain-modal-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8);
                z-index: 9998;
            }
            .brain-modal-content {
                position: fixed;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 1px solid rgba(100,200,255,0.3);
                border-radius: 15px;
                padding: 20px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 9999;
            }
            .brain-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .brain-modal-header h3 {
                margin: 0;
                color: #64c8ff;
            }
            #brainQueryInput {
                width: 100%;
                padding: 12px;
                border: 1px solid rgba(100,200,255,0.3);
                border-radius: 8px;
                background: rgba(0,0,0,0.3);
                color: #fff;
                font-size: 1rem;
                margin-bottom: 10px;
            }
            .brain-query-btn {
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                border: none;
                border-radius: 8px;
                color: #fff;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 15px;
            }
            .brain-query-btn:hover {
                transform: scale(1.02);
            }
            #brainQueryResults {
                max-height: 400px;
                overflow-y: auto;
            }
            .brain-result {
                background: rgba(255,255,255,0.05);
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 3px solid #64c8ff;
            }
            .brain-result-type {
                font-size: 0.7rem;
                color: #64c8ff;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            .brain-result-content {
                color: #e4e4e4;
                font-size: 0.9rem;
                line-height: 1.4;
            }
        `;
        modal.appendChild(style);
        document.body.appendChild(modal);

        document.getElementById('brainQueryInput').focus();
    },

    hideModal() {
        const modal = document.getElementById('brainQueryModal');
        if (modal) modal.remove();
    },

    // Run brain query
    async runQuery() {
        const input = document.getElementById('brainQueryInput');
        const results = document.getElementById('brainQueryResults');
        const query = input.value.trim();

        if (!query) return;

        results.innerHTML = '<p style="color:#888">Searching brain...</p>';

        try {
            const response = await fetch(`${this.apiBase}?action=query&q=${encodeURIComponent(query)}&limit=10`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.results && data.results.length > 0) {
                    results.innerHTML = data.results.map(r => `
                        <div class="brain-result">
                            <div class="brain-result-type">${r.type || 'knowledge'}</div>
                            <div class="brain-result-content">${this.highlightQuery(r.content, query)}</div>
                        </div>
                    `).join('');
                } else {
                    results.innerHTML = '<p style="color:#888">No results found. Try different keywords.</p>';
                }
            }
        } catch (e) {
            results.innerHTML = `<p style="color:#ff6b6b">Query failed: ${e.message}</p>`;
        }
    },

    // Highlight query terms in results
    highlightQuery(text, query) {
        if (!text) return '';
        const words = query.toLowerCase().split(/\s+/);
        let result = text.substring(0, 500);
        if (text.length > 500) result += '...';

        for (const word of words) {
            if (word.length > 2) {
                const regex = new RegExp(`(${word})`, 'gi');
                result = result.replace(regex, '<span style="background:#64c8ff40;padding:0 2px;border-radius:2px">$1</span>');
            }
        }
        return result;
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    BrainDashboard.init();
});
