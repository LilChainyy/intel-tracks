import { InvestorQuizProvider } from '@/context/InvestorQuizContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { InvestorQuizFlow } from '@/components/quiz/InvestorQuizFlow';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { StockDetail } from '@/components/stock/StockDetail';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { FollowingScreen } from '@/components/following/FollowingScreen';
import { StoreScreen } from '@/components/store/StoreScreen';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Sidebar } from '@/components/navigation/Sidebar';
import { FloatingAdvisor } from '@/components/advisor/FloatingAdvisor';
import { Phase2Intro } from '@/components/phase2/Phase2Intro';
import { ThemeSelector } from '@/components/phase2/ThemeSelector';
import { ThemeStoryViewer } from '@/components/phase2/ThemeStoryViewer';

function AppContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'quiz':
        return <InvestorQuizFlow />;
      case 'phase2-intro':
        return <Phase2Intro />;
      case 'phase2-select':
        return <ThemeSelector />;
      case 'phase2-story':
        return <ThemeStoryViewer />;
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

  // Hide nav during quiz and phase 2
  const isOnboarding = currentScreen === 'quiz' || currentScreen.startsWith('phase2');
  const showNav = !isOnboarding;

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
