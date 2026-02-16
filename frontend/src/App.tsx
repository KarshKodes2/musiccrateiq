// frontend/src/App.tsx
import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { updateScanProgress, scanCompleted, fetchTracks } from './store/slices/librarySlice';
import { libraryAPI } from './services/api';

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

// Global Scan Progress Indicator
function ScanProgressIndicator() {
  const { isScanning, scanProgress } = useSelector((state: RootState) => state.library);

  if (!isScanning) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs font-medium text-primary">
        Scanning... {Math.round(scanProgress)}%
      </span>
      <div className="w-24 h-1.5 bg-primary/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${scanProgress}%` }}
        />
      </div>
    </div>
  );
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { isScanning } = useSelector((state: RootState) => state.library);

  // Check scan status on mount and start polling if scan is in progress
  useEffect(() => {
    const checkAndPollScanStatus = async () => {
      try {
        const progress = await libraryAPI.getScanProgress();
        if (progress?.isScanning) {
          dispatch(updateScanProgress(progress));

          // Start polling if not already polling
          if (!pollingRef.current) {
            const poll = () => {
              libraryAPI.getScanProgress()
                .then((res) => {
                  if (res) {
                    dispatch(updateScanProgress(res));
                    if (res.isScanning) {
                      pollingRef.current = setTimeout(poll, 1000);
                    } else {
                      dispatch(scanCompleted());
                      dispatch(fetchTracks({}));
                      pollingRef.current = null;
                    }
                  }
                })
                .catch((err) => {
                  console.error('Scan poll error:', err);
                  pollingRef.current = setTimeout(poll, 2000);
                });
            };
            pollingRef.current = setTimeout(poll, 1000);
          }
        }
      } catch (err) {
        // Backend not available yet, ignore
      }
    };

    checkAndPollScanStatus();

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [dispatch]);

  // Also restart polling when isScanning becomes true (from user action)
  useEffect(() => {
    if (isScanning && !pollingRef.current) {
      const poll = () => {
        libraryAPI.getScanProgress()
          .then((res) => {
            if (res) {
              dispatch(updateScanProgress(res));
              if (res.isScanning) {
                pollingRef.current = setTimeout(poll, 1000);
              } else {
                dispatch(scanCompleted());
                dispatch(fetchTracks({}));
                pollingRef.current = null;
              }
            }
          })
          .catch((err) => {
            console.error('Scan poll error:', err);
            pollingRef.current = setTimeout(poll, 2000);
          });
      };
      pollingRef.current = setTimeout(poll, 1000);
    }

    return () => {
      if (!isScanning && pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isScanning, dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Application Layout */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎵 DJ Library Manager
                </h1>
                <ScanProgressIndicator />
              </div>
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
