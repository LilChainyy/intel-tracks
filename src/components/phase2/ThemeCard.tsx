import { motion } from 'framer-motion';
import { ThemeCard as ThemeCardType } from '@/types/themeStory';

interface ThemeCardProps {
  theme: ThemeCardType;
  onClick: () => void;
  index: number;
}

export function ThemeCard({ theme, onClick, index }: ThemeCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={onClick}
      className="group relative flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-left w-full"
    >
      
      <h3 className="text-lg font-bold text-foreground text-center mb-3 mt-2">
        {theme.title}
      </h3>
      
      {/* Teaser */}
      <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
        "{theme.recentCatalystTeaser}"
      </p>
      
      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.button>
  );
}
