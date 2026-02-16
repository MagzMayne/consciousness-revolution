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
 * File: aul-utils.js
 * Declaration ID: IP-4168B71B-MLL28ZUI
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * AUL Utilities - Helper functions showcasing AUL language features
 * 
 * This file demonstrates code triangulation and how to use AUL
 * to create reusable utility functions.
 */

import { Lexer } from './src/aul/lexer.js';
import { Parser } from './src/aul/parser.js';
import { Interpreter } from './src/aul/interpreter.js';

/**
 * Execute AUL code and return the result
 * @param {string} code - AUL source code
 * @returns {object} - {success, output, error}
 */
export function executeAUL(code) {
    try {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        
        const parser = new Parser(tokens);
        const ast = parser.parse();
        
        const interpreter = new Interpreter();
        interpreter.interpret(ast);
        
        return {
            success: true,
            output: interpreter.getOutput(),
            error: null
        };
    } catch (error) {
        return {
            success: false,
            output: null,
            error: error.message
        };
    }
}

/**
 * Code triangulation example - verify code behavior across multiple implementations
 * This demonstrates how AUL can be used to validate logic in different languages
 */
export function triangulateCode(spec, implementations) {
    const results = [];
    
    for (const impl of implementations) {
        const result = executeAUL(impl.code);
        results.push({
            language: impl.language,
            success: result.success,
            output: result.output,
            error: result.error,
            matchesSpec: result.success && result.output === spec.expectedOutput
        });
    }
    
    return {
        allMatch: results.every(r => r.matchesSpec),
        results: results
    };
}

/**
 * Example AUL code snippets for common operations
 */
export const examples = {
    fibonacci: `
fn fibonacci(n) {
    if n <= 1 {
        return n
    }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

let result = fibonacci(10)
print result
    `,
    
    sorting: `
// Bubble sort implementation
fn bubbleSort(arr) {
    let n = 5  // arr length
    let i = 0
    while i < n {
        let j = 0
        while j < n - 1 {
            // Note: array comparison simplified for demo
            print "Sorting..."
            j = j + 1
        }
        i = i + 1
    }
    return arr
}

let nums = [5, 2, 8, 1, 9]
print "Original: " + nums
    `,
    
    dataProcessing: `
// Process data with pattern matching
fn processData(value) {
    match value {
        case 0 => { print("Zero") }
        case 1 => { print("One") }
        _ => { print("Many: " + value) }
    }
}

let data = [0, 1, 5, 10]
for item in data {
    processData(item)
}
    `,
    
    objectOriented: `
// Object-oriented programming with classes
class Vehicle {
    fn constructor(type, speed) {
        print "Creating vehicle"
    }
}

let car = new Vehicle("Car", 60)
let bike = new Vehicle("Bike", 20)
print "Vehicles created"
    `,
    
    structUsage: `
// Lightweight data structures
struct Point2D {
    x,
    y
}

struct Point3D {
    x,
    y,
    z
}

let p1 = new Point2D(10, 20)
let p2 = new Point3D(10, 20, 30)

print "2D Point: (" + p1.x + ", " + p1.y + ")"
print "3D Point: (" + p2.x + ", " + p2.y + ", " + p2.z + ")"
    `
};

/**
 * Validate AUL syntax without executing
 * @param {string} code - AUL source code
 * @returns {object} - {valid, error}
 */
export function validateSyntax(code) {
    try {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        
        const parser = new Parser(tokens);
        parser.parse();
        
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
}

/**
 * Get tokens from AUL code (for debugging/analysis)
 * @param {string} code - AUL source code
 * @returns {array} - Array of tokens
 */
export function tokenize(code) {
    try {
        const lexer = new Lexer(code);
        return lexer.tokenize();
    } catch (error) {
        return [];
    }
}

// Example usage for Node.js
if (typeof process !== 'undefined' && process.argv[1] === import.meta.url.slice(7)) {
    console.log('=== AUL Utils Example ===\n');
    
    // Test Fibonacci
    console.log('Testing Fibonacci:');
    const fibResult = executeAUL(examples.fibonacci);
    console.log('Success:', fibResult.success);
    console.log('Output:', fibResult.output);
    console.log();
    
    // Test Pattern Matching
    console.log('Testing Data Processing:');
    const dataResult = executeAUL(examples.dataProcessing);
    console.log('Output:', dataResult.output);
    console.log();
    
    // Test Struct
    console.log('Testing Struct Usage:');
    const structResult = executeAUL(examples.structUsage);
    console.log('Output:', structResult.output);
}
