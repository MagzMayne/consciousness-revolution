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
 * File: file-usage-agent.js
 * Declaration ID: IP-5D9F37EF-MLL28ZVZ
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

/** SIGNED BY MeRLynn - ID: MERLYNN-7fd81ac8 - TIMESTAMP: 2025-12-19T05:53:06.533Z - HASH: 0c87ed6c */
/** SIGNED BY AGentR - ID: AGENTR-4859c6bb - TIMESTAMP: 2025-12-19T05:53:06.533Z - HASH: 0c87ed6c */

/**
 * FILE USAGE ANALYSIS AGENT
 * Identifies unused, redundant, and orphaned files in the repository
 * Tracks dependencies and references across the codebase
 */

class FileUsageAgent {
    constructor(logger = null) {
        this.logger = logger || console;
        this.fileMap = new Map(); // file path -> metadata
        this.dependencies = new Map(); // file -> [dependencies]
        this.references = new Map(); // file -> [files that reference it]
        this.results = {
            unusedFiles: [],
            orphanedFiles: [],
            duplicateContent: [],
            largeFiles: [],
            summary: {
                totalFiles: 0,
                unusedCount: 0,
                orphanedCount: 0,
                duplicateCount: 0,
                potentialSavings: 0
            }
        };
    }

    /**
     * Start comprehensive file usage analysis
     */
    async analyzeRepository() {
        this.log('info', 'Starting file usage analysis...');
        
        try {
            // Scan all files (exclude HTML in main repo)
            await this.scanAllFiles();
            
            // Build dependency graph
            await this.buildDependencyGraph();
            
            // Find unused files
            await this.findUnusedFiles();
            
            // Find orphaned files
            await this.findOrphanedFiles();
            
            // Detect duplicate content
            await this.detectDuplicateContent();
            
            // Find large files
            await this.findLargeFiles();
            
            // Generate summary
            this.generateSummary();
            
            this.log('success', `Analysis complete. Found ${this.results.unusedFiles.length} unused files.`);
            
            return this.results;
        } catch (error) {
            this.log('error', `Analysis failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Scan all files in repository
     */
    async scanAllFiles() {
        const fs = require('fs').promises;
        const path = require('path');
        const crypto = require('crypto');
        
        const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', 'vendor'];
        const fileTypes = ['.js', '.css', '.json', '.md', '.txt', '.sol'];
        
        async function walk(dir, agent) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
                            await walk(fullPath, agent);
                        }
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        
                        // Include JS, CSS, and config files, exclude main-level HTML
                        if (fileTypes.includes(ext) || ext === '.js' || ext === '.css') {
                            try {
                                const stats = await fs.stat(fullPath);
                                const content = await fs.readFile(fullPath, 'utf8');
                                
                                // Create content hash for duplicate detection
                                const hash = crypto.createHash('md5').update(content).digest('hex');
                                
                                agent.fileMap.set(fullPath, {
                                    path: fullPath,
                                    name: entry.name,
                                    extension: ext,
                                    size: stats.size,
                                    modified: stats.mtime,
                                    hash: hash,
                                    content: content
                                });
                                
                                agent.results.summary.totalFiles++;
                            } catch (error) {
                                // Skip files we can't read
                            }
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        }
        
        await walk('.', this);
        this.log('info', `Scanned ${this.fileMap.size} files`);
    }

    /**
     * Build dependency graph
     */
    async buildDependencyGraph() {
        this.log('info', 'Building dependency graph...');
        
        for (const [filePath, fileData] of this.fileMap) {
            const deps = this.extractDependencies(filePath, fileData.content, fileData.extension);
            this.dependencies.set(filePath, deps);
            
            // Build reverse references
            deps.forEach(dep => {
                if (!this.references.has(dep)) {
                    this.references.set(dep, []);
                }
                this.references.get(dep).push(filePath);
            });
        }
        
        this.log('info', `Built dependency graph with ${this.dependencies.size} nodes`);
    }

    /**
     * Extract dependencies from file content
     */
    extractDependencies(filePath, content, extension) {
        const dependencies = new Set();
        const path = require('path');
        const dir = path.dirname(filePath);
        
        if (extension === '.js') {
            // ES6 imports
            const es6Imports = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
            es6Imports.forEach(imp => {
                const match = imp.match(/from\s+['"]([^'"]+)['"]/);
                if (match && match[1]) {
                    const depPath = this.resolvePath(dir, match[1]);
                    if (depPath) dependencies.add(depPath);
                }
            });
            
            // CommonJS require
            const requires = content.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || [];
            requires.forEach(req => {
                const match = req.match(/['"]([^'"]+)['"]/);
                if (match && match[1]) {
                    const depPath = this.resolvePath(dir, match[1]);
                    if (depPath) dependencies.add(depPath);
                }
            });
            
            // Script src references
            const scriptRefs = content.match(/src\s*=\s*['"]([^'"]+\.js)['"]/g) || [];
            scriptRefs.forEach(ref => {
                const match = ref.match(/['"]([^'"]+\.js)['"]/);
                if (match && match[1]) {
                    const depPath = this.resolvePath(dir, match[1]);
                    if (depPath) dependencies.add(depPath);
                }
            });
        }
        
        if (extension === '.css') {
            // @import statements
            const imports = content.match(/@import\s+['"]([^'"]+)['"]/g) || [];
            imports.forEach(imp => {
                const match = imp.match(/['"]([^'"]+)['"]/);
                if (match && match[1]) {
                    const depPath = this.resolvePath(dir, match[1]);
                    if (depPath) dependencies.add(depPath);
                }
            });
            
            // url() references
            const urls = content.match(/url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/g) || [];
            urls.forEach(url => {
                const match = url.match(/['"]?([^'")]+)['"]?/);
                if (match && match[1] && !match[1].startsWith('data:') && !match[1].startsWith('http')) {
                    const depPath = this.resolvePath(dir, match[1]);
                    if (depPath) dependencies.add(depPath);
                }
            });
        }
        
        if (extension === '.json') {
            // Package.json dependencies
            try {
                const json = JSON.parse(content);
                if (json.main && typeof json.main === 'string') {
                    const depPath = this.resolvePath(dir, json.main);
                    if (depPath) dependencies.add(depPath);
                }
            } catch (error) {
                // Not valid JSON or no dependencies
            }
        }
        
        return Array.from(dependencies);
    }

    /**
     * Resolve relative path to absolute
     */
    resolvePath(baseDir, relativePath) {
        const path = require('path');
        const fs = require('fs');
        
        // Skip external URLs and node modules
        if (relativePath.startsWith('http') || 
            relativePath.startsWith('//') ||
            !relativePath.startsWith('.') && !relativePath.startsWith('/')) {
            return null;
        }
        
        let resolved = path.resolve(baseDir, relativePath);
        
        // Try with extensions if file doesn't exist
        if (!fs.existsSync(resolved)) {
            const extensions = ['.js', '.css', '.json'];
            for (const ext of extensions) {
                const withExt = resolved + ext;
                if (fs.existsSync(withExt)) {
                    resolved = withExt;
                    break;
                }
            }
        }
        
        // Normalize path
        if (fs.existsSync(resolved)) {
            return path.normalize(resolved);
        }
        
        return null;
    }

    /**
     * Find unused files (files not referenced by others)
     */
    async findUnusedFiles() {
        this.log('info', 'Finding unused files...');
        
        const entryPoints = this.findEntryPoints();
        const reachableFiles = new Set();
        
        // BFS from entry points
        const queue = [...entryPoints];
        while (queue.length > 0) {
            const current = queue.shift();
            if (reachableFiles.has(current)) continue;
            
            reachableFiles.add(current);
            
            const deps = this.dependencies.get(current) || [];
            deps.forEach(dep => {
                if (!reachableFiles.has(dep)) {
                    queue.push(dep);
                }
            });
        }
        
        // Find unreachable files
        for (const [filePath, fileData] of this.fileMap) {
            if (!reachableFiles.has(filePath) && !this.isEntryPoint(filePath)) {
                const references = this.references.get(filePath) || [];
                
                this.results.unusedFiles.push({
                    file: filePath,
                    size: fileData.size,
                    lastModified: fileData.modified,
                    references: references.length,
                    reason: references.length === 0 ? 'No references found' : 'Not reachable from entry points'
                });
                
                this.results.summary.unusedCount++;
                this.results.summary.potentialSavings += fileData.size;
            }
        }
        
        this.log('info', `Found ${this.results.unusedFiles.length} unused files`);
    }

    /**
     * Find entry points (files that are likely main files)
     */
    findEntryPoints() {
        const entryPoints = [];
        const entryPatterns = [
            /index\.js$/,
            /main\.js$/,
            /app\.js$/,
            /server\.js$/,
            /start.*\.js$/,
            /package\.json$/
        ];
        
        for (const [filePath] of this.fileMap) {
            if (entryPatterns.some(pattern => pattern.test(filePath))) {
                entryPoints.push(filePath);
            }
        }
        
        return entryPoints;
    }

    /**
     * Check if file is an entry point
     */
    isEntryPoint(filePath) {
        const entryPatterns = [
            /index\.js$/,
            /main\.js$/,
            /app\.js$/,
            /server\.js$/,
            /start.*\.js$/,
            /package\.json$/,
            /netlify\.toml$/,
            /\.github\//
        ];
        
        return entryPatterns.some(pattern => pattern.test(filePath));
    }

    /**
     * Find orphaned files (files with no dependencies and no references)
     */
    async findOrphanedFiles() {
        this.log('info', 'Finding orphaned files...');
        
        for (const [filePath, fileData] of this.fileMap) {
            const deps = this.dependencies.get(filePath) || [];
            const refs = this.references.get(filePath) || [];
            
            if (deps.length === 0 && refs.length === 0 && !this.isEntryPoint(filePath)) {
                this.results.orphanedFiles.push({
                    file: filePath,
                    size: fileData.size,
                    lastModified: fileData.modified,
                    reason: 'No dependencies and no references'
                });
                
                this.results.summary.orphanedCount++;
            }
        }
        
        this.log('info', `Found ${this.results.orphanedFiles.length} orphaned files`);
    }

    /**
     * Detect duplicate content
     */
    async detectDuplicateContent() {
        this.log('info', 'Detecting duplicate content...');
        
        const hashMap = new Map(); // hash -> [files]
        
        for (const [filePath, fileData] of this.fileMap) {
            // Skip very small files
            if (fileData.size < 1024) continue;
            
            const hash = fileData.hash;
            
            if (!hashMap.has(hash)) {
                hashMap.set(hash, []);
            }
            hashMap.get(hash).push(filePath);
        }
        
        // Find duplicates
        for (const [hash, files] of hashMap) {
            if (files.length > 1) {
                const fileData = this.fileMap.get(files[0]);
                
                this.results.duplicateContent.push({
                    files: files,
                    size: fileData.size,
                    hash: hash,
                    totalWaste: fileData.size * (files.length - 1)
                });
                
                this.results.summary.duplicateCount += files.length - 1;
                this.results.summary.potentialSavings += fileData.size * (files.length - 1);
            }
        }
        
        this.log('info', `Found ${this.results.duplicateContent.length} sets of duplicate files`);
    }

    /**
     * Find large files that could be optimized
     */
    async findLargeFiles() {
        this.log('info', 'Finding large files...');
        
        // File size thresholds (in bytes)
        const BYTES_PER_KB = 1024;
        const thresholds = {
            '.js': 100 * BYTES_PER_KB,  // 100KB
            '.css': 50 * BYTES_PER_KB,  // 50KB
            '.json': 50 * BYTES_PER_KB  // 50KB
        };
        
        for (const [filePath, fileData] of this.fileMap) {
            const threshold = thresholds[fileData.extension] || 100 * 1024;
            
            if (fileData.size > threshold) {
                this.results.largeFiles.push({
                    file: filePath,
                    size: fileData.size,
                    threshold: threshold,
                    percentage: ((fileData.size / threshold) * 100).toFixed(1),
                    recommendation: this.getLargeFileRecommendation(fileData.extension, fileData.size)
                });
            }
        }
        
        this.log('info', `Found ${this.results.largeFiles.length} large files`);
    }

    /**
     * Get recommendation for large file
     */
    getLargeFileRecommendation(extension, size) {
        const BYTES_PER_KB = 1024;
        
        // Size thresholds for different recommendations
        const VERY_LARGE_JS = 500 * BYTES_PER_KB;
        const LARGE_JS = 200 * BYTES_PER_KB;
        const VERY_LARGE_CSS = 200 * BYTES_PER_KB;
        const LARGE_CSS = 100 * BYTES_PER_KB;
        
        switch (extension) {
            case '.js':
                if (size > VERY_LARGE_JS) {
                    return 'Consider code splitting and lazy loading';
                } else if (size > LARGE_JS) {
                    return 'Consider minification and tree shaking';
                }
                return 'Consider refactoring into smaller modules';
                
            case '.css':
                if (size > VERY_LARGE_CSS) {
                    return 'Consider splitting into multiple files and critical CSS';
                } else if (size > LARGE_CSS) {
                    return 'Consider minification and removing unused styles';
                }
                return 'Consider using CSS modules or splitting by component';
                
            case '.json':
                return 'Consider splitting data or using a database';
                
            default:
                return 'Consider optimization or compression';
        }
    }

    /**
     * Generate summary
     */
    generateSummary() {
        const totalSize = Array.from(this.fileMap.values()).reduce((sum, file) => sum + file.size, 0);
        
        this.results.summary.totalSize = totalSize;
        this.results.summary.potentialSavingsPercentage = 
            ((this.results.summary.potentialSavings / totalSize) * 100).toFixed(2);
        
        this.log('info', 'Summary generated');
    }

    /**
     * Get results
     */
    getResults() {
        return this.results;
    }

    /**
     * Get status
     */
    getStatus() {
        return {
            filesAnalyzed: this.fileMap.size,
            unusedFiles: this.results.unusedFiles.length,
            orphanedFiles: this.results.orphanedFiles.length,
            duplicates: this.results.duplicateContent.length,
            active: true
        };
    }

    /**
     * Logger helper
     */
    log(level, message, data = null) {
        if (this.logger && typeof this.logger[level] === 'function') {
            this.logger[level]('FileUsageAgent', message, data);
        } else if (this.logger) {
            this.logger.log(`[${level.toUpperCase()}] FileUsageAgent: ${message}`, data);
        }
    }
}

// Export for Node.js and browser
if (typeof window !== 'undefined') {
    window.FileUsageAgent = FileUsageAgent;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileUsageAgent;
}
