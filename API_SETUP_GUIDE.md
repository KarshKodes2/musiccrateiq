# Music Metadata Enrichment - API Setup Guide

This guide will help you set up API keys for enriching your music library metadata with data from Spotify, Last.fm, YouTube Music, and MusicBrainz.

---

## 🎵 Overview

The DJ Library Manager can automatically enrich your track metadata by matching your local files with online music databases. This gives you:

- **Popularity scores** (0-100 from Spotify)
- **Streaming stats** (play counts from Last.fm)
- **YouTube views & likes** (from YouTube Music)
- **Accurate metadata** (from MusicBrainz)
- **Genre tags** (from MusicBrainz)
- **Artwork/thumbnails**
- **ISRC codes** (for track identification)

---

## 1. Spotify API (Recommended - Best for Popularity)

### Why Spotify?
- Most accurate popularity scores (0-100 scale)
- High-quality metadata
- Official API with generous rate limits
- Free tier available

### Setup Steps:

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Log in with your Spotify account (create one if needed)

2. **Create an App**
   - Click "Create App"
   - App name: `DJ Library Manager` (or any name)
   - App description: `Personal DJ library metadata enrichment`
   - Redirect URI: `http://localhost:3000` (not used, but required)
   - Check "Web API" under "Which API/SDKs are you planning to use?"
   - Click "Save"

3. **Get Your Credentials**
   - Click on your app name
   - Click "Settings"
   - Copy the **Client ID**
   - Click "View client secret" and copy the **Client Secret**

4. **Add to .env File**
   ```env
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
   ```

### Rate Limits:
- Free tier: Plenty for personal use
- No explicit limit documented (thousands of requests per day)

---

## 2. Last.fm API (For Play Counts & Scrobbles)

### Why Last.fm?
- Global play count data
- Free and easy to set up
- No credit card required
- Community-driven metadata

### Setup Steps:

1. **Create a Last.fm Account**
   - Visit: https://www.last.fm
   - Sign up if you don't have an account

2. **Create an API Account**
   - Visit: https://www.last.fm/api/account/create
   - Application name: `DJ Library Manager`
   - Application description: `Personal DJ library management tool`
   - Submit the form

3. **Get Your API Key**
   - After submission, you'll see your **API Key**
   - Copy the API key (the long hexadecimal string)

4. **Add to .env File**
   ```env
   LASTFM_API_KEY=your_actual_lastfm_api_key_here
   ```

### Rate Limits:
- Free tier: 5 requests per second
- More than enough for batch enrichment

---

## 3. YouTube Data API v3 (For YouTube Music)

### Why YouTube?
- Massive music catalog (official + unofficial)
- View counts and engagement metrics
- Good for Nigerian music and rare tracks
- Free tier available

### Setup Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Project name: `DJ Library Manager`
   - Click "Create"

3. **Enable YouTube Data API v3**
   - In the search bar, type "YouTube Data API v3"
   - Click on "YouTube Data API v3"
   - Click "Enable"

4. **Create API Credentials**
   - Click "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key
   - (Optional) Click "Restrict Key" to limit it to YouTube Data API v3 only

5. **Add to .env File**
   ```env
   YOUTUBE_API_KEY=your_actual_youtube_api_key_here
   ```

### Rate Limits:
- Free tier: 10,000 quota units per day
- Each search = 100 units, video details = 1 unit
- Approximately ~100 track lookups per day on free tier

### Cost (If You Exceed Free Tier):
- $0.0002 per unit after free quota
- Very affordable for personal use

---

## 4. MusicBrainz (No API Key Required!)

### Why MusicBrainz?
- **Completely free** - no API key needed!
- Open-source music encyclopedia
- Very accurate metadata (especially for older music)
- Community-maintained
- Great for genre tags

### Setup:
No setup required! Just works out of the box.

**Rate Limits:**
- Please be respectful: 1 request per second recommended
- No API key needed, but requires User-Agent header (already configured)

---

## 🚀 Using the Enrichment Features

### Enrich a Single Track

```bash
# Preview enriched metadata (doesn't apply changes)
curl -X POST http://localhost:5000/api/enrichment/track/123 \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["spotify", "musicbrainz", "lastfm"],
    "autoApply": false,
    "minConfidence": 0.7
  }'

# Auto-apply if confidence is high enough
curl -X POST http://localhost:5000/api/enrichment/track/123 \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["spotify", "musicbrainz"],
    "autoApply": true,
    "minConfidence": 0.7
  }'
```

### Enrich Your Entire Library

```bash
# Batch enrich up to 100 tracks
curl -X POST http://localhost:5000/api/enrichment/library \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 100,
    "minConfidence": 0.7
  }'
```

### Get Popular Tracks

```bash
# Get tracks with highest Spotify popularity
curl http://localhost:5000/api/enrichment/popular?limit=50&minPopularity=70
```

### Get Enrichment Stats

```bash
# See how many tracks have been enriched
curl http://localhost:5000/api/enrichment/stats
```

---

## 📊 What Data Gets Updated?

When you enrich a track, the following fields can be updated:

| Field | Source(s) | Description |
|-------|-----------|-------------|
| `spotify_id` | Spotify | Unique Spotify track identifier |
| `popularity` | Spotify | 0-100 popularity score |
| `isrc` | Spotify | International Standard Recording Code |
| `year` | Spotify, MusicBrainz | Release year |
| `genre` | MusicBrainz | Primary genre |
| `genre_tags` | MusicBrainz | Array of genre tags |
| `play_count` | Last.fm, YouTube | Global play/view count |
| `artwork_path` | Spotify, YouTube | Album/video artwork URL |

---

## ⚡ Best Practices

### 1. Use Multiple Sources
Combine sources for best results:
```json
{
  "sources": ["spotify", "musicbrainz", "lastfm"]
}
```

### 2. Set Appropriate Confidence Threshold
- `0.7` - Recommended (good balance)
- `0.8` - Stricter matching (fewer false positives)
- `0.6` - More lenient (catches more matches)

### 3. Rate Limiting Strategy
- **Spotify**: No limits for personal use
- **MusicBrainz**: 1 request/second (built-in 100ms delay)
- **Last.fm**: 5 requests/second
- **YouTube**: ~100 lookups/day on free tier

### 4. Batch Processing
Process your library in batches:
```bash
# Process 100 tracks, wait, then process next 100
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/enrichment/library \
    -H "Content-Type: application/json" \
    -d '{"limit": 100}'
  sleep 60  # Wait 1 minute between batches
done
```

---

## 🔒 Privacy & Data Usage

### What's Sent to APIs?
- Track title and artist name only
- No file contents or personal data
- All requests are read-only (no data sent back to services)

### Local Storage
All enriched data is stored locally in your SQLite database. Nothing is shared or uploaded.

---

## 🐛 Troubleshooting

### Error: "Spotify credentials not configured"
- Make sure `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set in `backend/.env`
- Check for typos in the credentials
- Restart the backend server after updating `.env`

### Error: "Failed to authenticate with Spotify"
- Your credentials might be wrong - regenerate them
- Make sure there are no extra spaces in the `.env` file

### Error: "YouTube API quota exceeded"
- You've hit the 10,000 units/day free limit
- Wait until midnight Pacific Time for quota reset
- Or enable billing in Google Cloud Console for more quota

### Low Confidence Scores
- Try different combinations of artist name and title
- Some tracks might not be in the databases
- MusicBrainz is better for older/rare music

---

## 📈 Example Enrichment Results

### Before Enrichment:
```json
{
  "id": 123,
  "title": "Water No Get Enemy",
  "artist": "Fela Kuti",
  "bpm": null,
  "popularity": null,
  "genre_tags": null
}
```

### After Enrichment:
```json
{
  "id": 123,
  "title": "Water No Get Enemy",
  "artist": "Fela Kuti",
  "spotify_id": "7iN1s7xHE4ifF5povM6A48",
  "popularity": 56,
  "year": 1975,
  "genre": "Afrobeat",
  "genre_tags": ["afrobeat", "jazz", "world", "funk"],
  "isrc": "GBAYE7500123",
  "play_count": 1234567,
  "artwork_path": "https://i.scdn.co/image/...",
  "confidence": 0.92,
  "source": "spotify"
}
```

---

## 🎯 Recommended Setup for Your Use Case

Based on your Nigerian music focus and YouTube Music usage:

1. **Primary**: Spotify API (best for popularity and modern tracks)
2. **Secondary**: MusicBrainz (excellent for Afrobeat classics and accurate metadata)
3. **Tertiary**: YouTube API (for view counts and tracks not on Spotify)
4. **Optional**: Last.fm (additional play count data)

### Quick Start Command:
```bash
# Set up all keys in backend/.env, then:
curl -X POST http://localhost:5000/api/enrichment/library \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 100,
    "minConfidence": 0.7
  }'
```

---

## 💡 Tips for Nigerian Music

- MusicBrainz has excellent coverage of classic Afrobeat (Fela Kuti, King Sunny Ade)
- YouTube often has better coverage for modern Afrobeats than Spotify
- Use genre tag filtering: `"genre_tags": ["afrobeat", "afrobeats", "highlife"]`
- For elder-friendly playlists, filter by `popularity` (established tracks have higher scores)

---

Need help? Check the main README.md or open an issue on GitHub!
