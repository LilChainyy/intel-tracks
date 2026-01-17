import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvisorChatDialog } from './AdvisorChatDialog';
import { useLanguage } from '@/context/LanguageContext';

function CuteAdvisorCharacter() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12 md:w-14 md:h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Face background */}
      <circle cx="32" cy="32" r="28" fill="#FFE4C4" />
      
      {/* Blush cheeks */}
      <ellipse cx="16" cy="36" rx="5" ry="3" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="48" cy="36" rx="5" ry="3" fill="#FFB6C1" opacity="0.6" />
      
      {/* Eyes */}
      <ellipse cx="22" cy="28" rx="5" ry="6" fill="#2D1B0E" />
      <ellipse cx="42" cy="28" rx="5" ry="6" fill="#2D1B0E" />
      
      {/* Eye sparkles */}
      <circle cx="24" cy="26" r="2" fill="white" />
      <circle cx="44" cy="26" r="2" fill="white" />
      
      {/* Cute smile */}
      <path d="M24 42 Q32 50 40 42" stroke="#2D1B0E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      
      {/* Glasses */}
      <circle cx="22" cy="28" r="9" stroke="#4A5568" strokeWidth="2" fill="none" />
      <circle cx="42" cy="28" r="9" stroke="#4A5568" strokeWidth="2" fill="none" />
      <path d="M31 28 L33 28" stroke="#4A5568" strokeWidth="2" />
      <path d="M13 26 L8 24" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />
      <path d="M51 26 L56 24" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />
      
      {/* Hair/Top tuft */}
      <path d="M28 6 Q32 2 36 6 Q38 4 40 8 Q42 6 43 10" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" fill="none" />
      
      {/* Graduation cap */}
      <rect x="18" y="2" width="28" height="4" fill="#2D3748" rx="1" />
      <polygon points="32,0 20,6 32,12 44,6" fill="#2D3748" />
      <circle cx="32" cy="0" r="2" fill="#FFD700" />
      <path d="M32 0 L32 -4 L38 -2" stroke="#FFD700" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function FloatingAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg flex items-center justify-center border-2 border-amber-300 hover:shadow-xl transition-shadow"
            aria-label={t('advisor.title')}
          >
            <div className="relative">
              <CuteAdvisorCharacter />
              {/* Speech bubble indicator */}
              <motion.div
                className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-[10px] md:text-xs text-primary-foreground font-bold">?</span>
              </motion.div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Dialog */}
      <AdvisorChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
