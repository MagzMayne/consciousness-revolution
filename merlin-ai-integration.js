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
 * File: merlin-ai-integration.js
 * Declaration ID: IP-5272F612-MLL28ZVI
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

// ═════════════════════════════════════════════════════════════════════════════
// MERLIN AI - GEMINI INTEGRATION FOR GEMBOT 🧙‍♂️
// ═════════════════════════════════════════════════════════════════════════════
// Powered by Google Gemini 1.5 Flash via Genkit
// Owner: Ryan Barbrick / Barbrick Design
// Contact: BarbrickDesign@gmail.com
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Merlin AI - The Brain Behind Repository Valuation
 * Uses Google Gemini AI to provide intelligent code analysis, suggestions, and insights
 */
window.merlinAI = {
    // Configuration
    apiKey: 'AIzaSyCKuf5EVZ-ldHErhG3OkIw9Zz6jb_w3nMc',
    model: 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1',  // FIXED: Changed from v1beta to v1
    isInitialized: false,
    
    // Telemetry & Metrics
    telemetry: {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metrics: [],
        enabled: true
    },
    
    // Payment Configuration (GBUV)
    payment: {
        enabled: true,
        treasuryWallet: '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk',
        prices: {
            analyzeCodeFlow: 5,              // 5 GBUV per file analysis
            summarizeRepositoryFlow: 25,      // 25 GBUV per repo summary
            suggestFixFlow: 10,               // 10 GBUV per fix suggestion
            predictValueImpactFlow: 15,       // 15 GBUV per value prediction
            compareRepositoriesFlow: 20,      // 20 GBUV per comparison
            helloFlow: 1                      // 1 GBUV per connection test
        },
        totalCollected: 0,
        transactions: []
    },
    
    /**
     * Speak a message using text-to-speech (connects to Merlin card)
     * @param {string} message - The message to speak
     */
    speak(message) {
        console.log('🧙‍♂️ Merlin speaks:', message);
        // Use the Merlin 3D card's speak if available
        if (window.merlin && typeof window.merlin.speak === 'function') {
            window.merlin.speak(message);
        } else if (window.speechSynthesis) {
            // Fallback to browser speech synthesis
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 0.7;
            // Try to find a male voice
            const voices = window.speechSynthesis.getVoices();
            const maleVoice = voices.find(v => 
                v.name.toLowerCase().includes('david') ||
                v.name.toLowerCase().includes('daniel') ||
                v.name.toLowerCase().includes('mark')
            );
            if (maleVoice) utterance.voice = maleVoice;
            window.speechSynthesis.speak(utterance);
        }
        // Also dispatch event for UI components
        window.dispatchEvent(new CustomEvent('merlin-speak', { detail: { message } }));
    },
    
    /**
     * Ask Merlin AI a question
     * @param {string} question - The question to ask
     * @returns {Promise<string>} - The response
     */
    async askQuestion(question) {
        console.log('🧙‍♂️ Question for Merlin:', question);
        try {
            const response = await this.generate(`You are Merlin, a wise wizard who helps with gemstones and lapidary. Answer this question: ${question}`);
            if (response && response.text) {
                this.speak(response.text);
                return response.text;
            }
            return 'I could not process that question at this time.';
        } catch (error) {
            console.error('Merlin askQuestion error:', error);
            return 'My crystal ball is cloudy. Please try again.';
        }
    },
    
    /**
     * Initialize Merlin AI System
     */
    async initialize() {
        try {
            console.log('🧙‍♂️ Initializing Merlin AI...');
            
            // Test connection
            const response = await this.generate('Hello! Please respond with "Merlin AI online" if you can hear me.');
            
            if (response.text) {
                this.isInitialized = true;
                console.log('✅ Merlin AI initialized successfully');
                console.log('🧙‍♂️ Merlin says:', response.text);
                console.log('💰 Payment System: Enabled (GBUV tokens required)');
                console.log('💎 Treasury Wallet:', this.payment.treasuryWallet);
                return true;
            }
            
            throw new Error('No response from Gemini API');
        } catch (error) {
            console.error('❌ Merlin AI initialization failed:', error);
            return false;
        }
    },
    
    /**
     * Verify user has sufficient GBUV balance for operation
     * @param {string} flowName - Name of the AI flow
     * @param {string} userPublicKey - User's Solana wallet public key
     * @returns {object} - {success: boolean, balance: number, required: number, message: string}
     */
    async verifyPayment(flowName, userPublicKey) {
        if (!this.payment.enabled) {
            return { success: true, message: 'Payment system disabled' };
        }
        
        const cost = this.payment.prices[flowName] || 0;
        
        if (cost === 0) {
            return { success: true, message: 'Free operation' };
        }
        
        try {
            // Get user's wallet
            const wallet = window.walletFactory?.getWallet(userPublicKey);
            
            if (!wallet) {
                return {
                    success: false,
                    required: cost,
                    balance: 0,
                    message: `❌ Wallet not found. Please log in or create an account.`
                };
            }
            
            const balance = wallet.gbuvBalance || 0;
            
            if (balance < cost) {
                return {
                    success: false,
                    required: cost,
                    balance: balance,
                    message: `❌ Insufficient GBUV. Required: ${cost} GBUV, Balance: ${balance} GBUV`
                };
            }
            
            return {
                success: true,
                required: cost,
                balance: balance,
                message: `✅ Payment verified: ${cost} GBUV`
            };
            
        } catch (error) {
            console.error('Payment verification error:', error);
            return {
                success: false,
                message: `❌ Payment verification failed: ${error.message}`
            };
        }
    },
    
    /**
     * Process GBUV payment for AI operation
     * @param {string} flowName - Name of the AI flow
     * @param {string} userPublicKey - User's Solana wallet public key
     * @returns {object} - {success: boolean, transactionId: string, message: string}
     */
    async processPayment(flowName, userPublicKey) {
        if (!this.payment.enabled) {
            return { success: true, message: 'Payment system disabled' };
        }
        
        const cost = this.payment.prices[flowName] || 0;
        
        if (cost === 0) {
            return { success: true, message: 'Free operation' };
        }
        
        try {
            // Transfer GBUV to treasury
            const result = await window.walletFactory?.transferGBUV(
                userPublicKey,
                this.payment.treasuryWallet,
                cost
            );
            
            if (!result) {
                throw new Error('Transfer failed');
            }
            
            // Record transaction
            const transaction = {
                id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                flowName: flowName,
                from: userPublicKey,
                to: this.payment.treasuryWallet,
                amount: cost,
                timestamp: new Date().toISOString(),
                sessionId: this.telemetry.sessionId
            };
            
            this.payment.transactions.push(transaction);
            this.payment.totalCollected += cost;
            
            // Save to Firebase
            if (window.firebaseDb && window.firestoreUtils) {
                const { doc, collection, setDoc } = window.firestoreUtils;
                const txDoc = doc(collection(window.firebaseDb, 'merlin_payments'), transaction.id);
                await setDoc(txDoc, transaction);
            }
            
            console.log(`💰 Payment processed: ${cost} GBUV for ${flowName}`);
            console.log(`📊 Total collected: ${this.payment.totalCollected} GBUV`);
            
            return {
                success: true,
                transactionId: transaction.id,
                amount: cost,
                message: `✅ Paid ${cost} GBUV for ${flowName}`
            };
            
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                message: `❌ Payment failed: ${error.message}`
            };
        }
    },
    
    /**
     * Log Telemetry Metric to Firebase
     * @param {string} flowName - Name of the flow (e.g., "analyzeCodeFlow")
     * @param {number} duration - Duration in milliseconds
     * @param {boolean} success - Whether the operation succeeded
     * @param {object} metadata - Additional metadata
     */
    async logTelemetry(flowName, duration, success, metadata = {}) {
        if (!this.telemetry.enabled) return;
        
        const metric = {
            sessionId: this.telemetry.sessionId,
            flowName: flowName,
            model: this.model,
            duration: duration,
            success: success,
            timestamp: new Date().toISOString(),
            ...metadata
        };
        
        this.telemetry.metrics.push(metric);
        
        // Log to Firebase if available
        try {
            if (window.firebaseDb && window.firestoreUtils) {
                const { collection, doc, setDoc } = window.firestoreUtils;
                const telemetryDoc = doc(collection(window.firebaseDb, 'merlin_telemetry'));
                await setDoc(telemetryDoc, {
                    ...metric,
                    serverTimestamp: window.firestoreUtils.serverTimestamp()
                });
                console.log(`📊 Telemetry logged: ${flowName} (${duration}ms)`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to log telemetry to Firebase:', error.message);
        }
    },
    
    /**
     * Core Generation Function - Calls Gemini API
     * @param {string} prompt - The prompt to send to Gemini
     * @param {object} options - Generation options (temperature, maxTokens, etc.)
     * @returns {Promise<object>} - {text, model, timestamp, error?}
     */
    async generate(prompt, options = {}) {
        const startTime = Date.now();
        
        try {
            const response = await fetch(
                `${this.endpoint}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: options.temperature || 0.7,
                            maxOutputTokens: options.maxTokens || 2048,
                            topP: options.topP || 0.95,
                            topK: options.topK || 40
                        }
                    })
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                const result = {
                    text: data.candidates[0].content.parts[0].text,
                    model: this.model,
                    timestamp: new Date().toISOString(),
                    usage: data.usageMetadata,
                    duration: Date.now() - startTime
                };
                
                // Log telemetry
                await this.logTelemetry('generate', result.duration, true, {
                    promptLength: prompt.length,
                    responseLength: result.text.length,
                    tokens: data.usageMetadata?.totalTokenCount || 0
                });
                
                return result;
            }
            
            throw new Error('No candidates in response');
        } catch (error) {
            console.error('❌ Merlin AI Generation Error:', error);
            
            // Log error telemetry
            await this.logTelemetry('generate', Date.now() - startTime, false, {
                error: error.message
            });
            
            return {
                text: '',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    },
    
    /**
     * FLOW: Analyze Code File
     * Provides quality assessment, suggestions, and improvement estimates
     * COST: 5 GBUV per analysis
     * @param {object} nodeData - {name, language, metrics, value, functions}
     * @param {string} userPublicKey - User's Solana wallet public key
     * @returns {Promise<object>} - {quality, suggestions, security, performance, refactorHours, payment}
     */
    async analyzeCodeFlow(nodeData, userPublicKey) {
        // Verify and process payment
        const paymentCheck = await this.verifyPayment('analyzeCodeFlow', userPublicKey);
        if (!paymentCheck.success) {
            console.error('🚫', paymentCheck.message);
            return {
                error: 'PAYMENT_REQUIRED',
                message: paymentCheck.message,
                cost: paymentCheck.required,
                balance: paymentCheck.balance
            };
        }
        
        const payment = await this.processPayment('analyzeCodeFlow', userPublicKey);
        if (!payment.success) {
            console.error('🚫', payment.message);
            return {
                error: 'PAYMENT_FAILED',
                message: payment.message
            };
        }
        
        console.log('✅ Payment processed:', payment.message);
        const startTime = Date.now();
        const prompt = `You are Merlin, an expert code analyst for the GemBot repository valuation system.

Analyze this code file and provide a comprehensive assessment:

📄 FILE: ${nodeData.name}
💻 LANGUAGE: ${nodeData.language || 'Unknown'}
📊 METRICS:
- Lines of Code: ${nodeData.metrics?.lines || 0}
- Functions: ${nodeData.metrics?.functions || 0}
- Classes: ${nodeData.metrics?.classes || 0}
- Complexity Score: ${nodeData.metrics?.complexity || 0}
- Comments: ${nodeData.metrics?.comments || 0}
💰 CALCULATED VALUE: $${nodeData.value?.toFixed(2) || 0}

Please provide your analysis in the following JSON format (no markdown, just pure JSON):

{
  "quality": <number 1-10>,
  "qualityReason": "<brief explanation>",
  "suggestions": [
    "<specific actionable improvement 1>",
    "<specific actionable improvement 2>",
    "<specific actionable improvement 3>"
  ],
  "security": [
    "<security concern 1 if any>",
    "<security concern 2 if any>"
  ],
  "performance": [
    "<performance optimization 1>",
    "<performance optimization 2>"
  ],
  "refactorHours": <estimated hours to implement all suggestions>,
  "strengths": [
    "<what this file does well>"
  ],
  "valueAccuracy": "<is the $${nodeData.value?.toFixed(2)} valuation fair, too high, or too low?>"
}`;

        const response = await this.generate(prompt, { temperature: 0.3, maxTokens: 1500 });
        
        try {
            // Extract JSON from response (handle markdown code blocks)
            let text = response.text.trim();
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            if (jsonMatch) text = jsonMatch[1];
            
            const result = {
                ...parsed,
                rawResponse: response.text,
                model: response.model,
                timestamp: response.timestamp
            };
            
            // Log telemetry
            await this.logTelemetry('analyzeCodeFlow', Date.now() - startTime, true, {
                fileName: nodeData.name,
                language: nodeData.language,
                quality: parsed.quality,
                linesOfCode: nodeData.metrics?.lines || 0
            });
            
            return result;
        } catch (error) {
            console.warn('⚠️ Could not parse AI response as JSON:', response.text);
            
            // Log error telemetry
            await this.logTelemetry('analyzeCodeFlow', Date.now() - startTime, false, {
                fileName: nodeData.name,
                error: 'Parse error'
            });
            
            console.warn('⚠️ Could not parse AI response as JSON:', response.text);
            // Return fallback structure
            return {
                quality: 5,
                qualityReason: 'Unable to parse AI response',
                suggestions: [response.text.substring(0, 200)],
                security: [],
                performance: [],
                refactorHours: 0,
                strengths: [],
                valueAccuracy: 'Unknown',
                rawResponse: response.text,
                parseError: error.message
            };
        }
    },
    
    /**
     * FLOW: Summarize Entire Repository
     * Provides high-level analysis of architecture, value, and priorities
     * @param {object} repoData - {name, totalValue, totalHours, nodeCount, avgComplexity, topNodes}
     * @returns {Promise<object>} - {text, model, timestamp}
     */
    async summarizeRepositoryFlow(repoData) {
        const topNodesList = repoData.topNodes?.map(n => 
            `  - ${n.name}: $${n.value.toFixed(2)} (${n.metrics?.functions || 0} functions, complexity ${n.metrics?.complexity || 0})`
        ).join('\n') || '  - None';
        
        const prompt = `You are Merlin, the AI brain behind GemBot's repository valuation system. 

Provide a comprehensive analysis of this repository:

📦 REPOSITORY: ${repoData.name || 'Unknown Repository'}
💰 TOTAL VALUE: $${repoData.totalValue?.toFixed(2) || 0}
⏱️ DEVELOPMENT HOURS: ${repoData.totalHours?.toFixed(1) || 0} hours
📊 FILES ANALYZED: ${repoData.nodeCount || 0}
🎯 AVERAGE COMPLEXITY: ${repoData.avgComplexity?.toFixed(1) || 0}

🏆 TOP 10 MOST VALUABLE FILES:
${topNodesList}

Please provide a detailed markdown report with:

## 🎯 Executive Summary
A 2-3 sentence overview of this repository's quality and value.

## 📈 Architecture Quality: X/10
Rate the overall architecture and explain your score.

## 💪 Key Strengths (Top 3)
1. [Strength 1]
2. [Strength 2]
3. [Strength 3]

## ⚠️ Critical Issues (Top 3)
1. [Issue 1 with severity]
2. [Issue 2 with severity]
3. [Issue 3 with severity]

## 🛠️ Technology Stack Assessment
Evaluate the technologies used based on the file extensions and patterns.

## 🚀 Recommended Next Steps (5 Priorities)
1. [Priority 1 with time estimate]
2. [Priority 2 with time estimate]
3. [Priority 3 with time estimate]
4. [Priority 4 with time estimate]
5. [Priority 5 with time estimate]

## 💵 Fair Market Value Estimate
Based on the code quality, complexity, and value calculations:
- **Calculated Value**: $${repoData.totalValue?.toFixed(2) || 0}
- **Fair Market Value**: $[your estimate]
- **Justification**: [explain any difference]

## 🧙‍♂️ Merlin's Final Verdict
Your overall assessment and key takeaway for the development team.`;

        const response = await this.generate(prompt, { temperature: 0.7, maxTokens: 2500 });
        
        // Log telemetry
        await this.logTelemetry('summarizeRepositoryFlow', Date.now() - startTime, !response.error, {
            repository: repoData.name,
            totalValue: repoData.totalValue,
            nodeCount: repoData.nodeCount
        });
        
        return response;
    },
    
    /**
     * FLOW: Suggest Fix for Issue
     * Provides actionable steps to resolve a detected code issue
     * COST: 10 GBUV per fix suggestion
     * @param {object} issue - {type, file, description, metrics}
     * @param {string} userPublicKey - User's Solana wallet public key
     * @returns {Promise<object>} - {text, model, timestamp, payment}
     */
    async suggestFixFlow(issue, userPublicKey) {
        // Verify and process payment
        const paymentCheck = await this.verifyPayment('suggestFixFlow', userPublicKey);
        if (!paymentCheck.success) {
            console.error('🚫', paymentCheck.message);
            return {
                error: 'PAYMENT_REQUIRED',
                message: paymentCheck.message,
                cost: paymentCheck.required,
                balance: paymentCheck.balance
            };
        }
        
        const payment = await this.processPayment('suggestFixFlow', userPublicKey);
        if (!payment.success) {
            console.error('🚫', payment.message);
            return {
                error: 'PAYMENT_FAILED',
                message: payment.message
            };
        }
        
        console.log('✅ Payment processed:', payment.message);
        const startTime = Date.now();
        const prompt = `You are Merlin, a code fix specialist in the GemBot system.

Analyze this issue and provide a detailed fix plan:

🐛 ISSUE TYPE: ${issue.type}
📄 FILE: ${issue.file}
📝 DESCRIPTION: ${issue.description}
📊 CURRENT METRICS: ${JSON.stringify(issue.metrics || {}, null, 2)}

Please provide a structured fix plan in markdown:

## 🔍 Root Cause Analysis
[Explain what's causing this issue]

## 💡 Proposed Solution
[Describe the fix at a high level]

## 🔧 Implementation Steps
1. [Specific step 1]
2. [Specific step 2]
3. [Specific step 3]
...

## 🧪 Testing Approach
- [How to test this fix]
- [Expected outcomes]

## ⏱️ Time Estimate
- **Implementation**: X hours
- **Testing**: Y hours
- **Total**: Z hours

## ⚠️ Risk Assessment
- **Risk Level**: Low/Medium/High
- **Potential Issues**: [any concerns]
- **Rollback Plan**: [if things go wrong]

## 💵 Value Impact
How will this fix improve the repository value?

## 🧙‍♂️ Merlin's Recommendation
Should this be fixed now, later, or not at all?`;

        const response = await this.generate(prompt, { temperature: 0.6, maxTokens: 1800 });
        
        // Log telemetry
        await this.logTelemetry('suggestFixFlow', Date.now() - startTime, !response.error, {
            issueType: issue.type,
            file: issue.file
        });
        
        return response;
    },
    
    /**
     * FLOW: Compare Two Repositories
     * Compares architecture, value, and quality between two repos
     * COST: 20 GBUV per comparison
     * @param {object} repo1Data - First repository data
     * @param {object} repo2Data - Second repository data
     * @param {string} userPublicKey - User's Solana wallet public key
     * @returns {Promise<object>} - {text, model, timestamp, payment}
     */
    async compareRepositoriesFlow(repo1Data, repo2Data, userPublicKey) {
        // Verify and process payment
        const paymentCheck = await this.verifyPayment('compareRepositoriesFlow', userPublicKey);
        if (!paymentCheck.success) {
            console.error('🚫', paymentCheck.message);
            return {
                error: 'PAYMENT_REQUIRED',
                message: paymentCheck.message,
                cost: paymentCheck.required,
                balance: paymentCheck.balance
            };
        }
        
        const payment = await this.processPayment('compareRepositoriesFlow', userPublicKey);
        if (!payment.success) {
            console.error('🚫', payment.message);
            return {
                error: 'PAYMENT_FAILED',
                message: payment.message
            };
        }
        
        console.log('✅ Payment processed:', payment.message);
        const prompt = `You are Merlin, comparing two repositories in the GemBot system.

📦 REPOSITORY 1: ${repo1Data.name}
- Value: $${repo1Data.totalValue?.toFixed(2)}
- Hours: ${repo1Data.totalHours?.toFixed(1)}
- Files: ${repo1Data.nodeCount}
- Avg Complexity: ${repo1Data.avgComplexity?.toFixed(1)}

📦 REPOSITORY 2: ${repo2Data.name}
- Value: $${repo2Data.totalValue?.toFixed(2)}
- Hours: ${repo2Data.totalHours?.toFixed(1)}
- Files: ${repo2Data.nodeCount}
- Avg Complexity: ${repo2Data.avgComplexity?.toFixed(1)}

Provide a comparative analysis:

## 📊 Side-by-Side Comparison
| Metric | ${repo1Data.name} | ${repo2Data.name} | Winner |
|--------|---------|---------|--------|
| Total Value | $${repo1Data.totalValue?.toFixed(2)} | $${repo2Data.totalValue?.toFixed(2)} | [which one] |
| Code Quality | [score/10] | [score/10] | [which one] |
| Complexity | [assessment] | [assessment] | [which one] |
| Documentation | [assessment] | [assessment] | [which one] |

## 🏆 Overall Winner
[Which repository is better and why]

## 💡 Recommendations
- For ${repo1Data.name}: [key improvement]
- For ${repo2Data.name}: [key improvement]`;

        const response = await this.generate(prompt, { temperature: 0.7, maxTokens: 2000 });
        return response;
    },
    
    /**
     * FLOW: Predict Value After Changes
     * Estimates how proposed changes will affect repository value
     * COST: 15 GBUV per prediction
     * @param {object} currentRepo - Current repository state
     * @param {array} proposedChanges - List of changes to make
     * @param {string} userPublicKey - User's Solana wallet public key
     * @returns {Promise<object>} - {text, model, timestamp, payment}
     */
    async predictValueImpactFlow(currentRepo, proposedChanges, userPublicKey) {
        // Verify and process payment
        const paymentCheck = await this.verifyPayment('predictValueImpactFlow', userPublicKey);
        if (!paymentCheck.success) {
            console.error('🚫', paymentCheck.message);
            return {
                error: 'PAYMENT_REQUIRED',
                message: paymentCheck.message,
                cost: paymentCheck.required,
                balance: paymentCheck.balance
            };
        }
        
        const payment = await this.processPayment('predictValueImpactFlow', userPublicKey);
        if (!payment.success) {
            console.error('🚫', payment.message);
            return {
                error: 'PAYMENT_FAILED',
                message: payment.message
            };
        }
        
        console.log('✅ Payment processed:', payment.message);
        const changesList = proposedChanges.map((c, i) => 
            `  ${i + 1}. ${c.description} (${c.estimatedHours} hours)`
        ).join('\n');
        
        const prompt = `You are Merlin, predicting value changes in the GemBot system.

📦 CURRENT STATE:
- Repository: ${currentRepo.name}
- Value: $${currentRepo.totalValue?.toFixed(2)}
- Files: ${currentRepo.nodeCount}

🔧 PROPOSED CHANGES:
${changesList}

Predict the impact:

## 📈 Value Prediction
- **Current Value**: $${currentRepo.totalValue?.toFixed(2)}
- **Predicted New Value**: $[your estimate]
- **Delta**: +$[difference]
- **Confidence**: [percentage]%

## 🎯 Impact by Change
${proposedChanges.map((c, i) => `\n### Change ${i + 1}: ${c.description}\n- Value Impact: $[estimate]\n- Risk: [low/medium/high]\n- Recommendation: [do it / skip it / modify]`).join('\n')}

## 🧙‍♂️ Merlin's Advice
Should you proceed with these changes?`;

        const response = await this.generate(prompt, { temperature: 0.6, maxTokens: 1500 });
        return response;
    },
    
    /**
     * Quick Hello Flow - Test Connection
     * COST: 1 GBUV per test
     * @param {string} name - User's name
     * @param {string} userPublicKey - User's Solana wallet public key
     * @returns {Promise<object>} - {text, model, timestamp, payment}
     */
    async helloFlow(name, userPublicKey) {
        // Verify and process payment
        const paymentCheck = await this.verifyPayment('helloFlow', userPublicKey);
        if (!paymentCheck.success) {
            console.error('🚫', paymentCheck.message);
            return {
                error: 'PAYMENT_REQUIRED',
                message: paymentCheck.message,
                cost: paymentCheck.required,
                balance: paymentCheck.balance
            };
        }
        
        const payment = await this.processPayment('helloFlow', userPublicKey);
        if (!payment.success) {
            console.error('🚫', payment.message);
            return {
                error: 'PAYMENT_FAILED',
                message: payment.message
            };
        }
        
        console.log('✅ Payment processed:', payment.message);
        const startTime = Date.now();
        const prompt = `Hello! I'm ${name} from the GemBot team. You are Merlin AI, the intelligent brain behind our repository valuation system. Please introduce yourself in 2-3 sentences and explain how you help analyze code repositories.`;
        const response = await this.generate(prompt);
        
        // Log telemetry
        await this.logTelemetry('helloFlow', Date.now() - startTime, !response.error, {
            userName: name
        });
        
        return response;
    },
    
    /**
     * Get Telemetry Summary
     * @returns {object} - Summary of all metrics
     */
    getTelemetrySummary() {
        const metrics = this.telemetry.metrics;
        
        return {
            sessionId: this.telemetry.sessionId,
            totalCalls: metrics.length,
            successfulCalls: metrics.filter(m => m.success).length,
            failedCalls: metrics.filter(m => !m.success).length,
            averageDuration: metrics.length > 0 
                ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length 
                : 0,
            totalTokens: metrics.reduce((sum, m) => sum + (m.tokens || 0), 0),
            flowBreakdown: this.getFlowBreakdown(metrics),
            recentMetrics: metrics.slice(-10) // Last 10 calls
        };
    },
    
    /**
     * Get Flow Breakdown
     * @param {array} metrics - Array of metrics
     * @returns {object} - Breakdown by flow
     */
    getFlowBreakdown(metrics) {
        const breakdown = {};
        
        metrics.forEach(metric => {
            if (!breakdown[metric.flowName]) {
                breakdown[metric.flowName] = {
                    count: 0,
                    successCount: 0,
                    failCount: 0,
                    totalDuration: 0,
                    avgDuration: 0
                };
            }
            
            const flow = breakdown[metric.flowName];
            flow.count++;
            if (metric.success) flow.successCount++;
            else flow.failCount++;
            flow.totalDuration += metric.duration;
            flow.avgDuration = flow.totalDuration / flow.count;
        });
        
        return breakdown;
    },
    
    /**
     * Export Telemetry Data
     * @returns {string} - JSON string of all metrics
     */
    exportTelemetry() {
        return JSON.stringify({
            summary: this.getTelemetrySummary(),
            rawMetrics: this.telemetry.metrics
        }, null, 2);
    }
};

// Auto-initialize when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.merlinAI.initialize();
    });
} else {
    window.merlinAI.initialize();
}

console.log('🧙‍♂️ Merlin AI module loaded');
