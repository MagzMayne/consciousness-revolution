// RootIB: RB-20260319142113-D0EAB5DD
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
 * File: oauth-config.js
 * Declaration ID: IP-476B37BF-MLL28ZV5
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
 * OAuth Configuration Manager
 * Centralized management of OAuth client IDs for Google and GitHub
 * 
 * Usage:
 *   const config = await OAuthConfig.load();
 *   if (!config.isGoogleConfigured()) {
 *     alert(config.getConfigurationHelp());
 *   }
 */

class OAuthConfig {
  constructor() {
    this.googleClientId = null;
    this.githubClientId = null;
    this.configSources = [];
  }

  /**
   * Load OAuth configuration from multiple sources in priority order:
   * 1. localStorage (runtime configuration)
   * 2. Inline script configuration
   * 3. Environment variables (if available)
   */
  static async load() {
    const config = new OAuthConfig();
    
    // Try to load from localStorage first (highest priority)
    const storedGoogleId = localStorage.getItem('GOOGLE_CLIENT_ID');
    const storedGithubId = localStorage.getItem('GITHUB_CLIENT_ID');
    
    if (storedGoogleId && storedGoogleId !== 'YOUR_GOOGLE_CLIENT_ID') {
      config.googleClientId = storedGoogleId;
      config.configSources.push('localStorage (Google)');
    }
    
    if (storedGithubId && storedGithubId !== 'YOUR_GITHUB_CLIENT_ID') {
      config.githubClientId = storedGithubId;
      config.configSources.push('localStorage (GitHub)');
    }
    
    // Try to load from inline window configuration
    if (!config.googleClientId && window.GOOGLE_CLIENT_ID && 
        window.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
      config.googleClientId = window.GOOGLE_CLIENT_ID;
      config.configSources.push('inline config (Google)');
    }
    
    if (!config.githubClientId && window.GITHUB_CLIENT_ID && 
        window.GITHUB_CLIENT_ID !== 'YOUR_GITHUB_CLIENT_ID') {
      config.githubClientId = window.GITHUB_CLIENT_ID;
      config.configSources.push('inline config (GitHub)');
    }
    
    return config;
  }

  /**
   * Check if Google OAuth is properly configured
   */
  isGoogleConfigured() {
    return this.googleClientId && 
           this.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' &&
           this.googleClientId.trim().length > 0;
  }

  /**
   * Check if GitHub OAuth is properly configured
   */
  isGitHubConfigured() {
    return this.githubClientId && 
           this.githubClientId !== 'YOUR_GITHUB_CLIENT_ID' &&
           this.githubClientId.trim().length > 0;
  }

  /**
   * Get the Google Client ID
   */
  getGoogleClientId() {
    return this.googleClientId;
  }

  /**
   * Get the GitHub Client ID
   */
  getGitHubClientId() {
    return this.githubClientId;
  }

  /**
   * Store configuration in localStorage for future use
   */
  save() {
    if (this.googleClientId) {
      localStorage.setItem('GOOGLE_CLIENT_ID', this.googleClientId);
    }
    if (this.githubClientId) {
      localStorage.setItem('GITHUB_CLIENT_ID', this.githubClientId);
    }
  }

  /**
   * Get helpful configuration instructions
   */
  getConfigurationHelp() {
    const setupUrl = 'https://github.com/barbrickdesign/barbrickdesign.github.io/blob/main/IDEA_FORGE_OAUTH_SETUP.md';
    
    let message = '⚠️ OAuth Configuration Required\n\n';
    
    if (!this.isGoogleConfigured()) {
      message += '❌ Google OAuth Client ID is not configured.\n';
    } else {
      message += '✅ Google OAuth is configured.\n';
    }
    
    if (!this.isGitHubConfigured()) {
      message += '❌ GitHub OAuth Client ID is not configured.\n';
    } else {
      message += '✅ GitHub OAuth is configured.\n';
    }
    
    message += '\n';
    message += '📖 Setup Instructions:\n';
    message += '1. Follow the setup guide: ' + setupUrl + '\n';
    message += '2. Get your Google Client ID from Google Cloud Console\n';
    message += '3. Get your GitHub Client ID from GitHub Developer Settings\n';
    message += '\n';
    message += '⚙️ Quick Configuration:\n';
    message += 'You can configure OAuth client IDs by running this in the browser console:\n\n';
    message += 'localStorage.setItem("GOOGLE_CLIENT_ID", "your-google-client-id");\n';
    message += 'localStorage.setItem("GITHUB_CLIENT_ID", "your-github-client-id");\n';
    message += '\n';
    message += 'Then reload the page.';
    
    return message;
  }

  /**
   * Display configuration help in a user-friendly dialog
   */
  showConfigurationHelp() {
    const help = this.getConfigurationHelp();
    alert(help);
  }

  /**
   * Interactive configuration setup
   */
  async setupInteractive() {
    console.log('🔧 Starting interactive OAuth configuration...');
    
    if (!this.isGoogleConfigured()) {
      const googleId = prompt(
        'Please enter your Google OAuth Client ID:\n\n' +
        'Get it from: https://console.cloud.google.com/\n' +
        'See setup guide: IDEA_FORGE_OAUTH_SETUP.md'
      );
      
      if (googleId && googleId !== 'YOUR_GOOGLE_CLIENT_ID') {
        this.googleClientId = googleId;
        localStorage.setItem('GOOGLE_CLIENT_ID', googleId);
        console.log('✅ Google OAuth Client ID saved');
      }
    }
    
    if (!this.isGitHubConfigured()) {
      const githubId = prompt(
        'Please enter your GitHub OAuth Client ID:\n\n' +
        'Get it from: https://github.com/settings/developers\n' +
        'See setup guide: IDEA_FORGE_OAUTH_SETUP.md'
      );
      
      if (githubId && githubId !== 'YOUR_GITHUB_CLIENT_ID') {
        this.githubClientId = githubId;
        localStorage.setItem('GITHUB_CLIENT_ID', githubId);
        console.log('✅ GitHub OAuth Client ID saved');
      }
    }
    
    return this.isGoogleConfigured() && this.isGitHubConfigured();
  }

  /**
   * Get configuration status for debugging
   */
  getStatus() {
    return {
      google: {
        configured: this.isGoogleConfigured(),
        value: this.googleClientId ? 
          this.googleClientId.substring(0, 20) + '...' : 
          'Not configured'
      },
      github: {
        configured: this.isGitHubConfigured(),
        value: this.githubClientId || 'Not configured'
      },
      sources: this.configSources
    };
  }
}

// Make OAuthConfig globally available
window.OAuthConfig = OAuthConfig;

console.log('✅ OAuth Configuration Manager loaded');
