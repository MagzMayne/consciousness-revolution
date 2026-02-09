// ARIA Detector - Finds code blocks on AI platforms
// Detects platform and locates code elements

(function() {
  'use strict';

  window.ARIA = window.ARIA || {};

  // Platform detection
  const PLATFORMS = {
    CLAUDE: {
      name: 'Claude',
      match: /claude\.ai/,
      codeSelector: 'pre code, .code-block code, [class*="code"] pre',
      messageSelector: '[class*="message"], [class*="response"]',
      copyButtonSelector: 'button[aria-label*="copy"], button[class*="copy"]'
    },
    CHATGPT: {
      name: 'ChatGPT',
      match: /(chat\.openai\.com|chatgpt\.com)/,
      codeSelector: 'pre code, .markdown pre code',
      messageSelector: '[class*="message"], [data-message-author-role]',
      copyButtonSelector: 'button[class*="copy"]'
    },
    DEEPSEEK: {
      name: 'DeepSeek',
      match: /chat\.deepseek\.com/,
      codeSelector: 'pre code, .hljs',
      messageSelector: '.message-content, [class*="message"]',
      copyButtonSelector: 'button[class*="copy"]'
    },
    GEMINI: {
      name: 'Gemini',
      match: /gemini\.google\.com/,
      codeSelector: 'pre code, code-block',
      messageSelector: '[class*="response"], [class*="message"]',
      copyButtonSelector: 'button[aria-label*="copy"]'
    },
    COPILOT: {
      name: 'Copilot',
      match: /copilot\.microsoft\.com/,
      codeSelector: 'pre code, .code-block',
      messageSelector: '[class*="message"]',
      copyButtonSelector: 'button[class*="copy"]'
    }
  };

  // Detect current platform
  function detectPlatform() {
    const url = window.location.href;
    for (const [key, platform] of Object.entries(PLATFORMS)) {
      if (platform.match.test(url)) {
        console.log('[ARIA Detector] Platform detected:', platform.name);
        return { key, ...platform };
      }
    }
    console.log('[ARIA Detector] Unknown platform');
    return null;
  }

  // Find all code blocks on page
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

    console.log('[ARIA Detector] Found', blocks.length, 'code blocks');
    return blocks;
  }

  // Detect programming language
  function detectLanguage(element, code) {
    // Check class names for language hints
    const classes = element.className + ' ' + (element.parentElement?.className || '');

    const languagePatterns = [
      { pattern: /language-(\w+)/, group: 1 },
      { pattern: /lang-(\w+)/, group: 1 },
      { pattern: /hljs-?(\w+)?/, group: 1 },
      { pattern: /\b(python|javascript|typescript|java|cpp|c\+\+|ruby|go|rust|php|html|css|sql|bash|shell|json|yaml|xml|markdown)\b/i, group: 1 }
    ];

    for (const { pattern, group } of languagePatterns) {
      const match = classes.match(pattern);
      if (match && match[group]) {
        return match[group].toLowerCase();
      }
    }

    // Heuristic detection from code content
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

  // Observe for new code blocks (dynamic loading)
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
        console.log('[ARIA Detector] New code blocks detected');
        callback(findCodeBlocks());
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  // Export functions
  ARIA.detector = {
    detectPlatform,
    findCodeBlocks,
    detectLanguage,
    observeNewBlocks,
    PLATFORMS
  };

  console.log('[ARIA Detector] Initialized');
})();
