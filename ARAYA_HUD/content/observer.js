// ARAYA HUD - Page Observer
// Watches user actions and extracts relevant data

(function() {
    'use strict';

    // Send page data to side panel on load
    function sendPageData() {
        chrome.runtime.sendMessage({
            type: 'PAGE_DATA',
            url: window.location.href,
            title: document.title,
            meta: {
                description: document.querySelector('meta[name="description"]')?.content || '',
                keywords: document.querySelector('meta[name="keywords"]')?.content || ''
            }
        });
    }

    // Detect forms being filled
    function observeForms() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                console.log('[ARAYA] Form submitted:', form.action);
            });
        });
    }

    // Extract structured data from page
    function extractPageData() {
        const data = {
            url: window.location.href,
            title: document.title,
            text: '',
            links: [],
            images: []
        };

        const article = document.querySelector('article') || document.querySelector('main') || document.body;
        data.text = article.innerText.substring(0, 5000);

        document.querySelectorAll('a[href]').forEach(a => {
            if (a.href && !a.href.startsWith('javascript:')) {
                data.links.push({
                    href: a.href,
                    text: a.innerText.trim().substring(0, 100)
                });
            }
        });
        data.links = data.links.slice(0, 20);

        document.querySelectorAll('img[src]').forEach(img => {
            if (img.src && img.width > 100) {
                data.images.push({ src: img.src, alt: img.alt });
            }
        });
        data.images = data.images.slice(0, 10);

        return data;
    }

    // Listen for commands from extension
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'EXTRACT_PAGE') {
            sendResponse(extractPageData());
        }

        if (message.type === 'CAPTURE_SELECTION') {
            sendResponse({ selection: window.getSelection().toString() });
        }
    });

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            sendPageData();
            observeForms();
        });
    } else {
        sendPageData();
        observeForms();
    }

    console.log('[ARAYA] Observer active on:', window.location.hostname);
})();
