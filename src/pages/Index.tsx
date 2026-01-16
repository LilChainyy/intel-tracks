import { InvestorQuizProvider } from '@/context/InvestorQuizContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { InvestorQuizFlow } from '@/components/quiz/InvestorQuizFlow';
import { DiscoveryScreen } from '@/components/discovery/DiscoveryScreen';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { StockDetail } from '@/components/stock/StockDetail';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { FollowingScreen } from '@/components/following/FollowingScreen';
import { StoreScreen } from '@/components/store/StoreScreen';
import { BottomNav } from '@/components/navigation/BottomNav';
import { FloatingAdvisor } from '@/components/advisor/FloatingAdvisor';

function AppContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'quiz':
        return <InvestorQuizFlow />;
      case 'discovery':
        return <DiscoveryScreen />;
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
      default:
        return <InvestorQuizFlow />;
    }
  };

  const showBottomNav = currentScreen !== 'quiz';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      {renderScreen()}
      {showBottomNav && <BottomNav />}
      {showBottomNav && <FloatingAdvisor />}
    </div>
  );
}

export default function Index() {
  return (
    <LanguageProvider>
      <InvestorQuizProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </InvestorQuizProvider>
    </LanguageProvider>
  );
}
