import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useStockData } from '@/hooks/useStockData';
import { ThemeIllustration } from './ThemeIllustration';
import { PredictionCard } from './PredictionCard';
import { usePredictions } from '@/hooks/usePredictions';
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
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
      whileTap={{ scale: 0.98 }}
    >
      {/* Logo */}
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
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
          <span className="text-xs font-bold text-muted-foreground">
            {stock.ticker.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{stock.ticker}</span>
          {stock.isPrivate && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber/20 text-amber">
              Private
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
      </div>

      {/* YTD Change */}
      {!stock.isPrivate && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {isLoading ? (
            <div className="w-12 h-4 bg-secondary animate-pulse rounded" />
          ) : ytdChange && ytdChange !== 'N/A' ? (
            <>
              {isPositive && <TrendingUp className="w-3 h-3 text-emerald" />}
              {isNegative && <TrendingDown className="w-3 h-3 text-destructive" />}
              <span
                className={`text-sm font-medium ${
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

export function PlaylistDetail() {
  const { selectedPlaylist, setCurrentScreen, setSelectedStock, savedPlaylists, toggleSavePlaylist } = useApp();
  const { hasPrediction } = usePredictions();

  const tickers = selectedPlaylist?.stocks
    .filter((s) => !s.isPrivate)
    .map((s) => s.ticker) || [];

  const { isLoading, formatYtdChange } = useStockData(tickers);

  if (!selectedPlaylist) return null;

  const isSaved = savedPlaylists.includes(selectedPlaylist.id);
  const hasMadePrediction = hasPrediction(selectedPlaylist.id);

  const handleBack = () => {
    setCurrentScreen('discovery');
  };

  const handleStockClick = (ticker: string) => {
    setSelectedStock({ ticker, playlist: selectedPlaylist });
    setCurrentScreen('stock');
  };

  const handleSave = () => {
    toggleSavePlaylist(selectedPlaylist.id);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-48 bg-gradient-to-b from-secondary to-background flex items-center justify-center">
        <ThemeIllustration themeId={selectedPlaylist.id} className="w-24 h-24 opacity-80" />
        
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-12 left-4 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute top-12 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm"
        >
          {hasMadePrediction ? (
            <Check className="w-5 h-5 text-emerald" />
          ) : (
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary text-primary' : 'text-foreground'}`} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">{selectedPlaylist.title}</h1>
          <div className="flex flex-wrap gap-2">
            {selectedPlaylist.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-secondary text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Featured Stock */}
        {selectedPlaylist.featuredStock && (() => {
          const featured = selectedPlaylist.stocks.find(s => s.ticker === selectedPlaylist.featuredStock);
          if (!featured) return null;
          const ytdChange = featured.isPrivate ? undefined : formatYtdChange(featured.ticker);
          const isPositive = ytdChange && !ytdChange.startsWith('-') && ytdChange !== 'N/A';
          const isNegative = ytdChange && ytdChange.startsWith('-');
          
          return (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => handleStockClick(featured.ticker)}
              className="w-full card-surface p-4 mb-4 flex items-center gap-4 text-left"
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {featured.logoUrl ? (
                  <img
                    src={featured.logoUrl}
                    alt={featured.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    {featured.ticker.slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground">{featured.ticker}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                    Top Pick
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{featured.name}</p>
              </div>
              {!featured.isPrivate && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isLoading ? (
                    <div className="w-14 h-5 bg-secondary animate-pulse rounded" />
                  ) : ytdChange && ytdChange !== 'N/A' ? (
                    <span className={`text-sm font-semibold ${isPositive ? 'text-emerald' : isNegative ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {ytdChange}
                    </span>
                  ) : null}
                </div>
              )}
            </motion.button>
          );
        })()}

        {/* Signal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-surface p-4 mb-4"
        >
          <h2 className="text-sm font-semibold text-foreground mb-2">📡 Signal</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{selectedPlaylist.signal}</p>
        </motion.div>

        {/* Thesis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-surface p-4 mb-4"
        >
          <h2 className="text-sm font-semibold text-foreground mb-2">💡 Thesis</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{selectedPlaylist.thesis}</p>
        </motion.div>

        {/* Prediction Card */}
        <PredictionCard playlistId={selectedPlaylist.id} />

        {/* Stocks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Stocks ({selectedPlaylist.stocks.length})
          </h2>
          <div className="card-surface p-2">
            {selectedPlaylist.stocks.map((stock) => (
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
      </div>
    </div>
  );
}
