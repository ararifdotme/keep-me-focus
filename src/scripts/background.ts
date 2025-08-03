/**
 * Background Script
 * 
 * The main background service worker for the Keep Me Focus extension.
 * Handles extension lifecycle events and provides services to other scripts.
 * Runs persistently in the background and manages extension state.
 */

import browser from 'webextension-polyfill';
import { STORAGE_KEYS } from '../config/storage';
import { RULE_PRESETS } from '../config/presets';
import { SiteRule } from '../types/SiteRule';

/**
 * Event listener for extension startup.
 * Records the startup time for uptime calculations.
 */
browser.runtime.onStartup.addListener(() => {
  browser.storage.local.set({ [STORAGE_KEYS.STARTUP_TIME]: Date.now() });
});

/**
 * Event listener for extension installation or update.
 * Records the installation/update time as startup time and sets default settings.
 */
browser.runtime.onInstalled.addListener(async () => {
  // Set startup time for uptime tracking
  browser.storage.local.set({ [STORAGE_KEYS.STARTUP_TIME]: Date.now() });
  
  // Initialize default popup settings for new installations
  const existingSettings = await browser.storage.sync.get(STORAGE_KEYS.POPUP_SETTINGS);
  if (!existingSettings[STORAGE_KEYS.POPUP_SETTINGS]) {
    await browser.storage.sync.set({
      [STORAGE_KEYS.POPUP_SETTINGS]: {
        hideYoutubeShorts: true,
        halalMode: false
      }
    });
  }

  // Apply default "block-youtube-shorts" preset for new installations
  const existingRules = await browser.storage.sync.get(STORAGE_KEYS.SITE_RULES);
  if (!existingRules[STORAGE_KEYS.SITE_RULES] || (existingRules[STORAGE_KEYS.SITE_RULES] as SiteRule[]).length === 0) {
    const youtubeBlockPreset = RULE_PRESETS['block-youtube-shorts'];
    const defaultRule: SiteRule = {
      id: `preset_block-youtube-shorts_${Date.now()}`,
      title: youtubeBlockPreset.title,
      pattern: youtubeBlockPreset.pattern,
      matchType: youtubeBlockPreset.matchType,
      action: youtubeBlockPreset.action,
      enabled: true
    };
    
    await browser.storage.sync.set({
      [STORAGE_KEYS.SITE_RULES]: [defaultRule]
    });
  }
});

/**
 * Message handler for inter-script communication.
 * Currently handles uptime calculation requests.
 * 
 * @param message - The message object from other scripts
 * @returns Promise with response data or rejection
 */
browser.runtime.onMessage.addListener(async (message: unknown) => {
  // Type guard to ensure message has expected structure
  if (typeof message === 'object' && message !== null && 'action' in message) {
    // Handle uptime calculation request
    if (message.action === 'getUptime') {
      const lastStartupTime = await browser.storage.local.get(STORAGE_KEYS.STARTUP_TIME);
      const uptimeSec = (Date.now() - (lastStartupTime[STORAGE_KEYS.STARTUP_TIME] as number || Date.now())) / 1000;
      return { uptimeSec };
    }
  }

  // Reject unknown message types
  return Promise.reject(new Error('Unknown action'));
});