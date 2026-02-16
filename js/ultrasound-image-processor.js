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
 * File: ultrasound-image-processor.js
 * Declaration ID: IP-5BA8BC81-MLL28ZV7
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Ultrasound Image Processing Utility
 * 
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * 
 * PURPOSE: Provide image enhancement and analysis tools for personal ultrasound observation
 * 
 * IMPORTANT DISCLAIMER:
 * This is NOT a diagnostic tool. All functions are for personal observation and
 * educational purposes only. Medical professionals should be consulted for any
 * health concerns or diagnostic needs.
 * 
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 */

class UltrasoundImageProcessor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.originalImageData = null;
    this.processedImageData = null;
    this.measurements = [];
  }

  /**
   * Load an image from a file or data URL
   * @param {string|File} source - Image source (URL, data URL, or File object)
   * @returns {Promise<HTMLImageElement>}
   */
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.originalImageData = this.ctx.getImageData(0, 0, img.width, img.height);
        this.processedImageData = this.ctx.getImageData(0, 0, img.width, img.height);
        resolve(img);
      };
      
      img.onerror = reject;
      
      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      } else {
        img.src = source;
      }
    });
  }

  /**
   * Reset to original image
   */
  reset() {
    if (this.originalImageData) {
      this.processedImageData = new ImageData(
        new Uint8ClampedArray(this.originalImageData.data),
        this.originalImageData.width,
        this.originalImageData.height
      );
      this.ctx.putImageData(this.processedImageData, 0, 0);
    }
  }

  /**
   * Apply histogram equalization for better contrast
   * Common in ultrasound imaging to enhance tissue boundaries
   */
  applyHistogramEqualization() {
    if (!this.processedImageData) return;

    const data = this.processedImageData.data;
    const histogram = new Array(256).fill(0);
    const cdf = new Array(256).fill(0);
    
    // Calculate histogram
    for (let i = 0; i < data.length; i += 4) {
      const brightness = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[brightness]++;
    }
    
    // Calculate cumulative distribution function
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }
    
    // Normalize CDF
    const totalPixels = this.processedImageData.width * this.processedImageData.height;
    const cdfMin = cdf.find(v => v > 0) || 0;
    
    // Apply equalization
    for (let i = 0; i < data.length; i += 4) {
      const brightness = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      const newBrightness = Math.round(((cdf[brightness] - cdfMin) / (totalPixels - cdfMin)) * 255);
      
      const ratio = newBrightness / (brightness || 1);
      data[i] = Math.min(255, data[i] * ratio);
      data[i + 1] = Math.min(255, data[i + 1] * ratio);
      data[i + 2] = Math.min(255, data[i + 2] * ratio);
    }
    
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Adjust brightness
   * @param {number} factor - Brightness factor (-100 to 100)
   */
  adjustBrightness(factor) {
    if (!this.processedImageData) return;

    const data = this.processedImageData.data;
    const adjustment = factor * 2.55; // Convert to 0-255 range
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
    }
    
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Adjust contrast
   * @param {number} factor - Contrast factor (-100 to 100)
   */
  adjustContrast(factor) {
    if (!this.processedImageData) return;

    const data = this.processedImageData.data;
    const contrast = (factor + 100) / 100;
    const intercept = 128 * (1 - contrast);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] * contrast + intercept));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * contrast + intercept));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * contrast + intercept));
    }
    
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Apply gamma correction
   * @param {number} gamma - Gamma value (0.1 to 3.0, 1.0 = no change)
   */
  applyGamma(gamma) {
    if (!this.processedImageData) return;

    const data = this.processedImageData.data;
    const gammaCorrection = 1 / gamma;
    
    // Build lookup table for efficiency
    const lookupTable = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      lookupTable[i] = Math.pow(i / 255, gammaCorrection) * 255;
    }
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = lookupTable[data[i]];
      data[i + 1] = lookupTable[data[i + 1]];
      data[i + 2] = lookupTable[data[i + 2]];
    }
    
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Apply Sobel edge detection
   * Useful for highlighting boundaries in ultrasound images
   */
  applyEdgeDetection() {
    if (!this.processedImageData) return;

    const width = this.processedImageData.width;
    const height = this.processedImageData.height;
    const data = this.processedImageData.data;
    const grayscale = new Uint8Array(width * height);
    
    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      grayscale[i / 4] = gray;
    }
    
    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    // Apply Sobel operator
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            gx += grayscale[idx] * sobelX[kernelIdx];
            gy += grayscale[idx] * sobelY[kernelIdx];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const pixelIdx = (y * width + x) * 4;
        data[pixelIdx] = data[pixelIdx + 1] = data[pixelIdx + 2] = Math.min(255, magnitude);
      }
    }
    
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Apply speckle reduction filter (Lee filter)
   * Common in ultrasound to reduce noise while preserving edges
   * @param {number} windowSize - Filter window size (3, 5, or 7)
   */
  applySpeckleReduction(windowSize = 5) {
    if (!this.processedImageData) return;

    const width = this.processedImageData.width;
    const height = this.processedImageData.height;
    const data = this.processedImageData.data;
    const halfWindow = Math.floor(windowSize / 2);
    const output = new Uint8ClampedArray(data);
    
    for (let y = halfWindow; y < height - halfWindow; y++) {
      for (let x = halfWindow; x < width - halfWindow; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let count = 0;
          let sumSquared = 0;
          
          // Calculate mean and variance in window
          for (let wy = -halfWindow; wy <= halfWindow; wy++) {
            for (let wx = -halfWindow; wx <= halfWindow; wx++) {
              const idx = ((y + wy) * width + (x + wx)) * 4 + c;
              const value = data[idx];
              sum += value;
              sumSquared += value * value;
              count++;
            }
          }
          
          const mean = sum / count;
          const variance = (sumSquared / count) - (mean * mean);
          const centerIdx = (y * width + x) * 4 + c;
          const centerValue = data[centerIdx];
          
          // Lee filter formula
          if (variance > 0) {
            const k = variance / (variance + mean * mean * 0.25);
            output[centerIdx] = mean + k * (centerValue - mean);
          } else {
            output[centerIdx] = mean;
          }
        }
      }
    }
    
    this.processedImageData.data.set(output);
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Apply median filter for noise reduction
   * @param {number} kernelSize - Filter kernel size (3, 5, or 7)
   */
  applyMedianFilter(kernelSize = 3) {
    if (!this.processedImageData) return;

    const width = this.processedImageData.width;
    const height = this.processedImageData.height;
    const data = this.processedImageData.data;
    const halfKernel = Math.floor(kernelSize / 2);
    const output = new Uint8ClampedArray(data);
    
    for (let y = halfKernel; y < height - halfKernel; y++) {
      for (let x = halfKernel; x < width - halfKernel; x++) {
        for (let c = 0; c < 3; c++) {
          const values = [];
          
          for (let ky = -halfKernel; ky <= halfKernel; ky++) {
            for (let kx = -halfKernel; kx <= halfKernel; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              values.push(data[idx]);
            }
          }
          
          values.sort((a, b) => a - b);
          const median = values[Math.floor(values.length / 2)];
          const centerIdx = (y * width + x) * 4 + c;
          output[centerIdx] = median;
        }
      }
    }
    
    this.processedImageData.data.set(output);
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Sharpen image using unsharp mask
   * @param {number} amount - Sharpening amount (0-2, 1 = standard)
   */
  applySharpen(amount = 1.0) {
    if (!this.processedImageData) return;

    const width = this.processedImageData.width;
    const height = this.processedImageData.height;
    const data = this.processedImageData.data;
    
    // Unsharp mask kernel
    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];
    
    const output = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let k = 0;
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += data[idx] * kernel[k];
              k++;
            }
          }
          
          const centerIdx = (y * width + x) * 4 + c;
          output[centerIdx] = Math.max(0, Math.min(255, sum));
        }
      }
    }
    
    this.processedImageData.data.set(output);
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Convert to optimized grayscale for ultrasound viewing
   */
  convertToGrayscale() {
    if (!this.processedImageData) return;

    const data = this.processedImageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Use luminance formula optimized for medical imaging
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Apply false color mapping for better visualization
   * @param {string} colorMap - Color map type ('hot', 'cool', 'rainbow')
   */
  applyColorMap(colorMap = 'hot') {
    if (!this.processedImageData) return;

    const data = this.processedImageData.data;
    
    const colorMaps = {
      hot: (intensity) => ({
        r: Math.min(255, intensity * 3),
        g: Math.max(0, Math.min(255, intensity * 3 - 255)),
        b: Math.max(0, Math.min(255, intensity * 3 - 510))
      }),
      cool: (intensity) => ({
        r: intensity,
        g: 255 - intensity,
        b: 255
      }),
      rainbow: (intensity) => {
        const hue = intensity / 255 * 300;
        return this.hslToRgb(hue, 1, 0.5);
      }
    };
    
    const mapFunc = colorMaps[colorMap] || colorMaps.hot;
    
    for (let i = 0; i < data.length; i += 4) {
      const intensity = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
      const color = mapFunc(intensity);
      data[i] = color.r;
      data[i + 1] = color.g;
      data[i + 2] = color.b;
    }
    
    this.ctx.putImageData(this.processedImageData, 0, 0);
  }

  /**
   * Helper: Convert HSL to RGB
   */
  hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  /**
   * Measure distance between two points (in pixels)
   * @param {object} point1 - {x, y}
   * @param {object} point2 - {x, y}
   * @returns {number} Distance in pixels
   */
  measureDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.measurements.push({
      type: 'distance',
      points: [point1, point2],
      value: distance,
      timestamp: new Date().toISOString()
    });
    
    return distance;
  }

  /**
   * Get current canvas as data URL
   * @param {string} format - Image format ('png', 'jpeg')
   * @param {number} quality - JPEG quality (0-1)
   * @returns {string} Data URL
   */
  getDataURL(format = 'png', quality = 0.95) {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * Export current image as blob for download
   * @param {string} format - Image format ('png', 'jpeg')
   * @returns {Promise<Blob>}
   */
  async exportBlob(format = 'png') {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        `image/${format}`,
        0.95
      );
    });
  }

  /**
   * Get image statistics
   * @returns {object} Statistics including mean, min, max, stddev
   */
  getStatistics() {
    if (!this.processedImageData) return null;

    const data = this.processedImageData.data;
    let min = 255, max = 0, sum = 0, sumSquared = 0;
    const count = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      min = Math.min(min, brightness);
      max = Math.max(max, brightness);
      sum += brightness;
      sumSquared += brightness * brightness;
    }
    
    const mean = sum / count;
    const variance = (sumSquared / count) - (mean * mean);
    const stddev = Math.sqrt(variance);
    
    return {
      min,
      max,
      mean: Math.round(mean),
      stddev: Math.round(stddev),
      range: max - min,
      pixelCount: count
    };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.UltrasoundImageProcessor = UltrasoundImageProcessor;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UltrasoundImageProcessor;
}
