/**
 * WIDGET SYSTEM - Phone Home Screen Metaphor
 * Everything is a widget. Drag, drop, resize, customize.
 *
 * Sizes: TINY (1x1), SMALL (2x1), MEDIUM (2x2), LARGE (4x2), FULL (4x4)
 * Categories: STATUS, METRICS, ACTIONS, LISTS, CHARTS, FEEDS, CONTROLS
 */

class WidgetSystem {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.widgets = new Map();
        this.gridCols = options.gridCols || 4;
        this.gridRows = options.gridRows || 4;
        this.cellSize = options.cellSize || 120;
        this.gap = options.gap || 12;
        this.storageKey = options.storageKey || 'widget-layout';
        this.onWidgetClick = options.onWidgetClick || null;

        this.init();
    }

    init() {
        this.container.classList.add('widget-grid');
        this.container.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${this.gridCols}, ${this.cellSize}px);
            grid-template-rows: repeat(${this.gridRows}, ${this.cellSize}px);
            gap: ${this.gap}px;
            padding: ${this.gap}px;
        `;

        this.loadLayout();
        this.setupDragDrop();
    }

    // Widget size definitions
    static SIZES = {
        TINY: { cols: 1, rows: 1 },
        SMALL: { cols: 2, rows: 1 },
        MEDIUM: { cols: 2, rows: 2 },
        LARGE: { cols: 4, rows: 2 },
        FULL: { cols: 4, rows: 4 }
    };

    // Add a widget to the grid
    addWidget(config) {
        const {
            id,
            name,
            size = 'MEDIUM',
            category = 'STATUS',
            icon = '📊',
            content = '',
            dataSource = null,
            refreshRate = 0,
            position = { col: 1, row: 1 },
            onClick = null,
            render = null
        } = config;

        const sizeConfig = WidgetSystem.SIZES[size] || WidgetSystem.SIZES.MEDIUM;

        const widget = document.createElement('div');
        widget.id = `widget-${id}`;
        widget.className = `widget widget-${size.toLowerCase()} widget-${category.toLowerCase()}`;
        widget.draggable = true;
        widget.dataset.widgetId = id;
        widget.dataset.size = size;

        widget.style.cssText = `
            grid-column: span ${sizeConfig.cols};
            grid-row: span ${sizeConfig.rows};
            background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,30,0.9));
            border: 1px solid rgba(0,255,255,0.3);
            border-radius: 12px;
            padding: 12px;
            cursor: grab;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        widget.innerHTML = `
            <div class="widget-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="widget-icon" style="font-size:1.5em;">${icon}</span>
                <span class="widget-name" style="color:#0ff; font-size:0.85em; font-weight:600;">${name}</span>
                <button class="widget-menu" style="background:none; border:none; color:#666; cursor:pointer; font-size:1.2em;">⋮</button>
            </div>
            <div class="widget-content" style="flex:1; overflow:auto; color:#fff;">
                ${content}
            </div>
            <div class="widget-footer" style="font-size:0.7em; color:#666; margin-top:8px; text-align:right;">
                ${refreshRate > 0 ? `↻ ${refreshRate}s` : ''}
            </div>
        `;

        // Store widget config
        this.widgets.set(id, {
            element: widget,
            config: { id, name, size, category, icon, dataSource, refreshRate, position, render }
        });

        // Click handler
        widget.addEventListener('click', (e) => {
            if (e.target.classList.contains('widget-menu')) {
                this.showWidgetMenu(id, e);
            } else if (onClick) {
                onClick(id, this.widgets.get(id));
            } else if (this.onWidgetClick) {
                this.onWidgetClick(id, this.widgets.get(id));
            }
        });

        // Hover effects
        widget.addEventListener('mouseenter', () => {
            widget.style.borderColor = 'rgba(0,255,255,0.8)';
            widget.style.boxShadow = '0 0 20px rgba(0,255,255,0.3)';
            widget.style.transform = 'translateY(-2px)';
        });
        widget.addEventListener('mouseleave', () => {
            widget.style.borderColor = 'rgba(0,255,255,0.3)';
            widget.style.boxShadow = 'none';
            widget.style.transform = 'translateY(0)';
        });

        this.container.appendChild(widget);

        // Auto-refresh if configured
        if (refreshRate > 0 && dataSource) {
            this.startAutoRefresh(id, dataSource, refreshRate, render);
        }

        return widget;
    }

    // Remove a widget
    removeWidget(id) {
        const widget = this.widgets.get(id);
        if (widget) {
            widget.element.remove();
            this.widgets.delete(id);
            this.saveLayout();
        }
    }

    // Update widget content
    updateWidget(id, content) {
        const widget = this.widgets.get(id);
        if (widget) {
            const contentEl = widget.element.querySelector('.widget-content');
            if (contentEl) {
                contentEl.innerHTML = content;
            }
        }
    }

    // Setup drag and drop
    setupDragDrop() {
        let draggedWidget = null;

        this.container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('widget')) {
                draggedWidget = e.target;
                e.target.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        this.container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('widget')) {
                e.target.style.opacity = '1';
                draggedWidget = null;
                this.saveLayout();
            }
        });

        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.container.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedWidget && e.target !== draggedWidget) {
                const targetWidget = e.target.closest('.widget');
                if (targetWidget && targetWidget !== draggedWidget) {
                    // Swap positions
                    const parent = draggedWidget.parentNode;
                    const draggedIndex = Array.from(parent.children).indexOf(draggedWidget);
                    const targetIndex = Array.from(parent.children).indexOf(targetWidget);

                    if (draggedIndex < targetIndex) {
                        parent.insertBefore(draggedWidget, targetWidget.nextSibling);
                    } else {
                        parent.insertBefore(draggedWidget, targetWidget);
                    }
                }
            }
        });
    }

    // Show widget context menu
    showWidgetMenu(id, event) {
        event.stopPropagation();

        // Remove existing menu
        const existingMenu = document.querySelector('.widget-context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'widget-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            background: rgba(0,0,0,0.95);
            border: 1px solid #0ff;
            border-radius: 8px;
            padding: 8px 0;
            z-index: 10000;
            min-width: 150px;
        `;

        const options = [
            { label: '📏 Resize', action: () => this.resizeWidget(id) },
            { label: '🔄 Refresh', action: () => this.refreshWidget(id) },
            { label: '⚙️ Configure', action: () => this.configureWidget(id) },
            { label: '🗑️ Remove', action: () => this.removeWidget(id) }
        ];

        options.forEach(opt => {
            const item = document.createElement('div');
            item.textContent = opt.label;
            item.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                color: #fff;
                transition: background 0.2s;
            `;
            item.addEventListener('mouseenter', () => item.style.background = 'rgba(0,255,255,0.2)');
            item.addEventListener('mouseleave', () => item.style.background = 'none');
            item.addEventListener('click', () => {
                opt.action();
                menu.remove();
            });
            menu.appendChild(item);
        });

        document.body.appendChild(menu);

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    }

    // Resize widget (cycle through sizes)
    resizeWidget(id) {
        const widget = this.widgets.get(id);
        if (!widget) return;

        const sizes = Object.keys(WidgetSystem.SIZES);
        const currentSize = widget.config.size;
        const currentIndex = sizes.indexOf(currentSize);
        const newSize = sizes[(currentIndex + 1) % sizes.length];

        widget.config.size = newSize;
        const sizeConfig = WidgetSystem.SIZES[newSize];

        widget.element.style.gridColumn = `span ${sizeConfig.cols}`;
        widget.element.style.gridRow = `span ${sizeConfig.rows}`;
        widget.element.dataset.size = newSize;
        widget.element.className = widget.element.className.replace(/widget-\w+/, `widget-${newSize.toLowerCase()}`);

        this.saveLayout();
    }

    // Refresh widget data
    async refreshWidget(id) {
        const widget = this.widgets.get(id);
        if (!widget || !widget.config.dataSource) return;

        try {
            const response = await fetch(widget.config.dataSource);
            const data = await response.json();

            if (widget.config.render) {
                this.updateWidget(id, widget.config.render(data));
            } else {
                this.updateWidget(id, JSON.stringify(data, null, 2));
            }
        } catch (err) {
            console.error(`Failed to refresh widget ${id}:`, err);
        }
    }

    // Configure widget
    configureWidget(id) {
        const config = prompt(`Configure widget "${id}":\nEnter refresh interval in seconds (0 = no auto-refresh):`, '30');
        if (config !== null) {
            const interval = parseInt(config) || 0;
            localStorage.setItem(`widget-${id}-interval`, interval);
            console.log(`Widget ${id} configured: refresh every ${interval}s`);
        }
    }

    // Auto-refresh widget
    startAutoRefresh(id, dataSource, intervalSec, render) {
        setInterval(async () => {
            try {
                const response = await fetch(dataSource);
                const data = await response.json();
                if (render) {
                    this.updateWidget(id, render(data));
                }
            } catch (err) {
                console.error(`Auto-refresh failed for ${id}:`, err);
            }
        }, intervalSec * 1000);
    }

    // Save layout to localStorage
    saveLayout() {
        const layout = [];
        this.widgets.forEach((widget, id) => {
            const rect = widget.element.getBoundingClientRect();
            layout.push({
                id,
                size: widget.config.size,
                order: Array.from(this.container.children).indexOf(widget.element)
            });
        });
        localStorage.setItem(this.storageKey, JSON.stringify(layout));
    }

    // Load layout from localStorage
    loadLayout() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Get all widgets
    getWidgets() {
        return Array.from(this.widgets.values());
    }
}

// Widget Picker Component
class WidgetPicker {
    constructor(widgetSystem, availableWidgets = []) {
        this.widgetSystem = widgetSystem;
        this.availableWidgets = availableWidgets;
        this.modal = null;
    }

    show() {
        if (this.modal) this.modal.remove();

        this.modal = document.createElement('div');
        this.modal.className = 'widget-picker-modal';
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #0a0a0f, #1a1a2e);
            border: 2px solid #0ff;
            border-radius: 16px;
            padding: 24px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="color:#0ff; margin:0;">ADD WIDGET</h2>
                <button id="close-picker" style="background:none; border:none; color:#fff; font-size:1.5em; cursor:pointer;">✕</button>
            </div>
            <div style="display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap;">
                ${['All', 'Status', 'Metrics', 'Actions', 'Lists', 'Charts'].map(cat =>
                    `<button class="cat-filter" data-cat="${cat.toLowerCase()}" style="background:rgba(0,255,255,0.1); border:1px solid #0ff; color:#0ff; padding:8px 16px; border-radius:20px; cursor:pointer;">${cat}</button>`
                ).join('')}
            </div>
            <div id="widget-list" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;"></div>
        `;

        this.modal.appendChild(content);
        document.body.appendChild(this.modal);

        // Close button
        content.querySelector('#close-picker').addEventListener('click', () => this.hide());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide();
        });

        // Render widgets
        this.renderWidgetList();

        // Category filters
        content.querySelectorAll('.cat-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                content.querySelectorAll('.cat-filter').forEach(b => b.style.background = 'rgba(0,255,255,0.1)');
                btn.style.background = 'rgba(0,255,255,0.3)';
                this.renderWidgetList(btn.dataset.cat === 'all' ? null : btn.dataset.cat);
            });
        });
    }

    renderWidgetList(category = null) {
        const list = this.modal.querySelector('#widget-list');
        const filtered = category
            ? this.availableWidgets.filter(w => w.category.toLowerCase() === category)
            : this.availableWidgets;

        list.innerHTML = filtered.map(w => `
            <div class="widget-option" data-widget-id="${w.id}" style="
                background: rgba(0,0,0,0.5);
                border: 1px solid rgba(0,255,255,0.3);
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            ">
                <div style="font-size:2em; margin-bottom:8px;">${w.icon}</div>
                <div style="color:#fff; font-weight:600;">${w.name}</div>
                <div style="color:#666; font-size:0.8em;">${w.size}</div>
            </div>
        `).join('');

        list.querySelectorAll('.widget-option').forEach(opt => {
            opt.addEventListener('mouseenter', () => {
                opt.style.borderColor = '#0ff';
                opt.style.transform = 'scale(1.05)';
            });
            opt.addEventListener('mouseleave', () => {
                opt.style.borderColor = 'rgba(0,255,255,0.3)';
                opt.style.transform = 'scale(1)';
            });
            opt.addEventListener('click', () => {
                const widgetConfig = this.availableWidgets.find(w => w.id === opt.dataset.widgetId);
                if (widgetConfig) {
                    this.widgetSystem.addWidget(widgetConfig);
                    this.hide();
                }
            });
        });
    }

    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

// Export for use
window.WidgetSystem = WidgetSystem;
window.WidgetPicker = WidgetPicker;
