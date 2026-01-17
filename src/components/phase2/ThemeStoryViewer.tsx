import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { themeStories, selectorThemes } from '@/data/themeStoryData';
import { playlists } from '@/data/playlists';
import { useStockData } from '@/hooks/useStockData';
import { StoryProgressIndicator } from './StoryProgressIndicator';
import { PostStoryChoice } from './PostStoryChoice';
import { ArrowLeft, ChevronDown, TrendingUp, TrendingDown, Calendar, Layers, Eye, Radio, Lightbulb } from 'lucide-react';
import { Stock } from '@/types/playlist';

interface StockRowProps {
  stock: Stock;
  ytdChange?: string;
  isLoading: boolean;
  onClick: () => void;
}

function StockRow({ stock, ytdChange, isLoading, onClick }: StockRowProps) {
  const isPositive = ytdChange && !ytdChange.startsWith('-') && ytdChange !== 'N/A';
  const isNegative = ytdChange && ytdChange.startsWith('-');

  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 md:p-4 rounded-xl hover:bg-secondary/50 transition-colors text-left"
      whileTap={{ scale: 0.98 }}
    >
      {/* Logo */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
        {stock.logoUrl ? (
          <img
            src={stock.logoUrl}
            alt={stock.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-xs md:text-sm font-bold text-muted-foreground">
            {stock.ticker.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground md:text-lg">{stock.ticker}</span>
          {stock.isPrivate && (
            <span className="text-[10px] md:text-xs px-1.5 py-0.5 rounded bg-amber/20 text-amber">
              Private
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-muted-foreground truncate">{stock.name}</p>
      </div>

      {/* YTD Change */}
      {!stock.isPrivate && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {isLoading ? (
            <div className="w-12 h-4 bg-secondary animate-pulse rounded" />
          ) : ytdChange && ytdChange !== 'N/A' ? (
            <>
              {isPositive && <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-emerald" />}
              {isNegative && <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-destructive" />}
              <span
                className={`text-sm md:text-base font-medium ${
                  isPositive
                    ? 'text-emerald'
                    : isNegative
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {ytdChange}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      )}
    </motion.button>
  );
}

export function ThemeStoryViewer() {
  const { currentThemeStoryId, setCurrentScreen, addViewedTheme, phase2ViewedThemes, setSelectedStock } = useApp();
  const [currentAct, setCurrentAct] = useState(1);
  const [showPostChoice, setShowPostChoice] = useState(false);
  
  const act1Ref = useRef<HTMLDivElement>(null);
  const act2Ref = useRef<HTMLDivElement>(null);
  const act3Ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const story = currentThemeStoryId ? themeStories[currentThemeStoryId] : null;
  const playlist = story ? playlists.find(p => p.id === story.themeId) : null;
  
  // Get tickers for YTD data
  const tickers = playlist?.stocks
    .filter((s) => !s.isPrivate)
    .map((s) => s.ticker) || [];

  const { isLoading, formatYtdChange } = useStockData(tickers);

  useEffect(() => {
    if (currentThemeStoryId && !phase2ViewedThemes.includes(currentThemeStoryId)) {
      addViewedTheme(currentThemeStoryId);
    }
  }, [currentThemeStoryId, addViewedTheme, phase2ViewedThemes]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const windowHeight = containerRef.current.clientHeight;
      
      const act1Top = act1Ref.current?.offsetTop || 0;
      const act2Top = act2Ref.current?.offsetTop || 0;
      const act3Top = act3Ref.current?.offsetTop || 0;
      
      const scrollPosition = scrollTop + windowHeight / 2;
      
      if (scrollPosition >= act3Top) {
        setCurrentAct(3);
      } else if (scrollPosition >= act2Top) {
        setCurrentAct(2);
      } else {
        setCurrentAct(1);
      }

      // Check if near bottom to show post-story choice
      const scrollHeight = containerRef.current.scrollHeight;
      if (scrollTop + windowHeight >= scrollHeight - 100) {
        setShowPostChoice(true);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    setCurrentScreen('phase2-select');
  };

  const handleSeeAnother = () => {
    setCurrentScreen('phase2-select');
  };

  const handleStockClick = (ticker: string) => {
    if (playlist) {
      setSelectedStock({ ticker, playlist });
      setCurrentScreen('stock');
    }
  };

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Theme not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
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

      {/* Progress Indicator */}
      <StoryProgressIndicator currentAct={currentAct} totalActs={3} />

      {/* Scrollable Content */}
      <div 
        ref={containerRef}
        className="h-screen overflow-y-auto scroll-smooth"
      >
        <div className="max-w-2xl mx-auto px-4 md:px-6 pt-16 pb-8">
          {/* Theme Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-5xl mb-4 block">{story.icon}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {story.title}
            </h1>
          </motion.div>

          {/* ACT 1: What Just Happened */}
          <div ref={act1Ref} className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Hook Line */}
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {story.act1.hookLine}
              </h2>

              {/* Recent Catalyst */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{story.act1.recentCatalyst.date}</span>
                </div>
                <p className="font-medium text-foreground">
                  {story.act1.recentCatalyst.event}
                </p>
                <p className="text-sm text-primary font-medium">
                  {story.act1.recentCatalyst.impact}
                </p>
              </div>

              {/* Why It Matters */}
              <p className="text-lg text-foreground/90 leading-relaxed">
                {story.act1.whyItMatters}
              </p>

              {/* Pattern */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-foreground/80 leading-relaxed">
                  {story.act1.pattern}
                </p>
              </div>

              {/* Scroll indicator */}
              <div className="flex flex-col items-center pt-8 text-muted-foreground animate-pulse">
                <span className="text-sm mb-2">Scroll for more</span>
                <ChevronDown className="w-5 h-5" />
              </div>
            </motion.div>
          </div>

          {/* ACT 2: Where This Goes */}
          <div ref={act2Ref} className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold uppercase tracking-wide text-foreground">
                  Where This Goes
                </h3>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 text-sm font-medium text-primary">2025</div>
                  <p className="flex-1 text-foreground/90">{story.act2.near}</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 text-sm font-medium text-primary">2026-27</div>
                  <p className="flex-1 text-foreground/90">{story.act2.medium}</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 text-sm font-medium text-primary">2028+</div>
                  <p className="flex-1 text-foreground/90">{story.act2.far}</p>
                </div>
              </div>

              {/* Inflection Point */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-medium text-foreground mb-2">The Inflection Point</p>
                <p className="text-foreground/80">{story.act2.inflectionPoint}</p>
              </div>

              {/* Stakes */}
              <p className="text-lg font-medium text-foreground italic">
                "{story.act2.stakes}"
              </p>

              {/* Scroll indicator */}
              <div className="flex flex-col items-center pt-8 text-muted-foreground animate-pulse">
                <span className="text-sm mb-2">Scroll for more</span>
                <ChevronDown className="w-5 h-5" />
              </div>
            </motion.div>
          </div>

          {/* ACT 3: How to Play It */}
          <div ref={act3Ref} className="mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold uppercase tracking-wide text-foreground">
                  How to Play It
                </h3>
              </div>

              {/* The Stack */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  The Stack
                </p>
                {story.act3.layers.map((layer, index) => (
                  <div key={index} className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Layer {index + 1}: {layer.category}</p>
                    <p className="font-mono text-foreground">→ {layer.examples}</p>
                  </div>
                ))}
              </div>

              {/* Recent Moves */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Recent Moves
                  </p>
                </div>
                <ul className="space-y-2">
                  {story.act3.recentMoves.map((move, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span className="font-mono text-sm text-foreground">{move}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's Next */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  What's Next
                </p>
                <ul className="space-y-2">
                  {story.act3.whatsNext.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-foreground/80">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Signal & Thesis Section */}
          {playlist && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-8 space-y-4"
            >
              {/* Signal */}
              <div className="p-4 md:p-6 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Signal</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed">{playlist.signal}</p>
              </div>

              {/* Thesis */}
              <div className="p-4 md:p-6 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Thesis</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed">{playlist.thesis}</p>
              </div>
            </motion.div>
          )}

          {/* Stocks Section */}
          {playlist && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">
                Stocks ({playlist.stocks.length})
              </h3>
              <div className="rounded-lg bg-card border border-border p-2 md:p-3">
                {playlist.stocks.map((stock) => (
                  <StockRow
                    key={stock.ticker}
                    stock={stock}
                    ytdChange={stock.isPrivate ? undefined : formatYtdChange(stock.ticker)}
                    isLoading={isLoading}
                    onClick={() => handleStockClick(stock.ticker)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Post Story Choice */}
          <PostStoryChoice
            onSeeAnother={handleSeeAnother}
            viewedCount={phase2ViewedThemes.length}
            totalCount={selectorThemes.length}
          />
        </div>
      </div>

      {/* Mobile Progress Indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:hidden flex gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
        {[1, 2, 3].map((act) => (
          <div
            key={act}
            className={`w-2 h-2 rounded-full transition-colors ${
              act <= currentAct ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
