import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Lock, Sparkles } from 'lucide-react';
import { useApp, SavedStock } from '@/context/AppContext';
import { StockPriceChart } from './StockPriceChart';
import { AIAdvisorChat } from './advisor';

export function StockDetail() {
  const { selectedStock, setCurrentScreen, toggleSaveStock, isStockSaved } = useApp();
  const [aiChatOpen, setAiChatOpen] = useState(false);

  if (!selectedStock) return null;

  const { ticker, playlist } = selectedStock;
  const stock = playlist.stocks.find((s) => s.ticker === ticker);

  if (!stock) return null;

  const isSaved = isStockSaved(stock.ticker);

  const handleBack = () => {
    setCurrentScreen('playlist');
  };

  const handleSaveStock = () => {
    const savedStock: SavedStock = {
      ticker: stock.ticker,
      name: stock.name,
      playlistId: playlist.id,
      playlistTitle: playlist.title,
      logoUrl: stock.logoUrl,
    };
    toggleSaveStock(savedStock);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 px-6 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="pt-12 md:pt-8 pb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Back</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">{stock.ticker}</h1>
                {stock.isPrivate && (
                  <span className="px-2 py-1 rounded-full bg-amber/20 text-amber text-xs md:text-sm font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </span>
                )}
              </div>
              <p className="text-muted-foreground md:text-lg">{stock.name}</p>
            </div>
          </motion.div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {/* Price Chart - Only for public stocks */}
            {!stock.isPrivate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-surface p-4 md:p-6"
              >
                <StockPriceChart ticker={stock.ticker} />
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-surface p-4 md:p-6"
            >
              <h2 className="text-sm md:text-base font-semibold text-foreground mb-2">About</h2>
              <p className="text-sm md:text-base text-muted-foreground">{stock.description}</p>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Part of theme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-surface p-4 md:p-6"
            >
              <h2 className="text-sm md:text-base font-semibold text-foreground mb-3">Part of Theme</h2>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden">
                  <img
                    src={playlist.heroImage}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-medium text-foreground md:text-lg">{playlist.title}</span>
                  <p className="text-xs md:text-sm text-muted-foreground">{playlist.stocks.length} stocks</p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {stock.isPrivate ? (
                <div className="card-surface p-4 md:p-6 text-center">
                  <Lock className="w-8 h-8 md:w-10 md:h-10 text-amber mx-auto mb-2" />
                  <p className="text-sm md:text-base text-muted-foreground">
                    This is a private company. Trading not available on public markets.
                  </p>
                </div>
              ) : (
                <button 
                  onClick={() => setAiChatOpen(true)}
                  className="w-full py-4 md:py-5 rounded-xl font-medium flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg text-base md:text-lg"
                >
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  Explore the company with AI
                </button>
              )}

              <button 
                onClick={handleSaveStock}
                className={`w-full py-3 md:py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-base ${
                  isSaved
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-foreground text-background'
                }`}
              >
                <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Stock'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Advisor Chat Dialog */}
      <AIAdvisorChat
        open={aiChatOpen}
        onOpenChange={setAiChatOpen}
        ticker={stock.ticker}
        companyName={stock.name}
      />
    </div>
  );
}
