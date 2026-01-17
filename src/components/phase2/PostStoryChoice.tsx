import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { ArrowRight, LayoutGrid, Rocket } from 'lucide-react';

interface PostStoryChoiceProps {
  onSeeAnother: () => void;
  viewedCount: number;
  totalCount: number;
}

export function PostStoryChoice({ onSeeAnother, viewedCount, totalCount }: PostStoryChoiceProps) {
  const { setCurrentScreen } = useApp();

  const handleViewAll = () => {
    setCurrentScreen('phase2-select');
  };

  const handleStartApp = () => {
    setCurrentScreen('phase2-select');
  };

  const hasMoreThemes = viewedCount < totalCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="py-12 px-4 border-t border-border"
    >
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Completion text */}
        <div className="space-y-2">
          <p className="text-lg text-foreground font-medium">
            {hasMoreThemes 
              ? "Want to explore another theme?"
              : "You've seen all the themes!"
            }
          </p>
          <p className="text-sm text-muted-foreground">
            {hasMoreThemes
              ? "Or ready to start tracking?"
              : "Ready to dive deeper?"
            }
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {hasMoreThemes && (
            <Button
              variant="outline"
              onClick={onSeeAnother}
              className="w-full justify-center"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              See Another Theme
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleViewAll}
            className="w-full justify-center"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            View All My Themes
          </Button>
          
          <Button
            onClick={handleStartApp}
            className="w-full justify-center"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Start Using App
          </Button>
        </div>

        {/* Progress */}
        <p className="text-xs text-muted-foreground">
          {viewedCount} of {totalCount} themes explored
        </p>
      </div>
    </motion.div>
  );
}
