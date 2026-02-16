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
 * File: generate-language-pages.js
 * Declaration ID: IP-3D60F830-MLL28ZUZ
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

#!/usr/bin/env node

/**
 * Generate individual HTML pages for each programming language
 * Each page includes the actual code and links to all other languages
 */

const fs = require('fs');
const path = require('path');

// Language metadata mapping - filename maps to unique page name
const languageData = {
    'hello.c': { name: 'C', ext: '.c', category: 'compiled', type: 'text/x-csrc', pageName: 'c' },
    'hello.cpp': { name: 'C++', ext: '.cpp, .hpp', category: 'compiled', type: 'text/x-c++src', pageName: 'cpp' },
    'hello.cs': { name: 'C#', ext: '.cs', category: 'compiled', type: 'text/x-csharp', pageName: 'csharp' },
    'hello.java': { name: 'Java', ext: '.java', category: 'compiled', type: 'text/x-java', pageName: 'java' },
    'hello.go': { name: 'Go', ext: '.go', category: 'compiled', type: 'text/x-go', advanced: true, pageName: 'go' },
    'hello.rs': { name: 'Rust', ext: '.rs', category: 'compiled', type: 'text/x-rustsrc', advanced: true, pageName: 'rust' },
    'hello.swift': { name: 'Swift', ext: '.swift', category: 'compiled', type: 'text/x-swift', pageName: 'swift' },
    'hello.kt': { name: 'Kotlin', ext: '.kt', category: 'compiled', type: 'text/x-kotlin', pageName: 'kotlin' },
    'hello.m': { name: 'Objective-C', ext: '.m, .h', category: 'compiled', type: 'text/x-objectivec', pageName: 'objc' },
    'hello.zig': { name: 'Zig', ext: '.zig', category: 'compiled', type: 'text/x-zig', pageName: 'zig' },
    'hello.nim': { name: 'Nim', ext: '.nim', category: 'compiled', type: 'text/x-nim', pageName: 'nim' },
    'hello.cr': { name: 'Crystal', ext: '.cr', category: 'compiled', type: 'text/x-crystal', pageName: 'crystal' },
    'hello.py': { name: 'Python', ext: '.py', category: 'interpreted', type: 'text/x-python', advanced: true, pageName: 'python' },
    'hello.js': { name: 'JavaScript', ext: '.js', category: 'interpreted', type: 'text/javascript', advanced: true, pageName: 'javascript' },
    'hello.ts': { name: 'TypeScript', ext: '.ts', category: 'interpreted', type: 'text/typescript', advanced: true, pageName: 'typescript' },
    'hello.rb': { name: 'Ruby', ext: '.rb', category: 'interpreted', type: 'text/x-ruby', advanced: true, pageName: 'ruby' },
    'hello.php': { name: 'PHP', ext: '.php', category: 'interpreted', type: 'application/x-httpd-php', advanced: true, pageName: 'php' },
    'hello.pl': { name: 'Perl', ext: '.pl', category: 'interpreted', type: 'text/x-perl', pageName: 'perl' },
    'hello.lua': { name: 'Lua', ext: '.lua', category: 'interpreted', type: 'text/x-lua', pageName: 'lua' },
    'hello.sh': { name: 'Bash', ext: '.sh', category: 'interpreted', type: 'text/x-sh', pageName: 'bash' },
    'hello.ps1': { name: 'PowerShell', ext: '.ps1', category: 'interpreted', type: 'text/x-powershell', pageName: 'powershell' },
    'hello.coffee': { name: 'CoffeeScript', ext: '.coffee', category: 'interpreted', type: 'text/x-coffeescript', pageName: 'coffeescript' },
    'hello.hs': { name: 'Haskell', ext: '.hs', category: 'functional', type: 'text/x-haskell', pageName: 'haskell' },
    'hello.scala': { name: 'Scala', ext: '.scala', category: 'functional', type: 'text/x-scala', pageName: 'scala' },
    'hello.clj': { name: 'Clojure', ext: '.clj', category: 'functional', type: 'text/x-clojure', pageName: 'clojure' },
    'hello.erl': { name: 'Erlang', ext: '.erl', category: 'functional', type: 'text/x-erlang', pageName: 'erlang' },
    'hello.ex': { name: 'Elixir', ext: '.ex', category: 'functional', type: 'text/x-elixir', pageName: 'elixir' },
    'hello.fs': { name: 'F#', ext: '.fs', category: 'functional', type: 'text/x-fsharp', pageName: 'fsharp' },
    'hello.ml': { name: 'OCaml', ext: '.ml', category: 'functional', type: 'text/x-ocaml', pageName: 'ocaml' },
    'hello.lisp': { name: 'Lisp', ext: '.lisp', category: 'functional', type: 'text/x-common-lisp', pageName: 'lisp' },
    'hello.r': { name: 'R', ext: '.r, .R', category: 'data', type: 'text/x-rsrc', pageName: 'r' },
    'hello_matlab.m': { name: 'MATLAB', ext: '.m', category: 'data', type: 'text/x-octave', pageName: 'matlab' },
    'hello.jl': { name: 'Julia', ext: '.jl', category: 'data', type: 'text/x-julia', pageName: 'julia' },
    'hello.sql': { name: 'SQL', ext: '.sql', category: 'data', type: 'text/x-sql', pageName: 'sql' },
    'hello.jsx': { name: 'React JSX', ext: '.jsx', category: 'web', type: 'text/jsx', advanced: true, pageName: 'jsx' },
    'hello.tsx': { name: 'React TSX', ext: '.tsx', category: 'web', type: 'text/typescript-jsx', advanced: true, pageName: 'tsx' },
    'hello.svelte': { name: 'Svelte', ext: '.svelte', category: 'web', type: 'text/x-svelte', advanced: true, pageName: 'svelte' },
    'Greeter.vue': { name: 'Vue', ext: '.vue', category: 'web', type: 'text/x-vue', pageName: 'vue' },
    'hello.css': { name: 'CSS', ext: '.css', category: 'web', type: 'text/css', pageName: 'css' },
    'hello.scss': { name: 'SCSS', ext: '.scss', category: 'web', type: 'text/x-scss', pageName: 'scss' },
    'schema.graphql': { name: 'GraphQL', ext: '.graphql', category: 'web', type: 'application/graphql', pageName: 'graphql' },
    'hello.asm': { name: 'Assembly', ext: '.asm', category: 'system', type: 'text/x-asm', pageName: 'assembly' },
    'hello.v': { name: 'Verilog', ext: '.v', category: 'system', type: 'text/x-verilog', pageName: 'verilog' },
    'hello.vhd': { name: 'VHDL', ext: '.vhd', category: 'system', type: 'text/x-vhdl', pageName: 'vhdl' },
    'Greeter.sol': { name: 'Solidity', ext: '.sol', category: 'blockchain', type: 'text/x-solidity', pageName: 'solidity' },
    'shader.glsl': { name: 'GLSL', ext: '.glsl', category: 'graphics', type: 'text/x-glsl', pageName: 'glsl' },
    'shader.hlsl': { name: 'HLSL', ext: '.hlsl', category: 'text/x-hlsl', type: 'text/x-hlsl', pageName: 'hlsl' },
    'CMakeLists.txt': { name: 'CMake', ext: 'CMakeLists.txt', category: 'build', type: 'text/x-cmake', pageName: 'cmake' },
    'Makefile': { name: 'Makefile', ext: 'Makefile', category: 'build', type: 'text/x-makefile', pageName: 'makefile' },
    'Dockerfile': { name: 'Dockerfile', ext: 'Dockerfile', category: 'build', type: 'text/x-dockerfile', pageName: 'dockerfile' },
    'workflow.yml': { name: 'YAML', ext: '.yml, .yaml', category: 'build', type: 'text/x-yaml', pageName: 'yaml' },
    'package.json': { name: 'JSON', ext: '.json', category: 'build', type: 'application/json', pageName: 'json' },
    'Cargo.toml': { name: 'TOML', ext: '.toml', category: 'build', type: 'text/x-toml', pageName: 'toml' },
    'pom.xml': { name: 'XML', ext: '.xml', category: 'build', type: 'application/xml', pageName: 'xml' },
    'hello.proto': { name: 'Protocol Buffers', ext: '.proto', category: 'build', type: 'text/x-protobuf', pageName: 'protobuf' },
    'hello.groovy': { name: 'Groovy', ext: '.groovy', category: 'special', type: 'text/x-groovy', pageName: 'groovy' },
    'hello.dart': { name: 'Dart', ext: '.dart', category: 'special', type: 'application/dart', pageName: 'dart' }
};

const categoryNames = {
    compiled: 'Compiled Languages',
    interpreted: 'Interpreted Languages',
    functional: 'Functional Languages',
    data: 'Data & Scientific Languages',
    web: 'Web & UI Frameworks',
    system: 'System & Hardware Languages',
    blockchain: 'Blockchain & Smart Contracts',
    graphics: 'Graphics & Shaders',
    build: 'Build & Configuration',
    special: 'Special Purpose Languages'
};

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateLanguagePage(filename, metadata, code) {
    const allLanguages = Object.entries(languageData)
        .filter(([f]) => f !== filename)
        .map(([f, m]) => ({ file: f, ...m }))
        .sort((a, b) => a.name.localeCompare(b.name));
    
    const categoryList = {};
    allLanguages.forEach(lang => {
        if (!categoryList[lang.category]) {
            categoryList[lang.category] = [];
        }
        categoryList[lang.category].push(lang);
    });

    const languageLinks = Object.entries(categoryList)
        .map(([cat, langs]) => `
            <div class="language-category">
                <h4>${categoryNames[cat] || cat}</h4>
                <div class="language-links">
                    ${langs.map(lang => `
                        <a href="${lang.pageName}.html" 
                           class="lang-link ${lang.advanced ? 'advanced' : ''}"
                           title="View ${lang.name}">
                            ${lang.name}${lang.advanced ? ' ⭐' : ''}
                        </a>
                    `).join('')}
                </div>
            </div>
        `).join('');

    const escapedCode = escapeHtml(code);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${metadata.name} code sample - BarbrickDesign Complete Programming Language Portfolio">
    <title>${metadata.name} - BarbrickDesign Language Portfolio</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/monokai.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            line-height: 1.6;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            padding: 30px 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            margin-bottom: 30px;
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            font-size: 1rem;
            opacity: 0.9;
            margin-top: 10px;
        }

        .back-link {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background: rgba(255, 215, 0, 0.2);
            border: 2px solid #ffd700;
            border-radius: 8px;
            color: #ffd700;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .back-link:hover {
            background: rgba(255, 215, 0, 0.3);
            transform: translateY(-2px);
        }

        .section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
        }

        .section h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            color: #ffd700;
            border-bottom: 2px solid rgba(255, 215, 0, 0.3);
            padding-bottom: 10px;
        }

        .code-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .info-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }

        .info-label {
            font-size: 0.85rem;
            opacity: 0.8;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 1.1rem;
            font-weight: bold;
            color: #ffd700;
        }

        .code-container {
            background: #1e1e1e;
            border-radius: 12px;
            overflow: hidden;
            margin: 20px 0;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .code-header {
            background: #2d2d2d;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #404040;
        }

        .code-title {
            font-family: 'Courier New', monospace;
            font-size: 0.95rem;
            color: #ffd700;
        }

        .copy-btn {
            background: #ffd700;
            color: #000;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 0.85rem;
            transition: all 0.3s ease;
        }

        .copy-btn:hover {
            background: #ffed4e;
            transform: scale(1.05);
        }

        .copy-btn:active {
            transform: scale(0.95);
        }

        .CodeMirror {
            height: auto !important;
            min-height: 400px;
            max-height: 800px;
            font-size: 14px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        pre {
            margin: 0;
            padding: 20px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            color: #d4d4d4;
        }

        .language-category {
            margin-bottom: 25px;
        }

        .language-category h4 {
            font-size: 1.1rem;
            margin-bottom: 12px;
            color: #ffd700;
            opacity: 0.9;
        }

        .language-links {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .lang-link {
            display: inline-block;
            padding: 8px 15px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #fff;
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .lang-link:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: #ffd700;
            transform: translateY(-2px);
        }

        .lang-link.advanced {
            border-color: rgba(255, 215, 0, 0.3);
        }

        .actions {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .action-btn {
            padding: 12px 24px;
            background: rgba(255, 215, 0, 0.2);
            border: 2px solid #ffd700;
            border-radius: 8px;
            color: #ffd700;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .action-btn:hover {
            background: rgba(255, 215, 0, 0.3);
            transform: translateY(-2px);
        }

        footer {
            text-align: center;
            padding: 30px;
            margin-top: 40px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }

            .section {
                padding: 20px;
            }

            .code-info {
                grid-template-columns: 1fr;
            }

            .CodeMirror {
                font-size: 12px;
            }
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-left: 8px;
            font-weight: bold;
        }

        .badge-advanced {
            background: #e74c3c;
        }
    </style>
    <!-- Anti-Nuclear Safety System Active -->
    <script src="/anti-nuke-safety.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 ${metadata.name}${metadata.advanced ? ' <span class="badge badge-advanced">⭐ Advanced</span>' : ''}</h1>
            <p class="subtitle">BarbrickDesign Complete Programming Language Portfolio</p>
            <a href="../all-languages.html" class="back-link">← Back to All Languages</a>
        </header>

        <div class="section">
            <h2>📊 Language Information</h2>
            <div class="code-info">
                <div class="info-item">
                    <div class="info-label">Language</div>
                    <div class="info-value">${metadata.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">File Extension</div>
                    <div class="info-value">${metadata.ext}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Category</div>
                    <div class="info-value">${categoryNames[metadata.category] || metadata.category}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Lines of Code</div>
                    <div class="info-value" id="lineCount">${code.split('\\n').length}</div>
                </div>
            </div>

            <div class="actions">
                <a href="https://github.com/barbrickdesign/barbrickdesign.github.io/blob/main/language-samples/${filename}" 
                   class="action-btn" target="_blank">
                    <span>📁</span> View on GitHub
                </a>
                <a href="https://github.com/barbrickdesign/barbrickdesign.github.io/raw/main/language-samples/${filename}" 
                   class="action-btn" target="_blank" download>
                    <span>⬇️</span> Download Source
                </a>
            </div>
        </div>

        <div class="section">
            <h2>💻 Source Code</h2>
            <div class="code-container">
                <div class="code-header">
                    <span class="code-title">${filename}</span>
                    <button class="copy-btn" onclick="copyCode()">📋 Copy Code</button>
                </div>
                <textarea id="code-editor">${escapedCode}</textarea>
            </div>
        </div>

        <div class="section">
            <h2>🔗 Explore Other Languages</h2>
            <p style="margin-bottom: 20px; opacity: 0.9;">
                Discover and compare ${Object.keys(languageData).length - 1} other programming languages in our portfolio
            </p>
            ${languageLinks}
        </div>

        <footer>
            <h3>BarbrickDesign</h3>
            <p>Complete Programming Language Portfolio</p>
            <p style="margin-top: 10px; opacity: 0.8;">
                Showcasing every major programming language
            </p>
        </footer>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/python/python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/clike/clike.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/go/go.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/rust/rust.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/ruby/ruby.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/php/php.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/sql/sql.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/xml/xml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/css/css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/yaml/yaml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/shell/shell.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/powershell/powershell.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/haskell/haskell.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/clojure/clojure.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/erlang/erlang.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/r/r.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/lua/lua.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/perl/perl.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/swift/swift.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/vue/vue.min.js"></script>

    <script>
        // Initialize CodeMirror
        const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
            mode: '${metadata.type}',
            theme: 'monokai',
            lineNumbers: true,
            readOnly: true,
            lineWrapping: true,
            viewportMargin: Infinity
        });

        // Copy code to clipboard
        function copyCode() {
            const code = editor.getValue();
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy code to clipboard');
            });
        }

        // Add animation
        document.addEventListener('DOMContentLoaded', function() {
            const sections = document.querySelectorAll('.section');
            sections.forEach((section, index) => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    section.style.transition = 'all 0.6s ease';
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, index * 150);
            });

            console.log('%c🚀 ${metadata.name} Language Page', 'font-size: 20px; font-weight: bold; color: #ffd700;');
            console.log('%cCategory: ${categoryNames[metadata.category]}', 'font-size: 14px; color: #3498db;');
            console.log('%cExplore ${Object.keys(languageData).length - 1} more languages!', 'font-size: 14px; color: #2ecc71;');
        });
    </script>
</body>
</html>`;
}

// Main execution
const languageSamplesDir = path.join(__dirname, 'language-samples');
const languagesDir = path.join(__dirname, 'languages');

// Ensure directories exist
if (!fs.existsSync(languagesDir)) {
    fs.mkdirSync(languagesDir, { recursive: true });
}

console.log('🚀 Generating individual language pages...\n');

let generatedCount = 0;
let errorCount = 0;

for (const [filename, metadata] of Object.entries(languageData)) {
    try {
        const sourcePath = path.join(languageSamplesDir, filename);
        
        // Read the source code
        if (!fs.existsSync(sourcePath)) {
            console.log(`⚠️  Skipping ${filename} - file not found`);
            errorCount++;
            continue;
        }

        const code = fs.readFileSync(sourcePath, 'utf8');
        
        // Generate HTML page
        const html = generateLanguagePage(filename, metadata, code);
        
        // Write to file using pageName
        const outputFilename = metadata.pageName + '.html';
        const outputPath = path.join(languagesDir, outputFilename);
        fs.writeFileSync(outputPath, html, 'utf8');
        
        console.log(`✅ Generated: ${outputFilename} (${metadata.name})`);
        generatedCount++;
        
    } catch (error) {
        console.error(`❌ Error generating ${filename}:`, error.message);
        errorCount++;
    }
}

console.log(`\n📊 Summary:`);
console.log(`   ✅ Successfully generated: ${generatedCount} pages`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log(`\n🎉 Done! Pages are in the 'languages' directory.`);
