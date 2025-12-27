import { useApp } from '@/context/AppContext';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function EdgeProgressBar() {
  const { edgePoints } = useApp();
  const maxEdge = 200;
  const progress = Math.min((edgePoints / maxEdge) * 100, 100);

  return (
    <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 py-2">
          <div className="flex items-center gap-1.5 text-primary">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">
              {edgePoints}/{maxEdge} Edge
            </span>
          </div>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
