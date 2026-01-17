import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

interface LevelUpNotificationProps {
  show: boolean;
  themeName: string;
}

export function LevelUpNotification({ show, themeName }: LevelUpNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            
            {/* Main notification */}
            <motion.div
              className="relative px-6 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-2xl shadow-primary/30 border border-primary/50"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(var(--primary), 0.3)',
                  '0 0 40px rgba(var(--primary), 0.5)',
                  '0 0 20px rgba(var(--primary), 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Trophy className="w-6 h-6" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                </div>
                <div>
                  <p className="font-bold text-sm">Level Up!</p>
                  <p className="text-xs opacity-90">Theme Mastery: 100%</p>
                </div>
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white/80"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: (i % 2 === 0 ? 1 : -1) * (20 + i * 10),
                    y: -(30 + i * 15),
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  style={{
                    left: '50%',
                    bottom: '100%',
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
