import { PlaylistMatchCriteria } from '@/types/playlist';

/**
 * User profile format from convertToUserProfile in investorScoring.ts
 */
export interface UserMatchProfile {
  riskTolerance: number; // 0-100
  timeHorizon: number; // 0-100
  sectors: Record<string, number>; // sector -> weight (0-1)
  themePreferences: string[]; // from Q8-Q9
}

/**
 * Extended playlist criteria with optional theme
 */
export interface PlaylistWithTheme extends PlaylistMatchCriteria {
  id: string; // Used for theme matching
}

const WEIGHTS = {
  risk: 0.40,
  timeline: 0.20,
  sectors: 0.30,
  theme: 0.10
};

/**
 * Map risk string to numeric value (0-100)
 */
function getRiskValue(risk: 'safe' | 'balanced' | 'growth' | 'yolo'): number {
  const mapping = {
    safe: 15,
    balanced: 45,
    growth: 75,
    yolo: 95
  };
  return mapping[risk];
}

/**
 * Map timeline string to numeric value (0-100)
 */
function getTimelineValue(timeline: 'short' | 'medium' | 'long' | 'forever'): number {
  const mapping = {
    short: 25,
    medium: 50,
    long: 75,
    forever: 95
  };
  return mapping[timeline];
}

/**
 * Calculate risk match score (0-100)
 * Compare user's riskTolerance with playlist's risk
 */
function calculateRiskMatch(userRiskTolerance: number, playlistRisk: string): number {
  const playlistRiskValue = getRiskValue(playlistRisk as 'safe' | 'balanced' | 'growth' | 'yolo');
  const distance = Math.abs(userRiskTolerance - playlistRiskValue);

  // Penalty factor: 1.5 means 66-point distance = 0% match
  const match = Math.max(0, 100 - (distance * 1.5));
  return match;
}

/**
 * Calculate timeline match score (0-100)
 * Compare user's timeHorizon with playlist's timeline
 */
function calculateTimelineMatch(userTimeHorizon: number, playlistTimeline: string): number {
  const playlistTimelineValue = getTimelineValue(playlistTimeline as 'short' | 'medium' | 'long' | 'forever');
  const distance = Math.abs(userTimeHorizon - playlistTimelineValue);

  // Penalty factor: 1.2 means 83-point distance = 0% match
  const match = Math.max(0, 100 - (distance * 1.2));
  return match;
}

/**
 * Calculate sector match score (0-100)
 * Weighted overlap between user's sector preferences and playlist sectors
 */
function calculateSectorMatch(
  userSectorWeights: Record<string, number>,
  playlistSectors: string[]
): number {
  if (Object.keys(userSectorWeights).length === 0) {
    return 50; // Neutral score if no sector preferences
  }

  let matchScore = 0;
  Object.entries(userSectorWeights).forEach(([sector, weight]) => {
    if (playlistSectors.includes(sector)) {
      matchScore += weight * 100;
    }
  });

  return matchScore;
}

/**
 * Calculate theme boost score (0-100)
 * Check if playlist theme matches user's theme preferences
 */
function calculateThemeBoost(
  userThemePreferences: string[],
  playlistId: string,
  playlistSectors: string[]
): number {
  if (userThemePreferences.length === 0) {
    return 0;
  }

  // Direct match with playlist ID
  if (userThemePreferences.includes(playlistId)) {
    return 100;
  }

  // Partial matches based on theme keywords
  const themeKeywords: Record<string, string[]> = {
    nuclear: ['nuclear', 'energy'],
    longevity: ['longevity', 'healthcare', 'glp1'],
    space_defense: ['space', 'defense', 'aerospace'],
    consumer_trends: ['consumer', 'entertainment', 'streaming'],
    cashcow: ['dividend', 'quality'],
    ipo2026: ['ipo', 'unicorn'],
    thematic: ['growth', 'trends'],
    indexchill: ['index', 'passive']
  };

  for (const themePref of userThemePreferences) {
    const keywords = themeKeywords[themePref] || [];

    // Check if playlist ID contains any keywords
    for (const keyword of keywords) {
      if (playlistId.toLowerCase().includes(keyword)) {
        return 75;
      }
    }

    // Check if playlist sectors overlap with theme
    if (keywords.some(kw => playlistSectors.includes(kw))) {
      return 50;
    }
  }

  return 0;
}

/**
 * Calculate overall match score (0-100)
 */
export function calculateMatchScore(
  userProfile: UserMatchProfile,
  playlist: PlaylistWithTheme
): number {
  const riskMatch = calculateRiskMatch(userProfile.riskTolerance, playlist.risk);
  const timelineMatch = calculateTimelineMatch(userProfile.timeHorizon, playlist.timeline);
  const sectorMatch = calculateSectorMatch(userProfile.sectors, playlist.sectors);
  const themeBoost = calculateThemeBoost(userProfile.themePreferences, playlist.id, playlist.sectors);

  const totalScore =
    (riskMatch * WEIGHTS.risk) +
    (timelineMatch * WEIGHTS.timeline) +
    (sectorMatch * WEIGHTS.sectors) +
    (themeBoost * WEIGHTS.theme);

  return Math.round(totalScore);
}

/**
 * Get match level and label
 */
export type MatchLevel = 'excellent' | 'great' | 'good' | 'none';

export function getMatchLevel(score: number): MatchLevel {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'great';
  if (score >= 60) return 'good';
  return 'none';
}

export function getMatchLabel(score: number): string {
  const level = getMatchLevel(score);
  const labels = {
    excellent: 'Excellent match',
    great: 'Great match',
    good: 'Good match',
    none: ''
  };
  return labels[level];
}
