// RootIB: RB-20260319142113-E94184D6
/**
 * GLYPH WIDGET - Embeddable Pattern Detection
 * Version: 1.0.0
 *
 * Drop-in widget for real-time text analysis.
 * Can be added to any page: GLYPH.widget.create('#container')
 */

const GlyphWidget = (function() {
    'use strict';

    const STYLES = `
        .glyph-widget {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0a0a0f, #12121a);
            border: 1px solid #333;
            border-radius: 12px;
            padding: 15px;
            color: #e0e0e0;
            max-width: 400px;
        }

        .glyph-widget * { box-sizing: border-box; }

        .glyph-widget-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #333;
        }

        .glyph-widget-title {
            font-size: 0.9em;
            color: #ffd700;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .glyph-widget-score {
            font-size: 1.5em;
            font-weight: bold;
        }

        .glyph-widget-score.high { color: #00ff88; }
        .glyph-widget-score.medium { color: #ffd700; }
        .glyph-widget-score.low { color: #ff4444; }

        .glyph-widget-bar {
            height: 8px;
            background: #1a1a25;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }

        .glyph-widget-fill {
            height: 100%;
            transition: width 0.3s, background 0.3s;
            border-radius: 4px;
        }

        .glyph-widget-fill.truth { background: linear-gradient(90deg, #00ff88, #00cc66); }
        .glyph-widget-fill.deceit { background: linear-gradient(90deg, #ff4444, #cc0000); }

        .glyph-widget-notation {
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            padding: 8px;
            background: #1a1a25;
            border-radius: 4px;
            text-align: center;
            color: #ffd700;
            margin: 10px 0;
        }

        .glyph-widget-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.85em;
            margin: 5px 0;
        }

        .glyph-widget-label { color: #888; }
        .glyph-widget-value { color: #e0e0e0; }

        .glyph-widget-alert {
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid #ff4444;
            border-radius: 6px;
            padding: 10px;
            margin-top: 10px;
            font-size: 0.85em;
        }

        .glyph-widget-alert-title {
            color: #ff4444;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .glyph-widget-pattern {
            display: inline-block;
            padding: 3px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 0.8em;
        }

        .glyph-widget-pattern.truth {
            background: rgba(0, 255, 136, 0.15);
            border: 1px solid #00ff88;
            color: #00ff88;
        }

        .glyph-widget-pattern.deceit {
            background: rgba(255, 68, 68, 0.15);
            border: 1px solid #ff4444;
            color: #ff4444;
        }

        .glyph-widget-freq {
            text-align: center;
            margin-top: 10px;
            padding: 10px;
            background: #1a1a25;
            border-radius: 6px;
        }

        .glyph-widget-freq-hz {
            font-size: 1.3em;
            font-weight: bold;
            color: #ffd700;
        }

        .glyph-widget-freq-name {
            font-size: 0.8em;
            color: #888;
        }
    `;

    let styleInjected = false;

    function injectStyles() {
        if (styleInjected) return;
        const style = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);
        styleInjected = true;
    }

    /**
     * Create a GLYPH analysis widget
     * @param {HTMLElement|string} container - Container element or selector
     * @param {Object} options - Widget options
     */
    function create(container, options = {}) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (!container) {
            console.error('GLYPH Widget: Container not found');
            return null;
        }

        injectStyles();

        const widget = document.createElement('div');
        widget.className = 'glyph-widget';
        widget.innerHTML = `
            <div class="glyph-widget-header">
                <span class="glyph-widget-title">\u27D0 GLYPH Analysis</span>
                <span class="glyph-widget-score" id="glyph-score">--</span>
            </div>
            <div class="glyph-widget-bar">
                <div class="glyph-widget-fill truth" id="glyph-bar" style="width: 0%"></div>
            </div>
            <div class="glyph-widget-notation" id="glyph-notation">\u27D0 Awaiting input \u27D0</div>
            <div class="glyph-widget-row">
                <span class="glyph-widget-label">Truth Score</span>
                <span class="glyph-widget-value" id="glyph-truth">--%</span>
            </div>
            <div class="glyph-widget-row">
                <span class="glyph-widget-label">Deceit Score</span>
                <span class="glyph-widget-value" id="glyph-deceit">--%</span>
            </div>
            <div class="glyph-widget-row">
                <span class="glyph-widget-label">Confidence</span>
                <span class="glyph-widget-value" id="glyph-confidence">--%</span>
            </div>
            <div id="glyph-patterns"></div>
            <div id="glyph-alerts"></div>
            <div class="glyph-widget-freq">
                <div class="glyph-widget-freq-hz" id="glyph-freq">--- Hz</div>
                <div class="glyph-widget-freq-name" id="glyph-freq-name">Waiting...</div>
            </div>
        `;

        container.appendChild(widget);

        // Return widget API
        return {
            element: widget,
            analyze: function(text) {
                return updateWidget(widget, text);
            },
            clear: function() {
                clearWidget(widget);
            }
        };
    }

    /**
     * Update widget with analysis results
     */
    function updateWidget(widget, text) {
        if (!text || text.length < 5) {
            clearWidget(widget);
            return null;
        }

        // Check if GLYPH modules are loaded
        if (typeof GlyphPatterns === 'undefined') {
            console.error('GLYPH Widget: GlyphPatterns not loaded');
            return null;
        }

        const analysis = GlyphPatterns.analyze(text);
        const consciousness = GlyphPatterns.getConsciousnessLevel(analysis.scores.truth);

        // Update score
        const scoreEl = widget.querySelector('#glyph-score');
        scoreEl.textContent = analysis.scores.truth + '%';
        scoreEl.className = 'glyph-widget-score ' +
            (analysis.scores.truth >= 70 ? 'high' :
             analysis.scores.truth >= 40 ? 'medium' : 'low');

        // Update bar
        const barEl = widget.querySelector('#glyph-bar');
        barEl.style.width = analysis.scores.truth + '%';
        barEl.className = 'glyph-widget-fill ' +
            (analysis.dominant === 'truth' ? 'truth' : 'deceit');

        // Update notation
        widget.querySelector('#glyph-notation').textContent = analysis.glyphNotation;

        // Update metrics
        widget.querySelector('#glyph-truth').textContent = analysis.scores.truth + '%';
        widget.querySelector('#glyph-deceit').textContent = analysis.scores.deceit + '%';
        widget.querySelector('#glyph-confidence').textContent = analysis.confidence + '%';

        // Update frequency
        const freqInfo = typeof GlyphBase60 !== 'undefined' ?
            GlyphBase60.frequency.SOLFEGGIO[analysis.frequency] || { name: 'Unknown' } :
            { name: 'Unknown' };

        widget.querySelector('#glyph-freq').textContent = analysis.frequency + ' Hz';
        widget.querySelector('#glyph-freq-name').textContent = freqInfo.name + ' Frequency';

        // Update patterns
        const patternsEl = widget.querySelector('#glyph-patterns');
        let patternsHtml = '';

        if (analysis.patterns.truth.length > 0) {
            patternsHtml += analysis.patterns.truth.slice(0, 3).map(p =>
                `<span class="glyph-widget-pattern truth">\u2713 ${p.marker}</span>`
            ).join('');
        }

        if (analysis.patterns.deceit.length > 0) {
            patternsHtml += analysis.patterns.deceit.slice(0, 3).map(p =>
                `<span class="glyph-widget-pattern deceit">\u2717 ${p.marker}</span>`
            ).join('');
        }

        patternsEl.innerHTML = patternsHtml;

        // Update alerts
        const alertsEl = widget.querySelector('#glyph-alerts');
        if (analysis.patterns.manipulation.length > 0) {
            alertsEl.innerHTML = `
                <div class="glyph-widget-alert">
                    <div class="glyph-widget-alert-title">\u26A0 Manipulation Detected</div>
                    ${analysis.patterns.manipulation.map(m =>
                        `<div>${m.type.toUpperCase()}: ${m.description}</div>`
                    ).join('')}
                </div>
            `;
        } else {
            alertsEl.innerHTML = '';
        }

        return analysis;
    }

    /**
     * Clear widget to default state
     */
    function clearWidget(widget) {
        widget.querySelector('#glyph-score').textContent = '--';
        widget.querySelector('#glyph-score').className = 'glyph-widget-score';
        widget.querySelector('#glyph-bar').style.width = '0%';
        widget.querySelector('#glyph-notation').textContent = '\u27D0 Awaiting input \u27D0';
        widget.querySelector('#glyph-truth').textContent = '--%';
        widget.querySelector('#glyph-deceit').textContent = '--%';
        widget.querySelector('#glyph-confidence').textContent = '--%';
        widget.querySelector('#glyph-freq').textContent = '--- Hz';
        widget.querySelector('#glyph-freq-name').textContent = 'Waiting...';
        widget.querySelector('#glyph-patterns').innerHTML = '';
        widget.querySelector('#glyph-alerts').innerHTML = '';
    }

    /**
     * Create a floating popup widget
     */
    function createPopup(options = {}) {
        injectStyles();

        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        `;

        const widgetAPI = create(popup, options);
        document.body.appendChild(popup);

        return {
            ...widgetAPI,
            show: function() { popup.style.display = 'block'; },
            hide: function() { popup.style.display = 'none'; },
            toggle: function() {
                popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
            },
            destroy: function() { popup.remove(); }
        };
    }

    /**
     * Auto-attach to text inputs on page
     */
    function autoAttach(selector = 'textarea, input[type="text"]', container) {
        const elements = document.querySelectorAll(selector);
        const widgets = [];

        elements.forEach(el => {
            const targetContainer = container || el.parentElement;
            const widget = create(targetContainer);

            if (widget) {
                const debounce = (fn, wait) => {
                    let timeout;
                    return (...args) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => fn(...args), wait);
                    };
                };

                el.addEventListener('input', debounce(() => {
                    widget.analyze(el.value);
                }, 200));

                widgets.push({ element: el, widget });
            }
        });

        return widgets;
    }

    // Public API
    return {
        VERSION: '1.0.0',
        create,
        createPopup,
        autoAttach,
        updateWidget,
        clearWidget
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlyphWidget;
}
if (typeof window !== 'undefined') {
    window.GlyphWidget = GlyphWidget;
    // Add to GLYPH namespace if available
    if (typeof GlyphCore !== 'undefined') {
        GlyphCore.widget = GlyphWidget;
    }
}
