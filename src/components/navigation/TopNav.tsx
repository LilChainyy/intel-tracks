import { Link } from 'react-router-dom';

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link 
            to="/home" 
            className="text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Adamsmyth
          </Link>

        </div>
      </div>
    </header>
  );
}
