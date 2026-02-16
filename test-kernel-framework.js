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
 * File: test-kernel-framework.js
 * Declaration ID: IP-424F06F2-MLL28ZWK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * KERNEL Framework Test Suite
 * Tests for prompt builder and validator
 */

const KernelPromptBuilder = require('./src/utils/kernel-prompt-builder.js');
const KernelValidator = require('./src/utils/kernel-validator.js');

// Test results
let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
    try {
        fn();
        passed++;
        results.push({ name, status: 'PASS', error: null });
        console.log(`✅ PASS: ${name}`);
    } catch (error) {
        failed++;
        results.push({ name, status: 'FAIL', error: error.message });
        console.error(`❌ FAIL: ${name}`);
        console.error(`   Error: ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertThrows(fn, message) {
    let threw = false;
    try {
        fn();
    } catch (e) {
        threw = true;
    }
    if (!threw) {
        throw new Error(message || 'Expected function to throw');
    }
}

console.log('🎯 KERNEL Framework Test Suite\n');

// ===== KernelPromptBuilder Tests =====
console.log('📝 Testing KernelPromptBuilder...\n');

test('KernelPromptBuilder: Create instance', () => {
    const builder = new KernelPromptBuilder();
    assert(builder, 'Builder should be created');
    assert(builder.prompt, 'Builder should have prompt object');
});

test('KernelPromptBuilder: Set task', () => {
    const builder = new KernelPromptBuilder();
    builder.setTask('Generate Python function');
    assert(builder.prompt.task === 'Generate Python function', 'Task should be set');
});

test('KernelPromptBuilder: Validate task requirement', () => {
    const builder = new KernelPromptBuilder();
    assertThrows(() => builder.build(), 'Should throw when task is missing');
});

test('KernelPromptBuilder: Add inputs', () => {
    const builder = new KernelPromptBuilder();
    builder.addInput('Input 1');
    builder.addInput(['Input 2', 'Input 3']);
    assert(builder.prompt.input.length === 3, 'Should have 3 inputs');
});

test('KernelPromptBuilder: Add constraints', () => {
    const builder = new KernelPromptBuilder();
    builder.addConstraint('Python 3.10+');
    builder.addConstraint(['No external libs', 'Under 50 lines']);
    assert(builder.prompt.constraints.length === 3, 'Should have 3 constraints');
});

test('KernelPromptBuilder: Add outputs', () => {
    const builder = new KernelPromptBuilder();
    builder.addOutput('Function named validate()');
    assert(builder.prompt.output.length === 1, 'Should have 1 output');
});

test('KernelPromptBuilder: Add verification', () => {
    const builder = new KernelPromptBuilder();
    builder.addVerification('Test with valid input');
    builder.addVerification('Test with invalid input');
    assert(builder.prompt.verify.length === 2, 'Should have 2 verifications');
});

test('KernelPromptBuilder: Build text format', () => {
    const builder = new KernelPromptBuilder();
    builder
        .setTask('Test task')
        .addInput('Test input')
        .addConstraint('Test constraint')
        .addOutput('Test output')
        .addVerification('Test verify');
    
    const prompt = builder.build({ format: 'text' });
    assert(prompt.includes('TASK:'), 'Should include TASK section');
    assert(prompt.includes('INPUT:'), 'Should include INPUT section');
    assert(prompt.includes('CONSTRAINTS:'), 'Should include CONSTRAINTS section');
    assert(prompt.includes('OUTPUT:'), 'Should include OUTPUT section');
    assert(prompt.includes('VERIFY:'), 'Should include VERIFY section');
});

test('KernelPromptBuilder: Build JSON format', () => {
    const builder = new KernelPromptBuilder();
    builder.setTask('Test task');
    const prompt = builder.build({ format: 'json' });
    const parsed = JSON.parse(prompt);
    assert(parsed.task === 'Test task', 'JSON should be valid');
});

test('KernelPromptBuilder: Build markdown format', () => {
    const builder = new KernelPromptBuilder();
    builder.setTask('Test task');
    const prompt = builder.build({ format: 'markdown' });
    assert(prompt.includes('## TASK'), 'Should use markdown headers');
});

test('KernelPromptBuilder: Calculate KERNEL score', () => {
    const builder = new KernelPromptBuilder();
    builder
        .setTask('Generate Python email validator')
        .addInput('Email string')
        .addConstraint('Python 3.10+')
        .addConstraint('No external libraries')
        .addOutput('Returns boolean')
        .addVerification('Test with valid email');
    
    const score = builder.calculateKernelScore();
    assert(score.total >= 0 && score.total <= 100, 'Score should be 0-100');
    assert(score.grade, 'Should have grade');
    assert(score.breakdown, 'Should have breakdown');
});

test('KernelPromptBuilder: Validate reproducibility', () => {
    const builder = new KernelPromptBuilder();
    builder.setTask('Use latest React features');
    const validation = builder.validateReproducibility();
    assert(!validation.isReproducible, 'Should detect temporal reference');
    assert(validation.issues.length > 0, 'Should have issues');
});

test('KernelPromptBuilder: Validate narrow scope', () => {
    const builder = new KernelPromptBuilder();
    builder.setTask('Create function and write tests and deploy');
    const validation = builder.validateNarrowScope();
    assert(!validation.isNarrow, 'Should detect multiple goals');
});

test('KernelPromptBuilder: Estimate tokens', () => {
    const builder = new KernelPromptBuilder();
    builder.setTask('Test task');
    const tokens = builder.estimateTokens();
    assert(tokens > 0, 'Should estimate tokens');
});

test('KernelPromptBuilder: Reset', () => {
    const builder = new KernelPromptBuilder();
    builder.setTask('Test').addInput('Input');
    builder.reset();
    assert(builder.prompt.task === '', 'Task should be reset');
    assert(builder.prompt.input.length === 0, 'Input should be reset');
});

test('KernelPromptBuilder: Chain builders', () => {
    const builder2 = KernelPromptBuilder.chain('Previous output');
    assert(builder2.prompt.input.length === 1, 'Should have previous output as input');
});

test('KernelPromptBuilder: Quick build - code', () => {
    const builder = KernelPromptBuilder.quickBuild('code', {
        task: 'Generate validator',
        language: 'Python',
        version: '3.10+'
    });
    assert(builder.prompt.task.includes('validator'), 'Should have task');
    assert(builder.prompt.constraints.length > 0, 'Should have constraints');
});

test('KernelPromptBuilder: Quick build - docs', () => {
    const builder = KernelPromptBuilder.quickBuild('docs', {
        task: 'Document API',
        maxWords: 500
    });
    assert(builder.prompt.constraints.some(c => c.includes('500')), 'Should have word limit');
});

// ===== KernelValidator Tests =====
console.log('\n✅ Testing KernelValidator...\n');

test('KernelValidator: Create instance', () => {
    const validator = new KernelValidator();
    assert(validator, 'Validator should be created');
    assert(validator.thresholds, 'Validator should have thresholds');
});

test('KernelValidator: Validate good prompt', () => {
    const validator = new KernelValidator();
    const prompt = `
TASK: Generate Python email validator

INPUT:
- Email string as input

CONSTRAINTS:
- Python 3.10+
- No external libraries
- Function under 20 lines

OUTPUT:
- Function named validate_email
- Returns boolean

VERIFY:
- Test with valid email returns True
- Test with invalid email returns False
`;
    
    const result = validator.validate(prompt);
    assert(result.overall.score > 0, 'Should have score');
    assert(result.overall.grade, 'Should have grade');
    assert(result.principles, 'Should have principle scores');
});

test('KernelValidator: Detect temporal references', () => {
    const validator = new KernelValidator();
    const prompt = 'Use the latest React version and current best practices';
    const result = validator.validate(prompt);
    
    const reproScore = result.principles.reproducible.score;
    assert(reproScore < 100, 'Should penalize temporal references');
});

test('KernelValidator: Detect vague terms', () => {
    const validator = new KernelValidator();
    const prompt = 'Do something with some stuff maybe';
    const result = validator.validate(prompt);
    
    const simpleScore = result.principles.keepSimple.score;
    assert(simpleScore < 100, 'Should penalize vague terms');
});

test('KernelValidator: Detect multiple goals', () => {
    const validator = new KernelValidator();
    const prompt = 'Create function and also write tests and also deploy';
    const result = validator.validate(prompt);
    
    const narrowScore = result.principles.narrowScope.score;
    assert(narrowScore < 100, 'Should penalize multiple goals');
});

test('KernelValidator: Reward verification criteria', () => {
    const validator = new KernelValidator();
    const prompt = `
Test with input A returns True
Test with input B returns False
Verify output format is JSON
`;
    
    const result = validator.validate(prompt);
    const verifyScore = result.principles.easyVerify.score;
    assert(verifyScore > 0, 'Should reward verification');
});

test('KernelValidator: Detect missing constraints', () => {
    const validator = new KernelValidator();
    const prompt = 'Write Python code to process data';
    const result = validator.validate(prompt);
    
    const explicitScore = result.principles.explicitConstraints.score;
    assert(explicitScore < 100, 'Should note missing constraints');
});

test('KernelValidator: Recognize KERNEL structure', () => {
    const validator = new KernelValidator();
    const prompt = `
TASK: Test
INPUT: Test
CONSTRAINTS: Test
OUTPUT: Test
VERIFY: Test
`;
    
    const result = validator.validate(prompt);
    const structureScore = result.principles.logicalStructure.score;
    assert(structureScore > 70, 'Should recognize KERNEL structure');
});

test('KernelValidator: Calculate complexity', () => {
    const validator = new KernelValidator();
    const simplePrompt = 'Do X';
    const complexPrompt = 'This is a very long and complicated prompt with many words that goes on and on and explains everything in great detail with numerous clauses and sub-clauses and additional information that makes it quite verbose and difficult to parse quickly';
    
    const simple = validator.calculateComplexity(simplePrompt);
    const complex = validator.calculateComplexity(complexPrompt);
    
    assert(simple === 'low', 'Simple prompt should be low complexity');
    assert(complex !== 'low', 'Complex prompt should be higher complexity');
});

test('KernelValidator: Calculate readability', () => {
    const validator = new KernelValidator();
    const prompt = 'Generate code';
    const score = validator.calculateReadability(prompt);
    assert(score >= 0 && score <= 100, 'Readability should be 0-100');
});

test('KernelValidator: Generate report', () => {
    const validator = new KernelValidator();
    const prompt = 'TASK: Test prompt';
    const validation = validator.validate(prompt);
    const report = validator.generateReport(validation);
    
    assert(report.includes('KERNEL VALIDATION REPORT'), 'Should have header');
    assert(report.includes('Overall Score'), 'Should include score');
    assert(report.includes('RECOMMENDATIONS'), 'Should include recommendations');
});

test('KernelValidator: Get grade', () => {
    const validator = new KernelValidator();
    assert(validator.getGrade(95) === 'A (Excellent)', 'Should grade 95 as A');
    assert(validator.getGrade(85) === 'B (Good)', 'Should grade 85 as B');
    assert(validator.getGrade(75) === 'C (Acceptable)', 'Should grade 75 as C');
    assert(validator.getGrade(55) === 'F (Poor)', 'Should grade 55 as F');
});

// ===== Integration Tests =====
console.log('\n🔗 Testing Integration...\n');

test('Integration: Full workflow', () => {
    const builder = new KernelPromptBuilder();
    builder
        .setTask('Generate Python email validator function')
        .addInput('Email string as parameter')
        .addConstraint('Python 3.10+')
        .addConstraint('No external libraries (stdlib regex only)')
        .addConstraint('Function under 20 lines')
        .addOutput('Function named validate_email(email)')
        .addOutput('Returns boolean (True for valid, False for invalid)')
        .addOutput('Include docstring and type hints')
        .addVerification('Test with "test@example.com" returns True')
        .addVerification('Test with "invalid" returns False')
        .addVerification('Test with empty string returns False');
    
    const prompt = builder.build();
    assert(prompt, 'Should build prompt');
    
    const validator = new KernelValidator();
    const result = validator.validate(prompt);
    assert(result.overall.score >= 70, 'Should score at least 70');
    
    const score = builder.calculateKernelScore();
    assert(score.total >= 70, 'Builder score should be at least 70');
});

test('Integration: Quick build and validate', () => {
    const builder = KernelPromptBuilder.quickBuild('code', {
        task: 'Create data processor',
        language: 'JavaScript',
        version: 'ES6+'
    });
    
    const prompt = builder.build();
    const validator = new KernelValidator();
    const result = validator.validate(prompt);
    
    assert(result.overall.score > 0, 'Should validate quick build');
});

// ===== Summary =====
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary');
console.log('='.repeat(50));
console.log(`Total Tests: ${passed + failed}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);

if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
    process.exit(1);
}
