# MusicCrateIQ

**Intelligent Music Library Management for DJs and Music Professionals**

A comprehensive music library management system featuring **pluggable audio analysis**, **era-based organization**, **smart crates with Nigerian music support**, harmonic playlist generation, and Serato integration.

## 🎯 Key Features

### Core Functionality
- **Music Library Management**: Organize and manage your entire music collection with decade-based era classification (70s-2020s)
- **Pluggable Audio Analysis**: Modular analysis engine supporting Metadata extraction, Aubio BPM detection, with future Essentia support
- **Smart Crates System**: 25+ pre-configured crates including Old Skool (80s-2000s), Nigerian Music (Afrobeat, Highlife, Juju, Fuji, Apala), Gospel, and Valentine playlists by era
- **Harmonic Playlist Generation**: Create DJ sets with smooth key transitions using Camelot Wheel notation
- **Batch Operations**: Multi-select tracks for bulk metadata editing
- **Serato Integration**: Bidirectional sync with Serato DJ library
- **Advanced Search**: Filter by BPM range, key, era, genre tags, mood tags, energy level, and confidence scores
- **Analytics Dashboard**: Track collection statistics, play counts, and genre distribution

### Audio Analysis Features
- **Multi-Engine Analysis**: Priority-based merging from multiple sources (Metadata → Aubio → Manual)
- **Confidence Scoring**: 0-1 scale for BPM/key detection quality with automatic re-analysis flagging
- **Source Attribution**: Track which engine provided each analysis value
- **Genre Multi-Tagging**: Comprehensive Nigerian music support (Afrobeat, Afrobeats, Highlife, Juju, Fuji, Apala, Hip-Life, Street-Pop)
- **Mood Multi-Tagging**: Tag tracks with multiple moods for better playlist curation
- **Energy Level Classification**: 1-5 scale for building energy curves

### Smart Crates (25+ Pre-Configured)

**Old Skool Collections:**
- 🌍 Old Skool International (80s-2000s)
- 🏆 Old-Skool Gold (80s-2000s, rated 3+)
- 👴 Old Skool → Modern Blend (Elder-Friendly, ≤120 BPM)

**Nigerian Music:**
- 🎺 Afrobeat Classics (Fela Era: 70s-90s)
- 🎸 Highlife Gold
- 🔥 Modern Afrobeats (2010s-2020s)
- 🇳🇬 Nigerian Old Skool Hits
- 🎉 Nigerian Elder-Friendly Party
- Plus: Juju, Fuji, Apala dedicated crates

**Gospel Collections:**
- ✝️ Gospel Essentials
- 🙏 Slow Praise (Worship, ≤90 BPM)
- 🎤 High-Energy Worship

**Valentine Playlists by Era:**
- 💜 80s Valentine, 💙 90s Valentine, 💚 2000s Valentine
- 💛 2010s Valentine, ❤️ 2020s Valentine

**Plus:** Genre-based (House, Techno, Hip Hop, Pop), Energy-based (Peak Time, High Energy, Low Energy), BPM-based (Slow, Walking, Jogging, Running, Sprinting), Event-specific (Wedding, Corporate, Kids)

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js 5.1.0
- **Database**: Better-SQLite3 12.2.0 (embedded SQLite)
- **Package Manager**: pnpm (monorepo workspace)
- **Audio Analysis**:
  - **MetadataEngine** (Priority 1): music-metadata 7.14.0 for ID3/Vorbis tag extraction
  - **AubioEngine** (Priority 2): Aubio CLI for BPM detection (install: `brew install aubio`)
  - **EssentiaEngine** (Future): Python microservice for high-accuracy analysis
- **File Monitoring**: Chokidar 4.0.3 (configurable for large libraries)
- **Security**: Helmet, CORS, JWT authentication

### Frontend
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit 2.5.0
- **Data Fetching**: TanStack Query (React Query) 5.64.4
- **Routing**: React Router v7
- **UI Components**:
  - shadcn/ui (Radix UI primitives + Tailwind CSS)
  - Lucide React for icons
  - Howler.js 2.2.4 for audio playback
- **Notifications**: Sonner toast notifications

### Desktop App
- **Framework**: Electron (main.js + preload.js)
- **Platform**: Cross-platform (macOS, Windows, Linux)

## 📁 Project Structure

```
dj-library-manager/
├── backend/
│   ├── src/
│   │   ├── services/        # Business logic services
│   │   │   ├── analysis/    # 🆕 Pluggable analysis engines
│   │   │   │   ├── IAnalysisEngine.ts        # Interface for all engines
│   │   │   │   ├── AnalysisOrchestrator.ts   # Priority-based merging
│   │   │   │   ├── MetadataEngine.ts         # Extract from file tags
│   │   │   │   └── AubioEngine.ts            # BPM detection via Aubio
│   │   │   ├── DatabaseService.ts            # 🆕 Enhanced with era, mood_tags, genre_tags, confidence
│   │   │   ├── AudioAnalyzer.ts              # Legacy heuristic analyzer
│   │   │   ├── LibraryScanner.ts
│   │   │   ├── PlaylistGenerator.ts          # Harmonic playlist generation
│   │   │   ├── SeratoService.ts
│   │   │   ├── BatchEditService.ts           # Bulk metadata editing
│   │   │   └── FileWatcherService.ts         # Configurable file monitoring
│   │   ├── routes/          # API routes
│   │   │   ├── library.ts
│   │   │   ├── playlists.ts
│   │   │   ├── crates.ts
│   │   │   ├── batch.ts     # 🆕 Batch operations
│   │   │   ├── search.ts
│   │   │   ├── analytics.ts
│   │   │   └── serato.ts
│   │   ├── middleware/      # Express middleware
│   │   │   └── errorHandler.ts
│   │   └── utils/           # Utility functions
│   │       └── logger.ts
│   ├── database/            # SQLite database (enhanced schema)
│   ├── uploads/             # Uploaded audio files
│   └── .env                 # 🆕 Configuration (MUSIC_LIBRARY_PATH, WATCH_ENABLED)
│
├── frontend/
│   ├── src/
│   │   ├── features/        # Feature-based modules
│   │   │   ├── library/
│   │   │   │   ├── LibraryPage.tsx
│   │   │   │   └── BatchEditModal.tsx  # 🆕 Bulk editing with Nigerian genres
│   │   │   ├── playlists/
│   │   │   ├── crates/
│   │   │   ├── search/
│   │   │   ├── analytics/
│   │   │   └── audio/
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/          # shadcn/ui primitives (25+ components)
│   │   │   ├── layout/      # 🆕 Layout, Header, Sidebar, Footer
│   │   │   └── common/      # Shared components
│   │   ├── store/           # Redux store
│   │   │   ├── slices/      # 7 Redux slices (library, playlists, crates, etc.)
│   │   │   └── middleware/  # Custom middleware
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # 🆕 Enhanced TypeScript definitions (Era, AnalysisSource, etc.)
│   └── public/              # Static assets
│
├── electron/                # Desktop app wrapper
│   ├── main.js
│   └── preload.js
│
└── pnpm-workspace.yaml      # 🆕 Monorepo configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (recommended: 22.2.0)
- **pnpm 8+** (install: `npm install -g pnpm` or `brew install pnpm`)
- **Aubio** (optional, for BPM detection): `brew install aubio` (macOS) or `apt-get install aubio-tools` (Ubuntu)
- **macOS Users**: Disable AirPlay Receiver (uses port 5000) - See troubleshooting section

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd dj-library-manager
```

2. Install all dependencies (monorepo):

```bash
pnpm install
```

This installs dependencies for backend, frontend, and electron in one command.

### Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./database/library.db

# Music Library Path (REQUIRED - set this to your music folder)
MUSIC_LIBRARY_PATH=/Users/yourusername/Music/Music Library

# Temporary Files & Uploads
TEMP_FOLDER=./temp
UPLOADS_FOLDER=./uploads

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Serato Integration (optional - will auto-detect if not set)
# SERATO_PATH=/Users/yourusername/Music/_Serato_

# Logging
LOG_LEVEL=info

# Audio Analysis
MAX_CONCURRENT_ANALYSIS=5
ANALYSIS_TIMEOUT=60000

# File Watching (IMPORTANT: Disable for large libraries to prevent ENFILE errors)
# For libraries with 1000+ tracks, use manual "Scan Library" instead
WATCH_ENABLED=false
WATCH_DEBOUNCE_MS=3000
```

**Important:** Update `MUSIC_LIBRARY_PATH` to point to your actual music folder.

### Port Configuration

All ports are centralized in `.env.ports` (reference file):

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 5000 | http://localhost:5000/api |
| WebSocket | 5000 | ws://localhost:5000 |

**Actual configuration files:**
- `backend/.env` → `PORT=5000`, `CORS_ORIGIN=http://localhost:3000`
- `frontend/.env` → `VITE_API_URL=http://localhost:5000`
- `package.json` → `wait-on` URLs
- `electron/main.js` → `PORT` variable

### Running the Application

#### Development Mode (Terminal-based)

**Option 1: Start all services in parallel**

```bash
pnpm dev
```

This runs backend and frontend concurrently.

**Option 2: Start services separately**

1. Start the backend server:

```bash
cd backend
pnpm dev
```

2. In a separate terminal, start the frontend:

```bash
cd frontend
pnpm dev
```

**Access:**
- Backend API: `http://localhost:5000`
- Frontend UI: `http://localhost:3000` (or Vite default: `http://localhost:5173`)

#### Desktop App Mode (Electron)

```bash
pnpm dev
```

This launches the full desktop application with:
- Backend server on port 5000
- Frontend on port 3000
- Native Electron window with IPC integration
- Folder picker for music library selection

**Features in Desktop Mode:**
- Native folder/file dialogs
- System tray integration
- Auto-updates (when configured)
- Better performance than web version

#### Production Build

1. Build all packages:

```bash
pnpm build
```

2. Start production server:

```bash
cd backend
pnpm start
```

## ⚙️ Settings & Configuration

### Music Library Path Selector

The application includes a Settings page for easy configuration:

1. **Access Settings**: Click the ⚙️ Settings icon in the top navigation
2. **Select Music Folder**: Click "Browse..." to open native folder picker
3. **Save Path**: Path is automatically saved to the database
4. **Scan Library**: Click "Scan Library" to analyze all audio files

**Settings API Endpoints:**
- `GET /api/settings` - Retrieve all settings
- `PUT /api/settings/:key` - Update a specific setting
- `POST /api/settings/music-library/scan` - Start library scan

**Supported Settings:**
- `musicLibraryPath` - Path to your music folder

The Settings page uses Electron IPC for native folder dialogs in desktop mode, with fallback to text input in web mode.

## 📊 Database Schema Enhancements

The database includes enhanced fields for professional DJ workflows:

### Track Model (60+ fields)

**Basic Metadata:**
- `title`, `artist`, `album`, `genre`, `label`, `year`

**Audio Properties:**
- `duration`, `bitrate`, `sample_rate`, `bpm`, `key_signature`

**Analysis Fields (NEW):**
- `era` - Decade classification: `70s`, `80s`, `90s`, `2000s`, `2010s`, `2020s`
- `mood_tags` - JSON array: `["romantic", "love", "energetic"]`
- `genre_tags` - JSON array: `["afrobeat", "highlife", "juju"]`
- `bpm_confidence` - 0-1 scale (threshold: 0.6 for re-analysis)
- `key_confidence` - 0-1 scale
- `bpm_source` - `metadata` | `aubio` | `essentia` | `manual` | `pending`
- `key_source` - Source of key detection
- `analysis_status` - `pending` | `analyzing` | `complete` | `failed`
- `analysis_version` - Engine version (e.g., "aubio-1.0.0")
- `needs_reanalysis` - Boolean flag for low-confidence tracks

**Audio Features:**
- `energy_level` (1-5), `danceability`, `valence`, `acousticness`
- `instrumentalness`, `liveness`, `speechiness`, `tempo_stability`

**DJ-Specific:**
- `intro_time`, `outro_time`, `beatgrid`, `cue_points`, `loops`
- `explicit_content`, `rating`, `color`

**Usage Tracking:**
- `play_count`, `skip_count`, `last_played`, `date_added`

**Serato Integration:**
- `serato_id`, `waveform_overview`, `waveform_detail`, `artwork_path`

## 🔌 Pluggable Audio Analysis Architecture

The system uses a **modular, priority-based analysis pipeline** that supports multiple engines:

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Track Scan/Import                                           │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  1. MetadataEngine (Priority: 1, Confidence: 0.7)           │
│     - Extracts BPM/Key from ID3, Vorbis, MP4 tags           │
│     - Supports Camelot, Open Key, Musical notation          │
│     - Fastest (no audio processing)                          │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. AubioEngine (Priority: 2, Confidence: 0.8)              │
│     - BPM detection via Aubio CLI (aubiotrack)              │
│     - Rough energy estimation from onset density            │
│     - Graceful fallback if aubio not installed              │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. AnalysisOrchestrator                                    │
│     - Merges results (higher priority wins)                 │
│     - Flags low confidence (< 0.6) for re-analysis          │
│     - Tracks source attribution (metadata/aubio/manual)     │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Database Storage                                         │
│     - Saves BPM, Key, Energy, Confidence, Source            │
│     - Sets needs_reanalysis flag if confidence < 0.6        │
└─────────────────────────────────────────────────────────────┘
```

### Engine Priorities

| Engine | Priority | BPM | Key | Energy | Confidence |
|--------|----------|-----|-----|--------|------------|
| **MetadataEngine** | 1 | ✅ | ✅ | ❌ | 0.7 |
| **AubioEngine** | 2 | ✅ | ❌ | ⚠️ Rough | 0.8 |
| **Manual Edit** | 10 | ✅ | ✅ | ✅ | 1.0 |
| **EssentiaEngine** (Future) | 3 | ✅ | ✅ | ✅ | 0.95 |

### Installing Aubio (Optional)

**macOS:**

```bash
brew install aubio
```

**Ubuntu/Debian:**

```bash
sudo apt-get install aubio-tools
```

**Windows:**
Download from [aubio.org](https://aubio.org)

**Verify installation:**

```bash
which aubiotrack
aubiotrack --help
```

If Aubio is not installed, the system gracefully falls back to metadata-only analysis.

## 📡 API Documentation

### Core Endpoints

**Library Management:**
- `GET /api/library/tracks` - List all tracks (with pagination, sorting, filtering)
- `GET /api/library/tracks/:id` - Get single track details
- `PUT /api/library/tracks/:id` - Update track metadata
- `DELETE /api/library/tracks/:id` - Delete track
- `POST /api/library/scan` - Scan music library folder

**Batch Operations:**
- `POST /api/batch/update` - Bulk update track metadata
- `POST /api/batch/add-to-crates` - Add multiple tracks to crates

**Smart Crates:**
- `GET /api/crates` - List all crates (static + smart)
- `GET /api/crates/:id` - Get crate details with tracks
- `POST /api/crates` - Create new crate
- `PUT /api/crates/:id` - Update crate criteria
- `DELETE /api/crates/:id` - Delete crate
- `POST /api/crates/:id/refresh` - Manually refresh smart crate

**Playlists:**
- `GET /api/playlists` - List all playlists
- `POST /api/playlists/generate-harmonic` - Generate harmonic playlist with energy curve
- `PUT /api/playlists/:id/reorder` - Reorder tracks
- `DELETE /api/playlists/:id` - Delete playlist

**Search & Recommendations:**
- `GET /api/search` - Advanced search (BPM range, key, era, mood, genre tags)
- `GET /api/search/similar/:id` - Find similar tracks (key compatibility, BPM ±5%)
- `GET /api/search/recommendations` - Get recommended tracks

**Analytics:**
- `GET /api/analytics/overview` - Library statistics (total tracks, genres, eras, avg BPM)
- `POST /api/analytics/log-performance` - Log track play event

**Serato Integration:**
- `POST /api/serato/sync` - Import Serato crates and metadata
- `POST /api/serato/export-crate/:id` - Export crate to Serato format

## 🎵 Features in Detail

### Pluggable Audio Analysis System

**Multi-Engine Pipeline:**
- **MetadataEngine**: Extracts BPM/Key from file tags (ID3, Vorbis, MP4)
- **AubioEngine**: BPM detection via Aubio CLI (`aubiotrack`)
- **Manual Override**: Lock values to prevent auto-reanalysis
- **Future**: EssentiaEngine for high-accuracy ML-based analysis

**Confidence Scoring:**
- 0-1 scale for BPM and Key detection quality
- Tracks with confidence < 0.6 flagged for re-analysis
- Source attribution: `metadata` | `aubio` | `essentia` | `manual`

### Smart Crates with Advanced Filtering

**25+ Pre-Configured Crates:**
- Old Skool (80s-2000s), Nigerian Music (Afrobeat, Highlife, Juju, Fuji)
- Gospel (Essentials, Worship, Praise), Valentine by era (80s-2020s)
- Genre-based, Energy-based, BPM-based, Event-specific

**JSON-Based Criteria Engine:**

```json
{
  "logic": "AND",
  "rules": [
    { "field": "era", "operator": "in", "value": ["80s", "90s"] },
    { "field": "genre_tags", "operator": "contains", "value": "afrobeat" },
    { "field": "bpm", "operator": "range", "value": [100, 120] },
    { "field": "energy_level", "operator": "gte", "value": 4 }
  ]
}
```

**Auto-Refresh:**
Smart crates automatically update when library is scanned.

### Harmonic Playlist Generation

**Camelot Wheel Compatibility:**
- Perfect match (1A→1A): 1.0
- Relative major/minor: 0.9
- Adjacent keys: 0.8
- Perfect fifth (7 steps): 0.7

**Energy Curve Profiles:**
- **Standard**: Buildup → Peak → Cooldown (bell curve)
- **Buildup**: Progressive 1→5 energy
- **Plateau**: Quick ramp, sustained high, quick drop
- **Cooldown**: Progressive 5→1 energy

**Genre-Specific Generators:**
- Valentine playlists by era (80s-2020s)
- Gospel flow (Praise → Worship → High Praise → Altar Call)
- Nigerian party sets (Highlife classics → Afrobeats peak)
- Elder-friendly mixes (80-115 BPM, familiar tracks)

### Batch Operations

**Multi-Select Editing:**
- Update genre, BPM, key, rating, energy, era, mood tags
- Add to multiple crates at once
- Comprehensive genre list with Nigerian music support

### Serato Integration

- Import Serato crates and playlists
- Sync metadata changes bidirectionally
- Export crates to Serato-compatible formats
- Auto-detect Serato library path

## 🇳🇬 Nigerian Music Genres

The system includes comprehensive support for Nigerian music taxonomy:

### Supported Genres

| Genre | Era | Description | BPM Range |
|-------|-----|-------------|-----------|
| **Afrobeat** | 70s-90s | Classic Fela Kuti era, political, jazz-influenced | 100-130 |
| **Afrobeats** | 2010s-2020s | Modern pop fusion (Wizkid, Burna Boy, Davido) | 90-130 |
| **Highlife** | 50s-present | Guitar-driven, melodic, celebratory | 90-120 |
| **Juju** | 60s-present | Talking drum, Yoruba vocals (King Sunny Ade) | 80-110 |
| **Fuji** | 70s-present | Islamic-influenced, percussion-heavy | 90-120 |
| **Apala** | 50s-80s | Traditional Yoruba, slow tempo | 70-90 |
| **Hip-Life** | 90s-2010s | Highlife + Hip Hop fusion (Ghana/Nigeria) | 90-110 |
| **Street-Pop** | 2010s-present | Urban Nigerian pop (Olamide, Portable) | 100-140 |

### Smart Crates for Nigerian Music

- **🎺 Afrobeat Classics** - 70s-90s Fela era
- **🔥 Modern Afrobeats** - 2010s-2020s international hits
- **🎸 Highlife Gold** - All-era Highlife collection
- **🇳🇬 Nigerian Old Skool** - 70s-90s multi-genre
- **🎉 Nigerian Elder-Friendly** - 80-120 BPM, familiar tracks

### Tagging Best Practices

Use `genre_tags` (JSON array) for multi-genre tracks:

```json
{
  "title": "Water No Get Enemy",
  "artist": "Fela Kuti",
  "genre_tags": ["afrobeat", "jazz", "world"],
  "era": "70s",
  "bpm": 125
}
```

## 🎛️ Advanced Features

### Camelot Wheel Key Notation

All keys are stored in **Camelot notation** (1A-12B) for easy harmonic mixing:

| Camelot | Musical | Notes |
|---------|---------|-------|
| **1A** | G# minor / Ab minor | - |
| **1B** | B major | Perfect match with 1A (relative major/minor) |
| **2A** | D# minor / Eb minor | Adjacent to 1A (+1 step) |
| **8A** | A minor | Compatible with 7A, 9A, 8B |
| **8B** | C major | Relative major of 8A |

**Mixing Rules:**
- Same number (e.g., 5A → 5B): Perfect match
- ±1 number (e.g., 5A → 4A or 6A): Smooth transition
- +7 steps (e.g., 1A → 8A): Perfect fifth (energy boost)

### Confidence-Based Re-Analysis

Low-confidence tracks (< 0.6) are automatically flagged:

```sql
SELECT * FROM tracks WHERE needs_reanalysis = 1;
```

**Workflow:**
1. Initial scan uses MetadataEngine + AubioEngine
2. Low-confidence tracks flagged
3. Install Essentia (future) for high-accuracy re-analysis
4. Manual override always takes priority (confidence = 1.0)

### Energy Curve Visualization

Playlists are generated with energy curves:

```
Energy
  5 ┤                   ╭──╮
  4 ┤               ╭───╯  ╰───╮
  3 ┤           ╭───╯          ╰───╮
  2 ┤       ╭───╯                  ╰───╮
  1 ┤───────╯                          ╰──────
    └────────────────────────────────────────> Time
    Warm-up  Building  Peak  Sustain  Cool-down
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

**Areas for contribution:**
- Essentia integration (Python microservice)
- Additional smart crate presets
- UI improvements (Track Inspector, Harmonic Mixing View)
- Export formats (Rekordbox XML, Traktor NML)
- Performance optimizations for 100k+ track libraries

## License

ISC

## Acknowledgments

- **Aubio** - Real-time audio analysis library
- **music-metadata** - Universal metadata parser
- **Serato** - DJ software integration
- **Camelot Wheel** - Mixed In Key notation system
- Nigerian music pioneers: Fela Kuti, King Sunny Ade, Chief Ebenezer Obey, and modern Afrobeats artists

## 🛠️ Troubleshooting

### macOS Port 5000 Conflict (AirPlay Receiver)

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
or backend server starts then immediately exits with no error.

**Cause:** macOS AirPlay Receiver uses port 5000 by default (ControlCenter process).

**Solution:** Disable AirPlay Receiver in System Settings:

1. Open **System Settings** (or System Preferences on older macOS)
2. Navigate to **General → AirDrop & Handoff**
3. Turn **OFF** "AirPlay Receiver"
4. Restart the application

**Verification:**
```bash
# Check if port 5000 is in use
lsof -i :5000

# Should show nothing after disabling AirPlay Receiver
```

**Alternative:** Change backend port in `backend/.env`:
```env
PORT=5001
```
Then update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001
```
And `electron/main.js` PORT variable, and `package.json` wait-on URLs.

### File Table Overflow (ENFILE Error)

**Symptom:**
```
Error: ENFILE: file table overflow, watch '/Users/you/Music'
chokidar Error: ENFILE: file table overflow
```

**Cause:** Your music library has too many files (10,000+), exceeding macOS default file descriptor limit (256).

**Solution:** Disable file watching in `backend/.env`:

```env
WATCH_ENABLED=false
```

Then use manual "Scan Library" button instead of automatic monitoring.

**Alternative:** Increase file descriptor limit (temporary):

```bash
ulimit -n 10000
```

### process.env is not defined (Vite Error)

**Symptom:**
```
Uncaught ReferenceError: process is not defined
```

**Cause:** Vite doesn't polyfill Node.js globals like `process`.

**Solution:** Already fixed - we use `import.meta.env.VITE_*` instead of `process.env.REACT_APP_*`

Ensure `frontend/.env` has:

```env
VITE_API_URL=http://localhost:5000/api
```

### pnpm install issues

If you encounter issues with `pnpm install`:

```bash
# Clear cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
pnpm install
```

### Aubio not found

**Symptom:** Console shows "Aubio not found" warning

**Fix:** Install Aubio (optional):

```bash
# macOS
brew install aubio

# Ubuntu/Debian
sudo apt-get install aubio-tools
```

If you don't install Aubio, the system will use metadata-only analysis (still works fine).

### Database corruption

If the database becomes corrupted:

```bash
cd backend
rm database/library.db database/library.db-shm database/library.db-wal
```

The application will recreate it on next startup.

### Port conflicts

If port 5000 (backend) or 3000 (frontend) is in use:

**Backend:** Change `PORT` in `backend/.env`

**Frontend:** Vite will auto-increment to next available port (5173, 5174, etc.)

### Large library performance

For libraries with 50,000+ tracks:

1. **Disable file watching** (already recommended above)
2. **Use pagination** - The UI automatically paginates large libraries
3. **Add indexes** - Already included in schema for `bpm`, `era`, `genre_tags`
4. **Batch operations** - Use batch edit instead of updating tracks one-by-one

## Acknowledgments

- Built with modern web technologies
- Inspired by professional DJ software
- Community-driven development
