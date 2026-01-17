import { motion } from 'framer-motion';

interface StoryProgressIndicatorProps {
  currentAct: number;
  totalActs: number;
}

export function StoryProgressIndicator({ currentAct, totalActs }: StoryProgressIndicatorProps) {
  return (
    <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-3">
      {Array.from({ length: totalActs }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
              index + 1 <= currentAct
                ? 'bg-primary border-primary'
                : 'bg-transparent border-muted-foreground/30'
            }`}
          />
          {index + 1 === currentAct && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 w-3 h-3 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
      
      {/* Act label */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {currentAct}/{totalActs}
      </div>
    </div>
  );
}
