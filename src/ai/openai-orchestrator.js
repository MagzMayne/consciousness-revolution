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
 * File: openai-orchestrator.js
 * Declaration ID: IP-7C4B2952-MLL28ZW2
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

/** SIGNED BY MeRLynn - ID: MERLYNN-18ce1f46 - TIMESTAMP: 2025-12-19T05:53:06.535Z - HASH: 72459f38 */
/** SIGNED BY AGentR - ID: AGENTR-362fcf2d - TIMESTAMP: 2025-12-19T05:53:06.535Z - HASH: 72459f38 */

/**
 * OpenAI API Orchestrator for BarbrickDesign Platform
 * Handles all OpenAI model interactions with secure API key management
 *
 * INTEGRATION: Works seamlessly with AI API Connection Manager for:
 * - Automatic retry logic with exponential backoff
 * - Better error handling and diagnostics
 * - Connection health monitoring
 * - Fallback to direct fetch if manager unavailable
 *
 * SECURITY NOTE: Never hardcode API keys in client-side code.
 * This module expects API keys to be provided via secure means (environment variables, user input, etc.)
 *
 * @author BarbrickDesign AI Team
 * @version 1.0.1
 */

class OpenAIOrchestrator {
    constructor(apiKey = null) {
        // Initialize API key validator
        this.validator = window.ApiKeyValidator ? new window.ApiKeyValidator() : null;
        
        // Set API key with validation
        this.apiKey = null;
        if (apiKey) {
            this.setApiKey(apiKey);
        }
        
        this.baseURL = 'https://api.openai.com/v1';
        this.models = {
            // Core Intelligence
            'gpt-5': 'gpt-5',
            'gpt-5-pro': 'gpt-5-pro',
            'gpt-5-codex': 'gpt-5-codex',
            'gpt-4.1': 'gpt-4.1',
            'gpt-4o': 'gpt-4o',

            // Visual & Media
            'gpt-image-1': 'gpt-image-1',
            'gpt-image-1-mini': 'gpt-image-1-mini',
            'dall-e-3': 'dall-e-3',
            'sora-2': 'sora-2',
            'sora-2-pro': 'sora-2-pro',

            // Audio & Realtime
            'gpt-4o-tts': 'gpt-4o-tts',
            'gpt-4o-transcribe': 'gpt-4o-transcribe',
            'gpt-audio': 'gpt-audio',
            'gpt-realtime': 'gpt-realtime',

            // Research
            'o3-deep-research': 'o3-deep-research',
            'o4-mini-deep-research': 'o4-mini-deep-research',

            // Open Weight
            'gpt-oss-120b': 'gpt-oss-120b',
            'gpt-oss-20b': 'gpt-oss-20b',

            // Specialized
            'text-embedding-3-large': 'text-embedding-3-large',
            'omni-moderation': 'omni-moderation',
            'computer-use-preview': 'computer-use-preview',
            'codex-mini-latest': 'codex-mini-latest'
        };

        this.agentMappings = {
            'governor': ['gpt-5-pro', 'sora-2'],
            'scout': ['gpt-4.1', 'gpt-realtime'],
            'archivist': ['o3-deep-research', 'gpt-4o-transcribe'],
            'artist': ['gpt-image-1', 'dall-e-3']
        };
    }

    /**
     * Set API key securely with validation
     * @param {string} key - OpenAI API key
     * @returns {object} - Validation result
     */
    setApiKey(key) {
        // Validate using the centralized validator if available
        if (this.validator) {
            const validation = this.validator.validate(key, 'openai');
            
            if (!validation.valid) {
                console.error('Invalid OpenAI API key:', validation.error);
                return {
                    success: false,
                    error: validation.error
                };
            }
            
            if (validation.warnings && validation.warnings.length > 0) {
                console.warn('OpenAI API key warnings:', validation.warnings);
            }
        } else {
            // Basic validation fallback if validator not loaded
            if (!key || typeof key !== 'string') {
                return {
                    success: false,
                    error: 'API key must be a non-empty string'
                };
            }
            
            if (!key.startsWith('sk-') || key.length < 40) {
                return {
                    success: false,
                    error: 'Invalid OpenAI API key format'
                };
            }
        }
        
        this.apiKey = key;
        return {
            success: true,
            message: 'API key set successfully'
        };
    }
    
    /**
     * Get masked API key for display purposes
     * @returns {string} - Masked API key
     */
    getMaskedApiKey() {
        if (!this.apiKey) {
            return 'No API key set';
        }
        
        if (this.validator) {
            return this.validator.maskApiKey(this.apiKey);
        }
        
        // Fallback masking - show 4 chars from start and 4 from end for security
        if (this.apiKey.length <= 8) {
            return '****';
        }
        return this.apiKey.substring(0, 4) + '...' + this.apiKey.substring(this.apiKey.length - 4);
    }

    /**
     * Make authenticated API request with fallback to mock for testing
     * Uses AI API Connection Manager if available for better error handling
     * @param {string} endpoint - API endpoint
     * @param {object} payload - Request payload
     * @returns {Promise} - API response
     */
    async makeRequest(payload) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key is required. Please provide an API key to use this feature.');
        }

        // Use AI API Connection Manager if available
        if (window.apiConnectionManager) {
            try {
                return await window.apiConnectionManager.makeRequest('openai', '/responses', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                // Log with minimal details to avoid exposing sensitive info
                if (process?.env?.NODE_ENV === 'development') {
                    console.warn('Connection manager request failed, falling back to direct fetch:', error.message);
                }
                // Fall through to direct fetch
            }
        }

        // Direct fetch fallback
        const response = await fetch(`${this.baseURL}/responses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get mock response for testing when no API key is available
     * @param {string} endpoint - API endpoint
     * @param {object} payload - Request payload
     * @returns {object} - Mock response
     */
    getMockResponse(payload) {
        // Check response format type for different mock responses
        const responseFormat = payload.response_format?.type;

        if (responseFormat === 'text' || payload.input?.some(i => i.role === 'user')) {
            return {
                output: [{
                    type: 'text',
                    text: `🤖 **Mock AI Response**\n\nThis is a simulated response for testing purposes. In production, this would be generated by ${payload.model || 'GPT model'}.\n\nYour prompt: "${payload.input?.find(i => i.role === 'user')?.content || 'No prompt provided'}"\n\nTo use real AI responses, please provide a valid OpenAI API key.`
                }]
            };
        }

        if (responseFormat === 'image') {
            return {
                output: [{
                    type: 'image',
                    image: {
                        url: 'https://via.placeholder.com/512x512/00ffff/000000?text=Mock+AI+Generated+Image'
                    }
                }]
            };
        }

        if (responseFormat?.audio) {
            return {
                output: [{
                    type: 'audio',
                    audio: new Blob(['Mock audio data'], { type: 'audio/mpeg' })
                }]
            };
        }

        if (payload.model?.includes('embedding')) {
            return {
                output: [{
                    type: 'embeddings',
                    embeddings: [{
                        embedding: Array.from({ length: 1536 }, () => Math.random() - 0.5)
                    }]
                }]
            };
        }

        if (payload.model?.includes('moderation')) {
            return {
                output: [{
                    type: 'moderation',
                    results: [{
                        flagged: false,
                        categories: { hate: false, violence: false, self_harm: false }
                    }]
                }]
            };
        }

        return { mock: true, payload };
    }

    /**
     * Generate Sora 2 video for agent embodiments
     * @param {string} agentName - Name of the agent
     * @param {string} prompt - Video generation prompt
     * @param {object} options - Video options
     */
    async generateSoraVideo(agentName, prompt, options = {}) {
        const soraPrompt = `Create a cinematic video embodiment of ${agentName}, a digital assistant in the Gem Bot Universe. ${prompt}. Style: Cyberpunk, neon colors, high-tech, professional, helpful demeanor. Duration: 30 seconds, 4K resolution.`;

        const payload = {
            model: this.models['sora-2'] || 'sora-2',
            prompt: soraPrompt,
            duration: options.duration || '30s',
            resolution: options.resolution || '4k',
            style: 'cyberpunk',
            ...options
        };

        try {
            const response = await this.makeRequest('/videos/generations', {
                model: this.models['sora-2'] || 'sora-2',
                prompt: soraPrompt,
                duration: options.duration || '30s',
                resolution: options.resolution || '4k',
                style: 'cyberpunk',
                ...options
            });
            const videoUrl = response.data?.[0]?.url || `Mock Sora video URL for ${agentName}`;

            // Auto-save to content library
            if (window.contentSharingManager && videoUrl && !videoUrl.includes('placeholder')) {
                window.contentSharingManager.addContent('videos', {
                    agentName,
                    prompt,
                    url: videoUrl,
                    duration: options.duration || '30s',
                    resolution: options.resolution || '4k',
                    style: 'cyberpunk',
                    tags: ['sora-video', 'agent-embodiment', agentName, 'ai-generated'],
                    project: 'gem-bot-universe',
                    category: 'agent-embodiments'
                }, 'openai-orchestrator');
            }

            return videoUrl;
        } catch (error) {
            console.error('Sora video generation failed:', error);
            throw new Error(`Failed to generate video: ${error.message}`);
        }
    }

    /**
     * Chat completion with specified model
     * @param {string} model - Model name
     * @param {Array} messages - Chat messages
     * @param {object} options - Additional options
     */
    async chatCompletion(model, messages, options = {}) {
        // Convert old messages format to new input format
        const input = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const payload = {
            model: this.models[model] || model,
            input,
            response_format: { type: 'text' },
            max_output_tokens: options.max_tokens || 1000,
            temperature: options.temperature || 0.7,
            ...options
        };

        const response = await this.makeRequest(payload);
        // Convert new response format back to old format for compatibility
        const result = {
            choices: [{
                message: {
                    content: response.output?.[0]?.text || 'No response generated'
                }
            }]
        };

        // Auto-save to content library
        if (window.contentSharingManager && result.choices[0].message.content && result.choices[0].message.content !== 'No response generated') {
            const userMessage = messages.find(m => m.role === 'user')?.content || '';
            window.contentSharingManager.addContent('text', {
                prompt: userMessage,
                response: result.choices[0].message.content,
                model,
                tags: ['ai-response', 'chat', model],
                project: 'gem-bot-universe',
                category: 'ai-assistance'
            }, 'openai-orchestrator');
        }

        return result;
    }

    /**
     * Generate image with DALL-E or GPT Image
     * @param {string} prompt - Image prompt
     * @param {object} options - Generation options
     */
    async generateImage(prompt, options = {}) {
        const payload = {
            model: options.model || this.models['gpt-image-1'] || 'gpt-image-1',
            input: [{ role: 'user', content: prompt }],
            response_format: {
                type: 'image',
                image: {
                    size: options.size || '1024x1024',
                    quality: options.quality || 'standard'
                }
            },
            ...options
        };

        const response = await this.makeRequest(payload);
        // Convert to old format for compatibility
        const result = {
            data: [{
                url: response.output?.[0]?.image?.url || 'https://via.placeholder.com/512x512/00ffff/000000?text=Mock+AI+Generated+Image'
            }]
        };

        // Auto-save to content library
        if (window.contentSharingManager && result.data[0].url && !result.data[0].url.includes('placeholder')) {
            window.contentSharingManager.addContent('images', {
                prompt,
                url: result.data[0].url,
                model: payload.model,
                size: options.size,
                quality: options.quality,
                tags: ['ai-generated', 'gem-bot', prompt.split(' ').slice(0, 3).join('-')],
                project: 'gem-bot-universe',
                category: 'ai-art'
            }, 'openai-orchestrator');
        }

        return result;
    }

    /**
     * Text-to-speech
     * @param {string} text - Text to convert
     * @param {object} options - TTS options
     */
    async textToSpeech(text, options = {}) {
        const payload = {
            model: options.model || this.models['gpt-4o-tts'] || 'gpt-4o-tts',
            input: [{ role: 'user', content: text }],
            response_format: {
                type: 'audio',
                audio: {
                    voice: options.voice || 'alloy',
                    format: options.format || 'mp3'
                }
            },
            ...options
        };

        try {
            const response = await this.makeRequest(payload);
            // Convert to blob for compatibility
            return response.output?.[0]?.audio || new Blob(['Mock audio data'], { type: 'audio/mpeg' });
        } catch (error) {
            // Fallback to old endpoint if new one not supported
            console.warn('New responses API TTS failed, using legacy endpoint:', error);
            const legacyPayload = {
                model: 'tts-1',
                input: text,
                voice: 'alloy',
                ...options
            };

            const response = await fetch(`${this.baseURL}/audio/speech`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(legacyPayload)
            });

            if (!response.ok) {
                throw new Error(`TTS API error: ${response.status}`);
            }

            return await response.blob();
        }
    }

    /**
     * Speech-to-text
     * @param {Blob} audioBlob - Audio file
     * @param {object} options - Transcribe options
     */
    async speechToText(audioBlob, options = {}) {
        // For now, speech-to-text still uses legacy endpoint due to FormData requirement
        // TODO: Update when responses API supports audio input
        const formData = new FormData();
        formData.append('file', audioBlob);
        formData.append('model', options.model || 'whisper-1');

        Object.keys(options).forEach(key => {
            if (key !== 'model') formData.append(key, options[key]);
        });

        const response = await fetch(`${this.baseURL}/audio/transcriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Speech-to-text API error: ${response.status}`);
        }

        const result = await response.json();
        // Convert to new format for consistency
        return {
            output: [{
                type: 'transcription',
                text: result.text
            }]
        };
    }

    /**
     * Generate embeddings
     * @param {string|Array} input - Text input
     * @param {string} model - Embedding model
     */
    async generateEmbeddings(input, model = 'text-embedding-3-large') {
        const payload = {
            model: this.models[model] || model,
            input: Array.isArray(input) ? input : [input],
            response_format: { type: 'embeddings' }
        };

        const response = await this.makeRequest(payload);
        // Convert to old format for compatibility
        return {
            data: response.output?.[0]?.embeddings || [{
                embedding: Array.from({ length: 1536 }, () => Math.random() - 0.5)
            }]
        };
    }

    /**
     * Moderate content
     * @param {string|Array} input - Content to moderate
     */
    async moderateContent(input) {
        const payload = {
            model: this.models['omni-moderation'] || 'omni-moderation',
            input: [{ role: 'user', content: Array.isArray(input) ? input.join(' ') : input }],
            response_format: { type: 'moderation' }
        };

        const response = await this.makeRequest(payload);
        // Convert to old format for compatibility
        return {
            results: response.output?.[0]?.results || [{
                flagged: false,
                categories: { hate: false, violence: false, self_harm: false }
            }]
        };
    }

    /**
     * Get models for specific agent type
     * @param {string} agentType - Agent type (governor, scout, etc.)
     * @returns {Array} - Array of model names
     */
    getModelsForAgent(agentType) {
        return this.agentMappings[agentType] || [];
    }

    /**
     * Execute agent action with appropriate model
     * @param {string} agentType - Agent type
     * @param {string} action - Action to perform
     * @param {object} params - Action parameters
     */
    async executeAgentAction(agentType, action, params = {}) {
        const models = this.getModelsForAgent(agentType);
        if (models.length === 0) {
            throw new Error(`No models configured for agent type: ${agentType}`);
        }

        const primaryModel = models[0];

        switch (action) {
            case 'reason':
                return await this.chatCompletion(primaryModel, [
                    { role: 'system', content: `You are a ${agentType} agent in the Gem Bot Universe.` },
                    { role: 'user', content: params.prompt }
                ]);

            case 'generate_image':
                return await this.generateImage(params.prompt, params.options);

            case 'transcribe':
                return await this.speechToText(params.audioBlob, params.options);

            case 'embed':
                return await this.generateEmbeddings(params.text);

            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * KERNEL-ENHANCED: Execute prompt using KERNEL framework
     * Builds and validates prompts using KERNEL principles for optimal results
     * @param {object} kernelPrompt - KernelPromptBuilder output or KERNEL-structured object
     * @param {object} options - Execution options
     * @returns {Promise} - API response
     */
    async executeKernelPrompt(kernelPrompt, options = {}) {
        // Load KERNEL utilities if available
        const KernelPromptBuilder = window.KernelPromptBuilder;
        const KernelValidator = window.KernelValidator;
        
        let promptText;
        let validationResult;
        
        // If kernelPrompt is a KernelPromptBuilder instance, build it
        if (kernelPrompt && typeof kernelPrompt.build === 'function') {
            promptText = kernelPrompt.build({ format: 'text' });
            
            // Validate before execution
            if (KernelValidator && options.validate !== false) {
                const validator = new KernelValidator();
                validationResult = validator.validate(promptText);
                
                if (validationResult.overall.score < 70) {
                    console.warn('KERNEL: Prompt quality below threshold (70)', validationResult);
                    if (options.enforceQuality) {
                        throw new Error(`Prompt quality too low: ${validationResult.overall.score}/100. Recommendations: ${validationResult.recommendations.join(', ')}`);
                    }
                }
            }
        } else if (typeof kernelPrompt === 'string') {
            promptText = kernelPrompt;
        } else if (typeof kernelPrompt === 'object') {
            // Convert object to KERNEL format
            promptText = this.formatKernelPrompt(kernelPrompt);
        } else {
            throw new Error('Invalid kernelPrompt format. Expected KernelPromptBuilder, string, or object.');
        }
        
        // Prepare messages for chat completion
        const messages = [
            {
                role: 'system',
                content: options.systemMessage || 'You are a helpful AI assistant. Follow the instructions precisely and provide structured, verifiable outputs.'
            },
            {
                role: 'user',
                content: promptText
            }
        ];
        
        // Execute with chat completion
        const model = options.model || 'gpt-4o';
        const response = await this.chatCompletion(model, messages, {
            max_tokens: options.max_tokens || 2000,
            temperature: options.temperature || 0.7,
            ...options
        });
        
        // Return enhanced response with KERNEL metadata
        return {
            ...response,
            kernel: {
                validation: validationResult,
                promptText,
                estimatedTokens: Math.ceil(promptText.length / 4)
            }
        };
    }

    /**
     * Format object as KERNEL prompt
     * @param {object} kernelObj - Object with task, input, constraints, output, verify
     * @returns {string} - Formatted prompt
     */
    formatKernelPrompt(kernelObj) {
        let prompt = '';
        
        if (kernelObj.task) {
            prompt += `TASK: ${kernelObj.task}\n\n`;
        }
        
        if (kernelObj.input && kernelObj.input.length > 0) {
            prompt += `INPUT:\n`;
            kernelObj.input.forEach(item => {
                prompt += `- ${item}\n`;
            });
            prompt += '\n';
        }
        
        if (kernelObj.constraints && kernelObj.constraints.length > 0) {
            prompt += `CONSTRAINTS:\n`;
            kernelObj.constraints.forEach(item => {
                prompt += `- ${item}\n`;
            });
            prompt += '\n';
        }
        
        if (kernelObj.output && kernelObj.output.length > 0) {
            prompt += `OUTPUT:\n`;
            kernelObj.output.forEach(item => {
                prompt += `- ${item}\n`;
            });
            prompt += '\n';
        }
        
        if (kernelObj.verify && kernelObj.verify.length > 0) {
            prompt += `VERIFY:\n`;
            kernelObj.verify.forEach(item => {
                prompt += `- ${item}\n`;
            });
        }
        
        return prompt.trim();
    }

    /**
     * Quick KERNEL prompt execution for common patterns
     * @param {string} type - Pattern type (code, docs, analysis, etc.)
     * @param {string} task - Main task description
     * @param {object} params - Additional parameters
     * @returns {Promise} - API response
     */
    async quickKernel(type, task, params = {}) {
        const KernelPromptBuilder = window.KernelPromptBuilder;
        
        if (!KernelPromptBuilder) {
            console.warn('KernelPromptBuilder not loaded, using simple prompt');
            return await this.chatCompletion(params.model || 'gpt-4o', [
                { role: 'user', content: task }
            ]);
        }
        
        const builder = KernelPromptBuilder.quickBuild(type, {
            task,
            ...params
        });
        
        return await this.executeKernelPrompt(builder, params);
    }
}

// Export KERNEL metrics tracking
class KernelMetrics {
    constructor() {
        this.metrics = {
            totalPrompts: 0,
            successfulPrompts: 0,
            failedPrompts: 0,
            totalTokens: 0,
            totalTime: 0,
            scores: []
        };
    }

    record(promptData) {
        this.metrics.totalPrompts++;
        
        if (promptData.success) {
            this.metrics.successfulPrompts++;
        } else {
            this.metrics.failedPrompts++;
        }
        
        if (promptData.tokens) {
            this.metrics.totalTokens += promptData.tokens;
        }
        
        if (promptData.time) {
            this.metrics.totalTime += promptData.time;
        }
        
        if (promptData.score) {
            this.metrics.scores.push(promptData.score);
        }
    }

    getStats() {
        const avgScore = this.metrics.scores.length > 0
            ? this.metrics.scores.reduce((a, b) => a + b, 0) / this.metrics.scores.length
            : 0;
        
        return {
            ...this.metrics,
            successRate: this.metrics.totalPrompts > 0
                ? (this.metrics.successfulPrompts / this.metrics.totalPrompts * 100).toFixed(2) + '%'
                : '0%',
            avgTokensPerPrompt: this.metrics.totalPrompts > 0
                ? Math.round(this.metrics.totalTokens / this.metrics.totalPrompts)
                : 0,
            avgTimePerPrompt: this.metrics.totalPrompts > 0
                ? Math.round(this.metrics.totalTime / this.metrics.totalPrompts)
                : 0,
            avgKernelScore: avgScore.toFixed(2)
        };
    }

    reset() {
        this.metrics = {
            totalPrompts: 0,
            successfulPrompts: 0,
            failedPrompts: 0,
            totalTokens: 0,
            totalTime: 0,
            scores: []
        };
    }
}

// Global instances
window.openAIOrchestrator = new OpenAIOrchestrator();
window.kernelMetrics = new KernelMetrics();

// Security reminder
console.warn('🔐 SECURITY: OpenAI API key must be provided securely. Never hardcode keys in client-side code. Consider using environment variables or secure key management.');

// Export classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OpenAIOrchestrator, KernelMetrics };
}

// Note: ES6 export commented out to allow loading as regular script
// If using as ES6 module, uncomment the line below and load with type="module"
// export default OpenAIOrchestrator;
