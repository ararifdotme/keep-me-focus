/**
 * Form Management Service
 * 
 * Provides utilities for form handling and validation within the browser extension.
 * Manages form state, validation, data processing, and user feedback for various UI components.
 */

import { SiteRule, SiteRuleActionType, SiteRuleMatchType } from '../types/SiteRule';

/**
 * Form data interface for rule creation/editing
 */
interface RuleFormData {
  title: string;
  pattern: string;
  matchType: SiteRuleMatchType;
  action: SiteRule['action'];
}

/**
 * Service class for managing form operations throughout the extension.
 * Handles form validation, data processing, user feedback, and state management.
 */
export default class FormService {
  /** Singleton instance */
  private static instance: FormService;

  private constructor() { }

  /**
   * Get the singleton instance of the form service.
   * @returns The FormService instance
   */
  public static getInstance(): FormService {
    if (!FormService.instance) {
      FormService.instance = new FormService();
    }
    return FormService.instance;
  }

  /**
   * Extract and validate form data from the rule form.
   * @returns Validated form data or null if validation fails
   */
  public getFormData(): RuleFormData | null {
    const titleElement = document.getElementById('rule-title') as HTMLInputElement;
    const patternElement = document.getElementById('rule-pattern') as HTMLInputElement;
    const matchTypeElement = document.getElementById('rule-match-type') as HTMLSelectElement;
    const actionElement = document.getElementById('rule-action') as HTMLSelectElement;

    if (!titleElement || !patternElement || !matchTypeElement || !actionElement) {
      console.error('Required form elements not found');
      return null;
    }

    const title = titleElement.value.trim();
    const pattern = patternElement.value.trim();
    const matchType = matchTypeElement.value as SiteRuleMatchType;
    const actionType = actionElement.value as SiteRuleActionType;

    // Basic validation
    if (!title) {
      this.showError('Title is required');
      return null;
    }

    if (!pattern) {
      this.showError('URL pattern is required');
      return null;
    }

    // Build action object based on action type
    let action: SiteRule['action'];

    if (actionType === SiteRuleActionType.Limit) {
      const allowedMinutesElement = document.getElementById('rule-allowed-minutes') as HTMLInputElement;
      const resetAfterMinutesElement = document.getElementById('rule-reset-after-minutes') as HTMLInputElement;
      const delayMinutesElement = document.getElementById('rule-delay-minutes') as HTMLInputElement;

      const allowedMinutes = parseInt(allowedMinutesElement?.value || '0');
      const resetAfterMinutes = parseInt(resetAfterMinutesElement?.value || '0');
      const delayMinutes = parseInt(delayMinutesElement?.value || '0');

      if (allowedMinutes <= 0) {
        this.showError('Allowed minutes must be greater than 0');
        return null;
      }

      if (resetAfterMinutes <= 0) {
        this.showError('Reset period must be greater than 0');
        return null;
      }

      action = {
        type: SiteRuleActionType.Limit,
        allowedMinutes,
        resetAfterMinutes,
        delayMinutes,
        usedMinutes: 0,
        lastResetAt: Date.now(),
        lastUsedAt: 0
      };
    } else {
      action = { type: actionType };
    }

    return {
      title,
      pattern,
      matchType,
      action
    };
  }

  /**
   * Show a success message to the user.
   * @param message - Success message to display
   */
  public showSuccess(message: string): void {
    this.showNotification(message, 'success');
  }

  /**
   * Show an error message to the user.
   * @param message - Error message to display
   */
  public showError(message: string): void {
    this.showNotification(message, 'error');
  }

  /**
   * Show a confirmation dialog to the user.
   * @param message - Confirmation message
   * @returns True if user confirmed, false otherwise
   */
  public showConfirmation(message: string): boolean {
    return confirm(message);
  }

  /**
   * Display a notification message with specified type.
   * @param message - Message to display
   * @param type - Type of notification (success, error, info)
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Try to use a notification element if it exists
    const notificationElement = document.getElementById('notification');

    if (notificationElement) {
      notificationElement.textContent = message;
      notificationElement.className = `notification notification-${type}`;
      notificationElement.style.display = 'block';

      // Auto-hide after 3 seconds
      setTimeout(() => {
        notificationElement.style.display = 'none';
      }, 3000);
    } else {
      // Fallback to alert for error, console.log for success
      if (type === 'error') {
        alert(message);
      } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
      }
    }
  }

  /**
   * Validate a URL pattern based on match type.
   * @param pattern - URL pattern to validate
   * @param matchType - Type of matching to validate against
   * @returns True if pattern is valid for the match type
   */
  public validatePattern(pattern: string, matchType: SiteRuleMatchType): boolean {
    if (!pattern.trim()) {
      return false;
    }

    switch (matchType) {
      case 'equalTo':
        // For exact match, should be a valid URL
        try {
          new URL(pattern);
          return true;
        } catch {
          return false;
        }

      case 'contains':
        // For contains, any non-empty string is valid
        return pattern.trim().length > 0;

      case 'regex':
        // For regex, validate that it's a valid regex pattern
        try {
          new RegExp(pattern);
          return true;
        } catch {
          return false;
        }

      default:
        return false;
    }
  }

  /**
   * Reset form validation state and clear any error messages.
   */
  public clearValidationErrors(): void {
    const notificationElement = document.getElementById('notification');
    if (notificationElement) {
      notificationElement.style.display = 'none';
    }
  }
}
