// LOBBY PROGRESS WIDGET
// Fetches user progress from API and displays level/XP data

class LobbyProgressWidget {
  constructor(containerId, forgeSlug) {
    this.container = document.getElementById(containerId);
    this.forgeSlug = forgeSlug;
    this.userData = null;
    this.apiBase = '/.netlify/functions';
  }

  async init() {
    await this.loadUserData();
    this.render();
    this.attachEventListeners();
  }

  async loadUserData() {
    // Get email from localStorage
    const email = localStorage.getItem('userEmail');

    if (!email) {
      this.showLoginPrompt();
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/progress-get?email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      this.userData = data;

      // Store in localStorage for offline access
      localStorage.setItem('userProgress', JSON.stringify(data));

    } catch (error) {
      console.error('Error loading user data:', error);

      // Try to load from localStorage as fallback
      const cachedData = localStorage.getItem('userProgress');
      if (cachedData) {
        this.userData = JSON.parse(cachedData);
      } else {
        this.showError();
      }
    }
  }

  getCurrentForgeData() {
    if (!this.userData || !this.userData.forges) {
      return { level: 1, xp: 0, totalXP: 0 };
    }

    return this.userData.forges[this.forgeSlug] || { level: 1, xp: 0, totalXP: 0 };
  }

  getOverallLevel() {
    if (!this.userData) return 1;
    return this.userData.overallLevel || 1;
  }

  calculateProgress(xp, level) {
    // XP required for next level = level * 100
    const xpForNextLevel = level * 100;
    const progress = (xp / xpForNextLevel) * 100;
    return Math.min(progress, 100);
  }

  getXPToNextLevel(xp, level) {
    const xpForNextLevel = level * 100;
    return xpForNextLevel - xp;
  }

  render() {
    if (!this.userData) {
      return;
    }

    const forgeData = this.getCurrentForgeData();
    const overallLevel = this.getOverallLevel();
    const progress = this.calculateProgress(forgeData.xp, forgeData.level);
    const xpToNext = this.getXPToNextLevel(forgeData.xp, forgeData.level);

    const forge = getForgeBySlug(this.forgeSlug);
    const isLocked = overallLevel < forge.unlockLevel;

    this.container.innerHTML = `
      <div class="progress-widget ${isLocked ? 'locked' : ''}">
        <div class="progress-header">
          <div class="progress-title">
            <span class="forge-icon">${forge.icon}</span>
            <div class="title-text">
              <h3>${forge.name}</h3>
              <p class="forge-tagline">${forge.tagline}</p>
            </div>
          </div>
          <div class="overall-level">
            <span class="level-label">Overall</span>
            <span class="level-number">Lv ${overallLevel}</span>
          </div>
        </div>

        ${isLocked ? this.renderLockedState(forge) : this.renderUnlockedState(forgeData, forge, progress, xpToNext)}

        <div class="forge-stats">
          <div class="stat">
            <span class="stat-icon">🔥</span>
            <span class="stat-value">${forgeData.totalXP || 0}</span>
            <span class="stat-label">Total XP</span>
          </div>
          <div class="stat">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">${this.userData.achievements?.length || 0}</span>
            <span class="stat-label">Achievements</span>
          </div>
          <div class="stat">
            <span class="stat-icon">📅</span>
            <span class="stat-value">${this.userData.streak || 0}</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>
      </div>
    `;
  }

  renderLockedState(forge) {
    return `
      <div class="locked-state">
        <div class="lock-icon">🔒</div>
        <p class="lock-message">Unlock at Level ${forge.unlockLevel}</p>
        <p class="lock-hint">Continue your journey to access this forge</p>
      </div>
    `;
  }

  renderUnlockedState(forgeData, forge, progress, xpToNext) {
    return `
      <div class="progress-main">
        <div class="level-display">
          <span class="level-label">Forge Level</span>
          <span class="level-number">${forgeData.level}</span>
        </div>

        <div class="xp-bar-container">
          <div class="xp-bar" style="width: ${progress}%; background: ${forge.gradient};">
            <div class="xp-shine"></div>
          </div>
          <div class="xp-text">
            <span class="xp-current">${forgeData.xp} XP</span>
            <span class="xp-separator">/</span>
            <span class="xp-required">${forgeData.level * 100} XP</span>
          </div>
        </div>

        <div class="progress-footer">
          <span class="xp-to-next">${xpToNext} XP to Level ${forgeData.level + 1}</span>
        </div>
      </div>
    `;
  }

  showLoginPrompt() {
    this.container.innerHTML = `
      <div class="progress-widget login-prompt">
        <div class="login-content">
          <h3>🔐 Login Required</h3>
          <p>Enter your email to track your progress</p>
          <input type="email" id="email-input" placeholder="your@email.com" />
          <button id="login-button" class="primary-button">Start Journey</button>
        </div>
      </div>
    `;

    const input = document.getElementById('email-input');
    const button = document.getElementById('login-button');

    button.addEventListener('click', () => this.handleLogin(input.value));
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin(input.value);
    });
  }

  async handleLogin(email) {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    localStorage.setItem('userEmail', email);
    await this.loadUserData();
    this.render();
  }

  showError() {
    this.container.innerHTML = `
      <div class="progress-widget error-state">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <h3>Connection Error</h3>
          <p>Unable to load your progress. Please try again.</p>
          <button id="retry-button" class="primary-button">Retry</button>
        </div>
      </div>
    `;

    document.getElementById('retry-button').addEventListener('click', () => {
      this.init();
    });
  }

  attachEventListeners() {
    // Add level-up animation listener
    if (this.userData) {
      this.checkForLevelUp();
    }
  }

  checkForLevelUp() {
    const lastLevel = localStorage.getItem(`lastLevel_${this.forgeSlug}`);
    const currentLevel = this.getCurrentForgeData().level;

    if (lastLevel && parseInt(lastLevel) < currentLevel) {
      this.showLevelUpAnimation(currentLevel);
    }

    localStorage.setItem(`lastLevel_${this.forgeSlug}`, currentLevel);
  }

  showLevelUpAnimation(newLevel) {
    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay';
    overlay.innerHTML = `
      <div class="level-up-content">
        <div class="level-up-icon">⭐</div>
        <h2>LEVEL UP!</h2>
        <div class="new-level">Level ${newLevel}</div>
        <p>You've grown stronger!</p>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 500);
    }, 3000);
  }

  // Method to add XP (called from workshop/exercises)
  async addXP(amount) {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    try {
      const response = await fetch(`${this.apiBase}/progress-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          forge: this.forgeSlug,
          xp: amount
        })
      });

      if (!response.ok) throw new Error('Failed to update progress');

      const data = await response.json();
      this.userData = data;
      this.render();

      return data;
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LobbyProgressWidget;
}
