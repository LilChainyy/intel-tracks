import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';

function StockLogo({ ticker, logoUrl }: { ticker: string; logoUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!logoUrl || imgError) {
    return (
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
        <span className="text-sm font-medium text-muted-foreground">
          {ticker.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={ticker}
      className="w-10 h-10 rounded-lg object-contain bg-muted/50"
      onError={() => setImgError(true)}
    />
  );
}

export function FollowingScreen() {
  const { savedPlaylists, savedStocks, setCurrentScreen, setSelectedPlaylist, setSelectedStock } = useApp();
  const [activeTab, setActiveTab] = useState<'themes' | 'stocks'>('themes');

  const savedPlaylistsData = playlists.filter(p => savedPlaylists.includes(p.id));

  const handlePlaylistClick = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setCurrentScreen('playlist');
    }
  };

  const handleStockClick = (ticker: string, playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setSelectedStock({ ticker, playlist });
      setCurrentScreen('stock');
    }
  };

  const formatYtdChange = (change?: number) => {
    if (change === undefined) return null;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const isEmpty = savedPlaylists.length === 0 && savedStocks.length === 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Saved
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground mt-1"
        >
          Your saved themes and stocks
        </motion.p>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center px-6 py-20"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Nothing saved yet</h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Save themes and stocks to keep track of your favorite investment ideas
          </p>
        </motion.div>
      ) : (
        <>
          {/* Tabs */}
          <div className="px-6 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('themes')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'themes'
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                Themes ({savedPlaylists.length})
              </button>
              <button
                onClick={() => setActiveTab('stocks')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'stocks'
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                Stocks ({savedStocks.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6">
            {activeTab === 'themes' && (
              <div className="space-y-3">
                {savedPlaylistsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No themes saved yet
                  </p>
                ) : (
                  savedPlaylistsData.map((playlist, index) => (
                    <motion.button
                      key={playlist.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handlePlaylistClick(playlist.id)}
                      className="w-full card-surface p-4 flex items-center gap-4 text-left"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={playlist.heroImage}
                          alt={playlist.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{playlist.title}</h3>
                        <p className="text-sm text-muted-foreground">{playlist.stocks.length} stocks</p>
                      </div>
                      <span className={`text-sm font-semibold ${playlist.isPositivePerformance ? 'text-emerald-500' : 'text-red-500'}`}>
                        {playlist.benchmarkPerformance}
                      </span>
                    </motion.button>
                  ))
                )}
              </div>
            )}

            {activeTab === 'stocks' && (
              <div className="space-y-0">
                {savedStocks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No stocks saved yet
                  </p>
                ) : (
                  <>
                    <div className="border-t border-border" />
                    {savedStocks.map((stock, index) => (
                      <motion.div
                        key={stock.ticker}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => handleStockClick(stock.ticker, stock.playlistId)}
                          className="w-full py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <StockLogo ticker={stock.ticker} logoUrl={stock.logoUrl} />
                            <div className="text-left">
                              <span className="font-semibold text-foreground block">{stock.ticker}</span>
                              <span className="text-xs text-muted-foreground">{stock.playlistTitle}</span>
                            </div>
                          </div>
                          {stock.ytdChange !== undefined && (
                            <span className={`text-sm font-semibold ${stock.ytdChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {formatYtdChange(stock.ytdChange)}
                            </span>
                          )}
                        </button>
                        <div className="border-t border-border" />
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
