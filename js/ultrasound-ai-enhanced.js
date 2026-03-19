// RootIB: RB-20260319142113-0F548FB2
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
 * File: ultrasound-ai-enhanced.js
 * Declaration ID: IP-2404DAC6-MLL28ZV7
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Enhanced Ultrasound AI Analysis System
 * 
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * 
 * PURPOSE: Advanced AI-powered analysis for ultrasound images including:
 * - Real-time tumor detection using TensorFlow.js
 * - Medical advice generation based on findings
 * - Anomaly detection and logging
 * - Python bridge for deep analysis
 * - Live scanning guidance
 * 
 * CRITICAL MEDICAL DISCLAIMER:
 * ============================
 * This is NOT a diagnostic medical device and is NOT FDA approved.
 * This tool is for EDUCATIONAL and PERSONAL OBSERVATION purposes ONLY.
 * ALL findings MUST be reviewed by qualified medical professionals.
 * Do NOT use this for self-diagnosis or treatment decisions.
 * Seek immediate medical attention for any concerning symptoms.
 * 
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 */

class UltrasoundAIEnhanced {
  constructor() {
    this.tfReady = false;
    this.models = {
      objectDetection: null,
      segmentation: null,
      classification: null
    };
    
    // Tumor detection patterns
    this.tumorPatterns = {
      // Ultrasound characteristics of concerning masses
      suspicious: {
        shape: ['irregular', 'spiculated', 'microlobulated'],
        margins: ['indistinct', 'angular', 'microlobulated'],
        echogenicity: ['hypoechoic', 'complex', 'heterogeneous'],
        posterior: ['shadowing', 'mixed'],
        vascularity: ['increased', 'chaotic']
      },
      benign: {
        shape: ['round', 'oval', 'lobular'],
        margins: ['circumscribed', 'smooth'],
        echogenicity: ['anechoic', 'hyperechoic', 'homogeneous'],
        posterior: ['enhancement', 'none'],
        vascularity: ['absent', 'minimal']
      }
    };
    
    // Medical advice database
    this.medicalAdvice = {
      urgentFindings: [
        'suspicious_mass',
        'solid_irregular_mass',
        'rapid_growth',
        'extensive_vascularity',
        'lymph_node_involvement'
      ],
      moderateFindings: [
        'complex_cyst',
        'suspicious_calcifications',
        'new_solid_nodule',
        'architectural_distortion'
      ],
      routineFindings: [
        'simple_cyst',
        'benign_calcification',
        'normal_tissue'
      ]
    };
    
    // Anomaly log
    this.anomalyLog = [];
    this.sessionData = {
      startTime: null,
      totalFrames: 0,
      anomaliesDetected: 0,
      adviceGiven: []
    };
  }

  /**
   * Initialize TensorFlow.js and load models
   */
  async initialize() {
    try {
      console.log('🔧 Initializing Enhanced Ultrasound AI...');
      
      // Check for TensorFlow.js
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.js not loaded');
      }
      
      await tf.ready();
      this.tfReady = true;
      
      console.log('✅ TensorFlow.js ready');
      console.log('📊 Backend:', tf.getBackend());
      console.log('🖥️ Device:', await tf.env().get('WEBGL_VERSION'));
      
      // Load models
      await this.loadModels();
      
      // Initialize session
      this.sessionData.startTime = new Date().toISOString();
      
      console.log('✅ Enhanced Ultrasound AI initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Ultrasound AI:', error);
      this.tfReady = false;
      return false;
    }
  }

  /**
   * Load TensorFlow.js models for analysis
   */
  async loadModels() {
    try {
      // Use COCO-SSD for general object detection as a base
      if (typeof cocoSsd !== 'undefined') {
        console.log('📦 Loading object detection model...');
        this.models.objectDetection = await cocoSsd.load();
        console.log('✅ Object detection model loaded');
      }
      
      // Note: In production, load specialized medical imaging models
      // For now, we'll use image analysis techniques
      console.log('ℹ️ Using algorithmic analysis for specialized detection');
      
    } catch (error) {
      console.warn('⚠️ Model loading failed, using fallback algorithms:', error);
    }
  }

  /**
   * Analyze ultrasound image for tumors and anomalies
   */
  async analyzeImage(imageElement, options = {}) {
    if (!this.tfReady) {
      console.warn('⚠️ TensorFlow not ready, using basic analysis');
      return await this.fallbackAnalysis(imageElement, options);
    }

    try {
      const results = {
        timestamp: new Date().toISOString(),
        organType: options.organType || 'unknown',
        findings: [],
        tumors: [],
        quality: null,
        advice: [],
        confidence: 0,
        requiresAttention: false
      };

      // Step 1: Image quality assessment
      results.quality = await this.assessImageQuality(imageElement);
      
      // Step 2: Detect potential masses/tumors
      const tumorAnalysis = await this.detectTumors(imageElement, options);
      results.tumors = tumorAnalysis.tumors;
      results.findings = tumorAnalysis.findings;
      
      // Step 3: Analyze texture and patterns
      const textureAnalysis = await this.analyzeTexture(imageElement);
      results.findings.push(...textureAnalysis.findings);
      
      // Step 4: Detect specific anomalies
      const anomalies = await this.detectAnomalies(imageElement, options);
      results.findings.push(...anomalies);
      
      // Step 5: Calculate overall confidence
      results.confidence = this.calculateConfidence(results);
      
      // Step 6: Generate medical advice
      results.advice = this.generateMedicalAdvice(results);
      
      // Step 7: Determine if requires urgent attention
      results.requiresAttention = this.requiresUrgentAttention(results);
      
      // Step 8: Log anomalies
      if (anomalies.length > 0 || results.tumors.length > 0) {
        this.logAnomaly(results);
      }
      
      // Update session stats
      this.sessionData.totalFrames++;
      if (anomalies.length > 0) {
        this.sessionData.anomaliesDetected++;
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
        findings: [],
        advice: ['Analysis error occurred. Please try again or consult a medical professional.']
      };
    }
  }

  /**
   * Detect potential tumors in ultrasound image
   */
  async detectTumors(imageElement, options) {
    const results = {
      tumors: [],
      findings: []
    };

    try {
      // Create tensor from image
      const imageTensor = tf.browser.fromPixels(imageElement);
      
      // Resize to standard size for analysis
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      
      // Convert to grayscale for ultrasound analysis
      const grayscale = resized.mean(2).expandDims(2);
      
      // Normalize
      const normalized = grayscale.div(255.0);
      
      // Analyze intensity patterns
      const stats = await this.calculateImageStats(normalized);
      
      // Detect dark (hypoechoic) regions - potential solid masses
      const darkRegions = await this.findDarkRegions(normalized, stats);
      
      // Detect bright (hyperechoic) regions - calcifications, dense tissue
      const brightRegions = await this.findBrightRegions(normalized, stats);
      
      // Detect heterogeneous regions - mixed echogenicity
      const heterogeneousRegions = await this.findHeterogeneousRegions(normalized, stats);
      
      // Analyze each detected region
      for (const region of darkRegions) {
        const tumorLikelihood = this.assessTumorLikelihood(region, 'hypoechoic', options);
        
        if (tumorLikelihood.score > 0.3) {
          results.tumors.push({
            type: 'hypoechoic_mass',
            location: region.location,
            size: region.size,
            characteristics: tumorLikelihood.characteristics,
            suspicionLevel: tumorLikelihood.suspicionLevel,
            confidence: tumorLikelihood.score,
            recommendation: tumorLikelihood.recommendation
          });
        }
      }
      
      for (const region of brightRegions) {
        if (region.intensity > stats.mean + 2 * stats.std) {
          results.findings.push({
            type: 'hyperechoic_region',
            location: region.location,
            description: 'Bright region detected - may indicate calcification or dense tissue',
            confidence: 0.6,
            recommendation: 'Consider correlation with clinical findings'
          });
        }
      }
      
      for (const region of heterogeneousRegions) {
        const complexity = region.variance / (stats.std + 0.001);
        if (complexity > 1.5) {
          results.findings.push({
            type: 'complex_mass',
            location: region.location,
            description: 'Region with mixed echogenicity detected',
            confidence: 0.7,
            recommendation: 'Complex masses require professional evaluation'
          });
        }
      }
      
      // Cleanup tensors
      imageTensor.dispose();
      resized.dispose();
      grayscale.dispose();
      normalized.dispose();
      
    } catch (error) {
      console.error('❌ Tumor detection error:', error);
      results.findings.push({
        type: 'analysis_error',
        description: 'Technical analysis error occurred',
        recommendation: 'Review image manually and consult professional'
      });
    }

    return results;
  }

  /**
   * Calculate image statistics
   */
  async calculateImageStats(tensor) {
    const mean = await tensor.mean().data();
    const variance = await tf.moments(tensor).variance.data();
    const std = Math.sqrt(variance[0]);
    
    return {
      mean: mean[0],
      variance: variance[0],
      std: std
    };
  }

  /**
   * Find dark (hypoechoic) regions
   */
  async findDarkRegions(tensor, stats) {
    const regions = [];
    const threshold = stats.mean - stats.std;
    
    // Sample-based detection (full pixel analysis would be too slow)
    const data = await tensor.squeeze().array();
    const height = data.length;
    const width = data[0].length;
    
    // Use sliding window to detect clusters
    const windowSize = 20;
    for (let y = 0; y < height - windowSize; y += windowSize) {
      for (let x = 0; x < width - windowSize; x += windowSize) {
        let darkPixels = 0;
        let totalIntensity = 0;
        
        for (let dy = 0; dy < windowSize; dy++) {
          for (let dx = 0; dx < windowSize; dx++) {
            const intensity = data[y + dy][x + dx];
            totalIntensity += intensity;
            if (intensity < threshold) {
              darkPixels++;
            }
          }
        }
        
        const darkPercentage = darkPixels / (windowSize * windowSize);
        if (darkPercentage > 0.6) { // More than 60% dark pixels
          regions.push({
            location: { x, y, width: windowSize, height: windowSize },
            intensity: totalIntensity / (windowSize * windowSize),
            size: windowSize * windowSize,
            darkPercentage
          });
        }
      }
    }
    
    return regions;
  }

  /**
   * Find bright (hyperechoic) regions
   */
  async findBrightRegions(tensor, stats) {
    const regions = [];
    const threshold = stats.mean + stats.std;
    
    const data = await tensor.squeeze().array();
    const height = data.length;
    const width = data[0].length;
    
    const windowSize = 15;
    for (let y = 0; y < height - windowSize; y += windowSize) {
      for (let x = 0; x < width - windowSize; x += windowSize) {
        let brightPixels = 0;
        let totalIntensity = 0;
        
        for (let dy = 0; dy < windowSize; dy++) {
          for (let dx = 0; dx < windowSize; dx++) {
            const intensity = data[y + dy][x + dx];
            totalIntensity += intensity;
            if (intensity > threshold) {
              brightPixels++;
            }
          }
        }
        
        const brightPercentage = brightPixels / (windowSize * windowSize);
        if (brightPercentage > 0.5) {
          regions.push({
            location: { x, y, width: windowSize, height: windowSize },
            intensity: totalIntensity / (windowSize * windowSize),
            size: windowSize * windowSize
          });
        }
      }
    }
    
    return regions;
  }

  /**
   * Find heterogeneous regions
   */
  async findHeterogeneousRegions(tensor, stats) {
    const regions = [];
    const data = await tensor.squeeze().array();
    const height = data.length;
    const width = data[0].length;
    
    const windowSize = 25;
    for (let y = 0; y < height - windowSize; y += windowSize) {
      for (let x = 0; x < width - windowSize; x += windowSize) {
        const intensities = [];
        
        for (let dy = 0; dy < windowSize; dy++) {
          for (let dx = 0; dx < windowSize; dx++) {
            intensities.push(data[y + dy][x + dx]);
          }
        }
        
        // Calculate local variance
        const mean = intensities.reduce((a, b) => a + b) / intensities.length;
        const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;
        
        if (variance > stats.variance * 1.2) {
          regions.push({
            location: { x, y, width: windowSize, height: windowSize },
            variance,
            mean
          });
        }
      }
    }
    
    return regions;
  }

  /**
   * Assess likelihood that a region is a tumor
   */
  assessTumorLikelihood(region, echogenicity, options) {
    let score = 0;
    const characteristics = [];
    let suspicionLevel = 'low';
    let recommendation = 'Monitor region';
    
    // Size factor
    if (region.size > 400) { // Larger masses more concerning
      score += 0.3;
      characteristics.push('large_size');
    }
    
    // Echogenicity pattern
    if (echogenicity === 'hypoechoic') {
      score += 0.2;
      characteristics.push('hypoechoic');
    }
    
    // Dark percentage (for hypoechoic regions)
    if (region.darkPercentage > 0.8) {
      score += 0.2;
      characteristics.push('homogeneous_hypoechoic');
      suspicionLevel = 'moderate';
    }
    
    // Intensity contrast
    if (region.intensity < 0.3) { // Very dark
      score += 0.15;
      characteristics.push('marked_hypoechogenicity');
    }
    
    // Organ-specific risk factors
    if (options.organType) {
      if (options.organType === 'breast' && score > 0.4) {
        score += 0.15;
        characteristics.push('breast_solid_mass');
        suspicionLevel = 'high';
        recommendation = 'URGENT: Consult oncologist for biopsy evaluation';
      } else if (options.organType === 'thyroid' && score > 0.4) {
        score += 0.1;
        characteristics.push('thyroid_nodule');
        suspicionLevel = 'moderate';
        recommendation = 'Thyroid nodule detected - endocrinology consultation recommended';
      }
    }
    
    // Set final suspicion level and recommendation
    if (score > 0.7) {
      suspicionLevel = 'high';
      recommendation = 'URGENT: Immediate medical evaluation required. Findings suspicious for malignancy.';
    } else if (score > 0.5) {
      suspicionLevel = 'moderate';
      recommendation = 'Further evaluation recommended. Consider biopsy or additional imaging.';
    } else if (score > 0.3) {
      suspicionLevel = 'low-moderate';
      recommendation = 'Follow-up recommended. Monitor for changes.';
    }
    
    return {
      score: Math.min(score, 1.0),
      characteristics,
      suspicionLevel,
      recommendation
    };
  }

  /**
   * Analyze texture patterns
   */
  async analyzeTexture(imageElement) {
    const findings = [];
    
    try {
      const tensor = tf.browser.fromPixels(imageElement);
      const grayscale = tensor.mean(2);
      
      // Calculate local standard deviation
      const mean = await grayscale.mean().data();
      const std = await tf.moments(grayscale).variance.data();
      const stdValue = Math.sqrt(std[0]);
      
      // Texture uniformity assessment
      const uniformity = mean[0] / (stdValue + 0.001);
      
      if (uniformity < 2) {
        findings.push({
          type: 'heterogeneous_texture',
          description: 'Image shows heterogeneous echotexture',
          confidence: 0.6,
          recommendation: 'Heterogeneous patterns may indicate pathology - medical review recommended'
        });
      }
      
      tensor.dispose();
      grayscale.dispose();
      
    } catch (error) {
      console.error('Texture analysis error:', error);
    }
    
    return { findings };
  }

  /**
   * Detect various anomalies
   */
  async detectAnomalies(imageElement, options) {
    const anomalies = [];
    
    try {
      // Detect shadowing (acoustic shadow - may indicate calcification or dense mass)
      // Detect enhancement (posterior acoustic enhancement - fluid-filled structures)
      // Detect architectural distortion
      // These would require more sophisticated analysis in production
      
      // For now, basic pattern detection
      const tensor = tf.browser.fromPixels(imageElement);
      const grayscale = tensor.mean(2);
      
      // Detect potential shadowing
      const data = await grayscale.array();
      const height = data.length;
      
      // Check for vertical dark bands (shadowing pattern)
      for (let x = 0; x < data[0].length; x += 10) {
        let darkCount = 0;
        for (let y = Math.floor(height * 0.3); y < height; y++) {
          if (data[y][x] < 0.2) {
            darkCount++;
          }
        }
        
        if (darkCount > height * 0.3) {
          anomalies.push({
            type: 'posterior_shadowing',
            location: { x, y: Math.floor(height * 0.3) },
            description: 'Posterior acoustic shadowing detected',
            confidence: 0.5,
            recommendation: 'May indicate calcification or dense structure - medical correlation needed'
          });
          break; // Only report once
        }
      }
      
      tensor.dispose();
      grayscale.dispose();
      
    } catch (error) {
      console.error('Anomaly detection error:', error);
    }
    
    return anomalies;
  }

  /**
   * Assess image quality
   */
  async assessImageQuality(imageElement) {
    try {
      const tensor = tf.browser.fromPixels(imageElement);
      const grayscale = tensor.mean(2);
      
      // Calculate quality metrics
      const mean = await grayscale.mean().data();
      const moments = await tf.moments(grayscale);
      const variance = await moments.variance.data();
      const std = Math.sqrt(variance[0]);
      
      // Quality score (0-100)
      let score = 50;
      
      // Good contrast
      if (std > 0.15 && std < 0.35) {
        score += 20;
      } else {
        score -= 10;
      }
      
      // Good brightness
      if (mean[0] > 0.3 && mean[0] < 0.7) {
        score += 20;
      } else {
        score -= 10;
      }
      
      // Resolution check
      if (imageElement.width > 600 && imageElement.height > 400) {
        score += 10;
      }
      
      score = Math.max(0, Math.min(100, score));
      
      tensor.dispose();
      grayscale.dispose();
      moments.variance.dispose();
      
      return {
        score,
        rating: score > 70 ? 'good' : score > 40 ? 'fair' : 'poor',
        brightness: mean[0],
        contrast: std,
        resolution: { width: imageElement.width, height: imageElement.height }
      };
      
    } catch (error) {
      console.error('Quality assessment error:', error);
      return { score: 0, rating: 'unknown', error: error.message };
    }
  }

  /**
   * Calculate overall confidence in analysis
   */
  calculateConfidence(results) {
    if (!results.quality || !results.findings) {
      return 0;
    }
    
    let confidence = results.quality.score / 100;
    
    // Reduce confidence if many findings
    if (results.findings.length > 5) {
      confidence *= 0.8;
    }
    
    // Increase confidence if findings are consistent
    const highConfidenceFindings = results.findings.filter(f => f.confidence > 0.7);
    if (highConfidenceFindings.length > 0) {
      confidence = Math.min(1.0, confidence * 1.1);
    }
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Generate medical advice based on findings
   */
  generateMedicalAdvice(results) {
    const advice = [];
    
    // Always include disclaimer
    advice.push({
      type: 'disclaimer',
      priority: 'critical',
      message: '⚠️ IMPORTANT: This is NOT a medical diagnosis. All findings require professional medical evaluation.',
      timestamp: new Date().toISOString()
    });
    
    // Quality-based advice
    if (results.quality && results.quality.score < 40) {
      advice.push({
        type: 'imaging_quality',
        priority: 'medium',
        message: '📸 Image quality is suboptimal. Try adjusting:\n- Probe position and angle\n- Ultrasound gain settings\n- Contact gel application\n- Patient positioning',
        timestamp: new Date().toISOString()
      });
    }
    
    // Tumor-specific advice
    if (results.tumors && results.tumors.length > 0) {
      const highSuspicion = results.tumors.filter(t => t.suspicionLevel === 'high');
      const moderateSuspicion = results.tumors.filter(t => t.suspicionLevel === 'moderate');
      
      if (highSuspicion.length > 0) {
        advice.push({
          type: 'urgent_finding',
          priority: 'urgent',
          message: `🚨 URGENT: ${highSuspicion.length} suspicious mass(es) detected. Immediate medical evaluation required. Do NOT delay - contact your healthcare provider today.`,
          findings: highSuspicion,
          timestamp: new Date().toISOString()
        });
      }
      
      if (moderateSuspicion.length > 0) {
        advice.push({
          type: 'concerning_finding',
          priority: 'high',
          message: `⚠️ ${moderateSuspicion.length} concerning mass(es) detected. Schedule medical evaluation within 1-2 weeks. Bring this data to your appointment.`,
          findings: moderateSuspicion,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // General findings advice
    const concerningFindings = results.findings.filter(f => 
      f.type.includes('complex') || f.type.includes('suspicious') || f.confidence > 0.7
    );
    
    if (concerningFindings.length > 0) {
      advice.push({
        type: 'findings_detected',
        priority: 'medium',
        message: `🔍 ${concerningFindings.length} notable finding(s) detected. Medical review recommended.`,
        findings: concerningFindings,
        timestamp: new Date().toISOString()
      });
    }
    
    // Data logging advice
    advice.push({
      type: 'documentation',
      priority: 'low',
      message: '💾 Save this analysis and all images. Create a timeline of any symptoms. Share with your healthcare provider for comprehensive evaluation.',
      timestamp: new Date().toISOString()
    });
    
    // Professional consultation advice
    advice.push({
      type: 'professional_consultation',
      priority: 'medium',
      message: '🏥 Ultrasound findings always require professional interpretation. Schedule an appointment with:\n- Radiologist for formal imaging\n- Specialist (oncologist, endocrinologist, etc.) for clinical correlation\n- Primary care physician for coordination',
      timestamp: new Date().toISOString()
    });
    
    this.sessionData.adviceGiven.push(...advice);
    return advice;
  }

  /**
   * Check if findings require urgent attention
   */
  requiresUrgentAttention(results) {
    // High suspicion tumors
    if (results.tumors) {
      const urgent = results.tumors.some(t => t.suspicionLevel === 'high');
      if (urgent) return true;
    }
    
    // Multiple concerning findings
    const concerning = results.findings.filter(f => 
      f.confidence > 0.7 || f.type.includes('suspicious')
    );
    if (concerning.length >= 3) return true;
    
    return false;
  }

  /**
   * Log anomaly for record keeping
   */
  logAnomaly(results) {
    const logEntry = {
      timestamp: results.timestamp,
      organType: results.organType,
      tumors: results.tumors.length,
      findings: results.findings.length,
      confidence: results.confidence,
      requiresAttention: results.requiresAttention,
      summary: this.createSummary(results)
    };
    
    this.anomalyLog.push(logEntry);
    
    // Keep only last 100 entries
    if (this.anomalyLog.length > 100) {
      this.anomalyLog = this.anomalyLog.slice(-100);
    }
    
    console.log('📝 Anomaly logged:', logEntry.summary);
  }

  /**
   * Create summary of findings
   */
  createSummary(results) {
    const parts = [];
    
    if (results.tumors.length > 0) {
      parts.push(`${results.tumors.length} potential mass(es)`);
    }
    
    if (results.findings.length > 0) {
      parts.push(`${results.findings.length} finding(s)`);
    }
    
    if (results.requiresAttention) {
      parts.push('REQUIRES ATTENTION');
    }
    
    return parts.join(', ') || 'No significant findings';
  }

  /**
   * Get anomaly log
   */
  getAnomalyLog() {
    return {
      totalEntries: this.anomalyLog.length,
      entries: this.anomalyLog,
      sessionData: this.sessionData
    };
  }

  /**
   * Export anomaly log as CSV for medical professionals
   */
  exportAnomalyLogCSV() {
    const headers = ['Timestamp', 'Organ Type', 'Tumors', 'Findings', 'Confidence', 'Requires Attention', 'Summary'];
    const rows = this.anomalyLog.map(entry => [
      entry.timestamp,
      entry.organType,
      entry.tumors,
      entry.findings,
      entry.confidence,
      entry.requiresAttention ? 'YES' : 'NO',
      entry.summary
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }

  /**
   * Fallback analysis when TensorFlow not available
   */
  async fallbackAnalysis(imageElement, options) {
    return {
      timestamp: new Date().toISOString(),
      organType: options.organType || 'unknown',
      findings: [{
        type: 'system_limitation',
        description: 'Advanced AI analysis unavailable',
        recommendation: 'Manual review recommended'
      }],
      tumors: [],
      advice: [{
        type: 'system_message',
        priority: 'medium',
        message: 'AI analysis unavailable. Please have images reviewed by medical professional.',
        timestamp: new Date().toISOString()
      }],
      confidence: 0,
      requiresAttention: false
    };
  }

  /**
   * Bridge to Python analysis
   */
  async analyzewithPython(imageData, options = {}) {
    try {
      console.log('🐍 Calling Python analysis bridge...');
      
      // Prepare data for Python script
      const payload = {
        imageData: imageData, // Base64 encoded image
        organType: options.organType,
        timestamp: new Date().toISOString(),
        options: options
      };
      
      // Call backend Python script
      const response = await fetch('/api/ultrasound/analyze-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Python analysis failed: ${response.status}`);
      }
      
      const results = await response.json();
      console.log('✅ Python analysis completed');
      
      return results;
      
    } catch (error) {
      console.error('❌ Python bridge error:', error);
      return {
        success: false,
        error: error.message,
        fallback: 'Python analysis unavailable - using browser-only analysis'
      };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UltrasoundAIEnhanced;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.UltrasoundAIEnhanced = UltrasoundAIEnhanced;
}
