import { UserProfile } from '@/types/quiz';
import { PlaylistMatchCriteria } from '@/types/playlist';

const MATCH_WEIGHTS = {
  oddsPreference: 0.35,
  sectors: 0.25,
  timeHorizon: 0.25,
  investmentStyle: 0.15
};

function calculateRiskMatch(userRisk: string, playlistRisk: string): number {
  const riskLevels = ['safe', 'balanced', 'growth', 'yolo'];
  const userIndex = riskLevels.indexOf(userRisk);
  const playlistIndex = riskLevels.indexOf(playlistRisk);
  const distance = Math.abs(userIndex - playlistIndex);
  const scores = [1.0, 0.6, 0.3, 0.1];
  return scores[distance] || 0;
}

function calculateSectorMatch(userSectors: string[], playlistSectors: string[]): number {
  if (!userSectors || userSectors.length === 0) return 0.1;
  const matches = userSectors.filter(s => playlistSectors.includes(s)).length;
  if (matches === 0) return 0.1;
  return Math.min(matches / userSectors.length, 1.0);
}

function calculateTimeMatch(userTime: string, playlistTime: string): number {
  const timeLevels = ['short', 'medium', 'long', 'forever'];
  const userIndex = timeLevels.indexOf(userTime);
  const playlistIndex = timeLevels.indexOf(playlistTime);
  const distance = Math.abs(userIndex - playlistIndex);
  const scores = [1.0, 0.7, 0.4, 0.2];
  return scores[distance] || 0;
}

function calculateStyleMatch(userStyle: string, playlistStyle: string): number {
  const styleLevels = ['passive', 'casual', 'active', 'intense'];
  const userIndex = styleLevels.indexOf(userStyle);
  const playlistIndex = styleLevels.indexOf(playlistStyle);
  const distance = Math.abs(userIndex - playlistIndex);
  const scores = [1.0, 0.7, 0.4, 0.2];
  return scores[distance] || 0;
}

export function calculateMatchScore(
  userProfile: UserProfile,
  playlist: PlaylistMatchCriteria
): number {
  let score = 0;

  const riskScore = calculateRiskMatch(userProfile.oddsPreference, playlist.riskLevel);
  score += riskScore * MATCH_WEIGHTS.oddsPreference;

  const sectorScore = calculateSectorMatch(userProfile.sectors, playlist.sectors);
  score += sectorScore * MATCH_WEIGHTS.sectors;

  const timeScore = calculateTimeMatch(userProfile.timeHorizon, playlist.timeHorizon);
  score += timeScore * MATCH_WEIGHTS.timeHorizon;

  const styleScore = calculateStyleMatch(userProfile.investmentStyle, playlist.stylefit);
  score += styleScore * MATCH_WEIGHTS.investmentStyle;

  return Math.round(score * 100);
}

export type MatchLevel = 'great' | 'good' | 'okay';

export function getMatchLevel(score: number): MatchLevel {
  if (score >= 75) return 'great';
  if (score >= 50) return 'good';
  return 'okay';
}
