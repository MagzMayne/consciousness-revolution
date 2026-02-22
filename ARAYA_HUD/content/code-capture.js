// ARAYA HUD - Code Capture Injector
// Adds capture buttons to code blocks on AI platforms

(function() {
    'use strict';

    window.ARAYA = window.ARAYA || {};

    const BUTTON_CLASS = 'araya-capture-btn';
    const CAPTURED_CLASS = 'araya-captured';

    function createCaptureButton(blockIndex) {
        const btn = document.createElement('button');
        btn.className = BUTTON_CLASS;
        btn.dataset.blockIndex = blockIndex;
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>ARAYA</span>
        `;
        btn.title = 'Capture to ARAYA';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            captureBlock(blockIndex, btn);
        });

        return btn;
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
                button.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Saved!</span>
                `;
                showToast(`Captured to BUILD! (${response.total} total)`);
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

        // Try to extract a meaningful name from the code
        let name = 'snippet';
        const funcMatch = code.match(/(?:function|def|class|const|let|var)\s+(\w+)/);
        if (funcMatch) name = funcMatch[1];

        return `${name}_${timestamp}.${ext}`;
    }

    function injectButtons() {
        document.querySelectorAll('.' + BUTTON_CLASS).forEach(btn => btn.remove());

        const blocks = ARAYA.detector.findCodeBlocks();

        blocks.forEach((block, index) => {
            const element = block.element;
            const parent = element.closest('pre') || element.parentElement;

            if (parent && !parent.querySelector('.' + BUTTON_CLASS)) {
                const style = window.getComputedStyle(parent);
                if (style.position === 'static') {
                    parent.style.position = 'relative';
                }

                const btn = createCaptureButton(index);
                parent.appendChild(btn);
            }
        });

        console.log('[ARAYA] Injected', blocks.length, 'capture buttons');
    }

    function showToast(message, type = 'success') {
        document.querySelectorAll('.araya-toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `araya-toast araya-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('araya-toast-visible'), 10);
        setTimeout(() => {
            toast.classList.remove('araya-toast-visible');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    async function captureAll() {
        const blocks = ARAYA.detector.findCodeBlocks();
        let captured = 0;

        for (const block of blocks) {
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
                if (response.success) captured++;
            } catch (error) {
                console.error('[ARAYA] Capture error:', error);
            }
        }

        showToast(`Captured ${captured} blocks to BUILD!`);
        injectButtons();
        return captured;
    }

    // Listen for capture all command
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'CAPTURE_ALL_CODE') {
            captureAll().then(count => sendResponse({ captured: count }));
            return true;
        }
    });

    // Initialize
    function init() {
        setTimeout(injectButtons, 1000);

        ARAYA.detector.observeNewBlocks(() => {
            setTimeout(injectButtons, 500);
        });

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(injectButtons, 1000);
        }, { passive: true });
    }

    ARAYA.capture = {
        injectButtons,
        captureBlock,
        captureAll,
        showToast,
        createCaptureButton
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[ARAYA] Code capture initialized');
})();
