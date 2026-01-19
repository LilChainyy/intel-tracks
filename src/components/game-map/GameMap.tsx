import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Brain, Layers, Sparkles, Trophy } from 'lucide-react';

interface MapPin {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  position: { x: number; y: number };
  available: boolean;
  screen?: 'quiz' | 'phase2-select';
}

const mapPins: MapPin[] = [
  {
    id: 'why-investing',
    name: 'Why Investing',
    icon: <Brain className="w-6 h-6" />,
    description: 'Discover your investor type',
    position: { x: 20, y: 25 },
    available: true,
    screen: 'quiz',
  },
  {
    id: 'theme',
    name: 'Theme',
    icon: <Layers className="w-6 h-6" />,
    description: 'Explore investment themes',
    position: { x: 70, y: 20 },
    available: true,
    screen: 'phase2-select',
  },
  {
    id: 'tbc-1',
    name: 'Coming Soon',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'New adventure awaits',
    position: { x: 25, y: 65 },
    available: false,
  },
  {
    id: 'tbc-2',
    name: 'Coming Soon',
    icon: <Trophy className="w-6 h-6" />,
    description: 'Unlock your potential',
    position: { x: 75, y: 70 },
    available: false,
  },
];

export function GameMap() {
  const { setCurrentScreen } = useApp();

  const handlePinClick = (pin: MapPin) => {
    if (pin.available && pin.screen) {
      setCurrentScreen(pin.screen);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background map texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
      
      {/* Decorative path lines connecting pins */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <motion.path
          d="M 20% 30% Q 45% 25% 70% 25%"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeDasharray="8 4"
          fill="none"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        <motion.path
          d="M 20% 30% Q 22% 47% 25% 68%"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeDasharray="8 4"
          fill="none"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.7 }}
        />
        <motion.path
          d="M 70% 25% Q 72% 47% 75% 73%"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeDasharray="8 4"
          fill="none"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.9 }}
        />
        <motion.path
          d="M 25% 68% Q 50% 70% 75% 73%"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeDasharray="8 4"
          fill="none"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.1 }}
        />
      </svg>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center pt-12 pb-8 px-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Your Journey
        </h1>
        <p className="text-muted-foreground">
          Choose your path to financial mastery
        </p>
      </motion.div>

      {/* Map container */}
      <div className="relative z-10 w-full h-[60vh] max-w-4xl mx-auto px-4">
        {mapPins.map((pin, index) => (
          <motion.button
            key={pin.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.15, type: 'spring', stiffness: 200 }}
            onClick={() => handlePinClick(pin)}
            disabled={!pin.available}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${pin.position.x}%`,
              top: `${pin.position.y}%`,
            }}
          >
            {/* Pin glow effect for available pins */}
            {pin.available && (
              <motion.div
                className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '120px', height: '120px', left: '-30px', top: '-30px' }}
              />
            )}
            
            {/* Pin container */}
            <div
              className={`
                relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300
                ${pin.available 
                  ? 'bg-card border-2 border-primary shadow-lg hover:scale-110 hover:shadow-xl cursor-pointer' 
                  : 'bg-muted/50 border-2 border-dashed border-muted-foreground/30 opacity-60 cursor-not-allowed'
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center
                  ${pin.available 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {pin.icon}
              </div>
              
              {/* Label */}
              <div className="text-center min-w-[100px]">
                <p className={`font-semibold text-sm ${pin.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {pin.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px]">
                  {pin.description}
                </p>
              </div>

              {/* Lock indicator for unavailable */}
              {!pin.available && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔒</span>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-0 right-0 text-center text-sm text-muted-foreground"
      >
        Tap a pin to begin your adventure
      </motion.p>
    </div>
  );
}
