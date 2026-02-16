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
 * File: virtual-machine-3d.js
 * Declaration ID: IP-5620857E-MLL28ZWM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GemBot Mini Virtual 3D Machine - Enhanced GLB Model Version
 * Loads professional 3D models with animations
 * Synchronized with real hardware via serial/USB
 */

class VirtualMachine3D {
    constructor(canvasId = 'babylon-canvas') {
        this.canvasElement = document.getElementById(canvasId);
        this.engine = null;
        this.scene = null;
        this.camera = null;
        
        // Loaded GLB models
        this.machineModel = null;
        this.gemstoneModels = {};
        this.currentGemstone = null;
        
        // Animation groups from GLB
        this.animationGroups = [];
        this.xAxisAnimation = null;
        this.yAxisAnimation = null;
        this.zAxisAnimation = null;
        
        // Named mesh references for animation control
        this.meshes = {
            xCarriage: null,
            yCarriage: null,
            zAxis: null,
            spindle: null,
            dopStick: null,
            lap: null,
            frame: null
        };
        
        // Motor specifications (from Arduino code)
        this.motors = {
            x: {
                stepsPerRev: 200,
                microSteps: 16,
                totalMicrosteps: 3200,
                rpm: 1000,
                maxCount: 4200,
                mmPerRev: 5,
                currentPosition: 0,
                targetPosition: 0,
                minPos: -100,
                maxPos: 100
            },
            y: {
                stepsPerRev: 200,
                microSteps: 16,
                totalMicrosteps: 3200,
                rpm: 100,
                maxCount: 3300,
                mmPerRev: 5,
                currentPosition: 0,
                targetPosition: 0,
                minPos: 0,
                maxPos: 100
            },
            p: {
                stepsPerRev: 200,
                microSteps: 16,
                totalMicrosteps: 3200,
                rpm: 300,
                maxCount: 360,
                degreesPerRev: 360,
                currentPosition: 0,
                targetPosition: 0
            }
        };
        
        // Animation state
        this.isAnimating = false;
        this.lapSpinning = false;
        this.lapSpeed = 1;
        
        // Model paths - try both relative and root paths
        this.modelPaths = {
            machine: './cnc_meachine.glb',
            animatedMachine: './3_axis_cnc_animation.glb',
            gemstones: './gemstone_pack.glb'
        };
        
        // Loading state
        this.modelsLoaded = false;
        this.useAnimatedModel = true;
    }
    
    /**
     * Initialize Babylon.js scene
     */
    async initialize() {
        try {
            // Wait for BABYLON to be available
            let retries = 0;
            while (typeof BABYLON === 'undefined' && retries < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
            
            if (typeof BABYLON === 'undefined') {
                throw new Error('Babylon.js failed to load after 5 seconds');
            }
            
            console.log('✅ Babylon.js loaded, initializing scene...');
            
            // Create engine with better settings
            this.engine = new BABYLON.Engine(this.canvasElement, true, {
                preserveDrawingBuffer: true,
                antialias: true,
                stencil: true,
                disableWebGL2Support: false
            });
            
            if (!this.engine) {
                throw new Error('Failed to create Babylon.js engine');
            }
            
            console.log('✅ Engine created');
            
            // Create scene
            this.scene = new BABYLON.Scene(this.engine);
            this.scene.clearColor = new BABYLON.Color4(0.08, 0.1, 0.15, 1);
            
            console.log('✅ Scene created');
            
            // Setup camera
            this.setupCamera();
            console.log('✅ Camera setup');
            
            // Setup lighting
            this.setupLighting();
            console.log('✅ Lighting setup');
            
            // Try to load GLB models with graceful fallback
            try {
                await this.loadModels();
                console.log('✅ GLB models loaded successfully');
                this.modelLoadStatus = 'loaded';
            } catch (modelError) {
                // GRACEFUL FALLBACK: Log detailed error info for debugging
                const errorDetails = {
                    message: modelError.message || 'Unknown error',
                    name: modelError.name || 'Error',
                    stack: modelError.stack?.split('\n').slice(0, 3).join('\n'),
                    modelPath: this.useAnimatedModel ? this.modelPaths.animatedMachine : this.modelPaths.machine,
                    timestamp: new Date().toISOString()
                };
                
                console.warn('⚠️ GLB model loading failed - activating fallback geometry:', errorDetails);
                
                // Log to window for external debugging access
                window.GemBot3DLoadError = errorDetails;
                
                // Dispatch event for UI notification
                window.dispatchEvent(new CustomEvent('gembot3d:modelLoadFailed', { 
                    detail: errorDetails 
                }));
                
                // Create fallback geometry
                this.createFallbackGeometry();
                this.modelLoadStatus = 'fallback';
                
                // Show user-friendly indicator
                this.showFallbackIndicator();
            }
            
            // Start render loop
            this.startRenderLoop();
            console.log('✅ Render loop started');
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.engine) this.engine.resize();
            });
            
            // Start lap animation
            this.startLapAnimation();
            
            // Hide loading message
            const loadingStatus = document.getElementById('machineLoadingStatus');
            if (loadingStatus) {
                loadingStatus.style.display = 'none';
            }
            
            // DIAGNOSTIC INFO
            console.log('✅ Virtual Machine 3D initialized successfully!');
            console.log('📊 Scene Stats:', {
                meshCount: this.scene.meshes.length,
                materialCount: this.scene.materials.length,
                lightCount: this.scene.lights.length,
                cameraPosition: this.camera.position,
                cameraTarget: this.camera.target,
                modelsLoaded: this.modelsLoaded
            });
            
            // Log all visible meshes
            console.log('👁️ Visible Meshes:');
            this.scene.meshes.forEach(mesh => {
                if (mesh.isVisible) {
                    console.log(`  ✅ ${mesh.name} - visible`);
                } else {
                    console.log(`  ❌ ${mesh.name} - HIDDEN`);
                }
            });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Virtual Machine 3D:', error);
            return false;
        }
    }
    
    /**
     * Load GLB models
     */
    async loadModels() {
        // Check if GLTF loader is available
        if (!BABYLON.SceneLoader) {
            throw new Error('BABYLON.SceneLoader not available - GLTF loader not loaded');
        }
        
        console.log('📦 Loading GLB models...');
        
        // Try to load the animated CNC machine first
        try {
            const modelPath = this.useAnimatedModel ? this.modelPaths.animatedMachine : this.modelPaths.machine;
            console.log(`📦 Loading machine from: ${modelPath}`);
            
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                '', // Import all meshes
                '',
                modelPath,
                this.scene
            );
            
            console.log('📦 Machine model loaded:', result.meshes.length, 'meshes');
            
            // Store reference to loaded meshes
            this.machineModel = result.meshes[0]; // Root mesh
            
            // Store animation groups
            if (result.animationGroups && result.animationGroups.length > 0) {
                this.animationGroups = result.animationGroups;
                console.log('🎬 Found', this.animationGroups.length, 'animation groups');
                
                // Log animation names
                this.animationGroups.forEach((group, i) => {
                    console.log(`  Animation ${i}: ${group.name}`);
                });
            }
            
            // Find and store named meshes for control
            result.meshes.forEach(mesh => {
                const name = mesh.name.toLowerCase();
                console.log(`  Mesh: ${mesh.name}`);
                
                // FORCE VISIBILITY - ensure all meshes render
                mesh.isVisible = true;
                mesh.isPickable = true;
                
                // Try to identify key parts by name
                if (name.includes('x') && (name.includes('axis') || name.includes('carriage') || name.includes('gantry'))) {
                    this.meshes.xCarriage = mesh;
                }
                if (name.includes('y') && (name.includes('axis') || name.includes('carriage') || name.includes('platform'))) {
                    this.meshes.yCarriage = mesh;
                }
                if (name.includes('z') && (name.includes('axis') || name.includes('spindle'))) {
                    this.meshes.zAxis = mesh;
                }
                if (name.includes('spindle') || name.includes('motor') || name.includes('chuck')) {
                    this.meshes.spindle = mesh;
                }
                if (name.includes('lap') || name.includes('wheel') || name.includes('disk')) {
                    this.meshes.lap = mesh;
                }
            });
            
            // Scale and position the model appropriately
            this.positionModel(result.meshes);
            
            this.modelsLoaded = true;
            
        } catch (error) {
            console.warn('⚠️ Could not load animated machine, trying base.obj model:', error);
            
            // Try base.obj (the exact physical machine model - 499,902 triangles)
            try {
                // Check if we have the OBJFileLoader plugin
                if (BABYLON.SceneLoader.IsPluginForExtensionAvailable(".obj")) {
                    const result = await BABYLON.SceneLoader.ImportMeshAsync(
                        '',
                        '',
                        'base.obj',
                        this.scene
                    );
                    
                    this.machineModel = result.meshes[0];
                    
                    // Apply material to OBJ model
                    result.meshes.forEach(mesh => {
                        if (mesh.material) {
                            const material = new BABYLON.StandardMaterial("baseMaterial", this.scene);
                            material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
                            material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
                            material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.15);
                            mesh.material = material;
                        }
                    });
                    
                    this.positionModel(result.meshes);
                    this.modelsLoaded = true;
                    console.log('📦 base.obj model loaded (499,902 triangles)');
                } else {
                    throw new Error('OBJ loader not available');
                }
                
            } catch (objError) {
                console.warn('⚠️ base.obj failed, trying GLB fallback:', objError);
                
                // Try GLB static machine model
                try {
                    const result = await BABYLON.SceneLoader.ImportMeshAsync(
                        '',
                        '',
                        this.modelPaths.machine,
                        this.scene
                    );
                    
                    this.machineModel = result.meshes[0];
                    this.positionModel(result.meshes);
                    this.modelsLoaded = true;
                    console.log('📦 Static GLB model loaded');
                    
                } catch (staticError) {
                    console.warn('⚠️ All model formats failed:', staticError);
                    throw staticError;
                }
            }
        }
        
        // Try to load gemstones (optional)
        try {
            const gemResult = await BABYLON.SceneLoader.ImportMeshAsync(
                '',
                '',
                this.modelPaths.gemstones,
                this.scene
            );
            
            console.log('💎 Gemstone pack loaded:', gemResult.meshes.length, 'meshes');
            
            // Hide gemstones initially, we'll show them when needed
            gemResult.meshes.forEach(mesh => {
                mesh.isVisible = false;
                this.gemstoneModels[mesh.name] = mesh;
            });
            
        } catch (gemError) {
            console.log('💎 Gemstone pack not loaded (optional):', gemError.message);
        }
    }
    
    /**
     * Position and scale the loaded model
     */
    positionModel(meshes) {
        if (!meshes || meshes.length === 0) return;
        
        // Calculate bounding box of all meshes
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        
        meshes.forEach(mesh => {
            if (mesh.getBoundingInfo) {
                const bounds = mesh.getBoundingInfo().boundingBox;
                minX = Math.min(minX, bounds.minimumWorld.x);
                minY = Math.min(minY, bounds.minimumWorld.y);
                minZ = Math.min(minZ, bounds.minimumWorld.z);
                maxX = Math.max(maxX, bounds.maximumWorld.x);
                maxY = Math.max(maxY, bounds.maximumWorld.y);
                maxZ = Math.max(maxZ, bounds.maximumWorld.z);
            }
        });
        
        const sizeX = maxX - minX;
        const sizeY = maxY - minY;
        const sizeZ = maxZ - minZ;
        const maxSize = Math.max(sizeX, sizeY, sizeZ);
        
        console.log(`📐 Model size: ${sizeX.toFixed(1)} x ${sizeY.toFixed(1)} x ${sizeZ.toFixed(1)}`);
        
        // Scale to fit nicely in view (target ~150 units max dimension)
        const targetSize = 150;
        const scale = targetSize / maxSize;
        
        // Apply to root mesh
        const root = meshes[0];
        if (root) {
            root.scaling = new BABYLON.Vector3(scale, scale, scale);
            
            // Center the model
            const centerX = (minX + maxX) / 2 * scale;
            const centerZ = (minZ + maxZ) / 2 * scale;
            root.position = new BABYLON.Vector3(-centerX, 0, -centerZ);
            
            console.log(`📐 Applied scale: ${scale.toFixed(3)}`);
        }
    }
    
    /**
     * Create fallback procedural geometry if GLB loading fails
     */
    createFallbackGeometry() {
        console.log('🔧 Creating fallback procedural geometry...');
        
        // Use enhanced config if available
        const config = window.GemBot3DConfig || { current: { pbr: false } };
        const usePBR = config.current.pbr;
        
        // Materials
        let frameMat, metalMat, lapMat, gemMat;
        
        if (usePBR && this.scene) {
            // High-fidelity PBR Materials
            frameMat = new BABYLON.PBRMaterial('frameMat', this.scene);
            frameMat.albedoColor = new BABYLON.Color3(0.7, 0.72, 0.75);
            frameMat.metallic = 0.9;
            frameMat.roughness = 0.3;
            
            metalMat = new BABYLON.PBRMaterial('metalMat', this.scene);
            metalMat.albedoColor = new BABYLON.Color3(0.15, 0.15, 0.18);
            metalMat.metallic = 0.8;
            metalMat.roughness = 0.4;
            
            lapMat = new BABYLON.PBRMaterial('lapMat', this.scene);
            lapMat.albedoColor = new BABYLON.Color3(0.5, 0.5, 0.55);
            lapMat.metallic = 0.6;
            lapMat.roughness = 0.2;
            
            gemMat = new BABYLON.PBRMaterial('gemMat', this.scene);
            gemMat.albedoColor = new BABYLON.Color3(0.2, 0.6, 0.9);
            gemMat.metallic = 0.1;
            gemMat.roughness = 0.0;
            gemMat.alpha = 0.6;
            gemMat.indexOfRefraction = 1.77; // Ruby/Sapphire range
            gemMat.subSurface.isRefractionEnabled = true;
        } else {
            // Standard Materials (Low/Medium quality)
            frameMat = new BABYLON.StandardMaterial('frameMat', this.scene);
            frameMat.diffuseColor = new BABYLON.Color3(0.7, 0.72, 0.75);
            frameMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
            frameMat.specularPower = 64;
            
            metalMat = new BABYLON.StandardMaterial('metalMat', this.scene);
            metalMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.18);
            metalMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            
            lapMat = new BABYLON.StandardMaterial('lapMat', this.scene);
            lapMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.55);
            lapMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
            lapMat.specularPower = 32;
            
            gemMat = new BABYLON.StandardMaterial('gemMat', this.scene);
            gemMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.9);
            gemMat.specularColor = new BABYLON.Color3(1, 1, 1);
            gemMat.specularPower = 128;
            gemMat.alpha = 0.85;
        }
        
        // Base platform
        const base = BABYLON.MeshBuilder.CreateBox('base', { width: 200, height: 15, depth: 150 }, this.scene);
        base.material = frameMat;
        base.position.y = 7.5;
        
        // Frame rails (20x20 aluminum extrusion style)
        const createRail = (name, w, h, d, x, y, z) => {
            const rail = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, this.scene);
            rail.material = frameMat;
            rail.position = new BABYLON.Vector3(x, y, z);
            return rail;
        };
        
        // Vertical rails
        createRail('railFL', 15, 120, 15, -85, 75, -60);
        createRail('railFR', 15, 120, 15, 85, 75, -60);
        createRail('railBL', 15, 120, 15, -85, 75, 60);
        createRail('railBR', 15, 120, 15, 85, 75, 60);
        
        // Top horizontal rails
        createRail('railTopF', 185, 15, 15, 0, 130, -60);
        createRail('railTopB', 185, 15, 15, 0, 130, 60);
        createRail('railTopL', 15, 15, 135, -85, 130, 0);
        createRail('railTopR', 15, 15, 135, 85, 130, 0);
        
        // X-axis gantry (moves left-right)
        this.meshes.xCarriage = BABYLON.MeshBuilder.CreateBox('xCarriage', { width: 40, height: 25, depth: 120 }, this.scene);
        this.meshes.xCarriage.material = metalMat;
        this.meshes.xCarriage.position = new BABYLON.Vector3(0, 115, 0);
        
        // Y-axis arm (extends toward lap)
        this.meshes.yCarriage = BABYLON.MeshBuilder.CreateBox('yCarriage', { width: 30, height: 20, depth: 60 }, this.scene);
        this.meshes.yCarriage.material = metalMat;
        this.meshes.yCarriage.position = new BABYLON.Vector3(0, 100, -20);
        this.meshes.yCarriage.parent = this.meshes.xCarriage;
        
        // Dop stick holder
        const dopHolder = BABYLON.MeshBuilder.CreateCylinder('dopHolder', { diameter: 15, height: 25 }, this.scene);
        dopHolder.material = metalMat;
        dopHolder.position = new BABYLON.Vector3(0, -20, -25);
        dopHolder.parent = this.meshes.yCarriage;
        
        // Dop stick
        this.meshes.dopStick = BABYLON.MeshBuilder.CreateCylinder('dopStick', { diameter: 6, height: 40 }, this.scene);
        this.meshes.dopStick.material = frameMat;
        this.meshes.dopStick.position = new BABYLON.Vector3(0, -30, 0);
        this.meshes.dopStick.rotation.x = Math.PI / 4; // Angled toward lap
        this.meshes.dopStick.parent = dopHolder;
        
        // Gemstone on dop
        const gem = BABYLON.MeshBuilder.CreatePolyhedron('gemstone', { type: 1, size: 5 }, this.scene);
        gem.material = gemMat;
        gem.position = new BABYLON.Vector3(0, -25, 0);
        gem.parent = this.meshes.dopStick;
        
        // Lap wheel (horizontal grinding surface)
        this.meshes.lap = BABYLON.MeshBuilder.CreateCylinder('lap', { diameter: 100, height: 10, tessellation: 48 }, this.scene);
        this.meshes.lap.material = lapMat;
        this.meshes.lap.position = new BABYLON.Vector3(0, 25, 0);
        
        // Lap motor housing
        const lapMotor = BABYLON.MeshBuilder.CreateBox('lapMotor', { width: 40, height: 25, depth: 40 }, this.scene);
        lapMotor.material = metalMat;
        lapMotor.position = new BABYLON.Vector3(0, 10, 0);
        
        // Water tray
        const tray = BABYLON.MeshBuilder.CreateBox('tray', { width: 140, height: 5, depth: 140 }, this.scene);
        const trayMat = new BABYLON.StandardMaterial('trayMat', this.scene);
        trayMat.diffuseColor = new BABYLON.Color3(0.2, 0.25, 0.3);
        tray.material = trayMat;
        tray.position = new BABYLON.Vector3(0, 17, 0);
        
        console.log('✅ Fallback geometry created - procedural CNC machine rendered');
    }
    
    /**
     * Show visual indicator when using fallback geometry
     */
    showFallbackIndicator() {
        // Find the canvas container
        const container = this.canvasElement?.parentElement;
        if (!container) return;
        
        // Create or update fallback indicator
        let indicator = container.querySelector('.fallback-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'fallback-indicator';
            indicator.style.cssText = `
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: rgba(255, 193, 7, 0.9);
                color: #1a1f3a;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 11px;
                font-family: system-ui, sans-serif;
                z-index: 100;
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: opacity 0.3s;
            `;
            indicator.innerHTML = `
                <span style="font-size: 14px;">⚠️</span>
                <span>Simplified 3D View</span>
            `;
            indicator.title = 'GLB model could not be loaded. Using procedural geometry instead. Click to dismiss.';
            
            // Click to dismiss
            indicator.onclick = () => {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            };
            
            // Auto-fade after 10 seconds
            setTimeout(() => {
                if (indicator.parentElement) {
                    indicator.style.opacity = '0.5';
                }
            }, 10000);
            
            container.appendChild(indicator);
        }
        
        console.log('📢 Fallback indicator displayed to user');
    }
    
    /**
     * Setup camera for viewing
     */
    setupCamera() {
        this.camera = new BABYLON.ArcRotateCamera(
            'mainCamera',
            Math.PI * 0.75,    // Alpha - horizontal angle
            Math.PI / 3,       // Beta - vertical angle (60°)
            200,               // Radius - distance (REDUCED for better view)
            new BABYLON.Vector3(0, 50, 0),  // Target
            this.scene
        );
        
        this.camera.attachControl(this.canvasElement, true);
        this.camera.wheelPrecision = 30;
        this.camera.inertia = 0.8;
        this.camera.minZ = 1;
        this.camera.maxZ = 1000;
        this.camera.lowerRadiusLimit = 80;
        this.camera.upperRadiusLimit = 400;
        this.camera.lowerBetaLimit = 0.1;
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
    }
    
    /**
     * Setup scene lighting and post-processing
     */
    setupLighting() {
        const config = window.GemBot3DConfig ? window.GemBot3DConfig.current : { pbr: false, shadows: false, postProcessing: false };
        
        // Use HDR environment if PBR is enabled
        if (config.pbr && this.scene) {
            // Use a built-in environment texture for reflections
            // In a real app, load a .env file: this.scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("path/to/env.env", this.scene);
            const envHelper = this.scene.createDefaultEnvironment({
                createSkybox: false,
                createGround: false,
                toneMappingEnabled: true,
                environmentTexture: "https://assets.babylonjs.com/environments/studio.env"
            });
            if (envHelper) {
                envHelper.setMainColor(new BABYLON.Color3(0.1, 0.1, 0.15));
            }
        }

        // Ambient hemisphere light (always good for base visibility)
        const ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambient.intensity = config.pbr ? 0.5 : 1.0; // INCREASED for better visibility
        ambient.diffuse = new BABYLON.Color3(0.9, 0.9, 0.95);
        ambient.groundColor = new BABYLON.Color3(0.2, 0.2, 0.25);
        
        console.log('💡 Lighting setup:', { pbr: config.pbr, ambientIntensity: ambient.intensity });
        
        // Key light (Spotlight with shadows)
        const keyLight = new BABYLON.SpotLight("keyLight", 
            new BABYLON.Vector3(-80, 150, 80), 
            new BABYLON.Vector3(0.5, -1, -0.5), 
            Math.PI / 2, 2, this.scene);
        keyLight.intensity = config.pbr ? 2000 : 1.2; // PBR needs higher intensity
        keyLight.diffuse = new BABYLON.Color3(1, 0.95, 0.9);
        
        // Shadows
        if (config.shadows) {
            const shadowGenerator = new BABYLON.ShadowGenerator(config.shadowMapSize || 1024, keyLight);
            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.blurKernel = 32;
            // Note: Meshes need to be added to shadowGenerator.getShadowMap().renderList
            this.shadowGenerator = shadowGenerator;
        }
        
        // Fill light (Point)
        const fillLight = new BABYLON.PointLight('fillLight', new BABYLON.Vector3(100, 80, 50), this.scene);
        fillLight.intensity = config.pbr ? 800 : 0.5;
        fillLight.diffuse = new BABYLON.Color3(0.8, 0.85, 1);
        
        // Rim light (Point)
        const rimLight = new BABYLON.PointLight('rimLight', new BABYLON.Vector3(0, 100, -100), this.scene);
        rimLight.intensity = config.pbr ? 1000 : 0.4;
        rimLight.diffuse = new BABYLON.Color3(0.7, 0.8, 1);

        // Post-Processing Pipeline
        if (config.postProcessing) {
            const pipeline = new BABYLON.DefaultRenderingPipeline(
                "GemBotPipeline", 
                true, // HDR
                this.scene, 
                this.scene.cameras
            );
            
            // Bloom (Glow)
            if (config.bloom) {
                pipeline.bloomEnabled = true;
                pipeline.bloomThreshold = 0.7;
                pipeline.bloomWeight = 0.4;
                pipeline.bloomKernel = 64;
                pipeline.bloomScale = 0.5;
            }
            
            // FXAA (Anti-aliasing)
            if (config.fxaa) {
                pipeline.fxaaEnabled = true;
            }
            
            // Image Processing
            pipeline.imageProcessingEnabled = true;
            pipeline.imageProcessing.contrast = 1.1;
            pipeline.imageProcessing.exposure = 1.0;
            
            // Sharpening
            if (config.resolutionScale > 1.0) {
                pipeline.sharpenEnabled = true;
                pipeline.sharpen.edgeAmount = 0.2;
            }
        }
    }
    
    /**
     * Start the render loop
     */
    startRenderLoop() {
        let lastTime = performance.now();
        
        this.engine.runRenderLoop(() => {
            const now = performance.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;
            
            // Animate lap rotation
            if (this.lapSpinning && this.meshes.lap) {
                this.meshes.lap.rotation.y += deltaTime * this.lapSpeed * 2;
            }
            
            // Smooth motor animations
            this.updateMotorAnimations(deltaTime);
            
            this.scene.render();
        });
    }
    
    /**
     * Smooth motor position updates
     */
    updateMotorAnimations(deltaTime) {
        const lerpSpeed = 5; // Smoothing factor
        
        // X-axis movement
        if (this.meshes.xCarriage) {
            const targetX = (this.motors.x.currentPosition / this.motors.x.maxCount) * 80;
            const currentX = this.meshes.xCarriage.position.x;
            this.meshes.xCarriage.position.x += (targetX - currentX) * deltaTime * lerpSpeed;
        }
        
        // Y-axis movement
        if (this.meshes.yCarriage) {
            const targetZ = (this.motors.y.currentPosition / this.motors.y.maxCount) * -40;
            const currentZ = this.meshes.yCarriage.position.z;
            this.meshes.yCarriage.position.z += (targetZ - currentZ) * deltaTime * lerpSpeed;
        }
        
        // P-axis rotation (dop stick rotation)
        if (this.meshes.dopStick) {
            const targetRot = (this.motors.p.currentPosition / 360) * Math.PI * 2;
            const currentRot = this.meshes.dopStick.rotation.y;
            this.meshes.dopStick.rotation.y += (targetRot - currentRot) * deltaTime * lerpSpeed;
        }
    }
    
    /**
     * Start lap spinning animation
     */
    startLapAnimation() {
        this.lapSpinning = true;
    }
    
    /**
     * Stop lap animation
     */
    stopLapAnimation() {
        this.lapSpinning = false;
    }
    
    /**
     * Set lap speed (1-5)
     */
    setLapSpeed(speed) {
        this.lapSpeed = Math.max(0.5, Math.min(5, speed));
    }
    
    // ==================== MOTOR CONTROL METHODS ====================
    
    /**
     * Move X-axis (left-right)
     */
    moveX(steps) {
        const newPos = this.motors.x.currentPosition + steps;
        this.motors.x.currentPosition = Math.max(
            this.motors.x.minPos,
            Math.min(this.motors.x.maxPos, newPos)
        );
        console.log(`🔧 X-axis moved to ${this.motors.x.currentPosition}`);
    }
    
    /**
     * Move Y-axis (forward-backward toward lap)
     */
    moveY(steps) {
        const newPos = this.motors.y.currentPosition + steps;
        this.motors.y.currentPosition = Math.max(
            this.motors.y.minPos,
            Math.min(this.motors.y.maxPos, newPos)
        );
        console.log(`🔧 Y-axis moved to ${this.motors.y.currentPosition}`);
    }
    
    /**
     * Rotate P-axis (dop rotation)
     */
    rotateP(degrees) {
        this.motors.p.currentPosition = (this.motors.p.currentPosition + degrees) % 360;
        if (this.motors.p.currentPosition < 0) this.motors.p.currentPosition += 360;
        console.log(`🔧 P-axis rotated to ${this.motors.p.currentPosition}°`);
    }
    
    /**
     * Set absolute position
     */
    setPosition(x, y, p) {
        if (x !== undefined && x !== null) {
            this.motors.x.currentPosition = Math.max(this.motors.x.minPos, Math.min(this.motors.x.maxPos, x));
        }
        if (y !== undefined && y !== null) {
            this.motors.y.currentPosition = Math.max(this.motors.y.minPos, Math.min(this.motors.y.maxPos, y));
        }
        if (p !== undefined && p !== null) {
            this.motors.p.currentPosition = p % 360;
        }
    }
    
    /**
     * Home all motors
     */
    homeAllMotors() {
        this.motors.x.currentPosition = 0;
        this.motors.y.currentPosition = 0;
        this.motors.p.currentPosition = 0;
        console.log('🏠 All motors homed');
    }
    
    /**
     * Get current positions
     */
    getPositions() {
        return {
            x: this.motors.x.currentPosition,
            y: this.motors.y.currentPosition,
            p: this.motors.p.currentPosition
        };
    }
    
    /**
     * Get motor positions (alias for getPositions for compatibility)
     */
    getMotorPositions() {
        return this.getPositions();
    }
    
    // ==================== ANIMATION PLAYBACK ====================
    
    /**
     * Play animation by name
     */
    playAnimation(name) {
        const group = this.animationGroups.find(g => g.name.toLowerCase().includes(name.toLowerCase()));
        if (group) {
            group.start(false); // Play once
            console.log(`🎬 Playing animation: ${group.name}`);
        } else {
            console.log(`⚠️ Animation not found: ${name}`);
        }
    }
    
    /**
     * Play all animations
     */
    playAllAnimations() {
        this.animationGroups.forEach(group => {
            group.start(true); // Loop
        });
        console.log('🎬 Playing all animations');
    }
    
    /**
     * Stop all animations
     */
    stopAllAnimations() {
        this.animationGroups.forEach(group => {
            group.stop();
        });
        console.log('🎬 Stopped all animations');
    }
    
    // ==================== CAMERA CONTROLS ====================
    
    /**
     * Zoom in
     */
    zoomIn() {
        if (this.camera) {
            this.camera.radius = Math.max(this.camera.lowerRadiusLimit, this.camera.radius - 20);
        }
    }
    
    /**
     * Zoom out
     */
    zoomOut() {
        if (this.camera) {
            this.camera.radius = Math.min(this.camera.upperRadiusLimit, this.camera.radius + 20);
        }
    }
    
    /**
     * Reset camera to default view
     */
    resetCamera() {
        if (this.camera) {
            this.camera.alpha = Math.PI * 0.75;
            this.camera.beta = Math.PI / 3;
            this.camera.radius = 250;
            this.camera.target = new BABYLON.Vector3(0, 60, 0);
        }
    }
    
    /**
     * Set camera to front view
     */
    setFrontView() {
        if (this.camera) {
            this.camera.alpha = Math.PI;
            this.camera.beta = Math.PI / 2.5;
            this.camera.radius = 200;
        }
    }
    
    /**
     * Set camera to top view
     */
    setTopView() {
        if (this.camera) {
            this.camera.alpha = Math.PI / 2;
            this.camera.beta = 0.1;
            this.camera.radius = 300;
        }
    }
    
    /**
     * Set camera to side view
     */
    setSideView() {
        if (this.camera) {
            this.camera.alpha = Math.PI / 2;
            this.camera.beta = Math.PI / 2.5;
            this.camera.radius = 200;
        }
    }
    
    // ==================== GEMSTONE DISPLAY ====================
    
    /**
     * Show a gemstone from the loaded pack
     */
    showGemstone(name) {
        // Hide current gemstone
        if (this.currentGemstone) {
            this.currentGemstone.isVisible = false;
        }
        
        // Find and show requested gemstone
        const gem = Object.values(this.gemstoneModels).find(
            m => m.name.toLowerCase().includes(name.toLowerCase())
        );
        
        if (gem) {
            gem.isVisible = true;
            // Position on dop stick
            if (this.meshes.dopStick) {
                gem.parent = this.meshes.dopStick;
                gem.position = new BABYLON.Vector3(0, -15, 0);
            }
            this.currentGemstone = gem;
            console.log(`💎 Showing gemstone: ${gem.name}`);
        }
    }
    
    /**
     * List available gemstones
     */
    listGemstones() {
        return Object.keys(this.gemstoneModels);
    }
    
    // ==================== PART LABELING FOR TEACHING ====================
    
    /**
     * Highlight a machine part for teaching
     */
    highlightPart(partName, color = new BABYLON.Color3(1, 0.8, 0)) {
        // Find mesh by name
        let targetMesh = this.meshes[partName];
        
        if (!targetMesh && this.machineModel) {
            // Search in loaded model
            targetMesh = this.scene.getMeshByName(partName);
        }
        
        if (targetMesh) {
            // Store original material
            targetMesh._originalMaterial = targetMesh.material;
            
            // Create highlight material
            const highlightMat = new BABYLON.StandardMaterial('highlight', this.scene);
            highlightMat.diffuseColor = color;
            highlightMat.emissiveColor = color.scale(0.3);
            highlightMat.specularColor = new BABYLON.Color3(1, 1, 1);
            
            targetMesh.material = highlightMat;
            
            console.log(`🔦 Highlighted: ${partName}`);
            return true;
        }
        
        console.log(`⚠️ Part not found: ${partName}`);
        return false;
    }
    
    /**
     * Remove highlight from part
     */
    unhighlightPart(partName) {
        let targetMesh = this.meshes[partName] || this.scene.getMeshByName(partName);
        
        if (targetMesh && targetMesh._originalMaterial) {
            targetMesh.material = targetMesh._originalMaterial;
            delete targetMesh._originalMaterial;
            console.log(`🔦 Unhighlighted: ${partName}`);
        }
    }
    
    /**
     * Get list of all mesh names (for teaching reference)
     */
    getMeshNames() {
        const names = [];
        this.scene.meshes.forEach(mesh => {
            if (mesh.name && !mesh.name.startsWith('_')) {
                names.push(mesh.name);
            }
        });
        return names;
    }
    
    // ==================== CLEANUP ====================
    
    /**
     * Dispose of scene resources
     */
    dispose() {
        if (this.scene) {
            this.scene.dispose();
        }
        if (this.engine) {
            this.engine.dispose();
        }
        console.log('🗑️ VirtualMachine3D disposed');
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.VirtualMachine3D = VirtualMachine3D;
}
