import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { AdvisorChatDialog } from './AdvisorChatDialog';
import { useLanguage } from '@/context/LanguageContext';

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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg flex items-center justify-center"
            aria-label={t('advisor.title')}
          >
            <div className="relative">
              {/* Advisor Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              {/* Pulse Animation */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary-foreground/30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Dialog */}
      <AdvisorChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
