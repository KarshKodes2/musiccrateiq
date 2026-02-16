// frontend/src/features/help/HelpPage.tsx
import React, { useState } from 'react';

export const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'settings', title: 'Settings & Configuration', icon: '⚙️' },
    { id: 'smart-crates', title: 'Smart Crates', icon: '📦' },
    { id: 'playlists', title: 'Playlists', icon: '🎵' },
    { id: 'audio-analysis', title: 'Audio Analysis', icon: '🔊' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🛠️' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Help & Documentation</h2>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {activeSection === 'getting-started' && <GettingStartedSection />}
          {activeSection === 'settings' && <SettingsSection />}
          {activeSection === 'smart-crates' && <SmartCratesSection />}
          {activeSection === 'playlists' && <PlaylistsSection />}
          {activeSection === 'audio-analysis' && <AudioAnalysisSection />}
          {activeSection === 'troubleshooting' && <TroubleshootingSection />}
        </div>
      </div>
    </div>
  );
};

const GettingStartedSection: React.FC = () => (
  <div className="prose max-w-none">
    <h1>🚀 Getting Started</h1>

    <h2>Quick Start</h2>
    <ol>
      <li>Click <strong>⚙️ Settings</strong> in the navigation</li>
      <li>Click <strong>Browse...</strong> to select your music folder</li>
      <li>Click <strong>Scan Library</strong> to analyze your music files</li>
      <li>Wait for the scan to complete</li>
      <li>Browse your library in the <strong>Library</strong> tab</li>
    </ol>

    <h2>Key Features</h2>
    <ul>
      <li><strong>Smart Crates</strong> - Auto-organizing collections based on genre, era, BPM, energy</li>
      <li><strong>Harmonic Mixing</strong> - Generate playlists with smooth key transitions</li>
      <li><strong>Audio Analysis</strong> - Automatic BPM, key, and energy detection</li>
      <li><strong>Batch Editing</strong> - Update multiple tracks at once</li>
      <li><strong>Serato Integration</strong> - Import/export Serato crates</li>
    </ul>

    <h2>Supported Audio Formats</h2>
    <p>The application supports all common audio formats:</p>
    <ul>
      <li>MP3 (.mp3)</li>
      <li>WAV (.wav)</li>
      <li>FLAC (.flac)</li>
      <li>M4A/AAC (.m4a)</li>
      <li>OGG Vorbis (.ogg)</li>
      <li>AIFF (.aiff, .aif)</li>
    </ul>
  </div>
);

const SettingsSection: React.FC = () => (
  <div className="prose max-w-none">
    <h1>⚙️ Settings & Configuration</h1>

    <h2>Music Library Path</h2>
    <p>Configure where your music files are stored:</p>
    <ol>
      <li>Navigate to <strong>Settings</strong></li>
      <li>Click <strong>Browse...</strong> next to "Music Library Path"</li>
      <li>Select your music folder (e.g., <code>/Users/you/Music/Music Library</code>)</li>
      <li>The path is automatically saved to the database</li>
      <li>Click <strong>Scan Library</strong> to analyze files</li>
    </ol>

    <h2>Port Configuration</h2>
    <p>The application uses the following ports:</p>
    <table className="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">Service</th>
          <th className="border border-gray-300 px-4 py-2">Port</th>
          <th className="border border-gray-300 px-4 py-2">URL</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Frontend</td>
          <td className="border border-gray-300 px-4 py-2">3000</td>
          <td className="border border-gray-300 px-4 py-2">http://localhost:3000</td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Backend</td>
          <td className="border border-gray-300 px-4 py-2">5000</td>
          <td className="border border-gray-300 px-4 py-2">http://localhost:5000</td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">WebSocket</td>
          <td className="border border-gray-300 px-4 py-2">5000</td>
          <td className="border border-gray-300 px-4 py-2">ws://localhost:5000</td>
        </tr>
      </tbody>
    </table>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h3 className="text-yellow-800 font-semibold">⚠️ macOS Users: Port 5000 Conflict</h3>
      <p className="text-yellow-700 mb-2">
        macOS AirPlay Receiver uses port 5000 by default. You must disable it:
      </p>
      <ol className="text-yellow-700">
        <li>Open <strong>System Settings</strong></li>
        <li>Go to <strong>General → AirDrop & Handoff</strong></li>
        <li>Turn <strong>OFF</strong> "AirPlay Receiver"</li>
        <li>Restart the application</li>
      </ol>
    </div>
  </div>
);

const SmartCratesSection: React.FC = () => (
  <div className="prose max-w-none">
    <h1>📦 Smart Crates</h1>

    <h2>What are Smart Crates?</h2>
    <p>
      Smart Crates are auto-updating collections that organize your music based on criteria like
      genre, BPM, energy level, era, and mood. They automatically refresh when you scan your library.
    </p>

    <h2>Pre-Configured Crates</h2>

    <h3>Old Skool Collections</h3>
    <ul>
      <li>🌍 <strong>Old Skool International</strong> - 80s-2000s hits</li>
      <li>🏆 <strong>Old-Skool Gold</strong> - Rated 3+ tracks from 80s-2000s</li>
      <li>👴 <strong>Old Skool → Modern Blend</strong> - Elder-friendly, ≤120 BPM</li>
    </ul>

    <h3>Nigerian Music</h3>
    <ul>
      <li>🎺 <strong>Afrobeat Classics</strong> - Fela Kuti era (70s-90s)</li>
      <li>🎸 <strong>Highlife Gold</strong> - All-era Highlife</li>
      <li>🔥 <strong>Modern Afrobeats</strong> - 2010s-2020s international hits</li>
      <li>🇳🇬 <strong>Nigerian Old Skool Hits</strong> - 70s-90s multi-genre</li>
      <li>🎉 <strong>Nigerian Elder-Friendly Party</strong> - 80-120 BPM classics</li>
    </ul>

    <h3>Gospel Collections</h3>
    <ul>
      <li>✝️ <strong>Gospel Essentials</strong> - All gospel tracks</li>
      <li>🙏 <strong>Slow Praise (Worship)</strong> - ≤90 BPM worship songs</li>
      <li>🎤 <strong>High-Energy Worship</strong> - Energy level 4+</li>
    </ul>

    <h3>Valentine Playlists by Era</h3>
    <ul>
      <li>💜 <strong>80s Valentine</strong></li>
      <li>💙 <strong>90s Valentine</strong></li>
      <li>💚 <strong>2000s Valentine</strong></li>
      <li>💛 <strong>2010s Valentine</strong></li>
      <li>❤️ <strong>2020s Valentine</strong></li>
    </ul>

    <h2>Creating Custom Smart Crates</h2>
    <p>Navigate to <strong>Crates</strong> and click <strong>+ New Smart Crate</strong>:</p>
    <ol>
      <li>Choose criteria: BPM range, key, era, genre tags, mood tags, energy level</li>
      <li>Combine rules with AND/OR logic</li>
      <li>Preview matching tracks</li>
      <li>Save and the crate will auto-update</li>
    </ol>
  </div>
);

const PlaylistsSection: React.FC = () => (
  <div className="prose max-w-none">
    <h1>🎵 Playlists & Harmonic Mixing</h1>

    <h2>Harmonic Playlist Generation</h2>
    <p>
      Create DJ sets with smooth key transitions using the Camelot Wheel notation system.
    </p>

    <h3>Camelot Wheel Basics</h3>
    <ul>
      <li><strong>Same number (e.g., 5A → 5B)</strong> - Perfect match (relative major/minor)</li>
      <li><strong>±1 number (e.g., 5A → 4A or 6A)</strong> - Smooth transition</li>
      <li><strong>+7 steps (e.g., 1A → 8A)</strong> - Perfect fifth (energy boost)</li>
    </ul>

    <h3>Energy Curve Profiles</h3>
    <ul>
      <li><strong>Standard</strong> - Buildup → Peak → Cooldown (bell curve)</li>
      <li><strong>Buildup</strong> - Progressive 1→5 energy increase</li>
      <li><strong>Plateau</strong> - Quick ramp, sustained high energy, quick drop</li>
      <li><strong>Cooldown</strong> - Progressive 5→1 energy decrease</li>
    </ul>

    <h2>Genre-Specific Generators</h2>
    <ul>
      <li><strong>Valentine by Era</strong> - Romantic sets for 80s-2020s</li>
      <li><strong>Gospel Flow</strong> - Praise → Worship → High Praise → Altar Call</li>
      <li><strong>Nigerian Party</strong> - Highlife classics → Afrobeats peak</li>
      <li><strong>Elder-Friendly</strong> - 80-115 BPM, familiar tracks</li>
    </ul>

    <h2>Creating a Playlist</h2>
    <ol>
      <li>Navigate to <strong>Playlists</strong></li>
      <li>Click <strong>Generate Harmonic Playlist</strong></li>
      <li>Choose energy curve profile</li>
      <li>Select genre/mood preferences</li>
      <li>Set target duration</li>
      <li>Review and save</li>
    </ol>
  </div>
);

const AudioAnalysisSection: React.FC = () => (
  <div className="prose max-w-none">
    <h1>🔊 Audio Analysis</h1>

    <h2>Multi-Engine Analysis Pipeline</h2>
    <p>The system uses a pluggable architecture with multiple analysis engines:</p>

    <h3>1. MetadataEngine (Priority 1)</h3>
    <ul>
      <li>Extracts BPM/Key from ID3, Vorbis, MP4 tags</li>
      <li>Fastest method (no audio processing)</li>
      <li>Confidence: 0.7</li>
    </ul>

    <h3>2. AubioEngine (Priority 2)</h3>
    <ul>
      <li>BPM detection via Aubio CLI</li>
      <li>Rough energy estimation</li>
      <li>Confidence: 0.8</li>
      <li>Install: <code>brew install aubio</code> (macOS)</li>
    </ul>

    <h3>3. Manual Override (Priority 10)</h3>
    <ul>
      <li>Lock values to prevent auto-reanalysis</li>
      <li>Confidence: 1.0</li>
    </ul>

    <h2>Confidence Scoring</h2>
    <p>Each analysis result includes a confidence score (0-1):</p>
    <ul>
      <li><strong>High (≥0.8)</strong> - Reliable, no re-analysis needed</li>
      <li><strong>Medium (0.6-0.8)</strong> - Acceptable quality</li>
      <li><strong>Low (&lt;0.6)</strong> - Flagged for re-analysis</li>
    </ul>

    <h2>Re-Analyzing Tracks</h2>
    <ol>
      <li>Open Track Inspector panel</li>
      <li>Check confidence badges (🟢 green = good, 🟡 yellow = medium, 🔴 red = low)</li>
      <li>Click <strong>Re-analyze</strong> button</li>
      <li>System will use higher-priority engines</li>
    </ol>

    <h2>Era Detection</h2>
    <p>Tracks are automatically classified into decades:</p>
    <ul>
      <li>70s, 80s, 90s, 2000s, 2010s, 2020s</li>
      <li>Based on year metadata field</li>
      <li>Used for Valentine and Old Skool crates</li>
    </ul>
  </div>
);

const TroubleshootingSection: React.FC = () => (
  <div className="prose max-w-none">
    <h1>🛠️ Troubleshooting</h1>

    <h2>macOS Port 5000 Conflict (AirPlay Receiver)</h2>
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-red-800 font-semibold">Symptom</h3>
      <pre className="bg-red-100 p-2 rounded text-sm">
        Error: listen EADDRINUSE: address already in use :::5000
      </pre>
      <p className="text-red-700">or backend server starts then immediately exits.</p>

      <h3 className="text-red-800 font-semibold mt-4">Solution</h3>
      <ol className="text-red-700">
        <li>Open <strong>System Settings</strong></li>
        <li>Go to <strong>General → AirDrop & Handoff</strong></li>
        <li>Turn <strong>OFF</strong> "AirPlay Receiver"</li>
        <li>Restart the application</li>
      </ol>
    </div>

    <h2>File Table Overflow (ENFILE Error)</h2>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="text-yellow-800 font-semibold">Symptom</h3>
      <pre className="bg-yellow-100 p-2 rounded text-sm">
        Error: ENFILE: file table overflow, watch '/Users/you/Music'
      </pre>

      <h3 className="text-yellow-800 font-semibold mt-4">Solution</h3>
      <p className="text-yellow-700">
        Your music library has too many files (10,000+). Disable file watching in <code>backend/.env</code>:
      </p>
      <pre className="bg-yellow-100 p-2 rounded text-sm">
        WATCH_ENABLED=false
      </pre>
      <p className="text-yellow-700">Then use manual "Scan Library" button instead.</p>
    </div>

    <h2>Database Not Initialized</h2>
    <p>
      If you see "Database not initialized" errors, the backend DatabaseService wasn't properly initialized.
      This has been fixed in the latest version.
    </p>

    <h2>CORS Errors</h2>
    <p>If you see CORS errors in the browser console:</p>
    <ol>
      <li>Check <code>backend/.env</code> has <code>CORS_ORIGIN=http://localhost:3000</code></li>
      <li>Verify frontend is running on port 3000</li>
      <li>Clear browser cache and restart both servers</li>
    </ol>

    <h2>Aubio Not Found</h2>
    <p>If you see "Aubio not found" warnings:</p>
    <pre className="bg-gray-100 p-2 rounded text-sm">
      # macOS
      brew install aubio

      # Ubuntu/Debian
      sudo apt-get install aubio-tools
    </pre>
    <p>The system will use metadata-only analysis if Aubio is not installed.</p>

    <h2>Large Library Performance</h2>
    <p>For libraries with 50,000+ tracks:</p>
    <ul>
      <li>Disable file watching (WATCH_ENABLED=false)</li>
      <li>Use pagination in the UI</li>
      <li>Use batch operations instead of updating tracks one-by-one</li>
      <li>Consider adding database indexes (already included)</li>
    </ul>

    <h2>Getting More Help</h2>
    <ul>
      <li>Check <code>STARTUP-GUIDE.md</code> in the project root</li>
      <li>Review <code>README.md</code> for detailed documentation</li>
      <li>Check <code>IMPLEMENTATION_SUMMARY.md</code> for technical details</li>
      <li>Report issues on GitHub</li>
    </ul>
  </div>
);
