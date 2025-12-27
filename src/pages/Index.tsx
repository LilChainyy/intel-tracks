import { QuizProvider } from '@/context/QuizContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { QuizFlow } from '@/components/quiz/QuizFlow';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { StockDetail } from '@/components/stock/StockDetail';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { HomeFeed } from '@/components/home/HomeFeed';
import { MyThemesScreen } from '@/components/mythemes/MyThemesScreen';
import { BottomNav } from '@/components/navigation/BottomNav';

function AppContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeFeed />;
      case 'mythemes':
        return <MyThemesScreen />;
      case 'quiz':
        return <QuizFlow />;
      case 'playlist':
        return <PlaylistDetail />;
      case 'stock':
        return <StockDetail />;
      case 'profile':
        return <ProfileScreen />;
      case 'auth':
        return <AuthScreen />;
      default:
        return <HomeFeed />;
    }
  };

  const showBottomNav = currentScreen !== 'quiz' && currentScreen !== 'auth';

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
