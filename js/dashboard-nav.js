// RootIB: RB-20260319142113-44974C86
/**
 * DASHBOARD NAVIGATION COMPONENT
 * Add this to any dashboard for unified navigation
 * 
 * Usage: <script src="js/dashboard-nav.js"></script>
 *        Then call: initDashboardNav();
 */

function initDashboardNav(options = {}) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Navigation items
    const navItems = [
        { name: 'WORKSPACE', url: 'WORKSPACE.html', icon: '🏠', shortcut: 'W' },
        { name: 'Commander', url: 'OPERATOR_COCKPIT_COMMANDER.html', icon: '👑', shortcut: '1' },
        { name: 'Tiger', url: 'OPERATOR_COCKPIT_TIGER.html', icon: '🐯', shortcut: '2' },
        { name: 'Teddy', url: 'OPERATOR_COCKPIT_TEDDY.html', icon: '🧸', shortcut: '3' },
        { name: 'ARAYA', url: 'araya-chat.html', icon: '💬', shortcut: 'A' },
        { name: '7 Domains', url: 'seven-domains.html', icon: '🔮', shortcut: '7' },
        { name: 'Master', url: 'MASTER_COMMAND_CENTER.html', icon: '🎛️', shortcut: 'M' },
        { name: 'Trinity', url: 'TRINITY_COMMAND_DASHBOARD.html', icon: '🔺', shortcut: 'R' },
        { name: 'Beta Lab', url: 'BETA_TESTER_COCKPIT.html', icon: '🧪', shortcut: 'B' },
        { name: 'Bugs', url: 'bugs.html', icon: '🐛', shortcut: null }
    ];

    // Create floating nav button
    const navButton = document.createElement('button');
    navButton.id = 'dashboard-nav-btn';
    navButton.innerHTML = '☰';
    navButton.title = 'Dashboard Navigation (Press N)';
    navButton.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        width: 45px;
        height: 45px;
        border-radius: 12px;
        border: 2px solid #0ff;
        background: rgba(0,0,0,0.9);
        color: #0ff;
        font-size: 1.5em;
        cursor: pointer;
        z-index: 9999;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    navButton.onmouseenter = () => {
        navButton.style.background = 'rgba(0,255,255,0.2)';
        navButton.style.transform = 'scale(1.1)';
    };
    navButton.onmouseleave = () => {
        navButton.style.background = 'rgba(0,0,0,0.9)';
        navButton.style.transform = 'scale(1)';
    };

    // Create nav panel
    const navPanel = document.createElement('div');
    navPanel.id = 'dashboard-nav-panel';
    navPanel.style.cssText = `
        position: fixed;
        top: 70px;
        right: 15px;
        width: 280px;
        max-height: 80vh;
        background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.98));
        border: 2px solid #0ff;
        border-radius: 16px;
        padding: 15px;
        z-index: 9998;
        display: none;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0,255,255,0.3);
    `;

    // Panel header
    navPanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid rgba(0,255,255,0.3);">
            <span style="font-family:'Orbitron',sans-serif; color:#0ff; font-weight:700;">NAVIGATE</span>
            <span style="color:#666; font-size:0.8em;">Press N to toggle</span>
        </div>
    `;

    // Add nav items
    const itemsContainer = document.createElement('div');
    navItems.forEach(item => {
        const isActive = currentPage === item.url;
        const navItem = document.createElement('a');
        navItem.href = item.url;
        navItem.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 10px;
            text-decoration: none;
            color: ${isActive ? '#0ff' : '#fff'};
            background: ${isActive ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.05)'};
            border: 1px solid ${isActive ? '#0ff' : 'transparent'};
            transition: all 0.2s;
        `;
        navItem.onmouseenter = () => {
            if (!isActive) {
                navItem.style.background = 'rgba(0,255,255,0.1)';
                navItem.style.borderColor = 'rgba(0,255,255,0.5)';
            }
        };
        navItem.onmouseleave = () => {
            if (!isActive) {
                navItem.style.background = 'rgba(255,255,255,0.05)';
                navItem.style.borderColor = 'transparent';
            }
        };

        navItem.innerHTML = `
            <span style="font-size:1.3em;">${item.icon}</span>
            <span style="flex:1; font-weight:500;">${item.name}</span>
            ${item.shortcut ? `<span style="background:rgba(0,255,255,0.2); color:#0ff; padding:2px 8px; border-radius:4px; font-size:0.75em; font-family:monospace;">${item.shortcut}</span>` : ''}
        `;
        itemsContainer.appendChild(navItem);
    });
    navPanel.appendChild(itemsContainer);

    // Add home link at bottom
    const homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.style.cssText = `
        display: block;
        text-align: center;
        padding: 12px;
        margin-top: 15px;
        border-top: 1px solid rgba(0,255,255,0.3);
        color: #666;
        text-decoration: none;
        font-size: 0.85em;
        transition: color 0.2s;
    `;
    homeLink.innerHTML = '← Back to Landing';
    homeLink.onmouseenter = () => homeLink.style.color = '#0ff';
    homeLink.onmouseleave = () => homeLink.style.color = '#666';
    navPanel.appendChild(homeLink);

    // Toggle function
    function toggleNav() {
        const isVisible = navPanel.style.display === 'block';
        navPanel.style.display = isVisible ? 'none' : 'block';
        navButton.innerHTML = isVisible ? '☰' : '✕';
    }

    // Events
    navButton.onclick = toggleNav;
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if typing
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key.toLowerCase() === 'n') {
            toggleNav();
            return;
        }

        if (e.key === 'Escape') {
            navPanel.style.display = 'none';
            navButton.innerHTML = '☰';
            return;
        }

        // Check shortcuts
        const item = navItems.find(i => i.shortcut && i.shortcut.toLowerCase() === e.key.toLowerCase());
        if (item && currentPage !== item.url) {
            window.location.href = item.url;
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navPanel.contains(e.target) && e.target !== navButton) {
            navPanel.style.display = 'none';
            navButton.innerHTML = '☰';
        }
    });

    // Append to body
    document.body.appendChild(navButton);
    document.body.appendChild(navPanel);

    console.log('Dashboard Nav initialized. Press N to toggle navigation.');
}

// Auto-init if not in module
if (typeof window !== 'undefined') {
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initDashboardNav());
    } else {
        // DOM already ready, init after a tick
        setTimeout(() => initDashboardNav(), 100);
    }
}

// Export
window.initDashboardNav = initDashboardNav;
