// Araya Browser Agent - Background Service Worker
// Persistent background processing for workflow detection
// Native Messaging bridge to OVERKORE local brain (163K+ atoms)

// =========================================================
// Native Messaging - OVERKORE Bridge
// =========================================================

const NATIVE_HOST = 'com.overkore.native_host';
let nativePort = null;
let nativeConnected = false;

// Connect to native OVERKORE host
function connectNative() {
    try {
        nativePort = chrome.runtime.connectNative(NATIVE_HOST);

        nativePort.onMessage.addListener((response) => {
            console.log('Native response:', response);
            // Broadcast to any listeners (sidepanel, popup)
            chrome.runtime.sendMessage({
                type: 'NATIVE_RESPONSE',
                data: response
            });
        });

        nativePort.onDisconnect.addListener(() => {
            console.log('Native host disconnected:', chrome.runtime.lastError?.message);
            nativeConnected = false;
            nativePort = null;
            // Retry connection after 5 seconds
            setTimeout(connectNative, 5000);
        });

        nativeConnected = true;
        console.log('Connected to OVERKORE native host');

        // Send ping to verify
        sendNative({ action: 'ping' });

    } catch (err) {
        console.log('Native connection failed:', err.message);
        nativeConnected = false;
    }
}

// Send message to native host
function sendNative(message) {
    if (nativePort && nativeConnected) {
        nativePort.postMessage(message);
        return true;
    } else {
        console.log('Native host not connected, using cloud fallback');
        return false;
    }
}

// Save content via native host (local file system)
function saveToLocal(domain, data) {
    const filename = `${data.type}_${Date.now()}.md`;
    const content = data.content || `# ${data.title}\n\nURL: ${data.url}\nCaptured: ${new Date().toISOString()}`;

    return sendNative({
        action: 'save',
        data: {
            domain: domain,
            filename: filename,
            content: content,
            url: data.url,
            classification: data.type
        }
    });
}

// Query local Cyclotron brain
function queryBrain(query, limit = 10) {
    return sendNative({
        action: 'query',
        data: { query, limit }
    });
}

// Initialize native connection on startup
connectNative();

// Open side panel on extension icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Context menu for quick save
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'save-to-araya',
        title: 'Save to Araya',
        contexts: ['selection', 'page', 'link', 'image']
    });

    chrome.contextMenus.create({
        id: 'save-to-1_COMMAND',
        parentId: 'save-to-araya',
        title: '1. Command (Control)',
        contexts: ['selection', 'page', 'link', 'image']
    });

    chrome.contextMenus.create({
        id: 'save-to-2_BUILD',
        parentId: 'save-to-araya',
        title: '2. Build (Projects)',
        contexts: ['selection', 'page', 'link', 'image']
    });

    chrome.contextMenus.create({
        id: 'save-to-3_CONNECT',
        parentId: 'save-to-araya',
        title: '3. Connect (People)',
        contexts: ['selection', 'page', 'link', 'image']
    });

    chrome.contextMenus.create({
        id: 'save-to-4_PROTECT',
        parentId: 'save-to-araya',
        title: '4. Protect (Legal/Health)',
        contexts: ['selection', 'page', 'link', 'image']
    });

    chrome.contextMenus.create({
        id: 'save-to-5_GROW',
        parentId: 'save-to-araya',
        title: '5. Grow (Business)',
        contexts: ['selection', 'page', 'link', 'image']
    });

    chrome.contextMenus.create({
        id: 'save-to-6_LEARN',
        parentId: 'save-to-araya',
        title: '6. Learn (Knowledge)',
        contexts: ['selection', 'page', 'link', 'image']
    });

    chrome.contextMenus.create({
        id: 'save-to-7_TRANSCEND',
        parentId: 'save-to-araya',
        title: '7. Transcend (Consciousness)',
        contexts: ['selection', 'page', 'link', 'image']
    });

    console.log('Araya extension installed - context menus created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
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

    // Send to side panel to save
    chrome.runtime.sendMessage({
        type: 'SAVE_TO_DOMAIN',
        domain: domain,
        data: data
    });

    // Show notification
    chrome.action.setBadgeText({ text: '+1', tabId: tab.id });
    setTimeout(() => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }, 2000);
});

// Workflow detection - analyze tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;

    // Detect workflow patterns
    const url = tab.url?.toLowerCase() || '';

    // Banking/Finance workflow
    if (url.includes('bank') || url.includes('chase') || url.includes('paypal')) {
        chrome.runtime.sendMessage({
            type: 'WORKFLOW_DETECTED',
            workflow: 'finance',
            suggestedDomain: '5_GROW'
        });
    }

    // Legal/Court workflow
    if (url.includes('court') || url.includes('legal') || url.includes('.gov')) {
        chrome.runtime.sendMessage({
            type: 'WORKFLOW_DETECTED',
            workflow: 'legal',
            suggestedDomain: '4_PROTECT'
        });
    }

    // Learning workflow
    if (url.includes('youtube') || url.includes('wikipedia') || url.includes('coursera')) {
        chrome.runtime.sendMessage({
            type: 'WORKFLOW_DETECTED',
            workflow: 'learning',
            suggestedDomain: '6_LEARN'
        });
    }
});

// Handle messages from content scripts and sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received:', message.type);

    // Save to domain via native host (local Cyclotron brain)
    if (message.type === 'SAVE_TO_DOMAIN') {
        const savedLocally = saveToLocal(message.domain, message.data);
        sendResponse({
            success: true,
            savedLocally: savedLocally,
            domain: message.domain
        });
        return true;
    }

    // Query local Cyclotron brain
    if (message.type === 'QUERY_BRAIN') {
        queryBrain(message.query, message.limit || 10);
        sendResponse({ success: true, querying: true });
        return true;
    }

    // Check native host connection status
    if (message.type === 'NATIVE_STATUS') {
        sendResponse({
            connected: nativeConnected,
            host: NATIVE_HOST
        });
        return true;
    }

    // Forward to Araya cloud API
    if (message.type === 'ASK_ARAYA') {
        fetch('https://conciousnessrevolution.io/.netlify/functions/araya-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message.prompt,
                mode: 'workflow'
            })
        })
        .then(r => r.json())
        .then(data => sendResponse({ success: true, response: data }))
        .catch(err => sendResponse({ success: false, error: err.message }));

        return true; // Keep channel open for async response
    }
});

console.log('Araya service worker initialized');
