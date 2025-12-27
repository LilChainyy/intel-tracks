import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StockPriceChart } from './StockPriceChart';

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
          className="flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
            {stock.logoUrl ? (
              <img src={stock.logoUrl} alt={stock.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">
                {stock.ticker.slice(0, 2)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{stock.ticker}</h1>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>
        </motion.div>
      </div>

      {!stock.isPrivate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <StockPriceChart ticker={stock.ticker} />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{stock.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Part of theme</h3>
          <p className="font-medium">{playlist.title}</p>
        </div>

        {!stock.isPrivate && (
          <button
            onClick={handleViewOnYahoo}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-secondary text-secondary-foreground"
          >
            <ExternalLink className="w-4 h-4" />
            View on Yahoo Finance
          </button>
        )}
      </motion.div>
    </div>
  );
}
