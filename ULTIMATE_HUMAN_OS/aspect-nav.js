/**
 * Ultimate Human OS - Aspect Page Navigation
 * Auto-resolves prev/next links based on current URL path.
 * Expects: /ULTIMATE_HUMAN_OS/LEVEL_1_FOUNDATION/{DOMAIN}/{ASPECT}/index.html
 */
(function() {
    var domains = [
        { folder: '1_CLARITY', name: 'Clarity', aspects: ['1_MORNING','2_DECISION','3_PRIORITY','4_TIME','5_ENERGY','6_PROGRESS','7_DASHBOARD'] },
        { folder: '2_CREATION', name: 'Creation', aspects: ['1_IDEAS','2_PROJECT','3_SKILLS','4_AI','5_SYSTEMS','6_FINISHING','7_PORTFOLIO'] },
        { folder: '3_RELATIONSHIPS', name: 'Relationships', aspects: ['1_INNER_CIRCLE','2_NEW_PEOPLE','3_COMMUNICATION','4_CONFLICT','5_BOUNDARIES','6_COMMUNITY','7_NETWORK'] },
        { folder: '4_PEACE', name: 'Peace', aspects: ['1_SHIELD','2_DIGITAL','3_LEGAL','4_FINANCIAL','5_PHYSICAL','6_EMOTION','7_PRACTICES'] },
        { folder: '5_ABUNDANCE', name: 'Abundance', aspects: ['1_MONEY','2_INCOME','3_BUSINESS','4_INVESTING','5_SCALING','6_PASSIVE','7_MINDSET'] },
        { folder: '6_WISDOM', name: 'Wisdom', aspects: ['1_PATTERNS','2_RESEARCH','3_CRITICAL','4_LEARNING','5_MODELS','6_DECISIONS','7_TEACHING'] },
        { folder: '7_PURPOSE', name: 'Purpose', aspects: ['1_MORNING','2_MEDITATION','3_MEANING','4_LEGACY','5_INTUITION','6_SERVICE','7_INTEGRATION'] }
    ];

    // Build flat list of all 49 pages
    var pages = [];
    for (var d = 0; d < domains.length; d++) {
        for (var a = 0; a < domains[d].aspects.length; a++) {
            pages.push({
                domain: domains[d].folder,
                domainName: domains[d].name,
                aspect: domains[d].aspects[a],
                path: '/ULTIMATE_HUMAN_OS/LEVEL_1_FOUNDATION/' + domains[d].folder + '/' + domains[d].aspects[a] + '/'
            });
        }
    }

    // Find current page
    var path = window.location.pathname.replace(/\\/g, '/').replace(/index\.html$/, '');
    if (path.charAt(path.length - 1) !== '/') path += '/';

    var currentIndex = -1;
    for (var i = 0; i < pages.length; i++) {
        if (path.indexOf(pages[i].domain + '/' + pages[i].aspect) !== -1) {
            currentIndex = i;
            break;
        }
    }

    if (currentIndex === -1) return;

    var prevLink = document.getElementById('prevLink');
    var nextLink = document.getElementById('nextLink');

    if (prevLink) {
        if (currentIndex > 0) {
            var prev = pages[currentIndex - 1];
            var label = prev.aspect.replace(/^\d+_/, '').replace(/_/g, ' ');
            if (prev.domain !== pages[currentIndex].domain) {
                label = prev.domainName + ': ' + label;
            }
            prevLink.href = prev.path;
            prevLink.innerHTML = '&larr; ' + label;
        } else {
            prevLink.classList.add('disabled');
            prevLink.removeAttribute('href');
            prevLink.style.pointerEvents = 'none';
        }
    }

    if (nextLink) {
        if (currentIndex < pages.length - 1) {
            var next = pages[currentIndex + 1];
            var label2 = next.aspect.replace(/^\d+_/, '').replace(/_/g, ' ');
            if (next.domain !== pages[currentIndex].domain) {
                label2 = next.domainName + ': ' + label2;
            }
            nextLink.href = next.path;
            nextLink.innerHTML = label2 + ' &rarr;';
        } else {
            nextLink.classList.add('disabled');
            nextLink.removeAttribute('href');
            nextLink.style.pointerEvents = 'none';
        }
    }
})();
