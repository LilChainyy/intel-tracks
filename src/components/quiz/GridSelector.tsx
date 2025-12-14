import { motion } from 'framer-motion';
import { QuizOption as QuizOptionType } from '@/types/quiz';
import { Check } from 'lucide-react';

interface GridSelectorProps {
  options: QuizOptionType[];
  selectedIds: string[];
  maxSelections: number;
  onToggle: (id: string) => void;
}

export function GridSelector({ options, selectedIds, maxSelections, onToggle }: GridSelectorProps) {
  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onToggle(id);
    } else if (selectedIds.length < maxSelections) {
      onToggle(id);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
      {options.map((option, index) => {
        const isSelected = selectedIds.includes(option.id);

        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleToggle(option.id)}
            className={`relative h-16 rounded-2xl flex items-center justify-center px-4 transition-all duration-150 ${
              isSelected
                ? 'bg-primary border-2 border-primary'
                : 'bg-card border border-border hover:border-muted-foreground'
            }`}
          >
            <span
              className={`text-sm font-medium ${
                isSelected ? 'text-primary-foreground' : 'text-foreground'
              }`}
            >
              {option.label}
            </span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-primary" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
