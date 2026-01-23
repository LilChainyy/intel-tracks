import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { catalysts, getCatalystsByCategory } from '@/data/catalysts';

const categories = ['All', 'Earnings', 'FDA', 'Mergers', 'Economic', 'Production', 'Partnership'];

export function MarketScreen() {
  const { setCurrentScreen, setSelectedCatalyst } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCatalysts = getCatalystsByCategory(activeCategory);

  const handleCatalystClick = (catalyst: typeof catalysts[0]) => {
    setSelectedCatalyst(catalyst);
    setCurrentScreen('catalyst-detail');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground mb-4"
        >
          Market Catalysts
        </motion.h1>
        
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
        {filteredCatalysts.map((catalyst, index) => (
          <motion.button
            key={catalyst.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => handleCatalystClick(catalyst)}
            className="w-full text-left p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {catalyst.icon}
              </div>
              
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

        {filteredCatalysts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No catalysts in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export for legacy compatibility
export { catalysts as marketUpdates };
