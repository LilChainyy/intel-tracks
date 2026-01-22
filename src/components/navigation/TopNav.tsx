import { Link, useNavigate } from 'react-router-dom';
import { User, Package } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function TopNav() {
  const navigate = useNavigate();
  const { setCurrentScreen } = useApp();

  const handleProfileClick = () => {
    setCurrentScreen('profile');
  };

  const handleProductsClick = () => {
    navigate('/');
  };

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

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 md:gap-8">
            <button
              onClick={handleProductsClick}
              className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </button>
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
