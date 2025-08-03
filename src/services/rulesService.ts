/**
 * Site Rules Management Service
 * 
 * Core service for managing website access rules including blocking, allowing, and time limiting.
 * Handles rule storage, matching, enforcement, and provides a comprehensive API for rule management.
 * Supports multiple rule types: Allow, Block, and Limit with various matching patterns.
 */

import { SiteRule, SiteRuleActionType } from '../types/SiteRule';
import browser from 'webextension-polyfill';
import { siteRulesMatcher } from '../utils/siteRulesMatcher';
import assertNever from '../utils/assertNever';
import { STORAGE_KEYS } from '../config/storage';

/**
 * Singleton service for managing site access rules and their enforcement.
 * Provides comprehensive rule management including CRUD operations, rule matching,
 * and enforcement mechanisms for different rule types.
 */
export class RulesService {
  /** Singleton instance */
  private static instance: RulesService;

  /** In-memory cache of loaded rules */
  private rules: SiteRule[] = [];

  /** Flag indicating whether rules have been loaded from storage */
  private rulesLoaded: boolean = false;

  /** Flag to prevent multiple limit rule update intervals from running simultaneously */
  private limitRuleUpdateIntervalRunning: boolean = false;

  private constructor() { }

  /**
   * Get the singleton instance of the rules service.
   * @returns The RulesService instance
   */
  public static getInstance(): RulesService {
    if (!RulesService.instance) {
      RulesService.instance = new RulesService();
    }
    return RulesService.instance;
  }

  /**
   * Load rules from browser storage into memory.
   * @returns Promise that resolves to the loaded rules array
   */
  public async loadRules(): Promise<SiteRule[]> {
    this.rulesLoaded = true;
    try {
      const result = await browser.storage.sync.get(STORAGE_KEYS.SITE_RULES);
      this.rules = (result[STORAGE_KEYS.SITE_RULES] as SiteRule[]) || [];
      return this.rules;
    } catch (error) {
      console.error('Error loading rules:', error);
      this.rules = [];
      return this.rules;
    }
  }

  /**
   * Save current rules to browser storage.
   * @returns Promise that resolves when rules are saved
   */
  public async saveRules(): Promise<void> {
    try {
      await browser.storage.sync.set({ [STORAGE_KEYS.SITE_RULES]: this.rules });
    } catch (error) {
      console.error('Error saving rules:', error);
    }
  }

  /**
   * Get a copy of all current rules.
   * @returns Array of all site rules
   */
  public getRules(): SiteRule[] {
    return [...this.rules];
  }

  /**
   * Generate a unique ID for new rules.
   * @returns Unique string identifier
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Add a new rule to the collection.
   * @param ruleData - Rule data without ID (ID will be generated)
   * @returns Promise that resolves to the newly created rule
   */
  public async addRule(ruleData: Omit<SiteRule, 'id'>): Promise<SiteRule> {
    const newRule: SiteRule = {
      id: this.generateId(),
      ...ruleData
    };

    this.rules.push(newRule);
    await this.saveRules();
    return newRule;
  }

  /**
   * Update an existing rule with new data.
   * @param ruleId - ID of the rule to update
   * @param updates - Partial rule data to update
   * @returns Promise that resolves to the updated rule or null if not found
   */
  public async updateRule(ruleId: string, updates: Partial<Omit<SiteRule, 'id'>>): Promise<SiteRule | null> {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index === -1) return null;

    this.rules[index] = { ...this.rules[index], ...updates };
    await this.saveRules();
    return this.rules[index];
  }

  /**
   * Delete a rule by its ID.
   * @param ruleId - ID of the rule to delete
   * @returns Promise that resolves to true if rule was deleted, false if not found
   */
  public async deleteRule(ruleId: string): Promise<boolean> {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== ruleId);

    if (this.rules.length !== initialLength) {
      await this.saveRules();
      return true;
    }
    return false;
  }

  /**
   * Toggle the enabled/disabled state of a rule.
   * @param ruleId - ID of the rule to toggle
   * @returns Promise that resolves to the updated rule or null if not found
   */
  public async toggleRule(ruleId: string): Promise<SiteRule | null> {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) return null;

    return this.updateRule(ruleId, { enabled: !rule.enabled });
  }

  /**
   * Reorder rules based on a new order array.
   * @param newOrder - Array of rule IDs in the desired order
   * @returns Promise that resolves when reordering is complete
   */
  public async reorderRules(newOrder: string[]): Promise<void> {
    const reorderedRules: SiteRule[] = [];

    // Add rules in the new order
    newOrder.forEach(ruleId => {
      const rule = this.rules.find(r => r.id === ruleId);
      if (rule) {
        reorderedRules.push(rule);
      }
    });

    // Add any missing rules (safety check)
    this.rules.forEach(rule => {
      if (!reorderedRules.find(r => r.id === rule.id)) {
        reorderedRules.push(rule);
      }
    });

    this.rules = reorderedRules;
    await this.saveRules();
  }

  /**
   * Get a specific rule by its ID.
   * @param ruleId - ID of the rule to retrieve
   * @returns The rule if found, null otherwise
   */
  public getRuleById(ruleId: string): SiteRule | null {
    return this.rules.find(r => r.id === ruleId) || null;
  }

  /**
   * Apply rules to the current page URL.
   * Checks all enabled rules against the current URL and enforces matching rules.
   * @returns Promise that resolves when rule application is complete
   */
  public async applyRule(): Promise<void> {

    if (!this.rulesLoaded) {
      await this.loadRules();
    }

    const currentUrl = window.location.href;
    const matchedRules = this.rules.find((rule: SiteRule) =>
      rule.enabled && this.ruleMatchWithUrl(rule, currentUrl)
    );

    if (matchedRules) {
      switch (matchedRules.action.type) {
        case SiteRuleActionType.Allow:
          // Allow action does not require any specific handling
          console.log(`Allowing access to ${matchedRules.pattern}`);
          return;
        case SiteRuleActionType.Block:
          return this.applyBlockRule(matchedRules, currentUrl);
        case SiteRuleActionType.Limit:
          return this.applyLimitRule(matchedRules, currentUrl);
        default:
          return assertNever(matchedRules.action);
      }
    }
  }

  /**
   * Check if a rule pattern matches the given URL.
   * @param rule - The rule to check
   * @param url - The URL to match against
   * @returns True if the rule matches the URL
   */
  private ruleMatchWithUrl(rule: SiteRule, url: string): boolean {
    const matcher = siteRulesMatcher[rule.matchType];
    if (matcher) {
      return matcher(url, rule.pattern);
    } else {
      console.warn(`No matcher found for match type: ${rule.matchType}`);
      return false;
    }
  }

  /**
   * Apply a block rule by redirecting to the alert page.
   * @param rule - The block rule to apply
   * @param currentUrl - The current page URL
   */
  private applyBlockRule(rule: SiteRule, currentUrl: string): void {
    return this.redirectToAlertPage({
      type: 'block',
      currentUrl,
      ruleTitle: rule.title
    });
  }

  /**
   * Apply a limit rule with time tracking and enforcement.
   * @param rule - The limit rule to apply
   * @param currentUrl - The current page URL
   * @returns Promise that resolves when limit rule is applied
   */
  private async applyLimitRule(rule: SiteRule, currentUrl: string): Promise<void> {

    if (rule.action.type === SiteRuleActionType.Limit) {
      await this.updateLimitRuleUsage(rule);

      const { allowedMinutes, resetAfterMinutes, delayMinutes, usedMinutes, lastResetAt, lastUsedAt } = rule.action;
      const delaySeconds = delayMinutes * 60;
      const { uptimeSec } = await browser.runtime.sendMessage({ action: 'getUptime' }) as { uptimeSec: number };


      if (delaySeconds > uptimeSec) {
        return this.redirectToAlertPage({
          type: 'limit',
          currentUrl,
          ruleTitle: rule.title,
          allowedAt: Date.now() + (delaySeconds - uptimeSec) * 1000,
        });
      } else if (usedMinutes >= allowedMinutes) {
        return this.redirectToAlertPage({
          type: 'limit',
          currentUrl,
          ruleTitle: rule.title,
          allowedAt: lastResetAt + resetAfterMinutes * 60 * 1000,
        });
      } else {

        // Start interval to track usage while on the page
        if (!this.limitRuleUpdateIntervalRunning) {

          this.limitRuleUpdateIntervalRunning = true;

          const intervalId = setInterval(async () => {
            await this.loadRules();
            const freshedRule = this.getRuleById(rule.id);

            if (!freshedRule || !freshedRule.enabled || !this.ruleMatchWithUrl(freshedRule, currentUrl) || freshedRule.action.type !== SiteRuleActionType.Limit) {
              return clearInterval(intervalId);
            }

            const { allowedMinutes, resetAfterMinutes, usedMinutes, lastResetAt } = freshedRule.action;

            if (usedMinutes >= allowedMinutes) {
              clearInterval(intervalId);
              return this.redirectToAlertPage({
                type: 'limit',
                currentUrl,
                ruleTitle: rule.title,
                allowedAt: lastResetAt + resetAfterMinutes * 60 * 1000,
              });
            } else {
              await this.updateLimitRuleUsage(freshedRule);
            }
          }, 5000);
        }
      }

    }

  }

  /**
   * Update the usage tracking for a limit rule.
   * @param rule - The limit rule to update
   * @returns Promise that resolves when usage is updated
   */
  private async updateLimitRuleUsage(rule: SiteRule): Promise<void> {

    if (rule.action.type === SiteRuleActionType.Limit) {

      const currentTime = Date.now();

      // Update used minutes if last usage was recent (within 30 seconds)
      if (currentTime - rule.action.lastUsedAt <= 30000) {
        rule.action.usedMinutes += (currentTime - rule.action.lastUsedAt) / 60000;
      }

      // Reset usage if reset period has elapsed
      if (currentTime - rule.action.lastResetAt >= rule.action.resetAfterMinutes * 60 * 1000) {
        rule.action.usedMinutes = 0;
        rule.action.lastResetAt = currentTime;
      }

      rule.action.lastUsedAt = currentTime;

      await this.saveRules();
    }

  }

  /**
   * Redirect to the alert page with appropriate parameters.
   * @param params - Alert page parameters
   * @param params.type - Type of alert (block or limit)
   * @param params.currentUrl - URL that triggered the alert
   * @param params.ruleTitle - Title of the rule that was triggered
   * @param params.allowedAt - Optional timestamp when access will be allowed again
   */
  private redirectToAlertPage({ type, currentUrl, ruleTitle, allowedAt }: { type: string; currentUrl: string; ruleTitle: string; allowedAt?: number }): void {
    let alertUrl = browser.runtime.getURL('html/alert.html') + `?type=${encodeURIComponent(type)}&currentUrl=${encodeURIComponent(currentUrl)}&ruleTitle=${encodeURIComponent(ruleTitle)}`;
    if (allowedAt) {
      alertUrl += `&allowedAt=${encodeURIComponent(allowedAt)}`;
    }
    window.location.href = alertUrl;
  }

}
