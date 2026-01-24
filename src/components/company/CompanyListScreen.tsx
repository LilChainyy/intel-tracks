import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ChevronRight, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';

export function CompanyListScreen() {
  const { 
    selectedPlaylist, 
    setCurrentScreen, 
    setSelectedStock,
    navigateBack,
    isCompanyWatchlisted,
    toggleWatchlistCompany,
    isCompanyCompleted
  } = useApp();
  
  const [ytdData, setYtdData] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchYTDData() {
      if (!selectedPlaylist) return;
      
      try {
        const tickers = selectedPlaylist.stocks.map(s => s.ticker);
        const { data, error } = await supabase
          .from('stock_quotes')
          .select('ticker, ytd_change')
          .in('ticker', tickers);
        
        if (data) {
          const ytdMap: Record<string, number | null> = {};
          data.forEach(item => {
            ytdMap[item.ticker] = item.ytd_change ? Number(item.ytd_change) : null;
          });
          setYtdData(ytdMap);
        }
      } catch (error) {
        console.error('Error fetching YTD data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchYTDData();
  }, [selectedPlaylist]);

  if (!selectedPlaylist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No theme selected</p>
      </div>
    );
  }

  const handleBack = () => {
    navigateBack();
  };

  const handleCompanyClick = (ticker: string) => {
    setSelectedStock({ ticker, playlist: selectedPlaylist });
    setCurrentScreen('company-profile');
    window.scrollTo(0, 0);
  };

  const handleStarClick = (e: React.MouseEvent, stock: typeof selectedPlaylist.stocks[0]) => {
    e.stopPropagation();
    toggleWatchlistCompany({
      ticker: stock.ticker,
      name: stock.name,
      playlistId: selectedPlaylist.id,
      playlistTitle: selectedPlaylist.title,
      logoUrl: stock.logoUrl,
    });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{selectedPlaylist.title}</h1>
            <p className="text-sm text-muted-foreground">{selectedPlaylist.stocks.length} companies</p>
          </div>
        </div>
        
        {/* Theme Thesis Summary */}
        <p className="text-sm text-muted-foreground line-clamp-2">{selectedPlaylist.thesis}</p>
      </div>

      {/* Company List */}
      <div className="px-4 py-4 space-y-3">
        {selectedPlaylist.stocks.map((stock, index) => {
          const ytdChange = ytdData[stock.ticker];
          const isWatchlisted = isCompanyWatchlisted(stock.ticker);
          const isCompleted = isCompanyCompleted(stock.ticker);
          
          return (
            <motion.button
              key={stock.ticker}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCompanyClick(stock.ticker)}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
            >
              {/* Logo */}
              <div className="relative">
                {stock.logoUrl ? (
                  <img 
                    src={stock.logoUrl} 
                    alt={stock.name} 
                    className="w-12 h-12 rounded-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{stock.ticker[0]}</span>
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  {stock.emoji && <span className="text-base">{stock.emoji}</span>}
                  <span className="font-bold text-foreground">{stock.ticker}</span>
                  {isCompleted && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Learned</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                
                {/* YTD Change */}
                {!loading && ytdChange !== null && (
                  <div className={`flex items-center gap-1 mt-1 ${ytdChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {ytdChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-xs font-medium">
                      {ytdChange >= 0 ? '+' : ''}{ytdChange.toFixed(1)}% YTD
                    </span>
                  </div>
                )}
              </div>
              
              {/* Star Button */}
              <button
                onClick={(e) => handleStarClick(e, stock)}
                className={`p-2 rounded-full transition-colors ${
                  isWatchlisted 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                <Star className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
              </button>
              
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
