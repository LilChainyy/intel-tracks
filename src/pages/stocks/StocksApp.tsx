import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppProvider, useApp, type Screen, type ActiveTab } from '@/context/AppContext';
import { InvestorQuizFlow } from '@/components/quiz/InvestorQuizFlow';
import { TopNav } from '@/components/navigation/TopNav';
import { BottomNav } from '@/components/navigation/BottomNav';
import { AdvisorScreen } from '@/components/advisor/AdvisorScreen';
import { ThemeListScreen } from '@/components/theme/ThemeListScreen';
import { CompanyListScreen } from '@/components/company/CompanyListScreen';
import { CompanyProfileScreen } from '@/components/company/CompanyProfileScreen';
import { MarketScreen } from '@/components/market/MarketScreen';
import { CatalystDetailScreen } from '@/components/market/CatalystDetailScreen';
import { WatchlistScreen } from '@/components/watchlist/WatchlistScreen';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { StoreScreen } from '@/components/store/StoreScreen';

function StocksContent() {
  const { currentScreen, setCurrentScreen, setActiveTab, selectedPlaylist } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle URL params for initial screen/tab (e.g., from quiz completion)
  useEffect(() => {
    const screenParam = searchParams.get('screen') as Screen | null;
    const tabParam = searchParams.get('tab') as ActiveTab | null;

    if (screenParam && tabParam) {
      setActiveTab(tabParam);
      setCurrentScreen(screenParam);
      // Clear the params after setting the screen
      setSearchParams({});
    }
  }, [searchParams, setCurrentScreen, setActiveTab, setSearchParams]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'theme-list':
        return <ThemeListScreen />;
      case 'company-list':
        return <CompanyListScreen key={selectedPlaylist?.id || 'no-playlist'} />;
      case 'company-profile':
        return <CompanyProfileScreen />;
      case 'market':
        return <MarketScreen />;
      case 'advisor':
        return <AdvisorScreen />;
      case 'catalyst-detail':
        return <CatalystDetailScreen />;
      case 'watchlist':
        return <WatchlistScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'quiz':
        return <InvestorQuizFlow />;
      case 'store':
        return <StoreScreen />;
      default:
        return <ThemeListScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="relative pt-14">
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  );
}

export default function StocksApp() {
  return (
    <AppProvider>
      <StocksContent />
    </AppProvider>
  );
}
