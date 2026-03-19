// RootIB: RB-20260319142113-8C0086D2
/**
 * DASHBOARD EDIT MODE - Drop-in editing for any dashboard
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Usage: Add this script to any dashboard, then call:
 *   DashboardEditMode.init({ dashboardId: 'COMMANDER_COCKPIT' });
 *
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 */

const DashboardEditMode = (function() {
    'use strict';

    const API_URL = '/.netlify/functions/dashboard-edit';
    let config = {
        dashboardId: null,
        editorId: null,
        editableSelectors: ['.editable', '[data-editable]', '.card-title', '.metric-value', '.section-title'],
        autoSave: false,
        autoSaveDelay: 3000
    };
    let isEditing = false;
    let originalContent = {};
    let autoSaveTimer = null;

    // Generate or retrieve editor ID
    function getEditorId() {
        let id = localStorage.getItem('dashboard_editor_id');
        if (!id) {
            id = 'editor_' + crypto.randomUUID();
            localStorage.setItem('dashboard_editor_id', id);
        }
        return id;
    }

    // Create edit mode UI
    function createUI() {
        // Check if UI already exists
        if (document.getElementById('dashboard-edit-controls')) return;

        const controls = document.createElement('div');
        controls.id = 'dashboard-edit-controls';
        controls.innerHTML = `
            <style>
                #dashboard-edit-controls {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 99999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                .edit-btn {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-left: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .edit-btn:hover { transform: translateY(-2px); }
                .edit-btn.primary { background: #ffd700; color: #000; }
                .edit-btn.success { background: #00ff88; color: #000; }
                .edit-btn.danger { background: #ff4444; color: #fff; }
                .edit-btn.secondary { background: #333; color: #fff; border: 1px solid #555; }
                .edit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

                .edit-mode-active [data-editable],
                .edit-mode-active .editable {
                    outline: 2px dashed rgba(255, 215, 0, 0.5) !important;
                    outline-offset: 2px;
                    min-height: 20px;
                }
                .edit-mode-active [data-editable]:hover,
                .edit-mode-active .editable:hover {
                    outline-color: #ffd700 !important;
                    background: rgba(255, 215, 0, 0.05);
                }
                .edit-mode-active [data-editable]:focus,
                .edit-mode-active .editable:focus {
                    outline-color: #00ff88 !important;
                    outline-style: solid !important;
                    background: rgba(0, 255, 136, 0.05);
                }

                #edit-status {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 16px;
                    background: #222;
                    color: #ffd700;
                    border-radius: 6px;
                    font-size: 13px;
                    z-index: 99999;
                    display: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                #edit-status.show { display: block; }
                #edit-status.success { background: #00ff88; color: #000; }
                #edit-status.error { background: #ff4444; color: #fff; }
            </style>

            <div id="edit-status"></div>

            <div id="edit-buttons">
                <button class="edit-btn primary" id="btn-edit" title="Edit Dashboard">
                    ✏️ Edit
                </button>
                <button class="edit-btn success" id="btn-save" style="display:none" title="Save Changes">
                    💾 Save
                </button>
                <button class="edit-btn danger" id="btn-cancel" style="display:none" title="Cancel Editing">
                    ✖ Cancel
                </button>
            </div>
        `;

        document.body.appendChild(controls);

        // Event listeners
        document.getElementById('btn-edit').addEventListener('click', enterEditMode);
        document.getElementById('btn-save').addEventListener('click', saveChanges);
        document.getElementById('btn-cancel').addEventListener('click', cancelEdit);
    }

    // Enter edit mode
    function enterEditMode() {
        isEditing = true;
        document.body.classList.add('edit-mode-active');

        // Store original content and make editable
        const editables = document.querySelectorAll(config.editableSelectors.join(','));
        editables.forEach((el, i) => {
            const key = el.dataset.editKey || `element_${i}`;
            originalContent[key] = el.innerHTML;
            el.contentEditable = 'true';
            el.dataset.editKey = key;
        });

        // Toggle buttons
        document.getElementById('btn-edit').style.display = 'none';
        document.getElementById('btn-save').style.display = 'inline-block';
        document.getElementById('btn-cancel').style.display = 'inline-block';

        showStatus('Edit mode active - click any highlighted area to edit', 'info');

        // Auto-save if enabled
        if (config.autoSave) {
            editables.forEach(el => {
                el.addEventListener('input', scheduleAutoSave);
            });
        }
    }

    // Exit edit mode
    function exitEditMode() {
        isEditing = false;
        document.body.classList.remove('edit-mode-active');

        // Remove contenteditable
        const editables = document.querySelectorAll('[contenteditable="true"]');
        editables.forEach(el => {
            el.contentEditable = 'false';
        });

        // Toggle buttons
        document.getElementById('btn-edit').style.display = 'inline-block';
        document.getElementById('btn-save').style.display = 'none';
        document.getElementById('btn-cancel').style.display = 'none';

        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = null;
        }
    }

    // Cancel editing and restore original content
    function cancelEdit() {
        Object.keys(originalContent).forEach(key => {
            const el = document.querySelector(`[data-edit-key="${key}"]`);
            if (el) el.innerHTML = originalContent[key];
        });
        originalContent = {};
        exitEditMode();
        showStatus('Changes discarded', 'info');
    }

    // Collect all changes
    function collectChanges() {
        const changes = [];
        const editables = document.querySelectorAll('[data-edit-key]');

        editables.forEach(el => {
            const key = el.dataset.editKey;
            const newContent = el.innerHTML;
            const oldContent = originalContent[key];

            if (newContent !== oldContent) {
                changes.push({
                    key: key,
                    selector: getSelector(el),
                    oldContent: oldContent,
                    newContent: newContent
                });
            }
        });

        return changes;
    }

    // Get CSS selector for element
    function getSelector(el) {
        if (el.id) return '#' + el.id;
        if (el.className) return '.' + el.className.split(' ').join('.');
        return el.tagName.toLowerCase();
    }

    // Save changes
    async function saveChanges() {
        const changes = collectChanges();

        if (changes.length === 0) {
            showStatus('No changes to save', 'info');
            exitEditMode();
            return;
        }

        showStatus('Saving...', 'info');
        document.getElementById('btn-save').disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'edit',
                    dashboardId: config.dashboardId,
                    editorId: config.editorId,
                    changes: changes,
                    timestamp: new Date().toISOString()
                })
            });

            const result = await response.json();

            if (result.success) {
                showStatus(`✓ Saved ${changes.length} change(s)`, 'success');
                originalContent = {}; // Clear since we saved
                exitEditMode();
            } else if (result.status === 'pending') {
                showStatus('Changes submitted for approval', 'success');
                exitEditMode();
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (err) {
            showStatus('Error: ' + err.message, 'error');
            document.getElementById('btn-save').disabled = false;
        }
    }

    // Schedule auto-save
    function scheduleAutoSave() {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            showStatus('Auto-saving...', 'info');
            saveChanges();
        }, config.autoSaveDelay);
    }

    // Show status message
    function showStatus(message, type = 'info') {
        const status = document.getElementById('edit-status');
        status.textContent = message;
        status.className = 'show ' + type;

        if (type !== 'info') {
            setTimeout(() => {
                status.classList.remove('show');
            }, 3000);
        }
    }

    // Initialize
    function init(options = {}) {
        config = { ...config, ...options };
        config.editorId = config.editorId || getEditorId();

        // Auto-detect dashboard ID from DNA
        if (!config.dashboardId) {
            const dna = document.getElementById('dashboard-dna');
            if (dna) {
                try {
                    const data = JSON.parse(dna.textContent);
                    config.dashboardId = data.name?.replace(/\s+/g, '_').toUpperCase() || 'UNKNOWN';
                } catch(e) {}
            }
        }

        // Fallback to page title or URL
        if (!config.dashboardId) {
            config.dashboardId = document.title.split('|')[0].trim().replace(/\s+/g, '_').toUpperCase();
        }

        createUI();
        console.log('[DashboardEditMode] Initialized for:', config.dashboardId);
    }

    return {
        init,
        enterEditMode,
        exitEditMode,
        saveChanges,
        cancelEdit,
        isEditing: () => isEditing
    };
})();

// Auto-init if data attribute present
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.dashboardEdit !== undefined) {
        DashboardEditMode.init({
            dashboardId: document.body.dataset.dashboardId
        });
    }
});
