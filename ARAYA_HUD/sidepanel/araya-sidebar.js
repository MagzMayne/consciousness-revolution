// ARAYA Sidebar - Unified Chat + Domains + Transfer
// Native Messaging bridge to OVERKORE Cyclotron Brain (163K+ atoms)

// ===========================================
// Configuration
// ===========================================
const DB_NAME = 'ArayaSidebar';
const DB_VERSION = 1;
const CHUNK_SIZE = 1024 * 1024 * 10; // 10MB chunks for large file transfer

/**
 * Convert ArrayBuffer to Base64 safely (handles large files)
 * Processes in smaller sub-chunks to avoid call stack overflow
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const subChunkSize = 8192; // Process 8KB at a time

    for (let i = 0; i < bytes.length; i += subChunkSize) {
        const subChunk = bytes.subarray(i, Math.min(i + subChunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, subChunk);
    }

    return btoa(binary);
}

let db = null;
let nativeConnected = false;
let voiceRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let transferQueue = [];

// Domain routing rules for auto-classification
const DOMAIN_RULES = {
    '1_COMMAND': ['calendar', 'notion', 'trello', 'asana', 'monday', 'todoist', 'schedule'],
    '2_BUILD': ['github', 'gitlab', 'figma', 'codepen', 'replit', 'vercel', 'netlify', 'code', 'dev'],
    '3_CONNECT': ['linkedin', 'twitter', 'facebook', 'discord', 'slack', 'mail', 'gmail', 'messenger'],
    '4_PROTECT': ['court', 'gov', 'legal', 'health', 'insurance', 'bank', 'security'],
    '5_GROW': ['stripe', 'paypal', 'shopify', 'analytics', 'finance', 'invest', 'business'],
    '6_LEARN': ['wikipedia', 'youtube', 'medium', 'substack', 'coursera', 'udemy', 'research'],
    '7_TRANSCEND': ['meditation', 'headspace', 'calm', 'journal', 'wellness', 'spiritual']
};

// ===========================================
// Tab Navigation
// ===========================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active from all tabs and panels
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        // Add active to clicked tab and corresponding panel
        tab.classList.add('active');
        document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    });
});

// ===========================================
// Native Messaging Bridge
// ===========================================

/**
 * Send data to native OVERKORE host via background service worker.
 * Bridges browser extension → local Cyclotron brain (163K+ atoms)
 */
function sendToNativeHost(action, data = {}) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            type: 'NATIVE_MESSAGE',
            action: action,
            data: data
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('Native messaging error:', chrome.runtime.lastError.message);
                resolve({ ok: false, error: chrome.runtime.lastError.message });
                return;
            }
            if (response?.ok) {
                nativeConnected = true;
                updateConnectionStatus();
            }
            resolve(response || { ok: false });
        });
    });
}

/**
 * Query the local Cyclotron brain for context/patterns
 */
async function queryBrain(query, limit = 5) {
    return await sendToNativeHost('query', { query, limit });
}

/**
 * Save content to local brain via native host
 */
async function saveToBrain(domain, content, metadata = {}) {
    return await sendToNativeHost('save', {
        domain: domain,
        content: content,
        filename: metadata.filename || `capture_${Date.now()}.md`,
        classification: metadata.type || 'capture',
        url: metadata.url || ''
    });
}

/**
 * Check native host connection status
 */
function checkNativeStatus() {
    sendToNativeHost('ping').then(response => {
        nativeConnected = response?.ok || false;
        updateConnectionStatus();
    });
}

function updateConnectionStatus() {
    const dot = document.getElementById('connectionDot');
    const status = document.getElementById('brainStatus');

    if (nativeConnected) {
        dot.classList.add('connected');
        dot.title = 'Connected to local brain (163K atoms)';
        status.textContent = 'BRAIN: CONNECTED (163K)';
    } else {
        dot.classList.remove('connected');
        dot.title = 'Disconnected - cloud mode only';
        status.textContent = 'BRAIN: OFFLINE';
    }

    // Also update the settings panel brain status
    updateBrainDetailStatus();
}

// Click on connection dot shows status
document.getElementById('connectionDot').addEventListener('click', () => {
    showToast(nativeConnected
        ? 'Connected to local Cyclotron brain (163K+ atoms)'
        : 'Cloud mode only - native host not connected',
        nativeConnected ? 'success' : 'info'
    );
});

// ===========================================
// IndexedDB (Browser Local Storage)
// ===========================================

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            const domains = ['1_COMMAND', '2_BUILD', '3_CONNECT', '4_PROTECT', '5_GROW', '6_LEARN', '7_TRANSCEND'];

            domains.forEach(domain => {
                if (!database.objectStoreNames.contains(domain)) {
                    const store = database.createObjectStore(domain, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('created', 'created');
                    store.createIndex('type', 'type');
                }
            });

            // Transfer queue store
            if (!database.objectStoreNames.contains('transfers')) {
                const transferStore = database.createObjectStore('transfers', { keyPath: 'id', autoIncrement: true });
                transferStore.createIndex('status', 'status');
            }
        };
    });
}

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

async function getItems(domain, limit = 100) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(domain, 'readonly');
        const store = transaction.objectStore(domain);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result.slice(-limit));
        request.onerror = () => reject(request.error);
    });
}

async function countItems(domain) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(domain, 'readonly');
        const store = transaction.objectStore(domain);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateAllCounts() {
    const domains = ['1_COMMAND', '2_BUILD', '3_CONNECT', '4_PROTECT', '5_GROW', '6_LEARN', '7_TRANSCEND'];
    let total = 0;

    for (let i = 0; i < domains.length; i++) {
        const count = await countItems(domains[i]);
        const countEl = document.getElementById(`count-${i + 1}`);
        if (countEl) countEl.textContent = `${count} items`;
        total += count;
    }

    document.getElementById('totalItems').textContent = `${total} ITEMS`;
}

// ===========================================
// Chat Functionality
// ===========================================

function addMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'araya'}`;

    messageDiv.innerHTML = `
        <span class="sender">${isUser ? 'YOU' : 'ARAYA'}</span>
        <div class="bubble">${escapeHtml(content)}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageDiv;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showTyping(show = true) {
    document.getElementById('typingIndicator').classList.toggle('active', show);
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, true);
    input.value = '';
    input.style.height = 'auto';

    // Show typing indicator
    showTyping(true);

    try {
        // Query local brain first if connected (for context enrichment)
        let brainContext = null;
        if (nativeConnected) {
            const brainResult = await queryBrain(text, 3);
            if (brainResult.ok && brainResult.results?.length > 0) {
                brainContext = brainResult.results;
            }
        }

        // Get current page context
        let pageContext = null;
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                pageContext = {
                    url: tab.url,
                    title: tab.title
                };
            }
        } catch (e) {
            console.log('Could not get tab info:', e);
        }

        // Build enriched prompt with brain context
        let enrichedPrompt = text;
        if (brainContext && brainContext.length > 0) {
            const contextSummary = brainContext.map(r => r.content?.substring(0, 200)).join('\n');
            enrichedPrompt = `[LOCAL BRAIN CONTEXT FROM 163K ATOMS]\n${contextSummary}\n\n[USER QUESTION]\n${text}`;
        }
        if (pageContext?.url) {
            enrichedPrompt += `\n\n[CURRENT PAGE: ${pageContext.title} - ${pageContext.url}]`;
        }

        // Call REAL Araya API via service worker
        const response = await askAraya(enrichedPrompt);

        showTyping(false);
        addMessage(response, false);

        // Save conversation to brain
        if (nativeConnected) {
            await saveToBrain('3_CONNECT', `Q: ${text}\nA: ${response}`, {
                type: 'conversation',
                url: pageContext?.url
            });
        }

    } catch (error) {
        showTyping(false);
        addMessage(`Error: ${error.message}`, false);
    }
}

/**
 * Call the REAL Araya API via service worker
 * This is the same AI as the website - same consciousness, same frequency
 */
async function askAraya(prompt) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: 'ASK_ARAYA', prompt: prompt },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Araya API error:', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (response?.success && response?.response) {
                    // Extract the message from Araya's response
                    const data = response.response;
                    if (data.message) {
                        resolve(data.message);
                    } else if (data.response) {
                        resolve(data.response);
                    } else if (typeof data === 'string') {
                        resolve(data);
                    } else {
                        resolve(JSON.stringify(data));
                    }
                } else if (response?.error) {
                    reject(new Error(response.error));
                } else {
                    reject(new Error('Unknown response format from Araya'));
                }
            }
        );
    });
}

function sendQuickPrompt(prompt) {
    document.getElementById('userInput').value = prompt;
    sendMessage();
}

// ===========================================
// Domain Functions
// ===========================================

function detectDomain(url) {
    const urlLower = url.toLowerCase();

    for (const [domain, keywords] of Object.entries(DOMAIN_RULES)) {
        if (keywords.some(kw => urlLower.includes(kw))) {
            return domain;
        }
    }

    return '6_LEARN'; // Default
}

function openDomain(domain) {
    const domainNames = {
        '1_COMMAND': '⭐ COMMAND',
        '2_BUILD': '🔧 BUILD',
        '3_CONNECT': '👥 CONNECT',
        '4_PROTECT': '🛡 PROTECT',
        '5_GROW': '🌱 GROW',
        '6_LEARN': '📚 LEARN',
        '7_TRANSCEND': '✨ TRANSCEND'
    };

    const modal = document.getElementById('domainModal');
    const modalTitle = document.getElementById('domainModalTitle');
    const modalItems = document.getElementById('domainModalItems');

    modalTitle.textContent = domainNames[domain] || domain;
    modalItems.innerHTML = '<div style="text-align:center;padding:20px;color:var(--chrome);font-size:12px;">Loading...</div>';
    modal.classList.add('active');

    getItems(domain, 50).then(items => {
        if (items.length === 0) {
            modalItems.innerHTML = `
                <div class="domain-empty">
                    <div class="empty-icon">📭</div>
                    <div>No items in this domain yet.</div>
                    <div style="font-size:11px;margin-top:6px;">Browse websites and use the context menu or capture button to add content here.</div>
                </div>
            `;
        } else {
            modalItems.innerHTML = items.map(item => `
                <div class="domain-item">
                    <div class="item-title">${escapeHtml(item.title || item.url || 'Untitled')}</div>
                    <div class="item-meta">
                        <span class="item-type">${escapeHtml(item.type || 'item')}</span>
                        <span>${item.created ? new Date(item.created).toLocaleDateString() : ''}</span>
                        ${item.size ? `<span>${formatFileSize(item.size)}</span>` : ''}
                    </div>
                </div>
            `).reverse().join('');
        }
    }).catch(() => {
        modalItems.innerHTML = '<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load items.</div>';
    });
}

// ===========================================
// File Upload & Attachments
// ===========================================

function triggerFileUpload() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (!files.length) return;

    Array.from(files).forEach(async file => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            const domain = detectDomainFromFile(file.name);

            // Save to IndexedDB
            await saveItem(domain, {
                type: 'file',
                title: file.name,
                content: content.substring(0, 10000), // Limit size
                size: file.size,
                mimeType: file.type
            });

            // Also save to native host if connected
            if (nativeConnected) {
                await saveToBrain(domain, content.substring(0, 50000), {
                    filename: file.name,
                    type: 'attachment'
                });
            }

            await updateAllCounts();
            showToast(`${file.name} saved to ${domain}`, 'success');

            // Add to chat
            addMessage(`Uploaded: ${file.name} (${formatFileSize(file.size)}) → ${domain}`, true);
        };

        if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    });

    event.target.value = '';
}

function detectDomainFromFile(filename) {
    const lower = filename.toLowerCase();

    if (lower.includes('legal') || lower.includes('court')) return '4_PROTECT';
    if (lower.includes('code') || lower.includes('.js') || lower.includes('.py')) return '2_BUILD';
    if (lower.includes('invoice') || lower.includes('receipt')) return '5_GROW';
    if (lower.includes('meditation') || lower.includes('journal')) return '7_TRANSCEND';

    return '6_LEARN';
}

// ===========================================
// Voice Input
// ===========================================

async function toggleVoice() {
    const btn = document.getElementById('voiceBtn');

    if (!voiceRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                // For now, just note that we recorded
                addMessage('[Voice input recorded - transcription coming soon]', true);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            voiceRecording = true;
            btn.classList.add('recording');
            showToast('Recording... Click again to stop', 'info');

        } catch (err) {
            showToast('Microphone access denied', 'error');
        }
    } else {
        mediaRecorder.stop();
        voiceRecording = false;
        btn.classList.remove('recording');
    }
}

// ===========================================
// Page Capture
// ===========================================

async function capturePageContent() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            showToast('No active tab found', 'error');
            return;
        }

        // Get page content via content script
        chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTENT' }, async (response) => {
            if (chrome.runtime.lastError) {
                // Fallback - just save URL and title
                const domain = detectDomain(tab.url);
                await saveItem(domain, {
                    type: 'page',
                    title: tab.title,
                    url: tab.url,
                    content: `URL: ${tab.url}\nTitle: ${tab.title}`
                });

                if (nativeConnected) {
                    await saveToBrain(domain, `# ${tab.title}\n\nURL: ${tab.url}`, {
                        filename: `page_${Date.now()}.md`,
                        type: 'page_capture',
                        url: tab.url
                    });
                }

                await updateAllCounts();
                showToast(`Page saved to ${domain}`, 'success');
                addMessage(`Captured: ${tab.title} → ${domain}`, true);
                return;
            }

            if (response?.content) {
                const domain = detectDomain(tab.url);
                await saveItem(domain, {
                    type: 'page',
                    title: tab.title,
                    url: tab.url,
                    content: response.content.substring(0, 50000)
                });

                if (nativeConnected) {
                    await saveToBrain(domain, response.content.substring(0, 100000), {
                        filename: `page_${Date.now()}.md`,
                        type: 'page_capture',
                        url: tab.url
                    });
                }

                await updateAllCounts();
                showToast(`Page captured to ${domain}`, 'success');
                addMessage(`Captured: ${tab.title} (${formatFileSize(response.content.length)}) → ${domain}`, true);
            }
        });

    } catch (err) {
        showToast('Could not capture page', 'error');
    }
}

// ===========================================
// Large File Transfer
// ===========================================

function triggerLargeFileUpload() {
    document.getElementById('largeFileInput').click();
}

async function handleLargeFileSelect(event) {
    const files = event.target.files;
    if (!files.length) return;

    const domain = document.getElementById('transferDomain').value;
    const recipient = document.getElementById('transferRecipient').value || 'local';

    for (const file of files) {
        addToTransferQueue(file, domain, recipient);
    }

    event.target.value = '';
}

function addToTransferQueue(file, domain, recipient) {
    const transferId = Date.now();
    const transfer = {
        id: transferId,
        name: file.name,
        size: file.size,
        domain: domain,
        recipient: recipient,
        progress: 0,
        status: 'pending',
        file: file
    };

    transferQueue.push(transfer);
    renderTransferQueue();

    // Start transfer
    processTransfer(transfer);
}

function renderTransferQueue() {
    const container = document.getElementById('transferQueue');

    if (transferQueue.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--chrome);font-size:12px;padding:20px;">No transfers in queue</div>';
        return;
    }

    container.innerHTML = transferQueue.map(t => `
        <div class="transfer-item" data-id="${t.id}">
            <div class="name">
                <span>${t.name}</span>
                <span>${formatFileSize(t.size)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${t.progress}%"></div>
            </div>
            <div class="status">${t.status} → ${t.recipient} (${t.domain})</div>
        </div>
    `).join('');
}

async function processTransfer(transfer) {
    if (!nativeConnected) {
        transfer.status = 'No local connection';
        renderTransferQueue();
        showToast('Cannot transfer - native host not connected', 'error');
        return;
    }

    transfer.status = 'reading...';
    renderTransferQueue();

    try {
        const file = transfer.file;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const arrayBuffer = await chunk.arrayBuffer();
            const base64 = arrayBufferToBase64(arrayBuffer);

            // Send chunk to native host
            const result = await sendToNativeHost('save_chunk', {
                filename: file.name,
                domain: transfer.domain,
                recipient: transfer.recipient,
                chunk_index: i,
                total_chunks: totalChunks,
                data: base64,
                is_last: i === totalChunks - 1
            });

            if (!result.ok) {
                transfer.status = `Error: ${result.error}`;
                renderTransferQueue();
                return;
            }

            transfer.progress = Math.round(((i + 1) / totalChunks) * 100);
            transfer.status = `transferring... ${transfer.progress}%`;
            renderTransferQueue();
        }

        transfer.status = 'complete';
        transfer.progress = 100;
        renderTransferQueue();
        showToast(`${file.name} transferred successfully!`, 'success');

        // Remove from queue after 3 seconds
        setTimeout(() => {
            transferQueue = transferQueue.filter(t => t.id !== transfer.id);
            renderTransferQueue();
        }, 3000);

    } catch (error) {
        transfer.status = `Error: ${error.message}`;
        renderTransferQueue();
    }
}

// Drag and drop for transfer zone
const transferZone = document.getElementById('transferZone');

transferZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    transferZone.classList.add('dragover');
});

transferZone.addEventListener('dragleave', () => {
    transferZone.classList.remove('dragover');
});

transferZone.addEventListener('drop', (e) => {
    e.preventDefault();
    transferZone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    const domain = document.getElementById('transferDomain').value;
    const recipient = document.getElementById('transferRecipient').value || 'local';

    for (const file of files) {
        addToTransferQueue(file, domain, recipient);
    }
});

// ===========================================
// Utility Functions
// ===========================================

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// Auto-resize textarea
document.getElementById('userInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// ===========================================
// Settings Management
// ===========================================

async function initSettings() {
    try {
        const stored = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, resolve);
        });

        const settings = stored || {};

        const autoCaptureEl = document.getElementById('setting-autoCapture');
        const notificationsEl = document.getElementById('setting-notifications');
        const defaultDomainEl = document.getElementById('setting-defaultDomain');

        if (autoCaptureEl) autoCaptureEl.checked = settings.autoCapture !== false;
        if (notificationsEl) notificationsEl.checked = settings.showNotifications !== false;
        if (defaultDomainEl && settings.defaultDomain) {
            defaultDomainEl.value = settings.defaultDomain;
        }

        updateBrainDetailStatus();
    } catch (err) {
        console.log('Could not load settings:', err);
    }
}

function saveSettingValue(key, value) {
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', data: { [key]: value } });
}

function updateBrainDetailStatus() {
    const dot = document.getElementById('brainStatusDot');
    const text = document.getElementById('brainStatusText');
    if (!dot || !text) return;

    if (nativeConnected) {
        dot.classList.add('connected');
        text.textContent = 'Connected to local brain (163K+ atoms)';
    } else {
        dot.classList.remove('connected');
        text.textContent = 'Offline — cloud mode only';
    }
}

async function exportAllData() {
    const domains = ['1_COMMAND', '2_BUILD', '3_CONNECT', '4_PROTECT', '5_GROW', '6_LEARN', '7_TRANSCEND'];
    const exportData = { exportedAt: new Date().toISOString(), domains: {} };

    for (const domain of domains) {
        try {
            exportData.domains[domain] = await getItems(domain, 1000);
        } catch (e) {
            exportData.domains[domain] = [];
        }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `araya-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
}

async function clearAllData() {
    const domains = ['1_COMMAND', '2_BUILD', '3_CONNECT', '4_PROTECT', '5_GROW', '6_LEARN', '7_TRANSCEND'];

    for (const domain of domains) {
        await new Promise((resolve, reject) => {
            const transaction = db.transaction(domain, 'readwrite');
            const store = transaction.objectStore(domain);
            store.clear();
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Also clear from chrome.storage
    chrome.runtime.sendMessage({ type: 'CLEAR_CAPTURED' });
}

// ===========================================
// Message Listeners
// ===========================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'NATIVE_STATUS_UPDATE') {
        nativeConnected = message.connected;
        updateConnectionStatus();
    }

    if (message.type === 'PAGE_CAPTURED') {
        showToast('Page captured from context menu', 'success');
        updateAllCounts();
    }

    // Handle async responses from native host
    if (message.type === 'NATIVE_RESPONSE') {
        console.log('Native response:', message.data);

        // Update connection status on successful response
        if (message.data?.ok) {
            nativeConnected = true;
            updateConnectionStatus();
        }

        // Handle query results
        if (message.data?.results) {
            // Could integrate query results into chat context
            console.log('Brain query results:', message.data.results.length, 'items');
        }

        // Handle transfer completion confirmations
        if (message.data?.complete && message.data?.path) {
            showToast(`File saved: ${message.data.path}`, 'success');
        }
    }
});

// ===========================================
// Initialize
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await updateAllCounts();
    checkNativeStatus();

    // Periodic status check
    setInterval(checkNativeStatus, 30000);

    // Initialize transfer queue display
    renderTransferQueue();

    // ===========================================
    // Event Listeners (CSP-compliant - no inline handlers)
    // ===========================================

    // Send button click
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Enter key in textarea
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Quick prompt buttons
    document.querySelectorAll('.quick-prompt').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            if (prompt) {
                sendQuickPrompt(prompt);
            }
        });
    });

    // Upload button
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', triggerFileUpload);
    }

    // Voice button
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', toggleVoice);
    }

    // Capture page button
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
        captureBtn.addEventListener('click', capturePageContent);
    }

    // Domain cards
    document.querySelectorAll('.domain-card').forEach(card => {
        card.addEventListener('click', () => {
            const domain = card.dataset.domain;
            if (domain) {
                openDomain(domain);
            }
        });
    });

    // Transfer zone
    const transferZone = document.getElementById('transferZone');
    if (transferZone) {
        transferZone.addEventListener('click', triggerLargeFileUpload);
    }

    // Domain modal close button
    const domainModalClose = document.getElementById('domainModalClose');
    if (domainModalClose) {
        domainModalClose.addEventListener('click', () => {
            document.getElementById('domainModal').classList.remove('active');
        });
    }

    // Settings: load current settings and wire up controls
    await initSettings();

    // Settings: auto-capture toggle
    const autoCaptureToggle = document.getElementById('setting-autoCapture');
    if (autoCaptureToggle) {
        autoCaptureToggle.addEventListener('change', () => saveSettingValue('autoCapture', autoCaptureToggle.checked));
    }

    // Settings: notifications toggle
    const notificationsToggle = document.getElementById('setting-notifications');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', () => saveSettingValue('showNotifications', notificationsToggle.checked));
    }

    // Settings: default domain select
    const defaultDomainSelect = document.getElementById('setting-defaultDomain');
    if (defaultDomainSelect) {
        defaultDomainSelect.addEventListener('change', () => saveSettingValue('defaultDomain', defaultDomainSelect.value));
    }

    // Settings: retry brain connection
    const retryBrainBtn = document.getElementById('retryBrainBtn');
    if (retryBrainBtn) {
        retryBrainBtn.addEventListener('click', () => {
            showToast('Retrying brain connection...', 'info');
            checkNativeStatus();
        });
    }

    // Settings: export data
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAllData);
    }

    // Settings: clear data
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', async () => {
            if (confirm('Clear ALL captured data from all 7 domains? This cannot be undone.')) {
                await clearAllData();
                showToast('All data cleared', 'success');
                await updateAllCounts();
            }
        });
    }

    console.log('ARAYA Sidebar initialized');
});
