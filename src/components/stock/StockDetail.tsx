import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Newspaper } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StockPriceChart } from './StockPriceChart';
import { AIAdvisorChat } from './advisor';

// Mock news data for today's catalysts
const getMockNews = (ticker: string) => [
  {
    id: '1',
    headline: `${ticker} announces strategic partnership with major tech firm`,
    date: 'Today',
  },
  {
    id: '2',
    headline: `Analysts upgrade ${ticker} price target following strong guidance`,
    date: 'Yesterday',
  },
  {
    id: '3',
    headline: `${ticker} expands operations into new markets amid growing demand`,
    date: '2 days ago',
  },
];

export function StockDetail() {
  const { selectedStock, setCurrentScreen } = useApp();

  if (!selectedStock) return null;

  const { ticker, playlist } = selectedStock;
  const stock = playlist.stocks.find((s) => s.ticker === ticker);

  if (!stock) return null;

  const newsItems = getMockNews(stock.ticker);

  const handleBack = () => {
    setCurrentScreen('phase2-story');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 px-6 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="pt-6 md:pt-8 pb-6">
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

        {/* Content */}
        <div className="space-y-6">
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

          {/* Today's Catalyst - News Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-surface p-4 md:p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-primary" />
              <h2 className="text-sm md:text-base font-semibold text-foreground">Today's Catalyst</h2>
            </div>
            <div className="space-y-3">
              {newsItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                    {item.date}
                  </span>
                  <p className="text-sm text-foreground">{item.headline}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Private stock notice */}
          {stock.isPrivate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-surface p-4 md:p-6 text-center"
            >
              <Lock className="w-8 h-8 md:w-10 md:h-10 text-amber mx-auto mb-2" />
              <p className="text-sm md:text-base text-muted-foreground">
                This is a private company. Trading not available on public markets.
              </p>
            </motion.div>
          )}

          {/* AI Advisor - Always visible for public stocks */}
          {!stock.isPrivate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <AIAdvisorChat
                open={true}
                onOpenChange={() => {}}
                ticker={stock.ticker}
                companyName={stock.name}
                embedded={true}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
