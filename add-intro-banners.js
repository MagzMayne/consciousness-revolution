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
 * File: add-intro-banners.js
 * Declaration ID: IP-675D77D-MLL28ZUG
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Script to add "What is This?" intro banners to major HTML project files
 * Adds simple, beginner-friendly explanations to complex pages
 */

const fs = require('fs');
const path = require('path');

// Define intro banners for each major project
const introBanners = {
    'oasis.html': {
        icon: '🌌',
        title: 'Virtual 3D Universe Game',
        description: 'Explore a 3D virtual world directly in your browser - like Ready Player One! Walk around, collect items, and interact with other players.',
        features: ['✓ Works on any device', '✓ No downloads needed', '✓ Save your progress'],
        primaryAction: { text: '🚀 Start Exploring', href: '#start' },
        color: 'rgba(131, 56, 236, 0.95)' // Purple
    },
    'oasis-complete-game.html': {
        icon: '🎮',
        title: 'OASIS Complete Game',
        description: 'The full OASIS experience with mining, trading, and universe exploration. Build your empire in this browser-based virtual world!',
        features: ['✓ Mining & Trading', '✓ Universe Travel', '✓ Multiplayer Ready'],
        primaryAction: { text: '🚀 Play Now', href: '#game' },
        color: 'rgba(138, 43, 226, 0.95)' // BlueViolet
    },
    'poker.html': {
        icon: '🃏',
        title: 'Online Poker Game',
        description: 'Play poker in your browser! Join tables, place bets, and compete against other players. Simple interface, real poker action.',
        features: ['✓ Real-time multiplayer', '✓ Fair dealing', '✓ Free chips to start'],
        primaryAction: { text: '🎰 Join Table', href: '#table' },
        color: 'rgba(220, 20, 60, 0.95)' // Crimson
    },
    'GemBot_Control_AI.html': {
        icon: '🎓',
        title: 'AI Learning Platform',
        description: 'Learn with Merlin, your personal AI tutor! Get personalized lessons, instant feedback, and earn rewards as you learn programming, science, and more.',
        features: ['✓ AI-powered tutoring', '✓ Interactive lessons', '✓ Track progress'],
        primaryAction: { text: '🚀 Start Learning', href: '#start' },
        color: 'rgba(0, 100, 255, 0.95)' // DodgerBlue
    },
    'gemLords.html': {
        icon: '💎',
        title: 'Gemstone Trading Game',
        description: 'Buy, sell, and trade virtual gemstones! Learn about investment and trading in a fun, risk-free environment.',
        features: ['✓ Virtual trading', '✓ Real market data', '✓ Learn investing'],
        primaryAction: { text: '💎 Start Trading', href: '#market' },
        color: 'rgba(255, 215, 0, 0.95)' // Gold
    },
    'mineralMarket.html': {
        icon: '⛏️',
        title: 'Mineral Trading Platform',
        description: 'Track and trade minerals and gemstones. Real-time prices, market charts, and professional trading tools made simple.',
        features: ['✓ Live price charts', '✓ Market analysis', '✓ Trading history'],
        primaryAction: { text: '📊 View Market', href: '#market' },
        color: 'rgba(70, 130, 180, 0.95)' // SteelBlue
    },
    'government-grants-portal.html': {
        icon: '🏛️',
        title: 'Government Grants Finder',
        description: 'Find government grants and funding for your projects. AI helps you search, match, and apply for available grants.',
        features: ['✓ AI-powered search', '✓ Easy applications', '✓ Track submissions'],
        primaryAction: { text: '🔍 Find Grants', href: '#search' },
        color: 'rgba(34, 139, 34, 0.95)' // ForestGreen
    },
    'microTrader.html': {
        icon: '📈',
        title: 'Trading Practice Platform',
        description: 'Learn trading without risk! Practice with virtual money, analyze markets, and develop your trading strategy.',
        features: ['✓ Virtual money', '✓ Real market data', '✓ Risk-free practice'],
        primaryAction: { text: '📊 Start Trading', href: '#trade' },
        color: 'rgba(0, 128, 128, 0.95)' // Teal
    }
};

// CSS for the intro banner (will be injected into <style> tags)
const introBannerCSS = `
/* Simple Intro Banner Styles */
.simple-intro-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, rgba(0, 100, 255, 0.95), rgba(100, 0, 255, 0.95));
    backdrop-filter: blur(10px);
    padding: 1rem;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    transform: translateY(0);
    transition: transform 0.3s ease;
}
.simple-intro-banner.hidden {
    transform: translateY(-100%);
}
.simple-intro-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}
.simple-intro-icon {
    font-size: 3rem;
    animation: intro-bounce 2s infinite;
}
@keyframes intro-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
.simple-intro-text {
    flex: 1;
    min-width: 300px;
}
.simple-intro-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
}
.simple-intro-description {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 0.5rem 0;
    line-height: 1.5;
}
.simple-intro-features {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
}
.simple-intro-feature {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    color: #ffffff;
}
.simple-intro-actions {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
}
.simple-intro-btn {
    padding: 0.6rem 1.2rem;
    border-radius: 25px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    font-size: 0.9rem;
    display: inline-block;
}
.simple-intro-btn-primary {
    background: #ffffff;
    color: #0040ff;
}
.simple-intro-btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}
.simple-intro-btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.5);
}
.simple-intro-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.3);
}
.simple-intro-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: #ffffff;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.3rem 0.8rem;
    border-radius: 50%;
    transition: all 0.2s ease;
    line-height: 1;
}
.simple-intro-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}
@media (max-width: 768px) {
    .simple-intro-banner { padding: 1rem 0.8rem; }
    .simple-intro-content { gap: 1rem; }
    .simple-intro-icon { font-size: 2rem; }
    .simple-intro-title { font-size: 1.2rem; }
    .simple-intro-description { font-size: 0.9rem; }
    .simple-intro-actions { width: 100%; }
    .simple-intro-btn { flex: 1; text-align: center; }
}
`;

// JavaScript for the intro banner (will be injected before </body>)
const introBannerJS = `
<script>
function closeIntroBanner() {
    const banner = document.getElementById('simpleIntroBanner');
    if (banner) {
        banner.classList.add('hidden');
        localStorage.setItem('introBannerClosed_' + window.location.pathname, 'true');
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('simpleIntroBanner');
    const wasClosed = localStorage.getItem('introBannerClosed_' + window.location.pathname);
    if (wasClosed === 'true' && banner) {
        banner.classList.add('hidden');
    }
});
</script>
`;

function generateBannerHTML(config) {
    const bgColor = config.color || 'rgba(0, 100, 255, 0.95)';
    return `
<!-- Simple "What is This?" Banner -->
<div class="simple-intro-banner" id="simpleIntroBanner" style="background: linear-gradient(135deg, ${bgColor}, rgba(100, 0, 255, 0.95));">
    <div class="simple-intro-content">
        <div class="simple-intro-icon">${config.icon}</div>
        <div class="simple-intro-text">
            <h2 class="simple-intro-title">🤔 ${config.title}</h2>
            <p class="simple-intro-description">${config.description}</p>
            <div class="simple-intro-features">
                ${config.features.map(f => `<span class="simple-intro-feature">${f}</span>`).join('\n                ')}
            </div>
        </div>
        <div class="simple-intro-actions">
            <a href="${config.primaryAction.href}" class="simple-intro-btn simple-intro-btn-primary">
                ${config.primaryAction.text}
            </a>
            <a href="GETTING_STARTED_SIMPLE.md" class="simple-intro-btn simple-intro-btn-secondary">
                📚 Help Guide
            </a>
        </div>
        <button class="simple-intro-close" onclick="closeIntroBanner()" title="Close this banner">×</button>
    </div>
</div>
`;
}

function addIntroBanner(filePath, config) {
    console.log(`\nProcessing: ${filePath}`);
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Check if banner already exists
    if (html.includes('simple-intro-banner')) {
        console.log('  ⚠️  Banner already exists, skipping...');
        return false;
    }
    
    // Add CSS to the end of <style> or create new <style> tag
    if (html.includes('</style>')) {
        html = html.replace('</style>', introBannerCSS + '\n</style>');
    } else if (html.includes('</head>')) {
        html = html.replace('</head>', `<style>${introBannerCSS}</style>\n</head>`);
    }
    
    // Add HTML banner right after <body>
    const bannerHTML = generateBannerHTML(config);
    html = html.replace('<body>', '<body>\n' + bannerHTML);
    
    // Add JavaScript before </body>
    html = html.replace('</body>', introBannerJS + '\n</body>');
    
    // Write back to file
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('  ✓ Banner added successfully!');
    return true;
}

function main() {
    console.log('Adding "What is This?" banners to major project pages...\n');
    
    let count = 0;
    for (const [filename, config] of Object.entries(introBanners)) {
        const filePath = path.join(__dirname, filename);
        
        if (!fs.existsSync(filePath)) {
            console.log(`\n⚠️  File not found: ${filename}`);
            continue;
        }
        
        if (addIntroBanner(filePath, config)) {
            count++;
        }
    }
    
    console.log(`\n\n✅ Done! Added banners to ${count} files.`);
    console.log('\nFiles updated:');
    Object.keys(introBanners).forEach(f => console.log(`  - ${f}`));
}

if (require.main === module) {
    main();
}

module.exports = { addIntroBanner, introBanners };
