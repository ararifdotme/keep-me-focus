/**
 * Popup Script
 * 
 * Handles the extension popup interface functionality.
 * Manages quick toggle settings and communication with content scripts.
 * Provides a simple interface for users to control extension features.
 */

import '../styles/main.css';
import browser from 'webextension-polyfill';
import { RulesService } from '../services/rulesService';
import { STORAGE_KEYS } from '../config/storage';
import { PopupSettings } from '../types/Popup';

/**
 * Popup Controller Class
 * 
 * Manages all popup functionality including settings, toggles, and UI updates.
 * Coordinates between the popup interface and the extension's core services.
 */
class PopupController {
  /** Service for managing site rules */
  private rulesService: RulesService;

  constructor() {
    this.rulesService = RulesService.getInstance();
    this.initialize();
  }

  /**
   * Initialize the popup controller.
   * Sets up UI, loads settings, and establishes event listeners.
   */
  private async initialize(): Promise<void> {
    // Load current settings and update UI elements
    await this.loadAndUpdateUI();

    // Set up event listeners for user interactions
    this.setupEventListeners();

    // Update the rules count display
    await this.updateRulesCount();
  }

  /**
   * Load settings from storage and update the UI elements.
   * Synchronizes the toggle states with stored preferences.
   */
  private async loadAndUpdateUI(): Promise<void> {
    const settings = await this.loadSettings();

    // Get toggle elements
    const hideYoutubeShortsToggle = document.getElementById('hideYoutubeShortsToggle') as HTMLInputElement;
    const halalModeToggle = document.getElementById('halalModeToggle') as HTMLInputElement;

    // Update toggle states to match settings
    if (hideYoutubeShortsToggle) {
      hideYoutubeShortsToggle.checked = settings.hideYoutubeShorts;
    }

    if (halalModeToggle) {
      halalModeToggle.checked = settings.halalMode;
    }
  }

  /**
   * Load popup settings from browser storage.
   * @returns PopupSettings object with current preferences
   */
  private async loadSettings(): Promise<PopupSettings> {
    try {
      const result = await browser.storage.sync.get(STORAGE_KEYS.POPUP_SETTINGS);
      const defaultSettings: PopupSettings = {
        hideYoutubeShorts: true,
        halalMode: false
      };
      return {
        ...defaultSettings,
        ...(result[STORAGE_KEYS.POPUP_SETTINGS] as PopupSettings || {})
      };
    } catch (error) {
      console.error('Error loading popup settings:', error);
      return { hideYoutubeShorts: true, halalMode: false };
    }
  }

  /**
   * Save popup settings to browser storage.
   * @param settings - The settings object to save
   */
  private async saveSettings(settings: PopupSettings): Promise<void> {
    try {
      await browser.storage.sync.set({ [STORAGE_KEYS.POPUP_SETTINGS]: settings });
    } catch (error) {
      console.error('Error saving popup settings:', error);
    }
  }

  /**
   * Set up event listeners for popup UI elements.
   * Handles toggle changes and button clicks.
   */
  private setupEventListeners(): void {
    const hideYoutubeShortsToggle = document.getElementById('hideYoutubeShortsToggle') as HTMLInputElement;
    const halalModeToggle = document.getElementById('halalModeToggle') as HTMLInputElement;
    const openOptionsBtn = document.getElementById('openOptionsBtn') as HTMLButtonElement;

    // Handle YouTube Shorts toggle changes
    if (hideYoutubeShortsToggle) {
      hideYoutubeShortsToggle.addEventListener('change', async (e) => {
        const isEnabled = (e.target as HTMLInputElement).checked;
        await this.toggleYoutubeShorts(isEnabled);
      });
    }

    // Handle Halal Mode toggle changes (currently disabled)
    if (halalModeToggle) {
      halalModeToggle.addEventListener('change', async (e) => {
        const isEnabled = (e.target as HTMLInputElement).checked;
        await this.toggleHalalMode(isEnabled);
      });
    }

    // Handle options page button click
    if (openOptionsBtn) {
      openOptionsBtn.addEventListener('click', () => {
        browser.runtime.openOptionsPage();
        window.close();
      });
    }
  }

  /**
   * Toggle YouTube Shorts hiding functionality.
   * Saves setting and sends message to content scripts.
   * 
   * @param enabled - Whether YouTube Shorts should be hidden
   */
  private async toggleYoutubeShorts(enabled: boolean): Promise<void> {
    try {
      // Update and save settings
      const settings = await this.loadSettings();
      settings.hideYoutubeShorts = enabled;
      await this.saveSettings(settings);

      // Send message to content scripts to apply/remove YouTube Shorts hiding
      try {
        const tabs = await browser.tabs.query({ url: "*://*.youtube.com/*" });
        for (const tab of tabs) {
          if (tab.id) {
            await browser.tabs.sendMessage(tab.id, {
              action: 'toggleYoutubeShorts',
              enabled: enabled
            });
          }
        }
      } catch (error) {
        // Content script might not be loaded yet, that's okay
        console.log('Could not send message to YouTube tabs (this is normal if no YouTube tabs are open)');
      }

      // Show user feedback
      this.showNotification(enabled ? 'YouTube Shorts hidden' : 'YouTube Shorts shown');
    } catch (error) {
      console.error('Error toggling YouTube Shorts:', error);
      this.showNotification('Error updating setting', true);
    }
  }

  /**
   * Toggle Halal Mode functionality (future feature).
   * Currently only saves the setting and shows a notification.
   * 
   * @param enabled - Whether Halal Mode should be enabled
   */
  private async toggleHalalMode(enabled: boolean): Promise<void> {
    try {
      // Update and save settings
      const settings = await this.loadSettings();
      settings.halalMode = enabled;
      await this.saveSettings(settings);

      // Show coming soon message
      this.showNotification('Halal Mode coming soon!');
    } catch (error) {
      console.error('Error toggling Halal Mode:', error);
      this.showNotification('Error updating setting', true);
    }
  }

  /**
   * Update the rules count display in the popup.
   * Shows how many site rules are currently active.
   */
  private async updateRulesCount(): Promise<void> {
    try {
      const rules = await this.rulesService.loadRules();
      const activeRules = rules.filter(rule => rule.enabled);
      const rulesCountText = document.getElementById('rulesCountText');

      if (rulesCountText) {
        rulesCountText.textContent = `${activeRules.length} active rule${activeRules.length !== 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error('Error updating rules count:', error);
      const rulesCountText = document.getElementById('rulesCountText');
      if (rulesCountText) {
        rulesCountText.textContent = 'Error loading rules';
      }
    }
  }

  /**
   * Show a temporary notification to the user.
   * Creates a floating notification that auto-disappears.
   * 
   * @param message - The message to display
   * @param isError - Whether this is an error message (changes styling)
   */
  private showNotification(message: string, isError: boolean = false): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-2 left-2 right-2 px-3 py-2 rounded-md text-sm font-medium z-50 ${isError
      ? 'bg-red-100 text-red-800 border border-red-200'
      : 'bg-green-100 text-green-800 border border-green-200'
      }`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 2 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }
}

// Initialize the popup controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});