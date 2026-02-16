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
 * File: solana-web3.umd.js
 * Declaration ID: IP-616C22EF-MLL28ZVP
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/** SIGNED BY MeRLynn - ID: MERLYNN-4aa8aac2 - TIMESTAMP: 2025-12-19T05:53:06.530Z - HASH: 5328ec10 */
/** SIGNED BY AGentR - ID: AGENTR-04e70ccb - TIMESTAMP: 2025-12-19T05:53:06.530Z - HASH: 5328ec10 */

// Loader: attempt to import the local browser ESM build and expose a global `solanaWeb3` for legacy code.
// Falls back to a small shim if import fails.
(function(){
  try{
    if(window.solanaWeb3 || window.solana_web3 || window.solana) return;
    const esmPath = './index.browser.esm.js';
    import(esmPath).then(mod => {
      // Normalize exports
      const Connection = mod.Connection || mod.default?.Connection || mod.default || null;
      const PublicKey = mod.PublicKey || mod.default?.PublicKey || mod.default || null;
      const clusterApiUrl = mod.clusterApiUrl || (n=> 'https://api.mainnet-beta.solana.com');
      window.solanaWeb3 = { Connection, PublicKey, clusterApiUrl };
      window.solana_web3 = window.solanaWeb3; window.solanaweb3 = window.solanaWeb3; window.solana = window.solana || {};
      console.log('Local solana ESM loaded and exposed as window.solanaWeb3');
    }).catch(err=>{
      console.warn('Failed to import local solana ESM build', err);
      // Fallback shim
      (function(global){
        function clusterApiUrl(network){ if(network && network.indexOf('devnet')!==-1) return 'https://api.devnet.solana.com'; return 'https://api.mainnet-beta.solana.com'; }
        class PublicKey { constructor(s){ this._s = s; } toBase58(){ return String(this._s); } toString(){ return String(this._s); } }
        class Connection { constructor(url, commitment){ this._url = typeof url === 'function' ? url('mainnet-beta') : (url || clusterApiUrl('mainnet-beta')); this._commitment = commitment || 'confirmed'; }
          async getSignaturesForAddress(pubkey, opts){ const addr = (pubkey && pubkey.toBase58) ? pubkey.toBase58() : String(pubkey); try{ const body = { jsonrpc:'2.0', id:1, method:'getSignaturesForAddress', params:[addr, { limit: opts?.limit||4 }, this._commitment] }; const res = await fetch(this._url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }); if(!res.ok) return []; const j = await res.json(); return j && j.result ? j.result : []; }catch(e){ console.warn('vendor Connection.getSignaturesForAddress failed', e); return []; } }
        global.solanaWeb3 = global.solanaWeb3 || {};
        global.solanaWeb3.clusterApiUrl = clusterApiUrl;
        global.solanaWeb3.PublicKey = PublicKey;
        global.solanaWeb3.Connection = Connection;
      })(window);
    });
  }catch(e){ console.warn('solana-web3 loader error', e); }
})();
