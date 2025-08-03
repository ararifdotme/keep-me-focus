/**
 * User Interface Service
 * 
 * Comprehensive UI management service for the browser extension's options page.
 * Handles rule rendering, form management, sortable functionality, and all user interactions
 * related to site rule management. Provides a centralized interface for UI operations.
 */

import { SiteRule, SiteRuleActionType } from '../types/SiteRule';
import Sortable from 'sortablejs';
import assertNever from '../utils/assertNever';
import DOMPurify from 'dompurify';

/**
 * Service class for managing UI operations and interactions in the options page.
 * Handles rule display, form management, drag-and-drop sorting, and event handling.
 */
export class UIService {
  /** Singleton instance */
  private static instance: UIService;

  /** Sortable.js instance for drag-and-drop rule reordering */
  private sortableInstance: Sortable | null = null;

  /** Event handler for rule updates */
  private onRuleUpdate?: (ruleId: string, updates: Partial<SiteRule>) => void;

  /** Event handler for rule deletion */
  private onRuleDelete?: (ruleId: string) => void;

  /** Event handler for rule toggle (enable/disable) */
  private onRuleToggle?: (ruleId: string) => void;

  /** Event handler for rule editing */
  private onRuleEdit?: (ruleId: string) => void;

  /** Event handler for rule reordering */
  private onRuleReorder?: (newOrder: string[]) => void;

  private constructor() { }

  /**
   * Get the singleton instance of the UI service.
   * @returns The UIService instance
   */
  public static getInstance(): UIService {
    if (!UIService.instance) {
      UIService.instance = new UIService();
    }
    return UIService.instance;
  }

  /**
   * Set up event handlers for rule operations.
   * @param handlers - Object containing callback functions for various rule operations
   */
  public setEventHandlers(handlers: {
    onRuleUpdate?: (ruleId: string, updates: Partial<SiteRule>) => void;
    onRuleDelete?: (ruleId: string) => void;
    onRuleToggle?: (ruleId: string) => void;
    onRuleEdit?: (ruleId: string) => void;
    onRuleReorder?: (newOrder: string[]) => void;
  }) {
    this.onRuleUpdate = handlers.onRuleUpdate;
    this.onRuleDelete = handlers.onRuleDelete;
    this.onRuleToggle = handlers.onRuleToggle;
    this.onRuleEdit = handlers.onRuleEdit;
    this.onRuleReorder = handlers.onRuleReorder;
  }

  /**
   * Initialize drag-and-drop sortable functionality for the rules list.
   */
  public initializeSortable(): void {
    const rulesList = document.getElementById('rules-list') as HTMLUListElement;
    if (!rulesList) return;

    this.sortableInstance = Sortable.create(rulesList, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      filter: '#empty-state',
      onEnd: (evt) => {
        if (evt.oldIndex !== evt.newIndex) {
          const ruleIds: string[] = [];
          const ruleItems = rulesList.querySelectorAll('li[data-rule-id]');
          ruleItems.forEach(item => {
            const ruleId = (item as HTMLElement).dataset.ruleId;
            if (ruleId) ruleIds.push(ruleId);
          });

          if (this.onRuleReorder) {
            this.onRuleReorder(ruleIds);
          }
        }
      }
    });
  }

  /**
   * Render all rules in the UI.
   * @param rules - Array of site rules to render
   */
  public renderRules(rules: SiteRule[]): void {
    const rulesList = document.getElementById('rules-list') as HTMLUListElement;
    const emptyState = document.getElementById('empty-state') as HTMLLIElement;

    if (!rulesList || !emptyState) return;

    // Clear existing rules (except empty state)
    const existingRules = rulesList.querySelectorAll('li:not(#empty-state)');
    existingRules.forEach(rule => rule.remove());

    if (rules.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    rules.forEach(rule => {
      const listItem = this.createRuleElement(rule);
      rulesList.appendChild(listItem);
    });
  }

  /**
   * Create a DOM element for a single rule.
   * @param rule - The site rule to create an element for
   * @returns HTML list item element representing the rule
   */
  private createRuleElement(rule: SiteRule): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'p-4 hover:bg-gray-50 transition-colors cursor-move border-l-4 border-transparent hover:border-blue-300';
    li.dataset.ruleId = rule.id;

    // Format action text for display
    const actionText = rule.action.type === 'limit'
      ? (() => {
        const parts = [];
        if (rule.action.allowedMinutes > 0) {
          parts.push(`${rule.action.allowedMinutes}min allowed`);
        }
        if (rule.action.resetAfterMinutes > 0) {
          parts.push(`resets every ${rule.action.resetAfterMinutes}min`);
        }
        if (rule.action.delayMinutes > 0) {
          parts.push(`${rule.action.delayMinutes}min delay`);
        }
        return parts.length > 0 ? `Limit (${parts.join(', ')})` : 'Limit';
      })()
      : rule.action.type.charAt(0).toUpperCase() + rule.action.type.slice(1);

    li.innerHTML = DOMPurify.sanitize(`
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0 flex-1">
          <svg class="w-4 h-4 text-gray-400 drag-handle mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
          </svg>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3 flex-wrap">
              <h4 class="font-medium text-gray-900 truncate">${this.escapeHtml(rule.title)}</h4>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getActionBadgeClass(rule.action.type)} flex-shrink-0">
                ${actionText}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex-shrink-0">
                ${rule.matchType}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1 break-all">
              <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs">${this.escapeHtml(rule.pattern)}</code>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              ${rule.enabled ? 'checked' : ''} 
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              data-rule-id="${rule.id}"
              data-action="toggle"
            >
            <span class="ml-2 text-sm text-gray-600 hidden sm:inline">Enabled</span>
          </label>
          <button 
            data-rule-id="${rule.id}"
            data-action="edit"
            class="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors flex-shrink-0"
            title="Edit rule"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button 
            data-rule-id="${rule.id}"
            data-action="delete"
            class="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors flex-shrink-0"
            title="Delete rule"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    `);

    // Add event listeners
    this.attachRuleEventListeners(li);

    return li;
  }

  /**
   * Attach event listeners to rule elements for user interactions.
   * @param element - The HTML element to attach listeners to
   */
  private attachRuleEventListeners(element: HTMLLIElement): void {
    // Toggle rule enabled/disabled
    const toggleCheckbox = element.querySelector('input[data-action="toggle"]') as HTMLInputElement;
    if (toggleCheckbox) {
      toggleCheckbox.addEventListener('change', (e) => {
        const ruleId = (e.target as HTMLInputElement).dataset.ruleId;
        if (ruleId && this.onRuleToggle) {
          this.onRuleToggle(ruleId);
        }
      });
    }

    // Edit rule
    const editButton = element.querySelector('button[data-action="edit"]') as HTMLButtonElement;
    if (editButton) {
      editButton.addEventListener('click', (e) => {
        const ruleId = (e.target as HTMLButtonElement).closest('button')?.dataset.ruleId;
        if (ruleId && this.onRuleEdit) {
          this.onRuleEdit(ruleId);
        }
      });
    }

    // Delete rule
    const deleteButton = element.querySelector('button[data-action="delete"]') as HTMLButtonElement;
    if (deleteButton) {
      deleteButton.addEventListener('click', (e) => {
        const ruleId = (e.target as HTMLButtonElement).closest('button')?.dataset.ruleId;
        if (ruleId && this.onRuleDelete) {
          this.onRuleDelete(ruleId);
        }
      });
    }
  }

  /**
   * Get CSS classes for action badges based on rule action type.
   * @param actionType - The type of action (allow, block, limit)
   * @returns CSS class string for styling the badge
   */
  private getActionBadgeClass(actionType: SiteRuleActionType): string {
    switch (actionType) {
      case SiteRuleActionType.Allow:
        return 'bg-green-100 text-green-800';
      case SiteRuleActionType.Block:
        return 'bg-red-100 text-red-800';
      case SiteRuleActionType.Limit:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return assertNever(actionType);
    }
  }

  /**
   * Escape HTML to prevent XSS attacks.
   * @param text - Text to escape
   * @returns HTML-safe escaped text
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show or hide limit options based on selected action type.
   * Called when the action select dropdown changes.
   */
  public toggleLimitOptions(): void {
    const actionSelect = document.getElementById('rule-action') as HTMLSelectElement;
    const limitOptions = document.getElementById('limit-options') as HTMLElement;

    if (!actionSelect || !limitOptions) return;

    if (actionSelect.value === 'limit') {
      limitOptions.classList.remove('hidden');
    } else {
      limitOptions.classList.add('hidden');
    }
  }

  /**
   * Clear all form inputs and reset to default values.
   */
  public clearForm(): void {
    (document.getElementById('rule-title') as HTMLInputElement).value = '';
    (document.getElementById('rule-pattern') as HTMLInputElement).value = '';
    (document.getElementById('rule-match-type') as HTMLSelectElement).value = 'equalTo';
    (document.getElementById('rule-action') as HTMLSelectElement).value = 'allow';
    (document.getElementById('rule-allowed-minutes') as HTMLInputElement).value = '';
    (document.getElementById('rule-reset-after-minutes') as HTMLInputElement).value = '';
    (document.getElementById('rule-delay-minutes') as HTMLInputElement).value = '';

    // Hide limit options
    const limitOptions = document.getElementById('limit-options') as HTMLElement;
    limitOptions?.classList.add('hidden');
  }

  /**
   * Populate form fields with rule data for editing.
   * @param rule - The rule to populate the form with
   */
  public populateForm(rule: SiteRule): void {
    (document.getElementById('rule-title') as HTMLInputElement).value = rule.title;
    (document.getElementById('rule-pattern') as HTMLInputElement).value = rule.pattern;
    (document.getElementById('rule-match-type') as HTMLSelectElement).value = rule.matchType;
    (document.getElementById('rule-action') as HTMLSelectElement).value = rule.action.type;

    if (rule.action.type === 'limit') {
      (document.getElementById('rule-allowed-minutes') as HTMLInputElement).value = rule.action.allowedMinutes.toString();
      (document.getElementById('rule-reset-after-minutes') as HTMLInputElement).value = rule.action.resetAfterMinutes.toString();
      (document.getElementById('rule-delay-minutes') as HTMLInputElement).value = rule.action.delayMinutes.toString();
    }

    this.toggleLimitOptions();
  }
}
