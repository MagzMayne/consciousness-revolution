/**
 * Ultimate Human OS - Tier Gate System
 * Controls tool access based on subscription tier.
 * Tier stored in localStorage as 'uhos_tier'.
 * Values: ghost (free), seedling ($9), sapling ($29), tree ($99), forest ($299)
 */
(function() {
    var validTiers = ['ghost', 'seedling', 'sapling', 'tree', 'forest'];
    var raw = localStorage.getItem('uhos_tier') || 'ghost';
    var tier = validTiers.indexOf(raw) !== -1 ? raw : 'ghost';
    var path = window.location.pathname.replace(/\\/g, '/');

    // PEACE domain is always fully free
    if (path.indexOf('4_PEACE') !== -1) return;

    // Only gate for free users
    if (tier !== 'ghost') return;

    var standardTools = document.querySelectorAll('.tool-item:not(.featured)');
    if (!standardTools.length) return;

    standardTools.forEach(function(tool) {
        tool.classList.add('tier-locked');
        var lock = document.createElement('span');
        lock.className = 'lock-badge';
        lock.textContent = '\uD83D\uDD12';
        tool.appendChild(lock);

        var sub = tool.querySelector('.tool-subtitle');
        if (sub) sub.setAttribute('data-original', sub.textContent);
        if (sub) sub.textContent = 'Upgrade to unlock';

        tool.addEventListener('click', function(e) {
            e.preventDefault();
            showUpgradeModal();
        });
    });

    // Insert upgrade banner after tool grid
    var grid = document.querySelector('.tool-grid');
    if (grid) {
        var banner = document.createElement('div');
        banner.className = 'tier-upgrade-banner';
        banner.innerHTML = '<span class="banner-lock">\uD83D\uDD12</span> ' +
            '<span>3 premium tools locked</span> ' +
            '<a href="/ULTIMATE_HUMAN_OS/pricing.html" class="banner-link">Upgrade to unlock all tools \u2192</a>';
        grid.parentNode.insertBefore(banner, grid.nextSibling);
    }

    function showUpgradeModal() {
        if (document.getElementById('tier-modal')) return;
        var overlay = document.createElement('div');
        overlay.id = 'tier-modal';
        overlay.className = 'tier-modal-overlay';
        overlay.innerHTML =
            '<div class="tier-modal">' +
                '<button class="tier-modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>' +
                '<div class="tier-modal-icon">\uD83D\uDD13</div>' +
                '<h3>Unlock All Tools</h3>' +
                '<p>Choose your tier to access tools across 7 domains.</p>' +
                '<div class="tier-options">' +
                    '<div class="tier-option">' +
                        '<div class="tier-name">\uD83C\uDF31 Seedling</div>' +
                        '<div class="tier-price">$9</div>' +
                        '<div class="tier-desc">2 domains \u00b7 98 tools</div>' +
                    '</div>' +
                    '<div class="tier-option">' +
                        '<div class="tier-name">\uD83C\uDF3F Sapling</div>' +
                        '<div class="tier-price">$29</div>' +
                        '<div class="tier-desc">5 domains \u00b7 147 tools</div>' +
                    '</div>' +
                    '<div class="tier-option">' +
                        '<div class="tier-name">\uD83C\uDF33 Tree</div>' +
                        '<div class="tier-price">$99</div>' +
                        '<div class="tier-desc">6 domains \u00b7 210 tools</div>' +
                    '</div>' +
                    '<div class="tier-option">' +
                        '<div class="tier-name">\uD83C\uDF32 Forest</div>' +
                        '<div class="tier-price">$299</div>' +
                        '<div class="tier-desc">ALL 7 domains \u00b7 245 tools</div>' +
                    '</div>' +
                '</div>' +
                '<a href="/ULTIMATE_HUMAN_OS/pricing.html" class="tier-btn" style="display:inline-block;margin-top:15px;">See All Plans</a>' +
                '<p class="tier-note">PEACE domain tools are always free</p>' +
            '</div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
    }
})();
