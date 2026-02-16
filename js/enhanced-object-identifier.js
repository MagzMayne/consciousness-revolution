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
 * File: enhanced-object-identifier.js
 * Declaration ID: IP-3742D497-MLL28ZV2
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Enhanced Object Identifier
 * Uses comprehensive knowledge base for specific object identification
 * Provides detailed product information including exact models, brands, and sizes
 */

class EnhancedObjectIdentifier {
    constructor() {
        this.knowledgeBase = null;
        this.loadKnowledgeBase();
        
        // OCR integration for text detection
        this.ocrEnabled = false;
        this.tesseractWorker = null;
        
        // Color detection cache
        this.colorCache = new Map();
        
        // Detection history for duplicate prevention
        this.detectionHistory = [];
        this.historyMaxSize = 50;
    }

    /**
     * Load the vision knowledge base
     */
    async loadKnowledgeBase() {
        try {
            const response = await fetch('/src/ai/vision-knowledge-base.json');
            this.knowledgeBase = await response.json();
            console.log('✅ Vision knowledge base loaded');
            return true;
        } catch (error) {
            console.error('❌ Failed to load vision knowledge base:', error);
            // Use fallback minimal knowledge base
            this.knowledgeBase = this.createFallbackKnowledgeBase();
            return false;
        }
    }

    /**
     * Create fallback knowledge base if loading fails
     */
    createFallbackKnowledgeBase() {
        return {
            version: "1.0.0",
            electronics: {},
            beverages: {},
            food: {},
            household: {},
            identificationRules: {
                colorMatching: {},
                sizeDetection: {},
                brandIdentification: {}
            },
            detectionParameters: {
                confidenceThresholds: {
                    electronics: 0.6,
                    beverages: 0.5,
                    food: 0.5,
                    household: 0.6
                },
                duplicateDetection: {
                    spatialTolerance: 50,
                    temporalWindow: 5000,
                    visualSimilarityThreshold: 0.85,
                    movementThreshold: 100
                }
            }
        };
    }

    /**
     * Identify object with enhanced specificity
     * @param {Object} detection - Basic AI detection result
     * @param {String} imageData - Image data for analysis
     * @param {Object} boundingBox - Bounding box coordinates
     * @returns {Object} Enhanced identification with specific details
     */
    async identifyObject(detection, imageData, boundingBox) {
        if (!this.knowledgeBase) {
            await this.loadKnowledgeBase();
        }

        // Start with base detection
        let identification = {
            baseDetection: detection.class,
            confidence: detection.score,
            category: this.mapToCategory(detection.class),
            specificProduct: null,
            brand: null,
            model: null,
            size: null,
            variant: null,
            value: 0,
            identificationMethod: 'base-ai'
        };

        // Extract visual features
        const visualFeatures = await this.extractVisualFeatures(imageData, boundingBox);
        
        // Try to identify specific product
        const specificMatch = await this.findSpecificMatch(
            detection.class,
            visualFeatures,
            imageData,
            boundingBox
        );

        if (specificMatch) {
            identification = {
                ...identification,
                ...specificMatch,
                identificationMethod: specificMatch.method || 'knowledge-base-match'
            };
        }

        // Calculate value
        identification.value = this.calculateValue(identification);

        return identification;
    }

    /**
     * Map generic AI class to our category system
     */
    mapToCategory(aiClass) {
        const mapping = {
            'laptop': 'electronics',
            'cell phone': 'electronics',
            'keyboard': 'electronics',
            'mouse': 'electronics',
            'monitor': 'electronics',
            'tv': 'electronics',
            'bottle': 'beverages',
            'cup': 'household',
            'wine glass': 'household',
            'bowl': 'household',
            'apple': 'food',
            'orange': 'food',
            'banana': 'food',
            'sandwich': 'food',
            'cake': 'food',
            'donut': 'food'
        };

        return mapping[aiClass.toLowerCase()] || 'unknown';
    }

    /**
     * Extract visual features from image
     */
    async extractVisualFeatures(imageData, boundingBox) {
        const features = {
            dominantColors: [],
            textDetected: [],
            size: this.estimateSize(boundingBox),
            shape: this.analyzeShape(boundingBox)
        };

        // Extract dominant colors
        features.dominantColors = await this.extractDominantColors(imageData, boundingBox);

        // Try OCR if enabled
        if (this.ocrEnabled && this.tesseractWorker) {
            try {
                features.textDetected = await this.extractText(imageData, boundingBox);
            } catch (error) {
                console.warn('OCR failed:', error);
            }
        }

        return features;
    }

    /**
     * Extract dominant colors from image region
     */
    async extractDominantColors(imageData, boundingBox) {
        // In a real implementation, this would analyze the image
        // For now, return cached or simulated colors
        const cacheKey = `${boundingBox.join('-')}`;
        
        if (this.colorCache.has(cacheKey)) {
            return this.colorCache.get(cacheKey);
        }

        // Simulate color detection (in production, use actual image analysis)
        const colors = ['red', 'blue', 'green', 'yellow', 'white', 'black'];
        const detected = colors[Math.floor(Math.random() * colors.length)];
        
        this.colorCache.set(cacheKey, [detected]);
        return [detected];
    }

    /**
     * Extract text from image using OCR
     */
    async extractText(imageData, boundingBox) {
        // This would use Tesseract.js in production
        // For now, return empty array
        return [];
    }

    /**
     * Estimate physical size category
     */
    estimateSize(boundingBox) {
        const [x, y, width, height] = boundingBox;
        const area = width * height;
        
        // Categorize by relative size
        if (area < 5000) return 'small';
        if (area < 15000) return 'medium';
        if (area < 30000) return 'large';
        return 'extra-large';
    }

    /**
     * Analyze shape characteristics
     */
    analyzeShape(boundingBox) {
        const [x, y, width, height] = boundingBox;
        const aspectRatio = width / height;

        if (aspectRatio > 2) return 'wide';
        if (aspectRatio < 0.5) return 'tall';
        if (Math.abs(aspectRatio - 1) < 0.2) return 'square';
        return 'rectangular';
    }

    /**
     * Find specific product match in knowledge base
     */
    async findSpecificMatch(aiClass, visualFeatures, imageData, boundingBox) {
        const category = this.mapToCategory(aiClass);
        
        // Search in appropriate category
        let matches = [];

        if (category === 'beverages') {
            matches = await this.searchBeverages(aiClass, visualFeatures);
        } else if (category === 'electronics') {
            matches = await this.searchElectronics(aiClass, visualFeatures);
        } else if (category === 'food') {
            matches = await this.searchFood(aiClass, visualFeatures);
        } else if (category === 'household') {
            matches = await this.searchHousehold(aiClass, visualFeatures);
        }

        // Return best match
        if (matches.length > 0) {
            return matches[0];
        }

        return null;
    }

    /**
     * Search beverages in knowledge base
     */
    async searchBeverages(aiClass, visualFeatures) {
        if (!this.knowledgeBase.beverages) return [];

        const matches = [];
        const colors = visualFeatures.dominantColors || [];
        const size = visualFeatures.size;
        const shape = visualFeatures.shape;

        // Search all beverage categories
        for (const [subcategory, items] of Object.entries(this.knowledgeBase.beverages)) {
            for (const [itemName, itemData] of Object.entries(items)) {
                let score = 0;

                // Check if base detection matches
                if (aiClass.toLowerCase() === 'bottle' || aiClass.toLowerCase() === 'cup') {
                    score += 0.3;
                }

                // Check color matching
                const itemColors = this.knowledgeBase.identificationRules?.colorMatching || {};
                for (const color of colors) {
                    if (itemData.identificationKeywords.some(kw => 
                        kw.toLowerCase().includes(color.toLowerCase())
                    )) {
                        score += 0.2;
                    }
                }

                // Check size matching
                if (itemData.size && size) {
                    const sizeMatches = this.matchSize(itemData, size, shape);
                    if (sizeMatches) {
                        score += 0.3;
                    }
                }

                // Check text matches (if available)
                if (visualFeatures.textDetected && visualFeatures.textDetected.length > 0) {
                    const textMatch = visualFeatures.textDetected.some(text =>
                        itemData.identificationKeywords.some(kw =>
                            text.toLowerCase().includes(kw.toLowerCase())
                        )
                    );
                    if (textMatch) {
                        score += 0.4;
                    }
                }

                if (score > 0.4) {
                    matches.push({
                        specificProduct: itemData.product,
                        brand: itemData.brand,
                        variant: itemData.variant,
                        size: itemData.size,
                        packaging: itemData.packaging,
                        category: itemData.category,
                        type: itemData.type,
                        baseValue: itemData.baseValue,
                        upc: itemData.upc,
                        score: score,
                        method: 'beverage-match'
                    });
                }
            }
        }

        // Sort by score
        matches.sort((a, b) => b.score - a.score);
        return matches;
    }

    /**
     * Search electronics in knowledge base
     */
    async searchElectronics(aiClass, visualFeatures) {
        if (!this.knowledgeBase.electronics) return [];

        const matches = [];
        const colors = visualFeatures.dominantColors || [];

        // Search electronics categories
        for (const [subcategory, items] of Object.entries(this.knowledgeBase.electronics)) {
            for (const [itemName, itemData] of Object.entries(items)) {
                let score = 0;

                // Check if AI class matches
                if (aiClass.toLowerCase().includes(itemData.type.toLowerCase()) ||
                    itemData.type.toLowerCase().includes(aiClass.toLowerCase())) {
                    score += 0.4;
                }

                // Check manufacturer color matching
                const brandColors = this.knowledgeBase.identificationRules?.brandIdentification?.logoColors || {};
                const brandColor = brandColors[itemData.manufacturer];
                if (brandColor && colors.some(c => 
                    brandColor.some(bc => bc.toLowerCase() === c.toLowerCase())
                )) {
                    score += 0.2;
                }

                // Check text matches
                if (visualFeatures.textDetected && visualFeatures.textDetected.length > 0) {
                    const textMatch = visualFeatures.textDetected.some(text =>
                        itemData.identificationKeywords.some(kw =>
                            text.toLowerCase().includes(kw.toLowerCase())
                        )
                    );
                    if (textMatch) {
                        score += 0.5;
                    }
                }

                if (score > 0.5) {
                    matches.push({
                        specificProduct: itemName,
                        brand: itemData.manufacturer,
                        model: itemData.model,
                        series: itemData.series,
                        category: itemData.category,
                        type: itemData.type,
                        baseValue: itemData.baseValue,
                        specifications: itemData.specifications,
                        score: score,
                        method: 'electronics-match'
                    });
                }
            }
        }

        matches.sort((a, b) => b.score - a.score);
        return matches;
    }

    /**
     * Search food items in knowledge base
     */
    async searchFood(aiClass, visualFeatures) {
        if (!this.knowledgeBase.food) return [];

        const matches = [];
        const colors = visualFeatures.dominantColors || [];

        // Search food categories
        for (const [subcategory, items] of Object.entries(this.knowledgeBase.food)) {
            for (const [itemName, itemData] of Object.entries(items)) {
                let score = 0;

                // Check if AI class matches
                if (aiClass.toLowerCase().includes(itemData.product.toLowerCase()) ||
                    itemData.product.toLowerCase().includes(aiClass.toLowerCase())) {
                    score += 0.5;
                }

                // Check color matching
                for (const color of colors) {
                    if (itemData.identificationKeywords.some(kw =>
                        kw.toLowerCase().includes(color.toLowerCase())
                    )) {
                        score += 0.2;
                    }
                }

                if (score > 0.4) {
                    matches.push({
                        specificProduct: itemData.product,
                        brand: itemData.brand,
                        variant: itemData.variant || itemData.varieties,
                        category: itemData.category,
                        type: itemData.type,
                        baseValue: itemData.baseValue,
                        unit: itemData.unit,
                        score: score,
                        method: 'food-match'
                    });
                }
            }
        }

        matches.sort((a, b) => b.score - a.score);
        return matches;
    }

    /**
     * Search household items in knowledge base
     */
    async searchHousehold(aiClass, visualFeatures) {
        if (!this.knowledgeBase.household) return [];

        const matches = [];

        // Search household categories
        for (const [subcategory, items] of Object.entries(this.knowledgeBase.household)) {
            for (const [itemName, itemData] of Object.entries(items)) {
                let score = 0;

                // Check if AI class matches
                if (aiClass.toLowerCase().includes(itemData.type.toLowerCase()) ||
                    itemData.product.toLowerCase().includes(aiClass.toLowerCase())) {
                    score += 0.5;
                }

                if (score > 0.3) {
                    matches.push({
                        specificProduct: itemData.product,
                        category: itemData.category,
                        type: itemData.type,
                        material: itemData.material,
                        baseValue: itemData.baseValue,
                        unit: itemData.unit,
                        score: score,
                        method: 'household-match'
                    });
                }
            }
        }

        matches.sort((a, b) => b.score - a.score);
        return matches;
    }

    /**
     * Match size between item data and detection
     */
    matchSize(itemData, detectedSize, detectedShape) {
        const sizeRules = this.knowledgeBase.identificationRules?.sizeDetection || {};

        // Check if packaging type has size rules
        if (itemData.packaging) {
            const packagingRules = sizeRules[itemData.packaging + 's'] || sizeRules[itemData.packaging];
            if (packagingRules && itemData.size) {
                const sizeKey = itemData.size.replace(/\s+/g, '').toLowerCase();
                const rule = packagingRules[sizeKey];
                
                if (rule) {
                    // Check if detected size matches rule
                    if (rule.keywords) {
                        return rule.keywords.some(kw =>
                            detectedSize.toLowerCase().includes(kw.toLowerCase())
                        );
                    }
                }
            }
        }

        return false;
    }

    /**
     * Calculate value for identified object
     */
    calculateValue(identification) {
        if (identification.baseValue) {
            return identification.baseValue;
        }

        // Fallback to estimated value
        return 0;
    }

    /**
     * Check if detection is duplicate
     * Enhanced duplicate detection with spatial and temporal filtering
     */
    isDuplicate(detection, boundingBox, timestamp) {
        if (!this.knowledgeBase?.detectionParameters?.duplicateDetection) {
            return false;
        }

        const params = this.knowledgeBase.detectionParameters.duplicateDetection;
        const now = timestamp || Date.now();

        // Clean old detections outside temporal window
        this.detectionHistory = this.detectionHistory.filter(
            h => (now - h.timestamp) < params.temporalWindow
        );

        // Check against recent detections
        for (const historical of this.detectionHistory) {
            // Check if same class
            if (historical.class !== detection.class) {
                continue;
            }

            // Check spatial proximity
            const distance = this.calculateBoundingBoxDistance(
                boundingBox,
                historical.boundingBox
            );

            if (distance < params.spatialTolerance) {
                // Check if there's significant movement
                const movement = this.calculateMovement(
                    boundingBox,
                    historical.boundingBox
                );

                if (movement < params.movementThreshold) {
                    // It's a duplicate - same object, same location, minimal movement
                    console.log('🚫 Duplicate detected:', {
                        class: detection.class,
                        distance,
                        movement,
                        timeDiff: now - historical.timestamp
                    });
                    return true;
                }
            }
        }

        // Add to history
        this.detectionHistory.push({
            class: detection.class,
            boundingBox: boundingBox,
            timestamp: now,
            confidence: detection.score
        });

        // Limit history size
        if (this.detectionHistory.length > this.historyMaxSize) {
            this.detectionHistory.shift();
        }

        return false;
    }

    /**
     * Calculate distance between two bounding boxes
     */
    calculateBoundingBoxDistance(box1, box2) {
        const [x1, y1, w1, h1] = box1;
        const [x2, y2, w2, h2] = box2;

        // Calculate center points
        const center1 = {
            x: x1 + w1 / 2,
            y: y1 + h1 / 2
        };
        const center2 = {
            x: x2 + w2 / 2,
            y: y2 + h2 / 2
        };

        // Euclidean distance
        return Math.sqrt(
            Math.pow(center1.x - center2.x, 2) +
            Math.pow(center1.y - center2.y, 2)
        );
    }

    /**
     * Calculate movement between two bounding boxes
     */
    calculateMovement(box1, box2) {
        const distance = this.calculateBoundingBoxDistance(box1, box2);
        
        // Calculate size change
        const [x1, y1, w1, h1] = box1;
        const [x2, y2, w2, h2] = box2;
        const sizeChange = Math.abs((w1 * h1) - (w2 * h2));

        // Combined movement score
        return distance + (sizeChange / 100);
    }

    /**
     * Clear detection history
     */
    clearHistory() {
        this.detectionHistory = [];
        console.log('🧹 Detection history cleared');
    }

    /**
     * Get detection statistics
     */
    getStatistics() {
        return {
            historySize: this.detectionHistory.length,
            oldestDetection: this.detectionHistory.length > 0 
                ? this.detectionHistory[0].timestamp 
                : null,
            newestDetection: this.detectionHistory.length > 0
                ? this.detectionHistory[this.detectionHistory.length - 1].timestamp
                : null,
            classDistribution: this.getClassDistribution()
        };
    }

    /**
     * Get distribution of detected classes
     */
    getClassDistribution() {
        const distribution = {};
        for (const detection of this.detectionHistory) {
            distribution[detection.class] = (distribution[detection.class] || 0) + 1;
        }
        return distribution;
    }
}

// Create global instance
const enhancedIdentifier = new EnhancedObjectIdentifier();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedObjectIdentifier;
}
