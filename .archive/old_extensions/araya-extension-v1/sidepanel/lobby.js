// Araya Lobby - 7 Domains Controller
// IndexedDB for local storage + Native Messaging to OVERKORE Cyclotron Brain

const DB_NAME = 'ArayaLobby';
const DB_VERSION = 1;
let db = null;
let nativeConnected = false;

// Domain routing rules
const DOMAIN_RULES = {
    '1_COMMAND': ['calendar', 'notion', 'trello', 'asana', 'monday', 'todoist'],
    '2_BUILD': ['github', 'gitlab', 'figma', 'codepen', 'replit', 'vercel', 'netlify'],
    '3_CONNECT': ['linkedin', 'twitter', 'facebook', 'discord', 'slack', 'mail', 'gmail'],
    '4_PROTECT': ['court', 'gov', 'legal', 'health', 'insurance', 'bank'],
    '5_GROW': ['stripe', 'paypal', 'shopify', 'analytics', 'finance', 'invest'],
    '6_LEARN': ['wikipedia', 'youtube', 'medium', 'substack', 'coursera', 'udemy'],
    '7_TRANSCEND': ['meditation', 'headspace', 'calm', 'journal', 'wellness']
};

// =========================================================
// Native Messaging Bridge Functions
// =========================================================

/**
 * Send data to native OVERKORE host via background service worker.
 * This bridges browser extension → local Cyclotron brain (163K+ atoms)
 */
function sendToNativeHost(domain, data) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            type: 'SAVE_TO_DOMAIN',
            domain: domain,
            data: data
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('Native messaging error:', chrome.runtime.lastError.message);
                resolve({ success: false, savedLocally: false });
                return;
            }
            if (response && response.savedLocally) {
                nativeConnected = true;
                updateConnectionIndicator();
            }
            resolve(response || { success: false, savedLocally: false });
        });
    });
}

/**
 * Query the local Cyclotron brain for context/patterns.
 */
function queryBrain(query, limit = 10) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            type: 'QUERY_BRAIN',
            query: query,
            limit: limit
        }, (response) => {
            if (chrome.runtime.lastError) {
                resolve({ success: false, results: [] });
                return;
            }
            resolve(response || { success: false, results: [] });
        });
    });
}

/**
 * Check if native host is connected.
 */
function checkNativeStatus() {
    chrome.runtime.sendMessage({ type: 'NATIVE_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
            nativeConnected = false;
        } else {
            nativeConnected = response?.connected || false;
        }
        updateConnectionIndicator();
        console.log('Native host status:', nativeConnected ? 'CONNECTED (163K atoms)' : 'DISCONNECTED (cloud only)');
    });
}

/**
 * Show toast notification for user feedback.
 */
function showStatus(message, type = 'info') {
    // Remove existing toast if present
    const existing = document.querySelector('.araya-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `araya-toast araya-toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Update the connection indicator dot (green=connected, red=cloud only).
 */
function updateConnectionIndicator() {
    let indicator = document.getElementById('connection-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'connection-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            transition: background 0.3s;
            cursor: pointer;
        `;
        indicator.onclick = () => {
            showStatus(nativeConnected 
                ? 'Connected to local Cyclotron brain (163K+ atoms)' 
                : 'Cloud mode only - native host not connected', 
                nativeConnected ? 'success' : 'info');
        };
        document.body.appendChild(indicator);
    }
    indicator.style.background = nativeConnected ? '#10b981' : '#ef4444';
    indicator.title = nativeConnected ? 'Connected to local brain (163K atoms)' : 'Cloud mode only';
}

// =========================================================
// IndexedDB Functions (Browser-Local Storage)
// =========================================================

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create stores for each domain
            ['1_COMMAND', '2_BUILD', '3_CONNECT', '4_PROTECT', '5_GROW', '6_LEARN', '7_TRANSCEND'].forEach(domain => {
                if (!db.objectStoreNames.contains(domain)) {
                    const store = db.createObjectStore(domain, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('created', 'created');
                    store.createIndex('type', 'type');
                }
            });
        };
    });
}

// Save item to domain (IndexedDB)
async function saveItem(domain, item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(domain, 'readwrite');
        const store = transaction.objectStore(domain);

        const data = {
            ...item,
            created: new Date().toISOString(),
            id: Date.now()
        };

        const request = store.add(data);
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
    });
}

// Get items from domain
async function getItems(domain, limit = 100) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(domain, 'readonly');
        const store = transaction.objectStore(domain);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result.slice(-limit));
        request.onerror = () => reject(request.error);
    });
}

// Count items in domain
async function countItems(domain) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(domain, 'readonly');
        const store = transaction.objectStore(domain);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Update all counts
async function updateCounts() {
    const domains = ['1_COMMAND', '2_BUILD', '3_CONNECT', '4_PROTECT', '5_GROW', '6_LEARN', '7_TRANSCEND'];
    let total = 0;

    for (let i = 0; i < domains.length; i++) {
        const count = await countItems(domains[i]);
        const countEl = document.getElementById(`count-${i + 1}`);
        if (countEl) countEl.textContent = `${count} items`;
        total += count;
    }

    const totalEl = document.getElementById('total-items');
    if (totalEl) totalEl.textContent = `${total} total items`;
}

// =========================================================
// Domain Functions
// =========================================================

// Detect domain from URL
function detectDomain(url) {
    const urlLower = url.toLowerCase();

    for (const [domain, keywords] of Object.entries(DOMAIN_RULES)) {
        if (keywords.some(kw => urlLower.includes(kw))) {
            return domain;
        }
    }

    return '6_LEARN'; // Default to Learn
}

// Open domain view
function openDomain(domain) {
    // Navigate to domain detail page
    window.location.href = `domains/${domain.toLowerCase()}.html`;
}

// =========================================================
// Capture Functions (MODIFIED - Saves to BOTH IndexedDB AND Native Host)
// =========================================================

/**
 * Capture item from input - saves to BOTH:
 * 1. IndexedDB (browser local - always works)
 * 2. Native Host (local Cyclotron brain - 163K+ atoms)
 */
async function captureItem() {
    const input = document.getElementById('capture-input');
    const select = document.getElementById('domain-select');

    const text = input.value.trim();
    if (!text) return;

    const domain = select.value;
    
    const itemData = {
        type: 'note',
        content: text,
        source: 'manual',
        title: text.substring(0, 50),
        url: window.location.href
    };

    // 1. Save to IndexedDB (browser local - always works)
    await saveItem(domain, itemData);
    
    // 2. ALSO send to native host (local Cyclotron brain - 163K atoms)
    const nativeResult = await sendToNativeHost(domain, itemData);

    input.value = '';
    await updateCounts();

    // Visual feedback on domain card
    const card = document.querySelector(`[data-domain="${domain}"]`);
    if (card) {
        card.style.transform = 'scale(1.1)';
        setTimeout(() => card.style.transform = '', 300);
    }
    
    // Show status notification
    if (nativeResult.savedLocally) {
        showStatus(`Saved to ${domain} + local brain`, 'success');
    } else {
        showStatus(`Saved to ${domain} (cloud only)`, 'info');
    }
}

// =========================================================
// Chat & Navigation (MODIFIED - Checks Native Brain First)
// =========================================================

/**
 * Open Araya chat - now queries local brain for context first if connected.
 */
function openChat() {
    if (nativeConnected) {
        // Query brain for recent context before opening chat
        queryBrain('recent context', 5).then(result => {
            console.log('Brain context for chat:', result);
        });
    }
    chrome.tabs.create({ url: 'https://conciousnessrevolution.io/araya-chat.html' });
}

// =========================================================
// Message Listeners
// =========================================================

// Listen for messages from content script and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PAGE_DATA') {
        const suggestedDomain = detectDomain(message.url);
        const suggestion = document.getElementById('suggestion');
        const suggestionText = document.getElementById('suggestion-text');

        if (suggestionText) suggestionText.textContent = `Save this page to ${suggestedDomain}?`;
        if (suggestion) suggestion.classList.add('active');

        // Auto-select domain in dropdown
        const domainSelect = document.getElementById('domain-select');
        if (domainSelect) domainSelect.value = suggestedDomain;
    }

    if (message.type === 'SAVE_TO_DOMAIN') {
        saveItem(message.domain, message.data).then(() => {
            // Also send to native host
            sendToNativeHost(message.domain, message.data);
            updateCounts();
            sendResponse({ success: true });
        });
        return true;
    }
    
    // Handle native host responses (forwarded from background)
    if (message.type === 'NATIVE_RESPONSE') {
        console.log('Native response received:', message.data);
        if (message.data?.ok) {
            nativeConnected = true;
            updateConnectionIndicator();
        }
    }
    
    // Handle workflow detection from background
    if (message.type === 'WORKFLOW_DETECTED') {
        console.log('Workflow detected:', message.workflow, '→', message.suggestedDomain);
        const domainSelect = document.getElementById('domain-select');
        if (domainSelect) domainSelect.value = message.suggestedDomain;
        showStatus(`Detected ${message.workflow} workflow`, 'info');
    }
});

// =========================================================
// Initialize on Load
// =========================================================

document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await updateCounts();
    
    // Check native host connection status
    checkNativeStatus();

    // Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            const suggestedDomain = detectDomain(tabs[0].url);
            const domainSelect = document.getElementById('domain-select');
            if (domainSelect) domainSelect.value = suggestedDomain;
        }
    });
    
    // Periodic native status check (every 30 seconds)
    setInterval(checkNativeStatus, 30000);
});
