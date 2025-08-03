/**
 * Content Script
 * 
 * Injected into all web pages to monitor URL changes, apply site rules,
 * and handle YouTube Shorts hiding functionality. This script runs in the
 * context of web pages and can manipulate their content.
 */

import DetectUrlChangeService from "../services/detectUrlChangeService";
import { RulesService } from "../services/rulesService";
import browser from 'webextension-polyfill';
import { STORAGE_KEYS } from '../config/storage';
import { PopupSettings, MessageData } from '../types/Popup';

/**
 * YouTube Shorts Hiding Functionality
 * 
 * Handles hiding YouTube Shorts suggestions from video lists on YouTube.
 * Uses DOM manipulation and mutation observers to dynamically hide content.
 */
class YouTubeShortsHider {
  /** Whether shorts hiding is currently active */
  private isHiding: boolean = false;

  /** MutationObserver for watching DOM changes */
  private observer: MutationObserver | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the YouTube Shorts hider.
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

    // 2. Find all links and check if URL is YouTube Shorts
    const allLinks = document.querySelectorAll('a[href*="/shorts/"]');

    allLinks.forEach(link => {
      // Find the parent container that represents the video item
      const videoContainer = link.closest('ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer, ytd-reel-item-renderer, ytm-video-with-context-renderer, div[class*="video"]');

      if (videoContainer instanceof HTMLElement) {
        videoContainer.style.display = 'none';
        videoContainer.setAttribute('data-hidden-by-focus', 'true');
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

// Initialize YouTube Shorts hider
const youtubeShortsHider = new YouTubeShortsHider();

// Initialize existing site rules functionality
DetectUrlChangeService.getInstance().run();

/**
 * Listen for URL changes and apply site rules.
 * This handles the main blocking/limiting functionality.
 */
window.addEventListener('urlChanged', async (event: any) => {
  await RulesService.getInstance().applyRule();
});