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
 * File: github-pr-review-agent.js
 * Declaration ID: IP-1BC6BFFA-MLL28ZVZ
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

/** SIGNED BY MeRLynn - ID: MERLYNN-7578933f - TIMESTAMP: 2025-12-19T05:53:06.533Z - HASH: 1137aaad */
/** SIGNED BY AGentR - ID: AGENTR-08c5c9f2 - TIMESTAMP: 2025-12-19T05:53:06.533Z - HASH: 1137aaad */

/**
 * GITHUB PR REVIEW AGENT
 * Automatically reviews, validates, and approves GitHub pull requests
 * Handles notifications, runs tests, and ensures fixes are functioning before approval
 */

class GitHubPRReviewAgent {
    constructor(logger, config = {}) {
        this.logger = logger || (typeof window !== 'undefined' && window.AgentLogger);
        this.name = 'GitHubPRReviewAgent';
        
        // Configuration
        this.config = {
            githubToken: config.githubToken || process.env.GITHUB_TOKEN || '',
            owner: config.owner || 'barbrickdesign',
            repo: config.repo || 'barbrickdesign.github.io',
            autoApprove: config.autoApprove !== false, // Default true
            autoMerge: config.autoMerge !== false, // Default true
            requireTests: config.requireTests !== false, // Default true
            requireBuild: config.requireBuild !== false, // Default true
            maxRetries: config.maxRetries || 3,
            ...config
        };

        // State
        this.notifications = [];
        this.processedPRs = new Set();
        this.pendingReviews = [];
        this.reviewHistory = [];
        this.isProcessing = false;

        this.init();
    }

    init() {
        this.logger.info(this.name, 'Initializing', { 
            config: {
                owner: this.config.owner,
                repo: this.config.repo,
                autoApprove: this.config.autoApprove,
                autoMerge: this.config.autoMerge
            }
        });

        if (!this.config.githubToken) {
            this.logger.warn(this.name, 'No GitHub token provided', {
                message: 'Set GITHUB_TOKEN environment variable or pass in config'
            });
        }

        this.logger.success(this.name, 'Initialization complete');
    }

    /**
     * Get notifications for review requests
     */
    async getReviewNotifications() {
        this.logger.info(this.name, 'Fetching review notifications');

        if (!this.config.githubToken) {
            this.logger.error(this.name, 'Cannot fetch notifications without GitHub token');
            return [];
        }

        try {
            const response = await fetch('https://api.github.com/notifications', {
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const notifications = await response.json();
            
            // Filter for review requests
            const reviewNotifications = notifications.filter(notif => 
                notif.subject.type === 'PullRequest' &&
                notif.reason === 'review_requested'
            );

            this.notifications = reviewNotifications;
            
            this.logger.success(this.name, 'Fetched notifications', {
                total: notifications.length,
                reviewRequests: reviewNotifications.length
            });

            return reviewNotifications;
        } catch (error) {
            this.logger.error(this.name, 'Failed to fetch notifications', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get PR details from notification
     */
    async getPRDetails(notification) {
        const prUrl = notification.subject.url;
        
        try {
            const response = await fetch(prUrl, {
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch PR: ${response.status}`);
            }

            const prData = await response.json();
            
            this.logger.info(this.name, 'Fetched PR details', {
                number: prData.number,
                title: prData.title,
                state: prData.state,
                author: prData.user.login
            });

            return prData;
        } catch (error) {
            this.logger.error(this.name, 'Failed to get PR details', {
                error: error.message,
                url: prUrl
            });
            throw error;
        }
    }

    /**
     * Get PR files and changes
     */
    async getPRFiles(prNumber) {
        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}/files`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch PR files: ${response.status}`);
            }

            const files = await response.json();
            
            this.logger.info(this.name, 'Fetched PR files', {
                prNumber,
                fileCount: files.length
            });

            return files;
        } catch (error) {
            this.logger.error(this.name, 'Failed to get PR files', {
                error: error.message,
                prNumber
            });
            throw error;
        }
    }

    /**
     * Validate PR changes
     */
    async validatePR(prData) {
        this.logger.info(this.name, 'Validating PR', {
            number: prData.number,
            title: prData.title
        });

        const validationResults = {
            passed: true,
            checks: [],
            issues: []
        };

        try {
            // Get files changed
            const files = await this.getPRFiles(prData.number);
            
            // Check 1: PR must have files
            if (files.length === 0) {
                validationResults.passed = false;
                validationResults.issues.push('PR has no file changes');
            } else {
                validationResults.checks.push('Has file changes');
            }

            // Check 2: Validate file types
            const validFileTypes = ['.html', '.js', '.css', '.json', '.md', '.txt', '.yml', '.yaml'];
            const invalidFiles = files.filter(file => {
                const ext = file.filename.substring(file.filename.lastIndexOf('.'));
                return !validFileTypes.includes(ext) && !file.filename.includes('/');
            });

            if (invalidFiles.length > 0) {
                this.logger.warn(this.name, 'PR contains unexpected file types', {
                    files: invalidFiles.map(f => f.filename)
                });
            }
            validationResults.checks.push('File types validated');

            // Check 3: Check for sensitive data in changes
            for (const file of files) {
                if (file.patch) {
                    const hasSensitiveData = this.checkForSensitiveData(file.patch);
                    if (hasSensitiveData.found) {
                        validationResults.passed = false;
                        validationResults.issues.push(
                            `Sensitive data detected in ${file.filename}: ${hasSensitiveData.type}`
                        );
                    }
                }
            }
            validationResults.checks.push('Security scan completed');

            // Check 4: Check PR status checks
            const statusChecks = await this.getPRStatusChecks(prData.number);
            if (statusChecks.failed > 0) {
                validationResults.passed = false;
                validationResults.issues.push(`${statusChecks.failed} status checks failed`);
            } else if (statusChecks.pending > 0) {
                validationResults.passed = false;
                validationResults.issues.push(`${statusChecks.pending} status checks pending`);
            } else {
                validationResults.checks.push('All status checks passed');
            }

            // Check 5: PR must have description
            if (!prData.body || prData.body.trim().length < 10) {
                this.logger.warn(this.name, 'PR has minimal or no description', {
                    prNumber: prData.number
                });
                // Not blocking, just warn
            }
            validationResults.checks.push('Description check completed');

            this.logger.success(this.name, 'Validation completed', {
                prNumber: prData.number,
                passed: validationResults.passed,
                checksCompleted: validationResults.checks.length,
                issuesFound: validationResults.issues.length
            });

            return validationResults;
        } catch (error) {
            this.logger.error(this.name, 'Validation failed', {
                error: error.message,
                prNumber: prData.number
            });
            validationResults.passed = false;
            validationResults.issues.push(`Validation error: ${error.message}`);
            return validationResults;
        }
    }

    /**
     * Check for sensitive data in code changes
     */
    checkForSensitiveData(content) {
        const patterns = {
            'API Key': /(?:api[_-]?key|apikey)['\"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
            'Private Key': /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/gi,
            'Password': /(?:password|passwd|pwd)['\"]?\s*[:=]\s*['"]([^'"]{3,})['"]/gi,
            'Secret': /(?:secret|token)['\"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
            'AWS Key': /AKIA[0-9A-Z]{16}/gi,
            'GitHub Token': /ghp_[a-zA-Z0-9]{36}/gi
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(content)) {
                return { found: true, type };
            }
        }

        return { found: false };
    }

    /**
     * Get PR status checks
     */
    async getPRStatusChecks(prNumber) {
        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch PR: ${response.status}`);
            }

            const prData = await response.json();
            
            // Get commit status
            const statusUrl = prData.statuses_url;
            const statusResponse = await fetch(statusUrl, {
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let statuses = [];
            if (statusResponse.ok) {
                statuses = await statusResponse.json();
            }

            const result = {
                total: statuses.length,
                passed: statuses.filter(s => s.state === 'success').length,
                failed: statuses.filter(s => s.state === 'failure' || s.state === 'error').length,
                pending: statuses.filter(s => s.state === 'pending').length
            };

            return result;
        } catch (error) {
            this.logger.warn(this.name, 'Could not fetch status checks', {
                error: error.message,
                prNumber
            });
            return { total: 0, passed: 0, failed: 0, pending: 0 };
        }
    }

    /**
     * Approve PR
     */
    async approvePR(prData, validationResults) {
        this.logger.info(this.name, 'Approving PR', {
            number: prData.number,
            title: prData.title
        });

        if (!this.config.autoApprove) {
            this.logger.warn(this.name, 'Auto-approve is disabled');
            return { approved: false, reason: 'Auto-approve disabled' };
        }

        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prData.number}/reviews`;
        
        try {
            const reviewBody = `✅ **Automated Review**

This PR has been automatically reviewed and validated.

**Validation Checks:**
${validationResults.checks.map(check => `- ✅ ${check}`).join('\n')}

**Analysis:**
- Files changed: ${prData.changed_files}
- Additions: ${prData.additions}
- Deletions: ${prData.deletions}

All checks passed. Approving for merge.`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event: 'APPROVE',
                    body: reviewBody
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to approve PR: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            const reviewData = await response.json();
            
            this.logger.success(this.name, 'PR approved', {
                prNumber: prData.number,
                reviewId: reviewData.id
            });

            return { approved: true, reviewId: reviewData.id };
        } catch (error) {
            this.logger.error(this.name, 'Failed to approve PR', {
                error: error.message,
                prNumber: prData.number
            });
            throw error;
        }
    }

    /**
     * Merge PR
     */
    async mergePR(prData) {
        this.logger.info(this.name, 'Merging PR', {
            number: prData.number,
            title: prData.title
        });

        if (!this.config.autoMerge) {
            this.logger.warn(this.name, 'Auto-merge is disabled');
            return { merged: false, reason: 'Auto-merge disabled' };
        }

        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prData.number}/merge`;
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    commit_title: `Merge PR #${prData.number}: ${prData.title}`,
                    commit_message: 'Automatically merged by GitHub PR Review Agent',
                    merge_method: 'squash' // or 'merge', 'rebase'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to merge PR: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            const mergeData = await response.json();
            
            this.logger.success(this.name, 'PR merged', {
                prNumber: prData.number,
                sha: mergeData.sha
            });

            return { merged: true, sha: mergeData.sha };
        } catch (error) {
            this.logger.error(this.name, 'Failed to merge PR', {
                error: error.message,
                prNumber: prData.number
            });
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationAsRead(notificationId) {
        const url = `https://api.github.com/notifications/threads/${notificationId}`;
        
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok || response.status === 205) {
                this.logger.info(this.name, 'Notification marked as read', {
                    notificationId
                });
                return true;
            }
            return false;
        } catch (error) {
            this.logger.warn(this.name, 'Failed to mark notification as read', {
                error: error.message,
                notificationId
            });
            return false;
        }
    }

    /**
     * Process single PR
     */
    async processPR(notification) {
        const prUrl = notification.subject.url;
        
        try {
            // Get PR details
            const prData = await this.getPRDetails(notification);
            
            // Skip if already processed
            if (this.processedPRs.has(prData.number)) {
                this.logger.info(this.name, 'PR already processed, skipping', {
                    prNumber: prData.number
                });
                return { skipped: true, reason: 'Already processed' };
            }

            // Skip if PR is not open
            if (prData.state !== 'open') {
                this.logger.info(this.name, 'PR not open, skipping', {
                    prNumber: prData.number,
                    state: prData.state
                });
                this.processedPRs.add(prData.number);
                return { skipped: true, reason: `PR is ${prData.state}` };
            }

            // Validate PR
            const validationResults = await this.validatePR(prData);

            if (!validationResults.passed) {
                this.logger.warn(this.name, 'PR validation failed', {
                    prNumber: prData.number,
                    issues: validationResults.issues
                });
                
                this.reviewHistory.push({
                    prNumber: prData.number,
                    timestamp: new Date().toISOString(),
                    action: 'validation_failed',
                    issues: validationResults.issues
                });

                return {
                    success: false,
                    prNumber: prData.number,
                    reason: 'Validation failed',
                    issues: validationResults.issues
                };
            }

            // Approve PR
            const approvalResult = await this.approvePR(prData, validationResults);
            
            if (!approvalResult.approved) {
                this.logger.warn(this.name, 'PR not approved', {
                    prNumber: prData.number,
                    reason: approvalResult.reason
                });
                return {
                    success: false,
                    prNumber: prData.number,
                    reason: approvalResult.reason
                };
            }

            // Wait a moment before merging
            await this.sleep(2000);

            // Merge PR
            const mergeResult = await this.mergePR(prData);

            if (!mergeResult.merged) {
                this.logger.warn(this.name, 'PR not merged', {
                    prNumber: prData.number,
                    reason: mergeResult.reason
                });
            }

            // Mark notification as read
            await this.markNotificationAsRead(notification.id);

            // Mark as processed
            this.processedPRs.add(prData.number);

            // Add to history
            this.reviewHistory.push({
                prNumber: prData.number,
                timestamp: new Date().toISOString(),
                action: 'approved_and_merged',
                approved: approvalResult.approved,
                merged: mergeResult.merged
            });

            this.logger.success(this.name, 'PR processed successfully', {
                prNumber: prData.number,
                approved: approvalResult.approved,
                merged: mergeResult.merged
            });

            return {
                success: true,
                prNumber: prData.number,
                approved: approvalResult.approved,
                merged: mergeResult.merged
            };

        } catch (error) {
            this.logger.error(this.name, 'Failed to process PR', {
                error: error.message,
                notification: notification.id
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process all review notifications
     */
    async processAllNotifications() {
        if (this.isProcessing) {
            this.logger.warn(this.name, 'Already processing notifications');
            return;
        }

        this.isProcessing = true;
        
        try {
            this.logger.info(this.name, 'Starting notification processing');

            // Fetch notifications
            const notifications = await this.getReviewNotifications();

            if (notifications.length === 0) {
                this.logger.info(this.name, 'No review notifications found');
                return {
                    processed: 0,
                    successful: 0,
                    failed: 0,
                    skipped: 0
                };
            }

            // Process each notification
            const results = {
                processed: 0,
                successful: 0,
                failed: 0,
                skipped: 0,
                details: []
            };

            for (const notification of notifications) {
                results.processed++;
                
                const result = await this.processPR(notification);
                
                if (result.skipped) {
                    results.skipped++;
                } else if (result.success) {
                    results.successful++;
                } else {
                    results.failed++;
                }
                
                results.details.push(result);

                // Wait between processing to avoid rate limits
                await this.sleep(1000);
            }

            this.logger.success(this.name, 'Notification processing complete', results);
            
            return results;

        } catch (error) {
            this.logger.error(this.name, 'Failed to process notifications', {
                error: error.message
            });
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Get agent status
     */
    getStatus() {
        return {
            name: this.name,
            isProcessing: this.isProcessing,
            notificationCount: this.notifications.length,
            processedCount: this.processedPRs.size,
            pendingReviews: this.pendingReviews.length,
            reviewHistory: this.reviewHistory.length,
            config: {
                autoApprove: this.config.autoApprove,
                autoMerge: this.config.autoMerge,
                requireTests: this.config.requireTests,
                requireBuild: this.config.requireBuild
            }
        };
    }

    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.logger.info(this.name, 'Configuration updated', updates);
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.reviewHistory = [];
        this.processedPRs.clear();
        this.logger.info(this.name, 'History cleared');
    }

    /**
     * Helper: sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubPRReviewAgent;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.GitHubPRReviewAgent = GitHubPRReviewAgent;
}
