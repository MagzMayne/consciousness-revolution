#!/usr/bin/env python3
# ════════════════════════════════════════════════════════════════════════════════
# © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
# ════════════════════════════════════════════════════════════════════════════════
#
# PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
#
# This file contains proprietary intellectual property of Ryan Barbrick.
# All concepts, algorithms, implementations, and innovations are protected by
# copyright law and are considered trade secrets.
#
# PROVISIONAL PATENT NOTICE:
# The ideas, methods, systems, and code contained in this file are subject to
# provisional patent protection. Unauthorized use, reproduction, modification,
# or distribution is strictly prohibited.
#
# LEGAL WARNING:
# Unauthorized use of this intellectual property may result in:
# - Civil litigation for copyright infringement
# - Claims for actual and statutory damages ($750-$150,000 per work)
# - Injunctive relief and cease & desist orders
# - Criminal prosecution for willful infringement
# - Recovery of attorney fees and legal costs
#
# CREATOR INFORMATION:
# Author: Ryan Barbrick
# Business: Barbrick Design
# Contact: BarbrickDesign@gmail.com
# AI Assistant: Merlin AI
# Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
#
# PATENT DECLARATION:
# File: ultrasound-analysis.py
# Declaration ID: IP-5124C38F-MLL2902T
# Date: 2026-02-13
# Innovation Type: Software Implementation, Algorithm, System Design
#
# For licensing inquiries, contact: BarbrickDesign@gmail.com
# ════════════════════════════════════════════════════════════════════════════════

#!/usr/bin/env python3
"""
Ultrasound Image Analysis Script
 
Advanced Python-based analysis for ultrasound images using OpenCV and NumPy.
This script is called by the JavaScript frontend to perform deep image analysis
that complements the real-time browser-based TensorFlow.js analysis.

MEDICAL DISCLAIMER:
This is NOT a diagnostic tool. For educational purposes only.
All findings must be reviewed by qualified medical professionals.

© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
"""

import sys
import json
import base64
import io
import argparse
from typing import Dict, List, Any, Tuple
import numpy as np

# Optional imports - gracefully degrade if not available
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("WARNING: PIL not available. Image processing limited.", file=sys.stderr)

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    print("WARNING: OpenCV not available. Advanced analysis limited.", file=sys.stderr)


class UltrasoundAnalyzer:
    """Advanced ultrasound image analysis using computer vision techniques."""
    
    def __init__(self):
        self.image = None
        self.gray_image = None
        self.original_shape = None
        
    def load_image_from_base64(self, base64_data: str) -> bool:
        """Load image from base64 encoded data."""
        try:
            # Remove data URL prefix if present
            if ',' in base64_data:
                base64_data = base64_data.split(',', 1)[1]
            
            # Decode base64
            img_data = base64.b64decode(base64_data)
            
            if PIL_AVAILABLE:
                img = Image.open(io.BytesIO(img_data))
                self.image = np.array(img)
                
                # Convert to grayscale if needed
                if len(self.image.shape) == 3:
                    if self.image.shape[2] == 4:  # RGBA
                        self.image = self.image[:, :, :3]
                    # Convert RGB to grayscale
                    self.gray_image = np.dot(self.image[..., :3], [0.299, 0.587, 0.114])
                else:
                    self.gray_image = self.image
                    
                self.original_shape = self.image.shape
                return True
            else:
                # Fallback without PIL
                return False
                
        except Exception as e:
            print(f"ERROR: Failed to load image: {e}", file=sys.stderr)
            return False
    
    def analyze_texture(self) -> Dict[str, Any]:
        """Analyze texture patterns in the ultrasound image."""
        if self.gray_image is None:
            return {"error": "No image loaded"}
        
        results = {
            "texture_uniformity": 0.0,
            "speckle_pattern": "unknown",
            "edge_density": 0.0,
            "homogeneous_regions": []
        }
        
        try:
            # Calculate texture uniformity using standard deviation
            std_dev = np.std(self.gray_image)
            mean_val = np.mean(self.gray_image)
            results["texture_uniformity"] = float(std_dev / (mean_val + 1e-6))
            
            # Classify speckle pattern
            if results["texture_uniformity"] < 0.3:
                results["speckle_pattern"] = "uniform"
            elif results["texture_uniformity"] < 0.6:
                results["speckle_pattern"] = "moderate"
            else:
                results["speckle_pattern"] = "high_variance"
            
            # Calculate edge density (simplified without OpenCV)
            if len(self.gray_image.shape) == 2:
                # Use simple gradient calculation
                gy, gx = np.gradient(self.gray_image)
                edges = np.sqrt(gx**2 + gy**2)
                results["edge_density"] = float(np.mean(edges > 20))
            
        except Exception as e:
            results["error"] = str(e)
        
        return results
    
    def detect_regions_of_interest(self) -> List[Dict[str, Any]]:
        """Detect potential regions of interest in the ultrasound image."""
        if self.gray_image is None:
            return []
        
        regions = []
        
        try:
            # Calculate intensity statistics
            mean_intensity = np.mean(self.gray_image)
            std_intensity = np.std(self.gray_image)
            
            # Find regions significantly different from mean
            # Hypoechoic regions (darker than average)
            hypoechoic_mask = self.gray_image < (mean_intensity - std_intensity)
            hypoechoic_percentage = float(np.sum(hypoechoic_mask) / self.gray_image.size * 100)
            
            if hypoechoic_percentage > 5:  # More than 5% of image
                regions.append({
                    "type": "hypoechoic",
                    "percentage": hypoechoic_percentage,
                    "intensity_range": [float(np.min(self.gray_image[hypoechoic_mask])), 
                                       float(np.max(self.gray_image[hypoechoic_mask]))],
                    "description": "Dark areas that may indicate fluid-filled structures or masses",
                    "clinical_significance": "May warrant further investigation"
                })
            
            # Hyperechoic regions (brighter than average)
            hyperechoic_mask = self.gray_image > (mean_intensity + std_intensity)
            hyperechoic_percentage = float(np.sum(hyperechoic_mask) / self.gray_image.size * 100)
            
            if hyperechoic_percentage > 5:
                regions.append({
                    "type": "hyperechoic",
                    "percentage": hyperechoic_percentage,
                    "intensity_range": [float(np.min(self.gray_image[hyperechoic_mask])), 
                                       float(np.max(self.gray_image[hyperechoic_mask]))],
                    "description": "Bright areas that may indicate calcifications or dense tissue",
                    "clinical_significance": "Common in benign findings but should be evaluated"
                })
            
        except Exception as e:
            print(f"ERROR in region detection: {e}", file=sys.stderr)
        
        return regions
    
    def calculate_quality_metrics(self) -> Dict[str, Any]:
        """Calculate image quality metrics."""
        if self.gray_image is None:
            return {"error": "No image loaded"}
        
        metrics = {
            "resolution": list(self.gray_image.shape),
            "dynamic_range": 0.0,
            "snr_estimate": 0.0,
            "quality_score": 0.0
        }
        
        try:
            # Dynamic range
            min_val = float(np.min(self.gray_image))
            max_val = float(np.max(self.gray_image))
            metrics["dynamic_range"] = max_val - min_val
            
            # Estimate SNR (Signal-to-Noise Ratio)
            signal = np.mean(self.gray_image)
            noise = np.std(self.gray_image)
            metrics["snr_estimate"] = float(signal / (noise + 1e-6))
            
            # Quality score (0-100)
            # Based on resolution, dynamic range, and SNR
            res_score = min(100, (self.gray_image.size / 100000) * 50)  # Reward higher resolution
            dr_score = min(50, (metrics["dynamic_range"] / 255) * 50)  # Full dynamic range
            snr_score = min(30, metrics["snr_estimate"])  # Good SNR
            
            metrics["quality_score"] = float(res_score + dr_score + snr_score)
            
        except Exception as e:
            metrics["error"] = str(e)
        
        return metrics
    
    def detect_anomalies(self, organ_type: str = None) -> List[Dict[str, Any]]:
        """Detect potential anomalies based on pattern recognition."""
        if self.gray_image is None:
            return []
        
        anomalies = []
        
        try:
            # Calculate local statistics using sliding window
            window_size = 32
            h, w = self.gray_image.shape[:2]
            
            # Sample analysis (full sliding window would be too slow)
            sample_points = [
                (h//4, w//4), (h//4, 3*w//4),
                (h//2, w//2),
                (3*h//4, w//4), (3*h//4, 3*w//4)
            ]
            
            for y, x in sample_points:
                if y < window_size or x < window_size:
                    continue
                if y > h - window_size or x > w - window_size:
                    continue
                
                # Extract window
                window = self.gray_image[y-window_size:y+window_size, 
                                        x-window_size:x+window_size]
                
                # Analyze window
                window_std = np.std(window)
                window_mean = np.mean(window)
                
                # Compare to global statistics
                global_mean = np.mean(self.gray_image)
                global_std = np.std(self.gray_image)
                
                # Detect unusual patterns
                if window_std > global_std * 1.5:
                    anomalies.append({
                        "location": {"x": int(x), "y": int(y)},
                        "type": "high_variance",
                        "description": "Region with high texture variation",
                        "confidence": min(1.0, (window_std - global_std) / global_std),
                        "recommendation": "Review this region for structural changes"
                    })
                
                if abs(window_mean - global_mean) > global_std * 2:
                    anomaly_type = "hyperechoic" if window_mean > global_mean else "hypoechoic"
                    anomalies.append({
                        "location": {"x": int(x), "y": int(y)},
                        "type": anomaly_type,
                        "description": f"Region with unusual echogenicity",
                        "confidence": min(1.0, abs(window_mean - global_mean) / (global_std * 2)),
                        "recommendation": "Consider medical evaluation of this region"
                    })
            
        except Exception as e:
            print(f"ERROR in anomaly detection: {e}", file=sys.stderr)
        
        return anomalies
    
    def generate_medical_recommendations(self, analysis_data: Dict[str, Any]) -> List[str]:
        """Generate medical recommendations based on analysis results."""
        recommendations = [
            "⚕️ IMPORTANT: This is an educational analysis only, not a medical diagnosis.",
            "🏥 All findings should be reviewed by a qualified healthcare professional."
        ]
        
        # Quality-based recommendations
        if "quality_metrics" in analysis_data:
            quality_score = analysis_data["quality_metrics"].get("quality_score", 0)
            if quality_score < 30:
                recommendations.append("📸 Image quality is suboptimal. Consider adjusting probe position, gain settings, or contact gel.")
            elif quality_score < 60:
                recommendations.append("📸 Image quality is fair. Minor adjustments may improve clarity.")
        
        # Anomaly-based recommendations
        if "anomalies" in analysis_data and len(analysis_data["anomalies"]) > 0:
            high_confidence = [a for a in analysis_data["anomalies"] if a.get("confidence", 0) > 0.7]
            if len(high_confidence) > 0:
                recommendations.append(f"⚠️ Detected {len(high_confidence)} region(s) of interest that warrant professional evaluation.")
            
            if len(analysis_data["anomalies"]) > 5:
                recommendations.append("🔍 Multiple anomalies detected. Comprehensive medical imaging recommended.")
        
        # Region-based recommendations
        if "regions_of_interest" in analysis_data:
            for region in analysis_data["regions_of_interest"]:
                if region["percentage"] > 20:
                    recommendations.append(f"📊 Significant {region['type']} region detected ({region['percentage']:.1f}% of image). {region['clinical_significance']}")
        
        # General recommendations
        recommendations.extend([
            "📅 Keep a log of all images and symptoms for your healthcare provider.",
            "🔬 If symptoms persist or worsen, seek immediate medical attention.",
            "💾 Save this analysis data to share with your doctor."
        ])
        
        return recommendations


def analyze_ultrasound_image(image_data: str, organ_type: str = None, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Main analysis function.
    
    Args:
        image_data: Base64 encoded image data
        organ_type: Type of organ being scanned (e.g., 'breast', 'liver', 'kidney')
        options: Additional analysis options
        
    Returns:
        Dictionary containing analysis results
    """
    analyzer = UltrasoundAnalyzer()
    
    # Load image
    if not analyzer.load_image_from_base64(image_data):
        return {
            "success": False,
            "error": "Failed to load image",
            "timestamp": None,
            "analysis": {}
        }
    
    # Perform analysis
    analysis_results = {
        "success": True,
        "timestamp": None,  # Will be set by JavaScript
        "organ_type": organ_type,
        "quality_metrics": analyzer.calculate_quality_metrics(),
        "texture_analysis": analyzer.analyze_texture(),
        "regions_of_interest": analyzer.detect_regions_of_interest(),
        "anomalies": analyzer.detect_anomalies(organ_type),
        "recommendations": []
    }
    
    # Generate recommendations
    analysis_results["recommendations"] = analyzer.generate_medical_recommendations(analysis_results)
    
    return analysis_results


def main():
    """Command-line interface for the analysis script."""
    parser = argparse.ArgumentParser(description='Ultrasound Image Analysis')
    parser.add_argument('--input', '-i', help='Input image file path')
    parser.add_argument('--base64', '-b', help='Base64 encoded image data')
    parser.add_argument('--organ', '-o', help='Organ type')
    parser.add_argument('--output', '-O', help='Output JSON file path')
    
    args = parser.parse_args()
    
    # Read input
    if args.base64:
        image_data = args.base64
    elif args.input:
        with open(args.input, 'rb') as f:
            image_bytes = f.read()
            image_data = base64.b64encode(image_bytes).decode('utf-8')
    else:
        # Read from stdin (for pipe integration)
        input_json = json.loads(sys.stdin.read())
        image_data = input_json.get('imageData', '')
        args.organ = input_json.get('organType', args.organ)
    
    # Perform analysis
    results = analyze_ultrasound_image(image_data, args.organ)
    
    # Output results
    output_json = json.dumps(results, indent=2)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output_json)
        print(f"Analysis saved to {args.output}", file=sys.stderr)
    else:
        print(output_json)


if __name__ == '__main__':
    main()
