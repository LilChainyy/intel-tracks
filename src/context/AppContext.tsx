import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Playlist } from '@/types/playlist';
import { getTodayKey } from '@/data/discoveryQuestions';

export type Screen = 'home' | 'themes' | 'playlist' | 'stock' | 'themeUnlock' | 'profile';

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
  // Pig points system
  pigPoints: number;
  addPigPoint: () => void;
  answeredQuestions: string[];
  markQuestionAnswered: (questionId: string) => void;
  // Daily market questions
  dailyData: { date: string; questionsAnsweredToday: number } | null;
  canAnswerMoreToday: boolean;
  // Theme unlocking
  unlockedThemes: string[];
  unlockTheme: (themeId: string) => void;
  isThemeUnlocked: (themeId: string) => boolean;
  currentUnlockingTheme: string | null;
  setCurrentUnlockingTheme: (themeId: string | null) => void;
  themeQuestionProgress: Record<string, number>;
  advanceThemeQuestion: (themeId: string) => void;
  resetThemeProgress: (themeId: string) => void;
  // Reward modal
  showRewardModal: boolean;
  setShowRewardModal: (show: boolean) => void;
  hasClaimedReward: boolean;
  claimReward: () => void;
  // Theme votes
  themeVotes: Record<string, 'up' | 'down' | null>;
  voteTheme: (themeId: string, vote: 'up' | 'down') => void;
  // Reset all progress
  resetAllProgress: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DAILY_LIMIT = 10;
const REWARD_THRESHOLD = 50;

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
  
  // Pig points system
  const [pigPoints, setPigPoints] = useState(() => loadFromStorage('pigPoints', 0));
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>(() => 
    loadFromStorage<string[]>('answeredQuestions', [])
  );
  
  // Daily tracking
  const [dailyData, setDailyData] = useState<{ date: string; questionsAnsweredToday: number } | null>(() => {
    const stored = loadFromStorage<{ date: string; questionsAnsweredToday: number } | null>('dailyMarketData', { date: getTodayKey(), questionsAnsweredToday: 0 });
    // Reset if it's a new day
    if (stored && stored.date !== getTodayKey()) {
      return { date: getTodayKey(), questionsAnsweredToday: 0 };
    }
    return stored;
  });
  
  // Theme unlocking
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(() => 
    loadFromStorage('unlockedThemes', [])
  );
  const [currentUnlockingTheme, setCurrentUnlockingTheme] = useState<string | null>(null);
  const [themeQuestionProgress, setThemeQuestionProgress] = useState<Record<string, number>>(() => 
    loadFromStorage('themeQuestionProgress', {})
  );
  
  // Reward
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [hasClaimedReward, setHasClaimedReward] = useState(() => loadFromStorage('hasClaimedReward', false));
  
  // Theme votes
  const [themeVotes, setThemeVotes] = useState<Record<string, 'up' | 'down' | null>>(() => 
    loadFromStorage('themeVotes', {})
  );

  // Computed values
  const todayAnsweredCount = dailyData?.questionsAnsweredToday || 0;
  const canAnswerMoreToday = todayAnsweredCount < DAILY_LIMIT;

  // Persist all state
  useEffect(() => {
    localStorage.setItem('pigPoints', JSON.stringify(pigPoints));
  }, [pigPoints]);

  useEffect(() => {
    localStorage.setItem('answeredQuestions', JSON.stringify(answeredQuestions));
  }, [answeredQuestions]);

  useEffect(() => {
    localStorage.setItem('dailyMarketData', JSON.stringify(dailyData));
  }, [dailyData]);

  useEffect(() => {
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
  }, [unlockedThemes]);

  useEffect(() => {
    localStorage.setItem('themeQuestionProgress', JSON.stringify(themeQuestionProgress));
  }, [themeQuestionProgress]);

  useEffect(() => {
    localStorage.setItem('hasClaimedReward', JSON.stringify(hasClaimedReward));
  }, [hasClaimedReward]);

  useEffect(() => {
    localStorage.setItem('themeVotes', JSON.stringify(themeVotes));
  }, [themeVotes]);

  // Check for reward unlock
  useEffect(() => {
    if (pigPoints >= REWARD_THRESHOLD && !hasClaimedReward && !showRewardModal) {
      setShowRewardModal(true);
    }
  }, [pigPoints, hasClaimedReward, showRewardModal]);

  const addPigPoint = () => {
    setPigPoints(prev => prev + 1);
  };

  const markQuestionAnswered = (questionId: string) => {
    setAnsweredQuestions(prev => [...prev, questionId]);
    // Increment daily count for market questions
    if (questionId.startsWith('market-')) {
      setDailyData(prev => ({
        date: prev?.date || getTodayKey(),
        questionsAnsweredToday: (prev?.questionsAnsweredToday || 0) + 1
      }));
    }
  };

  const unlockTheme = (themeId: string) => {
    if (!unlockedThemes.includes(themeId)) {
      setUnlockedThemes(prev => [...prev, themeId]);
    }
  };

  const isThemeUnlocked = (themeId: string) => {
    return unlockedThemes.includes(themeId);
  };

  const advanceThemeQuestion = (themeId: string) => {
    setThemeQuestionProgress(prev => ({
      ...prev,
      [themeId]: (prev[themeId] || 0) + 1
    }));
  };

  const resetThemeProgress = (themeId: string) => {
    setThemeQuestionProgress(prev => ({
      ...prev,
      [themeId]: 0
    }));
  };

  const claimReward = () => {
    setHasClaimedReward(true);
    setShowRewardModal(false);
  };

  const voteTheme = (themeId: string, vote: 'up' | 'down') => {
    setThemeVotes(prev => ({
      ...prev,
      [themeId]: prev[themeId] === vote ? null : vote
    }));
  };

  const resetAllProgress = () => {
    setPigPoints(0);
    setAnsweredQuestions([]);
    setDailyData({ date: getTodayKey(), questionsAnsweredToday: 0 });
    setUnlockedThemes([]);
    setThemeQuestionProgress({});
    setHasClaimedReward(false);
    setThemeVotes({});
    // Clear localStorage
    localStorage.removeItem('pigPoints');
    localStorage.removeItem('answeredQuestions');
    localStorage.removeItem('dailyMarketData');
    localStorage.removeItem('unlockedThemes');
    localStorage.removeItem('themeQuestionProgress');
    localStorage.removeItem('hasClaimedReward');
    localStorage.removeItem('themeVotes');
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
        pigPoints,
        addPigPoint,
        answeredQuestions,
        markQuestionAnswered,
        dailyData,
        canAnswerMoreToday,
        unlockedThemes,
        unlockTheme,
        isThemeUnlocked,
        currentUnlockingTheme,
        setCurrentUnlockingTheme,
        themeQuestionProgress,
        advanceThemeQuestion,
        resetThemeProgress,
        showRewardModal,
        setShowRewardModal,
        hasClaimedReward,
        claimReward,
        themeVotes,
        voteTheme,
        resetAllProgress
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
