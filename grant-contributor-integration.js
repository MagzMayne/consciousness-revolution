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
 * File: grant-contributor-integration.js
 * Declaration ID: IP-18A01DA-MLL28ZV0
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Grant Contributor Integration
 * Connects the contributor system with government grant applications
 * 
 * @author BarbrickDesign
 * @date 2026-01-20
 */

(function() {
    'use strict';

    // Wait for both systems to load
    const checkSystems = setInterval(() => {
        if (window.ContributorGrantSystem && window.GovernmentGrantAI) {
            clearInterval(checkSystems);
            initializeIntegration();
        }
    }, 100);

    function initializeIntegration() {
        console.log('[GrantContributorIntegration] Initializing integration...');

        // Extend GovernmentGrantAI with contributor features
        if (window.GovernmentGrantAI && window.GovernmentGrantAI.prototype) {
            extendGrantAISystem();
        }

        // Add contributor features to grant portal
        if (document.querySelector('.grant-application-form')) {
            enhanceGrantApplicationForm();
        }

        console.log('[GrantContributorIntegration] Integration complete');
    }

    function extendGrantAISystem() {
        const originalGenerateProposal = window.GovernmentGrantAI.prototype.generateProposal;

        // Override generateProposal to include contributors
        window.GovernmentGrantAI.prototype.generateProposal = function(grantId, profileData) {
            const proposal = originalGenerateProposal.call(this, grantId, profileData);
            
            // Add contributor team section
            if (profileData.projectIds && profileData.projectIds.length > 0) {
                const teamSection = window.ContributorGrantSystem.generateGrantTeamSection(profileData.projectIds);
                proposal.teamQualifications = teamSection;
                
                // Get team members
                const teamMembers = window.ContributorGrantSystem.getGrantTeamMembers(profileData.projectIds);
                proposal.contributors = teamMembers;
            }
            
            return proposal;
        };

        console.log('[GrantContributorIntegration] Extended GovernmentGrantAI with contributor features');
    }

    function enhanceGrantApplicationForm() {
        // Add contributor selection section to grant application form
        const form = document.querySelector('.grant-application-form');
        if (!form) return;

        const contributorSection = document.createElement('div');
        contributorSection.className = 'form-section contributor-section';
        contributorSection.innerHTML = `
            <h3>📋 Project Contributors</h3>
            <p>Select projects to automatically include contributors in your grant application team:</p>
            <div id="project-contributor-selector">
                <div id="contributor-list"></div>
            </div>
            <button type="button" class="btn btn-secondary" onclick="window.grantContributorIntegration.refreshContributors()">
                Refresh Contributors
            </button>
        `;

        // Insert before submit button
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.parentNode.insertBefore(contributorSection, submitButton);
        } else {
            form.appendChild(contributorSection);
        }

        renderContributorList();
    }

    function renderContributorList() {
        const container = document.getElementById('contributor-list');
        if (!container) return;

        const contributors = window.ContributorGrantSystem.getContributors();
        const contributorList = Object.values(contributors);

        if (contributorList.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; background: #f0f0f0; border-radius: 10px;">
                    <p>No contributors registered yet.</p>
                    <a href="contributor-registration.html" class="btn btn-primary">Register Contributors</a>
                </div>
            `;
            return;
        }

        let html = '<div class="contributors-grid">';
        
        contributorList.forEach(contributor => {
            const tierConfig = window.ContributorGrantSystem.CONFIG.tiers[contributor.tier];
            html += `
                <div class="contributor-card">
                    <div class="contributor-badge">${tierConfig.badge}</div>
                    <div class="contributor-name">${contributor.name}</div>
                    <div class="contributor-tier">${tierConfig.name}</div>
                    <div class="contributor-share">${contributor.revenueShare}% Revenue Share</div>
                    <div class="contributor-stats">
                        <span>Projects: ${contributor.projects.length}</span>
                        <span>Contributions: ${contributor.contributions.length}</span>
                    </div>
                    ${contributor.skills.length > 0 ? `
                        <div class="contributor-skills">
                            ${contributor.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // Public API
    window.grantContributorIntegration = {
        refreshContributors: function() {
            renderContributorList();
        },

        /**
         * Submit grant application with contributors
         */
        submitGrantWithContributors: function(grantData) {
            try {
                // Get applicable contributors
                const contributors = window.ContributorGrantSystem.getGrantTeamMembers(grantData.projectIds || []);
                
                // Link each contributor to the grant
                contributors.forEach(contributor => {
                    window.ContributorGrantSystem.linkToGrantApplication(contributor.id, {
                        grantId: grantData.grantId,
                        grantName: grantData.grantName,
                        grantAgency: grantData.grantAgency,
                        projectIds: grantData.projectIds,
                        role: 'Team Member',
                        fundingAmount: grantData.requestedAmount || 0
                    });
                });

                console.log(`[GrantContributorIntegration] Linked ${contributors.length} contributors to grant ${grantData.grantId}`);
                
                return {
                    success: true,
                    contributorCount: contributors.length,
                    contributors: contributors
                };
            } catch (error) {
                console.error('[GrantContributorIntegration] Error linking contributors:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        /**
         * Process funded grant and distribute revenue
         */
        processFundedGrant: function(grantId, fundingAmount) {
            try {
                const result = window.ContributorGrantSystem.processGrantSuccess(grantId, fundingAmount);
                
                if (result.success) {
                    console.log(`[GrantContributorIntegration] Successfully distributed $${result.totalDistributed} to ${result.contributorCount} contributors`);
                    
                    // Show success notification
                    showGrantSuccessNotification(result);
                }
                
                return result;
            } catch (error) {
                console.error('[GrantContributorIntegration] Error processing funded grant:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        /**
         * Get contributor dashboard data
         */
        getContributorDashboard: function(contributorId) {
            const contributor = window.ContributorGrantSystem.getContributor(contributorId);
            if (!contributor) return null;

            const tierConfig = window.ContributorGrantSystem.CONFIG.tiers[contributor.tier];
            
            return {
                profile: {
                    name: contributor.name,
                    tier: tierConfig.name,
                    badge: tierConfig.badge,
                    revenueShare: contributor.revenueShare + '%',
                    status: contributor.status
                },
                stats: {
                    totalEarnings: contributor.totalEarnings,
                    contributions: contributor.contributions.length,
                    projects: contributor.projects.length,
                    grantApplications: contributor.grantApplications.length,
                    fundedGrants: contributor.grantApplications.filter(g => g.status === 'funded').length
                },
                recentContributions: contributor.contributions.slice(-5).reverse(),
                grantApplications: contributor.grantApplications.slice(-10).reverse(),
                upcomingPayments: contributor.grantApplications
                    .filter(g => g.status === 'funded' && !g.paidOut)
                    .map(g => ({
                        grantName: g.grantName,
                        amount: g.revenueShareAmount,
                        date: g.appliedDate
                    }))
            };
        },

        /**
         * Export contributor data for grant applications
         */
        exportContributorData: function(contributorIds) {
            const contributors = contributorIds.map(id => 
                window.ContributorGrantSystem.getContributor(id)
            ).filter(c => c !== null);

            return {
                teamSize: contributors.length,
                totalContributions: contributors.reduce((sum, c) => sum + c.contributions.length, 0),
                expertise: Array.from(new Set(contributors.flatMap(c => c.skills))),
                contributors: contributors.map(c => ({
                    name: c.name,
                    role: 'Developer/Contributor',
                    tier: window.ContributorGrantSystem.CONFIG.tiers[c.tier].name,
                    skills: c.skills,
                    contributions: c.contributions.length,
                    githubUsername: c.githubUsername,
                    portfolioUrl: c.portfolioUrl
                }))
            };
        }
    };

    function showGrantSuccessNotification(result) {
        const notification = document.createElement('div');
        notification.className = 'grant-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🎉</div>
                <h3>Grant Funded Successfully!</h3>
                <p>Revenue distributed to ${result.contributorCount} contributors</p>
                <p class="amount">Total: $${result.totalDistributed.toLocaleString()}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    // Add CSS for contributor cards
    const style = document.createElement('style');
    style.textContent = `
        .contributor-section {
            margin: 30px 0;
            padding: 25px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
        }

        .contributors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }

        .contributor-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            transition: all 0.3s ease;
        }

        .contributor-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .contributor-badge {
            font-size: 3em;
            margin-bottom: 10px;
        }

        .contributor-name {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .contributor-tier {
            font-size: 0.9em;
            opacity: 0.8;
            margin-bottom: 10px;
        }

        .contributor-share {
            background: rgba(16, 185, 129, 0.3);
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .contributor-stats {
            display: flex;
            justify-content: space-around;
            font-size: 0.85em;
            opacity: 0.8;
            margin: 10px 0;
        }

        .contributor-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            justify-content: center;
            margin-top: 10px;
        }

        .skill-tag {
            background: rgba(99, 102, 241, 0.3);
            padding: 3px 8px;
            border-radius: 5px;
            font-size: 0.75em;
        }

        .grant-success-notification {
            animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translate(-50%, -60%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }

        .notification-icon {
            font-size: 4em;
            margin-bottom: 15px;
        }

        .notification-content h3 {
            margin-bottom: 10px;
            color: #333;
        }

        .notification-content p {
            color: #666;
            margin: 5px 0;
        }

        .notification-content .amount {
            font-size: 1.5em;
            font-weight: bold;
            color: #10b981;
            margin: 15px 0;
        }

        .notification-content button {
            margin-top: 20px;
            padding: 10px 30px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    console.log('[GrantContributorIntegration] Module loaded successfully');
})();
