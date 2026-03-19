// RootIB: RB-20260319142113-AFB06E61
/**
 * AbilityAccessController
 * Client-side wrapper for ability access control
 *
 * Usage:
 *   const controller = new AbilityAccessController(supabase, foundationId);
 *   const result = await controller.execute('pattern_recognition', { query: 'fraud' });
 *   const features = await controller.getAvailableFeatures();
 */

class AbilityAccessController {
    constructor(supabaseClient, foundationId) {
        this.supabase = supabaseClient;
        this.foundationId = foundationId;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.baseUrl = '';
    }

    /**
     * Execute an ability with automatic access control
     */
    async execute(abilityName, params = {}) {
        const access = await this.checkAccess(abilityName);

        if (!access.allowed) {
            return {
                success: false,
                error: 'Access denied',
                ...access,
                suggestion: this.getSuggestion(access)
            };
        }

        // Degraded mode
        if (access.power_level < 100) {
            const result = await this.executeDegraded(abilityName, params, access);
            result.power_level = access.power_level;
            result.upgrade_hint = access.upgrade_hint;
            return result;
        }

        // Full power
        return this.executeFull(abilityName, params);
    }

    /**
     * Check access to an ability
     */
    async checkAccess(abilityName) {
        // Cache check
        const cached = this.cache.get(abilityName);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/.netlify/functions/ability-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    foundation_id: this.foundationId,
                    ability_name: abilityName
                })
            });

            const data = await response.json();
            this.cache.set(abilityName, { data, timestamp: Date.now() });
            return data;

        } catch (error) {
            console.error('Access check failed:', error);
            // Fail open for standalone abilities
            return { allowed: true, power_level: 60, error: error.message };
        }
    }

    /**
     * Check multiple abilities at once
     */
    async checkBulkAccess(abilityNames) {
        const response = await fetch(`${this.baseUrl}/.netlify/functions/ability-access`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                foundation_id: this.foundationId,
                abilities: abilityNames
            })
        });

        return response.json();
    }

    /**
     * Get all available network features
     */
    async getAvailableFeatures() {
        const response = await fetch(`${this.baseUrl}/.netlify/functions/network-feature-gate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'list',
                foundation_id: this.foundationId
            })
        });

        return response.json();
    }

    /**
     * Check specific network feature access
     */
    async checkFeature(featureName) {
        const response = await fetch(`${this.baseUrl}/.netlify/functions/network-feature-gate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'check',
                foundation_id: this.foundationId,
                feature_name: featureName
            })
        });

        return response.json();
    }

    /**
     * Record a contribution to the network
     */
    async recordContribution(type, metadata = {}) {
        const response = await fetch(`${this.baseUrl}/.netlify/functions/update-contribution`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                foundation_id: this.foundationId,
                contribution_type: type,
                metadata
            })
        });

        const result = await response.json();

        // Clear cache on contribution (tier may have changed)
        if (result.success) {
            this.cache.clear();
        }

        // Show celebration on tier upgrade
        if (result.tier_changed) {
            this.celebrateTierUpgrade(result);
        }

        return result;
    }

    /**
     * Execute in degraded mode (network-enhanced at reduced power)
     */
    async executeDegraded(abilityName, params, access) {
        console.log(`[AbilityAccess] Executing ${abilityName} in degraded mode (${access.power_level}% power)`);

        // Map degraded behaviors
        const degradedHandlers = {
            pattern_recognition: () => this.localPatternSearch(params),
            bug_detection: () => this.localLintCheck(params),
            code_analysis: () => this.staticAnalysis(params),
            documentation: () => this.templateDocs(params),
            ai_assistance: () => this.localAIFallback(params)
        };

        const handler = degradedHandlers[abilityName];
        if (handler) {
            return {
                success: true,
                mode: 'degraded',
                ability: abilityName,
                result: await handler(),
                degraded_notice: access.degraded_behavior
            };
        }

        return {
            success: true,
            mode: 'degraded',
            ability: abilityName,
            result: null,
            message: 'No degraded handler available'
        };
    }

    /**
     * Execute at full power (connected to network)
     */
    async executeFull(abilityName, params) {
        console.log(`[AbilityAccess] Executing ${abilityName} at full power`);

        // This would route to actual ability implementations
        // Placeholder - actual implementations depend on ability
        return {
            success: true,
            mode: 'full',
            ability: abilityName,
            params,
            message: 'Full power execution - implement actual ability'
        };
    }

    /**
     * Get upgrade suggestion based on access denial
     */
    getSuggestion(access) {
        if (access.required_tier && access.current_tier) {
            const suggestions = {
                'GHOST->SEEDLING': 'Publish your first creation to unlock this feature',
                'SEEDLING->SAPLING': 'Make some marketplace sales or share patterns',
                'SAPLING->TREE': 'Continue contributing to reach TREE tier',
                'TREE->FOREST': 'Maintain consistent contribution for FOREST status'
            };
            const key = `${access.current_tier}->${access.required_tier}`;
            return suggestions[key] || access.upgrade_hint;
        }
        return null;
    }

    /**
     * Show tier upgrade celebration
     */
    celebrateTierUpgrade(result) {
        const modal = document.createElement('div');
        modal.className = 'tier-upgrade-modal';
        modal.innerHTML = `
            <div class="tier-upgrade-content">
                <div class="tier-badge ${result.new_tier.toLowerCase()}">${result.new_tier}</div>
                <h2>Tier Upgrade!</h2>
                <p>${result.celebration_message}</p>
                ${result.unlocked_features?.length ? `
                    <div class="unlocked-features">
                        <h3>New Features Unlocked:</h3>
                        <ul>
                            ${result.unlocked_features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <button onclick="this.parentElement.parentElement.remove()">Continue Building</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Auto-dismiss after 10 seconds
        setTimeout(() => modal.remove(), 10000);
    }

    // ===== DEGRADED MODE HANDLERS =====

    async localPatternSearch(params) {
        // Use local patterns only (limited set)
        const localPatterns = await this.loadLocalData('/patterns/local.json');
        const query = params.query?.toLowerCase() || '';
        return localPatterns.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
        ).slice(0, 50);
    }

    async localLintCheck(params) {
        // Basic lint rules only
        const rules = await this.loadLocalData('/lint/rules.json');
        return { rules_applied: rules.length, message: 'Local lint only - connect for full bug database' };
    }

    async staticAnalysis(params) {
        return { message: 'Static analysis only - connect for AI-powered analysis' };
    }

    async templateDocs(params) {
        return { message: 'Template-based docs - connect for AI-powered documentation' };
    }

    async localAIFallback(params) {
        return { message: 'Local fallback - connect for cloud AI models' };
    }

    async loadLocalData(path) {
        try {
            const response = await fetch(path);
            return await response.json();
        } catch {
            return [];
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Get current network status
     */
    async getNetworkStatus() {
        const features = await this.getAvailableFeatures();
        return {
            tier: features.current_tier,
            score: features.contribution_score,
            available: features.available_features?.length || 0,
            locked: features.locked_features?.length || 0,
            next_tier: features.next_tier,
            points_needed: features.points_to_next_tier,
            progress: features.tier_progress
        };
    }

    /**
     * Clear access cache (call after contribution or tier change)
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AbilityAccessController;
}

// Global export for browser
if (typeof window !== 'undefined') {
    window.AbilityAccessController = AbilityAccessController;
}
