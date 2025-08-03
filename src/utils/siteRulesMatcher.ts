/**
 * Site Rules Matching Utility
 * 
 * Provides pattern matching functions for different site rule match types.
 * Each match type has its own implementation for comparing URLs against patterns.
 */

import { SiteRuleMatchType } from "../types/SiteRule";

/**
 * Collection of URL matching functions for site rules.
 * Maps each SiteRuleMatchType to its corresponding matching logic.
 * 
 * @example
 * ```typescript
 * const matcher = siteRulesMatcher[SiteRuleMatchType.Contains];
 * const isMatch = matcher('https://youtube.com/watch', 'youtube.com'); // true
 * ```
 */
export const siteRulesMatcher: Record<SiteRuleMatchType, (url: string, pattern: string) => boolean> = {
  /** Check if URL exactly equals the pattern */
  [SiteRuleMatchType.EqualTo]: (url, pattern) => url === pattern,

  /** Check if URL starts with the pattern */
  [SiteRuleMatchType.StartsWith]: (url, pattern) => url.startsWith(pattern),

  /** Check if URL ends with the pattern */
  [SiteRuleMatchType.EndsWith]: (url, pattern) => url.endsWith(pattern),

  /** Check if URL contains the pattern anywhere */
  [SiteRuleMatchType.Contains]: (url, pattern) => url.includes(pattern),

  /** Check if URL matches the regular expression pattern */
  [SiteRuleMatchType.Regex]: (url, pattern) => new RegExp(pattern).test(url),

  /** Check if URL does NOT equal the pattern */
  [SiteRuleMatchType.NotEqualTo]: (url, pattern) => url !== pattern,

  /** Check if URL does NOT start with the pattern */
  [SiteRuleMatchType.NotStartsWith]: (url, pattern) => !url.startsWith(pattern),

  /** Check if URL does NOT end with the pattern */
  [SiteRuleMatchType.NotEndsWith]: (url, pattern) => !url.endsWith(pattern),

  /** Check if URL does NOT contain the pattern */
  [SiteRuleMatchType.NotContains]: (url, pattern) => !url.includes(pattern),

  /** Check if URL does NOT match the regular expression pattern */
  [SiteRuleMatchType.NotRegex]: (url, pattern) => !(new RegExp(pattern).test(url)),
}