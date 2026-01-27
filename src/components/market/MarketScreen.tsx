import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Catalyst } from '@/context/AppContext';
import { useCatalysts, refreshCatalysts } from '@/hooks/useCatalysts';
import { getCatalystsByCategory } from '@/data/catalysts';
import { Button } from '@/components/ui/button';

const categories = ['All', 'Earnings', 'FDA', 'Mergers', 'Economic', 'Production', 'Partnership'];

export function MarketScreen() {
  const { setCurrentScreen, setSelectedCatalyst } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const { catalysts, isLoading } = useCatalysts();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredCatalysts = getCatalystsByCategory(activeCategory, catalysts);

  const handleCatalystClick = (catalyst: Catalyst) => {
    setSelectedCatalyst(catalyst);
    setCurrentScreen('catalyst-detail');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshCatalysts();
      if (result.success) {
        // Wait a moment for database to update, then reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorMsg = result.error || 'Unknown error';
        alert(`Failed to refresh catalysts: ${errorMsg}\n\nCheck:\n1. Edge Function is deployed\n2. FINNHUB_API_KEY is set in Supabase Secrets\n3. You're using the correct Supabase project`);
        console.error('Refresh failed:', result.error);
      }
    } catch (error) {
      console.error('Error refreshing catalysts:', error);
      alert(`Error refreshing catalysts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            Market Catalysts
          </motion.h1>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Catalyst Cards */}
      <div className="px-6 space-y-3">
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading catalysts...</p>
          </div>
        )}
        {!isLoading && filteredCatalysts.map((catalyst, index) => (
          <motion.button
            key={catalyst.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => handleCatalystClick(catalyst)}
            className="w-full text-left p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{catalyst.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    catalyst.impact === 'High' 
                      ? 'bg-destructive/10 text-destructive' 
                      : catalyst.impact === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {catalyst.impact}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{catalyst.description}</p>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded">{catalyst.category}</span>
                  <span className="text-xs text-muted-foreground">{catalyst.time}</span>
                  <span className="text-xs text-muted-foreground">
                    {catalyst.companies.length} {catalyst.companies.length === 1 ? 'company' : 'companies'} affected
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}

        {!isLoading && filteredCatalysts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No catalysts in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export for legacy compatibility (using fallback)
import { catalysts as fallbackCatalysts } from '@/data/catalysts';
export { fallbackCatalysts as marketUpdates };
