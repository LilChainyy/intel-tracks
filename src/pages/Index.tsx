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
import { Sidebar } from '@/components/navigation/Sidebar';
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

  const showNav = currentScreen !== 'quiz';

  return (
    <div className="min-h-screen bg-background flex">
      {showNav && <Sidebar />}
      <main className="flex-1 relative">
        {renderScreen()}
        {showNav && <BottomNav />}
        {showNav && <FloatingAdvisor />}
      </main>
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
