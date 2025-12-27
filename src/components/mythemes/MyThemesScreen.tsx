import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function MyThemesScreen() {
  const { trackedThemes, setCurrentScreen, setSelectedPlaylist } = useApp();

  const trackedPlaylistData = trackedThemes
    .map(themeId => playlists.find(p => p.id === themeId))
    .filter(Boolean);

  const handleThemeClick = (playlist: typeof playlists[0]) => {
    setSelectedPlaylist(playlist);
    setCurrentScreen('playlist');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">My Themes</h1>
        <p className="text-muted-foreground text-sm">Themes you're tracking</p>
      </div>

      {/* Theme List */}
      <div className="px-4 space-y-3">
        {trackedPlaylistData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No themes yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Discover themes on Home and track the ones you like!
            </p>
            <Button variant="outline" onClick={() => setCurrentScreen('home')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Themes
            </Button>
          </motion.div>
        ) : (
          trackedPlaylistData.map((playlist, index) => (
            <motion.div
              key={playlist!.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleThemeClick(playlist!)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${playlist!.heroImage})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{playlist!.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {playlist!.companies.slice(0, 3).join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Bookmark className="w-3 h-3 text-primary fill-current" />
                      <span className="text-xs text-primary">Tracking</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
