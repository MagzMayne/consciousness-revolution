// RootIB: RB-20260319142113-13F49245
/**
 * DASHBOARD DNA VALIDATOR
 * Client-side validation for Gold Standard Dashboard DNA
 *
 * Usage:
 *   const result = DashboardDNA.validate(dna);
 *   const dna = DashboardDNA.extract(); // From current page
 *   DashboardDNA.displayBadge(); // Show quality badge
 *
 * Trinity: C1 builds, C2 reviews, C3 validates
 * Pattern: 3 → 7 → 13 → ∞
 */

window.DashboardDNA = (function() {
    'use strict';

    // Domain configuration
    const DOMAINS = {
        '1_COMMAND': { name: 'COMMAND', color: '#ff4444' },
        '2_BUILD': { name: 'BUILD', color: '#00aaff' },
        '3_CONNECT': { name: 'CONNECT', color: '#aa44ff' },
        '4_PROTECT': { name: 'PROTECT', color: '#44ff44' },
        '5_GROW': { name: 'GROW', color: '#ffaa00' },
        '6_LEARN': { name: 'LEARN', color: '#00ffaa' },
        '7_TRANSCEND': { name: 'TRANSCEND', color: '#ff44aa' },
        '8_BLUEPRINT': { name: 'BLUEPRINT', color: '#00ffcc' }
    };

    // Required fields for each tier
    const TIER_REQUIREMENTS = {
        BRONZE: [], // No DNA at all
        SILVER: ['name', 'version', 'purpose', 'domain', 'sphere', 'created', 'status'],
        GOLD: ['name', 'version', 'purpose', 'domain', 'sphere', 'created', 'status',
               'owner', 'changelog', 'trinity', 'lfsme', 'connects_to']
    };

    /**
     * Extract DNA from current page
     */
    function extract() {
        const dnaElement = document.getElementById('dashboard-dna');
        if (!dnaElement) {
            return null;
        }
        try {
            return JSON.parse(dnaElement.textContent);
        } catch (e) {
            console.error('Failed to parse dashboard DNA:', e);
            return null;
        }
    }

    /**
     * Validate DNA against Gold Standard
     */
    function validate(dna) {
        if (!dna) {
            return {
                valid: false,
                tier: 'BRONZE',
                score: 0,
                errors: ['No DNA found'],
                warnings: [],
                details: {}
            };
        }

        const errors = [];
        const warnings = [];
        const details = {
            hasOwner: !!dna.owner,
            hasChangelog: Array.isArray(dna.changelog) && dna.changelog.length > 0,
            hasTrinity: !!dna.trinity,
            hasLFSME: !!dna.lfsme,
            hasConnections: Array.isArray(dna.connects_to) && dna.connects_to.length > 0,
            trinityComplete: false,
            challengePassed: false
        };

        // Check required Silver fields
        for (const field of TIER_REQUIREMENTS.SILVER) {
            if (!dna[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        // Check version format
        if (dna.version && !/^\d+\.\d+\.\d+$/.test(dna.version)) {
            warnings.push('Version should be semver format (x.x.x)');
        }

        // Check domain validity
        if (dna.domain && !DOMAINS[dna.domain]) {
            warnings.push(`Unknown domain: ${dna.domain}`);
        }

        // Check Trinity block
        if (dna.trinity) {
            if (!dna.trinity.c1_built) {
                warnings.push('Trinity: c1_built not set');
            }
            if (!dna.trinity.c2_reviewed) {
                warnings.push('Trinity: c2_reviewed not set');
            }
            if (!dna.trinity.c3_validated) {
                warnings.push('Trinity: c3_validated not set');
            }
            details.trinityComplete = !!(dna.trinity.c1_built &&
                                         dna.trinity.c2_reviewed &&
                                         dna.trinity.c3_validated);
        }

        // Check LFSME block
        if (dna.lfsme) {
            const lfsmeFields = ['lighter', 'faster', 'stronger', 'elegant', 'less_expensive'];
            for (const field of lfsmeFields) {
                if (typeof dna.lfsme[field] !== 'number') {
                    warnings.push(`LFSME: ${field} should be a number`);
                } else if (dna.lfsme[field] < 1 || dna.lfsme[field] > 10) {
                    warnings.push(`LFSME: ${field} should be 1-10`);
                }
            }
        }

        // Check challenge block
        if (dna.challenge) {
            details.challengePassed = !!dna.challenge.passed;
        }

        // Determine tier
        let tier = 'BRONZE';
        if (errors.length === 0) {
            tier = 'SILVER';

            // Check for GOLD requirements
            const goldFields = ['owner', 'changelog', 'trinity', 'lfsme'];
            const hasGoldFields = goldFields.every(f => !!dna[f]);

            if (hasGoldFields && details.trinityComplete) {
                tier = 'GOLD';
            }
        }

        // Calculate score (0-10)
        let score = 10;
        score -= errors.length * 1.5;
        score -= warnings.length * 0.3;
        score = Math.max(0, Math.min(10, score));

        return {
            valid: errors.length === 0,
            tier,
            score: Math.round(score * 10) / 10,
            errors,
            warnings,
            details
        };
    }

    /**
     * Get tier badge HTML
     */
    function getTierBadge(tier) {
        const badges = {
            GOLD: { emoji: '🥇', color: '#ffd700', text: 'GOLD' },
            SILVER: { emoji: '🥈', color: '#c0c0c0', text: 'SILVER' },
            BRONZE: { emoji: '🥉', color: '#cd7f32', text: 'BRONZE' }
        };
        const badge = badges[tier] || badges.BRONZE;
        return `<span style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: ${badge.color}22;
            border: 1px solid ${badge.color};
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            color: ${badge.color};
        ">${badge.emoji} ${badge.text}</span>`;
    }

    /**
     * Display validation badge on page
     */
    function displayBadge(options = {}) {
        const {
            position = 'bottom-left',
            showDetails = false
        } = options;

        const dna = extract();
        const result = validate(dna);

        const positions = {
            'bottom-left': 'bottom: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 80px;',
            'top-left': 'top: 60px; left: 20px;',
            'top-right': 'top: 60px; right: 20px;'
        };

        const badge = document.createElement('div');
        badge.id = 'dna-validation-badge';
        badge.innerHTML = `
            <div style="
                position: fixed;
                ${positions[position] || positions['bottom-left']}
                z-index: 9998;
                background: #111;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 10px;
                font-family: system-ui, sans-serif;
                font-size: 12px;
                color: #fff;
                cursor: pointer;
                transition: all 0.3s;
            " onclick="DashboardDNA.showReport()">
                ${getTierBadge(result.tier)}
                <div style="margin-top: 6px; color: #888;">
                    Score: ${result.score}/10
                </div>
                ${result.errors.length > 0 ? `<div style="color: #ff4444; margin-top: 4px;">⚠️ ${result.errors.length} errors</div>` : ''}
            </div>
        `;

        // Remove existing badge
        const existing = document.getElementById('dna-validation-badge');
        if (existing) existing.remove();

        document.body.appendChild(badge);
    }

    /**
     * Show full validation report
     */
    function showReport() {
        const dna = extract();
        const result = validate(dna);

        const report = document.createElement('div');
        report.id = 'dna-validation-report';
        report.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            " onclick="this.remove()">
                <div style="
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    font-family: system-ui, sans-serif;
                    color: #fff;
                " onclick="event.stopPropagation()">
                    <h2 style="margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
                        Dashboard DNA Report
                        ${getTierBadge(result.tier)}
                    </h2>

                    <div style="margin-bottom: 16px;">
                        <strong>Name:</strong> ${dna?.name || 'Unknown'}<br>
                        <strong>Domain:</strong> ${dna?.domain || 'Unknown'}<br>
                        <strong>Score:</strong> ${result.score}/10
                    </div>

                    ${result.errors.length > 0 ? `
                        <div style="background: #ff444422; border: 1px solid #ff4444; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                            <strong style="color: #ff4444;">❌ Errors (${result.errors.length})</strong>
                            <ul style="margin: 8px 0 0 20px; color: #ff8888;">
                                ${result.errors.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${result.warnings.length > 0 ? `
                        <div style="background: #ffaa0022; border: 1px solid #ffaa00; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                            <strong style="color: #ffaa00;">⚠️ Warnings (${result.warnings.length})</strong>
                            <ul style="margin: 8px 0 0 20px; color: #ffcc66;">
                                ${result.warnings.map(w => `<li>${w}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <div style="background: #00ff8822; border: 1px solid #00ff88; border-radius: 8px; padding: 12px;">
                        <strong style="color: #00ff88;">✅ Details</strong>
                        <ul style="margin: 8px 0 0 20px; color: #88ffaa;">
                            <li>Owner: ${result.details.hasOwner ? '✓' : '✗'}</li>
                            <li>Changelog: ${result.details.hasChangelog ? '✓' : '✗'}</li>
                            <li>Trinity Block: ${result.details.hasTrinity ? '✓' : '✗'}</li>
                            <li>Trinity Complete: ${result.details.trinityComplete ? '✓' : '✗'}</li>
                            <li>LFSME Scores: ${result.details.hasLFSME ? '✓' : '✗'}</li>
                            <li>Challenge Passed: ${result.details.challengePassed ? '✓' : '✗'}</li>
                        </ul>
                    </div>

                    <button style="
                        margin-top: 16px;
                        padding: 10px 20px;
                        background: #333;
                        border: 1px solid #555;
                        border-radius: 6px;
                        color: #fff;
                        cursor: pointer;
                        width: 100%;
                    " onclick="this.closest('#dna-validation-report').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(report);
    }

    /**
     * Upgrade DNA to Gold Standard (returns upgraded DNA object)
     */
    function upgrade(dna) {
        if (!dna) return null;

        const today = new Date().toISOString().split('T')[0];
        const upgraded = { ...dna };

        // Ensure all required fields
        if (!upgraded.version) upgraded.version = '1.0.0';
        if (!upgraded.status) upgraded.status = 'LIVE';
        if (!upgraded.created) upgraded.created = today;
        if (!upgraded.updated) upgraded.updated = today;

        // Add missing Gold fields
        if (!upgraded.owner) upgraded.owner = 'Unknown';
        if (!upgraded.changelog) {
            upgraded.changelog = [
                { version: upgraded.version, date: upgraded.created, changes: 'Initial' }
            ];
        }
        if (!upgraded.trinity) {
            upgraded.trinity = { c1_built: today, c2_reviewed: null, c3_validated: null };
        }
        if (!upgraded.lfsme) {
            upgraded.lfsme = {
                lighter: 8, faster: 8, stronger: 8, elegant: 8, less_expensive: 10, average: 8.4
            };
        }
        if (!upgraded.connects_to) upgraded.connects_to = [];
        if (!upgraded.challenge) {
            upgraded.challenge = { passed: false, date: null, holes_found: 0, holes_fixed: 0 };
        }

        return upgraded;
    }

    // Public API
    return {
        extract,
        validate,
        displayBadge,
        showReport,
        upgrade,
        getTierBadge,
        DOMAINS,
        TIER_REQUIREMENTS
    };
})();

// Auto-display badge if data attribute present
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.dataset.dnaBadge === 'true') {
        DashboardDNA.displayBadge();
    }
});
