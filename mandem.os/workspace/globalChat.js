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
 * File: globalChat.js
 * Declaration ID: IP-26DCF184-MLL28ZVE
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

/** SIGNED BY MeRLynn - ID: MERLYNN-298a64da - TIMESTAMP: 2025-12-19T05:53:06.518Z - HASH: 48fd8728 */
/** SIGNED BY AGentR - ID: AGENTR-009ef767 - TIMESTAMP: 2025-12-19T05:53:06.518Z - HASH: 48fd8728 */

// ...existing code...
// Remove or guard any use of 'process' in frontend code
if (typeof process !== 'undefined') {
  // ...existing code that uses process...
}
// Dynamically determine backend API base URL
const API_BASE_URL =
  window.location.origin.includes('localhost') || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000' // Local dev
    : window.location.origin; // Production (same host as frontend)
// Use getApiBaseUrl() for all fetch calls
// Example:
// fetch(`${getApiBaseUrl()}/api/chat/log`, ...)
if (typeof process !== 'undefined') {
  // ...existing code that uses process...
}
// Use getApiBaseUrl() for all fetch calls
// Example:
// fetch(`${getApiBaseUrl()}/api/chat/log`, ...)
// ...existing code...