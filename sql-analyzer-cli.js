#!/usr/bin/env node

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
 * File: sql-analyzer-cli.js
 * Declaration ID: IP-162C3DDF-MLL28ZVX
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
 * SQL Schema Analyzer CLI
 * Automated command-line tool for batch SQL schema analysis
 * 
 * Usage:
 *   node sql-analyzer-cli.js [options] <file-or-directory>
 *   npm run analyze:sql <file-or-directory>
 * 
 * Options:
 *   --output <format>    Output format: json, markdown, sql (default: markdown)
 *   --export <file>      Export results to file
 *   --auto-fix           Generate auto-fix SQL script
 *   --scan               Scan entire codebase for SQL files
 *   --ci                 CI mode: exit with error if critical issues found
 *   --verbose            Verbose output
 *   --help               Show help
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    outputFormat: 'markdown',
    exportFile: null,
    autoFix: false,
    scan: false,
    ci: false,
    verbose: false,
    help: false,
    target: null
};

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
        case '--output':
            options.outputFormat = args[++i];
            break;
        case '--export':
            options.exportFile = args[++i];
            break;
        case '--auto-fix':
            options.autoFix = true;
            break;
        case '--scan':
            options.scan = true;
            break;
        case '--ci':
            options.ci = true;
            break;
        case '--verbose':
            options.verbose = true;
            break;
        case '--help':
        case '-h':
            options.help = true;
            break;
        default:
            if (!arg.startsWith('--')) {
                options.target = arg;
            }
    }
}

// Show help
if (options.help || (!options.target && !options.scan)) {
    console.log(`
${colors.cyan}${colors.bright}SQL Schema Analyzer CLI${colors.reset}

${colors.bright}Usage:${colors.reset}
  node sql-analyzer-cli.js [options] <file-or-directory>

${colors.bright}Options:${colors.reset}
  --output <format>    Output format: json, markdown, sql (default: markdown)
  --export <file>      Export results to file
  --auto-fix           Generate auto-fix SQL script
  --scan               Scan entire codebase for SQL files
  --ci                 CI mode: exit with error if critical issues found
  --verbose            Verbose output
  --help               Show help

${colors.bright}Examples:${colors.reset}
  node sql-analyzer-cli.js schema.sql
  node sql-analyzer-cli.js --scan --output json --export report.json
  node sql-analyzer-cli.js schema.sql --auto-fix --export fixes.sql
  node sql-analyzer-cli.js --scan --ci
`);
    process.exit(0);
}

// Load the analyzer (adapted for Node.js)
class SQLSchemaAnalyzer {
    constructor() {
        this.schemas = [];
        this.vulnerabilities = [];
        this.optimizations = [];
        this.relationships = [];
    }

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

    parseColumns(columnsText) {
        const columns = [];
        const lines = columnsText.split(',').map(l => l.trim());
        
        for (const line of lines) {
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

    extractDefault(modifiers) {
        const defaultMatch = modifiers.match(/DEFAULT\s+([^,\s]+)/i);
        return defaultMatch ? defaultMatch[1].replace(/'/g, '') : null;
    }

    analyzeSecurityVulnerabilities() {
        this.vulnerabilities = [];

        for (const table of this.schemas) {
            const hasPrimaryKey = table.columns.some(col => col.primaryKey);
            if (!hasPrimaryKey) {
                this.vulnerabilities.push({
                    severity: 'HIGH',
                    type: 'MISSING_PRIMARY_KEY',
                    table: table.name,
                    description: `Table '${table.name}' lacks a primary key`,
                    recommendation: 'Add a primary key column',
                    automated: true,
                    autoFixSQL: `ALTER TABLE ${table.name} ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;`
                });
            }

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
                        recommendation: 'Store hashed/encrypted values',
                        cve: 'CWE-312',
                        automated: false
                    });
                }

                if ((column.name.toLowerCase() === 'email' || column.name.toLowerCase() === 'username') 
                    && !column.unique && !column.primaryKey) {
                    this.vulnerabilities.push({
                        severity: 'MEDIUM',
                        type: 'MISSING_UNIQUE_CONSTRAINT',
                        table: table.name,
                        column: column.name,
                        description: `Column '${column.name}' should have a UNIQUE constraint`,
                        recommendation: `ALTER TABLE ${table.name} ADD UNIQUE (${column.name})`,
                        automated: true,
                        autoFixSQL: `ALTER TABLE ${table.name} ADD UNIQUE (${column.name});`
                    });
                }
            }

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
                            recommendation: `Add index on foreign key columns`,
                            automated: true,
                            autoFixSQL: `CREATE INDEX idx_${constraint.columns.join('_')} ON ${table.name}(${constraint.columns.join(', ')});`
                        });
                    }
                }
            }
        }

        return this.vulnerabilities;
    }

    analyzePerformanceOptimizations() {
        this.optimizations = [];

        for (const table of this.schemas) {
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
                            recommendation: `Add full-text index`,
                            estimatedImpact: 'Text search performance improvement: 100-1000%',
                            automated: true,
                            autoFixSQL: `CREATE FULLTEXT INDEX ft_${column.name} ON ${table.name}(${column.name});`
                        });
                    }
                }
            }

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
                    description: 'Missing audit timestamp columns',
                    recommendation: 'Add created_at/updated_at columns',
                    estimatedImpact: 'Better data tracking',
                    automated: true,
                    autoFixSQL: this.generateAuditColumnSQL(table, hasCreatedAt, hasUpdatedAt)
                });
            }
        }

        return this.optimizations;
    }

    generateIndexSuggestions(table) {
        const suggestions = [];
        for (const constraint of table.constraints) {
            if (constraint.type === 'FOREIGN_KEY') {
                suggestions.push(`CREATE INDEX idx_${constraint.columns.join('_')} ON ${table.name}(${constraint.columns.join(', ')});`);
            }
        }
        const uniqueColumns = table.columns.filter(c => c.unique && !c.primaryKey);
        uniqueColumns.forEach(col => {
            suggestions.push(`CREATE INDEX idx_${col.name} ON ${table.name}(${col.name});`);
        });
        return suggestions.join('\n');
    }

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

    exportJSON() {
        return JSON.stringify(this.getAnalysisReport(), null, 2);
    }

    exportMarkdown() {
        const report = this.getAnalysisReport();
        let md = '# SQL Schema Analysis Report\n\n';
        md += `**Generated:** ${new Date().toISOString()}\n\n`;
        
        md += '## Summary\n\n';
        md += `- **Total Tables:** ${report.summary.totalTables}\n`;
        md += `- **Total Columns:** ${report.summary.totalColumns}\n`;
        md += `- **Total Indexes:** ${report.summary.totalIndexes}\n`;
        md += `- **Critical Vulnerabilities:** ${report.summary.criticalVulnerabilities}\n`;
        md += `- **High Priority Optimizations:** ${report.summary.highPriorityOptimizations}\n\n`;
        
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
                if (v.autoFixSQL) md += `**Auto-fix SQL:**\n\`\`\`sql\n${v.autoFixSQL}\n\`\`\`\n\n`;
                md += '---\n\n';
            });
        }
        
        md += '## Performance Optimizations\n\n';
        if (report.optimizations.length === 0) {
            md += '✅ No optimizations needed.\n\n';
        } else {
            report.optimizations.forEach((o, i) => {
                md += `### ${i + 1}. ${o.type.replace(/_/g, ' ')} (${o.priority})\n\n`;
                md += `**Table:** ${o.table}\n\n`;
                if (o.column) md += `**Column:** ${o.column}\n\n`;
                md += `**Description:** ${o.description}\n\n`;
                md += `**Recommendation:** ${o.recommendation}\n\n`;
                md += `**Estimated Impact:** ${o.estimatedImpact}\n\n`;
                if (o.autoFixSQL) md += `**Auto-fix SQL:**\n\`\`\`sql\n${o.autoFixSQL}\n\`\`\`\n\n`;
                md += '---\n\n';
            });
        }
        
        return md;
    }

    generateAutoFixSQL() {
        let sql = '-- Automated SQL Schema Fixes\n';
        sql += `-- Generated: ${new Date().toISOString()}\n`;
        sql += '-- WARNING: Review these changes before applying!\n\n';
        
        const autoFixableVulns = this.vulnerabilities.filter(v => v.automated && v.autoFixSQL);
        if (autoFixableVulns.length > 0) {
            sql += '-- Security Fixes\n';
            autoFixableVulns.forEach(v => {
                sql += `-- Fix: ${v.type} in ${v.table}\n`;
                sql += `${v.autoFixSQL}\n\n`;
            });
        }
        
        const autoFixableOpts = this.optimizations.filter(o => o.automated && o.autoFixSQL);
        if (autoFixableOpts.length > 0) {
            sql += '-- Performance Optimizations\n';
            autoFixableOpts.forEach(o => {
                sql += `-- Fix: ${o.type} in ${o.table}\n`;
                sql += `${o.autoFixSQL}\n\n`;
            });
        }
        
        return sql;
    }
}

// Main execution function
async function main() {
    console.log(`${colors.cyan}${colors.bright}🔬 SQL Schema Analyzer - Automated Analysis${colors.reset}\n`);

    let sqlFiles = [];
    
    if (options.scan) {
        console.log(`${colors.yellow}Scanning codebase for SQL files...${colors.reset}`);
        sqlFiles = scanForSQLFiles(process.cwd());
        console.log(`${colors.green}Found ${sqlFiles.length} SQL file(s)${colors.reset}\n`);
    } else if (options.target) {
        const target = path.resolve(options.target);
        if (fs.statSync(target).isDirectory()) {
            sqlFiles = scanForSQLFiles(target);
        } else {
            sqlFiles = [target];
        }
    }

    if (sqlFiles.length === 0) {
        console.error(`${colors.red}No SQL files found to analyze${colors.reset}`);
        process.exit(1);
    }

    let allResults = {
        files: [],
        aggregated: {
            totalTables: 0,
            totalVulnerabilities: 0,
            totalOptimizations: 0,
            criticalVulnerabilities: 0,
            highPriorityOptimizations: 0
        }
    };

    for (const file of sqlFiles) {
        if (options.verbose) {
            console.log(`${colors.blue}Analyzing: ${file}${colors.reset}`);
        }

        const sqlContent = fs.readFileSync(file, 'utf8');
        const analyzer = new SQLSchemaAnalyzer();
        
        analyzer.parseSchema(sqlContent);
        analyzer.analyzeSecurityVulnerabilities();
        analyzer.analyzePerformanceOptimizations();
        analyzer.extractRelationships();
        
        const report = analyzer.getAnalysisReport();
        
        allResults.files.push({
            file: file,
            report: report
        });
        
        allResults.aggregated.totalTables += report.summary.totalTables;
        allResults.aggregated.totalVulnerabilities += report.vulnerabilities.length;
        allResults.aggregated.totalOptimizations += report.optimizations.length;
        allResults.aggregated.criticalVulnerabilities += report.summary.criticalVulnerabilities;
        allResults.aggregated.highPriorityOptimizations += report.summary.highPriorityOptimizations;
        
        if (options.verbose) {
            console.log(`  ${colors.green}✓ Found ${report.summary.totalTables} tables${colors.reset}`);
            console.log(`  ${colors.yellow}⚠ ${report.vulnerabilities.length} vulnerabilities${colors.reset}`);
            console.log(`  ${colors.magenta}⚡ ${report.optimizations.length} optimizations${colors.reset}\n`);
        }
    }

    // Generate output
    let output = '';
    if (options.outputFormat === 'json') {
        output = JSON.stringify(allResults, null, 2);
    } else if (options.outputFormat === 'markdown') {
        output = generateAggregatedMarkdown(allResults);
    } else if (options.outputFormat === 'sql' || options.autoFix) {
        output = generateAggregatedAutoFix(allResults);
    }

    // Export to file if specified
    if (options.exportFile) {
        fs.writeFileSync(options.exportFile, output);
        console.log(`${colors.green}✓ Results exported to: ${options.exportFile}${colors.reset}\n`);
    } else {
        console.log(output);
    }

    // Print summary
    console.log(`${colors.cyan}${colors.bright}Summary:${colors.reset}`);
    console.log(`  Files analyzed: ${sqlFiles.length}`);
    console.log(`  Tables found: ${allResults.aggregated.totalTables}`);
    console.log(`  Vulnerabilities: ${allResults.aggregated.totalVulnerabilities} (${allResults.aggregated.criticalVulnerabilities} critical)`);
    console.log(`  Optimizations: ${allResults.aggregated.totalOptimizations} (${allResults.aggregated.highPriorityOptimizations} high priority)`);

    // CI mode: exit with error if critical issues found
    if (options.ci && allResults.aggregated.criticalVulnerabilities > 0) {
        console.error(`\n${colors.red}${colors.bright}❌ CI Failed: ${allResults.aggregated.criticalVulnerabilities} critical vulnerabilities found${colors.reset}`);
        process.exit(1);
    }

    console.log(`\n${colors.green}${colors.bright}✅ Analysis complete!${colors.reset}`);
}

// Scan directory for SQL files
function scanForSQLFiles(dir) {
    const sqlFiles = [];
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'vendor'];
    
    function scan(currentDir) {
        const files = fs.readdirSync(currentDir);
        
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                if (!excludeDirs.includes(file)) {
                    scan(filePath);
                }
            } else if (file.endsWith('.sql')) {
                sqlFiles.push(filePath);
            }
        }
    }
    
    scan(dir);
    return sqlFiles;
}

// Generate aggregated markdown report
function generateAggregatedMarkdown(results) {
    let md = '# SQL Schema Analysis Report - Aggregated\n\n';
    md += `**Generated:** ${new Date().toISOString()}\n`;
    md += `**Files Analyzed:** ${results.files.length}\n\n`;
    
    md += '## Summary\n\n';
    md += `- **Total Tables:** ${results.aggregated.totalTables}\n`;
    md += `- **Total Vulnerabilities:** ${results.aggregated.totalVulnerabilities} (${results.aggregated.criticalVulnerabilities} critical)\n`;
    md += `- **Total Optimizations:** ${results.aggregated.totalOptimizations} (${results.aggregated.highPriorityOptimizations} high priority)\n\n`;
    
    results.files.forEach(fileResult => {
        md += `## File: ${fileResult.file}\n\n`;
        md += `### Tables: ${fileResult.report.summary.totalTables}\n\n`;
        
        if (fileResult.report.vulnerabilities.length > 0) {
            md += '#### Vulnerabilities\n\n';
            fileResult.report.vulnerabilities.forEach(v => {
                md += `- **${v.severity}**: ${v.type.replace(/_/g, ' ')} in ${v.table}${v.column ? `.${v.column}` : ''}\n`;
            });
            md += '\n';
        }
        
        if (fileResult.report.optimizations.length > 0) {
            md += '#### Optimizations\n\n';
            fileResult.report.optimizations.forEach(o => {
                md += `- **${o.priority}**: ${o.type.replace(/_/g, ' ')} in ${o.table}\n`;
            });
            md += '\n';
        }
        
        md += '---\n\n';
    });
    
    return md;
}

// Generate aggregated auto-fix SQL
function generateAggregatedAutoFix(results) {
    let sql = '-- Automated SQL Schema Fixes - Aggregated\n';
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += '-- WARNING: Review these changes before applying!\n\n';
    
    results.files.forEach(fileResult => {
        sql += `-- File: ${fileResult.file}\n\n`;
        
        const autoFixableVulns = fileResult.report.vulnerabilities.filter(v => v.automated && v.autoFixSQL);
        const autoFixableOpts = fileResult.report.optimizations.filter(o => o.automated && o.autoFixSQL);
        
        if (autoFixableVulns.length > 0) {
            sql += '-- Security Fixes\n';
            autoFixableVulns.forEach(v => {
                sql += `-- Fix: ${v.type} in ${v.table}\n`;
                sql += `${v.autoFixSQL}\n\n`;
            });
        }
        
        if (autoFixableOpts.length > 0) {
            sql += '-- Performance Optimizations\n';
            autoFixableOpts.forEach(o => {
                sql += `-- Fix: ${o.type} in ${o.table}\n`;
                sql += `${o.autoFixSQL}\n\n`;
            });
        }
        
        sql += '\n';
    });
    
    return sql;
}

// Run the CLI
main().catch(error => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    if (options.verbose) {
        console.error(error.stack);
    }
    process.exit(1);
});
