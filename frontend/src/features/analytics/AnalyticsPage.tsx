// frontend/src/features/analytics/AnalyticsPage.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, Headphones, Loader2, Music, Disc } from "lucide-react";
import api from "@/services/api";

interface AnalyticsData {
  library: {
    totalTracks: { count: number }[];
    totalDuration: { total: number }[];
    avgBPM: { avg: number }[];
  };
  topGenres: Array<{ genre: string; count: number; avg_rating: number }>;
  topArtists: Array<{ artist: string; track_count: number; avg_rating: number }>;
  energyDistribution: Array<{ energy_level: number; count: number }>;
  keyDistribution: Array<{ key_signature: string; count: number }>;
  recentActivity: Array<{ date: string; tracks_added: number }>;
}

const AnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await api.get("/analytics/overview");
      return response.data;
    },
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0h";
    const hours = Math.floor(seconds / 3600);
    return `${hours.toFixed(1)}h`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Unable to load analytics
            </h3>
            <p className="text-muted-foreground">
              Please make sure your library has been scanned.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const totalTracks = analytics?.library?.totalTracks?.[0]?.count || 0;
  const totalDuration = analytics?.library?.totalDuration?.[0]?.total || 0;
  const avgBPM = analytics?.library?.avgBPM?.[0]?.avg || 0;
  const topGenre = analytics?.topGenres?.[0]?.genre || "N/A";

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTracks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              In your library
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
            <p className="text-xs text-muted-foreground">Of music</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Genre</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topGenre}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.topGenres?.[0]?.count || 0} tracks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg BPM</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgBPM)}</div>
            <p className="text-xs text-muted-foreground">
              Average tempo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Genres & Artists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Disc className="h-5 w-5" />
              Top Genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topGenres && analytics.topGenres.length > 0 ? (
              <div className="space-y-3">
                {analytics.topGenres.slice(0, 5).map((genre, index) => (
                  <div key={genre.genre || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-6">{index + 1}.</span>
                      <span className="font-medium">{genre.genre || "Unknown"}</span>
                    </div>
                    <span className="text-muted-foreground">{genre.count} tracks</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No genre data available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Top Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topArtists && analytics.topArtists.length > 0 ? (
              <div className="space-y-3">
                {analytics.topArtists.slice(0, 5).map((artist, index) => (
                  <div key={artist.artist || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-6">{index + 1}.</span>
                      <span className="font-medium truncate max-w-[200px]">
                        {artist.artist || "Unknown"}
                      </span>
                    </div>
                    <span className="text-muted-foreground">{artist.track_count} tracks</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No artist data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Energy Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.energyDistribution && analytics.energyDistribution.length > 0 ? (
            <div className="flex items-end gap-4 h-32">
              {[1, 2, 3, 4, 5].map((level) => {
                const data = analytics.energyDistribution.find(
                  (e) => e.energy_level === level
                );
                const count = data?.count || 0;
                const maxCount = Math.max(
                  ...analytics.energyDistribution.map((e) => e.count)
                );
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div key={level} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary/80 rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : 0 }}
                    />
                    <div className="text-xs text-muted-foreground">{count}</div>
                    <div className="text-sm font-medium">{"⚡".repeat(level)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No energy data available. Scan your library to analyze tracks.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
