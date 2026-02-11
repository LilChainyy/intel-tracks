import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Star, ChevronRight, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Playlist } from '@/types/playlist';

interface AggregatedCompany {
  ticker: string;
  name: string;
  emoji?: string;
  description: string;
  isPrivate: boolean;
  logoUrl?: string;
  playlistId: string;
  playlistTitle: string;
  playlist: Playlist;
}

export function AllCompaniesScreen() {
  const {
    setSelectedPlaylist,
    setSelectedStock,
    navigateBack,
    navigateTo,
    isCompanyWatchlisted,
    toggleWatchlistCompany,
    isCompanyCompleted,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [ytdData, setYtdData] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  // Aggregate all companies across all playlists, deduped by ticker (first occurrence wins)
  const allCompanies = useMemo<AggregatedCompany[]>(() => {
    const seen = new Map<string, AggregatedCompany>();
    for (const playlist of playlists) {
      for (const stock of playlist.stocks) {
        if (!seen.has(stock.ticker)) {
          seen.set(stock.ticker, {
            ticker: stock.ticker,
            name: stock.name,
            emoji: stock.emoji,
            description: stock.description,
            isPrivate: stock.isPrivate,
            logoUrl: stock.logoUrl,
            playlistId: playlist.id,
            playlistTitle: playlist.title,
            playlist,
          });
        }
      }
    }
    return Array.from(seen.values());
  }, []);

  // Filtered list based on search
  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return allCompanies;
    const q = searchQuery.toLowerCase();
    return allCompanies.filter(
      c =>
        c.ticker.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.playlistTitle.toLowerCase().includes(q)
    );
  }, [allCompanies, searchQuery]);

  // Fetch YTD data for all non-private tickers
  useEffect(() => {
    async function fetchYTDData() {
      try {
        const tickers = allCompanies
          .filter(c => !c.isPrivate)
          .map(c => c.ticker);

        const { data, error } = await supabase
          .from('stock_quotes')
          .select('ticker, ytd_change')
          .in('ticker', tickers);

        if (error) {
          console.error('Error fetching stock quotes:', error);
        }

        if (data) {
          const ytdMap: Record<string, number | null> = {};
          data.forEach(item => {
            ytdMap[item.ticker] = item.ytd_change ? Number(item.ytd_change) : null;
          });
          setYtdData(ytdMap);
        }
      } catch (error) {
        console.error('Error fetching YTD data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchYTDData();
  }, [allCompanies]);

  const handleCompanyClick = (company: AggregatedCompany) => {
    setSelectedPlaylist(company.playlist);
    setSelectedStock({ ticker: company.ticker, playlist: company.playlist });
    navigateTo('company-profile');
    window.scrollTo(0, 0);
  };

  const handleStarClick = (e: React.MouseEvent, company: AggregatedCompany) => {
    e.stopPropagation();
    toggleWatchlistCompany({
      ticker: company.ticker,
      name: company.name,
      playlistId: company.playlistId,
      playlistTitle: company.playlistTitle,
      logoUrl: company.logoUrl,
    });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigateBack()}
            className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">All Companies</h1>
            <p className="text-sm text-muted-foreground">{allCompanies.length} companies</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Company List */}
      <div className="px-4 py-4 space-y-3">
        {filteredCompanies.map((company, index) => {
          const ytdChange = ytdData[company.ticker];
          const isWatchlisted = isCompanyWatchlisted(company.ticker);
          const isCompleted = isCompanyCompleted(company.ticker);

          return (
            <motion.button
              key={company.ticker}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCompanyClick(company)}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
            >
              {/* Logo */}
              <div className="relative">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center border border-border">
                  {company.emoji ? (
                    <span className="text-2xl">{company.emoji}</span>
                  ) : (
                    <span className="text-lg font-bold text-primary">{company.ticker[0]}</span>
                  )}
                </div>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{company.ticker}</span>
                  {isCompleted && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Learned</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{company.name}</p>
                <p className="text-xs text-muted-foreground">{company.playlistTitle}</p>
              </div>

              {/* YTD Visual Indicator */}
              {!loading && ytdChange != null && typeof ytdChange === 'number' && (
                <div className="flex flex-col items-center gap-1 self-center">
                  {(() => {
                    const absYtd = Math.abs(ytdChange);
                    const isPositive = ytdChange >= 0;
                    const isZero = ytdChange === 0;

                    let filledBars;
                    if (isZero) {
                      filledBars = 1;
                    } else {
                      filledBars = Math.max(1, Math.ceil((Math.min(absYtd, 100) / 100) * 5));
                    }

                    const baseHeight = 3;

                    return (
                      <div className="flex items-end gap-0.5">
                        {[1, 2, 3, 4, 5].map((barIndex) => (
                          <div
                            key={barIndex}
                            className={`w-1 rounded-sm ${
                              barIndex <= filledBars
                                ? isZero
                                  ? 'bg-gray-300 dark:bg-gray-600'
                                  : isPositive ? 'bg-emerald-500' : 'bg-red-500'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            style={{ height: `${baseHeight * barIndex}px` }}
                          />
                        ))}
                      </div>
                    );
                  })()}

                  <span className={`text-xs font-semibold ${ytdChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {ytdChange >= 0 ? '+' : ''}{ytdChange.toFixed(1)}% YTD
                  </span>
                </div>
              )}

              {/* Star Button */}
              <button
                onClick={(e) => handleStarClick(e, company)}
                className={`p-2 rounded-full transition-colors ${
                  isWatchlisted
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                <Star className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
              </button>

              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
