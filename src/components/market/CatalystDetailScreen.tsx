import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useApp, Catalyst } from '@/context/AppContext';
import { playlists } from '@/data/playlists';

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
  
  // Find affected companies with their details
  const affectedCompanies = selectedCatalyst.companies
    .map(ticker => {
      for (const playlist of playlists) {
        const stock = playlist.stocks.find(s => s.ticker === ticker);
        if (stock) {
          return { ...stock, playlistId: playlist.id, playlistTitle: playlist.title };
        }
      }
      return null;
    })
    .filter(Boolean);

  const handleCompanyClick = (ticker: string) => {
    const company = affectedCompanies.find(c => c?.ticker === ticker);
    if (company) {
      const playlist = playlists.find(p => p.id === company.playlistId);
      if (playlist) {
        setSelectedPlaylist(playlist);
        setSelectedStock({ ticker, playlist });
        setCurrentScreen('company-profile');
      }
    }
  };

  const handleExploreTheme = () => {
    if (relatedTheme) {
      setSelectedPlaylist(relatedTheme);
      setCurrentScreen('company-list');
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
          <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-3xl">
            {selectedCatalyst.icon}
          </div>
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
                  onClick={() => handleCompanyClick(company.ticker)}
                  className="w-full flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  {company.logoUrl ? (
                    <img 
                      src={company.logoUrl} 
                      alt={company.name} 
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-primary">{company.ticker[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.ticker}</p>
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
            <h2 className="text-lg font-semibold text-foreground mb-2">Explore Related Industry</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <p className="font-medium text-foreground">{relatedTheme.title}</p>
                <p className="text-xs text-muted-foreground">{relatedTheme.stocks.length} companies in this theme</p>
              </div>
            </div>
            <button 
              onClick={handleExploreTheme}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Browse {relatedTheme.title} Companies
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
