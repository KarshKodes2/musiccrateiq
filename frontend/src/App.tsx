// frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Feature Pages
import LibraryPage from './features/library/LibraryPage';
import CratesPage from './features/crates/CratesPage';
import PlaylistsPage from './features/playlists/PlaylistsPage';
import SearchPage from './features/search/SearchPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import { SettingsPage } from './features/settings';
import { HelpPage } from './features/help';

// Audio Player
import AudioPlayer from './features/audio/AudioPlayer';

function App() {

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Application Layout */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎵 DJ Library Manager
              </h1>
              <nav className="flex gap-4">
                <a href="/" className="text-sm font-medium hover:text-primary">
                  Library
                </a>
                <a href="/crates" className="text-sm font-medium hover:text-primary">
                  Crates
                </a>
                <a href="/playlists" className="text-sm font-medium hover:text-primary">
                  Playlists
                </a>
                <a href="/search" className="text-sm font-medium hover:text-primary">
                  Search
                </a>
                <a href="/analytics" className="text-sm font-medium hover:text-primary">
                  Analytics
                </a>
                <a href="/settings" className="text-sm font-medium hover:text-primary">
                  ⚙️ Settings
                </a>
                <a href="/help" className="text-sm font-medium hover:text-primary">
                  ❓ Help
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<LibraryPage />} />
              <Route path="/crates" element={<CratesPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* Audio Player (Fixed Bottom) */}
        <div className="border-t border-border bg-card">
          <AudioPlayer />
        </div>
      </div>
    </div>
  );
}

export default App;
