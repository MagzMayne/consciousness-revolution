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
 * File: mndm-governance.js
 * Declaration ID: IP-336E5632-MLL28ZVJ
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

/** SIGNED BY MeRLynn - ID: MERLYNN-1d887604 - TIMESTAMP: 2025-12-19T05:53:06.523Z - HASH: 0d5f06ff */
/** SIGNED BY AGentR - ID: AGENTR-75d20111 - TIMESTAMP: 2025-12-19T05:53:06.523Z - HASH: 0d5f06ff */

/**
 * MNDM GOVERNANCE SYSTEM
 * MNDM token-based governance for platform decisions and access control
 */

class MNDMGovernance {
    constructor() {
        this.mndmTokenAddress = 'GK24fQQQKNF6JMsCd3rLfSr1n2tvr3bCJ7zAgNqxbA7r';
        this.governanceProposals = [];
        this.votingPower = {};
        this.minimumVotingPower = 1000; // Minimum MNDM to vote
        this.proposalThreshold = 5000; // Minimum MNDM to create proposals

        this.init();
    }

    init() {
        console.log('⚡ MNDM Governance System initializing...');
        this.loadProposals();

        // Add sample proposal if none exist
        if (this.governanceProposals.length === 0) {
            this.createSampleProposal();
        }

        this.setupGovernanceUI();
        console.log('✅ MNDM Governance ready');
    }

    /**
     * Create a sample proposal for demonstration
     */
    createSampleProposal() {
        const sampleProposal = {
            id: 'sample-001',
            title: 'Platform Development Fund Allocation',
            description: 'How should we allocate the next 10,000 MNDM from platform fees? This proposal determines funding priorities for Q4 2025 development including new AI features, UI improvements, and community initiatives.',
            options: ['AI Development (60%)', 'UI/UX Improvements (30%)', 'Community Initiatives (10%)', 'Balanced Allocation (25% each)'],
            creator: '0x0000000000000000000000000000000000000000', // Sample address
            createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
            votes: {},
            totalVotes: 0,
            status: 'active',
            endTime: Date.now() + (5 * 24 * 60 * 60 * 1000) // 5 days from now
        };

        // Add some sample votes
        sampleProposal.votes = {
            '0xefc6910e7624f164dae9d0f799954aa69c943c8d': { option: 0, power: 50000, timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000) },
            '0x4ccbefd7d3554bcbbc489b11af73a84d7baef4cb': { option: 3, power: 25000, timestamp: Date.now() - (12 * 60 * 60 * 1000) },
            '0x45a328572b2a06484e02eb5d4e4cb6004136eb16': { option: 1, power: 15000, timestamp: Date.now() - (6 * 60 * 60 * 1000) }
        };

        // Calculate total votes
        sampleProposal.totalVotes = Object.values(sampleProposal.votes).reduce((sum, vote) => sum + vote.power, 0);

        this.governanceProposals.push(sampleProposal);
        this.saveProposals();
    }

    /**
     * Check if user has voting power based on MNDM holdings
     */
    async getVotingPower(address) {
        if (!address) return 0;

        // Get MNDM balance from real-time balance system
        if (window.realTimeBalanceSystem && window.realTimeBalanceSystem.getBalances) {
            const balances = window.realTimeBalanceSystem.getBalances(address);
            if (balances && balances.tokens) {
                const mndmToken = balances.tokens.find(t => t.symbol === 'MNDM');
                if (mndmToken) {
                    return Math.floor(mndmToken.balance); // Whole tokens for voting power
                }
            }
        }

        return 0;
    }

    /**
     * Create a governance proposal
     */
    async createProposal(title, description, options = ['Yes', 'No']) {
        const address = this.getCurrentAddress();
        if (!address) {
            throw new Error('Wallet not connected');
        }

        const votingPower = await this.getVotingPower(address);
        if (votingPower < this.proposalThreshold) {
            throw new Error(`Need at least ${this.proposalThreshold} MNDM to create proposals`);
        }

        const proposal = {
            id: Date.now().toString(),
            title: title,
            description: description,
            options: options,
            creator: address,
            createdAt: Date.now(),
            votes: {},
            totalVotes: 0,
            status: 'active', // active, passed, rejected, executed
            endTime: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };

        this.governanceProposals.push(proposal);
        this.saveProposals();
        this.notifyProposalCreated(proposal);

        return proposal;
    }

    /**
     * Vote on a proposal
     */
    async vote(proposalId, optionIndex) {
        const address = this.getCurrentAddress();
        if (!address) {
            throw new Error('Wallet not connected');
        }

        const votingPower = await this.getVotingPower(address);
        if (votingPower < this.minimumVotingPower) {
            throw new Error(`Need at least ${this.minimumVotingPower} MNDM to vote`);
        }

        const proposal = this.governanceProposals.find(p => p.id === proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.status !== 'active') {
            throw new Error('Proposal is not active');
        }

        if (Date.now() > proposal.endTime) {
            throw new Error('Voting period has ended');
        }

        // Remove previous vote if exists
        if (proposal.votes[address]) {
            proposal.totalVotes -= proposal.votes[address].power;
        }

        // Add new vote
        proposal.votes[address] = {
            option: optionIndex,
            power: votingPower,
            timestamp: Date.now()
        };

        proposal.totalVotes += votingPower;
        this.saveProposals();
        this.notifyVoteCast(proposal, address);

        return proposal;
    }

    /**
     * Get current user address
     */
    getCurrentAddress() {
        // Check universal auth first
        if (window.universalWalletAuth && window.universalWalletAuth.getAddress) {
            return window.universalWalletAuth.getAddress();
        }

        // Fallback to shared wallet system
        if (window.sharedWalletSystem && window.sharedWalletSystem.address) {
            return window.sharedWalletSystem.address;
        }

        return null;
    }

    /**
     * Get active proposals
     */
    getActiveProposals() {
        return this.governanceProposals.filter(p =>
            p.status === 'active' && Date.now() < p.endTime
        );
    }

    /**
     * Get proposal results
     */
    getProposalResults(proposalId) {
        const proposal = this.governanceProposals.find(p => p.id === proposalId);
        if (!proposal) return null;

        const results = proposal.options.map((option, index) => ({
            option: option,
            votes: 0,
            percentage: 0
        }));

        // Count votes
        Object.values(proposal.votes).forEach(vote => {
            results[vote.option].votes += vote.power;
        });

        // Calculate percentages
        results.forEach(result => {
            result.percentage = proposal.totalVotes > 0 ?
                (result.votes / proposal.totalVotes) * 100 : 0;
        });

        return {
            proposal: proposal,
            results: results,
            totalVotes: proposal.totalVotes,
            isActive: proposal.status === 'active' && Date.now() < proposal.endTime
        };
    }

    /**
     * Setup governance UI
     */
    setupGovernanceUI() {
        // Add governance section to main hub
        this.addGovernanceSection();
    }

    /**
     * Add governance section to main hub
     */
    addGovernanceSection() {
        const governanceHTML = `
            <div class="content-panel" style="margin-top: 2rem;">
                <h2 style="color: var(--neon-orange); text-align: center;">⚡ MNDM GOVERNANCE</h2>
                <p style="text-align: center; color: #8addff; margin-bottom: 1rem; font-size: 0.9em;">
                    Govern the platform with your MNDM tokens - vote on proposals and shape the future!
                </p>
                <div id="governance-content">
                    <div style="text-align: center; margin: 2rem 0;">
                        <button class="cyber-btn" onclick="window.mndmGovernance.showCreateProposalModal()">📝 Create Proposal</button>
                        <button class="cyber-btn cyber-btn-secondary" onclick="window.mndmGovernance.refreshProposals()">🔄 Refresh</button>
                    </div>
                    <div id="governance-proposals" style="margin-top: 2rem;">
                        <div style="text-align: center; color: #8addff;">Loading proposals...</div>
                    </div>
                </div>
            </div>
        `;

        // Insert after balance display
        const balanceSection = document.querySelector('#balance-display-container');
        if (balanceSection && balanceSection.parentNode) {
            const governanceDiv = document.createElement('div');
            governanceDiv.innerHTML = governanceHTML;
            balanceSection.parentNode.insertBefore(governanceDiv, balanceSection.nextSibling);
        }
    }

    /**
     * Show create proposal modal
     */
    showCreateProposalModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 style="color: var(--neon-orange); margin-bottom: 1rem;">📝 Create Governance Proposal</h3>
                <form id="proposal-form">
                    <div style="margin-bottom: 1rem;">
                        <label style="color: var(--neon-blue);">Title:</label>
                        <input type="text" id="proposal-title" required style="width: 100%; padding: 8px; margin-top: 5px; background: rgba(20,20,20,0.9); border: 1px solid var(--neon-blue); color: var(--neon-blue); border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="color: var(--neon-blue);">Description:</label>
                        <textarea id="proposal-description" required rows="4" style="width: 100%; padding: 8px; margin-top: 5px; background: rgba(20,20,20,0.9); border: 1px solid var(--neon-blue); color: var(--neon-blue); border-radius: 5px;"></textarea>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="cyber-btn" style="flex: 1;">🚀 Submit Proposal</button>
                        <button type="button" class="cyber-btn cyber-btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1;">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('proposal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('proposal-title').value;
            const description = document.getElementById('proposal-description').value;

            try {
                await this.createProposal(title, description);
                modal.remove();
                alert('✅ Proposal created successfully!');
                this.refreshProposals();
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        });
    }

    /**
     * Refresh and display proposals
     */
    refreshProposals() {
        const proposalsDiv = document.getElementById('governance-proposals');
        if (!proposalsDiv) return;

        const activeProposals = this.getActiveProposals();

        if (activeProposals.length === 0) {
            proposalsDiv.innerHTML = '<div style="text-align: center; color: #8addff; padding: 2rem;">No active proposals</div>';
            return;
        }

        let html = '';
        activeProposals.forEach(proposal => {
            const results = this.getProposalResults(proposal.id);
            const timeLeft = Math.max(0, Math.ceil((proposal.endTime - Date.now()) / (24 * 60 * 60 * 1000)));

            html += `
                <div class="proposal-card" style="background: rgba(20,20,20,0.9); border: 1px solid var(--neon-orange); border-radius: 10px; padding: 1.5rem; margin-bottom: 1rem;">
                    <h4 style="color: var(--neon-orange); margin-bottom: 0.5rem;">${proposal.title}</h4>
                    <p style="color: #8addff; margin-bottom: 1rem; font-size: 0.9rem;">${proposal.description}</p>
                    <div style="color: #cccccc; font-size: 0.8rem; margin-bottom: 1rem;">
                        Created by: ${proposal.creator.slice(0, 6)}...${proposal.creator.slice(-4)} •
                        ${results.totalVotes} total votes • ${timeLeft} days left
                    </div>
                    <div class="proposal-options" style="display: grid; gap: 0.5rem;">
                        ${results.results.map((result, index) => `
                            <div class="option-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(0,0,0,0.5); border-radius: 5px;">
                                <span style="color: var(--neon-blue);">${result.option}</span>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 100px; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${result.percentage}%; height: 100%; background: var(--neon-green);"></div>
                                    </div>
                                    <span style="color: var(--neon-green); font-size: 0.8rem; min-width: 60px;">${result.votes} (${result.percentage.toFixed(1)}%)</span>
                                    <button class="cyber-btn" style="font-size: 0.7rem; padding: 4px 8px;" onclick="window.mndmGovernance.voteOnProposal('${proposal.id}', ${index})">Vote</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        proposalsDiv.innerHTML = html;
    }

    /**
     * Vote on a proposal (for UI)
     */
    async voteOnProposal(proposalId, optionIndex) {
        try {
            await this.vote(proposalId, optionIndex);
            alert('✅ Vote cast successfully!');
            this.refreshProposals();
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    }

    /**
     * Save proposals to localStorage
     */
    saveProposals() {
        localStorage.setItem('mndm-governance-proposals', JSON.stringify(this.governanceProposals));
    }

    /**
     * Load proposals from localStorage
     */
    loadProposals() {
        try {
            const saved = localStorage.getItem('mndm-governance-proposals');
            if (saved) {
                this.governanceProposals = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load proposals:', error);
        }
    }

    /**
     * Event notifications
     */
    notifyProposalCreated(proposal) {
        console.log('📝 New proposal created:', proposal.title);
        // Could dispatch custom events here
    }

    notifyVoteCast(proposal, voter) {
        console.log('🗳️ Vote cast on proposal:', proposal.title);
        // Could dispatch custom events here
    }
}

// Create global instance
window.mndmGovernance = new MNDMGovernance();

console.log('⚡ MNDM Governance System loaded - token-based platform governance enabled');
