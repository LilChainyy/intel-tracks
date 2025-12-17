import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, ChevronDown, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Stock } from '@/types/playlist';
import { ThemeIllustration } from './ThemeIllustration';
import { useStockDataContext } from '@/context/StockDataContext';

function StockLogo({ ticker, logoUrl, name }: { ticker: string; logoUrl?: string; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (!logoUrl || imgError) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <span className="text-sm font-bold text-muted-foreground">
          {ticker.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      className="w-8 h-8 rounded-full object-contain bg-muted/50"
      onError={() => setImgError(true)}
    />
  );
}

function StockRow({ stock, onClick }: { stock: Stock; onClick: () => void }) {
  const { getStockData, isLoading } = useStockDataContext();
  
  // Get live data from API (skip for private companies)
  const liveData = !stock.isPrivate ? getStockData(stock.ticker) : null;
  const ytdChange = liveData?.ytdChange;
  const isPositive = liveData?.isPositive ?? true;

  const formatYtdChange = (change?: number) => {
    if (change === undefined) return null;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}% YTD`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full py-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors -mx-6 px-6 text-left"
    >
      <StockLogo ticker={stock.ticker} logoUrl={stock.logoUrl} name={stock.name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{stock.name}</span>
          <span className="text-muted-foreground text-sm">({stock.ticker})</span>
          {stock.isPrivate && (
            <span className="px-2 py-0.5 rounded-full bg-amber/20 text-amber text-xs">
              Private
            </span>
          )}
        </div>
        {stock.description && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{stock.description}</p>
        )}
      </div>
      {!stock.isPrivate && (
        isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
        ) : ytdChange !== undefined ? (
          <span className={`text-sm font-semibold flex-shrink-0 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatYtdChange(ytdChange)}
          </span>
        ) : null
      )}
    </button>
  );
}

export function PlaylistDetail() {
  const { selectedPlaylist, setCurrentScreen, setSelectedStock, savedPlaylists, toggleSavePlaylist } = useApp();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

  if (!selectedPlaylist) return null;

  const isSaved = savedPlaylists.includes(selectedPlaylist.id);

  const handleBack = () => {
    setCurrentScreen('discovery');
  };

  const handleStockClick = (stock: Stock) => {
    setSelectedStock({ ticker: stock.ticker, playlist: selectedPlaylist });
    setCurrentScreen('stock');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero section - Minna Bank style */}
      <div className="relative bg-muted/30 pt-12 pb-8">
        {/* Navigation */}
        <div className="flex items-center justify-between px-4 mb-8">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <ThemeIllustration 
            themeId={selectedPlaylist.id} 
            className="w-32 h-32 text-foreground"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center px-6">
          {selectedPlaylist.title}
        </h1>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">

        {/* The Signal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h2 className="section-header">THE SIGNAL</h2>
          <p className="text-foreground leading-relaxed">{selectedPlaylist.signal}</p>
        </motion.div>

        {/* The Thesis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <h2 className="section-header">THE THESIS</h2>
          <p className="text-muted-foreground leading-relaxed">{selectedPlaylist.thesis}</p>
        </motion.div>

        {/* Full Analysis (Expandable) */}
        {selectedPlaylist.fullAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
              className="w-full flex items-center justify-between p-4 bg-secondary rounded-xl transition-colors hover:bg-secondary/80"
            >
              <span className="text-sm font-medium text-foreground">Full Analysis</span>
              <motion.div
                animate={{ rotate: isAnalysisExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </button>
            <AnimatePresence>
              {isAnalysisExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-secondary/50 rounded-b-xl -mt-2 pt-6">
                    <div className="prose prose-sm prose-invert max-w-none">
                      {selectedPlaylist.fullAnalysis.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                          return <h3 key={i} className="text-foreground font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={i} className="text-muted-foreground text-sm ml-4">{line.replace('- ', '')}</li>;
                        }
                        if (line.trim()) {
                          return <p key={i} className="text-muted-foreground text-sm mb-2">{line}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-2"
        >
          {selectedPlaylist.tags.map((tag) => (
            <span 
              key={tag} 
              className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => toggleSavePlaylist(selectedPlaylist.id)}
            className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              isSaved
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-foreground text-background'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save This Theme'}
          </button>
        </motion.div>

        {/* Stock list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-0"
        >
          <div className="border-t border-border" />
          {selectedPlaylist.stocks.map((stock, index) => (
            <motion.div
              key={stock.ticker}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <StockRow 
                stock={stock} 
                onClick={() => handleStockClick(stock)} 
              />
              <div className="border-t border-border" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
