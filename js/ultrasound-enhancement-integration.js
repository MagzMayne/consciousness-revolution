// RootIB: RB-20260319142113-A8C0BC2D
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
 * File: ultrasound-enhancement-integration.js
 * Declaration ID: IP-6E7C7A52-MLL28ZV7
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Ultrasound Enhancement Integration Script
 * 
 * Connects image processing and knowledge base to the ultraSound.html UI
 * 
 * @aul-enabled
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 */

(function() {
  'use strict';

  // Wait for DOM and dependencies to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Check if dependencies are loaded
    if (typeof UltrasoundImageProcessor === 'undefined' || 
        typeof UltrasoundKnowledgeBase === 'undefined') {
      console.warn('Ultrasound enhancement dependencies not loaded');
      return;
    }

    console.log('🔍 Initializing ultrasound enhancements...');

    const imageProcessor = new UltrasoundImageProcessor();
    let currentImageFile = null;

    // Get DOM elements
    const imageInput = document.getElementById('imageInput');
    const imageEnhancer = document.getElementById('imageEnhancer');
    const imagePreview = document.getElementById('imagePreview');
    const enhancementCanvas = document.getElementById('enhancementCanvas');

    // Basic controls
    const brightnessSlider = document.getElementById('brightnessSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastSlider = document.getElementById('contrastSlider');
    const contrastValue = document.getElementById('contrastValue');
    const gammaSlider = document.getElementById('gammaSlider');
    const gammaValue = document.getElementById('gammaValue');

    // Buttons
    const resetBtn = document.getElementById('resetBtn');
    const autoEnhanceBtn = document.getElementById('autoEnhanceBtn');
    const grayscaleBtn = document.getElementById('grayscaleBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const edgeDetectBtn = document.getElementById('edgeDetectBtn');
    const speckleReductionBtn = document.getElementById('speckleReductionBtn');
    const medianFilterBtn = document.getElementById('medianFilterBtn');
    const sharpenBtn = document.getElementById('sharpenBtn');
    const histogramBtn = document.getElementById('histogramBtn');

    // Advanced controls
    const colorMapSelect = document.getElementById('colorMapSelect');
    const imageStats = document.getElementById('imageStats');

    // Knowledge base
    const knowledgeSearch = document.getElementById('knowledgeSearch');
    const knowledgeResults = document.getElementById('knowledgeResults');

    // Tab system
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Initialize tabs
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        tabContents.forEach(content => {
          if (content.dataset.content === tabName) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
      });
    });

    // Handle image upload
    if (imageInput) {
      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Only process images (not videos for now)
        if (!file.type.startsWith('image/')) {
          console.log('Video files not supported for enhancement yet');
          return;
        }

        try {
          currentImageFile = file;
          await imageProcessor.loadImage(file);
          
          // Show the enhancement section
          if (imageEnhancer) {
            imageEnhancer.style.display = 'block';
          }

          // Update canvas display
          if (enhancementCanvas) {
            const ctx = enhancementCanvas.getContext('2d');
            enhancementCanvas.width = imageProcessor.canvas.width;
            enhancementCanvas.height = imageProcessor.canvas.height;
            ctx.drawImage(imageProcessor.canvas, 0, 0);
          }

          // Reset sliders
          resetSliders();

          console.log('✅ Image loaded for enhancement');
        } catch (error) {
          console.error('Failed to load image:', error);
          alert('Failed to load image. Please try another file.');
        }
      });
    }

    // Brightness control
    if (brightnessSlider) {
      brightnessSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        brightnessValue.textContent = value;
        
        imageProcessor.reset();
        imageProcessor.adjustBrightness(value);
        updateCanvas();
      });
    }

    // Contrast control
    if (contrastSlider) {
      contrastSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        contrastValue.textContent = value;
        
        imageProcessor.reset();
        imageProcessor.adjustContrast(value);
        updateCanvas();
      });
    }

    // Gamma control
    if (gammaSlider) {
      gammaSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const gamma = value / 100;
        gammaValue.textContent = gamma.toFixed(1);
        
        imageProcessor.reset();
        imageProcessor.applyGamma(gamma);
        updateCanvas();
      });
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        imageProcessor.reset();
        updateCanvas();
        resetSliders();
      });
    }

    // Auto enhance button (histogram equalization + slight sharpen)
    if (autoEnhanceBtn) {
      autoEnhanceBtn.addEventListener('click', () => {
        imageProcessor.reset();
        imageProcessor.convertToGrayscale();
        imageProcessor.applyHistogramEqualization();
        imageProcessor.applySharpen(0.5);
        updateCanvas();
        showStats();
      });
    }

    // Grayscale button
    if (grayscaleBtn) {
      grayscaleBtn.addEventListener('click', () => {
        imageProcessor.convertToGrayscale();
        updateCanvas();
      });
    }

    // Download button
    if (downloadBtn) {
      downloadBtn.addEventListener('click', async () => {
        try {
          const blob = await imageProcessor.exportBlob('png');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ultrasound-enhanced-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log('✅ Image downloaded');
        } catch (error) {
          console.error('Failed to download image:', error);
          alert('Failed to download image');
        }
      });
    }

    // Edge detection
    if (edgeDetectBtn) {
      edgeDetectBtn.addEventListener('click', () => {
        imageProcessor.applyEdgeDetection();
        updateCanvas();
        showStats();
      });
    }

    // Speckle reduction
    if (speckleReductionBtn) {
      speckleReductionBtn.addEventListener('click', () => {
        imageProcessor.applySpeckleReduction(5);
        updateCanvas();
        showStats();
      });
    }

    // Median filter
    if (medianFilterBtn) {
      medianFilterBtn.addEventListener('click', () => {
        imageProcessor.applyMedianFilter(3);
        updateCanvas();
        showStats();
      });
    }

    // Sharpen
    if (sharpenBtn) {
      sharpenBtn.addEventListener('click', () => {
        imageProcessor.applySharpen(1.0);
        updateCanvas();
        showStats();
      });
    }

    // Histogram equalization
    if (histogramBtn) {
      histogramBtn.addEventListener('click', () => {
        imageProcessor.applyHistogramEqualization();
        updateCanvas();
        showStats();
      });
    }

    // Color map
    if (colorMapSelect) {
      colorMapSelect.addEventListener('change', (e) => {
        const colorMap = e.target.value;
        if (colorMap !== 'none') {
          imageProcessor.convertToGrayscale();
          imageProcessor.applyColorMap(colorMap);
          updateCanvas();
        }
      });
    }

    // Knowledge base search
    if (knowledgeSearch) {
      knowledgeSearch.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
          // Show default message
          knowledgeResults.innerHTML = `
            <div class="knowledge-item">
              <h4>Search the Knowledge Base</h4>
              <p>Type to search for ultrasound artifacts, anatomy, terminology, and educational information.</p>
              <p style="margin-top: 6px;"><strong>Examples:</strong> "artifact", "liver", "echogenicity", "doppler"</p>
            </div>
          `;
          return;
        }

        const results = UltrasoundKnowledgeBase.search(query);
        displayKnowledgeResults(results);
      }, 300));
    }

    // Helper functions
    function updateCanvas() {
      if (enhancementCanvas) {
        const ctx = enhancementCanvas.getContext('2d');
        ctx.drawImage(imageProcessor.canvas, 0, 0);
      }
    }

    function resetSliders() {
      if (brightnessSlider) {
        brightnessSlider.value = 0;
        brightnessValue.textContent = '0';
      }
      if (contrastSlider) {
        contrastSlider.value = 0;
        contrastValue.textContent = '0';
      }
      if (gammaSlider) {
        gammaSlider.value = 100;
        gammaValue.textContent = '1.0';
      }
      if (colorMapSelect) {
        colorMapSelect.value = 'none';
      }
      if (imageStats) {
        imageStats.style.display = 'none';
      }
    }

    function showStats() {
      const stats = imageProcessor.getStatistics();
      if (stats && imageStats) {
        document.getElementById('statMin').textContent = stats.min;
        document.getElementById('statMax').textContent = stats.max;
        document.getElementById('statMean').textContent = stats.mean;
        document.getElementById('statStdDev').textContent = stats.stddev;
        document.getElementById('statRange').textContent = stats.range;
        document.getElementById('statPixels').textContent = stats.pixelCount.toLocaleString();
        imageStats.style.display = 'block';
      }
    }

    function displayKnowledgeResults(results) {
      if (!results || results.length === 0) {
        knowledgeResults.innerHTML = `
          <div class="knowledge-item">
            <h4>No Results Found</h4>
            <p>Try different search terms or check spelling.</p>
          </div>
        `;
        return;
      }

      let html = '';
      results.slice(0, 10).forEach(result => {
        html += `<div class="knowledge-item">`;
        html += `<h4>${result.category}: ${result.data.name || result.data.term || result.structure}</h4>`;
        
        if (result.category === 'Artifact') {
          html += `<p><strong>Description:</strong> ${result.data.description}</p>`;
          html += `<p><strong>Appearance:</strong> ${result.data.appearance}</p>`;
          html += `<p><strong>Significance:</strong> ${result.data.significance}</p>`;
        } else if (result.category === 'Anatomy') {
          html += `<p><strong>Location:</strong> ${result.data.location}</p>`;
          html += `<p><strong>Echogenicity:</strong> ${result.data.echogenicity}</p>`;
          html += `<p><strong>Normal Appearance:</strong> ${result.data.normalAppearance}</p>`;
        } else if (result.category === 'Terminology') {
          html += `<p><strong>Definition:</strong> ${result.data.definition}</p>`;
        }
        
        html += `</div>`;
      });

      knowledgeResults.innerHTML = html;
    }

    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    console.log('✅ Ultrasound enhancements initialized');
  }
})();
