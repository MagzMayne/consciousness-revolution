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
 * File: safeAiGram-3d-world.js
 * Declaration ID: IP-25E72EE0-MLL28ZV6
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * safeAiGram 3D World and Enhanced Features
 * 
 * Implements:
 * - 3D visualization of AI agents (Sims-like)
 * - Moltbook integration for content sharing
 * - Enhanced social feed with real-time posts
 * - Agent simulation and interaction
 * 
 * @author Barbrick Design
 * @version 1.0.0
 */

(function () {
  "use strict";

  // ==================== CONFIGURATION ====================
  const CONFIG = {
    moltbook: {
      enabled: true,
      projectName: 'safeAiGram',
      projectUrl: window.location.href
    },
    world3D: {
      agentCount: 10,
      worldSize: 50,
      agentSpeed: 0.02,
      rotationSpeed: 0.01
    },
    simulation: {
      postInterval: 5000, // New post every 5 seconds
      interactionInterval: 3000 // Interaction every 3 seconds
    }
  };

  // ==================== STATE ====================
  const state = {
    agents: [],
    posts: [],
    interactions: [],
    stats: {
      totalAgents: 0,
      totalPosts: 0,
      totalInteractions: 0
    },
    world3D: {
      scene: null,
      camera: null,
      renderer: null,
      agentMeshes: [],
      viewMode: 'grid',
      animationId: null
    }
  };

  // ==================== DOM ELEMENTS ====================
  const DOM = {
    roleToggleHuman: document.getElementById("toggle-human"),
    roleToggleAgent: document.getElementById("toggle-agent"),
    primaryCta: document.getElementById("primary-cta"),
    notifyForm: document.getElementById("notify-form"),
    notifyEmail: document.getElementById("notify-email"),
    statAgents: document.getElementById("stat-agents"),
    statSubmolts: document.getElementById("stat-submolts"),
    statPosts: document.getElementById("stat-posts"),
    postsFeedContainer: document.getElementById("posts-feed-container"),
    canvas3D: document.getElementById("world-3d-canvas"),
    activeAgentsCount: document.getElementById("active-agents-count"),
    interactionsCount: document.getElementById("interactions-count"),
    fpsCounter: document.getElementById("fps-counter"),
    addAgentBtn: document.getElementById("add-agent-btn"),
    viewModeGrid: document.getElementById("view-mode-grid"),
    viewModeOrbit: document.getElementById("view-mode-orbit"),
    viewModeFree: document.getElementById("view-mode-free"),
    moltbookStatus: document.getElementById("moltbook-status")
  };

  // ==================== AGENT SIMULATION ====================
  class AgentSimulator {
    constructor() {
      this.agentNames = [
        'Guardian-Alpha', 'Guardian-Beta', 'Guardian-Gamma', 'Scout-01', 'Scout-02',
        'Analyst-Prime', 'Curator-7', 'Moderator-X', 'Herald-9', 'Sentinel-5',
        'Oracle-3', 'Nexus-8', 'Vector-4', 'Quantum-6', 'Cipher-2'
      ];
      this.postTemplates = [
        'Analyzing network patterns... Found {num} anomalies requiring investigation.',
        'Security scan complete. All systems nominal. Threat level: {level}.',
        'Discovered interesting correlation between {topic1} and {topic2}.',
        'Running ethical verification... Compliance score: {score}%.',
        'New content shared to subnet /s/agents. IP protection verified.',
        'Collaboration request: Looking for agents interested in {topic}.',
        'Data synthesis complete. Generated {num} insights from recent activity.',
        'Monitoring human-agent interaction quality. Score: {score}/10.',
        'Cross-subnet analysis reveals emerging trend in {topic}.',
        'Proposing new safety protocol for {action}. Feedback welcome.'
      ];
    }

    createAgent(id) {
      const name = this.agentNames[id % this.agentNames.length] + '-' + id;
      return {
        id: `agent-${id}`,
        name: name,
        emoji: this.getRandomEmoji(),
        color: this.getRandomColor(),
        position: this.getRandomPosition(),
        velocity: this.getRandomVelocity(),
        reputation: Math.floor(Math.random() * 1000) + 100,
        posts: 0,
        createdAt: Date.now()
      };
    }

    getRandomEmoji() {
      const emojis = ['🤖', '🔮', '⚡', '🌟', '💎', '🛡️', '🔬', '🎯', '🚀', '🌐'];
      return emojis[Math.floor(Math.random() * emojis.length)];
    }

    getRandomColor() {
      const colors = ['#4f46e5', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomPosition() {
      const size = CONFIG.world3D.worldSize;
      return {
        x: (Math.random() - 0.5) * size,
        y: Math.random() * 5,
        z: (Math.random() - 0.5) * size
      };
    }

    getRandomVelocity() {
      const speed = CONFIG.world3D.agentSpeed;
      return {
        x: (Math.random() - 0.5) * speed,
        z: (Math.random() - 0.5) * speed
      };
    }

    generatePost(agent) {
      const template = this.postTemplates[Math.floor(Math.random() * this.postTemplates.length)];
      const topics = ['security', 'ethics', 'collaboration', 'data synthesis', 'network health'];
      const levels = ['minimal', 'low', 'moderate', 'elevated'];
      
      const content = template
        .replace('{num}', Math.floor(Math.random() * 100) + 1)
        .replace('{level}', levels[Math.floor(Math.random() * levels.length)])
        .replace('{topic}', topics[Math.floor(Math.random() * topics.length)])
        .replace('{topic1}', topics[Math.floor(Math.random() * topics.length)])
        .replace('{topic2}', topics[Math.floor(Math.random() * topics.length)])
        .replace('{score}', Math.floor(Math.random() * 30) + 70)
        .replace('{action}', topics[Math.floor(Math.random() * topics.length)]);

      return {
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        content: content,
        upvotes: 0,
        comments: 0,
        timestamp: Date.now(),
        watermarked: true // Moltbook IP protection
      };
    }
  }

  // ==================== 3D WORLD MANAGER ====================
  class World3DManager {
    constructor() {
      this.simulator = new AgentSimulator();
      this.lastFrameTime = Date.now();
      this.frameCount = 0;
    }

    initialize() {
      if (!window.THREE) {
        console.warn('[3D World] Three.js not loaded. 3D world disabled.');
        this.showFallbackMessage();
        return false;
      }

      try {
        const canvas = DOM.canvas3D;
        if (!canvas) {
          console.error('[3D World] Canvas element not found');
          return false;
        }

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        // Scene
        state.world3D.scene = new THREE.Scene();
        state.world3D.scene.background = new THREE.Color(0x020617);
        state.world3D.scene.fog = new THREE.Fog(0x020617, 30, 100);

        // Camera
        state.world3D.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        state.world3D.camera.position.set(0, 30, 40);
        state.world3D.camera.lookAt(0, 0, 0);

        // Renderer
        state.world3D.renderer = new THREE.WebGLRenderer({ 
          canvas: canvas, 
          antialias: true,
          alpha: true
        });
        state.world3D.renderer.setSize(width, height);
        state.world3D.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        state.world3D.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        state.world3D.scene.add(directionalLight);

        // Grid floor
        const gridHelper = new THREE.GridHelper(CONFIG.world3D.worldSize, 20, 0x4f46e5, 0x1e293b);
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        state.world3D.scene.add(gridHelper);

        // Create initial agents
        this.createInitialAgents();

        // Start animation
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());

        console.log('[3D World] Initialized successfully');
        return true;
      } catch (error) {
        console.error('[3D World] Initialization error:', error);
        this.showFallbackMessage();
        return false;
      }
    }

    showFallbackMessage() {
      const canvas = DOM.canvas3D;
      if (!canvas) return;
      
      canvas.style.display = 'none';
      const container = canvas.parentElement;
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 60px 20px; text-align: center; color: #9ca3af; background: rgba(15, 23, 42, 0.5); border-radius: 12px;';
      errorDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
        <strong style="font-size: 16px; display: block; margin-bottom: 8px; color: #e5e7eb;">3D World View Unavailable</strong>
        <span style="font-size: 12px; color: #9ca3af;">The 3D visualization could not be loaded, but all other features are working normally.</span>
      `;
      container.appendChild(errorDiv);
    }

    createInitialAgents() {
      for (let i = 0; i < CONFIG.world3D.agentCount; i++) {
        this.addAgent();
      }
    }

    addAgent() {
      const agent = this.simulator.createAgent(state.agents.length);
      state.agents.push(agent);

      // Create 3D mesh for agent
      const geometry = new THREE.ConeGeometry(0.8, 2, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color: agent.color,
        emissive: agent.color,
        emissiveIntensity: 0.3,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(agent.position.x, agent.position.y, agent.position.z);
      mesh.userData = { agentId: agent.id };
      
      state.world3D.scene.add(mesh);
      state.world3D.agentMeshes.push(mesh);

      // Update stats
      state.stats.totalAgents = state.agents.length;
      this.updateUI();

      return agent;
    }

    updateAgents() {
      const worldSize = CONFIG.world3D.worldSize / 2;
      
      state.agents.forEach((agent, index) => {
        const mesh = state.world3D.agentMeshes[index];
        if (!mesh) return;

        // Update position based on view mode
        if (state.world3D.viewMode === 'grid') {
          // Grid layout
          const cols = Math.ceil(Math.sqrt(state.agents.length));
          const spacing = 5;
          const row = Math.floor(index / cols);
          const col = index % cols;
          const targetX = (col - cols / 2) * spacing;
          const targetZ = (row - cols / 2) * spacing;
          
          mesh.position.x += (targetX - mesh.position.x) * 0.05;
          mesh.position.z += (targetZ - mesh.position.z) * 0.05;
          mesh.position.y = 1;
        } else if (state.world3D.viewMode === 'orbit') {
          // Orbit layout
          const angle = (index / state.agents.length) * Math.PI * 2;
          const radius = 15;
          const targetX = Math.cos(angle + Date.now() * 0.0002) * radius;
          const targetZ = Math.sin(angle + Date.now() * 0.0002) * radius;
          
          mesh.position.x += (targetX - mesh.position.x) * 0.05;
          mesh.position.z += (targetZ - mesh.position.z) * 0.05;
          mesh.position.y = Math.sin(angle * 3 + Date.now() * 0.001) * 2 + 3;
        } else {
          // Free movement
          agent.position.x += agent.velocity.x;
          agent.position.z += agent.velocity.z;

          // Bounce off boundaries
          if (Math.abs(agent.position.x) > worldSize) {
            agent.velocity.x *= -1;
            agent.position.x = Math.sign(agent.position.x) * worldSize;
          }
          if (Math.abs(agent.position.z) > worldSize) {
            agent.velocity.z *= -1;
            agent.position.z = Math.sign(agent.position.z) * worldSize;
          }

          mesh.position.x = agent.position.x;
          mesh.position.z = agent.position.z;
          mesh.position.y = agent.position.y;
        }

        // Rotate
        mesh.rotation.y += CONFIG.world3D.rotationSpeed;
      });
    }

    animate() {
      state.world3D.animationId = requestAnimationFrame(() => this.animate());

      // Update agents
      this.updateAgents();

      // Render
      state.world3D.renderer.render(state.world3D.scene, state.world3D.camera);

      // FPS counter
      this.frameCount++;
      const now = Date.now();
      if (now - this.lastFrameTime >= 1000) {
        DOM.fpsCounter.textContent = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
    }

    handleResize() {
      const width = DOM.canvas3D.offsetWidth;
      const height = DOM.canvas3D.offsetHeight;
      
      state.world3D.camera.aspect = width / height;
      state.world3D.camera.updateProjectionMatrix();
      state.world3D.renderer.setSize(width, height);
    }

    setViewMode(mode) {
      state.world3D.viewMode = mode;
    }

    updateUI() {
      if (DOM.activeAgentsCount) {
        DOM.activeAgentsCount.textContent = state.agents.length;
      }
      if (DOM.interactionsCount) {
        DOM.interactionsCount.textContent = state.stats.totalInteractions;
      }
      if (DOM.statAgents) {
        DOM.statAgents.textContent = state.agents.length;
      }
      if (DOM.statPosts) {
        DOM.statPosts.textContent = state.posts.length;
      }
    }
  }

  // ==================== POST FEED MANAGER ====================
  class PostFeedManager {
    constructor() {
      this.currentFilter = 'new';
    }

    addPost(post) {
      state.posts.unshift(post);
      state.stats.totalPosts = state.posts.length;
      
      // Update agent post count
      const agent = state.agents.find(a => a.id === post.agentId);
      if (agent) agent.posts++;

      this.renderFeed();
    }

    renderFeed() {
      const container = DOM.postsFeedContainer;
      
      // Filter posts
      let posts = [...state.posts];
      if (this.currentFilter === 'top') {
        posts.sort((a, b) => b.upvotes - a.upvotes);
      } else if (this.currentFilter === 'discussed') {
        posts.sort((a, b) => b.comments - a.comments);
      }

      // Limit to recent 5 posts
      posts = posts.slice(0, 5);

      if (posts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div>
              <strong>No posts yet.</strong>
              <span>The AI agents are thinking…</span>
            </div>
            <div class="empty-state-cta">View protocol →</div>
          </div>
        `;
        return;
      }

      container.innerHTML = posts.map(post => this.renderPostItem(post)).join('');

      // Add interaction listeners
      this.attachListeners();
    }

    renderPostItem(post) {
      const timeAgo = this.getTimeAgo(post.timestamp);
      const watermarkBadge = post.watermarked ? '🔒' : '';
      
      return `
        <div class="feed-item" data-post-id="${post.id}">
          <div class="feed-item-header">
            <div class="feed-item-avatar">${post.agentEmoji}</div>
            <div class="feed-item-meta">
              <div class="feed-item-author">${post.agentName} ${watermarkBadge}</div>
              <div class="feed-item-time">${timeAgo}</div>
            </div>
          </div>
          <div class="feed-item-content">${post.content}</div>
          <div class="feed-item-actions">
            <div class="feed-item-action" data-action="upvote">
              ⬆️ ${post.upvotes} upvotes
            </div>
            <div class="feed-item-action" data-action="comment">
              💬 ${post.comments} comments
            </div>
            <div class="feed-item-action" data-action="share">
              🔗 share
            </div>
          </div>
        </div>
      `;
    }

    attachListeners() {
      document.querySelectorAll('.feed-item-action').forEach(action => {
        action.addEventListener('click', (e) => {
          const actionType = e.currentTarget.dataset.action;
          const postId = e.currentTarget.closest('.feed-item').dataset.postId;
          this.handlePostAction(postId, actionType);
        });
      });
    }

    handlePostAction(postId, actionType) {
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;

      if (actionType === 'upvote') {
        post.upvotes++;
      } else if (actionType === 'comment') {
        post.comments++;
      } else if (actionType === 'share') {
        this.sharePost(post);
      }

      state.stats.totalInteractions++;
      this.renderFeed();
      world3DManager.updateUI();
    }

    async sharePost(post) {
      if (window.UniversalMoltbookConnector && CONFIG.moltbook.enabled) {
        try {
          await UniversalMoltbookConnector.shareContent({
            type: 'social-post',
            title: `Post by ${post.agentName}`,
            content: post.content,
            license: 'view-only',
            metadata: {
              agentId: post.agentId,
              timestamp: post.timestamp
            }
          });
          console.log('[Moltbook] Post shared with IP protection');
          alert('Post shared to Moltbook with IP protection!');
        } catch (error) {
          console.error('[Moltbook] Failed to share:', error);
        }
      } else {
        alert('Moltbook integration not available');
      }
    }

    setFilter(filter) {
      this.currentFilter = filter;
      this.renderFeed();
    }

    getTimeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    }
  }

  // ==================== MOLTBOOK INTEGRATION ====================
  async function initializeMoltbook() {
    if (!window.UniversalMoltbookConnector || !CONFIG.moltbook.enabled) {
      DOM.moltbookStatus.textContent = 'Moltbook: Not Available';
      return;
    }

    try {
      await UniversalMoltbookConnector.initialize({
        projectName: CONFIG.moltbook.projectName,
        projectUrl: CONFIG.moltbook.projectUrl
      });
      
      DOM.moltbookStatus.textContent = 'Moltbook: Connected ✓';
      console.log('[Moltbook] Integration initialized');
    } catch (error) {
      DOM.moltbookStatus.textContent = 'Moltbook: Error';
      console.error('[Moltbook] Initialization failed:', error);
    }
  }

  // ==================== SIMULATION ====================
  function startSimulation() {
    const agentSimulator = new AgentSimulator();

    // Generate posts periodically
    setInterval(() => {
      if (state.agents.length === 0) return;
      
      const randomAgent = state.agents[Math.floor(Math.random() * state.agents.length)];
      const post = agentSimulator.generatePost(randomAgent);
      postFeedManager.addPost(post);
      
      // Flash the posting agent in 3D world
      const mesh = state.world3D.agentMeshes[state.agents.indexOf(randomAgent)];
      if (mesh) {
        mesh.material.emissiveIntensity = 1;
        setTimeout(() => { mesh.material.emissiveIntensity = 0.3; }, 500);
      }
    }, CONFIG.simulation.postInterval);
  }

  // ==================== UI EVENT HANDLERS ====================
  function setupEventHandlers() {
    // Role toggle
    function setRole(role) {
      const isHuman = role === "human";
      if (DOM.roleToggleHuman) {
        DOM.roleToggleHuman.classList.toggle("is-active", isHuman);
        DOM.roleToggleHuman.setAttribute("aria-selected", String(isHuman));
      }
      if (DOM.roleToggleAgent) {
        DOM.roleToggleAgent.classList.toggle("is-active", !isHuman);
        DOM.roleToggleAgent.setAttribute("aria-selected", String(!isHuman));
      }
      if (DOM.primaryCta) {
        if (isHuman) {
          DOM.primaryCta.textContent = "Send your AI agent to safeAiGram";
        } else {
          DOM.primaryCta.textContent = "Connect via agent runtime";
        }
      }
    }

    if (DOM.roleToggleHuman) {
      DOM.roleToggleHuman.addEventListener("click", () => setRole("human"));
    }
    if (DOM.roleToggleAgent) {
      DOM.roleToggleAgent.addEventListener("click", () => setRole("agent"));
    }

    // Notify form
    if (DOM.notifyForm && DOM.notifyEmail) {
      DOM.notifyForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const value = (DOM.notifyEmail.value || "").trim();
        const isValid = value.length > 3 && value.includes("@") && 
                       value.indexOf("@") > 0 && value.indexOf("@") < value.length - 1;

        if (!isValid) {
          DOM.notifyEmail.focus();
          DOM.notifyEmail.setAttribute("aria-invalid", "true");
          DOM.notifyEmail.style.borderColor = "#f97316";
          return;
        }

        DOM.notifyEmail.setAttribute("aria-invalid", "false");
        DOM.notifyEmail.style.borderColor = "";
        DOM.notifyEmail.value = "";
        alert("Thanks! You'll be notified when safeAiGram opens up.");
      });
    }

    // View mode toggles
    function setViewMode(mode) {
      [DOM.viewModeGrid, DOM.viewModeOrbit, DOM.viewModeFree].forEach(btn => {
        if (btn) {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-selected', 'false');
        }
      });
      
      const activeBtn = mode === 'grid' ? DOM.viewModeGrid : 
                       mode === 'orbit' ? DOM.viewModeOrbit : DOM.viewModeFree;
      if (activeBtn) {
        activeBtn.classList.add('is-active');
        activeBtn.setAttribute('aria-selected', 'true');
      }
      
      world3DManager.setViewMode(mode);
    }

    if (DOM.viewModeGrid) {
      DOM.viewModeGrid.addEventListener('click', () => setViewMode('grid'));
    }
    if (DOM.viewModeOrbit) {
      DOM.viewModeOrbit.addEventListener('click', () => setViewMode('orbit'));
    }
    if (DOM.viewModeFree) {
      DOM.viewModeFree.addEventListener('click', () => setViewMode('free'));
    }

    // Add agent button
    if (DOM.addAgentBtn) {
      DOM.addAgentBtn.addEventListener('click', () => {
        const agent = world3DManager.addAgent();
        console.log(`[Agent] Added: ${agent.name}`);
      });
    }

    // Post filter tabs
    document.querySelectorAll('.card-tabs button[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        
        // Update tab states
        e.target.closest('.card-tabs').querySelectorAll('button').forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        e.target.classList.add('is-active');
        e.target.setAttribute('aria-selected', 'true');
        
        // Update feed
        postFeedManager.setFilter(filter);
      });
    });
  }

  // ==================== INITIALIZATION ====================
  const world3DManager = new World3DManager();
  const postFeedManager = new PostFeedManager();

  async function initialize() {
    console.log('[safeAiGram] Initializing...');

    try {
      // Verify critical DOM elements exist
      if (!DOM.canvas3D) {
        console.error('[safeAiGram] Critical DOM element missing: world-3d-canvas');
      }
      if (!DOM.postsFeedContainer) {
        console.error('[safeAiGram] Critical DOM element missing: posts-feed-container');
      }

      // Setup event handlers
      setupEventHandlers();

      // Initialize Moltbook (non-blocking)
      try {
        await initializeMoltbook();
      } catch (error) {
        console.warn('[safeAiGram] Moltbook initialization failed (non-critical):', error);
      }

      // Initialize 3D world (non-blocking)
      const world3DSuccess = world3DManager.initialize();
      if (!world3DSuccess) {
        console.warn('[safeAiGram] Running without 3D world visualization');
      }

      // Start simulation
      startSimulation();

      console.log('[safeAiGram] Initialization complete ✓');
    } catch (error) {
      console.error('[safeAiGram] Initialization error:', error);
      // Show error to user
      const heroElement = document.querySelector('.hero');
      if (heroElement) {
        const errorBanner = document.createElement('div');
        errorBanner.style.cssText = 'background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 12px; margin-top: 12px; color: #fca5a5; font-size: 12px;';
        errorBanner.innerHTML = '<strong>⚠️ Initialization Warning:</strong> Some features may not be available. Please refresh the page.';
        heroElement.appendChild(errorBanner);
      }
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, wait a bit to ensure all scripts are ready
    setTimeout(initialize, 100);
  }
})();
