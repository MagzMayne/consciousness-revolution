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
 * File: sql-schema-analyzer.js
 * Declaration ID: IP-6DEBEC3C-MLL28ZV6
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

/**
 * SQL Schema Analyzer
 * Comprehensive tool for analyzing SQL schemas, detecting security vulnerabilities,
 * and optimizing query performance
 */

(function() {
    'use strict';

    class SQLSchemaAnalyzer {
        constructor() {
            this.schemas = [];
            this.vulnerabilities = [];
            this.optimizations = [];
            this.relationships = [];
        }

        /**
         * Parse SQL schema from text input
         * @param {string} sqlText - SQL CREATE TABLE statements
         * @returns {Object} Parsed schema information
         */
        parseSchema(sqlText) {
            const tables = [];
            const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(([\s\S]*?)\);/gi;
            
            let match;
            while ((match = tableRegex.exec(sqlText)) !== null) {
                const tableName = match[1];
                const columnsText = match[2];
                
                const table = {
                    name: tableName,
                    columns: this.parseColumns(columnsText),
                    indexes: this.parseIndexes(columnsText),
                    constraints: this.parseConstraints(columnsText)
                };
                
                tables.push(table);
            }
            
            this.schemas = tables;
            return tables;
        }

        /**
         * Parse columns from CREATE TABLE statement
         */
        parseColumns(columnsText) {
            const columns = [];
            const lines = columnsText.split(',').map(l => l.trim());
            
            for (const line of lines) {
                // Skip constraints
                if (line.match(/^(PRIMARY KEY|FOREIGN KEY|CONSTRAINT|INDEX|KEY|UNIQUE)/i)) {
                    continue;
                }
                
                const columnMatch = line.match(/^`?(\w+)`?\s+(\w+)(\([^)]+\))?(.*)$/i);
                if (columnMatch) {
                    const [, name, type, size, modifiers] = columnMatch;
                    columns.push({
                        name,
                        type: type.toUpperCase(),
                        size: size ? size.replace(/[()]/g, '') : null,
                        nullable: !modifiers.includes('NOT NULL'),
                        primaryKey: modifiers.includes('PRIMARY KEY'),
                        autoIncrement: modifiers.includes('AUTO_INCREMENT'),
                        unique: modifiers.includes('UNIQUE'),
                        defaultValue: this.extractDefault(modifiers)
                    });
                }
            }
            
            return columns;
        }

        /**
         * Parse indexes from CREATE TABLE statement
         */
        parseIndexes(columnsText) {
            const indexes = [];
            const indexRegex = /(?:INDEX|KEY)\s+`?(\w+)`?\s*\(([^)]+)\)/gi;
            
            let match;
            while ((match = indexRegex.exec(columnsText)) !== null) {
                indexes.push({
                    name: match[1],
                    columns: match[2].split(',').map(c => c.trim().replace(/`/g, ''))
                });
            }
            
            return indexes;
        }

        /**
         * Parse constraints from CREATE TABLE statement
         */
        parseConstraints(columnsText) {
            const constraints = [];
            const fkRegex = /FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+`?(\w+)`?\s*\(([^)]+)\)/gi;
            
            let match;
            while ((match = fkRegex.exec(columnsText)) !== null) {
                constraints.push({
                    type: 'FOREIGN_KEY',
                    columns: match[1].split(',').map(c => c.trim().replace(/`/g, '')),
                    referencedTable: match[2],
                    referencedColumns: match[3].split(',').map(c => c.trim().replace(/`/g, ''))
                });
            }
            
            return constraints;
        }

        /**
         * Extract default value from modifiers
         */
        extractDefault(modifiers) {
            const defaultMatch = modifiers.match(/DEFAULT\s+([^,\s]+)/i);
            return defaultMatch ? defaultMatch[1].replace(/'/g, '') : null;
        }

        /**
         * Analyze schema for security vulnerabilities
         * @returns {Array} List of detected vulnerabilities
         */
        analyzeSecurityVulnerabilities() {
            this.vulnerabilities = [];

            for (const table of this.schemas) {
                // Check for missing primary keys
                const hasPrimaryKey = table.columns.some(col => col.primaryKey);
                if (!hasPrimaryKey) {
                    this.vulnerabilities.push({
                        severity: 'HIGH',
                        type: 'MISSING_PRIMARY_KEY',
                        table: table.name,
                        description: `Table '${table.name}' lacks a primary key, which can lead to data integrity issues`,
                        recommendation: 'Add a primary key column (e.g., id INT AUTO_INCREMENT PRIMARY KEY)',
                        cve: null,
                        automated: true,
                        autoFixSQL: `ALTER TABLE ${table.name} ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;`
                    });
                }

                // Check for sensitive data without encryption
                for (const column of table.columns) {
                    const sensitivePatterns = ['password', 'ssn', 'credit', 'card', 'secret', 'token', 'api_key', 'private'];
                    const isSensitive = sensitivePatterns.some(pattern => 
                        column.name.toLowerCase().includes(pattern)
                    );
                    
                    if (isSensitive && !column.name.toLowerCase().includes('hash') && 
                        !column.name.toLowerCase().includes('encrypted')) {
                        this.vulnerabilities.push({
                            severity: 'CRITICAL',
                            type: 'UNENCRYPTED_SENSITIVE_DATA',
                            table: table.name,
                            column: column.name,
                            description: `Column '${column.name}' may contain sensitive data without encryption`,
                            recommendation: 'Store hashed/encrypted values and rename column to indicate encryption (e.g., password_hash)',
                            cve: 'CWE-312',
                            automated: false
                        });
                    }
                }

                // Check for missing indexes on foreign keys
                for (const constraint of table.constraints) {
                    if (constraint.type === 'FOREIGN_KEY') {
                        const hasIndex = table.indexes.some(idx => 
                            idx.columns.some(col => constraint.columns.includes(col))
                        );
                        
                        if (!hasIndex) {
                            this.vulnerabilities.push({
                                severity: 'MEDIUM',
                                type: 'MISSING_FOREIGN_KEY_INDEX',
                                table: table.name,
                                columns: constraint.columns,
                                description: `Foreign key on ${constraint.columns.join(', ')} lacks an index`,
                                recommendation: `Add index: CREATE INDEX idx_${constraint.columns.join('_')} ON ${table.name}(${constraint.columns.join(', ')})`,
                                cve: null,
                                automated: true,
                                autoFixSQL: `CREATE INDEX idx_${constraint.columns.join('_')} ON ${table.name}(${constraint.columns.join(', ')});`
                            });
                        }
                    }
                }

                // Check for overly permissive nullable columns
                const nullableColumns = table.columns.filter(col => 
                    col.nullable && !col.name.toLowerCase().includes('optional')
                );
                
                if (nullableColumns.length > table.columns.length * 0.7) {
                    this.vulnerabilities.push({
                        severity: 'LOW',
                        type: 'EXCESSIVE_NULLABLE_COLUMNS',
                        table: table.name,
                        description: `Table has too many nullable columns (${nullableColumns.length}/${table.columns.length})`,
                        recommendation: 'Review nullable columns and add NOT NULL constraints where appropriate',
                        cve: null,
                        automated: false
                    });
                }

                // NEW: Check for SQL injection risks in column names
                for (const column of table.columns) {
                    if (column.name.toLowerCase().includes('query') || 
                        column.name.toLowerCase().includes('sql') ||
                        column.name.toLowerCase().includes('command')) {
                        this.vulnerabilities.push({
                            severity: 'MEDIUM',
                            type: 'SQL_INJECTION_RISK',
                            table: table.name,
                            column: column.name,
                            description: `Column '${column.name}' may be used to store SQL queries, potential injection risk`,
                            recommendation: 'Use parameterized queries and validate/sanitize input. Consider using a TEXT type with length limits.',
                            cve: 'CWE-89',
                            automated: false
                        });
                    }
                }

                // NEW: Check for missing unique constraints on email/username
                for (const column of table.columns) {
                    if ((column.name.toLowerCase() === 'email' || column.name.toLowerCase() === 'username') 
                        && !column.unique && !column.primaryKey) {
                        this.vulnerabilities.push({
                            severity: 'MEDIUM',
                            type: 'MISSING_UNIQUE_CONSTRAINT',
                            table: table.name,
                            column: column.name,
                            description: `Column '${column.name}' should have a UNIQUE constraint to prevent duplicates`,
                            recommendation: `ALTER TABLE ${table.name} ADD UNIQUE (${column.name})`,
                            cve: null,
                            automated: true,
                            autoFixSQL: `ALTER TABLE ${table.name} ADD UNIQUE (${column.name});`
                        });
                    }
                }

                // NEW: Check for missing ON DELETE/UPDATE actions on foreign keys
                // Note: This requires enhanced parsing, but we can flag it as a potential issue
                if (table.constraints.some(c => c.type === 'FOREIGN_KEY')) {
                    this.vulnerabilities.push({
                        severity: 'LOW',
                        type: 'MISSING_CASCADE_ACTIONS',
                        table: table.name,
                        description: 'Foreign keys should specify ON DELETE and ON UPDATE actions',
                        recommendation: 'Add CASCADE, SET NULL, or RESTRICT actions to prevent orphaned records',
                        cve: null,
                        automated: false
                    });
                }

                // NEW: Check for PII (Personally Identifiable Information) columns
                const piiPatterns = ['phone', 'address', 'birth', 'dob', 'social', 'passport', 'license', 'tax'];
                for (const column of table.columns) {
                    const isPII = piiPatterns.some(pattern => 
                        column.name.toLowerCase().includes(pattern)
                    );
                    
                    if (isPII) {
                        this.vulnerabilities.push({
                            severity: 'HIGH',
                            type: 'PII_DATA_DETECTED',
                            table: table.name,
                            column: column.name,
                            description: `Column '${column.name}' may contain PII requiring special handling`,
                            recommendation: 'Ensure encryption at rest, access logging, and GDPR/CCPA compliance measures',
                            cve: 'GDPR-Violation',
                            automated: false
                        });
                    }
                }
            }

            return this.vulnerabilities;
        }

        /**
         * Optimize query performance
         * @returns {Array} List of optimization suggestions
         */
        analyzePerformanceOptimizations() {
            this.optimizations = [];

            for (const table of this.schemas) {
                // Check for tables without indexes
                if (table.indexes.length === 0 && table.columns.length > 3) {
                    this.optimizations.push({
                        priority: 'HIGH',
                        type: 'MISSING_INDEXES',
                        table: table.name,
                        description: `Table '${table.name}' has no indexes`,
                        recommendation: 'Add indexes on frequently queried columns',
                        estimatedImpact: 'Query performance improvement: 50-90%',
                        automated: true,
                        autoFixSQL: this.generateIndexSuggestions(table)
                    });
                }

                // Check for large text fields without full-text indexes
                for (const column of table.columns) {
                    if (column.type === 'TEXT' || column.type === 'LONGTEXT') {
                        const hasFullTextIndex = table.indexes.some(idx => 
                            idx.name.includes('fulltext') || idx.name.includes('ft')
                        );
                        
                        if (!hasFullTextIndex) {
                            this.optimizations.push({
                                priority: 'MEDIUM',
                                type: 'MISSING_FULLTEXT_INDEX',
                                table: table.name,
                                column: column.name,
                                description: `Large text column '${column.name}' lacks full-text index`,
                                recommendation: `Add full-text index: CREATE FULLTEXT INDEX ft_${column.name} ON ${table.name}(${column.name})`,
                                estimatedImpact: 'Text search performance improvement: 100-1000%',
                                automated: true,
                                autoFixSQL: `CREATE FULLTEXT INDEX ft_${column.name} ON ${table.name}(${column.name});`
                            });
                        }
                    }
                }

                // Check for composite index opportunities
                if (table.constraints.length > 0) {
                    for (const constraint of table.constraints) {
                        if (constraint.type === 'FOREIGN_KEY' && constraint.columns.length > 1) {
                            const hasCompositeIndex = table.indexes.some(idx => 
                                constraint.columns.every(col => idx.columns.includes(col))
                            );
                            
                            if (!hasCompositeIndex) {
                                this.optimizations.push({
                                    priority: 'MEDIUM',
                                    type: 'COMPOSITE_INDEX_OPPORTUNITY',
                                    table: table.name,
                                    columns: constraint.columns,
                                    description: `Consider composite index for frequently joined columns`,
                                    recommendation: `CREATE INDEX idx_${constraint.columns.join('_')} ON ${table.name}(${constraint.columns.join(', ')})`,
                                    estimatedImpact: 'JOIN performance improvement: 30-70%',
                                    automated: true,
                                    autoFixSQL: `CREATE INDEX idx_${constraint.columns.join('_')} ON ${table.name}(${constraint.columns.join(', ')});`
                                });
                            }
                        }
                    }
                }

                // Check for potential denormalization opportunities
                const foreignKeyCount = table.constraints.filter(c => c.type === 'FOREIGN_KEY').length;
                if (foreignKeyCount > 5) {
                    this.optimizations.push({
                        priority: 'LOW',
                        type: 'DENORMALIZATION_OPPORTUNITY',
                        table: table.name,
                        description: `Table has ${foreignKeyCount} foreign keys - consider denormalization for read-heavy workloads`,
                        recommendation: 'Consider caching frequently accessed related data',
                        estimatedImpact: 'Read performance improvement: 20-50% (at cost of write complexity)',
                        automated: false
                    });
                }

                // NEW: Check for large VARCHAR columns that should be TEXT
                for (const column of table.columns) {
                    if (column.type === 'VARCHAR' && column.size && parseInt(column.size) > 1000) {
                        this.optimizations.push({
                            priority: 'LOW',
                            type: 'COLUMN_TYPE_OPTIMIZATION',
                            table: table.name,
                            column: column.name,
                            description: `VARCHAR(${column.size}) is very large, consider using TEXT type`,
                            recommendation: `ALTER TABLE ${table.name} MODIFY ${column.name} TEXT`,
                            estimatedImpact: 'Storage efficiency improvement: 10-20%',
                            automated: true,
                            autoFixSQL: `ALTER TABLE ${table.name} MODIFY ${column.name} TEXT;`
                        });
                    }
                }

                // NEW: Check for missing created_at/updated_at timestamps
                const hasCreatedAt = table.columns.some(c => 
                    c.name.toLowerCase().includes('created') && c.type === 'TIMESTAMP'
                );
                const hasUpdatedAt = table.columns.some(c => 
                    c.name.toLowerCase().includes('updated') && c.type === 'TIMESTAMP'
                );
                
                if (!hasCreatedAt || !hasUpdatedAt) {
                    this.optimizations.push({
                        priority: 'LOW',
                        type: 'MISSING_AUDIT_COLUMNS',
                        table: table.name,
                        description: 'Missing audit timestamp columns (created_at/updated_at)',
                        recommendation: 'Add timestamp columns for data auditing',
                        estimatedImpact: 'Better data tracking and debugging',
                        automated: true,
                        autoFixSQL: this.generateAuditColumnSQL(table, hasCreatedAt, hasUpdatedAt)
                    });
                }
            }

            return this.optimizations;
        }

        /**
         * Generate index suggestions for a table
         */
        generateIndexSuggestions(table) {
            const suggestions = [];
            // Suggest indexes on foreign key columns
            for (const constraint of table.constraints) {
                if (constraint.type === 'FOREIGN_KEY') {
                    suggestions.push(`CREATE INDEX idx_${constraint.columns.join('_')} ON ${table.name}(${constraint.columns.join(', ')});`);
                }
            }
            // Suggest indexes on unique columns
            const uniqueColumns = table.columns.filter(c => c.unique && !c.primaryKey);
            uniqueColumns.forEach(col => {
                suggestions.push(`CREATE INDEX idx_${col.name} ON ${table.name}(${col.name});`);
            });
            return suggestions.join('\n');
        }

        /**
         * Generate SQL for adding audit columns
         */
        generateAuditColumnSQL(table, hasCreatedAt, hasUpdatedAt) {
            const sql = [];
            if (!hasCreatedAt) {
                sql.push(`ALTER TABLE ${table.name} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
            }
            if (!hasUpdatedAt) {
                sql.push(`ALTER TABLE ${table.name} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`);
            }
            return sql.join('\n');
        }

        /**
         * Extract relationships between tables
         * @returns {Array} Table relationships for visualization
         */
        extractRelationships() {
            this.relationships = [];

            for (const table of this.schemas) {
                for (const constraint of table.constraints) {
                    if (constraint.type === 'FOREIGN_KEY') {
                        this.relationships.push({
                            source: table.name,
                            target: constraint.referencedTable,
                            sourceColumns: constraint.columns,
                            targetColumns: constraint.referencedColumns,
                            type: 'FOREIGN_KEY'
                        });
                    }
                }
            }

            return this.relationships;
        }

        /**
         * Get comprehensive analysis report
         * @returns {Object} Complete analysis results
         */
        getAnalysisReport() {
            return {
                schemas: this.schemas,
                vulnerabilities: this.vulnerabilities,
                optimizations: this.optimizations,
                relationships: this.relationships,
                summary: {
                    totalTables: this.schemas.length,
                    totalColumns: this.schemas.reduce((sum, t) => sum + t.columns.length, 0),
                    totalIndexes: this.schemas.reduce((sum, t) => sum + t.indexes.length, 0),
                    criticalVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
                    highPriorityOptimizations: this.optimizations.filter(o => o.priority === 'HIGH').length
                }
            };
        }

        /**
         * Export analysis report as JSON
         * @returns {string} JSON string of analysis report
         */
        exportJSON() {
            return JSON.stringify(this.getAnalysisReport(), null, 2);
        }

        /**
         * Export analysis report as Markdown
         * @returns {string} Markdown formatted report
         */
        exportMarkdown() {
            const report = this.getAnalysisReport();
            let md = '# SQL Schema Analysis Report\n\n';
            md += `**Generated:** ${new Date().toISOString()}\n\n`;
            
            // Summary section
            md += '## Summary\n\n';
            md += `- **Total Tables:** ${report.summary.totalTables}\n`;
            md += `- **Total Columns:** ${report.summary.totalColumns}\n`;
            md += `- **Total Indexes:** ${report.summary.totalIndexes}\n`;
            md += `- **Critical Vulnerabilities:** ${report.summary.criticalVulnerabilities}\n`;
            md += `- **High Priority Optimizations:** ${report.summary.highPriorityOptimizations}\n\n`;
            
            // Vulnerabilities section
            md += '## Security Vulnerabilities\n\n';
            if (report.vulnerabilities.length === 0) {
                md += '✅ No vulnerabilities detected.\n\n';
            } else {
                report.vulnerabilities.forEach((v, i) => {
                    md += `### ${i + 1}. ${v.type.replace(/_/g, ' ')} (${v.severity})\n\n`;
                    md += `**Table:** ${v.table}\n\n`;
                    if (v.column) md += `**Column:** ${v.column}\n\n`;
                    md += `**Description:** ${v.description}\n\n`;
                    md += `**Recommendation:** ${v.recommendation}\n\n`;
                    if (v.cve) md += `**CVE/CWE:** ${v.cve}\n\n`;
                    if (v.autoFixSQL) md += `**Auto-fix SQL:**\n\`\`\`sql\n${v.autoFixSQL}\n\`\`\`\n\n`;
                    md += '---\n\n';
                });
            }
            
            // Optimizations section
            md += '## Performance Optimizations\n\n';
            if (report.optimizations.length === 0) {
                md += '✅ No optimizations needed.\n\n';
            } else {
                report.optimizations.forEach((o, i) => {
                    md += `### ${i + 1}. ${o.type.replace(/_/g, ' ')} (${o.priority})\n\n`;
                    md += `**Table:** ${o.table}\n\n`;
                    if (o.column) md += `**Column:** ${o.column}\n\n`;
                    if (o.columns) md += `**Columns:** ${o.columns.join(', ')}\n\n`;
                    md += `**Description:** ${o.description}\n\n`;
                    md += `**Recommendation:** ${o.recommendation}\n\n`;
                    md += `**Estimated Impact:** ${o.estimatedImpact}\n\n`;
                    if (o.autoFixSQL) md += `**Auto-fix SQL:**\n\`\`\`sql\n${o.autoFixSQL}\n\`\`\`\n\n`;
                    md += '---\n\n';
                });
            }
            
            // Schema details section
            md += '## Schema Details\n\n';
            report.schemas.forEach(table => {
                md += `### Table: ${table.name}\n\n`;
                md += `- **Columns:** ${table.columns.length}\n`;
                md += `- **Indexes:** ${table.indexes.length}\n`;
                md += `- **Constraints:** ${table.constraints.length}\n\n`;
                
                md += '**Columns:**\n\n';
                md += '| Name | Type | Nullable | Primary | Unique |\n';
                md += '|------|------|----------|---------|--------|\n';
                table.columns.forEach(col => {
                    md += `| ${col.name} | ${col.type}${col.size ? `(${col.size})` : ''} | `;
                    md += `${col.nullable ? '✓' : '✗'} | ${col.primaryKey ? '✓' : '✗'} | `;
                    md += `${col.unique ? '✓' : '✗'} |\n`;
                });
                md += '\n';
            });
            
            return md;
        }

        /**
         * Generate automated fix SQL script
         * @returns {string} SQL script with all automated fixes
         */
        generateAutoFixSQL() {
            let sql = '-- Automated SQL Schema Fixes\n';
            sql += `-- Generated: ${new Date().toISOString()}\n`;
            sql += '-- WARNING: Review these changes before applying to production!\n\n';
            
            // Add fixes for vulnerabilities
            const autoFixableVulns = this.vulnerabilities.filter(v => v.automated && v.autoFixSQL);
            if (autoFixableVulns.length > 0) {
                sql += '-- Security Vulnerability Fixes\n';
                autoFixableVulns.forEach(v => {
                    sql += `-- Fix for: ${v.type} in table ${v.table}\n`;
                    sql += `${v.autoFixSQL}\n\n`;
                });
            }
            
            // Add fixes for optimizations
            const autoFixableOpts = this.optimizations.filter(o => o.automated && o.autoFixSQL);
            if (autoFixableOpts.length > 0) {
                sql += '-- Performance Optimization Fixes\n';
                autoFixableOpts.forEach(o => {
                    sql += `-- Fix for: ${o.type} in table ${o.table}\n`;
                    sql += `${o.autoFixSQL}\n\n`;
                });
            }
            
            return sql;
        }

        /**
         * Get automation metrics
         * @returns {Object} Metrics about what can be automated
         */
        getAutomationMetrics() {
            const automatedVulns = this.vulnerabilities.filter(v => v.automated).length;
            const automatedOpts = this.optimizations.filter(o => o.automated).length;
            const totalIssues = this.vulnerabilities.length + this.optimizations.length;
            const automatedIssues = automatedVulns + automatedOpts;
            
            return {
                totalIssues,
                automatedIssues,
                manualIssues: totalIssues - automatedIssues,
                automationPercentage: totalIssues > 0 ? Math.round((automatedIssues / totalIssues) * 100) : 0,
                breakdown: {
                    vulnerabilities: {
                        total: this.vulnerabilities.length,
                        automated: automatedVulns,
                        manual: this.vulnerabilities.length - automatedVulns
                    },
                    optimizations: {
                        total: this.optimizations.length,
                        automated: automatedOpts,
                        manual: this.optimizations.length - automatedOpts
                    }
                }
            };
        }
    }

    // Export to global scope
    window.SQLSchemaAnalyzer = SQLSchemaAnalyzer;
    console.log('✅ SQL Schema Analyzer loaded');
})();
