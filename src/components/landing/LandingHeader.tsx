import { Button } from '@/components/ui/button';

interface LandingHeaderProps {
  onLoginClick: () => void;
}

export default function LandingHeader({ onLoginClick }: LandingHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-slate-900">Adamsmyth</span>
        <Button variant="outline" onClick={onLoginClick}>
          Login
        </Button>
      </div>
    </header>
  );
}
