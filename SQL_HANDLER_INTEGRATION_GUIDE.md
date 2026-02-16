---
layout: default
title: SQL HANDLER INTEGRATION GUIDE
---

# SQL Handler Integration Guide

## 🔒 Automated SQL Handling for All HTML Files

This guide shows how to integrate automated SQL injection prevention and query validation into any HTML file in the repository.

---

## 🚀 Quick Start

### 1. Basic Integration

Add this single line to any HTML file (preferably in the `<head>` or before closing `</body>`):

```html
<!-- Automated SQL Handling -->
<script src="/js/sql-handler.js"></script>
```

That's it! The SQL handler will automatically:
- ✅ Protect all forms from SQL injection
- ✅ Validate user inputs
- ✅ Provide visual warnings for unsafe inputs
- ✅ Log SQL operations for debugging

---

## 📋 Features

### 🛡️ Automatic Form Protection

Once included, all forms are automatically protected:

```html
<form>
  <input type="text" name="username" placeholder="Enter username">
  <input type="text" name="query" placeholder="Search...">
  <button type="submit">Submit</button>
</form>
```

The handler will:
- Detect SQL injection attempts in form inputs
- Show visual warnings (red border + error message)
- Prevent form submission if threats detected
- Auto-sanitize inputs on blur

### 🔍 Manual Input Validation

You can also manually validate and sanitize inputs:

```javascript
// Validate user input
const validation = sqlHandler.validateInput(userInput);
if (!validation.safe) {
  console.warn('Threats detected:', validation.threats);
}

// Sanitize input
const safeInput = sqlHandler.sanitize(userInput);

// Validate a SQL query
const queryValidation = sqlHandler.validateQuery(sqlQuery);
if (!queryValidation.safe) {
  console.warn('Query issues:', queryValidation.issues);
}
```

### 📝 Query Formatting

Format SQL queries for better readability:

```javascript
const formatted = sqlHandler.formatQuery(`
  SELECT * FROM users WHERE id = 1 AND status = 'active' ORDER BY created_at DESC
`);
console.log(formatted);
// Output:
// SELECT * 
// FROM users 
// WHERE id = 1 
// AND status = 'active' 
// ORDER BY created_at DESC
```

### 🔐 Parameterized Queries

Create safe parameterized queries:

```javascript
const { query, params } = sqlHandler.createParameterizedQuery(
  'SELECT * FROM users WHERE username = ? AND email = ?',
  [username, email]
);

// query: 'SELECT * FROM users WHERE username = ? AND email = ?'
// params: ['sanitized_username', 'sanitized_email']
```

### 🏷️ Escape SQL Identifiers

Safely escape table and column names:

```javascript
const tableName = sqlHandler.escapeIdentifier(userTableName);
// Input: "users"
// Output: "`users`"

const query = `SELECT * FROM ${tableName}`;
```

---

## ⚙️ Configuration

### Disable Auto-Protection

If you want to manually control protection, disable auto-protection:

```html
<script>
  // Disable automatic form protection
  window.SQL_AUTO_PROTECT = false;
</script>
<script src="/js/sql-handler.js"></script>
```

Then manually protect specific forms:

```javascript
// Protect specific forms
sqlHandler.autoProtectForms('#myForm');

// Enable auto-sanitization for specific inputs
sqlHandler.autoSanitizeInputs('.sql-input');
```

---

## 🎯 Use Cases by File Type

### Files with Forms (e.g., bookScanner.html, account.html)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Form</title>
  <!-- Add SQL Handler -->
  <script src="/js/sql-handler.js"></script>
</head>
<body>
  <form id="searchForm">
    <input type="text" name="query">
    <button type="submit">Search</button>
  </form>
  <!-- Forms are automatically protected! -->
</body>
</html>
```

### Files with SQL Query Display (e.g., sqlAnalyzer.html, joinHelper.html)

```html
<!DOCTYPE html>
<html>
<head>
  <title>SQL Analyzer</title>
  <script src="/js/sql-handler.js"></script>
</head>
<body>
  <textarea id="sqlInput"></textarea>
  <button onclick="analyzeQuery()">Analyze</button>
  
  <script>
    function analyzeQuery() {
      const query = document.getElementById('sqlInput').value;
      
      // Validate the query
      const validation = sqlHandler.validateQuery(query);
      
      if (!validation.safe) {
        console.warn('Query has issues:', validation.issues);
        // Display issues to user
        validation.issues.forEach(issue => {
          console.log(`[${issue.severity}] ${issue.message}`);
          console.log(`💡 ${issue.recommendation}`);
        });
      }
      
      // Format for display
      const formatted = sqlHandler.formatQuery(query);
      console.log('Formatted query:', formatted);
    }
  </script>
</body>
</html>
```

### Files with User Input (e.g., investO.html, microHowTo.html)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Investment Tool</title>
  <script src="/js/sql-handler.js"></script>
</head>
<body>
  <input type="text" id="investmentQuery">
  <button onclick="processInput()">Process</button>
  
  <script>
    function processInput() {
      const input = document.getElementById('investmentQuery').value;
      
      // Validate before processing
      const validation = sqlHandler.validateInput(input);
      
      if (!validation.safe) {
        alert('⚠️ Input contains potentially unsafe content');
        return;
      }
      
      // Sanitize for extra safety
      const safeInput = sqlHandler.sanitize(input);
      
      // Process the safe input...
      processData(safeInput);
    }
  </script>
</body>
</html>
```

---

## 📊 Validation Results

### Input Validation

```javascript
const result = sqlHandler.validateInput("admin' OR '1'='1");
// {
//   safe: false,
//   threats: [
//     "Dangerous pattern 1 detected",
//     "Dangerous pattern 3 detected"
//   ]
// }
```

### Query Validation

```javascript
const result = sqlHandler.validateQuery("DELETE FROM users");
// {
//   safe: false,
//   issues: [
//     {
//       severity: "CRITICAL",
//       message: "UPDATE or DELETE without WHERE clause",
//       recommendation: "Always use WHERE clause to prevent data loss"
//     }
//   ]
// }
```

---

## 🧪 Testing

Test the SQL handler with these examples:

```javascript
// Test 1: SQL injection attempt
console.log(sqlHandler.validateInput("admin' OR '1'='1"));
// Should detect threat

// Test 2: Normal input
console.log(sqlHandler.validateInput("john.doe@example.com"));
// Should be safe

// Test 3: Dangerous query
console.log(sqlHandler.validateQuery("DELETE FROM users"));
// Should show critical issue

// Test 4: Safe query
console.log(sqlHandler.validateQuery("SELECT * FROM users WHERE id = ?"));
// Should be safe
```

---

## 🎨 Visual Feedback

When threats are detected, users see:

1. **Red border** on the input field
2. **Warning message** below the input: "⚠️ Potentially unsafe input detected"
3. **Tooltip** with specific threats when hovering over the input
4. **Alert dialog** preventing form submission

When inputs are auto-sanitized:

1. **Yellow notification**: "✓ Input automatically sanitized"
2. **Auto-fades** after 3 seconds

---

## 🔧 Advanced Usage

### Custom Validation Rules

Extend the handler with custom rules:

```javascript
// Add custom dangerous pattern
sqlHandler.dangerousPatterns.push(/custom_dangerous_pattern/gi);

// Check for custom keywords
if (sqlHandler.containsSQLKeywords(input)) {
  // Handle SQL keywords
}
```

### Logging SQL Operations

Log all SQL operations for debugging:

```javascript
const logEntry = sqlHandler.logOperation('QUERY', query, result);
// Creates a collapsed console group with timestamp, query, and result
```

### Batch Validation

Validate multiple inputs at once:

```javascript
const inputs = document.querySelectorAll('input[type="text"]');
const results = Array.from(inputs).map(input => ({
  name: input.name,
  value: input.value,
  validation: sqlHandler.validateInput(input.value)
}));

const unsafeInputs = results.filter(r => !r.validation.safe);
if (unsafeInputs.length > 0) {
  console.warn('Unsafe inputs detected:', unsafeInputs);
}
```

---

## 📁 Files That Should Include SQL Handler

### High Priority (Forms/User Input)
- ✅ bookScanner.html
- ✅ account.html
- ✅ contractor-registration.html
- ✅ translator.html
- ✅ investO.html
- ✅ microHowTo.html
- ✅ aFactory.html
- ✅ joinHelper.html (already has SQL)
- ✅ All files in `contractor-*.html`
- ✅ All files with `<form>` tags

### Medium Priority (Data Display/Storage)
- ✅ dashboard.html
- ✅ admin-*.html files
- ✅ *-test.html files with forms
- ✅ Files using localStorage/sessionStorage

### Low Priority (Static Content)
- Static display pages without forms
- Documentation pages
- Pure visualization pages

---

## 🚨 Security Best Practices

1. **Always validate** user inputs before processing
2. **Use parameterized queries** instead of string concatenation
3. **Sanitize outputs** when displaying user data
4. **Log suspicious activity** for security monitoring
5. **Never trust client-side validation alone** - always validate server-side too
6. **Use prepared statements** in backend code
7. **Limit database permissions** to minimum required

---

## 🐛 Troubleshooting

### Handler Not Working

```javascript
// Check if handler is loaded
if (window.sqlHandler) {
  console.log('✓ SQL Handler loaded');
} else {
  console.error('✗ SQL Handler not loaded');
}
```

### Forms Not Protected

```javascript
// Manually trigger protection
sqlHandler.autoProtectForms();

// Check if forms are protected
document.querySelectorAll('form').forEach(form => {
  console.log('Protected:', form.hasAttribute('data-sql-protected'));
});
```

### Custom Error Messages

```javascript
// Override default alert with custom UI
const originalAutoProtectForms = sqlHandler.autoProtectForms;
sqlHandler.autoProtectForms = function(selector) {
  // Custom implementation
  originalAutoProtectForms.call(this, selector);
  // Add custom error handling
};
```

---

## 📚 API Reference

### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `sanitize(input)` | `string` | `string` | Sanitize input for SQL |
| `validateInput(input)` | `string` | `Object` | Validate for SQL injection |
| `validateQuery(query)` | `string` | `Object` | Validate SQL query |
| `escapeIdentifier(id)` | `string` | `string` | Escape table/column names |
| `formatQuery(query)` | `string` | `string` | Format SQL for display |
| `autoProtectForms(selector)` | `string` | `void` | Auto-protect forms |
| `autoSanitizeInputs(selector)` | `string` | `void` | Auto-sanitize inputs |
| `logOperation(op, query, result)` | `string, string, Object` | `Object` | Log SQL operation |

---

## 🎉 Summary

By adding a single line to your HTML files:

```html
<script src="/js/sql-handler.js"></script>
```

You get:
- ✅ Automatic SQL injection prevention
- ✅ Input validation and sanitization
- ✅ Query security analysis
- ✅ Visual feedback for users
- ✅ Debugging and logging tools
- ✅ Zero configuration needed
- ✅ Works with existing code

**Make your application more secure in seconds!** 🔒

---

*For questions or issues, refer to the main SQL_AUTOMATION_GUIDE.md*
