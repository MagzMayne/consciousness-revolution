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
 * File: agent-mappings.js
 * Declaration ID: IP-5D00856-MLL28ZW1
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

/** SIGNED BY MeRLynn - ID: MERLYNN-1e6bef85 - TIMESTAMP: 2025-12-19T05:53:06.535Z - HASH: 630d66d6 */
/** SIGNED BY AGentR - ID: AGENTR-23b859b8 - TIMESTAMP: 2025-12-19T05:53:06.535Z - HASH: 630d66d6 */

/**
 * Agent-to-Model Mapping Schema for MandemOS
 * Defines the AI capabilities and model assignments for each agent type
 */

const AGENT_MAPPINGS = {
    // Governor Agents - High-level decision making and governance
    governor: {
        role: "Strategic Governance Agent",
        description: "Handles high-level protocol decisions, token economics, and system governance",
        primaryModels: ["gpt-5-pro", "sora-2"],
        capabilities: [
            "protocol_design",
            "economic_modeling",
            "governance_simulation",
            "risk_assessment",
            "media_generation"
        ],
        systemPrompt: `You are a Governor Agent in the Gem Bot Universe. Your role is to provide strategic guidance on protocol design, economic incentives, and governance structures. Make decisions that promote long-term sustainability and community benefit.`
    },

    // Scout Agents - Exploration and data gathering
    scout: {
        role: "Exploration & Intelligence Agent",
        description: "Gathers intelligence, explores new opportunities, and provides real-time insights",
        primaryModels: ["gpt-4.1", "gpt-realtime"],
        capabilities: [
            "market_intelligence",
            "opportunity_discovery",
            "real_time_monitoring",
            "trend_analysis",
            "conversational_interface"
        ],
        systemPrompt: `You are a Scout Agent in the Gem Bot Universe. Your role is to explore markets, identify opportunities, and provide real-time intelligence. Be proactive in discovering trends and communicating findings effectively.`
    },

    // Archivist Agents - Knowledge management and research
    archivist: {
        role: "Knowledge Preservation Agent",
        description: "Manages records, conducts deep research, and maintains institutional knowledge",
        primaryModels: ["o3-deep-research", "gpt-4o-transcribe"],
        capabilities: [
            "document_analysis",
            "research_synthesis",
            "record_management",
            "compliance_auditing",
            "speech_processing"
        ],
        systemPrompt: `You are an Archivist Agent in the Gem Bot Universe. Your role is to preserve knowledge, conduct thorough research, and maintain accurate records. Ensure all information is properly documented and accessible.`
    },

    // Artist Agents - Creative content generation
    artist: {
        role: "Creative Generation Agent",
        description: "Creates visual content, media assets, and artistic representations",
        primaryModels: ["gpt-image-1", "dall-e-3"],
        capabilities: [
            "image_generation",
            "visual_design",
            "media_creation",
            "ui_mockups",
            "storytelling"
        ],
        systemPrompt: `You are an Artist Agent in the Gem Bot Universe. Your role is to create compelling visual content and media assets. Focus on aesthetics, clarity, and engagement in all creations.`
    },

    // Specialist Agents - Domain-specific tasks
    specialist: {
        role: "Domain Specialist Agent",
        description: "Handles specialized tasks like coding, moderation, and automation",
        primaryModels: ["gpt-5-codex", "codex-mini-latest", "omni-moderation"],
        capabilities: [
            "code_generation",
            "content_moderation",
            "automation_scripting",
            "technical_analysis"
        ],
        systemPrompt: `You are a Specialist Agent in the Gem Bot Universe. Your role is to handle technical and specialized tasks with precision and expertise.`
    },

    // Universal Agents - General purpose with multiple capabilities
    universal: {
        role: "Universal Agent",
        description: "Multi-purpose agent capable of various tasks",
        primaryModels: ["gpt-4o", "gpt-4o-tts"],
        capabilities: [
            "general_reasoning",
            "text_processing",
            "voice_interaction",
            "multi_modal"
        ],
        systemPrompt: `You are a Universal Agent in the Gem Bot Universe. You can handle a wide variety of tasks and adapt to different requirements.`
    }
};

// Model capabilities mapping
const MODEL_CAPABILITIES = {
    "gpt-5-pro": ["reasoning", "strategy", "complex_analysis"],
    "gpt-5": ["reasoning", "general_intelligence"],
    "gpt-5-codex": ["code_generation", "technical_writing"],
    "gpt-4.1": ["fast_reasoning", "efficiency"],
    "gpt-4o": ["multi_modal", "general_purpose"],
    "gpt-image-1": ["image_generation", "visual_creation"],
    "gpt-image-1-mini": ["fast_image_gen", "cost_efficient"],
    "dall-e-3": ["high_quality_images", "detailed_generation"],
    "sora-2": ["video_generation", "dynamic_media"],
    "sora-2-pro": ["advanced_video", "professional_media"],
    "gpt-4o-tts": ["text_to_speech", "voice_synthesis"],
    "gpt-4o-transcribe": ["speech_to_text", "audio_processing"],
    "gpt-audio": ["audio_generation", "sound_design"],
    "gpt-realtime": ["real_time_interaction", "streaming"],
    "o3-deep-research": ["deep_analysis", "research"],
    "o4-mini-deep-research": ["efficient_research", "cost_effective"],
    "gpt-oss-120b": ["open_source", "local_hosting"],
    "gpt-oss-20b": ["lightweight_oss", "offline_capable"],
    "text-embedding-3-large": ["semantic_search", "similarity"],
    "omni-moderation": ["content_filtering", "safety_checks"],
    "computer-use-preview": ["automation", "system_control"],
    "codex-mini-latest": ["code_assistance", "scripting"]
};

// Agent hierarchy and permissions
const AGENT_HIERARCHY = {
    governor: { level: 5, permissions: ["full_access", "decision_making", "resource_allocation"] },
    specialist: { level: 4, permissions: ["technical_access", "code_execution", "system_modification"] },
    archivist: { level: 3, permissions: ["data_access", "research_permissions", "record_management"] },
    scout: { level: 2, permissions: ["read_access", "intelligence_gathering", "communication"] },
    artist: { level: 2, permissions: ["creative_access", "media_generation", "design_tools"] },
    universal: { level: 1, permissions: ["basic_access", "general_tasks"] }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AGENT_MAPPINGS, MODEL_CAPABILITIES, AGENT_HIERARCHY };
} else {
    window.agentMappings = { AGENT_MAPPINGS, MODEL_CAPABILITIES, AGENT_HIERARCHY };
}
