/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.
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
 * File: rootib-footer.js
 * Declaration ID: IP-5D63BCAA-MLZ0FSU2
 * Date: 2026-02-23
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

// RootIB: RB-20260223092004-A1B2C3D4
/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * rootib-footer.js — Visible, tamper-evident RootIB provenance badge injector
 *
 * Reads the page's unique RootIB from <meta name="rootib"> and renders a
 * persistent, visible badge anchored to the page footer.  The badge is also
 * anchored as a DOM comment directly adjacent to the element, making it
 * detectable both visually and programmatically.
 *
 * Immutability strategy:
 *   1. RootIB is stored in the HTML <meta> tag (embedded in source file)
 *   2. RootIB is stored in the blockchain ledger at /js/rootib-ledger.json
 *   3. This script renders it visibly so readers can verify it at a glance
 *   4. Any page served without the correct RootIB fails ledger verification
 *
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * ════════════════════════════════════════════════════════════════════════════════
 */

;(function () {
  'use strict';

  var BADGE_ID = 'rootib-provenance-badge';
  var FOOTER_ID = 'rootib-footer-stamp';
  var ROOTIB_RE = /RootIB:\s+([A-Za-z0-9_.\-]+-\d{14}-[0-9A-Fa-f]{8})/;

  // ── Read page RootIB ────────────────────────────────────────────────────────

  function getPageRootIB() {
    // Priority 1: <meta name="rootib">
    var meta = document.querySelector('meta[name="rootib"]');
    if (meta && meta.content) {
      var m = meta.content.match(ROOTIB_RE);
      if (m) return 'RootIB: ' + m[1];
    }

    // Priority 2: scan HTML comment nodes in <head>
    try {
      var walker = document.createTreeWalker(
        document.documentElement,
        NodeFilter.SHOW_COMMENT,
        null,
        false
      );
      var node;
      while ((node = walker.nextNode())) {
        var m2 = node.nodeValue.match(ROOTIB_RE);
        if (m2) return 'RootIB: ' + m2[1];
      }
    } catch (e) { /* ignore */ }

    return null;
  }

  // ── Styles ──────────────────────────────────────────────────────────────────

  var BADGE_CSS = [
    'position:fixed',
    'bottom:10px',
    'right:14px',
    'z-index:2147483647',
    'font-family:"JetBrains Mono","SF Mono","Fira Code",ui-monospace,monospace',
    'font-size:0.68rem',
    'line-height:1.4',
    'color:#6df2ff',
    'background:rgba(5,0,22,0.93)',
    'border:1px solid rgba(109,242,255,0.45)',
    'border-radius:6px',
    'padding:5px 11px',
    'cursor:pointer',
    'user-select:all',
    '-webkit-user-select:all',
    'letter-spacing:0.05em',
    'box-shadow:0 2px 12px rgba(0,255,255,0.15)',
    'transition:color 0.2s,background 0.2s',
    'white-space:nowrap',
    'max-width:420px',
    'overflow:hidden',
    'text-overflow:ellipsis',
  ].join(';');

  var FOOTER_STAMP_CSS = [
    'display:block',
    'text-align:center',
    'font-family:"JetBrains Mono","SF Mono","Fira Code",ui-monospace,monospace',
    'font-size:0.72rem',
    'color:#6df2ff',
    'background:rgba(5,0,22,0.85)',
    'border-top:1px solid rgba(109,242,255,0.3)',
    'padding:8px 12px',
    'letter-spacing:0.04em',
    'user-select:all',
    '-webkit-user-select:all',
    'margin-top:auto',
  ].join(';');

  // ── Donation constants ───────────────────────────────────────────────────────
  // (referenced in injectFooterStamp and injectDonationButton below)

  var DONATION_BTN_ID = 'barbrick-donation-btn';
  var DONATION_EMAIL = 'BarbrickDesign@gmail.com';
  var DONATION_PAYPAL_URL = 'https://www.paypal.com/paypalme/barbrickdesign';
  // Max z-index ensures the button floats above any existing page overlay.
  // This matches the value used for BADGE_CSS in this same file.
  var DONATION_BTN_CSS = [
    'position:fixed',
    'bottom:10px',
    'left:14px',
    'z-index:2147483647',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    'font-size:0.75rem',
    'font-weight:600',
    'line-height:1',
    'color:#ffffff',
    'background:linear-gradient(135deg,#003087 0%,#009cde 100%)',
    'border:none',
    'border-radius:20px',
    'padding:8px 14px',
    'cursor:pointer',
    'text-decoration:none',
    'display:inline-flex',
    'align-items:center',
    'gap:5px',
    'box-shadow:0 2px 8px rgba(0,0,0,0.3)',
    'transition:opacity 0.2s,transform 0.2s',
    'white-space:nowrap',
    'user-select:none',
  ].join(';');

  // ── Inject fixed badge ───────────────────────────────────────────────────────

  function injectBadge(rootibLine) {
    if (document.getElementById(BADGE_ID)) return;

    // Insert adjacent DOM comment for programmatic detection
    var comment = document.createComment(' ' + rootibLine + ' ');
    document.body.appendChild(comment);

    var badge = document.createElement('div');
    badge.id = BADGE_ID;
    badge.setAttribute('data-rootib', rootibLine);
    badge.setAttribute('aria-label', 'RootIB provenance identifier: ' + rootibLine);
    badge.setAttribute('role', 'complementary');
    badge.setAttribute('style', BADGE_CSS);
    badge.title = '🔐 RootIB provenance — click to copy · verify at /RootIB.html';
    badge.textContent = '🔐 ' + rootibLine;

    badge.addEventListener('click', function () {
      var text = rootibLine;
      var original = badge.textContent;
      try {
        navigator.clipboard.writeText(text).then(function () {
          flash(badge, '✓ Copied!', original);
        }).catch(function () { fallbackCopy(badge, text, original); });
      } catch (e) {
        fallbackCopy(badge, text, original);
      }
    });

    document.body.appendChild(badge);
  }

  // ── Inject footer stamp (inside existing <footer> if present) ───────────────

  function injectFooterStamp(rootibLine) {
    if (document.getElementById(FOOTER_ID)) return;

    var stamp = document.createElement('div');
    stamp.id = FOOTER_ID;
    stamp.setAttribute('data-rootib', rootibLine);
    stamp.setAttribute('style', FOOTER_STAMP_CSS);
    stamp.innerHTML =
      '🔐 <strong>RootIB Provenance</strong> &nbsp;|&nbsp; ' +
      '<span style="user-select:all">' + escapeHtml(rootibLine) + '</span>' +
      ' &nbsp;|&nbsp; <a href="/RootIB.html" style="color:#6df2ff;text-decoration:underline" target="_blank">Verify</a>' +
      ' &nbsp;|&nbsp; <a href="' + DONATION_PAYPAL_URL + '" style="color:#ffde00;text-decoration:underline;font-weight:bold" target="_blank" rel="noopener noreferrer" aria-label="Donate via PayPal">💛 Donate via PayPal</a>';

    // Try to append inside existing footer first
    var footer = document.querySelector('footer');
    if (footer) {
      footer.appendChild(stamp);
    } else {
      document.body.appendChild(stamp);
    }
  }

  // ── Donation Button ──────────────────────────────────────────────────────────

  function injectDonationButton() {
    if (document.getElementById(DONATION_BTN_ID)) return;
    var btn = document.createElement('a');
    btn.id = DONATION_BTN_ID;
    btn.href = DONATION_PAYPAL_URL;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('style', DONATION_BTN_CSS);
    btn.setAttribute('aria-label', 'Donate via PayPal to ' + DONATION_EMAIL);
    btn.title = 'Support Barbrick Design — donate via PayPal (' + DONATION_EMAIL + ')';
    btn.innerHTML = '&#x1F49B; Donate via PayPal';
    btn.addEventListener('mouseover', function () {
      btn.style.opacity = '0.85';
      btn.style.transform = 'scale(1.04)';
    });
    btn.addEventListener('mouseout', function () {
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
    });
    document.body.appendChild(btn);
  }

  // ── Mobile responsive styles ─────────────────────────────────────────────────

  function injectMobileStyles() {
    if (document.getElementById('rootib-mobile-styles')) return;
    var style = document.createElement('style');
    style.id = 'rootib-mobile-styles';
    // On mobile the badge is lifted above the donation button.
    // Donation button height: ~34px (6px*2 padding + ~0.7rem font).
    // 54px = 34px button height + 10px baseline + 10px gap.
    style.textContent = [
      '@media (max-width: 600px) {',
      '  #' + BADGE_ID + ' {',
      '    bottom: 54px !important;',
      '    right: 14px !important;',
      '    font-size: 0.6rem !important;',
      '  }',
      '  #' + DONATION_BTN_ID + ' {',
      '    bottom: 10px !important;',
      '    left: 14px !important;',
      '    font-size: 0.7rem !important;',
      '    padding: 6px 10px !important;',
      '  }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function flash(el, msg, original) {
    el.textContent = msg;
    el.style.color = '#00ff88';
    setTimeout(function () {
      el.textContent = original;
      el.style.color = '#6df2ff';
    }, 1600);
  }

  function fallbackCopy(badge, text, original) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      flash(badge, '✓ Copied!', '🔐 ' + text);
    } catch (e) { /* ignore */ }
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    var rootib = getPageRootIB();
    if (!rootib) return; // no RootIB stamped on this page yet

    injectFooterStamp(rootib);

    // Console audit trail
    console.info('%c🔐 RootIB%c ' + rootib + ' %c| verify: /RootIB.html',
      'color:#6df2ff;font-weight:bold',
      'color:#e0f0ff',
      'color:#808080'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
