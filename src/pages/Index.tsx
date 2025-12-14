import { QuizProvider } from '@/context/QuizContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { QuizFlow } from '@/components/quiz/QuizFlow';
import { DiscoveryScreen } from '@/components/discovery/DiscoveryScreen';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { StockDetail } from '@/components/stock/StockDetail';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { FollowingScreen } from '@/components/following/FollowingScreen';
import { BottomNav } from '@/components/navigation/BottomNav';

function AppContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'quiz':
        return <QuizFlow />;
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
      default:
        return <QuizFlow />;
    }
  };

  const showBottomNav = currentScreen !== 'quiz';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      {renderScreen()}
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default function Index() {
  return (
    <QuizProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </QuizProvider>
  );
}
