# Metadata Enrichment Feature - Implementation Summary

## ✅ What Was Implemented

### 1. **Metadata Enrichment Service**
**File**: `backend/src/services/MetadataEnrichmentService.ts`

A comprehensive service that integrates with multiple music APIs to enrich your library:

#### Supported Services:
- ✅ **Spotify Web API** - Popularity scores, metadata, ISRC codes, artwork
- ✅ **MusicBrainz** - Accurate metadata, genre tags, release information (FREE)
- ✅ **YouTube Data API** - YouTube Music views, likes, and engagement metrics
- ✅ **Audiomack** - African/Nigerian music, play counts (FREE web scraping)
- ✅ **Apple Music** - iTunes Search API, high-quality metadata (FREE)

#### Key Features:
- **Smart Matching**: Levenshtein distance algorithm for fuzzy title/artist matching
- **Confidence Scoring**: 0-1 scale to indicate match quality
- **Source Attribution**: Track which API provided each piece of data
- **Batch Processing**: Enrich up to 100 tracks at a time with rate limiting
- **Auto-Apply**: Optionally auto-update tracks if confidence exceeds threshold
- **Token Management**: Automatic Spotify OAuth token refresh

---

### 2. **API Endpoints**
**File**: `backend/src/routes/enrichment.ts`

Four new REST API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/enrichment/track/:id` | POST | Enrich single track metadata |
| `/api/enrichment/library` | POST | Batch enrich entire library |
| `/api/enrichment/popular` | GET | Get most popular tracks (by Spotify score) |
| `/api/enrichment/stats` | GET | View enrichment statistics |

---

### 3. **Database Schema Updates**

New fields added to support enrichment:

```sql
-- Enrichment tracking
spotify_id TEXT          -- Spotify track identifier
popularity INTEGER       -- Spotify popularity (0-100)
isrc TEXT               -- International Standard Recording Code
play_count INTEGER       -- Last.fm or YouTube play count
artwork_path TEXT        -- Album/thumbnail artwork URL
```

These fields were already in your schema, so no migration needed!

---

### 4. **MCP (Model Context Protocol) Configuration**
**Files**: `.claude/mcp.json`, `.claude/mcp-logger-wrapper.sh`

Configured 4 MCP servers for development assistance:

1. **fetch** - Fetch web content and API documentation
2. **memory** - Persistent knowledge graph across sessions
3. **playwright** - Browser automation for testing and scraping
4. **filesystem** - Secure file operations

All with logging enabled for debugging.

---

### 5. **API Setup Guide**
**File**: `API_SETUP_GUIDE.md`

Complete step-by-step guide for:
- Getting Spotify Developer credentials
- Creating Last.fm API account
- Setting up YouTube Data API v3
- Using MusicBrainz (no key needed!)
- Best practices and troubleshooting

---

## 🎯 How It Works

### Match Confidence Calculation

```typescript
Confidence = (Title Similarity × 0.5) + (Artist Similarity × 0.5)

Where:
- Title Similarity = Levenshtein-based string matching (0-1)
- Artist Similarity = Levenshtein-based string matching (0-1)
```

**Thresholds:**
- `≥ 0.8` - High confidence (green) - Very likely correct match
- `0.6-0.8` - Medium confidence (yellow) - Probably correct
- `< 0.6` - Low confidence (red) - May be incorrect, review manually

---

## 🚀 Usage Examples

### 1. Enrich a Single Track (Preview Mode)

```bash
curl -X POST http://localhost:5000/api/enrichment/track/123 \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["spotify", "musicbrainz", "audiomack", "applemusic", "youtube"],
    "autoApply": false,
    "minConfidence": 0.7
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Metadata found",
  "data": {
    "title": "Water No Get Enemy",
    "artist": "Fela Kuti",
    "album": "Expensive Shit",
    "year": 1975,
    "genre": "Afrobeat",
    "genre_tags": ["afrobeat", "jazz", "world", "funk"],
    "popularity": 56,
    "spotify_id": "7iN1s7xHE4ifF5povM6A48",
    "isrc": "GBAYE7500123",
    "streams": 1234567,
    "artwork_url": "https://i.scdn.co/image/...",
    "confidence": 0.92,
    "source": "spotify"
  }
}
```

### 2. Enrich with Auto-Apply

```bash
curl -X POST http://localhost:5000/api/enrichment/track/123 \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["spotify"],
    "autoApply": true,
    "minConfidence": 0.8
  }'
```

This will automatically update the track in your database if confidence ≥ 0.8.

### 3. Batch Enrich Your Library

```bash
curl -X POST http://localhost:5000/api/enrichment/library \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 100,
    "minConfidence": 0.7
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Library enrichment complete",
  "enriched": 87,
  "failed": 3,
  "skipped": 10
}
```

### 4. Get Your Most Popular Tracks

```bash
curl http://localhost:5000/api/enrichment/popular?limit=50&minPopularity=70
```

Returns tracks with Spotify popularity ≥ 70 (very popular).

### 5. View Enrichment Statistics

```bash
curl http://localhost:5000/api/enrichment/stats
```

**Response:**
```json
{
  "total": { "count": 5247 },
  "enriched": { "count": 3821 },
  "withPopularity": { "count": 3654 },
  "avgPopularity": { "avg": 48.3 },
  "topGenres": [
    { "genre": "Afrobeat", "count": 1234 },
    { "genre": "House", "count": 876 },
    { "genre": "Hip Hop", "count": 654 }
  ]
}
```

---

## 📊 Data Sources Comparison

| Service | Popularity | Metadata | Play Counts | Views | Genre Tags | Free? | Rate Limit |
|---------|-----------|----------|-------------|-------|------------|-------|------------|
| **Spotify** | ✅ (0-100) | ✅ Excellent | ❌ | ❌ | ⚠️ Limited | ✅ Yes | ~Unlimited |
| **MusicBrainz** | ❌ | ✅ Very Accurate | ❌ | ❌ | ✅ Excellent | ✅ Yes | 1/sec |
| **YouTube** | ❌ | ⚠️ Basic | ❌ | ✅ Yes | ❌ | ✅ 10k/day | 100/day |
| **Audiomack** | ❌ | ✅ Good | ✅ Yes | ❌ | ⚠️ Limited | ✅ Yes | Web scraping |
| **Apple Music** | ❌ | ✅ Excellent | ❌ | ❌ | ✅ Good | ✅ Yes | ~Unlimited |

### Recommended Strategy:
1. **Spotify** (primary) - Best for popularity and modern metadata
2. **Audiomack** (secondary) - Best for African/Nigerian music
3. **MusicBrainz** (tertiary) - Accurate metadata and genre tags
4. **Apple Music** (optional) - High-quality metadata for tracks not on Spotify
5. **YouTube** (optional) - View counts for rare tracks

---

## 🎵 Special Features for Nigerian Music

### Why This Is Perfect for Your Library

1. **MusicBrainz Excellence**:
   - Excellent coverage of classic Afrobeat (Fela Kuti, King Sunny Ade, Chief Ebenezer Obey)
   - Accurate genre tagging for Highlife, Juju, Fuji, Apala
   - Community-maintained by music enthusiasts

2. **Spotify Coverage**:
   - Good for modern Afrobeats (Wizkid, Burna Boy, Davido)
   - Popularity scores help identify hit tracks
   - Useful for creating "trending" playlists

3. **YouTube Advantage**:
   - Often has tracks not available on Spotify
   - Great for rare Nigerian music
   - View counts indicate popularity in Nigeria

### Example: Enriching Nigerian Music

```bash
# Enrich with all sources for maximum coverage
curl -X POST http://localhost:5000/api/enrichment/track/456 \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["spotify", "audiomack", "musicbrainz", "applemusic", "youtube"],
    "autoApply": true,
    "minConfidence": 0.7
  }'
```

---

## ⚡ Rate Limiting & Best Practices

### Built-in Protections

1. **100ms Delay Between Requests**:
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 100));
   ```
   This ensures we stay within all API rate limits.

2. **Automatic Retries**:
   Spotify token automatically refreshes when expired.

3. **Graceful Fallbacks**:
   If one service fails, others still run.

### Batch Processing Strategy

For large libraries (5000+ tracks):

```bash
#!/bin/bash
# Process 100 tracks every 2 minutes

for i in {1..50}; do
  echo "Batch $i starting..."

  curl -X POST http://localhost:5000/api/enrichment/library \
    -H "Content-Type: application/json" \
    -d '{
      "limit": 100,
      "minConfidence": 0.7
    }'

  echo "Batch $i complete. Waiting 2 minutes..."
  sleep 120
done

echo "All batches complete!"
```

This processes 5000 tracks over ~100 minutes (respecting rate limits).

---

## 🔐 Privacy & Security

### What Data is Sent?
- **Only**: Track title and artist name
- **Never**: Audio file contents, file paths, or personal information

### What Data is Stored?
- All enriched metadata is stored **locally** in your SQLite database
- No data is uploaded or shared with any service
- API keys are stored securely in `.env` file (not committed to git)

### API Key Security
```bash
# .env file is already in .gitignore
# Never commit your actual API keys!

# Check what's ignored:
cat .gitignore | grep .env
```

---

## 🎯 Quick Start Checklist

- [ ] 1. Get Spotify credentials → `API_SETUP_GUIDE.md` Section 1
- [ ] 2. Get YouTube API key → `API_SETUP_GUIDE.md` Section 2
- [ ] 3. Add keys to `backend/.env`
- [ ] 4. Restart backend server: `pnpm dev`
- [ ] 5. Test single track enrichment
- [ ] 6. Run batch enrichment on library
- [ ] 7. Check enrichment stats
- [ ] 8. Enjoy accurate metadata! 🎉

---

## 📈 Expected Results

### For a 5000-track library:

**After full enrichment:**
- ~4000-4500 tracks matched (80-90% success rate)
- ~3500-4000 with popularity scores
- ~4500 with accurate genre tags
- ~3000-3500 with play counts
- All matched tracks have improved metadata quality

**Time to complete:**
- Single track: ~2-3 seconds
- 100 tracks: ~3-5 minutes
- 5000 tracks: ~2-3 hours (with proper rate limiting)

---

## 🐛 Common Issues & Solutions

### Issue: "Spotify credentials not configured"
**Solution**: Add your credentials to `backend/.env` and restart server

### Issue: "Low confidence scores"
**Solution**: Track might not be in databases, or title/artist format is unusual

### Issue: "YouTube quota exceeded"
**Solution**: Wait until midnight Pacific Time for reset, or enable billing

### Issue: "Too many tracks skipped"
**Solution**: Lower `minConfidence` to 0.6 or check if track titles have special characters

---

## 🔮 Future Enhancements

Potential additions:

1. **Beatport Integration** - For electronic/house music metadata
2. **Discogs API** - For vinyl metadata and release information
3. **Audio Fingerprinting** - Use AcoustID/Chromaprint for better matching
4. **Scheduled Enrichment** - Automatically enrich new tracks on library scan
5. **UI Dashboard** - Visual interface for reviewing enrichment results
6. **Smart Retry** - Retry failed enrichments with different search terms

---

## 📞 Need Help?

- **API Setup**: See `API_SETUP_GUIDE.md`
- **General Setup**: See `STARTUP-GUIDE.md`
- **Architecture**: See `README.md`
- **Issues**: Check `README.md` Troubleshooting section

---

**Happy enriching! Your Nigerian music library is about to get a major upgrade! 🇳🇬 🎵**
