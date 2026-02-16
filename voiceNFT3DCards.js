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
 * File: voiceNFT3DCards.js
 * Declaration ID: IP-58292811-MLL28ZWM
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

/**
 * Voice NFT 3D Card Generator
 * Handles 3D visualization, wallet integration, NFT minting, and marketplace
 */

// Default voice profile characteristics
const DEFAULT_VOICE_CHARACTERISTICS = {
  pitch: 170, // Average human pitch in Hz
  speakingRate: 1.0,
  dynamicRange: 0.5,
  duration: 5 // Default duration in seconds
};

// Global state
const state = {
  wallet: null,
  web3: null,
  contract: null,
  ipfsClient: null,
  scene: null,
  camera: null,
  renderer: null,
  card3D: null,
  audioContext: null,
  audioAnalyser: null,
  audioSource: null,
  currentAudio: null,
  myCards: [],
  marketplaceCards: [],
  connected: false
};

// Contract ABI (simplified for demo)
const VOICE_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "voiceName", "type": "string"},
      {"internalType": "string", "name": "voiceType", "type": "string"},
      {"internalType": "string", "name": "voiceDescription", "type": "string"},
      {"internalType": "string", "name": "audioIPFSHash", "type": "string"},
      {"internalType": "string", "name": "imageIPFSHash", "type": "string"},
      {"internalType": "string", "name": "tokenURI", "type": "string"}
    ],
    "name": "mintVoiceCard",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "creator", "type": "address"}],
    "name": "getVoiceCardsByCreator",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getListedVoiceCards",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getVoiceCard",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "string", "name": "voiceName", "type": "string"},
          {"internalType": "string", "name": "voiceType", "type": "string"},
          {"internalType": "string", "name": "voiceDescription", "type": "string"},
          {"internalType": "string", "name": "audioIPFSHash", "type": "string"},
          {"internalType": "string", "name": "imageIPFSHash", "type": "string"},
          {"internalType": "uint256", "name": "mintedAt", "type": "uint256"},
          {"internalType": "uint256", "name": "usageCount", "type": "uint256"},
          {"internalType": "bool", "name": "isMarketplaceListed", "type": "bool"},
          {"internalType": "uint256", "name": "price", "type": "uint256"}
        ],
        "internalType": "struct VoiceNFT.VoiceCard",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address (would be deployed contract address)
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  init3DScene();
  setupTabNavigation();
});

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('🚀 Voice NFT 3D Card Generator initialized');
  
  // Check for wallet
  checkWalletConnection();
  
  // Initialize IPFS client (using public gateway for demo)
  // In production, use proper IPFS node
  state.ipfsClient = {
    add: async (file) => {
      // Mock IPFS upload - in production, use actual IPFS
      return { path: 'Qm' + Math.random().toString(36).substring(7) };
    }
  };
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Wallet connection
  document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
  
  // Mint form
  document.getElementById('mintForm').addEventListener('submit', handleMint);
  
  // Audio file upload
  document.getElementById('audioFile').addEventListener('change', handleAudioUpload);
  
  // Audio controls
  document.getElementById('playAudioBtn').addEventListener('click', playAudio);
  document.getElementById('stopAudioBtn').addEventListener('click', stopAudio);
  
  // Marketplace filters
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', function() {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      filterMarketplace(this.dataset.filter);
    });
  });
  
  // Navigation links that switch tabs (use data-switch-tab attribute)
  document.querySelectorAll('[data-switch-tab]').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const tabName = this.getAttribute('data-switch-tab');
      if (tabName && tabName.trim()) {
        switchToTab(tabName);
      }
    });
  });
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      switchToTab(this.dataset.tab);
    });
  });
}

/**
 * Switch to a specific tab programmatically
 * @param {string} tabName - Name of the tab to switch to
 */
function switchToTab(tabName) {
  // Find the tab button
  const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (!tabBtn) {
    console.warn(`Tab "${tabName}" not found`);
    return;
  }
  
  // Remove active class from all tabs
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  // Add active class to clicked tab
  tabBtn.classList.add('active');
  const tabContent = document.getElementById(tabName);
  if (tabContent) {
    tabContent.classList.add('active');
  } else {
    console.warn(`Tab content "${tabName}" not found`);
  }
  
  // Load data for tab
  loadTabData(tabName);
}

/**
 * Check wallet connection
 */
async function checkWalletConnection() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
    }
  }
}

/**
 * Connect wallet
 */
async function connectWallet() {
  try {
    if (typeof window.ethereum === 'undefined') {
      showStatus('Please install MetaMask or another Web3 wallet', 'error');
      return;
    }

    showStatus('Connecting wallet...', 'info');
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    state.wallet = accounts[0];
    
    // Initialize Web3
    state.web3 = new Web3(window.ethereum);
    
    // Initialize contract (if deployed)
    if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      state.contract = new state.web3.eth.Contract(VOICE_NFT_ABI, CONTRACT_ADDRESS);
    }
    
    // Update UI
    state.connected = true;
    document.getElementById('walletIndicator').classList.add('connected');
    document.getElementById('walletText').textContent = formatAddress(state.wallet);
    document.getElementById('connectWalletBtn').textContent = 'Connected';
    document.getElementById('connectWalletBtn').disabled = true;
    
    showStatus('Wallet connected successfully!', 'success');
    
    // Load user's cards
    loadMyCards();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    showStatus('Failed to connect wallet: ' + error.message, 'error');
  }
}

/**
 * Handle audio file upload
 */
function handleAudioUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const audioUrl = e.target.result;
    
    // Create audio element
    state.currentAudio = new Audio(audioUrl);
    
    // Show visualizer and controls
    document.getElementById('audioVisualizer').style.display = 'block';
    document.getElementById('audioControls').style.display = 'flex';
    
    // Setup audio context for visualization
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      state.audioAnalyser = state.audioContext.createAnalyser();
      state.audioAnalyser.fftSize = 256;
    }
    
    // Update duration
    state.currentAudio.addEventListener('loadedmetadata', function() {
      const duration = formatDuration(state.currentAudio.duration);
      document.getElementById('audioDuration').textContent = duration;
    });
    
    // Update 3D preview with audio data
    update3DCardWithAudio(file.name);
  };
  
  reader.readAsDataURL(file);
}

/**
 * Play audio
 */
function playAudio() {
  if (state.currentAudio) {
    state.currentAudio.play();
    document.getElementById('playAudioBtn').innerHTML = '⏸️';
    
    // Visualize audio
    visualizeAudio();
  }
}

/**
 * Stop audio
 */
function stopAudio() {
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio.currentTime = 0;
    document.getElementById('playAudioBtn').innerHTML = '▶️';
  }
}

/**
 * Visualize audio
 */
function visualizeAudio() {
  const canvas = document.createElement('canvas');
  const visualizer = document.getElementById('audioVisualizer');
  visualizer.innerHTML = '';
  visualizer.appendChild(canvas);
  
  canvas.width = visualizer.offsetWidth;
  canvas.height = visualizer.offsetHeight;
  const ctx = canvas.getContext('2d');
  
  if (!state.audioSource) {
    state.audioSource = state.audioContext.createMediaElementSource(state.currentAudio);
    state.audioSource.connect(state.audioAnalyser);
    state.audioAnalyser.connect(state.audioContext.destination);
  }
  
  const bufferLength = state.audioAnalyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function draw() {
    requestAnimationFrame(draw);
    
    state.audioAnalyser.getByteFrequencyData(dataArray);
    
    ctx.fillStyle = 'rgba(5, 8, 16, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      
      const hue = (i / bufferLength) * 360;
      ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }
  
  draw();
}

/**
 * Handle NFT minting
 */
async function handleMint(event) {
  event.preventDefault();
  
  if (!state.connected) {
    showStatus('Please connect your wallet first', 'error');
    return;
  }
  
  const mintBtn = document.getElementById('mintBtn');
  const spinner = mintBtn.querySelector('.spinner');
  
  try {
    mintBtn.disabled = true;
    spinner.style.display = 'inline-block';
    
    // Get form data
    const voiceName = document.getElementById('voiceName').value;
    const voiceType = document.getElementById('voiceType').value;
    const voiceDescription = document.getElementById('voiceDescription').value;
    const audioFile = document.getElementById('audioFile').files[0];
    const imageFile = document.getElementById('cardImage').files[0];
    
    showStatus('Uploading files to IPFS...', 'info');
    
    // Upload audio to IPFS
    const audioHash = await uploadToIPFS(audioFile);
    
    // Upload or generate image
    let imageHash;
    if (imageFile) {
      imageHash = await uploadToIPFS(imageFile);
    } else {
      // Generate default image
      imageHash = await generateDefaultCardImage(voiceName, voiceType);
    }
    
    showStatus('Creating metadata...', 'info');
    
    // Create metadata
    const metadata = {
      name: voiceName,
      description: voiceDescription,
      image: `ipfs://${imageHash}`,
      audio: `ipfs://${audioHash}`,
      attributes: [
        { trait_type: "Voice Type", value: voiceType },
        { trait_type: "Creator", value: state.wallet },
        { trait_type: "Created", value: new Date().toISOString() }
      ]
    };
    
    // Upload metadata to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    const metadataHash = await uploadToIPFS(metadataFile);
    
    showStatus('Minting NFT...', 'info');
    
    // Mint NFT (if contract is deployed)
    if (state.contract) {
      const tokenURI = `ipfs://${metadataHash}`;
      const tx = await state.contract.methods.mintVoiceCard(
        voiceName,
        voiceType,
        voiceDescription,
        audioHash,
        imageHash,
        tokenURI
      ).send({ from: state.wallet });
      
      showStatus('Voice NFT minted successfully! 🎉', 'success');
      
      // Store locally for demo
      storeLocalCard({
        voiceName,
        voiceType,
        voiceDescription,
        audioHash,
        imageHash,
        metadataHash,
        creator: state.wallet,
        timestamp: Date.now()
      });
    } else {
      // Demo mode - just store locally
      showStatus('Demo mode: Card created locally (contract not deployed)', 'info');
      storeLocalCard({
        voiceName,
        voiceType,
        voiceDescription,
        audioHash,
        imageHash,
        metadataHash,
        creator: state.wallet,
        timestamp: Date.now()
      });
    }
    
    // Reset form
    document.getElementById('mintForm').reset();
    document.getElementById('audioVisualizer').style.display = 'none';
    document.getElementById('audioControls').style.display = 'none';
    
    // Reload cards
    loadMyCards();
    
  } catch (error) {
    console.error('Error minting NFT:', error);
    showStatus('Failed to mint NFT: ' + error.message, 'error');
  } finally {
    mintBtn.disabled = false;
    spinner.style.display = 'none';
  }
}

/**
 * Upload file to IPFS (mock for demo)
 */
async function uploadToIPFS(file) {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, actually upload to IPFS
  // const added = await state.ipfsClient.add(file);
  // return added.path;
  
  // Mock hash for demo
  return 'Qm' + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate default card image
 */
async function generateDefaultCardImage(voiceName, voiceType) {
  // Create a canvas and generate an image
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#38bdf8');
  gradient.addColorStop(1, '#a855f7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎤', 256, 200);
  
  ctx.font = 'bold 32px Arial';
  ctx.fillText(voiceName, 256, 300);
  
  ctx.font = '24px Arial';
  ctx.fillText(voiceType, 256, 350);
  
  // Convert to blob and upload
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'card-image.png', { type: 'image/png' });
      const hash = await uploadToIPFS(file);
      resolve(hash);
    });
  });
}

/**
 * Store card locally (for demo)
 */
function storeLocalCard(card) {
  let cards = JSON.parse(localStorage.getItem('voiceNFTCards') || '[]');
  card.id = Date.now();
  cards.push(card);
  localStorage.setItem('voiceNFTCards', JSON.stringify(cards));
}

/**
 * Load my cards
 */
function loadMyCards() {
  const cards = JSON.parse(localStorage.getItem('voiceNFTCards') || '[]');
  state.myCards = cards.filter(card => card.creator === state.wallet);
  
  const grid = document.getElementById('myCardsGrid');
  grid.innerHTML = '';
  
  if (state.myCards.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-secondary);">No voice cards yet. Create your first one!</p>';
    return;
  }
  
  state.myCards.forEach(card => {
    const cardElement = createVoiceCardElement(card, true);
    grid.appendChild(cardElement);
  });
}

/**
 * Load marketplace cards
 */
function loadMarketplaceCards() {
  const cards = JSON.parse(localStorage.getItem('voiceNFTCards') || '[]');
  state.marketplaceCards = cards;
  
  displayMarketplaceCards(state.marketplaceCards);
}

/**
 * Display marketplace cards
 */
function displayMarketplaceCards(cards) {
  const grid = document.getElementById('marketplaceGrid');
  grid.innerHTML = '';
  
  if (cards.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-secondary);">No voice cards in marketplace yet.</p>';
    return;
  }
  
  cards.forEach(card => {
    const cardElement = createVoiceCardElement(card, false);
    grid.appendChild(cardElement);
  });
}

/**
 * Filter marketplace
 */
function filterMarketplace(filter) {
  if (filter === 'all') {
    displayMarketplaceCards(state.marketplaceCards);
  } else {
    const filtered = state.marketplaceCards.filter(card => card.voiceType === filter);
    displayMarketplaceCards(filtered);
  }
}

/**
 * Create voice card element
 */
function createVoiceCardElement(card, isOwned) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'voice-card';
  
  const emoji = getVoiceTypeEmoji(card.voiceType);
  
  // Create card content first
  const imageDiv = document.createElement('div');
  imageDiv.className = 'voice-card-image';
  imageDiv.textContent = emoji;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'voice-card-content';
  
  contentDiv.innerHTML = `
    <div class="voice-card-title">${card.voiceName}</div>
    <span class="voice-card-type">${card.voiceType}</span>
    <p class="voice-card-desc">${card.voiceDescription}</p>
    <div class="voice-card-stats">
      <span>📅 ${new Date(card.timestamp).toLocaleDateString()}</span>
      <span>👤 ${formatAddress(card.creator)}</span>
    </div>
    <div class="voice-card-actions">
      ${isOwned 
        ? `<button class="btn btn-primary btn-small export-translator-btn" data-card-id="${card.id}">🌐 Use in Translator</button><button class="btn btn-secondary btn-small">List</button>` 
        : '<button class="btn btn-primary btn-small">View Details</button>'}
    </div>
  `;
  
  cardDiv.appendChild(imageDiv);
  cardDiv.appendChild(contentDiv);
  
  // Attach event listener directly to the button after it's created
  if (isOwned) {
    const exportBtn = contentDiv.querySelector('.export-translator-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => exportCardForTranslator(card));
    }
  }
  
  return cardDiv;
}

/**
 * Get emoji for voice type
 */
function getVoiceTypeEmoji(type) {
  const emojis = {
    'narrator': '🎙️',
    'character': '🎭',
    'celebrity': '⭐',
    'original': '🎤',
    'ai-generated': '🤖',
    'voice-actor': '🎬'
  };
  return emojis[type] || '🎤';
}

/**
 * Load tab data
 */
function loadTabData(tab) {
  switch(tab) {
    case 'collection':
      loadMyCards();
      break;
    case 'marketplace':
      loadMarketplaceCards();
      break;
    case 'usage':
      loadUsageStats();
      break;
  }
}

/**
 * Load usage statistics
 */
function loadUsageStats() {
  const statsContent = document.getElementById('statsContent');
  const cards = state.myCards;
  
  const totalCards = cards.length;
  const totalUsage = cards.reduce((sum, card) => sum + (card.usageCount || 0), 0);
  
  statsContent.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px;">
      <div class="card">
        <h3 style="font-size: 2rem; color: var(--accent-cyan);">${totalCards}</h3>
        <p style="color: var(--text-secondary);">Total Voice Cards</p>
      </div>
      <div class="card">
        <h3 style="font-size: 2rem; color: var(--accent-purple);">${totalUsage}</h3>
        <p style="color: var(--text-secondary);">Total Usage Count</p>
      </div>
      <div class="card">
        <h3 style="font-size: 2rem; color: var(--accent-gold);">$0</h3>
        <p style="color: var(--text-secondary);">Total Earnings</p>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-bottom: 16px;">Recent Activity</h3>
      <p style="color: var(--text-secondary);">Usage tracking will appear here as your voice cards are used across Web3 platforms.</p>
    </div>
  `;
}

/**
 * Initialize 3D scene
 */
function init3DScene() {
  // Check if THREE is available
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded - 3D preview disabled');
    const canvas = document.getElementById('card3DCanvas');
    const container = canvas.parentElement;
    container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">3D Preview: Three.js library loading... (Demo mode available)</div>';
    return;
  }

  const canvas = document.getElementById('card3DCanvas');
  const container = canvas.parentElement;
  
  // Scene
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x050810);
  
  // Camera
  state.camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  state.camera.position.z = 5;
  
  // Renderer
  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  state.renderer.setSize(container.clientWidth, container.clientHeight);
  state.renderer.setPixelRatio(window.devicePixelRatio);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  state.scene.add(ambientLight);
  
  const pointLight1 = new THREE.PointLight(0x38bdf8, 1, 100);
  pointLight1.position.set(5, 5, 5);
  state.scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xa855f7, 1, 100);
  pointLight2.position.set(-5, -5, 5);
  state.scene.add(pointLight2);
  
  // Create 3D card
  create3DCard();
  
  // Animation loop
  animate3D();
  
  // Handle resize
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(width, height);
  });
  
  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  
  container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  });
  
  function animate3D() {
    requestAnimationFrame(animate3D);
    
    if (state.card3D) {
      // Rotate card based on mouse position
      state.card3D.rotation.y = mouseX * 0.5;
      state.card3D.rotation.x = mouseY * 0.3;
      
      // Add gentle floating animation
      state.card3D.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    state.renderer.render(state.scene, state.camera);
  }
}

/**
 * Create 3D card
 */
function create3DCard() {
  // Card geometry
  const geometry = new THREE.BoxGeometry(2, 3, 0.1);
  
  // Card material with gradient
  const material = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.2
  });
  
  state.card3D = new THREE.Mesh(geometry, material);
  state.scene.add(state.card3D);
  
  // Add holographic effect
  const holographicGeometry = new THREE.PlaneGeometry(2.1, 3.1);
  const holographicMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
  });
  const holographic = new THREE.Mesh(holographicGeometry, holographicMaterial);
  holographic.position.z = 0.06;
  state.card3D.add(holographic);
}

/**
 * Update 3D card with audio data
 */
function update3DCardWithAudio(audioName) {
  if (state.card3D) {
    // Add pulsing effect to represent audio
    const scale = 1 + Math.random() * 0.1;
    state.card3D.scale.set(scale, scale, scale);
  }
}

/**
 * Utility functions
 */
function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function showStatus(message, type) {
  const container = document.getElementById('statusMessages');
  const statusDiv = document.createElement('div');
  statusDiv.className = `status-message ${type}`;
  statusDiv.textContent = message;
  
  container.innerHTML = '';
  container.appendChild(statusDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    statusDiv.remove();
  }, 5000);
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(filename) {
  // Handle null/undefined inputs
  if (!filename) return 'voice-profile';
  
  // Replace invalid filename characters with hyphens
  return filename
    .replace(/[/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Export voice card for use in translator
 */
function exportCardForTranslator(card) {
  // Create voice profile format compatible with translator.html
  const voiceProfile = {
    profile_format: "voice_profile_v1",
    id: `voice-card-${card.id}`,
    created_at_iso: new Date(card.timestamp).toISOString(),
    duration_seconds: DEFAULT_VOICE_CHARACTERISTICS.duration,
    audio: {
      // Store audio reference - in production this would include actual audio data
      ipfsHash: card.audioHash,
      data: `ipfs://${card.audioHash}`
    },
    voice_characteristics: {
      description: card.voiceDescription,
      type: card.voiceType,
      quality: "high",
      // Use default voice characteristics - these would be extracted from actual audio in production
      pitch: DEFAULT_VOICE_CHARACTERISTICS.pitch,
      speakingRate: DEFAULT_VOICE_CHARACTERISTICS.speakingRate,
      dynamicRange: DEFAULT_VOICE_CHARACTERISTICS.dynamicRange
    },
    metadata: {
      name: card.voiceName,
      creator: card.creator,
      nftMetadata: card.metadataHash ? `ipfs://${card.metadataHash}` : null
    }
  };
  
  // Create download
  const blob = new Blob([JSON.stringify(voiceProfile, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voice-profile-${sanitizeFilename(card.voiceName)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showStatus(`Voice profile exported! Import it in the Translator to use ${card.voiceName}`, 'success');
  
  // Show helpful message immediately after download
  if (confirm(`Voice profile downloaded!\n\nWould you like to go to the Translator now to import and use this voice?`)) {
    window.location.href = 'translator.html';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { state, connectWallet, handleMint };
}
