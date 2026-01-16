import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EducationalRevealProps {
  content: string;
  isVisible: boolean;
  onContinue: () => void;
}

export function EducationalReveal({ content, isVisible, onContinue }: EducationalRevealProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="mt-6 p-5 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-3 flex-1">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {content}
                </p>
                <Button 
                  onClick={onContinue}
                  size="sm"
                  className="mt-2"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
