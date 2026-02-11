import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Playlist, Stock } from '@/types/playlist';

// Navigation types
export type ActiveTab = 'theme' | 'market' | 'advisor' | 'watchlist' | 'profile';

// Screen types - includes both new and legacy screen names for compatibility
export type Screen =
  | 'theme-list'
  | 'all-companies'
  | 'company-list'
  | 'company-profile'
  | 'market'
  | 'advisor'
  | 'catalyst-detail'
  | 'watchlist'
  | 'profile'
  | 'quiz'
  | 'store'
  // Legacy screen names for backward compatibility
  | 'game-map'
  | 'phase2-select'
  | 'phase2-story'
  | 'playlist'
  | 'stock'
  | 'following';

// Data types
export interface Catalyst {
  id: string;
  title: string;
  description: string;
  category: 'Earnings' | 'FDA' | 'Mergers' | 'Economic' | 'Production' | 'Partnership';
  time: string;
  icon: string;
  companies: string[]; // ticker symbols
  themeId: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface SavedStock {
  ticker: string;
  name: string;
  playlistId: string;
  playlistTitle: string;
  logoUrl?: string;
}

interface AppContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  navigationHistory: { tab: ActiveTab; screen: Screen }[];
  navigateBack: () => void;
  navigateTo: (screen: Screen) => void;
  
  // Selected entities
  selectedPlaylist: Playlist | null;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  selectedStock: { ticker: string; playlist: Playlist } | null;
  setSelectedStock: (stock: { ticker: string; playlist: Playlist } | null) => void;
  selectedCatalyst: Catalyst | null;
  setSelectedCatalyst: (catalyst: Catalyst | null) => void;
  
  // Quiz
  quizCompleted: boolean;
  setQuizCompleted: (completed: boolean) => void;
  
  // Watchlist - separate for themes and companies
  watchlistThemes: string[];
  toggleWatchlistTheme: (themeId: string) => void;
  isThemeWatchlisted: (themeId: string) => boolean;
  watchlistCompanies: SavedStock[];
  toggleWatchlistCompany: (stock: SavedStock) => void;
  isCompanyWatchlisted: (ticker: string) => boolean;
  
  // Legacy compatibility
  savedPlaylists: string[];
  toggleSavePlaylist: (playlistId: string) => void;
  savedStocks: SavedStock[];
  toggleSaveStock: (stock: SavedStock) => void;
  isStockSaved: (ticker: string) => boolean;
  
  // Progress tracking
  completedCompanies: string[];
  markCompanyCompleted: (ticker: string) => void;
  isCompanyCompleted: (ticker: string) => boolean;
  
  // Phase 2 legacy support
  phase2ViewedThemes: string[];
  currentThemeStoryId: string | null;
  addViewedTheme: (themeId: string) => void;
  setCurrentThemeStoryId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Navigation state
  const [activeTab, setActiveTabState] = useState<ActiveTab>('theme');
  const [currentScreen, setCurrentScreenState] = useState<Screen>('theme-list');
  const [navigationHistory, setNavigationHistory] = useState<{ tab: ActiveTab; screen: Screen }[]>([]);
  
  // Selected entities
  const [selectedPlaylistState, setSelectedPlaylistState] = useState<Playlist | null>(null);
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; playlist: Playlist } | null>(null);
  const [selectedCatalyst, setSelectedCatalyst] = useState<Catalyst | null>(null);

  const setSelectedPlaylist = useCallback((playlist: Playlist | null) => {
    setSelectedPlaylistState(playlist);
  }, []);
  
  // Quiz
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Watchlist
  const [watchlistThemes, setWatchlistThemes] = useState<string[]>([]);
  const [watchlistCompanies, setWatchlistCompanies] = useState<SavedStock[]>([]);
  
  // Progress tracking
  const [completedCompanies, setCompletedCompanies] = useState<string[]>([]);
  
  // Phase 2 legacy support
  const [phase2ViewedThemes, setPhase2ViewedThemes] = useState<string[]>([]);
  const [currentThemeStoryId, setCurrentThemeStoryId] = useState<string | null>(null);

  // Simple setCurrentScreen - no history tracking for now
  const setCurrentScreen = useCallback((screen: Screen) => {
    setCurrentScreenState(screen);
  }, []);

  // navigateTo pushes current screen onto history before switching
  const navigateTo = useCallback((screen: Screen) => {
    setNavigationHistory(prev => [...prev, { tab: activeTab, screen: currentScreen }]);
    setCurrentScreenState(screen);
  }, [activeTab, currentScreen]);

  const navigateBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(history => history.slice(0, -1));
      setCurrentScreenState(prev.screen);
      setActiveTabState(prev.tab);
    } else {
      // Default back behavior based on current tab
      switch (activeTab) {
        case 'theme':
          setCurrentScreenState('theme-list');
          break;
        case 'market':
          setCurrentScreenState('market');
          break;
        case 'advisor':
          setCurrentScreenState('advisor');
          break;
        case 'watchlist':
          setCurrentScreenState('watchlist');
          break;
        case 'profile':
          setCurrentScreenState('profile');
          break;
      }
    }
  }, [navigationHistory, activeTab]);

  // Tab switching helper
  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
    setNavigationHistory([]);
    switch (tab) {
      case 'theme':
        setCurrentScreenState('theme-list');
        break;
      case 'market':
        setCurrentScreenState('market');
        break;
      case 'advisor':
        setCurrentScreenState('advisor');
        break;
      case 'watchlist':
        setCurrentScreenState('watchlist');
        break;
      case 'profile':
        setCurrentScreenState('profile');
        break;
    }
  }, []);

  // Watchlist functions
  const toggleWatchlistTheme = useCallback((themeId: string) => {
    setWatchlistThemes(prev =>
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  }, []);

  const isThemeWatchlisted = useCallback((themeId: string) => {
    return watchlistThemes.includes(themeId);
  }, [watchlistThemes]);

  const toggleWatchlistCompany = useCallback((stock: SavedStock) => {
    setWatchlistCompanies(prev =>
      prev.some(s => s.ticker === stock.ticker)
        ? prev.filter(s => s.ticker !== stock.ticker)
        : [...prev, stock]
    );
  }, []);

  const isCompanyWatchlisted = useCallback((ticker: string) => {
    return watchlistCompanies.some(s => s.ticker === ticker);
  }, [watchlistCompanies]);

  // Progress functions
  const markCompanyCompleted = useCallback((ticker: string) => {
    setCompletedCompanies(prev => 
      prev.includes(ticker) ? prev : [...prev, ticker]
    );
  }, []);

  const isCompanyCompleted = useCallback((ticker: string) => {
    return completedCompanies.includes(ticker);
  }, [completedCompanies]);
  
  // Phase 2 legacy function
  const addViewedTheme = useCallback((themeId: string) => {
    setPhase2ViewedThemes(prev => 
      prev.includes(themeId) ? prev : [...prev, themeId]
    );
  }, []);

  // Legacy compatibility aliases
  const savedPlaylists = watchlistThemes;
  const toggleSavePlaylist = toggleWatchlistTheme;
  const savedStocks = watchlistCompanies;
  const toggleSaveStock = toggleWatchlistCompany;
  const isStockSaved = isCompanyWatchlisted;

  return (
    <AppContext.Provider
      value={{
        // Navigation
        activeTab,
        setActiveTab,
        currentScreen,
        setCurrentScreen,
        navigationHistory,
        navigateBack,
        navigateTo,
        
        // Selected entities
        selectedPlaylist: selectedPlaylistState,
        setSelectedPlaylist,
        selectedStock,
        setSelectedStock,
        selectedCatalyst,
        setSelectedCatalyst,
        
        // Quiz
        quizCompleted,
        setQuizCompleted,
        
        // Watchlist
        watchlistThemes,
        toggleWatchlistTheme,
        isThemeWatchlisted,
        watchlistCompanies,
        toggleWatchlistCompany,
        isCompanyWatchlisted,
        
        // Legacy
        savedPlaylists,
        toggleSavePlaylist,
        savedStocks,
        toggleSaveStock,
        isStockSaved,
        
        // Progress
        completedCompanies,
        markCompanyCompleted,
        isCompanyCompleted,
        
        // Phase 2 legacy
        phase2ViewedThemes,
        currentThemeStoryId,
        addViewedTheme,
        setCurrentThemeStoryId,
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
