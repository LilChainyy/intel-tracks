import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Playlist } from '@/types/playlist';

type Screen = 'quiz' | 'discovery' | 'playlist' | 'stock' | 'profile';

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  selectedPlaylist: Playlist | null;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  selectedStock: { ticker: string; playlist: Playlist } | null;
  setSelectedStock: (stock: { ticker: string; playlist: Playlist } | null) => void;
  quizCompleted: boolean;
  setQuizCompleted: (completed: boolean) => void;
  followedPlaylists: string[];
  toggleFollowPlaylist: (playlistId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('quiz');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; playlist: Playlist } | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [followedPlaylists, setFollowedPlaylists] = useState<string[]>([]);

  const toggleFollowPlaylist = (playlistId: string) => {
    setFollowedPlaylists(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
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
        followedPlaylists,
        toggleFollowPlaylist
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
