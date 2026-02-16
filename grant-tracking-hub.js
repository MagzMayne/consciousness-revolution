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
 * File: grant-tracking-hub.js
 * Declaration ID: IP-6844AE07-MLL28ZV0
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Grant Application Tracking and Hub System
 * Tracks all submitted grant applications, funding status, and fund distribution
 * 
 * @author Barbrick Design
 * @date 2026-01-20
 */

(function() {
    'use strict';

    class GrantTrackingHub {
        constructor() {
            this.applications = [];
            this.projects = [];
            this.contributors = [];
            this.pool = {
                total: 0,
                donorShare: 0,
                projectEnhancement: 0,
                operations: 0
            };
            this.statistics = {
                totalSubmitted: 0,
                pending: 0,
                approved: 0,
                funded: 0,
                totalAwarded: 0
            };
        }

        /**
         * Initialize the hub
         */
        init() {
            this.loadData();
            this.calculateStatistics();
            this.setupEventListeners();
            console.log('✅ Grant Tracking Hub initialized');
        }

        /**
         * Submit new grant application
         */
        submitApplication(applicationData) {
            const application = {
                id: 'grant_' + Date.now(),
                grantName: applicationData.grantName,
                grantType: applicationData.grantType,
                agency: applicationData.agency,
                requestedAmount: applicationData.requestedAmount,
                projectTitle: applicationData.projectTitle,
                projectSummary: applicationData.projectSummary,
                applicantEmail: applicationData.applicantEmail,
                applicantName: applicationData.applicantName,
                linkedProjects: applicationData.linkedProjects || [],
                contributors: applicationData.contributors || [],
                status: 'submitted',
                submittedDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                fundingApproved: false,
                fundingAmount: 0,
                distributionStatus: 'pending',
                notes: []
            };

            this.applications.push(application);
            this.saveApplications();
            this.calculateStatistics();

            console.log('✅ Grant application submitted:', application.id);

            // Notify hub
            this.notifyUpdate({
                type: 'application_submitted',
                applicationId: application.id,
                grantName: application.grantName,
                requestedAmount: application.requestedAmount
            });

            return {
                success: true,
                application: application
            };
        }

        /**
         * Update application status
         */
        updateApplicationStatus(applicationId, status, notes = '') {
            const application = this.applications.find(a => a.id === applicationId);
            
            if (!application) {
                return {
                    success: false,
                    error: 'Application not found'
                };
            }

            const previousStatus = application.status;
            application.status = status;
            application.lastUpdated = new Date().toISOString();

            if (notes) {
                application.notes.push({
                    timestamp: new Date().toISOString(),
                    text: notes,
                    statusChange: `${previousStatus} → ${status}`
                });
            }

            this.saveApplications();
            this.calculateStatistics();

            console.log(`✅ Application ${applicationId} status updated: ${previousStatus} → ${status}`);

            // Notify hub
            this.notifyUpdate({
                type: 'application_status_updated',
                applicationId: application.id,
                previousStatus: previousStatus,
                newStatus: status
            });

            return {
                success: true,
                application: application
            };
        }

        /**
         * Approve funding for application
         */
        approveFunding(applicationId, fundingAmount) {
            const application = this.applications.find(a => a.id === applicationId);
            
            if (!application) {
                return {
                    success: false,
                    error: 'Application not found'
                };
            }

            application.fundingApproved = true;
            application.fundingAmount = fundingAmount;
            application.status = 'approved';
            application.approvedDate = new Date().toISOString();
            application.lastUpdated = new Date().toISOString();

            application.notes.push({
                timestamp: new Date().toISOString(),
                text: `Funding approved: $${fundingAmount.toLocaleString()}`,
                statusChange: 'Funding approved'
            });

            this.saveApplications();
            this.calculateStatistics();

            console.log(`✅ Funding approved for ${applicationId}: $${fundingAmount}`);

            // Distribute funds to pool
            this.distributeFunds(application);

            // Notify hub
            this.notifyUpdate({
                type: 'funding_approved',
                applicationId: application.id,
                grantName: application.grantName,
                fundingAmount: fundingAmount
            });

            return {
                success: true,
                application: application,
                distribution: this.pool
            };
        }

        /**
         * Distribute funds to pool when grant is funded
         */
        distributeFunds(application) {
            const fundingAmount = application.fundingAmount;

            // Distribution breakdown:
            // 10-20% to contributors (based on their tier)
            // 30% to donor pool
            // 30% to project enhancement
            // 20-30% to operations

            let contributorShare = 0;
            const contributorDistribution = [];

            // Calculate contributor shares
            if (application.contributors && application.contributors.length > 0) {
                application.contributors.forEach(contributor => {
                    const share = fundingAmount * (contributor.revenueShare / 100);
                    contributorShare += share;
                    contributorDistribution.push({
                        contributorId: contributor.id,
                        contributorName: contributor.name,
                        share: share,
                        percentage: contributor.revenueShare
                    });
                });
            }

            // Calculate remaining distribution
            const remainingAmount = fundingAmount - contributorShare;
            const donorShare = remainingAmount * 0.30; // 30% to donors
            const projectShare = remainingAmount * 0.30; // 30% to projects
            const operationsShare = remainingAmount * 0.40; // 40% to operations

            // Update pool
            this.pool.total += fundingAmount;
            this.pool.donorShare += donorShare;
            this.pool.projectEnhancement += projectShare;
            this.pool.operations += operationsShare;

            // Update application
            application.distributionStatus = 'completed';
            application.distributionDate = new Date().toISOString();
            application.distributionDetails = {
                contributorShare: contributorShare,
                contributorDistribution: contributorDistribution,
                donorShare: donorShare,
                projectShare: projectShare,
                operationsShare: operationsShare
            };

            this.savePool();
            this.saveApplications();

            console.log(`💰 Funds distributed for ${application.id}:`, {
                total: fundingAmount,
                contributors: contributorShare,
                donors: donorShare,
                projects: projectShare,
                operations: operationsShare
            });

            // Notify contributors of their earnings
            contributorDistribution.forEach(dist => {
                this.notifyContributor(dist.contributorId, {
                    type: 'revenue_earned',
                    applicationId: application.id,
                    grantName: application.grantName,
                    amount: dist.share
                });
            });

            // Notify hub of distribution
            this.notifyUpdate({
                type: 'funds_distributed',
                applicationId: application.id,
                distribution: application.distributionDetails,
                poolTotal: this.pool.total
            });
        }

        /**
         * Link project to application
         */
        linkProject(applicationId, projectData) {
            const application = this.applications.find(a => a.id === applicationId);
            
            if (!application) {
                return {
                    success: false,
                    error: 'Application not found'
                };
            }

            application.linkedProjects.push({
                projectId: projectData.projectId || 'proj_' + Date.now(),
                projectName: projectData.projectName,
                projectUrl: projectData.projectUrl,
                description: projectData.description,
                linkedDate: new Date().toISOString()
            });

            application.lastUpdated = new Date().toISOString();
            this.saveApplications();

            console.log(`✅ Project linked to ${applicationId}: ${projectData.projectName}`);

            return {
                success: true,
                application: application
            };
        }

        /**
         * Get all applications
         */
        getAllApplications() {
            return this.applications;
        }

        /**
         * Get applications by status
         */
        getApplicationsByStatus(status) {
            return this.applications.filter(a => a.status === status);
        }

        /**
         * Get applications by user
         */
        getApplicationsByUser(email) {
            return this.applications.filter(a => a.applicantEmail === email);
        }

        /**
         * Get application by ID
         */
        getApplication(applicationId) {
            return this.applications.find(a => a.id === applicationId);
        }

        /**
         * Get pool status
         */
        getPoolStatus() {
            return {
                ...this.pool,
                totalApplications: this.applications.length,
                fundedApplications: this.applications.filter(a => a.fundingApproved).length,
                pendingApplications: this.applications.filter(a => a.status === 'pending' || a.status === 'submitted').length
            };
        }

        /**
         * Get statistics
         */
        getStatistics() {
            return this.statistics;
        }

        /**
         * Calculate statistics
         */
        calculateStatistics() {
            this.statistics.totalSubmitted = this.applications.length;
            this.statistics.pending = this.applications.filter(a => 
                a.status === 'pending' || a.status === 'submitted' || a.status === 'under_review'
            ).length;
            this.statistics.approved = this.applications.filter(a => 
                a.status === 'approved' || a.fundingApproved
            ).length;
            this.statistics.funded = this.applications.filter(a => 
                a.fundingApproved && a.distributionStatus === 'completed'
            ).length;
            this.statistics.totalAwarded = this.applications
                .filter(a => a.fundingApproved)
                .reduce((sum, a) => sum + a.fundingAmount, 0);
        }

        /**
         * Notify hub update
         */
        notifyUpdate(data) {
            const updates = JSON.parse(localStorage.getItem('hub_updates') || '[]');
            updates.push({
                ...data,
                timestamp: new Date().toISOString(),
                id: 'update_' + Date.now()
            });

            // Keep last 200 updates
            if (updates.length > 200) {
                updates.shift();
            }

            localStorage.setItem('hub_updates', JSON.stringify(updates));

            // Dispatch event
            window.dispatchEvent(new CustomEvent('grantHubUpdate', {
                detail: data
            }));

            console.log('📢 Hub update:', data.type);
        }

        /**
         * Notify contributor
         */
        notifyContributor(contributorId, data) {
            const notifications = JSON.parse(localStorage.getItem(`contributor_${contributorId}_notifications`) || '[]');
            notifications.push({
                ...data,
                timestamp: new Date().toISOString(),
                id: 'notif_' + Date.now(),
                read: false
            });

            // Keep last 50 notifications per contributor
            if (notifications.length > 50) {
                notifications.shift();
            }

            localStorage.setItem(`contributor_${contributorId}_notifications`, JSON.stringify(notifications));

            console.log(`📨 Contributor ${contributorId} notified:`, data.type);
        }

        /**
         * Get contributor dashboard data
         */
        getContributorDashboard(contributorEmail) {
            const applications = this.applications.filter(a => 
                a.contributors && a.contributors.some(c => c.email === contributorEmail)
            );

            const totalEarned = applications
                .filter(a => a.distributionStatus === 'completed')
                .reduce((sum, a) => {
                    const contributor = a.contributors.find(c => c.email === contributorEmail);
                    if (contributor && a.distributionDetails) {
                        const dist = a.distributionDetails.contributorDistribution.find(d => d.contributorId === contributor.id);
                        return sum + (dist ? dist.share : 0);
                    }
                    return sum;
                }, 0);

            return {
                applications: applications,
                totalApplications: applications.length,
                pending: applications.filter(a => a.status === 'pending' || a.status === 'submitted').length,
                approved: applications.filter(a => a.fundingApproved).length,
                totalEarned: totalEarned,
                recentApplications: applications.slice(-5).reverse()
            };
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Listen for PayPal webhook events
            window.addEventListener('paypalWebhook', (event) => {
                this.handlePayPalWebhook(event.detail);
            });

            // Listen for hub updates
            window.addEventListener('hubUpdate', (event) => {
                console.log('Hub update received:', event.detail);
            });
        }

        /**
         * Handle PayPal webhook
         */
        handlePayPalWebhook(data) {
            if (data.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
                console.log('💰 Payment completed, updating contributor status');
                // Additional processing if needed
            }
        }

        /**
         * Save applications to storage
         */
        saveApplications() {
            localStorage.setItem('grant_applications', JSON.stringify(this.applications));
        }

        /**
         * Load applications from storage
         */
        loadApplications() {
            const stored = localStorage.getItem('grant_applications');
            if (stored) {
                try {
                    this.applications = JSON.parse(stored);
                } catch (error) {
                    console.error('Error loading applications:', error);
                }
            }
        }

        /**
         * Save pool to storage
         */
        savePool() {
            localStorage.setItem('grant_pool', JSON.stringify(this.pool));
        }

        /**
         * Load pool from storage
         */
        loadPool() {
            const stored = localStorage.getItem('grant_pool');
            if (stored) {
                try {
                    this.pool = JSON.parse(stored);
                } catch (error) {
                    console.error('Error loading pool:', error);
                }
            }
        }

        /**
         * Load all data
         */
        loadData() {
            this.loadApplications();
            this.loadPool();
        }

        /**
         * Export data for reporting
         */
        exportData() {
            return {
                applications: this.applications,
                pool: this.pool,
                statistics: this.statistics,
                exportDate: new Date().toISOString()
            };
        }
    }

    // Create global instance
    window.grantTrackingHub = new GrantTrackingHub();

    // Auto-initialize on load
    window.addEventListener('load', () => {
        window.grantTrackingHub.init();
    });

    console.log('✅ Grant Tracking Hub module loaded');
})();
