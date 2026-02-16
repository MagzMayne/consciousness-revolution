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
 * File: interpreter.js
 * Declaration ID: IP-118BC6C3-MLL28ZW3
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * AI Universal Language (AUL) - Interpreter
 * Evaluates AST nodes and executes AUL code
 * 
 * @module aul/interpreter
 */

export class Environment {
    constructor(parent = null) {
        this.vars = new Map();
        this.parent = parent;
    }

    define(name, value, mutable = false) {
        if (this.vars.has(name)) {
            throw new Error(`Variable '${name}' already defined`);
        }
        this.vars.set(name, { value, mutable });
    }

    get(name) {
        if (this.vars.has(name)) {
            return this.vars.get(name).value;
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`Undefined variable '${name}'`);
    }

    set(name, value) {
        if (this.vars.has(name)) {
            const variable = this.vars.get(name);
            if (!variable.mutable) {
                throw new Error(`Cannot assign to immutable variable '${name}'`);
            }
            variable.value = value;
            return;
        }
        if (this.parent) {
            this.parent.set(name, value);
            return;
        }
        throw new Error(`Undefined variable '${name}'`);
    }
}

export class ReturnValue {
    constructor(value) {
        this.value = value;
    }
}

export class Interpreter {
    constructor() {
        this.globalEnv = new Environment();
        this.output = [];
        this.setupBuiltins();
    }

    setupBuiltins() {
        // Built-in print function
        this.globalEnv.define('print', {
            type: 'builtin',
            execute: (args) => {
                const message = args.map(arg => this.stringify(arg)).join(' ');
                this.output.push(message);
                return null;
            }
        });

        // Built-in array methods
        this.globalEnv.define('Array', {
            type: 'builtin',
            methods: {
                map: (array, fn) => array.map(item => {
                    if (typeof fn === 'object' && fn.type === 'function') {
                        return this.callFunction(fn, [item]);
                    }
                    return fn(item);
                }),
                filter: (array, fn) => array.filter(item => {
                    if (typeof fn === 'object' && fn.type === 'function') {
                        return this.callFunction(fn, [item]);
                    }
                    return fn(item);
                }),
                reduce: (array, init, fn) => array.reduce((acc, item) => {
                    if (typeof fn === 'object' && fn.type === 'function') {
                        return this.callFunction(fn, [acc, item]);
                    }
                    return fn(acc, item);
                }, init),
                push: (array, item) => {
                    array.push(item);
                    return array;
                },
                len: (array) => array.length,
                sum: (array) => array.reduce((a, b) => a + b, 0)
            }
        });
    }

    stringify(value) {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (typeof value === 'boolean') return String(value);
        if (Array.isArray(value)) return `[${value.map(v => this.stringify(v)).join(', ')}]`;
        if (typeof value === 'object' && value.type === 'function') return `<function ${value.name}>`;
        return JSON.stringify(value);
    }

    interpret(ast, env = this.globalEnv) {
        return this.evaluate(ast, env);
    }

    evaluate(node, env) {
        switch (node.type) {
            case 'Program':
                return this.evaluateProgram(node, env);
            
            case 'NumberLiteral':
            case 'StringLiteral':
            case 'BooleanLiteral':
                return node.value;
            
            case 'Identifier':
                return env.get(node.name);
            
            case 'BinaryOp':
                return this.evaluateBinaryOp(node, env);
            
            case 'UnaryOp':
                return this.evaluateUnaryOp(node, env);
            
            case 'VariableDeclaration':
                return this.evaluateVariableDeclaration(node, env);
            
            case 'Assignment':
                return this.evaluateAssignment(node, env);
            
            case 'FunctionDeclaration':
                return this.evaluateFunctionDeclaration(node, env);
            
            case 'FunctionCall':
                return this.evaluateFunctionCall(node, env);
            
            case 'ReturnStatement':
                const value = this.evaluate(node.value, env);
                throw new ReturnValue(value);
            
            case 'IfStatement':
                return this.evaluateIfStatement(node, env);
            
            case 'BlockStatement':
                return this.evaluateBlockStatement(node, env);
            
            case 'ArrayLiteral':
                return node.elements.map(el => this.evaluate(el, env));
            
            case 'MemberAccess':
                return this.evaluateMemberAccess(node, env);
            
            case 'AwaitExpression':
                return this.evaluateAwaitExpression(node, env);
            
            case 'MatchStatement':
                return this.evaluateMatchStatement(node, env);
            
            case 'ClassDeclaration':
                return this.evaluateClassDeclaration(node, env);
            
            case 'StructDeclaration':
                return this.evaluateStructDeclaration(node, env);
            
            case 'NewExpression':
                return this.evaluateNewExpression(node, env);
            
            case 'ImportStatement':
                return this.evaluateImportStatement(node, env);
            
            case 'ExportStatement':
                return this.evaluateExportStatement(node, env);
            
            case 'ForLoop':
                return this.evaluateForLoop(node, env);
            
            case 'WhileLoop':
                return this.evaluateWhileLoop(node, env);
            
            case 'QueryExpression':
                return this.evaluateQueryExpression(node, env);
            
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    evaluateProgram(node, env) {
        let result = null;
        for (const statement of node.statements) {
            result = this.evaluate(statement, env);
        }
        return result;
    }

    evaluateBinaryOp(node, env) {
        const left = this.evaluate(node.left, env);
        const right = this.evaluate(node.right, env);
        
        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '==': return left === right;
            case '!=': return left !== right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case '&&': return left && right;
            case '||': return left || right;
            default:
                throw new Error(`Unknown binary operator: ${node.operator}`);
        }
    }

    evaluateUnaryOp(node, env) {
        const operand = this.evaluate(node.operand, env);
        
        switch (node.operator) {
            case '-': return -operand;
            case '!': return !operand;
            default:
                throw new Error(`Unknown unary operator: ${node.operator}`);
        }
    }

    evaluateVariableDeclaration(node, env) {
        const value = this.evaluate(node.value, env);
        env.define(node.name, value, node.mutable);
        return value;
    }

    evaluateAssignment(node, env) {
        const value = this.evaluate(node.value, env);
        env.set(node.name, value);
        return value;
    }

    evaluateFunctionDeclaration(node, env) {
        const func = {
            type: 'function',
            name: node.name,
            params: node.params,
            body: node.body,
            env: env,
            isAsync: node.isAsync
        };
        env.define(node.name, func);
        return func;
    }

    evaluateFunctionCall(node, env) {
        const funcName = node.name.name || node.name;
        const func = env.get(funcName);
        
        if (func.type === 'builtin') {
            const args = node.args.map(arg => this.evaluate(arg, env));
            return func.execute(args);
        }
        
        if (func.type === 'function') {
            const args = node.args.map(arg => this.evaluate(arg, env));
            return this.callFunction(func, args);
        }
        
        throw new Error(`'${funcName}' is not a function`);
    }

    callFunction(func, args) {
        const funcEnv = new Environment(func.env);
        
        // Bind parameters - undefined args default to null for compatibility
        for (let i = 0; i < func.params.length; i++) {
            const value = i < args.length ? args[i] : null;
            funcEnv.define(func.params[i], value);
        }
        
        try {
            const result = this.evaluate(func.body, funcEnv);
            
            // Handle async functions
            if (func.isAsync && result && typeof result.then === 'function') {
                return result;
            }
            
            return result;
        } catch (e) {
            if (e instanceof ReturnValue) {
                return e.value;
            }
            throw e;
        }
    }

    evaluateIfStatement(node, env) {
        const condition = this.evaluate(node.condition, env);
        
        if (condition) {
            return this.evaluate(node.thenBranch, env);
        } else if (node.elseBranch) {
            return this.evaluate(node.elseBranch, env);
        }
        
        return null;
    }

    evaluateBlockStatement(node, env) {
        const blockEnv = new Environment(env);
        let result = null;
        
        for (const statement of node.statements) {
            result = this.evaluate(statement, blockEnv);
        }
        
        return result;
    }

    evaluateMemberAccess(node, env) {
        const object = this.evaluate(node.object, env);
        const property = node.property;
        
        // Handle array methods
        if (Array.isArray(object)) {
            const arrayMethods = this.globalEnv.get('Array').methods;
            
            if (arrayMethods[property]) {
                return {
                    type: 'method',
                    execute: (...args) => arrayMethods[property](object, ...args)
                };
            }
            
            // Array index access
            if (typeof property === 'number') {
                return object[property];
            }
        }
        
        // Handle regular object property access
        if (typeof object === 'object' && object !== null) {
            return object[property];
        }
        
        throw new Error(`Cannot access property '${property}' of ${typeof object}`);
    }

    getOutput() {
        return this.output.join('\n');
    }

    clearOutput() {
        this.output = [];
    }

    evaluateAwaitExpression(node, env) {
        // Simple async/await implementation using promises
        const expression = this.evaluate(node.expression, env);
        if (expression && typeof expression.then === 'function') {
            // Return the promise for async handling
            return expression;
        }
        // If not a promise, return as-is
        return expression;
    }

    evaluateMatchStatement(node, env) {
        const value = this.evaluate(node.expression, env);
        
        // Check each case for a match
        for (const caseNode of node.cases) {
            const pattern = this.evaluate(caseNode.pattern, env);
            
            if (this.matchPattern(value, pattern)) {
                return this.evaluate(caseNode.body, env);
            }
        }
        
        // If no case matched, use default
        if (node.defaultCase) {
            return this.evaluate(node.defaultCase, env);
        }
        
        throw new Error(`No matching pattern for value: ${value}`);
    }

    matchPattern(value, pattern) {
        // Exact equality check first
        if (value === pattern) return true;
        
        // Type matching for different types
        if (typeof value === 'number' && typeof pattern === 'number') {
            return value === pattern;
        }
        if (typeof value === 'string' && typeof pattern === 'string') {
            return value === pattern;
        }
        if (typeof value === 'boolean' && typeof pattern === 'boolean') {
            return value === pattern;
        }
        
        // Array pattern matching
        if (Array.isArray(value) && Array.isArray(pattern)) {
            if (value.length !== pattern.length) return false;
            for (let i = 0; i < value.length; i++) {
                if (!this.matchPattern(value[i], pattern[i])) return false;
            }
            return true;
        }
        
        return false;
    }

    evaluateClassDeclaration(node, env) {
        const classObject = {
            type: 'class',
            name: node.name,
            superClass: node.superClass,
            properties: node.properties,
            methods: node.methods,
            constructor: node.constructor,
            env: env
        };
        
        env.define(node.name, classObject);
        return classObject;
    }

    evaluateStructDeclaration(node, env) {
        const structObject = {
            type: 'struct',
            name: node.name,
            fields: node.fields,
            create: (values) => {
                const instance = { __type: node.name };
                node.fields.forEach((field, idx) => {
                    instance[field.name] = values[idx] || null;
                });
                return instance;
            }
        };
        
        env.define(node.name, structObject);
        return structObject;
    }

    evaluateNewExpression(node, env) {
        const classOrStruct = env.get(node.className);
        const args = node.args.map(arg => this.evaluate(arg, env));
        
        if (classOrStruct.type === 'struct') {
            return classOrStruct.create(args);
        }
        
        if (classOrStruct.type === 'class') {
            // Create instance
            const instance = {
                __type: node.className,
                __class: classOrStruct
            };
            
            // Create instance environment
            const instanceEnv = new Environment(classOrStruct.env);
            instanceEnv.define('this', instance);
            
            // Initialize properties
            classOrStruct.properties.forEach(prop => {
                const value = this.evaluate(prop.value, instanceEnv);
                instance[prop.name] = value;
            });
            
            // Bind methods
            classOrStruct.methods.forEach(method => {
                instance[method.name] = {
                    type: 'method',
                    params: method.params,
                    body: method.body,
                    instance: instance,
                    env: instanceEnv
                };
            });
            
            // Call constructor if exists
            if (classOrStruct.constructor) {
                const constructorEnv = new Environment(instanceEnv);
                classOrStruct.constructor.params.forEach((param, idx) => {
                    constructorEnv.define(param, args[idx]);
                });
                
                try {
                    this.evaluate(classOrStruct.constructor.body, constructorEnv);
                } catch (e) {
                    if (!(e instanceof ReturnValue)) throw e;
                }
            }
            
            return instance;
        }
        
        throw new Error(`Cannot instantiate ${node.className}`);
    }

    evaluateImportStatement(node, env) {
        // Simplified import - in real implementation would load modules
        this.output.push(`// Importing ${node.imports.join(', ')} from "${node.from}"`);
        
        // Store import metadata
        node.imports.forEach(name => {
            env.define(name, {
                type: 'imported',
                from: node.from,
                name: name
            });
        });
        
        return null;
    }

    evaluateExportStatement(node, env) {
        // Evaluate the declaration and mark as exported
        const result = this.evaluate(node.declaration, env);
        this.output.push(`// Exported: ${node.declaration.name || 'anonymous'}`);
        return result;
    }

    evaluateForLoop(node, env) {
        const iterable = this.evaluate(node.iterable, env);
        const loopEnv = new Environment(env);
        
        if (!Array.isArray(iterable)) {
            throw new Error('For loop requires an iterable (array)');
        }
        
        let result = null;
        for (const item of iterable) {
            loopEnv.vars.set(node.variable, { value: item, mutable: false });
            result = this.evaluate(node.body, loopEnv);
        }
        
        return result;
    }

    evaluateWhileLoop(node, env) {
        let result = null;
        
        while (this.evaluate(node.condition, env)) {
            result = this.evaluate(node.body, env);
        }
        
        return result;
    }

    evaluateQueryExpression(node, env) {
        // Natural language query processor
        const query = node.queryText.toLowerCase();
        const context = node.context ? this.evaluate(node.context, env) : null;
        
        // Simple query patterns
        if (query.includes('sum') || query.includes('total')) {
            if (Array.isArray(context)) {
                return context.reduce((a, b) => a + b, 0);
            }
        }
        
        if (query.includes('count') || query.includes('length')) {
            if (Array.isArray(context)) {
                return context.length;
            }
        }
        
        if (query.includes('average') || query.includes('mean')) {
            if (Array.isArray(context)) {
                return context.reduce((a, b) => a + b, 0) / context.length;
            }
        }
        
        if (query.includes('max') || query.includes('maximum')) {
            if (Array.isArray(context)) {
                return Math.max(...context);
            }
        }
        
        if (query.includes('min') || query.includes('minimum')) {
            if (Array.isArray(context)) {
                return Math.min(...context);
            }
        }
        
        // Return query result as string
        return `Query result for: "${node.queryText}"`;
    }
}
