// ARAYA HUD - Code Capture Injector v2
// Adds capture + APPLY TO DASHBOARD buttons to code blocks on AI platforms

(function() {
    'use strict';

    window.ARAYA = window.ARAYA || {};

    const BUTTON_CLASS = 'araya-capture-btn';
    const CAPTURED_CLASS = 'araya-captured';

    // Available dashboards for code injection
    const DASHBOARDS = [
        { id: 'AGENT_R_777.html', name: 'Agent R 777' },
        { id: 'TIGER_777.html', name: 'Tiger 777' },
        { id: 'MAGGIE_777.html', name: 'Maggie 777' },
        { id: 'COMMANDER_DOMAIN_1.html', name: 'Commander D1' }
    ];

    // Apply code directly to a dashboard via API
    async function applyToDashboard(blockIndex, file, button) {
        const blocks = ARAYA.detector.findCodeBlocks();
        const block = blocks[blockIndex];
        if (!block) { showToast('Block not found', 'error'); return; }

        let action = 'append_body';
        if (block.language === 'css') action = 'add_style';
        else if (block.language === 'javascript' || block.language === 'js') action = 'add_script';
        else if (block.code.includes('<button')) action = 'add_button';

        try {
            const resp = await fetch('https://conciousnessrevolution.io/.netlify/functions/dashboard-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: file,
                    code: block.code,
                    action: action,
                    description: (block.language || 'code') + ' from ' + location.hostname
                })
            });
            const data = await resp.json();
            if (data.success) {
                if (button) button.innerHTML = '<span style="color:#00c896">✓ Applied!</span>';
                showToast('Applied to ' + file + '! Refresh in 30s.');
            } else {
                showToast('Failed: ' + data.error, 'error');
            }
        } catch (e) {
            console.error('[ARAYA]', e);
            showToast('Apply error', 'error');
        }
    }

    function createCaptureButton(blockIndex) {
        const container = document.createElement('div');
        container.className = 'araya-capture-container';
        container.style.cssText = 'position:relative;display:inline-flex;gap:4px;';

        // Main capture button
        const btn = document.createElement('button');
        btn.className = BUTTON_CLASS;
        btn.dataset.blockIndex = blockIndex;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Save</span>';
        btn.title = 'Save to BUILD';
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            captureBlock(blockIndex, btn);
        });

        // Apply dropdown button
        const applyBtn = document.createElement('button');
        applyBtn.className = BUTTON_CLASS + ' araya-apply-btn';
        applyBtn.innerHTML = '<span>🚀 Apply</span>';
        applyBtn.title = 'Apply to Dashboard';
        applyBtn.style.cssText = 'background:#00c896;';

        // Dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'araya-dropdown';
        dropdown.style.cssText = 'display:none;position:absolute;top:100%;right:0;background:#1a1a2e;border:1px solid #00c896;border-radius:8px;min-width:160px;z-index:10000;box-shadow:0 4px 12px rgba(0,200,150,0.3);margin-top:4px;';

        var dropdownHTML = '';
        for (var i = 0; i < DASHBOARDS.length; i++) {
            dropdownHTML += '<div class="araya-dd-item" data-file="' + DASHBOARDS[i].id + '" style="padding:10px 14px;cursor:pointer;color:#fff;border-bottom:1px solid #333;">📄 ' + DASHBOARDS[i].name + '</div>';
        }
        dropdown.innerHTML = dropdownHTML;

        dropdown.querySelectorAll('.araya-dd-item').forEach(function(item) {
            item.addEventListener('mouseenter', function() { item.style.background = '#00c89633'; });
            item.addEventListener('mouseleave', function() { item.style.background = 'transparent'; });
            item.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.style.display = 'none';
                await applyToDashboard(blockIndex, item.dataset.file, applyBtn);
            });
        });

        applyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) dropdown.style.display = 'none';
        });

        container.appendChild(btn);
        container.appendChild(applyBtn);
        container.appendChild(dropdown);
        return container;
    }

    async function captureBlock(blockIndex, button) {
        const blocks = ARAYA.detector.findCodeBlocks();
        const block = blocks[blockIndex];

        if (!block) {
            console.error('[ARAYA] Block not found:', blockIndex);
            return;
        }

        const filename = suggestFilename(block.language, block.code);

        try {
            const response = await chrome.runtime.sendMessage({
                type: 'CAPTURE_BLOCK',
                data: {
                    code: block.code,
                    language: block.language,
                    filename: filename,
                    lineCount: block.code.split('\n').length,
                    charCount: block.code.length
                }
            });

            if (response.success) {
                button.classList.add(CAPTURED_CLASS);
                button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Saved!</span>';
                showToast('Captured to BUILD! (' + response.total + ' total)');
            } else {
                showToast('Capture failed', 'error');
            }
        } catch (error) {
            console.error('[ARAYA] Capture error:', error);
            showToast('Capture error', 'error');
        }
    }

    function suggestFilename(language, code) {
        const extensions = {
            python: 'py', javascript: 'js', typescript: 'ts', java: 'java',
            cpp: 'cpp', ruby: 'rb', go: 'go', rust: 'rs', php: 'php',
            html: 'html', css: 'css', sql: 'sql', bash: 'sh', shell: 'sh',
            json: 'json', yaml: 'yml', xml: 'xml', markdown: 'md', text: 'txt'
        };

        const ext = extensions[language] || 'txt';
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        var name = 'snippet';
        const funcMatch = code.match(/(?:function|def|class|const|let|var)\s+(\w+)/);
        if (funcMatch) name = funcMatch[1];
        return name + '_' + timestamp + '.' + ext;
    }

    function injectButtons() {
        document.querySelectorAll('.' + BUTTON_CLASS).forEach(function(btn) { btn.remove(); });
        document.querySelectorAll('.araya-capture-container').forEach(function(c) { c.remove(); });

        const blocks = ARAYA.detector.findCodeBlocks();

        blocks.forEach(function(block, index) {
            const element = block.element;
            const parent = element.closest('pre') || element.parentElement;

            if (parent && !parent.querySelector('.araya-capture-container')) {
                const style = window.getComputedStyle(parent);
                if (style.position === 'static') {
                    parent.style.position = 'relative';
                }
                const container = createCaptureButton(index);
                parent.appendChild(container);
            }
        });

        console.log('[ARAYA] Injected', blocks.length, 'capture buttons');
    }

    function showToast(message, type) {
        type = type || 'success';
        document.querySelectorAll('.araya-toast').forEach(function(t) { t.remove(); });

        const toast = document.createElement('div');
        toast.className = 'araya-toast araya-toast-' + type;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function() { toast.classList.add('araya-toast-visible'); }, 10);
        setTimeout(function() {
            toast.classList.remove('araya-toast-visible');
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    async function captureAll() {
        const blocks = ARAYA.detector.findCodeBlocks();
        var captured = 0;

        for (var i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const filename = suggestFilename(block.language, block.code);
            try {
                const response = await chrome.runtime.sendMessage({
                    type: 'CAPTURE_BLOCK',
                    data: { code: block.code, language: block.language, filename: filename }
                });
                if (response.success) captured++;
            } catch (error) {
                console.error('[ARAYA] Capture error:', error);
            }
        }

        showToast('Captured ' + captured + ' blocks to BUILD!');
        injectButtons();
        return captured;
    }

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.type === 'CAPTURE_ALL_CODE') {
            captureAll().then(function(count) { sendResponse({ captured: count }); });
            return true;
        }
    });

    function init() {
        setTimeout(injectButtons, 1000);
        ARAYA.detector.observeNewBlocks(function() { setTimeout(injectButtons, 500); });
        var scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(injectButtons, 1000);
        }, { passive: true });
    }

    ARAYA.capture = { injectButtons: injectButtons, captureBlock: captureBlock, captureAll: captureAll, showToast: showToast, createCaptureButton: createCaptureButton, applyToDashboard: applyToDashboard };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[ARAYA] Code capture v2 initialized with Apply to Dashboard');
})();
