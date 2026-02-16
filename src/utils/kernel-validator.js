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
 * File: kernel-validator.js
 * Declaration ID: IP-474D78F5-MLL28ZWF
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * KERNEL Prompt Validator
 * Validates prompts against KERNEL framework principles
 * 
 * @author BarbrickDesign AI Team
 * @version 1.0.0
 */

class KernelValidator {
    constructor() {
        this.thresholds = {
            excellent: 90,
            good: 80,
            acceptable: 70,
            needsWork: 60
        };
    }

    /**
     * Validate a prompt against all KERNEL principles
     * @param {string|object} prompt - Prompt text or KernelPromptBuilder output
     * @returns {object} - Validation results
     */
    validate(prompt) {
        const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
        
        const results = {
            overall: {
                score: 0,
                grade: '',
                passed: false
            },
            principles: {
                keepSimple: this.validateKeepSimple(promptText),
                easyVerify: this.validateEasyVerify(promptText),
                reproducible: this.validateReproducible(promptText),
                narrowScope: this.validateNarrowScope(promptText),
                explicitConstraints: this.validateExplicitConstraints(promptText),
                logicalStructure: this.validateLogicalStructure(promptText)
            },
            recommendations: [],
            metrics: {
                estimatedTokens: Math.ceil(promptText.length / 4),
                complexity: this.calculateComplexity(promptText),
                readability: this.calculateReadability(promptText)
            }
        };
        
        // Calculate overall score (weighted average)
        const weights = {
            keepSimple: 20,
            easyVerify: 20,
            reproducible: 15,
            narrowScope: 15,
            explicitConstraints: 15,
            logicalStructure: 15
        };
        
        let totalScore = 0;
        Object.keys(results.principles).forEach(key => {
            totalScore += results.principles[key].score * (weights[key] / 100);
        });
        
        results.overall.score = Math.round(totalScore);
        results.overall.grade = this.getGrade(results.overall.score);
        results.overall.passed = results.overall.score >= this.thresholds.acceptable;
        
        // Collect recommendations
        Object.values(results.principles).forEach(principle => {
            results.recommendations.push(...principle.recommendations);
        });
        
        return results;
    }

    /**
     * K - Validate "Keep it Simple"
     * @param {string} promptText - Prompt to validate
     * @returns {object} - Validation result
     */
    validateKeepSimple(promptText) {
        const issues = [];
        const recommendations = [];
        
        // Check length
        const words = promptText.split(/\s+/).length;
        let lengthScore = 100;
        
        if (words > 500) {
            lengthScore = 30;
            issues.push(`Prompt is very long (${words} words)`);
            recommendations.push('Reduce prompt to essential information only');
        } else if (words > 300) {
            lengthScore = 50;
            issues.push(`Prompt is lengthy (${words} words)`);
            recommendations.push('Consider simplifying or removing unnecessary context');
        } else if (words > 150) {
            lengthScore = 70;
        } else if (words > 75) {
            lengthScore = 85;
        }
        
        // Check for vague language
        const vagueTerms = [
            'something', 'stuff', 'things', 'maybe', 'probably', 
            'kind of', 'sort of', 'whatever', 'somehow'
        ];
        
        const foundVagueTerms = vagueTerms.filter(term => 
            new RegExp(`\\b${term}\\b`, 'i').test(promptText)
        );
        
        if (foundVagueTerms.length > 0) {
            lengthScore -= 10 * foundVagueTerms.length;
            issues.push(`Contains vague terms: ${foundVagueTerms.join(', ')}`);
            recommendations.push('Replace vague terms with specific, concrete language');
        }
        
        // Check for rambling (repeated concepts)
        const sentences = promptText.split(/[.!?]+/).filter(s => s.trim());
        const uniqueWords = new Set(promptText.toLowerCase().match(/\b\w+\b/g));
        const redundancyRatio = words / uniqueWords.size;
        
        if (redundancyRatio > 2.5) {
            lengthScore -= 15;
            issues.push('High redundancy detected (repeating similar concepts)');
            recommendations.push('Remove repetitive explanations');
        }
        
        return {
            score: Math.max(0, Math.min(100, lengthScore)),
            passed: lengthScore >= 70,
            issues,
            recommendations,
            metrics: {
                wordCount: words,
                sentenceCount: sentences.length,
                redundancyRatio: redundancyRatio.toFixed(2)
            }
        };
    }

    /**
     * E - Validate "Easy to Verify"
     * @param {string} promptText - Prompt to validate
     * @returns {object} - Validation result
     */
    validateEasyVerify(promptText) {
        const issues = [];
        const recommendations = [];
        let score = 0;
        
        // Check for verification keywords
        const verificationKeywords = [
            'verify', 'test', 'check', 'validate', 'ensure',
            'confirm', 'should', 'must', 'expect', 'returns',
            'output', 'result', 'success criteria'
        ];
        
        const foundKeywords = verificationKeywords.filter(keyword => 
            new RegExp(`\\b${keyword}\\b`, 'i').test(promptText)
        );
        
        if (foundKeywords.length === 0) {
            issues.push('No verification criteria specified');
            recommendations.push('Add explicit success criteria (what to verify)');
            score = 20;
        } else if (foundKeywords.length < 3) {
            issues.push('Limited verification criteria');
            recommendations.push('Add more specific verification steps');
            score = 50;
        } else {
            score = Math.min(100, 60 + (foundKeywords.length * 8));
        }
        
        // Check for measurable criteria
        const measurablePatterns = [
            /\d+\s*(examples?|tests?|cases?)/i,
            /under\s*\d+/i,
            /exactly\s*\d+/i,
            /at least\s*\d+/i,
            /returns?\s*\w+/i
        ];
        
        const hasMeasurable = measurablePatterns.some(pattern => pattern.test(promptText));
        if (!hasMeasurable) {
            issues.push('No measurable success criteria');
            recommendations.push('Add quantifiable verification (e.g., "3 examples", "under 100ms")');
            score -= 20;
        }
        
        // Check for subjective terms
        const subjectiveTerms = [
            'good', 'better', 'best', 'nice', 'clean', 'elegant',
            'engaging', 'interesting', 'quality', 'professional'
        ];
        
        const foundSubjective = subjectiveTerms.filter(term => 
            new RegExp(`\\b${term}\\b`, 'i').test(promptText)
        );
        
        if (foundSubjective.length > 0) {
            issues.push(`Subjective terms found: ${foundSubjective.join(', ')}`);
            recommendations.push('Replace subjective terms with objective, measurable criteria');
            score -= 10 * Math.min(foundSubjective.length, 3);
        }
        
        return {
            score: Math.max(0, Math.min(100, score)),
            passed: score >= 70,
            issues,
            recommendations,
            metrics: {
                verificationKeywords: foundKeywords.length,
                hasMeasurable,
                subjectiveTermCount: foundSubjective.length
            }
        };
    }

    /**
     * R - Validate "Reproducible Results"
     * @param {string} promptText - Prompt to validate
     * @returns {object} - Validation result
     */
    validateReproducible(promptText) {
        const issues = [];
        const recommendations = [];
        let score = 100;
        
        // Check for temporal references
        const temporalTerms = [
            'current', 'latest', 'recent', 'today', 'now', 'modern',
            'trending', 'popular', 'new', 'upcoming', 'contemporary'
        ];
        
        const foundTemporal = temporalTerms.filter(term => 
            new RegExp(`\\b${term}\\b`, 'i').test(promptText)
        );
        
        foundTemporal.forEach(term => {
            issues.push(`Temporal reference: "${term}"`);
            score -= 15;
        });
        
        if (foundTemporal.length > 0) {
            recommendations.push('Replace temporal references with specific versions/dates');
            recommendations.push('Example: "React 18.2" instead of "latest React"');
        }
        
        // Check for version specificity
        const hasVersionNumbers = /v?\d+\.\d+(\.\d+)?|\b\d{4}\b/.test(promptText);
        const mentionsVersion = /version|release|edition/i.test(promptText);
        
        if (mentionsVersion && !hasVersionNumbers) {
            issues.push('Mentions version but not specific');
            recommendations.push('Add exact version numbers (e.g., Python 3.10, Node 18.0)');
            score -= 20;
        }
        
        // Check for unspecified standards
        const standardsKeywords = ['standard', 'convention', 'practice', 'guideline'];
        const mentionsStandards = standardsKeywords.some(keyword => 
            new RegExp(`\\b${keyword}\\b`, 'i').test(promptText)
        );
        
        const hasSpecificStandard = /\b(RFC|PEP|ISO|IEEE|W3C|ECMA)\s*\d+/i.test(promptText);
        
        if (mentionsStandards && !hasSpecificStandard) {
            issues.push('References standards without specific identifier');
            recommendations.push('Cite specific standards (e.g., PEP 8, RFC 6749)');
            score -= 15;
        }
        
        return {
            score: Math.max(0, score),
            passed: score >= 70,
            issues,
            recommendations,
            metrics: {
                temporalReferences: foundTemporal.length,
                hasVersionNumbers,
                hasSpecificStandards: hasSpecificStandard
            }
        };
    }

    /**
     * N - Validate "Narrow Scope"
     * @param {string} promptText - Prompt to validate
     * @returns {object} - Validation result
     */
    validateNarrowScope(promptText) {
        const issues = [];
        const recommendations = [];
        let score = 100;
        
        // Check for multiple goal indicators
        const multiGoalPatterns = [
            /and also/i,
            /also\s+(?:create|write|generate|build)/i,
            /plus\s+(?:create|write|generate|build)/i,
            /additionally/i,
            /while you're at it/i,
            /and then/i,
            /after that/i,
            /furthermore/i
        ];
        
        const foundMultiGoal = multiGoalPatterns.filter(pattern => 
            pattern.test(promptText)
        );
        
        if (foundMultiGoal.length > 0) {
            issues.push(`Multiple goals detected (${foundMultiGoal.length} indicators)`);
            recommendations.push('Split into separate prompts, one for each goal');
            recommendations.push('Chain prompts: Prompt 1 → Prompt 2 → Prompt 3');
            score -= 25 * foundMultiGoal.length;
        }
        
        // Count primary action verbs
        const actionVerbs = [
            'create', 'write', 'generate', 'build', 'implement',
            'design', 'develop', 'deploy', 'test', 'document',
            'analyze', 'optimize', 'refactor', 'migrate', 'integrate'
        ];
        
        const foundVerbs = actionVerbs.filter(verb => 
            new RegExp(`\\b${verb}\\b`, 'i').test(promptText)
        );
        
        if (foundVerbs.length > 2) {
            issues.push(`Multiple action verbs: ${foundVerbs.join(', ')}`);
            recommendations.push('Focus on one primary action');
            score -= 10 * (foundVerbs.length - 2);
        }
        
        // Check for different domains
        const domains = [
            { name: 'code', keywords: ['code', 'function', 'class', 'script', 'program'] },
            { name: 'docs', keywords: ['document', 'documentation', 'readme', 'guide'] },
            { name: 'test', keywords: ['test', 'unit test', 'integration test', 'spec'] },
            { name: 'deploy', keywords: ['deploy', 'ci/cd', 'pipeline', 'infrastructure'] },
            { name: 'design', keywords: ['design', 'ui', 'ux', 'interface', 'mockup'] }
        ];
        
        const foundDomains = domains.filter(domain => 
            domain.keywords.some(keyword => 
                new RegExp(`\\b${keyword}\\b`, 'i').test(promptText)
            )
        );
        
        if (foundDomains.length > 1) {
            issues.push(`Multiple domains: ${foundDomains.map(d => d.name).join(', ')}`);
            recommendations.push('Separate concerns into individual prompts');
            score -= 15 * (foundDomains.length - 1);
        }
        
        return {
            score: Math.max(0, score),
            passed: score >= 70,
            issues,
            recommendations,
            metrics: {
                multiGoalIndicators: foundMultiGoal.length,
                actionVerbs: foundVerbs.length,
                domains: foundDomains.map(d => d.name)
            }
        };
    }

    /**
     * E - Validate "Explicit Constraints"
     * @param {string} promptText - Prompt to validate
     * @returns {object} - Validation result
     */
    validateExplicitConstraints(promptText) {
        const issues = [];
        const recommendations = [];
        let score = 60; // Base score
        
        // Check for common constraint types
        const constraintPatterns = {
            language: /\b(python|javascript|java|c\+\+|ruby|go|rust|typescript)\s*\d*\.?\d*/i,
            length: /\b(under|less than|max|maximum|limit)\s*\d+/i,
            libraries: /\b(no|without|only|use|with)\s*(external\s*)?(libraries|dependencies|packages)/i,
            performance: /\b(under|less than)\s*\d+\s*(ms|seconds|milliseconds)/i,
            format: /\b(json|csv|xml|yaml|markdown|html)\s*format/i,
            compatibility: /\b(works? (on|with)|compatible (with|on)|supports?)/i
        };
        
        const foundConstraints = {};
        Object.entries(constraintPatterns).forEach(([type, pattern]) => {
            foundConstraints[type] = pattern.test(promptText);
            if (foundConstraints[type]) {
                score += 8;
            }
        });
        
        // Check if constraints section exists
        const hasConstraintSection = /\b(constraint|requirement|limitation|must|should|don't|no)\b/i.test(promptText);
        
        if (!hasConstraintSection) {
            issues.push('No explicit constraints section');
            recommendations.push('Add CONSTRAINTS section with technical requirements');
            score -= 20;
        }
        
        // Language-specific checks
        if (/\b(code|script|program|function)\b/i.test(promptText)) {
            if (!foundConstraints.language) {
                issues.push('Code requested but no language/version specified');
                recommendations.push('Add language and version (e.g., Python 3.10+)');
                score -= 15;
            }
            
            if (!foundConstraints.length) {
                recommendations.push('Consider adding length constraint (e.g., under 100 lines)');
            }
            
            if (!foundConstraints.libraries) {
                recommendations.push('Specify library constraints (e.g., stdlib only, or specific packages)');
            }
        }
        
        // Check for "what NOT to do"
        const hasNegativeConstraints = /\b(no|don't|avoid|without|never|must not)\b/i.test(promptText);
        if (!hasNegativeConstraints) {
            issues.push('No negative constraints (what NOT to do)');
            recommendations.push('Add constraints about what to avoid');
            score -= 10;
        }
        
        return {
            score: Math.max(0, Math.min(100, score)),
            passed: score >= 70,
            issues,
            recommendations,
            metrics: {
                constraintTypes: Object.keys(foundConstraints).filter(k => foundConstraints[k]),
                hasNegativeConstraints
            }
        };
    }

    /**
     * L - Validate "Logical Structure"
     * @param {string} promptText - Prompt to validate
     * @returns {object} - Validation result
     */
    validateLogicalStructure(promptText) {
        const issues = [];
        const recommendations = [];
        let score = 0;
        
        // Check for section markers
        const sections = {
            task: /\b(TASK|GOAL|OBJECTIVE):/i,
            input: /\b(INPUT|CONTEXT|GIVEN):/i,
            constraints: /\b(CONSTRAINT|REQUIREMENT|LIMITATION)S?:/i,
            output: /\b(OUTPUT|RESULT|DELIVER|FORMAT):/i,
            verify: /\b(VERIFY|TEST|CHECK|SUCCESS CRITERIA):/i
        };
        
        const foundSections = {};
        Object.entries(sections).forEach(([name, pattern]) => {
            foundSections[name] = pattern.test(promptText);
            if (foundSections[name]) {
                score += 20;
            }
        });
        
        const sectionCount = Object.values(foundSections).filter(Boolean).length;
        
        if (sectionCount === 0) {
            issues.push('No structured sections found');
            recommendations.push('Use KERNEL structure: TASK, INPUT, CONSTRAINTS, OUTPUT, VERIFY');
            score = 20; // Some credit for effort
        } else if (sectionCount < 3) {
            issues.push(`Only ${sectionCount} sections found (need 5 for full KERNEL)`);
            recommendations.push('Add missing sections for complete structure');
        } else if (sectionCount < 5) {
            issues.push('Missing some KERNEL sections');
            const missing = Object.keys(foundSections).filter(k => !foundSections[k]);
            recommendations.push(`Add sections: ${missing.join(', ').toUpperCase()}`);
        }
        
        // Check for logical flow
        const hasOrderedSections = /TASK.*INPUT.*CONSTRAINT.*OUTPUT.*VERIFY/is.test(promptText);
        if (foundSections.task && foundSections.output && !hasOrderedSections) {
            issues.push('Sections not in logical order');
            recommendations.push('Order: TASK → INPUT → CONSTRAINTS → OUTPUT → VERIFY');
            score -= 10;
        }
        
        return {
            score: Math.max(0, Math.min(100, score)),
            passed: score >= 70,
            issues,
            recommendations,
            metrics: {
                sectionCount,
                foundSections: Object.keys(foundSections).filter(k => foundSections[k]),
                hasLogicalOrder: hasOrderedSections
            }
        };
    }

    /**
     * Calculate complexity score
     * @param {string} promptText - Prompt to analyze
     * @returns {string} - Complexity level
     */
    calculateComplexity(promptText) {
        const words = promptText.split(/\s+/).length;
        const sentences = promptText.split(/[.!?]+/).filter(s => s.trim()).length;
        const avgWordsPerSentence = words / sentences;
        
        if (avgWordsPerSentence > 30 || words > 500) return 'high';
        if (avgWordsPerSentence > 20 || words > 300) return 'medium';
        return 'low';
    }

    /**
     * Calculate readability score (simplified Flesch-Kincaid)
     * @param {string} promptText - Prompt to analyze
     * @returns {number} - Readability score (0-100, higher is easier)
     */
    calculateReadability(promptText) {
        const words = promptText.split(/\s+/).length;
        const sentences = promptText.split(/[.!?]+/).filter(s => s.trim()).length;
        const syllables = this.countSyllables(promptText);
        
        // Simplified Flesch Reading Ease
        const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Count syllables in text (approximation)
     * @param {string} text - Text to analyze
     * @returns {number} - Syllable count
     */
    countSyllables(text) {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        return words.reduce((count, word) => {
            // Simple syllable counting (not perfect but good enough)
            const matches = word.match(/[aeiouy]+/g);
            return count + (matches ? matches.length : 1);
        }, 0);
    }

    /**
     * Get grade letter for score
     * @param {number} score - Score (0-100)
     * @returns {string} - Letter grade
     */
    getGrade(score) {
        if (score >= this.thresholds.excellent) return 'A (Excellent)';
        if (score >= this.thresholds.good) return 'B (Good)';
        if (score >= this.thresholds.acceptable) return 'C (Acceptable)';
        if (score >= this.thresholds.needsWork) return 'D (Needs Work)';
        return 'F (Poor)';
    }

    /**
     * Generate detailed report
     * @param {object} validation - Validation results
     * @returns {string} - Formatted report
     */
    generateReport(validation) {
        let report = '=== KERNEL VALIDATION REPORT ===\n\n';
        
        report += `Overall Score: ${validation.overall.score}/100\n`;
        report += `Grade: ${validation.overall.grade}\n`;
        report += `Status: ${validation.overall.passed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}\n\n`;
        
        report += '--- PRINCIPLE SCORES ---\n';
        Object.entries(validation.principles).forEach(([name, result]) => {
            const emoji = result.passed ? '✅' : '❌';
            report += `${emoji} ${name}: ${result.score}/100\n`;
            if (result.issues.length > 0) {
                result.issues.forEach(issue => {
                    report += `   - ${issue}\n`;
                });
            }
        });
        
        if (validation.recommendations.length > 0) {
            report += '\n--- RECOMMENDATIONS ---\n';
            validation.recommendations.forEach((rec, i) => {
                report += `${i + 1}. ${rec}\n`;
            });
        }
        
        report += '\n--- METRICS ---\n';
        report += `Estimated Tokens: ${validation.metrics.estimatedTokens}\n`;
        report += `Complexity: ${validation.metrics.complexity}\n`;
        report += `Readability: ${validation.metrics.readability}/100\n`;
        
        return report;
    }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KernelValidator;
}
if (typeof window !== 'undefined') {
    window.KernelValidator = KernelValidator;
}
