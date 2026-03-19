// RootIB: RB-20260319142113-04C29143
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
 * File: sql-handler.js
 * Declaration ID: IP-5FDFB834-MLL28ZV6
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
 * SQL Handler - Automated SQL Handling Utilities
 * Provides SQL sanitization, validation, and injection prevention
 * Can be included in any HTML file for automated SQL handling
 */

(function(window) {
  'use strict';

  /**
   * SQL Handler class - Main utility for SQL handling
   */
  class SQLHandler {
    constructor() {
      this.sqlKeywords = [
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
        'TRUNCATE', 'EXEC', 'EXECUTE', 'UNION', 'WHERE', 'FROM', 'JOIN',
        'AND', 'OR', 'NOT', 'LIKE', 'IN', 'EXISTS', 'BETWEEN', 'IS', 'NULL'
      ];
      
      // Intentionally aggressive patterns for security - better to have false positives
      // than miss actual SQL injection attempts
      this.dangerousPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|into|table|database)\b)/gi,
        /(;|\-\-|\/\*|\*\/|xp_|sp_)/gi,
        /('|\"|`)(.*?)\1/gi, // String literals that might contain injection - may have false positives for normal quoted text
        /(\bor\b|\band\b).*?=.*?=/gi // Boolean-based injection patterns
      ];
    }

    /**
     * Sanitize a string to prevent SQL injection
     * @param {string} input - Raw user input
     * @returns {string} Sanitized string safe for SQL
     */
    sanitize(input) {
      if (typeof input !== 'string') {
        return String(input);
      }

      // Remove or escape dangerous characters
      let sanitized = input
        .replace(/'/g, "''")  // Escape single quotes
        .replace(/"/g, '""')  // Escape double quotes
        .replace(/\\/g, '\\\\') // Escape backslashes
        .replace(/;/g, '')    // Remove semicolons
        .replace(/--/g, '')   // Remove SQL comments
        .replace(/\/\*/g, '') // Remove multi-line comment start
        .replace(/\*\//g, ''); // Remove multi-line comment end

      return sanitized;
    }

    /**
     * Validate if a string contains potential SQL injection
     * @param {string} input - String to validate
     * @returns {Object} { safe: boolean, threats: Array<string> }
     */
    validateInput(input) {
      const threats = [];

      if (typeof input !== 'string') {
        return { safe: true, threats: [] };
      }

      // Check for dangerous patterns
      this.dangerousPatterns.forEach((pattern, index) => {
        if (pattern.test(input)) {
          threats.push(`Dangerous pattern ${index + 1} detected`);
        }
      });

      // Check for stacked queries
      if (input.includes(';') && this.containsSQLKeywords(input)) {
        threats.push('Stacked query attempt detected');
      }

      // Check for comment-based injection
      if ((input.includes('--') || input.includes('/*')) && this.containsSQLKeywords(input)) {
        threats.push('Comment-based injection attempt detected');
      }

      return {
        safe: threats.length === 0,
        threats: threats
      };
    }

    /**
     * Check if input contains SQL keywords
     * @param {string} input - String to check
     * @returns {boolean} True if SQL keywords found
     */
    containsSQLKeywords(input) {
      const upperInput = input.toUpperCase();
      return this.sqlKeywords.some(keyword => upperInput.includes(keyword));
    }

    /**
     * Escape SQL identifiers (table names, column names)
     * @param {string} identifier - SQL identifier to escape
     * @returns {string} Escaped identifier
     */
    escapeIdentifier(identifier) {
      if (typeof identifier !== 'string') {
        identifier = String(identifier);
      }

      // Remove any existing backticks and escape the identifier
      return '`' + identifier.replace(/`/g, '``') + '`';
    }

    /**
     * Create a parameterized query placeholder
     * @param {Array} params - Array of parameters
     * @returns {Object} { query: string, params: Array }
     */
    createParameterizedQuery(baseQuery, params = []) {
      const sanitizedParams = params.map(param => this.sanitize(param));
      
      return {
        query: baseQuery,
        params: sanitizedParams,
        toString() {
          // For display purposes only - DO NOT USE IN PRODUCTION
          let displayQuery = baseQuery;
          sanitizedParams.forEach((param, i) => {
            displayQuery = displayQuery.replace('?', `'${param}'`);
          });
          return displayQuery;
        }
      };
    }

    /**
     * Validate a SQL query for security issues
     * @param {string} query - SQL query to validate
     * @returns {Object} { safe: boolean, issues: Array<Object> }
     */
    validateQuery(query) {
      const issues = [];

      if (!query || typeof query !== 'string') {
        return { safe: false, issues: [{ severity: 'ERROR', message: 'Invalid query' }] };
      }

      // Check for multiple statements (stacked queries)
      const statements = query.split(';').filter(s => s.trim());
      if (statements.length > 1) {
        issues.push({
          severity: 'HIGH',
          message: 'Multiple SQL statements detected - potential SQL injection',
          recommendation: 'Use parameterized queries instead'
        });
      }

      // Check for string concatenation patterns
      if (query.match(/\+\s*["'`]/g)) {
        issues.push({
          severity: 'HIGH',
          message: 'String concatenation detected in query',
          recommendation: 'Use parameterized queries with placeholders'
        });
      }

      // Check for unparameterized values
      if (query.match(/WHERE\s+\w+\s*=\s*["'`][^"'`]*["'`]/gi)) {
        issues.push({
          severity: 'MEDIUM',
          message: 'Hardcoded values in WHERE clause',
          recommendation: 'Consider using parameterized queries'
        });
      }

      // Check for SELECT *
      if (query.match(/SELECT\s+\*/gi)) {
        issues.push({
          severity: 'LOW',
          message: 'SELECT * detected',
          recommendation: 'Specify exact columns needed for better performance'
        });
      }

      // Check for missing WHERE clause in UPDATE/DELETE
      if (query.match(/\b(UPDATE|DELETE)\b/gi) && !query.match(/\bWHERE\b/gi)) {
        issues.push({
          severity: 'CRITICAL',
          message: 'UPDATE or DELETE without WHERE clause',
          recommendation: 'Always use WHERE clause to prevent data loss'
        });
      }

      return {
        safe: issues.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL').length === 0,
        issues: issues
      };
    }

    /**
     * Format a SQL query for display
     * @param {string} query - SQL query to format
     * @returns {string} Formatted query
     */
    formatQuery(query) {
      if (!query) return '';

      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
        'INNER JOIN', 'OUTER JOIN', 'ON', 'AND', 'OR', 'ORDER BY', 
        'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO', 
        'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE'
      ];

      let formatted = query;

      // Add newlines before major keywords
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, (match) => {
          return '\n' + match;
        });
      });

      // Clean up extra whitespace
      formatted = formatted
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n');

      return formatted;
    }

    /**
     * Log SQL operations for debugging
     * @param {string} operation - Type of operation
     * @param {string} query - SQL query
     * @param {Object} result - Operation result
     */
    logOperation(operation, query, result = null) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        operation,
        query: this.formatQuery(query),
        result
      };

      if (console && console.groupCollapsed) {
        console.groupCollapsed(`[SQL] ${operation} - ${timestamp}`);
        console.log('Query:', logEntry.query);
        if (result) {
          console.log('Result:', result);
        }
        console.groupEnd();
      }

      return logEntry;
    }

    /**
     * Auto-inject SQL handler into forms
     * @param {string} formSelector - CSS selector for forms to protect
     */
    autoProtectForms(formSelector = 'form') {
      const forms = document.querySelectorAll(formSelector);
      
      forms.forEach(form => {
        // Skip if already protected
        if (form.hasAttribute('data-sql-protected')) {
          return;
        }

        form.addEventListener('submit', (e) => {
          const inputs = form.querySelectorAll('input[type="text"], input[type="search"], textarea');
          let hasThreats = false;

          inputs.forEach(input => {
            const validation = this.validateInput(input.value);
            if (!validation.safe) {
              hasThreats = true;
              
              // Add visual feedback
              input.style.borderColor = '#ef4444';
              input.setAttribute('title', validation.threats.join(', '));

              // Show warning
              const warning = document.createElement('div');
              warning.className = 'sql-injection-warning';
              warning.setAttribute('data-sql-warning', 'true'); // Mark for reliable identification
              warning.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 4px;';
              warning.textContent = '⚠️ Potentially unsafe input detected';
              
              const nextSibling = input.nextElementSibling;
              if (!nextSibling || !nextSibling.hasAttribute('data-sql-warning')) {
                if (input.parentNode) {
                  input.parentNode.insertBefore(warning, input.nextSibling);
                }
              }
            } else {
              // Remove warning if input is now safe
              input.style.borderColor = '';
              const warning = input.nextElementSibling;
              if (warning?.hasAttribute('data-sql-warning')) {
                warning.remove();
              }
            }
          });

          if (hasThreats) {
            e.preventDefault();
            // Using alert() for maximum compatibility - consider replacing with custom modal in production
            alert('⚠️ Potentially unsafe input detected. Please review your input and try again.');
            return false;
          }
        });

        form.setAttribute('data-sql-protected', 'true');
      });

      console.log(`[SQLHandler] Protected ${forms.length} form(s) from SQL injection`);
    }

    /**
     * Auto-sanitize all inputs on a page
     * @param {string} inputSelector - CSS selector for inputs to protect
     */
    autoSanitizeInputs(inputSelector = 'input[type="text"], textarea') {
      const inputs = document.querySelectorAll(inputSelector);
      
      inputs.forEach(input => {
        // Skip if already protected
        if (input.hasAttribute('data-sql-sanitized')) {
          return;
        }

        input.addEventListener('blur', (e) => {
          const validation = this.validateInput(e.target.value);
          if (!validation.safe) {
            // Auto-sanitize
            e.target.value = this.sanitize(e.target.value);
            
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'sql-sanitize-notification';
            notification.setAttribute('data-sql-notification', 'true'); // Mark for reliable identification
            notification.style.cssText = 'color: #f59e0b; font-size: 12px; margin-top: 4px;';
            notification.textContent = '✓ Input automatically sanitized';
            
            if (e.target.parentNode) {
              e.target.parentNode.insertBefore(notification, e.target.nextSibling);
            }
            
            setTimeout(() => notification.remove(), 3000);
          }
        });

        input.setAttribute('data-sql-sanitized', 'true');
      });

      console.log(`[SQLHandler] Auto-sanitization enabled for ${inputs.length} input(s)`);
    }
  }

  // Create global instance
  window.SQLHandler = SQLHandler;
  window.sqlHandler = new SQLHandler();

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.SQL_AUTO_PROTECT !== false) {
        window.sqlHandler.autoProtectForms();
        console.log('[SQLHandler] Auto-protection enabled. Set window.SQL_AUTO_PROTECT = false to disable.');
      }
    });
  } else {
    if (window.SQL_AUTO_PROTECT !== false) {
      window.sqlHandler.autoProtectForms();
      console.log('[SQLHandler] Auto-protection enabled. Set window.SQL_AUTO_PROTECT = false to disable.');
    }
  }

  console.log('[SQLHandler] SQL handling utilities loaded successfully');

})(window);
