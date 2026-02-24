// ARIA Injector - Adds capture buttons to code blocks
// Injects UI elements for user interaction

(function() {
  'use strict';

  window.ARIA = window.ARIA || {};

  const BUTTON_CLASS = 'aria-capture-btn';
  const CAPTURED_CLASS = 'aria-captured';

  // Create capture button element
  function createCaptureButton(blockIndex) {
    const btn = document.createElement('button');
    btn.className = BUTTON_CLASS;
    btn.dataset.blockIndex = blockIndex;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>ARIA</span>
    `;
    btn.title = 'Capture with ARIA';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      captureBlock(blockIndex, btn);
    });

    return btn;
  }

  // Capture a specific block
  async function captureBlock(blockIndex, button) {
    const blocks = ARIA.detector.findCodeBlocks();
    const block = blocks[blockIndex];

    if (!block) {
      console.error('[ARIA Injector] Block not found:', blockIndex);
      return;
    }

    // Parse the block
    const parsed = ARIA.parser.parseBlock(block);

    // Send to background script
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CAPTURE_BLOCK',
        data: {
          code: block.code,
          language: parsed.language,
          filename: parsed.filename,
          lineCount: parsed.lineCount,
          charCount: parsed.charCount
        }
      });

      if (response.success) {
        // Visual feedback
        button.classList.add(CAPTURED_CLASS);
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Captured!</span>
        `;

        // Show notification toast
        showToast(`Captured! (${response.total} total)`);

        console.log('[ARIA Injector] Block captured:', response.id);
      } else {
        console.error('[ARIA Injector] Capture failed:', response.error);
        showToast('Capture failed', 'error');
      }
    } catch (error) {
      console.error('[ARIA Injector] Error:', error);
      showToast('Capture error', 'error');
    }
  }

  // Inject buttons into all code blocks
  function injectButtons() {
    // Remove existing buttons first
    document.querySelectorAll('.' + BUTTON_CLASS).forEach(btn => btn.remove());

    const blocks = ARIA.detector.findCodeBlocks();

    blocks.forEach((block, index) => {
      const element = block.element;
      const parent = element.closest('pre') || element.parentElement;

      if (parent && !parent.querySelector('.' + BUTTON_CLASS)) {
        // Ensure parent has relative positioning
        const style = window.getComputedStyle(parent);
        if (style.position === 'static') {
          parent.style.position = 'relative';
        }

        const btn = createCaptureButton(index);
        parent.appendChild(btn);
      }
    });

    console.log('[ARIA Injector] Injected', blocks.length, 'capture buttons');
  }

  // Show toast notification
  function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.aria-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `aria-toast aria-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('aria-toast-visible'), 10);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('aria-toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // Capture all visible blocks
  async function captureAll() {
    const blocks = ARIA.detector.findCodeBlocks();
    let captured = 0;

    for (const block of blocks) {
      const parsed = ARIA.parser.parseBlock(block);

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'CAPTURE_BLOCK',
          data: {
            code: block.code,
            language: parsed.language,
            filename: parsed.filename,
            lineCount: parsed.lineCount,
            charCount: parsed.charCount
          }
        });

        if (response.success) captured++;
      } catch (error) {
        console.error('[ARIA Injector] Capture error:', error);
      }
    }

    showToast(`Captured ${captured} blocks!`);
    injectButtons(); // Refresh buttons

    return captured;
  }

  // Initialize
  function init() {
    // Initial injection
    setTimeout(injectButtons, 1000);

    // Observe for new blocks
    ARIA.detector.observeNewBlocks(() => {
      setTimeout(injectButtons, 500);
    });

    // Re-inject on scroll (for lazy-loaded content)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(injectButtons, 1000);
    }, { passive: true });
  }

  // Export functions
  ARIA.injector = {
    injectButtons,
    captureBlock,
    captureAll,
    showToast,
    createCaptureButton
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[ARIA Injector] Initialized');
})();
