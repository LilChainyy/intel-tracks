import { Home, Compass, Newspaper, Star, User } from 'lucide-react';
import { useApp, ActiveTab } from '@/context/AppContext';

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: ActiveTab; icon: typeof Home; label: string; hasNotification?: boolean }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'theme', icon: Compass, label: 'Theme' },
    { id: 'market', icon: Newspaper, label: 'Market', hasNotification: true },
    { id: 'watchlist', icon: Star, label: 'Watchlist' },
    { id: 'profile', icon: User, label: 'You' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <tab.icon className="w-5 h-5" />
                {tab.hasNotification && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
