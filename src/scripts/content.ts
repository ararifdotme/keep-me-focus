/**
 * Content Script
 * 
 * Injected into all web pages to monitor URL changes, apply site rules,
 * and handle YouTube Shorts hiding functionality. This script runs in the
 * context of web pages and can manipulate their content.
 */

import DetectUrlChangeService from "../services/detectUrlChangeService";
import { RulesService } from "../services/rulesService";
import { YouTubeShortsService } from "../services/youtubeShortsService";

// Initialize YouTube Shorts service
YouTubeShortsService.getInstance();

// Initialize existing site rules functionality
DetectUrlChangeService.getInstance().run();

/**
 * Listen for URL changes and apply site rules.
 * This handles the main blocking/limiting functionality.
 */
window.addEventListener('urlChanged', async (event: any) => {
  await RulesService.getInstance().applyRule();
});