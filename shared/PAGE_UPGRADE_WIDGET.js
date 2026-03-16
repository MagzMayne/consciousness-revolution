/**
 * PAGE UPGRADE WIDGET v1.0
 * Universal component for all pages
 * - Shows page status (% complete)
 * - Report bug button
 * - Request upgrade button
 * - Links to beta test system
 */

(function() {
    // Get page info from meta tags or data attributes
    const pageData = {
        name: document.title || 'Unknown Page',
        file: window.location.pathname.split('/').pop() || 'index.html',
        category: document.querySelector('meta[name="page-category"]')?.content || 'unknown',
        status: document.querySelector('meta[name="page-status"]')?.content || 'live',
        percentComplete: parseInt(document.querySelector('meta[name="percent-complete"]')?.content || '100'),
        version: document.querySelector('meta[name="page-version"]')?.content || '1.0.0'
    };

    // Create widget HTML
    const widgetHTML = `
        <div id="page-upgrade-widget" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: system-ui, sans-serif;
        ">
            <!-- Toggle Button -->
            <button id="puw-toggle" style="
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 2px solid #00ff88;
                background: linear-gradient(135deg, #0a0a12, #1a1a2e);
                color: #00ff88;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,255,136,0.3);
                transition: all 0.3s;
            " title="Page Tools">
                ⚡
            </button>

            <!-- Expanded Panel -->
            <div id="puw-panel" style="
                display: none;
                position: absolute;
                bottom: 60px;
                right: 0;
                width: 280px;
                background: linear-gradient(135deg, #12121a, #1a1a2e);
                border: 2px solid #333;
                border-radius: 15px;
                padding: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            ">
                <!-- Page Status Header -->
                <div style="margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #333;">
                    <div style="font-size: 0.7rem; color: #666; text-transform: uppercase; margin-bottom: 5px;">Page Status</div>
                    <div style="font-weight: bold; color: #fff; font-size: 0.9rem;">${pageData.name}</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                        <div style="flex: 1; background: #333; border-radius: 10px; height: 8px; overflow: hidden;">
                            <div style="background: ${pageData.percentComplete >= 90 ? '#00ff88' : pageData.percentComplete >= 50 ? '#f39c12' : '#e74c3c'}; width: ${pageData.percentComplete}%; height: 100%;"></div>
                        </div>
                        <span style="color: ${pageData.percentComplete >= 90 ? '#00ff88' : pageData.percentComplete >= 50 ? '#f39c12' : '#e74c3c'}; font-size: 0.8rem; font-weight: bold;">${pageData.percentComplete}%</span>
                    </div>
                    <div style="font-size: 0.7rem; color: #888; margin-top: 5px;">v${pageData.version} | ${pageData.status.toUpperCase()}</div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="/bugs.html?page=${encodeURIComponent(pageData.file)}" style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 12px;
                        background: rgba(231,76,60,0.1);
                        border: 1px solid #e74c3c;
                        border-radius: 8px;
                        color: #e74c3c;
                        text-decoration: none;
                        font-size: 0.85rem;
                        transition: all 0.2s;
                    ">
                        🐛 Report Bug
                    </a>
                    <a href="/TEAM_TASKS.html?upgrade=${encodeURIComponent(pageData.file)}" style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 12px;
                        background: rgba(0,255,136,0.1);
                        border: 1px solid #00ff88;
                        border-radius: 8px;
                        color: #00ff88;
                        text-decoration: none;
                        font-size: 0.85rem;
                        transition: all 0.2s;
                    ">
                        ⚡ Request Upgrade
                    </a>
                    <a href="/BETA_TESTER_START.html" style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 12px;
                        background: rgba(243,156,18,0.1);
                        border: 1px solid #f39c12;
                        border-radius: 8px;
                        color: #f39c12;
                        text-decoration: none;
                        font-size: 0.85rem;
                        transition: all 0.2s;
                    ">
                        🧪 Beta Test Guide
                    </a>
                    <a href="/PAGE_STATUS_DASHBOARD.html" style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 12px;
                        background: rgba(0,170,255,0.1);
                        border: 1px solid #00aaff;
                        border-radius: 8px;
                        color: #00aaff;
                        text-decoration: none;
                        font-size: 0.85rem;
                        transition: all 0.2s;
                    ">
                        📊 All Pages Status
                    </a>
                </div>

                <!-- Quick Info -->
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #333; font-size: 0.7rem; color: #666; text-align: center;">
                    File: ${pageData.file}
                </div>
            </div>
        </div>
    `;

    // Inject widget
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Toggle functionality
    const toggle = document.getElementById('puw-toggle');
    const panel = document.getElementById('puw-panel');

    toggle.addEventListener('click', function() {
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';
        toggle.style.background = isVisible
            ? 'linear-gradient(135deg, #0a0a12, #1a1a2e)'
            : 'linear-gradient(135deg, #00ff88, #00aa66)';
        toggle.style.color = isVisible ? '#00ff88' : '#000';
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#page-upgrade-widget')) {
            panel.style.display = 'none';
            toggle.style.background = 'linear-gradient(135deg, #0a0a12, #1a1a2e)';
            toggle.style.color = '#00ff88';
        }
    });

    // Log page view for analytics
    if (typeof fetch !== 'undefined') {
        fetch('/api/page-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page: pageData.file,
                timestamp: new Date().toISOString(),
                action: 'view'
            })
        }).catch(() => {}); // Silent fail
    }
})();
