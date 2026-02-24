// ARIA Parser - Extracts and formats code blocks
// Handles code parsing, formatting, and metadata extraction

(function() {
  'use strict';

  window.ARIA = window.ARIA || {};

  // Parse a single code block
  function parseBlock(block) {
    const { code, language, platform, element } = block;

    return {
      code: cleanCode(code),
      language: language || 'text',
      platform,
      lineCount: code.split('\n').length,
      charCount: code.length,
      hasImports: detectImports(code, language),
      hasFunctions: detectFunctions(code, language),
      hasClasses: detectClasses(code, language),
      filename: suggestFilename(code, language),
      metadata: extractMetadata(element)
    };
  }

  // Clean code (remove extra whitespace, normalize line endings)
  function cleanCode(code) {
    return code
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '  ')
      .trim();
  }

  // Detect import statements
  function detectImports(code, language) {
    const importPatterns = {
      python: /^(import |from .+ import )/m,
      javascript: /^(import |require\(|from ['"])/m,
      typescript: /^(import |from ['"])/m,
      java: /^import /m,
      go: /^import /m,
      rust: /^use /m,
      cpp: /^#include/m,
      php: /^(use |require|include)/m
    };

    const pattern = importPatterns[language];
    return pattern ? pattern.test(code) : false;
  }

  // Detect function definitions
  function detectFunctions(code, language) {
    const functionPatterns = {
      python: /^(def |async def )/m,
      javascript: /(function |const \w+ = |let \w+ = |=> \{)/m,
      typescript: /(function |const \w+ = |=> \{)/m,
      java: /(public |private |protected )?.*(void|int|String|boolean|static) \w+\s*\(/m,
      go: /^func /m,
      rust: /^(pub )?fn /m,
      cpp: /^(void|int|bool|string|auto) \w+\s*\(/m,
      php: /^(public |private |protected )?function /m
    };

    const pattern = functionPatterns[language];
    return pattern ? pattern.test(code) : false;
  }

  // Detect class definitions
  function detectClasses(code, language) {
    const classPatterns = {
      python: /^class \w+/m,
      javascript: /^class \w+/m,
      typescript: /^(export )?(abstract )?class \w+/m,
      java: /^(public |private )?(abstract )?class \w+/m,
      cpp: /^class \w+/m,
      php: /^(abstract )?class \w+/m,
      rust: /^(pub )?struct \w+/m
    };

    const pattern = classPatterns[language];
    return pattern ? pattern.test(code) : false;
  }

  // Suggest a filename based on code content
  function suggestFilename(code, language) {
    const extensions = {
      python: '.py',
      javascript: '.js',
      typescript: '.ts',
      java: '.java',
      go: '.go',
      rust: '.rs',
      cpp: '.cpp',
      c: '.c',
      php: '.php',
      html: '.html',
      css: '.css',
      sql: '.sql',
      json: '.json',
      yaml: '.yaml',
      markdown: '.md',
      bash: '.sh',
      shell: '.sh',
      text: '.txt'
    };

    const ext = extensions[language] || '.txt';

    // Try to extract a meaningful name
    let name = 'code';

    // Check for class name
    const classMatch = code.match(/class\s+(\w+)/);
    if (classMatch) {
      name = classMatch[1].toLowerCase();
    }

    // Check for function name (if no class)
    else {
      const funcMatch = code.match(/(?:def|function|func|fn)\s+(\w+)/);
      if (funcMatch) {
        name = funcMatch[1].toLowerCase();
      }
    }

    // Check for filename in comments
    const fileMatch = code.match(/(?:filename|file):\s*(\S+)/i);
    if (fileMatch) {
      return fileMatch[1];
    }

    return name + ext;
  }

  // Extract metadata from the DOM element
  function extractMetadata(element) {
    if (!element) return {};

    const metadata = {};

    // Check for data attributes
    for (const attr of element.attributes || []) {
      if (attr.name.startsWith('data-')) {
        metadata[attr.name.replace('data-', '')] = attr.value;
      }
    }

    // Check parent for context
    const parent = element.closest('[class*="message"], [class*="response"]');
    if (parent) {
      metadata.hasMessageContext = true;
    }

    return metadata;
  }

  // Parse all blocks from detector
  function parseAll(blocks) {
    return blocks.map(block => ({
      ...block,
      parsed: parseBlock(block)
    }));
  }

  // Generate export package
  function generateExportPackage(blocks, format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      return {
        filename: `aria-export-${timestamp}.json`,
        content: JSON.stringify({
          exportedAt: new Date().toISOString(),
          source: 'ARIA Browser Extension',
          version: '1.0.0',
          blockCount: blocks.length,
          blocks: blocks.map(b => ({
            id: b.id,
            code: b.code,
            language: b.language,
            platform: b.platform,
            filename: b.parsed?.filename || 'code.txt',
            capturedAt: b.capturedAt
          }))
        }, null, 2),
        mimeType: 'application/json'
      };
    }

    // For zip format, return structure (actual zipping done in popup)
    return {
      filename: `aria-export-${timestamp}.zip`,
      files: blocks.map(b => ({
        name: b.parsed?.filename || `block-${b.id}.txt`,
        content: b.code
      })),
      mimeType: 'application/zip'
    };
  }

  // Export functions
  ARIA.parser = {
    parseBlock,
    parseAll,
    cleanCode,
    detectImports,
    detectFunctions,
    detectClasses,
    suggestFilename,
    extractMetadata,
    generateExportPackage
  };

  console.log('[ARIA Parser] Initialized');
})();
