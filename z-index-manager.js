/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: z-index-manager.js
 * Declaration ID: IP-52FD5C08-MLL28ZWM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GEMBOT Z-INDEX MANAGER - Visual Layer Inspector & Organizer
 * ═══════════════════════════════════════════════════════════════════════════════
 * Owner: Ryan Barbrick / Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * 
 * Helps visualize, organize, and fix z-index layering issues
 * ═══════════════════════════════════════════════════════════════════════════════
 */

window.ZIndexManager = {
    version: '1.0.0',
    isOpen: false,
    elements: [],
    selectedElement: null,
    highlightOverlay: null,
    
    /**
     * Initialize the Z-Index Manager
     */
    init() {
        console.log('🔍 Initializing Z-Index Manager...');
        this.createUI();
        this.scanElements();
        this.attachEventListeners();
        console.log('✅ Z-Index Manager ready! Press Ctrl+Shift+Z to toggle');
    },
    
    /**
     * Create the manager UI
     */
    createUI() {
        // Create main panel
        const panel = document.createElement('div');
        panel.id = 'zIndexManagerPanel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 450px;
            max-height: 80vh;
            background: rgba(10, 15, 30, 0.98);
            border: 2px solid #4affff;
            border-radius: 12px;
            box-shadow: 0 10px 50px rgba(74, 255, 255, 0.3);
            z-index: 2147483647;
            display: none;
            flex-direction: column;
            font-family: 'Courier New', monospace;
            backdrop-filter: blur(10px);
        `;
        
        panel.innerHTML = `
            <div style="
                padding: 15px;
                background: linear-gradient(135deg, #1a1f3a, #2d1f3a);
                border-bottom: 2px solid #4affff;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 10px 10px 0 0;
            ">
                <div>
                    <h3 style="margin: 0; color: #4affff; font-size: 16px;">
                        🔍 Z-Index Manager
                    </h3>
                    <div style="font-size: 10px; color: #9f7aea; margin-top: 3px;">
                        Layer Inspector & Organizer
                    </div>
                </div>
                <div>
                    <button id="zIndexRefresh" style="
                        padding: 5px 10px;
                        background: #4affff;
                        border: none;
                        border-radius: 5px;
                        color: #000;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                        margin-right: 5px;
                    ">🔄 Refresh</button>
                    <button id="zIndexClose" style="
                        padding: 5px 10px;
                        background: #ff6b6b;
                        border: none;
                        border-radius: 5px;
                        color: #fff;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                    ">✕</button>
                </div>
            </div>
            
            <div style="padding: 15px;">
                <!-- Stats -->
                <div id="zIndexStats" style="
                    background: rgba(74, 255, 255, 0.1);
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    border: 1px solid #4affff;
                ">
                    <div style="color: #4affff; font-size: 11px; margin-bottom: 5px;">
                        📊 Layer Statistics
                    </div>
                    <div style="color: #fff; font-size: 12px;" id="statsContent">
                        Scanning...
                    </div>
                </div>
                
                <!-- Filters -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #9f7aea; font-size: 11px; margin-bottom: 5px;">
                        🔍 Filter Elements:
                    </label>
                    <input type="text" id="zIndexFilter" placeholder="Search by tag, id, class..." style="
                        width: 100%;
                        padding: 8px;
                        background: rgba(0, 0, 0, 0.5);
                        border: 1px solid #4affff;
                        border-radius: 5px;
                        color: #fff;
                        font-size: 11px;
                    ">
                </div>
                
                <!-- Sort options -->
                <div style="margin-bottom: 15px; display: flex; gap: 10px;">
                    <select id="zIndexSort" style="
                        flex: 1;
                        padding: 8px;
                        background: rgba(0, 0, 0, 0.5);
                        border: 1px solid #4affff;
                        border-radius: 5px;
                        color: #fff;
                        font-size: 11px;
                    ">
                        <option value="zindex-desc">Z-Index (High → Low)</option>
                        <option value="zindex-asc">Z-Index (Low → High)</option>
                        <option value="tag">Tag Name</option>
                        <option value="visible">Visible First</option>
                    </select>
                    <button id="zIndexShowHidden" style="
                        padding: 8px 12px;
                        background: rgba(159, 122, 234, 0.3);
                        border: 1px solid #9f7aea;
                        border-radius: 5px;
                        color: #9f7aea;
                        cursor: pointer;
                        font-size: 11px;
                        white-space: nowrap;
                    ">👁️ Show Hidden</button>
                </div>
            </div>
            
            <!-- Elements list -->
            <div id="zIndexList" style="
                flex: 1;
                overflow-y: auto;
                padding: 0 15px 15px 15px;
                max-height: 400px;
            "></div>
            
            <!-- Actions -->
            <div style="
                padding: 15px;
                border-top: 2px solid #4affff;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0 0 10px 10px;
            ">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <button id="zIndexExportCSS" style="
                        padding: 10px;
                        background: linear-gradient(135deg, #4affff, #9f7aea);
                        border: none;
                        border-radius: 5px;
                        color: #000;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                    ">📋 Export CSS</button>
                    <button id="zIndexSaveLayout" style="
                        padding: 10px;
                        background: linear-gradient(135deg, #ffd700, #ff8c00);
                        border: none;
                        border-radius: 5px;
                        color: #000;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                    ">💾 Save</button>
                    <button id="zIndexLoadLayout" style="
                        padding: 10px;
                        background: linear-gradient(135deg, #00ff88, #00cc66);
                        border: none;
                        border-radius: 5px;
                        color: #000;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                    ">📂 Load</button>
                    <button id="zIndexLogAll" style="
                        padding: 10px;
                        background: linear-gradient(135deg, #ff6b6b, #ff4444);
                        border: none;
                        border-radius: 5px;
                        color: #fff;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: bold;
                    ">📜 Log All</button>
                </div>
                <div style="color: #9f7aea; font-size: 10px; text-align: center;">
                    Ctrl+Shift+Z to toggle | Click elements to highlight
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Create highlight overlay
        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.id = 'zIndexHighlight';
        this.highlightOverlay.style.cssText = `
            position: fixed;
            border: 3px solid #4affff;
            background: rgba(74, 255, 255, 0.1);
            pointer-events: none;
            z-index: 2147483646;
            display: none;
            box-shadow: 0 0 20px rgba(74, 255, 255, 0.5);
        `;
        document.body.appendChild(this.highlightOverlay);
    },
    
    /**
     * Scan all elements on the page
     */
    scanElements() {
        this.elements = [];
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach((el, index) => {
            const computedStyle = window.getComputedStyle(el);
            const position = computedStyle.position;
            const zIndex = computedStyle.zIndex;
            const display = computedStyle.display;
            const visibility = computedStyle.visibility;
            const opacity = parseFloat(computedStyle.opacity);
            
            // Only track positioned elements or those with z-index
            if (position !== 'static' || zIndex !== 'auto') {
                const rect = el.getBoundingClientRect();
                
                this.elements.push({
                    element: el,
                    tag: el.tagName.toLowerCase(),
                    id: el.id || '(no id)',
                    classes: Array.from(el.classList).join(' ') || '(no class)',
                    position: position,
                    zIndex: zIndex === 'auto' ? 'auto' : parseInt(zIndex),
                    display: display,
                    visibility: visibility,
                    opacity: opacity,
                    isVisible: display !== 'none' && visibility !== 'hidden' && opacity > 0,
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                    top: Math.round(rect.top),
                    left: Math.round(rect.left),
                    index: index
                });
            }
        });
        
        console.log(`🔍 Found ${this.elements.length} positioned elements`);
        this.updateStats();
        this.renderList();
    },
    
    /**
     * Update statistics display
     */
    updateStats() {
        const stats = {
            total: this.elements.length,
            visible: this.elements.filter(e => e.isVisible).length,
            hidden: this.elements.filter(e => !e.isVisible).length,
            fixed: this.elements.filter(e => e.position === 'fixed').length,
            absolute: this.elements.filter(e => e.position === 'absolute').length,
            relative: this.elements.filter(e => e.position === 'relative').length,
            sticky: this.elements.filter(e => e.position === 'sticky').length,
            maxZIndex: Math.max(...this.elements.map(e => typeof e.zIndex === 'number' ? e.zIndex : 0)),
            autoZIndex: this.elements.filter(e => e.zIndex === 'auto').length
        };
        
        const statsEl = document.getElementById('statsContent');
        if (statsEl) {
            statsEl.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px;">
                    <div>Total: <strong>${stats.total}</strong></div>
                    <div>Max Z: <strong>${stats.maxZIndex}</strong></div>
                    <div style="color: #4affff;">Visible: ${stats.visible}</div>
                    <div style="color: #ff6b6b;">Hidden: ${stats.hidden}</div>
                    <div>Fixed: ${stats.fixed}</div>
                    <div>Absolute: ${stats.absolute}</div>
                    <div>Relative: ${stats.relative}</div>
                    <div>Auto Z: ${stats.autoZIndex}</div>
                </div>
            `;
        }
    },
    
    /**
     * Render the elements list
     */
    renderList() {
        const listEl = document.getElementById('zIndexList');
        if (!listEl) return;
        
        // Apply filters
        let filtered = [...this.elements];
        
        const filterInput = document.getElementById('zIndexFilter');
        if (filterInput && filterInput.value) {
            const query = filterInput.value.toLowerCase();
            filtered = filtered.filter(e => 
                e.tag.includes(query) ||
                e.id.toLowerCase().includes(query) ||
                e.classes.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        const sortSelect = document.getElementById('zIndexSort');
        if (sortSelect) {
            const sortBy = sortSelect.value;
            if (sortBy === 'zindex-desc') {
                filtered.sort((a, b) => {
                    const aZ = typeof a.zIndex === 'number' ? a.zIndex : -1;
                    const bZ = typeof b.zIndex === 'number' ? b.zIndex : -1;
                    return bZ - aZ;
                });
            } else if (sortBy === 'zindex-asc') {
                filtered.sort((a, b) => {
                    const aZ = typeof a.zIndex === 'number' ? a.zIndex : 999999;
                    const bZ = typeof b.zIndex === 'number' ? b.zIndex : 999999;
                    return aZ - bZ;
                });
            } else if (sortBy === 'tag') {
                filtered.sort((a, b) => a.tag.localeCompare(b.tag));
            } else if (sortBy === 'visible') {
                filtered.sort((a, b) => (b.isVisible ? 1 : 0) - (a.isVisible ? 1 : 0));
            }
        }
        
        listEl.innerHTML = filtered.map((item, idx) => {
            const bgColor = item.isVisible ? 'rgba(74, 255, 255, 0.1)' : 'rgba(255, 107, 107, 0.1)';
            const borderColor = item.isVisible ? '#4affff' : '#ff6b6b';
            
            return `
                <div class="z-index-item" data-index="${item.index}" style="
                    background: ${bgColor};
                    border: 1px solid ${borderColor};
                    border-radius: 8px;
                    padding: 10px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <div style="color: #fff; font-size: 13px; font-weight: bold;">
                            &lt;${item.tag}&gt;
                        </div>
                        <div style="
                            background: ${item.position === 'fixed' ? '#4affff' : item.position === 'absolute' ? '#9f7aea' : '#ffd700'};
                            color: #000;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-size: 10px;
                            font-weight: bold;
                        ">
                            z: ${item.zIndex}
                        </div>
                    </div>
                    <div style="font-size: 10px; color: #9f7aea; margin-bottom: 3px;">
                        ${item.id !== '(no id)' ? `#${item.id}` : ''}
                        ${item.classes !== '(no class)' ? `.${item.classes.split(' ').join('.')}` : ''}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; font-size: 10px; color: #888;">
                        <div>Position: ${item.position}</div>
                        <div>Size: ${item.width}×${item.height}</div>
                        <div>Location: ${item.left}, ${item.top}</div>
                        <div>${item.isVisible ? '✅ Visible' : '❌ Hidden'}</div>
                    </div>
                    <div style="margin-top: 8px; display: flex; gap: 5px;">
                        <button class="z-index-highlight-btn" data-index="${item.index}" style="
                            flex: 1;
                            padding: 5px;
                            background: #4affff;
                            border: none;
                            border-radius: 4px;
                            color: #000;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: bold;
                        ">👁️ Highlight</button>
                        <input type="number" class="z-index-input" data-index="${item.index}" value="${item.zIndex}" style="
                            width: 70px;
                            padding: 5px;
                            background: rgba(0, 0, 0, 0.5);
                            border: 1px solid #4affff;
                            border-radius: 4px;
                            color: #fff;
                            font-size: 10px;
                            text-align: center;
                        ">
                        <button class="z-index-apply-btn" data-index="${item.index}" style="
                            padding: 5px 10px;
                            background: #9f7aea;
                            border: none;
                            border-radius: 4px;
                            color: #fff;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: bold;
                        ">✓</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Attach item click handlers
        document.querySelectorAll('.z-index-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('z-index-highlight-btn') &&
                    !e.target.classList.contains('z-index-apply-btn') &&
                    !e.target.classList.contains('z-index-input')) {
                    const index = parseInt(item.dataset.index);
                    this.highlightElement(index);
                }
            });
        });
        
        document.querySelectorAll('.z-index-highlight-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.highlightElement(index);
            });
        });
        
        document.querySelectorAll('.z-index-apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                const input = document.querySelector(`.z-index-input[data-index="${index}"]`);
                if (input) {
                    this.setZIndex(index, input.value);
                }
            });
        });
    },
    
    /**
     * Highlight an element
     */
    highlightElement(index) {
        const item = this.elements.find(e => e.index === index);
        if (!item) return;
        
        const rect = item.element.getBoundingClientRect();
        
        this.highlightOverlay.style.display = 'block';
        this.highlightOverlay.style.top = rect.top + 'px';
        this.highlightOverlay.style.left = rect.left + 'px';
        this.highlightOverlay.style.width = rect.width + 'px';
        this.highlightOverlay.style.height = rect.height + 'px';
        
        // Scroll element into view
        item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Flash effect
        this.highlightOverlay.style.animation = 'none';
        setTimeout(() => {
            this.highlightOverlay.style.animation = 'zIndexPulse 1s ease-in-out infinite';
        }, 10);
        
        console.log('🎯 Highlighted:', item);
    },
    
    /**
     * Set z-index for an element
     */
    setZIndex(index, newZIndex) {
        const item = this.elements.find(e => e.index === index);
        if (!item) return;
        
        const value = newZIndex === 'auto' ? 'auto' : parseInt(newZIndex);
        item.element.style.zIndex = value;
        item.zIndex = value;
        
        console.log(`✅ Set z-index of <${item.tag}> to ${value}`);
        this.updateStats();
    },
    
    /**
     * Export CSS with organized z-index
     */
    exportCSS() {
        const organized = {};
        
        this.elements.forEach(item => {
            if (item.zIndex !== 'auto') {
                const selector = item.id !== '(no id)' ? `#${item.id}` : 
                                item.classes !== '(no class)' ? `.${item.classes.split(' ')[0]}` :
                                item.tag;
                
                if (!organized[item.zIndex]) {
                    organized[item.zIndex] = [];
                }
                organized[item.zIndex].push({ selector, position: item.position });
            }
        });
        
        let css = `/* ═══════════════════════════════════════════════════════════\n`;
        css += `   GEMBOT Z-INDEX ORGANIZATION\n`;
        css += `   Generated: ${new Date().toLocaleString()}\n`;
        css += `   Total Elements: ${this.elements.length}\n`;
        css += `   ═══════════════════════════════════════════════════════════ */\n\n`;
        
        css += `:root {\n`;
        css += `    /* Recommended Z-Index Layers */\n`;
        css += `    --z-background: 1;\n`;
        css += `    --z-content: 100;\n`;
        css += `    --z-controls: 500;\n`;
        css += `    --z-overlay: 1000;\n`;
        css += `    --z-modal: 10000;\n`;
        css += `    --z-tooltip: 50000;\n`;
        css += `    --z-critical: 100000;\n`;
        css += `}\n\n`;
        
        const sorted = Object.keys(organized).sort((a, b) => parseInt(a) - parseInt(b));
        sorted.forEach(zIndex => {
            css += `/* Z-Index: ${zIndex} */\n`;
            organized[zIndex].forEach(item => {
                css += `${item.selector} {\n`;
                css += `    position: ${item.position};\n`;
                css += `    z-index: ${zIndex};\n`;
                css += `}\n\n`;
            });
        });
        
        // Copy to clipboard
        navigator.clipboard.writeText(css).then(() => {
            alert('✅ CSS copied to clipboard!');
            console.log('📋 Exported CSS:', css);
        });
    },
    
    /**
     * Save current layout
     */
    saveLayout() {
        const layout = {
            timestamp: new Date().toISOString(),
            elements: this.elements.map(item => ({
                selector: item.id !== '(no id)' ? `#${item.id}` :
                         item.classes !== '(no class)' ? `.${item.classes.split(' ')[0]}` :
                         item.tag,
                tag: item.tag,
                id: item.id,
                classes: item.classes,
                zIndex: item.zIndex,
                position: item.position,
                isVisible: item.isVisible
            }))
        };
        
        localStorage.setItem('gembot_zindex_layout', JSON.stringify(layout, null, 2));
        console.log('💾 Layout saved:', layout);
        alert('✅ Layout saved to localStorage!');
    },
    
    /**
     * Load saved layout and apply z-index values
     */
    loadLayout() {
        const saved = localStorage.getItem('gembot_zindex_layout');
        if (!saved) {
            alert('⚠️ No saved layout found!');
            return;
        }
        
        try {
            const layout = JSON.parse(saved);
            let applied = 0;
            let notFound = 0;
            
            layout.elements.forEach(savedItem => {
                // Find matching element
                let element = null;
                
                if (savedItem.id && savedItem.id !== '(no id)') {
                    element = document.getElementById(savedItem.id);
                } else if (savedItem.classes && savedItem.classes !== '(no class)') {
                    const firstClass = savedItem.classes.split(' ')[0];
                    element = document.querySelector(`.${firstClass}`);
                } else if (savedItem.tag) {
                    element = document.querySelector(savedItem.tag);
                }
                
                if (element && savedItem.zIndex !== 'auto') {
                    element.style.zIndex = savedItem.zIndex;
                    element.style.position = savedItem.position || element.style.position;
                    applied++;
                } else {
                    notFound++;
                }
            });
            
            this.scanElements(); // Refresh the list
            console.log(`📂 Layout loaded: ${applied} applied, ${notFound} not found`);
            alert(`✅ Layout loaded!\n\n${applied} elements updated\n${notFound} elements not found`);
            
        } catch (e) {
            console.error('❌ Error loading layout:', e);
            alert('❌ Error loading layout: ' + e.message);
        }
    },
    
    /**
     * Log all elements with z-index to console
     */
    logAllElements() {
        console.log('\n' + '═'.repeat(70));
        console.log('📐 Z-INDEX MANAGER - ALL POSITIONED ELEMENTS');
        console.log('═'.repeat(70));
        console.log(`Timestamp: ${new Date().toLocaleString()}`);
        console.log(`Total Elements: ${this.elements.length}`);
        console.log('─'.repeat(70));
        
        // Group by z-index
        const grouped = {};
        this.elements.forEach(item => {
            const z = item.zIndex.toString();
            if (!grouped[z]) grouped[z] = [];
            grouped[z].push(item);
        });
        
        // Sort z-index keys numerically
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
            if (a === 'auto') return 1;
            if (b === 'auto') return -1;
            return parseInt(b) - parseInt(a);
        });
        
        sortedKeys.forEach(zIndex => {
            console.log(`\n🔹 Z-INDEX: ${zIndex}`);
            grouped[zIndex].forEach((item, idx) => {
                const visibility = item.isVisible ? '✅' : '❌';
                console.log(`   ${idx + 1}. ${visibility} <${item.tag}> id="${item.id}" class="${item.classes}"`);
                console.log(`      Position: ${item.position} | Size: ${item.width}x${item.height} | Top: ${item.top}, Left: ${item.left}`);
            });
        });
        
        console.log('\n' + '═'.repeat(70));
        console.log('💡 TIP: Use this data to identify overlapping elements and fix z-index issues');
        console.log('═'.repeat(70) + '\n');
        
        // Also create a table view
        console.table(this.elements.map(e => ({
            Tag: e.tag,
            ID: e.id,
            Classes: e.classes.substring(0, 30) + (e.classes.length > 30 ? '...' : ''),
            'Z-Index': e.zIndex,
            Position: e.position,
            Visible: e.isVisible ? 'Yes' : 'No',
            Size: `${e.width}x${e.height}`
        })));
        
        alert('📜 Full element list logged to console!\n\nPress F12 to view');
    },
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Close button
        document.getElementById('zIndexClose')?.addEventListener('click', () => {
            this.toggle();
        });
        
        // Refresh button
        document.getElementById('zIndexRefresh')?.addEventListener('click', () => {
            this.scanElements();
        });
        
        // Export CSS
        document.getElementById('zIndexExportCSS')?.addEventListener('click', () => {
            this.exportCSS();
        });
        
        // Save layout
        document.getElementById('zIndexSaveLayout')?.addEventListener('click', () => {
            this.saveLayout();
        });
        
        // Load layout
        document.getElementById('zIndexLoadLayout')?.addEventListener('click', () => {
            this.loadLayout();
        });
        
        // Log all elements
        document.getElementById('zIndexLogAll')?.addEventListener('click', () => {
            this.logAllElements();
        });
        
        // Filter input
        document.getElementById('zIndexFilter')?.addEventListener('input', () => {
            this.renderList();
        });
        
        // Sort select
        document.getElementById('zIndexSort')?.addEventListener('change', () => {
            this.renderList();
        });
        
        // Keyboard shortcut: Ctrl+Shift+Z
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
                e.preventDefault();
                this.toggle();
            }
            // ESC to close
            if (e.key === 'Escape' && this.isOpen) {
                this.toggle();
            }
        });
        
        // Hide highlight when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#zIndexManagerPanel') && 
                !e.target.closest('.z-index-item')) {
                this.highlightOverlay.style.display = 'none';
            }
        });
    },
    
    /**
     * Toggle the manager panel
     */
    toggle() {
        const panel = document.getElementById('zIndexManagerPanel');
        if (!panel) return;
        
        this.isOpen = !this.isOpen;
        panel.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen) {
            this.scanElements();
        } else {
            this.highlightOverlay.style.display = 'none';
        }
    }
};

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes zIndexPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.02); }
    }
    
    .z-index-item:hover {
        transform: translateX(5px);
        box-shadow: 0 5px 15px rgba(74, 255, 255, 0.3);
    }
    
    #zIndexList::-webkit-scrollbar {
        width: 8px;
    }
    
    #zIndexList::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
    }
    
    #zIndexList::-webkit-scrollbar-thumb {
        background: #4affff;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ZIndexManager.init());
} else {
    ZIndexManager.init();
}

console.log('🔍 Z-Index Manager loaded - Press Ctrl+Shift+Z to open');
