// frontend/src/features/search/SearchPage.tsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Music, Play } from "lucide-react";
import { searchAPI } from "@/services/api";
import { Track } from "@/types";
import { formatDuration, formatBPM, formatKey } from "@/lib/utils";

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading, isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchAPI.searchTracks(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const tracks = searchResults?.tracks || [];
  const hasResults = tracks.length > 0;
  const showResults = debouncedQuery.length >= 2;

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for tracks, artists, albums, genres..."
            className="pl-10 text-lg h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(isLoading || isFetching) && debouncedQuery.length >= 2 && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {debouncedQuery.length > 0 && debouncedQuery.length < 2 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Type at least 2 characters to search
          </p>
        )}
      </div>

      {showResults && (
        <div className="max-w-4xl mx-auto">
          {hasResults ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {tracks.length} result{tracks.length !== 1 ? "s" : ""} for "{debouncedQuery}"
              </p>
              <div className="space-y-2">
                {tracks.map((track: Track) => (
                  <Card
                    key={track.id}
                    className="hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 shrink-0"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{track.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artist}
                            {track.album && ` • ${track.album}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {track.genre && (
                            <Badge variant="secondary">{track.genre}</Badge>
                          )}
                          {track.bpm && (
                            <span className="text-sm font-mono text-muted-foreground">
                              {formatBPM(track.bpm)}
                            </span>
                          )}
                          {track.key_signature && (
                            <span className="text-sm font-mono text-primary">
                              {formatKey(track.key_signature)}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(track.duration)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : !isLoading ? (
            <Card className="p-8">
              <div className="text-center">
                <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No results found
                </h3>
                <p className="text-muted-foreground">
                  Try searching for a different term
                </p>
              </div>
            </Card>
          ) : null}
        </div>
      )}

      {!showResults && (
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Search your library
              </h3>
              <p className="text-muted-foreground">
                Search by track name, artist, album, or genre
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
