# DJ Library Manager - Startup Guide

## 🎯 Quick Start

### Prerequisites

**IMPORTANT: Port 5000 Conflict**
macOS AirPlay Receiver uses port 5000 by default. You must disable it:

1. Open **System Settings**
2. Go to **General → AirDrop & Handoff**
3. Turn OFF **"AirPlay Receiver"**

### Start the Application

```bash
cd /Users/spoxio/Desktop/project-base/personal/dj-library-manager
pnpm dev
```

This will:
- Start backend on **http://localhost:5000**
- Start frontend on **http://localhost:3000**
- Launch Electron desktop window

---

## 📂 Setting Up Your Music Library

### Step 1: Configure Music Library Path

1. Click **⚙️ Settings** in the top navigation
2. Click **Browse...** to select your music folder
3. Choose your music directory (currently: `/Users/spoxio/Music/Music/MUSIC LIBRARY`)
4. Click **Scan Library** to analyze your music files

### Step 2: Wait for Scan

The scanner will:
- Discover all audio files (.mp3, .wav, .flac, .m4a, etc.)
- Extract metadata (title, artist, album, etc.)
- Analyze audio properties (BPM, key, energy)
- Import Serato crates (if found)

---

## ⚙️ Port Configuration

All ports are centralized in `.env.ports`:

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 5000 | http://localhost:5000/api |
| WebSocket | 5000 | ws://localhost:5000 |

### Changing Ports

Edit `.env.ports`, then update:
- `backend/.env` → `PORT=5000`
- `backend/.env` → `CORS_ORIGIN=http://localhost:3000`
- `frontend/.env` → `VITE_API_URL=http://localhost:5000`
- `package.json` → `wait-on` URLs
- `electron/main.js` → `PORT` variable

---

## 🗂️ File Structure

```
dj-library-manager/
├── .env.ports              # Central port configuration
├── backend/
│   ├── .env                # Backend configuration
│   ├── database/           # SQLite database
│   └── src/
│       ├── routes/         # API endpoints
│       │   └── settings.ts # Settings API ✨ NEW
│       └── services/       # Business logic
├── frontend/
│   ├── .env                # Frontend configuration
│   └── src/
│       ├── features/
│       │   └── settings/   # Settings page ✨ NEW
│       └── types/          # TypeScript types
└── electron/
    ├── main.js             # Electron main process
    └── preload.js          # IPC bridge
```

---

## 🔧 Features

### ✅ Implemented
- ✓ Music library scanning
- ✓ Serato crate import
- ✓ Smart crates (27+ pre-configured)
- ✓ Harmonic playlist generation
- ✓ BPM/key/energy detection
- ✓ Settings page with folder picker ✨ NEW
- ✓ Centralized port management ✨ NEW

### 📋 Planned (from plan file)
- Old Skool crates (80s-2000s, Nigerian, Gospel)
- Valentine playlists by era
- Enhanced audio analysis (Aubio/Essentia)
- Track Inspector UI
- Smart Crate Builder UI
- CSV/Rekordbox XML export

---

## 🐛 Troubleshooting

### Port 5000 Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:** Disable macOS AirPlay Receiver (see Prerequisites)

### CORS Errors
**Error:** `Access-Control-Allow-Origin header mismatch`

**Solution:** Check `backend/.env` CORS_ORIGIN matches frontend port

### Database Not Initialized
**Error:** `Database not initialized`

**Solution:** Backend restarted successfully - issue is now fixed ✓

### Settings Page Not Loading Music Path
**Solution:**
1. Go to Settings page
2. Click "Browse..." to select folder
3. Path will be saved to database
4. Use "Scan Library" to analyze files

---

## 📞 Support

- GitHub Issues: `https://github.com/anthropics/claude-code/issues`
- Documentation: Check `IMPLEMENTATION_SUMMARY.md`
- Plan File: See `.claude/plans/indexed-spinning-eclipse.md`

---

**Ready to go! Happy DJing! 🎧**
