import { Home, Search, Bookmark, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

type Tab = 'discovery' | 'search' | 'following' | 'profile';

export function BottomNav() {
  const { currentScreen, setCurrentScreen } = useApp();

  const getActiveTab = (): Tab => {
    switch (currentScreen) {
      case 'discovery':
      case 'playlist':
      case 'stock':
        return 'discovery';
      case 'following':
        return 'following';
      case 'profile':
        return 'profile';
      default:
        return 'discovery';
    }
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'discovery' as Tab, icon: Home, label: 'Home' },
    { id: 'search' as Tab, icon: Search, label: 'Search' },
    { id: 'following' as Tab, icon: Bookmark, label: 'Saved' },
    { id: 'profile' as Tab, icon: User, label: 'Profile' }
  ];

  const handleTabClick = (tab: Tab) => {
    if (tab === 'discovery') {
      setCurrentScreen('discovery');
    } else if (tab === 'profile') {
      setCurrentScreen('profile');
    } else if (tab === 'following') {
      setCurrentScreen('following');
    }
    // search is placeholder
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
