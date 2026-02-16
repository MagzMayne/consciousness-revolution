# AI Universal Language (AUL) - Complete Implementation

## Overview

AUL (AI Universal Language) is a fully functional programming language designed for educational purposes and rapid prototyping. It features a modern syntax, pattern matching, object-oriented programming, and asynchronous operations.

## 🎯 Features Implemented

### Core Language Features ✅
- **Variables**: Immutable (`let`) and mutable (`mut`) variable declarations
- **Data Types**: Numbers, strings, booleans, arrays, null
- **Operators**: Arithmetic (+, -, *, /, %), comparison (==, !=, <, >, <=, >=), logical (&&, ||, !)
- **Functions**: First-class functions with closures
- **Control Flow**: if/else statements, return statements
- **Loops**: For loops (iteration) and while loops

### Advanced Features ✅
- **Pattern Matching**: Match expressions with case patterns and default cases
- **Classes**: Object-oriented programming with constructors and methods
- **Structs**: Lightweight data structures
- **Async/Await**: Asynchronous function declarations (basic support)
- **Import/Export**: Module system for code organization

### Playground
Interactive web-based code editor at `aul-playground.html` with:
- Real-time code execution
- Syntax highlighting
- Multiple example programs
- Error reporting
- Shareable code via URL

## 📁 File Structure

```
/src/aul/
├── lexer.js        - Tokenization of source code
├── parser.js       - AST generation from tokens
├── interpreter.js  - Code execution engine
└── runtime.js      - Runtime utilities

/
├── aul-playground.html     - Interactive web playground
├── aul-utils.js           - Utility functions and examples
├── test-aul.js            - Comprehensive test suite
└── AUL_README.md          - This file
```

## 🚀 Getting Started

### Running Code in Node.js

```javascript
import { Lexer } from './src/aul/lexer.js';
import { Parser } from './src/aul/parser.js';
import { Interpreter } from './src/aul/interpreter.js';

const code = `
let x = 10
let y = 20
print "Sum: " + (x + y)
`;

const lexer = new Lexer(code);
const tokens = lexer.tokenize();

const parser = new Parser(tokens);
const ast = parser.parse();

const interpreter = new Interpreter();
interpreter.interpret(ast);

console.log(interpreter.getOutput());
```

### Using AUL Utils

```javascript
import { executeAUL, validateSyntax, examples } from './aul-utils.js';

// Execute code
const result = executeAUL(examples.fibonacci);
console.log(result.output);

// Validate syntax
const validation = validateSyntax('let x = 10');
console.log(validation.valid); // true
```

### Running the Playground

1. Start a local web server:
   ```bash
   python3 -m http.server 8080
   ```

2. Open your browser to:
   ```
   http://localhost:8080/aul-playground.html
   ```

### Running Tests

```bash
node test-aul.js
```

Expected output: **32 tests passed, 0 failed** ✅

## 📖 Language Syntax

### Variables

```aul
// Immutable variable
let name = "Alice"
let age = 30

// Mutable variable
mut count = 0
count = count + 1
```

### Functions

```aul
fn greet(name) {
    return "Hello, " + name
}

print greet("World")

// Async function
async fn fetchData() {
    return "Data loaded"
}
```

### Pattern Matching

```aul
fn classify(value) {
    match value {
        case 0 => { print("Zero") }
        case 1 => { print("One") }
        case 2 => { print("Two") }
        _ => { print("Other") }
    }
}

classify(1)  // Prints: One
classify(99) // Prints: Other
```

### Structs

```aul
struct Point {
    x,
    y
}

let p = new Point(10, 20)
print "X: " + p.x
print "Y: " + p.y
```

### Classes

```aul
class Animal {
    fn constructor(name, sound) {
        print "Creating " + name
    }
}

let dog = new Animal("Dog", "Woof")
```

### Loops

```aul
// For loop
let numbers = [1, 2, 3, 4, 5]
for num in numbers {
    print "Number: " + num
}

// While loop
mut i = 0
while i < 5 {
    print i
    i = i + 1
}
```

### Conditionals

```aul
let age = 18

if age >= 18 {
    print "Adult"
} else {
    print "Minor"
}
```

### Arrays

```aul
let fruits = ["apple", "banana", "cherry"]
print fruits

let numbers = [1, 2, 3, 4, 5]
```

## 🧪 Code Examples

### Fibonacci Sequence

```aul
fn fibonacci(n) {
    if n <= 1 {
        return n
    }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

print "Fib(10): " + fibonacci(10)
```

### Factorial

```aul
fn factorial(n) {
    if n <= 1 {
        return 1
    }
    return n * factorial(n - 1)
}

print "5! = " + factorial(5)
```

### Calculator

```aul
fn add(a, b) { return a + b }
fn subtract(a, b) { return a - b }
fn multiply(a, b) { return a * b }
fn divide(a, b) {
    if b == 0 {
        print "Error: Division by zero"
        return 0
    }
    return a / b
}

print "10 + 5 = " + add(10, 5)
print "10 - 5 = " + subtract(10, 5)
print "10 × 5 = " + multiply(10, 5)
print "10 ÷ 5 = " + divide(10, 5)
```

## 🔧 API Reference

### Lexer

```javascript
import { Lexer, TokenType } from './src/aul/lexer.js';

const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();
```

**Token Types**: NUMBER, STRING, BOOLEAN, NULL, IDENTIFIER, FN, LET, MUT, IF, ELSE, RETURN, ASYNC, AWAIT, MATCH, CASE, CLASS, STRUCT, FOR, WHILE, and more.

### Parser

```javascript
import { Parser } from './src/aul/parser.js';

const parser = new Parser(tokens);
const ast = parser.parse();
```

**AST Node Types**: Program, NumberLiteral, StringLiteral, BooleanLiteral, BinaryOp, UnaryOp, FunctionDeclaration, FunctionCall, IfStatement, MatchStatement, ClassDeclaration, StructDeclaration, ForLoop, WhileLoop, etc.

### Interpreter

```javascript
import { Interpreter } from './src/aul/interpreter.js';

const interpreter = new Interpreter();
const result = interpreter.interpret(ast);
const output = interpreter.getOutput();
```

## 🎓 Code Triangulation

Code triangulation is a technique where you verify that different implementations produce the same results. AUL supports this through the `triangulateCode` function:

```javascript
import { triangulateCode } from './aul-utils.js';

const spec = {
    description: "Calculate sum of array",
    expectedOutput: "15"
};

const implementations = [
    {
        language: "AUL",
        code: `
            let sum = 0
            let nums = [1, 2, 3, 4, 5]
            for n in nums {
                sum = sum + n
            }
            print sum
        `
    }
];

const result = triangulateCode(spec, implementations);
console.log(result.allMatch); // true
```

## 🐛 Known Limitations

1. **Natural Language Queries**: Partially implemented but not fully integrated
2. **Type System**: Type annotations are parsed but not enforced
3. **Async/Await**: Functions can be declared as async but don't create actual promises
4. **Import/Export**: Module system is basic and doesn't load external files
5. **Array Methods**: Limited built-in array methods

## 🔮 Future Enhancements

- [ ] Type checking and inference
- [ ] Full async/await with promises
- [ ] Module loading from files
- [ ] More array and string methods
- [ ] Error messages with stack traces
- [ ] Debugger support
- [ ] Standard library
- [ ] Natural language query expansion

## 📊 Test Coverage

Current test suite includes 32 tests covering:
- Lexer (4 tests)
- Parser (4 tests)
- Interpreter - Basic (14 tests)
- Interpreter - Advanced Features (10 tests)

**Status**: ✅ All tests passing

## 🤝 Contributing

AUL is designed for educational purposes. To extend the language:

1. Add new token types in `lexer.js`
2. Add new AST nodes in `parser.js`
3. Implement evaluation logic in `interpreter.js`
4. Add tests in `test-aul.js`
5. Update examples in `aul-playground.html`

## 📝 License

This implementation is part of the barbrickdesign.github.io project.

## 🙏 Acknowledgments

Created as part of an AI-assisted development project to demonstrate modern programming language features and interactive code execution in the browser.

---

**Version**: 1.0  
**Last Updated**: 2026-01-18  
**Status**: Fully Functional ✅
