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
 * File: smoke.test.js
 * Declaration ID: IP-15F8B15A-MLL28ZVM
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

/** SIGNED BY MeRLynn - ID: MERLYNN-24e99aa9 - TIMESTAMP: 2025-12-19T05:53:06.523Z - HASH: 3ef5fe86 */
/** SIGNED BY AGentR - ID: AGENTR-2d95e624 - TIMESTAMP: 2025-12-19T05:53:06.523Z - HASH: 3ef5fe86 */

const puppeteer = require('puppeteer');

(async ()=>{
  const browser = await puppeteer.launch({ headless: true, args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err=> errors.push({type:'pageerror', message:err.message}));
  page.on('error', err=> errors.push({type:'error', message:err.message}));
  page.on('console', msg=>{
    if(msg.type()==='error') errors.push({type:'console', message:msg.text()});
  });

  const fileUrl = 'file:///' + require('path').resolve(__dirname,'..','link.html').replace(/\\/g,'/');
  console.log('Loading', fileUrl);
  await page.goto(fileUrl, { waitUntil:'networkidle2', timeout: 30000 });

  // Simulation removed: skip simulate-wallet click
  // Try generate QR (may warn but should not throw)
  try{ await page.click('#mkQR'); }catch(e){}
  // Click test all links
  try{ await page.click('#testAll'); }catch(e){}
  // Generate nonce
  try{ await page.click('#genNonce'); }catch(e){}

  // Wait a moment for background tasks
  await page.waitForTimeout(1500);

  if(errors.length){ console.error('Errors captured during smoke test:'); console.error(errors); await browser.close(); process.exit(1); }
  console.log('Smoke test passed: no uncaught errors detected');
  await browser.close(); process.exit(0);
})();
