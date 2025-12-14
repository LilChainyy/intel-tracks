export interface Stock {
  ticker: string;
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface PlaylistMatchCriteria {
  riskLevel: 'safe' | 'balanced' | 'growth' | 'yolo';
  sectors: string[];
  timeHorizon: 'short' | 'medium' | 'long' | 'forever';
  stylefit: 'passive' | 'casual' | 'active' | 'intense';
}

export interface Playlist extends PlaylistMatchCriteria {
  id: string;
  emoji: string;
  title: string;
  heroImage: string;
  whoBuying: string[];
  proofPoint: string;
  whyNow: string;
  tags: string[];
  stocks: Stock[];
  matchScore?: number;
}
