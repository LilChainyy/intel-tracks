import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Newspaper, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NewsItem {
  id: string;
  headline: string;
  type: 'catalyst' | 'news';
  date: string;
  ticker?: string;
}

// Mock data for catalysts and news
const marketUpdates: NewsItem[] = [
  {
    id: '1',
    headline: 'Fed meeting scheduled for next week - rate decision expected',
    type: 'catalyst',
    date: 'Jan 28',
  },
  {
    id: '2',
    headline: 'NVDA reports Q4 earnings after market close Thursday',
    type: 'catalyst',
    date: 'Jan 23',
    ticker: 'NVDA',
  },
  {
    id: '3',
    headline: 'AAPL announces new AI features for iPhone lineup',
    type: 'news',
    date: 'Today',
    ticker: 'AAPL',
  },
  {
    id: '4',
    headline: 'CPI data release expected to show cooling inflation',
    type: 'catalyst',
    date: 'Jan 25',
  },
  {
    id: '5',
    headline: 'TSLA deliveries beat analyst expectations in Q4',
    type: 'news',
    date: 'Yesterday',
    ticker: 'TSLA',
  },
  {
    id: '6',
    headline: 'Jobs report shows stronger than expected hiring',
    type: 'news',
    date: 'Today',
  },
];

export function MarketScreen() {
  const { setCurrentScreen } = useApp();
  
  const catalysts = marketUpdates.filter(item => item.type === 'catalyst');
  const news = marketUpdates.filter(item => item.type === 'news');

  const handleBack = () => {
    setCurrentScreen('game-map');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleBack}
        className="fixed top-20 left-4 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:inline">Back to Map</span>
      </motion.button>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-24 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Market Pulse
            </h1>
          </div>
          <p className="text-muted-foreground">
            Stay ahead with upcoming catalysts and breaking news
          </p>
        </motion.div>

        {/* Upcoming Catalysts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Upcoming Catalysts</h2>
          </div>
          
          <div className="space-y-2">
            {catalysts.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                  {item.date}
                </span>
                <p className="text-sm text-foreground flex-1">
                  {item.headline}
                </p>
                {item.ticker && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {item.ticker}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Breaking News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Breaking News</h2>
          </div>
          
          <div className="space-y-2">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                  {item.date}
                </span>
                <p className="text-sm text-foreground flex-1">
                  {item.headline}
                </p>
                {item.ticker && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {item.ticker}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
