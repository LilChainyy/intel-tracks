import { InvestorQuizProvider } from '@/context/InvestorQuizContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { InvestorQuizFlow } from '@/components/quiz/InvestorQuizFlow';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { StockDetail } from '@/components/stock/StockDetail';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { FollowingScreen } from '@/components/following/FollowingScreen';
import { StoreScreen } from '@/components/store/StoreScreen';
import { FloatingAdvisor } from '@/components/advisor/FloatingAdvisor';
import { Phase2Intro } from '@/components/phase2/Phase2Intro';
import { ThemeSelector } from '@/components/phase2/ThemeSelector';
import { ThemeStoryViewer } from '@/components/phase2/ThemeStoryViewer';
import { TopNav } from '@/components/navigation/TopNav';

function StocksContent() {
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

  // Hide TopNav during quiz and phase2-intro for focused experience
  const showTopNav = currentScreen !== 'quiz' && currentScreen !== 'phase2-intro';

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
