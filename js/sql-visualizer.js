// RootIB: RB-20260319142113-50CEB551
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
 * File: sql-visualizer.js
 * Declaration ID: IP-6BE3E566-MLL28ZV6
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * SQL Schema Visualizer
 * Creates interactive bubble maps and workflow visualizations for SQL schemas
 */

(function() {
    'use strict';

    class SQLVisualizer {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.width = this.container.clientWidth;
            this.height = this.container.clientHeight;
            this.bubbles = [];
            this.connections = [];
        }

        /**
         * Create bubble map visualization of schema relationships
         * @param {Array} schemas - Parsed schema data
         * @param {Array} relationships - Table relationships
         */
        createBubbleMap(schemas, relationships) {
            this.container.innerHTML = '';
            
            // Create SVG canvas
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
            svg.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
            
            // Calculate bubble sizes based on table complexity
            this.bubbles = schemas.map((table, index) => {
                const complexity = table.columns.length + (table.indexes.length * 2) + (table.constraints.length * 3);
                const radius = Math.max(30, Math.min(80, complexity * 5));
                
                // Position bubbles in a circular pattern initially
                const angle = (index / schemas.length) * 2 * Math.PI;
                const centerX = this.width / 2;
                const centerY = this.height / 2;
                const orbitRadius = Math.min(this.width, this.height) * 0.35;
                
                return {
                    name: table.name,
                    x: centerX + Math.cos(angle) * orbitRadius,
                    y: centerY + Math.sin(angle) * orbitRadius,
                    radius: radius,
                    columns: table.columns.length,
                    indexes: table.indexes.length,
                    constraints: table.constraints.length,
                    color: this.getTableColor(table)
                };
            });

            // Draw connections first (so they appear behind bubbles)
            const connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            connectionsGroup.setAttribute('class', 'connections');
            
            relationships.forEach(rel => {
                const source = this.bubbles.find(b => b.name === rel.source);
                const target = this.bubbles.find(b => b.name === rel.target);
                
                if (source && target) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', source.x);
                    line.setAttribute('y1', source.y);
                    line.setAttribute('x2', target.x);
                    line.setAttribute('y2', target.y);
                    line.setAttribute('stroke', '#4cc9f0');
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('stroke-opacity', '0.4');
                    line.setAttribute('class', 'relationship-line');
                    
                    // Add animation
                    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animate.setAttribute('attributeName', 'stroke-opacity');
                    animate.setAttribute('values', '0.2;0.6;0.2');
                    animate.setAttribute('dur', '3s');
                    animate.setAttribute('repeatCount', 'indefinite');
                    line.appendChild(animate);
                    
                    connectionsGroup.appendChild(line);
                }
            });
            
            svg.appendChild(connectionsGroup);

            // Draw bubbles
            const bubblesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            bubblesGroup.setAttribute('class', 'bubbles');
            
            this.bubbles.forEach((bubble, index) => {
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.setAttribute('class', 'bubble-group');
                group.setAttribute('data-table', bubble.name);
                
                // Outer glow circle
                const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                glow.setAttribute('cx', bubble.x);
                glow.setAttribute('cy', bubble.y);
                glow.setAttribute('r', bubble.radius + 10);
                glow.setAttribute('fill', bubble.color);
                glow.setAttribute('opacity', '0.2');
                glow.setAttribute('class', 'bubble-glow');
                
                // Main bubble
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', bubble.x);
                circle.setAttribute('cy', bubble.y);
                circle.setAttribute('r', bubble.radius);
                circle.setAttribute('fill', bubble.color);
                circle.setAttribute('stroke', '#ffffff');
                circle.setAttribute('stroke-width', '2');
                circle.setAttribute('class', 'bubble');
                circle.setAttribute('style', 'cursor: pointer; transition: all 0.3s ease;');
                
                // Pulse animation
                const pulseAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                pulseAnim.setAttribute('attributeName', 'r');
                pulseAnim.setAttribute('values', `${bubble.radius};${bubble.radius + 5};${bubble.radius}`);
                pulseAnim.setAttribute('dur', '2s');
                pulseAnim.setAttribute('repeatCount', 'indefinite');
                circle.appendChild(pulseAnim);
                
                // Table name
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', bubble.x);
                text.setAttribute('y', bubble.y);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'middle');
                text.setAttribute('fill', '#ffffff');
                text.setAttribute('font-size', '14');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('class', 'bubble-text');
                text.textContent = bubble.name;
                
                // Info text (columns count)
                const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                infoText.setAttribute('x', bubble.x);
                infoText.setAttribute('y', bubble.y + 18);
                infoText.setAttribute('text-anchor', 'middle');
                infoText.setAttribute('fill', '#ffffff');
                infoText.setAttribute('font-size', '10');
                infoText.setAttribute('opacity', '0.8');
                infoText.textContent = `${bubble.columns} cols`;
                
                // Add interactive behavior
                circle.addEventListener('mouseenter', () => {
                    circle.setAttribute('stroke-width', '4');
                    circle.setAttribute('filter', 'brightness(1.2)');
                    glow.setAttribute('opacity', '0.4');
                });
                
                circle.addEventListener('mouseleave', () => {
                    circle.setAttribute('stroke-width', '2');
                    circle.setAttribute('filter', 'brightness(1)');
                    glow.setAttribute('opacity', '0.2');
                });
                
                circle.addEventListener('click', () => {
                    this.showTableDetails(bubble.name);
                });
                
                group.appendChild(glow);
                group.appendChild(circle);
                group.appendChild(text);
                group.appendChild(infoText);
                bubblesGroup.appendChild(group);
            });
            
            svg.appendChild(bubblesGroup);
            this.container.appendChild(svg);
            
            // Add legend
            this.addLegend();
        }

        /**
         * Get color for table based on its characteristics
         */
        getTableColor(table) {
            const hasVulnerabilities = table.columns.some(col => 
                ['password', 'ssn', 'credit', 'secret'].some(p => 
                    col.name.toLowerCase().includes(p)
                )
            );
            
            if (hasVulnerabilities) return '#f72585'; // Critical - Pink
            if (table.indexes.length === 0) return '#fb5607'; // Warning - Orange
            if (table.constraints.length > 3) return '#4cc9f0'; // Complex - Cyan
            return '#7209b7'; // Normal - Purple
        }

        /**
         * Create workflow visualization showing query execution paths
         * @param {Array} optimizations - Performance optimization data
         */
        createWorkflowVisualization(optimizations) {
            const workflowContainer = document.createElement('div');
            workflowContainer.className = 'workflow-container';
            workflowContainer.style.cssText = `
                background: linear-gradient(135deg, #2d3250 0%, #1a1f3a 100%);
                border-radius: 15px;
                padding: 20px;
                margin-top: 20px;
                color: white;
            `;
            
            const title = document.createElement('h3');
            title.textContent = '🔄 Automated Workflow Optimization Path';
            title.style.cssText = 'color: #4cc9f0; margin-bottom: 20px; text-align: center;';
            workflowContainer.appendChild(title);
            
            // Create workflow steps
            const steps = [
                { icon: '📥', title: 'Schema Input', desc: 'SQL schema uploaded', color: '#7209b7' },
                { icon: '🔍', title: 'Analysis', desc: 'Parsing tables & relationships', color: '#4361ee' },
                { icon: '🛡️', title: 'Security Scan', desc: 'Vulnerability detection', color: '#f72585' },
                { icon: '⚡', title: 'Performance', desc: 'Query optimization', color: '#fb5607' },
                { icon: '📊', title: 'Visualization', desc: 'Interactive bubble map', color: '#4cc9f0' },
                { icon: '✅', title: 'Report', desc: 'Comprehensive results', color: '#06ffa5' }
            ];
            
            const workflowSteps = document.createElement('div');
            workflowSteps.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            `;
            
            steps.forEach((step, index) => {
                const stepDiv = document.createElement('div');
                stepDiv.className = 'workflow-step';
                stepDiv.style.cssText = `
                    flex: 1;
                    min-width: 140px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid ${step.color};
                    border-radius: 10px;
                    padding: 15px;
                    text-align: center;
                    animation: slideInUp ${0.3 + index * 0.1}s ease-out;
                    transition: all 0.3s ease;
                    cursor: pointer;
                `;
                
                stepDiv.innerHTML = `
                    <div style="font-size: 32px; margin-bottom: 8px;">${step.icon}</div>
                    <div style="font-weight: bold; color: ${step.color}; margin-bottom: 5px;">${step.title}</div>
                    <div style="font-size: 12px; opacity: 0.8;">${step.desc}</div>
                `;
                
                // Hover effect
                stepDiv.addEventListener('mouseenter', () => {
                    stepDiv.style.transform = 'translateY(-5px) scale(1.05)';
                    stepDiv.style.boxShadow = `0 10px 30px ${step.color}40`;
                });
                
                stepDiv.addEventListener('mouseleave', () => {
                    stepDiv.style.transform = 'translateY(0) scale(1)';
                    stepDiv.style.boxShadow = 'none';
                });
                
                workflowSteps.appendChild(stepDiv);
                
                // Add arrow between steps (except last one)
                if (index < steps.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.style.cssText = `
                        font-size: 24px;
                        color: #4cc9f0;
                        animation: pulse 2s infinite;
                    `;
                    arrow.textContent = '→';
                    workflowSteps.appendChild(arrow);
                }
            });
            
            workflowContainer.appendChild(workflowSteps);
            
            // Add optimization metrics
            if (optimizations && optimizations.length > 0) {
                const metricsDiv = document.createElement('div');
                metricsDiv.style.cssText = `
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(6, 255, 165, 0.1);
                    border-radius: 10px;
                    border-left: 4px solid #06ffa5;
                `;
                
                metricsDiv.innerHTML = `
                    <h4 style="color: #06ffa5; margin-bottom: 10px;">⚡ Performance Insights</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        <div><strong>High Priority:</strong> ${optimizations.filter(o => o.priority === 'HIGH').length} items</div>
                        <div><strong>Medium Priority:</strong> ${optimizations.filter(o => o.priority === 'MEDIUM').length} items</div>
                        <div><strong>Estimated Impact:</strong> 50-90% faster</div>
                    </div>
                `;
                
                workflowContainer.appendChild(metricsDiv);
            }
            
            this.container.appendChild(workflowContainer);
        }

        /**
         * Add legend to the visualization
         */
        addLegend() {
            const legend = document.createElement('div');
            legend.className = 'bubble-legend';
            legend.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 10px;
                padding: 15px;
                color: white;
                font-size: 12px;
                backdrop-filter: blur(10px);
            `;
            
            legend.innerHTML = `
                <h4 style="margin-bottom: 10px; color: #4cc9f0;">Legend</h4>
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="width: 20px; height: 20px; background: #f72585; border-radius: 50%; margin-right: 8px;"></div>
                    Security Issues
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="width: 20px; height: 20px; background: #fb5607; border-radius: 50%; margin-right: 8px;"></div>
                    No Indexes
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="width: 20px; height: 20px; background: #4cc9f0; border-radius: 50%; margin-right: 8px;"></div>
                    Complex Relations
                </div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 20px; height: 20px; background: #7209b7; border-radius: 50%; margin-right: 8px;"></div>
                    Normal
                </div>
            `;
            
            this.container.style.position = 'relative';
            this.container.appendChild(legend);
        }

        /**
         * Show detailed table information
         */
        showTableDetails(tableName) {
            const event = new CustomEvent('tableSelected', { 
                detail: { tableName: tableName } 
            });
            this.container.dispatchEvent(event);
        }

        /**
         * Clear visualization
         */
        clear() {
            this.container.innerHTML = '';
        }
    }

    // Export to global scope
    window.SQLVisualizer = SQLVisualizer;
    console.log('✅ SQL Visualizer loaded');
})();
