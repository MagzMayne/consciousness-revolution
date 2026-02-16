# 🚀 KERNEL Framework Quick Start Guide

Get started with KERNEL prompt engineering in 5 minutes!

## What You'll Learn

1. What KERNEL is and why it matters
2. How to build your first KERNEL prompt
3. How to use KERNEL in this repository
4. Quick patterns for common tasks

---

## 1. What is KERNEL?

KERNEL is a prompt engineering framework with 6 proven principles:

| Principle | Symbol | Meaning |
|-----------|--------|---------|
| **K**eep it Simple | 🎯 | One clear goal |
| **E**asy to Verify | ✅ | Measurable success |
| **R**eproducible | 🔄 | Consistent results |
| **N**arrow Scope | 🎯 | One task only |
| **E**xplicit Constraints | 📋 | What NOT to do |
| **L**ogical Structure | 📐 | Clear sections |

### Why KERNEL?

Proven results from 1000+ prompts:
- ✅ **94% first-try success** (vs 72% before)
- ✅ **67% faster** to useful results
- ✅ **58% less tokens** used
- ✅ **340% accuracy** improvement

---

## 2. Your First KERNEL Prompt

### Bad Prompt (Before KERNEL)
```
Help me write a script to process some data files
```
Result: Generic, unusable code ❌

### Good Prompt (After KERNEL)
```
TASK: Python script to merge multiple CSV files

INPUT:
- CSV files in data/ directory
- All files have same columns: id, name, date, value

CONSTRAINTS:
- Python 3.10+
- Use pandas only
- Code under 50 lines
- Handle missing files gracefully

OUTPUT:
- Single merged.csv file
- Remove duplicate IDs (keep latest)
- Print summary: "Merged X files, Y rows"

VERIFY:
- Run: python merge.py
- Test with: test_data/*.csv
- Output should be valid CSV
```
Result: 37 lines, worked on first try ✅

---

## 3. Using KERNEL in This Repository

### Method 1: Interactive Playground (Easiest)

1. Open [kernel-playground.html](kernel-playground.html)
2. Choose a quick pattern or build custom
3. Click "Build Prompt"
4. Click "Validate" to check quality
5. Copy and use!

### Method 2: JavaScript Code (Recommended)

```javascript
// Load KERNEL utilities
const KernelPromptBuilder = window.KernelPromptBuilder;
const builder = new KernelPromptBuilder();

// Build prompt
builder
    .setTask('Generate Python function to validate emails')
    .addInput('Email string as input')
    .addConstraint('Python 3.10+')
    .addConstraint('No external libraries')
    .addOutput('Function returns True/False')
    .addVerification('Test with valid email: returns True');

// Get formatted prompt
const prompt = builder.build();
console.log(prompt);

// Use with OpenAI
const response = await window.openAIOrchestrator.executeKernelPrompt(builder);
```

### Method 3: Quick Patterns (Fastest)

```javascript
// Code generation
const codePrompt = await window.openAIOrchestrator.quickKernel('code', 
    'Create email validator', {
    language: 'Python',
    version: '3.10+'
});

// Documentation
const docsPrompt = await window.openAIOrchestrator.quickKernel('docs',
    'Document auth API');

// Data analysis
const analysisPrompt = await window.openAIOrchestrator.quickKernel('analysis',
    'Analyze sales trends');

// Refactoring
const refactorPrompt = await window.openAIOrchestrator.quickKernel('refactor',
    'Modernize legacy function');
```

---

## 4. Quick Patterns

### Pattern: Code Generation

```
TASK: [Language] [what to create]

INPUT:
- [What function accepts]
- [Expected inputs]

CONSTRAINTS:
- [Language version]
- [No/Only specific libraries]
- [Length limits]
- [Error handling required]

OUTPUT:
- [Function signature]
- [What it returns]
- [Documentation type]

VERIFY:
- [Test case 1]
- [Test case 2]
- [Edge cases]
```

**Example**: See playground → Code Pattern

### Pattern: Documentation

```
TASK: Document [what]

INPUT:
- [What exists]
- [What needs docs]

CONSTRAINTS:
- [Format (Markdown, etc.)]
- [Length limits]
- [Must include examples]

OUTPUT:
- [Sections required]
- [Example format]
- [Code samples]

VERIFY:
- [All sections present]
- [Examples runnable]
```

**Example**: See playground → Documentation Pattern

### Pattern: Data Analysis

```
TASK: Analyze [data] and [what to find]

INPUT:
- [Data format]
- [Data location]
- [Time period]

CONSTRAINTS:
- [Tools allowed]
- [Output format]
- [Visualization requirements]

OUTPUT:
- [File 1: statistics]
- [File 2: visualizations]
- [File 3: insights]

VERIFY:
- [Numbers match source]
- [Visualizations clear]
- [All files generated]
```

**Example**: See playground → Analysis Pattern

---

## 5. KERNEL Checklist

Before using any prompt, check:

- [ ] **Task** is one clear sentence
- [ ] **Input** lists what you're providing
- [ ] **Constraints** include version numbers
- [ ] **Constraints** say what NOT to do
- [ ] **Output** is specific (not "good code")
- [ ] **Verify** has measurable criteria
- [ ] **No** temporal words (current, latest, recent)
- [ ] **Score** is 80+ (use validator)

---

## 6. Common Mistakes

### ❌ Mistake 1: Too Vague
```
Write good code for processing data
```
**Fix**: Be specific about language, data format, processing steps

### ❌ Mistake 2: Multiple Goals
```
Create function AND documentation AND tests AND deploy
```
**Fix**: Split into 4 separate KERNEL prompts

### ❌ Mistake 3: Subjective Criteria
```
Make it look nice and professional
```
**Fix**: Use measurable criteria like "Include 3 code examples"

### ❌ Mistake 4: Temporal References
```
Use the latest React and current best practices
```
**Fix**: Specify "React 18.2" and "React docs 2023"

### ❌ Mistake 5: No Constraints
```
Generate a Python script
```
**Fix**: Add Python version, library limits, length, error handling

---

## 7. KERNEL in Practice

### For AI API Calls

```javascript
// ALWAYS use KERNEL builder
const builder = new KernelPromptBuilder()
    .setTask(/* ... */)
    .addConstraint(/* ... */);

const response = await api.executeKernelPrompt(builder);
```

### For Agent Systems

```javascript
class MyAgent {
    async plan(task) {
        // Build KERNEL prompt
        const builder = new KernelPromptBuilder()
            .setTask(task)
            .addConstraint('Follow repository standards');
        
        return builder.build();
    }
}
```

### For Code Comments

```javascript
// KERNEL: TASK - Validate email format
// INPUT: email (string)
// CONSTRAINTS: Regex only, no external libs
// OUTPUT: boolean (true if valid)
// VERIFY: Test with "test@example.com" returns true
function validateEmail(email) {
    // Implementation...
}
```

---

## 8. Measuring Success

### Track Your Improvement

```javascript
// Get session metrics
const metrics = window.kernelMetrics.getStats();

console.log(metrics);
// {
//   successRate: "94%",
//   avgTokensPerPrompt: 250,
//   avgTimePerPrompt: 15,
//   avgKernelScore: 87.5
// }
```

### Target Metrics

| Metric | Target |
|--------|--------|
| Success Rate | >90% |
| Token Usage | <300 per prompt |
| KERNEL Score | >80 |
| First-try Success | Yes |

---

## 9. Resources

- **Full Documentation**: [KERNEL_FRAMEWORK.md](KERNEL_FRAMEWORK.md)
- **Interactive Playground**: [kernel-playground.html](kernel-playground.html)
- **Code Examples**: See `src/ai/openai-orchestrator.js`
- **Validator**: `src/utils/kernel-validator.js`
- **Builder**: `src/utils/kernel-prompt-builder.js`

---

## 10. Quick Tips

1. **Start with playground** - Build confidence before coding
2. **Use quick patterns** - Don't reinvent common prompts
3. **Validate always** - Check score before using
4. **Iterate** - Refine based on results
5. **Track metrics** - Measure improvement over time

---

## Next Steps

1. ✅ Open [kernel-playground.html](kernel-playground.html)
2. ✅ Try a quick pattern (code, docs, analysis)
3. ✅ Build a custom prompt
4. ✅ Validate (aim for 80+ score)
5. ✅ Use in your code
6. ✅ Track results

---

## Support

- **Questions?** Email: BarbrickDesign@gmail.com
- **Issues?** GitHub Issues
- **Examples?** See playground patterns

---

**Built with ❤️ by Ryan Barbrick and the BarbrickDesign community**

*Last Updated: January 26, 2026*
