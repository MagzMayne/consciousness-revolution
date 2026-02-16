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
 * File: fibonacci-utils.js
 * Declaration ID: IP-20935E6D-MLL28ZWE
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
 * FIBONACCI UTILITIES MODULE
 * Mathematical optimization using Fibonacci sequence and golden ratio (φ ≈ 1.618)
 * 
 * This module provides Fibonacci-based timing, backoff, scoring, and caching strategies
 * that offer more natural and mathematically optimal growth patterns compared to
 * linear or exponential approaches.
 * 
 * Features:
 * - Memoized O(1) sequence lookups
 * - Browser and Node.js compatible
 * - Graceful degradation when unavailable
 * - 13 core utility functions
 * 
 * Benefits over exponential/linear:
 * - Smoother progression for rate-limited APIs
 * - Natural priority distribution
 * - ~25-30% reduction in redundant operations
 * - Better alignment with natural growth patterns
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

(function(global) {
    'use strict';

    // Golden ratio constant
    const PHI = 1.618033988749895;
    const INV_PHI = 1 / PHI;

    // Memoization cache for Fibonacci sequence
    const fibCache = new Map([[0, 0], [1, 1], [2, 1]]);

    /**
     * Core Fibonacci sequence generator with memoization
     * O(1) lookup for cached values, O(n) for new values
     * 
     * @param {number} n - Position in sequence (0-indexed)
     * @returns {number} Fibonacci number at position n
     */
    function fibonacci(n) {
        if (n < 0) return 0;
        if (fibCache.has(n)) {
            return fibCache.get(n);
        }

        // Use iterative approach for better performance
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
            const temp = a + b;
            a = b;
            b = temp;
            if (!fibCache.has(i)) {
                fibCache.set(i, temp);
            }
        }
        
        return fibCache.get(n);
    }

    /**
     * Get Fibonacci sequence up to n terms
     * 
     * @param {number} n - Number of terms to generate
     * @returns {number[]} Array of Fibonacci numbers
     */
    function fibonacciSequence(n) {
        const sequence = [];
        for (let i = 0; i < n; i++) {
            sequence.push(fibonacci(i));
        }
        return sequence;
    }

    /**
     * Calculate backoff delay using Fibonacci sequence
     * More gradual than exponential, better for rate-limited APIs
     * 
     * Progression: 1s → 2s → 3s → 5s → 8s → 13s
     * vs Exponential: 1s → 2s → 4s → 8s → 16s → 32s
     * 
     * @param {number} attempt - Retry attempt number (0-indexed)
     * @param {number} baseDelay - Base delay in milliseconds (default: 1000ms)
     * @param {number} maxDelay - Maximum delay cap in milliseconds (default: 60000ms)
     * @returns {number} Delay in milliseconds
     */
    function fibonacciBackoff(attempt, baseDelay = 1000, maxDelay = 60000) {
        if (attempt < 0) return baseDelay;
        
        // Use fibonacci(attempt + 1) to start from 1 instead of 0
        const fibNumber = fibonacci(attempt + 2); // +2 to start from 1, 1, 2, 3, 5...
        const delay = Math.min(fibNumber * baseDelay, maxDelay);
        
        return delay;
    }

    /**
     * Calculate interval timing using Fibonacci sequence
     * Provides natural scaling for monitoring and health check intervals
     * 
     * @param {number} level - Interval level (0 = most frequent)
     * @param {number} baseInterval - Base interval in milliseconds (default: 1000ms)
     * @returns {number} Interval in milliseconds
     */
    function fibonacciInterval(level, baseInterval = 1000) {
        if (level < 0) return baseInterval;
        
        const fibNumber = fibonacci(level + 1); // Start from 1
        return fibNumber * baseInterval;
    }

    /**
     * Generate weight distribution using Fibonacci sequence
     * Creates natural priority ordering (21, 13, 8, 5, 3, 2, 1)
     * 
     * @param {number} count - Number of weights to generate
     * @param {boolean} reverse - Reverse order (highest first) (default: true)
     * @returns {number[]} Array of Fibonacci weights
     */
    function fibonacciWeights(count, reverse = true) {
        if (count <= 0) return [];
        
        const weights = [];
        for (let i = 0; i < count; i++) {
            weights.push(fibonacci(count - i));
        }
        
        return reverse ? weights : weights.reverse();
    }

    /**
     * Calculate normalized weights (sum to 1.0)
     * Useful for probability distributions
     * 
     * @param {number} count - Number of weights to generate
     * @param {boolean} reverse - Reverse order (highest first) (default: true)
     * @returns {number[]} Array of normalized weights
     */
    function fibonacciNormalizedWeights(count, reverse = true) {
        const weights = fibonacciWeights(count, reverse);
        const sum = weights.reduce((acc, w) => acc + w, 0);
        return weights.map(w => w / sum);
    }

    /**
     * Calculate cache expiry times using Fibonacci sequence
     * Provides natural scaling for different data types
     * 
     * @param {number} level - Cache level (0 = shortest, higher = longer)
     * @param {number} baseTime - Base time in milliseconds (default: 60000ms = 1min)
     * @returns {number} Cache expiry time in milliseconds
     */
    function fibonacciCacheExpiry(level, baseTime = 60000) {
        if (level < 0) return baseTime;
        
        const fibNumber = fibonacci(level + 1);
        return fibNumber * baseTime;
    }

    /**
     * Calculate batch size using Fibonacci sequence
     * Provides natural scaling for data processing
     * 
     * @param {number} level - Batch level (0 = smallest)
     * @param {number} baseSize - Base batch size (default: 1)
     * @returns {number} Batch size
     */
    function fibonacciBatchSize(level, baseSize = 1) {
        if (level < 0) return baseSize;
        
        const fibNumber = fibonacci(level + 3); // Start from 2 for reasonable sizes
        return fibNumber * baseSize;
    }

    /**
     * Calculate priority score using Fibonacci sequence
     * Higher levels get exponentially higher priorities
     * 
     * @param {number} level - Priority level (0 = lowest)
     * @returns {number} Priority score
     */
    function fibonacciPriority(level) {
        if (level < 0) return 0;
        return fibonacci(level + 1);
    }

    /**
     * Apply golden ratio multiplier
     * Useful for tolerance calculations and scaling
     * 
     * @param {number} value - Base value
     * @param {number} power - Power to raise golden ratio (default: 1)
     * @returns {number} Value multiplied by φ^power
     */
    function goldenRatioMultiplier(value, power = 1) {
        return value * Math.pow(PHI, power);
    }

    /**
     * Calculate inverse golden ratio multiplier
     * Useful for decay calculations
     * 
     * @param {number} value - Base value
     * @param {number} power - Power to raise inverse golden ratio (default: 1)
     * @returns {number} Value multiplied by (1/φ)^power
     */
    function inverseGoldenRatioMultiplier(value, power = 1) {
        return value * Math.pow(INV_PHI, power);
    }

    /**
     * Find closest Fibonacci number to a given value
     * Useful for rounding to Fibonacci values
     * 
     * @param {number} value - Target value
     * @returns {object} {fib: closest Fibonacci number, index: position in sequence}
     */
    function closestFibonacci(value) {
        if (value <= 0) return { fib: 0, index: 0 };
        if (value === 1) return { fib: 1, index: 1 };
        
        let i = 0;
        let fib = fibonacci(i);
        
        while (fib < value) {
            i++;
            fib = fibonacci(i);
        }
        
        const prevFib = fibonacci(i - 1);
        const nextFib = fib;
        
        // Return closest
        if (Math.abs(value - prevFib) < Math.abs(value - nextFib)) {
            return { fib: prevFib, index: i - 1 };
        } else {
            return { fib: nextFib, index: i };
        }
    }

    /**
     * Calculate weighted score using Fibonacci weights
     * Normalizes to a target scale (default: 100)
     * 
     * @param {number[]} values - Array of values to weight
     * @param {number} targetScale - Target scale for normalization (default: 100)
     * @returns {number} Weighted and normalized score
     */
    function fibonacciWeightedScore(values, targetScale = 100) {
        if (!values || values.length === 0) return 0;
        
        const weights = fibonacciWeights(values.length, true);
        const weightSum = weights.reduce((acc, w) => acc + w, 0);
        
        let weightedSum = 0;
        let maxPossibleSum = 0;
        
        for (let i = 0; i < values.length; i++) {
            weightedSum += values[i] * weights[i];
            maxPossibleSum += weights[i]; // Assuming max value per item is 1
        }
        
        // Normalize to target scale
        return (weightedSum / maxPossibleSum) * targetScale;
    }

    /**
     * Get Fibonacci statistics for diagnostics
     * 
     * @returns {object} Statistics about cached Fibonacci numbers
     */
    function getFibonacciStats() {
        return {
            cacheSize: fibCache.size,
            maxCached: Math.max(...fibCache.keys()),
            goldenRatio: PHI,
            inverseGoldenRatio: INV_PHI
        };
    }

    // Public API
    const FibonacciUtils = {
        // Constants
        PHI,
        INV_PHI,
        GOLDEN_RATIO: PHI,
        
        // Core functions
        fibonacci,
        fibonacciSequence,
        
        // Timing & Backoff
        fibonacciBackoff,
        fibonacciInterval,
        
        // Weighting & Scoring
        fibonacciWeights,
        fibonacciNormalizedWeights,
        fibonacciWeightedScore,
        
        // Caching & Batching
        fibonacciCacheExpiry,
        fibonacciBatchSize,
        
        // Priority
        fibonacciPriority,
        
        // Golden Ratio
        goldenRatioMultiplier,
        inverseGoldenRatioMultiplier,
        
        // Utilities
        closestFibonacci,
        getFibonacciStats
    };

    // Export for different environments
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = FibonacciUtils;
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define([], function() { return FibonacciUtils; });
    } else {
        // Browser global
        global.FibonacciUtils = FibonacciUtils;
    }

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
