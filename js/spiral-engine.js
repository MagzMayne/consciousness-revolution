// RootIB: RB-20260319142113-C8A332D8
/**
 * SPIRAL ENGINE API CLIENT
 * Connects frontend to Supabase-powered backend
 * Pattern: 3 → 7 → 13 → ∞
 */

const SpiralEngine = {
  API_URL: '/.netlify/functions/spiral-progress',

  FORGE_DATA: {
    reality: { name: 'Reality Forge', icon: '🔥', color: '#FF0000' },
    creation: { name: 'Creation Forge', icon: '⚡', color: '#FF7F00' },
    guardian: { name: 'Guardian Forge', icon: '🛡️', color: '#00FF00' },
    signal: { name: 'Signal Forge', icon: '📡', color: '#FFFF00' },
    wealth: { name: 'Wealth Forge', icon: '💰', color: '#0000FF' },
    character: { name: 'Character Forge', icon: '👤', color: '#4B0082' },
    infinity: { name: 'Infinity Forge', icon: '∞', color: '#9400D3' }
  },

  LEVEL_NAMES: [
    'Ember', 'Apprentice', 'Initiate', 'Disciple', 'Adept',
    'Journeyman', 'Master', 'Sage', 'Luminary', 'Oracle',
    'Architect', 'Sovereign', 'Transcendent'
  ],

  /**
   * Initialize a new user in the system
   */
  async initializeUser(userId) {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'initialize', userId })
    });
    return await response.json();
  },

  /**
   * Get user's current progress
   */
  async getUserProgress(userId) {
    const response = await fetch(`${this.API_URL}?userId=${userId}`);
    return await response.json();
  },

  /**
   * Add XP to a specific forge
   */
  async addXP(userId, forgeSlug, amount, source = 'action', metadata = {}) {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_xp',
        userId,
        forgeSlug,
        amount,
        source,
        metadata
      })
    });
    return await response.json();
  },

  /**
   * Redeem a cheat code
   */
  async redeemCheatCode(userId, code) {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'redeem_cheat_code',
        userId,
        code
      })
    });
    return await response.json();
  },

  /**
   * Calculate XP needed for next level
   */
  calculateXPForLevel(level) {
    // Pattern: 100 * (level^2)
    return 100 * Math.pow(level, 2);
  },

  /**
   * Get level name from number
   */
  getLevelName(level) {
    if (level === 0) return 'Unlit';
    if (level > 13) return `Transcendent +${level - 13}`;
    return this.LEVEL_NAMES[level - 1];
  },

  /**
   * Calculate progress percentage for current level
   */
  calculateLevelProgress(currentXP, currentLevel) {
    const xpForCurrentLevel = this.calculateXPForLevel(currentLevel);
    const xpForNextLevel = this.calculateXPForLevel(currentLevel + 1);
    const xpIntoLevel = currentXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100));
  },

  /**
   * Create a compact progress widget
   * Returns HTML string for a single forge's progress
   */
  createProgressWidget(forge) {
    const forgeInfo = this.FORGE_DATA[forge.slug] || {};
    const levelName = this.getLevelName(forge.level);
    const progress = this.calculateLevelProgress(forge.total_xp, forge.level);
    const xpForNext = this.calculateXPForLevel(forge.level + 1);
    const xpNeeded = xpForNext - forge.total_xp;

    return `
      <div class="spiral-forge-widget" style="border-left: 4px solid ${forgeInfo.color}; padding: 12px; margin: 8px 0; background: rgba(0,0,0,0.3); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.5rem;">${forgeInfo.icon}</span>
            <div>
              <div style="font-weight: bold; font-size: 1.1rem;">${forgeInfo.name}</div>
              <div style="color: ${forgeInfo.color}; font-size: 0.9rem;">Level ${forge.level} - ${levelName}</div>
            </div>
          </div>
          <div style="text-align: right; color: #888; font-size: 0.85rem;">
            ${forge.total_xp.toLocaleString()} XP
          </div>
        </div>
        <div style="background: rgba(0,0,0,0.5); border-radius: 6px; height: 8px; overflow: hidden;">
          <div style="background: ${forgeInfo.color}; height: 100%; width: ${progress}%; transition: width 0.5s ease;"></div>
        </div>
        <div style="text-align: right; color: #666; font-size: 0.75rem; margin-top: 4px;">
          ${xpNeeded.toLocaleString()} XP to Level ${forge.level + 1}
        </div>
      </div>
    `;
  },

  /**
   * Create overall progress summary
   * Shows total level across all forges
   */
  createProgressSummary(progressData) {
    const totalLevel = progressData.forges.reduce((sum, f) => sum + f.level, 0);
    const unlockedCount = progressData.forges.filter(f => f.status === 'unlocked').length;

    return `
      <div class="spiral-summary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 20px 0;">
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; font-weight: bold; color: #0ff5e0;">${totalLevel}</div>
          <div style="color: #888; font-size: 0.9rem;">Total Level</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; font-weight: bold; color: #39ff14;">${progressData.total_xp.toLocaleString()}</div>
          <div style="color: #888; font-size: 0.9rem;">Total XP</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; font-weight: bold; color: #ff6b35;">${unlockedCount}/7</div>
          <div style="color: #888; font-size: 0.9rem;">Forges Unlocked</div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; font-weight: bold; color: #ffaa00;">${progressData.octave}</div>
          <div style="color: #888; font-size: 0.9rem;">Octave</div>
        </div>
      </div>
    `;
  },

  /**
   * Show level-up animation
   */
  showLevelUpNotification(forgeName, newLevel) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 60px;
      border-radius: 20px;
      font-size: 2rem;
      font-weight: bold;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      text-align: center;
      color: white;
      animation: levelUpPop 2s ease-out;
    `;
    notification.innerHTML = `
      🎉<br>
      Level ${newLevel}<br>
      <span style="font-size: 1.2rem;">${forgeName}</span>
    `;

    // Add animation keyframes
    if (!document.getElementById('spiral-engine-animations')) {
      const style = document.createElement('style');
      style.id = 'spiral-engine-animations';
      style.textContent = `
        @keyframes levelUpPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          10% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  window.SpiralEngine = SpiralEngine;
}
