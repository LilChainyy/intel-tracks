import { Home, Bookmark, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

type NavItem = 'home' | 'following' | 'profile';

export function Sidebar() {
  const { currentScreen, setCurrentScreen } = useApp();

  const getActiveItem = (): NavItem => {
    switch (currentScreen) {
      case 'phase2-select':
      case 'phase2-story':
      case 'playlist':
      case 'stock':
        return 'home';
      case 'following':
        return 'following';
      case 'profile':
      case 'store':
        return 'profile';
      default:
        return 'home';
    }
  };

  const activeItem = getActiveItem();

  const navItems = [
    { id: 'home' as NavItem, icon: Home, label: 'Home' },
    { id: 'following' as NavItem, icon: Bookmark, label: 'Saved' },
    { id: 'profile' as NavItem, icon: User, label: 'Profile' }
  ];

  const handleNavClick = (item: NavItem) => {
    if (item === 'home') {
      setCurrentScreen('phase2-select');
    } else if (item === 'following') {
      setCurrentScreen('following');
    } else if (item === 'profile') {
      setCurrentScreen('profile');
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">IntelTracks</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 IntelTracks
        </p>
      </div>
    </aside>
  );
}
