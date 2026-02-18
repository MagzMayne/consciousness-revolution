/**
 * NOTES WIDGET - Quick Note Taking
 * Simple notepad that saves to localStorage.
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'consciousness_dashboard_notes';
    let container = null;

    /**
     * Render the notes widget
     */
    function render(targetContainer) {
        container = targetContainer;
        if (!container) return;

        const savedNotes = localStorage.getItem(STORAGE_KEY) || '';

        container.innerHTML = `
            <div style="height: 100%;">
                <textarea id="notes-textarea" placeholder="Quick notes..." style="
                    width: 100%;
                    height: calc(100% - 10px);
                    min-height: 80px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px;
                    padding: 10px;
                    color: #fff;
                    font-family: inherit;
                    font-size: 0.9em;
                    resize: none;
                    outline: none;
                ">${savedNotes}</textarea>
            </div>
        `;

        // Auto-save on input
        const textarea = container.querySelector('#notes-textarea');
        if (textarea) {
            textarea.addEventListener('input', () => {
                localStorage.setItem(STORAGE_KEY, textarea.value);
            });

            // Focus styling
            textarea.addEventListener('focus', () => {
                textarea.style.borderColor = '#00ffaa';
            });
            textarea.addEventListener('blur', () => {
                textarea.style.borderColor = 'rgba(255,255,255,0.1)';
            });
        }
    }

    /**
     * Get current notes
     */
    function getNotes() {
        return localStorage.getItem(STORAGE_KEY) || '';
    }

    /**
     * Set notes
     */
    function setNotes(text) {
        localStorage.setItem(STORAGE_KEY, text);
        const textarea = document.getElementById('notes-textarea');
        if (textarea) {
            textarea.value = text;
        }
    }

    /**
     * Clear notes
     */
    function clear() {
        localStorage.removeItem(STORAGE_KEY);
        const textarea = document.getElementById('notes-textarea');
        if (textarea) {
            textarea.value = '';
        }
    }

    // Public API
    window.NotesWidget = {
        render,
        getNotes,
        setNotes,
        clear
    };

    // Register with widget library if available
    if (window.WidgetLibrary) {
        window.WidgetLibrary.register({
            id: 'quick-notes',
            name: 'Quick Notes',
            icon: '📝',
            size: 'MEDIUM',
            category: 'ACTIONS',
            description: 'Jot down quick notes',
            render: function(container) {
                window.NotesWidget.render(container);
            }
        });
    }

    console.log('📝 Notes Widget loaded');
})();
