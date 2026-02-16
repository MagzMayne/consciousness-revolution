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
 * File: local-llm-engine.js
 * Declaration ID: IP-620C854D-MLL28ZW1
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * Local LLM Engine for BarbrickDesign Certification Academy
 * Provides intelligent, context-aware responses using a local knowledge base
 * No API key required - works completely offline
 * 
 * Features:
 * - Comprehensive knowledge base covering all certification domains
 * - Intelligent keyword matching and context awareness
 * - Conversation history tracking for coherent responses
 * - Fallback to pattern-based responses
 * - Learning from user interactions
 * 
 * @version 1.0.0
 * @author BarbrickDesign Platform Team
 */

class LocalLLMEngine {
    constructor() {
        this.knowledgeBase = null;
        this.conversationHistory = [];
        this.userContext = {
            currentSection: 'home',
            topics: new Set(),
            questionsAsked: 0,
            lastInteraction: null
        };
        this.initialized = false;
        this.confidenceThreshold = 0.3; // Minimum match score to consider a response relevant
    }

    /**
     * Initialize the engine and load knowledge base
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            // Determine the correct path for the knowledge base
            // Try multiple paths to handle different deployment scenarios
            const possiblePaths = [
                '/src/ai/local-knowledge-base.json',
                './src/ai/local-knowledge-base.json',
                '../src/ai/local-knowledge-base.json',
                'src/ai/local-knowledge-base.json'
            ];
            
            let response = null;
            let loadedFrom = null;
            
            // Try each path until one works
            for (const path of possiblePaths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        loadedFrom = path;
                        break;
                    }
                } catch (e) {
                    // Continue to next path
                    continue;
                }
            }
            
            if (!response || !response.ok) {
                throw new Error('Failed to load knowledge base from any path');
            }
            
            this.knowledgeBase = await response.json();
            this.initialized = true;
            console.log('✅ Local LLM Engine initialized with knowledge base v' + this.knowledgeBase.version);
            console.log('📁 Loaded from:', loadedFrom);
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Local LLM Engine:', error);
            // Create a minimal fallback knowledge base
            this.knowledgeBase = this.createFallbackKnowledgeBase();
            this.initialized = true;
            return false;
        }
    }

    /**
     * Create a minimal fallback knowledge base if loading fails
     */
    createFallbackKnowledgeBase() {
        return {
            version: '1.0.0-fallback',
            categories: {},
            contextAwareResponses: {
                greeting: ["Hello! I'm here to help you with your certification journey."],
                fallback: ["I'm experiencing some technical difficulties. Let me try to help you anyway!"],
                encouragement: ["Keep going! You're making great progress."]
            },
            quickAnswers: {}
        };
    }

    /**
     * Generate a response to user input
     */
    async generateResponse(userInput, context = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        // Update user context
        this.updateContext(userInput, context);

        // Track conversation
        this.conversationHistory.push({
            role: 'user',
            content: userInput,
            timestamp: new Date().toISOString()
        });

        // Check for quick answers first
        const quickAnswer = this.findQuickAnswer(userInput);
        if (quickAnswer) {
            const response = this.enhanceResponse(quickAnswer, context);
            this.trackResponse(response);
            return response;
        }

        // Find relevant knowledge
        const relevantKnowledge = this.findRelevantKnowledge(userInput);
        
        if (relevantKnowledge.confidence > this.confidenceThreshold) {
            const response = this.constructResponse(relevantKnowledge, userInput, context);
            this.trackResponse(response);
            return response;
        }

        // Fallback to general response
        const fallbackResponse = this.getFallbackResponse(userInput, context);
        this.trackResponse(fallbackResponse);
        return fallbackResponse;
    }

    /**
     * Update user context based on input and external context
     */
    updateContext(userInput, context) {
        // Update current section if provided
        if (context.currentSection) {
            this.userContext.currentSection = context.currentSection;
        }

        // Extract topics from user input
        const inputLower = userInput.toLowerCase();
        const categories = Object.keys(this.knowledgeBase.categories || {});
        
        for (const category of categories) {
            if (inputLower.includes(category) || inputLower.includes(category.replace('_', ' '))) {
                this.userContext.topics.add(category);
            }
        }

        this.userContext.questionsAsked++;
        this.userContext.lastInteraction = new Date().toISOString();
    }

    /**
     * Find quick answer if input matches predefined questions
     */
    findQuickAnswer(userInput) {
        const quickAnswers = this.knowledgeBase.quickAnswers || {};
        const inputLower = userInput.toLowerCase().trim();

        // Direct match
        for (const [question, answer] of Object.entries(quickAnswers)) {
            if (inputLower === question.toLowerCase()) {
                return answer;
            }
        }

        // Fuzzy match - check if input contains most words from question
        for (const [question, answer] of Object.entries(quickAnswers)) {
            const questionWords = question.toLowerCase().split(/\s+/);
            const matchCount = questionWords.filter(word => 
                inputLower.includes(word) && word.length > 3
            ).length;
            
            if (matchCount >= Math.floor(questionWords.length * 0.6)) {
                return answer;
            }
        }

        return null;
    }

    /**
     * Find relevant knowledge from the knowledge base
     */
    findRelevantKnowledge(userInput) {
        const inputLower = userInput.toLowerCase();
        const words = inputLower.split(/\s+/).filter(w => w.length > 3);
        
        let bestMatch = {
            confidence: 0,
            category: null,
            topic: null,
            responses: []
        };

        // Search through all categories and topics
        const categories = this.knowledgeBase.categories || {};
        
        for (const [categoryId, category] of Object.entries(categories)) {
            const topics = category.topics || {};
            
            for (const [topicId, topic] of Object.entries(topics)) {
                const keywords = topic.keywords || [];
                
                // Calculate match score
                let matchScore = 0;
                let keywordMatches = 0;
                
                for (const keyword of keywords) {
                    const keywordWords = keyword.split(/\s+/);
                    
                    // Check if all words of the keyword appear in input
                    const allWordsMatch = keywordWords.every(kw => 
                        inputLower.includes(kw.toLowerCase())
                    );
                    
                    if (allWordsMatch) {
                        keywordMatches++;
                        matchScore += keywordWords.length; // Longer keywords get more weight
                    }
                }
                
                // Normalize score
                const confidence = keywords.length > 0 
                    ? (matchScore / (keywords.length * 2)) 
                    : 0;
                
                if (confidence > bestMatch.confidence) {
                    bestMatch = {
                        confidence: confidence,
                        category: categoryId,
                        categoryName: category.name,
                        topic: topicId,
                        responses: topic.responses || [],
                        keywordMatches: keywordMatches
                    };
                }
            }
        }

        return bestMatch;
    }

    /**
     * Construct a response from relevant knowledge
     */
    constructResponse(knowledge, userInput, context) {
        if (!knowledge.responses || knowledge.responses.length === 0) {
            return this.getFallbackResponse(userInput, context);
        }

        // Select response based on conversation history
        // Avoid repeating the same response
        const usedResponses = this.conversationHistory
            .filter(msg => msg.role === 'assistant')
            .map(msg => msg.content);
        
        let selectedResponse = null;
        
        for (const response of knowledge.responses) {
            if (!usedResponses.includes(response)) {
                selectedResponse = response;
                break;
            }
        }
        
        // If all responses were used, pick a random one
        if (!selectedResponse) {
            selectedResponse = knowledge.responses[
                Math.floor(Math.random() * knowledge.responses.length)
            ];
        }

        // Add context-aware prefix if this is a follow-up question
        if (this.userContext.questionsAsked > 1) {
            const prefixes = [
                "Great question! ",
                "Let me explain: ",
                "Here's what you need to know: ",
                "Good thinking! ",
                "That's an important topic. "
            ];
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            selectedResponse = prefix + selectedResponse;
        }

        // Add encouragement occasionally
        if (this.userContext.questionsAsked % 5 === 0) {
            const encouragements = this.knowledgeBase.contextAwareResponses?.encouragement || [];
            if (encouragements.length > 0) {
                const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
                selectedResponse += "\n\n" + encouragement;
            }
        }

        return selectedResponse;
    }

    /**
     * Get fallback response when no good match is found
     */
    getFallbackResponse(userInput, context) {
        const fallbacks = this.knowledgeBase.contextAwareResponses?.fallback || [
            "I'm not sure I understand that question completely. Could you rephrase it or provide more context?"
        ];

        let response = fallbacks[Math.floor(Math.random() * fallbacks.length)];

        // Add helpful suggestion based on current section
        const sectionSuggestions = {
            home: "You might want to explore our certification tracks or ask about specific topics like Scrum, Cloud, AI, or Security.",
            courses: "I can help you understand the differences between certifications, their content, and which one might be right for you.",
            learning: "Feel free to ask me to explain any concept you're learning about. I'm here to break down complex topics!",
            exams: "I can provide exam strategies, explain the format, or help you understand what to expect.",
            projects: "I can guide you through project requirements, suggest approaches, or explain how projects relate to certifications.",
            payments: "I can explain our pricing tiers, what's included in each, or help you choose the right option."
        };

        const suggestion = sectionSuggestions[context.currentSection || this.userContext.currentSection];
        if (suggestion) {
            response += " " + suggestion;
        }

        return response;
    }

    /**
     * Track response in conversation history
     */
    trackResponse(response) {
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });

        // Keep conversation history manageable (last 20 messages)
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    /**
     * Enhance response with dynamic information
     */
    enhanceResponse(response, context) {
        // Replace placeholders with actual values if provided
        if (context.userName) {
            response = response.replace(/\{userName\}/g, context.userName);
        }
        
        if (context.userLevel) {
            response = response.replace(/\{userLevel\}/g, context.userLevel);
        }

        return response;
    }

    /**
     * Get greeting message
     */
    getGreeting(context = {}) {
        const greetings = this.knowledgeBase.contextAwareResponses?.greeting || [
            "Hello! How can I help you today?"
        ];
        
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        return this.enhanceResponse(greeting, context);
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        this.userContext.questionsAsked = 0;
        this.userContext.topics.clear();
    }

    /**
     * Get statistics about the knowledge base
     */
    getStats() {
        let totalTopics = 0;
        let totalResponses = 0;
        let totalKeywords = 0;

        const categories = this.knowledgeBase.categories || {};
        
        for (const category of Object.values(categories)) {
            const topics = category.topics || {};
            totalTopics += Object.keys(topics).length;
            
            for (const topic of Object.values(topics)) {
                totalResponses += (topic.responses || []).length;
                totalKeywords += (topic.keywords || []).length;
            }
        }

        return {
            version: this.knowledgeBase.version,
            categories: Object.keys(categories).length,
            topics: totalTopics,
            responses: totalResponses,
            keywords: totalKeywords,
            quickAnswers: Object.keys(this.knowledgeBase.quickAnswers || {}).length,
            conversationLength: this.conversationHistory.length,
            questionsAnswered: this.userContext.questionsAsked
        };
    }

    /**
     * Export conversation history
     */
    exportHistory() {
        return {
            history: this.conversationHistory,
            context: {
                currentSection: this.userContext.currentSection,
                topics: Array.from(this.userContext.topics),
                questionsAsked: this.userContext.questionsAsked,
                lastInteraction: this.userContext.lastInteraction
            }
        };
    }
}

// Create and export global instance
if (typeof window !== 'undefined') {
    window.LocalLLMEngine = LocalLLMEngine;
    window.localLLMEngine = new LocalLLMEngine();
    
    // Auto-initialize on load
    if (document.readyState === 'complete') {
        window.localLLMEngine.initialize();
    } else {
        window.addEventListener('load', () => {
            window.localLLMEngine.initialize();
        });
    }
    
    console.log('🧠 Local LLM Engine loaded');
    console.log('💡 Type localLLMEngine.getStats() to see knowledge base statistics');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalLLMEngine;
}
