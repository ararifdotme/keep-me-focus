/**
 * Storage Keys Configuration
 * 
 * Centralized storage keys for the Keep Me Focus extension.
 * All browser storage keys are defined here to maintain consistency
 * and avoid duplication across the codebase.
 */

// Storage keys configuration for the Keep Me Focus extension
export const STORAGE_KEYS = {
  /** Main extension settings from popup (sync storage) */
  POPUP_SETTINGS: 'keepMeFocus_popupSettings',

  /** Site rules configuration (sync storage) */
  SITE_RULES: 'keepMeFocus_siteRules',

  /** Extension startup time tracking (local storage) */
  STARTUP_TIME: 'keepMeFocus_lastStartupTime'
} as const;
