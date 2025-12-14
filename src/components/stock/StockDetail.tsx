import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Plus, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function StockDetail() {
  const { selectedStock, setCurrentScreen } = useApp();

  if (!selectedStock) return null;

  const { ticker, playlist } = selectedStock;
  const stock = playlist.stocks.find((s) => s.ticker === ticker);

  if (!stock) return null;

  const handleBack = () => {
    setCurrentScreen('playlist');
  };

  const handleViewOnYahoo = () => {
    if (!stock.isPrivate) {
      window.open(`https://finance.yahoo.com/quote/${stock.ticker}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen pb-24 px-6">
      {/* Header */}
      <div className="pt-12 pb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{stock.ticker}</h1>
              {stock.isPrivate && (
                <span className="px-2 py-1 rounded-full bg-amber/20 text-amber text-xs font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-surface p-4 mb-4"
      >
        <h2 className="text-sm font-semibold text-foreground mb-2">About</h2>
        <p className="text-sm text-muted-foreground">{stock.description}</p>
      </motion.div>

      {/* Part of theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-surface p-4 mb-6"
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">Part of Theme</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden">
            <img
              src={playlist.heroImage}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{playlist.emoji}</span>
              <span className="font-medium text-foreground">{playlist.title}</span>
            </div>
            <p className="text-xs text-muted-foreground">{playlist.stocks.length} stocks</p>
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
          <div className="card-surface p-4 text-center">
            <Lock className="w-8 h-8 text-amber mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              This is a private company. Trading not available on public markets.
            </p>
          </div>
        ) : (
          <button
            onClick={handleViewOnYahoo}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View on Yahoo Finance
          </button>
        )}

        <button className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add to Watchlist
        </button>
      </motion.div>
    </div>
  );
}
