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
 * File: parser.js
 * Declaration ID: IP-6D35EA88-MLL28ZW3
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * AI Universal Language (AUL) - Parser
 * Builds an Abstract Syntax Tree (AST) from tokens
 * 
 * @module aul/parser
 */

import { TokenType } from './lexer.js';

// AST Node Types
export class ASTNode {
    constructor(type) {
        this.type = type;
    }
}

export class ProgramNode extends ASTNode {
    constructor(statements) {
        super('Program');
        this.statements = statements;
    }
}

export class NumberLiteralNode extends ASTNode {
    constructor(value) {
        super('NumberLiteral');
        this.value = value;
    }
}

export class StringLiteralNode extends ASTNode {
    constructor(value) {
        super('StringLiteral');
        this.value = value;
    }
}

export class BooleanLiteralNode extends ASTNode {
    constructor(value) {
        super('BooleanLiteral');
        this.value = value;
    }
}

export class IdentifierNode extends ASTNode {
    constructor(name) {
        super('Identifier');
        this.name = name;
    }
}

export class BinaryOpNode extends ASTNode {
    constructor(operator, left, right) {
        super('BinaryOp');
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

export class UnaryOpNode extends ASTNode {
    constructor(operator, operand) {
        super('UnaryOp');
        this.operator = operator;
        this.operand = operand;
    }
}

export class VariableDeclarationNode extends ASTNode {
    constructor(name, value, mutable = false) {
        super('VariableDeclaration');
        this.name = name;
        this.value = value;
        this.mutable = mutable;
    }
}

export class AssignmentNode extends ASTNode {
    constructor(name, value) {
        super('Assignment');
        this.name = name;
        this.value = value;
    }
}

export class FunctionDeclarationNode extends ASTNode {
    constructor(name, params, body, isAsync = false) {
        super('FunctionDeclaration');
        this.name = name;
        this.params = params;
        this.body = body;
        this.isAsync = isAsync;
    }
}

export class FunctionCallNode extends ASTNode {
    constructor(name, args) {
        super('FunctionCall');
        this.name = name;
        this.args = args;
    }
}

export class ReturnStatementNode extends ASTNode {
    constructor(value) {
        super('ReturnStatement');
        this.value = value;
    }
}

export class IfStatementNode extends ASTNode {
    constructor(condition, thenBranch, elseBranch = null) {
        super('IfStatement');
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
}

export class BlockStatementNode extends ASTNode {
    constructor(statements) {
        super('BlockStatement');
        this.statements = statements;
    }
}

export class ArrayLiteralNode extends ASTNode {
    constructor(elements) {
        super('ArrayLiteral');
        this.elements = elements;
    }
}

export class MemberAccessNode extends ASTNode {
    constructor(object, property) {
        super('MemberAccess');
        this.object = object;
        this.property = property;
    }
}

export class AwaitExpressionNode extends ASTNode {
    constructor(expression) {
        super('AwaitExpression');
        this.expression = expression;
    }
}

export class MatchStatementNode extends ASTNode {
    constructor(expression, cases, defaultCase = null) {
        super('MatchStatement');
        this.expression = expression;
        this.cases = cases;
        this.defaultCase = defaultCase;
    }
}

export class CaseNode extends ASTNode {
    constructor(pattern, body) {
        super('Case');
        this.pattern = pattern;
        this.body = body;
    }
}

export class ClassDeclarationNode extends ASTNode {
    constructor(name, superClass, properties, methods, constructor) {
        super('ClassDeclaration');
        this.name = name;
        this.superClass = superClass;
        this.properties = properties;
        this.methods = methods;
        this.constructor = constructor;
    }
}

export class StructDeclarationNode extends ASTNode {
    constructor(name, fields) {
        super('StructDeclaration');
        this.name = name;
        this.fields = fields;
    }
}

export class NewExpressionNode extends ASTNode {
    constructor(className, args) {
        super('NewExpression');
        this.className = className;
        this.args = args;
    }
}

export class TypeAnnotationNode extends ASTNode {
    constructor(name, typeExpression) {
        super('TypeAnnotation');
        this.name = name;
        this.typeExpression = typeExpression;
    }
}

export class ImportStatementNode extends ASTNode {
    constructor(imports, from) {
        super('ImportStatement');
        this.imports = imports;
        this.from = from;
    }
}

export class ExportStatementNode extends ASTNode {
    constructor(declaration) {
        super('ExportStatement');
        this.declaration = declaration;
    }
}

export class QueryExpressionNode extends ASTNode {
    constructor(queryText, context = null) {
        super('QueryExpression');
        this.queryText = queryText;
        this.context = context;
    }
}

export class ForLoopNode extends ASTNode {
    constructor(variable, iterable, body) {
        super('ForLoop');
        this.variable = variable;
        this.iterable = iterable;
        this.body = body;
    }
}

export class WhileLoopNode extends ASTNode {
    constructor(condition, body) {
        super('WhileLoop');
        this.condition = condition;
        this.body = body;
    }
}

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    get currentToken() {
        return this.tokens[this.position];
    }

    peek(offset = 1) {
        const pos = this.position + offset;
        return pos < this.tokens.length ? this.tokens[pos] : null;
    }

    advance() {
        return this.tokens[this.position++];
    }

    expect(type) {
        const token = this.currentToken;
        if (token.type !== type) {
            throw new Error(`Expected ${type} but got ${token.type} at ${token.line}:${token.column}`);
        }
        return this.advance();
    }

    parse() {
        const statements = [];
        while (this.currentToken.type !== TokenType.EOF) {
            statements.push(this.parseStatement());
        }
        return new ProgramNode(statements);
    }

    parseStatement() {
        switch (this.currentToken.type) {
            case TokenType.LET:
            case TokenType.MUT:
                return this.parseVariableDeclaration();
            case TokenType.FN:
            case TokenType.ASYNC:
                return this.parseFunctionDeclaration();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            case TokenType.IF:
                return this.parseIfStatement();
            case TokenType.MATCH:
                return this.parseMatchStatement();
            case TokenType.CLASS:
                return this.parseClassDeclaration();
            case TokenType.STRUCT:
                return this.parseStructDeclaration();
            case TokenType.IMPORT:
                return this.parseImportStatement();
            case TokenType.EXPORT:
                return this.parseExportStatement();
            case TokenType.FOR:
                return this.parseForLoop();
            case TokenType.WHILE:
                return this.parseWhileLoop();
            case TokenType.LBRACE:
                return this.parseBlockStatement();
            case TokenType.QUERY:
                return this.parseQueryExpression();
            default:
                // Check if this is an assignment
                if (this.currentToken.type === TokenType.IDENTIFIER && this.peek() && this.peek().type === TokenType.EQUAL) {
                    return this.parseAssignment();
                }
                return this.parseExpressionStatement();
        }
    }

    parseAssignment() {
        const name = this.expect(TokenType.IDENTIFIER).value;
        this.expect(TokenType.EQUAL);
        const value = this.parseExpression();
        return new AssignmentNode(name, value);
    }

    parseVariableDeclaration() {
        const isMutable = this.currentToken.type === TokenType.MUT;
        this.advance(); // Skip 'let' or 'mut'
        
        const name = this.expect(TokenType.IDENTIFIER).value;
        this.expect(TokenType.EQUAL);
        const value = this.parseExpression();
        
        return new VariableDeclarationNode(name, value, isMutable);
    }

    parseFunctionDeclaration() {
        let isAsync = false;
        if (this.currentToken.type === TokenType.ASYNC) {
            isAsync = true;
            this.advance();
        }
        
        this.expect(TokenType.FN);
        
        // Allow 'constructor' as a function name even if it's a keyword
        let name;
        if (this.currentToken.type === TokenType.IDENTIFIER) {
            name = this.currentToken.value;
            this.advance();
        } else {
            // Fallback for keywords used as function names
            name = String(this.currentToken.value);
            this.advance();
        }
        
        this.expect(TokenType.LPAREN);
        const params = [];
        while (this.currentToken.type !== TokenType.RPAREN) {
            params.push(this.expect(TokenType.IDENTIFIER).value);
            if (this.currentToken.type === TokenType.COMMA) {
                this.advance();
            }
        }
        this.expect(TokenType.RPAREN);
        
        const body = this.parseBlockStatement();
        
        return new FunctionDeclarationNode(name, params, body, isAsync);
    }

    parseReturnStatement() {
        this.expect(TokenType.RETURN);
        const value = this.parseExpression();
        return new ReturnStatementNode(value);
    }

    parseIfStatement() {
        this.expect(TokenType.IF);
        const condition = this.parseExpression();
        const thenBranch = this.parseBlockStatement();
        
        let elseBranch = null;
        if (this.currentToken.type === TokenType.ELSE) {
            this.advance();
            elseBranch = this.currentToken.type === TokenType.IF 
                ? this.parseIfStatement()
                : this.parseBlockStatement();
        }
        
        return new IfStatementNode(condition, thenBranch, elseBranch);
    }

    parseBlockStatement() {
        this.expect(TokenType.LBRACE);
        const statements = [];
        while (this.currentToken.type !== TokenType.RBRACE) {
            statements.push(this.parseStatement());
        }
        this.expect(TokenType.RBRACE);
        return new BlockStatementNode(statements);
    }

    parseExpressionStatement() {
        // Special case: print statement without parentheses (Python-style)
        if (this.currentToken.type === TokenType.PRINT) {
            this.advance();
            const arg = this.parseExpression();
            return new FunctionCallNode(new IdentifierNode('print'), [arg]);
        }
        return this.parseExpression();
    }

    parseExpression() {
        return this.parseLogicalOr();
    }

    parseLogicalOr() {
        let left = this.parseLogicalAnd();
        
        while (this.currentToken.type === TokenType.OR) {
            const operator = this.advance().value;
            const right = this.parseLogicalAnd();
            left = new BinaryOpNode(operator, left, right);
        }
        
        return left;
    }

    parseLogicalAnd() {
        let left = this.parseEquality();
        
        while (this.currentToken.type === TokenType.AND) {
            const operator = this.advance().value;
            const right = this.parseEquality();
            left = new BinaryOpNode(operator, left, right);
        }
        
        return left;
    }

    parseEquality() {
        let left = this.parseComparison();
        
        while ([TokenType.DOUBLE_EQUAL, TokenType.NOT_EQUAL].includes(this.currentToken.type)) {
            const operator = this.advance().value;
            const right = this.parseComparison();
            left = new BinaryOpNode(operator, left, right);
        }
        
        return left;
    }

    parseComparison() {
        let left = this.parseAdditive();
        
        while ([TokenType.LESS, TokenType.GREATER, TokenType.LESS_EQUAL, TokenType.GREATER_EQUAL].includes(this.currentToken.type)) {
            const operator = this.advance().value;
            const right = this.parseAdditive();
            left = new BinaryOpNode(operator, left, right);
        }
        
        return left;
    }

    parseAdditive() {
        let left = this.parseMultiplicative();
        
        while ([TokenType.PLUS, TokenType.MINUS].includes(this.currentToken.type)) {
            const operator = this.advance().value;
            const right = this.parseMultiplicative();
            left = new BinaryOpNode(operator, left, right);
        }
        
        return left;
    }

    parseMultiplicative() {
        let left = this.parseUnary();
        
        while ([TokenType.STAR, TokenType.SLASH].includes(this.currentToken.type)) {
            const operator = this.advance().value;
            const right = this.parseUnary();
            left = new BinaryOpNode(operator, left, right);
        }
        
        return left;
    }

    parseUnary() {
        if ([TokenType.NOT, TokenType.MINUS].includes(this.currentToken.type)) {
            const operator = this.advance().value;
            const operand = this.parseUnary();
            return new UnaryOpNode(operator, operand);
        }
        
        // Support await expressions
        if (this.currentToken.type === TokenType.AWAIT) {
            this.advance();
            const expression = this.parseUnary();
            return new AwaitExpressionNode(expression);
        }
        
        return this.parsePostfix();
    }

    parsePostfix() {
        let left = this.parsePrimary();
        
        while (true) {
            if (this.currentToken.type === TokenType.LPAREN) {
                // Function call
                this.advance();
                const args = [];
                while (this.currentToken.type !== TokenType.RPAREN) {
                    args.push(this.parseExpression());
                    if (this.currentToken.type === TokenType.COMMA) {
                        this.advance();
                    }
                }
                this.expect(TokenType.RPAREN);
                left = new FunctionCallNode(left.name || left, args);
            } else if (this.currentToken.type === TokenType.DOT) {
                // Member access
                this.advance();
                const property = this.expect(TokenType.IDENTIFIER).value;
                left = new MemberAccessNode(left, property);
            } else {
                break;
            }
        }
        
        return left;
    }

    parsePrimary() {
        const token = this.currentToken;
        
        switch (token.type) {
            case TokenType.NUMBER:
                this.advance();
                return new NumberLiteralNode(token.value);
            
            case TokenType.STRING:
                this.advance();
                return new StringLiteralNode(token.value);
            
            case TokenType.BOOLEAN:
                this.advance();
                return new BooleanLiteralNode(token.value);
            
            case TokenType.NULL:
                this.advance();
                return new NumberLiteralNode(null);
            
            case TokenType.IDENTIFIER:
            case TokenType.PRINT:
                this.advance();
                return new IdentifierNode(token.value);
            
            case TokenType.LPAREN:
                this.advance();
                const expr = this.parseExpression();
                this.expect(TokenType.RPAREN);
                return expr;
            
            case TokenType.LBRACKET:
                return this.parseArrayLiteral();
            
            case TokenType.NEW:
                this.advance();
                const className = this.expect(TokenType.IDENTIFIER).value;
                this.expect(TokenType.LPAREN);
                const args = [];
                while (this.currentToken.type !== TokenType.RPAREN) {
                    args.push(this.parseExpression());
                    if (this.currentToken.type === TokenType.COMMA) {
                        this.advance();
                    }
                }
                this.expect(TokenType.RPAREN);
                return new NewExpressionNode(className, args);
            
            default:
                throw new Error(`Unexpected token ${token.type} at ${token.line}:${token.column}`);
        }
    }

    parseArrayLiteral() {
        this.expect(TokenType.LBRACKET);
        const elements = [];
        while (this.currentToken.type !== TokenType.RBRACKET) {
            elements.push(this.parseExpression());
            if (this.currentToken.type === TokenType.COMMA) {
                this.advance();
            }
        }
        this.expect(TokenType.RBRACKET);
        return new ArrayLiteralNode(elements);
    }

    parseMatchStatement() {
        this.expect(TokenType.MATCH);
        const expression = this.parseExpression();
        this.expect(TokenType.LBRACE);
        
        const cases = [];
        let defaultCase = null;
        
        while (this.currentToken.type !== TokenType.RBRACE) {
            if (this.currentToken.type === TokenType.CASE) {
                this.advance();
                const pattern = this.parseExpression();
                this.expect(TokenType.FAT_ARROW);
                const body = this.currentToken.type === TokenType.LBRACE 
                    ? this.parseBlockStatement() 
                    : this.parseExpression();
                cases.push(new CaseNode(pattern, body));
                
                // Optional comma between cases
                if (this.currentToken.type === TokenType.COMMA) {
                    this.advance();
                }
            } else if (this.currentToken.type === TokenType.IDENTIFIER && this.currentToken.value === '_') {
                this.advance();
                this.expect(TokenType.FAT_ARROW);
                defaultCase = this.currentToken.type === TokenType.LBRACE 
                    ? this.parseBlockStatement() 
                    : this.parseExpression();
                
                // Optional comma after default case
                if (this.currentToken.type === TokenType.COMMA) {
                    this.advance();
                }
            } else {
                // Skip unexpected tokens to avoid infinite loop
                this.advance();
            }
        }
        
        this.expect(TokenType.RBRACE);
        return new MatchStatementNode(expression, cases, defaultCase);
    }

    parseClassDeclaration() {
        this.expect(TokenType.CLASS);
        const name = this.expect(TokenType.IDENTIFIER).value;
        
        let superClass = null;
        if (this.currentToken.type === TokenType.EXTENDS) {
            this.advance();
            superClass = this.expect(TokenType.IDENTIFIER).value;
        }
        
        this.expect(TokenType.LBRACE);
        
        const properties = [];
        const methods = [];
        let constructor = null;
        
        while (this.currentToken.type !== TokenType.RBRACE) {
            if (this.currentToken.type === TokenType.FN) {
                const method = this.parseFunctionDeclaration();
                if (method.name === 'constructor') {
                    constructor = method;
                } else {
                    methods.push(method);
                }
            } else if (this.currentToken.type === TokenType.LET || this.currentToken.type === TokenType.MUT) {
                properties.push(this.parseVariableDeclaration());
            } else {
                this.advance();
            }
        }
        
        this.expect(TokenType.RBRACE);
        return new ClassDeclarationNode(name, superClass, properties, methods, constructor);
    }

    parseStructDeclaration() {
        this.expect(TokenType.STRUCT);
        const name = this.expect(TokenType.IDENTIFIER).value;
        this.expect(TokenType.LBRACE);
        
        const fields = [];
        while (this.currentToken.type !== TokenType.RBRACE) {
            const fieldName = this.expect(TokenType.IDENTIFIER).value;
            let fieldType = null;
            
            if (this.currentToken.type === TokenType.COLON) {
                this.advance();
                fieldType = this.expect(TokenType.IDENTIFIER).value;
            }
            
            fields.push({ name: fieldName, type: fieldType });
            
            if (this.currentToken.type === TokenType.COMMA) {
                this.advance();
            }
        }
        
        this.expect(TokenType.RBRACE);
        return new StructDeclarationNode(name, fields);
    }

    parseImportStatement() {
        this.expect(TokenType.IMPORT);
        const imports = [];
        
        if (this.currentToken.type === TokenType.LBRACE) {
            this.advance();
            while (this.currentToken.type !== TokenType.RBRACE) {
                imports.push(this.expect(TokenType.IDENTIFIER).value);
                if (this.currentToken.type === TokenType.COMMA) {
                    this.advance();
                }
            }
            this.expect(TokenType.RBRACE);
        } else {
            imports.push(this.expect(TokenType.IDENTIFIER).value);
        }
        
        this.expect(TokenType.FROM);
        const from = this.expect(TokenType.STRING).value;
        
        return new ImportStatementNode(imports, from);
    }

    parseExportStatement() {
        this.expect(TokenType.EXPORT);
        const declaration = this.parseStatement();
        return new ExportStatementNode(declaration);
    }

    parseForLoop() {
        this.expect(TokenType.FOR);
        const variable = this.expect(TokenType.IDENTIFIER).value;
        
        // Support both 'in' and 'of' for iteration
        this.advance(); // Skip 'in' or 'of' keyword
        
        const iterable = this.parseExpression();
        const body = this.parseBlockStatement();
        
        return new ForLoopNode(variable, iterable, body);
    }

    parseWhileLoop() {
        this.expect(TokenType.WHILE);
        const condition = this.parseExpression();
        const body = this.parseBlockStatement();
        
        return new WhileLoopNode(condition, body);
    }

    parseQueryExpression() {
        this.expect(TokenType.QUERY);
        const queryText = this.expect(TokenType.STRING).value;
        
        let context = null;
        if (this.currentToken.type === TokenType.WHERE) {
            this.advance();
            context = this.parseExpression();
        }
        
        return new QueryExpressionNode(queryText, context);
    }
}
