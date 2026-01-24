import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';
import { catalysts, getCatalystsForCompany } from '@/data/catalysts';
import { supabase } from '@/integrations/supabase/client';
import { StockPriceChart } from '@/components/stock/StockPriceChart';
import { AIAdvisorChat } from '@/components/stock/advisor/AIAdvisorChat';
export function CompanyProfileScreen() {
  const { 
    selectedStock, 
    selectedPlaylist,
    navigateBack,
    setCurrentScreen,
    setSelectedPlaylist,
    setSelectedStock,
    isCompanyWatchlisted,
    toggleWatchlistCompany,
    markCompanyCompleted
  } = useApp();
  
  const [ytdChange, setYtdChange] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const stock = selectedPlaylist?.stocks.find(s => s.ticker === selectedStock?.ticker);
  const companyCatalysts = selectedStock ? getCatalystsForCompany(selectedStock.ticker) : [];

  useEffect(() => {
    async function fetchStockData() {
      if (!selectedStock?.ticker) return;
      
      try {
        const { data } = await supabase
          .from('stock_quotes')
          .select('ytd_change, current_price')
          .eq('ticker', selectedStock.ticker)
          .single();
        
        if (data) {
          setYtdChange(data.ytd_change ? Number(data.ytd_change) : null);
          setCurrentPrice(data.current_price ? Number(data.current_price) : null);
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    }
    
    fetchStockData();
    
    // Mark company as completed after viewing
    if (selectedStock?.ticker) {
      markCompanyCompleted(selectedStock.ticker);
    }
  }, [selectedStock?.ticker, markCompanyCompleted]);

  if (!selectedStock || !stock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No company selected</p>
      </div>
    );
  }

  const isWatchlisted = isCompanyWatchlisted(stock.ticker);

  const handleStarClick = () => {
    toggleWatchlistCompany({
      ticker: stock.ticker,
      name: stock.name,
      playlistId: selectedPlaylist?.id || '',
      playlistTitle: selectedPlaylist?.title || '',
      logoUrl: stock.logoUrl,
    });
  };

  const handleExploreTheme = () => {
    if (selectedPlaylist) {
      setSelectedPlaylist(selectedPlaylist);
      setCurrentScreen('company-list');
    }
  };

  // Get similar companies from the same theme
  const similarCompanies = selectedPlaylist?.stocks
    .filter(s => s.ticker !== stock.ticker)
    .slice(0, 3) || [];

  const handleSimilarCompanyClick = (similarStock: typeof stock) => {
    if (selectedPlaylist) {
      setSelectedStock({ ticker: similarStock.ticker, playlist: selectedPlaylist });
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={navigateBack}
            className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <button
            onClick={handleStarClick}
            className={`p-2 rounded-full transition-colors ${
              isWatchlisted 
                ? 'bg-yellow-100 text-yellow-600' 
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <Star className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        {/* Company Info */}
        <div className="flex items-center gap-4">
          {stock.logoUrl ? (
            <div className="relative">
              <img 
                src={stock.logoUrl} 
                alt={stock.name} 
                className="w-16 h-16 rounded-xl object-cover"
              />
              {stock.emoji && (
                <span className="absolute -bottom-1 -right-1 text-lg">{stock.emoji}</span>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{stock.ticker[0]}</span>
              </div>
              {stock.emoji && (
                <span className="absolute -bottom-1 -right-1 text-lg">{stock.emoji}</span>
              )}
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{stock.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{stock.ticker}</span>
              {currentPrice && (
                <span className="font-semibold">${currentPrice.toFixed(2)}</span>
              )}
              {ytdChange !== null && (
                <div className={`flex items-center gap-1 ${ytdChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {ytdChange >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {ytdChange >= 0 ? '+' : ''}{ytdChange.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Price Chart */}
        {!stock.isPrivate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <StockPriceChart ticker={stock.ticker} />
          </motion.div>
        )}

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
          <p className="text-sm text-muted-foreground">{stock.description}</p>
        </motion.div>

        {/* Today's Catalyst */}
        {companyCatalysts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">Today's Catalyst</h2>
            {companyCatalysts.slice(0, 1).map(catalyst => (
              <div key={catalyst.id} className="flex items-start gap-3">
                <span className="text-xl">{catalyst.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{catalyst.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{catalyst.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* AI Advisor - Thinking Framework */}
        {!stock.isPrivate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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

        {/* Explore Industry Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/10 p-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-2">Explore the Industry</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {stock.name} is part of the {selectedPlaylist?.title} theme
          </p>
          <button 
            onClick={handleExploreTheme}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Browse {selectedPlaylist?.title} Theme
          </button>
        </motion.div>

        {/* Similar Companies */}
        {similarCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">Similar Companies</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {similarCompanies.map(similar => (
                <button
                  key={similar.ticker}
                  onClick={() => handleSimilarCompanyClick(similar)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                >
                  {similar.logoUrl ? (
                    <img 
                      src={similar.logoUrl} 
                      alt={similar.name} 
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{similar.ticker[0]}</span>
                    </div>
                  )}
                  <span className="text-xs font-medium text-foreground">{similar.ticker}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
