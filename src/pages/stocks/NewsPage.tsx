import { Newspaper } from 'lucide-react';
import { TopNav } from '@/components/navigation/TopNav';

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Newspaper className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            News
          </h1>
          <p className="text-muted-foreground max-w-md">
            Market news and analysis coming soon. Stay tuned for curated insights on the themes you follow.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Coming Soon
          </div>
        </div>
      </main>
    </div>
  );
}
