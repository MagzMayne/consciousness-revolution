// RootIB: RB-20260319142113-B2328BE7
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
 * File: game-mechanics.js
 * Declaration ID: IP-3E477FDD-MLL28ZV3
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * Rdata: The Freedom Quest - Game Mechanics System
 * This file implements the never-ending world peace game mechanics
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

(function() {
  'use strict';

  // ============================================
  // GAME STATE MANAGEMENT
  // ============================================

  const STORAGE_KEYS = {
    PLAYER_ID: 'freedomQuest_playerId',
    PLAYER_DATA: 'freedomQuest_playerData',
    MISSIONS: 'freedomQuest_missions',
    PEACE_PROGRESS: 'freedomQuest_peaceProgress',
    GLOBAL_STATS: 'freedomQuest_globalStats'
  };

  const WORLD_POPULATION = 8100000000; // Updated 2026 estimate

  // Mission types with different objectives
  const MISSION_TYPES = {
    AWARENESS: {
      icon: '🌍',
      name: 'Global Awareness',
      description: 'Learn about world events and challenges',
      basePoints: 10,
      color: '#4CAF50'
    },
    COOPERATION: {
      icon: '🤝',
      name: 'Cooperation',
      description: 'Connect and collaborate with other agents',
      basePoints: 20,
      color: '#2196F3'
    },
    SCAVENGER: {
      icon: '📍',
      name: 'Scavenger Hunt',
      description: 'Complete real-world location challenges',
      basePoints: 30,
      color: '#FF9800'
    },
    HUMANITARIAN: {
      icon: '❤️',
      name: 'Humanitarian',
      description: 'Help your local community',
      basePoints: 40,
      color: '#E91E63'
    },
    PEACE: {
      icon: '🕊️',
      name: 'Peace Initiative',
      description: 'Spread kindness and understanding',
      basePoints: 50,
      color: '#9C27B0'
    }
  };

  // Agent roles players can have
  const AGENT_ROLES = [
    'Peacekeeper',
    'Diplomat',
    'Humanitarian',
    'Educator',
    'Environmentalist',
    'Community Builder',
    'Global Citizen'
  ];

  // Game state object
  let gameState = {
    player: null,
    activeMissions: [],
    completedMissions: 0,
    peacePoints: 0,
    globalPlayers: 0,
    peaceProgress: 0
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  function initGameMechanics() {
    loadGameState();
    initializeUI();
    startGameLoop();
    updateGlobalStats();
    
    console.log('🎮 Game mechanics initialized');
  }

  function loadGameState() {
    try {
      // Load player data
      const savedPlayerData = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
      if (savedPlayerData) {
        gameState.player = JSON.parse(savedPlayerData);
      }

      // Load missions
      const savedMissions = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      if (savedMissions) {
        gameState.activeMissions = JSON.parse(savedMissions);
      }

      // Load global stats
      const savedStats = localStorage.getItem(STORAGE_KEYS.GLOBAL_STATS);
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        gameState.globalPlayers = stats.players || 0;
        gameState.peaceProgress = stats.progress || 0;
      }

      // If player exists, load their data
      if (gameState.player) {
        gameState.completedMissions = gameState.player.missionsCompleted || 0;
        gameState.peacePoints = gameState.player.peacePoints || 0;
      }
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
  }

  function saveGameState() {
    try {
      if (gameState.player) {
        localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(gameState.player));
      }
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(gameState.activeMissions));
      localStorage.setItem(STORAGE_KEYS.GLOBAL_STATS, JSON.stringify({
        players: gameState.globalPlayers,
        progress: gameState.peaceProgress,
        lastUpdate: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  }

  // ============================================
  // UI INITIALIZATION
  // ============================================

  function initializeUI() {
    // Register player button
    const registerBtn = document.getElementById('register-player');
    if (registerBtn) {
      registerBtn.addEventListener('click', handlePlayerRegistration);
    }

    // Get new mission button
    const newMissionBtn = document.getElementById('get-new-mission');
    if (newMissionBtn) {
      newMissionBtn.addEventListener('click', generateNewMission);
    }

    // Panel toggles
    initPanelToggles();

    // Update UI with current state
    updateUI();
  }

  function initPanelToggles() {
    const toggles = [
      { id: 'mission-toggle', panelId: 'mission-control' },
      { id: 'profile-toggle', panelId: 'player-profile' }
    ];

    toggles.forEach(({ id, panelId }) => {
      const toggle = document.getElementById(id);
      const panel = document.getElementById(panelId);
      
      if (toggle && panel) {
        toggle.addEventListener('click', () => {
          const isMinimized = panel.classList.toggle('minimized');
          toggle.textContent = isMinimized ? '+' : '−';
        });
      }
    });
  }

  // ============================================
  // PLAYER REGISTRATION
  // ============================================

  function handlePlayerRegistration() {
    if (gameState.player) {
      showGameNotification('You are already registered as a peace agent!', 'info');
      return;
    }

    const playerId = generatePlayerId();
    const role = AGENT_ROLES[Math.floor(Math.random() * AGENT_ROLES.length)];

    gameState.player = {
      id: playerId,
      role: role,
      joinedAt: Date.now(),
      missionsCompleted: 0,
      peacePoints: 0,
      location: null
    };

    // Increment global player count
    gameState.globalPlayers += 1;

    saveGameState();
    updateUI();

    // Generate first mission
    generateNewMission();

    showGameNotification(`Welcome, Peace Agent ${playerId}! Your role: ${role}`, 'success', 5000);
    
    // Try to get player location
    requestPlayerLocation();
  }

  function generatePlayerId() {
    const prefix = 'PA'; // Peace Agent
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  function requestPlayerLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (gameState.player) {
            gameState.player.location = {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            };
            saveGameState();
            showGameNotification('Location saved! You\'re now visible on the global map', 'success');
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          showGameNotification('Location access denied. You can still play!', 'info');
        }
      );
    }
  }

  // ============================================
  // MISSION SYSTEM
  // ============================================

  function generateNewMission() {
    if (gameState.activeMissions.length >= 5) {
      showGameNotification('Complete some missions first! (Max 5 active)', 'warning');
      return;
    }

    const missionType = getRandomMissionType();
    const mission = createMission(missionType);
    
    gameState.activeMissions.push(mission);
    saveGameState();
    updateMissionList();

    showGameNotification(`New mission: ${mission.title}`, 'info', 4000);
  }

  function getRandomMissionType() {
    const types = Object.keys(MISSION_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  function createMission(type) {
    const missionType = MISSION_TYPES[type];
    const missions = getMissionTemplates(type);
    const template = missions[Math.floor(Math.random() * missions.length)];

    return {
      id: generateMissionId(),
      type: type,
      icon: missionType.icon,
      title: template.title,
      description: template.description,
      objective: template.objective,
      points: missionType.basePoints + Math.floor(Math.random() * 20),
      createdAt: Date.now(),
      completed: false,
      verified: false
    };
  }

  function generateMissionId() {
    return `M-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  function getMissionTemplates(type) {
    const templates = {
      AWARENESS: [
        {
          title: 'Study Natural Disasters',
          description: 'Use NASA EONET to explore current natural disasters',
          objective: 'Click the EONET button and view 3 disaster events'
        },
        {
          title: 'Explore Global Events',
          description: 'Learn about major events happening around the world',
          objective: 'Click 5 different locations on the globe and read their data'
        },
        {
          title: 'Astronomy Awareness',
          description: 'Discover the beauty of space',
          objective: 'View today\'s Astronomy Picture of the Day (APOD)'
        },
        {
          title: 'Climate Understanding',
          description: 'Learn about climate zones and patterns',
          objective: 'Sample colors from 3 different climate zones on the globe'
        }
      ],
      COOPERATION: [
        {
          title: 'Share Knowledge',
          description: 'Help spread awareness about global cooperation',
          objective: 'Share this platform with 2 friends or on social media'
        },
        {
          title: 'Connect Continents',
          description: 'Bridge gaps between different regions',
          objective: 'Place markers on 3 different continents'
        },
        {
          title: 'Global Citizen',
          description: 'Think globally, act locally',
          objective: 'Learn about international cooperation zones'
        }
      ],
      SCAVENGER: [
        {
          title: 'Find Peace Monument',
          description: 'Locate a peace monument or memorial in your area',
          objective: 'Visit a peace-related landmark and take a photo (verification required)'
        },
        {
          title: 'Community Center Visit',
          description: 'Discover local community gathering places',
          objective: 'Visit a community center, library, or cultural center'
        },
        {
          title: 'Natural Wonder',
          description: 'Find and appreciate natural beauty nearby',
          objective: 'Visit a park, garden, or natural area in your community'
        },
        {
          title: 'Historical Site',
          description: 'Learn about local history and culture',
          objective: 'Visit a historical site or museum in your area'
        }
      ],
      HUMANITARIAN: [
        {
          title: 'Help a Neighbor',
          description: 'Perform an act of kindness in your community',
          objective: 'Help someone with groceries, yard work, or a small task'
        },
        {
          title: 'Environmental Care',
          description: 'Take care of your local environment',
          objective: 'Pick up litter in a public space or plant a tree'
        },
        {
          title: 'Food Donation',
          description: 'Support those in need',
          objective: 'Donate food to a food bank or share a meal'
        },
        {
          title: 'Volunteer Time',
          description: 'Give your time to help others',
          objective: 'Volunteer at a local organization for at least 1 hour'
        }
      ],
      PEACE: [
        {
          title: 'Random Act of Kindness',
          description: 'Brighten someone\'s day',
          objective: 'Perform a random act of kindness and note the positive impact'
        },
        {
          title: 'Conflict Resolution',
          description: 'Help resolve a disagreement peacefully',
          objective: 'Mediate or assist in resolving a conflict constructively'
        },
        {
          title: 'Spread Positivity',
          description: 'Share positive messages',
          objective: 'Write 5 positive messages or compliments to others'
        },
        {
          title: 'Cultural Exchange',
          description: 'Learn about different cultures',
          objective: 'Learn 5 facts about a culture different from your own'
        },
        {
          title: 'Peace Meditation',
          description: 'Practice inner peace',
          objective: 'Meditate for peace for 10 minutes and share your experience'
        }
      ]
    };

    return templates[type] || templates.AWARENESS;
  }

  function completeMission(missionId) {
    const mission = gameState.activeMissions.find(m => m.id === missionId);
    if (!mission) return;

    mission.completed = true;
    mission.completedAt = Date.now();

    // Award points
    if (gameState.player) {
      gameState.player.missionsCompleted += 1;
      gameState.player.peacePoints += mission.points;
      gameState.completedMissions = gameState.player.missionsCompleted;
      gameState.peacePoints = gameState.player.peacePoints;
    }

    // Update global peace progress
    updatePeaceProgress(mission.points);

    // Remove from active missions after a delay
    setTimeout(() => {
      gameState.activeMissions = gameState.activeMissions.filter(m => m.id !== missionId);
      saveGameState();
      updateMissionList();
    }, 3000);

    saveGameState();
    updateUI();

    showGameNotification(
      `Mission complete! +${mission.points} peace points`,
      'success',
      3000
    );
  }

  function updatePeaceProgress(points) {
    // Each point represents progress toward world peace
    // Calculate progress based on global participation
    const participationRate = gameState.globalPlayers / WORLD_POPULATION;
    const missionImpact = points / 1000000; // Scale appropriately
    
    gameState.peaceProgress = Math.min(100, 
      (participationRate * 100) + (gameState.completedMissions * 0.00001)
    );

    saveGameState();
  }

  // ============================================
  // UI UPDATES
  // ============================================

  function updateUI() {
    updatePlayerProfile();
    updateGlobalStats();
    updatePeaceProgressBar();
    updateMissionList();
  }

  function updatePlayerProfile() {
    const player = gameState.player;

    if (player) {
      setElementText('player-id', player.id);
      setElementText('player-role', player.role);
      setElementText('missions-completed', player.missionsCompleted);
      setElementText('peace-points', player.peacePoints);

      const registerBtn = document.getElementById('register-player');
      if (registerBtn) {
        registerBtn.textContent = 'Already Registered';
        registerBtn.disabled = true;
      }
    } else {
      setElementText('player-id', 'Not registered');
      setElementText('player-role', '-');
      setElementText('missions-completed', '0');
      setElementText('peace-points', '0');
    }
  }

  function updateGlobalStats() {
    // Update population
    setElementText('global-population', formatNumber(WORLD_POPULATION));

    // Update player count
    setElementText('player-count', formatNumber(gameState.globalPlayers));

    // Update participation rate
    const participationRate = (gameState.globalPlayers / WORLD_POPULATION) * 100;
    setElementText('participation-rate', participationRate.toFixed(4) + '%');
  }

  function updatePeaceProgressBar() {
    const progressBar = document.getElementById('peace-progress-bar');
    const progressText = document.getElementById('peace-percentage');

    if (progressBar && progressText) {
      const progress = gameState.peaceProgress.toFixed(4);
      progressBar.style.width = progress + '%';
      progressText.textContent = progress + '%';

      // Color changes based on progress
      if (gameState.peaceProgress < 25) {
        progressBar.style.background = 'linear-gradient(90deg, #f44336, #e91e63)';
      } else if (gameState.peaceProgress < 50) {
        progressBar.style.background = 'linear-gradient(90deg, #ff9800, #ffc107)';
      } else if (gameState.peaceProgress < 75) {
        progressBar.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
      } else {
        progressBar.style.background = 'linear-gradient(90deg, #00e676, #76ff03)';
        progressBar.style.boxShadow = '0 0 20px rgba(0, 230, 118, 0.5)';
      }
    }
  }

  function updateMissionList() {
    const missionList = document.getElementById('mission-list');
    if (!missionList) return;

    if (gameState.activeMissions.length === 0) {
      missionList.innerHTML = `
        <div class="no-missions">
          <p>No active missions</p>
          <p class="hint">Click "Get New Mission" to start your journey!</p>
        </div>
      `;
      return;
    }

    missionList.innerHTML = gameState.activeMissions.map(mission => `
      <div class="mission-card ${mission.completed ? 'completed' : ''}" data-mission-id="${mission.id}">
        <div class="mission-header">
          <span class="mission-icon">${mission.icon}</span>
          <div class="mission-info">
            <h4 class="mission-title">${mission.title}</h4>
            <span class="mission-points">+${mission.points} points</span>
          </div>
        </div>
        <p class="mission-description">${mission.description}</p>
        <p class="mission-objective"><strong>Objective:</strong> ${mission.objective}</p>
        ${!mission.completed ? `
          <button class="btn-complete" onclick="window.gameCompleteMission('${mission.id}')">
            Complete Mission
          </button>
        ` : `
          <div class="mission-completed-badge">✓ Completed</div>
        `}
      </div>
    `).join('');
  }

  // ============================================
  // GAME LOOP
  // ============================================

  function startGameLoop() {
    // Update stats periodically
    setInterval(() => {
      // Simulate gradual increase in global players
      if (Math.random() < 0.1) { // 10% chance each interval
        gameState.globalPlayers += Math.floor(Math.random() * 10) + 1;
        updateGlobalStats();
        saveGameState();
      }
    }, 30000); // Every 30 seconds

    // Save game state periodically
    setInterval(() => {
      saveGameState();
    }, 60000); // Every minute
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function showGameNotification(message, type = 'info', duration = 2000) {
    // Use existing notification system if available
    if (typeof showNotification === 'function') {
      showNotification(message, duration);
      return;
    }

    // Fallback notification
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  // ============================================
  // GLOBAL EXPORTS
  // ============================================

  // Export functions to window for button onclick handlers
  window.gameCompleteMission = completeMission;
  window.gameGenerateNewMission = generateNewMission;

  // Export main init function
  window.initGameMechanics = initGameMechanics;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGameMechanics);
  } else {
    initGameMechanics();
  }

})();
