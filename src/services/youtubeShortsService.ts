/**
 * YouTube Shorts Service
 * 
 * Handles hiding YouTube Shorts suggestions from video lists on YouTube.
 * Uses DOM manipulation and mutation observers to dynamically hide content.
 */

import browser from 'webextension-polyfill';
import { STORAGE_KEYS } from '../config/storage';
import { PopupSettings, MessageData } from '../types/Popup';

export class YouTubeShortsService {
  /** Whether shorts hiding is currently active */
  private isHiding: boolean = false;

  /** MutationObserver for watching DOM changes */
  private observer: MutationObserver | null = null;

  /** Singleton instance */
  private static instance: YouTubeShortsService | null = null;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance of YouTubeShortsService
   */
  public static getInstance(): YouTubeShortsService {
    if (!YouTubeShortsService.instance) {
      YouTubeShortsService.instance = new YouTubeShortsService();
    }
    return YouTubeShortsService.instance;
  }

  /**
   * Initialize the YouTube Shorts service.
   * Sets up message listeners and loads initial settings.
   */
  private async initialize(): Promise<void> {
    // Load initial settings from storage
    await this.loadSettings();

    // Listen for toggle messages from popup
    browser.runtime.onMessage.addListener((message: unknown) => {
      const messageData = message as MessageData;
      if (messageData.action === 'toggleYoutubeShorts') {
        this.isHiding = messageData.enabled || false;
        if (this.isHiding) {
          this.startHiding();
        } else {
          this.stopHiding();
        }
      }
    });

    // Start hiding if enabled in settings
    if (this.isHiding) {
      this.startHiding();
    }
  }

  /**
   * Load YouTube Shorts hiding settings from browser storage.
   */
  private async loadSettings(): Promise<void> {
    try {
      const result = await browser.storage.sync.get(STORAGE_KEYS.POPUP_SETTINGS);
      const settings = result[STORAGE_KEYS.POPUP_SETTINGS] as PopupSettings;
      this.isHiding = settings?.hideYoutubeShorts || false;
    } catch (error) {
      console.error('Error loading YouTube Shorts settings:', error);
      this.isHiding = false;
    }
  }

  /**
   * Start hiding YouTube Shorts on the current page.
   * Sets up DOM observation and hides existing content.
   */
  private startHiding(): void {
    if (!this.isYouTube()) return;

    // Function to safely start DOM observation
    const startObserving = () => {
      if (document.body && (document.readyState === 'loading' || document.readyState === 'interactive' || document.readyState === 'complete')) {
        // Set up mutation observer to watch for new content
        this.observer = new MutationObserver(() => {
          this.hideShorts();
        });

        this.observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Hide existing shorts immediately
        this.hideShorts();
      } else {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', startObserving);
        } else {
          setTimeout(startObserving, 100);
        }
      }
    };

    startObserving();
  }

  /**
   * Stop hiding YouTube Shorts and show previously hidden content.
   * Disconnects the mutation observer and restores visibility.
   */
  private stopHiding(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Show all previously hidden shorts
    this.showShorts();
  }

  /**
   * Check if the current page is YouTube.
   * @returns True if on YouTube, false otherwise
   */
  private isYouTube(): boolean {
    return window.location.hostname.includes('youtube.com');
  }

  /**
   * Hide YouTube Shorts elements on the current page.
   * Finds all links pointing to YouTube Shorts and hides their containers.
   */
  private hideShorts(): void {
    // 1. Check if site is YouTube
    if (!this.isHiding || !this.isYouTube()) return;

    document.querySelectorAll('a#endpoint[title="Shorts"]').forEach(link => {
      // Hide the short navigation link itself if it exists
      if (link instanceof HTMLElement) {
        link.style.display = 'none';
        link.setAttribute('data-hidden-by-focus', 'true');
      }
    });

    // 2. Find all links and check if URL is YouTube Shorts
    const allLinks = document.querySelectorAll('a[href*="/shorts/"]');

    allLinks.forEach(link => {
      // Find the parent container that represents the shorts section
      let shortContainer = link.closest('ytd-reel-shelf-renderer, ytd-rich-section-renderer');

      if (!shortContainer) {
        // If no specific container found, try to find a short item container
        shortContainer = link.closest('ytd-rich-item-renderer');
      }

      if (!shortContainer) {
        // If still not found, use the link's parent element
        shortContainer = link.parentElement;
      }

      if (shortContainer instanceof HTMLElement) {
        shortContainer.style.display = 'none';
        shortContainer.setAttribute('data-hidden-by-focus', 'true');
      }
    });
  }

  /**
   * Show all previously hidden YouTube Shorts elements.
   * Restores visibility of elements marked as hidden by this extension.
   */
  private showShorts(): void {
    // Show all previously hidden shorts
    const hiddenElements = document.querySelectorAll('[data-hidden-by-focus="true"]');
    hiddenElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.display = '';
        element.removeAttribute('data-hidden-by-focus');
      }
    });
  }
}
