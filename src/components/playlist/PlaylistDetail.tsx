import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useStockData } from '@/hooks/useStockData';
import { ThemeIllustration } from './ThemeIllustration';
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

export function PlaylistDetail() {
  const { selectedPlaylist, setCurrentScreen, setSelectedStock, savedPlaylists, toggleSavePlaylist } = useApp();

  const tickers = selectedPlaylist?.stocks
    .filter((s) => !s.isPrivate)
    .map((s) => s.ticker) || [];

  const { isLoading, formatYtdChange } = useStockData(tickers);

  if (!selectedPlaylist) return null;

  const isSaved = savedPlaylists.includes(selectedPlaylist.id);

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
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Hero Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-b from-secondary to-background flex items-center justify-center">
        <ThemeIllustration themeId={selectedPlaylist.id} className="w-24 h-24 md:w-32 md:h-32 opacity-80" />
        
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-12 md:top-8 left-4 md:left-8 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Back</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute top-12 md:top-8 right-4 md:right-8 p-2 md:p-3 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <Bookmark className={`w-5 h-5 md:w-6 md:h-6 ${isSaved ? 'fill-primary text-primary' : 'text-foreground'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 md:px-8 lg:px-12 -mt-4 max-w-4xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">{selectedPlaylist.title}</h1>
          <div className="flex flex-wrap gap-2">
            {selectedPlaylist.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 md:px-3 py-1 rounded-full bg-secondary text-xs md:text-sm text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Signal & Thesis */}
          <div className="space-y-4">
            {/* Signal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-surface p-4 md:p-6"
            >
              <h2 className="text-sm md:text-base font-semibold text-foreground mb-2">📡 Signal</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{selectedPlaylist.signal}</p>
            </motion.div>

            {/* Thesis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-surface p-4 md:p-6"
            >
              <h2 className="text-sm md:text-base font-semibold text-foreground mb-2">💡 Thesis</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{selectedPlaylist.thesis}</p>
            </motion.div>
          </div>

          {/* Right column: Stocks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm md:text-base font-semibold text-foreground mb-3">
              Stocks ({selectedPlaylist.stocks.length})
            </h2>
            <div className="card-surface p-2 md:p-3">
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
    </div>
  );
}
