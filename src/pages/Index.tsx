import { AppProvider, useApp } from '@/context/AppContext';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { StockDetail } from '@/components/stock/StockDetail';
import { HomeFeed } from '@/components/home/HomeFeed';
import { ThemesScreen } from '@/components/themes/ThemesScreen';
import { ThemeUnlockFlow } from '@/components/themes/ThemeUnlockFlow';
import { RewardModal } from '@/components/home/RewardModal';
import { BottomNav } from '@/components/navigation/BottomNav';

function AppContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeFeed />;
      case 'themes':
        return <ThemesScreen />;
      case 'themeUnlock':
        return <ThemeUnlockFlow />;
      case 'playlist':
        return <PlaylistDetail />;
      case 'stock':
        return <StockDetail />;
      default:
        return <HomeFeed />;
    }
  };

  const showBottomNav = currentScreen !== 'themeUnlock';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      {renderScreen()}
      {showBottomNav && <BottomNav />}
      <RewardModal />
    </div>
  );
}

export default function Index() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
