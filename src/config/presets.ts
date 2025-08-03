/**
 * Rule Presets Configuration
 * 
 * Pre-defined website blocking/limiting rules that users can quickly apply.
 * These presets provide common configurations for popular websites and services.
 */

import { PresetRule } from '../types/PresetRule';
import { SiteRuleMatchType, SiteRuleActionType } from '../types/SiteRule';

/**
 * Collection of predefined site rules for common use cases.
 * Each preset includes a title, URL pattern, match type, and action.
 */
export const RULE_PRESETS: Record<string, PresetRule> = {
  /** Block access to YouTube Shorts pages */
  'block-youtube-shorts': {
    title: 'Block YouTube Shorts',
    pattern: 'youtube.com/shorts',
    matchType: SiteRuleMatchType.Contains,
    action: { type: SiteRuleActionType.Block }
  },

  /** Limit YouTube access to 10 minutes per hour with 60-minute startup delay */
  'limit-youtube': {
    title: 'Limit YouTube (10min per hour, 60min startup delay)',
    pattern: 'youtube.com',
    matchType: SiteRuleMatchType.Contains,
    action: {
      type: SiteRuleActionType.Limit,
      allowedMinutes: 10,
      resetAfterMinutes: 60, // 1 hour in minutes
      delayMinutes: 60, // 60-minute delay after browser startup
      usedMinutes: 0,
      lastResetAt: Date.now(),
      lastUsedAt: Date.now()
    }
  },

  /** Completely block Facebook access */
  'block-facebook': {
    title: 'Block Facebook',
    pattern: 'facebook.com',
    matchType: SiteRuleMatchType.Contains,
    action: { type: SiteRuleActionType.Block }
  },

  /** Completely block Instagram access */
  'block-instagram': {
    title: 'Block Instagram',
    pattern: 'instagram.com',
    matchType: SiteRuleMatchType.Contains,
    action: { type: SiteRuleActionType.Block }
  },

  /** Block both Twitter.com and X.com using regex */
  'block-twitter': {
    title: 'Block Twitter/X',
    pattern: '(twitter\\.com|x\\.com)',
    matchType: SiteRuleMatchType.Regex,
    action: { type: SiteRuleActionType.Block }
  },

  /** Completely block TikTok access */
  'block-tiktok': {
    title: 'Block TikTok',
    pattern: 'tiktok.com',
    matchType: SiteRuleMatchType.Contains,
    action: { type: SiteRuleActionType.Block }
  },

  /** Limit all major social media platforms to 15 minutes per day */
  'limit-social-media': {
    title: 'Limit Social Media (15min daily)',
    pattern: '(facebook\\.com|instagram\\.com|twitter\\.com|x\\.com|tiktok\\.com)',
    matchType: SiteRuleMatchType.Regex,
    action: {
      type: SiteRuleActionType.Limit,
      allowedMinutes: 15,
      resetAfterMinutes: 1440, // 24 hours in minutes
      delayMinutes: 0,
      usedMinutes: 0,
      lastResetAt: Date.now(),
      lastUsedAt: Date.now()
    }
  },

  /** Add 10-minute delay before accessing distracting websites */
  'delay-distractions': {
    title: 'Delay Distractions (10min)',
    pattern: '(youtube\\.com|facebook\\.com|instagram\\.com|twitter\\.com|x\\.com|tiktok\\.com|reddit\\.com)',
    matchType: SiteRuleMatchType.Regex,
    action: {
      type: SiteRuleActionType.Limit,
      allowedMinutes: 0, // No time limit, just delay
      resetAfterMinutes: 0, // No reset needed
      delayMinutes: 10, // 10-minute delay after browser startup
      usedMinutes: 0,
      lastResetAt: Date.now(),
      lastUsedAt: Date.now()
    }
  },

  /** Allow only work-related websites (blocks everything else) */
  'allow-work-sites': {
    title: 'Allow Only Work Sites',
    pattern: '(work\\.com|company\\.com|gmail\\.com|docs\\.google\\.com|github\\.com|stackoverflow\\.com|atlassian\\.net)',
    matchType: SiteRuleMatchType.Regex,
    action: { type: SiteRuleActionType.Allow }
  }
};
