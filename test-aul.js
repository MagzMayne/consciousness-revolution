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
 * File: test-aul.js
 * Declaration ID: IP-7E01E1DA-MLL28ZWI
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * AI Universal Language (AUL) - Test Suite
 * Comprehensive tests for the AUL interpreter
 */

import { Lexer, TokenType } from './src/aul/lexer.js';
import { Parser } from './src/aul/parser.js';
import { Interpreter } from './src/aul/interpreter.js';

class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('\n🧪 Running AUL Test Suite\n' + '='.repeat(50));
        
        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                console.log(`✓ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.log(`✗ ${test.name}`);
                console.log(`  Error: ${error.message}`);
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log(`Results: ${this.passed} passed, ${this.failed} failed`);
        console.log('='.repeat(50) + '\n');
        
        return this.failed === 0;
    }
}

function executeAUL(code) {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter();
    const result = interpreter.interpret(ast);
    return {
        result,
        output: interpreter.getOutput()
    };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

// Test Suite
const runner = new TestRunner();

// === Lexer Tests ===
runner.test('Lexer: Numbers', () => {
    const lexer = new Lexer('42 3.14');
    const tokens = lexer.tokenize();
    assertEqual(tokens[0].type, TokenType.NUMBER);
    assertEqual(tokens[0].value, 42);
    assertEqual(tokens[1].type, TokenType.NUMBER);
    assertEqual(tokens[1].value, 3.14);
});

runner.test('Lexer: Strings', () => {
    const lexer = new Lexer('"hello" \'world\'');
    const tokens = lexer.tokenize();
    assertEqual(tokens[0].type, TokenType.STRING);
    assertEqual(tokens[0].value, 'hello');
    assertEqual(tokens[1].type, TokenType.STRING);
    assertEqual(tokens[1].value, 'world');
});

runner.test('Lexer: Keywords', () => {
    const lexer = new Lexer('let fn if else return');
    const tokens = lexer.tokenize();
    assertEqual(tokens[0].type, TokenType.LET);
    assertEqual(tokens[1].type, TokenType.FN);
    assertEqual(tokens[2].type, TokenType.IF);
    assertEqual(tokens[3].type, TokenType.ELSE);
    assertEqual(tokens[4].type, TokenType.RETURN);
});

runner.test('Lexer: Operators', () => {
    const lexer = new Lexer('+ - * / == != < > <= >= && ||');
    const tokens = lexer.tokenize();
    assertEqual(tokens[0].type, TokenType.PLUS);
    assertEqual(tokens[1].type, TokenType.MINUS);
    assertEqual(tokens[2].type, TokenType.STAR);
    assertEqual(tokens[3].type, TokenType.SLASH);
    assertEqual(tokens[4].type, TokenType.DOUBLE_EQUAL);
    assertEqual(tokens[5].type, TokenType.NOT_EQUAL);
});

// === Parser Tests ===
runner.test('Parser: Number literal', () => {
    const lexer = new Lexer('42');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    assertEqual(ast.type, 'Program');
    assertEqual(ast.statements[0].type, 'NumberLiteral');
    assertEqual(ast.statements[0].value, 42);
});

runner.test('Parser: Binary operation', () => {
    const lexer = new Lexer('2 + 3');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const expr = ast.statements[0];
    assertEqual(expr.type, 'BinaryOp');
    assertEqual(expr.operator, '+');
    assertEqual(expr.left.value, 2);
    assertEqual(expr.right.value, 3);
});

runner.test('Parser: Variable declaration', () => {
    const lexer = new Lexer('let x = 10');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const stmt = ast.statements[0];
    assertEqual(stmt.type, 'VariableDeclaration');
    assertEqual(stmt.name, 'x');
    assertEqual(stmt.value.value, 10);
});

runner.test('Parser: Function declaration', () => {
    const lexer = new Lexer('fn add(a, b) { return a + b }');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const func = ast.statements[0];
    assertEqual(func.type, 'FunctionDeclaration');
    assertEqual(func.name, 'add');
    assertEqual(func.params.length, 2);
});

// === Interpreter Tests ===
runner.test('Interpreter: Basic arithmetic', () => {
    const { result } = executeAUL('2 + 3 * 4');
    assertEqual(result, 14);
});

runner.test('Interpreter: Variable declaration and access', () => {
    const { result } = executeAUL('let x = 42\nx');
    assertEqual(result, 42);
});

runner.test('Interpreter: Variable assignment', () => {
    const { result } = executeAUL('mut x = 10\nx = 20\nx');
    assertEqual(result, 20);
});

runner.test('Interpreter: Function declaration and call', () => {
    const code = `
        fn add(a, b) {
            return a + b
        }
        add(5, 7)
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 12);
});

runner.test('Interpreter: Print statement', () => {
    const { output } = executeAUL('print "Hello, World!"');
    assertEqual(output, 'Hello, World!');
});

runner.test('Interpreter: If statement (true branch)', () => {
    const code = `
        let x = 10
        if x > 5 {
            print "Greater"
        } else {
            print "Less"
        }
    `;
    const { output } = executeAUL(code);
    assertEqual(output, 'Greater');
});

runner.test('Interpreter: If statement (false branch)', () => {
    const code = `
        let x = 3
        if x > 5 {
            print "Greater"
        } else {
            print "Less"
        }
    `;
    const { output } = executeAUL(code);
    assertEqual(output, 'Less');
});

runner.test('Interpreter: Nested functions', () => {
    const code = `
        fn outer() {
            fn inner() {
                return 42
            }
            return inner()
        }
        outer()
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 42);
});

runner.test('Interpreter: Fibonacci', () => {
    const code = `
        fn fib(n) {
            if n <= 1 {
                return n
            }
            return fib(n - 1) + fib(n - 2)
        }
        fib(10)
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 55);
});

runner.test('Interpreter: Factorial', () => {
    const code = `
        fn factorial(n) {
            if n <= 1 {
                return 1
            }
            return n * factorial(n - 1)
        }
        factorial(5)
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 120);
});

runner.test('Interpreter: Array literal', () => {
    const code = '[1, 2, 3, 4, 5]';
    const { result } = executeAUL(code);
    assert(Array.isArray(result), 'Result should be an array');
    assertEqual(result.length, 5);
    assertEqual(result[0], 1);
    assertEqual(result[4], 5);
});

runner.test('Interpreter: Comparison operators', () => {
    const tests = [
        ['5 > 3', true],
        ['5 < 3', false],
        ['5 >= 5', true],
        ['5 <= 4', false],
        ['5 == 5', true],
        ['5 != 3', true]
    ];
    
    for (const [code, expected] of tests) {
        const { result } = executeAUL(code);
        assertEqual(result, expected, `Failed for: ${code}`);
    }
});

runner.test('Interpreter: Logical operators', () => {
    const { result: r1 } = executeAUL('true && true');
    assertEqual(r1, true);
    
    const { result: r2 } = executeAUL('true && false');
    assertEqual(r2, false);
    
    const { result: r3 } = executeAUL('false || true');
    assertEqual(r3, true);
});

runner.test('Interpreter: String concatenation', () => {
    const { result } = executeAUL('"Hello" + " " + "World"');
    assertEqual(result, 'Hello World');
});

runner.test('Interpreter: Closure', () => {
    const code = `
        fn makeCounter() {
            mut count = 0
            fn increment() {
                count = count + 1
                return count
            }
            return increment
        }
        let counter = makeCounter()
        counter()
        counter()
        counter()
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 3);
});

// === NEW FEATURE TESTS ===

runner.test('Interpreter: Pattern Matching - exact match', () => {
    const code = `
        fn test(x) {
            match x {
                case 1 => { return 100 }
                case 2 => { return 200 }
                _ => { return 999 }
            }
        }
        test(1)
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 100);
});

runner.test('Interpreter: Pattern Matching - default case', () => {
    const code = `
        fn test(x) {
            match x {
                case 1 => { return 100 }
                case 2 => { return 200 }
                _ => { return 999 }
            }
        }
        test(99)
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 999);
});

runner.test('Interpreter: Struct creation', () => {
    const code = `
        struct Point {
            x,
            y
        }
        let p = new Point(10, 20)
        p.x
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 10);
});

runner.test('Interpreter: Struct field access', () => {
    const code = `
        struct Point {
            x,
            y
        }
        let p = new Point(15, 25)
        p.y
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 25);
});

runner.test('Interpreter: Class with constructor', () => {
    const code = `
        class Animal {
            fn constructor(name) {
                print "Created: " + name
            }
        }
        new Animal("Dog")
    `;
    const { output } = executeAUL(code);
    assertEqual(output, 'Created: Dog');
});

runner.test('Interpreter: For loop iteration', () => {
    const code = `
        mut sum = 0
        let nums = [1, 2, 3, 4, 5]
        for n in nums {
            sum = sum + n
        }
        sum
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 15);
});

runner.test('Interpreter: While loop', () => {
    const code = `
        mut count = 0
        while count < 5 {
            count = count + 1
        }
        count
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 5);
});

runner.test('Interpreter: Async function declaration', () => {
    const code = `
        async fn getData() {
            return 42
        }
        getData()
    `;
    const { result } = executeAUL(code);
    assertEqual(result, 42);
});

runner.test('Lexer: New keywords', () => {
    const lexer = new Lexer('match case class struct async await for while');
    const tokens = lexer.tokenize();
    assertEqual(tokens[0].type, TokenType.MATCH);
    assertEqual(tokens[1].type, TokenType.CASE);
    assertEqual(tokens[2].type, TokenType.CLASS);
    assertEqual(tokens[3].type, TokenType.STRUCT);
    assertEqual(tokens[4].type, TokenType.ASYNC);
    assertEqual(tokens[5].type, TokenType.AWAIT);
    assertEqual(tokens[6].type, TokenType.FOR);
    assertEqual(tokens[7].type, TokenType.WHILE);
});

// Run all tests
runner.run().then(success => {
    if (success) {
        console.log('✅ All tests passed!');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed!');
        process.exit(1);
    }
});
