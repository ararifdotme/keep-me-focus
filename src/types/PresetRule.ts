/**
 * Preset Rule Type Definition
 * 
 * Defines the structure for predefined website rules that users can quickly apply.
 * Presets provide common configurations without the need for manual setup.
 */

import { SiteRuleMatchType, SiteRuleAction } from './SiteRule';

/**
 * Interface for predefined rule configurations.
 * Used in the presets system to provide quick rule templates.
 */
export interface PresetRule {
  /** Display name for the preset rule */
  title: string;

  /** URL pattern to match against websites */
  pattern: string;

  /** How the pattern should be matched (contains, regex, etc.) */
  matchType: SiteRuleMatchType;

  /** Action to take when the rule matches (block, limit, allow) */
  action: SiteRuleAction;
}
