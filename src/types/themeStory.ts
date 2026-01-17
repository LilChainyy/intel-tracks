export interface ThemeCard {
  id: string;
  icon: string;
  title: string;
  recentCatalystTeaser: string;
}

export interface ThemeStory {
  id: string;
  title: string;
  icon: string;
  
  act1: {
    hookLine: string;
    recentCatalyst: {
      date: string;
      event: string;
      impact: string;
    };
    whyItMatters: string;
    pattern: string;
    backgroundMedia?: string;
  };
  
  act2: {
    near: string;
    medium: string;
    far: string;
    inflectionPoint: string;
    stakes: string;
  };
  
  act3: {
    layers: Array<{
      category: string;
      examples: string;
    }>;
    recentMoves: string[];
    whatsNext: string[];
  };
  
  stockCount: number;
  themeId: string;
}

export interface Phase2State {
  viewedThemes: string[];
  currentThemeId: string | null;
}
