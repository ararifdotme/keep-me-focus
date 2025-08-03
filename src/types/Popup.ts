/**
 * Popup Interface Definitions
 * 
 * Type definitions for the extension popup functionality,
 * including settings and message passing between popup and content scripts.
 */

/**
 * Settings managed by the popup interface.
 * These are quick toggles that users can enable/disable from the popup.
 */
export interface PopupSettings {
  /** Whether YouTube Shorts should be hidden from video lists */
  hideYoutubeShorts: boolean;

  /** Whether Halal Mode is enabled (future feature) */
  halalMode: boolean; // For future implementation
}

/**
 * Message structure for communication between popup and content scripts.
 * Used to send commands and state changes.
 */
export interface MessageData {
  /** The action/command to execute */
  action: string;

  /** Whether a feature should be enabled (optional) */
  enabled?: boolean;
}
