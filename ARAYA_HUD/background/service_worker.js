// ARAYA HUD - Unified Background Service Worker
// Merges: ARAYA (7 Domains + Native Messaging) + ARIA (Code Capture)
// Version 2.0.0

const ARAYA_VERSION = '2.0.0';

// =========================================================
// Storage Configuration
// =========================================================

const STORAGE_KEYS = {
    CAPTURED_BLOCKS: 'araya_captured_blocks',
    DOMAIN_DATA: 'araya_domain_data',
    SETTINGS: 'araya_settings',
    STATS: 'araya_stats'
};

const DEFAULT_SETTINGS = {
    autoCapture: true,
    showNotifications: true,
    theme: 'chi',
    exportFormat: 'zip',
    nativeMessagingEnabled: true
};

// =========================================================
// Native Messaging - OVERKORE Bridge
// =========================================================

const NATIVE_HOST = 'com.overkore.native_host';
let nativePort = null;
let nativeConnected = false;

function connectNative() {
    try {
        nativePort = chrome.runtime.connectNative(NATIVE_HOST);

        nativePort.onMessage.addListener((response) => {
            console.log('[ARAYA] Native response:', response);
            chrome.runtime.sendMessage({
                type: 'NATIVE_RESPONSE',
                data: response
            });
        });

        nativePort.onDisconnect.addListener(() => {
            console.log('[ARAYA] Native host disconnected:', chrome.runtime.lastError?.message);
            nativeConnected = false;
            nativePort = null;
            setTimeout(connectNative, 5000);
        });

        nativeConnected = true;
        console.log('[ARAYA] Connected to OVERKORE native host');
        sendNative({ action: 'ping' });

    } catch (err) {
        console.log('[ARAYA] Native connection failed:', err.message);
        nativeConnected = false;
    }
}

function sendNative(message) {
    if (nativePort && nativeConnected) {
        nativePort.postMessage(message);
        return true;
    }
    return false;
}

function saveToLocal(domain, data) {
    const filename = `${data.type}_${Date.now()}.md`;
    const content = data.content || `# ${data.title}\n\nURL: ${data.url}\nCaptured: ${new Date().toISOString()}`;

    return sendNative({
        action: 'save',
        data: { domain, filename, content, url: data.url, classification: data.type }
    });
}

function queryBrain(query, limit = 10) {
    return sendNative({ action: 'query', data: { query, limit } });
}

// Initialize native connection
connectNative();

// =========================================================
// Side Panel Configuration
// =========================================================

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// =========================================================
// Context Menu Setup
// =========================================================

chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('[ARAYA] Extension installed/updated:', details.reason);

    // Initialize storage
    const existing = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS, STORAGE_KEYS.STATS]);

    if (!existing[STORAGE_KEYS.SETTINGS]) {
        await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
    }

    if (!existing[STORAGE_KEYS.STATS]) {
        await chrome.storage.local.set({
            [STORAGE_KEYS.STATS]: {
                totalCaptured: 0,
                byPlatform: {},
                byLanguage: {},
                byDomain: {},
                lastCapture: null
            }
        });
    }

    // Create context menus for 7 domains
    chrome.contextMenus.create({
        id: 'save-to-araya',
        title: 'Save to ARAYA',
        contexts: ['selection', 'page', 'link', 'image']
    });

    const domains = [
        { id: '1_COMMAND', label: '1. Command (Control)' },
        { id: '2_BUILD', label: '2. Build (Projects)' },
        { id: '3_CONNECT', label: '3. Connect (People)' },
        { id: '4_PROTECT', label: '4. Protect (Legal/Health)' },
        { id: '5_GROW', label: '5. Grow (Business)' },
        { id: '6_LEARN', label: '6. Learn (Knowledge)' },
        { id: '7_TRANSCEND', label: '7. Transcend (Consciousness)' }
    ];

    domains.forEach(d => {
        chrome.contextMenus.create({
            id: `save-to-${d.id}`,
            parentId: 'save-to-araya',
            title: d.label,
            contexts: ['selection', 'page', 'link', 'image']
        });
    });

    // Add separator and code capture option
    chrome.contextMenus.create({
        id: 'capture-code',
        title: 'Capture All Code Blocks',
        contexts: ['page']
    });

    console.log('[ARAYA] Context menus created');
});

// =========================================================
// Context Menu Handler
// =========================================================

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Handle code capture
    if (info.menuItemId === 'capture-code') {
        chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_ALL_CODE' });
        return;
    }

    // Handle domain save
    const domainMatch = info.menuItemId.match(/save-to-(\d_\w+)/);
    if (!domainMatch) return;

    const domain = domainMatch[1];
    let data = {
        type: 'capture',
        url: tab.url,
        title: tab.title,
        source: 'context_menu'
    };

    if (info.selectionText) {
        data.type = 'text';
        data.content = info.selectionText;
    } else if (info.linkUrl) {
        data.type = 'link';
        data.content = info.linkUrl;
    } else if (info.srcUrl) {
        data.type = 'image';
        data.content = info.srcUrl;
    }

    // Save via native or storage
    const savedLocally = saveToLocal(domain, data);

    // Also save to chrome.storage for sidebar access
    saveToDomainStorage(domain, data);

    chrome.runtime.sendMessage({
        type: 'SAVE_TO_DOMAIN',
        domain: domain,
        data: data
    });

    chrome.action.setBadgeText({ text: '+1', tabId: tab.id });
    setTimeout(() => chrome.action.setBadgeText({ text: '', tabId: tab.id }), 2000);
});

// =========================================================
// Workflow Detection
// =========================================================

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;

    const url = tab.url?.toLowerCase() || '';

    const workflows = [
        { patterns: ['bank', 'chase', 'paypal', 'venmo'], workflow: 'finance', domain: '5_GROW' },
        { patterns: ['court', 'legal', '.gov', 'law'], workflow: 'legal', domain: '4_PROTECT' },
        { patterns: ['youtube', 'wikipedia', 'coursera', 'udemy'], workflow: 'learning', domain: '6_LEARN' },
        { patterns: ['github', 'gitlab', 'stackoverflow'], workflow: 'build', domain: '2_BUILD' },
        { patterns: ['linkedin', 'twitter', 'discord'], workflow: 'connect', domain: '3_CONNECT' }
    ];

    for (const wf of workflows) {
        if (wf.patterns.some(p => url.includes(p))) {
            chrome.runtime.sendMessage({
                type: 'WORKFLOW_DETECTED',
                workflow: wf.workflow,
                suggestedDomain: wf.domain
            });
            break;
        }
    }
});

// =========================================================
// Code Capture Functions
// =========================================================

async function handleCaptureBlock(block, tab) {
    const stored = await chrome.storage.local.get([STORAGE_KEYS.CAPTURED_BLOCKS, STORAGE_KEYS.STATS]);
    const blocks = stored[STORAGE_KEYS.CAPTURED_BLOCKS] || [];
    const stats = stored[STORAGE_KEYS.STATS] || { totalCaptured: 0, byPlatform: {}, byLanguage: {}, byDomain: {} };

    const capturedBlock = {
        ...block,
        id: `araya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        capturedAt: new Date().toISOString(),
        sourceUrl: tab?.url || 'unknown',
        platform: detectPlatform(tab?.url),
        domain: '2_BUILD' // Code goes to BUILD domain by default
    };

    blocks.push(capturedBlock);

    stats.totalCaptured++;
    stats.byPlatform[capturedBlock.platform] = (stats.byPlatform[capturedBlock.platform] || 0) + 1;
    if (block.language) {
        stats.byLanguage[block.language] = (stats.byLanguage[block.language] || 0) + 1;
    }
    stats.byDomain['2_BUILD'] = (stats.byDomain['2_BUILD'] || 0) + 1;
    stats.lastCapture = capturedBlock.capturedAt;

    await chrome.storage.local.set({
        [STORAGE_KEYS.CAPTURED_BLOCKS]: blocks,
        [STORAGE_KEYS.STATS]: stats
    });

    // Also save to native host
    saveToLocal('2_BUILD', {
        type: 'code',
        content: `\`\`\`${block.language || ''}\n${block.code}\n\`\`\``,
        title: block.filename || 'Code Capture',
        url: tab?.url
    });

    console.log('[ARAYA] Code block captured:', capturedBlock.id);
    return { success: true, id: capturedBlock.id, total: blocks.length };
}

async function saveToDomainStorage(domain, data) {
    const stored = await chrome.storage.local.get([STORAGE_KEYS.DOMAIN_DATA, STORAGE_KEYS.STATS]);
    const domainData = stored[STORAGE_KEYS.DOMAIN_DATA] || {};
    const stats = stored[STORAGE_KEYS.STATS] || { totalCaptured: 0, byPlatform: {}, byLanguage: {}, byDomain: {} };

    if (!domainData[domain]) domainData[domain] = [];

    domainData[domain].push({
        ...data,
        id: `araya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        savedAt: new Date().toISOString()
    });

    stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
    stats.totalCaptured++;

    await chrome.storage.local.set({
        [STORAGE_KEYS.DOMAIN_DATA]: domainData,
        [STORAGE_KEYS.STATS]: stats
    });
}

function detectPlatform(url) {
    if (!url) return 'unknown';
    if (url.includes('claude.ai')) return 'claude';
    if (url.includes('openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
    if (url.includes('deepseek.com')) return 'deepseek';
    if (url.includes('gemini.google.com')) return 'gemini';
    if (url.includes('copilot.microsoft.com')) return 'copilot';
    return 'other';
}

// =========================================================
// Message Handler
// =========================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[ARAYA] Message received:', message.type);

    switch (message.type) {
        // Native messaging
        case 'NATIVE_MESSAGE':
            if (nativePort && nativeConnected) {
                nativePort.postMessage({
                    action: message.action || message.payload?.action,
                    data: message.data || message.payload?.data || {}
                });
                sendResponse({ success: true, sent: true, ok: true });
            } else {
                sendResponse({ success: false, error: 'Native host not connected', ok: false });
            }
            return true;

        case 'NATIVE_STATUS':
            sendResponse({ connected: nativeConnected, host: NATIVE_HOST });
            return true;

        case 'SAVE_CHUNK':
            if (nativePort && nativeConnected) {
                nativePort.postMessage({ action: 'save_chunk', data: message.data });
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: 'Native host not connected' });
            }
            return true;

        // Domain operations
        case 'SAVE_TO_DOMAIN':
            saveToLocal(message.domain, message.data);
            saveToDomainStorage(message.domain, message.data).then(() => {
                sendResponse({ success: true, savedLocally: nativeConnected, domain: message.domain });
            });
            return true;

        case 'QUERY_BRAIN':
            queryBrain(message.query, message.limit || 10);
            sendResponse({ success: true, querying: true });
            return true;

        // Code capture
        case 'CAPTURE_BLOCK':
            handleCaptureBlock(message.data, sender.tab)
                .then(sendResponse)
                .catch(err => sendResponse({ error: err.message }));
            return true;

        case 'GET_CAPTURED':
            chrome.storage.local.get(STORAGE_KEYS.CAPTURED_BLOCKS)
                .then(stored => sendResponse(stored[STORAGE_KEYS.CAPTURED_BLOCKS] || []))
                .catch(err => sendResponse({ error: err.message }));
            return true;

        case 'GET_DOMAIN_DATA':
            chrome.storage.local.get(STORAGE_KEYS.DOMAIN_DATA)
                .then(stored => {
                    const data = stored[STORAGE_KEYS.DOMAIN_DATA] || {};
                    sendResponse(message.domain ? data[message.domain] || [] : data);
                })
                .catch(err => sendResponse({ error: err.message }));
            return true;

        case 'CLEAR_CAPTURED':
            chrome.storage.local.set({ [STORAGE_KEYS.CAPTURED_BLOCKS]: [] })
                .then(() => sendResponse({ success: true }))
                .catch(err => sendResponse({ error: err.message }));
            return true;

        case 'GET_STATS':
            chrome.storage.local.get(STORAGE_KEYS.STATS)
                .then(stored => sendResponse(stored[STORAGE_KEYS.STATS] || { totalCaptured: 0 }))
                .catch(err => sendResponse({ error: err.message }));
            return true;

        case 'GET_SETTINGS':
            chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
                .then(stored => sendResponse(stored[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS))
                .catch(err => sendResponse({ error: err.message }));
            return true;

        case 'UPDATE_SETTINGS':
            chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
                .then(async stored => {
                    const current = stored[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
                    const updated = { ...current, ...message.data };
                    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
                    sendResponse(updated);
                })
                .catch(err => sendResponse({ error: err.message }));
            return true;

        // Araya cloud API
        case 'ASK_ARAYA':
            fetch('https://conciousnessrevolution.io/.netlify/functions/araya-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message.prompt, mode: 'workflow' })
            })
            .then(r => r.json())
            .then(data => sendResponse({ success: true, response: data }))
            .catch(err => sendResponse({ success: false, error: err.message }));
            return true;
    }
});

console.log(`[ARAYA HUD] Service worker initialized v${ARAYA_VERSION}`);
