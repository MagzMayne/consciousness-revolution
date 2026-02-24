// ARIA Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Load initial state
  await refreshUI();

  // Event listeners
  document.getElementById('captureAll').addEventListener('click', captureAll);
  document.getElementById('exportJson').addEventListener('click', () => exportData('json'));
  document.getElementById('exportZip').addEventListener('click', () => exportData('zip'));
  document.getElementById('clearAll').addEventListener('click', clearAll);
});

async function refreshUI() {
  try {
    // Get stats
    const stats = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    document.getElementById('totalCaptured').textContent = stats.totalCaptured || 0;

    // Get last platform
    const platforms = Object.keys(stats.byPlatform || {});
    document.getElementById('lastPlatform').textContent =
      platforms.length > 0 ? platforms[platforms.length - 1] : '-';

    // Get captured blocks
    const blocks = await chrome.runtime.sendMessage({ type: 'GET_CAPTURED' });
    renderCapturedList(blocks);
  } catch (error) {
    console.error('[ARIA Popup] Error refreshing UI:', error);
  }
}

function renderCapturedList(blocks) {
  const list = document.getElementById('capturedList');

  if (!blocks || blocks.length === 0) {
    list.innerHTML = '<p class="empty-state">No blocks captured yet. Visit an AI platform and click the ARIA button on code blocks.</p>';
    return;
  }

  list.innerHTML = blocks.slice(-10).reverse().map(block => `
    <div class="captured-item">
      <span class="captured-lang">${block.language || 'text'}</span>
      <span class="captured-info">${block.lineCount || 0} lines, ${block.charCount || 0} chars</span>
      <span class="captured-platform">${block.platform || 'unknown'}</span>
    </div>
  `).join('');
}

async function captureAll() {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showStatus('No active tab', 'error');
      return;
    }

    // Execute capture in content script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (window.ARIA && window.ARIA.injector) {
          return window.ARIA.injector.captureAll();
        }
        return 0;
      }
    });

    const captured = results[0]?.result || 0;
    showStatus(`Captured ${captured} blocks!`, 'success');
    await refreshUI();
  } catch (error) {
    console.error('[ARIA Popup] Capture error:', error);
    showStatus('Capture failed - make sure you\'re on an AI platform', 'error');
  }
}

async function exportData(format) {
  try {
    const blocks = await chrome.runtime.sendMessage({ type: 'GET_CAPTURED' });

    if (!blocks || blocks.length === 0) {
      showStatus('Nothing to export', 'error');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'json') {
      const data = {
        exportedAt: new Date().toISOString(),
        source: 'ARIA Browser Extension',
        version: '1.0.0',
        blockCount: blocks.length,
        blocks: blocks.map(b => ({
          id: b.id,
          code: b.code,
          language: b.language,
          platform: b.platform,
          filename: b.filename || `block-${b.id}.txt`,
          capturedAt: b.capturedAt
        }))
      };

      downloadFile(`aria-export-${timestamp}.json`, JSON.stringify(data, null, 2), 'application/json');
    } else if (format === 'zip') {
      // Use JSZip if available, otherwise fall back to individual downloads
      if (typeof JSZip !== 'undefined') {
        const zip = new JSZip();

        blocks.forEach((block, index) => {
          const filename = block.filename || `block-${index + 1}.${block.language || 'txt'}`;
          zip.file(filename, block.code);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        downloadBlob(`aria-export-${timestamp}.zip`, url);
      } else {
        // Fallback: export as JSON if JSZip not loaded
        showStatus('ZIP not available, using JSON', 'warning');
        exportData('json');
      }
    }

    showStatus('Export complete!', 'success');
  } catch (error) {
    console.error('[ARIA Popup] Export error:', error);
    showStatus('Export failed', 'error');
  }
}

async function clearAll() {
  if (!confirm('Clear all captured blocks? This cannot be undone.')) {
    return;
  }

  try {
    await chrome.runtime.sendMessage({ type: 'CLEAR_CAPTURED' });
    showStatus('All blocks cleared', 'success');
    await refreshUI();
  } catch (error) {
    console.error('[ARIA Popup] Clear error:', error);
    showStatus('Clear failed', 'error');
  }
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  downloadBlob(filename, url);
}

function downloadBlob(filename, url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showStatus(message, type = 'info') {
  // Simple status display - could be enhanced with toast
  console.log(`[ARIA] ${type.toUpperCase()}: ${message}`);

  // Update button text temporarily
  const btn = document.querySelector('.aria-btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = message;
  btn.style.background = type === 'error' ? '#ff4444' : type === 'success' ? '#00ff88' : '';

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.background = '';
  }, 2000);
}
