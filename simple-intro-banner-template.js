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
 * File: simple-intro-banner-template.js
 * Declaration ID: IP-68353128-MLL28ZVW
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Simple "What is This?" Banner Component
 * Add this snippet to any HTML page to explain what it does in simple terms
 * 
 * Usage:
 * 1. Copy the HTML below
 * 2. Paste it right after the <body> tag or at the top of your content
 * 3. Customize the title, description, and features
 * 4. Optional: Add the CSS to your <head> section
 */

/* ========== CSS (Add to <head> or existing <style> tag) ========== */
/*
<style>
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
    animation: bounce 2s infinite;
}

@keyframes bounce {
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

/* Mobile Responsive */
@media (max-width: 768px) {
    .simple-intro-banner {
        padding: 1rem 0.8rem;
    }
    
    .simple-intro-content {
        gap: 1rem;
    }
    
    .simple-intro-icon {
        font-size: 2rem;
    }
    
    .simple-intro-title {
        font-size: 1.2rem;
    }
    
    .simple-intro-description {
        font-size: 0.9rem;
    }
    
    .simple-intro-actions {
        width: 100%;
    }
    
    .simple-intro-btn {
        flex: 1;
        text-align: center;
    }
}
</style>
*/

/* ========== HTML (Add after <body> tag) ========== */
/*

<!-- Simple "What is This?" Banner -->
<div class="simple-intro-banner" id="simpleIntroBanner">
    <div class="simple-intro-content">
        <div class="simple-intro-icon">🎮</div>
        
        <div class="simple-intro-text">
            <h2 class="simple-intro-title">🤔 What is This Page?</h2>
            <p class="simple-intro-description">
                A simple description in plain English explaining what this page does and who it's for.
                Keep it under 2 sentences!
            </p>
            <div class="simple-intro-features">
                <span class="simple-intro-feature">✓ Key Feature 1</span>
                <span class="simple-intro-feature">✓ Key Feature 2</span>
                <span class="simple-intro-feature">✓ Key Feature 3</span>
            </div>
        </div>
        
        <div class="simple-intro-actions">
            <a href="#" class="simple-intro-btn simple-intro-btn-primary">
                🚀 Get Started
            </a>
            <a href="GETTING_STARTED_SIMPLE.md" class="simple-intro-btn simple-intro-btn-secondary">
                📚 Help Guide
            </a>
        </div>
        
        <button class="simple-intro-close" onclick="closeIntroBanner()" title="Close this banner">
            ×
        </button>
    </div>
</div>

<script>
// Close banner and remember preference
function closeIntroBanner() {
    const banner = document.getElementById('simpleIntroBanner');
    if (banner) {
        banner.classList.add('hidden');
        // Remember user closed it (stored in browser)
        localStorage.setItem('introBannerClosed_' + window.location.pathname, 'true');
    }
}

// Check if user previously closed the banner
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('simpleIntroBanner');
    const wasClosed = localStorage.getItem('introBannerClosed_' + window.location.pathname);
    
    if (wasClosed === 'true' && banner) {
        banner.classList.add('hidden');
    }
});

// Optional: Show banner again after 30 days
setTimeout(function() {
    localStorage.removeItem('introBannerClosed_' + window.location.pathname);
}, 30 * 24 * 60 * 60 * 1000); // 30 days
</script>

*/


/* ========== CUSTOMIZATION EXAMPLES ========== */

// Example 1: For a game page
/*
<div class="simple-intro-icon">🎮</div>
<h2 class="simple-intro-title">🎮 Fun Browser Game!</h2>
<p class="simple-intro-description">
    Play this game directly in your browser - no downloads needed! 
    Works on phone, tablet, and computer.
</p>
<div class="simple-intro-features">
    <span class="simple-intro-feature">✓ No login required</span>
    <span class="simple-intro-feature">✓ Save progress automatically</span>
    <span class="simple-intro-feature">✓ Works offline</span>
</div>
*/

// Example 2: For a tool/utility
/*
<div class="simple-intro-icon">🛠️</div>
<h2 class="simple-intro-title">🛠️ Helpful Tool</h2>
<p class="simple-intro-description">
    This tool helps you [do specific task] quickly and easily. 
    Free to use, works right in your browser!
</p>
<div class="simple-intro-features">
    <span class="simple-intro-feature">✓ Free forever</span>
    <span class="simple-intro-feature">✓ No account needed</span>
    <span class="simple-intro-feature">✓ Privacy-focused</span>
</div>
*/

// Example 3: For a learning app
/*
<div class="simple-intro-icon">🎓</div>
<h2 class="simple-intro-title">🎓 Learning Made Simple</h2>
<p class="simple-intro-description">
    Learn [subject] with an AI tutor that adapts to your pace. 
    Interactive lessons, quizzes, and instant feedback!
</p>
<div class="simple-intro-features">
    <span class="simple-intro-feature">✓ Personalized lessons</span>
    <span class="simple-intro-feature">✓ Track your progress</span>
    <span class="simple-intro-feature">✓ Earn rewards</span>
</div>
*/

// Example 4: For a crypto/blockchain app
/*
<div class="simple-intro-icon">💰</div>
<h2 class="simple-intro-title">💰 Manage Your Crypto</h2>
<p class="simple-intro-description">
    Easily manage your digital currencies and tokens. 
    Secure, simple interface - no complicated jargon!
</p>
<div class="simple-intro-features">
    <span class="simple-intro-feature">✓ Connect your wallet</span>
    <span class="simple-intro-feature">✓ See all balances</span>
    <span class="simple-intro-feature">✓ Simple explanations</span>
</div>
*/
