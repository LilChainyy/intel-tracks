import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Playlist, Stock } from '@/types/playlist';

type Screen = 'game-map' | 'quiz' | 'playlist' | 'stock' | 'profile' | 'following' | 'store' | 'phase2-intro' | 'phase2-select' | 'phase2-story';

export interface SavedStock {
  ticker: string;
  name: string;
  playlistId: string;
  playlistTitle: string;
  logoUrl?: string;
}

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  selectedPlaylist: Playlist | null;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  selectedStock: { ticker: string; playlist: Playlist } | null;
  setSelectedStock: (stock: { ticker: string; playlist: Playlist } | null) => void;
  quizCompleted: boolean;
  setQuizCompleted: (completed: boolean) => void;
  savedPlaylists: string[];
  toggleSavePlaylist: (playlistId: string) => void;
  savedStocks: SavedStock[];
  toggleSaveStock: (stock: SavedStock) => void;
  isStockSaved: (ticker: string) => boolean;
  // Phase 2 state
  phase2ViewedThemes: string[];
  currentThemeStoryId: string | null;
  addViewedTheme: (themeId: string) => void;
  setCurrentThemeStoryId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('game-map');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; playlist: Playlist } | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [savedPlaylists, setSavedPlaylists] = useState<string[]>([]);
  const [savedStocks, setSavedStocks] = useState<SavedStock[]>([]);
  // Phase 2 state
  const [phase2ViewedThemes, setPhase2ViewedThemes] = useState<string[]>([]);
  const [currentThemeStoryId, setCurrentThemeStoryId] = useState<string | null>(null);

  const addViewedTheme = useCallback((themeId: string) => {
    setPhase2ViewedThemes(prev => 
      prev.includes(themeId) ? prev : [...prev, themeId]
    );
  }, []);

  const toggleSavePlaylist = (playlistId: string) => {
    setSavedPlaylists(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const toggleSaveStock = (stock: SavedStock) => {
    setSavedStocks(prev =>
      prev.some(s => s.ticker === stock.ticker)
        ? prev.filter(s => s.ticker !== stock.ticker)
        : [...prev, stock]
    );
  };

  const isStockSaved = (ticker: string) => {
    return savedStocks.some(s => s.ticker === ticker);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        selectedPlaylist,
        setSelectedPlaylist,
        selectedStock,
        setSelectedStock,
        quizCompleted,
        setQuizCompleted,
        savedPlaylists,
        toggleSavePlaylist,
        savedStocks,
        toggleSaveStock,
        isStockSaved,
        // Phase 2
        phase2ViewedThemes,
        currentThemeStoryId,
        addViewedTheme,
        setCurrentThemeStoryId
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
