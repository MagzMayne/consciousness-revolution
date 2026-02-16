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
 * File: lexer.js
 * Declaration ID: IP-7BA25495-MLL28ZW3
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * AI Universal Language (AUL) - Lexer
 * Tokenizes AUL source code into a stream of tokens
 * 
 * @module aul/lexer
 */

export class Token {
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }

    toString() {
        return `Token(${this.type}, ${JSON.stringify(this.value)}, ${this.line}:${this.column})`;
    }
}

export const TokenType = {
    // Literals
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    NULL: 'NULL',
    
    // Identifiers and keywords
    IDENTIFIER: 'IDENTIFIER',
    FN: 'FN',
    LET: 'LET',
    MUT: 'MUT',
    IF: 'IF',
    ELSE: 'ELSE',
    RETURN: 'RETURN',
    ASYNC: 'ASYNC',
    AWAIT: 'AWAIT',
    IMPORT: 'IMPORT',
    EXPORT: 'EXPORT',
    FROM: 'FROM',
    PRINT: 'PRINT',
    MATCH: 'MATCH',
    CASE: 'CASE',
    CLASS: 'CLASS',
    STRUCT: 'STRUCT',
    NEW: 'NEW',
    THIS: 'THIS',
    EXTENDS: 'EXTENDS',
    TYPE: 'TYPE',
    INTERFACE: 'INTERFACE',
    AS: 'AS',
    QUERY: 'QUERY',
    WHERE: 'WHERE',
    FOR: 'FOR',
    WHILE: 'WHILE',
    BREAK: 'BREAK',
    CONTINUE: 'CONTINUE',
    
    // Operators
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    STAR: 'STAR',
    SLASH: 'SLASH',
    PERCENT: 'PERCENT',
    EQUAL: 'EQUAL',
    DOUBLE_EQUAL: 'DOUBLE_EQUAL',
    NOT_EQUAL: 'NOT_EQUAL',
    LESS: 'LESS',
    GREATER: 'GREATER',
    LESS_EQUAL: 'LESS_EQUAL',
    GREATER_EQUAL: 'GREATER_EQUAL',
    AND: 'AND',
    OR: 'OR',
    NOT: 'NOT',
    FAT_ARROW: 'FAT_ARROW',
    COLON: 'COLON',
    DOT: 'DOT',
    QUESTION: 'QUESTION',
    PIPE: 'PIPE',
    
    // Delimiters
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    LBRACKET: 'LBRACKET',
    RBRACKET: 'RBRACKET',
    COMMA: 'COMMA',
    SEMICOLON: 'SEMICOLON',
    
    // Special
    EOF: 'EOF'
};

export class Lexer {
    constructor(source) {
        this.source = source;
        this.position = 0;
        this.line = 1;
        this.column = 1;
    }

    get currentChar() {
        return this.position < this.source.length ? this.source[this.position] : null;
    }

    peek(offset = 1) {
        const pos = this.position + offset;
        return pos < this.source.length ? this.source[pos] : null;
    }

    advance() {
        const char = this.currentChar;
        this.position++;
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }

    skipWhitespace() {
        while (this.currentChar && /[\s\n]/.test(this.currentChar)) {
            this.advance();
        }
    }

    skipComment() {
        if (this.currentChar === '/' && this.peek() === '/') {
            while (this.currentChar && this.currentChar !== '\n') {
                this.advance();
            }
        }
    }

    readNumber() {
        const startLine = this.line;
        const startColumn = this.column;
        let numStr = '';
        let hasDecimal = false;

        while (this.currentChar && (/\d/.test(this.currentChar) || this.currentChar === '.')) {
            if (this.currentChar === '.') {
                if (hasDecimal) break;
                hasDecimal = true;
            }
            numStr += this.advance();
        }

        const value = hasDecimal ? parseFloat(numStr) : parseInt(numStr, 10);
        return new Token(TokenType.NUMBER, value, startLine, startColumn);
    }

    readString(quote) {
        const startLine = this.line;
        const startColumn = this.column;
        this.advance(); // Skip opening quote
        let str = '';

        while (this.currentChar && this.currentChar !== quote) {
            if (this.currentChar === '\\') {
                this.advance();
                const escapeChar = this.currentChar;
                switch (escapeChar) {
                    case 'n': str += '\n'; break;
                    case 't': str += '\t'; break;
                    case '\\': str += '\\'; break;
                    case quote: str += quote; break;
                    default: str += escapeChar;
                }
                this.advance();
            } else {
                str += this.advance();
            }
        }

        if (this.currentChar === quote) {
            this.advance(); // Skip closing quote
        }

        return new Token(TokenType.STRING, str, startLine, startColumn);
    }

    readIdentifier() {
        const startLine = this.line;
        const startColumn = this.column;
        let ident = '';

        while (this.currentChar && /[a-zA-Z0-9_]/.test(this.currentChar)) {
            ident += this.advance();
        }

        // Check for keywords
        const keywords = {
            'fn': TokenType.FN,
            'let': TokenType.LET,
            'mut': TokenType.MUT,
            'if': TokenType.IF,
            'else': TokenType.ELSE,
            'return': TokenType.RETURN,
            'print': TokenType.PRINT,
            'async': TokenType.ASYNC,
            'await': TokenType.AWAIT,
            'import': TokenType.IMPORT,
            'export': TokenType.EXPORT,
            'from': TokenType.FROM,
            'match': TokenType.MATCH,
            'case': TokenType.CASE,
            'class': TokenType.CLASS,
            'struct': TokenType.STRUCT,
            'new': TokenType.NEW,
            'this': TokenType.THIS,
            'extends': TokenType.EXTENDS,
            'type': TokenType.TYPE,
            'interface': TokenType.INTERFACE,
            'as': TokenType.AS,
            'query': TokenType.QUERY,
            'where': TokenType.WHERE,
            'for': TokenType.FOR,
            'while': TokenType.WHILE,
            'break': TokenType.BREAK,
            'continue': TokenType.CONTINUE,
            'in': TokenType.IDENTIFIER, // Special handling for 'in' in for loops
            'of': TokenType.IDENTIFIER, // Special handling for 'of' in for loops
            'true': TokenType.BOOLEAN,
            'false': TokenType.BOOLEAN,
            'null': TokenType.NULL
        };

        const tokenType = keywords[ident] || TokenType.IDENTIFIER;
        const value = tokenType === TokenType.BOOLEAN ? (ident === 'true') : ident;

        return new Token(tokenType, value, startLine, startColumn);
    }

    tokenize() {
        const tokens = [];

        while (this.currentChar) {
            this.skipWhitespace();
            if (!this.currentChar) break;

            // Skip comments
            if (this.currentChar === '/' && this.peek() === '/') {
                this.skipComment();
                continue;
            }

            const startLine = this.line;
            const startColumn = this.column;
            const char = this.currentChar;

            // Numbers
            if (/\d/.test(char)) {
                tokens.push(this.readNumber());
                continue;
            }

            // Strings
            if (char === '"' || char === "'") {
                tokens.push(this.readString(char));
                continue;
            }

            // Identifiers and keywords
            if (/[a-zA-Z_]/.test(char)) {
                tokens.push(this.readIdentifier());
                continue;
            }

            // Two-character operators
            if (char === '=' && this.peek() === '=') {
                this.advance();
                this.advance();
                tokens.push(new Token(TokenType.DOUBLE_EQUAL, '==', startLine, startColumn));
                continue;
            }
            if (char === '!' && this.peek() === '=') {
                this.advance();
                this.advance();
                tokens.push(new Token(TokenType.NOT_EQUAL, '!=', startLine, startColumn));
                continue;
            }
            if (char === '<' && this.peek() === '=') {
                this.advance();
                this.advance();
                tokens.push(new Token(TokenType.LESS_EQUAL, '<=', startLine, startColumn));
                continue;
            }
            if (char === '>' && this.peek() === '=') {
                this.advance();
                this.advance();
                tokens.push(new Token(TokenType.GREATER_EQUAL, '>=', startLine, startColumn));
                continue;
            }
            if (char === '&' && this.peek() === '&') {
                this.advance();
                this.advance();
                tokens.push(new Token(TokenType.AND, '&&', startLine, startColumn));
                continue;
            }
            if (char === '|' && this.peek() === '|') {
                this.advance();
                this.advance();
                tokens.push(new Token(TokenType.OR, '||', startLine, startColumn));
                continue;
            }
            if (char === '=' && this.peek() === '>') {
                this.advance();
                this.advance();
                tokens.push(new Token(TokenType.FAT_ARROW, '=>', startLine, startColumn));
                continue;
            }

            // Single-character tokens
            const singleChar = {
                '+': TokenType.PLUS,
                '-': TokenType.MINUS,
                '*': TokenType.STAR,
                '/': TokenType.SLASH,
                '%': TokenType.PERCENT,
                '=': TokenType.EQUAL,
                '<': TokenType.LESS,
                '>': TokenType.GREATER,
                '!': TokenType.NOT,
                ':': TokenType.COLON,
                '.': TokenType.DOT,
                '?': TokenType.QUESTION,
                '|': TokenType.PIPE,
                '(': TokenType.LPAREN,
                ')': TokenType.RPAREN,
                '{': TokenType.LBRACE,
                '}': TokenType.RBRACE,
                '[': TokenType.LBRACKET,
                ']': TokenType.RBRACKET,
                ',': TokenType.COMMA,
                ';': TokenType.SEMICOLON
            };

            if (singleChar[char]) {
                this.advance();
                tokens.push(new Token(singleChar[char], char, startLine, startColumn));
                continue;
            }

            // Unknown character
            throw new Error(`Unexpected character '${char}' at ${startLine}:${startColumn}`);
        }

        tokens.push(new Token(TokenType.EOF, null, this.line, this.column));
        return tokens;
    }
}
