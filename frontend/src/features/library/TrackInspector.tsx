// frontend/src/features/library/TrackInspector.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  year?: number;
  bpm?: number;
  key_signature?: string;
  energy_level?: number;
  rating?: number;
  era?: string;
  genre_tags?: string[];
  mood_tags?: string[];
  bpm_confidence?: number;
  key_confidence?: number;
  bpm_source?: string;
  key_source?: string;
  danceability?: number;
  valence?: number;
  explicit_content?: number;
  duration?: number;
  file_path?: string;
}

interface TrackInspectorProps {
  trackId: number;
  onClose?: () => void;
  onUpdate?: (track: Track) => void;
}

export const TrackInspector: React.FC<TrackInspectorProps> = ({
  trackId,
  onClose,
  onUpdate,
}) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editedTrack, setEditedTrack] = useState<Partial<Track>>({});

  const eraOptions = ['70s', '80s', '90s', '2000s', '2010s', '2020s'];
  const keyOptions = [
    '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
    '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B',
    '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B'
  ];

  const genreOptions = [
    'Afrobeat', 'Afrobeats', 'Highlife', 'Juju', 'Fuji', 'Apala',
    'Hip-Life', 'Street-Pop', 'Gospel', 'Hip Hop', 'R&B', 'Pop',
    'House', 'Techno', 'EDM', 'Rock', 'Jazz', 'Soul', 'Funk',
    'Reggae', 'Dancehall', 'Soca', 'Amapiano', 'Gqom'
  ];

  const moodOptions = [
    'romantic', 'love', 'energetic', 'peaceful', 'worship', 'praise',
    'celebration', 'joy', 'melancholic', 'uplifting', 'chill', 'party'
  ];

  useEffect(() => {
    loadTrack();
  }, [trackId]);

  const loadTrack = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/library/tracks/${trackId}`);
      const trackData = response.data;

      // Parse JSON fields
      if (typeof trackData.genre_tags === 'string') {
        trackData.genre_tags = JSON.parse(trackData.genre_tags || '[]');
      }
      if (typeof trackData.mood_tags === 'string') {
        trackData.mood_tags = JSON.parse(trackData.mood_tags || '[]');
      }

      setTrack(trackData);
      setEditedTrack({});
      setError(null);
    } catch (err) {
      console.error('Error loading track:', err);
      setError('Failed to load track');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!track) return;

    try {
      setSaving(true);
      const updates = {
        ...editedTrack,
        // Ensure arrays are stringified
        genre_tags: editedTrack.genre_tags ? JSON.stringify(editedTrack.genre_tags) : undefined,
        mood_tags: editedTrack.mood_tags ? JSON.stringify(editedTrack.mood_tags) : undefined,
      };

      const response = await api.put(`/library/tracks/${trackId}`, updates);
      const updatedTrack = response.data;

      // Parse JSON fields
      if (typeof updatedTrack.genre_tags === 'string') {
        updatedTrack.genre_tags = JSON.parse(updatedTrack.genre_tags || '[]');
      }
      if (typeof updatedTrack.mood_tags === 'string') {
        updatedTrack.mood_tags = JSON.parse(updatedTrack.mood_tags || '[]');
      }

      setTrack(updatedTrack);
      setEditedTrack({});
      setError(null);

      if (onUpdate) {
        onUpdate(updatedTrack);
      }
    } catch (err: any) {
      console.error('Error saving track:', err);
      setError(err.response?.data?.error || 'Failed to save track');
    } finally {
      setSaving(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);
      await api.post(`/library/analyze/${trackId}`);
      await loadTrack();
      setError(null);
    } catch (err) {
      console.error('Error re-analyzing track:', err);
      setError('Failed to re-analyze track');
    } finally {
      setReanalyzing(false);
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (confidence === undefined || confidence === null) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Unknown</span>;
    }
    if (confidence >= 0.8) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">🟢 High ({(confidence * 100).toFixed(0)}%)</span>;
    }
    if (confidence >= 0.6) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">🟡 Medium ({(confidence * 100).toFixed(0)}%)</span>;
    }
    return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">🔴 Low ({(confidence * 100).toFixed(0)}%)</span>;
  };

  const getFieldValue = (field: keyof Track) => {
    return editedTrack[field] !== undefined ? editedTrack[field] : track?.[field];
  };

  const setFieldValue = (field: keyof Track, value: any) => {
    setEditedTrack({ ...editedTrack, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading track...</div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center text-red-600">Track not found</div>
      </div>
    );
  }

  const hasChanges = Object.keys(editedTrack).length > 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Track Inspector</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:bg-gray-100"
          >
            {reanalyzing ? 'Re-analyzing...' : '🔄 Re-analyze'}
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <div className="px-3 py-2 bg-gray-50 rounded text-sm">{track.title}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
              <div className="px-3 py-2 bg-gray-50 rounded text-sm">{track.artist}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
              <div className="px-3 py-2 bg-gray-50 rounded text-sm">{track.album || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Path</label>
              <div className="px-3 py-2 bg-gray-50 rounded text-xs font-mono truncate">{track.file_path || '-'}</div>
            </div>
          </div>
        </div>

        {/* Audio Analysis */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Audio Analysis</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BPM
                <span className="ml-2">{getConfidenceBadge(track.bpm_confidence)}</span>
                {track.bpm_source && (
                  <span className="ml-2 text-xs text-gray-500">Source: {track.bpm_source}</span>
                )}
              </label>
              <input
                type="number"
                value={getFieldValue('bpm') || ''}
                onChange={(e) => setFieldValue('bpm', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key (Camelot)
                <span className="ml-2">{getConfidenceBadge(track.key_confidence)}</span>
                {track.key_source && (
                  <span className="ml-2 text-xs text-gray-500">Source: {track.key_source}</span>
                )}
              </label>
              <select
                value={getFieldValue('key_signature') || ''}
                onChange={(e) => setFieldValue('key_signature', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select key...</option>
                {keyOptions.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Energy Level (1-5)
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={getFieldValue('energy_level') || 3}
                  onChange={(e) => setFieldValue('energy_level', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold">
                  {getFieldValue('energy_level') || 3}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {'⚡'.repeat(getFieldValue('energy_level') || 3)}
              </div>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Classification</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Era</label>
              <select
                value={getFieldValue('era') || ''}
                onChange={(e) => setFieldValue('era', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select era...</option>
                {eraOptions.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre Tags</label>
              <select
                multiple
                value={getFieldValue('genre_tags') as string[] || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFieldValue('genre_tags', selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                size={8}
              >
                {genreOptions.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood Tags</label>
              <select
                multiple
                value={getFieldValue('mood_tags') as string[] || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFieldValue('mood_tags', selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                size={6}
              >
                {moodOptions.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
        </div>

        {/* Rating & Other */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Rating & Metadata</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-5 stars)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFieldValue('rating', star)}
                    className={`text-2xl ${
                      (getFieldValue('rating') || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={getFieldValue('year') || ''}
                onChange={(e) => setFieldValue('year', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Explicit Content</label>
              <select
                value={getFieldValue('explicit_content') || 0}
                onChange={(e) => setFieldValue('explicit_content', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Clean</option>
                <option value={1}>Explicit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Audio Features */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Advanced Audio Features</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Danceability:</span>
              <span className="ml-2 font-medium">{track.danceability?.toFixed(2) || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600">Valence:</span>
              <span className="ml-2 font-medium">{track.valence?.toFixed(2) || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">
                {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
