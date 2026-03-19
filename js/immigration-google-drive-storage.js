// RootIB: RB-20260319142113-181075DE
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
 * File: immigration-google-drive-storage.js
 * Declaration ID: IP-45656D0-MLL28ZV4
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Immigration Google Drive Storage Integration
 * Replaces localStorage with Google Drive for document and case data persistence
 * 
 * Features:
 * - Automatic cloud backup of case data
 * - Document upload to user's Google Drive
 * - Organized folder structure by case type
 * - Cross-device sync
 * - Document checklist tracking
 * 
 * @author Barbrick Design
 * @version 1.0.0
 */

class ImmigrationGoogleDriveStorage {
    constructor() {
        this.isAuthenticated = false;
        this.accessToken = null;
        this.user = null;
        this.folderStructure = {
            root: null,
            documents: null,
            evidence: null,
            forms: null,
            correspondence: null
        };
        this.uploadQueue = [];
        this.isInitialized = false;
    }

    /**
     * Initialize Google Drive integration
     */
    async init() {
        try {
            console.log('📁 Initializing Google Drive Storage...');

            // Check if Google OAuth is available
            if (typeof GoogleOAuthAuth === 'undefined') {
                throw new Error('Google OAuth not available');
            }

            // Wait for user authentication
            this.checkAuthStatus();

            console.log('✅ Google Drive Storage initialized');
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Failed to initialize Google Drive Storage:', error);
            console.log('💡 Falling back to localStorage');
        }
    }

    /**
     * Check authentication status
     */
    checkAuthStatus() {
        // Listen for auth changes
        if (window.googleAuth && typeof window.googleAuth.onAuthChange === 'function') {
            window.googleAuth.onAuthChange((isAuthenticated, user) => {
                this.isAuthenticated = isAuthenticated;
                this.user = user;
                
                if (isAuthenticated) {
                    this.accessToken = user.credential;
                    this.setupFolderStructure();
                    this.migrateFromLocalStorage();
                }
            });
        }

        // Check for existing session
        const storedUser = localStorage.getItem('google_auth_user');
        const storedToken = localStorage.getItem('google_auth_token');
        
        if (storedUser && storedToken) {
            this.isAuthenticated = true;
            this.user = JSON.parse(storedUser);
            this.accessToken = storedToken;
            this.setupFolderStructure();
        }
    }

    /**
     * Setup folder structure in Google Drive
     */
    async setupFolderStructure() {
        try {
            console.log('📂 Setting up folder structure...');

            // Check if root folder exists
            const rootFolder = await this.findOrCreateFolder('Immigration Navigator', 'root');
            this.folderStructure.root = rootFolder.id;

            // Create subfolders
            this.folderStructure.documents = (await this.findOrCreateFolder('Documents', rootFolder.id)).id;
            this.folderStructure.evidence = (await this.findOrCreateFolder('Evidence', rootFolder.id)).id;
            this.folderStructure.forms = (await this.findOrCreateFolder('Forms', rootFolder.id)).id;
            this.folderStructure.correspondence = (await this.findOrCreateFolder('Correspondence', rootFolder.id)).id;

            console.log('✅ Folder structure created:', this.folderStructure);
        } catch (error) {
            console.error('Error setting up folders:', error);
        }
    }

    /**
     * Find or create a folder in Google Drive
     */
    async findOrCreateFolder(folderName, parentId = 'root') {
        try {
            // Search for existing folder
            const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
            
            const searchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            const searchData = await searchResponse.json();
            
            if (searchData.files && searchData.files.length > 0) {
                return searchData.files[0];
            }

            // Create folder if it doesn't exist
            const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parentId]
                })
            });

            return await createResponse.json();
        } catch (error) {
            console.error('Error finding/creating folder:', error);
            throw error;
        }
    }

    /**
     * Save case data to Google Drive
     */
    async saveCaseData(data) {
        if (!this.isAuthenticated) {
            console.log('⚠️ Not authenticated, saving to localStorage');
            localStorage.setItem('immigration_case_data', JSON.stringify(data));
            return;
        }

        try {
            const fileName = 'case_data.json';
            const fileContent = JSON.stringify(data, null, 2);
            const fileId = await this.findFileByName(fileName, this.folderStructure.root);

            if (fileId) {
                // Update existing file
                await this.updateFile(fileId, fileContent);
                console.log('✅ Case data updated in Google Drive');
            } else {
                // Create new file
                await this.createFile(fileName, fileContent, this.folderStructure.root, 'application/json');
                console.log('✅ Case data saved to Google Drive');
            }

            // Also keep in localStorage as backup
            localStorage.setItem('immigration_case_data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving case data:', error);
            // Fallback to localStorage
            localStorage.setItem('immigration_case_data', JSON.stringify(data));
        }
    }

    /**
     * Load case data from Google Drive
     */
    async loadCaseData() {
        if (!this.isAuthenticated) {
            console.log('⚠️ Not authenticated, loading from localStorage');
            const data = localStorage.getItem('immigration_case_data');
            return data ? JSON.parse(data) : null;
        }

        try {
            const fileName = 'case_data.json';
            const fileId = await this.findFileByName(fileName, this.folderStructure.root);

            if (fileId) {
                const content = await this.downloadFile(fileId);
                console.log('✅ Case data loaded from Google Drive');
                return JSON.parse(content);
            } else {
                // Try localStorage as fallback
                const data = localStorage.getItem('immigration_case_data');
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            console.error('Error loading case data:', error);
            // Fallback to localStorage
            const data = localStorage.getItem('immigration_case_data');
            return data ? JSON.parse(data) : null;
        }
    }

    /**
     * Upload document to Google Drive
     */
    async uploadDocument(file, category = 'documents') {
        if (!this.isAuthenticated) {
            console.warn('⚠️ Cannot upload document: Not authenticated');
            this.showAuthPrompt();
            return null;
        }

        try {
            const folderId = this.folderStructure[category] || this.folderStructure.documents;
            
            // Read file content
            const fileContent = await this.readFileContent(file);
            
            // Upload to Google Drive
            const uploadedFile = await this.uploadFileMultipart(file.name, fileContent, folderId, file.type);
            
            console.log('✅ Document uploaded:', uploadedFile.name);
            
            // Track uploaded document
            this.trackDocument({
                fileId: uploadedFile.id,
                fileName: file.name,
                category: category,
                uploadDate: new Date().toISOString(),
                size: file.size,
                mimeType: file.type
            });

            return uploadedFile;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    }

    /**
     * Upload file using multipart upload
     */
    async uploadFileMultipart(fileName, fileContent, folderId, mimeType) {
        const metadata = {
            name: fileName,
            parents: [folderId]
        };

        const boundary = 'foo_bar_baz';
        const delimiter = '\r\n--' + boundary + '\r\n';
        const closeDelimiter = '\r\n--' + boundary + '--';

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + mimeType + '\r\n\r\n' +
            fileContent +
            closeDelimiter;

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'multipart/related; boundary=' + boundary
            },
            body: multipartRequestBody
        });

        return await response.json();
    }

    /**
     * Read file content as text or base64
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                if (file.type.startsWith('text/') || file.type === 'application/json') {
                    resolve(e.target.result);
                } else {
                    // For binary files, use base64
                    const base64 = e.target.result.split(',')[1];
                    resolve(base64);
                }
            };
            
            reader.onerror = reject;
            
            if (file.type.startsWith('text/') || file.type === 'application/json') {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        });
    }

    /**
     * Find file by name in a folder
     */
    async findFileByName(fileName, folderId) {
        try {
            const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
            
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            const data = await response.json();
            
            if (data.files && data.files.length > 0) {
                return data.files[0].id;
            }
            
            return null;
        } catch (error) {
            console.error('Error finding file:', error);
            return null;
        }
    }

    /**
     * Create file in Google Drive
     */
    async createFile(fileName, content, folderId, mimeType) {
        const metadata = {
            name: fileName,
            mimeType: mimeType,
            parents: [folderId]
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', new Blob([content], { type: mimeType }));

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            },
            body: formData
        });

        return await response.json();
    }

    /**
     * Update existing file
     */
    async updateFile(fileId, content) {
        const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: content
        });

        return await response.json();
    }

    /**
     * Download file content
     */
    async downloadFile(fileId) {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        return await response.text();
    }

    /**
     * List documents in a category
     */
    async listDocuments(category = 'documents') {
        if (!this.isAuthenticated) {
            return [];
        }

        try {
            const folderId = this.folderStructure[category];
            const query = `'${folderId}' in parents and trashed=false`;
            
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime)`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            const data = await response.json();
            return data.files || [];
        } catch (error) {
            console.error('Error listing documents:', error);
            return [];
        }
    }

    /**
     * Track uploaded document
     */
    async trackDocument(documentInfo) {
        const fileName = 'document_tracker.json';
        
        // Load existing tracker
        const fileId = await this.findFileByName(fileName, this.folderStructure.root);
        let tracker = { documents: [] };
        
        if (fileId) {
            const content = await this.downloadFile(fileId);
            tracker = JSON.parse(content);
        }

        // Add new document
        tracker.documents.push(documentInfo);

        // Save tracker
        const content = JSON.stringify(tracker, null, 2);
        
        if (fileId) {
            await this.updateFile(fileId, content);
        } else {
            await this.createFile(fileName, content, this.folderStructure.root, 'application/json');
        }
    }

    /**
     * Migrate data from localStorage to Google Drive
     */
    async migrateFromLocalStorage() {
        console.log('🔄 Migrating data from localStorage to Google Drive...');

        try {
            // Migrate case data
            const caseData = localStorage.getItem('immigration_case_data');
            if (caseData) {
                await this.saveCaseData(JSON.parse(caseData));
            }

            // Migrate session data
            const sessionData = localStorage.getItem('immigration_session');
            if (sessionData) {
                const fileName = 'session_data.json';
                await this.createFile(fileName, sessionData, this.folderStructure.root, 'application/json');
            }

            console.log('✅ Data migration complete');
        } catch (error) {
            console.error('Error migrating data:', error);
        }
    }

    /**
     * Show authentication prompt
     * Note: Uses alert as fallback if notification system not available
     */
    showAuthPrompt() {
        const message = 'Sign in with Google to enable cloud document storage and sync across devices.';
        
        // Try to use notification system if available, otherwise use alert
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(message, 'info');
        } else {
            alert(message);
        }
    }

    /**
     * Get storage statistics
     */
    async getStorageStats() {
        if (!this.isAuthenticated) {
            return {
                authenticated: false,
                totalFiles: 0,
                categories: {}
            };
        }

        try {
            const stats = {
                authenticated: true,
                totalFiles: 0,
                categories: {}
            };

            for (const [category, folderId] of Object.entries(this.folderStructure)) {
                if (category !== 'root' && folderId) {
                    const files = await this.listDocuments(category);
                    stats.categories[category] = files.length;
                    stats.totalFiles += files.length;
                }
            }

            return stats;
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return {
                authenticated: true,
                totalFiles: 0,
                categories: {},
                error: error.message
            };
        }
    }

    /**
     * Delete document from Google Drive
     */
    async deleteDocument(fileId) {
        if (!this.isAuthenticated) {
            return false;
        }

        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            console.log('✅ Document deleted');
            return response.ok;
        } catch (error) {
            console.error('Error deleting document:', error);
            return false;
        }
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    window.ImmigrationGoogleDriveStorage = ImmigrationGoogleDriveStorage;
    console.log('✅ Immigration Google Drive Storage loaded');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImmigrationGoogleDriveStorage;
}
