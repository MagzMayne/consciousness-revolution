// RootIB: RB-20260319142113-FC7B9F63
/**
 * Enhanced Gemini API Integration for R3-D3
 * 
 * Provides:
 * - Direct Gemini API library integration
 * - Real-time editing with streaming
 * - Enhanced vision capabilities
 * - Multi-modal content understanding
 * 
 * Based on: https://ai.google.dev/gemini-api/docs/libraries
 */

(function() {
    'use strict';

    /**
     * Gemini API Configuration
     */
    const GEMINI_CONFIG = {
        apiVersion: 'v1beta',
        visionModel: 'gemini-2.0-flash-exp',
        streamingModel: 'gemini-2.0-flash-exp',
        endpoints: {
            generate: 'https://generativelanguage.googleapis.com/v1beta/models',
            stream: 'https://generativelanguage.googleapis.com/v1beta/models'
        },
        defaultTemperature: 0.7,
        defaultMaxTokens: 2048,
        defaultTopK: 40,
        defaultTopP: 0.95
    };

    /**
     * Enhanced Gemini API Client
     */
    class GeminiAPIClient {
        constructor(apiKey) {
            this.apiKey = apiKey;
            this.abortController = null;
        }

        /**
         * Validate API key format
         */
        static validateApiKey(apiKey) {
            if (!apiKey || typeof apiKey !== 'string') {
                return { valid: false, error: 'API key is required' };
            }
            
            if (!apiKey.startsWith('AIza')) {
                return { valid: false, error: 'API key should start with "AIza"' };
            }
            
            if (apiKey.length < 30) {
                return { valid: false, error: 'API key appears to be too short' };
            }
            
            return { valid: true };
        }

        /**
         * Test API key by making a simple request
         */
        async testApiKey() {
            try {
                const response = await this.generateContent({
                    text: 'Hello, respond with "OK" if you can read this.'
                });
                return { valid: true, response };
            } catch (error) {
                return { 
                    valid: false, 
                    error: error.message,
                    details: error
                };
            }
        }

        /**
         * Generate content with text prompt
         */
        async generateContent({ text, temperature, maxTokens, topK, topP }) {
            const url = `${GEMINI_CONFIG.endpoints.generate}/${GEMINI_CONFIG.visionModel}:generateContent?key=${this.apiKey}`;
            
            const requestBody = {
                contents: [{
                    parts: [{ text }]
                }],
                generationConfig: {
                    temperature: temperature || GEMINI_CONFIG.defaultTemperature,
                    maxOutputTokens: maxTokens || GEMINI_CONFIG.defaultMaxTokens,
                    topK: topK || GEMINI_CONFIG.defaultTopK,
                    topP: topP || GEMINI_CONFIG.defaultTopP
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            return this._extractText(data);
        }

        /**
         * Analyze image with vision capabilities
         */
        async analyzeImage({ imageData, prompt, mimeType = 'image/png' }) {
            const url = `${GEMINI_CONFIG.endpoints.generate}/${GEMINI_CONFIG.visionModel}:generateContent?key=${this.apiKey}`;
            
            // Remove data URL prefix if present
            let cleanImageData = imageData;
            if (imageData.includes(',')) {
                cleanImageData = imageData.split(',')[1];
            }

            const requestBody = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: cleanImageData
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4, // Lower temperature for more factual vision analysis
                    maxOutputTokens: GEMINI_CONFIG.defaultMaxTokens,
                    topK: 32,
                    topP: 1
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `Vision API error: ${response.status}`);
            }

            const data = await response.json();
            return this._extractText(data);
        }

        /**
         * Stream content generation in real-time
         * @returns {AsyncGenerator} Yields text chunks as they arrive
         */
        async* streamContent({ text, temperature, maxTokens }) {
            const url = `${GEMINI_CONFIG.endpoints.stream}/${GEMINI_CONFIG.streamingModel}:streamGenerateContent?key=${this.apiKey}&alt=sse`;
            
            this.abortController = new AbortController();
            
            const requestBody = {
                contents: [{
                    parts: [{ text }]
                }],
                generationConfig: {
                    temperature: temperature || GEMINI_CONFIG.defaultTemperature,
                    maxOutputTokens: maxTokens || GEMINI_CONFIG.defaultMaxTokens
                }
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    signal: this.abortController.signal
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error?.message || `Streaming API error: ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonData = JSON.parse(line.slice(6));
                                const text = this._extractText(jsonData);
                                if (text) {
                                    yield text;
                                }
                            } catch (e) {
                                console.warn('Failed to parse SSE data:', e);
                            }
                        }
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Streaming aborted by user');
                } else {
                    throw error;
                }
            }
        }

        /**
         * Stop ongoing streaming
         */
        stopStreaming() {
            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
        }

        /**
         * Extract text from Gemini API response
         */
        _extractText(data) {
            try {
                if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                    return data.candidates[0].content.parts[0].text;
                }
                return '';
            } catch (e) {
                console.error('Failed to extract text from response:', e);
                return '';
            }
        }

        /**
         * Multi-modal analysis with multiple images
         */
        async analyzeMultipleImages({ images, prompt }) {
            const url = `${GEMINI_CONFIG.endpoints.generate}/${GEMINI_CONFIG.visionModel}:generateContent?key=${this.apiKey}`;
            
            const parts = [{ text: prompt }];
            
            // Add all images to the request
            for (const image of images) {
                let cleanImageData = image.data;
                if (image.data.includes(',')) {
                    cleanImageData = image.data.split(',')[1];
                }
                
                parts.push({
                    inline_data: {
                        mime_type: image.mimeType || 'image/png',
                        data: cleanImageData
                    }
                });
            }

            const requestBody = {
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: GEMINI_CONFIG.defaultMaxTokens
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `Multi-image API error: ${response.status}`);
            }

            const data = await response.json();
            return this._extractText(data);
        }

        /**
         * Count tokens in text (estimation)
         */
        estimateTokens(text) {
            // Rough estimation: ~4 characters per token
            return Math.ceil(text.length / 4);
        }
    }

    /**
     * Real-Time Editor Integration
     */
    class RealTimeEditor {
        constructor(apiClient) {
            this.apiClient = apiClient;
            this.activeEdits = new Map();
            this.editHistory = [];
            this.maxHistorySize = 50;
        }

        /**
         * Start real-time editing session
         */
        async startEditingSession(elementSelector, options = {}) {
            const element = document.querySelector(elementSelector);
            if (!element) {
                throw new Error(`Element not found: ${elementSelector}`);
            }

            const sessionId = `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const session = {
                id: sessionId,
                element: element,
                originalContent: element.textContent || element.value,
                isActive: true,
                mode: options.mode || 'suggest', // 'suggest' or 'apply'
                onUpdate: options.onUpdate || null
            };

            this.activeEdits.set(sessionId, session);
            
            // Set up input listener for real-time suggestions
            if (session.mode === 'suggest') {
                this._setupSuggestionListener(session);
            }

            return sessionId;
        }

        /**
         * Stream editing suggestions as user types
         */
        _setupSuggestionListener(session) {
            let timeoutId = null;
            const debounceMs = 500;

            const handleInput = async () => {
                if (!session.isActive) return;

                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    const currentContent = session.element.textContent || session.element.value;
                    
                    if (currentContent.length < 10) return; // Too short to suggest

                    try {
                        const prompt = `You are a helpful writing assistant. Given this partial text, suggest a natural continuation (max 20 words):

"${currentContent}"

Provide ONLY the suggested continuation, nothing else.`;

                        let suggestion = '';
                        for await (const chunk of this.apiClient.streamContent({ 
                            text: prompt,
                            temperature: 0.7,
                            maxTokens: 100
                        })) {
                            suggestion += chunk;
                            if (session.onUpdate) {
                                session.onUpdate(suggestion);
                            }
                        }
                    } catch (error) {
                        console.error('Suggestion error:', error);
                    }
                }, debounceMs);
            };

            session.element.addEventListener('input', handleInput);
            session.cleanupListener = () => {
                session.element.removeEventListener('input', handleInput);
                clearTimeout(timeoutId);
            };
        }

        /**
         * Get AI-powered edit suggestions
         */
        async getEditSuggestions(content, editType = 'improve') {
            const prompts = {
                improve: `Improve the following text while maintaining its meaning. Make it clearer and more concise:\n\n${content}`,
                grammar: `Fix any grammar, spelling, or punctuation errors in this text:\n\n${content}`,
                expand: `Expand on this text with more detail and examples:\n\n${content}`,
                simplify: `Simplify this text to make it easier to understand:\n\n${content}`,
                professional: `Rewrite this text in a more professional tone:\n\n${content}`,
                casual: `Rewrite this text in a more casual, friendly tone:\n\n${content}`
            };

            const prompt = prompts[editType] || prompts.improve;
            return await this.apiClient.generateContent({ text: prompt });
        }

        /**
         * Apply edit to element
         */
        applyEdit(sessionId, newContent, recordHistory = true) {
            const session = this.activeEdits.get(sessionId);
            if (!session) {
                throw new Error(`Session not found: ${sessionId}`);
            }

            if (recordHistory) {
                this.editHistory.push({
                    sessionId,
                    timestamp: Date.now(),
                    oldContent: session.element.textContent || session.element.value,
                    newContent
                });

                // Limit history size
                if (this.editHistory.length > this.maxHistorySize) {
                    this.editHistory.shift();
                }
            }

            if (session.element.tagName === 'INPUT' || session.element.tagName === 'TEXTAREA') {
                session.element.value = newContent;
            } else {
                session.element.textContent = newContent;
            }
        }

        /**
         * Undo last edit
         */
        undo(sessionId) {
            const lastEdit = this.editHistory
                .reverse()
                .find(edit => edit.sessionId === sessionId);

            if (lastEdit) {
                this.applyEdit(sessionId, lastEdit.oldContent, false);
                this.editHistory = this.editHistory.filter(edit => edit !== lastEdit);
                return true;
            }
            return false;
        }

        /**
         * Stop editing session
         */
        stopSession(sessionId) {
            const session = this.activeEdits.get(sessionId);
            if (session) {
                session.isActive = false;
                if (session.cleanupListener) {
                    session.cleanupListener();
                }
                this.activeEdits.delete(sessionId);
            }
        }

        /**
         * Stop all active sessions
         */
        stopAllSessions() {
            for (const sessionId of this.activeEdits.keys()) {
                this.stopSession(sessionId);
            }
        }
    }

    /**
     * Enhanced Vision Analyzer
     */
    class VisionAnalyzer {
        constructor(apiClient) {
            this.apiClient = apiClient;
        }

        /**
         * Analyze page for accessibility
         */
        async analyzeAccessibility(screenshot) {
            const prompt = `Analyze this webpage screenshot for accessibility issues. Identify:
1. Missing alt text on images
2. Low color contrast areas
3. Text that's too small
4. Interactive elements that may not be keyboard accessible
5. Any WCAG violations

Format as JSON with fields: issues (array), recommendations (array), severity (low/medium/high for each).`;

            const result = await this.apiClient.analyzeImage({
                imageData: screenshot,
                prompt
            });

            return this._parseAnalysisResult(result);
        }

        /**
         * Detect UI components and their purpose
         */
        async detectComponents(screenshot) {
            const prompt = `Identify all UI components in this screenshot. For each component, provide:
1. Type (button, input, link, heading, etc.)
2. Location (approximate coordinates or position description)
3. Text/label
4. Apparent purpose
5. Visual state (enabled/disabled, selected, etc.)

Return as structured JSON.`;

            const result = await this.apiClient.analyzeImage({
                imageData: screenshot,
                prompt
            });

            return this._parseAnalysisResult(result);
        }

        /**
         * Generate design suggestions
         */
        async suggestDesignImprovements(screenshot) {
            const prompt = `As a UX designer, analyze this webpage and suggest improvements for:
1. Visual hierarchy
2. Layout and spacing
3. Color scheme
4. Typography
5. User flow and interaction patterns

Provide 3-5 specific, actionable suggestions.`;

            const result = await this.apiClient.analyzeImage({
                imageData: screenshot,
                prompt
            });

            return result;
        }

        /**
         * Compare two screenshots
         */
        async compareScreenshots(screenshot1, screenshot2) {
            const prompt = `Compare these two screenshots and identify:
1. What changed between them
2. New elements added
3. Elements removed
4. Style or layout differences
5. Any potential issues with the changes

Provide a detailed comparison.`;

            const result = await this.apiClient.analyzeMultipleImages({
                images: [
                    { data: screenshot1, mimeType: 'image/png' },
                    { data: screenshot2, mimeType: 'image/png' }
                ],
                prompt
            });

            return result;
        }

        /**
         * Parse analysis result (try JSON, fallback to text)
         */
        _parseAnalysisResult(result) {
            try {
                // Try to extract JSON from response
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.warn('Could not parse as JSON, returning text');
            }
            return { text: result };
        }
    }

    /**
     * Public API for Enhanced Gemini Integration
     */
    window.GeminiEnhanced = {
        // Create new API client
        createClient: (apiKey) => new GeminiAPIClient(apiKey),
        
        // Validate API key
        validateApiKey: GeminiAPIClient.validateApiKey,
        
        // Create real-time editor
        createEditor: (apiClient) => new RealTimeEditor(apiClient),
        
        // Create vision analyzer
        createVisionAnalyzer: (apiClient) => new VisionAnalyzer(apiClient),
        
        // Configuration
        config: GEMINI_CONFIG,
        
        // Version
        version: '1.0.0'
    };

    console.log('✨ Enhanced Gemini API integration loaded (v1.0.0)');
    console.log('   API: window.GeminiEnhanced');
    console.log('   Features: Real-time editing, Enhanced vision, Streaming');

})();
