// frontend/src/features/settings/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Settings {
  musicLibraryPath?: string;
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      // Use Electron IPC to open folder dialog
      if (window.electron?.selectFolder) {
        const result = await window.electron.selectFolder();
        if (result && !result.canceled && result.filePaths.length > 0) {
          const path = result.filePaths[0];
          await saveSettings('musicLibraryPath', path);
        }
      } else {
        // Fallback for web version - use input
        const input = document.createElement('input');
        input.type = 'text';
        input.value = settings.musicLibraryPath || '';
        input.placeholder = 'Enter music library path';

        const path = prompt('Enter music library path:', settings.musicLibraryPath || '');
        if (path) {
          await saveSettings('musicLibraryPath', path);
        }
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      setMessage({ type: 'error', text: 'Failed to select folder' });
    }
  };

  const saveSettings = async (key: string, value: string) => {
    setSaving(true);
    try {
      await api.put(`/settings/${key}`, { value });
      setSettings({ ...settings, [key]: value });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartScan = async () => {
    if (!settings.musicLibraryPath) {
      setMessage({ type: 'error', text: 'Please select a music library path first' });
      return;
    }

    try {
      setSaving(true);
      await api.post('/settings/music-library/scan');
      setMessage({ type: 'success', text: 'Library scan started!' });
    } catch (error) {
      console.error('Error starting scan:', error);
      setMessage({ type: 'error', text: 'Failed to start library scan' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Music Library Path */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Music Library</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Music Library Path
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.musicLibraryPath || ''}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              placeholder="No path selected"
            />
            <button
              onClick={handleSelectFolder}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Browse...
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Select the folder where your music files are stored
          </p>
        </div>

        {settings.musicLibraryPath && (
          <button
            onClick={handleStartScan}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving ? 'Scanning...' : 'Scan Library'}
          </button>
        )}
      </div>

      {/* Port Configuration Reference */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Port Configuration</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Frontend:</span>
            <span className="font-mono">http://localhost:3000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Backend API:</span>
            <span className="font-mono">http://localhost:5000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">WebSocket:</span>
            <span className="font-mono">ws://localhost:5000</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Port configuration is managed in <code className="bg-gray-200 px-1 rounded">.env.ports</code>
        </p>
      </div>
    </div>
  );
};
