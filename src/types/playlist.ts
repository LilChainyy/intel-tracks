export interface Stock {
  ticker: string;
  name: string;
  description: string;
  isPrivate: boolean;
  logoUrl?: string;
  ytdChange?: number;
}

export interface PlaylistMatchCriteria {
  risk: 'safe' | 'balanced' | 'growth' | 'yolo';
  sectors: string[];
  timeline: 'short' | 'medium' | 'long' | 'forever';
}

export interface Playlist extends PlaylistMatchCriteria {
  id: string;
  title: string;
  heroImage: string;
  
  // Key Players
  investors: string[];
  companies: string[];
  
  // Performance
  benchmarkTicker: string;
  benchmarkName: string;
  benchmarkPerformance: string;
  isPositivePerformance: boolean;
  
  // Content
  signal: string;
  thesis: string;
  fullAnalysis?: string;
  
  tags: string[];
  stocks: Stock[];
  matchScore?: number;
}
