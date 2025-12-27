import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Playlist, Stock } from '@/types/playlist';

type Screen = 'quiz' | 'discovery' | 'playlist' | 'stock' | 'profile' | 'calls' | 'auth' | 'scorecard' | 'market' | 'home' | 'mythemes';

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
  // New Edge system
  edgePoints: number;
  addEdge: (amount: number) => void;
  answeredQuestions: Set<string>;
  markQuestionAnswered: (questionId: string) => void;
  trackedThemes: string[];
  trackTheme: (themeId: string) => void;
  discoveredThemes: string[];
  discoverTheme: (themeId: string) => void;
  currentThemeQuestionIndex: number;
  advanceThemeQuestion: () => void;
  resetThemeQuestions: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to load from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
  }
  return defaultValue;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; playlist: Playlist } | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [savedPlaylists, setSavedPlaylists] = useState<string[]>([]);
  const [savedStocks, setSavedStocks] = useState<SavedStock[]>([]);
  
  // New Edge system state
  const [edgePoints, setEdgePoints] = useState(() => loadFromStorage('edgePoints', 0));
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(() => {
    const stored = loadFromStorage<string[]>('answeredQuestions', []);
    return new Set(stored);
  });
  const [trackedThemes, setTrackedThemes] = useState<string[]>(() => 
    loadFromStorage('trackedThemes', [])
  );
  const [discoveredThemes, setDiscoveredThemes] = useState<string[]>(() => 
    loadFromStorage('discoveredThemes', [])
  );
  const [currentThemeQuestionIndex, setCurrentThemeQuestionIndex] = useState(() => 
    loadFromStorage('currentThemeQuestionIndex', 0)
  );

  // Persist Edge points
  useEffect(() => {
    localStorage.setItem('edgePoints', JSON.stringify(edgePoints));
  }, [edgePoints]);

  // Persist answered questions
  useEffect(() => {
    localStorage.setItem('answeredQuestions', JSON.stringify(Array.from(answeredQuestions)));
  }, [answeredQuestions]);

  // Persist tracked themes
  useEffect(() => {
    localStorage.setItem('trackedThemes', JSON.stringify(trackedThemes));
  }, [trackedThemes]);

  // Persist discovered themes
  useEffect(() => {
    localStorage.setItem('discoveredThemes', JSON.stringify(discoveredThemes));
  }, [discoveredThemes]);

  // Persist question index
  useEffect(() => {
    localStorage.setItem('currentThemeQuestionIndex', JSON.stringify(currentThemeQuestionIndex));
  }, [currentThemeQuestionIndex]);

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

  // Edge system functions
  const addEdge = (amount: number) => {
    setEdgePoints(prev => prev + amount);
  };

  const markQuestionAnswered = (questionId: string) => {
    setAnsweredQuestions(prev => new Set(prev).add(questionId));
  };

  const trackTheme = (themeId: string) => {
    if (!trackedThemes.includes(themeId)) {
      setTrackedThemes(prev => [...prev, themeId]);
    }
  };

  const discoverTheme = (themeId: string) => {
    if (!discoveredThemes.includes(themeId)) {
      setDiscoveredThemes(prev => [...prev, themeId]);
    }
  };

  const advanceThemeQuestion = () => {
    setCurrentThemeQuestionIndex(prev => prev + 1);
  };

  const resetThemeQuestions = () => {
    setCurrentThemeQuestionIndex(0);
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
        // Edge system
        edgePoints,
        addEdge,
        answeredQuestions,
        markQuestionAnswered,
        trackedThemes,
        trackTheme,
        discoveredThemes,
        discoverTheme,
        currentThemeQuestionIndex,
        advanceThemeQuestion,
        resetThemeQuestions
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
