import { motion } from 'framer-motion';
import { QuizOption as QuizOptionType } from '@/types/quiz';

interface CircleUIProps {
  question: string;
  options: QuizOptionType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CircleUI({ question, options, selectedId, onSelect }: CircleUIProps) {
  const getOptionPosition = (index: number, total: number, radius: number = 120) => {
    const angleOffset = -90;
    const angleBetween = 360 / total;
    const angle = angleOffset + index * angleBetween;
    const radians = (angle * Math.PI) / 180;

    return {
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius
    };
  };

  return (
    <div className="relative w-[320px] h-[320px] mx-auto">
      {/* Center circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-card border border-border flex flex-col items-center justify-center p-3"
      >
        <span className="text-sm text-foreground text-center font-medium leading-tight">
          {question}
        </span>
      </motion.div>

      {/* Option circles */}
      {options.map((option, index) => {
        const position = getOptionPosition(index, options.length);
        const isSelected = selectedId === option.id;

        return (
          <motion.button
            key={option.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1 + index * 0.05,
              duration: 0.3,
              ease: 'easeOut'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(option.id)}
            style={{
              left: `calc(50% + ${position.x}px)`,
              top: `calc(50% + ${position.y}px)`
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-150 ${
              isSelected
                ? 'bg-primary border-2 border-primary'
                : 'bg-card border-2 border-border hover:border-muted-foreground'
            }`}
          >
            <span
              className={`text-xs font-medium text-center px-1 ${
                isSelected ? 'text-primary-foreground' : 'text-foreground'
              }`}
            >
              {option.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
