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
 * File: gembot-p5-machine-renderer.js
 * Declaration ID: IP-559C471B-MLL28ZUX
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GEMBOT P5 MACHINE RENDERER - 3D Machine Visualization & Game Mechanics 🤖💎
 * ═══════════════════════════════════════════════════════════════════════════════
 * Renders the GemBot faceting machine in 3D with real-time game mechanics,
 * educational diagrams, and interactive teaching visualizations.
 * 
 * Owner: Ryan Barbrick / Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * Signature: GBOT-RB-2025-7X9K2M4P-BARBRICK
 * ═══════════════════════════════════════════════════════════════════════════════
 */

window.GemBotP5Machine = {
    version: '1.0.0',
    p5Instance: null,
    initialized: false,
    
    // Render modes
    modes: {
        MACHINE_3D: 'machine3d',           // Full 3D machine view
        GEM_CUTTING: 'cutting',            // Active cutting visualization
        FACET_DIAGRAM: 'facets',           // Educational facet patterns
        ANGLE_GUIDE: 'angles',             // Cutting angle teaching
        CRYSTAL_STRUCTURE: 'crystal',      // Molecular structure
        GAME_HUD: 'hud',                   // Game overlay with score/progress
        QUALITY_ANALYSIS: 'quality',       // Gem quality inspection
        POLISH_ANIMATION: 'polish'         // Polish phase animation
    },
    
    currentMode: 'machine3d',
    
    // Machine configuration
    machine: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5,
        // Machine components
        components: {
            base: { width: 300, height: 40, depth: 200, color: '#2C3E50' },
            mast: { width: 40, height: 300, depth: 40, color: '#34495E' },
            arm: { width: 200, height: 30, depth: 30, color: '#7F8C8D' },
            dopStick: { length: 150, radius: 8, color: '#95A5A6' },
            lap: { radius: 120, height: 20, color: '#BDC3C7', spinning: true },
            gem: { size: 30, facets: 57, color: '#3498DB', quality: 100 }
        },
        animation: {
            armAngle: 0,
            dopRotation: 0,
            lapRotation: 0,
            cutting: false,
            polishing: false
        }
    },
    
    // Game mechanics
    game: {
        score: 0,
        level: 1,
        precision: 100,
        facetsCut: 0,
        totalFacets: 57,
        timeRemaining: 180,
        combo: 0,
        perfectCuts: 0,
        mistakes: 0,
        gemValue: 1000
    },
    
    // Educational content
    education: {
        currentLesson: 'brilliantCut',
        facetPatterns: {
            brilliantCut: {
                name: 'Brilliant Cut',
                facets: 57,
                crown: { main: 8, star: 8, upper: 16 },
                pavilion: { main: 8, lower: 16 },
                angles: { crown: 34, pavilion: 41 },
                ideal: true
            },
            emeraldCut: {
                name: 'Emerald Cut',
                facets: 49,
                crown: { main: 8, corners: 4, bezel: 8 },
                pavilion: { main: 8, step: 16 },
                angles: { crown: 42, pavilion: 43 }
            },
            princessCut: {
                name: 'Princess Cut',
                facets: 76,
                crown: { main: 4, chevron: 32 },
                pavilion: { main: 4, chevron: 32 },
                angles: { crown: 35, pavilion: 42 }
            }
        }
    },
    
    // Visual effects
    effects: {
        particles: [],
        sparkles: [],
        lightRays: [],
        gemGlow: { intensity: 1.0, pulse: 0 }
    },
    
    /**
     * Initialize the GemBot P5 Machine Renderer
     */
    async init(containerId = 'gembot-machine-canvas') {
        console.log('🤖💎 Initializing GemBot P5 Machine Renderer...');
        
        // Wait for p5.js
        if (!window.p5) {
            await this.loadP5();
        }
        
        // Create p5 instance with WEBGL
        this.createP5Instance(containerId);
        
        this.initialized = true;
        console.log('✅ GemBot Machine Renderer ready!');
    },
    
    async loadP5() {
        return new Promise((resolve) => {
            if (window.p5) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    },
    
    createP5Instance(containerId) {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.cssText = 'position:relative;width:100%;height:600px;';
            document.body.appendChild(container);
        }
        
        const self = this;
        
        this.p5Instance = new p5((p) => {
            p.setup = () => {
                const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL);
                canvas.parent(containerId);
                p.colorMode(p.RGB, 255);
                
                // Initialize particles
                self.initParticles(p);
            };
            
            p.draw = () => {
                p.background(10, 15, 25);
                
                // Update animations
                self.updateAnimations(p);
                
                // Render based on current mode
                switch(self.currentMode) {
                    case self.modes.MACHINE_3D:
                        self.drawMachine3D(p);
                        break;
                    case self.modes.GEM_CUTTING:
                        self.drawGemCutting(p);
                        break;
                    case self.modes.FACET_DIAGRAM:
                        self.drawFacetDiagram(p);
                        break;
                    case self.modes.ANGLE_GUIDE:
                        self.drawAngleGuide(p);
                        break;
                    case self.modes.CRYSTAL_STRUCTURE:
                        self.drawCrystalStructure(p);
                        break;
                    case self.modes.GAME_HUD:
                        self.drawGameHUD(p);
                        break;
                    case self.modes.QUALITY_ANALYSIS:
                        self.drawQualityAnalysis(p);
                        break;
                    case self.modes.POLISH_ANIMATION:
                        self.drawPolishAnimation(p);
                        break;
                }
                
                // Always show particles if cutting/polishing
                if (self.machine.animation.cutting || self.machine.animation.polishing) {
                    self.drawParticleEffects(p);
                }
            };
            
            p.windowResized = () => {
                if (container.offsetWidth && container.offsetHeight) {
                    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
                }
            };
            
            // Mouse interaction for 3D rotation
            p.mouseDragged = () => {
                if (self.currentMode === self.modes.MACHINE_3D) {
                    self.machine.rotation.y += (p.mouseX - p.pmouseX) * 0.01;
                    self.machine.rotation.x += (p.mouseY - p.pmouseY) * 0.01;
                }
            };
        });
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ANIMATION UPDATES
    // ═══════════════════════════════════════════════════════════════════════════
    
    updateAnimations(p) {
        // Lap rotation (always spinning)
        this.machine.animation.lapRotation += 0.1;
        
        // Dop rotation (when cutting)
        if (this.machine.animation.cutting) {
            this.machine.animation.dopRotation += 0.05;
        }
        
        // Gem glow pulse
        this.effects.gemGlow.pulse = p.sin(p.frameCount * 0.05) * 0.3 + 0.7;
        
        // Game timer
        if (this.machine.animation.cutting && this.game.timeRemaining > 0) {
            this.game.timeRemaining -= 0.016; // ~1 second per 60 frames
        }
    },
    
    initParticles(p) {
        this.effects.particles = [];
        for (let i = 0; i < 100; i++) {
            this.effects.particles.push({
                pos: p.createVector(p.random(-100, 100), p.random(-100, 100), p.random(-100, 100)),
                vel: p.createVector(p.random(-2, 2), p.random(-5, -1), p.random(-2, 2)),
                life: 255,
                size: p.random(1, 4)
            });
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // RENDERING MODES
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * 🤖 3D Machine View - Full faceting machine rendering
     */
    drawMachine3D(p) {
        p.push();
        
        // Camera setup
        p.rotateX(this.machine.rotation.x);
        p.rotateY(this.machine.rotation.y);
        p.scale(this.machine.scale);
        
        // Lighting
        p.ambientLight(60, 60, 80);
        p.directionalLight(255, 255, 255, 0, -1, -0.5);
        p.pointLight(150, 200, 255, 0, -200, 100);
        
        // Machine base
        p.push();
        p.translate(0, 100, 0);
        p.fill(44, 62, 80);
        p.box(this.machine.components.base.width, 
              this.machine.components.base.height, 
              this.machine.components.base.depth);
        p.pop();
        
        // Mast (vertical column)
        p.push();
        p.translate(-100, -50, 0);
        p.fill(52, 73, 94);
        p.box(this.machine.components.mast.width, 
              this.machine.components.mast.height, 
              this.machine.components.mast.depth);
        p.pop();
        
        // Arm (horizontal)
        p.push();
        p.translate(0, -100, 0);
        p.rotateZ(p.radians(this.machine.animation.armAngle));
        p.fill(127, 140, 141);
        p.box(this.machine.components.arm.width, 
              this.machine.components.arm.height, 
              this.machine.components.arm.depth);
        p.pop();
        
        // Dop stick with gem
        p.push();
        p.translate(0, -30, 0);
        p.rotateX(p.HALF_PI);
        p.rotateZ(this.machine.animation.dopRotation);
        
        // Dop stick
        p.fill(149, 165, 166);
        p.cylinder(this.machine.components.dopStick.radius, 
                   this.machine.components.dopStick.length);
        
        // Gem at end of dop
        p.translate(0, this.machine.components.dopStick.length / 2 + 20, 0);
        this.drawGem(p, this.machine.components.gem.size);
        p.pop();
        
        // Lap (cutting/polishing wheel)
        p.push();
        p.translate(0, 50, 0);
        p.rotateX(p.HALF_PI);
        p.rotateZ(this.machine.animation.lapRotation);
        p.fill(189, 195, 199);
        p.cylinder(this.machine.components.lap.radius, 
                   this.machine.components.lap.height);
        
        // Lap surface detail
        p.fill(160, 170, 175);
        p.cylinder(this.machine.components.lap.radius - 5, 
                   this.machine.components.lap.height + 1);
        p.pop();
        
        p.pop();
    },
    
    /**
     * 💎 Gem Cutting Mode - Active cutting visualization
     */
    drawGemCutting(p) {
        p.push();
        
        // Camera close-up on gem
        p.rotateX(-0.3);
        p.rotateY(p.frameCount * 0.01);
        
        // Main lighting
        p.ambientLight(80);
        p.directionalLight(255, 255, 255, 0, -1, -1);
        
        // Draw large gem
        this.drawGem(p, 80, true);
        
        // Show cutting contact point
        if (this.machine.animation.cutting) {
            p.push();
            p.translate(0, 85, 0);
            p.fill(255, 100, 0, 150);
            p.sphere(5);
            
            // Sparks at contact
            for (let i = 0; i < 10; i++) {
                p.push();
                const angle = (p.TWO_PI / 10) * i + p.frameCount * 0.1;
                p.translate(p.cos(angle) * 15, p.sin(angle) * 15, 0);
                p.fill(255, 200, 50, 200);
                p.sphere(2);
                p.pop();
            }
            p.pop();
        }
        
        p.pop();
        
        // Progress bar
        this.draw2DOverlay(p, () => {
            const progress = this.game.facetsCut / this.game.totalFacets;
            const barWidth = 300;
            const barHeight = 30;
            const x = -barWidth / 2;
            const y = p.height / 2 - 80;
            
            // Background
            p.fill(30, 30, 40);
            p.rect(x, y, barWidth, barHeight, 5);
            
            // Progress fill
            p.fill(52, 152, 219);
            p.rect(x, y, barWidth * progress, barHeight, 5);
            
            // Text
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(16);
            p.text(`Facet ${this.game.facetsCut} / ${this.game.totalFacets}`, 0, y + barHeight / 2);
        });
    },
    
    /**
     * 📐 Facet Diagram - Educational facet pattern
     */
    drawFacetDiagram(p) {
        const pattern = this.education.facetPatterns[this.education.currentLesson];
        
        this.draw2DOverlay(p, () => {
            p.textAlign(p.CENTER);
            p.fill(255);
            p.textSize(24);
            p.text(pattern.name, 0, -p.height / 2 + 40);
            p.textSize(16);
            p.text(`${pattern.facets} Total Facets`, 0, -p.height / 2 + 70);
            
            // Draw crown view (top)
            p.push();
            p.translate(-150, -50);
            this.drawCrownDiagram(p, pattern);
            p.pop();
            
            // Draw pavilion view (bottom)
            p.push();
            p.translate(150, -50);
            this.drawPavilionDiagram(p, pattern);
            p.pop();
            
            // Side profile
            p.push();
            p.translate(0, 150);
            this.drawSideProfile(p, pattern);
            p.pop();
            
            // Angle measurements
            p.fill(100, 255, 100);
            p.textSize(14);
            p.text(`Crown Angle: ${pattern.angles.crown}°`, -150, 120);
            p.text(`Pavilion Angle: ${pattern.angles.pavilion}°`, 150, 120);
        });
    },
    
    /**
     * 📏 Angle Guide - Cutting angle teaching tool
     */
    drawAngleGuide(p) {
        const pattern = this.education.facetPatterns[this.education.currentLesson];
        
        this.draw2DOverlay(p, () => {
            p.textAlign(p.CENTER);
            p.fill(255);
            p.textSize(20);
            p.text('Cutting Angle Guide', 0, -p.height / 2 + 40);
            
            // Large angle visualization
            const centerX = 0;
            const centerY = 0;
            const radius = 150;
            
            // Baseline (lap)
            p.stroke(100);
            p.strokeWeight(3);
            p.line(-200, centerY, 200, centerY);
            
            // Crown angle
            p.stroke(100, 255, 100);
            p.strokeWeight(2);
            const crownRad = p.radians(pattern.angles.crown);
            p.line(centerX, centerY, 
                   centerX + p.cos(crownRad) * radius, 
                   centerY - p.sin(crownRad) * radius);
            
            // Pavilion angle
            p.stroke(255, 100, 100);
            const pavilionRad = p.radians(pattern.angles.pavilion);
            p.line(centerX, centerY, 
                   centerX + p.cos(pavilionRad) * radius, 
                   centerY + p.sin(pavilionRad) * radius);
            
            // Angle arcs
            p.noFill();
            p.stroke(100, 255, 100, 150);
            p.arc(centerX, centerY, 100, 100, -crownRad, 0);
            
            p.stroke(255, 100, 100, 150);
            p.arc(centerX, centerY, 100, 100, 0, pavilionRad);
            
            // Labels
            p.noStroke();
            p.fill(100, 255, 100);
            p.text(`${pattern.angles.crown}°`, centerX + 80, centerY - 80);
            p.fill(255, 100, 100);
            p.text(`${pattern.angles.pavilion}°`, centerX + 80, centerY + 80);
        });
    },
    
    /**
     * 🔬 Crystal Structure - Molecular/atomic structure
     */
    drawCrystalStructure(p) {
        p.push();
        
        p.rotateY(p.frameCount * 0.01);
        p.rotateX(p.sin(p.frameCount * 0.005) * 0.3);
        
        // Lighting
        p.ambientLight(100);
        p.pointLight(255, 255, 255, 200, -200, 200);
        
        // Draw crystal lattice (diamond structure)
        const spacing = 60;
        const atoms = [
            [0, 0, 0], [spacing, spacing, 0], [spacing, 0, spacing], [0, spacing, spacing],
            [spacing/2, spacing/2, spacing/2], [-spacing, -spacing, 0], [-spacing, 0, -spacing], [0, -spacing, -spacing]
        ];
        
        // Bonds
        p.stroke(100, 150, 255, 150);
        p.strokeWeight(2);
        for (let i = 0; i < atoms.length; i++) {
            for (let j = i + 1; j < atoms.length; j++) {
                const dist = p.dist(atoms[i][0], atoms[i][1], atoms[i][2],
                                    atoms[j][0], atoms[j][1], atoms[j][2]);
                if (dist < spacing * 1.5) {
                    p.line(atoms[i][0], atoms[i][1], atoms[i][2],
                           atoms[j][0], atoms[j][1], atoms[j][2]);
                }
            }
        }
        
        // Atoms
        p.noStroke();
        atoms.forEach(atom => {
            p.push();
            p.translate(atom[0], atom[1], atom[2]);
            p.fill(100, 150, 255);
            p.sphere(12);
            // Glow
            p.fill(150, 200, 255, 100);
            p.sphere(16);
            p.pop();
        });
        
        p.pop();
        
        // Info overlay
        this.draw2DOverlay(p, () => {
            p.textAlign(p.CENTER);
            p.fill(255);
            p.textSize(20);
            p.text('Diamond Crystal Structure', 0, -p.height / 2 + 40);
            p.textSize(14);
            p.fill(200);
            p.text('Cubic lattice - Hardness 10 (Mohs)', 0, -p.height / 2 + 70);
        });
    },
    
    /**
     * 🎮 Game HUD - Score, combo, quality display
     */
    drawGameHUD(p) {
        // 3D gem in background
        p.push();
        p.rotateY(p.frameCount * 0.02);
        p.rotateX(-0.2);
        p.scale(0.5);
        this.drawGem(p, 100, true);
        p.pop();
        
        // HUD overlay
        this.draw2DOverlay(p, () => {
            const padding = 20;
            
            // Score (top left)
            p.textAlign(p.LEFT, p.TOP);
            p.fill(255, 215, 0);
            p.textSize(28);
            p.text(`💎 ${this.game.score.toLocaleString()}`, -p.width / 2 + padding, -p.height / 2 + padding);
            
            // Level (top center)
            p.textAlign(p.CENTER, p.TOP);
            p.fill(100, 200, 255);
            p.textSize(24);
            p.text(`Level ${this.game.level}`, 0, -p.height / 2 + padding);
            
            // Time (top right)
            p.textAlign(p.RIGHT, p.TOP);
            const minutes = Math.floor(this.game.timeRemaining / 60);
            const seconds = Math.floor(this.game.timeRemaining % 60);
            const timeColor = this.game.timeRemaining < 30 ? [255, 50, 50] : [255, 255, 255];
            p.fill(...timeColor);
            p.textSize(24);
            p.text(`⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`, p.width / 2 - padding, -p.height / 2 + padding);
            
            // Precision meter (right side)
            p.push();
            p.translate(p.width / 2 - 80, 0);
            this.drawPrecisionMeter(p);
            p.pop();
            
            // Combo (bottom center)
            if (this.game.combo > 1) {
                p.textAlign(p.CENTER, p.BOTTOM);
                p.fill(255, 100, 255);
                p.textSize(36 + Math.sin(p.frameCount * 0.1) * 4);
                p.text(`${this.game.combo}x COMBO!`, 0, p.height / 2 - 100);
            }
            
            // Stats (bottom left)
            p.textAlign(p.LEFT, p.BOTTOM);
            p.fill(200);
            p.textSize(14);
            p.text(`✨ Perfect Cuts: ${this.game.perfectCuts}`, -p.width / 2 + padding, p.height / 2 - padding - 40);
            p.text(`❌ Mistakes: ${this.game.mistakes}`, -p.width / 2 + padding, p.height / 2 - padding - 20);
            p.text(`💰 Gem Value: $${this.game.gemValue.toLocaleString()}`, -p.width / 2 + padding, p.height / 2 - padding);
        });
    },
    
    /**
     * 🔍 Quality Analysis - Gem quality inspection
     */
    drawQualityAnalysis(p) {
        p.push();
        p.rotateY(p.frameCount * 0.01);
        
        // Draw gem with quality highlights
        this.drawGem(p, 80, true);
        
        // Quality zones (different colors for different quality areas)
        const zones = [
            { angle: 0, quality: 98, color: [100, 255, 100] },
            { angle: p.TWO_PI / 4, quality: 95, color: [100, 255, 100] },
            { angle: p.TWO_PI / 2, quality: 87, color: [255, 255, 100] },
            { angle: 3 * p.TWO_PI / 4, quality: 92, color: [100, 255, 100] }
        ];
        
        zones.forEach(zone => {
            p.push();
            p.rotateY(zone.angle);
            p.translate(0, 0, 90);
            p.fill(...zone.color, 100);
            p.sphere(10);
            p.pop();
        });
        
        p.pop();
        
        // Analysis overlay
        this.draw2DOverlay(p, () => {
            p.textAlign(p.CENTER);
            p.fill(255);
            p.textSize(24);
            p.text('Gem Quality Analysis', 0, -p.height / 2 + 40);
            
            // Overall quality
            const quality = this.machine.components.gem.quality;
            const qualityColor = quality >= 95 ? [100, 255, 100] : 
                                quality >= 85 ? [255, 255, 100] : [255, 100, 100];
            p.fill(...qualityColor);
            p.textSize(48);
            p.text(`${quality}%`, 0, p.height / 2 - 150);
            p.textSize(18);
            p.text(this.getQualityGrade(quality), 0, p.height / 2 - 100);
            
            // Quality metrics
            p.textAlign(p.LEFT);
            p.fill(200);
            p.textSize(14);
            const metrics = [
                `✨ Symmetry: ${(quality - Math.random() * 3).toFixed(1)}%`,
                `💎 Polish: ${(quality - Math.random() * 2).toFixed(1)}%`,
                `🔍 Clarity: ${(quality - Math.random() * 5).toFixed(1)}%`,
                `📐 Proportions: ${(quality - Math.random() * 4).toFixed(1)}%`
            ];
            metrics.forEach((metric, i) => {
                p.text(metric, -p.width / 2 + 20, p.height / 2 - 80 + i * 20);
            });
        });
    },
    
    /**
     * ✨ Polish Animation - Final polishing phase
     */
    drawPolishAnimation(p) {
        p.push();
        
        p.rotateY(p.frameCount * 0.02);
        p.rotateX(p.sin(p.frameCount * 0.01) * 0.1);
        
        // Enhanced lighting for sparkle
        p.ambientLight(120);
        p.pointLight(255, 255, 255, 200, -200, 200);
        p.pointLight(255, 200, 150, -200, 200, -200);
        
        // Draw gem with extra sparkle
        this.drawGem(p, 80, true);
        
        // Sparkle particles orbiting
        for (let i = 0; i < 20; i++) {
            const angle = (p.TWO_PI / 20) * i + p.frameCount * 0.05;
            const radius = 120 + p.sin(p.frameCount * 0.1 + i) * 20;
            const x = p.cos(angle) * radius;
            const z = p.sin(angle) * radius;
            const y = p.sin(p.frameCount * 0.1 + i) * 30;
            
            p.push();
            p.translate(x, y, z);
            p.noStroke();
            p.fill(255, 255, 200, 200);
            p.sphere(3);
            p.pop();
        }
        
        p.pop();
        
        // Polish text
        this.draw2DOverlay(p, () => {
            p.textAlign(p.CENTER);
            p.fill(255, 215, 0);
            p.textSize(32);
            p.text('✨ POLISHING ✨', 0, -p.height / 2 + 50);
            
            const progress = (p.sin(p.frameCount * 0.05) + 1) / 2 * 100;
            p.textSize(20);
            p.fill(200);
            p.text(`${progress.toFixed(0)}% Complete`, 0, p.height / 2 - 50);
        });
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER DRAWING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Draw a faceted gem with realistic appearance
     */
    drawGem(p, size, enhanced = false) {
        p.push();
        
        // Gem material
        p.specularMaterial(100, 150, 255);
        p.shininess(50);
        
        // Main gem body (simplified brilliant cut)
        p.fill(52, 152, 219, 200);
        
        // Crown (top part)
        p.push();
        p.rotateX(p.PI);
        p.cone(size, size * 0.6, 8);
        p.pop();
        
        // Pavilion (bottom part)
        p.push();
        p.cone(size * 0.7, size * 1.2, 8);
        p.pop();
        
        // Enhanced glow effect
        if (enhanced) {
            p.noStroke();
            p.fill(100, 200, 255, 50 * this.effects.gemGlow.pulse);
            p.sphere(size * 1.3);
        }
        
        p.pop();
    },
    
    /**
     * Draw crown facet diagram (top view)
     */
    drawCrownDiagram(p, pattern) {
        const radius = 80;
        
        p.noFill();
        p.stroke(100, 255, 100);
        p.strokeWeight(2);
        
        // Outer circle
        p.circle(0, 0, radius * 2);
        
        // Table (center)
        p.circle(0, 0, radius * 0.5);
        
        // Main facets
        const mainCount = pattern.crown.main || 8;
        for (let i = 0; i < mainCount; i++) {
            const angle = (p.TWO_PI / mainCount) * i;
            p.line(0, 0, 
                   p.cos(angle) * radius, 
                   p.sin(angle) * radius);
        }
        
        // Label
        p.fill(100, 255, 100);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(12);
        p.text('Crown (Top)', 0, radius + 20);
    },
    
    /**
     * Draw pavilion facet diagram (bottom view)
     */
    drawPavilionDiagram(p, pattern) {
        const radius = 80;
        
        p.noFill();
        p.stroke(255, 100, 100);
        p.strokeWeight(2);
        
        // Outer circle
        p.circle(0, 0, radius * 2);
        
        // Culet (point)
        p.circle(0, 0, 5);
        
        // Main facets
        const mainCount = pattern.pavilion.main || 8;
        for (let i = 0; i < mainCount; i++) {
            const angle = (p.TWO_PI / mainCount) * i;
            p.line(0, 0, 
                   p.cos(angle) * radius, 
                   p.sin(angle) * radius);
        }
        
        // Label
        p.fill(255, 100, 100);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(12);
        p.text('Pavilion (Bottom)', 0, radius + 20);
    },
    
    /**
     * Draw side profile with angles
     */
    drawSideProfile(p, pattern) {
        p.stroke(255);
        p.strokeWeight(2);
        p.noFill();
        
        const width = 100;
        const crownHeight = 40;
        const pavilionHeight = 60;
        
        // Profile outline
        p.beginShape();
        p.vertex(0, 0); // Table center
        p.vertex(width, -crownHeight); // Crown edge
        p.vertex(width, 0); // Girdle
        p.vertex(0, pavilionHeight); // Culet
        p.vertex(-width, 0); // Girdle
        p.vertex(-width, -crownHeight); // Crown edge
        p.vertex(0, 0); // Back to table
        p.endShape();
        
        // Labels
        p.fill(255);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(11);
        p.text('Table', 0, -5);
        p.text('Girdle', width + 30, 5);
        p.text('Culet', 0, pavilionHeight + 15);
    },
    
    /**
     * Draw precision meter
     */
    drawPrecisionMeter(p) {
        const width = 30;
        const height = 200;
        const precision = this.game.precision;
        
        // Background
        p.fill(30, 30, 40);
        p.rect(-width / 2, -height / 2, width, height, 5);
        
        // Fill (bottom to top)
        const fillHeight = (precision / 100) * height;
        const fillY = height / 2 - fillHeight;
        
        const color = precision >= 95 ? [100, 255, 100] : 
                     precision >= 80 ? [255, 255, 100] : [255, 100, 100];
        p.fill(...color);
        p.rect(-width / 2, fillY, width, fillHeight, 0, 0, 5, 5);
        
        // Label
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(12);
        p.text('Precision', 0, height / 2 + 20);
        p.text(`${precision}%`, 0, height / 2 + 35);
    },
    
    /**
     * Draw particle effects (sparks, dust)
     */
    drawParticleEffects(p) {
        this.effects.particles.forEach(particle => {
            if (particle.life <= 0) {
                // Reset particle
                particle.pos.set(p.random(-10, 10), 0, p.random(-10, 10));
                particle.vel.set(p.random(-2, 2), p.random(-5, -1), p.random(-2, 2));
                particle.life = 255;
            }
            
            particle.vel.y += 0.1; // Gravity
            particle.pos.add(particle.vel);
            particle.life -= 3;
            
            p.push();
            p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
            p.noStroke();
            p.fill(255, 200, 100, particle.life);
            p.sphere(particle.size);
            p.pop();
        });
    },
    
    /**
     * Helper to draw 2D overlay on top of 3D scene
     */
    draw2DOverlay(p, drawFunc) {
        // Save 3D state
        p.push();
        
        // Reset to 2D
        p.resetMatrix();
        p.camera(0, 0, (p.height / 2) / p.tan(p.PI / 6), 0, 0, 0, 0, 1, 0);
        
        // Execute drawing function
        drawFunc();
        
        p.pop();
    },
    
    /**
     * Get quality grade text
     */
    getQualityGrade(quality) {
        if (quality >= 98) return 'FLAWLESS';
        if (quality >= 95) return 'EXCELLENT';
        if (quality >= 90) return 'VERY GOOD';
        if (quality >= 85) return 'GOOD';
        if (quality >= 80) return 'FAIR';
        return 'POOR';
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    setMode(mode) {
        if (Object.values(this.modes).includes(mode)) {
            this.currentMode = mode;
            console.log(`🤖 GemBot mode: ${mode}`);
        }
    },
    
    startCutting() {
        this.machine.animation.cutting = true;
        this.game.timeRemaining = 180;
        console.log('💎 Cutting started!');
    },
    
    stopCutting() {
        this.machine.animation.cutting = false;
        console.log('💎 Cutting stopped');
    },
    
    startPolishing() {
        this.machine.animation.polishing = true;
        this.setMode(this.modes.POLISH_ANIMATION);
        console.log('✨ Polishing started!');
    },
    
    completeFacet(perfect = true) {
        this.game.facetsCut++;
        if (perfect) {
            this.game.perfectCuts++;
            this.game.combo++;
            this.game.score += 100 * this.game.combo;
        } else {
            this.game.mistakes++;
            this.game.combo = 0;
            this.game.score += 50;
        }
        
        // Update gem quality
        this.machine.components.gem.quality = Math.min(100, 
            85 + (this.game.perfectCuts / this.game.facetsCut) * 15);
        
        console.log(`✅ Facet ${this.game.facetsCut} complete! Score: ${this.game.score}`);
    },
    
    setLesson(lessonName) {
        if (this.education.facetPatterns[lessonName]) {
            this.education.currentLesson = lessonName;
            this.game.totalFacets = this.education.facetPatterns[lessonName].facets;
            console.log(`📚 Lesson: ${this.education.facetPatterns[lessonName].name}`);
        }
    },
    
    resetGame() {
        this.game = {
            score: 0,
            level: 1,
            precision: 100,
            facetsCut: 0,
            totalFacets: 57,
            timeRemaining: 180,
            combo: 0,
            perfectCuts: 0,
            mistakes: 0,
            gemValue: 1000
        };
        console.log('🔄 Game reset');
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for container to exist
        setTimeout(() => GemBotP5Machine.init(), 1000);
    });
} else {
    setTimeout(() => GemBotP5Machine.init(), 1000);
}

// Global access
window.gembot = window.gembot || {};
window.gembot.machine = GemBotP5Machine;

console.log('🤖💎 GemBot P5 Machine Renderer loaded');
