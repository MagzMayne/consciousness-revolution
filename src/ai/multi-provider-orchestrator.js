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
 * File: multi-provider-orchestrator.js
 * Declaration ID: IP-4B595F65-MLL28ZW2
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Multi-Provider AI Orchestrator for BarbrickDesign Platform
 * Supports OpenAI, HuggingFace, and Groq APIs with automatic fallback
 * 
 * Features:
 * - Free tier support for HuggingFace and Groq
 * - Automatic provider fallback (OpenAI → Groq → HuggingFace → Mock)
 * - Unified API interface across all providers
 * - Smart model selection based on task type
 * - Cost optimization (prefer free tiers when available)
 * - Provider health monitoring and automatic switching
 * 
 * @author BarbrickDesign AI Team
 * @version 1.0.0
 */

class MultiProviderAIOrchestrator {
    constructor() {
        this.providers = {
            groq: {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1',
                keyFormat: 'gsk_',
                apiKey: null,
                enabled: false,
                freeTier: true, // 14,400 requests per day free
                priority: 1, // Prioritized for repo-wide orchestration
                models: {
                    chat: [
                        'llama-3.3-70b-versatile',
                        'llama-3.1-8b-instant',
                        'mixtral-8x7b-32768',
                        'gemma2-9b-it'
                    ],
                    image: [], // Not supported yet
                    audio: ['whisper-large-v3'], // Transcription only
                    embeddings: [] // Not supported yet
                }
            },
            openai: {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1',
                keyFormat: 'sk-',
                apiKey: null,
                enabled: false,
                freeTier: false,
                priority: 2, // Highest quality, but paid - now fallback
                models: {
                    chat: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
                    image: ['dall-e-3', 'dall-e-2'],
                    audio: ['tts-1', 'whisper-1'],
                    embeddings: ['text-embedding-3-large', 'text-embedding-3-small']
                }
            },
            huggingface: {
                name: 'HuggingFace',
                baseUrl: 'https://api-inference.huggingface.co/models',
                keyFormat: 'hf_',
                apiKey: null,
                enabled: false,
                freeTier: true, // Free inference API with rate limits
                priority: 3, // Good quality, free tier, slower
                models: {
                    chat: [
                        'meta-llama/Llama-3.2-3B-Instruct',
                        'mistralai/Mistral-7B-Instruct-v0.3',
                        'microsoft/Phi-3.5-mini-instruct',
                        'google/flan-t5-xxl'
                    ],
                    image: [
                        'stabilityai/stable-diffusion-2-1',
                        'stabilityai/stable-diffusion-xl-base-1.0',
                        'runwayml/stable-diffusion-v1-5'
                    ],
                    audio: [
                        'openai/whisper-large-v3',
                        'facebook/mms-tts-eng'
                    ],
                    embeddings: [
                        'sentence-transformers/all-MiniLM-L6-v2',
                        'BAAI/bge-large-en-v1.5'
                    ]
                }
            }
        };

        // Fallback order: prefer free tiers
        this.fallbackOrder = ['groq', 'huggingface', 'openai'];
        
        // Request history for monitoring
        this.requestHistory = [];
        this.maxHistorySize = 100;

        // Load API keys from storage
        this.loadApiKeys();
    }

    /**
     * Load API keys from localStorage and environment
     */
    loadApiKeys() {
        // First, try to load repo-wide GroqAI key from config
        this.loadGroqOrchestratorKey();
        
        // Then load any user-provided keys from localStorage
        Object.keys(this.providers).forEach(provider => {
            // Skip groq if already loaded from config
            if (provider === 'groq' && this.providers.groq.enabled) {
                return;
            }
            
            const key = localStorage.getItem(`${provider}_api_key`);
            if (key && this.validateApiKey(provider, key)) {
                this.setApiKey(provider, key);
            }
        });
    }
    
    /**
     * Load GroqAI orchestrator key from repository config
     */
    async loadGroqOrchestratorKey() {
        try {
            // Try to load from config file
            const response = await fetch('/groq-orchestrator-config.json');
            if (response.ok) {
                const config = await response.json();
                if (config.enabled && config.apiKey) {
                    this.setApiKey('groq', config.apiKey);
                    console.log('✅ GroqAI orchestrator loaded from repo config');
                    return;
                }
            }
        } catch (error) {
            console.warn('Could not load GroqAI config file:', error.message);
        }
        
        // Fallback: Try environment variable
        if (typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY) {
            try {
                this.setApiKey('groq', process.env.GROQ_API_KEY);
                console.log('✅ GroqAI orchestrator loaded from environment');
            } catch (error) {
                console.warn('Failed to set GroqAI key from environment:', error.message);
            }
        }
    }

    /**
     * Validate API key format
     */
    validateApiKey(provider, key) {
        const config = this.providers[provider];
        if (!config) return false;
        
        if (!key || typeof key !== 'string') return false;
        
        // Check key format if specified
        if (config.keyFormat && !key.startsWith(config.keyFormat)) {
            return false;
        }
        
        return true;
    }

    /**
     * Set API key for a provider
     */
    setApiKey(provider, key) {
        if (!this.providers[provider]) {
            throw new Error(`Unknown provider: ${provider}`);
        }

        if (!this.validateApiKey(provider, key)) {
            throw new Error(`Invalid API key format for ${provider}`);
        }

        this.providers[provider].apiKey = key;
        this.providers[provider].enabled = true;
        
        // Save to localStorage
        localStorage.setItem(`${provider}_api_key`, key);

        return {
            success: true,
            message: `${this.providers[provider].name} API key set successfully`
        };
    }

    /**
     * Get available providers for a task type
     */
    getAvailableProviders(taskType = 'chat') {
        const available = [];
        
        Object.entries(this.providers).forEach(([id, config]) => {
            if (config.enabled && config.models[taskType]?.length > 0) {
                available.push({
                    id,
                    name: config.name,
                    freeTier: config.freeTier,
                    priority: config.priority,
                    models: config.models[taskType]
                });
            }
        });

        // Sort by priority (lower number = higher priority)
        // But prefer free tiers when no API keys are set
        available.sort((a, b) => {
            // If both free or both paid, sort by priority
            if (a.freeTier === b.freeTier) {
                return a.priority - b.priority;
            }
            // Prefer free tier
            return a.freeTier ? -1 : 1;
        });

        return available;
    }

    /**
     * Select best provider for a task
     */
    selectProvider(taskType = 'chat', preferFree = true) {
        const available = this.getAvailableProviders(taskType);
        
        if (available.length === 0) {
            return null;
        }

        if (preferFree) {
            // Try free tiers first
            const freeProvider = available.find(p => p.freeTier);
            if (freeProvider) return freeProvider.id;
        }

        // Return highest priority provider
        return available[0].id;
    }

    /**
     * Make a chat completion request
     */
    async chatCompletion(messages, options = {}) {
        const provider = options.provider || this.selectProvider('chat', options.preferFree !== false);
        
        if (!provider) {
            return this.getMockResponse('chat', messages);
        }

        try {
            const result = await this.makeProviderRequest(provider, 'chat', {
                messages,
                ...options
            });
            
            this.recordSuccess(provider, 'chat');
            return result;
        } catch (error) {
            console.warn(`${provider} chat failed:`, error.message);
            this.recordFailure(provider, 'chat', error);
            
            // Try fallback
            return await this.tryFallback('chat', messages, options, provider);
        }
    }

    /**
     * Parse error response from API
     */
    async parseErrorResponse(response, provider) {
        try {
            const errorData = await response.json();
            
            // Different providers have different error formats
            if (errorData.error) {
                if (typeof errorData.error === 'string') {
                    return errorData.error;
                } else if (errorData.error.message) {
                    return errorData.error.message;
                }
            }
            
            // Return any error message we can find
            return errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch (e) {
            // If response is not JSON, try to get text
            try {
                const text = await response.text();
                return text || `${response.status} ${response.statusText}`;
            } catch (e2) {
                return `${response.status} ${response.statusText}`;
            }
        }
    }

    /**
     * Make a provider-specific request
     */
    async makeProviderRequest(provider, taskType, params) {
        const config = this.providers[provider];
        
        switch (provider) {
            case 'openai':
                return await this.makeOpenAIRequest(taskType, params);
            
            case 'groq':
                return await this.makeGroqRequest(taskType, params);
            
            case 'huggingface':
                return await this.makeHuggingFaceRequest(taskType, params);
            
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    /**
     * OpenAI request handler
     */
    async makeOpenAIRequest(taskType, params) {
        const config = this.providers.openai;
        
        if (!config.apiKey) {
            throw new Error('OpenAI API key not set');
        }

        let endpoint, body;
        
        switch (taskType) {
            case 'chat':
                endpoint = '/chat/completions';
                body = {
                    model: params.model || config.models.chat[0],
                    messages: params.messages,
                    temperature: params.temperature || 0.7,
                    max_tokens: params.max_tokens || 1000
                };
                break;
            
            case 'image':
                endpoint = '/images/generations';
                body = {
                    model: params.model || config.models.image[0],
                    prompt: params.prompt,
                    n: params.n || 1,
                    size: params.size || '1024x1024'
                };
                break;
            
            default:
                throw new Error(`Unsupported task type for OpenAI: ${taskType}`);
        }

        const response = await fetch(`${config.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorMessage = await this.parseErrorResponse(response, 'openai');
            throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`);
        }

        return await response.json();
    }

    /**
     * Groq request handler
     */
    async makeGroqRequest(taskType, params) {
        const config = this.providers.groq;
        
        if (!config.apiKey) {
            throw new Error('Groq API key not set');
        }

        let endpoint, body;
        
        switch (taskType) {
            case 'chat':
                endpoint = '/chat/completions';
                body = {
                    model: params.model || config.models.chat[0],
                    messages: params.messages,
                    temperature: params.temperature || 0.7,
                    max_tokens: params.max_tokens || 1000
                };
                break;
            
            case 'audio':
                endpoint = '/audio/transcriptions';
                // Groq uses OpenAI-compatible API
                const formData = new FormData();
                formData.append('file', params.file);
                formData.append('model', params.model || config.models.audio[0]);
                
                const audioResponse = await fetch(`${config.baseUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${config.apiKey}`
                    },
                    body: formData
                });

                if (!audioResponse.ok) {
                    const errorMessage = await this.parseErrorResponse(audioResponse, 'groq');
                    throw new Error(`Groq API error (${audioResponse.status}): ${errorMessage}`);
                }

                return await audioResponse.json();
            
            default:
                throw new Error(`Unsupported task type for Groq: ${taskType}`);
        }

        const response = await fetch(`${config.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorMessage = await this.parseErrorResponse(response, 'groq');
            throw new Error(`Groq API error (${response.status}): ${errorMessage}`);
        }

        return await response.json();
    }

    /**
     * HuggingFace request handler
     */
    async makeHuggingFaceRequest(taskType, params) {
        const config = this.providers.huggingface;
        
        if (!config.apiKey) {
            throw new Error('HuggingFace API key not set');
        }

        const model = params.model || config.models[taskType][0];
        let endpoint, body;
        
        switch (taskType) {
            case 'chat':
                endpoint = `/${model}`;
                // HuggingFace expects different format
                const prompt = this.formatHuggingFacePrompt(params.messages);
                body = {
                    inputs: prompt,
                    parameters: {
                        temperature: params.temperature || 0.7,
                        max_new_tokens: params.max_tokens || 1000,
                        return_full_text: false
                    }
                };
                break;
            
            case 'image':
                endpoint = `/${model}`;
                body = {
                    inputs: params.prompt
                };
                break;
            
            case 'embeddings':
                endpoint = `/${model}`;
                body = {
                    inputs: Array.isArray(params.input) ? params.input : [params.input]
                };
                break;
            
            default:
                throw new Error(`Unsupported task type for HuggingFace: ${taskType}`);
        }

        const response = await fetch(`${config.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorMessage = await this.parseErrorResponse(response, 'huggingface');
            throw new Error(`HuggingFace API error (${response.status}): ${errorMessage}`);
        }

        const result = await response.json();
        
        // Convert HuggingFace format to OpenAI-compatible format
        return this.normalizeHuggingFaceResponse(taskType, result, model);
    }

    /**
     * Format messages for HuggingFace models
     */
    formatHuggingFacePrompt(messages) {
        // Convert OpenAI message format to plain text prompt
        let prompt = '';
        
        messages.forEach(msg => {
            if (msg.role === 'system') {
                prompt += `System: ${msg.content}\n\n`;
            } else if (msg.role === 'user') {
                prompt += `User: ${msg.content}\n\n`;
            } else if (msg.role === 'assistant') {
                prompt += `Assistant: ${msg.content}\n\n`;
            }
        });
        
        prompt += 'Assistant: ';
        return prompt;
    }

    /**
     * Normalize HuggingFace response to OpenAI format
     */
    normalizeHuggingFaceResponse(taskType, result, model) {
        switch (taskType) {
            case 'chat':
                const text = Array.isArray(result) ? result[0]?.generated_text || '' : result.generated_text || '';
                return {
                    choices: [{
                        message: {
                            role: 'assistant',
                            content: text.trim()
                        }
                    }],
                    model: model,
                    provider: 'huggingface'
                };
            
            case 'image':
                // HuggingFace returns image as blob
                return {
                    data: [{
                        url: result instanceof Blob ? URL.createObjectURL(result) : result
                    }],
                    model: model,
                    provider: 'huggingface'
                };
            
            case 'embeddings':
                return {
                    data: Array.isArray(result) ? result.map(emb => ({ embedding: emb })) : [{ embedding: result }],
                    model: model,
                    provider: 'huggingface'
                };
            
            default:
                return result;
        }
    }

    /**
     * Try fallback providers
     */
    async tryFallback(taskType, messages, options, failedProvider) {
        const available = this.getAvailableProviders(taskType);
        
        // Remove failed provider from list
        const remaining = available.filter(p => p.id !== failedProvider);
        
        if (remaining.length === 0) {
            console.warn('All providers failed, returning mock response');
            return this.getMockResponse(taskType, messages);
        }

        // Try next provider
        const nextProvider = remaining[0].id;
        console.log(`Falling back to ${nextProvider}...`);
        
        try {
            const result = await this.makeProviderRequest(nextProvider, taskType, {
                messages,
                ...options
            });
            
            this.recordSuccess(nextProvider, taskType);
            return result;
        } catch (error) {
            console.warn(`${nextProvider} fallback failed:`, error.message);
            this.recordFailure(nextProvider, taskType, error);
            
            // Recursively try next fallback
            return await this.tryFallback(taskType, messages, options, nextProvider);
        }
    }

    /**
     * Generate image
     */
    async generateImage(prompt, options = {}) {
        const provider = options.provider || this.selectProvider('image', options.preferFree !== false);
        
        if (!provider) {
            return this.getMockResponse('image', prompt);
        }

        try {
            const result = await this.makeProviderRequest(provider, 'image', {
                prompt,
                ...options
            });
            
            this.recordSuccess(provider, 'image');
            return result;
        } catch (error) {
            console.warn(`${provider} image generation failed:`, error.message);
            this.recordFailure(provider, 'image', error);
            
            // Try fallback
            return await this.tryImageFallback(prompt, options, provider);
        }
    }

    /**
     * Try image generation fallback
     */
    async tryImageFallback(prompt, options, failedProvider) {
        const available = this.getAvailableProviders('image');
        const remaining = available.filter(p => p.id !== failedProvider);
        
        if (remaining.length === 0) {
            console.warn('All image providers failed, returning mock response');
            return this.getMockResponse('image', prompt);
        }

        const nextProvider = remaining[0].id;
        console.log(`Falling back to ${nextProvider} for image generation...`);
        
        try {
            const result = await this.makeProviderRequest(nextProvider, 'image', {
                prompt,
                ...options
            });
            
            this.recordSuccess(nextProvider, 'image');
            return result;
        } catch (error) {
            console.warn(`${nextProvider} image fallback failed:`, error.message);
            this.recordFailure(nextProvider, 'image', error);
            
            return await this.tryImageFallback(prompt, options, nextProvider);
        }
    }

    /**
     * Generate embeddings
     */
    async generateEmbeddings(input, options = {}) {
        const provider = options.provider || this.selectProvider('embeddings', options.preferFree !== false);
        
        if (!provider) {
            return this.getMockResponse('embeddings', input);
        }

        try {
            const result = await this.makeProviderRequest(provider, 'embeddings', {
                input,
                ...options
            });
            
            this.recordSuccess(provider, 'embeddings');
            return result;
        } catch (error) {
            console.warn(`${provider} embeddings failed:`, error.message);
            this.recordFailure(provider, 'embeddings', error);
            
            // Return mock embeddings
            return this.getMockResponse('embeddings', input);
        }
    }

    /**
     * Get mock response for testing without API keys
     */
    getMockResponse(taskType, data) {
        switch (taskType) {
            case 'chat':
                const userMessage = Array.isArray(data) ? 
                    data.find(m => m.role === 'user')?.content || 'No prompt' : 
                    'No prompt';
                
                return {
                    choices: [{
                        message: {
                            role: 'assistant',
                            content: `🤖 **Mock AI Response** (No API keys configured)\n\nThis is a simulated response for: "${userMessage}"\n\nTo use real AI:\n- Add OpenAI key (paid, best quality)\n- Add Groq key (free, 14,400 requests/day)\n- Add HuggingFace key (free, rate limited)\n\nProviders will automatically fallback if one fails.`
                        }
                    }],
                    model: 'mock',
                    provider: 'mock'
                };
            
            case 'image':
                return {
                    data: [{
                        url: 'https://via.placeholder.com/512x512/3b82f6/ffffff?text=Mock+AI+Image'
                    }],
                    model: 'mock',
                    provider: 'mock'
                };
            
            case 'embeddings':
                const inputArray = Array.isArray(data) ? data : [data];
                return {
                    data: inputArray.map(() => ({
                        embedding: Array.from({ length: 384 }, () => Math.random() - 0.5)
                    })),
                    model: 'mock',
                    provider: 'mock'
                };
            
            case 'audio':
                // Mock audio transcription response
                return {
                    text: '[Mock transcription] No API keys configured. To transcribe audio, add a Groq API key for free transcription using Whisper.',
                    model: 'mock',
                    provider: 'mock'
                };
            
            default:
                // Provide a generic mock response for unknown task types
                console.warn(`Unknown task type "${taskType}" - returning generic mock response`);
                return {
                    success: false,
                    message: `Mock response for task type: ${taskType}`,
                    data: null,
                    error: `No mock implementation available for "${taskType}". Please configure API keys for real provider access.`,
                    provider: 'mock',
                    supportedTypes: ['chat', 'image', 'embeddings', 'audio']
                };
        }
    }

    /**
     * Record successful request
     */
    recordSuccess(provider, taskType) {
        this.requestHistory.push({
            provider,
            taskType,
            success: true,
            timestamp: Date.now()
        });
        
        this.trimHistory();
    }

    /**
     * Record failed request
     */
    recordFailure(provider, taskType, error) {
        this.requestHistory.push({
            provider,
            taskType,
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
        
        this.trimHistory();
    }

    /**
     * Trim history to max size
     */
    trimHistory() {
        if (this.requestHistory.length > this.maxHistorySize) {
            this.requestHistory = this.requestHistory.slice(-this.maxHistorySize);
        }
    }

    /**
     * Get provider statistics
     */
    getProviderStats() {
        const stats = {};
        
        Object.keys(this.providers).forEach(provider => {
            const requests = this.requestHistory.filter(r => r.provider === provider);
            const successful = requests.filter(r => r.success).length;
            const failed = requests.filter(r => !r.success).length;
            
            stats[provider] = {
                name: this.providers[provider].name,
                enabled: this.providers[provider].enabled,
                freeTier: this.providers[provider].freeTier,
                totalRequests: requests.length,
                successful,
                failed,
                successRate: requests.length > 0 ? (successful / requests.length * 100).toFixed(1) + '%' : 'N/A'
            };
        });
        
        return stats;
    }

    /**
     * Get provider status dashboard
     */
    showDashboard() {
        const stats = this.getProviderStats();
        
        console.log('\n🤖 Multi-Provider AI Orchestrator Dashboard\n');
        console.log('═'.repeat(60));
        
        Object.entries(stats).forEach(([id, stat]) => {
            const statusIcon = stat.enabled ? '✅' : '❌';
            const tierIcon = stat.freeTier ? '🆓' : '💰';
            
            console.log(`\n${statusIcon} ${stat.name} ${tierIcon}`);
            console.log(`   Enabled: ${stat.enabled}`);
            console.log(`   Free Tier: ${stat.freeTier}`);
            console.log(`   Requests: ${stat.totalRequests} (${stat.successful} ✓, ${stat.failed} ✗)`);
            console.log(`   Success Rate: ${stat.successRate}`);
        });
        
        console.log('\n' + '═'.repeat(60));
        console.log('\n💡 Usage:');
        console.log('  multiAI.setApiKey("groq", "gsk_...")');
        console.log('  multiAI.setApiKey("huggingface", "hf_...")');
        console.log('  await multiAI.chatCompletion([{role:"user", content:"Hello"}])');
        console.log('  await multiAI.generateImage("A beautiful landscape")');
        console.log('\n');
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.multiAI = new MultiProviderAIOrchestrator();
    
    // Add shortcuts
    window.aiStatus = () => window.multiAI.showDashboard();
    window.aiSetKey = (provider, key) => window.multiAI.setApiKey(provider, key);
    
    console.log('🚀 Multi-Provider AI Orchestrator loaded');
    console.log('   Primary: Groq (free, repo-wide orchestrator)');
    console.log('   Fallback: OpenAI, HuggingFace');
    console.log('   Type aiStatus() to see dashboard');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiProviderAIOrchestrator;
}

// Note: ES6 export commented out to allow loading as regular script
// If using as ES6 module, uncomment the line below and load with type="module"
// export default MultiProviderAIOrchestrator;
