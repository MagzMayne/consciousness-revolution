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
 * File: kernel-prompt-builder.js
 * Declaration ID: IP-650442F5-MLL28ZWF
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * KERNEL Prompt Builder Utility
 * Builds AI prompts using the KERNEL framework for optimal results
 * 
 * KERNEL = Keep it simple, Easy to verify, Reproducible, Narrow scope, Explicit constraints, Logical structure
 * 
 * @author BarbrickDesign AI Team
 * @version 1.0.0
 */

class KernelPromptBuilder {
    constructor() {
        this.prompt = {
            task: '',
            input: [],
            constraints: [],
            output: [],
            verify: []
        };
        this.metrics = {
            estimatedTokens: 0,
            complexity: 'low',
            kernelScore: 0
        };
    }

    /**
     * K - Keep it Simple
     * Set a single, clear task goal
     * @param {string} task - One sentence describing the goal
     * @returns {KernelPromptBuilder} - Chainable
     */
    setTask(task) {
        if (!task || typeof task !== 'string') {
            throw new Error('Task must be a non-empty string');
        }
        
        // Validate simplicity: should be one sentence
        const sentences = task.split(/[.!?]+/).filter(s => s.trim());
        if (sentences.length > 1) {
            console.warn('KERNEL K: Task should be one sentence. Consider simplifying.');
        }
        
        // Check for vague terms
        const vagueTerms = ['something', 'stuff', 'things', 'maybe', 'probably', 'kind of'];
        const hasVagueTerms = vagueTerms.some(term => task.toLowerCase().includes(term));
        if (hasVagueTerms) {
            console.warn('KERNEL K: Task contains vague terms. Be more specific.');
        }
        
        this.prompt.task = task.trim();
        return this;
    }

    /**
     * Add context/input information
     * @param {string|string[]} input - What you're starting with
     * @returns {KernelPromptBuilder} - Chainable
     */
    addInput(input) {
        if (Array.isArray(input)) {
            this.prompt.input.push(...input);
        } else if (typeof input === 'string') {
            this.prompt.input.push(input);
        }
        return this;
    }

    /**
     * E - Explicit Constraints
     * Add constraints (what NOT to do or technical requirements)
     * @param {string|string[]} constraint - Constraints to add
     * @returns {KernelPromptBuilder} - Chainable
     */
    addConstraint(constraint) {
        if (Array.isArray(constraint)) {
            this.prompt.constraints.push(...constraint);
        } else if (typeof constraint === 'string') {
            this.prompt.constraints.push(constraint);
        }
        
        // Check for common missing constraints
        const hasLanguageVersion = this.prompt.constraints.some(c => 
            /python\s*\d|javascript\s*es\d|node\s*\d/i.test(c)
        );
        const hasLengthLimit = this.prompt.constraints.some(c => 
            /under\s*\d+|less than\s*\d+|max\s*\d+/i.test(c)
        );
        
        if (!hasLanguageVersion && this.prompt.task.toLowerCase().includes('code')) {
            console.info('KERNEL E: Consider adding language version constraint');
        }
        
        return this;
    }

    /**
     * Add output format/structure
     * @param {string|string[]} output - Expected output format
     * @returns {KernelPromptBuilder} - Chainable
     */
    addOutput(output) {
        if (Array.isArray(output)) {
            this.prompt.output.push(...output);
        } else if (typeof output === 'string') {
            this.prompt.output.push(output);
        }
        return this;
    }

    /**
     * E - Easy to Verify
     * Add verification criteria (how to check success)
     * @param {string|string[]} criteria - Verification steps
     * @returns {KernelPromptBuilder} - Chainable
     */
    addVerification(criteria) {
        if (Array.isArray(criteria)) {
            this.prompt.verify.push(...criteria);
        } else if (typeof criteria === 'string') {
            this.prompt.verify.push(criteria);
        }
        
        // Check for vague verification
        const vagueVerify = ['should work', 'looks good', 'seems right', 'appears correct'];
        const hasVagueVerify = this.prompt.verify.some(v => 
            vagueVerify.some(term => v.toLowerCase().includes(term))
        );
        
        if (hasVagueVerify) {
            console.warn('KERNEL E: Verification criteria should be objective and measurable');
        }
        
        return this;
    }

    /**
     * R - Reproducible Results
     * Validate that prompt will produce consistent results
     * @returns {object} - Validation result
     */
    validateReproducibility() {
        const issues = [];
        const promptText = this.build();
        
        // Check for temporal references
        const temporalTerms = [
            'current', 'latest', 'recent', 'today', 'now',
            'modern', 'trending', 'popular', 'new'
        ];
        
        temporalTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'i');
            if (regex.test(promptText)) {
                issues.push(`Contains temporal reference: "${term}" - Use specific versions/dates instead`);
            }
        });
        
        // Check for version specificity
        const hasVersions = /v?\d+\.\d+|\d{4}/.test(promptText);
        if (!hasVersions && promptText.toLowerCase().includes('version')) {
            issues.push('Mentions version but not specific - Add exact version numbers');
        }
        
        return {
            isReproducible: issues.length === 0,
            issues,
            score: Math.max(0, 100 - (issues.length * 20))
        };
    }

    /**
     * N - Narrow Scope
     * Validate that prompt has single, focused goal
     * @returns {object} - Validation result
     */
    validateNarrowScope() {
        const issues = [];
        const promptText = this.prompt.task;
        
        // Check for multiple goals indicators
        const multiGoalIndicators = [
            'and also', 'also', 'plus', 'additionally', 
            'while you\'re at it', 'and then', 'after that'
        ];
        
        multiGoalIndicators.forEach(indicator => {
            if (promptText.toLowerCase().includes(indicator)) {
                issues.push(`Multiple goals detected: "${indicator}" - Consider splitting into separate prompts`);
            }
        });
        
        // Check task complexity
        const taskWords = promptText.split(/\s+/).length;
        if (taskWords > 20) {
            issues.push(`Task is verbose (${taskWords} words) - Simplify to core goal`);
        }
        
        // Check for multiple verbs (suggests multiple tasks)
        const actionVerbs = ['create', 'write', 'generate', 'build', 'implement', 'design', 'deploy', 'test', 'document'];
        const foundVerbs = actionVerbs.filter(verb => promptText.toLowerCase().includes(verb));
        if (foundVerbs.length > 1) {
            issues.push(`Multiple action verbs found: ${foundVerbs.join(', ')} - Focus on one primary task`);
        }
        
        return {
            isNarrow: issues.length === 0,
            issues,
            score: Math.max(0, 100 - (issues.length * 25))
        };
    }

    /**
     * Calculate KERNEL score (0-100)
     * Higher is better
     * @returns {object} - Score breakdown
     */
    calculateKernelScore() {
        const scores = {
            keepSimple: 0,      // K - Task is simple and clear
            easyVerify: 0,      // E - Has verification criteria
            reproducible: 0,    // R - Will work consistently
            narrowScope: 0,     // N - Single focused goal
            explicit: 0,        // E - Has constraints
            logical: 0          // L - Well structured
        };
        
        // K - Keep it Simple (0-20 points)
        if (this.prompt.task) {
            const words = this.prompt.task.split(/\s+/).length;
            if (words <= 15) scores.keepSimple = 20;
            else if (words <= 25) scores.keepSimple = 15;
            else if (words <= 35) scores.keepSimple = 10;
            else scores.keepSimple = 5;
        }
        
        // E - Easy to Verify (0-20 points)
        scores.easyVerify = Math.min(20, this.prompt.verify.length * 5);
        
        // R - Reproducible (0-15 points)
        const repro = this.validateReproducibility();
        scores.reproducible = Math.floor(repro.score * 0.15);
        
        // N - Narrow Scope (0-15 points)
        const narrow = this.validateNarrowScope();
        scores.narrowScope = Math.floor(narrow.score * 0.15);
        
        // E - Explicit Constraints (0-15 points)
        scores.explicit = Math.min(15, this.prompt.constraints.length * 3);
        
        // L - Logical Structure (0-15 points)
        const hasAllSections = this.prompt.task && 
                              this.prompt.input.length > 0 &&
                              this.prompt.constraints.length > 0 &&
                              this.prompt.output.length > 0 &&
                              this.prompt.verify.length > 0;
        
        if (hasAllSections) scores.logical = 15;
        else {
            const sectionCount = [
                this.prompt.task,
                this.prompt.input.length,
                this.prompt.constraints.length,
                this.prompt.output.length,
                this.prompt.verify.length
            ].filter(Boolean).length;
            scores.logical = Math.floor(sectionCount * 3);
        }
        
        const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
        
        return {
            total,
            breakdown: scores,
            grade: this.getGrade(total),
            recommendations: this.getRecommendations(scores)
        };
    }

    /**
     * Get letter grade for KERNEL score
     * @param {number} score - Total score (0-100)
     * @returns {string} - Letter grade
     */
    getGrade(score) {
        if (score >= 90) return 'A - Excellent';
        if (score >= 80) return 'B - Good';
        if (score >= 70) return 'C - Acceptable';
        if (score >= 60) return 'D - Needs Improvement';
        return 'F - Poor';
    }

    /**
     * Get recommendations to improve KERNEL score
     * @param {object} scores - Score breakdown
     * @returns {string[]} - Recommendations
     */
    getRecommendations(scores) {
        const recommendations = [];
        
        if (scores.keepSimple < 15) {
            recommendations.push('K: Simplify task to one clear sentence');
        }
        if (scores.easyVerify < 15) {
            recommendations.push('E: Add more verification criteria (aim for 3-5)');
        }
        if (scores.reproducible < 10) {
            recommendations.push('R: Remove temporal references, use specific versions');
        }
        if (scores.narrowScope < 10) {
            recommendations.push('N: Focus on one goal, split multi-task prompts');
        }
        if (scores.explicit < 10) {
            recommendations.push('E: Add explicit constraints (language version, length limits, etc.)');
        }
        if (scores.logical < 10) {
            recommendations.push('L: Include all sections: task, input, constraints, output, verify');
        }
        
        return recommendations;
    }

    /**
     * L - Logical Structure
     * Build the final prompt with clear sections
     * @param {object} options - Build options
     * @returns {string} - Formatted prompt
     */
    build(options = {}) {
        const { format = 'text', includeMetadata = false } = options;
        
        if (!this.prompt.task) {
            throw new Error('Task is required. Use setTask() first.');
        }
        
        let output = '';
        
        if (format === 'text') {
            output += `TASK: ${this.prompt.task}\n\n`;
            
            if (this.prompt.input.length > 0) {
                output += `INPUT:\n`;
                this.prompt.input.forEach(item => {
                    output += `- ${item}\n`;
                });
                output += '\n';
            }
            
            if (this.prompt.constraints.length > 0) {
                output += `CONSTRAINTS:\n`;
                this.prompt.constraints.forEach(item => {
                    output += `- ${item}\n`;
                });
                output += '\n';
            }
            
            if (this.prompt.output.length > 0) {
                output += `OUTPUT:\n`;
                this.prompt.output.forEach(item => {
                    output += `- ${item}\n`;
                });
                output += '\n';
            }
            
            if (this.prompt.verify.length > 0) {
                output += `VERIFY:\n`;
                this.prompt.verify.forEach(item => {
                    output += `- ${item}\n`;
                });
            }
        } else if (format === 'json') {
            output = JSON.stringify(this.prompt, null, 2);
        } else if (format === 'markdown') {
            output += `## TASK\n${this.prompt.task}\n\n`;
            
            if (this.prompt.input.length > 0) {
                output += `## INPUT\n`;
                this.prompt.input.forEach(item => output += `- ${item}\n`);
                output += '\n';
            }
            
            if (this.prompt.constraints.length > 0) {
                output += `## CONSTRAINTS\n`;
                this.prompt.constraints.forEach(item => output += `- ${item}\n`);
                output += '\n';
            }
            
            if (this.prompt.output.length > 0) {
                output += `## OUTPUT\n`;
                this.prompt.output.forEach(item => output += `- ${item}\n`);
                output += '\n';
            }
            
            if (this.prompt.verify.length > 0) {
                output += `## VERIFY\n`;
                this.prompt.verify.forEach(item => output += `- ${item}\n`);
            }
        }
        
        if (includeMetadata) {
            const score = this.calculateKernelScore();
            output += `\n---\nKERNEL Score: ${score.total}/100 (${score.grade})\n`;
            if (score.recommendations.length > 0) {
                output += `Recommendations:\n`;
                score.recommendations.forEach(rec => output += `- ${rec}\n`);
            }
        }
        
        return output.trim();
    }

    /**
     * Estimate token usage for the prompt
     * Rough estimate: 1 token ≈ 4 characters
     * @returns {number} - Estimated tokens
     */
    estimateTokens() {
        const promptText = this.build();
        return Math.ceil(promptText.length / 4);
    }

    /**
     * Reset builder to start fresh
     * @returns {KernelPromptBuilder} - Chainable
     */
    reset() {
        this.prompt = {
            task: '',
            input: [],
            constraints: [],
            output: [],
            verify: []
        };
        return this;
    }

    /**
     * Create a chained prompt builder
     * For complex workflows that need multiple prompts
     * @param {string} previousOutput - Output from previous prompt
     * @returns {KernelPromptBuilder} - New builder instance
     */
    static chain(previousOutput) {
        const builder = new KernelPromptBuilder();
        if (previousOutput) {
            builder.addInput(`Previous output: ${previousOutput}`);
        }
        return builder;
    }

    /**
     * Quick builder for common patterns
     * @param {string} type - Pattern type (code, docs, analysis, etc.)
     * @param {object} params - Pattern parameters
     * @returns {KernelPromptBuilder} - Configured builder
     */
    static quickBuild(type, params = {}) {
        const builder = new KernelPromptBuilder();
        
        switch (type) {
            case 'code':
                builder
                    .setTask(params.task || 'Generate code')
                    .addConstraint(`${params.language || 'JavaScript'} ${params.version || ''}`)
                    .addConstraint(`No external libraries${params.allowLibs ? ' except: ' + params.allowLibs : ''}`)
                    .addConstraint('Include error handling')
                    .addOutput('Well-commented code')
                    .addVerification('Code runs without errors')
                    .addVerification('Handles edge cases');
                break;
                
            case 'docs':
                builder
                    .setTask(params.task || 'Write documentation')
                    .addConstraint('Markdown format')
                    .addConstraint(`Under ${params.maxWords || 1000} words`)
                    .addOutput('Clear headings and sections')
                    .addOutput('Code examples included')
                    .addVerification('All sections present')
                    .addVerification('Examples are runnable');
                break;
                
            case 'analysis':
                builder
                    .setTask(params.task || 'Analyze data')
                    .addConstraint('Python with pandas/numpy')
                    .addConstraint('Include visualizations')
                    .addOutput('Summary statistics')
                    .addOutput('Charts/graphs')
                    .addOutput('Written insights')
                    .addVerification('Numbers match source data')
                    .addVerification('Visualizations are clear');
                break;
                
            case 'refactor':
                builder
                    .setTask(params.task || 'Refactor code')
                    .addConstraint('Maintain existing functionality')
                    .addConstraint('Improve readability')
                    .addConstraint('No breaking changes')
                    .addOutput('Refactored code')
                    .addOutput('List of changes made')
                    .addVerification('All tests still pass')
                    .addVerification('No behavior changes');
                break;
        }
        
        return builder;
    }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KernelPromptBuilder;
}
if (typeof window !== 'undefined') {
    window.KernelPromptBuilder = KernelPromptBuilder;
}
