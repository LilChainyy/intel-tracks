import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { themesData } from '@/data/discoveryQuestions';
import { playlists } from '@/data/playlists';
import { Lock, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemesScreen() {
  const { 
    isThemeUnlocked, 
    setCurrentScreen, 
    setCurrentUnlockingTheme,
    setSelectedPlaylist,
    themeVotes,
    voteTheme
  } = useApp();

  const handleThemeClick = (themeId: string) => {
    if (isThemeUnlocked(themeId)) {
      // Navigate to theme detail
      const playlist = playlists.find(p => p.id === themeId);
      if (playlist) {
        setSelectedPlaylist(playlist);
        setCurrentScreen('playlist');
      }
    } else {
      // Start unlock flow
      setCurrentUnlockingTheme(themeId);
      setCurrentScreen('themeUnlock');
    }
  };

  const handleVote = (e: React.MouseEvent, themeId: string, vote: 'up' | 'down') => {
    e.stopPropagation();
    voteTheme(themeId, vote);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-1">Themes</h1>
        <p className="text-sm text-muted-foreground mb-4">
          回答问题解锁投资主题
        </p>

        <div className="space-y-3">
          {themesData.map((theme) => {
            const unlocked = isThemeUnlocked(theme.themeId);
            const vote = themeVotes[theme.themeId];
            
            return (
              <Card
                key={theme.themeId}
                className={`p-4 cursor-pointer transition-all ${
                  unlocked 
                    ? 'bg-card border-border hover:border-primary/50' 
                    : 'bg-muted/30 border-border'
                }`}
                onClick={() => handleThemeClick(theme.themeId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{theme.icon}</span>
                    <div>
                      <h3 className="font-medium">{theme.themeName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {unlocked ? '已解锁 · 点击查看详情' : '回答 3 个问题解锁'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Vote buttons */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${vote === 'up' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                      onClick={(e) => handleVote(e, theme.themeId, 'up')}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${vote === 'down' ? 'text-destructive bg-destructive/10' : 'text-muted-foreground'}`}
                      onClick={(e) => handleVote(e, theme.themeId, 'down')}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    
                    {/* Lock/Unlock icon */}
                    {unlocked ? (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
