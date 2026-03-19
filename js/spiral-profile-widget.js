// RootIB: RB-20260319142113-E25DDA88
/**
 * SPIRAL PROFILE WIDGET
 * Drop-in component for showing user progress
 *
 * Usage:
 *   <div id="spiralProfile"></div>
 *   <script>
 *     SpiralProfile.render('spiralProfile', 'user-id-here');
 *   </script>
 */

const SpiralProfile = {
  /**
   * Render a compact profile widget
   * @param {string} containerId - ID of DOM element to render into
   * @param {string} userId - User ID to load progress for
   * @param {object} options - { compact: boolean, showForges: boolean }
   */
  async render(containerId, userId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    const {
      compact = false,
      showForges = true,
      showOctave = true,
      darkMode = true
    } = options;

    // Show loading state
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Loading...</div>';

    try {
      const result = await SpiralEngine.getUserProgress(userId);

      if (!result.success || !result.data.is_initialized) {
        container.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #888;">
            User not initialized.
            <button onclick="SpiralEngine.initializeUser('${userId}').then(() => location.reload())"
                    style="display: block; margin: 10px auto; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Initialize Account
            </button>
          </div>
        `;
        return;
      }

      const data = result.data;
      const totalLevel = data.forges.reduce((sum, f) => sum + f.level, 0);
      const unlockedCount = data.forges.filter(f => f.status === 'unlocked').length;

      if (compact) {
        this.renderCompact(container, data, totalLevel, unlockedCount, darkMode);
      } else {
        this.renderFull(container, data, totalLevel, unlockedCount, showForges, showOctave, darkMode);
      }
    } catch (error) {
      console.error('SpiralProfile render error:', error);
      container.innerHTML = '<div style="text-align: center; padding: 20px; color: #f88;">Error loading profile</div>';
    }
  },

  renderCompact(container, data, totalLevel, unlockedCount, darkMode) {
    const bgColor = darkMode ? 'rgba(10, 10, 12, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    const textColor = darkMode ? '#e4e4e7' : '#1a1a1a';
    const mutedColor = darkMode ? '#888' : '#666';

    container.innerHTML = `
      <div style="
        background: ${bgColor};
        border: 2px solid rgba(128, 128, 128, 0.3);
        border-radius: 12px;
        padding: 1rem;
        color: ${textColor};
        font-family: 'Rajdhani', sans-serif;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 1.2rem; font-weight: bold;">⚡ Spiral Engine</div>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">
            Octave ${data.octave}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
          <div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #0ff5e0;">${data.total_xp.toLocaleString()}</div>
            <div style="font-size: 0.75rem; color: ${mutedColor};">Total XP</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #39ff14;">${totalLevel}</div>
            <div style="font-size: 0.75rem; color: ${mutedColor};">Total Level</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #ff6b35;">${unlockedCount}/7</div>
            <div style="font-size: 0.75rem; color: ${mutedColor};">Forges</div>
          </div>
        </div>
      </div>
    `;
  },

  renderFull(container, data, totalLevel, unlockedCount, showForges, showOctave, darkMode) {
    const bgColor = darkMode ? 'rgba(10, 10, 12, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    const textColor = darkMode ? '#e4e4e7' : '#1a1a1a';
    const mutedColor = darkMode ? '#888' : '#666';

    let html = `
      <div style="
        background: ${bgColor};
        border: 2px solid rgba(128, 128, 128, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
        color: ${textColor};
        font-family: 'Rajdhani', sans-serif;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <div style="font-size: 1.8rem; font-weight: bold;">⚡ Your Progress</div>
            <div style="font-size: 0.9rem; color: ${mutedColor};">Pattern: 3 → 7 → 13 → ∞</div>
          </div>
          ${showOctave ? `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 20px; border-radius: 20px; font-size: 1.2rem; font-weight: bold;">
              Octave ${data.octave}
            </div>
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #0ff5e0;">${data.total_xp.toLocaleString()}</div>
            <div style="font-size: 0.85rem; color: ${mutedColor};">Total XP</div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #39ff14;">${totalLevel}</div>
            <div style="font-size: 0.85rem; color: ${mutedColor};">Total Level</div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #ff6b35;">${unlockedCount}/7</div>
            <div style="font-size: 0.85rem; color: ${mutedColor};">Forges</div>
          </div>
        </div>

        ${showForges ? this.renderForgesList(data.forges, mutedColor) : ''}
      </div>
    `;

    container.innerHTML = html;
  },

  renderForgesList(forges, mutedColor) {
    return `
      <div style="margin-top: 1.5rem;">
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem;">7 Forges</div>
        <div style="display: grid; gap: 0.75rem;">
          ${forges.map(forge => {
            const forgeInfo = SpiralEngine.FORGE_DATA[forge.slug] || {};
            const progress = SpiralEngine.calculateLevelProgress(forge.total_xp, forge.level);
            const levelName = SpiralEngine.getLevelName(forge.level);
            const isUnlocked = forge.status === 'unlocked';

            return `
              <div style="
                background: rgba(0, 0, 0, 0.3);
                border-left: 4px solid ${forgeInfo.color};
                padding: 12px;
                border-radius: 8px;
                ${isUnlocked ? '' : 'opacity: 0.5; filter: grayscale(0.6);'}
              ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.5rem;">${forgeInfo.icon}</span>
                    <div>
                      <div style="font-weight: bold;">${forgeInfo.name}</div>
                      <div style="font-size: 0.85rem; color: ${forgeInfo.color};">
                        ${isUnlocked ? `Level ${forge.level} - ${levelName}` : '🔒 Locked'}
                      </div>
                    </div>
                  </div>
                  <div style="text-align: right; font-size: 0.85rem; color: ${mutedColor};">
                    ${forge.total_xp.toLocaleString()} XP
                  </div>
                </div>
                ${isUnlocked ? `
                  <div style="background: rgba(0, 0, 0, 0.5); border-radius: 6px; height: 6px; overflow: hidden;">
                    <div style="background: ${forgeInfo.color}; height: 100%; width: ${progress}%; transition: width 0.5s ease;"></div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render just the stats bar (minimal)
   */
  async renderStatsBar(containerId, userId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const result = await SpiralEngine.getUserProgress(userId);
      if (!result.success || !result.data.is_initialized) {
        container.innerHTML = '';
        return;
      }

      const data = result.data;
      const totalLevel = data.forges.reduce((sum, f) => sum + f.level, 0);

      container.innerHTML = `
        <div style="display: inline-flex; gap: 15px; align-items: center; padding: 8px 16px; background: rgba(0, 0, 0, 0.5); border-radius: 20px; font-family: 'Orbitron', monospace; font-size: 0.9rem;">
          <span style="color: #0ff5e0;">⚡ ${data.total_xp.toLocaleString()} XP</span>
          <span style="color: #39ff14;">📊 Lvl ${totalLevel}</span>
          <span style="color: #ff6b35;">∞ Oct ${data.octave}</span>
        </div>
      `;
    } catch (error) {
      console.error('Stats bar error:', error);
    }
  }
};

// Make globally available
if (typeof window !== 'undefined') {
  window.SpiralProfile = SpiralProfile;
}
