import { UserMatchProfile } from './matchScore';
import { Playlist } from '@/types/playlist';

/**
 * Get human-readable label for risk level
 */
function getRiskLabel(risk: 'safe' | 'balanced' | 'growth' | 'yolo'): string {
  const labels = {
    safe: 'Conservative',
    balanced: 'Balanced',
    growth: 'Growth',
    yolo: 'High-risk'
  };
  return labels[risk];
}

/**
 * Get human-readable label for timeline
 */
function getTimelineLabel(timeline: 'short' | 'medium' | 'long' | 'forever'): string {
  const labels = {
    short: 'Short-term',
    medium: 'Medium-term',
    long: 'Long-term',
    forever: 'Buy & hold'
  };
  return labels[timeline];
}

/**
 * Check if user's risk tolerance aligns with playlist risk
 */
function riskAligned(userRiskTolerance: number, playlistRisk: 'safe' | 'balanced' | 'growth' | 'yolo'): boolean {
  const riskValues = {
    safe: 15,
    balanced: 45,
    growth: 75,
    yolo: 95
  };
  const playlistRiskValue = riskValues[playlistRisk];
  const distance = Math.abs(userRiskTolerance - playlistRiskValue);
  return distance <= 25; // Within 25 points is considered aligned
}

/**
 * Check if user's time horizon aligns with playlist timeline
 */
function timelineAligned(userTimeHorizon: number, playlistTimeline: 'short' | 'medium' | 'long' | 'forever'): boolean {
  const timelineValues = {
    short: 25,
    medium: 50,
    long: 75,
    forever: 95
  };
  const playlistTimelineValue = timelineValues[playlistTimeline];
  const distance = Math.abs(userTimeHorizon - playlistTimelineValue);
  return distance <= 30; // Within 30 points is considered aligned
}

/**
 * Get the most aligned sector between user preferences and playlist sectors
 */
function getMostAlignedSector(
  userSectorWeights: Record<string, number>,
  playlistSectors: string[]
): string | null {
  let topSector: string | null = null;
  let topWeight = 0;

  playlistSectors.forEach(sector => {
    const weight = userSectorWeights[sector] || 0;
    if (weight > topWeight) {
      topWeight = weight;
      topSector = sector;
    }
  });

  return topWeight > 0.3 ? topSector : null; // Only if weight > 0.3
}

/**
 * Capitalize first letter of each word
 */
function capitalize(str: string): string {
  return str
    .split(/[_\s-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate human-readable match reasons for a playlist
 * Returns array of reason strings (max 3)
 */
export function generateMatchReasons(
  userProfile: UserMatchProfile,
  playlist: Playlist
): string[] {
  const reasons: string[] = [];

  // Check risk alignment
  if (riskAligned(userProfile.riskTolerance, playlist.risk)) {
    reasons.push(`${getRiskLabel(playlist.risk)} mindset`);
  }

  // Check timeline alignment
  if (timelineAligned(userProfile.timeHorizon, playlist.timeline)) {
    reasons.push(`${getTimelineLabel(playlist.timeline)} timeline`);
  }

  // Check sector overlap
  const topSector = getMostAlignedSector(userProfile.sectors, playlist.sectors);
  if (topSector && reasons.length < 3) {
    reasons.push(`${capitalize(topSector)} focus`);
  }

  // Check theme match
  if (userProfile.themePreferences.includes(playlist.id) && reasons.length < 3) {
    reasons.push(`${playlist.title} theme`);
  }

  // Return max 3 reasons
  return reasons.slice(0, 3);
}
