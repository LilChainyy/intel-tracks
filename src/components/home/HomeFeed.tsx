import { MarketPulseCard } from './MarketPulseCard';
import { ThemeQuestionCard } from './ThemeQuestionCard';
import { EdgeProgressBar } from './EdgeProgressBar';

export function HomeFeed() {
  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-muted-foreground text-sm">Answer questions, earn Edge, unlock themes</p>
      </div>

      {/* Feed */}
      <div className="px-4 space-y-4">
        <MarketPulseCard />
        <ThemeQuestionCard />
      </div>

      {/* Progress Bar */}
      <EdgeProgressBar />
    </div>
  );
}
