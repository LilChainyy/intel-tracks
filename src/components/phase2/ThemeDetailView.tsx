import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { themeStories, selectorThemes } from '@/data/themeStoryData';
import { playlists } from '@/data/playlists';
import { getStockRole } from '@/data/stockRoles';
import { useStockData } from '@/hooks/useStockData';
import { StockAssetCard } from './StockAssetCard';

import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Stock } from '@/types/playlist';

export function ThemeDetailView() {
  const {
    currentThemeStoryId,
    setCurrentScreen,
    addViewedTheme,
    phase2ViewedThemes,
    setSelectedStock,
  } = useApp();

  // Voting state
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [votes, setVotes] = useState({ up: 0, down: 0 });
  


  const story = currentThemeStoryId ? themeStories[currentThemeStoryId] : null;
  const playlist = story ? playlists.find((p) => p.id === story.themeId) : null;

  // Get tickers for YTD data
  const tickers = playlist?.stocks.filter((s) => !s.isPrivate).map((s) => s.ticker) || [];
  const { isLoading, formatYtdChange, getStockData } = useStockData(tickers);

  // Calculate average YTD for the theme
  const calculateThemeYtd = () => {
    if (!playlist || isLoading) return null;
    const publicStocks = playlist.stocks.filter(s => !s.isPrivate);
    if (publicStocks.length === 0) return null;
    
    let total = 0;
    let count = 0;
    publicStocks.forEach(stock => {
      const data = getStockData(stock.ticker);
      if (data && data.ytdChange !== null) {
        total += data.ytdChange;
        count++;
      }
    });
    
    if (count === 0) return null;
    const avg = total / count;
    return {
      value: avg,
      formatted: `${avg >= 0 ? '+' : ''}${avg.toFixed(1)}%`,
      isPositive: avg >= 0
    };
  };

  const themeYtd = calculateThemeYtd();

  // Initialize fake votes based on theme
  useEffect(() => {
    if (currentThemeStoryId) {
      // Generate consistent "random" votes based on theme id
      const seed = currentThemeStoryId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const baseUp = 50 + (seed % 30);
      const baseDown = 10 + (seed % 15);
      setVotes({ up: baseUp, down: baseDown });
    }
  }, [currentThemeStoryId]);

  useEffect(() => {
    if (currentThemeStoryId && !phase2ViewedThemes.includes(currentThemeStoryId)) {
      addViewedTheme(currentThemeStoryId);
    }
  }, [currentThemeStoryId, addViewedTheme, phase2ViewedThemes]);

  const handleBack = () => {
    setCurrentScreen('phase2-select');
  };

  const handleVote = (vote: 'up' | 'down') => {
    if (userVote === vote) {
      // Unvote
      setUserVote(null);
      setVotes(prev => ({
        ...prev,
        [vote]: prev[vote] - 1
      }));
    } else {
      // Change vote
      if (userVote) {
        setVotes(prev => ({
          ...prev,
          [userVote]: prev[userVote] - 1,
          [vote]: prev[vote] + 1
        }));
      } else {
        setVotes(prev => ({
          ...prev,
          [vote]: prev[vote] + 1
        }));
      }
      setUserVote(vote);
    }
  };

  const handleStockCardClick = (stock: Stock) => {
    if (playlist) {
      setSelectedStock({ ticker: stock.ticker, playlist });
      setCurrentScreen('stock');
    }
  };

  const totalVotes = votes.up + votes.down;
  const upPercentage = totalVotes > 0 ? Math.round((votes.up / totalVotes) * 100) : 50;
  const downPercentage = totalVotes > 0 ? Math.round((votes.down / totalVotes) * 100) : 50;

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Theme not found</p>
      </div>
    );
  }

  // Get the summary line from act1
  const summaryLine = story.act1.hookLine;
  
  // Get the logic explanation from act2
  const logicExplanation = `${story.act2.inflectionPoint} ${story.act2.stakes}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleBack}
        className="fixed top-4 left-4 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:inline">Back</span>
      </motion.button>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-16 pb-32">
        {/* Theme Header with Summary and Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{story.icon}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {story.title}
              </h1>
            </div>
            
            {/* YTD Metric */}
            {themeYtd && (
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground uppercase">Theme YTD</span>
                <span className={`text-xl font-bold ${themeYtd.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {themeYtd.formatted}
                </span>
              </div>
            )}
          </div>
          
          {/* Summary Line */}
          <p className="text-lg text-foreground/80 leading-relaxed">
            {summaryLine}
          </p>
        </motion.div>

        {/* Voting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 rounded-xl bg-card border border-border"
        >
          <p className="text-sm font-medium text-foreground mb-3">
            Do you believe this theme will outperform?
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote('up')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                userVote === 'up'
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${userVote === 'up' ? 'fill-current' : ''}`} />
              <span className="font-medium">{upPercentage}%</span>
            </button>
            
            <button
              onClick={() => handleVote('down')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                userVote === 'down'
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              <ThumbsDown className={`w-4 h-4 ${userVote === 'down' ? 'fill-current' : ''}`} />
              <span className="font-medium">{downPercentage}%</span>
            </button>
            
            <span className="text-xs text-muted-foreground ml-auto">
              {totalVotes} votes
            </span>
          </div>
        </motion.div>

        {/* Stocks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">
            Stocks in this theme
          </h3>
          
          {playlist && (
            <div className="space-y-3">
              {playlist.stocks.map((stock, index) => {
                const roleData = getStockRole(story.themeId, stock.ticker);
                return (
                  <StockAssetCard
                    key={stock.ticker}
                    stock={stock}
                    roleData={roleData}
                    ytdChange={stock.isPrivate ? undefined : formatYtdChange(stock.ticker)}
                    isLoading={isLoading}
                    isLocked={false}
                    index={index}
                    onClick={() => handleStockCardClick(stock)}
                  />
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Learn More Section - Always Expanded */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-card border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">
                Learn more about this theme
              </span>
            </div>
            
            {/* Content - Always visible */}
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-foreground/80 leading-relaxed text-sm">
                    {logicExplanation}
                  </p>
                  
                  {/* Recent catalyst */}
                  <div className="mt-3 p-3 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      {story.act1.recentCatalyst.date}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {story.act1.recentCatalyst.event}
                    </p>
                    <p className="text-xs text-primary mt-1">
                      {story.act1.recentCatalyst.impact}
                    </p>
                  </div>
                  
                  {/* Why it matters */}
                  <p className="text-foreground/80 leading-relaxed text-sm mt-3">
                    {story.act1.whyItMatters}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
