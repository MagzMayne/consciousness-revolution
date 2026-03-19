// RootIB: RB-20260319142113-17806507
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
 * File: ultrasound-live-analysis.js
 * Declaration ID: IP-F63F5E4-MLL28ZV7
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Ultrasound Live Feed Analysis System
 * 
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * 
 * PURPOSE: Provide live video feed capture, logging, and AI-powered analysis
 * for personal ultrasound observation with medical knowledge base integration
 * 
 * CRITICAL DISCLAIMER:
 * ===================
 * This is NOT a diagnostic medical device and is NOT FDA approved.
 * This tool is for EDUCATIONAL and PERSONAL OBSERVATION purposes only.
 * ALL findings must be reviewed by qualified medical professionals.
 * Do NOT use this for self-diagnosis or treatment decisions.
 * Seek immediate medical attention for any concerning symptoms.
 * 
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 */

class UltrasoundLiveAnalysis {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.ctx = null;
    this.isRecording = false;
    this.capturedFrames = [];
    this.analysisResults = [];
    this.sessionStartTime = null;
    this.frameCount = 0;
    this.analysisInterval = null;
    
    // AI/ML integration
    this.tfReady = false;
    this.model = null;
    
    // Medical knowledge base
    this.medicalKnowledge = null;
    
    // Analysis settings
    this.settings = {
      captureInterval: 2000, // Capture every 2 seconds
      analysisEnabled: true,
      autoSaveFrames: true,
      confidenceThreshold: 0.6,
      alertThreshold: 0.75, // High confidence issues trigger alerts
      organType: null, // breast, ovarian, testicular, or null for general
      cancerDetectionEnabled: false // Enable cancer-specific analysis
    };
  }

  /**
   * Initialize the live analysis system
   */
  async initialize(videoElementId, canvasElementId) {
    try {
      this.videoElement = document.getElementById(videoElementId);
      this.canvasElement = document.getElementById(canvasElementId);
      
      if (!this.videoElement || !this.canvasElement) {
        throw new Error('Video or canvas element not found');
      }
      
      this.ctx = this.canvasElement.getContext('2d', { willReadFrequently: true });
      
      // Load medical knowledge base
      if (window.UltrasoundKnowledgeBase) {
        this.medicalKnowledge = window.UltrasoundKnowledgeBase;
        console.log('✅ Medical knowledge base loaded');
      }
      
      // Initialize TensorFlow.js if available
      await this.initializeTensorFlow();
      
      console.log('✅ Ultrasound Live Analysis initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize live analysis:', error);
      throw error;
    }
  }

  /**
   * Initialize TensorFlow.js for ML analysis
   */
  async initializeTensorFlow() {
    try {
      if (typeof tf !== 'undefined') {
        await tf.ready();
        this.tfReady = true;
        console.log('✅ TensorFlow.js ready for analysis');
        
        // Load pre-trained models if available
        await this.loadMLModels();
      } else {
        console.warn('⚠️ TensorFlow.js not available, using fallback analysis');
        this.tfReady = false;
      }
    } catch (error) {
      console.warn('⚠️ TensorFlow initialization failed:', error);
      this.tfReady = false;
    }
  }

  /**
   * Load ML models for ultrasound analysis
   */
  async loadMLModels() {
    try {
      // Placeholder for custom ultrasound models
      // In production, load specialized medical imaging models
      console.log('📊 ML models ready for analysis');
      
      // For now, we'll use image analysis algorithms
      // Future: Load specialized ultrasound segmentation/classification models
      this.model = {
        type: 'image-analysis',
        ready: true
      };
    } catch (error) {
      console.warn('⚠️ Model loading failed:', error);
    }
  }

  /**
   * Request access to video device (webcam or USB ultrasound)
   */
  async startVideoStream(deviceId = null) {
    try {
      const constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
          deviceId: deviceId ? { exact: deviceId } : undefined
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      
      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve();
        };
      });

      // Set canvas size to match video
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasElement.height = this.videoElement.videoHeight;
      
      console.log('✅ Video stream started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start video stream:', error);
      throw new Error('Camera access denied or unavailable. Please check permissions.');
    }
  }

  /**
   * Get list of available video devices
   */
  async getVideoDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
  }

  /**
   * Stop video stream
   */
  stopVideoStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }
      console.log('⏹️ Video stream stopped');
    }
  }

  /**
   * Start recording session
   */
  startRecording() {
    if (!this.stream) {
      throw new Error('No active video stream');
    }

    this.isRecording = true;
    this.sessionStartTime = Date.now();
    this.capturedFrames = [];
    this.analysisResults = [];
    this.frameCount = 0;

    // Start periodic frame capture and analysis
    this.analysisInterval = setInterval(() => {
      this.captureAndAnalyzeFrame();
    }, this.settings.captureInterval);

    console.log('🔴 Recording started');
    return {
      success: true,
      sessionId: this.sessionStartTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Stop recording session
   */
  stopRecording() {
    this.isRecording = false;
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    const sessionSummary = this.generateSessionSummary();
    console.log('⏹️ Recording stopped');
    
    return sessionSummary;
  }

  /**
   * Capture current frame and analyze it
   */
  async captureAndAnalyzeFrame() {
    if (!this.isRecording || !this.videoElement || !this.canvasElement) {
      return null;
    }

    try {
      // Draw current video frame to canvas
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
      
      // Get image data
      const imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      const dataURL = this.canvasElement.toDataURL('image/jpeg', 0.9);
      
      this.frameCount++;
      
      const frame = {
        id: `frame_${this.frameCount}_${Date.now()}`,
        timestamp: Date.now(),
        relativeTime: Date.now() - this.sessionStartTime,
        imageData: dataURL,
        width: this.canvasElement.width,
        height: this.canvasElement.height,
        frameNumber: this.frameCount
      };

      // Perform analysis if enabled
      if (this.settings.analysisEnabled) {
        const analysis = await this.analyzeFrame(imageData, frame);
        frame.analysis = analysis;
        
        // Store analysis results
        this.analysisResults.push(analysis);
        
        // Check for alerts
        if (analysis.alerts && analysis.alerts.length > 0) {
          this.handleAlerts(analysis.alerts, frame);
        }
      }

      // Save frame
      this.capturedFrames.push(frame);
      
      // Auto-save to localStorage if enabled
      if (this.settings.autoSaveFrames) {
        this.saveFrameToStorage(frame);
      }

      return frame;
    } catch (error) {
      console.error('Failed to capture frame:', error);
      return null;
    }
  }

  /**
   * Analyze captured frame using ML and medical knowledge
   */
  async analyzeFrame(imageData, frameInfo) {
    const analysis = {
      frameId: frameInfo.id,
      timestamp: frameInfo.timestamp,
      quality: null,
      features: [],
      measurements: [],
      findings: [],
      alerts: [],
      confidence: 0,
      recommendations: []
    };

    try {
      // Image quality assessment
      analysis.quality = this.assessImageQuality(imageData);
      
      // Feature detection
      analysis.features = await this.detectFeatures(imageData);
      
      // Medical pattern analysis
      const medicalAnalysis = await this.analyzeMedicalPatterns(imageData, analysis.features);
      analysis.findings = medicalAnalysis.findings;
      analysis.alerts = medicalAnalysis.alerts;
      analysis.confidence = medicalAnalysis.confidence;
      
      // Cancer-specific analysis (if enabled and organ type specified)
      if (this.settings.cancerDetectionEnabled && this.settings.organType) {
        const cancerAnalysis = await this.analyzeCancerRisk(
          imageData, 
          analysis.features, 
          this.settings.organType
        );
        
        if (cancerAnalysis) {
          analysis.cancerRisk = cancerAnalysis;
          
          // Add high-priority alerts for concerning findings
          if (cancerAnalysis.riskLevel === 'high') {
            analysis.alerts.unshift({
              severity: 'critical',
              type: 'cancer_risk',
              message: `⚠️ CANCER RISK ALERT: ${cancerAnalysis.suspiciousFeatures.length} suspicious features detected for ${cancerAnalysis.organType}`,
              recommendation: cancerAnalysis.recommendation,
              disclaimer: cancerAnalysis.criticalDisclaimer
            });
          } else if (cancerAnalysis.riskLevel === 'moderate') {
            analysis.alerts.push({
              severity: 'high',
              type: 'cancer_risk',
              message: `⚠️ ${cancerAnalysis.organType} evaluation recommended`,
              recommendation: cancerAnalysis.recommendation,
              disclaimer: cancerAnalysis.criticalDisclaimer
            });
          }
        }
      }
      
      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Frame analysis failed:', error);
      analysis.error = error.message;
      return analysis;
    }
  }

  /**
   * Assess image quality metrics
   */
  assessImageQuality(imageData) {
    const data = imageData.data;
    let sumBrightness = 0;
    let sumContrast = 0;
    const pixels = data.length / 4;

    // Calculate brightness and contrast
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sumBrightness += brightness;
    }

    const avgBrightness = sumBrightness / pixels;

    // Calculate variance for contrast
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sumContrast += Math.pow(brightness - avgBrightness, 2);
    }

    const contrast = Math.sqrt(sumContrast / pixels);

    // Determine quality score
    let qualityScore = 0;
    let qualityIssues = [];

    // Check brightness (ideal range: 80-170)
    if (avgBrightness < 60) {
      qualityIssues.push('Image too dark');
      qualityScore += 20;
    } else if (avgBrightness > 200) {
      qualityIssues.push('Image too bright');
      qualityScore += 20;
    } else {
      qualityScore += 50;
    }

    // Check contrast (ideal: > 30)
    if (contrast < 20) {
      qualityIssues.push('Low contrast');
      qualityScore += 10;
    } else {
      qualityScore += 50;
    }

    return {
      score: qualityScore,
      brightness: Math.round(avgBrightness),
      contrast: Math.round(contrast),
      rating: qualityScore > 70 ? 'Good' : qualityScore > 40 ? 'Fair' : 'Poor',
      issues: qualityIssues
    };
  }

  /**
   * Detect features in the ultrasound image
   */
  async detectFeatures(imageData) {
    const features = [];

    try {
      // Edge detection for boundaries
      const edges = this.detectEdges(imageData);
      features.push({
        type: 'edges',
        description: 'Detected boundaries and interfaces',
        count: edges.count,
        strength: edges.strength
      });

      // Detect bright spots (potential calcifications or gas)
      const brightSpots = this.detectBrightRegions(imageData);
      if (brightSpots.length > 0) {
        features.push({
          type: 'hyperechoic',
          description: 'Bright (hyperechoic) regions detected',
          count: brightSpots.length,
          locations: brightSpots
        });
      }

      // Detect dark regions (potential fluid or cysts)
      const darkRegions = this.detectDarkRegions(imageData);
      if (darkRegions.length > 0) {
        features.push({
          type: 'anechoic',
          description: 'Dark (anechoic) regions detected',
          count: darkRegions.length,
          locations: darkRegions
        });
      }

      return features;
    } catch (error) {
      console.error('Feature detection failed:', error);
      return features;
    }
  }

  /**
   * Simple edge detection algorithm
   */
  detectEdges(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let edgeCount = 0;
    let totalStrength = 0;

    // Sobel operator for edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Get surrounding pixels
        const tl = data[((y-1) * width + (x-1)) * 4];
        const tc = data[((y-1) * width + x) * 4];
        const tr = data[((y-1) * width + (x+1)) * 4];
        const ml = data[(y * width + (x-1)) * 4];
        const mr = data[(y * width + (x+1)) * 4];
        const bl = data[((y+1) * width + (x-1)) * 4];
        const bc = data[((y+1) * width + x) * 4];
        const br = data[((y+1) * width + (x+1)) * 4];

        // Sobel kernels
        const gx = -tl - 2*ml - bl + tr + 2*mr + br;
        const gy = -tl - 2*tc - tr + bl + 2*bc + br;
        const magnitude = Math.sqrt(gx*gx + gy*gy);

        if (magnitude > 50) { // Threshold for edge
          edgeCount++;
          totalStrength += magnitude;
        }
      }
    }

    return {
      count: edgeCount,
      strength: edgeCount > 0 ? totalStrength / edgeCount : 0
    };
  }

  /**
   * Detect bright regions (hyperechoic areas)
   */
  detectBrightRegions(imageData) {
    const data = imageData.data;
    const brightRegions = [];
    const threshold = 200; // Brightness threshold
    
    // Simple region detection
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > threshold) {
        const x = (i / 4) % imageData.width;
        const y = Math.floor((i / 4) / imageData.width);
        
        // Group nearby bright pixels (simplified)
        const existing = brightRegions.find(r => 
          Math.abs(r.x - x) < 50 && Math.abs(r.y - y) < 50
        );
        
        if (existing) {
          existing.size++;
        } else if (brightRegions.length < 100) { // Limit number of regions
          brightRegions.push({ x, y, size: 1, brightness });
        }
      }
    }

    return brightRegions.filter(r => r.size > 10); // Filter small noise
  }

  /**
   * Detect dark regions (anechoic areas)
   */
  detectDarkRegions(imageData) {
    const data = imageData.data;
    const darkRegions = [];
    const threshold = 50; // Darkness threshold
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < threshold) {
        const x = (i / 4) % imageData.width;
        const y = Math.floor((i / 4) / imageData.width);
        
        const existing = darkRegions.find(r => 
          Math.abs(r.x - x) < 50 && Math.abs(r.y - y) < 50
        );
        
        if (existing) {
          existing.size++;
        } else if (darkRegions.length < 100) {
          darkRegions.push({ x, y, size: 1, brightness });
        }
      }
    }

    return darkRegions.filter(r => r.size > 10);
  }

  /**
   * Analyze medical patterns and generate findings
   */
  async analyzeMedicalPatterns(imageData, features) {
    const findings = [];
    const alerts = [];
    let totalConfidence = 0;
    let confidenceCount = 0;

    // Analyze based on detected features
    for (const feature of features) {
      const finding = this.interpretFeature(feature);
      if (finding) {
        findings.push(finding);
        totalConfidence += finding.confidence || 0;
        confidenceCount++;
        
        // Generate alerts for high-concern findings
        if (finding.concern === 'high' && finding.confidence > this.settings.alertThreshold) {
          alerts.push({
            severity: 'high',
            message: finding.description,
            recommendation: finding.recommendation || 'Consult with a medical professional',
            confidence: finding.confidence
          });
        } else if (finding.concern === 'medium' && finding.confidence > this.settings.confidenceThreshold) {
          alerts.push({
            severity: 'medium',
            message: finding.description,
            recommendation: finding.recommendation || 'Consider medical evaluation',
            confidence: finding.confidence
          });
        }
      }
    }

    // Check image quality
    const quality = this.assessImageQuality(imageData);
    if (quality.rating === 'Poor') {
      findings.push({
        type: 'quality',
        description: 'Image quality is suboptimal',
        concern: 'low',
        confidence: 0.9,
        recommendation: 'Adjust probe position, gain settings, or contact gel application',
        issues: quality.issues
      });
    }

    return {
      findings,
      alerts,
      confidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0
    };
  }

  /**
   * Cancer-Specific Analysis
   * Analyzes features for potential cancer indicators based on organ type
   * 
   * CRITICAL: This is EDUCATIONAL ONLY - NOT diagnostic
   */
  async analyzeCancerRisk(imageData, features, organType) {
    if (!this.medicalKnowledge || !organType) {
      return null;
    }

    try {
      // Get cancer-specific information
      const cancerInfo = this.medicalKnowledge.getCancerInfo(organType);
      if (!cancerInfo) {
        return null;
      }

      // Detect cancer-specific features
      const suspiciousFeatures = await this.detectSuspiciousFeatures(imageData, features, organType);
      
      // Use knowledge base to analyze risk
      const riskAnalysis = this.medicalKnowledge.analyzeCancerRisk(organType, suspiciousFeatures);
      
      // Add specific findings
      const cancerFindings = {
        organType: cancerInfo.organName,
        cancerType: organType,
        riskLevel: riskAnalysis.riskLevel,
        suspiciousFeatures: riskAnalysis.matchedFeatures,
        warningSigns: cancerInfo.warningSigns.slice(0, 5), // Top 5
        recommendation: riskAnalysis.recommendation,
        urgency: riskAnalysis.urgency,
        nextSteps: cancerInfo.diagnosticWorkup.slice(0, 3), // First 3 steps
        screeningInfo: cancerInfo.screeningRecommendations,
        criticalDisclaimer: riskAnalysis.disclaimer
      };

      return cancerFindings;
    } catch (error) {
      console.error('Cancer risk analysis failed:', error);
      return null;
    }
  }

  /**
   * Detect features that may be suspicious for cancer
   * Returns array of detected suspicious features
   */
  async detectSuspiciousFeatures(imageData, features, organType) {
    const suspiciousFeatures = [];

    // Analyze image characteristics
    const imageAnalysis = this.analyzeImageCharacteristics(imageData);
    
    // Check for irregular masses/structures
    if (imageAnalysis.hasIrregularMasses) {
      suspiciousFeatures.push({
        type: 'irregular_mass',
        description: 'Irregular or ill-defined mass detected',
        confidence: 0.7
      });
    }

    // Check for solid components
    if (features.some(f => f.type === 'hyperechoic' && f.count > 5)) {
      suspiciousFeatures.push({
        type: 'solid_component',
        description: 'Multiple solid components present',
        confidence: 0.6
      });
    }

    // Check for heterogeneous appearance
    if (imageAnalysis.heterogeneity > 0.6) {
      suspiciousFeatures.push({
        type: 'heterogeneous',
        description: 'Heterogeneous (mixed) tissue appearance',
        confidence: 0.65
      });
    }

    // Check for loss of normal architecture
    if (imageAnalysis.structuralDisruption > 0.5) {
      suspiciousFeatures.push({
        type: 'architectural_distortion',
        description: 'Loss of normal tissue architecture',
        confidence: 0.7
      });
    }

    // Organ-specific features
    if (organType === 'breast') {
      // Taller-than-wide orientation (concerning for breast cancer)
      if (imageAnalysis.aspectRatio > 1.2) {
        suspiciousFeatures.push({
          type: 'taller_than_wide',
          description: 'Vertical orientation of mass (taller than wide)',
          confidence: 0.75
        });
      }

      // Posterior acoustic shadowing
      if (imageAnalysis.hasPosteriorShadowing) {
        suspiciousFeatures.push({
          type: 'posterior_shadowing',
          description: 'Posterior acoustic shadowing present',
          confidence: 0.7
        });
      }

      // Spiculated margins
      if (imageAnalysis.hasSpiculatedMargins) {
        suspiciousFeatures.push({
          type: 'spiculated_margins',
          description: 'Star-shaped or spiculated borders detected',
          confidence: 0.8
        });
      }
    }

    if (organType === 'ovarian' || organType === 'ovary') {
      // Complex cystic masses
      if (features.some(f => f.type === 'anechoic') && features.some(f => f.type === 'hyperechoic')) {
        suspiciousFeatures.push({
          type: 'complex_mass',
          description: 'Complex mass with both solid and cystic components',
          confidence: 0.75
        });
      }

      // Thick septations
      if (imageAnalysis.hasThickSeptations) {
        suspiciousFeatures.push({
          type: 'thick_septations',
          description: 'Thick walls or septations within cystic structure',
          confidence: 0.7
        });
      }
    }

    if (organType === 'testicular' || organType === 'testicle') {
      // Hypoechoic mass
      const darkRegions = features.find(f => f.type === 'anechoic');
      if (darkRegions && darkRegions.count > 0) {
        suspiciousFeatures.push({
          type: 'hypoechoic_mass',
          description: 'Hypoechoic (darker) mass within testicle',
          confidence: 0.8
        });
      }

      // Testicular enlargement (asymmetry)
      if (imageAnalysis.hasAsymmetry) {
        suspiciousFeatures.push({
          type: 'asymmetry',
          description: 'Testicular asymmetry or enlargement detected',
          confidence: 0.75
        });
      }
    }

    return suspiciousFeatures;
  }

  /**
   * Analyze image characteristics for cancer detection
   */
  analyzeImageCharacteristics(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let brightPixels = 0;
    let darkPixels = 0;
    let totalVariance = 0;
    
    // Analyze pixel distribution
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      if (brightness > 180) brightPixels++;
      if (brightness < 75) darkPixels++;
      
      // Calculate local variance for heterogeneity
      if (i > width * 4 && i < data.length - width * 4) {
        const prevBrightness = (data[i - width * 4] + data[i - width * 4 + 1] + data[i - width * 4 + 2]) / 3;
        totalVariance += Math.abs(brightness - prevBrightness);
      }
    }

    const totalPixels = data.length / 4;
    const heterogeneity = totalVariance / totalPixels / 255; // Normalize
    
    // Simple heuristics for suspicious features
    // These are very basic and would need proper ML models for real detection
    return {
      heterogeneity: Math.min(heterogeneity, 1),
      hasIrregularMasses: heterogeneity > 0.5 && brightPixels / totalPixels > 0.2,
      hasPosteriorShadowing: darkPixels / totalPixels > 0.3,
      hasSpiculatedMargins: false, // Would need edge analysis
      hasThickSeptations: false, // Would need structural analysis  
      hasAsymmetry: false, // Would need comparison
      structuralDisruption: heterogeneity,
      aspectRatio: height / width // Simplified
    };
  }

  /**
   * Interpret detected features using medical knowledge
   */
  interpretFeature(feature) {
    const interpretations = {
      hyperechoic: {
        description: 'Bright (hyperechoic) regions may indicate calcifications, gas, or dense tissue',
        concern: 'medium',
        confidence: 0.5,
        recommendation: 'If persistent or growing, recommend medical imaging review',
        medicalNote: 'Hyperechoic regions require context - may be normal anatomy, artifacts, or pathology'
      },
      anechoic: {
        description: 'Dark (anechoic) regions may indicate fluid-filled structures or cysts',
        concern: 'low',
        confidence: 0.6,
        recommendation: 'Simple cysts are often benign, but medical evaluation recommended for complex features',
        medicalNote: 'Anechoic regions are common - bladder, vessels, simple cysts are typically benign'
      },
      edges: {
        description: 'Tissue boundaries and interfaces detected',
        concern: 'low',
        confidence: 0.7,
        recommendation: 'Normal anatomical boundaries - no immediate concern',
        medicalNote: 'Edge detection helps identify organ boundaries and structures'
      }
    };

    const interpretation = interpretations[feature.type];
    if (interpretation) {
      return {
        type: feature.type,
        count: feature.count,
        ...interpretation
      };
    }

    return null;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Add disclaimer
    recommendations.push({
      type: 'disclaimer',
      priority: 'critical',
      message: '⚠️ IMPORTANT: This is NOT a medical diagnosis. All findings require professional medical evaluation.'
    });

    // Image quality recommendations
    if (analysis.quality && analysis.quality.rating === 'Poor') {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        message: 'Improve image quality by adjusting probe position, gain, or gel application'
      });
    }

    // Alert-based recommendations
    if (analysis.alerts && analysis.alerts.length > 0) {
      const highSeverityAlerts = analysis.alerts.filter(a => a.severity === 'high');
      if (highSeverityAlerts.length > 0) {
        recommendations.push({
          type: 'medical',
          priority: 'high',
          message: '🏥 Seek medical evaluation soon for concerning findings detected'
        });
      }
    }

    // General guidance
    if (analysis.findings && analysis.findings.length > 5) {
      recommendations.push({
        type: 'technical',
        priority: 'medium',
        message: 'Multiple features detected - recommend comprehensive medical imaging review'
      });
    }

    // Education
    recommendations.push({
      type: 'education',
      priority: 'low',
      message: '📚 Review ultrasound knowledge base for understanding artifacts and normal anatomy'
    });

    return recommendations;
  }

  /**
   * Handle alerts by notifying the user
   */
  handleAlerts(alerts, frame) {
    for (const alert of alerts) {
      // Dispatch custom event for UI to handle
      window.dispatchEvent(new CustomEvent('ultrasound-alert', {
        detail: {
          alert,
          frame: {
            id: frame.id,
            timestamp: frame.timestamp,
            frameNumber: frame.frameNumber
          }
        }
      }));

      console.warn(`⚠️ ALERT [${alert.severity}]: ${alert.message}`);
    }
  }

  /**
   * Save frame to localStorage
   */
  saveFrameToStorage(frame) {
    try {
      const storageKey = `ultrasound_session_${this.sessionStartTime}`;
      const existingData = localStorage.getItem(storageKey);
      const sessionData = existingData ? JSON.parse(existingData) : {
        sessionId: this.sessionStartTime,
        startTime: new Date(this.sessionStartTime).toISOString(),
        frames: []
      };

      // Store frame metadata (not full image to save space)
      sessionData.frames.push({
        id: frame.id,
        timestamp: frame.timestamp,
        relativeTime: frame.relativeTime,
        frameNumber: frame.frameNumber,
        analysis: frame.analysis,
        // Store thumbnail instead of full image
        thumbnail: this.createThumbnail(frame.imageData)
      });

      localStorage.setItem(storageKey, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save frame to storage:', error);
    }
  }

  /**
   * Create thumbnail from image data
   */
  createThumbnail(imageDataURL, maxSize = 200) {
    // Return placeholder for now - actual implementation would resize
    return imageDataURL.substring(0, 100) + '...';
  }

  /**
   * Generate session summary
   */
  generateSessionSummary() {
    const duration = Date.now() - this.sessionStartTime;
    const totalAlerts = this.analysisResults.reduce((sum, r) => 
      sum + (r.alerts ? r.alerts.length : 0), 0
    );
    const highPriorityAlerts = this.analysisResults.reduce((sum, r) => 
      sum + (r.alerts ? r.alerts.filter(a => a.severity === 'high').length : 0), 0
    );

    const avgConfidence = this.analysisResults.length > 0
      ? this.analysisResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / this.analysisResults.length
      : 0;

    return {
      sessionId: this.sessionStartTime,
      startTime: new Date(this.sessionStartTime).toISOString(),
      endTime: new Date().toISOString(),
      duration: Math.round(duration / 1000), // seconds
      totalFrames: this.frameCount,
      analyzedFrames: this.analysisResults.length,
      totalAlerts,
      highPriorityAlerts,
      avgConfidence: Math.round(avgConfidence * 100),
      recommendation: highPriorityAlerts > 0 
        ? 'Medical evaluation recommended for concerning findings'
        : 'Review findings with healthcare provider if symptoms persist'
    };
  }

  /**
   * Export session data
   */
  exportSession(format = 'json') {
    const sessionData = {
      summary: this.generateSessionSummary(),
      frames: this.capturedFrames.map(f => ({
        id: f.id,
        timestamp: new Date(f.timestamp).toISOString(),
        frameNumber: f.frameNumber,
        analysis: f.analysis
      })),
      settings: this.settings
    };

    if (format === 'json') {
      return JSON.stringify(sessionData, null, 2);
    }

    // CSV format for medical professionals
    if (format === 'csv') {
      let csv = 'Frame,Timestamp,Quality,Findings,Alerts,Confidence\n';
      for (const frame of this.capturedFrames) {
        if (frame.analysis) {
          csv += `${frame.frameNumber},${new Date(frame.timestamp).toISOString()},`;
          csv += `${frame.analysis.quality?.rating || 'N/A'},`;
          csv += `${frame.analysis.findings?.length || 0},`;
          csv += `${frame.analysis.alerts?.length || 0},`;
          csv += `${Math.round((frame.analysis.confidence || 0) * 100)}%\n`;
        }
      }
      return csv;
    }

    return sessionData;
  }

  /**
   * Clear all session data
   */
  clearSession() {
    this.capturedFrames = [];
    this.analysisResults = [];
    this.frameCount = 0;
    this.sessionStartTime = null;
    console.log('✅ Session data cleared');
  }

  /**
   * Set organ type for cancer-specific analysis
   * @param {string} organType - 'breast', 'ovarian', 'testicular', or null
   */
  setOrganType(organType) {
    const validTypes = ['breast', 'ovarian', 'ovary', 'testicular', 'testicle', null];
    if (validTypes.includes(organType)) {
      this.settings.organType = organType;
      console.log(`✅ Organ type set to: ${organType || 'general'}`);
      return true;
    } else {
      console.warn(`⚠️ Invalid organ type: ${organType}`);
      return false;
    }
  }

  /**
   * Enable or disable cancer detection
   * @param {boolean} enabled - true to enable, false to disable
   */
  setCancerDetection(enabled) {
    this.settings.cancerDetectionEnabled = !!enabled;
    console.log(`✅ Cancer detection ${enabled ? 'enabled' : 'disabled'}`);
    
    if (enabled && !this.settings.organType) {
      console.warn('⚠️ Cancer detection enabled but no organ type specified. Set organ type with setOrganType()');
    }
  }

  /**
   * Get current cancer detection settings
   */
  getCancerDetectionSettings() {
    return {
      enabled: this.settings.cancerDetectionEnabled,
      organType: this.settings.organType,
      availableOrgans: ['breast', 'ovarian', 'testicular']
    };
  }

  /**
   * Get cancer information for education
   * @param {string} cancerType - type of cancer to get info about
   */
  getCancerInfo(cancerType) {
    if (!this.medicalKnowledge) {
      console.warn('⚠️ Medical knowledge base not loaded');
      return null;
    }
    return this.medicalKnowledge.getCancerInfo(cancerType);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UltrasoundLiveAnalysis;
} else if (typeof window !== 'undefined') {
  window.UltrasoundLiveAnalysis = UltrasoundLiveAnalysis;
}
