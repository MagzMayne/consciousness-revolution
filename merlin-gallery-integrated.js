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
 * File: merlin-gallery-integrated.js
 * Declaration ID: IP-55F541B3-MLL28ZVI
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MERLIN GALLERY - GAME INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 * Integrates project gallery into main game UI with full investment mechanics
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function(){
  /* -------------------- Config -------------------- */
  const OWNER = 'barbrickdesign';
  const REPO  = 'barbrickdesign.github.io';
  const API_TREE = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/HEAD?recursive=1`;
  const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/HEAD`;
  const LIVE_BASE = `https://${OWNER}.github.io`;
  const SNAP_KEY  = 'merlin_repo_snapshot_v5';
  const GOVERNANCE_TOKEN_MINT = 'DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump';

  /* -------------------- Styles -------------------- */
  const css = `
    .merlin-gallery-toggle {
      position:fixed; bottom:80px; right:20px; z-index:9001;
      background:linear-gradient(135deg,#7b2cbf,#5a189a); border:2px solid #c77dff;
      color:#fff; padding:14px 20px; border-radius:12px; cursor:pointer;
      font-weight:800; font-size:14px; letter-spacing:0.5px;
      box-shadow:0 8px 32px rgba(123,44,191,0.4), 0 0 20px rgba(199,125,255,0.3);
      transition:all 0.3s ease; animation:pulse 2s ease-in-out infinite;
    }
    .merlin-gallery-toggle:hover {
      transform:translateY(-3px) scale(1.05);
      box-shadow:0 12px 48px rgba(123,44,191,0.6), 0 0 30px rgba(199,125,255,0.5);
    }
    @keyframes pulse {
      0%, 100% { box-shadow:0 8px 32px rgba(123,44,191,0.4), 0 0 20px rgba(199,125,255,0.3); }
      50% { box-shadow:0 8px 32px rgba(123,44,191,0.6), 0 0 30px rgba(199,125,255,0.5); }
    }
    .merlin-gallery-panel {
      position:fixed; top:50px; left:50%; transform:translateX(-50%) scale(0);
      width:min(1400px,96vw); height:min(90vh,900px);
      background:#0a0a0f; border:2px solid #c77dff; border-radius:20px;
      box-shadow:0 32px 90px rgba(0,0,0,0.8), 0 0 40px rgba(199,125,255,0.2);
      display:none; z-index:10001; opacity:0;
      transition:all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .merlin-gallery-panel.open {
      display:block; opacity:1; transform:translateX(-50%) scale(1);
    }
    .gallery-header {
      background:linear-gradient(135deg,#7b2cbf,#5a189a);
      padding:20px; border-radius:18px 18px 0 0; border-bottom:2px solid #c77dff;
      display:flex; justify-content:space-between; align-items:center;
    }
    .gallery-title { font-size:24px; font-weight:900; color:#fff; text-shadow:0 0 20px rgba(199,125,255,0.6); }
    .gallery-subtitle { font-size:13px; color:#e0aaff; margin-top:4px; }
    .gallery-controls { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
    .gallery-btn {
      background:#240046; border:1px solid #7b2cbf; color:#fff; padding:10px 16px;
      border-radius:8px; cursor:pointer; font-weight:700; font-size:13px;
      transition:all 0.2s ease;
    }
    .gallery-btn:hover { background:#3c096c; border-color:#c77dff; }
    .gallery-input {
      background:#10002b; border:1px solid #7b2cbf; color:#fff; padding:10px 14px;
      border-radius:8px; font-size:13px; min-width:200px;
    }
    .gallery-input::placeholder { color:#9d4edd; }
    .gallery-body {
      padding:20px; height:calc(100% - 220px); overflow-y:auto;
      background:radial-gradient(ellipse at center, #10002b 0%, #0a0a0f 100%);
    }
    .gallery-grid {
      display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));
      gap:24px; padding:10px;
    }
    .project-card {
      background:linear-gradient(135deg, #240046, #10002b); border:2px solid #7b2cbf;
      border-radius:16px; overflow:hidden; transition:all 0.3s ease;
      box-shadow:0 8px 24px rgba(0,0,0,0.5);
    }
    .project-card:hover {
      transform:translateY(-5px); border-color:#c77dff;
      box-shadow:0 16px 48px rgba(123,44,191,0.4);
    }
    .project-preview {
      width:100%; height:180px; background:#0a0a0f; position:relative;
      border-bottom:2px solid #7b2cbf; overflow:hidden;
    }
    .project-preview iframe {
      width:1200px; height:800px; border:0; transform-origin:0 0;
      transform:scale(0.267); pointer-events:none;
    }
    .project-info { padding:16px; }
    .project-name { font-size:16px; font-weight:800; color:#fff; margin-bottom:6px;
      text-shadow:0 0 10px rgba(199,125,255,0.4); }
    .project-path { font-size:11px; color:#9d4edd; margin-bottom:12px;
      word-break:break-all; }
    .project-stats {
      display:grid; grid-template-columns:1fr 1fr; gap:10px;
      margin-bottom:12px; font-size:12px;
    }
    .stat-box {
      background:#10002b; border:1px solid #5a189a; border-radius:8px; padding:8px;
      text-align:center;
    }
    .stat-label { color:#9d4edd; font-size:10px; text-transform:uppercase; }
    .stat-value { color:#fff; font-weight:800; font-size:16px; margin-top:2px; }
    .progress-bar {
      height:8px; background:#10002b; border:1px solid #5a189a; border-radius:999px;
      overflow:hidden; margin-bottom:12px;
    }
    .progress-fill {
      height:100%; background:linear-gradient(90deg, #7b2cbf, #c77dff);
      transition:width 0.4s ease;
    }
    .invest-row { display:flex; gap:8px; }
    .invest-input {
      flex:1; background:#10002b; border:1px solid #7b2cbf; color:#fff;
      padding:10px; border-radius:8px; font-size:13px;
    }
    .invest-btn {
      background:linear-gradient(135deg,#7b2cbf,#5a189a); border:none; color:#fff;
      padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:800;
      transition:all 0.2s ease;
    }
    .invest-btn:hover { transform:scale(1.05); }
    .invest-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .gallery-footer {
      background:#10002b; padding:16px; border-top:2px solid #7b2cbf;
      display:flex; justify-content:space-between; align-items:center;
      border-radius:0 0 18px 18px;
    }
    .user-portfolio {
      display:flex; gap:20px; font-size:13px; color:#e0aaff;
    }
    .portfolio-stat { display:flex; flex-direction:column; }
    .portfolio-label { font-size:10px; color:#9d4edd; text-transform:uppercase; }
    .portfolio-value { font-size:18px; font-weight:800; color:#fff; }
    .investor-badge {
      padding:6px 14px; background:linear-gradient(135deg,#ffd60a,#ff9500);
      border-radius:999px; font-weight:800; font-size:11px; color:#000;
      text-transform:uppercase; letter-spacing:0.5px;
    }
    .badge-bronze { background:linear-gradient(135deg,#cd7f32,#8b4513); color:#fff; }
    .badge-silver { background:linear-gradient(135deg,#c0c0c0,#808080); color:#000; }
    .badge-gold { background:linear-gradient(135deg,#ffd700,#ffaa00); color:#000; }
    .badge-platinum { background:linear-gradient(135deg,#e5e4e2,#d4d4d4); color:#000; }
    .badge-diamond { background:linear-gradient(135deg,#b9f2ff,#69c6ff); color:#000; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  
  // Wait for document.head to be available
  function appendStyle() {
    if (document.head) {
      document.head.appendChild(styleEl);
    } else {
      setTimeout(appendStyle, 10);
    }
  }
  appendStyle();

  /* -------------------- UI Creation -------------------- */
  let container = null;
  let ui = null;
  
  function createUI() {
    if (container) return; // Already created
    if (!document.body) {
      setTimeout(createUI, 10);
      return;
    }
    
    container = document.createElement('div');
    container.innerHTML = `
    <button class="merlin-gallery-toggle" id="galleryToggle">
      💎 Project Gallery
    </button>
    <div class="merlin-gallery-panel" id="galleryPanel">
      <div class="gallery-header">
        <div>
          <div class="gallery-title">🚀 GemBot Project Investment Gallery</div>
          <div class="gallery-subtitle">Invest GBUV • Earn XP • Get Badges • Vote on Governance</div>
        </div>
        <div class="gallery-controls">
          <input class="gallery-input" id="searchInput" placeholder="Search projects..." />
          <button class="gallery-btn" id="refreshBtn">🔄 Refresh</button>
          <button class="gallery-btn" id="closeGallery">✕ Close</button>
        </div>
      </div>
      <div class="gallery-body">
        <div class="gallery-grid" id="projectGrid">
          <p style="color:#9d4edd; text-align:center; padding:40px;">Loading projects...</p>
        </div>
      </div>
      <div class="gallery-footer">
        <div class="user-portfolio">
          <div class="portfolio-stat">
            <span class="portfolio-label">Total Invested</span>
            <span class="portfolio-value" id="totalInvested">0</span>
          </div>
          <div class="portfolio-stat">
            <span class="portfolio-label">Projects</span>
            <span class="portfolio-value" id="projectCount">0</span>
          </div>
          <div class="portfolio-stat">
            <span class="portfolio-label">Voting Power</span>
            <span class="portfolio-value" id="votingPower">0</span>
          </div>
        </div>
        <div id="investorBadge"></div>
      </div>
    </div>
  `;
    document.body.appendChild(container);

    /* -------------------- Elements -------------------- */
    ui = {
      toggle: container.querySelector('#galleryToggle'),
      panel: container.querySelector('#galleryPanel'),
      grid: container.querySelector('#projectGrid'),
      search: container.querySelector('#searchInput'),
      refresh: container.querySelector('#refreshBtn'),
      close: container.querySelector('#closeGallery'),
      totalInvested: container.querySelector('#totalInvested'),
      projectCount: container.querySelector('#projectCount'),
      votingPower: container.querySelector('#votingPower'),
      badge: container.querySelector('#investorBadge')
    };

    ui.toggle.addEventListener('click', () => ui.panel.classList.toggle('open'));
    ui.close.addEventListener('click', () => ui.panel.classList.remove('open'));
  }
  
  // Ensure createUI runs when DOM is ready
  if (document.body) {
    createUI();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUI);
  } else {
    setTimeout(createUI, 0);
  }

  /* -------------------- Data Loading -------------------- */
  let allProjects = [];
  let filteredProjects = [];

  async function loadProjects() {
    try {
      ui.grid.innerHTML = '<p style="color:#9d4edd; text-align:center; padding:40px;">Fetching projects from GitHub...</p>';
      
      const tree = await fetch(API_TREE).then(r => r.json());
      const htmlFiles = tree.tree.filter(n => n.type==='blob' && n.path.toLowerCase().endsWith('.html'));
      
      allProjects = [];
      for (const file of htmlFiles) {
        if (file.path.startsWith('node_modules')) continue;
        
        const project = {
          path: file.path,
          name: file.path.split('/').pop().replace('.html', ''),
          liveUrl: `${LIVE_BASE}/${file.path}`,
          rawUrl: `${RAW_BASE}/${file.path}`
        };
        
        // Get funding status
        if (window.projectInvestmentSystem) {
          const status = window.projectInvestmentSystem.getProjectStatus(file.path);
          project.invested = status.totalInvested;
          project.investorCount = status.investorCount;
        } else {
          project.invested = 0;
          project.investorCount = 0;
        }
        
        allProjects.push(project);
      }
      
      filteredProjects = allProjects.slice();
      renderProjects();
      updatePortfolio();
      
    } catch (error) {
      console.error('Failed to load projects:', error);
      ui.grid.innerHTML = '<p style="color:#ff6b6b; text-align:center; padding:40px;">Failed to load projects. Click Refresh to try again.</p>';
    }
  }

  /* -------------------- Rendering -------------------- */
  function renderProjects() {
    if (filteredProjects.length === 0) {
      ui.grid.innerHTML = '<p style="color:#9d4edd; text-align:center; padding:40px;">No projects found.</p>';
      return;
    }
    
    ui.grid.innerHTML = filteredProjects.map(p => createProjectCard(p)).join('');
    
    // Attach event listeners
    filteredProjects.forEach(project => {
      const btn = ui.grid.querySelector(`#invest-${project.path.replace(/[^a-z0-9]/gi, '')}`);
      const input = ui.grid.querySelector(`#amount-${project.path.replace(/[^a-z0-9]/gi, '')}`);
      
      if (btn && input) {
        btn.addEventListener('click', () => handleInvestment(project, input));
      }
    });
  }

  function createProjectCard(project) {
    const goal = 10000;
    const pct = Math.min(100, (project.invested / goal) * 100);
    const safeId = project.path.replace(/[^a-z0-9]/gi, '');
    
    return `
      <div class="project-card">
        <div class="project-preview">
          <iframe src="${project.liveUrl}" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
        <div class="project-info">
          <div class="project-name">${project.name}</div>
          <div class="project-path">${project.path}</div>
          <div class="project-stats">
            <div class="stat-box">
              <div class="stat-label">Goal</div>
              <div class="stat-value">${goal.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Funded</div>
              <div class="stat-value">${project.invested.toLocaleString()}</div>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Investors</div>
            <div class="stat-value">${project.investorCount}</div>
          </div>
          <div class="invest-row">
            <input type="number" class="invest-input" id="amount-${safeId}" 
                   placeholder="GBUV amount" min="1" value="100">
            <button class="invest-btn" id="invest-${safeId}">💎 Invest</button>
          </div>
        </div>
      </div>
    `;
  }

  /* -------------------- Investment Logic -------------------- */
  async function handleInvestment(project, input) {
    const amount = parseInt(input.value) || 0;
    
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Get current user
    const session = JSON.parse(sessionStorage.getItem('gembot_session') || '{}');
    if (!session.username) {
      alert('⚠️ Please log in to invest!');
      // Open auth modal if available
      if (window.authSystem && window.authSystem.showAuth) {
        window.authSystem.showAuth();
      }
      return;
    }
    
    // Disable button
    const btn = ui.grid.querySelector(`#invest-${project.path.replace(/[^a-z0-9]/gi, '')}`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Processing...';
    }
    
    try {
      // Execute investment
      const result = await window.projectInvestmentSystem.investInProject(
        project.path,
        amount,
        session.username
      );
      
      // Show success
      if (btn) {
        btn.textContent = `✅ +${result.rewards.xp} XP!`;
      }
      
      // Show detailed rewards
      let rewardMsg = `🎉 Investment successful!\\n\\n`;
      rewardMsg += `Amount: ${amount} GBUV\\n`;
      rewardMsg += `XP Earned: +${result.rewards.xp}\\n`;
      if (result.rewards.bonusGems > 0) {
        rewardMsg += `Bonus Gems: +${result.rewards.bonusGems}\\n`;
      }
      if (result.rewards.badges.length > 0) {
        rewardMsg += `\\nBadge Unlocked: ${result.rewards.badges[0]}\\n`;
      }
      rewardMsg += `\\nNew Balance: ${result.newBalance} GBUV`;
      rewardMsg += `\\nVoting Power: ${result.portfolio.votingPower}`;
      
      alert(rewardMsg);
      
      // Refresh data
      await loadProjects();
      
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.textContent = '💎 Invest';
        }
      }, 2000);
      
    } catch (error) {
      console.error('Investment failed:', error);
      alert(`❌ Investment failed: ${error.message}`);
      
      if (btn) {
        btn.disabled = false;
        btn.textContent = '💎 Invest';
      }
    }
  }

  /* -------------------- Portfolio Display -------------------- */
  function updatePortfolio() {
    const session = JSON.parse(sessionStorage.getItem('gembot_session') || '{}');
    if (!session.username || !window.projectInvestmentSystem) {
      ui.totalInvested.textContent = '0';
      ui.projectCount.textContent = '0';
      ui.votingPower.textContent = '0';
      ui.badge.innerHTML = '';
      return;
    }
    
    const portfolio = window.projectInvestmentSystem.getPortfolio(session.username);
    
    ui.totalInvested.textContent = portfolio.totalInvested.toLocaleString();
    ui.projectCount.textContent = portfolio.projectCount;
    ui.votingPower.textContent = portfolio.votingPower;
    
    if (portfolio.tier !== 'none') {
      const badgeClass = `badge-${portfolio.tier}`;
      ui.badge.innerHTML = `<div class="investor-badge ${badgeClass}">${portfolio.tier.toUpperCase()} INVESTOR</div>`;
    } else {
      ui.badge.innerHTML = '';
    }
  }

  /* -------------------- Search -------------------- */
  ui.search.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    filteredProjects = allProjects.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.path.toLowerCase().includes(query)
    );
    renderProjects();
  });

  ui.refresh.addEventListener('click', loadProjects);

  /* -------------------- Initialize -------------------- */
  // Load when wallet system is ready
  function init() {
    // Ensure UI is created first
    createUI();
    
    if (window.projectInvestmentSystem) {
      loadProjects();
      console.log('💎 Merlin Gallery integrated with game economy');
    } else {
      setTimeout(init, 1000);
    }
  }
  
  // Start after DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external access
  window.merlinGallery = {
    open: () => { createUI(); if (ui?.panel) ui.panel.classList.add('open'); },
    close: () => { if (ui?.panel) ui.panel.classList.remove('open'); },
    refresh: loadProjects,
    updatePortfolio
  };

})();
