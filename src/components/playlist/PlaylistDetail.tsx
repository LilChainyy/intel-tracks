import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bell, BellOff, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Stock } from '@/types/playlist';

export function PlaylistDetail() {
  const { selectedPlaylist, setCurrentScreen, setSelectedStock, followedPlaylists, toggleFollowPlaylist } = useApp();

  if (!selectedPlaylist) return null;

  const isFollowing = followedPlaylists.includes(selectedPlaylist.id);

  const handleBack = () => {
    setCurrentScreen('discovery');
  };

  const handleStockClick = (stock: Stock) => {
    setSelectedStock({ ticker: stock.ticker, playlist: selectedPlaylist });
    setCurrentScreen('stock');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero section */}
      <div className="relative h-64">
        <img
          src={selectedPlaylist.heroImage}
          alt={selectedPlaylist.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-12">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedPlaylist.emoji}</span>
            <h1 className="text-2xl font-bold text-foreground">{selectedPlaylist.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Who's Buying */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">💰</span>
            <span className="font-semibold text-foreground">Who's Buying</span>
          </div>
          <p className="text-muted-foreground">{selectedPlaylist.whoBuying.join(' · ')}</p>
          <p className="text-emerald-400 text-sm">📈 {selectedPlaylist.proofPoint}</p>
        </motion.div>

        {/* Why Now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">⚡</span>
            <span className="font-semibold text-foreground">Why Now</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{selectedPlaylist.whyNow}</p>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {selectedPlaylist.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Follow button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => toggleFollowPlaylist(selectedPlaylist.id)}
            className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
              isFollowing
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {isFollowing ? (
              <>
                <BellOff className="w-4 h-4" />
                Following
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Follow This Theme
              </>
            )}
          </button>
        </motion.div>

        {/* Stock list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h2 className="section-header">{selectedPlaylist.stocks.length} Holdings</h2>
          <div className="space-y-2">
            {selectedPlaylist.stocks.map((stock, index) => (
              <motion.button
                key={stock.ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                onClick={() => handleStockClick(stock)}
                className="w-full card-interactive p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground">{stock.ticker.slice(0, 2)}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{stock.ticker}</p>
                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stock.isPrivate && (
                    <span className="px-2 py-0.5 rounded-full bg-amber/20 text-amber text-xs">
                      Private
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
