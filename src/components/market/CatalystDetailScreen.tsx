import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useApp, Catalyst } from '@/context/AppContext';
import { playlists } from '@/data/playlists';

// Map of ticker symbols to company info for catalysts that reference companies not in playlists
const tickerInfoMap: Record<string, { name: string; description: string; emoji: string }> = {
  AAPL: { name: 'Apple', description: 'Consumer electronics & software', emoji: '🍎' },
  MSFT: { name: 'Microsoft', description: 'Cloud & enterprise software', emoji: '🖥️' },
  GOOGL: { name: 'Google', description: 'Search & AI technology', emoji: '🔍' },
  TSLA: { name: 'Tesla', description: 'Electric vehicles & energy', emoji: '⚡' },
  NVDA: { name: 'NVIDIA', description: 'AI chips & graphics', emoji: '💚' },
  META: { name: 'Meta', description: 'Social media & VR', emoji: '👤' },
  AMZN: { name: 'Amazon', description: 'E-commerce & cloud computing', emoji: '📦' },
};

export function CatalystDetailScreen() {
  const { 
    selectedCatalyst, 
    navigateBack, 
    setCurrentScreen,
    setSelectedPlaylist,
    setSelectedStock 
  } = useApp();

  if (!selectedCatalyst) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No catalyst selected</p>
      </div>
    );
  }

  // Find related theme
  const relatedTheme = playlists.find(p => p.id === selectedCatalyst.themeId);
  
  // Find affected companies with their details - check playlists first, then fallback to tickerInfoMap
  const affectedCompanies = selectedCatalyst.companies
    .map(ticker => {
      // First try to find in playlists
      for (const playlist of playlists) {
        const stock = playlist.stocks.find(s => s.ticker === ticker);
        if (stock) {
          return { 
            ...stock, 
            playlistId: playlist.id, 
            playlistTitle: playlist.title,
            canNavigate: true 
          };
        }
      }
      // Fallback to tickerInfoMap for common tickers
      if (tickerInfoMap[ticker]) {
        return {
          ticker,
          name: tickerInfoMap[ticker].name,
          description: tickerInfoMap[ticker].description,
          emoji: tickerInfoMap[ticker].emoji,
          logoUrl: undefined,
          playlistId: selectedCatalyst.themeId,
          playlistTitle: relatedTheme?.title || 'Related Theme',
          canNavigate: !!relatedTheme,
        };
      }
      // If not found anywhere, still show basic info
      return {
        ticker,
        name: ticker,
        description: 'Company in this catalyst',
        emoji: '📈',
        logoUrl: undefined,
        playlistId: selectedCatalyst.themeId,
        playlistTitle: relatedTheme?.title || 'Related Theme',
        canNavigate: false,
      };
    })
    .filter(Boolean);

  const handleCompanyClick = (company: typeof affectedCompanies[0]) => {
    if (!company) return;
    
    // Find the playlist that contains this stock
    let targetPlaylist = null;
    let targetStock = null;
    
    for (const playlist of playlists) {
      const stock = playlist.stocks.find(s => s.ticker === company.ticker);
      if (stock) {
        targetPlaylist = playlist;
        targetStock = stock;
        break;
      }
    }
    
    if (targetPlaylist && targetStock) {
      setSelectedPlaylist(targetPlaylist);
      setSelectedStock({ ticker: company.ticker, playlist: targetPlaylist });
      setCurrentScreen('company-profile');
      window.scrollTo(0, 0);
    } else if (relatedTheme) {
      // If company not found in any playlist, navigate to the related theme
      setSelectedPlaylist(relatedTheme);
      setCurrentScreen('company-list');
      window.scrollTo(0, 0);
    }
  };

  const handleExploreTheme = () => {
    if (relatedTheme) {
      setSelectedPlaylist(relatedTheme);
      setCurrentScreen('company-list');
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-6">
        <button
          onClick={navigateBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 -ml-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center gap-3 mb-3">
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedCatalyst.impact === 'High' 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {selectedCatalyst.impact} Impact
            </span>
            <span className="text-xs bg-secondary px-2 py-0.5 rounded ml-2">{selectedCatalyst.category}</span>
          </div>
        </div>
        
        <h1 className="text-xl font-bold text-foreground">{selectedCatalyst.title}</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* What's Happening */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">What's Happening</h2>
          <p className="text-sm text-muted-foreground mb-4">{selectedCatalyst.description}</p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Impact Level</p>
              <p className="font-semibold text-foreground">{selectedCatalyst.impact}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Posted</p>
              <p className="font-semibold text-foreground">{selectedCatalyst.time}</p>
            </div>
          </div>
        </motion.div>

        {/* Why It Matters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-primary/5 rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-2">Why It Matters</h2>
          <p className="text-sm text-muted-foreground">
            This {selectedCatalyst.category.toLowerCase()} event could significantly impact stock prices and investor sentiment. 
            {selectedCatalyst.impact === 'High' 
              ? ' High-impact catalysts often drive major price movements.'
              : ' Monitor for developments that could escalate the impact.'}
          </p>
        </motion.div>

        {/* Affected Companies */}
        {affectedCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">Affected Companies</h2>
            <div className="space-y-2">
              {affectedCompanies.map((company) => company && (
                <button
                  key={company.ticker}
                  onClick={() => handleCompanyClick(company)}
                  className="w-full flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-xl">
                    {company.emoji || '📈'}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-foreground truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{company.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Explore Related Industry */}
        {relatedTheme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/10 p-4"
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">Explore {relatedTheme.title}</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Industry affected by this catalyst
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  This event impacts the broader {relatedTheme.title} sector. Want to learn more about companies in this industry?
                </p>
              </div>
            </div>
            <button 
              onClick={handleExploreTheme}
              className="flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Browse {relatedTheme.title} Companies
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
