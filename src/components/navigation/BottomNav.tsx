import { useState, useRef, useEffect } from 'react';
import { Compass, Newspaper, Brain, Star, User, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, ActiveTab } from '@/context/AppContext';

export function BottomNav() {
  const { activeTab, setActiveTab, setCurrentScreen } = useApp();
  const [showThemePopup, setShowThemePopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const tabs: { id: ActiveTab; icon: typeof Compass; label: string; hasNotification?: boolean }[] = [
    { id: 'theme', icon: Compass, label: 'Theme' },
    { id: 'market', icon: Newspaper, label: 'Market', hasNotification: true },
    { id: 'advisor', icon: Brain, label: 'Advisor' },
    { id: 'watchlist', icon: Star, label: 'Watchlist' },
    { id: 'profile', icon: User, label: 'You' },
  ];

  // Click-outside dismiss
  useEffect(() => {
    if (!showThemePopup) return;

    function handleMouseDown(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowThemePopup(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showThemePopup]);

  const handleTabClick = (tabId: ActiveTab) => {
    if (tabId === 'theme') {
      if (activeTab !== 'theme') {
        setActiveTab('theme');
      }
      setShowThemePopup(prev => !prev);
    } else {
      setShowThemePopup(false);
      setActiveTab(tabId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isTheme = tab.id === 'theme';
          const isAdvisor = tab.id === 'advisor';

          const button = (
            <button
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
                isActive ? 'text-primary' : isAdvisor ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                {isAdvisor ? (
                  <div className={`rounded-full p-1.5 ${isActive ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                ) : (
                  <>
                    <tab.icon className="w-5 h-5" />
                    {tab.hasNotification && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                    )}
                  </>
                )}
              </div>
              <span className={`text-[10px] ${isAdvisor ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );

          // Theme tab: wrap in a relative container that anchors the popup
          if (isTheme) {
            return (
              <div key={tab.id} className="relative" ref={popupRef}>
                <AnimatePresence>
                  {showThemePopup && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
                    >
                      <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                        <button
                          onClick={() => {
                            setCurrentScreen('theme-list');
                            setShowThemePopup(false);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <Compass className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Browse Themes</span>
                        </button>
                        <div className="border-t border-border" />
                        <button
                          onClick={() => {
                            setCurrentScreen('all-companies');
                            setShowThemePopup(false);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <List className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">All Companies</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {button}
              </div>
            );
          }

          return <div key={tab.id}>{button}</div>;
        })}
      </div>
    </div>
  );
}
