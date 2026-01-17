import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/types/playlist';
import { StockRoleData } from '@/data/stockRoles';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface MicroResearchDrawerProps {
  stock: Stock | null;
  roleData?: StockRoleData;
  ytdChange?: string;
  isOpen: boolean;
  onClose: () => void;
  onViewFull: () => void;
}

type VoteType = 'bullish' | 'bearish' | null;

export function MicroResearchDrawer({
  stock,
  roleData,
  ytdChange,
  isOpen,
  onClose,
  onViewFull,
}: MicroResearchDrawerProps) {
  const [userVote, setUserVote] = useState<VoteType>(null);

  // Generate pseudo-random but consistent percentages based on ticker
  const vibeData = useMemo(() => {
    if (!stock) return { bullish: 65, bearish: 35 };
    const hash = stock.ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const bullish = 55 + (hash % 35); // 55-90%
    return {
      bullish: userVote === 'bullish' ? Math.min(bullish + 2, 95) : bullish,
      bearish: userVote === 'bearish' ? Math.min(100 - bullish + 2, 45) : 100 - bullish,
    };
  }, [stock, userVote]);

  const isPositive = ytdChange && !ytdChange.startsWith('-') && ytdChange !== 'N/A';
  const isNegative = ytdChange && ytdChange.startsWith('-');

  const handleVote = (vote: VoteType) => {
    setUserVote(vote === userVote ? null : vote);
  };

  if (!stock) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="relative pb-2">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-border">
              {stock.logoUrl ? (
                <img
                  src={stock.logoUrl}
                  alt={stock.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {stock.ticker.slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <DrawerTitle className="text-xl flex items-center gap-2">
                {stock.ticker}
                {!stock.isPrivate && ytdChange && ytdChange !== 'N/A' && (
                  <span
                    className={`text-sm font-medium flex items-center gap-1 ${
                      isPositive
                        ? 'text-emerald'
                        : isNegative
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {isPositive && <TrendingUp className="w-3 h-3" />}
                    {isNegative && <TrendingDown className="w-3 h-3" />}
                    {ytdChange}
                  </span>
                )}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">{stock.name}</p>
              {roleData && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {roleData.role}
                </span>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-6">
          {/* Micro Research */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-foreground leading-relaxed">
              {roleData?.microResearch || stock.description}
            </p>
          </div>

          {/* Vibe Check */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Vibe Check
            </h4>

            {/* Vote buttons */}
            <div className="flex gap-3">
              <Button
                variant={userVote === 'bullish' ? 'default' : 'outline'}
                className={`flex-1 gap-2 ${
                  userVote === 'bullish'
                    ? 'bg-emerald hover:bg-emerald/90 text-white border-emerald'
                    : ''
                }`}
                onClick={() => handleVote('bullish')}
              >
                🐂 Bullish
              </Button>
              <Button
                variant={userVote === 'bearish' ? 'default' : 'outline'}
                className={`flex-1 gap-2 ${
                  userVote === 'bearish'
                    ? 'bg-destructive hover:bg-destructive/90 text-white border-destructive'
                    : ''
                }`}
                onClick={() => handleVote('bearish')}
              >
                🐻 Bearish
              </Button>
            </div>

            {/* Percentage bars */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm w-16">🐂 Bullish</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${vibeData.bullish}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {vibeData.bullish}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm w-16">🐻 Bearish</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-destructive rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${vibeData.bearish}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {vibeData.bearish}%
                </span>
              </div>
            </div>
          </div>

          {/* View Full Analysis */}
          <Button
            onClick={onViewFull}
            className="w-full gap-2"
            variant="outline"
          >
            View Full Analysis
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
