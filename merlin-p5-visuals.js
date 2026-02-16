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
 * File: merlin-p5-visuals.js
 * Declaration ID: IP-341FB416-MLL28ZVI
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN AI - P5.JS ADVANCED VISUAL SYSTEM 🧙‍♂️✨
 * ═══════════════════════════════════════════════════════════════════════════════
 * Inspired by Creativeguru97's YouTube tutorials:
 * - Play with geometry (3D shapes, polar coordinates, spherical coordinates)
 * - Play with noise (Perlin noise, flow fields, organic motion)
 * - p5.js hacks (glow effects, gradients, advanced rendering)
 * - Web APIs integration (ML, real-time data)
 * 
 * Owner: Ryan Barbrick / Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * ═══════════════════════════════════════════════════════════════════════════════
 */

window.MerlinP5Visuals = {
    version: '1.0.0',
    p5Instance: null,
    initialized: false,
    
    // Visual modes
    modes: {
        CRYSTAL_FIELD: 'crystal',
        POLAR_GEMS: 'polar',
        NOISE_FLOW: 'flow',
        SPHERICAL_ORBIT: 'sphere',
        TOROIDAL_DANCE: 'torus',
        WIZARD_AURA: 'aura',
        SACRED_GEOMETRY: 'sacred'
    },
    
    currentMode: 'crystal',
    
    // Configuration
    config: {
        canvasId: 'merlin-p5-canvas',
        alpha: 0.15, // Background transparency
        glowStrength: 3,
        particleCount: 100,
        noiseScale: 0.01,
        orbitRadius: 200,
        colorScheme: 'mystic' // mystic, galaxy, rainbow, fire
    },
    
    // Color palettes
    colorPalettes: {
        mystic: ['#7F00FF', '#E100FF', '#00D4FF', '#00FFF7', '#FFD700'],
        galaxy: ['#1B2735', '#090A0F', '#EF476F', '#FFD166', '#06FFA5'],
        rainbow: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
        fire: ['#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFFFF']
    },
    
    // Animation data
    animation: {
        time: 0,
        speed: 0.01,
        flowField: [],
        particles: [],
        orbiters: [],
        crystals: []
    },
    
    /**
     * Initialize the p5.js visual system
     */
    async init() {
        console.log('🧙‍♂️✨ Initializing Merlin P5 Visuals...');
        
        // Wait for p5.js to load
        if (!window.p5) {
            await this.loadP5();
        }
        
        // Create p5 instance
        this.createP5Instance();
        
        this.initialized = true;
        console.log('✅ Merlin P5 Visuals ready!');
    },
    
    /**
     * Load p5.js library
     */
    async loadP5() {
        return new Promise((resolve, reject) => {
            if (window.p5) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
            script.onload = resolve;
            script.onerror = () => {
                console.error('Failed to load p5.js');
                reject();
            };
            document.head.appendChild(script);
        });
    },
    
    /**
     * Create the p5 canvas instance
     */
    createP5Instance() {
        // Create container
        let container = document.getElementById(this.config.canvasId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.config.canvasId;
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
            document.body.insertBefore(container, document.body.firstChild);
        }
        
        const self = this;
        
        this.p5Instance = new p5((p) => {
            const colors = self.colorPalettes[self.config.colorScheme];
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent(self.config.canvasId);
                p.colorMode(p.HSB, 360, 100, 100, 100);
                
                // Initialize particles
                self.initParticles(p);
                self.initOrbiters(p);
                self.initCrystals(p);
                self.initFlowField(p);
            };
            
            p.draw = () => {
                // Subtle transparent background for trail effect
                p.background(0, 0, 0, self.config.alpha);
                
                self.animation.time += self.animation.speed;
                
                // Render based on current mode
                switch(self.currentMode) {
                    case self.modes.CRYSTAL_FIELD:
                        self.drawCrystalField(p);
                        break;
                    case self.modes.POLAR_GEMS:
                        self.drawPolarGems(p);
                        break;
                    case self.modes.NOISE_FLOW:
                        self.drawNoiseFlow(p);
                        break;
                    case self.modes.SPHERICAL_ORBIT:
                        self.drawSphericalOrbit(p);
                        break;
                    case self.modes.TOROIDAL_DANCE:
                        self.drawToroidalDance(p);
                        break;
                    case self.modes.WIZARD_AURA:
                        self.drawWizardAura(p);
                        break;
                    case self.modes.SACRED_GEOMETRY:
                        self.drawSacredGeometry(p);
                        break;
                    default:
                        self.drawCrystalField(p);
                }
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
                self.initFlowField(p);
            };
            
            // Mouse interaction
            p.mouseMoved = () => {
                if (p.mouseX > 0 && p.mouseY > 0) {
                    self.triggerMouseEffect(p, p.mouseX, p.mouseY);
                }
            };
        });
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    initParticles(p) {
        this.animation.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.animation.particles.push({
                pos: p.createVector(p.random(p.width), p.random(p.height)),
                vel: p.createVector(0, 0),
                acc: p.createVector(0, 0),
                maxSpeed: 4,
                hue: p.random(360),
                size: p.random(2, 8),
                life: 255
            });
        }
    },
    
    initOrbiters(p) {
        this.animation.orbiters = [];
        const count = 8;
        for (let i = 0; i < count; i++) {
            this.animation.orbiters.push({
                angle: (p.TWO_PI / count) * i,
                radius: this.config.orbitRadius,
                speed: p.random(0.01, 0.03),
                hue: (360 / count) * i,
                size: p.random(10, 20),
                orbitOffset: p.random(p.TWO_PI)
            });
        }
    },
    
    initCrystals(p) {
        this.animation.crystals = [];
        for (let i = 0; i < 20; i++) {
            this.animation.crystals.push({
                x: p.random(p.width),
                y: p.random(p.height),
                size: p.random(30, 80),
                rotation: p.random(p.TWO_PI),
                rotSpeed: p.random(-0.02, 0.02),
                hue: p.random(360),
                sides: p.floor(p.random(5, 8)),
                glowSize: p.random(20, 50)
            });
        }
    },
    
    initFlowField(p) {
        const resolution = 20;
        const cols = p.floor(p.width / resolution);
        const rows = p.floor(p.height / resolution);
        
        this.animation.flowField = [];
        for (let i = 0; i < cols; i++) {
            this.animation.flowField[i] = [];
            for (let j = 0; j < rows; j++) {
                const angle = p.noise(i * this.config.noiseScale, j * this.config.noiseScale) * p.TWO_PI * 4;
                this.animation.flowField[i][j] = p.createVector(p.cos(angle), p.sin(angle));
            }
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DRAWING MODES
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Crystal Field - Floating crystals with glow effects
     */
    drawCrystalField(p) {
        p.push();
        p.translate(p.width / 2, p.height / 2);
        
        this.animation.crystals.forEach(crystal => {
            p.push();
            p.translate(
                crystal.x - p.width / 2 + p.sin(this.animation.time + crystal.rotation) * 30,
                crystal.y - p.height / 2 + p.cos(this.animation.time + crystal.rotation) * 30
            );
            p.rotate(crystal.rotation);
            crystal.rotation += crystal.rotSpeed;
            
            // Glow effect
            for (let i = 3; i > 0; i--) {
                p.fill(crystal.hue, 80, 100, 10 * i);
                p.noStroke();
                this.drawPolygon(p, 0, 0, crystal.size + crystal.glowSize * i, crystal.sides);
            }
            
            // Main crystal
            p.fill(crystal.hue, 90, 100, 80);
            p.stroke(crystal.hue, 100, 100);
            p.strokeWeight(2);
            this.drawPolygon(p, 0, 0, crystal.size, crystal.sides);
            
            p.pop();
        });
        
        p.pop();
    },
    
    /**
     * Polar Gems - Gems arranged in polar coordinates with sine/cosine motion
     */
    drawPolarGems(p) {
        p.push();
        p.translate(p.width / 2, p.height / 2);
        
        const rings = 5;
        const gemsPerRing = 12;
        
        for (let ring = 1; ring <= rings; ring++) {
            const radius = ring * 80;
            
            for (let i = 0; i < gemsPerRing; i++) {
                const angle = (p.TWO_PI / gemsPerRing) * i + this.animation.time * ring * 0.5;
                const x = p.cos(angle) * radius;
                const y = p.sin(angle) * radius;
                
                // Pulsating size based on sine wave
                const size = 15 + p.sin(this.animation.time * 3 + ring + i) * 5;
                
                // Color based on angle and ring
                const hue = (angle * 180 / p.PI + ring * 60) % 360;
                
                // Glow
                p.noStroke();
                p.fill(hue, 80, 100, 30);
                p.circle(x, y, size * 3);
                
                // Gem
                p.fill(hue, 90, 100);
                p.stroke(hue, 100, 100);
                p.strokeWeight(1);
                this.drawDiamond(p, x, y, size);
            }
        }
        
        p.pop();
    },
    
    /**
     * Noise Flow - Particles following Perlin noise flow field
     */
    drawNoiseFlow(p) {
        const resolution = 20;
        
        this.animation.particles.forEach(particle => {
            // Follow flow field
            const col = p.floor(particle.pos.x / resolution);
            const row = p.floor(particle.pos.y / resolution);
            
            if (this.animation.flowField[col] && this.animation.flowField[col][row]) {
                const force = this.animation.flowField[col][row].copy();
                force.mult(0.5);
                particle.acc.add(force);
            }
            
            // Update
            particle.vel.add(particle.acc);
            particle.vel.limit(particle.maxSpeed);
            particle.pos.add(particle.vel);
            particle.acc.mult(0);
            
            // Wrap edges
            if (particle.pos.x > p.width) particle.pos.x = 0;
            if (particle.pos.x < 0) particle.pos.x = p.width;
            if (particle.pos.y > p.height) particle.pos.y = 0;
            if (particle.pos.y < 0) particle.pos.y = p.height;
            
            // Draw
            p.noStroke();
            p.fill(particle.hue, 80, 100, 60);
            p.circle(particle.pos.x, particle.pos.y, particle.size);
            
            // Trail
            p.stroke(particle.hue, 80, 100, 20);
            p.strokeWeight(2);
            p.line(
                particle.pos.x, particle.pos.y,
                particle.pos.x - particle.vel.x * 2,
                particle.pos.y - particle.vel.y * 2
            );
        });
        
        // Update noise field gradually
        if (p.frameCount % 60 === 0) {
            this.initFlowField(p);
        }
    },
    
    /**
     * Spherical Orbit - 3D-looking orbit using spherical coordinates
     */
    drawSphericalOrbit(p) {
        p.push();
        p.translate(p.width / 2, p.height / 2);
        
        this.animation.orbiters.forEach((orbiter, i) => {
            orbiter.angle += orbiter.speed;
            
            // Spherical coordinates
            const phi = orbiter.angle;
            const theta = p.sin(this.animation.time * 2 + orbiter.orbitOffset) * p.PI;
            
            const x = orbiter.radius * p.sin(theta) * p.cos(phi);
            const y = orbiter.radius * p.sin(theta) * p.sin(phi);
            const z = orbiter.radius * p.cos(theta);
            
            // Perspective projection
            const scale = 200 / (200 + z);
            const projX = x * scale;
            const projY = y * scale;
            const size = orbiter.size * scale;
            
            // Glow based on depth
            const alpha = p.map(z, -orbiter.radius, orbiter.radius, 30, 80);
            
            p.noStroke();
            p.fill(orbiter.hue, 80, 100, alpha);
            p.circle(projX, projY, size * 2);
            
            // Core
            p.fill(orbiter.hue, 90, 100);
            p.stroke(orbiter.hue, 100, 100);
            p.strokeWeight(2);
            this.drawDiamond(p, projX, projY, size);
        });
        
        p.pop();
    },
    
    /**
     * Toroidal Dance - Torus-shaped gem dance
     */
    drawToroidalDance(p) {
        p.push();
        p.translate(p.width / 2, p.height / 2);
        
        const R = 150; // Major radius
        const r = 50;  // Minor radius
        const count = 30;
        
        for (let i = 0; i < count; i++) {
            const u = (i / count) * p.TWO_PI + this.animation.time;
            const v = this.animation.time * 2 + i * 0.2;
            
            // Toroidal coordinates
            const x = (R + r * p.cos(v)) * p.cos(u);
            const y = (R + r * p.cos(v)) * p.sin(u);
            const z = r * p.sin(v);
            
            // Perspective
            const scale = 200 / (200 + z);
            const projX = x * scale;
            const projY = y * scale;
            const size = 10 * scale;
            
            const hue = (i * 12 + this.animation.time * 100) % 360;
            
            p.noStroke();
            p.fill(hue, 80, 100, 50);
            p.circle(projX, projY, size * 2);
            
            p.fill(hue, 90, 100);
            p.stroke(hue, 100, 100);
            p.strokeWeight(1);
            p.circle(projX, projY, size);
        }
        
        p.pop();
    },
    
    /**
     * Wizard Aura - Mystical energy rings
     */
    drawWizardAura(p) {
        p.push();
        p.translate(p.width / 2, p.height / 2);
        
        const rings = 8;
        for (let i = 0; i < rings; i++) {
            const radius = 100 + i * 40 + p.sin(this.animation.time * 2 + i) * 20;
            const hue = (this.animation.time * 50 + i * 45) % 360;
            const alpha = p.map(p.sin(this.animation.time * 3 + i), -1, 1, 10, 40);
            
            p.noFill();
            p.stroke(hue, 80, 100, alpha);
            p.strokeWeight(3);
            p.circle(0, 0, radius * 2);
            
            // Add particles on rings
            const particlesOnRing = 12;
            for (let j = 0; j < particlesOnRing; j++) {
                const angle = (p.TWO_PI / particlesOnRing) * j + this.animation.time * (i % 2 === 0 ? 1 : -1);
                const x = p.cos(angle) * radius;
                const y = p.sin(angle) * radius;
                
                p.noStroke();
                p.fill(hue, 90, 100, alpha * 2);
                p.circle(x, y, 8);
            }
        }
        
        p.pop();
    },
    
    /**
     * Sacred Geometry - Flower of life and geometric patterns
     */
    drawSacredGeometry(p) {
        p.push();
        p.translate(p.width / 2, p.height / 2);
        
        const radius = 60;
        const circles = 19; // Flower of life pattern
        
        // Main circle
        p.noFill();
        p.stroke(200, 80, 100, 50);
        p.strokeWeight(2);
        p.circle(0, 0, radius * 2);
        
        // Six circles around
        for (let i = 0; i < 6; i++) {
            const angle = (p.TWO_PI / 6) * i + this.animation.time * 0.5;
            const x = p.cos(angle) * radius;
            const y = p.sin(angle) * radius;
            
            const hue = (60 * i + this.animation.time * 50) % 360;
            p.stroke(hue, 80, 100, 40);
            p.circle(x, y, radius * 2);
            
            // Second layer
            for (let j = 0; j < 2; j++) {
                const angle2 = angle + (p.TWO_PI / 6) * (j + 1);
                const x2 = x + p.cos(angle2) * radius;
                const y2 = y + p.sin(angle2) * radius;
                
                p.stroke(hue, 70, 100, 20);
                p.circle(x2, y2, radius * 2);
            }
        }
        
        // Metatron's cube lines
        p.stroke(280, 80, 100, 20);
        p.strokeWeight(1);
        for (let i = 0; i < 6; i++) {
            const angle1 = (p.TWO_PI / 6) * i;
            for (let j = i + 1; j < 6; j++) {
                const angle2 = (p.TWO_PI / 6) * j;
                p.line(
                    p.cos(angle1) * radius, p.sin(angle1) * radius,
                    p.cos(angle2) * radius, p.sin(angle2) * radius
                );
            }
        }
        
        p.pop();
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER DRAWING METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    drawPolygon(p, x, y, radius, sides) {
        p.beginShape();
        for (let i = 0; i < sides; i++) {
            const angle = (p.TWO_PI / sides) * i;
            const px = x + p.cos(angle) * radius;
            const py = y + p.sin(angle) * radius;
            p.vertex(px, py);
        }
        p.endShape(p.CLOSE);
    },
    
    drawDiamond(p, x, y, size) {
        p.beginShape();
        p.vertex(x, y - size);           // Top
        p.vertex(x + size * 0.6, y);     // Right
        p.vertex(x, y + size * 0.8);     // Bottom
        p.vertex(x - size * 0.6, y);     // Left
        p.endShape(p.CLOSE);
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // INTERACTION & CONTROL
    // ═══════════════════════════════════════════════════════════════════════════
    
    triggerMouseEffect(p, x, y) {
        // Create burst effect at mouse position
        for (let i = 0; i < 10; i++) {
            const angle = p.random(p.TWO_PI);
            const speed = p.random(2, 5);
            
            // Find or create particle
            const particle = this.animation.particles[i % this.animation.particles.length];
            particle.pos.x = x;
            particle.pos.y = y;
            particle.vel.x = p.cos(angle) * speed;
            particle.vel.y = p.sin(angle) * speed;
            particle.hue = p.random(360);
        }
    },
    
    setMode(mode) {
        if (this.modes[mode.toUpperCase()]) {
            this.currentMode = this.modes[mode.toUpperCase()];
            console.log(`🧙‍♂️ Switched to ${mode} mode`);
        }
    },
    
    setColorScheme(scheme) {
        if (this.colorPalettes[scheme]) {
            this.config.colorScheme = scheme;
            console.log(`🎨 Color scheme: ${scheme}`);
        }
    },
    
    setSpeed(speed) {
        this.animation.speed = speed;
    },
    
    toggleVisibility() {
        const container = document.getElementById(this.config.canvasId);
        if (container) {
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
        }
    }
};

// DO NOT auto-initialize - only init when explicitly called
// User must call: window.MerlinP5Visuals.init() when needed
// This prevents chaotic background effects on page load

// Add global controls
window.merlin = window.merlin || {};
window.merlin.p5 = MerlinP5Visuals;

console.log('🧙‍♂️✨ Merlin P5 Visuals module loaded');
