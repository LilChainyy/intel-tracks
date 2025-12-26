import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle } from 'lucide-react';

interface ConvictionSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function getConvictionText(value: number): { text: string; color: string } {
  if (value <= 60) {
    return { 
      text: 'A measured take. Low risk to your Edge.', 
      color: 'text-muted-foreground' 
    };
  } else if (value <= 80) {
    return { 
      text: 'Moderate conviction. You believe this.', 
      color: 'text-foreground' 
    };
  } else {
    return { 
      text: 'Strong conviction. This will test your thesis.', 
      color: 'text-primary' 
    };
  }
}

export function ConvictionSlider({ value, onChange }: ConvictionSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const { text, color } = getConvictionText(localValue);
  const showWarning = localValue >= 90;

  const handleChange = (newValue: number[]) => {
    const v = newValue[0];
    setLocalValue(v);
    onChange(v);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Mild conviction</span>
        <span className="text-lg font-bold text-foreground">{localValue}%</span>
        <span className="text-xs text-muted-foreground">High conviction</span>
      </div>

      <Slider
        value={[localValue]}
        onValueChange={handleChange}
        min={50}
        max={100}
        step={5}
        className="w-full"
      />

      <motion.p
        key={text}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm text-center ${color}`}
      >
        {text}
      </motion.p>

      {showWarning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200">
            High conviction call. If you're wrong, it impacts your Calibration score.
          </p>
        </motion.div>
      )}
    </div>
  );
}
