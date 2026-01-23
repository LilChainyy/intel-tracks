import { InvestorQuizProvider } from '@/context/InvestorQuizContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { InvestorQuizFlow } from '@/components/quiz/InvestorQuizFlow';
import { FloatingAdvisor } from '@/components/advisor/FloatingAdvisor';
import { TopNav } from '@/components/navigation/TopNav';
import { BottomNav } from '@/components/navigation/BottomNav';
import { HomeScreen } from '@/components/home/HomeScreen';
import { ThemeListScreen } from '@/components/theme/ThemeListScreen';
import { CompanyListScreen } from '@/components/company/CompanyListScreen';
import { CompanyProfileScreen } from '@/components/company/CompanyProfileScreen';
import { MarketScreen } from '@/components/market/MarketScreen';
import { CatalystDetailScreen } from '@/components/market/CatalystDetailScreen';
import { WatchlistScreen } from '@/components/watchlist/WatchlistScreen';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { StoreScreen } from '@/components/store/StoreScreen';

function StocksContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'theme-list':
        return <ThemeListScreen />;
      case 'company-list':
        return <CompanyListScreen />;
      case 'company-profile':
        return <CompanyProfileScreen />;
      case 'market':
        return <MarketScreen />;
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
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="relative pt-14">
        {renderScreen()}
        <FloatingAdvisor />
      </main>
      <BottomNav />
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
