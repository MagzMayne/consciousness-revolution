// RootIB: RB-20260319142113-3AC16F89
/**
 * Interface Bridge - JavaScript Client
 * =====================================
 * Connects HTML dashboards to Python tools via WebSocket.
 *
 * Location: 100X_DEPLOYMENT/js/
 * Created: 2026-02-08
 * Connects: .consciousness/interface/websocket_bridge.py
 *
 * Usage:
 *   <script src="/js/interface-bridge.js"></script>
 *   <script>
 *     const bridge = new InterfaceBridge();
 *     bridge.connect();
 *     bridge.onMessage(data => console.log(data));
 *   </script>
 */

class InterfaceBridge {
    /**
     * Create a new Interface Bridge client.
     * @param {string} host - WebSocket host (default: localhost)
     * @param {number} port - WebSocket port (default: 8765)
     */
    constructor(host = 'localhost', port = 8765) {
        this.host = host;
        this.port = port;
        this.ws = null;
        this.handlers = new Map();
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;

        // Default handlers
        this._messageCallbacks = [];
        this._connectionCallbacks = [];
        this._errorCallbacks = [];
    }

    /**
     * Connect to the Interface Bridge server.
     * @returns {Promise} Resolves when connected
     */
    connect() {
        return new Promise((resolve, reject) => {
            const url = `ws://${this.host}:${this.port}`;
            console.log(`[InterfaceBridge] Connecting to ${url}...`);

            try {
                this.ws = new WebSocket(url);

                this.ws.onopen = () => {
                    console.log('[InterfaceBridge] Connected');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this._connectionCallbacks.forEach(cb => cb(true));
                    resolve(this);
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this._handleMessage(data);
                    } catch (e) {
                        console.error('[InterfaceBridge] Parse error:', e);
                    }
                };

                this.ws.onclose = () => {
                    console.log('[InterfaceBridge] Disconnected');
                    this.connected = false;
                    this._connectionCallbacks.forEach(cb => cb(false));
                    this._attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('[InterfaceBridge] Error:', error);
                    this._errorCallbacks.forEach(cb => cb(error));
                    reject(error);
                };

            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Disconnect from the server.
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }

    /**
     * Send an action request to the server.
     * @param {string} action - Action name
     * @param {object} payload - Action payload
     * @returns {Promise} Resolves with response
     */
    send(action, payload = {}) {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                reject(new Error('Not connected'));
                return;
            }

            const message = JSON.stringify({ action, payload });

            // Set up one-time response handler
            const handler = (data) => {
                resolve(data);
            };
            this._oneTimeHandler = handler;

            this.ws.send(message);
        });
    }

    /**
     * Register a callback for incoming messages.
     * @param {function} callback - Called with message data
     */
    onMessage(callback) {
        this._messageCallbacks.push(callback);
    }

    /**
     * Register a callback for connection state changes.
     * @param {function} callback - Called with boolean (connected)
     */
    onConnection(callback) {
        this._connectionCallbacks.push(callback);
    }

    /**
     * Register a callback for errors.
     * @param {function} callback - Called with error
     */
    onError(callback) {
        this._errorCallbacks.push(callback);
    }

    /**
     * Handle incoming message.
     * @private
     */
    _handleMessage(data) {
        // Call one-time handler if set
        if (this._oneTimeHandler) {
            this._oneTimeHandler(data);
            this._oneTimeHandler = null;
        }

        // Call all message callbacks
        this._messageCallbacks.forEach(cb => cb(data));

        // Render to DOM if element provided
        if (data.success !== undefined) {
            this._renderResponse(data);
        }
    }

    /**
     * Render a UnifiedResponse to DOM elements.
     * @param {object} response - UnifiedResponse data
     */
    _renderResponse(response) {
        // Find container elements
        const container = document.querySelector('[data-interface-container]');
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Build response HTML
        const card = document.createElement('div');
        card.className = `interface-card ${response.success ? 'success' : 'error'}`;

        // Title
        if (response.title) {
            const title = document.createElement('h3');
            title.className = 'interface-title';
            title.textContent = response.title;
            card.appendChild(title);
        }

        // Message
        const message = document.createElement('p');
        message.className = 'interface-message';
        message.textContent = (response.success ? '\u2713 ' : '\u2717 ') + response.message;
        card.appendChild(message);

        // Data
        if (response.data) {
            const dataEl = document.createElement('div');
            dataEl.className = 'interface-data';

            if (typeof response.data === 'object') {
                const table = document.createElement('table');
                for (const [key, value] of Object.entries(response.data)) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td class="key">${key}</td><td class="value">${value}</td>`;
                    table.appendChild(row);
                }
                dataEl.appendChild(table);
            } else {
                dataEl.textContent = String(response.data);
            }

            card.appendChild(dataEl);
        }

        // Components
        if (response.components && response.components.length > 0) {
            response.components.forEach(comp => {
                const compEl = this._renderComponent(comp);
                if (compEl) card.appendChild(compEl);
            });
        }

        container.appendChild(card);
    }

    /**
     * Render a UI component.
     * @param {object} component - Component definition
     * @returns {HTMLElement|null}
     */
    _renderComponent(component) {
        switch (component.component) {
            case 'status_bar':
                return this._renderStatusBar(component);
            case 'progress':
                return this._renderProgress(component);
            case 'table':
                return this._renderTable(component);
            case 'panel':
                return this._renderPanel(component);
            case 'alert':
                return this._renderAlert(component);
            default:
                console.warn('[InterfaceBridge] Unknown component:', component.component);
                return null;
        }
    }

    _renderStatusBar(data) {
        const bar = document.createElement('div');
        bar.className = 'interface-status-bar';
        data.items.forEach(item => {
            const span = document.createElement('span');
            span.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
            bar.appendChild(span);
        });
        return bar;
    }

    _renderProgress(data) {
        const container = document.createElement('div');
        container.className = 'interface-progress';
        container.innerHTML = `
            <label>${data.label || ''}</label>
            <div class="bar">
                <div class="fill" style="width: ${data.percentage}%"></div>
            </div>
            <span>${data.percentage.toFixed(1)}%</span>
        `;
        return container;
    }

    _renderTable(data) {
        const table = document.createElement('table');
        table.className = 'interface-table';

        if (data.title) {
            const caption = document.createElement('caption');
            caption.textContent = data.title;
            table.appendChild(caption);
        }

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        data.headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        return table;
    }

    _renderPanel(data) {
        const panel = document.createElement('div');
        panel.className = `interface-panel ${data.style || 'default'}`;
        panel.innerHTML = `
            ${data.title ? `<div class="panel-title">${data.title}</div>` : ''}
            <div class="panel-content">${data.content}</div>
        `;
        return panel;
    }

    _renderAlert(data) {
        const alert = document.createElement('div');
        alert.className = `interface-alert ${data.level}`;
        alert.innerHTML = `<span class="icon">${data.icon}</span> ${data.message}`;
        return alert;
    }

    /**
     * Attempt to reconnect after disconnect.
     * @private
     */
    _attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[InterfaceBridge] Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`[InterfaceBridge] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect().catch(() => {});
        }, this.reconnectDelay);
    }
}

// CSS styles for interface components (can be overridden)
const interfaceStyles = `
<style>
.interface-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
    font-family: system-ui, -apple-system, sans-serif;
}
.interface-card.success { border-color: #22c55e; background: #f0fdf4; }
.interface-card.error { border-color: #ef4444; background: #fef2f2; }

.interface-title {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.interface-message {
    margin: 0 0 12px 0;
    font-size: 1rem;
}

.interface-data table {
    width: 100%;
    border-collapse: collapse;
}
.interface-data td { padding: 4px 8px; }
.interface-data td.key { font-weight: 500; color: #666; }

.interface-status-bar {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 4px;
}

.interface-progress {
    display: flex;
    align-items: center;
    gap: 8px;
}
.interface-progress .bar {
    flex: 1;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}
.interface-progress .fill {
    height: 100%;
    background: #22c55e;
    transition: width 0.3s;
}

.interface-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
}
.interface-table th, .interface-table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}
.interface-table th { background: #f9fafb; font-weight: 600; }

.interface-panel {
    border-radius: 8px;
    padding: 12px;
    margin: 8px 0;
}
.interface-panel.default { background: #f3f4f6; border: 1px solid #d1d5db; }
.interface-panel.success { background: #dcfce7; border: 1px solid #22c55e; }
.interface-panel.error { background: #fee2e2; border: 1px solid #ef4444; }
.interface-panel.warning { background: #fef3c7; border: 1px solid #f59e0b; }
.interface-panel.info { background: #dbeafe; border: 1px solid #3b82f6; }
.interface-panel .panel-title { font-weight: 600; margin-bottom: 8px; }

.interface-alert {
    padding: 12px;
    border-radius: 4px;
    margin: 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}
.interface-alert.info { background: #dbeafe; color: #1e40af; }
.interface-alert.success { background: #dcfce7; color: #166534; }
.interface-alert.warning { background: #fef3c7; color: #92400e; }
.interface-alert.error { background: #fee2e2; color: #991b1b; }
.interface-alert .icon { font-size: 1.25rem; }
</style>
`;

// Auto-inject styles if in browser
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', interfaceStyles);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterfaceBridge;
}
