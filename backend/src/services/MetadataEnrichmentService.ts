// backend/src/services/MetadataEnrichmentService.ts
import axios from 'axios';
import { DatabaseService } from './DatabaseService';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    release_date: string;
    images: Array<{ url: string }>;
  };
  popularity: number; // 0-100
  duration_ms: number;
  external_ids?: {
    isrc?: string;
  };
}

interface MusicBrainzRecording {
  id: string;
  title: string;
  'artist-credit': Array<{ name: string }>;
  releases?: Array<{
    title: string;
    date?: string;
  }>;
  tags?: Array<{ name: string; count: number }>;
}

interface AudiomackTrack {
  url: string;
  title: string;
  artist: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  thumbnail?: string;
}

interface AppleMusicTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  releaseDate: string;
  primaryGenreName: string;
  artworkUrl100: string;
  trackViewUrl: string;
}

interface EnrichedMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  genre_tags?: string[];
  popularity?: number; // 0-100
  streams?: number;
  isrc?: string;
  spotify_id?: string;
  audiomack_url?: string;
  youtube_video_id?: string;
  artwork_url?: string;
  confidence: number; // 0-1 match confidence
  source: 'spotify' | 'musicbrainz' | 'audiomack' | 'youtube' | 'applemusic';
}

export class MetadataEnrichmentService {
  private databaseService: DatabaseService;
  private spotifyToken: string | null = null;
  private spotifyTokenExpiry: number = 0;

  constructor() {
    this.databaseService = new DatabaseService();
  }

  // ========================================
  // Spotify API Integration
  // ========================================

  private async getSpotifyToken(): Promise<string> {
    // Check if we have a valid token
    if (this.spotifyToken && Date.now() < this.spotifyTokenExpiry) {
      return this.spotifyToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env');
    }

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
        }
      );

      this.spotifyToken = response.data.access_token;
      this.spotifyTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min buffer

      return this.spotifyToken;
    } catch (error) {
      console.error('Error getting Spotify token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  public async searchSpotify(title: string, artist: string): Promise<SpotifyTrack | null> {
    try {
      const token = await this.getSpotifyToken();
      const query = `track:${title} artist:${artist}`;

      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          q: query,
          type: 'track',
          limit: 1,
        },
      });

      if (response.data.tracks.items.length > 0) {
        return response.data.tracks.items[0];
      }

      return null;
    } catch (error) {
      console.error('Error searching Spotify:', error);
      return null;
    }
  }

  public async getSpotifyPopularity(spotifyId: string): Promise<number | null> {
    try {
      const token = await this.getSpotifyToken();

      const response = await axios.get(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data.popularity;
    } catch (error) {
      console.error('Error getting Spotify popularity:', error);
      return null;
    }
  }

  // ========================================
  // MusicBrainz API Integration (Free)
  // ========================================

  public async searchMusicBrainz(title: string, artist: string): Promise<MusicBrainzRecording | null> {
    try {
      const query = `recording:"${title}" AND artist:"${artist}"`;

      const response = await axios.get('https://musicbrainz.org/ws/2/recording', {
        params: {
          query,
          fmt: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'DJLibraryManager/1.0.0 (your-email@example.com)', // MusicBrainz requires User-Agent
        },
      });

      if (response.data.recordings && response.data.recordings.length > 0) {
        return response.data.recordings[0];
      }

      return null;
    } catch (error) {
      console.error('Error searching MusicBrainz:', error);
      return null;
    }
  }

  // ========================================
  // YouTube Music Integration
  // ========================================

  public async searchYouTubeMusic(title: string, artist: string): Promise<any | null> {
    try {
      // YouTube Music doesn't have an official public API
      // We'll use the YouTube Data API to search for music videos
      const apiKey = process.env.YOUTUBE_API_KEY;

      if (!apiKey) {
        console.warn('YouTube API key not configured. Set YOUTUBE_API_KEY in .env');
        return null;
      }

      const query = `${artist} - ${title} official audio`;

      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          videoCategoryId: '10', // Music category
          maxResults: 1,
          key: apiKey,
        },
      });

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        // Get detailed stats
        const stats = await this.getYouTubeMusicStats(video.id.videoId);

        return {
          videoId: video.id.videoId,
          title: video.snippet.title,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          thumbnail: video.snippet.thumbnails.high?.url,
          ...stats,
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching YouTube Music:', error);
      return null;
    }
  }

  public async getYouTubeMusicStats(videoId: string): Promise<{ views?: number; likes?: number } | null> {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;

      if (!apiKey) {
        return null;
      }

      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'statistics',
          id: videoId,
          key: apiKey,
        },
      });

      if (response.data.items && response.data.items.length > 0) {
        const stats = response.data.items[0].statistics;
        return {
          views: parseInt(stats.viewCount || '0', 10),
          likes: parseInt(stats.likeCount || '0', 10),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting YouTube stats:', error);
      return null;
    }
  }

  // ========================================
  // Audiomack Integration (Web Scraping)
  // ========================================

  public async searchAudiomack(title: string, artist: string): Promise<AudiomackTrack | null> {
    try {
      // Audiomack doesn't have an official public API
      // We'll use web scraping via their search page
      // This requires Playwright for full implementation

      // For now, construct the search URL
      const query = `${artist} ${title}`.toLowerCase().replace(/\s+/g, '-');
      const searchUrl = `https://audiomack.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`;

      // Attempt to scrape using basic HTTP request
      // Note: This may not work well due to JavaScript rendering
      // Playwright implementation would be more robust
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 5000,
      });

      // Basic parsing - this is a simplified version
      // For production, use Playwright with proper DOM parsing
      const html = response.data;

      // Look for song URLs in the HTML
      const songUrlMatch = html.match(/href="(\/song\/[^"]+)"/);
      if (songUrlMatch) {
        const songPath = songUrlMatch[1];
        const fullUrl = `https://audiomack.com${songPath}`;

        // Try to get song details
        const songDetails = await this.getAudiomackTrackDetails(fullUrl);
        return songDetails;
      }

      console.log('Audiomack: No matches found. Consider implementing Playwright scraping for better results.');
      return null;
    } catch (error) {
      console.error('Error searching Audiomack:', error);
      // Audiomack scraping requires Playwright for JavaScript-rendered content
      console.log('Tip: For better Audiomack integration, implement Playwright-based scraping.');
      return null;
    }
  }

  public async getAudiomackTrackDetails(trackUrl: string): Promise<AudiomackTrack | null> {
    try {
      const response = await axios.get(trackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 5000,
      });

      const html = response.data;

      // Extract metadata from page
      // This is simplified - Playwright would be more reliable
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
      const artistMatch = html.match(/<meta property="music:musician" content="([^"]+)"/);
      const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

      // Try to extract play count from page (varies by Audiomack's HTML structure)
      const playsMatch = html.match(/data-plays="(\d+)"/);

      return {
        url: trackUrl,
        title: titleMatch ? titleMatch[1] : '',
        artist: artistMatch ? artistMatch[1] : '',
        plays: playsMatch ? parseInt(playsMatch[1], 10) : undefined,
        thumbnail: thumbnailMatch ? thumbnailMatch[1] : undefined,
      };
    } catch (error) {
      console.error('Error getting Audiomack track details:', error);
      return null;
    }
  }

  // ========================================
  // Apple Music API Integration
  // ========================================

  public async searchAppleMusic(title: string, artist: string): Promise<AppleMusicTrack | null> {
    try {
      // Apple Music Search API (no authentication required for search)
      const query = `${artist} ${title}`;

      const response = await axios.get('https://itunes.apple.com/search', {
        params: {
          term: query,
          media: 'music',
          entity: 'song',
          limit: 1,
        },
        timeout: 5000,
      });

      if (response.data.results && response.data.results.length > 0) {
        const track = response.data.results[0];
        return {
          trackId: track.trackId,
          trackName: track.trackName,
          artistName: track.artistName,
          collectionName: track.collectionName,
          releaseDate: track.releaseDate,
          primaryGenreName: track.primaryGenreName,
          artworkUrl100: track.artworkUrl100,
          trackViewUrl: track.trackViewUrl,
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching Apple Music:', error);
      return null;
    }
  }

  // ========================================
  // Playwright-based Audiomack Scraping (Advanced)
  // ========================================

  /**
   * For production use, implement Playwright scraping:
   *
   * public async searchAudiomackWithPlaywright(title: string, artist: string): Promise<AudiomackTrack | null> {
   *   const browser = await playwright.chromium.launch();
   *   const page = await browser.newPage();
   *
   *   await page.goto(`https://audiomack.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`);
   *   await page.waitForSelector('.search-results-item', { timeout: 5000 });
   *
   *   const firstResult = await page.$('.search-results-item');
   *   if (firstResult) {
   *     const trackUrl = await firstResult.$eval('a', el => el.href);
   *     const plays = await firstResult.$eval('.play-count', el => parseInt(el.textContent, 10));
   *     // ... extract other metadata
   *
   *     await browser.close();
   *     return { url: trackUrl, plays, ... };
   *   }
   *
   *   await browser.close();
   *   return null;
   * }
   */


  // ========================================
  // Metadata Enrichment Orchestration
  // ========================================

  public async enrichTrackMetadata(
    trackId: number,
    sources: Array<'spotify' | 'musicbrainz' | 'youtube' | 'audiomack' | 'applemusic'> = ['spotify', 'musicbrainz']
  ): Promise<EnrichedMetadata | null> {
    const db = this.databaseService.getDatabase();
    const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId) as any;

    if (!track) {
      throw new Error('Track not found');
    }

    const enrichedData: Partial<EnrichedMetadata> = {
      confidence: 0,
    };

    // Try Spotify first (best for popularity)
    if (sources.includes('spotify')) {
      const spotifyTrack = await this.searchSpotify(track.title, track.artist);
      if (spotifyTrack) {
        enrichedData.title = spotifyTrack.name;
        enrichedData.artist = spotifyTrack.artists[0]?.name;
        enrichedData.album = spotifyTrack.album.name;
        enrichedData.year = spotifyTrack.album.release_date ? parseInt(spotifyTrack.album.release_date.substring(0, 4)) : undefined;
        enrichedData.popularity = spotifyTrack.popularity;
        enrichedData.spotify_id = spotifyTrack.id;
        enrichedData.isrc = spotifyTrack.external_ids?.isrc;
        enrichedData.artwork_url = spotifyTrack.album.images[0]?.url;
        enrichedData.source = 'spotify';
        enrichedData.confidence = this.calculateMatchConfidence(track, spotifyTrack);
      }
    }

    // Try MusicBrainz for accurate metadata
    if (sources.includes('musicbrainz')) {
      const mbRecording = await this.searchMusicBrainz(track.title, track.artist);
      if (mbRecording) {
        // Only override if we don't have Spotify data or if confidence is higher
        if (!enrichedData.title || enrichedData.confidence < 0.8) {
          enrichedData.title = mbRecording.title;
          enrichedData.artist = mbRecording['artist-credit'][0]?.name;
          enrichedData.album = mbRecording.releases?.[0]?.title;
          enrichedData.year = mbRecording.releases?.[0]?.date ?
            parseInt(mbRecording.releases[0].date.substring(0, 4)) : undefined;

          // Extract genre tags from MusicBrainz tags
          if (mbRecording.tags && mbRecording.tags.length > 0) {
            enrichedData.genre_tags = mbRecording.tags
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(tag => tag.name);
            enrichedData.genre = enrichedData.genre_tags[0];
          }

          if (!enrichedData.source) {
            enrichedData.source = 'musicbrainz';
            enrichedData.confidence = 0.7; // MusicBrainz is generally accurate
          }
        }
      }
    }

    // Try YouTube Music for views and engagement
    if (sources.includes('youtube')) {
      const youtubeTrack = await this.searchYouTubeMusic(track.title, track.artist);
      if (youtubeTrack) {
        enrichedData.youtube_video_id = youtubeTrack.videoId;
        if (youtubeTrack.views) {
          // Use YouTube views as streams if we don't have stream data
          if (!enrichedData.streams) {
            enrichedData.streams = youtubeTrack.views;
          }
        }
        if (youtubeTrack.thumbnail && !enrichedData.artwork_url) {
          enrichedData.artwork_url = youtubeTrack.thumbnail;
        }
        if (!enrichedData.source) {
          enrichedData.source = 'youtube';
          enrichedData.confidence = 0.6; // YouTube matching is less reliable
        }
      }
    }

    // Try Audiomack for African music (especially Nigerian)
    if (sources.includes('audiomack')) {
      const audiomackTrack = await this.searchAudiomack(track.title, track.artist);
      if (audiomackTrack) {
        enrichedData.audiomack_url = audiomackTrack.url;
        if (audiomackTrack.plays) {
          // Use Audiomack plays as streams if we don't have other data
          if (!enrichedData.streams) {
            enrichedData.streams = audiomackTrack.plays;
          }
        }
        if (audiomackTrack.thumbnail && !enrichedData.artwork_url) {
          enrichedData.artwork_url = audiomackTrack.thumbnail;
        }
        if (!enrichedData.source) {
          enrichedData.source = 'audiomack';
          enrichedData.confidence = 0.6; // Web scraping is less reliable
        }
      }
    }

    // Try Apple Music for metadata and popularity
    if (sources.includes('applemusic')) {
      const appleMusicTrack = await this.searchAppleMusic(track.title, track.artist);
      if (appleMusicTrack) {
        // Only override if we don't have Spotify data
        if (!enrichedData.spotify_id) {
          enrichedData.title = appleMusicTrack.trackName;
          enrichedData.artist = appleMusicTrack.artistName;
          enrichedData.album = appleMusicTrack.collectionName;
          enrichedData.year = appleMusicTrack.releaseDate ?
            parseInt(appleMusicTrack.releaseDate.substring(0, 4)) : undefined;
          enrichedData.artwork_url = appleMusicTrack.artworkUrl100?.replace('100x100', '600x600');

          if (!enrichedData.source) {
            enrichedData.source = 'applemusic' as any;
            enrichedData.confidence = 0.75; // Apple Music is fairly accurate
          }
        }
      }
    }

    if (!enrichedData.source) {
      return null; // No matches found
    }

    return enrichedData as EnrichedMetadata;
  }

  private calculateMatchConfidence(localTrack: any, spotifyTrack: SpotifyTrack): number {
    let confidence = 0;

    // Title similarity
    const titleSimilarity = this.stringSimilarity(
      localTrack.title.toLowerCase(),
      spotifyTrack.name.toLowerCase()
    );
    confidence += titleSimilarity * 0.5;

    // Artist similarity
    const artistSimilarity = this.stringSimilarity(
      localTrack.artist.toLowerCase(),
      spotifyTrack.artists[0]?.name.toLowerCase() || ''
    );
    confidence += artistSimilarity * 0.5;

    return Math.min(confidence, 1);
  }

  private stringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // ========================================
  // Batch Enrichment
  // ========================================

  public async enrichLibrary(
    limit: number = 100,
    minConfidence: number = 0.7
  ): Promise<{
    enriched: number;
    failed: number;
    skipped: number;
  }> {
    const db = this.databaseService.getDatabase();

    // Get tracks without Spotify ID
    const tracks = db.prepare(`
      SELECT id, title, artist
      FROM tracks
      WHERE spotify_id IS NULL
      LIMIT ?
    `).all(limit) as any[];

    let enriched = 0;
    let failed = 0;
    let skipped = 0;

    for (const track of tracks) {
      try {
        const metadata = await this.enrichTrackMetadata(track.id);

        if (metadata && metadata.confidence >= minConfidence) {
          // Update track with enriched metadata
          const updates: any = {};

          if (metadata.spotify_id) updates.spotify_id = metadata.spotify_id;
          if (metadata.popularity !== undefined) updates.popularity = metadata.popularity;
          if (metadata.isrc) updates.isrc = metadata.isrc;
          if (metadata.year) updates.year = metadata.year;
          if (metadata.genre) updates.genre = metadata.genre;
          if (metadata.genre_tags) updates.genre_tags = JSON.stringify(metadata.genre_tags);
          if (metadata.streams) updates.play_count = metadata.streams;
          if (metadata.artwork_url) updates.artwork_path = metadata.artwork_url;

          // Build UPDATE query
          const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updates);

          if (setClause) {
            db.prepare(`UPDATE tracks SET ${setClause} WHERE id = ?`)
              .run(...values, track.id);
            enriched++;
          }
        } else {
          skipped++;
        }

        // Rate limiting - wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error enriching track ${track.id}:`, error);
        failed++;
      }
    }

    return { enriched, failed, skipped };
  }
}
