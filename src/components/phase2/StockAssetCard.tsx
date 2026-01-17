import { motion } from 'framer-motion';
import { Lock, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/types/playlist';
import { StockRoleData } from '@/data/stockRoles';

interface StockAssetCardProps {
  stock: Stock;
  roleData?: StockRoleData;
  ytdChange?: string;
  isLoading: boolean;
  isLocked: boolean;
  index: number;
  onClick: () => void;
}

export function StockAssetCard({
  stock,
  roleData,
  ytdChange,
  isLoading,
  isLocked,
  index,
  onClick,
}: StockAssetCardProps) {
  const isPositive = ytdChange && !ytdChange.startsWith('-') && ytdChange !== 'N/A';
  const isNegative = ytdChange && ytdChange.startsWith('-');

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center gap-3"
      >
        <Lock className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground font-medium">Locked</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 text-left group"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-border group-hover:ring-primary/50 transition-all">
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
            <span className="text-sm font-bold text-muted-foreground">
              {stock.ticker.slice(0, 2)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg text-foreground">{stock.ticker}</span>
            {roleData && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {roleData.role}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
        </div>

        {/* Mini Sparkline (placeholder) + YTD */}
        <div className="flex flex-col items-end gap-1">
          {/* Mini sparkline visual */}
          <div className="flex items-end gap-0.5 h-4">
            {[3, 5, 4, 7, 6, 8, 7, 9].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${
                  isPositive ? 'bg-emerald/60' : isNegative ? 'bg-destructive/60' : 'bg-muted-foreground/40'
                }`}
                style={{ height: `${h * 2}px` }}
              />
            ))}
          </div>

          {/* YTD */}
          {!stock.isPrivate && (
            <div className="flex items-center gap-1">
              {isLoading ? (
                <div className="w-10 h-3 bg-muted animate-pulse rounded" />
              ) : ytdChange && ytdChange !== 'N/A' ? (
                <>
                  {isPositive && <TrendingUp className="w-3 h-3 text-emerald" />}
                  {isNegative && <TrendingDown className="w-3 h-3 text-destructive" />}
                  <span
                    className={`text-xs font-medium ${
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
        </div>
      </div>
    </motion.button>
  );
}
