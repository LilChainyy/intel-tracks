import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layers, Newspaper, Bookmark } from 'lucide-react';

export function TopNav() {
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();
  const currentCategory = category || 'stocks';

  const handleHomeClick = () => {
    if (currentCategory === 'stocks') {
      navigate('/stocks');
    } else {
      navigate(`/${currentCategory}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Adamsmyth
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 md:gap-8">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Themes</span>
            </button>
            <Link
              to="/stocks/news"
              className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <Newspaper className="w-4 h-4" />
              <span className="hidden sm:inline">News</span>
            </Link>
            <Link
              to="/saved"
              className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Saved</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
