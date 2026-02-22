// ARAYA HUD - Code Block Detector
// Detects code blocks on AI platforms (Claude, ChatGPT, DeepSeek, Gemini, Copilot)

(function() {
    'use strict';

    window.ARAYA = window.ARAYA || {};

    const PLATFORMS = {
        CLAUDE: {
            name: 'Claude',
            match: /claude\.ai/,
            codeSelector: 'pre code, .code-block code, [class*="code"] pre',
            messageSelector: '[class*="message"], [class*="response"]'
        },
        CHATGPT: {
            name: 'ChatGPT',
            match: /(chat\.openai\.com|chatgpt\.com)/,
            codeSelector: 'pre code, .markdown pre code',
            messageSelector: '[class*="message"], [data-message-author-role]'
        },
        DEEPSEEK: {
            name: 'DeepSeek',
            match: /chat\.deepseek\.com/,
            codeSelector: 'pre code, .hljs',
            messageSelector: '.message-content, [class*="message"]'
        },
        GEMINI: {
            name: 'Gemini',
            match: /gemini\.google\.com/,
            codeSelector: 'pre code, code-block',
            messageSelector: '[class*="response"], [class*="message"]'
        },
        COPILOT: {
            name: 'Copilot',
            match: /copilot\.microsoft\.com/,
            codeSelector: 'pre code, .code-block',
            messageSelector: '[class*="message"]'
        }
    };

    function detectPlatform() {
        const url = window.location.href;
        for (const [key, platform] of Object.entries(PLATFORMS)) {
            if (platform.match.test(url)) {
                console.log('[ARAYA] Platform detected:', platform.name);
                return { key, ...platform };
            }
        }
        return null;
    }

    function findCodeBlocks() {
        const platform = detectPlatform();
        if (!platform) return [];

        const blocks = [];
        const codeElements = document.querySelectorAll(platform.codeSelector);

        codeElements.forEach((element, index) => {
            const code = element.textContent || element.innerText;
            if (code && code.trim().length > 0) {
                blocks.push({
                    index,
                    element,
                    code: code.trim(),
                    language: detectLanguage(element, code),
                    platform: platform.name,
                    timestamp: new Date().toISOString()
                });
            }
        });

        console.log('[ARAYA] Found', blocks.length, 'code blocks');
        return blocks;
    }

    function detectLanguage(element, code) {
        const classes = element.className + ' ' + (element.parentElement?.className || '');

        const patterns = [
            { pattern: /language-(\w+)/, group: 1 },
            { pattern: /lang-(\w+)/, group: 1 },
            { pattern: /hljs-?(\w+)?/, group: 1 },
            { pattern: /\b(python|javascript|typescript|java|cpp|ruby|go|rust|php|html|css|sql|bash|shell|json|yaml|xml)\b/i, group: 1 }
        ];

        for (const { pattern, group } of patterns) {
            const match = classes.match(pattern);
            if (match && match[group]) {
                return match[group].toLowerCase();
            }
        }

        // Heuristic detection
        if (code.includes('def ') && code.includes(':')) return 'python';
        if (code.includes('function') || code.includes('=>')) return 'javascript';
        if (code.includes('interface') && code.includes(': ')) return 'typescript';
        if (code.includes('public class')) return 'java';
        if (code.includes('#include')) return 'cpp';
        if (code.includes('fn ') && code.includes('->')) return 'rust';
        if (code.includes('func ') && code.includes('package')) return 'go';
        if (code.startsWith('{') || code.startsWith('[')) return 'json';
        if (code.includes('<!DOCTYPE') || code.includes('<html')) return 'html';
        if (code.includes('SELECT') || code.includes('FROM')) return 'sql';

        return 'text';
    }

    function observeNewBlocks(callback) {
        const observer = new MutationObserver((mutations) => {
            let hasNewCode = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches?.('pre, code, [class*="code"]') ||
                                node.querySelector?.('pre, code, [class*="code"]')) {
                                hasNewCode = true;
                                break;
                            }
                        }
                    }
                }
                if (hasNewCode) break;
            }

            if (hasNewCode) {
                callback(findCodeBlocks());
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return observer;
    }

    ARAYA.detector = {
        detectPlatform,
        findCodeBlocks,
        detectLanguage,
        observeNewBlocks,
        PLATFORMS
    };

    console.log('[ARAYA] Code detector initialized');
})();
