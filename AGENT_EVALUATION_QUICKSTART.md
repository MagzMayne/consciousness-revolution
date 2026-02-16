# File Evaluation System - Quick Start Guide

Get started with the automated file evaluation system in 5 minutes!

## What is it?

An automated system that analyzes your repository for:
- 🔍 **Code Quality**: JavaScript & CSS issues, performance, security
- 📂 **File Usage**: Unused files, duplicates, optimization opportunities
- ⚙️ **Configuration**: Deployment & security best practices

**Note**: Excludes HTML files from main repository structure as specified.

## Quick Start

### 1. Run the Evaluation

```bash
# Using npm script (recommended)
npm run evaluate

# Or directly with Node.js
node run-file-evaluation.js
```

### 2. Check Results

Results are saved to `./agent-reports/`:
- 📊 **HTML Report**: Open in browser for interactive view
- 📝 **Markdown Report**: Human-readable summary
- 📋 **JSON Report**: Machine-readable data

### 3. Review Recommendations

The system provides:
- **Priority ranking**: High, Medium, Low
- **Impact assessment**: What will improve
- **Effort estimates**: How much work required
- **Action items**: Specific tasks to complete

## Usage Examples

### Basic Usage

```bash
# Run with default settings
npm run evaluate

# Verbose output (detailed logging)
npm run evaluate:verbose

# Quiet mode (minimal output)
npm run evaluate:quiet
```

### Advanced Usage

```bash
# Run specific examples
node example-evaluation.js 1  # Full evaluation
node example-evaluation.js 2  # Individual agents
node example-evaluation.js 3  # Custom analysis
node example-evaluation.js 4  # Status monitoring
```

## Understanding Results

### Quality Score

Score range: 0-100 (higher is better)
- **90-100**: Excellent - Minor improvements only
- **70-89**: Good - Some issues to address
- **50-69**: Fair - Multiple improvements needed
- **0-49**: Needs Attention - Significant issues

### Issue Severity Levels

- 🔴 **Critical**: Security risks, broken code - Fix immediately
- ⚠️ **Warning**: Performance issues, bad practices - Address soon
- 💡 **Suggestion**: Code improvements, optimizations - Consider implementing

### Common Issues Found

**JavaScript:**
- Security: `eval()`, `innerHTML` without sanitization
- Performance: Blocking operations, nested loops
- Quality: Missing error handling, no documentation
- Standards: Using `var`, long lines, magic numbers

**CSS:**
- Responsiveness: Missing media queries, fixed widths
- Performance: Deep nesting, universal selectors
- Compatibility: Missing vendor prefixes
- Best practices: Excessive `!important`, duplicate selectors

**Configuration:**
- Security: Hardcoded secrets, vulnerable packages
- Deployment: Missing build scripts, wildcard versions
- Best practices: No test scripts, missing documentation

## Interpreting Reports

### Executive Summary

```
Overall Health: Good
Total Issues: 150
Critical Issues: 2
Files Analyzed: 100
```

**What to do:**
1. Address all critical issues first (red flag 🔴)
2. Review high-priority recommendations
3. Plan work based on effort vs. impact

### File Usage Report

```
Unused Files: 25
Potential Savings: 500KB
```

**What to do:**
1. Review unused files list
2. Verify files are truly unused
3. Remove or archive unnecessary files
4. Clean up repository

### Configuration Issues

```
Security Issues: 3
Deployment Issues: 5
```

**What to do:**
1. Fix security issues immediately
2. Update configuration files
3. Test deployment after changes

## Next Steps

### After First Run

1. **Review Critical Issues**
   - Check security vulnerabilities
   - Fix broken references
   - Address deployment blockers

2. **Plan Improvements**
   - Group similar issues
   - Estimate time required
   - Prioritize by impact

3. **Take Action**
   - Create tasks/tickets
   - Assign to team members
   - Track progress

### Ongoing Usage

```bash
# Run weekly or before releases
npm run evaluate

# Add to CI/CD pipeline
# See FILE_EVALUATION_SYSTEM_README.md for details

# Monitor trends over time
# Compare scores across evaluations
```

## Troubleshooting

### "Cannot find module"
**Solution**: Run from repository root directory

### "Permission denied"
**Solution**: Make script executable
```bash
chmod +x run-file-evaluation.js
```

### High number of unused files
**Reason**: May include legitimate archived or legacy files
**Action**: Review list and verify before deleting

### Low quality score
**Reason**: Many existing issues detected
**Action**: Don't panic! Address incrementally, starting with critical issues

## Tips & Best Practices

### 1. Run Regularly
- Before major releases
- After large refactoring
- Weekly for active projects

### 2. Track Progress
- Save reports with version numbers
- Compare scores over time
- Celebrate improvements!

### 3. Team Workflow
- Share reports in stand-ups
- Assign issues to team members
- Set quality score goals

### 4. Focus on Impact
- Fix critical issues first
- Batch similar changes
- Measure before/after

### 5. Automate
- Add to pre-commit hooks
- Include in CI/CD pipeline
- Set quality thresholds

## Common Questions

**Q: Why are so many files marked as unused?**
A: The agent traces from entry points. Some files may be used by HTML pages (which are excluded) or dynamically loaded.

**Q: Should I fix all suggestions?**
A: No. Focus on critical and high-priority issues first. Suggestions are optional improvements.

**Q: How long does evaluation take?**
A: Small repos: 5-10s, Medium: 15-30s, Large: 30-60s

**Q: Can I customize the rules?**
A: Yes! Edit agent files in `src/agents/` to adjust standards and thresholds.

**Q: Will it modify my code?**
A: No. The system only analyzes and reports. You decide what to fix and how.

## Resources

- **Full Documentation**: See `FILE_EVALUATION_SYSTEM_README.md`
- **Examples**: Run `node example-evaluation.js`
- **Agent Code**: Check `src/agents/` directory
- **Report Samples**: See `agent-reports/` after first run

## Getting Help

1. Check the full README
2. Review example scripts
3. Examine generated reports
4. File an issue on GitHub

---

**Ready?** Run `npm run evaluate` to get started! 🚀
