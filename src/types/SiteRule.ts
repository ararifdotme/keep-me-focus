/**
 * Site Rule Type Definitions
 * 
 * Defines the core types and enums for website rules in the Keep Me Focus extension.
 * These types are used throughout the application to manage website access controls.
 */

/**
 * Enum representing the different types of matching logic for site rules.
 * Determines how the pattern should be matched against URLs.
 */
export enum SiteRuleMatchType {
  /** Matches URLs that are exactly equal to the pattern */
  EqualTo = 'equalTo',

  /** Matches URLs that start with the given pattern */
  StartsWith = 'startsWith',

  /** Matches URLs that end with the given pattern */
  EndsWith = 'endsWith',

  /** Matches URLs that contain the given pattern anywhere */
  Contains = 'contains',

  /** Matches URLs using a regular expression pattern */
  Regex = 'regex',

  /** Matches URLs that are NOT equal to the pattern */
  NotEqualTo = 'notEqualTo',

  /** Matches URLs that do NOT start with the given pattern */
  NotStartsWith = 'notStartsWith',

  /** Matches URLs that do NOT end with the given pattern */
  NotEndsWith = 'notEndsWith',

  /** Matches URLs that do NOT contain the given pattern */
  NotContains = 'notContains',

  /** Matches URLs that do NOT match the regular expression */
  NotRegex = 'notRegex',
}

/**
 * Enum representing the possible actions for site rules.
 */
export enum SiteRuleActionType {
  /** Allow access to the site (whitelist) */
  Allow = 'allow',

  /** Block access to the site completely */
  Block = 'block',

  /** Limit access to the site with time constraints */
  Limit = 'limit',
}

/**
 * Union type representing the possible actions for site rules.
 * Simple actions (Allow/Block) or complex time-limited actions.
 */
export type SiteRuleAction = {
  /** Simple allow or block action */
  readonly type: SiteRuleActionType.Allow | SiteRuleActionType.Block;
} | {
  /** Time-limited access action with various constraints */
  readonly type: SiteRuleActionType.Limit;

  /** Time allowed in minutes for the site (0 = unlimited) */
  readonly allowedMinutes: number;

  /** Time after which the limit resets, in minutes (0 = no reset) */
  readonly resetAfterMinutes: number;

  /** Time in minutes after browser opens before site can be accessed */
  readonly delayMinutes: number;

  /** Number of minutes the site has been used (runtime state) */
  usedMinutes: number;

  /** Timestamp of the last reset (runtime state) */
  lastResetAt: number;

  /** Timestamp of the last use (runtime state) */
  lastUsedAt: number;
};

/**
 * Complete site rule configuration.
 * Represents a single rule that controls access to websites.
 */
export type SiteRule = {
  /** Unique identifier for the rule */
  readonly id: string;

  /** User-friendly name/title for the rule */
  readonly title: string;

  /** The URL pattern to match against */
  readonly pattern: string;

  /** The type of matching logic to apply */
  readonly matchType: SiteRuleMatchType;

  /** The action to perform when the rule matches */
  readonly action: SiteRuleAction;

  /** Whether the rule is currently enabled */
  readonly enabled: boolean;
};