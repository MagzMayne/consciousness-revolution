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
 * File: runtime.js
 * Declaration ID: IP-1F9544E1-MLL28ZW3
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * AI Universal Language (AUL) - Main Runtime
 * Combines lexer, parser, and interpreter to execute AUL code
 * 
 * @module aul/runtime
 */

import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';

export class AULRuntime {
    constructor() {
        this.interpreter = new Interpreter();
    }

    execute(sourceCode) {
        try {
            // Step 1: Lexical Analysis
            const lexer = new Lexer(sourceCode);
            const tokens = lexer.tokenize();
            
            // Step 2: Parsing
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            // Step 3: Interpretation
            const result = this.interpreter.interpret(ast);
            
            return {
                success: true,
                output: this.interpreter.getOutput(),
                result: result,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                output: this.interpreter.getOutput(),
                result: null,
                error: error.message
            };
        } finally {
            this.interpreter.clearOutput();
        }
    }

    reset() {
        this.interpreter = new Interpreter();
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.AULRuntime = AULRuntime;
}

export default AULRuntime;
