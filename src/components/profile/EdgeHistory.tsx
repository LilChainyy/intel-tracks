import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { playlists } from '@/data/playlists';

interface EdgeHistoryItem {
  id: string;
  playlistId: string;
  playlistTitle: string;
  edgeEarned: number;
  isCorrect: boolean;
  createdAt: string;
}

interface EdgeHistoryProps {
  history: EdgeHistoryItem[];
}

export function EdgeHistory({ history }: EdgeHistoryProps) {
  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-surface p-5"
      >
        <h3 className="text-sm font-medium text-foreground mb-4">Recent Edge History</h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          No scored predictions yet. Make calls to build your Edge.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-surface p-5"
    >
      <h3 className="text-sm font-medium text-foreground mb-4">Recent Edge History</h3>
      
      <div className="space-y-3">
        {history.map((item, index) => {
          const playlist = playlists.find(p => p.id === item.playlistId);
          const title = playlist?.title || item.playlistId;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.edgeEarned > 0 
                    ? 'bg-emerald-500/20' 
                    : item.edgeEarned < 0 
                    ? 'bg-rose-500/20' 
                    : 'bg-secondary'
                }`}>
                  {item.edgeEarned > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : item.edgeEarned < 0 ? (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-foreground">{title}</span>
              </div>
              <span className={`text-sm font-semibold ${
                item.edgeEarned > 0 
                  ? 'text-emerald-500' 
                  : item.edgeEarned < 0 
                  ? 'text-rose-500' 
                  : 'text-muted-foreground'
              }`}>
                {item.edgeEarned > 0 ? '+' : ''}{item.edgeEarned} Edge
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
