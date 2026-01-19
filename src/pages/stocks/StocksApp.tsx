import { InvestorQuizProvider } from '@/context/InvestorQuizContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { InvestorQuizFlow } from '@/components/quiz/InvestorQuizFlow';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { StockDetail } from '@/components/stock/StockDetail';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { FollowingScreen } from '@/components/following/FollowingScreen';
import { StoreScreen } from '@/components/store/StoreScreen';
import { FloatingAdvisor } from '@/components/advisor/FloatingAdvisor';
import { ThemeSelector } from '@/components/phase2/ThemeSelector';
import { ThemeDetailView } from '@/components/phase2/ThemeDetailView';
import { TopNav } from '@/components/navigation/TopNav';
import { GameMap } from '@/components/game-map/GameMap';
import { MarketScreen } from '@/components/market/MarketScreen';

function StocksContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'game-map':
        return <GameMap />;
      case 'quiz':
        return <InvestorQuizFlow />;
      case 'phase2-select':
        return <ThemeSelector />;
      case 'phase2-story':
        return <ThemeDetailView />;
      case 'playlist':
        return <PlaylistDetail />;
      case 'stock':
        return <StockDetail />;
      case 'profile':
        return <ProfileScreen />;
      case 'following':
        return <FollowingScreen />;
      case 'store':
        return <StoreScreen />;
      case 'market':
        return <MarketScreen />;
      default:
        return <GameMap />;
    }
  };

  // Always show TopNav except during quiz for focused experience
  const showTopNav = currentScreen !== 'quiz';

  return (
    <div className="min-h-screen bg-background">
      {showTopNav && <TopNav />}
      <main className="relative">
        {renderScreen()}
        {showTopNav && <FloatingAdvisor />}
      </main>
    </div>
  );
}

export default function StocksApp() {
  return (
    <InvestorQuizProvider>
      <AppProvider>
        <StocksContent />
      </AppProvider>
    </InvestorQuizProvider>
  );
}
