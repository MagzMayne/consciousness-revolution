/**
 * DOCUMENT VIEWER EMBED
 * Embeddable component for dashboards and ARAYA
 * Usage: <div id="doc-viewer" data-src="document.html"></div>
 *        <script src="/js/doc-viewer-embed.js"></script>
 */

(function() {
    'use strict';

    const STYLES = `
        .embed-doc-viewer {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 12px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .embed-doc-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: #21262d;
            border-bottom: 1px solid #30363d;
        }

        .embed-doc-title {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #c9d1d9;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .embed-doc-actions {
            display: flex;
            gap: 8px;
        }

        .embed-doc-btn {
            padding: 6px 12px;
            background: #30363d;
            border: none;
            border-radius: 6px;
            color: #c9d1d9;
            font-size: 0.8rem;
            cursor: pointer;
            transition: background 0.15s;
        }

        .embed-doc-btn:hover {
            background: #484f58;
        }

        .embed-doc-frame {
            width: 100%;
            height: 500px;
            border: none;
            background: #0d1117;
        }

        .embed-doc-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 16px;
            background: #21262d;
            border-top: 1px solid #30363d;
            font-size: 0.8rem;
            color: #8b949e;
        }

        .embed-ai-hint {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #58a6ff;
            cursor: pointer;
        }

        .embed-ai-hint:hover {
            text-decoration: underline;
        }
    `;

    function createViewer(container) {
        const src = container.dataset.src || 'PIMESH_LAUNCH_CHECKLIST.html';
        const title = container.dataset.title || 'Document';
        const height = container.dataset.height || '500px';
        const showAi = container.dataset.ai !== 'false';

        container.innerHTML = `
            <div class="embed-doc-viewer">
                <div class="embed-doc-header">
                    <div class="embed-doc-title">
                        <span>📄</span>
                        <span>${title}</span>
                    </div>
                    <div class="embed-doc-actions">
                        <button class="embed-doc-btn" onclick="this.closest('.embed-doc-viewer').querySelector('iframe').contentWindow.location.reload()">↻</button>
                        <button class="embed-doc-btn" onclick="window.open('${src}', '_blank')">↗</button>
                    </div>
                </div>
                <iframe class="embed-doc-frame" src="${src}" style="height: ${height};"></iframe>
                ${showAi ? `
                <div class="embed-doc-footer">
                    <span>Viewing: ${src}</span>
                    <span class="embed-ai-hint" onclick="window.openArayaWith && window.openArayaWith('${src}')">
                        🤖 Ask ARAYA about this
                    </span>
                </div>
                ` : ''}
            </div>
        `;
    }

    function init() {
        // Inject styles
        if (!document.getElementById('doc-viewer-styles')) {
            const style = document.createElement('style');
            style.id = 'doc-viewer-styles';
            style.textContent = STYLES;
            document.head.appendChild(style);
        }

        // Initialize all viewers
        document.querySelectorAll('[data-doc-viewer]').forEach(createViewer);
        document.querySelectorAll('#doc-viewer').forEach(createViewer);
    }

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for manual initialization
    window.DocViewer = { init, createViewer };

    // ARAYA integration hook
    window.openArayaWith = function(doc) {
        // Check if ARAYA is on the page
        if (window.arayaChat) {
            window.arayaChat.send(`Help me with this document: ${doc}`);
        } else {
            // Open ARAYA in new tab with context
            window.open(`araya-chat.html?context=${encodeURIComponent(doc)}`, '_blank');
        }
    };

})();
