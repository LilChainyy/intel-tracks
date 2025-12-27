import { Home, Bookmark, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

type Tab = 'home' | 'mythemes' | 'profile';

export function BottomNav() {
  const { currentScreen, setCurrentScreen } = useApp();

  const getActiveTab = (): Tab => {
    switch (currentScreen) {
      case 'home':
      case 'playlist':
      case 'stock':
        return 'home';
      case 'mythemes':
        return 'mythemes';
      case 'profile':
        return 'profile';
      default:
        return 'home';
    }
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Home' },
    { id: 'mythemes' as Tab, icon: Bookmark, label: 'My Themes' },
    { id: 'profile' as Tab, icon: User, label: 'Profile' }
  ];

  const handleTabClick = (tab: Tab) => {
    setCurrentScreen(tab);
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
