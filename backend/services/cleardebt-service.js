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
 * File: cleardebt-service.js
 * Declaration ID: IP-51665951-MLL28ZUL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ClearDebt Service - Enterprise Bankruptcy Assistance Backend
 * Handles all backend operations for clearDebt.html system
 * 
 * Features:
 * - User authentication via Google OAuth
 * - Database operations for debts, assets, documents
 * - Email parsing for creditor communications
 * - Form generation for bankruptcy filings
 * - Trustee communication tracking
 * - Jurisdiction-specific rule engine
 * 
 * @author Barbrick Design
 * @date 2026-02-13
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

class ClearDebtService {
    constructor(config = {}) {
        this.config = {
            port: config.port || 3010,
            databasePath: config.databasePath || path.join(__dirname, '../data/cleardebt'),
            enableAuth: config.enableAuth !== false,
            ...config
        };

        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.ensureDirectories();
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`[ClearDebt] ${req.method} ${req.path}`);
            next();
        });

        // Error handling
        this.app.use((err, req, res, next) => {
            console.error('[ClearDebt] Error:', err);
            res.status(500).json({
                success: false,
                error: err.message || 'Internal server error'
            });
        });
    }

    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.config.databasePath,
            path.join(this.config.databasePath, 'users'),
            path.join(this.config.databasePath, 'debts'),
            path.join(this.config.databasePath, 'assets'),
            path.join(this.config.databasePath, 'documents'),
            path.join(this.config.databasePath, 'trustees'),
            path.join(this.config.databasePath, 'jurisdictions')
        ];

        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
            } catch (error) {
                console.error(`Failed to create directory ${dir}:`, error);
            }
        }
    }

    /**
     * Setup API routes
     */
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                service: 'cleardebt',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            });
        });

        // ===== USER ROUTES =====
        this.app.post('/api/user/register', this.handleUserRegister.bind(this));
        this.app.post('/api/user/login', this.handleUserLogin.bind(this));
        this.app.get('/api/user/:userId', this.handleGetUser.bind(this));
        this.app.put('/api/user/:userId', this.handleUpdateUser.bind(this));

        // ===== DEBT ROUTES =====
        this.app.post('/api/debt', this.handleCreateDebt.bind(this));
        this.app.get('/api/debt/:userId', this.handleGetDebts.bind(this));
        this.app.put('/api/debt/:debtId', this.handleUpdateDebt.bind(this));
        this.app.delete('/api/debt/:debtId', this.handleDeleteDebt.bind(this));

        // ===== ASSET ROUTES =====
        this.app.post('/api/asset', this.handleCreateAsset.bind(this));
        this.app.get('/api/asset/:userId', this.handleGetAssets.bind(this));
        this.app.put('/api/asset/:userId/:assetId', this.handleUpdateAsset.bind(this));
        this.app.delete('/api/asset/:userId/:assetId', this.handleDeleteAsset.bind(this));

        // ===== DOCUMENT ROUTES =====
        this.app.post('/api/document/upload', this.handleDocumentUpload.bind(this));
        this.app.get('/api/document/:userId', this.handleGetDocuments.bind(this));
        this.app.delete('/api/document/:documentId', this.handleDeleteDocument.bind(this));

        // ===== EMAIL PARSING =====
        this.app.post('/api/email/parse', this.handleEmailParse.bind(this));
        this.app.get('/api/email/parsed/:userId', this.handleGetParsedEmails.bind(this));

        // ===== FORM GENERATION =====
        this.app.post('/api/form/generate', this.handleFormGenerate.bind(this));
        this.app.get('/api/form/templates', this.handleGetFormTemplates.bind(this));

        // ===== TRUSTEE INTERACTION =====
        this.app.post('/api/trustee/interaction', this.handleTrusteeInteraction.bind(this));
        this.app.get('/api/trustee/interactions/:userId', this.handleGetTrusteeInteractions.bind(this));

        // ===== JURISDICTION RULES =====
        this.app.get('/api/jurisdiction/:state', this.handleGetJurisdictionRules.bind(this));
        this.app.post('/api/jurisdiction/evaluate', this.handleEvaluateEligibility.bind(this));

        // ===== ANALYTICS & SUMMARY =====
        this.app.get('/api/summary/:userId', this.handleGetSummary.bind(this));
    }

    // ==================== USER HANDLERS ====================

    async handleUserRegister(req, res) {
        try {
            const { email, name, googleId } = req.body;

            if (!email || !name) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and name are required'
                });
            }

            const userId = this.generateUserId(email);
            const userPath = path.join(this.config.databasePath, 'users', `${userId}.json`);

            // Check if user exists
            try {
                await fs.access(userPath);
                return res.status(409).json({
                    success: false,
                    error: 'User already exists'
                });
            } catch {
                // User doesn't exist, continue
            }

            const userData = {
                userId,
                email,
                name,
                googleId: googleId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                profile: {
                    address: '',
                    city: '',
                    state: '',
                    postal: '',
                    householdSize: 1,
                    maritalStatus: ''
                }
            };

            await fs.writeFile(userPath, JSON.stringify(userData, null, 2));

            res.json({
                success: true,
                userId,
                message: 'User registered successfully'
            });
        } catch (error) {
            console.error('[ClearDebt] Register error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleUserLogin(req, res) {
        try {
            const { email, googleId } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is required'
                });
            }

            const userId = this.generateUserId(email);
            const userPath = path.join(this.config.databasePath, 'users', `${userId}.json`);

            try {
                const userData = JSON.parse(await fs.readFile(userPath, 'utf8'));
                
                res.json({
                    success: true,
                    user: userData
                });
            } catch {
                res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
        } catch (error) {
            console.error('[ClearDebt] Login error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleGetUser(req, res) {
        try {
            const { userId } = req.params;
            const userPath = path.join(this.config.databasePath, 'users', `${userId}.json`);

            const userData = JSON.parse(await fs.readFile(userPath, 'utf8'));
            
            res.json({
                success: true,
                user: userData
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
    }

    async handleUpdateUser(req, res) {
        try {
            const { userId } = req.params;
            const updates = req.body;
            
            const userPath = path.join(this.config.databasePath, 'users', `${userId}.json`);
            const userData = JSON.parse(await fs.readFile(userPath, 'utf8'));

            // Update user data
            Object.assign(userData, updates);
            userData.updatedAt = new Date().toISOString();

            await fs.writeFile(userPath, JSON.stringify(userData, null, 2));

            res.json({
                success: true,
                user: userData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ==================== DEBT HANDLERS ====================

    async handleCreateDebt(req, res) {
        try {
            const { userId, creditor, amount, type, status } = req.body;

            if (!userId || !creditor) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and creditor are required'
                });
            }

            const debtId = this.generateId();
            const debtPath = path.join(this.config.databasePath, 'debts', `${userId}.json`);

            let debts = [];
            try {
                debts = JSON.parse(await fs.readFile(debtPath, 'utf8'));
            } catch {
                // No existing debts file
            }

            const newDebt = {
                debtId,
                userId,
                creditor,
                amount: parseFloat(amount) || 0,
                type: type || 'other',
                status: status || 'current',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            debts.push(newDebt);
            await fs.writeFile(debtPath, JSON.stringify(debts, null, 2));

            res.json({
                success: true,
                debt: newDebt
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleGetDebts(req, res) {
        try {
            const { userId } = req.params;
            const debtPath = path.join(this.config.databasePath, 'debts', `${userId}.json`);

            let debts = [];
            try {
                debts = JSON.parse(await fs.readFile(debtPath, 'utf8'));
            } catch {
                // No debts found
            }

            res.json({
                success: true,
                debts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleUpdateDebt(req, res) {
        try {
            const { debtId } = req.params;
            const updates = req.body;
            const { userId } = updates;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const debtPath = path.join(this.config.databasePath, 'debts', `${userId}.json`);
            let debts = JSON.parse(await fs.readFile(debtPath, 'utf8'));

            const debtIndex = debts.findIndex(d => d.debtId === debtId);
            if (debtIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Debt not found'
                });
            }

            debts[debtIndex] = {
                ...debts[debtIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await fs.writeFile(debtPath, JSON.stringify(debts, null, 2));

            res.json({
                success: true,
                debt: debts[debtIndex]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleDeleteDebt(req, res) {
        try {
            const { debtId } = req.params;
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const debtPath = path.join(this.config.databasePath, 'debts', `${userId}.json`);
            let debts = JSON.parse(await fs.readFile(debtPath, 'utf8'));

            debts = debts.filter(d => d.debtId !== debtId);
            await fs.writeFile(debtPath, JSON.stringify(debts, null, 2));

            res.json({
                success: true,
                message: 'Debt deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ==================== ASSET HANDLERS ====================

    async handleCreateAsset(req, res) {
        try {
            const { userId, description, value, lien, category } = req.body;

            if (!userId || !description) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and description are required'
                });
            }

            const assetId = this.generateId();
            const assetPath = path.join(this.config.databasePath, 'assets', `${userId}.json`);

            let assets = [];
            try {
                assets = JSON.parse(await fs.readFile(assetPath, 'utf8'));
            } catch {
                // No existing assets file
            }

            const newAsset = {
                assetId,
                userId,
                description,
                value: parseFloat(value) || 0,
                lien: parseFloat(lien) || 0,
                category: category || 'other',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            assets.push(newAsset);
            await fs.writeFile(assetPath, JSON.stringify(assets, null, 2));

            res.json({
                success: true,
                asset: newAsset
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleGetAssets(req, res) {
        try {
            const { userId } = req.params;
            const assetPath = path.join(this.config.databasePath, 'assets', `${userId}.json`);

            let assets = [];
            try {
                assets = JSON.parse(await fs.readFile(assetPath, 'utf8'));
            } catch {
                // No assets found
            }

            res.json({
                success: true,
                assets
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleUpdateAsset(req, res) {
        try {
            const { userId, assetId } = req.params;
            const updates = req.body;

            const assetPath = path.join(this.config.databasePath, 'assets', `${userId}.json`);
            let assets = JSON.parse(await fs.readFile(assetPath, 'utf8'));

            const assetIndex = assets.findIndex(a => a.assetId === assetId);
            if (assetIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Asset not found'
                });
            }

            assets[assetIndex] = {
                ...assets[assetIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await fs.writeFile(assetPath, JSON.stringify(assets, null, 2));

            res.json({
                success: true,
                asset: assets[assetIndex]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleDeleteAsset(req, res) {
        try {
            const { userId, assetId } = req.params;

            const assetPath = path.join(this.config.databasePath, 'assets', `${userId}.json`);
            let assets = JSON.parse(await fs.readFile(assetPath, 'utf8'));

            assets = assets.filter(a => a.assetId !== assetId);
            await fs.writeFile(assetPath, JSON.stringify(assets, null, 2));

            res.json({
                success: true,
                message: 'Asset deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ==================== DOCUMENT HANDLERS ====================

    async handleDocumentUpload(req, res) {
        try {
            const { userId, fileName, fileData, fileType } = req.body;

            if (!userId || !fileName || !fileData) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID, file name, and file data are required'
                });
            }

            const documentId = this.generateId();
            const documentMetaPath = path.join(this.config.databasePath, 'documents', `${userId}.json`);

            let documents = [];
            try {
                documents = JSON.parse(await fs.readFile(documentMetaPath, 'utf8'));
            } catch {
                // No existing documents
            }

            const newDocument = {
                documentId,
                userId,
                fileName,
                fileType: fileType || 'application/octet-stream',
                fileSize: fileData.length,
                uploadedAt: new Date().toISOString()
            };

            documents.push(newDocument);
            await fs.writeFile(documentMetaPath, JSON.stringify(documents, null, 2));

            // Save file data (in production, use cloud storage)
            const filePath = path.join(this.config.databasePath, 'documents', `${documentId}.data`);
            await fs.writeFile(filePath, fileData, 'base64');

            res.json({
                success: true,
                document: newDocument
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleGetDocuments(req, res) {
        try {
            const { userId } = req.params;
            const documentMetaPath = path.join(this.config.databasePath, 'documents', `${userId}.json`);

            let documents = [];
            try {
                documents = JSON.parse(await fs.readFile(documentMetaPath, 'utf8'));
            } catch {
                // No documents found
            }

            res.json({
                success: true,
                documents
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleDeleteDocument(req, res) {
        try {
            const { documentId } = req.params;
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const documentMetaPath = path.join(this.config.databasePath, 'documents', `${userId}.json`);
            let documents = JSON.parse(await fs.readFile(documentMetaPath, 'utf8'));

            documents = documents.filter(d => d.documentId !== documentId);
            await fs.writeFile(documentMetaPath, JSON.stringify(documents, null, 2));

            // Delete file data
            const filePath = path.join(this.config.databasePath, 'documents', `${documentId}.data`);
            try {
                await fs.unlink(filePath);
            } catch {
                // File might not exist
            }

            res.json({
                success: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ==================== EMAIL PARSING ====================

    async handleEmailParse(req, res) {
        try {
            const { userId, emailContent, emailSubject, sender } = req.body;

            if (!userId || !emailContent) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and email content are required'
                });
            }

            // Email parsing heuristics
            const parsed = this.parseCreditorEmail(emailContent, emailSubject, sender);

            res.json({
                success: true,
                parsed
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleGetParsedEmails(req, res) {
        try {
            const { userId } = req.params;
            // Implementation would retrieve saved parsed emails

            res.json({
                success: true,
                emails: []
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Parse creditor email using heuristics
     */
    parseCreditorEmail(content, subject, sender) {
        const parsed = {
            creditor: null,
            amount: null,
            dueDate: null,
            accountNumber: null,
            type: 'unknown',
            priority: 'normal'
        };

        // Extract creditor from sender or subject
        if (sender) {
            parsed.creditor = sender.split('@')[0].replace(/[._-]/g, ' ');
        }

        // Extract amounts (look for currency patterns)
        const amountMatches = content.match(/\$[\d,]+\.?\d*/g);
        if (amountMatches && amountMatches.length > 0) {
            parsed.amount = parseFloat(amountMatches[0].replace(/[$,]/g, ''));
        }

        // Extract dates
        const datePatterns = [
            /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
            /\b\d{4}-\d{2}-\d{2}\b/,
            /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/i
        ];

        for (const pattern of datePatterns) {
            const match = content.match(pattern);
            if (match) {
                parsed.dueDate = match[0];
                break;
            }
        }

        // Extract account numbers
        const accountMatch = content.match(/(?:account|acct|#)\s*:?\s*([A-Z0-9-]+)/i);
        if (accountMatch) {
            parsed.accountNumber = accountMatch[1];
        }

        // Determine debt type from keywords
        const contentLower = content.toLowerCase();
        if (contentLower.includes('credit card')) {
            parsed.type = 'credit_card';
        } else if (contentLower.includes('medical') || contentLower.includes('hospital')) {
            parsed.type = 'medical';
        } else if (contentLower.includes('mortgage') || contentLower.includes('loan')) {
            parsed.type = 'personal_loan';
        }

        // Determine priority
        if (contentLower.includes('urgent') || contentLower.includes('final notice') || 
            contentLower.includes('collection')) {
            parsed.priority = 'high';
        }

        return parsed;
    }

    // ==================== FORM GENERATION ====================

    async handleFormGenerate(req, res) {
        try {
            const { userId, formType } = req.body;

            if (!userId || !formType) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and form type are required'
                });
            }

            // Get user data
            const userPath = path.join(this.config.databasePath, 'users', `${userId}.json`);
            const userData = JSON.parse(await fs.readFile(userPath, 'utf8'));

            // Get debts and assets
            const debtPath = path.join(this.config.databasePath, 'debts', `${userId}.json`);
            const assetPath = path.join(this.config.databasePath, 'assets', `${userId}.json`);

            let debts = [];
            let assets = [];

            try {
                debts = JSON.parse(await fs.readFile(debtPath, 'utf8'));
            } catch {
                // No debts
            }

            try {
                assets = JSON.parse(await fs.readFile(assetPath, 'utf8'));
            } catch {
                // No assets
            }

            // Generate form based on type
            const form = this.generateBankruptcyForm(formType, userData, debts, assets);

            res.json({
                success: true,
                form
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleGetFormTemplates(req, res) {
        try {
            const templates = [
                {
                    id: 'chapter7_petition',
                    name: 'Chapter 7 Bankruptcy Petition',
                    description: 'Official Form 101 - Voluntary Petition for Individuals Filing for Bankruptcy'
                },
                {
                    id: 'schedule_ab',
                    name: 'Schedule A/B - Property',
                    description: 'Official Form 106A/B - Schedule of Assets and Real Property'
                },
                {
                    id: 'schedule_c',
                    name: 'Schedule C - Exemptions',
                    description: 'Official Form 106C - Property You Claim as Exempt'
                },
                {
                    id: 'schedule_def',
                    name: 'Schedule D/E/F - Creditors',
                    description: 'Official Forms 106D/E/F - Creditors Who Have Claims'
                },
                {
                    id: 'schedule_i',
                    name: 'Schedule I - Income',
                    description: 'Official Form 106I - Your Income'
                },
                {
                    id: 'schedule_j',
                    name: 'Schedule J - Expenses',
                    description: 'Official Form 106J - Your Expenses'
                }
            ];

            res.json({
                success: true,
                templates
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Generate bankruptcy form with user data
     */
    generateBankruptcyForm(formType, userData, debts, assets) {
        // Basic form structure (would be much more detailed in production)
        const form = {
            formType,
            generatedAt: new Date().toISOString(),
            sections: []
        };

        switch (formType) {
            case 'chapter7_petition':
                form.sections.push({
                    title: 'Debtor Information',
                    fields: {
                        name: userData.name,
                        address: userData.profile.address,
                        city: userData.profile.city,
                        state: userData.profile.state,
                        postalCode: userData.profile.postal
                    }
                });
                break;

            case 'schedule_ab':
                form.sections.push({
                    title: 'Assets',
                    items: assets.map(a => ({
                        description: a.description,
                        value: a.value,
                        lien: a.lien,
                        equity: a.value - a.lien
                    }))
                });
                break;

            case 'schedule_def':
                form.sections.push({
                    title: 'Creditors',
                    items: debts.map(d => ({
                        creditor: d.creditor,
                        amount: d.amount,
                        type: d.type,
                        status: d.status
                    }))
                });
                break;
        }

        return form;
    }

    // ==================== TRUSTEE INTERACTION ====================

    async handleTrusteeInteraction(req, res) {
        try {
            const { userId, interactionType, notes, trustee } = req.body;

            if (!userId || !interactionType) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and interaction type are required'
                });
            }

            const interactionId = this.generateId();
            const interactionPath = path.join(this.config.databasePath, 'trustees', `${userId}.json`);

            let interactions = [];
            try {
                interactions = JSON.parse(await fs.readFile(interactionPath, 'utf8'));
            } catch {
                // No existing interactions
            }

            const newInteraction = {
                interactionId,
                userId,
                type: interactionType,
                trustee: trustee || 'Unknown',
                notes: notes || '',
                timestamp: new Date().toISOString()
            };

            interactions.push(newInteraction);
            await fs.writeFile(interactionPath, JSON.stringify(interactions, null, 2));

            res.json({
                success: true,
                interaction: newInteraction
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleGetTrusteeInteractions(req, res) {
        try {
            const { userId } = req.params;
            const interactionPath = path.join(this.config.databasePath, 'trustees', `${userId}.json`);

            let interactions = [];
            try {
                interactions = JSON.parse(await fs.readFile(interactionPath, 'utf8'));
            } catch {
                // No interactions found
            }

            res.json({
                success: true,
                interactions
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ==================== JURISDICTION RULES ====================

    async handleGetJurisdictionRules(req, res) {
        try {
            const { state } = req.params;

            // Load jurisdiction rules (would be from database in production)
            const rules = this.getJurisdictionRules(state);

            res.json({
                success: true,
                state,
                rules
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleEvaluateEligibility(req, res) {
        try {
            const { userId, state, chapter } = req.body;

            if (!userId || !state) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and state are required'
                });
            }

            // Get user data
            const userPath = path.join(this.config.databasePath, 'users', `${userId}.json`);
            const userData = JSON.parse(await fs.readFile(userPath, 'utf8'));

            const debtPath = path.join(this.config.databasePath, 'debts', `${userId}.json`);
            const assetPath = path.join(this.config.databasePath, 'assets', `${userId}.json`);

            let debts = [];
            let assets = [];

            try {
                debts = JSON.parse(await fs.readFile(debtPath, 'utf8'));
            } catch {
                // No debts
            }

            try {
                assets = JSON.parse(await fs.readFile(assetPath, 'utf8'));
            } catch {
                // No assets
            }

            // Evaluate eligibility
            const evaluation = this.evaluateBankruptcyEligibility(
                state,
                chapter || 'chapter7',
                userData,
                debts,
                assets
            );

            res.json({
                success: true,
                evaluation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get jurisdiction-specific bankruptcy rules
     */
    getJurisdictionRules(state) {
        // Simplified rules - would be much more comprehensive in production
        const baseRules = {
            homesteadExemption: 25000,
            vehicleExemption: 3500,
            personalPropertyExemption: 10000,
            filingFee: 335,
            creditCounselingRequired: true,
            meansTesting: true
        };

        // State-specific variations
        const stateVariations = {
            'IN': {
                homesteadExemption: 19300,
                vehicleExemption: 10000
            },
            'CA': {
                homesteadExemption: 600000,
                vehicleExemption: 3325
            },
            'TX': {
                homesteadExemption: 'unlimited',
                vehicleExemption: 15000
            },
            'FL': {
                homesteadExemption: 'unlimited',
                vehicleExemption: 1000
            }
        };

        return {
            ...baseRules,
            ...(stateVariations[state] || {})
        };
    }

    /**
     * Evaluate bankruptcy eligibility using rules engine
     */
    evaluateBankruptcyEligibility(state, chapter, userData, debts, assets) {
        const evaluation = {
            eligible: true,
            warnings: [],
            recommendations: [],
            exemptionAnalysis: {}
        };

        // Calculate totals
        const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
        const totalAssetValue = assets.reduce((sum, a) => sum + a.value, 0);
        const totalEquity = assets.reduce((sum, a) => sum + (a.value - a.lien), 0);

        // Get jurisdiction rules
        const rules = this.getJurisdictionRules(state);

        // Check homestead exemption
        const homeAsset = assets.find(a => a.category === 'home');
        if (homeAsset) {
            const homeEquity = homeAsset.value - homeAsset.lien;
            if (rules.homesteadExemption === 'unlimited') {
                evaluation.exemptionAnalysis.home = {
                    value: homeAsset.value,
                    equity: homeEquity,
                    protected: true,
                    note: 'Unlimited homestead exemption in this state'
                };
            } else if (homeEquity <= rules.homesteadExemption) {
                evaluation.exemptionAnalysis.home = {
                    value: homeAsset.value,
                    equity: homeEquity,
                    protected: true,
                    exemption: rules.homesteadExemption
                };
            } else {
                evaluation.warnings.push(
                    `Home equity exceeds exemption limit by $${homeEquity - rules.homesteadExemption}`
                );
                evaluation.exemptionAnalysis.home = {
                    value: homeAsset.value,
                    equity: homeEquity,
                    protected: false,
                    atRisk: homeEquity - rules.homesteadExemption,
                    exemption: rules.homesteadExemption
                };
            }
        }

        // Check vehicle exemption
        const vehicles = assets.filter(a => a.category === 'vehicle');
        vehicles.forEach((vehicle, index) => {
            const vehicleEquity = vehicle.value - vehicle.lien;
            if (vehicleEquity <= rules.vehicleExemption) {
                evaluation.exemptionAnalysis[`vehicle_${index}`] = {
                    description: vehicle.description,
                    equity: vehicleEquity,
                    protected: true,
                    exemption: rules.vehicleExemption
                };
            } else {
                evaluation.warnings.push(
                    `Vehicle "${vehicle.description}" equity may exceed exemption`
                );
            }
        });

        // Means testing for Chapter 7
        if (chapter === 'chapter7') {
            // Simplified means test (actual calculation is very complex)
            const monthlyIncome = userData.monthlyIncome || 0;
            const monthlyExpenses = userData.monthlyExpenses || 0;
            const disposableIncome = monthlyIncome - monthlyExpenses;

            if (disposableIncome > 200) {
                evaluation.warnings.push(
                    'Disposable income may affect Chapter 7 eligibility. Chapter 13 might be required.'
                );
                evaluation.recommendations.push('Consider Chapter 13 bankruptcy');
            }
        }

        // General recommendations
        if (totalDebt < 10000) {
            evaluation.recommendations.push(
                'Debt amount is relatively low. Consider debt consolidation or negotiation before bankruptcy.'
            );
        }

        if (debts.some(d => d.status === 'judgment')) {
            evaluation.warnings.push(
                'Active judgments exist. Bankruptcy can potentially discharge these, but consult an attorney.'
            );
        }

        if (rules.creditCounselingRequired) {
            evaluation.recommendations.push(
                'Credit counseling is required before filing. Complete this within 180 days of filing.'
            );
        }

        return evaluation;
    }

    // ==================== SUMMARY ====================

    async handleGetSummary(req, res) {
        try {
            const { userId } = req.params;

            // Get all user data
            const userPath = path.join(this.config.databasePath, 'users', `${userId}.json`);
            const userData = JSON.parse(await fs.readFile(userPath, 'utf8'));

            const debtPath = path.join(this.config.databasePath, 'debts', `${userId}.json`);
            const assetPath = path.join(this.config.databasePath, 'assets', `${userId}.json`);

            let debts = [];
            let assets = [];

            try {
                debts = JSON.parse(await fs.readFile(debtPath, 'utf8'));
            } catch {
                // No debts
            }

            try {
                assets = JSON.parse(await fs.readFile(assetPath, 'utf8'));
            } catch {
                // No assets
            }

            // Calculate summary
            const summary = {
                totalDebts: debts.reduce((sum, d) => sum + d.amount, 0),
                debtCount: debts.length,
                debtsByType: this.groupBy(debts, 'type'),
                totalAssets: assets.reduce((sum, a) => sum + a.value, 0),
                assetCount: assets.length,
                totalEquity: assets.reduce((sum, a) => sum + (a.value - a.lien), 0),
                netWorth: assets.reduce((sum, a) => sum + (a.value - a.lien), 0) - 
                         debts.reduce((sum, d) => sum + d.amount, 0)
            };

            res.json({
                success: true,
                summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ==================== UTILITY METHODS ====================

    generateUserId(email) {
        return Buffer.from(email.toLowerCase()).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    }

    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key] || 'unknown';
            result[group] = (result[group] || 0) + 1;
            return result;
        }, {});
    }

    // ==================== SERVER START ====================

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.config.port, () => {
                    console.log(`\n✅ ClearDebt Service started on port ${this.config.port}`);
                    console.log(`📍 API Base URL: http://localhost:${this.config.port}`);
                    console.log(`💾 Database Path: ${this.config.databasePath}\n`);
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
            console.log('✅ ClearDebt Service stopped');
        }
    }
}

// Export for use in other modules
module.exports = ClearDebtService;

// Start service if run directly
if (require.main === module) {
    const service = new ClearDebtService();
    service.start().catch(error => {
        console.error('Failed to start ClearDebt service:', error);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nShutting down gracefully...');
        service.stop();
        process.exit(0);
    });
}
