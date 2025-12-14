import { UserProfile } from '@/types/quiz';
import { PlaylistMatchCriteria } from '@/types/playlist';

const WEIGHTS = {
  risk: 0.45,
  sectors: 0.35,
  timeline: 0.20
};

function calculateRiskScore(userRisk: string, playlistRisk: string): number {
  const riskLevels = ['safe', 'balanced', 'growth', 'yolo'];
  const userIndex = riskLevels.indexOf(userRisk);
  const playlistIndex = riskLevels.indexOf(playlistRisk);
  const distance = Math.abs(userIndex - playlistIndex);
  
  const scores: Record<number, number> = {
    0: 1.0,
    1: 0.6,
    2: 0.25,
    3: 0.1
  };
  
  return scores[distance] ?? 0;
}

function calculateSectorScore(userSectors: string[], playlistSectors: string[]): number {
  if (!userSectors || userSectors.length === 0) return 0.5;
  
  const matches = userSectors.filter(s => playlistSectors.includes(s)).length;
  const matchRatio = matches / userSectors.length;
  
  return Math.max(matchRatio, 0.1);
}

function calculateTimelineScore(userTimeline: string, playlistTimeline: string): number {
  const timelines = ['short', 'medium', 'long', 'forever'];
  const userIndex = timelines.indexOf(userTimeline);
  const playlistIndex = timelines.indexOf(playlistTimeline);
  const distance = Math.abs(userIndex - playlistIndex);
  
  const scores: Record<number, number> = {
    0: 1.0,
    1: 0.7,
    2: 0.4,
    3: 0.2
  };
  
  return scores[distance] ?? 0;
}

export function calculateMatchScore(
  userProfile: UserProfile,
  playlist: PlaylistMatchCriteria
): number {
  const riskScore = calculateRiskScore(userProfile.risk, playlist.risk);
  const sectorScore = calculateSectorScore(userProfile.sectors, playlist.sectors);
  const timelineScore = calculateTimelineScore(userProfile.timeline, playlist.timeline);
  
  const totalScore = 
    (riskScore * WEIGHTS.risk) +
    (sectorScore * WEIGHTS.sectors) +
    (timelineScore * WEIGHTS.timeline);
  
  return Math.round(totalScore * 100);
}

export type MatchLevel = 'great' | 'good' | 'none';

export function getMatchLevel(score: number): MatchLevel {
  if (score >= 75) return 'great';
  if (score >= 50) return 'good';
  return 'none';
}
