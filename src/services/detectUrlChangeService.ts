/**
 * URL Change Detection Service
 * 
 * Detects when the URL changes in Single Page Applications (SPAs) like YouTube.
 * Uses a polling mechanism to monitor URL changes and dispatches custom events
 * to notify other parts of the extension when navigation occurs.
 */

import SchedulerService from "./schedulerService";

/**
 * Singleton service for detecting URL changes in web pages.
 * Essential for SPAs where traditional page load events don't fire on navigation.
 */
export default class DetectUrlChangeService {
  /** Singleton instance */
  private static instance: DetectUrlChangeService;

  private constructor() { }

  /**
   * Get the singleton instance of the URL change detection service.
   * @returns The DetectUrlChangeService instance
   */
  public static getInstance(): DetectUrlChangeService {
    if (!DetectUrlChangeService.instance) {
      DetectUrlChangeService.instance = new DetectUrlChangeService();
    }
    return DetectUrlChangeService.instance;
  }

  /**
   * Start monitoring URL changes.
   * Sets up a scheduled task that periodically checks for URL changes
   * and dispatches 'urlChanged' events when changes are detected.
   */
  public run(): void {
    /** Store the last known URL to detect changes */
    let lastUrl: string | null = null;

    // Add a scheduled task to check for URL changes periodically
    SchedulerService.getInstance().addTask(async () => {
      const currentUrl: string = window.location.href;

      // Check if the URL has changed since the last check
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;

        // Dispatch a custom event to notify listeners of the URL change
        const event = new CustomEvent('urlChanged', { detail: { url: currentUrl } });
        window.dispatchEvent(event);
      }
    });
  }
}